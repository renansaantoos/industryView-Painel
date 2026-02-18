import '/backend/api_requests/api_calls.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/upload_data.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/index.dart';
import 'cadastro_widget.dart' show CadastroWidget;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';
import 'package:provider/provider.dart';

class CadastroModel extends FlutterFlowModel<CadastroWidget> {
  ///  Local state fields for this page.

  int? varReturnAction;

  bool erroSenha = false;

  int page = 1;

  bool cepset = false;

  ///  State fields for stateful widgets in this page.

  final formKey2 = GlobalKey<FormState>();
  final formKey1 = GlobalKey<FormState>();
  bool isDataUploading_uploadDataPvj = false;
  FFUploadedFile uploadedLocalFile_uploadDataPvj =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');

  // State field(s) for name widget.
  FocusNode? nameFocusNode;
  TextEditingController? nameTextController;
  String? Function(BuildContext, String?)? nameTextControllerValidator;
  String? _nameTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'k3691911' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for phone widget.
  FocusNode? phoneFocusNode;
  TextEditingController? phoneTextController;
  late MaskTextInputFormatter phoneMask;
  String? Function(BuildContext, String?)? phoneTextControllerValidator;
  String? _phoneTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'hnifvd6q' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for emailAddress widget.
  FocusNode? emailAddressFocusNode;
  TextEditingController? emailAddressTextController;
  String? Function(BuildContext, String?)? emailAddressTextControllerValidator;
  String? _emailAddressTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '0hwpbmgw' /* * Campo obrigatório */,
      );
    }

    if (!RegExp(kTextValidatorEmailRegex).hasMatch(val)) {
      return FFLocalizations.of(context).getText(
        'jdrpixrq' /* Digite um email valido. */,
      );
    }
    return null;
  }

  // State field(s) for password widget.
  FocusNode? passwordFocusNode1;
  TextEditingController? passwordTextController1;
  late bool passwordVisibility1;
  String? Function(BuildContext, String?)? passwordTextController1Validator;
  String? _passwordTextController1Validator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'bacnhicl' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // Stores action output result for [Custom Action - actVerificaSenha] action in password widget.
  int? returnAction;
  // State field(s) for password widget.
  FocusNode? passwordFocusNode2;
  TextEditingController? passwordTextController2;
  late bool passwordVisibility2;
  String? Function(BuildContext, String?)? passwordTextController2Validator;
  String? _passwordTextController2Validator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '157gk7ux' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // Stores action output result for [Backend Call - API (Signup and retrieve an authentication token )] action in Button widget.
  ApiCallResponse? aPiCreatAccount;
  // State field(s) for nameFantasia widget.
  FocusNode? nameFantasiaFocusNode;
  TextEditingController? nameFantasiaTextController;
  String? Function(BuildContext, String?)? nameFantasiaTextControllerValidator;
  String? _nameFantasiaTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '5tcd8p4c' /* * Campo é obrigatório. */,
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
        'pu1q07zh' /* * Campo é obrigatório. */,
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
        'bwq005ke' /* * Campo é obrigatório. */,
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
        'zwn5ujtu' /* * Campo é obrigatório. */,
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
        '33qjudpl' /* * Campo é obrigatório. */,
      );
    }

    if (!RegExp(kTextValidatorEmailRegex).hasMatch(val)) {
      return FFLocalizations.of(context).getText(
        '1aq44bwk' /* Digite um email valido. */,
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
        'g2ve8357' /* * Campo é obrigatório. */,
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
        '7ywhs97i' /* * Campo é obrigatório. */,
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
        'yqpkdm0y' /* * Campo é obrigatório. */,
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
        'bpeccn85' /* * Campo é obrigatório. */,
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
        'zm5ujynw' /* * Campo é obrigatório. */,
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
    nameTextControllerValidator = _nameTextControllerValidator;
    phoneTextControllerValidator = _phoneTextControllerValidator;
    emailAddressTextControllerValidator = _emailAddressTextControllerValidator;
    passwordVisibility1 = false;
    passwordTextController1Validator = _passwordTextController1Validator;
    passwordVisibility2 = false;
    passwordTextController2Validator = _passwordTextController2Validator;
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
    nameFocusNode?.dispose();
    nameTextController?.dispose();

    phoneFocusNode?.dispose();
    phoneTextController?.dispose();

    emailAddressFocusNode?.dispose();
    emailAddressTextController?.dispose();

    passwordFocusNode1?.dispose();
    passwordTextController1?.dispose();

    passwordFocusNode2?.dispose();
    passwordTextController2?.dispose();

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
