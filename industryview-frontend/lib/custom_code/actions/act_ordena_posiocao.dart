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

Future<void> actOrdenaPosiocao(
  List<DropSelect1Struct> dataList,
) async {
  // Ordena a lista pela posição atual, tratando nulos como se fossem infinitos (vão para o final)
  dataList.sort((a, b) {
    int positionA = int.tryParse(a.position ?? '') ?? 999999;
    int positionB = int.tryParse(b.position ?? '') ?? 999999;
    return positionA.compareTo(positionB);
  });

  // Atualiza as posições sequencialmente como strings
  for (int i = 0; i < dataList.length; i++) {
    dataList[i].position = (i + 1).toString();
  }
}
