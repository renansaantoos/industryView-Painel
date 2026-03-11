// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/core/utils/app_utils.dart';

/// Informações do usuario logado
class UserLoginStruct extends BaseStruct {
  UserLoginStruct({
    String? token,
    int? id,
    String? name,
    String? email,
    String? phone,
    String? image,
    UserPermissionsStruct? userPermissions,
    int? teamsId,
    int? projectId,
    int? sheduleId,
    SprintsStruct? sprint,
    int? companyId,
    String? projectName,
    String? teamName,
  })  : _token = token,
        _id = id,
        _name = name,
        _email = email,
        _phone = phone,
        _image = image,
        _userPermissions = userPermissions,
        _teamsId = teamsId,
        _projectId = projectId,
        _sheduleId = sheduleId,
        _sprint = sprint,
        _companyId = companyId,
        _projectName = projectName,
        _teamName = teamName;

  // "token" field.
  String? _token;
  String get token => _token ?? '';
  set token(String? val) => _token = val;

  bool hasToken() => _token != null;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "name" field.
  String? _name;
  String get name => _name ?? '';
  set name(String? val) => _name = val;

  bool hasName() => _name != null;

  // "email" field.
  String? _email;
  String get email => _email ?? '';
  set email(String? val) => _email = val;

  bool hasEmail() => _email != null;

  // "phone" field.
  String? _phone;
  String get phone => _phone ?? '';
  set phone(String? val) => _phone = val;

  bool hasPhone() => _phone != null;

  // "image" field.
  String? _image;
  String get image => _image ?? '';
  set image(String? val) => _image = val;

  bool hasImage() => _image != null;

  // "user_permissions" field.
  UserPermissionsStruct? _userPermissions;
  UserPermissionsStruct get userPermissions =>
      _userPermissions ?? UserPermissionsStruct();
  set userPermissions(UserPermissionsStruct? val) => _userPermissions = val;

  void updateUserPermissions(Function(UserPermissionsStruct) updateFn) {
    updateFn(_userPermissions ??= UserPermissionsStruct());
  }

  bool hasUserPermissions() => _userPermissions != null;

  // "teams_id" field.
  int? _teamsId;
  int get teamsId => _teamsId ?? 0;
  set teamsId(int? val) => _teamsId = val;

  void incrementTeamsId(int amount) => teamsId = teamsId + amount;

  bool hasTeamsId() => _teamsId != null;

  // "project_id" field.
  int? _projectId;
  int get projectId => _projectId ?? 0;
  set projectId(int? val) => _projectId = val;

  void incrementProjectId(int amount) => projectId = projectId + amount;

  bool hasProjectId() => _projectId != null;

  // "shedule_id" field.
  int? _sheduleId;
  int get sheduleId => _sheduleId ?? 0;
  set sheduleId(int? val) => _sheduleId = val;

  void incrementSheduleId(int amount) => sheduleId = sheduleId + amount;

  bool hasSheduleId() => _sheduleId != null;

  // "sprint" field.
  SprintsStruct? _sprint;
  SprintsStruct get sprint => _sprint ?? SprintsStruct();
  set sprint(SprintsStruct? val) => _sprint = val;

  void updateSprint(Function(SprintsStruct) updateFn) {
    updateFn(_sprint ??= SprintsStruct());
  }

  bool hasSprint() => _sprint != null;

  // "company_id" field.
  int? _companyId;
  int get companyId => _companyId ?? 0;
  set companyId(int? val) => _companyId = val;

  void incrementCompanyId(int amount) => companyId = companyId + amount;

  bool hasCompanyId() => _companyId != null;

  // "project_name" field.
  String? _projectName;
  String get projectName => _projectName ?? '';
  set projectName(String? val) => _projectName = val;

  bool hasProjectName() => _projectName != null;

  // "team_name" field.
  String? _teamName;
  String get teamName => _teamName ?? '';
  set teamName(String? val) => _teamName = val;

  bool hasTeamName() => _teamName != null;

  static UserLoginStruct fromMap(Map<String, dynamic> data) => UserLoginStruct(
        token: data['token'] as String?,
        id: castToType<int>(data['id']),
        name: data['name'] as String?,
        email: data['email'] as String?,
        phone: data['phone'] as String?,
        image: data['image'] as String?,
        userPermissions: data['user_permissions'] is UserPermissionsStruct
            ? data['user_permissions']
            : UserPermissionsStruct.maybeFromMap(data['user_permissions']),
        teamsId: castToType<int>(data['teams_id']),
        projectId: castToType<int>(data['project_id']),
        sheduleId: castToType<int>(data['shedule_id']),
        sprint: data['sprint'] is SprintsStruct
            ? data['sprint']
            : SprintsStruct.maybeFromMap(data['sprint']),
        companyId: castToType<int>(data['company_id']),
        projectName: data['project_name'] as String?,
        teamName: data['team_name'] as String?,
      );

