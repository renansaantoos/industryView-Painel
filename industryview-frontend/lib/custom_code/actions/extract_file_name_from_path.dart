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

import 'package:path/path.dart';

Future<String?> extractFileNameFromPath(FFUploadedFile file) async {
  String? name = file.name;

  if (name != null && name.isNotEmpty) {
    // Se o nome for só números + .pdf → significa que FlutterFlow gerou ID no Web
    final regex = RegExp(r'^\d+(\.\w+)?$');

    if (regex.hasMatch(name)) {
      // Defina você o nome correto
      return "arquivo.pdf"; // <<< coloque o nome que você quer manter
    }

    return name;
  }

  return null;
}
