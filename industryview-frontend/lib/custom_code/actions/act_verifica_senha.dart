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

/// Verifica a força de uma senha fornecida e retorna:
/// - 0: Senha inválida (contém espaços)
/// - 1: Senha fraca
/// - 2: Senha média
/// - 3: Senha forte
/// - 4: Senha muito forte
Future<int> actVerificaSenha(String senha) async {
  // Verifica se a senha contém espaços
  if (senha.contains(' ')) {
    return 0; // Senha inválida (contém espaços)
  }

  // Caso a senha seja vazia, retorna como fraca (1)
  if (senha.isEmpty) {
    return 1; // Senha fraca
  }

  // Variáveis para verificar os critérios de força da senha
  bool hasUppercase =
      senha.contains(RegExp(r'[A-Z]')); // Tem pelo menos uma letra maiúscula
  bool hasLowercase =
      senha.contains(RegExp(r'[a-z]')); // Tem pelo menos uma letra minúscula
  bool hasNumber = senha.contains(RegExp(r'[0-9]')); // Tem pelo menos um número
  bool hasSpecialChar = senha
      .contains(RegExp(r'[!@#$%^&*(),.?":{}|<>]')); // Tem caractere especial
  bool hasDiversity = senha.runes.toSet().length >
      senha.length / 2; // Diversidade de caracteres

  // Critérios baseados no comprimento
  int length = senha.length;

  // Determinação do nível de força da senha
  if (hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar &&
      hasDiversity &&
      length >= 16) {
    return 4; // Senha muito forte
  } else if (hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar &&
      length >= 12) {
    return 3; // Senha forte
  } else if ((hasUppercase || hasLowercase) && hasNumber && length >= 8) {
    return 2; // Senha média
  } else {
    return 1; // Senha fraca
  }
}
