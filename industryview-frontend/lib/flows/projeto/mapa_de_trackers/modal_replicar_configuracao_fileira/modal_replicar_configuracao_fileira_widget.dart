import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_replicar_configuracao_fileira_model.dart';
export 'modal_replicar_configuracao_fileira_model.dart';

class ModalReplicarConfiguracaoFileiraWidget extends StatefulWidget {
  const ModalReplicarConfiguracaoFileiraWidget({
    super.key,
    required this.rows,
    required this.listMap,
    required this.sectionId,
  });

  final List<MapTrackersStruct>? rows;
  final List<MapTrackersStruct>? listMap;
  final int? sectionId;

  @override
  State<ModalReplicarConfiguracaoFileiraWidget> createState() =>
      _ModalReplicarConfiguracaoFileiraWidgetState();
}

class _ModalReplicarConfiguracaoFileiraWidgetState
    extends State<ModalReplicarConfiguracaoFileiraWidget> {
  late ModalReplicarConfiguracaoFileiraModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model =
        createModel(context, () => ModalReplicarConfiguracaoFileiraModel());

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
      future: _model
          .replicaEstacas(
        requestFn: () async => ApiCallResponse(null, {}, 200), // Dummy API Response
      )
          .then((result) {
        _model.apiRequestCompleted = true;
        return result;
      }),
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
        final containerQueryAllRowsRecordsResponse = snapshot.data!;

        return Material(
          color: Colors.transparent,
          elevation: 2.0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24.0),
          ),
          child: Container(
            width: 500.0,
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
              borderRadius: BorderRadius.circular(24.0),
            ),
            child: Padding(
              padding: EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      FlutterFlowIconButton(
                        borderColor: FlutterFlowTheme.of(context).primary,
                        borderRadius: 8.0,
                        borderWidth: 0.5,
                        buttonSize: 32.0,
                        fillColor: FlutterFlowTheme.of(context).secondary,
                        hoverColor: FlutterFlowTheme.of(context).hoverNavBar,
                        hoverIconColor:
                            FlutterFlowTheme.of(context).secondaryBackground,
                        hoverBorderColor:
                            FlutterFlowTheme.of(context).hoverNavBar,
                        icon: Icon(
                          Icons.keyboard_return,
                          color: FlutterFlowTheme.of(context).primary,
                          size: 16.0,
                        ),
                        onPressed: () async {
                          FFAppState().idsExistentes = [];
                          safeSetState(() {});
                          Navigator.pop(context);
                        },
                      ),
                      SelectionArea(
                          child: Text(
                        FFLocalizations.of(context).getText(
                          'u7dg4e0y' /* Replicar fileira */,
                        ),
                        style: FlutterFlowTheme.of(context).titleLarge.override(
                              font: GoogleFonts.lexend(
                                fontWeight: FontWeight.w500,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .titleLarge
                                    .fontStyle,
                              ),
                              letterSpacing: 0.0,
                              fontWeight: FontWeight.w500,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .titleLarge
                                  .fontStyle,
                            ),
                      )),
                    ].divide(SizedBox(width: 12.0)),
                  ),
                  Padding(
                    padding:
                        EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 0.0, 16.0),
                    child: SelectionArea(
                        child: Text(
                      FFLocalizations.of(context).getText(
                        'q4jcrum9' /* Replicar configuração da filei... */,
                      ),
                      style: FlutterFlowTheme.of(context).labelMedium.override(
                            font: GoogleFonts.lexend(
                              fontWeight: FlutterFlowTheme.of(context)
                                  .labelMedium
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
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
                    )),
                  ),
                  Padding(
                    padding: EdgeInsetsDirectional.fromSTEB(0.0, 4.0, 0.0, 0.0),
                    child: SelectionArea(
                        child: Text(
                      FFLocalizations.of(context).getText(
                        'uqy6x4bs' /* Fileiras da Seção 02 */,
                      ),
                      style: FlutterFlowTheme.of(context).labelLarge.override(
                            font: GoogleFonts.lexend(
                              fontWeight: FlutterFlowTheme.of(context)
                                  .labelLarge
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .labelLarge
                                  .fontStyle,
                            ),
                            color: FlutterFlowTheme.of(context).primary,
                            letterSpacing: 0.0,
                            fontWeight: FlutterFlowTheme.of(context)
                                .labelLarge
                                .fontWeight,
                            fontStyle: FlutterFlowTheme.of(context)
                                .labelLarge
                                .fontStyle,
                          ),
                    )),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      Theme(
                        data: ThemeData(
                          checkboxTheme: CheckboxThemeData(
                            visualDensity: VisualDensity.compact,
                            materialTapTargetSize:
                                MaterialTapTargetSize.shrinkWrap,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(4.0),
                            ),
                          ),
                          unselectedWidgetColor:
                              FlutterFlowTheme.of(context).alternate,
                        ),
                        child: Checkbox(
                          value: _model.checkbox12Value ??= false,
                          onChanged: (newValue) async {
                            safeSetState(
                                () => _model.checkbox12Value = newValue!);
                            if (newValue!) {
                              FFAppState().setIds = widget!.rows!
                                  .map((e) => e.id)
                                  .toList()
                                  .cast<int>();
                              FFAppState().update(() {});
                              safeSetState(() {
                                _model.clearReplicaEstacasCache();
                                _model.apiRequestCompleted = false;
                              });
                              await _model.waitForApiRequestCompleted();
                            } else {
                              FFAppState().setIds = [];
                              FFAppState().update(() {});
                              safeSetState(() {
                                _model.clearReplicaEstacasCache();
                                _model.apiRequestCompleted = false;
                              });
                              await _model.waitForApiRequestCompleted();
                            }
                          },
                          side: (FlutterFlowTheme.of(context).alternate != null)
                              ? BorderSide(
                                  width: 2,
                                  color:
                                      FlutterFlowTheme.of(context).alternate!,
                                )
                              : null,
                          activeColor: FlutterFlowTheme.of(context).primary,
                          checkColor: FlutterFlowTheme.of(context).info,
                        ),
                      ),
                      SelectionArea(
                          child: Text(
                        FFLocalizations.of(context).getText(
                          '6daasq6s' /* Selecionar todos */,
                        ),
                        style: FlutterFlowTheme.of(context).bodyMedium.override(
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
                      )),
                    ],
                  ),
                  Padding(
                    padding:
                        EdgeInsetsDirectional.fromSTEB(0.0, 16.0, 0.0, 16.0),
                    child: Builder(
                      builder: (context) {
                        final listRows = containerQueryAllRowsRecordsResponse
                            .jsonBody
                            .toList();

                        return GridView.builder(
                          padding: EdgeInsets.zero,
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            mainAxisSpacing: 16.0,
                            childAspectRatio: 10.0,
                          ),
                          shrinkWrap: true,
                          scrollDirection: Axis.vertical,
                          itemCount: listRows.length,
                          itemBuilder: (context, listRowsIndex) {
                            final listRowsItem = listRows[listRowsIndex];
                            return Row(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.start,
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
                                    value: _model
                                        .checkboxValueMap[listRowsItem] ??= () {
                                      if (FFAppState()
                                          .idsExistentes
                                          .contains(getJsonField(
                                            listRowsItem,
                                            r'''$.id''',
                                          ))) {
                                        return true;
                                      } else if (FFAppState()
                                          .setIds
                                          .contains(getJsonField(
                                            listRowsItem,
                                            r'''$.id''',
                                          ))) {
                                        return true;
                                      } else {
                                        return false;
                                      }
                                    }(),
                                    onChanged: FFAppState()
                                            .idsExistentes
                                            .contains(getJsonField(
                                              listRowsItem,
                                              r'''$.id''',
                                            ))
                                        ? null
                                        : (newValue) async {
                                            safeSetState(() =>
                                                _model.checkboxValueMap[
                                                    listRowsItem] = newValue!);
                                            if (newValue!) {
                                              FFAppState()
                                                  .addToSetIds(getJsonField(
                                                listRowsItem,
                                                r'''$.id''',
                                              ));
                                              FFAppState().update(() {});
                                            } else {
                                              FFAppState().removeFromSetIds(
                                                  getJsonField(
                                                listRowsItem,
                                                r'''$.id''',
                                              ));
                                              FFAppState().update(() {});
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
                                    checkColor: FFAppState()
                                            .idsExistentes
                                            .contains(getJsonField(
                                              listRowsItem,
                                              r'''$.id''',
                                            ))
                                        ? FlutterFlowTheme.of(context).alternate
                                        : FlutterFlowTheme.of(context).info,
                                  ),
                                ),
                                SelectionArea(
                                    child: Text(
                                  'Fileira ${getJsonField(
                                    listRowsItem,
                                    r'''$.row_number''',
                                  ).toString()}',
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
                                        letterSpacing: 0.0,
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .fontStyle,
                                      ),
                                )),
                              ],
                            );
                          },
                        );
                      },
                    ),
                  ),
                  Divider(
                    thickness: 1.0,
                    color: FlutterFlowTheme.of(context).alternate,
                  ),
                  Padding(
                    padding:
                        EdgeInsetsDirectional.fromSTEB(0.0, 12.0, 0.0, 0.0),
                    child: Row(
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        Expanded(
                          flex: 2,
                          child: FFButtonWidget(
                            onPressed: () async {
                              FFAppState().duplicado = true;
                              safeSetState(() {});
                              Navigator.pop(context);
                            },
                            text: FFLocalizations.of(context).getText(
                              'cfqj8am6' /* Confirmar */,
                            ),
                            options: FFButtonOptions(
                              width: double.infinity,
                              height: 40.0,
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 0.0, 0.0),
                              iconPadding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 0.0, 0.0),
                              color: FlutterFlowTheme.of(context).primary,
                              textStyle: FlutterFlowTheme.of(context)
                                  .labelMedium
                                  .override(
                                    font: GoogleFonts.lexend(
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .labelMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .labelMedium
                                          .fontStyle,
                                    ),
                                    color: FlutterFlowTheme.of(context).info,
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .fontStyle,
                                  ),
                              elevation: 0.0,
                              borderSide: BorderSide(
                                color: Colors.transparent,
                                width: 1.0,
                              ),
                              borderRadius: BorderRadius.circular(12.0),
                            ),
                          ),
                        ),
                      ].divide(SizedBox(width: 12.0)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
