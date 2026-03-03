// Custom Functions - Business logic utilities
import 'dart:convert';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../models/uploaded_file.dart';
import '/backend/schema/structs/index.dart';
import '/auth/custom_auth/auth_util.dart';

String firstName(String name) {
  return name.split(' ').first;
}

DateTime convertDate(String date) {
  return DateTime.parse(date);
}

List<int> extractCountsFromJsonList(List<String> json) {
  // recebe o json e retorna o count
  List<int> counts = [];
  for (String item in json) {
    try {
      Map<String, dynamic> decoded = jsonDecode(item);
      counts.add(decoded['count'] ?? 0);
    } catch (e) {
      counts.add(0); // ou trate de outra forma
    }
  }
  return counts;
}

bool hasAnyJsonWithEmptyImagesOrTasks(List<dynamic>? json) {
  // se meu json nao conter nenhum valor ou se for null retorna true
  return json == null || json.isEmpty;
}

bool returnDate(DateTime current) {
  final DateTime threshold =
      DateTime(current.year, current.month, current.day, 16, 30);
  return current.isAfter(threshold) || current.isAtSameMomentAs(threshold);
}

int returnNumberJsonList(List<dynamic>? jsonList) {
  // retorne o numero de intens do meu jsonList
  return jsonList?.length ?? 0; // Return the number of items in jsonList
}

List<int> convertIdInt(List<String> ids) {
  // convert meus ids em int
  return ids.map(int.parse).toList(); // Convert each String id to int
}

bool? checkDatatype(List<RdoFinalizarStruct> data) {
  // Verifique se meu campo task_id esta setado,
  // se pelo menos 1 tiver setado retorna true, se nao retorna false
  for (var item in data) {
    if (item.tasksId != null && item.tasksId > 0) {
      return true;
    }
  }
  return false;
}

String? retornaIdsSetados(List<TasksListStruct> tasks) {
  // Filtra tasks com sprintsTasksStatusesId == 4
  final filteredTasks =
      tasks.where((task) => task.sprintsTasksStatusesId == 0).toList();

  // Pega ate 5 IDs dessas tasks filtradas
  final ids = filteredTasks
      .take(5)
      .map((task) => task.sprintsTasksId.toString())
      .toList();

  // Retorna string separada por virgula, ou null se lista vazia
  return ids.isNotEmpty ? ids.join(', ') : null;
}

List<TasksListStruct> retornaJsonTaskList(List<TasksListStruct> taskslist) {
  // Retorna a lista original preservando todos os campos, incluindo comentarios
  // Nao cria novos objetos para preservar todos os dados
  return taskslist;
}

bool checkIds(
  List<TasksListStruct> infos,
  int id,
) {
  for (var info in infos) {
    if (info.sprintsTasksId == id) {
      return true;
    }
  }
  return false;
}

bool? checkBool(List<TasksListStruct> infos) {
  if (infos.isEmpty)
    return null; // ou false, se quiser tratar lista vazia como falso

  // Retorna true se existir ao menos um true, senao false
  return infos.any((task) => task.check == true);
}

bool? allStatus(List<TasksListStruct> infos) {
  for (final task in infos) {
    if (task.sprintsTasksStatusesId == 0) {
      return false;
    }
  }
  return true;
}

bool checkInspection(List<TasksListStruct> infos) {
  // Retorna true se existir pelo menos um inspection == true
  // Retorna false se todos forem false
  return infos.any((info) => info.inspection == true);
}

bool inspectionFalse(List<TasksListStruct> infos) {
  // Verifica se todos os sprintsTasksId estao setados e diferentes de 0
  bool allInspectionFalse = infos.every((task) => task.inspection == false);

  return allInspectionFalse;
}

bool checkFirstComment(
  List<TasksListStruct> taskList,
  int index,
) {
  // Verifica se o index e valido
  if (index < 0 || index >= taskList.length) {
    return false;
  }

  // Verifica se o first_comment daquele indice e true
  return taskList[index].firstComment == true;
  // Return true if first_comment is true
}

bool hasOnlyOneFirstComment(List<TasksListStruct> taskList) {
  // Conta quantos itens tem firstComment == true
  int countTrue = taskList.where((task) => task.firstComment == true).length;

  // Retorna true apenas se existir exatamente 1 true
  return countTrue == 1;
}
