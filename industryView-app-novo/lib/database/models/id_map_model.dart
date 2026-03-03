class IdMapModel {
  final int? id;
  final String entityType;
  final String clientId;
  final String serverId;
  final int createdAt;

  IdMapModel({
    this.id,
    required this.entityType,
    required this.clientId,
    required this.serverId,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'entity_type': entityType,
      'client_id': clientId,
      'server_id': serverId,
      'created_at': createdAt,
    };
  }

  /// Converte qualquer tipo numérico ou String para int? de forma segura.
  /// Necessário pois o SQLite pode retornar campos como String em alguns drivers.
  static int? _toInt(dynamic v) {
    if (v == null) return null;
    if (v is int) return v;
    if (v is double) return v.toInt();
    if (v is String) return int.tryParse(v) ?? double.tryParse(v)?.toInt();
    return null;
  }

  factory IdMapModel.fromMap(Map<String, dynamic> map) {
    return IdMapModel(
      id: _toInt(map['id']),
      entityType: map['entity_type'] as String,
      clientId: map['client_id'] as String,
      serverId: map['server_id'] as String,
      // createdAt é obrigatório — SQLite sempre retorna int aqui, mas protegemos assim mesmo
      createdAt: _toInt(map['created_at']) ?? 0,
    );
  }
}
