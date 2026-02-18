import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'page_price_widget.dart' show PagePriceWidget;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class PagePriceModel extends FlutterFlowModel<PagePriceWidget> {
  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token )] action in Button widget.
  ApiCallResponse? aPiAuthTokenTap1;
  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token )] action in Button widget.
  ApiCallResponse? aPiAuthTokenTap2;
  // Stores action output result for [Backend Call - API (sessions)] action in Button widget.
  ApiCallResponse? planBasic;
  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token )] action in Button widget.
  ApiCallResponse? aPiAuthTokenTap;
  // Stores action output result for [Backend Call - API (sessions)] action in Button widget.
  ApiCallResponse? planPro;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
