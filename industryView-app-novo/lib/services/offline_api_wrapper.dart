import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../backend/api_requests/api_manager.dart';
import '../backend/api_requests/api_calls.dart';
import '/core/utils/app_utils.dart';
import '../database/daos/sprint_task_dao.dart';
import '../database/daos/sprint_dao.dart';
import '../database/daos/schedule_dao.dart';
import '../database/daos/user_dao.dart';
import '../database/daos/equipaments_type_dao.dart';
import '../database/daos/api_cache_dao.dart';
import '../database/daos/task_state_override_dao.dart';
import '../database/daos/sync_queue_dao.dart';
import '../database/models/sprint_task_model.dart';
import '../database/models/sprint_model.dart';
import '../database/models/schedule_model.dart';
import '../database/models/user_model.dart';
import '../database/models/equipaments_type_model.dart';
import '../database/models/api_cache_model.dart';
import '../database/models/task_state_override_model.dart';
import '/core/models/uploaded_file.dart';
import 'network_service.dart';
import 'sync_service.dart';
import 'auth_session_service.dart';
import '../database/models/sync_queue_model.dart';
import '../database/database_helper.dart';
import 'package:uuid/uuid.dart';

class OfflineApiWrapper {
  static final OfflineApiWrapper instance = OfflineApiWrapper._internal();
  final NetworkService _networkService = NetworkService.instance;
  final SyncService _syncService = SyncService.instance;
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;
  final SprintTaskDao _sprintTaskDao = SprintTaskDao();
  final SprintDao _sprintDao = SprintDao();
  final ScheduleDao _scheduleDao = ScheduleDao();
  final UserDao _userDao = UserDao();
  final EquipamentsTypeDao _equipamentsTypeDao = EquipamentsTypeDao();
  final ApiCacheDao _apiCacheDao = ApiCacheDao();
  final TaskStateOverrideDao _taskStateOverrideDao = TaskStateOverrideDao();
  final SyncQueueDao _syncQueueDao = SyncQueueDao();
  final Uuid _uuid = const Uuid();
  
  // Armazenar os últimos taskIds processados para usar no addCommentCall
  // Map<comment, taskId> para associar comentários aos taskIds corretos
  final Map<String, int> _commentToTaskIdMap = {};
  // Lista dos últimos taskIds processados (últimos 10)
  final List<int> _recentTaskIds = [];

  OfflineApiWrapper._internal();

  /// Wrapper for API calls that handles offline mode
  Future<ApiCallResponse> call({
    required String callName,
    required String apiUrl,
    required ApiCallType callType,
    Map<String, dynamic> headers = const {},
    Map<String, dynamic> params = const {},
    String? body,
    BodyType? bodyType,
    bool returnBody = true,
    bool encodeBodyUtf8 = false,
    bool decodeUtf8 = false,
    bool alwaysAllowBody = false,
    bool cache = false,
    bool isStreamingApi = false,
  }) async {
    final isOnline = _networkService.isConnected;

    // If online, make normal API call
    if (isOnline) {
      try {
        final response = await ApiManager.instance.makeApiCall(
          callName: callName,
          apiUrl: apiUrl,
          callType: callType,
          headers: headers,
          params: params,
          body: body,
          bodyType: bodyType,
          returnBody: returnBody,
          encodeBodyUtf8: encodeBodyUtf8,
          decodeUtf8: decodeUtf8,
          alwaysAllowBody: alwaysAllowBody,
          cache: cache,
          isStreamingApi: isStreamingApi,
          useOfflineWrapper: false, // Evitar recursão - já estamos no wrapper
        );

        // Check for 401 Unauthorized - but NOT for login calls to avoid logout loop
        if (response.statusCode == 401 && !_isLoginCall(callName, apiUrl)) {
          if (kDebugMode) {
            print('OfflineApiWrapper: 401 Unauthorized detected on $callName');
          }
          AuthSessionService.instance.handleUnauthorized();
        }

        // If successful, save to local database
        if (response.succeeded && returnBody) {
          try {
            await _saveResponseToLocal(
              callName,
              response.jsonBody,
              callType: callType,
              params: params,
              body: body,
            );
          } catch (e) {
            // Não deixar erro ao salvar no banco quebrar a resposta da API
            if (kDebugMode) {
              print('OfflineApiWrapper: Erro ao salvar resposta no banco (não crítico): $e');
            }
          }
        }

        return response;
      } catch (e) {
        if (kDebugMode) {
          print('OfflineApiWrapper: API call failed, trying local: $e');
        }
        // Fall through to offline handling
      }
    }

    // Offline mode: try to get from local database
    return await _handleOfflineCall(
      callName: callName,
      apiUrl: apiUrl,
      callType: callType,
      headers: headers,
      params: params,
      body: body,
      bodyType: bodyType,
    );
  }

