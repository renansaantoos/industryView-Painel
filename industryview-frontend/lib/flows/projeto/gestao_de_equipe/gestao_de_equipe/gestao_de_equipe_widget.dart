import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/filtro_cargo/filtro_cargo_widget.dart';
import '/components/modal_empty_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/components/options_colaborador/options_colaborador_widget.dart';
import '/flows/projeto/gestao_de_equipe/modal_add_colaborador/modal_add_colaborador_widget.dart';
import '/flows/projeto/gestao_de_equipe/modal_add_lider/modal_add_lider_widget.dart';
import '/flows/projeto/gestao_de_equipe/modal_nova_equipe/modal_nova_equipe_widget.dart';
import '/flows/projeto/gestao_de_equipe/options_equipe/options_equipe_widget.dart';
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
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/custom_code/widgets/index.dart' as custom_widgets;
import '/flutter_flow/custom_functions.dart' as functions;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'gestao_de_equipe_model.dart';
export 'gestao_de_equipe_model.dart';

const String kDefaultProfilePic = 'https://x8ki-letl-twmt.n7.xano.io/vault/iaWPz-tD/8ler69Ci8dU8B1ExemIRgXluexs/JGrgRQ../no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg';

class GestaoDeEquipeWidget extends StatefulWidget {
  const GestaoDeEquipeWidget({super.key});

  static String routeName = 'gestaoDeEquipe';
  static String routePath = '/gestaoDeEquipe';

  @override
  State<GestaoDeEquipeWidget> createState() => _GestaoDeEquipeWidgetState();
}

