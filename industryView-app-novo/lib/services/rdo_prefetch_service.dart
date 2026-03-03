import 'package:flutter/foundation.dart';
import '../auth/custom_auth/auth_util.dart';
import '../backend/api_requests/api_calls.dart';
import '../services/network_service.dart';
import '/core/utils/app_utils.dart';
import '../database/daos/sprint_task_dao.dart';

/// Serviço responsável por pré-carregar dados mínimos da RDO no SQLite
/// para garantir que a tela funcione offline mesmo sem ter sido aberta antes
class RdoPrefetchService {
  static final RdoPrefetchService instance = RdoPrefetchService._internal();
  final SprintTaskDao _sprintTaskDao = SprintTaskDao();

  RdoPrefetchService._internal();

  /// Pré-carrega dados mínimos da RDO (últimos 20 itens ou semana atual)
  /// Executa em background sem bloquear a UI
  Future<bool> prefetchRdoData({bool force = false}) async {
    // Verificar se usuário está logado
    if (!loggedIn || currentAuthenticationToken == null) {
      if (kDebugMode) {
        print('RdoPrefetchService: Usuário não está logado, pulando prefetch');
      }
      return false;
    }

    // Verificar conexão
    final isOnline = await NetworkService.instance.checkConnection();
    if (!isOnline) {
      if (kDebugMode) {
        print('RdoPrefetchService: Sem conexão, pulando prefetch');
      }
      return false;
    }

    try {
      if (kDebugMode) {
        print('RdoPrefetchService: Iniciando prefetch RDO...');
      }

      final projectsId = AppState().user.projectId;
      final teamsId = AppState().user.teamsId;
      final sprintsId = AppState().user.sprint.id;

      if (projectsId == null || projectsId == 0 ||
          teamsId == null || teamsId == 0 ||
          sprintsId == null || sprintsId == 0) {
        if (kDebugMode) {
          print('RdoPrefetchService: user/project/team/sprint ainda não preenchidos, pulando');
        }
        return false;
      }

      // Verificar se já existem dados locais (evitar prefetch desnecessário)
      if (!force) {
        final existingCount = await _sprintTaskDao.count(
          sprintsId: sprintsId,
          projectsId: projectsId,
          teamsId: teamsId,
        );
        if (existingCount > 0) {
          if (kDebugMode) {
            print('RdoPrefetchService: Já existem $existingCount tarefas no banco local, pulando prefetch');
          }
          return true; // Já tem dados, considerar sucesso
        }
      }

      // Carregar dados mínimos da RDO (page=1, perPage=20)
      // Usar os mesmos parâmetros que a RDO usa para garantir compatibilidade
      // IMPORTANTE: As chamadas passam pelo OfflineApiWrapper que salva automaticamente no SQLite
      if (kDebugMode) {
        print('RdoPrefetchService: Fazendo chamada queryAllSprintsTasksRecordCall...');
      }
      final tasksResponse = await SprintsGroup.queryAllSprintsTasksRecordCall.call(
        projectsId: projectsId,
        teamsId: teamsId,
        sprintsId: sprintsId,
        token: currentAuthenticationToken,
        page: 1,
        perPage: 50, // Carregar mais itens para incluir tarefas concluídas (offline)
        search: '',
        equipamentsTypesId: 0,
      );

      if (kDebugMode) {
        print('RdoPrefetchService: queryAllSprintsTasksRecordCall concluída. Sucesso: ${tasksResponse.succeeded}');
      }

      // Carregar schedule (escala do dia)
      if (kDebugMode) {
        print('RdoPrefetchService: Fazendo chamada queryAllScheduleCall...');
      }
      await ProjectsGroup.queryAllScheduleCall.call(
        projectsId: projectsId,
        teamsId: teamsId,
        sprintsId: sprintsId,
        token: currentAuthenticationToken,
      );

      if (kDebugMode) {
        print('RdoPrefetchService: queryAllScheduleCall concluída');
      }

      // Aguardar um pouco para garantir que o OfflineApiWrapper salvou no SQLite
      await Future.delayed(const Duration(milliseconds: 500));

      // Verificar quantos itens foram salvos
      final savedCount = await _sprintTaskDao.count(
        sprintsId: sprintsId,
        projectsId: projectsId,
        teamsId: teamsId,
      );

      if (kDebugMode) {
        print('RdoPrefetchService: Prefetch concluído. $savedCount tarefas salvas no SQLite');
        if (savedCount == 0) {
          print('RdoPrefetchService: AVISO - Nenhuma tarefa foi salva! Verificar se OfflineApiWrapper está funcionando.');
        }
      }

      return savedCount > 0;
    } catch (e) {
      if (kDebugMode) {
        print('RdoPrefetchService: Erro ao fazer prefetch RDO: $e');
      }
      return false;
    }
  }

  /// Verifica se há dados locais da RDO disponíveis
  Future<bool> hasLocalRdoData() async {
    if (!loggedIn) return false;

    try {
      final projectsId = AppState().user.projectId;
      final teamsId = AppState().user.teamsId;
      final sprintsId = AppState().user.sprint.id;

      final count = await _sprintTaskDao.count(
        sprintsId: sprintsId,
        projectsId: projectsId,
        teamsId: teamsId,
      );

      return count > 0;
    } catch (e) {
      if (kDebugMode) {
        print('RdoPrefetchService: Erro ao verificar dados locais: $e');
      }
      return false;
    }
  }
}
