// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/core/utils/app_utils.dart';

class UnityStruct extends BaseStruct {
  UnityStruct({
    int? id,
    String? unity,
  })  : _id = id,
        _unity = unity;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "unity" field.
  String? _unity;
  String get unity => _unity ?? '';
  set unity(String? val) => _unity = val;

  bool hasUnity() => _unity != null;

  static UnityStruct fromMap(Map<String, dynamic> data) => UnityStruct(
        id: castToType<int>(data['id']),
        unity: data['unity'] as String?,
      );

  static UnityStruct? maybeFromMap(dynamic data) =>
      data is Map ? UnityStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'unity': _unity,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'unity': serializeParam(
          _unity,
          ParamType.String,
        ),
      }.withoutNulls;

  static UnityStruct fromSerializableMap(Map<String, dynamic> data) =>
      UnityStruct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        unity: deserializeParam(
          data['unity'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'UnityStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is UnityStruct && id == other.id && unity == other.unity;
  }

  @override
  int get hashCode => const ListEquality().hash([id, unity]);
}

UnityStruct createUnityStruct({
  int? id,
  String? unity,
}) =>
    UnityStruct(
      id: id,
      unity: unity,
    );
