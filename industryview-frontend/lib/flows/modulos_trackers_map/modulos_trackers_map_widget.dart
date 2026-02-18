import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/esqueleto1_widget.dart';
import '/components/esqueleto2_widget.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/components/status_stakes_widget.dart';
import '/flows/heavy_array_pier/heavy_array_pier_widget.dart';
import '/flows/projeto/mapa_de_trackers/filtro_status_fundacao/filtro_status_fundacao_widget.dart';
import '/flows/projeto/mapa_de_trackers/filtro_status_trackers/filtro_status_trackers_widget.dart';
import '/flows/projeto/mapa_de_trackers/filtro_tipode_tracker/filtro_tipode_tracker_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_add_fileira/modal_add_fileira_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_add_nova_row/modal_add_nova_row_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_add_nova_secao/modal_add_nova_secao_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_editar_lote_selecionado/modal_editar_lote_selecionado_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_grafico_de_porcentagem/modal_grafico_de_porcentagem_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_novo_campo/modal_novo_campo_widget.dart';
import '/flows/projeto/mapa_de_trackers/options_secao/options_secao_widget.dart';
import '/flows/trackers/heavy_array_pier_edge/heavy_array_pier_edge_widget.dart';
import '/flows/trackers/heavy_motor_pier/heavy_motor_pier_widget.dart';
import '/flows/trackers/standart_array_pier/standart_array_pier_widget.dart';
import '/flows/trackers/standart_array_pier_edge/standart_array_pier_edge_widget.dart';
import '/flows/trackers/standart_motor_pier/standart_motor_pier_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/index.dart';
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modulos_trackers_map_model.dart';
export 'modulos_trackers_map_model.dart';

class ModulosTrackersMapWidget extends StatefulWidget {
  const ModulosTrackersMapWidget({
    super.key,
    this.sectionsId,
    this.fieldsId,
    this.sectionNumber,
    this.rowId,
    this.listRowsTrackers,
    this.trackerslistEmpty,
    this.rowNumber,
  });

  final int? sectionsId;
  final int? fieldsId;
  final int? sectionNumber;
  final int? rowId;
  final List<int>? listRowsTrackers;
  final List<ListRowsTrackersStruct>? trackerslistEmpty;
  final int? rowNumber;

  static String routeName = 'ModulosTrackersMap';
  static String routePath = '/modulosTrackersMap';

  @override
  State<ModulosTrackersMapWidget> createState() =>
      _ModulosTrackersMapWidgetState();
}

