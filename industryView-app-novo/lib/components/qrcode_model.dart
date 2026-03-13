import '/backend/api_requests/api_calls.dart';
import '/core/utils/app_utils.dart';
import '/core/utils/request_manager.dart';

import 'qrcode_widget.dart' show QrcodeWidget;
import 'package:flutter/material.dart';

class QrcodeModel extends PageModel<QrcodeWidget> {
  /// Query cache managers for this widget.

  final _userManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> user({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _userManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearUserCache() => _userManager.clear();
  void clearUserCacheKey(String? uniqueKey) =>
      _userManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    /// Dispose query cache managers for this widget.

    clearUserCache();
  }
}
