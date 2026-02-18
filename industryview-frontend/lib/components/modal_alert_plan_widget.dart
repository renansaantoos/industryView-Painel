import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_alert_plan_model.dart';
export 'modal_alert_plan_model.dart';

class ModalAlertPlanWidget extends StatefulWidget {
  const ModalAlertPlanWidget({super.key});

  @override
  State<ModalAlertPlanWidget> createState() => _ModalAlertPlanWidgetState();
}

class _ModalAlertPlanWidgetState extends State<ModalAlertPlanWidget> {
  late ModalAlertPlanModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalAlertPlanModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
