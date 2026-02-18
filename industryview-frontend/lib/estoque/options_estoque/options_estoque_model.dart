import '/backend/api_requests/api_calls.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/estoque/modal_add_estoque/modal_add_estoque_widget.dart';
import '/estoque/modal_estoque_qtd/modal_estoque_qtd_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'options_estoque_widget.dart' show OptionsEstoqueWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class OptionsEstoqueModel extends FlutterFlowModel<OptionsEstoqueWidget> {
  ///  Local state fields for this component.

  int contador = 0;

  ///  State fields for stateful widgets in this component.

  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered1 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered2 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered3 = false;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered4 = false;
  // Stores action output result for [Backend Call - API (Delete produtc inventory)] action in wrapWidget widget.
  ApiCallResponse? deleteProduct;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
