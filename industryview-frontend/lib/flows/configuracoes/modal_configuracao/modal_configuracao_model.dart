import '/backend/api_requests/api_calls.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'modal_configuracao_widget.dart' show ModalConfiguracaoWidget;
import 'package:flutter/material.dart';

class ModalConfiguracaoModel extends FlutterFlowModel<ModalConfiguracaoWidget> {
  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  String? _textControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return 'Campo obrigatório';
    }
    return null;
  }

  // Stores action output result for [Backend Call - API (Edit Unity)] action in Button widget.
  ApiCallResponse? apiEditUnity;
  // Stores action output result for [Backend Call - API (Edit Discipline)] action in Button widget.
  ApiCallResponse? apiEditDiscipline;

  @override
  void initState(BuildContext context) {
    textControllerValidator = _textControllerValidator;
  }

  @override
  void dispose() {
    textFieldFocusNode?.dispose();
    textController?.dispose();
  }
}
