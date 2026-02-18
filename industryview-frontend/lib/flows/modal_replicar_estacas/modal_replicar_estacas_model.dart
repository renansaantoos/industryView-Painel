import '/backend/schema/structs/index.dart';
import '/components/modal_add_check_stakes_widget.dart';
import '/flows/heavy_array_pier/heavy_array_pier_widget.dart';
import '/flows/trackers/heavy_array_pier_edge/heavy_array_pier_edge_widget.dart';
import '/flows/trackers/heavy_motor_pier/heavy_motor_pier_widget.dart';
import '/flows/trackers/modal_add_estacas/modal_add_estacas_widget.dart';
import '/flows/trackers/standart_array_pier/standart_array_pier_widget.dart';
import '/flows/trackers/standart_array_pier_edge/standart_array_pier_edge_widget.dart';
import '/flows/trackers/standart_motor_pier/standart_motor_pier_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/custom_functions.dart' as functions;
import 'modal_replicar_estacas_widget.dart' show ModalReplicarEstacasWidget;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalReplicarEstacasModel
    extends FlutterFlowModel<ModalReplicarEstacasWidget> {
  ///  Local state fields for this component.

  int contador = 0;

  ///  State fields for stateful widgets in this component.

  // Model for HeavyMotorPier component.
  late HeavyMotorPierModel heavyMotorPierModel;
  // Model for HeavyArrayPier component.
  late HeavyArrayPierModel heavyArrayPierModel;
  // Model for HeavyArrayPierEdge component.
  late HeavyArrayPierEdgeModel heavyArrayPierEdgeModel;
  // Model for StandartMotorPier component.
  late StandartMotorPierModel standartMotorPierModel;
  // Model for StandartArrayPier component.
  late StandartArrayPierModel standartArrayPierModel;
  // Model for StandartArrayPierEdge component.
  late StandartArrayPierEdgeModel standartArrayPierEdgeModel;

  @override
  void initState(BuildContext context) {
    heavyMotorPierModel = createModel(context, () => HeavyMotorPierModel());
    heavyArrayPierModel = createModel(context, () => HeavyArrayPierModel());
    heavyArrayPierEdgeModel =
        createModel(context, () => HeavyArrayPierEdgeModel());
    standartMotorPierModel =
        createModel(context, () => StandartMotorPierModel());
    standartArrayPierModel =
        createModel(context, () => StandartArrayPierModel());
    standartArrayPierEdgeModel =
        createModel(context, () => StandartArrayPierEdgeModel());
  }

  @override
  void dispose() {
    heavyMotorPierModel.dispose();
    heavyArrayPierModel.dispose();
    heavyArrayPierEdgeModel.dispose();
    standartMotorPierModel.dispose();
    standartArrayPierModel.dispose();
    standartArrayPierEdgeModel.dispose();
  }
}
