import '/backend/api_requests/api_calls.dart';
import '/core/utils/app_utils.dart';
import 'comment_insp_widget.dart' show CommentInspWidget;
import 'package:flutter/material.dart';

class CommentInspModel extends PageModel<CommentInspWidget> {
  ///  Local state fields for this component.

  int page = 1;

  ///  State fields for stateful widgets in this component.

  // Stores action output result for [Backend Call - API (Update inspection)] action in Button widget.
  ApiCallResponse? aprovado;
  // Stores action output result for [Backend Call - API (Update inspection)] action in Button widget.
  ApiCallResponse? reprovadoSemComentario;
  // Stores action output result for [Backend Call - API (Update inspection)] action in Button widget.
  ApiCallResponse? reprovadoComComentario;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
