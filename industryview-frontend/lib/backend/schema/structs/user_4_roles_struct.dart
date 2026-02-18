// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class User4RolesStruct extends BaseStruct {
  User4RolesStruct({
    int? id,
    String? role,
  })  : _id = id,
        _role = role;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "role" field.
  String? _role;
  String get role => _role ?? 'N/A';
  set role(String? val) => _role = val;

  bool hasRole() => _role != null;

  static User4RolesStruct fromMap(Map<String, dynamic> data) =>
      User4RolesStruct(
        id: castToType<int>(data['id']),
        role: data['role'] as String?,
      );

  static User4RolesStruct? maybeFromMap(dynamic data) => data is Map
      ? User4RolesStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'role': _role,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'role': serializeParam(
          _role,
          ParamType.String,
        ),
      }.withoutNulls;

  static User4RolesStruct fromSerializableMap(Map<String, dynamic> data) =>
      User4RolesStruct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        role: deserializeParam(
          data['role'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'User4RolesStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is User4RolesStruct && id == other.id && role == other.role;
  }

  @override
  int get hashCode => const ListEquality().hash([id, role]);
}

User4RolesStruct createUser4RolesStruct({
  int? id,
  String? role,
}) =>
    User4RolesStruct(
      id: id,
      role: role,
    );
