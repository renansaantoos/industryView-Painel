import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_escala_manual_widget.dart';
import '/components/modal_info_widget.dart';
import '/components/modal_sucess_qrcode_widget.dart';
import '/components/offline_banner_widget.dart';
import '/components/pending_day_finalization_widget.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import '/database/daos/rdo_finalization_dao.dart';
import '/services/network_service.dart';
import '/services/initial_sync_service.dart';
import 'dart:ui';
import '/core/utils/custom_functions.dart' as functions;
import '/index.dart';
import '/pages/daily_hub/daily_hub_widget.dart';
import '/pages/project_selection/project_selection_widget.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:flutter_barcode_scanner/flutter_barcode_scanner.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/foundation.dart';
import 'package:provider/provider.dart';
import 'page_check_qrcode_model.dart';
export 'page_check_qrcode_model.dart';

class PageCheckQrcodeWidget extends StatefulWidget {
  const PageCheckQrcodeWidget({
    super.key,
    this.skipProjectCheck = false,
    this.fromDailyHub = false,
  });

  final bool skipProjectCheck;
  final bool fromDailyHub;

  static String routeName = 'Page_check_qrcode';
  static String routePath = '/pageCheckQrcode';

  @override
  State<PageCheckQrcodeWidget> createState() => _PageCheckQrcodeWidgetState();
}

