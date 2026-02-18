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

Future<List<SprintFuturaStruct>> actSprintFutura(
  List<dynamic> jsonList, // A lista de JSONs
  DateTime currentTime,
) async {
  List<SprintFuturaStruct> sprints =
      []; // Lista para armazenar os SprintFuturaStructs válidos

  // Formatar a data de currentTime para o formato dd/MM/yyyy
  String formattedCurrentDate = '${currentTime.day.toString().padLeft(2, '0')}/'
      '${currentTime.month.toString().padLeft(2, '0')}/'
      '${currentTime.year}';

  // Iterando sobre a lista de JSONs
  for (var json in jsonList) {
    // Verificando se o JSON contém o campo start_date
    if (json.containsKey('start_date')) {
      // Convertendo o timestamp para um objeto DateTime
      DateTime startDate = DateTime.fromMillisecondsSinceEpoch(
          json['start_date'] ~/
              1000); // Divisão por 1000 para corrigir a precisão do timestamp

      // Formatando a start_date para o formato dd/MM/yyyy
      String formattedStartDate = '${startDate.day.toString().padLeft(2, '0')}/'
          '${startDate.month.toString().padLeft(2, '0')}/'
          '${startDate.year}';

      // Verificando se a start_date é igual à data formatada de currentTime
      if (formattedStartDate == formattedCurrentDate) {
        // Criando um novo SprintFuturaStruct
        SprintFuturaStruct sprint = SprintFuturaStruct();

        // Adicionando os campos do JSON ao SprintFuturaStruct
        sprint.id = json['id'];
        sprint.title = json['title'];
        sprint.objective = json['objective'];
        sprint.startDate = json['start_date'];
        sprint.endDate = json['end_date'];
        sprint.progressPercentage = json['progress_percentage'];
        sprint.projectsId = json['projects_id'];
        sprint.sprintsStatusesId = json['sprints_statuses_id'];
        // Adicionar mais campos conforme necessário

        // Adicionando o sprint válido à lista de sprints
        sprints.add(sprint);
      }
    }
  }

  // Retornando a lista de sprints válidos
  return sprints;
}
