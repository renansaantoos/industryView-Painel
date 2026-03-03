import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/txt_comment_insp_widget.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import 'comment_insp_widget.dart' show CommentInspWidget;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

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