  /// Handle API call in offline mode
  Future<ApiCallResponse> _handleOfflineCall({
    required String callName,
    required String apiUrl,
    required ApiCallType callType,
    Map<String, dynamic> headers = const {},
    Map<String, dynamic> params = const {},
    String? body,
    BodyType? bodyType,
  }) async {
    try {
      // Handle GET requests - return from local database
      if (callType == ApiCallType.GET) {
        final localData = await _getFromLocal(
          callName,
          params,
          body: body,
          callType: callType,
        );
        if (localData != null) {
          return ApiCallResponse(
            localData,
            {},
            200,
          );
        } else {
          if (_shouldCacheCallForOffline(callName, callType)) {
            return ApiCallResponse([], {}, 200);
          }
          // Se não há dados locais e está offline, retornar resposta vazia apropriada
          // para evitar crash na página
          if (callName.contains('sprints_tasks') ||
              callName.contains('Query all sprints tasks')) {
            return ApiCallResponse(
              {
                'sprints_tasks_em_andamento': {
                  'items': [],
                  'pageTotal': 0,
                },
                'sprints_tasks_concluidas': {
                  'items': [],
                  'pageTotal': 0,
                },
                'sprints_tasks_sem_sucesso': {
                  'items': [],
                  'pageTotal': 0,
                },
                'sprints_tasks_inspecao': {
                  'items': [],
                  'pageTotal': 0,
                },
                'sprints_tasks_pendentes': {
                  'items': [],
                  'pageTotal': 0,
                },
              },
              {},
              200,
            );
          }
          if (callName.contains('Equipaments type') ||
              callName.contains('equipaments_types')) {
            return ApiCallResponse([], {}, 200);
          }
          if (callName.contains('sprints') ||
              callName.contains('Get sprint ativa')) {
            return ApiCallResponse(
              {
                'sprints_ativa': {
                  'items': [],
                },
                'sprints_concluida': {
                  'items': [],
                },
              },
              {},
              200,
            );
          }
          if (callName.contains('Lista membros de uma equipe') || callName.contains('membros') || callName.contains('teams_members')) {
            return ApiCallResponse(
              {'items': [], 'pageTotal': 0},
              {},
              200,
            );
          }
          if (callName.contains('lista colaboradores da escala do dia') || callName.contains('schedule')) {
            return ApiCallResponse(
              [],
              {},
              200,
            );
          }
        }
      }

      // Handle POST/PUT/PATCH - save to local and queue for sync
      if (callType == ApiCallType.POST ||
          callType == ApiCallType.PUT ||
          callType == ApiCallType.PATCH) {
        if (_shouldCacheCallForOffline(callName, callType)) {
          final localData = await _getFromLocal(
            callName,
            params,
            body: body,
            callType: callType,
          );
          if (localData != null) {
            return ApiCallResponse(localData, {}, 200);
          }
          return ApiCallResponse([], {}, 200);
        }

        if (callName.contains('Adiciona colaboradores na escala')) {
          final response = await _handleOfflineCreateSchedule(
            body: body,
            params: params,
          );
          _notifySavedOffline();
          return response;
        }

        if (callName.contains('Atualiza status da sprint task')) {
          final response = await _handleOfflineUpdateSprintTasks(
            body: body,
            params: params,
          );
          _notifySavedOffline();
          return response;
        }

        if (callName.contains('Update inspection')) {
          final response = await _handleOfflineUpdateInspection(
            callName: callName,
            apiUrl: apiUrl,
            callType: callType,
            headers: headers,
            params: params,
            body: body,
            bodyType: bodyType,
          );
          _notifySavedOffline();
          return response;
        }

        // Tratamento específico para Add comment
        if (callName.contains('Add comment') || apiUrl.contains('/task_comments')) {
          final bodyData = _decodeBodyData(body, params);
          var projectsBacklogsId = _asInt(bodyData['projects_backlogs_id']);
          final comment = bodyData['comment']?.toString();
          final subtasksId = _asInt(bodyData['subtasks_id']) ?? 0;
          final createdUserId = _asInt(bodyData['created_user_id']);
          
          // Se o projects_backlogs_id estiver null ou 0, tentar buscar do banco local
          if (projectsBacklogsId == null || projectsBacklogsId == 0) {
            // Estratégia 1: Buscar pelo comentário no mapa (mais confiável)
            if (comment != null && comment.isNotEmpty && _commentToTaskIdMap.containsKey(comment)) {
              projectsBacklogsId = _commentToTaskIdMap[comment];
              if (kDebugMode) {
                print('OfflineApiWrapper: Add comment - projects_backlogs_id do mapa de comentários: $projectsBacklogsId');
              }
            } else if (_recentTaskIds.isNotEmpty) {
              // Estratégia 2: Usar o último taskId processado
              projectsBacklogsId = _recentTaskIds.last;
              if (kDebugMode) {
                print('OfflineApiWrapper: Add comment - projects_backlogs_id do último task processado: $projectsBacklogsId');
              }
            } else {
              // Estratégia 3: Buscar tarefa mais recente com esse comentário exato no banco
              try {
                final db = await _dbHelper.database;
                
                if (comment != null && comment.isNotEmpty) {
                  final resultsByComment = await db.query(
                    'sprints_tasks',
                    columns: ['sprints_tasks_id'],
                    where: 'comment = ? AND sprints_tasks_id IS NOT NULL',
                    whereArgs: [comment],
                    orderBy: 'updated_at DESC',
                    limit: 1,
                  );
                  if (resultsByComment.isNotEmpty) {
                    projectsBacklogsId = _asInt(resultsByComment.first['sprints_tasks_id']);
                    if (kDebugMode && projectsBacklogsId != null) {
                      print('OfflineApiWrapper: Add comment - projects_backlogs_id encontrado pelo comentário no banco: $projectsBacklogsId');
                    }
                  }
                }
                
                // Estratégia 4: Se ainda não encontrou, buscar a tarefa mais recente atualizada
                if ((projectsBacklogsId == null || projectsBacklogsId == 0)) {
                  final resultsRecent = await db.query(
                    'sprints_tasks',
                    columns: ['sprints_tasks_id'],
                    where: 'sprints_tasks_id IS NOT NULL',
                    orderBy: 'updated_at DESC',
                    limit: 1,
                  );
                  if (resultsRecent.isNotEmpty) {
                    projectsBacklogsId = _asInt(resultsRecent.first['sprints_tasks_id']);
                    if (kDebugMode && projectsBacklogsId != null) {
                      print('OfflineApiWrapper: Add comment - projects_backlogs_id encontrado pela tarefa mais recente: $projectsBacklogsId');
                    }
                  }
                }
              } catch (e) {
                if (kDebugMode) {
                  print('OfflineApiWrapper: Erro ao buscar projects_backlogs_id do banco: $e');
                }
              }
            }
          }
          
          // Se ainda não tiver projects_backlogs_id válido, logar para debug
          if (projectsBacklogsId == null || projectsBacklogsId == 0) {
            if (kDebugMode) {
              print('OfflineApiWrapper: Add comment - ERRO: projects_backlogs_id está null ou 0. Body: $body');
              print('OfflineApiWrapper: Não foi possível encontrar o projects_backlogs_id no banco local.');
            }
            // Manter o body original - será rejeitado pelo backend se projects_backlogs_id for 0
          } else {
            // Garantir que o body tenha o projects_backlogs_id correto
            bodyData['projects_backlogs_id'] = projectsBacklogsId;
            body = json.encode(bodyData);
            if (kDebugMode) {
              print('OfflineApiWrapper: Add comment - Body corrigido com projects_backlogs_id: $projectsBacklogsId');
            }
          }
          
          await _queueGenericApiCall(
            callName: callName,
            apiUrl: apiUrl,
            callType: callType,
            headers: headers,
            params: params,
            body: body,
            bodyType: bodyType,
          );
          _notifySavedOffline();
          return ApiCallResponse(
            {'success': true, 'offline': true},
            {},
            200,
          );
        }

        if (callName.contains('Edita escala dos colaboradores') ||
            callName.contains('Edita schedule sprint tasks')) {
          final bodyData = _decodeBodyData(body, params);
          final scheduleId =
              _extractIdFromUrl(apiUrl) ?? _asInt(bodyData['schedule_id']);

          if (scheduleId != null) {
            if (callName.contains('Edita escala dos colaboradores')) {
              final usersRaw = (bodyData['users_id'] as List?)?.cast<dynamic>();
              if (usersRaw != null) {
                final usersId = usersRaw
                    .map(_asInt)
                    .whereType<int>()
                    .toList();
                await _scheduleDao.updateUsersIds(
                  scheduleId: scheduleId,
                  usersId: usersId,
                );
              }
            }

            if (callName.contains('Edita schedule sprint tasks')) {
              final tasksRaw =
                  (bodyData['sprints_tasks_id'] as List?)?.cast<dynamic>();
              if (tasksRaw != null) {
                await _scheduleDao.updateSprintsTasksIds(
                  scheduleId: scheduleId,
                  sprintsTasksId: tasksRaw,
                );
              }
            }
          }

          await _queueGenericApiCall(
            callName: callName,
            apiUrl: apiUrl,
            callType: callType,
            headers: headers,
            params: params,
            body: body,
            bodyType: bodyType,
          );
          _notifySavedOffline();
          return ApiCallResponse(
            {'success': true, 'offline': true},
            {},
            200,
          );
        }

        final operationType = callType == ApiCallType.POST
            ? SyncOperationType.create
            : SyncOperationType.update;

        Map<String, dynamic>? bodyData;
        if (body != null) {
          try {
            bodyData = json.decode(body) as Map<String, dynamic>;
          } catch (e) {
            if (kDebugMode) {
              print('OfflineApiWrapper: Error parsing body: $e');
            }
          }
        }

        if (bodyData != null) {
          if (operationType == SyncOperationType.create &&
              !bodyData.containsKey('client_id')) {
            bodyData['client_id'] = _newClientId();
          }
          final entityType = _getEntityTypeFromCallName(callName);
          final entityId = _asInt(bodyData['id']);

          if (entityType != 'unknown') {
            // Save to local database immediately
            await _saveToLocal(entityType, bodyData);

            // Add to sync queue
            await _enqueueWithDedupe(
              operationType: operationType,
              entityType: entityType,
              entityId: entityId,
              data: bodyData,
            );

            // Return success response
            _notifySavedOffline();
            return ApiCallResponse(
              {'success': true, 'message': 'Saved offline, will sync when online'},
              {},
              200,
            );
          }
        }

        // Fallback: enfileirar chamada genérica para sincronização
        await _queueGenericApiCall(
          callName: callName,
          apiUrl: apiUrl,
          callType: callType,
          headers: headers,
          params: params,
          body: body,
          bodyType: bodyType,
        );

        _notifySavedOffline();
        return ApiCallResponse(
          {'success': true, 'offline': true},
          {},
          200,
        );
      }

      // Handle DELETE
      if (callType == ApiCallType.DELETE) {
        final entityType = _getEntityTypeFromCallName(callName);
        final entityId = _asInt(params['id']);

        if (entityId != null) {
          // Delete from local database
          await _deleteFromLocal(entityType, entityId);

          // Add to sync queue
          await _enqueueWithDedupe(
            operationType: SyncOperationType.delete,
            entityType: entityType,
            entityId: entityId,
            data: {'id': entityId},
          );

          _notifySavedOffline();
          return ApiCallResponse(
            {'success': true, 'message': 'Deleted offline, will sync when online'},
            {},
            200,
          );
        }
      }

      // If we can't handle it offline, return error
      return ApiCallResponse(
        null,
        {},
        503,
        exception: 'Service unavailable - offline mode',
      );
    } catch (e) {
      if (kDebugMode) {
        print('OfflineApiWrapper: Error in offline handling: $e');
      }
      return ApiCallResponse(
        null,
        {},
        500,
        exception: e,
      );
    }
  }

  Future<ApiCallResponse> _handleOfflineCreateSchedule({
    required String? body,
    required Map<String, dynamic> params,
  }) async {
    final bodyData = _decodeBodyData(body, params);
    final now = DateTime.now().millisecondsSinceEpoch;
    final scheduleId = -now;
    final clientId = _newClientId();

    final usersId = (bodyData['users_id'] as List?)?.cast<dynamic>() ?? [];
    final scheduleDate = bodyData['schedule_date'] as String?;
    final teamsId = _asInt(bodyData['teams_id']);
    final projectsId = _asInt(bodyData['projects_id']);
    final sprintsId = _asInt(bodyData['sprints_id']);

    final schedule = ScheduleModel(
      id: scheduleId,
      scheduleId: scheduleId,
      clientId: clientId,
      teamsId: teamsId,
      projectsId: projectsId,
      sprintsId: sprintsId,
      scheduleDate: scheduleDate,
      usersId: json.encode(usersId),
      updatedAt: now ~/ 1000,
      createdAt: now ~/ 1000,
      syncedAt: null,
    );

    await _scheduleDao.insert(schedule);

    await _enqueueWithDedupe(
      operationType: SyncOperationType.create,
      entityType: 'schedules',
      entityId: scheduleId,
      data: {
        'id': scheduleId,
        'client_id': clientId,
        'schedule_id': scheduleId,
        'teams_id': teamsId,
        'projects_id': projectsId,
        'sprints_id': sprintsId,
        'schedule_date': scheduleDate,
        'users_id': usersId,
      },
    );

    return ApiCallResponse(
      {'id': scheduleId, 'schedule_id': scheduleId},
      {},
      200,
    );
  }

