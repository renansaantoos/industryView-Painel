class ApiCacheModel {
  final String cacheKey;
  final String responseJson;
  final int? updatedAt;

  ApiCacheModel({
    required this.cacheKey,
    required this.responseJson,
    this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'cache_key': cacheKey,
      'response_json': responseJson,
      'updated_at': updatedAt,
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

  factory ApiCacheModel.fromMap(Map<String, dynamic> map) {
    return ApiCacheModel(
      cacheKey: map['cache_key'] as String,
      responseJson: map['response_json'] as String,
      updatedAt: _toInt(map['updated_at']),
    );
  }

  ApiCacheModel copyWith({
    String? cacheKey,
    String? responseJson,
    int? updatedAt,
  }) {
    return ApiCacheModel(
      cacheKey: cacheKey ?? this.cacheKey,
      responseJson: responseJson ?? this.responseJson,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
