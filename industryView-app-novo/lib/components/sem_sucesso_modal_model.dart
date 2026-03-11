import '/backend/api_requests/api_calls.dart';
import '/core/utils/app_utils.dart';
import 'sem_sucesso_modal_widget.dart' show SemSucessoModalWidget;
import 'package:flutter/material.dart';

class SemSucessoModalModel extends PageModel<SemSucessoModalWidget> {
  ApiCallResponse? nonExecutionReasonsResponse;
  ApiCallResponse? updateStatusResponse;
  ApiCallResponse? addCommentResponse;

  // --- Modo single (1 tarefa) ---
  String? selectedReasonId;
  String? selectedReasonName;
  TextEditingController? observationsController;
  bool showReasonError = false;

  // --- Modo batch (N tarefas) ---
  // Chave: índice da tarefa na lista widget.items
  Map<int, String?> batchReasonIds = {};
  Map<int, String?> batchReasonNames = {};
  Map<int, TextEditingController> batchObsControllers = {};
  Map<int, bool> batchShowReasonError = {};
  // Controle de quais accordions estão expandidos
  Map<int, bool> batchExpanded = {};
  // Flag: já ofereceu replicar para as demais (só mostra 1 vez)
  bool alreadyOfferedReplicate = false;

  bool isLoading = false;

  List<dynamic> get reasons {
    if (nonExecutionReasonsResponse?.succeeded ?? false) {
      final body = nonExecutionReasonsResponse?.jsonBody;
      if (body is List) return body;
    }
    return [];
  }

  /// Verifica se todas as tarefas batch têm motivo selecionado.
  bool isBatchValid(int count) {
    for (int i = 0; i < count; i++) {
      final id = batchReasonIds[i];
      if (id == null || id.isEmpty) return false;
    }
    return true;
  }

  /// Inicializa os controladores batch para [count] tarefas.
  void initBatchControllers(int count) {
    for (int i = 0; i < count; i++) {
      batchObsControllers[i] ??= TextEditingController();
      batchExpanded[i] = i == 0; // primeiro item expandido por padrão
    }
  }

  @override
  void initState(BuildContext context) {
    observationsController ??= TextEditingController();
  }

  @override
  void dispose() {
    observationsController?.dispose();
    for (final ctrl in batchObsControllers.values) {
      ctrl.dispose();
    }
  }
}