  Future<ApiCallResponse> _handleOfflineUpdateSprintTasks({
    required String? body,
    required Map<String, dynamic> params,
  }) async {
    if (kDebugMode) {
      print('OfflineApiWrapper: _handleOfflineUpdateSprintTasks - Body recebido: $body');
    }
    
    final bodyData = _decodeBodyData(body, params);
    final scheduleId = _asInt(bodyData['schedule_id']);
    final tasksList = (bodyData['tasks_list'] as List?)?.cast<dynamic>() ?? [];
    
    if (kDebugMode) {
      print('OfflineApiWrapper: scheduleId: $scheduleId, tasksList.length: ${tasksList.length}');
    }
    
    // DEBUG: Verificar se o comentário está presente no payload original
    if (kDebugMode) {
      for (int i = 0; i < tasksList.length; i++) {
        final item = tasksList[i];
        if (item is Map) {
          final taskId = _asInt(item['sprints_tasks_id'] ?? item['id']);
          final comment = item['comment']?.toString();
          print('OfflineApiWrapper: Task[$i] - taskId: $taskId, comment: ${comment ?? "NULL"}, comment type: ${comment.runtimeType}');
          if (item.containsKey('comment')) {
            print('OfflineApiWrapper: Task[$i] - comentário encontrado no payload: ${item['comment']}');
          } else {
            print('OfflineApiWrapper: Task[$i] - AVISO: comentário NÃO encontrado no payload');
          }
        }
      }
    }
    
    // Garantir que o tasksList seja uma lista de Maps com comentários preservados
    // O tasksList já vem como lista de Maps do body, mas precisamos garantir que o comentário esteja presente
    final tasksListMaps = <Map<String, dynamic>>[];
    for (final item in tasksList) {
      Map<String, dynamic> map;
      if (item is Map) {
        // Já é um Map, criar uma cópia
        map = Map<String, dynamic>.from(item);
        // Preservar explicitamente o comentário (mesmo que seja null ou vazio)
        if (map.containsKey('comment')) {
          map['comment'] = map['comment']?.toString();
        }
      } else {
        // Converter objeto para Map
        try {
          map = (item as dynamic).toMap() as Map<String, dynamic>;
          // Garantir que o comentário esteja presente
          if (map.containsKey('comment')) {
            map['comment'] = map['comment']?.toString();
          }
        } catch (e) {
          // Fallback manual
          map = {
            'sprints_tasks_id': (item as dynamic).sprintsTasksId,
            'sprints_tasks_statuses_id': (item as dynamic).sprintsTasksStatusesId,
            'quantity_done': (item as dynamic).quantityDone,
            'comment': (item as dynamic).comment?.toString(),
            if ((item as dynamic).subtasksId != null) 'subtasks_id': (item as dynamic).subtasksId,
            if ((item as dynamic).sucesso != null) 'sucesso': (item as dynamic).sucesso,
            if ((item as dynamic).check != null) 'check': (item as dynamic).check,
            if ((item as dynamic).checkField != null) 'check_field': (item as dynamic).checkField,
          };
        }
      }
      tasksListMaps.add(map);
    }

    final updates = <Map<String, dynamic>>[];
    final overridesToSave = <TaskStateOverrideModel>[];
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    for (final item in tasksListMaps) {
      if (item is! Map) continue;
      final statusId = _asInt(item['sprints_tasks_statuses_id']);
      int? checkField;
      int? sucesso;
      final hasStatus = item.containsKey('sprints_tasks_statuses_id');
      final hasSucesso = item.containsKey('sucesso');

      if (item.containsKey('check_field')) {
        checkField = _asBool(item['check_field']) ? 1 : 0;
      } else if (item.containsKey('check')) {
        checkField = _asBool(item['check']) ? 1 : 0;
      } else if (hasStatus || hasSucesso) {
        // Qualquer atualização de status/sucesso deve tirar da lista de "em andamento"
        checkField = 1;
      }

      if (item.containsKey('sucesso')) {
        sucesso = _asBool(item['sucesso']) ? 1 : 0;
      } else if (statusId == 0) {
        sucesso = 0;
      } else if (statusId == 3) {
        sucesso = 1;
      }
      final comment = item['comment']?.toString();
      final taskId = _asInt(item['sprints_tasks_id'] ?? item['id']);
      
      // IMPORTANTE: Armazenar o taskId e comentário para usar no addCommentCall
      if (taskId != null) {
        // Adicionar à lista de taskIds recentes (manter apenas os últimos 10)
        if (!_recentTaskIds.contains(taskId)) {
          _recentTaskIds.add(taskId);
          if (_recentTaskIds.length > 10) {
            _recentTaskIds.removeAt(0);
          }
        }
        // Associar comentário ao taskId se houver comentário
        if (comment != null && comment.isNotEmpty) {
          _commentToTaskIdMap[comment] = taskId;
          if (kDebugMode) {
            print('OfflineApiWrapper: Associado comentário "$comment" ao taskId $taskId');
          }
        }
      }
      
      // IMPORTANTE: Garantir que o sprints_tasks_id esteja presente no item
      if (taskId != null && !item.containsKey('sprints_tasks_id')) {
        item['sprints_tasks_id'] = taskId;
      }
      if (taskId != null && !item.containsKey('id')) {
        item['id'] = taskId;
      }
      
      // IMPORTANTE: Garantir que o projects_backlogs_id esteja presente no item
      // Quando online, o addCommentCall usa projectsBacklogsId: sprintsTasksId
      // Então o projects_backlogs_id deve ser o mesmo que sprints_tasks_id
      if (taskId != null && !item.containsKey('projects_backlogs_id')) {
        item['projects_backlogs_id'] = taskId;
      }
      
      // IMPORTANTE: Garantir que o comentário esteja no item do tasksListMaps ANTES de processar
      // Isso garante que o comentário seja incluído no payload da fila
      if (comment != null && comment.isNotEmpty) {
        item['comment'] = comment;
        if (kDebugMode && taskId != null) {
          print('OfflineApiWrapper: Comentário encontrado para task $taskId (projects_backlogs_id: ${item['projects_backlogs_id']}): $comment');
        }
      }
      
      updates.add({
        'sprints_tasks_id': taskId,
        'sprints_tasks_statuses_id': statusId,
        'quantity_done': _asDouble(item['quantity_done']),
        'check_field': checkField,
        'sucesso': sucesso,
        'comment': comment, // Sempre incluir o comentário, mesmo que seja null
      });
      
      // DEBUG: Log do que está sendo adicionado ao update
      if (kDebugMode && taskId != null) {
        print('OfflineApiWrapper: Adicionando update para task $taskId - comment: ${comment ?? "NULL"}');
      }
      
      // Se houver comentário, salvar no banco local usando o ID correto da tarefa
      if (taskId != null && comment != null && comment.isNotEmpty) {
        try {
          // Verificar se a tarefa existe no banco
          final existingTask = await _sprintTaskDao.findById(taskId);
          if (existingTask == null) {
            if (kDebugMode) {
              print('OfflineApiWrapper: AVISO - Tarefa $taskId não existe no banco. O comentário será salvo via updateStatusBatch.');
            }
            // A tarefa será atualizada via updateStatusBatch, que também salva o comentário
          } else {
            // Tarefa existe, salvar o comentário diretamente
            await _sprintTaskDao.updateTaskComment(
              taskId: taskId,
              comment: comment,
            );
            if (kDebugMode) {
              print('OfflineApiWrapper: Comentário salvo no banco local para task $taskId: $comment');
            }
          }
          // Garantir novamente que o comentário esteja no item do tasksListMaps
          item['comment'] = comment;
        } catch (e, stackTrace) {
          if (kDebugMode) {
            print('OfflineApiWrapper: Erro ao salvar comentário no banco para task $taskId: $e');
            print('OfflineApiWrapper: Stack trace: $stackTrace');
          }
        }
      } else {
        if (kDebugMode) {
          if (taskId == null) {
            print('OfflineApiWrapper: AVISO - taskId é null, não é possível salvar comentário');
          } else if (comment == null || comment.isEmpty) {
            print('OfflineApiWrapper: AVISO - comentário é null ou vazio para task $taskId');
          }
        }
      }
      if (taskId != null && checkField == 1) {
        final task = await _sprintTaskDao.findById(taskId);
        final inspection = (task?.inspection ?? false) ? 1 : 0;
        final statusGroup =
            (sucesso != null && sucesso == 0) ? 'sem_sucesso' : 'concluida';
        overridesToSave.add(TaskStateOverrideModel(
          sprintsTasksId: taskId,
          statusGroup: statusGroup,
          inspection: inspection,
          sucesso: sucesso,
          checkField: checkField,
          updatedAt: now,
        ));
      }
    }

    if (kDebugMode) {
      print('OfflineApiWrapper: Executando updateStatusBatch com ${updates.length} updates');
      for (final update in updates) {
        final taskId = update['sprints_tasks_id'];
        final comment = update['comment'];
        print('OfflineApiWrapper: Update para task $taskId - comment: ${comment ?? "NULL"}');
      }
    }
    
    await _sprintTaskDao.updateStatusBatch(updates);
    
    if (kDebugMode) {
      print('OfflineApiWrapper: updateStatusBatch concluído. Verificando se os comentários foram salvos...');
      // Verificar se os comentários foram salvos
      for (final update in updates) {
        final taskId = _asInt(update['sprints_tasks_id']);
        final comment = update['comment'] as String?;
        if (taskId != null && comment != null && comment.isNotEmpty) {
          try {
            final task = await _sprintTaskDao.findById(taskId);
            if (task != null) {
              print('OfflineApiWrapper: Task $taskId - comentário no banco: ${task.comment ?? "NULL"}');
              if (task.comment != comment) {
                print('OfflineApiWrapper: ERRO - Comentário não foi salvo corretamente! Esperado: "$comment", Encontrado: "${task.comment}"');
              } else {
                print('OfflineApiWrapper: OK - Comentário salvo corretamente para task $taskId');
              }
            } else {
              print('OfflineApiWrapper: ERRO - Task $taskId não encontrada no banco após updateStatusBatch');
            }
          } catch (e) {
            print('OfflineApiWrapper: Erro ao verificar comentário salvo para task $taskId: $e');
          }
        }
      }
    }
    
    for (final override in overridesToSave) {
      await _taskStateOverrideDao.upsert(override);
    }

    // Garantir que os comentários salvos no banco estejam no tasksListMaps antes de salvar na fila
    // IMPORTANTE: Associar o comentário ao ID correto da tarefa
    for (int i = 0; i < tasksListMaps.length; i++) {
      final map = tasksListMaps[i];
      final taskId = _asInt(map['sprints_tasks_id'] ?? map['id']);
      
      if (taskId == null) continue;
      
      // Garantir que o sprints_tasks_id esteja presente no Map
      if (!map.containsKey('sprints_tasks_id') || map['sprints_tasks_id'] == null) {
        map['sprints_tasks_id'] = taskId;
      }
      
      // Buscar comentário do banco local usando o ID correto da tarefa
      try {
        final task = await _sprintTaskDao.findById(taskId);
        if (task != null && task.comment != null && task.comment!.isNotEmpty) {
          // Sempre usar o comentário do banco local se existir
          map['comment'] = task.comment;
          if (kDebugMode) {
            print('OfflineApiWrapper: Comentário encontrado no banco para task $taskId: ${task.comment}');
          }
        } else {
          // Se não tiver no banco, verificar se está no Map original
          final commentValue = map['comment'];
          if (commentValue != null && commentValue.toString().isNotEmpty) {
            map['comment'] = commentValue.toString();
            if (kDebugMode) {
              print('OfflineApiWrapper: Comentário do Map original para task $taskId: ${commentValue}');
            }
          } else {
            // Remover comentário vazio/null para não enviar dados desnecessários
            map.remove('comment');
          }
        }
      } catch (e) {
        if (kDebugMode) {
          print('OfflineApiWrapper: Erro ao buscar comentário do banco para task $taskId: $e');
        }
        // Se der erro, manter o comentário do Map se existir
        final commentValue = map['comment'];
        if (commentValue != null && commentValue.toString().isNotEmpty) {
          map['comment'] = commentValue.toString();
        } else {
          map.remove('comment');
        }
      }
    }

    // DEBUG: Verificar se os comentários estão presentes antes de salvar na fila
    if (kDebugMode) {
      for (final map in tasksListMaps) {
        final taskId = _asInt(map['sprints_tasks_id'] ?? map['id']);
        final comment = map['comment']?.toString();
        if (taskId != null) {
          print('OfflineApiWrapper: Task $taskId - Comentário antes de salvar na fila: ${comment ?? "NULL"}');
        }
      }
    }

    await _enqueueWithDedupe(
      operationType: SyncOperationType.update,
      entityType: 'sprints_tasks',
      entityId: scheduleId,
      data: {
        'schedule_id': scheduleId,
        'tasks_list': tasksListMaps,
      },
    );

    return ApiCallResponse(
      {'success': true, 'offline': true},
      {},
      200,
    );
  }

