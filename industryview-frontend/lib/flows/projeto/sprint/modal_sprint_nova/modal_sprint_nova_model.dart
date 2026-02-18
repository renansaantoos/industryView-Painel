import '/backend/api_requests/api_calls.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/custom_functions.dart' as functions;
import '/index.dart';
import 'modal_sprint_nova_widget.dart' show ModalSprintNovaWidget;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalSprintNovaModel extends FlutterFlowModel<ModalSprintNovaWidget> {
  ///  Local state fields for this component.

  int? status;

  bool erro1 = false;

  bool err2 = false;

  DateTime? dtInicio;

  DateTime? dtFim;

  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  // State field(s) for titulo widget.
  FocusNode? tituloFocusNode;
  TextEditingController? tituloTextController;
  String? Function(BuildContext, String?)? tituloTextControllerValidator;
  String? _tituloTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'jyv32cp4' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for objetivo widget.
  FocusNode? objetivoFocusNode;
  TextEditingController? objetivoTextController;
  String? Function(BuildContext, String?)? objetivoTextControllerValidator;
  String? _objetivoTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'enubgcgb' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  DateTime? datePicked1;
  DateTime? datePicked2;
  // Stores action output result for [Backend Call - API (Add sprints record)] action in Button widget.
  ApiCallResponse? aPiAddSprint;
  // Stores action output result for [Backend Call - API (Edit sprints record)] action in Button widget.
  ApiCallResponse? aPiEdittSpreint;

  @override
  void initState(BuildContext context) {
    tituloTextControllerValidator = _tituloTextControllerValidator;
    objetivoTextControllerValidator = _objetivoTextControllerValidator;
  }

  @override
  void dispose() {
    tituloFocusNode?.dispose();
    tituloTextController?.dispose();

    objetivoFocusNode?.dispose();
    objetivoTextController?.dispose();
  }
}
