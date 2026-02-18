import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/custom_functions.dart' as functions;
import 'package:aligned_tooltip/aligned_tooltip.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'standart_array_pier_edge_model.dart';
export 'standart_array_pier_edge_model.dart';

class StandartArrayPierEdgeWidget extends StatefulWidget {
  const StandartArrayPierEdgeWidget({
    super.key,
    this.color,
    this.status,
  });

  final Color? color;
  final String? status;

  @override
  State<StandartArrayPierEdgeWidget> createState() =>
      _StandartArrayPierEdgeWidgetState();
}

class _StandartArrayPierEdgeWidgetState
    extends State<StandartArrayPierEdgeWidget> {
  late StandartArrayPierEdgeModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => StandartArrayPierEdgeModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlignedTooltip(
      content: Padding(
        padding: EdgeInsets.all(4.0),
        child: Text(
          'SAPE - Standart Array Pier Edge${functions.espacamento()}Status: ${widget!.status}',
          style: FlutterFlowTheme.of(context).bodySmall.override(
                font: GoogleFonts.lexend(
                  fontWeight: FlutterFlowTheme.of(context).bodySmall.fontWeight,
                  fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                ),
                letterSpacing: 0.0,
                fontWeight: FlutterFlowTheme.of(context).bodySmall.fontWeight,
                fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
              ),
        ),
      ),
      offset: 4.0,
      preferredDirection: AxisDirection.up,
      borderRadius: BorderRadius.circular(8.0),
      backgroundColor: FlutterFlowTheme.of(context).secondaryBackground,
      elevation: 2.0,
      tailBaseWidth: 24.0,
      tailLength: 12.0,
      waitDuration: Duration(milliseconds: 100),
      showDuration: Duration(milliseconds: 0),
      triggerMode: TooltipTriggerMode.tap,
      child: InkWell(
        splashColor: Colors.transparent,
        focusColor: Colors.transparent,
        hoverColor: Colors.transparent,
        highlightColor: Colors.transparent,
        onTap: () async {},
        child: Container(
          width: 24.0,
          height: 24.0,
          decoration: BoxDecoration(
            color: widget!.color,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}
