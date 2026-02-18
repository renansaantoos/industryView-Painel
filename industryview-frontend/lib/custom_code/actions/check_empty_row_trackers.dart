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

Future<void> checkEmptyRowTrackers(List<MapTrackersStruct> rows) async {
  // Inicializa FFAppState().idsExistentes se estiver nulo
  FFAppState().idsExistentes ??= [];

  // Itera sobre cada linha
  for (var row in rows) {
    // Verifica se listRowsTrackers não é nulo
    for (var tracker in row.listRowsTrackers ?? []) {
      int? rowId = tracker.rowsId; // Acessando o ID do tracker
      var deletedAt = tracker.deletedAt; // Acessando o campo 'deleted_at'

      // Verifica se o deleted_at é realmente null ou um valor inválido para o FlutterFlow
      if ((deletedAt == null || deletedAt == "" || deletedAt == 0) &&
          rowId != null &&
          !FFAppState().idsExistentes.contains(rowId)) {
        FFAppState().idsExistentes.add(rowId); // Adiciona o rowId
      }
    }
  }
}
