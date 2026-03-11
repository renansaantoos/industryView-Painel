import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/pending_day_finalization_widget.dart';
import '/core/theme/app_theme.dart';
import '/core/navigation/nav.dart';
import '/core/utils/app_utils.dart';
import '/index.dart';

class DailyHubWidget extends StatefulWidget {
  const DailyHubWidget({super.key});

  static String routeName = 'DailyHub';
  static String routePath = '/dailyHub';

  @override
  State<DailyHubWidget> createState() => _DailyHubWidgetState();
}

class _DailyHubWidgetState extends State<DailyHubWidget> {
  bool _isLoading = true;
  bool _isNavigating = false;
  List<_HubProjectItem> _projects = [];
  List<dynamic> _pendingSchedules = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await Future.wait([
      _loadProjects(),
      _loadPendingSchedules(),
    ]);
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _loadProjects() async {
    try {
      final meCall = AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall;
      final meResponse = await meCall.call(
        bearerAuth: currentAuthenticationToken,
      );
      if (!meResponse.succeeded || !mounted) return;

      final tokenJson = meResponse.jsonBody;
      final companyId = meCall.companyID(tokenJson);
      final userProjectIds = meCall.allProjectIds(tokenJson);

      if (companyId == null) return;

      final response = await ProjectsGroup.getUserProjectsCall.call(
        companyId: companyId,
        token: currentAuthenticationToken,
      );

      if (!mounted || !response.succeeded) return;

      final allItems =
          ProjectsGroup.getUserProjectsCall.items(response.jsonBody);
      if (allItems == null) return;

      final userIds = userProjectIds.toSet();
      const allowedStatuses = {1, 3};

      // Obter leaders e members para resolver teamsId por projeto
      final leaders = meCall.teamsLeader(tokenJson);
      final members = meCall.teamsMember(tokenJson);

      final today = DateTime.now().toIso8601String().substring(0, 10);
      final contexts = AppState().projectContexts;

      _projects = allItems
          .where((item) {
            final id = castToType<int>(getJsonField(item, r'''$.id'''));
            final statusId = castToType<int>(
                getJsonField(item, r'''$.projects_statuses_id'''));
            return id != null &&
                userIds.contains(id) &&
                statusId != null &&
                allowedStatuses.contains(statusId);
          })
          .map((item) {
            final id = castToType<int>(getJsonField(item, r'''$.id'''))!;
            final name =
                castToType<String>(getJsonField(item, r'''$.name''')) ??
                    'Projeto';

            // Resolver teamsId
            int? teamsId;
            if (leaders != null) {
              for (final leader in leaders) {
                final teamProjId = castToType<int>(
                    getJsonField(leader, r'''$.projects_id'''));
                if (teamProjId == id) {
                  teamsId =
                      castToType<int>(getJsonField(leader, r'''$.id'''));
                  break;
                }
              }
            }
            if (teamsId == null && members != null) {
              for (final member in members) {
                final teamProjId = castToType<int>(
                    getJsonField(member, r'''$.projects_id'''));
                if (teamProjId == id) {
                  teamsId =
                      castToType<int>(getJsonField(member, r'''$.id'''));
                  break;
                }
              }
            }

            // Verificar contexto existente para hoje
            final ctx = contexts
                .where((c) => c.projectId == id && c.date == today)
                .firstOrNull;

            _ProjectStatus status;
            if (ctx != null && ctx.rdoFinalized) {
              status = _ProjectStatus.finalized;
            } else if (ctx != null && ctx.scheduleId != 0) {
              status = _ProjectStatus.inProgress;
            } else {
              status = _ProjectStatus.notStarted;
            }

            return _HubProjectItem(
              id: id,
              name: name,
              teamsId: teamsId ?? 0,
              status: status,
              contextIndex: ctx != null
                  ? contexts.indexOf(ctx)
                  : -1,
            );
          })
          .toList();

      // Ordenar: em andamento primeiro, depois não iniciados, finalizados por último
      _projects.sort((a, b) {
        const order = {
          _ProjectStatus.inProgress: 0,
          _ProjectStatus.notStarted: 1,
          _ProjectStatus.finalized: 2,
        };
        return (order[a.status] ?? 1).compareTo(order[b.status] ?? 1);
      });
    } catch (e) {
      if (kDebugMode) print('DailyHub: error loading projects: $e');
    }
  }

