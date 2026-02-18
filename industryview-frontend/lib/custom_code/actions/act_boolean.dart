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

Future actBoolean(
  List<int> ids,
  List<User2Struct> dataUser,
) async {
  // verifique se o valor que tem no meu ids contem no meu dataUser campo id se conter, muda o campo mostra para true dentro do meu dataUser
  for (int id in ids) {
    for (User2Struct item in dataUser) {
      if (item.id == id) {
        item.mostra = true;
      }
    }
  }
}
