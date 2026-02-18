// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class VarInfoUserStruct extends BaseStruct {
  VarInfoUserStruct({
    int? id,
    String? name,
    String? email,
    String? phone,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    String? url,
    int? usersPermissionsId,
    int? usersSystemAccessId,
    int? usersRolesId,
    int? usersControlSystemId,
    int? sprintIdAtiva,
    int? companyId,
    int? plan,
  })  : _id = id,
        _name = name,
        _email = email,
        _phone = phone,
        _createdAt = createdAt,
        _updatedAt = updatedAt,
        _deletedAt = deletedAt,
        _url = url,
        _usersPermissionsId = usersPermissionsId,
        _usersSystemAccessId = usersSystemAccessId,
        _usersRolesId = usersRolesId,
        _usersControlSystemId = usersControlSystemId,
        _sprintIdAtiva = sprintIdAtiva,
        _companyId = companyId,
        _plan = plan;

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

  // "created_at" field.
  String? _createdAt;
  String get createdAt => _createdAt ?? '';
  set createdAt(String? val) => _createdAt = val;

  bool hasCreatedAt() => _createdAt != null;

  // "updated_at" field.
  String? _updatedAt;
  String get updatedAt => _updatedAt ?? '';
  set updatedAt(String? val) => _updatedAt = val;

  bool hasUpdatedAt() => _updatedAt != null;

  // "deleted_at" field.
  String? _deletedAt;
  String get deletedAt => _deletedAt ?? '';
  set deletedAt(String? val) => _deletedAt = val;

  bool hasDeletedAt() => _deletedAt != null;

  // "url" field.
  String? _url;
  String get url => _url ?? '';
  set url(String? val) => _url = val;

  bool hasUrl() => _url != null;

  // "users_permissions_id" field.
  int? _usersPermissionsId;
  int get usersPermissionsId => _usersPermissionsId ?? 0;
  set usersPermissionsId(int? val) => _usersPermissionsId = val;

  void incrementUsersPermissionsId(int amount) =>
      usersPermissionsId = usersPermissionsId + amount;

  bool hasUsersPermissionsId() => _usersPermissionsId != null;

  // "users_system_access_id" field.
  int? _usersSystemAccessId;
  int get usersSystemAccessId => _usersSystemAccessId ?? 0;
  set usersSystemAccessId(int? val) => _usersSystemAccessId = val;

  void incrementUsersSystemAccessId(int amount) =>
      usersSystemAccessId = usersSystemAccessId + amount;

  bool hasUsersSystemAccessId() => _usersSystemAccessId != null;

  // "users_roles_id" field.
  int? _usersRolesId;
  int get usersRolesId => _usersRolesId ?? 0;
  set usersRolesId(int? val) => _usersRolesId = val;

  void incrementUsersRolesId(int amount) =>
      usersRolesId = usersRolesId + amount;

  bool hasUsersRolesId() => _usersRolesId != null;

  // "users_control_system_id" field.
  int? _usersControlSystemId;
  int get usersControlSystemId => _usersControlSystemId ?? 0;
  set usersControlSystemId(int? val) => _usersControlSystemId = val;

  void incrementUsersControlSystemId(int amount) =>
      usersControlSystemId = usersControlSystemId + amount;

  bool hasUsersControlSystemId() => _usersControlSystemId != null;

  // "sprint_id_ativa" field.
  int? _sprintIdAtiva;
  int get sprintIdAtiva => _sprintIdAtiva ?? 0;
  set sprintIdAtiva(int? val) => _sprintIdAtiva = val;

  void incrementSprintIdAtiva(int amount) =>
      sprintIdAtiva = sprintIdAtiva + amount;

  bool hasSprintIdAtiva() => _sprintIdAtiva != null;

  // "company_id" field.
  int? _companyId;
  int get companyId => _companyId ?? 0;
  set companyId(int? val) => _companyId = val;

  void incrementCompanyId(int amount) => companyId = companyId + amount;

  bool hasCompanyId() => _companyId != null;

  // "plan" field.
  int? _plan;
  int get plan => _plan ?? 0;
  set plan(int? val) => _plan = val;

  void incrementPlan(int amount) => plan = plan + amount;

  bool hasPlan() => _plan != null;

  static VarInfoUserStruct fromMap(Map<String, dynamic> data) =>
      VarInfoUserStruct(
        id: castToType<int>(data['id']),
        name: data['name'] as String?,
        email: data['email'] as String?,
        phone: data['phone'] as String?,
        createdAt: data['created_at'] as String?,
        updatedAt: data['updated_at'] as String?,
        deletedAt: castToType<String>(data['deleted_at']),
        url: data['url'] as String?,
        usersPermissionsId: castToType<int>(data['users_permissions_id']),
        usersSystemAccessId: castToType<int>(data['users_system_access_id']),
        usersRolesId: castToType<int>(data['users_roles_id']),
        usersControlSystemId: castToType<int>(data['users_control_system_id']),
        sprintIdAtiva: castToType<int>(data['sprint_id_ativa']),
        companyId: castToType<int>(data['company_id']),
        plan: castToType<int>(data['plan']),
      );

  static VarInfoUserStruct? maybeFromMap(dynamic data) => data is Map
      ? VarInfoUserStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'name': _name,
        'email': _email,
        'phone': _phone,
        'created_at': _createdAt,
        'updated_at': _updatedAt,
        'deleted_at': _deletedAt,
        'url': _url,
        'users_permissions_id': _usersPermissionsId,
        'users_system_access_id': _usersSystemAccessId,
        'users_roles_id': _usersRolesId,
        'users_control_system_id': _usersControlSystemId,
        'sprint_id_ativa': _sprintIdAtiva,
        'company_id': _companyId,
        'plan': _plan,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
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
        'created_at': serializeParam(
          _createdAt,
          ParamType.String,
        ),
        'updated_at': serializeParam(
          _updatedAt,
          ParamType.String,
        ),
        'deleted_at': serializeParam(
          _deletedAt,
          ParamType.String,
        ),
        'url': serializeParam(
          _url,
          ParamType.String,
        ),
        'users_permissions_id': serializeParam(
          _usersPermissionsId,
          ParamType.int,
        ),
        'users_system_access_id': serializeParam(
          _usersSystemAccessId,
          ParamType.int,
        ),
        'users_roles_id': serializeParam(
          _usersRolesId,
          ParamType.int,
        ),
        'users_control_system_id': serializeParam(
          _usersControlSystemId,
          ParamType.int,
        ),
        'sprint_id_ativa': serializeParam(
          _sprintIdAtiva,
          ParamType.int,
        ),
        'company_id': serializeParam(
          _companyId,
          ParamType.int,
        ),
        'plan': serializeParam(
          _plan,
          ParamType.int,
        ),
      }.withoutNulls;

  static VarInfoUserStruct fromSerializableMap(Map<String, dynamic> data) =>
      VarInfoUserStruct(
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
        createdAt: deserializeParam(
          data['created_at'],
          ParamType.String,
          false,
        ),
        updatedAt: deserializeParam(
          data['updated_at'],
          ParamType.String,
          false,
        ),
        deletedAt: deserializeParam(
          data['deleted_at'],
          ParamType.String,
          false,
        ),
        url: deserializeParam(
          data['url'],
          ParamType.String,
          false,
        ),
        usersPermissionsId: deserializeParam(
          data['users_permissions_id'],
          ParamType.int,
          false,
        ),
        usersSystemAccessId: deserializeParam(
          data['users_system_access_id'],
          ParamType.int,
          false,
        ),
        usersRolesId: deserializeParam(
          data['users_roles_id'],
          ParamType.int,
          false,
        ),
        usersControlSystemId: deserializeParam(
          data['users_control_system_id'],
          ParamType.int,
          false,
        ),
        sprintIdAtiva: deserializeParam(
          data['sprint_id_ativa'],
          ParamType.int,
          false,
        ),
        companyId: deserializeParam(
          data['company_id'],
          ParamType.int,
          false,
        ),
        plan: deserializeParam(
          data['plan'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'VarInfoUserStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is VarInfoUserStruct &&
        id == other.id &&
        name == other.name &&
        email == other.email &&
        phone == other.phone &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        deletedAt == other.deletedAt &&
        url == other.url &&
        usersPermissionsId == other.usersPermissionsId &&
        usersSystemAccessId == other.usersSystemAccessId &&
        usersRolesId == other.usersRolesId &&
        usersControlSystemId == other.usersControlSystemId &&
        sprintIdAtiva == other.sprintIdAtiva &&
        companyId == other.companyId &&
        plan == other.plan;
  }

  @override
  int get hashCode => const ListEquality().hash([
        id,
        name,
        email,
        phone,
        createdAt,
        updatedAt,
        deletedAt,
        url,
        usersPermissionsId,
        usersSystemAccessId,
        usersRolesId,
        usersControlSystemId,
        sprintIdAtiva,
        companyId,
        plan
      ]);
}

VarInfoUserStruct createVarInfoUserStruct({
  int? id,
  String? name,
  String? email,
  String? phone,
  String? createdAt,
  String? updatedAt,
  String? deletedAt,
  String? url,
  int? usersPermissionsId,
  int? usersSystemAccessId,
  int? usersRolesId,
  int? usersControlSystemId,
  int? sprintIdAtiva,
  int? companyId,
  int? plan,
}) =>
    VarInfoUserStruct(
      id: id,
      name: name,
      email: email,
      phone: phone,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
      url: url,
      usersPermissionsId: usersPermissionsId,
      usersSystemAccessId: usersSystemAccessId,
      usersRolesId: usersRolesId,
      usersControlSystemId: usersControlSystemId,
      sprintIdAtiva: sprintIdAtiva,
      companyId: companyId,
      plan: plan,
    );
