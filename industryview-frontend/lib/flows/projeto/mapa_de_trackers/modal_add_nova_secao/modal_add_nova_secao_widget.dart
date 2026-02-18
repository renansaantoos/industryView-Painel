import '/backend/api_requests/api_calls.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_add_nova_secao_model.dart';
export 'modal_add_nova_secao_model.dart';

class ModalAddNovaSecaoWidget extends StatefulWidget {
  const ModalAddNovaSecaoWidget({
    super.key,
    required this.fieldId,
  });

  final int? fieldId;

  @override
  State<ModalAddNovaSecaoWidget> createState() =>
      _ModalAddNovaSecaoWidgetState();
}

class _ModalAddNovaSecaoWidgetState extends State<ModalAddNovaSecaoWidget> {
  late ModalAddNovaSecaoModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalAddNovaSecaoModel());

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

    return Material(
      color: Colors.transparent,
      elevation: 2.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24.0),
      ),
      child: Container(
        width: 500.0,
        constraints: BoxConstraints(
          maxWidth: 432.0,
          maxHeight: 530.0,
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
          borderRadius: BorderRadius.circular(24.0),
        ),
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisSize: MainAxisSize.max,
                children: [
                  Expanded(
                    child: SelectionArea(
                        child: Text(
                      FFLocalizations.of(context).getText(
                        '3hw6qozm' /* Adicionar nova seção */,
                      ),
                      style: FlutterFlowTheme.of(context).titleLarge.override(
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
                      borderColor: FlutterFlowTheme.of(context).primary,
                      borderRadius: 8.0,
                      borderWidth: 0.5,
                      buttonSize: 32.0,
                      fillColor: FlutterFlowTheme.of(context).secondary,
                      hoverColor: FlutterFlowTheme.of(context).hoverNavBar,
                      hoverIconColor:
                          FlutterFlowTheme.of(context).secondaryBackground,
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
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 0.0, 0.0),
                child: SelectionArea(
                    child: Text(
                  FFLocalizations.of(context).getText(
                    'qweithgy' /* Ao adicionar uma nova seção, v... */,
                  ),
                  style: FlutterFlowTheme.of(context).labelMedium.override(
                        font: GoogleFonts.lexend(
                          fontWeight: FlutterFlowTheme.of(context)
                              .labelMedium
                              .fontWeight,
                          fontStyle: FlutterFlowTheme.of(context)
                              .labelMedium
                              .fontStyle,
                        ),
                        letterSpacing: 0.0,
                        fontWeight:
                            FlutterFlowTheme.of(context).labelMedium.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).labelMedium.fontStyle,
                      ),
                )),
              ),
              Builder(
                builder: (context) => Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 16.0, 0.0, 0.0),
                  child: FFButtonWidget(
                    onPressed: () async {
                      var _shouldSetState = false;
                      _model.addSections = null; // API Call Removed

                      _shouldSetState = true;
                      if (!(_model.addSections?.succeeded ?? true)) {
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
                                  '5q3e1867' /* Erro */,
                                ),
                                description: getJsonField(
                                  (_model.addSections?.jsonBody ?? ''),
                                  r'''$.message''',
                                ).toString(),
                              ),
                            );
                          },
                        );

                        if (_shouldSetState) safeSetState(() {});
                        return;
                      }

                      context.pushNamed(
                        ModulosTrackersMapWidget.routeName,
                        queryParameters: {
                          'sectionsId': serializeParam(
                            getJsonField(
                              (_model.addSections?.jsonBody ?? ''),
                              r'''$.id''',
                            ),
                            ParamType.int,
                          ),
                          'fieldsId': serializeParam(
                            widget!.fieldId,
                            ParamType.int,
                          ),
                          'sectionNumber': serializeParam(
                            getJsonField(
                              (_model.addSections?.jsonBody ?? ''),
                              r'''$.section_number''',
                            ),
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

                      if (_shouldSetState) safeSetState(() {});
                    },
                    text: FFLocalizations.of(context).getText(
                      'ttddafhh' /* Criar nova seção */,
                    ),
                    options: FFButtonOptions(
                      width: double.infinity,
                      height: 40.0,
                      padding:
                          EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      iconPadding:
                          EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      color: FlutterFlowTheme.of(context).primary,
                      textStyle:
                          FlutterFlowTheme.of(context).labelMedium.override(
                                font: GoogleFonts.lexend(
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .labelMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .labelMedium
                                      .fontStyle,
                                ),
                                color: FlutterFlowTheme.of(context).info,
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
                        color: Colors.transparent,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(12.0),
                    ),
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