  Future<ApiCallResponse> _handleOfflineUpdateInspection({
    required String callName,
    required String apiUrl,
    required ApiCallType callType,
    required Map<String, dynamic> headers,
    required Map<String, dynamic> params,
    required String? body,
    required BodyType? bodyType,
  }) async {
    final bodyData = _decodeBodyData(body, params);
    final taskId = _asInt(bodyData['sprints_tasks_id']);
    final qualityStatusId = _asInt(bodyData['quality_status_id']);
    final comment = bodyData['comment']?.toString();

    if (taskId != null) {
      int? sucesso;
      if (qualityStatusId == 2) {
        sucesso = 1;
      } else if (qualityStatusId == 3) {
        sucesso = 0;
      }

      await _sprintTaskDao.updateInspectionStatus(
        taskId: taskId,
        checkField: 1,
        sucesso: sucesso,
        comment: comment,
        statusId: qualityStatusId,
        checkTasks: 1,
      );

      final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      await _taskStateOverrideDao.upsert(TaskStateOverrideModel(
        sprintsTasksId: taskId,
        statusGroup: sucesso == 0 ? 'sem_sucesso' : 'concluida',
        inspection: 1,
        sucesso: sucesso,
        checkField: 1,
        checkTasks: 1,
        updatedAt: now,
      ));
    }

    await _queueGenericApiCall(
      callName: callName,
      apiUrl: apiUrl,
      callType: callType,
      headers: headers,
      params: params,
      body: body,
      bodyType: bodyType,
    );

    return ApiCallResponse(
      {'success': true, 'offline': true},
      {},
      200,
    );
  }

  Future<void> _queueGenericApiCall({
    required String callName,
    required String apiUrl,
    required ApiCallType callType,
    required Map<String, dynamic> headers,
    required Map<String, dynamic> params,
    required String? body,
    required BodyType? bodyType,
  }) async {
    String? clientId;
    if (apiUrl.contains('/schedule/')) {
      final lastSegment = apiUrl.split('/').last;
      final scheduleId = int.tryParse(lastSegment);
      if (scheduleId != null) {
        final schedule = await _scheduleDao.findById(scheduleId);
        clientId = schedule?.clientId;
      }
    }
    
    // Tratamento especial para Add comment - garantir que projects_backlogs_id esteja correto
    String? correctedBody = body;
    if ((callName.contains('Add comment') || apiUrl.contains('/task_comments')) && body != null) {
      try {
        final bodyData = json.decode(body) as Map<String, dynamic>;
        final projectsBacklogsId = _asInt(bodyData['projects_backlogs_id']);
        final comment = bodyData['comment']?.toString();
        
        // Se projects_backlogs_id estiver null ou 0, tentar corrigir
        if ((projectsBacklogsId == null || projectsBacklogsId == 0) && comment != null && comment.isNotEmpty) {
          // Tentar buscar o sprints_tasks_id do banco local baseado no comentário
          // Ou usar o último taskId processado se disponível
          // Por enquanto, vamos preservar o body original e adicionar um log
          if (kDebugMode) {
            print('OfflineApiWrapper: Add comment - projects_backlogs_id está null ou 0. Body original: $body');
          }
          // O body será preservado como está, mas quando sincronizar, o backend pode rejeitar
          // Se necessário, podemos tentar buscar do contexto ou do último task processado
        } else if (projectsBacklogsId != null && projectsBacklogsId > 0) {
          // Garantir que o body tenha o projects_backlogs_id correto
          bodyData['projects_backlogs_id'] = projectsBacklogsId;
          correctedBody = json.encode(bodyData);
          if (kDebugMode) {
            print('OfflineApiWrapper: Add comment - projects_backlogs_id corrigido: $projectsBacklogsId');
          }
        }
      } catch (e) {
        if (kDebugMode) {
          print('OfflineApiWrapper: Erro ao processar body do Add comment: $e');
        }
        // Manter body original se houver erro
      }
    }
    
    await _enqueueWithDedupe(
      operationType: callType == ApiCallType.POST
          ? SyncOperationType.create
          : SyncOperationType.update,
      entityType: 'api_call',
      entityId: null,
      data: {
        'call_name': callName,
        'api_url': apiUrl,
        'call_type': callType.name,
        'headers': headers,
        'params': _serializeParamsForQueue(params),
        'body': correctedBody,
        'body_type': bodyType?.name,
        if (clientId != null) 'client_id': clientId,
      },
    );
  }

  String _newOperationId() => _uuid.v4();
  String _newClientId() => _uuid.v4();

  Future<void> _enqueueWithDedupe({
    required SyncOperationType operationType,
    required String entityType,
    required int? entityId,
    required Map<String, dynamic> data,
  }) async {
    if (operationType == SyncOperationType.update ||
        operationType == SyncOperationType.delete) {
      final localVersion = await _resolveLocalVersionForEntity(
        entityType,
        entityId,
        data,
      );
      if (localVersion != null && !data.containsKey('local_version')) {
        data['local_version'] = localVersion;
      }
    }
    final dataJson = json.encode(data);
    final existing = await _syncQueueDao.findEquivalent(
      operationType: operationType,
      entityType: entityType,
      entityId: entityId,
      data: dataJson,
    );
    if (existing != null) {
      return;
    }
    await _syncService.addToSyncQueue(
      operationType: operationType,
      entityType: entityType,
      entityId: entityId,
      data: data,
      operationId: _newOperationId(),
    );
  }

