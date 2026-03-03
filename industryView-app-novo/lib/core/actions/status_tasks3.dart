
import '/backend/schema/structs/index.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import 'index.dart';
import '/core/utils/custom_functions.dart';
import 'package:flutter/material.dart';



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
