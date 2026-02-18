import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/filtro_cargo/filtro_cargo_widget.dart';
import '/components/modal_empty_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/components/options_colaborador/options_colaborador_widget.dart';
import '/flows/projeto/gestao_de_equipe/modal_add_colaborador/modal_add_colaborador_widget.dart';
import '/flows/projeto/gestao_de_equipe/modal_add_lider/modal_add_lider_widget.dart';
import '/flows/projeto/gestao_de_equipe/modal_nova_equipe/modal_nova_equipe_widget.dart';
import '/flows/projeto/gestao_de_equipe/options_equipe/options_equipe_widget.dart';
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
import 'gestao_de_equipe_widget.dart' show GestaoDeEquipeWidget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class GestaoDeEquipeModel extends FlutterFlowModel<GestaoDeEquipeWidget> {
  ///  Local state fields for this page.

  int pageLeaders = 1;

  int perPageLeaders = 10;

  int pageTeam = 1;

  int perPageTeams = 10;

  bool seeLeaders = true;

  int contador = 0;

  String? nomeEquipe;

  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token )] action in gestaoDeEquipe widget.
  ApiCallResponse? aPiTokenAuth;
  // Model for navBar component.
  late NavBarModel navBarModel;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered1 = false;
  bool apiRequestCompleted1 = false;
  String? apiRequestLastUniqueKey1;
  bool apiRequestCompleted2 = false;
  String? apiRequestLastUniqueKey2;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered2 = false;
  // State field(s) for DropDownLeaders widget.
  int? dropDownLeadersValue;
  FormFieldController<int>? dropDownLeadersValueController;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered3 = false;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered4 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered5 = false;
  // State field(s) for DropDownTeams widget.
  int? dropDownTeamsValue;
  FormFieldController<int>? dropDownTeamsValueController;

  /// Query cache managers for this widget.

  final _listaManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> lista({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _listaManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearListaCache() => _listaManager.clear();
  void clearListaCacheKey(String? uniqueKey) =>
      _listaManager.clearRequest(uniqueKey);

  final _listaLeadersManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> listaLeaders({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _listaLeadersManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearListaLeadersCache() => _listaLeadersManager.clear();
  void clearListaLeadersCacheKey(String? uniqueKey) =>
      _listaLeadersManager.clearRequest(uniqueKey);

  final _listaTeamsManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> listaTeams({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _listaTeamsManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearListaTeamsCache() => _listaTeamsManager.clear();
  void clearListaTeamsCacheKey(String? uniqueKey) =>
      _listaTeamsManager.clearRequest(uniqueKey);

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

    clearListaCache();

    clearListaLeadersCache();

    clearListaTeamsCache();
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
