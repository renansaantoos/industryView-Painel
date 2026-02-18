// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class DropSelect2Struct extends BaseStruct {
  DropSelect2Struct({
    int? id,
    String? text,
  })  : _id = id,
        _text = text;

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

  static DropSelect2Struct fromMap(Map<String, dynamic> data) =>
      DropSelect2Struct(
        id: castToType<int>(data['id']),
        text: data['text'] as String?,
      );

  static DropSelect2Struct? maybeFromMap(dynamic data) => data is Map
      ? DropSelect2Struct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'text': _text,
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
      }.withoutNulls;

  static DropSelect2Struct fromSerializableMap(Map<String, dynamic> data) =>
      DropSelect2Struct(
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
      );

  @override
  String toString() => 'DropSelect2Struct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is DropSelect2Struct && id == other.id && text == other.text;
  }

  @override
  int get hashCode => const ListEquality().hash([id, text]);
}

DropSelect2Struct createDropSelect2Struct({
  int? id,
  String? text,
}) =>
    DropSelect2Struct(
      id: id,
      text: text,
    );
