import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/custom_functions.dart' as functions;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'info_drop_headers_model.dart';
export 'info_drop_headers_model.dart';

class InfoDropHeadersWidget extends StatefulWidget {
  const InfoDropHeadersWidget({
    super.key,
    this.varText,
    required this.index,
    required this.sequencia,
  });

  final String? varText;
  final int? index;
  final int? sequencia;

  @override
  State<InfoDropHeadersWidget> createState() => _InfoDropHeadersWidgetState();
}

class _InfoDropHeadersWidgetState extends State<InfoDropHeadersWidget> {
  late InfoDropHeadersModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => InfoDropHeadersModel());

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

    return MouseRegion(
      opaque: false,
      cursor: MouseCursor.defer ?? MouseCursor.defer,
      child: InkWell(
        splashColor: Colors.transparent,
        focusColor: Colors.transparent,
        hoverColor: Colors.transparent,
        highlightColor: Colors.transparent,
        onTap: () async {
          if (functions.checkIsHeaderUsedElsewhere(FFAppState().headersSet.toList(),
              widget!.varText!, widget!.sequencia!)) {
            return; // Bloqueia seleção duplicada
          }
          if (functions.checkVarNameTaksCopy(
              FFAppState().headersSet.toList(), widget!.sequencia)) {
            FFAppState().update(() {
              FFAppState().updateHeadersSetAtIndex(
                widget!.sequencia!,
                (e) => e..nome = widget!.varText,
              );
            });
            safeSetState(() {});
            Navigator.pop(context);
          } else {
            FFAppState().update(() {
              FFAppState().addToHeadersSet(HeadersStruct(
                nome: widget!.varText,
                sequencia: widget!.sequencia,
              ));
            });
            safeSetState(() {});
            Navigator.pop(context);
          }
        },
        child: Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: _model.mouseRegionHovered!
                ? FlutterFlowTheme.of(context).alternate
                : Color(0x00000000),
          ),
          child: Padding(
            padding: EdgeInsetsDirectional.fromSTEB(16.0, 16.0, 16.0, 16.0),
            child: Text(
              widget!.varText!,
              style: FlutterFlowTheme.of(context).bodyMedium.override(
                    font: GoogleFonts.lexend(
                      fontWeight:
                          FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                      fontStyle:
                          FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                    ),
                    color: functions.checkIsHeaderUsedElsewhere(
                            FFAppState().headersSet.toList(),
                            widget!.varText!,
                            widget!.sequencia!)
                        ? FlutterFlowTheme.of(context).secondaryText
                        : (functions.checkVarNameTaks(
                                FFAppState().headersSet.toList(),
                                widget!.varText!)
                            ? FlutterFlowTheme.of(context).primary
                            : FlutterFlowTheme.of(context).primaryText),
                    letterSpacing: 0.0,
                    fontWeight: FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                    fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                    decoration: functions.checkIsHeaderUsedElsewhere(
                            FFAppState().headersSet.toList(),
                            widget!.varText!,
                            widget!.sequencia!)
                        ? TextDecoration.lineThrough
                        : TextDecoration.none,
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
