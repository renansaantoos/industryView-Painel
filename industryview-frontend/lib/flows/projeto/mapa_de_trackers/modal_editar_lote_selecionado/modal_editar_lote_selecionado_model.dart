import '/backend/api_requests/api_calls.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'modal_editar_lote_selecionado_widget.dart'
    show ModalEditarLoteSelecionadoWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalEditarLoteSelecionadoModel
    extends FlutterFlowModel<ModalEditarLoteSelecionadoWidget> {
  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  // State field(s) for campo widget.
  FocusNode? campoFocusNode;
  TextEditingController? campoTextController;
  String? Function(BuildContext, String?)? campoTextControllerValidator;
  String? _campoTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'cvo1lib1' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // Stores action output result for [Backend Call - API (Delete fields record.)] action in Button widget.
  ApiCallResponse? deleteField;
  // Stores action output result for [Backend Call - API (Edit fields record)] action in Button widget.
  ApiCallResponse? editField;

  /// Query cache managers for this widget.

  final _editLoteManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> editLote({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _editLoteManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearEditLoteCache() => _editLoteManager.clear();
  void clearEditLoteCacheKey(String? uniqueKey) =>
      _editLoteManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {
    campoTextControllerValidator = _campoTextControllerValidator;
  }

  @override
  void dispose() {
    campoFocusNode?.dispose();
    campoTextController?.dispose();

    /// Dispose query cache managers for this widget.

    clearEditLoteCache();
  }
}
