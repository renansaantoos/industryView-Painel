
// compare os id do meu codsucesso com o codfalha e remova do meu sucesso todos os que forem igual o meu codfalha e retorne
Future<List<int>> retornaCodSucesso(
  List<int> codFalha,
  List<int> codSucesso,
) async {
  // Create a copy of codSucesso to avoid modifying the original list
  List<int> resultado = List<int>.from(codSucesso);

  // Remove all items from resultado that exist in codFalha
  resultado.removeWhere((id) => codFalha.contains(id));

  return resultado;
}
