// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class User3Struct extends BaseStruct {
  User3Struct({
    String? url,
  }) : _url = url;

  // "url" field.
  String? _url;
  String get url =>
      _url ??
      'https://x8ki-letl-twmt.n7.xano.io/vault/iaWPz-tD/8ler69Ci8dU8B1ExemIRgXluexs/JGrgRQ../no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg ';
  set url(String? val) => _url = val;

  bool hasUrl() => _url != null;

  static User3Struct fromMap(Map<String, dynamic> data) => User3Struct(
        url: data['url'] as String?,
      );

  static User3Struct? maybeFromMap(dynamic data) =>
      data is Map ? User3Struct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'url': _url,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'url': serializeParam(
          _url,
          ParamType.String,
        ),
      }.withoutNulls;

  static User3Struct fromSerializableMap(Map<String, dynamic> data) =>
      User3Struct(
        url: deserializeParam(
          data['url'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'User3Struct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is User3Struct && url == other.url;
  }

  @override
  int get hashCode => const ListEquality().hash([url]);
}

User3Struct createUser3Struct({
  String? url,
}) =>
    User3Struct(
      url: url,
    );
