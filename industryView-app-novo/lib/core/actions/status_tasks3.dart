
import '/backend/schema/structs/index.dart';
import '/core/utils/app_utils.dart';



Future statusTasks3(List<TasksListStruct> sprint) async {
  for (final task in sprint) {
    task.sprintsTasksStatusesId = 3;
    task.check = false;
    task.sucesso = true;
  }

  // 🔄 Força atualização global
  AppState().update(() {
    AppState().tasksfinish = List.from(sprint);
  });
}
