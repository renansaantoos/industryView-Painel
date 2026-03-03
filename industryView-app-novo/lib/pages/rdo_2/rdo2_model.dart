import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/components/empty_widget.dart';
import '/components/imagens_widget.dart';
import '/components/nav_bar_widget.dart';
import '/core/widgets/app_tab_bar.dart';
import '/core/widgets/app_expanded_image.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/core/utils/custom_functions.dart' as functions;
import '/index.dart';
import 'rdo2_widget.dart' show Rdo2Widget;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:page_transition/page_transition.dart';
import 'package:provider/provider.dart';

class Rdo2Model extends PageModel<Rdo2Widget> {
  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token)] action in RDO-2 widget.
  ApiCallResponse? validTokenCopy;
  // Model for NavBar component.
  late NavBarModel navBarModel;
  // State field(s) for TabBar widget.
  TabController? tabBarController;
  int get tabBarCurrentIndex =>
      tabBarController != null ? tabBarController!.index : 0;
  int get tabBarPreviousIndex =>
      tabBarController != null ? tabBarController!.previousIndex : 0;

  // Model for empty component.
  late EmptyModel emptyModel;

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
    emptyModel = createModel(context, () => EmptyModel());
  }

  @override
  void dispose() {
    navBarModel.dispose();
    tabBarController?.dispose();
    emptyModel.dispose();
  }
}
