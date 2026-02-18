// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class JsonTRACKERStruct extends BaseStruct {
  JsonTRACKERStruct({
    int? stakesPosition,
    bool? stakesIsMotor,
    int? stakesTypesId,
    int? stakesStatusesId,
  })  : _stakesPosition = stakesPosition,
        _stakesIsMotor = stakesIsMotor,
        _stakesTypesId = stakesTypesId,
        _stakesStatusesId = stakesStatusesId;

  // "stakes_position" field.
  int? _stakesPosition;
  int get stakesPosition => _stakesPosition ?? 0;
  set stakesPosition(int? val) => _stakesPosition = val;

  void incrementStakesPosition(int amount) =>
      stakesPosition = stakesPosition + amount;

  bool hasStakesPosition() => _stakesPosition != null;

  // "stakes_is_motor" field.
  bool? _stakesIsMotor;
  bool get stakesIsMotor => _stakesIsMotor ?? false;
  set stakesIsMotor(bool? val) => _stakesIsMotor = val;

  bool hasStakesIsMotor() => _stakesIsMotor != null;

  // "stakes_types_id" field.
  int? _stakesTypesId;
  int get stakesTypesId => _stakesTypesId ?? 0;
  set stakesTypesId(int? val) => _stakesTypesId = val;

  void incrementStakesTypesId(int amount) =>
      stakesTypesId = stakesTypesId + amount;

  bool hasStakesTypesId() => _stakesTypesId != null;

  // "stakes_statuses_id" field.
  int? _stakesStatusesId;
  int get stakesStatusesId => _stakesStatusesId ?? 0;
  set stakesStatusesId(int? val) => _stakesStatusesId = val;

  void incrementStakesStatusesId(int amount) =>
      stakesStatusesId = stakesStatusesId + amount;

  bool hasStakesStatusesId() => _stakesStatusesId != null;

  static JsonTRACKERStruct fromMap(Map<String, dynamic> data) =>
      JsonTRACKERStruct(
        stakesPosition: castToType<int>(data['stakes_position']),
        stakesIsMotor: data['stakes_is_motor'] as bool?,
        stakesTypesId: castToType<int>(data['stakes_types_id']),
        stakesStatusesId: castToType<int>(data['stakes_statuses_id']),
      );

  static JsonTRACKERStruct? maybeFromMap(dynamic data) => data is Map
      ? JsonTRACKERStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'stakes_position': _stakesPosition,
        'stakes_is_motor': _stakesIsMotor,
        'stakes_types_id': _stakesTypesId,
        'stakes_statuses_id': _stakesStatusesId,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'stakes_position': serializeParam(
          _stakesPosition,
          ParamType.int,
        ),
        'stakes_is_motor': serializeParam(
          _stakesIsMotor,
          ParamType.bool,
        ),
        'stakes_types_id': serializeParam(
          _stakesTypesId,
          ParamType.int,
        ),
        'stakes_statuses_id': serializeParam(
          _stakesStatusesId,
          ParamType.int,
        ),
      }.withoutNulls;

  static JsonTRACKERStruct fromSerializableMap(Map<String, dynamic> data) =>
      JsonTRACKERStruct(
        stakesPosition: deserializeParam(
          data['stakes_position'],
          ParamType.int,
          false,
        ),
        stakesIsMotor: deserializeParam(
          data['stakes_is_motor'],
          ParamType.bool,
          false,
        ),
        stakesTypesId: deserializeParam(
          data['stakes_types_id'],
          ParamType.int,
          false,
        ),
        stakesStatusesId: deserializeParam(
          data['stakes_statuses_id'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'JsonTRACKERStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is JsonTRACKERStruct &&
        stakesPosition == other.stakesPosition &&
        stakesIsMotor == other.stakesIsMotor &&
        stakesTypesId == other.stakesTypesId &&
        stakesStatusesId == other.stakesStatusesId;
  }

  @override
  int get hashCode => const ListEquality()
      .hash([stakesPosition, stakesIsMotor, stakesTypesId, stakesStatusesId]);
}

JsonTRACKERStruct createJsonTRACKERStruct({
  int? stakesPosition,
  bool? stakesIsMotor,
  int? stakesTypesId,
  int? stakesStatusesId,
}) =>
    JsonTRACKERStruct(
      stakesPosition: stakesPosition,
      stakesIsMotor: stakesIsMotor,
      stakesTypesId: stakesTypesId,
      stakesStatusesId: stakesStatusesId,
    );
