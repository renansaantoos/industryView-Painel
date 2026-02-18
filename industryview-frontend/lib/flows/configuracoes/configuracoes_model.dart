import '/flutter_flow/flutter_flow_util.dart';
import '/components/nav_bar/nav_bar_model.dart';
import 'configuracoes_widget.dart' show ConfiguracoesWidget;
import 'package:flutter/material.dart';

class ConfiguracoesModel extends FlutterFlowModel<ConfiguracoesWidget> {
  ///  Local state fields for this page.

  ///  State fields for stateful widgets in this page.

  final unfocusNode = FocusNode();
  late NavBarModel navBarModel;
  late TabController tabController;

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
  }

  @override
  void dispose() {
    unfocusNode.dispose();
    navBarModel.dispose();
  }
}
