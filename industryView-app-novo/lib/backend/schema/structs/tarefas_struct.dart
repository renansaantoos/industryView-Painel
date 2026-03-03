// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/core/utils/app_utils.dart';

class TarefasStruct extends BaseStruct {
  TarefasStruct({
    int? id,
    String? equipamento,
  })  : _id = id,
        _equipamento = equipamento;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "equipamento" field.
  String? _equipamento;
  String get equipamento => _equipamento ?? '';
  set equipamento(String? val) => _equipamento = val;

  bool hasEquipamento() => _equipamento != null;

  static TarefasStruct fromMap(Map<String, dynamic> data) => TarefasStruct(
        id: castToType<int>(data['id']),
        equipamento: data['equipamento'] as String?,
      );

  static TarefasStruct? maybeFromMap(dynamic data) =>
      data is Map ? TarefasStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'equipamento': _equipamento,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'equipamento': serializeParam(
          _equipamento,
          ParamType.String,
        ),
      }.withoutNulls;

  static TarefasStruct fromSerializableMap(Map<String, dynamic> data) =>
      TarefasStruct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        equipamento: deserializeParam(
          data['equipamento'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'TarefasStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is TarefasStruct &&
        id == other.id &&
        equipamento == other.equipamento;
  }

  @override
  int get hashCode => const ListEquality().hash([id, equipamento]);
}

TarefasStruct createTarefasStruct({
  int? id,
  String? equipamento,
}) =>
    TarefasStruct(
      id: id,
      equipamento: equipamento,
    );
