import '/backend/api_requests/api_calls.dart';
import '/components/modal_confirm/modal_confirm_widget.dart';
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
import 'options_secao_model.dart';
export 'options_secao_model.dart';

class OptionsSecaoWidget extends StatefulWidget {
  const OptionsSecaoWidget({
    super.key,
    required this.sectionsId,
    bool? actionReturn,
    required this.fieldId,
    this.rowsTrackerId,
    this.id,
    this.listIndex,
    this.rowsId,
  }) : this.actionReturn = actionReturn ?? false;

  final int? sectionsId;
  final bool actionReturn;
  final int? fieldId;
  final List<int>? rowsTrackerId;
  final int? id;
  final List<dynamic>? listIndex;
  final List<int>? rowsId;

  @override
  State<OptionsSecaoWidget> createState() => _OptionsSecaoWidgetState();
}

class _OptionsSecaoWidgetState extends State<OptionsSecaoWidget> {
  late OptionsSecaoModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => OptionsSecaoModel());

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
            child: Builder(
              builder: (context) => InkWell(
                splashColor: Colors.transparent,
                focusColor: Colors.transparent,
                hoverColor: Colors.transparent,
                highlightColor: Colors.transparent,
                onTap: () async {
                  await showDialog(
                    context: context,
                    builder: (dialogContext) {
                      return Dialog(
                        elevation: 0,
                        insetPadding: EdgeInsets.zero,
                        backgroundColor: Colors.transparent,
                        alignment: AlignmentDirectional(0.0, 0.0)
                            .resolve(Directionality.of(context)),
                        child: ModalConfirmWidget(
                          title: FFLocalizations.of(context).getText(
                            '93qabuqj' /* Deseja duplicar essa seção? */,
                          ),
                          description: FFLocalizations.of(context).getText(
                            'ypm05s43' /* Duplicar esta seção criará uma... */,
                          ),
                          action: () async {
                            var _shouldSetState = false;
                            _model.apiResultiov = null; // API Call Removed

                            _shouldSetState = true;
                            if (!(_model.apiResultiov?.succeeded ?? true)) {
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
                                        '8xz3h8ba' /* Erro */,
                                      ),
                                      description: getJsonField(
                                        (_model.apiResultiov?.jsonBody ?? ''),
                                        r'''$.message''',
                                      ).toString(),
                                    ),
                                  );
                                },
                              );

                              return;
                            }

                            context.pushNamed(
                              ModulosTrackersMapWidget.routeName,
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
                    color: _model.mouseRegionHovered1!
                        ? FlutterFlowTheme.of(context).primaryBackground
                        : Color(0x00000000),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Expanded(
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 0.0, 0.0),
                          child: Text(
                            FFLocalizations.of(context).getText(
                              'b9r6757c' /* Duplicar */,
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
              safeSetState(() => _model.mouseRegionHovered1 = true);
            }),
            onExit: ((event) async {
              safeSetState(() => _model.mouseRegionHovered1 = false);
            }),
          ),
          if (widget!.actionReturn)
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
                          title: FFLocalizations.of(context).getText(
                            'e7gjvkjv' /* Remover seção */,
                          ),
                          description: FFLocalizations.of(context).getText(
                            'jlxwe4gt' /* Essa ação irá remover a seção ... */,
                          ),
                          actionAPi: () async {
                            var _shouldSetState = false;
                            _model.deleteSections = null; // API Call Removed

                            _shouldSetState = true;
                            if ((_model.deleteSections?.succeeded ?? true)) {
                              context.pushNamed(
                                ModulosTrackersMapWidget.routeName,
                                extra: <String, dynamic>{
                                  kTransitionInfoKey: TransitionInfo(
                                    hasTransition: true,
                                    transitionType: PageTransitionType.fade,
                                    duration: Duration(milliseconds: 0),
                                  ),
                                },
                              );

                              return;
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
                                        'wm5fybdm' /* Erro */,
                                      ),
                                      description: getJsonField(
                                        (_model.deleteSections?.jsonBody ?? ''),
                                        r'''$.message''',
                                      ).toString(),
                                    ),
                                  );
                                },
                              );

                              return;
                            }
                          },
                          actionPage: () async {},
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
                              'w4dlw1d6' /* Remover seção */,
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
