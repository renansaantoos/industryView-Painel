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

Future<bool> verificaNulldrop(
  DropSelect1Struct? fabricante,
  DropSelect2Struct? modulo,
) async {
  if (fabricante != null &&
      fabricante.id != null &&
      fabricante.text.trim().isNotEmpty &&
      modulo != null &&
      modulo.id != null &&
      modulo.text.trim().isNotEmpty) {
    return true;
  }

  return false;
}
