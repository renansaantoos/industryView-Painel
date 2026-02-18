// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class User4SystemAccessStruct extends BaseStruct {
  User4SystemAccessStruct({
    int? id,
    String? env,
  })  : _id = id,
        _env = env;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "env" field.
  String? _env;
  String get env => _env ?? 'N/A';
  set env(String? val) => _env = val;

  bool hasEnv() => _env != null;

  static User4SystemAccessStruct fromMap(Map<String, dynamic> data) =>
      User4SystemAccessStruct(
        id: castToType<int>(data['id']),
        env: data['env'] as String?,
      );

  static User4SystemAccessStruct? maybeFromMap(dynamic data) => data is Map
      ? User4SystemAccessStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'env': _env,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'env': serializeParam(
          _env,
          ParamType.String,
        ),
      }.withoutNulls;

  static User4SystemAccessStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      User4SystemAccessStruct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        env: deserializeParam(
          data['env'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'User4SystemAccessStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is User4SystemAccessStruct &&
        id == other.id &&
        env == other.env;
  }

  @override
  int get hashCode => const ListEquality().hash([id, env]);
}

User4SystemAccessStruct createUser4SystemAccessStruct({
  int? id,
  String? env,
}) =>
    User4SystemAccessStruct(
      id: id,
      env: env,
    );
