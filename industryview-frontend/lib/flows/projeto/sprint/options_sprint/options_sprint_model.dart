import '/backend/api_requests/api_calls.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flows/projeto/sprint/modal_encerrar_sprint/modal_encerrar_sprint_widget.dart';
import '/flows/projeto/sprint/modal_sprint_nova/modal_sprint_nova_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'options_sprint_widget.dart' show OptionsSprintWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class OptionsSprintModel extends FlutterFlowModel<OptionsSprintWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered1 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered2 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered3 = false;
  // Stores action output result for [Backend Call - API (Delete sprints record.)] action in wrapWidget widget.
  ApiCallResponse? deleteSprint;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
