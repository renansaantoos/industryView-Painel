import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/filtro_sprint_backlog/filtro_sprint_backlog_widget.dart';
import '/components/modal_empty_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/flows/projeto/tarefas_backlog/modal_add_backlog_manual/modal_add_backlog_manual_widget.dart';
import '/flows/projeto/tarefas_backlog/modal_add_tarefas_backlog/modal_add_tarefas_backlog_widget.dart';
import '/flows/projeto/tarefas_backlog/modal_subtasks/modal_subtasks_widget.dart';
import '/flows/projeto/tarefas_backlog/options_tarefas_projeto/options_tarefas_projeto_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/flutter_flow/custom_functions.dart' as functions;
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'backlog_tarefas_widget.dart' show BacklogTarefasWidget;
import 'dart:async';
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class BacklogTarefasModel extends FlutterFlowModel<BacklogTarefasWidget> {
  ///  Local state fields for this page.

  int page = 1;

  int perPage = 10;

  List<int> campo = [];
  void addToCampo(int item) => campo.add(item);
  void removeFromCampo(int item) => campo.remove(item);
  void removeAtIndexFromCampo(int index) => campo.removeAt(index);
  void insertAtIndexInCampo(int index, int item) => campo.insert(index, item);
  void updateCampoAtIndex(int index, Function(int) updateFn) =>
      campo[index] = updateFn(campo[index]);

  List<int> secao = [];
  void addToSecao(int item) => secao.add(item);
  void removeFromSecao(int item) => secao.remove(item);
  void removeAtIndexFromSecao(int index) => secao.removeAt(index);
  void insertAtIndexInSecao(int index, int item) => secao.insert(index, item);
  void updateSecaoAtIndex(int index, Function(int) updateFn) =>
      secao[index] = updateFn(secao[index]);

  List<int> fileira = [];
  void addToFileira(int item) => fileira.add(item);
  void removeFromFileira(int item) => fileira.remove(item);
  void removeAtIndexFromFileira(int index) => fileira.removeAt(index);
  void insertAtIndexInFileira(int index, int item) =>
      fileira.insert(index, item);
  void updateFileiraAtIndex(int index, Function(int) updateFn) =>
      fileira[index] = updateFn(fileira[index]);

  List<int> tracker = [];
  void addToTracker(int item) => tracker.add(item);
  void removeFromTracker(int item) => tracker.remove(item);
  void removeAtIndexFromTracker(int index) => tracker.removeAt(index);
  void insertAtIndexInTracker(int index, int item) =>
      tracker.insert(index, item);
  void updateTrackerAtIndex(int index, Function(int) updateFn) =>
      tracker[index] = updateFn(tracker[index]);

  List<int> ids = [];
  void addToIds(int item) => ids.add(item);
  void removeFromIds(int item) => ids.remove(item);
  void removeAtIndexFromIds(int index) => ids.removeAt(index);
  void insertAtIndexInIds(int index, int item) => ids.insert(index, item);
  void updateIdsAtIndex(int index, Function(int) updateFn) =>
      ids[index] = updateFn(ids[index]);

  int contador = 0;

  int? subtasks;

  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token )] action in BacklogTarefas widget.
  ApiCallResponse? aPiTokenAuth;
  // Stores action output result for [Backend Call - API (filtra os campos )] action in BacklogTarefas widget.
  ApiCallResponse? getAllCamposLoad;
  // Model for navBar component.
  late NavBarModel navBarModel;
  bool apiRequestCompleted3 = false;
  String? apiRequestLastUniqueKey3;
  bool apiRequestCompleted1 = false;
  String? apiRequestLastUniqueKey1;
  bool apiRequestCompleted2 = false;
  String? apiRequestLastUniqueKey2;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered1 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered2 = false;
  // State field(s) for DropCampo widget.
  List<int>? dropCampoValue;
  FormFieldController<List<int>>? dropCampoValueController;
  // State field(s) for DropSecao widget.
  List<int>? dropSecaoValue;
  FormFieldController<List<int>>? dropSecaoValueController;
  // State field(s) for DropFileira widget.
  List<int>? dropFileiraValue;
  FormFieldController<List<int>>? dropFileiraValueController;
  // State field(s) for DropTracker widget.
  List<int>? dropTrackerValue;
  FormFieldController<List<int>>? dropTrackerValueController;
  // State field(s) for DropDown widget.
  int? dropDownValue;
  FormFieldController<int>? dropDownValueController;

  /// Query cache managers for this widget.

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

  final _filterBacklogManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> filterBacklog({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _filterBacklogManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearFilterBacklogCache() => _filterBacklogManager.clear();
  void clearFilterBacklogCacheKey(String? uniqueKey) =>
      _filterBacklogManager.clearRequest(uniqueKey);

  final _sprintsManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> sprints({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _sprintsManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearSprintsCache() => _sprintsManager.clear();
  void clearSprintsCacheKey(String? uniqueKey) =>
      _sprintsManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
  }

  @override
  void dispose() {
    navBarModel.dispose();
    textFieldFocusNode?.dispose();
    textController?.dispose();

    /// Dispose query cache managers for this widget.

    clearBacklogCache();

    clearFilterBacklogCache();

    clearSprintsCache();
  }

  /// Additional helper methods.
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
