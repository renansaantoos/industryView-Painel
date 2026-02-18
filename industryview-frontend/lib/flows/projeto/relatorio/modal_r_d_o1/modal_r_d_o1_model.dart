import '/backend/api_requests/api_calls.dart';
import '/components/lista_users_widget.dart';
import '/components/modal_confirm/modal_confirm_widget.dart';
import '/components/modal_empty_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/custom_functions.dart' as functions;
import '/flutter_flow/request_manager.dart';

import 'modal_r_d_o1_widget.dart' show ModalRDO1Widget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalRDO1Model extends FlutterFlowModel<ModalRDO1Widget> {
  ///  State fields for stateful widgets in this component.

  // Stores action output result for [Backend Call - API (Add daily_report record)] action in Button widget.
  ApiCallResponse? addRdo;

  /// Query cache managers for this widget.

  final _rdo1Manager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> rdo1({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _rdo1Manager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearRdo1Cache() => _rdo1Manager.clear();
  void clearRdo1CacheKey(String? uniqueKey) =>
      _rdo1Manager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    /// Dispose query cache managers for this widget.

    clearRdo1Cache();
  }
}
