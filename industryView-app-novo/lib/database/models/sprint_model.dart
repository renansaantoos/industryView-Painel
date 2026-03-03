class SprintModel {
  final int? id;
  final int? sprintId;
  final String? clientId;
  final String? title;
  final String? objective;
  final int? startDate;
  final int? endDate;
  final double? progressPercentage;
  final int? tasksConcluidas;
  final int? tasksAndamento;
  final int? projectsId;
  final int? sprintsStatusesId;
  final int? updatedAt;
  final int? createdAt;
  final int? syncedAt;

  SprintModel({
    this.id,
    this.sprintId,
    this.clientId,
    this.title,
    this.objective,
    this.startDate,
    this.endDate,
    this.progressPercentage,
    this.tasksConcluidas,
    this.tasksAndamento,
    this.projectsId,
    this.sprintsStatusesId,
    this.updatedAt,
    this.createdAt,
    this.syncedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'sprint_id': sprintId,
      'client_id': clientId,
      'title': title,
      'objective': objective,
      'start_date': startDate,
      'end_date': endDate,
      'progress_percentage': progressPercentage,
      'tasks_concluidas': tasksConcluidas,
      'tasks_andamento': tasksAndamento,
      'projects_id': projectsId,
      'sprints_statuses_id': sprintsStatusesId,
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

  factory SprintModel.fromMap(Map<String, dynamic> map) {
    return SprintModel(
      id: _toInt(map['id']),
      sprintId: _toInt(map['sprint_id']),
      clientId: map['client_id'] as String?,
      title: map['title'] as String?,
      objective: map['objective'] as String?,
      startDate: _toInt(map['start_date']),
      endDate: _toInt(map['end_date']),
      progressPercentage: _toDouble(map['progress_percentage']),
      tasksConcluidas: _toInt(map['tasks_concluidas']),
      tasksAndamento: _toInt(map['tasks_andamento']),
      projectsId: _toInt(map['projects_id']),
      sprintsStatusesId: _toInt(map['sprints_statuses_id']),
      updatedAt: _toInt(map['updated_at']),
      createdAt: _toInt(map['created_at']),
      syncedAt: _toInt(map['synced_at']),
    );
  }

  SprintModel copyWith({
    int? id,
    int? sprintId,
    String? clientId,
    String? title,
    String? objective,
    int? startDate,
    int? endDate,
    double? progressPercentage,
    int? tasksConcluidas,
    int? tasksAndamento,
    int? projectsId,
    int? sprintsStatusesId,
    int? updatedAt,
    int? createdAt,
    int? syncedAt,
  }) {
    return SprintModel(
      id: id ?? this.id,
      sprintId: sprintId ?? this.sprintId,
      clientId: clientId ?? this.clientId,
      title: title ?? this.title,
      objective: objective ?? this.objective,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      progressPercentage: progressPercentage ?? this.progressPercentage,
      tasksConcluidas: tasksConcluidas ?? this.tasksConcluidas,
      tasksAndamento: tasksAndamento ?? this.tasksAndamento,
      projectsId: projectsId ?? this.projectsId,
      sprintsStatusesId: sprintsStatusesId ?? this.sprintsStatusesId,
      updatedAt: updatedAt ?? this.updatedAt,
      createdAt: createdAt ?? this.createdAt,
      syncedAt: syncedAt ?? this.syncedAt,
    );
  }
}
