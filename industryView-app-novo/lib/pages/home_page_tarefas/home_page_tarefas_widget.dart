import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/comment_insp_widget.dart';
import '/components/confirmdialog_widget.dart';
import '/components/empty_widget.dart';
import '/components/loading_copy_widget.dart';
import '/components/logout_widget.dart';
import '/components/modal_info_widget.dart';
import '/components/modal_sucess_qrcode_widget.dart';
import '/components/nav_bar_widget.dart';
import '/components/offline_banner_widget.dart';
import '/core/widgets/app_tab_bar.dart';
import '/core/widgets/app_drop_down.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import '/core/widgets/form_field_controller.dart';
import '/services/network_service.dart';
import '/services/rdo_prefetch_service.dart';
import 'dart:ui';
import '/core/actions/index.dart' as actions;
import '/core/utils/custom_functions.dart' as functions;
import '/index.dart';
import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:flutter_barcode_scanner/flutter_barcode_scanner.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'home_page_tarefas_model.dart';
export 'home_page_tarefas_model.dart';

class HomePageTarefasWidget extends StatefulWidget {
  const HomePageTarefasWidget({super.key});

  static String routeName = 'HomePage-Tarefas';
  static String routePath = '/homePageTarefas';

  @override
  State<HomePageTarefasWidget> createState() => _HomePageTarefasWidgetState();
}

