class EquipamentsTypeModel {
  final int? id;
  final int? equipamentsTypeId;
  final String? type;
  final int? updatedAt;
  final int? createdAt;
  final int? syncedAt;

  EquipamentsTypeModel({
    this.id,
    this.equipamentsTypeId,
    this.type,
    this.updatedAt,
    this.createdAt,
    this.syncedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'equipaments_type_id': equipamentsTypeId,
      'type': type,
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

  factory EquipamentsTypeModel.fromMap(Map<String, dynamic> map) {
    return EquipamentsTypeModel(
      id: _toInt(map['id']),
      equipamentsTypeId: _toInt(map['equipaments_type_id']),
      type: map['type'] as String?,
      updatedAt: _toInt(map['updated_at']),
      createdAt: _toInt(map['created_at']),
      syncedAt: _toInt(map['synced_at']),
    );
  }

  EquipamentsTypeModel copyWith({
    int? id,
    int? equipamentsTypeId,
    String? type,
    int? updatedAt,
    int? createdAt,
    int? syncedAt,
  }) {
    return EquipamentsTypeModel(
      id: id ?? this.id,
      equipamentsTypeId: equipamentsTypeId ?? this.equipamentsTypeId,
      type: type ?? this.type,
      updatedAt: updatedAt ?? this.updatedAt,
      createdAt: createdAt ?? this.createdAt,
      syncedAt: syncedAt ?? this.syncedAt,
    );
  }
}
