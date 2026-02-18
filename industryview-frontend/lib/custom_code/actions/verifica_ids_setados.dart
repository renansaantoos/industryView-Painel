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

Future<bool> verificaIdsSetados(List<DropSelect1Struct> sets) async {
  for (int i = 0; i < sets.length; i++) {
    final item = sets[i];
    if (item.trackersId == null || item.trackersId == 0) {
      // Aqui você precisa atualizar o campo erro para true

      // Se o struct tiver copyWith, faça algo assim:
      // sets[i] = item.copyWith(erro: true);

      // Se não tiver copyWith, e for um objeto mutável:
      item.erro = true;
    }
  }

  // Depois retorna true se todos estiverem com trackersId != 0 e não nulos
  return sets.isNotEmpty &&
      sets.every(
          (element) => element.trackersId != null && element.trackersId != 0);
}
