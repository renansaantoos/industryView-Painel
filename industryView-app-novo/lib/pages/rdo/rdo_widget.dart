import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/components/logout_widget.dart';
import '/components/modal_info_widget.dart';
import '/components/nav_bar_widget.dart';
import '/components/offline_banner_widget.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/utils/upload_data.dart';
import '/core/widgets/app_drop_down.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/widgets/form_field_controller.dart';
import '/database/daos/rdo_finalization_dao.dart';
import '/services/network_service.dart';
import '/index.dart';
import '/core/navigation/nav.dart';

import 'rdo_model.dart';
export 'rdo_model.dart';

// ─── Color constants ────────────────────────────────────────────────────────
const _kGreen = Color(0xFF10B981);

// ─── Widget principal ────────────────────────────────────────────────────────
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

  // Data loading state
  bool _dataLoaded = false;
  String? _loadError;

  // API data
  dynamic _sprintJson;
  dynamic _scheduleJson;

  // Extracted data
  List _pendentes = [];
  List _emAndamento = [];
  List _concluidas = [];          // Concluídas filtradas ao schedule ativo (para RDO)
  List _allSprintConcluidas = []; // Todas as concluídas da sprint (para card de progresso)
  List _semSucesso = [];
  List _inspecao = [];
  String _sprintTitle = '';
  List<dynamic> _uniqueWorkers = [];

  // Animation controllers
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => RdoModel());

    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    );

    _initAsync();

    _connectionSubscription = NetworkService.instance.listenConnection(
      (isConnected) {
        if (isConnected && _dataLoaded) _loadApiData();
        if (mounted) setState(() {});
      },
    );
  }

  Future<void> _initAsync() async {
    // Check local finalization status
    try {
      _model.isFinalizedToday = await RdoFinalizationDao().wasFinalizedToday();
    } catch (e) {
      if (kDebugMode) print('RDO: Erro verificacao local: $e');
    }
    if (mounted) setState(() {});

    // Verificar se tem schedule ativo — se não, voltar para seleção
    final hasSchedule = AppState().user.sheduleId > 0;
    if (!hasSchedule) {
      if (mounted) {
        context.goNamedAuth(
          PageCheckQrcodeWidget.routeName,
          context.mounted,
          extra: <String, dynamic>{
            kTransitionInfoKey: const TransitionInfo(
              hasTransition: true,
              transitionType: PageTransitionType.fade,
              duration: Duration(milliseconds: 250),
            ),
            'skipProjectCheck': true,
          },
        );
      }
      return;
    }

    await _loadApiData();
  }

  Future<void> _loadApiData() async {
    try {
      final results = await Future.wait([
        SprintsGroup.queryAllSprintsTasksRecordCall.call(
          projectsId: AppState().user.projectId,
          teamsId: AppState().user.teamsId,
          token: currentAuthenticationToken,
          page: 1,
          perPage: 50,
          search: '',
          sprintsId: AppState().user.sprint.id,
          equipamentsTypesId: 0,
        ),
        ProjectsGroup.queryAllScheduleCall.call(
          projectsId: AppState().user.projectId,
          teamsId: AppState().user.teamsId,
          sprintsId: AppState().user.sprint.id,
          token: currentAuthenticationToken,
        ),
      ]).timeout(const Duration(seconds: 15));

      _sprintJson = results[0].jsonBody;
      _scheduleJson = results[1].jsonBody;
      _extractData();
      _loadError = null;
    } catch (e) {
      if (kDebugMode) print('RDO: Erro ao carregar dados: $e');
      _loadError = e.toString();
    }

    _dataLoaded = true;
    if (mounted) {
      setState(() {});
      _fadeController.forward();
    }
  }

  void _extractData() {
    try {
      _pendentes =
          SprintsGroup.queryAllSprintsTasksRecordCall.pendentes(_sprintJson) ??
              [];
      _emAndamento =
          SprintsGroup.queryAllSprintsTasksRecordCall.nOandamento(_sprintJson) ??
              [];
      _semSucesso =
          SprintsGroup.queryAllSprintsTasksRecordCall.nOsemSucesso(_sprintJson) ??
              [];
      _inspecao =
          SprintsGroup.queryAllSprintsTasksRecordCall.yESandamento(_sprintJson) ??
              [];
      _sprintTitle =
          SprintsGroup.queryAllSprintsTasksRecordCall.nOtitle(_sprintJson) ??
              AppState().user.sprint.title;

      // Concluídas: usar apenas tarefas vinculadas ao schedule ativo
      // (via schedule_sprints_tasks), não todas as concluídas da sprint
      _allSprintConcluidas =
          SprintsGroup.queryAllSprintsTasksRecordCall.nOconcluidas(_sprintJson) ??
              [];
      final allSprintConcluidas = _allSprintConcluidas;
      final scheduleTasks =
          ProjectsGroup.queryAllScheduleCall.listaTasksOfSchedule(_scheduleJson) ?? [];
      // Extrair IDs das tarefas vinculadas ao schedule ativo
      final scheduleTaskIds = <int>{};
      for (final tg in scheduleTasks) {
        if (tg is List) {
          for (final t in tg) {
            final tid = t is Map ? (t['id'] as int?) : null;
            if (tid != null) scheduleTaskIds.add(tid);
          }
        } else if (tg is Map) {
          final tid = tg['id'] as int?;
          if (tid != null) scheduleTaskIds.add(tid);
        }
      }

      if (scheduleTaskIds.isNotEmpty) {
        // Filtrar concluídas: somente as vinculadas ao schedule ativo
        _concluidas = allSprintConcluidas.where((task) {
          final taskId = getJsonField(task, r'''$.id''');
          return taskId != null && scheduleTaskIds.contains(taskId is int ? taskId : int.tryParse(taskId.toString()));
        }).toList();
      } else {
        // Se nenhuma tarefa vinculada ao schedule, lista vazia (schedule recém-criado)
        _concluidas = [];
      }

      if (kDebugMode) {
        print('RDO: Sprint concluídas=${allSprintConcluidas.length}, Schedule tasks=$scheduleTaskIds, Filtered concluídas=${_concluidas.length}');
      }
    } catch (e) {
      if (kDebugMode) print('RDO: Erro extrair sprint: $e');
    }

    try {
      final scheduleWorkers =
          ProjectsGroup.queryAllScheduleCall.listaUser(_scheduleJson) ?? [];
      final allWorkers = <dynamic>[];
      for (final wg in scheduleWorkers) {
        if (wg is List) {
          allWorkers.addAll(wg);
        } else if (wg != null) {
          allWorkers.add(wg);
        }
      }
      final seenIds = <dynamic>{};
      _uniqueWorkers = [];
      for (final w in allWorkers) {
        final wId = getJsonField(w, r'''$.users_id''') ??
            getJsonField(w, r'''$.id''');
        if (wId != null && seenIds.add(wId)) _uniqueWorkers.add(w);
      }
    } catch (e) {
      if (kDebugMode) print('RDO: Erro extrair workers: $e');
    }
  }

  @override
  void dispose() {
    _connectionSubscription?.cancel();
    _fadeController.dispose();
    _model.dispose();
    super.dispose();
  }

  // ─── BUILD ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    context.watch<AppState>();
    final theme = AppTheme.of(context);

    return GestureDetector(
      onTap: () => FocusScope.of(context).unfocus(),
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: const Color(0xFFF5F7FA),
        appBar: PreferredSize(
          preferredSize: const Size.fromHeight(85.0),
          child: AppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            automaticallyImplyLeading: false,
            systemOverlayStyle: const SystemUiOverlayStyle(
              statusBarColor: Colors.transparent,
              statusBarIconBrightness: Brightness.light,
              statusBarBrightness: Brightness.dark,
            ),
            actions: const [],
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
                  padding: const EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 4.0),
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
                                padding: const EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 12.0, 0.0),
                                child: InkWell(
                                  splashColor: Colors.transparent,
                                  focusColor: Colors.transparent,
                                  hoverColor: Colors.transparent,
                                  highlightColor: Colors.transparent,
                                  onTap: () async {
                                    showDialog(
                                      barrierColor: const Color(0x80000000),
                                      context: context,
                                      builder: (dialogContext) {
                                        return Dialog(
                                          elevation: 0,
                                          insetPadding: EdgeInsets.zero,
                                          backgroundColor: Colors.transparent,
                                          alignment: const AlignmentDirectional(-1.0, -1.0)
                                              .resolve(Directionality.of(context)),
                                          child: GestureDetector(
                                            onTap: () {
                                              FocusScope.of(dialogContext).unfocus();
                                              FocusManager.instance.primaryFocus?.unfocus();
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
                                      color: Colors.white.withValues(alpha: 0.15),
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: Colors.white.withValues(alpha: 0.4),
                                        width: 2.0,
                                      ),
                                    ),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(100.0),
                                      child: CachedNetworkImage(
                                        imageUrl: valueOrDefault<String>(
                                          AppState().user.image,
                                          'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg',
                                        ),
                                        width: 48.0,
                                        height: 48.0,
                                        fit: BoxFit.cover,
                                        placeholder: (context, url) => Container(
                                          color: theme.secondaryBackground,
                                        ),
                                        errorWidget: (context, url, error) => Container(
                                          color: theme.secondaryBackground,
                                          child: Icon(
                                            Icons.person,
                                            color: theme.secondaryText,
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
                                  'Olá',
                                  style: GoogleFonts.lexend(
                                    fontSize: 12.0,
                                    fontWeight: FontWeight.w400,
                                    color: Colors.white.withValues(alpha: 0.75),
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
                              fillColor: Colors.white.withValues(alpha: 0.15),
                              icon: const Icon(
                                Icons.qr_code_rounded,
                                color: Colors.white,
                                size: 18.0,
                              ),
                              onPressed: () {
                                context.goNamedAuth(
                                  PageCheckQrcodeWidget.routeName,
                                  context.mounted,
                                  extra: <String, dynamic>{
                                    kTransitionInfoKey: const TransitionInfo(
                                      hasTransition: true,
                                      transitionType: PageTransitionType.fade,
                                      duration: Duration(milliseconds: 250),
                                    ),
                                  },
                                );
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
                              if (val == null) return;
                              safeSetState(() => _model.dropDownValue2 = val);
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
                            fillColor: Colors.white.withValues(alpha: 0.15),
                            elevation: 0.0,
                            borderColor: Colors.white.withValues(alpha: 0.25),
                            borderWidth: 1.0,
                            borderRadius: 10.0,
                            margin: const EdgeInsetsDirectional.fromSTEB(4.0, 0.0, 0.0, 0.0),
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
              // ── Main content (padded to avoid NavBar overlap) ───────────────
              Padding(
                padding: const EdgeInsetsDirectional.fromSTEB(16, 8, 16, 16),
                child: Column(
                  children: [
                    const OfflineBannerWidget(),
                    if (_model.isFinalizedToday)
                      _buildFinalizedBanner(theme),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsetsDirectional.fromSTEB(0, 0, 0, 64),
                        child: !_dataLoaded
                            ? _buildLoadingState(theme)
                            : RefreshIndicator(
                                onRefresh: _loadApiData,
                                color: theme.primary,
                                displacement: 20,
                                child: FadeTransition(
                                  opacity: _fadeAnimation,
                                  child: SingleChildScrollView(
                                    physics: const AlwaysScrollableScrollPhysics(),
                                    padding: const EdgeInsets.only(top: 10, bottom: 16),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        if (_loadError != null)
                                          _buildErrorBanner(theme),

                                        // Sprint progress card (identical to home)
                                        _buildSprintCard(theme),
                                        const SizedBox(height: 24),

                                        // Completed tasks
                                        _buildSectionHeader(
                                          theme,
                                          'Tarefas Realizadas',
                                          Icons.task_alt_rounded,
                                          badge: _concluidas.length,
                                        ),
                                        const SizedBox(height: 10),
                                        _buildTasksCard(theme),
                                        const SizedBox(height: 24),

                                        // Workers of the day
                                        _buildSectionHeader(
                                          theme,
                                          'Funcionários do Dia',
                                          Icons.people_rounded,
                                          badge: _uniqueWorkers.length,
                                        ),
                                        const SizedBox(height: 10),
                                        _buildWorkersCard(theme),
                                        const SizedBox(height: 24),

                                        // Photos
                                        _buildSectionHeader(
                                          theme,
                                          'Fotos da Obra',
                                          Icons.camera_alt_rounded,
                                          badge: _model.selectedPhotos.length,
                                          badgeColor: _model.selectedPhotos.length >= 3
                                              ? _kGreen
                                              : theme.error,
                                        ),
                                        const SizedBox(height: 10),
                                        _buildPhotosCard(theme),
                                        const SizedBox(height: 28),

                                        // Finalize button
                                        if (!_model.isFinalizedToday)
                                          _buildFinalizeButton(theme),
                                        const SizedBox(height: 8),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                      ),
                    ),
                  ],
                ),
              ),

              // ── NavBar (must be in Stack, uses Align internally) ────────────
              Align(
                alignment: const AlignmentDirectional(0.0, 1.0),
                child: wrapWithModel(
                  model: _model.navBarModel,
                  updateCallback: () => safeSetState(() {}),
                  child: const NavBarWidget(page: 2),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Finalized banner ───────────────────────────────────────────────────────

  Widget _buildFinalizedBanner(AppTheme theme) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF059669), Color(0xFF10B981)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: const BoxDecoration(
              color: Colors.white24,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check_rounded,
              color: Colors.white,
              size: 14,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'RDO finalizada hoje',
              style: GoogleFonts.lexend(
                fontWeight: FontWeight.w600,
                color: Colors.white,
                fontSize: 13,
              ),
            ),
          ),
          GestureDetector(
            onTap: () => _startNewWorkDay(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.25),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Nova jornada',
                style: GoogleFonts.lexend(
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                  fontSize: 11,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _startNewWorkDay() async {
    // Limpar flag de finalização local para permitir novo ciclo
    await RdoFinalizationDao().clearToday();

    // Limpar scheduleId para forçar nova escala
    AppState().updateUserStruct((e) => e..sheduleId = null);
    AppState().update(() {});

    if (!mounted) return;

    // Navegar para PageCheckQrcode para iniciar novo ciclo
    context.goNamedAuth(
      PageCheckQrcodeWidget.routeName,
      context.mounted,
      extra: <String, dynamic>{
        kTransitionInfoKey: const TransitionInfo(
          hasTransition: true,
          transitionType: PageTransitionType.fade,
        ),
        'skipProjectCheck': true,
      },
    );
  }

  // ─── Loading state ──────────────────────────────────────────────────────────

  Widget _buildLoadingState(AppTheme theme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 48,
            height: 48,
            child: CircularProgressIndicator(
              color: theme.primary,
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Carregando RDO...',
            style: GoogleFonts.lexend(
              fontSize: 15,
              color: theme.secondaryText,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  // ─── Error banner ───────────────────────────────────────────────────────────

  Widget _buildErrorBanner(AppTheme theme) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.error.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.error.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          Icon(Icons.warning_amber_rounded, color: theme.error, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Erro ao carregar dados. Puxe para atualizar.',
              style: theme.bodySmall.override(
                font: GoogleFonts.lexend(),
                color: theme.error,
                letterSpacing: 0.0,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Section header ─────────────────────────────────────────────────────────

  Widget _buildSectionHeader(
    AppTheme theme,
    String title,
    IconData icon, {
    int? badge,
    Color? badgeColor,
  }) {
    return Row(
      children: [
        // Colored icon accent
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: theme.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: theme.primary, size: 16),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            title,
            style: theme.titleSmall.override(
              font: GoogleFonts.lexend(fontWeight: FontWeight.w700),
              color: theme.primaryText,
              letterSpacing: 0.0,
            ),
          ),
        ),
        if (badge != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: (badgeColor ?? theme.primary).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '$badge',
              style: GoogleFonts.lexend(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: badgeColor ?? theme.primary,
              ),
            ),
          ),
      ],
    );
  }

  // ─── Sprint card (identical to home_page_tarefas) ───────────────────────────

  Widget _buildSprintCard(AppTheme theme) {
    // Usar todas as concluídas da sprint para o progresso geral
    final totalTasks = _pendentes.length +
        _emAndamento.length +
        _allSprintConcluidas.length +
        _semSucesso.length +
        _inspecao.length;
    final doneTasks = _allSprintConcluidas.length + _inspecao.length + _semSucesso.length;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: const Color(0xFF105DFB).withValues(alpha: 0.12),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: theme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(7),
                ),
                child: Icon(
                  Icons.rocket_launch_rounded,
                  color: theme.primary,
                  size: 14.0,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  _sprintTitle.isNotEmpty
                      ? _sprintTitle
                      : AppState().user.sprint.title.isNotEmpty
                          ? AppState().user.sprint.title
                          : ' - ',
                  style: GoogleFonts.lexend(
                    fontSize: 13.0,
                    fontWeight: FontWeight.w600,
                    color: theme.primaryText,
                    letterSpacing: 0.0,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                '$doneTasks/$totalTasks',
                style: GoogleFonts.lexend(
                  fontSize: 12.0,
                  fontWeight: FontWeight.w600,
                  color: theme.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          // Datas com ícone
          Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(
                Icons.calendar_today_rounded,
                size: 13,
                color: theme.primary,
              ),
              const SizedBox(width: 5),
              Text(
                '${dateTimeFormat(
                  "d/M/y",
                  DateTime.fromMillisecondsSinceEpoch(
                      AppState().user.sprint.startDate),
                )} até ${dateTimeFormat(
                  "d/M/y",
                  DateTime.fromMillisecondsSinceEpoch(
                      AppState().user.sprint.endDate),
                )}',
                style: GoogleFonts.lexend(
                  fontSize: 12.0,
                  fontWeight: FontWeight.w500,
                  color: theme.primary,
                  letterSpacing: 0.0,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          // Barra de progresso
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Progresso',
                style: GoogleFonts.lexend(
                  fontSize: 13.0,
                  fontWeight: FontWeight.w500,
                  color: theme.primaryText,
                ),
              ),
              Text(
                '${totalTasks > 0 ? ((doneTasks / totalTasks) * 100).round() : 0}%',
                style: GoogleFonts.lexend(
                  fontSize: 13.0,
                  fontWeight: FontWeight.w600,
                  color: theme.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: totalTasks > 0 ? doneTasks / totalTasks : 0.0,
              backgroundColor: theme.alternate,
              valueColor: AlwaysStoppedAnimation<Color>(
                theme.primary,
              ),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 16,
            runSpacing: 4,
            children: [
              Text(
                'Em Andamento: ${_emAndamento.length}',
                style: GoogleFonts.lexend(fontSize: 11, color: theme.primary),
              ),
              Text(
                'Inspeção: ${_inspecao.length}',
                style: GoogleFonts.lexend(fontSize: 11, color: const Color(0xFFCA8A04)),
              ),
              Text(
                'Concluída: ${_allSprintConcluidas.length}',
                style: GoogleFonts.lexend(fontSize: 11, color: const Color(0xFF16A34A)),
              ),
              Text(
                'Sem Sucesso: ${_semSucesso.length}',
                style: GoogleFonts.lexend(fontSize: 11, color: const Color(0xFFDC2626)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ─── Tasks card ─────────────────────────────────────────────────────────────

  Widget _buildTasksCard(AppTheme theme) {
    if (_concluidas.isEmpty) {
      return _buildEmptyCard(
        theme,
        icon: Icons.task_alt_rounded,
        message: 'Nenhuma tarefa concluída hoje',
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: theme.secondaryBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.alternate),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: EdgeInsets.zero,
          itemCount: _concluidas.length,
          separatorBuilder: (_, __) => Divider(
            height: 1,
            indent: 56,
            endIndent: 16,
            color: theme.alternate,
          ),
          itemBuilder: (context, i) {
            final task = _concluidas[i];
            final title = (getJsonField(task, r'''$.projects_backlogs.description''') ??
                    getJsonField(task, r'''$.projects_backlogs.tasks_template.description''') ??
                    getJsonField(task, r'''$.title'''))
                    ?.toString() ??
                'Tarefa ${i + 1}';
            final team = getJsonField(task, r'''$.teams.name''')?.toString() ?? '';
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: _kGreen.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check_rounded,
                      color: _kGreen,
                      size: 16,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: theme.bodyMedium.override(
                            font: GoogleFonts.lexend(fontWeight: FontWeight.w600),
                            color: theme.primaryText,
                            letterSpacing: 0.0,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (team.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              Icon(
                                Icons.group_outlined,
                                size: 11,
                                color: theme.secondaryText,
                              ),
                              const SizedBox(width: 3),
                              Text(
                                team,
                                style: theme.labelSmall.override(
                                  font: GoogleFonts.lexend(),
                                  color: theme.secondaryText,
                                  letterSpacing: 0.0,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  // ─── Workers card ───────────────────────────────────────────────────────────

  Widget _buildWorkersCard(AppTheme theme) {
    if (_uniqueWorkers.isEmpty) {
      return _buildEmptyCard(
        theme,
        icon: Icons.people_outline_rounded,
        message: 'Nenhum funcionário na escala hoje',
      );
    }

    // Build initials color palette from primary
    final avatarColors = [
      theme.primary,
      const Color(0xFF8B5CF6),
      const Color(0xFF06B6D4),
      const Color(0xFFF59E0B),
      const Color(0xFF10B981),
      const Color(0xFFEF4444),
    ];

    return Container(
      decoration: BoxDecoration(
        color: theme.secondaryBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.alternate),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: EdgeInsets.zero,
          itemCount: _uniqueWorkers.length,
          separatorBuilder: (_, __) => Divider(
            height: 1,
            indent: 64,
            endIndent: 16,
            color: theme.alternate,
          ),
          itemBuilder: (context, i) {
            final w = _uniqueWorkers[i];
            final name = getJsonField(w, r'''$.users.name''')?.toString() ??
                getJsonField(w, r'''$.name''')?.toString() ??
                'Funcionário ${i + 1}';
            final role = getJsonField(w, r'''$.users.role''')?.toString() ??
                getJsonField(w, r'''$.role''')?.toString() ??
                '';
            final avatarColor = avatarColors[i % avatarColors.length];
            final initials = _getInitials(name);

            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  // Avatar with initials
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: avatarColor.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: avatarColor.withValues(alpha: 0.3),
                        width: 1.5,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        initials,
                        style: GoogleFonts.lexend(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: avatarColor,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: theme.bodyMedium.override(
                            font:
                                GoogleFonts.lexend(fontWeight: FontWeight.w600),
                            color: theme.primaryText,
                            letterSpacing: 0.0,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (role.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            role,
                            style: theme.labelSmall.override(
                              font: GoogleFonts.lexend(),
                              color: theme.secondaryText,
                              letterSpacing: 0.0,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  Icon(
                    Icons.check_circle_rounded,
                    color: _kGreen.withValues(alpha: 0.7),
                    size: 16,
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[parts.length - 1][0]}'.toUpperCase();
  }

  // ─── Photos card ────────────────────────────────────────────────────────────

  Widget _buildPhotosCard(AppTheme theme) {
    final photoCount = _model.selectedPhotos.length;
    final minReached = photoCount >= 3;

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: theme.secondaryBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.alternate),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Photo count indicator
          Row(
            children: [
              _buildPhotoCountDot(minReached ? _kGreen : theme.error, minReached),
              const SizedBox(width: 8),
              Text(
                minReached
                    ? '$photoCount foto${photoCount == 1 ? '' : 's'} adicionada${photoCount == 1 ? '' : 's'}'
                    : '$photoCount/${3} foto${photoCount == 1 ? '' : 's'} (mínimo 3)',
                style: theme.labelSmall.override(
                  font: GoogleFonts.lexend(fontWeight: FontWeight.w600),
                  color: minReached ? _kGreen : theme.error,
                  letterSpacing: 0.0,
                ),
              ),
            ],
          ),

          // Add button
          if (!_model.isFinalizedToday) ...[
            const SizedBox(height: 14),
            InkWell(
              onTap: _pickPhotos,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                width: double.infinity,
                height: 52,
                decoration: BoxDecoration(
                  color: theme.primary.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: theme.primary.withValues(alpha: 0.3),
                    style: BorderStyle.solid,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: theme.primary.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.add_a_photo_rounded,
                        color: theme.primary,
                        size: 16,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      'Adicionar Fotos',
                      style: theme.bodyMedium.override(
                        font:
                            GoogleFonts.lexend(fontWeight: FontWeight.w600),
                        color: theme.primary,
                        letterSpacing: 0.0,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],

          // Photo grid
          if (photoCount > 0) ...[
            const SizedBox(height: 14),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: 1.0,
              ),
              itemCount: photoCount,
              itemBuilder: (context, i) {
                final photo = _model.selectedPhotos[i];
                return Stack(
                  fit: StackFit.expand,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.memory(
                        photo.bytes ?? Uint8List.fromList([]),
                        fit: BoxFit.cover,
                      ),
                    ),
                    // Subtle gradient overlay
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [Colors.transparent, Colors.black26],
                          ),
                        ),
                      ),
                    ),
                    if (!_model.isFinalizedToday)
                      Positioned(
                        top: 4,
                        right: 4,
                        child: GestureDetector(
                          onTap: () {
                            _model.removePhotoAt(i);
                            setState(() {});
                          },
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Colors.black54,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.close_rounded,
                              color: Colors.white,
                              size: 14,
                            ),
                          ),
                        ),
                      ),
                  ],
                );
              },
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildPhotoCountDot(Color color, bool filled) {
    return Container(
      width: 10,
      height: 10,
      decoration: BoxDecoration(
        color: filled ? color : Colors.transparent,
        shape: BoxShape.circle,
        border: Border.all(color: color, width: 1.5),
      ),
    );
  }

  Future<void> _pickPhotos() async {
    // Capture context-sensitive values before async gap
    final theme = AppTheme.of(context);
    final bgColor = theme.secondaryBackground;
    final textColor = theme.primaryText;

    final selectedMedia = await selectMediaWithSourceBottomSheet(
      context: context,
      allowPhoto: true,
      allowVideo: false,
      maxWidth: 1200,
      imageQuality: 85,
      backgroundColor: bgColor,
      textColor: textColor,
    );

    if (!mounted) return;

    if (selectedMedia != null && selectedMedia.isNotEmpty) {
      for (final m in selectedMedia) {
        if (validateFileFormat(m.storagePath, context)) {
          _model.addPhoto(UploadedFile(
            name: m.storagePath.split('/').last,
            bytes: m.bytes,
            height: m.dimensions?.height,
            width: m.dimensions?.width,
            blurHash: m.blurHash,
            originalFilename: m.originalFilename,
          ));
        }
      }
      setState(() {});
    }
  }

  // ─── Finalize button ────────────────────────────────────────────────────────

  Widget _buildFinalizeButton(AppTheme theme) {
    return Container(
      width: double.infinity,
      height: 56,
      decoration: BoxDecoration(
        gradient: _model.isFinalizing
            ? null
            : LinearGradient(
                colors: [
                  theme.primary,
                  theme.primary.withValues(alpha: 0.85),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
        color: _model.isFinalizing ? theme.primary.withValues(alpha: 0.5) : null,
        borderRadius: BorderRadius.circular(16),
        boxShadow: _model.isFinalizing
            ? null
            : [
                BoxShadow(
                  color: theme.primary.withValues(alpha: 0.35),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _model.isFinalizing ? null : () => _handleFinalize(context),
          borderRadius: BorderRadius.circular(16),
          child: Center(
            child: _model.isFinalizing
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.check_circle_outline_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'FINALIZAR RDO',
                        style: GoogleFonts.lexend(
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                          fontSize: 15,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  // ─── Empty state card ───────────────────────────────────────────────────────

  Widget _buildEmptyCard(
    AppTheme theme, {
    required IconData icon,
    required String message,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 16),
      decoration: BoxDecoration(
        color: theme.secondaryBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.alternate),
      ),
      child: Column(
        children: [
          Icon(icon, size: 32, color: theme.secondaryText.withValues(alpha: 0.5)),
          const SizedBox(height: 10),
          Text(
            message,
            textAlign: TextAlign.center,
            style: theme.bodySmall.override(
              font: GoogleFonts.lexend(),
              color: theme.secondaryText,
              letterSpacing: 0.0,
            ),
          ),
        ],
      ),
    );
  }

  // ─── Finalize handler ───────────────────────────────────────────────────────

  Future<void> _handleFinalize(BuildContext context) async {
    if (_model.selectedPhotos.length < 3) {
      await showDialog(
        context: context,
        builder: (ctx) => Dialog(
          elevation: 0,
          insetPadding: EdgeInsets.zero,
          backgroundColor: Colors.transparent,
          alignment: const AlignmentDirectional(0.0, 0.0)
              .resolve(Directionality.of(context)),
          child: const ModalInfoWidget(
            title: 'Quantidade Mínima de Imagens',
            description:
                'O número mínimo de imagens solicitado é de 3 fotos. Por favor, adicione mais fotos antes de finalizar.',
          ),
        ),
      );
      return;
    }

    setState(() => _model.isFinalizing = true);

    // Capture context-dependent references before async gaps
    final messenger = ScaffoldMessenger.of(context);
    final errorColor = AppTheme.of(context).error;

    try {
      final token = currentAuthenticationToken;

      // Upload photos
      for (final photo in _model.selectedPhotos) {
        final r = await ProjectsGroup.addImagensCall.call(
          content: photo,
          scheduleId: AppState().user.sheduleId,
          token: token,
        );
        if (!r.succeeded) {
          if (mounted) {
            messenger.showSnackBar(SnackBar(
              content: const Text('Erro ao enviar fotos.'),
              backgroundColor: errorColor,
            ));
          }
          return;
        }
      }

      final rdoDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final tempMin =
          double.tryParse(_model.tempMinController.text.replaceAll(',', '.')) ??
              0.0;
      final tempMax =
          double.tryParse(_model.tempMaxController.text.replaceAll(',', '.')) ??
              0.0;

      // Create daily report
      final createResult = await DailyReportsGroup.createDailyReportCall.call(
        projectsId: AppState().user.projectId,
        rdoDate: rdoDate,
        shift: _model.selectedShift ?? 'Integral',
        weatherMorning: _model.weatherMorning ?? '',
        weatherAfternoon: _model.weatherAfternoon ?? '',
        weatherNight: _model.weatherNight ?? '',
        temperatureMin: tempMin,
        temperatureMax: tempMax,
        safetyTopic: _model.safetyTopicController.text,
        generalObservations: _model.observationsController.text,
        scheduleId: [AppState().user.sheduleId],
        token: token,
      );

      if (!createResult.succeeded) {
        if (mounted) {
          messenger.showSnackBar(SnackBar(
            content: const Text('Erro ao criar RDO.'),
            backgroundColor: errorColor,
          ));
        }
        return;
      }

      final reportId =
          DailyReportsGroup.createDailyReportCall.id(createResult.jsonBody);
      if (reportId != null) {
        // Add workforce by role category
        final roleGroups = <String, int>{};
        for (final w in _uniqueWorkers) {
          final role = getJsonField(w, r'''$.users.role''')?.toString() ??
              getJsonField(w, r'''$.role''')?.toString() ??
              'Geral';
          roleGroups[role] = (roleGroups[role] ?? 0) + 1;
        }
        for (final entry in roleGroups.entries) {
          await DailyReportsGroup.addDailyReportWorkforceCall.call(
            id: reportId,
            roleCategory: entry.key,
            quantityPlanned: entry.value,
            quantityPresent: entry.value,
            quantityAbsent: 0,
            absenceReason: '',
            token: token,
          );
        }

        // Add completed activities
        for (final task in _concluidas) {
          final desc =
              (getJsonField(task, r'''$.projects_backlogs.description''') ??
                  getJsonField(task, r'''$.projects_backlogs.tasks_template.description''') ??
                  getJsonField(task, r'''$.title'''))?.toString() ??
                  '';
          final backlogId =
              castToType<int>(getJsonField(task, r'''$.projects_backlogs_id''')) ??
                  0;
          final teamsId =
              castToType<int>(getJsonField(task, r'''$.teams_id''')) ?? 0;
          await DailyReportsGroup.addDailyReportActivityCall.call(
            id: reportId,
            description: desc,
            projectsBacklogsId: backlogId,
            quantityDone: 1,
            unityId: 0,
            teamsId: teamsId,
            locationDescription: '',
            token: token,
          );
        }

        // Finalize report
        await DailyReportsGroup.finalizeDailyReportCall.call(
          id: reportId,
          token: token,
        );
      }

      // Update sprint task statuses from local cache
      if (AppState().taskslist.isNotEmpty) {
        final localTasksList = AppState()
            .taskslist
            .map((t) => {
                  'sprints_tasks_id': t.sprintsTasksId,
                  'sprints_tasks_statuses_id': t.sprintsTasksStatusesId,
                })
            .toList();
        await SprintsGroup.atualizaStatusDaSprintTaskCall.call(
          scheduleId: AppState().user.sheduleId,
          tasksListJson: localTasksList,
          token: token,
        );
      }

      // Mark as finalized in local DB
      await RdoFinalizationDao().markAsFinalizedToday();
      AppState().signalTasksRefresh();
      _model.isFinalizedToday = true;

      // Marcar o contexto do projeto ativo como RDO finalizada
      AppState().markActiveProjectRdoFinalized();

      // Limpar scheduleId — schedule atual já tem daily_report vinculado
      // Permite iniciar nova jornada quando o usuário quiser
      AppState().updateUserStruct((e) => e..sheduleId = 0);
      AppState().update(() {});

      if (mounted) {
        messenger.showSnackBar(
          const SnackBar(
            content: Text('RDO finalizada com sucesso!'),
            backgroundColor: _kGreen,
          ),
        );
      }
    } catch (e) {
      if (kDebugMode) print('Erro ao finalizar RDO: $e');
      if (mounted) {
        messenger.showSnackBar(SnackBar(
          content: const Text('Erro ao finalizar RDO.'),
          backgroundColor: errorColor,
        ));
      }
    } finally {
      if (mounted) setState(() => _model.isFinalizing = false);
    }
  }
}
