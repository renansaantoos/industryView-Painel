import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/components/mouse_drop_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_drop_trackers_map/modal_drop_trackers_map_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_replicar_configuracao_fileira/modal_replicar_configuracao_fileira_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'modal_add_fileira_widget.dart' show ModalAddFileiraWidget;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalAddFileiraModel extends FlutterFlowModel<ModalAddFileiraWidget> {
  ///  Local state fields for this component.

  bool drop = false;

  int contador = 0;

  int contador2 = 0;

  ///  State fields for stateful widgets in this component.

  // Stores action output result for [Custom Action - verificaIdsSetados] action in Button widget.
  bool? returnSets;
  // Stores action output result for [Backend Call - API (Add rows_trackers record)] action in Button widget.
  ApiCallResponse? addRowsTracker;

  /// Query cache managers for this widget.

  final _trackersManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> trackers({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _trackersManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearTrackersCache() => _trackersManager.clear();
  void clearTrackersCacheKey(String? uniqueKey) =>
      _trackersManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    /// Dispose query cache managers for this widget.

    clearTrackersCache();
  }
}
