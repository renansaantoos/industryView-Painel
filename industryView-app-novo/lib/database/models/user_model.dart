class UserModel {
  final int? id;
  final int? userId;
  final String? name;
  final String? email;
  final String? phone;
  final String? image;
  final int? teamsId;
  final int? projectId;
  final int? companyId;
  final int? updatedAt;
  final int? createdAt;
  final int? syncedAt;

  UserModel({
    this.id,
    this.userId,
    this.name,
    this.email,
    this.phone,
    this.image,
    this.teamsId,
    this.projectId,
    this.companyId,
    this.updatedAt,
    this.createdAt,
    this.syncedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user_id': userId,
      'name': name,
      'email': email,
      'phone': phone,
      'image': image,
      'teams_id': teamsId,
      'project_id': projectId,
      'company_id': companyId,
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

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: _toInt(map['id']),
      userId: _toInt(map['user_id']),
      name: map['name'] as String?,
      email: map['email'] as String?,
      phone: map['phone'] as String?,
      image: map['image'] as String?,
      teamsId: _toInt(map['teams_id']),
      projectId: _toInt(map['project_id']),
      companyId: _toInt(map['company_id']),
      updatedAt: _toInt(map['updated_at']),
      createdAt: _toInt(map['created_at']),
      syncedAt: _toInt(map['synced_at']),
    );
  }

  UserModel copyWith({
    int? id,
    int? userId,
    String? name,
    String? email,
    String? phone,
    String? image,
    int? teamsId,
    int? projectId,
    int? companyId,
    int? updatedAt,
    int? createdAt,
    int? syncedAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      image: image ?? this.image,
      teamsId: teamsId ?? this.teamsId,
      projectId: projectId ?? this.projectId,
      companyId: companyId ?? this.companyId,
      updatedAt: updatedAt ?? this.updatedAt,
      createdAt: createdAt ?? this.createdAt,
      syncedAt: syncedAt ?? this.syncedAt,
    );
  }
}
