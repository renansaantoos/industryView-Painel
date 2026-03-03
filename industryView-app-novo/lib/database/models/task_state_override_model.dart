class TaskStateOverrideModel {
  final int sprintsTasksId;
  final String statusGroup;
  final int? inspection;
  final int? sucesso;
  final int? checkField;
  final int? checkTasks;
  final int? updatedAt;

  TaskStateOverrideModel({
    required this.sprintsTasksId,
    required this.statusGroup,
    this.inspection,
    this.sucesso,
    this.checkField,
    this.checkTasks,
    this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'sprints_tasks_id': sprintsTasksId,
      'status_group': statusGroup,
      'inspection': inspection,
      'sucesso': sucesso,
      'check_field': checkField,
      'check_tasks': checkTasks,
      'updated_at': updatedAt,
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

  factory TaskStateOverrideModel.fromMap(Map<String, dynamic> map) {
    return TaskStateOverrideModel(
      // sprintsTasksId é obrigatório — usa 0 como fallback em vez de lançar exceção
      sprintsTasksId: _toInt(map['sprints_tasks_id']) ?? 0,
      statusGroup: map['status_group'] as String,
      inspection: _toInt(map['inspection']),
      sucesso: _toInt(map['sucesso']),
      checkField: _toInt(map['check_field']),
      checkTasks: _toInt(map['check_tasks']),
      updatedAt: _toInt(map['updated_at']),
    );
  }
}
