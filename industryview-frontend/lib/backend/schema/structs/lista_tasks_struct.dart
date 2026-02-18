// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class ListaTasksStruct extends BaseStruct {
  ListaTasksStruct({
    int? tasksTemplateId,
    double? quantity,
  })  : _tasksTemplateId = tasksTemplateId,
        _quantity = quantity;

  // "tasks_template_id" field.
  int? _tasksTemplateId;
  int get tasksTemplateId => _tasksTemplateId ?? 0;
  set tasksTemplateId(int? val) => _tasksTemplateId = val;

  void incrementTasksTemplateId(int amount) =>
      tasksTemplateId = tasksTemplateId + amount;

  bool hasTasksTemplateId() => _tasksTemplateId != null;

  // "quantity" field.
  double? _quantity;
  double get quantity => _quantity ?? 1.0;
  set quantity(double? val) => _quantity = val;

  void incrementQuantity(double amount) => quantity = quantity + amount;

  bool hasQuantity() => _quantity != null;

  static ListaTasksStruct fromMap(Map<String, dynamic> data) =>
      ListaTasksStruct(
        tasksTemplateId: castToType<int>(data['tasks_template_id']),
        quantity: castToType<double>(data['quantity']),
      );

  static ListaTasksStruct? maybeFromMap(dynamic data) => data is Map
      ? ListaTasksStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'tasks_template_id': _tasksTemplateId,
        'quantity': _quantity,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'tasks_template_id': serializeParam(
          _tasksTemplateId,
          ParamType.int,
        ),
        'quantity': serializeParam(
          _quantity,
          ParamType.double,
        ),
      }.withoutNulls;

  static ListaTasksStruct fromSerializableMap(Map<String, dynamic> data) =>
      ListaTasksStruct(
        tasksTemplateId: deserializeParam(
          data['tasks_template_id'],
          ParamType.int,
          false,
        ),
        quantity: deserializeParam(
          data['quantity'],
          ParamType.double,
          false,
        ),
      );

  @override
  String toString() => 'ListaTasksStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is ListaTasksStruct &&
        tasksTemplateId == other.tasksTemplateId &&
        quantity == other.quantity;
  }

  @override
  int get hashCode => const ListEquality().hash([tasksTemplateId, quantity]);
}

ListaTasksStruct createListaTasksStruct({
  int? tasksTemplateId,
  double? quantity,
}) =>
    ListaTasksStruct(
      tasksTemplateId: tasksTemplateId,
      quantity: quantity,
    );
