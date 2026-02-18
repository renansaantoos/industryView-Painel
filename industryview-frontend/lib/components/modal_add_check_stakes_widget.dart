import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/custom_functions.dart' as functions;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_add_check_stakes_model.dart';
export 'modal_add_check_stakes_model.dart';

class ModalAddCheckStakesWidget extends StatefulWidget {
  const ModalAddCheckStakesWidget({
    super.key,
    required this.index,
    this.indexAppState,
    this.typesId,
    this.typesTxt,
  });

  final int? index;
  final int? indexAppState;
  final int? typesId;
  final String? typesTxt;

  @override
  State<ModalAddCheckStakesWidget> createState() =>
      _ModalAddCheckStakesWidgetState();
}

class _ModalAddCheckStakesWidgetState extends State<ModalAddCheckStakesWidget> {
  late ModalAddCheckStakesModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalAddCheckStakesModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();

    return Container(
      decoration: BoxDecoration(),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Theme(
            data: ThemeData(
              checkboxTheme: CheckboxThemeData(
                visualDensity: VisualDensity.compact,
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4.0),
                ),
              ),
              unselectedWidgetColor: FlutterFlowTheme.of(context).alternate,
            ),
            child: Checkbox(
              value: _model.checkboxValue ??= () {
                if (widget!.indexAppState == widget!.index) {
                  return true;
                } else if ((FFAppState()
                            .statusCheckGlobal
                            .elementAtOrNull(widget!.index!) ==
                        true) &&
                    !FFAppState().ultimosClicks.contains(widget!.index)) {
                  return true;
                } else {
                  return false;
                }
              }(),
              onChanged: () {
                if (widget!.indexAppState == widget!.index) {
                  return true;
                } else if ((FFAppState()
                            .statusCheckGlobal
                            .elementAtOrNull(widget!.index!) ==
                        true) &&
                    FFAppState().ultimosClicks.contains(widget!.index)) {
                  return false;
                } else if ((FFAppState()
                            .statusCheckGlobal
                            .elementAtOrNull(widget!.index!) ==
                        true) &&
                    !FFAppState().ultimosClicks.contains(widget!.index)) {
                  return true;
                } else {
                  return false;
                }
              }()
                  ? null
                  : (newValue) async {
                      safeSetState(() => _model.checkboxValue = newValue!);
                      if (newValue!) {
                        FFAppState().updateListSequenciaEstacasAtIndex(
                          widget!.index!,
                          (e) => e
                            ..position = ((widget!.index!) + 1).toString()
                            ..stakesPosition =
                                ((widget!.index!) + 1).toString(),
                        );
                        FFAppState().updateStatusCheckGlobalAtIndex(
                          widget!.index!,
                          (_) => true,
                        );
                        FFAppState().addToUltimosClicks(widget!.index!);
                        FFAppState().update(() {});
                      } else {
                        FFAppState().updateListSequenciaEstacasAtIndex(
                          widget!.index!,
                          (e) => e
                            ..position = null
                            ..stakesPosition = null,
                        );
                        FFAppState().updateStatusCheckGlobalAtIndex(
                          widget!.index!,
                          (_) => false,
                        );
                        FFAppState().removeFromUltimosClicks(widget!.index!);
                        FFAppState().update(() {});
                      }
                    },
              side: (FlutterFlowTheme.of(context).alternate != null)
                  ? BorderSide(
                      width: 2,
                      color: FlutterFlowTheme.of(context).alternate!,
                    )
                  : null,
              activeColor: FlutterFlowTheme.of(context).primary,
              checkColor: () {
                if (widget!.indexAppState == widget!.index) {
                  return true;
                } else if ((FFAppState()
                            .statusCheckGlobal
                            .elementAtOrNull(widget!.index!) ==
                        true) &&
                    FFAppState().ultimosClicks.contains(widget!.index)) {
                  return false;
                } else if ((FFAppState()
                            .statusCheckGlobal
                            .elementAtOrNull(widget!.index!) ==
                        true) &&
                    !FFAppState().ultimosClicks.contains(widget!.index)) {
                  return true;
                } else {
                  return false;
                }
              }()
                  ? FlutterFlowTheme.of(context).secondaryBackground
                  : FlutterFlowTheme.of(context).info,
            ),
          ),
          Text(
            valueOrDefault<String>(
              functions.numberToAlphabet(widget!.index!.toString()),
              '0',
            ),
            style: FlutterFlowTheme.of(context).bodyMedium.override(
                  font: GoogleFonts.lexend(
                    fontWeight:
                        FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                    fontStyle:
                        FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                  ),
                  letterSpacing: 0.0,
                  fontWeight:
                      FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                  fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                ),
          ),
        ],
      ),
    );
  }
}
