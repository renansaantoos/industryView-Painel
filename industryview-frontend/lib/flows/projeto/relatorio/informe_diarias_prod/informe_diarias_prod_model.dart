import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_empty_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/custom_code/widgets/index.dart' as custom_widgets;
import '/flutter_flow/custom_functions.dart' as functions;
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'informe_diarias_prod_widget.dart' show InformeDiariasProdWidget;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:provider/provider.dart';

class InformeDiariasProdModel
    extends FlutterFlowModel<InformeDiariasProdWidget> {
  ///  Local state fields for this page.

  int sprintTab = 1;

  int page = 1;

  int perPage = 100;

  List<SprintFuturaStruct> sprintFutura = [];
  void addToSprintFutura(SprintFuturaStruct item) => sprintFutura.add(item);
  void removeFromSprintFutura(SprintFuturaStruct item) =>
      sprintFutura.remove(item);
  void removeAtIndexFromSprintFutura(int index) => sprintFutura.removeAt(index);
  void insertAtIndexInSprintFutura(int index, SprintFuturaStruct item) =>
      sprintFutura.insert(index, item);
  void updateSprintFuturaAtIndex(
          int index, Function(SprintFuturaStruct) updateFn) =>
      sprintFutura[index] = updateFn(sprintFutura[index]);

  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token )] action in InformeDiariasProd widget.
  ApiCallResponse? aPiTokenAuth;
  // Model for navBar component.
  late NavBarModel navBarModel;

  /// Query cache managers for this widget.

  final _informeDiarioManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> informeDiario({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _informeDiarioManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearInformeDiarioCache() => _informeDiarioManager.clear();
  void clearInformeDiarioCacheKey(String? uniqueKey) =>
      _informeDiarioManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
  }

  @override
  void dispose() {
    navBarModel.dispose();

    /// Dispose query cache managers for this widget.

    clearInformeDiarioCache();
  }
}
