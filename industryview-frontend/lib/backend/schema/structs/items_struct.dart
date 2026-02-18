// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class ItemsStruct extends BaseStruct {
  ItemsStruct({
    int? id,
    int? usersId,
    int? teamsId,
    User2Struct? user,
  })  : _id = id,
        _usersId = usersId,
        _teamsId = teamsId,
        _user = user;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "users_id" field.
  int? _usersId;
  int get usersId => _usersId ?? 0;
  set usersId(int? val) => _usersId = val;

  void incrementUsersId(int amount) => usersId = usersId + amount;

  bool hasUsersId() => _usersId != null;

  // "teams_id" field.
  int? _teamsId;
  int get teamsId => _teamsId ?? 0;
  set teamsId(int? val) => _teamsId = val;

  void incrementTeamsId(int amount) => teamsId = teamsId + amount;

  bool hasTeamsId() => _teamsId != null;

  // "user" field.
  User2Struct? _user;
  User2Struct get user => _user ?? User2Struct();
  set user(User2Struct? val) => _user = val;

  void updateUser(Function(User2Struct) updateFn) {
    updateFn(_user ??= User2Struct());
  }

  bool hasUser() => _user != null;

  static ItemsStruct fromMap(Map<String, dynamic> data) => ItemsStruct(
        id: castToType<int>(data['id']),
        usersId: castToType<int>(data['users_id']),
        teamsId: castToType<int>(data['teams_id']),
        user: data['user'] is User2Struct
            ? data['user']
            : User2Struct.maybeFromMap(data['user']),
      );

  static ItemsStruct? maybeFromMap(dynamic data) =>
      data is Map ? ItemsStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'users_id': _usersId,
        'teams_id': _teamsId,
        'user': _user?.toMap(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'users_id': serializeParam(
          _usersId,
          ParamType.int,
        ),
        'teams_id': serializeParam(
          _teamsId,
          ParamType.int,
        ),
        'user': serializeParam(
          _user,
          ParamType.DataStruct,
        ),
      }.withoutNulls;

  static ItemsStruct fromSerializableMap(Map<String, dynamic> data) =>
      ItemsStruct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        usersId: deserializeParam(
          data['users_id'],
          ParamType.int,
          false,
        ),
        teamsId: deserializeParam(
          data['teams_id'],
          ParamType.int,
          false,
        ),
        user: deserializeStructParam(
          data['user'],
          ParamType.DataStruct,
          false,
          structBuilder: User2Struct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'ItemsStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is ItemsStruct &&
        id == other.id &&
        usersId == other.usersId &&
        teamsId == other.teamsId &&
        user == other.user;
  }

  @override
  int get hashCode => const ListEquality().hash([id, usersId, teamsId, user]);
}

ItemsStruct createItemsStruct({
  int? id,
  int? usersId,
  int? teamsId,
  User2Struct? user,
}) =>
    ItemsStruct(
      id: id,
      usersId: usersId,
      teamsId: teamsId,
      user: user ?? User2Struct(),
    );
