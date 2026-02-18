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

Future<void> retornaIdsNaoSetados(
  List<int> rows,
  List<int> setIds,
) async {
  // Cria um Set para eliminar duplicatas
  final currentIds = FFAppState().setIds.toSet();
  final newIds = rows.where((id) => !currentIds.contains(id));

  // Atualiza o FFAppState com os novos IDs, garantindo que não haja duplicatas
  FFAppState().update(() {
    FFAppState().setIds = [...currentIds, ...newIds].toList();
  });
}
