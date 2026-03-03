import '/backend/api_requests/api_calls.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import 'dart:ui';
import 'modal_comment_widget.dart' show ModalCommentWidget;
import 'package:flutter/material.dart';

class ModalCommentModel extends PageModel<ModalCommentWidget> {
  // Controller para o campo de comentário
  TextEditingController? commentController;
  String? Function(BuildContext, String?)? commentControllerValidator;

  // Resultado da chamada de API
  ApiCallResponse? addCommentResult;
  ApiCallResponse? updateStatusResult;

  // Estado de loading
  bool isLoading = false;

  @override
  void initState(BuildContext context) {
    commentController ??= TextEditingController();
  }

  @override
  void dispose() {
    commentController?.dispose();
  }
}
