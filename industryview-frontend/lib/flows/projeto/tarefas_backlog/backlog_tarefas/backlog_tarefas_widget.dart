import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/filtro_sprint_backlog/filtro_sprint_backlog_widget.dart';
import '/components/modal_empty_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/flows/projeto/tarefas_backlog/modal_add_backlog_manual/modal_add_backlog_manual_widget.dart';
import '/flows/projeto/tarefas_backlog/modal_add_tarefas_backlog/modal_add_tarefas_backlog_widget.dart';
import '/flows/projeto/tarefas_backlog/modal_subtasks/modal_subtasks_widget.dart';
import '/flows/projeto/tarefas_backlog/options_tarefas_projeto/options_tarefas_projeto_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/flutter_flow/custom_functions.dart' as functions;
import '/index.dart';
import 'dart:async';
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'backlog_tarefas_model.dart';
export 'backlog_tarefas_model.dart';

class BacklogTarefasWidget extends StatefulWidget {
  const BacklogTarefasWidget({
    super.key,
  });

  static String routeName = 'BacklogTarefas';
  static String routePath = '/backlogTarefas';

  @override
  State<BacklogTarefasWidget> createState() => _BacklogTarefasWidgetState();
}

class _BacklogTarefasWidgetState extends State<BacklogTarefasWidget> {
  late BacklogTarefasModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => BacklogTarefasModel());

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      Function() _navigate = () {};
      _model.aPiTokenAuth = await AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall
          .call(
        bearerAuth: FFAppState().token,
      );

      if (!(_model.aPiTokenAuth?.succeeded ?? true)) {
        GoRouter.of(context).prepareAuthEvent();
        await authManager.signOut();
        GoRouter.of(context).clearRedirectLocation();

        _navigate =
            () => context.goNamedAuth(LoginWidget.routeName, context.mounted);

        _navigate();
        return;
      }
      _model.getAllCamposLoad = await ProjectsGroup.filtraOsCamposCall.call(
        bearerAuth: FFAppState().token,
        fieldsIdList: _model.campo,
        sectionsIdList: _model.secao,
        rowsIdList: _model.fileira,
        trackersIdList: _model.tracker,
        projectsId: FFAppState().projectsInfo.id,
      );

      if ((_model.getAllCamposLoad?.succeeded ?? true)) {
        FFAppState().isMap = false;
        FFAppState().update(() {});
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
              child: GestureDetector(
                onTap: () {
                  FocusScope.of(dialogContext).unfocus();
                  FocusManager.instance.primaryFocus?.unfocus();
                },
                child: ModalInfoWidget(
                  title: FFLocalizations.of(context).getText(
                    'kf2qipvw' /* Erro */,
                  ),
                  description: getJsonField(
                    (_model.getAllCamposLoad?.jsonBody ?? ''),
                    r'''$.message''',
                  ).toString(),
                ),
              ),
            );
          },
        );

        return;
      }

      _navigate();
    });

    _model.textController ??= TextEditingController();
    _model.textFieldFocusNode ??= FocusNode();

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();

    return Builder(
      builder: (context) => GestureDetector(
        onTap: () {
          FocusScope.of(context).unfocus();
          FocusManager.instance.primaryFocus?.unfocus();
        },
        child: Scaffold(
          key: scaffoldKey,
          backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
          body: SafeArea(
            top: true,
            child: Row(
              mainAxisSize: MainAxisSize.max,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                wrapWithModel(
                  model: _model.navBarModel,
                  updateCallback: () => safeSetState(() {}),
                  child: NavBarWidget(),
                ),
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.all(16.0),
                    child: FutureBuilder<ApiCallResponse>(
                      future: _model
                          .backlog(
                        requestFn: () =>
                            ProjectsGroup.getProjectsBacklogsRecordCall.call(
                          bearerAuth: FFAppState().token,
                          page: _model.page,
                          perPage: _model.perPage,
                          projectsId: FFAppState().projectsInfo.id,

                          sprintAdded: FFAppState().filtroBacklogSprint,
                          search: _model.textController.text,
                          fieldsIdList: _model.campo,
                          sectionsIdList: _model.secao,
                          rowsIdList: _model.fileira,
                          trackersIdList: _model.tracker,
                        ),
                      )
                          .then((result) {
                        _model.apiRequestCompleted2 = true;
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
                        final containerGetProjectsBacklogsRecordResponse =
                            snapshot.data!;

                        return Material(
                          color: Colors.transparent,
                          elevation: 1.0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.0),
                          ),
                          child: Container(
                            width: MediaQuery.sizeOf(context).width * 1.0,
                            height: MediaQuery.sizeOf(context).height * 1.0,
                            decoration: BoxDecoration(
                              color: FlutterFlowTheme.of(context)
                                  .secondaryBackground,
                              borderRadius: BorderRadius.circular(12.0),
                              border: Border.all(
                                color: FlutterFlowTheme.of(context).alternate,
                              ),
                            ),
                            child: Padding(
                              padding: EdgeInsets.all(24.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.max,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisSize: MainAxisSize.max,
                                        children: [
                                          InkWell(
                                            splashColor: Colors.transparent,
                                            focusColor: Colors.transparent,
                                            hoverColor: Colors.transparent,
                                            highlightColor: Colors.transparent,
                                            onTap: () async {
                                              context.pushNamed(
                                                ProjetosWidget.routeName,
                                                extra: <String, dynamic>{
                                                  kTransitionInfoKey:
                                                      TransitionInfo(
                                                    hasTransition: true,
                                                    transitionType:
                                                        PageTransitionType.fade,
                                                    duration: Duration(
                                                        milliseconds: 0),
                                                  ),
                                                },
                                              );
                                            },
                                            child: Container(
                                              decoration: BoxDecoration(),
                                              child: Text(
                                                FFLocalizations.of(context)
                                                    .getText(
                                                  '3lhe86we' /* Projetos */,
                                                ),
                                                style: FlutterFlowTheme.of(
                                                        context)
                                                    .bodyMedium
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
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
                                                              .bodyMedium
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .bodyMedium
                                                              .fontStyle,
                                                    ),
                                              ),
                                            ),
                                          ),
                                          Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    8.0, 0.0, 8.0, 0.0),
                                            child: Icon(
                                              Icons
                                                  .keyboard_arrow_right_rounded,
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .primaryText,
                                              size: 18.0,
                                            ),
                                          ),
                                          InkWell(
                                            splashColor: Colors.transparent,
                                            focusColor: Colors.transparent,
                                            hoverColor: Colors.transparent,
                                            highlightColor: Colors.transparent,
                                            onTap: () async {
                                              context.pushNamed(
                                                ProjetoDetalhesWidget.routeName,
                                                extra: <String, dynamic>{
                                                  kTransitionInfoKey:
                                                      TransitionInfo(
                                                    hasTransition: true,
                                                    transitionType:
                                                        PageTransitionType.fade,
                                                    duration: Duration(
                                                        milliseconds: 0),
                                                  ),
                                                },
                                              );
                                            },
                                            child: Container(
                                              decoration: BoxDecoration(),
                                              child: Text(
                                                FFLocalizations.of(context)
                                                    .getText(
                                                  'zjg5fkfx' /* Projetos Detalhes */,
                                                ),
                                                style: FlutterFlowTheme.of(
                                                        context)
                                                    .bodyMedium
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
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
                                                              .bodyMedium
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .bodyMedium
                                                              .fontStyle,
                                                    ),
                                              ),
                                            ),
                                          ),
                                          Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    8.0, 0.0, 8.0, 0.0),
                                            child: Icon(
                                              Icons
                                                  .keyboard_arrow_right_rounded,
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .primaryText,
                                              size: 18.0,
                                            ),
                                          ),
                                          Text(
                                            FFLocalizations.of(context).getText(
                                              'git0ns5g' /* Backlog de tarefas */,
                                            ),
                                            style: FlutterFlowTheme.of(context)
                                                .bodyMedium
                                                .override(
                                                  font: GoogleFonts.lexend(
                                                    fontWeight:
                                                        FlutterFlowTheme.of(
                                                                context)
                                                            .bodyMedium
                                                            .fontWeight,
                                                    fontStyle:
                                                        FlutterFlowTheme.of(
                                                                context)
                                                            .bodyMedium
                                                            .fontStyle,
                                                  ),
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .primary,
                                                  letterSpacing: 0.0,
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .bodyMedium
                                                          .fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .bodyMedium
                                                          .fontStyle,
                                                ),
                                          ),
                                        ],
                                      ),
                                      Column(
                                        mainAxisSize: MainAxisSize.min,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Icon(
                                                Icons.task_rounded,
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .primary,
                                                size: 24.0,
                                              ),
                                              Align(
                                                alignment: AlignmentDirectional(
                                                    -1.0, -1.0),
                                                child: SelectionArea(
                                                    child: Text(
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    '8l8qsyda' /* Backlog de tarefas */,
                                                  ),
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .headlineMedium
                                                      .override(
                                                        font:
                                                            GoogleFonts.lexend(
                                                          fontWeight:
                                                              FontWeight.w500,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .headlineMedium
                                                                  .fontStyle,
                                                        ),
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            FontWeight.w500,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .headlineMedium
                                                                .fontStyle,
                                                      ),
                                                )),
                                              ),
                                            ].divide(SizedBox(width: 8.0)),
                                          ),
                                          SelectionArea(
                                              child: Text(
                                            FFLocalizations.of(context).getText(
                                              'l1m2o7zq' /* Veja todas as tarefas, filtre ... */,
                                            ),
                                            style: FlutterFlowTheme.of(context)
                                                .labelMedium
                                                .override(
                                                  font: GoogleFonts.lexend(
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
                                          )),
                                        ],
                                      ),
                                      Divider(
                                        height: 18.0,
                                        thickness: 1.0,
                                        color: FlutterFlowTheme.of(context)
                                            .alternate,
                                      ),
                                    ].divide(SizedBox(height: 12.0)),
                                  ),
                                  Column(
                                    mainAxisSize: MainAxisSize.max,
                                    children: [
                                      Padding(
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            0.0, 0.0, 0.0, 16.0),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.max,
                                          mainAxisAlignment:
                                              MainAxisAlignment.start,
                                          children: [
                                            Builder(
                                              builder: (context) =>
                                                  FFButtonWidget(
                                                onPressed: () async {

                                                  FFAppState().listatasks = [];
                                                  safeSetState(() {});
                                                  await showDialog(
                                                    barrierColor:
                                                        Color(0x80000000),
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
                                                        child: GestureDetector(
                                                          onTap: () {
                                                            FocusScope.of(
                                                                    dialogContext)
                                                                .unfocus();
                                                            FocusManager
                                                                .instance
                                                                .primaryFocus
                                                                ?.unfocus();
                                                          },
                                                          child:
                                                              ModalAddTarefasBacklogWidget(),
                                                        ),
                                                      );
                                                    },
                                                  );
                                                },
                                                text:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  '76uvut5c' /* Criar tarefas a partir do temp... */,
                                                ),
                                                icon: Icon(
                                                  Icons.add_circle,
                                                  size: 15.0,
                                                ),
                                                options: FFButtonOptions(
                                                  height: 40.0,
                                                  padding: EdgeInsetsDirectional
                                                      .fromSTEB(
                                                          16.0, 0.0, 16.0, 0.0),
                                                  iconPadding:
                                                      EdgeInsetsDirectional
                                                          .fromSTEB(0.0, 0.0,
                                                              0.0, 0.0),
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .primary,
                                                  textStyle: FlutterFlowTheme
                                                          .of(context)
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
                                                        color:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .info,
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
                                                  elevation: 0.0,
                                                  borderRadius:
                                                      BorderRadius.circular(
                                                          8.0),
                                                ),
                                              ),
                                            ),
                                            Builder(
                                              builder: (context) =>
                                                  FFButtonWidget(
                                                onPressed: () async {

                                                  safeSetState(() {});
                                                  await showDialog(
                                                    barrierColor:
                                                        Color(0x80000000),
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
                                                        child: GestureDetector(
                                                          onTap: () {
                                                            FocusScope.of(
                                                                    dialogContext)
                                                                .unfocus();
                                                            FocusManager
                                                                .instance
                                                                .primaryFocus
                                                                ?.unfocus();
                                                          },
                                                          child:
                                                              ModalAddBacklogManualWidget(
                                                            type: 'creat',
                                                            refresh: () async {
                                                              safeSetState(() {
                                                                _model
                                                                    .clearBacklogCache();
                                                                _model.apiRequestCompleted2 =
                                                                    false;
                                                              });
                                                              await _model
                                                                  .waitForApiRequestCompleted2();
                                                              safeSetState(() {
                                                                _model
                                                                    .clearSprintsCache();
                                                                _model.apiRequestCompleted1 =
                                                                    false;
                                                              });
                                                              await _model
                                                                  .waitForApiRequestCompleted1();
                                                              safeSetState(() {
                                                                _model
                                                                    .clearFilterBacklogCache();
                                                                _model.apiRequestCompleted3 =
                                                                    false;
                                                              });
                                                              await _model
                                                                  .waitForApiRequestCompleted3();
                                                            },
                                                          ),
                                                        ),
                                                      );
                                                    },
                                                  );
                                                },
                                                text:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  'rwz126zf' /* Criar tarefa manualmente */,
                                                ),
                                                icon: Icon(
                                                  Icons.add_circle,
                                                  size: 15.0,
                                                ),
                                                options: FFButtonOptions(
                                                  height: 40.0,
                                                  padding: EdgeInsetsDirectional
                                                      .fromSTEB(
                                                          16.0, 0.0, 16.0, 0.0),
                                                  iconPadding:
                                                      EdgeInsetsDirectional
                                                          .fromSTEB(0.0, 0.0,
                                                              0.0, 0.0),
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .primary,
                                                  textStyle: FlutterFlowTheme
                                                          .of(context)
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
                                                        color:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .info,
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
                                                  elevation: 0.0,
                                                  borderRadius:
                                                      BorderRadius.circular(
                                                          8.0),
                                                ),
                                              ),
                                            ),
                                            FFButtonWidget(
                                              onPressed: () async {
                                                context.pushNamed(
                                                  ImportTaskWidget.routeName,
                                                  extra: <String, dynamic>{
                                                    kTransitionInfoKey:
                                                        TransitionInfo(
                                                      hasTransition: true,
                                                      transitionType:
                                                          PageTransitionType
                                                              .fade,
                                                      duration: Duration(
                                                          milliseconds: 0),
                                                    ),
                                                  },
                                                );
                                              },
                                              text: FFLocalizations.of(context)
                                                  .getText(
                                                'pzcj0gsp' /* Importar cronograma de tarefas */,
                                              ),
                                              icon: FaIcon(
                                                FontAwesomeIcons.fileImport,
                                                size: 16.0,
                                              ),
                                              options: FFButtonOptions(
                                                height: 40.0,
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        16.0, 0.0, 16.0, 0.0),
                                                iconPadding:
                                                    EdgeInsetsDirectional
                                                        .fromSTEB(
                                                            0.0, 0.0, 0.0, 0.0),
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .primary,
                                                textStyle: FlutterFlowTheme.of(
                                                        context)
                                                    .labelMedium
                                                    .override(
                                                      font: GoogleFonts.lexend(
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
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .info,
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
                                                elevation: 0.0,
                                                borderRadius:
                                                    BorderRadius.circular(8.0),
                                              ),
                                            ),
                                            FutureBuilder<ApiCallResponse>(
                                              future: _model
                                                  .sprints(
                                                requestFn: () => SprintsGroup
                                                    .queryAllSprintsTasksRecordsCall
                                                    .call(
                                                  bearerAuth:
                                                      FFAppState().token,
                                                  projectsId: FFAppState()
                                                      .projectsInfo
                                                      .id,
                                                  sprintsId: FFAppState()
                                                      .infoUser
                                                      .sprintIdAtiva,
                                                  search: 0,

                                                  teamsIdList:
                                                      FFAppState().filtroTeams,
                                                  fieldsId: 0,
                                                  rowsId: 0,
                                                  sectionsId: 0,
                                                ),
                                              )
                                                  .then((result) {
                                                _model.apiRequestCompleted1 =
                                                    true;
                                                return result;
                                              }),
                                              builder: (context, snapshot) {
                                                // Customize what your widget looks like when it's loading.
                                                if (!snapshot.hasData) {
                                                  return Center(
                                                    child: SizedBox(
                                                      width: 50.0,
                                                      height: 50.0,
                                                      child:
                                                          CircularProgressIndicator(
                                                        valueColor:
                                                            AlwaysStoppedAnimation<
                                                                Color>(
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .primary,
                                                        ),
                                                      ),
                                                    ),
                                                  );
                                                }
                                                final containerQueryAllSprintsTasksRecordsResponse =
                                                    snapshot.data!;

                                                return Container(
                                                  decoration: BoxDecoration(),
                                                  child: Row(
                                                    mainAxisSize:
                                                        MainAxisSize.max,
                                                    children: [
                                                      Padding(
                                                        padding:
                                                            EdgeInsetsDirectional
                                                                .fromSTEB(
                                                                    0.0,
                                                                    0.0,
                                                                    8.0,
                                                                    0.0),
                                                        child: Icon(
                                                          Icons
                                                              .bar_chart_rounded,
                                                          color: FlutterFlowTheme
                                                                  .of(context)
                                                              .primaryText,
                                                          size: 24.0,
                                                        ),
                                                      ),
                                                      Padding(
                                                        padding:
                                                            EdgeInsetsDirectional
                                                                .fromSTEB(
                                                                    0.0,
                                                                    0.0,
                                                                    12.0,
                                                                    0.0),
                                                        child: RichText(
                                                          textScaler:
                                                              MediaQuery.of(
                                                                      context)
                                                                  .textScaler,
                                                          text: TextSpan(
                                                            children: [
                                                              TextSpan(
                                                                text: FFLocalizations.of(
                                                                        context)
                                                                    .getText(
                                                                  'snznv9u2' /* Sprint em andamento  */,
                                                                ),
                                                                style: FlutterFlowTheme.of(
                                                                        context)
                                                                    .bodyMedium
                                                                    .override(
                                                                      font: GoogleFonts
                                                                          .lexend(
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
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
                                                              ),
                                                              TextSpan(
                                                                text: FFLocalizations.of(
                                                                        context)
                                                                    .getText(
                                                                  '01mn2dd4' /* ( */,
                                                                ),
                                                                style:
                                                                    TextStyle(),
                                                              ),
                                                              TextSpan(
                                                                text:
                                                                    valueOrDefault<
                                                                        String>(
                                                                  (valueOrDefault<
                                                                              int>(
                                                                            SprintsGroup.queryAllSprintsTasksRecordsCall
                                                                                .pendentes(
                                                                                  containerQueryAllSprintsTasksRecordsResponse.jsonBody,
                                                                                )
                                                                                ?.length,
                                                                            0,
                                                                          ) +
                                                                          valueOrDefault<
                                                                              int>(
                                                                            SprintsGroup.queryAllSprintsTasksRecordsCall
                                                                                .andamentos(
                                                                                  containerQueryAllSprintsTasksRecordsResponse.jsonBody,
                                                                                )
                                                                                ?.length,
                                                                            0,
                                                                          ))
                                                                      .toString(),
                                                                  '0',
                                                                ),
                                                                style:
                                                                    TextStyle(
                                                                  color: FlutterFlowTheme.of(
                                                                          context)
                                                                      .primary,
                                                                ),
                                                              ),
                                                              TextSpan(
                                                                text: FFLocalizations.of(
                                                                        context)
                                                                    .getText(
                                                                  'qcvudwjh' /* ) */,
                                                                ),
                                                                style:
                                                                    TextStyle(),
                                                              )
                                                            ],
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
                                                          ),
                                                        ),
                                                      ),
                                                      RichText(
                                                        textScaler:
                                                            MediaQuery.of(
                                                                    context)
                                                                .textScaler,
                                                        text: TextSpan(
                                                          children: [
                                                            TextSpan(
                                                              text: FFLocalizations
                                                                      .of(context)
                                                                  .getText(
                                                                '6rsf3u1b' /* Sprint finalizada  */,
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
                                                            ),
                                                            TextSpan(
                                                              text: FFLocalizations
                                                                      .of(context)
                                                                  .getText(
                                                                '25lutsb5' /* ( */,
                                                              ),
                                                              style:
                                                                  TextStyle(),
                                                            ),
                                                            TextSpan(
                                                              text:
                                                                  valueOrDefault<
                                                                      String>(
                                                                SprintsGroup
                                                                    .queryAllSprintsTasksRecordsCall
                                                                    .concluidas(
                                                                      containerQueryAllSprintsTasksRecordsResponse
                                                                          .jsonBody,
                                                                    )
                                                                    ?.length
                                                                    ?.toString(),
                                                                '0',
                                                              ),
                                                              style: TextStyle(
                                                                color: FlutterFlowTheme.of(
                                                                        context)
                                                                    .primary,
                                                              ),
                                                            ),
                                                            TextSpan(
                                                              text: FFLocalizations
                                                                      .of(context)
                                                                  .getText(
                                                                'jkbnvfiq' /* ) */,
                                                              ),
                                                              style:
                                                                  TextStyle(),
                                                            )
                                                          ],
                                                          style: FlutterFlowTheme
                                                                  .of(context)
                                                              .bodyMedium
                                                              .override(
                                                                font:
                                                                    GoogleFonts
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
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                );
                                              },
                                            ),
                                          ].divide(SizedBox(width: 16.0)),
                                        ),
                                      ),
                                      Row(
                                        mainAxisSize: MainAxisSize.max,
                                        children: [
                                          Container(
                                            constraints: BoxConstraints(
                                              maxWidth: 420.0,
                                            ),
                                            decoration: BoxDecoration(),
                                            child: Visibility(
                                              visible: responsiveVisibility(
                                                context: context,
                                                phone: false,
                                              ),
                                              child: TextFormField(
                                                controller:
                                                    _model.textController,
                                                focusNode:
                                                    _model.textFieldFocusNode,
                                                onChanged: (_) =>
                                                    EasyDebounce.debounce(
                                                  '_model.textController',
                                                  Duration(milliseconds: 500),
                                                  () async {
                                                    safeSetState(() {
                                                      _model
                                                          .clearBacklogCache();
                                                      _model.apiRequestCompleted2 =
                                                          false;
                                                    });
                                                    await _model
                                                        .waitForApiRequestCompleted2();
                                                  },
                                                ),
                                                onFieldSubmitted: (_) async {
                                                  safeSetState(() {
                                                    _model.clearBacklogCache();
                                                    _model.apiRequestCompleted2 =
                                                        false;
                                                  });
                                                  await _model
                                                      .waitForApiRequestCompleted2();
                                                },
                                                autofocus: false,
                                                obscureText: false,
                                                decoration: InputDecoration(
                                                  labelText: FFLocalizations.of(
                                                          context)
                                                      .getText(
                                                    'akibl5sg' /* Procurar por descrição da tare... */,
                                                  ),
                                                  labelStyle: FlutterFlowTheme
                                                          .of(context)
                                                      .labelSmall
                                                      .override(
                                                        font:
                                                            GoogleFonts.lexend(
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
                                                  hintStyle: FlutterFlowTheme
                                                          .of(context)
                                                      .labelSmall
                                                      .override(
                                                        font:
                                                            GoogleFonts.lexend(
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
                                                  enabledBorder:
                                                      OutlineInputBorder(
                                                    borderSide: BorderSide(
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .alternate,
                                                      width: 1.0,
                                                    ),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            12.0),
                                                  ),
                                                  focusedBorder:
                                                      OutlineInputBorder(
                                                    borderSide: BorderSide(
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .primary,
                                                      width: 1.0,
                                                    ),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            12.0),
                                                  ),
                                                  errorBorder:
                                                      OutlineInputBorder(
                                                    borderSide: BorderSide(
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .error,
                                                      width: 1.0,
                                                    ),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            12.0),
                                                  ),
                                                  focusedErrorBorder:
                                                      OutlineInputBorder(
                                                    borderSide: BorderSide(
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .error,
                                                      width: 1.0,
                                                    ),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            12.0),
                                                  ),
                                                  filled: true,
                                                  fillColor:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .primaryBackground,
                                                  contentPadding:
                                                      EdgeInsetsDirectional
                                                          .fromSTEB(20.0, 0.0,
                                                              0.0, 0.0),
                                                  prefixIcon: Icon(
                                                    Icons.search_sharp,
                                                  ),
                                                ),
                                                style: FlutterFlowTheme.of(
                                                        context)
                                                    .bodySmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FontWeight.w500,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodySmall
                                                                .fontStyle,
                                                      ),
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FontWeight.w500,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .bodySmall
                                                              .fontStyle,
                                                    ),
                                                cursorColor:
                                                    FlutterFlowTheme.of(context)
                                                        .primary,
                                                validator: _model
                                                    .textControllerValidator
                                                    .asValidator(context),
                                              ),
                                            ),
                                          ),
                                          Row(
                                            mainAxisSize: MainAxisSize.max,
                                            children: [
                                              Icon(
                                                Icons.filter_list,
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryText,
                                                size: 24.0,
                                              ),
                                              Text(
                                                FFLocalizations.of(context)
                                                    .getText(
                                                  'hcx7qu4w' /* Filtros */,
                                                ),
                                                style: FlutterFlowTheme.of(
                                                        context)
                                                    .bodyMedium
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FontWeight.w500,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .secondaryText,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FontWeight.w500,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .bodyMedium
                                                              .fontStyle,
                                                    ),
                                              ),
                                            ].divide(SizedBox(width: 4.0)),
                                          ),
                                          SizedBox(
                                            height: 24.0,
                                            child: VerticalDivider(
                                              thickness: 2.0,
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .alternate,
                                            ),
                                          ),
                                          MouseRegion(
                                            opaque: false,
                                            cursor: MouseCursor.defer ??
                                                MouseCursor.defer,
                                            child: Builder(
                                              builder: (context) => InkWell(
                                                splashColor: Colors.transparent,
                                                focusColor: Colors.transparent,
                                                hoverColor: Colors.transparent,
                                                highlightColor:
                                                    Colors.transparent,
                                                onTap: () async {
                                                  await showAlignedDialog(
                                                    barrierColor:
                                                        Colors.transparent,
                                                    context: context,
                                                    isGlobal: false,
                                                    avoidOverflow: false,
                                                    targetAnchor:
                                                        AlignmentDirectional(
                                                                -1.0, 1.0)
                                                            .resolve(
                                                                Directionality.of(
                                                                    context)),
                                                    followerAnchor:
                                                        AlignmentDirectional(
                                                                -1.0, -1.0)
                                                            .resolve(
                                                                Directionality.of(
                                                                    context)),
                                                    builder: (dialogContext) {
                                                      return Material(
                                                        color:
                                                            Colors.transparent,
                                                        child: GestureDetector(
                                                          onTap: () {
                                                            FocusScope.of(
                                                                    dialogContext)
                                                                .unfocus();
                                                            FocusManager
                                                                .instance
                                                                .primaryFocus
                                                                ?.unfocus();
                                                          },
                                                          child:
                                                              FiltroSprintBacklogWidget(
                                                            action: () async {
                                                              safeSetState(() {
                                                                _model
                                                                    .clearBacklogCache();
                                                                _model.apiRequestCompleted2 =
                                                                    false;
                                                              });
                                                              await _model
                                                                  .waitForApiRequestCompleted2();
                                                              safeSetState(() {
                                                                _model
                                                                    .clearFilterBacklogCache();
                                                                _model.apiRequestCompleted3 =
                                                                    false;
                                                              });
                                                              await _model
                                                                  .waitForApiRequestCompleted3();
                                                            },
                                                          ),
                                                        ),
                                                      );
                                                    },
                                                  );
                                                },
                                                child: Container(
                                                  height: 36.0,
                                                  decoration: BoxDecoration(
                                                    color: () {
                                                      if (_model
                                                          .mouseRegionHovered1!) {
                                                        return FlutterFlowTheme
                                                                .of(context)
                                                            .hoverNavBar;
                                                      } else if (FFAppState()
                                                              .filterBacklog ==
                                                          2) {
                                                        return FlutterFlowTheme
                                                                .of(context)
                                                            .status03;
                                                      } else {
                                                        return FlutterFlowTheme
                                                                .of(context)
                                                            .primaryBackground;
                                                      }
                                                    }(),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            24.0),
                                                    border: Border.all(
                                                      color: () {
                                                        if (_model
                                                            .mouseRegionHovered1!) {
                                                          return FlutterFlowTheme
                                                                  .of(context)
                                                              .hoverNavBar;
                                                        } else if (FFAppState()
                                                                .filterBacklog ==
                                                            2) {
                                                          return FlutterFlowTheme
                                                                  .of(context)
                                                              .primary;
                                                        } else {
                                                          return FlutterFlowTheme
                                                                  .of(context)
                                                              .alternate;
                                                        }
                                                      }(),
                                                      width: 1.0,
                                                    ),
                                                  ),
                                                  child: Padding(
                                                    padding:
                                                        EdgeInsetsDirectional
                                                            .fromSTEB(16.0, 8.0,
                                                                16.0, 8.0),
                                                    child: Row(
                                                      mainAxisSize:
                                                          MainAxisSize.max,
                                                      children: [
                                                        Text(
                                                          FFLocalizations.of(
                                                                  context)
                                                              .getText(
                                                            'h89r9vsy' /* Backlog/Sprint */,
                                                          ),
                                                          style: FlutterFlowTheme
                                                                  .of(context)
                                                              .bodySmall
                                                              .override(
                                                                font:
                                                                    GoogleFonts
                                                                        .lexend(
                                                                  fontWeight: FlutterFlowTheme.of(
                                                                          context)
                                                                      .bodySmall
                                                                      .fontWeight,
                                                                  fontStyle: FlutterFlowTheme.of(
                                                                          context)
                                                                      .bodySmall
                                                                      .fontStyle,
                                                                ),
                                                                color: () {
                                                                  if (_model
                                                                      .mouseRegionHovered1!) {
                                                                    return FlutterFlowTheme.of(
                                                                            context)
                                                                        .secondaryBackground;
                                                                  } else if (FFAppState()
                                                                          .filterBacklog ==
                                                                      2) {
                                                                    return FlutterFlowTheme.of(
                                                                            context)
                                                                        .primary;
                                                                  } else {
                                                                    return FlutterFlowTheme.of(
                                                                            context)
                                                                        .secondaryText;
                                                                  }
                                                                }(),
                                                                letterSpacing:
                                                                    0.0,
                                                                fontWeight: FlutterFlowTheme.of(
                                                                        context)
                                                                    .bodySmall
                                                                    .fontWeight,
                                                                fontStyle: FlutterFlowTheme.of(
                                                                        context)
                                                                    .bodySmall
                                                                    .fontStyle,
                                                              ),
                                                        ),
                                                        Icon(
                                                          Icons
                                                              .keyboard_arrow_down_rounded,
                                                          color: () {
                                                            if (_model
                                                                .mouseRegionHovered1!) {
                                                              return FlutterFlowTheme
                                                                      .of(context)
                                                                  .secondaryBackground;
                                                            } else if (FFAppState()
                                                                    .filterBacklog ==
                                                                2) {
                                                              return FlutterFlowTheme
                                                                      .of(context)
                                                                  .primary;
                                                            } else {
                                                              return FlutterFlowTheme
                                                                      .of(context)
                                                                  .secondaryText;
                                                            }
                                                          }(),
                                                          size: 18.0,
                                                        ),
                                                      ].divide(SizedBox(
                                                          width: 12.0)),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ),
                                            onEnter: ((event) async {
                                              safeSetState(() => _model
                                                  .mouseRegionHovered1 = true);
                                            }),
                                            onExit: ((event) async {
                                              safeSetState(() => _model
                                                  .mouseRegionHovered1 = false);
                                            }),
                                          ),
                                          if ((FFAppState().filterBacklog == 2) ||
                                              (_model.dropCampoValue != null &&
                                                  (_model.dropCampoValue)!
                                                      .isNotEmpty) ||
                                              (_model.dropSecaoValue != null &&
                                                  (_model.dropSecaoValue)!
                                                      .isNotEmpty) ||
                                              (_model.dropFileiraValue != null &&
                                                  (_model.dropFileiraValue)!
                                                      .isNotEmpty) ||
                                              (_model.dropTrackerValue != null &&
                                                  (_model.dropTrackerValue)!
                                                      .isNotEmpty) ||
                                              (_model.textController.text != null &&
                                                  _model.textController.text !=
                                                      ''))
                                            FFButtonWidget(
                                              onPressed: () async {

                                                FFAppState()
                                                        .filtroBacklogSprint =
                                                    false;
                                                FFAppState().filterBacklog = 1;
                                                safeSetState(() {});
                                                _model.campo = [];
                                                _model.secao = [];
                                                _model.fileira = [];
                                                _model.tracker = [];
                                                safeSetState(() {});
                                                safeSetState(() {
                                                  _model.dropCampoValueController
                                                      ?.reset();
                                                  _model.dropCampoValue = null;
                                                  _model.dropSecaoValueController
                                                      ?.reset();
                                                  _model.dropSecaoValue = null;
                                                  _model.dropFileiraValueController
                                                      ?.reset();
                                                  _model.dropFileiraValue = null;
                                                  _model.dropTrackerValueController
                                                      ?.reset();
                                                  _model.dropTrackerValue = null;
                                                  _model.dropDownValueController
                                                      ?.reset();
                                                  _model.dropDownValue = null;
                                                });
                                                safeSetState(() {
                                                  _model.textController?.clear();
                                                });
                                                safeSetState(() {
                                                  _model.clearBacklogCache();
                                                  _model.apiRequestCompleted2 =
                                                      false;
                                                });
                                                await _model
                                                    .waitForApiRequestCompleted2();
                                                safeSetState(() {
                                                  _model
                                                      .clearFilterBacklogCache();
                                                  _model.apiRequestCompleted3 =
                                                      false;
                                                });
                                                await _model
                                                    .waitForApiRequestCompleted3();
                                              },
                                              text: FFLocalizations.of(context)
                                                  .getText(
                                                'jnz8slz8' /* Limpar */,
                                              ),
                                              icon: Icon(
                                                Icons.filter_list_off,
                                                size: 15.0,
                                              ),
                                              options: FFButtonOptions(
                                                height: 30.0,
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        16.0, 0.0, 16.0, 0.0),
                                                iconPadding:
                                                    EdgeInsetsDirectional
                                                        .fromSTEB(
                                                            0.0, 0.0, 0.0, 0.0),
                                                color: FlutterFlowTheme.of(
                                                        context)
                                                    .status05,
                                                textStyle: FlutterFlowTheme.of(
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
                                                              .error,
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
                                                elevation: 0.0,
                                                borderSide: BorderSide(
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .error,
                                                  width: 1.0,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(24.0),
                                                hoverColor: FlutterFlowTheme.of(
                                                        context)
                                                    .error,
                                                hoverBorderSide: BorderSide(
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .error,
                                                  width: 1.0,
                                                ),
                                                hoverTextColor:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryBackground,
                                              ),
                                            ),

                                        ].divide(SizedBox(width: 12.0)),
                                      ),
                                    ],
                                  ),
                                  FutureBuilder<ApiCallResponse>(
                                    future: _model
                                        .filterBacklog(
                                      requestFn: () =>
                                          ProjectsGroup.filtraOsCamposCall.call(
                                        bearerAuth: FFAppState().token,
                                        fieldsIdList: _model.campo,
                                        sectionsIdList: _model.secao,
                                        rowsIdList: _model.fileira,
                                        trackersIdList: _model.tracker,
                                        projectsId:
                                            FFAppState().projectsInfo.id,
                                      ),
                                    )
                                        .then((result) {
                                      _model.apiRequestCompleted3 = true;
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
                                              valueColor:
                                                  AlwaysStoppedAnimation<Color>(
                                                FlutterFlowTheme.of(context)
                                                    .primary,
                                              ),
                                            ),
                                          ),
                                        );
                                      }
                                      final filtersFiltraOsCamposResponse =
                                          snapshot.data!;

                                      return Container(
                                        decoration: BoxDecoration(),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.max,
                                          children: [
                                            if ((ProjectsGroup
                                                            .filtraOsCamposCall
                                                            .fields(
                                                          (_model.getAllCamposLoad
                                                                  ?.jsonBody ??
                                                              ''),
                                                        ) !=
                                                        null &&
                                                    (ProjectsGroup
                                                            .filtraOsCamposCall
                                                            .fields(
                                                      (_model.getAllCamposLoad
                                                              ?.jsonBody ??
                                                          ''),
                                                    ))!
                                                        .isNotEmpty) &&
                                                responsiveVisibility(
                                                  context: context,
                                                  phone: false,
                                                ))
                                              FlutterFlowDropDown<int>(
                                                multiSelectController: _model
                                                        .dropCampoValueController ??=
                                                    FormListFieldController<
                                                        int>(null),
                                                options: List<int>.from(
                                                    (ProjectsGroup
                                                            .filtraOsCamposCall
                                                            .fields(
                                                              (_model.getAllCamposLoad
                                                                      ?.jsonBody ??
                                                                  ''),
                                                            )!
                                                            .map((e) =>
                                                                getJsonField(
                                                                  e,
                                                                  r'''$.id''',
                                                                ))
                                                            .toList() as List)
                                                        .cast<int>()),
                                                optionLabels: ProjectsGroup
                                                    .filtraOsCamposCall
                                                    .fields(
                                                      (_model.getAllCamposLoad
                                                              ?.jsonBody ??
                                                          ''),
                                                    )!
                                                    .map((e) => getJsonField(
                                                          e,
                                                          r'''$.name''',
                                                        ))
                                                    .toList()
                                                    .map((e) => e.toString())
                                                    .toList(),
                                                width: 200.0,
                                                height: 36.0,
                                                maxHeight: 250.0,
                                                textStyle: FlutterFlowTheme.of(
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
                                                              .primary,
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
                                                hintText:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  'vhht2pqx' /* Selecione um campo */,
                                                ),
                                                icon: Icon(
                                                  Icons
                                                      .keyboard_arrow_down_rounded,
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .secondaryText,
                                                  size: 24.0,
                                                ),
                                                fillColor:
                                                    FlutterFlowTheme.of(context)
                                                        .primaryBackground,
                                                elevation: 2.0,
                                                borderColor:
                                                    FlutterFlowTheme.of(context)
                                                        .alternate,
                                                borderWidth: 1.0,
                                                borderRadius: 12.0,
                                                margin: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        12.0, 0.0, 12.0, 0.0),
                                                hidesUnderline: true,
                                                isOverButton: false,
                                                isSearchable: false,
                                                isMultiSelect: true,
                                                onMultiSelectChanged:
                                                    (val) async {
                                                  safeSetState(() => _model
                                                      .dropCampoValue = val);
                                                  _model.campo = _model
                                                      .dropCampoValue!
                                                      .toList()
                                                      .cast<int>();
                                                  safeSetState(() {});
                                                  safeSetState(() {
                                                    _model
                                                        .clearFilterBacklogCache();
                                                    _model.apiRequestCompleted3 =
                                                        false;
                                                  });
                                                  await _model
                                                      .waitForApiRequestCompleted3();
                                                  safeSetState(() {
                                                    _model.clearBacklogCache();
                                                    _model.apiRequestCompleted2 =
                                                        false;
                                                  });
                                                  await _model
                                                      .waitForApiRequestCompleted2();
                                                },
                                              ),
                                            if (valueOrDefault<bool>(
                                                  _model.campo.isNotEmpty,
                                                  false,
                                                ) &&
                                                responsiveVisibility(
                                                  context: context,
                                                  phone: false,
                                                ))
                                              FlutterFlowDropDown<int>(
                                                multiSelectController: _model
                                                        .dropSecaoValueController ??=
                                                    FormListFieldController<
                                                        int>(null),
                                                options: List<
                                                    int>.from(ProjectsGroup
                                                                .filtraOsCamposCall
                                                                .sections(
                                                              filtersFiltraOsCamposResponse
                                                                  .jsonBody,
                                                            ) !=
                                                            null &&
                                                        (ProjectsGroup
                                                                .filtraOsCamposCall
                                                                .sections(
                                                          filtersFiltraOsCamposResponse
                                                              .jsonBody,
                                                        ))!
                                                            .isNotEmpty
                                                    ? (ProjectsGroup
                                                            .filtraOsCamposCall
                                                            .sections(
                                                              filtersFiltraOsCamposResponse
                                                                  .jsonBody,
                                                            )!
                                                            .map((e) =>
                                                                getJsonField(
                                                                  e,
                                                                  r'''$.id''',
                                                                ))
                                                            .toList() as List)
                                                        .cast<int>()
                                                    : FFAppState().listaVazia),
                                                optionLabels: ProjectsGroup
                                                                .filtraOsCamposCall
                                                                .sections(
                                                              filtersFiltraOsCamposResponse
                                                                  .jsonBody,
                                                            ) !=
                                                            null &&
                                                        (ProjectsGroup
                                                                .filtraOsCamposCall
                                                                .sections(
                                                          filtersFiltraOsCamposResponse
                                                              .jsonBody,
                                                        ))!
                                                            .isNotEmpty
                                                    ? ProjectsGroup
                                                        .filtraOsCamposCall
                                                        .sections(
                                                          filtersFiltraOsCamposResponse
                                                              .jsonBody,
                                                        )!
                                                        .map(
                                                            (e) => getJsonField(
                                                                  e,
                                                                  r'''$.section_number''',
                                                                ))
                                                        .toList()
                                                        .map(
                                                            (e) => e.toString())
                                                        .toList()
                                                    : FFAppState().secaoVazia,
                                                width: 200.0,
                                                height: 36.0,
                                                maxHeight: 250.0,
                                                textStyle: FlutterFlowTheme.of(
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
                                                              .primary,
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
                                                hintText:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  'dz2lz6fc' /* Selecione uma seção */,
                                                ),
                                                icon: Icon(
                                                  Icons
                                                      .keyboard_arrow_down_rounded,
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .secondaryText,
                                                  size: 24.0,
                                                ),
                                                fillColor:
                                                    FlutterFlowTheme.of(context)
                                                        .primaryBackground,
                                                elevation: 2.0,
                                                borderColor:
                                                    FlutterFlowTheme.of(context)
                                                        .alternate,
                                                borderWidth: 1.0,
                                                borderRadius: 12.0,
                                                margin: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        12.0, 0.0, 12.0, 0.0),
                                                hidesUnderline: true,
                                                isOverButton: false,
                                                isSearchable: false,
                                                isMultiSelect: true,
                                                onMultiSelectChanged:
                                                    (val) async {
                                                  safeSetState(() => _model
                                                      .dropSecaoValue = val);
                                                  _model.secao = _model
                                                      .dropSecaoValue!
                                                      .toList()
                                                      .cast<int>();
                                                  safeSetState(() {});
                                                  safeSetState(() {
                                                    _model
                                                        .clearFilterBacklogCache();
                                                    _model.apiRequestCompleted3 =
                                                        false;
                                                  });
                                                  await _model
                                                      .waitForApiRequestCompleted3();
                                                  safeSetState(() {
                                                    _model.clearBacklogCache();
                                                    _model.apiRequestCompleted2 =
                                                        false;
                                                  });
                                                  await _model
                                                      .waitForApiRequestCompleted2();
                                                },
                                              ),
                                            if (valueOrDefault<bool>(
                                                  _model.secao.isNotEmpty,
                                                  false,
                                                ) &&
                                                responsiveVisibility(
                                                  context: context,
                                                  phone: false,
                                                ))
                                              FlutterFlowDropDown<int>(
                                                multiSelectController: _model
                                                        .dropFileiraValueController ??=
                                                    FormListFieldController<
                                                        int>(null),
                                                options: List<
                                                    int>.from(ProjectsGroup
                                                                .filtraOsCamposCall
                                                                .rows(
                                                              filtersFiltraOsCamposResponse
                                                                  .jsonBody,
                                                            ) !=
                                                            null &&
                                                        (ProjectsGroup
                                                                .filtraOsCamposCall
                                                                .rows(
                                                          filtersFiltraOsCamposResponse
                                                              .jsonBody,
                                                        ))!
                                                            .isNotEmpty
                                                    ? (ProjectsGroup
                                                            .filtraOsCamposCall
                                                            .rows(
                                                              filtersFiltraOsCamposResponse
                                                                  .jsonBody,
                                                            )!
                                                            .map((e) =>
                                                                getJsonField(
                                                                  e,
                                                                  r'''$.id''',
                                                                ))
                                                            .toList() as List)
                                                        .cast<int>()
                                                    : FFAppState().listaVazia),
                                                optionLabels: ProjectsGroup
                                                                .filtraOsCamposCall
                                                                .rows(
                                                              filtersFiltraOsCamposResponse
                                                                  .jsonBody,
                                                            ) !=
                                                            null &&
                                                        (ProjectsGroup
                                                                .filtraOsCamposCall
                                                                .rows(
                                                          filtersFiltraOsCamposResponse
                                                              .jsonBody,
                                                        ))!
                                                            .isNotEmpty
                                                    ? ProjectsGroup
                                                        .filtraOsCamposCall
                                                        .rows(
                                                          filtersFiltraOsCamposResponse
                                                              .jsonBody,
                                                        )!
                                                        .map(
                                                            (e) => getJsonField(
                                                                  e,
                                                                  r'''$.row_number''',
                                                                ))
                                                        .toList()
                                                        .map(
                                                            (e) => e.toString())
                                                        .toList()
                                                    : FFAppState().fileiraVazia,
                                                width: 200.0,
                                                height: 36.0,
                                                maxHeight: 250.0,
                                                textStyle: FlutterFlowTheme.of(
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
                                                              .primary,
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
                                                hintText:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  'zkfvxwy5' /* Selecione uma fileira */,
                                                ),
                                                icon: Icon(
                                                  Icons
                                                      .keyboard_arrow_down_rounded,
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .secondaryText,
                                                  size: 24.0,
                                                ),
                                                fillColor:
                                                    FlutterFlowTheme.of(context)
                                                        .primaryBackground,
                                                elevation: 2.0,
                                                borderColor:
                                                    FlutterFlowTheme.of(context)
                                                        .alternate,
                                                borderWidth: 1.0,
                                                borderRadius: 12.0,
                                                margin: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        12.0, 0.0, 12.0, 0.0),
                                                hidesUnderline: true,
                                                isOverButton: false,
                                                isSearchable: false,
                                                isMultiSelect: true,
                                                onMultiSelectChanged:
                                                    (val) async {
                                                  safeSetState(() => _model
                                                      .dropFileiraValue = val);
                                                  _model.fileira = _model
                                                      .dropFileiraValue!
                                                      .toList()
                                                      .cast<int>();
                                                  safeSetState(() {});
                                                  safeSetState(() {
                                                    _model
                                                        .clearFilterBacklogCache();
                                                    _model.apiRequestCompleted3 =
                                                        false;
                                                  });
                                                  await _model
                                                      .waitForApiRequestCompleted3();
                                                  safeSetState(() {
                                                    _model.clearBacklogCache();
                                                    _model.apiRequestCompleted2 =
                                                        false;
                                                  });
                                                  await _model
                                                      .waitForApiRequestCompleted2();
                                                },
                                              ),
                                            if (false &&
                                                responsiveVisibility(
                                                  context: context,
                                                  phone: false,
                                                ))
                                              FlutterFlowDropDown<int>(
                                                multiSelectController: _model
                                                        .dropTrackerValueController ??=
                                                    FormListFieldController<
                                                        int>(null),
                                                options: List<
                                                    int>.from(ProjectsGroup
                                                                .filtraOsCamposCall
                                                                .trackers(
                                                              filtersFiltraOsCamposResponse
                                                                  .jsonBody,
                                                            ) !=
                                                            null &&
                                                        (ProjectsGroup
                                                                .filtraOsCamposCall
                                                                .trackers(
                                                          filtersFiltraOsCamposResponse
                                                              .jsonBody,
                                                        ))!
                                                            .isNotEmpty
                                                    ? (ProjectsGroup
                                                            .filtraOsCamposCall
                                                            .trackers(
                                                              filtersFiltraOsCamposResponse
                                                                  .jsonBody,
                                                            )!
                                                            .map((e) =>
                                                                getJsonField(
                                                                  e,
                                                                  r'''$.id''',
                                                                ))
                                                            .toList() as List)
                                                        .cast<int>()
                                                    : FFAppState().listaVazia),
                                                optionLabels: ProjectsGroup
                                                                .filtraOsCamposCall
                                                                .trackers(
                                                              filtersFiltraOsCamposResponse
                                                                  .jsonBody,
                                                            ) !=
                                                            null &&
                                                        (ProjectsGroup
                                                                .filtraOsCamposCall
                                                                .trackers(
                                                          filtersFiltraOsCamposResponse
                                                              .jsonBody,
                                                        ))!
                                                            .isNotEmpty
                                                    ? ProjectsGroup
                                                        .filtraOsCamposCall
                                                        .trackers(
                                                          filtersFiltraOsCamposResponse
                                                              .jsonBody,
                                                        )!
                                                        .map(
                                                            (e) => getJsonField(
                                                                  e,
                                                                  r'''$.position''',
                                                                ))
                                                        .toList()
                                                        .map(
                                                            (e) => e.toString())
                                                        .toList()
                                                    : FFAppState().trackerVazio,
                                                width: 200.0,
                                                height: 36.0,
                                                maxHeight: 250.0,
                                                textStyle: FlutterFlowTheme.of(
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
                                                              .primary,
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
                                                hintText:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  'ouvhnkib' /* Posição do tracker */,
                                                ),
                                                icon: Icon(
                                                  Icons
                                                      .keyboard_arrow_down_rounded,
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .secondaryText,
                                                  size: 24.0,
                                                ),
                                                fillColor:
                                                    FlutterFlowTheme.of(context)
                                                        .primaryBackground,
                                                elevation: 2.0,
                                                borderColor:
                                                    FlutterFlowTheme.of(context)
                                                        .alternate,
                                                borderWidth: 1.0,
                                                borderRadius: 12.0,
                                                margin: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        12.0, 0.0, 12.0, 0.0),
                                                hidesUnderline: true,
                                                isOverButton: false,
                                                isSearchable: false,
                                                isMultiSelect: true,
                                                onMultiSelectChanged:
                                                    (val) async {
                                                  safeSetState(() => _model
                                                      .dropTrackerValue = val);
                                                  _model.tracker = _model
                                                      .dropTrackerValue!
                                                      .toList()
                                                      .cast<int>();
                                                  safeSetState(() {});
                                                  safeSetState(() {
                                                    _model
                                                        .clearFilterBacklogCache();
                                                    _model.apiRequestCompleted3 =
                                                        false;
                                                  });
                                                  await _model
                                                      .waitForApiRequestCompleted3();
                                                  safeSetState(() {
                                                    _model.clearBacklogCache();
                                                    _model.apiRequestCompleted2 =
                                                        false;
                                                  });
                                                  await _model
                                                      .waitForApiRequestCompleted2();
                                                },
                                              ),
                                          ].divide(SizedBox(width: 8.0)),
                                        ),
                                      );
                                    },
                                  ),
                                  Expanded(
                                    child: Column(
                                      mainAxisSize: MainAxisSize.max,
                                      children: [
                                        Container(
                                          width:
                                              MediaQuery.sizeOf(context).width *
                                                  1.0,
                                          height: 40.0,
                                          decoration: BoxDecoration(
                                            color: FlutterFlowTheme.of(context)
                                                .primaryBackground,
                                            borderRadius: BorderRadius.only(
                                              bottomLeft: Radius.circular(0.0),
                                              bottomRight: Radius.circular(0.0),
                                              topLeft: Radius.circular(8.0),
                                              topRight: Radius.circular(8.0),
                                            ),
                                          ),
                                          child: Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    16.0, 0.0, 16.0, 0.0),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Container(
                                                  width: 20.0,
                                                  height: 20.0,
                                                  decoration: BoxDecoration(),
                                                ),
                                                Expanded(
                                                  flex: 2,
                                                  child: Align(
                                                    alignment:
                                                        AlignmentDirectional(
                                                            -1.0, 0.0),
                                                    child: Padding(
                                                      padding:
                                                          EdgeInsetsDirectional
                                                              .fromSTEB(
                                                                  0.0,
                                                                  0.0,
                                                                  24.0,
                                                                  0.0),
                                                      child: Container(
                                                        width: 40.0,
                                                        decoration:
                                                            BoxDecoration(),
                                                        child: SelectionArea(
                                                            child: Text(
                                                          FFLocalizations.of(
                                                                  context)
                                                              .getText(
                                                            'qb7vronf' /* Tarefa */,
                                                          ),
                                                          style: FlutterFlowTheme
                                                                  .of(context)
                                                              .labelSmall
                                                              .override(
                                                                font:
                                                                    GoogleFonts
                                                                        .lexend(
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w600,
                                                                  fontStyle: FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontStyle,
                                                                ),
                                                                letterSpacing:
                                                                    0.0,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w600,
                                                                fontStyle: FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontStyle,
                                                              ),
                                                        )),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                                Expanded(
                                                  flex: 1,
                                                  child: Align(
                                                    alignment:
                                                        AlignmentDirectional(
                                                            -1.0, 0.0),
                                                    child: Container(
                                                      decoration:
                                                          BoxDecoration(),
                                                      child: SelectionArea(
                                                          child: Text(
                                                        FFLocalizations.of(
                                                                context)
                                                            .getText(
                                                          'p52fzhch' /* Peso */,
                                                        ),
                                                        textAlign:
                                                            TextAlign.center,
                                                        style:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .override(
                                                                  font: GoogleFonts
                                                                      .lexend(
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w600,
                                                                    fontStyle: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .fontStyle,
                                                                  ),
                                                                  letterSpacing:
                                                                      0.0,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w600,
                                                                  fontStyle: FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontStyle,
                                                                ),
                                                      )),
                                                    ),
                                                  ),
                                                ),

                                                Expanded(
                                                  flex: 1,
                                                  child: Align(
                                                    alignment:
                                                        AlignmentDirectional(
                                                            -1.0, 0.0),
                                                    child: SelectionArea(
                                                        child: Text(
                                                      FFLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'jlf4z2aa' /* Quantidade */,
                                                      ),
                                                      style: FlutterFlowTheme
                                                              .of(context)
                                                          .labelSmall
                                                          .override(
                                                            font: GoogleFonts
                                                                .lexend(
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w600,
                                                              fontStyle:
                                                                  FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontStyle,
                                                            ),
                                                            letterSpacing: 0.0,
                                                            fontWeight:
                                                                FontWeight.w600,
                                                            fontStyle:
                                                                FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontStyle,
                                                          ),
                                                    )),
                                                  ),
                                                ),
                                                Expanded(
                                                  flex: 1,
                                                  child: Align(
                                                    alignment:
                                                        AlignmentDirectional(
                                                            -1.0, 0.0),
                                                    child: SelectionArea(
                                                        child: Text(
                                                      FFLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'ks76ugh7' /* Unidade/Medida */,
                                                      ),
                                                      style: FlutterFlowTheme
                                                              .of(context)
                                                          .labelSmall
                                                          .override(
                                                            font: GoogleFonts
                                                                .lexend(
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w600,
                                                              fontStyle:
                                                                  FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontStyle,
                                                            ),
                                                            letterSpacing: 0.0,
                                                            fontWeight:
                                                                FontWeight.w600,
                                                            fontStyle:
                                                                FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontStyle,
                                                          ),
                                                    )),
                                                  ),
                                                ),
                                                Expanded(
                                                  flex: 1,
                                                  child: Align(
                                                    alignment:
                                                        AlignmentDirectional(
                                                            -1.0, 0.0),
                                                    child: SelectionArea(
                                                        child: Text(
                                                      FFLocalizations.of(
                                                              context)
                                                          .getText(
                                                        '8gke7ew6' /* Disciplina */,
                                                      ),
                                                      style: FlutterFlowTheme
                                                              .of(context)
                                                          .labelSmall
                                                          .override(
                                                            font: GoogleFonts
                                                                .lexend(
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w600,
                                                              fontStyle:
                                                                  FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontStyle,
                                                            ),
                                                            letterSpacing: 0.0,
                                                            fontWeight:
                                                                FontWeight.w600,
                                                            fontStyle:
                                                                FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontStyle,
                                                          ),
                                                    )),
                                                  ),
                                                ),

                                                Container(
                                                  constraints: BoxConstraints(
                                                    minWidth: 40.0,
                                                    maxWidth: 100.0,
                                                  ),
                                                  decoration: BoxDecoration(),
                                                  child: SelectionArea(
                                                      child: Text(
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                      'v4svsvsf' /* Ações */,
                                                    ),
                                                    style: FlutterFlowTheme.of(
                                                            context)
                                                        .labelSmall
                                                        .override(
                                                          font: GoogleFonts
                                                              .lexend(
                                                            fontWeight:
                                                                FontWeight.w600,
                                                            fontStyle:
                                                                FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontStyle,
                                                          ),
                                                          letterSpacing: 0.0,
                                                          fontWeight:
                                                              FontWeight.w600,
                                                          fontStyle:
                                                              FlutterFlowTheme.of(
                                                                      context)
                                                                  .labelSmall
                                                                  .fontStyle,
                                                        ),
                                                  )),
                                                ),
                                              ].divide(SizedBox(width: 12.0)),
                                            ),
                                          ),
                                        ),
                                        Expanded(
                                          child: Builder(
                                            builder: (context) {
                                              final list = ProjectsGroup
                                                      .getProjectsBacklogsRecordCall
                                                      .list(
                                                        containerGetProjectsBacklogsRecordResponse
                                                            .jsonBody,
                                                      )
                                                      ?.toList() ??
                                                  [];
                                              if (list.isEmpty) {
                                                return ModalEmptyWidget();
                                              }

                                              return ListView.builder(
                                                padding: EdgeInsets.zero,
                                                shrinkWrap: true,
                                                scrollDirection: Axis.vertical,
                                                itemCount: list.length,
                                                itemBuilder:
                                                    (context, listIndex) {
                                                  final listItem =
                                                      list[listIndex];
                                                  return Padding(
                                                    padding:
                                                        EdgeInsetsDirectional
                                                            .fromSTEB(0.0, 0.0,
                                                                0.0, 1.0),
                                                    child: Container(
                                                      width: MediaQuery.sizeOf(
                                                                  context)
                                                              .width *
                                                          1.0,
                                                      constraints:
                                                          BoxConstraints(
                                                        maxHeight: 150.0,
                                                      ),
                                                      decoration: BoxDecoration(
                                                        color: valueOrDefault<
                                                            Color>(
                                                          functions
                                                              .funColorTable(
                                                                  listIndex),
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .secondaryBackground,
                                                        ),
                                                        boxShadow: [
                                                          BoxShadow(
                                                            blurRadius: 0.0,
                                                            color: FlutterFlowTheme
                                                                    .of(context)
                                                                .alternate,
                                                            offset: Offset(
                                                              0.0,
                                                              1.0,
                                                            ),
                                                          )
                                                        ],
                                                      ),
                                                      child: Padding(
                                                        padding:
                                                            EdgeInsetsDirectional
                                                                .fromSTEB(
                                                                    0.0,
                                                                    4.0,
                                                                    0.0,
                                                                    8.0),
                                                        child: Column(
                                                          mainAxisSize:
                                                              MainAxisSize.min,
                                                          crossAxisAlignment:
                                                              CrossAxisAlignment
                                                                  .start,
                                                          children: [
                                                            Padding(
                                                              padding:
                                                                  EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          16.0,
                                                                          4.0,
                                                                          16.0,
                                                                          4.0),
                                                              child: Row(
                                                                mainAxisSize:
                                                                    MainAxisSize
                                                                        .min,
                                                                crossAxisAlignment:
                                                                    CrossAxisAlignment
                                                                        .start,
                                                                children: [
                                                                  Container(
                                                                    width: 20.0,
                                                                    height:
                                                                        20.0,
                                                                    decoration:
                                                                        BoxDecoration(),
                                                                    child:
                                                                        Visibility(
                                                                      visible: functions.retornaEmpty(
                                                                        getJsonField(
                                                                          listItem,
                                                                          r'''$.subtasks''',
                                                                          true,
                                                                        ),
                                                                      ).toString() ==
                                                                          '1',
                                                                      child:
                                                                          Row(
                                                                        mainAxisSize:
                                                                            MainAxisSize.max,
                                                                        children: [
                                                                          if (_model.subtasks ==
                                                                              null)
                                                                            InkWell(
                                                                              splashColor: Colors.transparent,
                                                                              focusColor: Colors.transparent,
                                                                              hoverColor: Colors.transparent,
                                                                              highlightColor: Colors.transparent,
                                                                              onTap: () async {
                                                                                _model.subtasks = getJsonField(
                                                                                  listItem,
                                                                                  r'''$.id''',
                                                                                );
                                                                                safeSetState(() {});
                                                                              },
                                                                              child: Icon(
                                                                                Icons.keyboard_arrow_down_rounded,
                                                                                color: FlutterFlowTheme.of(context).secondaryText,
                                                                                size: 18.0,
                                                                              ),
                                                                            ),
                                                                          if (_model.subtasks !=
                                                                              null)
                                                                            InkWell(
                                                                              splashColor: Colors.transparent,
                                                                              focusColor: Colors.transparent,
                                                                              hoverColor: Colors.transparent,
                                                                              highlightColor: Colors.transparent,
                                                                              onTap: () async {
                                                                                _model.subtasks = null;
                                                                                safeSetState(() {});
                                                                              },
                                                                              child: Icon(
                                                                                Icons.keyboard_arrow_up_rounded,
                                                                                color: FlutterFlowTheme.of(context).secondaryText,
                                                                                size: 18.0,
                                                                              ),
                                                                            ),
                                                                        ],
                                                                      ),
                                                                    ),
                                                                  ),
                                                                  Expanded(
                                                                    flex: 2,
                                                                    child:
                                                                        Align(
                                                                      alignment:
                                                                          AlignmentDirectional(
                                                                              -1.0,
                                                                              0.0),
                                                                      child:
                                                                          Padding(
                                                                        padding: EdgeInsetsDirectional.fromSTEB(
                                                                            0.0,
                                                                            0.0,
                                                                            24.0,
                                                                            0.0),
                                                                        child:
                                                                            Container(
                                                                          decoration:
                                                                              BoxDecoration(),
                                                                          child:
                                                                              RichText(
                                                                            textScaler:
                                                                                MediaQuery.of(context).textScaler,
                                                                            text:
                                                                                TextSpan(
                                                                              children: [
                                                                                TextSpan(
                                                                                  text: valueOrDefault<String>(
                                                                                    getJsonField(
                                                                                      listItem,
                                                                                      r'''$.id''',
                                                                                    )?.toString(),
                                                                                    '-',
                                                                                  ),
                                                                                  style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                        font: GoogleFonts.lexend(
                                                                                          fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                          fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                        ),
                                                                                        color: FlutterFlowTheme.of(context).primary,
                                                                                        letterSpacing: 0.0,
                                                                                        fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                        fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                      ),
                                                                                ),
                                                                                TextSpan(
                                                                                  text: FFLocalizations.of(context).getText(
                                                                                    'xo3byysk' /*   */,
                                                                                  ),
                                                                                  style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                        font: GoogleFonts.lexend(
                                                                                          fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                          fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                        ),
                                                                                        color: FlutterFlowTheme.of(context).primaryText,
                                                                                        letterSpacing: 0.0,
                                                                                        fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                        fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                      ),
                                                                                ),
                                                                                TextSpan(
                                                                                  text: valueOrDefault<String>(
                                                                                    getJsonField(
                                                                                      listItem,
                                                                                      r'''$.description''',
                                                                                    )?.toString(),
                                                                                    '-',
                                                                                  ),
                                                                                  style: FlutterFlowTheme.of(context).bodySmall.override(
                                                                                        font: GoogleFonts.lexend(
                                                                                          fontWeight: FlutterFlowTheme.of(context).bodySmall.fontWeight,
                                                                                          fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                        ),
                                                                                        letterSpacing: 0.0,
                                                                                        fontWeight: FlutterFlowTheme.of(context).bodySmall.fontWeight,
                                                                                        fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                      ),
                                                                                )
                                                                              ],
                                                                              style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                    font: GoogleFonts.lexend(
                                                                                      fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                      fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                    ),
                                                                                    color: FlutterFlowTheme.of(context).primaryText,
                                                                                    letterSpacing: 0.0,
                                                                                    fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                    fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                  ),
                                                                            ),
                                                                          ),
                                                                        ),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                  Expanded(
                                                                    child:
                                                                        Align(
                                                                      alignment:
                                                                          AlignmentDirectional(
                                                                              -1.0,
                                                                              0.0),
                                                                      child:
                                                                          Container(
                                                                        width:
                                                                            60.0,
                                                                        decoration:
                                                                            BoxDecoration(),
                                                                        alignment: AlignmentDirectional(
                                                                            -1.0,
                                                                            0.0),
                                                                        child: SelectionArea(
                                                                            child: Text(
                                                                          valueOrDefault<
                                                                              String>(
                                                                            'x${valueOrDefault<String>(
                                                                               (getJsonField(listItem, r'''$.weight''') != null ? getJsonField(listItem, r'''$.weight''') : getJsonField(listItem, r'''$.tasks_template.weight'''))
                                                                               ?.toString(),
                                                                              '0',
                                                                            )}',
                                                                            '-',
                                                                          ),
                                                                          textAlign:
                                                                              TextAlign.center,
                                                                          style: FlutterFlowTheme.of(context)
                                                                              .labelMedium
                                                                              .override(
                                                                                font: GoogleFonts.lexend(
                                                                                  fontWeight: FlutterFlowTheme.of(context).labelMedium.fontWeight,
                                                                                  fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                                ),
                                                                                color: FlutterFlowTheme.of(context).primary,
                                                                                letterSpacing: 0.0,
                                                                                fontWeight: FlutterFlowTheme.of(context).labelMedium.fontWeight,
                                                                                fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                              ),
                                                                        )),
                                                                      ),
                                                                    ),
                                                                  ),

                                                                  Expanded(
                                                                    child:
                                                                        Container(
                                                                      decoration:
                                                                          BoxDecoration(),
                                                                      child:
                                                                          Visibility(
                                                                        visible: FFAppConstants.zero !=
                                                                            getJsonField(
                                                                              listItem,
                                                                              r'''$.quantity''',
                                                                            ),
                                                                        child: SelectionArea(
                                                                            child: Text(
                                                                          valueOrDefault<
                                                                              String>(
                                                                            getJsonField(
                                                                              listItem,
                                                                              r'''$.quantity''',
                                                                            )?.toString(),
                                                                            '-',
                                                                          ),
                                                                          style: FlutterFlowTheme.of(context)
                                                                              .bodyMedium
                                                                              .override(
                                                                                font: GoogleFonts.lexend(
                                                                                  fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                  fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                ),
                                                                                letterSpacing: 0.0,
                                                                                fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                              ),
                                                                        )),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                  Expanded(
                                                                    child: Align(
                                                                      alignment: AlignmentDirectional(-1.0, 0.0),
                                                                      child: Container(
                                                                        decoration: BoxDecoration(),
                                                                        child: SelectionArea(
                                                                            child: Text(
                                                                          valueOrDefault<String>(
                                                                            (getJsonField(listItem, r'''$.unity.unity''') ??
                                                                                    getJsonField(listItem, r'''$.unity_1.unity''') ??
                                                                                    getJsonField(listItem, r'''$.tasks_template.unity.unity''') ??
                                                                                    getJsonField(listItem, r'''$.tasks_template.unity_1.unity'''))
                                                                                ?.toString(),
                                                                            '-',
                                                                          ),
                                                                          style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                                                font: GoogleFonts.lexend(
                                                                                  fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                  fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                ),
                                                                                letterSpacing: 0.0,
                                                                                fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                              ),
                                                                        )),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                  Expanded(
                                                                    child: Align(
                                                                      alignment: AlignmentDirectional(-1.0, 0.0),
                                                                      child: Container(
                                                                        decoration: BoxDecoration(),
                                                                        child: SelectionArea(
                                                                            child: Text(
                                                                          valueOrDefault<String>(
                                                                            (getJsonField(listItem, r'''$.discipline.discipline''') ??
                                                                                    getJsonField(listItem, r'''$.tasks_template.discipline.discipline'''))
                                                                                ?.toString(),
                                                                            '-',
                                                                          ),
                                                                          style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                                                font: GoogleFonts.lexend(
                                                                                  fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                  fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                ),
                                                                                letterSpacing: 0.0,
                                                                                fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                              ),
                                                                        )),
                                                                      ),
                                                                    ),
                                                                  ),

                                                                  Builder(
                                                                    builder:
                                                                        (context) =>
                                                                            InkWell(
                                                                      splashColor:
                                                                          Colors
                                                                              .transparent,
                                                                      focusColor:
                                                                          Colors
                                                                              .transparent,
                                                                      hoverColor:
                                                                          Colors
                                                                              .transparent,
                                                                      highlightColor:
                                                                          Colors
                                                                              .transparent,
                                                                      onTap:
                                                                          () async {
                                                                        await showAlignedDialog(
                                                                          barrierColor:
                                                                              Colors.transparent,
                                                                          context:
                                                                              context,
                                                                          isGlobal:
                                                                              false,
                                                                          avoidOverflow:
                                                                              true,
                                                                          targetAnchor:
                                                                              AlignmentDirectional(1.0, 1.0).resolve(Directionality.of(context)),
                                                                          followerAnchor:
                                                                              AlignmentDirectional(1.0, -1.0).resolve(Directionality.of(context)),
                                                                          builder:
                                                                              (dialogContext) {
                                                                            return Material(
                                                                              color: Colors.transparent,
                                                                              child: GestureDetector(
                                                                                onTap: () {
                                                                                  FocusScope.of(dialogContext).unfocus();
                                                                                  FocusManager.instance.primaryFocus?.unfocus();
                                                                                },
                                                                                child: OptionsTarefasProjetoWidget(
                                                                                  id: getJsonField(
                                                                                    listItem,
                                                                                    r'''$.id''',
                                                                                  ),
                                                                                  items: listItem,
                                                                                  page: '',
                                                                                  projectsBacklogsId: getJsonField(
                                                                                    listItem,
                                                                                    r'''$.id''',
                                                                                  ),
                                                                                ),
                                                                              ),
                                                                            );
                                                                          },
                                                                        );
                                                                      },
                                                                      child:
                                                                          Container(
                                                                        constraints:
                                                                            BoxConstraints(
                                                                          minWidth:
                                                                              40.0,
                                                                          maxWidth:
                                                                              100.0,
                                                                        ),
                                                                        decoration:
                                                                            BoxDecoration(),
                                                                        child:
                                                                            Icon(
                                                                          Icons
                                                                              .more_vert,
                                                                          color:
                                                                              FlutterFlowTheme.of(context).primaryText,
                                                                          size:
                                                                              18.0,
                                                                        ),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                ].divide(SizedBox(
                                                                    width:
                                                                        12.0)),
                                                              ),
                                                            ),
                                                            if (_model
                                                                    .subtasks ==
                                                                getJsonField(
                                                                  listItem,
                                                                  r'''$.id''',
                                                                ))
                                                              Flexible(
                                                                child: Padding(
                                                                  padding: EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          48.0,
                                                                          0.0,
                                                                          0.0,
                                                                          0.0),
                                                                  child:
                                                                      Builder(
                                                                    builder:
                                                                        (context) {
                                                                      final listSubtasks =
                                                                          getJsonField(
                                                                        listItem,
                                                                        r'''$.subtasks''',
                                                                      ).toList();

                                                                      return ListView
                                                                          .builder(
                                                                        padding:
                                                                            EdgeInsets.zero,
                                                                        shrinkWrap:
                                                                            true,
                                                                        scrollDirection:
                                                                            Axis.vertical,
                                                                        itemCount:
                                                                            listSubtasks.length,
                                                                        itemBuilder:
                                                                            (context,
                                                                                listSubtasksIndex) {
                                                                          final listSubtasksItem =
                                                                              listSubtasks[listSubtasksIndex];
                                                                          return Column(
                                                                            mainAxisSize:
                                                                                MainAxisSize.max,
                                                                            children: [
                                                                              Padding(
                                                                                padding: EdgeInsetsDirectional.fromSTEB(16.0, 5.0, 16.0, 5.0),
                                                                                child: Row(
                                                                                  mainAxisSize: MainAxisSize.max,
                                                                                  mainAxisAlignment: MainAxisAlignment.start,
                                                                                  children: [
                                                                                    Expanded(
                                                                                      flex: 2,
                                                                                      child: Align(
                                                                                        alignment: AlignmentDirectional(-1.0, 0.0),
                                                                                        child: RichText(
                                                                                          textScaler: MediaQuery.of(context).textScaler,
                                                                                          text: TextSpan(
                                                                                            children: [
                                                                                              TextSpan(
                                                                                                text: getJsonField(
                                                                                                  listSubtasksItem,
                                                                                                  r'''$.id''',
                                                                                                ).toString(),
                                                                                                style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                                      font: GoogleFonts.lexend(
                                                                                                        fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                        fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                      ),
                                                                                                      color: FlutterFlowTheme.of(context).primary,
                                                                                                      letterSpacing: 0.0,
                                                                                                      fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                      fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                    ),
                                                                                              ),
                                                                                              TextSpan(
                                                                                                text: FFLocalizations.of(context).getText(
                                                                                                  'kr8boolb' /*  -  */,
                                                                                                ),
                                                                                                style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                                      font: GoogleFonts.lexend(
                                                                                                        fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                        fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                      ),
                                                                                                      color: FlutterFlowTheme.of(context).primaryText,
                                                                                                      letterSpacing: 0.0,
                                                                                                      fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                      fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                    ),
                                                                                              ),
                                                                                              TextSpan(
                                                                                                text: getJsonField(
                                                                                                  listSubtasksItem,
                                                                                                  r'''$.description''',
                                                                                                ).toString(),
                                                                                                style: FlutterFlowTheme.of(context).bodySmall.override(
                                                                                                      font: GoogleFonts.lexend(
                                                                                                        fontWeight: FlutterFlowTheme.of(context).bodySmall.fontWeight,
                                                                                                        fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                                      ),
                                                                                                      letterSpacing: 0.0,
                                                                                                      fontWeight: FlutterFlowTheme.of(context).bodySmall.fontWeight,
                                                                                                      fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                                    ),
                                                                                              )
                                                                                            ],
                                                                                            style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                                  font: GoogleFonts.lexend(
                                                                                                    fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                    fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                  ),
                                                                                                  color: FlutterFlowTheme.of(context).primaryText,
                                                                                                  letterSpacing: 0.0,
                                                                                                  fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                  fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                ),
                                                                                          ),
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                    Expanded(
                                                                                      child: Align(
                                                                                        alignment: AlignmentDirectional(-1.0, 0.0),
                                                                                        child: Text(
                                                                                          valueOrDefault<String>(
                                                                                            getJsonField(
                                                                                              listSubtasksItem,
                                                                                              r'''$.weight''',
                                                                                            )?.toString(),
                                                                                            '-',
                                                                                          ),
                                                                                          textAlign: TextAlign.center,
                                                                                          style: FlutterFlowTheme.of(context).labelMedium.override(
                                                                                                font: GoogleFonts.lexend(
                                                                                                  fontWeight: FlutterFlowTheme.of(context).labelMedium.fontWeight,
                                                                                                  fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                                                ),
                                                                                                color: FlutterFlowTheme.of(context).primary,
                                                                                                letterSpacing: 0.0,
                                                                                                fontWeight: FlutterFlowTheme.of(context).labelMedium.fontWeight,
                                                                                                fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                                              ),
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                    Expanded(
                                                                                      child: Align(
                                                                                        alignment: AlignmentDirectional(-1.0, 0.0),
                                                                                        child: Text(
                                                                                          valueOrDefault<String>(
                                                                                            getJsonField(
                                                                                              listSubtasksItem,
                                                                                              r'''$.quantity''',
                                                                                            )?.toString(),
                                                                                            '-',
                                                                                          ),
                                                                                          style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                                                                font: GoogleFonts.lexend(
                                                                                                  fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                                  fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                                ),
                                                                                                letterSpacing: 0.0,
                                                                                                fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                                fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                              ),
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                    Expanded(
                                                                                      child: Align(
                                                                                        alignment: AlignmentDirectional(-1.0, 0.0),
                                                                                        child: Text(
                                                                                          valueOrDefault<String>(
                                                                                            (getJsonField(listSubtasksItem, r'''$.unity.unity''') ?? 
                                                                                             getJsonField(listItem, r'''$.unity.unity'''))?.toString(),
                                                                                            '-',
                                                                                          ),
                                                                                          style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                                                                font: GoogleFonts.lexend(
                                                                                                  fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                                  fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                                ),
                                                                                                letterSpacing: 0.0,
                                                                                                fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                                fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                              ),
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                    Expanded(
                                                                                      child: Align(
                                                                                        alignment: AlignmentDirectional(-1.0, 0.0),
                                                                                        child: Text(
                                                                                          valueOrDefault<String>(
                                                                                              getJsonField(
                                                                                                listItem,
                                                                                                r'''$.discipline.discipline''',
                                                                                              )?.toString(),
                                                                                              '-',
                                                                                            ),
                                                                                          style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                                                                font: GoogleFonts.lexend(
                                                                                                  fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                                  fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                                ),
                                                                                                letterSpacing: 0.0,
                                                                                                fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                                fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                              ),
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                    Align(
                                                                                      alignment: AlignmentDirectional(1.0, 0.0),
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
                                                                                                  alignment: AlignmentDirectional(0.0, 0.0).resolve(Directionality.of(context)),
                                                                                                  child: GestureDetector(
                                                                                                    onTap: () {
                                                                                                      FocusScope.of(dialogContext).unfocus();
                                                                                                      FocusManager.instance.primaryFocus?.unfocus();
                                                                                                    },
                                                                                                    child: ModalSubtasksWidget(
                                                                                                      type: 'edit',
                                                                                                      items: listSubtasksItem,
                                                                                                      taskID: getJsonField(
                                                                                                        listItem,
                                                                                                        r'''$.id''',
                                                                                                      ),
                                                                                                      projectsBacklogId: getJsonField(
                                                                                                        listItem,
                                                                                                        r'''$.id''',
                                                                                                      ),
                                                                                                      action: () async {
                                                                                                        safeSetState(() {
                                                                                                          _model.clearBacklogCache();
                                                                                                          _model.apiRequestCompleted2 = false;
                                                                                                        });
                                                                                                        await _model.waitForApiRequestCompleted2();
                                                                                                        safeSetState(() {
                                                                                                          _model.clearSprintsCache();
                                                                                                          _model.apiRequestCompleted1 = false;
                                                                                                        });
                                                                                                        await _model.waitForApiRequestCompleted1();
                                                                                                        safeSetState(() {
                                                                                                          _model.clearFilterBacklogCache();
                                                                                                          _model.apiRequestCompleted3 = false;
                                                                                                        });
                                                                                                        await _model.waitForApiRequestCompleted3();
                                                                                                      },
                                                                                                    ),
                                                                                                  ),
                                                                                                );
                                                                                              },
                                                                                            );
                                                                                          },
                                                                                          child: Container(
                                                                                            width: 50.0,
                                                                                            decoration: BoxDecoration(),
                                                                                            alignment: AlignmentDirectional(0.0, 0.0),
                                                                                            child: Icon(
                                                                                              Icons.edit,
                                                                                              color: FlutterFlowTheme.of(context).primaryText,
                                                                                              size: 16.0,
                                                                                            ),
                                                                                          ),
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                  ].divide(SizedBox(width: 12.0)),
                                                                                ),
                                                                              ),
                                                                            ],
                                                                          );
                                                                        },
                                                                      );
                                                                    },
                                                                  ),
                                                                ),
                                                              ),
                                                          ],
                                                        ),
                                                      ),
                                                    ),
                                                  );
                                                },
                                              );
                                            },
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (ProjectsGroup
                                              .getProjectsBacklogsRecordCall
                                              .list(
                                            containerGetProjectsBacklogsRecordResponse
                                                .jsonBody,
                                          ) !=
                                          null &&
                                      (ProjectsGroup
                                              .getProjectsBacklogsRecordCall
                                              .list(
                                        containerGetProjectsBacklogsRecordResponse
                                            .jsonBody,
                                      ))!
                                          .isNotEmpty)
                                    Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          0.0, 16.0, 0.0, 0.0),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.max,
                                        mainAxisAlignment:
                                            MainAxisAlignment.end,
                                        children: [
                                          Row(
                                            mainAxisSize: MainAxisSize.max,
                                            children: [
                                              Text(
                                                FFLocalizations.of(context)
                                                    .getText(
                                                  'cyzv3gkp' /* linhas por página: */,
                                                ),
                                                style: FlutterFlowTheme.of(
                                                        context)
                                                    .bodyMedium
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .fontStyle,
                                                      ),
                                                      color: Color(0xB32D323F),
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .bodyMedium
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .bodyMedium
                                                              .fontStyle,
                                                    ),
                                              ),
                                              FlutterFlowDropDown<int>(
                                                controller: _model
                                                        .dropDownValueController ??=
                                                    FormFieldController<int>(
                                                  _model.dropDownValue ??= 10,
                                                ),
                                                options: List<int>.from(
                                                    [5, 10, 15, 20, 50, 1000]),
                                                optionLabels: [
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    'm91lx1mz' /* 5 */,
                                                  ),
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    'epusstu8' /* 10 */,
                                                  ),
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    'ttxaixsx' /* 15 */,
                                                  ),
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    'wtufuibf' /* 20 */,
                                                  ),
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    'a4rik1xj' /* 50 */,
                                                  ),
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    '9apgl0r8' /* 100 */,
                                                  ),
                                                  ''
                                                ],
                                                onChanged: (val) async {
                                                  safeSetState(() => _model
                                                      .dropDownValue = val);
                                                  _model.perPage =
                                                      _model.dropDownValue!;
                                                  _model.page = 1;
                                                  safeSetState(() {});
                                                  safeSetState(() {
                                                    _model.clearBacklogCache();
                                                    _model.apiRequestCompleted2 =
                                                        false;
                                                  });
                                                  await _model
                                                      .waitForApiRequestCompleted2();
                                                },
                                                width: 62.0,
                                                height: 35.0,
                                                textStyle: FlutterFlowTheme.of(
                                                        context)
                                                    .bodyMedium
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .fontStyle,
                                                      ),
                                                      color: Color(0xB32D323F),
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .bodyMedium
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .bodyMedium
                                                              .fontStyle,
                                                    ),
                                                hintText:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  '18tk3dhw' /* 10 */,
                                                ),
                                                icon: Icon(
                                                  Icons
                                                      .keyboard_arrow_down_rounded,
                                                  color: Color(0xB276787D),
                                                  size: 18.0,
                                                ),
                                                fillColor:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryBackground,
                                                elevation: 2.0,
                                                borderColor:
                                                    FlutterFlowTheme.of(context)
                                                        .alternate,
                                                borderWidth: 0.0,
                                                borderRadius: 8.0,
                                                margin: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        12.0, 0.0, 12.0, 0.0),
                                                hidesUnderline: true,
                                                isOverButton: false,
                                                isSearchable: false,
                                                isMultiSelect: false,
                                              ),
                                            ].divide(SizedBox(width: 16.0)),
                                          ),
                                          Text(
                                            valueOrDefault<String>(
                                              '${_model.page.toString()} de ${valueOrDefault<String>(
                                                ProjectsGroup
                                                    .getProjectsBacklogsRecordCall
                                                    .pageTotal(
                                                      containerGetProjectsBacklogsRecordResponse
                                                          .jsonBody,
                                                    )
                                                    ?.toString(),
                                                'N/A',
                                              )}',
                                              'N/A',
                                            ),
                                            style: FlutterFlowTheme.of(context)
                                                .bodyMedium
                                                .override(
                                                  font: GoogleFonts.lexend(
                                                    fontWeight:
                                                        FlutterFlowTheme.of(
                                                                context)
                                                            .bodyMedium
                                                            .fontWeight,
                                                    fontStyle:
                                                        FlutterFlowTheme.of(
                                                                context)
                                                            .bodyMedium
                                                            .fontStyle,
                                                  ),
                                                  color: Color(0xB22D323F),
                                                  letterSpacing: 0.0,
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .bodyMedium
                                                          .fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .bodyMedium
                                                          .fontStyle,
                                                ),
                                          ),
                                          Row(
                                            mainAxisSize: MainAxisSize.max,
                                            children: [
                                              FlutterFlowIconButton(
                                                borderRadius: 8.0,
                                                buttonSize: 40.0,
                                                hoverColor:
                                                    FlutterFlowTheme.of(context)
                                                        .hoverNavBar,
                                                hoverIconColor:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryBackground,
                                                hoverBorderColor:
                                                    FlutterFlowTheme.of(context)
                                                        .hoverNavBar,
                                                icon: Icon(
                                                  Icons.arrow_back_ios_rounded,
                                                  color: Color(0x662D323F),
                                                  size: 18.0,
                                                ),
                                                onPressed: () async {
                                                  if (_model.page != 1) {
                                                    _model.page =
                                                        _model.page + -1;
                                                    safeSetState(() {});
                                                    safeSetState(() {
                                                      _model
                                                          .clearBacklogCache();
                                                      _model.apiRequestCompleted2 =
                                                          false;
                                                    });
                                                    await _model
                                                        .waitForApiRequestCompleted2();
                                                  }
                                                },
                                              ),
                                              FlutterFlowIconButton(
                                                borderRadius: 8.0,
                                                buttonSize: 40.0,
                                                hoverColor:
                                                    FlutterFlowTheme.of(context)
                                                        .hoverNavBar,
                                                hoverIconColor:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryBackground,
                                                hoverBorderColor:
                                                    FlutterFlowTheme.of(context)
                                                        .hoverNavBar,
                                                icon: Icon(
                                                  Icons
                                                      .arrow_forward_ios_rounded,
                                                  color: Color(0x662D323F),
                                                  size: 18.0,
                                                ),
                                                onPressed: () async {
                                                  if (_model.page !=
                                                      ProjectsGroup
                                                          .getProjectsBacklogsRecordCall
                                                          .pageTotal(
                                                        containerGetProjectsBacklogsRecordResponse
                                                            .jsonBody,
                                                      )) {
                                                    _model.page =
                                                        _model.page + 1;
                                                    safeSetState(() {});
                                                    safeSetState(() {
                                                      _model
                                                          .clearBacklogCache();
                                                      _model.apiRequestCompleted2 =
                                                          false;
                                                    });
                                                    await _model
                                                        .waitForApiRequestCompleted2();
                                                  }
                                                },
                                              ),
                                            ],
                                          ),
                                        ].divide(SizedBox(width: 24.0)),
                                      ),
                                    ),
                                ].divide(SizedBox(height: 16.0)),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
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
