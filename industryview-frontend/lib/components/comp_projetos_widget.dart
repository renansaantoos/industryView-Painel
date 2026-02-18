import '/backend/schema/structs/index.dart';
import '/components/options_projetos/options_projetos_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'comp_projetos_model.dart';
export 'comp_projetos_model.dart';

class CompProjetosWidget extends StatefulWidget {
  const CompProjetosWidget({
    super.key,
    this.parameter1,
    this.parameter2,
    this.parameter3,
    this.parameter4,
    this.parameter5,
    this.parameter6,
    this.parameter7,
    this.parameter8,
    this.parameter9,
    this.parameter10,
    this.parameter11,
    this.parameter12,
    this.parameter13,
    this.parameter14,
    this.parameter15,
    this.parameter16,
    this.parameter17,
    this.parameter18,
    this.parameter19,
    this.parameter20,
    this.parameter21,
    this.parameter22,
    this.parameter23,
    this.parameter24,
    this.parameter25,
    this.parameter26,
    this.parameter27,
    this.parameter28,
    this.parameter29,
    this.parameter30,
    this.parameter31,
    this.parameter32,
    this.parameter33,
    this.parameter34,
  });

  final dynamic parameter1;
  final dynamic parameter2;
  final dynamic parameter3;
  final dynamic parameter4;
  final dynamic parameter5;
  final dynamic parameter6;
  final dynamic parameter7;
  final dynamic parameter8;
  final dynamic parameter9;
  final dynamic parameter10;
  final dynamic parameter11;
  final dynamic parameter12;
  final dynamic parameter13;
  final dynamic parameter14;
  final dynamic parameter15;
  final dynamic parameter16;
  final dynamic parameter17;
  final dynamic parameter18;
  final dynamic parameter19;
  final dynamic parameter20;
  final dynamic parameter21;
  final dynamic parameter22;
  final dynamic parameter23;
  final dynamic parameter24;
  final dynamic parameter25;
  final dynamic parameter26;
  final dynamic parameter27;
  final dynamic parameter28;
  final dynamic parameter29;
  final dynamic parameter30;
  final dynamic parameter31;
  final dynamic parameter32;
  final dynamic parameter33;
  final dynamic parameter34;

  @override
  State<CompProjetosWidget> createState() => _CompProjetosWidgetState();
}

