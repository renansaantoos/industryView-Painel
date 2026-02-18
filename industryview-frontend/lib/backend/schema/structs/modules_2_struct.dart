// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class Modules2Struct extends BaseStruct {
  Modules2Struct({
    int? id,
    String? createdAt,
    String? updatedAt,
    String? deletedAt,
    double? voltage,
    double? current,
    double? shortCircuitCurrent,
    double? power,
    double? vco,
    double? im,
    double? vm,
    String? moduleTypes,
    Modules3Struct? moduleManufacturers,
  })  : _id = id,
        _createdAt = createdAt,
        _updatedAt = updatedAt,
        _deletedAt = deletedAt,
        _voltage = voltage,
        _current = current,
        _shortCircuitCurrent = shortCircuitCurrent,
        _power = power,
        _vco = vco,
        _im = im,
        _vm = vm,
        _moduleTypes = moduleTypes,
        _moduleManufacturers = moduleManufacturers;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "created_at" field.
  String? _createdAt;
  String get createdAt => _createdAt ?? '';
  set createdAt(String? val) => _createdAt = val;

  bool hasCreatedAt() => _createdAt != null;

  // "updated_at" field.
  String? _updatedAt;
  String get updatedAt => _updatedAt ?? '';
  set updatedAt(String? val) => _updatedAt = val;

  bool hasUpdatedAt() => _updatedAt != null;

  // "deleted_at" field.
  String? _deletedAt;
  String get deletedAt => _deletedAt ?? '';
  set deletedAt(String? val) => _deletedAt = val;

  bool hasDeletedAt() => _deletedAt != null;

  // "voltage" field.
  double? _voltage;
  double get voltage => _voltage ?? 0.0;
  set voltage(double? val) => _voltage = val;

  void incrementVoltage(double amount) => voltage = voltage + amount;

  bool hasVoltage() => _voltage != null;

  // "current" field.
  double? _current;
  double get current => _current ?? 0.0;
  set current(double? val) => _current = val;

  void incrementCurrent(double amount) => current = current + amount;

  bool hasCurrent() => _current != null;

  // "short_circuit_current" field.
  double? _shortCircuitCurrent;
  double get shortCircuitCurrent => _shortCircuitCurrent ?? 0.0;
  set shortCircuitCurrent(double? val) => _shortCircuitCurrent = val;

  void incrementShortCircuitCurrent(double amount) =>
      shortCircuitCurrent = shortCircuitCurrent + amount;

  bool hasShortCircuitCurrent() => _shortCircuitCurrent != null;

  // "power" field.
  double? _power;
  double get power => _power ?? 0.0;
  set power(double? val) => _power = val;

  void incrementPower(double amount) => power = power + amount;

  bool hasPower() => _power != null;

  // "vco" field.
  double? _vco;
  double get vco => _vco ?? 0.0;
  set vco(double? val) => _vco = val;

  void incrementVco(double amount) => vco = vco + amount;

  bool hasVco() => _vco != null;

  // "im" field.
  double? _im;
  double get im => _im ?? 0.0;
  set im(double? val) => _im = val;

  void incrementIm(double amount) => im = im + amount;

  bool hasIm() => _im != null;

  // "vm" field.
  double? _vm;
  double get vm => _vm ?? 0.0;
  set vm(double? val) => _vm = val;

  void incrementVm(double amount) => vm = vm + amount;

  bool hasVm() => _vm != null;

  // "module_types" field.
  String? _moduleTypes;
  String get moduleTypes => _moduleTypes ?? '';
  set moduleTypes(String? val) => _moduleTypes = val;

  bool hasModuleTypes() => _moduleTypes != null;

  // "module_manufacturers" field.
  Modules3Struct? _moduleManufacturers;
  Modules3Struct get moduleManufacturers =>
      _moduleManufacturers ?? Modules3Struct();
  set moduleManufacturers(Modules3Struct? val) => _moduleManufacturers = val;

  void updateModuleManufacturers(Function(Modules3Struct) updateFn) {
    updateFn(_moduleManufacturers ??= Modules3Struct());
  }

  bool hasModuleManufacturers() => _moduleManufacturers != null;

  static Modules2Struct fromMap(Map<String, dynamic> data) => Modules2Struct(
        id: castToType<int>(data['id']),
        createdAt: castToType<String>(data['created_at']),
        updatedAt: castToType<String>(data['updated_at']),
        deletedAt: castToType<String>(data['deleted_at']),
        voltage: castToType<double>(data['voltage']),
        current: castToType<double>(data['current']),
        shortCircuitCurrent: castToType<double>(data['short_circuit_current']),
        power: castToType<double>(data['power']),
        vco: castToType<double>(data['vco']),
        im: castToType<double>(data['im']),
        vm: castToType<double>(data['vm']),
        moduleTypes: data['module_types'] as String?,
        moduleManufacturers: data['module_manufacturers'] is Modules3Struct
            ? data['module_manufacturers']
            : Modules3Struct.maybeFromMap(data['module_manufacturers']),
      );

  static Modules2Struct? maybeFromMap(dynamic data) =>
      data is Map ? Modules2Struct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'created_at': _createdAt,
        'updated_at': _updatedAt,
        'deleted_at': _deletedAt,
        'voltage': _voltage,
        'current': _current,
        'short_circuit_current': _shortCircuitCurrent,
        'power': _power,
        'vco': _vco,
        'im': _im,
        'vm': _vm,
        'module_types': _moduleTypes,
        'module_manufacturers': _moduleManufacturers?.toMap(),
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'created_at': serializeParam(
          _createdAt,
          ParamType.String,
        ),
        'updated_at': serializeParam(
          _updatedAt,
          ParamType.String,
        ),
        'deleted_at': serializeParam(
          _deletedAt,
          ParamType.String,
        ),
        'voltage': serializeParam(
          _voltage,
          ParamType.double,
        ),
        'current': serializeParam(
          _current,
          ParamType.double,
        ),
        'short_circuit_current': serializeParam(
          _shortCircuitCurrent,
          ParamType.double,
        ),
        'power': serializeParam(
          _power,
          ParamType.double,
        ),
        'vco': serializeParam(
          _vco,
          ParamType.double,
        ),
        'im': serializeParam(
          _im,
          ParamType.double,
        ),
        'vm': serializeParam(
          _vm,
          ParamType.double,
        ),
        'module_types': serializeParam(
          _moduleTypes,
          ParamType.String,
        ),
        'module_manufacturers': serializeParam(
          _moduleManufacturers,
          ParamType.DataStruct,
        ),
      }.withoutNulls;

  static Modules2Struct fromSerializableMap(Map<String, dynamic> data) =>
      Modules2Struct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        createdAt: deserializeParam(
          data['created_at'],
          ParamType.String,
          false,
        ),
        updatedAt: deserializeParam(
          data['updated_at'],
          ParamType.String,
          false,
        ),
        deletedAt: deserializeParam(
          data['deleted_at'],
          ParamType.String,
          false,
        ),
        voltage: deserializeParam(
          data['voltage'],
          ParamType.double,
          false,
        ),
        current: deserializeParam(
          data['current'],
          ParamType.double,
          false,
        ),
        shortCircuitCurrent: deserializeParam(
          data['short_circuit_current'],
          ParamType.double,
          false,
        ),
        power: deserializeParam(
          data['power'],
          ParamType.double,
          false,
        ),
        vco: deserializeParam(
          data['vco'],
          ParamType.double,
          false,
        ),
        im: deserializeParam(
          data['im'],
          ParamType.double,
          false,
        ),
        vm: deserializeParam(
          data['vm'],
          ParamType.double,
          false,
        ),
        moduleTypes: deserializeParam(
          data['module_types'],
          ParamType.String,
          false,
        ),
        moduleManufacturers: deserializeStructParam(
          data['module_manufacturers'],
          ParamType.DataStruct,
          false,
          structBuilder: Modules3Struct.fromSerializableMap,
        ),
      );

  @override
  String toString() => 'Modules2Struct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is Modules2Struct &&
        id == other.id &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        deletedAt == other.deletedAt &&
        voltage == other.voltage &&
        current == other.current &&
        shortCircuitCurrent == other.shortCircuitCurrent &&
        power == other.power &&
        vco == other.vco &&
        im == other.im &&
        vm == other.vm &&
        moduleTypes == other.moduleTypes &&
        moduleManufacturers == other.moduleManufacturers;
  }

  @override
  int get hashCode => const ListEquality().hash([
        id,
        createdAt,
        updatedAt,
        deletedAt,
        voltage,
        current,
        shortCircuitCurrent,
        power,
        vco,
        im,
        vm,
        moduleTypes,
        moduleManufacturers
      ]);
}

Modules2Struct createModules2Struct({
  int? id,
  String? createdAt,
  String? updatedAt,
  String? deletedAt,
  double? voltage,
  double? current,
  double? shortCircuitCurrent,
  double? power,
  double? vco,
  double? im,
  double? vm,
  String? moduleTypes,
  Modules3Struct? moduleManufacturers,
}) =>
    Modules2Struct(
      id: id,
      createdAt: createdAt,
      updatedAt: updatedAt,
      deletedAt: deletedAt,
      voltage: voltage,
      current: current,
      shortCircuitCurrent: shortCircuitCurrent,
      power: power,
      vco: vco,
      im: im,
      vm: vm,
      moduleTypes: moduleTypes,
      moduleManufacturers: moduleManufacturers ?? Modules3Struct(),
    );
