// Automatic FlutterFlow imports
import '/backend/schema/structs/index.dart';
import '/actions/actions.dart' as action_blocks;
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom actions
import '/flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom action code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

// adiciona todos ids que eu receber no meu data type lista_tasks "tasks_template_id"

Future<List<ListaTasksStruct>> loopTasksList(List<int> ids) async {
  List<ListaTasksStruct> tasksList = [];

  for (int id in ids) {
    ListaTasksStruct task = ListaTasksStruct();
    task.tasksTemplateId = id;
    tasksList.add(task);
  }

  return tasksList;
}
