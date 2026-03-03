import '/backend/schema/structs/index.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/core/actions/index.dart' as actions;
import '/core/utils/custom_functions.dart' as functions;
import 'tasks_sem_sucesso_widget.dart' show TasksSemSucessoWidget;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class TasksSemSucessoModel extends PageModel<TasksSemSucessoWidget> {
  ///  Local state fields for this component.

  List<int> ids = [];
  void addToIds(int item) => ids.add(item);
  void removeFromIds(int item) => ids.remove(item);
  void removeAtIndexFromIds(int index) => ids.removeAt(index);
  void insertAtIndexInIds(int index, int item) => ids.insert(index, item);
  void updateIdsAtIndex(int index, Function(int) updateFn) =>
      ids[index] = updateFn(ids[index]);

  bool allcheck = false;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
