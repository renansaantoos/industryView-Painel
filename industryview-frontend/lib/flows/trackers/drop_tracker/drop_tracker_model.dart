import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_criar_tipos_f_m_t_widget.dart';
import '/flows/modulos/info_drop/info_drop_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import 'dart:async';
import 'drop_tracker_widget.dart' show DropTrackerWidget;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class DropTrackerModel extends FlutterFlowModel<DropTrackerWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for searchDropTracker widget.
  FocusNode? searchDropTrackerFocusNode;
  TextEditingController? searchDropTrackerTextController;
  String? Function(BuildContext, String?)?
      searchDropTrackerTextControllerValidator;
  bool apiRequestCompleted = false;
  String? apiRequestLastUniqueKey;

  /// Query cache managers for this widget.

  final _dropManufacturersManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> dropManufacturers({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _dropManufacturersManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearDropManufacturersCache() => _dropManufacturersManager.clear();
  void clearDropManufacturersCacheKey(String? uniqueKey) =>
      _dropManufacturersManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    searchDropTrackerFocusNode?.dispose();
    searchDropTrackerTextController?.dispose();

    /// Dispose query cache managers for this widget.

    clearDropManufacturersCache();
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