class _ModulosTrackersMapWidgetState extends State<ModulosTrackersMapWidget> {
  late ModulosTrackersMapModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModulosTrackersMapModel());

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      Function() _navigate = () {};
      _model.aPiTokenAuth = await AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall
          .call(
        bearerAuth: FFAppState().token,
      );

      if ((_model.aPiTokenAuth?.succeeded ?? true)) {
        FFAppState().isMap = false;
        FFAppState().update(() {});
      } else {
        GoRouter.of(context).prepareAuthEvent();
        await authManager.signOut();
        GoRouter.of(context).clearRedirectLocation();

        _navigate =
            () => context.goNamedAuth(LoginWidget.routeName, context.mounted);

        _navigate();
        return;
      }

      FFAppState().idsExistentes = [];
      FFAppState().filtroIdsStatusStakes = [];
      FFAppState().filtroIdsStatusTracker = [];
      FFAppState().filtroIdsTypeTracker = [];
      FFAppState().jsonRowsRef = [];
      safeSetState(() {});
      _model.listFieldsLoad =
      _model.listFieldsLoad = await ApiCallResponse(null, {}, 200); // Dummy API Response

      if ((_model.listFieldsLoad?.succeeded ?? true)) {
        _model.jsonFieldRef =
            (_model.listFieldsLoad?.jsonBody ?? '').toList().cast<dynamic>();
        safeSetState(() {});
        _model.fieldId = valueOrDefault<int>(
          widget!.fieldsId != null
              ? widget!.fieldsId
              : getJsonField(
                  (_model.listFieldsLoad?.jsonBody ?? ''),
                  r'''$[0].id''',
                ),
          0,
        );
        safeSetState(() {});
        FFAppState().esqueleto1 = true;
        FFAppState().esqueleto2 = true;
        safeSetState(() {});
        _model.listSectionsLoad =
            await ApiCallResponse(null, {}, 200); // Dummy API Response

        if ((_model.listSectionsLoad?.succeeded ?? true)) {
          _model.jsonSectionsRef = (_model.listSectionsLoad?.jsonBody ?? '')
              .toList()
              .cast<dynamic>();
          safeSetState(() {});
          _model.sectionsId = valueOrDefault<int>(
            widget!.sectionsId != null
                ? widget!.sectionsId
                : getJsonField(
                    (_model.listSectionsLoad?.jsonBody ?? ''),
                    r'''$[0].id''',
                  ),
            0,
          );
          _model.sectionNumber = valueOrDefault<int>(
            widget!.sectionNumber != null
                ? widget!.sectionNumber
                : getJsonField(
                    (_model.listSectionsLoad?.jsonBody ?? ''),
                    r'''$[0].section_number''',
                  ),
            0,
          );
          safeSetState(() {});
          _model.listRowsLoad =
              await ApiCallResponse(null, {}, 200); // Dummy API Response

          if ((_model.listRowsLoad?.succeeded ?? true)) {
            FFAppState().jsonRowsRef = ((_model.listRowsLoad?.jsonBody ?? '')
                    .toList()
                    .map<MapTrackersStruct?>(MapTrackersStruct.maybeFromMap)
                    .toList() as Iterable<MapTrackersStruct?>)
                .withoutNulls
                .toList()
                .cast<MapTrackersStruct>();
            safeSetState(() {});
            _model.rowslist = [];
            safeSetState(() {});
            _model.returnAction = await actions.actRetornaValidacaoStatusStake(
              FFAppState().jsonRowsRef.toList(),
              widget!.sectionsId != null
                  ? widget!.sectionsId
                  : _model.sectionsId,
            );
            FFAppState().esqueleto1 = false;
            FFAppState().esqueleto2 = false;
            FFAppState().actionReturn = _model.returnAction!;
            safeSetState(() {});
            if (FFAppState().excluiuTrackers) {
              FFAppState().addFileiraTracker = [];
              FFAppState().idsExistentes = [];
              FFAppState().setIds = [];
              safeSetState(() {});
              if (widget!.trackerslistEmpty != null &&
                  (widget!.trackerslistEmpty)!.isNotEmpty) {
                _model.action1 = await actions.actAddInfosTracker(
                  FFAppState().addFileiraTracker.toList(),
                  FFAppState().jsonRowsRef.toList(),
                  widget!.rowId!,
                );
                FFAppState().addFileiraTracker =
                    _model.action1!.toList().cast<DropSelect1Struct>();
                FFAppState().idsExistentes =
                    widget!.listRowsTrackers!.toList().cast<int>();
                FFAppState().addToSetIds(widget!.rowId!);
                safeSetState(() {});
              } else {
                FFAppState().addToSetIds(widget!.rowId!);
                safeSetState(() {});
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
                    child: GestureDetector(
                      onTap: () {
                        FocusScope.of(dialogContext).unfocus();
                        FocusManager.instance.primaryFocus?.unfocus();
                      },
                      child: ModalAddFileiraWidget(
                        typePage: widget!.trackerslistEmpty != null &&
                                (widget!.trackerslistEmpty)!.isNotEmpty
                            ? 'edit'
                            : 'creat',
                        row: widget!.rowNumber!,
                        sections: _model.sectionNumber!,
                        rowRef: FFAppState().jsonRowsRef,
                        fieldId: _model.fieldId,
                        sectionNumber: widget!.sectionNumber != null
                            ? widget!.sectionNumber!
                            : _model.sectionNumber!,
                        sectionsId: _model.sectionsId,
                        rowId: widget!.rowId,
                        listRowsTrackers: widget!.listRowsTrackers,
                        trackerslistEmpty: widget!.trackerslistEmpty,
                      ),
                    ),
                  );
                },
              );

              return;
            } else {
              return;
            }
          } else {
            FFAppState().esqueleto1 = false;
            FFAppState().esqueleto2 = false;
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
                  child: GestureDetector(
                    onTap: () {
                      FocusScope.of(dialogContext).unfocus();
                      FocusManager.instance.primaryFocus?.unfocus();
                    },
                    child: ModalInfoWidget(
                      title: 'Erro1',
                      description: getJsonField(
                        (_model.listRowsLoad?.jsonBody ?? ''),
                        r'''$.message''',
                      ).toString(),
                    ),
                  ),
                );
              },
            );

            return;
          }
        } else {
          FFAppState().esqueleto1 = false;
          FFAppState().esqueleto2 = false;
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
                child: GestureDetector(
                  onTap: () {
                    FocusScope.of(dialogContext).unfocus();
                    FocusManager.instance.primaryFocus?.unfocus();
                  },
                  child: ModalInfoWidget(
                    title: 'Erro',
                    description: getJsonField(
                      (_model.listSectionsLoad?.jsonBody ?? ''),
                      r'''$.message''',
                    ).toString(),
                  ),
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
              child: GestureDetector(
                onTap: () {
                  FocusScope.of(dialogContext).unfocus();
                  FocusManager.instance.primaryFocus?.unfocus();
                },
                child: ModalInfoWidget(
                  title: 'Erro',
                  description: getJsonField(
                    (_model.listFieldsLoad?.jsonBody ?? ''),
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
                    child: Material(
                      color: Colors.transparent,
                      elevation: 1.0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      child: Container(
                        width: double.infinity,
                        height: double.infinity,
                        decoration: BoxDecoration(
                          color:
                              FlutterFlowTheme.of(context).secondaryBackground,
                          borderRadius: BorderRadius.circular(12.0),
                          border: Border.all(
                            color: FlutterFlowTheme.of(context).alternate,
                          ),
                        ),
                        child: Padding(
                          padding: EdgeInsets.all(24.0),
                          child: SingleChildScrollView(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Column(
                                  mainAxisSize: MainAxisSize.min,
                                  crossAxisAlignment: CrossAxisAlignment.start,
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
                                                  duration:
                                                      Duration(milliseconds: 0),
                                                ),
                                              },
                                            );
                                          },
                                          child: Container(
                                            decoration: BoxDecoration(),
                                            child: Text(
                                              FFLocalizations.of(context)
                                                  .getText(
                                                'uhih157x' /* Projetos */,
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
                                                    color: FlutterFlowTheme.of(
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
                                            Icons.keyboard_arrow_right_rounded,
                                            color: FlutterFlowTheme.of(context)
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
                                                  duration:
                                                      Duration(milliseconds: 0),
                                                ),
                                              },
                                            );
                                          },
                                          child: Container(
                                            decoration: BoxDecoration(),
                                            child: Text(
                                              FFAppState().projectsInfo.name,
                                              style:
                                                  FlutterFlowTheme.of(context)
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
                                            Icons.keyboard_arrow_right_rounded,
                                            color: FlutterFlowTheme.of(context)
                                                .primaryText,
                                            size: 18.0,
                                          ),
                                        ),
                                        Text(
                                          FFLocalizations.of(context).getText(
                                            '4omaxtoy' /* Mapa de trackers */,
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
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .primary,
                                                letterSpacing: 0.0,
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .bodyMedium
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .bodyMedium
                                                        .fontStyle,
                                              ),
                                        ),
                                      ],
                                    ),
                                    Row(
                                      mainAxisSize: MainAxisSize.max,
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
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
                                                  color: FlutterFlowTheme.of(
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
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                      'ticcmkyb' /* Mapa de trackers */,
                                                    ),
                                                    style: FlutterFlowTheme.of(
                                                            context)
                                                        .headlineMedium
                                                        .override(
                                                          font: GoogleFonts
                                                              .lexend(
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
                                              FFLocalizations.of(context)
                                                  .getText(
                                                '0grh56pf' /* Crie e administre os lotes que... */,
                                              ),
                                              style:
                                                  FlutterFlowTheme.of(context)
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
                                        if (false)
                                          Builder(
                                            builder: (context) =>
                                                FFButtonWidget(
                                              onPressed: () async {
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
                                                          FocusManager.instance
                                                              .primaryFocus
                                                              ?.unfocus();
                                                        },
                                                        child:
                                                            ModalGraficoDePorcentagemWidget(),
                                                      ),
                                                    );
                                                  },
                                                );
                                              },
                                              text: FFLocalizations.of(context)
                                                  .getText(
                                                '73b2rvhg' /* Estágio do projeto */,
                                              ),
                                              icon: Icon(
                                                Icons.percent,
                                                size: 18.0,
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
                                                    BorderRadius.circular(12.0),
                                              ),
                                            ),
                                          ),
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
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Column(
                                      mainAxisSize: MainAxisSize.max,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisSize: MainAxisSize.max,
                                          children: [
                                            if ((_model.fieldId != 0) &&
                                                responsiveVisibility(
                                                  context: context,
                                                  phone: false,
                                                ))
                                              Builder(
                                                builder: (context) =>
                                                    FlutterFlowDropDown<int>(
                                                  controller: _model
                                                          .dropCampoValueController ??=
                                                      FormFieldController<int>(
                                                    _model.dropCampoValue ??=
                                                        _model.fieldId,
                                                  ),
                                                  options: List<int>.from(
                                                      (_model.jsonFieldRef
                                                              .map((e) =>
                                                                  getJsonField(
                                                                    e,
                                                                    r'''$.id''',
                                                                  ))
                                                              .toList() as List)
                                                          .cast<int>()),
                                                  optionLabels: _model
                                                      .jsonFieldRef
                                                      .map((e) => getJsonField(
                                                            e,
                                                            r'''$.name''',
                                                          ))
                                                      .toList()
                                                      .map((e) => e.toString())
                                                      .toList(),
                                                  onChanged: (val) async {
                                                    safeSetState(() => _model
                                                        .dropCampoValue = val);
                                                    var _shouldSetState = false;
                                                    _model.fieldId =
                                                        _model.dropCampoValue!;
                                                    safeSetState(() {});
                                                    FFAppState().jsonRowsRef =
                                                        [];
                                                    FFAppState()
                                                        .filtroIdsStatusStakes = [];
                                                    FFAppState()
                                                        .filtroIdsStatusTracker = [];
                                                    FFAppState()
                                                        .filtroIdsTypeTracker = [];
                                                    safeSetState(() {});
                                                    FFAppState().esqueleto1 =
                                                        true;
                                                    FFAppState().esqueleto2 =
                                                        true;
                                                    safeSetState(() {});
                                                    _model.listSections =
                                                        await ApiCallResponse(null, {}, 200); // Dummy API Response

                                                    _shouldSetState = true;
                                                    if ((_model.listSections
                                                            ?.succeeded ??
                                                        true)) {
                                                      _model.jsonSectionsRef =
                                                          (_model.listSections
                                                                      ?.jsonBody ??
                                                                  '')
                                                              .toList()
                                                              .cast<dynamic>();
                                                      _model.sectionsId =
                                                          valueOrDefault<int>(
                                                        getJsonField(
                                                          (_model.listSections
                                                                  ?.jsonBody ??
                                                              ''),
                                                          r'''$[0].id''',
                                                        ),
                                                        0,
                                                      );
                                                      safeSetState(() {});
                                                      _model.listRowsField =
                                                          await ApiCallResponse(null, {}, 200); // Dummy API Response

                                                      _shouldSetState = true;
                                                      if ((_model.listRowsField
                                                              ?.succeeded ??
                                                          true)) {
                                                        FFAppState()
                                                            .jsonRowsRef = ((_model
                                                                        .listRowsField
                                                                        ?.jsonBody ??
                                                                    '')
                                                                .toList()
                                                                .map<MapTrackersStruct?>(
                                                                    MapTrackersStruct
                                                                        .maybeFromMap)
                                                                .toList() as Iterable<MapTrackersStruct?>)
                                                            .withoutNulls
                                                            .toList()
                                                            .cast<MapTrackersStruct>();
                                                        safeSetState(() {});
                                                          _model.rowslist = [];
                                                        safeSetState(() {});
                                                        _model.returnAction2 =
                                                            await actions
                                                                .actRetornaValidacaoStatusStake(
                                                          FFAppState()
                                                              .jsonRowsRef
                                                              .toList(),
                                                          _model.sectionsId,
                                                        );
                                                        _shouldSetState = true;
                                                        FFAppState()
                                                            .esqueleto1 = false;
                                                        FFAppState()
                                                            .esqueleto2 = false;
                                                        FFAppState()
                                                                .actionReturn =
                                                            false;
                                                        safeSetState(() {});
                                                        if (_shouldSetState)
                                                          safeSetState(() {});
                                                        return;
                                                      } else {
                                                        FFAppState()
                                                            .esqueleto1 = false;
                                                        FFAppState()
                                                            .esqueleto2 = false;
                                                        safeSetState(() {});
                                                        await showDialog(
                                                          context: context,
                                                          builder:
                                                              (dialogContext) {
                                                            return Dialog(
                                                              elevation: 0,
                                                              insetPadding:
                                                                  EdgeInsets
                                                                      .zero,
                                                              backgroundColor:
                                                                  Colors
                                                                      .transparent,
                                                              alignment: AlignmentDirectional(
                                                                      0.0, 0.0)
                                                                  .resolve(
                                                                      Directionality.of(
                                                                          context)),
                                                              child:
                                                                  GestureDetector(
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
                                                                    ModalInfoWidget(
                                                                  title: 'Erro',
                                                                  description:
                                                                      getJsonField(
                                                                    (_model.listRowsField
                                                                            ?.jsonBody ??
                                                                        ''),
                                                                    r'''$.message''',
                                                                  ).toString(),
                                                                ),
                                                              ),
                                                            );
                                                          },
                                                        );

                                                        if (_shouldSetState)
                                                          safeSetState(() {});
                                                        return;
                                                      }
                                                    } else {
                                                      FFAppState().esqueleto1 =
                                                          false;
                                                      FFAppState().esqueleto2 =
                                                          false;
                                                      safeSetState(() {});
                                                      await showDialog(
                                                        context: context,
                                                        builder:
                                                            (dialogContext) {
                                                          return Dialog(
                                                            elevation: 0,
                                                            insetPadding:
                                                                EdgeInsets.zero,
                                                            backgroundColor:
                                                                Colors
                                                                    .transparent,
                                                            alignment: AlignmentDirectional(
                                                                    0.0, 0.0)
                                                                .resolve(
                                                                    Directionality.of(
                                                                        context)),
                                                            child:
                                                                GestureDetector(
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
                                                                  ModalInfoWidget(
                                                                title: 'Erro',
                                                                description:
                                                                    getJsonField(
                                                                  (_model.listSections
                                                                          ?.jsonBody ??
                                                                      ''),
                                                                  r'''$.message''',
                                                                ).toString(),
                                                              ),
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
                                                  width: 260.0,
                                                  height: 40.0,
                                                  maxHeight: 220.0,
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
                                                  hintText: FFLocalizations.of(
                                                          context)
                                                      .getText(
                                                    'b3ju6sta' /* Selecione um campo */,
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
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .primaryBackground,
                                                  elevation: 2.0,
                                                  borderColor:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .alternate,
                                                  borderWidth: 1.0,
                                                  borderRadius: 12.0,
                                                  margin: EdgeInsetsDirectional
                                                      .fromSTEB(
                                                          12.0, 0.0, 12.0, 0.0),
                                                  hidesUnderline: true,
                                                  isOverButton: false,
                                                  isSearchable: false,
                                                  isMultiSelect: false,
                                                ),
                                              ),
                                            if (_model.fieldId != 0)
                                              Builder(
                                                builder: (context) =>
                                                    FFButtonWidget(
                                                  onPressed: () async {
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
                                                              Colors
                                                                  .transparent,
                                                          alignment: AlignmentDirectional(
                                                                  0.0, 0.0)
                                                              .resolve(
                                                                  Directionality.of(
                                                                      context)),
                                                          child:
                                                              GestureDetector(
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
                                                                ModalEditarLoteSelecionadoWidget(
                                                              fieldId: _model
                                                                  .fieldId,
                                                            ),
                                                          ),
                                                        );
                                                      },
                                                    );
                                                  },
                                                  text: FFLocalizations.of(
                                                          context)
                                                      .getText(
                                                    'b78se9b5' /* Editar campo selecionado */,
                                                  ),
                                                  icon: Icon(
                                                    Icons.edit,
                                                    size: 18.0,
                                                  ),
                                                  options: FFButtonOptions(
                                                    height: 40.0,
                                                    padding:
                                                        EdgeInsetsDirectional
                                                            .fromSTEB(16.0, 0.0,
                                                                16.0, 0.0),
                                                    iconPadding:
                                                        EdgeInsetsDirectional
                                                            .fromSTEB(0.0, 0.0,
                                                                0.0, 0.0),
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .secondary,
                                                    textStyle:
                                                        FlutterFlowTheme.of(
                                                                context)
                                                            .labelMedium
                                                            .override(
                                                              font: GoogleFonts
                                                                  .lexend(
                                                                fontWeight: FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelMedium
                                                                    .fontWeight,
                                                                fontStyle: FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelMedium
                                                                    .fontStyle,
                                                              ),
                                                              color: FlutterFlowTheme
                                                                      .of(context)
                                                                  .primary,
                                                              letterSpacing:
                                                                  0.0,
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
                                                    hoverColor:
                                                        FlutterFlowTheme.of(
                                                                context)
                                                            .hoverNavBar,
                                                    hoverBorderSide: BorderSide(
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .hoverNavBar,
                                                      width: 1.0,
                                                    ),
                                                    hoverTextColor:
                                                        FlutterFlowTheme.of(
                                                                context)
                                                            .secondaryBackground,
                                                  ),
                                                ),
                                              ),
                                            Builder(
                                              builder: (context) =>
                                                  FFButtonWidget(
                                                onPressed: () async {
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
                                                              ModalNovoCampoWidget(),
                                                        ),
                                                      );
                                                    },
                                                  );
                                                },
                                                text:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  'ebrtl9sd' /* Criar novo campo */,
                                                ),
                                                icon: Icon(
                                                  Icons.add_circle,
                                                  size: 18.0,
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
                                                          12.0),
                                                ),
                                              ),
                                            ),
                                          ].divide(SizedBox(width: 12.0)),
                                        ),
                                        Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Row(
                                              mainAxisSize: MainAxisSize.max,
                                              children: [
                                                Icon(
                                                  Icons.filter_list,
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .secondaryText,
                                                  size: 24.0,
                                                ),
                                                Text(
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    'owucvzy1' /* Filtros */,
                                                  ),
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .bodyMedium
                                                      .override(
                                                        font:
                                                            GoogleFonts.lexend(
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
                                            Builder(
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
                                                              FiltroStatusFundacaoWidget(
                                                            sectionId: _model
                                                                .sectionsId,
                                                          ),
                                                        ),
                                                      );
                                                    },
                                                  );
                                                },
                                                child: Container(
                                                  height: 36.0,
                                                  decoration: BoxDecoration(
                                                    color: FFAppState()
                                                            .filtroIdsStatusStakes
                                                            .isNotEmpty
                                                        ? FlutterFlowTheme.of(
                                                                context)
                                                            .status03
                                                        : FlutterFlowTheme.of(
                                                                context)
                                                            .secondaryBackground,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            24.0),
                                                    border: Border.all(
                                                      color: FFAppState()
                                                              .filtroIdsStatusStakes
                                                              .isNotEmpty
                                                          ? FlutterFlowTheme.of(
                                                                  context)
                                                              .primary
                                                          : FlutterFlowTheme.of(
                                                                  context)
                                                              .alternate,
                                                      width: 1.0,
                                                    ),
                                                  ),
                                                  child: Padding(
                                                    padding:
                                                        EdgeInsetsDirectional
                                                            .fromSTEB(16.0, 0.0,
                                                                16.0, 0.0),
                                                    child: Row(
                                                      mainAxisSize:
                                                          MainAxisSize.min,
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .center,
                                                      children: [
                                                        Text(
                                                          FFLocalizations.of(
                                                                  context)
                                                              .getText(
                                                            'fgae0o2g' /* Status estacas */,
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
                                                                          .w500,
                                                                  fontStyle: FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontStyle,
                                                                ),
                                                                color: FlutterFlowTheme.of(
                                                                        context)
                                                                    .secondaryText,
                                                                letterSpacing:
                                                                    0.0,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w500,
                                                                fontStyle: FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontStyle,
                                                              ),
                                                        ),
                                                        Icon(
                                                          Icons
                                                              .keyboard_arrow_down,
                                                          color: FlutterFlowTheme
                                                                  .of(context)
                                                              .secondaryText,
                                                          size: 18.0,
                                                        ),
                                                      ].divide(SizedBox(
                                                          width: 12.0)),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ),
                                            SingleChildScrollView(
                                              scrollDirection: Axis.horizontal,
                                              child: Row(
                                                mainAxisSize: MainAxisSize.max,
                                                children: [
                                                  Builder(
                                                    builder: (context) =>
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
                                                        await showAlignedDialog(
                                                          barrierColor: Colors
                                                              .transparent,
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
                                                                      -1.0,
                                                                      -1.0)
                                                                  .resolve(
                                                                      Directionality.of(
                                                                          context)),
                                                          builder:
                                                              (dialogContext) {
                                                            return Material(
                                                              color: Colors
                                                                  .transparent,
                                                              child:
                                                                  GestureDetector(
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
                                                                    FiltroStatusTrackersWidget(
                                                                  sectionsId: _model
                                                                      .sectionsId,
                                                                ),
                                                              ),
                                                            );
                                                          },
                                                        );
                                                      },
                                                      child: Container(
                                                        height: 36.0,
                                                        decoration:
                                                            BoxDecoration(
                                                          color: FFAppState()
                                                                  .filtroIdsStatusTracker
                                                                  .isNotEmpty
                                                              ? FlutterFlowTheme
                                                                      .of(
                                                                          context)
                                                                  .status03
                                                              : FlutterFlowTheme
                                                                      .of(context)
                                                                  .secondaryBackground,
                                                          borderRadius:
                                                              BorderRadius
                                                                  .circular(
                                                                      24.0),
                                                          border: Border.all(
                                                            color: FFAppState()
                                                                    .filtroIdsStatusTracker
                                                                    .isNotEmpty
                                                                ? FlutterFlowTheme.of(
                                                                        context)
                                                                    .primary
                                                                : FlutterFlowTheme.of(
                                                                        context)
                                                                    .alternate,
                                                            width: 1.0,
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
                                                                    .min,
                                                            crossAxisAlignment:
                                                                CrossAxisAlignment
                                                                    .center,
                                                            children: [
                                                              Text(
                                                                FFLocalizations.of(
                                                                        context)
                                                                    .getText(
                                                                  'vq0s3krz' /* Status tracker */,
                                                                ),
                                                                style: FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .override(
                                                                      font: GoogleFonts
                                                                          .lexend(
                                                                        fontWeight:
                                                                            FontWeight.w500,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .labelSmall
                                                                            .fontStyle,
                                                                      ),
                                                                      color: FlutterFlowTheme.of(
                                                                              context)
                                                                          .secondaryText,
                                                                      letterSpacing:
                                                                          0.0,
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w500,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .fontStyle,
                                                                    ),
                                                              ),
                                                              Icon(
                                                                Icons
                                                                    .keyboard_arrow_down,
                                                                color: FlutterFlowTheme.of(
                                                                        context)
                                                                    .secondaryText,
                                                                size: 18.0,
                                                              ),
                                                            ].divide(SizedBox(
                                                                width: 12.0)),
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                  Builder(
                                                    builder: (context) =>
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
                                                        await showAlignedDialog(
                                                          barrierColor: Colors
                                                              .transparent,
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
                                                                      -1.0,
                                                                      -1.0)
                                                                  .resolve(
                                                                      Directionality.of(
                                                                          context)),
                                                          builder:
                                                              (dialogContext) {
                                                            return Material(
                                                              color: Colors
                                                                  .transparent,
                                                              child:
                                                                  GestureDetector(
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
                                                                    FiltroTipodeTrackerWidget(
                                                                  sectionId: _model
                                                                      .sectionsId,
                                                                ),
                                                              ),
                                                            );
                                                          },
                                                        );
                                                      },
                                                      child: Container(
                                                        height: 36.0,
                                                        decoration:
                                                            BoxDecoration(
                                                          color: FFAppState()
                                                                  .filtroIdsTypeTracker
                                                                  .isNotEmpty
                                                              ? FlutterFlowTheme
                                                                      .of(
                                                                          context)
                                                                  .status03
                                                              : FlutterFlowTheme
                                                                      .of(context)
                                                                  .secondaryBackground,
                                                          borderRadius:
                                                              BorderRadius
                                                                  .circular(
                                                                      24.0),
                                                          border: Border.all(
                                                            color: FFAppState()
                                                                    .filtroIdsTypeTracker
                                                                    .isNotEmpty
                                                                ? FlutterFlowTheme.of(
                                                                        context)
                                                                    .primary
                                                                : FlutterFlowTheme.of(
                                                                        context)
                                                                    .alternate,
                                                            width: 1.0,
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
                                                                    .min,
                                                            crossAxisAlignment:
                                                                CrossAxisAlignment
                                                                    .center,
                                                            children: [
                                                              Text(
                                                                FFLocalizations.of(
                                                                        context)
                                                                    .getText(
                                                                  '603gso23' /* Tipo de tracker */,
                                                                ),
                                                                style: FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .override(
                                                                      font: GoogleFonts
                                                                          .lexend(
                                                                        fontWeight:
                                                                            FontWeight.w500,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .labelSmall
                                                                            .fontStyle,
                                                                      ),
                                                                      color: FlutterFlowTheme.of(
                                                                              context)
                                                                          .secondaryText,
                                                                      letterSpacing:
                                                                          0.0,
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w500,
                                                                      fontStyle: FlutterFlowTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .fontStyle,
                                                                    ),
                                                              ),
                                                              Icon(
                                                                Icons
                                                                    .keyboard_arrow_down,
                                                                color: FlutterFlowTheme.of(
                                                                        context)
                                                                    .secondaryText,
                                                                size: 18.0,
                                                              ),
                                                            ].divide(SizedBox(
                                                                width: 12.0)),
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ].divide(SizedBox(width: 8.0)),
                                              ),
                                            ),
                                            if ((FFAppState()
                                                    .filtroIdsStatusStakes
                                                    .isNotEmpty) ||
                                                (FFAppState()
                                                    .filtroIdsStatusTracker
                                                    .isNotEmpty) ||
                                                (FFAppState()
                                                    .filtroIdsTypeTracker
                                                    .isNotEmpty))
                                              Builder(
                                                builder: (context) =>
                                                    FFButtonWidget(
                                                  onPressed: () async {
                                                    var _shouldSetState = false;
                                                    FFAppState()
                                                        .filtroIdsStatusStakes = [];
                                                    FFAppState()
                                                        .filtroIdsStatusTracker = [];
                                                    FFAppState()
                                                        .filtroIdsTypeTracker = [];
                                                    safeSetState(() {});
                                                    _model.listRowsDeleteFilter =
                                                        await ApiCallResponse(null, {}, 200); // Dummy API Response

                                                    _shouldSetState = true;
                                                    if ((_model
                                                            .listRowsDeleteFilter
                                                            ?.succeeded ??
                                                        true)) {
                                                      FFAppState()
                                                          .jsonRowsRef = ((_model
                                                                      .listRowsDeleteFilter
                                                                      ?.jsonBody ??
                                                                  '')
                                                              .toList()
                                                              .map<MapTrackersStruct?>(
                                                                  MapTrackersStruct
                                                                      .maybeFromMap)
                                                              .toList() as Iterable<MapTrackersStruct?>)
                                                          .withoutNulls
                                                          .toList()
                                                          .cast<MapTrackersStruct>();
                                                      FFAppState()
                                                          .update(() {});
                                                      _model.returnActionDelete =
                                                          await actions
                                                              .actRetornaValidacaoStatusStake(
                                                        FFAppState()
                                                            .jsonRowsRef
                                                            .toList(),
                                                        _model.sectionsId,
                                                      );
                                                      _shouldSetState = true;
                                                      FFAppState().esqueleto1 =
                                                          false;
                                                      FFAppState().esqueleto2 =
                                                          false;
                                                      FFAppState()
                                                              .actionReturn =
                                                          _model
                                                              .returnActionDelete!;
                                                      safeSetState(() {});
                                                      if (_shouldSetState)
                                                        safeSetState(() {});
                                                      return;
                                                    } else {
                                                      FFAppState().esqueleto2 =
                                                          false;
                                                      safeSetState(() {});
                                                      await showDialog(
                                                        context: context,
                                                        builder:
                                                            (dialogContext) {
                                                          return Dialog(
                                                            elevation: 0,
                                                            insetPadding:
                                                                EdgeInsets.zero,
                                                            backgroundColor:
                                                                Colors
                                                                    .transparent,
                                                            alignment: AlignmentDirectional(
                                                                    0.0, 0.0)
                                                                .resolve(
                                                                    Directionality.of(
                                                                        context)),
                                                            child:
                                                                GestureDetector(
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
                                                                  ModalInfoWidget(
                                                                title: 'Erro',
                                                                description:
                                                                    getJsonField(
                                                                  (_model.listRowsDeleteFilter
                                                                          ?.jsonBody ??
                                                                      ''),
                                                                  r'''$.message''',
                                                                ).toString(),
                                                              ),
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
                                                  text: FFLocalizations.of(
                                                          context)
                                                      .getText(
                                                    'jgh9k659' /* Limpar */,
                                                  ),
                                                  icon: Icon(
                                                    Icons.filter_list_off,
                                                    size: 15.0,
                                                  ),
                                                  options: FFButtonOptions(
                                                    height: 30.0,
                                                    padding:
                                                        EdgeInsetsDirectional
                                                            .fromSTEB(16.0, 0.0,
                                                                16.0, 0.0),
                                                    iconPadding:
                                                        EdgeInsetsDirectional
                                                            .fromSTEB(0.0, 0.0,
                                                                0.0, 0.0),
                                                    iconColor:
                                                        FlutterFlowTheme.of(
                                                                context)
                                                            .error,
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .status05,
                                                    textStyle:
                                                        FlutterFlowTheme.of(
                                                                context)
                                                            .labelSmall
                                                            .override(
                                                              font: GoogleFonts
                                                                  .lexend(
                                                                fontWeight: FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontWeight,
                                                                fontStyle: FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontStyle,
                                                              ),
                                                              color: FlutterFlowTheme
                                                                      .of(context)
                                                                  .error,
                                                              letterSpacing:
                                                                  0.0,
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
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .error,
                                                      width: 1.0,
                                                    ),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            24.0),
                                                  ),
                                                ),
                                              ),
                                          ].divide(SizedBox(width: 12.0)),
                                        ),
                                      ].divide(SizedBox(height: 16.0)),
                                    ),
                                    Row(
                                      mainAxisSize: MainAxisSize.max,
                                      children: [
                                        ClipRRect(
                                          borderRadius:
                                              BorderRadius.circular(8.0),
                                          child: Image.asset(
                                            'assets/images/Gemini_Generated_Image_kflrtdkflrtdkflr.jpg',
                                            width: 195.0,
                                            height: 115.0,
                                            fit: BoxFit.contain,
                                          ),
                                        ),
                                        Align(
                                          alignment:
                                              AlignmentDirectional(1.0, -1.0),
                                          child: Builder(
                                            builder: (context) =>
                                                FlutterFlowIconButton(
                                              borderColor:
                                                  FlutterFlowTheme.of(context)
                                                      .primary,
                                              borderRadius: 8.0,
                                              buttonSize: 32.0,
                                              fillColor:
                                                  FlutterFlowTheme.of(context)
                                                      .status03,
                                              icon: FaIcon(
                                                FontAwesomeIcons.infoCircle,
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .primary,
                                                size: 16.0,
                                              ),
                                              onPressed: () async {
                                                await showAlignedDialog(
                                                  barrierColor:
                                                      Colors.transparent,
                                                  context: context,
                                                  isGlobal: false,
                                                  avoidOverflow: true,
                                                  targetAnchor:
                                                      AlignmentDirectional(
                                                              1.0, 1.0)
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
                                                      color: Colors.transparent,
                                                      child: GestureDetector(
                                                        onTap: () {
                                                          FocusScope.of(
                                                                  dialogContext)
                                                              .unfocus();
                                                          FocusManager.instance
                                                              .primaryFocus
                                                              ?.unfocus();
                                                        },
                                                        child:
                                                            StatusStakesWidget(),
                                                      ),
                                                    );
                                                  },
                                                );
                                              },
                                            ),
                                          ),
                                        ),
                                      ].divide(SizedBox(width: 24.0)),
                                    ),
                                  ],
                                ),
                                Column(
                                  mainAxisSize: MainAxisSize.min,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (_model.fieldId != 0)
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Builder(
                                            builder: (context) =>
                                                FFButtonWidget(
                                              onPressed: () async {
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
                                                          FocusManager.instance
                                                              .primaryFocus
                                                              ?.unfocus();
                                                        },
                                                        child:
                                                            ModalAddNovaSecaoWidget(
                                                          fieldId: _model
                                                              .dropCampoValue!,
                                                        ),
                                                      ),
                                                    );
                                                  },
                                                );
                                              },
                                              text: FFLocalizations.of(context)
                                                  .getText(
                                                'ya2jpgal' /* Nova seção */,
                                              ),
                                              icon: Icon(
                                                Icons.add_circle,
                                                size: 18.0,
                                              ),
                                              options: FFButtonOptions(
                                                height: 36.0,
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        16.0, 0.0, 16.0, 0.0),
                                                iconPadding:
                                                    EdgeInsetsDirectional
                                                        .fromSTEB(
                                                            0.0, 0.0, 0.0, 0.0),
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .secondaryBackground,
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
                                                elevation: 0.0,
                                                borderRadius:
                                                    BorderRadius.circular(8.0),
                                              ),
                                            ),
                                          ),
                                          Flexible(
                                            child: Stack(
                                              children: [
                                                if (!FFAppState().esqueleto1)
                                                  Builder(
                                                    builder: (context) {
                                                      final listAllSections =
                                                          _model.jsonSectionsRef
                                                              .toList();

                                                      return SingleChildScrollView(
                                                        scrollDirection:
                                                            Axis.horizontal,
                                                        child: Row(
                                                          mainAxisSize:
                                                              MainAxisSize.max,
                                                          children: List.generate(
                                                              listAllSections
                                                                  .length,
                                                              (listAllSectionsIndex) {
                                                            final listAllSectionsItem =
                                                                listAllSections[
                                                                    listAllSectionsIndex];
                                                            return Builder(
                                                              builder:
                                                                  (context) =>
                                                                      InkWell(
                                                                splashColor: Colors
                                                                    .transparent,
                                                                focusColor: Colors
                                                                    .transparent,
                                                                hoverColor: Colors
                                                                    .transparent,
                                                                highlightColor:
                                                                    Colors
                                                                        .transparent,
                                                                onTap:
                                                                    () async {
                                                                  var _shouldSetState =
                                                                      false;
                                                                  _model.sectionsId =
                                                                      valueOrDefault<
                                                                          int>(
                                                                    getJsonField(
                                                                      listAllSectionsItem,
                                                                      r'''$.id''',
                                                                    ),
                                                                    0,
                                                                  );
                                                                  _model.sectionNumber =
                                                                      valueOrDefault<
                                                                          int>(
                                                                    getJsonField(
                                                                      listAllSectionsItem,
                                                                      r'''$.section_number''',
                                                                    ),
                                                                    0,
                                                                  );
                                                                  safeSetState(
                                                                      () {});
                                                                  FFAppState()
                                                                          .esqueleto2 =
                                                                      true;
                                                                  FFAppState()
                                                                      .jsonRowsRef = [];
                                                                  safeSetState(
                                                                      () {});
                                                                  _model.listRows =
                                                                      await ApiCallResponse(null, {}, 200); // Dummy API Response

                                                                  _shouldSetState =
                                                                      true;
                                                                  if ((_model
                                                                          .listRows
                                                                          ?.succeeded ??
                                                                      true)) {
                                                                    FFAppState()
                                                                        .jsonRowsRef = ((_model.listRows?.jsonBody ??
                                                                                '')
                                                                            .toList()
                                                                            .map<MapTrackersStruct?>(MapTrackersStruct.maybeFromMap)
                                                                            .toList() as Iterable<MapTrackersStruct?>)
                                                                        .withoutNulls
                                                                        .toList()
                                                                        .cast<MapTrackersStruct>();
                                                                    safeSetState(
                                                                        () {});
                                                                    _model.rowslist = [];
                                                                    safeSetState(
                                                                        () {});
                                                                    _model.returnAction3 =
                                                                        await actions
                                                                            .actRetornaValidacaoStatusStake(
                                                                      FFAppState()
                                                                          .jsonRowsRef
                                                                          .toList(),
                                                                      getJsonField(
                                                                        listAllSectionsItem,
                                                                        r'''$.id''',
                                                                      ),
                                                                    );
                                                                    _shouldSetState =
                                                                        true;
                                                                    FFAppState()
                                                                            .esqueleto1 =
                                                                        false;
                                                                    FFAppState()
                                                                            .esqueleto2 =
                                                                        false;
                                                                    FFAppState()
                                                                            .actionReturn =
                                                                        _model
                                                                            .returnAction3!;
                                                                    safeSetState(
                                                                        () {});
                                                                    if (_shouldSetState)
                                                                      safeSetState(
                                                                          () {});
                                                                    return;
                                                                  } else {
                                                                    FFAppState()
                                                                            .esqueleto2 =
                                                                        false;
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
                                                                                ModalInfoWidget(
                                                                              title: 'Erro',
                                                                              description: getJsonField(
                                                                                (_model.listRows?.jsonBody ?? ''),
                                                                                r'''$.message''',
                                                                              ).toString(),
                                                                            ),
                                                                          ),
                                                                        );
                                                                      },
                                                                    );

                                                                    if (_shouldSetState)
                                                                      safeSetState(
                                                                          () {});
                                                                    return;
                                                                  }

                                                                  if (_shouldSetState)
                                                                    safeSetState(
                                                                        () {});
                                                                },
                                                                child:
                                                                    Container(
                                                                  width: 150.0,
                                                                  height: 36.0,
                                                                  decoration:
                                                                      BoxDecoration(
                                                                    color: _model
                                                                                .sectionsId ==
                                                                            getJsonField(
                                                                              listAllSectionsItem,
                                                                              r'''$.id''',
                                                                            )
                                                                        ? FlutterFlowTheme.of(context)
                                                                            .primary
                                                                        : FlutterFlowTheme.of(context)
                                                                            .secondary,
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
                                                                      topRight:
                                                                          Radius.circular(
                                                                              8.0),
                                                                    ),
                                                                    border:
                                                                        Border
                                                                            .all(
                                                                      color: FlutterFlowTheme.of(
                                                                              context)
                                                                          .alternate,
                                                                      width:
                                                                          0.5,
                                                                    ),
                                                                  ),
                                                                  child:
                                                                      Padding(
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
                                                                      mainAxisAlignment:
                                                                          MainAxisAlignment
                                                                              .spaceBetween,
                                                                      children:
                                                                          [
                                                                        Text(
                                                                          'Seção ${valueOrDefault<String>(
                                                                            getJsonField(
                                                                              listAllSectionsItem,
                                                                              r'''$.section_number''',
                                                                            )?.toString(),
                                                                            'N/A',
                                                                          )}',
                                                                          style: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .override(
                                                                                font: GoogleFonts.lexend(
                                                                                  fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                  fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                ),
                                                                                color: _model.sectionsId ==
                                                                                        getJsonField(
                                                                                          listAllSectionsItem,
                                                                                          r'''$.id''',
                                                                                        )
                                                                                    ? FlutterFlowTheme.of(context).info
                                                                                    : FlutterFlowTheme.of(context).primaryText,
                                                                                letterSpacing: 0.0,
                                                                                fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                              ),
                                                                        ),
                                                                        if (_model.sectionsId ==
                                                                            getJsonField(
                                                                              listAllSectionsItem,
                                                                              r'''$.id''',
                                                                            ))
                                                                          Builder(
                                                                            builder: (context) =>
                                                                                InkWell(
                                                                              splashColor: Colors.transparent,
                                                                              focusColor: Colors.transparent,
                                                                              hoverColor: Colors.transparent,
                                                                              highlightColor: Colors.transparent,
                                                                              onTap: () async {
                                                                                _model.listIdsRowsTracker = await actions.actGetIdsRowsTracker(
                                                                                  FFAppState().jsonRowsRef.toList(),
                                                                                  getJsonField(
                                                                                    listAllSectionsItem,
                                                                                    r'''$.id''',
                                                                                  ),
                                                                                );
                                                                                _model.listIdsRow = await actions.actGetIdsRows(
                                                                                  FFAppState().jsonRowsRef.toList(),
                                                                                  getJsonField(
                                                                                    listAllSectionsItem,
                                                                                    r'''$.id''',
                                                                                  ),
                                                                                );
                                                                                _model.sectionsId = getJsonField(
                                                                                  listAllSectionsItem,
                                                                                  r'''$.id''',
                                                                                );
                                                                                safeSetState(() {});
                                                                                await showAlignedDialog(
                                                                                  barrierColor: Colors.transparent,
                                                                                  context: context,
                                                                                  isGlobal: false,
                                                                                  avoidOverflow: false,
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
                                                                                        child: OptionsSecaoWidget(
                                                                                          sectionsId: getJsonField(
                                                                                            listAllSectionsItem,
                                                                                            r'''$.id''',
                                                                                          ),
                                                                                          actionReturn: FFAppState().actionReturn,
                                                                                          fieldId: widget!.fieldsId != null ? widget!.fieldsId! : _model.fieldId,
                                                                                          rowsTrackerId: _model.listIdsRowsTracker,
                                                                                          id: getJsonField(
                                                                                            listAllSectionsItem,
                                                                                            r'''$.id''',
                                                                                          ),
                                                                                          listIndex: _model.jsonSectionsRef,
                                                                                          rowsId: _model.listIdsRow,
                                                                                        ),
                                                                                      ),
                                                                                    );
                                                                                  },
                                                                                );

                                                                                safeSetState(() {});
                                                                              },
                                                                              child: Icon(
                                                                                Icons.keyboard_control,
                                                                                color: _model.sectionsId ==
                                                                                        getJsonField(
                                                                                          listAllSectionsItem,
                                                                                          r'''$.id''',
                                                                                        )
                                                                                    ? FlutterFlowTheme.of(context).info
                                                                                    : FlutterFlowTheme.of(context).primaryText,
                                                                                size: 20.0,
                                                                              ),
                                                                            ),
                                                                          ),
                                                                      ].divide(SizedBox(
                                                                              width: 8.0)),
                                                                    ),
                                                                  ),
                                                                ),
                                                              ),
                                                            );
                                                          }),
                                                        ),
                                                      );
                                                    },
                                                  ),
                                                wrapWithModel(
                                                  model: _model.esqueleto1Model,
                                                  updateCallback: () =>
                                                      safeSetState(() {}),
                                                  child: Esqueleto1Widget(),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ].divide(SizedBox(width: 4.0)),
                                      ),
                                    if (FFAppState().jsonRowsRef.isNotEmpty)
                                      Container(
                                        width: double.infinity,
                                        height: 40.0,
                                        decoration: BoxDecoration(
                                          color: FlutterFlowTheme.of(context)
                                              .primaryBackground,
                                          borderRadius: BorderRadius.only(
                                            bottomLeft: Radius.circular(0.0),
                                            bottomRight: Radius.circular(0.0),
                                            topLeft: Radius.circular(0.0),
                                            topRight: Radius.circular(0.0),
                                          ),
                                        ),
                                        child: Padding(
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  16.0, 0.0, 16.0, 0.0),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.max,
                                            mainAxisAlignment:
                                                MainAxisAlignment.start,
                                            children: [
                                              Container(
                                                width: 44.0,
                                                decoration: BoxDecoration(),
                                                child: Visibility(
                                                  visible: responsiveVisibility(
                                                    context: context,
                                                    phone: false,
                                                    tablet: false,
                                                  ),
                                                  child: Text(
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                      'hdb45xjx' /* Fileira */,
                                                    ),
                                                    style: FlutterFlowTheme.of(
                                                            context)
                                                        .labelSmall
                                                        .override(
                                                          font: GoogleFonts
                                                              .lexend(
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
                                                  ),
                                                ),
                                              ),
                                              if (responsiveVisibility(
                                                context: context,
                                                phone: false,
                                                tablet: false,
                                              ))
                                                Text(
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    'ks6gd3z7' /* Trackers */,
                                                  ),
                                                  style: FlutterFlowTheme.of(
                                                          context)
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
                                                ),
                                              Row(
                                                mainAxisSize: MainAxisSize.max,
                                                children: [
                                                  Padding(
                                                    padding:
                                                        EdgeInsetsDirectional
                                                            .fromSTEB(8.0, 0.0,
                                                                0.0, 0.0),
                                                    child: Icon(
                                                      Icons.info,
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .primary,
                                                      size: 18.0,
                                                    ),
                                                  ),
                                                  if (responsiveVisibility(
                                                    context: context,
                                                    phone: false,
                                                    tablet: false,
                                                  ))
                                                    Text(
                                                      FFLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'mogrb6bx' /* Atenção: os números em ordem i... */,
                                                      ),
                                                      style:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .override(
                                                                font:
                                                                    GoogleFonts
                                                                        .lexend(
                                                                  fontWeight: FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontWeight,
                                                                  fontStyle: FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontStyle,
                                                                ),
                                                                letterSpacing:
                                                                    0.0,
                                                                fontWeight: FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontWeight,
                                                                fontStyle: FlutterFlowTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontStyle,
                                                              ),
                                                    ),
                                                ].divide(SizedBox(width: 8.0)),
                                              ),
                                            ].divide(SizedBox(width: 8.0)),
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                                Row(
                                  mainAxisSize: MainAxisSize.max,
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          0.0, 0.0, 16.0, 0.0),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.max,
                                        children: [
                                          Container(
                                            height: 36.0,
                                            decoration: BoxDecoration(
                                              borderRadius:
                                                  BorderRadius.circular(8.0),
                                            ),
                                            alignment:
                                                AlignmentDirectional(0.0, 0.0),
                                            child: Padding(
                                              padding: EdgeInsetsDirectional
                                                  .fromSTEB(
                                                      0.0, 0.0, 12.0, 0.0),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.max,
                                                children: [
                                                  Row(
                                                    mainAxisSize:
                                                        MainAxisSize.max,
                                                    children: [
                                                      if (!FFAppState()
                                                          .actionReturn)
                                                        Container(
                                                          width: 18.0,
                                                          height: 18.0,
                                                          decoration:
                                                              BoxDecoration(
                                                            borderRadius:
                                                                BorderRadius
                                                                    .circular(
                                                                        4.0),
                                                          ),
                                                        ),
                                                      if ((FFAppState()
                                                              .jsonRowsRef
                                                              .isNotEmpty) &&
                                                          !(_model.setsIds
                                                              .isNotEmpty) &&
                                                          FFAppState()
                                                              .actionReturn)
                                                        InkWell(
                                                          splashColor: Colors
                                                              .transparent,
                                                          focusColor: Colors
                                                              .transparent,
                                                          hoverColor: Colors
                                                              .transparent,
                                                          highlightColor: Colors
                                                              .transparent,
                                                          onTap: () async {
                                                            _model.setsIds =
                                                                FFAppState()
                                                                    .jsonRowsRef
                                                                    .map((e) =>
                                                                        e.id)
                                                                    .toList()
                                                                    .cast<
                                                                        int>();
                                                            safeSetState(() {});
                                                            _model.checkBox =
                                                                false;
                                                            safeSetState(() {});
                                                          },
                                                          child: Container(
                                                            width: 18.0,
                                                            height: 18.0,
                                                            decoration:
                                                                BoxDecoration(
                                                              color: FlutterFlowTheme
                                                                      .of(context)
                                                                  .secondaryBackground,
                                                              borderRadius:
                                                                  BorderRadius
                                                                      .circular(
                                                                          4.0),
                                                              border:
                                                                  Border.all(
                                                                color: FlutterFlowTheme.of(
                                                                        context)
                                                                    .alternate,
                                                                width: 2.0,
                                                              ),
                                                            ),
                                                          ),
                                                        ),
                                                      if (FFAppState()
                                                              .actionReturn &&
                                                          (_model.setsIds
                                                              .isNotEmpty))
                                                        InkWell(
                                                          splashColor: Colors
                                                              .transparent,
                                                          focusColor: Colors
                                                              .transparent,
                                                          hoverColor: Colors
                                                              .transparent,
                                                          highlightColor: Colors
                                                              .transparent,
                                                          onTap: () async {
                                                            _model.setsIds = [];
                                                            safeSetState(() {});
                                                          },
                                                          child: Container(
                                                            width: 18.0,
                                                            height: 18.0,
                                                            decoration:
                                                                BoxDecoration(
                                                              color: FlutterFlowTheme
                                                                      .of(context)
                                                                  .primary,
                                                              borderRadius:
                                                                  BorderRadius
                                                                      .circular(
                                                                          4.0),
                                                              border:
                                                                  Border.all(
                                                                color: FlutterFlowTheme.of(
                                                                        context)
                                                                    .primary,
                                                                width: 2.0,
                                                              ),
                                                            ),
                                                            alignment:
                                                                AlignmentDirectional(
                                                                    0.0, 0.0),
                                                            child: Stack(
                                                              alignment:
                                                                  AlignmentDirectional(
                                                                      0.0, 0.0),
                                                              children: [
                                                                if (_model
                                                                    .checkBox)
                                                                  Container(
                                                                    width: 10.0,
                                                                    height: 2.0,
                                                                    decoration:
                                                                        BoxDecoration(
                                                                      color: FlutterFlowTheme.of(
                                                                              context)
                                                                          .info,
                                                                      borderRadius:
                                                                          BorderRadius.circular(
                                                                              8.0),
                                                                    ),
                                                                  ),
                                                                if (!_model
                                                                    .checkBox)
                                                                  Icon(
                                                                    Icons
                                                                        .check_rounded,
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .info,
                                                                    size: 12.0,
                                                                  ),
                                                              ],
                                                            ),
                                                          ),
                                                        ),
                                                    ],
                                                  ),
                                                  if (_model.setsIds.isNotEmpty)
                                                    Padding(
                                                      padding:
                                                          EdgeInsetsDirectional
                                                              .fromSTEB(
                                                                  4.0,
                                                                  0.0,
                                                                  0.0,
                                                                  0.0),
                                                      child: Text(
                                                        '${valueOrDefault<String>(
                                                          _model.setsIds.length
                                                              .toString(),
                                                          '0',
                                                        )} / ${valueOrDefault<String>(
                                                          FFAppState()
                                                              .jsonRowsRef
                                                              .length
                                                              .toString(),
                                                          '0',
                                                        )}',
                                                        style:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .override(
                                                                  font: GoogleFonts
                                                                      .lexend(
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w600,
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
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w600,
                                                                  fontStyle: FlutterFlowTheme.of(
                                                                          context)
                                                                      .bodyMedium
                                                                      .fontStyle,
                                                                ),
                                                      ),
                                                    ),
                                                  if (_model.setsIds.isNotEmpty)
                                                    Padding(
                                                      padding:
                                                          EdgeInsetsDirectional
                                                              .fromSTEB(
                                                                  0.0,
                                                                  0.0,
                                                                  4.0,
                                                                  0.0),
                                                      child: Text(
                                                        FFLocalizations.of(
                                                                context)
                                                            .getText(
                                                          'n9ck3all' /* Fileiras selecionadas */,
                                                        ),
                                                        style:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .bodySmall
                                                                .override(
                                                                  font: GoogleFonts
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
                                                                  color: FlutterFlowTheme.of(
                                                                          context)
                                                                      .primary,
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
                                                    ),
                                                  if (_model.setsIds.isNotEmpty)
                                                    Builder(
                                                      builder: (context) =>
                                                          FlutterFlowIconButton(
                                                        borderColor:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .error,
                                                        borderRadius: 8.0,
                                                        borderWidth: 1.0,
                                                        buttonSize: 36.0,
                                                        fillColor:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .status05,
                                                        icon: Icon(
                                                          Icons.delete_forever,
                                                          color: FlutterFlowTheme
                                                                  .of(context)
                                                              .error,
                                                          size: 18.0,
                                                        ),
                                                        onPressed: () async {
                                                          await showDialog(
                                                            barrierColor: Colors
                                                                .transparent,
                                                            context: context,
                                                            builder:
                                                                (dialogContext) {
                                                              return Dialog(
                                                                elevation: 0,
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
                                                                        Directionality.of(
                                                                            context)),
                                                                child:
                                                                    GestureDetector(
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
                                                                      ModalConfirmDeleteWidget(
                                                                    title:
                                                                        'Remover fileiras da seção',
                                                                    description:
                                                                        'Essa ação irá remover todas as fileiras.',
                                                                    actionAPi:
                                                                        () async {
                                                                      _model.listIdsRowsTrackerCheckBox =
                                                                          await actions
                                                                              .actGetIdsRowsTracker(
                                                                        FFAppState()
                                                                            .jsonRowsRef
                                                                            .toList(),
                                                                        _model
                                                                            .sectionsId,
                                                                      );
                                                                      _model.listIdsRowCheckBox =
                                                                          await actions
                                                                              .actGetIdsRows(
                                                                        FFAppState()
                                                                            .jsonRowsRef
                                                                            .toList(),
                                                                        _model
                                                                            .sectionsId,
                                                                      );
                                                                      while (_model
                                                                              .contador <
                                                                          _model
                                                                              .setsIds
                                                                              .length) {
                                                                        _model.deleteRowsTrackersSectionCheckBox = null; // API Call Removed

                                                                        if ((_model.deleteRowsTrackersSectionCheckBox?.succeeded ??
                                                                            true)) {
                                                                          _model.contador =
                                                                              _model.contador + 1;
                                                                          safeSetState(
                                                                              () {});
                                                                        } else {
                                                                          _model.contador =
                                                                              _model.contador + 1;
                                                                          safeSetState(
                                                                              () {});
                                                                        }
                                                                      }
                                                                    },
                                                                    actionPage:
                                                                        () async {
                                                                      context
                                                                          .pushNamed(
                                                                        ModulosTrackersMapWidget
                                                                            .routeName,
                                                                        queryParameters:
                                                                            {
                                                                          'sectionsId':
                                                                              serializeParam(
                                                                            _model.sectionsId,
                                                                            ParamType.int,
                                                                          ),
                                                                          'fieldsId':
                                                                              serializeParam(
                                                                            _model.fieldId,
                                                                            ParamType.int,
                                                                          ),
                                                                        }.withoutNulls,
                                                                        extra: <String,
                                                                            dynamic>{
                                                                          kTransitionInfoKey:
                                                                              TransitionInfo(
                                                                            hasTransition:
                                                                                true,
                                                                            transitionType:
                                                                                PageTransitionType.fade,
                                                                            duration:
                                                                                Duration(milliseconds: 0),
                                                                          ),
                                                                        },
                                                                      );
                                                                    },
                                                                  ),
                                                                ),
                                                              );
                                                            },
                                                          );

                                                          safeSetState(() {});
                                                        },
                                                      ),
                                                    ),
                                                ].divide(SizedBox(width: 4.0)),
                                              ),
                                            ),
                                          ),
                                          if (!FFAppState().esqueleto2 &&
                                              (_model
                                                  .jsonSectionsRef.isNotEmpty))
                                            Builder(
                                              builder: (context) => InkWell(
                                                splashColor: Colors.transparent,
                                                focusColor: Colors.transparent,
                                                hoverColor: Colors.transparent,
                                                highlightColor:
                                                    Colors.transparent,
                                                onTap: () async {
                                                  FFAppState()
                                                      .addFileiraTracker = [];
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
                                                              ModalAddNovaRowWidget(
                                                            fieldId:
                                                                _model.fieldId,
                                                            sectionsId: _model
                                                                .sectionsId,
                                                          ),
                                                        ),
                                                      );
                                                    },
                                                  );
                                                },
                                                child: Container(
                                                  height: 40.0,
                                                  decoration: BoxDecoration(
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .primary,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            8.0),
                                                    border: Border.all(
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .primary,
                                                    ),
                                                  ),
                                                  alignment:
                                                      AlignmentDirectional(
                                                          0.0, 0.0),
                                                  child: Padding(
                                                    padding:
                                                        EdgeInsetsDirectional
                                                            .fromSTEB(12.0, 0.0,
                                                                12.0, 0.0),
                                                    child: Row(
                                                      mainAxisSize:
                                                          MainAxisSize.max,
                                                      children: [
                                                        Column(
                                                          mainAxisSize:
                                                              MainAxisSize.max,
                                                          mainAxisAlignment:
                                                              MainAxisAlignment
                                                                  .center,
                                                          children: [
                                                            Icon(
                                                              Icons.add_circle,
                                                              color: FlutterFlowTheme
                                                                      .of(context)
                                                                  .info,
                                                              size: 16.0,
                                                            ),
                                                          ],
                                                        ),
                                                        Text(
                                                          FFLocalizations.of(
                                                                  context)
                                                              .getText(
                                                            'rc6qacnq' /* Adicionar fileira(s) */,
                                                          ),
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
                                                                color: FlutterFlowTheme.of(
                                                                        context)
                                                                    .secondary,
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
                                                      ].divide(SizedBox(
                                                          width: 12.0)),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ),
                                        ].divide(SizedBox(width: 8.0)),
                                      ),
                                    ),
                                    if (!FFAppState().esqueleto2 &&
                                        (FFAppState().jsonRowsRef.isNotEmpty))
                                      Builder(
                                        builder: (context) => FFButtonWidget(
                                          onPressed: () async {
                                            var _shouldSetState = false;
                                            _model.retornoApi = null; // API Call Removed
                                            
                                            _shouldSetState = true;
                                            if ((_model.retornoApi?.succeeded ??
                                                true)) {
                                              await actions
                                                  .gerarPdfMapaTrackers(
                                                [], // Empty list
                                                FFAppState().projectsInfo.name,
                                                getJsonField(
                                                  _model
                                                      .jsonFieldRef.firstOrNull,
                                                  r'''$.name''',
                                                ).toString(),
                                              );
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
                                                    child: GestureDetector(
                                                      onTap: () {
                                                        FocusScope.of(
                                                                dialogContext)
                                                            .unfocus();
                                                        FocusManager.instance
                                                            .primaryFocus
                                                            ?.unfocus();
                                                      },
                                                      child: ModalInfoWidget(
                                                        title: 'Erro',
                                                        description:
                                                            getJsonField(
                                                          (_model.retornoApi
                                                                  ?.jsonBody ??
                                                              ''),
                                                          r'''$.message''',
                                                        ).toString(),
                                                      ),
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
                                          text: FFLocalizations.of(context)
                                              .getText(
                                            'li4qroax' /* Exportar PDF do mapa de tracke... */,
                                          ),
                                          icon: Icon(
                                            Icons.download,
                                            size: 18.0,
                                          ),
                                          options: FFButtonOptions(
                                            height: 40.0,
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    16.0, 0.0, 16.0, 0.0),
                                            iconPadding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    0.0, 0.0, 0.0, 0.0),
                                            color: FlutterFlowTheme.of(context)
                                                .secondaryBackground,
                                            textStyle:
                                                FlutterFlowTheme.of(context)
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
                                            elevation: 0.0,
                                            borderSide: BorderSide(
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .alternate,
                                              width: 0.5,
                                            ),
                                            borderRadius:
                                                BorderRadius.circular(12.0),
                                            hoverColor:
                                                FlutterFlowTheme.of(context)
                                                    .hoverNavBar,
                                            hoverBorderSide: BorderSide(
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .hoverNavBar,
                                              width: 0.5,
                                            ),
                                            hoverTextColor:
                                                FlutterFlowTheme.of(context)
                                                    .secondaryBackground,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                                if (!FFAppState().esqueleto2 &&
                                    (FFAppState().jsonRowsRef.isNotEmpty))
                                  SingleChildScrollView(
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Builder(
                                          builder: (context) {
                                            final listAllRows = FFAppState()
                                                .jsonRowsRef
                                                .toList();

                                            return ListView.builder(
                                              padding: EdgeInsets.zero,
                                              primary: false,
                                              shrinkWrap: true,
                                              scrollDirection: Axis.vertical,
                                              itemCount: listAllRows.length,
                                              itemBuilder:
                                                  (context, listAllRowsIndex) {
                                                final listAllRowsItem =
                                                    listAllRows[
                                                        listAllRowsIndex];
                                                return Padding(
                                                  padding: EdgeInsetsDirectional
                                                      .fromSTEB(
                                                          0.0, 8.0, 0.0, 0.0),
                                                  child: Container(
                                                    decoration: BoxDecoration(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              12.0),
                                                    ),
                                                    child: Padding(
                                                      padding:
                                                          EdgeInsetsDirectional
                                                              .fromSTEB(
                                                                  0.0,
                                                                  0.0,
                                                                  16.0,
                                                                  0.0),
                                                      child: Row(
                                                        mainAxisSize:
                                                            MainAxisSize.max,
                                                        children: [
                                                          Row(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .max,
                                                            children: [
                                                              if (!FFAppState()
                                                                  .actionReturn)
                                                                Container(
                                                                  width: 18.0,
                                                                  height: 18.0,
                                                                  decoration:
                                                                      BoxDecoration(
                                                                    borderRadius:
                                                                        BorderRadius.circular(
                                                                            4.0),
                                                                  ),
                                                                ),
                                                              if (!_model
                                                                  .setsIds
                                                                  .contains(
                                                                      listAllRowsItem
                                                                          .id))
                                                                InkWell(
                                                                  splashColor:
                                                                      Colors
                                                                          .transparent,
                                                                  focusColor: Colors
                                                                      .transparent,
                                                                  hoverColor: Colors
                                                                      .transparent,
                                                                  highlightColor:
                                                                      Colors
                                                                          .transparent,
                                                                  onTap:
                                                                      () async {
                                                                    _model.addToSetsIds(
                                                                        listAllRowsItem
                                                                            .id);
                                                                    safeSetState(
                                                                        () {});
                                                                    _model.checkBox =
                                                                        true;
                                                                    safeSetState(
                                                                        () {});
                                                                  },
                                                                  child:
                                                                      Container(
                                                                    width: 18.0,
                                                                    height:
                                                                        18.0,
                                                                    decoration:
                                                                        BoxDecoration(
                                                                      color: FlutterFlowTheme.of(
                                                                              context)
                                                                          .secondaryBackground,
                                                                      borderRadius:
                                                                          BorderRadius.circular(
                                                                              4.0),
                                                                      border:
                                                                          Border
                                                                              .all(
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .alternate,
                                                                        width:
                                                                            2.0,
                                                                      ),
                                                                    ),
                                                                  ),
                                                                ),
                                                              if (_model.setsIds
                                                                  .contains(
                                                                      listAllRowsItem
                                                                          .id))
                                                                InkWell(
                                                                  splashColor:
                                                                      Colors
                                                                          .transparent,
                                                                  focusColor: Colors
                                                                      .transparent,
                                                                  hoverColor: Colors
                                                                      .transparent,
                                                                  highlightColor:
                                                                      Colors
                                                                          .transparent,
                                                                  onTap:
                                                                      () async {
                                                                    _model.removeFromSetsIds(
                                                                        listAllRowsItem
                                                                            .id);
                                                                    safeSetState(
                                                                        () {});
                                                                    _model.checkBox =
                                                                        false;
                                                                    safeSetState(
                                                                        () {});
                                                                  },
                                                                  child:
                                                                      Container(
                                                                    width: 18.0,
                                                                    height:
                                                                        18.0,
                                                                    decoration:
                                                                        BoxDecoration(
                                                                      color: FlutterFlowTheme.of(
                                                                              context)
                                                                          .primary,
                                                                      borderRadius:
                                                                          BorderRadius.circular(
                                                                              4.0),
                                                                      border:
                                                                          Border
                                                                              .all(
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .primary,
                                                                        width:
                                                                            2.0,
                                                                      ),
                                                                    ),
                                                                    alignment:
                                                                        AlignmentDirectional(
                                                                            0.0,
                                                                            0.0),
                                                                    child: Icon(
                                                                      Icons
                                                                          .check_rounded,
                                                                      color: FlutterFlowTheme.of(
                                                                              context)
                                                                          .info,
                                                                      size:
                                                                          12.0,
                                                                    ),
                                                                  ),
                                                                ),
                                                            ],
                                                          ),
                                                          Builder(
                                                            builder:
                                                                (context) =>
                                                                    InkWell(
                                                              splashColor: Colors
                                                                  .transparent,
                                                              focusColor: Colors
                                                                  .transparent,
                                                              hoverColor: Colors
                                                                  .transparent,
                                                              highlightColor:
                                                                  Colors
                                                                      .transparent,
                                                              onTap: () async {
                                                                var _shouldSetState =
                                                                    false;
                                                                if ((FFAppState().filtroIdsStatusStakes.isNotEmpty) ||
                                                                    (FFAppState()
                                                                        .filtroIdsStatusTracker
                                                                        .isNotEmpty) ||
                                                                    (FFAppState()
                                                                        .filtroIdsTypeTracker
                                                                        .isNotEmpty)) {
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
                                                                              ModalInfoWidget(
                                                                            title:
                                                                                'Limpeza de filtros necessária',
                                                                            description:
                                                                                'Para criar ou editar o tracker, é necessário limpar os filtros ativos.',
                                                                          ),
                                                                        ),
                                                                      );
                                                                    },
                                                                  );

                                                                  if (_shouldSetState)
                                                                    safeSetState(
                                                                        () {});
                                                                  return;
                                                                }
                                                                FFAppState()
                                                                    .addFileiraTracker = [];
                                                                FFAppState()
                                                                    .setIds = [];
                                                                safeSetState(
                                                                    () {});
                                                                if (listAllRowsItem
                                                                    .listRowsTrackers
                                                                    .where((e) =>
                                                                        e.deletedAt ==
                                                                        0)
                                                                    .toList()
                                                                    .isNotEmpty) {
                                                                  _model.returnaticon =
                                                                      await actions
                                                                          .actAddInfosTracker(
                                                                    FFAppState()
                                                                        .addFileiraTracker
                                                                        .toList(),
                                                                    FFAppState()
                                                                        .jsonRowsRef
                                                                        .toList(),
                                                                    listAllRowsItem
                                                                        .id,
                                                                  );
                                                                  _shouldSetState =
                                                                      true;
                                                                  _model.deleteChecktracker =
                                                                      await actions
                                                                          .checkStakesStatusRow(
                                                                    listAllRowsItem
                                                                        .listRowsTrackers
                                                                        .toList(),
                                                                  );
                                                                  _shouldSetState =
                                                                      true;
                                                                  FFAppState().addFileiraTracker = _model
                                                                      .returnaticon!
                                                                      .toList()
                                                                      .cast<
                                                                          DropSelect1Struct>();
                                                                  FFAppState()
                                                                      .addToSetIds(
                                                                          listAllRowsItem
                                                                              .id);
                                                                  FFAppState()
                                                                      .addToIdsExistentes(
                                                                          listAllRowsItem
                                                                              .id);
                                                                  safeSetState(
                                                                      () {});
                                                                } else {
                                                                  FFAppState()
                                                                      .addToSetIds(
                                                                          listAllRowsItem
                                                                              .id);
                                                                  safeSetState(
                                                                      () {});
                                                                }

                                                                await showDialog(
                                                                  barrierColor:
                                                                      Color(
                                                                          0x80000000),
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
                                                                            ModalAddFileiraWidget(
                                                                          typePage: listAllRowsItem.listRowsTrackers.isNotEmpty
                                                                              ? 'edit'
                                                                              : 'creat',
                                                                          row: listAllRowsItem
                                                                              .rowNumber,
                                                                          sections:
                                                                              _model.sectionNumber!,
                                                                          rowRef:
                                                                              FFAppState().jsonRowsRef,
                                                                          fieldId:
                                                                              _model.fieldId,
                                                                          sectionNumber: widget!.sectionNumber != null
                                                                              ? widget!.sectionNumber!
                                                                              : _model.sectionNumber!,
                                                                          sectionsId:
                                                                              _model.sectionsId,
                                                                          rowId:
                                                                              listAllRowsItem.id,
                                                                          listRowsTrackers: listAllRowsItem
                                                                              .listRowsTrackers
                                                                              .map((e) => e.id)
                                                                              .toList(),
                                                                          trackerslistEmpty:
                                                                              listAllRowsItem.listRowsTrackers,
                                                                          check:
                                                                              _model.deleteChecktracker,
                                                                        ),
                                                                      ),
                                                                    );
                                                                  },
                                                                );

                                                                if (_shouldSetState)
                                                                  safeSetState(
                                                                      () {});
                                                              },
                                                              child: Container(
                                                                width: 44.0,
                                                                height: 110.0,
                                                                decoration:
                                                                    BoxDecoration(
                                                                  color: FlutterFlowTheme.of(
                                                                          context)
                                                                      .secondary,
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .circular(
                                                                              8.0),
                                                                  border: Border
                                                                      .all(
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .primary,
                                                                  ),
                                                                ),
                                                                alignment:
                                                                    AlignmentDirectional(
                                                                        0.0,
                                                                        0.0),
                                                                child: Column(
                                                                  mainAxisSize:
                                                                      MainAxisSize
                                                                          .max,
                                                                  mainAxisAlignment:
                                                                      MainAxisAlignment
                                                                          .center,
                                                                  children: [
                                                                    Padding(
                                                                      padding: EdgeInsetsDirectional.fromSTEB(
                                                                          4.0,
                                                                          0.0,
                                                                          4.0,
                                                                          0.0),
                                                                      child:
                                                                          Text(
                                                                        valueOrDefault<
                                                                            String>(
                                                                          listAllRowsItem
                                                                              .rowNumber
                                                                              .toString(),
                                                                          '-',
                                                                        ),
                                                                        textAlign:
                                                                            TextAlign.start,
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
                                                                      ),
                                                                    ),
                                                                    if ((listAllRowsItem
                                                                            .listRowsTrackers
                                                                            .where((e) =>
                                                                                e.deletedAt ==
                                                                                0)
                                                                            .toList()
                                                                            .isNotEmpty) &&
                                                                        !(FFAppState()
                                                                            .filtroIdsStatusStakes
                                                                            .isNotEmpty) &&
                                                                        !(FFAppState()
                                                                            .filtroIdsStatusTracker
                                                                            .isNotEmpty) &&
                                                                        !(FFAppState()
                                                                            .filtroIdsTypeTracker
                                                                            .isNotEmpty))
                                                                      Icon(
                                                                        Icons
                                                                            .edit,
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .primary,
                                                                        size:
                                                                            18.0,
                                                                      ),
                                                                    if (!(listAllRowsItem
                                                                            .listRowsTrackers
                                                                            .where((e) =>
                                                                                e.deletedAt ==
                                                                                0)
                                                                            .toList()
                                                                            .isNotEmpty) &&
                                                                        ((FFAppState().filtroIdsStatusTracker.isNotEmpty) ||
                                                                            (FFAppState().filtroIdsTypeTracker.isNotEmpty) ||
                                                                            !(FFAppState().filtroIdsStatusStakes.isNotEmpty)))
                                                                      Icon(
                                                                        Icons
                                                                            .add_circle,
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .primary,
                                                                        size:
                                                                            16.0,
                                                                      ),
                                                                  ],
                                                                ),
                                                              ),
                                                            ),
                                                          ),
                                                          if (!(listAllRowsItem
                                                                  .listRowsTrackers
                                                                  .where((e) =>
                                                                      e.deletedAt ==
                                                                      0)
                                                                  .toList()
                                                                  .isNotEmpty) &&
                                                              !((FFAppState()
                                                                      .filtroIdsStatusTracker
                                                                      .isNotEmpty) ||
                                                                  (FFAppState()
                                                                      .filtroIdsTypeTracker
                                                                      .isNotEmpty)))
                                                            Row(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .min,
                                                              children: [
                                                                Padding(
                                                                  padding: EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          16.0,
                                                                          0.0,
                                                                          0.0,
                                                                          0.0),
                                                                  child: Icon(
                                                                    Icons.info,
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .primary,
                                                                    size: 24.0,
                                                                  ),
                                                                ),
                                                                Text(
                                                                  FFLocalizations.of(
                                                                          context)
                                                                      .getText(
                                                                    'wvvy4x2r' /* Clique na fileira para configu... */,
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
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontStyle,
                                                                      ),
                                                                ),
                                                              ].divide(SizedBox(
                                                                  width: 8.0)),
                                                            ),
                                                          if (!(listAllRowsItem
                                                                  .listRowsTrackers
                                                                  .where((e) =>
                                                                      e.deletedAt ==
                                                                      0)
                                                                  .toList()
                                                                  .isNotEmpty) &&
                                                              ((FFAppState()
                                                                      .filtroIdsStatusTracker
                                                                      .isNotEmpty) ||
                                                                  (FFAppState()
                                                                      .filtroIdsTypeTracker
                                                                      .isNotEmpty)))
                                                            Row(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .min,
                                                              children: [
                                                                Padding(
                                                                  padding: EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          16.0,
                                                                          0.0,
                                                                          0.0,
                                                                          0.0),
                                                                  child: Icon(
                                                                    Icons.info,
                                                                    color: FlutterFlowTheme.of(
                                                                            context)
                                                                        .primary,
                                                                    size: 24.0,
                                                                  ),
                                                                ),
                                                                Text(
                                                                  FFLocalizations.of(
                                                                          context)
                                                                      .getText(
                                                                    'a29j0viv' /* Nenhum dado foi encontrado. */,
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
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontStyle,
                                                                      ),
                                                                ),
                                                              ].divide(SizedBox(
                                                                  width: 8.0)),
                                                            ),
                                                          if (listAllRowsItem
                                                              .listRowsTrackers
                                                              .where((e) =>
                                                                  e.deletedAt ==
                                                                  0)
                                                              .toList()
                                                              .isNotEmpty)
                                                            Flexible(
                                                              child: Padding(
                                                                padding:
                                                                    EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            0.0,
                                                                            4.0,
                                                                            0.0,
                                                                            4.0),
                                                                child: Builder(
                                                                  builder:
                                                                      (context) {
                                                                    final listRowaTrackers = listAllRowsItem
                                                                        .listRowsTrackers
                                                                        .where((e) =>
                                                                            e.deletedAt ==
                                                                            0)
                                                                        .toList();

                                                                    return SingleChildScrollView(
                                                                      scrollDirection:
                                                                          Axis.horizontal,
                                                                      child:
                                                                          Row(
                                                                        mainAxisSize:
                                                                            MainAxisSize.max,
                                                                        children: List.generate(
                                                                            listRowaTrackers.length,
                                                                            (listRowaTrackersIndex) {
                                                                          final listRowaTrackersItem =
                                                                              listRowaTrackers[listRowaTrackersIndex];
                                                                          return Container(
                                                                            height:
                                                                                110.0,
                                                                            decoration:
                                                                                BoxDecoration(
                                                                              color: FlutterFlowTheme.of(context).primaryBackground,
                                                                              borderRadius: BorderRadius.circular(12.0),
                                                                              border: Border.all(
                                                                                color: FlutterFlowTheme.of(context).alternate,
                                                                              ),
                                                                            ),
                                                                            child:
                                                                                Padding(
                                                                              padding: EdgeInsets.all(12.0),
                                                                              child: Column(
                                                                                mainAxisSize: MainAxisSize.min,
                                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                                children: [
                                                                                  Row(
                                                                                    mainAxisSize: MainAxisSize.max,
                                                                                    children: [
                                                                                      Container(
                                                                                        decoration: BoxDecoration(
                                                                                          color: FlutterFlowTheme.of(context).secondaryBackground,
                                                                                          shape: BoxShape.circle,
                                                                                          border: Border.all(
                                                                                            color: FlutterFlowTheme.of(context).alternate,
                                                                                          ),
                                                                                        ),
                                                                                        child: Padding(
                                                                                          padding: EdgeInsets.all(4.0),
                                                                                          child: Text(
                                                                                            valueOrDefault<String>(
                                                                                              listRowaTrackersItem.position,
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
                                                                                          ),
                                                                                        ),
                                                                                      ),
                                                                                      Row(
                                                                                        mainAxisSize: MainAxisSize.min,
                                                                                        children: [
                                                                                          Text(
                                                                                            valueOrDefault<String>(
                                                                                              listRowaTrackersItem.trackers.trackersTypes.type,
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
                                                                                          ),
                                                                                          Text(
                                                                                            FFLocalizations.of(context).getText(
                                                                                              'b7dicpck' /* | */,
                                                                                            ),
                                                                                            style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                                  font: GoogleFonts.lexend(
                                                                                                    fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                    fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                  ),
                                                                                                  color: FlutterFlowTheme.of(context).secondaryText,
                                                                                                  letterSpacing: 0.0,
                                                                                                  fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                  fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                ),
                                                                                          ),
                                                                                          Text(
                                                                                            valueOrDefault<String>(
                                                                                              listRowaTrackersItem.trackers.manufacturers.name,
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
                                                                                          ),
                                                                                        ].divide(SizedBox(width: 8.0)),
                                                                                      ),
                                                                                      Text(
                                                                                        FFLocalizations.of(context).getText(
                                                                                          'dr227nci' /* | */,
                                                                                        ),
                                                                                        style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                              font: GoogleFonts.lexend(
                                                                                                fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                              ),
                                                                                              color: FlutterFlowTheme.of(context).secondaryText,
                                                                                              letterSpacing: 0.0,
                                                                                              fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                              fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                            ),
                                                                                      ),
                                                                                      if (listRowaTrackersItem.rowsTrackersStatusesId == FFAppConstants.um)
                                                                                        Container(
                                                                                          decoration: BoxDecoration(
                                                                                            color: FlutterFlowTheme.of(context).status01,
                                                                                            borderRadius: BorderRadius.circular(100.0),
                                                                                            border: Border.all(
                                                                                              color: FlutterFlowTheme.of(context).secondaryText,
                                                                                            ),
                                                                                          ),
                                                                                          child: Padding(
                                                                                            padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                            child: Text(
                                                                                              FFLocalizations.of(context).getText(
                                                                                                '8xczedn2' /* Aguardando estacas */,
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
                                                                                          ),
                                                                                        ),
                                                                                      if (listRowaTrackersItem.rowsTrackersStatusesId == FFAppConstants.dois)
                                                                                        Container(
                                                                                          decoration: BoxDecoration(
                                                                                            color: FlutterFlowTheme.of(context).status06,
                                                                                            borderRadius: BorderRadius.circular(100.0),
                                                                                            border: Border.all(
                                                                                              color: FlutterFlowTheme.of(context).tertiary,
                                                                                            ),
                                                                                          ),
                                                                                          child: Padding(
                                                                                            padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                            child: Text(
                                                                                              FFLocalizations.of(context).getText(
                                                                                                '4mfr23m0' /* Problema, mas liberado para mo... */,
                                                                                              ),
                                                                                              style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                                    font: GoogleFonts.lexend(
                                                                                                      fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                      fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                    ),
                                                                                                    color: FlutterFlowTheme.of(context).tertiary,
                                                                                                    letterSpacing: 0.0,
                                                                                                    fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                    fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                  ),
                                                                                            ),
                                                                                          ),
                                                                                        ),
                                                                                      if (listRowaTrackersItem.rowsTrackersStatusesId == FFAppConstants.quatro)
                                                                                        Container(
                                                                                          decoration: BoxDecoration(
                                                                                            color: FlutterFlowTheme.of(context).status03,
                                                                                            borderRadius: BorderRadius.circular(100.0),
                                                                                            border: Border.all(
                                                                                              color: FlutterFlowTheme.of(context).primary,
                                                                                            ),
                                                                                          ),
                                                                                          child: Padding(
                                                                                            padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                            child: Text(
                                                                                              FFLocalizations.of(context).getText(
                                                                                                'yr95zncq' /* Liberado para montagem */,
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
                                                                                          ),
                                                                                        ),
                                                                                      if (listRowaTrackersItem.rowsTrackersStatusesId == FFAppConstants.cinco)
                                                                                        Container(
                                                                                          decoration: BoxDecoration(
                                                                                            color: FlutterFlowTheme.of(context).status04,
                                                                                            borderRadius: BorderRadius.circular(100.0),
                                                                                            border: Border.all(
                                                                                              color: FlutterFlowTheme.of(context).success,
                                                                                            ),
                                                                                          ),
                                                                                          child: Padding(
                                                                                            padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                            child: Text(
                                                                                              FFLocalizations.of(context).getText(
                                                                                                '509lqh74' /* Tracker e módulos instalados */,
                                                                                              ),
                                                                                              style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                                    font: GoogleFonts.lexend(
                                                                                                      fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                      fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                    ),
                                                                                                    color: FlutterFlowTheme.of(context).success,
                                                                                                    letterSpacing: 0.0,
                                                                                                    fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                    fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                  ),
                                                                                            ),
                                                                                          ),
                                                                                        ),
                                                                                      if (listRowaTrackersItem.rowsTrackersStatusesId == FFAppConstants.tres)
                                                                                        Container(
                                                                                          decoration: BoxDecoration(
                                                                                            color: FlutterFlowTheme.of(context).status05,
                                                                                            borderRadius: BorderRadius.circular(100.0),
                                                                                            border: Border.all(
                                                                                              color: FlutterFlowTheme.of(context).error,
                                                                                            ),
                                                                                          ),
                                                                                          child: Padding(
                                                                                            padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                            child: Text(
                                                                                              FFLocalizations.of(context).getText(
                                                                                                'em1j2pe4' /* Impedido para montagem */,
                                                                                              ),
                                                                                              style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                                    font: GoogleFonts.lexend(
                                                                                                      fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                      fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                    ),
                                                                                                    color: FlutterFlowTheme.of(context).error,
                                                                                                    letterSpacing: 0.0,
                                                                                                    fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                    fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                  ),
                                                                                            ),
                                                                                          ),
                                                                                        ),
                                                                                    ].divide(SizedBox(width: 8.0)),
                                                                                  ),
                                                                                  Row(
                                                                                    mainAxisSize: MainAxisSize.max,
                                                                                    children: [
                                                                                      Builder(
                                                                                        builder: (context) {
                                                                                          final listStakes = listRowaTrackersItem.listTrackersStakes.where((e) => e.deletedAt == 0).toList();

                                                                                          return Row(
                                                                                            mainAxisSize: MainAxisSize.max,
                                                                                            children: List.generate(listStakes.length, (listStakesIndex) {
                                                                                              final listStakesItem = listStakes[listStakesIndex];
                                                                                              return Column(
                                                                                                mainAxisSize: MainAxisSize.max,
                                                                                                crossAxisAlignment: CrossAxisAlignment.center,
                                                                                                children: [
                                                                                                  Row(
                                                                                                    mainAxisSize: MainAxisSize.max,
                                                                                                    mainAxisAlignment: MainAxisAlignment.start,
                                                                                                    children: [
                                                                                                      if (FFAppConstants.um == listStakesItem.stakes.stakesTypesId)
                                                                                                        HeavyMotorPierWidget(
                                                                                                          key: Key('Keyuuu_${listStakesIndex}_of_${listStakes.length}'),
                                                                                                          color: () {
                                                                                                            if (FFAppConstants.um == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).secondaryText;
                                                                                                            } else if (FFAppConstants.dois == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).primary;
                                                                                                            } else if (FFAppConstants.tres == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).tertiary;
                                                                                                            } else if (FFAppConstants.quatro == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).error;
                                                                                                            } else if (FFAppConstants.cinco == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).success;
                                                                                                            } else {
                                                                                                              return FlutterFlowTheme.of(context).secondaryText;
                                                                                                            }
                                                                                                          }(),
                                                                                                          status: listStakesItem.stakesStatuses.status,
                                                                                                        ),
                                                                                                      if (FFAppConstants.dois == listStakesItem.stakes.stakesTypesId)
                                                                                                        HeavyArrayPierWidget(
                                                                                                          key: Key('Keyflk_${listStakesIndex}_of_${listStakes.length}'),
                                                                                                          color: () {
                                                                                                            if (FFAppConstants.um == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).alternate;
                                                                                                            } else if (FFAppConstants.dois == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).status03;
                                                                                                            } else if (FFAppConstants.tres == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).status06;
                                                                                                            } else if (FFAppConstants.quatro == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).status05;
                                                                                                            } else if (FFAppConstants.cinco == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).status04;
                                                                                                            } else {
                                                                                                              return FlutterFlowTheme.of(context).secondaryText;
                                                                                                            }
                                                                                                          }(),
                                                                                                          borderColor: () {
                                                                                                            if (FFAppConstants.um == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).secondaryText;
                                                                                                            } else if (FFAppConstants.dois == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).primary;
                                                                                                            } else if (FFAppConstants.tres == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).tertiary;
                                                                                                            } else if (FFAppConstants.quatro == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).error;
                                                                                                            } else if (FFAppConstants.cinco == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).success;
                                                                                                            } else {
                                                                                                              return FlutterFlowTheme.of(context).secondaryText;
                                                                                                            }
                                                                                                          }(),
                                                                                                          status: listStakesItem.stakesStatuses.status,
                                                                                                        ),
                                                                                                      if (FFAppConstants.tres == listStakesItem.stakes.stakesTypesId)
                                                                                                        HeavyArrayPierEdgeWidget(
                                                                                                          key: Key('Keydm3_${listStakesIndex}_of_${listStakes.length}'),
                                                                                                          color: () {
                                                                                                            if (FFAppConstants.um == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).secondaryText;
                                                                                                            } else if (FFAppConstants.dois == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).primary;
                                                                                                            } else if (FFAppConstants.tres == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).tertiary;
                                                                                                            } else if (FFAppConstants.quatro == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).error;
                                                                                                            } else if (FFAppConstants.cinco == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).success;
                                                                                                            } else {
                                                                                                              return FlutterFlowTheme.of(context).secondaryText;
                                                                                                            }
                                                                                                          }(),
                                                                                                          status: listStakesItem.stakesStatuses.status,
                                                                                                        ),
                                                                                                      if (FFAppConstants.quatro == listStakesItem.stakes.stakesTypesId)
                                                                                                        StandartMotorPierWidget(
                                                                                                          key: Key('Keygez_${listStakesIndex}_of_${listStakes.length}'),
                                                                                                          color: () {
                                                                                                            if (FFAppConstants.um == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).secondaryText;
                                                                                                            } else if (FFAppConstants.dois == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).primary;
                                                                                                            } else if (FFAppConstants.tres == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).tertiary;
                                                                                                            } else if (FFAppConstants.quatro == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).error;
                                                                                                            } else if (FFAppConstants.cinco == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).success;
                                                                                                            } else {
                                                                                                              return FlutterFlowTheme.of(context).secondaryText;
                                                                                                            }
                                                                                                          }(),
                                                                                                          status: listStakesItem.stakesStatuses.status,
                                                                                                        ),
                                                                                                      if (FFAppConstants.cinco == listStakesItem.stakes.stakesTypesId)
                                                                                                        StandartArrayPierWidget(
                                                                                                          key: Key('Keyc3n_${listStakesIndex}_of_${listStakes.length}'),
                                                                                                          color: () {
                                                                                                            if (FFAppConstants.um == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).alternate;
                                                                                                            } else if (FFAppConstants.dois == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).status03;
                                                                                                            } else if (FFAppConstants.tres == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).status06;
                                                                                                            } else if (FFAppConstants.quatro == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).status05;
                                                                                                            } else if (FFAppConstants.cinco == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).status04;
                                                                                                            } else {
                                                                                                              return FlutterFlowTheme.of(context).secondaryText;
                                                                                                            }
                                                                                                          }(),
                                                                                                          borderColor: () {
                                                                                                            if (FFAppConstants.um == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).secondaryText;
                                                                                                            } else if (FFAppConstants.dois == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).primary;
                                                                                                            } else if (FFAppConstants.tres == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).tertiary;
                                                                                                            } else if (FFAppConstants.quatro == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).error;
                                                                                                            } else {
                                                                                                              return FlutterFlowTheme.of(context).success;
                                                                                                            }
                                                                                                          }(),
                                                                                                          status: listStakesItem.stakesStatuses.status,
                                                                                                        ),
                                                                                                      if (FFAppConstants.seis == listStakesItem.stakes.stakesTypesId)
                                                                                                        StandartArrayPierEdgeWidget(
                                                                                                          key: Key('Keypus_${listStakesIndex}_of_${listStakes.length}'),
                                                                                                          color: () {
                                                                                                            if (FFAppConstants.um == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).secondaryText;
                                                                                                            } else if (FFAppConstants.dois == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).primary;
                                                                                                            } else if (FFAppConstants.tres == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).tertiary;
                                                                                                            } else if (FFAppConstants.quatro == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).error;
                                                                                                            } else if (FFAppConstants.cinco == listStakesItem.stakesStatusesId) {
                                                                                                              return FlutterFlowTheme.of(context).success;
                                                                                                            } else {
                                                                                                              return FlutterFlowTheme.of(context).secondaryText;
                                                                                                            }
                                                                                                          }(),
                                                                                                          status: listStakesItem.stakesStatuses.status,
                                                                                                        ),
                                                                                                    ].divide(SizedBox(width: 8.0)),
                                                                                                  ),
                                                                                                  Text(
                                                                                                    valueOrDefault<String>(
                                                                                                      listStakesItem.stakes.position,
                                                                                                      'N/A',
                                                                                                    ),
                                                                                                    style: FlutterFlowTheme.of(context).labelSmall.override(
                                                                                                          font: GoogleFonts.lexend(
                                                                                                            fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                            fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                          ),
                                                                                                          letterSpacing: 0.0,
                                                                                                          fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                                                          fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                                                        ),
                                                                                                  ),
                                                                                                ],
                                                                                              );
                                                                                            }).divide(SizedBox(width: 8.0)),
                                                                                          );
                                                                                        },
                                                                                      ),
                                                                                      if (!(listRowaTrackersItem.listTrackersStakes.isNotEmpty))
                                                                                        Row(
                                                                                          mainAxisSize: MainAxisSize.min,
                                                                                          children: [
                                                                                            Padding(
                                                                                              padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 0.0, 0.0),
                                                                                              child: Icon(
                                                                                                Icons.info,
                                                                                                color: FlutterFlowTheme.of(context).primary,
                                                                                                size: 24.0,
                                                                                              ),
                                                                                            ),
                                                                                            Text(
                                                                                              FFLocalizations.of(context).getText(
                                                                                                'ot6vpfpi' /* Nenhum dado foi encontrado. */,
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
                                                                                          ].divide(SizedBox(width: 8.0)),
                                                                                        ),
                                                                                    ],
                                                                                  ),
                                                                                ].divide(SizedBox(height: 12.0)),
                                                                              ),
                                                                            ),
                                                                          );
                                                                        }).divide(SizedBox(
                                                                            width:
                                                                                12.0)),
                                                                      ),
                                                                    );
                                                                  },
                                                                ),
                                                              ),
                                                            ),
                                                        ].divide(SizedBox(
                                                            width: 12.0)),
                                                      ),
                                                    ),
                                                  ),
                                                );
                                              },
                                            );
                                          },
                                        ),
                                      ],
                                    ),
                                  ),
                                if (FFAppState().esqueleto2)
                                  wrapWithModel(
                                    model: _model.esqueleto2Model,
                                    updateCallback: () => safeSetState(() {}),
                                    child: Esqueleto2Widget(),
                                  ),
                              ].divide(SizedBox(height: 16.0)),
                            ),
                          ),
                        ),
                      ),
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
