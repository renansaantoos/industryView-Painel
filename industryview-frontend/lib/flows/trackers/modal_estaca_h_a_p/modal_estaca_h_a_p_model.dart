import '/flows/heavy_array_pier/heavy_array_pier_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'modal_estaca_h_a_p_widget.dart' show ModalEstacaHAPWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalEstacaHAPModel extends FlutterFlowModel<ModalEstacaHAPWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for HeavyArrayPier component.
  late HeavyArrayPierModel heavyArrayPierModel;
  // State field(s) for TxtField widget.
  FocusNode? txtFieldFocusNode;
  TextEditingController? txtFieldTextController;
  String? Function(BuildContext, String?)? txtFieldTextControllerValidator;

  @override
  void initState(BuildContext context) {
    heavyArrayPierModel = createModel(context, () => HeavyArrayPierModel());
  }

  @override
  void dispose() {
    heavyArrayPierModel.dispose();
    txtFieldFocusNode?.dispose();
    txtFieldTextController?.dispose();
  }
}
