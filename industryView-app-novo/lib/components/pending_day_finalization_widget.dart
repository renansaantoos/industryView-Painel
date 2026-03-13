import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/utils/upload_data.dart';
import '/database/daos/rdo_finalization_dao.dart';

// ─── Color constants (same as RDO) ───────────────────────────────────────────
const _kGreen = Color(0xFF10B981);
const _kWarningAmber = Color(0xFFF59E0B);
const _kMinPhotos = 3;

const _kAvatarColors = [
  Color(0xFF105DFB),
  Color(0xFF8B5CF6),
  Color(0xFF06B6D4),
  Color(0xFFF59E0B),
  Color(0xFF10B981),
  Color(0xFFEF4444),
];

class PendingDayFinalizationWidget extends StatefulWidget {
  const PendingDayFinalizationWidget({
    super.key,
    required this.scheduleId,
    required this.scheduleDate,
    this.projectName,
    this.teamName,
    this.workers,
    this.tasks,
  });

  final int scheduleId;
  final String scheduleDate;
  final String? projectName;
  final String? teamName;
  final List<dynamic>? workers;
  final List<dynamic>? tasks;

  @override
  State<PendingDayFinalizationWidget> createState() =>
      _PendingDayFinalizationWidgetState();
}

class _PendingDayFinalizationWidgetState
    extends State<PendingDayFinalizationWidget> {
  final List<UploadedFile> _selectedPhotos = [];
  String? _selectedShift;
  bool _isFinalizing = false;
  final TextEditingController _observationsController = TextEditingController();
  static const List<String> _shiftOptions = ['Manha', 'Tarde', 'Integral'];

  // Tasks from schedule_sprints_tasks (via pending endpoint)
  final List _concluidas = [];
  final List _semSucesso = [];
  final List _inspecao = [];
  final List _emAndamento = [];
  bool _tasksLoaded = false;

  @override
  void initState() {
    super.initState();
    _categorizeScheduleTasks();
  }

  @override
  void dispose() {
    _observationsController.dispose();
    super.dispose();
  }

  /// Categorize tasks from schedule_sprints_tasks by status
  void _categorizeScheduleTasks() {
    final tasks = widget.tasks ?? [];
    for (final task in tasks) {
      final status = (task is Map ? task['status'] : null)?.toString().toLowerCase() ?? '';
      final statusId = task is Map ? task['status_id'] : null;
      // status_id: 3=Concluída, 4=Sem Sucesso, 5=Em Inspeção, 2=Em Andamento
      if (statusId == 3 || status.contains('conclu')) {
        _concluidas.add(task);
      } else if (statusId == 4 || status.contains('sem sucesso') || status.contains('falh')) {
        _semSucesso.add(task);
      } else if (statusId == 5 || status.contains('inspe')) {
        _inspecao.add(task);
      } else if (statusId == 2 || status.contains('andamento')) {
        _emAndamento.add(task);
      } else {
        // Qualquer outro status vai para em andamento
        _emAndamento.add(task);
      }
    }
    _tasksLoaded = true;
    if (kDebugMode) {
      print('PendingFinalization: ${tasks.length} tasks do schedule - '
          'concluídas: ${_concluidas.length}, semSucesso: ${_semSucesso.length}, '
          'inspeção: ${_inspecao.length}, emAndamento: ${_emAndamento.length}');
    }
  }

  String _formatDate(String raw) {
    final parts = raw.split('-');
    if (parts.length == 3) return '${parts[2]}/${parts[1]}/${parts[0]}';
    return raw;
  }

  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[parts.length - 1][0]}'.toUpperCase();
  }

  String _maskCpf(String cpf) {
    final digits = cpf.replaceAll(RegExp(r'\D'), '');
    if (digits.length >= 11) {
      return 'CPF: ***.***.**${digits.substring(8, 9)}-${digits.substring(9, 11)}';
    }
    return 'CPF: ***';
  }

  Future<void> _pickPhotos() async {
    final theme = AppTheme.of(context);
    final selected = await selectMediaWithSourceBottomSheet(
      context: context,
      allowPhoto: true,
      allowVideo: false,
      multiImage: true,
      pickerFontFamily: 'Lexend',
      textColor: theme.primaryText,
      backgroundColor: theme.secondaryBackground,
    );
    if (selected == null || selected.isEmpty) return;
    if (!mounted) return;
    final uploadedFiles = selected
        .where((m) => validateFileFormat(m.storagePath, context))
        .map((m) => UploadedFile(
              name: m.storagePath.split('/').last,
              bytes: m.bytes,
              height: m.dimensions?.height,
              width: m.dimensions?.width,
              blurHash: m.blurHash,
              originalFilename: m.originalFilename,
            ))
        .toList();
    if (uploadedFiles.isEmpty) return;
    setState(() => _selectedPhotos.addAll(uploadedFiles));
  }

  void _removePhoto(int index) {
    setState(() => _selectedPhotos.removeAt(index));
  }

  Future<void> _handleFinalize() async {
    if (_selectedPhotos.length < _kMinPhotos) return;
    setState(() => _isFinalizing = true);
    final messenger = ScaffoldMessenger.of(context);
    final errorColor = AppTheme.of(context).error;

    try {
      final token = currentAuthenticationToken;

      for (int i = 0; i < _selectedPhotos.length; i++) {
        final photo = _selectedPhotos[i];
        if (kDebugMode) {
          print('PendingFinalization: Uploading photo ${i + 1}/${_selectedPhotos.length} '
              'name=${photo.name}, bytes=${photo.bytes?.length ?? 0}, scheduleId=${widget.scheduleId}');
        }
        final r = await ProjectsGroup.addImagensCall.call(
          content: photo,
          scheduleId: widget.scheduleId,
          token: token,
        );
        if (!r.succeeded) {
          if (mounted) {
            messenger.showSnackBar(SnackBar(
              content: Text('Erro ao enviar foto ${i + 1}. Status: ${r.statusCode}'),
              backgroundColor: errorColor,
            ));
          }
          return;
        }
      }

      final createResult = await DailyReportsGroup.createDailyReportCall.call(
        projectsId: AppState().user.projectId,
        rdoDate: widget.scheduleDate,
        shift: (_selectedShift ?? 'Integral').toLowerCase(),
        weatherMorning: '',
        weatherAfternoon: '',
        weatherNight: '',
        temperatureMin: 0.0,
        temperatureMax: 0.0,
        safetyTopic: '',
        generalObservations: _observationsController.text,
        scheduleId: [widget.scheduleId],
        token: token,
      );

      if (kDebugMode) {
        print('PendingFinalization: createDailyReport - succeeded=${createResult.succeeded}, '
            'statusCode=${createResult.statusCode}, body=${createResult.jsonBody}');
      }

      if (!createResult.succeeded) {
        if (mounted) {
          messenger.showSnackBar(SnackBar(
            content: Text('Erro ao criar relatorio. Status: ${createResult.statusCode}'),
            backgroundColor: errorColor,
          ));
        }
        return;
      }

      final reportId =
          DailyReportsGroup.createDailyReportCall.id(createResult.jsonBody);

      if (reportId != null) {
        // ── Enviar mão de obra (workforce) agrupada por cargo ──
        final workers = widget.workers ?? [];
        if (workers.isNotEmpty) {
          // Agrupar workers por cargo
          final Map<String, int> cargoCount = {};
          for (final w in workers) {
            final cargo = w['cargo']?.toString() ?? 'Geral';
            cargoCount[cargo] = (cargoCount[cargo] ?? 0) + 1;
          }
          for (final entry in cargoCount.entries) {
            try {
              await DailyReportsGroup.addDailyReportWorkforceCall.call(
                id: reportId,
                roleCategory: entry.key,
                quantityPlanned: entry.value,
                quantityPresent: entry.value,
                quantityAbsent: 0,
                absenceReason: '',
                token: token,
              );
              if (kDebugMode) {
                print('PendingFinalization: workforce added - ${entry.key}: ${entry.value}');
              }
            } catch (e) {
              if (kDebugMode) print('PendingFinalization: erro ao enviar workforce ${entry.key}: $e');
            }
          }
        }

        // ── Enviar atividades (tarefas concluídas) ──
        if (_concluidas.isNotEmpty) {
          for (final task in _concluidas) {
            try {
              final description = (task is Map ? task['description'] : null)?.toString() ??
                  getJsonField(task, r'''$.projects_backlogs.description''')?.toString() ??
                  getJsonField(task, r'''$.projects_backlogs.tasks_template.description''')?.toString() ??
                  getJsonField(task, r'''$.title''')?.toString() ??
                  'Tarefa concluída';
              final backlogId = task is Map ? task['projects_backlogs_id'] : null;
              final teamsId = task is Map ? task['teams_id'] : null;

              await DailyReportsGroup.addDailyReportActivityCall.call(
                id: reportId,
                description: description,
                projectsBacklogsId: backlogId is int ? backlogId : (int.tryParse(backlogId?.toString() ?? '')),
                quantityDone: 1.0,
                unityId: null,
                teamsId: teamsId is int ? teamsId : (int.tryParse(teamsId?.toString() ?? '')),
                locationDescription: '',
                token: token,
              );
              if (kDebugMode) {
                print('PendingFinalization: activity added - $description');
              }
            } catch (e) {
              if (kDebugMode) print('PendingFinalization: erro ao enviar atividade: $e');
            }
          }
        }

        // ── Finalizar RDO (DEPOIS de workforce e activities) ──
        await DailyReportsGroup.finalizeDailyReportCall.call(
          id: reportId,
          token: token,
        );
      }

      if (AppState().taskslist.isNotEmpty) {
        final localTasksList = AppState()
            .taskslist
            .map((t) => {
                  'sprints_tasks_id': t.sprintsTasksId,
                  'sprints_tasks_statuses_id': t.sprintsTasksStatusesId,
                })
            .toList();
        await SprintsGroup.atualizaStatusDaSprintTaskCall.call(
          scheduleId: widget.scheduleId,
          tasksListJson: localTasksList,
          token: token,
        );
      }

      await RdoFinalizationDao().markAsFinalizedToday();
      AppState().markActiveProjectRdoFinalized();
      AppState().signalTasksRefresh();

      if (mounted) {
        messenger.showSnackBar(const SnackBar(
          content: Text('Dia anterior finalizado com sucesso!'),
          backgroundColor: _kGreen,
        ));
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (kDebugMode) print('PendingDayFinalization: Erro ao finalizar: $e');
      if (mounted) {
        messenger.showSnackBar(SnackBar(
          content: const Text('Ocorreu um erro inesperado. Tente novamente.'),
          backgroundColor: errorColor,
        ));
      }
    } finally {
      if (mounted) setState(() => _isFinalizing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
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
                    children: [
                      GestureDetector(
                        onTap: () {
                          // Pop do modal e sinalizar que quer voltar para projetos
                          Navigator.of(context, rootNavigator: true).pop('back_to_projects');
                        },
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: _kWarningAmber.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.warning_amber_rounded, color: _kWarningAmber, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Finalizar dia pendente',
                              style: GoogleFonts.lexend(
                                fontSize: 15,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            Text(
                              _formatDate(widget.scheduleDate),
                              style: GoogleFonts.lexend(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: _kWarningAmber,
                              ),
                            ),
                          ],
                        ),
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
          child: _isFinalizing ? _buildLoadingOverlay() : _buildContent(),
        ),
      ),
    );
  }

  Widget _buildLoadingOverlay() {
    final theme = AppTheme.of(context);
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 48,
            height: 48,
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(theme.primary),
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Finalizando dia anterior...',
            style: theme.titleSmall.override(
              font: GoogleFonts.lexend(),
              letterSpacing: 0,
              color: theme.secondaryText,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Enviando fotos e criando relatorio',
            style: theme.labelSmall.override(
              font: GoogleFonts.lexend(),
              letterSpacing: 0,
              color: theme.secondaryText,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    final theme = AppTheme.of(context);
    return Column(
      children: [
        // Warning banner
        _buildWarningBanner(theme),
        // Scrollable content
        Expanded(
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Info card
                _buildInfoCard(theme),
                const SizedBox(height: 24),

                // Tarefas Realizadas (Concluídas)
                if (_concluidas.isNotEmpty) ...[
                  _buildSectionHeader(theme, 'Tarefas Realizadas', Icons.task_alt_rounded, badge: _concluidas.length, badgeColor: _kGreen),
                  const SizedBox(height: 10),
                  _buildTaskListCard(theme, _concluidas, _kGreen, Icons.check_rounded),
                  const SizedBox(height: 24),
                ],

                // Tarefas em Inspeção
                if (_inspecao.isNotEmpty) ...[
                  _buildSectionHeader(theme, 'Em Inspeção', Icons.search_rounded, badge: _inspecao.length, badgeColor: const Color(0xFF8B5CF6)),
                  const SizedBox(height: 10),
                  _buildTaskListCard(theme, _inspecao, const Color(0xFF8B5CF6), Icons.search_rounded),
                  const SizedBox(height: 24),
                ],

                // Sem Sucesso
                if (_semSucesso.isNotEmpty) ...[
                  _buildSectionHeader(theme, 'Sem Sucesso', Icons.error_outline_rounded, badge: _semSucesso.length, badgeColor: theme.error),
                  const SizedBox(height: 10),
                  _buildTaskListCard(theme, _semSucesso, theme.error, Icons.close_rounded),
                  const SizedBox(height: 24),
                ],

                // Em Andamento
                if (_emAndamento.isNotEmpty) ...[
                  _buildSectionHeader(theme, 'Em Andamento', Icons.play_circle_outline_rounded, badge: _emAndamento.length, badgeColor: const Color(0xFF3B82F6)),
                  const SizedBox(height: 10),
                  _buildTaskListCard(theme, _emAndamento, const Color(0xFF3B82F6), Icons.play_arrow_rounded),
                  const SizedBox(height: 24),
                ],

                // Loading tasks indicator
                if (!_tasksLoaded) ...[
                  _buildSectionHeader(theme, 'Tarefas', Icons.task_alt_rounded),
                  const SizedBox(height: 10),
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: SizedBox(
                        width: 24, height: 24,
                        child: CircularProgressIndicator(strokeWidth: 2, color: theme.primary),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // No tasks message
                if (_tasksLoaded && _concluidas.isEmpty && _inspecao.isEmpty && _semSucesso.isEmpty && _emAndamento.isEmpty) ...[
                  _buildSectionHeader(theme, 'Tarefas', Icons.task_alt_rounded, badge: 0),
                  const SizedBox(height: 10),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: theme.secondaryBackground,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: theme.alternate),
                    ),
                    child: Column(
                      children: [
                        Icon(Icons.inbox_rounded, size: 32, color: theme.secondaryText.withValues(alpha: 0.5)),
                        const SizedBox(height: 8),
                        Text('Nenhuma tarefa registrada neste dia',
                          style: theme.labelMedium.override(font: GoogleFonts.lexend(), letterSpacing: 0, color: theme.secondaryText),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],

                // Workers
                _buildSectionHeader(theme, 'Funcionários do Dia', Icons.people_rounded, badge: (widget.workers ?? []).length),
                const SizedBox(height: 10),
                _buildWorkersCard(theme),
                const SizedBox(height: 24),

                // Photos
                _buildSectionHeader(
                  theme, 'Fotos da Obra', Icons.camera_alt_rounded,
                  badge: _selectedPhotos.length,
                  badgeColor: _selectedPhotos.length >= _kMinPhotos ? _kGreen : theme.error,
                ),
                const SizedBox(height: 10),
                _buildPhotosCard(theme),
                const SizedBox(height: 24),

                // Shift
                _buildShiftDropdown(theme),
                const SizedBox(height: 16),

                // Observations
                _buildObservationsField(theme),
                const SizedBox(height: 28),

                // Finalize button
                _buildFinalizeButton(theme),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ─── Warning banner ────────────────────────────────────────────────────────
  Widget _buildWarningBanner(AppTheme theme) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFD97706), _kWarningAmber],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: const BoxDecoration(
              color: Colors.white24,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.info_outline_rounded, color: Colors.white, size: 14),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              'Finalize este dia para poder iniciar uma nova jornada',
              style: GoogleFonts.lexend(
                fontWeight: FontWeight.w600,
                color: Colors.white,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Info card ─────────────────────────────────────────────────────────────
  Widget _buildInfoCard(AppTheme theme) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: theme.secondaryBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.alternate),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.projectName != null && widget.projectName!.isNotEmpty)
            _buildInfoRow(theme, icon: Icons.business_rounded, label: 'Projeto', value: widget.projectName!),
          if (widget.teamName != null && widget.teamName!.isNotEmpty) ...[
            const SizedBox(height: 10),
            _buildInfoRow(theme, icon: Icons.groups_rounded, label: 'Equipe', value: widget.teamName!),
          ],
          const SizedBox(height: 10),
          _buildInfoRow(theme, icon: Icons.calendar_today_rounded, label: 'Data', value: _formatDate(widget.scheduleDate)),
        ],
      ),
    );
  }

  Widget _buildInfoRow(AppTheme theme, {required IconData icon, required String label, required String value}) {
    return Row(
      children: [
        Icon(icon, size: 16, color: theme.primary),
        const SizedBox(width: 8),
        Text('$label: ', style: theme.labelSmall.override(font: GoogleFonts.lexend(fontWeight: FontWeight.w600), letterSpacing: 0, color: theme.secondaryText)),
        Expanded(
          child: Text(value, style: theme.labelSmall.override(font: GoogleFonts.lexend(fontWeight: FontWeight.w500), letterSpacing: 0, color: theme.primaryText), overflow: TextOverflow.ellipsis),
        ),
      ],
    );
  }

  // ─── Section header (same as RDO) ─────────────────────────────────────────
  Widget _buildSectionHeader(AppTheme theme, String title, IconData icon, {int? badge, Color? badgeColor}) {
    return Row(
      children: [
        Container(
          width: 32, height: 32,
          decoration: BoxDecoration(color: theme.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, color: theme.primary, size: 18),
        ),
        const SizedBox(width: 10),
        Text(title, style: theme.bodyMedium.override(font: GoogleFonts.lexend(fontWeight: FontWeight.w700), letterSpacing: 0, color: theme.primaryText)),
        if (badge != null) ...[
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: (badgeColor ?? theme.primary).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text('$badge', style: GoogleFonts.lexend(fontSize: 12, fontWeight: FontWeight.w700, color: badgeColor ?? theme.primary)),
          ),
        ],
      ],
    );
  }

  // ─── Task list card (same visual as RDO _buildTasksCard) ──────────────────
  Widget _buildTaskListCard(AppTheme theme, List tasks, Color color, IconData icon) {
    return Container(
      decoration: BoxDecoration(
        color: theme.secondaryBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.alternate),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: EdgeInsets.zero,
          itemCount: tasks.length,
          separatorBuilder: (_, __) => Divider(height: 1, indent: 56, endIndent: 16, color: theme.alternate),
          itemBuilder: (context, i) {
            final task = tasks[i];
            final title = (task is Map ? task['description'] : null)?.toString() ??
                (getJsonField(task, r'''$.projects_backlogs.description''') ??
                    getJsonField(task, r'''$.projects_backlogs.tasks_template.description''') ??
                    getJsonField(task, r'''$.title'''))
                    ?.toString() ??
                'Tarefa ${i + 1}';
            final team = (task is Map ? task['team_name'] : null)?.toString() ??
                getJsonField(task, r'''$.teams.name''')?.toString() ?? '';
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  Container(
                    width: 28, height: 28,
                    decoration: BoxDecoration(color: color.withValues(alpha: 0.12), shape: BoxShape.circle),
                    child: Icon(icon, color: color, size: 16),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title,
                          style: theme.bodyMedium.override(font: GoogleFonts.lexend(fontWeight: FontWeight.w600), color: theme.primaryText, letterSpacing: 0.0),
                          maxLines: 2, overflow: TextOverflow.ellipsis,
                        ),
                        if (team.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Row(children: [
                            Icon(Icons.group_outlined, size: 11, color: theme.secondaryText),
                            const SizedBox(width: 3),
                            Text(team, style: theme.labelSmall.override(font: GoogleFonts.lexend(), color: theme.secondaryText, letterSpacing: 0.0)),
                          ]),
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

  // ─── Workers card (same visual as RDO _buildWorkersCard) ──────────────────
  Widget _buildWorkersCard(AppTheme theme) {
    final workers = widget.workers ?? [];
    if (workers.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: theme.secondaryBackground,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: theme.alternate),
        ),
        child: Column(
          children: [
            Icon(Icons.people_outline_rounded, size: 32, color: theme.secondaryText.withValues(alpha: 0.5)),
            const SizedBox(height: 8),
            Text('Nenhum funcionário na escala', style: theme.labelMedium.override(font: GoogleFonts.lexend(), letterSpacing: 0, color: theme.secondaryText)),
          ],
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: theme.secondaryBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.alternate),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: EdgeInsets.zero,
          itemCount: workers.length,
          separatorBuilder: (_, __) => Divider(height: 1, indent: 64, endIndent: 16, color: theme.alternate),
          itemBuilder: (context, i) {
            final w = workers[i];
            final name = w['name']?.toString() ?? 'Funcionário ${i + 1}';
            final cargo = w['cargo']?.toString() ?? '';
            final cpf = w['cpf']?.toString() ?? '';
            final avatarColor = _kAvatarColors[i % _kAvatarColors.length];
            final initials = _getInitials(name);

            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  // Avatar circular colorido (padrão RDO/escala)
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: avatarColor.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: avatarColor.withValues(alpha: 0.3), width: 1.5),
                    ),
                    child: Center(
                      child: Text(
                        initials,
                        style: GoogleFonts.lexend(fontSize: 14, fontWeight: FontWeight.w700, color: avatarColor),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name,
                          style: theme.bodyMedium.override(font: GoogleFonts.lexend(fontWeight: FontWeight.w600), color: theme.primaryText, letterSpacing: 0.0),
                          maxLines: 1, overflow: TextOverflow.ellipsis,
                        ),
                        if (cargo.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(cargo, style: theme.labelSmall.override(font: GoogleFonts.lexend(), color: theme.secondaryText, letterSpacing: 0.0)),
                        ],
                        if (cpf.isNotEmpty) ...[
                          const SizedBox(height: 1),
                          Text(_maskCpf(cpf),
                            style: theme.labelSmall.override(font: GoogleFonts.lexend(), color: theme.secondaryText.withValues(alpha: 0.6), letterSpacing: 0.0, fontSize: 10),
                          ),
                        ],
                      ],
                    ),
                  ),
                  Icon(Icons.check_circle_rounded, color: _kGreen.withValues(alpha: 0.7), size: 16),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  // ─── Photos card (same as RDO) ────────────────────────────────────────────
  Widget _buildPhotosCard(AppTheme theme) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: theme.secondaryBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.alternate),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Mínimo $_kMinPhotos fotos',
                style: theme.labelSmall.override(font: GoogleFonts.lexend(), letterSpacing: 0, color: theme.secondaryText),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: _selectedPhotos.length >= _kMinPhotos ? _kGreen.withValues(alpha: 0.12) : theme.error.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('${_selectedPhotos.length}/$_kMinPhotos',
                  style: GoogleFonts.lexend(fontSize: 12, fontWeight: FontWeight.w700, color: _selectedPhotos.length >= _kMinPhotos ? _kGreen : theme.error),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              for (int i = 0; i < _selectedPhotos.length; i++) _buildPhotoThumb(theme, i),
              _buildAddPhotoButton(theme),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPhotoThumb(AppTheme theme, int index) {
    final bytes = _selectedPhotos[index].bytes;
    return Stack(
      children: [
        Container(
          width: 90, height: 90,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: theme.alternate),
            image: bytes != null ? DecorationImage(image: MemoryImage(bytes), fit: BoxFit.cover) : null,
            color: bytes == null ? theme.alternate : null,
          ),
        ),
        Positioned(
          top: 4, right: 4,
          child: GestureDetector(
            onTap: () => _removePhoto(index),
            child: Container(
              width: 22, height: 22,
              decoration: BoxDecoration(color: theme.error, shape: BoxShape.circle),
              child: const Icon(Icons.close, color: Colors.white, size: 14),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAddPhotoButton(AppTheme theme) {
    return GestureDetector(
      onTap: _pickPhotos,
      child: Container(
        width: 90, height: 90,
        decoration: BoxDecoration(
          color: theme.primary.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: theme.primary.withValues(alpha: 0.4), width: 1.5),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.add_photo_alternate_outlined, color: theme.primary, size: 28),
            const SizedBox(height: 4),
            Text('Adicionar', style: GoogleFonts.lexend(fontSize: 10, color: theme.primary, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  // ─── Shift dropdown ────────────────────────────────────────────────────────
  Widget _buildShiftDropdown(AppTheme theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(theme, 'Turno (opcional)', Icons.schedule_rounded),
        const SizedBox(height: 10),
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: theme.secondaryBackground,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: theme.alternate),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 14),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              isExpanded: true,
              value: _selectedShift,
              hint: Text('Selecionar turno', style: theme.bodySmall.override(font: GoogleFonts.lexend(), letterSpacing: 0, color: theme.secondaryText)),
              dropdownColor: theme.secondaryBackground,
              items: _shiftOptions.map((shift) => DropdownMenuItem<String>(
                value: shift,
                child: Text(shift, style: theme.bodySmall.override(font: GoogleFonts.lexend(), letterSpacing: 0, color: theme.primaryText)),
              )).toList(),
              onChanged: (value) => setState(() => _selectedShift = value),
            ),
          ),
        ),
      ],
    );
  }

  // ─── Observations ──────────────────────────────────────────────────────────
  Widget _buildObservationsField(AppTheme theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(theme, 'Observações (opcional)', Icons.notes_rounded),
        const SizedBox(height: 10),
        TextFormField(
          controller: _observationsController,
          maxLines: 4,
          style: theme.bodySmall.override(font: GoogleFonts.lexend(), letterSpacing: 0, color: theme.primaryText),
          decoration: InputDecoration(
            hintText: 'Descreva o que aconteceu neste dia...',
            hintStyle: theme.bodySmall.override(font: GoogleFonts.lexend(), letterSpacing: 0, color: theme.secondaryText),
            filled: true,
            fillColor: theme.secondaryBackground,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: theme.alternate)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: theme.alternate)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: theme.primary, width: 1.5)),
            contentPadding: const EdgeInsets.all(14),
          ),
        ),
      ],
    );
  }

  // ─── Finalize button (same style as RDO) ──────────────────────────────────
  Widget _buildFinalizeButton(AppTheme theme) {
    final canFinalize = _selectedPhotos.length >= _kMinPhotos;
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton.icon(
        onPressed: canFinalize ? _handleFinalize : null,
        icon: Icon(
          canFinalize ? Icons.check_circle_rounded : Icons.camera_alt_rounded,
          color: Colors.white,
          size: 20,
        ),
        label: Text(
          canFinalize ? 'Finalizar dia ${_formatDate(widget.scheduleDate)}' : 'Adicione ${_kMinPhotos - _selectedPhotos.length} foto${(_kMinPhotos - _selectedPhotos.length) > 1 ? 's' : ''} para continuar',
          style: GoogleFonts.lexend(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: canFinalize ? _kGreen : theme.secondaryText.withValues(alpha: 0.4),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          elevation: canFinalize ? 2 : 0,
        ),
      ),
    );
  }
}
