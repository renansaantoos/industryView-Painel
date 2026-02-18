// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class VarAddTracker3Struct extends BaseStruct {
  VarAddTracker3Struct({
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

  static VarAddTracker3Struct fromMap(Map<String, dynamic> data) =>
      VarAddTracker3Struct(
        id: castToType<int>(data['id']),
        type: data['type'] as String?,
      );

  static VarAddTracker3Struct? maybeFromMap(dynamic data) => data is Map
      ? VarAddTracker3Struct.fromMap(data.cast<String, dynamic>())
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

  static VarAddTracker3Struct fromSerializableMap(Map<String, dynamic> data) =>
      VarAddTracker3Struct(
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
  String toString() => 'VarAddTracker3Struct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is VarAddTracker3Struct &&
        id == other.id &&
        type == other.type;
  }

  @override
  int get hashCode => const ListEquality().hash([id, type]);
}

VarAddTracker3Struct createVarAddTracker3Struct({
  int? id,
  String? type,
}) =>
    VarAddTracker3Struct(
      id: id,
      type: type,
    );