  Future<void> _loadPendingSchedules() async {
    try {
      final pendingResp = await ProjectsGroup.getPendingSchedulesCall
          .call(token: currentAuthenticationToken);
      if (pendingResp.succeeded && mounted) {
        final hasPend = ProjectsGroup.getPendingSchedulesCall
                .hasPending(pendingResp.jsonBody) ??
            false;
        if (hasPend) {
          _pendingSchedules = ProjectsGroup.getPendingSchedulesCall
                  .pendingSchedules(pendingResp.jsonBody) ??
              [];
        }
      }
    } catch (e) {
      if (kDebugMode) print('DailyHub: error loading pending: $e');
    }
  }

  Future<void> _handlePendingSchedule(dynamic pending) async {
    if (_isNavigating) return;
    setState(() => _isNavigating = true);

    try {
      final pId = (pending['schedule_id'] as int?) ?? 0;
      final pDate = pending['schedule_date']?.toString() ?? '';
      final pProject = pending['project_name']?.toString();
      final pTeam = pending['team_name']?.toString();
      final pWorkers = pending['workers'] as List<dynamic>?;
      final pTasks = pending['tasks'] as List<dynamic>?;

      final finalized = await Navigator.push<bool>(
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

      if (finalized == true && mounted) {
        setState(() {
          _isLoading = true;
          _pendingSchedules.clear();
          _projects.clear();
        });
        await _loadData();
      }
    } finally {
      if (mounted) setState(() => _isNavigating = false);
    }
  }

  Future<void> _selectProject(_HubProjectItem project) async {
    if (_isNavigating) return;
    if (project.status == _ProjectStatus.finalized) return;

    setState(() => _isNavigating = true);

    try {
      // Salvar contexto atual antes de trocar
      AppState().saveCurrentToActiveContext();

      // Buscar sprint ativa para o projeto
      SprintsStruct? sprintData;
      final sprintResponse = await SprintsGroup.getSprintAtivaCall.call(
        projectsId: project.id,
        token: currentAuthenticationToken,
      );
      if (sprintResponse.succeeded) {
        final sprintItems = SprintsGroup.getSprintAtivaCall
            .listAtivas(sprintResponse.jsonBody);
        if (sprintItems != null && sprintItems.isNotEmpty) {
          final s = sprintItems.first;
          sprintData = SprintsStruct(
            id: castToType<int>(getJsonField(s, r'''$.id''')),
            title: castToType<String>(getJsonField(s, r'''$.title''')),
            objective:
                castToType<String>(getJsonField(s, r'''$.objective''')),
            startDate:
                parseDateToMillis(getJsonField(s, r'''$.start_date''')),
            endDate: parseDateToMillis(getJsonField(s, r'''$.end_date''')),
            progressPercentage: castToType<double>(
                getJsonField(s, r'''$.progress_percentage''')),
          );
        }
      }

      // Criar ou recuperar contexto do projeto
      final ctxIndex = AppState().addOrGetProjectContext(
        projectId: project.id,
        projectName: project.name,
        teamsId: project.teamsId,
        sprintId: sprintData?.id,
        sprintTitle: sprintData?.title,
      );
      AppState().switchToProject(ctxIndex);

      // Atualizar sprint completa no user struct
      if (sprintData != null) {
        AppState().updateUserStruct((e) => e..sprint = sprintData!);
      }

      if (!mounted) return;

      if (project.status == _ProjectStatus.inProgress) {
        // Projeto já em andamento — ir direto para home_tarefas
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
      } else {
        // Projeto não iniciado — ir para escala (QR code)
        context.pushNamedAuth(
          PageCheckQrcodeWidget.routeName,
          context.mounted,
          extra: <String, dynamic>{
            kTransitionInfoKey: TransitionInfo(
              hasTransition: true,
              transitionType: PageTransitionType.fade,
            ),
            'skipProjectCheck': true,
            'fromDailyHub': true,
          },
        );
      }
    } finally {
      if (mounted) setState(() => _isNavigating = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = AppTheme.of(context);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
      ),
      child: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF011741), Color(0xFF0A2F6E), Color(0xFFF5F5F5)],
            stops: [0.0, 0.3, 0.45],
          ),
        ),
        child: Scaffold(
          backgroundColor: Colors.transparent,
          body: SafeArea(
            top: false,
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: Colors.white))
                : CustomScrollView(
                    slivers: [
                      SliverToBoxAdapter(
                        child: _buildHeader(theme),
                      ),
                      if (_pendingSchedules.isNotEmpty)
                        SliverToBoxAdapter(
                          child: _buildPendingSection(theme),
                        ),
                      SliverToBoxAdapter(
                        child: _buildProjectsSection(theme),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(AppTheme theme) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
          20.0, MediaQuery.of(context).padding.top + 20.0, 20.0, 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  'Olá, ${AppState().user.name.split(' ').first}!',
                  style: GoogleFonts.lexend(
                    color: Colors.white,
                    fontSize: 24.0,
                    fontWeight: FontWeight.w700,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              IconButton(
                onPressed: () async {
                  AppState().clearAllProjectContexts();
                  await authManager.signOut();
                  AppState().user = UserLoginStruct();
                  if (!context.mounted) return;
                  context.goNamed(LoginWidget.routeName);
                },
                icon: const Icon(Icons.logout_rounded, color: Colors.white70),
                tooltip: 'Sair',
              ),
            ],
          ),
          const SizedBox(height: 4.0),
          Text(
            'Menu do Dia',
            style: GoogleFonts.lexend(
              color: Colors.white70,
              fontSize: 14.0,
              fontWeight: FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPendingSection(AppTheme theme) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4.0, bottom: 8.0),
            child: Row(
              children: [
                Icon(Icons.warning_amber_rounded,
                    color: Colors.orange.shade700, size: 20.0),
                const SizedBox(width: 6.0),
                Text(
                  'RDO Pendente',
                  style: GoogleFonts.lexend(
                    color: theme.primaryText,
                    fontSize: 16.0,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          ..._pendingSchedules.map((pending) {
            final pProject = pending['project_name']?.toString() ?? 'Projeto';
            final pDate = pending['schedule_date']?.toString() ?? '';
            final displayDate = pDate.length >= 10
                ? '${pDate.substring(8, 10)}/${pDate.substring(5, 7)}'
                : pDate;

            return Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => _handlePendingSchedule(pending),
                  borderRadius: BorderRadius.circular(16.0),
                  child: Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.orange.shade50,
                      borderRadius: BorderRadius.circular(16.0),
                      border: Border.all(
                          color: Colors.orange.shade200, width: 1.0),
                    ),
                    padding: const EdgeInsets.all(16.0),
                    child: Row(
                      children: [
                        Container(
                          width: 40.0,
                          height: 40.0,
                          decoration: BoxDecoration(
                            color: Colors.orange.shade100,
                            borderRadius: BorderRadius.circular(12.0),
                          ),
                          child: Icon(Icons.assignment_late_outlined,
                              color: Colors.orange.shade700, size: 22.0),
                        ),
                        const SizedBox(width: 12.0),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                pProject,
                                style: GoogleFonts.lexend(
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14.0,
                                  color: theme.primaryText,
                                ),
                              ),
                              const SizedBox(height: 2.0),
                              Text(
                                'Dia $displayDate - Finalizar RDO',
                                style: GoogleFonts.lexend(
                                  fontSize: 12.0,
                                  color: Colors.orange.shade700,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Icon(Icons.arrow_forward_ios,
                            color: Colors.orange.shade400, size: 16.0),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildProjectsSection(AppTheme theme) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 4.0, bottom: 12.0),
            child: Text(
              'Projetos',
              style: GoogleFonts.lexend(
                color: theme.primaryText,
                fontSize: 16.0,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          if (_projects.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Text(
                  'Nenhum projeto encontrado.',
                  style: GoogleFonts.lexend(
                    color: theme.secondaryText,
                    fontSize: 14.0,
                  ),
                ),
              ),
            )
          else
            ...List.generate(_projects.length, (index) {
              final project = _projects[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 10.0),
                child: _buildProjectCard(project, theme),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildProjectCard(_HubProjectItem project, AppTheme theme) {
    final isFinalized = project.status == _ProjectStatus.finalized;
    final isInProgress = project.status == _ProjectStatus.inProgress;

    final Color statusColor;
    final String statusLabel;
    final IconData statusIcon;

    switch (project.status) {
      case _ProjectStatus.inProgress:
        statusColor = const Color(0xFF2B5EA7);
        statusLabel = 'Em andamento';
        statusIcon = Icons.play_circle_outline;
        break;
      case _ProjectStatus.finalized:
        statusColor = Colors.green.shade600;
        statusLabel = 'RDO Finalizado';
        statusIcon = Icons.check_circle_outline;
        break;
      case _ProjectStatus.notStarted:
        statusColor = theme.secondaryText;
        statusLabel = 'Iniciar dia';
        statusIcon = Icons.add_circle_outline;
        break;
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: isFinalized ? null : () => _selectProject(project),
        borderRadius: BorderRadius.circular(16.0),
        splashColor: theme.primary.withOpacity(0.08),
        child: Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: isFinalized
                ? theme.secondaryBackground.withOpacity(0.6)
                : theme.secondaryBackground,
            borderRadius: BorderRadius.circular(16.0),
            boxShadow: isFinalized
                ? null
                : [
                    BoxShadow(
                      color: isInProgress
                          ? const Color(0xFF2B5EA7).withOpacity(0.08)
                          : Colors.black.withOpacity(0.04),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
            border: isInProgress
                ? Border.all(
                    color: const Color(0xFF2B5EA7).withOpacity(0.3),
                    width: 1.5)
                : null,
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Container(
                  width: 44.0,
                  height: 44.0,
                  decoration: BoxDecoration(
                    gradient: isFinalized
                        ? null
                        : const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [Color(0xFFECF5FF), Color(0xFFD6EBFF)],
                          ),
                    color: isFinalized ? Colors.green.shade50 : null,
                    borderRadius: BorderRadius.circular(14.0),
                  ),
                  child: Icon(
                    Icons.business_rounded,
                    color: isFinalized
                        ? Colors.green.shade400
                        : theme.primary,
                    size: 22.0,
                  ),
                ),
                const SizedBox(width: 12.0),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        project.name,
                        style: GoogleFonts.lexend(
                          fontWeight: FontWeight.w500,
                          fontSize: 14.0,
                          color: isFinalized
                              ? theme.secondaryText
                              : theme.primaryText,
                        ),
                      ),
                      const SizedBox(height: 4.0),
                      Row(
                        children: [
                          Icon(statusIcon, color: statusColor, size: 14.0),
                          const SizedBox(width: 4.0),
                          Text(
                            statusLabel,
                            style: GoogleFonts.lexend(
                              fontSize: 12.0,
                              color: statusColor,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                if (!isFinalized)
                  Icon(
                    Icons.arrow_forward_ios,
                    color: theme.secondaryText,
                    size: 16.0,
                  ),
              ],
            ),
          ),
        ),
      ),
    ).animate().fadeIn(duration: 300.ms).slideX(begin: 0.03);
  }
}

enum _ProjectStatus { notStarted, inProgress, finalized }

class _HubProjectItem {
  const _HubProjectItem({
    required this.id,
    required this.name,
    required this.teamsId,
    required this.status,
    this.contextIndex = -1,
  });
  final int id;
  final String name;
  final int teamsId;
  final _ProjectStatus status;
  final int contextIndex;
}
