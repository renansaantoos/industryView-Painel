import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info_widget.dart';
import '/components/row_list_subtasks_widget.dart';
import '/components/tasks_sem_sucesso_widget.dart';
import '/core/widgets/app_drop_down.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import '/core/widgets/form_field_controller.dart';
import 'dart:ui';
import '/core/utils/custom_functions.dart' as functions;
import '/index.dart';
import 'confirmdialog_widget.dart' show ConfirmdialogWidget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ConfirmdialogModel extends PageModel<ConfirmdialogWidget> {
  ///  Local state fields for this component.

  int contador = 0;

  int? number;

  int fase = 1;

  bool erro1 = false;

  bool addNovoStatus = false;

  List<int> ids = [];
  void addToIds(int item) => ids.add(item);
  void removeFromIds(int item) => ids.remove(item);
  void removeAtIndexFromIds(int index) => ids.removeAt(index);
  void insertAtIndexInIds(int index, int item) => ids.insert(index, item);
  void updateIdsAtIndex(int index, Function(int) updateFn) =>
      ids[index] = updateFn(ids[index]);

  bool erroDrop = false;

  ///  State fields for stateful widgets in this component.

  // Stores action output result for [Backend Call - API (Atualiza status da sprint task)] action in Button widget.
  ApiCallResponse? editProgressSprintSucesso;
  // State field(s) for Drop_status widget.
  int? dropStatusValue;
  FormFieldController<int>? dropStatusValueController;
  // Stores action output result for [Backend Call - API (Atualiza status da sprint task)] action in Button widget.
  ApiCallResponse? editProgressSprintSemSucesso;
  // Stores action output result for [Backend Call - API (Add comment)] action in Button widget.
  ApiCallResponse? addComment;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
