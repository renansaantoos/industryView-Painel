import 'dart:convert';
import 'dart:typed_data';
import '../schema/structs/index.dart';

import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import '/core/utils/app_utils.dart';
import 'api_manager.dart';

export 'api_manager.dart' show ApiCallResponse;

const _kPrivateApiFunctionName = 'privateApiCall';
final _kPainelBaseUrl =
    (dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api/v1').replaceAll(RegExp(r'/$'), '');

/// Start Authentication Group Code

class AuthenticationGroup {
  static String getBaseUrl() => _kPainelBaseUrl;
  static Map<String, String> headers = {
  };
  static LoginAndRetrieveAnAuthenticationTokenCall
      loginAndRetrieveAnAuthenticationTokenCall =
      LoginAndRetrieveAnAuthenticationTokenCall();
  static GetTheRecordBelongingToTheAuthenticationTokenCall
      getTheRecordBelongingToTheAuthenticationTokenCall =
      GetTheRecordBelongingToTheAuthenticationTokenCall();
  static SignupAndRetrieveAnAuthenticationTokenCall
      signupAndRetrieveAnAuthenticationTokenCall =
      SignupAndRetrieveAnAuthenticationTokenCall();
  static DailyLoginCall dailyLoginCall = DailyLoginCall();
}

class LoginAndRetrieveAnAuthenticationTokenCall {
  Future<ApiCallResponse> call({
    String? email = '',
    String? passwordHash = '',
  }) async {
    final baseUrl = AuthenticationGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "email": "${escapeStringForJson(email)}",
  "password_hash": "${escapeStringForJson(passwordHash)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Login and retrieve an authentication token',
      apiUrl: '${baseUrl}/auth/login',
      callType: ApiCallType.POST,
      headers: {
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
      useOfflineWrapper: false, // Desabilitar para login - não faz sentido usar cache offline
    );
  }

  String? token(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.authToken''',
      ));
  String? message(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.message''',
      ));
}

class GetTheRecordBelongingToTheAuthenticationTokenCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = AuthenticationGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get the record belonging to the authentication token',
      apiUrl: '${baseUrl}/auth/me/app',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
      useOfflineWrapper: false, // Desabilitar para login - obrigatório ter internet
    );
  }

  // === Dados do usuário ($.user.*) ===
  int? id(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.user.id''',
      ));
  String? name(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.user.name''',
      ));
  String? phone(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.user.phone''',
      ));
  String? email(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.user.email''',
      ));
  String? image(dynamic response) => null; // Painel não retorna profile_picture
  int? system(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.user.users_permissions.users_system_access_id''',
      ));
  int? roles(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.user.users_permissions.users_roles_id''',
      ));
  int? control(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.user.users_permissions.users_control_system_id''',
      ));
  int? permissions(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.user.users_permissions_id''',
      ));
  bool? firstLogin(dynamic response) => castToType<bool>(getJsonField(
        response,
        r'''$.user.first_login''',
      ));
  int? companyID(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.user.company_id''',
      ));

  // === Sprint ativa — NÃO vem no /me/app do Painel, buscar via GET /sprints separado ===
  int? sprintId(dynamic response) => null;
  int? projectId(dynamic response) {
    // Tenta $.projects[0] primeiro, depois $.teams.leader[0].projects_id
    final fromProjects = castToType<int>(getJsonField(response, r'''$.projects[0]'''));
    if (fromProjects != null) return fromProjects;
    return castToType<int>(getJsonField(response, r'''$.teams.leader[0].projects_id'''));
  }
  String? spritnTitle(dynamic response) => null;
  String? sprintObjective(dynamic response) => null;
  int? sprintDtStart(dynamic response) => null;
  int? sprintDtEnd(dynamic response) => null;
  double? sprintProgress(dynamic response) => null;
  int? sprintStatus(dynamic response) => null;

  // === Sprints tasks — NÃO vem no /me/app do Painel ===
  List? andamento(dynamic response) => null;
  List? concluidas(dynamic response) => null;

  // === Projetos e equipes (nova estrutura Painel) ===
  List? projects(dynamic response) => getJsonField(
        response,
        r'''$.projects''',
        true,
      ) as List?;
  int? teamsId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.teams.leader[0].id''',
      ));
  List? teamsLeader(dynamic response) => getJsonField(
        response,
        r'''$.teams.leader''',
        true,
      ) as List?;
  List? teamsMember(dynamic response) => getJsonField(
        response,
        r'''$.teams.member''',
        true,
      ) as List?;

  /// Retorna todos os project IDs do usuário, mesclando:
  /// - $.projects (atribuição direta)
  /// - $.teams.leader[].projects_id
  /// - $.teams.member[].projects_id
  List<int> allProjectIds(dynamic response) {
    final ids = <int>{};

    final directProjects = projects(response);
    if (directProjects != null) {
      for (final p in directProjects) {
        final id = castToType<int>(p);
        if (id != null) ids.add(id);
      }
    }

    final leaders = teamsLeader(response);
    if (leaders != null) {
      for (final t in leaders) {
        final id = castToType<int>(getJsonField(t, r'''$.projects_id'''));
        if (id != null) ids.add(id);
      }
    }

    final members = teamsMember(response);
    if (members != null) {
      for (final t in members) {
        final id = castToType<int>(getJsonField(t, r'''$.projects_id'''));
        if (id != null) ids.add(id);
      }
    }

    return ids.toList();
  }
}

