import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/filtro_cargo/filtro_cargo_widget.dart';
import '/components/modal_empty_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'dart:async';
import 'modal_nova_equipe_widget.dart' show ModalNovaEquipeWidget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalNovaEquipeModel extends FlutterFlowModel<ModalNovaEquipeWidget> {
  ///  Local state fields for this component.

  int page = 1;

  int perPage = 10;

  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  // State field(s) for NomeEquipe widget.
  FocusNode? nomeEquipeFocusNode;
  TextEditingController? nomeEquipeTextController;
  String? Function(BuildContext, String?)? nomeEquipeTextControllerValidator;
  String? _nomeEquipeTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'ln3hktw8' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered = false;
  bool apiRequestCompleted = false;
  String? apiRequestLastUniqueKey;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController2;
  String? Function(BuildContext, String?)? textController2Validator;
  // State field(s) for DropDown widget.
  int? dropDownValue;
  FormFieldController<int>? dropDownValueController;
  // Stores action output result for [Backend Call - API (Add teams record)] action in Button widget.
  ApiCallResponse? aPiCreatTeam;
  // Stores action output result for [Backend Call - API (Edita lider do time)] action in Button widget.
  ApiCallResponse? aPiEditTeam;

  /// Query cache managers for this widget.

  final _lideresManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> lideres({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _lideresManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearLideresCache() => _lideresManager.clear();
  void clearLideresCacheKey(String? uniqueKey) =>
      _lideresManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {
    nomeEquipeTextControllerValidator = _nomeEquipeTextControllerValidator;
  }

  @override
  void dispose() {
    nomeEquipeFocusNode?.dispose();
    nomeEquipeTextController?.dispose();

    textFieldFocusNode?.dispose();
    textController2?.dispose();

    /// Dispose query cache managers for this widget.

    clearLideresCache();
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
