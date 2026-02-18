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

Future<bool> checkStakesStatusRow(List<ListRowsTrackersStruct> map) async {
  for (var stakeStruct in map) {
    // Verifica diretamente o campo list_trackers_stakes dentro de stakeStruct
    for (var stake in stakeStruct.listTrackersStakes) {
      // Verifica o status do stake
      if (stake.stakesStatusesId != 0 && stake.stakesStatusesId != 1) {
        return true; // Encontrou um valor diferente de 0 e 1
      }
    }
  }
  return false; // Todos os valores são 0 ou 1
}
