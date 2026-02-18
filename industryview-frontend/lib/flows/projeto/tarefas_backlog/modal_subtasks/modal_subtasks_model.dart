import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'modal_subtasks_widget.dart' show ModalSubtasksWidget;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalSubtasksModel extends FlutterFlowModel<ModalSubtasksWidget> {
  ///  Local state fields for this component.

  bool trackers = true;

  bool estacas = false;

  bool modulos = false;

  String? tipoTarefa;

  int? id;

  EquipamentsTypeStruct? equipaments;
  void updateEquipamentsStruct(Function(EquipamentsTypeStruct) updateFn) {
    updateFn(equipaments ??= EquipamentsTypeStruct());
  }

  bool erro1 = false;

  bool erro2 = false;

  double totalCriacao = 0.0;

  bool erro3 = false;

  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  // State field(s) for description widget.
  FocusNode? descriptionFocusNode1;
  TextEditingController? descriptionTextController1;
  String? Function(BuildContext, String?)? descriptionTextController1Validator;
  String? _descriptionTextController1Validator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'viyvjlhy' /* * Campo obrigatório */,
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
        'ahgu2q2j' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for description widget.
  FocusNode? descriptionFocusNode2;
  TextEditingController? descriptionTextController2;
  String? Function(BuildContext, String?)? descriptionTextController2Validator;
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

  /// Query cache managers for this widget.

  final _criarTarefaManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> criarTarefa({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _criarTarefaManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearCriarTarefaCache() => _criarTarefaManager.clear();
  void clearCriarTarefaCacheKey(String? uniqueKey) =>
      _criarTarefaManager.clearRequest(uniqueKey);

  final _countsSubtasksManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> countsSubtasks({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _countsSubtasksManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearCountsSubtasksCache() => _countsSubtasksManager.clear();
  void clearCountsSubtasksCacheKey(String? uniqueKey) =>
      _countsSubtasksManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {
    descriptionTextController1Validator = _descriptionTextController1Validator;
    weightTextControllerValidator = _weightTextControllerValidator;
  }

  @override
  void dispose() {
    descriptionFocusNode1?.dispose();
    descriptionTextController1?.dispose();

    weightFocusNode?.dispose();
    weightTextController?.dispose();

    descriptionFocusNode2?.dispose();
    descriptionTextController2?.dispose();

    tasksQuantityFocusNode?.dispose();
    tasksQuantityTextController?.dispose();

    /// Dispose query cache managers for this widget.

    clearCriarTarefaCache();

    clearCountsSubtasksCache();
  }
}
