import '/backend/api_requests/api_calls.dart';
import '/components/empty_widget.dart';
import '/components/nav_bar_widget.dart';
import '/core/utils/app_utils.dart';
import '/index.dart';
import 'rdo2_widget.dart' show Rdo2Widget;
import 'package:flutter/material.dart';

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
