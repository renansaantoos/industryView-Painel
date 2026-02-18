import '/backend/api_requests/api_calls.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flows/projeto/gestao_de_equipe/modal_nova_equipe/modal_nova_equipe_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'options_equipe_widget.dart' show OptionsEquipeWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class OptionsEquipeModel extends FlutterFlowModel<OptionsEquipeWidget> {
  ///  Local state fields for this component.

  int contador = 0;

  ///  State fields for stateful widgets in this component.

  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered1 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered2 = false;
  // Stores action output result for [Backend Call - API (Delete teams record.)] action in wrapWidget widget.
  ApiCallResponse? aPiDeleteTeam;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
