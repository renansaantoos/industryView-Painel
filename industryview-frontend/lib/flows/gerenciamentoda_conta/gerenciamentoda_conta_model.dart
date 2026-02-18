import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/flutter_flow/flutter_flow_button_tabbar.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/upload_data.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'dart:async';
import 'gerenciamentoda_conta_widget.dart' show GerenciamentodaContaWidget;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';
import 'package:provider/provider.dart';

class GerenciamentodaContaModel
    extends FlutterFlowModel<GerenciamentodaContaWidget> {
  ///  Local state fields for this page.

  int page = 1;

  int perPage = 10;

  bool newPass = false;

  int? returnAction;

  bool erroSenha = false;

  bool plan = false;

  ///  State fields for stateful widgets in this page.

  final formKey2 = GlobalKey<FormState>();
  final formKey1 = GlobalKey<FormState>();
  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token )] action in GerenciamentodaConta widget.
  ApiCallResponse? aPiTokenAuth;
  // Model for navBar component.
  late NavBarModel navBarModel;
  // State field(s) for TabBar widget.
  TabController? tabBarController;
  int get tabBarCurrentIndex =>
      tabBarController != null ? tabBarController!.index : 0;
  int get tabBarPreviousIndex =>
      tabBarController != null ? tabBarController!.previousIndex : 0;

  bool isDataUploading_uploadDataPv = false;
  FFUploadedFile uploadedLocalFile_uploadDataPv =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');

  // State field(s) for name widget.
  FocusNode? nameFocusNode;
  TextEditingController? nameTextController;
  String? Function(BuildContext, String?)? nameTextControllerValidator;
  String? _nameTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'gaxfq4uj' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for Telefone widget.
  FocusNode? telefoneFocusNode;
  TextEditingController? telefoneTextController;
  late MaskTextInputFormatter telefoneMask;
  String? Function(BuildContext, String?)? telefoneTextControllerValidator;
  String? _telefoneTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'u38wfd36' /* * Campo obrigatório */,
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
        'wygqed55' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for password widget.
  FocusNode? passwordFocusNode1;
  TextEditingController? passwordTextController1;
  late bool passwordVisibility1;
  String? Function(BuildContext, String?)? passwordTextController1Validator;
  // Stores action output result for [Custom Action - actVerificaSenha] action in password widget.
  int? returnActionPass;
  // State field(s) for password widget.
  FocusNode? passwordFocusNode2;
  TextEditingController? passwordTextController2;
  late bool passwordVisibility2;
  String? Function(BuildContext, String?)? passwordTextController2Validator;
  // Stores action output result for [Backend Call - API (Change password)] action in Button widget.
  ApiCallResponse? aPiResetPass;
  // Stores action output result for [Backend Call - API (Patch users)] action in Button widget.
  ApiCallResponse? aPiAttUser;
  // Stores action output result for [Backend Call - API (Get user)] action in Button widget.
  ApiCallResponse? aPiGetUser;
  // State field(s) for nameFantasia widget.
  FocusNode? nameFantasiaFocusNode;
  TextEditingController? nameFantasiaTextController;
  String? Function(BuildContext, String?)? nameFantasiaTextControllerValidator;
  String? _nameFantasiaTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '3ol2hxcq' /* * Campo obrigatório */,
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
        'fyqea1zl' /* * Campo obrigatório */,
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
        '9f9i8urz' /* * Campo obrigatório */,
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
        'q9bdw03r' /* * Campo obrigatório */,
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
        'ehwhzky0' /* * Campo obrigatório */,
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
        '6ak7g4zo' /* * Campo obrigatório */,
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
        'tbngnc5u' /* * Campo obrigatório */,
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
        'ab5vd0mn' /* * Campo obrigatório */,
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
        'q7fqm7tt' /* * Campo obrigatório */,
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
        '2o0bpw5f' /* * Campo obrigatório */,
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
    navBarModel = createModel(context, () => NavBarModel());
    nameTextControllerValidator = _nameTextControllerValidator;
    telefoneTextControllerValidator = _telefoneTextControllerValidator;
    emailAddressTextControllerValidator = _emailAddressTextControllerValidator;
    passwordVisibility1 = false;
    passwordVisibility2 = false;
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
    navBarModel.dispose();
    tabBarController?.dispose();
    nameFocusNode?.dispose();
    nameTextController?.dispose();

    telefoneFocusNode?.dispose();
    telefoneTextController?.dispose();

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
