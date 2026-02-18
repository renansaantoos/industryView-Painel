// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class EquipamentsTypeStruct extends BaseStruct {
  EquipamentsTypeStruct({
    int? id,
    String? type,
    int? index,
  })  : _id = id,
        _type = type,
        _index = index;

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

  // "index" field.
  int? _index;
  int get index => _index ?? 0;
  set index(int? val) => _index = val;

  void incrementIndex(int amount) => index = index + amount;

  bool hasIndex() => _index != null;

  static EquipamentsTypeStruct fromMap(Map<String, dynamic> data) =>
      EquipamentsTypeStruct(
        id: castToType<int>(data['id']),
        type: data['type'] as String?,
        index: castToType<int>(data['index']),
      );

  static EquipamentsTypeStruct? maybeFromMap(dynamic data) => data is Map
      ? EquipamentsTypeStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'type': _type,
        'index': _index,
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
        'index': serializeParam(
          _index,
          ParamType.int,
        ),
      }.withoutNulls;

  static EquipamentsTypeStruct fromSerializableMap(Map<String, dynamic> data) =>
      EquipamentsTypeStruct(
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
        index: deserializeParam(
          data['index'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'EquipamentsTypeStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is EquipamentsTypeStruct &&
        id == other.id &&
        type == other.type &&
        index == other.index;
  }

  @override
  int get hashCode => const ListEquality().hash([id, type, index]);
}

EquipamentsTypeStruct createEquipamentsTypeStruct({
  int? id,
  String? type,
  int? index,
}) =>
    EquipamentsTypeStruct(
      id: id,
      type: type,
      index: index,
    );
