import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/components/filtro_cargo/filtro_cargo_widget.dart';
import '/components/modal_confirm/modal_confirm_widget.dart';
import '/components/modal_empty_widget.dart';
import '/components/modal_import/modal_import_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/components/options_colaborador/options_colaborador_widget.dart';
import '/flows/colaboradores/modal_add_usuario/modal_add_usuario_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/flutter_flow/custom_functions.dart' as functions;
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'dart:async';
import 'funcionario_widget.dart' show FuncionarioWidget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class FuncionarioModel extends FlutterFlowModel<FuncionarioWidget> {
  ///  Local state fields for this page.

  int page = 1;

  int perPage = 10;

  List<int> teste = [];
  void addToTeste(int item) => teste.add(item);
  void removeFromTeste(int item) => teste.remove(item);
  void removeAtIndexFromTeste(int index) => teste.removeAt(index);
  void insertAtIndexInTeste(int index, int item) => teste.insert(index, item);
  void updateTesteAtIndex(int index, Function(int) updateFn) =>
      teste[index] = updateFn(teste[index]);

  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token )] action in Funcionario widget.
  ApiCallResponse? aPiTokenAuth;
  // Model for navBar component.
  late NavBarModel navBarModel;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered = false;
  bool apiRequestCompleted = false;
  String? apiRequestLastUniqueKey;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  // Stores action output result for [Backend Call - API (Get user export)] action in IconButton widget.
  ApiCallResponse? getUsersExport;
  // State field(s) for DropDown widget.
  int? dropDownValue;
  FormFieldController<int>? dropDownValueController;

  /// Query cache managers for this widget.

  final _listaColaboradoresManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> listaColaboradores({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _listaColaboradoresManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearListaColaboradoresCache() => _listaColaboradoresManager.clear();
  void clearListaColaboradoresCacheKey(String? uniqueKey) =>
      _listaColaboradoresManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
  }

  @override
  void dispose() {
    navBarModel.dispose();
    textFieldFocusNode?.dispose();
    textController?.dispose();

    /// Dispose query cache managers for this widget.

    clearListaColaboradoresCache();
  }

  /// Additional helper methods.
  Future waitForApiRequestCompleted({
    double minWait = 0,
    double maxWait = double.infinity,
  }) async {
    final stopwatch = Stopwatch()..start();
    while (true) {
      await Future.delayed(Duration(milliseconds: 50));
      final timeElapsed = stopwatch.elapsedMilliseconds;
      final requestComplete = apiRequestCompleted;
      if (timeElapsed > maxWait || (requestComplete && timeElapsed > minWait)) {
        break;
      }
    }
  }
}
