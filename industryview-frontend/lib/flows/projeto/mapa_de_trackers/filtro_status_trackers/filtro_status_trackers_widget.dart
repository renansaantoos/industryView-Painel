import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'filtro_status_trackers_model.dart';
export 'filtro_status_trackers_model.dart';

class FiltroStatusTrackersWidget extends StatefulWidget {
  const FiltroStatusTrackersWidget({
    super.key,
    this.idsStatusTrackers,
    this.sectionsId,
  });

  final List<int>? idsStatusTrackers;
  final int? sectionsId;

  @override
  State<FiltroStatusTrackersWidget> createState() =>
      _FiltroStatusTrackersWidgetState();
}

class _FiltroStatusTrackersWidgetState
    extends State<FiltroStatusTrackersWidget> {
  late FiltroStatusTrackersModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => FiltroStatusTrackersModel());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _model.ids = FFAppState().filtroIdsStatusTracker.toList().cast<int>();
      safeSetState(() {});
    });

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

    return FutureBuilder<ApiCallResponse>(
      future: _model.filterStatusTracker(
        requestFn: () async => ApiCallResponse(null, {}, 200), // Dummy API Response
      ),
      builder: (context, snapshot) {
        // Customize what your widget looks like when it's loading.
        if (!snapshot.hasData) {
          return Center(
            child: SizedBox(
              width: 50.0,
              height: 50.0,
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(
                  FlutterFlowTheme.of(context).primary,
                ),
              ),
            ),
          );
        }
        final containerQueryAllRowsTrackersStatusesRecordsResponse =
            snapshot.data!;

        return Material(
          color: Colors.transparent,
          elevation: 2.0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.0),
          ),
          child: Container(
            width: 470.0,
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
            child: Padding(
              padding: EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding:
                        EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 16.0),
                    child: SelectionArea(
                        child: Text(
                      FFLocalizations.of(context).getText(
                        'ygnvn4w6' /* Filtrar por status do tracker */,
                      ),
                      style: FlutterFlowTheme.of(context).titleMedium.override(
                            font: GoogleFonts.lexend(
                              fontWeight: FlutterFlowTheme.of(context)
                                  .titleMedium
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .titleMedium
                                  .fontStyle,
                            ),
                            color: FlutterFlowTheme.of(context).primaryText,
                            letterSpacing: 0.0,
                            fontWeight: FlutterFlowTheme.of(context)
                                .titleMedium
                                .fontWeight,
                            fontStyle: FlutterFlowTheme.of(context)
                                .titleMedium
                                .fontStyle,
                          ),
                    )),
                  ),
                  Flexible(
                    child: Builder(
                      builder: (context) {
                        final list =
                            containerQueryAllRowsTrackersStatusesRecordsResponse
                                .jsonBody
                                .toList();

                        return ListView.builder(
                          padding: EdgeInsets.zero,
                          shrinkWrap: true,
                          scrollDirection: Axis.vertical,
                          itemCount: list.length,
                          itemBuilder: (context, listIndex) {
                            final listItem = list[listIndex];
                            return Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Theme(
                                  data: ThemeData(
                                    checkboxTheme: CheckboxThemeData(
                                      visualDensity: VisualDensity.compact,
                                      materialTapTargetSize:
                                          MaterialTapTargetSize.shrinkWrap,
                                      shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(4.0),
                                      ),
                                    ),
                                    unselectedWidgetColor:
                                        FlutterFlowTheme.of(context).alternate,
                                  ),
                                  child: Checkbox(
                                    value: _model.checkboxValueMap[listItem] ??=
                                        FFAppState()
                                            .filtroIdsStatusTracker
                                            .contains(getJsonField(
                                              listItem,
                                              r'''$.id''',
                                            )),
                                    onChanged: (newValue) async {
                                      safeSetState(() =>
                                          _model.checkboxValueMap[listItem] =
                                              newValue!);
                                      if (newValue!) {
                                        _model.addToIds(getJsonField(
                                          listItem,
                                          r'''$.id''',
                                        ));
                                        safeSetState(() {});
                                      } else {
                                        _model.removeFromIds(getJsonField(
                                          listItem,
                                          r'''$.id''',
                                        ));
                                        safeSetState(() {});
                                      }
                                    },
                                    side: (FlutterFlowTheme.of(context)
                                                .alternate !=
                                            null)
                                        ? BorderSide(
                                            width: 2,
                                            color: FlutterFlowTheme.of(context)
                                                .alternate!,
                                          )
                                        : null,
                                    activeColor:
                                        FlutterFlowTheme.of(context).primary,
                                    checkColor:
                                        FlutterFlowTheme.of(context).info,
                                  ),
                                ),
                                Container(
                                  width: 16.0,
                                  height: 16.0,
                                  decoration: BoxDecoration(
                                    color: () {
                                      if (FFAppConstants.um ==
                                          getJsonField(
                                            listItem,
                                            r'''$.id''',
                                          )) {
                                        return FlutterFlowTheme.of(context)
                                            .secondaryText;
                                      } else if (FFAppConstants.dois ==
                                          getJsonField(
                                            listItem,
                                            r'''$.id''',
                                          )) {
                                        return FlutterFlowTheme.of(context)
                                            .tertiary;
                                      } else if (FFAppConstants.tres ==
                                          getJsonField(
                                            listItem,
                                            r'''$.id''',
                                          )) {
                                        return FlutterFlowTheme.of(context)
                                            .error;
                                      } else if (FFAppConstants.quatro ==
                                          getJsonField(
                                            listItem,
                                            r'''$.id''',
                                          )) {
                                        return FlutterFlowTheme.of(context)
                                            .primary;
                                      } else if (FFAppConstants.cinco ==
                                          getJsonField(
                                            listItem,
                                            r'''$.id''',
                                          )) {
                                        return FlutterFlowTheme.of(context)
                                            .success;
                                      } else {
                                        return FlutterFlowTheme.of(context)
                                            .secondaryText;
                                      }
                                    }(),
                                    borderRadius: BorderRadius.circular(100.0),
                                  ),
                                ),
                                Flexible(
                                  child: Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        4.0, 0.0, 0.0, 0.0),
                                    child: SelectionArea(
                                        child: Text(
                                      valueOrDefault<String>(
                                        getJsonField(
                                          listItem,
                                          r'''$.status''',
                                        )?.toString(),
                                        'N/A',
                                      ),
                                      style: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .bodyMedium
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .bodyMedium
                                                      .fontStyle,
                                            ),
                                            color: _model
                                                    .checkboxValueMap[listItem]!
                                                ? FlutterFlowTheme.of(context)
                                                    .primary
                                                : FlutterFlowTheme.of(context)
                                                    .primaryText,
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMedium
                                                    .fontStyle,
                                          ),
                                    )),
                                  ),
                                ),
                              ],
                            );
                          },
                        );
                      },
                    ),
                  ),
                  Builder(
                    builder: (context) => Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(0.0, 16.0, 0.0, 0.0),
                      child: FFButtonWidget(
                        onPressed: () async {
                          var _shouldSetState = false;
                          FFAppState().filtroIdsStatusTracker =
                              _model.ids.toList().cast<int>();
                          FFAppState().update(() {});
                          _model.listRows = await ApiCallResponse(null, {}, 200); // Dummy API Response

                          _shouldSetState = true;
                          if ((_model.listRows?.succeeded ?? true)) {
                            FFAppState().jsonRowsRef =
                                ((_model.listRows?.jsonBody ?? '')
                                            .toList()
                                            .map<MapTrackersStruct?>(
                                                MapTrackersStruct.maybeFromMap)
                                            .toList()
                                        as Iterable<MapTrackersStruct?>)
                                    .withoutNulls
                                    .toList()
                                    .cast<MapTrackersStruct>();
                            FFAppState().update(() {});
                            _model.returnAction =
                                await actions.actRetornaValidacaoStatusStake(
                              FFAppState().jsonRowsRef.toList(),
                              widget!.sectionsId,
                            );
                            _shouldSetState = true;
                            FFAppState().esqueleto1 = false;
                            FFAppState().esqueleto2 = false;
                            FFAppState().actionReturn = _model.returnAction!;
                            safeSetState(() {});
                            Navigator.pop(context);
                            if (_shouldSetState) safeSetState(() {});
                            return;
                          } else {
                            FFAppState().esqueleto2 = false;
                            safeSetState(() {});
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
                                    title: 'Erro',
                                    description: getJsonField(
                                      (_model.listRows?.jsonBody ?? ''),
                                      r'''$.message''',
                                    ).toString(),
                                  ),
                                );
                              },
                            );

                            if (_shouldSetState) safeSetState(() {});
                            return;
                          }

                          if (_shouldSetState) safeSetState(() {});
                        },
                        text: FFLocalizations.of(context).getText(
                          'fny3w5yr' /* Aplicar filtro */,
                        ),
                        options: FFButtonOptions(
                          width: double.infinity,
                          height: 40.0,
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 16.0, 0.0),
                          iconPadding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 0.0, 0.0, 0.0),
                          color: FlutterFlowTheme.of(context).primary,
                          textStyle:
                              FlutterFlowTheme.of(context).titleSmall.override(
                                    font: GoogleFonts.lexend(
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .titleSmall
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .titleSmall
                                          .fontStyle,
                                    ),
                                    color: Colors.white,
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .titleSmall
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .titleSmall
                                        .fontStyle,
                                  ),
                          elevation: 0.0,
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                      ),
                    ),
                  ),
                ].divide(SizedBox(height: 0.0)),
              ),
            ),
          ),
        );
      },
    );
  }
}
