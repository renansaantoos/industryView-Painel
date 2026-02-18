// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class ListTrackersStakesStruct extends BaseStruct {
  ListTrackersStakesStruct({
    int? id,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    int? trackersId,
    int? stakesId,
    int? stakesStatusesId,
    StakesStruct? stakes,
    String? position,
    StakesStatusesStruct? stakesStatuses,
  })  : _id = id,
        _createdAt = createdAt,
        _updatedAt = updatedAt,
        _deletedAt = deletedAt,
        _trackersId = trackersId,
        _stakesId = stakesId,
        _stakesStatusesId = stakesStatusesId,
        _stakes = stakes,
        _position = position,
        _stakesStatuses = stakesStatuses;

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

  // "trackers_id" field.
  int? _trackersId;
  int get trackersId => _trackersId ?? 0;
  set trackersId(int? val) => _trackersId = val;

  void incrementTrackersId(int amount) => trackersId = trackersId + amount;

  bool hasTrackersId() => _trackersId != null;

  // "stakes_id" field.
  int? _stakesId;
  int get stakesId => _stakesId ?? 0;
  set stakesId(int? val) => _stakesId = val;

  void incrementStakesId(int amount) => stakesId = stakesId + amount;

  bool hasStakesId() => _stakesId != null;

  // "stakes_statuses_id" field.
  int? _stakesStatusesId;
  int get stakesStatusesId => _stakesStatusesId ?? 0;
  set stakesStatusesId(int? val) => _stakesStatusesId = val;

  void incrementStakesStatusesId(int amount) =>
      stakesStatusesId = stakesStatusesId + amount;

  bool hasStakesStatusesId() => _stakesStatusesId != null;

  // "stakes" field.
  StakesStruct? _stakes;
  StakesStruct get stakes => _stakes ?? StakesStruct();
  set stakes(StakesStruct? val) => _stakes = val;

  void updateStakes(Function(StakesStruct) updateFn) {
    updateFn(_stakes ??= StakesStruct());
  }

  bool hasStakes() => _stakes != null;

  // "position" field.
  String? _position;
  String get position => _position ?? '';
  set position(String? val) => _position = val;

  bool hasPosition() => _position != null;

  // "stakes_statuses" field.
  StakesStatusesStruct? _stakesStatuses;
  StakesStatusesStruct get stakesStatuses =>
      _stakesStatuses ?? StakesStatusesStruct();
  set stakesStatuses(StakesStatusesStruct? val) => _stakesStatuses = val;

  void updateStakesStatuses(Function(StakesStatusesStruct) updateFn) {
    updateFn(_stakesStatuses ??= StakesStatusesStruct());
  }

  bool hasStakesStatuses() => _stakesStatuses != null;

  static ListTrackersStakesStruct fromMap(Map<String, dynamic> data) =>
      ListTrackersStakesStruct(
        id: castToType<int>(data['id']),
        createdAt: castToType<String>(data['created_at']),
        updatedAt: castToType<String>(data['updated_at']),
        deletedAt: castToType<String>(data['deleted_at']),
        trackersId: castToType<int>(data['trackers_id']),
        stakesId: castToType<int>(data['stakes_id']),
        stakesStatusesId: castToType<int>(data['stakes_statuses_id']),
        stakes: data['stakes'] is StakesStruct
            ? data['stakes']
            : StakesStruct.maybeFromMap(data['stakes']),
        position: data['position'] as String?,
        stakesStatuses: data['stakes_statuses'] is StakesStatusesStruct
            ? data['stakes_statuses']
            : StakesStatusesStruct.maybeFromMap(data['stakes_statuses']),
      );

  static ListTrackersStakesStruct? maybeFromMap(dynamic data) => data is Map
      ? ListTrackersStakesStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'created_at': _createdAt,
        'updated_at': _updatedAt,
        'deleted_at': _deletedAt,
        'trackers_id': _trackersId,
        'stakes_id': _stakesId,
        'stakes_statuses_id': _stakesStatusesId,
        'stakes': _stakes?.toMap(),
        'position': _position,
        'stakes_statuses': _stakesStatuses?.toMap(),
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
        'trackers_id': serializeParam(
          _trackersId,
          ParamType.int,
        ),
        'stakes_id': serializeParam(
          _stakesId,
          ParamType.int,
        ),
        'stakes_statuses_id': serializeParam(
          _stakesStatusesId,
          ParamType.int,
        ),
        'stakes': serializeParam(
          _stakes,
          ParamType.DataStruct,
        ),
        'position': serializeParam(
          _position,
          ParamType.String,
        ),
        'stakes_statuses': serializeParam(
          _stakesStatuses,
          ParamType.DataStruct,
        ),
      }.withoutNulls;

  static ListTrackersStakesStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      ListTrackersStakesStruct(
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
        trackersId: deserializeParam(
          data['trackers_id'],
          ParamType.int,
          false,
        ),
        stakesId: deserializeParam(
          data['stakes_id'],
          ParamType.int,
          false,
        ),
        stakesStatusesId: deserializeParam(
          data['stakes_statuses_id'],
          ParamType.int,
          false,
        ),
        stakes: deserializeStructParam(
          data['stakes'],
          ParamType.DataStruct,
          false,
          structBuilder: StakesStruct.fromSerializableMap,
        ),
        position: deserializeParam(
          data['position'],
          ParamType.String,
          false,
        ),
        stakesStatuses: deserializeStructParam(
          data['stakes_statuses'],
          ParamType.DataStruct,
          false,
          structBuilder: StakesStatusesStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'ListTrackersStakesStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is ListTrackersStakesStruct &&
        id == other.id &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        deletedAt == other.deletedAt &&
        trackersId == other.trackersId &&
        stakesId == other.stakesId &&
        stakesStatusesId == other.stakesStatusesId &&
        stakes == other.stakes &&
        position == other.position &&
        stakesStatuses == other.stakesStatuses;
  }

  @override
  int get hashCode => const ListEquality().hash([
        id,
        createdAt,
        updatedAt,
        deletedAt,
        trackersId,
        stakesId,
        stakesStatusesId,
        stakes,
        position,
        stakesStatuses
      ]);
}

ListTrackersStakesStruct createListTrackersStakesStruct({
  int? id,
  String? createdAt,
  String? updatedAt,
  String? deletedAt,
  int? trackersId,
  int? stakesId,
  int? stakesStatusesId,
  StakesStruct? stakes,
  String? position,
  StakesStatusesStruct? stakesStatuses,
}) =>
    ListTrackersStakesStruct(
      id: id,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
      trackersId: trackersId,
      stakesId: stakesId,
      stakesStatusesId: stakesStatusesId,
      stakes: stakes ?? StakesStruct(),
      position: position,
      stakesStatuses: stakesStatuses ?? StakesStatusesStruct(),
    );
