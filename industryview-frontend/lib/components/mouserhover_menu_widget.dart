import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'mouserhover_menu_model.dart';
export 'mouserhover_menu_model.dart';

class MouserhoverMenuWidget extends StatefulWidget {
  const MouserhoverMenuWidget({
    super.key,
    this.parameter1,
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
    this.parameter35,
    this.parameter36,
    this.parameter37,
  });

  final dynamic parameter1;
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
  final dynamic parameter35;
  final dynamic parameter36;
  final dynamic parameter37;

  @override
  State<MouserhoverMenuWidget> createState() => _MouserhoverMenuWidgetState();
}

class _MouserhoverMenuWidgetState extends State<MouserhoverMenuWidget> {
  late MouserhoverMenuModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => MouserhoverMenuModel());

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
      child: Padding(
        padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
        child: Container(
          decoration: BoxDecoration(
            color: () {
              if (_model.mouseRegionHovered!) {
                return FlutterFlowTheme.of(context).hoverNavBar;
              } else if (FFAppState().projectsInfo.id == widget!.parameter3) {
                return FlutterFlowTheme.of(context).hoverNavBar;
              } else {
                return Color(0x002D323F);
              }
            }(),
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: Padding(
            padding: EdgeInsetsDirectional.fromSTEB(16.0, 4.0, 16.0, 4.0),
            child: Row(
              mainAxisSize: MainAxisSize.max,
              children: [
                Container(
                  width: 20.0,
                  height: 2.0,
                  decoration: BoxDecoration(),
                ),
                Flexible(
                  child: Text(
                    widget!.parameter1!.toString(),
                    style: FlutterFlowTheme.of(context).labelMedium.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FlutterFlowTheme.of(context)
                                .labelMedium
                                .fontWeight,
                            fontStyle: FlutterFlowTheme.of(context)
                                .labelMedium
                                .fontStyle,
                          ),
                          color: FlutterFlowTheme.of(context).info,
                          fontSize: 12.0,
                          letterSpacing: 0.0,
                          fontWeight: FlutterFlowTheme.of(context)
                              .labelMedium
                              .fontWeight,
                          fontStyle: FlutterFlowTheme.of(context)
                              .labelMedium
                              .fontStyle,
                        ),
                  ),
                ),
              ],
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
