class SyncMetadataModel {
  final int? id;
  final String entityType;
  final int? lastSyncAt;
  final String? lastSyncStatus;
  final int? syncVersion;

  SyncMetadataModel({
    this.id,
    required this.entityType,
    this.lastSyncAt,
    this.lastSyncStatus,
    this.syncVersion,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'entity_type': entityType,
      'last_sync_at': lastSyncAt,
      'last_sync_status': lastSyncStatus,
      'sync_version': syncVersion,
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

  factory SyncMetadataModel.fromMap(Map<String, dynamic> map) {
    return SyncMetadataModel(
      id: _toInt(map['id']),
      entityType: map['entity_type'] as String,
      lastSyncAt: _toInt(map['last_sync_at']),
      lastSyncStatus: map['last_sync_status'] as String?,
      syncVersion: _toInt(map['sync_version']),
    );
  }

  SyncMetadataModel copyWith({
    int? id,
    String? entityType,
    int? lastSyncAt,
    String? lastSyncStatus,
    int? syncVersion,
  }) {
    return SyncMetadataModel(
      id: id ?? this.id,
      entityType: entityType ?? this.entityType,
      lastSyncAt: lastSyncAt ?? this.lastSyncAt,
      lastSyncStatus: lastSyncStatus ?? this.lastSyncStatus,
      syncVersion: syncVersion ?? this.syncVersion,
    );
  }
}
