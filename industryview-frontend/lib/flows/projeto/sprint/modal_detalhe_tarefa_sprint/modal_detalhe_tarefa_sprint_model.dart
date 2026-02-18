import '/backend/api_requests/api_calls.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/components/modal_empty_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'dart:async';
import 'modal_detalhe_tarefa_sprint_widget.dart'
    show ModalDetalheTarefaSprintWidget;
import 'package:aligned_tooltip/aligned_tooltip.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalDetalheTarefaSprintModel
    extends FlutterFlowModel<ModalDetalheTarefaSprintWidget> {
  ///  Local state fields for this component.
  /// page = 1 é a pagina de detalhe / page = 2 é a pagina de criação de
  /// subtarefa / page = 3 é a pagina de edição da subtarefa.
  int page = 1;

  bool erro1 = false;

  bool erro2 = false;

  int? drop;

  bool? template = false;

  List<dynamic> listSubtasks = [];
  void addToListSubtasks(dynamic item) => listSubtasks.add(item);
  void removeFromListSubtasks(dynamic item) => listSubtasks.remove(item);
  void removeAtIndexFromListSubtasks(int index) => listSubtasks.removeAt(index);
  void insertAtIndexInListSubtasks(int index, dynamic item) =>
      listSubtasks.insert(index, item);
  void updateListSubtasksAtIndex(int index, Function(dynamic) updateFn) =>
      listSubtasks[index] = updateFn(listSubtasks[index]);

  int? subtaskID;

  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  // Stores action output result for [Backend Call - API (Get subtasks)] action in modal_detalhe_tarefa_sprint widget.
  ApiCallResponse? getSubtasks;
  // Stores action output result for [Backend Call - API (Delete sprints_tasks record.)] action in Button widget.
  ApiCallResponse? deleteTaskSprint;
  bool apiRequestCompleted2 = false;
  String? apiRequestLastUniqueKey2;
  bool apiRequestCompleted1 = false;
  String? apiRequestLastUniqueKey1;
  bool apiRequestCompleted3 = false;
  String? apiRequestLastUniqueKey3;
  // State field(s) for description widget.
  FocusNode? descriptionFocusNode;
  TextEditingController? descriptionTextController;
  String? Function(BuildContext, String?)? descriptionTextControllerValidator;
  String? _descriptionTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'hfvmlg6r' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for weight widget.
  FocusNode? weightFocusNode;
  TextEditingController? weightTextController;
  String? Function(BuildContext, String?)? weightTextControllerValidator;
  String? _weightTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '4fhitiez' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for quantity widget.
  FocusNode? quantityFocusNode;
  TextEditingController? quantityTextController;
  String? Function(BuildContext, String?)? quantityTextControllerValidator;
  // State field(s) for tasks_quantity widget.
  FocusNode? tasksQuantityFocusNode;
  TextEditingController? tasksQuantityTextController;
  String? Function(BuildContext, String?)? tasksQuantityTextControllerValidator;
  // Stores action output result for [Validate Form] action in Button widget.
  bool? form1;
  // Stores action output result for [Backend Call - API (add subtasks)] action in Button widget.
  ApiCallResponse? addSubtaskCreat;
  // Stores action output result for [Backend Call - API (Edit subtasks)] action in Button widget.
  ApiCallResponse? addSubtasksEdit;
  // Stores action output result for [Backend Call - API (Get subtasks)] action in Button widget.
  ApiCallResponse? getSubtasksRefresh;

  /// Query cache managers for this widget.

  final _commentSubtasksManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> commentSubtasks({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _commentSubtasksManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearCommentSubtasksCache() => _commentSubtasksManager.clear();
  void clearCommentSubtasksCacheKey(String? uniqueKey) =>
      _commentSubtasksManager.clearRequest(uniqueKey);

  final _backlogManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> backlog({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _backlogManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearBacklogCache() => _backlogManager.clear();
  void clearBacklogCacheKey(String? uniqueKey) =>
      _backlogManager.clearRequest(uniqueKey);

  final _commentBacklogsManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> commentBacklogs({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _commentBacklogsManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearCommentBacklogsCache() => _commentBacklogsManager.clear();
  void clearCommentBacklogsCacheKey(String? uniqueKey) =>
      _commentBacklogsManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {
    descriptionTextControllerValidator = _descriptionTextControllerValidator;
    weightTextControllerValidator = _weightTextControllerValidator;
  }

  @override
  void dispose() {
    descriptionFocusNode?.dispose();
    descriptionTextController?.dispose();

    weightFocusNode?.dispose();
    weightTextController?.dispose();

    quantityFocusNode?.dispose();
    quantityTextController?.dispose();

    tasksQuantityFocusNode?.dispose();
    tasksQuantityTextController?.dispose();

    /// Dispose query cache managers for this widget.

    clearCommentSubtasksCache();

    clearBacklogCache();

    clearCommentBacklogsCache();
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
      final requestComplete = apiRequestCompleted2;
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

  Future waitForApiRequestCompleted3({
    double minWait = 0,
    double maxWait = double.infinity,
  }) async {
    final stopwatch = Stopwatch()..start();
    while (true) {
      await Future.delayed(Duration(milliseconds: 50));
      final timeElapsed = stopwatch.elapsedMilliseconds;
      final requestComplete = apiRequestCompleted3;
      if (timeElapsed > maxWait || (requestComplete && timeElapsed > minWait)) {
        break;
      }
    }
  }
}
