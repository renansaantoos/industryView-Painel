import '/backend/api_requests/api_calls.dart';
import '/components/modal_empty_widget.dart';
import '/flows/modulos/info_drop/info_drop_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/flutter_flow_icon_button.dart'; // Imported for Edit/Delete icons
import '/flows/modal_criar_tarefa/modal_add_discipline_widget.dart';
import 'dart:async';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'drop_discipline_model.dart';
export 'drop_discipline_model.dart';

class DropDisciplineWidget extends StatefulWidget {
  const DropDisciplineWidget({
    super.key,
  });

  @override
  State<DropDisciplineWidget> createState() => _DropDisciplineWidgetState();
}

class _DropDisciplineWidgetState extends State<DropDisciplineWidget> {
  late DropDisciplineModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => DropDisciplineModel());

    _model.searchDropDisciplineTextController ??= TextEditingController();
    _model.searchDropDisciplineFocusNode ??= FocusNode();

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
          .discipline(
        requestFn: () => DisciplineGroup.disciplineCall.call(
          token: FFAppState().token,
          companyId: FFAppState().infoUser.companyId,
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
        final containerDisciplineResponse = snapshot.data!;

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
                      controller: _model.searchDropDisciplineTextController,
                      focusNode: _model.searchDropDisciplineFocusNode,
                      onChanged: (_) => EasyDebounce.debounce(
                        '_model.searchDropDisciplineTextController',
                        Duration(milliseconds: 500),
                        () async {
                          safeSetState(() {
                            _model.clearDisciplineCache();
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
                          .searchDropDisciplineTextControllerValidator
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
                        var listDiscipline = DisciplineGroup.disciplineCall
                                    .items(
                                      containerDisciplineResponse.jsonBody,
                                    )
                                    ?.toList() ??
                                [];
                        
                        if (_model.searchDropDisciplineTextController.text.isNotEmpty) {
                           final searchTerm = _model.searchDropDisciplineTextController.text.toLowerCase();
                           listDiscipline = listDiscipline.where((item) {
                             final name = getJsonField(item, r'''$.discipline''')?.toString().toLowerCase() ?? '';
                             return name.contains(searchTerm);
                           }).toList();
                        }

                        if (listDiscipline.isEmpty) {
                          return ModalEmptyWidget();
                        }

                        return ListView.builder(
                          padding: EdgeInsets.zero,
                          primary: false,
                          shrinkWrap: true,
                          scrollDirection: Axis.vertical,
                          itemCount: listDiscipline.length,
                          itemBuilder: (context, listDisciplineIndex) {
                            final listDisciplineItem = listDiscipline[listDisciplineIndex];
                            return Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: FlutterFlowTheme.of(context).secondaryBackground,
                                border: Border(
                                  bottom: BorderSide(
                                    color: FlutterFlowTheme.of(context).alternate,
                                    width: 1.0,
                                  ),
                                ),
                              ),
                              child: Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(12.0, 8.0, 12.0, 8.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    InkWell(
                                      splashColor: Colors.transparent,
                                      focusColor: Colors.transparent,
                                      hoverColor: Colors.transparent,
                                      highlightColor: Colors.transparent,
                                      onTap: () async {
                                        Navigator.pop(context, {
                                          'id': getJsonField(listDisciplineItem, r'''$.id'''),
                                          'name': getJsonField(listDisciplineItem, r'''$.discipline''')?.toString(),
                                        });
                                      },
                                      child: Text(
                                        valueOrDefault<String>(
                                          getJsonField(
                                            listDisciplineItem,
                                            r'''$.discipline''',
                                          )?.toString(),
                                          '-',
                                        ),
                                        style: FlutterFlowTheme.of(context).bodyMedium.override(
                                              font: GoogleFonts.lexend(
                                                fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                            ),
                                      ),
                                    ),
                                    Row(
                                      mainAxisSize: MainAxisSize.max,
                                      children: [
                                        FlutterFlowIconButton(
                                          borderColor: Colors.transparent,
                                          borderRadius: 20.0,
                                          borderWidth: 1.0,
                                          buttonSize: 40.0,
                                          icon: Icon(
                                            Icons.edit,
                                            color: FlutterFlowTheme.of(context).secondaryText,
                                            size: 20.0,
                                          ),
                                          onPressed: () async {
                                            await showDialog(
                                              context: context,
                                              builder: (dialogContext) {
                                                return ModalAddDisciplineWidget(
                                                  id: getJsonField(listDisciplineItem, r'''$.id'''),
                                                  name: getJsonField(listDisciplineItem, r'''$.discipline''')?.toString(),
                                                  action: () async {
                                                    safeSetState(() {
                                                      _model.clearDisciplineCache();
                                                      _model.apiRequestCompleted = false;
                                                    });
                                                    await _model.waitForApiRequestCompleted();
                                                  },
                                                );
                                              },
                                            );
                                          },
                                        ),
                                        FlutterFlowIconButton(
                                          borderColor: Colors.transparent,
                                          borderRadius: 20.0,
                                          borderWidth: 1.0,
                                          buttonSize: 40.0,
                                          icon: Icon(
                                            Icons.delete_outline,
                                            color: FlutterFlowTheme.of(context).secondaryText,
                                            size: 20.0,
                                          ),
                                          onPressed: () async {
                                            var confirmDialogResponse = await showDialog<bool>(
                                                  context: context,
                                                  builder: (alertDialogContext) {
                                                    return AlertDialog(
                                                      title: Text('Deletar'),
                                                      content: Text('Deseja realmente deletar esta disciplina?'),
                                                      actions: [
                                                        TextButton(
                                                          onPressed: () => Navigator.pop(alertDialogContext, false),
                                                          child: Text('Cancelar'),
                                                        ),
                                                        TextButton(
                                                          onPressed: () => Navigator.pop(alertDialogContext, true),
                                                          child: Text('Confirmar'),
                                                        ),
                                                      ],
                                                    );
                                                  },
                                                ) ??
                                                false;
                                            if (confirmDialogResponse) {
                                              await DisciplineGroup.deleteDisciplineCall.call(
                                                disciplineId: getJsonField(listDisciplineItem, r'''$.id'''),
                                                token: FFAppState().token,
                                              );
                                              safeSetState(() {
                                                _model.clearDisciplineCache();
                                                _model.apiRequestCompleted = false;
                                              });
                                              await _model.waitForApiRequestCompleted();
                                            }
                                          },
                                        ),
                                      ],
                                    ),
                                  ],
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
                  alignment: AlignmentDirectional(0.0, 1.0),
                  child: Builder(
                    builder: (context) => Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(12.0, 6.0, 12.0, 20.0),
                      child: FFButtonWidget(
                        onPressed: () async {
                          final result = await showDialog(
                            context: context,
                            builder: (dialogContext) {
                              return ModalAddDisciplineWidget();
                            },
                          );
                          
                          if (result != null) {
                             Navigator.pop(context, {
                               'id': result['id'],
                               'name': result['name'],
                             });
                          }
                        },
                        text: 'Criar Disciplina',
                        options: FFButtonOptions(
                          width: double.infinity,
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
