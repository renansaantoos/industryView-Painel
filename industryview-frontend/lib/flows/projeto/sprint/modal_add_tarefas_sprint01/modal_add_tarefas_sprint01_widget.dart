import '/backend/api_requests/api_calls.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flows/projeto/gestao_de_equipe/loading/loading_widget.dart';
import '/flows/projeto/sprint/modal_add_tarefas_sprint02/modal_add_tarefas_sprint02_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_add_tarefas_sprint01_model.dart';
export 'modal_add_tarefas_sprint01_model.dart';

class ModalAddTarefasSprint01Widget extends StatefulWidget {
  const ModalAddTarefasSprint01Widget({
    super.key,
    required this.sprintId,
    required this.json,
    required this.typePage,
    this.sprintRef,
  });

  final int? sprintId;
  final dynamic json;
  final String? typePage;
  final dynamic sprintRef;

  @override
  State<ModalAddTarefasSprint01Widget> createState() =>
      _ModalAddTarefasSprint01WidgetState();
}

class _ModalAddTarefasSprint01WidgetState
    extends State<ModalAddTarefasSprint01Widget> {
  late ModalAddTarefasSprint01Model _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalAddTarefasSprint01Model());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      FFAppState().loading = true;
      safeSetState(() {});
      _model.varGetTeams = [];
      _model.teamId = null;
      safeSetState(() {});
      _model.getTeams = await ProjectsGroup.getTeamsRecordCall.call(
        bearerAuth: FFAppState().token,
        projectsId: FFAppState().projectsInfo.id,
      );

      if ((_model.getTeams?.succeeded ?? true)) {
        if (widget!.typePage == 'edit') {
          _model.teamId = getJsonField(
            widget!.sprintRef,
            r'''$.teams.id''',
          );
          safeSetState(() {});
        } else {
          _model.teamId = getJsonField(
            (_model.getTeams?.jsonBody ?? ''),
            r'''$[0].id''',
          );
          safeSetState(() {});
        }

        _model.varGetTeams = ((_model.getTeams?.jsonBody ?? '') as List?)
                ?.cast<dynamic>() ??
            [];
        _model.varLeaders = [];
        safeSetState(() {});
        _model.getLeadersLoad =
            await ProjectsGroup.queryToGetAllLidersFromATeamCall.call(
          teamsId: _model.teamId,
          projectsId: FFAppState().projectsInfo.id,
          page: 1,
          perPage: 10,
          bearerAuth: FFAppState().token,
        );

        if ((_model.getLeadersLoad?.succeeded ?? true)) {
          _model.varLeaders = ProjectsGroup.queryToGetAllLidersFromATeamCall
              .list(
                (_model.getLeadersLoad?.jsonBody ?? ''),
              )
              ?.toList()
              .cast<dynamic>() ?? [];
          safeSetState(() {});
          FFAppState().loading = false;
          safeSetState(() {});
          return;
        } else {
          FFAppState().loading = false;
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
                  title: FFLocalizations.of(context).getText(
                    'vp3h54t2' /* Erro */,
                  ),
                  description: getJsonField(
                    (_model.getLeadersLoad?.jsonBody ?? ''),
                    r'''$.message''',
                  ).toString(),
                ),
              );
            },
          );

          return;
        }
      } else {
        FFAppState().loading = false;
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
                title: FFLocalizations.of(context).getText(
                  'szimoncz' /* Erro */,
                ),
                description: getJsonField(
                  (_model.getTeams?.jsonBody ?? ''),
                  r'''$.message''',
                ).toString(),
              ),
            );
          },
        );

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

    return Builder(
      builder: (context) => Padding(
        padding: EdgeInsets.all(24.0),
        child: Container(
          width: 830.0,
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
            padding: EdgeInsets.all(32.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Column(
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        Align(
                          alignment: AlignmentDirectional(-1.0, -1.0),
                          child: Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                0.0, 0.0, 0.0, 4.0),
                            child: SelectionArea(
                                child: Text(
                              FFLocalizations.of(context).getText(
                                'wkwh1zy6' /* Escolher equipe responsável */,
                              ),
                              style: FlutterFlowTheme.of(context)
                                  .titleLarge
                                  .override(
                                    font: GoogleFonts.lexend(
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .titleLarge
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .titleLarge
                                          .fontStyle,
                                    ),
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .titleLarge
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .titleLarge
                                        .fontStyle,
                                  ),
                            )),
                          ),
                        ),
                      ],
                    ),
                    Align(
                      alignment: AlignmentDirectional(-1.0, -1.0),
                      child: Padding(
                        padding:
                            EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 16.0),
                        child: SelectionArea(
                            child: Text(
                          FFLocalizations.of(context).getText(
                            'xp5ktlnq' /* Veja a lista de todos os colab... */,
                          ),
                          style:
                              FlutterFlowTheme.of(context).labelMedium.override(
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
                    ),
                    Divider(
                      thickness: 1.0,
                      color: FlutterFlowTheme.of(context).alternate,
                    ),
                  ],
                ),
                Align(
                  alignment: AlignmentDirectional(-1.0, -1.0),
                  child: SelectionArea(
                      child: Text(
                    FFLocalizations.of(context).getText(
                      'qjz7v2z7' /* Antes de adicionar as tarefas,... */,
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
                          color: FlutterFlowTheme.of(context).primaryText,
                          letterSpacing: 0.0,
                          fontWeight: FlutterFlowTheme.of(context)
                              .labelLarge
                              .fontWeight,
                          fontStyle:
                              FlutterFlowTheme.of(context).labelLarge.fontStyle,
                        ),
                  )),
                ),
                Column(
                  mainAxisSize: MainAxisSize.max,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Stack(
                      children: [
                        Column(
                          mainAxisSize: MainAxisSize.max,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Align(
                              alignment: AlignmentDirectional(-1.0, -1.0),
                              child: Builder(
                                builder: (context) {
                                  final listTeams = _model.varGetTeams.toList();

                                  return Wrap(
                                    spacing: 0.0,
                                    runSpacing: 0.0,
                                    alignment: WrapAlignment.start,
                                    crossAxisAlignment:
                                        WrapCrossAlignment.start,
                                    direction: Axis.horizontal,
                                    runAlignment: WrapAlignment.start,
                                    verticalDirection: VerticalDirection.down,
                                    clipBehavior: Clip.none,
                                    children: List.generate(listTeams.length,
                                        (listTeamsIndex) {
                                      final listTeamsItem =
                                          listTeams[listTeamsIndex];
                                      return Builder(
                                        builder: (context) => Padding(
                                          padding: EdgeInsets.all(6.0),
                                          child: InkWell(
                                            splashColor: Colors.transparent,
                                            focusColor: Colors.transparent,
                                            hoverColor: Colors.transparent,
                                            highlightColor: Colors.transparent,
                                            onTap: () async {
                                              var _shouldSetState = false;
                                              FFAppState().setIds = [];
                                              safeSetState(() {});
                                              _model.getLeadersTap =
                                                  await ProjectsGroup
                                                      .queryToGetAllLidersFromATeamCall
                                                      .call(
                                                teamsId: getJsonField(
                                                  listTeamsItem,
                                                  r'''$.id''',
                                                ),
                                                projectsId: FFAppState()
                                                    .projectsInfo
                                                    .id,
                                                page: 1,
                                                perPage: 10,
                                                bearerAuth: FFAppState().token,
                                              );

                                              _shouldSetState = true;
                                              if ((_model.getLeadersTap
                                                      ?.succeeded ??
                                                  true)) {
                                                _model.teamId = getJsonField(
                                                  listTeamsItem,
                                                  r'''$.id''',
                                                );
                                                _model.varLeaders = ProjectsGroup
                                                    .queryToGetAllLidersFromATeamCall
                                                    .list(
                                                      (_model.getLeadersTap
                                                              ?.jsonBody ??
                                                          ''),
                                                    )
                                                    ?.toList()
                                                    .cast<dynamic>() ?? [];
                                                safeSetState(() {});
                                                if (_shouldSetState)
                                                  safeSetState(() {});
                                                return;
                                              } else {
                                                await showDialog(
                                                  context: context,
                                                  builder: (dialogContext) {
                                                    return Dialog(
                                                      elevation: 0,
                                                      insetPadding:
                                                          EdgeInsets.zero,
                                                      backgroundColor:
                                                          Colors.transparent,
                                                      alignment:
                                                          AlignmentDirectional(
                                                                  0.0, 0.0)
                                                              .resolve(
                                                                  Directionality.of(
                                                                      context)),
                                                      child: ModalInfoWidget(
                                                        title:
                                                            FFLocalizations.of(
                                                                    context)
                                                                .getText(
                                                          'gkgs1g8m' /* Erro */,
                                                        ),
                                                        description:
                                                            getJsonField(
                                                          (_model.getLeadersTap
                                                                  ?.jsonBody ??
                                                              ''),
                                                          r'''$.message''',
                                                        ).toString(),
                                                      ),
                                                    );
                                                  },
                                                );

                                                if (_shouldSetState)
                                                  safeSetState(() {});
                                                return;
                                              }

                                              if (_shouldSetState)
                                                safeSetState(() {});
                                            },
                                            child: Container(
                                              decoration: BoxDecoration(
                                                color: _model.teamId ==
                                                        getJsonField(
                                                          listTeamsItem,
                                                          r'''$.id''',
                                                        )
                                                    ? FlutterFlowTheme.of(
                                                            context)
                                                        .primary
                                                    : FlutterFlowTheme.of(
                                                            context)
                                                        .secondary,
                                                borderRadius:
                                                    BorderRadius.circular(
                                                        100.0),
                                                border: Border.all(
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .primary,
                                                  width: 1.0,
                                                ),
                                              ),
                                              child: Padding(
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        16.0, 8.0, 16.0, 8.0),
                                                child: Text(
                                                  getJsonField(
                                                    listTeamsItem,
                                                    r'''$.name''',
                                                  ).toString(),
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .labelMedium
                                                      .override(
                                                        font:
                                                            GoogleFonts.lexend(
                                                          fontWeight:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .labelMedium
                                                                  .fontWeight,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .labelMedium
                                                                  .fontStyle,
                                                        ),
                                                        color: _model.teamId ==
                                                                getJsonField(
                                                                  listTeamsItem,
                                                                  r'''$.id''',
                                                                )
                                                            ? FlutterFlowTheme
                                                                    .of(context)
                                                                .info
                                                            : FlutterFlowTheme
                                                                    .of(context)
                                                                .primary,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelMedium
                                                                .fontStyle,
                                                      ),
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      );
                                    }),
                                  );
                                },
                              ),
                            ),
                            Builder(
                              builder: (context) {
                                final listLeaders = _model.varLeaders.toList();

                                return Wrap(
                                  spacing: 0.0,
                                  runSpacing: 0.0,
                                  alignment: WrapAlignment.start,
                                  crossAxisAlignment: WrapCrossAlignment.start,
                                  direction: Axis.horizontal,
                                  runAlignment: WrapAlignment.start,
                                  verticalDirection: VerticalDirection.down,
                                  clipBehavior: Clip.none,
                                  children: List.generate(listLeaders.length,
                                      (listLeadersIndex) {
                                    final listLeadersItem =
                                        listLeaders[listLeadersIndex];
                                    return Padding(
                                      padding: EdgeInsets.all(6.0),
                                      child: Material(
                                        color: Colors.transparent,
                                        elevation: 1.0,
                                        shape: RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                        ),
                                        child: Container(
                                          width:
                                              MediaQuery.sizeOf(context).width *
                                                  0.2,
                                          decoration: BoxDecoration(
                                            color: FlutterFlowTheme.of(context)
                                                .secondaryBackground,
                                            borderRadius:
                                                BorderRadius.circular(12.0),
                                            border: Border.all(
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .alternate,
                                            ),
                                          ),
                                          child: Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    12.0, 12.0, 12.0, 12.0),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Stack(
                                                  alignment:
                                                      AlignmentDirectional(
                                                          1.0, 1.0),
                                                  children: [
                                                    ClipRRect(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              40.0),
                                                      child: Image.network(
                                                        valueOrDefault<String>(
                                                          getJsonField(
                                                            listLeadersItem,
                                                            r'''$.profile_picture.url''',
                                                          )?.toString(),
                                                          'https://x8ki-letl-twmt.n7.xano.io/vault/iaWPz-tD/8ler69Ci8dU8B1ExemIRgXluexs/JGrgRQ../no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg ',
                                                        ),
                                                        width: 40.0,
                                                        height: 40.0,
                                                        fit: BoxFit.cover,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                Padding(
                                                  padding: EdgeInsetsDirectional
                                                      .fromSTEB(
                                                          8.0, 0.0, 0.0, 0.0),
                                                  child: Column(
                                                    mainAxisSize:
                                                        MainAxisSize.min,
                                                    mainAxisAlignment:
                                                        MainAxisAlignment
                                                            .center,
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Row(
                                                        mainAxisSize:
                                                            MainAxisSize.max,
                                                        children: [
                                                          SelectionArea(
                                                              child: Text(
                                                            valueOrDefault<
                                                                String>(
                                                              getJsonField(
                                                                listLeadersItem,
                                                                r'''$.user.name''',
                                                              )?.toString(),
                                                              'N/A',
                                                            ),
                                                            style: FlutterFlowTheme
                                                                    .of(context)
                                                                .bodyMedium
                                                                .override(
                                                                  font: GoogleFonts
                                                                      .lexend(
                                                                    fontWeight: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodyMedium
                                                                        .fontWeight,
                                                                    fontStyle: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodyMedium
                                                                        .fontStyle,
                                                                  ),
                                                                  letterSpacing:
                                                                      0.0,
                                                                  fontWeight: FlutterFlowTheme.of(
                                                                          context)
                                                                      .bodyMedium
                                                                      .fontWeight,
                                                                  fontStyle: FlutterFlowTheme.of(
                                                                          context)
                                                                      .bodyMedium
                                                                      .fontStyle,
                                                                ),
                                                          )),
                                                        ].divide(SizedBox(
                                                            width: 4.0)),
                                                      ),
                                                      SelectionArea(
                                                          child: Text(
                                                        valueOrDefault<String>(
                                                          getJsonField(
                                                            listLeadersItem,
                                                            r'''$.user.users_roles.role''',
                                                          )?.toString(),
                                                          'N/A',
                                                        ),
                                                        style:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .override(
                                                                  font: GoogleFonts
                                                                      .lexend(
                                                                    fontWeight: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodyMedium
                                                                        .fontWeight,
                                                                    fontStyle: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodyMedium
                                                                        .fontStyle,
                                                                  ),
                                                                  color: FlutterFlowTheme.of(
                                                                          context)
                                                                      .primary,
                                                                  letterSpacing:
                                                                      0.0,
                                                                  fontWeight: FlutterFlowTheme.of(
                                                                          context)
                                                                      .bodyMedium
                                                                      .fontWeight,
                                                                  fontStyle: FlutterFlowTheme.of(
                                                                          context)
                                                                      .bodyMedium
                                                                      .fontStyle,
                                                                ),
                                                      )),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ),
                                    );
                                  }),
                                );
                              },
                            ),
                            Align(
                              alignment: AlignmentDirectional(1.0, 1.0),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  FFButtonWidget(
                                    onPressed: () async {
                                      Navigator.pop(context);
                                    },
                                    text: FFLocalizations.of(context).getText(
                                      'rok8rees' /* Cancelar */,
                                    ),
                                    options: FFButtonOptions(
                                      width: 200.0,
                                      height: 40.0,
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          16.0, 0.0, 16.0, 0.0),
                                      iconPadding:
                                          EdgeInsetsDirectional.fromSTEB(
                                              0.0, 0.0, 0.0, 0.0),
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryBackground,
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
                                        color: FlutterFlowTheme.of(context)
                                            .alternate,
                                        width: 1.0,
                                      ),
                                      borderRadius: BorderRadius.circular(12.0),
                                      hoverColor: FlutterFlowTheme.of(context)
                                          .hoverNavBar,
                                      hoverBorderSide: BorderSide(
                                        color: FlutterFlowTheme.of(context)
                                            .hoverNavBar,
                                        width: 1.0,
                                      ),
                                      hoverTextColor:
                                          FlutterFlowTheme.of(context)
                                              .secondaryBackground,
                                    ),
                                  ),
                                  Builder(
                                    builder: (context) => FFButtonWidget(
                                      onPressed: () async {
                                        var _shouldSetState = false;
                                        if (widget!.typePage == 'edit') {
                                          _model.editTaskSprint =
                                              await SprintsGroup
                                                  .editSprintsTasksRecordCall
                                                  .call(
                                            sprintsTasksId: getJsonField(
                                              widget!.sprintRef,
                                              r'''$.id''',
                                            ),
                                            bearerAuth: FFAppState().token,
                                            sprintsId: widget!.sprintId,
                                            teamsId: _model.teamId,
                                            sprintsTasksStatusesId: 1,
                                          );

                                          _shouldSetState = true;
                                          if ((_model
                                                  .editTaskSprint?.succeeded ??
                                              true)) {
                                            await showDialog(
                                              context: context,
                                              builder: (dialogContext) {
                                                return Dialog(
                                                  elevation: 0,
                                                  insetPadding: EdgeInsets.zero,
                                                  backgroundColor:
                                                      Colors.transparent,
                                                  alignment:
                                                      AlignmentDirectional(
                                                              0.0, 0.0)
                                                          .resolve(
                                                              Directionality.of(
                                                                  context)),
                                                  child: ModalInfoWidget(
                                                    title: FFLocalizations.of(
                                                            context)
                                                        .getText(
                                                      'cekgza7o' /* Sua equipe foi editada */,
                                                    ),
                                                    description:
                                                        FFLocalizations.of(
                                                                context)
                                                            .getText(
                                                      'q59ttcjh' /* Dados salvo com sucesso. */,
                                                    ),
                                                  ),
                                                );
                                              },
                                            );

                                            context.pushNamed(
                                              SprintAtualWidget.routeName,
                                              queryParameters: {
                                                'sprintId': serializeParam(
                                                  widget!.sprintId,
                                                  ParamType.int,
                                                ),
                                                'json': serializeParam(
                                                  widget!.json,
                                                  ParamType.JSON,
                                                ),
                                              }.withoutNulls,
                                              extra: <String, dynamic>{
                                                kTransitionInfoKey:
                                                    TransitionInfo(
                                                  hasTransition: true,
                                                  transitionType:
                                                      PageTransitionType.fade,
                                                  duration:
                                                      Duration(milliseconds: 0),
                                                ),
                                              },
                                            );

                                            if (_shouldSetState)
                                              safeSetState(() {});
                                            return;
                                          } else {
                                            await showDialog(
                                              context: context,
                                              builder: (dialogContext) {
                                                return Dialog(
                                                  elevation: 0,
                                                  insetPadding: EdgeInsets.zero,
                                                  backgroundColor:
                                                      Colors.transparent,
                                                  alignment:
                                                      AlignmentDirectional(
                                                              0.0, 0.0)
                                                          .resolve(
                                                              Directionality.of(
                                                                  context)),
                                                  child: ModalInfoWidget(
                                                    title: FFLocalizations.of(
                                                            context)
                                                        .getText(
                                                      'hwr8elup' /* Erro */,
                                                    ),
                                                    description: getJsonField(
                                                      (_model.editTaskSprint
                                                              ?.jsonBody ??
                                                          ''),
                                                      r'''$.message''',
                                                    ).toString(),
                                                  ),
                                                );
                                              },
                                            );

                                            if (_shouldSetState)
                                              safeSetState(() {});
                                            return;
                                          }
                                        } else {
                                          Navigator.pop(context);
                                          await showDialog(
                                            barrierColor: Color(0x80000000),
                                            context: context,
                                            builder: (dialogContext) {
                                              return Dialog(
                                                elevation: 0,
                                                insetPadding: EdgeInsets.zero,
                                                backgroundColor:
                                                    Colors.transparent,
                                                alignment: AlignmentDirectional(
                                                        0.0, 0.0)
                                                    .resolve(Directionality.of(
                                                        context)),
                                                child:
                                                    ModalAddTarefasSprint02Widget(
                                                  sprintId: widget!.sprintId ?? 0,
                                                  teamId: _model.teamId ?? 0,
                                                  json: widget!.json,
                                                  typePage: widget!.typePage ?? 'creat',
                                                ),
                                              );
                                            },
                                          );

                                          if (_shouldSetState)
                                            safeSetState(() {});
                                          return;
                                        }

                                        if (_shouldSetState)
                                          safeSetState(() {});
                                      },
                                      text: widget!.typePage == 'edit'
                                          ? 'Salvar'
                                          : 'Próximo',
                                      options: FFButtonOptions(
                                        width: 200.0,
                                        height: 40.0,
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            16.0, 0.0, 16.0, 0.0),
                                        iconPadding:
                                            EdgeInsetsDirectional.fromSTEB(
                                                0.0, 0.0, 0.0, 0.0),
                                        color: FlutterFlowTheme.of(context)
                                            .primary,
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
                                              color:
                                                  FlutterFlowTheme.of(context)
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
                                        borderRadius:
                                            BorderRadius.circular(12.0),
                                      ),
                                    ),
                                  ),
                                ].divide(SizedBox(width: 12.0)),
                              ),
                            ),
                          ].divide(SizedBox(height: 8.0)),
                        ),
                        wrapWithModel(
                          model: _model.loadingModel,
                          updateCallback: () => safeSetState(() {}),
                          child: LoadingWidget(),
                        ),
                      ],
                    ),
                  ].divide(SizedBox(height: 16.0)),
                ),
              ].divide(SizedBox(height: 16.0)),
            ),
          ),
        ),
      ),
    );
  }
}
