import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/logout/logout_widget.dart';
import '/components/mouserhover_menu_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import '/flows/configuracoes/configuracoes_widget.dart';
import 'nav_bar_widget.dart' show NavBarWidget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class NavBarModel extends FlutterFlowModel<NavBarWidget> {
  ///  Local state fields for this component.

  bool mostraProjetos = false;

  bool boolean = false;

  ///  State fields for stateful widgets in this component.

  // State field(s) for dashboard widget.
  bool dashboardHovered = false;
  // State field(s) for modulo widget.
  bool moduloHovered = false;
  // State field(s) for tracker widget.
  bool trackerHovered = false;
  // State field(s) for tarefa widget.
  bool tarefaHovered = false;
  // State field(s) for colaborador widget.
  bool colaboradorHovered = false;
  // State field(s) for projeto widget.
  bool projetoHovered = false;
  // State field(s) for configuracoes widget.
  bool configuracoesHovered = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered = false;
  // State field(s) for DropDown widget.
  String? dropDownValue;
  FormFieldController<String>? dropDownValueController;

  /// Query cache managers for this widget.

  final _projetoManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> projeto({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _projetoManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearProjetoCache() => _projetoManager.clear();
  void clearProjetoCacheKey(String? uniqueKey) =>
      _projetoManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    /// Dispose query cache managers for this widget.

    clearProjetoCache();
  }
}
