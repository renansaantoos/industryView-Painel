import '/backend/api_requests/api_calls.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import 'dart:async';
import 'modal_company_widget.dart' show ModalCompanyWidget;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';
import 'package:provider/provider.dart';

class ModalCompanyModel extends FlutterFlowModel<ModalCompanyWidget> {
  ///  Local state fields for this component.

  bool newPass = false;

  int? returnAction;

  bool erroSenha = false;

  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  // State field(s) for nameFantasia widget.
  FocusNode? nameFantasiaFocusNode;
  TextEditingController? nameFantasiaTextController;
  String? Function(BuildContext, String?)? nameFantasiaTextControllerValidator;
  String? _nameFantasiaTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'wxr0x9cr' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for razaoSocial widget.
  FocusNode? razaoSocialFocusNode;
  TextEditingController? razaoSocialTextController;
  String? Function(BuildContext, String?)? razaoSocialTextControllerValidator;
  String? _razaoSocialTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'yqnrpysu' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for cnpj widget.
  FocusNode? cnpjFocusNode;
  TextEditingController? cnpjTextController;
  late MaskTextInputFormatter cnpjMask;
  String? Function(BuildContext, String?)? cnpjTextControllerValidator;
  String? _cnpjTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '3f0s8k5u' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for phoneEmpresa widget.
  FocusNode? phoneEmpresaFocusNode;
  TextEditingController? phoneEmpresaTextController;
  late MaskTextInputFormatter phoneEmpresaMask;
  String? Function(BuildContext, String?)? phoneEmpresaTextControllerValidator;
  String? _phoneEmpresaTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'rarjdaba' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for emailEmpresa widget.
  FocusNode? emailEmpresaFocusNode;
  TextEditingController? emailEmpresaTextController;
  String? Function(BuildContext, String?)? emailEmpresaTextControllerValidator;
  String? _emailEmpresaTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'jo3dlxew' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for cep widget.
  FocusNode? cepFocusNode;
  TextEditingController? cepTextController;
  late MaskTextInputFormatter cepMask;
  String? Function(BuildContext, String?)? cepTextControllerValidator;
  String? _cepTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'ai6tyfnh' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // Stores action output result for [Backend Call - API (Get Cep)] action in cep widget.
  ApiCallResponse? apiCep;
  // State field(s) for numero widget.
  FocusNode? numeroFocusNode;
  TextEditingController? numeroTextController;
  String? Function(BuildContext, String?)? numeroTextControllerValidator;
  String? _numeroTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'h0ssusuz' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for logradouro widget.
  FocusNode? logradouroFocusNode;
  TextEditingController? logradouroTextController;
  String? Function(BuildContext, String?)? logradouroTextControllerValidator;
  String? _logradouroTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '7dj4qlky' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for cidade widget.
  FocusNode? cidadeFocusNode;
  TextEditingController? cidadeTextController;
  String? Function(BuildContext, String?)? cidadeTextControllerValidator;
  String? _cidadeTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'f7glsfpa' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for uf widget.
  FocusNode? ufFocusNode;
  TextEditingController? ufTextController;
  String? Function(BuildContext, String?)? ufTextControllerValidator;
  String? _ufTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'pyscnhjp' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for complemento widget.
  FocusNode? complementoFocusNode;
  TextEditingController? complementoTextController;
  String? Function(BuildContext, String?)? complementoTextControllerValidator;
  // Stores action output result for [Backend Call - API (Edit company)] action in Button widget.
  ApiCallResponse? editCompany;
  bool apiRequestCompleted = false;
  String? apiRequestLastUniqueKey;

  /// Query cache managers for this widget.

  final _companyManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> company({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _companyManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearCompanyCache() => _companyManager.clear();
  void clearCompanyCacheKey(String? uniqueKey) =>
      _companyManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {
    nameFantasiaTextControllerValidator = _nameFantasiaTextControllerValidator;
    razaoSocialTextControllerValidator = _razaoSocialTextControllerValidator;
    cnpjTextControllerValidator = _cnpjTextControllerValidator;
    phoneEmpresaTextControllerValidator = _phoneEmpresaTextControllerValidator;
    emailEmpresaTextControllerValidator = _emailEmpresaTextControllerValidator;
    cepTextControllerValidator = _cepTextControllerValidator;
    numeroTextControllerValidator = _numeroTextControllerValidator;
    logradouroTextControllerValidator = _logradouroTextControllerValidator;
    cidadeTextControllerValidator = _cidadeTextControllerValidator;
    ufTextControllerValidator = _ufTextControllerValidator;
  }

  @override
  void dispose() {
    nameFantasiaFocusNode?.dispose();
    nameFantasiaTextController?.dispose();

    razaoSocialFocusNode?.dispose();
    razaoSocialTextController?.dispose();

    cnpjFocusNode?.dispose();
    cnpjTextController?.dispose();

    phoneEmpresaFocusNode?.dispose();
    phoneEmpresaTextController?.dispose();

    emailEmpresaFocusNode?.dispose();
    emailEmpresaTextController?.dispose();

    cepFocusNode?.dispose();
    cepTextController?.dispose();

    numeroFocusNode?.dispose();
    numeroTextController?.dispose();

    logradouroFocusNode?.dispose();
    logradouroTextController?.dispose();

    cidadeFocusNode?.dispose();
    cidadeTextController?.dispose();

    ufFocusNode?.dispose();
    ufTextController?.dispose();

    complementoFocusNode?.dispose();
    complementoTextController?.dispose();

    /// Dispose query cache managers for this widget.

    clearCompanyCache();
  }

  /// Additional helper methods.
  Future waitForApiRequestCompleted({
    double minWait = 0,
    double maxWait = double.infinity,
  }) async {
    final stopwatch = Stopwatch()..start();
    while (true) {
      await Future.delayed(Duration(milliseconds: 50));
      final timeElapsed = stopwatch.elapsedMilliseconds;
      final requestComplete = apiRequestCompleted;
      if (timeElapsed > maxWait || (requestComplete && timeElapsed > minWait)) {
        break;
      }
    }
  }
}
