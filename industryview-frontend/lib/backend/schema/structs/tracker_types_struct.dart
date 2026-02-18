// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class TrackerTypesStruct extends BaseStruct {
  TrackerTypesStruct({
    int? id,
    String? type,
  })  : _id = id,
        _type = type;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "type" field.
  String? _type;
  String get type => _type ?? '';
  set type(String? val) => _type = val;

  bool hasType() => _type != null;

  static TrackerTypesStruct fromMap(Map<String, dynamic> data) =>
      TrackerTypesStruct(
        id: castToType<int>(data['id']),
        type: data['type'] as String?,
      );

  static TrackerTypesStruct? maybeFromMap(dynamic data) => data is Map
      ? TrackerTypesStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'type': _type,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'type': serializeParam(
          _type,
          ParamType.String,
        ),
      }.withoutNulls;

  static TrackerTypesStruct fromSerializableMap(Map<String, dynamic> data) =>
      TrackerTypesStruct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        type: deserializeParam(
          data['type'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'TrackerTypesStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is TrackerTypesStruct && id == other.id && type == other.type;
  }

  @override
  int get hashCode => const ListEquality().hash([id, type]);
}

TrackerTypesStruct createTrackerTypesStruct({
  int? id,
  String? type,
}) =>
    TrackerTypesStruct(
      id: id,
      type: type,
    );
