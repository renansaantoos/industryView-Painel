import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_escala_manual_widget.dart';
import '/components/modal_info_widget.dart';
import '/components/modal_sucess_qrcode_widget.dart';
import '/components/offline_banner_widget.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import '/services/network_service.dart';
import '/services/initial_sync_service.dart';
import 'dart:ui';
import '/core/utils/custom_functions.dart' as functions;
import '/index.dart';
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
  const PageCheckQrcodeWidget({super.key, this.skipProjectCheck = false});

  final bool skipProjectCheck;

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
            (_model.getScheduleId1?.jsonBody ?? ''),
            r'''$[0].schedule_id''',
          ),
          0,
        );
        final scheduleIdFallback = valueOrDefault<int>(
          getJsonField(
            (_model.getScheduleId1?.jsonBody ?? ''),
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
              _model.listaFuncionarios?.jsonBody ?? '',
              r'''$.itemsTotal''',
            )) ??
            ProjectsGroup.listaMembrosDeUmaEquipeCall
                .list((_model.listaFuncionarios?.jsonBody ?? ''))
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
        // Verificar se é primeiro login do dia (novo dia de trabalho)
        final isFirstLogin = AuthenticationGroup
            .getTheRecordBelongingToTheAuthenticationTokenCall
            .firstLogin(
          (_model.validToken?.jsonBody ?? ''),
        ) ?? true;

        // Extrair projectId e teamsId — prioridade é o AppState (projeto selecionado pelo usuário),
        // fallback para o meCall (primeiro projeto da lista)
        final meCall = AuthenticationGroup
            .getTheRecordBelongingToTheAuthenticationTokenCall;
        final tokenJson = _model.validToken?.jsonBody ?? '';
        final tokenProjectId = AppState().user.projectId > 0
            ? AppState().user.projectId
            : valueOrDefault<int>(meCall.projectId(tokenJson), 0);
        final tokenTeamsId = AppState().user.teamsId > 0
            ? AppState().user.teamsId
            : valueOrDefault<int>(meCall.teamsId(tokenJson), 0);

        if (kDebugMode) {
          final rawFirstLogin = getJsonField(tokenJson, r'''$.user.first_login''');
          print('=== QR PAGE DEBUG ===');
          print('rawFirstLogin from API: $rawFirstLogin (type: ${rawFirstLogin.runtimeType})');
          print('isFirstLogin (parsed): $isFirstLogin');
          print('tokenProjectId: $tokenProjectId (appState: ${AppState().user.projectId}, meCall: ${meCall.projectId(tokenJson)})');
          print('tokenTeamsId: $tokenTeamsId (appState: ${AppState().user.teamsId}, meCall: ${meCall.teamsId(tokenJson)})');
          print('validToken succeeded: ${_model.validToken?.succeeded}');
          print('validToken statusCode: ${_model.validToken?.statusCode}');
          print('====================');
        }

        // Se já iniciou jornada hoje (first_login=false), ir direto para Home
        if (!isFirstLogin &&
            tokenProjectId > 0 &&
            tokenTeamsId > 0) {
          final existingSchedule = await ProjectsGroup
              .listaColaboradoresDaEscalaDoDiaCall
              .call(
            projectsId: tokenProjectId,
            teamsId: tokenTeamsId,
            token: currentAuthenticationToken,
          );
          if (existingSchedule.succeeded) {
            final scheduleId = valueOrDefault<int>(
              getJsonField(
                (existingSchedule.jsonBody ?? ''),
                r'''$[0].schedule_id''',
              ),
              0,
            );
            final scheduleIdFallback = valueOrDefault<int>(
              getJsonField(
                (existingSchedule.jsonBody ?? ''),
                r'''$[0].id''',
              ),
              0,
            );
            final resolvedScheduleId =
                scheduleId != 0 ? scheduleId : scheduleIdFallback;

            if (resolvedScheduleId != 0) {
              // Escala do dia já existe — buscar sprint ativa e ir para Home
              SprintsStruct? sprintData;
              final sprintResponse =
                  await SprintsGroup.getSprintAtivaCall.call(
                projectsId: tokenProjectId,
                token: currentAuthenticationToken,
              );
              if (sprintResponse.succeeded) {
                final sprintItems = SprintsGroup.getSprintAtivaCall
                    .listAtivas(sprintResponse.jsonBody ?? '');
                if (sprintItems != null && sprintItems.isNotEmpty) {
                  final s = sprintItems.first;
                  sprintData = SprintsStruct(
                    id: castToType<int>(getJsonField(s, r'''$.id''')),
                    title: castToType<String>(
                        getJsonField(s, r'''$.title''')),
                    objective: castToType<String>(
                        getJsonField(s, r'''$.objective''')),
                    startDate: parseDateToMillis(
                        getJsonField(s, r'''$.start_date''')),
                    endDate: parseDateToMillis(
                        getJsonField(s, r'''$.end_date''')),
                    progressPercentage: castToType<double>(
                        getJsonField(s, r'''$.progress_percentage''')),
                  );
                }
              }

              AppState().updateUserStruct(
                (e) => e
                  ..sheduleId = resolvedScheduleId
                  ..projectId = tokenProjectId
                  ..teamsId = tokenTeamsId
                  ..sprint = sprintData ?? e.sprint,
              );
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
          }
          // Nenhuma escala encontrada para hoje — limpar sheduleId antigo
          AppState().updateUserStruct((e) => e..sheduleId = null);
        }

        // Verificar múltiplos projetos (para auto-login / sessão restaurada)
        if (kDebugMode) {
          print('=== MULTI-PROJECT CHECK ===');
          print('skipProjectCheck: ${widget.skipProjectCheck}');
          print('allProjectIds: ${meCall.allProjectIds(tokenJson)}');
        }
        if (!widget.skipProjectCheck) {
          final allProjects = meCall.allProjectIds(tokenJson);
          if (allProjects.length > 1) {
            // Atualizar dados básicos do usuário antes de redirecionar
            AppState().updateUserStruct(
              (e) => e
                ..token = valueOrDefault<String>(
                  currentAuthenticationToken,
                  AppState().user.token,
                )
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
              ProjectSelectionWidget.routeName,
              context.mounted,
              extra: <String, dynamic>{
                kTransitionInfoKey: TransitionInfo(
                  hasTransition: true,
                  transitionType: PageTransitionType.fade,
                ),
                'tokenResponse': _model.validToken!,
                'loginResponse': ApiCallResponse(
                  {'authToken': currentAuthenticationToken},
                  <String, String>{},
                  200,
                ),
              },
            );
            return;
          }
        }

        // Preservar dados do projeto selecionado (quando vindo da ProjectSelection)
        final savedTeamsId = AppState().user.teamsId;
        final savedProjectId = AppState().user.projectId;
        final savedSprint = AppState().user.sprint;

        // Persistir/atualizar dados do usuário quando online
        AppState().updateUserStruct(
          (e) => e
            ..token = valueOrDefault<String>(
              currentAuthenticationToken,
              AppState().user.token,
            )
            ..id = valueOrDefault<int>(
              AuthenticationGroup
                  .getTheRecordBelongingToTheAuthenticationTokenCall
                  .id(
                (_model.validToken?.jsonBody ?? ''),
              ),
              AppState().user.id,
            )
            ..name = valueOrDefault<String>(
              AuthenticationGroup
                  .getTheRecordBelongingToTheAuthenticationTokenCall
                  .name(
                (_model.validToken?.jsonBody ?? ''),
              ),
              AppState().user.name,
            )
            ..email = valueOrDefault<String>(
              AuthenticationGroup
                  .getTheRecordBelongingToTheAuthenticationTokenCall
                  .email(
                (_model.validToken?.jsonBody ?? ''),
              ),
              AppState().user.email,
            )
            ..phone = valueOrDefault<String>(
              AuthenticationGroup
                  .getTheRecordBelongingToTheAuthenticationTokenCall
                  .phone(
                (_model.validToken?.jsonBody ?? ''),
              ),
              AppState().user.phone,
            )
            ..image = valueOrDefault<String>(
              AuthenticationGroup
                  .getTheRecordBelongingToTheAuthenticationTokenCall
                  .image(
                (_model.validToken?.jsonBody ?? ''),
              ),
              AppState().user.image,
            )
            ..teamsId = valueOrDefault<int>(
              AuthenticationGroup
                  .getTheRecordBelongingToTheAuthenticationTokenCall
                  .teamsId(
                (_model.validToken?.jsonBody ?? ''),
              ),
              AppState().user.teamsId,
            )
            ..projectId = valueOrDefault<int>(
              AuthenticationGroup
                  .getTheRecordBelongingToTheAuthenticationTokenCall
                  .projectId(
                (_model.validToken?.jsonBody ?? ''),
              ),
              AppState().user.projectId,
            )
            ..companyId = valueOrDefault<int>(
              AuthenticationGroup
                  .getTheRecordBelongingToTheAuthenticationTokenCall
                  .companyID(
                (_model.validToken?.jsonBody ?? ''),
              ),
              AppState().user.companyId,
            )
            ..sprint = SprintsStruct(
              id: valueOrDefault<int>(
                AuthenticationGroup
                    .getTheRecordBelongingToTheAuthenticationTokenCall
                    .sprintId(
                  (_model.validToken?.jsonBody ?? ''),
                ),
                AppState().user.sprint.id,
              ),
              title: valueOrDefault<String>(
                AuthenticationGroup
                    .getTheRecordBelongingToTheAuthenticationTokenCall
                    .spritnTitle(
                  (_model.validToken?.jsonBody ?? ''),
                ),
                AppState().user.sprint.title,
              ),
              objective: valueOrDefault<String>(
                AuthenticationGroup
                    .getTheRecordBelongingToTheAuthenticationTokenCall
                    .sprintObjective(
                  (_model.validToken?.jsonBody ?? ''),
                ),
                AppState().user.sprint.objective,
              ),
              startDate: valueOrDefault<int>(
                AuthenticationGroup
                    .getTheRecordBelongingToTheAuthenticationTokenCall
                    .sprintDtStart(
                  (_model.validToken?.jsonBody ?? ''),
                ),
                AppState().user.sprint.startDate,
              ),
              endDate: valueOrDefault<int>(
                AuthenticationGroup
                    .getTheRecordBelongingToTheAuthenticationTokenCall
                    .sprintDtEnd(
                  (_model.validToken?.jsonBody ?? ''),
                ),
                AppState().user.sprint.endDate,
              ),
              progressPercentage: valueOrDefault<double>(
                AuthenticationGroup
                    .getTheRecordBelongingToTheAuthenticationTokenCall
                    .sprintProgress(
                  (_model.validToken?.jsonBody ?? ''),
                ),
                AppState().user.sprint.progressPercentage,
              ),
              tasksConcluidas: valueOrDefault<int>(
                AuthenticationGroup
                    .getTheRecordBelongingToTheAuthenticationTokenCall
                    .concluidas(
                  (_model.validToken?.jsonBody ?? ''),
                )?.length,
                AppState().user.sprint.tasksConcluidas,
              ),
              tasksAndamento: valueOrDefault<int>(
                AuthenticationGroup
                    .getTheRecordBelongingToTheAuthenticationTokenCall
                    .andamento(
                  (_model.validToken?.jsonBody ?? ''),
                )?.length,
                AppState().user.sprint.tasksAndamento,
              ),
            ),
        );

        // Restaurar dados do projeto selecionado (evita sobrescrita pelo me endpoint)
        if (widget.skipProjectCheck) {
          AppState().updateUserStruct(
            (e) => e
              ..teamsId = savedTeamsId
              ..projectId = savedProjectId
              ..sprint = savedSprint,
          );
        }

        // Limpar listas locais (serão recarregadas do backend)
        AppState().update(() {
          AppState().escalaServerIds = [];
          AppState().escalaLocalIds = [];
          AppState().escalaRemovedIds = [];
          AppState().escalaEntryTimes = {};
          AppState().allIds = [];
          AppState().qrCodeIDs = [];
          AppState().liberaManual = [];
        });

        // Carregar escala existente do backend (pode ter sido salva antes de fechar o app)
        try {
          if (kDebugMode) {
            print('=== LOADING SCHEDULE FROM BACKEND ===');
            print('projectsId: ${AppState().user.projectId}, teamsId: ${AppState().user.teamsId}');
          }
          final escalaDia = await ProjectsGroup
              .listaColaboradoresDaEscalaDoDiaCall
              .call(
            projectsId: AppState().user.projectId,
            teamsId: AppState().user.teamsId,
            token: currentAuthenticationToken,
          );
          if (kDebugMode) {
            print('escalaDia succeeded: ${escalaDia.succeeded}, statusCode: ${escalaDia.statusCode}');
            print('escalaDia body: ${escalaDia.jsonBody}');
          }
          if (escalaDia.succeeded) {
            final ids = ProjectsGroup
                    .listaColaboradoresDaEscalaDoDiaCall
                    .ids(escalaDia.jsonBody)
                    ?.toList()
                    .cast<int>() ??
                <int>[];
            if (kDebugMode) {
              print('Parsed employee IDs from schedule: $ids');
            }
            // Extrair horários de entrada e scheduleId
            final entryTimes = <int, String>{};
            final rawBody = escalaDia.jsonBody;
            int resolvedScheduleId = 0;
            if (rawBody is List && rawBody.isNotEmpty) {
              resolvedScheduleId = valueOrDefault<int>(
                getJsonField(rawBody.first, r'''$.schedule_id'''),
                0,
              );
              if (resolvedScheduleId == 0) {
                resolvedScheduleId = valueOrDefault<int>(
                  getJsonField(rawBody.first, r'''$.id'''),
                  0,
                );
              }
              for (final item in rawBody) {
                final userId = castToType<int>(getJsonField(item, r'''$.users_id'''));
                final createdAt = getJsonField(item, r'''$.created_at''')?.toString();
                if (userId != null && createdAt != null) {
                  entryTimes[userId] = createdAt;
                }
              }
            }
            if (ids.isNotEmpty) {
              AppState().update(() {
                AppState().escalaServerIds = ids;
                AppState().escalaEntryTimes = entryTimes;
                for (final id in ids) {
                  if (!AppState().allIds.contains(id)) {
                    AppState().addToAllIds(id);
                  }
                }
              });
              if (resolvedScheduleId != 0) {
                AppState().updateUserStruct(
                  (e) => e..sheduleId = resolvedScheduleId,
                );
              }
            } else {
              // Escala do dia está vazia — limpar scheduleId persistido para
              // evitar que _saveScheduleToBackend faça UPDATE em escala de outro dia
              if (kDebugMode) {
                print('LOADING SCHEDULE: nenhuma escala para hoje. Limpando sheduleId antigo (${AppState().user.sheduleId})');
              }
              AppState().updateUserStruct((e) => e..sheduleId = 0);
            }
          }
        } catch (_) {
          // Ignorar erro de preload
        }

        // Pré-carregar lista de membros para uso offline na Escala
        Future.microtask(() async {
          try {
            await ProjectsGroup.listaMembrosDeUmaEquipeCall.call(
              teamsId: AppState().user.teamsId,
              page: 1,
              perPage: 100,
              token: currentAuthenticationToken,
            );
          } catch (_) {
            // Ignorar erro de preload
          }
        });

        // Pré-carregar dados da RDO para uso offline (Tarefas da sprint + escala)
        // perPage 50 para incluir mais tarefas concluídas quando ficar offline
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
          } catch (_) {
            // Ignorar erro de preload
          }
        });

        // Após validar e salvar usuário, força sync completo em background
        Future.microtask(() async {
          try {
            await InitialSyncService.instance
                .performInitialSyncIfNeeded(force: true);
          } catch (e, stackTrace) {
            if (kDebugMode) {
              print('PageCheckQrcode: Erro no initial sync (não crítico): $e');
              print('PageCheckQrcode: StackTrace: $stackTrace');
            }
          }
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
              _model.listaFuncionarios?.jsonBody ?? '',
              r'''$.itemsTotal''',
            )) ??
            ProjectsGroup.listaMembrosDeUmaEquipeCall
                .list((_model.listaFuncionarios?.jsonBody ?? ''))
                ?.length;

        safeSetState(() {});
        AppState().loading = false;
        safeSetState(() {});
      } else {
        AppState().loading = false;
        safeSetState(() {});
        return;
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  /// Salva a escala no backend (cria se não existe, edita se já existe).
  ///
  /// Sempre consulta o backend para descobrir o scheduleId de HOJE antes de
  /// decidir entre CREATE e UPDATE, evitando atualizar escalas de dias anteriores
  /// que possam estar persistidas no AppState via SharedPreferences.
  Future<void> _saveScheduleToBackend() async {
    if (kDebugMode) {
      print('=== SAVE SCHEDULE TO BACKEND ===');
      print('allIds: ${AppState().allIds}');
      print('scheduleId (AppState, pode ser de outro dia): ${AppState().user.sheduleId}');
      print('projectId: ${AppState().user.projectId}, teamsId: ${AppState().user.teamsId}');
    }
    if (AppState().allIds.isEmpty) {
      if (kDebugMode) print('SAVE ABORTED: allIds is empty');
      return;
    }
    try {
      // Passo 1: consultar o backend para ver se já existe escala de HOJE.
      // Isso garante que nunca usaremos um scheduleId de outro dia persistido no AppState.
      if (kDebugMode) print('SAVE: Consultando escala de hoje no backend...');
      int todayScheduleId = 0;
      final escalaDia = await ProjectsGroup.listaColaboradoresDaEscalaDoDiaCall.call(
        projectsId: AppState().user.projectId,
        teamsId: AppState().user.teamsId,
        token: currentAuthenticationToken,
      );
      if (kDebugMode) {
        print('SAVE: escalaDia.succeeded=${escalaDia.succeeded}, body=${escalaDia.jsonBody}');
      }
      if (escalaDia.succeeded) {
        final rawBody = escalaDia.jsonBody;
        if (rawBody is List && rawBody.isNotEmpty) {
          // Tentar campo schedule_id primeiro, depois id
          todayScheduleId = valueOrDefault<int>(
            getJsonField(rawBody.first, r'''$.schedule_id'''),
            0,
          );
          if (todayScheduleId == 0) {
            todayScheduleId = valueOrDefault<int>(
              getJsonField(rawBody.first, r'''$.id'''),
              0,
            );
          }
        }
      }
      if (kDebugMode) print('SAVE: todayScheduleId=$todayScheduleId');

      if (todayScheduleId != 0) {
        // Escala de hoje já existe no backend — atualizar com o ID correto
        if (kDebugMode) print('UPDATING existing schedule $todayScheduleId (de hoje)');
        await ProjectsGroup.editaEscalaDosColaboradoresCall.call(
          usersIdList: AppState().allIds,
          scheduleId: todayScheduleId,
          token: currentAuthenticationToken,
        );
        // Garantir que o AppState reflita o scheduleId correto
        AppState().updateUserStruct((e) => e..sheduleId = todayScheduleId);
      } else {
        // Nenhuma escala para hoje — criar nova
        if (kDebugMode) print('CREATING new schedule...');
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
          final newScheduleId = getJsonField(response.jsonBody ?? '', r'''$.id''');
          if (newScheduleId != null) {
            AppState().updateUserStruct((e) => e..sheduleId = newScheduleId);
            if (kDebugMode) print('SAVE: novo scheduleId salvo no AppState: $newScheduleId');
          }
        }
      }
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
                                  if (widget.skipProjectCheck) ...[
                                    IconButton(
                                      icon: const Icon(
                                        Icons.arrow_back,
                                        color: Colors.white,
                                      ),
                                      onPressed: () => Navigator.pop(context),
                                      padding: EdgeInsets.zero,
                                      constraints: const BoxConstraints(),
                                    ),
                                    const SizedBox(width: 12),
                                  ],
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
                                  padding: const EdgeInsets.only(top: 4.0),
                                  child: Row(
                                    children: [
                                      Icon(
                                        Icons.business_rounded,
                                        color: Colors.white70,
                                        size: 14.0,
                                      ),
                                      const SizedBox(width: 6),
                                      Flexible(
                                        child: Text(
                                          AppState().user.projectName,
                                          style: AppTheme.of(context)
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
                                                color: Colors.white70,
                                                letterSpacing: 0.0,
                                              ),
                                          overflow: TextOverflow.ellipsis,
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
                        child: Padding(
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
                                      .list((_model.listaFuncionarios?.jsonBody ?? ''));

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
                                        .userId((_model.apiQrcode?.jsonBody ?? ''));
                                    qrUserName = ReportsGroup.qrcodeReaderCall
                                        .userName((_model.apiQrcode?.jsonBody ?? ''));

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

                                          // Marcar first_login = false (jornada iniciada)
                                          _model.firstLogin =
                                              await AuthenticationGroup
                                                  .dailyLoginCall
                                                  .call(
                                            token: currentAuthenticationToken,
                                          );

                                          if (!(_model.firstLogin?.succeeded ?? false)) {
                                            await showDialog(
                                              context: context,
                                              builder: (dialogContext) {
                                                return Dialog(
                                                  elevation: 0,
                                                  insetPadding: EdgeInsets.zero,
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
                                                          .instance.primaryFocus
                                                          ?.unfocus();
                                                    },
                                                    child: ModalInfoWidget(
                                                      title: AppLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'z0y0nc0v' /* Erro */,
                                                      ),
                                                      description: AppLocalizations.of(context)
                                                          .getVariableText(
                                                        ptText: 'Erro ao iniciar jornada. Tente novamente.',
                                                        esText: 'Error al iniciar jornada. Intente de nuevo.',
                                                        enText: 'Error starting work journey. Try again.',
                                                      ),
                                                    ),
                                                  ),
                                                );
                                              },
                                            );
                                            return;
                                          }

                                          // Sync em background
                                          if (await NetworkService.instance
                                              .checkConnection()) {
                                            InitialSyncService.instance
                                                .performInitialSyncIfNeeded(
                                              force: true,
                                            );
                                          }

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
