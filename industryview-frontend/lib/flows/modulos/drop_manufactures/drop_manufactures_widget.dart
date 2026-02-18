import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_criar_tipos_f_m_t_widget.dart';
import '/components/modal_empty_widget.dart';
import '/flows/modulos/info_drop/info_drop_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'dart:async';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'drop_manufactures_model.dart';
export 'drop_manufactures_model.dart';

class DropManufacturesWidget extends StatefulWidget {
  const DropManufacturesWidget({
    super.key,
    required this.equipamentType,
  });

  final int? equipamentType;

  @override
  State<DropManufacturesWidget> createState() => _DropManufacturesWidgetState();
}

class _DropManufacturesWidgetState extends State<DropManufacturesWidget> {
  late DropManufacturesModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => DropManufacturesModel());

    _model.searchDropManufacturersTextController ??= TextEditingController();
    _model.searchDropManufacturersFocusNode ??= FocusNode();

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
          .manufactures(
        requestFn: () =>
            ManufacturersGroup.queryAllManufacturersRecordsCall.call(
          bearerAuth: FFAppState().token,
          search: _model.searchDropManufacturersTextController.text,
          equipamentsTypeId: widget!.equipamentType,
        ),
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
        final containerManufacturesQueryAllManufacturersRecordsResponse =
            snapshot.data!;

        return Material(
          color: Colors.transparent,
          elevation: 2.0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(4.0),
          ),
          child: Container(
            constraints: BoxConstraints(
              maxHeight: 350.0,
            ),
            decoration: BoxDecoration(
              color: FlutterFlowTheme.of(context).primaryBackground,
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
              borderRadius: BorderRadius.circular(4.0),
              border: Border.all(
                color: FlutterFlowTheme.of(context).alternate,
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: EdgeInsets.all(10.0),
                  child: Container(
                    width: MediaQuery.sizeOf(context).width * 1.0,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    child: TextFormField(
                      controller: _model.searchDropManufacturersTextController,
                      focusNode: _model.searchDropManufacturersFocusNode,
                      onChanged: (_) => EasyDebounce.debounce(
                        '_model.searchDropManufacturersTextController',
                        Duration(milliseconds: 500),
                        () async {
                          safeSetState(() {
                            _model.clearManufacturesCache();
                            _model.apiRequestCompleted = false;
                          });
                          await _model.waitForApiRequestCompleted();
                        },
                      ),
                      autofocus: false,
                      obscureText: false,
                      decoration: InputDecoration(
                        labelStyle:
                            FlutterFlowTheme.of(context).labelSmall.override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .labelSmall
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .labelSmall
                                      .fontStyle,
                                ),
                        hintText: FFLocalizations.of(context).getText(
                          'hhdwsf0x' /* Procurar */,
                        ),
                        hintStyle:
                            FlutterFlowTheme.of(context).labelSmall.override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .labelSmall
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .labelSmall
                                      .fontStyle,
                                ),
                        enabledBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: FlutterFlowTheme.of(context).alternate,
                            width: 2.0,
                          ),
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: FlutterFlowTheme.of(context).primary,
                            width: 2.0,
                          ),
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        errorBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: FlutterFlowTheme.of(context).alternate,
                            width: 2.0,
                          ),
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        focusedErrorBorder: OutlineInputBorder(
                          borderSide: BorderSide(
                            color: FlutterFlowTheme.of(context).alternate,
                            width: 2.0,
                          ),
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        filled: true,
                        fillColor:
                            FlutterFlowTheme.of(context).primaryBackground,
                      ),
                      style: FlutterFlowTheme.of(context).labelSmall.override(
                            font: GoogleFonts.lexend(
                              fontWeight: FlutterFlowTheme.of(context)
                                  .labelSmall
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .labelSmall
                                  .fontStyle,
                            ),
                            color: FlutterFlowTheme.of(context).primaryText,
                            letterSpacing: 0.0,
                            fontWeight: FlutterFlowTheme.of(context)
                                .labelSmall
                                .fontWeight,
                            fontStyle: FlutterFlowTheme.of(context)
                                .labelSmall
                                .fontStyle,
                          ),
                      validator: _model
                          .searchDropManufacturersTextControllerValidator
                          .asValidator(context),
                    ),
                  ),
                ),
                Flexible(
                  child: Padding(
                    padding:
                        EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 16.0),
                    child: Builder(
                      builder: (context) {
                        final listTypeManufacturers =
                            ManufacturersGroup.queryAllManufacturersRecordsCall
                                    .list(
                                      containerManufacturesQueryAllManufacturersRecordsResponse
                                          .jsonBody,
                                    )
                                    ?.toList() ??
                                [];
                        if (listTypeManufacturers.isEmpty) {
                          return ModalEmptyWidget();
                        }

                        return ListView.builder(
                          padding: EdgeInsets.zero,
                          primary: false,
                          shrinkWrap: true,
                          scrollDirection: Axis.vertical,
                          itemCount: listTypeManufacturers.length,
                          itemBuilder: (context, listTypeManufacturersIndex) {
                            final listTypeManufacturersItem =
                                listTypeManufacturers[
                                    listTypeManufacturersIndex];
                            return InkWell(
                              splashColor: Colors.transparent,
                              focusColor: Colors.transparent,
                              hoverColor: Colors.transparent,
                              highlightColor: Colors.transparent,
                              onTap: () async {
                                FFAppState().filterManufactures = FilterStruct(
                                  name: valueOrDefault<String>(
                                    getJsonField(
                                      listTypeManufacturersItem,
                                      r'''$.name''',
                                    )?.toString(),
                                    '-',
                                  ),
                                  id: getJsonField(
                                    listTypeManufacturersItem,
                                    r'''$.id''',
                                  ),
                                );
                                FFAppState().update(() {});
                                Navigator.pop(context, true);
                              },
                              child: InfoDropWidget(
                                key: Key(
                                    'Keyypx_${listTypeManufacturersIndex}_of_${listTypeManufacturers.length}'),
                                varText: valueOrDefault<String>(
                                  getJsonField(
                                    listTypeManufacturersItem,
                                    r'''$.name''',
                                  )?.toString(),
                                  '-',
                                ),
                                varId: valueOrDefault<int>(
                                  getJsonField(
                                    listTypeManufacturersItem,
                                    r'''$.id''',
                                  ),
                                  0,
                                ),
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ),
                ),
                Align(
                  alignment: AlignmentDirectional(-1.0, 1.0),
                  child: Builder(
                    builder: (context) => Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(10.0, 6.0, 0.0, 20.0),
                      child: FFButtonWidget(
                        onPressed: () async {
                          await showDialog(
                            context: context,
                            builder: (dialogContext) {
                              return Dialog(
                                elevation: 0,
                                insetPadding: EdgeInsets.zero,
                                backgroundColor: Colors.transparent,
                                alignment: AlignmentDirectional(0.0, 0.0)
                                    .resolve(Directionality.of(context)),
                                child: ModalCriarTiposFMTWidget(
                                  tipo: 'F',
                                  equipamentTypeId: widget!.equipamentType!,
                                  refresh: () async {
                                    safeSetState(() {
                                      _model.clearManufacturesCache();
                                      _model.apiRequestCompleted = false;
                                    });
                                    await _model.waitForApiRequestCompleted();
                                  },
                                ),
                              );
                            },
                          );
                        },
                        text: FFLocalizations.of(context).getText(
                          '6ogm4jb4' /* Criar Fabricante */,
                        ),
                        options: FFButtonOptions(
                          height: 40.0,
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 16.0, 0.0),
                          iconPadding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 0.0, 0.0, 0.0),
                          color: FlutterFlowTheme.of(context).primary,
                          textStyle:
                              FlutterFlowTheme.of(context).labelMedium.override(
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
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
