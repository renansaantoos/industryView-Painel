// ignore_for_file: unnecessary_getters_setters


import 'index.dart';
import '/core/utils/app_utils.dart';

class TasksListStruct extends BaseStruct {
  TasksListStruct({
    int? sprintsTasksId,
    String? description,
    int? sprintsTasksStatusesId,
    int? subtasksId,
    UnityStruct? unity,
    int? unityId,
    double? quantityDone,
    bool? check,
    bool? sucesso,
    bool? inspection,
    String? comment,
    bool? firstComment,
    bool? checkTasks,
    double? quantityAssigned,
  })  : _sprintsTasksId = sprintsTasksId,
        _description = description,
        _sprintsTasksStatusesId = sprintsTasksStatusesId,
        _subtasksId = subtasksId,
        _unity = unity,
        _unityId = unityId,
        _quantityDone = quantityDone,
        _check = check,
        _sucesso = sucesso,
        _inspection = inspection,
        _comment = comment,
        _firstComment = firstComment,
        _checkTasks = checkTasks,
        _quantityAssigned = quantityAssigned;

  // "sprints_tasks_id" field.
  int? _sprintsTasksId;
  int get sprintsTasksId => _sprintsTasksId ?? 0;
  set sprintsTasksId(int? val) => _sprintsTasksId = val;

  void incrementSprintsTasksId(int amount) =>
      sprintsTasksId = sprintsTasksId + amount;

  bool hasSprintsTasksId() => _sprintsTasksId != null;

  // "description" field.
  String? _description;
  String get description => _description ?? '';
  set description(String? val) => _description = val;

  bool hasDescription() => _description != null;

  // "sprints_tasks_statuses_id" field.
  int? _sprintsTasksStatusesId;
  int get sprintsTasksStatusesId => _sprintsTasksStatusesId ?? 0;
  set sprintsTasksStatusesId(int? val) => _sprintsTasksStatusesId = val;

  void incrementSprintsTasksStatusesId(int amount) =>
      sprintsTasksStatusesId = sprintsTasksStatusesId + amount;

  bool hasSprintsTasksStatusesId() => _sprintsTasksStatusesId != null;

  // "subtasks_id" field.
  int? _subtasksId;
  int get subtasksId => _subtasksId ?? 0;
  set subtasksId(int? val) => _subtasksId = val;

  void incrementSubtasksId(int amount) => subtasksId = subtasksId + amount;

  bool hasSubtasksId() => _subtasksId != null;

  // "unity" field.
  UnityStruct? _unity;
  UnityStruct get unity => _unity ?? UnityStruct();
  set unity(UnityStruct? val) => _unity = val;

  void updateUnity(Function(UnityStruct) updateFn) {
    updateFn(_unity ??= UnityStruct());
  }

  bool hasUnity() => _unity != null;

  // "unity_id" field.
  int? _unityId;
  int get unityId => _unityId ?? 0;
  set unityId(int? val) => _unityId = val;

  void incrementUnityId(int amount) => unityId = unityId + amount;

  bool hasUnityId() => _unityId != null;

  // "quantity_done" field.
  double? _quantityDone;
  double get quantityDone => _quantityDone ?? 0.0;
  set quantityDone(double? val) => _quantityDone = val;

  void incrementQuantityDone(double amount) =>
      quantityDone = quantityDone + amount;

  bool hasQuantityDone() => _quantityDone != null;

  // "check" field.
  bool? _check;
  bool get check => _check ?? false;
  set check(bool? val) => _check = val;

  bool hasCheck() => _check != null;

  // "sucesso" field.
  bool? _sucesso;
  bool get sucesso => _sucesso ?? true;
  set sucesso(bool? val) => _sucesso = val;

  bool hasSucesso() => _sucesso != null;

  // "inspection" field.
  bool? _inspection;
  bool get inspection => _inspection ?? false;
  set inspection(bool? val) => _inspection = val;

  bool hasInspection() => _inspection != null;

  // "comment" field.
  String? _comment;
  String get comment => _comment ?? '';
  set comment(String? val) => _comment = val;

  bool hasComment() => _comment != null;

  // "first_comment" field.
  bool? _firstComment;
  bool get firstComment => _firstComment ?? false;
  set firstComment(bool? val) => _firstComment = val;

  bool hasFirstComment() => _firstComment != null;

  // "checkTasks" field.
  bool? _checkTasks;
  bool get checkTasks => _checkTasks ?? false;
  set checkTasks(bool? val) => _checkTasks = val;

  bool hasCheckTasks() => _checkTasks != null;

  // "quantity_assigned" field.
  double? _quantityAssigned;
  double get quantityAssigned => _quantityAssigned ?? 0.0;
  set quantityAssigned(double? val) => _quantityAssigned = val;

  bool hasQuantityAssigned() => _quantityAssigned != null;

  static TasksListStruct fromMap(Map<String, dynamic> data) => TasksListStruct(
        sprintsTasksId: castToType<int>(data['sprints_tasks_id']),
        description: data['description'] as String?,
        sprintsTasksStatusesId:
            castToType<int>(data['sprints_tasks_statuses_id']),
        subtasksId: castToType<int>(data['subtasks_id']),
        unity: data['unity'] is UnityStruct
            ? data['unity']
            : UnityStruct.maybeFromMap(data['unity']),
        unityId: castToType<int>(data['unity_id']),
        quantityDone: castToType<double>(data['quantity_done']),
        check: data['check'] as bool?,
        sucesso: data['sucesso'] as bool?,
        inspection: data['inspection'] as bool?,
        comment: data['comment'] as String?,
        firstComment: data['first_comment'] as bool?,
        checkTasks: data['checkTasks'] as bool?,
        quantityAssigned: castToType<double>(data['quantity_assigned']),
      );

