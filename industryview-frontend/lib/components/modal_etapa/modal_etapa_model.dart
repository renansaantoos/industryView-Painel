import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'modal_etapa_widget.dart' show ModalEtapaWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalEtapaModel extends FlutterFlowModel<ModalEtapaWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for nomedoprojeto widget.
  FocusNode? nomedoprojetoFocusNode;
  TextEditingController? nomedoprojetoTextController;
  String? Function(BuildContext, String?)? nomedoprojetoTextControllerValidator;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    nomedoprojetoFocusNode?.dispose();
    nomedoprojetoTextController?.dispose();
  }
}
