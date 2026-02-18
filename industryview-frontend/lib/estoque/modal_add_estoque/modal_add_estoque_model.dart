import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flows/modulos/drop_manufactures/drop_manufactures_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'modal_add_estoque_widget.dart' show ModalAddEstoqueWidget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalAddEstoqueModel extends FlutterFlowModel<ModalAddEstoqueWidget> {
  ///  Local state fields for this component.

  bool drop1 = false;

  bool drop2 = false;

  bool drop3 = false;

  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  // State field(s) for txtProduto widget.
  FocusNode? txtProdutoFocusNode;
  TextEditingController? txtProdutoTextController;
  String? Function(BuildContext, String?)? txtProdutoTextControllerValidator;
  String? _txtProdutoTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '6hnreg28' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for dropCategoria widget.
  int? dropCategoriaValue;
  FormFieldController<int>? dropCategoriaValueController;
  // State field(s) for dropUnidade widget.
  int? dropUnidadeValue;
  FormFieldController<int>? dropUnidadeValueController;
  // State field(s) for txtQtdMin widget.
  FocusNode? txtQtdMinFocusNode;
  TextEditingController? txtQtdMinTextController;
  String? Function(BuildContext, String?)? txtQtdMinTextControllerValidator;
  String? _txtQtdMinTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'ezps2044' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for txtQtdAtual widget.
  FocusNode? txtQtdAtualFocusNode;
  TextEditingController? txtQtdAtualTextController;
  String? Function(BuildContext, String?)? txtQtdAtualTextControllerValidator;
  String? _txtQtdAtualTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'z6pwbv2s' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for txtEspecificacao widget.
  FocusNode? txtEspecificacaoFocusNode;
  TextEditingController? txtEspecificacaoTextController;
  String? Function(BuildContext, String?)?
      txtEspecificacaoTextControllerValidator;
  String? _txtEspecificacaoTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '9kgo5phc' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // Stores action output result for [Validate Form] action in Button widget.
  bool? form1;
  // Stores action output result for [Backend Call - API (Add product to inventory)] action in Button widget.
  ApiCallResponse? apiResultzi2;
  // Stores action output result for [Backend Call - API (Edit product inventory)] action in Button widget.
  ApiCallResponse? editProduct;

  /// Query cache managers for this widget.

  final _unityManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> unity({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _unityManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearUnityCache() => _unityManager.clear();
  void clearUnityCacheKey(String? uniqueKey) =>
      _unityManager.clearRequest(uniqueKey);

  final _equipamentsTypeManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> equipamentsType({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _equipamentsTypeManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearEquipamentsTypeCache() => _equipamentsTypeManager.clear();
  void clearEquipamentsTypeCacheKey(String? uniqueKey) =>
      _equipamentsTypeManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {
    txtProdutoTextControllerValidator = _txtProdutoTextControllerValidator;
    txtQtdMinTextControllerValidator = _txtQtdMinTextControllerValidator;
    txtQtdAtualTextControllerValidator = _txtQtdAtualTextControllerValidator;
    txtEspecificacaoTextControllerValidator =
        _txtEspecificacaoTextControllerValidator;
  }

  @override
  void dispose() {
    txtProdutoFocusNode?.dispose();
    txtProdutoTextController?.dispose();

    txtQtdMinFocusNode?.dispose();
    txtQtdMinTextController?.dispose();

    txtQtdAtualFocusNode?.dispose();
    txtQtdAtualTextController?.dispose();

    txtEspecificacaoFocusNode?.dispose();
    txtEspecificacaoTextController?.dispose();

    /// Dispose query cache managers for this widget.

    clearUnityCache();

    clearEquipamentsTypeCache();
  }
}
