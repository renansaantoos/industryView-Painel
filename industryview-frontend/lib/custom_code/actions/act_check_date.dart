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

Future<bool> actCheckDate(
  DateTime dtHoje,
  int dtEnd,
) async {
  // Converter dtEnd de microsegundos para DateTime
  DateTime dtEndDateTime = DateTime.fromMicrosecondsSinceEpoch(dtEnd);

  // Remover horas, minutos e segundos de ambos
  DateTime dtHojeDateOnly = DateTime(dtHoje.year, dtHoje.month, dtHoje.day);
  DateTime dtEndDateOnly =
      DateTime(dtEndDateTime.year, dtEndDateTime.month, dtEndDateTime.day);

  // Imprimir para depuração
  print("Hoje: $dtHojeDateOnly");
  print("dtEnd (convertido): $dtEndDateOnly");

  // Retornar true se dtHoje for maior que dtEnd, senão false
  return dtHojeDateOnly.isAfter(dtEndDateOnly);
}
