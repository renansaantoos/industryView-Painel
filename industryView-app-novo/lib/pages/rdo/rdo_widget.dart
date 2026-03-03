import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/confirmdialog_r_d_o_widget.dart';
import '/components/empty_widget.dart';
import '/components/loading_copy_widget.dart';
import '/components/modal_info_widget.dart';
import '/components/modal_sprints_filtro_widget.dart';
import '/components/nav_bar_widget.dart';
import '/components/offline_banner_widget.dart';
import '/components/rdo_empty_state_widget.dart';
import '/database/daos/rdo_finalization_dao.dart';
import '/services/network_service.dart';
import '/services/rdo_prefetch_service.dart';
import '/core/widgets/app_tab_bar.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/core/utils/custom_functions.dart' as functions;
import '/index.dart';
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:provider/provider.dart';
import 'rdo_model.dart';
export 'rdo_model.dart';

class RdoWidget extends StatefulWidget {
  const RdoWidget({super.key});

  static String routeName = 'RDO';
  static String routePath = '/rdo';

  @override
  State<RdoWidget> createState() => _RdoWidgetState();
}

class _RdoWidgetState extends State<RdoWidget> with TickerProviderStateMixin {
  late RdoModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();
  StreamSubscription<bool>? _connectionSubscription;
  int _lastConnectionRestoredTrigger = 0;

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => RdoModel());
    _lastConnectionRestoredTrigger = AppState().connectionRestoredTrigger;

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      // Verificar se já foi finalizado hoje
      final rdoFinalizationDao = RdoFinalizationDao();
      _model.isFinalizedToday = await rdoFinalizationDao.wasFinalizedToday();
      safeSetState(() {});
      
      _model.validTokenCopy = await AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall
          .call(
        bearerAuth: currentAuthenticationToken,
      );

      if ((_model.validTokenCopy?.succeeded ?? true)) {
        final isFirstLogin = AuthenticationGroup
                .getTheRecordBelongingToTheAuthenticationTokenCall
                .firstLogin(
              (_model.validTokenCopy?.jsonBody ?? ''),
            ) ==
            true;
        final hasSchedule = AppState().user.sheduleId > 0;

        if (isFirstLogin && !hasSchedule) {
          AppState().loading = false;
          safeSetState(() {});

          context.goNamedAuth(
            PageCheckQrcodeWidget.routeName,
            context.mounted,
            extra: <String, dynamic>{
              kTransitionInfoKey: TransitionInfo(
                hasTransition: true,
                transitionType: PageTransitionType.fade,
                duration: Duration(milliseconds: 250),
              ),
              'skipProjectCheck': true,
            },
          );

          return;
        }
      } else {
        AppState().loading = false;
        safeSetState(() {});
        return;
      }
    });

    // Verificar status da conexão para definir o índice inicial da tabBar
    final isConnected = NetworkService.instance.isConnected;
    final initialTabIndex = isConnected ? 0 : 1;
    
    _model.tabBarController = TabController(
      vsync: this,
      length: 2,
      initialIndex: initialTabIndex,
    )..addListener(() => safeSetState(() {}));

    // Listener para mudanças de conexão - mover automaticamente para index 1 quando ficar offline
    _connectionSubscription = NetworkService.instance.listenConnection(
      (isConnected) {
        safeSetState(() {}); // Rebuild imediato para esconder/mostrar filtro e container quando offline/online
        if (!isConnected && _model.tabBarController?.index == 0) {
          // Se ficou offline e está no index 0, mover para index 1
          _model.tabBarController?.animateTo(1);
        }
      },
    );

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  /// Verifica se a resposta da API contém dados da RDO
  bool _hasRdoData(ApiCallResponse response) {
    try {
      final jsonBody = response.jsonBody;
      if (jsonBody == null) return false;

      // Verificar categorias diretas do Painel
      final emAndamento = getJsonField(jsonBody, r'''$.sprints_tasks_em_andamento.items''', true) as List?;
      final concluidas = getJsonField(jsonBody, r'''$.sprints_tasks_concluidas.items''', true) as List?;
      final semSucesso = getJsonField(jsonBody, r'''$.sprints_tasks_sem_sucesso.items''', true) as List?;
      final inspecao = getJsonField(jsonBody, r'''$.sprints_tasks_inspecao.items''', true) as List?;
      final pendentes = getJsonField(jsonBody, r'''$.sprints_tasks_pendentes.items''', true) as List?;

      if ((emAndamento?.isNotEmpty ?? false) ||
          (concluidas?.isNotEmpty ?? false) ||
          (semSucesso?.isNotEmpty ?? false) ||
          (inspecao?.isNotEmpty ?? false) ||
          (pendentes?.isNotEmpty ?? false)) {
        return true;
      }

      return false;
    } catch (e) {
      if (kDebugMode) {
        print('RdoWidget: Erro ao verificar dados da RDO: $e');
      }
      return false;
    }
  }

  @override
  void dispose() {
    _connectionSubscription?.cancel();
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<AppState>();
    final t = AppState().connectionRestoredTrigger;
    if (t != _lastConnectionRestoredTrigger) {
      _lastConnectionRestoredTrigger = t;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _model.clearTasksSprintsCache();
          _model.clearRdoDiaCache();
          safeSetState(() {});
        }
      });
    }

    return FutureBuilder<ApiCallResponse>(
      future: _model
          .tasksSprints(
        requestFn: () => SprintsGroup.queryAllSprintsTasksRecordCall.call(
          projectsId: AppState().user.projectId,
          teamsId: AppState().user.teamsId,
          token: currentAuthenticationToken,
          page: _model.page,
          perPage: _model.perPage,
          search: '',
          sprintsId: AppState().user.sprint.id,
          equipamentsTypesId: 0,
        ),
      )
          .then((result) {
        _model.apiRequestCompleted1 = true;
        return result;
      }),
      builder: (context, snapshot) {
        // Customize what your widget looks like when it's loading.
        if (!snapshot.hasData) {
          return Scaffold(
            backgroundColor: AppTheme.of(context).secondaryBackground,
            body: LoadingCopyWidget(),
          );
        }
        final rdoQueryAllSprintsTasksRecordResponse = snapshot.data!;

        // Verificar se há dados locais e se está offline
        // Se offline e sem dados, mostrar empty state específico
        final isOffline = !NetworkService.instance.isConnected;
        final hasData = _hasRdoData(rdoQueryAllSprintsTasksRecordResponse);
        
        if (kDebugMode) {
          print('RdoWidget: isOffline=$isOffline, hasData=$hasData');
        }
        
        if (isOffline && !hasData) {
          if (kDebugMode) {
            print('RdoWidget: Offline e sem dados - verificando dados locais...');
          }
          // Verificar se realmente não há dados locais
          return FutureBuilder<bool>(
            future: RdoPrefetchService.instance.hasLocalRdoData(),
            builder: (context, localDataSnapshot) {
              // Enquanto verifica, mostrar loading
              if (!localDataSnapshot.hasData) {
                return Scaffold(
                  backgroundColor: AppTheme.of(context).secondaryBackground,
                  body: LoadingCopyWidget(),
                );
              }
              
              if (!localDataSnapshot.data!) {
                if (kDebugMode) {
                  print('RdoWidget: Sem dados locais - mostrando empty state');
                }
                // Não há dados locais e está offline - mostrar empty state
                return Scaffold(
                  backgroundColor: AppTheme.of(context).secondaryBackground,
                  appBar: AppBar(
                    backgroundColor: AppTheme.of(context).secondaryBackground,
                    automaticallyImplyLeading: false,
                    toolbarHeight: 0.0,
                    actions: [],
                    centerTitle: false,
                    elevation: 0.0,
                  ),
                  body: SafeArea(
                    top: true,
                    child: Stack(
                      children: [
                        Align(
                          alignment: AlignmentDirectional(0.0, 1.0),
                          child: wrapWithModel(
                            model: _model.navBarModel,
                            updateCallback: () => safeSetState(() {}),
                            child: NavBarWidget(
                              page: 2,
                            ),
                          ),
                        ),
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(24.0, 0.0, 24.0, 72.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              const SizedBox(height: 24.0),
                              const OfflineBannerWidget(
                                margin: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 12.0),
                              ),
                              Align(
                                alignment: AlignmentDirectional(-1.0, -1.0),
                                child: Padding(
                                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 16.0),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        Icons.article_outlined,
                                        color: AppTheme.of(context).primary,
                                        size: 22.0,
                                      ),
                                      Text(
                                        AppLocalizations.of(context).getText(
                                          '3pwm6t3f' /* Relatório diário de obras */,
                                        ),
                                        style: AppTheme.of(context).titleLarge.override(
                                          font: GoogleFonts.lexend(
                                            fontWeight: AppTheme.of(context).titleLarge.fontWeight,
                                            fontStyle: AppTheme.of(context).titleLarge.fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight: AppTheme.of(context).titleLarge.fontWeight,
                                          fontStyle: AppTheme.of(context).titleLarge.fontStyle,
                                        ),
                                      ),
                                    ].divide(const SizedBox(width: 8.0)),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: RdoEmptyStateWidget(
                                  onRetry: () {
                                    safeSetState(() {
                                      _model.clearTasksSprintsCache();
                                      _model.apiRequestCompleted1 = false;
                                    });
                                  },
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }
              
              // Se há dados locais, continuar com renderização normal
              // (pode ser que o OfflineApiWrapper esteja retornando dados vazios mas há dados no banco)
              if (kDebugMode) {
                print('RdoWidget: Há dados locais - continuando renderização normal');
              }
              
              // Se há dados locais, renderizar normalmente (mesmo que a resposta da API esteja vazia)
              // Isso permite que o OfflineApiWrapper busque os dados do SQLite
              // Retornar null fará com que o código continue para a renderização normal abaixo
              // Mas como estamos em um FutureBuilder, precisamos retornar um Widget
              // Vamos retornar a renderização normal completa aqui também
              return _buildNormalRdoContent(context, rdoQueryAllSprintsTasksRecordResponse);
            },
          );
        }
        
        if (kDebugMode && hasData) {
          print('RdoWidget: Carregando dados da RDO (${isOffline ? "offline" : "online"})');
        }

        return _buildNormalRdoContent(context, rdoQueryAllSprintsTasksRecordResponse);
      },
    );
  }

  /// Método auxiliar para construir o conteúdo normal da RDO
  Widget _buildNormalRdoContent(BuildContext context, ApiCallResponse rdoQueryAllSprintsTasksRecordResponse) {
    return GestureDetector(
          onTap: () {
            FocusScope.of(context).unfocus();
            FocusManager.instance.primaryFocus?.unfocus();
          },
          child: Scaffold(
            key: scaffoldKey,
            backgroundColor: AppTheme.of(context).secondaryBackground,
            appBar: AppBar(
              backgroundColor: AppTheme.of(context).secondaryBackground,
              automaticallyImplyLeading: false,
              toolbarHeight: 0.0,
              actions: [],
              centerTitle: false,
              elevation: 0.0,
            ),
            body: SafeArea(
              top: true,
              child: Stack(
                children: [
                  Align(
                    alignment: AlignmentDirectional(0.0, 1.0),
                    child: wrapWithModel(
                      model: _model.navBarModel,
                      updateCallback: () => safeSetState(() {}),
                      child: NavBarWidget(
                        page: 2,
                      ),
                    ),
                  ),
                  Padding(
                    padding:
                        EdgeInsetsDirectional.fromSTEB(24.0, 0.0, 24.0, 72.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        const SizedBox(height: 24.0),
                        const OfflineBannerWidget(
                          margin: EdgeInsetsDirectional.fromSTEB(
                              0.0, 0.0, 0.0, 12.0),
                        ),
                        Align(
                          alignment: AlignmentDirectional(-1.0, -1.0),
                          child: Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                0.0, 0.0, 0.0, 16.0),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.article_outlined,
                                  color: AppTheme.of(context).primary,
                                  size: 22.0,
                                ),
                                Text(
                                  AppLocalizations.of(context).getText(
                                    '3pwm6t3f' /* Relatório diário de obras */,
                                  ),
                                  style: AppTheme.of(context)
                                      .titleLarge
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight: AppTheme.of(context)
                                              .titleLarge
                                              .fontWeight,
                                          fontStyle: AppTheme.of(context)
                                              .titleLarge
                                              .fontStyle,
                                        ),
                                        letterSpacing: 0.0,
                                        fontWeight: AppTheme.of(context)
                                            .titleLarge
                                            .fontWeight,
                                        fontStyle: AppTheme.of(context)
                                            .titleLarge
                                            .fontStyle,
                                      ),
                                ),
                              ].divide(const SizedBox(width: 8.0)),
                            ),
                          ),
                        ),
                        Expanded(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Column(
                                      mainAxisSize: MainAxisSize.max,
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        if (NetworkService.instance.isConnected)
                                        Padding(
                                          padding: EdgeInsetsDirectional.fromSTEB(
                                              0.0, 0.0, 0.0, 16.0),
                                          child: SingleChildScrollView(
                                        scrollDirection: Axis.horizontal,
                                        child: Row(
                                          mainAxisSize: MainAxisSize.max,
                                          children: [
                                            InkWell(
                                              splashColor: Colors.transparent,
                                              focusColor: Colors.transparent,
                                              hoverColor: Colors.transparent,
                                              highlightColor:
                                                  Colors.transparent,
                                              onTap: () async {
                                                AppState().filterSprint01 =
                                                    FiltersStruct();
                                                AppState().filterSprint =
                                                    false;
                                                AppState().datesPicked = [];
                                                AppState().sprints =
                                                    SprintsStruct();
                                                safeSetState(() {});
                                                safeSetState(() {
                                                  _model
                                                      .clearTasksSprintsCache();
                                                  _model.apiRequestCompleted1 =
                                                      false;
                                                });
                                                await _model
                                                    .waitForApiRequestCompleted1();
                                                safeSetState(() {
                                                  _model.clearRdoDiaCache();
                                                  _model.apiRequestCompleted2 =
                                                      false;
                                                });
                                                await _model
                                                    .waitForApiRequestCompleted2();
                                              },
                                              child: Container(
                                                height: 44.0,
                                                decoration: BoxDecoration(
                                                  color:
                                                      AppState()
                                                                  .filterSprint01
                                                                  .id !=
                                                              0
                                                          ? AppTheme.of(
                                                                  context)
                                                              .alternate
                                                          : AppTheme.of(
                                                                  context)
                                                              .status03,
                                                  borderRadius:
                                                      BorderRadius.circular(
                                                          12.0),
                                                  border: Border.all(
                                                    color: AppState()
                                                                .filterSprint01
                                                                .id !=
                                                            0
                                                        ? AppTheme.of(
                                                                context)
                                                            .secondaryText
                                                        : AppTheme.of(
                                                                context)
                                                            .primary,
                                                  ),
                                                ),
                                                child: Padding(
                                                  padding: EdgeInsetsDirectional
                                                      .fromSTEB(
                                                          12.0, 0.0, 12.0, 0.0),
                                                  child: Row(
                                                    mainAxisSize:
                                                        MainAxisSize.min,
                                                    mainAxisAlignment:
                                                        MainAxisAlignment
                                                            .center,
                                                    children: [
                                                      Text(
                                                        AppLocalizations.of(
                                                                context)
                                                            .getText(
                                                          'tc25ehns' /* Sprint atual */,
                                                        ),
                                                        style:
                                                            AppTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .override(
                                                                  font: GoogleFonts
                                                                      .lexend(
                                                                    fontWeight: AppTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .fontWeight,
                                                                    fontStyle: AppTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .fontStyle,
                                                                  ),
                                                                  color: AppState()
                                                                              .filterSprint01
                                                                              .id !=
                                                                          0
                                                                      ? AppTheme.of(
                                                                              context)
                                                                          .secondaryText
                                                                      : AppTheme.of(
                                                                              context)
                                                                          .primary,
                                                                  letterSpacing:
                                                                      0.0,
                                                                  fontWeight: AppTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontWeight,
                                                                  fontStyle: AppTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontStyle,
                                                                ),
                                                      ),
                                                    ].divide(
                                                        SizedBox(width: 8.0)),
                                                  ),
                                                ),
                                              ),
                                            ),
                                            Builder(
                                              builder: (context) {
                                                final isOnline = NetworkService.instance.isConnected;
                                                return Opacity(
                                                  opacity: isOnline ? 1.0 : 0.5,
                                                  child: InkWell(
                                                    splashColor: Colors.transparent,
                                                    focusColor: Colors.transparent,
                                                    hoverColor: Colors.transparent,
                                                    highlightColor:
                                                        Colors.transparent,
                                                    onTap: isOnline ? () async {
                                                      await showDialog(
                                                        context: context,
                                                        builder: (dialogContext) {
                                                          return Dialog(
                                                            elevation: 0,
                                                            insetPadding:
                                                                EdgeInsets.zero,
                                                            backgroundColor:
                                                                Colors.transparent,
                                                            alignment:
                                                                AlignmentDirectional(
                                                                        0.0, 0.0)
                                                                    .resolve(
                                                                        Directionality.of(
                                                                            context)),
                                                            child: GestureDetector(
                                                              onTap: () {
                                                                FocusScope.of(
                                                                        dialogContext)
                                                                    .unfocus();
                                                                FocusManager
                                                                    .instance
                                                                    .primaryFocus
                                                                    ?.unfocus();
                                                              },
                                                              child:
                                                                  ModalSprintsFiltroWidget(
                                                                action1:
                                                                    () async {},
                                                              ),
                                                            ),
                                                          );
                                                        },
                                                      );
                                                    } : () async {
                                                      await showDialog(
                                                        context: context,
                                                        builder: (dialogContext) {
                                                          return Dialog(
                                                            elevation: 0,
                                                            insetPadding: EdgeInsets.zero,
                                                            backgroundColor: Colors.transparent,
                                                            alignment: AlignmentDirectional(0.0, 0.0)
                                                                .resolve(Directionality.of(context)),
                                                            child: GestureDetector(
                                                              onTap: () {
                                                                FocusScope.of(dialogContext).unfocus();
                                                                FocusManager.instance.primaryFocus?.unfocus();
                                                              },
                                                              child: ModalInfoWidget(
                                                                title: AppLocalizations.of(context).getVariableText(
                                                                  ptText: 'Aviso',
                                                                  esText: 'Aviso',
                                                                  enText: 'Notice',
                                                                ),
                                                                description: AppLocalizations.of(context).getVariableText(
                                                                  ptText: 'O filtro por data só está disponível com conexão à internet.',
                                                                  esText: 'El filtro por fecha solo está disponible con conexión a internet.',
                                                                  enText: 'Date filter is only available with internet connection.',
                                                                ),
                                                              ),
                                                            ),
                                                          );
                                                        },
                                                      );
                                                    },
                                                    child: Container(
                                                      height: 44.0,
                                                      decoration: BoxDecoration(
                                                        color: AppTheme.of(
                                                                context)
                                                            .primaryBackground,
                                                        borderRadius:
                                                            BorderRadius.circular(
                                                                14.0),
                                                        border: Border.all(
                                                          color:
                                                              AppTheme.of(
                                                                      context)
                                                                  .alternate,
                                                        ),
                                                      ),
                                                      child: Padding(
                                                        padding:
                                                            EdgeInsetsDirectional
                                                                .fromSTEB(12.0, 0.0,
                                                                    12.0, 0.0),
                                                        child: Row(
                                                          mainAxisSize:
                                                              MainAxisSize.min,
                                                          children: [
                                                            Text(
                                                              AppState()
                                                                          .filterSprint01
                                                                          .id !=
                                                                      0
                                                                  ? AppState()
                                                                      .filterSprint01
                                                                      .name
                                                                  : AppLocalizations
                                                                          .of(context)
                                                                      .getVariableText(
                                                                      ptText:
                                                                          'Filtrar por data',
                                                                      esText:
                                                                          'Filtrar por fecha',
                                                                      enText:
                                                                          'Filter by date',
                                                                    ),
                                                              style: AppTheme
                                                                      .of(context)
                                                                  .labelSmall
                                                                  .override(
                                                                    font:
                                                                        GoogleFonts
                                                                            .lexend(
                                                                      fontWeight: AppTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .fontWeight,
                                                                      fontStyle: AppTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .fontStyle,
                                                                    ),
                                                                    color: AppTheme.of(
                                                                            context)
                                                                        .secondaryText,
                                                                    letterSpacing:
                                                                        0.0,
                                                                    fontWeight: AppTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .fontWeight,
                                                                    fontStyle: AppTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .fontStyle,
                                                                  ),
                                                            ),
                                                            Icon(
                                                              Icons
                                                                  .keyboard_arrow_down_rounded,
                                                              color: AppTheme
                                                                      .of(context)
                                                                  .secondaryText,
                                                              size: 18.0,
                                                            ),
                                                          ].divide(
                                                              SizedBox(width: 8.0)),
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                );
                                              },
                                            ),
                                          ].divide(SizedBox(width: 12.0)),
                                        ),
                                      ),
                                    ),
                                    if (NetworkService.instance.isConnected)
                                    Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          0.0, 0.0, 0.0, 16.0),
                                      child: Container(
                                        decoration: BoxDecoration(
                                          color: AppTheme.of(context)
                                              .secondaryBackground,
                                          borderRadius:
                                              BorderRadius.circular(14.0),
                                          border: Border.all(
                                            color: AppTheme.of(context)
                                                .alternate,
                                          ),
                                        ),
                                        child: Padding(
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  12.0, 8.0, 12.0, 8.0),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.max,
                                            children: [
                                              if (AppState().sprints.id == 0)
                                                CircularPercentIndicator(
                                                  percent:
                                                      valueOrDefault<double>(
                                                    SprintsGroup
                                                        .queryAllSprintsTasksRecordCall
                                                        .nOprogress(
                                                      rdoQueryAllSprintsTasksRecordResponse
                                                          .jsonBody,
                                                    ),
                                                    0.0,
                                                  ),
                                                  radius: 22.5,
                                                  lineWidth: 2.0,
                                                  animation: true,
                                                  animateFromLastPercent: true,
                                                  progressColor:
                                                      AppTheme.of(
                                                              context)
                                                          .primary,
                                                  backgroundColor:
                                                      AppTheme.of(
                                                              context)
                                                          .alternate,
                                                  center: Text(
                                                    valueOrDefault<String>(
                                                      '${(valueOrDefault<double>(
                                                            SprintsGroup
                                                                .queryAllSprintsTasksRecordCall
                                                                .nOprogress(
                                                              rdoQueryAllSprintsTasksRecordResponse
                                                                  .jsonBody,
                                                            ),
                                                            0.0,
                                                          ) * 100).toStringAsFixed(1)}%',
                                                      '0',
                                                    ),
                                                    style: AppTheme.of(
                                                            context)
                                                        .labelSmall
                                                        .override(
                                                          font: GoogleFonts
                                                              .lexend(
                                                            fontWeight:
                                                                AppTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontWeight,
                                                            fontStyle:
                                                                AppTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontStyle,
                                                          ),
                                                          letterSpacing: 0.0,
                                                          fontWeight:
                                                              AppTheme.of(
                                                                      context)
                                                                  .labelSmall
                                                                  .fontWeight,
                                                          fontStyle:
                                                              AppTheme.of(
                                                                      context)
                                                                  .labelSmall
                                                                  .fontStyle,
                                                        ),
                                                  ),
                                                ),
                                              if (AppState().sprints.id != 0)
                                                CircularPercentIndicator(
                                                  percent: AppState()
                                                      .sprints
                                                      .progressPercentage,
                                                  radius: 22.5,
                                                  lineWidth: 2.0,
                                                  animation: true,
                                                  animateFromLastPercent: true,
                                                  progressColor:
                                                      AppTheme.of(
                                                              context)
                                                          .primary,
                                                  backgroundColor:
                                                      AppTheme.of(
                                                              context)
                                                          .alternate,
                                                  center: Text(
                                                    valueOrDefault<String>(
                                                      (double var1) {
                                                        return '${(var1 * 100).toStringAsFixed(1)}%';
                                                      }(AppState()
                                                          .sprints
                                                          .progressPercentage),
                                                      '0',
                                                    ),
                                                    style: AppTheme.of(
                                                            context)
                                                        .labelSmall
                                                        .override(
                                                          font: GoogleFonts
                                                              .lexend(
                                                            fontWeight:
                                                                AppTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontWeight,
                                                            fontStyle:
                                                                AppTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontStyle,
                                                          ),
                                                          letterSpacing: 0.0,
                                                          fontWeight:
                                                              AppTheme.of(
                                                                      context)
                                                                  .labelSmall
                                                                  .fontWeight,
                                                          fontStyle:
                                                              AppTheme.of(
                                                                      context)
                                                                  .labelSmall
                                                                  .fontStyle,
                                                        ),
                                                  ),
                                                ),
                                              Column(
                                                mainAxisSize: MainAxisSize.max,
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Row(
                                                    mainAxisSize:
                                                        MainAxisSize.max,
                                                    children: [
                                                      Align(
                                                        alignment:
                                                            AlignmentDirectional(
                                                                -1.0, 1.0),
                                                        child: Text(
                                                          AppState()
                                                                      .sprints
                                                                      .id !=
                                                                  0
                                                              ? valueOrDefault<
                                                                  String>(
                                                                  AppState()
                                                                      .sprints
                                                                      .title,
                                                                  'app state',
                                                                )
                                                              : valueOrDefault<
                                                                  String>(
                                                                  SprintsGroup
                                                                      .queryAllSprintsTasksRecordCall
                                                                      .nOtitle(
                                                                    rdoQueryAllSprintsTasksRecordResponse
                                                                        .jsonBody,
                                                                  ),
                                                                  '-',
                                                                ),
                                                          style: AppTheme
                                                                  .of(context)
                                                              .labelLarge
                                                              .override(
                                                                font:
                                                                    GoogleFonts
                                                                        .lexend(
                                                                  fontWeight: AppTheme.of(
                                                                          context)
                                                                      .labelLarge
                                                                      .fontWeight,
                                                                  fontStyle: AppTheme.of(
                                                                          context)
                                                                      .labelLarge
                                                                      .fontStyle,
                                                                ),
                                                                color: AppTheme.of(
                                                                        context)
                                                                    .primaryText,
                                                                fontSize: 14.0,
                                                                letterSpacing:
                                                                    0.0,
                                                                fontWeight: AppTheme.of(
                                                                        context)
                                                                    .labelLarge
                                                                    .fontWeight,
                                                                fontStyle: AppTheme.of(
                                                                        context)
                                                                    .labelLarge
                                                                    .fontStyle,
                                                              ),
                                                        ),
                                                      ),
                                                    ].divide(
                                                        SizedBox(width: 8.0)),
                                                  ),
                                                  Align(
                                                    alignment:
                                                        AlignmentDirectional(
                                                            -1.0, 1.0),
                                                    child: Text(
                                                      AppState().sprints.id !=
                                                              0
                                                          ? '${valueOrDefault<String>(
                                                              dateTimeFormat(
                                                                "d/M/y",
                                                                DateTime.fromMillisecondsSinceEpoch(
                                                                    AppState()
                                                                        .sprints
                                                                        .startDate),
                                                                locale: AppLocalizations.of(
                                                                        context)
                                                                    .languageCode,
                                                              ),
                                                              '0',
                                                            )}${AppLocalizations.of(context).getVariableText(
                                                              ptText: ' até ',
                                                              esText: ' hasta ',
                                                              enText: ' until ',
                                                            )}${valueOrDefault<String>(
                                                              dateTimeFormat(
                                                                "d/M/y",
                                                                DateTime.fromMillisecondsSinceEpoch(
                                                                    AppState()
                                                                        .sprints
                                                                        .endDate),
                                                                locale: AppLocalizations.of(
                                                                        context)
                                                                    .languageCode,
                                                              ),
                                                              '0',
                                                            )}'
                                                          : '${valueOrDefault<String>(
                                                              dateTimeFormat(
                                                                "d/M/y",
                                                                DateTime.fromMillisecondsSinceEpoch(
                                                                    valueOrDefault<
                                                                        int>(
                                                                  SprintsGroup
                                                                      .queryAllSprintsTasksRecordCall
                                                                      .nOstart(
                                                                    rdoQueryAllSprintsTasksRecordResponse
                                                                        .jsonBody,
                                                                  ),
                                                                  0,
                                                                )),
                                                                locale: AppLocalizations.of(
                                                                        context)
                                                                    .languageCode,
                                                              ),
                                                              '0',
                                                            )}${AppLocalizations.of(context).getVariableText(
                                                              ptText: ' até ',
                                                              esText: ' hasta ',
                                                              enText: ' until ',
                                                            )}${valueOrDefault<String>(
                                                              dateTimeFormat(
                                                                "d/M/y",
                                                                DateTime.fromMillisecondsSinceEpoch(
                                                                    valueOrDefault<
                                                                        int>(
                                                                  SprintsGroup
                                                                      .queryAllSprintsTasksRecordCall
                                                                      .nOend(
                                                                    rdoQueryAllSprintsTasksRecordResponse
                                                                        .jsonBody,
                                                                  ),
                                                                  0,
                                                                )),
                                                                locale: AppLocalizations.of(
                                                                        context)
                                                                    .languageCode,
                                                              ),
                                                              '0',
                                                            )}',
                                                      style:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelLarge
                                                              .override(
                                                                font:
                                                                    GoogleFonts
                                                                        .lexend(
                                                                  fontWeight: AppTheme.of(
                                                                          context)
                                                                      .labelLarge
                                                                      .fontWeight,
                                                                  fontStyle: AppTheme.of(
                                                                          context)
                                                                      .labelLarge
                                                                      .fontStyle,
                                                                ),
                                                                color: AppTheme.of(
                                                                        context)
                                                                    .primary,
                                                                fontSize: 14.0,
                                                                letterSpacing:
                                                                    0.0,
                                                                fontWeight: AppTheme.of(
                                                                        context)
                                                                    .labelLarge
                                                                    .fontWeight,
                                                                fontStyle: AppTheme.of(
                                                                        context)
                                                                    .labelLarge
                                                                    .fontStyle,
                                                              ),
                                                    ),
                                                  ),
                                                  if (AppState().sprints ==
                                                      null)
                                                    Text(
                                                      '${valueOrDefault<String>(
                                                        SprintsGroup
                                                            .queryAllSprintsTasksRecordCall
                                                            .nOconcluidas(
                                                              rdoQueryAllSprintsTasksRecordResponse
                                                                  .jsonBody,
                                                            )
                                                            ?.length
                                                            ?.toString(),
                                                        '0',
                                                      )}/${valueOrDefault<String>(
                                                        SprintsGroup
                                                            .queryAllSprintsTasksRecordCall
                                                            .nOandamento(
                                                              rdoQueryAllSprintsTasksRecordResponse
                                                                  .jsonBody,
                                                            )
                                                            ?.length
                                                            ?.toString(),
                                                        '0',
                                                      )} ${AppLocalizations.of(context).getVariableText(
                                                        ptText:
                                                            'tarefas concluídas',
                                                        esText:
                                                            'tareas completadas',
                                                        enText:
                                                            'tasks completed',
                                                      )}',
                                                      style:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .override(
                                                                font:
                                                                    GoogleFonts
                                                                        .lexend(
                                                                  fontWeight: AppTheme.of(
                                                                          context)
                                                                      .labelMedium
                                                                      .fontWeight,
                                                                  fontStyle: AppTheme.of(
                                                                          context)
                                                                      .labelMedium
                                                                      .fontStyle,
                                                                ),
                                                                color: AppTheme.of(
                                                                        context)
                                                                    .secondaryText,
                                                                letterSpacing:
                                                                    0.0,
                                                                fontWeight: AppTheme.of(
                                                                        context)
                                                                    .labelMedium
                                                                    .fontWeight,
                                                                fontStyle: AppTheme.of(
                                                                        context)
                                                                    .labelMedium
                                                                    .fontStyle,
                                                              ),
                                                    ),
                                                ],
                                              ),
                                            ].divide(SizedBox(width: 8.0)),
                                          ),
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: FutureBuilder<ApiCallResponse>(
                                        future: _model
                                            .rdoDia(
                                          requestFn: () => ProjectsGroup
                                              .queryAllScheduleCall
                                              .call(
                                            projectsId:
                                                AppState().user.projectId,
                                            teamsId: AppState().user.teamsId,
                                            token: currentAuthenticationToken,
                                            sprintsId:
                                                AppState().user.sprint.id,
                                          ),
                                        )
                                            .then((result) {
                                          _model.apiRequestCompleted2 = true;
                                          return result;
                                        }),
                                        builder: (context, snapshot) {
                                          // Customize what your widget looks like when it's loading.
                                          if (!snapshot.hasData) {
                                            return Center(
                                              child: SizedBox(
                                                width: 50.0,
                                                height: 50.0,
                                                child:
                                                    CircularProgressIndicator(
                                                  valueColor:
                                                      AlwaysStoppedAnimation<
                                                          Color>(
                                                    AppTheme.of(context)
                                                        .primary,
                                                  ),
                                                ),
                                              ),
                                            );
                                          }
                                          final tabBarQueryAllScheduleResponse =
                                              snapshot.data!;

                                          return Column(
                                            children: [
                                              Align(
                                                alignment: Alignment(0.0, 0),
                                                child: AppTabBar(
                                                  useToggleButtonStyle: true,
                                                  labelStyle: AppTheme
                                                          .of(context)
                                                      .labelMedium
                                                      .override(
                                                        font:
                                                            GoogleFonts.lexend(
                                                          fontWeight:
                                                              AppTheme.of(
                                                                      context)
                                                                  .labelMedium
                                                                  .fontWeight,
                                                          fontStyle:
                                                              AppTheme.of(
                                                                      context)
                                                                  .labelMedium
                                                                  .fontStyle,
                                                        ),
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            AppTheme.of(
                                                                    context)
                                                                .labelMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            AppTheme.of(
                                                                    context)
                                                                .labelMedium
                                                                .fontStyle,
                                                      ),
                                                  unselectedLabelStyle:
                                                      AppTheme.of(
                                                              context)
                                                          .labelMedium
                                                          .override(
                                                            font: GoogleFonts
                                                                .lexend(
                                                              fontWeight:
                                                                  AppTheme.of(
                                                                          context)
                                                                      .labelMedium
                                                                      .fontWeight,
                                                              fontStyle:
                                                                  AppTheme.of(
                                                                          context)
                                                                      .labelMedium
                                                                      .fontStyle,
                                                            ),
                                                            letterSpacing: 0.0,
                                                            fontWeight:
                                                                AppTheme.of(
                                                                        context)
                                                                    .labelMedium
                                                                    .fontWeight,
                                                            fontStyle:
                                                                AppTheme.of(
                                                                        context)
                                                                    .labelMedium
                                                                    .fontStyle,
                                                          ),
                                                  labelColor:
                                                      AppTheme.of(
                                                              context)
                                                          .primary,
                                                  unselectedLabelColor:
                                                      AppTheme.of(
                                                              context)
                                                          .primaryText,
                                                  backgroundColor:
                                                      AppTheme.of(
                                                              context)
                                                          .secondary,
                                                  unselectedBackgroundColor:
                                                      AppTheme.of(
                                                              context)
                                                          .secondaryBackground,
                                                  borderColor:
                                                      AppTheme.of(
                                                              context)
                                                          .alternate,
                                                  unselectedBorderColor:
                                                      AppTheme.of(
                                                              context)
                                                          .alternate,
                                                  borderWidth: 1.0,
                                                  borderRadius: 12.0,
                                                  elevation: 0.0,
                                                  buttonMargin:
                                                      EdgeInsetsDirectional
                                                          .fromSTEB(8.0, 0.0,
                                                              8.0, 0.0),
                                                  tabs: [
                                                    Tab(
                                                      text: AppLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'c45lyl99' /* Diárias */,
                                                      ),
                                                    ),
                                                    Tab(
                                                      text: AppLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'mn16n2hv' /* Tarefas da sprint */,
                                                      ),
                                                    ),
                                                  ],
                                                  controller:
                                                      _model.tabBarController,
                                                  onTap: (i) async {
                                                    // Bloquear acesso ao index 0 (Diárias) quando offline
                                                    if (i == 0 && !NetworkService.instance.isConnected) {
                                                      // Impedir a mudança de aba
                                                      _model.tabBarController?.animateTo(1);
                                                      // Mostrar modal de informação ao usuário
                                                      await showDialog(
                                                        context: context,
                                                        builder: (dialogContext) {
                                                          return Dialog(
                                                            elevation: 0,
                                                            insetPadding: EdgeInsets.zero,
                                                            backgroundColor: Colors.transparent,
                                                            alignment: AlignmentDirectional(0.0, 0.0)
                                                                .resolve(Directionality.of(context)),
                                                            child: GestureDetector(
                                                              onTap: () {
                                                                FocusScope.of(dialogContext).unfocus();
                                                                FocusManager.instance.primaryFocus?.unfocus();
                                                              },
                                                              child: ModalInfoWidget(
                                                                title: AppLocalizations.of(context).getVariableText(
                                                                  ptText: 'Aviso',
                                                                  esText: 'Aviso',
                                                                  enText: 'Notice',
                                                                ),
                                                                description: AppLocalizations.of(context).getVariableText(
                                                                  ptText: 'Esta funcionalidade está disponível apenas com conexão à internet.',
                                                                  esText: 'Esta funcionalidad solo está disponible con conexión a internet.',
                                                                  enText: 'This feature is only available with internet connection.',
                                                                ),
                                                              ),
                                                            ),
                                                          );
                                                        },
                                                      );
                                                      return;
                                                    }
                                                    [
                                                      () async {},
                                                      () async {}
                                                    ][i]();
                                                  },
                                                ),
                                              ),
                                              Expanded(
                                                child: TabBarView(
                                                  controller:
                                                      _model.tabBarController,
                                                  children: [
                                                    Container(
                                                      decoration:
                                                          BoxDecoration(),
                                                      child: Column(
                                                        mainAxisSize:
                                                            MainAxisSize.max,
                                                        children: [
                                                          Builder(
                                                            builder: (context) {
                                                              final listShedules =
                                                                  tabBarQueryAllScheduleResponse
                                                                      .jsonBody
                                                                      .toList();
                                                              if (listShedules
                                                                  .isEmpty) {
                                                                return Container(
                                                                  width: double
                                                                      .infinity,
                                                                  child:
                                                                      EmptyWidget(),
                                                                );
                                                              }

                                                              return RefreshIndicator(
                                                                onRefresh:
                                                                    () async {
                                                                  safeSetState(
                                                                      () {
                                                                    _model
                                                                        .clearRdoDiaCache();
                                                                    _model.apiRequestCompleted2 =
                                                                        false;
                                                                  });
                                                                  await _model
                                                                      .waitForApiRequestCompleted2();
                                                                },
                                                                child: ListView
                                                                    .builder(
                                                                  padding:
                                                                      EdgeInsets
                                                                          .zero,
                                                                  shrinkWrap:
                                                                      true,
                                                                  scrollDirection:
                                                                      Axis.vertical,
                                                                  itemCount:
                                                                      listShedules
                                                                          .length,
                                                                  itemBuilder:
                                                                      (context,
                                                                          listShedulesIndex) {
                                                                    final listShedulesItem =
                                                                        listShedules[
                                                                            listShedulesIndex];
                                                                    return Visibility(
                                                                      visible:
                                                                          true ==
                                                                              getJsonField(
                                                                                listShedulesItem,
                                                                                r'''$.end_service''',
                                                                              ),
                                                                      child:
                                                                          Padding(
                                                                        padding: EdgeInsetsDirectional.fromSTEB(
                                                                            0.0,
                                                                            8.0,
                                                                            0.0,
                                                                            0.0),
                                                                        child:
                                                                            InkWell(
                                                                          splashColor:
                                                                              Colors.transparent,
                                                                          focusColor:
                                                                              Colors.transparent,
                                                                          hoverColor:
                                                                              Colors.transparent,
                                                                          highlightColor:
                                                                              Colors.transparent,
                                                                          onTap:
                                                                              () async {
                                                                            context.pushNamed(
                                                                              Rdo2Widget.routeName,
                                                                              queryParameters: {
                                                                                'item': serializeParam(
                                                                                  listShedulesItem,
                                                                                  ParamType.JSON,
                                                                                ),
                                                                                'list': serializeParam(
                                                                                  getJsonField(
                                                                                    listShedulesItem,
                                                                                    r'''$.sprints_tasks_id[:][:]''',
                                                                                    true,
                                                                                  ),
                                                                                  ParamType.JSON,
                                                                                  isList: true,
                                                                                ),
                                                                              }.withoutNulls,
                                                                            );
                                                                          },
                                                                          child:
                                                                              Material(
                                                                            color:
                                                                                Colors.transparent,
                                                                            elevation:
                                                                                0.0,
                                                                            shape:
                                                                                RoundedRectangleBorder(
                                                                              borderRadius: BorderRadius.circular(14.0),
                                                                            ),
                                                                            child:
                                                                                Container(
                                                                              width: MediaQuery.sizeOf(context).width * 1.0,
                                                                              decoration: BoxDecoration(
                                                                                color: AppTheme.of(context).secondaryBackground,
                                                                                borderRadius: BorderRadius.circular(14.0),
                                                                                border: Border.all(
                                                                                  color: AppTheme.of(context).alternate,
                                                                                ),
                                                                              ),
                                                                              child: Padding(
                                                                                padding: EdgeInsetsDirectional.fromSTEB(12.0, 8.0, 12.0, 8.0),
                                                                                child: Row(
                                                                                  mainAxisSize: MainAxisSize.min,
                                                                                  children: [
                                                                                    Expanded(
                                                                                      child: Column(
                                                                                        mainAxisSize: MainAxisSize.min,
                                                                                        crossAxisAlignment: CrossAxisAlignment.start,
                                                                                        children: [
                                                                                          Text(
                                                                                            valueOrDefault<String>(
                                                                                              dateTimeFormat(
                                                                                                "EEEE d/M/y",
                                                                                                functions.convertDate(valueOrDefault<String>(
                                                                                                  getJsonField(
                                                                                                    listShedulesItem,
                                                                                                    r'''$.schedule_date''',
                                                                                                  )?.toString(),
                                                                                                  '0',
                                                                                                )),
                                                                                                locale: AppLocalizations.of(context).languageCode,
                                                                                              ),
                                                                                              '0',
                                                                                            ),
                                                                                            style: AppTheme.of(context).labelMedium.override(
                                                                                                  font: GoogleFonts.lexend(
                                                                                                    fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                    fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                  ),
                                                                                                  color: AppTheme.of(context).primary,
                                                                                                  letterSpacing: 0.0,
                                                                                                  fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                  fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                ),
                                                                                          ),
                                                                                          Text(
                                                                                            '${valueOrDefault<String>(
                                                                                              functions
                                                                                                  .returnNumberJsonList(getJsonField(
                                                                                                    listShedulesItem,
                                                                                                    r'''$.sprints_tasks_id[:]''',
                                                                                                    true,
                                                                                                  ))
                                                                                                  .toString(),
                                                                                              '0',
                                                                                            )} ${AppLocalizations.of(context).getVariableText(
                                                                                              ptText: 'tarefas concluídas',
                                                                                              esText: 'tareas completadas',
                                                                                              enText: 'tasks completed',
                                                                                            )}',
                                                                                            style: AppTheme.of(context).labelMedium.override(
                                                                                                  font: GoogleFonts.lexend(
                                                                                                    fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                    fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                  ),
                                                                                                  color: AppTheme.of(context).primaryText,
                                                                                                  letterSpacing: 0.0,
                                                                                                  fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                  fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                ),
                                                                                          ),
                                                                                          Text(
                                                                                            valueOrDefault<String>(
                                                                                              '${valueOrDefault<String>(
                                                                                                functions
                                                                                                    .returnNumberJsonList(getJsonField(
                                                                                                      listShedulesItem,
                                                                                                      r'''$.schedule_user_of_schedule''',
                                                                                                      true,
                                                                                                    ))
                                                                                                    .toString(),
                                                                                                '0',
                                                                                              )} ${AppLocalizations.of(context).getVariableText(
                                                                                                ptText: 'funcionários',
                                                                                                esText: 'empleados',
                                                                                                enText: 'employees',
                                                                                              )}',
                                                                                              '0',
                                                                                            ),
                                                                                            style: AppTheme.of(context).labelMedium.override(
                                                                                                  font: GoogleFonts.lexend(
                                                                                                    fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                    fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                  ),
                                                                                                  color: AppTheme.of(context).secondaryText,
                                                                                                  letterSpacing: 0.0,
                                                                                                  fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                  fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                ),
                                                                                          ),
                                                                                        ],
                                                                                      ),
                                                                                    ),
                                                                                    Column(
                                                                                      mainAxisSize: MainAxisSize.max,
                                                                                      children: [
                                                                                        Icon(
                                                                                          Icons.keyboard_arrow_right_sharp,
                                                                                          color: AppTheme.of(context).primary,
                                                                                          size: 24.0,
                                                                                        ),
                                                                                      ],
                                                                                    ),
                                                                                  ].divide(SizedBox(width: 12.0)),
                                                                                ),
                                                                              ),
                                                                            ),
                                                                          ),
                                                                        ),
                                                                      ),
                                                                    );
                                                                  },
                                                                ),
                                                              );
                                                            },
                                                          ),
                                                          if (getJsonField(
                                                                tabBarQueryAllScheduleResponse
                                                                    .jsonBody,
                                                                r'''$[:].images''',
                                                              ) ==
                                                              null)
                                                            wrapWithModel(
                                                              model: _model
                                                                  .emptyModel1,
                                                              updateCallback: () =>
                                                                  safeSetState(
                                                                      () {}),
                                                              child:
                                                                  EmptyWidget(),
                                                            ),
                                                        ],
                                                      ),
                                                    ),
                                                    Container(
                                                      decoration:
                                                          BoxDecoration(),
                                                      child:
                                                          SingleChildScrollView(
                                                        child: Column(
                                                          mainAxisSize:
                                                              MainAxisSize.max,
                                                          children: [
                                                            Padding(
                                                              padding:
                                                                  EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          0.0,
                                                                          16.0,
                                                                          0.0,
                                                                          0.0),
                                                              child: Container(
                                                                decoration:
                                                                    BoxDecoration(
                                                                  color: AppTheme.of(
                                                                          context)
                                                                      .alternate,
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .circular(
                                                                              8.0),
                                                                ),
                                                                child: Padding(
                                                                  padding: EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          12.0,
                                                                          8.0,
                                                                          12.0,
                                                                          8.0),
                                                                  child: Row(
                                                                    mainAxisSize:
                                                                        MainAxisSize
                                                                            .max,
                                                                    children: [
                                                                      Text(
                                                                        AppLocalizations.of(context)
                                                                            .getText(
                                                                          'ehdjy6wc' /* Tarefas concluidas */,
                                                                        ),
                                                                        style: AppTheme.of(context)
                                                                            .bodyMedium
                                                                            .override(
                                                                              font: GoogleFonts.lexend(
                                                                                fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                              ),
                                                                              letterSpacing: 0.0,
                                                                              fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                              fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                            ),
                                                                      ),
                                                                      Text(
                                                                        valueOrDefault<
                                                                            String>(
                                                                          getJsonField(
                                                                            rdoQueryAllSprintsTasksRecordResponse.jsonBody,
                                                                            r'''$.sprints_tasks_concluidas.itemsTotal''',
                                                                          )?.toString(),
                                                                          '0',
                                                                        ),
                                                                        style: AppTheme.of(context)
                                                                            .bodyMedium
                                                                            .override(
                                                                              font: GoogleFonts.lexend(
                                                                                fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                              ),
                                                                              color: AppTheme.of(context).primary,
                                                                              letterSpacing: 0.0,
                                                                              fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                              fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                            ),
                                                                      ),
                                                                    ].divide(SizedBox(
                                                                        width:
                                                                            8.0)),
                                                                  ),
                                                                ),
                                                              ),
                                                            ),
                                                            Padding(
                                                              padding:
                                                                  EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          0.0,
                                                                          8.0,
                                                                          0.0,
                                                                          0.0),
                                                              child: Builder(
                                                                builder:
                                                                    (context) {
                                                                  final listConcluidas = SprintsGroup
                                                                          .queryAllSprintsTasksRecordCall
                                                                          .nOconcluidas(
                                                                            rdoQueryAllSprintsTasksRecordResponse.jsonBody,
                                                                          )
                                                                          ?.toList() ??
                                                                      [];

                                                                  return ListView
                                                                      .builder(
                                                                    padding:
                                                                        EdgeInsets
                                                                            .zero,
                                                                    primary:
                                                                        false,
                                                                    shrinkWrap:
                                                                        true,
                                                                    scrollDirection:
                                                                        Axis.vertical,
                                                                    itemCount:
                                                                        listConcluidas
                                                                            .length,
                                                                    itemBuilder:
                                                                        (context,
                                                                            listConcluidasIndex) {
                                                                      final listConcluidasItem =
                                                                          listConcluidas[
                                                                              listConcluidasIndex];
                                                                      return Padding(
                                                                        padding: EdgeInsetsDirectional.fromSTEB(
                                                                            0.0,
                                                                            0.0,
                                                                            0.0,
                                                                            8.0),
                                                                        child:
                                                                            SingleChildScrollView(
                                                                          child:
                                                                              Column(
                                                                            mainAxisSize:
                                                                                MainAxisSize.max,
                                                                            children:
                                                                                [
                                                                              Material(
                                                                                color: Colors.transparent,
                                                                                elevation: 0.0,
                                                                                shape: RoundedRectangleBorder(
                                                                                  borderRadius: BorderRadius.circular(14.0),
                                                                                ),
                                                                                child: Container(
                                                                                  width: MediaQuery.sizeOf(context).width * 1.0,
                                                                                  decoration: BoxDecoration(
                                                                                    borderRadius: BorderRadius.circular(14.0),
                                                                                    border: Border.all(
                                                                                      color: AppTheme.of(context).alternate,
                                                                                    ),
                                                                                  ),
                                                                                  child: Padding(
                                                                                    padding: EdgeInsets.all(16.0),
                                                                                    child: Column(
                                                                                      mainAxisSize: MainAxisSize.min,
                                                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                                                      children: [
                                                                                        Padding(
                                                                                          padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 12.0),
                                                                                          child: Container(
                                                                                            decoration: BoxDecoration(
                                                                                              color: () {
                                                                                                if (AppConstants.um ==
                                                                                                    getJsonField(
                                                                                                      listConcluidasItem,
                                                                                                      r'''$.projects_backlogs.equipaments_types.id''',
                                                                                                    )) {
                                                                                                  return AppTheme.of(context).status04;
                                                                                                } else if (AppConstants.dois ==
                                                                                                    getJsonField(
                                                                                                      listConcluidasItem,
                                                                                                      r'''$.projects_backlogs.equipaments_types.id''',
                                                                                                    )) {
                                                                                                  return AppTheme.of(context).secondary;
                                                                                                } else if (AppConstants.tres ==
                                                                                                    getJsonField(
                                                                                                      listConcluidasItem,
                                                                                                      r'''$.projects_backlogs.equipaments_types.id''',
                                                                                                    )) {
                                                                                                  return AppTheme.of(context).status02;
                                                                                                } else {
                                                                                                  return AppTheme.of(context).alternate;
                                                                                                }
                                                                                              }(),
                                                                                              borderRadius: BorderRadius.circular(100.0),
                                                                                              border: Border.all(
                                                                                                color: () {
                                                                                                  if (AppConstants.um ==
                                                                                                      getJsonField(
                                                                                                        listConcluidasItem,
                                                                                                        r'''$.projects_backlogs.equipaments_types.id''',
                                                                                                      )) {
                                                                                                    return AppTheme.of(context).success;
                                                                                                  } else if (AppConstants.dois ==
                                                                                                      getJsonField(
                                                                                                        listConcluidasItem,
                                                                                                        r'''$.projects_backlogs.equipaments_types.id''',
                                                                                                      )) {
                                                                                                    return AppTheme.of(context).primary;
                                                                                                  } else if (AppConstants.tres ==
                                                                                                      getJsonField(
                                                                                                        listConcluidasItem,
                                                                                                        r'''$.projects_backlogs.equipaments_types.id''',
                                                                                                      )) {
                                                                                                    return AppTheme.of(context).tertiary;
                                                                                                  } else {
                                                                                                    return AppTheme.of(context).alternate;
                                                                                                  }
                                                                                                }(),
                                                                                              ),
                                                                                            ),
                                                                                            child: Padding(
                                                                                              padding: EdgeInsetsDirectional.fromSTEB(24.0, 4.0, 24.0, 4.0),
                                                                                              child: Text(
                                                                                                valueOrDefault<String>(
                                                                                                  getJsonField(
                                                                                                    listConcluidasItem,
                                                                                                    r'''$.projects_backlogs.equipaments_types.type''',
                                                                                                  )?.toString(),
                                                                                                  ' - ',
                                                                                                ),
                                                                                                style: AppTheme.of(context).bodySmall.override(
                                                                                                      font: GoogleFonts.lexend(
                                                                                                        fontWeight: AppTheme.of(context).bodySmall.fontWeight,
                                                                                                        fontStyle: AppTheme.of(context).bodySmall.fontStyle,
                                                                                                      ),
                                                                                                      color: AppTheme.of(context).primaryText,
                                                                                                      letterSpacing: 0.0,
                                                                                                      fontWeight: AppTheme.of(context).bodySmall.fontWeight,
                                                                                                      fontStyle: AppTheme.of(context).bodySmall.fontStyle,
                                                                                                    ),
                                                                                              ),
                                                                                            ),
                                                                                          ),
                                                                                        ),
                                                                                        Row(
                                                                                          mainAxisSize: MainAxisSize.max,
                                                                                          children: [
                                                                                            Expanded(
                                                                                              child: RichText(
                                                                                                textScaler: MediaQuery.of(context).textScaler,
                                                                                                text: TextSpan(
                                                                                                  children: [
                                                                                                    TextSpan(
                                                                                                      text: 'COD: ${valueOrDefault<String>(
                                                                                                        getJsonField(
                                                                                                          listConcluidasItem,
                                                                                                          r'''$.id''',
                                                                                                        )?.toString(),
                                                                                                        ' - ',
                                                                                                      )}',
                                                                                                      style: AppTheme.of(context).labelSmall.override(
                                                                                                            font: GoogleFonts.lexend(
                                                                                                              fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                              fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                            ),
                                                                                                            color: AppTheme.of(context).primary,
                                                                                                            letterSpacing: 0.0,
                                                                                                            fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                          ),
                                                                                                    ),
                                                                                                    TextSpan(
                                                                                                      text: AppLocalizations.of(context).getText(
                                                                                                        'tstuiouy' /*  
 */
                                                                                                        ,
                                                                                                      ),
                                                                                                      style: TextStyle(),
                                                                                                    ),
                                                                                                    TextSpan(
                                                                                                      text: valueOrDefault<String>(
                                                                                                        AppConstants.zero ==
                                                                                                                getJsonField(
                                                                                                                  listConcluidasItem,
                                                                                                                  r'''$.subtasks_id''',
                                                                                                                )
                                                                                                            ? getJsonField(
                                                                                                                listConcluidasItem,
                                                                                                                r'''$.projects_backlogs.description''',
                                                                                                              ).toString()
                                                                                                            : getJsonField(
                                                                                                                listConcluidasItem,
                                                                                                                r'''$.subtasks.description''',
                                                                                                              ).toString(),
                                                                                                        '-',
                                                                                                      ),
                                                                                                      style: AppTheme.of(context).labelLarge.override(
                                                                                                            font: GoogleFonts.lexend(
                                                                                                              fontWeight: AppTheme.of(context).labelLarge.fontWeight,
                                                                                                              fontStyle: AppTheme.of(context).labelLarge.fontStyle,
                                                                                                            ),
                                                                                                            color: AppTheme.of(context).primaryText,
                                                                                                            letterSpacing: 0.0,
                                                                                                            fontWeight: AppTheme.of(context).labelLarge.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).labelLarge.fontStyle,
                                                                                                          ),
                                                                                                    )
                                                                                                  ],
                                                                                                  style: AppTheme.of(context).labelSmall.override(
                                                                                                        font: GoogleFonts.lexend(
                                                                                                          fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                          fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                        ),
                                                                                                        color: AppTheme.of(context).primaryText,
                                                                                                        letterSpacing: 0.0,
                                                                                                        fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                        fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                      ),
                                                                                                ),
                                                                                              ),
                                                                                            ),
                                                                                          ],
                                                                                        ),
                                                                                        if (AppConstants.zero !=
                                                                                            getJsonField(
                                                                                              listConcluidasItem,
                                                                                              r'''$.projects_backlogs.tasks_template_id''',
                                                                                            ))
                                                                                          Padding(
                                                                                            padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 0.0, 0.0),
                                                                                            child: Wrap(
                                                                                              spacing: 2.0,
                                                                                              runSpacing: 8.0,
                                                                                              alignment: WrapAlignment.start,
                                                                                              crossAxisAlignment: WrapCrossAlignment.center,
                                                                                              direction: Axis.horizontal,
                                                                                              runAlignment: WrapAlignment.start,
                                                                                              verticalDirection: VerticalDirection.down,
                                                                                              clipBehavior: Clip.none,
                                                                                              children: [
                                                                                                Row(
                                                                                                  mainAxisSize: MainAxisSize.min,
                                                                                                  children: [
                                                                                                    Container(
                                                                                                      decoration: BoxDecoration(
                                                                                                        gradient: LinearGradient(
                                                                                                          colors: [
                                                                                                            AppTheme.of(context).secondaryBackground,
                                                                                                            AppTheme.of(context).primaryBackground
                                                                                                          ],
                                                                                                          stops: [0.0, 1.0],
                                                                                                          begin: AlignmentDirectional(-1.0, 0.0),
                                                                                                          end: AlignmentDirectional(1.0, 0),
                                                                                                        ),
                                                                                                        borderRadius: BorderRadius.circular(8.0),
                                                                                                        border: Border.all(
                                                                                                          color: AppTheme.of(context).alternate,
                                                                                                        ),
                                                                                                      ),
                                                                                                      child: Padding(
                                                                                                        padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                                        child: RichText(
                                                                                                          textScaler: MediaQuery.of(context).textScaler,
                                                                                                          text: TextSpan(
                                                                                                            children: [
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  '5a3s9ama' /* Campo  */,
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelSmall.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primaryText,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                    ),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: valueOrDefault<String>(
                                                                                                                  getJsonField(
                                                                                                                    listConcluidasItem,
                                                                                                                    r'''$.projects_backlogs.fields.name''',
                                                                                                                  )?.toString(),
                                                                                                                  ' - ',
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelMedium.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primary,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                    ),
                                                                                                              )
                                                                                                            ],
                                                                                                            style: TextStyle(),
                                                                                                          ),
                                                                                                        ),
                                                                                                      ),
                                                                                                    ),
                                                                                                    Icon(
                                                                                                      Icons.keyboard_arrow_right_sharp,
                                                                                                      color: AppTheme.of(context).secondaryText,
                                                                                                      size: 16.0,
                                                                                                    ),
                                                                                                  ],
                                                                                                ),
                                                                                                Row(
                                                                                                  mainAxisSize: MainAxisSize.min,
                                                                                                  children: [
                                                                                                    Container(
                                                                                                      decoration: BoxDecoration(
                                                                                                        gradient: LinearGradient(
                                                                                                          colors: [
                                                                                                            AppTheme.of(context).secondaryBackground,
                                                                                                            AppTheme.of(context).primaryBackground
                                                                                                          ],
                                                                                                          stops: [0.0, 1.0],
                                                                                                          begin: AlignmentDirectional(-1.0, 0.0),
                                                                                                          end: AlignmentDirectional(1.0, 0),
                                                                                                        ),
                                                                                                        borderRadius: BorderRadius.circular(8.0),
                                                                                                        border: Border.all(
                                                                                                          color: AppTheme.of(context).alternate,
                                                                                                        ),
                                                                                                      ),
                                                                                                      child: Padding(
                                                                                                        padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                                        child: RichText(
                                                                                                          textScaler: MediaQuery.of(context).textScaler,
                                                                                                          text: TextSpan(
                                                                                                            children: [
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  'dt77v4xh' /* Seção  */,
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelSmall.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primaryText,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                    ),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: valueOrDefault<String>(
                                                                                                                  getJsonField(
                                                                                                                    listConcluidasItem,
                                                                                                                    r'''$.projects_backlogs.sections.section_number''',
                                                                                                                  )?.toString(),
                                                                                                                  ' - ',
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelMedium.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primary,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                    ),
                                                                                                              )
                                                                                                            ],
                                                                                                            style: TextStyle(),
                                                                                                          ),
                                                                                                        ),
                                                                                                      ),
                                                                                                    ),
                                                                                                    Icon(
                                                                                                      Icons.keyboard_arrow_right_sharp,
                                                                                                      color: AppTheme.of(context).secondaryText,
                                                                                                      size: 16.0,
                                                                                                    ),
                                                                                                  ],
                                                                                                ),
                                                                                                Row(
                                                                                                  mainAxisSize: MainAxisSize.min,
                                                                                                  children: [
                                                                                                    Container(
                                                                                                      decoration: BoxDecoration(
                                                                                                        gradient: LinearGradient(
                                                                                                          colors: [
                                                                                                            AppTheme.of(context).secondaryBackground,
                                                                                                            AppTheme.of(context).primaryBackground
                                                                                                          ],
                                                                                                          stops: [0.0, 1.0],
                                                                                                          begin: AlignmentDirectional(-1.0, 0.0),
                                                                                                          end: AlignmentDirectional(1.0, 0),
                                                                                                        ),
                                                                                                        borderRadius: BorderRadius.circular(8.0),
                                                                                                        border: Border.all(
                                                                                                          color: AppTheme.of(context).alternate,
                                                                                                        ),
                                                                                                      ),
                                                                                                      child: Padding(
                                                                                                        padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                                        child: RichText(
                                                                                                          textScaler: MediaQuery.of(context).textScaler,
                                                                                                          text: TextSpan(
                                                                                                            children: [
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  'sbxxv64b' /* Fileira  */,
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelSmall.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primaryText,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                    ),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: valueOrDefault<String>(
                                                                                                                  getJsonField(
                                                                                                                    listConcluidasItem,
                                                                                                                    r'''$.projects_backlogs.rows.row_number''',
                                                                                                                  )?.toString(),
                                                                                                                  ' - ',
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelMedium.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primary,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                    ),
                                                                                                              )
                                                                                                            ],
                                                                                                            style: TextStyle(),
                                                                                                          ),
                                                                                                        ),
                                                                                                      ),
                                                                                                    ),
                                                                                                    Icon(
                                                                                                      Icons.keyboard_arrow_right_sharp,
                                                                                                      color: AppTheme.of(context).secondaryText,
                                                                                                      size: 16.0,
                                                                                                    ),
                                                                                                  ],
                                                                                                ),
                                                                                                Row(
                                                                                                  mainAxisSize: MainAxisSize.min,
                                                                                                  children: [
                                                                                                    Container(
                                                                                                      decoration: BoxDecoration(
                                                                                                        gradient: LinearGradient(
                                                                                                          colors: [
                                                                                                            AppTheme.of(context).secondaryBackground,
                                                                                                            AppTheme.of(context).primaryBackground
                                                                                                          ],
                                                                                                          stops: [0.0, 1.0],
                                                                                                          begin: AlignmentDirectional(-1.0, 0.0),
                                                                                                          end: AlignmentDirectional(1.0, 0),
                                                                                                        ),
                                                                                                        borderRadius: BorderRadius.circular(8.0),
                                                                                                        border: Border.all(
                                                                                                          color: AppTheme.of(context).alternate,
                                                                                                        ),
                                                                                                      ),
                                                                                                      child: Padding(
                                                                                                        padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                                        child: RichText(
                                                                                                          textScaler: MediaQuery.of(context).textScaler,
                                                                                                          text: TextSpan(
                                                                                                            children: [
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  'kooggavg' /* Tracker  */,
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelSmall.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primaryText,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                    ),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: valueOrDefault<String>(
                                                                                                                  getJsonField(
                                                                                                                    listConcluidasItem,
                                                                                                                    r'''$.projects_backlogs.rows_trackers.position''',
                                                                                                                  )?.toString(),
                                                                                                                  ' - ',
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelMedium.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primary,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                    ),
                                                                                                              )
                                                                                                            ],
                                                                                                            style: TextStyle(),
                                                                                                          ),
                                                                                                        ),
                                                                                                      ),
                                                                                                    ),
                                                                                                    Icon(
                                                                                                      Icons.keyboard_arrow_right_sharp,
                                                                                                      color: AppTheme.of(context).secondaryText,
                                                                                                      size: 16.0,
                                                                                                    ),
                                                                                                  ],
                                                                                                ),
                                                                                                Container(
                                                                                                  decoration: BoxDecoration(
                                                                                                    gradient: LinearGradient(
                                                                                                      colors: [
                                                                                                        AppTheme.of(context).secondaryBackground,
                                                                                                        AppTheme.of(context).primaryBackground
                                                                                                      ],
                                                                                                      stops: [0.0, 1.0],
                                                                                                      begin: AlignmentDirectional(-1.0, 0.0),
                                                                                                      end: AlignmentDirectional(1.0, 0),
                                                                                                    ),
                                                                                                    borderRadius: BorderRadius.circular(8.0),
                                                                                                    border: Border.all(
                                                                                                      color: AppTheme.of(context).alternate,
                                                                                                    ),
                                                                                                  ),
                                                                                                  child: Padding(
                                                                                                    padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                                    child: RichText(
                                                                                                      textScaler: MediaQuery.of(context).textScaler,
                                                                                                      text: TextSpan(
                                                                                                        children: [
                                                                                                          TextSpan(
                                                                                                            text: AppLocalizations.of(context).getText(
                                                                                                              'it9k9s5t' /* Estacas  */,
                                                                                                            ),
                                                                                                            style: AppTheme.of(context).labelSmall.override(
                                                                                                                  font: GoogleFonts.lexend(
                                                                                                                    fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                    fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                  ),
                                                                                                                  color: AppTheme.of(context).primaryText,
                                                                                                                  letterSpacing: 0.0,
                                                                                                                  fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                  fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                ),
                                                                                                          ),
                                                                                                          TextSpan(
                                                                                                            text: valueOrDefault<String>(
                                                                                                              getJsonField(
                                                                                                                listConcluidasItem,
                                                                                                                r'''$.projects_backlogs.rows_stakes.stakes.position''',
                                                                                                              )?.toString(),
                                                                                                              ' - ',
                                                                                                            ),
                                                                                                            style: AppTheme.of(context).labelMedium.override(
                                                                                                                  font: GoogleFonts.lexend(
                                                                                                                    fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                    fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                  ),
                                                                                                                  color: AppTheme.of(context).primary,
                                                                                                                  letterSpacing: 0.0,
                                                                                                                  fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                  fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                ),
                                                                                                          )
                                                                                                        ],
                                                                                                        style: TextStyle(),
                                                                                                      ),
                                                                                                    ),
                                                                                                  ),
                                                                                                ),
                                                                                              ],
                                                                                            ),
                                                                                          ),
                                                                                        Padding(
                                                                                          padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 0.0, 0.0),
                                                                                          child: Container(
                                                                                            decoration: BoxDecoration(
                                                                                              color: Color(0x1A028F58),
                                                                                              borderRadius: BorderRadius.circular(8.0),
                                                                                              border: Border.all(
                                                                                                color: AppTheme.of(context).success,
                                                                                              ),
                                                                                            ),
                                                                                            child: Row(
                                                                                              mainAxisSize: MainAxisSize.min,
                                                                                              children: [
                                                                                                Padding(
                                                                                                  padding: EdgeInsets.all(4.0),
                                                                                                  child: Text(
                                                                                                    AppLocalizations.of(context).getText(
                                                                                                      'tpuiip3t' /* Tarefa concluída */,
                                                                                                    ),
                                                                                                    style: AppTheme.of(context).labelSmall.override(
                                                                                                          font: GoogleFonts.lexend(
                                                                                                            fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                          ),
                                                                                                          color: AppTheme.of(context).success,
                                                                                                          letterSpacing: 0.0,
                                                                                                          fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                          fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                        ),
                                                                                                  ),
                                                                                                ),
                                                                                                Padding(
                                                                                                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 4.0, 4.0, 4.0),
                                                                                                  child: Text(
                                                                                                    dateTimeFormat(
                                                                                                      "EEEE d/M/y",
                                                                                                      DateTime.fromMillisecondsSinceEpoch(valueOrDefault<int>(
                                                                                                        getJsonField(
                                                                                                          listConcluidasItem,
                                                                                                          r'''$.sprints.updated_at''',
                                                                                                        ),
                                                                                                        0,
                                                                                                      )),
                                                                                                      locale: AppLocalizations.of(context).languageCode,
                                                                                                    ),
                                                                                                    style: AppTheme.of(context).labelSmall.override(
                                                                                                          font: GoogleFonts.lexend(
                                                                                                            fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                          ),
                                                                                                          color: AppTheme.of(context).primaryText,
                                                                                                          letterSpacing: 0.0,
                                                                                                          fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                          fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                        ),
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
                                                                              ),
                                                                            ].divide(SizedBox(height: 8.0)),
                                                                          ),
                                                                        ),
                                                                      );
                                                                    },
                                                                  );
                                                                },
                                                              ),
                                                            ),
                                                            Padding(
                                                              padding:
                                                                  EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          0.0,
                                                                          8.0,
                                                                          0.0,
                                                                          0.0),
                                                              child: Builder(
                                                                builder:
                                                                    (context) {
                                                                  final listConcluidas2 = SprintsGroup
                                                                          .queryAllSprintsTasksRecordCall
                                                                          .yESconcluidas(
                                                                            rdoQueryAllSprintsTasksRecordResponse.jsonBody,
                                                                          )
                                                                          ?.toList() ??
                                                                      [];

                                                                  return ListView
                                                                      .builder(
                                                                    padding:
                                                                        EdgeInsets
                                                                            .zero,
                                                                    primary:
                                                                        false,
                                                                    shrinkWrap:
                                                                        true,
                                                                    scrollDirection:
                                                                        Axis.vertical,
                                                                    itemCount:
                                                                        listConcluidas2
                                                                            .length,
                                                                    itemBuilder:
                                                                        (context,
                                                                            listConcluidas2Index) {
                                                                      final listConcluidas2Item =
                                                                          listConcluidas2[
                                                                              listConcluidas2Index];
                                                                      return Padding(
                                                                        padding: EdgeInsetsDirectional.fromSTEB(
                                                                            0.0,
                                                                            0.0,
                                                                            0.0,
                                                                            8.0),
                                                                        child:
                                                                            SingleChildScrollView(
                                                                          child:
                                                                              Column(
                                                                            mainAxisSize:
                                                                                MainAxisSize.max,
                                                                            children:
                                                                                [
                                                                              Material(
                                                                                color: Colors.transparent,
                                                                                elevation: 0.0,
                                                                                shape: RoundedRectangleBorder(
                                                                                  borderRadius: BorderRadius.circular(14.0),
                                                                                ),
                                                                                child: Container(
                                                                                  width: MediaQuery.sizeOf(context).width * 1.0,
                                                                                  decoration: BoxDecoration(
                                                                                    borderRadius: BorderRadius.circular(14.0),
                                                                                    border: Border.all(
                                                                                      color: AppTheme.of(context).alternate,
                                                                                    ),
                                                                                  ),
                                                                                  child: Padding(
                                                                                    padding: EdgeInsets.all(16.0),
                                                                                    child: Column(
                                                                                      mainAxisSize: MainAxisSize.min,
                                                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                                                      children: [
                                                                                        if (getJsonField(
                                                                                              listConcluidas2Item,
                                                                                              r'''$.projects_backlogs.equipaments_types.type''',
                                                                                            ) !=
                                                                                            null)
                                                                                          Padding(
                                                                                            padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 12.0),
                                                                                            child: Container(
                                                                                              decoration: BoxDecoration(
                                                                                                color: () {
                                                                                                  if (AppConstants.um ==
                                                                                                      getJsonField(
                                                                                                        listConcluidas2Item,
                                                                                                        r'''$.projects_backlogs.equipaments_types.id''',
                                                                                                      )) {
                                                                                                    return AppTheme.of(context).status04;
                                                                                                  } else if (AppConstants.dois ==
                                                                                                      getJsonField(
                                                                                                        listConcluidas2Item,
                                                                                                        r'''$.projects_backlogs.equipaments_types.id''',
                                                                                                      )) {
                                                                                                    return AppTheme.of(context).secondary;
                                                                                                  } else if (AppConstants.tres ==
                                                                                                      getJsonField(
                                                                                                        listConcluidas2Item,
                                                                                                        r'''$.projects_backlogs.equipaments_types.id''',
                                                                                                      )) {
                                                                                                    return AppTheme.of(context).status02;
                                                                                                  } else {
                                                                                                    return AppTheme.of(context).alternate;
                                                                                                  }
                                                                                                }(),
                                                                                                borderRadius: BorderRadius.circular(100.0),
                                                                                                border: Border.all(
                                                                                                  color: () {
                                                                                                    if (AppConstants.um ==
                                                                                                        getJsonField(
                                                                                                          listConcluidas2Item,
                                                                                                          r'''$.projects_backlogs.equipaments_types.id''',
                                                                                                        )) {
                                                                                                      return AppTheme.of(context).success;
                                                                                                    } else if (AppConstants.dois ==
                                                                                                        getJsonField(
                                                                                                          listConcluidas2Item,
                                                                                                          r'''$.projects_backlogs.equipaments_types.id''',
                                                                                                        )) {
                                                                                                      return AppTheme.of(context).primary;
                                                                                                    } else if (AppConstants.tres ==
                                                                                                        getJsonField(
                                                                                                          listConcluidas2Item,
                                                                                                          r'''$.projects_backlogs.equipaments_types.id''',
                                                                                                        )) {
                                                                                                      return AppTheme.of(context).tertiary;
                                                                                                    } else {
                                                                                                      return AppTheme.of(context).alternate;
                                                                                                    }
                                                                                                  }(),
                                                                                                ),
                                                                                              ),
                                                                                              child: Padding(
                                                                                                padding: EdgeInsetsDirectional.fromSTEB(24.0, 4.0, 24.0, 4.0),
                                                                                                child: Text(
                                                                                                  valueOrDefault<String>(
                                                                                                    getJsonField(
                                                                                                      listConcluidas2Item,
                                                                                                      r'''$.projects_backlogs.equipaments_types.type''',
                                                                                                    )?.toString(),
                                                                                                    ' - ',
                                                                                                  ),
                                                                                                  style: AppTheme.of(context).bodySmall.override(
                                                                                                        font: GoogleFonts.lexend(
                                                                                                          fontWeight: AppTheme.of(context).bodySmall.fontWeight,
                                                                                                          fontStyle: AppTheme.of(context).bodySmall.fontStyle,
                                                                                                        ),
                                                                                                        color: AppTheme.of(context).primaryText,
                                                                                                        letterSpacing: 0.0,
                                                                                                        fontWeight: AppTheme.of(context).bodySmall.fontWeight,
                                                                                                        fontStyle: AppTheme.of(context).bodySmall.fontStyle,
                                                                                                      ),
                                                                                                ),
                                                                                              ),
                                                                                            ),
                                                                                          ),
                                                                                        Row(
                                                                                          mainAxisSize: MainAxisSize.max,
                                                                                          children: [
                                                                                            Expanded(
                                                                                              child: RichText(
                                                                                                textScaler: MediaQuery.of(context).textScaler,
                                                                                                text: TextSpan(
                                                                                                  children: [
                                                                                                    TextSpan(
                                                                                                      text: 'COD:${valueOrDefault<String>(
                                                                                                        getJsonField(
                                                                                                          listConcluidas2Item,
                                                                                                          r'''$.id''',
                                                                                                        )?.toString(),
                                                                                                        ' - ',
                                                                                                      )}',
                                                                                                      style: AppTheme.of(context).labelSmall.override(
                                                                                                            font: GoogleFonts.lexend(
                                                                                                              fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                              fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                            ),
                                                                                                            color: AppTheme.of(context).primary,
                                                                                                            letterSpacing: 0.0,
                                                                                                            fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                          ),
                                                                                                    ),
                                                                                                    TextSpan(
                                                                                                      text: AppLocalizations.of(context).getText(
                                                                                                        'p4kwjapd' /*  
 */
                                                                                                        ,
                                                                                                      ),
                                                                                                      style: TextStyle(),
                                                                                                    ),
                                                                                                    TextSpan(
                                                                                                      text: valueOrDefault<String>(
                                                                                                        AppConstants.zero ==
                                                                                                                getJsonField(
                                                                                                                  listConcluidas2Item,
                                                                                                                  r'''$.subtasks_id''',
                                                                                                                )
                                                                                                            ? getJsonField(
                                                                                                                listConcluidas2Item,
                                                                                                                r'''$.projects_backlogs.description''',
                                                                                                              ).toString()
                                                                                                            : getJsonField(
                                                                                                                listConcluidas2Item,
                                                                                                                r'''$.subtasks.description''',
                                                                                                              ).toString(),
                                                                                                        '-',
                                                                                                      ),
                                                                                                      style: AppTheme.of(context).labelLarge.override(
                                                                                                            font: GoogleFonts.lexend(
                                                                                                              fontWeight: AppTheme.of(context).labelLarge.fontWeight,
                                                                                                              fontStyle: AppTheme.of(context).labelLarge.fontStyle,
                                                                                                            ),
                                                                                                            color: AppTheme.of(context).primaryText,
                                                                                                            letterSpacing: 0.0,
                                                                                                            fontWeight: AppTheme.of(context).labelLarge.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).labelLarge.fontStyle,
                                                                                                          ),
                                                                                                    )
                                                                                                  ],
                                                                                                  style: AppTheme.of(context).labelSmall.override(
                                                                                                        font: GoogleFonts.lexend(
                                                                                                          fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                          fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                        ),
                                                                                                        color: AppTheme.of(context).primaryText,
                                                                                                        letterSpacing: 0.0,
                                                                                                        fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                        fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                      ),
                                                                                                ),
                                                                                              ),
                                                                                            ),
                                                                                          ],
                                                                                        ),
                                                                                        if (AppConstants.zero !=
                                                                                            getJsonField(
                                                                                              listConcluidas2Item,
                                                                                              r'''$.projects_backlogs.tasks_template_id''',
                                                                                            ))
                                                                                          Padding(
                                                                                            padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 0.0, 0.0),
                                                                                            child: Wrap(
                                                                                              spacing: 2.0,
                                                                                              runSpacing: 8.0,
                                                                                              alignment: WrapAlignment.start,
                                                                                              crossAxisAlignment: WrapCrossAlignment.center,
                                                                                              direction: Axis.horizontal,
                                                                                              runAlignment: WrapAlignment.start,
                                                                                              verticalDirection: VerticalDirection.down,
                                                                                              clipBehavior: Clip.none,
                                                                                              children: [
                                                                                                Row(
                                                                                                  mainAxisSize: MainAxisSize.min,
                                                                                                  children: [
                                                                                                    Container(
                                                                                                      decoration: BoxDecoration(
                                                                                                        gradient: LinearGradient(
                                                                                                          colors: [
                                                                                                            AppTheme.of(context).secondaryBackground,
                                                                                                            AppTheme.of(context).primaryBackground
                                                                                                          ],
                                                                                                          stops: [0.0, 1.0],
                                                                                                          begin: AlignmentDirectional(-1.0, 0.0),
                                                                                                          end: AlignmentDirectional(1.0, 0),
                                                                                                        ),
                                                                                                        borderRadius: BorderRadius.circular(8.0),
                                                                                                        border: Border.all(
                                                                                                          color: AppTheme.of(context).alternate,
                                                                                                        ),
                                                                                                      ),
                                                                                                      child: Padding(
                                                                                                        padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                                        child: RichText(
                                                                                                          textScaler: MediaQuery.of(context).textScaler,
                                                                                                          text: TextSpan(
                                                                                                            children: [
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  'gzn4yamy' /* Campo  */,
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelSmall.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primaryText,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                    ),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: valueOrDefault<String>(
                                                                                                                  getJsonField(
                                                                                                                    listConcluidas2Item,
                                                                                                                    r'''$.projects_backlogs.fields.name''',
                                                                                                                  )?.toString(),
                                                                                                                  ' - ',
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelMedium.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primary,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                    ),
                                                                                                              )
                                                                                                            ],
                                                                                                            style: TextStyle(),
                                                                                                          ),
                                                                                                        ),
                                                                                                      ),
                                                                                                    ),
                                                                                                    Icon(
                                                                                                      Icons.keyboard_arrow_right_sharp,
                                                                                                      color: AppTheme.of(context).secondaryText,
                                                                                                      size: 16.0,
                                                                                                    ),
                                                                                                  ],
                                                                                                ),
                                                                                                Row(
                                                                                                  mainAxisSize: MainAxisSize.min,
                                                                                                  children: [
                                                                                                    Container(
                                                                                                      decoration: BoxDecoration(
                                                                                                        gradient: LinearGradient(
                                                                                                          colors: [
                                                                                                            AppTheme.of(context).secondaryBackground,
                                                                                                            AppTheme.of(context).primaryBackground
                                                                                                          ],
                                                                                                          stops: [0.0, 1.0],
                                                                                                          begin: AlignmentDirectional(-1.0, 0.0),
                                                                                                          end: AlignmentDirectional(1.0, 0),
                                                                                                        ),
                                                                                                        borderRadius: BorderRadius.circular(8.0),
                                                                                                        border: Border.all(
                                                                                                          color: AppTheme.of(context).alternate,
                                                                                                        ),
                                                                                                      ),
                                                                                                      child: Padding(
                                                                                                        padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                                        child: RichText(
                                                                                                          textScaler: MediaQuery.of(context).textScaler,
                                                                                                          text: TextSpan(
                                                                                                            children: [
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  'jg0intuu' /* Seção  */,
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelSmall.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primaryText,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                    ),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: valueOrDefault<String>(
                                                                                                                  getJsonField(
                                                                                                                    listConcluidas2Item,
                                                                                                                    r'''$.projects_backlogs.sections.section_number''',
                                                                                                                  )?.toString(),
                                                                                                                  ' - ',
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelMedium.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primary,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                    ),
                                                                                                              )
                                                                                                            ],
                                                                                                            style: TextStyle(),
                                                                                                          ),
                                                                                                        ),
                                                                                                      ),
                                                                                                    ),
                                                                                                    Icon(
                                                                                                      Icons.keyboard_arrow_right_sharp,
                                                                                                      color: AppTheme.of(context).secondaryText,
                                                                                                      size: 16.0,
                                                                                                    ),
                                                                                                  ],
                                                                                                ),
                                                                                                Row(
                                                                                                  mainAxisSize: MainAxisSize.min,
                                                                                                  children: [
                                                                                                    Container(
                                                                                                      decoration: BoxDecoration(
                                                                                                        gradient: LinearGradient(
                                                                                                          colors: [
                                                                                                            AppTheme.of(context).secondaryBackground,
                                                                                                            AppTheme.of(context).primaryBackground
                                                                                                          ],
                                                                                                          stops: [0.0, 1.0],
                                                                                                          begin: AlignmentDirectional(-1.0, 0.0),
                                                                                                          end: AlignmentDirectional(1.0, 0),
                                                                                                        ),
                                                                                                        borderRadius: BorderRadius.circular(8.0),
                                                                                                        border: Border.all(
                                                                                                          color: AppTheme.of(context).alternate,
                                                                                                        ),
                                                                                                      ),
                                                                                                      child: Padding(
                                                                                                        padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                                        child: RichText(
                                                                                                          textScaler: MediaQuery.of(context).textScaler,
                                                                                                          text: TextSpan(
                                                                                                            children: [
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  '3jsok6x0' /* Fileira  */,
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelSmall.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primaryText,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                    ),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: valueOrDefault<String>(
                                                                                                                  getJsonField(
                                                                                                                    listConcluidas2Item,
                                                                                                                    r'''$.projects_backlogs.rows.row_number''',
                                                                                                                  )?.toString(),
                                                                                                                  ' - ',
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelMedium.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primary,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                    ),
                                                                                                              )
                                                                                                            ],
                                                                                                            style: TextStyle(),
                                                                                                          ),
                                                                                                        ),
                                                                                                      ),
                                                                                                    ),
                                                                                                    Icon(
                                                                                                      Icons.keyboard_arrow_right_sharp,
                                                                                                      color: AppTheme.of(context).secondaryText,
                                                                                                      size: 16.0,
                                                                                                    ),
                                                                                                  ],
                                                                                                ),
                                                                                                Row(
                                                                                                  mainAxisSize: MainAxisSize.min,
                                                                                                  children: [
                                                                                                    Container(
                                                                                                      decoration: BoxDecoration(
                                                                                                        gradient: LinearGradient(
                                                                                                          colors: [
                                                                                                            AppTheme.of(context).secondaryBackground,
                                                                                                            AppTheme.of(context).primaryBackground
                                                                                                          ],
                                                                                                          stops: [0.0, 1.0],
                                                                                                          begin: AlignmentDirectional(-1.0, 0.0),
                                                                                                          end: AlignmentDirectional(1.0, 0),
                                                                                                        ),
                                                                                                        borderRadius: BorderRadius.circular(8.0),
                                                                                                        border: Border.all(
                                                                                                          color: AppTheme.of(context).alternate,
                                                                                                        ),
                                                                                                      ),
                                                                                                      child: Padding(
                                                                                                        padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                                        child: RichText(
                                                                                                          textScaler: MediaQuery.of(context).textScaler,
                                                                                                          text: TextSpan(
                                                                                                            children: [
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  'm9822d8k' /* Tracker  */,
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelSmall.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primaryText,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                    ),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: valueOrDefault<String>(
                                                                                                                  getJsonField(
                                                                                                                    listConcluidas2Item,
                                                                                                                    r'''$.projects_backlogs.trackers.stake_quantity''',
                                                                                                                  )?.toString(),
                                                                                                                  ' - ',
                                                                                                                ),
                                                                                                                style: AppTheme.of(context).labelMedium.override(
                                                                                                                      font: GoogleFonts.lexend(
                                                                                                                        fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                        fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                      ),
                                                                                                                      color: AppTheme.of(context).primary,
                                                                                                                      letterSpacing: 0.0,
                                                                                                                      fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                    ),
                                                                                                              )
                                                                                                            ],
                                                                                                            style: TextStyle(),
                                                                                                          ),
                                                                                                        ),
                                                                                                      ),
                                                                                                    ),
                                                                                                    Icon(
                                                                                                      Icons.keyboard_arrow_right_sharp,
                                                                                                      color: AppTheme.of(context).secondaryText,
                                                                                                      size: 16.0,
                                                                                                    ),
                                                                                                  ],
                                                                                                ),
                                                                                                Container(
                                                                                                  decoration: BoxDecoration(
                                                                                                    gradient: LinearGradient(
                                                                                                      colors: [
                                                                                                        AppTheme.of(context).secondaryBackground,
                                                                                                        AppTheme.of(context).primaryBackground
                                                                                                      ],
                                                                                                      stops: [0.0, 1.0],
                                                                                                      begin: AlignmentDirectional(-1.0, 0.0),
                                                                                                      end: AlignmentDirectional(1.0, 0),
                                                                                                    ),
                                                                                                    borderRadius: BorderRadius.circular(8.0),
                                                                                                    border: Border.all(
                                                                                                      color: AppTheme.of(context).alternate,
                                                                                                    ),
                                                                                                  ),
                                                                                                  child: Padding(
                                                                                                    padding: EdgeInsetsDirectional.fromSTEB(8.0, 4.0, 8.0, 4.0),
                                                                                                    child: RichText(
                                                                                                      textScaler: MediaQuery.of(context).textScaler,
                                                                                                      text: TextSpan(
                                                                                                        children: [
                                                                                                          TextSpan(
                                                                                                            text: AppLocalizations.of(context).getText(
                                                                                                              '2n4eoufd' /* Estacas  */,
                                                                                                            ),
                                                                                                            style: AppTheme.of(context).labelSmall.override(
                                                                                                                  font: GoogleFonts.lexend(
                                                                                                                    fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                    fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                  ),
                                                                                                                  color: AppTheme.of(context).primaryText,
                                                                                                                  letterSpacing: 0.0,
                                                                                                                  fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                                  fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                                ),
                                                                                                          ),
                                                                                                          TextSpan(
                                                                                                            text: valueOrDefault<String>(
                                                                                                              getJsonField(
                                                                                                                listConcluidas2Item,
                                                                                                                r'''$.projects_backlogs.rows_stakes.stakes.position''',
                                                                                                              )?.toString(),
                                                                                                              ' - ',
                                                                                                            ),
                                                                                                            style: AppTheme.of(context).labelMedium.override(
                                                                                                                  font: GoogleFonts.lexend(
                                                                                                                    fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                    fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                  ),
                                                                                                                  color: AppTheme.of(context).primary,
                                                                                                                  letterSpacing: 0.0,
                                                                                                                  fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                                                  fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                                                ),
                                                                                                          )
                                                                                                        ],
                                                                                                        style: TextStyle(),
                                                                                                      ),
                                                                                                    ),
                                                                                                  ),
                                                                                                ),
                                                                                              ],
                                                                                            ),
                                                                                          ),
                                                                                        Padding(
                                                                                          padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 0.0, 0.0),
                                                                                          child: Container(
                                                                                            decoration: BoxDecoration(
                                                                                              color: Color(0x1A028F58),
                                                                                              borderRadius: BorderRadius.circular(8.0),
                                                                                              border: Border.all(
                                                                                                color: AppTheme.of(context).success,
                                                                                              ),
                                                                                            ),
                                                                                            child: Row(
                                                                                              mainAxisSize: MainAxisSize.min,
                                                                                              children: [
                                                                                                Padding(
                                                                                                  padding: EdgeInsets.all(4.0),
                                                                                                  child: Text(
                                                                                                    AppLocalizations.of(context).getText(
                                                                                                      'opccof5a' /* Tarefa concluída */,
                                                                                                    ),
                                                                                                    style: AppTheme.of(context).labelSmall.override(
                                                                                                          font: GoogleFonts.lexend(
                                                                                                            fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                          ),
                                                                                                          color: AppTheme.of(context).success,
                                                                                                          letterSpacing: 0.0,
                                                                                                          fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                          fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                        ),
                                                                                                  ),
                                                                                                ),
                                                                                                Padding(
                                                                                                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 4.0, 4.0, 4.0),
                                                                                                  child: Text(
                                                                                                    dateTimeFormat(
                                                                                                      "EEEE d/M/y",
                                                                                                      DateTime.fromMillisecondsSinceEpoch(valueOrDefault<int>(
                                                                                                        getJsonField(
                                                                                                          listConcluidas2Item,
                                                                                                          r'''$.sprints.updated_at''',
                                                                                                        ),
                                                                                                        0,
                                                                                                      )),
                                                                                                      locale: AppLocalizations.of(context).languageCode,
                                                                                                    ),
                                                                                                    style: AppTheme.of(context).labelSmall.override(
                                                                                                          font: GoogleFonts.lexend(
                                                                                                            fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                          ),
                                                                                                          color: AppTheme.of(context).primaryText,
                                                                                                          letterSpacing: 0.0,
                                                                                                          fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                                          fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                                        ),
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
                                                                              ),
                                                                            ].divide(SizedBox(height: 8.0)),
                                                                          ),
                                                                        ),
                                                                      );
                                                                    },
                                                                  );
                                                                },
                                                              ),
                                                            ),
                                                            if (SprintsGroup
                                                                    .queryAllSprintsTasksRecordCall
                                                                    .nOconcluidasPageTotal(
                                                                  rdoQueryAllSprintsTasksRecordResponse
                                                                      .jsonBody,
                                                                )! >
                                                                _model.page)
                                                              Align(
                                                                alignment:
                                                                    AlignmentDirectional(
                                                                        -1.0,
                                                                        0.0),
                                                                child: Padding(
                                                                  padding: EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          0.0,
                                                                          12.0,
                                                                          0.0,
                                                                          0.0),
                                                                  child:
                                                                      AppButton(
                                                                    onPressed:
                                                                        () async {
                                                                      _model.perPage =
                                                                          _model.perPage +
                                                                              10;
                                                                      _model.page =
                                                                          _model.page +
                                                                              1;
                                                                      safeSetState(
                                                                          () {});
                                                                      safeSetState(
                                                                          () {
                                                                        _model
                                                                            .clearTasksSprintsCache();
                                                                        _model.apiRequestCompleted1 =
                                                                            false;
                                                                      });
                                                                      await _model
                                                                          .waitForApiRequestCompleted1();
                                                                      safeSetState(
                                                                          () {
                                                                        _model
                                                                            .clearRdoDiaCache();
                                                                        _model.apiRequestCompleted2 =
                                                                            false;
                                                                      });
                                                                      await _model
                                                                          .waitForApiRequestCompleted2();
                                                                    },
                                                                    text: AppLocalizations.of(
                                                                            context)
                                                                        .getText(
                                                                      'fsj0u288' /* Ver mais */,
                                                                    ),
                                                                    options:
                                                                        AppButtonOptions(
                                                                      height:
                                                                          30.0,
                                                                      padding: EdgeInsetsDirectional.fromSTEB(
                                                                          16.0,
                                                                          0.0,
                                                                          16.0,
                                                                          0.0),
                                                                      iconPadding: EdgeInsetsDirectional.fromSTEB(
                                                                          0.0,
                                                                          0.0,
                                                                          0.0,
                                                                          0.0),
                                                                      color: AppTheme.of(
                                                                              context)
                                                                          .secondary,
                                                                      textStyle: AppTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.lexend(
                                                                              fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                              fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                            ),
                                                                            color:
                                                                                AppTheme.of(context).primary,
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                AppTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                AppTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                      elevation:
                                                                          0.0,
                                                                      borderSide:
                                                                          BorderSide(
                                                                        color: AppTheme.of(context)
                                                                            .primary,
                                                                      ),
                                                                      borderRadius:
                                                                          BorderRadius.circular(
                                                                              8.0),
                                                                    ),
                                                                  ),
                                                                ),
                                                              ),
                                                            if (!(SprintsGroup
                                                                            .queryAllSprintsTasksRecordCall
                                                                            .yESconcluidas(
                                                                          rdoQueryAllSprintsTasksRecordResponse
                                                                              .jsonBody,
                                                                        ) !=
                                                                        null &&
                                                                    (SprintsGroup
                                                                            .queryAllSprintsTasksRecordCall
                                                                            .yESconcluidas(
                                                                      rdoQueryAllSprintsTasksRecordResponse
                                                                          .jsonBody,
                                                                    ))!
                                                                        .isNotEmpty) &&
                                                                !(SprintsGroup
                                                                            .queryAllSprintsTasksRecordCall
                                                                            .nOconcluidas(
                                                                          rdoQueryAllSprintsTasksRecordResponse
                                                                              .jsonBody,
                                                                        ) !=
                                                                        null &&
                                                                    (SprintsGroup
                                                                            .queryAllSprintsTasksRecordCall
                                                                            .nOconcluidas(
                                                                      rdoQueryAllSprintsTasksRecordResponse
                                                                          .jsonBody,
                                                                    ))!
                                                                        .isNotEmpty))
                                                              wrapWithModel(
                                                                model: _model
                                                                    .emptyModel2,
                                                                updateCallback: () =>
                                                                    safeSetState(
                                                                        () {}),
                                                                child:
                                                                    EmptyWidget(),
                                                              ),
                                                          ],
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          );
                                        },
                                      ),
                                    ),
                                      ],
                                    ),
                              ),
                            ],
                          ),
                        ),
                        Builder(
                          builder: (context) => Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                0.0, 8.0, 0.0, 0.0),
                            child: AppButton(
                              onPressed: _model.isFinalizedToday ? () async {
                                await showDialog(
                                  context: context,
                                  builder: (dialogContext) {
                                    return Dialog(
                                      elevation: 0,
                                      insetPadding: EdgeInsets.zero,
                                      backgroundColor: Colors.transparent,
                                      alignment: AlignmentDirectional(0.0, 0.0)
                                          .resolve(Directionality.of(context)),
                                      child: GestureDetector(
                                        onTap: () {
                                          FocusScope.of(dialogContext).unfocus();
                                          FocusManager.instance.primaryFocus?.unfocus();
                                        },
                                        child: ModalInfoWidget(
                                          title: AppLocalizations.of(context).getVariableText(
                                            ptText: 'Dia já finalizado',
                                            esText: 'Día ya finalizado',
                                            enText: 'Day already finished',
                                          ),
                                          description: AppLocalizations.of(context).getVariableText(
                                            ptText: 'Você já finalizou o dia de serviço hoje. O botão estará disponível novamente amanhã.',
                                            esText: 'Ya finalizaste el día de servicio hoy. El botón estará disponible nuevamente mañana.',
                                            enText: 'You have already finished the service day today. The button will be available again tomorrow.',
                                          ),
                                        ),
                                      ),
                                    );
                                  },
                                );
                              } : () async {
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
                                      child: GestureDetector(
                                        onTap: () {
                                          FocusScope.of(dialogContext)
                                              .unfocus();
                                          FocusManager.instance.primaryFocus
                                              ?.unfocus();
                                        },
                                        child: ConfirmdialogRDOWidget(
                                          listaTasks: SprintsGroup
                                              .queryAllSprintsTasksRecordCall
                                              .nOconcluidas(
                                            rdoQueryAllSprintsTasksRecordResponse
                                                .jsonBody,
                                          ),
                                          action: () async {
                                            // Atualizar estado após finalização bem-sucedida
                                            final rdoFinalizationDao = RdoFinalizationDao();
                                            _model.isFinalizedToday = await rdoFinalizationDao.wasFinalizedToday();
                                            safeSetState(() {});
                                          },
                                        ),
                                      ),
                                    );
                                  },
                                );
                              },
                              text: AppLocalizations.of(context).getText(
                                'j0hup99e' /* Finalizar dia de serviço */,
                              ),
                              options: AppButtonOptions(
                                width: MediaQuery.sizeOf(context).width * 1.0,
                                height: 48.0,
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    16.0, 0.0, 16.0, 0.0),
                                iconPadding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 0.0, 0.0, 0.0),
                                color: _model.isFinalizedToday
                                    ? AppTheme.of(context).alternate
                                    : AppTheme.of(context).primary,
                                textStyle: AppTheme.of(context)
                                    .labelMedium
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: AppTheme.of(context)
                                            .labelMedium
                                            .fontWeight,
                                        fontStyle: AppTheme.of(context)
                                            .labelMedium
                                            .fontStyle,
                                      ),
                                      color: _model.isFinalizedToday
                                          ? AppTheme.of(context).secondaryText
                                          : AppTheme.of(context).info,
                                      fontSize: 14.0,
                                      letterSpacing: 0.0,
                                      fontWeight: AppTheme.of(context)
                                          .labelMedium
                                          .fontWeight,
                                      fontStyle: AppTheme.of(context)
                                          .labelMedium
                                          .fontStyle,
                                    ),
                                elevation: 0.0,
                                borderRadius: BorderRadius.circular(14.0),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
  }
}
