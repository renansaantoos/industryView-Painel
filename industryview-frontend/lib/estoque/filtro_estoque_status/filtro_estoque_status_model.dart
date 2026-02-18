import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import 'filtro_estoque_status_widget.dart' show FiltroEstoqueStatusWidget;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class FiltroEstoqueStatusModel
    extends FlutterFlowModel<FiltroEstoqueStatusWidget> {
  ///  Local state fields for this component.

  int? id;

  /// Query cache managers for this widget.

  final _filtroStatusEstoqueManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> filtroStatusEstoque({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _filtroStatusEstoqueManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearFiltroStatusEstoqueCache() => _filtroStatusEstoqueManager.clear();
  void clearFiltroStatusEstoqueCacheKey(String? uniqueKey) =>
      _filtroStatusEstoqueManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    /// Dispose query cache managers for this widget.

    clearFiltroStatusEstoqueCache();
  }
}
