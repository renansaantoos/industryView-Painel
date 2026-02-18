import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/flutter_flow/custom_functions.dart' as functions;
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_drop_trackers_map_model.dart';
export 'modal_drop_trackers_map_model.dart';

class ModalDropTrackersMapWidget extends StatefulWidget {
  const ModalDropTrackersMapWidget({
    super.key,
    this.position,
    this.listTypes,
    this.listIds,
    this.index,
    required this.drop,
    required this.statusTrackerId,
    required this.rowTrackerId,
    required this.sectionId,
    required this.fieldId,
    this.rowId,
    this.listRowsTrackers,
    this.trackersListEmpty,
    this.rowNumber,
    bool? check,
    this.manufacturesType,
    bool? erro,
  })  : this.check = check ?? false,
        this.erro = erro ?? false;

  final String? position;
  final List<String>? listTypes;
  final List<int>? listIds;
  final int? index;
  final int? drop;
  final int? statusTrackerId;
  final int? rowTrackerId;
  final int? sectionId;
  final int? fieldId;
  final int? rowId;
  final List<int>? listRowsTrackers;
  final List<ListRowsTrackersStruct>? trackersListEmpty;
  final int? rowNumber;
  final bool check;
  final List<String>? manufacturesType;
  final bool erro;

  @override
  State<ModalDropTrackersMapWidget> createState() =>
      _ModalDropTrackersMapWidgetState();
}

