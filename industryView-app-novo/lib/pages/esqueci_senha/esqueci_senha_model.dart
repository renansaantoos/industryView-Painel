import '/backend/api_requests/api_calls.dart';
import '/core/utils/app_utils.dart';
import '/index.dart';
import 'esqueci_senha_widget.dart' show EsqueciSenhaWidget;
import 'package:flutter/material.dart';

class EsqueciSenhaModel extends PageModel<EsqueciSenhaWidget> {
  ///  Local state fields for this page.

  int? stepsEsqueciSenha = 0;

  bool erroSenha = false;

  int? varReturnAction;

  ///  State fields for stateful widgets in this page.

  // State field(s) for emailAddress widget.
  FocusNode? emailAddressFocusNode;
  TextEditingController? emailAddressTextController;
  String? Function(BuildContext, String?)? emailAddressTextControllerValidator;
  // Stores action output result for [Backend Call - API (api para mandar o codigo de recuperacao para o email)] action in Button widget.
  ApiCallResponse? requestCode;
  // State field(s) for codigo widget.
  FocusNode? codigoFocusNode;
  TextEditingController? codigoTextController;
  String? Function(BuildContext, String?)? codigoTextControllerValidator;
  // Stores action output result for [Backend Call - API (Acao de validar codigo para a alteracao de senha)] action in Button widget.
  ApiCallResponse? validateCode;
  // State field(s) for password widget.
  FocusNode? passwordFocusNode1;
  TextEditingController? passwordTextController1;
  late bool passwordVisibility1;
  String? Function(BuildContext, String?)? passwordTextController1Validator;
  // Stores action output result for [Custom Action - actVerificaSenha] action in password widget.
  int? returnAction;
  // State field(s) for password widget.
  FocusNode? passwordFocusNode2;
  TextEditingController? passwordTextController2;
  late bool passwordVisibility2;
  String? Function(BuildContext, String?)? passwordTextController2Validator;
  // Stores action output result for [Backend Call - API (api para resetar a senha do usuario com uma nova senha)] action in Button widget.
  ApiCallResponse? resetPass;

  @override
  void initState(BuildContext context) {
    passwordVisibility1 = false;
    passwordVisibility2 = false;
  }

  @override
  void dispose() {
    emailAddressFocusNode?.dispose();
    emailAddressTextController?.dispose();

    codigoFocusNode?.dispose();
    codigoTextController?.dispose();

    passwordFocusNode1?.dispose();
    passwordTextController1?.dispose();

    passwordFocusNode2?.dispose();
    passwordTextController2?.dispose();
  }
}
