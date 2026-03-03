import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../database/daos/sync_queue_dao.dart';
import '../database/models/sync_queue_model.dart';
import '../database/daos/sync_conflict_dao.dart';
import '../database/models/sync_conflict_model.dart';
import '../database/daos/sprint_task_dao.dart';
import '../database/daos/sprint_dao.dart';
import '../database/daos/schedule_dao.dart';
import '../database/daos/id_map_dao.dart';
import '../database/daos/sync_metadata_dao.dart';
import '../database/models/sprint_task_model.dart';
import '../database/models/sprint_model.dart';
import '../database/models/schedule_model.dart';
import '../database/models/id_map_model.dart';
import '../database/models/sync_metadata_model.dart';
import 'network_service.dart';
import 'token_validator.dart';
import '../backend/api_requests/api_calls.dart';
import '../backend/api_requests/api_manager.dart';
import '/core/models/uploaded_file.dart';
import '../auth/custom_auth/auth_util.dart';
import 'sync_log_helper.dart';

enum SyncServiceStatus {
  idle,
  syncing,
  completed,
  failed,
}

enum SyncUserMessageType {
  savedOffline,
  syncError,
}

class SyncUserMessage {
  final SyncUserMessageType type;
  final String message;

  const SyncUserMessage({
    required this.type,
    required this.message,
  });
}

class SyncAttemptResult {
  final bool success;
  final bool alreadyProcessed;
  final bool isRecoverable;
  final bool isFatal;
  final bool isConflict;
  final int? statusCode;
  final String? errorMessage;
  final String? serverPayload;
  final String? serverVersion;

  const SyncAttemptResult({
    required this.success,
    this.alreadyProcessed = false,
    this.isRecoverable = false,
    this.isFatal = false,
    this.isConflict = false,
    this.statusCode,
    this.errorMessage,
    this.serverPayload,
    this.serverVersion,
  });
}

class SyncService {
  static final SyncService instance = SyncService._internal();
  final SyncQueueDao _syncQueueDao = SyncQueueDao();
  final SyncConflictDao _syncConflictDao = SyncConflictDao();
  final SprintTaskDao _sprintTaskDao = SprintTaskDao();
  final SprintDao _sprintDao = SprintDao();
  final ScheduleDao _scheduleDao = ScheduleDao();
  final IdMapDao _idMapDao = IdMapDao();
  final SyncMetadataDao _syncMetadataDao = SyncMetadataDao();
  final NetworkService _networkService = NetworkService.instance;
  final TokenValidator _tokenValidator = TokenValidator.instance;
  final Uuid _uuid = const Uuid();

  SyncServiceStatus _status = SyncServiceStatus.idle;
  StreamController<SyncServiceStatus>? _statusController;
  StreamController<Map<String, dynamic>>? _progressController;
  StreamController<int>? _conflictCountController;
  StreamController<int>? _failedCountController;
  StreamController<int>? _pendingCountController;
  StreamController<SyncUserMessage>? _messageController;
  StreamSubscription<bool>? _connectionSubscription;
  bool _isSyncing = false;
  Timer? _autoSyncTimer;

  SyncService._internal() {
    _init();
  }