class _CompProjetosWidgetState extends State<CompProjetosWidget> {
  late CompProjetosModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CompProjetosModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      opaque: false,
      cursor: MouseCursor.defer ?? MouseCursor.defer,
      child: InkWell(
        splashColor: Colors.transparent,
        focusColor: Colors.transparent,
        hoverColor: Colors.transparent,
        highlightColor: Colors.transparent,
        onTap: () async {
          try {
            FFAppState().projectsInfo = ProjectsInfo1Struct();
            FFAppState().update(() {});

            int _safeId(dynamic val) {
              if (val is int) return val;
              if (val is double) return val.round();
              if (val is Map && val.containsKey('id')) return _safeId(val['id']);
              if (val is String) {
                  return int.tryParse(val) ?? 
                         (double.tryParse(val)?.round() ?? 0);
              }
              return 0;
            }

            FFAppState().projectsInfo = ProjectsInfo1Struct(
              id: _safeId(widget!.parameter3),
              registrationNumber: widget!.parameter2?.toString(),
              name: widget!.parameter1?.toString(),
              originRegistration: widget!.parameter4?.toString(),
              art: widget!.parameter5?.toString(),
              rrt: widget!.parameter6?.toString(),
              cib: widget!.parameter7?.toString(),
              realStateRegistration: widget!.parameter8?.toString(),
              permitNumber: widget!.parameter9?.toString(),
              cnae: widget!.parameter10?.toString(),
              responsible: widget!.parameter11?.toString(),
              cep: widget!.parameter12?.toString(),
              city: widget!.parameter13?.toString(),
              number: widget!.parameter14?.toString(),
              state: widget!.parameter15?.toString(),
              country: widget!.parameter16?.toString(),
              street: widget!.parameter17?.toString(),
              complement: widget!.parameter18?.toString(),
              cnpj: widget!.parameter19?.toString(),
              completionPercentage: _safeId(widget!.parameter20),
              projectsStatusesId: _safeId(widget!.parameter21),
              projectsWorksSituationsId: _safeId(widget!.parameter22),
              category: widget!.parameter23?.toString(),
              destination: widget!.parameter24?.toString(),
              projectWorkType: widget!.parameter25?.toString(),
              resultingWorkArea: widget!.parameter26?.toString(),
              projectCreationDate: widget!.parameter27,
              startDate: valueOrDefault<String>(
                (_safeId(widget!.parameter28) > 0)
                    ? dateTimeFormat(
                        "dd/MM/yyyy HH:mm",
                        DateTime.fromMillisecondsSinceEpoch(_safeId(widget!.parameter28)),
                        locale: FFLocalizations.of(context).languageCode,
                      )
                    : null,
                '0',
              ),
              situationDate: valueOrDefault<String>(
                (_safeId(widget!.parameter29) > 0)
                    ? dateTimeFormat(
                        "dd/MM/yyyy HH:mm",
                        DateTime.fromMillisecondsSinceEpoch(_safeId(widget!.parameter29)),
                        locale: FFLocalizations.of(context).languageCode,
                      )
                    : null,
                '0',
              ),
              lastTeamCreated: LastTeamCreatedStruct(
                 id: _safeId(widget!.parameter30),
              ),
              neighborhood: widget!.parameter33?.toString(),
            );
            FFAppState().teamId = _safeId(widget!.parameter30);
            FFAppState().update(() {});

            context.pushNamed(
              ProjetoDetalhesWidget.routeName,
              extra: <String, dynamic>{
                kTransitionInfoKey: TransitionInfo(
                  hasTransition: true,
                  transitionType: PageTransitionType.fade,
                  duration: Duration(milliseconds: 0),
                ),
              },
            );
          } catch (e) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  'Erro ao abrir projeto: $e',
                  style: TextStyle(color: Colors.white),
                ),
                backgroundColor: FlutterFlowTheme.of(context).error,
              ),
            );
          }
        },
        child: Material(
          color: Colors.transparent,
          elevation: 1.0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.0),
          ),
          child: Container(
            decoration: BoxDecoration(
              color: valueOrDefault<Color>(
                _model.mouseRegionHovered!
                    ? FlutterFlowTheme.of(context).hoverNavBar
                    : FlutterFlowTheme.of(context).primaryBackground,
                FlutterFlowTheme.of(context).secondaryBackground,
              ),
              borderRadius: BorderRadius.circular(12.0),
              border: Border.all(
                color: valueOrDefault<Color>(
                  _model.mouseRegionHovered!
                      ? FlutterFlowTheme.of(context).hoverNavBar
                      : FlutterFlowTheme.of(context).alternate,
                  FlutterFlowTheme.of(context).alternate,
                ),
              ),
            ),
            child: Padding(
              padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
              child: Row(
                mainAxisSize: MainAxisSize.max,
                children: [
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SelectionArea(
                            child: Text(
                          widget!.parameter1!.toString(),
                          style: FlutterFlowTheme.of(context)
                              .titleSmall
                              .override(
                                font: GoogleFonts.lexend(
                                  fontWeight: FontWeight.w500,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .titleSmall
                                      .fontStyle,
                                ),
                                color: _model.mouseRegionHovered!
                                    ? FlutterFlowTheme.of(context)
                                        .secondaryBackground
                                    : FlutterFlowTheme.of(context).primaryText,
                                letterSpacing: 0.0,
                                fontWeight: FontWeight.w500,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .titleSmall
                                    .fontStyle,
                              ),
                        )),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              FFLocalizations.of(context).getText(
                                'tg0ya0mg' /* CNO: */,
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
                                    color: _model.mouseRegionHovered!
                                        ? FlutterFlowTheme.of(context)
                                            .secondaryBackground
                                        : FlutterFlowTheme.of(context)
                                            .secondaryText,
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontStyle,
                                  ),
                            ),
                            SelectionArea(
                                child: Text(
                              widget!.parameter2!.toString(),
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
                                    color: _model.mouseRegionHovered!
                                        ? FlutterFlowTheme.of(context)
                                            .secondaryBackground
                                        : FlutterFlowTheme.of(context)
                                            .secondaryText,
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontStyle,
                                  ),
                            )),
                          ].divide(SizedBox(width: 4.0)),
                        ),
                      ],
                    ),
                  ),
                  Builder(
                    builder: (context) => FlutterFlowIconButton(
                      borderColor: Colors.transparent,
                      borderRadius: 30.0,
                      borderWidth: 1.0,
                      buttonSize: 40.0,
                      icon: Icon(
                        Icons.more_vert,
                        color: _model.mouseRegionHovered!
                            ? FlutterFlowTheme.of(context).secondaryBackground
                            : FlutterFlowTheme.of(context).secondaryText,
                        size: 20.0,
                      ),
                      onPressed: () async {
                        try {
                          FFAppState().projectsInfo = ProjectsInfo1Struct();
                          
                          int _safeId(dynamic val) {
                            if (val is int) return val;
                            if (val is double) return val.round();
                            if (val is Map && val.containsKey('id')) return _safeId(val['id']);
                            if (val is String) {
                                return int.tryParse(val) ?? 
                                       (double.tryParse(val)?.round() ?? 0);
                            }
                            return 0;
                          }

                          safeSetState(() {});
                          FFAppState().projectsInfo = ProjectsInfo1Struct(
                            id: _safeId(widget!.parameter3),
                            registrationNumber: widget!.parameter2?.toString(),
                            name: widget!.parameter1?.toString(),
                            originRegistration: widget!.parameter4?.toString(),
                            art: widget!.parameter5?.toString(),
                            rrt: widget!.parameter6?.toString(),
                            cib: widget!.parameter7?.toString(),
                            realStateRegistration: widget!.parameter8?.toString(),
                            permitNumber: widget!.parameter9?.toString(),
                            cnae: widget!.parameter10?.toString(),
                            responsible: widget!.parameter11?.toString(),
                            cep: widget!.parameter12?.toString(),
                            city: widget!.parameter13?.toString(),
                            number: widget!.parameter14?.toString(),
                            state: widget!.parameter15?.toString(),
                            country: widget!.parameter16?.toString(),
                            street: widget!.parameter17?.toString(),
                            complement: widget!.parameter18?.toString(),
                            cnpj: widget!.parameter19?.toString(),
                            completionPercentage: _safeId(widget!.parameter20),
                            projectsStatusesId: _safeId(widget!.parameter21),
                            projectsWorksSituationsId: _safeId(widget!.parameter22),
                            category: widget!.parameter23?.toString(),
                            destination: widget!.parameter24?.toString(),
                            projectWorkType: widget!.parameter25?.toString(),
                            resultingWorkArea: widget!.parameter26?.toString(),
                            projectCreationDate: widget!.parameter27,
                          startDate: valueOrDefault<String>(
                            (_safeId(widget!.parameter28) > 0)
                                ? dateTimeFormat(
                                    "dd/MM/yyyy HH:mm",
                                    DateTime.fromMillisecondsSinceEpoch(_safeId(widget!.parameter28)),
                                    locale: FFLocalizations.of(context).languageCode,
                                  )
                                : null,
                            '0',
                          ),
                          situationDate: valueOrDefault<String>(
                            (_safeId(widget!.parameter29) > 0)
                                ? dateTimeFormat(
                                    "dd/MM/yyyy HH:mm",
                                    DateTime.fromMillisecondsSinceEpoch(_safeId(widget!.parameter29)),
                                    locale: FFLocalizations.of(context).languageCode,
                                  )
                                : null,
                            '0',
                          ),
                            lastTeamCreated: LastTeamCreatedStruct(
                              id: _safeId(widget!.parameter30),
                            ),
                            url: widget!.parameter31?.toString(),
                            fileName: valueOrDefault<String>(
                              widget!.parameter32?.toString(),
                              'null',
                            ),
                            neighborhood: widget!.parameter33?.toString(),
                          );
                          safeSetState(() {});
                          await showAlignedDialog(
                            barrierColor: Colors.transparent,
                            context: context,
                            isGlobal: false,
                            avoidOverflow: true,
                            targetAnchor: AlignmentDirectional(1.0, 1.0)
                                .resolve(Directionality.of(context)),
                            followerAnchor: AlignmentDirectional(1.0, -1.0)
                                .resolve(Directionality.of(context)),
                            builder: (dialogContext) {
                              return Material(
                                color: Colors.transparent,
                                child: OptionsProjetosWidget(
                                  id: widget!.parameter3,
                                ),
                              );
                            },
                          );
                        } catch (e) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                'Erro ao abrir opções: $e',
                                style: TextStyle(color: Colors.white),
                              ),
                              backgroundColor: FlutterFlowTheme.of(context).error,
                            ),
                          );
                        }
                      },
                    ),
                  ),
                ].divide(SizedBox(width: 12.0)),
              ),
            ),
          ),
        ),
      ),
      onEnter: ((event) async {
        safeSetState(() => _model.mouseRegionHovered = true);
      }),
      onExit: ((event) async {
        safeSetState(() => _model.mouseRegionHovered = false);
      }),
    );
  }
}
