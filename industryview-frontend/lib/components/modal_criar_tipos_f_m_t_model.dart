import '/backend/api_requests/api_calls.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'modal_criar_tipos_f_m_t_widget.dart' show ModalCriarTiposFMTWidget;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalCriarTiposFMTModel
    extends FlutterFlowModel<ModalCriarTiposFMTWidget> {
  ///  Local state fields for this component.

  bool erroText = false;

  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  // State field(s) for search widget.
  FocusNode? searchFocusNode;
  TextEditingController? searchTextController;
  String? Function(BuildContext, String?)? searchTextControllerValidator;
  String? _searchTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '8oml0aob' /* * Campo obrigatório */,
      );
    }

    return null;
  }

  // Stores action output result for [Backend Call - API (Add modules_types record)] action in Button widget.
  ApiCallResponse? apiAddModulo;
  // Stores action output result for [Backend Call - API (Add manufacturers record)] action in Button widget.
  ApiCallResponse? aPiAddManufacturers;
  // Stores action output result for [Backend Call - API (Add trackers_types record)] action in Button widget.
  ApiCallResponse? apiTrackerType;

  @override
  void initState(BuildContext context) {
    searchTextControllerValidator = _searchTextControllerValidator;
  }

  @override
  void dispose() {
    searchFocusNode?.dispose();
    searchTextController?.dispose();
  }
}