class _HomePageTarefasWidgetState extends State<HomePageTarefasWidget>
    with TickerProviderStateMixin {
  late HomePageTarefasModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  bool _isOfflineMaskedTask(dynamic item) {
    if (NetworkService.instance.isConnected) {
      return false;
    }
    final taskId = castToType<int>(getJsonField(item, r'''$.id'''));
    if (taskId == null) {
      return false;
    }
    return AppState().offlineMaskedTasksIds.contains(taskId);
  }

  int _lastConnectionRestoredTrigger = 0;
  int _lastTasksRefreshTrigger = 0;

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => HomePageTarefasModel());
    _lastConnectionRestoredTrigger = AppState().connectionRestoredTrigger;
    _lastTasksRefreshTrigger = AppState().tasksRefreshTrigger;

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      AppState().filterSprint = false;
      AppState().filterSprint01 = FiltersStruct();
      AppState().taskslist = [];
      AppState().update(() {});
      _model.drop = 0;
      _model.filtros = false;
      _model.semSucesso = false;
      safeSetState(() {});
      final isOnline = await NetworkService.instance.checkConnection();
      if (!isOnline) {
        AppState().loading = false;
        safeSetState(() {});
        return;
      }
      // Pré-carregar RDO em background ao entrar na Home (Tarefas da sprint + escala do dia)
      // assim a tela de RDO já vem preenchida e, se ficar offline, traz as tarefas concluídas
      Future.microtask(() async {
        try {
          await RdoPrefetchService.instance.prefetchRdoData();
        } catch (_) {}
      });

      _model.validTokenCopy = await AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall
          .call(
        bearerAuth: currentAuthenticationToken,
      );

      if ((_model.validTokenCopy?.succeeded ?? true)) {
        // Só redireciona para QR code se é firstLogin E o usuário ainda
        // não criou a escala nesta sessão (sheduleId == 0)
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
      }
    });

    _model.textController ??= TextEditingController();
    _model.textFieldFocusNode ??= FocusNode();

    _model.tabBarController = TabController(
      vsync: this,
      length: 2,
      initialIndex: 0,
    )..addListener(() => safeSetState(() {}));

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
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
          _model.clearHomePageCache();
          safeSetState(() {});
        }
      });
    }

    // Recarregar lista de tarefas quando status de alguma tarefa muda
    final tr = AppState().tasksRefreshTrigger;
    if (tr != _lastTasksRefreshTrigger) {
      _lastTasksRefreshTrigger = tr;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _model.clearHomePageCache();
          safeSetState(() {});
        }
      });
    }

    return FutureBuilder<ApiCallResponse>(
      future: _model
          .homePage(
        requestFn: () => SprintsGroup.queryAllSprintsTasksRecordCall.call(
          projectsId: AppState().user.projectId,
          teamsId: AppState().user.teamsId,
          token: currentAuthenticationToken,
          search: _model.textController.text,
          page: _model.page,
          perPage: _model.perPage,
          sprintsId: AppState().user.sprint.id,
          equipamentsTypesId: _model.drop,
        ),
      )
          .then((result) {
        _model.apiRequestCompleted = true;
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
        final homePageTarefasQueryAllSprintsTasksRecordResponse =
            snapshot.data!;

        return GestureDetector(
          onTap: () {
            FocusScope.of(context).unfocus();
            FocusManager.instance.primaryFocus?.unfocus();
          },
          child: PopScope(
            canPop: false,
            child: Scaffold(
              key: scaffoldKey,
              backgroundColor: const Color(0xFFF5F7FA),
              appBar: PreferredSize(
                preferredSize: Size.fromHeight(85.0),
                child: AppBar(
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                  automaticallyImplyLeading: false,
                  systemOverlayStyle: const SystemUiOverlayStyle(
                    statusBarColor: Colors.transparent,
                    statusBarIconBrightness: Brightness.light,
                    statusBarBrightness: Brightness.dark,
                  ),
                  actions: [],
                  flexibleSpace: Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF011741), Color(0xFF0A2F6E)],
                      ),
                    ),
                    child: FlexibleSpaceBar(
                    title: Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 4.0),
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                              Builder(
                                builder: (context) => Padding(
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      0.0, 0.0, 12.0, 0.0),
                                  child: InkWell(
                                    splashColor: Colors.transparent,
                                    focusColor: Colors.transparent,
                                    hoverColor: Colors.transparent,
                                    highlightColor: Colors.transparent,
                                    onTap: () async {
                                      showDialog(
                                        barrierColor: Color(0x80000000),
                                        context: context,
                                        builder: (dialogContext) {
                                          return Dialog(
                                            elevation: 0,
                                            insetPadding: EdgeInsets.zero,
                                            backgroundColor: Colors.transparent,
                                            alignment: AlignmentDirectional(
                                                    -1.0, -1.0)
                                                .resolve(
                                                    Directionality.of(context)),
                                            child: GestureDetector(
                                              onTap: () {
                                                FocusScope.of(dialogContext)
                                                    .unfocus();
                                                FocusManager
                                                    .instance.primaryFocus
                                                    ?.unfocus();
                                              },
                                              child: LogoutWidget(),
                                            ),
                                          );
                                        },
                                      );
                                    },
                                    child: Container(
                                      width: 44.0,
                                      height: 44.0,
                                      decoration: BoxDecoration(
                                        color: Colors.white.withOpacity(0.15),
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: Colors.white.withOpacity(0.4),
                                          width: 2.0,
                                        ),
                                      ),
                                      child: ClipRRect(
                                        borderRadius:
                                            BorderRadius.circular(100.0),
                                        child: CachedNetworkImage(
                                          imageUrl: valueOrDefault<String>(
                                            AppState().user.image,
                                            'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg',
                                          ),
                                          width: 48.0,
                                          height: 48.0,
                                          fit: BoxFit.cover,
                                          placeholder: (context, url) =>
                                              Container(
                                            color: AppTheme.of(context)
                                                .secondaryBackground,
                                          ),
                                          errorWidget: (context, url, error) =>
                                              Container(
                                            color: AppTheme.of(context)
                                                .secondaryBackground,
                                            child: Icon(
                                              Icons.person,
                                              color:
                                                  AppTheme.of(context)
                                                      .secondaryText,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    AppLocalizations.of(context).getText(
                                      'ucytgbzo' /* Olá */,
                                    ),
                                    style: GoogleFonts.lexend(
                                      fontSize: 12.0,
                                      fontWeight: FontWeight.w400,
                                      color: Colors.white.withOpacity(0.75),
                                      letterSpacing: 0.2,
                                    ),
                                  ),
                                  Text(
                                    () {
                                      final fullName = valueOrDefault<String>(
                                        AppState().user.name,
                                        ' - ',
                                      );
                                      final parts = fullName.trim().split(' ');
                                      if (parts.length <= 2) return fullName;
                                      return '${parts.first} ${parts.last}';
                                    }(),
                                    overflow: TextOverflow.ellipsis,
                                    maxLines: 1,
                                    style: GoogleFonts.lexend(
                                      fontSize: 15.0,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                      letterSpacing: 0.1,
                                    ),
                                  ),
                                ],
                              ),
                              ],
                            ),
                          ),
                          Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Builder(
                                  builder: (context) => AppIconButton(
                                    borderRadius: 10.0,
                                    buttonSize: 36.0,
                                    fillColor: Colors.white.withOpacity(0.15),
                                    icon: const Icon(
                                      Icons.qr_code_rounded,
                                      color: Colors.white,
                                      size: 18.0,
                                    ),
                                    onPressed: () async {
                                      var _shouldSetState = false;
                                      _model.returnQrcode =
                                          await FlutterBarcodeScanner.scanBarcode(
                                        '#C62828', // scanning line color
                                        AppLocalizations.of(context).getText(
                                          'jwhugfqw' /* Cancelar */,
                                        ), // cancel button text
                                        true, // whether to show the flash icon
                                        ScanMode.QR,
                                      );

                                      _shouldSetState = true;
                                      if (_model.returnQrcode == '-1') {
                                        if (_shouldSetState) safeSetState(() {});
                                        return;
                                      }
                                      _model.apiQrcode = await ReportsGroup
                                          .qrcodeReaderCall
                                          .call(
                                        qrcode: _model.returnQrcode!,
                                        token: currentAuthenticationToken,
                                      );

                                      _shouldSetState = true;
                                      final qrUserId = ReportsGroup.qrcodeReaderCall
                                          .userId((_model.apiQrcode?.jsonBody ?? ''));
                                      if (qrUserId != null) {
                                        await showDialog(
                                          context: context,
                                          builder: (dialogContext) {
                                            return Dialog(
                                              elevation: 0,
                                              insetPadding: EdgeInsets.zero,
                                              backgroundColor: Colors.transparent,
                                              alignment: AlignmentDirectional(
                                                      0.0, 0.0)
                                                  .resolve(
                                                      Directionality.of(context)),
                                              child: GestureDetector(
                                                onTap: () {
                                                  FocusScope.of(dialogContext)
                                                      .unfocus();
                                                  FocusManager
                                                      .instance.primaryFocus
                                                      ?.unfocus();
                                                },
                                                child: ModalSucessQrcodeWidget(
                                                  text:
                                                      'QR Code do funcionário lido com sucesso.',
                                                ),
                                              ),
                                            );
                                          },
                                        );
                                      } else {
                                        await showDialog(
                                          context: context,
                                          builder: (dialogContext) {
                                            return Dialog(
                                              elevation: 0,
                                              insetPadding: EdgeInsets.zero,
                                              backgroundColor: Colors.transparent,
                                              alignment: AlignmentDirectional(
                                                      0.0, 0.0)
                                                  .resolve(
                                                      Directionality.of(context)),
                                              child: GestureDetector(
                                                onTap: () {
                                                  FocusScope.of(dialogContext)
                                                      .unfocus();
                                                  FocusManager
                                                      .instance.primaryFocus
                                                      ?.unfocus();
                                                },
                                                child: ModalInfoWidget(
                                                  title: 'Erro',
                                                  description:
                                                      'Esse usuário não tem acesso ou não está cadastrado.',
                                                ),
                                              ),
                                            );
                                          },
                                        );

                                        if (_shouldSetState) safeSetState(() {});
                                        return;
                                      }

                                      if (_shouldSetState) safeSetState(() {});
                                    },
                                  ),
                                ),
                                const SizedBox(width: 6.0),
                                AppDropDown<String>(
                                    controller: _model.dropDownValueController2 ??=
                                        FormFieldController<String>(
                                      _model.dropDownValue2 ??=
                                          AppLocalizations.of(context).languageCode,
                                    ),
                                    options: List<String>.from(['pt', 'en', 'es']),
                                    optionLabels: const ['PT', 'EN', 'ES'],
                                    onChanged: (val) async {
                                      if (val == null) {
                                        return;
                                      }
                                      safeSetState(
                                          () => _model.dropDownValue2 = val);
                                      await AppLocalizations.storeLocale(val);
                                      setAppLanguage(context, val);
                                    },
                                    width: 70.0,
                                    height: 36.0,
                                    textStyle: GoogleFonts.lexend(
                                      fontSize: 12.0,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                    ),
                                    hintText: 'PT',
                                    icon: const Icon(
                                      Icons.keyboard_arrow_down_rounded,
                                      color: Colors.white70,
                                      size: 18.0,
                                    ),
                                    fillColor: Colors.white.withOpacity(0.15),
                                    elevation: 0.0,
                                    borderColor: Colors.white.withOpacity(0.25),
                                    borderWidth: 1.0,
                                    borderRadius: 10.0,
                                    margin: EdgeInsetsDirectional.fromSTEB(
                                        4.0, 0.0, 0.0, 0.0),
                                    hidesUnderline: true,
                                    isOverButton: false,
                                    isSearchable: false,
                                    isMultiSelect: false,
                                  ),
                              ],
                            ),
                        ],
                      ),
                    ),
                    centerTitle: true,
                    expandedTitleScale: 1.0,
                  ),
                  ),
                ),
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
                          page: 1,
                          totalSprints:
                              SprintsGroup.queryAllSprintsTasksRecordCall
                                      .nOandamento(
                                        homePageTarefasQueryAllSprintsTasksRecordResponse
                                            .jsonBody,
                                      )!
                                      .length +
                                  SprintsGroup.queryAllSprintsTasksRecordCall
                                      .nOconcluidas(
                                        homePageTarefasQueryAllSprintsTasksRecordResponse
                                            .jsonBody,
                                      )!
                                      .length,
                          concluidasSprints:
                              SprintsGroup.queryAllSprintsTasksRecordCall
                                  .nOconcluidas(
                                    homePageTarefasQueryAllSprintsTasksRecordResponse
                                        .jsonBody,
                                  )
                                  ?.length,
                        ),
                      ),
                    ),
                    Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(16.0, 8.0, 16.0, 16.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 0.0, 50.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const OfflineBannerWidget(),
                                  // Nome do projeto + botão trocar
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 10.0),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      crossAxisAlignment: CrossAxisAlignment.center,
                                      children: [
                                        Expanded(
                                          child: Row(
                                            children: [
                                              Icon(
                                                Icons.business_rounded,
                                                color: AppTheme.of(context).primary,
                                                size: 18.0,
                                              ),
                                              const SizedBox(width: 6),
                                              Flexible(
                                                child: Text(
                                                  AppState().user.projectName.isNotEmpty
                                                      ? AppState().user.projectName
                                                      : AppLocalizations.of(context).getVariableText(
                                                          ptText: 'Projeto',
                                                          esText: 'Proyecto',
                                                          enText: 'Project',
                                                        ),
                                                  style: GoogleFonts.lexend(
                                                    fontSize: 14.0,
                                                    fontWeight: FontWeight.w600,
                                                    color: AppTheme.of(context).primaryText,
                                                    letterSpacing: 0.0,
                                                  ),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        InkWell(
                                          onTap: () async {
                                            // Limpar sheduleId para forçar novo fluxo
                                            AppState().updateUserStruct(
                                              (e) => e
                                                ..sheduleId = null
                                                ..projectId = null
                                                ..teamsId = null
                                                ..sprint = SprintsStruct(),
                                            );
                                            AppState().update(() {});
                                            if (!context.mounted) return;
                                            context.goNamedAuth(
                                              PageCheckQrcodeWidget.routeName,
                                              context.mounted,
                                              extra: <String, dynamic>{
                                                kTransitionInfoKey: TransitionInfo(
                                                  hasTransition: true,
                                                  transitionType: PageTransitionType.fade,
                                                ),
                                              },
                                            );
                                          },
                                          borderRadius: BorderRadius.circular(8),
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  Icons.swap_horiz_rounded,
                                                  color: AppTheme.of(context).primary,
                                                  size: 16.0,
                                                ),
                                                const SizedBox(width: 4),
                                                Text(
                                                  AppLocalizations.of(context).getVariableText(
                                                    ptText: 'Trocar',
                                                    esText: 'Cambiar',
                                                    enText: 'Switch',
                                                  ),
                                                  style: GoogleFonts.lexend(
                                                    fontSize: 12.0,
                                                    fontWeight: FontWeight.w500,
                                                    color: AppTheme.of(context).primary,
                                                    letterSpacing: 0.0,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.all(14.0),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(14),
                                      border: Border.all(
                                        color: const Color(0xFF105DFB).withOpacity(0.12),
                                      ),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.05),
                                          blurRadius: 10,
                                          offset: const Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Header row: ícone + título + botão refresh
                                      Row(
                                        mainAxisSize: MainAxisSize.max,
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        crossAxisAlignment: CrossAxisAlignment.center,
                                        children: [
                                          Row(
                                            mainAxisSize: MainAxisSize.min,
                                            crossAxisAlignment: CrossAxisAlignment.center,
                                            children: [
                                              Container(
                                                width: 32,
                                                height: 32,
                                                decoration: BoxDecoration(
                                                  color: AppTheme.of(context).primary.withOpacity(0.1),
                                                  borderRadius: BorderRadius.circular(8),
                                                ),
                                                child: Icon(
                                                  Icons.rocket_launch_rounded,
                                                  color: AppTheme.of(context).primary,
                                                  size: 16.0,
                                                ),
                                              ),
                                              const SizedBox(width: 10),
                                              Text(
                                                AppLocalizations.of(context)
                                                    .getText(
                                                  '5tht4dc1' /* Tarefas da sprint */,
                                                ),
                                                style: GoogleFonts.lexend(
                                                  fontSize: 14.0,
                                                  fontWeight: FontWeight.w600,
                                                  color: AppTheme.of(context).primaryText,
                                                  letterSpacing: 0.1,
                                                ),
                                              ),
                                            ],
                                          ),
                                          AppIconButton(
                                            borderColor:
                                                AppTheme.of(context)
                                                    .alternate,
                                            borderRadius: 8.0,
                                            buttonSize: 30.0,
                                            fillColor:
                                                const Color(0xFFF5F7FA),
                                            icon: Icon(
                                              Icons.refresh_rounded,
                                              color:
                                                  AppTheme.of(context)
                                                      .primary,
                                              size: 15.0,
                                            ),
                                            onPressed: () async {
                                              safeSetState(() {
                                                _model.clearHomePageCache();
                                                _model.apiRequestCompleted =
                                                    false;
                                              });
                                              await _model
                                                  .waitForApiRequestCompleted();
                                            },
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      // Título da sprint
                                      Text(
                                        valueOrDefault<String>(
                                          AppState().user.sprint.title,
                                          ' - ',
                                        ),
                                        style: GoogleFonts.lexend(
                                          fontSize: 15.0,
                                          fontWeight: FontWeight.w700,
                                          color: AppTheme.of(context).primaryText,
                                          letterSpacing: 0.0,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      // Datas com ícone
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        crossAxisAlignment: CrossAxisAlignment.center,
                                        children: [
                                          Icon(
                                            Icons.calendar_today_rounded,
                                            size: 13,
                                            color: AppTheme.of(context).primary,
                                          ),
                                          const SizedBox(width: 5),
                                          Text(
                                            '${valueOrDefault<String>(
                                              dateTimeFormat(
                                                "d/M/y",
                                                DateTime.fromMillisecondsSinceEpoch(
                                                    AppState().user.sprint.startDate),
                                                locale: AppLocalizations.of(context).languageCode,
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
                                                    AppState().user.sprint.endDate),
                                                locale: AppLocalizations.of(context).languageCode,
                                              ),
                                              '0',
                                            )}',
                                            style: GoogleFonts.lexend(
                                              fontSize: 12.0,
                                              fontWeight: FontWeight.w500,
                                              color: AppTheme.of(context).primary,
                                              letterSpacing: 0.0,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      // Barra de progresso visual
                                      Builder(
                                        builder: (context) {
                                          final totalTasks = (SprintsGroup
                                                  .queryAllSprintsTasksRecordCall
                                                  .nOandamento(
                                                    homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                  )?.length ?? 0) +
                                              (SprintsGroup
                                                  .queryAllSprintsTasksRecordCall
                                                  .nOconcluidas(
                                                    homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                  )?.length ?? 0);
                                          final doneTasks = SprintsGroup
                                                  .queryAllSprintsTasksRecordCall
                                                  .nOconcluidas(
                                                    homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                  )?.length ?? 0;
                                          final progress = totalTasks > 0 ? doneTasks / totalTasks : 0.0;
                                          return Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: [
                                                  Text(
                                                    AppLocalizations.of(context).getVariableText(
                                                      ptText: 'Progresso',
                                                      esText: 'Progreso',
                                                      enText: 'Progress',
                                                    ),
                                                    style: GoogleFonts.lexend(
                                                      fontSize: 11.0,
                                                      fontWeight: FontWeight.w500,
                                                      color: AppTheme.of(context).secondaryText,
                                                    ),
                                                  ),
                                                  Text(
                                                    '$doneTasks / $totalTasks',
                                                    style: GoogleFonts.lexend(
                                                      fontSize: 11.0,
                                                      fontWeight: FontWeight.w600,
                                                      color: AppTheme.of(context).primary,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              const SizedBox(height: 6),
                                              ClipRRect(
                                                borderRadius: BorderRadius.circular(6),
                                                child: LinearProgressIndicator(
                                                  value: progress,
                                                  backgroundColor: AppTheme.of(context).alternate.withOpacity(0.4),
                                                  valueColor: AlwaysStoppedAnimation<Color>(
                                                    AppTheme.of(context).primary,
                                                  ),
                                                  minHeight: 6,
                                                ),
                                              ),
                                            ],
                                          );
                                        },
                                      ),
                                    ],
                                  ),
                                  ),
                                  Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 10.0, 0.0, 0.0),
                                    child: InkWell(
                                      splashColor: Colors.transparent,
                                      focusColor: Colors.transparent,
                                      hoverColor: Colors.transparent,
                                      highlightColor: Colors.transparent,
                                      borderRadius: BorderRadius.circular(10),
                                      onTap: () async {
                                        _model.filtros = !_model.filtros;
                                        safeSetState(() {});
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12.0,
                                          vertical: 8.0,
                                        ),
                                        decoration: BoxDecoration(
                                          color: _model.filtros
                                              ? AppTheme.of(context).primary.withOpacity(0.08)
                                              : Colors.white,
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(
                                            color: _model.filtros
                                                ? AppTheme.of(context).primary.withOpacity(0.3)
                                                : AppTheme.of(context).alternate,
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.max,
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  Icons.tune_rounded,
                                                  color: _model.filtros
                                                      ? AppTheme.of(context).primary
                                                      : AppTheme.of(context).secondaryText,
                                                  size: 16.0,
                                                ),
                                                const SizedBox(width: 8),
                                                Text(
                                                  AppLocalizations.of(context).getText(
                                                    '8997bn6w' /* Filtros */,
                                                  ),
                                                  style: GoogleFonts.lexend(
                                                    fontSize: 13.0,
                                                    fontWeight: FontWeight.w500,
                                                    color: _model.filtros
                                                        ? AppTheme.of(context).primary
                                                        : AppTheme.of(context).primaryText,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            AnimatedRotation(
                                              turns: _model.filtros ? 0.5 : 0.0,
                                              duration: const Duration(milliseconds: 200),
                                              child: Icon(
                                                Icons.keyboard_arrow_down_rounded,
                                                color: _model.filtros
                                                    ? AppTheme.of(context).primary
                                                    : AppTheme.of(context).secondaryText,
                                                size: 20.0,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                  AnimatedSize(
                                    duration: const Duration(milliseconds: 250),
                                    curve: Curves.easeInOut,
                                    child: !_model.filtros
                                        ? const SizedBox.shrink()
                                        : Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          0.0, 8.0, 0.0, 8.0),
                                      child: Column(
                                        mainAxisSize: MainAxisSize.max,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Container(
                                            width: double.infinity,
                                            child: TextFormField(
                                                    controller:
                                                        _model.textController,
                                                    focusNode: _model
                                                        .textFieldFocusNode,
                                                    onFieldSubmitted:
                                                        (_) async {
                                                      safeSetState(() {
                                                        _model
                                                            .clearHomePageCache();
                                                        _model.apiRequestCompleted =
                                                            false;
                                                      });
                                                      await _model
                                                          .waitForApiRequestCompleted();
                                                    },
                                                    autofocus: false,
                                                    obscureText: false,
                                                    decoration: InputDecoration(
                                                      labelText:
                                                          AppLocalizations.of(
                                                                  context)
                                                              .getText(
                                                        'ttsaqd5y' /* Procurar por código ou descriç... */,
                                                      ),
                                                      labelStyle:
                                                          AppTheme.of(
                                                                  context)
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
                                                      hintStyle:
                                                          AppTheme.of(
                                                                  context)
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
                                                      enabledBorder:
                                                          OutlineInputBorder(
                                                        borderSide: BorderSide(
                                                          color: AppTheme
                                                                  .of(context)
                                                              .alternate,
                                                          width: 1.0,
                                                        ),
                                                        borderRadius:
                                                            BorderRadius.circular(14.0),
                                                      ),
                                                      focusedBorder:
                                                          OutlineInputBorder(
                                                        borderSide: BorderSide(
                                                          color: AppTheme
                                                                  .of(context)
                                                              .primary,
                                                          width: 1.0,
                                                        ),
                                                        borderRadius:
                                                            BorderRadius.circular(14.0),
                                                      ),
                                                      errorBorder:
                                                          OutlineInputBorder(
                                                        borderSide: BorderSide(
                                                          color: AppTheme
                                                                  .of(context)
                                                              .error,
                                                          width: 1.0,
                                                        ),
                                                        borderRadius:
                                                            BorderRadius.circular(14.0),
                                                      ),
                                                      focusedErrorBorder:
                                                          OutlineInputBorder(
                                                        borderSide: BorderSide(
                                                          color: AppTheme
                                                                  .of(context)
                                                              .error,
                                                          width: 1.0,
                                                        ),
                                                        borderRadius:
                                                            BorderRadius.circular(14.0),
                                                      ),
                                                      filled: true,
                                                      fillColor:
                                                          AppTheme.of(
                                                                  context)
                                                              .primaryBackground,
                                                      contentPadding:
                                                          EdgeInsetsDirectional
                                                              .fromSTEB(
                                                                  20.0,
                                                                  0.0,
                                                                  0.0,
                                                                  0.0),
                                                      prefixIcon: Icon(
                                                        Icons.search_sharp,
                                                      ),
                                                    ),
                                                    style: AppTheme.of(
                                                            context)
                                                        .bodySmall
                                                        .override(
                                                          font: GoogleFonts
                                                              .lexend(
                                                            fontWeight:
                                                                FontWeight.w500,
                                                            fontStyle:
                                                                AppTheme.of(
                                                                        context)
                                                                    .bodySmall
                                                                    .fontStyle,
                                                          ),
                                                          letterSpacing: 0.0,
                                                          fontWeight:
                                                              FontWeight.w500,
                                                          fontStyle:
                                                              AppTheme.of(
                                                                      context)
                                                                  .bodySmall
                                                                  .fontStyle,
                                                        ),
                                                    cursorColor:
                                                        AppTheme.of(
                                                                context)
                                                            .primary,
                                                    validator: _model
                                                        .textControllerValidator
                                                        .asValidator(context),
                                                  ),
                                                ),
                                          SizedBox(height: 10.0),
                                          InkWell(
                                            splashColor: Colors.transparent,
                                            focusColor: Colors.transparent,
                                            hoverColor: Colors.transparent,
                                            highlightColor: Colors.transparent,
                                            borderRadius: BorderRadius.circular(14.0),
                                            onTap: () async {
                                              _model.semSucesso =
                                                  !_model.semSucesso;
                                              safeSetState(() {});
                                            },
                                            child: Container(
                                              height: 40.0,
                                              padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                                              decoration: BoxDecoration(
                                                color: !_model.semSucesso
                                                    ? AppTheme.of(context).primaryBackground
                                                    : AppTheme.of(context).status01,
                                                borderRadius: BorderRadius.circular(14.0),
                                                border: Border.all(
                                                  color: !_model.semSucesso
                                                      ? AppTheme.of(context).alternate
                                                      : AppTheme.of(context).error,
                                                ),
                                              ),
                                              alignment: AlignmentDirectional(0.0, 0.0),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  Icon(
                                                    !_model.semSucesso
                                                        ? Icons.filter_list_rounded
                                                        : Icons.filter_list_off_rounded,
                                                    size: 16.0,
                                                    color: !_model.semSucesso
                                                        ? AppTheme.of(context).secondaryText
                                                        : AppTheme.of(context).error,
                                                  ),
                                                  SizedBox(width: 6.0),
                                                  Text(
                                                    AppLocalizations.of(context).getText(
                                                      'ln1ovg5a' /* Tarefa "Sem sucesso" */,
                                                    ),
                                                    style: AppTheme.of(context)
                                                        .bodySmall
                                                        .override(
                                                          font: GoogleFonts.lexend(
                                                            fontWeight: FontWeight.w500,
                                                            fontStyle: AppTheme.of(context).bodySmall.fontStyle,
                                                          ),
                                                          color: !_model.semSucesso
                                                              ? AppTheme.of(context).primaryText
                                                              : AppTheme.of(context).error,
                                                          letterSpacing: 0.0,
                                                          fontWeight: FontWeight.w500,
                                                          fontStyle: AppTheme.of(context).bodySmall.fontStyle,
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
                                  Expanded(
                                    child: Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          0.0, 0.0, 0.0, 16.0),
                                      child: Container(
                                        decoration: BoxDecoration(),
                                        child: Column(
                                          mainAxisSize: MainAxisSize.max,
                                          children: [
                                            if (_model.tabBarCurrentIndex == 0)
                                              Padding(
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        0.0, 8.0, 0.0, 8.0),
                                                child: Container(
                                                  height: 40.0,
                                                  decoration: BoxDecoration(
                                                    color: AppTheme.of(
                                                            context)
                                                        .secondaryBackground,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            12.0),
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
                                                          MainAxisSize.max,
                                                      children: [
                                                        Expanded(
                                                          child: Text(
                                                            AppLocalizations.of(
                                                                    context)
                                                                .getText(
                                                              '1zi762pp' /* Selecionar todas as tarefas fi... */,
                                                            ),
                                                            style: AppTheme
                                                                    .of(context)
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
                                                        ),
                                                        Text(
                                                          valueOrDefault<
                                                              String>(
                                                            AppState()
                                                                .taskslist
                                                                .length
                                                                .toString(),
                                                            '0',
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
                                                                    .primary,
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
                                                        Row(
                                                          mainAxisSize:
                                                              MainAxisSize.max,
                                                          children: [
                                                            if (!(AppState()
                                                                .taskslist
                                                                .isNotEmpty))
                                                              InkWell(
                                                                splashColor: Colors
                                                                    .transparent,
                                                                focusColor: Colors
                                                                    .transparent,
                                                                hoverColor: Colors
                                                                    .transparent,
                                                                highlightColor:
                                                                    Colors
                                                                        .transparent,
                                                                onTap:
                                                                    () async {
                                                                  if (!_model
                                                                      .semSucesso) {
                                                                    _model.allCheck =
                                                                        true;
                                                                    safeSetState(
                                                                        () {});
                                                                    _model.retornoAciton =
                                                                        await actions
                                                                            .setIdsEquipamento(
                                                                      SprintsGroup
                                                                          .queryAllSprintsTasksRecordCall
                                                                          .nOandamento(
                                                                            homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                                          )!
                                                                          .toList(),
                                                                    );
                                                                    AppState().taskslist = _model
                                                                        .retornoAciton!
                                                                        .toList()
                                                                        .cast<
                                                                            TasksListStruct>();
                                                                    safeSetState(
                                                                        () {});
                                                                  } else {
                                                                    _model.allCheck =
                                                                        true;
                                                                    safeSetState(
                                                                        () {});
                                                                    _model.retornoAcitonSemSucesso =
                                                                        await actions
                                                                            .setIdsEquipamento(
                                                                      SprintsGroup
                                                                          .queryAllSprintsTasksRecordCall
                                                                          .nOsemSucesso(
                                                                            homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                                          )!
                                                                          .toList(),
                                                                    );
                                                                    AppState().taskslist = _model
                                                                        .retornoAcitonSemSucesso!
                                                                        .toList()
                                                                        .cast<
                                                                            TasksListStruct>();
                                                                    safeSetState(
                                                                        () {});
                                                                  }

                                                                  safeSetState(
                                                                      () {});
                                                                },
                                                                child:
                                                                    Container(
                                                                  width: 30.0,
                                                                  height: 30.0,
                                                                  decoration:
                                                                      BoxDecoration(),
                                                                  alignment:
                                                                      AlignmentDirectional(
                                                                          0.0,
                                                                          0.0),
                                                                  child: Column(
                                                                    mainAxisSize:
                                                                        MainAxisSize
                                                                            .max,
                                                                    mainAxisAlignment:
                                                                        MainAxisAlignment
                                                                            .center,
                                                                    children: [
                                                                      Container(
                                                                        width:
                                                                            18.0,
                                                                        height:
                                                                            18.0,
                                                                        decoration:
                                                                            BoxDecoration(
                                                                          color:
                                                                              AppTheme.of(context).secondaryBackground,
                                                                          borderRadius:
                                                                              BorderRadius.circular(4.0),
                                                                          border:
                                                                              Border.all(
                                                                            color:
                                                                                AppTheme.of(context).alternate,
                                                                            width:
                                                                                2.0,
                                                                          ),
                                                                        ),
                                                                      ),
                                                                    ],
                                                                  ),
                                                                ),
                                                              ),
                                                            if (AppState()
                                                                .taskslist
                                                                .isNotEmpty)
                                                              InkWell(
                                                                splashColor: Colors
                                                                    .transparent,
                                                                focusColor: Colors
                                                                    .transparent,
                                                                hoverColor: Colors
                                                                    .transparent,
                                                                highlightColor:
                                                                    Colors
                                                                        .transparent,
                                                                onTap:
                                                                    () async {
                                                                  _model.allCheck =
                                                                      false;
                                                                  safeSetState(
                                                                      () {});
                                                                  AppState()
                                                                      .taskslist = [];
                                                                  safeSetState(
                                                                      () {});
                                                                },
                                                                child:
                                                                    Container(
                                                                  width: 30.0,
                                                                  height: 30.0,
                                                                  decoration:
                                                                      BoxDecoration(),
                                                                  alignment:
                                                                      AlignmentDirectional(
                                                                          0.0,
                                                                          0.0),
                                                                  child: Column(
                                                                    mainAxisSize:
                                                                        MainAxisSize
                                                                            .max,
                                                                    mainAxisAlignment:
                                                                        MainAxisAlignment
                                                                            .center,
                                                                    children: [
                                                                      Container(
                                                                        width:
                                                                            18.0,
                                                                        height:
                                                                            18.0,
                                                                        decoration:
                                                                            BoxDecoration(
                                                                          color:
                                                                              AppTheme.of(context).primary,
                                                                          borderRadius:
                                                                              BorderRadius.circular(4.0),
                                                                          border:
                                                                              Border.all(
                                                                            color:
                                                                                AppTheme.of(context).primary,
                                                                            width:
                                                                                2.0,
                                                                          ),
                                                                        ),
                                                                        alignment: AlignmentDirectional(
                                                                            0.0,
                                                                            0.0),
                                                                        child:
                                                                            Align(
                                                                          alignment: AlignmentDirectional(
                                                                              0.0,
                                                                              0.0),
                                                                          child:
                                                                              Stack(
                                                                            alignment:
                                                                                AlignmentDirectional(0.0, 0.0),
                                                                            children: [
                                                                              if (!_model.allCheck)
                                                                                FaIcon(
                                                                                  FontAwesomeIcons.check,
                                                                                  color: AppTheme.of(context).info,
                                                                                  size: 14.0,
                                                                                ),
                                                                              if (_model.allCheck)
                                                                                Container(
                                                                                  width: 100.0,
                                                                                  height: 3.0,
                                                                                  decoration: BoxDecoration(
                                                                                    color: AppTheme.of(context).secondaryBackground,
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
                                                          ],
                                                        ),
                                                      ].divide(
                                                          SizedBox(width: 4.0)),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            if (_model.tabBarCurrentIndex == 1)
                                              Padding(
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        0.0, 8.0, 0.0, 8.0),
                                                child: Container(
                                                  height: 40.0,
                                                  decoration: BoxDecoration(
                                                    color: AppTheme.of(
                                                            context)
                                                        .secondaryBackground,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            12.0),
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
                                                          MainAxisSize.max,
                                                      children: [
                                                        Expanded(
                                                          child: Text(
                                                            AppLocalizations.of(
                                                                    context)
                                                                .getText(
                                                              'fv19kacg' /* Selecionar todas as tarefas fi... */,
                                                            ),
                                                            style: AppTheme
                                                                    .of(context)
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
                                                        ),
                                                        Text(
                                                          valueOrDefault<
                                                              String>(
                                                            AppState()
                                                                .taskslist
                                                                .length
                                                                .toString(),
                                                            '0',
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
                                                                    .primary,
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
                                                        Row(
                                                          mainAxisSize:
                                                              MainAxisSize.max,
                                                          children: [
                                                            if (!(AppState()
                                                                .taskslist
                                                                .isNotEmpty))
                                                              InkWell(
                                                                splashColor: Colors
                                                                    .transparent,
                                                                focusColor: Colors
                                                                    .transparent,
                                                                hoverColor: Colors
                                                                    .transparent,
                                                                highlightColor:
                                                                    Colors
                                                                        .transparent,
                                                                onTap:
                                                                    () async {
                                                                  _model.allCheck =
                                                                      true;
                                                                  safeSetState(
                                                                      () {});
                                                                  _model.yesandamento =
                                                                      await actions
                                                                          .addIdsDataType(
                                                                    SprintsGroup
                                                                        .queryAllSprintsTasksRecordCall
                                                                        .yESandamento(
                                                                          homePageTarefasQueryAllSprintsTasksRecordResponse
                                                                              .jsonBody,
                                                                        )!
                                                                        .toList(),
                                                                  );
                                                                  AppState().taskslist = _model
                                                                      .yesandamento!
                                                                      .toList()
                                                                      .cast<
                                                                          TasksListStruct>();
                                                                  safeSetState(
                                                                      () {});

                                                                  safeSetState(
                                                                      () {});
                                                                },
                                                                child:
                                                                    Container(
                                                                  width: 30.0,
                                                                  height: 30.0,
                                                                  decoration:
                                                                      BoxDecoration(),
                                                                  alignment:
                                                                      AlignmentDirectional(
                                                                          0.0,
                                                                          0.0),
                                                                  child: Column(
                                                                    mainAxisSize:
                                                                        MainAxisSize
                                                                            .max,
                                                                    mainAxisAlignment:
                                                                        MainAxisAlignment
                                                                            .center,
                                                                    children: [
                                                                      Container(
                                                                        width:
                                                                            18.0,
                                                                        height:
                                                                            18.0,
                                                                        decoration:
                                                                            BoxDecoration(
                                                                          color:
                                                                              AppTheme.of(context).secondaryBackground,
                                                                          borderRadius:
                                                                              BorderRadius.circular(4.0),
                                                                          border:
                                                                              Border.all(
                                                                            color:
                                                                                AppTheme.of(context).alternate,
                                                                            width:
                                                                                2.0,
                                                                          ),
                                                                        ),
                                                                      ),
                                                                    ],
                                                                  ),
                                                                ),
                                                              ),
                                                            if (AppState()
                                                                .taskslist
                                                                .isNotEmpty)
                                                              InkWell(
                                                                splashColor: Colors
                                                                    .transparent,
                                                                focusColor: Colors
                                                                    .transparent,
                                                                hoverColor: Colors
                                                                    .transparent,
                                                                highlightColor:
                                                                    Colors
                                                                        .transparent,
                                                                onTap:
                                                                    () async {
                                                                  _model.allCheck =
                                                                      false;
                                                                  safeSetState(
                                                                      () {});
                                                                  AppState()
                                                                      .taskslist = [];
                                                                  safeSetState(
                                                                      () {});
                                                                },
                                                                child:
                                                                    Container(
                                                                  width: 30.0,
                                                                  height: 30.0,
                                                                  decoration:
                                                                      BoxDecoration(),
                                                                  alignment:
                                                                      AlignmentDirectional(
                                                                          0.0,
                                                                          0.0),
                                                                  child: Column(
                                                                    mainAxisSize:
                                                                        MainAxisSize
                                                                            .max,
                                                                    mainAxisAlignment:
                                                                        MainAxisAlignment
                                                                            .center,
                                                                    children: [
                                                                      Container(
                                                                        width:
                                                                            18.0,
                                                                        height:
                                                                            18.0,
                                                                        decoration:
                                                                            BoxDecoration(
                                                                          color:
                                                                              AppTheme.of(context).primary,
                                                                          borderRadius:
                                                                              BorderRadius.circular(4.0),
                                                                          border:
                                                                              Border.all(
                                                                            color:
                                                                                AppTheme.of(context).primary,
                                                                            width:
                                                                                2.0,
                                                                          ),
                                                                        ),
                                                                        alignment: AlignmentDirectional(
                                                                            0.0,
                                                                            0.0),
                                                                        child:
                                                                            Align(
                                                                          alignment: AlignmentDirectional(
                                                                              0.0,
                                                                              0.0),
                                                                          child:
                                                                              Stack(
                                                                            alignment:
                                                                                AlignmentDirectional(0.0, 0.0),
                                                                            children: [
                                                                              if (!_model.allCheck)
                                                                                FaIcon(
                                                                                  FontAwesomeIcons.check,
                                                                                  color: AppTheme.of(context).info,
                                                                                  size: 14.0,
                                                                                ),
                                                                              if (_model.allCheck)
                                                                                Container(
                                                                                  width: 100.0,
                                                                                  height: 3.0,
                                                                                  decoration: BoxDecoration(
                                                                                    color: AppTheme.of(context).secondaryBackground,
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
                                                          ],
                                                        ),
                                                      ].divide(
                                                          SizedBox(width: 4.0)),
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            Expanded(
                                              child: Column(
                                                children: [
                                                  Align(
                                                    alignment:
                                                        Alignment(0.0, 0),
                                                    child:
                                                        AppTabBar(
                                                      useToggleButtonStyle:
                                                          true,
                                                      labelStyle:
                                                          GoogleFonts.lexend(
                                                            fontSize: 14.0,
                                                            fontWeight: FontWeight.w600,
                                                            letterSpacing: 0.2,
                                                          ),
                                                      unselectedLabelStyle:
                                                          GoogleFonts.lexend(
                                                            fontSize: 14.0,
                                                            fontWeight: FontWeight.w500,
                                                            letterSpacing: 0.2,
                                                          ),
                                                      labelColor:
                                                          Colors.white,
                                                      unselectedLabelColor:
                                                          AppTheme.of(
                                                                  context)
                                                              .secondaryText,
                                                      backgroundColor:
                                                          AppTheme.of(
                                                                  context)
                                                              .primary,
                                                      unselectedBackgroundColor:
                                                          Colors.white,
                                                      borderColor:
                                                          AppTheme.of(
                                                                  context)
                                                              .alternate,
                                                      borderWidth: 1.0,
                                                      borderRadius: 12.0,
                                                      elevation: 0.0,
                                                      buttonMargin:
                                                          EdgeInsetsDirectional
                                                              .fromSTEB(
                                                                  6.0,
                                                                  0.0,
                                                                  6.0,
                                                                  0.0),
                                                      tabs: [
                                                        Tab(
                                                          text: AppLocalizations
                                                                  .of(context)
                                                              .getText(
                                                            'pv86xn2h' /* Tarefas */,
                                                          ),
                                                        ),
                                                        Tab(
                                                          text: AppLocalizations
                                                                  .of(context)
                                                              .getText(
                                                            'esu4od55' /* Inspeções */,
                                                          ),
                                                        ),
                                                      ],
                                                      controller: _model
                                                          .tabBarController,
                                                      onTap: (i) async {
                                                        [
                                                          () async {
                                                            _model.allCheck =
                                                                false;
                                                            safeSetState(() {});
                                                            AppState()
                                                                .taskslist = [];
                                                            safeSetState(() {});
                                                          },
                                                          () async {
                                                            _model.allCheck =
                                                                false;
                                                            safeSetState(() {});
                                                            AppState()
                                                                .taskslist = [];
                                                            safeSetState(() {});
                                                          }
                                                        ][i]();
                                                      },
                                                    ),
                                                  ),
                                                  Expanded(
                                                    child: TabBarView(
                                                      controller: _model
                                                          .tabBarController,
                                                      children: [
                                                        Padding(
                                                          padding:
                                                              EdgeInsetsDirectional
                                                                  .fromSTEB(
                                                                      0.0,
                                                                      8.0,
                                                                      0.0,
                                                                      0.0),
                                                          child: Column(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .max,
                                                            children: [
                                                              if (_model
                                                                  .semSucesso)
                                                                Expanded(
                                                                  child:
                                                                      Builder(
                                                                    builder:
                                                                        (context) {
                                                                      final listaSemSucesso = SprintsGroup
                                                                              .queryAllSprintsTasksRecordCall
                                                                              .nOsemSucesso(
                                                                                homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                                              )
                                                                              ?.toList() ??
                                                                          [];
                                                                      if (listaSemSucesso
                                                                          .isEmpty) {
                                                                        return Container(
                                                                          width:
                                                                              double.infinity,
                                                                          child:
                                                                              EmptyWidget(),
                                                                        );
                                                                      }

                                                                      return RefreshIndicator(
                                                                        onRefresh:
                                                                            () async {
                                                                          safeSetState(
                                                                              () {
                                                                            _model.clearHomePageCache();
                                                                            _model.apiRequestCompleted =
                                                                                false;
                                                                          });
                                                                          await _model
                                                                              .waitForApiRequestCompleted();
                                                                        },
                                                                        child: ListView
                                                                            .builder(
                                                                          padding:
                                                                              EdgeInsets.zero,
                                                                          primary:
                                                                              false,
                                                                          shrinkWrap:
                                                                              true,
                                                                          scrollDirection:
                                                                              Axis.vertical,
                                                                          itemCount:
                                                                              listaSemSucesso.length,
                                                                          itemBuilder:
                                                                              (context, listaSemSucessoIndex) {
                                                                            final listaSemSucessoItem =
                                                                                listaSemSucesso[listaSemSucessoIndex];
                                                                            return Padding(
                                                                              padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 12.0),
                                                                              child: Column(
                                                                                mainAxisSize: MainAxisSize.max,
                                                                                children: [
                                                                                  Material(
                                                                                    color: Colors.transparent,
                                                                                    elevation: 0.0,
                                                                                    shape: RoundedRectangleBorder(
                                                                                      borderRadius: BorderRadius.circular(14.0),
                                                                                    ),
                                                                                    child: Container(
                                                                                      width: MediaQuery.sizeOf(context).width * 1.0,
                                                                                      decoration: BoxDecoration(
                                                                                        color: AppConstants.tres ==
                                                                                                getJsonField(
                                                                                                  listaSemSucessoItem,
                                                                                                  r'''$.projects_backlogs.rows_stakes.stakes_statuses_id''',
                                                                                                )
                                                                                            ? const Color(0xFFFFF3F3)
                                                                                            : Colors.white,
                                                                                        borderRadius: BorderRadius.circular(14.0),
                                                                                        boxShadow: [
                                                                                          BoxShadow(
                                                                                            color: Colors.black.withOpacity(0.07),
                                                                                            blurRadius: 12,
                                                                                            offset: const Offset(0, 3),
                                                                                          ),
                                                                                        ],
                                                                                        border: Border.all(
                                                                                          color: AppConstants.tres ==
                                                                                                  getJsonField(
                                                                                                    listaSemSucessoItem,
                                                                                                    r'''$.projects_backlogs.rows_stakes.stakes_statuses_id''',
                                                                                                  )
                                                                                              ? const Color(0xFFFFCDD2)
                                                                                              : const Color(0xFFE8EAED),
                                                                                        ),
                                                                                      ),
                                                                                      child: Padding(
                                                                                        padding: EdgeInsetsDirectional.fromSTEB(0.0, 12.0, 0.0, 0.0),
                                                                                        child: Column(
                                                                                          mainAxisSize: MainAxisSize.min,
                                                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                                                          children: [
                                                                                            if (AppConstants.zero !=
                                                                                                getJsonField(
                                                                                                  listaSemSucessoItem,
                                                                                                  r'''$.subtasks_id''',
                                                                                                ))
                                                                                              Container(
                                                                                                width: double.infinity,
                                                                                                decoration: BoxDecoration(
                                                                                                  color: Color(0xFF487EDA),
                                                                                                  borderRadius: BorderRadius.only(
                                                                                                    bottomLeft: Radius.circular(0.0),
                                                                                                    bottomRight: Radius.circular(0.0),
                                                                                                    topLeft: Radius.circular(14.0),
                                                                                                    topRight: Radius.circular(14.0),
                                                                                                  ),
                                                                                                ),
                                                                                                child: Padding(
                                                                                                  padding: EdgeInsetsDirectional.fromSTEB(12.0, 8.0, 12.0, 4.0),
                                                                                                  child: Text(
                                                                                                    valueOrDefault<String>(
                                                                                                      'Tarefa: ${valueOrDefault<String>(
                                                                                                        getJsonField(
                                                                                                          listaSemSucessoItem,
                                                                                                          r'''$.projects_backlogs.id''',
                                                                                                        )?.toString(),
                                                                                                        '0',
                                                                                                      )} - ${valueOrDefault<String>(
                                                                                                        (getJsonField(
                                                                                                          listaSemSucessoItem,
                                                                                                          r'''$.projects_backlogs.description''',
                                                                                                        ) ?? getJsonField(
                                                                                                          listaSemSucessoItem,
                                                                                                          r'''$.projects_backlogs.tasks_template.description''',
                                                                                                        ))?.toString(),
                                                                                                        '-',
                                                                                                      )}',
                                                                                                      '-',
                                                                                                    ),
                                                                                                    style: AppTheme.of(context).bodyMedium.override(
                                                                                                          font: GoogleFonts.lexend(
                                                                                                            fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                          ),
                                                                                                          color: AppTheme.of(context).secondaryBackground,
                                                                                                          letterSpacing: 0.0,
                                                                                                          fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                          fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                        ),
                                                                                                  ),
                                                                                                ),
                                                                                              ),
                                                                                            Padding(
                                                                                              padding: EdgeInsetsDirectional.fromSTEB(12.0, 12.0, 12.0, 12.0),
                                                                                              child: Row(
                                                                                                mainAxisSize: MainAxisSize.max,
                                                                                                mainAxisAlignment: MainAxisAlignment.end,
                                                                                                children: [
                                                                                                  Row(
                                                                                                    mainAxisSize: MainAxisSize.max,
                                                                                                    children: [
                                                                                                      if (!functions.checkIds(
                                                                                                          AppState().taskslist.toList(),
                                                                                                          getJsonField(
                                                                                                            listaSemSucessoItem,
                                                                                                            r'''$.id''',
                                                                                                          )))
                                                                                                        InkWell(
                                                                                                          splashColor: Colors.transparent,
                                                                                                          focusColor: Colors.transparent,
                                                                                                          hoverColor: Colors.transparent,
                                                                                                          highlightColor: Colors.transparent,
                                                                                                          onTap: () async {
                                                                                                            AppState().addToTaskslist(TasksListStruct(
                                                                                                              sprintsTasksId: getJsonField(
                                                                                                                listaSemSucessoItem,
                                                                                                                r'''$.id''',
                                                                                                              ),
                                                                                                              sprintsTasksStatusesId: 3,
                                                                                                              description: AppConstants.zero ==
                                                                                                                      getJsonField(
                                                                                                                        listaSemSucessoItem,
                                                                                                                        r'''$.subtasks_id''',
                                                                                                                      )
                                                                                                                  ? valueOrDefault<String>(
                                                                                                                      (getJsonField(
                                                                                                                        listaSemSucessoItem,
                                                                                                                        r'''$.projects_backlogs.description''',
                                                                                                                      ) ?? getJsonField(
                                                                                                                        listaSemSucessoItem,
                                                                                                                        r'''$.projects_backlogs.tasks_template.description''',
                                                                                                                      ))?.toString(),
                                                                                                                      ' - ',
                                                                                                                    )
                                                                                                                  : valueOrDefault<String>(
                                                                                                                      getJsonField(
                                                                                                                        listaSemSucessoItem,
                                                                                                                        r'''$.subtasks.description''',
                                                                                                                      )?.toString(),
                                                                                                                      ' - ',
                                                                                                                    ),
                                                                                                              subtasksId: getJsonField(
                                                                                                                listaSemSucessoItem,
                                                                                                                r'''$.subtasks_id''',
                                                                                                              ),
                                                                                                              unity: UnityStruct(
                                                                                                                id: getJsonField(
                                                                                                                  listaSemSucessoItem,
                                                                                                                  r'''$.subtasks.unity.id''',
                                                                                                                ),
                                                                                                                unity: getJsonField(
                                                                                                                  listaSemSucessoItem,
                                                                                                                  r'''$.subtasks.unity.unity''',
                                                                                                                ).toString(),
                                                                                                              ),
                                                                                                              unityId: getJsonField(
                                                                                                                listaSemSucessoItem,
                                                                                                                r'''$.subtasks.unity_id''',
                                                                                                              ),
                                                                                                              quantityDone: getJsonField(
                                                                                                                        listaSemSucessoItem,
                                                                                                                        r'''$.subtasks''',
                                                                                                                      ) !=
                                                                                                                      null
                                                                                                                  ? getJsonField(
                                                                                                                      listaSemSucessoItem,
                                                                                                                      r'''$.subtasks.quantity''',
                                                                                                                    )
                                                                                                                  : 0.0,
                                                                                                              inspection: getJsonField(
                                                                                                                listaSemSucessoItem,
                                                                                                                r'''$.projects_backlogs.is_inspection''',
                                                                                                              ),
                                                                                                            ));
                                                                                                            safeSetState(() {});
                                                                                                          },
                                                                                                          child: Container(
                                                                                                            width: 30.0,
                                                                                                            height: 30.0,
                                                                                                            decoration: BoxDecoration(),
                                                                                                            alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                            child: Column(
                                                                                                              mainAxisSize: MainAxisSize.max,
                                                                                                              mainAxisAlignment: MainAxisAlignment.center,
                                                                                                              children: [
                                                                                                                Container(
                                                                                                                  width: 18.0,
                                                                                                                  height: 18.0,
                                                                                                                  decoration: BoxDecoration(
                                                                                                                    color: AppTheme.of(context).secondaryBackground,
                                                                                                                    borderRadius: BorderRadius.circular(4.0),
                                                                                                                    border: Border.all(
                                                                                                                      color: AppTheme.of(context).alternate,
                                                                                                                      width: 2.0,
                                                                                                                    ),
                                                                                                                  ),
                                                                                                                ),
                                                                                                              ],
                                                                                                            ),
                                                                                                          ),
                                                                                                        ),
                                                                                                      if (functions.checkIds(
                                                                                                          AppState().taskslist.toList(),
                                                                                                          getJsonField(
                                                                                                            listaSemSucessoItem,
                                                                                                            r'''$.id''',
                                                                                                          )))
                                                                                                        InkWell(
                                                                                                          splashColor: Colors.transparent,
                                                                                                          focusColor: Colors.transparent,
                                                                                                          hoverColor: Colors.transparent,
                                                                                                          highlightColor: Colors.transparent,
                                                                                                          onTap: () async {
                                                                                                            AppState().removeFromTaskslist(TasksListStruct(
                                                                                                              sprintsTasksId: getJsonField(
                                                                                                                listaSemSucessoItem,
                                                                                                                r'''$.id''',
                                                                                                              ),
                                                                                                              sprintsTasksStatusesId: 3,
                                                                                                              description: AppConstants.zero ==
                                                                                                                      getJsonField(
                                                                                                                        listaSemSucessoItem,
                                                                                                                        r'''$.subtasks_id''',
                                                                                                                      )
                                                                                                                  ? valueOrDefault<String>(
                                                                                                                      (getJsonField(
                                                                                                                        listaSemSucessoItem,
                                                                                                                        r'''$.projects_backlogs.description''',
                                                                                                                      ) ?? getJsonField(
                                                                                                                        listaSemSucessoItem,
                                                                                                                        r'''$.projects_backlogs.tasks_template.description''',
                                                                                                                      ))?.toString(),
                                                                                                                      ' - ',
                                                                                                                    )
                                                                                                                  : valueOrDefault<String>(
                                                                                                                      getJsonField(
                                                                                                                        listaSemSucessoItem,
                                                                                                                        r'''$.subtasks.description''',
                                                                                                                      )?.toString(),
                                                                                                                      ' - ',
                                                                                                                    ),
                                                                                                              subtasksId: getJsonField(
                                                                                                                listaSemSucessoItem,
                                                                                                                r'''$.subtasks_id''',
                                                                                                              ),
                                                                                                              unity: UnityStruct(
                                                                                                                id: getJsonField(
                                                                                                                  listaSemSucessoItem,
                                                                                                                  r'''$.subtasks.unity.id''',
                                                                                                                ),
                                                                                                                unity: getJsonField(
                                                                                                                  listaSemSucessoItem,
                                                                                                                  r'''$.subtasks.unity.unity''',
                                                                                                                ).toString(),
                                                                                                              ),
                                                                                                              unityId: getJsonField(
                                                                                                                listaSemSucessoItem,
                                                                                                                r'''$.subtasks.unity_id''',
                                                                                                              ),
                                                                                                              quantityDone: getJsonField(
                                                                                                                        listaSemSucessoItem,
                                                                                                                        r'''$.subtasks''',
                                                                                                                      ) !=
                                                                                                                      null
                                                                                                                  ? getJsonField(
                                                                                                                      listaSemSucessoItem,
                                                                                                                      r'''$.subtasks.quantity''',
                                                                                                                    )
                                                                                                                  : 0.0,
                                                                                                              inspection: getJsonField(
                                                                                                                listaSemSucessoItem,
                                                                                                                r'''$.projects_backlogs.is_inspection''',
                                                                                                              ),
                                                                                                            ));
                                                                                                            safeSetState(() {});
                                                                                                          },
                                                                                                          child: Container(
                                                                                                            width: 30.0,
                                                                                                            height: 30.0,
                                                                                                            decoration: BoxDecoration(),
                                                                                                            child: Column(
                                                                                                              mainAxisSize: MainAxisSize.max,
                                                                                                              mainAxisAlignment: MainAxisAlignment.center,
                                                                                                              children: [
                                                                                                                Container(
                                                                                                                  width: 18.0,
                                                                                                                  height: 18.0,
                                                                                                                  decoration: BoxDecoration(
                                                                                                                    color: AppTheme.of(context).primary,
                                                                                                                    borderRadius: BorderRadius.circular(4.0),
                                                                                                                    border: Border.all(
                                                                                                                      color: AppTheme.of(context).primary,
                                                                                                                      width: 2.0,
                                                                                                                    ),
                                                                                                                  ),
                                                                                                                  alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                                  child: Align(
                                                                                                                    alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                                    child: Stack(
                                                                                                                      alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                                      children: [
                                                                                                                        if (!_model.allCheck)
                                                                                                                          FaIcon(
                                                                                                                            FontAwesomeIcons.check,
                                                                                                                            color: AppTheme.of(context).info,
                                                                                                                            size: 14.0,
                                                                                                                          ),
                                                                                                                        if (_model.allCheck)
                                                                                                                          Container(
                                                                                                                            width: 100.0,
                                                                                                                            height: 3.0,
                                                                                                                            decoration: BoxDecoration(
                                                                                                                              color: AppTheme.of(context).secondaryBackground,
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
                                                                                                    ],
                                                                                                  ),
                                                                                                ],
                                                                                              ),
                                                                                            ),
                                                                                            Row(
                                                                                              mainAxisSize: MainAxisSize.max,
                                                                                              children: [
                                                                                                Expanded(
                                                                                                  child: Padding(
                                                                                                    padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
                                                                                                    child: RichText(
                                                                                                      textScaler: MediaQuery.of(context).textScaler,
                                                                                                      text: TextSpan(
                                                                                                        children: [
                                                                                                          TextSpan(
                                                                                                            text: 'COD: ${valueOrDefault<String>(
                                                                                                              getJsonField(
                                                                                                                listaSemSucessoItem,
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
                                                                                                              'oecbnf5u' /*   */,
                                                                                                            ),
                                                                                                            style: TextStyle(),
                                                                                                          ),
                                                                                                          TextSpan(
                                                                                                            text: AppConstants.zero ==
                                                                                                                    getJsonField(
                                                                                                                      listaSemSucessoItem,
                                                                                                                      r'''$.subtasks_id''',
                                                                                                                    )
                                                                                                                ? valueOrDefault<String>(
                                                                                                                    (getJsonField(
                                                                                                                      listaSemSucessoItem,
                                                                                                                      r'''$.projects_backlogs.description''',
                                                                                                                    ) ?? getJsonField(
                                                                                                                      listaSemSucessoItem,
                                                                                                                      r'''$.projects_backlogs.tasks_template.description''',
                                                                                                                    ))?.toString(),
                                                                                                                    ' - ',
                                                                                                                  )
                                                                                                                : valueOrDefault<String>(
                                                                                                                    getJsonField(
                                                                                                                      listaSemSucessoItem,
                                                                                                                      r'''$.subtasks.description''',
                                                                                                                    )?.toString(),
                                                                                                                    ' - ',
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
                                                                                                ),
                                                                                              ],
                                                                                            ),
                                                                                            Padding(
                                                                                              padding: EdgeInsetsDirectional.fromSTEB(12.0, 4.0, 12.0, 4.0),
                                                                                              child: Column(
                                                                                                mainAxisSize: MainAxisSize.max,
                                                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                                                children: [
                                                                                                  Row(
                                                                                                    mainAxisSize: MainAxisSize.max,
                                                                                                    children: [
                                                                                                      RichText(
                                                                                                        textScaler: MediaQuery.of(context).textScaler,
                                                                                                        text: TextSpan(
                                                                                                          children: [
                                                                                                            TextSpan(
                                                                                                              text: AppLocalizations.of(context).getText(
                                                                                                                'rhzner57' /* Disciplina:  */,
                                                                                                              ),
                                                                                                              style: TextStyle(
                                                                                                                color: AppTheme.of(context).primaryText,
                                                                                                              ),
                                                                                                            ),
                                                                                                            TextSpan(
                                                                                                              text: valueOrDefault<String>(
                                                                                                                getJsonField(
                                                                                                                  listaSemSucessoItem,
                                                                                                                  r'''$.projects_backlogs.discipline.discipline''',
                                                                                                                )?.toString(),
                                                                                                                '-',
                                                                                                              ),
                                                                                                              style: AppTheme.of(context).bodyMedium.override(
                                                                                                                    font: GoogleFonts.lexend(
                                                                                                                      fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                                    ),
                                                                                                                    color: AppTheme.of(context).primary,
                                                                                                                    letterSpacing: 0.0,
                                                                                                                    fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                                    fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                                  ),
                                                                                                            )
                                                                                                          ],
                                                                                                          style: AppTheme.of(context).bodyMedium.override(
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
                                                                                                      ),
                                                                                                    ],
                                                                                                  ),
                                                                                                  if ((getJsonField(
                                                                                                            listaSemSucessoItem,
                                                                                                            r'''$.subtasks.quantity''',
                                                                                                          ) !=
                                                                                                          null) ||
                                                                                                      (getJsonField(
                                                                                                            listaSemSucessoItem,
                                                                                                            r'''$.projects_backlogs.unity.unity''',
                                                                                                          ) !=
                                                                                                          null))
                                                                                                    Row(
                                                                                                      mainAxisSize: MainAxisSize.max,
                                                                                                      children: [
                                                                                                        RichText(
                                                                                                          textScaler: MediaQuery.of(context).textScaler,
                                                                                                          text: TextSpan(
                                                                                                            children: [
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  'm0eam955' /* Qtd da tarefa:  */,
                                                                                                                ),
                                                                                                                style: TextStyle(
                                                                                                                  color: AppTheme.of(context).primaryText,
                                                                                                                ),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: AppConstants.zero ==
                                                                                                                        getJsonField(
                                                                                                                          listaSemSucessoItem,
                                                                                                                          r'''$.subtasks_id''',
                                                                                                                        )
                                                                                                                    ? valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaSemSucessoItem,
                                                                                                                          r'''$.projects_backlogs.quantity''',
                                                                                                                        )?.toString(),
                                                                                                                        '0',
                                                                                                                      )
                                                                                                                    : valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaSemSucessoItem,
                                                                                                                          r'''$.subtasks.quantity''',
                                                                                                                        )?.toString(),
                                                                                                                        '0',
                                                                                                                      ),
                                                                                                                style: AppTheme.of(context).bodyMedium.override(
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
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  'n8zrgq28' /*   */,
                                                                                                                ),
                                                                                                                style: TextStyle(),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: AppConstants.zero ==
                                                                                                                        getJsonField(
                                                                                                                          listaSemSucessoItem,
                                                                                                                          r'''$.subtasks_id''',
                                                                                                                        )
                                                                                                                    ? valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaSemSucessoItem,
                                                                                                                          r'''$.projects_backlogs.unity.unity''',
                                                                                                                        )?.toString(),
                                                                                                                        '-',
                                                                                                                      )
                                                                                                                    : valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaSemSucessoItem,
                                                                                                                          r'''$.subtasks.unity.unity''',
                                                                                                                        )?.toString(),
                                                                                                                        '-',
                                                                                                                      ),
                                                                                                                style: TextStyle(),
                                                                                                              )
                                                                                                            ],
                                                                                                            style: AppTheme.of(context).bodyMedium.override(
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
                                                                                                        ),
                                                                                                      ],
                                                                                                    ),
                                                                                                  if ((getJsonField(
                                                                                                            listaSemSucessoItem,
                                                                                                            r'''$.subtasks.quantity''',
                                                                                                          ) !=
                                                                                                          null) ||
                                                                                                      (getJsonField(
                                                                                                            listaSemSucessoItem,
                                                                                                            r'''$.projects_backlogs.unity.unity''',
                                                                                                          ) !=
                                                                                                          null))
                                                                                                    RichText(
                                                                                                      textScaler: MediaQuery.of(context).textScaler,
                                                                                                      text: TextSpan(
                                                                                                        children: [
                                                                                                          TextSpan(
                                                                                                            text: AppLocalizations.of(context).getText(
                                                                                                              'woff5s4d' /* Qtd executada:  */,
                                                                                                            ),
                                                                                                            style: TextStyle(
                                                                                                              color: AppTheme.of(context).primaryText,
                                                                                                            ),
                                                                                                          ),
                                                                                                          TextSpan(
                                                                                                            text: AppConstants.zero ==
                                                                                                                    getJsonField(
                                                                                                                      listaSemSucessoItem,
                                                                                                                      r'''$.subtasks_id''',
                                                                                                                    )
                                                                                                                ? valueOrDefault<String>(
                                                                                                                    getJsonField(
                                                                                                                      listaSemSucessoItem,
                                                                                                                      r'''$.projects_backlogs.quantity_done''',
                                                                                                                    )?.toString(),
                                                                                                                    '0',
                                                                                                                  )
                                                                                                                : valueOrDefault<String>(
                                                                                                                    getJsonField(
                                                                                                                      listaSemSucessoItem,
                                                                                                                      r'''$.subtasks.quantity_done''',
                                                                                                                    )?.toString(),
                                                                                                                    '0',
                                                                                                                  ),
                                                                                                            style: AppTheme.of(context).bodyMedium.override(
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
                                                                                                          TextSpan(
                                                                                                            text: AppLocalizations.of(context).getText(
                                                                                                              'fw9edepr' /*   */,
                                                                                                            ),
                                                                                                            style: TextStyle(),
                                                                                                          ),
                                                                                                          TextSpan(
                                                                                                            text: AppConstants.zero ==
                                                                                                                    getJsonField(
                                                                                                                      listaSemSucessoItem,
                                                                                                                      r'''$.subtasks_id''',
                                                                                                                    )
                                                                                                                ? valueOrDefault<String>(
                                                                                                                    getJsonField(
                                                                                                                      listaSemSucessoItem,
                                                                                                                      r'''$.projects_backlogs.unity.unity''',
                                                                                                                    )?.toString(),
                                                                                                                    '-',
                                                                                                                  )
                                                                                                                : valueOrDefault<String>(
                                                                                                                    getJsonField(
                                                                                                                      listaSemSucessoItem,
                                                                                                                      r'''$.subtasks.unity.unity''',
                                                                                                                    )?.toString(),
                                                                                                                    '-',
                                                                                                                  ),
                                                                                                            style: TextStyle(),
                                                                                                          )
                                                                                                        ],
                                                                                                        style: AppTheme.of(context).bodyMedium.override(
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
                                                                                                    ),
                                                                                                ],
                                                                                              ),
                                                                                            ),
                                                                                          ],
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                ].divide(SizedBox(height: 8.0)),
                                                                              ),
                                                                            );
                                                                          },
                                                                        ),
                                                                      );
                                                                    },
                                                                  ),
                                                                ),
                                                              if (!_model
                                                                  .semSucesso)
                                                                Expanded(
                                                                  child:
                                                                      Builder(
                                                                    builder:
                                                                        (context) {
                                                                      final listaAndamento = SprintsGroup
                                                                              .queryAllSprintsTasksRecordCall
                                                                              .nOandamento(
                                                                                homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                                              )
                                                                              ?.toList() ??
                                                                          [];
                                                                      if (listaAndamento
                                                                          .isEmpty) {
                                                                        return Container(
                                                                          width:
                                                                              double.infinity,
                                                                          child:
                                                                              EmptyWidget(),
                                                                        );
                                                                      }

                                                                      return RefreshIndicator(
                                                                        onRefresh:
                                                                            () async {
                                                                          safeSetState(
                                                                              () {
                                                                            _model.clearHomePageCache();
                                                                            _model.apiRequestCompleted =
                                                                                false;
                                                                          });
                                                                          await _model
                                                                              .waitForApiRequestCompleted();
                                                                        },
                                                                        child: ListView
                                                                            .builder(
                                                                          padding:
                                                                              EdgeInsets.zero,
                                                                          primary:
                                                                              false,
                                                                          shrinkWrap:
                                                                              true,
                                                                          scrollDirection:
                                                                              Axis.vertical,
                                                                          itemCount:
                                                                              listaAndamento.length,
                                                                          itemBuilder:
                                                                              (context, listaAndamentoIndex) {
                                                                            final listaAndamentoItem =
                                                                                listaAndamento[listaAndamentoIndex];
                                                                            if (_isOfflineMaskedTask(
                                                                                listaAndamentoItem)) {
                                                                              return const SizedBox.shrink();
                                                                            }
                                                                            return Padding(
                                                                              padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 12.0),
                                                                              child: Column(
                                                                                mainAxisSize: MainAxisSize.max,
                                                                                children: [
                                                                                  Material(
                                                                                    color: Colors.transparent,
                                                                                    elevation: 0.0,
                                                                                    shape: RoundedRectangleBorder(
                                                                                      borderRadius: BorderRadius.circular(14.0),
                                                                                    ),
                                                                                    child: Container(
                                                                                      width: MediaQuery.sizeOf(context).width * 1.0,
                                                                                      decoration: BoxDecoration(
                                                                                        color: Colors.white,
                                                                                        borderRadius: BorderRadius.circular(14.0),
                                                                                        boxShadow: [
                                                                                          BoxShadow(
                                                                                            color: Colors.black.withOpacity(0.07),
                                                                                            blurRadius: 12,
                                                                                            offset: const Offset(0, 3),
                                                                                          ),
                                                                                        ],
                                                                                        border: Border.all(
                                                                                          color: const Color(0xFFE8EAED),
                                                                                        ),
                                                                                      ),
                                                                                      child: Padding(
                                                                                        padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 12.0),
                                                                                        child: Column(
                                                                                          mainAxisSize: MainAxisSize.min,
                                                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                                                          children: [
                                                                                            if (AppConstants.zero !=
                                                                                                getJsonField(
                                                                                                  listaAndamentoItem,
                                                                                                  r'''$.subtasks_id''',
                                                                                                ))
                                                                                              Container(
                                                                                                width: double.infinity,
                                                                                                decoration: BoxDecoration(
                                                                                                  // Subtarefa: header azul mais sofisticado
                                                                                                  gradient: const LinearGradient(
                                                                                                    begin: Alignment.topLeft,
                                                                                                    end: Alignment.bottomRight,
                                                                                                    colors: [Color(0xFF3B6EC8), Color(0xFF487EDA)],
                                                                                                  ),
                                                                                                  borderRadius: BorderRadius.only(
                                                                                                    bottomLeft: Radius.circular(0.0),
                                                                                                    bottomRight: Radius.circular(0.0),
                                                                                                    topLeft: Radius.circular(14.0),
                                                                                                    topRight: Radius.circular(14.0),
                                                                                                  ),
                                                                                                ),
                                                                                                child: Padding(
                                                                                                  padding: EdgeInsetsDirectional.fromSTEB(14.0, 10.0, 14.0, 6.0),
                                                                                                  child: Text(
                                                                                                    valueOrDefault<String>(
                                                                                                      'Tarefa: ${valueOrDefault<String>(
                                                                                                        getJsonField(
                                                                                                          listaAndamentoItem,
                                                                                                          r'''$.projects_backlogs.id''',
                                                                                                        )?.toString(),
                                                                                                        '0',
                                                                                                      )} - ${valueOrDefault<String>(
                                                                                                        (getJsonField(
                                                                                                          listaAndamentoItem,
                                                                                                          r'''$.projects_backlogs.description''',
                                                                                                        ) ?? getJsonField(
                                                                                                          listaAndamentoItem,
                                                                                                          r'''$.projects_backlogs.tasks_template.description''',
                                                                                                        ))?.toString(),
                                                                                                        '-',
                                                                                                      )}',
                                                                                                      '-',
                                                                                                    ),
                                                                                                    style: AppTheme.of(context).bodyMedium.override(
                                                                                                          font: GoogleFonts.lexend(
                                                                                                            fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                          ),
                                                                                                          color: AppTheme.of(context).secondaryBackground,
                                                                                                          letterSpacing: 0.0,
                                                                                                          fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                          fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                        ),
                                                                                                  ),
                                                                                                ),
                                                                                              ),
                                                                                            Padding(
                                                                                              padding: EdgeInsets.all(12.0),
                                                                                              child: Row(
                                                                                                mainAxisSize: MainAxisSize.max,
                                                                                                mainAxisAlignment: MainAxisAlignment.end,
                                                                                                children: [
                                                                                                  Row(
                                                                                                    mainAxisSize: MainAxisSize.max,
                                                                                                    children: [
                                                                                                      if (!functions.checkIds(
                                                                                                          AppState().taskslist.toList(),
                                                                                                          getJsonField(
                                                                                                            listaAndamentoItem,
                                                                                                            r'''$.id''',
                                                                                                          )))
                                                                                                        Builder(
                                                                                                          builder: (context) => InkWell(
                                                                                                            splashColor: Colors.transparent,
                                                                                                            focusColor: Colors.transparent,
                                                                                                            hoverColor: Colors.transparent,
                                                                                                            highlightColor: Colors.transparent,
                                                                                                            onTap: () async {
                                                                                                              if ((AppConstants.um ==
                                                                                                                      getJsonField(
                                                                                                                        listaAndamentoItem,
                                                                                                                        r'''$.projects_backlogs.equipaments_types_id''',
                                                                                                                      )) &&
                                                                                                                  (false ==
                                                                                                                      getJsonField(
                                                                                                                        listaAndamentoItem,
                                                                                                                        r'''$.can_conclude''',
                                                                                                                      ))) {
                                                                                                                await showDialog(
                                                                                                                  context: context,
                                                                                                                  builder: (dialogContext) {
                                                                                                                    return Dialog(
                                                                                                                      elevation: 0,
                                                                                                                      insetPadding: EdgeInsets.zero,
                                                                                                                      backgroundColor: Colors.transparent,
                                                                                                                      alignment: AlignmentDirectional(0.0, 0.0).resolve(Directionality.of(context)),
                                                                                                                      child: GestureDetector(
                                                                                                                        onTap: () {
                                                                                                                          FocusScope.of(dialogContext).unfocus();
                                                                                                                          FocusManager.instance.primaryFocus?.unfocus();
                                                                                                                        },
                                                                                                                        child: ModalInfoWidget(
                                                                                                                          title: 'Atenção',
                                                                                                                          description: 'Conclua todas as etapas de cravação de estacas para finalizar esta tarefa.',
                                                                                                                        ),
                                                                                                                      ),
                                                                                                                    );
                                                                                                                  },
                                                                                                                );

                                                                                                                return;
                                                                                                              }
                                                                                                              AppState().addToTaskslist(TasksListStruct(
                                                                                                                sprintsTasksId: getJsonField(
                                                                                                                  listaAndamentoItem,
                                                                                                                  r'''$.id''',
                                                                                                                ),
                                                                                                                sprintsTasksStatusesId: 3,
                                                                                                                description: AppConstants.zero ==
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks_id''',
                                                                                                                        )
                                                                                                                    ? valueOrDefault<String>(
                                                                                                                        (getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.projects_backlogs.description''',
                                                                                                                        ) ?? getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.projects_backlogs.tasks_template.description''',
                                                                                                                        ))?.toString(),
                                                                                                                        ' - ',
                                                                                                                      )
                                                                                                                    : valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks.description''',
                                                                                                                        )?.toString(),
                                                                                                                        ' - ',
                                                                                                                      ),
                                                                                                                subtasksId: getJsonField(
                                                                                                                  listaAndamentoItem,
                                                                                                                  r'''$.subtasks_id''',
                                                                                                                ),
                                                                                                                unity: UnityStruct(
                                                                                                                  id: getJsonField(
                                                                                                                            listaAndamentoItem,
                                                                                                                            r'''$.subtasks.unity.id''',
                                                                                                                          ) !=
                                                                                                                          null
                                                                                                                      ? getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks.unity.id''',
                                                                                                                        )
                                                                                                                      : getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.projects_backlogs.unity.id''',
                                                                                                                        ),
                                                                                                                  unity: (getJsonField(
                                                                                                                                listaAndamentoItem,
                                                                                                                                r'''$.subtasks.unity.unity''',
                                                                                                                              ) !=
                                                                                                                              null
                                                                                                                          ? getJsonField(
                                                                                                                              listaAndamentoItem,
                                                                                                                              r'''$.subtasks.unity.unity''',
                                                                                                                            )
                                                                                                                          : getJsonField(
                                                                                                                              listaAndamentoItem,
                                                                                                                              r'''$.projects_backlogs.unity.unity''',
                                                                                                                            ))
                                                                                                                      .toString(),
                                                                                                                ),
                                                                                                                unityId: getJsonField(
                                                                                                                  listaAndamentoItem,
                                                                                                                  r'''$.subtasks.unity_id''',
                                                                                                                ),
                                                                                                                quantityDone: getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks''',
                                                                                                                        ) !=
                                                                                                                        null
                                                                                                                    ? getJsonField(
                                                                                                                        listaAndamentoItem,
                                                                                                                        r'''$.subtasks.quantity''',
                                                                                                                      )
                                                                                                                    : 0.0,
                                                                                                                inspection: getJsonField(
                                                                                                                  listaAndamentoItem,
                                                                                                                  r'''$.projects_backlogs.is_inspection''',
                                                                                                                ),
                                                                                                              ));
                                                                                                              safeSetState(() {});
                                                                                                            },
                                                                                                            child: Container(
                                                                                                              width: 30.0,
                                                                                                              height: 30.0,
                                                                                                              decoration: BoxDecoration(),
                                                                                                              alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                              child: Column(
                                                                                                                mainAxisSize: MainAxisSize.max,
                                                                                                                mainAxisAlignment: MainAxisAlignment.center,
                                                                                                                children: [
                                                                                                                  Container(
                                                                                                                    width: 18.0,
                                                                                                                    height: 18.0,
                                                                                                                    decoration: BoxDecoration(
                                                                                                                      color: AppTheme.of(context).secondaryBackground,
                                                                                                                      borderRadius: BorderRadius.circular(4.0),
                                                                                                                      border: Border.all(
                                                                                                                        color: AppTheme.of(context).alternate,
                                                                                                                        width: 2.0,
                                                                                                                      ),
                                                                                                                    ),
                                                                                                                  ),
                                                                                                                ],
                                                                                                              ),
                                                                                                            ),
                                                                                                          ),
                                                                                                        ),
                                                                                                      if (functions.checkIds(
                                                                                                          AppState().taskslist.toList(),
                                                                                                          getJsonField(
                                                                                                            listaAndamentoItem,
                                                                                                            r'''$.id''',
                                                                                                          )))
                                                                                                        Align(
                                                                                                          alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                          child: InkWell(
                                                                                                            splashColor: Colors.transparent,
                                                                                                            focusColor: Colors.transparent,
                                                                                                            hoverColor: Colors.transparent,
                                                                                                            highlightColor: Colors.transparent,
                                                                                                            onTap: () async {
                                                                                                              AppState().removeFromTaskslist(TasksListStruct(
                                                                                                                sprintsTasksId: getJsonField(
                                                                                                                  listaAndamentoItem,
                                                                                                                  r'''$.id''',
                                                                                                                ),
                                                                                                                sprintsTasksStatusesId: 3,
                                                                                                                description: AppConstants.zero ==
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks_id''',
                                                                                                                        )
                                                                                                                    ? valueOrDefault<String>(
                                                                                                                        (getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.projects_backlogs.description''',
                                                                                                                        ) ?? getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.projects_backlogs.tasks_template.description''',
                                                                                                                        ))?.toString(),
                                                                                                                        ' - ',
                                                                                                                      )
                                                                                                                    : valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks.description''',
                                                                                                                        )?.toString(),
                                                                                                                        ' - ',
                                                                                                                      ),
                                                                                                                subtasksId: getJsonField(
                                                                                                                  listaAndamentoItem,
                                                                                                                  r'''$.subtasks_id''',
                                                                                                                ),
                                                                                                                unity: UnityStruct(
                                                                                                                  id: getJsonField(
                                                                                                                            listaAndamentoItem,
                                                                                                                            r'''$.subtasks.unity.id''',
                                                                                                                          ) !=
                                                                                                                          null
                                                                                                                      ? getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks.unity.id''',
                                                                                                                        )
                                                                                                                      : getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.projects_backlogs.unity.id''',
                                                                                                                        ),
                                                                                                                  unity: (getJsonField(
                                                                                                                                listaAndamentoItem,
                                                                                                                                r'''$.subtasks.unity.unity''',
                                                                                                                              ) !=
                                                                                                                              null
                                                                                                                          ? getJsonField(
                                                                                                                              listaAndamentoItem,
                                                                                                                              r'''$.subtasks.unity.unity''',
                                                                                                                            )
                                                                                                                          : getJsonField(
                                                                                                                              listaAndamentoItem,
                                                                                                                              r'''$.projects_backlogs.unity.unity''',
                                                                                                                            ))
                                                                                                                      .toString(),
                                                                                                                ),
                                                                                                                unityId: getJsonField(
                                                                                                                  listaAndamentoItem,
                                                                                                                  r'''$.subtasks.unity_id''',
                                                                                                                ),
                                                                                                                quantityDone: getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks''',
                                                                                                                        ) !=
                                                                                                                        null
                                                                                                                    ? getJsonField(
                                                                                                                        listaAndamentoItem,
                                                                                                                        r'''$.subtasks.quantity''',
                                                                                                                      )
                                                                                                                    : 0.0,
                                                                                                                inspection: getJsonField(
                                                                                                                  listaAndamentoItem,
                                                                                                                  r'''$.projects_backlogs.is_inspection''',
                                                                                                                ),
                                                                                                              ));
                                                                                                              safeSetState(() {});
                                                                                                            },
                                                                                                            child: Container(
                                                                                                              width: 30.0,
                                                                                                              height: 30.0,
                                                                                                              decoration: BoxDecoration(),
                                                                                                              child: Column(
                                                                                                                mainAxisSize: MainAxisSize.max,
                                                                                                                mainAxisAlignment: MainAxisAlignment.center,
                                                                                                                children: [
                                                                                                                  if (functions.checkIds(
                                                                                                                      AppState().taskslist.toList(),
                                                                                                                      getJsonField(
                                                                                                                        listaAndamentoItem,
                                                                                                                        r'''$.id''',
                                                                                                                      )))
                                                                                                                    Container(
                                                                                                                      width: 18.0,
                                                                                                                      height: 18.0,
                                                                                                                      decoration: BoxDecoration(
                                                                                                                        color: AppTheme.of(context).primary,
                                                                                                                        borderRadius: BorderRadius.circular(4.0),
                                                                                                                        border: Border.all(
                                                                                                                          color: AppTheme.of(context).primary,
                                                                                                                          width: 2.0,
                                                                                                                        ),
                                                                                                                      ),
                                                                                                                      alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                                      child: Align(
                                                                                                                        alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                                        child: Stack(
                                                                                                                          alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                                          children: [
                                                                                                                            if (!_model.allCheck)
                                                                                                                              FaIcon(
                                                                                                                                FontAwesomeIcons.check,
                                                                                                                                color: AppTheme.of(context).info,
                                                                                                                                size: 14.0,
                                                                                                                              ),
                                                                                                                            if (_model.allCheck)
                                                                                                                              Container(
                                                                                                                                width: 100.0,
                                                                                                                                height: 3.0,
                                                                                                                                decoration: BoxDecoration(
                                                                                                                                  color: AppTheme.of(context).secondaryBackground,
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
                                                                                                    ],
                                                                                                  ),
                                                                                                ],
                                                                                              ),
                                                                                            ),
                                                                                            Padding(
                                                                                              padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
                                                                                              child: Row(
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
                                                                                                                listaAndamentoItem,
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
                                                                                                              'u0nakc5r' /*   -  */,
                                                                                                            ),
                                                                                                            style: TextStyle(),
                                                                                                          ),
                                                                                                          TextSpan(
                                                                                                            text: AppConstants.zero ==
                                                                                                                    getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.subtasks_id''',
                                                                                                                    )
                                                                                                                ? valueOrDefault<String>(
                                                                                                                    (getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.projects_backlogs.description''',
                                                                                                                    ) ?? getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.projects_backlogs.tasks_template.description''',
                                                                                                                    ))?.toString(),
                                                                                                                    ' - ',
                                                                                                                  )
                                                                                                                : valueOrDefault<String>(
                                                                                                                    getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.subtasks.description''',
                                                                                                                    )?.toString(),
                                                                                                                    ' - ',
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
                                                                                            ),
                                                                                            Padding(
                                                                                              padding: EdgeInsetsDirectional.fromSTEB(12.0, 4.0, 12.0, 4.0),
                                                                                              child: Column(
                                                                                                mainAxisSize: MainAxisSize.max,
                                                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                                                children: [
                                                                                                  Row(
                                                                                                    mainAxisSize: MainAxisSize.max,
                                                                                                    children: [
                                                                                                      RichText(
                                                                                                        textScaler: MediaQuery.of(context).textScaler,
                                                                                                        text: TextSpan(
                                                                                                          children: [
                                                                                                            TextSpan(
                                                                                                              text: AppLocalizations.of(context).getText(
                                                                                                                'howjsi0z' /* Disciplina:  */,
                                                                                                              ),
                                                                                                              style: TextStyle(
                                                                                                                color: AppTheme.of(context).primaryText,
                                                                                                              ),
                                                                                                            ),
                                                                                                            TextSpan(
                                                                                                              text: valueOrDefault<String>(
                                                                                                                getJsonField(
                                                                                                                  listaAndamentoItem,
                                                                                                                  r'''$.projects_backlogs.discipline.discipline''',
                                                                                                                )?.toString(),
                                                                                                                '-',
                                                                                                              ),
                                                                                                              style: AppTheme.of(context).bodyMedium.override(
                                                                                                                    font: GoogleFonts.lexend(
                                                                                                                      fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                                    ),
                                                                                                                    color: AppTheme.of(context).primary,
                                                                                                                    letterSpacing: 0.0,
                                                                                                                    fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                                    fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                                  ),
                                                                                                            )
                                                                                                          ],
                                                                                                          style: AppTheme.of(context).bodyMedium.override(
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
                                                                                                      ),
                                                                                                    ],
                                                                                                  ),
                                                                                                  if ((getJsonField(
                                                                                                            listaAndamentoItem,
                                                                                                            r'''$.subtasks.quantity''',
                                                                                                          ) !=
                                                                                                          null) ||
                                                                                                      (getJsonField(
                                                                                                            listaAndamentoItem,
                                                                                                            r'''$.projects_backlogs.unity
''',
                                                                                                          ) !=
                                                                                                          null))
                                                                                                    Row(
                                                                                                      mainAxisSize: MainAxisSize.max,
                                                                                                      children: [
                                                                                                        RichText(
                                                                                                          textScaler: MediaQuery.of(context).textScaler,
                                                                                                          text: TextSpan(
                                                                                                            children: [
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  '37890zra' /* Qtd da tarefa:  */,
                                                                                                                ),
                                                                                                                style: TextStyle(
                                                                                                                  color: AppTheme.of(context).primaryText,
                                                                                                                ),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: AppConstants.zero ==
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks_id''',
                                                                                                                        )
                                                                                                                    ? valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.projects_backlogs.quantity''',
                                                                                                                        )?.toString(),
                                                                                                                        '0',
                                                                                                                      )
                                                                                                                    : valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks.quantity''',
                                                                                                                        )?.toString(),
                                                                                                                        '0',
                                                                                                                      ),
                                                                                                                style: AppTheme.of(context).bodyMedium.override(
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
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  '7fez8gdm' /*   */,
                                                                                                                ),
                                                                                                                style: TextStyle(),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: AppConstants.zero ==
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks_id''',
                                                                                                                        )
                                                                                                                    ? valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.projects_backlogs.unity.unity''',
                                                                                                                        )?.toString(),
                                                                                                                        '-',
                                                                                                                      )
                                                                                                                    : valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks.unity.unity''',
                                                                                                                        )?.toString(),
                                                                                                                        '-',
                                                                                                                      ),
                                                                                                                style: TextStyle(),
                                                                                                              )
                                                                                                            ],
                                                                                                            style: AppTheme.of(context).bodyMedium.override(
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
                                                                                                        ),
                                                                                                      ],
                                                                                                    ),
                                                                                                ],
                                                                                              ),
                                                                                            ),
                                                                                          ],
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                ].divide(SizedBox(height: 8.0)),
                                                                              ),
                                                                            );
                                                                          },
                                                                        ),
                                                                      );
                                                                    },
                                                                  ),
                                                                ),
                                                              if (SprintsGroup
                                                                      .queryAllSprintsTasksRecordCall
                                                                      .nOandamentoPage(
                                                                    homePageTarefasQueryAllSprintsTasksRecordResponse
                                                                        .jsonBody,
                                                                  )! >
                                                                  _model.page)
                                                                Align(
                                                                  alignment:
                                                                      AlignmentDirectional(
                                                                          -1.0,
                                                                          0.0),
                                                                  child:
                                                                      Padding(
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
                                                                        _model.page =
                                                                            1;
                                                                        _model.perPage =
                                                                            _model.perPage +
                                                                                50;
                                                                        safeSetState(
                                                                            () {});
                                                                        safeSetState(
                                                                            () {
                                                                          _model
                                                                              .clearHomePageCache();
                                                                          _model.apiRequestCompleted =
                                                                              false;
                                                                        });
                                                                        await _model
                                                                            .waitForApiRequestCompleted();
                                                                      },
                                                                      text: AppLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        'euravd3h' /* Ver mais */,
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
                                                                        color: AppTheme.of(context)
                                                                            .secondary,
                                                                        textStyle: AppTheme.of(context)
                                                                            .labelSmall
                                                                            .override(
                                                                              font: GoogleFonts.lexend(
                                                                                fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                              ),
                                                                              color: AppTheme.of(context).primary,
                                                                              letterSpacing: 0.0,
                                                                              fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                              fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                            ),
                                                                        elevation:
                                                                            0.0,
                                                                        borderSide:
                                                                            BorderSide(
                                                                          color:
                                                                              AppTheme.of(context).primary,
                                                                        ),
                                                                        borderRadius:
                                                                            BorderRadius.circular(8.0),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                ),
                                                            ],
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
                                                          child: Column(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .max,
                                                            children: [
                                                              if (!_model
                                                                  .semSucesso)
                                                                Expanded(
                                                                  child:
                                                                      Builder(
                                                                    builder:
                                                                        (context) {
                                                                      final listaAndamento = SprintsGroup
                                                                              .queryAllSprintsTasksRecordCall
                                                                              .yESandamento(
                                                                                homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                                              )
                                                                              ?.toList() ??
                                                                          [];
                                                                      if (listaAndamento
                                                                          .isEmpty) {
                                                                        return Container(
                                                                          width:
                                                                              double.infinity,
                                                                          child:
                                                                              EmptyWidget(),
                                                                        );
                                                                      }

                                                                      return RefreshIndicator(
                                                                        onRefresh:
                                                                            () async {
                                                                          safeSetState(
                                                                              () {
                                                                            _model.clearHomePageCache();
                                                                            _model.apiRequestCompleted =
                                                                                false;
                                                                          });
                                                                          await _model
                                                                              .waitForApiRequestCompleted();
                                                                        },
                                                                        child: ListView
                                                                            .builder(
                                                                          padding:
                                                                              EdgeInsets.zero,
                                                                          primary:
                                                                              false,
                                                                          shrinkWrap:
                                                                              true,
                                                                          scrollDirection:
                                                                              Axis.vertical,
                                                                          itemCount:
                                                                              listaAndamento.length,
                                                                          itemBuilder:
                                                                              (context, listaAndamentoIndex) {
                                                                            final listaAndamentoItem =
                                                                                listaAndamento[listaAndamentoIndex];
                                                                            if (_isOfflineMaskedTask(
                                                                                listaAndamentoItem)) {
                                                                              return const SizedBox.shrink();
                                                                            }
                                                                            return Padding(
                                                                              padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 12.0),
                                                                              child: Column(
                                                                                mainAxisSize: MainAxisSize.max,
                                                                                children: [
                                                                                  Material(
                                                                                    color: Colors.transparent,
                                                                                    elevation: 0.0,
                                                                                    shape: RoundedRectangleBorder(
                                                                                      borderRadius: BorderRadius.circular(14.0),
                                                                                    ),
                                                                                    child: Container(
                                                                                      width: MediaQuery.sizeOf(context).width * 1.0,
                                                                                      decoration: BoxDecoration(
                                                                                        color: Colors.white,
                                                                                        borderRadius: BorderRadius.circular(14.0),
                                                                                        boxShadow: [
                                                                                          BoxShadow(
                                                                                            color: Colors.black.withOpacity(0.07),
                                                                                            blurRadius: 12,
                                                                                            offset: const Offset(0, 3),
                                                                                          ),
                                                                                        ],
                                                                                        border: Border.all(
                                                                                          color: const Color(0xFFE8EAED),
                                                                                        ),
                                                                                      ),
                                                                                      child: Padding(
                                                                                        padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 12.0),
                                                                                        child: Column(
                                                                                          mainAxisSize: MainAxisSize.min,
                                                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                                                          children: [
                                                                                            if (AppConstants.zero !=
                                                                                                getJsonField(
                                                                                                  listaAndamentoItem,
                                                                                                  r'''$.subtasks_id''',
                                                                                                ))
                                                                                              Container(
                                                                                                width: double.infinity,
                                                                                                decoration: BoxDecoration(
                                                                                                  gradient: const LinearGradient(
                                                                                                    begin: Alignment.topLeft,
                                                                                                    end: Alignment.bottomRight,
                                                                                                    colors: [Color(0xFF3B6EC8), Color(0xFF487EDA)],
                                                                                                  ),
                                                                                                  borderRadius: BorderRadius.only(
                                                                                                    bottomLeft: Radius.circular(0.0),
                                                                                                    bottomRight: Radius.circular(0.0),
                                                                                                    topLeft: Radius.circular(14.0),
                                                                                                    topRight: Radius.circular(14.0),
                                                                                                  ),
                                                                                                ),
                                                                                                child: Padding(
                                                                                                  padding: EdgeInsetsDirectional.fromSTEB(14.0, 10.0, 14.0, 6.0),
                                                                                                  child: Text(
                                                                                                    valueOrDefault<String>(
                                                                                                      'Tarefa: ${valueOrDefault<String>(
                                                                                                        getJsonField(
                                                                                                          listaAndamentoItem,
                                                                                                          r'''$.projects_backlogs.id''',
                                                                                                        )?.toString(),
                                                                                                        '0',
                                                                                                      )} - ${(getJsonField(
                                                                                                        listaAndamentoItem,
                                                                                                        r'''$.projects_backlogs.description''',
                                                                                                      ) ?? getJsonField(
                                                                                                        listaAndamentoItem,
                                                                                                        r'''$.projects_backlogs.tasks_template.description''',
                                                                                                      ) ?? '').toString()}',
                                                                                                      '-',
                                                                                                    ),
                                                                                                    style: AppTheme.of(context).bodyMedium.override(
                                                                                                          font: GoogleFonts.lexend(
                                                                                                            fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                          ),
                                                                                                          color: AppTheme.of(context).secondaryBackground,
                                                                                                          letterSpacing: 0.0,
                                                                                                          fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                          fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                        ),
                                                                                                  ),
                                                                                                ),
                                                                                              ),
                                                                                            Padding(
                                                                                              padding: EdgeInsets.all(12.0),
                                                                                              child: Row(
                                                                                                mainAxisSize: MainAxisSize.max,
                                                                                                mainAxisAlignment: MainAxisAlignment.end,
                                                                                                children: [
                                                                                                  Row(
                                                                                                    mainAxisSize: MainAxisSize.max,
                                                                                                    children: [
                                                                                                      if (!functions.checkIds(
                                                                                                          AppState().taskslist.toList(),
                                                                                                          getJsonField(
                                                                                                            listaAndamentoItem,
                                                                                                            r'''$.id''',
                                                                                                          )))
                                                                                                        InkWell(
                                                                                                          splashColor: Colors.transparent,
                                                                                                          focusColor: Colors.transparent,
                                                                                                          hoverColor: Colors.transparent,
                                                                                                          highlightColor: Colors.transparent,
                                                                                                          onTap: () async {
                                                                                                            AppState().addToTaskslist(TasksListStruct(
                                                                                                              sprintsTasksId: getJsonField(
                                                                                                                listaAndamentoItem,
                                                                                                                r'''$.id''',
                                                                                                              ),
                                                                                                              description: (getJsonField(
                                                                                                                listaAndamentoItem,
                                                                                                                r'''$.projects_backlogs.description''',
                                                                                                              ) ?? getJsonField(
                                                                                                                listaAndamentoItem,
                                                                                                                r'''$.projects_backlogs.tasks_template.description''',
                                                                                                              ) ?? '').toString(),
                                                                                                            ));
                                                                                                            safeSetState(() {});
                                                                                                          },
                                                                                                          child: Container(
                                                                                                            width: 30.0,
                                                                                                            height: 30.0,
                                                                                                            decoration: BoxDecoration(),
                                                                                                            alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                            child: Column(
                                                                                                              mainAxisSize: MainAxisSize.max,
                                                                                                              mainAxisAlignment: MainAxisAlignment.center,
                                                                                                              children: [
                                                                                                                if (!functions.checkIds(
                                                                                                                    AppState().taskslist.toList(),
                                                                                                                    getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.id''',
                                                                                                                    )))
                                                                                                                  Container(
                                                                                                                    width: 18.0,
                                                                                                                    height: 18.0,
                                                                                                                    decoration: BoxDecoration(
                                                                                                                      color: AppTheme.of(context).secondaryBackground,
                                                                                                                      borderRadius: BorderRadius.circular(4.0),
                                                                                                                      border: Border.all(
                                                                                                                        color: AppTheme.of(context).alternate,
                                                                                                                        width: 2.0,
                                                                                                                      ),
                                                                                                                    ),
                                                                                                                  ),
                                                                                                              ],
                                                                                                            ),
                                                                                                          ),
                                                                                                        ),
                                                                                                      if (functions.checkIds(
                                                                                                          AppState().taskslist.toList(),
                                                                                                          getJsonField(
                                                                                                            listaAndamentoItem,
                                                                                                            r'''$.id''',
                                                                                                          )))
                                                                                                        InkWell(
                                                                                                          splashColor: Colors.transparent,
                                                                                                          focusColor: Colors.transparent,
                                                                                                          hoverColor: Colors.transparent,
                                                                                                          highlightColor: Colors.transparent,
                                                                                                          onTap: () async {
                                                                                                            AppState().removeFromTaskslist(TasksListStruct(
                                                                                                              sprintsTasksId: getJsonField(
                                                                                                                listaAndamentoItem,
                                                                                                                r'''$.id''',
                                                                                                              ),
                                                                                                              description: (getJsonField(
                                                                                                                listaAndamentoItem,
                                                                                                                r'''$.projects_backlogs.description''',
                                                                                                              ) ?? getJsonField(
                                                                                                                listaAndamentoItem,
                                                                                                                r'''$.projects_backlogs.tasks_template.description''',
                                                                                                              ) ?? '').toString(),
                                                                                                            ));
                                                                                                            safeSetState(() {});
                                                                                                          },
                                                                                                          child: Container(
                                                                                                            width: 30.0,
                                                                                                            height: 30.0,
                                                                                                            decoration: BoxDecoration(),
                                                                                                            alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                            child: Column(
                                                                                                              mainAxisSize: MainAxisSize.max,
                                                                                                              mainAxisAlignment: MainAxisAlignment.center,
                                                                                                              children: [
                                                                                                                Container(
                                                                                                                  width: 18.0,
                                                                                                                  height: 18.0,
                                                                                                                  decoration: BoxDecoration(
                                                                                                                    color: AppTheme.of(context).primary,
                                                                                                                    borderRadius: BorderRadius.circular(4.0),
                                                                                                                    border: Border.all(
                                                                                                                      color: AppTheme.of(context).primary,
                                                                                                                      width: 2.0,
                                                                                                                    ),
                                                                                                                  ),
                                                                                                                  alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                                  child: Align(
                                                                                                                    alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                                    child: Stack(
                                                                                                                      alignment: AlignmentDirectional(0.0, 0.0),
                                                                                                                      children: [
                                                                                                                        if (!_model.allCheck)
                                                                                                                          FaIcon(
                                                                                                                            FontAwesomeIcons.check,
                                                                                                                            color: AppTheme.of(context).info,
                                                                                                                            size: 14.0,
                                                                                                                          ),
                                                                                                                        if (_model.allCheck)
                                                                                                                          Container(
                                                                                                                            width: 100.0,
                                                                                                                            height: 3.0,
                                                                                                                            decoration: BoxDecoration(
                                                                                                                              color: AppTheme.of(context).secondaryBackground,
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
                                                                                                    ],
                                                                                                  ),
                                                                                                ],
                                                                                              ),
                                                                                            ),
                                                                                            Padding(
                                                                                              padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
                                                                                              child: Row(
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
                                                                                                                listaAndamentoItem,
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
                                                                                                              'ccsg2rxk' /*  -  */,
                                                                                                            ),
                                                                                                            style: TextStyle(),
                                                                                                          ),
                                                                                                          TextSpan(
                                                                                                            text: AppConstants.zero ==
                                                                                                                    getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.subtasks_id''',
                                                                                                                    )
                                                                                                                ? valueOrDefault<String>(
                                                                                                                    (getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.projects_backlogs.description''',
                                                                                                                    ) ?? getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.projects_backlogs.tasks_template.description''',
                                                                                                                    ))?.toString(),
                                                                                                                    ' - ',
                                                                                                                  )
                                                                                                                : valueOrDefault<String>(
                                                                                                                    getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.subtasks.description''',
                                                                                                                    )?.toString(),
                                                                                                                    ' - ',
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
                                                                                            ),
                                                                                            Padding(
                                                                                              padding: EdgeInsetsDirectional.fromSTEB(12.0, 4.0, 12.0, 4.0),
                                                                                              child: Column(
                                                                                                mainAxisSize: MainAxisSize.max,
                                                                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                                                                children: [
                                                                                                  Row(
                                                                                                    mainAxisSize: MainAxisSize.max,
                                                                                                    children: [
                                                                                                      RichText(
                                                                                                        textScaler: MediaQuery.of(context).textScaler,
                                                                                                        text: TextSpan(
                                                                                                          children: [
                                                                                                            TextSpan(
                                                                                                              text: AppLocalizations.of(context).getText(
                                                                                                                '50jptsec' /* Disciplina:  */,
                                                                                                              ),
                                                                                                              style: TextStyle(
                                                                                                                color: AppTheme.of(context).primaryText,
                                                                                                              ),
                                                                                                            ),
                                                                                                            TextSpan(
                                                                                                              text: valueOrDefault<String>(
                                                                                                                getJsonField(
                                                                                                                  listaAndamentoItem,
                                                                                                                  r'''$.projects_backlogs.discipline.discipline''',
                                                                                                                )?.toString(),
                                                                                                                '-',
                                                                                                              ),
                                                                                                              style: AppTheme.of(context).bodyMedium.override(
                                                                                                                    font: GoogleFonts.lexend(
                                                                                                                      fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                                      fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                                    ),
                                                                                                                    color: AppTheme.of(context).primary,
                                                                                                                    letterSpacing: 0.0,
                                                                                                                    fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                                    fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                                  ),
                                                                                                            )
                                                                                                          ],
                                                                                                          style: AppTheme.of(context).bodyMedium.override(
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
                                                                                                      ),
                                                                                                    ],
                                                                                                  ),
                                                                                                  if ((getJsonField(
                                                                                                            listaAndamentoItem,
                                                                                                            r'''$.subtasks.quantity''',
                                                                                                          ) !=
                                                                                                          null) ||
                                                                                                      (getJsonField(
                                                                                                            listaAndamentoItem,
                                                                                                            r'''$.projects_backlogs.projects_backlogs_original.unity
''',
                                                                                                          ) !=
                                                                                                          null))
                                                                                                    Row(
                                                                                                      mainAxisSize: MainAxisSize.max,
                                                                                                      children: [
                                                                                                        RichText(
                                                                                                          textScaler: MediaQuery.of(context).textScaler,
                                                                                                          text: TextSpan(
                                                                                                            children: [
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  'molmv2zx' /* Qtd da tarefa:  */,
                                                                                                                ),
                                                                                                                style: TextStyle(
                                                                                                                  color: AppTheme.of(context).primaryText,
                                                                                                                ),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: AppConstants.zero ==
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks_id''',
                                                                                                                        )
                                                                                                                    ? valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.projects_backlogs.projects_backlogs_original.quantity''',
                                                                                                                        )?.toString(),
                                                                                                                        '0',
                                                                                                                      )
                                                                                                                    : valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks.quantity''',
                                                                                                                        )?.toString(),
                                                                                                                        '0',
                                                                                                                      ),
                                                                                                                style: AppTheme.of(context).bodyMedium.override(
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
                                                                                                              TextSpan(
                                                                                                                text: AppLocalizations.of(context).getText(
                                                                                                                  'dhmhzrhr' /*   */,
                                                                                                                ),
                                                                                                                style: TextStyle(),
                                                                                                              ),
                                                                                                              TextSpan(
                                                                                                                text: AppConstants.zero ==
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks_id''',
                                                                                                                        )
                                                                                                                    ? valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.projects_backlogs.projects_backlogs_original.unity.unity''',
                                                                                                                        )?.toString(),
                                                                                                                        '-',
                                                                                                                      )
                                                                                                                    : valueOrDefault<String>(
                                                                                                                        getJsonField(
                                                                                                                          listaAndamentoItem,
                                                                                                                          r'''$.subtasks.unity.unity''',
                                                                                                                        )?.toString(),
                                                                                                                        '-',
                                                                                                                      ),
                                                                                                                style: TextStyle(),
                                                                                                              )
                                                                                                            ],
                                                                                                            style: AppTheme.of(context).bodyMedium.override(
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
                                                                                                        ),
                                                                                                      ],
                                                                                                    ),
                                                                                                  if ((getJsonField(
                                                                                                            listaAndamentoItem,
                                                                                                            r'''$.subtasks.quantity''',
                                                                                                          ) !=
                                                                                                          null) ||
                                                                                                      (getJsonField(
                                                                                                            listaAndamentoItem,
                                                                                                            r'''$.projects_backlogs.projects_backlogs_original.unity
''',
                                                                                                          ) !=
                                                                                                          null))
                                                                                                    RichText(
                                                                                                      textScaler: MediaQuery.of(context).textScaler,
                                                                                                      text: TextSpan(
                                                                                                        children: [
                                                                                                          TextSpan(
                                                                                                            text: AppLocalizations.of(context).getText(
                                                                                                              'ra4xc42o' /* Qtd executada:  */,
                                                                                                            ),
                                                                                                            style: TextStyle(
                                                                                                              color: AppTheme.of(context).primaryText,
                                                                                                            ),
                                                                                                          ),
                                                                                                          TextSpan(
                                                                                                            text: valueOrDefault<String>(
                                                                                                              () {
                                                                                                                if (getJsonField(
                                                                                                                  listaAndamentoItem,
                                                                                                                  r'''$.projects_backlogs.is_inspection''',
                                                                                                                )) {
                                                                                                                  return valueOrDefault<String>(
                                                                                                                    getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.projects_backlogs.projects_backlogs_original.quantity_done''',
                                                                                                                    )?.toString(),
                                                                                                                    '0',
                                                                                                                  );
                                                                                                                } else if (AppConstants.zero ==
                                                                                                                    getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.subtasks_id''',
                                                                                                                    )) {
                                                                                                                  return valueOrDefault<String>(
                                                                                                                    getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.projects_backlogs.projects_backlogs_original.quantity''',
                                                                                                                    )?.toString(),
                                                                                                                    '0',
                                                                                                                  );
                                                                                                                } else {
                                                                                                                  return valueOrDefault<String>(
                                                                                                                    getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.subtasks.quantity''',
                                                                                                                    )?.toString(),
                                                                                                                    '0',
                                                                                                                  );
                                                                                                                }
                                                                                                              }(),
                                                                                                              '0',
                                                                                                            ),
                                                                                                            style: AppTheme.of(context).bodyMedium.override(
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
                                                                                                          TextSpan(
                                                                                                            text: AppLocalizations.of(context).getText(
                                                                                                              '0a6bjk1z' /*   */,
                                                                                                            ),
                                                                                                            style: TextStyle(),
                                                                                                          ),
                                                                                                          TextSpan(
                                                                                                            text: AppConstants.zero ==
                                                                                                                    getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.subtasks_id''',
                                                                                                                    )
                                                                                                                ? valueOrDefault<String>(
                                                                                                                    getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.projects_backlogs.projects_backlogs_original.unity.unity''',
                                                                                                                    )?.toString(),
                                                                                                                    '-',
                                                                                                                  )
                                                                                                                : valueOrDefault<String>(
                                                                                                                    getJsonField(
                                                                                                                      listaAndamentoItem,
                                                                                                                      r'''$.subtasks.unity.unity''',
                                                                                                                    )?.toString(),
                                                                                                                    '-',
                                                                                                                  ),
                                                                                                            style: TextStyle(),
                                                                                                          )
                                                                                                        ],
                                                                                                        style: AppTheme.of(context).bodyMedium.override(
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
                                                                                                    ),
                                                                                                ],
                                                                                              ),
                                                                                            ),
                                                                                          ],
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                ].divide(SizedBox(height: 8.0)),
                                                                              ),
                                                                            );
                                                                          },
                                                                        ),
                                                                      );
                                                                    },
                                                                  ),
                                                                ),
                                                              if (SprintsGroup
                                                                      .queryAllSprintsTasksRecordCall
                                                                      .yESandamentoPage(
                                                                    homePageTarefasQueryAllSprintsTasksRecordResponse
                                                                        .jsonBody,
                                                                  )! >
                                                                  _model.page)
                                                                Align(
                                                                  alignment:
                                                                      AlignmentDirectional(
                                                                          -1.0,
                                                                          0.0),
                                                                  child:
                                                                      Padding(
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
                                                                        _model.page =
                                                                            1;
                                                                        _model.perPage =
                                                                            _model.perPage +
                                                                                50;
                                                                        safeSetState(
                                                                            () {});
                                                                        safeSetState(
                                                                            () {
                                                                          _model
                                                                              .clearHomePageCache();
                                                                          _model.apiRequestCompleted =
                                                                              false;
                                                                        });
                                                                        await _model
                                                                            .waitForApiRequestCompleted();
                                                                      },
                                                                      text: AppLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        'jbltf1jo' /* Ver mais */,
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
                                                                        color: AppTheme.of(context)
                                                                            .secondary,
                                                                        textStyle: AppTheme.of(context)
                                                                            .labelSmall
                                                                            .override(
                                                                              font: GoogleFonts.lexend(
                                                                                fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                              ),
                                                                              color: AppTheme.of(context).primary,
                                                                              letterSpacing: 0.0,
                                                                              fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                              fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                            ),
                                                                        elevation:
                                                                            0.0,
                                                                        borderSide:
                                                                            BorderSide(
                                                                          color:
                                                                              AppTheme.of(context).primary,
                                                                        ),
                                                                        borderRadius:
                                                                            BorderRadius.circular(8.0),
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
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                  if (_model.tabBarCurrentIndex == 0)
                                    Builder(
                                      builder: (context) => AppButton(
                                        onPressed: !(AppState()
                                                .taskslist
                                                .isNotEmpty)
                                            ? null
                                            : () async {
                                                AppState().tasksfinish = [];
                                                safeSetState(() {});
                                                AppState().tasksfinish =
                                                    AppState()
                                                        .taskslist
                                                        .toList()
                                                        .cast<
                                                            TasksListStruct>();
                                                safeSetState(() {});
                                                await showDialog(
                                                  barrierColor:
                                                      Color(0x80000000),
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
                                                          FocusManager.instance
                                                              .primaryFocus
                                                              ?.unfocus();
                                                        },
                                                        child:
                                                            ConfirmdialogWidget(
                                                          action: () async {
                                                            safeSetState(() {
                                                              _model
                                                                  .clearHomePageCache();
                                                              _model.apiRequestCompleted =
                                                                  false;
                                                            });
                                                            await _model
                                                                .waitForApiRequestCompleted();
                                                          },
                                                        ),
                                                      ),
                                                    );
                                                  },
                                                );
                                              },
                                        text:
                                            AppLocalizations.of(context).getText(
                                          'vdzgy00m' /* Concluir tarefas selecionadas */,
                                        ),
                                        options: AppButtonOptions(
                                          width:
                                              MediaQuery.sizeOf(context).width *
                                                  1.0,
                                          height: 48.0,
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  16.0, 0.0, 16.0, 0.0),
                                          iconPadding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  0.0, 0.0, 0.0, 0.0),
                                          color: AppTheme.of(context)
                                              .primary,
                                          textStyle: AppTheme.of(
                                                  context)
                                              .titleSmall
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight:
                                                      AppTheme.of(
                                                              context)
                                                          .titleSmall
                                                          .fontWeight,
                                                  fontStyle:
                                                      AppTheme.of(
                                                              context)
                                                          .titleSmall
                                                          .fontStyle,
                                                ),
                                                color: Colors.white,
                                                letterSpacing: 0.0,
                                                fontWeight:
                                                    AppTheme.of(context)
                                                        .titleSmall
                                                        .fontWeight,
                                                fontStyle:
                                                    AppTheme.of(context)
                                                        .titleSmall
                                                        .fontStyle,
                                              ),
                                          elevation: 0.0,
                                          borderRadius:
                                              BorderRadius.circular(14.0),
                                          disabledColor:
                                              AppTheme.of(context)
                                                  .alternate,
                                          disabledTextColor:
                                              AppTheme.of(context)
                                                  .secondaryText,
                                        ),
                                      ),
                                    ),
                                  if (_model.tabBarCurrentIndex == 1)
                                    Builder(
                                      builder: (context) => Padding(
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            0.0, 8.0, 0.0, 0.0),
                                        child: AppButton(
                                          onPressed: !(AppState()
                                                  .taskslist
                                                  .isNotEmpty)
                                              ? null
                                              : () async {
                                                  AppState().tasksfinish = [];
                                                  AppState().update(() {});
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
                                                              CommentInspWidget(
                                                            refresh: () async {
                                                              safeSetState(() {
                                                                _model
                                                                    .clearHomePageCache();
                                                                _model.apiRequestCompleted =
                                                                    false;
                                                              });
                                                              await _model
                                                                  .waitForApiRequestCompleted();
                                                            },
                                                          ),
                                                        ),
                                                      );
                                                    },
                                                  );
                                                },
                                          text: AppLocalizations.of(context)
                                              .getText(
                                            'sqrjnpce' /* Finalizar Inspeções */,
                                          ),
                                          options: AppButtonOptions(
                                            width: MediaQuery.sizeOf(context)
                                                    .width *
                                                1.0,
                                            height: 48.0,
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    16.0, 0.0, 16.0, 0.0),
                                            iconPadding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    0.0, 0.0, 0.0, 0.0),
                                            color: AppTheme.of(context)
                                                .primary,
                                            textStyle:
                                                AppTheme.of(context)
                                                    .titleSmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            AppTheme.of(
                                                                    context)
                                                                .titleSmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            AppTheme.of(
                                                                    context)
                                                                .titleSmall
                                                                .fontStyle,
                                                      ),
                                                      color: Colors.white,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          AppTheme.of(
                                                                  context)
                                                              .titleSmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .titleSmall
                                                              .fontStyle,
                                                    ),
                                            elevation: 0.0,
                                            borderRadius:
                                                BorderRadius.circular(14.0),
                                            disabledColor:
                                                AppTheme.of(context)
                                                    .alternate,
                                            disabledTextColor:
                                                AppTheme.of(context)
                                                    .secondaryText,
                                          ),
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
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