  void _notifySavedOffline() {
    _syncService.notifyUserMessage(
      const SyncUserMessage(
        type: SyncUserMessageType.savedOffline,
        message: 'Salvo localmente. Será sincronizado.',
      ),
    );
  }

  Future<String?> _resolveLocalVersionForEntity(
    String entityType,
    int? entityId,
    Map<String, dynamic> data,
  ) async {
    final direct = _extractLocalVersionFromData(data);
    if (direct != null) {
      return direct;
    }
    if (entityId == null) {
      return null;
    }
    try {
      switch (entityType) {
        case 'sprints':
          final sprint = await _sprintDao.findById(entityId);
          return _intToVersion(sprint?.updatedAt ?? sprint?.syncedAt);
        case 'schedules':
          final schedule = await _scheduleDao.findById(entityId);
          return _intToVersion(schedule?.updatedAt ?? schedule?.syncedAt);
        case 'sprints_tasks':
          final task = await _sprintTaskDao.findById(entityId);
          return _intToVersion(task?.updatedAt ?? task?.syncedAt);
      }
    } catch (_) {}
    return null;
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

  String? _intToVersion(int? value) {
    if (value == null) return null;
    return value.toString();
  }

  Map<String, dynamic> _decodeBodyData(
    String? body,
    Map<String, dynamic> params,
  ) {
    if (body != null && body.isNotEmpty) {
      try {
        final decoded = json.decode(body);
        if (decoded is Map<String, dynamic>) {
          return decoded;
        }
      } catch (_) {}
    }
    return params;
  }

  Map<String, dynamic> _serializeParamsForQueue(Map<String, dynamic> params) {
    return params.map((key, value) => MapEntry(key, _serializeValue(value)));
  }

  dynamic _serializeValue(dynamic value) {
    if (value is UploadedFile) {
      return {'__ff_uploaded_file__': value.serialize()};
    }
    if (value is List) {
      return value.map(_serializeValue).toList();
    }
    if (value is Map) {
      return value.map(
        (key, val) => MapEntry(key.toString(), _serializeValue(val)),
      );
    }
    return value;
  }

  /// Get data from local database based on call name
  Future<dynamic> _getFromLocal(
    String callName,
    Map<String, dynamic> params, {
    String? body,
    ApiCallType? callType,
  }) async {
    try {
      if (_shouldCacheCallForOffline(callName, callType ?? ApiCallType.GET)) {
        final cacheKey = _buildCacheKey(
          callName: callName,
          params: params,
          body: body,
        );
        final cached = await _apiCacheDao.findByKey(cacheKey);
        if (cached != null) {
          return json.decode(cached.responseJson);
        }
      }
      if (callName.contains('sprints_tasks') || callName.contains('Query all sprints tasks')) {
        final sprintsId = _normalizeId(params['sprints_id']);
        final projectsId = _normalizeId(params['projects_id']);
        final teamsId = _normalizeId(params['teams_id']);
        final equipamentsTypesId = _normalizeId(params['equipaments_types_id']);
        final perPage = _asInt(params['per_page']) ?? 15;
        final page = _asInt(params['page']) ?? 1;
        final offset = (page - 1) * perPage;

        if (kDebugMode) {
          final total = await _sprintTaskDao.count();
          print('OfflineApiWrapper: Total de tarefas no banco local (offline): $total');
          print(
              'OfflineApiWrapper: Filtros tarefas offline - sprintsId=$sprintsId projectsId=$projectsId teamsId=$teamsId equipamentsTypesId=$equipamentsTypesId search=${params['search']} perPage=$perPage offset=$offset');
        }

        var allTasks = await _sprintTaskDao.findAll(
          sprintsId: sprintsId,
          projectsId: projectsId,
          teamsId: teamsId,
          equipamentsTypesId: equipamentsTypesId,
          search: params['search'] as String?,
        );

        // Se não encontrou tarefas com os filtros específicos, tentar buscar apenas com sprintsId, projectsId e teamsId
        // Isso garante que mesmo que os filtros sejam diferentes, os dados sejam encontrados
        if (allTasks.isEmpty && (equipamentsTypesId != null && equipamentsTypesId != 0)) {
          if (kDebugMode) {
            print('OfflineApiWrapper: Nenhuma tarefa encontrada com filtros específicos, tentando buscar sem filtros adicionais');
          }
          allTasks = await _sprintTaskDao.findAll(
            sprintsId: sprintsId,
            projectsId: projectsId,
            teamsId: teamsId,
            equipamentsTypesId: null,
            search: params['search'] as String?,
          );
          if (kDebugMode) {
            print('OfflineApiWrapper: Encontradas ${allTasks.length} tarefas sem filtros adicionais');
          }
        }

        // Paginar por grupo para manter o comportamento do online
        List<SprintTaskModel> _paginate(List<SprintTaskModel> list) {
          if (list.isEmpty) return list;
          return list.skip(offset).take(perPage).toList();
        }

        int _pageTotal(int total) {
          if (total == 0) return 0;
          return (total / perPage).ceil();
        }

        bool _isDone(SprintTaskModel t) =>
            t.check ||
            t.checkTasks ||
            (t.sprintsTasksStatusesId != null &&
                t.sprintsTasksStatusesId != 0);

        final taskIds = allTasks
            .map((t) => t.sprintsTasksId)
            .whereType<int>()
            .toList();
        final overrides = await _taskStateOverrideDao.findByTaskIds(taskIds);
        final overrideMap = {
          for (final override in overrides) override.sprintsTasksId: override
        };

        String _resolveGroup(SprintTaskModel task) {
          final override = overrideMap[task.sprintsTasksId];
          if (override != null) {
            return override.statusGroup;
          }
          if (!_isDone(task)) {
            return 'andamento';
          }
          return task.sucesso ? 'concluida' : 'sem_sucesso';
        }

        bool _resolveInspection(SprintTaskModel task) {
          final override = overrideMap[task.sprintsTasksId];
          if (override?.inspection != null) {
            return override!.inspection == 1;
          }
          return task.inspection;
        }

        final noInspectionEmAndamento = allTasks
            .where((t) =>
                !_resolveInspection(t) && _resolveGroup(t) == 'andamento')
            .toList();
        final noInspectionConcluidas = allTasks
            .where((t) =>
                !_resolveInspection(t) && _resolveGroup(t) == 'concluida')
            .toList();
        final noInspectionSemSucesso = allTasks
            .where((t) =>
                !_resolveInspection(t) && _resolveGroup(t) == 'sem_sucesso')
            .toList();

        final inspectionEmAndamento = allTasks
            .where((t) =>
                _resolveInspection(t) && _resolveGroup(t) == 'andamento')
            .toList();
        final inspectionConcluidas = allTasks
            .where((t) =>
                _resolveInspection(t) && _resolveGroup(t) != 'andamento')
            .toList();

        Map<String, dynamic> _taskToMapWithOverride(SprintTaskModel task) {
          final override = overrideMap[task.sprintsTasksId];
          if (override == null) {
            return _taskToMap(task);
          }
          final base = _taskToMap(task);
          if (override.checkField != null) {
            base['check_field'] = override.checkField;
            base['check'] = override.checkField == 1;
          }
          if (override.checkTasks != null) {
            base['check_tasks'] = override.checkTasks;
            base['checkTasks'] = override.checkTasks == 1;
          }
          if (override.sucesso != null) {
            base['sucesso'] = override.sucesso == 1;
          }
          return base;
        }

        // Convert to API response format (estrutura flat do Painel)
        final allInspection = [...inspectionEmAndamento, ...inspectionConcluidas];
        return {
          'sprints_tasks_em_andamento': {
            'items': _paginate(noInspectionEmAndamento)
                .map(_taskToMapWithOverride)
                .toList(),
            'pageTotal': _pageTotal(noInspectionEmAndamento.length),
          },
          'sprints_tasks_concluidas': {
            'items': _paginate(noInspectionConcluidas)
                .map(_taskToMapWithOverride)
                .toList(),
            'pageTotal': _pageTotal(noInspectionConcluidas.length),
          },
          'sprints_tasks_sem_sucesso': {
            'items': _paginate(noInspectionSemSucesso)
                .map(_taskToMapWithOverride)
                .toList(),
            'pageTotal': _pageTotal(noInspectionSemSucesso.length),
          },
          'sprints_tasks_inspecao': {
            'items': _paginate(allInspection)
                .map(_taskToMapWithOverride)
                .toList(),
            'pageTotal': _pageTotal(allInspection.length),
          },
          'sprints_tasks_pendentes': {
            'items': [],
            'pageTotal': 0,
          },
        };
      }

      if (callName.contains('Equipaments type') ||
          callName.contains('equipaments_types')) {
        final items = await _equipamentsTypeDao.findAll();
        return items
            .map((item) => {
                  'id': item.equipamentsTypeId ?? item.id,
                  'type': item.type,
                })
            .toList();
      }

      if (callName.contains('sprints') || callName.contains('Get sprint ativa')) {
        final projectsId = _normalizeId(params['projects_id']);
        final sprints = await _sprintDao.findAll(
          projectsId: projectsId,
          dtStart: _asInt(params['dt_start']),
          dtEnd: _asInt(params['dt_end']),
        );

        return {
          'sprints_ativa': {
            'items': sprints.map((s) => _sprintToMap(s)).toList(),
          },
          'sprints_concluida': {
            'items': [],
          },
        };
      }

      if (callName.contains('schedule')) {
        final isTodayCall =
            callName.contains('lista colaboradores da escala do dia');
        final todayDate = DateTime.now().toIso8601String().split('T').first;
        final projectsId = _normalizeId(params['projects_id']);
        final teamsId = _normalizeId(params['teams_id']);
        final sprintsId = _normalizeId(params['sprints_id']);
        final schedules = await _scheduleDao.findAll(
          projectsId: projectsId,
          teamsId: teamsId,
          sprintsId: sprintsId,
          scheduleDate:
              isTodayCall ? todayDate : params['schedule_date'] as String?,
        );

        final uniqueById = <int, ScheduleModel>{};
        final withoutId = <ScheduleModel>[];
        for (final schedule in schedules) {
          final key = schedule.scheduleId ?? schedule.id;
          if (key != null) {
            uniqueById[key] = schedule;
          } else {
            withoutId.add(schedule);
          }
        }

        return [
          ...uniqueById.values.map((s) => _scheduleToMap(s)),
          ...withoutId.map((s) => _scheduleToMap(s)),
        ];
      }

      // Suporte para lista de membros da equipe
      if (callName.contains('Lista membros de uma equipe') || callName.contains('membros') || callName.contains('teams_members')) {
        final teamsId = _normalizeId(params['teams_id']);
        final users = await _userDao.findAll(
          teamsId: teamsId,
          search: params['search'] as String?,
          limit: _asInt(params['per_page']),
          offset: params['page'] != null
              ? ((_asInt(params['page']) ?? 1) - 1) * (_asInt(params['per_page']) ?? 10)
              : null,
        );

        // Converter para formato da API (deduplicar por user_id)
        final uniqueUsers = <int, UserModel>{};
        final withoutId = <UserModel>[];
        for (final user in users) {
          if (user.userId != null) {
            uniqueUsers[user.userId!] = user;
          } else {
            withoutId.add(user);
          }
        }
        final items = [
          ...uniqueUsers.values,
          ...withoutId,
        ].map((user) => <String, dynamic>{
          'user': <String, dynamic>{
            'id': user.userId,
            'name': user.name,
            'email': user.email,
            'phone': user.phone,
            'profile_picture': user.image != null ? <String, dynamic>{'url': user.image} : null,
            'users_permissions': <String, dynamic>{
              'users_roles': <String, dynamic>{
                'role': 'Colaborador', // Valor padrão, pode ser ajustado se necessário
              },
            },
          },
        }).toList();

        // Calcular total de páginas (simplificado para offline)
        final totalUsers = await _userDao.findAll(
          teamsId: teamsId,
          search: params['search'] as String?,
        );
        final perPage = _asInt(params['per_page']) ?? 10;
        final pageTotal = (totalUsers.length / perPage).ceil();

        return {
          'items': items,
          'pageTotal': pageTotal > 0 ? pageTotal : 1,
        };
      }

      return null;
    } catch (e) {
      if (kDebugMode) {
        print('OfflineApiWrapper: Error getting from local: $e');
      }
      return null;
    }
  }

  /// Save response data to local database
  Future<void> _saveResponseToLocal(
    String callName,
    dynamic jsonBody, {
    required ApiCallType callType,
    Map<String, dynamic>? params,
    String? body,
  }) async {
    try {
      if (jsonBody == null) return;

      // Converter jsonBody para Map se necessário
      dynamic jsonData = jsonBody;
      if (jsonBody is String) {
        jsonData = json.decode(jsonBody);
      }

      if (_shouldCacheCallForOffline(callName, callType)) {
        try {
          final cacheKey = _buildCacheKey(
            callName: callName,
            params: params ?? const {},
            body: body,
          );
          final cacheItem = ApiCacheModel(
            cacheKey: cacheKey,
            responseJson: json.encode(jsonData),
            updatedAt: DateTime.now().millisecondsSinceEpoch ~/ 1000,
          );
          await _apiCacheDao.upsert(cacheItem);
        } catch (e) {
          if (kDebugMode) {
            print('OfflineApiWrapper: Erro ao salvar cache de filtros: $e');
          }
        }
      }

      // Salvar sprints_tasks quando online
      if (callName.contains('sprints_tasks') || callName.contains('Query all sprints tasks')) {
        try {
          final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
          final tasksToSave = <SprintTaskModel>[];
          final rootData = (jsonData is Map && jsonData['data'] != null)
              ? jsonData['data']
              : jsonData;

          final fallbackSprintsId = _normalizeId(
                params != null ? params['sprints_id'] : null,
              ) ??
              _normalizeId(AppState().user.sprint.id);
          final fallbackProjectsId = _normalizeId(
                params != null ? params['projects_id'] : null,
              ) ??
              _normalizeId(AppState().user.projectId);
          final fallbackTeamsId = _normalizeId(
                params != null ? params['teams_id'] : null,
              ) ??
              _normalizeId(AppState().user.teamsId);

          // Processar categorias flat do Painel
          void _processCategory(String jsonPath) {
            final items = getJsonField(rootData, jsonPath, true) as List?;
            if (items != null) {
              for (final item in items) {
                final task = _parseTaskFromApi(
                  item,
                  fallbackSprintsId: fallbackSprintsId,
                  fallbackProjectsId: fallbackProjectsId,
                  fallbackTeamsId: fallbackTeamsId,
                );
                if (task != null) {
                  tasksToSave.add(task.copyWith(
                    updatedAt: now,
                    syncedAt: now,
                  ));
                }
              }
            }
          }

          _processCategory(r'''$.sprints_tasks_em_andamento.items''');
          _processCategory(r'''$.sprints_tasks_concluidas.items''');
          _processCategory(r'''$.sprints_tasks_sem_sucesso.items''');
          _processCategory(r'''$.sprints_tasks_inspecao.items''');
          _processCategory(r'''$.sprints_tasks_pendentes.items''');

          // Fallback: tentar ler listas diretas caso o payload seja diferente
          if (tasksToSave.isEmpty) {
            final directItems =
                getJsonField(rootData, r'''$.items''', true) as List?;
            if (directItems != null) {
              for (final item in directItems) {
                final task = _parseTaskFromApi(
                  item,
                  fallbackSprintsId: fallbackSprintsId,
                  fallbackProjectsId: fallbackProjectsId,
                  fallbackTeamsId: fallbackTeamsId,
                );
                if (task != null) {
                  tasksToSave.add(task.copyWith(
                    updatedAt: now,
                    syncedAt: now,
                  ));
                }
              }
            }
          }

          if (tasksToSave.isEmpty && rootData is List) {
            for (final item in rootData) {
              final task = _parseTaskFromApi(
                item,
                fallbackSprintsId: fallbackSprintsId,
                fallbackProjectsId: fallbackProjectsId,
                fallbackTeamsId: fallbackTeamsId,
              );
              if (task != null) {
                tasksToSave.add(task.copyWith(
                  updatedAt: now,
                  syncedAt: now,
                ));
              }
            }
          }

          if (tasksToSave.isNotEmpty) {
            await _sprintTaskDao.insertOrUpdateBatch(tasksToSave);
            final taskIds = tasksToSave
                .map((task) => _asInt(task.sprintsTasksId))
                .whereType<int>()
                .toList();
            await _sprintTaskDao.fillMissingContext(
              taskIds: taskIds,
              sprintsId: fallbackSprintsId,
              projectsId: fallbackProjectsId,
              teamsId: fallbackTeamsId,
            );
            await _taskStateOverrideDao.deleteByTaskIds(taskIds);
            if (kDebugMode) {
              print('OfflineApiWrapper: Salvos ${tasksToSave.length} tarefas no banco local');
              final total = await _sprintTaskDao.count();
              print('OfflineApiWrapper: Total de tarefas no banco local: $total');
            }
          } else if (kDebugMode) {
            print('OfflineApiWrapper: Nenhuma tarefa encontrada para salvar');
          }
        } catch (e) {
          if (kDebugMode) {
            print('OfflineApiWrapper: Erro ao salvar sprints_tasks: $e');
          }
        }
      }

      // Salvar sprints quando online
      if (callName.contains('sprints') && callName.contains('Get sprint ativa')) {
        try {
          final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
          final sprintsToSave = <SprintModel>[];

          final sprintsAtiva = getJsonField(jsonData, r'''$.sprints_ativa.items''', true) as List?;
          if (sprintsAtiva != null) {
            for (final item in sprintsAtiva) {
              final sprintId = _asInt(getJsonField(item, r'''$.id'''));
              final sprint = SprintModel(
                id: sprintId,
                sprintId: sprintId,
                title: getJsonField(item, r'''$.title''')?.toString(),
                objective: getJsonField(item, r'''$.objective''')?.toString(),
                startDate: _asInt(getJsonField(item, r'''$.start_date''')),
                endDate: _asInt(getJsonField(item, r'''$.end_date''')),
                progressPercentage:
                    _asDouble(getJsonField(item, r'''$.progress_percentage''')),
                projectsId: _asInt(getJsonField(item, r'''$.projects_id''')),
                sprintsStatusesId:
                    _asInt(getJsonField(item, r'''$.sprints_statuses_id''')),
                updatedAt: now,
                createdAt: _asInt(getJsonField(item, r'''$.created_at''')) ?? now,
                syncedAt: now,
              );
              sprintsToSave.add(sprint);
            }
          }

          if (sprintsToSave.isNotEmpty) {
            await _sprintDao.insertOrUpdateBatch(sprintsToSave);
            if (kDebugMode) {
              print('OfflineApiWrapper: Salvos ${sprintsToSave.length} sprints no banco local');
            }
          }
        } catch (e) {
          if (kDebugMode) {
            print('OfflineApiWrapper: Erro ao salvar sprints: $e');
          }
        }
      }

      if (callName.contains('Equipaments type') ||
          callName.contains('equipaments_types')) {
        try {
          final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
          final items = getJsonField(jsonData, r'''$''', true) as List?;
          if (items != null) {
            for (final item in items) {
              final id = _asInt(getJsonField(item, r'''$.id'''));
              final model = EquipamentsTypeModel(
                id: id,
                equipamentsTypeId: id,
                type: getJsonField(item, r'''$.type''')?.toString(),
                updatedAt: now,
                createdAt: now,
                syncedAt: now,
              );
              if (id != null) {
                await _equipamentsTypeDao.delete(id);
              }
              await _equipamentsTypeDao.insert(model);
            }
          }
        } catch (e) {
          if (kDebugMode) {
            print('OfflineApiWrapper: Erro ao salvar equipaments_types: $e');
          }
        }
      }

      if (callName.contains('lista colaboradores da escala do dia') ||
          callName.contains('Adiciona colaboradores na escala') ||
          callName.contains('schedule')) {
        try {
          final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
          final schedulesToSave = <ScheduleModel>[];

          dynamic jsonData = jsonBody;
          if (jsonBody is String) {
            jsonData = json.decode(jsonBody);
          }

          if (jsonData is List) {
            for (final item in jsonData) {
              final schedule = _parseScheduleFromApi(item);
              if (schedule != null) {
                schedulesToSave.add(schedule.copyWith(
                  updatedAt: now,
                  createdAt: now,
                  syncedAt: now,
                ));
              }
            }
          } else if (jsonData is Map) {
            final items = getJsonField(jsonData, r'''$.items''', true) as List?;
            if (items != null) {
              for (final item in items) {
                final schedule = _parseScheduleFromApi(item);
                if (schedule != null) {
                  schedulesToSave.add(schedule.copyWith(
                    updatedAt: now,
                    createdAt: now,
                    syncedAt: now,
                  ));
                }
              }
            } else {
              final schedule = _parseScheduleFromApi(jsonData);
              if (schedule != null) {
                schedulesToSave.add(schedule.copyWith(
                  updatedAt: now,
                  createdAt: now,
                  syncedAt: now,
                ));
              }
            }
          }

          if (schedulesToSave.isNotEmpty) {
            for (final schedule in schedulesToSave) {
              if (schedule.scheduleId != null) {
                await _scheduleDao.delete(schedule.scheduleId!);
              }
              await _scheduleDao.insert(schedule);
            }
            if (kDebugMode) {
              print('OfflineApiWrapper: Salvas ${schedulesToSave.length} escalas no banco local');
            }
          }
        } catch (e) {
          if (kDebugMode) {
            print('OfflineApiWrapper: Erro ao salvar escalas: $e');
          }
        }
      }

      // Salvar membros da equipe quando online
      if (callName.contains('Lista membros de uma equipe') || callName.contains('membros') || callName.contains('teams_members')) {
        try {
          // jsonBody pode ser String ou Map
          dynamic jsonData = jsonBody;
          if (jsonBody is String) {
            jsonData = json.decode(jsonBody);
          }
          
          final items = getJsonField(jsonData, r'''$.items''', true) as List?;
          if (items != null) {
            final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
            final usersToSave = <UserModel>[];

            for (final item in items) {
              final userData = getJsonField(item, r'''$.user''');
              if (userData != null) {
                final profilePicture = getJsonField(userData, r'''$.profile_picture.url''')?.toString();
                
                final user = UserModel(
                  id: _asInt(getJsonField(userData, r'''$.id''')),
                  userId: _asInt(getJsonField(userData, r'''$.id''')),
                  name: getJsonField(userData, r'''$.name''')?.toString(),
                  email: getJsonField(userData, r'''$.email''')?.toString(),
                  phone: getJsonField(userData, r'''$.phone''')?.toString(),
                  image: profilePicture,
                  teamsId: _asInt(getJsonField(item, r'''$.teams_id''')),
                  updatedAt: now,
                  createdAt: now,
                  syncedAt: now,
                );
                usersToSave.add(user);
              }
            }

            if (usersToSave.isNotEmpty) {
              await _userDao.insertOrUpdateBatch(usersToSave);
              if (kDebugMode) {
                print('OfflineApiWrapper: Salvos ${usersToSave.length} membros da equipe no banco local');
              }
            }
          }
        } catch (e) {
          if (kDebugMode) {
            print('OfflineApiWrapper: Erro ao salvar membros da equipe: $e');
          }
        }
      }
    } catch (e) {
      if (kDebugMode) {
        print('OfflineApiWrapper: Error saving to local: $e');
      }
    }
  }

  /// Save data to local database
  Future<void> _saveToLocal(String entityType, Map<String, dynamic> data) async {
    try {
      final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;

      switch (entityType) {
        case 'sprints_tasks':
          final task = SprintTaskModel.fromMap(data);
          await _sprintTaskDao.insert(task.copyWith(
            updatedAt: now,
            syncedAt: null, // Not synced yet
          ));
          break;

        case 'sprints':
          final sprint = SprintModel.fromMap(data);
          await _sprintDao.insert(sprint.copyWith(
            updatedAt: now,
            syncedAt: null,
          ));
          break;

        case 'schedules':
          final schedule = ScheduleModel.fromMap(data);
          await _scheduleDao.insert(schedule.copyWith(
            updatedAt: now,
            syncedAt: null,
          ));
          break;
      }
    } catch (e) {
      if (kDebugMode) {
        print('OfflineApiWrapper: Error saving to local: $e');
      }
    }
  }

  /// Delete from local database
  Future<void> _deleteFromLocal(String entityType, int entityId) async {
    try {
      switch (entityType) {
        case 'sprints_tasks':
          await _sprintTaskDao.delete(entityId);
          break;

        case 'sprints':
          await _sprintDao.delete(entityId);
          break;

        case 'schedules':
          await _scheduleDao.delete(entityId);
          break;
      }
    } catch (e) {
      if (kDebugMode) {
        print('OfflineApiWrapper: Error deleting from local: $e');
      }
    }
  }

  /// Get entity type from API call name
  String _getEntityTypeFromCallName(String callName) {
    final name = callName.toLowerCase();
    if (name.contains('sprints_tasks') ||
        name.contains('sprint task') ||
        name.contains('atualiza status da sprint task')) {
      return 'sprints_tasks';
    }
    if (name.contains('add comment') || name.contains('task_comments')) {
      return 'task_comments';
    }
    if (name.contains('inspection')) {
      return 'inspections';
    }
    if (name.contains('schedule') || name.contains('escala')) {
      return 'schedules';
    }
    if (name.contains('sprint')) {
      return 'sprints';
    }
    return 'unknown';
  }

  /// Convert task model to API response format
  Map<String, dynamic> _taskToMap(SprintTaskModel task) {
    final projectsBacklogs = _decodeJsonMap(task.projectsBacklogsJson);
    final subtasks = _decodeJsonMap(task.subtasksJson);
    return {
      'sprints_tasks_id': task.sprintsTasksId,
      'id': task.sprintsTasksId,
      'sprints_id': task.sprintsId,
      'projects_id': task.projectsId,
      'teams_id': task.teamsId,
      'description': task.description,
      'sprints_tasks_statuses_id': task.sprintsTasksStatusesId,
      'subtasks_id': task.subtasksId,
      'unity_id': task.unityId,
      'unity': task.unity != null ? {'id': task.unityId, 'unity': task.unity} : null,
      'quantity_done': task.quantityDone,
      'check': task.check,
      'check_field': task.check ? 1 : 0,
      'sucesso': task.sucesso,
      'inspection': task.inspection,
      'can_conclude': task.canConclude,
      'comment': task.comment,
      'first_comment': task.firstComment,
      'checkTasks': task.checkTasks,
      'check_tasks': task.checkTasks ? 1 : 0,
      'projects_backlogs': projectsBacklogs ??
          {
            'equipaments_types_id': task.equipamentsTypesId,
          },
      'subtasks': subtasks ?? <String, dynamic>{},
    };
  }

  /// Convert sprint model to API response format
  Map<String, dynamic> _sprintToMap(SprintModel sprint) {
    return {
      'id': sprint.sprintId,
      'title': sprint.title,
      'objective': sprint.objective,
      'start_date': sprint.startDate,
      'end_date': sprint.endDate,
      'progress_percentage': sprint.progressPercentage,
    };
  }

  /// Convert schedule model to API response format
  Map<String, dynamic> _scheduleToMap(ScheduleModel schedule) {
    return {
      'id': schedule.scheduleId ?? schedule.id,
      'schedule_id': schedule.scheduleId ?? schedule.id,
      'teams_id': schedule.teamsId,
      'projects_id': schedule.projectsId,
      'sprints_id': schedule.sprintsId,
      'schedule_date': schedule.scheduleDate,
      'users_id': schedule.usersId != null ? json.decode(schedule.usersId!) : null,
      'sprints_tasks_id': schedule.sprintsTasksId != null ? json.decode(schedule.sprintsTasksId!) : null,
    };
  }

  /// Parse schedule from API response format
  ScheduleModel? _parseScheduleFromApi(dynamic item) {
    try {
      final scheduleId =
          _asInt(getJsonField(item, r'''$.schedule_id''')) ??
              _asInt(getJsonField(item, r'''$.id'''));
      final usersIdRaw = getJsonField(item, r'''$.users_id''', true);
      final sprintsTasksIdRaw = getJsonField(item, r'''$.sprints_tasks_id''', true);

      final scheduleDate = getJsonField(item, r'''$.schedule_date''')?.toString() ??
          DateTime.now().toIso8601String().split('T').first;

      return ScheduleModel(
        id: scheduleId,
        scheduleId: scheduleId,
        teamsId: _asInt(getJsonField(item, r'''$.teams_id''')),
        projectsId: _asInt(getJsonField(item, r'''$.projects_id''')),
        sprintsId: _asInt(getJsonField(item, r'''$.sprints_id''')),
        scheduleDate: scheduleDate,
        usersId: usersIdRaw != null ? json.encode(usersIdRaw) : null,
        sprintsTasksId: sprintsTasksIdRaw != null ? json.encode(sprintsTasksIdRaw) : null,
      );
    } catch (e) {
      if (kDebugMode) {
        print('OfflineApiWrapper: Erro ao parsear escala: $e');
      }
      return null;
    }
  }

  /// Parse task from API response format
  SprintTaskModel? _parseTaskFromApi(
    dynamic item, {
    int? fallbackSprintsId,
    int? fallbackProjectsId,
    int? fallbackTeamsId,
  }) {
    try {
      final unityData = getJsonField(item, r'''$.unity''');
      String? unityStr;
      int? unityId;
      
      if (unityData is Map) {
        unityStr = getJsonField(unityData, r'''$.unity''')?.toString();
        unityId = _asInt(getJsonField(unityData, r'''$.id'''));
      } else if (unityData is String) {
        unityStr = unityData;
      }

      // Extrair dados do projects_backlogs se existir
      final projectsBacklogs = getJsonField(item, r'''$.projects_backlogs''');
      final subtasks = getJsonField(item, r'''$.subtasks''');
      final canConcludeRaw = getJsonField(item, r'''$.can_conclude''');
      int? equipamentsTypesId;

      if (projectsBacklogs != null) {
        equipamentsTypesId =
            _asInt(getJsonField(projectsBacklogs, r'''$.equipaments_types_id'''));
        fallbackProjectsId ??=
            _asInt(getJsonField(projectsBacklogs, r'''$.projects_id'''));
      }

      final projectsBacklogsJson =
          projectsBacklogs != null ? json.encode(projectsBacklogs) : null;
      final subtasksJson = subtasks != null ? json.encode(subtasks) : null;
      final canConclude = _asBool(canConcludeRaw);

      final taskId =
          _asInt(getJsonField(item, r'''$.sprints_tasks_id''')) ??
              _asInt(getJsonField(item, r'''$.id'''));
      return SprintTaskModel(
        id: taskId,
        sprintsTasksId: taskId,
        sprintsId:
            _asInt(getJsonField(item, r'''$.sprints_id''')) ??
                fallbackSprintsId,
        projectsId:
            _asInt(getJsonField(item, r'''$.projects_id''')) ??
                fallbackProjectsId,
        teamsId:
            _asInt(getJsonField(item, r'''$.teams_id''')) ??
                fallbackTeamsId,
        description: getJsonField(item, r'''$.description''')?.toString(),
        sprintsTasksStatusesId:
            _asInt(getJsonField(item, r'''$.sprints_tasks_statuses_id''')),
        subtasksId: _asInt(getJsonField(item, r'''$.subtasks_id''')),
        unityId: unityId ?? _asInt(getJsonField(item, r'''$.unity_id''')),
        unity: unityStr,
        quantityDone: _asDouble(getJsonField(item, r'''$.quantity_done''')),
        check: getJsonField(item, r'''$.check''') == true || 
               getJsonField(item, r'''$.check_field''') == 1 ||
               getJsonField(item, r'''$.check_field''') == true,
        sucesso: getJsonField(item, r'''$.sucesso''') != false && 
                 getJsonField(item, r'''$.sucesso''') != 0 &&
                 getJsonField(item, r'''$.sucesso''') != false,
        inspection: getJsonField(item, r'''$.inspection''') == true || 
                    getJsonField(item, r'''$.inspection''') == 1,
        canConclude: canConclude,
        comment: getJsonField(item, r'''$.comment''')?.toString(),
        firstComment: getJsonField(item, r'''$.first_comment''') == true || 
                      getJsonField(item, r'''$.first_comment''') == 1,
        checkTasks: getJsonField(item, r'''$.checkTasks''') == true || 
                    getJsonField(item, r'''$.check_tasks''') == 1,
        equipamentsTypesId: equipamentsTypesId ??
            _asInt(getJsonField(item, r'''$.equipaments_types_id''')),
        projectsBacklogsJson: projectsBacklogsJson,
        subtasksJson: subtasksJson,
      );
    } catch (e) {
      if (kDebugMode) {
        print('OfflineApiWrapper: Erro ao parsear task: $e');
      }
      return null;
    }
  }

  int? _normalizeId(dynamic value) {
    if (value is int) {
      return value == 0 ? null : value;
    }
    if (value is String) {
      final parsed = int.tryParse(value);
      if (parsed == null || parsed == 0) return null;
      return parsed;
    }
    if (value is double) {
      final asInt = value.toInt();
      return asInt == 0 ? null : asInt;
    }
    // null ou tipos desconhecidos retornam null sem lançar exceção
    return null;
  }

  int? _asInt(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) return int.tryParse(value);
    return null;
  }

