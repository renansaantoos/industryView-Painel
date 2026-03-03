
import '/backend/schema/structs/index.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import 'index.dart';
import '/core/utils/custom_functions.dart';
import 'package:flutter/material.dart';



// compare os id do meu codsucesso com o codfalha e remova do meu sucesso todos os que forem igual o meu codfalha e retorne
Future<List<int>> retornaCodSucesso(
  List<int> codFalha,
  List<int> codSucesso,
) async {
  // Create a copy of codSucesso to avoid modifying the original list
  List<int> resultado = List<int>.from(codSucesso);

  // Remove all items from resultado that exist in codFalha
  resultado.removeWhere((id) => codFalha.contains(id));

  return resultado;
}
