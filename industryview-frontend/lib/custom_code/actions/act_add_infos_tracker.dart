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

Future<List<DropSelect1Struct>> actAddInfosTracker(
  List<DropSelect1Struct>? trackers,
  List<MapTrackersStruct>? map,
  int rowId,
) async {
  if (map == null || map.isEmpty) return [];

  List<DropSelect1Struct> updatedTrackers = [];

  for (var mapEntry in map) {
    for (var listRow in mapEntry.listRowsTrackers) {
      print(
          "Verificando rowsId: ${listRow.rowsId}, deletedAt: ${listRow.deletedAt}");

      if (listRow.rowsId == rowId &&
          (listRow.deletedAt == null || listRow.deletedAt == 0)) {
        print("Adicionando Tracker ID: ${listRow.trackersId}");

        updatedTrackers.add(DropSelect1Struct(
          trackersId: listRow.trackersId,
          position: listRow.position,
          // rowsTrackersStatusesId: listRow.rowsTrackersStatusesId,
          rowsTrackersId: listRow.id,
          deletedAt: listRow.deletedAt,
          // trackersTypestype: listRow.trackers?.trackersTypes?.type ?? '',
        ));
      }
    }
  }

  print("Total de trackers adicionados: ${updatedTrackers.length}");
  return updatedTrackers;
}
