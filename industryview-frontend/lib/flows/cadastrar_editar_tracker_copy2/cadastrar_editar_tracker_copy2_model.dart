import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_confirm/modal_confirm_widget.dart';
import '/components/modal_empty2_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/flows/heavy_array_pier/heavy_array_pier_widget.dart';
import '/flows/trackers/drop_manufactures_trackers/drop_manufactures_trackers_widget.dart';
import '/flows/trackers/drop_tracker/drop_tracker_widget.dart';
import '/flows/trackers/heavy_array_pier_edge/heavy_array_pier_edge_widget.dart';
import '/flows/trackers/heavy_motor_pier/heavy_motor_pier_widget.dart';
import '/flows/trackers/modal_add_estacas/modal_add_estacas_widget.dart';
import '/flows/trackers/standart_array_pier/standart_array_pier_widget.dart';
import '/flows/trackers/standart_array_pier_edge/standart_array_pier_edge_widget.dart';
import '/flows/trackers/standart_motor_pier/standart_motor_pier_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/flutter_flow/custom_functions.dart' as functions;
import '/index.dart';
import 'cadastrar_editar_tracker_copy2_widget.dart'
    show CadastrarEditarTrackerCopy2Widget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class CadastrarEditarTrackerCopy2Model
    extends FlutterFlowModel<CadastrarEditarTrackerCopy2Widget> {
  ///  Local state fields for this page.

  int contador = 0;

  int qtdset = 0;

  int item = 1;

  int qtdItemsAtual = 0;

  DropSelect1Struct? dropManufacture;
  void updateDropManufactureStruct(Function(DropSelect1Struct) updateFn) {
    updateFn(dropManufacture ??= DropSelect1Struct());
  }

  DropSelect2Struct? dropTracker;
  void updateDropTrackerStruct(Function(DropSelect2Struct) updateFn) {
    updateFn(dropTracker ??= DropSelect2Struct());
  }

  bool erroFabricante = false;

  bool erroTracker = false;

  bool err1 = false;

  bool err2 = false;

  ///  State fields for stateful widgets in this page.

  final formKey = GlobalKey<FormState>();
  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token )] action in CadastrarEditarTrackerCopy2 widget.
  ApiCallResponse? aPiTokenAuth;
  // Stores action output result for [Backend Call - API (Get estacas de um trackers)] action in CadastrarEditarTrackerCopy2 widget.
  ApiCallResponse? aPiListStakes;
  // Model for navBar component.
  late NavBarModel navBarModel;
  // Stores action output result for [Alert Dialog - Custom Dialog] action in Container widget.
  bool? returnManufactures;
  // Stores action output result for [Alert Dialog - Custom Dialog] action in Container widget.
  bool? returnTracker;
  // State field(s) for TxtField widget.
  FocusNode? txtFieldFocusNode;
  TextEditingController? txtFieldTextController;
  String? Function(BuildContext, String?)? txtFieldTextControllerValidator;
  String? _txtFieldTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'g1ygsu79' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for qtdEstacas widget.
  FocusNode? qtdEstacasFocusNode;
  TextEditingController? qtdEstacasTextController;
  String? Function(BuildContext, String?)? qtdEstacasTextControllerValidator;
  String? _qtdEstacasTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'e0hnjwzs' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // Stores action output result for [Backend Call - API (Delete stakes record.)] action in Icon widget.
  ApiCallResponse? aPiDeleteStake;
  // Stores action output result for [Validate Form] action in Button widget.
  bool? form;
  // Stores action output result for [Custom Action - actVerificaPreenchimentoInfo] action in Button widget.
  bool? returnAction;
  // Stores action output result for [Backend Call - API (Add trackers record)] action in Button widget.
  ApiCallResponse? aPiAddTrackers;
  // Stores action output result for [Backend Call - API (Edit trackers record)] action in Button widget.
  ApiCallResponse? aPiEditTracker;

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
    txtFieldTextControllerValidator = _txtFieldTextControllerValidator;
    qtdEstacasTextControllerValidator = _qtdEstacasTextControllerValidator;
  }

  @override
  void dispose() {
    navBarModel.dispose();
    txtFieldFocusNode?.dispose();
    txtFieldTextController?.dispose();

    qtdEstacasFocusNode?.dispose();
    qtdEstacasTextController?.dispose();
  }
}
