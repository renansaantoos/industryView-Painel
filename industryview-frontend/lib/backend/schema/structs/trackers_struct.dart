// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class TrackersStruct extends BaseStruct {
  TrackersStruct({
    int? id,
    int? stakeQuantity,
    int? maxModules,
    int? trackersTypesId,
    int? manufacturersId,
    TrackerTypesStruct? trackersTypes,
    ManufacturersStruct? manufacturers,
  })  : _id = id,
        _stakeQuantity = stakeQuantity,
        _maxModules = maxModules,
        _trackersTypesId = trackersTypesId,
        _manufacturersId = manufacturersId,
        _trackersTypes = trackersTypes,
        _manufacturers = manufacturers;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "stake_quantity" field.
  int? _stakeQuantity;
  int get stakeQuantity => _stakeQuantity ?? 0;
  set stakeQuantity(int? val) => _stakeQuantity = val;

  void incrementStakeQuantity(int amount) =>
      stakeQuantity = stakeQuantity + amount;

  bool hasStakeQuantity() => _stakeQuantity != null;

  // "max_modules" field.
  int? _maxModules;
  int get maxModules => _maxModules ?? 0;
  set maxModules(int? val) => _maxModules = val;

  void incrementMaxModules(int amount) => maxModules = maxModules + amount;

  bool hasMaxModules() => _maxModules != null;

  // "trackers_types_id" field.
  int? _trackersTypesId;
  int get trackersTypesId => _trackersTypesId ?? 0;
  set trackersTypesId(int? val) => _trackersTypesId = val;

  void incrementTrackersTypesId(int amount) =>
      trackersTypesId = trackersTypesId + amount;

  bool hasTrackersTypesId() => _trackersTypesId != null;

  // "manufacturers_id" field.
  int? _manufacturersId;
  int get manufacturersId => _manufacturersId ?? 0;
  set manufacturersId(int? val) => _manufacturersId = val;

  void incrementManufacturersId(int amount) =>
      manufacturersId = manufacturersId + amount;

  bool hasManufacturersId() => _manufacturersId != null;

  // "trackers_types" field.
  TrackerTypesStruct? _trackersTypes;
  TrackerTypesStruct get trackersTypes =>
      _trackersTypes ?? TrackerTypesStruct();
  set trackersTypes(TrackerTypesStruct? val) => _trackersTypes = val;

  void updateTrackersTypes(Function(TrackerTypesStruct) updateFn) {
    updateFn(_trackersTypes ??= TrackerTypesStruct());
  }

  bool hasTrackersTypes() => _trackersTypes != null;

  // "manufacturers" field.
  ManufacturersStruct? _manufacturers;
  ManufacturersStruct get manufacturers =>
      _manufacturers ?? ManufacturersStruct();
  set manufacturers(ManufacturersStruct? val) => _manufacturers = val;

  void updateManufacturers(Function(ManufacturersStruct) updateFn) {
    updateFn(_manufacturers ??= ManufacturersStruct());
  }

  bool hasManufacturers() => _manufacturers != null;

  static TrackersStruct fromMap(Map<String, dynamic> data) => TrackersStruct(
        id: castToType<int>(data['id']),
        stakeQuantity: castToType<int>(data['stake_quantity']),
        maxModules: castToType<int>(data['max_modules']),
        trackersTypesId: castToType<int>(data['trackers_types_id']),
        manufacturersId: castToType<int>(data['manufacturers_id']),
        trackersTypes: data['trackers_types'] is TrackerTypesStruct
            ? data['trackers_types']
            : TrackerTypesStruct.maybeFromMap(data['trackers_types']),
        manufacturers: data['manufacturers'] is ManufacturersStruct
            ? data['manufacturers']
            : ManufacturersStruct.maybeFromMap(data['manufacturers']),
      );

  static TrackersStruct? maybeFromMap(dynamic data) =>
      data is Map ? TrackersStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'stake_quantity': _stakeQuantity,
        'max_modules': _maxModules,
        'trackers_types_id': _trackersTypesId,
        'manufacturers_id': _manufacturersId,
        'trackers_types': _trackersTypes?.toMap(),
        'manufacturers': _manufacturers?.toMap(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'stake_quantity': serializeParam(
          _stakeQuantity,
          ParamType.int,
        ),
        'max_modules': serializeParam(
          _maxModules,
          ParamType.int,
        ),
        'trackers_types_id': serializeParam(
          _trackersTypesId,
          ParamType.int,
        ),
        'manufacturers_id': serializeParam(
          _manufacturersId,
          ParamType.int,
        ),
        'trackers_types': serializeParam(
          _trackersTypes,
          ParamType.DataStruct,
        ),
        'manufacturers': serializeParam(
          _manufacturers,
          ParamType.DataStruct,
        ),
      }.withoutNulls;

  static TrackersStruct fromSerializableMap(Map<String, dynamic> data) =>
      TrackersStruct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        stakeQuantity: deserializeParam(
          data['stake_quantity'],
          ParamType.int,
          false,
        ),
        maxModules: deserializeParam(
          data['max_modules'],
          ParamType.int,
          false,
        ),
        trackersTypesId: deserializeParam(
          data['trackers_types_id'],
          ParamType.int,
          false,
        ),
        manufacturersId: deserializeParam(
          data['manufacturers_id'],
          ParamType.int,
          false,
        ),
        trackersTypes: deserializeStructParam(
          data['trackers_types'],
          ParamType.DataStruct,
          false,
          structBuilder: TrackerTypesStruct.fromSerializableMap,
        ),
        manufacturers: deserializeStructParam(
          data['manufacturers'],
          ParamType.DataStruct,
          false,
          structBuilder: ManufacturersStruct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'TrackersStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is TrackersStruct &&
        id == other.id &&
        stakeQuantity == other.stakeQuantity &&
        maxModules == other.maxModules &&
        trackersTypesId == other.trackersTypesId &&
        manufacturersId == other.manufacturersId &&
        trackersTypes == other.trackersTypes &&
        manufacturers == other.manufacturers;
  }

  @override
  int get hashCode => const ListEquality().hash([
        id,
        stakeQuantity,
        maxModules,
        trackersTypesId,
        manufacturersId,
        trackersTypes,
        manufacturers
      ]);
}

TrackersStruct createTrackersStruct({
  int? id,
  int? stakeQuantity,
  int? maxModules,
  int? trackersTypesId,
  int? manufacturersId,
  TrackerTypesStruct? trackersTypes,
  ManufacturersStruct? manufacturers,
}) =>
    TrackersStruct(
      id: id,
      stakeQuantity: stakeQuantity,
      maxModules: maxModules,
      trackersTypesId: trackersTypesId,
      manufacturersId: manufacturersId,
      trackersTypes: trackersTypes ?? TrackerTypesStruct(),
      manufacturers: manufacturers ?? ManufacturersStruct(),
    );
