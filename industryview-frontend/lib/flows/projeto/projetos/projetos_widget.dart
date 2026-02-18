import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/comp_projetos_widget.dart';
import '/components/modal_empty_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/index.dart';
import 'dart:async';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'projetos_model.dart';
export 'projetos_model.dart';

class ProjetosWidget extends StatefulWidget {
  const ProjetosWidget({super.key});

  static String routeName = 'Projetos';
  static String routePath = '/projetos';

  @override
  State<ProjetosWidget> createState() => _ProjetosWidgetState();
}

class _ProjetosWidgetState extends State<ProjetosWidget> {
  late ProjetosModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ProjetosModel());

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      FFAppState().navBarSelection = 5;
      FFAppState().update(() {});
      _model.aPiTokenAuth = await AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall
          .call(
        bearerAuth: FFAppState().token,
      );

      if ((_model.aPiTokenAuth?.succeeded ?? true)) {
        FFAppState().isMap = false;
        FFAppState().update(() {});
        /*
        if ((FFAppState().infoUser.plan == 3) ||
            (FFAppState().infoUser.plan == 4)) {
          context.goNamedAuth(
            ExpiredplanWidget.routeName,
            context.mounted,
            extra: <String, dynamic>{
              kTransitionInfoKey: TransitionInfo(
                hasTransition: true,
                transitionType: PageTransitionType.fade,
                duration: Duration(milliseconds: 0),
              ),
            },
          );

          return;
        } else if (FFAppState().infoUser.plan == 5) {
          context.goNamedAuth(
            PagePriceWidget.routeName,
            context.mounted,
            queryParameters: {
              'companyID': serializeParam(
                0,
                ParamType.int,
              ),
            }.withoutNulls,
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
        */
      } else {
        GoRouter.of(context).prepareAuthEvent();
        await authManager.signOut();
        GoRouter.of(context).clearRedirectLocation();

        return;
      }
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
                        .projetos(
                      requestFn: () =>
                          ProjectsGroup.queryAllProjectsRecordsCall.call(
                        page: _model.page,
                        perPage: _model.perPage,
                        bearerAuth: FFAppState().token,
                        search: _model.textController.text,
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
                      final containerQueryAllProjectsRecordsResponse =
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
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Column(
                                      mainAxisSize: MainAxisSize.min,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              Icons.solar_power_rounded,
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .primary,
                                              size: 24.0,
                                            ),
                                            Row(
                                              mainAxisSize: MainAxisSize.max,
                                              children: [
                                                SelectionArea(
                                                    child: Text(
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    '9morr8t6' /* Projetos */,
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
                                              ],
                                            ),
                                          ].divide(SizedBox(width: 8.0)),
                                        ),
                                        SelectionArea(
                                            child: Text(
                                          FFLocalizations.of(context).getText(
                                            'dyk17ah2' /* Aqui você pode acessar todos o... */,
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
                                                    FlutterFlowTheme.of(context)
                                                        .labelMedium
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
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
                                Row(
                                  mainAxisSize: MainAxisSize.max,
                                  mainAxisAlignment: MainAxisAlignment.start,
                                  children: [
                                    if (responsiveVisibility(
                                      context: context,
                                      phone: false,
                                    ))
                                      Container(
                                        width: 600.0,
                                        child: TextFormField(
                                          controller: _model.textController,
                                          focusNode: _model.textFieldFocusNode,
                                          onChanged: (_) =>
                                              EasyDebounce.debounce(
                                            '_model.textController',
                                            Duration(milliseconds: 500),
                                            () async {
                                              safeSetState(() {
                                                _model.clearProjetosCache();
                                                _model.apiRequestCompleted =
                                                    false;
                                              });
                                              await _model
                                                  .waitForApiRequestCompleted();
                                            },
                                          ),
                                          onFieldSubmitted: (_) async {
                                            safeSetState(() {
                                              _model.clearProjetosCache();
                                              _model.apiRequestCompleted =
                                                  false;
                                            });
                                            await _model
                                                .waitForApiRequestCompleted();
                                          },
                                          autofocus: false,
                                          obscureText: false,
                                          decoration: InputDecoration(
                                            labelText:
                                                FFLocalizations.of(context)
                                                    .getText(
                                              'h824nd7z' /* Procurar por nome do projeto */,
                                            ),
                                            labelStyle:
                                                FlutterFlowTheme.of(context)
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
                                            hintStyle:
                                                FlutterFlowTheme.of(context)
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
                                            enabledBorder: OutlineInputBorder(
                                              borderSide: BorderSide(
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .alternate,
                                                width: 1.0,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(12.0),
                                            ),
                                            focusedBorder: OutlineInputBorder(
                                              borderSide: BorderSide(
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .primary,
                                                width: 1.0,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(12.0),
                                            ),
                                            errorBorder: OutlineInputBorder(
                                              borderSide: BorderSide(
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .error,
                                                width: 1.0,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(12.0),
                                            ),
                                            focusedErrorBorder:
                                                OutlineInputBorder(
                                              borderSide: BorderSide(
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .error,
                                                width: 1.0,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(12.0),
                                            ),
                                            filled: true,
                                            fillColor:
                                                FlutterFlowTheme.of(context)
                                                    .primaryBackground,
                                            contentPadding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    20.0, 0.0, 0.0, 0.0),
                                            prefixIcon: Icon(
                                              Icons.search_sharp,
                                            ),
                                          ),
                                          style: FlutterFlowTheme.of(context)
                                              .bodySmall
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight: FontWeight.w500,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .bodySmall
                                                          .fontStyle,
                                                ),
                                                letterSpacing: 0.0,
                                                fontWeight: FontWeight.w500,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
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
                                    if (_model.textController.text != null &&
                                        _model.textController.text != '')
                                      FFButtonWidget(
                                        onPressed: () async {
                                          safeSetState(() {
                                            _model.textController?.clear();
                                          });
                                          safeSetState(() {
                                            _model.clearProjetosCache();
                                            _model.apiRequestCompleted = false;
                                          });
                                          await _model
                                              .waitForApiRequestCompleted();
                                        },
                                        text:
                                            FFLocalizations.of(context).getText(
                                          'koyns3nk' /* Limpar */,
                                        ),
                                        icon: Icon(
                                          Icons.filter_list_off,
                                          size: 15.0,
                                        ),
                                        options: FFButtonOptions(
                                          height: 30.0,
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  16.0, 0.0, 16.0, 0.0),
                                          iconPadding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  0.0, 0.0, 0.0, 0.0),
                                          color: FlutterFlowTheme.of(context)
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
                                                    FlutterFlowTheme.of(context)
                                                        .error,
                                                letterSpacing: 0.0,
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmall
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmall
                                                        .fontStyle,
                                              ),
                                          elevation: 0.0,
                                          borderSide: BorderSide(
                                            color: FlutterFlowTheme.of(context)
                                                .error,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(24.0),
                                          hoverColor:
                                              FlutterFlowTheme.of(context)
                                                  .error,
                                          hoverBorderSide: BorderSide(
                                            color: FlutterFlowTheme.of(context)
                                                .error,
                                            width: 1.0,
                                          ),
                                          hoverTextColor:
                                              FlutterFlowTheme.of(context)
                                                  .secondaryBackground,
                                        ),
                                      ),
                                    Align(
                                      alignment:
                                          AlignmentDirectional(1.0, -1.0),
                                      child: FFButtonWidget(
                                        onPressed: () async {
                                          FFAppState().projectsInfo =
                                              ProjectsInfo1Struct();
                                          safeSetState(() {});

                                          context.pushNamed(
                                            CriarProjetoWidget.routeName,
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
                                        },
                                        text:
                                            FFLocalizations.of(context).getText(
                                          'lno0u4yz' /* Criar novo projeto */,
                                        ),
                                        options: FFButtonOptions(
                                          width: 200.0,
                                          height: 40.0,
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  16.0, 0.0, 16.0, 0.0),
                                          iconPadding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  0.0, 0.0, 0.0, 0.0),
                                          color: FlutterFlowTheme.of(context)
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
                                Expanded(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.max,
                                    children: [
                                      Expanded(
                                        child: Builder(
                                          builder: (context) {
                                            final listProjects = ProjectsGroup
                                                    .queryAllProjectsRecordsCall
                                                    .list(
                                                      containerQueryAllProjectsRecordsResponse
                                                          .jsonBody,
                                                    )
                                                    ?.toList() ??
                                                [];
                                            if (listProjects.isEmpty) {
                                              return ModalEmptyWidget();
                                            }

                                            return GridView.builder(
                                              padding: EdgeInsets.zero,
                                              gridDelegate:
                                                  SliverGridDelegateWithFixedCrossAxisCount(
                                                crossAxisCount: 4,
                                                crossAxisSpacing: 10.0,
                                                mainAxisSpacing: 10.0,
                                                childAspectRatio: 4.0,
                                              ),
                                              scrollDirection: Axis.vertical,
                                              itemCount: listProjects.length,
                                              itemBuilder:
                                                  (context, listProjectsIndex) {
                                                final listProjectsItem =
                                                    listProjects[
                                                        listProjectsIndex];
                                                return CompProjetosWidget(
                                                  key: Key(
                                                      'Keyijh_${listProjectsIndex}_of_${listProjects.length}'),
                                                  parameter1: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.name''',
                                                  ),
                                                  parameter2: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.registration_number''',
                                                  ),
                                                  parameter3: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.id''',
                                                  ),
                                                  parameter4: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.origin_registration''',
                                                  ),
                                                  parameter5: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.art''',
                                                  ),
                                                  parameter6: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.rrt''',
                                                  ),
                                                  parameter7: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.cib''',
                                                  ),
                                                  parameter8: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.real_state_registration''',
                                                  ),
                                                  parameter9: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.permit_number''',
                                                  ),
                                                  parameter10: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.cnae''',
                                                  ),
                                                  parameter11: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.responsible''',
                                                  ),
                                                  parameter12: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.cep''',
                                                  ),
                                                  parameter13: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.city''',
                                                  ),
                                                  parameter14: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.number''',
                                                  ),
                                                  parameter15: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.state''',
                                                  ),
                                                  parameter16: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.country''',
                                                  ),
                                                  parameter17: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.street''',
                                                  ),
                                                  parameter18: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.complement''',
                                                  ),
                                                  parameter19: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.cnpj''',
                                                  ),
                                                  parameter20: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.completion_percentage''',
                                                  ),
                                                  parameter21: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.projects_statuses_id''',
                                                  ),
                                                  parameter22: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.projects_works_situations_id''',
                                                  ),
                                                  parameter23: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.category''',
                                                  ),
                                                  parameter24: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.destination''',
                                                  ),
                                                  parameter25: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.project_work_type''',
                                                  ),
                                                  parameter26: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.resulting_work_area''',
                                                  ),
                                                  parameter27: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.project_creation_date''',
                                                  ),
                                                  parameter28: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.start_date''',
                                                  ),
                                                  parameter29: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.situation_date''',
                                                  ),
                                                  parameter30: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.last_team_created.id''',
                                                  ),
                                                  parameter31: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.cno_file.url''',
                                                  ),
                                                  parameter32: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.cno_file.name''',
                                                  ),
                                                  parameter33: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.neighbourhood''',
                                                  ),
                                                  parameter34: getJsonField(
                                                    listProjectsItem,
                                                    r'''$.last_team_created.name''',
                                                  ),
                                                );
                                              },
                                            );
                                          },
                                        ),
                                      ),
                                      if (ProjectsGroup
                                                  .queryAllProjectsRecordsCall
                                                  .list(
                                                containerQueryAllProjectsRecordsResponse
                                                    .jsonBody,
                                              ) !=
                                              null &&
                                          (ProjectsGroup
                                                  .queryAllProjectsRecordsCall
                                                  .list(
                                            containerQueryAllProjectsRecordsResponse
                                                .jsonBody,
                                          ))!
                                              .isNotEmpty)
                                        Padding(
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
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
                                                      'iag9mf2h' /* linhas por página: */,
                                                    ),
                                                    style: FlutterFlowTheme.of(
                                                            context)
                                                        .bodyMedium
                                                        .override(
                                                          font: GoogleFonts
                                                              .lexend(
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
                                                              Color(0xB32D323F),
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
                                                        FormFieldController<
                                                            int>(
                                                      _model.dropDownValue ??=
                                                          _model.perPage,
                                                    ),
                                                    options: List<int>.from(
                                                        [5, 10, 15, 20]),
                                                    optionLabels: [
                                                      FFLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'lysmo9ph' /* 5 */,
                                                      ),
                                                      FFLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'f4zbizkx' /* 10 */,
                                                      ),
                                                      FFLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'yinoy6j0' /* 15 */,
                                                      ),
                                                      FFLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'h0ew52yg' /* 20 */,
                                                      )
                                                    ],
                                                    onChanged: (val) async {
                                                      safeSetState(() => _model
                                                          .dropDownValue = val);
                                                      _model.perPage =
                                                          _model.dropDownValue!;
                                                      _model.page = 1;
                                                      safeSetState(() {});
                                                      safeSetState(() {
                                                        _model
                                                            .clearProjetosCache();
                                                        _model.apiRequestCompleted =
                                                            false;
                                                      });
                                                      await _model
                                                          .waitForApiRequestCompleted();
                                                    },
                                                    width: 62.0,
                                                    height: 35.0,
                                                    textStyle: FlutterFlowTheme
                                                            .of(context)
                                                        .bodyMedium
                                                        .override(
                                                          font: GoogleFonts
                                                              .lexend(
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
                                                              Color(0xB32D323F),
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
                                                        FFLocalizations.of(
                                                                context)
                                                            .getText(
                                                      'xiqtzw1d' /* 10 */,
                                                    ),
                                                    icon: Icon(
                                                      Icons
                                                          .keyboard_arrow_down_rounded,
                                                      color: Color(0xB276787D),
                                                      size: 18.0,
                                                    ),
                                                    fillColor: FlutterFlowTheme
                                                            .of(context)
                                                        .secondaryBackground,
                                                    elevation: 2.0,
                                                    borderColor:
                                                        FlutterFlowTheme.of(
                                                                context)
                                                            .alternate,
                                                    borderWidth: 0.0,
                                                    borderRadius: 8.0,
                                                    margin:
                                                        EdgeInsetsDirectional
                                                            .fromSTEB(12.0, 0.0,
                                                                12.0, 0.0),
                                                    hidesUnderline: true,
                                                    isOverButton: false,
                                                    isSearchable: false,
                                                    isMultiSelect: false,
                                                  ),
                                                ].divide(SizedBox(width: 16.0)),
                                              ),
                                              Text(
                                                '${_model.page.toString()} de ${valueOrDefault<String>(
                                                  ProjectsGroup
                                                      .queryAllProjectsRecordsCall
                                                      .pageTotal(
                                                        containerQueryAllProjectsRecordsResponse
                                                            .jsonBody,
                                                      )
                                                      ?.toString(),
                                                  '0',
                                                )}',
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
                                                        FlutterFlowTheme.of(
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
                                                              .clearProjetosCache();
                                                          _model.apiRequestCompleted =
                                                              false;
                                                        });
                                                        await _model
                                                            .waitForApiRequestCompleted();
                                                      }
                                                    },
                                                  ),
                                                  FlutterFlowIconButton(
                                                    borderRadius: 8.0,
                                                    buttonSize: 40.0,
                                                    hoverColor:
                                                        FlutterFlowTheme.of(
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
                                                      color: Color(0x662D323F),
                                                      size: 18.0,
                                                    ),
                                                    onPressed: () async {
                                                      if (_model.page !=
                                                          valueOrDefault<int>(
                                                            ProjectsGroup
                                                                .queryAllProjectsRecordsCall
                                                                .pageTotal(
                                                              containerQueryAllProjectsRecordsResponse
                                                                  .jsonBody,
                                                            ),
                                                            0,
                                                          )) {
                                                        _model.page =
                                                            _model.page + 1;
                                                        safeSetState(() {});
                                                        safeSetState(() {
                                                          _model
                                                              .clearProjetosCache();
                                                          _model.apiRequestCompleted =
                                                              false;
                                                        });
                                                        await _model
                                                            .waitForApiRequestCompleted();
                                                      }
                                                    },
                                                  ),
                                                ],
                                              ),
                                            ].divide(SizedBox(width: 24.0)),
                                          ),
                                        ),
                                    ],
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
    );
  }
}
