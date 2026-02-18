import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'comp_template_backlog_model.dart';
export 'comp_template_backlog_model.dart';

class CompTemplateBacklogWidget extends StatefulWidget {
  const CompTemplateBacklogWidget({
    super.key,
    this.templateID,
    this.descripiton,
    this.unity,
    this.equipamentTypeTXT,
    this.equipamentTypeID,
    this.wiight,
    this.index,
    this.discipline,
  });

  final int? templateID;
  final String? descripiton;
  final String? unity;
  final String? equipamentTypeTXT;
  final int? equipamentTypeID;
  final String? wiight;
  final int? index;
  final String? discipline;

  @override
  State<CompTemplateBacklogWidget> createState() =>
      _CompTemplateBacklogWidgetState();
}

class _CompTemplateBacklogWidgetState extends State<CompTemplateBacklogWidget> {
  late CompTemplateBacklogModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CompTemplateBacklogModel());

    _model.amountTextController ??= TextEditingController();
    _model.amountFocusNode ??= FocusNode();

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
      padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 1.0),
      child: Container(
        width: MediaQuery.sizeOf(context).width * 1.0,
        height: 71.0,
        decoration: BoxDecoration(
          color: FlutterFlowTheme.of(context).secondaryBackground,
          boxShadow: [
            BoxShadow(
              blurRadius: 0.0,
              color: FlutterFlowTheme.of(context).alternate,
              offset: Offset(
                0.0,
                1.0,
              ),
            )
          ],
        ),
        child: Padding(
          padding: EdgeInsetsDirectional.fromSTEB(12.0, 8.0, 12.0, 8.0),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(10.0, 0.0, 0.0, 0.0),
                child: Row(
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    if (!FFAppState().listatasks.contains(ListaTasksStruct(
                          tasksTemplateId: widget!.templateID,
                          quantity: valueOrDefault<String>(
                                        _model.amountTextController.text,
                                        '1',
                                      ) !=
                                      null &&
                                  valueOrDefault<String>(
                                        _model.amountTextController.text,
                                        '1',
                                      ) !=
                                      ''
                              ? valueOrDefault<double>(
                                  double.tryParse(
                                      _model.amountTextController.text),
                                  1.0,
                                )
                              : 1.0,
                        )))
                      InkWell(
                        splashColor: Colors.transparent,
                        focusColor: Colors.transparent,
                        hoverColor: Colors.transparent,
                        highlightColor: Colors.transparent,
                        onTap: () async {
                          FFAppState().addToListatasks(ListaTasksStruct(
                            tasksTemplateId: widget!.templateID,
                            quantity: 1.0,
                          ));
                          FFAppState().update(() {});
                        },
                        child: Container(
                          width: 18.0,
                          height: 18.0,
                          decoration: BoxDecoration(
                            color: FlutterFlowTheme.of(context)
                                .secondaryBackground,
                            borderRadius: BorderRadius.circular(4.0),
                            border: Border.all(
                              color: FlutterFlowTheme.of(context).alternate,
                              width: 2.0,
                            ),
                          ),
                        ),
                      ),
                    if (FFAppState().listatasks.contains(ListaTasksStruct(
                          tasksTemplateId: widget!.templateID,
                          quantity: valueOrDefault<String>(
                                        _model.amountTextController.text,
                                        '1',
                                      ) !=
                                      null &&
                                  valueOrDefault<String>(
                                        _model.amountTextController.text,
                                        '1',
                                      ) !=
                                      ''
                              ? valueOrDefault<double>(
                                  double.tryParse(
                                      _model.amountTextController.text),
                                  1.0,
                                )
                              : 1.0,
                        )))
                      InkWell(
                        splashColor: Colors.transparent,
                        focusColor: Colors.transparent,
                        hoverColor: Colors.transparent,
                        highlightColor: Colors.transparent,
                        onTap: () async {
                          FFAppState().removeFromListatasks(ListaTasksStruct(
                            tasksTemplateId: widget!.templateID,
                            quantity: 1.0,
                          ));
                          FFAppState().update(() {});
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
                            Icons.check_outlined,
                            color: FlutterFlowTheme.of(context)
                                .secondaryBackground,
                            size: 15.0,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              Expanded(
                flex: 2,
                child: RichText(
                  textScaler: MediaQuery.of(context).textScaler,
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: valueOrDefault<String>(
                          widget!.templateID?.toString(),
                          '-',
                        ),
                        style: FlutterFlowTheme.of(context).bodySmall.override(
                              font: GoogleFonts.lexend(
                                fontWeight: FontWeight.w500,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .bodySmall
                                    .fontStyle,
                              ),
                              color: FlutterFlowTheme.of(context).primary,
                              letterSpacing: 0.0,
                              fontWeight: FontWeight.w500,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .bodySmall
                                  .fontStyle,
                            ),
                      ),
                      TextSpan(
                        text: FFLocalizations.of(context).getText(
                          'q9lkbs20' /*  -  */,
                        ),
                        style: TextStyle(),
                      ),
                      TextSpan(
                        text: widget!.descripiton!,
                        style: FlutterFlowTheme.of(context).labelSmall.override(
                              font: GoogleFonts.lexend(
                                fontWeight: FlutterFlowTheme.of(context)
                                    .labelSmall
                                    .fontWeight,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .labelSmall
                                    .fontStyle,
                              ),
                              color: FlutterFlowTheme.of(context).primaryText,
                              letterSpacing: 0.0,
                              fontWeight: FlutterFlowTheme.of(context)
                                  .labelSmall
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .labelSmall
                                  .fontStyle,
                            ),
                      )
                    ],
                    style: FlutterFlowTheme.of(context).labelSmall.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FlutterFlowTheme.of(context)
                                .labelSmall
                                .fontWeight,
                            fontStyle: FlutterFlowTheme.of(context)
                                .labelSmall
                                .fontStyle,
                          ),
                          color: FlutterFlowTheme.of(context).primaryText,
                          letterSpacing: 0.0,
                          fontWeight: FlutterFlowTheme.of(context)
                              .labelSmall
                              .fontWeight,
                          fontStyle:
                              FlutterFlowTheme.of(context).labelSmall.fontStyle,
                        ),
                  ),
                ),
              ),
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.max,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: 36.0,
                      decoration: BoxDecoration(),
                      child: Visibility(
                        visible: ((widget!.templateID != 1) &&
                                (widget!.templateID != 5) &&
                                (widget!.templateID != 6)) &&
                            responsiveVisibility(
                              context: context,
                              phone: false,
                            ),
                        child: Container(
                          width: double.infinity,
                          child: TextFormField(
                            controller: _model.amountTextController,
                            focusNode: _model.amountFocusNode,
                            onChanged: (_) => EasyDebounce.debounce(
                              '_model.amountTextController',
                              Duration(milliseconds: 500),
                              () async {
                                FFAppState().updateListatasksAtIndex(
                                  widget!.index!,
                                  (e) => e
                                    ..quantity = double.tryParse(
                                        _model.amountTextController.text),
                                );
                                safeSetState(() {});
                              },
                            ),
                            autofocus: false,
                            readOnly: !FFAppState()
                                .listatasks
                                .contains(ListaTasksStruct(
                                  tasksTemplateId: widget!.templateID,
                                  quantity: valueOrDefault<String>(
                                                _model
                                                    .amountTextController.text,
                                                '1',
                                              ) !=
                                              null &&
                                          valueOrDefault<String>(
                                                _model
                                                    .amountTextController.text,
                                                '1',
                                              ) !=
                                              ''
                                      ? valueOrDefault<double>(
                                          double.tryParse(
                                              _model.amountTextController.text),
                                          1.0,
                                        )
                                      : 1.0,
                                )),
                            obscureText: false,
                            decoration: InputDecoration(
                              labelText: FFLocalizations.of(context).getText(
                                'pgq6jtbv' /* Quantidade */,
                              ),
                              labelStyle: FlutterFlowTheme.of(context)
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
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontStyle,
                                  ),
                              hintStyle: FlutterFlowTheme.of(context)
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
                                  color: FlutterFlowTheme.of(context).alternate,
                                  width: 1.0,
                                ),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderSide: BorderSide(
                                  color: FlutterFlowTheme.of(context).primary,
                                  width: 1.0,
                                ),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              errorBorder: OutlineInputBorder(
                                borderSide: BorderSide(
                                  color: FlutterFlowTheme.of(context).error,
                                  width: 1.0,
                                ),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              focusedErrorBorder: OutlineInputBorder(
                                borderSide: BorderSide(
                                  color: FlutterFlowTheme.of(context).error,
                                  width: 1.0,
                                ),
                                borderRadius: BorderRadius.circular(8.0),
                              ),
                              contentPadding: EdgeInsetsDirectional.fromSTEB(
                                  12.0, 0.0, 12.0, 0.0),
                            ),
                            style:
                                FlutterFlowTheme.of(context).bodySmall.override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FontWeight.w500,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .fontStyle,
                                      ),
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w500,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodySmall
                                          .fontStyle,
                                    ),
                            cursorColor: FlutterFlowTheme.of(context).primary,
                            validator: _model.amountTextControllerValidator
                                .asValidator(context),
                          ),
                        ),
                      ),
                    ),
                    if (!FFAppState().listatasks.contains(ListaTasksStruct(
                              tasksTemplateId: widget!.templateID,
                              quantity: valueOrDefault<String>(
                                            _model.amountTextController.text,
                                            '1',
                                          ) !=
                                          null &&
                                      valueOrDefault<String>(
                                            _model.amountTextController.text,
                                            '1',
                                          ) !=
                                          ''
                                  ? valueOrDefault<double>(
                                      double.tryParse(
                                          _model.amountTextController.text),
                                      1.0,
                                    )
                                  : 1.0,
                            )) &&
                        ((widget!.templateID != 1) &&
                            (widget!.templateID != 5) &&
                            (widget!.templateID != 6)))
                      SelectionArea(
                          child: Text(
                        FFLocalizations.of(context).getText(
                          'lzs0oo9k' /* Selecione o check */,
                        ),
                        style: FlutterFlowTheme.of(context).bodyMedium.override(
                              font: GoogleFonts.lexend(
                                fontWeight: FlutterFlowTheme.of(context)
                                    .bodyMedium
                                    .fontWeight,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .bodyMedium
                                    .fontStyle,
                              ),
                              color: FlutterFlowTheme.of(context).error,
                              letterSpacing: 0.0,
                              fontWeight: FlutterFlowTheme.of(context)
                                  .bodyMedium
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .bodyMedium
                                  .fontStyle,
                            ),
                      )),
                  ].divide(SizedBox(height: 4.0)),
                ),
              ),
              Expanded(
                child: SelectionArea(
                    child: Text(
                  widget!.unity!,
                  style: FlutterFlowTheme.of(context).bodyMedium.override(
                        font: GoogleFonts.lexend(
                          fontWeight: FlutterFlowTheme.of(context)
                              .bodyMedium
                              .fontWeight,
                          fontStyle:
                              FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                        ),
                        letterSpacing: 0.0,
                        fontWeight:
                            FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                      ),
                )),
              ),
              Expanded(
                child: SelectionArea(
                    child: Text(
                  valueOrDefault<String>(
                    widget!.discipline,
                    '-',
                  ),
                  style: FlutterFlowTheme.of(context).bodyMedium.override(
                        font: GoogleFonts.lexend(
                          fontWeight: FlutterFlowTheme.of(context)
                              .bodyMedium
                              .fontWeight,
                          fontStyle:
                              FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                        ),
                        letterSpacing: 0.0,
                        fontWeight:
                            FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                      ),
                )),
              ),

              Container(
                width: 60.0,
                decoration: BoxDecoration(),
                child: SelectionArea(
                    child: Text(
                  'x${widget!.wiight}',
                  textAlign: TextAlign.center,
                  style: FlutterFlowTheme.of(context).labelMedium.override(
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
                        fontWeight:
                            FlutterFlowTheme.of(context).labelMedium.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).labelMedium.fontStyle,
                      ),
                )),
              ),
            ].divide(SizedBox(width: 12.0)),
          ),
        ),
      ),
    );
  }
}
