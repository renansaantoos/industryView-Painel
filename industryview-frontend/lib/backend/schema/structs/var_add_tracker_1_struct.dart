// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class VarAddTracker1Struct extends BaseStruct {
  VarAddTracker1Struct({
    int? id,
    String? position,
    String? stakesPosition,
    bool? isMotor,
    bool? stakesIsMotor,
    int? trackersId,
    int? stakesStatusesId,
    int? stakesTypesId,
    String? stakesTypesTxt,
    int? sequenciaEstacas,
    VarAddTracker3Struct? stakesTypes,
    bool? trabalhado,
    bool? erro,
  })  : _id = id,
        _position = position,
        _stakesPosition = stakesPosition,
        _isMotor = isMotor,
        _stakesIsMotor = stakesIsMotor,
        _trackersId = trackersId,
        _stakesStatusesId = stakesStatusesId,
        _stakesTypesId = stakesTypesId,
        _stakesTypesTxt = stakesTypesTxt,
        _sequenciaEstacas = sequenciaEstacas,
        _stakesTypes = stakesTypes,
        _trabalhado = trabalhado,
        _erro = erro;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "position" field.
  String? _position;
  String get position => _position ?? '';
  set position(String? val) => _position = val;

  bool hasPosition() => _position != null;

  // "stakes_position" field.
  String? _stakesPosition;
  String get stakesPosition => _stakesPosition ?? '';
  set stakesPosition(String? val) => _stakesPosition = val;

  bool hasStakesPosition() => _stakesPosition != null;

  // "is_motor" field.
  bool? _isMotor;
  bool get isMotor => _isMotor ?? false;
  set isMotor(bool? val) => _isMotor = val;

  bool hasIsMotor() => _isMotor != null;

  // "stakes_is_motor" field.
  bool? _stakesIsMotor;
  bool get stakesIsMotor => _stakesIsMotor ?? false;
  set stakesIsMotor(bool? val) => _stakesIsMotor = val;

  bool hasStakesIsMotor() => _stakesIsMotor != null;

  // "trackers_id" field.
  int? _trackersId;
  int get trackersId => _trackersId ?? 0;
  set trackersId(int? val) => _trackersId = val;

  void incrementTrackersId(int amount) => trackersId = trackersId + amount;

  bool hasTrackersId() => _trackersId != null;

  // "stakes_statuses_id" field.
  int? _stakesStatusesId;
  int get stakesStatusesId => _stakesStatusesId ?? 0;
  set stakesStatusesId(int? val) => _stakesStatusesId = val;

  void incrementStakesStatusesId(int amount) =>
      stakesStatusesId = stakesStatusesId + amount;

  bool hasStakesStatusesId() => _stakesStatusesId != null;

  // "stakes_types_id" field.
  int? _stakesTypesId;
  int get stakesTypesId => _stakesTypesId ?? 0;
  set stakesTypesId(int? val) => _stakesTypesId = val;

  void incrementStakesTypesId(int amount) =>
      stakesTypesId = stakesTypesId + amount;

  bool hasStakesTypesId() => _stakesTypesId != null;

  // "stakes_types_txt" field.
  String? _stakesTypesTxt;
  String get stakesTypesTxt => _stakesTypesTxt ?? '';
  set stakesTypesTxt(String? val) => _stakesTypesTxt = val;

  bool hasStakesTypesTxt() => _stakesTypesTxt != null;

  // "sequencia_estacas" field.
  int? _sequenciaEstacas;
  int get sequenciaEstacas => _sequenciaEstacas ?? 0;
  set sequenciaEstacas(int? val) => _sequenciaEstacas = val;

  void incrementSequenciaEstacas(int amount) =>
      sequenciaEstacas = sequenciaEstacas + amount;

  bool hasSequenciaEstacas() => _sequenciaEstacas != null;

  // "stakes_types" field.
  VarAddTracker3Struct? _stakesTypes;
  VarAddTracker3Struct get stakesTypes =>
      _stakesTypes ?? VarAddTracker3Struct();
  set stakesTypes(VarAddTracker3Struct? val) => _stakesTypes = val;

  void updateStakesTypes(Function(VarAddTracker3Struct) updateFn) {
    updateFn(_stakesTypes ??= VarAddTracker3Struct());
  }

  bool hasStakesTypes() => _stakesTypes != null;

  // "trabalhado" field.
  bool? _trabalhado;
  bool get trabalhado => _trabalhado ?? false;
  set trabalhado(bool? val) => _trabalhado = val;

  bool hasTrabalhado() => _trabalhado != null;

  // "erro" field.
  bool? _erro;
  bool get erro => _erro ?? false;
  set erro(bool? val) => _erro = val;

  bool hasErro() => _erro != null;

  static VarAddTracker1Struct fromMap(Map<String, dynamic> data) =>
      VarAddTracker1Struct(
        id: castToType<int>(data['id']),
        position: data['position'] as String?,
        stakesPosition: data['stakes_position'] as String?,
        isMotor: data['is_motor'] as bool?,
        stakesIsMotor: data['stakes_is_motor'] as bool?,
        trackersId: castToType<int>(data['trackers_id']),
        stakesStatusesId: castToType<int>(data['stakes_statuses_id']),
        stakesTypesId: castToType<int>(data['stakes_types_id']),
        stakesTypesTxt: data['stakes_types_txt'] as String?,
        sequenciaEstacas: castToType<int>(data['sequencia_estacas']),
        stakesTypes: data['stakes_types'] is VarAddTracker3Struct
            ? data['stakes_types']
            : VarAddTracker3Struct.maybeFromMap(data['stakes_types']),
        trabalhado: data['trabalhado'] as bool?,
        erro: data['erro'] as bool?,
      );

  static VarAddTracker1Struct? maybeFromMap(dynamic data) => data is Map
      ? VarAddTracker1Struct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'position': _position,
        'stakes_position': _stakesPosition,
        'is_motor': _isMotor,
        'stakes_is_motor': _stakesIsMotor,
        'trackers_id': _trackersId,
        'stakes_statuses_id': _stakesStatusesId,
        'stakes_types_id': _stakesTypesId,
        'stakes_types_txt': _stakesTypesTxt,
        'sequencia_estacas': _sequenciaEstacas,
        'stakes_types': _stakesTypes?.toMap(),
        'trabalhado': _trabalhado,
        'erro': _erro,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'position': serializeParam(
          _position,
          ParamType.String,
        ),
        'stakes_position': serializeParam(
          _stakesPosition,
          ParamType.String,
        ),
        'is_motor': serializeParam(
          _isMotor,
          ParamType.bool,
        ),
        'stakes_is_motor': serializeParam(
          _stakesIsMotor,
          ParamType.bool,
        ),
        'trackers_id': serializeParam(
          _trackersId,
          ParamType.int,
        ),
        'stakes_statuses_id': serializeParam(
          _stakesStatusesId,
          ParamType.int,
        ),
        'stakes_types_id': serializeParam(
          _stakesTypesId,
          ParamType.int,
        ),
        'stakes_types_txt': serializeParam(
          _stakesTypesTxt,
          ParamType.String,
        ),
        'sequencia_estacas': serializeParam(
          _sequenciaEstacas,
          ParamType.int,
        ),
        'stakes_types': serializeParam(
          _stakesTypes,
          ParamType.DataStruct,
        ),
        'trabalhado': serializeParam(
          _trabalhado,
          ParamType.bool,
        ),
        'erro': serializeParam(
          _erro,
          ParamType.bool,
        ),
      }.withoutNulls;

  static VarAddTracker1Struct fromSerializableMap(Map<String, dynamic> data) =>
      VarAddTracker1Struct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        position: deserializeParam(
          data['position'],
          ParamType.String,
          false,
        ),
        stakesPosition: deserializeParam(
          data['stakes_position'],
          ParamType.String,
          false,
        ),
        isMotor: deserializeParam(
          data['is_motor'],
          ParamType.bool,
          false,
        ),
        stakesIsMotor: deserializeParam(
          data['stakes_is_motor'],
          ParamType.bool,
          false,
        ),
        trackersId: deserializeParam(
          data['trackers_id'],
          ParamType.int,
          false,
        ),
        stakesStatusesId: deserializeParam(
          data['stakes_statuses_id'],
          ParamType.int,
          false,
        ),
        stakesTypesId: deserializeParam(
          data['stakes_types_id'],
          ParamType.int,
          false,
        ),
        stakesTypesTxt: deserializeParam(
          data['stakes_types_txt'],
          ParamType.String,
          false,
        ),
        sequenciaEstacas: deserializeParam(
          data['sequencia_estacas'],
          ParamType.int,
          false,
        ),
        stakesTypes: deserializeStructParam(
          data['stakes_types'],
          ParamType.DataStruct,
          false,
          structBuilder: VarAddTracker3Struct.fromSerializableMap,
        ),
        trabalhado: deserializeParam(
          data['trabalhado'],
          ParamType.bool,
          false,
        ),
        erro: deserializeParam(
          data['erro'],
          ParamType.bool,
          false,
        ),
      );

  @override
  String toString() => 'VarAddTracker1Struct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is VarAddTracker1Struct &&
        id == other.id &&
        position == other.position &&
        stakesPosition == other.stakesPosition &&
        isMotor == other.isMotor &&
        stakesIsMotor == other.stakesIsMotor &&
        trackersId == other.trackersId &&
        stakesStatusesId == other.stakesStatusesId &&
        stakesTypesId == other.stakesTypesId &&
        stakesTypesTxt == other.stakesTypesTxt &&
        sequenciaEstacas == other.sequenciaEstacas &&
        stakesTypes == other.stakesTypes &&
        trabalhado == other.trabalhado &&
        erro == other.erro;
  }

  @override
  int get hashCode => const ListEquality().hash([
        id,
        position,
        stakesPosition,
        isMotor,
        stakesIsMotor,
        trackersId,
        stakesStatusesId,
        stakesTypesId,
        stakesTypesTxt,
        sequenciaEstacas,
        stakesTypes,
        trabalhado,
        erro
      ]);
}

VarAddTracker1Struct createVarAddTracker1Struct({
  int? id,
  String? position,
  String? stakesPosition,
  bool? isMotor,
  bool? stakesIsMotor,
  int? trackersId,
  int? stakesStatusesId,
  int? stakesTypesId,
  String? stakesTypesTxt,
  int? sequenciaEstacas,
  VarAddTracker3Struct? stakesTypes,
  bool? trabalhado,
  bool? erro,
}) =>
    VarAddTracker1Struct(
      id: id,
      position: position,
      stakesPosition: stakesPosition,
      isMotor: isMotor,
      stakesIsMotor: stakesIsMotor,
      trackersId: trackersId,
      stakesStatusesId: stakesStatusesId,
      stakesTypesId: stakesTypesId,
      stakesTypesTxt: stakesTypesTxt,
      sequenciaEstacas: sequenciaEstacas,
      stakesTypes: stakesTypes ?? VarAddTracker3Struct(),
      trabalhado: trabalhado,
      erro: erro,
    );
