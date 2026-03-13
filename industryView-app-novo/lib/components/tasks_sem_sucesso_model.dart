import '/core/utils/app_utils.dart';
import 'tasks_sem_sucesso_widget.dart' show TasksSemSucessoWidget;
import 'package:flutter/material.dart';

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
