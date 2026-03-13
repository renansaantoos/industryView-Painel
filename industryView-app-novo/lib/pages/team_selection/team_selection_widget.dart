import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/pending_day_finalization_widget.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/navigation/nav.dart';
import '/index.dart';
import '/pages/project_selection/project_selection_widget.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';

class TeamSelectionWidget extends StatefulWidget {
  const TeamSelectionWidget({
    super.key,
    required this.projectId,
    required this.projectName,
    required this.teams,
    this.tokenResponse,
    this.loginResponse,
  });

  final int projectId;
  final String projectName;
  final List<TeamItem> teams;
  final ApiCallResponse? tokenResponse;
  final ApiCallResponse? loginResponse;

  static String routeName = 'TeamSelection';
  static String routePath = '/teamSelection';

  @override
  State<TeamSelectionWidget> createState() => _TeamSelectionWidgetState();
}

class _TeamSelectionWidgetState extends State<TeamSelectionWidget> {
  bool _isSelecting = false;

  Future<void> _selectTeam(TeamItem team) async {
    if (_isSelecting) return;
    setState(() => _isSelecting = true);

    try {
      final authToken = currentAuthenticationToken;

      // Buscar sprint ativa para o projeto selecionado
      SprintsStruct? sprintData;
      if (authToken != null && authToken.isNotEmpty) {
        final sprintResponse = await SprintsGroup.getSprintAtivaCall.call(
          projectsId: widget.projectId,
          token: authToken,
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
              endDate:
                  parseDateToMillis(getJsonField(s, r'''$.end_date''')),
              progressPercentage: castToType<double>(
                  getJsonField(s, r'''$.progress_percentage''')),
            );
          }
        }
      }

      // Atualizar AppState com projeto e equipe selecionados
      AppState().updateUserStruct((user) {
        user.projectId = widget.projectId;
        user.teamsId = team.id;
        user.teamName = team.name;
        user.sprint = sprintData ?? SprintsStruct();
        user.projectName = widget.projectName;
      });
      AppState().update(() {});

      if (!mounted) return;

      // Verificar se há RDO pendente para este projeto+equipe
      final navigatedToPending = await _checkAndNavigatePendingRdo(
        projectId: widget.projectId,
        teamsId: team.id,
      );

      if (navigatedToPending || !mounted) return;

