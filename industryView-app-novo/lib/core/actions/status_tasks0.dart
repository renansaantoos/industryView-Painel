
import '/backend/schema/structs/index.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import 'index.dart';
import '/core/utils/custom_functions.dart';
import 'package:flutter/material.dart';



Future statusTasks0(List<TasksListStruct> sprint) async {
  for (final task in sprint) {
    task.sprintsTasksStatusesId = 0;
    task.check = true;
    task.sucesso = false;
  }

  // 🔄 Força atualização global
  AppState().update(() {
    AppState().tasksfinish = List.from(sprint);
  });
}
