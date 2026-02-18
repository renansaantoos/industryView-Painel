import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/import/info_drop_headers/info_drop_headers_widget.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'headers_model.dart';
export 'headers_model.dart';

class HeadersWidget extends StatefulWidget {
  const HeadersWidget({
    super.key,
    required this.sequencia,
  });

  final int? sequencia;

  @override
  State<HeadersWidget> createState() => _HeadersWidgetState();
}

class _HeadersWidgetState extends State<HeadersWidget> {
  late HeadersModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => HeadersModel());

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
        borderRadius: BorderRadius.circular(4.0),
      ),
      child: Container(
        width: 150.0,
        constraints: BoxConstraints(
          maxHeight: 350.0,
        ),
        decoration: BoxDecoration(
          color: FlutterFlowTheme.of(context).status03,
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
          borderRadius: BorderRadius.circular(4.0),
          border: Border.all(
            color: FlutterFlowTheme.of(context).alternate,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(
              child: Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 16.0),
                child: Builder(
                  builder: (context) {
                    final listaTrackers = FFAppState().headers.toList();

                    return ListView.builder(
                      padding: EdgeInsets.zero,
                      primary: false,
                      shrinkWrap: true,
                      scrollDirection: Axis.vertical,
                      itemCount: listaTrackers.length,
                      itemBuilder: (context, listaTrackersIndex) {
                        final listaTrackersItem =
                            listaTrackers[listaTrackersIndex];
                        return InfoDropHeadersWidget(
                          key: Key(
                              'Keyres_${listaTrackersIndex}_of_${listaTrackers.length}'),
                          varText: listaTrackersItem,
                          index: listaTrackersIndex,
                          sequencia: widget!.sequencia!,
                        );
                      },
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