class _PageCheckQrcodeWidgetState extends State<PageCheckQrcodeWidget> {
  late PageCheckQrcodeModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => PageCheckQrcodeModel());

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      AppState().loading = true;
      safeSetState(() {});
      try {
      final isOnline = await NetworkService.instance.checkConnection();

      if (!isOnline) {
        // Offline: tenta usar SQLite no load da página
        if (AppState().user.sheduleId != 0) {
          AppState().loading = false;
          safeSetState(() {});

          context.goNamedAuth(
            HomePageTarefasWidget.routeName,
            context.mounted,
            extra: <String, dynamic>{
              kTransitionInfoKey: TransitionInfo(
                hasTransition: true,
                transitionType: PageTransitionType.fade,
                duration: Duration(milliseconds: 250),
              ),
            },
          );

          return;
        }

        _model.getScheduleId1 =
            await ProjectsGroup.listaColaboradoresDaEscalaDoDiaCall.call(
          projectsId: AppState().user.projectId,
          teamsId: AppState().user.teamsId,
          token: currentAuthenticationToken,
        );

        final scheduleId = valueOrDefault<int>(
          getJsonField(
            (_model.getScheduleId1?.jsonBody),
            r'''$[0].schedule_id''',
          ),
          0,
        );
        final scheduleIdFallback = valueOrDefault<int>(
          getJsonField(
            (_model.getScheduleId1?.jsonBody),
            r'''$[0].id''',
          ),
          0,
        );
        final resolvedScheduleId =
            scheduleId != 0 ? scheduleId : scheduleIdFallback;

        if (resolvedScheduleId != 0) {
          AppState().updateUserStruct(
            (e) => e..sheduleId = resolvedScheduleId,
          );
          AppState().loading = false;
          safeSetState(() {});

          context.goNamedAuth(
            HomePageTarefasWidget.routeName,
            context.mounted,
            extra: <String, dynamic>{
              kTransitionInfoKey: TransitionInfo(
                hasTransition: true,
                transitionType: PageTransitionType.fade,
                duration: Duration(milliseconds: 250),
              ),
            },
          );

          return;
        }

        _model.listaFuncionarios =
            await ProjectsGroup.listaMembrosDeUmaEquipeCall.call(
          teamsId: AppState().user.teamsId,
          page: 1,
          perPage: 100,
          token: currentAuthenticationToken,
        );

        _model.retornoAPI = castToType<int>(getJsonField(
              _model.listaFuncionarios?.jsonBody,
              r'''$.itemsTotal''',
            )) ??
            ProjectsGroup.listaMembrosDeUmaEquipeCall
                .list((_model.listaFuncionarios?.jsonBody))
                ?.length;
        safeSetState(() {});
        AppState().loading = false;
        safeSetState(() {});
        return;
      }

      _model.validToken = await AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall
          .call(
        bearerAuth: currentAuthenticationToken,
      );

      if ((_model.validToken?.succeeded ?? true)) {
        final meCall = AuthenticationGroup
            .getTheRecordBelongingToTheAuthenticationTokenCall;
        final tokenJson = _model.validToken?.jsonBody;

        if (kDebugMode) {
          print('=== QR PAGE DEBUG ===');
          print('tokenProjectId (appState): ${AppState().user.projectId}, meCall: ${meCall.projectId(tokenJson)}');
          print('tokenTeamsId (appState): ${AppState().user.teamsId}, meCall: ${meCall.teamsId(tokenJson)}');
          print('====================');
        }

        // ═══════════════════════════════════════════════════════════════
        // VERIFICAÇÃO DE PENDÊNCIAS DE DIAS ANTERIORES.
        // Se o usuário tem schedules de dias anteriores sem RDO,
        // obriga a finalizar ANTES de poder iniciar uma nova sessão.
        // Quando vindo do DailyHub, ele já tratou as pendências.
        // ═══════════════════════════════════════════════════════════════
        if (!widget.fromDailyHub) {
          try {
            final pendingResp = await ProjectsGroup
                .getPendingSchedulesCall
                .call(token: currentAuthenticationToken);

            if (pendingResp.succeeded) {
              final hasPend = ProjectsGroup
                  .getPendingSchedulesCall
                  .hasPending(pendingResp.jsonBody) ?? false;

              if (hasPend && mounted) {
                // Multi-projeto: DailyHub cuida das pendências
                final allProjects = meCall.allProjectIds(tokenJson);
                if (allProjects.length > 1) {
                  AppState().updateUserStruct(
                    (e) => e
                      ..token = valueOrDefault<String>(currentAuthenticationToken, AppState().user.token)
                      ..id = valueOrDefault<int>(meCall.id(tokenJson), AppState().user.id)
                      ..name = valueOrDefault<String>(meCall.name(tokenJson), AppState().user.name)
                      ..email = valueOrDefault<String>(meCall.email(tokenJson), AppState().user.email)
                      ..phone = valueOrDefault<String>(meCall.phone(tokenJson), AppState().user.phone)
                      ..companyId = valueOrDefault<int>(meCall.companyID(tokenJson), AppState().user.companyId),
                  );
                  AppState().update(() {});
                  AppState().loading = false;
                  safeSetState(() {});
                  if (!mounted) return;
                  context.goNamedAuth(
                    DailyHubWidget.routeName,
                    context.mounted,
                    extra: <String, dynamic>{
                      kTransitionInfoKey: TransitionInfo(
                        hasTransition: true,
                        transitionType: PageTransitionType.fade,
                      ),
                    },
                  );
                  return;
                }

                // Single-project: tratar pendência inline
                final pendList = ProjectsGroup
                    .getPendingSchedulesCall
                    .pendingSchedules(pendingResp.jsonBody);
                final fp = (pendList?.isNotEmpty == true) ? pendList!.first : null;
                if (fp != null) {
                  final pDate = fp['schedule_date']?.toString() ?? '';
                  final pId = (fp['schedule_id'] as int?) ?? 0;
                  final pProject = fp['project_name']?.toString();
                  final pTeam = fp['team_name']?.toString();
                  final pWorkers = fp['workers'] as List<dynamic>?;
                  final pTasks = fp['tasks'] as List<dynamic>?;

                  AppState().loading = false;
                  safeSetState(() {});

                  if (kDebugMode) {
                    print('=== PENDING SCHEDULE FOUND ===');
                    print('scheduleId: $pId, date: $pDate, project: $pProject');
                  }

                  await Navigator.push<bool>(
                    context,
                    MaterialPageRoute(
                      fullscreenDialog: true,
                      builder: (_) => PendingDayFinalizationWidget(
                        scheduleId: pId,
                        scheduleDate: pDate,
                        projectName: pProject,
                        teamName: pTeam,
                        workers: pWorkers,
                        tasks: pTasks,
                      ),
                    ),
                  );
                  // Após finalizar, continua o fluxo normal
                }
              }
            }
          } catch (e) {
            if (kDebugMode) {
              print('=== PENDING CHECK ERROR: $e ===');
            }
          }
        }

        // Preservar dados do projeto selecionado (quando vindo da ProjectSelection)
        final savedTeamsId = AppState().user.teamsId;
        final savedProjectId = AppState().user.projectId;
        final savedSprint = AppState().user.sprint;

        // Persistir/atualizar dados do usuário quando online
        _updateUserFromToken(tokenJson);

        // Restaurar dados do projeto selecionado (evita sobrescrita pelo me endpoint)
        if (widget.skipProjectCheck) {
          AppState().updateUserStruct(
            (e) => e
              ..teamsId = savedTeamsId
              ..projectId = savedProjectId
              ..sprint = savedSprint,
          );
        }

        // ═══════════════════════════════════════════════════════════════
        // VERIFICAR SE JÁ EXISTE SCHEDULE ATIVO HOJE (sem RDO)
        // Se sim → carregar funcionários já selecionados e ir para tarefas
        // Se não → tela limpa para nova seleção de funcionários
        // ═══════════════════════════════════════════════════════════════
        _model.getScheduleId1 =
            await ProjectsGroup.listaColaboradoresDaEscalaDoDiaCall.call(
          projectsId: AppState().user.projectId,
          teamsId: AppState().user.teamsId,
          token: currentAuthenticationToken,
        );

        final existingScheduleId = valueOrDefault<int>(
          getJsonField(
            (_model.getScheduleId1?.jsonBody),
            r'''$[0].schedule_id''',
          ),
          0,
        );
        final existingUserIds = ProjectsGroup
            .listaColaboradoresDaEscalaDoDiaCall
            .ids(_model.getScheduleId1?.jsonBody);

        if (kDebugMode) {
          print('=== SCHEDULE CHECK ===');
          print('existingScheduleId: $existingScheduleId');
          print('existingUserIds: $existingUserIds');
          print('======================');
        }

        if (existingScheduleId != 0 && existingUserIds != null && existingUserIds.isNotEmpty) {
          // ═══════════════════════════════════════════════════════════
          // SCHEDULE ATIVO ENCONTRADO — jornada já em andamento
          // Restaurar estado e ir direto para tela de tarefas
          // ═══════════════════════════════════════════════════════════
          AppState().allIds = existingUserIds;
          AppState().updateUserStruct((e) => e..sheduleId = existingScheduleId);
          AppState().saveCurrentToActiveContext();

          if (kDebugMode) {
            print('=== ACTIVE SCHEDULE → navigating to HomePageTarefas ===');
          }

          // Sync em background
          Future.microtask(() async {
            try {
              await InitialSyncService.instance
                  .performInitialSyncIfNeeded(force: true);
            } catch (_) {}
          });

          AppState().loading = false;
          safeSetState(() {});

          if (!mounted) return;
          context.goNamedAuth(
            HomePageTarefasWidget.routeName,
            context.mounted,
            extra: <String, dynamic>{
              kTransitionInfoKey: TransitionInfo(
                hasTransition: true,
                transitionType: PageTransitionType.fade,
                duration: Duration(milliseconds: 250),
              ),
            },
          );
          return;
        }

        // ═══════════════════════════════════════════════════════════════
        // SEM SCHEDULE ATIVO — Nova sessão de trabalho
        // Limpar tudo e mostrar tela de seleção de funcionários
        // ═══════════════════════════════════════════════════════════════
        AppState().update(() {
          AppState().escalaServerIds = [];
          AppState().escalaLocalIds = [];
          AppState().escalaRemovedIds = [];
          AppState().escalaEntryTimes = {};
          AppState().allIds = [];
          AppState().qrCodeIDs = [];
          AppState().liberaManual = [];
        });
        AppState().updateUserStruct((e) => e..sheduleId = 0);

        // Limpar flag de RDO finalizada (permite novo ciclo completo)
        try {
          await RdoFinalizationDao().clearToday();
        } catch (_) {}

        // Pré-carregar dados em background
        Future.microtask(() async {
          try {
            await ProjectsGroup.listaMembrosDeUmaEquipeCall.call(
              teamsId: AppState().user.teamsId,
              page: 1,
              perPage: 100,
              token: currentAuthenticationToken,
            );
          } catch (_) {}
        });
        Future.microtask(() async {
          try {
            await SprintsGroup.queryAllSprintsTasksRecordCall.call(
              projectsId: AppState().user.projectId,
              teamsId: AppState().user.teamsId,
              sprintsId: AppState().user.sprint.id,
              token: currentAuthenticationToken,
              page: 1,
              perPage: 50,
              search: '',
              equipamentsTypesId: 0,
            );
            await ProjectsGroup.queryAllScheduleCall.call(
              projectsId: AppState().user.projectId,
              teamsId: AppState().user.teamsId,
              sprintsId: AppState().user.sprint.id,
              token: currentAuthenticationToken,
            );
          } catch (_) {}
        });
        Future.microtask(() async {
          try {
            await InitialSyncService.instance
                .performInitialSyncIfNeeded(force: true);
          } catch (_) {}
        });

        // Carregar lista de funcionários da equipe (para QR e seleção manual)
        _model.listaFuncionarios =
            await ProjectsGroup.listaMembrosDeUmaEquipeCall.call(
          teamsId: AppState().user.teamsId,
          page: 1,
          perPage: 100,
          token: currentAuthenticationToken,
        );

        _model.retornoAPI = castToType<int>(getJsonField(
              _model.listaFuncionarios?.jsonBody,
              r'''$.itemsTotal''',
            )) ??
            ProjectsGroup.listaMembrosDeUmaEquipeCall
                .list((_model.listaFuncionarios?.jsonBody))
                ?.length;

        safeSetState(() {});
        AppState().loading = false;
        safeSetState(() {});
      } else {
        AppState().loading = false;
        safeSetState(() {});
        return;
      }
      } catch (e, stackTrace) {
        if (kDebugMode) {
          print('=== PageCheckQrcode FATAL ERROR ===');
          print('Error: $e');
          print('StackTrace: $stackTrace');
        }
      } finally {
        AppState().loading = false;
        safeSetState(() {});
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  /// Atualiza os dados do usuário no AppState a partir do token /me/app
  void _updateUserFromToken(dynamic tokenJson) {
    final meCall = AuthenticationGroup
        .getTheRecordBelongingToTheAuthenticationTokenCall;
    AppState().updateUserStruct(
      (e) => e
        ..token = valueOrDefault<String>(
          currentAuthenticationToken, AppState().user.token)
        ..id = valueOrDefault<int>(meCall.id(tokenJson), AppState().user.id)
        ..name = valueOrDefault<String>(meCall.name(tokenJson), AppState().user.name)
        ..email = valueOrDefault<String>(meCall.email(tokenJson), AppState().user.email)
        ..phone = valueOrDefault<String>(meCall.phone(tokenJson), AppState().user.phone)
        ..image = valueOrDefault<String>(meCall.image(tokenJson), AppState().user.image)
        ..teamsId = valueOrDefault<int>(meCall.teamsId(tokenJson), AppState().user.teamsId)
        ..projectId = valueOrDefault<int>(meCall.projectId(tokenJson), AppState().user.projectId)
        ..companyId = valueOrDefault<int>(meCall.companyID(tokenJson), AppState().user.companyId)
        ..sprint = SprintsStruct(
          id: valueOrDefault<int>(meCall.sprintId(tokenJson), AppState().user.sprint.id),
          title: valueOrDefault<String>(meCall.spritnTitle(tokenJson), AppState().user.sprint.title),
          objective: valueOrDefault<String>(meCall.sprintObjective(tokenJson), AppState().user.sprint.objective),
          startDate: valueOrDefault<int>(meCall.sprintDtStart(tokenJson), AppState().user.sprint.startDate),
          endDate: valueOrDefault<int>(meCall.sprintDtEnd(tokenJson), AppState().user.sprint.endDate),
          progressPercentage: valueOrDefault<double>(meCall.sprintProgress(tokenJson), AppState().user.sprint.progressPercentage),
          tasksConcluidas: valueOrDefault<int>(meCall.concluidas(tokenJson)?.length, AppState().user.sprint.tasksConcluidas),
          tasksAndamento: valueOrDefault<int>(meCall.andamento(tokenJson)?.length, AppState().user.sprint.tasksAndamento),
        ),
    );
  }

  /// Salva a escala no backend — sempre cria uma nova schedule.
  /// Cada sessão de trabalho gera sua própria schedule (mesmo dia pode ter várias).
  Future<void> _saveScheduleToBackend() async {
    if (kDebugMode) {
      print('=== SAVE SCHEDULE TO BACKEND ===');
      print('allIds: ${AppState().allIds}');
      print('projectId: ${AppState().user.projectId}, teamsId: ${AppState().user.teamsId}');
    }
    if (AppState().allIds.isEmpty) {
      if (kDebugMode) print('SAVE ABORTED: allIds is empty');
      return;
    }
    try {
      // Se já temos um scheduleId desta sessão, atualizar
      final currentScheduleId = AppState().user.sheduleId;
      if (currentScheduleId != 0) {
        if (kDebugMode) print('UPDATING current session schedule $currentScheduleId');
        await ProjectsGroup.editaEscalaDosColaboradoresCall.call(
          usersIdList: AppState().allIds,
          scheduleId: currentScheduleId,
          token: currentAuthenticationToken,
        );
      } else {
        // Criar nova schedule para esta sessão
        if (kDebugMode) print('CREATING new schedule for this session...');
        final response = await ProjectsGroup.adicionaColaboradoresNaEscalaCall.call(
          teamsId: AppState().user.teamsId,
          usersIdList: AppState().allIds,
          projectsId: AppState().user.projectId,
          scheduleDate: dateTimeFormat("yyyy-MM-dd", getCurrentTimestamp),
          sprintsId: AppState().user.sprint.id,
          token: currentAuthenticationToken,
        );
        if (kDebugMode) {
          print('CREATE response succeeded: ${response.succeeded}, statusCode: ${response.statusCode}');
          print('CREATE response body: ${response.jsonBody}');
        }
        if (response.succeeded) {
          final newScheduleId = getJsonField(response.jsonBody, r'''$.id''');
          if (newScheduleId != null) {
            AppState().updateUserStruct((e) => e..sheduleId = newScheduleId);
            if (kDebugMode) print('SAVE: novo scheduleId salvo no AppState: $newScheduleId');
          }
        }
      }
      // Salvar estado no contexto do projeto ativo
      AppState().saveCurrentToActiveContext();
    } catch (e) {
      if (kDebugMode) print('SAVE SCHEDULE ERROR: $e');
      // Falha silenciosa — a escala será salva na próxima adição ou ao iniciar
    }
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<AppState>();

    return Builder(
      builder: (context) => GestureDetector(
        onTap: () {
          FocusScope.of(context).unfocus();
          FocusManager.instance.primaryFocus?.unfocus();
        },
        child: PopScope(
          canPop: false,
          child: Scaffold(
            key: scaffoldKey,
            resizeToAvoidBottomInset: false,
            backgroundColor: AppTheme.of(context).primaryBackground,
            body: AnnotatedRegion<SystemUiOverlayStyle>(
              value: const SystemUiOverlayStyle(
                statusBarColor: Colors.transparent,
                statusBarIconBrightness: Brightness.light,
                statusBarBrightness: Brightness.dark,
              ),
              child: Stack(
                children: [
                  Column(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header with gradient background extending behind status bar
                      Container(
                        width: double.infinity,
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [Color(0xFF011741), Color(0xFF0A2F6E)],
                          ),
                          borderRadius: BorderRadius.only(
                            bottomLeft: Radius.circular(24),
                            bottomRight: Radius.circular(24),
                          ),
                        ),
                        child: Padding(
                          padding: EdgeInsets.fromLTRB(16.0, MediaQuery.of(context).padding.top + 16.0, 16.0, 20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Align(
                                      alignment: AlignmentDirectional(-1.0, -1.0),
                                      child: Text(
                                        '${AppLocalizations.of(context).getVariableText(
                                          ptText: 'Olá, bom dia ',
                                          esText: 'Buen día ',
                                          enText: 'Good morning ',
                                        )}${valueOrDefault<String>(
                                          functions.firstName(AppState().user.name),
                                          ' - ',
                                        )}!',
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
                                              color: Colors.white,
                                              letterSpacing: 0.0,
                                              fontWeight: AppTheme.of(context)
                                                  .titleLarge
                                                  .fontWeight,
                                              fontStyle: AppTheme.of(context)
                                                  .titleLarge
                                                  .fontStyle,
                                            ),
                                      ),
                                    ),
                                  ),
                                  Align(
                                    alignment: AlignmentDirectional(-1.0, 0.0),
                                    child: AppButton(
                                      onPressed: () async {
                                        AppState().user = UserLoginStruct();
                                        safeSetState(() {});

                                        context.pushNamed(LoginWidget.routeName);
                                      },
                                      text: AppLocalizations.of(context).getText(
                                        'qr4xddtf' /* Log out */,
                                      ),
                                      options: AppButtonOptions(
                                        height: 40.0,
                                        padding: const EdgeInsetsDirectional.fromSTEB(
                                            16.0, 0.0, 16.0, 0.0),
                                        iconPadding: const EdgeInsetsDirectional.fromSTEB(
                                            0.0, 0.0, 0.0, 0.0),
                                        color: Colors.white.withOpacity(0.15),
                                        textStyle: AppTheme.of(context)
                                            .labelSmall
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight: AppTheme.of(context)
                                                    .labelSmall
                                                    .fontWeight,
                                                fontStyle: AppTheme.of(context)
                                                    .labelSmall
                                                    .fontStyle,
                                              ),
                                              color: Colors.white,
                                              letterSpacing: 0.0,
                                              fontWeight: AppTheme.of(context)
                                                  .labelSmall
                                                  .fontWeight,
                                              fontStyle: AppTheme.of(context)
                                                  .labelSmall
                                                  .fontStyle,
                                            ),
                                        elevation: 0.0,
                                        borderSide: const BorderSide(
                                          color: Colors.white30,
                                        ),
                                        borderRadius: BorderRadius.circular(14.0),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              if (AppState().user.projectName.isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8.0),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    crossAxisAlignment: CrossAxisAlignment.center,
                                    children: [
                                      Expanded(
                                        child: Row(
                                          children: [
                                            Icon(
                                              Icons.business_rounded,
                                              color: Colors.white,
                                              size: 18.0,
                                            ),
                                            const SizedBox(width: 6),
                                            Flexible(
                                              child: Text(
                                                AppState().user.teamName.isNotEmpty
                                                    ? '${AppState().user.projectName} / ${AppState().user.teamName}'
                                                    : AppState().user.projectName,
                                                style: GoogleFonts.lexend(
                                                  fontSize: 14.0,
                                                  fontWeight: FontWeight.w600,
                                                  color: Colors.white,
                                                  letterSpacing: 0.0,
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      InkWell(
                                        onTap: () {
                                          context.goNamedAuth(
                                            ProjectSelectionWidget.routeName,
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
                                                color: Colors.white,
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
                                                  color: Colors.white,
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
                              const OfflineBannerWidget(),
                            ],
                          ),
                        ),
                      ),
                      Expanded(
                        child: AppState().loading
                          ? const Center(
                              child: CircularProgressIndicator(),
                            )
                          : Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.max,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 24.0, 0.0, 0.0),
                          child: Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              Icon(
                                Icons.people,
                                color: AppTheme.of(context).primary,
                                size: 24.0,
                              ),
                              Align(
                                alignment: AlignmentDirectional(-1.0, -1.0),
                                child: Text(
                                  AppLocalizations.of(context).getText(
                                    'qqc2xga2' /* Escala do dia */,
                                  ),
                                  style: AppTheme.of(context)
                                      .titleLarge
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight:
                                              AppTheme.of(context)
                                                  .titleLarge
                                                  .fontWeight,
                                          fontStyle:
                                              AppTheme.of(context)
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
                              ),
                            ].divide(SizedBox(width: 8.0)),
                          ),
                        ),
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 4.0, 0.0, 0.0),
                          child: Text(
                            AppLocalizations.of(context).getText(
                              'i88fnbil' /* Para iniciar sua jornada de tr... */,
                            ),
                            style: AppTheme.of(context)
                                .bodyMedium
                                .override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: AppTheme.of(context)
                                        .bodyMedium
                                        .fontWeight,
                                    fontStyle: AppTheme.of(context)
                                        .bodyMedium
                                        .fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight: AppTheme.of(context)
                                      .bodyMedium
                                      .fontWeight,
                                  fontStyle: AppTheme.of(context)
                                      .bodyMedium
                                      .fontStyle,
                                ),
                          ),
                        ),
                        // Mini-card: Leituras necessárias
                        Padding(
                          padding: const EdgeInsetsDirectional.fromSTEB(
                              0.0, 16.0, 0.0, 0.0),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECF5FF),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.max,
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  AppLocalizations.of(context).getText(
                                    '7lryoor6' /* Leituras necessárias */,
                                  ),
                                  style: AppTheme.of(context)
                                      .bodyMedium
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight: AppTheme.of(context)
                                              .bodyMedium
                                              .fontWeight,
                                          fontStyle: AppTheme.of(context)
                                              .bodyMedium
                                              .fontStyle,
                                        ),
                                        letterSpacing: 0.0,
                                        fontWeight: AppTheme.of(context)
                                            .bodyMedium
                                            .fontWeight,
                                        fontStyle: AppTheme.of(context)
                                            .bodyMedium
                                            .fontStyle,
                                      ),
                                ),
                                Text(
                                  valueOrDefault<String>(
                                    _model.retornoAPI?.toString(),
                                    '0',
                                  ),
                                  style: AppTheme.of(context)
                                      .headlineMedium
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight: AppTheme.of(context)
                                              .headlineMedium
                                              .fontWeight,
                                          fontStyle: AppTheme.of(context)
                                              .headlineMedium
                                              .fontStyle,
                                        ),
                                        color: AppTheme.of(context).primary,
                                        letterSpacing: 0.0,
                                      ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        // Mini-card: QRCode realizadas
                        Padding(
                          padding: const EdgeInsetsDirectional.fromSTEB(
                              0.0, 8.0, 0.0, 0.0),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECF5FF),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.max,
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  AppLocalizations.of(context).getText(
                                    'e4vvk2uy' /* Leituras QRCode realizadas */,
                                  ),
                                  style: AppTheme.of(context)
                                      .bodyMedium
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight: AppTheme.of(context)
                                              .bodyMedium
                                              .fontWeight,
                                          fontStyle: AppTheme.of(context)
                                              .bodyMedium
                                              .fontStyle,
                                        ),
                                        letterSpacing: 0.0,
                                        fontWeight: AppTheme.of(context)
                                            .bodyMedium
                                            .fontWeight,
                                        fontStyle: AppTheme.of(context)
                                            .bodyMedium
                                            .fontStyle,
                                      ),
                                ),
                                Text(
                                  valueOrDefault<String>(
                                    AppState().qrCodeIDs.length.toString(),
                                    '0',
                                  ),
                                  style: AppTheme.of(context)
                                      .headlineMedium
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight: AppTheme.of(context)
                                              .headlineMedium
                                              .fontWeight,
                                          fontStyle: AppTheme.of(context)
                                              .headlineMedium
                                              .fontStyle,
                                        ),
                                        color: AppTheme.of(context).primary,
                                        letterSpacing: 0.0,
                                      ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        // Mini-card: Manualmente realizadas
                        Padding(
                          padding: const EdgeInsetsDirectional.fromSTEB(
                              0.0, 8.0, 0.0, 0.0),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECF5FF),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.max,
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  AppLocalizations.of(context).getText(
                                    'otvmw9eb' /* Leitura manualmente realizadas */,
                                  ),
                                  style: AppTheme.of(context)
                                      .bodyMedium
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight: AppTheme.of(context)
                                              .bodyMedium
                                              .fontWeight,
                                          fontStyle: AppTheme.of(context)
                                              .bodyMedium
                                              .fontStyle,
                                        ),
                                        letterSpacing: 0.0,
                                        fontWeight: AppTheme.of(context)
                                            .bodyMedium
                                            .fontWeight,
                                        fontStyle: AppTheme.of(context)
                                            .bodyMedium
                                            .fontStyle,
                                      ),
                                ),
                                Text(
                                  valueOrDefault<String>(
                                    (AppState().liberaManual.length + AppState().escalaServerIds.length).toString(),
                                    '0',
                                  ),
                                  style: AppTheme.of(context)
                                      .headlineMedium
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight: AppTheme.of(context)
                                              .headlineMedium
                                              .fontWeight,
                                          fontStyle: AppTheme.of(context)
                                              .headlineMedium
                                              .fontStyle,
                                        ),
                                        color: AppTheme.of(context).primary,
                                        letterSpacing: 0.0,
                                      ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        Align(
                          alignment: AlignmentDirectional(0.0, 0.0),
                          child: Builder(
                            builder: (context) => Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 16.0, 0.0, 0.0),
                              child: AppButton(
                                onPressed: () async {
                                  var _shouldSetState = false;
                                  _model.returnQrcode =
                                      await FlutterBarcodeScanner.scanBarcode(
                                    '#C62828', // scanning line color
                                    AppLocalizations.of(context).getText(
                                      'bpct43vm' /* Cancelar */,
                                    ), // cancel button text
                                    true, // whether to show the flash icon
                                    ScanMode.QR,
                                  );

                                  _shouldSetState = true;
                                  _model.qrcode = _model.returnQrcode;
                                  safeSetState(() {});
                                  if (_model.qrcode == '-1') {
                                    if (_shouldSetState) safeSetState(() {});
                                    return;
                                  }
                                  // Buscar funcionário: primeiro localmente pela matrícula/ID, depois via API
                                  final membrosList = ProjectsGroup
                                      .listaMembrosDeUmaEquipeCall
                                      .list((_model.listaFuncionarios?.jsonBody));

                                  int? qrUserId;
                                  String? qrUserName;
                                  bool foundLocally = false;

                                  if (membrosList != null) {
                                    // 1) Match por matrícula (ex: "MAT-2024046")
                                    for (final membro in membrosList) {
                                      final matricula = castToType<String>(
                                          getJsonField(membro, r'''$.users.hr_data.matricula'''));
                                      if (matricula != null && matricula == _model.qrcode) {
                                        qrUserId = castToType<int>(
                                            getJsonField(membro, r'''$.users.id'''));
                                        qrUserName = castToType<String>(
                                            getJsonField(membro, r'''$.users.name'''));
                                        foundLocally = true;
                                        break;
                                      }
                                    }
                                    // 2) Match por user ID (valor numérico)
                                    if (!foundLocally) {
                                      final scannedId = int.tryParse(_model.qrcode!);
                                      if (scannedId != null) {
                                        for (final membro in membrosList) {
                                          final userId = castToType<int>(
                                              getJsonField(membro, r'''$.users.id'''));
                                          if (userId == scannedId) {
                                            qrUserId = userId;
                                            qrUserName = castToType<String>(
                                                getJsonField(membro, r'''$.users.name'''));
                                            foundLocally = true;
                                            break;
                                          }
                                        }
                                      }
                                    }
                                  }

                                  // 3) Fallback: tentar via API qrcodeReader
                                  if (!foundLocally) {
                                    _model.apiQrcode =
                                        await ReportsGroup.qrcodeReaderCall.call(
                                      qrcode: _model.qrcode!,
                                      token: currentAuthenticationToken,
                                    );
                                    _shouldSetState = true;
                                    qrUserId = ReportsGroup.qrcodeReaderCall
                                        .userId((_model.apiQrcode?.jsonBody));
                                    qrUserName = ReportsGroup.qrcodeReaderCall
                                        .userName((_model.apiQrcode?.jsonBody));

                                    // Se encontrou via API, verificar pertencimento à equipe
                                    if (qrUserId != null && membrosList != null) {
                                      final membrosIds = membrosList
                                          .map((item) => castToType<int>(
                                              getJsonField(item, r'''$.users.id''')))
                                          .whereType<int>()
                                          .toSet();
                                      if (!membrosIds.contains(qrUserId)) {
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
                                                title: AppLocalizations.of(context)
                                                    .getVariableText(
                                                  ptText: 'Atenção',
                                                  esText: 'Atención',
                                                  enText: 'Warning',
                                                ),
                                                description: AppLocalizations.of(context)
                                                    .getVariableText(
                                                  ptText: 'O funcionário${qrUserName != null && qrUserName.isNotEmpty ? " $qrUserName" : ""} não pertence a esta equipe.',
                                                  esText: 'El empleado${qrUserName != null && qrUserName.isNotEmpty ? " $qrUserName" : ""} no pertenece a este equipo.',
                                                  enText: 'The employee${qrUserName != null && qrUserName.isNotEmpty ? " $qrUserName" : ""} does not belong to this team.',
                                                ),
                                              ),
                                            );
                                          },
                                        );
                                        if (_shouldSetState) safeSetState(() {});
                                        return;
                                      }
                                    }
                                  }

                                  if (qrUserId != null) {
                                    // Verificar se funcionário já foi registrado no dia
                                    if (AppState().allIds.contains(qrUserId)) {
                                      String entryTimeText = '';
                                      final entryTimeStr = AppState().escalaEntryTimes[qrUserId];
                                      if (entryTimeStr != null) {
                                        final dt = DateTime.tryParse(entryTimeStr);
                                        if (dt != null) {
                                          final local = dt.toLocal();
                                          entryTimeText = '\nEntrada às ${local.hour.toString().padLeft(2, '0')}:${local.minute.toString().padLeft(2, '0')}';
                                        }
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
                                              title: AppLocalizations.of(context)
                                                  .getVariableText(
                                                ptText: 'Atenção',
                                                esText: 'Atención',
                                                enText: 'Warning',
                                              ),
                                              description: AppLocalizations.of(context)
                                                  .getVariableText(
                                                ptText: '${qrUserName ?? "Funcionário"} já foi registrado hoje.$entryTimeText',
                                                esText: '${qrUserName ?? "Empleado"} ya fue registrado hoy.$entryTimeText',
                                                enText: '${qrUserName ?? "Employee"} has already been registered today.$entryTimeText',
                                              ),
                                            ),
                                          );
                                        },
                                      );
                                      if (_shouldSetState) safeSetState(() {});
                                      return;
                                    }
                                    AppState().update(() {
                                      AppState().addToQrCodeIDs(qrUserId!);
                                      AppState().addToAllIds(qrUserId!);
                                      // Armazenar horário de entrada local
                                      AppState().addEscalaEntryTime(qrUserId!, DateTime.now().toUtc().toIso8601String());
                                    });
                                    safeSetState(() {});
                                    // Salvar escala no backend
                                    _saveScheduleToBackend();
                                    // Registrar check-in no controle de mão de obra
                                    try {
                                      ProjectsGroup.workforceCheckInCall.call(
                                        usersId: qrUserId,
                                        projectsId: AppState().user.projectId,
                                        teamsId: AppState().user.teamsId,
                                        token: currentAuthenticationToken,
                                      );
                                    } catch (_) {}
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
                                              FocusManager.instance.primaryFocus
                                                  ?.unfocus();
                                            },
                                            child: ModalSucessQrcodeWidget(
                                              text: AppLocalizations.of(context)
                                                  .getText(
                                                'hf8ujqxe' /* QR Code do funcionário lido co... */,
                                              ),
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
                                              FocusManager.instance.primaryFocus
                                                  ?.unfocus();
                                            },
                                            child: ModalInfoWidget(
                                              title: AppLocalizations.of(context)
                                                  .getText(
                                                '62w4l0pi' /* Erro */,
                                              ),
                                              description: AppLocalizations.of(context)
                                                  .getVariableText(
                                                ptText: 'Esse usuário não tem acesso ou não está cadastrado',
                                                esText: 'Este usuario no tiene acceso o no está registrado',
                                                enText: 'This user does not have access or is not registered',
                                              ),
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
                                icon: const Icon(
                                  Icons.qr_code_scanner_rounded,
                                  color: Colors.white,
                                  size: 20.0,
                                ),
                                text: AppLocalizations.of(context).getText(
                                  'nj8aj8uo' /* Liberar por QR Code */,
                                ),
                                options: AppButtonOptions(
                                  width: double.infinity,
                                  height: 48.0,
                                  padding: const EdgeInsetsDirectional.fromSTEB(
                                      16.0, 0.0, 16.0, 0.0),
                                  iconPadding: const EdgeInsetsDirectional.fromSTEB(
                                      0.0, 0.0, 8.0, 0.0),
                                  color: AppTheme.of(context).primary,
                                  textStyle: AppTheme.of(context)
                                      .titleSmall
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight:
                                              AppTheme.of(context)
                                                  .titleSmall
                                                  .fontWeight,
                                          fontStyle:
                                              AppTheme.of(context)
                                                  .titleSmall
                                                  .fontStyle,
                                        ),
                                        color: Colors.white,
                                        letterSpacing: 0.0,
                                        fontWeight: AppTheme.of(context)
                                            .titleSmall
                                            .fontWeight,
                                        fontStyle: AppTheme.of(context)
                                            .titleSmall
                                            .fontStyle,
                                      ),
                                  elevation: 0.0,
                                  borderRadius: BorderRadius.circular(14.0),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Align(
                          alignment: AlignmentDirectional(0.0, 0.0),
                          child: Builder(
                            builder: (context) => Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 16.0, 0.0, 0.0),
                              child: AppButton(
                                onPressed: () async {
                                  await showDialog(
                                    context: context,
                                    builder: (dialogContext) {
                                      return Dialog(
                                        elevation: 0,
                                        insetPadding: EdgeInsets.zero,
                                        backgroundColor: Colors.transparent,
                                        alignment:
                                            AlignmentDirectional(0.0, 0.0)
                                                .resolve(
                                                    Directionality.of(context)),
                                        child: GestureDetector(
                                          onTap: () {
                                            FocusScope.of(dialogContext)
                                                .unfocus();
                                            FocusManager.instance.primaryFocus
                                                ?.unfocus();
                                          },
                                          child: ModalEscalaManualWidget(
                                            onEmployeeAdded: _saveScheduleToBackend,
                                          ),
                                        ),
                                      );
                                    },
                                  );
                                },
                                icon: Icon(
                                  Icons.person_add_alt_rounded,
                                  color: AppTheme.of(context).primary,
                                  size: 20.0,
                                ),
                                text: AppLocalizations.of(context).getText(
                                  '2hrptyy4' /* Liberar manualmente */,
                                ),
                                options: AppButtonOptions(
                                  width: double.infinity,
                                  height: 48.0,
                                  padding: const EdgeInsetsDirectional.fromSTEB(
                                      16.0, 0.0, 16.0, 0.0),
                                  iconPadding: const EdgeInsetsDirectional.fromSTEB(
                                      0.0, 0.0, 8.0, 0.0),
                                  color: AppTheme.of(context).primaryBackground,
                                  textStyle: AppTheme.of(context)
                                      .titleSmall
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight:
                                              AppTheme.of(context)
                                                  .titleSmall
                                                  .fontWeight,
                                          fontStyle:
                                              AppTheme.of(context)
                                                  .titleSmall
                                                  .fontStyle,
                                        ),
                                        color: AppTheme.of(context).primary,
                                        letterSpacing: 0.0,
                                        fontWeight: AppTheme.of(context)
                                            .titleSmall
                                            .fontWeight,
                                        fontStyle: AppTheme.of(context)
                                            .titleSmall
                                            .fontStyle,
                                      ),
                                  elevation: 0.0,
                                  borderSide: BorderSide(
                                    color: AppTheme.of(context).primary,
                                    width: 1.0,
                                  ),
                                  borderRadius: BorderRadius.circular(14.0),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: Align(
                            alignment: AlignmentDirectional(0.0, 1.0),
                            child: Builder(
                              builder: (context) => Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 24.0, 0.0, 0.0),
                                child: AppButton(
                                  onPressed: !(AppState().allIds.isNotEmpty)
                                      ? null
                                      : () async {
                                          // Garantir que a escala está salva no backend
                                          await _saveScheduleToBackend();

                                          // Sync em background
                                          if (await NetworkService.instance
                                              .checkConnection()) {
                                            InitialSyncService.instance
                                                .performInitialSyncIfNeeded(
                                              force: true,
                                            );
                                          }

                                          // Registrar contexto do projeto ativo
                                          final ctxIdx = AppState().addOrGetProjectContext(
                                            projectId: AppState().user.projectId,
                                            projectName: AppState().user.projectName,
                                            teamsId: AppState().user.teamsId,
                                            scheduleId: AppState().user.sheduleId,
                                            sprintId: AppState().user.sprint.id,
                                            sprintTitle: AppState().user.sprint.title,
                                          );
                                          AppState().activeProjectIndex = ctxIdx;
                                          AppState().saveCurrentToActiveContext();

                                          AppState().liberaManual = [];
                                          AppState().qrCodeIDs = [];
                                          safeSetState(() {});

                                          context.pushNamed(
                                            HomePageTarefasWidget.routeName,
                                            extra: <String, dynamic>{
                                              kTransitionInfoKey:
                                                  TransitionInfo(
                                                hasTransition: true,
                                                transitionType:
                                                    PageTransitionType.fade,
                                                duration:
                                                    Duration(milliseconds: 250),
                                              ),
                                            },
                                          );
                                        },
                                  text: AppLocalizations.of(context).getText(
                                    'sefof8ig' /* Começar jornada de trabalho */,
                                  ),
                                  options: AppButtonOptions(
                                    width: double.infinity,
                                    height: 48.0,
                                    padding: const EdgeInsetsDirectional.fromSTEB(
                                        16.0, 0.0, 16.0, 0.0),
                                    iconPadding: const EdgeInsetsDirectional.fromSTEB(
                                        0.0, 0.0, 0.0, 0.0),
                                    color: AppTheme.of(context).primary,
                                    textStyle: AppTheme.of(context)
                                        .titleMedium
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                AppTheme.of(context)
                                                    .titleMedium
                                                    .fontWeight,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .titleMedium
                                                    .fontStyle,
                                          ),
                                          color: Colors.white,
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              AppTheme.of(context)
                                                  .titleMedium
                                                  .fontWeight,
                                          fontStyle:
                                              AppTheme.of(context)
                                                  .titleMedium
                                                  .fontStyle,
                                        ),
                                    elevation: 2.0,
                                    borderRadius: BorderRadius.circular(16.0),
                                    disabledColor:
                                        AppTheme.of(context).alternate,
                                    disabledTextColor:
                                        AppTheme.of(context)
                                            .secondaryText,
                                  ),
                                ),
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
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
