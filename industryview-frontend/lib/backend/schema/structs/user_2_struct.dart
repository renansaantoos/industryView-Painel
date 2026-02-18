// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class User2Struct extends BaseStruct {
  User2Struct({
    int? id,
    String? name,
    User3Struct? profilePicture,
    User4Struct? usersPermissions,
    bool? mostra,
  })  : _id = id,
        _name = name,
        _profilePicture = profilePicture,
        _usersPermissions = usersPermissions,
        _mostra = mostra;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "name" field.
  String? _name;
  String get name => _name ?? '-';
  set name(String? val) => _name = val;

  bool hasName() => _name != null;

  // "profile_picture" field.
  User3Struct? _profilePicture;
  User3Struct get profilePicture => _profilePicture ?? User3Struct();
  set profilePicture(User3Struct? val) => _profilePicture = val;

  void updateProfilePicture(Function(User3Struct) updateFn) {
    updateFn(_profilePicture ??= User3Struct());
  }

  bool hasProfilePicture() => _profilePicture != null;

  // "users_permissions" field.
  User4Struct? _usersPermissions;
  User4Struct get usersPermissions => _usersPermissions ?? User4Struct();
  set usersPermissions(User4Struct? val) => _usersPermissions = val;

  void updateUsersPermissions(Function(User4Struct) updateFn) {
    updateFn(_usersPermissions ??= User4Struct());
  }

  bool hasUsersPermissions() => _usersPermissions != null;

  // "mostra" field.
  bool? _mostra;
  bool get mostra => _mostra ?? false;
  set mostra(bool? val) => _mostra = val;

  bool hasMostra() => _mostra != null;

  static User2Struct fromMap(Map<String, dynamic> data) => User2Struct(
        id: castToType<int>(data['id']),
        name: data['name'] as String?,
        profilePicture: data['profile_picture'] is User3Struct
            ? data['profile_picture']
            : User3Struct.maybeFromMap(data['profile_picture']),
        usersPermissions: data['users_permissions'] is User4Struct
            ? data['users_permissions']
            : User4Struct.maybeFromMap(data['users_permissions']),
        mostra: data['mostra'] as bool?,
      );

  static User2Struct? maybeFromMap(dynamic data) =>
      data is Map ? User2Struct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'name': _name,
        'profile_picture': _profilePicture?.toMap(),
        'users_permissions': _usersPermissions?.toMap(),
        'mostra': _mostra,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'name': serializeParam(
          _name,
          ParamType.String,
        ),
        'profile_picture': serializeParam(
          _profilePicture,
          ParamType.DataStruct,
        ),
        'users_permissions': serializeParam(
          _usersPermissions,
          ParamType.DataStruct,
        ),
        'mostra': serializeParam(
          _mostra,
          ParamType.bool,
        ),
      }.withoutNulls;

  static User2Struct fromSerializableMap(Map<String, dynamic> data) =>
      User2Struct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        name: deserializeParam(
          data['name'],
          ParamType.String,
          false,
        ),
        profilePicture: deserializeStructParam(
          data['profile_picture'],
          ParamType.DataStruct,
          false,
          structBuilder: User3Struct.fromSerializableMap,
        ),
        usersPermissions: deserializeStructParam(
          data['users_permissions'],
          ParamType.DataStruct,
          false,
          structBuilder: User4Struct.fromSerializableMap,
        ),
        mostra: deserializeParam(
          data['mostra'],
          ParamType.bool,
          false,
        ),
      );

  @override
  String toString() => 'User2Struct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is User2Struct &&
        id == other.id &&
        name == other.name &&
        profilePicture == other.profilePicture &&
        usersPermissions == other.usersPermissions &&
        mostra == other.mostra;
  }

  @override
  int get hashCode => const ListEquality()
      .hash([id, name, profilePicture, usersPermissions, mostra]);
}

User2Struct createUser2Struct({
  int? id,
  String? name,
  User3Struct? profilePicture,
  User4Struct? usersPermissions,
  bool? mostra,
}) =>
    User2Struct(
      id: id,
      name: name,
      profilePicture: profilePicture ?? User3Struct(),
      usersPermissions: usersPermissions ?? User4Struct(),
      mostra: mostra,
    );
