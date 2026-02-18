import '/backend/api_requests/api_calls.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'modal_estoque_qtd_widget.dart' show ModalEstoqueQtdWidget;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalEstoqueQtdModel extends FlutterFlowModel<ModalEstoqueQtdWidget> {
  ///  Local state fields for this component.

  bool erro1 = false;

  bool erro2 = false;

  String? erro1text;

  ///  State fields for stateful widgets in this component.

  // State field(s) for txtProduto widget.
  FocusNode? txtProdutoFocusNode;
  TextEditingController? txtProdutoTextController;
  String? Function(BuildContext, String?)? txtProdutoTextControllerValidator;
  // State field(s) for DropDown widget.
  int? dropDownValue;
  FormFieldController<int>? dropDownValueController;
  // Stores action output result for [Backend Call - API (Add quantity inventory)] action in Button widget.
  ApiCallResponse? addInventory;
  // Stores action output result for [Backend Call - API (Remove quantity inventory)] action in Button widget.
  ApiCallResponse? removeInventory;

  /// Query cache managers for this widget.

  final _allUserManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> allUser({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _allUserManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearAllUserCache() => _allUserManager.clear();
  void clearAllUserCacheKey(String? uniqueKey) =>
      _allUserManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    txtProdutoFocusNode?.dispose();
    txtProdutoTextController?.dispose();

    /// Dispose query cache managers for this widget.

    clearAllUserCache();
  }
}
