// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/core/utils/app_utils.dart';

/// informações da permissão do usuario logado
class UserPermissionsStruct extends BaseStruct {
  UserPermissionsStruct({
    int? permissaoId,
    int? userSystemAccessId,
    int? userRolesId,
    int? userControlSystemId,
  })  : _permissaoId = permissaoId,
        _userSystemAccessId = userSystemAccessId,
        _userRolesId = userRolesId,
        _userControlSystemId = userControlSystemId;

  // "permissao_id" field.
  int? _permissaoId;
  int get permissaoId => _permissaoId ?? 0;
  set permissaoId(int? val) => _permissaoId = val;

  void incrementPermissaoId(int amount) => permissaoId = permissaoId + amount;

  bool hasPermissaoId() => _permissaoId != null;

  // "user_system_access_id" field.
  int? _userSystemAccessId;
  int get userSystemAccessId => _userSystemAccessId ?? 0;
  set userSystemAccessId(int? val) => _userSystemAccessId = val;

  void incrementUserSystemAccessId(int amount) =>
      userSystemAccessId = userSystemAccessId + amount;

  bool hasUserSystemAccessId() => _userSystemAccessId != null;

  // "user_roles_id" field.
  int? _userRolesId;
  int get userRolesId => _userRolesId ?? 0;
  set userRolesId(int? val) => _userRolesId = val;

  void incrementUserRolesId(int amount) => userRolesId = userRolesId + amount;

  bool hasUserRolesId() => _userRolesId != null;

  // "user_control_system_id" field.
  int? _userControlSystemId;
  int get userControlSystemId => _userControlSystemId ?? 0;
  set userControlSystemId(int? val) => _userControlSystemId = val;

  void incrementUserControlSystemId(int amount) =>
      userControlSystemId = userControlSystemId + amount;

  bool hasUserControlSystemId() => _userControlSystemId != null;

  static UserPermissionsStruct fromMap(Map<String, dynamic> data) =>
      UserPermissionsStruct(
        permissaoId: castToType<int>(data['permissao_id']),
        userSystemAccessId: castToType<int>(data['user_system_access_id']),
        userRolesId: castToType<int>(data['user_roles_id']),
        userControlSystemId: castToType<int>(data['user_control_system_id']),
      );

  static UserPermissionsStruct? maybeFromMap(dynamic data) => data is Map
      ? UserPermissionsStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'permissao_id': _permissaoId,
        'user_system_access_id': _userSystemAccessId,
        'user_roles_id': _userRolesId,
        'user_control_system_id': _userControlSystemId,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'permissao_id': serializeParam(
          _permissaoId,
          ParamType.int,
        ),
        'user_system_access_id': serializeParam(
          _userSystemAccessId,
          ParamType.int,
        ),
        'user_roles_id': serializeParam(
          _userRolesId,
          ParamType.int,
        ),
        'user_control_system_id': serializeParam(
          _userControlSystemId,
          ParamType.int,
        ),
      }.withoutNulls;

  static UserPermissionsStruct fromSerializableMap(Map<String, dynamic> data) =>
      UserPermissionsStruct(
        permissaoId: deserializeParam(
          data['permissao_id'],
          ParamType.int,
          false,
        ),
        userSystemAccessId: deserializeParam(
          data['user_system_access_id'],
          ParamType.int,
          false,
        ),
        userRolesId: deserializeParam(
          data['user_roles_id'],
          ParamType.int,
          false,
        ),
        userControlSystemId: deserializeParam(
          data['user_control_system_id'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'UserPermissionsStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is UserPermissionsStruct &&
        permissaoId == other.permissaoId &&
        userSystemAccessId == other.userSystemAccessId &&
        userRolesId == other.userRolesId &&
        userControlSystemId == other.userControlSystemId;
  }

  @override
  int get hashCode => const ListEquality().hash(
      [permissaoId, userSystemAccessId, userRolesId, userControlSystemId]);
}

UserPermissionsStruct createUserPermissionsStruct({
  int? permissaoId,
  int? userSystemAccessId,
  int? userRolesId,
  int? userControlSystemId,
}) =>
    UserPermissionsStruct(
      permissaoId: permissaoId,
      userSystemAccessId: userSystemAccessId,
      userRolesId: userRolesId,
      userControlSystemId: userControlSystemId,
    );
