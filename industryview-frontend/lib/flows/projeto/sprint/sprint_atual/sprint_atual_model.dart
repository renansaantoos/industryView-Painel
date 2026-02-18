import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/flows/projeto/gestao_de_equipe/filtro_equipe/filtro_equipe_widget.dart';
import '/flows/projeto/sprint/modal_add_tarefas_sprint01/modal_add_tarefas_sprint01_widget.dart';
import '/flows/projeto/sprint/modal_detalhe_tarefa_sprint/modal_detalhe_tarefa_sprint_widget.dart';
import '/flows/projeto/sprint/modal_equip/modal_equip_widget.dart';
import '/flutter_flow/flutter_flow_animations.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:math';
import 'dart:ui';
import '/flutter_flow/custom_functions.dart' as functions;
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'dart:async';
import 'sprint_atual_widget.dart' show SprintAtualWidget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class SprintAtualModel extends FlutterFlowModel<SprintAtualWidget> {
  ///  Local state fields for this page.

  int pagePen = 1;

  int perPagePen = 10;

  List<int> zero = [];
  void addToZero(int item) => zero.add(item);
  void removeFromZero(int item) => zero.remove(item);
  void removeAtIndexFromZero(int index) => zero.removeAt(index);
  void insertAtIndexInZero(int index, int item) => zero.insert(index, item);
  void updateZeroAtIndex(int index, Function(int) updateFn) =>
      zero[index] = updateFn(zero[index]);

  bool mostraFileira = false;

  int visualizar = 1;

  List<int> listaIDS = [];
  void addToListaIDS(int item) => listaIDS.add(item);
  void removeFromListaIDS(int item) => listaIDS.remove(item);
  void removeAtIndexFromListaIDS(int index) => listaIDS.removeAt(index);
  void insertAtIndexInListaIDS(int index, int item) =>
      listaIDS.insert(index, item);
  void updateListaIDSAtIndex(int index, Function(int) updateFn) =>
      listaIDS[index] = updateFn(listaIDS[index]);

  int pageAnd = 1;

  int perPageAnd = 10;

  int pageIns = 1;

  int perPageIns = 10;

  int pageSem = 1;

  int perPageSem = 10;

  int? pageConc = 1;

  int? perPageConc = 10;

  String? date;

  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token )] action in Sprint-Atual widget.
  ApiCallResponse? aPiTokenAuth;
  // Model for navBar component.
  late NavBarModel navBarModel;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  bool apiRequestCompleted1 = false;
  String? apiRequestLastUniqueKey1;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered1 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered2 = false;

  DateTime? datePicked;
  // Stores action output result for [Backend Call - API (Edit status task LISTA)] action in Button widget.
  ApiCallResponse? apiResultpotCopy2Copy;
  // Stores action output result for [Backend Call - API (Edit status task)] action in pendente widget.
  ApiCallResponse? apiResultpotCopy0;
  // Stores action output result for [Backend Call - API (Edit status task)] action in emAndamento widget.
  ApiCallResponse? apiResultpot1;
  // State field(s) for TabBar widget.
  TabController? tabBarController;
  int get tabBarCurrentIndex =>
      tabBarController != null ? tabBarController!.index : 0;
  int get tabBarPreviousIndex =>
      tabBarController != null ? tabBarController!.previousIndex : 0;

  // State field(s) for DropDownLeaders widget.
  int? dropDownLeadersValue;
  FormFieldController<int>? dropDownLeadersValueController;

  /// Query cache managers for this widget.

  final _fieldsManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> fields({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _fieldsManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearFieldsCache() => _fieldsManager.clear();
  void clearFieldsCacheKey(String? uniqueKey) =>
      _fieldsManager.clearRequest(uniqueKey);

  final _sectionsManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> sections({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _sectionsManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearSectionsCache() => _sectionsManager.clear();
  void clearSectionsCacheKey(String? uniqueKey) =>
      _sectionsManager.clearRequest(uniqueKey);

  final _rowsManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> rows({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _rowsManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearRowsCache() => _rowsManager.clear();
  void clearRowsCacheKey(String? uniqueKey) =>
      _rowsManager.clearRequest(uniqueKey);

  final _sprintManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> sprint({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _sprintManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearSprintCache() => _sprintManager.clear();
  void clearSprintCacheKey(String? uniqueKey) =>
      _sprintManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
  }

  @override
  void dispose() {
    navBarModel.dispose();
    textFieldFocusNode?.dispose();
    textController?.dispose();

    tabBarController?.dispose();

    /// Dispose query cache managers for this widget.

    clearFieldsCache();

    clearSectionsCache();

    clearRowsCache();

    clearSprintCache();
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


}
