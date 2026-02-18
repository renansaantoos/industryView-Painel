import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'dashboard_widget.dart' show DashboardWidget;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class DashboardModel extends FlutterFlowModel<DashboardWidget> {
  ///  Local state fields for this page.

  bool chat = false;

  List<AgentStruct> agent = [];
  void addToAgent(AgentStruct item) => agent.add(item);
  void removeFromAgent(AgentStruct item) => agent.remove(item);
  void removeAtIndexFromAgent(int index) => agent.removeAt(index);
  void insertAtIndexInAgent(int index, AgentStruct item) =>
      agent.insert(index, item);
  void updateAgentAtIndex(int index, Function(AgentStruct) updateFn) =>
      agent[index] = updateFn(agent[index]);

  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token )] action in Dashboard widget.
  ApiCallResponse? aPiTokenAuth;
  // Model for navBar component.
  late NavBarModel navBarModel;

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
  }

  @override
  void dispose() {
    navBarModel.dispose();
  }
}
