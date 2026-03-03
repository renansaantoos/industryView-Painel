import '/backend/schema/structs/index.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/utils/custom_functions.dart';
import 'package:flutter/material.dart';

Future<List<TasksListStruct>> addIdsDataType(List<dynamic> json) async {
  List<TasksListStruct> tasksList = [];

  try {
    for (var item in json) {
      if (item is Map<String, dynamic> && item.containsKey('id')) {
        // ID
        final idValue = item['id'];
        final parsedId =
            idValue is int ? idValue : int.tryParse(idValue.toString()) ?? 0;

        // DESCRIPTION via $.projects_backlogs.description
        final descriptionValue =
            item['projects_backlogs']?['description']?.toString() ?? '';

        // Struct final
        final task = TasksListStruct(
          sprintsTasksId: parsedId,
          description: descriptionValue,
        );

        tasksList.add(task);
      }
    }
  } catch (e) {
    print('Error parsing IDs to TasksListStruct: $e');
  }

  return tasksList;
}
