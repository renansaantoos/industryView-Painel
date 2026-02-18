// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class AddTrackersStruct extends BaseStruct {
  AddTrackersStruct({
    int? trackersId,
    String? position,
    int? rowsTrackersStatusesId,
    int? rowsTrackersId,
    bool? status,
  })  : _trackersId = trackersId,
        _position = position,
        _rowsTrackersStatusesId = rowsTrackersStatusesId,
        _rowsTrackersId = rowsTrackersId,
        _status = status;

  // "trackers_id" field.
  int? _trackersId;
  int get trackersId => _trackersId ?? 0;
  set trackersId(int? val) => _trackersId = val;

  void incrementTrackersId(int amount) => trackersId = trackersId + amount;

  bool hasTrackersId() => _trackersId != null;

  // "position" field.
  String? _position;
  String get position => _position ?? '';
  set position(String? val) => _position = val;

  bool hasPosition() => _position != null;

  // "rows_trackers_statuses_id" field.
  int? _rowsTrackersStatusesId;
  int get rowsTrackersStatusesId => _rowsTrackersStatusesId ?? 0;
  set rowsTrackersStatusesId(int? val) => _rowsTrackersStatusesId = val;

  void incrementRowsTrackersStatusesId(int amount) =>
      rowsTrackersStatusesId = rowsTrackersStatusesId + amount;

  bool hasRowsTrackersStatusesId() => _rowsTrackersStatusesId != null;

  // "rows_trackers_id" field.
  int? _rowsTrackersId;
  int get rowsTrackersId => _rowsTrackersId ?? 0;
  set rowsTrackersId(int? val) => _rowsTrackersId = val;

  void incrementRowsTrackersId(int amount) =>
      rowsTrackersId = rowsTrackersId + amount;

  bool hasRowsTrackersId() => _rowsTrackersId != null;

  // "status" field.
  bool? _status;
  bool get status => _status ?? false;
  set status(bool? val) => _status = val;

  bool hasStatus() => _status != null;

  static AddTrackersStruct fromMap(Map<String, dynamic> data) =>
      AddTrackersStruct(
        trackersId: castToType<int>(data['trackers_id']),
        position: data['position'] as String?,
        rowsTrackersStatusesId:
            castToType<int>(data['rows_trackers_statuses_id']),
        rowsTrackersId: castToType<int>(data['rows_trackers_id']),
        status: data['status'] as bool?,
      );

  static AddTrackersStruct? maybeFromMap(dynamic data) => data is Map
      ? AddTrackersStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'trackers_id': _trackersId,
        'position': _position,
        'rows_trackers_statuses_id': _rowsTrackersStatusesId,
        'rows_trackers_id': _rowsTrackersId,
        'status': _status,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'trackers_id': serializeParam(
          _trackersId,
          ParamType.int,
        ),
        'position': serializeParam(
          _position,
          ParamType.String,
        ),
        'rows_trackers_statuses_id': serializeParam(
          _rowsTrackersStatusesId,
          ParamType.int,
        ),
        'rows_trackers_id': serializeParam(
          _rowsTrackersId,
          ParamType.int,
        ),
        'status': serializeParam(
          _status,
          ParamType.bool,
        ),
      }.withoutNulls;

  static AddTrackersStruct fromSerializableMap(Map<String, dynamic> data) =>
      AddTrackersStruct(
        trackersId: deserializeParam(
          data['trackers_id'],
          ParamType.int,
          false,
        ),
        position: deserializeParam(
          data['position'],
          ParamType.String,
          false,
        ),
        rowsTrackersStatusesId: deserializeParam(
          data['rows_trackers_statuses_id'],
          ParamType.int,
          false,
        ),
        rowsTrackersId: deserializeParam(
          data['rows_trackers_id'],
          ParamType.int,
          false,
        ),
        status: deserializeParam(
          data['status'],
          ParamType.bool,
          false,
        ),
      );

  @override
  String toString() => 'AddTrackersStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is AddTrackersStruct &&
        trackersId == other.trackersId &&
        position == other.position &&
        rowsTrackersStatusesId == other.rowsTrackersStatusesId &&
        rowsTrackersId == other.rowsTrackersId &&
        status == other.status;
  }

  @override
  int get hashCode => const ListEquality().hash(
      [trackersId, position, rowsTrackersStatusesId, rowsTrackersId, status]);
}

AddTrackersStruct createAddTrackersStruct({
  int? trackersId,
  String? position,
  int? rowsTrackersStatusesId,
  int? rowsTrackersId,
  bool? status,
}) =>
    AddTrackersStruct(
      trackersId: trackersId,
      position: position,
      rowsTrackersStatusesId: rowsTrackersStatusesId,
      rowsTrackersId: rowsTrackersId,
      status: status,
    );
