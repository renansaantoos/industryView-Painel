import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_confirm/modal_confirm_widget.dart';
import '/components/modal_empty_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flows/projeto/gestao_de_equipe/filtro_equipe/filtro_equipe_widget.dart';
import '/flows/projeto/sprint/modal_add_tarefas_sprint01/modal_add_tarefas_sprint01_widget.dart';
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
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_add_tarefas_sprint02_model.dart';
export 'modal_add_tarefas_sprint02_model.dart';

class ModalAddTarefasSprint02Widget extends StatefulWidget {
  const ModalAddTarefasSprint02Widget({
    super.key,
    required this.sprintId,
    required this.teamId,
    required this.json,
    required this.typePage,
  });

  final int? sprintId;
  final int? teamId;
  final dynamic json;
  final String? typePage;

  @override
  State<ModalAddTarefasSprint02Widget> createState() =>
      _ModalAddTarefasSprint02WidgetState();
}

class _ModalAddTarefasSprint02WidgetState
    extends State<ModalAddTarefasSprint02Widget> {
  late ModalAddTarefasSprint02Model _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalAddTarefasSprint02Model());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _model.campIds = [];
      safeSetState(() {});
      _model.getAllCamposLoad = await ProjectsGroup.filtraOsCamposCall.call(
        bearerAuth: FFAppState().token,
        fieldsIdList: _model.campo,
        sectionsIdList: _model.secao,
        rowsIdList: _model.fileira,
        trackersIdList: _model.tracker,
        projectsId: FFAppState().projectsInfo.id,
      );

      if ((_model.getAllCamposLoad?.succeeded ?? true)) {
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
              title: FFLocalizations.of(context).getText(
                'ft3t7ihf' /* Erro */,
              ),
              description: getJsonField(
                (_model.getAllCamposLoad?.jsonBody ?? ''),
                r'''$.message''',
              )?.toString() ?? 'Erro desconhecido',
            ),
          );
        },
      );

      return;
    });

    _model.textController ??= TextEditingController();
    _model.textFieldFocusNode ??= FocusNode();

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
        child: FutureBuilder<ApiCallResponse>(
          future: _model
              .addTarefas2(
            requestFn: () => ProjectsGroup.getProjectsBacklogsRecordCall.call(
              bearerAuth: FFAppState().token,
              page: _model.page,
              perPage: _model.perPage,
              projectsId: FFAppState().projectsInfo.id,
              sprintAdded: false,
              search: _model.textController.text,
              fieldsIdList: _model.campo,
              sectionsIdList: _model.secao,
              rowsIdList: _model.fileira,
              trackersIdList: _model.tracker,
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
                    valueColor: AlwaysStoppedAnimation<Color>(
                      FlutterFlowTheme.of(context).primary,
                    ),
                  ),
                ),
              );
            }
            final containerGetProjectsBacklogsRecordResponse = snapshot.data!;

            return Container(
              height: 830.0,
              constraints: BoxConstraints(
                maxWidth: 1200.0,
              ),
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
                padding: EdgeInsets.all(24.0),
                child: FutureBuilder<ApiCallResponse>(
                  future: _model
                      .allIds(
                    requestFn: () => ProjectsGroup
                        .queryAllIdsProjectsBacklogsRecordCall
                        .call(
                      bearerAuth: FFAppState().token,
                      page: _model.page,
                      perPage: _model.perPage,
                      projectsId: FFAppState().projectsInfo.id,
                      sprintAdded: FFAppState().filtroBacklogSprint,
                      search: _model.textController.text,
                      fieldsIdList: _model.dropCampoValue,
                      sectionsIdList: _model.dropSecaoValue,
                      rowsIdList: _model.dropFileiraValue,
                      trackersIdList: _model.dropTrackerValue,
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
                            valueColor: AlwaysStoppedAnimation<Color>(
                              FlutterFlowTheme.of(context).primary,
                            ),
                          ),
                        ),
                      );
                    }
                    final columnQueryAllIdsProjectsBacklogsRecordResponse =
                        snapshot.data!;

                    return Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Builder(
                                      builder: (context) =>
                                          FlutterFlowIconButton(
                                        borderColor:
                                            FlutterFlowTheme.of(context)
                                                .primary,
                                        borderRadius: 8.0,
                                        borderWidth: 1.0,
                                        buttonSize: 32.0,
                                        fillColor: FlutterFlowTheme.of(context)
                                            .secondary,
                                        hoverColor: FlutterFlowTheme.of(context)
                                            .hoverNavBar,
                                        hoverIconColor:
                                            FlutterFlowTheme.of(context)
                                                .secondaryBackground,
                                        hoverBorderColor:
                                            FlutterFlowTheme.of(context)
                                                .hoverNavBar,
                                        icon: Icon(
                                          Icons.keyboard_return,
                                          color: FlutterFlowTheme.of(context)
                                              .primary,
                                          size: 16.0,
                                        ),
                                        onPressed: () async {
                                          Navigator.pop(context);
                                          await showDialog(
                                            barrierColor: Color(0x7F000000),
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
                                                    ModalAddTarefasSprint01Widget(
                                                  sprintId: widget!.sprintId!,
                                                  json: widget!.json!,
                                                  typePage: widget!.typePage!,
                                                ),
                                              );
                                            },
                                          );
                                        },
                                      ),
                                    ),
                                    Align(
                                      alignment:
                                          AlignmentDirectional(-1.0, -1.0),
                                      child: SelectionArea(
                                          child: Text(
                                        FFLocalizations.of(context).getText(
                                          'wglnghic' /* Adicionar tarefas à sprint */,
                                        ),
                                        style: FlutterFlowTheme.of(context)
                                            .headlineMedium
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight: FontWeight.w500,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .headlineMedium
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight: FontWeight.w500,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .headlineMedium
                                                      .fontStyle,
                                            ),
                                      )),
                                    ),
                                  ].divide(SizedBox(width: 8.0)),
                                ),
                                Padding(
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      0.0, 8.0, 0.0, 0.0),
                                  child: SelectionArea(
                                      child: Text(
                                    FFLocalizations.of(context).getText(
                                      'p88n9r9v' /* Veja todas as tarefas do backl... */,
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
                                ),
                              ],
                            ),
                            Divider(
                              height: 18.0,
                              thickness: 1.0,
                              color: FlutterFlowTheme.of(context).alternate,
                            ),
                          ].divide(SizedBox(height: 12.0)),
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.max,
                          children: [
                            if (responsiveVisibility(
                              context: context,
                              phone: false,
                            ))
                              Container(
                                width: 410.0,
                                child: TextFormField(
                                  controller: _model.textController,
                                  focusNode: _model.textFieldFocusNode,
                                  onChanged: (_) => EasyDebounce.debounce(
                                    '_model.textController',
                                    Duration(milliseconds: 500),
                                    () async {
                                      safeSetState(() {
                                        _model.clearAddTarefas2Cache();
                                        _model.apiRequestCompleted3 = false;
                                      });
                                      await _model
                                          .waitForApiRequestCompleted3();
                                      safeSetState(() {
                                        _model.clearAllIdsCache();
                                        _model.apiRequestCompleted1 = false;
                                      });
                                      await _model
                                          .waitForApiRequestCompleted1();
                                    },
                                  ),
                                  onFieldSubmitted: (_) async {
                                    safeSetState(() {
                                      _model.clearAddTarefas2Cache();
                                      _model.apiRequestCompleted3 = false;
                                    });
                                    await _model.waitForApiRequestCompleted3();
                                    safeSetState(() {
                                      _model.clearAllIdsCache();
                                      _model.apiRequestCompleted1 = false;
                                    });
                                    await _model.waitForApiRequestCompleted1();
                                  },
                                  autofocus: false,
                                  obscureText: false,
                                  decoration: InputDecoration(
                                    labelText:
                                        FFLocalizations.of(context).getText(
                                      'a7il0kjn' /* Procurar por código ou descriç... */,
                                    ),
                                    labelStyle: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .fontStyle,
                                          ),
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
                                    hintStyle: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .fontStyle,
                                          ),
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
                                    enabledBorder: OutlineInputBorder(
                                      borderSide: BorderSide(
                                        color: FlutterFlowTheme.of(context)
                                            .alternate,
                                        width: 1.0,
                                      ),
                                      borderRadius: BorderRadius.circular(12.0),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderSide: BorderSide(
                                        color: FlutterFlowTheme.of(context)
                                            .primary,
                                        width: 1.0,
                                      ),
                                      borderRadius: BorderRadius.circular(12.0),
                                    ),
                                    errorBorder: OutlineInputBorder(
                                      borderSide: BorderSide(
                                        color:
                                            FlutterFlowTheme.of(context).error,
                                        width: 1.0,
                                      ),
                                      borderRadius: BorderRadius.circular(12.0),
                                    ),
                                    focusedErrorBorder: OutlineInputBorder(
                                      borderSide: BorderSide(
                                        color:
                                            FlutterFlowTheme.of(context).error,
                                        width: 1.0,
                                      ),
                                      borderRadius: BorderRadius.circular(12.0),
                                    ),
                                    filled: true,
                                    fillColor: FlutterFlowTheme.of(context)
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
                                              FlutterFlowTheme.of(context)
                                                  .bodySmall
                                                  .fontStyle,
                                        ),
                                        letterSpacing: 0.0,
                                        fontWeight: FontWeight.w500,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontStyle,
                                      ),
                                  cursorColor:
                                      FlutterFlowTheme.of(context).primary,
                                  validator: _model.textControllerValidator
                                      .asValidator(context),
                                ),
                              ),
                            Row(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                Icon(
                                  Icons.filter_list,
                                  color: FlutterFlowTheme.of(context)
                                      .secondaryText,
                                  size: 24.0,
                                ),
                                Text(
                                  FFLocalizations.of(context).getText(
                                    '8va6wbn0' /* Filtros */,
                                  ),
                                  style: FlutterFlowTheme.of(context)
                                      .bodyMedium
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight: FontWeight.w500,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMedium
                                                  .fontStyle,
                                        ),
                                        color: FlutterFlowTheme.of(context)
                                            .secondaryText,
                                        letterSpacing: 0.0,
                                        fontWeight: FontWeight.w500,
                                        fontStyle: FlutterFlowTheme.of(context)
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
                                color: FlutterFlowTheme.of(context).alternate,
                              ),
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.max,
                              children: [

                                if ((_model.textController.text != null &&
                                        _model.textController.text != '') ||
                                    (_model.dropCampoValue != null &&
                                        (_model.dropCampoValue?.isNotEmpty ?? false)) ||
                                    (_model.dropSecaoValue != null &&
                                        (_model.dropSecaoValue?.isNotEmpty ?? false)) ||
                                    (_model.dropFileiraValue != null &&
                                        (_model.dropFileiraValue ?? [])
                                            .isNotEmpty) ||
                                    (_model.dropTrackerValue != null &&
                                        (_model.dropTrackerValue?.isNotEmpty ?? false)))
                                  FFButtonWidget(
                                    onPressed: () async {
                                      FFAppState().filtroIdsCargo = [];
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
                                        _model.dropDownValueController?.reset();
                                        _model.dropDownValue = null;
                                      });
                                      safeSetState(() {
                                        _model.textController?.clear();
                                      });
                                      safeSetState(() {
                                        _model.clearAddTarefas2Cache();
                                        _model.apiRequestCompleted3 = false;
                                      });
                                      await _model
                                          .waitForApiRequestCompleted3();
                                      safeSetState(() =>
                                          _model.apiRequestCompleter2 = null);
                                      await _model
                                          .waitForApiRequestCompleted2();
                                      safeSetState(() {
                                        _model.clearAllIdsCache();
                                        _model.apiRequestCompleted1 = false;
                                      });
                                      await _model
                                          .waitForApiRequestCompleted1();
                                    },
                                    text: FFLocalizations.of(context).getText(
                                      'tocqnorl' /* Limpar */,
                                    ),
                                    icon: Icon(
                                      Icons.filter_list_off,
                                      size: 15.0,
                                    ),
                                    options: FFButtonOptions(
                                      height: 30.0,
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          16.0, 0.0, 16.0, 0.0),
                                      iconPadding:
                                          EdgeInsetsDirectional.fromSTEB(
                                              0.0, 0.0, 0.0, 0.0),
                                      color:
                                          FlutterFlowTheme.of(context).status05,
                                      textStyle: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontStyle,
                                            ),
                                            color: FlutterFlowTheme.of(context)
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
                                        color:
                                            FlutterFlowTheme.of(context).error,
                                        width: 1.0,
                                      ),
                                      borderRadius: BorderRadius.circular(24.0),
                                      hoverColor:
                                          FlutterFlowTheme.of(context).error,
                                      hoverBorderSide: BorderSide(
                                        color:
                                            FlutterFlowTheme.of(context).error,
                                        width: 1.0,
                                      ),
                                      hoverTextColor:
                                          FlutterFlowTheme.of(context)
                                              .secondaryBackground,
                                    ),
                                  ),
                              ].divide(SizedBox(width: 8.0)),
                            ),
                          ].divide(SizedBox(width: 12.0)),
                        ),
                        FutureBuilder<ApiCallResponse>(
                          future: (_model.apiRequestCompleter2 ??=
                                  Completer<ApiCallResponse>()
                                    ..complete(
                                        ProjectsGroup.filtraOsCamposCall.call(
                                      bearerAuth: FFAppState().token,
                                      fieldsIdList: _model.campo,
                                      sectionsIdList: _model.secao,
                                      rowsIdList: _model.fileira,
                                      trackersIdList: _model.tracker,
                                      projectsId: FFAppState().projectsInfo.id,
                                    )))
                              .future,
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
                            final filtersFiltraOsCamposResponse =
                                snapshot.data!;

                            return Container(
                              decoration: BoxDecoration(),
                              child: Row(
                                mainAxisSize: MainAxisSize.max,
                                children: [
                                  if (responsiveVisibility(
                                    context: context,
                                    phone: false,
                                  ))
                                    FlutterFlowDropDown<int>(
                                      multiSelectController: _model
                                              .dropCampoValueController ??=
                                          FormListFieldController<int>(null),
                                      options: List<int>.from(
                                          (ProjectsGroup.filtraOsCamposCall
                                                  .fields(
                                                    (_model.getAllCamposLoad
                                                            ?.jsonBody ??
                                                        ''),
                                                  ) ?? [])
                                                  .map((e) => getJsonField(
                                                        e,
                                                        r'''$.id''',
                                                      ))
                                                  .toList() as List
                                              ).cast<int>(),
                                      optionLabels:
                                          (ProjectsGroup.filtraOsCamposCall
                                              .fields(
                                                (_model.getAllCamposLoad
                                                        ?.jsonBody ??
                                                    ''),
                                              ) ?? [])
                                              .map((e) => getJsonField(
                                                    e,
                                                    r'''$.name''',
                                                  ))
                                              .toList()
                                              .map((e) => e.toString())
                                              .toList(),
                                      width: 200.0,
                                      height: 36.0,
                                      textStyle: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontStyle,
                                            ),
                                            color: FlutterFlowTheme.of(context)
                                                .primary,
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
                                      hintText:
                                          FFLocalizations.of(context).getText(
                                        'c3lzlhcu' /* Selecione um campo */,
                                      ),
                                      icon: Icon(
                                        Icons.keyboard_arrow_down_rounded,
                                        color: FlutterFlowTheme.of(context)
                                            .secondaryText,
                                        size: 24.0,
                                      ),
                                      fillColor: FlutterFlowTheme.of(context)
                                          .primaryBackground,
                                      elevation: 2.0,
                                      borderColor: FlutterFlowTheme.of(context)
                                          .alternate,
                                      borderWidth: 1.0,
                                      borderRadius: 12.0,
                                      margin: EdgeInsetsDirectional.fromSTEB(
                                          12.0, 0.0, 12.0, 0.0),
                                      hidesUnderline: true,
                                      isOverButton: false,
                                      isSearchable: false,
                                      isMultiSelect: true,
                                      onMultiSelectChanged: (val) async {
                                        safeSetState(
                                            () => _model.dropCampoValue = val);
                                        _model.campo = _model.dropCampoValue!
                                            .toList()
                                            .cast<int>();
                                        safeSetState(() {});
                                        _model.page = 1;
                                        safeSetState(() {});
                                        safeSetState(() {
                                          _model.clearAddTarefas2Cache();
                                          _model.apiRequestCompleted3 = false;
                                        });
                                        await _model
                                            .waitForApiRequestCompleted3();
                                        safeSetState(() =>
                                            _model.apiRequestCompleter2 = null);
                                        await _model
                                            .waitForApiRequestCompleted2();
                                        safeSetState(() {
                                          _model.clearAllIdsCache();
                                          _model.apiRequestCompleted1 = false;
                                        });
                                        await _model
                                            .waitForApiRequestCompleted1();
                                      },
                                    ),
                                  if (valueOrDefault<bool>(
                                        _model.dropCampoValue != null &&
                                            (_model.dropCampoValue?.isNotEmpty ?? false),
                                        false,
                                      ) &&
                                      responsiveVisibility(
                                        context: context,
                                        phone: false,
                                      ))
                                    FlutterFlowDropDown<int>(
                                      multiSelectController: _model
                                              .dropSecaoValueController ??=
                                          FormListFieldController<int>(null),
                                      options: List<int>.from(ProjectsGroup
                                                      .filtraOsCamposCall
                                                      .sections(
                                                    filtersFiltraOsCamposResponse
                                                        .jsonBody,
                                                  ) !=
                                                  null &&
                                              (ProjectsGroup.filtraOsCamposCall
                                                      .sections(
                                                filtersFiltraOsCamposResponse
                                                    .jsonBody,
                                              ) ?? [])
                                                  .isNotEmpty
                                          ? ((ProjectsGroup.filtraOsCamposCall.sections(filtersFiltraOsCamposResponse.jsonBody) ?? [])
                                                  .map((e) => getJsonField(
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
                                              (ProjectsGroup.filtraOsCamposCall
                                                      .sections(
                                                filtersFiltraOsCamposResponse
                                                    .jsonBody,
                                              ) ?? [])
                                                  .isNotEmpty
                                          ? (ProjectsGroup.filtraOsCamposCall.sections(filtersFiltraOsCamposResponse.jsonBody) ?? [])
                                              .map((e) => getJsonField(
                                                    e,
                                                    r'''$.section_number''',
                                                  ))
                                              .toList()
                                              .map((e) => e.toString())
                                              .toList()
                                          : FFAppState().secaoVazia,
                                      width: 200.0,
                                      height: 36.0,
                                      textStyle: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontStyle,
                                            ),
                                            color: FlutterFlowTheme.of(context)
                                                .primary,
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
                                      hintText:
                                          FFLocalizations.of(context).getText(
                                        'gcvvfoc3' /* Selecione uma seção */,
                                      ),
                                      icon: Icon(
                                        Icons.keyboard_arrow_down_rounded,
                                        color: FlutterFlowTheme.of(context)
                                            .secondaryText,
                                        size: 24.0,
                                      ),
                                      fillColor: FlutterFlowTheme.of(context)
                                          .primaryBackground,
                                      elevation: 2.0,
                                      borderColor: FlutterFlowTheme.of(context)
                                          .alternate,
                                      borderWidth: 1.0,
                                      borderRadius: 12.0,
                                      margin: EdgeInsetsDirectional.fromSTEB(
                                          12.0, 0.0, 12.0, 0.0),
                                      hidesUnderline: true,
                                      isOverButton: false,
                                      isSearchable: false,
                                      isMultiSelect: true,
                                      onMultiSelectChanged: (val) async {
                                        safeSetState(
                                            () => _model.dropSecaoValue = val);
                                        _model.secao = (_model.dropSecaoValue ?? [])
                                            .toList()
                                            .cast<int>();
                                        safeSetState(() {});
                                        _model.page = 1;
                                        safeSetState(() {});
                                        safeSetState(() {
                                          _model.clearAddTarefas2Cache();
                                          _model.apiRequestCompleted3 = false;
                                        });
                                        await _model
                                            .waitForApiRequestCompleted3();
                                        safeSetState(() =>
                                            _model.apiRequestCompleter2 = null);
                                        await _model
                                            .waitForApiRequestCompleted2();
                                        safeSetState(() {
                                          _model.clearAllIdsCache();
                                          _model.apiRequestCompleted1 = false;
                                        });
                                        await _model
                                            .waitForApiRequestCompleted1();
                                      },
                                    ),
                                  if (valueOrDefault<bool>(
                                        _model.dropSecaoValue != null &&
                                            (_model.dropSecaoValue?.isNotEmpty ?? false),
                                        false,
                                      ) &&
                                      responsiveVisibility(
                                        context: context,
                                        phone: false,
                                      ))
                                    FlutterFlowDropDown<int>(
                                      multiSelectController: _model
                                              .dropFileiraValueController ??=
                                          FormListFieldController<int>(null),
                                      options: List<int>.from(ProjectsGroup
                                                      .filtraOsCamposCall
                                                      .rows(
                                                    filtersFiltraOsCamposResponse
                                                        .jsonBody,
                                                  ) !=
                                                  null &&
                                              (ProjectsGroup.filtraOsCamposCall
                                                      .rows(
                                                filtersFiltraOsCamposResponse
                                                    .jsonBody,
                                              ) ?? [])
                                                  .isNotEmpty
                                          ? ((ProjectsGroup.filtraOsCamposCall
                                                  .rows(
                                                    filtersFiltraOsCamposResponse
                                                        .jsonBody,
                                                  ) ?? [])
                                                  .map((e) => getJsonField(
                                                        e,
                                                        r'''$.id''',
                                                      ))
                                                  .toList() as List<dynamic>).cast<int>()
                                          : FFAppState().listaVazia),
                                      optionLabels:
                                          ProjectsGroup.filtraOsCamposCall.rows(
                                                        filtersFiltraOsCamposResponse
                                                            .jsonBody,
                                                      ) !=
                                                      null &&
                                                  (ProjectsGroup
                                                          .filtraOsCamposCall
                                                          .rows(
                                                    filtersFiltraOsCamposResponse
                                                        .jsonBody,
                                                  ) ?? [])
                                                      .isNotEmpty
                                              ? (ProjectsGroup.filtraOsCamposCall
                                                  .rows(
                                                    filtersFiltraOsCamposResponse
                                                        .jsonBody,
                                                  ) ?? [])
                                                  .map((e) => getJsonField(
                                                        e,
                                                        r'''$.row_number''',
                                                      ))
                                                  .toList()
                                                  .map((e) => e.toString())
                                                  .toList()
                                              : FFAppState().fileiraVazia,
                                      width: 200.0,
                                      height: 36.0,
                                      textStyle: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontStyle,
                                            ),
                                            color: FlutterFlowTheme.of(context)
                                                .primary,
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
                                      hintText:
                                          FFLocalizations.of(context).getText(
                                        'ebl1qui9' /* Selecione uma fileira */,
                                      ),
                                      icon: Icon(
                                        Icons.keyboard_arrow_down_rounded,
                                        color: FlutterFlowTheme.of(context)
                                            .secondaryText,
                                        size: 24.0,
                                      ),
                                      fillColor: FlutterFlowTheme.of(context)
                                          .primaryBackground,
                                      elevation: 2.0,
                                      borderColor: FlutterFlowTheme.of(context)
                                          .alternate,
                                      borderWidth: 1.0,
                                      borderRadius: 12.0,
                                      margin: EdgeInsetsDirectional.fromSTEB(
                                          12.0, 0.0, 12.0, 0.0),
                                      hidesUnderline: true,
                                      isOverButton: false,
                                      isSearchable: false,
                                      isMultiSelect: true,
                                      onMultiSelectChanged: (val) async {
                                        safeSetState(() =>
                                            _model.dropFileiraValue = val);
                                        _model.fileira = (_model
                                                .dropFileiraValue ??
                                            [])
                                            .toList()
                                            .cast<int>();
                                        safeSetState(() {});
                                        _model.page = 1;
                                        safeSetState(() {});
                                        safeSetState(() {
                                          _model.clearAddTarefas2Cache();
                                          _model.apiRequestCompleted3 = false;
                                        });
                                        await _model
                                            .waitForApiRequestCompleted3();
                                        safeSetState(() =>
                                            _model.apiRequestCompleter2 = null);
                                        await _model
                                            .waitForApiRequestCompleted2();
                                        safeSetState(() {
                                          _model.clearAllIdsCache();
                                          _model.apiRequestCompleted1 = false;
                                        });
                                        await _model
                                            .waitForApiRequestCompleted1();
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
                                          FormListFieldController<int>(null),
                                      options: List<int>.from(ProjectsGroup
                                                      .filtraOsCamposCall
                                                      .trackers(
                                                    filtersFiltraOsCamposResponse
                                                        .jsonBody,
                                                  ) !=
                                                  null &&
                                              (ProjectsGroup.filtraOsCamposCall
                                                      .trackers(
                                                filtersFiltraOsCamposResponse
                                                    .jsonBody,
                                              ) ?? [])
                                                  .isNotEmpty
                                          ? ((ProjectsGroup.filtraOsCamposCall
                                                  .trackers(
                                                    filtersFiltraOsCamposResponse
                                                        .jsonBody,
                                                  ) ?? [])
                                                  .map((e) => getJsonField(
                                                        e,
                                                        r'''$.id''',
                                                      ))
                                                  .toList() as List<dynamic>).cast<int>()
                                          : FFAppState().listaVazia),
                                      optionLabels: ProjectsGroup
                                                      .filtraOsCamposCall
                                                      .trackers(
                                                    filtersFiltraOsCamposResponse
                                                        .jsonBody,
                                                  ) !=
                                                  null &&
                                              (ProjectsGroup.filtraOsCamposCall
                                                      .trackers(
                                                filtersFiltraOsCamposResponse
                                                    .jsonBody,
                                              ) ??
                                                      [])
                                                  .isNotEmpty
                                          ? (ProjectsGroup.filtraOsCamposCall
                                                  .trackers(
                                                filtersFiltraOsCamposResponse
                                                    .jsonBody,
                                              ) ??
                                                  [])
                                              .map((e) => getJsonField(
                                                    e,
                                                    r'''$.position''',
                                                  ))
                                              .toList()
                                              .map((e) => e.toString())
                                              .toList()
                                          : FFAppState().trackerVazio,
                                      width: 200.0,
                                      height: 36.0,
                                      textStyle: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontStyle,
                                            ),
                                            color: FlutterFlowTheme.of(context)
                                                .primary,
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
                                      hintText:
                                          FFLocalizations.of(context).getText(
                                        'qyibd34w' /* Posição do tracker */,
                                      ),
                                      icon: Icon(
                                        Icons.keyboard_arrow_down_rounded,
                                        color: FlutterFlowTheme.of(context)
                                            .secondaryText,
                                        size: 24.0,
                                      ),
                                      fillColor: FlutterFlowTheme.of(context)
                                          .primaryBackground,
                                      elevation: 2.0,
                                      borderColor: FlutterFlowTheme.of(context)
                                          .alternate,
                                      borderWidth: 1.0,
                                      borderRadius: 12.0,
                                      margin: EdgeInsetsDirectional.fromSTEB(
                                          12.0, 0.0, 12.0, 0.0),
                                      hidesUnderline: true,
                                      isOverButton: false,
                                      isSearchable: false,
                                      isMultiSelect: true,
                                      onMultiSelectChanged: (val) async {
                                        safeSetState(() =>
                                            _model.dropTrackerValue = val);
                                        _model.tracker = (_model
                                                .dropTrackerValue ??
                                            [])
                                            .toList()
                                            .cast<int>();
                                        safeSetState(() {});
                                        _model.page = 1;
                                        safeSetState(() {});
                                        safeSetState(() {
                                          _model.clearAddTarefas2Cache();
                                          _model.apiRequestCompleted3 = false;
                                        });
                                        await _model
                                            .waitForApiRequestCompleted3();
                                        safeSetState(() =>
                                            _model.apiRequestCompleter2 = null);
                                        await _model
                                            .waitForApiRequestCompleted2();
                                        safeSetState(() {
                                          _model.clearAllIdsCache();
                                          _model.apiRequestCompleted1 = false;
                                        });
                                        await _model
                                            .waitForApiRequestCompleted1();
                                      },
                                    ),
                                ].divide(SizedBox(width: 8.0)),
                              ),
                            );
                          },
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.max,
                          children: [
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Align(
                                  alignment: AlignmentDirectional(-1.0, -1.0),
                                  child: Text(
                                    valueOrDefault<String>(
                                      _model.campIds.length.toString(),
                                      '0',
                                    ),
                                    style: FlutterFlowTheme.of(context)
                                        .labelLarge
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .labelLarge
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelLarge
                                                    .fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(context)
                                              .primary,
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .labelLarge
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .labelLarge
                                                  .fontStyle,
                                        ),
                                  ),
                                ),
                                Align(
                                  alignment: AlignmentDirectional(-1.0, -1.0),
                                  child: SelectionArea(
                                      child: Text(
                                    FFLocalizations.of(context).getText(
                                      'veoojsch' /* tarefas selecionadas */,
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
                                          color: FlutterFlowTheme.of(context)
                                              .primaryText,
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
                                ),
                              ].divide(SizedBox(width: 4.0)),
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Align(
                                  alignment: AlignmentDirectional(-1.0, -1.0),
                                  child: Text(
                                    valueOrDefault<String>(
                                      _model.adcSubtaskSprint.length.toString(),
                                      '0',
                                    ),
                                    style: FlutterFlowTheme.of(context)
                                        .labelLarge
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .labelLarge
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelLarge
                                                    .fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(context)
                                              .primary,
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .labelLarge
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .labelLarge
                                                  .fontStyle,
                                        ),
                                  ),
                                ),
                                Align(
                                  alignment: AlignmentDirectional(-1.0, -1.0),
                                  child: SelectionArea(
                                      child: Text(
                                    FFLocalizations.of(context).getText(
                                      'sioecfpn' /* Subtarefas selecionadas */,
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
                                          color: FlutterFlowTheme.of(context)
                                              .primaryText,
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
                                ),
                              ].divide(SizedBox(width: 4.0)),
                            ),
                          ].divide(SizedBox(width: 24.0)),
                        ),
                        Expanded(
                          child: Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              Expanded(
                                child: SingleChildScrollView(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
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
                                              Theme(
                                                data: ThemeData(
                                                  checkboxTheme:
                                                      CheckboxThemeData(
                                                    visualDensity:
                                                        VisualDensity.compact,
                                                    materialTapTargetSize:
                                                        MaterialTapTargetSize
                                                            .shrinkWrap,
                                                    shape:
                                                        RoundedRectangleBorder(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              4.0),
                                                    ),
                                                  ),
                                                  unselectedWidgetColor:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .alternate,
                                                ),
                                                child: Checkbox(
                                                  value: _model
                                                          .checkboxValue ??=
                                                      _model.campIds.isNotEmpty,
                                                  onChanged: (newValue) async {
                                                    safeSetState(() =>
                                                        _model.checkboxValue =
                                                            newValue!);
                                                    if (newValue!) {
                                                      _model.campIds = ProjectsGroup
                                                          .queryAllIdsProjectsBacklogsRecordCall
                                                          .ids(
                                                            columnQueryAllIdsProjectsBacklogsRecordResponse
                                                                .jsonBody,
                                                          )
                                                          ?.toList()
                                                          .cast<int>() ?? [];
                                                      safeSetState(() {});
                                                    } else {
                                                      _model.campIds = [];
                                                      safeSetState(() {});
                                                    }
                                                  },
                                                  side: (FlutterFlowTheme.of(
                                                                  context)
                                                              .alternate !=
                                                          null)
                                                      ? BorderSide(
                                                          width: 2,
                                                          color: FlutterFlowTheme
                                                                  .of(context)
                                                              .alternate!,
                                                        )
                                                      : null,
                                                  activeColor:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .primary,
                                                  checkColor:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .info,
                                                ),
                                              ),
                                              Expanded(
                                                child: SelectionArea(
                                                    child: Text(
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    'l5prsy5d' /* Tarefa */,
                                                  ),
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .labelSmall
                                                      .override(
                                                        font:
                                                            GoogleFonts.lexend(
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
                                              Expanded(
                                                child: SelectionArea(
                                                    child: Text(
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                    '6ez11g8r' /* Peso */,
                                                  ),
                                                  textAlign: TextAlign.center,
                                                  style: FlutterFlowTheme.of(
                                                          context)
                                                      .labelSmall
                                                      .override(
                                                        font:
                                                            GoogleFonts.lexend(
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
                                              Expanded(
                                                child: Container(
                                                  width: 120.0,
                                                  decoration: BoxDecoration(),
                                                  child: SelectionArea(
                                                      child: Text(
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                      '1d1rd961' /* Quantidade */,
                                                    ),
                                                    textAlign: TextAlign.center,
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
                                              ),
                                              Expanded(
                                                child: Container(
                                                  width: 120.0,
                                                  decoration: BoxDecoration(),
                                                  child: SelectionArea(
                                                      child: Text(
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                      'bw21rtuo' /* Unidade/Medida */,
                                                    ),
                                                    textAlign: TextAlign.center,
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
                                              ),
                                              Expanded(
                                                child: Container(
                                                  width: 120.0,
                                                  decoration: BoxDecoration(),
                                                  child: SelectionArea(
                                                      child: Text(
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                      'k7a05ait' /* Disciplina */,
                                                    ),
                                                    textAlign: TextAlign.center,
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
                                              ),
                                            ].divide(SizedBox(width: 16.0)),
                                          ),
                                        ),
                                      ),
                                      Builder(
                                        builder: (context) {
                                          final listItems = ProjectsGroup
                                                  .getProjectsBacklogsRecordCall
                                                  .list(
                                                    containerGetProjectsBacklogsRecordResponse
                                                        .jsonBody,
                                                  )
                                                  ?.toList() ??
                                              [];
                                          if (listItems.isEmpty) {
                                            return ModalEmptyWidget();
                                          }

                                          return ListView.builder(
                                            padding: EdgeInsets.zero,
                                            shrinkWrap: true,
                                            scrollDirection: Axis.vertical,
                                            itemCount: listItems.length,
                                            itemBuilder:
                                                (context, listItemsIndex) {
                                              final listItemsItem =
                                                  listItems[listItemsIndex];
                                              return Padding(
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        0.0, 0.0, 0.0, 1.0),
                                                child: Container(
                                                  width:
                                                      MediaQuery.sizeOf(context)
                                                              .width *
                                                          1.0,
                                                  decoration: BoxDecoration(
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .secondaryBackground,
                                                    boxShadow: [
                                                      BoxShadow(
                                                        blurRadius: 0.0,
                                                        color:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .alternate,
                                                        offset: Offset(
                                                          0.0,
                                                          1.0,
                                                        ),
                                                      )
                                                    ],
                                                  ),
                                                  child: Column(
                                                    mainAxisSize:
                                                        MainAxisSize.min,
                                                    children: [
                                                      Padding(
                                                        padding:
                                                            EdgeInsetsDirectional
                                                                .fromSTEB(
                                                                    16.0,
                                                                    8.0,
                                                                    16.0,
                                                                    8.0),
                                                        child: Row(
                                                          mainAxisSize:
                                                              MainAxisSize.min,
                                                          children: [
                                                            if (getJsonField(
                                                                  listItemsItem,
                                                                  r'''$.subtasks''',
                                                                ) ==
                                                                null)
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
                                                                  if (_model
                                                                      .subtaskMostrar
                                                                      .contains(
                                                                          valueOrDefault<
                                                                              int>(
                                                                    getJsonField(
                                                                      listItemsItem,
                                                                      r'''$.id''',
                                                                    ),
                                                                    0,
                                                                  ))) {
                                                                    _model.removeFromSubtaskMostrar(
                                                                        valueOrDefault<int>(
                                                                      getJsonField(
                                                                        listItemsItem,
                                                                        r'''$.id''',
                                                                      ),
                                                                      0,
                                                                    ));
                                                                    safeSetState(
                                                                        () {});
                                                                  } else {
                                                                    _model.addToSubtaskMostrar(
                                                                        valueOrDefault<int>(
                                                                      getJsonField(
                                                                        listItemsItem,
                                                                        r'''$.id''',
                                                                      ),
                                                                      0,
                                                                    ));
                                                                    safeSetState(
                                                                        () {});
                                                                  }
                                                                },
                                                                child: Icon(
                                                                  Icons
                                                                      .keyboard_arrow_down_rounded,
                                                                  color: FlutterFlowTheme.of(
                                                                          context)
                                                                      .secondaryText,
                                                                  size: 18.0,
                                                                ),
                                                              ),
                                                            if (functions
                                                                .jsonVazio(
                                                                    getJsonField(
                                                              listItemsItem,
                                                              r'''$.subtasks''',
                                                              true,
                                                            )))
                                                              Padding(
                                                                padding:
                                                                    EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            8.0,
                                                                            0.0,
                                                                            0.0,
                                                                            0.0),
                                                                child: Row(
                                                                  mainAxisSize:
                                                                      MainAxisSize
                                                                          .max,
                                                                  children: [
                                                                    if (!_model
                                                                        .campIds
                                                                        .contains(
                                                                            getJsonField(
                                                                      listItemsItem,
                                                                      r'''$.id''',
                                                                    )))
                                                                      InkWell(
                                                                        splashColor:
                                                                            Colors.transparent,
                                                                        focusColor:
                                                                            Colors.transparent,
                                                                        hoverColor:
                                                                            Colors.transparent,
                                                                        highlightColor:
                                                                            Colors.transparent,
                                                                        onTap:
                                                                            () async {
                                                                          _model
                                                                              .addToCampIds(valueOrDefault<int>(
                                                                            getJsonField(
                                                                              listItemsItem,
                                                                              r'''$.id''',
                                                                            ),
                                                                            0,
                                                                          ));
                                                                          safeSetState(
                                                                              () {});
                                                                        },
                                                                        child:
                                                                            Container(
                                                                          width:
                                                                              18.0,
                                                                          height:
                                                                              18.0,
                                                                          decoration:
                                                                              BoxDecoration(
                                                                            color:
                                                                                FlutterFlowTheme.of(context).secondaryBackground,
                                                                            borderRadius:
                                                                                BorderRadius.circular(4.0),
                                                                            border:
                                                                                Border.all(
                                                                              color: FlutterFlowTheme.of(context).alternate,
                                                                              width: 2.0,
                                                                            ),
                                                                          ),
                                                                        ),
                                                                      ),
                                                                    if (_model
                                                                        .campIds
                                                                        .contains(
                                                                            getJsonField(
                                                                      listItemsItem,
                                                                      r'''$.id''',
                                                                    )))
                                                                      InkWell(
                                                                        splashColor:
                                                                            Colors.transparent,
                                                                        focusColor:
                                                                            Colors.transparent,
                                                                        hoverColor:
                                                                            Colors.transparent,
                                                                        highlightColor:
                                                                            Colors.transparent,
                                                                        onTap:
                                                                            () async {
                                                                          _model
                                                                              .removeFromCampIds(valueOrDefault<int>(
                                                                            getJsonField(
                                                                              listItemsItem,
                                                                              r'''$.id''',
                                                                            ),
                                                                            0,
                                                                          ));
                                                                          safeSetState(
                                                                              () {});
                                                                          if (_model
                                                                              .campIds
                                                                              .isNotEmpty) {
                                                                            return;
                                                                          }

                                                                          safeSetState(
                                                                              () {
                                                                            _model.checkboxValue =
                                                                                false;
                                                                          });
                                                                        },
                                                                        child:
                                                                            Container(
                                                                          width:
                                                                              18.0,
                                                                          height:
                                                                              18.0,
                                                                          decoration:
                                                                              BoxDecoration(
                                                                            color:
                                                                                FlutterFlowTheme.of(context).primary,
                                                                            borderRadius:
                                                                                BorderRadius.circular(4.0),
                                                                            border:
                                                                                Border.all(
                                                                              color: FlutterFlowTheme.of(context).primary,
                                                                              width: 2.0,
                                                                            ),
                                                                          ),
                                                                          alignment: AlignmentDirectional(
                                                                              0.0,
                                                                              0.0),
                                                                          child:
                                                                              Icon(
                                                                            Icons.check_rounded,
                                                                            color:
                                                                                FlutterFlowTheme.of(context).secondaryBackground,
                                                                            size:
                                                                                15.0,
                                                                          ),
                                                                        ),
                                                                      ),
                                                                  ],
                                                                ),
                                                              ),
                                                            if (!functions
                                                                .jsonVazio(
                                                                    getJsonField(
                                                              listItemsItem,
                                                              r'''$.subtasks''',
                                                              true,
                                                            )))
                                                              Padding(
                                                                padding:
                                                                    EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            8.0,
                                                                            0.0,
                                                                            0.0,
                                                                            0.0),
                                                                child: Row(
                                                                  mainAxisSize:
                                                                      MainAxisSize
                                                                          .max,
                                                                  children: [
                                                                    if (!valueOrDefault<
                                                                        bool>(
                                                                      functions.listaDentrodeListasubtask(
                                                                          getJsonField(
                                                                            listItemsItem,
                                                                            r'''$.subtasks''',
                                                                            true,
                                                                          ),
                                                                          _model.adcSubtaskSprint.toList()),
                                                                      false,
                                                                    ))
                                                                      InkWell(
                                                                        splashColor:
                                                                            Colors.transparent,
                                                                        focusColor:
                                                                            Colors.transparent,
                                                                        hoverColor:
                                                                            Colors.transparent,
                                                                        highlightColor:
                                                                            Colors.transparent,
                                                                        onTap:
                                                                            () async {
                                                                          for (int loop1Index = 0;
                                                                              loop1Index <
                                                                                  ((getJsonField(listItemsItem, r'''$.subtasks''', true) as List?)?.length ?? 0);
                                                                              loop1Index++) {
                                                                            final currentLoop1Item =
                                                                                (getJsonField(listItemsItem, r'''$.subtasks''', true) as List?)?[loop1Index];
                                                                            if (!_model.adcSubtaskSprint.contains(valueOrDefault<int>(
                                                                              getJsonField(
                                                                                currentLoop1Item,
                                                                                r'''$.id''',
                                                                              ),
                                                                              0,
                                                                            ))) {
                                                                              _model.addToAdcSubtaskSprint(valueOrDefault<int>(
                                                                                getJsonField(
                                                                                  currentLoop1Item,
                                                                                  r'''$.id''',
                                                                                ),
                                                                                0,
                                                                              ));
                                                                              safeSetState(() {});
                                                                            }
                                                                          }
                                                                          _model.mostracheck =
                                                                              true;
                                                                          safeSetState(
                                                                              () {});
                                                                        },
                                                                        child:
                                                                            Container(
                                                                          width:
                                                                              18.0,
                                                                          height:
                                                                              18.0,
                                                                          decoration:
                                                                              BoxDecoration(
                                                                            color:
                                                                                FlutterFlowTheme.of(context).secondaryBackground,
                                                                            borderRadius:
                                                                                BorderRadius.circular(4.0),
                                                                            border:
                                                                                Border.all(
                                                                              color: FlutterFlowTheme.of(context).alternate,
                                                                              width: 2.0,
                                                                            ),
                                                                          ),
                                                                        ),
                                                                      ),
                                                                    if (valueOrDefault<
                                                                        bool>(
                                                                      functions.listaDentrodeListasubtask(
                                                                          getJsonField(
                                                                            listItemsItem,
                                                                            r'''$.subtasks''',
                                                                            true,
                                                                          ),
                                                                          _model.adcSubtaskSprint.toList()),
                                                                      false,
                                                                    ))
                                                                      InkWell(
                                                                        splashColor:
                                                                            Colors.transparent,
                                                                        focusColor:
                                                                            Colors.transparent,
                                                                        hoverColor:
                                                                            Colors.transparent,
                                                                        highlightColor:
                                                                            Colors.transparent,
                                                                        onTap:
                                                                            () async {
                                                                          for (int loop1Index = 0;
                                                                              loop1Index <
                                                                                  ((getJsonField(listItemsItem, r'''$.subtasks''', true) as List?)?.length ?? 0);
                                                                              loop1Index++) {
                                                                            final currentLoop1Item =
                                                                                (getJsonField(listItemsItem, r'''$.subtasks''', true) as List?)?[loop1Index];
                                                                            _model.removeFromAdcSubtaskSprint(valueOrDefault<int>(
                                                                              getJsonField(
                                                                                currentLoop1Item,
                                                                                r'''$.id''',
                                                                              ),
                                                                              0,
                                                                            ));
                                                                            safeSetState(() {});
                                                                          }
                                                                          if (_model
                                                                              .campIds
                                                                              .isNotEmpty) {
                                                                            return;
                                                                          }

                                                                          safeSetState(
                                                                              () {
                                                                            _model.checkboxValue =
                                                                                false;
                                                                          });
                                                                          _model.mostracheck =
                                                                              false;
                                                                          safeSetState(
                                                                              () {});
                                                                        },
                                                                        child:
                                                                            Container(
                                                                          width:
                                                                              18.0,
                                                                          height:
                                                                              18.0,
                                                                          decoration:
                                                                              BoxDecoration(
                                                                            color:
                                                                                FlutterFlowTheme.of(context).primary,
                                                                            borderRadius:
                                                                                BorderRadius.circular(4.0),
                                                                            border:
                                                                                Border.all(
                                                                              color: FlutterFlowTheme.of(context).primary,
                                                                              width: 2.0,
                                                                            ),
                                                                          ),
                                                                          alignment: AlignmentDirectional(
                                                                              0.0,
                                                                              0.0),
                                                                          child:
                                                                              Icon(
                                                                            Icons.check_rounded,
                                                                            color:
                                                                                FlutterFlowTheme.of(context).secondaryBackground,
                                                                            size:
                                                                                15.0,
                                                                          ),
                                                                        ),
                                                                      ),
                                                                  ],
                                                                ),
                                                              ),
                                                            Expanded(
                                                              child: RichText(
                                                                textScaler: MediaQuery.of(
                                                                        context)
                                                                    .textScaler,
                                                                text: TextSpan(
                                                                  children: [
                                                                    TextSpan(
                                                                      text: valueOrDefault<
                                                                          String>(
                                                                        getJsonField(
                                                                          listItemsItem,
                                                                          r'''$.id''',
                                                                        )?.toString(),
                                                                        '-',
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
                                                                            color:
                                                                                FlutterFlowTheme.of(context).primary,
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                    ),
                                                                    TextSpan(
                                                                      text: FFLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        '7e7lh9di' /*   */,
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
                                                                            color:
                                                                                FlutterFlowTheme.of(context).primaryText,
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                    ),
                                                                    TextSpan(
                                                                      text: valueOrDefault<
                                                                          String>(
                                                                        getJsonField(
                                                                          listItemsItem,
                                                                          r'''$.description''',
                                                                        )?.toString(),
                                                                        '-',
                                                                      ),
                                                                      style: FlutterFlowTheme.of(
                                                                              context)
                                                                          .bodySmall
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.lexend(
                                                                              fontWeight: FlutterFlowTheme.of(context).bodySmall.fontWeight,
                                                                              fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                            ),
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                FlutterFlowTheme.of(context).bodySmall.fontWeight,
                                                                            fontStyle:
                                                                                FlutterFlowTheme.of(context).bodySmall.fontStyle,
                                                                          ),
                                                                    )
                                                                  ],
                                                                  style: FlutterFlowTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .override(
                                                                        font: GoogleFonts
                                                                            .lexend(
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .labelSmall
                                                                              .fontStyle,
                                                                        ),
                                                                        color: FlutterFlowTheme.of(context)
                                                                            .primaryText,
                                                                        letterSpacing:
                                                                            0.0,
                                                                        fontWeight: FlutterFlowTheme.of(context)
                                                                            .labelSmall
                                                                            .fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context)
                                                                            .labelSmall
                                                                            .fontStyle,
                                                                      ),
                                                                ),
                                                              ),
                                                            ),
                                                            Expanded(
                                                              child: Container(
                                                                width: 60.0,
                                                                decoration:
                                                                    BoxDecoration(),
                                                                child:
                                                                    SelectionArea(
                                                                        child:
                                                                            Text(
                                                                  'x${valueOrDefault<String>(
                                                                    getJsonField(
                                                                      listItemsItem,
                                                                      r'''$.weight''',
                                                                    )?.toString(),
                                                                    '-',
                                                                  )}',
                                                                  textAlign:
                                                                      TextAlign
                                                                          .center,
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
                                                                            .primary,
                                                                        letterSpacing:
                                                                            0.0,
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
                                                            Expanded(
                                                              child: Container(
                                                                decoration:
                                                                    BoxDecoration(
                                                                  color: FlutterFlowTheme.of(
                                                                          context)
                                                                      .secondaryBackground,
                                                                ),
                                                                child:
                                                                    Visibility(
                                                                  visible: FFAppConstants
                                                                          .zero !=
                                                                      getJsonField(
                                                                        listItemsItem,
                                                                        r'''$.quantity''',
                                                                      ),
                                                                  child:
                                                                      SelectionArea(
                                                                          child:
                                                                              Text(
                                                                    valueOrDefault<
                                                                        String>(
                                                                      getJsonField(
                                                                        listItemsItem,
                                                                        r'''$.quantity''',
                                                                      )?.toString(),
                                                                      '-',
                                                                    ),
                                                                    textAlign:
                                                                        TextAlign
                                                                            .center,
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
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontStyle,
                                                                        ),
                                                                  )),
                                                                ),
                                                              ),
                                                            ),
                                                            Expanded(
                                                              child: Container(
                                                                decoration:
                                                                    BoxDecoration(
                                                                  color: FlutterFlowTheme.of(
                                                                          context)
                                                                      .secondaryBackground,
                                                                ),
                                                                child:
                                                                    Visibility(
                                                                  visible:
                                                                      getJsonField(
                                                                            listItemsItem,
                                                                            r'''$.unity_1.unity''',
                                                                          ) !=
                                                                          null,
                                                                  child:
                                                                      SelectionArea(
                                                                          child:
                                                                              Text(
                                                                    valueOrDefault<
                                                                        String>(
                                                                      getJsonField(
                                                                        listItemsItem,
                                                                        r'''$.unity_1.unity''',
                                                                      )?.toString(),
                                                                      '-',
                                                                    ),
                                                                    textAlign:
                                                                        TextAlign
                                                                            .center,
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
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontStyle,
                                                                        ),
                                                                  )),
                                                                ),
                                                              ),
                                                            ),
                                                            Expanded(
                                                              child: Container(
                                                                decoration:
                                                                    BoxDecoration(
                                                                  color: FlutterFlowTheme.of(
                                                                          context)
                                                                      .secondaryBackground,
                                                                ),
                                                                child:
                                                                    Visibility(
                                                                  visible:
                                                                      getJsonField(
                                                                            listItemsItem,
                                                                            r'''$.unity_1.unity''',
                                                                          ) !=
                                                                          null,
                                                                  child:
                                                                      SelectionArea(
                                                                          child:
                                                                              Text(
                                                                    valueOrDefault<
                                                                        String>(
                                                                      getJsonField(
                                                                        listItemsItem,
                                                                        r'''$.discipline.discipline''',
                                                                      )?.toString(),
                                                                      '-',
                                                                    ),
                                                                    textAlign:
                                                                        TextAlign
                                                                            .center,
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
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight: FlutterFlowTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontWeight,
                                                                          fontStyle: FlutterFlowTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontStyle,
                                                                        ),
                                                                  )),
                                                                ),
                                                              ),
                                                            ),
                                                          ].divide(SizedBox(
                                                              width: 16.0)),
                                                        ),
                                                      ),
                                                      Container(
                                                        child: Visibility(
                                                          visible: getJsonField(
                                                                listItemsItem,
                                                                r'''$.subtasks''',
                                                              ) !=
                                                              null,
                                                          child: Padding(
                                                            padding:
                                                                EdgeInsetsDirectional
                                                                    .fromSTEB(
                                                                        48.0,
                                                                        0.0,
                                                                        0.0,
                                                                        0.0),
                                                            child: Builder(
                                                              builder:
                                                                  (context) {
                                                                final listSubtasks =
                                                                    getJsonField(
                                                                  listItemsItem,
                                                                  r'''$.subtasks''',
                                                                ).toList();

                                                                return ListView
                                                                    .separated(
                                                                  padding:
                                                                      EdgeInsets
                                                                          .zero,
                                                                  shrinkWrap:
                                                                      true,
                                                                  scrollDirection:
                                                                      Axis.vertical,
                                                                  itemCount:
                                                                      listSubtasks
                                                                          .length,
                                                                  separatorBuilder: (_,
                                                                          __) =>
                                                                      SizedBox(
                                                                          height:
                                                                              4.0),
                                                                  itemBuilder:
                                                                      (context,
                                                                          listSubtasksIndex) {
                                                                    final listSubtasksItem =
                                                                        listSubtasks[
                                                                            listSubtasksIndex];
                                                                    return Padding(
                                                                      padding: EdgeInsetsDirectional.fromSTEB(
                                                                          16.0,
                                                                          5.0,
                                                                          16.0,
                                                                          5.0),
                                                                      child:
                                                                          Row(
                                                                        mainAxisSize:
                                                                            MainAxisSize.max,
                                                                        mainAxisAlignment:
                                                                            MainAxisAlignment.start,
                                                                        children:
                                                                            [
                                                                          Padding(
                                                                            padding: EdgeInsetsDirectional.fromSTEB(
                                                                                8.0,
                                                                                0.0,
                                                                                0.0,
                                                                                0.0),
                                                                            child:
                                                                                Row(
                                                                              mainAxisSize: MainAxisSize.max,
                                                                              children: [
                                                                                if (!_model.adcSubtaskSprint.contains(valueOrDefault<int>(
                                                                                  getJsonField(
                                                                                    listSubtasksItem,
                                                                                    r'''$.id''',
                                                                                  ),
                                                                                  0,
                                                                                )))
                                                                                  InkWell(
                                                                                    splashColor: Colors.transparent,
                                                                                    focusColor: Colors.transparent,
                                                                                    hoverColor: Colors.transparent,
                                                                                    highlightColor: Colors.transparent,
                                                                                    onTap: () async {
                                                                                      _model.addToAdcSubtaskSprint(valueOrDefault<int>(
                                                                                        getJsonField(
                                                                                          listSubtasksItem,
                                                                                          r'''$.id''',
                                                                                        ),
                                                                                        0,
                                                                                      ));
                                                                                      safeSetState(() {});
                                                                                    },
                                                                                    child: Container(
                                                                                      width: 18.0,
                                                                                      height: 18.0,
                                                                                      decoration: BoxDecoration(
                                                                                        color: FlutterFlowTheme.of(context).secondaryBackground,
                                                                                        borderRadius: BorderRadius.circular(4.0),
                                                                                        border: Border.all(
                                                                                          color: FlutterFlowTheme.of(context).alternate,
                                                                                          width: 2.0,
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                if (_model.adcSubtaskSprint.contains(valueOrDefault<int>(
                                                                                  getJsonField(
                                                                                    listSubtasksItem,
                                                                                    r'''$.id''',
                                                                                  ),
                                                                                  0,
                                                                                )))
                                                                                  InkWell(
                                                                                    splashColor: Colors.transparent,
                                                                                    focusColor: Colors.transparent,
                                                                                    hoverColor: Colors.transparent,
                                                                                    highlightColor: Colors.transparent,
                                                                                    onTap: () async {
                                                                                      _model.removeFromAdcSubtaskSprint(valueOrDefault<int>(
                                                                                        getJsonField(
                                                                                          listSubtasksItem,
                                                                                          r'''$.id''',
                                                                                        ),
                                                                                        0,
                                                                                      ));
                                                                                      safeSetState(() {});
                                                                                      if (_model.campIds.isNotEmpty) {
                                                                                        return;
                                                                                      }

                                                                                      safeSetState(() {
                                                                                        _model.checkboxValue = false;
                                                                                      });
                                                                                    },
                                                                                    child: Container(
                                                                                      width: 18.0,
                                                                                      height: 18.0,
                                                                                      decoration: BoxDecoration(
                                                                                        color: FlutterFlowTheme.of(context).primary,
                                                                                        borderRadius: BorderRadius.circular(4.0),
                                                                                        border: Border.all(
                                                                                          color: FlutterFlowTheme.of(context).primary,
                                                                                          width: 2.0,
                                                                                        ),
                                                                                      ),
                                                                                      alignment: AlignmentDirectional(0.0, 0.0),
                                                                                      child: Icon(
                                                                                        Icons.check_rounded,
                                                                                        color: FlutterFlowTheme.of(context).secondaryBackground,
                                                                                        size: 15.0,
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                              ],
                                                                            ),
                                                                          ),
                                                                          Expanded(
                                                                            flex:
                                                                                2,
                                                                            child:
                                                                                Align(
                                                                              alignment: AlignmentDirectional(-1.0, 0.0),
                                                                              child: RichText(
                                                                                textScaler: MediaQuery.of(context).textScaler,
                                                                                text: TextSpan(
                                                                                  children: [
                                                                                    TextSpan(
                                                                                      text: getJsonField(
                                                                                        listSubtasksItem,
                                                                                        r'''$.id''',
                                                                                      )?.toString() ?? '-',
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
                                                                                        '9d3p4h8x' /*  Qtdd:  */,
                                                                                      ),
                                                                                      style: TextStyle(),
                                                                                    ),
                                                                                    TextSpan(
                                                                                      text: valueOrDefault<String>(
                                                                                        getJsonField(
                                                                                          listSubtasksItem,
                                                                                          r'''$.quantity''',
                                                                                        )?.toString(),
                                                                                        '0',
                                                                                      ),
                                                                                      style: TextStyle(),
                                                                                    ),
                                                                                    TextSpan(
                                                                                      text: FFLocalizations.of(context).getText(
                                                                                        'v8zqvfsk' /*  -  */,
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
                                                                                      )?.toString() ?? '-',
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
                                                                        ].divide(SizedBox(width: 12.0)),
                                                                      ),
                                                                    );
                                                                  },
                                                                );
                                                              },
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
                                        },
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (ProjectsGroup.getProjectsBacklogsRecordCall.list(
                                  containerGetProjectsBacklogsRecordResponse
                                      .jsonBody,
                                ) !=
                                null &&
                            (ProjectsGroup.getProjectsBacklogsRecordCall.list(
                              containerGetProjectsBacklogsRecordResponse
                                  .jsonBody,
                            ) ??
                                    [])
                                .isNotEmpty)
                          Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.max,
                                children: [
                                  Text(
                                    FFLocalizations.of(context).getText(
                                      'unpt0x2a' /* linhas por página: */,
                                    ),
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
                                          color: Color(0xB32D323F),
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
                                  FlutterFlowDropDown<int>(
                                    controller:
                                        _model.dropDownValueController ??=
                                            FormFieldController<int>(
                                      _model.dropDownValue ??= 10,
                                    ),
                                    options:
                                        List<int>.from([5, 10, 15, 20, 100]),
                                    optionLabels: [
                                      FFLocalizations.of(context).getText(
                                        '5jdupsk5' /* 5 */,
                                      ),
                                      FFLocalizations.of(context).getText(
                                        '0ebz3tiq' /* 10 */,
                                      ),
                                      FFLocalizations.of(context).getText(
                                        'mf3kn63t' /* 15 */,
                                      ),
                                      FFLocalizations.of(context).getText(
                                        '15ypleeq' /* 20 */,
                                      ),
                                      FFLocalizations.of(context).getText(
                                        'idhnxze6' /* 100 */,
                                      ),
                                      ''
                                    ],
                                    onChanged: (val) async {
                                      safeSetState(
                                          () => _model.dropDownValue = val);
                                      _model.perPage = _model.dropDownValue!;
                                      _model.page = 1;
                                      safeSetState(() {});
                                      safeSetState(() {
                                        _model.clearAddTarefas2Cache();
                                        _model.apiRequestCompleted3 = false;
                                      });
                                      await _model
                                          .waitForApiRequestCompleted3();
                                    },
                                    width: 62.0,
                                    height: 35.0,
                                    textStyle: FlutterFlowTheme.of(context)
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
                                          color: Color(0xB32D323F),
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
                                    hintText:
                                        FFLocalizations.of(context).getText(
                                      'm3llimtw' /* 10 */,
                                    ),
                                    icon: Icon(
                                      Icons.keyboard_arrow_down_rounded,
                                      color: Color(0xB276787D),
                                      size: 18.0,
                                    ),
                                    fillColor: FlutterFlowTheme.of(context)
                                        .secondaryBackground,
                                    elevation: 2.0,
                                    borderColor:
                                        FlutterFlowTheme.of(context).alternate,
                                    borderWidth: 0.0,
                                    borderRadius: 8.0,
                                    margin: EdgeInsetsDirectional.fromSTEB(
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
                                  '${_model.page.toString()} de ${ProjectsGroup.getProjectsBacklogsRecordCall.pageTotal(
                                        containerGetProjectsBacklogsRecordResponse
                                            .jsonBody,
                                      )?.toString()}',
                                  'N/A',
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
                                      color: Color(0xB22D323F),
                                      letterSpacing: 0.0,
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
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
                                    hoverColor: FlutterFlowTheme.of(context)
                                        .hoverNavBar,
                                    hoverIconColor: FlutterFlowTheme.of(context)
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
                                      if (_model.perPage != 1) {
                                        _model.page = _model.page + -1;
                                        safeSetState(() {});
                                        safeSetState(() {
                                          _model.clearAddTarefas2Cache();
                                          _model.apiRequestCompleted3 = false;
                                        });
                                        await _model
                                            .waitForApiRequestCompleted3();
                                        safeSetState(() {
                                          _model.clearAllIdsCache();
                                          _model.apiRequestCompleted1 = false;
                                        });
                                        await _model
                                            .waitForApiRequestCompleted1();
                                      }
                                    },
                                  ),
                                  FlutterFlowIconButton(
                                    borderRadius: 8.0,
                                    buttonSize: 40.0,
                                    hoverColor: FlutterFlowTheme.of(context)
                                        .hoverNavBar,
                                    hoverIconColor: FlutterFlowTheme.of(context)
                                        .secondaryBackground,
                                    hoverBorderColor:
                                        FlutterFlowTheme.of(context)
                                            .hoverNavBar,
                                    icon: Icon(
                                      Icons.arrow_forward_ios_rounded,
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
                                        _model.page = _model.page + 1;
                                        safeSetState(() {});
                                        safeSetState(() {
                                          _model.clearAddTarefas2Cache();
                                          _model.apiRequestCompleted3 = false;
                                        });
                                        await _model
                                            .waitForApiRequestCompleted3();
                                        safeSetState(() {
                                          _model.clearAllIdsCache();
                                          _model.apiRequestCompleted1 = false;
                                        });
                                        await _model
                                            .waitForApiRequestCompleted1();
                                      }
                                    },
                                  ),
                                ],
                              ),
                            ].divide(SizedBox(width: 24.0)),
                          ),
                        Divider(
                          thickness: 1.0,
                          color: FlutterFlowTheme.of(context).alternate,
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
                                  'yw29b3hd' /* Cancelar */,
                                ),
                                options: FFButtonOptions(
                                  width: 200.0,
                                  height: 40.0,
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      16.0, 0.0, 16.0, 0.0),
                                  iconPadding: EdgeInsetsDirectional.fromSTEB(
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
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontStyle,
                                      ),
                                  elevation: 0.0,
                                  borderSide: BorderSide(
                                    color:
                                        FlutterFlowTheme.of(context).alternate,
                                    width: 1.0,
                                  ),
                                  borderRadius: BorderRadius.circular(12.0),
                                  hoverColor:
                                      FlutterFlowTheme.of(context).hoverNavBar,
                                  hoverBorderSide: BorderSide(
                                    color: FlutterFlowTheme.of(context)
                                        .hoverNavBar,
                                    width: 1.0,
                                  ),
                                  hoverTextColor: FlutterFlowTheme.of(context)
                                      .primaryBackground,
                                ),
                              ),
                              Align(
                                alignment: AlignmentDirectional(0.0, 1.0),
                                child: Builder(
                                  builder: (context) => FFButtonWidget(
                                    onPressed: () async {
                                      await showDialog(
                                        barrierColor: Color(0x7F000000),
                                        context: context,
                                        builder: (dialogContext) {
                                          return Dialog(
                                            elevation: 0,
                                            insetPadding: EdgeInsets.zero,
                                            backgroundColor: Colors.transparent,
                                            alignment: AlignmentDirectional(
                                                    0.0, 0.0)
                                                .resolve(
                                                    Directionality.of(context)),
                                            child: ModalConfirmWidget(
                                              title: FFLocalizations.of(context)
                                                  .getText(
                                                'ju0pb9i4' /* Mover seleção para sprint atua... */,
                                              ),
                                              description:
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                'vytyrkfb' /* Todas as subtarefas selecionad... */,
                                              ),
                                              action: () async {
                                                var _shouldSetState = false;
                                                _model.addSprintTask =
                                                    await SprintsGroup
                                                        .addSprintsTasksRecordCall
                                                        .call(
                                                  bearerAuth:
                                                      FFAppState().token,
                                                  sprintsId: getJsonField(
                                                    widget!.json,
                                                    r'''$.id''',
                                                  ),
                                                  teamsId: widget!.teamId,
                                                  backlogsIdList:
                                                      _model.campIds,
                                                  subtasksIdList:
                                                      _model.adcSubtaskSprint,
                                                );

                                                _shouldSetState = true;
                                                if ((_model.addSprintTask
                                                        ?.succeeded ??
                                                    true)) {
                                                  FFAppState()
                                                      .filterManufacturers = [];
                                                  FFAppState()
                                                      .filterTypeModules = [];
                                                  FFAppState().filterUserSet =
                                                      [];
                                                  FFAppState().filterTrackers =
                                                      [];
                                                  FFAppState()
                                                          .filterManufactures =
                                                      FilterStruct();
                                                  FFAppState().filterTracker =
                                                      FilterStruct();
                                                  FFAppState().filterModules =
                                                      FilterStruct();
                                                  FFAppState().filterBacklog =
                                                      1;
                                                  FFAppState().filtroData = [];
                                                  FFAppState().filtroTeams = [];
                                                  FFAppState().filtroIdsCargo =
                                                      [];

                                                  FFAppState()
                                                          .filtroEstoqueStatus =
                                                      FilterStruct();
                                                  FFAppState()
                                                          .filtroBacklogSprint =
                                                      false;
                                                  FFAppState()
                                                          .filtroCategoryInventory =
                                                      FilterStruct();
                                                  FFAppState()
                                                      .filtroIdsStatusStakes = [];
                                                  FFAppState()
                                                      .filtroIdsStatusTracker = [];
                                                  FFAppState()
                                                      .filtroIdsTypeTracker = [];
                                                  safeSetState(() {});

                                                  context.pushNamed(
                                                    SprintAtualWidget.routeName,
                                                    queryParameters: {
                                                      'sprintId':
                                                          serializeParam(
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
                                                            PageTransitionType
                                                                .fade,
                                                        duration: Duration(
                                                            milliseconds: 0),
                                                      ),
                                                    },
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
                                                        child: ModalInfoWidget(
                                                          title: FFLocalizations
                                                                  .of(context)
                                                              .getText(
                                                            'd173a434' /* Erro */,
                                                          ),
                                                          description:
                                                              getJsonField(
                                                            (_model.addSprintTask
                                                                    ?.jsonBody ??
                                                                ''),
                                                            r'''$.message''',
                                                          )?.toString() ?? 'Erro desconhecido',
                                                        ),
                                                      );
                                                    },
                                                  );

                                                  return;
                                                }
                                              },
                                            ),
                                          );
                                        },
                                      );

                                      safeSetState(() {});
                                    },
                                    text: FFLocalizations.of(context).getText(
                                      'xiqggixa' /* Mover seleção para a sprint at... */,
                                    ),
                                    icon: Icon(
                                      Icons.move_up_rounded,
                                      size: 24.0,
                                    ),
                                    options: FFButtonOptions(
                                      height: 40.0,
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          16.0, 0.0, 16.0, 0.0),
                                      iconPadding:
                                          EdgeInsetsDirectional.fromSTEB(
                                              0.0, 0.0, 0.0, 0.0),
                                      color:
                                          FlutterFlowTheme.of(context).primary,
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
                                      elevation: 1.0,
                                      borderRadius: BorderRadius.circular(12.0),
                                    ),
                                  ),
                                ),
                              ),
                            ].divide(SizedBox(width: 12.0)),
                          ),
                        ),
                      ].divide(SizedBox(height: 16.0)),
                    );
                  },
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