  static TasksListStruct? maybeFromMap(dynamic data) => data is Map
      ? TasksListStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'sprints_tasks_id': _sprintsTasksId,
        'description': _description,
        'sprints_tasks_statuses_id': _sprintsTasksStatusesId,
        'subtasks_id': _subtasksId,
        'unity': _unity?.toMap(),
        'unity_id': _unityId,
        'quantity_done': _quantityDone,
        'check': _check,
        'sucesso': _sucesso,
        'inspection': _inspection,
        'comment': _comment,
        'first_comment': _firstComment,
        'checkTasks': _checkTasks,
        'quantity_assigned': _quantityAssigned,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'sprints_tasks_id': serializeParam(
          _sprintsTasksId,
          ParamType.int,
        ),
        'description': serializeParam(
          _description,
          ParamType.String,
        ),
        'sprints_tasks_statuses_id': serializeParam(
          _sprintsTasksStatusesId,
          ParamType.int,
        ),
        'subtasks_id': serializeParam(
          _subtasksId,
          ParamType.int,
        ),
        'unity': serializeParam(
          _unity,
          ParamType.DataStruct,
        ),
        'unity_id': serializeParam(
          _unityId,
          ParamType.int,
        ),
        'quantity_done': serializeParam(
          _quantityDone,
          ParamType.double,
        ),
        'check': serializeParam(
          _check,
          ParamType.bool,
        ),
        'sucesso': serializeParam(
          _sucesso,
          ParamType.bool,
        ),
        'inspection': serializeParam(
          _inspection,
          ParamType.bool,
        ),
        'comment': serializeParam(
          _comment,
          ParamType.String,
        ),
        'first_comment': serializeParam(
          _firstComment,
          ParamType.bool,
        ),
        'checkTasks': serializeParam(
          _checkTasks,
          ParamType.bool,
        ),
        'quantity_assigned': serializeParam(
          _quantityAssigned,
          ParamType.double,
        ),
      }.withoutNulls;

  static TasksListStruct fromSerializableMap(Map<String, dynamic> data) =>
      TasksListStruct(
        sprintsTasksId: deserializeParam(
          data['sprints_tasks_id'],
          ParamType.int,
          false,
        ),
        description: deserializeParam(
          data['description'],
          ParamType.String,
          false,
        ),
        sprintsTasksStatusesId: deserializeParam(
          data['sprints_tasks_statuses_id'],
          ParamType.int,
          false,
        ),
        subtasksId: deserializeParam(
          data['subtasks_id'],
          ParamType.int,
          false,
        ),
        unity: deserializeStructParam(
          data['unity'],
          ParamType.DataStruct,
          false,
          structBuilder: UnityStruct.fromSerializableMap,
        ),
        unityId: deserializeParam(
          data['unity_id'],
          ParamType.int,
          false,
        ),
        quantityDone: deserializeParam(
          data['quantity_done'],
          ParamType.double,
          false,
        ),
        check: deserializeParam(
          data['check'],
          ParamType.bool,
          false,
        ),
        sucesso: deserializeParam(
          data['sucesso'],
          ParamType.bool,
          false,
        ),
        inspection: deserializeParam(
          data['inspection'],
          ParamType.bool,
          false,
        ),
        comment: deserializeParam(
          data['comment'],
          ParamType.String,
          false,
        ),
        firstComment: deserializeParam(
          data['first_comment'],
          ParamType.bool,
          false,
        ),
        checkTasks: deserializeParam(
          data['checkTasks'],
          ParamType.bool,
          false,
        ),
        quantityAssigned: deserializeParam(
          data['quantity_assigned'],
          ParamType.double,
          false,
        ),
      );

  @override
  String toString() => 'TasksListStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is TasksListStruct &&
        sprintsTasksId == other.sprintsTasksId &&
        description == other.description &&
        sprintsTasksStatusesId == other.sprintsTasksStatusesId &&
        subtasksId == other.subtasksId &&
        unity == other.unity &&
        unityId == other.unityId &&
        quantityDone == other.quantityDone &&
        check == other.check &&
        sucesso == other.sucesso &&
        inspection == other.inspection &&
        comment == other.comment &&
        firstComment == other.firstComment &&
        checkTasks == other.checkTasks &&
        quantityAssigned == other.quantityAssigned;
  }

  @override
  int get hashCode => const ListEquality().hash([
        sprintsTasksId,
        description,
        sprintsTasksStatusesId,
        subtasksId,
        unity,
        unityId,
        quantityDone,
        check,
        sucesso,
        inspection,
        comment,
        firstComment,
        checkTasks,
        quantityAssigned
      ]);
}

TasksListStruct createTasksListStruct({
  int? sprintsTasksId,
  String? description,
  int? sprintsTasksStatusesId,
  int? subtasksId,
  UnityStruct? unity,
  int? unityId,
  double? quantityDone,
  bool? check,
  bool? sucesso,
  bool? inspection,
  String? comment,
  bool? firstComment,
  bool? checkTasks,
  double? quantityAssigned,
}) =>
    TasksListStruct(
      sprintsTasksId: sprintsTasksId,
      description: description,
      sprintsTasksStatusesId: sprintsTasksStatusesId,
      subtasksId: subtasksId,
      unity: unity ?? UnityStruct(),
      unityId: unityId,
      quantityDone: quantityDone,
      check: check,
      sucesso: sucesso,
      inspection: inspection,
      comment: comment,
      firstComment: firstComment,
      checkTasks: checkTasks,
      quantityAssigned: quantityAssigned,
    );
