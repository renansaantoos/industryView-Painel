import '/backend/api_requests/api_calls.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'modal_encerrar_sprint_widget.dart' show ModalEncerrarSprintWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalEncerrarSprintModel
    extends FlutterFlowModel<ModalEncerrarSprintWidget> {
  ///  State fields for stateful widgets in this component.

  // Stores action output result for [Backend Call - API (Edit sprints record)] action in Button widget.
  ApiCallResponse? aPiDeleteSprint;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
