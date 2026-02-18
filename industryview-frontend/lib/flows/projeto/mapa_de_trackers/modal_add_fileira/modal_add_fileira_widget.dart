import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/components/mouse_drop_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_drop_trackers_map/modal_drop_trackers_map_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_replicar_configuracao_fileira/modal_replicar_configuracao_fileira_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_add_fileira_model.dart';
export 'modal_add_fileira_model.dart';

class ModalAddFileiraWidget extends StatefulWidget {
  const ModalAddFileiraWidget({
    super.key,
    required this.typePage,
    required this.row,
    required this.sections,
    required this.rowRef,
    required this.fieldId,
    required this.sectionNumber,
    required this.sectionsId,
    this.rowId,
    this.listRowsTrackers,
    this.trackerslistEmpty,
    bool? check,
  }) : this.check = check ?? false;

  final String? typePage;
  final int? row;
  final int? sections;
  final List<MapTrackersStruct>? rowRef;
  final int? fieldId;
  final int? sectionNumber;
  final int? sectionsId;
  final int? rowId;
  final List<int>? listRowsTrackers;
  final List<ListRowsTrackersStruct>? trackerslistEmpty;
  final bool check;

  @override
  State<ModalAddFileiraWidget> createState() => _ModalAddFileiraWidgetState();
}

