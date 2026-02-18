import '/backend/api_requests/api_calls.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flows/modal_criar_tarefa/modal_criar_tarefa_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'options_tarefas_widget.dart' show OptionsTarefasWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class OptionsTarefasModel extends FlutterFlowModel<OptionsTarefasWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered1 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered2 = false;
  // Stores action output result for [Backend Call - API (check task backlog)] action in wrapWidget widget.
  ApiCallResponse? check;
  // Stores action output result for [Backend Call - API (Deactivate task)] action in wrapWidget widget.
  ApiCallResponse? aPiDeactivateTask;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
