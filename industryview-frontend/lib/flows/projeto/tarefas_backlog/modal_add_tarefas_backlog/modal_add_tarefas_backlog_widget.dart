import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/comp_template_backlog_widget.dart';
import '/components/modal_confirm/modal_confirm_widget.dart';
import '/components/modal_empty_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/index.dart';
import 'dart:async';
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_add_tarefas_backlog_model.dart';
export 'modal_add_tarefas_backlog_model.dart';

class ModalAddTarefasBacklogWidget extends StatefulWidget {
  const ModalAddTarefasBacklogWidget({super.key});

  @override
  State<ModalAddTarefasBacklogWidget> createState() =>
      _ModalAddTarefasBacklogWidgetState();
}

class _ModalAddTarefasBacklogWidgetState
    extends State<ModalAddTarefasBacklogWidget> {
  late ModalAddTarefasBacklogModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalAddTarefasBacklogModel());

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

    return Padding(
      padding: EdgeInsets.all(24.0),
      child: FutureBuilder<ApiCallResponse>(
        future: (_model.apiRequestCompleter2 ??= Completer<ApiCallResponse>()
              ..complete(TasksGroup.queryAllTasksRecordsCall.call(
                page: _model.page,
                perPage: _model.perPage,
                bearerAuth: FFAppState().token,
                search: _model.textController.text,

                companyId: FFAppState().infoUser.companyId,
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
          final containerQueryAllTasksRecordsResponse = snapshot.data!;

          return Container(
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
              padding: EdgeInsets.all(24.0),
              child: FutureBuilder<ApiCallResponse>(
                future: _model
                    .queryAllIds(
                  requestFn: () => TasksGroup.queryAllIdsTasksCall.call(
                    page: _model.page,
                    perPage: _model.perPage,
                    bearerAuth: FFAppState().token,
                    search: _model.textController.text,

                    companyId: FFAppState().infoUser.companyId,
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
                  final columnQueryAllIdsTasksResponse = snapshot.data!;

                  return Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Column(
                        mainAxisSize: MainAxisSize.max,
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
                                      Icon(
                                        Icons.task_rounded,
                                        color: FlutterFlowTheme.of(context)
                                            .primary,
                                        size: 24.0,
                                      ),
                                      Align(
                                        alignment:
                                            AlignmentDirectional(-1.0, -1.0),
                                        child: SelectionArea(
                                            child: Text(
                                          FFLocalizations.of(context).getText(
                                            'bvopxdpv' /* Adicionar tarefas ao backlog d... */,
                                          ),
                                          style: FlutterFlowTheme.of(context)
                                              .headlineMedium
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight: FontWeight.w500,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
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
                                  SelectionArea(
                                      child: Text(
                                    FFLocalizations.of(context).getText(
                                      '81qmfiu6' /* Veja todas as tarefas da plata... */,
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
                                ],
                              ),
                              Divider(
                                height: 18.0,
                                thickness: 1.0,
                                color: FlutterFlowTheme.of(context).alternate,
                              ),
                            ].divide(SizedBox(height: 12.0)),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.max,
                                children: [
                                  Expanded(
                                    child: Container(
                                      constraints: BoxConstraints(
                                        maxWidth: 720.0,
                                      ),
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
                                            focusNode:
                                                _model.textFieldFocusNode,
                                            onChanged: (_) =>
                                                EasyDebounce.debounce(
                                              '_model.textController',
                                              Duration(milliseconds: 500),
                                              () async {
                                                safeSetState(() => _model
                                                        .apiRequestCompleter2 =
                                                    null);
                                                await _model
                                                    .waitForApiRequestCompleted2();
                                                safeSetState(() {
                                                  _model
                                                      .clearQueryAllIdsCache();
                                                  _model.apiRequestCompleted1 =
                                                      false;
                                                });
                                                await _model
                                                    .waitForApiRequestCompleted1();
                                              },
                                            ),
                                            onFieldSubmitted: (_) async {
                                              safeSetState(() => _model
                                                  .apiRequestCompleter2 = null);
                                              await _model
                                                  .waitForApiRequestCompleted2();
                                              safeSetState(() {
                                                _model.clearQueryAllIdsCache();
                                                _model.apiRequestCompleted1 =
                                                    false;
                                              });
                                              await _model
                                                  .waitForApiRequestCompleted1();
                                            },
                                            autofocus: false,
                                            obscureText: false,
                                            decoration: InputDecoration(
                                              labelText:
                                                  FFLocalizations.of(context)
                                                      .getText(
                                                'gv3kajr1' /* Procurar por código ou descriç... */,
                                              ),
                                              labelStyle:
                                                  FlutterFlowTheme.of(context)
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
                                              hintStyle:
                                                  FlutterFlowTheme.of(context)
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
                                              enabledBorder: OutlineInputBorder(
                                                borderSide: BorderSide(
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .alternate,
                                                  width: 1.0,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(12.0),
                                              ),
                                              focusedBorder: OutlineInputBorder(
                                                borderSide: BorderSide(
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .primary,
                                                  width: 1.0,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(12.0),
                                              ),
                                              errorBorder: OutlineInputBorder(
                                                borderSide: BorderSide(
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .error,
                                                  width: 1.0,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(12.0),
                                              ),
                                              focusedErrorBorder:
                                                  OutlineInputBorder(
                                                borderSide: BorderSide(
                                                  color: FlutterFlowTheme.of(
                                                          context)
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
                                                  EdgeInsetsDirectional
                                                      .fromSTEB(
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
                                          'wc8l3nf0' /* Filtros */,
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
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .secondaryText,
                                              letterSpacing: 0.0,
                                              fontWeight: FontWeight.w500,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
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
                                      color: FlutterFlowTheme.of(context)
                                          .alternate,
                                    ),
                                  ),
                                  Row(
                                    mainAxisSize: MainAxisSize.max,
                                    children: [
                                      if (_model.textController.text != null &&
                                          _model.textController.text != '')
                                        FFButtonWidget(
                                          onPressed: () async {
                                            safeSetState(() {
                                              _model.textController?.clear();
                                            });
                                            safeSetState(() => _model
                                                .apiRequestCompleter2 = null);
                                            await _model
                                                .waitForApiRequestCompleted2();
                                            safeSetState(() {
                                              _model.clearQueryAllIdsCache();
                                              _model.apiRequestCompleted1 =
                                                  false;
                                            });
                                            await _model
                                                .waitForApiRequestCompleted1();
                                          },
                                          text: FFLocalizations.of(context)
                                              .getText(
                                            'vibggrrn' /* Limpar */,
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
                                            textStyle:
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
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .error,
                                              width: 1.0,
                                            ),
                                            borderRadius:
                                                BorderRadius.circular(24.0),
                                            hoverColor:
                                                FlutterFlowTheme.of(context)
                                                    .error,
                                            hoverBorderSide: BorderSide(
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .error,
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
                            ],
                          ),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (FFAppState().setIds.isNotEmpty)
                                Align(
                                  alignment: AlignmentDirectional(-1.0, -1.0),
                                  child: SelectionArea(
                                      child: Text(
                                    FFAppState().setIds.length.toString(),
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
                                  )),
                                ),
                              Align(
                                alignment: AlignmentDirectional(-1.0, -1.0),
                                child: SelectionArea(
                                    child: Text(
                                  FFLocalizations.of(context).getText(
                                    'pxesbzbq' /* tarefas selecionadas para o ba... */,
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
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontStyle,
                                      ),
                                )),
                              ),
                            ].divide(SizedBox(width: 4.0)),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              Container(
                                width: MediaQuery.sizeOf(context).width * 1.0,
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
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      16.0, 0.0, 16.0, 0.0),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Row(
                                        mainAxisSize: MainAxisSize.max,
                                        children: [
                                          if (!(FFAppState()
                                              .listatasks
                                              .isNotEmpty))
                                            Padding(
                                              padding: EdgeInsetsDirectional
                                                  .fromSTEB(6.0, 0.0, 0.0, 0.0),
                                              child: InkWell(
                                                splashColor: Colors.transparent,
                                                focusColor: Colors.transparent,
                                                hoverColor: Colors.transparent,
                                                highlightColor:
                                                    Colors.transparent,
                                                onTap: () async {
                                                  _model.taskslist =
                                                      await actions
                                                          .loopTasksList(
                                                    TasksGroup
                                                        .queryAllIdsTasksCall
                                                        .ids(
                                                          columnQueryAllIdsTasksResponse
                                                              .jsonBody,
                                                        )!
                                                        .toList(),
                                                  );
                                                  FFAppState().listatasks = _model
                                                      .taskslist!
                                                      .toList()
                                                      .cast<ListaTasksStruct>();
                                                  _model.updatePage(() {});
                                                  safeSetState(() => _model
                                                          .apiRequestCompleter2 =
                                                      null);
                                                  await _model
                                                      .waitForApiRequestCompleted2();

                                                  safeSetState(() {});
                                                },
                                                child: Container(
                                                  width: 18.0,
                                                  height: 18.0,
                                                  decoration: BoxDecoration(
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .secondaryBackground,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            4.0),
                                                    border: Border.all(
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .alternate,
                                                      width: 2.0,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ),
                                          if (FFAppState()
                                              .listatasks
                                              .isNotEmpty)
                                            Padding(
                                              padding: EdgeInsetsDirectional
                                                  .fromSTEB(6.0, 0.0, 0.0, 0.0),
                                              child: InkWell(
                                                splashColor: Colors.transparent,
                                                focusColor: Colors.transparent,
                                                hoverColor: Colors.transparent,
                                                highlightColor:
                                                    Colors.transparent,
                                                onTap: () async {
                                                  FFAppState().listatasks = [];
                                                  _model.updatePage(() {});
                                                  safeSetState(() => _model
                                                          .apiRequestCompleter2 =
                                                      null);
                                                  await _model
                                                      .waitForApiRequestCompleted2();
                                                },
                                                child: Container(
                                                  width: 18.0,
                                                  height: 18.0,
                                                  decoration: BoxDecoration(
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .primary,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            4.0),
                                                    border: Border.all(
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .primary,
                                                      width: 2.0,
                                                    ),
                                                  ),
                                                  alignment:
                                                      AlignmentDirectional(
                                                          0.0, 0.0),
                                                  child: Icon(
                                                    Icons.check_rounded,
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .secondaryBackground,
                                                    size: 14.0,
                                                  ),
                                                ),
                                              ),
                                            ),
                                        ],
                                      ),
                                      Expanded(
                                        flex: 2,
                                        child: RichText(
                                          textScaler:
                                              MediaQuery.of(context).textScaler,
                                          text: TextSpan(
                                            children: [
                                              TextSpan(
                                                text:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  'zukpwj6u' /* COD */,
                                                ),
                                                style: FlutterFlowTheme.of(
                                                        context)
                                                    .labelSmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FontWeight.w600,
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
                                                          FontWeight.w600,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontStyle,
                                                    ),
                                              ),
                                              TextSpan(
                                                text:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  'rn2ztnmc' /*  - Tarefa */,
                                                ),
                                                style: TextStyle(),
                                              )
                                            ],
                                            style: FlutterFlowTheme.of(context)
                                                .labelSmall
                                                .override(
                                                  font: GoogleFonts.lexend(
                                                    fontWeight: FontWeight.w600,
                                                    fontStyle:
                                                        FlutterFlowTheme.of(
                                                                context)
                                                            .labelSmall
                                                            .fontStyle,
                                                  ),
                                                  letterSpacing: 0.0,
                                                  fontWeight: FontWeight.w600,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontStyle,
                                                ),
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        flex: 1,
                                        child: SelectionArea(
                                            child: Text(
                                          FFLocalizations.of(context).getText(
                                            'ib44yekp' /* Quantidade */,
                                          ),
                                          style: FlutterFlowTheme.of(context)
                                              .labelSmall
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight: FontWeight.w600,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontStyle,
                                                ),
                                                letterSpacing: 0.0,
                                                fontWeight: FontWeight.w600,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmall
                                                        .fontStyle,
                                              ),
                                        )),
                                      ),
                                      Expanded(
                                        flex: 1,
                                        child: SelectionArea(
                                            child: Text(
                                          FFLocalizations.of(context).getText(
                                            'mofvx1yp' /* Unidade/Medida */,
                                          ),
                                          style: FlutterFlowTheme.of(context)
                                              .labelSmall
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight: FontWeight.w600,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontStyle,
                                                ),
                                                letterSpacing: 0.0,
                                                fontWeight: FontWeight.w600,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmall
                                                        .fontStyle,
                                              ),
                                        )),
                                      ),
                                      Expanded(
                                        flex: 1,
                                        child: SelectionArea(
                                            child: Text(
                                          FFLocalizations.of(context).getText(
                                            'qz2ilxbq' /* Disciplina */,
                                          ),
                                          style: FlutterFlowTheme.of(context)
                                              .labelSmall
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight: FontWeight.w600,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontStyle,
                                                ),
                                                letterSpacing: 0.0,
                                                fontWeight: FontWeight.w600,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmall
                                                        .fontStyle,
                                              ),
                                        )),
                                      ),

                                      Container(
                                        width: 60.0,
                                        decoration: BoxDecoration(),
                                        child: SelectionArea(
                                            child: Text(
                                          FFLocalizations.of(context).getText(
                                            'ke4a7wbx' /* Peso */,
                                          ),
                                          textAlign: TextAlign.center,
                                          style: FlutterFlowTheme.of(context)
                                              .labelSmall
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight: FontWeight.w600,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontStyle,
                                                ),
                                                letterSpacing: 0.0,
                                                fontWeight: FontWeight.w600,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmall
                                                        .fontStyle,
                                              ),
                                        )),
                                      ),
                                    ].divide(SizedBox(width: 12.0)),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ].divide(SizedBox(height: 16.0)),
                      ),
                      Flexible(
                        child: Builder(
                          builder: (context) {
                            final listBacklog =
                                TasksGroup.queryAllTasksRecordsCall
                                        .list(
                                          containerQueryAllTasksRecordsResponse
                                              .jsonBody,
                                        )
                                        ?.toList() ??
                                    [];
                            if (listBacklog.isEmpty) {
                              return ModalEmptyWidget();
                            }

                            return ListView.builder(
                              padding: EdgeInsets.zero,
                              shrinkWrap: true,
                              scrollDirection: Axis.vertical,
                              itemCount: listBacklog.length,
                              itemBuilder: (context, listBacklogIndex) {
                                final listBacklogItem =
                                    listBacklog[listBacklogIndex];
                                return CompTemplateBacklogWidget(
                                  key: Key(
                                      'Keyc4m_${listBacklogIndex}_of_${listBacklog.length}'),
                                  templateID: getJsonField(
                                    listBacklogItem,
                                    r'''$.id''',
                                  ),
                                  descripiton: valueOrDefault<String>(
                                    getJsonField(
                                      listBacklogItem,
                                      r'''$.description''',
                                    )?.toString(),
                                    '-',
                                  ),
                                  unity: valueOrDefault<String>(
                                    getJsonField(
                                      listBacklogItem,
                                      r'''$.unity.unity''',
                                    )?.toString(),
                                    '-',
                                  ),
                                  equipamentTypeTXT: valueOrDefault<String>(
                                    getJsonField(
                                      listBacklogItem,
                                      r'''$._equipaments_types.type''',
                                    )?.toString(),
                                    '-',
                                  ),
                                  equipamentTypeID: getJsonField(
                                    listBacklogItem,
                                    r'''$._equipaments_types.id''',
                                  ),
                                  wiight: getJsonField(
                                    listBacklogItem,
                                    r'''$.weight''',
                                  ).toString(),
                                  index: listBacklogIndex,
                                  discipline: getJsonField(
                                    listBacklogItem,
                                    r'''$.discipline.discipline''',
                                  ).toString(),
                                );
                              },
                            );
                          },
                        ),
                      ),
                      if (TasksGroup.queryAllTasksRecordsCall.list(
                                containerQueryAllTasksRecordsResponse.jsonBody,
                              ) !=
                              null &&
                          (TasksGroup.queryAllTasksRecordsCall.list(
                            containerQueryAllTasksRecordsResponse.jsonBody,
                          ))!
                              .isNotEmpty)
                        Align(
                          alignment: AlignmentDirectional(0.0, 1.0),
                          child: Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.max,
                                children: [
                                  Text(
                                    FFLocalizations.of(context).getText(
                                      '2lvgklm8' /* linhas por página: */,
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
                                      _model.dropDownValue ??= _model.perPage,
                                    ),
                                    options: List<int>.from([5, 10, 15, 20]),
                                    optionLabels: [
                                      FFLocalizations.of(context).getText(
                                        'h4f80qx2' /* 5 */,
                                      ),
                                      FFLocalizations.of(context).getText(
                                        '7mlm8qw1' /* 10 */,
                                      ),
                                      FFLocalizations.of(context).getText(
                                        '54uygebe' /* 15 */,
                                      ),
                                      FFLocalizations.of(context).getText(
                                        'rew30t34' /* 20 */,
                                      ),
                                      ''
                                    ],
                                    onChanged: (val) async {
                                      safeSetState(
                                          () => _model.dropDownValue = val);
                                      _model.perPage = _model.dropDownValue!;
                                      _model.page = 1;
                                      safeSetState(() {});
                                      safeSetState(() =>
                                          _model.apiRequestCompleter2 = null);
                                      await _model
                                          .waitForApiRequestCompleted2();
                                      safeSetState(() {
                                        _model.clearQueryAllIdsCache();
                                        _model.apiRequestCompleted1 = false;
                                      });
                                      await _model
                                          .waitForApiRequestCompleted1();
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
                                      'jc82kh0i' /* 10 */,
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
                                '${_model.page.toString()} de ${getJsonField(
                                  containerQueryAllTasksRecordsResponse
                                      .jsonBody,
                                  r'''$.pageTotal''',
                                ).toString()}',
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
                                      if (_model.page != 1) {
                                        _model.page = _model.page + -1;
                                        safeSetState(() {});
                                        safeSetState(() =>
                                            _model.apiRequestCompleter2 = null);
                                        await _model
                                            .waitForApiRequestCompleted2();
                                        safeSetState(() {
                                          _model.clearQueryAllIdsCache();
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
                                          getJsonField(
                                            containerQueryAllTasksRecordsResponse
                                                .jsonBody,
                                            r'''$.pageTotal''',
                                          )) {
                                        _model.page = _model.page + 1;
                                        safeSetState(() {});
                                        safeSetState(() =>
                                            _model.apiRequestCompleter2 = null);
                                        await _model
                                            .waitForApiRequestCompleted2();
                                        safeSetState(() {
                                          _model.clearQueryAllIdsCache();
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
                        ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          FFButtonWidget(
                            onPressed: () async {
                              Navigator.pop(context);
                            },
                            text: FFLocalizations.of(context).getText(
                              'fwche427' /* Cancelar */,
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
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .labelMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .labelMedium
                                          .fontStyle,
                                    ),
                                    color: FlutterFlowTheme.of(context).primary,
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
                                color: FlutterFlowTheme.of(context).alternate,
                                width: 1.0,
                              ),
                              borderRadius: BorderRadius.circular(12.0),
                              hoverColor:
                                  FlutterFlowTheme.of(context).hoverNavBar,
                              hoverBorderSide: BorderSide(
                                color: FlutterFlowTheme.of(context).hoverNavBar,
                                width: 1.0,
                              ),
                              hoverTextColor: FlutterFlowTheme.of(context)
                                  .secondaryBackground,
                            ),
                          ),
                          Expanded(
                            child: Builder(
                              builder: (context) => FFButtonWidget(
                                onPressed: !(FFAppState().listatasks.isNotEmpty)
                                    ? null
                                    : () async {
                                        await showDialog(
                                          context: context,
                                          builder: (dialogContext) {
                                            return Dialog(
                                              elevation: 0,
                                              insetPadding: EdgeInsets.zero,
                                              backgroundColor:
                                                  Colors.transparent,
                                              alignment:
                                                  AlignmentDirectional(0.0, 0.0)
                                                      .resolve(
                                                          Directionality.of(
                                                              context)),
                                              child: ModalConfirmWidget(
                                                title:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  '3sjlrl5c' /* Adicionar tarefas ao backlog */,
                                                ),
                                                description:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  '2sr9amd8' /* Você tem certeza que deseja se... */,
                                                ),
                                                action: () async {
                                                  var _shouldSetState = false;
                                                  _model.aPiAddBacklog =
                                                      await ProjectsGroup
                                                          .addProjectsBacklogsRecordCall
                                                          .call(
                                                    bearerAuth:
                                                        FFAppState().token,
                                                    projectsId: FFAppState()
                                                        .projectsInfo
                                                        .id,
                                                    listaTasksJson: FFAppState()
                                                        .listatasks
                                                        .map((e) => e.toMap())
                                                        .toList(),
                                                  );

                                                  _shouldSetState = true;
                                                  if ((_model.aPiAddBacklog
                                                          ?.succeeded ??
                                                      true)) {
                                                    context.pushNamed(
                                                      BacklogTarefasWidget
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
                                                              Colors
                                                                  .transparent,
                                                          alignment: AlignmentDirectional(
                                                                  0.0, 0.0)
                                                              .resolve(
                                                                  Directionality.of(
                                                                      context)),
                                                          child:
                                                              ModalInfoWidget(
                                                            title: FFLocalizations
                                                                    .of(context)
                                                                .getText(
                                                              'fnkmksr8' /* Erro! */,
                                                            ),
                                                            description:
                                                                getJsonField(
                                                              (_model.aPiAddBacklog
                                                                      ?.jsonBody ??
                                                                  ''),
                                                              r'''$.message''',
                                                            ).toString(),
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
                                  '1tzp0a4s' /* Mover seleção para o backlog a... */,
                                ),
                                icon: Icon(
                                  Icons.move_down_rounded,
                                  size: 24.0,
                                ),
                                options: FFButtonOptions(
                                  height: 40.0,
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      16.0, 0.0, 16.0, 0.0),
                                  iconPadding: EdgeInsetsDirectional.fromSTEB(
                                      0.0, 0.0, 0.0, 0.0),
                                  color: FlutterFlowTheme.of(context).primary,
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
                                            .secondary,
                                        letterSpacing: 0.0,
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .fontStyle,
                                      ),
                                  elevation: 1.0,
                                  borderRadius: BorderRadius.circular(12.0),
                                  disabledColor:
                                      FlutterFlowTheme.of(context).alternate,
                                  disabledTextColor:
                                      FlutterFlowTheme.of(context)
                                          .secondaryText,
                                ),
                              ),
                            ),
                          ),
                        ].divide(SizedBox(width: 8.0)),
                      ),
                    ].divide(SizedBox(height: 16.0)),
                  );
                },
              ),
            ),
          );
        },
      ),
    );
  }
}
