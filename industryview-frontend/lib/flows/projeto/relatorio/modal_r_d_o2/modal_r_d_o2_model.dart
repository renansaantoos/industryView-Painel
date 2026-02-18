import '/backend/api_requests/api_calls.dart';
import '/components/lista_users_widget.dart';
import '/components/modal_confirm/modal_confirm_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/flutter_flow/custom_functions.dart' as functions;
import '/flutter_flow/request_manager.dart';

import 'modal_r_d_o2_widget.dart' show ModalRDO2Widget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalRDO2Model extends FlutterFlowModel<ModalRDO2Widget> {
  ///  Local state fields for this component.

  List<dynamic> json = [];
  void addToJson(dynamic item) => json.add(item);
  void removeFromJson(dynamic item) => json.remove(item);
  void removeAtIndexFromJson(int index) => json.removeAt(index);
  void insertAtIndexInJson(int index, dynamic item) => json.insert(index, item);
  void updateJsonAtIndex(int index, Function(dynamic) updateFn) =>
      json[index] = updateFn(json[index]);

  ///  State fields for stateful widgets in this component.

  // State field(s) for DropDown widget.
  String? dropDownValue;
  FormFieldController<String>? dropDownValueController;
  // Stores action output result for [Backend Call - API (scheduleo)] action in DropDown widget.
  ApiCallResponse? apiResultsjg;
  // Stores action output result for [Backend Call - API (Add daily_report record)] action in Button widget.
  ApiCallResponse? addRdo;

  /// Query cache managers for this widget.

  final _rdoDateManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> rdoDate({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _rdoDateManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearRdoDateCache() => _rdoDateManager.clear();
  void clearRdoDateCacheKey(String? uniqueKey) =>
      _rdoDateManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {
    /// Dispose query cache managers for this widget.

    clearRdoDateCache();
  }
}
