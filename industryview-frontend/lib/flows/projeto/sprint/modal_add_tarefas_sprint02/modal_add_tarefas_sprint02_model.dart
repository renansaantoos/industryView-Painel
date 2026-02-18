import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_confirm/modal_confirm_widget.dart';
import '/components/modal_empty_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flows/projeto/gestao_de_equipe/filtro_equipe/filtro_equipe_widget.dart';
import '/flows/projeto/sprint/modal_add_tarefas_sprint01/modal_add_tarefas_sprint01_widget.dart';
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
import 'dart:async';
import 'modal_add_tarefas_sprint02_widget.dart'
    show ModalAddTarefasSprint02Widget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalAddTarefasSprint02Model
    extends FlutterFlowModel<ModalAddTarefasSprint02Widget> {
  ///  Local state fields for this component.

  List<int> campIds = [];
  void addToCampIds(int item) => campIds.add(item);
  void removeFromCampIds(int item) => campIds.remove(item);
  void removeAtIndexFromCampIds(int index) => campIds.removeAt(index);
  void insertAtIndexInCampIds(int index, int item) =>
      campIds.insert(index, item);
  void updateCampIdsAtIndex(int index, Function(int) updateFn) =>
      campIds[index] = updateFn(campIds[index]);

  int perPage = 10;

  int page = 1;

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

  List<int> subtaskMostrar = [];
  void addToSubtaskMostrar(int item) => subtaskMostrar.add(item);
  void removeFromSubtaskMostrar(int item) => subtaskMostrar.remove(item);
  void removeAtIndexFromSubtaskMostrar(int index) =>
      subtaskMostrar.removeAt(index);
  void insertAtIndexInSubtaskMostrar(int index, int item) =>
      subtaskMostrar.insert(index, item);
  void updateSubtaskMostrarAtIndex(int index, Function(int) updateFn) =>
      subtaskMostrar[index] = updateFn(subtaskMostrar[index]);

  List<int> adcSubtaskSprint = [];
  void addToAdcSubtaskSprint(int item) => adcSubtaskSprint.add(item);
  void removeFromAdcSubtaskSprint(int item) => adcSubtaskSprint.remove(item);
  void removeAtIndexFromAdcSubtaskSprint(int index) =>
      adcSubtaskSprint.removeAt(index);
  void insertAtIndexInAdcSubtaskSprint(int index, int item) =>
      adcSubtaskSprint.insert(index, item);
  void updateAdcSubtaskSprintAtIndex(int index, Function(int) updateFn) =>
      adcSubtaskSprint[index] = updateFn(adcSubtaskSprint[index]);

  bool mostracheck = false;

  ///  State fields for stateful widgets in this component.

  // Stores action output result for [Backend Call - API (filtra os campos )] action in modal_AddTarefasSprint02 widget.
  ApiCallResponse? getAllCamposLoad;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  bool apiRequestCompleted3 = false;
  String? apiRequestLastUniqueKey3;
  bool apiRequestCompleted1 = false;
  String? apiRequestLastUniqueKey1;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered = false;
  Completer<ApiCallResponse>? apiRequestCompleter2;
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
  // State field(s) for Checkbox widget.
  bool? checkboxValue;
  // State field(s) for DropDown widget.
  int? dropDownValue;
  FormFieldController<int>? dropDownValueController;
  // Stores action output result for [Backend Call - API (Add sprints_tasks record)] action in Button widget.
  ApiCallResponse? addSprintTask;

  /// Query cache managers for this widget.

  final _addTarefas2Manager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> addTarefas2({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _addTarefas2Manager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearAddTarefas2Cache() => _addTarefas2Manager.clear();
  void clearAddTarefas2CacheKey(String? uniqueKey) =>
      _addTarefas2Manager.clearRequest(uniqueKey);

  final _allIdsManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> allIds({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _allIdsManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearAllIdsCache() => _allIdsManager.clear();
  void clearAllIdsCacheKey(String? uniqueKey) =>
      _allIdsManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    textFieldFocusNode?.dispose();
    textController?.dispose();

    /// Dispose query cache managers for this widget.

    clearAddTarefas2Cache();

    clearAllIdsCache();
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
      final requestComplete = apiRequestCompleter2?.isCompleted ?? false;
      if (timeElapsed > maxWait || (requestComplete && timeElapsed > minWait)) {
        break;
      }
    }
  }
}
