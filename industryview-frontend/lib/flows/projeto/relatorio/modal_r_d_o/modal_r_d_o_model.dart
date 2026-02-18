import '/components/card_colaborador_cargo/card_colaborador_cargo_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'modal_r_d_o_widget.dart' show ModalRDOWidget;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:provider/provider.dart';

class ModalRDOModel extends FlutterFlowModel<ModalRDOWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for TabBar widget.
  TabController? tabBarController;
  int get tabBarCurrentIndex =>
      tabBarController != null ? tabBarController!.index : 0;
  int get tabBarPreviousIndex =>
      tabBarController != null ? tabBarController!.previousIndex : 0;

  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel1;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel2;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel3;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel4;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel5;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel6;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel7;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel8;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel9;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel10;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel11;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel12;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel13;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel14;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel15;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel16;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel17;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel18;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel19;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel20;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel21;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel22;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel23;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel24;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel25;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel26;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel27;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel28;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel29;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel30;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel31;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel32;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel33;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel34;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel35;
  // Model for card_colaboradorCargo component.
  late CardColaboradorCargoModel cardColaboradorCargoModel36;

  @override
  void initState(BuildContext context) {
    cardColaboradorCargoModel1 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel2 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel3 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel4 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel5 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel6 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel7 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel8 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel9 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel10 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel11 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel12 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel13 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel14 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel15 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel16 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel17 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel18 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel19 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel20 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel21 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel22 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel23 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel24 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel25 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel26 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel27 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel28 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel29 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel30 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel31 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel32 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel33 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel34 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel35 =
        createModel(context, () => CardColaboradorCargoModel());
    cardColaboradorCargoModel36 =
        createModel(context, () => CardColaboradorCargoModel());
  }

  @override
  void dispose() {
    tabBarController?.dispose();
    textFieldFocusNode?.dispose();
    textController?.dispose();

    cardColaboradorCargoModel1.dispose();
    cardColaboradorCargoModel2.dispose();
    cardColaboradorCargoModel3.dispose();
    cardColaboradorCargoModel4.dispose();
    cardColaboradorCargoModel5.dispose();
    cardColaboradorCargoModel6.dispose();
    cardColaboradorCargoModel7.dispose();
    cardColaboradorCargoModel8.dispose();
    cardColaboradorCargoModel9.dispose();
    cardColaboradorCargoModel10.dispose();
    cardColaboradorCargoModel11.dispose();
    cardColaboradorCargoModel12.dispose();
    cardColaboradorCargoModel13.dispose();
    cardColaboradorCargoModel14.dispose();
    cardColaboradorCargoModel15.dispose();
    cardColaboradorCargoModel16.dispose();
    cardColaboradorCargoModel17.dispose();
    cardColaboradorCargoModel18.dispose();
    cardColaboradorCargoModel19.dispose();
    cardColaboradorCargoModel20.dispose();
    cardColaboradorCargoModel21.dispose();
    cardColaboradorCargoModel22.dispose();
    cardColaboradorCargoModel23.dispose();
    cardColaboradorCargoModel24.dispose();
    cardColaboradorCargoModel25.dispose();
    cardColaboradorCargoModel26.dispose();
    cardColaboradorCargoModel27.dispose();
    cardColaboradorCargoModel28.dispose();
    cardColaboradorCargoModel29.dispose();
    cardColaboradorCargoModel30.dispose();
    cardColaboradorCargoModel31.dispose();
    cardColaboradorCargoModel32.dispose();
    cardColaboradorCargoModel33.dispose();
    cardColaboradorCargoModel34.dispose();
    cardColaboradorCargoModel35.dispose();
    cardColaboradorCargoModel36.dispose();
  }
}
