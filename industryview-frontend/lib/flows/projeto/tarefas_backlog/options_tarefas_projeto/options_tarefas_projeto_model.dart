import '/backend/api_requests/api_calls.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flows/projeto/tarefas_backlog/modal_add_backlog_manual/modal_add_backlog_manual_widget.dart';
import '/flows/projeto/tarefas_backlog/modal_subtasks/modal_subtasks_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'options_tarefas_projeto_widget.dart' show OptionsTarefasProjetoWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class OptionsTarefasProjetoModel
    extends FlutterFlowModel<OptionsTarefasProjetoWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered1 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered2 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered3 = false;
  // Stores action output result for [Backend Call - API (Delete projects backlogs record)] action in wrapWidget widget.
  ApiCallResponse? aPiDeleteBaklog;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
