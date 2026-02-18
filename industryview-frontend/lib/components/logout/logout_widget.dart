import '/auth/custom_auth/auth_util.dart';
import '/backend/schema/structs/index.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'logout_model.dart';
export 'logout_model.dart';

class LogoutWidget extends StatefulWidget {
  const LogoutWidget({super.key});

  @override
  State<LogoutWidget> createState() => _LogoutWidgetState();
}

class _LogoutWidgetState extends State<LogoutWidget> {
  late LogoutModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LogoutModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(16.0),
      child: Container(
        width: 300.0,
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
        child: Padding(
          padding: EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              FFButtonWidget(
                onPressed: () async {
                  context.pushNamed(
                    GerenciamentodaContaWidget.routeName,
                    extra: <String, dynamic>{
                      kTransitionInfoKey: TransitionInfo(
                        hasTransition: true,
                        transitionType: PageTransitionType.fade,
                        duration: Duration(milliseconds: 0),
                      ),
                    },
                  );
                },
                text: FFLocalizations.of(context).getText(
                  '7az7g2pj' /* Gerenciamento da Conta */,
                ),
                options: FFButtonOptions(
                  width: double.infinity,
                  height: 40.0,
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                  iconPadding:
                      EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                  color: FlutterFlowTheme.of(context).primary,
                  textStyle: FlutterFlowTheme.of(context).bodyLarge.override(
                        font: GoogleFonts.lexend(
                          fontWeight:
                              FlutterFlowTheme.of(context).bodyLarge.fontWeight,
                          fontStyle:
                              FlutterFlowTheme.of(context).bodyLarge.fontStyle,
                        ),
                        color: FlutterFlowTheme.of(context).info,
                        fontSize: 12.0,
                        letterSpacing: 0.0,
                        fontWeight:
                            FlutterFlowTheme.of(context).bodyLarge.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).bodyLarge.fontStyle,
                      ),
                  elevation: 0.0,
                  borderSide: BorderSide(
                    color: FlutterFlowTheme.of(context).alternate,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.circular(12.0),
                ),
              ),
              FFButtonWidget(
                onPressed: () async {
                  FFAppState().infoUser = VarInfoUserStruct();
                  FFAppState().navBarSelection = 1;
                  FFAppState().token = '';
                  FFAppState().filterManufacturers = [];
                  FFAppState().listTypeManufacturers = [];
                  FFAppState().listTypeModules = [];
                  FFAppState().filterTypeModules = [];
                  FFAppState().projectsInfo = ProjectsInfo1Struct();
                  FFAppState().setIds = [];
                  FFAppState().listSequenciaEstacas = [];
                  FFAppState().user0 = [];
                  FFAppState().itemsReceived = 0;
                  FFAppState().nextPage = 0;
                  FFAppState().prevPage = 0;
                  FFAppState().itemsTotal = 0;
                  FFAppState().loading = false;
                  FFAppState().teamId = 0;
                  FFAppState().filterUserSet = [];
                  FFAppState().infostrackerstype = [];
                  FFAppState().qtdEstacas = [];
                  FFAppState().form1 = false;
                  FFAppState().form2 = false;
                  FFAppState().statusCheckGlobal = [];
                  FFAppState().ultimosClicks = [];
                  FFAppState().idEstaca = 0;
                  FFAppState().addFileiraTracker = [];
                  FFAppState().idsExistentes = [];
                  FFAppState().esqueleto1 = false;
                  FFAppState().esqueleto2 = false;
                  FFAppState().excluiuTrackers = false;
                  FFAppState().id = 0;
                  FFAppState().actionReturn = false;
                  FFAppState().jsonRowsRef = [];
                  FFAppState().filtroIdsStatusStakes = [];
                  FFAppState().filtroIdsStatusTracker = [];
                  FFAppState().filtroIdsTypeTracker = [];
                  FFAppState().filtroIdsCargo = [];

                  FFAppState().filtroTeams = [];
                  FFAppState().secaoVazia = [];
                  FFAppState().fileiraVazia = [];
                  FFAppState().trackerVazio = [];
                  FFAppState().listaVazia = [];
                  FFAppState().filtroBacklogSprint = false;
                  FFAppState().filterTrackers = [];
                  FFAppState().filterManufactures = FilterStruct();
                  FFAppState().filterTracker = FilterStruct();
                  FFAppState().filterModules = FilterStruct();
                  FFAppState().datesPicked = [];
                  FFAppState().userLideres = [];
                  FFAppState().update(() {});
                  GoRouter.of(context).prepareAuthEvent();
                  await authManager.signOut();
                  GoRouter.of(context).clearRedirectLocation();

                  context.goNamedAuth(
                    LoginWidget.routeName,
                    context.mounted,
                    extra: <String, dynamic>{
                      kTransitionInfoKey: TransitionInfo(
                        hasTransition: true,
                        transitionType: PageTransitionType.fade,
                        duration: Duration(milliseconds: 0),
                      ),
                    },
                  );
                },
                text: FFLocalizations.of(context).getText(
                  'istm4h11' /* Sair */,
                ),
                options: FFButtonOptions(
                  width: double.infinity,
                  height: 40.0,
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                  iconPadding:
                      EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                  color: FlutterFlowTheme.of(context).error,
                  textStyle: FlutterFlowTheme.of(context).bodyLarge.override(
                        font: GoogleFonts.lexend(
                          fontWeight:
                              FlutterFlowTheme.of(context).bodyLarge.fontWeight,
                          fontStyle:
                              FlutterFlowTheme.of(context).bodyLarge.fontStyle,
                        ),
                        color: FlutterFlowTheme.of(context).info,
                        fontSize: 12.0,
                        letterSpacing: 0.0,
                        fontWeight:
                            FlutterFlowTheme.of(context).bodyLarge.fontWeight,
                        fontStyle:
                            FlutterFlowTheme.of(context).bodyLarge.fontStyle,
                      ),
                  elevation: 0.0,
                  borderSide: BorderSide(
                    color: FlutterFlowTheme.of(context).alternate,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.circular(12.0),
                ),
              ),
            ].divide(SizedBox(height: 16.0)),
          ),
        ),
      ),
    );
  }
}
