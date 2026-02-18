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

Future<bool> actContainsManufacturers(String search) async {
  /// MODIFY CODE ONLY BELOW THIS LINE

  // Se a pesquisa estiver vazia, não há como encontrar algo
  if (search.isEmpty) {
    return Future.value(false); // Wrap the boolean in a Future
  }

  // Percorre a lista de manufacturers
  for (var linha in FFAppState().listTypeManufacturers) {
    // Verifica se o campo 'name' não é nulo e se contém o valor da pesquisa (ignorando maiúsculas/minúsculas)
    if (linha.name != null &&
        linha.name!.toLowerCase().contains(search.toLowerCase())) {
      return Future.value(true); // Wrap the boolean in a Future
    }
  }

  // Se não encontrar nenhum nome, retorna false
  return Future.value(false); // Wrap the boolean in a Future

  /// MODIFY CODE ONLY ABOVE THIS LINE
}
