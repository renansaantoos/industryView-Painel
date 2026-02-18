import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/comp_template_backlog_widget.dart';
import '/components/modal_confirm/modal_confirm_widget.dart';
import '/components/modal_empty_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/flows/projeto/tarefas_backlog/modal_add_backlog_manual/modal_add_backlog_manual_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'dart:async';
import 'modal_add_tarefas_backlog_widget.dart'
    show ModalAddTarefasBacklogWidget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalAddTarefasBacklogModel
    extends FlutterFlowModel<ModalAddTarefasBacklogWidget> {
  ///  Local state fields for this component.
  /// Boleana para controlar visibilidade "mover backog"
  bool moverBacklog = false;

  /// id gerado do backlog
  int? projectId;

  int page = 1;

  int perPage = 10;

  int contador = 0;

  ///  State fields for stateful widgets in this component.

  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  Completer<ApiCallResponse>? apiRequestCompleter2;
  bool apiRequestCompleted1 = false;
  String? apiRequestLastUniqueKey1;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered = false;
  // Stores action output result for [Custom Action - loopTasksList] action in Container widget.
  List<ListaTasksStruct>? taskslist;
  // State field(s) for DropDown widget.
  int? dropDownValue;
  FormFieldController<int>? dropDownValueController;
  // Stores action output result for [Backend Call - API (Add projects backlogs record)] action in Button widget.
  ApiCallResponse? aPiAddBacklog;

  /// Query cache managers for this widget.

  final _queryAllIdsManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> queryAllIds({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _queryAllIdsManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearQueryAllIdsCache() => _queryAllIdsManager.clear();
  void clearQueryAllIdsCacheKey(String? uniqueKey) =>
      _queryAllIdsManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    textFieldFocusNode?.dispose();
    textController?.dispose();

    /// Dispose query cache managers for this widget.

    clearQueryAllIdsCache();
  }

  /// Additional helper methods.
  Future waitForApiRequestCompleted2({
    double minWait = 0,
    double maxWait = double.infinity,
  }) async {
    final stopwatch = Stopwatch()..start();
    while (true) {
      await Future.delayed(Duration(milliseconds: 50));
      final timeElapsed = stopwatch.elapsedMilliseconds;
      final requestComplete = apiRequestCompleter2?.isCompleted ?? false;
      if (timeElapsed > maxWait || (requestComplete && timeElapsed > minWait)) {
        break;
      }
    }
  }

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
}
