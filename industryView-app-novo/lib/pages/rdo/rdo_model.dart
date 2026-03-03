import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/confirmdialog_r_d_o_widget.dart';
import '/components/empty_widget.dart';
import '/components/loading_copy_widget.dart';
import '/components/modal_sprints_filtro_widget.dart';
import '/components/nav_bar_widget.dart';
import '/core/widgets/app_tab_bar.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/core/utils/custom_functions.dart' as functions;
import '/core/utils/request_manager.dart';

import '/index.dart';
import 'dart:async';
import 'rdo_widget.dart' show RdoWidget;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:provider/provider.dart';

class RdoModel extends PageModel<RdoWidget> {
  ///  Local state fields for this page.

  int page = 1;

  int perPage = 10;

  bool isFinalizedToday = false;

  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token)] action in RDO widget.
  ApiCallResponse? validTokenCopy;
  // Model for NavBar component.
  late NavBarModel navBarModel;
  bool apiRequestCompleted1 = false;
  String? apiRequestLastUniqueKey1;
  bool apiRequestCompleted2 = false;
  String? apiRequestLastUniqueKey2;
  // State field(s) for TabBar widget.
  TabController? tabBarController;
  int get tabBarCurrentIndex =>
      tabBarController != null ? tabBarController!.index : 0;
  int get tabBarPreviousIndex =>
      tabBarController != null ? tabBarController!.previousIndex : 0;

  // Model for empty component.
  late EmptyModel emptyModel1;
  // Model for empty component.
  late EmptyModel emptyModel2;

  /// Query cache managers for this widget.

  final _rdoDiaManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> rdoDia({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _rdoDiaManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearRdoDiaCache() => _rdoDiaManager.clear();
  void clearRdoDiaCacheKey(String? uniqueKey) =>
      _rdoDiaManager.clearRequest(uniqueKey);

  final _tasksSprintsManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> tasksSprints({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _tasksSprintsManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearTasksSprintsCache() => _tasksSprintsManager.clear();
  void clearTasksSprintsCacheKey(String? uniqueKey) =>
      _tasksSprintsManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
    emptyModel1 = createModel(context, () => EmptyModel());
    emptyModel2 = createModel(context, () => EmptyModel());
  }

  @override
  void dispose() {
    navBarModel.dispose();
    tabBarController?.dispose();
    emptyModel1.dispose();
    emptyModel2.dispose();

    /// Dispose query cache managers for this widget.

    clearRdoDiaCache();

    clearTasksSprintsCache();
  }

  /// Additional helper methods.
  Future waitForApiRequestCompleted1({
    double minWait = 0,
    double maxWait = double.infinity,
  }) async {
    final stopwatch = Stopwatch()..start();
    while (true) {
      await Future.delayed(Duration(milliseconds: 50));
      final timeElapsed = stopwatch.elapsedMilliseconds;
      final requestComplete = apiRequestCompleted1;
      if (timeElapsed > maxWait || (requestComplete && timeElapsed > minWait)) {
        break;
      }
    }
  }

  Future waitForApiRequestCompleted2({
    double minWait = 0,
    double maxWait = double.infinity,
  }) async {
    final stopwatch = Stopwatch()..start();
    while (true) {
      await Future.delayed(Duration(milliseconds: 50));
      final timeElapsed = stopwatch.elapsedMilliseconds;
      final requestComplete = apiRequestCompleted2;
      if (timeElapsed > maxWait || (requestComplete && timeElapsed > minWait)) {
        break;
      }
    }
  }
}
