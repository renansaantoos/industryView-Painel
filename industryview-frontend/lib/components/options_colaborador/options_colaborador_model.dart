import '/backend/api_requests/api_calls.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/components/qrcode_widget.dart';
import '/flows/colaboradores/modal_add_usuario/modal_add_usuario_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'options_colaborador_widget.dart' show OptionsColaboradorWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class OptionsColaboradorModel
    extends FlutterFlowModel<OptionsColaboradorWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered1 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered2 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered3 = false;
  // Stores action output result for [Backend Call - API (Delete user)] action in wrapWidget widget.
  ApiCallResponse? aPiDeleteUser;
  // Stores action output result for [Backend Call - API (Delete teams_leaders record.)] action in wrapWidget widget.
  ApiCallResponse? aPIDeleteLeader;
  // Stores action output result for [Backend Call - API (Delete teams_members record.)] action in wrapWidget widget.
  ApiCallResponse? aPiDeleteMember;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
