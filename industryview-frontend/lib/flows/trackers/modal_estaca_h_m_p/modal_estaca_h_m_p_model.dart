import '/flows/trackers/heavy_motor_pier/heavy_motor_pier_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'modal_estaca_h_m_p_widget.dart' show ModalEstacaHMPWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalEstacaHMPModel extends FlutterFlowModel<ModalEstacaHMPWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for HeavyMotorPier component.
  late HeavyMotorPierModel heavyMotorPierModel;
  // State field(s) for TxtField widget.
  FocusNode? txtFieldFocusNode;
  TextEditingController? txtFieldTextController;
  String? Function(BuildContext, String?)? txtFieldTextControllerValidator;

  @override
  void initState(BuildContext context) {
    heavyMotorPierModel = createModel(context, () => HeavyMotorPierModel());
  }

  @override
  void dispose() {
    heavyMotorPierModel.dispose();
    txtFieldFocusNode?.dispose();
    txtFieldTextController?.dispose();
  }
}
