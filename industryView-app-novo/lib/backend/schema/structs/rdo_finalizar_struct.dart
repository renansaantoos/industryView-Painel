// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/core/utils/app_utils.dart';

class RdoFinalizarStruct extends BaseStruct {
  RdoFinalizarStruct({
    int? qtd,
    int? statusId,
    int? tasksId,

    /// Pode ser o id de uma estaca, tracker ou modulo
    int? id,
    int? cod,
  })  : _qtd = qtd,
        _statusId = statusId,
        _tasksId = tasksId,
        _id = id,
        _cod = cod;

  // "qtd" field.
  int? _qtd;
  int get qtd => _qtd ?? 0;
  set qtd(int? val) => _qtd = val;

  void incrementQtd(int amount) => qtd = qtd + amount;

  bool hasQtd() => _qtd != null;

  // "status_id" field.
  int? _statusId;
  int get statusId => _statusId ?? 0;
  set statusId(int? val) => _statusId = val;

  void incrementStatusId(int amount) => statusId = statusId + amount;

  bool hasStatusId() => _statusId != null;

  // "tasks_id" field.
  int? _tasksId;
  int get tasksId => _tasksId ?? 0;
  set tasksId(int? val) => _tasksId = val;

  void incrementTasksId(int amount) => tasksId = tasksId + amount;

  bool hasTasksId() => _tasksId != null;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "COD" field.
  int? _cod;
  int get cod => _cod ?? 0;
  set cod(int? val) => _cod = val;

  void incrementCod(int amount) => cod = cod + amount;

  bool hasCod() => _cod != null;

  static RdoFinalizarStruct fromMap(Map<String, dynamic> data) =>
      RdoFinalizarStruct(
        qtd: castToType<int>(data['qtd']),
        statusId: castToType<int>(data['status_id']),
        tasksId: castToType<int>(data['tasks_id']),
        id: castToType<int>(data['id']),
        cod: castToType<int>(data['COD']),
      );

  static RdoFinalizarStruct? maybeFromMap(dynamic data) => data is Map
      ? RdoFinalizarStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'qtd': _qtd,
        'status_id': _statusId,
        'tasks_id': _tasksId,
        'id': _id,
        'COD': _cod,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'qtd': serializeParam(
          _qtd,
          ParamType.int,
        ),
        'status_id': serializeParam(
          _statusId,
          ParamType.int,
        ),
        'tasks_id': serializeParam(
          _tasksId,
          ParamType.int,
        ),
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'COD': serializeParam(
          _cod,
          ParamType.int,
        ),
      }.withoutNulls;

  static RdoFinalizarStruct fromSerializableMap(Map<String, dynamic> data) =>
      RdoFinalizarStruct(
        qtd: deserializeParam(
          data['qtd'],
          ParamType.int,
          false,
        ),
        statusId: deserializeParam(
          data['status_id'],
          ParamType.int,
          false,
        ),
        tasksId: deserializeParam(
          data['tasks_id'],
          ParamType.int,
          false,
        ),
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        cod: deserializeParam(
          data['COD'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'RdoFinalizarStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is RdoFinalizarStruct &&
        qtd == other.qtd &&
        statusId == other.statusId &&
        tasksId == other.tasksId &&
        id == other.id &&
        cod == other.cod;
  }

  @override
  int get hashCode =>
      const ListEquality().hash([qtd, statusId, tasksId, id, cod]);
}

RdoFinalizarStruct createRdoFinalizarStruct({
  int? qtd,
  int? statusId,
  int? tasksId,
  int? id,
  int? cod,
}) =>
    RdoFinalizarStruct(
      qtd: qtd,
      statusId: statusId,
      tasksId: tasksId,
      id: id,
      cod: cod,
    );
