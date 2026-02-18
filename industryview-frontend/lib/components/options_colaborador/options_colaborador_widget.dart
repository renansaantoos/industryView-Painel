import '/backend/api_requests/api_calls.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/components/qrcode_widget.dart';
import '/flows/colaboradores/modal_add_usuario/modal_add_usuario_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import 'dart:ui';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'options_colaborador_model.dart';
export 'options_colaborador_model.dart';

class OptionsColaboradorWidget extends StatefulWidget {
  const OptionsColaboradorWidget({
    super.key,
    required this.typePage,
    this.name,
    this.phone,
    this.idUser,
    this.email,
    this.rolesId,
    this.typeAcessId,
    this.controlAcessId,
    this.typeAcessTxt,
    this.rolesTxt,
    this.controlAcessTxt,
    this.url,
    required this.pageTxt,
    this.usePermission,
    this.qrcode,
    required this.typePage2,
  });

  /// Criação ou edição
  final String? typePage;

  final String? name;
  final String? phone;
  final int? idUser;
  final String? email;
  final int? rolesId;
  final int? typeAcessId;
  final int? controlAcessId;
  final String? typeAcessTxt;
  final String? rolesTxt;
  final String? controlAcessTxt;
  final String? url;

  /// Página de destino
  final String? pageTxt;

  final int? usePermission;
  final String? qrcode;
  final String? typePage2;

  @override
  State<OptionsColaboradorWidget> createState() =>
      _OptionsColaboradorWidgetState();
}

