import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'empresa_widget.dart' show EmpresaWidget;
import 'package:aligned_tooltip/aligned_tooltip.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';
import 'package:provider/provider.dart';

class EmpresaModel extends FlutterFlowModel<EmpresaWidget> {
  ///  Local state fields for this page.

  int? varReturnAction;

  bool erroSenha = false;

  int page = 1;

  bool cepset = false;

  ///  State fields for stateful widgets in this page.

  final formKey = GlobalKey<FormState>();
  // State field(s) for nameFantasia widget.
  FocusNode? nameFantasiaFocusNode;
  TextEditingController? nameFantasiaTextController;
  String? Function(BuildContext, String?)? nameFantasiaTextControllerValidator;
  String? _nameFantasiaTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'dyild28s' /* * Campo é obrigatório. */,
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
        'zmdfoaxd' /* * Campo é obrigatório. */,
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
        '3dcysjdf' /* * Campo é obrigatório. */,
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
        'qd4lrc7i' /* * Campo é obrigatório. */,
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
        '6xvayywf' /* * Campo é obrigatório. */,
      );
    }

    if (!RegExp(kTextValidatorEmailRegex).hasMatch(val)) {
      return FFLocalizations.of(context).getText(
        'bbmpbxgh' /* Digite um email valido. */,
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
        '2ok9xs8h' /* * Campo é obrigatório. */,
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
        'eb0wk4u8' /* * Campo é obrigatório. */,
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
        '25np0hdg' /* * Campo é obrigatório. */,
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
        'cta1fvp8' /* * Campo é obrigatório. */,
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
        '0phbpyxj' /* * Campo é obrigatório. */,
      );
    }

    return null;
  }

  // State field(s) for complemento widget.
  FocusNode? complementoFocusNode;
  TextEditingController? complementoTextController;
  String? Function(BuildContext, String?)? complementoTextControllerValidator;
  // Stores action output result for [Backend Call - API (Creat company)] action in Button widget.
  ApiCallResponse? creatCompany;

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
  }
}
