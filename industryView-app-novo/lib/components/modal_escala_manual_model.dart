import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/components/modal_info_widget.dart';
import '/components/modal_sucess_qrcode_widget.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/core/utils/request_manager.dart';

import 'dart:async';
import 'modal_escala_manual_widget.dart' show ModalEscalaManualWidget;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalEscalaManualModel extends PageModel<ModalEscalaManualWidget> {
  ///  Local state fields for this component.

  int page = 1;

  int perPage = 10;

  int? id;

  ///  State fields for stateful widgets in this component.

  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  bool apiRequestCompleted = false;
  String? apiRequestLastUniqueKey;
  // Stores action output result for [Backend Call - API (qrcode reader)] action in Button widget.
  ApiCallResponse? apiQrcode;

  /// Query cache managers for this widget.

  final _nextPageManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> nextPage({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _nextPageManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearNextPageCache() => _nextPageManager.clear();
  void clearNextPageCacheKey(String? uniqueKey) =>
      _nextPageManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    textFieldFocusNode?.dispose();
    textController?.dispose();

    /// Dispose query cache managers for this widget.

    clearNextPageCache();
  }

  /// Additional helper methods.
  Future waitForApiRequestCompleted({
    double minWait = 0,
    double maxWait = double.infinity,
  }) async {
    final stopwatch = Stopwatch()..start();
    while (true) {
      await Future.delayed(const Duration(milliseconds: 50));
      final timeElapsed = stopwatch.elapsedMilliseconds;
      final requestComplete = apiRequestCompleted;
      if (timeElapsed > maxWait || (requestComplete && timeElapsed > minWait)) {
        break;
      }
    }
  }
}