class _OptionsColaboradorWidgetState extends State<OptionsColaboradorWidget> {
  late OptionsColaboradorModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => OptionsColaboradorModel());

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
      width: 200.0,
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
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          MouseRegion(
            opaque: false,
            cursor: MouseCursor.defer ?? MouseCursor.defer,
            child: Builder(
              builder: (context) => InkWell(
                splashColor: Colors.transparent,
                focusColor: Colors.transparent,
                hoverColor: Colors.transparent,
                highlightColor: Colors.transparent,
                onTap: () async {
                  await showDialog(
                    barrierColor: Color(0x80000000),
                    context: context,
                    builder: (dialogContext) {
                      return Dialog(
                        elevation: 0,
                        insetPadding: EdgeInsets.zero,
                        backgroundColor: Colors.transparent,
                        alignment: AlignmentDirectional(0.0, 0.0)
                            .resolve(Directionality.of(context)),
                        child: ModalAddUsuarioWidget(
                          typePage: widget!.typePage!,
                          name: widget!.name,
                          phone: widget!.phone,
                          id: widget!.idUser,
                          email: widget!.email,
                          controlAcessId: widget!.controlAcessId,
                          roleId: widget!.rolesId,
                          typeAcessId: widget!.typeAcessId,
                          roleTxt: widget!.rolesTxt,
                          typeAcessTxt: widget!.typeAcessTxt,
                          controlAcessTxt: widget!.controlAcessTxt,
                          img: widget!.url,
                          userPermission: widget!.usePermission,
                          typePage2: widget!.typePage2,
                        ),
                      );
                    },
                  );

                  Navigator.pop(context);
                },
                child: Container(
                  width: MediaQuery.sizeOf(context).width * 1.0,
                  height: 50.0,
                  decoration: BoxDecoration(
                    color: _model.mouseRegionHovered1!
                        ? FlutterFlowTheme.of(context).primaryBackground
                        : Color(0x00000000),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      Expanded(
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 0.0, 0.0),
                          child: Text(
                            FFLocalizations.of(context).getText(
                              'tp2ba1so' /* Editar informações */,
                            ),
                            style: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .bodyMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .bodyMedium
                                      .fontStyle,
                                ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            onEnter: ((event) async {
              safeSetState(() => _model.mouseRegionHovered1 = true);
            }),
            onExit: ((event) async {
              safeSetState(() => _model.mouseRegionHovered1 = false);
            }),
          ),
          Divider(
            thickness: 1.0,
            color: FlutterFlowTheme.of(context).alternate,
          ),
          MouseRegion(
            opaque: false,
            cursor: MouseCursor.defer ?? MouseCursor.defer,
            child: Builder(
              builder: (context) => InkWell(
                splashColor: Colors.transparent,
                focusColor: Colors.transparent,
                hoverColor: Colors.transparent,
                highlightColor: Colors.transparent,
                onTap: () async {
                  Navigator.pop(context);
                  await showDialog(
                    barrierColor: Color(0x80000000),
                    context: context,
                    builder: (dialogContext) {
                      return Dialog(
                        elevation: 0,
                        insetPadding: EdgeInsets.zero,
                        backgroundColor: Colors.transparent,
                        alignment: AlignmentDirectional(0.0, 0.0)
                            .resolve(Directionality.of(context)),
                        child: QrcodeWidget(
                          userId: widget!.idUser!,
                          nome: widget!.name!,
                          telefone: widget!.phone!,
                          email: widget!.email!,
                          cargo: widget!.rolesTxt!,
                          tipoAcesso: widget!.typeAcessTxt!,
                          nivelAcesso: widget!.controlAcessTxt!,
                          qrcode: widget!.qrcode!,
                          imagem: widget!.url!,
                        ),
                      );
                    },
                  );
                },
                child: Container(
                  width: MediaQuery.sizeOf(context).width * 1.0,
                  height: 50.0,
                  decoration: BoxDecoration(
                    color: _model.mouseRegionHovered2!
                        ? FlutterFlowTheme.of(context).primaryBackground
                        : Color(0x00000000),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      Expanded(
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 0.0, 0.0),
                          child: Text(
                            FFLocalizations.of(context).getText(
                              'zvtjynxu' /* Cracha */,
                            ),
                            style: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .bodyMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .bodyMedium
                                      .fontStyle,
                                ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            onEnter: ((event) async {
              safeSetState(() => _model.mouseRegionHovered2 = true);
            }),
            onExit: ((event) async {
              safeSetState(() => _model.mouseRegionHovered2 = false);
            }),
          ),
          Divider(
            thickness: 1.0,
            color: FlutterFlowTheme.of(context).alternate,
          ),
          MouseRegion(
            opaque: false,
            cursor: MouseCursor.defer ?? MouseCursor.defer,
            child: Builder(
              builder: (context) => InkWell(
                splashColor: Colors.transparent,
                focusColor: Colors.transparent,
                hoverColor: Colors.transparent,
                highlightColor: Colors.transparent,
                onTap: () async {
                  if (widget!.pageTxt == '1') {
                    await showDialog(
                      barrierColor: Color(0x80000000),
                      context: context,
                      builder: (dialogContext) {
                        return Dialog(
                          elevation: 0,
                          insetPadding: EdgeInsets.zero,
                          backgroundColor: Colors.transparent,
                          alignment: AlignmentDirectional(0.0, 0.0)
                              .resolve(Directionality.of(context)),
                          child: ModalConfirmDeleteWidget(
                            title: 'Esta ação removerá este colaborador!',
                            description:
                                'Tem certeza que deseja remover esse colaborador?',
                            actionAPi: () async {
                              var _shouldSetState = false;
                              _model.aPiDeleteUser =
                                  await UserGroup.deleteUserCall.call(
                                usersId: widget!.idUser,
                                bearerAuth: FFAppState().token,
                              );

                              _shouldSetState = true;
                              if ((_model.aPiDeleteUser?.succeeded ?? true)) {
                                return;
                              }

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
                                      title:
                                          FFLocalizations.of(context).getText(
                                        '1821ihy6' /* Erro! */,
                                      ),
                                      description: getJsonField(
                                        (_model.aPiDeleteUser?.jsonBody ?? ''),
                                        r'''$.message''',
                                      ).toString(),
                                    ),
                                  );
                                },
                              );

                              return;
                            },
                            actionPage: () async {
                              context.pushNamed(
                                FuncionarioWidget.routeName,
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
                  } else if (widget!.pageTxt == '2') {
                    await showDialog(
                      barrierColor: Color(0x80000000),
                      context: context,
                      builder: (dialogContext) {
                        return Dialog(
                          elevation: 0,
                          insetPadding: EdgeInsets.zero,
                          backgroundColor: Colors.transparent,
                          alignment: AlignmentDirectional(0.0, 0.0)
                              .resolve(Directionality.of(context)),
                          child: ModalConfirmDeleteWidget(
                            title: 'Esta ação removerá este líder!',
                            description:
                                'Tem certeza que deseja remover esse líder?',
                            actionAPi: () async {
                              var _shouldSetState = false;
                              _model.aPIDeleteLeader = await ProjectsGroup
                                  .deleteTeamsLeadersRecordCall
                                  .call(
                                teamsLeadersId: widget!.idUser,
                                bearerAuth: FFAppState().token,
                              );

                              _shouldSetState = true;
                              if ((_model.aPiDeleteUser?.succeeded ?? true)) {
                                return;
                              }

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
                                      title:
                                          FFLocalizations.of(context).getText(
                                        '0zo9bg9o' /* Erro! */,
                                      ),
                                      description: getJsonField(
                                        (_model.aPIDeleteLeader?.jsonBody ??
                                            ''),
                                        r'''$.message''',
                                      ).toString(),
                                    ),
                                  );
                                },
                              );

                              return;
                            },
                            actionPage: () async {
                              context.pushNamed(
                                GestaoDeEquipeWidget.routeName,
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
                  } else {
                    await showDialog(
                      barrierColor: Color(0x80000000),
                      context: context,
                      builder: (dialogContext) {
                        return Dialog(
                          elevation: 0,
                          insetPadding: EdgeInsets.zero,
                          backgroundColor: Colors.transparent,
                          alignment: AlignmentDirectional(0.0, 0.0)
                              .resolve(Directionality.of(context)),
                          child: ModalConfirmDeleteWidget(
                            title: 'Esta ação removerá este membro da equipe!',
                            description:
                                'Tem certeza que deseja remover esse membro da equipe??',
                            actionAPi: () async {
                              var _shouldSetState = false;
                              _model.aPiDeleteMember = await ProjectsGroup
                                  .deleteTeamsMembersRecordCall
                                  .call(
                                teamsMembersId: widget!.idUser,
                                bearerAuth: FFAppState().token,
                              );

                              _shouldSetState = true;
                              if ((_model.aPiDeleteUser?.succeeded ?? true)) {
                                return;
                              }

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
                                      title:
                                          FFLocalizations.of(context).getText(
                                        'z8c6vzbl' /* Erro! */,
                                      ),
                                      description: getJsonField(
                                        (_model.aPiDeleteMember?.jsonBody ??
                                            ''),
                                        r'''$.message''',
                                      ).toString(),
                                    ),
                                  );
                                },
                              );

                              return;
                            },
                            actionPage: () async {
                              context.pushNamed(
                                GestaoDeEquipeWidget.routeName,
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
                  }

                  Navigator.pop(context);

                  safeSetState(() {});
                },
                child: Container(
                  width: MediaQuery.sizeOf(context).width * 1.0,
                  height: 50.0,
                  decoration: BoxDecoration(
                    color: _model.mouseRegionHovered3!
                        ? FlutterFlowTheme.of(context).primaryBackground
                        : Color(0x00000000),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      Expanded(
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 0.0, 0.0),
                          child: Text(
                            FFLocalizations.of(context).getText(
                              'xzoqypq7' /* Remover */,
                            ),
                            style: FlutterFlowTheme.of(context)
                                .bodyMedium
                                .override(
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
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            onEnter: ((event) async {
              safeSetState(() => _model.mouseRegionHovered3 = true);
            }),
            onExit: ((event) async {
              safeSetState(() => _model.mouseRegionHovered3 = false);
            }),
          ),
        ],
      ),
    );
  }
}
