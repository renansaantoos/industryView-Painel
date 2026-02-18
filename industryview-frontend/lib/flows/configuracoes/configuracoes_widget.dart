import '/components/nav_bar/nav_bar_widget.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/backend/api_requests/api_calls.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:aligned_dialog/aligned_dialog.dart';
import 'configuracoes_model.dart';
export 'configuracoes_model.dart';
import '/flows/configuracoes/modal_configuracao/modal_configuracao_widget.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/flows/modal_criar_tarefa/modal_add_unity_widget.dart';
import '/flows/modal_criar_tarefa/modal_add_discipline_widget.dart';

class ConfiguracoesWidget extends StatefulWidget {
  const ConfiguracoesWidget({super.key});

  static String routeName = 'Configuracoes';
  static String routePath = '/configuracoes';

  @override
  State<ConfiguracoesWidget> createState() => _ConfiguracoesWidgetState();
}

class _ConfiguracoesWidgetState extends State<ConfiguracoesWidget> with TickerProviderStateMixin {
  late ConfiguracoesModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ConfiguracoesModel());
    _model.tabController = TabController(length: 2, vsync: this);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      FFAppState().navBarSelection = 7;
      safeSetState(() {});
    });
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
        body: SafeArea(
          top: true,
          child: Row(
            mainAxisSize: MainAxisSize.max,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              wrapWithModel(
                model: _model.navBarModel,
                updateCallback: () => safeSetState(() {}),
                child: NavBarWidget(),
              ),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.settings_rounded,
                            color: FlutterFlowTheme.of(context).primary,
                            size: 24.0,
                          ),
                          Text(
                            'Configurações',
                            style: FlutterFlowTheme.of(context)
                                .headlineMedium
                                .override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                          ),
                        ].divide(SizedBox(width: 8.0)),
                      ),
                      Text(
                        'Aqui você pode gerenciar as unidades de medida e disciplinas do sistema.',
                        style: FlutterFlowTheme.of(context)
                            .labelMedium
                            .override(
                              font: GoogleFonts.lexend(
                                fontWeight:
                                    FlutterFlowTheme.of(context).labelMedium.fontWeight,
                                fontStyle:
                                    FlutterFlowTheme.of(context).labelMedium.fontStyle,
                              ),
                            ),
                      ),
                      SizedBox(height: 16.0),
                      TabBar(
                        controller: _model.tabController,
                        labelColor: FlutterFlowTheme.of(context).primaryText,
                        unselectedLabelColor: FlutterFlowTheme.of(context).secondaryText,
                        labelStyle: FlutterFlowTheme.of(context).titleMedium.override(
                              font: GoogleFonts.lexend(
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                        unselectedLabelStyle: TextStyle(),
                        indicatorColor: FlutterFlowTheme.of(context).primary,
                        indicatorWeight: 2.0,
                        overlayColor: MaterialStateProperty.all(Colors.transparent),
                        tabs: [
                          Tab(
                            text: 'Unidade/Medida',
                          ),
                          Tab(
                            text: 'Disciplinas',
                          ),
                        ],
                      ),
                      Expanded(
                        child: FutureBuilder<ApiCallResponse>(
                          future: AuthenticationGroup
                              .getTheRecordBelongingToTheAuthenticationTokenCall
                              .call(
                            bearerAuth: FFAppState().token,
                          ),
                          builder: (context, snapshot) {
                            if (!snapshot.hasData) {
                              return Center(
                                child: SizedBox(
                                  width: 50.0,
                                  height: 50.0,
                                  child: CircularProgressIndicator(
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      FlutterFlowTheme.of(context).primary,
                                    ),
                                  ),
                                ),
                              );
                            }
                            final userResponse = snapshot.data!;
                            if (!userResponse.succeeded) {
                              return Text('Erro ao carregar usuário');
                            }
                            final companyId = AuthenticationGroup
                                .getTheRecordBelongingToTheAuthenticationTokenCall
                                .companyID(userResponse.jsonBody) ?? 0;

                            return FutureBuilder<List<ApiCallResponse>>(
                              future: Future.wait([
                                TasksGroup.getUnityCall.call(
                                    token: FFAppState().token,
                                    companyId: companyId),
                                DisciplineGroup.disciplineCall.call(
                                    token: FFAppState().token,
                                    companyId: companyId),
                              ]),
                              builder: (context, dataSnapshot) {
                                if (!dataSnapshot.hasData) {
                                  return Center(
                                    child: SizedBox(
                                      width: 50.0,
                                      height: 50.0,
                                      child: CircularProgressIndicator(
                                        valueColor:
                                            AlwaysStoppedAnimation<Color>(
                                          FlutterFlowTheme.of(context).primary,
                                        ),
                                      ),
                                    ),
                                  );
                                }
                                final unityResponse = dataSnapshot.data![0];
                                final disciplineResponse = dataSnapshot.data![1];

                                final unityList = TasksGroup.getUnityCall
                                        .items(unityResponse.jsonBody) ??
                                    [];
                                final disciplineList =
                                    DisciplineGroup.disciplineCall.items(
                                            disciplineResponse.jsonBody) ??
                                        [];

                                return TabBarView(
                                  controller: _model.tabController,
                                  children: [
                                    // Units Tab
                                    _buildItemsList(
                                      context: context,
                                      items: unityList,
                                      isUnit: true,
                                      companyId: companyId,
                                    ),
                                    // Disciplines Tab
                                    _buildItemsList(
                                      context: context,
                                      items: disciplineList,
                                      isUnit: false,
                                      companyId: companyId,
                                    ),
                                  ],
                                );
                              },
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildItemsList({
    required BuildContext context,
    required List items,
    required bool isUnit,
    required int companyId,
  }) {
    return Column(
      children: [
        Padding(
          padding: EdgeInsets.all(16.0),
          child: Row(
            children: [
              Container(
                width: 600.0,
                child: TextFormField(
                  autofocus: false,
                  obscureText: false,
                  decoration: InputDecoration(
                    labelText: isUnit 
                        ? 'Procurar por nome da unidade/medida' 
                        : 'Procurar por nome da disciplina',
                    labelStyle: FlutterFlowTheme.of(context).labelSmall.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                            fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                          ),
                          letterSpacing: 0.0,
                          fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                          fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                        ),
                    hintStyle: FlutterFlowTheme.of(context).labelSmall.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                            fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                          ),
                          letterSpacing: 0.0,
                          fontWeight: FlutterFlowTheme.of(context).labelSmall.fontWeight,
                          fontStyle: FlutterFlowTheme.of(context).labelSmall.fontStyle,
                        ),
                    enabledBorder: OutlineInputBorder(
                      borderSide: BorderSide(
                        color: FlutterFlowTheme.of(context).alternate,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderSide: BorderSide(
                        color: FlutterFlowTheme.of(context).primary,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderSide: BorderSide(
                        color: FlutterFlowTheme.of(context).error,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    focusedErrorBorder: OutlineInputBorder(
                      borderSide: BorderSide(
                        color: FlutterFlowTheme.of(context).error,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    filled: true,
                    fillColor: FlutterFlowTheme.of(context).primaryBackground,
                    contentPadding: EdgeInsetsDirectional.fromSTEB(20.0, 0.0, 0.0, 0.0),
                    prefixIcon: Icon(
                      Icons.search_sharp,
                    ),
                  ),
                  style: FlutterFlowTheme.of(context).bodySmall.override(
                        font: GoogleFonts.lexend(
                          fontWeight: FontWeight.w500,
                          fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                        ),
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w500,
                        fontStyle: FlutterFlowTheme.of(context).bodySmall.fontStyle,
                      ),
                  cursorColor: FlutterFlowTheme.of(context).primary,
                ),
              ),
              SizedBox(width: 12.0),
              Align(
                alignment: AlignmentDirectional(1.0, -1.0),
                child: FFButtonWidget(
                  onPressed: () async {
                    final result = await showDialog(
                      context: context,
                      builder: (dialogContext) {
                        return isUnit
                            ? ModalAddUnityWidget()
                            : ModalAddDisciplineWidget();
                      },
                    );
                    if (result != null) {
                      safeSetState(() {});
                    }
                  },
                  text: isUnit ? 'Criar unidade/medida' : 'Criar disciplina',
                  options: FFButtonOptions(
                    width: 200.0,
                    height: 40.0,
                    padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                    iconPadding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                    color: FlutterFlowTheme.of(context).primary,
                    textStyle: FlutterFlowTheme.of(context).labelMedium.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FlutterFlowTheme.of(context).labelMedium.fontWeight,
                            fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                          ),
                          color: FlutterFlowTheme.of(context).info,
                          letterSpacing: 0.0,
                          fontWeight: FlutterFlowTheme.of(context).labelMedium.fontWeight,
                          fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                        ),
                    elevation: 0.0,
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: items.isEmpty
              ? Center(
                  child: Text(
                    'Nenhum item encontrado.',
                    style: FlutterFlowTheme.of(context).bodyMedium,
                  ),
                )
              : ListView.separated(
                  padding: EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 16.0),
                  shrinkWrap: true,
                  scrollDirection: Axis.vertical,
                  itemCount: items.length,
                  separatorBuilder: (_, __) => SizedBox(height: 12.0),
                  itemBuilder: (context, index) {
                    final item = items[index];
                    final description = isUnit
                        ? item['unity']?.toString() ?? '-'
                        : item['discipline']?.toString() ?? '-';
                    final id = item['id'];

                    return Container(
                      decoration: BoxDecoration(
                        color: FlutterFlowTheme.of(context).secondaryBackground,
                        boxShadow: [
                          BoxShadow(
                            blurRadius: 0.0,
                            color: Color(0x33000000),
                            offset: Offset(0.0, 1.0),
                          )
                        ],
                        borderRadius: BorderRadius.circular(12.0),
                        border: Border.all(
                          color: FlutterFlowTheme.of(context).alternate,
                          width: 1.0,
                        ),
                      ),
                      child: Padding(
                        padding: EdgeInsets.all(12.0),
                        child: Row(
                          mainAxisSize: MainAxisSize.max,
                          children: [
                            Container(
                              width: 40.0,
                              height: 40.0,
                              decoration: BoxDecoration(
                                color: FlutterFlowTheme.of(context).accent1,
                                borderRadius: BorderRadius.circular(8.0),
                                border: Border.all(
                                  color: FlutterFlowTheme.of(context).primary,
                                  width: 1.0,
                                ),
                              ),
                              child: Icon(
                                isUnit
                                    ? Icons.straighten_rounded
                                    : Icons.school_rounded,
                                color: FlutterFlowTheme.of(context).primary,
                                size: 24.0,
                              ),
                            ),
                            Expanded(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    description,
                                    style: FlutterFlowTheme.of(context)
                                        .bodyLarge
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                  ),
                                  Text(
                                    isUnit ? 'Unidade' : 'Disciplina',
                                    style: FlutterFlowTheme.of(context).labelMedium,
                                  ),
                                ],
                              ),
                            ),
                            Builder(
                              builder: (context) => InkWell(
                                splashColor: Colors.transparent,
                                focusColor: Colors.transparent,
                                hoverColor: Colors.transparent,
                                highlightColor: Colors.transparent,
                                onTap: () async {
                                  await showAlignedDialog(
                                    context: context,
                                    isGlobal: false,
                                    avoidOverflow: true,
                                    barrierColor: Colors.transparent,
                                    targetAnchor: AlignmentDirectional(0.0, 0.0)
                                        .resolve(Directionality.of(context)),
                                    followerAnchor: AlignmentDirectional(1.0, -1.0)
                                        .resolve(Directionality.of(context)),
                                    builder: (dialogContext) {
                                      return Material(
                                        color: Colors.transparent,
                                        child: Container(
                                          width: 150.0,
                                          height: 100.0,
                                          decoration: BoxDecoration(
                                            color: FlutterFlowTheme.of(context)
                                                .secondaryBackground,
                                            boxShadow: [
                                              BoxShadow(
                                                blurRadius: 4.0,
                                                color: Color(0x33000000),
                                                offset: Offset(0.0, 2.0),
                                              )
                                            ],
                                            borderRadius: BorderRadius.circular(12.0),
                                          ),
                                          child: Padding(
                                            padding: EdgeInsets.all(8.0),
                                            child: Column(
                                              mainAxisSize: MainAxisSize.max,
                                              children: [
                                                InkWell(
                                                  splashColor: Colors.transparent,
                                                  focusColor: Colors.transparent,
                                                  hoverColor: Colors.transparent,
                                                  highlightColor: Colors.transparent,
                                                  onTap: () async {
                                                    Navigator.pop(dialogContext);
                                                    await showDialog(
                                                      context: context,
                                                      builder: (dialogContext) {
                                                        return Dialog(
                                                          elevation: 0,
                                                          insetPadding: EdgeInsets.zero,
                                                          backgroundColor:
                                                              Colors.transparent,
                                                          alignment: Alignment.center,
                                                          child: ModalConfiguracaoWidget(
                                                            currentValue: description,
                                                            id: id,
                                                            type: isUnit
                                                                ? 'Unidade'
                                                                : 'Disciplina',
                                                            companyId: companyId,
                                                            refresh: () async {
                                                              safeSetState(() {});
                                                            },
                                                          ),
                                                        );
                                                      },
                                                    ).then((value) => safeSetState(() {}));
                                                  },
                                                  child: Container(
                                                    width: double.infinity,
                                                    height: 40.0,
                                                    child: Row(
                                                      children: [
                                                        Icon(
                                                          Icons.edit_rounded,
                                                          color: FlutterFlowTheme.of(context)
                                                              .primaryText,
                                                          size: 16.0,
                                                        ),
                                                        Text(
                                                          'Editar',
                                                          style: FlutterFlowTheme.of(context)
                                                              .bodyMedium,
                                                        ),
                                                      ].divide(SizedBox(width: 8.0)),
                                                    ),
                                                  ),
                                                ),
                                                InkWell(
                                                  splashColor: Colors.transparent,
                                                  focusColor: Colors.transparent,
                                                  hoverColor: Colors.transparent,
                                                  highlightColor: Colors.transparent,
                                                  onTap: () async {
                                                    Navigator.pop(dialogContext);
                                                    await showModalBottomSheet(
                                                      isScrollControlled: true,
                                                      backgroundColor: Colors.transparent,
                                                      enableDrag: false,
                                                      context: context,
                                                      builder: (context) {
                                                        return Padding(
                                                          padding:
                                                              MediaQuery.viewInsetsOf(context),
                                                          child: ModalConfirmDeleteWidget(
                                                            title: isUnit
                                                                ? 'Deletar Unidade'
                                                                : 'Deletar Disciplina',
                                                            description:
                                                                'Tem certeza que deseja deletar este item?',
                                                            actionAPi: () async {
                                                              if (isUnit) {
                                                                await TasksGroup.deleteUnityCall
                                                                    .call(
                                                                  token: FFAppState().token,
                                                                  unityId: id,
                                                                );
                                                              } else {
                                                                await DisciplineGroup
                                                                    .deleteDisciplineCall
                                                                    .call(
                                                                  token: FFAppState().token,
                                                                  disciplineId: id,
                                                                );
                                                              }
                                                            },
                                                            actionPage: () async {
                                                              Navigator.pop(context);
                                                              safeSetState(() {});
                                                            },
                                                          ),
                                                        );
                                                      },
                                                    ).then((value) => safeSetState(() {}));
                                                  },
                                                  child: Container(
                                                    width: double.infinity,
                                                    height: 40.0,
                                                    child: Row(
                                                      children: [
                                                        Icon(
                                                          Icons.delete_rounded,
                                                          color: FlutterFlowTheme.of(context).error,
                                                          size: 16.0,
                                                        ),
                                                        Text(
                                                          'Deletar',
                                                          style: FlutterFlowTheme.of(context)
                                                              .bodyMedium
                                                              .override(
                                                                font: GoogleFonts.lexend(
                                                                  color: FlutterFlowTheme.of(context)
                                                                      .error,
                                                                ),
                                                              ),
                                                        ),
                                                      ].divide(SizedBox(width: 8.0)),
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      );
                                    },
                                  );
                                },
                                child: Icon(
                                  Icons.more_vert_rounded,
                                  color: FlutterFlowTheme.of(context).secondaryText,
                                  size: 24.0,
                                ),
                              ),
                            ),
                          ].divide(SizedBox(width: 12.0)),
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
