// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class MapTrackersStruct extends BaseStruct {
  MapTrackersStruct({
    int? id,
    int? rowNumber,
    int? sectionsId,
    List<ListRowsTrackersStruct>? listRowsTrackers,
  })  : _id = id,
        _rowNumber = rowNumber,
        _sectionsId = sectionsId,
        _listRowsTrackers = listRowsTrackers;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "row_number" field.
  int? _rowNumber;
  int get rowNumber => _rowNumber ?? 0;
  set rowNumber(int? val) => _rowNumber = val;

  void incrementRowNumber(int amount) => rowNumber = rowNumber + amount;

  bool hasRowNumber() => _rowNumber != null;

  // "sections_id" field.
  int? _sectionsId;
  int get sectionsId => _sectionsId ?? 0;
  set sectionsId(int? val) => _sectionsId = val;

  void incrementSectionsId(int amount) => sectionsId = sectionsId + amount;

  bool hasSectionsId() => _sectionsId != null;

  // "list_rows_trackers" field.
  List<ListRowsTrackersStruct>? _listRowsTrackers;
  List<ListRowsTrackersStruct> get listRowsTrackers =>
      _listRowsTrackers ?? const [];
  set listRowsTrackers(List<ListRowsTrackersStruct>? val) =>
      _listRowsTrackers = val;

  void updateListRowsTrackers(Function(List<ListRowsTrackersStruct>) updateFn) {
    updateFn(_listRowsTrackers ??= []);
  }

  bool hasListRowsTrackers() => _listRowsTrackers != null;

  static MapTrackersStruct fromMap(Map<String, dynamic> data) =>
      MapTrackersStruct(
        id: castToType<int>(data['id']),
        rowNumber: castToType<int>(data['row_number']),
        sectionsId: castToType<int>(data['sections_id']),
        listRowsTrackers: getStructList(
          data['list_rows_trackers'],
          ListRowsTrackersStruct.fromMap,
        ),
      );

  static MapTrackersStruct? maybeFromMap(dynamic data) => data is Map
      ? MapTrackersStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'row_number': _rowNumber,
        'sections_id': _sectionsId,
        'list_rows_trackers': _listRowsTrackers?.map((e) => e.toMap()).toList(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'row_number': serializeParam(
          _rowNumber,
          ParamType.int,
        ),
        'sections_id': serializeParam(
          _sectionsId,
          ParamType.int,
        ),
        'list_rows_trackers': serializeParam(
          _listRowsTrackers,
          ParamType.DataStruct,
          isList: true,
        ),
      }.withoutNulls;

  static MapTrackersStruct fromSerializableMap(Map<String, dynamic> data) =>
      MapTrackersStruct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        rowNumber: deserializeParam(
          data['row_number'],
          ParamType.int,
          false,
        ),
        sectionsId: deserializeParam(
          data['sections_id'],
          ParamType.int,
          false,
        ),
        listRowsTrackers: deserializeStructParam<ListRowsTrackersStruct>(
          data['list_rows_trackers'],
          ParamType.DataStruct,
          true,
          structBuilder: ListRowsTrackersStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'MapTrackersStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is MapTrackersStruct &&
        id == other.id &&
        rowNumber == other.rowNumber &&
        sectionsId == other.sectionsId &&
        listEquality.equals(listRowsTrackers, other.listRowsTrackers);
  }

  @override
  int get hashCode =>
      const ListEquality().hash([id, rowNumber, sectionsId, listRowsTrackers]);
}

MapTrackersStruct createMapTrackersStruct({
  int? id,
  int? rowNumber,
  int? sectionsId,
}) =>
    MapTrackersStruct(
      id: id,
      rowNumber: rowNumber,
      sectionsId: sectionsId,
    );