  double? _asDouble(dynamic value) {
    if (value == null) return null;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  bool _asBool(dynamic value) {
    if (value == null) return false;
    if (value is bool) return value;
    if (value is int) return value == 1;
    if (value is String) {
      final normalized = value.toLowerCase();
      return normalized == 'true' || normalized == '1';
    }
    return false;
  }

  Map<String, dynamic>? _decodeJsonMap(String? raw) {
    if (raw == null || raw.isEmpty) return null;
    try {
      final decoded = json.decode(raw);
      if (decoded is Map) {
        return Map<String, dynamic>.from(decoded);
      }
    } catch (_) {}
    return null;
  }

  bool _shouldCacheFilterCall(String callName) {
    return callName.contains('Query all fields') ||
        callName.contains('Query all sections records') ||
        callName.contains('Query all map rows  trackers  records') ||
        callName.contains('Query all rows trackers record') ||
        callName.contains('user list');
  }

  bool _shouldCacheCallForOffline(String callName, ApiCallType callType) {
    if (callType == ApiCallType.GET) {
      return true;
    }
    // POSTs de leitura (ex: rows_list)
    return _shouldCacheFilterCall(callName);
  }

  String _buildCacheKey({
    required String callName,
    Map<String, dynamic> params = const {},
    String? body,
  }) {
    final entries = params.entries.toList()
      ..sort((a, b) => a.key.compareTo(b.key));
    final normalizedParams = <String, dynamic>{
      for (final entry in entries) entry.key: entry.value
    };
    return json.encode({
      'callName': callName,
      'params': normalizedParams,
      'body': body,
    });
  }

  int? _extractIdFromUrl(String apiUrl) {
    try {
      final uri = Uri.parse(apiUrl);
      if (uri.pathSegments.isEmpty) return null;
      return int.tryParse(uri.pathSegments.last);
    } catch (_) {
      return null;
    }
  }

  /// Check if this is a login-related API call
  /// We don't want to trigger logout on failed login attempts
  bool _isLoginCall(String callName, String apiUrl) {
    final lowerCallName = callName.toLowerCase();
    final lowerUrl = apiUrl.toLowerCase();

    return lowerCallName.contains('login') ||
        lowerCallName.contains('signin') ||
        lowerCallName.contains('sign in') ||
        lowerCallName.contains('auth') ||
        lowerUrl.contains('/login') ||
        lowerUrl.contains('/signin') ||
        lowerUrl.contains('/auth/login');
  }
}
