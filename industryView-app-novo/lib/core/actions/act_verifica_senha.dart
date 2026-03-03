
import '/backend/schema/structs/index.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import 'index.dart';
import '/core/utils/custom_functions.dart';
import 'package:flutter/material.dart';



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