class _ModalDropTrackersMapWidgetState
    extends State<ModalDropTrackersMapWidget> {
  late ModalDropTrackersMapModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalDropTrackersMapModel());

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
      padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 4.0),
      child: Row(
        mainAxisSize: MainAxisSize.max,
        children: [
          Container(
            width: 50.0,
            decoration: BoxDecoration(),
            child: Align(
              alignment: AlignmentDirectional(0.0, 0.0),
              child: Text(
                '${widget!.position}º',
                style: FlutterFlowTheme.of(context).bodyMedium.override(
                      font: GoogleFonts.lexend(
                        fontWeight:
                            FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                      ),
                      letterSpacing: 0.0,
                      fontWeight:
                          FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                      fontStyle:
                          FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                    ),
              ),
            ),
          ),
          Expanded(
            child: FlutterFlowDropDown<int>(
              controller: _model.dropDownValueController ??=
                  FormFieldController<int>(
                _model.dropDownValue ??= valueOrDefault<int>(
                  widget!.drop,
                  -1,
                ),
              ),
              options: List<int>.from(widget!.listIds!),
              optionLabels: functions.actJuntaTrackerManufacturers(
                  widget!.listTypes!.toList(),
                  widget!.manufacturesType!.toList()),
              onChanged: (val) async {
                safeSetState(() => _model.dropDownValue = val);
                FFAppState().updateAddFileiraTrackerAtIndex(
                  widget!.index!,
                  (e) => e
                    ..trackersId = _model.dropDownValue
                    ..erro = false,
                );
                FFAppState().update(() {});
              },
              width: double.infinity,
              height: 48.0,
              maxHeight: 250.0,
              textStyle: FlutterFlowTheme.of(context).bodyMedium.override(
                    font: GoogleFonts.lexend(
                      fontWeight:
                          FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                      fontStyle:
                          FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                    ),
                    letterSpacing: 0.0,
                    fontWeight:
                        FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                    fontStyle:
                        FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                  ),
              hintText: FFLocalizations.of(context).getText(
                'tfap1n57' /* Selecione um tipo de tracker */,
              ),
              icon: Icon(
                Icons.keyboard_arrow_down_rounded,
                color: (widget!.statusTrackerId == 1) ||
                        (widget!.statusTrackerId == 0)
                    ? FlutterFlowTheme.of(context).secondaryText
                    : FlutterFlowTheme.of(context).alternate,
                size: 24.0,
              ),
              fillColor: FlutterFlowTheme.of(context).primaryBackground,
              elevation: 0.0,
              borderColor: widget!.erro
                  ? FlutterFlowTheme.of(context).error
                  : FlutterFlowTheme.of(context).alternate,
              borderWidth: 1.0,
              borderRadius: 8.0,
              margin: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
              hidesUnderline: true,
              disabled: !((widget!.statusTrackerId == 1) ||
                  (widget!.statusTrackerId == 0)),
              isOverButton: false,
              isSearchable: false,
              isMultiSelect: false,
            ),
          ),
          if ((widget!.check == false) && (widget!.rowTrackerId != 0))
            Align(
              alignment: AlignmentDirectional(1.0, 0.0),
              child: Builder(
                builder: (context) => Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 0.0, 0.0),
                  child: InkWell(
                    splashColor: Colors.transparent,
                    focusColor: Colors.transparent,
                    hoverColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    onTap: () async {
                      await showDialog(
                        context: context,
                        builder: (dialogContext) {
                          return Dialog(
                            elevation: 0,
                            insetPadding: EdgeInsets.zero,
                            backgroundColor: Colors.transparent,
                            alignment: AlignmentDirectional(0.0, 0.0)
                                .resolve(Directionality.of(context)),
                            child: ModalConfirmDeleteWidget(
                              title: 'Remover tracker',
                              description:
                                  'O tracker que você está tentando remover já existe e não foi criado recentemente. Ao prosseguir, ele será excluído permanentemente. Deseja continuar?',
                              actionAPi: () async {
                                var _shouldSetState = false;
                                _model.deleteRowTracker = null; // API Call Removed

                                _shouldSetState = true;
                                if ((_model.deleteRowTracker?.succeeded ??
                                    true)) {
                                  FFAppState()
                                      .removeAtIndexFromAddFileiraTracker(
                                          widget!.index!);
                                  FFAppState().update(() {});
                                  await actions.actOrdenaPosiocao(
                                    FFAppState().addFileiraTracker.toList(),
                                  );
                                  Navigator.pop(context);
                                  return;
                                } else {
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
                                        child: ModalInfoWidget(
                                          title: 'Erro',
                                          description: getJsonField(
                                            (_model.deleteRowTracker
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
                              actionPage: () async {
                                FFAppState().excluiuTrackers = true;
                                safeSetState(() {});

                                context.pushNamed(
                                  ModulosTrackersMapWidget.routeName,
                                  queryParameters: {
                                    'sectionsId': serializeParam(
                                      widget!.sectionId,
                                      ParamType.int,
                                    ),
                                    'fieldsId': serializeParam(
                                      widget!.fieldId,
                                      ParamType.int,
                                    ),
                                    'rowId': serializeParam(
                                      widget!.rowId,
                                      ParamType.int,
                                    ),
                                    'listRowsTrackers': serializeParam(
                                      widget!.listRowsTrackers,
                                      ParamType.int,
                                      isList: true,
                                    ),
                                    'trackerslistEmpty': serializeParam(
                                      widget!.trackersListEmpty,
                                      ParamType.DataStruct,
                                      isList: true,
                                    ),
                                    'rowNumber': serializeParam(
                                      widget!.rowNumber,
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
                              },
                            ),
                          );
                        },
                      );

                      safeSetState(() {});
                    },
                    child: FaIcon(
                      FontAwesomeIcons.trashAlt,
                      color: FlutterFlowTheme.of(context).error,
                      size: 16.0,
                    ),
                  ),
                ),
              ),
            ),
          if (widget!.rowTrackerId == 0)
            Align(
              alignment: AlignmentDirectional(1.0, 0.0),
              child: Padding(
                padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 0.0, 0.0),
                child: InkWell(
                  splashColor: Colors.transparent,
                  focusColor: Colors.transparent,
                  hoverColor: Colors.transparent,
                  highlightColor: Colors.transparent,
                  onTap: () async {
                    FFAppState()
                        .removeAtIndexFromAddFileiraTracker(widget!.index!);
                    FFAppState().update(() {});
                    await actions.actOrdenaPosiocao(
                      FFAppState().addFileiraTracker.toList(),
                    );
                  },
                  child: Icon(
                    Icons.close_rounded,
                    color: FlutterFlowTheme.of(context).error,
                    size: 16.0,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
