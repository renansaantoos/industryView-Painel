// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class ListControlSystemStruct extends BaseStruct {
  ListControlSystemStruct({
    int? id,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    String? accessLevel,
  })  : _id = id,
        _createdAt = createdAt,
        _updatedAt = updatedAt,
        _deletedAt = deletedAt,
        _accessLevel = accessLevel;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

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

  // "access_level" field.
  String? _accessLevel;
  String get accessLevel => _accessLevel ?? '';
  set accessLevel(String? val) => _accessLevel = val;

  bool hasAccessLevel() => _accessLevel != null;

  static ListControlSystemStruct fromMap(Map<String, dynamic> data) =>
      ListControlSystemStruct(
        id: castToType<int>(data['id']),
        createdAt: castToType<String>(data['created_at']),
        updatedAt: castToType<String>(data['updated_at']),
        deletedAt: castToType<String>(data['deleted_at']),
        accessLevel: data['access_level'] as String?,
      );

  static ListControlSystemStruct? maybeFromMap(dynamic data) => data is Map
      ? ListControlSystemStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'created_at': _createdAt,
        'updated_at': _updatedAt,
        'deleted_at': _deletedAt,
        'access_level': _accessLevel,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
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
        'access_level': serializeParam(
          _accessLevel,
          ParamType.String,
        ),
      }.withoutNulls;

  static ListControlSystemStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      ListControlSystemStruct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
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
        accessLevel: deserializeParam(
          data['access_level'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'ListControlSystemStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is ListControlSystemStruct &&
        id == other.id &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        deletedAt == other.deletedAt &&
        accessLevel == other.accessLevel;
  }

  @override
  int get hashCode => const ListEquality()
      .hash([id, createdAt, updatedAt, deletedAt, accessLevel]);
}

ListControlSystemStruct createListControlSystemStruct({
  int? id,
  String? createdAt,
  String? updatedAt,
  String? deletedAt,
  String? accessLevel,
}) =>
    ListControlSystemStruct(
      id: id,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
      accessLevel: accessLevel,
    );
