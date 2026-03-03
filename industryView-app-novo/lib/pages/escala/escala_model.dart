import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/components/loading_copy_widget.dart';
import '/components/modal_info_widget.dart';
import '/components/nav_bar_widget.dart';
import '/core/widgets/app_animations.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:math';
import 'dart:ui';
import '/index.dart';
import 'dart:async';
import 'escala_widget.dart' show EscalaWidget;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class EscalaModel extends PageModel<EscalaWidget> {
  ///  Local state fields for this page.

  List<int> setIds = [];
  void addToSetIds(int item) => setIds.add(item);
  void removeFromSetIds(int item) => setIds.remove(item);
  void removeAtIndexFromSetIds(int index) => setIds.removeAt(index);
  void insertAtIndexInSetIds(int index, int item) => setIds.insert(index, item);
  void updateSetIdsAtIndex(int index, Function(int) updateFn) =>
      setIds[index] = updateFn(setIds[index]);

  bool allCheck = false;

  int page = 1;

  int perPage = 20;

  bool sucesso = false;

  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token)] action in Escala widget.
  ApiCallResponse? validToken;
  // Stores action output result for [Backend Call - API (lista colaboradores da escala do dia)] action in Escala widget.
  ApiCallResponse? escalaDia;
  // Model for NavBar component.
  late NavBarModel navBarModel;
  // State field(s) for TextField widget.
  FocusNode? textFieldFocusNode;
  TextEditingController? textController;
  String? Function(BuildContext, String?)? textControllerValidator;
  bool apiRequestCompleted = false;
  String? apiRequestLastUniqueKey;
  // Stores action output result for [Backend Call - API (Edita escala dos colaboradores)] action in Button widget.
  ApiCallResponse? editaEscala;

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
  }

  @override
  void dispose() {
    navBarModel.dispose();
    textFieldFocusNode?.dispose();
    textController?.dispose();
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
