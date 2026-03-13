
import '/backend/schema/structs/index.dart';




Future<List<TasksListStruct>> setIdsEquipamento(List<dynamic> json) async {
  final List<TasksListStruct> tarefasList = [];

  try {
    for (final item in json) {
      // Aceita qualquer Map vindo da API
      if (item is Map) {
        final projectsBacklogs = item['projects_backlogs'] ?? {};

        // ========================================================
        // VERIFICAÇÃO: EQUIPAMENTO TYPE, CAN_CONCLUDE E IS_INSPECTION
        // ========================================================
        final equipTypeId = projectsBacklogs['equipaments_types_id'];
        final canConclude = item['can_conclude'];
        final isInspection = projectsBacklogs['is_inspection'] ?? false;

        // *** REGRA CORRIGIDA ***
        // Apenas ignora quando can_conclude == false
        if (equipTypeId == 1 && canConclude == false) {
          print(
              '⏭️ Ignorando item id=${item['id']} (equipTypeId=1 e can_conclude=false)');
          continue;
        }

        // Se is_inspection for true, pula o item
        if (isInspection == true) {
          print('⏭️ Ignorando item id=${item['id']} (is_inspection=true)');
          continue;
        }

        final tarefa = TasksListStruct();

        // ========================================================
        // CAMPOS PRINCIPAIS
        // ========================================================
        tarefa.sprintsTasksId = item['id'];
        tarefa.sprintsTasksStatusesId = 3;

        // ========================================================
        // DESCRIPTION (CONDICIONAL)
        // ========================================================
        final subtasksId = item['subtasks_id'];
        final subtasks = item['subtasks'] ?? {};

        if (subtasksId == 0 || subtasksId == null) {
          tarefa.description = projectsBacklogs['description'] ?? '';
        } else {
          tarefa.description = subtasks['description'] ?? '';
        }

        // ========================================================
        // SUBTASKS ID
        // ========================================================
        tarefa.subtasksId = subtasksId;

        // ========================================================
        // UNITY (type: UnityStruct)
        // ========================================================
        final dynamic subtasksUnityRaw = subtasks['unity'];
        final dynamic projectsUnityRaw = projectsBacklogs['unity'];

        int? resolveUnityId(dynamic unityRaw, dynamic fallbackRaw) {
          dynamic idValue;

          if (unityRaw is Map && unityRaw['id'] != null) {
            idValue = unityRaw['id'];
          } else if (fallbackRaw is Map) {
            idValue = fallbackRaw['id'];
          }

          if (idValue is int) return idValue;
          if (idValue is double) return idValue.toInt();
          if (idValue is String) return int.tryParse(idValue);
          return null;
        }

        String? resolveUnityName(dynamic unityRaw, dynamic fallbackRaw) {
          if (unityRaw is Map && unityRaw['unity'] != null) {
            return unityRaw['unity'].toString();
          } else if (fallbackRaw is Map) {
            return fallbackRaw['unity']?.toString();
          }
          return null;
        }

        final unityId = resolveUnityId(subtasksUnityRaw, projectsUnityRaw);
        final unityStr = resolveUnityName(subtasksUnityRaw, projectsUnityRaw);

        if (unityId != null || unityStr != null) {
          tarefa.unity = UnityStruct(
            id: unityId,
            unity: unityStr,
          );
        }

        // ========================================================
        // UNITY ID DIRETO
        // ========================================================
        tarefa.unityId = subtasks['unity_id'];

        // ========================================================
        // QUANTITY DONE
        // ========================================================
        final quantityRaw = subtasks['quantity'];
        if (quantityRaw is num) {
          tarefa.quantityDone = quantityRaw.toDouble();
        } else if (quantityRaw is String) {
          tarefa.quantityDone = double.tryParse(quantityRaw) ?? 0;
        } else {
          tarefa.quantityDone = 0;
        }

        // ========================================================
        // CAMPOS ADICIONAIS PADRÃO
        // ========================================================
        tarefa.check = false;

        // ========================================================
        // ADICIONA À LISTA FINAL
        // ========================================================
        tarefasList.add(tarefa);
      }
    }

    print('✅ Total de tarefas criadas: ${tarefasList.length}');
  } catch (e, stack) {
    print('❌ Erro em setIdsEquipamento: $e');
    print(stack);
  }

  return tarefasList;
}
