import '/backend/api_requests/api_calls.dart';
import '/flows/heavy_array_pier/heavy_array_pier_widget.dart';
import '/flows/modal_replicar_estacas/modal_replicar_estacas_widget.dart';
import '/flows/trackers/heavy_array_pier_edge/heavy_array_pier_edge_widget.dart';
import '/flows/trackers/heavy_motor_pier/heavy_motor_pier_widget.dart';
import '/flows/trackers/standart_array_pier/standart_array_pier_widget.dart';
import '/flows/trackers/standart_array_pier_edge/standart_array_pier_edge_widget.dart';
import '/flows/trackers/standart_motor_pier/standart_motor_pier_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_add_estacas_model.dart';
export 'modal_add_estacas_model.dart';

class ModalAddEstacasWidget extends StatefulWidget {
  const ModalAddEstacasWidget({
    super.key,
    this.index,
    this.typePage,
    bool? stakesIsMotor,
    this.name,
    this.stakesTypesId,
    this.stakesStatusesId,
  }) : this.stakesIsMotor = stakesIsMotor ?? false;

  final int? index;
  final String? typePage;
  final bool stakesIsMotor;
  final String? name;
  final int? stakesTypesId;
  final int? stakesStatusesId;

  @override
  State<ModalAddEstacasWidget> createState() => _ModalAddEstacasWidgetState();
}