class _ModalAddFileiraWidgetState extends State<ModalAddFileiraWidget> {
  late ModalAddFileiraModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalAddFileiraModel());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      FFAppState().excluiuTrackers = false;
      safeSetState(() {});
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

    return FutureBuilder<ApiCallResponse>(
      future: _model.trackers(
        requestFn: () async => ApiCallResponse(null, {}, 200), // Dummy API Response
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
        final containerQueryAllTrackersRecordsResponse = snapshot.data!;

        return Material(
          color: Colors.transparent,
          elevation: 2.0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24.0),
          ),
          child: Container(
            width: 500.0,
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
              borderRadius: BorderRadius.circular(24.0),
            ),
            child: Padding(
              padding: EdgeInsets.all(24.0),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.max,
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: SelectionArea(
                                  child: Text(
                                '${FFLocalizations.of(context).getVariableText(
                                  ptText: 'Adicionar fileira ',
                                  esText: 'Agregar fila ',
                                  enText: 'Add row ',
                                )}${widget!.row?.toString()}${FFLocalizations.of(context).getVariableText(
                                  ptText: ' na seção ',
                                  esText: ' en la sección',
                                  enText: ' in the section',
                                )}${widget!.sections?.toString()}',
                                style: FlutterFlowTheme.of(context)
                                    .titleLarge
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FontWeight.w500,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .titleLarge
                                            .fontStyle,
                                      ),
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w500,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .titleLarge
                                          .fontStyle,
                                    ),
                              )),
                            ),
                            Align(
                              alignment: AlignmentDirectional(1.0, -1.0),
                              child: FlutterFlowIconButton(
                                borderColor:
                                    FlutterFlowTheme.of(context).primary,
                                borderRadius: 8.0,
                                borderWidth: 0.5,
                                buttonSize: 32.0,
                                fillColor:
                                    FlutterFlowTheme.of(context).secondary,
                                hoverColor:
                                    FlutterFlowTheme.of(context).hoverNavBar,
                                hoverIconColor: FlutterFlowTheme.of(context)
                                    .secondaryBackground,
                                hoverBorderColor:
                                    FlutterFlowTheme.of(context).hoverNavBar,
                                icon: Icon(
                                  Icons.close_sharp,
                                  color: FlutterFlowTheme.of(context).primary,
                                  size: 16.0,
                                ),
                                onPressed: () async {
                                  Navigator.pop(context);
                                },
                              ),
                            ),
                          ].divide(SizedBox(width: 12.0)),
                        ),
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 8.0, 0.0, 16.0),
                          child: SelectionArea(
                              child: Text(
                            FFLocalizations.of(context).getText(
                              '0rnskhgy' /* O número da fileira é automáti... */,
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
                        ),
                        Column(
                          mainAxisSize: MainAxisSize.max,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 16.0, 0.0, 8.0),
                              child: Container(
                                width: MediaQuery.sizeOf(context).width * 1.0,
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
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      12.0, 0.0, 12.0, 0.0),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.max,
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    children: [
                                      Container(
                                        width: 50.0,
                                        decoration: BoxDecoration(),
                                        child: Align(
                                          alignment:
                                              AlignmentDirectional(0.0, 0.0),
                                          child: Text(
                                            FFLocalizations.of(context).getText(
                                              '9qkrs88z' /* Posição */,
                                            ),
                                            style: FlutterFlowTheme.of(context)
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
                                          ),
                                        ),
                                      ),
                                      Text(
                                        FFLocalizations.of(context).getText(
                                          '9c7buewv' /* Tipo de tracker */,
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
                                      ),
                                    ].divide(SizedBox(width: 8.0)),
                                  ),
                                ),
                              ),
                            ),
                            Container(
                              height: () {
                                if (FFAppState()
                                    .addFileiraTracker
                                    .where((e) => e.deletedAt != 0)
                                    .toList()
                                    .isNotEmpty) {
                                  return 0.0;
                                } else if ((FFAppState()
                                        .addFileiraTracker
                                        .where((e) => e.deletedAt == 0)
                                        .toList()
                                        .isNotEmpty) &&
                                    (FFAppState().addFileiraTracker.length ==
                                        1)) {
                                  return 50.0;
                                } else if ((FFAppState()
                                        .addFileiraTracker
                                        .where((e) => e.deletedAt == 0)
                                        .toList()
                                        .isNotEmpty) &&
                                    (FFAppState().addFileiraTracker.length ==
                                        2)) {
                                  return 130.0;
                                } else if ((FFAppState()
                                        .addFileiraTracker
                                        .where((e) => e.deletedAt == 0)
                                        .toList()
                                        .isNotEmpty) &&
                                    (FFAppState().addFileiraTracker.length ==
                                        3)) {
                                  return 210.0;
                                } else if ((FFAppState()
                                        .addFileiraTracker
                                        .where((e) => e.deletedAt == 0)
                                        .toList()
                                        .isNotEmpty) ||
                                    (FFAppState().addFileiraTracker.length ==
                                        4) ||
                                    (FFAppState().addFileiraTracker.length >
                                        4)) {
                                  return 265.0;
                                } else {
                                  return 0.0;
                                }
                              }(),
                              constraints: BoxConstraints(
                                minHeight: 0.0,
                              ),
                              decoration: BoxDecoration(),
                              child: Builder(
                                builder: (context) {
                                  final list =
                                      FFAppState().addFileiraTracker.toList();

                                  return ListView.separated(
                                    padding: EdgeInsets.zero,
                                    shrinkWrap: true,
                                    scrollDirection: Axis.vertical,
                                    itemCount: list.length,
                                    separatorBuilder: (_, __) =>
                                        SizedBox(height: 8.0),
                                    itemBuilder: (context, listIndex) {
                                      final listItem = list[listIndex];
                                      return Column(
                                        mainAxisSize: MainAxisSize.max,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          ModalDropTrackersMapWidget(
                                            key: Key(
                                                'Key715_${listIndex}_of_${list.length}'),
                                            position: listItem.position,
                                            listTypes: [],
                                            listIds: [],
                                            index: listIndex,
                                            drop: listItem.trackersId,
                                            statusTrackerId:
                                                listItem.rowsTrackersStatusesId,
                                            rowTrackerId:
                                                listItem.rowsTrackersId,
                                            sectionId: widget!.sectionsId!,
                                            fieldId: widget!.fieldId!,
                                            rowId: widget!.rowId,
                                            listRowsTrackers:
                                                widget!.listRowsTrackers,
                                            trackersListEmpty:
                                                widget!.trackerslistEmpty,
                                            rowNumber: widget!.row,
                                            check: widget!.check,
                                            manufacturesType: [],
                                            erro: listItem.erro,
                                          ),
                                          Row(
                                            mainAxisSize: MainAxisSize.max,
                                            children: [
                                              Container(
                                                width: 50.0,
                                                decoration: BoxDecoration(
                                                  color: FlutterFlowTheme.of(
                                                          context)
                                                      .secondaryBackground,
                                                ),
                                              ),
                                              if (listItem.erro)
                                                Padding(
                                                  padding: EdgeInsetsDirectional
                                                      .fromSTEB(
                                                          12.0, 0.0, 0.0, 0.0),
                                                  child: Text(
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                      'lzncwjd7' /* *Campo obrigatório */,
                                                    ),
                                                    style: FlutterFlowTheme.of(
                                                            context)
                                                        .bodyMedium
                                                        .override(
                                                          font: GoogleFonts
                                                              .lexend(
                                                            fontWeight:
                                                                FontWeight.w500,
                                                            fontStyle:
                                                                FlutterFlowTheme.of(
                                                                        context)
                                                                    .bodyMedium
                                                                    .fontStyle,
                                                          ),
                                                          color: FlutterFlowTheme
                                                                  .of(context)
                                                              .error,
                                                          fontSize: 12.0,
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
                                                ),
                                            ].divide(SizedBox(width: 16.0)),
                                          ),
                                          Divider(
                                            thickness: 1.0,
                                            color: FlutterFlowTheme.of(context)
                                                .alternate,
                                          ),
                                        ],
                                      );
                                    },
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 16.0, 0.0, 16.0),
                          child: FFButtonWidget(
                            onPressed: () async {
                              if (FFAppState().addFileiraTracker.isNotEmpty) {
                                FFAppState()
                                    .addToAddFileiraTracker(DropSelect1Struct(
                                  position:
                                      ((int.tryParse(valueOrDefault<String>(
                                                    FFAppState()
                                                        .addFileiraTracker
                                                        .lastOrNull
                                                        ?.position,
                                                    '0',
                                                  )) ??
                                                  0) +
                                              1)
                                          .toString(),
                                  deletedAt: null,
                                ));
                                FFAppState().update(() {});
                                return;
                              } else {
                                FFAppState()
                                    .addToAddFileiraTracker(DropSelect1Struct(
                                  position: '1',
                                  deletedAt: null,
                                ));
                                FFAppState().update(() {});
                                return;
                              }
                            },
                            text: FFLocalizations.of(context).getText(
                              'zweftys7' /* Adicionar tipo de tracker */,
                            ),
                            icon: Icon(
                              Icons.add_circle,
                              size: 15.0,
                            ),
                            options: FFButtonOptions(
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
                        ),
                        Divider(
                          thickness: 1.0,
                          color: FlutterFlowTheme.of(context).alternate,
                        ),
                        if (FFAppState().jsonRowsRef.length > 1)
                          Builder(
                            builder: (context) => Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 16.0, 0.0, 0.0),
                              child: FFButtonWidget(
                                onPressed: () async {
                                  FFAppState().idsExistentes = [];
                                  safeSetState(() {});
                                  await actions.checkEmptyRowTrackers(
                                    widget!.rowRef!.toList(),
                                  );
                                  await showDialog(
                                    barrierColor: Color(0x80000000),
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
                                        child:
                                            ModalReplicarConfiguracaoFileiraWidget(
                                          rows: widget!.rowRef!,
                                          listMap: widget!.rowRef!,
                                          sectionId: widget!.sectionsId!,
                                        ),
                                      );
                                    },
                                  );
                                },
                                text: FFLocalizations.of(context).getText(
                                  't4722mft' /* Replicar configuração para out... */,
                                ),
                                icon: Icon(
                                  Icons.content_copy,
                                  size: 15.0,
                                ),
                                options: FFButtonOptions(
                                  width: MediaQuery.sizeOf(context).width * 1.0,
                                  height: 40.0,
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      16.0, 0.0, 16.0, 0.0),
                                  iconPadding: EdgeInsetsDirectional.fromSTEB(
                                      0.0, 0.0, 0.0, 0.0),
                                  color: FlutterFlowTheme.of(context)
                                      .secondaryBackground,
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
                                        fontWeight: FlutterFlowTheme.of(context)
                                            .labelSmall
                                            .fontWeight,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .labelSmall
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
                            ),
                          ),
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 16.0, 0.0, 0.0),
                          child: Row(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              Expanded(
                                child: FFButtonWidget(
                                  onPressed: () async {
                                    FFAppState().idsExistentes = [];
                                    safeSetState(() {});
                                    Navigator.pop(context);
                                  },
                                  text: FFLocalizations.of(context).getText(
                                    '50k0sx92' /* Cancelar */,
                                  ),
                                  options: FFButtonOptions(
                                    width: double.infinity,
                                    height: 40.0,
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 0.0, 0.0, 0.0),
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
                                    hoverTextColor: FlutterFlowTheme.of(context)
                                        .primaryBackground,
                                  ),
                                ),
                              ),
                              Expanded(
                                flex: 2,
                                child: Builder(
                                  builder: (context) => FFButtonWidget(
                                    onPressed: () async {
                                      var _shouldSetState = false;
                                      _model.returnSets =
                                          await actions.verificaIdsSetados(
                                        FFAppState().addFileiraTracker.toList(),
                                      );
                                      _shouldSetState = true;
                                      if (_model.returnSets!) {
                                        if (FFAppState().duplicado &&
                                            (widget!.typePage == 'creat')) {
                                          await actions.actRemoveInfoTracker(
                                            FFAppState()
                                                .addFileiraTracker
                                                .toList(),
                                          );
                                        } else if (FFAppState().duplicado &&
                                            (widget!.typePage == 'edit')) {
                                          FFAppState()
                                              .removeFromSetIds(widget!.rowId!);
                                          safeSetState(() {});
                                          await actions.actRemoveInfoTracker(
                                            FFAppState()
                                                .addFileiraTracker
                                                .toList(),
                                          );
                                        }
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
                                                  AlignmentDirectional(0.0, 0.0)
                                                      .resolve(
                                                          Directionality.of(
                                                              context)),
                                              child: ModalInfoWidget(
                                                title:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  '1l3u4n2t' /* Selecione os trackers */,
                                                ),
                                                description:
                                                    FFLocalizations.of(context)
                                                        .getText(
                                                  'xvsm39mo' /* Todos os trackers precisam ser... */,
                                                ),
                                              ),
                                            );
                                          },
                                        );

                                        if (_shouldSetState)
                                          safeSetState(() {});
                                        return;
                                      }

                                      while (_model.contador <
                                          FFAppState().setIds.length) {
                                        _model.addRowsTracker = null; // API Call Removed

                                        _shouldSetState = true;
                                        if ((_model.addRowsTracker?.succeeded ??
                                            true)) {
                                          _model.contador = _model.contador + 1;
                                          safeSetState(() {});
                                        } else {
                                          _model.contador = _model.contador + 1;
                                          safeSetState(() {});
                                        }
                                      }
                                      FFAppState().idsExistentes = [];
                                      FFAppState().duplicado = false;
                                      FFAppState().update(() {});

                                      context.pushNamed(
                                        ModulosTrackersMapWidget.routeName,
                                        queryParameters: {
                                          'sectionsId': serializeParam(
                                            widget!.sectionsId,
                                            ParamType.int,
                                          ),
                                          'fieldsId': serializeParam(
                                            widget!.fieldId,
                                            ParamType.int,
                                          ),
                                          'sectionNumber': serializeParam(
                                            widget!.sectionNumber,
                                            ParamType.int,
                                          ),
                                        }.withoutNulls,
                                        extra: <String, dynamic>{
                                          kTransitionInfoKey: TransitionInfo(
                                            hasTransition: true,
                                            transitionType:
                                                PageTransitionType.fade,
                                            duration: Duration(milliseconds: 0),
                                          ),
                                        },
                                      );

                                      if (_shouldSetState) safeSetState(() {});
                                    },
                                    text: FFLocalizations.of(context).getText(
                                      'dsa1mekp' /* Salvar configuração */,
                                    ),
                                    options: FFButtonOptions(
                                      width: double.infinity,
                                      height: 40.0,
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          0.0, 0.0, 0.0, 0.0),
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
                                      elevation: 0.0,
                                      borderSide: BorderSide(
                                        color: Colors.transparent,
                                        width: 1.0,
                                      ),
                                      borderRadius: BorderRadius.circular(12.0),
                                    ),
                                  ),
                                ),
                              ),
                            ].divide(SizedBox(width: 12.0)),
                          ),
                        ),
                      ],
                    ),
                    if (_model.drop)
                      Align(
                        alignment: AlignmentDirectional(0.0, -0.38),
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              44.0, 0.0, 44.0, 0.0),
                          child: Container(
                            width: double.infinity,
                            height: 200.0,
                            decoration: BoxDecoration(
                              color: FlutterFlowTheme.of(context)
                                  .primaryBackground,
                              borderRadius: BorderRadius.circular(8.0),
                              border: Border.all(
                                color: FlutterFlowTheme.of(context).alternate,
                              ),
                            ),
                            child: Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 8.0, 0.0, 8.0),
                              child: Builder(
                                builder: (context) {
                                  final listTrackers =
                                      containerQueryAllTrackersRecordsResponse
                                          .jsonBody
                                          .toList();

                                  return ListView.separated(
                                    padding: EdgeInsets.zero,
                                    shrinkWrap: true,
                                    scrollDirection: Axis.vertical,
                                    itemCount: listTrackers.length,
                                    separatorBuilder: (_, __) =>
                                        SizedBox(height: 8.0),
                                    itemBuilder: (context, listTrackersIndex) {
                                      final listTrackersItem =
                                          listTrackers[listTrackersIndex];
                                      return InkWell(
                                        splashColor: Colors.transparent,
                                        focusColor: Colors.transparent,
                                        hoverColor: Colors.transparent,
                                        highlightColor: Colors.transparent,
                                        onTap: () async {
                                          FFAppState().addToAddFileiraTracker(
                                              DropSelect1Struct(
                                            id: getJsonField(
                                              listTrackersItem,
                                              r'''$.id''',
                                            ),
                                            text: getJsonField(
                                              listTrackersItem,
                                              r'''$.type''',
                                            ).toString(),
                                            position: (listTrackersIndex + 1)
                                                .toString(),
                                          ));
                                          safeSetState(() {});
                                          _model.drop = !_model.drop;
                                          safeSetState(() {});
                                        },
                                        child: MouseDropWidget(
                                          key: Key(
                                              'Keybdl_${listTrackersIndex}_of_${listTrackers.length}'),
                                          parameter1: getJsonField(
                                            listTrackersItem,
                                            r'''$.type''',
                                          ),
                                          parameter3: getJsonField(
                                            listTrackersItem,
                                            r'''$.id''',
                                          ),
                                        ),
                                      );
                                    },
                                  );
                                },
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
      },
    );
  }
}
