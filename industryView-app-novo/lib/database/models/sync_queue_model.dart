enum SyncOperationType {
  create,
  update,
  delete,
}

enum SyncStatus {
  pending,
  syncing,
  completed,
  failed,
  conflict,
}

class SyncQueueModel {
  final int? id;
  final String operationId;
  final SyncOperationType operationType;
  final String entityType;
  final int? entityId;
  final String data;
  final SyncStatus status;
  final int retryCount;
  final String? errorMessage;
  final int createdAt;
  final int? updatedAt;
  final int? lastAttemptAt;
  final int? nextAttemptAt;
  final int? lastErrorCode;
  final String? lastErrorMessage;

  SyncQueueModel({
    this.id,
    required this.operationId,
    required this.operationType,
    required this.entityType,
    this.entityId,
    required this.data,
    this.status = SyncStatus.pending,
    this.retryCount = 0,
    this.errorMessage,
    required this.createdAt,
    this.updatedAt,
    this.lastAttemptAt,
    this.nextAttemptAt,
    this.lastErrorCode,
    this.lastErrorMessage,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'operation_id': operationId,
      'operation_type': operationType.name,
      'entity_type': entityType,
      'entity_id': entityId,
      'data': data,
      'status': status.name,
      'retry_count': retryCount,
      'error_message': errorMessage,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'last_attempt_at': lastAttemptAt,
      'next_attempt_at': nextAttemptAt,
      'last_error_code': lastErrorCode,
      'last_error_message': lastErrorMessage,
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

  factory SyncQueueModel.fromMap(Map<String, dynamic> map) {
    final fallbackOperationId = 'legacy-${map['id'] ?? 'na'}-${map['created_at'] ?? 'na'}';
    return SyncQueueModel(
      id: _toInt(map['id']),
      operationId: map['operation_id'] as String? ?? fallbackOperationId,
      operationType: SyncOperationType.values.firstWhere(
        (e) => e.name == map['operation_type'],
        orElse: () => SyncOperationType.create,
      ),
      entityType: map['entity_type'] as String,
      entityId: _toInt(map['entity_id']),
      data: map['data'] as String,
      status: SyncStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => SyncStatus.pending,
      ),
      retryCount: _toInt(map['retry_count']) ?? 0,
      errorMessage: map['error_message'] as String?,
      // createdAt é obrigatório — SQLite sempre retorna int aqui, mas protegemos assim mesmo
      createdAt: _toInt(map['created_at']) ?? 0,
      updatedAt: _toInt(map['updated_at']),
      lastAttemptAt: _toInt(map['last_attempt_at']),
      nextAttemptAt: _toInt(map['next_attempt_at']),
      lastErrorCode: _toInt(map['last_error_code']),
      lastErrorMessage: map['last_error_message'] as String?,
    );
  }

  SyncQueueModel copyWith({
    int? id,
    String? operationId,
    SyncOperationType? operationType,
    String? entityType,
    int? entityId,
    String? data,
    SyncStatus? status,
    int? retryCount,
    String? errorMessage,
    int? createdAt,
    int? updatedAt,
    int? lastAttemptAt,
    int? nextAttemptAt,
    int? lastErrorCode,
    String? lastErrorMessage,
  }) {
    return SyncQueueModel(
      id: id ?? this.id,
      operationId: operationId ?? this.operationId,
      operationType: operationType ?? this.operationType,
      entityType: entityType ?? this.entityType,
      entityId: entityId ?? this.entityId,
      data: data ?? this.data,
      status: status ?? this.status,
      retryCount: retryCount ?? this.retryCount,
      errorMessage: errorMessage ?? this.errorMessage,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      lastAttemptAt: lastAttemptAt ?? this.lastAttemptAt,
      nextAttemptAt: nextAttemptAt ?? this.nextAttemptAt,
      lastErrorCode: lastErrorCode ?? this.lastErrorCode,
      lastErrorMessage: lastErrorMessage ?? this.lastErrorMessage,
    );
  }
}
