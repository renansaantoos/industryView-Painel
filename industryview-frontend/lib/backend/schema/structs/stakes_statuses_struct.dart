// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class StakesStatusesStruct extends BaseStruct {
  StakesStatusesStruct({
    String? status,
  }) : _status = status;

  // "status" field.
  String? _status;
  String get status => _status ?? '';
  set status(String? val) => _status = val;

  bool hasStatus() => _status != null;

  static StakesStatusesStruct fromMap(Map<String, dynamic> data) =>
      StakesStatusesStruct(
        status: data['status'] as String?,
      );

  static StakesStatusesStruct? maybeFromMap(dynamic data) => data is Map
      ? StakesStatusesStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'status': _status,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'status': serializeParam(
          _status,
          ParamType.String,
        ),
      }.withoutNulls;

  static StakesStatusesStruct fromSerializableMap(Map<String, dynamic> data) =>
      StakesStatusesStruct(
        status: deserializeParam(
          data['status'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'StakesStatusesStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is StakesStatusesStruct && status == other.status;
  }

  @override
  int get hashCode => const ListEquality().hash([status]);
}

StakesStatusesStruct createStakesStatusesStruct({
  String? status,
}) =>
    StakesStatusesStruct(
      status: status,
    );