class SignupAndRetrieveAnAuthenticationTokenCall {
  Future<ApiCallResponse> call() async {
    final baseUrl = AuthenticationGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Signup and retrieve an authentication token',
      apiUrl: '${baseUrl}/auth/signup',
      callType: ApiCallType.POST,
      headers: {
      },
      params: {},
      bodyType: BodyType.MULTIPART,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class DailyLoginCall {
  Future<ApiCallResponse> call({
    String? token = '',
  }) async {
    final baseUrl = AuthenticationGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'daily login',
      apiUrl: '${baseUrl}/auth/daily-login',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      bodyType: BodyType.NONE,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

/// End Authentication Group Code

/// Start User Group Code

class UserGroup {
  static String getBaseUrl() => _kPainelBaseUrl;
  static Map<String, String> headers = {
  };
  static ChangePasswordCall changePasswordCall = ChangePasswordCall();
  static DeleteUserCall deleteUserCall = DeleteUserCall();
  static GetUserIdCall getUserIdCall = GetUserIdCall();
  static EditUserIdCall editUserIdCall = EditUserIdCall();
  static GetUserZeroCall getUserZeroCall = GetUserZeroCall();
  static DeleteUsersControlSystemRecordCall deleteUsersControlSystemRecordCall =
      DeleteUsersControlSystemRecordCall();
  static GetUsersControlSystemRecordCall getUsersControlSystemRecordCall =
      GetUsersControlSystemRecordCall();
  static EditUsersControlSystemRecordCall editUsersControlSystemRecordCall =
      EditUsersControlSystemRecordCall();
  static QueryAllUsersControlSystemRecordsCall
      queryAllUsersControlSystemRecordsCall =
      QueryAllUsersControlSystemRecordsCall();
  static AddUsersControlSystemRecordCall addUsersControlSystemRecordCall =
      AddUsersControlSystemRecordCall();
  static ApiQueBuscaUsuariosQuePodemSerLideresDeEquipeCall
      apiQueBuscaUsuariosQuePodemSerLideresDeEquipeCall =
      ApiQueBuscaUsuariosQuePodemSerLideresDeEquipeCall();
  static UserListCall userListCall = UserListCall();
  static DeleteUsersPermissionsRecordCall deleteUsersPermissionsRecordCall =
      DeleteUsersPermissionsRecordCall();
  static GetUsersPermissionsRecordCall getUsersPermissionsRecordCall =
      GetUsersPermissionsRecordCall();
  static EditUsersPermissionsRecordCall editUsersPermissionsRecordCall =
      EditUsersPermissionsRecordCall();
  static QueryAllUsersPermissionsRecordsCall
      queryAllUsersPermissionsRecordsCall =
      QueryAllUsersPermissionsRecordsCall();
  static AddUsersPermissionsRecordCall addUsersPermissionsRecordCall =
      AddUsersPermissionsRecordCall();
  static DeleteUsersRolesRecordCall deleteUsersRolesRecordCall =
      DeleteUsersRolesRecordCall();
  static GetUsersRolesRecordCall getUsersRolesRecordCall =
      GetUsersRolesRecordCall();
  static EditUsersRolesRecordCall editUsersRolesRecordCall =
      EditUsersRolesRecordCall();
  static QueryAllUsersRolesRecordsCall queryAllUsersRolesRecordsCall =
      QueryAllUsersRolesRecordsCall();
  static AddUsersRolesRecordCall addUsersRolesRecordCall =
      AddUsersRolesRecordCall();
  static DeleteUsersSystemAccessRecordCall deleteUsersSystemAccessRecordCall =
      DeleteUsersSystemAccessRecordCall();
  static GetUsersSystemAccessRecordCall getUsersSystemAccessRecordCall =
      GetUsersSystemAccessRecordCall();
  static EditUsersSystemAccessRecordCall editUsersSystemAccessRecordCall =
      EditUsersSystemAccessRecordCall();
  static QueryAllUsersSystemAccessRecordsCall
      queryAllUsersSystemAccessRecordsCall =
      QueryAllUsersSystemAccessRecordsCall();
  static AddUsersSystemAccessRecordCall addUsersSystemAccessRecordCall =
      AddUsersSystemAccessRecordCall();
  static AddUserCall addUserCall = AddUserCall();
}

class ChangePasswordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "users_id": 0,
  "password": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'change password',
      apiUrl: '${baseUrl}/users/change-password',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class DeleteUserCall {
  Future<ApiCallResponse> call({
    int? usersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'delete user',
      apiUrl: '${baseUrl}/users/${usersId}',
      callType: ApiCallType.DELETE,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetUserIdCall {
  Future<ApiCallResponse> call({
    int? usersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'get user id',
      apiUrl: '${baseUrl}/users/${usersId}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  int? teamId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.teams_leaders1[:].teams_id''',
      ));
  int? projectId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.teams_leaders1[:].teams.projects_id''',
      ));
  int? userId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.result1.id''',
      ));
  String? name(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.result1.name''',
      ));
  String? email(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.result1.email''',
      ));
  String? phone(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.result1.phone''',
      ));
  int? permissionId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.result1.users_permissions_id''',
      ));
  String? image(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.result1.profile_picture.url''',
      ));
  bool? firstlogin(dynamic response) => castToType<bool>(getJsonField(
        response,
        r'''$.result1.first_login''',
      ));
  String? qrcode(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.result1.qrcode''',
      ));
}

class EditUserIdCall {
  Future<ApiCallResponse> call({
    int? usersId,
    String? bearerAuth = '',
    String? name = '',
    String? email = '',
    int? usersSystemAccessId,
    double? usersRolesId,
    int? usersControlSystemId,
    int? projectsId,
    UploadedFile? profilePicture,
    String? phone = '',
    bool? firstLogin = true,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'edit user id',
      apiUrl: '${baseUrl}/users/${usersId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'name': name,
        'email': email,
        'users_system_access_id': usersSystemAccessId,
        'users_roles_id': usersRolesId,
        'users_control_system_id': usersControlSystemId,
        'projects_id': projectsId,
        'profile_picture': profilePicture,
        'phone': phone,
        'first_login': firstLogin,
      },
      bodyType: BodyType.MULTIPART,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetUserZeroCall {
  Future<ApiCallResponse> call({
    int? page,
    int? perPage,
    int? teamsId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'get user zero',
      apiUrl: '${baseUrl}/users/users_0',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'page': page,
        'per_page': perPage,
        'teams_id': teamsId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class DeleteUsersControlSystemRecordCall {
  Future<ApiCallResponse> call({
    int? usersControlSystemId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete users_control_system record.',
      apiUrl: '${baseUrl}/users/control-system/${usersControlSystemId}',
      callType: ApiCallType.DELETE,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetUsersControlSystemRecordCall {
  Future<ApiCallResponse> call({
    int? usersControlSystemId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get users_control_system record',
      apiUrl: '${baseUrl}/users/control-system/${usersControlSystemId}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class EditUsersControlSystemRecordCall {
  Future<ApiCallResponse> call({
    int? usersControlSystemId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "access_level": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit users_control_system record',
      apiUrl: '${baseUrl}/users/control-system/${usersControlSystemId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class QueryAllUsersControlSystemRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all users_control_system records',
      apiUrl: '${baseUrl}/users/control-system',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class AddUsersControlSystemRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "access_level": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add users_control_system record',
      apiUrl: '${baseUrl}/users/control-system',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class ApiQueBuscaUsuariosQuePodemSerLideresDeEquipeCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    int? page,
    int? perPage,
    int? teamsId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'api que busca usuários que podem ser líderes de equipe',
      apiUrl: '${baseUrl}/users/search-for-team',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'projects_id': projectsId,
        'page': page,
        'per_page': perPage,
        'teams_id': teamsId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class UserListCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "page": 0,
  "per_page": 0,
  "search": "",
  "users_roles_id": [
    0
  ]
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'user list',
      apiUrl: '${baseUrl}/users/list',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class DeleteUsersPermissionsRecordCall {
  Future<ApiCallResponse> call({
    int? usersPermissionsId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete users_permissions record.',
      apiUrl: '${baseUrl}/users/permissions/${usersPermissionsId}',
      callType: ApiCallType.DELETE,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetUsersPermissionsRecordCall {
  Future<ApiCallResponse> call({
    int? usersPermissionsId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get users_permissions record',
      apiUrl: '${baseUrl}/users/permissions/${usersPermissionsId}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  int? userSystemAccessId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.users_system_access_id''',
      ));
  int? userRolesId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.users_roles_id''',
      ));
  int? userControlSystemId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.users_control_system_id''',
      ));
  int? permissaoId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.id''',
      ));
}

class EditUsersPermissionsRecordCall {
  Future<ApiCallResponse> call({
    int? usersPermissionsId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "user_id": 0,
  "users_system_access_id": 0,
  "users_roles_id": 0,
  "users_control_system_id": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit users_permissions record',
      apiUrl: '${baseUrl}/users/permissions/${usersPermissionsId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class QueryAllUsersPermissionsRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all users_permissions records',
      apiUrl: '${baseUrl}/users/permissions',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class AddUsersPermissionsRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "user_id": 0,
  "users_system_access_id": 0,
  "users_roles_id": 0,
  "users_control_system_id": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add users_permissions record',
      apiUrl: '${baseUrl}/users/permissions',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class DeleteUsersRolesRecordCall {
  Future<ApiCallResponse> call({
    int? usersRolesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete users_roles record.',
      apiUrl: '${baseUrl}/users/roles/${usersRolesId}',
      callType: ApiCallType.DELETE,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetUsersRolesRecordCall {
  Future<ApiCallResponse> call({
    int? usersRolesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get users_roles record',
      apiUrl: '${baseUrl}/users/roles/${usersRolesId}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class EditUsersRolesRecordCall {
  Future<ApiCallResponse> call({
    int? usersRolesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "role": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit users_roles record',
      apiUrl: '${baseUrl}/users/roles/${usersRolesId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class QueryAllUsersRolesRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all users_roles records',
      apiUrl: '${baseUrl}/users/roles',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class AddUsersRolesRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "role": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add users_roles record',
      apiUrl: '${baseUrl}/users/roles',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class DeleteUsersSystemAccessRecordCall {
  Future<ApiCallResponse> call({
    int? usersSystemAccessId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete users_system_access record.',
      apiUrl: '${baseUrl}/users/system-access/${usersSystemAccessId}',
      callType: ApiCallType.DELETE,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetUsersSystemAccessRecordCall {
  Future<ApiCallResponse> call({
    int? usersSystemAccessId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get users_system_access record',
      apiUrl: '${baseUrl}/users/system-access/${usersSystemAccessId}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class EditUsersSystemAccessRecordCall {
  Future<ApiCallResponse> call({
    int? usersSystemAccessId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "env": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit users_system_access record',
      apiUrl: '${baseUrl}/users/system-access/${usersSystemAccessId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class QueryAllUsersSystemAccessRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all users_system_access records',
      apiUrl: '${baseUrl}/users/system-access',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class AddUsersSystemAccessRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "env": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add users_system_access record',
      apiUrl: '${baseUrl}/users/system-access',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class AddUserCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'add user',
      apiUrl: '${baseUrl}/users',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      bodyType: BodyType.MULTIPART,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

/// End User Group Code

/// Start Sendgrid Validation Group Code

class SendgridValidationGroup {
  static String getBaseUrl() => _kPainelBaseUrl;
  static Map<String, String> headers = {
  };
  static ApiParaResetarASenhaDoUsuarioComUmaNovaSenhaCall
      apiParaResetarASenhaDoUsuarioComUmaNovaSenhaCall =
      ApiParaResetarASenhaDoUsuarioComUmaNovaSenhaCall();
  static ApiParaMandarOCodigoDeRecuperacaoParaOEmailCall
      apiParaMandarOCodigoDeRecuperacaoParaOEmailCall =
      ApiParaMandarOCodigoDeRecuperacaoParaOEmailCall();
  static AcaoDeValidarCodigoParaAAlteracaoDeSenhaCall
      acaoDeValidarCodigoParaAAlteracaoDeSenhaCall =
      AcaoDeValidarCodigoParaAAlteracaoDeSenhaCall();
  static ThisEndpointIsUsedToValidateThatSendgridIsWorkingCall
      thisEndpointIsUsedToValidateThatSendgridIsWorkingCall =
      ThisEndpointIsUsedToValidateThatSendgridIsWorkingCall();
}

class ApiParaResetarASenhaDoUsuarioComUmaNovaSenhaCall {
  Future<ApiCallResponse> call({
    String? newPassword = '',
    String? usersEmail = '',
  }) async {
    final baseUrl = SendgridValidationGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "is_valid": true,
  "new_password": "${escapeStringForJson(newPassword)}",
  "users_email": "${escapeStringForJson(usersEmail)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'api para resetar a senha do usuario com uma nova senha',
      apiUrl: '${baseUrl}/auth/sendgrid/reset/pass',
      callType: ApiCallType.PATCH,
      headers: {
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class ApiParaMandarOCodigoDeRecuperacaoParaOEmailCall {
  Future<ApiCallResponse> call({
    String? emailToRecover = '',
  }) async {
    final baseUrl = SendgridValidationGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "email_to_recover": "${escapeStringForJson(emailToRecover)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'api para mandar o codigo de recuperacao para o email',
      apiUrl: '${baseUrl}/auth/sendgrid/send/code',
      callType: ApiCallType.POST,
      headers: {
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class AcaoDeValidarCodigoParaAAlteracaoDeSenhaCall {
  Future<ApiCallResponse> call({
    int? code,
    String? usersEmail = '',
  }) async {
    final baseUrl = SendgridValidationGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "code": ${code},
  "users_email": "${escapeStringForJson(usersEmail)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Acao de validar codigo para a alteracao de senha',
      apiUrl: '${baseUrl}/auth/sendgrid/validate/code',
      callType: ApiCallType.POST,
      headers: {
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class ThisEndpointIsUsedToValidateThatSendgridIsWorkingCall {
  Future<ApiCallResponse> call() async {
    final baseUrl = SendgridValidationGroup.getBaseUrl();

    final apiRequestBody = '''
{
  "to_email": "",
  "subject": "",
  "body": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'This endpoint is used to validate that sendgrid is working.',
      apiUrl: '${baseUrl}/auth/sendgrid/validate',
      callType: ApiCallType.POST,
      headers: {
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

/// End Sendgrid Validation Group Code

/// Start Projects Group Code

class ProjectsGroup {
  static String getBaseUrl({
    String? token = '',
  }) =>
      _kPainelBaseUrl;
  static Map<String, String> headers = {
    'Authorization': 'Bearer [token]',
  };
  static ListaMembrosDeUmaEquipeCall listaMembrosDeUmaEquipeCall =
      ListaMembrosDeUmaEquipeCall();
  static AdicionaColaboradoresNaEscalaCall adicionaColaboradoresNaEscalaCall =
      AdicionaColaboradoresNaEscalaCall();
  static ListaColaboradoresDaEscalaDoDiaCall
      listaColaboradoresDaEscalaDoDiaCall =
      ListaColaboradoresDaEscalaDoDiaCall();
  static EditaEscalaDosColaboradoresCall editaEscalaDosColaboradoresCall =
      EditaEscalaDosColaboradoresCall();
  static EditaScheduleSprintTasksCall editaScheduleSprintTasksCall =
      EditaScheduleSprintTasksCall();
  static QueryAllScheduleCall queryAllScheduleCall = QueryAllScheduleCall();
  static AddImagensCall addImagensCall = AddImagensCall();
  static GetSubtasksCall getSubtasksCall = GetSubtasksCall();
  static EquipamentsTypeCall equipamentsTypeCall = EquipamentsTypeCall();
  static GetUserProjectsCall getUserProjectsCall = GetUserProjectsCall();
  static WorkforceCheckInCall workforceCheckInCall = WorkforceCheckInCall();
}

class ListaMembrosDeUmaEquipeCall {
  Future<ApiCallResponse> call({
    int? teamsId,
    int? page,
    int? perPage,
    String? search = '',
    String? token = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Lista membros de uma equipe',
      apiUrl: '${baseUrl}/teams/members',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'teams_id': teamsId,
        'page': page,
        'per_page': perPage,
        'search': search,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
      useOfflineWrapper: true, // Habilitar suporte offline apenas para leitura (GET)
    );
  }

  List? list(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
  int? pageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.pageTotal''',
      ));
}

class AdicionaColaboradoresNaEscalaCall {
  Future<ApiCallResponse> call({
    int? teamsId,
    List<int>? usersIdList,
    int? projectsId,
    String? scheduleDate = '',
    int? sprintsId,
    String? token = '',
    String? idempotencyKey,
    String? ifMatch,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl(
      token: token,
    );
    final usersId = _serializeList(usersIdList);

    final effectiveSprintsId = (sprintsId != null && sprintsId > 0) ? sprintsId : null;
    final apiRequestBody = '''
{
  "teams_id": ${teamsId},
  "projects_id": ${projectsId},
  "schedule_date": "${escapeStringForJson(scheduleDate)}",
  "users_id": ${usersId},
  "sprints_id": ${effectiveSprintsId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Adiciona colaboradores na escala',
      apiUrl: '${baseUrl}/schedule',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
        if (idempotencyKey != null) 'Idempotency-Key': idempotencyKey,
        if (idempotencyKey != null) 'X-Operation-Id': idempotencyKey,
        if (ifMatch != null) 'If-Match': ifMatch,
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class ListaColaboradoresDaEscalaDoDiaCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    int? teamsId,
    String? token = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'lista colaboradores da escala do dia',
      apiUrl: '${baseUrl}/schedule',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'projects_id': projectsId,
        'teams_id': teamsId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
      useOfflineWrapper: true, // Habilitar suporte offline apenas para leitura (GET)
    );
  }

  List<int>? ids(dynamic response) => (getJsonField(
        response,
        r'''$[:].users_id''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
}

class EditaEscalaDosColaboradoresCall {
  Future<ApiCallResponse> call({
    List<int>? usersIdList,
    int? scheduleId,
    String? token = '',
    String? idempotencyKey,
    String? ifMatch,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl(
      token: token,
    );
    final usersId = _serializeList(usersIdList);

    final apiRequestBody = '''
{
  "users_id": ${usersId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edita escala dos colaboradores',
      apiUrl: '${baseUrl}/schedule/${scheduleId}',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${token}',
        if (idempotencyKey != null) 'Idempotency-Key': idempotencyKey,
        if (idempotencyKey != null) 'X-Operation-Id': idempotencyKey,
        if (ifMatch != null) 'If-Match': ifMatch,
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class EditaScheduleSprintTasksCall {
  Future<ApiCallResponse> call({
    int? updatedAt,
    List<String>? sprintsTasksIdList,
    int? scheduleId,
    String? token = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl(
      token: token,
    );
    final sprintsTasksId = _serializeList(sprintsTasksIdList);

    final apiRequestBody = '''
{
  "updated_at": ${updatedAt},
  "sprints_tasks_id": ${sprintsTasksId},
  "updated_at": ${updatedAt}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'edita schedule sprint tasks',
      apiUrl: '${baseUrl}/schedule/${scheduleId}',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class QueryAllScheduleCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    int? teamsId,
    int? sprintsId,
    String? token = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'query all schedule',
      apiUrl: '${baseUrl}/reports/schedule/day',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'projects_id': projectsId,
        'teams_id': teamsId,
        'sprints_id': sprintsId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? listaSprint(dynamic response) => getJsonField(
        response,
        r'''$[:].sprints_tasks_id''',
        true,
      ) as List?;
  List? listaUser(dynamic response) => getJsonField(
        response,
        r'''$[:].schedule_user_of_schedule''',
        true,
      ) as List?;
}

class AddImagensCall {
  Future<ApiCallResponse> call({
    UploadedFile? content,
    int? scheduleId,
    String? token = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'add imagens',
      apiUrl: '${baseUrl}/uploads',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'file': content,
        'schedule_id': scheduleId,
      },
      bodyType: BodyType.MULTIPART,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetSubtasksCall {
  Future<ApiCallResponse> call({
    int? projectsBacklogsId,
    String? token = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Get subtasks',
      apiUrl: '${baseUrl}/projects/subtasks',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'projects_backlogs_id': projectsBacklogsId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? items(dynamic response) => getJsonField(
        response,
        r'''$''',
        true,
      ) as List?;
}

class EquipamentsTypeCall {
  Future<ApiCallResponse> call({
    String? token = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Equipaments type',
      apiUrl: '${baseUrl}/equipaments_types',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
      useOfflineWrapper: true, // Habilitar suporte offline (GET)
    );
  }

  List<int>? id(dynamic response) => (getJsonField(
        response,
        r'''$[:].id''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
  List<String>? type(dynamic response) => (getJsonField(
        response,
        r'''$[:].type''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<String>(x))
          .withoutNulls
          .toList();
}

class GetUserProjectsCall {
  Future<ApiCallResponse> call({
    int? companyId,
    int? page = 1,
    int? perPage = 100,
    String? token = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Get user projects',
      apiUrl: '${baseUrl}/projects',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'company_id': companyId,
        'page': page,
        'per_page': perPage,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
      useOfflineWrapper: false,
    );
  }

  List? items(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
  List<int>? ids(dynamic response) => (getJsonField(
        response,
        r'''$.items[:].id''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
  List<String>? names(dynamic response) => (getJsonField(
        response,
        r'''$.items[:].name''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<String>(x))
          .withoutNulls
          .toList();
}

class WorkforceCheckInCall {
  Future<ApiCallResponse> call({
    int? usersId,
    int? projectsId,
    int? teamsId,
    String? token = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl(
      token: token,
    );

    final apiRequestBody = '''
{
  "users_id": ${usersId},
  "projects_id": ${projectsId},
  "teams_id": ${teamsId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Workforce Check-In',
      apiUrl: '${baseUrl}/workforce/check-in',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

/// End Projects Group Code

/// Start Sprints Group Code

class SprintsGroup {
  static String getBaseUrl({
    String? token = '',
  }) =>
      _kPainelBaseUrl;
  static Map<String, String> headers = {
    'Authorization': 'Bearer [token]',
  };
  static QueryAllSprintsTasksRecordCall queryAllSprintsTasksRecordCall =
      QueryAllSprintsTasksRecordCall();
  static GetSprintAtivaCall getSprintAtivaCall = GetSprintAtivaCall();
  static AtualizaStatusDaSprintTaskCall atualizaStatusDaSprintTaskCall =
      AtualizaStatusDaSprintTaskCall();
  static EditProgressSprintCall editProgressSprintCall =
      EditProgressSprintCall();
  static GetSprintsLoginCall getSprintsLoginCall = GetSprintsLoginCall();
  static UpdateInspectionCall updateInspectionCall = UpdateInspectionCall();
  static GetNonExecutionReasonsCall getNonExecutionReasonsCall =
      GetNonExecutionReasonsCall();
  static AtualizaStatusSingleTaskCall atualizaStatusSingleTaskCall =
      AtualizaStatusSingleTaskCall();
  static EditSprintTaskCall editSprintTaskCall = EditSprintTaskCall();
}

class QueryAllSprintsTasksRecordCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    int? teamsId,
    String? search = '',
    int? page,
    int? perPage,
    int? sprintsId,
    int? equipamentsTypesId,
    String? token = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl(
      token: token,
    );

    final apiRequestBody = '''
{
  "projects_id": ${projectsId},
  "sprints_id": ${sprintsId},
  "teams_id": ${(teamsId != null && teamsId > 0) ? '[$teamsId]' : '[]'},
  "equipaments_types_id": ${(equipamentsTypesId != null && equipamentsTypesId > 0) ? '[$equipamentsTypesId]' : '[]'},
  "search": ${(search != null && search.isNotEmpty) ? search : 'null'},
  "pageAnd": ${page ?? 1},
  "per_pageAnd": ${perPage ?? 20}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Query all sprints tasks record',
      apiUrl: '${baseUrl}/sprints/sprints_tasks_painel',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
      useOfflineWrapper: true,
    );
  }

  // === Estrutura Painel (categorias diretas, sem tasks_no_inspection/tasks_inspection) ===

  // Pendentes (NOVO no Painel)
  List? pendentes(dynamic response) => getJsonField(
        response,
        r'''$.sprints_tasks_pendentes.items''',
        true,
      ) as List?;
  int? pendentesPageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_pendentes.pageTotal''',
      ));

  // Em andamento (antes: tasks_no_inspection.sprints_tasks_em_andamento)
  List? nOandamento(dynamic response) => getJsonField(
        response,
        r'''$.sprints_tasks_em_andamento.items''',
        true,
      ) as List?;
  int? nOandamentoPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_em_andamento.pageTotal''',
      ));

  // Concluídas (antes: tasks_no_inspection.sprints_tasks_concluidas)
  List? nOconcluidas(dynamic response) => getJsonField(
        response,
        r'''$.sprints_tasks_concluidas.items''',
        true,
      ) as List?;
  int? nOconcluidasPageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_concluidas.pageTotal''',
      ));

  // Sem sucesso (antes: tasks_no_inspection.sprints_tasks_sem_sucesso)
  List? nOsemSucesso(dynamic response) => getJsonField(
        response,
        r'''$.sprints_tasks_sem_sucesso.items''',
        true,
      ) as List?;
  int? nOsemSucessoPageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_sem_sucesso.pageTotal''',
      ));

  // Inspeção (antes: tasks_inspection.sprints_tasks_em_andamento — agora categoria própria)
  List? yESandamento(dynamic response) => getJsonField(
        response,
        r'''$.sprints_tasks_inspecao.items''',
        true,
      ) as List?;
  int? yESandamentoPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_inspecao.pageTotal''',
      ));

  // Inspeção concluídas — não existe mais como categoria separada no Painel
  List? yESconcluidas(dynamic response) => null;

  // Dados da sprint — Painel não retorna dados_sprint separado,
  // sprint info vem dentro de cada task item via relação sprints
  String? nOtitle(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.sprints_tasks_em_andamento.items[0].sprints.title''',
      ));
  int? nOstart(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_em_andamento.items[0].sprints.start_date''',
      ));
  int? nOend(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_em_andamento.items[0].sprints.end_date''',
      ));
  double? nOprogress(dynamic response) => castToType<double>(getJsonField(
        response,
        r'''$.sprints_tasks_em_andamento.items[0].sprints.progress_percentage''',
      ));
}

class GetSprintAtivaCall {
  Future<ApiCallResponse> call({
    int? page,
    int? perPage,
    int? projectsId,
    int? dtStart,
    int? dtEnd,
    String? token = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl(
      token: token,
    );

    final params = <String, dynamic>{
      'projects_id': projectsId,
    };
    if (page != null) params['page'] = page;
    if (perPage != null) params['per_page'] = perPage;
    if (dtStart != null && dtStart > 0) {
      params['dt_start'] = DateTime.fromMillisecondsSinceEpoch(dtStart).toUtc().toIso8601String();
    }
    if (dtEnd != null && dtEnd > 0) {
      params['dt_end'] = DateTime.fromMillisecondsSinceEpoch(dtEnd).toUtc().toIso8601String();
    }

    return ApiManager.instance.makeApiCall(
      callName: 'Get sprint ativa',
      apiUrl: '${baseUrl}/sprints',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: params,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? listAtivas(dynamic response) => getJsonField(
        response,
        r'''$.sprints_ativa.items''',
        true,
      ) as List?;
  List? listConcluidas(dynamic response) => getJsonField(
        response,
        r'''$.sprints_concluida.items''',
        true,
      ) as List?;
}

class AtualizaStatusDaSprintTaskCall {
  Future<ApiCallResponse> call({
    int? scheduleId,
    dynamic? tasksListJson,
    String? token = '',
    String? idempotencyKey,
    String? ifMatch,
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl(
      token: token,
    );

    final tasksList = _serializeJson(tasksListJson, true);
    final apiRequestBody = '''
{
  "tasks": ${tasksList}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Atualiza status da sprint task',
      apiUrl: '${baseUrl}/sprints/tasks/status/list',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${token}',
        if (idempotencyKey != null) 'Idempotency-Key': idempotencyKey,
        if (idempotencyKey != null) 'X-Operation-Id': idempotencyKey,
        if (ifMatch != null) 'If-Match': ifMatch,
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class AtualizaStatusSingleTaskCall {
  Future<ApiCallResponse> call({
    int? sprintsTasksId,
    int? sprintsTasksStatusesId,
    double? quantityDone,
    String? token = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl(token: token);

    final Map<String, dynamic> bodyMap = {
      'sprints_tasks_id': sprintsTasksId,
      'sprints_tasks_statuses_id': sprintsTasksStatusesId,
    };
    if (quantityDone != null) {
      bodyMap['quantity_done'] = quantityDone;
    }

    final apiRequestBody = _serializeJson(bodyMap, false);
    return ApiManager.instance.makeApiCall(
      callName: 'Atualiza status single sprint task',
      apiUrl: '${baseUrl}/sprints/tasks/status',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class EditSprintTaskCall {
  Future<ApiCallResponse> call({
    required int taskId,
    int? nonExecutionReasonId,
    String? nonExecutionObservations,
    String? token = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl(token: token);

    final Map<String, dynamic> bodyMap = {};
    if (nonExecutionReasonId != null) {
      bodyMap['non_execution_reason_id'] = nonExecutionReasonId;
    }
    if (nonExecutionObservations != null) {
      bodyMap['non_execution_observations'] = nonExecutionObservations;
    }

    final apiRequestBody = _serializeJson(bodyMap, false);
    return ApiManager.instance.makeApiCall(
      callName: 'Edit sprint task',
      apiUrl: '${baseUrl}/sprints/tasks/${taskId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetNonExecutionReasonsCall {
  Future<ApiCallResponse> call({
    String? token = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Get non execution reasons',
      apiUrl: '${baseUrl}/sprints/non-execution-reasons',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class EditProgressSprintCall {
  Future<ApiCallResponse> call({
    int? sprintsId,
    double? progressPercentage,
    String? title = '',
    String? objective = '',
    int? startDate,
    int? projectsId,
    int? sprintsStatusesId,
    int? endDate,
    String? token = '',
    String? idempotencyKey,
    String? ifMatch,
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl(
      token: token,
    );

    final apiRequestBody = '''
{
  "title":"${escapeStringForJson(title)}",
  "objective":"${escapeStringForJson(objective)}",
  "start_date":${startDate},
  "end_date":${endDate},
  "progress_percentage":${progressPercentage},
  "projects_id":${projectsId},
  "sprints_statuses_id": ${sprintsStatusesId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit progress sprint',
      apiUrl: '${baseUrl}/sprints/${sprintsId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${token}',
        if (idempotencyKey != null) 'Idempotency-Key': idempotencyKey,
        if (idempotencyKey != null) 'X-Operation-Id': idempotencyKey,
        if (ifMatch != null) 'If-Match': ifMatch,
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class GetSprintsLoginCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    int? sprintsId,
    String? token = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl(
      token: token,
    );

    final apiRequestBody = '''
{
  "projects_id": ${projectsId},
  "sprints_id": ${sprintsId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Get sprints login',
      apiUrl: '${baseUrl}/sprints/tasks/panel',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? concluidas(dynamic response) => getJsonField(
        response,
        r'''$.sprints_tasks_concluidas''',
        true,
      ) as List?;
  List? andamento(dynamic response) => getJsonField(
        response,
        r'''$.sprints_tasks_em_andamento''',
        true,
      ) as List?;
}

class UpdateInspectionCall {
  Future<ApiCallResponse> call({
    int? sprintsTasksId,
    int? qualityStatusId,
    String? comment = '',
    String? token = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl(
      token: token,
    );

    final apiRequestBody = '''
{
  "sprints_tasks_id": ${sprintsTasksId},
  "quality_status_id": ${qualityStatusId},
  "comment": "${escapeStringForJson(comment)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Update inspection',
      apiUrl: '${baseUrl}/sprints/inspection',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

/// End Sprints Group Code

/// Start Reports Group Code

class ReportsGroup {
  static String getBaseUrl({
    String? token = '',
  }) =>
      _kPainelBaseUrl;
  static Map<String, String> headers = {
    'Authorization': 'Bearer [token]',
  };
  static QrcodeReaderCall qrcodeReaderCall = QrcodeReaderCall();
}

class QrcodeReaderCall {
  Future<ApiCallResponse> call({
    String? qrcode,
    String? token = '',
  }) async {
    final baseUrl = ReportsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'qrcode reader',
      apiUrl: '${baseUrl}/reports/qrcode-reader',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'qrcode': qrcode,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  /// Retorna o ID do usuario encontrado pelo QR code
  int? userId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.id''',
      ));

  /// Retorna o nome do usuario encontrado pelo QR code
  String? userName(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.name''',
      ));

  String? message(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.payload''',
      ));
}

/// End Reports Group Code

/// Start Tasks Group Code

class TasksGroup {
  static String getBaseUrl({
    String? token = '',
  }) =>
      _kPainelBaseUrl;
  static Map<String, String> headers = {
    'Authorization': 'Bearer [token]',
  };
  static AddCommentCall addCommentCall = AddCommentCall();
}

class AddCommentCall {
  Future<ApiCallResponse> call({
    String? comment = '',
    int? projectsBacklogsId,
    int? subtasksId,
    int? createdUserId,
    String? token = '',
  }) async {
    final baseUrl = TasksGroup.getBaseUrl(
      token: token,
    );

    final apiRequestBody = '''
{
  "comment": "${escapeStringForJson(comment)}",
  "projects_backlogs_id": ${projectsBacklogsId},
  "subtasks_id": ${subtasksId},
  "created_user_id": ${createdUserId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add comment',
      apiUrl: '${baseUrl}/tasks/comments',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

/// End Tasks Group Code

/// Start DailyReports Group Code

class DailyReportsGroup {
  static String getBaseUrl({String? token = ''}) => _kPainelBaseUrl;
  static Map<String, String> headers = {};
  static CreateDailyReportCall createDailyReportCall = CreateDailyReportCall();
  static FinalizeDailyReportCall finalizeDailyReportCall = FinalizeDailyReportCall();
  static AddDailyReportWorkforceCall addDailyReportWorkforceCall = AddDailyReportWorkforceCall();
  static AddDailyReportActivityCall addDailyReportActivityCall = AddDailyReportActivityCall();
}

class CreateDailyReportCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    String? rdoDate = '',
    String? shift = '',
    String? weatherMorning = '',
    String? weatherAfternoon = '',
    String? weatherNight = '',
    double? temperatureMin,
    double? temperatureMax,
    String? safetyTopic = '',
    String? generalObservations = '',
    List<int>? scheduleId,
    String? token = '',
  }) async {
    final baseUrl = DailyReportsGroup.getBaseUrl(token: token);
    final scheduleIdList = scheduleId ?? [];

    final apiRequestBody = '''
{
  "projects_id": ${projectsId},
  "rdo_date": "${escapeStringForJson(rdoDate)}",
  "shift": "${escapeStringForJson(shift)}",
  "weather_morning": "${escapeStringForJson(weatherMorning)}",
  "weather_afternoon": "${escapeStringForJson(weatherAfternoon)}",
  "weather_night": "${escapeStringForJson(weatherNight)}",
  "temperature_min": ${temperatureMin ?? 0},
  "temperature_max": ${temperatureMax ?? 0},
  "safety_topic": "${escapeStringForJson(safetyTopic)}",
  "general_observations": "${escapeStringForJson(generalObservations)}",
  "schedule_id": ${_serializeList(scheduleIdList)}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Create Daily Report',
      apiUrl: '${baseUrl}/daily-reports',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  int? id(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.id''',
      ));
}

class FinalizeDailyReportCall {
  Future<ApiCallResponse> call({
    int? id,
    String? token = '',
  }) async {
    final baseUrl = DailyReportsGroup.getBaseUrl(token: token);

    return ApiManager.instance.makeApiCall(
      callName: 'Finalize Daily Report',
      apiUrl: '${baseUrl}/daily-reports/${id}/finalize',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      bodyType: BodyType.NONE,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class AddDailyReportWorkforceCall {
  Future<ApiCallResponse> call({
    int? id,
    String? roleCategory = '',
    int? quantityPlanned,
    int? quantityPresent,
    int? quantityAbsent,
    String? absenceReason = '',
    String? token = '',
  }) async {
    final baseUrl = DailyReportsGroup.getBaseUrl(token: token);

    final apiRequestBody = '''
{
  "role_category": "${escapeStringForJson(roleCategory)}",
  "quantity_planned": ${quantityPlanned ?? 0},
  "quantity_present": ${quantityPresent ?? 0},
  "quantity_absent": ${quantityAbsent ?? 0},
  "absence_reason": "${escapeStringForJson(absenceReason)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add Daily Report Workforce',
      apiUrl: '${baseUrl}/daily-reports/${id}/workforce',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

class AddDailyReportActivityCall {
  Future<ApiCallResponse> call({
    int? id,
    String? description = '',
    int? projectsBacklogsId,
    double? quantityDone,
    int? unityId,
    int? teamsId,
    String? locationDescription = '',
    String? token = '',
  }) async {
    final baseUrl = DailyReportsGroup.getBaseUrl(token: token);

    final apiRequestBody = '''
{
  "description": "${escapeStringForJson(description)}",
  "projects_backlogs_id": ${projectsBacklogsId ?? 0},
  "quantity_done": ${quantityDone ?? 0},
  "unity_id": ${unityId ?? 0},
  "teams_id": ${teamsId ?? 0},
  "location_description": "${escapeStringForJson(locationDescription)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add Daily Report Activity',
      apiUrl: '${baseUrl}/daily-reports/${id}/activities',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: apiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }
}

/// End DailyReports Group Code

class ApiPagingParams {
  int nextPageNumber = 0;
  int numItems = 0;
  dynamic lastResponse;

  ApiPagingParams({
    required this.nextPageNumber,
    required this.numItems,
    required this.lastResponse,
  });

  @override
  String toString() =>
      'PagingParams(nextPageNumber: $nextPageNumber, numItems: $numItems, lastResponse: $lastResponse,)';
}

String _toEncodable(dynamic item) {
  return item;
}

String _serializeList(List? list) {
  list ??= <String>[];
  try {
    return json.encode(list, toEncodable: _toEncodable);
  } catch (_) {
    if (kDebugMode) {
      print("List serialization failed. Returning empty list.");
    }
    return '[]';
  }
}

String _serializeJson(dynamic jsonVar, [bool isList = false]) {
  jsonVar ??= (isList ? [] : {});
  try {
    return json.encode(jsonVar, toEncodable: _toEncodable);
  } catch (_) {
    if (kDebugMode) {
      print("Json serialization failed. Returning empty json.");
    }
    return isList ? '[]' : '{}';
  }
}

String? escapeStringForJson(String? input) {
  if (input == null) {
    return null;
  }
  return input
      .replaceAll('\\', '\\\\')
      .replaceAll('"', '\\"')
      .replaceAll('\n', '\\n')
      .replaceAll('\t', '\\t');
}
