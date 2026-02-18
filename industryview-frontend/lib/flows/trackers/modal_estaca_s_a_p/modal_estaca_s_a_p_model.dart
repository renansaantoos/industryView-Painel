import '/flows/trackers/standart_array_pier/standart_array_pier_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'modal_estaca_s_a_p_widget.dart' show ModalEstacaSAPWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalEstacaSAPModel extends FlutterFlowModel<ModalEstacaSAPWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for StandartArrayPier component.
  late StandartArrayPierModel standartArrayPierModel;
  // State field(s) for TxtField widget.
  FocusNode? txtFieldFocusNode;
  TextEditingController? txtFieldTextController;
  String? Function(BuildContext, String?)? txtFieldTextControllerValidator;

  @override
  void initState(BuildContext context) {
    standartArrayPierModel =
        createModel(context, () => StandartArrayPierModel());
  }

  @override
  void dispose() {
    standartArrayPierModel.dispose();
    txtFieldFocusNode?.dispose();
    txtFieldTextController?.dispose();
  }
}
