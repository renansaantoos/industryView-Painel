// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class ListRowsTrackersStruct extends BaseStruct {
  ListRowsTrackersStruct({
    int? id,
    String? position,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    int? rowsId,
    int? trackersId,
    int? rowsTrackersStatusesId,
    List<ListTrackersStakesStruct>? listTrackersStakes,
    TrackersStruct? trackers,
  })  : _id = id,
        _position = position,
        _createdAt = createdAt,
        _updatedAt = updatedAt,
        _deletedAt = deletedAt,
        _rowsId = rowsId,
        _trackersId = trackersId,
        _rowsTrackersStatusesId = rowsTrackersStatusesId,
        _listTrackersStakes = listTrackersStakes,
        _trackers = trackers;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "position" field.
  String? _position;
  String get position => _position ?? '';
  set position(String? val) => _position = val;

  bool hasPosition() => _position != null;

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

  // "rows_id" field.
  int? _rowsId;
  int get rowsId => _rowsId ?? 0;
  set rowsId(int? val) => _rowsId = val;

  void incrementRowsId(int amount) => rowsId = rowsId + amount;

  bool hasRowsId() => _rowsId != null;

  // "trackers_id" field.
  int? _trackersId;
  int get trackersId => _trackersId ?? 0;
  set trackersId(int? val) => _trackersId = val;

  void incrementTrackersId(int amount) => trackersId = trackersId + amount;

  bool hasTrackersId() => _trackersId != null;

  // "rows_trackers_statuses_id" field.
  int? _rowsTrackersStatusesId;
  int get rowsTrackersStatusesId => _rowsTrackersStatusesId ?? 0;
  set rowsTrackersStatusesId(int? val) => _rowsTrackersStatusesId = val;

  void incrementRowsTrackersStatusesId(int amount) =>
      rowsTrackersStatusesId = rowsTrackersStatusesId + amount;

  bool hasRowsTrackersStatusesId() => _rowsTrackersStatusesId != null;

  // "list_trackers_stakes" field.
  List<ListTrackersStakesStruct>? _listTrackersStakes;
  List<ListTrackersStakesStruct> get listTrackersStakes =>
      _listTrackersStakes ?? const [];
  set listTrackersStakes(List<ListTrackersStakesStruct>? val) =>
      _listTrackersStakes = val;

  void updateListTrackersStakes(
      Function(List<ListTrackersStakesStruct>) updateFn) {
    updateFn(_listTrackersStakes ??= []);
  }

  bool hasListTrackersStakes() => _listTrackersStakes != null;

  // "trackers" field.
  TrackersStruct? _trackers;
  TrackersStruct get trackers => _trackers ?? TrackersStruct();
  set trackers(TrackersStruct? val) => _trackers = val;

  void updateTrackers(Function(TrackersStruct) updateFn) {
    updateFn(_trackers ??= TrackersStruct());
  }

  bool hasTrackers() => _trackers != null;

  static ListRowsTrackersStruct fromMap(Map<String, dynamic> data) =>
      ListRowsTrackersStruct(
        id: castToType<int>(data['id']),
        position: data['position'] as String?,
        createdAt: castToType<String>(data['created_at']),
        updatedAt: castToType<String>(data['updated_at']),
        deletedAt: castToType<String>(data['deleted_at']),
        rowsId: castToType<int>(data['rows_id']),
        trackersId: castToType<int>(data['trackers_id']),
        rowsTrackersStatusesId:
            castToType<int>(data['rows_trackers_statuses_id']),
        listTrackersStakes: getStructList(
          data['list_trackers_stakes'],
          ListTrackersStakesStruct.fromMap,
        ),
        trackers: data['trackers'] is TrackersStruct
            ? data['trackers']
            : TrackersStruct.maybeFromMap(data['trackers']),
      );

  static ListRowsTrackersStruct? maybeFromMap(dynamic data) => data is Map
      ? ListRowsTrackersStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'position': _position,
        'created_at': _createdAt,
        'updated_at': _updatedAt,
        'deleted_at': _deletedAt,
        'rows_id': _rowsId,
        'trackers_id': _trackersId,
        'rows_trackers_statuses_id': _rowsTrackersStatusesId,
        'list_trackers_stakes':
            _listTrackersStakes?.map((e) => e.toMap()).toList(),
        'trackers': _trackers?.toMap(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'position': serializeParam(
          _position,
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
        'rows_id': serializeParam(
          _rowsId,
          ParamType.int,
        ),
        'trackers_id': serializeParam(
          _trackersId,
          ParamType.int,
        ),
        'rows_trackers_statuses_id': serializeParam(
          _rowsTrackersStatusesId,
          ParamType.int,
        ),
        'list_trackers_stakes': serializeParam(
          _listTrackersStakes,
          ParamType.DataStruct,
          isList: true,
        ),
        'trackers': serializeParam(
          _trackers,
          ParamType.DataStruct,
        ),
      }.withoutNulls;

  static ListRowsTrackersStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      ListRowsTrackersStruct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        position: deserializeParam(
          data['position'],
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
        rowsId: deserializeParam(
          data['rows_id'],
          ParamType.int,
          false,
        ),
        trackersId: deserializeParam(
          data['trackers_id'],
          ParamType.int,
          false,
        ),
        rowsTrackersStatusesId: deserializeParam(
          data['rows_trackers_statuses_id'],
          ParamType.int,
          false,
        ),
        listTrackersStakes: deserializeStructParam<ListTrackersStakesStruct>(
          data['list_trackers_stakes'],
          ParamType.DataStruct,
          true,
          structBuilder: ListTrackersStakesStruct.fromSerializableMap,
        ),
        trackers: deserializeStructParam(
          data['trackers'],
          ParamType.DataStruct,
          false,
          structBuilder: TrackersStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'ListRowsTrackersStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is ListRowsTrackersStruct &&
        id == other.id &&
        position == other.position &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        deletedAt == other.deletedAt &&
        rowsId == other.rowsId &&
        trackersId == other.trackersId &&
        rowsTrackersStatusesId == other.rowsTrackersStatusesId &&
        listEquality.equals(listTrackersStakes, other.listTrackersStakes) &&
        trackers == other.trackers;
  }

  @override
  int get hashCode => const ListEquality().hash([
        id,
        position,
        createdAt,
        updatedAt,
        deletedAt,
        rowsId,
        trackersId,
        rowsTrackersStatusesId,
        listTrackersStakes,
        trackers
      ]);
}

ListRowsTrackersStruct createListRowsTrackersStruct({
  int? id,
  String? position,
  String? createdAt,
  String? updatedAt,
  String? deletedAt,
  int? rowsId,
  int? trackersId,
  int? rowsTrackersStatusesId,
  TrackersStruct? trackers,
}) =>
    ListRowsTrackersStruct(
      id: id,
      position: position,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
      rowsId: rowsId,
      trackersId: trackersId,
      rowsTrackersStatusesId: rowsTrackersStatusesId,
      trackers: trackers ?? TrackersStruct(),
    );
