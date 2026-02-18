// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class User4ControlSystemStruct extends BaseStruct {
  User4ControlSystemStruct({
    int? id,
    String? accessLevel,
  })  : _id = id,
        _accessLevel = accessLevel;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "access_level" field.
  String? _accessLevel;
  String get accessLevel => _accessLevel ?? 'N/A';
  set accessLevel(String? val) => _accessLevel = val;

  bool hasAccessLevel() => _accessLevel != null;

  static User4ControlSystemStruct fromMap(Map<String, dynamic> data) =>
      User4ControlSystemStruct(
        id: castToType<int>(data['id']),
        accessLevel: data['access_level'] as String?,
      );

  static User4ControlSystemStruct? maybeFromMap(dynamic data) => data is Map
      ? User4ControlSystemStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'access_level': _accessLevel,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'access_level': serializeParam(
          _accessLevel,
          ParamType.String,
        ),
      }.withoutNulls;

  static User4ControlSystemStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      User4ControlSystemStruct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        accessLevel: deserializeParam(
          data['access_level'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'User4ControlSystemStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is User4ControlSystemStruct &&
        id == other.id &&
        accessLevel == other.accessLevel;
  }

  @override
  int get hashCode => const ListEquality().hash([id, accessLevel]);
}

User4ControlSystemStruct createUser4ControlSystemStruct({
  int? id,
  String? accessLevel,
}) =>
    User4ControlSystemStruct(
      id: id,
      accessLevel: accessLevel,
    );
