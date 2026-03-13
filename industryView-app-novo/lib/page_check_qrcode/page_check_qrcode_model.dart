import '/backend/api_requests/api_calls.dart';
import '/core/utils/app_utils.dart';
import '/index.dart';
import 'page_check_qrcode_widget.dart' show PageCheckQrcodeWidget;
import 'package:flutter/material.dart';

class PageCheckQrcodeModel extends PageModel<PageCheckQrcodeWidget> {
  ///  Local state fields for this page.

  int contador = 0;

  String? qrcode;

  List<String> ids = [];
  void addToIds(String item) => ids.add(item);
  void removeFromIds(String item) => ids.remove(item);
  void removeAtIndexFromIds(int index) => ids.removeAt(index);
  void insertAtIndexInIds(int index, String item) => ids.insert(index, item);
  void updateIdsAtIndex(int index, Function(String) updateFn) =>
      ids[index] = updateFn(ids[index]);

  int? retornoAPI;

  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token)] action in Page_check_qrcode widget.
  ApiCallResponse? validToken;
  // Stores action output result for [Backend Call - API (Lista membros de uma equipe)] action in Page_check_qrcode widget.
  ApiCallResponse? listaFuncionarios;
  // Stores action output result for [Backend Call - API (lista colaboradores da escala do dia)] action in Page_check_qrcode widget.
  ApiCallResponse? getScheduleId1;
  var returnQrcode = '';
  // Stores action output result for [Backend Call - API (qrcode reader)] action in Button widget.
  ApiCallResponse? apiQrcode;
  // Stores action output result for [Backend Call - API (Adiciona colaboradores na escala)] action in Button widget.
  ApiCallResponse? creatSchedule;
  // Stores action output result for [Backend Call - API (daily login)] action in Button widget.
  ApiCallResponse? firstLogin;
  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
