import '/flows/trackers/standart_array_pier_edge/standart_array_pier_edge_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'modal_estaca_s_a_p_e_widget.dart' show ModalEstacaSAPEWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalEstacaSAPEModel extends FlutterFlowModel<ModalEstacaSAPEWidget> {
  ///  State fields for stateful widgets in this component.

  // Model for StandartArrayPierEdge component.
  late StandartArrayPierEdgeModel standartArrayPierEdgeModel;
  // State field(s) for TxtField widget.
  FocusNode? txtFieldFocusNode;
  TextEditingController? txtFieldTextController;
  String? Function(BuildContext, String?)? txtFieldTextControllerValidator;

  @override
  void initState(BuildContext context) {
    standartArrayPierEdgeModel =
        createModel(context, () => StandartArrayPierEdgeModel());
  }

  @override
  void dispose() {
    standartArrayPierEdgeModel.dispose();
    txtFieldFocusNode?.dispose();
    txtFieldTextController?.dispose();
  }
}
