import '/backend/api_requests/api_calls.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/request_manager.dart';
import 'drop_discipline_widget.dart' show DropDisciplineWidget;
import 'package:flutter/material.dart';

class DropDisciplineModel extends FlutterFlowModel<DropDisciplineWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for searchDropDiscipline widget.
  FocusNode? searchDropDisciplineFocusNode;
  TextEditingController? searchDropDisciplineTextController;
  String? Function(BuildContext, String?)?
      searchDropDisciplineTextControllerValidator;
  bool apiRequestCompleted = false;
  String? apiRequestLastUniqueKey;

  /// Query cache managers for this widget.

  final _disciplineManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> discipline({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _disciplineManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearDisciplineCache() => _disciplineManager.clear();
  void clearDisciplineCacheKey(String? uniqueKey) =>
      _disciplineManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    searchDropDisciplineFocusNode?.dispose();
    searchDropDisciplineTextController?.dispose();

    /// Dispose query cache managers for this widget.

    clearDisciplineCache();
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