class _GestaoDeEquipeWidgetState extends State<GestaoDeEquipeWidget> {
  late GestaoDeEquipeModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => GestaoDeEquipeModel());

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      FFAppState().filtroIdsCargo = [];
      safeSetState(() {});
      _model.nomeEquipe = valueOrDefault<String>(
        FFAppState().projectsInfo.lastTeamCreated.name,
        '-',
      );
      safeSetState(() {});
      _model.aPiTokenAuth = await AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall
          .call(
        bearerAuth: FFAppState().token,
      );

      if ((_model.aPiTokenAuth?.succeeded ?? true)) {
        FFAppState().isMap = false;
        FFAppState().update(() {});
        return;
      } else {
        GoRouter.of(context).prepareAuthEvent();
        await authManager.signOut();
        GoRouter.of(context).clearRedirectLocation();

        context.goNamedAuth(LoginWidget.routeName, context.mounted);

        return;
      }

      context.goNamedAuth(LoginWidget.routeName, context.mounted);
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

    return GestureDetector(
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
                        .listaLeaders(
                      requestFn: () =>
                          ProjectsGroup.queryAllTeamsLeadersRecordsCall.call(
                        bearerAuth: FFAppState().token,
                        page: _model.pageLeaders,
                        perPage: _model.perPageLeaders,
                        projectsId: FFAppState().projectsInfo.id,
                        teamsId: FFAppState().teamId,
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
                      final queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse =
                          snapshot.data!;

                      return Material(
                        color: Colors.transparent,
                        elevation: 1.0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        child: Container(
                          width: double.infinity,
                          height: double.infinity,
                          decoration: BoxDecoration(
                            color: FlutterFlowTheme.of(context)
                                .secondaryBackground,
                            borderRadius: BorderRadius.circular(12.0),
                            border: Border.all(
                              color: FlutterFlowTheme.of(context).alternate,
                            ),
                          ),
                          child: Align(
                            alignment: AlignmentDirectional(0.0, -1.0),
                            child: Padding(
                              padding: EdgeInsets.all(24.0),
                              child: FutureBuilder<ApiCallResponse>(
                                future: _model
                                    .lista(
                                  requestFn: () => ProjectsGroup
                                      .queryAllTeamsRecordsCall
                                      .call(
                                    projectsId: FFAppState().projectsInfo.id,
                                    teamsId: FFAppState().teamId,
                                    page: _model.pageTeam,
                                    perPage: _model.perPageTeams,
                                    bearerAuth: FFAppState().token,
                                    search: _model.textController.text,
                                    usersRolesIdList:
                                        FFAppState().filtroIdsCargo,
                                  ),
                                )
                                    .then((result) {
                                  _model.apiRequestCompleted1 = true;
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
                                  final queryallteamsQueryAllTeamsRecordsResponse =
                                      snapshot.data!;

                                  return SingleChildScrollView(
                                    primary: false,
                                    child: Column(
                                      mainAxisSize: MainAxisSize.max,
                                      mainAxisAlignment:
                                          MainAxisAlignment.start,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
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
                                                  splashColor:
                                                      Colors.transparent,
                                                  focusColor:
                                                      Colors.transparent,
                                                  hoverColor:
                                                      Colors.transparent,
                                                  highlightColor:
                                                      Colors.transparent,
                                                  onTap: () async {
                                                    context.pushNamed(
                                                      ProjetosWidget.routeName,
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
                                                  child: Container(
                                                    decoration: BoxDecoration(),
                                                    child: Text(
                                                      FFLocalizations.of(
                                                              context)
                                                          .getText(
                                                        '1iyszvk4' /* Projetos */,
                                                      ),
                                                      style:
                                                          FlutterFlowTheme.of(
                                                                  context)
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
                                                                color: FlutterFlowTheme.of(
                                                                        context)
                                                                    .primaryText,
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
                                                Padding(
                                                  padding: EdgeInsetsDirectional
                                                      .fromSTEB(
                                                          8.0, 0.0, 8.0, 0.0),
                                                  child: Icon(
                                                    Icons
                                                        .keyboard_arrow_right_rounded,
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .primaryText,
                                                    size: 18.0,
                                                  ),
                                                ),
                                                InkWell(
                                                  splashColor:
                                                      Colors.transparent,
                                                  focusColor:
                                                      Colors.transparent,
                                                  hoverColor:
                                                      Colors.transparent,
                                                  highlightColor:
                                                      Colors.transparent,
                                                  onTap: () async {
                                                    context.pushNamed(
                                                      ProjetoDetalhesWidget
                                                          .routeName,
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
                                                  child: Container(
                                                    decoration: BoxDecoration(),
                                                    child: Text(
                                                      FFAppState()
                                                          .projectsInfo
                                                          .name,
                                                      style:
                                                          FlutterFlowTheme.of(
                                                                  context)
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
                                                                color: FlutterFlowTheme.of(
                                                                        context)
                                                                    .primaryText,
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
                                                Padding(
                                                  padding: EdgeInsetsDirectional
                                                      .fromSTEB(
                                                          8.0, 0.0, 8.0, 0.0),
                                                  child: Icon(
                                                    Icons
                                                        .keyboard_arrow_right_rounded,
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .primaryText,
                                                    size: 18.0,
                                                  ),
                                                ),
                                                Text(
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    '43q21uea' /* Gestão de equipe */,
                                                  ),
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .bodyMedium
                                                      .override(
                                                        font:
                                                            GoogleFonts.lexend(
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
                                                  mainAxisSize:
                                                      MainAxisSize.min,
                                                  children: [
                                                    Icon(
                                                      Icons.people_sharp,
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .primary,
                                                      size: 24.0,
                                                    ),
                                                    Align(
                                                      alignment:
                                                          AlignmentDirectional(
                                                              -1.0, -1.0),
                                                      child: SelectionArea(
                                                          child: Text(
                                                        FFLocalizations.of(
                                                                context)
                                                            .getText(
                                                          'ufrjha5y' /* Gestão de equipe */,
                                                        ),
                                                        style:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .headlineMedium
                                                                .override(
                                                                  font: GoogleFonts
                                                                      .lexend(
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w500,
                                                                    fontStyle: FlutterFlowTheme.of(
                                                                            context)
                                                                        .headlineMedium
                                                                        .fontStyle,
                                                                  ),
                                                                  letterSpacing:
                                                                      0.0,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w500,
                                                                  fontStyle: FlutterFlowTheme.of(
                                                                          context)
                                                                      .headlineMedium
                                                                      .fontStyle,
                                                                ),
                                                      )),
                                                    ),
                                                  ].divide(
                                                      SizedBox(width: 8.0)),
                                                ),
                                                SelectionArea(
                                                    child: Text(
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    '5639optp' /* Adicione funcionários de acord... */,
                                                  ),
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
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .alternate,
                                            ),
                                          ].divide(SizedBox(height: 12.0)),
                                        ),
                                        FutureBuilder<ApiCallResponse>(
                                          future: _model.listaTeams(
                                            requestFn: () => ProjectsGroup
                                                .getTeamsRecordCall
                                                .call(
                                              bearerAuth: FFAppState().token,
                                              projectsId:
                                                  FFAppState().projectsInfo.id,
                                            ),
                                          ),
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
                                            final containerGetTeamsRecordResponse =
                                                snapshot.data!;

                                            return Container(
                                              decoration: BoxDecoration(),
                                              child: Column(
                                                mainAxisSize: MainAxisSize.max,
                                                children: [
                                                  Column(
                                                    mainAxisSize:
                                                        MainAxisSize.max,
                                                    children: [
                                                      Padding(
                                                        padding:
                                                            EdgeInsetsDirectional
                                                                .fromSTEB(
                                                                    0.0,
                                                                    24.0,
                                                                    0.0,
                                                                    0.0),
                                                        child: Container(
                                                          decoration:
                                                              BoxDecoration(),
                                                          child: Row(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .max,
                                                            mainAxisAlignment:
                                                                MainAxisAlignment
                                                                    .end,
                                                            children: [
                                                              Align(
                                                                alignment:
                                                                    AlignmentDirectional(
                                                                        1.0,
                                                                        0.0),
                                                                child:
                                                                    MouseRegion(
                                                                  opaque: false,
                                                                  cursor: MouseCursor
                                                                          .defer ??
                                                                      MouseCursor
                                                                          .defer,
                                                                  child:
                                                                      Builder(
                                                                    builder:
                                                                        (context) =>
                                                                            FFButtonWidget(
                                                                      onPressed:
                                                                          () async {
                                                                        FFAppState().setIds =
                                                                            [];
                                                                        safeSetState(
                                                                            () {});
                                                                        FFAppState()
                                                                            .id = 0;
                                                                        FFAppState().userLideres =
                                                                            [];
                                                                        FFAppState()
                                                                            .update(() {});
                                                                        await showDialog(
                                                                          barrierColor:
                                                                              Color(0x80000000),
                                                                          context:
                                                                              context,
                                                                          builder:
                                                                              (dialogContext) {
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
                                                                                child: ModalNovaEquipeWidget(
                                                                                  typePage: 'creat',
                                                                                  teamsId: 0,
                                                                                ),
                                                                              ),
                                                                            );
                                                                          },
                                                                        );
                                                                      },
                                                                      text: FFLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        '3wjlquma' /* Nova equipe */,
                                                                      ),
                                                                      icon:
                                                                          Icon(
                                                                        Icons
                                                                            .add_circle,
                                                                        size: _model.mouseRegionHovered1!
                                                                            ? 18.5
                                                                            : 18.0,
                                                                      ),
                                                                      options:
                                                                          FFButtonOptions(
                                                                        height:
                                                                            36.0,
                                                                        padding: EdgeInsetsDirectional.fromSTEB(
                                                                            16.0,
                                                                            0.0,
                                                                            16.0,
                                                                            0.0),
                                                                        iconPadding: EdgeInsetsDirectional.fromSTEB(
                                                                            0.0,
                                                                            0.0,
                                                                            0.0,
                                                                            0.0),
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .secondaryBackground,
                                                                        textStyle: FlutterFlowTheme.of(context)
                                                                            .labelMedium
                                                                            .override(
                                                                              font: GoogleFonts.lexend(
                                                                                fontWeight: FlutterFlowTheme.of(context).labelMedium.fontWeight,
                                                                                fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                              ),
                                                                              color: FlutterFlowTheme.of(context).primary,
                                                                              fontSize: _model.mouseRegionHovered1! ? 12.5 : 12.0,
                                                                              letterSpacing: 0.0,
                                                                              fontWeight: FlutterFlowTheme.of(context).labelMedium.fontWeight,
                                                                              fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                            ),
                                                                        elevation:
                                                                            0.0,
                                                                        borderRadius:
                                                                            BorderRadius.circular(8.0),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                  onEnter:
                                                                      ((event) async {
                                                                    safeSetState(() =>
                                                                        _model.mouseRegionHovered1 =
                                                                            true);
                                                                  }),
                                                                  onExit:
                                                                      ((event) async {
                                                                    safeSetState(() =>
                                                                        _model.mouseRegionHovered1 =
                                                                            false);
                                                                  }),
                                                                ),
                                                              ),
                                                              Expanded(
                                                                child: Stack(
                                                                  alignment:
                                                                      AlignmentDirectional(
                                                                          -1.0,
                                                                          0.0),
                                                                  children: [
                                                                    Builder(
                                                                      builder:
                                                                          (context) {
                                                                        final listTeams = containerGetTeamsRecordResponse
                                                                            .jsonBody
                                                                            .toList();

                                                                        return SingleChildScrollView(
                                                                          scrollDirection:
                                                                              Axis.horizontal,
                                                                          child:
                                                                              Row(
                                                                            mainAxisSize:
                                                                                MainAxisSize.max,
                                                                            children:
                                                                                List.generate(listTeams.length, (listTeamsIndex) {
                                                                              final listTeamsItem = listTeams[listTeamsIndex];
                                                                              return InkWell(
                                                                                splashColor: Colors.transparent,
                                                                                focusColor: Colors.transparent,
                                                                                hoverColor: Colors.transparent,
                                                                                highlightColor: Colors.transparent,
                                                                                onTap: () async {
                                                                                  FFAppState().teamId = getJsonField(
                                                                                    listTeamsItem,
                                                                                    r'''$.id''',
                                                                                  );
                                                                                  safeSetState(() {});
                                                                                  _model.nomeEquipe = getJsonField(
                                                                                    listTeamsItem,
                                                                                    r'''$.name''',
                                                                                  ).toString();
                                                                                  safeSetState(() {});
                                                                                  safeSetState(() {
                                                                                    _model.clearListaCache();
                                                                                    _model.apiRequestCompleted1 = false;
                                                                                  });
                                                                                  await _model.waitForApiRequestCompleted1();
                                                                                  safeSetState(() {
                                                                                    _model.clearListaLeadersCache();
                                                                                    _model.apiRequestCompleted2 = false;
                                                                                  });
                                                                                  await _model.waitForApiRequestCompleted2();
                                                                                },
                                                                                child: Container(
                                                                                  width: 180.0,
                                                                                  height: 36.0,
                                                                                  decoration: BoxDecoration(
                                                                                    color: FFAppState().teamId ==
                                                                                            getJsonField(
                                                                                              listTeamsItem,
                                                                                              r'''$.id''',
                                                                                            )
                                                                                        ? FlutterFlowTheme.of(context).primary
                                                                                        : FlutterFlowTheme.of(context).secondary,
                                                                                    borderRadius: BorderRadius.only(
                                                                                      bottomLeft: Radius.circular(0.0),
                                                                                      bottomRight: Radius.circular(0.0),
                                                                                      topLeft: Radius.circular(8.0),
                                                                                      topRight: Radius.circular(8.0),
                                                                                    ),
                                                                                    border: Border.all(
                                                                                      color: FlutterFlowTheme.of(context).alternate,
                                                                                      width: 0.5,
                                                                                    ),
                                                                                  ),
                                                                                  child: Padding(
                                                                                    padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                                                                                    child: Row(
                                                                                      mainAxisSize: MainAxisSize.max,
                                                                                      children: [
                                                                                        Expanded(
                                                                                          child: Text(
                                                                                            getJsonField(
                                                                                              listTeamsItem,
                                                                                              r'''$.name''',
                                                                                            ).toString().maybeHandleOverflow(
                                                                                                  maxChars: 15,
                                                                                                ),
                                                                                            style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                                  font: GoogleFonts.lexend(
                                                                                                    fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                    fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                  ),
                                                                                                  color: FFAppState().teamId ==
                                                                                                          getJsonField(
                                                                                                            listTeamsItem,
                                                                                                            r'''$.id''',
                                                                                                          )
                                                                                                      ? FlutterFlowTheme.of(context).info
                                                                                                      : FlutterFlowTheme.of(context).primaryText,
                                                                                                  letterSpacing: 0.0,
                                                                                                  fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                  fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                ),
                                                                                          ),
                                                                                        ),
                                                                                        Builder(
                                                                                          builder: (context) => InkWell(
                                                                                            splashColor: Colors.transparent,
                                                                                            focusColor: Colors.transparent,
                                                                                            hoverColor: Colors.transparent,
                                                                                            highlightColor: Colors.transparent,
                                                                                            onTap: () async {
                                                                                              FFAppState().setIds = [];
                                                                                              safeSetState(() {});
                                                                                              FFAppState().id = getJsonField(
                                                                                                listTeamsItem,
                                                                                                r'''$.id''',
                                                                                              );
                                                                                              FFAppState().setIds = (ProjectsGroup.queryAllTeamsLeadersRecordsCall
                                                                                                      .list(
                                                                                                        queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse.jsonBody,
                                                                                                      )!
                                                                                                      .where((e) =>
                                                                                                          getJsonField(
                                                                                                            e,
                                                                                                            r'''$.teams_id''',
                                                                                                          ) ==
                                                                                                          getJsonField(
                                                                                                            listTeamsItem,
                                                                                                            r'''$.id''',
                                                                                                          ))
                                                                                                      .toList()
                                                                                                      .map((e) => getJsonField(
                                                                                                            e,
                                                                                                            r'''$.user.id''',
                                                                                                          ))
                                                                                                      .toList() as List)
                                                                                                  .cast<int>()
                                                                                                  .toList()
                                                                                                  .cast<int>();
                                                                                              FFAppState().update(() {});
                                                                                              await showAlignedDialog(
                                                                                                barrierColor: Colors.transparent,
                                                                                                context: context,
                                                                                                isGlobal: false,
                                                                                                avoidOverflow: true,
                                                                                                targetAnchor: AlignmentDirectional(-1.0, 1.0).resolve(Directionality.of(context)),
                                                                                                followerAnchor: AlignmentDirectional(-1.0, -1.0).resolve(Directionality.of(context)),
                                                                                                builder: (dialogContext) {
                                                                                                  return Material(
                                                                                                    color: Colors.transparent,
                                                                                                    child: GestureDetector(
                                                                                                      onTap: () {
                                                                                                        FocusScope.of(dialogContext).unfocus();
                                                                                                        FocusManager.instance.primaryFocus?.unfocus();
                                                                                                      },
                                                                                                      child: OptionsEquipeWidget(
                                                                                                        teamsId: valueOrDefault<int>(
                                                                                                          getJsonField(
                                                                                                            listTeamsItem,
                                                                                                            r'''$.id''',
                                                                                                          ),
                                                                                                          0,
                                                                                                        ),
                                                                                                        pageTxt: 'equipes',
                                                                                                        typePage: 'edit',
                                                                                                        teamName: getJsonField(
                                                                                                          listTeamsItem,
                                                                                                          r'''$.name''',
                                                                                                        ).toString(),
                                                                                                      ),
                                                                                                    ),
                                                                                                  );
                                                                                                },
                                                                                              );
                                                                                            },
                                                                                            child: Icon(
                                                                                              Icons.keyboard_control,
                                                                                              color: FlutterFlowTheme.of(context).info,
                                                                                              size: 20.0,
                                                                                            ),
                                                                                          ),
                                                                                        ),
                                                                                      ].divide(SizedBox(width: 8.0)),
                                                                                    ),
                                                                                  ),
                                                                                ),
                                                                              );
                                                                            }),
                                                                          ),
                                                                        );
                                                                      },
                                                                    ),
                                                                  ],
                                                                ),
                                                              ),
                                                            ].divide(SizedBox(
                                                                width: 4.0)),
                                                          ),
                                                        ),
                                                      ),
                                                      if (ProjectsGroup
                                                                  .queryAllTeamsLeadersRecordsCall
                                                                  .list(
                                                                queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                    .jsonBody,
                                                              ) !=
                                                              null &&
                                                          (ProjectsGroup
                                                                  .queryAllTeamsLeadersRecordsCall
                                                                  .list(
                                                            queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                .jsonBody,
                                                          ))!
                                                              .isNotEmpty)
                                                        Row(
                                                          mainAxisSize:
                                                              MainAxisSize.max,
                                                          children: [
                                                            Expanded(
                                                              child: Container(
                                                                width: 220.0,
                                                                height: 36.0,
                                                                decoration:
                                                                    BoxDecoration(
                                                                  color: FlutterFlowTheme.of(
                                                                          context)
                                                                      .success,
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .only(
                                                                    bottomLeft:
                                                                        Radius.circular(
                                                                            0.0),
                                                                    bottomRight:
                                                                        Radius.circular(
                                                                            0.0),
                                                                    topLeft: Radius
                                                                        .circular(
                                                                            8.0),
                                                                    topRight: Radius
                                                                        .circular(
                                                                            8.0),
                                                                  ),
                                                                  border: Border
                                                                      .all(
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .success,
                                                                    width: 0.5,
                                                                  ),
                                                                ),
                                                                child: Padding(
                                                                  padding: EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          16.0,
                                                                          0.0,
                                                                          16.0,
                                                                          0.0),
                                                                  child: Row(
                                                                    mainAxisSize:
                                                                        MainAxisSize
                                                                            .max,
                                                                    children: [
                                                                      Expanded(
                                                                        child:
                                                                            Row(
                                                                          mainAxisSize:
                                                                              MainAxisSize.max,
                                                                          mainAxisAlignment:
                                                                              MainAxisAlignment.spaceBetween,
                                                                          children:
                                                                              [
                                                                            SelectionArea(
                                                                                child: Text(
                                                                              FFLocalizations.of(context).getText(
                                                                                '6dc3lb5y' /* Líderes de cada equipe */,
                                                                              ),
                                                                              style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                    font: GoogleFonts.lexend(
                                                                                      fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                      fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                    ),
                                                                                    color: FlutterFlowTheme.of(context).info,
                                                                                    letterSpacing: 0.0,
                                                                                    fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                    fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                  ),
                                                                            )),
                                                                          ].divide(SizedBox(width: 16.0)),
                                                                        ),
                                                                      ),
                                                                      Row(
                                                                        mainAxisSize:
                                                                            MainAxisSize.max,
                                                                        children: [
                                                                          if (!_model
                                                                              .seeLeaders)
                                                                            InkWell(
                                                                              splashColor: Colors.transparent,
                                                                              focusColor: Colors.transparent,
                                                                              hoverColor: Colors.transparent,
                                                                              highlightColor: Colors.transparent,
                                                                              onTap: () async {
                                                                                _model.seeLeaders = !_model.seeLeaders;
                                                                                safeSetState(() {});
                                                                              },
                                                                              child: Icon(
                                                                                Icons.keyboard_arrow_down_rounded,
                                                                                color: FlutterFlowTheme.of(context).info,
                                                                                size: 24.0,
                                                                              ),
                                                                            ),
                                                                          if (_model
                                                                              .seeLeaders)
                                                                            InkWell(
                                                                              splashColor: Colors.transparent,
                                                                              focusColor: Colors.transparent,
                                                                              hoverColor: Colors.transparent,
                                                                              highlightColor: Colors.transparent,
                                                                              onTap: () async {
                                                                                _model.seeLeaders = !_model.seeLeaders;
                                                                                safeSetState(() {});
                                                                              },
                                                                              child: Icon(
                                                                                Icons.keyboard_arrow_up_rounded,
                                                                                color: FlutterFlowTheme.of(context).info,
                                                                                size: 24.0,
                                                                              ),
                                                                            ),
                                                                        ],
                                                                      ),
                                                                    ].divide(SizedBox(
                                                                        width:
                                                                            8.0)),
                                                                  ),
                                                                ),
                                                              ),
                                                            ),
                                                          ].divide(SizedBox(
                                                              width: 4.0)),
                                                        ),
                                                    ],
                                                  ),
                                                  if (_model.seeLeaders)
                                                    Column(
                                                      mainAxisSize:
                                                          MainAxisSize.min,
                                                      children: [
                                                        Padding(
                                                          padding:
                                                              EdgeInsetsDirectional
                                                                  .fromSTEB(
                                                                      0.0,
                                                                      8.0,
                                                                      0.0,
                                                                      8.0),
                                                          child: Row(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .max,
                                                            children: [
                                                              SelectionArea(
                                                                  child: Text(
                                                                FFLocalizations.of(
                                                                        context)
                                                                    .getText(
                                                                  's4wp30fr' /* Total de lideres */,
                                                                ),
                                                                style: FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelMedium
                                                                    .override(
                                                                      font: GoogleFonts
                                                                          .lexend(
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .labelMedium
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .labelMedium
                                                                            .fontStyle,
                                                                      ),
                                                                      color: FlutterFlowTheme.of(
                                                                              context)
                                                                          .primaryText,
                                                                      letterSpacing:
                                                                          0.0,
                                                                      fontWeight: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelMedium
                                                                          .fontWeight,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelMedium
                                                                          .fontStyle,
                                                                    ),
                                                              )),
                                                              Container(
                                                                decoration:
                                                                    BoxDecoration(
                                                                  color: FlutterFlowTheme.of(
                                                                          context)
                                                                      .primary,
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .circular(
                                                                              100.0),
                                                                  shape: BoxShape
                                                                      .rectangle,
                                                                ),
                                                                child:
                                                                    Visibility(
                                                                  visible: ProjectsGroup
                                                                              .queryAllTeamsLeadersRecordsCall
                                                                              .list(
                                                                            queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse.jsonBody,
                                                                          ) !=
                                                                          null &&
                                                                      (ProjectsGroup
                                                                              .queryAllTeamsLeadersRecordsCall
                                                                              .list(
                                                                        queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                            .jsonBody,
                                                                      ))!
                                                                          .isNotEmpty,
                                                                  child:
                                                                      Padding(
                                                                    padding: EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            8.0,
                                                                            4.0,
                                                                            8.0,
                                                                            4.0),
                                                                    child: Text(
                                                                      valueOrDefault<
                                                                          String>(
                                                                        ProjectsGroup
                                                                            .queryAllTeamsLeadersRecordsCall
                                                                            .list(
                                                                              queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse.jsonBody,
                                                                            )
                                                                            ?.length
                                                                            ?.toString(),
                                                                        '0',
                                                                      ),
                                                                      style: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelMedium
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.lexend(
                                                                              fontWeight: FontWeight.w600,
                                                                              fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                            ),
                                                                            color:
                                                                                FlutterFlowTheme.of(context).info,
                                                                            fontSize:
                                                                                12.0,
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                FontWeight.w600,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                          ),
                                                                    ),
                                                                  ),
                                                                ),
                                                              ),
                                                            ].divide(SizedBox(
                                                                width: 8.0)),
                                                          ),
                                                        ),
                                                        if (ProjectsGroup
                                                                    .queryAllTeamsRecordsCall
                                                                    .list(
                                                                  queryallteamsQueryAllTeamsRecordsResponse
                                                                      .jsonBody,
                                                                ) !=
                                                                null &&
                                                            (ProjectsGroup
                                                                    .queryAllTeamsRecordsCall
                                                                    .list(
                                                              queryallteamsQueryAllTeamsRecordsResponse
                                                                  .jsonBody,
                                                            ))!
                                                                .isNotEmpty)
                                                          Container(
                                                            width: MediaQuery
                                                                        .sizeOf(
                                                                            context)
                                                                    .width *
                                                                1.0,
                                                            height: 40.0,
                                                            decoration:
                                                                BoxDecoration(
                                                              color: FlutterFlowTheme
                                                                      .of(context)
                                                                  .primaryBackground,
                                                              borderRadius:
                                                                  BorderRadius
                                                                      .only(
                                                                bottomLeft: Radius
                                                                    .circular(
                                                                        0.0),
                                                                bottomRight: Radius
                                                                    .circular(
                                                                        0.0),
                                                                topLeft: Radius
                                                                    .circular(
                                                                        8.0),
                                                                topRight: Radius
                                                                    .circular(
                                                                        8.0),
                                                              ),
                                                            ),
                                                            child: Padding(
                                                              padding:
                                                                  EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          16.0,
                                                                          0.0,
                                                                          16.0,
                                                                          0.0),
                                                              child: Row(
                                                                mainAxisSize:
                                                                    MainAxisSize
                                                                        .max,
                                                                children: [
                                                                  Expanded(
                                                                    flex: 3,
                                                                    child: SelectionArea(
                                                                        child: Text(
                                                                      FFLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        'pmskdzvh' /* Funcionario */,
                                                                      ),
                                                                      style: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.lexend(
                                                                              fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                              fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                            ),
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                    )),
                                                                  ),
                                                                  Expanded(
                                                                    flex: 2,
                                                                    child: SelectionArea(
                                                                        child: Text(
                                                                      FFLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        '5zv8vmi5' /* Equipe */,
                                                                      ),
                                                                      style: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.lexend(
                                                                              fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                              fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                            ),
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                    )),
                                                                  ),
                                                                  Expanded(
                                                                    flex: 2,
                                                                    child: SelectionArea(
                                                                        child: Text(
                                                                      FFLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        '28bzdf6v' /* Tipo/Nível de acesso */,
                                                                      ),
                                                                      style: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.lexend(
                                                                              fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                              fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                            ),
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                    )),
                                                                  ),
                                                                  Expanded(
                                                                    flex: 3,
                                                                    child: SelectionArea(
                                                                        child: Text(
                                                                      FFLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        'xqdjxy58' /* E-mail */,
                                                                      ),
                                                                      style: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.lexend(
                                                                              fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                              fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                            ),
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                    )),
                                                                  ),
                                                                  Expanded(
                                                                    flex: 2,
                                                                    child: SelectionArea(
                                                                        child: Text(
                                                                      FFLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        'stnd5t4y' /* Whatsapp */,
                                                                      ),
                                                                      style: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.lexend(
                                                                              fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                              fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                            ),
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                    )),
                                                                  ),
                                                                  Container(
                                                                    width: 44.0,
                                                                    decoration:
                                                                        BoxDecoration(),
                                                                    child: SelectionArea(
                                                                        child: Text(
                                                                      FFLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        'fj1n0hiy' /* Ações */,
                                                                      ),
                                                                      textAlign:
                                                                          TextAlign
                                                                              .center,
                                                                      style: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.lexend(
                                                                              fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                              fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                            ),
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                    )),
                                                                  ),
                                                                ],
                                                              ),
                                                            ),
                                                          ),
                                                        Container(
                                                          child: Builder(
                                                            builder: (context) {
                                                              final listTeamsLeaders =
                                                                  ProjectsGroup
                                                                          .queryAllTeamsLeadersRecordsCall
                                                                          .list(
                                                                            queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse.jsonBody,
                                                                          )
                                                                          ?.toList() ??
                                                                      [];
                                                              if (listTeamsLeaders
                                                                  .isEmpty) {
                                                                return ModalEmptyWidget();
                                                              }

                                                              return ListView
                                                                  .builder(
                                                                padding:
                                                                    EdgeInsets
                                                                        .zero,
                                                                primary: false,
                                                                shrinkWrap:
                                                                    true,
                                                                scrollDirection:
                                                                    Axis.vertical,
                                                                itemCount:
                                                                    listTeamsLeaders
                                                                        .length,
                                                                itemBuilder:
                                                                    (context,
                                                                        listTeamsLeadersIndex) {
                                                                  final listTeamsLeadersItem =
                                                                      listTeamsLeaders[
                                                                          listTeamsLeadersIndex];
                                                                  return Padding(
                                                                    padding: EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            0.0,
                                                                            0.0,
                                                                            0.0,
                                                                            1.0),
                                                                    child:
                                                                        Container(
                                                                      width: MediaQuery.sizeOf(context)
                                                                              .width *
                                                                          1.0,
                                                                      height:
                                                                          70.0,
                                                                      decoration:
                                                                          BoxDecoration(
                                                                        color: functions
                                                                            .funColorTable(listTeamsLeadersIndex),
                                                                      ),
                                                                      child:
                                                                          Padding(
                                                                        padding: EdgeInsetsDirectional.fromSTEB(
                                                                            16.0,
                                                                            8.0,
                                                                            16.0,
                                                                            8.0),
                                                                        child:
                                                                            Row(
                                                                          mainAxisSize:
                                                                              MainAxisSize.max,
                                                                          children: [
                                                                            Expanded(
                                                                              flex: 3,
                                                                              child: Padding(
                                                                                padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 12.0, 8.0),
                                                                                child: Row(
                                                                                  mainAxisSize: MainAxisSize.max,
                                                                                  children: [
                                                                                    Stack(
                                                                                      alignment: AlignmentDirectional(1.0, 1.0),
                                                                                      children: [
                                                                                        Align(
                                                                                          alignment: AlignmentDirectional(0.0, 0.0),
                                                                                          child: ClipRRect(
                                                                                            borderRadius: BorderRadius.circular(40.0),
                                                                                            child: Image.network(
                                                                                              valueOrDefault<String>(
                                                                                                getJsonField(
                                                                                                  listTeamsLeadersItem,
                                                                                                  r'''$.user.profile_picture.url''',
                                                                                                )?.toString(),
                                                                                                'https://x8ki-letl-twmt.n7.xano.io/vault/iaWPz-tD/8ler69Ci8dU8B1ExemIRgXluexs/JGrgRQ../no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg ',
                                                                                              ),
                                                                                              width: 40.0,
                                                                                              height: 40.0,
                                                                                              fit: BoxFit.cover,
                                                                                            ),
                                                                                          ),
                                                                                        ),
                                                                                      ],
                                                                                    ),
                                                                                    Expanded(
                                                                                      child: Column(
                                                                                        mainAxisSize: MainAxisSize.max,
                                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                                        children: [
                                                                                          SelectionArea(
                                                                                              child: Text(
                                                                                            valueOrDefault<String>(
                                                                                              getJsonField(
                                                                                                listTeamsLeadersItem,
                                                                                                r'''$.user.name''',
                                                                                              )?.toString(),
                                                                                              'N/A',
                                                                                            ),
                                                                                            style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                                                                  font: GoogleFonts.lexend(
                                                                                                    fontWeight: FontWeight.w500,
                                                                                                    fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                                  ),
                                                                                                  letterSpacing: 0.0,
                                                                                                  fontWeight: FontWeight.w500,
                                                                                                  fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                                ),
                                                                                          )),
                                                                                          SelectionArea(
                                                                                              child: Text(
                                                                                            valueOrDefault<String>(
                                                                                              getJsonField(
                                                                                                listTeamsLeadersItem,
                                                                                                r'''$.user.users_permissions.users_roles.role''',
                                                                                              )?.toString(),
                                                                                              'N/A',
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
                                                                                          )),
                                                                                        ],
                                                                                      ),
                                                                                    ),
                                                                                  ].divide(SizedBox(width: 8.0)),
                                                                                ),
                                                                              ),
                                                                            ),
                                                                            Expanded(
                                                                              flex: 2,
                                                                              child: Padding(
                                                                                padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 12.0, 8.0),
                                                                                child: Row(
                                                                                  mainAxisSize: MainAxisSize.max,
                                                                                  children: [
                                                                                    Container(
                                                                                      width: 120.0,
                                                                                      height: 36.0,
                                                                                      decoration: BoxDecoration(
                                                                                        color: FlutterFlowTheme.of(context).primaryBackground,
                                                                                        borderRadius: BorderRadius.circular(100.0),
                                                                                        border: Border.all(
                                                                                          color: FlutterFlowTheme.of(context).alternate,
                                                                                          width: 1.0,
                                                                                        ),
                                                                                      ),
                                                                                      child: Column(
                                                                                        mainAxisSize: MainAxisSize.min,
                                                                                        mainAxisAlignment: MainAxisAlignment.center,
                                                                                        children: [
                                                                                          Expanded(
                                                                                            child: Align(
                                                                                              alignment: AlignmentDirectional(0.0, 0.0),
                                                                                              child: Padding(
                                                                                                padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
                                                                                                child: SelectionArea(
                                                                                                    child: Text(
                                                                                                  valueOrDefault<String>(
                                                                                                    getJsonField(
                                                                                                      listTeamsLeadersItem,
                                                                                                      r'''$.teams.name''',
                                                                                                    )?.toString(),
                                                                                                    'N/A',
                                                                                                  ),
                                                                                                  textAlign: TextAlign.center,
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
                                                                                                )),
                                                                                              ),
                                                                                            ),
                                                                                          ),
                                                                                        ],
                                                                                      ),
                                                                                    ),
                                                                                  ],
                                                                                ),
                                                                              ),
                                                                            ),
                                                                            Expanded(
                                                                              flex: 2,
                                                                              child: Padding(
                                                                                padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 12.0, 8.0),
                                                                                child: Column(
                                                                                  mainAxisSize: MainAxisSize.min,
                                                                                  mainAxisAlignment: MainAxisAlignment.center,
                                                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                                                  children: [
                                                                                    SelectionArea(
                                                                                        child: Text(
                                                                                      valueOrDefault<String>(
                                                                                        getJsonField(
                                                                                          listTeamsLeadersItem,
                                                                                          r'''$.user.users_permissions.users_system_access.env''',
                                                                                        )?.toString(),
                                                                                        'N/A',
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
                                                                                    )),
                                                                                    SelectionArea(
                                                                                        child: Text(
                                                                                      valueOrDefault<String>(
                                                                                        getJsonField(
                                                                                          listTeamsLeadersItem,
                                                                                          r'''$.user.users_permissions.users_control_system.access_level''',
                                                                                        )?.toString(),
                                                                                        'N/A',
                                                                                      ),
                                                                                      style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                            font: GoogleFonts.lexend(
                                                                                              fontWeight: FontWeight.w500,
                                                                                              fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                            ),
                                                                                            color: FlutterFlowTheme.of(context).primaryText,
                                                                                            letterSpacing: 0.0,
                                                                                            fontWeight: FontWeight.w500,
                                                                                            fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                          ),
                                                                                    )),
                                                                                  ],
                                                                                ),
                                                                              ),
                                                                            ),
                                                                            Expanded(
                                                                              flex: 3,
                                                                              child: Row(
                                                                                mainAxisSize: MainAxisSize.max,
                                                                                children: [
                                                                                  SelectionArea(
                                                                                      child: Text(
                                                                                    getJsonField(
                                                                                      listTeamsLeadersItem,
                                                                                      r'''$.user.email''',
                                                                                    ).toString(),
                                                                                    style: FlutterFlowTheme.of(context).bodySmall.override(
                                                                                          font: GoogleFonts.lexend(
                                                                                            fontWeight: FontWeight.w500,
                                                                                            fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                          ),
                                                                                          letterSpacing: 0.0,
                                                                                          fontWeight: FontWeight.w500,
                                                                                          fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                        ),
                                                                                  )),
                                                                                ],
                                                                              ),
                                                                            ),
                                                                            Expanded(
                                                                              flex: 2,
                                                                              child: Row(
                                                                                mainAxisSize: MainAxisSize.max,
                                                                                children: [
                                                                                  Row(
                                                                                    mainAxisSize: MainAxisSize.max,
                                                                                    crossAxisAlignment: CrossAxisAlignment.end,
                                                                                    children: [
                                                                                      Row(
                                                                                        mainAxisSize: MainAxisSize.max,
                                                                                        children: [
                                                                                          FaIcon(
                                                                                            FontAwesomeIcons.whatsapp,
                                                                                            color: FlutterFlowTheme.of(context).success,
                                                                                            size: 16.0,
                                                                                          ),
                                                                                        ],
                                                                                      ),
                                                                                    ].divide(SizedBox(width: 8.0)),
                                                                                  ),
                                                                                  SelectionArea(
                                                                                      child: Text(
                                                                                    valueOrDefault<String>(
                                                                                      getJsonField(
                                                                                        listTeamsLeadersItem,
                                                                                        r'''$.user.phone''',
                                                                                      )?.toString(),
                                                                                      'N/A',
                                                                                    ),
                                                                                    style: FlutterFlowTheme.of(context).bodySmall.override(
                                                                                          font: GoogleFonts.lexend(
                                                                                            fontWeight: FontWeight.w500,
                                                                                            fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                          ),
                                                                                          letterSpacing: 0.0,
                                                                                          fontWeight: FontWeight.w500,
                                                                                          fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                        ),
                                                                                  )),
                                                                                ].divide(SizedBox(width: 4.0)),
                                                                              ),
                                                                            ),
                                                                            Builder(
                                                                              builder: (context) => FlutterFlowIconButton(
                                                                                borderColor: Colors.transparent,
                                                                                borderRadius: 30.0,
                                                                                borderWidth: 1.0,
                                                                                buttonSize: 44.0,
                                                                                icon: Icon(
                                                                                  Icons.more_vert,
                                                                                  color: FlutterFlowTheme.of(context).secondaryText,
                                                                                  size: 20.0,
                                                                                ),
                                                                                onPressed: () async {
                                                                                  await showAlignedDialog(
                                                                                    barrierColor: Colors.transparent,
                                                                                    context: context,
                                                                                    isGlobal: false,
                                                                                    avoidOverflow: true,
                                                                                    targetAnchor: AlignmentDirectional(1.0, 1.0).resolve(Directionality.of(context)),
                                                                                    followerAnchor: AlignmentDirectional(1.0, -1.0).resolve(Directionality.of(context)),
                                                                                    builder: (dialogContext) {
                                                                                      return Material(
                                                                                        color: Colors.transparent,
                                                                                        child: GestureDetector(
                                                                                          onTap: () {
                                                                                            FocusScope.of(dialogContext).unfocus();
                                                                                            FocusManager.instance.primaryFocus?.unfocus();
                                                                                          },
                                                                                          child: OptionsColaboradorWidget(
                                                                                            typePage: 'edit',
                                                                                            name: valueOrDefault<String>(
                                                                                              getJsonField(
                                                                                                listTeamsLeadersItem,
                                                                                                r'''$.user.name''',
                                                                                              )?.toString(),
                                                                                              'N/A',
                                                                                            ),
                                                                                            phone: valueOrDefault<String>(
                                                                                              getJsonField(
                                                                                                listTeamsLeadersItem,
                                                                                                r'''$.user.phone''',
                                                                                              )?.toString(),
                                                                                              'N/A',
                                                                                            ),
                                                                                            idUser: valueOrDefault<int>(
                                                                                              getJsonField(
                                                                                                listTeamsLeadersItem,
                                                                                                r'''$.user.id''',
                                                                                              ),
                                                                                              0,
                                                                                            ),
                                                                                            email: valueOrDefault<String>(
                                                                                              getJsonField(
                                                                                                listTeamsLeadersItem,
                                                                                                r'''$.user.email''',
                                                                                              )?.toString(),
                                                                                              'N/A',
                                                                                            ),
                                                                                            rolesId: valueOrDefault<int>(
                                                                                              getJsonField(
                                                                                                listTeamsLeadersItem,
                                                                                                r'''$.user.users_permissions.users_roles.id''',
                                                                                              ),
                                                                                              0,
                                                                                            ),
                                                                                            typeAcessId: valueOrDefault<int>(
                                                                                              getJsonField(
                                                                                                listTeamsLeadersItem,
                                                                                                r'''$.user.users_permissions.users_system_access.id''',
                                                                                              ),
                                                                                              0,
                                                                                            ),
                                                                                            controlAcessId: valueOrDefault<int>(
                                                                                              getJsonField(
                                                                                                listTeamsLeadersItem,
                                                                                                r'''$.user.users_permissions.users_control_system.id''',
                                                                                              ),
                                                                                              0,
                                                                                            ),
                                                                                            typeAcessTxt: valueOrDefault<String>(
                                                                                              getJsonField(
                                                                                                listTeamsLeadersItem,
                                                                                                r'''$.user.users_permissions.users_system_access.env''',
                                                                                              )?.toString(),
                                                                                              'N/A',
                                                                                            ),
                                                                                            rolesTxt: valueOrDefault<String>(
                                                                                              getJsonField(
                                                                                                listTeamsLeadersItem,
                                                                                                r'''$.user.users_permissions.users_roles.role''',
                                                                                              )?.toString(),
                                                                                              '0',
                                                                                            ),
                                                                                            controlAcessTxt: valueOrDefault<String>(
                                                                                              getJsonField(
                                                                                                listTeamsLeadersItem,
                                                                                                r'''$.user.users_permissions.users_control_system.access_level''',
                                                                                              )?.toString(),
                                                                                              '0',
                                                                                            ),
                                                                                            url: valueOrDefault<String>(
                                                                                              getJsonField(
                                                                                                listTeamsLeadersItem,
                                                                                                r'''$.user.profile_picture.url''',
                                                                                              )?.toString(),
                                                                                              'https://x8ki-letl-twmt.n7.xano.io/vault/iaWPz-tD/8ler69Ci8dU8B1ExemIRgXluexs/JGrgRQ../no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg ',
                                                                                            ),
                                                                                            pageTxt: 'líderes',
                                                                                            typePage2: '2',
                                                                                            qrcode: getJsonField(
                                                                                              listTeamsLeadersItem,
                                                                                              r'''$.user.qrcode''',
                                                                                            ).toString(),
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
                                                                    ),
                                                                  );
                                                                },
                                                              );
                                                            },
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  Align(
                                                    alignment:
                                                        AlignmentDirectional(
                                                            -1.0, 0.0),
                                                    child: MouseRegion(
                                                      opaque: false,
                                                      cursor:
                                                          MouseCursor.defer ??
                                                              MouseCursor.defer,
                                                      child: Visibility(
                                                        visible: ProjectsGroup
                                                                    .queryAllTeamsLeadersRecordsCall
                                                                    .list(
                                                                  queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                      .jsonBody,
                                                                ) !=
                                                                null &&
                                                            (ProjectsGroup
                                                                    .queryAllTeamsLeadersRecordsCall
                                                                    .list(
                                                              queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                  .jsonBody,
                                                            ))!
                                                                .isNotEmpty,
                                                        child: Builder(
                                                          builder: (context) =>
                                                              FFButtonWidget(
                                                            onPressed:
                                                                () async {
                                                              FFAppState().id =
                                                                  FFAppState()
                                                                      .teamId;
                                                              FFAppState()
                                                                  .setIds = (ProjectsGroup
                                                                      .queryAllTeamsLeadersRecordsCall
                                                                      .list(
                                                                        queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                            .jsonBody,
                                                                      )!
                                                                      .where((e) =>
                                                                          FFAppState().teamId ==
                                                                          getJsonField(
                                                                            e,
                                                                            r'''$.teams_id''',
                                                                          ))
                                                                      .toList()
                                                                      .map((e) => getJsonField(
                                                                            e,
                                                                            r'''$.user.id''',
                                                                          ))
                                                                      .toList() as List)
                                                                  .cast<int>()
                                                                  .toList()
                                                                  .cast<int>();
                                                              FFAppState()
                                                                  .update(
                                                                      () {});
                                                              await showDialog(
                                                                context:
                                                                    context,
                                                                builder:
                                                                    (dialogContext) {
                                                                  return Dialog(
                                                                    elevation:
                                                                        0,
                                                                    insetPadding:
                                                                        EdgeInsets
                                                                            .zero,
                                                                    backgroundColor:
                                                                        Colors
                                                                            .transparent,
                                                                    alignment: AlignmentDirectional(
                                                                            0.0,
                                                                            0.0)
                                                                        .resolve(
                                                                            Directionality.of(context)),
                                                                    child:
                                                                        GestureDetector(
                                                                      onTap:
                                                                          () {
                                                                        FocusScope.of(dialogContext)
                                                                            .unfocus();
                                                                        FocusManager
                                                                            .instance
                                                                            .primaryFocus
                                                                            ?.unfocus();
                                                                      },
                                                                      child:
                                                                          Container(
                                                                        height:
                                                                            200.0,
                                                                        width:
                                                                            420.0,
                                                                        child:
                                                                            ModalAddLiderWidget(
                                                                          teamsID:
                                                                              valueOrDefault<int>(
                                                                            FFAppState().teamId,
                                                                            0,
                                                                          ),
                                                                          teamsName:
                                                                              valueOrDefault<String>(
                                                                            _model.nomeEquipe,
                                                                            '-',
                                                                          ),
                                                                          typePage:
                                                                              '2',
                                                                        ),
                                                                      ),
                                                                    ),
                                                                  );
                                                                },
                                                              );
                                                            },
                                                            text: FFLocalizations
                                                                    .of(context)
                                                                .getText(
                                                              '1j9i24yu' /* Cadastrar novo lider */,
                                                            ),
                                                            icon: Icon(
                                                              Icons.add_circle,
                                                              size: _model
                                                                      .mouseRegionHovered2!
                                                                  ? 18.5
                                                                  : 18.0,
                                                            ),
                                                            options:
                                                                FFButtonOptions(
                                                              height: 40.0,
                                                              padding:
                                                                  EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          16.0,
                                                                          0.0,
                                                                          16.0,
                                                                          0.0),
                                                              iconPadding:
                                                                  EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          0.0,
                                                                          0.0,
                                                                          0.0,
                                                                          0.0),
                                                              color: FlutterFlowTheme
                                                                      .of(context)
                                                                  .secondaryBackground,
                                                              textStyle:
                                                                  FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelMedium
                                                                      .override(
                                                                        font: GoogleFonts
                                                                            .lexend(
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .labelMedium
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .labelMedium
                                                                              .fontStyle,
                                                                        ),
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .primary,
                                                                        fontSize: _model.mouseRegionHovered2!
                                                                            ? 12.5
                                                                            : 12.0,
                                                                        letterSpacing:
                                                                            0.0,
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .labelMedium
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .labelMedium
                                                                            .fontStyle,
                                                                      ),
                                                              elevation: 0.0,
                                                              borderRadius:
                                                                  BorderRadius
                                                                      .circular(
                                                                          8.0),
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                                      onEnter: ((event) async {
                                                        safeSetState(() => _model
                                                                .mouseRegionHovered2 =
                                                            true);
                                                      }),
                                                      onExit: ((event) async {
                                                        safeSetState(() => _model
                                                                .mouseRegionHovered2 =
                                                            false);
                                                      }),
                                                    ),
                                                  ),
                                                  if (_model.seeLeaders &&
                                                      (ProjectsGroup
                                                                  .queryAllTeamsLeadersRecordsCall
                                                                  .list(
                                                                queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                    .jsonBody,
                                                              ) !=
                                                              null &&
                                                          (ProjectsGroup
                                                                  .queryAllTeamsLeadersRecordsCall
                                                                  .list(
                                                            queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                .jsonBody,
                                                          ))!
                                                              .isNotEmpty))
                                                    Align(
                                                      alignment:
                                                          AlignmentDirectional(
                                                              0.0, 1.0),
                                                      child: Padding(
                                                        padding:
                                                            EdgeInsetsDirectional
                                                                .fromSTEB(
                                                                    0.0,
                                                                    16.0,
                                                                    0.0,
                                                                    0.0),
                                                        child: Row(
                                                          mainAxisSize:
                                                              MainAxisSize.max,
                                                          mainAxisAlignment:
                                                              MainAxisAlignment
                                                                  .end,
                                                          children: [
                                                            Row(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .max,
                                                              children: [
                                                                Text(
                                                                  FFLocalizations.of(
                                                                          context)
                                                                      .getText(
                                                                    'aosrzs21' /* linhas por página: */,
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
                                                                        color: Color(
                                                                            0xB32D323F),
                                                                        letterSpacing:
                                                                            0.0,
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontStyle,
                                                                      ),
                                                                ),
                                                                FlutterFlowDropDown<
                                                                    int>(
                                                                  controller: _model
                                                                          .dropDownLeadersValueController ??=
                                                                      FormFieldController<
                                                                          int>(
                                                                    _model.dropDownLeadersValue ??=
                                                                        _model
                                                                            .perPageLeaders,
                                                                  ),
                                                                  options: List<
                                                                      int>.from([
                                                                    5,
                                                                    10,
                                                                    15,
                                                                    20,
                                                                    100
                                                                  ]),
                                                                  optionLabels: [
                                                                    FFLocalizations.of(
                                                                            context)
                                                                        .getText(
                                                                      'pxylr4cw' /* 5 */,
                                                                    ),
                                                                    FFLocalizations.of(
                                                                            context)
                                                                        .getText(
                                                                      '9as4ygam' /* 10 */,
                                                                    ),
                                                                    FFLocalizations.of(
                                                                            context)
                                                                        .getText(
                                                                      'kfue6peo' /* 15 */,
                                                                    ),
                                                                    FFLocalizations.of(
                                                                            context)
                                                                        .getText(
                                                                      'ithjvq0c' /* 20 */,
                                                                    ),
                                                                    FFLocalizations.of(
                                                                            context)
                                                                        .getText(
                                                                      'n5ut7zl3' /* 100 */,
                                                                    ),
                                                                    ''
                                                                  ],
                                                                  onChanged:
                                                                      (val) async {
                                                                    safeSetState(() =>
                                                                        _model.dropDownLeadersValue =
                                                                            val);
                                                                    _model.perPageLeaders =
                                                                        _model
                                                                            .dropDownLeadersValue!;
                                                                    _model.pageLeaders =
                                                                        1;
                                                                    safeSetState(
                                                                        () {});
                                                                    safeSetState(
                                                                        () {
                                                                      _model
                                                                          .clearListaLeadersCache();
                                                                      _model.apiRequestCompleted2 =
                                                                          false;
                                                                    });
                                                                    await _model
                                                                        .waitForApiRequestCompleted2();
                                                                  },
                                                                  width: 62.0,
                                                                  height: 35.0,
                                                                  maxHeight:
                                                                      250.0,
                                                                  textStyle: FlutterFlowTheme.of(
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
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .secondaryText,
                                                                        letterSpacing:
                                                                            0.0,
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontStyle,
                                                                      ),
                                                                  hintText: FFLocalizations.of(
                                                                          context)
                                                                      .getText(
                                                                    'ir66yard' /* 10 */,
                                                                  ),
                                                                  icon: Icon(
                                                                    Icons
                                                                        .keyboard_arrow_down_rounded,
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .secondaryText,
                                                                    size: 18.0,
                                                                  ),
                                                                  fillColor: FlutterFlowTheme.of(
                                                                          context)
                                                                      .primaryBackground,
                                                                  elevation:
                                                                      2.0,
                                                                  borderColor:
                                                                      FlutterFlowTheme.of(
                                                                              context)
                                                                          .alternate,
                                                                  borderWidth:
                                                                      0.5,
                                                                  borderRadius:
                                                                      8.0,
                                                                  margin: EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          12.0,
                                                                          0.0,
                                                                          12.0,
                                                                          0.0),
                                                                  hidesUnderline:
                                                                      true,
                                                                  isOverButton:
                                                                      false,
                                                                  isSearchable:
                                                                      false,
                                                                  isMultiSelect:
                                                                      false,
                                                                ),
                                                              ].divide(SizedBox(
                                                                  width: 16.0)),
                                                            ),
                                                            Text(
                                                              '${_model.pageLeaders.toString()} de ${ProjectsGroup.queryAllTeamsLeadersRecordsCall.pageTotal(
                                                                    queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                        .jsonBody,
                                                                  )?.toString()}',
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
                                                                    color: Color(
                                                                        0xB22D323F),
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
                                                            Row(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .max,
                                                              children: [
                                                                FlutterFlowIconButton(
                                                                  borderRadius:
                                                                      8.0,
                                                                  buttonSize:
                                                                      40.0,
                                                                  hoverColor: FlutterFlowTheme.of(
                                                                          context)
                                                                      .hoverNavBar,
                                                                  hoverIconColor:
                                                                      FlutterFlowTheme.of(
                                                                              context)
                                                                          .secondaryBackground,
                                                                  hoverBorderColor:
                                                                      FlutterFlowTheme.of(
                                                                              context)
                                                                          .hoverNavBar,
                                                                  icon: Icon(
                                                                    Icons
                                                                        .arrow_back_ios_rounded,
                                                                    color: Color(
                                                                        0x662D323F),
                                                                    size: 18.0,
                                                                  ),
                                                                  onPressed:
                                                                      () async {
                                                                    if (_model
                                                                            .pageLeaders !=
                                                                        1) {
                                                                      _model.perPageLeaders =
                                                                          _model.perPageLeaders +
                                                                              -1;
                                                                      safeSetState(
                                                                          () {});
                                                                      safeSetState(
                                                                          () {
                                                                        _model
                                                                            .clearListaLeadersCache();
                                                                        _model.apiRequestCompleted2 =
                                                                            false;
                                                                      });
                                                                      await _model
                                                                          .waitForApiRequestCompleted2();
                                                                    }
                                                                  },
                                                                ),
                                                                FlutterFlowIconButton(
                                                                  borderRadius:
                                                                      8.0,
                                                                  buttonSize:
                                                                      40.0,
                                                                  hoverColor: FlutterFlowTheme.of(
                                                                          context)
                                                                      .hoverNavBar,
                                                                  hoverIconColor:
                                                                      FlutterFlowTheme.of(
                                                                              context)
                                                                          .secondaryBackground,
                                                                  hoverBorderColor:
                                                                      FlutterFlowTheme.of(
                                                                              context)
                                                                          .hoverNavBar,
                                                                  icon: Icon(
                                                                    Icons
                                                                        .arrow_forward_ios_rounded,
                                                                    color: Color(
                                                                        0x662D323F),
                                                                    size: 18.0,
                                                                  ),
                                                                  onPressed:
                                                                      () async {
                                                                    if (_model
                                                                            .pageLeaders !=
                                                                        ProjectsGroup
                                                                            .queryAllTeamsLeadersRecordsCall
                                                                            .pageTotal(
                                                                          queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                              .jsonBody,
                                                                        )) {
                                                                      _model.pageLeaders =
                                                                          _model.pageLeaders +
                                                                              1;
                                                                      safeSetState(
                                                                          () {});
                                                                      safeSetState(
                                                                          () {
                                                                        _model
                                                                            .clearListaLeadersCache();
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
                                                          ].divide(SizedBox(
                                                              width: 24.0)),
                                                        ),
                                                      ),
                                                    ),
                                                  Container(
                                                    decoration: BoxDecoration(),
                                                    child: Column(
                                                      mainAxisSize:
                                                          MainAxisSize.max,
                                                      children: [
                                                        if (ProjectsGroup
                                                                    .queryAllTeamsRecordsCall
                                                                    .list(
                                                                  queryallteamsQueryAllTeamsRecordsResponse
                                                                      .jsonBody,
                                                                ) !=
                                                                null &&
                                                            (ProjectsGroup
                                                                    .queryAllTeamsRecordsCall
                                                                    .list(
                                                              queryallteamsQueryAllTeamsRecordsResponse
                                                                  .jsonBody,
                                                            ))!
                                                                .isNotEmpty)
                                                          Padding(
                                                            padding:
                                                                EdgeInsetsDirectional
                                                                    .fromSTEB(
                                                                        0.0,
                                                                        8.0,
                                                                        0.0,
                                                                        0.0),
                                                            child: Row(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .max,
                                                              children: [
                                                                Text(
                                                                  FFLocalizations.of(
                                                                          context)
                                                                      .getText(
                                                                    'aubtukyq' /* Total de funcionários */,
                                                                  ),
                                                                  style: FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelMedium
                                                                      .override(
                                                                        font: GoogleFonts
                                                                            .lexend(
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .labelMedium
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .labelMedium
                                                                              .fontStyle,
                                                                        ),
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .primaryText,
                                                                        letterSpacing:
                                                                            0.0,
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .labelMedium
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .labelMedium
                                                                            .fontStyle,
                                                                      ),
                                                                ),
                                                                Container(
                                                                  decoration:
                                                                      BoxDecoration(
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .primary,
                                                                    borderRadius:
                                                                        BorderRadius.circular(
                                                                            100.0),
                                                                    shape: BoxShape
                                                                        .rectangle,
                                                                  ),
                                                                  child:
                                                                      Padding(
                                                                    padding: EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            8.0,
                                                                            4.0,
                                                                            8.0,
                                                                            4.0),
                                                                    child: Text(
                                                                      valueOrDefault<
                                                                          String>(
                                                                        ProjectsGroup
                                                                            .queryAllTeamsRecordsCall
                                                                            .list(
                                                                              queryallteamsQueryAllTeamsRecordsResponse.jsonBody,
                                                                            )
                                                                            ?.length
                                                                            ?.toString(),
                                                                        '0',
                                                                      ),
                                                                      style: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelMedium
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.lexend(
                                                                              fontWeight: FontWeight.w600,
                                                                              fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                            ),
                                                                            color:
                                                                                FlutterFlowTheme.of(context).info,
                                                                            fontSize:
                                                                                12.0,
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                FontWeight.w600,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                          ),
                                                                    ),
                                                                  ),
                                                                ),
                                                              ].divide(SizedBox(
                                                                  width: 8.0)),
                                                            ),
                                                          ),
                                                        if (ProjectsGroup
                                                                    .queryAllTeamsLeadersRecordsCall
                                                                    .list(
                                                                  queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                      .jsonBody,
                                                                ) !=
                                                                null &&
                                                            (ProjectsGroup
                                                                    .queryAllTeamsLeadersRecordsCall
                                                                    .list(
                                                              queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                  .jsonBody,
                                                            ))!
                                                                .isNotEmpty)
                                                          Padding(
                                                            padding:
                                                                EdgeInsetsDirectional
                                                                    .fromSTEB(
                                                                        0.0,
                                                                        8.0,
                                                                        0.0,
                                                                        8.0),
                                                            child: Row(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .max,
                                                              children: [
                                                                MouseRegion(
                                                                  opaque: false,
                                                                  cursor: MouseCursor
                                                                          .defer ??
                                                                      MouseCursor
                                                                          .defer,
                                                                  child:
                                                                      Builder(
                                                                    builder:
                                                                        (context) =>
                                                                            FFButtonWidget(
                                                                      onPressed:
                                                                          () async {
                                                                        FFAppState().setIds =
                                                                            [];
                                                                        FFAppState().userLideres =
                                                                            [];
                                                                        safeSetState(
                                                                            () {});
                                                                        FFAppState()
                                                                            .setIds = (ProjectsGroup.queryAllTeamsRecordsCall
                                                                                .list(
                                                                                  queryallteamsQueryAllTeamsRecordsResponse.jsonBody,
                                                                                )!
                                                                                .map((e) => getJsonField(
                                                                                      e,
                                                                                      r'''$.user.id''',
                                                                                    ))
                                                                                .toList() as List)
                                                                            .cast<int>()
                                                                            .toList()
                                                                            .cast<int>();
                                                                        safeSetState(
                                                                            () {});
                                                                        await showDialog(
                                                                          barrierColor:
                                                                              Color(0x81000000),
                                                                          context:
                                                                              context,
                                                                          builder:
                                                                              (dialogContext) {
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
                                                                                child: ModalAddColaboradorWidget(
                                                                                  teamsId: FFAppState().teamId != 0
                                                                                      ? FFAppState().teamId
                                                                                      : getJsonField(
                                                                                          ProjectsGroup.queryAllTeamsLeadersRecordsCall
                                                                                              .list(
                                                                                                queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse.jsonBody,
                                                                                              )
                                                                                              ?.firstOrNull,
                                                                                          r'''$.teams_id''',
                                                                                        ),
                                                                                  typePage: 'creat',
                                                                                ),
                                                                              ),
                                                                            );
                                                                          },
                                                                        );
                                                                      },
                                                                      text: FFLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        '37e5cusa' /* Add funcionário à equipe */,
                                                                      ),
                                                                      icon:
                                                                          Icon(
                                                                        Icons
                                                                            .add_circle,
                                                                        size: _model.mouseRegionHovered3!
                                                                            ? 18.5
                                                                            : 18.0,
                                                                      ),
                                                                      options:
                                                                          FFButtonOptions(
                                                                        height:
                                                                            40.0,
                                                                        padding: EdgeInsetsDirectional.fromSTEB(
                                                                            16.0,
                                                                            0.0,
                                                                            16.0,
                                                                            0.0),
                                                                        iconPadding: EdgeInsetsDirectional.fromSTEB(
                                                                            0.0,
                                                                            0.0,
                                                                            0.0,
                                                                            0.0),
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .secondaryBackground,
                                                                        textStyle: FlutterFlowTheme.of(context)
                                                                            .labelMedium
                                                                            .override(
                                                                              font: GoogleFonts.lexend(
                                                                                fontWeight: FlutterFlowTheme.of(context).labelMedium.fontWeight,
                                                                                fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                              ),
                                                                              color: FlutterFlowTheme.of(context).primary,
                                                                              fontSize: _model.mouseRegionHovered3! ? 12.5 : 12.0,
                                                                              letterSpacing: 0.0,
                                                                              fontWeight: FlutterFlowTheme.of(context).labelMedium.fontWeight,
                                                                              fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                            ),
                                                                        elevation:
                                                                            0.0,
                                                                        borderRadius:
                                                                            BorderRadius.circular(8.0),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                  onEnter:
                                                                      ((event) async {
                                                                    safeSetState(() =>
                                                                        _model.mouseRegionHovered3 =
                                                                            true);
                                                                  }),
                                                                  onExit:
                                                                      ((event) async {
                                                                    safeSetState(() =>
                                                                        _model.mouseRegionHovered3 =
                                                                            false);
                                                                  }),
                                                                ),
                                                                Expanded(
                                                                  child: Row(
                                                                    mainAxisSize:
                                                                        MainAxisSize
                                                                            .max,
                                                                    children: [
                                                                      Row(
                                                                        mainAxisSize:
                                                                            MainAxisSize.max,
                                                                        children:
                                                                            [
                                                                          Icon(
                                                                            Icons.filter_list,
                                                                            color:
                                                                                FlutterFlowTheme.of(context).secondaryText,
                                                                            size:
                                                                                24.0,
                                                                          ),
                                                                          Text(
                                                                            FFLocalizations.of(context).getText(
                                                                              '7mkfoajl' /* Filtros */,
                                                                            ),
                                                                            style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                                                  font: GoogleFonts.lexend(
                                                                                    fontWeight: FontWeight.w500,
                                                                                    fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                  ),
                                                                                  color: FlutterFlowTheme.of(context).secondaryText,
                                                                                  letterSpacing: 0.0,
                                                                                  fontWeight: FontWeight.w500,
                                                                                  fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                ),
                                                                          ),
                                                                        ].divide(SizedBox(width: 4.0)),
                                                                      ),
                                                                      Expanded(
                                                                        child:
                                                                            Padding(
                                                                          padding: EdgeInsetsDirectional.fromSTEB(
                                                                              0.0,
                                                                              0.0,
                                                                              8.0,
                                                                              0.0),
                                                                          child:
                                                                              Row(
                                                                            mainAxisSize:
                                                                                MainAxisSize.max,
                                                                            children:
                                                                                [
                                                                              SizedBox(
                                                                                height: 24.0,
                                                                                child: VerticalDivider(
                                                                                  thickness: 2.0,
                                                                                  color: FlutterFlowTheme.of(context).alternate,
                                                                                ),
                                                                              ),
                                                                              Expanded(
                                                                                child: Container(
                                                                                  width: 100.0,
                                                                                  decoration: BoxDecoration(),
                                                                                  child: Visibility(
                                                                                    visible: responsiveVisibility(
                                                                                      context: context,
                                                                                      phone: false,
                                                                                    ),
                                                                                    child: Container(
                                                                                      width: double.infinity,
                                                                                      child: TextFormField(
                                                                                        controller: _model.textController,
                                                                                        focusNode: _model.textFieldFocusNode,
                                                                                        onChanged: (_) => EasyDebounce.debounce(
                                                                                          '_model.textController',
                                                                                          Duration(milliseconds: 500),
                                                                                          () async {
                                                                                            safeSetState(() {
                                                                                              _model.clearListaCache();
                                                                                              _model.apiRequestCompleted1 = false;
                                                                                            });
                                                                                            await _model.waitForApiRequestCompleted1();
                                                                                          },
                                                                                        ),
                                                                                        onFieldSubmitted: (_) async {
                                                                                          safeSetState(() {
                                                                                            _model.clearListaCache();
                                                                                            _model.apiRequestCompleted1 = false;
                                                                                          });
                                                                                          await _model.waitForApiRequestCompleted1();
                                                                                        },
                                                                                        autofocus: false,
                                                                                        obscureText: false,
                                                                                        decoration: InputDecoration(
                                                                                          labelText: FFLocalizations.of(context).getText(
                                                                                            'ti1fh2ui' /* Procurar por nome do funcionár... */,
                                                                                          ),
                                                                                          labelStyle: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                                font: GoogleFonts.lexend(
                                                                                                  fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                  fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                ),
                                                                                                letterSpacing: 0.0,
                                                                                                fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                              ),
                                                                                          hintStyle: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                                font: GoogleFonts.lexend(
                                                                                                  fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                  fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                ),
                                                                                                letterSpacing: 0.0,
                                                                                                fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                              ),
                                                                                          enabledBorder: OutlineInputBorder(
                                                                                            borderSide: BorderSide(
                                                                                              color: FlutterFlowTheme.of(context).alternate,
                                                                                              width: 1.0,
                                                                                            ),
                                                                                            borderRadius: BorderRadius.circular(12.0),
                                                                                          ),
                                                                                          focusedBorder: OutlineInputBorder(
                                                                                            borderSide: BorderSide(
                                                                                              color: FlutterFlowTheme.of(context).primary,
                                                                                              width: 1.0,
                                                                                            ),
                                                                                            borderRadius: BorderRadius.circular(12.0),
                                                                                          ),
                                                                                          errorBorder: OutlineInputBorder(
                                                                                            borderSide: BorderSide(
                                                                                              color: FlutterFlowTheme.of(context).error,
                                                                                              width: 1.0,
                                                                                            ),
                                                                                            borderRadius: BorderRadius.circular(12.0),
                                                                                          ),
                                                                                          focusedErrorBorder: OutlineInputBorder(
                                                                                            borderSide: BorderSide(
                                                                                              color: FlutterFlowTheme.of(context).error,
                                                                                              width: 1.0,
                                                                                            ),
                                                                                            borderRadius: BorderRadius.circular(12.0),
                                                                                          ),
                                                                                          filled: true,
                                                                                          fillColor: FlutterFlowTheme.of(context).primaryBackground,
                                                                                          contentPadding: EdgeInsetsDirectional.fromSTEB(20.0, 0.0, 0.0, 0.0),
                                                                                          prefixIcon: Icon(
                                                                                            Icons.search_sharp,
                                                                                          ),
                                                                                        ),
                                                                                        style: FlutterFlowTheme.of(context).bodySmall.override(
                                                                                              font: GoogleFonts.lexend(
                                                                                                fontWeight: FontWeight.w500,
                                                                                                fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                              ),
                                                                                              letterSpacing: 0.0,
                                                                                              fontWeight: FontWeight.w500,
                                                                                              fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                            ),
                                                                                        cursorColor: FlutterFlowTheme.of(context).primary,
                                                                                        validator: _model.textControllerValidator.asValidator(context),
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                ),
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
                                                                                      await showAlignedDialog(
                                                                                        barrierColor: Colors.transparent,
                                                                                        context: context,
                                                                                        isGlobal: false,
                                                                                        avoidOverflow: true,
                                                                                        targetAnchor: AlignmentDirectional(-1.0, 1.0).resolve(Directionality.of(context)),
                                                                                        followerAnchor: AlignmentDirectional(-1.0, -1.0).resolve(Directionality.of(context)),
                                                                                        builder: (dialogContext) {
                                                                                          return Material(
                                                                                            color: Colors.transparent,
                                                                                            child: GestureDetector(
                                                                                              onTap: () {
                                                                                                FocusScope.of(dialogContext).unfocus();
                                                                                                FocusManager.instance.primaryFocus?.unfocus();
                                                                                              },
                                                                                              child: FiltroCargoWidget(
                                                                                                typePage: 'gestao',
                                                                                                action: () async {
                                                                                                  safeSetState(() {
                                                                                                    _model.clearListaCache();
                                                                                                    _model.apiRequestCompleted1 = false;
                                                                                                  });
                                                                                                  await _model.waitForApiRequestCompleted1();
                                                                                                },
                                                                                              ),
                                                                                            ),
                                                                                          );
                                                                                        },
                                                                                      );
                                                                                    },
                                                                                    child: Container(
                                                                                      decoration: BoxDecoration(
                                                                                        color: () {
                                                                                          if (_model.mouseRegionHovered4!) {
                                                                                            return FlutterFlowTheme.of(context).hoverNavBar;
                                                                                          } else if (FFAppState().filtroIdsCargo.isNotEmpty) {
                                                                                            return FlutterFlowTheme.of(context).status03;
                                                                                          } else {
                                                                                            return FlutterFlowTheme.of(context).primaryBackground;
                                                                                          }
                                                                                        }(),
                                                                                        borderRadius: BorderRadius.circular(24.0),
                                                                                        border: Border.all(
                                                                                          color: () {
                                                                                            if (_model.mouseRegionHovered4!) {
                                                                                              return FlutterFlowTheme.of(context).hoverNavBar;
                                                                                            } else if (FFAppState().filtroIdsCargo.isNotEmpty) {
                                                                                              return FlutterFlowTheme.of(context).primary;
                                                                                            } else {
                                                                                              return FlutterFlowTheme.of(context).primaryBackground;
                                                                                            }
                                                                                          }(),
                                                                                          width: 1.0,
                                                                                        ),
                                                                                      ),
                                                                                      child: Padding(
                                                                                        padding: EdgeInsetsDirectional.fromSTEB(16.0, 8.0, 16.0, 8.0),
                                                                                        child: Row(
                                                                                          mainAxisSize: MainAxisSize.max,
                                                                                          children: [
                                                                                            Text(
                                                                                              FFLocalizations.of(context).getText(
                                                                                                'ztjpwfie' /* Cargo */,
                                                                                              ),
                                                                                              style: FlutterFlowTheme.of(context).bodySmall.override(
                                                                                                    font: GoogleFonts.lexend(
                                                                                                      fontWeight: FlutterFlowTheme.of(context).bodySmall.fontWeight,
                                                                                                      fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                                    ),
                                                                                                    color: () {
                                                                                                      if (_model.mouseRegionHovered4!) {
                                                                                                        return FlutterFlowTheme.of(context).secondaryBackground;
                                                                                                      } else if (FFAppState().filtroIdsCargo.isNotEmpty) {
                                                                                                        return FlutterFlowTheme.of(context).primary;
                                                                                                      } else {
                                                                                                        return FlutterFlowTheme.of(context).secondaryText;
                                                                                                      }
                                                                                                    }(),
                                                                                                    letterSpacing: 0.0,
                                                                                                    fontWeight: FlutterFlowTheme.of(context).bodySmall.fontWeight,
                                                                                                    fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                                  ),
                                                                                            ),
                                                                                            Icon(
                                                                                              Icons.keyboard_arrow_down_rounded,
                                                                                              color: () {
                                                                                                if (_model.mouseRegionHovered4!) {
                                                                                                  return FlutterFlowTheme.of(context).secondaryBackground;
                                                                                                } else if (FFAppState().filtroIdsCargo.isNotEmpty) {
                                                                                                  return FlutterFlowTheme.of(context).primary;
                                                                                                } else {
                                                                                                  return FlutterFlowTheme.of(context).secondaryText;
                                                                                                }
                                                                                              }(),
                                                                                              size: 18.0,
                                                                                            ),
                                                                                          ].divide(SizedBox(width: 12.0)),
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                ),
                                                                                onEnter: ((event) async {
                                                                                  safeSetState(() => _model.mouseRegionHovered4 = true);
                                                                                }),
                                                                                onExit: ((event) async {
                                                                                  safeSetState(() => _model.mouseRegionHovered4 = false);
                                                                                }),
                                                                              ),
                                                                              if ((FFAppState().filtroIdsCargo.isNotEmpty) || (_model.textController.text != null && _model.textController.text != ''))
                                                                                FFButtonWidget(
                                                                                  onPressed: () async {
                                                                                    FFAppState().filtroIdsCargo = [];
                                                                                    safeSetState(() {});
                                                                                    safeSetState(() {
                                                                                      _model.textController?.clear();
                                                                                    });
                                                                                    safeSetState(() {
                                                                                      _model.clearListaCache();
                                                                                      _model.apiRequestCompleted1 = false;
                                                                                    });
                                                                                    await _model.waitForApiRequestCompleted1();
                                                                                  },
                                                                                  text: FFLocalizations.of(context).getText(
                                                                                    'gwbdnnop' /* Limpar */,
                                                                                  ),
                                                                                  icon: Icon(
                                                                                    Icons.filter_list_off,
                                                                                    size: 15.0,
                                                                                  ),
                                                                                  options: FFButtonOptions(
                                                                                    height: 30.0,
                                                                                    padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                                                                                    iconPadding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                                                                                    iconColor: FlutterFlowTheme.of(context).error,
                                                                                    color: FlutterFlowTheme.of(context).status05,
                                                                                    textStyle: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                          font: GoogleFonts.lexend(
                                                                                            fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                            fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                          ),
                                                                                          color: FlutterFlowTheme.of(context).error,
                                                                                          letterSpacing: 0.0,
                                                                                          fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                          fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                        ),
                                                                                    elevation: 0.0,
                                                                                    borderSide: BorderSide(
                                                                                      color: FlutterFlowTheme.of(context).error,
                                                                                      width: 1.0,
                                                                                    ),
                                                                                    borderRadius: BorderRadius.circular(24.0),
                                                                                    hoverColor: FlutterFlowTheme.of(context).error,
                                                                                    hoverBorderSide: BorderSide(
                                                                                      color: FlutterFlowTheme.of(context).error,
                                                                                      width: 1.0,
                                                                                    ),
                                                                                    hoverTextColor: FlutterFlowTheme.of(context).secondaryBackground,
                                                                                  ),
                                                                                ),
                                                                            ].divide(SizedBox(width: 12.0)),
                                                                          ),
                                                                        ),
                                                                      ),
                                                                    ],
                                                                  ),
                                                                ),
                                                              ].divide(SizedBox(
                                                                  width: 24.0)),
                                                            ),
                                                          ),
                                                        Container(
                                                          width:
                                                              MediaQuery.sizeOf(
                                                                          context)
                                                                      .width *
                                                                  1.0,
                                                          height: 40.0,
                                                          decoration:
                                                              BoxDecoration(
                                                            color: FlutterFlowTheme
                                                                    .of(context)
                                                                .primaryBackground,
                                                            borderRadius:
                                                                BorderRadius
                                                                    .only(
                                                              bottomLeft: Radius
                                                                  .circular(
                                                                      0.0),
                                                              bottomRight:
                                                                  Radius
                                                                      .circular(
                                                                          0.0),
                                                              topLeft: Radius
                                                                  .circular(
                                                                      8.0),
                                                              topRight: Radius
                                                                  .circular(
                                                                      8.0),
                                                            ),
                                                          ),
                                                          child: Padding(
                                                            padding:
                                                                EdgeInsetsDirectional
                                                                    .fromSTEB(
                                                                        16.0,
                                                                        0.0,
                                                                        16.0,
                                                                        0.0),
                                                            child: Row(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .max,
                                                              children: [
                                                                Expanded(
                                                                  flex: 3,
                                                                  child:
                                                                      SelectionArea(
                                                                          child:
                                                                              Text(
                                                                    FFLocalizations.of(
                                                                            context)
                                                                        .getText(
                                                                      '20oopuvc' /* Funcionario/cargo */,
                                                                    ),
                                                                    style: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .override(
                                                                          font:
                                                                              GoogleFonts.lexend(
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontStyle,
                                                                        ),
                                                                  )),
                                                                ),
                                                                Expanded(
                                                                  flex: 2,
                                                                  child:
                                                                      SelectionArea(
                                                                          child:
                                                                              Text(
                                                                    FFLocalizations.of(
                                                                            context)
                                                                        .getText(
                                                                      '5v6fqwmn' /* Equipe */,
                                                                    ),
                                                                    style: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .override(
                                                                          font:
                                                                              GoogleFonts.lexend(
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontStyle,
                                                                        ),
                                                                  )),
                                                                ),
                                                                Expanded(
                                                                  flex: 2,
                                                                  child:
                                                                      SelectionArea(
                                                                          child:
                                                                              Text(
                                                                    FFLocalizations.of(
                                                                            context)
                                                                        .getText(
                                                                      '0mtvd4j5' /* Tipo/Nível de acesso */,
                                                                    ),
                                                                    style: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .override(
                                                                          font:
                                                                              GoogleFonts.lexend(
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontStyle,
                                                                        ),
                                                                  )),
                                                                ),
                                                                Expanded(
                                                                  flex: 3,
                                                                  child:
                                                                      SelectionArea(
                                                                          child:
                                                                              Text(
                                                                    FFLocalizations.of(
                                                                            context)
                                                                        .getText(
                                                                      'pu5pcufi' /* E-mail */,
                                                                    ),
                                                                    style: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .override(
                                                                          font:
                                                                              GoogleFonts.lexend(
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontStyle,
                                                                        ),
                                                                  )),
                                                                ),
                                                                Expanded(
                                                                  flex: 2,
                                                                  child:
                                                                      SelectionArea(
                                                                          child:
                                                                              Text(
                                                                    FFLocalizations.of(
                                                                            context)
                                                                        .getText(
                                                                      'e4ruhgig' /* Whatsapp */,
                                                                    ),
                                                                    style: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .override(
                                                                          font:
                                                                              GoogleFonts.lexend(
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontStyle,
                                                                        ),
                                                                  )),
                                                                ),
                                                                Container(
                                                                  width: 44.0,
                                                                  decoration:
                                                                      BoxDecoration(),
                                                                  child:
                                                                      SelectionArea(
                                                                          child:
                                                                              Text(
                                                                    FFLocalizations.of(
                                                                            context)
                                                                        .getText(
                                                                      'bwgkg7em' /* Ações */,
                                                                    ),
                                                                    textAlign:
                                                                        TextAlign
                                                                            .center,
                                                                    style: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .override(
                                                                          font:
                                                                              GoogleFonts.lexend(
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontStyle,
                                                                        ),
                                                                  )),
                                                                ),
                                                              ].divide(SizedBox(
                                                                  width: 8.0)),
                                                            ),
                                                          ),
                                                        ),
                                                        if (ProjectsGroup
                                                                    .queryAllTeamsRecordsCall
                                                                    .list(
                                                                  queryallteamsQueryAllTeamsRecordsResponse
                                                                      .jsonBody,
                                                                ) !=
                                                                null &&
                                                            (ProjectsGroup
                                                                    .queryAllTeamsRecordsCall
                                                                    .list(
                                                              queryallteamsQueryAllTeamsRecordsResponse
                                                                  .jsonBody,
                                                            ))!
                                                                .isNotEmpty)
                                                          Container(
                                                            child: Builder(
                                                              builder:
                                                                  (context) {
                                                                final listTeamsMembers =
                                                                    ProjectsGroup
                                                                            .queryAllTeamsRecordsCall
                                                                            .list(
                                                                              queryallteamsQueryAllTeamsRecordsResponse.jsonBody,
                                                                            )
                                                                            ?.toList() ??
                                                                        [];
                                                                if (listTeamsMembers
                                                                    .isEmpty) {
                                                                  return Container();
                                                                }

                                                                return ListView
                                                                    .builder(
                                                                  padding:
                                                                      EdgeInsets
                                                                          .zero,
                                                                  shrinkWrap:
                                                                      true,
                                                                  scrollDirection:
                                                                      Axis.vertical,
                                                                  itemCount:
                                                                      listTeamsMembers
                                                                          .length,
                                                                  itemBuilder:
                                                                      (context,
                                                                          listTeamsMembersIndex) {
                                                                    final listTeamsMembersItem =
                                                                        listTeamsMembers[
                                                                            listTeamsMembersIndex];
                                                                    return Padding(
                                                                      padding: EdgeInsetsDirectional.fromSTEB(
                                                                          0.0,
                                                                          0.0,
                                                                          0.0,
                                                                          1.0),
                                                                      child:
                                                                          Container(
                                                                        width: MediaQuery.sizeOf(context).width *
                                                                            1.0,
                                                                        height:
                                                                            85.0,
                                                                        decoration:
                                                                            BoxDecoration(
                                                                          color:
                                                                              functions.funColorTable(listTeamsMembersIndex),
                                                                        ),
                                                                        child:
                                                                            Padding(
                                                                          padding: EdgeInsetsDirectional.fromSTEB(
                                                                              16.0,
                                                                              8.0,
                                                                              16.0,
                                                                              8.0),
                                                                          child:
                                                                              Row(
                                                                            mainAxisSize:
                                                                                MainAxisSize.max,
                                                                            children:
                                                                                [
                                                                              Expanded(
                                                                                flex: 3,
                                                                                child: Row(
                                                                                  mainAxisSize: MainAxisSize.max,
                                                                                  children: [
                                                                                    Stack(
                                                                                      alignment: AlignmentDirectional(1.0, 1.0),
                                                                                      children: [
                                                                                        ClipRRect(
                                                                                          borderRadius: BorderRadius.circular(40.0),
                                                                                          child: Image.network(
                                                                                            valueOrDefault<String>(
                                                                                              getJsonField(
                                                                                                listTeamsMembersItem,
                                                                                                r'''$.user.profile_picture.url''',
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
                                                                                    Expanded(
                                                                                      child: Row(
                                                                                        mainAxisSize: MainAxisSize.max,
                                                                                        children: [
                                                                                          Expanded(
                                                                                            child: Column(
                                                                                              mainAxisSize: MainAxisSize.max,
                                                                                              mainAxisAlignment: MainAxisAlignment.center,
                                                                                              crossAxisAlignment: CrossAxisAlignment.start,
                                                                                              children: [
                                                                                                SelectionArea(
                                                                                                    child: Text(
                                                                                                  valueOrDefault<String>(
                                                                                                    getJsonField(
                                                                                                      listTeamsMembersItem,
                                                                                                      r'''$.user.name''',
                                                                                                    )?.toString(),
                                                                                                    'N/A',
                                                                                                  ),
                                                                                                  style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                                                                        font: GoogleFonts.lexend(
                                                                                                          fontWeight: FontWeight.w500,
                                                                                                          fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                                        ),
                                                                                                        letterSpacing: 0.0,
                                                                                                        fontWeight: FontWeight.w500,
                                                                                                        fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                                                      ),
                                                                                                )),
                                                                                                SelectionArea(
                                                                                                    child: Text(
                                                                                                  valueOrDefault<String>(
                                                                                                    getJsonField(
                                                                                                      listTeamsMembersItem,
                                                                                                      r'''$.user.users_permissions.users_roles.role''',
                                                                                                    )?.toString(),
                                                                                                    'N/A',
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
                                                                                                )),
                                                                                              ],
                                                                                            ),
                                                                                          ),
                                                                                        ].divide(SizedBox(width: 4.0)),
                                                                                      ),
                                                                                    ),
                                                                                  ].divide(SizedBox(width: 8.0)),
                                                                                ),
                                                                              ),
                                                                              Expanded(
                                                                                flex: 2,
                                                                                child: Padding(
                                                                                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 12.0, 8.0),
                                                                                  child: Row(
                                                                                    mainAxisSize: MainAxisSize.max,
                                                                                    children: [
                                                                                      Row(
                                                                                        mainAxisSize: MainAxisSize.max,
                                                                                        children: [
                                                                                          Container(
                                                                                            width: 120.0,
                                                                                            height: 36.0,
                                                                                            decoration: BoxDecoration(
                                                                                              color: FlutterFlowTheme.of(context).primaryBackground,
                                                                                              borderRadius: BorderRadius.circular(100.0),
                                                                                              border: Border.all(
                                                                                                color: FlutterFlowTheme.of(context).alternate,
                                                                                                width: 1.0,
                                                                                              ),
                                                                                            ),
                                                                                            child: Align(
                                                                                              alignment: AlignmentDirectional(0.0, 0.0),
                                                                                              child: Padding(
                                                                                                padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
                                                                                                child: SelectionArea(
                                                                                                    child: Text(
                                                                                                  valueOrDefault<String>(
                                                                                                    getJsonField(
                                                                                                      listTeamsMembersItem,
                                                                                                      r'''$.teams.name''',
                                                                                                    )?.toString(),
                                                                                                    'N/A',
                                                                                                  ),
                                                                                                  textAlign: TextAlign.center,
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
                                                                                                )),
                                                                                              ),
                                                                                            ),
                                                                                          ),
                                                                                        ].divide(SizedBox(width: 4.0)),
                                                                                      ),
                                                                                    ],
                                                                                  ),
                                                                                ),
                                                                              ),
                                                                              Expanded(
                                                                                flex: 2,
                                                                                child: Padding(
                                                                                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 12.0, 8.0),
                                                                                  child: Column(
                                                                                    mainAxisSize: MainAxisSize.min,
                                                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                                                    children: [
                                                                                      SelectionArea(
                                                                                          child: Text(
                                                                                        valueOrDefault<String>(
                                                                                          getJsonField(
                                                                                            listTeamsMembersItem,
                                                                                            r'''$.user.users_permissions.users_system_access.env''',
                                                                                          )?.toString(),
                                                                                          'N/A',
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
                                                                                      )),
                                                                                      SelectionArea(
                                                                                          child: Text(
                                                                                        valueOrDefault<String>(
                                                                                          getJsonField(
                                                                                            listTeamsMembersItem,
                                                                                            r'''$.user.users_permissions.users_control_system.access_level''',
                                                                                          )?.toString(),
                                                                                          'N/A',
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
                                                                                      )),
                                                                                    ],
                                                                                  ),
                                                                                ),
                                                                              ),
                                                                              Expanded(
                                                                                flex: 3,
                                                                                child: Row(
                                                                                  mainAxisSize: MainAxisSize.max,
                                                                                  children: [
                                                                                    Row(
                                                                                      mainAxisSize: MainAxisSize.max,
                                                                                      crossAxisAlignment: CrossAxisAlignment.end,
                                                                                      children: [
                                                                                        SelectionArea(
                                                                                            child: Text(
                                                                                          valueOrDefault<String>(
                                                                                            getJsonField(
                                                                                              listTeamsMembersItem,
                                                                                              r'''$.user.email''',
                                                                                            )?.toString(),
                                                                                            'N/A',
                                                                                          ),
                                                                                          style: FlutterFlowTheme.of(context).bodySmall.override(
                                                                                                font: GoogleFonts.lexend(
                                                                                                  fontWeight: FontWeight.w500,
                                                                                                  fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                                ),
                                                                                                letterSpacing: 0.0,
                                                                                                fontWeight: FontWeight.w500,
                                                                                                fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                              ),
                                                                                        )),
                                                                                      ].divide(SizedBox(width: 8.0)),
                                                                                    ),
                                                                                  ],
                                                                                ),
                                                                              ),
                                                                              Expanded(
                                                                                flex: 2,
                                                                                child: Row(
                                                                                  mainAxisSize: MainAxisSize.max,
                                                                                  children: [
                                                                                    Expanded(
                                                                                      flex: 1,
                                                                                      child: Row(
                                                                                        mainAxisSize: MainAxisSize.max,
                                                                                        children: [
                                                                                          Row(
                                                                                            mainAxisSize: MainAxisSize.max,
                                                                                            crossAxisAlignment: CrossAxisAlignment.end,
                                                                                            children: [
                                                                                              Row(
                                                                                                mainAxisSize: MainAxisSize.max,
                                                                                                children: [
                                                                                                  FaIcon(
                                                                                                    FontAwesomeIcons.whatsapp,
                                                                                                    color: FlutterFlowTheme.of(context).success,
                                                                                                    size: 16.0,
                                                                                                  ),
                                                                                                ],
                                                                                              ),
                                                                                            ].divide(SizedBox(width: 8.0)),
                                                                                          ),
                                                                                          SelectionArea(
                                                                                              child: Text(
                                                                                            valueOrDefault<String>(
                                                                                              getJsonField(
                                                                                                listTeamsMembersItem,
                                                                                                r'''$.user.phone''',
                                                                                              )?.toString(),
                                                                                              'N/A',
                                                                                            ),
                                                                                            style: FlutterFlowTheme.of(context).bodySmall.override(
                                                                                                  font: GoogleFonts.lexend(
                                                                                                    fontWeight: FontWeight.w500,
                                                                                                    fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                                  ),
                                                                                                  letterSpacing: 0.0,
                                                                                                  fontWeight: FontWeight.w500,
                                                                                                  fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                                                ),
                                                                                          )),
                                                                                        ].divide(SizedBox(width: 4.0)),
                                                                                      ),
                                                                                    ),
                                                                                  ],
                                                                                ),
                                                                              ),
                                                                              Builder(
                                                                                builder: (context) => FlutterFlowIconButton(
                                                                                  borderColor: Colors.transparent,
                                                                                  borderRadius: 30.0,
                                                                                  borderWidth: 1.0,
                                                                                  buttonSize: 44.0,
                                                                                  icon: Icon(
                                                                                    Icons.more_vert,
                                                                                    color: FlutterFlowTheme.of(context).secondaryText,
                                                                                    size: 20.0,
                                                                                  ),
                                                                                  onPressed: () async {
                                                                                    await showAlignedDialog(
                                                                                      barrierColor: Colors.transparent,
                                                                                      context: context,
                                                                                      isGlobal: false,
                                                                                      avoidOverflow: true,
                                                                                      targetAnchor: AlignmentDirectional(1.0, 1.0).resolve(Directionality.of(context)),
                                                                                      followerAnchor: AlignmentDirectional(1.0, -1.0).resolve(Directionality.of(context)),
                                                                                      builder: (dialogContext) {
                                                                                        return Material(
                                                                                          color: Colors.transparent,
                                                                                          child: GestureDetector(
                                                                                            onTap: () {
                                                                                              FocusScope.of(dialogContext).unfocus();
                                                                                              FocusManager.instance.primaryFocus?.unfocus();
                                                                                            },
                                                                                            child: OptionsColaboradorWidget(
                                                                                              typePage: 'edit',
                                                                                              name: valueOrDefault<String>(
                                                                                                getJsonField(
                                                                                                  listTeamsMembersItem,
                                                                                                  r'''$.user.name''',
                                                                                                )?.toString(),
                                                                                                'N/A',
                                                                                              ),
                                                                                              phone: valueOrDefault<String>(
                                                                                                getJsonField(
                                                                                                  listTeamsMembersItem,
                                                                                                  r'''$.user.phone''',
                                                                                                )?.toString(),
                                                                                                'N/A',
                                                                                              ),
                                                                                              idUser: valueOrDefault<int>(
                                                                                                getJsonField(
                                                                                                  listTeamsMembersItem,
                                                                                                  r'''$.user.id''',
                                                                                                ),
                                                                                                0,
                                                                                              ),
                                                                                              email: valueOrDefault<String>(
                                                                                                getJsonField(
                                                                                                  listTeamsMembersItem,
                                                                                                  r'''$.user.email''',
                                                                                                )?.toString(),
                                                                                                'N/A',
                                                                                              ),
                                                                                              rolesId: valueOrDefault<int>(
                                                                                                getJsonField(
                                                                                                  listTeamsMembersItem,
                                                                                                  r'''$.user.users_permissions.users_roles.id''',
                                                                                                ),
                                                                                                0,
                                                                                              ),
                                                                                              typeAcessId: valueOrDefault<int>(
                                                                                                getJsonField(
                                                                                                  listTeamsMembersItem,
                                                                                                  r'''$.user.users_permissions.users_system_access.id''',
                                                                                                ),
                                                                                                0,
                                                                                              ),
                                                                                              controlAcessId: valueOrDefault<int>(
                                                                                                getJsonField(
                                                                                                  listTeamsMembersItem,
                                                                                                  r'''$.user.users_permissions.users_control_system.id''',
                                                                                                ),
                                                                                                0,
                                                                                              ),
                                                                                              typeAcessTxt: valueOrDefault<String>(
                                                                                                getJsonField(
                                                                                                  listTeamsMembersItem,
                                                                                                  r'''$.user.users_permissions.users_system_access.env''',
                                                                                                )?.toString(),
                                                                                                'N/A',
                                                                                              ),
                                                                                              rolesTxt: valueOrDefault<String>(
                                                                                                getJsonField(
                                                                                                  listTeamsMembersItem,
                                                                                                  r'''$.user.users_permissions.users_roles.role''',
                                                                                                )?.toString(),
                                                                                                'N/A',
                                                                                              ),
                                                                                              controlAcessTxt: valueOrDefault<String>(
                                                                                                getJsonField(
                                                                                                  listTeamsMembersItem,
                                                                                                  r'''$.user.users_permissions.users_control_system.env''',
                                                                                                )?.toString(),
                                                                                                'N/A',
                                                                                              ),
                                                                                              url: valueOrDefault<String>(
                                                                                                getJsonField(
                                                                                                  listTeamsMembersItem,
                                                                                                  r'''$.user.profile_picture.url''',
                                                                                                )?.toString(),
                                                                                                'https://x8ki-letl-twmt.n7.xano.io/vault/iaWPz-tD/8ler69Ci8dU8B1ExemIRgXluexs/JGrgRQ../no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg ',
                                                                                              ),
                                                                                              pageTxt: 'equipe',
                                                                                              typePage2: '3',
                                                                                              usePermission: getJsonField(
                                                                                                listTeamsMembersItem,
                                                                                                r'''$.user.users_permission_id''',
                                                                                              ),
                                                                                              qrcode: getJsonField(
                                                                                                listTeamsMembersItem,
                                                                                                r'''$.user.qrcode''',
                                                                                              ).toString(),
                                                                                            ),
                                                                                          ),
                                                                                        );
                                                                                      },
                                                                                    );
                                                                                  },
                                                                                ),
                                                                              ),
                                                                            ].divide(SizedBox(width: 16.0)),
                                                                          ),
                                                                        ),
                                                                      ),
                                                                    );
                                                                  },
                                                                );
                                                              },
                                                            ),
                                                          ),
                                                        Align(
                                                          alignment:
                                                              AlignmentDirectional(
                                                                  -1.0, 0.0),
                                                          child: MouseRegion(
                                                            opaque: false,
                                                            cursor: MouseCursor
                                                                    .defer ??
                                                                MouseCursor
                                                                    .defer,
                                                            child: Visibility(
                                                              visible: ProjectsGroup
                                                                          .queryAllTeamsLeadersRecordsCall
                                                                          .list(
                                                                        queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                            .jsonBody,
                                                                      ) !=
                                                                      null &&
                                                                  (ProjectsGroup
                                                                          .queryAllTeamsLeadersRecordsCall
                                                                          .list(
                                                                    queryAllTeamsLeadersQueryAllTeamsLeadersRecordsResponse
                                                                        .jsonBody,
                                                                  ))!
                                                                      .isNotEmpty,
                                                              child: Builder(
                                                                builder:
                                                                    (context) =>
                                                                        FFButtonWidget(
                                                                  onPressed:
                                                                      () async {
                                                                    FFAppState()
                                                                        .setIds = (ProjectsGroup
                                                                            .queryAllTeamsRecordsCall
                                                                            .list(
                                                                              queryallteamsQueryAllTeamsRecordsResponse.jsonBody,
                                                                            )!
                                                                            .map((e) =>
                                                                                getJsonField(
                                                                                  e,
                                                                                  r'''$.user.id''',
                                                                                ))
                                                                            .toList() as List)
                                                                        .cast<int>()
                                                                        .toList()
                                                                        .cast<int>();
                                                                    safeSetState(
                                                                        () {});
                                                                    await showDialog(
                                                                      context:
                                                                          context,
                                                                      builder:
                                                                          (dialogContext) {
                                                                        return Dialog(
                                                                          elevation:
                                                                              0,
                                                                          insetPadding:
                                                                              EdgeInsets.zero,
                                                                          backgroundColor:
                                                                              Colors.transparent,
                                                                          alignment:
                                                                              AlignmentDirectional(0.0, 0.0).resolve(Directionality.of(context)),
                                                                          child:
                                                                              GestureDetector(
                                                                            onTap:
                                                                                () {
                                                                              FocusScope.of(dialogContext).unfocus();
                                                                              FocusManager.instance.primaryFocus?.unfocus();
                                                                            },
                                                                              child:
                                                                                  Container(
                                                                                height: 200.0,
                                                                                width: 420.0,
                                                                                child: ModalAddLiderWidget(
                                                                                  teamsID: valueOrDefault<int>(
                                                                                    FFAppState().teamId,
                                                                                    0,
                                                                                  ),
                                                                                  teamsName: valueOrDefault<String>(
                                                                                    _model.nomeEquipe,
                                                                                    '-',
                                                                                  ),
                                                                                  typePage: '3',
                                                                                ),
                                                                              ),
                                                                          ),
                                                                        );
                                                                      },
                                                                    );
                                                                  },
                                                                  text: FFLocalizations.of(
                                                                          context)
                                                                      .getText(
                                                                    'h6u9ico6' /* Cadastrar novo funcionário */,
                                                                  ),
                                                                  icon: Icon(
                                                                    Icons
                                                                        .add_circle,
                                                                    size: _model
                                                                            .mouseRegionHovered5!
                                                                        ? 18.5
                                                                        : 18.0,
                                                                  ),
                                                                  options:
                                                                      FFButtonOptions(
                                                                    height:
                                                                        40.0,
                                                                    padding: EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            16.0,
                                                                            0.0,
                                                                            16.0,
                                                                            0.0),
                                                                    iconPadding:
                                                                        EdgeInsetsDirectional.fromSTEB(
                                                                            0.0,
                                                                            0.0,
                                                                            0.0,
                                                                            0.0),
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .secondaryBackground,
                                                                    textStyle: FlutterFlowTheme.of(
                                                                            context)
                                                                        .labelMedium
                                                                        .override(
                                                                          font:
                                                                              GoogleFonts.lexend(
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelMedium.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                          ),
                                                                          color:
                                                                              FlutterFlowTheme.of(context).primary,
                                                                          fontSize: _model.mouseRegionHovered5!
                                                                              ? 12.5
                                                                              : 12.0,
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .labelMedium
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .labelMedium
                                                                              .fontStyle,
                                                                        ),
                                                                    elevation:
                                                                        0.0,
                                                                    borderRadius:
                                                                        BorderRadius.circular(
                                                                            8.0),
                                                                  ),
                                                                ),
                                                              ),
                                                            ),
                                                            onEnter:
                                                                ((event) async {
                                                              safeSetState(() =>
                                                                  _model.mouseRegionHovered5 =
                                                                      true);
                                                            }),
                                                            onExit:
                                                                ((event) async {
                                                              safeSetState(() =>
                                                                  _model.mouseRegionHovered5 =
                                                                      false);
                                                            }),
                                                          ),
                                                        ),
                                                        if (ProjectsGroup
                                                                    .queryAllTeamsRecordsCall
                                                                    .list(
                                                                  queryallteamsQueryAllTeamsRecordsResponse
                                                                      .jsonBody,
                                                                ) !=
                                                                null &&
                                                            (ProjectsGroup
                                                                    .queryAllTeamsRecordsCall
                                                                    .list(
                                                              queryallteamsQueryAllTeamsRecordsResponse
                                                                  .jsonBody,
                                                            ))!
                                                                .isNotEmpty)
                                                          Align(
                                                            alignment:
                                                                AlignmentDirectional(
                                                                    0.0, 1.0),
                                                            child: Padding(
                                                              padding:
                                                                  EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          0.0,
                                                                          16.0,
                                                                          0.0,
                                                                          0.0),
                                                              child: Row(
                                                                mainAxisSize:
                                                                    MainAxisSize
                                                                        .max,
                                                                mainAxisAlignment:
                                                                    MainAxisAlignment
                                                                        .end,
                                                                crossAxisAlignment:
                                                                    CrossAxisAlignment
                                                                        .center,
                                                                children: [
                                                                  Row(
                                                                    mainAxisSize:
                                                                        MainAxisSize
                                                                            .max,
                                                                    children: [
                                                                      Text(
                                                                        FFLocalizations.of(context)
                                                                            .getText(
                                                                          '6n7falzt' /* linhas por página: */,
                                                                        ),
                                                                        style: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .override(
                                                                              font: GoogleFonts.lexend(
                                                                                fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                              ),
                                                                              color: Color(0xB32D323F),
                                                                              letterSpacing: 0.0,
                                                                              fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                              fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                            ),
                                                                      ),
                                                                      FlutterFlowDropDown<
                                                                          int>(
                                                                        controller:
                                                                            _model.dropDownTeamsValueController ??=
                                                                                FormFieldController<int>(
                                                                          _model.dropDownTeamsValue ??=
                                                                              _model.perPageTeams,
                                                                        ),
                                                                        options:
                                                                            List<int>.from([
                                                                          5,
                                                                          10,
                                                                          15,
                                                                          20,
                                                                          100
                                                                        ]),
                                                                        optionLabels: [
                                                                          FFLocalizations.of(context)
                                                                              .getText(
                                                                            'bscjs18z' /* 5 */,
                                                                          ),
                                                                          FFLocalizations.of(context)
                                                                              .getText(
                                                                            'ndufech8' /* 10 */,
                                                                          ),
                                                                          FFLocalizations.of(context)
                                                                              .getText(
                                                                            'uau4voxl' /* 15 */,
                                                                          ),
                                                                          FFLocalizations.of(context)
                                                                              .getText(
                                                                            'tv39yvzh' /* 20 */,
                                                                          ),
                                                                          FFLocalizations.of(context)
                                                                              .getText(
                                                                            '2hkvl4h6' /* 100 */,
                                                                          ),
                                                                          ''
                                                                        ],
                                                                        onChanged:
                                                                            (val) async {
                                                                          safeSetState(() =>
                                                                              _model.dropDownTeamsValue = val);
                                                                          _model.pageTeam =
                                                                              1;
                                                                          _model.perPageTeams =
                                                                              _model.dropDownTeamsValue!;
                                                                          safeSetState(
                                                                              () {});
                                                                          safeSetState(
                                                                              () {
                                                                            _model.clearListaCache();
                                                                            _model.apiRequestCompleted1 =
                                                                                false;
                                                                          });
                                                                          await _model
                                                                              .waitForApiRequestCompleted1();
                                                                        },
                                                                        width:
                                                                            62.0,
                                                                        height:
                                                                            35.0,
                                                                        textStyle: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .override(
                                                                              font: GoogleFonts.lexend(
                                                                                fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                                fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                              ),
                                                                              color: FlutterFlowTheme.of(context).secondaryText,
                                                                              letterSpacing: 0.0,
                                                                              fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                              fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                            ),
                                                                        hintText:
                                                                            FFLocalizations.of(context).getText(
                                                                          '8esi53v1' /* 10 */,
                                                                        ),
                                                                        icon:
                                                                            Icon(
                                                                          Icons
                                                                              .keyboard_arrow_down_rounded,
                                                                          color:
                                                                              FlutterFlowTheme.of(context).secondaryText,
                                                                          size:
                                                                              18.0,
                                                                        ),
                                                                        fillColor:
                                                                            FlutterFlowTheme.of(context).primaryBackground,
                                                                        elevation:
                                                                            2.0,
                                                                        borderColor:
                                                                            FlutterFlowTheme.of(context).alternate,
                                                                        borderWidth:
                                                                            0.5,
                                                                        borderRadius:
                                                                            8.0,
                                                                        margin: EdgeInsetsDirectional.fromSTEB(
                                                                            12.0,
                                                                            0.0,
                                                                            12.0,
                                                                            0.0),
                                                                        hidesUnderline:
                                                                            true,
                                                                        isOverButton:
                                                                            false,
                                                                        isSearchable:
                                                                            false,
                                                                        isMultiSelect:
                                                                            false,
                                                                      ),
                                                                    ].divide(SizedBox(
                                                                        width:
                                                                            16.0)),
                                                                  ),
                                                                  Text(
                                                                    '${_model.pageTeam.toString()} de ${valueOrDefault<String>(
                                                                      ProjectsGroup
                                                                          .queryAllTeamsRecordsCall
                                                                          .pageTotal(
                                                                            queryallteamsQueryAllTeamsRecordsResponse.jsonBody,
                                                                          )
                                                                          ?.toString(),
                                                                      '0',
                                                                    )}',
                                                                    style: FlutterFlowTheme.of(
                                                                            context)
                                                                        .bodyMedium
                                                                        .override(
                                                                          font:
                                                                              GoogleFonts.lexend(
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                                                                          ),
                                                                          color:
                                                                              Color(0xB22D323F),
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontStyle,
                                                                        ),
                                                                  ),
                                                                  Row(
                                                                    mainAxisSize:
                                                                        MainAxisSize
                                                                            .max,
                                                                    children: [
                                                                      FlutterFlowIconButton(
                                                                        borderRadius:
                                                                            8.0,
                                                                        buttonSize:
                                                                            40.0,
                                                                        hoverColor:
                                                                            FlutterFlowTheme.of(context).hoverNavBar,
                                                                        hoverIconColor:
                                                                            FlutterFlowTheme.of(context).secondaryBackground,
                                                                        hoverBorderColor:
                                                                            FlutterFlowTheme.of(context).hoverNavBar,
                                                                        icon:
                                                                            Icon(
                                                                          Icons
                                                                              .arrow_back_ios_rounded,
                                                                          color:
                                                                              Color(0x662D323F),
                                                                          size:
                                                                              18.0,
                                                                        ),
                                                                        onPressed:
                                                                            () async {
                                                                          if (_model.pageTeam !=
                                                                              1) {
                                                                            _model.pageTeam =
                                                                                _model.pageTeam + -1;
                                                                            safeSetState(() {});
                                                                            safeSetState(() {
                                                                              _model.clearListaCache();
                                                                              _model.apiRequestCompleted1 = false;
                                                                            });
                                                                            await _model.waitForApiRequestCompleted1();
                                                                          }
                                                                        },
                                                                      ),
                                                                      FlutterFlowIconButton(
                                                                        borderRadius:
                                                                            8.0,
                                                                        buttonSize:
                                                                            40.0,
                                                                        hoverColor:
                                                                            FlutterFlowTheme.of(context).hoverNavBar,
                                                                        hoverIconColor:
                                                                            FlutterFlowTheme.of(context).secondaryBackground,
                                                                        hoverBorderColor:
                                                                            FlutterFlowTheme.of(context).hoverNavBar,
                                                                        icon:
                                                                            Icon(
                                                                          Icons
                                                                              .arrow_forward_ios_rounded,
                                                                          color:
                                                                              Color(0x662D323F),
                                                                          size:
                                                                              18.0,
                                                                        ),
                                                                        onPressed:
                                                                            () async {
                                                                          if (_model.pageTeam !=
                                                                              valueOrDefault<int>(
                                                                                ProjectsGroup.queryAllTeamsRecordsCall.pageTotal(
                                                                                  queryallteamsQueryAllTeamsRecordsResponse.jsonBody,
                                                                                ),
                                                                                0,
                                                                              )) {
                                                                            _model.pageTeam =
                                                                                _model.pageTeam + 1;
                                                                            safeSetState(() {});
                                                                            safeSetState(() {
                                                                              _model.clearListaCache();
                                                                              _model.apiRequestCompleted1 = false;
                                                                            });
                                                                            await _model.waitForApiRequestCompleted1();
                                                                          }
                                                                        },
                                                                      ),
                                                                    ],
                                                                  ),
                                                                ].divide(SizedBox(
                                                                    width:
                                                                        24.0)),
                                                              ),
                                                            ),
                                                          ),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            );
                                          },
                                        ),
                                      ].divide(SizedBox(height: 0.0)),
                                    ),
                                  );
                                },
                              ),
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
    );
  }
}
