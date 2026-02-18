import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flows/modulos/drop_manufactures/drop_manufactures_widget.dart';
import '/flows/modulos/drop_modules/drop_modules_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'modal_cadastrar_editar_modulo_widget.dart'
    show ModalCadastrarEditarModuloWidget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalCadastrarEditarModuloModel
    extends FlutterFlowModel<ModalCadastrarEditarModuloWidget> {
  ///  Local state fields for this component.

  bool erroFabricante = false;

  bool erroModulo = false;

  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered1 = false;
  // Stores action output result for [Alert Dialog - Custom Dialog] action in Container widget.
  bool? retornoManufactures;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered2 = false;
  // Stores action output result for [Alert Dialog - Custom Dialog] action in Container widget.
  bool? returnModulos;
  // State field(s) for tensao widget.
  FocusNode? tensaoFocusNode;
  TextEditingController? tensaoTextController;
  String? Function(BuildContext, String?)? tensaoTextControllerValidator;
  String? _tensaoTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '31s3rgqk' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for corrente widget.
  FocusNode? correnteFocusNode;
  TextEditingController? correnteTextController;
  String? Function(BuildContext, String?)? correnteTextControllerValidator;
  String? _correnteTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '20iyy1on' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for correnteCircuito widget.
  FocusNode? correnteCircuitoFocusNode;
  TextEditingController? correnteCircuitoTextController;
  String? Function(BuildContext, String?)?
      correnteCircuitoTextControllerValidator;
  String? _correnteCircuitoTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'mqk5vqch' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for potencia widget.
  FocusNode? potenciaFocusNode;
  TextEditingController? potenciaTextController;
  String? Function(BuildContext, String?)? potenciaTextControllerValidator;
  String? _potenciaTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '2w03r1d0' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for vco widget.
  FocusNode? vcoFocusNode;
  TextEditingController? vcoTextController;
  String? Function(BuildContext, String?)? vcoTextControllerValidator;
  String? _vcoTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '0u41zhnd' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for im widget.
  FocusNode? imFocusNode;
  TextEditingController? imTextController;
  String? Function(BuildContext, String?)? imTextControllerValidator;
  String? _imTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '7527uefo' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for vm widget.
  FocusNode? vmFocusNode;
  TextEditingController? vmTextController;
  String? Function(BuildContext, String?)? vmTextControllerValidator;
  String? _vmTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        't3wvpdmh' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // Stores action output result for [Validate Form] action in Button widget.
  bool? form;
  // Stores action output result for [Backend Call - API (Add modules record)] action in Button widget.
  ApiCallResponse? aPiAddModule;
  // Stores action output result for [Backend Call - API (Edit modules record)] action in Button widget.
  ApiCallResponse? aPiEditModules;

  @override
  void initState(BuildContext context) {
    tensaoTextControllerValidator = _tensaoTextControllerValidator;
    correnteTextControllerValidator = _correnteTextControllerValidator;
    correnteCircuitoTextControllerValidator =
        _correnteCircuitoTextControllerValidator;
    potenciaTextControllerValidator = _potenciaTextControllerValidator;
    vcoTextControllerValidator = _vcoTextControllerValidator;
    imTextControllerValidator = _imTextControllerValidator;
    vmTextControllerValidator = _vmTextControllerValidator;
  }

  @override
  void dispose() {
    tensaoFocusNode?.dispose();
    tensaoTextController?.dispose();

    correnteFocusNode?.dispose();
    correnteTextController?.dispose();

    correnteCircuitoFocusNode?.dispose();
    correnteCircuitoTextController?.dispose();

    potenciaFocusNode?.dispose();
    potenciaTextController?.dispose();

    vcoFocusNode?.dispose();
    vcoTextController?.dispose();

    imFocusNode?.dispose();
    imTextController?.dispose();

    vmFocusNode?.dispose();
    vmTextController?.dispose();
  }
}
