import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/navigation/nav.dart';
import '/index.dart';
import '/pages/team_selection/team_selection_widget.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';

class ProjectSelectionWidget extends StatefulWidget {
  const ProjectSelectionWidget({
    super.key,
    this.tokenResponse,
    this.loginResponse,
  });

  final ApiCallResponse? tokenResponse;
  final ApiCallResponse? loginResponse;

  static String routeName = 'ProjectSelection';
  static String routePath = '/projectSelection';

  @override
  State<ProjectSelectionWidget> createState() => _ProjectSelectionWidgetState();
}

class _ProjectSelectionWidgetState extends State<ProjectSelectionWidget> {
  bool _isLoading = true;
  bool _isSelecting = false;
  List<_ProjectItem> _projects = [];
  ApiCallResponse? _cachedMeResponse;

  @override
  void initState() {
    super.initState();
    _loadProjects();
  }

  Future<void> _loadProjects() async {
    try {
      final meCall = AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall;

      // Tentar usar dados do login, senão buscar /me/app com token atual
      dynamic tokenJson = widget.tokenResponse?.jsonBody;
      final authToken = currentAuthenticationToken ?? '';

      if (kDebugMode) {
        print('=== ProjectSelection._loadProjects ===');
        print('tokenJson type: ${tokenJson?.runtimeType}');
        print('tokenJson null: ${tokenJson == null}');
        print('authToken empty: ${authToken.isEmpty}');
      }

      if (tokenJson == null && authToken.isNotEmpty) {
        final meResponse = await meCall.call(bearerAuth: authToken);
        if (kDebugMode) {
          print('meResponse succeeded: ${meResponse.succeeded}');
          print('meResponse statusCode: ${meResponse.statusCode}');
        }
        if (meResponse.succeeded) {
          tokenJson = meResponse.jsonBody;
          _cachedMeResponse = meResponse;
        }
      } else if (widget.tokenResponse != null) {
        _cachedMeResponse = widget.tokenResponse;
      }

      final companyId = meCall.companyID(tokenJson);
      final userProjectIds = meCall.allProjectIds(tokenJson);

      if (kDebugMode) {
        print('companyId: $companyId');
        print('userProjectIds: $userProjectIds');
      }

      if (companyId == null || authToken.isEmpty) {
        if (kDebugMode) {
          print('Early return: companyId=$companyId, authToken empty=${authToken.isEmpty}');
        }
        return;
      }

      final response = await ProjectsGroup.getUserProjectsCall.call(
        companyId: companyId,
        token: authToken,
      );

      if (!mounted) return;

      if (kDebugMode) {
        print('projects response succeeded: ${response.succeeded}');
        print('projects response statusCode: ${response.statusCode}');
      }

      if (response.succeeded) {
        final allItems = ProjectsGroup.getUserProjectsCall.items(
          response.jsonBody,
        );
        if (kDebugMode) {
          print('allItems count: ${allItems?.length}');
        }
        if (allItems != null && userProjectIds.isNotEmpty) {
          final userIds = userProjectIds.toSet();
          // Status permitidos: 1 (Ativo) e 3 (Em andamento)
          const allowedStatuses = {1, 3};
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
              .map((item) => _ProjectItem(
                    id: castToType<int>(getJsonField(item, r'''$.id'''))!,
                    name: castToType<String>(
                            getJsonField(item, r'''$.name''')) ??
                        'Projeto',
                  ))
              .toList();
        }
      }

      if (kDebugMode) {
        print('projects loaded: ${_projects.length}');
      }
    } catch (e, stackTrace) {
      if (kDebugMode) {
        print('=== ProjectSelection._loadProjects ERROR ===');
        print('Error: $e');
        print('StackTrace: $stackTrace');
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _selectProject(_ProjectItem project) async {
    if (_isSelecting) return;
    setState(() => _isSelecting = true);

    try {
      final meCall = AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall;
      final dynamic tokenJson = _cachedMeResponse?.jsonBody ?? widget.tokenResponse?.jsonBody;
      final authToken = currentAuthenticationToken ?? '';

      // Coletar TODAS as equipes do usuário neste projeto (leader + member)
      final leaders = meCall.teamsLeader(tokenJson);
      final members = meCall.teamsMember(tokenJson);
      final teamsMap = <int, TeamItem>{};

      if (leaders != null) {
        for (final leader in leaders) {
          final teamProjectId =
              castToType<int>(getJsonField(leader, r'''$.projects_id'''));
          if (teamProjectId == project.id) {
            final teamId = castToType<int>(getJsonField(leader, r'''$.id'''));
            final teamName = castToType<String>(getJsonField(leader, r'''$.name''')) ?? 'Equipe';
            if (teamId != null) {
              teamsMap[teamId] = TeamItem(id: teamId, name: teamName);
            }
          }
        }
      }
      if (members != null) {
        for (final member in members) {
          final teamProjectId =
              castToType<int>(getJsonField(member, r'''$.projects_id'''));
          if (teamProjectId == project.id) {
            final teamId = castToType<int>(getJsonField(member, r'''$.id'''));
            final teamName = castToType<String>(getJsonField(member, r'''$.name''')) ?? 'Equipe';
            if (teamId != null && !teamsMap.containsKey(teamId)) {
              teamsMap[teamId] = TeamItem(id: teamId, name: teamName);
            }
          }
        }
      }

      final teams = teamsMap.values.toList();

      if (!mounted) return;

      if (teams.length <= 1) {
        // Apenas 1 equipe (ou nenhuma) — ir direto para PageCheckQrcode
        final teamsId = teams.isNotEmpty ? teams.first.id : null;

        SprintsStruct? sprintData;
        if (authToken.isNotEmpty) {
          final sprintResponse = await SprintsGroup.getSprintAtivaCall.call(
            projectsId: project.id,
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
                startDate: parseDateToMillis(getJsonField(s, r'''$.start_date''')),
                endDate: parseDateToMillis(getJsonField(s, r'''$.end_date''')),
                progressPercentage: castToType<double>(
                    getJsonField(s, r'''$.progress_percentage''')),
              );
            }
          }
        }

        AppState().updateUserStruct((user) {
          user.projectId = project.id;
          user.teamsId = teamsId;
          user.teamName = teams.isNotEmpty ? teams.first.name : '';
          user.sprint = sprintData ?? SprintsStruct();
          user.projectName = project.name;
        });
        AppState().update(() {});

        if (!mounted) return;

        context.pushNamedAuth(
          PageCheckQrcodeWidget.routeName,
          context.mounted,
          extra: <String, dynamic>{
            kTransitionInfoKey: TransitionInfo(
              hasTransition: true,
              transitionType: PageTransitionType.fade,
            ),
            'skipProjectCheck': true,
          },
        );
      } else {
        // Múltiplas equipes — ir para seleção de equipe
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => TeamSelectionWidget(
              projectId: project.id,
              projectName: project.name,
              teams: teams,
              tokenResponse: widget.tokenResponse,
              loginResponse: widget.loginResponse,
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSelecting = false);
      }
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
          automaticallyImplyLeading: false,
          elevation: 0.0,
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
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(),
                )
              : SingleChildScrollView(
                  child: Align(
                    alignment: AlignmentDirectional(0.0, 0.0),
                    child: Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(
                          30.0, 0.0, 32.0, 32.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
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
                                  color: const Color(0xFF105DFB)
                                      .withOpacity(0.08),
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
                                  Text(
                                    AppLocalizations.of(context)
                                        .getVariableText(
                                      ptText: 'Selecione o projeto',
                                      esText: 'Seleccione el proyecto',
                                      enText: 'Select a project',
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
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 4.0, 0.0, 16.0),
                                    child: Text(
                                      AppLocalizations.of(context)
                                          .getVariableText(
                                        ptText:
                                            'Você está vinculado a mais de um projeto. Escolha em qual deseja trabalhar.',
                                        esText:
                                            'Estás vinculado a más de un proyecto. Elige en cuál deseas trabajar.',
                                        enText:
                                            'You are linked to more than one project. Choose which one you want to work on.',
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
                                  if (_projects.isEmpty)
                                    Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          0.0, 16.0, 0.0, 0.0),
                                      child: Center(
                                        child: Text(
                                          AppLocalizations.of(context)
                                              .getVariableText(
                                            ptText:
                                                'Nenhum projeto encontrado.',
                                            esText:
                                                'No se encontraron proyectos.',
                                            enText: 'No projects found.',
                                          ),
                                          style: theme.bodyMedium.override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  theme.bodyMedium.fontWeight,
                                              fontStyle:
                                                  theme.bodyMedium.fontStyle,
                                            ),
                                            color: theme.secondaryText,
                                            letterSpacing: 0.0,
                                          ),
                                        ),
                                      ),
                                    )
                                  else
                                    ...List.generate(
                                        _projects.length, (index) {
                                      final project = _projects[index];
                                      return Padding(
                                        padding:
                                            EdgeInsetsDirectional.fromSTEB(
                                                0.0, 0.0, 0.0, 8.0),
                                        child: _buildProjectCard(
                                            project, theme),
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

  Widget _buildProjectCard(_ProjectItem project, AppTheme theme) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: _isSelecting ? null : () => _selectProject(project),
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
                    Icons.business_rounded,
                    color: theme.primary,
                    size: 22.0,
                  ),
                ),
                const SizedBox(width: 12.0),
                Expanded(
                  child: Text(
                    project.name,
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

class _ProjectItem {
  const _ProjectItem({required this.id, required this.name});
  final int id;
  final String name;
}
