import '/backend/api_requests/api_calls.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flows/modal_criar_tarefa/modal_criar_tarefa_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'options_tarefas_model.dart';
export 'options_tarefas_model.dart';

class OptionsTarefasWidget extends StatefulWidget {
  const OptionsTarefasWidget({
    super.key,
    this.typePage,
    this.description,
    this.equipamentTxt,
    this.equipamentId,
    this.wight,
    this.id,
    required this.unity,
    this.discipline,
  });

  final String? typePage;
  final String? description;
  final String? equipamentTxt;
  final int? equipamentId;
  final double? wight;
  final int? id;
  final int? unity;
  final int? discipline;

  @override
  State<OptionsTarefasWidget> createState() => _OptionsTarefasWidgetState();
}

class _OptionsTarefasWidgetState extends State<OptionsTarefasWidget> {
  late OptionsTarefasModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => OptionsTarefasModel());

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
                    barrierColor: Color(0x80000000),
                    context: context,
                    builder: (dialogContext) {
                      return Dialog(
                        elevation: 0,
                        insetPadding: EdgeInsets.zero,
                        backgroundColor: Colors.transparent,
                        alignment: AlignmentDirectional(0.0, 0.0)
                            .resolve(Directionality.of(context)),
                        child: ModalCriarTarefaWidget(
                          typePage: 'edit',
                          desciption: widget!.description,
                          equipamentTxt: widget!.equipamentTxt,
                          equipamentId: widget!.equipamentId,
                          wight: widget!.wight,
                          id: widget!.id,
                          unity: widget!.unity,
                          discipline: widget!.discipline,
                        ),
                      );
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
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 0.0, 0.0),
                          child: Text(
                            FFLocalizations.of(context).getText(
                              '14p4bxkk' /* Editar tarefa */,
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
                  _model.check = await ProjectsGroup.checkTaskBacklogCall.call(
                    token: FFAppState().token,
                    projectsId: FFAppState().projectsInfo.id,
                    tasksId: widget!.id,
                  );

                  if (!(ProjectsGroup.checkTaskBacklogCall.list(
                            (_model.check?.jsonBody ?? ''),
                          ) !=
                          null &&
                      (ProjectsGroup.checkTaskBacklogCall.list(
                        (_model.check?.jsonBody ?? ''),
                      ))!
                          .isNotEmpty)) {
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
                            title: 'Atenção: Tarefa em Sprint',
                            description:
                                'Esta tarefa não pode ser excluída, pois já está associada e em execução na sprint atual.',
                          ),
                        );
                      },
                    );
                  } else {
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
                              'ps5k4bqj' /* Deletetar Tarefa */,
                            ),
                            description: FFLocalizations.of(context).getText(
                              'zqjuqgnd' /* Tem certeza que deseja deletar... */,
                            ),
                            actionAPi: () async {
                              var _shouldSetState = false;
                              _model.aPiDeactivateTask =
                                  await TasksGroup.deactivateTaskCall.call(
                                tasksId: widget!.id,
                                bearerAuth: FFAppState().token,
                              );

                              _shouldSetState = true;
                              if ((_model.aPiDeactivateTask?.succeeded ??
                                  true)) {
                                return;
                              }

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
                                        '3cn71kkb' /* Erro! */,
                                      ),
                                      description: getJsonField(
                                        (_model.aPiDeactivateTask?.jsonBody ??
                                            ''),
                                        r'''$.message''',
                                      ).toString(),
                                    ),
                                  );
                                },
                              );

                              return;
                            },
                            actionPage: () async {
                              context.pushNamed(
                                TarefasWidget.routeName,
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
                  }

                  Navigator.pop(context);

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
                              'y4ty0vsp' /* Deletar */,
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
