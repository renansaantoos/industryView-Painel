// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class HeadersStruct extends BaseStruct {
  HeadersStruct({
    String? nome,
    int? sequencia,
  })  : _nome = nome,
        _sequencia = sequencia;

  // "nome" field.
  String? _nome;
  String get nome => _nome ?? '';
  set nome(String? val) => _nome = val;

  bool hasNome() => _nome != null;

  // "sequencia" field.
  int? _sequencia;
  int get sequencia => _sequencia ?? 0;
  set sequencia(int? val) => _sequencia = val;

  void incrementSequencia(int amount) => sequencia = sequencia + amount;

  bool hasSequencia() => _sequencia != null;

  static HeadersStruct fromMap(Map<String, dynamic> data) => HeadersStruct(
        nome: data['nome'] as String?,
        sequencia: castToType<int>(data['sequencia']),
      );

  static HeadersStruct? maybeFromMap(dynamic data) =>
      data is Map ? HeadersStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'nome': _nome,
        'sequencia': _sequencia,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'nome': serializeParam(
          _nome,
          ParamType.String,
        ),
        'sequencia': serializeParam(
          _sequencia,
          ParamType.int,
        ),
      }.withoutNulls;

  static HeadersStruct fromSerializableMap(Map<String, dynamic> data) =>
      HeadersStruct(
        nome: deserializeParam(
          data['nome'],
          ParamType.String,
          false,
        ),
        sequencia: deserializeParam(
          data['sequencia'],
          ParamType.int,
          false,
        ),
      );

  @override
  String toString() => 'HeadersStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is HeadersStruct &&
        nome == other.nome &&
        sequencia == other.sequencia;
  }

  @override
  int get hashCode => const ListEquality().hash([nome, sequencia]);
}

HeadersStruct createHeadersStruct({
  String? nome,
  int? sequencia,
}) =>
    HeadersStruct(
      nome: nome,
      sequencia: sequencia,
    );
