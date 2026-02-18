import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/flutter_flow/custom_functions.dart' as functions;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'card_colaborador_cargo_model.dart';
export 'card_colaborador_cargo_model.dart';

class CardColaboradorCargoWidget extends StatefulWidget {
  const CardColaboradorCargoWidget({
    super.key,
    this.id,
    this.nome,
    this.cargo,
    this.foto,
    this.indexTeams,
  });

  /// id_users
  final int? id;

  final String? nome;
  final String? cargo;
  final String? foto;
  final int? indexTeams;

  @override
  State<CardColaboradorCargoWidget> createState() =>
      _CardColaboradorCargoWidgetState();
}

class _CardColaboradorCargoWidgetState
    extends State<CardColaboradorCargoWidget> {
  late CardColaboradorCargoModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CardColaboradorCargoModel());

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

    return Padding(
      padding: EdgeInsets.all(6.0),
      child: Material(
        color: Colors.transparent,
        elevation: 1.0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12.0),
        ),
        child: Container(
          width: 240.0,
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                blurRadius: 4.0,
                color: Color(0x33000000),
                offset: Offset(
                  0.0,
                  2.0,
                ),
              )
            ],
            gradient: LinearGradient(
              colors: [
                valueOrDefault<Color>(
                  _model.selected
                      ? FlutterFlowTheme.of(context).secondaryBackground
                      : FlutterFlowTheme.of(context).secondary,
                  FlutterFlowTheme.of(context).secondaryBackground,
                ),
                valueOrDefault<Color>(
                  _model.selected
                      ? FlutterFlowTheme.of(context).primaryBackground
                      : FlutterFlowTheme.of(context).secondary,
                  FlutterFlowTheme.of(context).primaryBackground,
                )
              ],
              stops: [0.0, 1.0],
              begin: AlignmentDirectional(-1.0, 0.0),
              end: AlignmentDirectional(1.0, 0),
            ),
            borderRadius: BorderRadius.circular(12.0),
            border: Border.all(
              color: _model.selected
                  ? FlutterFlowTheme.of(context).alternate
                  : FlutterFlowTheme.of(context).primary,
            ),
          ),
          child: Padding(
            padding: EdgeInsetsDirectional.fromSTEB(0.0, 12.0, 12.0, 12.0),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Theme(
                    data: ThemeData(
                      checkboxTheme: CheckboxThemeData(
                        visualDensity: VisualDensity.compact,
                        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4.0),
                        ),
                      ),
                      unselectedWidgetColor:
                          FlutterFlowTheme.of(context).alternate,
                    ),
                    child: Checkbox(
                      value: _model.checkboxValue ??=
                          FFAppState().setIds.contains(widget!.id),
                      onChanged: (newValue) async {
                        safeSetState(() => _model.checkboxValue = newValue!);
                        if (newValue!) {
                          FFAppState().addToSetIds(widget!.id!);
                          FFAppState().updateUser0AtIndex(
                            widget!.indexTeams!,
                            (e) => e..mostra = true,
                          );
                          FFAppState().update(() {});
                        } else {
                          FFAppState().removeFromSetIds(widget!.id != null
                              ? widget!.id!
                              : functions.funReturnId(
                                  widget!.id!, FFAppState().setIds.toList()));
                          FFAppState().updateUser0AtIndex(
                            widget!.indexTeams!,
                            (e) => e..mostra = false,
                          );
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
                      checkColor: FlutterFlowTheme.of(context).info,
                    ),
                  ),
                ),
                ClipRRect(
                  borderRadius: BorderRadius.circular(40.0),
                  child: Image.network(
                    widget!.foto!,
                    width: 40.0,
                    height: 40.0,
                    fit: BoxFit.cover,
                  ),
                ),
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(8.0, 0.0, 0.0, 0.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Text(
                            valueOrDefault<String>(
                              widget!.nome,
                              'N/A',
                            ),
                            style:
                                FlutterFlowTheme.of(context).bodySmall.override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FontWeight.w500,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontStyle,
                                      ),
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w500,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodySmall
                                          .fontStyle,
                                    ),
                          ),
                        ].divide(SizedBox(width: 4.0)),
                      ),
                      Padding(
                        padding:
                            EdgeInsetsDirectional.fromSTEB(0.0, 4.0, 0.0, 0.0),
                        child: Text(
                          valueOrDefault<String>(
                            widget!.cargo,
                            'N/A',
                          ).maybeHandleOverflow(
                            maxChars: 15,
                          ),
                          style: FlutterFlowTheme.of(context)
                              .bodySmall
                              .override(
                                font: GoogleFonts.lexend(
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .bodySmall
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .bodySmall
                                      .fontStyle,
                                ),
                                color:
                                    FlutterFlowTheme.of(context).secondaryText,
                                letterSpacing: 0.0,
                                fontWeight: FlutterFlowTheme.of(context)
                                    .bodySmall
                                    .fontWeight,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .bodySmall
                                    .fontStyle,
                              ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
