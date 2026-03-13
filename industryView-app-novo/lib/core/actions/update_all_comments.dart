
import '/core/utils/app_utils.dart';



Future updateAllComments(String newComment) async {
  /// MODIFY CODE ONLY BELOW THIS LINE

  // Copia referência local (evita acesso repetido ao AppState)
  final list = AppState().tasksfinish;

  // Atualiza todos em memória (zero rebuilds)
  for (final item in list) {
    if (item.sucesso != true) {
      item.comment = newComment;
    }
  }

  // Apenas um update global (super rápido)
  AppState().update(() {
    AppState().tasksfinish = List.from(list);
  });

  /// MODIFY CODE ONLY ABOVE THIS LINE
}
