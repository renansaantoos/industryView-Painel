import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'sync_service.dart';
import '../services/network_service.dart';
import 'token_validator.dart';
import '../services/rdo_prefetch_service.dart';
import '../auth/custom_auth/auth_util.dart';
import '../backend/api_requests/api_calls.dart';
import '/core/utils/app_utils.dart';

class InitialSyncService {
  static final InitialSyncService instance = InitialSyncService._internal();
  static const String _kInitialSyncKey = '_initial_sync_completed_';
  static const String _kLastSyncKey = '_last_full_sync_';

  InitialSyncService._internal();

  /// Check if initial sync has been completed
  Future<bool> hasCompletedInitialSync() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getBool(_kInitialSyncKey) ?? false;
    } catch (e) {
      if (kDebugMode) {
        print('InitialSyncService: Error checking initial sync: $e');
      }
      return false;
    }
  }

  /// Perform initial sync if needed
  Future<bool> performInitialSyncIfNeeded({bool force = false}) async {
    // Check if user is logged in first
    if (!loggedIn || currentAuthenticationToken == null) {
      // Don't log this - it's normal when user is not logged in
      return false;
    }

    // Check if already completed
    if (!force && await hasCompletedInitialSync()) {
      if (kDebugMode) {
        print('InitialSyncService: Initial sync already completed');
      }
      return true;
    }

    // Check network connection
    if (!await NetworkService.instance.checkConnection()) {
      if (kDebugMode) {
        print('InitialSyncService: No network connection, skipping initial sync');
      }
      return false;
    }

    // Validate token
    final tokenValid = await TokenValidator.instance.validateToken();
    if (!tokenValid) {
      if (kDebugMode) {
        print('InitialSyncService: Token validation failed, skipping initial sync');
      }
      return false;
    }

    try {
      if (kDebugMode) {
        print('InitialSyncService: Starting initial sync...');
      }

      // RDO prefetch cedo (em paralelo), para SQLite ter dados antes de abrir a tela
      Future.microtask(() async {
        try {
          await RdoPrefetchService.instance.prefetchRdoData(force: true);
        } catch (_) {}
      });

      // Primeiro envia mudanças locais pendentes
      await SyncService.instance.syncPendingChanges(force: true);

      // Depois puxa todos os dados necessários para offline
      final success = await _pullAllData(token: currentAuthenticationToken!);

      if (success) {
        // Mark initial sync as completed
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool(_kInitialSyncKey, true);
        await prefs.setInt(_kLastSyncKey, DateTime.now().millisecondsSinceEpoch);

        if (kDebugMode) {
          print('InitialSyncService: Initial sync completed successfully');
        }

        // Após sync inicial, garantir que dados da RDO estejam no SQLite
        // Executar prefetch RDO em background (não bloqueia)
        Future.microtask(() async {
          try {
            if (kDebugMode) {
              print('InitialSyncService: Executando prefetch RDO após sync inicial...');
            }
            await RdoPrefetchService.instance.prefetchRdoData(force: true);
            if (kDebugMode) {
              print('InitialSyncService: Prefetch RDO concluído');
            }
          } catch (e) {
            if (kDebugMode) {
              print('InitialSyncService: Erro no prefetch RDO (não crítico): $e');
            }
          }
        });

        return true;
      } else {
        if (kDebugMode) {
          print('InitialSyncService: Initial sync failed');
        }
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        print('InitialSyncService: Error during initial sync: $e');
      }
      return false;
    }
  }

  Future<bool> _pullAllData({required String token}) async {
    try {
      final projectsId = AppState().user.projectId;
      final teamsId = AppState().user.teamsId;
      final sprintsId = AppState().user.sprint.id;
      final userId = AppState().user.id;

      // 1) Tarefas e sprints
      // IMPORTANTE: Fazer chamada com os mesmos parâmetros da RDO para garantir que os dados sejam salvos corretamente
      final tasksResponse = await SprintsGroup.queryAllSprintsTasksRecordCall.call(
        projectsId: projectsId,
        teamsId: teamsId,
        sprintsId: sprintsId,
        page: 1,
        perPage: 1000,
        token: token,
        search: '',
        equipamentsTypesId: 0,
      );
      final backlogsIds = _extractProjectsBacklogsIds(tasksResponse.jsonBody);
      for (final backlogId in backlogsIds) {
        await ProjectsGroup.getSubtasksCall.call(
          projectsBacklogsId: backlogId,
          token: token,
        );
      }
      await SprintsGroup.getSprintAtivaCall.call(
        projectsId: projectsId,
        token: token,
      );
      await SprintsGroup.getSprintsLoginCall.call(
        projectsId: projectsId,
        sprintsId: sprintsId,
        token: token,
      );

      // 2) Equipamentos (dropdown)
      await ProjectsGroup.equipamentsTypeCall.call(token: token);

      // 3) Equipe e escala do dia (Page_check_qrcode)
      await ProjectsGroup.listaMembrosDeUmaEquipeCall.call(
        teamsId: teamsId,
        page: 1,
        perPage: 100,
        token: token,
      );
      await ProjectsGroup.listaColaboradoresDaEscalaDoDiaCall.call(
        projectsId: projectsId,
        teamsId: teamsId,
        token: token,
      );
      // Pré-carregar schedule (diárias da RDO) - mesmo parâmetros que a RDO usa
      await ProjectsGroup.queryAllScheduleCall.call(
        projectsId: projectsId,
        teamsId: teamsId,
        sprintsId: sprintsId,
        token: token,
      );

      // 4) Dados do usuário e permissões
      if (userId != null) {
        await UserGroup.getUserIdCall.call(
          usersId: userId,
          bearerAuth: token,
        );
      }
      await UserGroup.queryAllUsersControlSystemRecordsCall.call(
        bearerAuth: token,
      );
      await UserGroup.queryAllUsersRolesRecordsCall.call(
        bearerAuth: token,
      );
      await UserGroup.queryAllUsersPermissionsRecordsCall.call(
        bearerAuth: token,
      );
      await UserGroup.queryAllUsersSystemAccessRecordsCall.call(
        bearerAuth: token,
      );

      // 5) QRCode reader — chamado sob demanda ao escanear, não no sync

      return true;
    } catch (e) {
      if (kDebugMode) {
        print('InitialSyncService: Error in _pullAllData: $e');
      }
      return false;
    }
  }

  List<int> _extractProjectsBacklogsIds(dynamic jsonBody) {
    try {
      final rootData =
          (jsonBody is Map && jsonBody['data'] != null) ? jsonBody['data'] : jsonBody;
      final buckets = <dynamic>[
        getJsonField(rootData, r'''$.sprints_tasks_em_andamento.items''', true),
        getJsonField(rootData, r'''$.sprints_tasks_concluidas.items''', true),
        getJsonField(rootData, r'''$.sprints_tasks_sem_sucesso.items''', true),
        getJsonField(rootData, r'''$.sprints_tasks_inspecao.items''', true),
        getJsonField(rootData, r'''$.sprints_tasks_pendentes.items''', true),
      ];
      final ids = <int>{};
      for (final bucket in buckets) {
        if (bucket is List) {
          for (final item in bucket) {
            final id = int.tryParse(
              getJsonField(item, r'''$.projects_backlogs.id''').toString(),
            );
            if (id != null) ids.add(id);
          }
        }
      }
      return ids.toList();
    } catch (_) {
      return <int>[];
    }
  }

  /// Reset initial sync flag (useful for testing or re-syncing)
  Future<void> resetInitialSync() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_kInitialSyncKey);
      await prefs.remove(_kLastSyncKey);
      
      // Optionally clear local database
      // await DatabaseHelper.instance.clearAllTables();
      
      if (kDebugMode) {
        print('InitialSyncService: Initial sync flag reset');
      }
    } catch (e) {
      if (kDebugMode) {
        print('InitialSyncService: Error resetting initial sync: $e');
      }
    }
  }

  /// Get last sync timestamp
  Future<DateTime?> getLastSyncTime() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final timestamp = prefs.getInt(_kLastSyncKey);
      if (timestamp != null) {
        return DateTime.fromMillisecondsSinceEpoch(timestamp);
      }
      return null;
    } catch (e) {
      if (kDebugMode) {
        print('InitialSyncService: Error getting last sync time: $e');
      }
      return null;
    }
  }

  /// Check if a full sync is needed (e.g., if last sync was more than 24 hours ago)
  Future<bool> needsFullSync({int maxHoursSinceLastSync = 24}) async {
    final lastSync = await getLastSyncTime();
    if (lastSync == null) {
      return true; // Never synced
    }

    final now = DateTime.now();
    final hoursSinceLastSync = now.difference(lastSync).inHours;
    return hoursSinceLastSync >= maxHoursSinceLastSync;
  }
}
