class SyncConflictModel {
  final int? id;
  final String operationId;
  final String entityType;
  final String? entityId;
  final String operationType;
  final String localPayload;
  final String? serverPayload;
  final String? localVersion;
  final String? serverVersion;
  final String status;
  final int createdAt;
  final int? resolvedAt;
  final String? resolution;
  final String? errorMessage;

  SyncConflictModel({
    this.id,
    required this.operationId,
    required this.entityType,
    this.entityId,
    required this.operationType,
    required this.localPayload,
    this.serverPayload,
    this.localVersion,
    this.serverVersion,
    this.status = 'pending',
    required this.createdAt,
    this.resolvedAt,
    this.resolution,
    this.errorMessage,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'operation_id': operationId,
      'entity_type': entityType,
      'entity_id': entityId,
      'operation_type': operationType,
      'local_payload': localPayload,
      'server_payload': serverPayload,
      'local_version': localVersion,
      'server_version': serverVersion,
      'status': status,
      'created_at': createdAt,
      'resolved_at': resolvedAt,
      'resolution': resolution,
      'error_message': errorMessage,
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

  factory SyncConflictModel.fromMap(Map<String, dynamic> map) {
    return SyncConflictModel(
      id: _toInt(map['id']),
      operationId: map['operation_id'] as String,
      entityType: map['entity_type'] as String,
      entityId: map['entity_id']?.toString(),
      operationType: map['operation_type'] as String,
      localPayload: map['local_payload'] as String,
      serverPayload: map['server_payload'] as String?,
      localVersion: map['local_version']?.toString(),
      serverVersion: map['server_version']?.toString(),
      status: map['status'] as String? ?? 'pending',
      // createdAt é obrigatório — SQLite sempre retorna int aqui, mas protegemos assim mesmo
      createdAt: _toInt(map['created_at']) ?? 0,
      resolvedAt: _toInt(map['resolved_at']),
      resolution: map['resolution'] as String?,
      errorMessage: map['error_message'] as String?,
    );
  }

  SyncConflictModel copyWith({
    int? id,
    String? operationId,
    String? entityType,
    String? entityId,
    String? operationType,
    String? localPayload,
    String? serverPayload,
    String? localVersion,
    String? serverVersion,
    String? status,
    int? createdAt,
    int? resolvedAt,
    String? resolution,
    String? errorMessage,
  }) {
    return SyncConflictModel(
      id: id ?? this.id,
      operationId: operationId ?? this.operationId,
      entityType: entityType ?? this.entityType,
      entityId: entityId ?? this.entityId,
      operationType: operationType ?? this.operationType,
      localPayload: localPayload ?? this.localPayload,
      serverPayload: serverPayload ?? this.serverPayload,
      localVersion: localVersion ?? this.localVersion,
      serverVersion: serverVersion ?? this.serverVersion,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      resolvedAt: resolvedAt ?? this.resolvedAt,
      resolution: resolution ?? this.resolution,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}
