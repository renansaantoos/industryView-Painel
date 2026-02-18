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

Future<bool> actFilterModules(String search) async {
  // Verifica se a string de search está vazia
  if (search.isEmpty) {
    // Se estiver vazia, não há filtragem necessária, então retorna false
    return false;
  }

  // Itera sobre cada linha nos dados do cliente
  for (var linha in FFAppState().listTypeModules) {
    // Verifica se o campo 'type' contém a string de search (ignorando maiúsculas e minúsculas)
    if (linha.type.toLowerCase().contains(search.toLowerCase())) {
      // Se a string de search for encontrada no campo 'type', adiciona a linha à lista filtrada
      FFAppState().addToFilterTypeModules(linha);
    }
  }

  // Retorna true indicando que a filtragem foi feita
  return true;
}
