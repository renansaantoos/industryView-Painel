import '/backend/api_requests/api_calls.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'options_trackers_model.dart';
export 'options_trackers_model.dart';

class OptionsTrackersWidget extends StatefulWidget {
  const OptionsTrackersWidget({
    super.key,
    required this.id,
    this.stakeQuantity,
    this.maxModules,
    this.trackersTypesTxt,
    this.manufacturersTxt,
    required this.typePage,
    this.idmanufacturers,
    this.idTrackersType,
  });

  final int? id;
  final int? stakeQuantity;
  final int? maxModules;
  final String? trackersTypesTxt;
  final String? manufacturersTxt;
  final String? typePage;
  final int? idmanufacturers;
  final int? idTrackersType;

  @override
  State<OptionsTrackersWidget> createState() => _OptionsTrackersWidgetState();
}

class _OptionsTrackersWidgetState extends State<OptionsTrackersWidget> {
  late OptionsTrackersModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => OptionsTrackersModel());

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
      width: 200.0,
      decoration: BoxDecoration(
        color: FlutterFlowTheme.of(context).secondaryBackground,
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
        borderRadius: BorderRadius.circular(12.0),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MouseRegion(
            opaque: false,
            cursor: MouseCursor.defer ?? MouseCursor.defer,
            child: InkWell(
              splashColor: Colors.transparent,
              focusColor: Colors.transparent,
              hoverColor: Colors.transparent,
              highlightColor: Colors.transparent,
              onTap: () async {
                context.pushNamed(
                  CadastrarEditarTrackerCopy2Widget.routeName,
                  queryParameters: {
                    'typePage': serializeParam(
                      widget!.typePage,
                      ParamType.String,
                    ),
                    'manufacturersTxt': serializeParam(
                      widget!.manufacturersTxt,
                      ParamType.String,
                    ),
                    'typeTrackerTxt': serializeParam(
                      widget!.trackersTypesTxt,
                      ParamType.String,
                    ),
                    'qtdModules': serializeParam(
                      widget!.maxModules,
                      ParamType.int,
                    ),
                    'qtdStakes': serializeParam(
                      widget!.stakeQuantity,
                      ParamType.int,
                    ),
                    'id': serializeParam(
                      widget!.id,
                      ParamType.int,
                    ),
                    'manufacturesId': serializeParam(
                      widget!.idmanufacturers,
                      ParamType.int,
                    ),
                    'typeTrackerId': serializeParam(
                      widget!.idTrackersType,
                      ParamType.int,
                    ),
                  }.withoutNulls,
                  extra: <String, dynamic>{
                    kTransitionInfoKey: TransitionInfo(
                      hasTransition: true,
                      transitionType: PageTransitionType.fade,
                      duration: Duration(milliseconds: 0),
                    ),
                  },
                );

                Navigator.pop(context);
              },
              child: Container(
                width: MediaQuery.sizeOf(context).width * 1.0,
                height: 50.0,
                decoration: BoxDecoration(
                  color: _model.mouseRegionHovered1!
                      ? FlutterFlowTheme.of(context).primaryBackground
                      : Color(0x00000000),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    Expanded(
                      child: Padding(
                        padding:
                            EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 0.0, 0.0),
                        child: Text(
                          FFLocalizations.of(context).getText(
                            'rirgrggy' /* Editar tracker */,
                          ),
                          style:
                              FlutterFlowTheme.of(context).bodyMedium.override(
                                    font: GoogleFonts.lexend(
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontStyle,
                                    ),
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontStyle,
                                  ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            onEnter: ((event) async {
              safeSetState(() => _model.mouseRegionHovered1 = true);
            }),
            onExit: ((event) async {
              safeSetState(() => _model.mouseRegionHovered1 = false);
            }),
          ),
          Divider(
            thickness: 1.0,
            color: FlutterFlowTheme.of(context).alternate,
          ),
          MouseRegion(
            opaque: false,
            cursor: MouseCursor.defer ?? MouseCursor.defer,
            child: Builder(
              builder: (context) => InkWell(
                splashColor: Colors.transparent,
                focusColor: Colors.transparent,
                hoverColor: Colors.transparent,
                highlightColor: Colors.transparent,
                onTap: () async {
                  await showDialog(
                    barrierColor: Color(0x80000000),
                    context: context,
                    builder: (dialogContext) {
                      return Dialog(
                        elevation: 0,
                        insetPadding: EdgeInsets.zero,
                        backgroundColor: Colors.transparent,
                        alignment: AlignmentDirectional(0.0, 0.0)
                            .resolve(Directionality.of(context)),
                        child: ModalConfirmDeleteWidget(
                          title: 'Remover tracker',
                          description:
                              'Tem certeza que deseja remover esse tracker? Você perderá informações importantes dele.',
                          id: widget!.id,
                          actionAPi: () async {
                            var _shouldSetState = false;
                            _model.aPiDeleteTracker = null; // API Call Removed

                            _shouldSetState = true;
                            if ((_model.aPiDeleteTracker?.succeeded ?? true)) {
                              Navigator.pop(context);
                            } else {
                              await showDialog(
                                context: context,
                                builder: (dialogContext) {
                                  return Dialog(
                                    elevation: 0,
                                    insetPadding: EdgeInsets.zero,
                                    backgroundColor: Colors.transparent,
                                    alignment: AlignmentDirectional(0.0, 0.0)
                                        .resolve(Directionality.of(context)),
                                    child: ModalInfoWidget(
                                      title:
                                          FFLocalizations.of(context).getText(
                                        '1c2txuum' /* Erro! */,
                                      ),
                                      description: getJsonField(
                                        (_model.aPiDeleteTracker?.jsonBody ??
                                            ''),
                                        r'''$.message''',
                                      ).toString(),
                                    ),
                                  );
                                },
                              );

                              return;
                            }
                          },
                          actionPage: () async {
                            context.pushNamed(
                              TrackersWidget.routeName,
                              extra: <String, dynamic>{
                                kTransitionInfoKey: TransitionInfo(
                                  hasTransition: true,
                                  transitionType: PageTransitionType.fade,
                                  duration: Duration(milliseconds: 0),
                                ),
                              },
                            );
                          },
                        ),
                      );
                    },
                  );

                  safeSetState(() {});
                },
                child: Container(
                  width: MediaQuery.sizeOf(context).width * 1.0,
                  height: 50.0,
                  decoration: BoxDecoration(
                    color: _model.mouseRegionHovered2!
                        ? FlutterFlowTheme.of(context).primaryBackground
                        : Color(0x00000000),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      Expanded(
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 0.0, 0.0),
                          child: Text(
                            FFLocalizations.of(context).getText(
                              '8ywlj10y' /* Remover tracker */,
                            ),
                            style: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontStyle,
                                  ),
                                  color: FlutterFlowTheme.of(context).error,
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .bodyMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .bodyMedium
                                      .fontStyle,
                                ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            onEnter: ((event) async {
              safeSetState(() => _model.mouseRegionHovered2 = true);
            }),
            onExit: ((event) async {
              safeSetState(() => _model.mouseRegionHovered2 = false);
            }),
          ),
        ],
      ),
    );
  }
}
