import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/comment_insp_widget.dart';
import '/components/confirmdialog_widget.dart';
import '/components/empty_widget.dart';
import '/components/logout_widget.dart';
import '/components/modal_info_widget.dart';
import '/components/modal_sucess_qrcode_widget.dart';
import '/components/nav_bar_widget.dart';
import '/core/widgets/app_tab_bar.dart';
import '/core/widgets/app_drop_down.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import '/core/widgets/form_field_controller.dart';
import 'dart:ui';
import '/core/actions/index.dart' as actions;
import '/core/utils/custom_functions.dart' as functions;
import '/core/utils/request_manager.dart';

import '/index.dart';
import 'dart:async';
import 'home_page_tarefas_widget.dart' show HomePageTarefasWidget;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_barcode_scanner/flutter_barcode_scanner.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class HomePageTarefasModel extends PageModel<HomePageTarefasWidget> {
  ///  Local state fields for this page.

  int page = 1;

  int perPage = 50;

  bool allCheck = false;

  String? qrcode;

  bool semSucesso = false;

  bool filtros = false;

  int drop = 0;

  bool sprintExpanded = false;

  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token)] action in HomePage-Tarefas widget.
  ApiCallResponse? validTokenCopy;
  // Model for NavBar component.
  late NavBarModel navBarModel;
  bool apiRequestCompleted = false;
  String? apiRequestLastUniqueKey;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  // State field(s) for DropDown widget.
  int? dropDownValue1;
  FormFieldController<int>? dropDownValueController1;
  // Stores action output result for [Custom Action - setIdsEquipamento] action in Container widget.
  List<TasksListStruct>? retornoAciton;
  // Stores action output result for [Custom Action - setIdsEquipamento] action in Container widget.
  List<TasksListStruct>? retornoAcitonSemSucesso;
  // Stores action output result for [Custom Action - addIdsDataType] action in Container widget.
  List<TasksListStruct>? yesandamento;
  // State field(s) for TabBar widget.
  TabController? tabBarController;
  int get tabBarCurrentIndex =>
      tabBarController != null ? tabBarController!.index : 0;
  int get tabBarPreviousIndex =>
      tabBarController != null ? tabBarController!.previousIndex : 0;

  var returnQrcode = '';
  // Stores action output result for [Backend Call - API (qrcode reader)] action in IconButton widget.
  ApiCallResponse? apiQrcode;
  // State field(s) for DropDown widget.
  String? dropDownValue2;
  FormFieldController<String>? dropDownValueController2;

  /// Query cache managers for this widget.

  final _homePageManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> homePage({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _homePageManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearHomePageCache() => _homePageManager.clear();
  void clearHomePageCacheKey(String? uniqueKey) =>
      _homePageManager.clearRequest(uniqueKey);

  final _equipamentsManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> equipaments({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _equipamentsManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearEquipamentsCache() => _equipamentsManager.clear();
  void clearEquipamentsCacheKey(String? uniqueKey) =>
      _equipamentsManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
  }

  @override
  void dispose() {
    navBarModel.dispose();
    textFieldFocusNode?.dispose();
    textController?.dispose();

    tabBarController?.dispose();

    /// Dispose query cache managers for this widget.

    clearHomePageCache();

    clearEquipamentsCache();
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
