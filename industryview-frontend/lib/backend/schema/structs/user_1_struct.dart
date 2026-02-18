// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class User1Struct extends BaseStruct {
  User1Struct({
    List<User2Struct>? items,
  }) : _items = items;

  // "items" field.
  List<User2Struct>? _items;
  List<User2Struct> get items => _items ?? const [];
  set items(List<User2Struct>? val) => _items = val;

  void updateItems(Function(List<User2Struct>) updateFn) {
    updateFn(_items ??= []);
  }

  bool hasItems() => _items != null;

  static User1Struct fromMap(Map<String, dynamic> data) => User1Struct(
        items: getStructList(
          data['items'],
          User2Struct.fromMap,
        ),
      );

  static User1Struct? maybeFromMap(dynamic data) =>
      data is Map ? User1Struct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'items': _items?.map((e) => e.toMap()).toList(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'items': serializeParam(
          _items,
          ParamType.DataStruct,
          isList: true,
        ),
      }.withoutNulls;

  static User1Struct fromSerializableMap(Map<String, dynamic> data) =>
      User1Struct(
        items: deserializeStructParam<User2Struct>(
          data['items'],
          ParamType.DataStruct,
          true,
          structBuilder: User2Struct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'User1Struct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is User1Struct && listEquality.equals(items, other.items);
  }

  @override
  int get hashCode => const ListEquality().hash([items]);
}

User1Struct createUser1Struct() => User1Struct();
