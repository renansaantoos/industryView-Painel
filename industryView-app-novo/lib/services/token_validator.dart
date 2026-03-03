import 'package:flutter/foundation.dart';
import '../auth/custom_auth/auth_util.dart';
import '../backend/api_requests/api_calls.dart';

/// Valida o token de autenticação atual chamando o endpoint /auth/me_app.
class TokenValidator {
  static final TokenValidator instance = TokenValidator._internal();

  TokenValidator._internal();

  /// Retorna true se o token atual for válido.
  Future<bool> validateToken() async {
    final token = currentAuthenticationToken;
    if (token == null || token.isEmpty) {
      return false;
    }
    try {
      final response = await AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall
          .call(bearerAuth: token);
      return response.succeeded;
    } catch (e) {
      if (kDebugMode) {
        print('TokenValidator: Erro ao validar token: $e');
      }
      return false;
    }
  }

  /// Retorna o token atual se for válido, ou null.
  Future<String?> getValidToken() async {
    if (!(await validateToken())) return null;
    return currentAuthenticationToken;
  }
}
