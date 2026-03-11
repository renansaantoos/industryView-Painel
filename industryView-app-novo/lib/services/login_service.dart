import '/backend/api_requests/api_calls.dart';
import '/core/actions/index.dart' as actions;
import '/core/utils/app_utils.dart';
import 'package:flutter/foundation.dart';

enum LoginStatus {
  success,
  noAccess,
  notLeader,
  noSprint,
  invalidCredentials,
  apiError,
  connectionError,
  unexpected,
}

class LoginResult {
  const LoginResult({
    required this.status,
    this.loginResponse,
    this.tokenResponse,
    this.sprintResponse,
    this.message,
  });

  final LoginStatus status;
  final ApiCallResponse? loginResponse;
  final ApiCallResponse? tokenResponse;
  final ApiCallResponse? sprintResponse;
  final String? message;

  bool get isSuccess => status == LoginStatus.success;
}

class LoginService {
  Future<LoginResult> login({
    required String email,
    required String password,
  }) async {
    try {
      final connected = await actions.checkInternetConnection();
      if (connected != true) {
        return const LoginResult(status: LoginStatus.connectionError);
      }

      final loginResponse = await AuthenticationGroup
          .loginAndRetrieveAnAuthenticationTokenCall
          .call(
        email: email,
        passwordHash: password,
      );

      final loginSucceeded = loginResponse.succeeded == true;
      if (kDebugMode) {
        print('=== LOGIN_SERVICE: loginSucceeded=$loginSucceeded statusCode=${loginResponse.statusCode}');
        print('=== LOGIN_SERVICE: jsonBody type=${loginResponse.jsonBody?.runtimeType}');
        print('=== LOGIN_SERVICE: jsonBody=${ loginResponse.jsonBody}');
      }
      if (!loginSucceeded) {
        final message = AuthenticationGroup.loginAndRetrieveAnAuthenticationTokenCall
            .message(loginResponse.jsonBody);
        final isInvalidPassword = message == 'Invalid Credentials.';
        return LoginResult(
          status: isInvalidPassword
              ? LoginStatus.invalidCredentials
              : LoginStatus.apiError,
          loginResponse: loginResponse,
          message: message,
        );
      }

      final authToken = AuthenticationGroup
          .loginAndRetrieveAnAuthenticationTokenCall
          .token(loginResponse.jsonBody);

      // Passo 2: GET /auth/me/app → user + projects + teams
      final tokenResponse = await AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall
          .call(bearerAuth: authToken);

      final tokenSucceeded = tokenResponse.succeeded == true;
      if (!tokenSucceeded) {
        final tokenMessage = getJsonField(
          (tokenResponse.jsonBody),
          r'''$.message''',
        ).toString();
        return LoginResult(
          status: LoginStatus.apiError,
          tokenResponse: tokenResponse,
          loginResponse: loginResponse,
          message: tokenMessage,
        );
      }

      final systemAccess = AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall
          .system(tokenResponse.jsonBody);
      final hasAccess = systemAccess == 2 || systemAccess == 3;

      if (!hasAccess) {
        return LoginResult(
          status: LoginStatus.noAccess,
          tokenResponse: tokenResponse,
          loginResponse: loginResponse,
        );
      }

      // Verificar se o usuário é líder de pelo menos uma equipe
      final meCall = AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall;
      final leaders = meCall.teamsLeader(tokenResponse.jsonBody);
      final isLeader = leaders != null && leaders.isNotEmpty;
      if (!isLeader) {
        return LoginResult(
          status: LoginStatus.notLeader,
          tokenResponse: tokenResponse,
          loginResponse: loginResponse,
        );
      }

      // Passo 3: GET /sprints?projects_id=X → busca sprint ativa
      // Só busca sprint se o usuário tiver exatamente 1 projeto.
      // Com múltiplos projetos, a sprint será buscada após a seleção do projeto.
      final allProjects = AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall
          .allProjectIds(tokenResponse.jsonBody);

      ApiCallResponse? sprintResponse;
      final hasSingleProject = allProjects.length == 1;
      if (hasSingleProject) {
        final firstProjectId = allProjects.first;
        sprintResponse = await SprintsGroup.getSprintAtivaCall.call(
          projectsId: firstProjectId,
          token: authToken,
        );
      }

      return LoginResult(
        status: LoginStatus.success,
        tokenResponse: tokenResponse,
        loginResponse: loginResponse,
        sprintResponse: sprintResponse,
      );
    } catch (error) {
      return LoginResult(
        status: LoginStatus.unexpected,
        message: error.toString(),
      );
    }
  }
}
