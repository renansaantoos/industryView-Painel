// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class User4Struct extends BaseStruct {
  User4Struct({
    User4SystemAccessStruct? usersSystemAccess,
    User4RolesStruct? usersRoles,
    User4ControlSystemStruct? usersControlSystem,
  })  : _usersSystemAccess = usersSystemAccess,
        _usersRoles = usersRoles,
        _usersControlSystem = usersControlSystem;

  // "users_system_access" field.
  User4SystemAccessStruct? _usersSystemAccess;
  User4SystemAccessStruct get usersSystemAccess =>
      _usersSystemAccess ?? User4SystemAccessStruct();
  set usersSystemAccess(User4SystemAccessStruct? val) =>
      _usersSystemAccess = val;

  void updateUsersSystemAccess(Function(User4SystemAccessStruct) updateFn) {
    updateFn(_usersSystemAccess ??= User4SystemAccessStruct());
  }

  bool hasUsersSystemAccess() => _usersSystemAccess != null;

  // "users_roles" field.
  User4RolesStruct? _usersRoles;
  User4RolesStruct get usersRoles => _usersRoles ?? User4RolesStruct();
  set usersRoles(User4RolesStruct? val) => _usersRoles = val;

  void updateUsersRoles(Function(User4RolesStruct) updateFn) {
    updateFn(_usersRoles ??= User4RolesStruct());
  }

  bool hasUsersRoles() => _usersRoles != null;

  // "users_control_system" field.
  User4ControlSystemStruct? _usersControlSystem;
  User4ControlSystemStruct get usersControlSystem =>
      _usersControlSystem ?? User4ControlSystemStruct();
  set usersControlSystem(User4ControlSystemStruct? val) =>
      _usersControlSystem = val;

  void updateUsersControlSystem(Function(User4ControlSystemStruct) updateFn) {
    updateFn(_usersControlSystem ??= User4ControlSystemStruct());
  }

  bool hasUsersControlSystem() => _usersControlSystem != null;

  static User4Struct fromMap(Map<String, dynamic> data) => User4Struct(
        usersSystemAccess: data['users_system_access']
                is User4SystemAccessStruct
            ? data['users_system_access']
            : User4SystemAccessStruct.maybeFromMap(data['users_system_access']),
        usersRoles: data['users_roles'] is User4RolesStruct
            ? data['users_roles']
            : User4RolesStruct.maybeFromMap(data['users_roles']),
        usersControlSystem:
            data['users_control_system'] is User4ControlSystemStruct
                ? data['users_control_system']
                : User4ControlSystemStruct.maybeFromMap(
                    data['users_control_system']),
      );

  static User4Struct? maybeFromMap(dynamic data) =>
      data is Map ? User4Struct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'users_system_access': _usersSystemAccess?.toMap(),
        'users_roles': _usersRoles?.toMap(),
        'users_control_system': _usersControlSystem?.toMap(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'users_system_access': serializeParam(
          _usersSystemAccess,
          ParamType.DataStruct,
        ),
        'users_roles': serializeParam(
          _usersRoles,
          ParamType.DataStruct,
        ),
        'users_control_system': serializeParam(
          _usersControlSystem,
          ParamType.DataStruct,
        ),
      }.withoutNulls;

  static User4Struct fromSerializableMap(Map<String, dynamic> data) =>
      User4Struct(
        usersSystemAccess: deserializeStructParam(
          data['users_system_access'],
          ParamType.DataStruct,
          false,
          structBuilder: User4SystemAccessStruct.fromSerializableMap,
        ),
        usersRoles: deserializeStructParam(
          data['users_roles'],
          ParamType.DataStruct,
          false,
          structBuilder: User4RolesStruct.fromSerializableMap,
        ),
        usersControlSystem: deserializeStructParam(
          data['users_control_system'],
          ParamType.DataStruct,
          false,
          structBuilder: User4ControlSystemStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'User4Struct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is User4Struct &&
        usersSystemAccess == other.usersSystemAccess &&
        usersRoles == other.usersRoles &&
        usersControlSystem == other.usersControlSystem;
  }

  @override
  int get hashCode => const ListEquality()
      .hash([usersSystemAccess, usersRoles, usersControlSystem]);
}

User4Struct createUser4Struct({
  User4SystemAccessStruct? usersSystemAccess,
  User4RolesStruct? usersRoles,
  User4ControlSystemStruct? usersControlSystem,
}) =>
    User4Struct(
      usersSystemAccess: usersSystemAccess ?? User4SystemAccessStruct(),
      usersRoles: usersRoles ?? User4RolesStruct(),
      usersControlSystem: usersControlSystem ?? User4ControlSystemStruct(),
    );