  static UserLoginStruct? maybeFromMap(dynamic data) => data is Map
      ? UserLoginStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'token': _token,
        'id': _id,
        'name': _name,
        'email': _email,
        'phone': _phone,
        'image': _image,
        'user_permissions': _userPermissions?.toMap(),
        'teams_id': _teamsId,
        'project_id': _projectId,
        'shedule_id': _sheduleId,
        'sprint': _sprint?.toMap(),
        'company_id': _companyId,
        'project_name': _projectName,
        'team_name': _teamName,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'token': serializeParam(
          _token,
          ParamType.String,
        ),
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'name': serializeParam(
          _name,
          ParamType.String,
        ),
        'email': serializeParam(
          _email,
          ParamType.String,
        ),
        'phone': serializeParam(
          _phone,
          ParamType.String,
        ),
        'image': serializeParam(
          _image,
          ParamType.String,
        ),
        'user_permissions': serializeParam(
          _userPermissions,
          ParamType.DataStruct,
        ),
        'teams_id': serializeParam(
          _teamsId,
          ParamType.int,
        ),
        'project_id': serializeParam(
          _projectId,
          ParamType.int,
        ),
        'shedule_id': serializeParam(
          _sheduleId,
          ParamType.int,
        ),
        'sprint': serializeParam(
          _sprint,
          ParamType.DataStruct,
        ),
        'company_id': serializeParam(
          _companyId,
          ParamType.int,
        ),
        'project_name': serializeParam(
          _projectName,
          ParamType.String,
        ),
        'team_name': serializeParam(
          _teamName,
          ParamType.String,
        ),
      }.withoutNulls;

  static UserLoginStruct fromSerializableMap(Map<String, dynamic> data) =>
      UserLoginStruct(
        token: deserializeParam(
          data['token'],
          ParamType.String,
          false,
        ),
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        name: deserializeParam(
          data['name'],
          ParamType.String,
          false,
        ),
        email: deserializeParam(
          data['email'],
          ParamType.String,
          false,
        ),
        phone: deserializeParam(
          data['phone'],
          ParamType.String,
          false,
        ),
        image: deserializeParam(
          data['image'],
          ParamType.String,
          false,
        ),
        userPermissions: deserializeStructParam(
          data['user_permissions'],
          ParamType.DataStruct,
          false,
          structBuilder: UserPermissionsStruct.fromSerializableMap,
        ),
        teamsId: deserializeParam(
          data['teams_id'],
          ParamType.int,
          false,
        ),
        projectId: deserializeParam(
          data['project_id'],
          ParamType.int,
          false,
        ),
        sheduleId: deserializeParam(
          data['shedule_id'],
          ParamType.int,
          false,
        ),
        sprint: deserializeStructParam(
          data['sprint'],
          ParamType.DataStruct,
          false,
          structBuilder: SprintsStruct.fromSerializableMap,
        ),
        companyId: deserializeParam(
          data['company_id'],
          ParamType.int,
          false,
        ),
        projectName: deserializeParam(
          data['project_name'],
          ParamType.String,
          false,
        ),
        teamName: deserializeParam(
          data['team_name'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'UserLoginStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is UserLoginStruct &&
        token == other.token &&
        id == other.id &&
        name == other.name &&
        email == other.email &&
        phone == other.phone &&
        image == other.image &&
        userPermissions == other.userPermissions &&
        teamsId == other.teamsId &&
        projectId == other.projectId &&
        sheduleId == other.sheduleId &&
        sprint == other.sprint &&
        companyId == other.companyId &&
        projectName == other.projectName &&
        teamName == other.teamName;
  }

  @override
  int get hashCode => const ListEquality().hash([
        token,
        id,
        name,
        email,
        phone,
        image,
        userPermissions,
        teamsId,
        projectId,
        sheduleId,
        sprint,
        companyId,
        projectName,
        teamName
      ]);
}

UserLoginStruct createUserLoginStruct({
  String? token,
  int? id,
  String? name,
  String? email,
  String? phone,
  String? image,
  UserPermissionsStruct? userPermissions,
  int? teamsId,
  int? projectId,
  int? sheduleId,
  SprintsStruct? sprint,
  int? companyId,
  String? projectName,
  String? teamName,
}) =>
    UserLoginStruct(
      token: token,
      id: id,
      name: name,
      email: email,
      phone: phone,
      image: image,
      userPermissions: userPermissions ?? UserPermissionsStruct(),
      teamsId: teamsId,
      projectId: projectId,
      sheduleId: sheduleId,
      sprint: sprint ?? SprintsStruct(),
      companyId: companyId,
      projectName: projectName,
      teamName: teamName,
    );
