class ScheduleModel {
  final int? id;
  final int? scheduleId;
  final String? clientId;
  final int? teamsId;
  final int? projectsId;
  final int? sprintsId;
  final String? scheduleDate;
  final String? usersId; // JSON array
  final String? sprintsTasksId; // JSON array
  final int? updatedAt;
  final int? createdAt;
  final int? syncedAt;

  ScheduleModel({
    this.id,
    this.scheduleId,
    this.clientId,
    this.teamsId,
    this.projectsId,
    this.sprintsId,
    this.scheduleDate,
    this.usersId,
    this.sprintsTasksId,
    this.updatedAt,
    this.createdAt,
    this.syncedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'schedule_id': scheduleId,
      'client_id': clientId,
      'teams_id': teamsId,
      'projects_id': projectsId,
      'sprints_id': sprintsId,
      'schedule_date': scheduleDate,
      'users_id': usersId,
      'sprints_tasks_id': sprintsTasksId,
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

  factory ScheduleModel.fromMap(Map<String, dynamic> map) {
    return ScheduleModel(
      id: _toInt(map['id']),
      scheduleId: _toInt(map['schedule_id']),
      clientId: map['client_id'] as String?,
      teamsId: _toInt(map['teams_id']),
      projectsId: _toInt(map['projects_id']),
      sprintsId: _toInt(map['sprints_id']),
      scheduleDate: map['schedule_date'] as String?,
      usersId: map['users_id'] as String?,
      sprintsTasksId: map['sprints_tasks_id'] as String?,
      updatedAt: _toInt(map['updated_at']),
      createdAt: _toInt(map['created_at']),
      syncedAt: _toInt(map['synced_at']),
    );
  }

  ScheduleModel copyWith({
    int? id,
    int? scheduleId,
    String? clientId,
    int? teamsId,
    int? projectsId,
    int? sprintsId,
    String? scheduleDate,
    String? usersId,
    String? sprintsTasksId,
    int? updatedAt,
    int? createdAt,
    int? syncedAt,
  }) {
    return ScheduleModel(
      id: id ?? this.id,
      scheduleId: scheduleId ?? this.scheduleId,
      clientId: clientId ?? this.clientId,
      teamsId: teamsId ?? this.teamsId,
      projectsId: projectsId ?? this.projectsId,
      sprintsId: sprintsId ?? this.sprintsId,
      scheduleDate: scheduleDate ?? this.scheduleDate,
      usersId: usersId ?? this.usersId,
      sprintsTasksId: sprintsTasksId ?? this.sprintsTasksId,
      updatedAt: updatedAt ?? this.updatedAt,
      createdAt: createdAt ?? this.createdAt,
      syncedAt: syncedAt ?? this.syncedAt,
    );
  }
}
