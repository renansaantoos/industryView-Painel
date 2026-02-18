import '/flows/trackers/heavy_array_pier_edge/heavy_array_pier_edge_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'modal_estaca_h_a_p_e_widget.dart' show ModalEstacaHAPEWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalEstacaHAPEModel extends FlutterFlowModel<ModalEstacaHAPEWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for HeavyArrayPierEdge component.
  late HeavyArrayPierEdgeModel heavyArrayPierEdgeModel;
  // State field(s) for TxtField widget.
  FocusNode? txtFieldFocusNode;
  TextEditingController? txtFieldTextController;
  String? Function(BuildContext, String?)? txtFieldTextControllerValidator;

  @override
  void initState(BuildContext context) {
    heavyArrayPierEdgeModel =
        createModel(context, () => HeavyArrayPierEdgeModel());
  }

  @override
  void dispose() {
    heavyArrayPierEdgeModel.dispose();
    txtFieldFocusNode?.dispose();
    txtFieldTextController?.dispose();
  }
}