class _ModalAddEstacasWidgetState extends State<ModalAddEstacasWidget> {
  late ModalAddEstacasModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalAddEstacasModel());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      if (widget!.typePage == 'edit') {
        _model.stakesTypesId = widget!.stakesTypesId;
        _model.stakesTypesTxt = widget!.name;
        safeSetState(() {});
        return;
      } else {
        return;
      }
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

    return Padding(
      padding: EdgeInsets.all(24.0),
      child: FutureBuilder<ApiCallResponse>(
        future: _model.listStakes(
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
          final baseQueryAllStakesTypesRecordsResponse = snapshot.data!;

          return Material(
            color: Colors.transparent,
            elevation: 5.0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12.0),
            ),
            child: Container(
              width: 460.0,
              decoration: BoxDecoration(
                color: FlutterFlowTheme.of(context).secondaryBackground,
                borderRadius: BorderRadius.circular(12.0),
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(
                          32.0, 32.0, 32.0, 32.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Align(
                                alignment: AlignmentDirectional(-1.0, -1.0),
                                child: Text(
                                  FFLocalizations.of(context).getText(
                                    'f5r9wqea' /* Adicionar nova estaca */,
                                  ),
                                  style: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .headlineMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .headlineMedium
                                                  .fontStyle,
                                        ),
                                        letterSpacing: 0.0,
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .headlineMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .headlineMedium
                                            .fontStyle,
                                      ),
                                ),
                              ),
                              Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 4.0, 12.0, 0.0),
                                child: Text(
                                  FFLocalizations.of(context).getText(
                                    'z0sn2sp8' /* Escolha qual tipo de estaca vo... */,
                                  ),
                                  style: FlutterFlowTheme.of(context)
                                      .labelMedium
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .labelMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .labelMedium
                                                  .fontStyle,
                                        ),
                                        letterSpacing: 0.0,
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontStyle,
                                      ),
                                ),
                              ),
                            ],
                          ),
                          Builder(
                            builder: (context) {
                              final listStakes =
                                  baseQueryAllStakesTypesRecordsResponse
                                      .jsonBody
                                      .toList();

                              return ListView.separated(
                                padding: EdgeInsets.zero,
                                primary: false,
                                shrinkWrap: true,
                                scrollDirection: Axis.vertical,
                                itemCount: listStakes.length,
                                separatorBuilder: (_, __) =>
                                    SizedBox(height: 12.0),
                                itemBuilder: (context, listStakesIndex) {
                                  final listStakesItem =
                                      listStakes[listStakesIndex];
                                  return InkWell(
                                    splashColor: Colors.transparent,
                                    focusColor: Colors.transparent,
                                    hoverColor: Colors.transparent,
                                    highlightColor: Colors.transparent,
                                    onTap: () async {
                                      _model.stakesTypesId = getJsonField(
                                        listStakesItem,
                                        r'''$.id''',
                                      );
                                      _model.stakesTypesTxt = getJsonField(
                                        listStakesItem,
                                        r'''$.type''',
                                      ).toString();
                                      _model.erro1 = false;
                                      safeSetState(() {});
                                    },
                                    child: Container(
                                      width: double.infinity,
                                      decoration: BoxDecoration(
                                        color: _model.stakesTypesId ==
                                                getJsonField(
                                                  listStakesItem,
                                                  r'''$.id''',
                                                )
                                            ? FlutterFlowTheme.of(context)
                                                .status03
                                            : FlutterFlowTheme.of(context)
                                                .secondaryBackground,
                                        borderRadius:
                                            BorderRadius.circular(12.0),
                                        border: Border.all(
                                          color: _model.stakesTypesId ==
                                                  getJsonField(
                                                    listStakesItem,
                                                    r'''$.id''',
                                                  )
                                              ? FlutterFlowTheme.of(context)
                                                  .primary
                                              : FlutterFlowTheme.of(context)
                                                  .alternate,
                                          width: 1.0,
                                        ),
                                      ),
                                      child: Padding(
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            16.0, 12.0, 8.0, 12.0),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.max,
                                          mainAxisAlignment:
                                              MainAxisAlignment.start,
                                          children: [
                                            if (FFAppConstants.um ==
                                                getJsonField(
                                                  listStakesItem,
                                                  r'''$.id''',
                                                ))
                                              HeavyMotorPierWidget(
                                                key: Key(
                                                    'Keylwi_${listStakesIndex}_of_${listStakes.length}'),
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryText,
                                              ),
                                            if (FFAppConstants.dois ==
                                                getJsonField(
                                                  listStakesItem,
                                                  r'''$.id''',
                                                ))
                                              HeavyArrayPierWidget(
                                                key: Key(
                                                    'Keyfoi_${listStakesIndex}_of_${listStakes.length}'),
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .alternate,
                                                borderColor:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryText,
                                              ),
                                            if (FFAppConstants.tres ==
                                                getJsonField(
                                                  listStakesItem,
                                                  r'''$.id''',
                                                ))
                                              HeavyArrayPierEdgeWidget(
                                                key: Key(
                                                    'Keyx63_${listStakesIndex}_of_${listStakes.length}'),
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryText,
                                              ),
                                            if (FFAppConstants.quatro ==
                                                getJsonField(
                                                  listStakesItem,
                                                  r'''$.id''',
                                                ))
                                              StandartMotorPierWidget(
                                                key: Key(
                                                    'Keyf5b_${listStakesIndex}_of_${listStakes.length}'),
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryText,
                                              ),
                                            if (FFAppConstants.cinco ==
                                                getJsonField(
                                                  listStakesItem,
                                                  r'''$.id''',
                                                ))
                                              StandartArrayPierWidget(
                                                key: Key(
                                                    'Keyuil_${listStakesIndex}_of_${listStakes.length}'),
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .alternate,
                                                borderColor:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryText,
                                              ),
                                            if (FFAppConstants.seis ==
                                                getJsonField(
                                                  listStakesItem,
                                                  r'''$.id''',
                                                ))
                                              StandartArrayPierEdgeWidget(
                                                key: Key(
                                                    'Keym7k_${listStakesIndex}_of_${listStakes.length}'),
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryText,
                                              ),
                                            Expanded(
                                              child: Text(
                                                valueOrDefault<String>(
                                                  getJsonField(
                                                    listStakesItem,
                                                    r'''$.type''',
                                                  )?.toString(),
                                                  'N/A',
                                                ),
                                                style: FlutterFlowTheme.of(
                                                        context)
                                                    .labelSmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .primaryText,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontStyle,
                                                    ),
                                              ),
                                            ),
                                          ].divide(SizedBox(width: 8.0)),
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              );
                            },
                          ),
                          if (_model.erro1)
                            Text(
                              FFLocalizations.of(context).getText(
                                'mnlfbrtm' /* Escolha um tipo de estaca para... */,
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
                          Divider(
                            thickness: 1.0,
                            color: FlutterFlowTheme.of(context).alternate,
                          ),
                          Row(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              Expanded(
                                child: FFButtonWidget(
                                  onPressed: () async {
                                    Navigator.pop(context);
                                  },
                                  text: FFLocalizations.of(context).getText(
                                    '5i0w1a1q' /* Cancelar */,
                                  ),
                                  options: FFButtonOptions(
                                    height: 48.0,
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        16.0, 0.0, 16.0, 0.0),
                                    iconPadding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 0.0, 0.0, 0.0),
                                    color:
                                        FlutterFlowTheme.of(context).secondary,
                                    textStyle: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .labelMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelMedium
                                                    .fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(context)
                                              .primary,
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .labelMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .labelMedium
                                                  .fontStyle,
                                        ),
                                    elevation: 0.0,
                                    borderSide: BorderSide(
                                      color:
                                          FlutterFlowTheme.of(context).primary,
                                    ),
                                    borderRadius: BorderRadius.circular(8.0),
                                  ),
                                ),
                              ),
                              Expanded(
                                flex: 2,
                                child: Builder(
                                  builder: (context) => FFButtonWidget(
                                    onPressed: () async {
                                      if (_model.stakesTypesTxt != null &&
                                          _model.stakesTypesTxt != '') {
                                        Navigator.pop(context);
                                        FFAppState().idEstaca =
                                            _model.stakesTypesId!;
                                        safeSetState(() {});
                                        await showDialog(
                                          barrierColor: Color(0x80000000),
                                          context: context,
                                          builder: (dialogContext) {
                                            return Dialog(
                                              elevation: 0,
                                              insetPadding: EdgeInsets.zero,
                                              backgroundColor:
                                                  Colors.transparent,
                                              alignment:
                                                  AlignmentDirectional(0.0, 0.0)
                                                      .resolve(
                                                          Directionality.of(
                                                              context)),
                                              child: ModalReplicarEstacasWidget(
                                                stakesTypesTxt:
                                                    _model.stakesTypesTxt!,
                                                indexAppState: widget!.index,
                                                stakesTypesId:
                                                    _model.stakesTypesId!,
                                              ),
                                            );
                                          },
                                        );

                                        return;
                                      } else {
                                        _model.erro1 = true;
                                        safeSetState(() {});
                                        return;
                                      }
                                    },
                                    text: FFLocalizations.of(context).getText(
                                      'iptj96z0' /* Continuar */,
                                    ),
                                    options: FFButtonOptions(
                                      height: 48.0,
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          16.0, 0.0, 16.0, 0.0),
                                      iconPadding:
                                          EdgeInsetsDirectional.fromSTEB(
                                              0.0, 0.0, 0.0, 0.0),
                                      color:
                                          FlutterFlowTheme.of(context).primary,
                                      textStyle: FlutterFlowTheme.of(context)
                                          .labelMedium
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .labelMedium
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .labelMedium
                                                      .fontStyle,
                                            ),
                                            color: FlutterFlowTheme.of(context)
                                                .info,
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .labelMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelMedium
                                                    .fontStyle,
                                          ),
                                      elevation: 0.0,
                                      borderRadius: BorderRadius.circular(8.0),
                                    ),
                                  ),
                                ),
                              ),
                            ].divide(SizedBox(width: 12.0)),
                          ),
                        ].divide(SizedBox(height: 16.0)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
