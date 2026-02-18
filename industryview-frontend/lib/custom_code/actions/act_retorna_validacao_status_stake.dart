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

Future<bool> actRetornaValidacaoStatusStake(
  List<MapTrackersStruct> dataType,
  int? sectionId,
) async {
  if (sectionId == null) return false;

  for (var tracker in dataType) {
    if (tracker.sectionsId != sectionId) continue; // Ignora seções diferentes

    for (var rowTracker in tracker.listRowsTrackers) {
      for (var stake in rowTracker.listTrackersStakes) {
        // Verifica se o stake_statuses_id é diferente de 0 ou 1
        if (stake.stakesStatusesId != 0 && stake.stakesStatusesId != 1) {
          return false; // Retorna falso imediatamente se encontrar um inválido
        }
      }
    }
  }
  return true; // Retorna verdadeiro se tudo for válido (0 ou 1)
}
