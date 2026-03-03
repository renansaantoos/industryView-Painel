// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/core/utils/app_utils.dart';

class SprintsStruct extends BaseStruct {
  SprintsStruct({
    int? id,
    String? title,
    String? objective,
    int? startDate,
    int? endDate,
    double? progressPercentage,
    int? tasksConcluidas,
    int? tasksAndamento,
  })  : _id = id,
        _title = title,
        _objective = objective,
        _startDate = startDate,
        _endDate = endDate,
        _progressPercentage = progressPercentage,
        _tasksConcluidas = tasksConcluidas,
        _tasksAndamento = tasksAndamento;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "title" field.
  String? _title;
  String get title => _title ?? '';
  set title(String? val) => _title = val;

  bool hasTitle() => _title != null;

  // "objective" field.
  String? _objective;
  String get objective => _objective ?? '';
  set objective(String? val) => _objective = val;

  bool hasObjective() => _objective != null;

  // "start_date" field.
  int? _startDate;
  int get startDate => _startDate ?? 0;
  set startDate(int? val) => _startDate = val;

  void incrementStartDate(int amount) => startDate = startDate + amount;

  bool hasStartDate() => _startDate != null;

  // "end_date" field.
  int? _endDate;
  int get endDate => _endDate ?? 0;
  set endDate(int? val) => _endDate = val;

  void incrementEndDate(int amount) => endDate = endDate + amount;

  bool hasEndDate() => _endDate != null;

  // "progress_percentage" field.
  double? _progressPercentage;
  double get progressPercentage => _progressPercentage ?? 0.0;
  set progressPercentage(double? val) => _progressPercentage = val;

  void incrementProgressPercentage(double amount) =>
      progressPercentage = progressPercentage + amount;

  bool hasProgressPercentage() => _progressPercentage != null;

  // "tasks_concluidas" field.
  int? _tasksConcluidas;
  int get tasksConcluidas => _tasksConcluidas ?? 0;
  set tasksConcluidas(int? val) => _tasksConcluidas = val;

  void incrementTasksConcluidas(int amount) =>
      tasksConcluidas = tasksConcluidas + amount;

  bool hasTasksConcluidas() => _tasksConcluidas != null;

  // "tasks_andamento" field.
  int? _tasksAndamento;
  int get tasksAndamento => _tasksAndamento ?? 0;
  set tasksAndamento(int? val) => _tasksAndamento = val;

  void incrementTasksAndamento(int amount) =>
      tasksAndamento = tasksAndamento + amount;

  bool hasTasksAndamento() => _tasksAndamento != null;

  static SprintsStruct fromMap(Map<String, dynamic> data) => SprintsStruct(
        id: castToType<int>(data['id']),
        title: data['title'] as String?,
        objective: data['objective'] as String?,
        startDate: castToType<int>(data['start_date']),
        endDate: castToType<int>(data['end_date']),
        progressPercentage: castToType<double>(data['progress_percentage']),
        tasksConcluidas: castToType<int>(data['tasks_concluidas']),
        tasksAndamento: castToType<int>(data['tasks_andamento']),
      );

  static SprintsStruct? maybeFromMap(dynamic data) =>
      data is Map ? SprintsStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'title': _title,
        'objective': _objective,
        'start_date': _startDate,
        'end_date': _endDate,
        'progress_percentage': _progressPercentage,
        'tasks_concluidas': _tasksConcluidas,
        'tasks_andamento': _tasksAndamento,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'title': serializeParam(
          _title,
          ParamType.String,
        ),
        'objective': serializeParam(
          _objective,
          ParamType.String,
        ),
        'start_date': serializeParam(
          _startDate,
          ParamType.int,
        ),
        'end_date': serializeParam(
          _endDate,
          ParamType.int,
        ),
        'progress_percentage': serializeParam(
          _progressPercentage,
          ParamType.double,
        ),
        'tasks_concluidas': serializeParam(
          _tasksConcluidas,
          ParamType.int,
        ),
        'tasks_andamento': serializeParam(
          _tasksAndamento,
          ParamType.int,
        ),
      }.withoutNulls;

  static SprintsStruct fromSerializableMap(Map<String, dynamic> data) =>
      SprintsStruct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        title: deserializeParam(
          data['title'],
          ParamType.String,
          false,
        ),
        objective: deserializeParam(
          data['objective'],
          ParamType.String,
          false,
        ),
        startDate: deserializeParam(
          data['start_date'],
          ParamType.int,
          false,
        ),
        endDate: deserializeParam(
          data['end_date'],
          ParamType.int,
          false,
        ),
        progressPercentage: deserializeParam(
          data['progress_percentage'],
          ParamType.double,
          false,
        ),
        tasksConcluidas: deserializeParam(
          data['tasks_concluidas'],
          ParamType.int,
          false,
        ),
        tasksAndamento: deserializeParam(
          data['tasks_andamento'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'SprintsStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is SprintsStruct &&
        id == other.id &&
        title == other.title &&
        objective == other.objective &&
        startDate == other.startDate &&
        endDate == other.endDate &&
        progressPercentage == other.progressPercentage &&
        tasksConcluidas == other.tasksConcluidas &&
        tasksAndamento == other.tasksAndamento;
  }

  @override
  int get hashCode => const ListEquality().hash([
        id,
        title,
        objective,
        startDate,
        endDate,
        progressPercentage,
        tasksConcluidas,
        tasksAndamento
      ]);
}

SprintsStruct createSprintsStruct({
  int? id,
  String? title,
  String? objective,
  int? startDate,
  int? endDate,
  double? progressPercentage,
  int? tasksConcluidas,
  int? tasksAndamento,
}) =>
    SprintsStruct(
      id: id,
      title: title,
      objective: objective,
      startDate: startDate,
      endDate: endDate,
      progressPercentage: progressPercentage,
      tasksConcluidas: tasksConcluidas,
      tasksAndamento: tasksAndamento,
    );
