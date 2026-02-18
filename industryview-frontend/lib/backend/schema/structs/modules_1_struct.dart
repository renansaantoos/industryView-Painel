// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class Modules1Struct extends BaseStruct {
  Modules1Struct({
    int? itemsReceived,
    int? curPage,
    int? nextPage,
    int? prevPage,
    int? offset,
    int? perPage,
    int? itemsTotal,
    int? pageTotal,
    List<Modules2Struct>? items,
  })  : _itemsReceived = itemsReceived,
        _curPage = curPage,
        _nextPage = nextPage,
        _prevPage = prevPage,
        _offset = offset,
        _perPage = perPage,
        _itemsTotal = itemsTotal,
        _pageTotal = pageTotal,
        _items = items;

  // "itemsReceived" field.
  int? _itemsReceived;
  int get itemsReceived => _itemsReceived ?? 0;
  set itemsReceived(int? val) => _itemsReceived = val;

  void incrementItemsReceived(int amount) =>
      itemsReceived = itemsReceived + amount;

  bool hasItemsReceived() => _itemsReceived != null;

  // "curPage" field.
  int? _curPage;
  int get curPage => _curPage ?? 0;
  set curPage(int? val) => _curPage = val;

  void incrementCurPage(int amount) => curPage = curPage + amount;

  bool hasCurPage() => _curPage != null;

  // "nextPage" field.
  int? _nextPage;
  int get nextPage => _nextPage ?? 0;
  set nextPage(int? val) => _nextPage = val;

  void incrementNextPage(int amount) => nextPage = nextPage + amount;

  bool hasNextPage() => _nextPage != null;

  // "prevPage" field.
  int? _prevPage;
  int get prevPage => _prevPage ?? 0;
  set prevPage(int? val) => _prevPage = val;

  void incrementPrevPage(int amount) => prevPage = prevPage + amount;

  bool hasPrevPage() => _prevPage != null;

  // "offset" field.
  int? _offset;
  int get offset => _offset ?? 0;
  set offset(int? val) => _offset = val;

  void incrementOffset(int amount) => offset = offset + amount;

  bool hasOffset() => _offset != null;

  // "perPage" field.
  int? _perPage;
  int get perPage => _perPage ?? 0;
  set perPage(int? val) => _perPage = val;

  void incrementPerPage(int amount) => perPage = perPage + amount;

  bool hasPerPage() => _perPage != null;

  // "itemsTotal" field.
  int? _itemsTotal;
  int get itemsTotal => _itemsTotal ?? 0;
  set itemsTotal(int? val) => _itemsTotal = val;

  void incrementItemsTotal(int amount) => itemsTotal = itemsTotal + amount;

  bool hasItemsTotal() => _itemsTotal != null;

  // "pageTotal" field.
  int? _pageTotal;
  int get pageTotal => _pageTotal ?? 0;
  set pageTotal(int? val) => _pageTotal = val;

  void incrementPageTotal(int amount) => pageTotal = pageTotal + amount;

  bool hasPageTotal() => _pageTotal != null;

  // "items" field.
  List<Modules2Struct>? _items;
  List<Modules2Struct> get items => _items ?? const [];
  set items(List<Modules2Struct>? val) => _items = val;

  void updateItems(Function(List<Modules2Struct>) updateFn) {
    updateFn(_items ??= []);
  }

  bool hasItems() => _items != null;

  static Modules1Struct fromMap(Map<String, dynamic> data) => Modules1Struct(
        itemsReceived: castToType<int>(data['itemsReceived']),
        curPage: castToType<int>(data['curPage']),
        nextPage: castToType<int>(data['nextPage']),
        prevPage: castToType<int>(data['prevPage']),
        offset: castToType<int>(data['offset']),
        perPage: castToType<int>(data['perPage']),
        itemsTotal: castToType<int>(data['itemsTotal']),
        pageTotal: castToType<int>(data['pageTotal']),
        items: getStructList(
          data['items'],
          Modules2Struct.fromMap,
        ),
      );

  static Modules1Struct? maybeFromMap(dynamic data) =>
      data is Map ? Modules1Struct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'itemsReceived': _itemsReceived,
        'curPage': _curPage,
        'nextPage': _nextPage,
        'prevPage': _prevPage,
        'offset': _offset,
        'perPage': _perPage,
        'itemsTotal': _itemsTotal,
        'pageTotal': _pageTotal,
        'items': _items?.map((e) => e.toMap()).toList(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'itemsReceived': serializeParam(
          _itemsReceived,
          ParamType.int,
        ),
        'curPage': serializeParam(
          _curPage,
          ParamType.int,
        ),
        'nextPage': serializeParam(
          _nextPage,
          ParamType.int,
        ),
        'prevPage': serializeParam(
          _prevPage,
          ParamType.int,
        ),
        'offset': serializeParam(
          _offset,
          ParamType.int,
        ),
        'perPage': serializeParam(
          _perPage,
          ParamType.int,
        ),
        'itemsTotal': serializeParam(
          _itemsTotal,
          ParamType.int,
        ),
        'pageTotal': serializeParam(
          _pageTotal,
          ParamType.int,
        ),
        'items': serializeParam(
          _items,
          ParamType.DataStruct,
          isList: true,
        ),
      }.withoutNulls;

  static Modules1Struct fromSerializableMap(Map<String, dynamic> data) =>
      Modules1Struct(
        itemsReceived: deserializeParam(
          data['itemsReceived'],
          ParamType.int,
          false,
        ),
        curPage: deserializeParam(
          data['curPage'],
          ParamType.int,
          false,
        ),
        nextPage: deserializeParam(
          data['nextPage'],
          ParamType.int,
          false,
        ),
        prevPage: deserializeParam(
          data['prevPage'],
          ParamType.int,
          false,
        ),
        offset: deserializeParam(
          data['offset'],
          ParamType.int,
          false,
        ),
        perPage: deserializeParam(
          data['perPage'],
          ParamType.int,
          false,
        ),
        itemsTotal: deserializeParam(
          data['itemsTotal'],
          ParamType.int,
          false,
        ),
        pageTotal: deserializeParam(
          data['pageTotal'],
          ParamType.int,
          false,
        ),
        items: deserializeStructParam<Modules2Struct>(
          data['items'],
          ParamType.DataStruct,
          true,
          structBuilder: Modules2Struct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'Modules1Struct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is Modules1Struct &&
        itemsReceived == other.itemsReceived &&
        curPage == other.curPage &&
        nextPage == other.nextPage &&
        prevPage == other.prevPage &&
        offset == other.offset &&
        perPage == other.perPage &&
        itemsTotal == other.itemsTotal &&
        pageTotal == other.pageTotal &&
        listEquality.equals(items, other.items);
  }

  @override
  int get hashCode => const ListEquality().hash([
        itemsReceived,
        curPage,
        nextPage,
        prevPage,
        offset,
        perPage,
        itemsTotal,
        pageTotal,
        items
      ]);
}

Modules1Struct createModules1Struct({
  int? itemsReceived,
  int? curPage,
  int? nextPage,
  int? prevPage,
  int? offset,
  int? perPage,
  int? itemsTotal,
  int? pageTotal,
}) =>
    Modules1Struct(
      itemsReceived: itemsReceived,
      curPage: curPage,
      nextPage: nextPage,
      prevPage: prevPage,
      offset: offset,
      perPage: perPage,
      itemsTotal: itemsTotal,
      pageTotal: pageTotal,
    );
