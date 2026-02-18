import 'dart:convert';
import 'dart:typed_data';
import '../schema/structs/index.dart';

import 'package:flutter/foundation.dart';

import '/flutter_flow/flutter_flow_util.dart';
import 'api_manager.dart';
import '/config/api_config.dart';

export 'api_manager.dart' show ApiCallResponse;

const _kPrivateApiFunctionName = 'ffPrivateApiCall';









/// Start Reports Group Code

class ReportsGroup {
  // Node.js backend: /api/v1/reports
  // Xano original: api:V4va-VF2
  static String getBaseUrl({
    String? token = '',
  }) =>
      ApiConfig.reportsPath;
  static Map<String, String> headers = {
    'Authorization': 'Bearer [token]',
  };
  static QueryAllDailyReportRecordsCall queryAllDailyReportRecordsCall =
      QueryAllDailyReportRecordsCall();
  static DailyReportDateCall dailyReportDateCall = DailyReportDateCall();
  static DeleteDailyReportRecordCall deleteDailyReportRecordCall =
      DeleteDailyReportRecordCall();
  static AddDailyReportRecordCall addDailyReportRecordCall =
      AddDailyReportRecordCall();
  static BurndownCall burndownCall = BurndownCall();
  static ScheduleoCall scheduleoCall = ScheduleoCall();
  static EditDailyReportRecordCall editDailyReportRecordCall =
      EditDailyReportRecordCall();
  static GetDailyReportRecordCall getDailyReportRecordCall =
      GetDailyReportRecordCall();
  static GetDailyreportRecordPdfCall getDailyreportRecordPdfCall =
      GetDailyreportRecordPdfCall();
  static DashboardCall dashboardCall = DashboardCall();
  static GetInformeDiarioCall getInformeDiarioCall = GetInformeDiarioCall();
  static NovoGetInformeDiarioCall novoGetInformeDiarioCall =
      NovoGetInformeDiarioCall();
}

class QueryAllDailyReportRecordsCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    int? page,
    int? perPage,
    String? initialDate = '',
    String? finalDate = '',
    String? token = '',
  }) async {
    final baseUrl = ReportsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Query all daily_report records',
      apiUrl: '${baseUrl}/daily',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'projects_id': projectsId,
        'page': page,
        'per_page': perPage,
        'initial_date': initialDate,
        'final_date': finalDate,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? lista(dynamic response) => getJsonField(
        response,
        r'''$.result1.items''',
        true,
      ) as List?;
  int? pageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.result1.pageTotal''',
      ));
  int? dailyreportpending(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.daily_report_pending''',
      ));
}

class DailyReportDateCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    String? token = '',
  }) async {
    final baseUrl = ReportsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Daily report date',
      apiUrl: '${baseUrl}/daily/dates',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'projects_id': projectsId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? lista(dynamic response) => getJsonField(
        response,
        r'''$''',
        true,
      ) as List?;
}

class DeleteDailyReportRecordCall {
  Future<ApiCallResponse> call({
    int? dailyReportId,
    String? token = '',
  }) async {
    final baseUrl = ReportsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Delete daily_report record.',
      apiUrl: '${baseUrl}/daily/${dailyReportId}',
      callType: ApiCallType.DELETE,
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

class AddDailyReportRecordCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    List<int>? scheduleIdList,
    String? date = '',
    String? token = '',
  }) async {
    final baseUrl = ReportsGroup.getBaseUrl(
      token: token,
    );
    final scheduleId = _serializeList(scheduleIdList);

    final ffApiRequestBody = '''
{
  "projects_id": ${projectsId},
  "schedule_id": ${scheduleId},
  "date": "${escapeStringForJson(date)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add daily_report record',
      apiUrl: '${baseUrl}/daily',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class BurndownCall {
  Future<ApiCallResponse> call({
    int? sprintsId,
    int? projectsId,
    String? token = '',
  }) async {
    final baseUrl = ReportsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'burndown',
      apiUrl: '${baseUrl}/burndown',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'sprints_id': sprintsId,
        'projects_id': projectsId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List<String>? date(dynamic response) => (getJsonField(
        response,
        r'''$[:].date''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<String>(x))
          .withoutNulls
          .toList();
  List<int>? concluidas(dynamic response) => (getJsonField(
        response,
        r'''$[:].concluidas''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
  List<int>? restantes(dynamic response) => (getJsonField(
        response,
        r'''$[:].restantes''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
  List<int>? acumuladas(dynamic response) => (getJsonField(
        response,
        r'''$[:].acumuladas''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
  List<int>? valorreferencia(dynamic response) => (getJsonField(
        response,
        r'''$[:].valor_referencia''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
}

class ScheduleoCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    String? date = '',
    String? token = '',
  }) async {
    final baseUrl = ReportsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'scheduleo',
      apiUrl: '${baseUrl}/schedule/day',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'projects_id': projectsId,
        'date': date,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? list(dynamic response) => getJsonField(
        response,
        r'''$''',
        true,
      ) as List?;
}

class EditDailyReportRecordCall {
  Future<ApiCallResponse> call({
    int? dailyReportId,
    String? token = '',
  }) async {
    final baseUrl = ReportsGroup.getBaseUrl(
      token: token,
    );

    final ffApiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "projects_id": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit daily_report record',
      apiUrl: '${baseUrl}/daily/${dailyReportId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class GetDailyReportRecordCall {
  Future<ApiCallResponse> call({
    int? dailyReportId,
    int? page,
    int? perPage,
    String? search = '',
    String? token = '',
  }) async {
    final baseUrl = ReportsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Get daily_report record',
      apiUrl: '${baseUrl}/daily/${dailyReportId}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
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
    );
  }

  List? lista(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
}

class GetDailyreportRecordPdfCall {
  Future<ApiCallResponse> call({
    int? dailyReportId,
    String? token = '',
  }) async {
    final baseUrl = ReportsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Get dailyreport record pdf',
      apiUrl: '${baseUrl}/daily/${dailyReportId}/pdf',
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

  dynamic? lista(dynamic response) => getJsonField(
        response,
        r'''$.items''',
      );
}

class DashboardCall {
  Future<ApiCallResponse> call({
    String? initialDate = '',
    String? finalDate = '',
    int? projectsId,
    String? token = '',
  }) async {
    final baseUrl = ReportsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Dashboard',
      apiUrl: '${baseUrl}/dashboard',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'initial_date': initialDate,
        'final_date': finalDate,
        'projects_id': projectsId,
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

class GetInformeDiarioCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    String? date = '',
    String? token = '',
  }) async {
    final baseUrl = ReportsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Get informe diario',
      apiUrl: '${baseUrl}/informe-diario',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'projects_id': projectsId,
        'date': date,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List<int>? qtdDiaria(dynamic response) => (getJsonField(
        response,
        r'''$[:].quantidade_executada_diaria''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
  List<int>? qtdAcumulada(dynamic response) => (getJsonField(
        response,
        r'''$[:].quantidade_executada_acumulada''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
  List<int>? qtdPrevista(dynamic response) => (getJsonField(
        response,
        r'''$[:].quantidade_prevista''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
}

class NovoGetInformeDiarioCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    int? date,
    String? token = '',
  }) async {
    final baseUrl = ReportsGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Novo Get informe diario',
      apiUrl: '${baseUrl}/informe-diario/filtered',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'projects_id': projectsId,
        'date': date,
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

/// End Reports Group Code

/// Start User Group Code

class UserGroup {
  // Node.js backend: /api/v1/users
  // Xano original: api:_QKDaqPz
  static String getBaseUrl() =>
      ApiConfig.usersPath;
  static Map<String, String> headers = {
  };
  static GetUserCall getUserCall = GetUserCall();
  static EditUsersPermissionsRecordCall editUsersPermissionsRecordCall =
      EditUsersPermissionsRecordCall();
  static ChangePasswordCall changePasswordCall = ChangePasswordCall();
  static AddUsersPermissionsRecordCall addUsersPermissionsRecordCall =
      AddUsersPermissionsRecordCall();
  static DeleteUsersSystemAccessRecordCall deleteUsersSystemAccessRecordCall =
      DeleteUsersSystemAccessRecordCall();
  static QueryAllUsersPermissionsRecordsCall
      queryAllUsersPermissionsRecordsCall =
      QueryAllUsersPermissionsRecordsCall();
  static UsersZeroCall usersZeroCall = UsersZeroCall();
  static APIQueBuscaUsuariosQuePodemSerLideresDeEquipeCall
      aPIQueBuscaUsuariosQuePodemSerLideresDeEquipeCall =
      APIQueBuscaUsuariosQuePodemSerLideresDeEquipeCall();
  static EditUsersControlSystemRecordCall editUsersControlSystemRecordCall =
      EditUsersControlSystemRecordCall();
  static GetUsersSystemAccessRecordCall getUsersSystemAccessRecordCall =
      GetUsersSystemAccessRecordCall();
  static GetUsersControlSystemRecordCall getUsersControlSystemRecordCall =
      GetUsersControlSystemRecordCall();
  static DeleteUsersPermissionsRecordCall deleteUsersPermissionsRecordCall =
      DeleteUsersPermissionsRecordCall();
  static DeleteUsersRolesRecordCall deleteUsersRolesRecordCall =
      DeleteUsersRolesRecordCall();
  static QueryAllUsersRolesRecordsCall queryAllUsersRolesRecordsCall =
      QueryAllUsersRolesRecordsCall();
  static DeleteUsersControlSystemRecordCall deleteUsersControlSystemRecordCall =
      DeleteUsersControlSystemRecordCall();
  static GetUsersRolesRecordCall getUsersRolesRecordCall =
      GetUsersRolesRecordCall();
  static QueryAllUsersSystemAccessRecordsCall
      queryAllUsersSystemAccessRecordsCall =
      QueryAllUsersSystemAccessRecordsCall();
  static QuerryAllUsersRecordCall querryAllUsersRecordCall =
      QuerryAllUsersRecordCall();
  static QueryAllUsersControlSystemRecordsCall
      queryAllUsersControlSystemRecordsCall =
      QueryAllUsersControlSystemRecordsCall();
  static DeleteUserCall deleteUserCall = DeleteUserCall();
  static AddUsersCall addUsersCall = AddUsersCall();
  static PatchUsersCall patchUsersCall = PatchUsersCall();
  static GetUsersPermissionsRecordCall getUsersPermissionsRecordCall =
      GetUsersPermissionsRecordCall();
  static EditUsersSystemAccessRecordCall editUsersSystemAccessRecordCall =
      EditUsersSystemAccessRecordCall();
  static AddUsersControlSystemRecordCall addUsersControlSystemRecordCall =
      AddUsersControlSystemRecordCall();
  static AddUsersSystemAccessRecordCall addUsersSystemAccessRecordCall =
      AddUsersSystemAccessRecordCall();
  static AddUsersRolesRecordCall addUsersRolesRecordCall =
      AddUsersRolesRecordCall();
  static EditUsersRolesRecordCall editUsersRolesRecordCall =
      EditUsersRolesRecordCall();
  static GetUserExportCall getUserExportCall = GetUserExportCall();
  static ImportUsersCsvCall importUsersCsvCall = ImportUsersCsvCall();
  static AllUserDropCall allUserDropCall = AllUserDropCall();
  static CreatCompanyCall creatCompanyCall = CreatCompanyCall();
  static EditCompanyCall editCompanyCall = EditCompanyCall();
  static GetCompanyCall getCompanyCall = GetCompanyCall();
}

class GetUserCall {
  Future<ApiCallResponse> call({
    int? usersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get user',
      apiUrl: '${baseUrl}/${usersId}',
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

  int? id(dynamic response) => castToType<int>(getJsonField(
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
  int? permissionsId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.result1.users_permissions_id''',
      ));
  String? image(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.result1.profile_picture.url''',
      ));
  String? qrcode(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.result1.qrcode''',
      ));
  String? role(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.result1.users_permissions.users_roles.role''',
      ));
  String? accessLevel(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.result1.users_permissions.users_control_system.access_level''',
      ));
  String? systemAccess(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.result1.users_permissions.users_system_access.env''',
      ));
  int? systemAccessID(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.result1.users_permissions.users_system_access_id''',
      ));
  int? roleID(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.result1.users_permissions.users_roles_id''',
      ));
  int? accessLevelID(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.result1.users_permissions.users_control_system_id''',
      ));
  int? companyID(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.result1.company_id''',
      ));
}

class EditUsersPermissionsRecordCall {
  Future<ApiCallResponse> call({
    int? usersPermissionsId,
    String? bearerAuth = '',
    int? userId,
    int? usersSystemAccessId,
    int? usersRolesId,
    int? usersControlSystemId,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "user_id": ${userId},
  "users_system_access_id":${usersSystemAccessId},
  "users_roles_id":${usersRolesId},
  "users_control_system_id":${usersControlSystemId} 
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit users_permissions record',
      apiUrl: '${baseUrl}/users_permissions/${usersPermissionsId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class ChangePasswordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? usersId,
    String? password = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "users_id": ${usersId},
  "password": "${escapeStringForJson(password)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Change password',
      apiUrl: '${baseUrl}/change_password',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  String? message(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.message''',
      ));
}

class AddUsersPermissionsRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? userId,
    int? usersSystemAccessId,
    int? usersRolesId,
    int? usersControlSystemId,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "user_id":${userId},
  "users_system_access_id":${usersSystemAccessId},
  "users_roles_id":${usersRolesId},
  "users_control_system_id":${usersControlSystemId} 
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add users_permissions record',
      apiUrl: '${baseUrl}/users_permissions',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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
      apiUrl: '${baseUrl}/users_system_access/${usersSystemAccessId}',
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

class QueryAllUsersPermissionsRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all users_permissions records',
      apiUrl: '${baseUrl}/users_permissions',
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

class UsersZeroCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    String? search = '',
    List<int>? usersRolesIdList,
    int? page,
    int? perPage,
    int? teamsId,
    int? companyId,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();
    final usersRolesId = _serializeList(usersRolesIdList);

    final ffApiRequestBody = '''
{
  "page": ${page},
  "per_page": ${perPage},
  "users_roles_id": ${usersRolesId},
  "search": "${escapeStringForJson(search)}",
  "teams_id": ${teamsId},
"company_id": ${companyId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'users zero',
      apiUrl: '${baseUrl}/users_0',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? lista(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
  int? itemsReceived(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsReceived''',
      ));
  int? itemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsTotal''',
      ));
  int? nextPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.nextPage''',
      ));
  int? prevPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.prevPage''',
      ));
}

class APIQueBuscaUsuariosQuePodemSerLideresDeEquipeCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    String? bearerAuth = '',
    int? teamsId,
    int? page,
    int? perPage,
    List<int>? usersRolesIdList,
    String? search = '',
    int? companyId,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();
    final usersRolesId = _serializeList(usersRolesIdList);

    final ffApiRequestBody = '''
{
  "projects_id": ${projectsId},
  "page": ${page},
  "per_page": ${perPage},
  "teams_id": ${teamsId},
  "users_roles_id": ${usersRolesId},
  "search": "${escapeStringForJson(search)}",
  "company_id": ${companyId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'API que busca usuarios que podem ser lideres de equipe',
      apiUrl: '${baseUrl}/users_leaders_0',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  int? nextPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.nextPage''',
      ));
  int? itemsReceived(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsReceived''',
      ));
  int? itemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsTotal''',
      ));
  List? list(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
  int? prevPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.prevPage''',
      ));
}