  void _init() {
    _statusController = StreamController<SyncServiceStatus>.broadcast();
    _progressController = StreamController<Map<String, dynamic>>.broadcast();
    _conflictCountController = StreamController<int>.broadcast();
    _failedCountController = StreamController<int>.broadcast();
    _pendingCountController = StreamController<int>.broadcast();
    _messageController = StreamController<SyncUserMessage>.broadcast();
    Future.microtask(() async {
      await _syncQueueDao.sanitizeQueue();
      final resetCount = await _syncQueueDao.resetSyncingToPending();
      if (kDebugMode && resetCount > 0) {
        print('SyncService: Reset $resetCount item(s) stuck in syncing');
      }
      await _emitConflictCount();
      await _emitFailedCount();
      await _emitPendingCount();
    });

    // Listen to network changes
    _connectionSubscription = _networkService.listenConnection(
      (isConnected) {
        if (isConnected && _status != SyncServiceStatus.syncing) {
          // Auto-sync when connection is restored (only if user is logged in)
          // Check will be done inside syncPendingChanges
          syncPendingChanges(trigger: 'network');
        }
      },
    );

    // Set up periodic auto-sync (every 30 seconds when online)
    _autoSyncTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) {
        if (_networkService.isConnected && _status != SyncServiceStatus.syncing) {
          syncPendingChanges(trigger: 'timer');
        }
      },
    );
  }

  SyncServiceStatus get status => _status;

  Stream<SyncServiceStatus> get statusStream => 
      _statusController?.stream ?? const Stream.empty();

  Stream<Map<String, dynamic>> get progressStream => 
      _progressController?.stream ?? const Stream.empty();

  Stream<int> get conflictCountStream =>
      _conflictCountController?.stream ?? const Stream.empty();

  Stream<int> get failedCountStream =>
      _failedCountController?.stream ?? const Stream.empty();

  Stream<SyncUserMessage> get messageStream =>
      _messageController?.stream ?? const Stream.empty();

  Stream<int> get pendingCountStream =>
      _pendingCountController?.stream ?? const Stream.empty();

  /// Manual sync trigger
  Future<bool> syncPendingChanges({bool force = false, String trigger = 'auto'}) async {
    if (_isSyncing && !force) {
      if (kDebugMode) {
        print('SyncService: Sync already in progress, skipping');
      }
      return false;
    }

    // Check if user is logged in first
    final token = currentAuthenticationToken;
    if (token == null || token.isEmpty) {
      // User not logged in, skip sync silently
      return false;
    }

    if (!_networkService.isConnected) {
      if (kDebugMode) {
        print('SyncService: No internet connection, aborting');
      }
      _updateStatus(SyncServiceStatus.failed);
      return false;
    }

    // Validate token before syncing
    final tokenValid = await _tokenValidator.validateToken();
    if (!tokenValid) {
      if (kDebugMode) {
        print('SyncService: Token validation failed');
      }
      _updateStatus(SyncServiceStatus.failed);
      return false;
    }

    _isSyncing = true;
    _updateStatus(SyncServiceStatus.syncing);
    if (kDebugMode) {
      print('SyncService: Sync started');
    }
    SyncLogHelper.logSyncStart(trigger: trigger);
    final syncStart = DateTime.now().millisecondsSinceEpoch;

    try {
      // First, push local changes to server
      final pushSuccess = await _pushLocalChanges();
      
      // Then, pull server changes
      final pullSuccess = await _pullServerChanges();

      if (pushSuccess && pullSuccess) {
        _updateStatus(SyncServiceStatus.completed);
        _isSyncing = false;
        final duration = DateTime.now().millisecondsSinceEpoch - syncStart;
        SyncMetrics.recordSyncDuration(duration);
        SyncLogHelper.logSyncEnd(success: true, durationMs: duration);
        return true;
      } else {
        _updateStatus(SyncServiceStatus.failed);
        _isSyncing = false;
        final duration = DateTime.now().millisecondsSinceEpoch - syncStart;
        SyncMetrics.recordSyncDuration(duration);
        SyncLogHelper.logSyncEnd(success: false, durationMs: duration);
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error during sync: $e');
      }
      _updateStatus(SyncServiceStatus.failed);
      _isSyncing = false;
      final duration = DateTime.now().millisecondsSinceEpoch - syncStart;
      SyncMetrics.recordSyncDuration(duration);
      SyncLogHelper.logSyncEnd(success: false, durationMs: duration);
      return false;
    }
  }

  /// Push local changes to server
  Future<bool> _pushLocalChanges() async {
    try {
      final pendingItems = await _syncQueueDao.findPending(limit: 50, entityType: null);
      
      if (pendingItems.isEmpty) {
        return true; // Nothing to sync
      }

      int successCount = 0;
      int failCount = 0;

      for (final item in pendingItems) {
        if (!_networkService.isConnected) {
          if (kDebugMode) {
            print('SyncService: Offline detected, aborting sync cycle');
          }
          return false;
        }
        try {
          if (kDebugMode) {
            print('SyncService: Processing item ${item.id} (${item.operationId})');
          }
          final resolvedItem = await _resolveClientIdsForItem(item);
          // Update status to syncing
          final updatedItem = resolvedItem.copyWith(
            status: SyncStatus.syncing,
            updatedAt: DateTime.now().millisecondsSinceEpoch,
            lastAttemptAt: DateTime.now().millisecondsSinceEpoch,
            lastErrorCode: null,
            lastErrorMessage: null,
          );
          await _syncQueueDao.update(updatedItem);

          final result = await _syncItem(resolvedItem);
          
          if (result.isConflict) {
            await _handleConflict(item, result);
            SyncMetrics.recordConflict();
            SyncLogHelper.logConflictDetected(
              operationId: item.operationId,
              entityType: item.entityType,
              statusCode: result.statusCode,
            );
            failCount++;
            continue;
          }

          if (result.success || result.alreadyProcessed) {
            // Mark as completed
            final completedItem = item.copyWith(
              status: SyncStatus.completed,
              updatedAt: DateTime.now().millisecondsSinceEpoch,
              lastErrorCode: null,
              lastErrorMessage: null,
            );
            await _syncQueueDao.update(completedItem);
            successCount++;
            SyncLogHelper.logItemProcessed(
              operationId: item.operationId,
              entityType: item.entityType,
              status: 'completed',
              retryCount: item.retryCount,
            );
          } else {
            if (result.isFatal) {
              final failedItem = item.copyWith(
                status: SyncStatus.failed,
                updatedAt: DateTime.now().millisecondsSinceEpoch,
                lastErrorCode: result.statusCode,
                lastErrorMessage: result.errorMessage,
                nextAttemptAt: null,
              );
              await _syncQueueDao.update(failedItem);
              if (kDebugMode) {
                print('SyncService: Fatal error, item ${item.id} failed');
              }
              SyncMetrics.recordFatalError();
              SyncLogHelper.logFatalError(
                operationId: item.operationId,
                entityType: item.entityType,
                statusCode: result.statusCode,
              );
              SyncLogHelper.logItemProcessed(
                operationId: item.operationId,
                entityType: item.entityType,
                status: 'failed',
                retryCount: item.retryCount,
              );
            } else {
              final newRetryCount = item.retryCount + 1;
              final nextAttemptAt = _calculateNextAttemptAt(
                attempt: newRetryCount,
              );
              final retryItem = item.copyWith(
                status: SyncStatus.pending,
                retryCount: newRetryCount,
                updatedAt: DateTime.now().millisecondsSinceEpoch,
                lastErrorCode: result.statusCode,
                lastErrorMessage: result.errorMessage,
                nextAttemptAt: nextAttemptAt,
              );
              await _syncQueueDao.update(retryItem);
              if (kDebugMode) {
                final delayMs = nextAttemptAt - DateTime.now().millisecondsSinceEpoch;
                print('SyncService: Retry scheduled in ${delayMs}ms for item ${item.id}');
              }
              final delayMs =
                  nextAttemptAt - DateTime.now().millisecondsSinceEpoch;
              SyncMetrics.recordRetry();
              SyncLogHelper.logRetryScheduled(
                operationId: item.operationId,
                entityType: item.entityType,
                retryCount: newRetryCount,
                delayMs: delayMs,
              );
              SyncLogHelper.logItemProcessed(
                operationId: item.operationId,
                entityType: item.entityType,
                status: 'retry',
                retryCount: newRetryCount,
              );
            }
            failCount++;
          }
        } catch (e) {
          if (kDebugMode) {
            print('SyncService: Error syncing item ${item.id}: $e');
          }
          final newRetryCount = item.retryCount + 1;
          final nextAttemptAt = _calculateNextAttemptAt(
            attempt: newRetryCount,
          );
          await _syncQueueDao.update(
            item.copyWith(
              status: SyncStatus.pending,
              retryCount: newRetryCount,
              updatedAt: DateTime.now().millisecondsSinceEpoch,
              lastAttemptAt: DateTime.now().millisecondsSinceEpoch,
              lastErrorCode: null,
              lastErrorMessage: e.toString(),
              nextAttemptAt: nextAttemptAt,
            ),
          );
          if (kDebugMode) {
            final delayMs = nextAttemptAt - DateTime.now().millisecondsSinceEpoch;
            print('SyncService: Retry scheduled in ${delayMs}ms for item ${item.id}');
          }
          final delayMs = nextAttemptAt - DateTime.now().millisecondsSinceEpoch;
          SyncMetrics.recordRetry();
          SyncLogHelper.logRetryScheduled(
            operationId: item.operationId,
            entityType: item.entityType,
            retryCount: newRetryCount,
            delayMs: delayMs,
          );
          failCount++;
        }
      }

      _updateProgress({
        'type': 'push',
        'success': successCount,
        'failed': failCount,
        'total': pendingItems.length,
      });
      await _emitFailedCount();
      await _emitPendingCount();

      return failCount == 0;
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error in _pushLocalChanges: $e');
      }
      return false;
    }
  }

  /// Sync a single item from queue
  Future<SyncAttemptResult> _syncItem(SyncQueueModel item) async {
    try {
      if (!_networkService.isConnected) {
        return const SyncAttemptResult(
          success: false,
          isRecoverable: true,
          errorMessage: 'Offline',
        );
      }
      final token = await _tokenValidator.getValidToken();
      if (token == null) {
        return const SyncAttemptResult(
          success: false,
          isFatal: true,
          errorMessage: 'Token inválido',
        );
      }

      final data = json.decode(item.data) as Map<String, dynamic>;
      final operationId = item.operationId;

      switch (item.entityType) {
        case 'sprints_tasks':
          return await _syncSprintTask(
            item.operationType,
            data,
            token,
            operationId,
          );
        case 'sprints':
          return await _syncSprint(
            item.operationType,
            data,
            token,
            operationId,
          );
        case 'schedules':
          return await _syncSchedule(
            item.operationType,
            data,
            token,
            operationId,
          );
        case 'api_call':
          return await _syncGenericApiCall(data, token, operationId);
        default:
          if (kDebugMode) {
            print('SyncService: Unknown entity type: ${item.entityType}');
          }
          return const SyncAttemptResult(
            success: false,
            isFatal: true,
            errorMessage: 'Tipo de entidade desconhecido',
          );
      }
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error in _syncItem: $e');
      }
      return SyncAttemptResult(
        success: false,
        isRecoverable: true,
        errorMessage: e.toString(),
      );
    }
  }

  Future<SyncAttemptResult> _syncGenericApiCall(
    Map<String, dynamic> data,
    String token,
    String operationId,
  ) async {
    try {
      final callName = data['call_name'] as String?;
      final apiUrl = data['api_url'] as String?;
      final callTypeName = data['call_type'] as String?;
      final bodyTypeName = data['body_type'] as String?;
      final headers = (data['headers'] as Map?)?.cast<String, dynamic>() ?? {};
      final params =
          _deserializeParams((data['params'] as Map?)?.cast<String, dynamic>());

      if (callName == null || apiUrl == null || callTypeName == null) {
      return const SyncAttemptResult(
          success: false,
        isFatal: true,
          errorMessage: 'Dados inválidos para chamada genérica',
        );
      }

      final callType = ApiCallType.values.firstWhere(
        (e) => e.name == callTypeName,
        orElse: () => ApiCallType.POST,
      );
      final bodyType = bodyTypeName != null
          ? BodyType.values.firstWhere(
              (e) => e.name == bodyTypeName,
              orElse: () => BodyType.JSON,
            )
          : null;

      headers['Authorization'] = 'Bearer $token';
      headers.addAll(_buildIdempotencyHeaders(operationId));
      final localVersion = data['local_version']?.toString();
      if (localVersion != null && localVersion.isNotEmpty) {
        headers['If-Match'] = localVersion;
      }

      final response = await ApiManager.instance.makeApiCall(
        callName: callName,
        apiUrl: apiUrl,
        callType: callType,
        headers: headers,
        params: params ?? {},
        body: data['body'] as String?,
        bodyType: bodyType,
        returnBody: true,
        encodeBodyUtf8: false,
        decodeUtf8: false,
        cache: false,
        isStreamingApi: false,
        alwaysAllowBody: false,
        useOfflineWrapper: false,
      );

      return _resultFromApi(response);
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error syncing generic api call: $e');
      }
      return SyncAttemptResult(
        success: false,
        isRecoverable: true,
        errorMessage: e.toString(),
      );
    }
  }

  Map<String, dynamic>? _deserializeParams(Map<String, dynamic>? params) {
    if (params == null) return null;
    return params.map(
      (key, value) => MapEntry(key, _deserializeValue(value)),
    );
  }

  dynamic _deserializeValue(dynamic value) {
    if (value is Map && value.containsKey('__ff_uploaded_file__')) {
      return UploadedFile.deserialize(value['__ff_uploaded_file__'] as String);
    }
    if (value is List) {
      return value.map(_deserializeValue).toList();
    }
    if (value is Map) {
      return value.map(
        (key, val) => MapEntry(key.toString(), _deserializeValue(val)),
      );
    }
    return value;
  }

  /// Sync sprint task
  Future<SyncAttemptResult> _syncSprintTask(
    SyncOperationType operation,
    Map<String, dynamic> data,
    String token,
    String operationId,
  ) async {
    try {
      switch (operation) {
        case SyncOperationType.create:
        case SyncOperationType.update:
          // Use the update_sprint_task_status_app endpoint
          final response =
              await SprintsGroup.atualizaStatusDaSprintTaskCall.call(
            scheduleId: _toInt(data['schedule_id']),
            tasksListJson: data['tasks_list'],
            token: token,
            idempotencyKey: operationId,
            ifMatch: data['local_version']?.toString(),
          );
          return _resultFromApi(response);

        case SyncOperationType.delete:
          // Handle delete if needed
          return const SyncAttemptResult(success: true);
      }
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error syncing sprint task: $e');
      }
      return SyncAttemptResult(
        success: false,
        isRecoverable: true,
        errorMessage: e.toString(),
      );
    }
  }

  /// Sync sprint
  Future<SyncAttemptResult> _syncSprint(
    SyncOperationType operation,
    Map<String, dynamic> data,
    String token,
    String operationId,
  ) async {
    try {
      switch (operation) {
        case SyncOperationType.create:
        case SyncOperationType.update:
          final response = await SprintsGroup.editProgressSprintCall.call(
            sprintsId: _toInt(data['id']),
            progressPercentage: _toDouble(data['progress_percentage']),
            title: data['title'] as String?,
            objective: data['objective'] as String?,
            startDate: _toInt(data['start_date']),
            projectsId: _toInt(data['projects_id']),
            sprintsStatusesId: _toInt(data['sprints_statuses_id']),
            endDate: _toInt(data['end_date']),
            token: token,
            idempotencyKey: operationId,
            ifMatch: data['local_version']?.toString(),
          );
          final result = _resultFromApi(response);
          if (result.success && operation == SyncOperationType.create) {
            await _reconcilePostIds(
              entityType: 'sprints',
              clientId: data['client_id']?.toString(),
              response: response,
            );
          }
          return result;

        case SyncOperationType.delete:
          return const SyncAttemptResult(success: true);
      }
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error syncing sprint: $e');
      }
      return SyncAttemptResult(
        success: false,
        isRecoverable: true,
        errorMessage: e.toString(),
      );
    }
  }

  /// Sync schedule
  Future<SyncAttemptResult> _syncSchedule(
    SyncOperationType operation,
    Map<String, dynamic> data,
    String token,
    String operationId,
  ) async {
    try {
      switch (operation) {
        case SyncOperationType.create:
          final response = await ProjectsGroup.adicionaColaboradoresNaEscalaCall
              .call(
            teamsId: _toInt(data['teams_id']),
            usersIdList: (data['users_id'] as List?)?.cast<int>(),
            projectsId: _toInt(data['projects_id']),
            scheduleDate: data['schedule_date'] as String?,
            sprintsId: _toInt(data['sprints_id']),
            token: token,
            idempotencyKey: operationId,
            ifMatch: data['local_version']?.toString(),
          );
          final result = _resultFromApi(response);
          if (result.success) {
            await _reconcilePostIds(
              entityType: 'schedules',
              clientId: data['client_id']?.toString(),
              response: response,
            );
          }
          return result;

        case SyncOperationType.update:
          final response = await ProjectsGroup.editaEscalaDosColaboradoresCall
              .call(
            usersIdList: (data['users_id'] as List?)?.cast<int>(),
            scheduleId: _toInt(data['id']),
            token: token,
            idempotencyKey: operationId,
            ifMatch: data['local_version']?.toString(),
          );
          return _resultFromApi(response);

        case SyncOperationType.delete:
          return const SyncAttemptResult(success: true);
      }
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error syncing schedule: $e');
      }
      return SyncAttemptResult(
        success: false,
        isRecoverable: true,
        errorMessage: e.toString(),
      );
    }
  }

  /// Pull changes from server using delta sync (incremental pull)
  Future<bool> _pullServerChanges() async {
    try {
      final token = await _tokenValidator.getValidToken();
      if (token == null) {
        return false;
      }

      // Pull each entity type with delta sync
      await _pullEntityChanges(
        entityType: 'sprints_tasks',
        token: token,
      );

      await _pullEntityChanges(
        entityType: 'sprints',
        token: token,
      );

      await _pullEntityChanges(
        entityType: 'schedules',
        token: token,
      );

      return true;
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error in _pullServerChanges: $e');
      }
      return false;
    }
  }

  /// Pull changes for a specific entity type with delta sync
  Future<void> _pullEntityChanges({
    required String entityType,
    required String token,
  }) async {
    try {
      // Get last sync timestamp
      final lastSyncAt = await _syncMetadataDao.getLastSyncAt(entityType);

      if (kDebugMode) {
        if (lastSyncAt != null) {
          print(
              'SyncService: Delta sync for $entityType - last sync at ${lastSyncAt.toIso8601String()}');
        } else {
          print('SyncService: Full sync for $entityType - no previous sync');
        }
      }

      SyncLogHelper.logPullStart(
        entityType: entityType,
        lastSyncAt: lastSyncAt,
      );

      // Mark sync as in progress
      await _syncMetadataDao.updateSyncStatus(entityType, 'in_progress');

      // Pull changes based on entity type
      bool success = false;
      switch (entityType) {
        case 'sprints_tasks':
          success = await _pullSprintsTasks(token, lastSyncAt);
          break;
        case 'sprints':
          success = await _pullSprints(token, lastSyncAt);
          break;
        case 'schedules':
          success = await _pullSchedules(token, lastSyncAt);
          break;
        default:
          if (kDebugMode) {
            print('SyncService: Unknown entity type for pull: $entityType');
          }
          return;
      }

      if (success) {
        // Update sync_metadata with current timestamp
        final now = DateTime.now();
        await _syncMetadataDao.updateLastSyncAt(entityType, now);

        if (kDebugMode) {
          print('SyncService: Successfully synced $entityType at ${now.toIso8601String()}');
        }

        SyncLogHelper.logPullEnd(
          entityType: entityType,
          success: true,
        );
      } else {
        // Mark sync as failed
        await _syncMetadataDao.updateSyncStatus(entityType, 'failed');

        SyncLogHelper.logPullEnd(
          entityType: entityType,
          success: false,
        );
      }
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error pulling $entityType: $e');
      }

      // Mark sync as failed
      await _syncMetadataDao.updateSyncStatus(entityType, 'failed');

      SyncLogHelper.logPullEnd(
        entityType: entityType,
        success: false,
      );
    }
  }

  /// Pull sprints tasks from server (with delta sync support)
  Future<bool> _pullSprintsTasks(String token, DateTime? lastSyncAt) async {
    try {
      // Build query params with updated_since filter if available
      final Map<String, dynamic> queryParams = {};

      // Add last sync timestamp if available (delta sync)
      if (lastSyncAt != null) {
        // Convert to Unix timestamp (seconds)
        final timestamp = lastSyncAt.millisecondsSinceEpoch ~/ 1000;
        queryParams['updated_since'] = timestamp;

        if (kDebugMode) {
          print('SyncService: Pulling sprints_tasks updated since $timestamp (${lastSyncAt.toIso8601String()})');
        }
      }

      // Note: The API endpoint may not support updated_since filter yet
      // In that case, we still track sync times for future use
      final response = await SprintsGroup.queryAllSprintsTasksRecordCall.call(
        token: token,
        // Add filters as needed - updated_since would be added here when API supports it
      );

      if (response.succeeded) {
        if (kDebugMode) {
          print('SyncService: Successfully pulled sprints_tasks from server');
        }

        // Parse and save to local database
        // The actual parsing would depend on the response structure
        // For now, we just mark the sync as successful

        return true;
      } else {
        if (kDebugMode) {
          print('SyncService: Failed to pull sprints_tasks - status code: ${response.statusCode}');
        }
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error pulling sprints tasks: $e');
      }
      return false;
    }
  }

  /// Pull sprints from server (with delta sync support)
  Future<bool> _pullSprints(String token, DateTime? lastSyncAt) async {
    try {
      // Build query params with updated_since filter if available
      final Map<String, dynamic> queryParams = {};

      // Add last sync timestamp if available (delta sync)
      if (lastSyncAt != null) {
        final timestamp = lastSyncAt.millisecondsSinceEpoch ~/ 1000;
        queryParams['updated_since'] = timestamp;

        if (kDebugMode) {
          print('SyncService: Pulling sprints updated since $timestamp (${lastSyncAt.toIso8601String()})');
        }
      }

      final response = await SprintsGroup.getSprintAtivaCall.call(
        token: token,
        // Add filters as needed - updated_since would be added here when API supports it
      );

      if (response.succeeded) {
        if (kDebugMode) {
          print('SyncService: Successfully pulled sprints from server');
        }

        // Parse and save to local database
        // The actual parsing would depend on the response structure

        return true;
      } else {
        if (kDebugMode) {
          print('SyncService: Failed to pull sprints - status code: ${response.statusCode}');
        }
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error pulling sprints: $e');
      }
      return false;
    }
  }

  /// Pull schedules from server (with delta sync support)
  Future<bool> _pullSchedules(String token, DateTime? lastSyncAt) async {
    try {
      // Build query params with updated_since filter if available
      final Map<String, dynamic> queryParams = {};

      // Add last sync timestamp if available (delta sync)
      if (lastSyncAt != null) {
        final timestamp = lastSyncAt.millisecondsSinceEpoch ~/ 1000;
        queryParams['updated_since'] = timestamp;

        if (kDebugMode) {
          print('SyncService: Pulling schedules updated since $timestamp (${lastSyncAt.toIso8601String()})');
        }
      }

      // Note: We need to implement the actual API call for schedules
      // For now, just return true to indicate sync tracking is working
      if (kDebugMode) {
        print('SyncService: Schedule pulling not yet implemented');
      }

      return true;
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error pulling schedules: $e');
      }
      return false;
    }
  }

  /// Add item to sync queue
  Future<void> addToSyncQueue({
    required SyncOperationType operationType,
    required String entityType,
    int? entityId,
    required Map<String, dynamic> data,
    String? operationId,
  }) async {
    try {
      final resolvedOperationId = operationId ?? _newOperationId();
      final item = SyncQueueModel(
        operationId: resolvedOperationId,
        operationType: operationType,
        entityType: entityType,
        entityId: entityId,
        data: json.encode(data),
        createdAt: DateTime.now().millisecondsSinceEpoch,
      );

      await _syncQueueDao.insert(item);
      await _emitPendingCount();

      // Try to sync immediately if online
      if (_networkService.isConnected && !_isSyncing) {
        syncPendingChanges(trigger: 'queue_add');
      }
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error adding to sync queue: $e');
      }
    }
  }

  /// Get pending sync count
  Future<int> getPendingCount() async {
    return await _syncQueueDao.countPending();
  }

  Future<int> getPendingConflictCount() async {
    return await _syncConflictDao.countPending();
  }

  Future<int> getFailedCount() async {
    return await _syncQueueDao.countFailed();
  }

  void notifyUserMessage(SyncUserMessage message) {
    _messageController?.add(message);
  }

  void _updateStatus(SyncServiceStatus status) {
    _status = status;
    _statusController?.add(status);
  }

  void _updateProgress(Map<String, dynamic> progress) {
    _progressController?.add(progress);
  }

  String _newOperationId() => _uuid.v4();

  Map<String, String> _buildIdempotencyHeaders(String operationId) {
    return {
      'Idempotency-Key': operationId,
      'X-Operation-Id': operationId,
    };
  }

  bool _isAlreadyProcessed(ApiCallResponse response) {
    if (response.statusCode == 208) {
      return true;
    }
    final bodyText = response.bodyText.toLowerCase();
    if (bodyText.contains('already_processed') ||
        bodyText.contains('already processed') ||
        bodyText.contains('idempotent')) {
      return true;
    }
    if (response.jsonBody is Map) {
      final map = response.jsonBody as Map;
      final flag = map['already_processed'];
      if (flag == true || flag == 1 || flag == 'true') {
        return true;
      }
      final status = map['status']?.toString().toLowerCase();
      if (status == 'already_processed' || status == 'already processed') {
        return true;
      }
    }
    return false;
  }

  String? _extractErrorMessage(ApiCallResponse response) {
    if (response.exception != null) {
      return response.exception.toString();
    }
    if (response.jsonBody is Map) {
      final map = response.jsonBody as Map;
      final message = map['message'] ?? map['error'] ?? map['detail'];
      if (message != null) {
        return message.toString();
      }
    }
    return response.bodyText;
  }

  SyncAttemptResult _resultFromApi(ApiCallResponse response) {
    final alreadyProcessed = _isAlreadyProcessed(response);
    if (response.succeeded || alreadyProcessed) {
      return SyncAttemptResult(
        success: true,
        alreadyProcessed: alreadyProcessed,
        statusCode: response.statusCode,
      );
    }
    if (response.statusCode == 409) {
      return SyncAttemptResult(
        success: false,
        isConflict: true,
        statusCode: response.statusCode,
        errorMessage: _extractErrorMessage(response),
        serverPayload: _extractServerPayload(response),
        serverVersion: _extractServerVersion(response),
      );
    }
    final classification = _classifyError(response);
    return SyncAttemptResult(
      success: false,
      statusCode: response.statusCode,
      errorMessage: _extractErrorMessage(response),
      isRecoverable: classification.isRecoverable,
      isFatal: classification.isFatal,
    );
  }

  // Helpers for tests
  SyncAttemptResult testResultFromApi(ApiCallResponse response) {
    return _resultFromApi(response);
  }

  int testCalculateNextAttemptAt({
    required int attempt,
    double? jitterOverride,
  }) {
    return _calculateNextAttemptAt(
      attempt: attempt,
      jitterOverride: jitterOverride,
    );
  }

  int _calculateNextAttemptAt({
    required int attempt,
    int maxDelayMs = 5 * 60 * 1000,
    double? jitterOverride,
  }) {
    final scheduleMs = <int>[
      2000,
      5000,
      15000,
      45000,
      120000,
    ];
    final idx = (attempt - 1).clamp(0, scheduleMs.length - 1);
    final baseDelay = scheduleMs[idx];
    final jitter = jitterOverride ?? (0.5 + (Random().nextDouble()));
    final withJitter = (baseDelay * jitter).round();
    return DateTime.now()
        .add(Duration(milliseconds: min(withJitter, maxDelayMs)))
        .millisecondsSinceEpoch;
  }

  SyncAttemptResult _classifyError(ApiCallResponse response) {
    if (!_networkService.isConnected) {
      return const SyncAttemptResult(
        success: false,
        isRecoverable: true,
      );
    }
    final code = response.statusCode;
    if (code == 408 || code == 429 || (code >= 500 && code <= 599)) {
      return SyncAttemptResult(
        success: false,
        isRecoverable: true,
        statusCode: code,
      );
    }
    if (code == 400 || code == 401 || code == 403 || code == 422) {
      return SyncAttemptResult(
        success: false,
        isFatal: true,
        statusCode: code,
      );
    }
    return SyncAttemptResult(
      success: false,
      isRecoverable: true,
      statusCode: code,
    );
  }

  Future<SyncQueueModel> _resolveClientIdsForItem(SyncQueueModel item) async {
    final data = json.decode(item.data) as Map<String, dynamic>;
    bool changed = false;

    if (data.containsKey('client_id')) {
      final clientId = data['client_id']?.toString();
      if (clientId != null && clientId.isNotEmpty) {
        final map = await _idMapDao.findByClientId(
          entityType: item.entityType,
          clientId: clientId,
        );
        if (map != null) {
          _replaceIdFields(data, map.serverId);
          if (item.entityId != null) {
            final serverId = int.tryParse(map.serverId);
            if (serverId != null) {
              item = item.copyWith(entityId: serverId);
            }
          }
          changed = true;
        }
      }
    }

    final scheduleId = _extractInt(data['schedule_id']);
    if (scheduleId != null && scheduleId < 0) {
      final resolved = await _resolveScheduleServerId(scheduleId);
      if (resolved != null) {
        data['schedule_id'] = resolved;
        changed = true;
      }
    }

    if (item.entityType == 'api_call') {
      final updated = await _resolveClientIdsForApiCall(data);
      if (updated) {
        changed = true;
      }
    }

    if (changed) {
      final updatedItem = item.copyWith(data: json.encode(data));
      await _syncQueueDao.update(updatedItem);
      return updatedItem;
    }
    return item;
  }

  Future<bool> _resolveClientIdsForApiCall(
    Map<String, dynamic> data,
  ) async {
    bool changed = false;
    final apiUrl = data['api_url']?.toString();
    if (apiUrl != null && apiUrl.contains('/schedule/')) {
      final lastSegment = apiUrl.split('/').last;
      final scheduleId = int.tryParse(lastSegment);
      if (scheduleId != null && scheduleId < 0) {
        final schedule = await _scheduleDao.findById(scheduleId);
        final clientId = schedule?.clientId;
        if (clientId != null) {
          final map = await _idMapDao.findByClientId(
            entityType: 'schedules',
            clientId: clientId,
          );
          if (map != null) {
            data['api_url'] = apiUrl.replaceAll(
              '/$lastSegment',
              '/${map.serverId}',
            );
            changed = true;
          }
        }
      }
    }

    return changed;
  }

  void _replaceIdFields(Map<String, dynamic> data, String serverId) {
    final keys = [
      'id',
      'schedule_id',
      'sprints_id',
      'sprints_tasks_id',
    ];
    for (final key in keys) {
      if (data.containsKey(key)) {
        data[key] = _castToIdType(data[key], serverId);
      }
    }
  }

  int? _extractInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is String) return int.tryParse(value);
    return null;
  }

  Future<int?> _resolveScheduleServerId(int scheduleId) async {
    final schedule = await _scheduleDao.findById(scheduleId);
    final clientId = schedule?.clientId;
    if (clientId == null) return null;
    final map = await _idMapDao.findByClientId(
      entityType: 'schedules',
      clientId: clientId,
    );
    if (map == null) return null;
    return int.tryParse(map.serverId);
  }

  dynamic _castToIdType(dynamic original, String serverId) {
    if (original is int) {
      return int.tryParse(serverId) ?? original;
    }
    return serverId;
  }


  Future<void> _reconcilePostIds({
    required String entityType,
    required String? clientId,
    required ApiCallResponse response,
  }) async {
    if (clientId == null || clientId.isEmpty) {
      return;
    }
    final serverId = _extractServerId(response);
    if (serverId == null || serverId.isEmpty) {
      return;
    }
    await _idMapDao.insert(IdMapModel(
      entityType: entityType,
      clientId: clientId,
      serverId: serverId,
      createdAt: DateTime.now().millisecondsSinceEpoch,
    ));

    final serverIdInt = int.tryParse(serverId);
    if (serverIdInt != null) {
      switch (entityType) {
        case 'schedules':
          await _scheduleDao.updateServerIdByClientId(
            clientId: clientId,
            serverId: serverIdInt,
          );
          break;
        case 'sprints':
          await _sprintDao.updateServerIdByClientId(
            clientId: clientId,
            serverId: serverIdInt,
          );
          break;
        case 'sprints_tasks':
          await _sprintTaskDao.updateServerIdByClientId(
            clientId: clientId,
            serverId: serverIdInt,
          );
          break;
      }
    }

    await _updatePendingQueueReferences(
      entityType: entityType,
      clientId: clientId,
      serverId: serverId,
    );
  }

  String? _extractServerId(ApiCallResponse response) {
    if (response.jsonBody is Map) {
      final map = response.jsonBody as Map;
      final candidates = [
        map['id'],
        map['schedule_id'],
        map['sprint_id'],
        map['sprints_id'],
        map['sprints_tasks_id'],
      ];
      for (final candidate in candidates) {
        if (candidate != null) {
          return candidate.toString();
        }
      }
    }
    return null;
  }

  Future<void> _updatePendingQueueReferences({
    required String entityType,
    required String clientId,
    required String serverId,
  }) async {
    int? localScheduleId;
    if (entityType == 'schedules') {
      final schedule = await _scheduleDao.findByClientId(clientId);
      localScheduleId = schedule?.scheduleId;
    }
    final pending = await _syncQueueDao.findAll(
      status: SyncStatus.pending,
    );
    for (final item in pending) {
      final data = json.decode(item.data) as Map<String, dynamic>;
      bool changed = false;
      if (data.containsKey('client_id') && data['client_id'] == clientId) {
        _replaceIdFields(data, serverId);
        changed = true;
      }
      if (data.containsKey('id') && data['id'].toString() == clientId) {
        data['id'] = _castToIdType(data['id'], serverId);
        changed = true;
      }
      if (localScheduleId != null &&
          data.containsKey('schedule_id') &&
          _extractInt(data['schedule_id']) == localScheduleId) {
        data['schedule_id'] = _castToIdType(data['schedule_id'], serverId);
        changed = true;
      }
      if (item.entityType == 'api_call') {
        final apiUrl = data['api_url']?.toString();
        if (apiUrl != null && apiUrl.contains('/$clientId')) {
          data['api_url'] = apiUrl.replaceAll('/$clientId', '/$serverId');
          changed = true;
        }
        if (localScheduleId != null && apiUrl != null) {
          final localSegment = '/$localScheduleId';
          if (apiUrl.contains(localSegment)) {
            data['api_url'] = apiUrl.replaceAll(localSegment, '/$serverId');
            changed = true;
          }
        }
      }
      if (changed) {
        await _syncQueueDao.update(item.copyWith(data: json.encode(data)));
      }
    }
  }

  Future<void> _handleConflict(
    SyncQueueModel item,
    SyncAttemptResult result,
  ) async {
    final now = DateTime.now().millisecondsSinceEpoch;
    final data = json.decode(item.data) as Map<String, dynamic>;
    final localVersion = _extractLocalVersionFromData(data);
    String? serverPayload = result.serverPayload;
    String? serverVersion = result.serverVersion;

    if (serverPayload == null) {
      final fetchResult = await _tryFetchServerPayload(item, data);
      serverPayload = fetchResult.serverPayload;
      serverVersion = serverVersion ?? fetchResult.serverVersion;
    }

    final conflict = SyncConflictModel(
      operationId: item.operationId,
      entityType: item.entityType,
      entityId: item.entityId?.toString(),
      operationType: item.operationType.name,
      localPayload: item.data,
      serverPayload: serverPayload,
      localVersion: localVersion,
      serverVersion: serverVersion,
      status: 'pending',
      createdAt: now,
      errorMessage: result.errorMessage,
    );
    await _syncConflictDao.insert(conflict);

    await _syncQueueDao.update(
      item.copyWith(
        status: SyncStatus.conflict,
        updatedAt: now,
        lastErrorCode: result.statusCode,
        lastErrorMessage: result.errorMessage,
        nextAttemptAt: null,
      ),
    );

    await _emitConflictCount();
    await _emitPendingCount();
    if (kDebugMode) {
      print('SyncService: Conflict detected for item ${item.id}');
    }
  }

  Future<void> _emitConflictCount() async {
    final count = await _syncConflictDao.countPending();
    _conflictCountController?.add(count);
  }

  Future<void> _emitFailedCount() async {
    final count = await _syncQueueDao.countFailed();
    _failedCountController?.add(count);
  }

  Future<void> _emitPendingCount() async {
    final count = await _syncQueueDao.countPending();
    _pendingCountController?.add(count);
  }

  String? _extractLocalVersionFromData(Map<String, dynamic> data) {
    final keys = [
      'local_version',
      'version',
      'updated_at',
      'updatedAt',
      'synced_at',
      'syncedAt',
      'etag',
    ];
    for (final key in keys) {
      if (data.containsKey(key) && data[key] != null) {
        return data[key].toString();
      }
    }
    return null;
  }

  String? _extractServerPayload(ApiCallResponse response) {
    try {
      if (response.jsonBody != null) {
        return json.encode(response.jsonBody);
      }
    } catch (_) {}
    return null;
  }

  String? _extractServerVersion(ApiCallResponse response) {
    final etag = response.getHeader('etag');
    if (etag.isNotEmpty) {
      return etag;
    }
    if (response.jsonBody is Map) {
      final map = response.jsonBody as Map;
      final version = map['version'] ?? map['updated_at'] ?? map['updatedAt'];
      if (version != null) {
        return version.toString();
      }
    }
    return null;
  }

  Future<SyncAttemptResult> _tryFetchServerPayload(
    SyncQueueModel item,
    Map<String, dynamic> data,
  ) async {
    if (!_networkService.isConnected) {
      return const SyncAttemptResult(success: false);
    }
    try {
      if (item.entityType == 'api_call') {
        final apiUrl = data['api_url'] as String?;
        final callName = data['call_name'] as String? ?? 'Fetch conflict data';
        final headers =
            (data['headers'] as Map?)?.cast<String, dynamic>() ?? {};
        final params =
            (data['params'] as Map?)?.cast<String, dynamic>() ?? {};
        if (apiUrl != null) {
          final response = await ApiManager.instance.makeApiCall(
            callName: callName,
            apiUrl: apiUrl,
            callType: ApiCallType.GET,
            headers: headers,
            params: params,
            returnBody: true,
            encodeBodyUtf8: false,
            decodeUtf8: false,
            cache: false,
            isStreamingApi: false,
            alwaysAllowBody: false,
            useOfflineWrapper: false,
          );
          if (response.succeeded) {
            return SyncAttemptResult(
              success: true,
              serverPayload: _extractServerPayload(response),
              serverVersion: _extractServerVersion(response),
            );
          }
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Unable to fetch server payload: $e');
      }
    }
    return const SyncAttemptResult(success: false);
  }

  Future<bool> resolveConflictKeepLocal(int conflictId) async {
    final conflict = await _syncConflictDao.findById(conflictId);
    if (conflict == null) return false;
    final data = json.decode(conflict.localPayload) as Map<String, dynamic>;
    if (conflict.serverVersion != null) {
      data['local_version'] = conflict.serverVersion;
    }
    final operationType = _parseOperationType(conflict.operationType);
    await addToSyncQueue(
      operationType: operationType,
      entityType: conflict.entityType,
      entityId: int.tryParse(conflict.entityId ?? ''),
      data: data,
    );
    await _syncConflictDao.update(conflict.copyWith(
      status: 'resolved',
      resolvedAt: DateTime.now().millisecondsSinceEpoch,
      resolution: 'keep_local',
    ));
    SyncLogHelper.logConflictResolved(
      operationId: conflict.operationId,
      resolution: 'keep_local',
    );
    await _markQueueItemResolved(conflict.operationId);
    await _emitConflictCount();
    return true;
  }

  Future<bool> resolveConflictUseServer(int conflictId) async {
    final conflict = await _syncConflictDao.findById(conflictId);
    if (conflict == null) return false;
    bool applied = false;
    if (conflict.serverPayload != null) {
      applied = await _applyServerPayload(
        conflict.entityType,
        conflict.serverPayload!,
      );
    }
    await _syncConflictDao.update(conflict.copyWith(
      status: 'resolved',
      resolvedAt: DateTime.now().millisecondsSinceEpoch,
      resolution: 'use_server',
      errorMessage: applied ? null : conflict.errorMessage,
    ));
    SyncLogHelper.logConflictResolved(
      operationId: conflict.operationId,
      resolution: 'use_server',
    );
    await _markQueueItemResolved(conflict.operationId);
    await _emitConflictCount();
    return applied;
  }

  Future<void> _markQueueItemResolved(String operationId) async {
    final item = await _syncQueueDao.findByOperationId(operationId);
    if (item == null) return;
    await _syncQueueDao.update(
      item.copyWith(
        status: SyncStatus.completed,
        updatedAt: DateTime.now().millisecondsSinceEpoch,
      ),
    );
    await _emitPendingCount();
    await _emitFailedCount();
  }

  SyncOperationType _parseOperationType(String value) {
    return SyncOperationType.values.firstWhere(
      (e) => e.name == value,
      orElse: () => SyncOperationType.update,
    );
  }

  Future<bool> _applyServerPayload(
    String entityType,
    String payloadJson,
  ) async {
    try {
      final decoded = json.decode(payloadJson);
      if (decoded is! Map<String, dynamic>) {
        return false;
      }
      final map = decoded.containsKey('data') && decoded['data'] is Map
          ? Map<String, dynamic>.from(decoded['data'] as Map)
          : decoded;

      switch (entityType) {
        case 'sprints':
          final sprint = SprintModel.fromMap(map);
          await _sprintDao.insert(sprint);
          return true;
        case 'schedules':
          final schedule = ScheduleModel.fromMap(map);
          await _scheduleDao.insert(schedule);
          return true;
        case 'sprints_tasks':
          final task = SprintTaskModel.fromMap(map);
          await _sprintTaskDao.insert(task);
          return true;
      }
    } catch (e) {
      if (kDebugMode) {
        print('SyncService: Error applying server payload: $e');
      }
    }
    return false;
  }

  void dispose() {
    _connectionSubscription?.cancel();
    _autoSyncTimer?.cancel();
    _statusController?.close();
    _progressController?.close();
    _conflictCountController?.close();
    _failedCountController?.close();
    _pendingCountController?.close();
    _messageController?.close();
  }

  /// Converte qualquer tipo numérico ou String para int? de forma segura.
  /// Necessário pois a API pode retornar campos como String ("42") ou int (42).
  int? _toInt(dynamic v) {
    if (v == null) return null;
    if (v is int) return v;
    if (v is double) return v.toInt();
    if (v is String) return int.tryParse(v) ?? double.tryParse(v)?.toInt();
    return null;
  }

  /// Converte qualquer tipo numérico ou String para double? de forma segura.
  double? _toDouble(dynamic v) {
    if (v == null) return null;
    if (v is double) return v;
    if (v is int) return v.toDouble();
    if (v is String) return double.tryParse(v);
    return null;
  }
}
