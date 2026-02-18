import '/backend/api_requests/api_calls.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flows/projeto/gestao_de_equipe/loading/loading_widget.dart';
import '/flows/projeto/sprint/modal_add_tarefas_sprint02/modal_add_tarefas_sprint02_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'modal_add_tarefas_sprint01_widget.dart'
    show ModalAddTarefasSprint01Widget;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalAddTarefasSprint01Model
    extends FlutterFlowModel<ModalAddTarefasSprint01Widget> {
  ///  Local state fields for this component.

  List<dynamic> varGetTeams = [];
  void addToVarGetTeams(dynamic item) => varGetTeams.add(item);
  void removeFromVarGetTeams(dynamic item) => varGetTeams.remove(item);
  void removeAtIndexFromVarGetTeams(int index) => varGetTeams.removeAt(index);
  void insertAtIndexInVarGetTeams(int index, dynamic item) =>
      varGetTeams.insert(index, item);
  void updateVarGetTeamsAtIndex(int index, Function(dynamic) updateFn) =>
      varGetTeams[index] = updateFn(varGetTeams[index]);

  List<dynamic> varLeaders = [];
  void addToVarLeaders(dynamic item) => varLeaders.add(item);
  void removeFromVarLeaders(dynamic item) => varLeaders.remove(item);
  void removeAtIndexFromVarLeaders(int index) => varLeaders.removeAt(index);
  void insertAtIndexInVarLeaders(int index, dynamic item) =>
      varLeaders.insert(index, item);
  void updateVarLeadersAtIndex(int index, Function(dynamic) updateFn) =>
      varLeaders[index] = updateFn(varLeaders[index]);

  int? teamId;

  ///  State fields for stateful widgets in this component.

  // Stores action output result for [Backend Call - API (Get teams record)] action in modal_AddTarefasSprint01 widget.
  ApiCallResponse? getTeams;
  // Stores action output result for [Backend Call - API (Query to get all liders from a team)] action in modal_AddTarefasSprint01 widget.
  ApiCallResponse? getLeadersLoad;
  // Stores action output result for [Backend Call - API (Query to get all liders from a team)] action in Container widget.
  ApiCallResponse? getLeadersTap;
  // Stores action output result for [Backend Call - API (Edit sprints_tasks record)] action in Button widget.
  ApiCallResponse? editTaskSprint;
  // Model for loading component.
  late LoadingModel loadingModel;

  @override
  void initState(BuildContext context) {
    loadingModel = createModel(context, () => LoadingModel());
  }

  @override
  void dispose() {
    loadingModel.dispose();
  }
}
