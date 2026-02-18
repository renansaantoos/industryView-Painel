import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'modal_criar_tarefa_widget.dart' show ModalCriarTarefaWidget;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalCriarTarefaModel extends FlutterFlowModel<ModalCriarTarefaWidget> {
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

  bool erroDiscipline = false;

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
        'anj7usqn' /* * Campo obrigatório */,
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
        '9f7n0p8w' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for unity widget.
  int? unityValue;
  FormFieldController<int>? unityValueController;
  // State field(s) for dropDiscipline widget.
  int? dropDisciplineValue;
  FormFieldController<int>? dropDisciplineValueController;
  // Stores action output result for [Validate Form] action in Button widget.
  bool? form;
  // Stores action output result for [Backend Call - API (Add tasks record)] action in Button widget.
  ApiCallResponse? aPiCreatTask;
  // Stores action output result for [Backend Call - API (Edit tasks record)] action in Button widget.
  ApiCallResponse? aPiEditTask;
  // Stores action output result for API calls used in Add/Edit Unity/Discipline
  ApiCallResponse? apiResultUnidades;
  ApiCallResponse? apiResultDisciplinas;

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

    /// Dispose query cache managers for this widget.

    clearCriarTarefaCache();

    clearUnityCache();

    clearDisciplineCache();
  }
}
