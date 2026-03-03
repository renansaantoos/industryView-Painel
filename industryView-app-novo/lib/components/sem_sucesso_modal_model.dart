import '/backend/api_requests/api_calls.dart';
import '/core/utils/app_utils.dart';
import 'sem_sucesso_modal_widget.dart' show SemSucessoModalWidget;
import 'package:flutter/material.dart';

class SemSucessoModalModel extends PageModel<SemSucessoModalWidget> {
  ApiCallResponse? nonExecutionReasonsResponse;
  ApiCallResponse? updateStatusResponse;
  ApiCallResponse? addCommentResponse;

  String? selectedReasonId;
  String? selectedReasonName;
  TextEditingController? observationsController;
  bool isLoading = false;
  bool showReasonError = false;

  List<dynamic> get reasons {
    if (nonExecutionReasonsResponse?.succeeded ?? false) {
      final body = nonExecutionReasonsResponse?.jsonBody;
      if (body is List) return body;
    }
    return [];
  }

  @override
  void initState(BuildContext context) {
    observationsController ??= TextEditingController();
  }

  @override
  void dispose() {
    observationsController?.dispose();
  }
}
