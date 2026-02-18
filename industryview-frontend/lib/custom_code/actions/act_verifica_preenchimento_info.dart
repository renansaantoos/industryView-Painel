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

Future<bool> actVerificaPreenchimentoInfo(
    List<VarAddTracker1Struct>? trackers) async {
  // Se a lista for nula ou vazia, consideramos que não está preenchida
  if (trackers == null || trackers.isEmpty) {
    return false;
  }

  // Marca os itens com stakesTypesId == 0 com erro = true
  for (var tracker in trackers) {
    if (tracker.stakesTypesId == 0) {
      tracker.erro = true;
    }
  }

  // Verifica se todos os elementos da lista possuem stakesTypesId diferente de 0
  return trackers.every((tracker) => tracker.stakesTypesId != 0);
}
