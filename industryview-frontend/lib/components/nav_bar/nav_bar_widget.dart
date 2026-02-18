import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/logout/logout_widget.dart';
import '/components/mouserhover_menu_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/index.dart';
import '/flows/configuracoes/configuracoes_widget.dart';
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'nav_bar_model.dart';
export 'nav_bar_model.dart';

class NavBarWidget extends StatefulWidget {
  const NavBarWidget({super.key});

  @override
  State<NavBarWidget> createState() => _NavBarWidgetState();
}

class _NavBarWidgetState extends State<NavBarWidget> {
  late NavBarModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => NavBarModel());

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

    return Visibility(
      visible: responsiveVisibility(
        context: context,
        phone: false,
        tablet: false,
      ),
      child: Container(
        width: 210.0,
        height: MediaQuery.sizeOf(context).height * 1.0,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [FlutterFlowTheme.of(context).primary, Color(0xFF011E4D)],
            stops: [0.0, 1.0],
            begin: AlignmentDirectional(0.0, -1.0),
            end: AlignmentDirectional(0, 1.0),
          ),
          borderRadius: BorderRadius.circular(0.0),
          border: Border.all(
            color: FlutterFlowTheme.of(context).alternate,
            width: 1.0,
          ),
        ),
        child: Padding(
          padding: EdgeInsetsDirectional.fromSTEB(0.0, 24.0, 0.0, 24.0),
          child: Column(
            mainAxisSize: MainAxisSize.max,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Align(
                alignment: AlignmentDirectional(0.0, 0.0),
                child: Padding(
                  padding:
                      EdgeInsetsDirectional.fromSTEB(16.0, 12.0, 16.0, 12.0),
                  child: Text(
                    'IndustryView',
                    style: GoogleFonts.lexend(
                      color: Colors.white,
                      fontSize: 20.0,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              Divider(
                height: 12.0,
                thickness: 1.0,
                color: FlutterFlowTheme.of(context).secondary,
              ),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(
                            16.0, 12.0, 0.0, 0.0),
                        child: Text(
                          FFLocalizations.of(context).getText(
                            'nxz5g2yc' /* Páginas principais */,
                          ),
                          style:
                              FlutterFlowTheme.of(context).labelLarge.override(
                                    font: GoogleFonts.lexend(
                                      fontWeight: FontWeight.normal,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .labelLarge
                                          .fontStyle,
                                    ),
                                    color: Color(0xFFD4E0F9),
                                    fontSize: 14.0,
                                    letterSpacing: 0.0,
                                    fontWeight: FontWeight.normal,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .labelLarge
                                        .fontStyle,
                                  ),
                        ),
                      ),
                      MouseRegion(
                        opaque: false,
                        cursor: MouseCursor.defer ?? MouseCursor.defer,
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 16.0, 0.0),
                          child: InkWell(
                            splashColor: Colors.transparent,
                            focusColor: Colors.transparent,
                            hoverColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () async {
                              FFAppState().navBarSelection = 1;
                              FFAppState().projects = false;
                              safeSetState(() {});

                              context.pushNamed(
                                DashboardWidget.routeName,
                                extra: <String, dynamic>{
                                  kTransitionInfoKey: TransitionInfo(
                                    hasTransition: true,
                                    transitionType: PageTransitionType.fade,
                                    duration: Duration(milliseconds: 0),
                                  ),
                                },
                              );
                            },
                            child: AnimatedContainer(
                              duration: Duration(milliseconds: 200),
                              curve: Curves.easeInOut,
                              width: MediaQuery.sizeOf(context).width * 1.0,
                              height: 44.0,
                              decoration: BoxDecoration(
                                color: valueOrDefault<Color>(
                                  () {
                                    if (_model.dashboardHovered!) {
                                      return FlutterFlowTheme.of(context)
                                          .hoverNavBar;
                                    } else if (FFAppState().navBarSelection ==
                                        1) {
                                      return FlutterFlowTheme.of(context)
                                          .hoverNavBar;
                                    } else {
                                      return Color(0x00000000);
                                    }
                                  }(),
                                  Colors.transparent,
                                ),
                                borderRadius: BorderRadius.circular(12.0),
                                shape: BoxShape.rectangle,
                              ),
                              child: Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    8.0, 0.0, 8.0, 0.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  children: [
                                    FaIcon(
                                      FontAwesomeIcons.robot,
                                      color: FlutterFlowTheme.of(context).info,
                                      size: 18.0,
                                    ),
                                    Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          12.0, 0.0, 0.0, 0.0),
                                      child: Text(
                                        FFLocalizations.of(context).getText(
                                          'fv16avc2' /* IA (Em breve) */,
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
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .info,
                                              fontSize: 12.0,
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
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                        onEnter: ((event) async {
                          safeSetState(() => _model.dashboardHovered = true);
                        }),
                        onExit: ((event) async {
                          safeSetState(() => _model.dashboardHovered = false);
                        }),
                      ),

                      MouseRegion(
                        opaque: false,
                        cursor: MouseCursor.defer ?? MouseCursor.defer,
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 16.0, 0.0),
                          child: InkWell(
                            splashColor: Colors.transparent,
                            focusColor: Colors.transparent,
                            hoverColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () async {
                              FFAppState().navBarSelection = 4;

                              FFAppState().projects = false;
                              safeSetState(() {});

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
                            child: AnimatedContainer(
                              duration: Duration(milliseconds: 200),
                              curve: Curves.easeInOut,
                              width: MediaQuery.sizeOf(context).width * 1.0,
                              height: 44.0,
                              decoration: BoxDecoration(
                                color: () {
                                  if (_model.tarefaHovered!) {
                                    return FlutterFlowTheme.of(context)
                                        .hoverNavBar;
                                  } else if (FFAppState().navBarSelection ==
                                      4) {
                                    return FlutterFlowTheme.of(context)
                                        .hoverNavBar;
                                  } else {
                                    return Color(0x00000000);
                                  }
                                }(),
                                borderRadius: BorderRadius.circular(12.0),
                                shape: BoxShape.rectangle,
                              ),
                              child: Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    8.0, 0.0, 8.0, 0.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  children: [
                                    Icon(
                                      Icons.task,
                                      color: FlutterFlowTheme.of(context).info,
                                      size: 20.0,
                                    ),
                                    Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          12.0, 0.0, 0.0, 0.0),
                                      child: Text(
                                        FFLocalizations.of(context).getText(
                                          'p1zmk45p' /* Tarefas */,
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
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .info,
                                              fontSize: 12.0,
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
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                        onEnter: ((event) async {
                          safeSetState(() => _model.tarefaHovered = true);
                        }),
                        onExit: ((event) async {
                          safeSetState(() => _model.tarefaHovered = false);
                        }),
                      ),
                      MouseRegion(
                        opaque: false,
                        cursor: MouseCursor.defer ?? MouseCursor.defer,
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 16.0, 0.0),
                          child: InkWell(
                            splashColor: Colors.transparent,
                            focusColor: Colors.transparent,
                            hoverColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () async {
                              FFAppState().navBarSelection = 6;
                              FFAppState().filtroIdsCargo = [];
                              FFAppState().projects = false;
                              safeSetState(() {});

                              context.pushNamed(
                                FuncionarioWidget.routeName,
                                extra: <String, dynamic>{
                                  kTransitionInfoKey: TransitionInfo(
                                    hasTransition: true,
                                    transitionType: PageTransitionType.fade,
                                    duration: Duration(milliseconds: 0),
                                  ),
                                },
                              );
                            },
                            child: AnimatedContainer(
                              duration: Duration(milliseconds: 200),
                              curve: Curves.easeInOut,
                              width: MediaQuery.sizeOf(context).width * 1.0,
                              height: 44.0,
                              decoration: BoxDecoration(
                                color: () {
                                  if (_model.colaboradorHovered!) {
                                    return FlutterFlowTheme.of(context)
                                        .hoverNavBar;
                                  } else if (FFAppState().navBarSelection ==
                                      6) {
                                    return FlutterFlowTheme.of(context)
                                        .hoverNavBar;
                                  } else {
                                    return Color(0x00000000);
                                  }
                                }(),
                                borderRadius: BorderRadius.circular(12.0),
                                shape: BoxShape.rectangle,
                              ),
                              child: Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    8.0, 0.0, 8.0, 0.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  children: [
                                    Icon(
                                      Icons.people_rounded,
                                      color: FlutterFlowTheme.of(context).info,
                                      size: 20.0,
                                    ),
                                    Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          12.0, 0.0, 0.0, 0.0),
                                      child: Text(
                                        FFLocalizations.of(context).getText(
                                          'p2qjpe3l' /* Funcionários */,
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
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .info,
                                              fontSize: 12.0,
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
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                        onEnter: ((event) async {
                          safeSetState(() => _model.colaboradorHovered = true);
                        }),
                        onExit: ((event) async {
                          safeSetState(() => _model.colaboradorHovered = false);
                        }),
                      ),
                      FutureBuilder<ApiCallResponse>(
                        future: _model.projeto(
                          requestFn: () =>
                              ProjectsGroup.queryAllProjectsRecordsCall.call(
                            page: 1,
                            perPage: 5,
                            bearerAuth: FFAppState().token,
                            companyId: FFAppState().infoUser.companyId,
                          ),
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
                          final containerQueryAllProjectsRecordsResponse =
                              snapshot.data!;

                          return Container(
                            decoration: BoxDecoration(),
                            child: Column(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                MouseRegion(
                                  opaque: false,
                                  cursor:
                                      MouseCursor.defer ?? MouseCursor.defer,
                                  child: Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        16.0, 0.0, 16.0, 0.0),
                                    child: InkWell(
                                      splashColor: Colors.transparent,
                                      focusColor: Colors.transparent,
                                      hoverColor: Colors.transparent,
                                      highlightColor: Colors.transparent,
                                      onTap: () async {
                                        FFAppState().navBarSelection = 5;
                                        FFAppState().projects = true;
                                        safeSetState(() {});

                                        context.pushNamed(
                                          ProjetosWidget.routeName,
                                          extra: <String, dynamic>{
                                            kTransitionInfoKey: TransitionInfo(
                                              hasTransition: true,
                                              transitionType:
                                                  PageTransitionType.fade,
                                              duration:
                                                  Duration(milliseconds: 0),
                                            ),
                                          },
                                        );
                                      },
                                      child: AnimatedContainer(
                                        duration: Duration(milliseconds: 200),
                                        curve: Curves.easeInOut,
                                        width:
                                            MediaQuery.sizeOf(context).width *
                                                1.0,
                                        height: 44.0,
                                        decoration: BoxDecoration(
                                          color: () {
                                            if (_model.projetoHovered!) {
                                              return FlutterFlowTheme.of(
                                                      context)
                                                  .hoverNavBar;
                                            } else if (FFAppState()
                                                    .navBarSelection ==
                                                5) {
                                              return FlutterFlowTheme.of(
                                                      context)
                                                  .hoverNavBar;
                                            } else {
                                              return Color(0x00000000);
                                            }
                                          }(),
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                          shape: BoxShape.rectangle,
                                        ),
                                        child: Padding(
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  8.0, 0.0, 12.0, 0.0),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.max,
                                            mainAxisAlignment:
                                                MainAxisAlignment.start,
                                            children: [
                                              Icon(
                                                Icons.cases_rounded,
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .info,
                                                size: 20.0,
                                              ),
                                              Padding(
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        12.0, 0.0, 0.0, 0.0),
                                                child: Text(
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    'q11e8mps' /* Projetos */,
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
                                                        color:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .info,
                                                        fontSize: 12.0,
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
                                              if ((ProjectsGroup
                                                          .queryAllProjectsRecordsCall
                                                          .list(
                                                            containerQueryAllProjectsRecordsResponse
                                                                .jsonBody,
                                                          )!
                                                          .length >=
                                                      1) &&
                                                  !_model.mostraProjetos)
                                                Flexible(
                                                  child: Align(
                                                    alignment:
                                                        AlignmentDirectional(
                                                            1.0, 0.0),
                                                    child: Icon(
                                                      Icons
                                                          .keyboard_arrow_down_rounded,
                                                      color: FlutterFlowTheme
                                                              .of(context)
                                                          .secondaryBackground,
                                                      size: 20.0,
                                                    ),
                                                  ),
                                                ),
                                              if (_model.mostraProjetos)
                                                Flexible(
                                                  child: Align(
                                                    alignment:
                                                        AlignmentDirectional(
                                                            1.0, 0.0),
                                                    child: Icon(
                                                      Icons
                                                          .keyboard_arrow_up_rounded,
                                                      color: FlutterFlowTheme
                                                              .of(context)
                                                          .secondaryBackground,
                                                      size: 20.0,
                                                    ),
                                                  ),
                                                ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                  onEnter: ((event) async {
                                    safeSetState(
                                        () => _model.projetoHovered = true);
                                  }),
                                  onExit: ((event) async {
                                    safeSetState(
                                        () => _model.projetoHovered = false);
                                  }),
                                ),
                                if (FFAppState().projects)
                                  Column(
                                    mainAxisSize: MainAxisSize.max,
                                    children: [
                                      Padding(
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            0.0, 8.0, 0.0, 0.0),
                                        child: Builder(
                                          builder: (context) {
                                            final lista = (ProjectsGroup
                                                        .queryAllProjectsRecordsCall
                                                        .list(
                                                          containerQueryAllProjectsRecordsResponse
                                                              .jsonBody,
                                                        )
                                                        ?.toList() ??
                                                    [])
                                                .take(5)
                                                .toList();

                                            return ListView.separated(
                                              padding: EdgeInsets.zero,
                                              shrinkWrap: true,
                                              scrollDirection: Axis.vertical,
                                              itemCount: lista.length,
                                              separatorBuilder: (_, __) =>
                                                  SizedBox(height: 8.0),
                                              itemBuilder:
                                                  (context, listaIndex) {
                                                final listaItem =
                                                    lista[listaIndex];
                                                return InkWell(
                                                  splashColor:
                                                      Colors.transparent,
                                                  focusColor:
                                                      Colors.transparent,
                                                  hoverColor:
                                                      Colors.transparent,
                                                  highlightColor:
                                                      Colors.transparent,
                                                  onTap: () async {
                                                    FFAppState().projectsInfo =
                                                        ProjectsInfo1Struct();
                                                    safeSetState(() {});
                                                    FFAppState().projectsInfo =
                                                        ProjectsInfo1Struct(
                                                      id: valueOrDefault<int>(
                                                        getJsonField(
                                                          listaItem,
                                                          r'''$.id''',
                                                        ),
                                                        0,
                                                      ),
                                                      registrationNumber:
                                                          getJsonField(
                                                        listaItem,
                                                        r'''$.registration_number''',
                                                      ).toString(),
                                                      name: getJsonField(
                                                        listaItem,
                                                        r'''$.name''',
                                                      ).toString(),
                                                      originRegistration:
                                                          getJsonField(
                                                        listaItem,
                                                        r'''$.origin_registration''',
                                                      ).toString(),
                                                      art: getJsonField(
                                                        listaItem,
                                                        r'''$.art''',
                                                      ).toString(),
                                                      rrt: getJsonField(
                                                        listaItem,
                                                        r'''$.rrt''',
                                                      ).toString(),
                                                      cib: getJsonField(
                                                        listaItem,
                                                        r'''$.cib''',
                                                      ).toString(),
                                                      realStateRegistration:
                                                          getJsonField(
                                                        listaItem,
                                                        r'''$.real_state_registration''',
                                                      ).toString(),
                                                      permitNumber:
                                                          getJsonField(
                                                        listaItem,
                                                        r'''$.permit_number''',
                                                      ).toString(),
                                                      cnae: getJsonField(
                                                        listaItem,
                                                        r'''$.cnae''',
                                                      ).toString(),
                                                      responsible: getJsonField(
                                                        listaItem,
                                                        r'''$.responsible''',
                                                      ).toString(),
                                                      cep: getJsonField(
                                                        listaItem,
                                                        r'''$.cep''',
                                                      ).toString(),
                                                      city: getJsonField(
                                                        listaItem,
                                                        r'''$.city''',
                                                      ).toString(),
                                                      number: getJsonField(
                                                        listaItem,
                                                        r'''$.number''',
                                                      ).toString(),
                                                      state: getJsonField(
                                                        listaItem,
                                                        r'''$.state''',
                                                      ).toString(),
                                                      country: getJsonField(
                                                        listaItem,
                                                        r'''$.country''',
                                                      ).toString(),
                                                      street: getJsonField(
                                                        listaItem,
                                                        r'''$.street''',
                                                      ).toString(),
                                                      complement: getJsonField(
                                                        listaItem,
                                                        r'''$.complement''',
                                                      ).toString(),
                                                      cnpj: getJsonField(
                                                        listaItem,
                                                        r'''$.cnpj''',
                                                      ).toString(),
                                                      completionPercentage:
                                                          getJsonField(
                                                        listaItem,
                                                        r'''$.completion_percentage''',
                                                      ),
                                                      projectsStatusesId:
                                                          getJsonField(
                                                        listaItem,
                                                        r'''$.projects_statuses_id''',
                                                      ),
                                                      projectsWorksSituationsId:
                                                          getJsonField(
                                                        listaItem,
                                                        r'''$.projetcts_works_situations_id''',
                                                      ),
                                                      category: getJsonField(
                                                        listaItem,
                                                        r'''$.category''',
                                                      ).toString(),
                                                      destination: getJsonField(
                                                        listaItem,
                                                        r'''$.destination''',
                                                      ).toString(),
                                                      projectWorkType:
                                                          getJsonField(
                                                        listaItem,
                                                        r'''$.project_worl_type''',
                                                      ).toString(),
                                                      resultingWorkArea:
                                                          getJsonField(
                                                        listaItem,
                                                        r'''$.resulting_work_area''',
                                                      ).toString(),
                                                      projectCreationDate:
                                                          getJsonField(
                                                        listaItem,
                                                        r'''$.project_creation_date''',
                                                      ),
                                                      startDate: dateTimeFormat(
                                                        "dd/MM/yyyy HH:mm",
                                                        DateTime
                                                            .fromMillisecondsSinceEpoch(
                                                                getJsonField(
                                                          listaItem,
                                                          r'''$.start_date''',
                                                        )),
                                                        locale:
                                                            FFLocalizations.of(
                                                                    context)
                                                                .languageCode,
                                                      ),
                                                      situationDate:
                                                          dateTimeFormat(
                                                        "dd/MM/yyyy HH:mm",
                                                        DateTime
                                                            .fromMillisecondsSinceEpoch(
                                                                getJsonField(
                                                          listaItem,
                                                          r'''$.situation_date''',
                                                        )),
                                                        locale:
                                                            FFLocalizations.of(
                                                                    context)
                                                                .languageCode,
                                                      ),
                                                      lastTeamCreated:
                                                          LastTeamCreatedStruct(
                                                        id: getJsonField(
                                                          listaItem,
                                                          r'''$.last_team_created.id''',
                                                        ),
                                                        name: getJsonField(
                                                          listaItem,
                                                          r'''$.last_team_created.name''',
                                                        ).toString(),
                                                      ),
                                                      url: getJsonField(
                                                        listaItem,
                                                        r'''$.cno_file.url''',
                                                      ).toString(),
                                                      fileName: getJsonField(
                                                        listaItem,
                                                        r'''$.cno_file.name''',
                                                      ).toString(),
                                                      neighborhood:
                                                          getJsonField(
                                                        listaItem,
                                                        r'''$.neighbourhood''',
                                                      ).toString(),
                                                    );
                                                    FFAppState().teamId =
                                                        valueOrDefault<int>(
                                                      getJsonField(
                                                        listaItem,
                                                        r'''$.last_team_created.id''',
                                                      ),
                                                      0,
                                                    );
                                                    safeSetState(() {});

                                                    context.pushNamed(
                                                        ProjetoDetalhesWidget
                                                            .routeName);
                                                  },
                                                  child: MouserhoverMenuWidget(
                                                    key: Key(
                                                        'Keyjca_${listaIndex}_of_${lista.length}'),
                                                    parameter1: getJsonField(
                                                      listaItem,
                                                      r'''$.name''',
                                                    ),
                                                    parameter3: getJsonField(
                                                      listaItem,
                                                      r'''$.id''',
                                                    ),
                                                    parameter4: getJsonField(
                                                      listaItem,
                                                      r'''$.registration_number''',
                                                    ),
                                                    parameter5: getJsonField(
                                                      listaItem,
                                                      r'''$.name''',
                                                    ),
                                                    parameter6: getJsonField(
                                                      listaItem,
                                                      r'''$.origin_registration''',
                                                    ),
                                                    parameter7: getJsonField(
                                                      listaItem,
                                                      r'''$.art''',
                                                    ),
                                                    parameter8: getJsonField(
                                                      listaItem,
                                                      r'''$.rrt''',
                                                    ),
                                                    parameter9: getJsonField(
                                                      listaItem,
                                                      r'''$.cib''',
                                                    ),
                                                    parameter10: getJsonField(
                                                      listaItem,
                                                      r'''$.real_state_registration''',
                                                    ),
                                                    parameter11: getJsonField(
                                                      listaItem,
                                                      r'''$.permit_number''',
                                                    ),
                                                    parameter12: getJsonField(
                                                      listaItem,
                                                      r'''$.cnae''',
                                                    ),
                                                    parameter13: getJsonField(
                                                      listaItem,
                                                      r'''$.responsible''',
                                                    ),
                                                    parameter14: getJsonField(
                                                      listaItem,
                                                      r'''$.cep''',
                                                    ),
                                                    parameter15: getJsonField(
                                                      listaItem,
                                                      r'''$.city''',
                                                    ),
                                                    parameter16: getJsonField(
                                                      listaItem,
                                                      r'''$.number''',
                                                    ),
                                                    parameter17: getJsonField(
                                                      listaItem,
                                                      r'''$.state''',
                                                    ),
                                                    parameter18: getJsonField(
                                                      listaItem,
                                                      r'''$.country''',
                                                    ),
                                                    parameter19: getJsonField(
                                                      listaItem,
                                                      r'''$.street''',
                                                    ),
                                                    parameter20: getJsonField(
                                                      listaItem,
                                                      r'''$.complement''',
                                                    ),
                                                    parameter21: getJsonField(
                                                      listaItem,
                                                      r'''$.cnpj''',
                                                    ),
                                                    parameter22: getJsonField(
                                                      listaItem,
                                                      r'''$.completion_percentage''',
                                                    ),
                                                    parameter23: getJsonField(
                                                      listaItem,
                                                      r'''$.projects_statuses_id''',
                                                    ),
                                                    parameter24: getJsonField(
                                                      listaItem,
                                                      r'''$.projetcts_works_situations_id''',
                                                    ),
                                                    parameter25: getJsonField(
                                                      listaItem,
                                                      r'''$.category''',
                                                    ),
                                                    parameter26: getJsonField(
                                                      listaItem,
                                                      r'''$.destination''',
                                                    ),
                                                    parameter27: getJsonField(
                                                      listaItem,
                                                      r'''$.project_worl_type''',
                                                    ),
                                                    parameter28: getJsonField(
                                                      listaItem,
                                                      r'''$.resulting_work_area''',
                                                    ),
                                                    parameter29: getJsonField(
                                                      listaItem,
                                                      r'''$.project_creation_date''',
                                                    ),
                                                    parameter30: getJsonField(
                                                      listaItem,
                                                      r'''$.start_date''',
                                                    ),
                                                    parameter31: getJsonField(
                                                      listaItem,
                                                      r'''$.situation_date''',
                                                    ),
                                                    parameter32: getJsonField(
                                                      listaItem,
                                                      r'''$.last_team_created.id''',
                                                    ),
                                                    parameter33: getJsonField(
                                                      listaItem,
                                                      r'''$.last_team_created.name''',
                                                    ),
                                                    parameter34: getJsonField(
                                                      listaItem,
                                                      r'''$.cno_file.url''',
                                                    ),
                                                    parameter35: getJsonField(
                                                      listaItem,
                                                      r'''$.cno_file.name''',
                                                    ),
                                                    parameter36: getJsonField(
                                                      listaItem,
                                                      r'''$.neighbourhood''',
                                                    ),
                                                    parameter37: getJsonField(
                                                      listaItem,
                                                      r'''$.last_team_created.id''',
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
                              ],
                            ),
                          );
                        },
                      ),
                      MouseRegion(
                        opaque: false,
                        cursor: MouseCursor.defer ?? MouseCursor.defer,
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 16.0, 0.0),
                          child: InkWell(
                            splashColor: Colors.transparent,
                            focusColor: Colors.transparent,
                            hoverColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () async {
                              FFAppState().navBarSelection = 7;
                              FFAppState().projects = false;
                              safeSetState(() {});

                              context.pushNamed(
                                ConfiguracoesWidget.routeName,
                                extra: <String, dynamic>{
                                  kTransitionInfoKey: TransitionInfo(
                                    hasTransition: true,
                                    transitionType: PageTransitionType.fade,
                                    duration: Duration(milliseconds: 0),
                                  ),
                                },
                              );
                            },
                            child: AnimatedContainer(
                              duration: Duration(milliseconds: 200),
                              curve: Curves.easeInOut,
                              width: MediaQuery.sizeOf(context).width * 1.0,
                              height: 44.0,
                              decoration: BoxDecoration(
                                color: () {
                                  if (_model.configuracoesHovered!) {
                                    return FlutterFlowTheme.of(context)
                                        .hoverNavBar;
                                  } else if (FFAppState().navBarSelection ==
                                      7) {
                                    return FlutterFlowTheme.of(context)
                                        .hoverNavBar;
                                  } else {
                                    return Color(0x00000000);
                                  }
                                }(),
                                borderRadius: BorderRadius.circular(12.0),
                                shape: BoxShape.rectangle,
                              ),
                              child: Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    8.0, 0.0, 8.0, 0.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  children: [
                                    Icon(
                                      Icons.settings_rounded,
                                      color: FlutterFlowTheme.of(context).info,
                                      size: 20.0,
                                    ),
                                    Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          12.0, 0.0, 0.0, 0.0),
                                      child: Text(
                                        'Configurações',
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
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .info,
                                              fontSize: 12.0,
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
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                        onEnter: ((event) async {
                          safeSetState(
                              () => _model.configuracoesHovered = true);
                        }),
                        onExit: ((event) async {
                          safeSetState(
                              () => _model.configuracoesHovered = false);
                        }),
                      ),
                    ].divide(SizedBox(height: 12.0)),
                  ),
                ),
              ),
              Divider(
                height: 12.0,
                thickness: 1.0,
                color: FlutterFlowTheme.of(context).secondary,
              ),
              MouseRegion(
                opaque: false,
                cursor: MouseCursor.defer ?? MouseCursor.defer,
                child: Builder(
                  builder: (context) => Padding(
                    padding:
                        EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                    child: InkWell(
                      splashColor: Colors.transparent,
                      focusColor: Colors.transparent,
                      hoverColor: Colors.transparent,
                      highlightColor: Colors.transparent,
                      onTap: () async {
                        await showAlignedDialog(
                          barrierColor: Color(0x7F000000),
                          context: context,
                          isGlobal: false,
                          avoidOverflow: false,
                          targetAnchor: AlignmentDirectional(0.0, 1.0)
                              .resolve(Directionality.of(context)),
                          followerAnchor: AlignmentDirectional(-0.4, 1.0)
                              .resolve(Directionality.of(context)),
                          builder: (dialogContext) {
                            return Material(
                              color: Colors.transparent,
                              child: LogoutWidget(),
                            );
                          },
                        );
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: _model.mouseRegionHovered!
                              ? FlutterFlowTheme.of(context).hoverNavBar
                              : Color(0x00000000),
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              8.0, 4.0, 8.0, 4.0),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 40.0,
                                height: 40.0,
                                decoration: BoxDecoration(
                                  color: FlutterFlowTheme.of(context).navbar,
                                  borderRadius: BorderRadius.circular(12.0),
                                  border: Border.all(
                                    color:
                                        FlutterFlowTheme.of(context).secondary,
                                    width: 2.0,
                                  ),
                                ),
                                child: Padding(
                                  padding: EdgeInsets.all(2.0),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(8.0),
                                    child: CachedNetworkImage(
                                      fadeInDuration:
                                          Duration(milliseconds: 500),
                                      fadeOutDuration:
                                          Duration(milliseconds: 500),
                                      imageUrl: valueOrDefault<String>(
                                        FFAppState().infoUser.url,
                                        'https://x8ki-letl-twmt.n7.xano.io/vault/iaWPz-tD/8ler69Ci8dU8B1ExemIRgXluexs/JGrgRQ../no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg ',
                                      ),
                                      width: 44.0,
                                      height: 44.0,
                                      fit: BoxFit.cover,
                                    ),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: Padding(
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      12.0, 0.0, 0.0, 0.0),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.max,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        FFAppState().infoUser.name,
                                        style: FlutterFlowTheme.of(context)
                                            .bodyLarge
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .bodyLarge
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .bodyLarge
                                                        .fontStyle,
                                              ),
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .info,
                                              fontSize: 12.0,
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .bodyLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .bodyLarge
                                                      .fontStyle,
                                            ),
                                      ),
                                      Text(
                                        FFAppState().infoUser.email,
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
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .info,
                                              fontSize: 12.0,
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
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                onEnter: ((event) async {
                  safeSetState(() => _model.mouseRegionHovered = true);
                }),
                onExit: ((event) async {
                  safeSetState(() => _model.mouseRegionHovered = false);
                }),
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                child: FlutterFlowDropDown<String>(
                  controller: _model.dropDownValueController ??=
                      FormFieldController<String>(
                    _model.dropDownValue ??=
                        FFLocalizations.of(context).languageCode,
                  ),
                  options: List<String>.from(['pt', 'en', 'es']),
                  optionLabels: [
                    FFLocalizations.of(context).getText(
                      'nz9qbsq8' /* Português */,
                    ),
                    FFLocalizations.of(context).getText(
                      'pidaum8w' /* English */,
                    ),
                    FFLocalizations.of(context).getText(
                      'gd68mgn4' /* Español */,
                    )
                  ],
                  onChanged: (val) async {
                    safeSetState(() => _model.dropDownValue = val);
                    setAppLanguage(context, _model.dropDownValue!);
                    if (FFAppState().isMap) {
                      context.pushNamed(
                        DashboardWidget.routeName,
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
                      return;
                    }
                  },
                  width: 200.0,
                  height: 40.0,
                  textStyle: FlutterFlowTheme.of(context).bodyMedium.override(
                        font: GoogleFonts.lexend(
                          fontWeight: FlutterFlowTheme.of(context)
                              .bodyMedium
                              .fontWeight,
                          fontStyle:
                              FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                        ),
                        color: FlutterFlowTheme.of(context).secondaryBackground,
                        letterSpacing: 0.0,
                        fontWeight:
                            FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                      ),
                  hintText: FFLocalizations.of(context).getText(
                    'wlf5s38g' /* Language */,
                  ),
                  icon: Icon(
                    Icons.keyboard_arrow_down_rounded,
                    color: FlutterFlowTheme.of(context).secondaryBackground,
                    size: 24.0,
                  ),
                  fillColor: Color(0xFF011E4D),
                  elevation: 2.0,
                  borderColor: Color(0xFF011E4D),
                  borderWidth: 1.0,
                  borderRadius: 12.0,
                  margin: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
                  hidesUnderline: true,
                  isOverButton: false,
                  isSearchable: false,
                  isMultiSelect: false,
                ),
              ),
            ].divide(SizedBox(height: 12.0)),
          ),
        ),
      ),
    );
  }
}

