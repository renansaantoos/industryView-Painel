class SprintTaskModel {
  final int? id;
  final int? sprintsTasksId;
  final String? clientId;
  final int? sprintsId;
  final int? projectsId;
  final int? teamsId;
  final String? description;
  final int? sprintsTasksStatusesId;
  final int? subtasksId;
  final int? unityId;
  final String? unity;
  final double? quantityDone;
  final bool check;
  final bool sucesso;
  final bool inspection;
  final bool canConclude;
  final String? comment;
  final bool firstComment;
  final bool checkTasks;
  final int? equipamentsTypesId;
  final String? projectsBacklogsJson;
  final String? subtasksJson;
  final int? updatedAt;
  final int? createdAt;
  final int? syncedAt;

  SprintTaskModel({
    this.id,
    this.sprintsTasksId,
    this.clientId,
    this.sprintsId,
    this.projectsId,
    this.teamsId,
    this.description,
    this.sprintsTasksStatusesId,
    this.subtasksId,
    this.unityId,
    this.unity,
    this.quantityDone,
    this.check = false,
    this.sucesso = true,
    this.inspection = false,
    this.canConclude = false,
    this.comment,
    this.firstComment = false,
    this.checkTasks = false,
    this.equipamentsTypesId,
    this.projectsBacklogsJson,
    this.subtasksJson,
    this.updatedAt,
    this.createdAt,
    this.syncedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'sprints_tasks_id': sprintsTasksId,
      'client_id': clientId,
      'sprints_id': sprintsId,
      'projects_id': projectsId,
      'teams_id': teamsId,
      'description': description,
      'sprints_tasks_statuses_id': sprintsTasksStatusesId,
      'subtasks_id': subtasksId,
      'unity_id': unityId,
      'unity': unity,
      'quantity_done': quantityDone,
      'check_field': check ? 1 : 0,
      'sucesso': sucesso ? 1 : 0,
      'inspection': inspection ? 1 : 0,
      'can_conclude': canConclude ? 1 : 0,
      'comment': comment,
      'first_comment': firstComment ? 1 : 0,
      'check_tasks': checkTasks ? 1 : 0,
      'equipaments_types_id': equipamentsTypesId,
      'projects_backlogs_json': projectsBacklogsJson,
      'subtasks_json': subtasksJson,
      'updated_at': updatedAt,
      'created_at': createdAt,
      'synced_at': syncedAt,
    };
  }

  /// Converte qualquer tipo numérico ou String para int? de forma segura.
  /// Necessário pois a API pode retornar campos como String ("42") ou int (42).
  static int? _toInt(dynamic v) {
    if (v == null) return null;
    if (v is int) return v;
    if (v is double) return v.toInt();
    if (v is String) return int.tryParse(v) ?? double.tryParse(v)?.toInt();
    return null;
  }

  /// Converte qualquer tipo numérico ou String para double? de forma segura.
  static double? _toDouble(dynamic v) {
    if (v == null) return null;
    if (v is double) return v;
    if (v is int) return v.toDouble();
    if (v is String) return double.tryParse(v);
    return null;
  }

  /// Converte para bool de forma segura (0/false/"0"/"false" → false, demais → true).
  static bool _toBool(dynamic v, {bool defaultValue = false}) {
    if (v == null) return defaultValue;
    if (v is bool) return v;
    if (v is int) return v == 1;
    if (v is String) {
      final normalized = v.toLowerCase();
      return normalized == '1' || normalized == 'true';
    }
    return defaultValue;
  }

  factory SprintTaskModel.fromMap(Map<String, dynamic> map) {
    return SprintTaskModel(
      id: _toInt(map['id']),
      sprintsTasksId: _toInt(map['sprints_tasks_id']),
      clientId: map['client_id'] as String?,
      sprintsId: _toInt(map['sprints_id']),
      projectsId: _toInt(map['projects_id']),
      teamsId: _toInt(map['teams_id']),
      description: map['description'] as String?,
      sprintsTasksStatusesId: _toInt(map['sprints_tasks_statuses_id']),
      subtasksId: _toInt(map['subtasks_id']),
      unityId: _toInt(map['unity_id']),
      unity: map['unity'] as String?,
      quantityDone: _toDouble(map['quantity_done']),
      check: _toBool(map['check_field']),
      sucesso: _toBool(map['sucesso'], defaultValue: true),
      inspection: _toBool(map['inspection']),
      canConclude: _toBool(map['can_conclude']),
      comment: map['comment'] as String?,
      firstComment: _toBool(map['first_comment']),
      checkTasks: _toBool(map['check_tasks']),
      equipamentsTypesId: _toInt(map['equipaments_types_id']),
      projectsBacklogsJson: map['projects_backlogs_json'] as String?,
      subtasksJson: map['subtasks_json'] as String?,
      updatedAt: _toInt(map['updated_at']),
      createdAt: _toInt(map['created_at']),
      syncedAt: _toInt(map['synced_at']),
    );
  }

  SprintTaskModel copyWith({
    int? id,
    int? sprintsTasksId,
    String? clientId,
    int? sprintsId,
    int? projectsId,
    int? teamsId,
    String? description,
    int? sprintsTasksStatusesId,
    int? subtasksId,
    int? unityId,
    String? unity,
    double? quantityDone,
    bool? check,
    bool? sucesso,
    bool? inspection,
    bool? canConclude,
    String? comment,
    bool? firstComment,
    bool? checkTasks,
    int? equipamentsTypesId,
    String? projectsBacklogsJson,
    String? subtasksJson,
    int? updatedAt,
    int? createdAt,
    int? syncedAt,
  }) {
    return SprintTaskModel(
      id: id ?? this.id,
      sprintsTasksId: sprintsTasksId ?? this.sprintsTasksId,
      clientId: clientId ?? this.clientId,
      sprintsId: sprintsId ?? this.sprintsId,
      projectsId: projectsId ?? this.projectsId,
      teamsId: teamsId ?? this.teamsId,
      description: description ?? this.description,
      sprintsTasksStatusesId: sprintsTasksStatusesId ?? this.sprintsTasksStatusesId,
      subtasksId: subtasksId ?? this.subtasksId,
      unityId: unityId ?? this.unityId,
      unity: unity ?? this.unity,
      quantityDone: quantityDone ?? this.quantityDone,
      check: check ?? this.check,
      sucesso: sucesso ?? this.sucesso,
      inspection: inspection ?? this.inspection,
      canConclude: canConclude ?? this.canConclude,
      comment: comment ?? this.comment,
      firstComment: firstComment ?? this.firstComment,
      checkTasks: checkTasks ?? this.checkTasks,
      equipamentsTypesId: equipamentsTypesId ?? this.equipamentsTypesId,
      projectsBacklogsJson: projectsBacklogsJson ?? this.projectsBacklogsJson,
      subtasksJson: subtasksJson ?? this.subtasksJson,
      updatedAt: updatedAt ?? this.updatedAt,
      createdAt: createdAt ?? this.createdAt,
      syncedAt: syncedAt ?? this.syncedAt,
    );
  }
}
