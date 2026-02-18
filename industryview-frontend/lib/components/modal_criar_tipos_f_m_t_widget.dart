import '/backend/api_requests/api_calls.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_criar_tipos_f_m_t_model.dart';
export 'modal_criar_tipos_f_m_t_model.dart';

class ModalCriarTiposFMTWidget extends StatefulWidget {
  const ModalCriarTiposFMTWidget({
    super.key,
    required this.tipo,
    required this.refresh,
    required this.equipamentTypeId,
  });

  final String? tipo;
  final Future Function()? refresh;
  final int? equipamentTypeId;

  @override
  State<ModalCriarTiposFMTWidget> createState() =>
      _ModalCriarTiposFMTWidgetState();
}

class _ModalCriarTiposFMTWidgetState extends State<ModalCriarTiposFMTWidget> {
  late ModalCriarTiposFMTModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalCriarTiposFMTModel());

    _model.searchTextController ??= TextEditingController();
    _model.searchFocusNode ??= FocusNode();

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

    return Container(
      width: 500.0,
      decoration: BoxDecoration(
        color: FlutterFlowTheme.of(context).secondaryBackground,
        borderRadius: BorderRadius.circular(12.0),
      ),
      child: Form(
        key: _model.formKey,
        autovalidateMode: AutovalidateMode.disabled,
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    () {
                      if (widget!.tipo == 'F') {
                        return FFLocalizations.of(context).getVariableText(
                          ptText: 'Criar fabricante',
                          esText: 'Crear fabricante',
                          enText: 'Create manufacturer',
                        );
                      } else if (widget!.tipo == 'M') {
                        return FFLocalizations.of(context).getVariableText(
                          ptText: 'Criar modelo',
                          esText: 'Crear plantilla',
                          enText: 'Create template',
                        );
                      } else {
                        return FFLocalizations.of(context).getVariableText(
                          ptText: 'Criar tipo de tracker',
                          esText: 'Crear tipo de rastreador',
                          enText: 'Create tracker type',
                        );
                      }
                    }(),
                    style: FlutterFlowTheme.of(context).titleLarge.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FontWeight.w500,
                            fontStyle: FlutterFlowTheme.of(context)
                                .titleLarge
                                .fontStyle,
                          ),
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w500,
                          fontStyle:
                              FlutterFlowTheme.of(context).titleLarge.fontStyle,
                        ),
                  ),
                  Align(
                    alignment: AlignmentDirectional(1.0, -1.0),
                    child: FlutterFlowIconButton(
                      borderColor: FlutterFlowTheme.of(context).primary,
                      borderRadius: 8.0,
                      borderWidth: 1.0,
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
                ],
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 16.0, 0.0, 0.0),
                child: TextFormField(
                  controller: _model.searchTextController,
                  focusNode: _model.searchFocusNode,
                  onChanged: (_) => EasyDebounce.debounce(
                    '_model.searchTextController',
                    Duration(milliseconds: 500),
                    () => safeSetState(() {}),
                  ),
                  autofocus: false,
                  obscureText: false,
                  decoration: InputDecoration(
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
                          fontStyle:
                              FlutterFlowTheme.of(context).labelSmall.fontStyle,
                        ),
                    hintText: FFLocalizations.of(context).getText(
                      'x0bddg7t' /* Digite o tipo */,
                    ),
                    hintStyle: FlutterFlowTheme.of(context).labelSmall.override(
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
                          fontStyle:
                              FlutterFlowTheme.of(context).labelSmall.fontStyle,
                        ),
                    enabledBorder: OutlineInputBorder(
                      borderSide: BorderSide(
                        color: FlutterFlowTheme.of(context).alternate,
                        width: 2.0,
                      ),
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(
                        color: FlutterFlowTheme.of(context).primary,
                        width: 2.0,
                      ),
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderSide: BorderSide(
                        color: FlutterFlowTheme.of(context).error,
                        width: 2.0,
                      ),
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderSide: BorderSide(
                        color: FlutterFlowTheme.of(context).error,
                        width: 2.0,
                      ),
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    filled: true,
                    fillColor: FlutterFlowTheme.of(context).primaryBackground,
                    suffixIcon: _model.searchTextController!.text.isNotEmpty
                        ? InkWell(
                            onTap: () async {
                              _model.searchTextController?.clear();
                              safeSetState(() {});
                            },
                            child: Icon(
                              Icons.clear,
                              color: FlutterFlowTheme.of(context).primary,
                              size: 22.0,
                            ),
                          )
                        : null,
                  ),
                  style: FlutterFlowTheme.of(context).labelSmall.override(
                        font: GoogleFonts.lexend(
                          fontWeight: FlutterFlowTheme.of(context)
                              .labelSmall
                              .fontWeight,
                          fontStyle:
                              FlutterFlowTheme.of(context).labelSmall.fontStyle,
                        ),
                        color: FlutterFlowTheme.of(context).primaryText,
                        letterSpacing: 0.0,
                        fontWeight:
                            FlutterFlowTheme.of(context).labelSmall.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).labelSmall.fontStyle,
                      ),
                  validator:
                      _model.searchTextControllerValidator.asValidator(context),
                ),
              ),
              Align(
                alignment: AlignmentDirectional(-1.0, 1.0),
                child: Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 16.0, 0.0, 0.0),
                  child: FFButtonWidget(
                    onPressed: () async {
                      var _shouldSetState = false;
                      if (_model.formKey.currentState == null ||
                          !_model.formKey.currentState!.validate()) {
                        return;
                      }
                      if (widget!.tipo == 'M') {
                        _model.apiAddModulo = null; // API Call Removed

                        _shouldSetState = true;
                        if ((_model.apiAddModulo?.succeeded ?? true)) {
                          safeSetState(() {
                            _model.searchTextController?.clear();
                          });
                          await widget.refresh?.call();
                          Navigator.pop(context);
                          if (_shouldSetState) safeSetState(() {});
                          return;
                        } else {
                          if (_shouldSetState) safeSetState(() {});
                          return;
                        }
                      } else if (widget!.tipo == 'F') {
                        _model.aPiAddManufacturers = await ManufacturersGroup
                            .addManufacturersRecordCall
                            .call(
                          bearerAuth: FFAppState().token,
                          name: _model.searchTextController.text,
                          equipamentsTypesId: widget!.equipamentTypeId,
                        );

                        _shouldSetState = true;
                        if ((_model.aPiAddManufacturers?.succeeded ?? true)) {
                          safeSetState(() {
                            _model.searchTextController?.clear();
                          });
                          await widget.refresh?.call();
                          Navigator.pop(context);
                          if (_shouldSetState) safeSetState(() {});
                          return;
                        } else {
                          if (_shouldSetState) safeSetState(() {});
                          return;
                        }
                      } else {
                        _model.apiTrackerType = null; // API Call Removed

                        _shouldSetState = true;
                        if ((_model.apiTrackerType?.succeeded ?? true)) {
                          safeSetState(() {
                            _model.searchTextController?.clear();
                          });
                          await widget.refresh?.call();
                          Navigator.pop(context);
                          if (_shouldSetState) safeSetState(() {});
                          return;
                        } else {
                          if (_shouldSetState) safeSetState(() {});
                          return;
                        }
                      }

                      if (_shouldSetState) safeSetState(() {});
                    },
                    text: () {
                      if (widget!.tipo == 'F') {
                        return 'Criar fabricante';
                      } else if (widget!.tipo == 'M') {
                        return 'Criar modelo';
                      } else {
                        return 'Criar tracker';
                      }
                    }(),
                    options: FFButtonOptions(
                      height: 40.0,
                      padding:
                          EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
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
