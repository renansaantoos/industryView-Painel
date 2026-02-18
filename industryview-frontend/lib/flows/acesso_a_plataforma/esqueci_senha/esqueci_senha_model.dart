import '/backend/api_requests/api_calls.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/index.dart';
import 'esqueci_senha_widget.dart' show EsqueciSenhaWidget;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class EsqueciSenhaModel extends FlutterFlowModel<EsqueciSenhaWidget> {
  ///  Local state fields for this page.

  int? step = 0;

  int? varReturnAction;

  bool erroSenha = false;

  ///  State fields for stateful widgets in this page.

  final formKey3 = GlobalKey<FormState>();
  final formKey1 = GlobalKey<FormState>();
  final formKey2 = GlobalKey<FormState>();
  // State field(s) for emailAddress widget.
  FocusNode? emailAddressFocusNode;
  TextEditingController? emailAddressTextController;
  String? Function(BuildContext, String?)? emailAddressTextControllerValidator;
  String? _emailAddressTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'kkkovoeo' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // Stores action output result for [Backend Call - API (api para mandar o codigo de recuperacao para o email)] action in Button widget.
  ApiCallResponse? aPiRequestCode;
  // State field(s) for code widget.
  FocusNode? codeFocusNode;
  TextEditingController? codeTextController;
  String? Function(BuildContext, String?)? codeTextControllerValidator;
  String? _codeTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'qlqlvlvj' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // Stores action output result for [Backend Call - API (Acao de validar codigo para a alteracao de senha)] action in Button widget.
  ApiCallResponse? aPiValidateCode;
  // State field(s) for password widget.
  FocusNode? passwordFocusNode1;
  TextEditingController? passwordTextController1;
  late bool passwordVisibility1;
  String? Function(BuildContext, String?)? passwordTextController1Validator;
  String? _passwordTextController1Validator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'hotycmmh' /* *Campo obrigatório */,
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
        'jz5rzni0' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // Stores action output result for [Backend Call - API (api para resetar a senha do usuario com uma nova senha)] action in Button widget.
  ApiCallResponse? aPiResetPass;

  @override
  void initState(BuildContext context) {
    emailAddressTextControllerValidator = _emailAddressTextControllerValidator;
    codeTextControllerValidator = _codeTextControllerValidator;
    passwordVisibility1 = false;
    passwordTextController1Validator = _passwordTextController1Validator;
    passwordVisibility2 = false;
    passwordTextController2Validator = _passwordTextController2Validator;
  }

  @override
  void dispose() {
    emailAddressFocusNode?.dispose();
    emailAddressTextController?.dispose();

    codeFocusNode?.dispose();
    codeTextController?.dispose();

    passwordFocusNode1?.dispose();
    passwordTextController1?.dispose();

    passwordFocusNode2?.dispose();
    passwordTextController2?.dispose();
  }
}
