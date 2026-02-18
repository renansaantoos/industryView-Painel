import '/flows/trackers/standart_motor_pier/standart_motor_pier_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'modal_estaca_s_m_p_widget.dart' show ModalEstacaSMPWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalEstacaSMPModel extends FlutterFlowModel<ModalEstacaSMPWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for StandartMotorPier component.
  late StandartMotorPierModel standartMotorPierModel;
  // State field(s) for TxtField widget.
  FocusNode? txtFieldFocusNode;
  TextEditingController? txtFieldTextController;
  String? Function(BuildContext, String?)? txtFieldTextControllerValidator;

  @override
  void initState(BuildContext context) {
    standartMotorPierModel =
        createModel(context, () => StandartMotorPierModel());
  }

  @override
  void dispose() {
    standartMotorPierModel.dispose();
    txtFieldFocusNode?.dispose();
    txtFieldTextController?.dispose();
  }
}
