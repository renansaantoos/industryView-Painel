// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class DropSelect1Struct extends BaseStruct {
  DropSelect1Struct({
    int? id,
    String? text,
    String? position,
    int? rowsTrackersStatusesId,
    int? rowsTrackersId,
    int? trackersId,
    String? deletedAt,
    String? trackersTypestype,
    bool? erro,
  })  : _id = id,
        _text = text,
        _position = position,
        _rowsTrackersStatusesId = rowsTrackersStatusesId,
        _rowsTrackersId = rowsTrackersId,
        _trackersId = trackersId,
        _deletedAt = deletedAt,
        _trackersTypestype = trackersTypestype,
        _erro = erro;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "text" field.
  String? _text;
  String get text => _text ?? '';
  set text(String? val) => _text = val;

  bool hasText() => _text != null;

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

  // "trackers_id" field.
  int? _trackersId;
  int get trackersId => _trackersId ?? 0;
  set trackersId(int? val) => _trackersId = val;

  void incrementTrackersId(int amount) => trackersId = trackersId + amount;

  bool hasTrackersId() => _trackersId != null;

  // "deleted_at" field.
  String? _deletedAt;
  String get deletedAt => _deletedAt ?? '';
  set deletedAt(String? val) => _deletedAt = val;

  bool hasDeletedAt() => _deletedAt != null;

  // "trackers_typestype" field.
  String? _trackersTypestype;
  String get trackersTypestype => _trackersTypestype ?? '';
  set trackersTypestype(String? val) => _trackersTypestype = val;

  bool hasTrackersTypestype() => _trackersTypestype != null;

  // "erro" field.
  bool? _erro;
  bool get erro => _erro ?? false;
  set erro(bool? val) => _erro = val;

  bool hasErro() => _erro != null;

  static DropSelect1Struct fromMap(Map<String, dynamic> data) =>
      DropSelect1Struct(
        id: castToType<int>(data['id']),
        text: data['text'] as String?,
        position: data['position'] as String?,
        rowsTrackersStatusesId:
            castToType<int>(data['rows_trackers_statuses_id']),
        rowsTrackersId: castToType<int>(data['rows_trackers_id']),
        trackersId: castToType<int>(data['trackers_id']),
        deletedAt: castToType<String>(data['deleted_at']),
        trackersTypestype: data['trackers_typestype'] as String?,
        erro: data['erro'] as bool?,
      );

  static DropSelect1Struct? maybeFromMap(dynamic data) => data is Map
      ? DropSelect1Struct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'text': _text,
        'position': _position,
        'rows_trackers_statuses_id': _rowsTrackersStatusesId,
        'rows_trackers_id': _rowsTrackersId,
        'trackers_id': _trackersId,
        'deleted_at': _deletedAt,
        'trackers_typestype': _trackersTypestype,
        'erro': _erro,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'text': serializeParam(
          _text,
          ParamType.String,
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
        'trackers_id': serializeParam(
          _trackersId,
          ParamType.int,
        ),
        'deleted_at': serializeParam(
          _deletedAt,
          ParamType.String,
        ),
        'trackers_typestype': serializeParam(
          _trackersTypestype,
          ParamType.String,
        ),
        'erro': serializeParam(
          _erro,
          ParamType.bool,
        ),
      }.withoutNulls;

  static DropSelect1Struct fromSerializableMap(Map<String, dynamic> data) =>
      DropSelect1Struct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        text: deserializeParam(
          data['text'],
          ParamType.String,
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
        trackersId: deserializeParam(
          data['trackers_id'],
          ParamType.int,
          false,
        ),
        deletedAt: deserializeParam(
          data['deleted_at'],
          ParamType.String,
          false,
        ),
        trackersTypestype: deserializeParam(
          data['trackers_typestype'],
          ParamType.String,
          false,
        ),
        erro: deserializeParam(
          data['erro'],
          ParamType.bool,
          false,
        ),
      );

  @override
  String toString() => 'DropSelect1Struct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is DropSelect1Struct &&
        id == other.id &&
        text == other.text &&
        position == other.position &&
        rowsTrackersStatusesId == other.rowsTrackersStatusesId &&
        rowsTrackersId == other.rowsTrackersId &&
        trackersId == other.trackersId &&
        deletedAt == other.deletedAt &&
        trackersTypestype == other.trackersTypestype &&
        erro == other.erro;
  }

  @override
  int get hashCode => const ListEquality().hash([
        id,
        text,
        position,
        rowsTrackersStatusesId,
        rowsTrackersId,
        trackersId,
        deletedAt,
        trackersTypestype,
        erro
      ]);
}

DropSelect1Struct createDropSelect1Struct({
  int? id,
  String? text,
  String? position,
  int? rowsTrackersStatusesId,
  int? rowsTrackersId,
  int? trackersId,
  String? deletedAt,
  String? trackersTypestype,
  bool? erro,
}) =>
    DropSelect1Struct(
      id: id,
      text: text,
      position: position,
      rowsTrackersStatusesId: rowsTrackersStatusesId,
      rowsTrackersId: rowsTrackersId,
      trackersId: trackersId,
      deletedAt: deletedAt,
      trackersTypestype: trackersTypestype,
      erro: erro,
    );
