// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class SprintFuturaStruct extends BaseStruct {
  SprintFuturaStruct({
    int? id,
    String? title,
    String? objective,
    int? startDate,
    int? endDate,
    int? progressPercentage,
    int? projectsId,
    int? sprintsStatusesId,
  })  : _id = id,
        _title = title,
        _objective = objective,
        _startDate = startDate,
        _endDate = endDate,
        _progressPercentage = progressPercentage,
        _projectsId = projectsId,
        _sprintsStatusesId = sprintsStatusesId;

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
  int? _progressPercentage;
  int get progressPercentage => _progressPercentage ?? 0;
  set progressPercentage(int? val) => _progressPercentage = val;

  void incrementProgressPercentage(int amount) =>
      progressPercentage = progressPercentage + amount;

  bool hasProgressPercentage() => _progressPercentage != null;

  // "projects_id" field.
  int? _projectsId;
  int get projectsId => _projectsId ?? 0;
  set projectsId(int? val) => _projectsId = val;

  void incrementProjectsId(int amount) => projectsId = projectsId + amount;

  bool hasProjectsId() => _projectsId != null;

  // "sprints_statuses_id" field.
  int? _sprintsStatusesId;
  int get sprintsStatusesId => _sprintsStatusesId ?? 0;
  set sprintsStatusesId(int? val) => _sprintsStatusesId = val;

  void incrementSprintsStatusesId(int amount) =>
      sprintsStatusesId = sprintsStatusesId + amount;

  bool hasSprintsStatusesId() => _sprintsStatusesId != null;

  static SprintFuturaStruct fromMap(Map<String, dynamic> data) =>
      SprintFuturaStruct(
        id: castToType<int>(data['id']),
        title: data['title'] as String?,
        objective: data['objective'] as String?,
        startDate: castToType<int>(data['start_date']),
        endDate: castToType<int>(data['end_date']),
        progressPercentage: castToType<int>(data['progress_percentage']),
        projectsId: castToType<int>(data['projects_id']),
        sprintsStatusesId: castToType<int>(data['sprints_statuses_id']),
      );

  static SprintFuturaStruct? maybeFromMap(dynamic data) => data is Map
      ? SprintFuturaStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'title': _title,
        'objective': _objective,
        'start_date': _startDate,
        'end_date': _endDate,
        'progress_percentage': _progressPercentage,
        'projects_id': _projectsId,
        'sprints_statuses_id': _sprintsStatusesId,
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
          ParamType.int,
        ),
        'projects_id': serializeParam(
          _projectsId,
          ParamType.int,
        ),
        'sprints_statuses_id': serializeParam(
          _sprintsStatusesId,
          ParamType.int,
        ),
      }.withoutNulls;

  static SprintFuturaStruct fromSerializableMap(Map<String, dynamic> data) =>
      SprintFuturaStruct(
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
          ParamType.int,
          false,
        ),
        projectsId: deserializeParam(
          data['projects_id'],
          ParamType.int,
          false,
        ),
        sprintsStatusesId: deserializeParam(
          data['sprints_statuses_id'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'SprintFuturaStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is SprintFuturaStruct &&
        id == other.id &&
        title == other.title &&
        objective == other.objective &&
        startDate == other.startDate &&
        endDate == other.endDate &&
        progressPercentage == other.progressPercentage &&
        projectsId == other.projectsId &&
        sprintsStatusesId == other.sprintsStatusesId;
  }

  @override
  int get hashCode => const ListEquality().hash([
        id,
        title,
        objective,
        startDate,
        endDate,
        progressPercentage,
        projectsId,
        sprintsStatusesId
      ]);
}

SprintFuturaStruct createSprintFuturaStruct({
  int? id,
  String? title,
  String? objective,
  int? startDate,
  int? endDate,
  int? progressPercentage,
  int? projectsId,
  int? sprintsStatusesId,
}) =>
    SprintFuturaStruct(
      id: id,
      title: title,
      objective: objective,
      startDate: startDate,
      endDate: endDate,
      progressPercentage: progressPercentage,
      projectsId: projectsId,
      sprintsStatusesId: sprintsStatusesId,
    );
