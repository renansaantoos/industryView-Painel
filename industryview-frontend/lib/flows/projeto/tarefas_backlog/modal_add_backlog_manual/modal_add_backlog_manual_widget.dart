import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_confirm/modal_confirm_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_add_backlog_manual_model.dart';
export 'modal_add_backlog_manual_model.dart';
import '/flows/modal_criar_tarefa/modal_add_unity_widget.dart';
import '/flows/modal_criar_tarefa/modal_add_discipline_widget.dart';

class ModalAddBacklogManualWidget extends StatefulWidget {
  const ModalAddBacklogManualWidget({
    super.key,
    required this.type,
    this.items,
    this.refresh,
  });

  final String? type;
  final dynamic items;
  final Future Function()? refresh;

  @override
  State<ModalAddBacklogManualWidget> createState() =>
      _ModalAddBacklogManualWidgetState();
}

class _ModalAddBacklogManualWidgetState
    extends State<ModalAddBacklogManualWidget> {
  late ModalAddBacklogManualModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalAddBacklogManualModel());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _model.equipaments = EquipamentsTypeStruct(
        id: valueOrDefault<int>(
          getJsonField(
            widget!.items,
            r'''$.equipaments_types_id''',
          ),
          1,
        ),
      );
      safeSetState(() {});
    });

    _model.descriptionTextController ??= TextEditingController(
        text: getJsonField(
                  widget!.items,
                  r'''$.description''',
                ) !=
                null
            ? getJsonField(
                widget!.items,
                r'''$.description''',
              ).toString()
            : '');
    _model.descriptionFocusNode ??= FocusNode();

    _model.weightTextController ??= TextEditingController(
        text: getJsonField(
                  widget!.items,
                  r'''$.weight''',
                ) !=
                null
            ? getJsonField(
                widget!.items,
                r'''$.weight''',
              ).toString()
            : '');
    _model.weightFocusNode ??= FocusNode();

    _model.quantityTextController ??= TextEditingController(
        text: getJsonField(
                  widget!.items,
                  r'''$.quantity''',
                ) !=
                null
            ? getJsonField(
                widget!.items,
                r'''$.quantity''',
              ).toString()
            : '');
    _model.quantityFocusNode ??= FocusNode();

    _model.tasksQuantityTextController ??= TextEditingController();
    _model.tasksQuantityFocusNode ??= FocusNode();

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {
          _model.tasksQuantityTextController?.text =
              FFLocalizations.of(context).getText(
            'v0mgxns0' /* 1 */,
          );
        }));
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
        future: _model.criarTarefa(
          requestFn: () => ProjectsGroup.equipamentsTypeCall.call(
            bearerAuth: FFAppState().token,
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
          final containerEquipamentsTypeResponse = snapshot.data!;

          return Container(
            width: 600.0,
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
            child: Form(
              key: _model.formKey,
              autovalidateMode: AutovalidateMode.disabled,
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
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.task_rounded,
                                    color: FlutterFlowTheme.of(context).primary,
                                    size: 24.0,
                                  ),
                                  Align(
                                    alignment: AlignmentDirectional(-1.0, -1.0),
                                    child: SelectionArea(
                                        child: Text(
                                      widget!.type == 'creat'
                                          ? FFLocalizations.of(context)
                                              .getVariableText(
                                              ptText: 'Criar',
                                              esText: 'Para crear',
                                              enText: 'To create',
                                            )
                                          : FFLocalizations.of(context)
                                              .getVariableText(
                                              ptText: 'Editar',
                                              esText: 'Editar',
                                              enText: 'Edit',
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
                              SelectionArea(
                                  child: Text(
                                FFLocalizations.of(context).getText(
                                  'mcoxz3at' /* Crie e edite uma nova tarefa, ... */,
                                ),
                                style: FlutterFlowTheme.of(context)
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
                                      letterSpacing: 0.0,
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .labelMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
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
                      SingleChildScrollView(
                        primary: false,
                        child: Column(
                          mainAxisSize: MainAxisSize.max,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Column(
                                  mainAxisSize: MainAxisSize.max,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    SelectionArea(
                                        child: Text(
                                      FFLocalizations.of(context).getText(
                                        '2sp53m1p' /* Selecione para qual equipament... */,
                                      ),
                                      style: FlutterFlowTheme.of(context)
                                          .titleMedium
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleMedium
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleMedium
                                                      .fontStyle,
                                            ),
                                            color: FlutterFlowTheme.of(context)
                                                .primaryText,
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .titleMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .titleMedium
                                                    .fontStyle,
                                          ),
                                    )),
                                    Builder(
                                      builder: (context) {
                                        final listEquipaments =
                                            containerEquipamentsTypeResponse
                                                .jsonBody
                                                .toList();

                                        return SingleChildScrollView(
                                          scrollDirection: Axis.horizontal,
                                          child: Row(
                                            mainAxisSize: MainAxisSize.max,
                                            children: List.generate(
                                                listEquipaments.length,
                                                (listEquipamentsIndex) {
                                              final listEquipamentsItem =
                                                  listEquipaments[
                                                      listEquipamentsIndex];
                                              return InkWell(
                                                splashColor: Colors.transparent,
                                                focusColor: Colors.transparent,
                                                hoverColor: Colors.transparent,
                                                highlightColor:
                                                    Colors.transparent,
                                                onTap: () async {
                                                  _model.equipaments =
                                                      EquipamentsTypeStruct(
                                                    id: getJsonField(
                                                      listEquipamentsItem,
                                                      r'''$.id''',
                                                    ),
                                                    type: getJsonField(
                                                      listEquipamentsItem,
                                                      r'''$.type''',
                                                    ).toString(),
                                                  );
                                                  safeSetState(() {});
                                                },
                                                child: Container(
                                                  decoration: BoxDecoration(
                                                    color: _model.equipaments
                                                                ?.id ==
                                                            getJsonField(
                                                              listEquipamentsItem,
                                                              r'''$.id''',
                                                            )
                                                        ? FlutterFlowTheme.of(
                                                                context)
                                                            .primary
                                                        : FlutterFlowTheme.of(
                                                                context)
                                                            .secondaryBackground,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            100.0),
                                                    border: Border.all(
                                                      color: _model.equipaments
                                                                  ?.id ==
                                                              getJsonField(
                                                                listEquipamentsItem,
                                                                r'''$.id''',
                                                              )
                                                          ? FlutterFlowTheme.of(
                                                                  context)
                                                              .secondaryBackground
                                                          : FlutterFlowTheme.of(
                                                                  context)
                                                              .primary,
                                                      width: 1.0,
                                                    ),
                                                  ),
                                                  child: Padding(
                                                    padding:
                                                        EdgeInsetsDirectional
                                                            .fromSTEB(16.0, 8.0,
                                                                16.0, 8.0),
                                                    child: Text(
                                                      getJsonField(
                                                        listEquipamentsItem,
                                                        r'''$.type''',
                                                      ).toString(),
                                                      style:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .override(
                                                                font:
                                                                    GoogleFonts
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
                                                                color: _model
                                                                            .equipaments
                                                                            ?.id ==
                                                                        getJsonField(
                                                                          listEquipamentsItem,
                                                                          r'''$.id''',
                                                                        )
                                                                    ? FlutterFlowTheme.of(
                                                                            context)
                                                                        .info
                                                                    : FlutterFlowTheme.of(
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
                                                    ),
                                                  ),
                                                ),
                                              );
                                            }).divide(SizedBox(width: 12.0)),
                                          ),
                                        );
                                      },
                                    ),
                                  ].divide(SizedBox(height: 16.0)),
                                ),
                                Column(
                                  mainAxisSize: MainAxisSize.max,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    SelectionArea(
                                        child: Text(
                                      FFLocalizations.of(context).getText(
                                        'rzbd01ku' /* Descrição da tarefa */,
                                      ),
                                      style: FlutterFlowTheme.of(context)
                                          .titleMedium
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .titleMedium
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .titleMedium
                                                      .fontStyle,
                                            ),
                                            color: FlutterFlowTheme.of(context)
                                                .primaryText,
                                            fontSize: 12.0,
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .titleMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .titleMedium
                                                    .fontStyle,
                                          ),
                                    )),
                                    Container(
                                      width: MediaQuery.sizeOf(context).width *
                                          1.0,
                                      child: TextFormField(
                                        controller:
                                            _model.descriptionTextController,
                                        focusNode: _model.descriptionFocusNode,
                                        autofocus: false,
                                        obscureText: false,
                                        decoration: InputDecoration(
                                          alignLabelWithHint: false,
                                          hintText: FFLocalizations.of(context)
                                              .getText(
                                            '1xnckd4z' /* Descreva brevemente essa taref... */,
                                          ),
                                          errorStyle: FlutterFlowTheme.of(
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
                                        ),
                                        style: FlutterFlowTheme.of(context)
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
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .primaryText,
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
                                        maxLines: 2,
                                        keyboardType: TextInputType.number,
                                        validator: _model
                                            .descriptionTextControllerValidator
                                            .asValidator(context),
                                      ),
                                    ),
                                  ].divide(SizedBox(height: 4.0)),
                                ),
                                Column(
                                  mainAxisSize: MainAxisSize.max,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    SelectionArea(
                                        child: Text(
                                      FFLocalizations.of(context).getText(
                                        'o60cvv9m' /* Peso da tarefa */,
                                      ),
                                      style: FlutterFlowTheme.of(context)
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
                                                .primaryText,
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
                                    )),
                                    Container(
                                      width: MediaQuery.sizeOf(context).width *
                                          1.0,
                                      child: TextFormField(
                                        controller: _model.weightTextController,
                                        focusNode: _model.weightFocusNode,
                                        autofocus: false,
                                        obscureText: false,
                                        decoration: InputDecoration(
                                          alignLabelWithHint: false,
                                          hintText: FFLocalizations.of(context)
                                              .getText(
                                            'ja88ev5c' /* O peso da tarefa deve ser um m... */,
                                          ),
                                          hintStyle: FlutterFlowTheme.of(
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
                                                        .secondaryText,
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
                                          errorStyle: FlutterFlowTheme.of(
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
                                        ),
                                        style: FlutterFlowTheme.of(context)
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
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .primaryText,
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
                                        keyboardType: const TextInputType
                                            .numberWithOptions(decimal: true),
                                        validator: _model
                                            .weightTextControllerValidator
                                            .asValidator(context),
                                        inputFormatters: [
                                          FilteringTextInputFormatter.allow(
                                              RegExp('^\\d*\\.?\\d*\$'))
                                        ],
                                      ),
                                    ),
                                  ].divide(SizedBox(height: 4.0)),
                                ),
                              ].divide(SizedBox(height: 16.0)),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.max,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SelectionArea(
                              child: Text(
                            FFLocalizations.of(context).getText(
                              'bwjzojfm' /* Unidade/Medida */,
                            ),
                            style: FlutterFlowTheme.of(context)
                                .titleMedium
                                .override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .titleMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .titleMedium
                                        .fontStyle,
                                  ),
                                  color:
                                      FlutterFlowTheme.of(context).primaryText,
                                  fontSize: 12.0,
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .titleMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .titleMedium
                                      .fontStyle,
                                ),
                          )),
                          FutureBuilder<ApiCallResponse>(
                            future: _model.componeneUnity(
                              requestFn: () => TasksGroup.getUnityCall.call(
                                token: FFAppState().token,
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
                              final dropDownGetUnityResponse = snapshot.data!;
                              final unityIds = List<int>.from(TasksGroup.getUnityCall.id(dropDownGetUnityResponse.jsonBody) ?? []);
                              final unityLabels = List<String>.from(TasksGroup.getUnityCall.unity(dropDownGetUnityResponse.jsonBody) ?? []);
                              final unityMap = Map<int, String>.fromIterables(unityIds, unityLabels);
                              final selectedLabel = _model.dropDownValue != null ? (unityMap[_model.dropDownValue] ?? 'Selecione') : 'Selecione';

                              return Builder(
                                builder: (triggerContext) {
                                  return InkWell(
                                    onTap: () async {
                                      final RenderBox renderBox = triggerContext.findRenderObject() as RenderBox;
                                      final offset = renderBox.localToGlobal(Offset.zero);
                                      final size = renderBox.size;
                                      final screenSize = MediaQuery.of(context).size;
                                      
                                      const double maxMenuHeight = 350.0;
                                      final double bottomSpace = screenSize.height - (offset.dy + size.height);
                                      final double topSpace = offset.dy;
                                      
                                      bool opensUpward = false;
                                      if (bottomSpace < 100.0 && topSpace > bottomSpace) {
                                        opensUpward = true;
                                      }
                                      
                                      final double availableHeight = opensUpward ? topSpace : bottomSpace;
                                      final double menuHeight = availableHeight < maxMenuHeight ? availableHeight : maxMenuHeight;

                                      await showDialog(
                                        context: context,
                                        barrierColor: Colors.transparent,
                                        builder: (dialogContext) {
                                          String searchText = '';
                                          return Stack(
                                            children: [
                                              Positioned.fill(
                                                child: GestureDetector(
                                                  onTap: () => Navigator.pop(dialogContext),
                                                  behavior: HitTestBehavior.translucent,
                                                  child: Container(color: Colors.transparent),
                                                ),
                                              ),
                                              Positioned(
                                                left: offset.dx,
                                                top: opensUpward ? null : offset.dy + size.height,
                                                bottom: opensUpward ? screenSize.height - offset.dy : null,
                                                width: size.width,
                                                child: Material(
                                                  color: Colors.transparent,
                                                  elevation: 4,
                                                  borderRadius: BorderRadius.circular(8),
                                                  child: Container(
                                                    constraints: BoxConstraints(maxHeight: menuHeight),
                                                    decoration: BoxDecoration(
                                                      color: FlutterFlowTheme.of(context).secondaryBackground,
                                                      borderRadius: BorderRadius.circular(8),
                                                      border: Border.all(color: FlutterFlowTheme.of(context).alternate),
                                                    ),
                                                    child: StatefulBuilder(
                                                      builder: (context, setModalState) {
                                                        final filteredIds = unityIds.where((id) {
                                                          final label = unityMap[id] ?? '';
                                                          return label.toLowerCase().contains(searchText.toLowerCase());
                                                        }).toList();

                                                        return Column(
                                                          mainAxisSize: MainAxisSize.min,
                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                          children: [
                                                            Padding(
                                                              padding: EdgeInsets.fromLTRB(12, 12, 12, 8),
                                                              child: TextFormField(
                                                                autofocus: true,
                                                                onChanged: (val) => setModalState(() => searchText = val),
                                                                decoration: InputDecoration(
                                                                  isDense: true,
                                                                  hintText: 'Procurar',
                                                                  hintStyle: FlutterFlowTheme.of(context).labelMedium,
                                                                  enabledBorder: OutlineInputBorder(
                                                                    borderSide: BorderSide(color: FlutterFlowTheme.of(context).alternate),
                                                                    borderRadius: BorderRadius.circular(8),
                                                                  ),
                                                                  focusedBorder: OutlineInputBorder(
                                                                    borderSide: BorderSide(color: FlutterFlowTheme.of(context).primary),
                                                                    borderRadius: BorderRadius.circular(8),
                                                                  ),
                                                                  filled: true,
                                                                  fillColor: FlutterFlowTheme.of(context).primaryBackground,
                                                                  prefixIcon: Icon(Icons.search_rounded, size: 18, color: FlutterFlowTheme.of(context).secondaryText),
                                                                  contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                                                                ),
                                                                style: FlutterFlowTheme.of(context).bodyMedium,
                                                              ),
                                                            ),
                                                            Divider(height: 1, thickness: 1, color: FlutterFlowTheme.of(context).alternate),
                                                            Flexible(
                                                              child: filteredIds.isEmpty
                                                                  ? Padding(
                                                                      padding: EdgeInsets.all(16),
                                                                      child: Text('Nenhum resultado', style: FlutterFlowTheme.of(context).labelMedium),
                                                                    )
                                                                  : ListView.builder(
                                                                      padding: EdgeInsets.zero,
                                                                      shrinkWrap: true,
                                                                      itemCount: filteredIds.length,
                                                                      itemBuilder: (context, index) {
                                                                        final id = filteredIds[index];
                                                                        final label = unityMap[id] ?? '';
                                                                        final isSelected = _model.dropDownValue == id;
                                                                        
                                                                        return Container(
                                                                          color: isSelected ? FlutterFlowTheme.of(context).primary.withOpacity(0.08) : null,
                                                                          child: Row(
                                                                            children: [
                                                                              Expanded(
                                                                                child: InkWell(
                                                                                  onTap: () {
                                                                                    safeSetState(() => _model.dropDownValue = id);
                                                                                    Navigator.pop(dialogContext);
                                                                                  },
                                                                                  child: Padding(
                                                                                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                                                                    child: Row(
                                                                                      children: [
                                                                                        Expanded(
                                                                                          child: Text(
                                                                                            label,
                                                                                            style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                                                              font: GoogleFonts.lexend(
                                                                                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                                                                                color: isSelected ? FlutterFlowTheme.of(context).primary : FlutterFlowTheme.of(context).primaryText,
                                                                                              ),
                                                                                            ),
                                                                                          ),
                                                                                        ),
                                                                                        if (isSelected) 
                                                                                          Icon(Icons.check, size: 16, color: FlutterFlowTheme.of(context).primary),
                                                                                      ],
                                                                                    ),
                                                                                  ),
                                                                                ),
                                                                              ),
                                                                              Row(
                                                                                mainAxisSize: MainAxisSize.min,
                                                                                children: [
                                                                                  InkWell(
                                                                                    onTap: () async {
                                                                                      await showDialog(
                                                                                        context: context,
                                                                                        builder: (dialogContext) {
                                                                                          return ModalAddUnityWidget(
                                                                                            id: id,
                                                                                            name: label,
                                                                                            action: () async {
                                                                                              _model.clearComponeneUnityCache();
                                                                                              safeSetState(() {});
                                                                                            },
                                                                                          );
                                                                                        },
                                                                                      );
                                                                                      if (Navigator.canPop(dialogContext)) {
                                                                                         Navigator.pop(dialogContext);
                                                                                      }
                                                                                      safeSetState(() {});
                                                                                    },
                                                                                    child: Padding(
                                                                                      padding: EdgeInsets.all(8),
                                                                                      child: Icon(Icons.edit_outlined, size: 18, color: FlutterFlowTheme.of(context).secondaryText),
                                                                                    ),
                                                                                  ),
                                                                                  InkWell(
                                                                                    onTap: () async {
                                                                                       await showDialog(
                                                                                         context: context,
                                                                                         builder: (dialogContext) {
                                                                                           return ModalConfirmWidget(
                                                                                             title: 'Excluir Unidade',
                                                                                             description: 'Deseja realmente excluir "$label"?',
                                                                                             action: () async {
                                                                                               var _deleteUnity = await TasksGroup.deleteUnityCall.call(
                                                                                                  unityId: id,
                                                                                                  token: FFAppState().token,
                                                                                               );
                                                                                               if ((_deleteUnity.succeeded ?? true)) {
                                                                                                 _model.clearComponeneUnityCache();
                                                                                                 safeSetState(() {});
                                                                                               }
                                                                                             },
                                                                                           );
                                                                                         },
                                                                                       );
                                                                                       if (Navigator.canPop(dialogContext)) {
                                                                                         Navigator.pop(dialogContext);
                                                                                       }
                                                                                       safeSetState(() {});
                                                                                    },
                                                                                    child: Padding(
                                                                                      padding: EdgeInsets.fromLTRB(8, 8, 16, 8),
                                                                                      child: Icon(Icons.delete_outline, size: 18, color: FlutterFlowTheme.of(context).secondaryText),
                                                                                    ),
                                                                                  ),
                                                                                ],
                                                                              ),
                                                                            ],
                                                                          ),
                                                                        );
                                                                      },
                                                                    ),
                                                            ),
                                                            Padding(
                                                              padding: EdgeInsets.all(12),
                                                              child: Align(
                                                                alignment: Alignment.centerLeft,
                                                                child: FFButtonWidget(
                                                                  onPressed: () async {
                                                                    Navigator.pop(dialogContext);
                                                                    final _unityCreate = await showDialog(
                                                                      context: context,
                                                                      builder: (dialogContext) {
                                                                        return ModalAddUnityWidget(
                                                                          action: () async {
                                                                             _model.clearComponeneUnityCache();
                                                                             safeSetState(() {});
                                                                          },
                                                                        );
                                                                      },
                                                                    );
                                                                    if (_unityCreate != null && _unityCreate['id'] != null) {
                                                                       safeSetState(() => _model.dropDownValue = _unityCreate['id']);
                                                                    }
                                                                  },
                                                                  text: 'Criar Unidade',
                                                                  options: FFButtonOptions(
                                                                    width: 170.0,
                                                                    height: 40.0,
                                                                    padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                                                                    iconPadding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                                                                    color: FlutterFlowTheme.of(context).primary,
                                                                    textStyle: FlutterFlowTheme.of(context).labelMedium.override(
                                                                      fontFamily: 'Lexend',
                                                                      color: FlutterFlowTheme.of(context).info,
                                                                      letterSpacing: 0.0,
                                                                    ),
                                                                    elevation: 0.0,
                                                                    borderRadius: BorderRadius.circular(12.0),
                                                                  ),
                                                                ),
                                                              ),
                                                            ),
                                                          ],
                                                        );
                                                      },
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          );
                                        },
                                      );
                                    },
                                    child: Container(
                                      height: 48.0,
                                      decoration: BoxDecoration(
                                        color: FlutterFlowTheme.of(context).primaryBackground,
                                        borderRadius: BorderRadius.circular(8.0),
                                        border: Border.all(
                                          color: _model.erro1
                                              ? FlutterFlowTheme.of(context).error
                                              : FlutterFlowTheme.of(context).alternate,
                                          width: 1.0,
                                        ),
                                      ),
                                      padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            selectedLabel,
                                            style: FlutterFlowTheme.of(context).bodyMedium.override(
                                              font: GoogleFonts.lexend(
                                                color: _model.dropDownValue != null
                                                    ? FlutterFlowTheme.of(context).primaryText
                                                    : FlutterFlowTheme.of(context).secondaryText,
                                              ),
                                            ),
                                          ),
                                          Icon(
                                            Icons.keyboard_arrow_down_rounded,
                                            color: FlutterFlowTheme.of(context).secondaryText,
                                            size: 24.0,
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              );
                            },
                          ),
                          if (_model.erro1)
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  12.0, 0.0, 0.0, 0.0),
                              child: Text(
                                FFLocalizations.of(context).getText(
                                  '40q02ims' /* * Campo obrigatório */,
                                ),
                                style: FlutterFlowTheme.of(context)
                                    .bodyMedium
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FontWeight.w500,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .fontStyle,
                                      ),
                                      color: FlutterFlowTheme.of(context).error,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w500,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontStyle,
                                    ),
                              ),
                            ),
                        ].divide(SizedBox(height: 4.0)),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.max,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SelectionArea(
                              child: Text(
                            FFLocalizations.of(context).getText(
                              'jgtdxgcz' /* Quantidade */,
                            ),
                            style: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: FontWeight.w500,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight: FontWeight.w500,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .bodyMedium
                                      .fontStyle,
                                ),
                          )),
                          Container(
                            width: MediaQuery.sizeOf(context).width * 1.0,
                            child: TextFormField(
                              controller: _model.quantityTextController,
                              focusNode: _model.quantityFocusNode,
                              autofocus: false,
                              obscureText: false,
                              decoration: InputDecoration(
                                alignLabelWithHint: false,
                                hintText: FFLocalizations.of(context).getText(
                                  'zwpo18hb' /* Digite a quantidade */,
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: _model.erro2
                                        ? FlutterFlowTheme.of(context).error
                                        : FlutterFlowTheme.of(context)
                                            .alternate,
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
                                    color: Color(0x00000000),
                                    width: 1.0,
                                  ),
                                  borderRadius: BorderRadius.circular(12.0),
                                ),
                                focusedErrorBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: Color(0x00000000),
                                    width: 1.0,
                                  ),
                                  borderRadius: BorderRadius.circular(12.0),
                                ),
                                filled: true,
                                fillColor: FlutterFlowTheme.of(context)
                                    .primaryBackground,
                              ),
                              style: FlutterFlowTheme.of(context)
                                  .labelSmall
                                  .override(
                                    font: GoogleFonts.lexend(
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .fontStyle,
                                    ),
                                    color: FlutterFlowTheme.of(context)
                                        .primaryText,
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontStyle,
                                  ),
                              keyboardType:
                                  const TextInputType.numberWithOptions(
                                      signed: true, decimal: true),
                              validator: _model.quantityTextControllerValidator
                                  .asValidator(context),
                              inputFormatters: [
                                FilteringTextInputFormatter.allow(
                                    RegExp('^\\d*\\.?\\d*\$'))
                              ],
                            ),
                          ),
                          if (_model.erro2)
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  12.0, 0.0, 0.0, 0.0),
                              child: Text(
                                FFLocalizations.of(context).getText(
                                  '8027sdpc' /* * Campo obrigatório */,
                                ),
                                style: FlutterFlowTheme.of(context)
                                    .bodyMedium
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FontWeight.w500,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .fontStyle,
                                      ),
                                      color: FlutterFlowTheme.of(context).error,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w500,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontStyle,
                                    ),
                              ),
                            ),
                        ].divide(SizedBox(height: 4.0)),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.max,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SelectionArea(
                              child: Text(
                            FFLocalizations.of(context).getText(
                              'e2r4r6dm' /* Disciplina */,
                            ),
                            style: FlutterFlowTheme.of(context)
                                .titleMedium
                                .override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .titleMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .titleMedium
                                        .fontStyle,
                                  ),
                                  color:
                                      FlutterFlowTheme.of(context).primaryText,
                                  fontSize: 12.0,
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .titleMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .titleMedium
                                      .fontStyle,
                                ),
                          )),
                          FutureBuilder<ApiCallResponse>(
                            future: _model.discipline(
                              requestFn: () => DisciplineGroup.disciplineCall.call(
                                token: FFAppState().token,
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
                              final dropDisciplineDisciplineResponse = snapshot.data!;
                              final disciplineIds = List<int>.from(DisciplineGroup.disciplineCall.id(dropDisciplineDisciplineResponse.jsonBody) ?? []);
                              final disciplineLabels = List<String>.from(DisciplineGroup.disciplineCall.discipline(dropDisciplineDisciplineResponse.jsonBody) ?? []);
                              final disciplineMap = Map<int, String>.fromIterables(disciplineIds, disciplineLabels);
                              final selectedLabel = _model.dropDisciplineValue != null ? (disciplineMap[_model.dropDisciplineValue] ?? 'Selecione') : 'Selecione';

                              return Builder(
                                builder: (triggerContext) {
                                  return InkWell(
                                    onTap: () async {
                                      final RenderBox renderBox = triggerContext.findRenderObject() as RenderBox;
                                      final offset = renderBox.localToGlobal(Offset.zero);
                                      final size = renderBox.size;
                                      final screenSize = MediaQuery.of(context).size;
                                      
                                      const double maxMenuHeight = 350.0;
                                      final double bottomSpace = screenSize.height - (offset.dy + size.height);
                                      final double topSpace = offset.dy;
                                      
                                      bool opensUpward = false;
                                      if (bottomSpace < 100.0 && topSpace > bottomSpace) {
                                        opensUpward = true;
                                      }
                                      
                                      final double availableHeight = opensUpward ? topSpace : bottomSpace;
                                      final double menuHeight = availableHeight < maxMenuHeight ? availableHeight : maxMenuHeight;

                                      await showDialog(
                                        context: context,
                                        barrierColor: Colors.transparent,
                                        builder: (dialogContext) {
                                          String searchText = '';
                                          return Stack(
                                            children: [
                                              Positioned.fill(
                                                child: GestureDetector(
                                                  onTap: () => Navigator.pop(dialogContext),
                                                  behavior: HitTestBehavior.translucent,
                                                  child: Container(color: Colors.transparent),
                                                ),
                                              ),
                                              Positioned(
                                                left: offset.dx,
                                                top: opensUpward ? null : offset.dy + size.height,
                                                bottom: opensUpward ? screenSize.height - offset.dy : null,
                                                width: size.width,
                                                child: Material(
                                                  color: Colors.transparent,
                                                  elevation: 4,
                                                  borderRadius: BorderRadius.circular(8),
                                                  child: Container(
                                                    constraints: BoxConstraints(maxHeight: menuHeight),
                                                    decoration: BoxDecoration(
                                                      color: FlutterFlowTheme.of(context).secondaryBackground,
                                                      borderRadius: BorderRadius.circular(8),
                                                      border: Border.all(color: FlutterFlowTheme.of(context).alternate),
                                                    ),
                                                    child: StatefulBuilder(
                                                      builder: (context, setModalState) {
                                                        final filteredIds = disciplineIds.where((id) {
                                                          final label = disciplineMap[id] ?? '';
                                                          return label.toLowerCase().contains(searchText.toLowerCase());
                                                        }).toList();

                                                        return Column(
                                                          mainAxisSize: MainAxisSize.min,
                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                          children: [
                                                            Padding(
                                                              padding: EdgeInsets.fromLTRB(12, 12, 12, 8),
                                                              child: TextFormField(
                                                                autofocus: true,
                                                                onChanged: (val) => setModalState(() => searchText = val),
                                                                decoration: InputDecoration(
                                                                  isDense: true,
                                                                  hintText: 'Procurar',
                                                                  hintStyle: FlutterFlowTheme.of(context).labelMedium,
                                                                  enabledBorder: OutlineInputBorder(
                                                                    borderSide: BorderSide(color: FlutterFlowTheme.of(context).alternate),
                                                                    borderRadius: BorderRadius.circular(8),
                                                                  ),
                                                                  focusedBorder: OutlineInputBorder(
                                                                    borderSide: BorderSide(color: FlutterFlowTheme.of(context).primary),
                                                                    borderRadius: BorderRadius.circular(8),
                                                                  ),
                                                                  filled: true,
                                                                  fillColor: FlutterFlowTheme.of(context).primaryBackground,
                                                                  prefixIcon: Icon(Icons.search_rounded, size: 18, color: FlutterFlowTheme.of(context).secondaryText),
                                                                  contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                                                                ),
                                                                style: FlutterFlowTheme.of(context).bodyMedium,
                                                              ),
                                                            ),
                                                            Divider(height: 1, thickness: 1, color: FlutterFlowTheme.of(context).alternate),
                                                            Flexible(
                                                              child: filteredIds.isEmpty
                                                                  ? Padding(
                                                                      padding: EdgeInsets.all(16),
                                                                      child: Text('Nenhum resultado', style: FlutterFlowTheme.of(context).labelMedium),
                                                                    )
                                                                  : ListView.builder(
                                                                      padding: EdgeInsets.zero,
                                                                      shrinkWrap: true,
                                                                      itemCount: filteredIds.length,
                                                                      itemBuilder: (context, index) {
                                                                        final id = filteredIds[index];
                                                                        final label = disciplineMap[id] ?? '';
                                                                        final isSelected = _model.dropDisciplineValue == id;
                                                                        
                                                                        return Container(
                                                                          color: isSelected ? FlutterFlowTheme.of(context).primary.withOpacity(0.08) : null,
                                                                          child: Row(
                                                                            children: [
                                                                              Expanded(
                                                                                child: InkWell(
                                                                                  onTap: () {
                                                                                    safeSetState(() => _model.dropDisciplineValue = id);
                                                                                    Navigator.pop(dialogContext);
                                                                                  },
                                                                                  child: Padding(
                                                                                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                                                                    child: Row(
                                                                                      children: [
                                                                                        Expanded(
                                                                                          child: Text(
                                                                                            label,
                                                                                            style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                                                              font: GoogleFonts.lexend(
                                                                                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                                                                                color: isSelected ? FlutterFlowTheme.of(context).primary : FlutterFlowTheme.of(context).primaryText,
                                                                                              ),
                                                                                            ),
                                                                                          ),
                                                                                        ),
                                                                                        if (isSelected) 
                                                                                          Icon(Icons.check, size: 16, color: FlutterFlowTheme.of(context).primary),
                                                                                      ],
                                                                                    ),
                                                                                  ),
                                                                                ),
                                                                              ),
                                                                              Row(
                                                                                mainAxisSize: MainAxisSize.min,
                                                                                children: [
                                                                                  InkWell(
                                                                                    onTap: () async {
                                                                                      await showDialog(
                                                                                        context: context,
                                                                                        builder: (dialogContext) {
                                                                                          return ModalAddDisciplineWidget(
                                                                                            id: id,
                                                                                            name: label,
                                                                                            action: () async {
                                                                                              _model.clearDisciplineCache();
                                                                                              safeSetState(() {});
                                                                                            },
                                                                                          );
                                                                                        },
                                                                                      );
                                                                                      if (Navigator.canPop(dialogContext)) {
                                                                                         Navigator.pop(dialogContext);
                                                                                      }
                                                                                      safeSetState(() {});
                                                                                    },
                                                                                    child: Padding(
                                                                                      padding: EdgeInsets.all(8),
                                                                                      child: Icon(Icons.edit_outlined, size: 18, color: FlutterFlowTheme.of(context).secondaryText),
                                                                                    ),
                                                                                  ),
                                                                                  InkWell(
                                                                                    onTap: () async {
                                                                                       await showDialog(
                                                                                         context: context,
                                                                                         builder: (dialogContext) {
                                                                                           return ModalConfirmWidget(
                                                                                             title: 'Excluir Disciplina',
                                                                                             description: 'Deseja realmente excluir "$label"?',
                                                                                             action: () async {
                                                                                               var _deleteDiscipline = await DisciplineGroup.deleteDisciplineCall.call(
                                                                                                  disciplineId: id,
                                                                                                  token: FFAppState().token,
                                                                                               );
                                                                                               if ((_deleteDiscipline.succeeded ?? true)) {
                                                                                                 _model.clearDisciplineCache();
                                                                                                 safeSetState(() {});
                                                                                               }
                                                                                             },
                                                                                           );
                                                                                         },
                                                                                       );
                                                                                       if (Navigator.canPop(dialogContext)) {
                                                                                         Navigator.pop(dialogContext);
                                                                                       }
                                                                                       safeSetState(() {});
                                                                                    },
                                                                                    child: Padding(
                                                                                      padding: EdgeInsets.fromLTRB(8, 8, 16, 8),
                                                                                      child: Icon(Icons.delete_outline, size: 18, color: FlutterFlowTheme.of(context).secondaryText),
                                                                                    ),
                                                                                  ),
                                                                                ],
                                                                              ),
                                                                            ],
                                                                          ),
                                                                        );
                                                                      },
                                                                    ),
                                                            ),
                                                            Padding(
                                                              padding: EdgeInsets.all(12),
                                                              child: Align(
                                                                alignment: Alignment.centerLeft,
                                                                child: FFButtonWidget(
                                                                  onPressed: () async {
                                                                    Navigator.pop(dialogContext);
                                                                    final _disciplineCreate = await showDialog(
                                                                      context: context,
                                                                      builder: (dialogContext) {
                                                                        return ModalAddDisciplineWidget(
                                                                          action: () async {
                                                                             _model.clearDisciplineCache();
                                                                             safeSetState(() {});
                                                                          },
                                                                        );
                                                                      },
                                                                    );
                                                                    if (_disciplineCreate != null && _disciplineCreate['id'] != null) {
                                                                       safeSetState(() => _model.dropDisciplineValue = _disciplineCreate['id']);
                                                                    }
                                                                  },
                                                                  text: 'Criar Disciplina',
                                                                  options: FFButtonOptions(
                                                                    width: 170.0,
                                                                    height: 40.0,
                                                                    padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                                                                    iconPadding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                                                                    color: FlutterFlowTheme.of(context).primary,
                                                                    textStyle: FlutterFlowTheme.of(context).labelMedium.override(
                                                                      fontFamily: 'Lexend',
                                                                      color: FlutterFlowTheme.of(context).info,
                                                                      letterSpacing: 0.0,
                                                                    ),
                                                                    elevation: 0.0,
                                                                    borderRadius: BorderRadius.circular(12.0),
                                                                  ),
                                                                ),
                                                              ),
                                                            ),
                                                          ],
                                                        );
                                                      },
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          );
                                        },
                                      );
                                    },
                                    child: Container(
                                      height: 48.0,
                                      decoration: BoxDecoration(
                                        color: FlutterFlowTheme.of(context).primaryBackground,
                                        borderRadius: BorderRadius.circular(8.0),
                                        border: Border.all(
                                          color: _model.erro3
                                              ? FlutterFlowTheme.of(context).error
                                              : FlutterFlowTheme.of(context).alternate,
                                          width: 1.0,
                                        ),
                                      ),
                                      padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
                                      child: Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            selectedLabel,
                                            style: FlutterFlowTheme.of(context).bodyMedium.override(
                                              font: GoogleFonts.lexend(
                                                color: _model.dropDisciplineValue != null
                                                    ? FlutterFlowTheme.of(context).primaryText
                                                    : FlutterFlowTheme.of(context).secondaryText,
                                              ),
                                            ),
                                          ),
                                          Icon(
                                            Icons.keyboard_arrow_down_rounded,
                                            color: FlutterFlowTheme.of(context).secondaryText,
                                            size: 24.0,
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              );
                            },
                          ),
                          if (_model.erro3)
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  12.0, 0.0, 0.0, 0.0),
                              child: Text(
                                FFLocalizations.of(context).getText(
                                  'aavhs1h0' /* * Campo obrigatório */,
                                ),
                                style: FlutterFlowTheme.of(context)
                                    .bodyMedium
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FontWeight.w500,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .fontStyle,
                                      ),
                                      color: FlutterFlowTheme.of(context).error,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w500,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontStyle,
                                    ),
                              ),
                            ),
                        ].divide(SizedBox(height: 4.0)),
                      ),
                      if (widget!.type == 'creat')
                        Column(
                          mainAxisSize: MainAxisSize.max,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SelectionArea(
                                child: Text(
                              FFLocalizations.of(context).getText(
                                'vsjuev34' /* Quantidade de tarefas a criar */,
                              ),
                              style: FlutterFlowTheme.of(context)
                                  .bodyMedium
                                  .override(
                                    font: GoogleFonts.lexend(
                                      fontWeight: FontWeight.w500,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontStyle,
                                    ),
                                    letterSpacing: 0.0,
                                    fontWeight: FontWeight.w500,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontStyle,
                                  ),
                            )),
                            Container(
                              width: MediaQuery.sizeOf(context).width * 1.0,
                              child: TextFormField(
                                controller: _model.tasksQuantityTextController,
                                focusNode: _model.tasksQuantityFocusNode,
                                autofocus: false,
                                obscureText: false,
                                decoration: InputDecoration(
                                  alignLabelWithHint: false,
                                  hintText: FFLocalizations.of(context).getText(
                                    'xxnsbtfr' /* Digite a quantidade */,
                                  ),
                                  errorStyle: FlutterFlowTheme.of(context)
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
                                        color:
                                            FlutterFlowTheme.of(context).error,
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
                                      color: FlutterFlowTheme.of(context)
                                          .alternate,
                                      width: 1.0,
                                    ),
                                    borderRadius: BorderRadius.circular(12.0),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: BorderSide(
                                      color:
                                          FlutterFlowTheme.of(context).primary,
                                      width: 1.0,
                                    ),
                                    borderRadius: BorderRadius.circular(12.0),
                                  ),
                                  errorBorder: OutlineInputBorder(
                                    borderSide: BorderSide(
                                      color: Color(0x00000000),
                                      width: 1.0,
                                    ),
                                    borderRadius: BorderRadius.circular(12.0),
                                  ),
                                  focusedErrorBorder: OutlineInputBorder(
                                    borderSide: BorderSide(
                                      color: Color(0x00000000),
                                      width: 1.0,
                                    ),
                                    borderRadius: BorderRadius.circular(12.0),
                                  ),
                                  filled: true,
                                  fillColor: FlutterFlowTheme.of(context)
                                      .primaryBackground,
                                ),
                                style: FlutterFlowTheme.of(context)
                                    .labelSmall
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .labelSmall
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .labelSmall
                                            .fontStyle,
                                      ),
                                      color: FlutterFlowTheme.of(context)
                                          .primaryText,
                                      letterSpacing: 0.0,
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .fontStyle,
                                    ),
                                keyboardType: TextInputType.number,
                                validator: _model
                                    .tasksQuantityTextControllerValidator
                                    .asValidator(context),
                              ),
                            ),
                          ].divide(SizedBox(height: 4.0)),
                        ),
                      Divider(
                        thickness: 1.0,
                        color: FlutterFlowTheme.of(context).alternate,
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          FFButtonWidget(
                            onPressed: () async {
                              Navigator.pop(context);
                            },
                            text: FFLocalizations.of(context).getText(
                              'yzfl1xet' /* Cancelar */,
                            ),
                            options: FFButtonOptions(
                              width: 200.0,
                              height: 40.0,
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 0.0, 16.0, 0.0),
                              iconPadding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 0.0, 0.0),
                              color: FlutterFlowTheme.of(context).secondary,
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
                                onPressed: () async {
                                  var _shouldSetState = false;
                                  _model.form1 = true;
                                  if (_model.formKey.currentState == null ||
                                      !_model.formKey.currentState!
                                          .validate()) {
                                    _model.form1 = false;
                                  }
                                  _shouldSetState = true;
                                  if (_model.form1! &&
                                      (_model.dropDownValue != null) &&
                                      (_model.quantityTextController.text !=
                                              null &&
                                          _model.quantityTextController.text !=
                                              '') &&
                                      (_model.dropDisciplineValue != null)) {
                                    _model.erro1 = false;
                                    _model.erro2 = false;
                                    _model.erro3 = false;
                                    safeSetState(() {});
                                  } else {
                                    _model.erro1 = _model.dropDownValue != null
                                        ? false
                                        : true;
                                    _model.erro2 =
                                        _model.quantityTextController.text !=
                                                    null &&
                                                _model.quantityTextController
                                                        .text !=
                                                    ''
                                            ? false
                                            : true;
                                    _model.erro3 =
                                        _model.dropDisciplineValue != null
                                            ? false
                                            : true;
                                    safeSetState(() {});
                                    if (_shouldSetState) safeSetState(() {});
                                    return;
                                  }

                                  await showDialog(
                                    context: context,
                                    builder: (dialogContext) {
                                      return Dialog(
                                        elevation: 0,
                                        insetPadding: EdgeInsets.zero,
                                        backgroundColor: Colors.transparent,
                                        alignment:
                                            AlignmentDirectional(0.0, 0.0)
                                                .resolve(
                                                    Directionality.of(context)),
                                        child: ModalConfirmWidget(
                                          title: FFLocalizations.of(context)
                                              .getText(
                                            'vovxkms5' /* Adicionar tarefa ao backlog */,
                                          ),
                                          description:
                                              FFLocalizations.of(context)
                                                  .getText(
                                            '90g6yiiu' /* Você tem certeza que deseja cr... */,
                                          ),
                                          action: () async {
                                            var _shouldSetState = false;
                                            if (widget!.type == 'creat') {
                                              _model.addManualCreat =
                                                  await ProjectsGroup
                                                      .addTasksBacklogManualCall
                                                      .call(
                                                token: FFAppState().token,
                                                projectsId: FFAppState()
                                                    .projectsInfo
                                                    .id,
                                                quantity: double.tryParse(_model
                                                    .quantityTextController
                                                    .text),
                                                equipamentsTypesId:
                                                    _model.equipaments?.id,
                                                description: _model
                                                    .descriptionTextController
                                                    .text,
                                                weight: double.tryParse(_model
                                                    .weightTextController.text),
                                                unityId: _model.dropDownValue,
                                                taskQuantity: int.tryParse(_model
                                                    .tasksQuantityTextController
                                                    .text),
                                                disciplineId:
                                                    _model.dropDisciplineValue,
                                              );

                                              _shouldSetState = true;
                                              if (!(_model.addManualCreat
                                                      ?.succeeded ??
                                                  true)) {
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
                                                          'cml3hh39' /* Erro */,
                                                        ),
                                                        description:
                                                            getJsonField(
                                                          (_model.addManualCreat
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
                                            } else {
                                              _model.addManualEdit =
                                                  await ProjectsGroup
                                                      .editTaskBacklogCall
                                                      .call(
                                                token: FFAppState().token,
                                                description: _model
                                                    .descriptionTextController
                                                    .text,
                                                equipamentsTypesId:
                                                    _model.equipaments?.id,
                                                weight: double.tryParse(_model
                                                    .weightTextController.text),
                                                unityId: _model.dropDownValue,
                                                quantity: double.tryParse(_model
                                                    .quantityTextController
                                                    .text),
                                                projectsBacklogsId:
                                                    getJsonField(
                                                  widget!.items,
                                                  r'''$.id''',
                                                ),
                                                disciplineId:
                                                    _model.dropDisciplineValue,
                                              );

                                              _shouldSetState = true;
                                              if (!(_model.addManualEdit
                                                      ?.succeeded ??
                                                  true)) {
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
                                                          'a38f6saq' /* Erro */,
                                                        ),
                                                        description:
                                                            getJsonField(
                                                          (_model.addManualEdit
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
                                            }

                                            context.pushNamed(
                                              BacklogTarefasWidget.routeName,
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
                                        ),
                                      );
                                    },
                                  );

                                  if (_shouldSetState) safeSetState(() {});
                                },
                                text: FFLocalizations.of(context).getText(
                                  '7h9i265v' /* Salvar tarefa manualmente */,
                                ),
                                icon: Icon(
                                  Icons.move_down_rounded,
                                  size: 15.0,
                                ),
                                options: FFButtonOptions(
                                  width: 200.0,
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
                                        color:
                                            FlutterFlowTheme.of(context).info,
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
                        ].divide(SizedBox(width: 12.0)),
                      ),
                    ].divide(SizedBox(height: 16.0)),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
