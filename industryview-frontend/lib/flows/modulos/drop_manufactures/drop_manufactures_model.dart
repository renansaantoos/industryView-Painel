import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_criar_tipos_f_m_t_widget.dart';
import '/components/modal_empty_widget.dart';
import '/flows/modulos/info_drop/info_drop_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import 'dart:async';
import 'drop_manufactures_widget.dart' show DropManufacturesWidget;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class DropManufacturesModel extends FlutterFlowModel<DropManufacturesWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for searchDropManufacturers widget.
  FocusNode? searchDropManufacturersFocusNode;
  TextEditingController? searchDropManufacturersTextController;
  String? Function(BuildContext, String?)?
      searchDropManufacturersTextControllerValidator;
  bool apiRequestCompleted = false;
  String? apiRequestLastUniqueKey;

  /// Query cache managers for this widget.

  final _manufacturesManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> manufactures({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _manufacturesManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearManufacturesCache() => _manufacturesManager.clear();
  void clearManufacturesCacheKey(String? uniqueKey) =>
      _manufacturesManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    searchDropManufacturersFocusNode?.dispose();
    searchDropManufacturersTextController?.dispose();

    /// Dispose query cache managers for this widget.

    clearManufacturesCache();
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
