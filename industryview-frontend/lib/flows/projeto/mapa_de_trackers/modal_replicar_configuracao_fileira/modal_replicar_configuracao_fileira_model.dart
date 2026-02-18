import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import 'dart:async';
import 'modal_replicar_configuracao_fileira_widget.dart'
    show ModalReplicarConfiguracaoFileiraWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalReplicarConfiguracaoFileiraModel
    extends FlutterFlowModel<ModalReplicarConfiguracaoFileiraWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for Checkbox12 widget.
  bool? checkbox12Value;
  bool apiRequestCompleted = false;
  String? apiRequestLastUniqueKey;
  // State field(s) for Checkbox widget.
  Map<dynamic, bool> checkboxValueMap = {};
  List<dynamic> get checkboxCheckedItems =>
      checkboxValueMap.entries.where((e) => e.value).map((e) => e.key).toList();

  /// Query cache managers for this widget.

  final _replicaEstacasManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> replicaEstacas({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _replicaEstacasManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearReplicaEstacasCache() => _replicaEstacasManager.clear();
  void clearReplicaEstacasCacheKey(String? uniqueKey) =>
      _replicaEstacasManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    /// Dispose query cache managers for this widget.

    clearReplicaEstacasCache();
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