      // Sem RDO pendente — ir para QR code
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
    } finally {
      if (mounted) {
        setState(() => _isSelecting = false);
      }
    }
  }

  /// Verifica se há RDO pendente para o projeto+equipe selecionados.
  /// Se houver, navega direto para a tela de finalização e retorna true.
  Future<bool> _checkAndNavigatePendingRdo({
    required int projectId,
    required int teamsId,
  }) async {
    try {
      final token = currentAuthenticationToken;
      if (token == null || token.isEmpty) return false;

      final pendingResp = await ProjectsGroup.getPendingSchedulesCall
          .call(token: token);

      if (!pendingResp.succeeded) return false;

      final hasPend = ProjectsGroup.getPendingSchedulesCall
          .hasPending(pendingResp.jsonBody) ?? false;
      if (!hasPend) return false;

      final pendList = ProjectsGroup.getPendingSchedulesCall
          .pendingSchedules(pendingResp.jsonBody);
      if (pendList == null || pendList.isEmpty) return false;

      // Filtrar por projeto+equipe selecionados
      final match = pendList.cast<Map<String, dynamic>>().where((p) {
        final pId = p['projects_id'] as int?;
        final tId = p['teams_id'] as int?;
        return pId == projectId && tId == teamsId;
      }).toList();

      if (match.isEmpty) return false;

      final fp = match.first;
      if (kDebugMode) {
        print('=== PENDING RDO FOUND for project=$projectId team=$teamsId ===');
        print('scheduleId: ${fp['schedule_id']}, date: ${fp['schedule_date']}');
      }

      if (!mounted) return false;

      final result = await Navigator.push<dynamic>(
        context,
        MaterialPageRoute(
          fullscreenDialog: true,
          builder: (_) => PendingDayFinalizationWidget(
            scheduleId: (fp['schedule_id'] as int?) ?? 0,
            scheduleDate: fp['schedule_date']?.toString() ?? '',
            projectName: fp['project_name']?.toString(),
            teamName: fp['team_name']?.toString(),
            workers: fp['workers'] as List<dynamic>?,
            tasks: fp['tasks'] as List<dynamic>?,
          ),
        ),
      );

      if (!mounted) return true;

      if (result == 'back_to_projects') {
        // Voltar para seleção de projetos
        context.goNamedAuth(
          ProjectSelectionWidget.routeName,
          context.mounted,
          extra: <String, dynamic>{
            kTransitionInfoKey: const TransitionInfo(
              hasTransition: true,
              transitionType: PageTransitionType.fade,
            ),
          },
        );
        return true;
      }

      // Após finalizar RDO, ir para QR code
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
      return true;
    } catch (e) {
      if (kDebugMode) print('=== PENDING CHECK ERROR: $e ===');
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = AppTheme.of(context);

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFECF5FF), Color(0xFFFAFAFA)],
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0.0,
          leading: IconButton(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.arrow_back_ios_rounded),
            color: const Color(0xFF2B5EA7),
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: IconButton(
                onPressed: () async {
                  await authManager.signOut();
                  AppState().user = UserLoginStruct();
                  if (!context.mounted) return;
                  context.goNamed(LoginWidget.routeName);
                },
                icon: const Icon(Icons.logout_rounded),
                color: const Color(0xFF2B5EA7),
                tooltip: AppLocalizations.of(context).getVariableText(
                  ptText: 'Sair',
                  esText: 'Salir',
                  enText: 'Logout',
                ),
              ),
            ),
          ],
        ),
        body: SafeArea(
          top: true,
          child: SingleChildScrollView(
            child: Align(
              alignment: const AlignmentDirectional(0.0, 0.0),
              child: Padding(
                padding:
                    const EdgeInsetsDirectional.fromSTEB(30.0, 0.0, 32.0, 32.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Padding(
                      padding: const EdgeInsetsDirectional.fromSTEB(
                          0.0, 0.0, 0.0, 24.0),
                      child: Text(
                        'IndustryView',
                        style: theme.displayMedium.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FontWeight.w800,
                            fontStyle: theme.displayMedium.fontStyle,
                          ),
                          color: const Color(0xFF2B5EA7),
                          fontSize: 32.0,
                          letterSpacing: -0.5,
                          fontWeight: FontWeight.w800,
                          fontStyle: theme.displayMedium.fontStyle,
                        ),
                      ),
                    ),
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: theme.secondaryBackground,
                        borderRadius: BorderRadius.circular(24.0),
                        boxShadow: [
                          BoxShadow(
                            color:
                                const Color(0xFF105DFB).withOpacity(0.08),
                            blurRadius: 24,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Projeto badge
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFF2B5EA7)
                                    .withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.business_rounded,
                                      size: 14,
                                      color: Color(0xFF2B5EA7)),
                                  const SizedBox(width: 6),
                                  Text(
                                    widget.projectName,
                                    style: theme.labelSmall.override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FontWeight.w600,
                                        fontStyle:
                                            theme.labelSmall.fontStyle,
                                      ),
                                      color: const Color(0xFF2B5EA7),
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              AppLocalizations.of(context).getVariableText(
                                ptText: 'Selecione a equipe',
                                esText: 'Seleccione el equipo',
                                enText: 'Select a team',
                              ),
                              style: theme.headlineMedium.override(
                                font: GoogleFonts.lexend(
                                  fontWeight: FontWeight.w500,
                                  fontStyle:
                                      theme.headlineMedium.fontStyle,
                                ),
                                letterSpacing: 0.0,
                                fontWeight: FontWeight.w500,
                                fontStyle:
                                    theme.headlineMedium.fontStyle,
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsetsDirectional.fromSTEB(
                                  0.0, 4.0, 0.0, 16.0),
                              child: Text(
                                AppLocalizations.of(context)
                                    .getVariableText(
                                  ptText:
                                      'Você está vinculado a mais de uma equipe neste projeto. Escolha em qual deseja trabalhar.',
                                  esText:
                                      'Estás vinculado a más de un equipo en este proyecto. Elige en cuál deseas trabajar.',
                                  enText:
                                      'You are linked to more than one team in this project. Choose which one you want to work on.',
                                ),
                                style: theme.labelSmall.override(
                                  font: GoogleFonts.lexend(
                                    fontWeight:
                                        theme.labelSmall.fontWeight,
                                    fontStyle:
                                        theme.labelSmall.fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight:
                                      theme.labelSmall.fontWeight,
                                  fontStyle:
                                      theme.labelSmall.fontStyle,
                                ),
                              ),
                            ),
                            ...List.generate(
                                widget.teams.length, (index) {
                              final team = widget.teams[index];
                              return Padding(
                                padding:
                                    const EdgeInsetsDirectional.fromSTEB(
                                        0.0, 0.0, 0.0, 8.0),
                                child:
                                    _buildTeamCard(team, theme),
                              );
                            }),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTeamCard(TeamItem team, AppTheme theme) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: _isSelecting ? null : () => _selectTeam(team),
        borderRadius: BorderRadius.circular(16.0),
        splashColor: theme.primary.withOpacity(0.08),
        child: Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: theme.secondaryBackground,
            borderRadius: BorderRadius.circular(16.0),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Container(
                  width: 40.0,
                  height: 40.0,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFFECF5FF), Color(0xFFD6EBFF)],
                    ),
                    borderRadius: BorderRadius.circular(14.0),
                  ),
                  child: Icon(
                    Icons.groups_rounded,
                    color: theme.primary,
                    size: 22.0,
                  ),
                ),
                const SizedBox(width: 12.0),
                Expanded(
                  child: Text(
                    team.name,
                    style: theme.bodyMedium.override(
                      font: GoogleFonts.lexend(
                        fontWeight: FontWeight.w500,
                        fontStyle: theme.bodyMedium.fontStyle,
                      ),
                      fontSize: 14.0,
                      letterSpacing: 0.0,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
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
    ).animate().fadeIn(duration: 300.ms).slideX(begin: 0.05);
  }
}

class TeamItem {
  const TeamItem({required this.id, required this.name});
  final int id;
  final String name;
}
