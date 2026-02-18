// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class UserLider1Struct extends BaseStruct {
  UserLider1Struct({
    List<ItemsStruct>? items,
  }) : _items = items;

  // "items" field.
  List<ItemsStruct>? _items;
  List<ItemsStruct> get items => _items ?? const [];
  set items(List<ItemsStruct>? val) => _items = val;

  void updateItems(Function(List<ItemsStruct>) updateFn) {
    updateFn(_items ??= []);
  }

  bool hasItems() => _items != null;

  static UserLider1Struct fromMap(Map<String, dynamic> data) =>
      UserLider1Struct(
        items: getStructList(
          data['items'],
          ItemsStruct.fromMap,
        ),
      );

  static UserLider1Struct? maybeFromMap(dynamic data) => data is Map
      ? UserLider1Struct.fromMap(data.cast<String, dynamic>())
      : null;

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

  static UserLider1Struct fromSerializableMap(Map<String, dynamic> data) =>
      UserLider1Struct(
        items: deserializeStructParam<ItemsStruct>(
          data['items'],
          ParamType.DataStruct,
          true,
          structBuilder: ItemsStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'UserLider1Struct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is UserLider1Struct && listEquality.equals(items, other.items);
  }

  @override
  int get hashCode => const ListEquality().hash([items]);
}

UserLider1Struct createUserLider1Struct() => UserLider1Struct();
