// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class AgentStruct extends BaseStruct {
  AgentStruct({
    String? agentMsg,
    String? userMsg,
  })  : _agentMsg = agentMsg,
        _userMsg = userMsg;

  // "agent_msg" field.
  String? _agentMsg;
  String get agentMsg => _agentMsg ?? '';
  set agentMsg(String? val) => _agentMsg = val;

  bool hasAgentMsg() => _agentMsg != null;

  // "user_msg" field.
  String? _userMsg;
  String get userMsg => _userMsg ?? '';
  set userMsg(String? val) => _userMsg = val;

  bool hasUserMsg() => _userMsg != null;

  static AgentStruct fromMap(Map<String, dynamic> data) => AgentStruct(
        agentMsg: data['agent_msg'] as String?,
        userMsg: data['user_msg'] as String?,
      );

  static AgentStruct? maybeFromMap(dynamic data) =>
      data is Map ? AgentStruct.fromMap(data.cast<String, dynamic>()) : null;

  Map<String, dynamic> toMap() => {
        'agent_msg': _agentMsg,
        'user_msg': _userMsg,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'agent_msg': serializeParam(
          _agentMsg,
          ParamType.String,
        ),
        'user_msg': serializeParam(
          _userMsg,
          ParamType.String,
        ),
      }.withoutNulls;

  static AgentStruct fromSerializableMap(Map<String, dynamic> data) =>
      AgentStruct(
        agentMsg: deserializeParam(
          data['agent_msg'],
          ParamType.String,
          false,
        ),
        userMsg: deserializeParam(
          data['user_msg'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'AgentStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is AgentStruct &&
        agentMsg == other.agentMsg &&
        userMsg == other.userMsg;
  }

  @override
  int get hashCode => const ListEquality().hash([agentMsg, userMsg]);
}

AgentStruct createAgentStruct({
  String? agentMsg,
  String? userMsg,
}) =>
    AgentStruct(
      agentMsg: agentMsg,
      userMsg: userMsg,
    );
