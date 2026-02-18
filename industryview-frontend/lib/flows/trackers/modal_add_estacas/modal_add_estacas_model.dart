import '/backend/api_requests/api_calls.dart';
import '/flows/heavy_array_pier/heavy_array_pier_widget.dart';
import '/flows/modal_replicar_estacas/modal_replicar_estacas_widget.dart';
import '/flows/trackers/heavy_array_pier_edge/heavy_array_pier_edge_widget.dart';
import '/flows/trackers/heavy_motor_pier/heavy_motor_pier_widget.dart';
import '/flows/trackers/standart_array_pier/standart_array_pier_widget.dart';
import '/flows/trackers/standart_array_pier_edge/standart_array_pier_edge_widget.dart';
import '/flows/trackers/standart_motor_pier/standart_motor_pier_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/request_manager.dart';

import 'modal_add_estacas_widget.dart' show ModalAddEstacasWidget;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalAddEstacasModel extends FlutterFlowModel<ModalAddEstacasWidget> {
  ///  Local state fields for this component.

  bool stakesIsMotor = false;

  int? stakesTypesId;

  int? stakesStatusesId;

  String? stakesTypesTxt;

  bool erro1 = false;

  /// Query cache managers for this widget.

  final _listStakesManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> listStakes({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _listStakesManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearListStakesCache() => _listStakesManager.clear();
  void clearListStakesCacheKey(String? uniqueKey) =>
      _listStakesManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    /// Dispose query cache managers for this widget.

    clearListStakesCache();
  }
}
