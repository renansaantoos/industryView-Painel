// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class ListModulesTrackersStruct extends BaseStruct {
  ListModulesTrackersStruct({
    int? id,
    int? modulesId,
    int? trackersId,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
  })  : _id = id,
        _modulesId = modulesId,
        _trackersId = trackersId,
        _createdAt = createdAt,
        _updatedAt = updatedAt,
        _deletedAt = deletedAt;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "modules_id" field.
  int? _modulesId;
  int get modulesId => _modulesId ?? 0;
  set modulesId(int? val) => _modulesId = val;

  void incrementModulesId(int amount) => modulesId = modulesId + amount;

  bool hasModulesId() => _modulesId != null;

  // "trackers_id" field.
  int? _trackersId;
  int get trackersId => _trackersId ?? 0;
  set trackersId(int? val) => _trackersId = val;

  void incrementTrackersId(int amount) => trackersId = trackersId + amount;

  bool hasTrackersId() => _trackersId != null;

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

  static ListModulesTrackersStruct fromMap(Map<String, dynamic> data) =>
      ListModulesTrackersStruct(
        id: castToType<int>(data['id']),
        modulesId: castToType<int>(data['modules_id']),
        trackersId: castToType<int>(data['trackers_id']),
        createdAt: castToType<String>(data['created_at']),
        updatedAt: castToType<String>(data['updated_at']),
        deletedAt: castToType<String>(data['deleted_at']),
      );

  static ListModulesTrackersStruct? maybeFromMap(dynamic data) => data is Map
      ? ListModulesTrackersStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'modules_id': _modulesId,
        'trackers_id': _trackersId,
        'created_at': _createdAt,
        'updated_at': _updatedAt,
        'deleted_at': _deletedAt,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'modules_id': serializeParam(
          _modulesId,
          ParamType.int,
        ),
        'trackers_id': serializeParam(
          _trackersId,
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
      }.withoutNulls;

  static ListModulesTrackersStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      ListModulesTrackersStruct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        modulesId: deserializeParam(
          data['modules_id'],
          ParamType.int,
          false,
        ),
        trackersId: deserializeParam(
          data['trackers_id'],
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
      );

  @override
  String toString() => 'ListModulesTrackersStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is ListModulesTrackersStruct &&
        id == other.id &&
        modulesId == other.modulesId &&
        trackersId == other.trackersId &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        deletedAt == other.deletedAt;
  }

  @override
  int get hashCode => const ListEquality()
      .hash([id, modulesId, trackersId, createdAt, updatedAt, deletedAt]);
}

ListModulesTrackersStruct createListModulesTrackersStruct({
  int? id,
  int? modulesId,
  int? trackersId,
  String? createdAt,
  String? updatedAt,
  String? deletedAt,
}) =>
    ListModulesTrackersStruct(
      id: id,
      modulesId: modulesId,
      trackersId: trackersId,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
    );