class EditUsersControlSystemRecordCall {
  Future<ApiCallResponse> call({
    int? usersControlSystemId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "access_level": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit users_control_system record',
      apiUrl: '${baseUrl}/users_control_system/${usersControlSystemId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class GetUsersSystemAccessRecordCall {
  Future<ApiCallResponse> call({
    int? usersSystemAccessId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get users_system_access record',
      apiUrl: '${baseUrl}/users_system_access/${usersSystemAccessId}',
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

class GetUsersControlSystemRecordCall {
  Future<ApiCallResponse> call({
    int? usersControlSystemId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get users_control_system record',
      apiUrl: '${baseUrl}/users_control_system/${usersControlSystemId}',
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

class DeleteUsersPermissionsRecordCall {
  Future<ApiCallResponse> call({
    int? usersPermissionsId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete users_permissions record.',
      apiUrl: '${baseUrl}/users_permissions/${usersPermissionsId}',
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

class DeleteUsersRolesRecordCall {
  Future<ApiCallResponse> call({
    int? usersRolesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete users_roles record.',
      apiUrl: '${baseUrl}/users_roles/${usersRolesId}',
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

class QueryAllUsersRolesRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all users_roles records',
      apiUrl: '${baseUrl}/users_roles',
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

class DeleteUsersControlSystemRecordCall {
  Future<ApiCallResponse> call({
    int? usersControlSystemId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete users_control_system record.',
      apiUrl: '${baseUrl}/users_control_system/${usersControlSystemId}',
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
      apiUrl: '${baseUrl}/users_roles/${usersRolesId}',
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

class QueryAllUsersSystemAccessRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all users_system_access records',
      apiUrl: '${baseUrl}/users_system_access',
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

class QuerryAllUsersRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? perPage,
    int? page,
    String? search = '',
    List<int>? usersRolesIdList,
    int? companyId,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();
    final usersRolesId = _serializeList(usersRolesIdList);

    final ffApiRequestBody = '''
{
  "page": ${page},
  "per_page": ${perPage},
  "search": "${escapeStringForJson(search)}",
  "users_roles_id": ${usersRolesId},
  "company_id": ${companyId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Querry all users record',
      apiUrl: '${baseUrl}/users_list',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? lista(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
  int? itemsReceived(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsReceived''',
      ));
  int? itemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsTotal''',
      ));
  int? nextPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.nextPage''',
      ));
  int? prevPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.prevPage''',
      ));
  int? pageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.pageTotal''',
      ));
}

class QueryAllUsersControlSystemRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all users_control_system records',
      apiUrl: '${baseUrl}/users_control_system',
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

class DeleteUserCall {
  Future<ApiCallResponse> call({
    int? usersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete user',
      apiUrl: '${baseUrl}/${usersId}',
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

class AddUsersCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    String? name = '',
    String? phone = '',
    String? email = '',
    int? usersRolesId,
    int? usersSystemAccessId,
    String? password = '',
    FFUploadedFile? profilePicture,
    int? projectsId,
    int? usersControlSystemId,
    int? companyId,
    int? teamsId = 0,
    bool? isLeader = false,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Add users ',
      apiUrl: '${baseUrl}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'name': name,
        'phone': phone,
        'email': email,
        'users_roles_id': usersRolesId,
        'users_control_system_id': usersControlSystemId,
        'users_system_access_id': usersSystemAccessId,
        'password': password,
        'profile_picture': profilePicture,
        'projects_id': projectsId,
        'company_id': companyId,
        'teams_id': teamsId,
        'is_leader': isLeader,
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

class PatchUsersCall {
  Future<ApiCallResponse> call({
    int? usersId,
    String? bearerAuth = '',
    String? name = '',
    String? phone = '',
    FFUploadedFile? profilePicture,
    int? usersControlSystemId,
    int? usersRolesId,
    int? usersSystemAccessId,
    String? email = '',
    String? password = '',
    int? projectsId,
    List<bool>? firstLoginList,
    int? companyId,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();
    final firstLogin = _serializeList(firstLoginList);

    return ApiManager.instance.makeApiCall(
      callName: 'Patch users',
      apiUrl: '${baseUrl}/${usersId}',
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
        'profile_picture': profilePicture,
        'phone': phone,
        'password': password,
        'projects_id': projectsId,
        'company_id': companyId,
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

class GetUsersPermissionsRecordCall {
  Future<ApiCallResponse> call({
    int? usersPermissionsId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get users_permissions record',
      apiUrl: '${baseUrl}/users_permissions/${usersPermissionsId}',
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

  int? userssystemaccessid(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.users_system_access_id''',
      ));
}

class EditUsersSystemAccessRecordCall {
  Future<ApiCallResponse> call({
    int? usersSystemAccessId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "env": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit users_system_access record',
      apiUrl: '${baseUrl}/users_system_access/${usersSystemAccessId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class AddUsersControlSystemRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "access_level": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add users_control_system record',
      apiUrl: '${baseUrl}/users_control_system',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class AddUsersSystemAccessRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "env": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add users_system_access record',
      apiUrl: '${baseUrl}/users_system_access',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class AddUsersRolesRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "role": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add users_roles record',
      apiUrl: '${baseUrl}/users_roles',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class EditUsersRolesRecordCall {
  Future<ApiCallResponse> call({
    int? usersRolesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "updated_at": 0,
  "deleted_at": 0,
  "role": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit users_roles record',
      apiUrl: '${baseUrl}/users_roles/${usersRolesId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class GetUserExportCall {
  Future<ApiCallResponse> call({
    String? token = '',
    String? search = '',
    List<int>? usersRolesIdList,
    int? companyId,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();
    final usersRolesId = _serializeList(usersRolesIdList);

    final ffApiRequestBody = '''
{
  "search": "${escapeStringForJson(search)}",
  "users_roles_id": ${usersRolesId},
 "company_id": ${companyId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Get user export',
      apiUrl: '${baseUrl}/users_list_clone_0',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class ImportUsersCsvCall {
  Future<ApiCallResponse> call({
    FFUploadedFile? csv,
    String? token = '',
    int? companyId,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Import users csv',
      apiUrl: '${baseUrl}/import_user',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'csv': csv,
        'company_id': companyId,
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

class AllUserDropCall {
  Future<ApiCallResponse> call({
    String? token = '',
    int? companyId,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'all user drop',
      apiUrl: '${baseUrl}/query_all_users',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'token': token,
        'company_id': companyId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
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
  List<String>? name(dynamic response) => (getJsonField(
        response,
        r'''$[:].name''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<String>(x))
          .withoutNulls
          .toList();
}

class CreatCompanyCall {
  Future<ApiCallResponse> call({
    String? token = '',
    String? brandName = '',
    String? legalName = '',
    String? cnpj = '',
    String? phone = '',
    String? email = '',
    String? cep = '',
    String? numero = '',
    String? addressLine = '',
    String? addressLine2 = '',
    String? city = '',
    String? state = '',
    int? statusPaymentId = 1,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "brand_name": "${escapeStringForJson(brandName)}",
  "legal_name": "${escapeStringForJson(legalName)}",
  "cnpj": "${escapeStringForJson(cnpj)}",
  "phone": "${escapeStringForJson(phone)}",
  "email": "${escapeStringForJson(email)}",
  "cep": "${escapeStringForJson(cep)}",
  "numero": "${escapeStringForJson(numero)}",
  "address_line": "${escapeStringForJson(addressLine)}",
  "address_line2": "${escapeStringForJson(addressLine2)}",
  "city": "${escapeStringForJson(city)}",
  "state": "${escapeStringForJson(state)}",
  "status_payment_id": ${statusPaymentId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Creat company',
      apiUrl: '${baseUrl}/company',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class EditCompanyCall {
  Future<ApiCallResponse> call({
    String? token = '',
    String? brandName = '',
    String? legalName = '',
    String? cnpj = '',
    String? phone = '',
    String? email = '',
    String? cep = '',
    String? numero = '',
    String? addressLine = '',
    String? addressLine2 = '',
    String? city = '',
    String? state = '',
    int? companyId,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
   "brand_name": "${escapeStringForJson(brandName)}",
  "legal_name": "${escapeStringForJson(legalName)}",
  "cnpj": "${escapeStringForJson(cnpj)}",
  "phone": "${escapeStringForJson(phone)}",
  "email": "${escapeStringForJson(email)}",
  "cep": "${escapeStringForJson(cep)}",
  "numero": "${escapeStringForJson(numero)}",
  "address_line": "${escapeStringForJson(addressLine)}",
  "address_line2": "${escapeStringForJson(addressLine2)}",
  "city": "${escapeStringForJson(city)}",
  "state": "${escapeStringForJson(state)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit company',
      apiUrl: '${baseUrl}/company/${companyId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class GetCompanyCall {
  Future<ApiCallResponse> call({
    String? token = '',
    int? companyId,
  }) async {
    final baseUrl = UserGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'get company',
      apiUrl: '${baseUrl}/company/${companyId}',
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

  int? id(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.id''',
      ));
  String? brandname(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.brand_name''',
      ));
  String? legalname(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.legal_name''',
      ));
  String? cnpj(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.cnpj''',
      ));
  String? phone(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.phone''',
      ));
  String? email(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.email''',
      ));
  String? cep(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.cep''',
      ));
  String? numero(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.numero''',
      ));
  String? addressline(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.address_line''',
      ));
  String? addressline2(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.address_line2''',
      ));
  String? city(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.city''',
      ));
  String? state(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.state''',
      ));
}

/// End User Group Code

/// Start Tasks Group Code

class TasksGroup {
  // Node.js backend: /api/v1/tasks
  // Xano original: api:jt9TX_Hr
  static String getBaseUrl() =>
      ApiConfig.tasksPath;
  static Map<String, String> headers = {
  };
  static EditTasksRecordCall editTasksRecordCall = EditTasksRecordCall();
  static QueryAllTasksRecordsCall queryAllTasksRecordsCall =
      QueryAllTasksRecordsCall();
  static QueryAllIdsTasksCall queryAllIdsTasksCall = QueryAllIdsTasksCall();
  static AddTasksRecordCall addTasksRecordCall = AddTasksRecordCall();
  static GetTasksRecordCall getTasksRecordCall = GetTasksRecordCall();
  static QueryAllTasksSemPaginacaoCall queryAllTasksSemPaginacaoCall =
      QueryAllTasksSemPaginacaoCall();
  static EditTasksPrioritiesRecordCall editTasksPrioritiesRecordCall =
      EditTasksPrioritiesRecordCall();
  static DeleteTasksPrioritiesRecordCall deleteTasksPrioritiesRecordCall =
      DeleteTasksPrioritiesRecordCall();
  static GetTasksPrioritiesRecordCall getTasksPrioritiesRecordCall =
      GetTasksPrioritiesRecordCall();
  static AddTasksPrioritiesRecordCall addTasksPrioritiesRecordCall =
      AddTasksPrioritiesRecordCall();
  static QueryAllTasksPrioritiesRecordsCall queryAllTasksPrioritiesRecordsCall =
      QueryAllTasksPrioritiesRecordsCall();
  static DeactivateTaskCall deactivateTaskCall = DeactivateTaskCall();
  static GetUnityCall getUnityCall = GetUnityCall();
  static QueryAllCommentsBacklogsCall queryAllCommentsBacklogsCall =
      QueryAllCommentsBacklogsCall();
  static QueryAllCommentSubtasksCall queryAllCommentSubtasksCall =
      QueryAllCommentSubtasksCall();

  static TarefasSemPageEPerpageCall tarefasSemPageEPerpageCall =
      TarefasSemPageEPerpageCall();
  static AddUnityCall addUnityCall = AddUnityCall();
  static EditUnityCall editUnityCall = EditUnityCall();
  static DeleteUnityCall deleteUnityCall = DeleteUnityCall();
}

class DisciplineGroup {
  // Node.js backend: /api/v1/tasks (discipline is under tasks module)
  // Xano original: api:jt9TX_Hr
  static String getBaseUrl() => ApiConfig.tasksPath;
  static Map<String, String> headers = {};
  static DisciplineCall disciplineCall = DisciplineCall();
  static AddDisciplineCall addDisciplineCall = AddDisciplineCall();
  static EditDisciplineCall editDisciplineCall = EditDisciplineCall();
  static DeleteDisciplineCall deleteDisciplineCall = DeleteDisciplineCall();
}

class AddUnityCall {
  Future<ApiCallResponse> call({
    String? token = '',
    String? unity = '',
    int? companyId,
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();
    final ffApiRequestBody = '''
{
  "unity": "${escapeStringForJson(unity)}",
  "company_id": ${companyId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add Unity',
      apiUrl: '${baseUrl}/unity',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class EditUnityCall {
  Future<ApiCallResponse> call({
    int? unityId,
    String? unity = '',
    String? token = '',
    int? companyId,
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();
    final ffApiRequestBody = '''
{
  "unity_id": ${unityId},
  "updated_at": null,
  "deleted_at": null,
  "unity": "${escapeStringForJson(unity)}",
  "company_id": ${companyId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit Unity',
      apiUrl: '${baseUrl}/unity/${unityId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class DeleteUnityCall {
  Future<ApiCallResponse> call({
    int? unityId,
    String? token = '',
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();
    return ApiManager.instance.makeApiCall(
      callName: 'Delete Unity',
      apiUrl: '${baseUrl}/unity/${unityId}',
      callType: ApiCallType.DELETE,
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

class AddDisciplineCall {
  Future<ApiCallResponse> call({
    String? token = '',
    String? discipline = '',
    int? companyId,
  }) async {
    final baseUrl = DisciplineGroup.getBaseUrl();
    final ffApiRequestBody = '''
{
  "discipline": "${escapeStringForJson(discipline)}",
  "company_id": ${companyId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add Discipline',
      apiUrl: '${baseUrl}/creat_discipline',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class EditDisciplineCall {
  Future<ApiCallResponse> call({
    int? disciplineId,
    String? discipline = '',
    String? token = '',
    int? companyId,
  }) async {
    final baseUrl = DisciplineGroup.getBaseUrl();
    final ffApiRequestBody = '''
{
  "discipline_id": ${disciplineId},
  "discipline": "${escapeStringForJson(discipline)}",
  "company_id": ${companyId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit Discipline',
      apiUrl: '${baseUrl}/edit_discipline',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class DeleteDisciplineCall {
  Future<ApiCallResponse> call({
    int? disciplineId,
    String? token = '',
  }) async {
    final baseUrl = DisciplineGroup.getBaseUrl();
    final ffApiRequestBody = '''
{
  "discipline_id": ${disciplineId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Delete Discipline',
      apiUrl: '${baseUrl}/deleted_discipline',
      callType: ApiCallType.DELETE,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: true,
    );
  }
}

class EditTasksRecordCall {
  Future<ApiCallResponse> call({
    int? tasksId,
    String? bearerAuth = '',
    String? description = '',
    int? equipamentsTypesId,
    double? weight,
    int? unity,
    int? companyId,
    int? disciplineId,
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "description": "${escapeStringForJson(description)}",
  "equipaments_types_id": ${equipamentsTypesId},
  "weight": ${weight},
  "unity_id": ${unity},
  "company_id": ${companyId},
  "discipline_id": ${disciplineId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit tasks record',
      apiUrl: '${baseUrl}/tasks/${tasksId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class QueryAllTasksRecordsCall {
  Future<ApiCallResponse> call({
    int? page,
    int? perPage,
    String? bearerAuth = '',
    String? search = '',
    int? companyId,
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "page": ${page},
  "per_page": ${perPage},
  "search": "${escapeStringForJson(search)}",
  "company_id": ${companyId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Query all tasks records',
      apiUrl: '${baseUrl}/tasks_list',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? list(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
  int? nextPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.nextPage''',
      ));
  int? prevPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.prevPage''',
      ));
  String? type(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.items[:]._equipaments_types.type''',
      ));
}

class QueryAllIdsTasksCall {
  Future<ApiCallResponse> call({
    int? page,
    int? perPage,
    String? bearerAuth = '',
    String? search = '',
    int? companyId,
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "page": ${page},
  "per_page": ${perPage},
  "search": "${escapeStringForJson(search)}",
  "company_id": ${companyId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Query all ids tasks',
      apiUrl: '${baseUrl}/tasks_list_clone0',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List<int>? ids(dynamic response) => (getJsonField(
        response,
        r'''$[:].id''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
}

class AddTasksRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    String? description = '',
    double? weight,
    int? unity,
    int? companyId,
    int? disciplineId,
    double? amount,
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "description": "${escapeStringForJson(description)}",
  "weight": ${weight},
  "amount": ${amount},
  "unity_id": ${unity},
  "company_id": ${companyId},
  "discipline_id": ${disciplineId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add tasks record',
      apiUrl: '${baseUrl}/tasks',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class GetTasksRecordCall {
  Future<ApiCallResponse> call({
    int? tasksId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get tasks record',
      apiUrl: '${baseUrl}/tasks/${tasksId}',
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

class QueryAllTasksSemPaginacaoCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all tasks sem paginacao',
      apiUrl: '${baseUrl}/tasks',
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

  List? list(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
  int? nextPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.nextPage''',
      ));
  int? prevPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.prevPage''',
      ));
  String? type(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.items[:]._equipaments_types.type''',
      ));
}

class EditTasksPrioritiesRecordCall {
  Future<ApiCallResponse> call({
    int? tasksPrioritiesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "priority": "",
  "updated_at": 0,
  "deleted_at": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit tasks_priorities record',
      apiUrl: '${baseUrl}/tasks_priorities/${tasksPrioritiesId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class DeleteTasksPrioritiesRecordCall {
  Future<ApiCallResponse> call({
    int? tasksPrioritiesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete tasks_priorities record.',
      apiUrl: '${baseUrl}/tasks_priorities/${tasksPrioritiesId}',
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

class GetTasksPrioritiesRecordCall {
  Future<ApiCallResponse> call({
    int? tasksPrioritiesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get tasks_priorities record',
      apiUrl: '${baseUrl}/tasks_priorities/${tasksPrioritiesId}',
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

class AddTasksPrioritiesRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "priority": "",
  "updated_at": 0,
  "deleted_at": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add tasks_priorities record',
      apiUrl: '${baseUrl}/tasks_priorities',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class QueryAllTasksPrioritiesRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all tasks_priorities records',
      apiUrl: '${baseUrl}/tasks_priorities',
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

class DeactivateTaskCall {
  Future<ApiCallResponse> call({
    int? tasksId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Deactivate task',
      apiUrl: '${baseUrl}/tasks/${tasksId}',
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

class GetUnityCall {
  Future<ApiCallResponse> call({
    String? token = '',
    int? companyId,
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'get unity',
      apiUrl: '${baseUrl}/unity',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'token': token,
        'company_id': companyId,
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

  List<int>? id(dynamic response) => (getJsonField(
        response,
        r'''$[:].id''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
  List<String>? unity(dynamic response) => (getJsonField(
        response,
        r'''$[:].unity''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<String>(x))
          .withoutNulls
          .toList();
}

class QueryAllCommentsBacklogsCall {
  Future<ApiCallResponse> call({
    int? projectsBacklogsId,
    String? token = '',
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all comments backlogs',
      apiUrl: '${baseUrl}/comment_backlogs',
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
}

class QueryAllCommentSubtasksCall {
  Future<ApiCallResponse> call({
    String? token = '',
    int? subtasksId,
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all comment subtasks',
      apiUrl: '${baseUrl}/comment_subtasks',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'subtasks_id': subtasksId,
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

class DisciplineCall {
  Future<ApiCallResponse> call({
    String? token = '',
    int? companyId,
  }) async {
    final baseUrl = DisciplineGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Discipline',
      apiUrl: '${baseUrl}/discipline',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'company_id': companyId,
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

  List<int>? id(dynamic response) => (getJsonField(
        response,
        r'''$[:].id''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
  List<String>? discipline(dynamic response) => (getJsonField(
        response,
        r'''$[:].discipline''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<String>(x))
          .withoutNulls
          .toList();
}

class TarefasSemPageEPerpageCall {
  Future<ApiCallResponse> call({
    String? token = '',
  }) async {
    final baseUrl = TasksGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'tarefas sem page e perpage',
      apiUrl: '${baseUrl}/all_tasks_template',
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

  List<int>? id(dynamic response) => (getJsonField(
        response,
        r'''$[:].id''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
  List<String>? description(dynamic response) => (getJsonField(
        response,
        r'''$[:].description''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<String>(x))
          .withoutNulls
          .toList();
}

/// End Tasks Group Code



/// Start Sprints Group Code

class SprintsGroup {
  // Node.js backend: /api/v1/sprints
  // Xano original: api:PHt4_kir
  static String getBaseUrl() =>
      ApiConfig.sprintsPath;
  static Map<String, String> headers = {
  };
  static GetSprintsRecordCall getSprintsRecordCall = GetSprintsRecordCall();
  static GetSprintsTasksStatusRecordCall getSprintsTasksStatusRecordCall =
      GetSprintsTasksStatusRecordCall();
  static QueryAllSprintsRecordsCall queryAllSprintsRecordsCall =
      QueryAllSprintsRecordsCall();
  static EditSprintsStatusesRecordCall editSprintsStatusesRecordCall =
      EditSprintsStatusesRecordCall();
  static GetSprintsTasksRecordCall getSprintsTasksRecordCall =
      GetSprintsTasksRecordCall();
  static QueryAllSprintsTasksStatusRecordsCall
      queryAllSprintsTasksStatusRecordsCall =
      QueryAllSprintsTasksStatusRecordsCall();
  static QueryAllSprintsStatusesRecordsCall queryAllSprintsStatusesRecordsCall =
      QueryAllSprintsStatusesRecordsCall();
  static EditSprintsTasksRecordCall editSprintsTasksRecordCall =
      EditSprintsTasksRecordCall();
  static AddSprintsRecordCall addSprintsRecordCall = AddSprintsRecordCall();
  static EditStatusTaskCall editStatusTaskCall = EditStatusTaskCall();
  static EditStatusTaskLISTACall editStatusTaskLISTACall =
      EditStatusTaskLISTACall();
  static DeleteSprintsTasksRecordCall deleteSprintsTasksRecordCall =
      DeleteSprintsTasksRecordCall();
  static DeleteSprintsRecordCall deleteSprintsRecordCall =
      DeleteSprintsRecordCall();
  static EditSprintsRecordCall editSprintsRecordCall = EditSprintsRecordCall();
  static QueryAllSprintsTasksRecordsCall queryAllSprintsTasksRecordsCall =
      QueryAllSprintsTasksRecordsCall();
  static GetSprintsStatusesRecordCall getSprintsStatusesRecordCall =
      GetSprintsStatusesRecordCall();
  static DeleteSprintsStatusesRecordCall deleteSprintsStatusesRecordCall =
      DeleteSprintsStatusesRecordCall();
  static AddSprintsStatusesRecordCall addSprintsStatusesRecordCall =
      AddSprintsStatusesRecordCall();
  static AddSprintsTasksStatusRecordCall addSprintsTasksStatusRecordCall =
      AddSprintsTasksStatusRecordCall();
  static AddSprintsTasksRecordCall addSprintsTasksRecordCall =
      AddSprintsTasksRecordCall();
  static DeleteSprintsTasksStatusRecordCall deleteSprintsTasksStatusRecordCall =
      DeleteSprintsTasksStatusRecordCall();
  static EditSprintsTasksStatusRecordCall editSprintsTasksStatusRecordCall =
      EditSprintsTasksStatusRecordCall();
  static SprintsGraficoFiltroCall sprintsGraficoFiltroCall =
      SprintsGraficoFiltroCall();
  static CountsSubtasksCall countsSubtasksCall = CountsSubtasksCall();
}

class GetSprintsRecordCall {
  Future<ApiCallResponse> call({
    int? sprintsId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get sprints record',
      apiUrl: '${baseUrl}/${sprintsId}',
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

class GetSprintsTasksStatusRecordCall {
  Future<ApiCallResponse> call({
    int? sprintsTasksStatusesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get sprints_tasks_status record',
      apiUrl: '${baseUrl}/tasks/statuses/${sprintsTasksStatusesId}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'sprints_tasks_status_id': sprintsTasksStatusesId,
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

class QueryAllSprintsRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? page,
    int? perPage,
    int? projectsId,
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all sprints records',
      apiUrl: '${baseUrl}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'page': page,
        'per_page': perPage,
        'projects_id': projectsId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? listFuturas(dynamic response) => getJsonField(
        response,
        r'''$.sprints_futura.items''',
        true,
      ) as List?;
  List? listConcluidas(dynamic response) => getJsonField(
        response,
        r'''$.sprints_concluida.items''',
        true,
      ) as List?;
  List? listAtivas(dynamic response) => getJsonField(
        response,
        r'''$.sprints_ativa.items''',
        true,
      ) as List?;
}

class EditSprintsStatusesRecordCall {
  Future<ApiCallResponse> call({
    int? sprintsStatusesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "status": "",
  "updated_at": 0,
  "deleted_at": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit sprints_statuses record',
      apiUrl: '${baseUrl}/statuses/${sprintsStatusesId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class GetSprintsTasksRecordCall {
  Future<ApiCallResponse> call({
    int? sprintsTasksId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get sprints_tasks record',
      apiUrl: '${baseUrl}/tasks/${sprintsTasksId}',
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

class QueryAllSprintsTasksStatusRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? sprintsTasksStatusesId,
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all sprints_tasks_status records',
      apiUrl: '${baseUrl}/tasks/statuses',
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

class QueryAllSprintsStatusesRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all sprints_statuses records',
      apiUrl: '${baseUrl}/statuses',
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

class EditSprintsTasksRecordCall {
  Future<ApiCallResponse> call({
    int? sprintsTasksId,
    String? bearerAuth = '',
    int? sprintsId,
    int? teamsId,
    int? sprintsTasksStatusesId,
    List<int>? tasks2IdList,
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();
    final tasks2Id = _serializeList(tasks2IdList);

    final ffApiRequestBody = '''
{
  "sprints_id":${sprintsId},
  "teams_id":${teamsId},
  "sprints_tasks_statuses_id":${sprintsTasksStatusesId},
  "tasks2_id":${tasks2Id}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit sprints_tasks record',
      apiUrl: '${baseUrl}/tasks/${sprintsTasksId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class AddSprintsRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    String? title = '',
    String? objective = '',
    String? startDate,
    String? endDate,
    int? progressPercentage,
    int? projectsId,
    int? sprintsStatusesId,
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "title":"${escapeStringForJson(title)}",
  "objective":"${escapeStringForJson(objective)}",
  "start_date":"${escapeStringForJson(startDate)}",
  "end_date":"${escapeStringForJson(endDate)}",
  "progress_percentage":${progressPercentage},
  "projects_id":${projectsId},
  "sprints_statuses_id":${sprintsStatusesId} 
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add sprints record',
      apiUrl: '${baseUrl}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  String? message(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.message''',
      ));
}

class EditStatusTaskCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? sprintsTasksId,
    int? sprintsTasksStatusesId,
    String? scheduledFor = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "sprints_tasks_id": ${sprintsTasksId},
  "sprints_tasks_statuses_id": ${sprintsTasksStatusesId},
  "scheduled_for": "${escapeStringForJson(scheduledFor)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit status task',
      apiUrl: '${baseUrl}/tasks/status',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class EditStatusTaskLISTACall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    List<int>? sprintsTasksIdList,
    int? sprintsTasksStatusesId,
    String? scheduledFor = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();
    final sprintsTasksId = _serializeList(sprintsTasksIdList);

    final ffApiRequestBody = '''
{
  "sprints_tasks_id": ${sprintsTasksId},
  "sprints_tasks_statuses_id": ${sprintsTasksStatusesId},
"scheduled_for": "${escapeStringForJson(scheduledFor)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit status task LISTA',
      apiUrl: '${baseUrl}/tasks/status/list',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class DeleteSprintsTasksRecordCall {
  Future<ApiCallResponse> call({
    int? sprintsTasksId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete sprints_tasks record.',
      apiUrl: '${baseUrl}/tasks/${sprintsTasksId}',
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

class DeleteSprintsRecordCall {
  Future<ApiCallResponse> call({
    int? sprintsId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete sprints record.',
      apiUrl: '${baseUrl}/${sprintsId}',
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

class EditSprintsRecordCall {
  Future<ApiCallResponse> call({
    int? sprintsId,
    String? bearerAuth = '',
    String? title = '',
    String? objective = '',
    String? startDate,
    String? endDate,
    int? progressPercentage,
    int? projectsId,
    int? sprintsStatusesId,
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "title":"${escapeStringForJson(title)}",
  "objective":"${escapeStringForJson(objective)}",
  "start_date":"${escapeStringForJson(startDate)}",
  "end_date":"${escapeStringForJson(endDate)}",
  "progress_percentage":${progressPercentage},
  "projects_id":${projectsId},
  "sprints_statuses_id": ${sprintsStatusesId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit sprints record',
      apiUrl: '${baseUrl}/${sprintsId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class QueryAllSprintsTasksRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? projectsId,
    int? sprintsId,
    int? search,
    List<int>? teamsIdList,
    int? fieldsId,
    int? rowsId,
    int? sectionsId,
    int? pagePen,
    int? perPagePen,
    int? pageAnd,
    int? perPageAnd,
    int? pageIns,
    int? perPageIns,
    int? pageSem,
    int? perPageSem,
    int? pageConc,
    int? perPageConc,
    String? scheduledFor = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();
    final teamsId = _serializeList(teamsIdList);

    final ffApiRequestBody = '''
{
  "projects_id": ${projectsId},
  "sprints_id": ${sprintsId},
  "teams_id": ${teamsId},
  "fields_id": ${fieldsId},
  "rows_id": ${rowsId},
  "search": ${search},
  "sections_id": ${sectionsId},
  "pagePen": ${pagePen},
  "per_pagePen": ${perPagePen},
  "pageAnd": ${pageAnd},
  "per_pageAnd": ${perPageAnd},
  "pageIns": ${pageIns},
  "per_pageIns": ${perPageIns},
  "pageSem": ${pageSem},
  "per_pageSem": ${perPageSem},
  "pageConc": ${pageConc},
  "per_pageConc": ${perPageConc},
  "scheduled_for": "${escapeStringForJson(scheduledFor)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Query all sprints_tasks records',
      apiUrl: '${baseUrl}/sprints_tasks_painel',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? pendentes(dynamic response) => getJsonField(
        response,
        r'''$.sprints_tasks_pendentes.items''',
        true,
      ) as List?;
  List? andamentos(dynamic response) => getJsonField(
        response,
        r'''$.sprints_tasks_em_andamento.items''',
        true,
      ) as List?;
  List? concluidas(dynamic response) => getJsonField(
        response,
        r'''$.sprints_tasks_concluidas.items''',
        true,
      ) as List?;
  List? semSucesso(dynamic response) => getJsonField(
        response,
        r'''$.sprints_tasks_sem_sucesso.items''',
        true,
      ) as List?;
  List? inspecoes(dynamic response) => getJsonField(
        response,
        r'''$.sprints_tasks_inspecao.items''',
        true,
      ) as List?;
  int? curPageAnd(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_em_andamento.curPage''',
      ));
  int? curPagePen(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_pendentes.curPage''',
      ));
  int? curPageCon(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_concluidas.curPage''',
      ));
  int? curPageSucess(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_sem_sucesso.curPage''',
      ));
  int? curPageIns(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_inspecao.curPage''',
      ));
  int? aNDitemsReceived(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_em_andamento.itemsReceived''',
      ));
  int? aNDitemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_em_andamento.itemsTotal''',
      ));
  int? pENitemsReceived(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_pendentes.itemsReceived''',
      ));
  int? pENitemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_pendentes.itemsTotal''',
      ));
  int? cONCitemsReceived(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_concluidas.itemsReceived''',
      ));
  int? cONCitemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_concluidas.itemsTotal''',
      ));
  int? sEMitemsReceived(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_sem_sucesso.itemsReceived''',
      ));
  int? sEMitemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_sem_sucesso.itemsTotal''',
      ));
  int? iNSitemsReceived(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_inspecao.itemsReceived''',
      ));
  int? iNSitemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_inspecao.itemsTotal''',
      ));
  int? aNDpageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_em_andamento.pageTotal''',
      ));
  int? pENpageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_pendentes.pageTotal''',
      ));
  int? cONCpageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_concluidas.pageTotal''',
      ));
  int? sEMpageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_sem_sucesso.pageTotal''',
      ));
  int? iNSpageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.sprints_tasks_inspecao.pageTotal''',
      ));
  bool? hasteamcreated(dynamic response) => castToType<bool>(getJsonField(
        response,
        r'''$.has_team_created''',
      ));
}

class GetSprintsStatusesRecordCall {
  Future<ApiCallResponse> call({
    int? sprintsStatusesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get sprints_statuses record',
      apiUrl: '${baseUrl}/statuses/${sprintsStatusesId}',
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

class DeleteSprintsStatusesRecordCall {
  Future<ApiCallResponse> call({
    int? sprintsStatusesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete sprints_statuses record.',
      apiUrl: '${baseUrl}/statuses/${sprintsStatusesId}',
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

class AddSprintsStatusesRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "status": "",
  "updated_at": 0,
  "deleted_at": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add sprints_statuses record',
      apiUrl: '${baseUrl}/statuses',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class AddSprintsTasksStatusRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "status": "",
  "updated_at": 0,
  "deleted_at": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add sprints_tasks_status record',
      apiUrl: '${baseUrl}/tasks/statuses',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class AddSprintsTasksRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? sprintsId,
    int? teamsId,
    List<int>? backlogsIdList,
    List<int>? subtasksIdList,
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();
    final backlogsId = _serializeList(backlogsIdList);
    final subtasksId = _serializeList(subtasksIdList);

    final ffApiRequestBody = '''
{
  "sprints_id": ${sprintsId},
  "teams_id": ${teamsId},
  "backlogs_id": ${backlogsId},
  "subtasks_id": ${subtasksId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add sprints_tasks record',
      apiUrl: '${baseUrl}/tasks',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class DeleteSprintsTasksStatusRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? sprintsTasksStatusesId,
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete sprints_tasks_status record.',
      apiUrl: '${baseUrl}/tasks/statuses/${sprintsTasksStatusesId}',
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

class EditSprintsTasksStatusRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? sprintsTasksStatusesId,
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "sprints_tasks_status_id": 0,
  "status": "",
  "updated_at": 0,
  "deleted_at": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit sprints_tasks_status record',
      apiUrl: '${baseUrl}/tasks/statuses/${sprintsTasksStatusesId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class SprintsGraficoFiltroCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    String? token = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Sprints grafico filtro',
      apiUrl: '${baseUrl}/chart',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'projects_id': projectsId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
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
  List<String>? title(dynamic response) => (getJsonField(
        response,
        r'''$[:].title''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<String>(x))
          .withoutNulls
          .toList();
}

class CountsSubtasksCall {
  Future<ApiCallResponse> call({
    int? projectsBacklogsId,
    String? token = '',
  }) async {
    final baseUrl = SprintsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'counts subtasks',
      apiUrl: '${baseUrl}/subtasks/count',
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

  double? totalpai(dynamic response) => castToType<double>(getJsonField(
        response,
        r'''$.total_pai''',
      ));
  double? totalsomafilhos(dynamic response) => castToType<double>(getJsonField(
        response,
        r'''$.total_soma_filhos''',
      ));
  double? totaldonefilhos(dynamic response) => castToType<double>(getJsonField(
        response,
        r'''$.total_done_filhos''',
      ));
  double? totaldisponivelcriacao(dynamic response) =>
      castToType<double>(getJsonField(
        response,
        r'''$.total_disponivel_criacao''',
      ));
}

/// End Sprints Group Code



/// Start Sendgrid Validation Group Code

class SendgridValidationGroup {
  // Node.js backend: /api/v1/auth (password recovery endpoints are under auth)
  // Xano original: api:wkcZ-8fl
  static String getBaseUrl() =>
      ApiConfig.authPath;
  static Map<String, String> headers = {
  };
  static ThisEndpointIsUsedToValidateThatSendgridIsWorkingCall
      thisEndpointIsUsedToValidateThatSendgridIsWorkingCall =
      ThisEndpointIsUsedToValidateThatSendgridIsWorkingCall();
  static AcaoDeValidarCodigoParaAAlteracaoDeSenhaCall
      acaoDeValidarCodigoParaAAlteracaoDeSenhaCall =
      AcaoDeValidarCodigoParaAAlteracaoDeSenhaCall();
  static ApiParaResetarASenhaDoUsuarioComUmaNovaSenhaCall
      apiParaResetarASenhaDoUsuarioComUmaNovaSenhaCall =
      ApiParaResetarASenhaDoUsuarioComUmaNovaSenhaCall();
  static ApiParaMandarOCodigoDeRecuperacaoParaOEmailCall
      apiParaMandarOCodigoDeRecuperacaoParaOEmailCall =
      ApiParaMandarOCodigoDeRecuperacaoParaOEmailCall();
}

class ThisEndpointIsUsedToValidateThatSendgridIsWorkingCall {
  Future<ApiCallResponse> call() async {
    final baseUrl = SendgridValidationGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "to_email": "",
  "subject": "",
  "body": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'This endpoint is used to validate that sendgrid is working.',
      apiUrl: '${baseUrl}/sendgrid/validate',
      callType: ApiCallType.POST,
      headers: {
      },
      params: {},
      body: ffApiRequestBody,
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

    final ffApiRequestBody = '''
{
  "code": ${code},
  "users_email": "${escapeStringForJson(usersEmail)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Acao de validar codigo para a alteracao de senha',
      apiUrl: '${baseUrl}/sendgrid/validate/code',
      callType: ApiCallType.POST,
      headers: {
      },
      params: {},
      body: ffApiRequestBody,
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

class ApiParaResetarASenhaDoUsuarioComUmaNovaSenhaCall {
  Future<ApiCallResponse> call({
    String? newPassword = '',
    String? usersEmail = '',
  }) async {
    final baseUrl = SendgridValidationGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "is_valid": true,
  "new_password": "${escapeStringForJson(newPassword)}",
  "users_email": "${escapeStringForJson(usersEmail)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'api para resetar a senha do usuario com uma nova senha',
      apiUrl: '${baseUrl}/sendgrid/reset/pass',
      callType: ApiCallType.PATCH,
      headers: {
      },
      params: {},
      body: ffApiRequestBody,
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

    final ffApiRequestBody = '''
{
  "email_to_recover": "${escapeStringForJson(emailToRecover)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'api para mandar o codigo de recuperacao para o email',
      apiUrl: '${baseUrl}/sendgrid/send/code',
      callType: ApiCallType.POST,
      headers: {
      },
      params: {},
      body: ffApiRequestBody,
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

/// Start Projects  Group Code

class ProjectsGroup {
  // Node.js backend: /api/v1/projects
  // Xano original: api:D22xF0aw
  static String getBaseUrl() =>
      ApiConfig.projectsPath;
  static Map<String, String> headers = {
  };
  static EditTeamsLeadersRecordCall editTeamsLeadersRecordCall =
      EditTeamsLeadersRecordCall();
  static QueryToGetAllLidersFromATeamCall queryToGetAllLidersFromATeamCall =
      QueryToGetAllLidersFromATeamCall();
  static DeleteTeamsMembersRecordCall deleteTeamsMembersRecordCall =
      DeleteTeamsMembersRecordCall();
  static AddProjectsBacklogsRecordCall addProjectsBacklogsRecordCall =
      AddProjectsBacklogsRecordCall();
  static AddProjectsStatusesRecordCall addProjectsStatusesRecordCall =
      AddProjectsStatusesRecordCall();
  static ProjectsBacklogsBulkCall projectsBacklogsBulkCall =
      ProjectsBacklogsBulkCall();
  static EditProjectsWorksSituationsRecordCall
      editProjectsWorksSituationsRecordCall =
      EditProjectsWorksSituationsRecordCall();
  static QueryAllTeamsRecordsCall queryAllTeamsRecordsCall =
      QueryAllTeamsRecordsCall();
  static GetProjectsWorksSituationsRecordCall
      getProjectsWorksSituationsRecordCall =
      GetProjectsWorksSituationsRecordCall();
  static EditProjectsStatusesRecordCall editProjectsStatusesRecordCall =
      EditProjectsStatusesRecordCall();
  static AddTeamsRecordCall addTeamsRecordCall = AddTeamsRecordCall();
  static GetProjectsStatusesRecordCall getProjectsStatusesRecordCall =
      GetProjectsStatusesRecordCall();
  static DeleteProjectsBacklogsRecordCall deleteProjectsBacklogsRecordCall =
      DeleteProjectsBacklogsRecordCall();
  static DeleteTeamsLeadersRecordCall deleteTeamsLeadersRecordCall =
      DeleteTeamsLeadersRecordCall();
  static EditProjectsRecordCall editProjectsRecordCall =
      EditProjectsRecordCall();
  static GetProjectsBacklogsRecordCall getProjectsBacklogsRecordCall =
      GetProjectsBacklogsRecordCall();
  static QueryAllIdsProjectsBacklogsRecordCall
      queryAllIdsProjectsBacklogsRecordCall =
      QueryAllIdsProjectsBacklogsRecordCall();
  static EquipamentsTypeCall equipamentsTypeCall = EquipamentsTypeCall();
  static DeleteProjectsUsersRecordCall deleteProjectsUsersRecordCall =
      DeleteProjectsUsersRecordCall();
  static EditProjectsUsersRecordCall editProjectsUsersRecordCall =
      EditProjectsUsersRecordCall();
  static DeleteProjectsRecordCall deleteProjectsRecordCall =
      DeleteProjectsRecordCall();
  static EditaLiderDoTimeCall editaLiderDoTimeCall = EditaLiderDoTimeCall();
  static DeleteProjectsWorksSituationsRecordCall
      deleteProjectsWorksSituationsRecordCall =
      DeleteProjectsWorksSituationsRecordCall();
  static QueryAllTeamsLeadersRecordsCall queryAllTeamsLeadersRecordsCall =
      QueryAllTeamsLeadersRecordsCall();
  static ImportCronogramaCall importCronogramaCall = ImportCronogramaCall();
  static GetTeamsMembersRecordCall getTeamsMembersRecordCall =
      GetTeamsMembersRecordCall();
  static QueryAllProjectsStatusesRecordsCall
      queryAllProjectsStatusesRecordsCall =
      QueryAllProjectsStatusesRecordsCall();
  static EditTeamsRecordCall editTeamsRecordCall = EditTeamsRecordCall();
  static EditTeamsMembersRecordCall editTeamsMembersRecordCall =
      EditTeamsMembersRecordCall();
  static QueryAllProjectsRecordsCall queryAllProjectsRecordsCall =
      QueryAllProjectsRecordsCall();
  static AddTeamsLeadersRecordCall addTeamsLeadersRecordCall =
      AddTeamsLeadersRecordCall();
  static AddProjectsRecordCall addProjectsRecordCall = AddProjectsRecordCall();
  static GetTeamsLeadersRecordCall getTeamsLeadersRecordCall =
      GetTeamsLeadersRecordCall();
  static GetTeamsRecordCall getTeamsRecordCall = GetTeamsRecordCall();
  static AddTeamsMembersRecordCall addTeamsMembersRecordCall =
      AddTeamsMembersRecordCall();
  static GetProjectsRecordCall getProjectsRecordCall = GetProjectsRecordCall();
  static AddProjectsUsersRecordCall addProjectsUsersRecordCall =
      AddProjectsUsersRecordCall();
  static QueryAllProjectsUsersRecordsCall queryAllProjectsUsersRecordsCall =
      QueryAllProjectsUsersRecordsCall();
  static DeleteProjectsStatusesRecordCall deleteProjectsStatusesRecordCall =
      DeleteProjectsStatusesRecordCall();
  static AddProjectsWorksSituationsRecordCall
      addProjectsWorksSituationsRecordCall =
      AddProjectsWorksSituationsRecordCall();
  static QueryAllTeamsMembersRecordsCall queryAllTeamsMembersRecordsCall =
      QueryAllTeamsMembersRecordsCall();
  static GetProjectsUsersRecordCall getProjectsUsersRecordCall =
      GetProjectsUsersRecordCall();
  static DeleteTeamsRecordCall deleteTeamsRecordCall = DeleteTeamsRecordCall();
  static FiltraOsCamposCall filtraOsCamposCall = FiltraOsCamposCall();
  static GetAllProjectsBacklogsCall getAllProjectsBacklogsCall =
      GetAllProjectsBacklogsCall();
  static EditaUmMembroDoTimeCall editaUmMembroDoTimeCall =
      EditaUmMembroDoTimeCall();
  static QueryAllProjectsWorksSituationsRecordsCall
      queryAllProjectsWorksSituationsRecordsCall =
      QueryAllProjectsWorksSituationsRecordsCall();
  static EditProjectsBacklogsRecordCall editProjectsBacklogsRecordCall =
      EditProjectsBacklogsRecordCall();
  static AddTasksBacklogManualCall addTasksBacklogManualCall =
      AddTasksBacklogManualCall();
  static CheckTaskBacklogCall checkTaskBacklogCall = CheckTaskBacklogCall();
  static EditTaskBacklogCall editTaskBacklogCall = EditTaskBacklogCall();
  static AddSubtasksCall addSubtasksCall = AddSubtasksCall();
  static EditSubtasksCall editSubtasksCall = EditSubtasksCall();
  static GetSubtasksCall getSubtasksCall = GetSubtasksCall();
  static GetUnityCall getUnityCall = GetUnityCall();
}

class EditTeamsLeadersRecordCall {
  Future<ApiCallResponse> call({
    int? teamsLeadersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "users_id": 0,
  "teams_id": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit teams_leaders record',
      apiUrl: '${baseUrl}/teams_leaders/${teamsLeadersId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class QueryToGetAllLidersFromATeamCall {
  Future<ApiCallResponse> call({
    int? teamsId,
    int? projectsId,
    int? page,
    int? perPage,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query to get all liders from a team',
      apiUrl: '${baseUrl}/teams_leaders/all/${teamsId}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'projects_id': projectsId,
        'page': page,
        'per_page': perPage,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? list(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
}

class DeleteTeamsMembersRecordCall {
  Future<ApiCallResponse> call({
    int? teamsMembersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete teams_members record.',
      apiUrl: '${baseUrl}/teams_members/${teamsMembersId}',
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

class AddProjectsBacklogsRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? projectsId,
    dynamic? listaTasksJson,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    // Inject quality_status_id into each task item
    final modifiedList = (listaTasksJson as List<dynamic>).map((item) {
      if (item is Map) {
        final Map<String, dynamic> newItem = Map<String, dynamic>.from(item);
        newItem['quality_status_id'] = 1;
        newItem['projects_backlogs_statuses_id'] = 1;
        return newItem;
      }
      return item;
    }).toList();

    final listaTasks = _serializeJson(modifiedList, true);
    final ffApiRequestBody = '''
{
  "projects_id": ${projectsId},
  "lista_tasks": ${listaTasks}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add projects backlogs record',
      apiUrl: '${baseUrl}/backlogs',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class AddProjectsStatusesRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "status": "",
  "updated_at": 0,
  "deleted_at": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add projects_statuses record',
      apiUrl: '${baseUrl}/projects_statuses',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class ProjectsBacklogsBulkCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? projectsId,
    int? equipamentsTypesId,
    String? description = '',
    double? weight,
    int? unityId,
    double? quantity,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "projects_id": ${projectsId},
  "equipaments_types_id": ${equipamentsTypesId},
  "description": "${escapeStringForJson(description)}",
  "weight": ${weight},
  "unity_id": ${unityId},
  "quantity": ${quantity}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'projects backlogs bulk',
      apiUrl: '${baseUrl}/backlogs/bulk',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class EditProjectsWorksSituationsRecordCall {
  Future<ApiCallResponse> call({
    int? projectsWorksSituationsId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "status": "",
  "updated_at": 0,
  "deleted_at": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit projects_works_situations record',
      apiUrl:
          '${baseUrl}/projects_works_situations/${projectsWorksSituationsId}',
      callType: ApiCallType.PATCH,
      headers: {
      },
      params: {},
      body: ffApiRequestBody,
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

class QueryAllTeamsRecordsCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    int? teamsId,
    int? page,
    int? perPage,
    String? bearerAuth = '',
    String? search = '',
    List<int>? usersRolesIdList,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();
    final usersRolesId = _serializeList(usersRolesIdList);

    final ffApiRequestBody = '''
{
  "teams_id":${teamsId},
  "page":${page},
  "per_page":${perPage},
  "search": "${escapeStringForJson(search)}",
  "users_roles_id": ${usersRolesId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Query all teams records',
      apiUrl: '${baseUrl}/teams_list/all/${projectsId}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? list(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
  int? itemsReceived(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsReceived''',
      ));
  int? itemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsTotal''',
      ));
  int? prevPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.prevPage''',
      ));
  int? pageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.pageTotal''',
      ));
}

class GetProjectsWorksSituationsRecordCall {
  Future<ApiCallResponse> call({
    int? projectsWorksSituationsId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get projects_works_situations record',
      apiUrl:
          '${baseUrl}/projects_works_situations/${projectsWorksSituationsId}',
      callType: ApiCallType.GET,
      headers: {
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

class EditProjectsStatusesRecordCall {
  Future<ApiCallResponse> call({
    int? projectsStatusesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "status": "",
  "updated_at": 0,
  "deleted_at": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit projects_statuses record',
      apiUrl: '${baseUrl}/projects_statuses/${projectsStatusesId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class AddTeamsRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    String? name = '',
    int? projectsId,
    List<int>? usersOnTeamList,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();
    final usersOnTeam = _serializeList(usersOnTeamList);

    final ffApiRequestBody = '''
{
  "name": "${escapeStringForJson(name)}",
  "projects_id": ${projectsId},
  "users_on_team": ${usersOnTeam}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add teams record',
      apiUrl: '${baseUrl}/teams',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class GetProjectsStatusesRecordCall {
  Future<ApiCallResponse> call({
    int? projectsStatusesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get projects_statuses record',
      apiUrl: '${baseUrl}/projects_statuses/${projectsStatusesId}',
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

class DeleteProjectsBacklogsRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? projectsBacklogsId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete projects backlogs record',
      apiUrl: '${baseUrl}/backlogs/${projectsBacklogsId}',
      callType: ApiCallType.DELETE,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
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

class DeleteTeamsLeadersRecordCall {
  Future<ApiCallResponse> call({
    int? teamsLeadersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete teams_leaders record.',
      apiUrl: '${baseUrl}/teams_leaders/${teamsLeadersId}',
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

class EditProjectsRecordCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    String? bearerAuth = '',
    String? registrationNumber = '',
    String? name = '',
    String? projectCreationDate = '',
    String? originRegistration = '',
    String? art = '',
    String? rrt = '',
    String? cib = '',
    String? realStateRegistration = '',
    String? startDate = '',
    String? permitNumber = '',
    String? cnae = '',
    String? situationDate = '',
    String? responsible = '',
    String? cep = '',
    String? city = '',
    String? number = '',
    String? state = '',
    String? country = '',
    String? street = '',
    String? complement = '',
    String? cnpj = '',
    int? completionPercentage,
    int? projectsStatusesId,
    int? projectsWorksSituationsId,
    String? category = '',
    String? destination = '',
    String? projectWorkType = '',
    String? resultingWorkArea = '',
    FFUploadedFile? pdf,
    String? neighbourhood = '',
    int? companyId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Edit projects record',
      apiUrl: '${baseUrl}/${projectsId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'registration_number': registrationNumber,
        'name': name,
        'project_creation_date': projectCreationDate,
        'origin_registration': originRegistration,
        'art': art,
        'rrt': rrt,
        'cib': cib,
        'real_state_registration': realStateRegistration,
        'start_date': startDate,
        'permit_number': permitNumber,
        'cnae': cnae,
        'situation_date': situationDate,
        'responsible': responsible,
        'cep': cep,
        'city': city,
        'number': number,
        'state': state,
        'country': country,
        'street': street,
        'complement': complement,
        'cnpj': cnpj,
        'completion_percentage': completionPercentage,
        'projects_statuses_id': projectsStatusesId,
        'projects_works_situations_id': projectsWorksSituationsId,
        'category': category,
        'destination': destination,
        'project_work_type': projectWorkType,
        'resulting_work_area': resultingWorkArea,
        'pdf': pdf,
        'neighbourhood': neighbourhood,
        'company_id': companyId,
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

class GetProjectsBacklogsRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? page,
    int? perPage,
    int? projectsId,
    bool? sprintAdded = false,
    String? search = '',
    List<int>? fieldsIdList,
    List<int>? sectionsIdList,
    List<int>? rowsIdList,
    List<int>? trackersIdList,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();
    final fieldsId = _serializeList(fieldsIdList);
    final sectionsId = _serializeList(sectionsIdList);
    final rowsId = _serializeList(rowsIdList);
    final trackersId = _serializeList(trackersIdList);

    final ffApiRequestBody = '''
{
  "page": ${page},
  "per_page": ${perPage},
  "sprint_added": ${sprintAdded},
  "search": "${escapeStringForJson(search)}",
  "fields_id": ${fieldsId},
  "sections_id": ${sectionsId},
  "rows_id": ${rowsId},
  "trackers_id": ${trackersId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Get projects backlogs record',
      apiUrl: '${baseUrl}/projects_backlogs_list/${projectsId}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  int? itemsReceived(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsReceived''',
      ));
  List? list(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
  dynamic nextPage(dynamic response) => getJsonField(
        response,
        r'''$.nextPage''',
      );
  dynamic prevPage(dynamic response) => getJsonField(
        response,
        r'''$.prevPage''',
      );
  int? itemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsTotal''',
      ));
  int? pageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.pageTotal''',
      ));
}

class QueryAllIdsProjectsBacklogsRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? page,
    int? perPage,
    int? projectsId,
    bool? sprintAdded = false,
    String? search = '',
    List<int>? fieldsIdList,
    List<int>? sectionsIdList,
    List<int>? rowsIdList,
    List<int>? trackersIdList,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();
    final fieldsId = _serializeList(fieldsIdList);
    final sectionsId = _serializeList(sectionsIdList);
    final rowsId = _serializeList(rowsIdList);
    final trackersId = _serializeList(trackersIdList);

    final ffApiRequestBody = '''
{
  "page": ${page},
  "per_page": ${perPage},
  "sprint_added": ${sprintAdded},
  "search": "${escapeStringForJson(search)}",
  "fields_id": ${fieldsId},
  "sections_id": ${sectionsId},
  "rows_id": ${rowsId},
  "trackers_id": ${trackersId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Query all ids projects backlogs record ',
      apiUrl: '${baseUrl}/projects_backlogs_list/${projectsId}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List<int>? ids(dynamic response) => (getJsonField(
        response,
        r'''$[:].id''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<int>(x))
          .withoutNulls
          .toList();
}

class EquipamentsTypeCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Equipaments type',
      apiUrl: '${baseUrl}/equipaments_types',
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

class DeleteProjectsUsersRecordCall {
  Future<ApiCallResponse> call({
    int? projectsUsersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete projects_users record.',
      apiUrl: '${baseUrl}/projects_users/${projectsUsersId}',
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

class EditProjectsUsersRecordCall {
  Future<ApiCallResponse> call({
    int? projectsUsersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "users_id": 0,
  "projects_id": 0,
  "updated_at": 0,
  "deleted_at": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit projects_users record',
      apiUrl: '${baseUrl}/projects_users/${projectsUsersId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class DeleteProjectsRecordCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete projects record.',
      apiUrl: '${baseUrl}/${projectsId}',
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

class EditaLiderDoTimeCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? teamsId,
    List<int>? listUsersList,
    String? nome = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();
    final listUsers = _serializeList(listUsersList);

    final ffApiRequestBody = '''
{
  "nome": "${escapeStringForJson(nome)}",
  "teams_id": ${teamsId},
  "list_users": ${listUsers}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edita lider do time',
      apiUrl: '${baseUrl}/leaders/edit',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class DeleteProjectsWorksSituationsRecordCall {
  Future<ApiCallResponse> call({
    int? projectsWorksSituationsId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete projects_works_situations record.',
      apiUrl:
          '${baseUrl}/projects_works_situations/${projectsWorksSituationsId}',
      callType: ApiCallType.DELETE,
      headers: {
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

class QueryAllTeamsLeadersRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? page,
    int? perPage,
    int? projectsId,
    int? teamsId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all teams_leaders records',
      apiUrl: '${baseUrl}/teams_leaders',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'page': page,
        'per_page': perPage,
        'projects_id': projectsId,
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

  List? list(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
  int? itemsReceived(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsReceived''',
      ));
  int? itemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsTotal''',
      ));
  int? nextPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.nextPage''',
      ));
  int? prevPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.prevPage''',
      ));
  int? pageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.pageTotal''',
      ));
  dynamic? user(dynamic response) => getJsonField(
        response,
        r'''$.items[:].user''',
      );
}

class GetTeamsMembersRecordCall {
  Future<ApiCallResponse> call({
    int? teamsMembersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get teams_members record',
      apiUrl: '${baseUrl}/teams_members/${teamsMembersId}',
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

class QueryAllProjectsStatusesRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all projects_statuses records',
      apiUrl: '${baseUrl}/projects_statuses',
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

class EditTeamsRecordCall {
  Future<ApiCallResponse> call({
    int? teamsId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "name": ""
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit teams record',
      apiUrl: '${baseUrl}/teams/${teamsId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class EditTeamsMembersRecordCall {
  Future<ApiCallResponse> call({
    int? teamsMembersId,
    String? bearerAuth = '',
    int? teamsId,
    int? usersId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "users_id": ${usersId},
  "teams_id": ${teamsId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit teams_members record',
      apiUrl: '${baseUrl}/teams_members/${teamsMembersId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class QueryAllProjectsRecordsCall {
  Future<ApiCallResponse> call({
    int? page,
    int? perPage,
    String? bearerAuth = '',
    String? search = '',
    int? companyId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all projects records',
      apiUrl: '${baseUrl}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'page': page,
        'per_page': perPage,
        'search': search,
        'company_id': companyId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  int? itemsReceived(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsReceived''',
      ));
  List? list(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
  int? itemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsTotal''',
      ));
  int? nextPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.nextPage''',
      ));
  int? prevPage(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.prevPage''',
      ));
  int? pageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.pageTotal''',
      ));
}

class AddTeamsLeadersRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "users_id": 0,
  "teams_id": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add teams_leaders record',
      apiUrl: '${baseUrl}/teams_leaders',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class AddProjectsRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    String? registrationNumber = '',
    String? name = '',
    int? projectCreationDate,
    String? originRegistration = '',
    String? art = '',
    String? rrt = '',
    String? cib = '',
    String? realStateRegistration = '',
    int? startDate,
    String? permitNumber = '',
    String? cnae = '',
    int? situationDate,
    String? responsible = '',
    String? cep = '',
    String? city = '',
    int? number,
    String? state = '',
    String? country = '',
    String? street = '',
    String? complement = '',
    String? cnpj = '',
    int? completionPercentage,
    int? projectsStatusesId,
    int? projectsWorksSituationsId,
    String? category = '',
    String? destination = '',
    String? projectWorkType = '',
    String? resultingWorkArea = '',
    FFUploadedFile? fileCno,
    String? neighbourhood = '',
    int? companyId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Add projects record',
      apiUrl: '${baseUrl}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'registration_number': registrationNumber,
        'name': name,
        'project_creation_date': projectCreationDate,
        'origin_registration': originRegistration,
        'art': art,
        'rrt': rrt,
        'cib': cib,
        'real_state_registration': realStateRegistration,
        'start_date': startDate,
        'permit_number': permitNumber,
        'cnae': cnae,
        'situation_date': situationDate,
        'responsible': responsible,
        'cep': cep,
        'city': city,
        'number': number,
        'state': state,
        'country': country,
        'street': street,
        'complement': complement,
        'cnpj': cnpj,
        'completion_percentage': completionPercentage,
        'projects_statuses_id': projectsStatusesId,
        'projects_works_situations_id': projectsWorksSituationsId,
        'category': category,
        'destination': destination,
        'project_work_type': projectWorkType,
        'resulting_work_area': resultingWorkArea,
        'neighbourhood': neighbourhood,
        'company_id': companyId,
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

  int? id(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.id''',
      ));
}

class GetTeamsLeadersRecordCall {
  Future<ApiCallResponse> call({
    int? teamsLeadersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get teams_leaders record',
      apiUrl: '${baseUrl}/teams_leaders/${teamsLeadersId}',
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

class GetTeamsRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? projectsId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get teams record',
      apiUrl: '${baseUrl}/teams',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'projects_id': projectsId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
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
  List<String>? name(dynamic response) => (getJsonField(
        response,
        r'''$[:].name''',
        true,
      ) as List?)
          ?.withoutNulls
          .map((x) => castToType<String>(x))
          .withoutNulls
          .toList();
}

class AddTeamsMembersRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? teamsId,
    int? usersId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "users_id": ${usersId},
  "teams_id": ${teamsId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add teams_members record',
      apiUrl: '${baseUrl}/teams_members',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class GetProjectsRecordCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get projects record',
      apiUrl: '${baseUrl}/${projectsId}',
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

class AddProjectsUsersRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "users_id": 0,
  "projects_id": 0,
  "updated_at": 0,
  "deleted_at": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add projects_users record',
      apiUrl: '${baseUrl}/projects_users',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class QueryAllProjectsUsersRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all projects_users records',
      apiUrl: '${baseUrl}/projects_users',
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

class DeleteProjectsStatusesRecordCall {
  Future<ApiCallResponse> call({
    int? projectsStatusesId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete projects_statuses record.',
      apiUrl: '${baseUrl}/projects_statuses/${projectsStatusesId}',
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

class AddProjectsWorksSituationsRecordCall {
  Future<ApiCallResponse> call() async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "status": "",
  "updated_at": 0,
  "deleted_at": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add projects_works_situations record',
      apiUrl: '${baseUrl}/projects_works_situations',
      callType: ApiCallType.POST,
      headers: {
      },
      params: {},
      body: ffApiRequestBody,
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

class QueryAllTeamsMembersRecordsCall {
  Future<ApiCallResponse> call({
    int? teamsId,
    int? page,
    int? perPage,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all teams_members records',
      apiUrl: '${baseUrl}/teams_members',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'teams_id': teamsId,
        'page': page,
        'per_page': perPage,
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

class GetProjectsUsersRecordCall {
  Future<ApiCallResponse> call({
    int? projectsUsersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get projects_users record',
      apiUrl: '${baseUrl}/projects_users/${projectsUsersId}',
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

class DeleteTeamsRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? teamsId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete teams record.',
      apiUrl: '${baseUrl}/teams/${teamsId}',
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

class FiltraOsCamposCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    List<int>? fieldsIdList,
    List<int>? sectionsIdList,
    List<int>? rowsIdList,
    List<int>? trackersIdList,
    int? projectsId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();
    final fieldsId = _serializeList(fieldsIdList);
    final sectionsId = _serializeList(sectionsIdList);
    final rowsId = _serializeList(rowsIdList);
    final trackersId = _serializeList(trackersIdList);

    final ffApiRequestBody = '''
{
  "projects_id": ${projectsId},
  "fields_id": ${fieldsId},
  "sections_id": ${sectionsId},
  "rows_id": ${rowsId},
  "trackers_id": ${trackersId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'filtra os campos ',
      apiUrl: '${baseUrl}/filters_project_backlog',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? fields(dynamic response) => getJsonField(
        response,
        r'''$.fields''',
        true,
      ) as List?;
  List? sections(dynamic response) => getJsonField(
        response,
        r'''$.sections''',
        true,
      ) as List?;
  List? rows(dynamic response) => getJsonField(
        response,
        r'''$.rows''',
        true,
      ) as List?;
  List? trackers(dynamic response) => getJsonField(
        response,
        r'''$.trackers''',
        true,
      ) as List?;
}

class GetAllProjectsBacklogsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get all projects backlogs',
      apiUrl: '${baseUrl}/backlogs',
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

class EditaUmMembroDoTimeCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    String? updatedAt = '',
    int? teamsId,
    List<int>? listUsersList,
    int? projectsId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();
    final listUsers = _serializeList(listUsersList);

    final ffApiRequestBody = '''
{
  "teams_id": ${teamsId},
  "list_users": ${listUsers},
"projects_id": ${projectsId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edita um membro do time',
      apiUrl: '${baseUrl}/members/edit',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class QueryAllProjectsWorksSituationsRecordsCall {
  Future<ApiCallResponse> call() async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all projects_works_situations records',
      apiUrl: '${baseUrl}/projects_works_situations',
      callType: ApiCallType.GET,
      headers: {
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

class EditProjectsBacklogsRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? projectsBacklogsId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "projects_id": 0,
  "tasks_id": 0,
  "projects_backlogs_statuses_id": 1,
  "trackers_id": 0,
  "sections_id": 0,
  "fields_id": 0,
  "rows_id": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit projects backlogs record',
      apiUrl: '${baseUrl}/backlogs/${projectsBacklogsId}',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class AddTasksBacklogManualCall {
  Future<ApiCallResponse> call({
    String? token = '',
    int? projectsId,
    double? quantity,
    int? equipamentsTypesId,
    String? description = '',
    double? weight,
    int? unityId,
    int? taskQuantity,
    int? disciplineId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "projects_id": ${projectsId},
  "equipaments_types_id": ${equipamentsTypesId},
  "description": "${escapeStringForJson(description)}",
  "weight": ${weight},
  "unity_id": ${unityId},
  "quantity": ${quantity},
  "task_quantity": ${taskQuantity},
  "discipline_id": ${disciplineId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add tasks backlog manual',
      apiUrl: '${baseUrl}/projects_backlogs_manual',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class CheckTaskBacklogCall {
  Future<ApiCallResponse> call({
    String? token = '',
    int? projectsId,
    int? tasksId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'check task backlog',
      apiUrl: '${baseUrl}/projects_backlogs_list/${projectsId}/check_taks',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'tasks_id': tasksId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? list(dynamic response) => getJsonField(
        response,
        r'''$''',
        true,
      ) as List?;
}

class EditTaskBacklogCall {
  Future<ApiCallResponse> call({
    String? token = '',
    String? description = '',
    int? equipamentsTypesId,
    double? weight,
    int? unityId,
    double? quantity,
    int? projectsBacklogsId,
    int? disciplineId,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "description": "${escapeStringForJson(description)}",
  "equipaments_types_id": ${equipamentsTypesId},
  "weight": ${weight},
  "unity_id": ${unityId},
  "quantity": ${quantity},
  "discipline_id": ${disciplineId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit task backlog',
      apiUrl: '${baseUrl}/backlogs/${projectsBacklogsId}',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class AddSubtasksCall {
  Future<ApiCallResponse> call({
    String? token = '',
    int? projectsBacklogsId,
    String? description = '',
    double? weight,
    bool? fixed,
    int? projectsId,
    double? quantity,
    int? taskQuantity,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "projects_backlogs_id": ${projectsBacklogsId},
  "description": "${escapeStringForJson(description)}",
  "weight": ${weight},
  "fixed": ${fixed},
  "projects_id": ${projectsId},
  "quantity": ${quantity},
  "task_quantity": ${taskQuantity}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'add subtasks',
      apiUrl: '${baseUrl}/subtasks',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class EditSubtasksCall {
  Future<ApiCallResponse> call({
    String? token = '',
    String? description = '',
    double? weight,
    bool? fixed,
    int? subtasksId,
    double? quantity,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "description": "${escapeStringForJson(description)}",
  "weight": ${weight},
  "fixed": ${fixed},
  "quantity": ${quantity}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit subtasks',
      apiUrl: '${baseUrl}/subtasks/${subtasksId}',
      callType: ApiCallType.PUT,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class GetSubtasksCall {
  Future<ApiCallResponse> call({
    int? projectsBacklogsId,
    String? token = '',
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get subtasks',
      apiUrl: '${baseUrl}/subtasks',
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
}

/// End Projects  Group Code

/// Start Manufacturers  Group Code

class ManufacturersGroup {
  // Node.js backend: /api/v1/manufacturers
  // Xano original: api:GxxNO093
  static String getBaseUrl() =>
      ApiConfig.manufacturersPath;
  static Map<String, String> headers = {
  };
  static AddManufacturersRecordCall addManufacturersRecordCall =
      AddManufacturersRecordCall();
  static EditManufacturersRecordCall editManufacturersRecordCall =
      EditManufacturersRecordCall();
  static GetManufacturersRecordCall getManufacturersRecordCall =
      GetManufacturersRecordCall();
  static DeleteManufacturersRecordCall deleteManufacturersRecordCall =
      DeleteManufacturersRecordCall();
  static QueryAllManufacturersRecordsCall queryAllManufacturersRecordsCall =
      QueryAllManufacturersRecordsCall();
}

class AddManufacturersRecordCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    String? name = '',
    int? equipamentsTypesId = 0,
  }) async {
    final baseUrl = ManufacturersGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "name": "${escapeStringForJson(name)}",
  "equipaments_types_id": ${equipamentsTypesId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add manufacturers record',
      apiUrl: '${baseUrl}',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  String? name(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.name''',
      ));
  int? id(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.id''',
      ));
}

class EditManufacturersRecordCall {
  Future<ApiCallResponse> call({
    int? manufacturersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ManufacturersGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "name": "",
  "updated_at": 0,
  "deleted_at": 0
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit manufacturers record',
      apiUrl: '${baseUrl}/${manufacturersId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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

class GetManufacturersRecordCall {
  Future<ApiCallResponse> call({
    int? manufacturersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ManufacturersGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get manufacturers record',
      apiUrl: '${baseUrl}/${manufacturersId}',
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

class DeleteManufacturersRecordCall {
  Future<ApiCallResponse> call({
    int? manufacturersId,
    String? bearerAuth = '',
  }) async {
    final baseUrl = ManufacturersGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Delete manufacturers record.',
      apiUrl: '${baseUrl}/${manufacturersId}',
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

class QueryAllManufacturersRecordsCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    String? search = '',
    int? equipamentsTypeId,
  }) async {
    final baseUrl = ManufacturersGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Query all manufacturers records',
      apiUrl: '${baseUrl}',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {
        'search': search,
        'equipaments_types_id': equipamentsTypeId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? list(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
}

/// End Manufacturers  Group Code





/// Start Authentication  Group Code

class AuthenticationGroup {
  // Node.js backend: /api/v1/auth
  // Xano original: api:DS2hmPl4
  static String getBaseUrl() =>
      ApiConfig.authPath;
  static Map<String, String> headers = {
  };
  static GetTheRecordBelongingToTheAuthenticationTokenCall
      getTheRecordBelongingToTheAuthenticationTokenCall =
      GetTheRecordBelongingToTheAuthenticationTokenCall();
  static LoginAndRetrieveAnAuthenticationTokenCall
      loginAndRetrieveAnAuthenticationTokenCall =
      LoginAndRetrieveAnAuthenticationTokenCall();
  static SignupAndRetrieveAnAuthenticationTokenCall
      signupAndRetrieveAnAuthenticationTokenCall =
      SignupAndRetrieveAnAuthenticationTokenCall();
}

class GetTheRecordBelongingToTheAuthenticationTokenCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
  }) async {
    final baseUrl = AuthenticationGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Get the record belonging to the authentication token ',
      apiUrl: '${baseUrl}/me',
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

  int? id(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.user.id''',
      ));
  String? name(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.user.name''',
      ));
  String? email(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.user.email''',
      ));
  String? phone(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.user.phone''',
      ));
  int? permissionsId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.user.users_permissions_id''',
      ));
  int? systemId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.user.users_permissions.users_system_access_id''',
      ));
  int? rolesId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.user.users_permissions.users_roles_id''',
      ));
  int? controlId(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.user.users_permissions.users_control_system_id''',
      ));
  String? img(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.user.profile_picture.url''',
      ));
  int? sprintID(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.result1.sprints_of_projects_of_sprints_statuses.id''',
      ));
  int? companyID(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.user.company_id''',
      ));
  int? paymentID(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.user.company.status_payment_id''',
      ));
}

class LoginAndRetrieveAnAuthenticationTokenCall {
  Future<ApiCallResponse> call({
    String? email = '',
    String? passwordHash = '',
  }) async {
    final baseUrl = AuthenticationGroup.getBaseUrl();

    final ffApiRequestBody = '''
{
  "email": "${escapeStringForJson(email)}",
  "password_hash": "${escapeStringForJson(passwordHash)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Login and retrieve an authentication token ',
      apiUrl: '${baseUrl}/login',
      callType: ApiCallType.POST,
      headers: {
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  String? authToken(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.authToken''',
      ));
  String? message(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.message''',
      ));
}

class SignupAndRetrieveAnAuthenticationTokenCall {
  Future<ApiCallResponse> call({
    String? name = '',
    String? email = '',
    String? phone = '',
    String? passwordHash = '',
    FFUploadedFile? profilePicture,
    int? envFromCreate = 1,
    int? userSystemAccess = 3,
    int? userControlSystem = 3,
    int? userRoleType = 3,
  }) async {
    final baseUrl = AuthenticationGroup.getBaseUrl();

    return ApiManager.instance.makeApiCall(
      callName: 'Signup and retrieve an authentication token ',
      apiUrl: '${baseUrl}/signup',
      callType: ApiCallType.POST,
      headers: {},
      params: {
        'name': name,
        'email': email,
        'phone': phone,
        'password_hash': passwordHash,
        'env_from_create': envFromCreate,
        'user_system_access': userSystemAccess,
        'user_control_system': userControlSystem,
        'user_role_type': userRoleType,
      },
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  String? message(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.message''',
      ));
  String? authToken(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.authToken''',
      ));
}

/// End Authentication  Group Code

/// Start Agente IA Group Code

class AgenteIAGroup {
  // Node.js backend: /api/v1/agents
  // Xano original: api:9AY-oEl8
  static String getBaseUrl({
    String? token = '',
  }) =>
      ApiConfig.agentsPath;
  static Map<String, String> headers = {
    'Authorization': 'Bearer [token]',
  };
  static AgentTaskQueriesCall agentTaskQueriesCall = AgentTaskQueriesCall();
}

class AgentTaskQueriesCall {
  Future<ApiCallResponse> call({
    String? question = '',
    String? token = '',
  }) async {
    final baseUrl = AgenteIAGroup.getBaseUrl(
      token: token,
    );

    final ffApiRequestBody = '''
{
  "question": "${escapeStringForJson(question)}"
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Agent task queries',
      apiUrl: '${baseUrl}/projetcs/agent/search',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
      bodyType: BodyType.JSON,
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  String? response(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.InterpretingAgent1.result.response''',
      ));
}

/// End Agente IA Group Code

/// Start Inventory Group Code

class InventoryGroup {
  // Node.js backend: /api/v1/inventory
  // Xano original: api:S-U0Jz_H
  static String getBaseUrl({
    String? token = '',
  }) =>
      ApiConfig.inventoryPath;
  static Map<String, String> headers = {
    'Authorization': 'Bearer [token]',
  };
  static AddProductToInventoryCall addProductToInventoryCall =
      AddProductToInventoryCall();
  static GetProductInventoryCall getProductInventoryCall =
      GetProductInventoryCall();
  static EditProductInventoryCall editProductInventoryCall =
      EditProductInventoryCall();
  static DeleteProdutcInventoryCall deleteProdutcInventoryCall =
      DeleteProdutcInventoryCall();
  static GetAllStatusInventoryCall getAllStatusInventoryCall =
      GetAllStatusInventoryCall();
  static AddQuantityInventoryCall addQuantityInventoryCall =
      AddQuantityInventoryCall();
  static RemoveQuantityInventoryCall removeQuantityInventoryCall =
      RemoveQuantityInventoryCall();
  static QueryAllLogsCall queryAllLogsCall = QueryAllLogsCall();
  static QueryAllLogsCloneCall queryAllLogsCloneCall = QueryAllLogsCloneCall();
  static ExportInventoryCall exportInventoryCall = ExportInventoryCall();
}

class AddProductToInventoryCall {
  Future<ApiCallResponse> call({
    String? product = '',
    String? specifications = '',
    int? inventoryQuantity,
    int? unityId,
    int? statusInventoryId,
    int? equipamentsTypesId,
    int? manufacturersId,
    int? minQuantity,
    int? projectsId,
    String? token = '',
  }) async {
    final baseUrl = InventoryGroup.getBaseUrl(
      token: token,
    );

    final ffApiRequestBody = '''
{
  "product": "${escapeStringForJson(product)}",
  "specifications": "${escapeStringForJson(specifications)}",
  "inventory_quantity": ${inventoryQuantity},
  "unity_id": ${unityId},
  "status_inventory_id": ${statusInventoryId},
  "equipaments_types_id": ${equipamentsTypesId},
  "manufacturers_id": ${manufacturersId},
  "min_quantity": ${minQuantity},
  "projects_id": ${projectsId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add product to inventory',
      apiUrl: '${baseUrl}/products',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class GetProductInventoryCall {
  Future<ApiCallResponse> call({
    int? page,
    int? perPage,
    int? categoryId,
    int? statusId,
    String? search = '',
    int? projectsId,
    String? token = '',
  }) async {
    final baseUrl = InventoryGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Get product inventory',
      apiUrl: '${baseUrl}/products',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'page': page,
        'per_page': perPage,
        'category_id': categoryId,
        'status_id': statusId,
        'search': search,
        'projects_id': projectsId,
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
        r'''$.result1.items''',
        true,
      ) as List?;
  int? pageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.result1.pageTotal''',
      ));
  int? itemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.result1.itemsTotal''',
      ));
  int? all(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.all''',
      ));
  int? low(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.low''',
      ));
  int? no(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.no''',
      ));
}

class EditProductInventoryCall {
  Future<ApiCallResponse> call({
    String? product = '',
    String? specifications = '',
    int? inventoryQuantity,
    int? unityId,
    int? statusInventoryId,
    int? equipamentsTypesId,
    int? manufacturersId,
    int? minQuantity,
    int? productInventoryId,
    int? projectsId,
    String? token = '',
  }) async {
    final baseUrl = InventoryGroup.getBaseUrl(
      token: token,
    );

    final ffApiRequestBody = '''
{
  "product": "${escapeStringForJson(product)}",
  "specifications": "${escapeStringForJson(specifications)}",
  "inventory_quantity": ${inventoryQuantity},
  "unity_id": ${unityId},
  "equipaments_types_id": ${equipamentsTypesId},
  "status_inventory_id": ${statusInventoryId},
  "manufacturers_id": ${manufacturersId},
  "min_quantity": ${minQuantity},
  "projects_id": ${projectsId}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Edit product inventory',
      apiUrl: '${baseUrl}/products/${productInventoryId}',
      callType: ApiCallType.PATCH,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class DeleteProdutcInventoryCall {
  Future<ApiCallResponse> call({
    int? productInventoryId,
    String? token = '',
  }) async {
    final baseUrl = InventoryGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Delete produtc inventory',
      apiUrl: '${baseUrl}/products/${productInventoryId}',
      callType: ApiCallType.DELETE,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'product_inventory_id ': productInventoryId,
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

class GetAllStatusInventoryCall {
  Future<ApiCallResponse> call({
    String? token = '',
  }) async {
    final baseUrl = InventoryGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Get all status inventory',
      apiUrl: '${baseUrl}/status',
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

class AddQuantityInventoryCall {
  Future<ApiCallResponse> call({
    int? productInventoryId,
    int? quantity,
    String? token = '',
  }) async {
    final baseUrl = InventoryGroup.getBaseUrl(
      token: token,
    );

    final ffApiRequestBody = '''
{
  "product_inventory_id": ${productInventoryId},
  "quantity": ${quantity}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Add quantity inventory',
      apiUrl: '${baseUrl}/add-quantity',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class RemoveQuantityInventoryCall {
  Future<ApiCallResponse> call({
    int? productInventoryId,
    int? quantity,
    int? receivedUser,
    String? token = '',
  }) async {
    final baseUrl = InventoryGroup.getBaseUrl(
      token: token,
    );

    final ffApiRequestBody = '''
{
  "product_inventory_id": ${productInventoryId},
  "quantity": ${quantity},
  "received_user": ${receivedUser}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Remove quantity inventory',
      apiUrl: '${baseUrl}/remove-quantity',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class QueryAllLogsCall {
  Future<ApiCallResponse> call({
    int? page,
    int? perPage,
    int? projectsId,
    String? token = '',
  }) async {
    final baseUrl = InventoryGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Query all logs ',
      apiUrl: '${baseUrl}/logs',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'page': page,
        'per_page': perPage,
        'projects_id': projectsId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  int? itemsTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.itemsTotal''',
      ));
  int? pageTotal(dynamic response) => castToType<int>(getJsonField(
        response,
        r'''$.pageTotal''',
      ));
  List? items(dynamic response) => getJsonField(
        response,
        r'''$.items''',
        true,
      ) as List?;
}

class QueryAllLogsCloneCall {
  Future<ApiCallResponse> call({
    int? projectsId,
    String? token = '',
  }) async {
    final baseUrl = InventoryGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'Query all logs  clone ',
      apiUrl: '${baseUrl}/logs/filtered',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'projects_id': projectsId,
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



class ExportInventoryCall {
  Future<ApiCallResponse> call({
    int? categoryId,
    int? statusId,
    int? projectsId,
    String? token = '',
  }) async {
    final baseUrl = InventoryGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'export inventory',
      apiUrl: '${baseUrl}/export',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'category_id': categoryId,
        'status_id': statusId,
        'projects_id': projectsId,
      },
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  List? item(dynamic response) => getJsonField(
        response,
        r'''$.result1''',
        true,
      ) as List?;
}

/// End Inventory Group Code

/// Start stripe Group Code

class StripeGroup {
  // Node.js backend: /api/v1/stripe
  // Xano original: api:Ikw0LCwY
  static String getBaseUrl({
    String? token = '',
  }) =>
      ApiConfig.stripePath;
  static Map<String, String> headers = {
    'Authorization': 'Bearer [token]',
  };
  static SessionsCall sessionsCall = SessionsCall();
  static PricesCall pricesCall = PricesCall();
}

class SessionsCall {
  Future<ApiCallResponse> call({
    String? successUrl = '',
    String? cancelUrl = '',
    int? companyId,
    String? price = '',
    bool? firstTime,
    String? token = '',
  }) async {
    final baseUrl = StripeGroup.getBaseUrl(
      token: token,
    );

    final ffApiRequestBody = '''
{
  "success_url": "${escapeStringForJson(successUrl)}",
  "cancel_url": "${escapeStringForJson(cancelUrl)}",
  "line_items": [
    {
      "price": "${escapeStringForJson(price)}",
      "quantity": 1
    }
  ],
  "company_id": ${companyId},
  "first_time": ${firstTime}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'sessions',
      apiUrl: '${baseUrl}/sessions',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {},
      body: ffApiRequestBody,
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

class PricesCall {
  Future<ApiCallResponse> call({
    bool? paymentIntent = false,
    String? startingAfter = '',
    int? limit = 10,
    String? endingBefore = '',
    bool? subscription = false,
    String? token = '',
  }) async {
    final baseUrl = StripeGroup.getBaseUrl(
      token: token,
    );

    return ApiManager.instance.makeApiCall(
      callName: 'prices',
      apiUrl: '${baseUrl}/prices',
      callType: ApiCallType.GET,
      headers: {
        'Authorization': 'Bearer ${token}',
      },
      params: {
        'payment_intent': paymentIntent,
        'starting_after': startingAfter,
        'limit': limit,
        'ending_before': endingBefore,
        'subscription': subscription,
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

/// End stripe Group Code

class GetCepCall {
  static Future<ApiCallResponse> call({
    String? cep = '',
  }) async {
    return ApiManager.instance.makeApiCall(
      callName: 'Get Cep',
      apiUrl: 'viacep.com.br/ws/${cep}/json/',
      callType: ApiCallType.GET,
      headers: {},
      params: {},
      returnBody: true,
      encodeBodyUtf8: false,
      decodeUtf8: false,
      cache: false,
      isStreamingApi: false,
      alwaysAllowBody: false,
    );
  }

  static String? logradouro(dynamic response) =>
      castToType<String>(getJsonField(
        response,
        r'''$.logradouro''',
      ));
  static String? bairro(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.bairro''',
      ));
  static String? localidade(dynamic response) =>
      castToType<String>(getJsonField(
        response,
        r'''$.localidade''',
      ));
  static String? uf(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.uf''',
      ));
  static String? estado(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.estado''',
      ));
  static String? regiao(dynamic response) => castToType<String>(getJsonField(
        response,
        r'''$.regiao''',
      ));
}

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




/// End Projects Group Code

class ImportCronogramaCall {
  Future<ApiCallResponse> call({
    String? bearerAuth = '',
    int? projectsId,
    dynamic? tasksJson,
  }) async {
    final baseUrl = ProjectsGroup.getBaseUrl();

    final tasks = _serializeJson(tasksJson, true);
    final ffApiRequestBody = '''
{
  "projects_id": ${projectsId},
  "lista_tarefas": ${tasks}
}''';
    return ApiManager.instance.makeApiCall(
      callName: 'Import cronograma',
      apiUrl: '${baseUrl}/import_cronograma',
      callType: ApiCallType.POST,
      headers: {
        'Authorization': 'Bearer ${bearerAuth}',
      },
      params: {},
      body: ffApiRequestBody,
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


