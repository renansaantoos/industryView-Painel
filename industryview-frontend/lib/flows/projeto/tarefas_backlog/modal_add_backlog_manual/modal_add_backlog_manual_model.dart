import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_confirm/modal_confirm_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'modal_add_backlog_manual_widget.dart' show ModalAddBacklogManualWidget;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalAddBacklogManualModel
    extends FlutterFlowModel<ModalAddBacklogManualWidget> {
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

  bool erro3 = false;

  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  // State field(s) for description widget.
  FocusNode? descriptionFocusNode;
  TextEditingController? descriptionTextController;
  String? Function(BuildContext, String?)? descriptionTextControllerValidator;
  String? _descriptionTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'xwqriu73' /* Campo obrigatório */,
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
        'vys1gh46' /* Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for DropDown widget.
  int? dropDownValue;
  FormFieldController<int>? dropDownValueController;
  // State field(s) for quantity widget.
  FocusNode? quantityFocusNode;
  TextEditingController? quantityTextController;
  String? Function(BuildContext, String?)? quantityTextControllerValidator;
  // State field(s) for dropDiscipline widget.
  int? dropDisciplineValue;
  FormFieldController<int>? dropDisciplineValueController;
  // State field(s) for tasks_quantity widget.
  FocusNode? tasksQuantityFocusNode;
  TextEditingController? tasksQuantityTextController;
  String? Function(BuildContext, String?)? tasksQuantityTextControllerValidator;
  // Stores action output result for [Validate Form] action in Button widget.
  bool? form1;
  // Stores action output result for [Backend Call - API (Edit task backlog)] action in Button widget.
  ApiCallResponse? addManualEdit;
  // Stores action output result for [Backend Call - API (Add tasks backlog manual)] action in Button widget.
  ApiCallResponse? addManualCreat;

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

  final _componeneUnityManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> componeneUnity({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _componeneUnityManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearComponeneUnityCache() => _componeneUnityManager.clear();
  void clearComponeneUnityCacheKey(String? uniqueKey) =>
      _componeneUnityManager.clearRequest(uniqueKey);

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

    clearCriarTarefaCache();

    clearComponeneUnityCache();

    clearDisciplineCache();
  }
}
