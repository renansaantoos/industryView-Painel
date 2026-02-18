import '/backend/api_requests/api_calls.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/request_manager.dart';
import 'drop_unity_widget.dart' show DropUnityWidget;
import 'package:flutter/material.dart';

class DropUnityModel extends FlutterFlowModel<DropUnityWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for searchDropUnity widget.
  FocusNode? searchDropUnityFocusNode;
  TextEditingController? searchDropUnityTextController;
  String? Function(BuildContext, String?)?
      searchDropUnityTextControllerValidator;
  bool apiRequestCompleted = false;
  String? apiRequestLastUniqueKey;

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

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    searchDropUnityFocusNode?.dispose();
    searchDropUnityTextController?.dispose();

    /// Dispose query cache managers for this widget.

    clearUnityCache();
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
