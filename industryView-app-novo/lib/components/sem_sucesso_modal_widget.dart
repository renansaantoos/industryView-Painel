import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import 'package:flutter/foundation.dart';
import '/core/widgets/app_button.dart';
import '/core/widgets/app_icon_button.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'sem_sucesso_modal_model.dart';
export 'sem_sucesso_modal_model.dart';

class SemSucessoModalWidget extends StatefulWidget {
  const SemSucessoModalWidget({
    super.key,
    required this.items,
    this.action,
  });

  /// Lista de itens JSON (1 item = per-card, N itens = batch)
  final List<dynamic> items;

  /// Callback de refresh após confirmar
  final Future Function()? action;

  @override
  State<SemSucessoModalWidget> createState() => _SemSucessoModalWidgetState();
}

class _SemSucessoModalWidgetState extends State<SemSucessoModalWidget> {
  late SemSucessoModalModel _model;

  bool get _isBatch => widget.items.length > 1;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => SemSucessoModalModel());

    if (_isBatch) {
      _model.initBatchControllers(widget.items.length);
    }

    _loadReasons();
  }

  Future<void> _loadReasons() async {
    _model.nonExecutionReasonsResponse =
        await SprintsGroup.getNonExecutionReasonsCall.call(
      token: currentAuthenticationToken,
    );
    if (mounted) safeSetState(() {});
  }

  @override
  void dispose() {
    _model.maybeDispose();
    super.dispose();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  String _taskName(dynamic item) {
    final subtaskDesc =
        getJsonField(item, r'$.subtasks.description')?.toString();
    if (subtaskDesc != null && subtaskDesc.trim().isNotEmpty) {
      return subtaskDesc.trim();
    }
    final backlogDesc =
        getJsonField(item, r'$.projects_backlogs.description')?.toString();
    if (backlogDesc != null && backlogDesc.trim().isNotEmpty) {
      return backlogDesc.trim();
    }
    final templateDesc = getJsonField(
            item, r'$.projects_backlogs.tasks_template.description')
        ?.toString();
    if (templateDesc != null && templateDesc.trim().isNotEmpty) {
      return templateDesc.trim();
    }
    final id = getJsonField(item, r'$.id')?.toString() ?? '';
    return 'Tarefa #$id';
  }

  // ---------------------------------------------------------------------------
  // Confirm logic
  // ---------------------------------------------------------------------------

  Future<void> _onConfirm() async {
    // Validar motivos
    if (_isBatch) {
      bool anyError = false;
      for (int i = 0; i < widget.items.length; i++) {
        final id = _model.batchReasonIds[i];
        if (id == null || id.isEmpty) {
          _model.batchShowReasonError[i] = true;
          anyError = true;
        }
      }
      if (anyError) {
        safeSetState(() {});
        return;
      }
    } else {
      if (_model.selectedReasonId == null) {
        safeSetState(() => _model.showReasonError = true);
        return;
      }
    }

    safeSetState(() {
      _model.isLoading = true;
      _model.showReasonError = false;
    });

    // Montar taskslist com status "sem sucesso" (status 4)
    final tasksList = widget.items.map((item) {
      final taskId = getJsonField(item, r'$.id');
      return {
        'sprints_tasks_id': taskId,
        'sprints_tasks_statuses_id': 4,
      };
    }).toList();

    // Chamar API batch de atualização de status
    _model.updateStatusResponse =
        await SprintsGroup.atualizaStatusDaSprintTaskCall.call(
      scheduleId: AppState().user.sheduleId,
      tasksListJson: tasksList,
      token: currentAuthenticationToken,
    );

    // Vincular tarefas ao schedule do dia
    try {
      final scheduleId = AppState().user.sheduleId;
      if (scheduleId != 0) {
        final taskIds = widget.items
            .map((e) => castToType<int>(getJsonField(e, r'$.id')))
            .whereType<int>()
            .toList();
        if (taskIds.isNotEmpty) {
          await ProjectsGroup.linkTasksToScheduleCall.call(
            token: currentAuthenticationToken,
            scheduleId: scheduleId,
            sprintsTasksIds: taskIds,
          );
          if (kDebugMode) print('Tasks $taskIds linked to schedule $scheduleId');
        }
      }
    } catch (e) {
      if (kDebugMode) print('Error linking tasks to schedule: $e');
    }

    if (!(_model.updateStatusResponse?.succeeded ?? true)) {
      safeSetState(() => _model.isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Erro ao atualizar status. Tente novamente.'),
            backgroundColor: AppTheme.of(context).error,
          ),
        );
      }
      return;
    }

    // Mascarar tarefas se resposta veio do offline wrapper
    if (getJsonField(
            _model.updateStatusResponse?.jsonBody, r'''$.offline''') ==
        true) {
      final ids = widget.items
          .map((e) => castToType<int>(getJsonField(e, r'$.id')))
          .whereType<int>()
          .toList();
      if (ids.isNotEmpty) {
        AppState().update(() {
          final current = AppState().offlineMaskedTasksIds.toList();
          for (final id in ids) {
            if (!current.contains(id)) current.add(id);
          }
          AppState().offlineMaskedTasksIds = current;
        });
      }
    }

    // Salvar motivo e observações por tarefa
    for (int i = 0; i < widget.items.length; i++) {
      final item = widget.items[i];
      final taskId = castToType<int>(getJsonField(item, r'$.id')) ?? 0;
      if (taskId <= 0) continue;

      final String? reasonId;
      final String? reasonName;
      final String obs;

      if (_isBatch) {
        reasonId = _model.batchReasonIds[i];
        reasonName = _model.batchReasonNames[i];
        obs = _model.batchObsControllers[i]?.text.trim() ?? '';
      } else {
        reasonId = _model.selectedReasonId;
        reasonName = _model.selectedReasonName;
        obs = _model.observationsController?.text.trim() ?? '';
      }

      await SprintsGroup.editSprintTaskCall.call(
        taskId: taskId,
        nonExecutionReasonId: int.tryParse(reasonId ?? ''),
        nonExecutionObservations: obs.isNotEmpty ? obs : null,
        token: currentAuthenticationToken,
      );

      // Manter comentário para histórico
      if (obs.isNotEmpty || reasonName != null) {
        final commentText = reasonName != null
            ? 'Motivo: $reasonName.${obs.isNotEmpty ? ' $obs' : ''}'
            : obs;
        final projectsBacklogsId =
            castToType<int>(getJsonField(item, r'$.projects_backlogs_id')) ??
                castToType<int>(
                    getJsonField(item, r'$.projects_backlogs.id')) ??
                0;
        final subtasksId =
            castToType<int>(getJsonField(item, r'$.subtasks_id')) ?? 0;

        _model.addCommentResponse = await TasksGroup.addCommentCall.call(
          comment: commentText,
          projectsBacklogsId: projectsBacklogsId,
          subtasksId: subtasksId,
          createdUserId: AppState().user.id,
          token: currentAuthenticationToken,
        );
      }
    }

    // Limpar estado batch
    AppState().taskslist = [];
    AppState().tasksfinish = [];
    AppState().update(() {});

    safeSetState(() => _model.isLoading = false);

    // Chamar callback de refresh
    await widget.action?.call();

    // Fechar modal
    if (mounted) Navigator.pop(context);
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    context.watch<AppState>();

    return Align(
      alignment: const AlignmentDirectional(0.0, 0.0),
      child: Padding(
        padding: const EdgeInsetsDirectional.fromSTEB(16.0, 24.0, 16.0, 24.0),
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(maxWidth: 530.0),
          decoration: BoxDecoration(
            color: AppTheme.of(context).secondaryBackground,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.12),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
            borderRadius: BorderRadius.circular(16.0),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Conteúdo scrollável
              Flexible(
                child: SingleChildScrollView(
                  child: Padding(
                    padding: const EdgeInsetsDirectional.fromSTEB(
                        24.0, 24.0, 24.0, 0.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildHeader(context),
                        const SizedBox(height: 16.0),
                        _buildTitleSection(context),
                        const SizedBox(height: 20.0),
                        if (_isBatch)
                          _buildBatchContent(context)
                        else
                          _buildSingleContent(context),
                        const SizedBox(height: 24.0),
                      ],
                    ),
                  ),
                ),
              ),
              // Botões fixos na base
              Padding(
                padding: const EdgeInsetsDirectional.fromSTEB(
                    24.0, 0.0, 24.0, 24.0),
                child: _buildButtons(context),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Seções do build
  // ---------------------------------------------------------------------------

  Widget _buildHeader(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        SizedBox(width: 32.0, height: 32.0),
        Icon(
          Icons.warning_amber_rounded,
          color: AppTheme.of(context).error,
          size: 32.0,
        ),
        AppIconButton(
          borderColor: AppTheme.of(context).primary,
          borderRadius: 8.0,
          buttonSize: 32.0,
          fillColor: AppTheme.of(context).secondary,
          icon: Icon(
            Icons.close,
            color: AppTheme.of(context).primary,
            size: 16.0,
          ),
          onPressed: () async {
            Navigator.pop(context);
          },
        ),
      ],
    );
  }

  Widget _buildTitleSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Sem Sucesso',
          style: AppTheme.of(context).headlineSmall.override(
                font: GoogleFonts.lexend(
                  fontWeight:
                      AppTheme.of(context).headlineSmall.fontWeight,
                  fontStyle:
                      AppTheme.of(context).headlineSmall.fontStyle,
                ),
                color: AppTheme.of(context).error,
                letterSpacing: 0.0,
                fontWeight:
                    AppTheme.of(context).headlineSmall.fontWeight,
                fontStyle: AppTheme.of(context).headlineSmall.fontStyle,
              ),
        ),
        const SizedBox(height: 4.0),
        Text(
          _isBatch
              ? 'Informe o motivo individual para cada uma das ${widget.items.length} tarefas.'
              : 'Informe o motivo pelo qual a tarefa nao foi concluida com sucesso.',
          style: AppTheme.of(context).labelMedium.override(
                font: GoogleFonts.lexend(
                  fontWeight:
                      AppTheme.of(context).labelMedium.fontWeight,
                  fontStyle:
                      AppTheme.of(context).labelMedium.fontStyle,
                ),
                letterSpacing: 0.0,
                fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                fontStyle: AppTheme.of(context).labelMedium.fontStyle,
              ),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Modo single (1 tarefa) — comportamento original
  // ---------------------------------------------------------------------------

  Widget _buildSingleContent(BuildContext context) {
    final isLoadingReasons = _model.nonExecutionReasonsResponse == null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _labelText(context, 'Motivo da Falha *'),
        const SizedBox(height: 8.0),
        _buildReasonDropdown(
          context: context,
          isLoadingReasons: isLoadingReasons,
          selectedId: _model.selectedReasonId,
          showError: _model.showReasonError,
          onChanged: (value) {
            final selected = _model.reasons.firstWhere(
              (r) => getJsonField(r, r'$.id')?.toString() == value,
              orElse: () => null,
            );
            safeSetState(() {
              _model.selectedReasonId = value;
              _model.selectedReasonName = selected != null
                  ? getJsonField(selected, r'$.name')?.toString() ?? ''
                  : null;
              _model.showReasonError = false;
            });
          },
        ),
        if (_model.showReasonError) ...[
          const SizedBox(height: 4.0),
          _errorText(context, 'Selecione um motivo'),
        ],
        const SizedBox(height: 16.0),
        _labelText(context, 'Observacoes'),
        const SizedBox(height: 8.0),
        _buildObsField(
          context: context,
          controller: _model.observationsController!,
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Modo batch (N tarefas) — accordion individual por tarefa
  // ---------------------------------------------------------------------------

  Widget _buildBatchContent(BuildContext context) {
    final isLoadingReasons = _model.nonExecutionReasonsResponse == null;

    // Indicador de progresso: quantas tarefas já têm motivo
    final completedCount = _model.batchReasonIds.values
        .where((v) => v != null && v.isNotEmpty)
        .length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Barra de progresso
        _buildProgressBar(context, completedCount, widget.items.length),
        const SizedBox(height: 16.0),
        // Lista de accordions
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: widget.items.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8.0),
          itemBuilder: (context, index) {
            return _buildTaskAccordion(
              context: context,
              index: index,
              item: widget.items[index],
              isLoadingReasons: isLoadingReasons,
            );
          },
        ),
      ],
    );
  }

  Widget _buildProgressBar(
      BuildContext context, int completed, int total) {
    final pct = total > 0 ? completed / total : 0.0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Progresso',
              style: AppTheme.of(context).labelSmall.override(
                    font: GoogleFonts.lexend(
                      fontWeight: FontWeight.w500,
                      fontStyle:
                          AppTheme.of(context).labelSmall.fontStyle,
                    ),
                    letterSpacing: 0.0,
                    fontWeight: FontWeight.w500,
                    fontStyle:
                        AppTheme.of(context).labelSmall.fontStyle,
                  ),
            ),
            Text(
              '$completed / $total preenchidas',
              style: AppTheme.of(context).labelSmall.override(
                    font: GoogleFonts.lexend(
                      fontWeight: FontWeight.w600,
                      fontStyle:
                          AppTheme.of(context).labelSmall.fontStyle,
                    ),
                    color: completed == total
                        ? const Color(0xFF16A34A)
                        : AppTheme.of(context).error,
                    letterSpacing: 0.0,
                    fontWeight: FontWeight.w600,
                    fontStyle:
                        AppTheme.of(context).labelSmall.fontStyle,
                  ),
            ),
          ],
        ),
        const SizedBox(height: 6.0),
        ClipRRect(
          borderRadius: BorderRadius.circular(4.0),
          child: LinearProgressIndicator(
            value: pct,
            minHeight: 6.0,
            backgroundColor: AppTheme.of(context).alternate,
            valueColor: AlwaysStoppedAnimation<Color>(
              completed == total
                  ? const Color(0xFF16A34A)
                  : AppTheme.of(context).error,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTaskAccordion({
    required BuildContext context,
    required int index,
    required dynamic item,
    required bool isLoadingReasons,
  }) {
    final taskName = _taskName(item);
    final hasReason = (_model.batchReasonIds[index] ?? '').isNotEmpty;
    final showError = _model.batchShowReasonError[index] ?? false;

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.of(context).primaryBackground,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(
          color: showError
              ? AppTheme.of(context).error
              : hasReason
                  ? const Color(0xFF16A34A)
                  : AppTheme.of(context).alternate,
          width: showError ? 2.0 : 1.0,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12.0),
        child: Theme(
          // Remove o divider padrão do ExpansionTile
          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            initiallyExpanded: index == 0,
            tilePadding:
                const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
            childrenPadding: const EdgeInsets.fromLTRB(16.0, 0.0, 16.0, 16.0),
            onExpansionChanged: (expanded) {
              safeSetState(() {
                _model.batchExpanded[index] = expanded;
              });
            },
            leading: Container(
              width: 28.0,
              height: 28.0,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: hasReason
                    ? const Color(0xFF16A34A)
                    : AppTheme.of(context).alternate,
              ),
              child: Center(
                child: hasReason
                    ? const Icon(Icons.check,
                        size: 16.0, color: Colors.white)
                    : Text(
                        '${index + 1}',
                        style: AppTheme.of(context).labelSmall.override(
                              font: GoogleFonts.lexend(
                                fontWeight: FontWeight.w700,
                                fontStyle: AppTheme.of(context)
                                    .labelSmall
                                    .fontStyle,
                              ),
                              color: AppTheme.of(context).secondaryText,
                              letterSpacing: 0.0,
                              fontWeight: FontWeight.w700,
                              fontStyle: AppTheme.of(context)
                                  .labelSmall
                                  .fontStyle,
                            ),
                      ),
              ),
            ),
            title: Text(
              taskName,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTheme.of(context).bodyMedium.override(
                    font: GoogleFonts.lexend(
                      fontWeight: FontWeight.w600,
                      fontStyle:
                          AppTheme.of(context).bodyMedium.fontStyle,
                    ),
                    letterSpacing: 0.0,
                    fontWeight: FontWeight.w600,
                    fontStyle:
                        AppTheme.of(context).bodyMedium.fontStyle,
                  ),
            ),
            subtitle: hasReason
                ? Text(
                    _model.batchReasonNames[index] ?? '',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppTheme.of(context).labelSmall.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FontWeight.w400,
                            fontStyle: AppTheme.of(context)
                                .labelSmall
                                .fontStyle,
                          ),
                          color: const Color(0xFF16A34A),
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w400,
                          fontStyle: AppTheme.of(context)
                              .labelSmall
                              .fontStyle,
                        ),
                  )
                : Text(
                    'Motivo obrigatorio',
                    style: AppTheme.of(context).labelSmall.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FontWeight.w400,
                            fontStyle: AppTheme.of(context)
                                .labelSmall
                                .fontStyle,
                          ),
                          color: showError
                              ? AppTheme.of(context).error
                              : AppTheme.of(context).secondaryText,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w400,
                          fontStyle: AppTheme.of(context)
                              .labelSmall
                              .fontStyle,
                        ),
                  ),
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _labelText(context, 'Motivo da Falha *'),
                  const SizedBox(height: 8.0),
                  _buildReasonDropdown(
                    context: context,
                    isLoadingReasons: isLoadingReasons,
                    selectedId: _model.batchReasonIds[index],
                    showError: showError,
                    onChanged: (value) {
                      final selected = _model.reasons.firstWhere(
                        (r) =>
                            getJsonField(r, r'$.id')?.toString() ==
                            value,
                        orElse: () => null,
                      );
                      safeSetState(() {
                        _model.batchReasonIds[index] = value;
                        _model.batchReasonNames[index] = selected != null
                            ? getJsonField(selected, r'$.name')
                                    ?.toString() ??
                                ''
                            : null;
                        _model.batchShowReasonError[index] = false;
                      });
                    },
                  ),
                  if (showError) ...[
                    const SizedBox(height: 4.0),
                    _errorText(context, 'Selecione um motivo'),
                  ],
                  const SizedBox(height: 12.0),
                  _labelText(context, 'Observacoes'),
                  const SizedBox(height: 8.0),
                  _buildObsField(
                    context: context,
                    controller: _model.batchObsControllers[index] ??
                        TextEditingController(),
                    minLines: 2,
                    maxLines: 3,
                    onChanged: (_) {
                      // Verifica se motivo + observação estão preenchidos para oferecer replicar
                      final hasReason = (_model.batchReasonIds[index] ?? '').isNotEmpty;
                      final hasObs = (_model.batchObsControllers[index]?.text.trim() ?? '').isNotEmpty;
                      if (hasReason && hasObs) {
                        _maybeOfferReplicate(context, index);
                      }
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Replicar motivo/observação para os demais
  // ---------------------------------------------------------------------------

  Future<void> _maybeOfferReplicate(BuildContext context, int sourceIndex) async {
    // Só oferece 1 vez e somente quando há mais de 1 tarefa
    if (_model.alreadyOfferedReplicate) return;
    if (widget.items.length <= 1) return;

    final reasonId = _model.batchReasonIds[sourceIndex];
    if (reasonId == null || reasonId.isEmpty) return;

    _model.alreadyOfferedReplicate = true;

    final obs = _model.batchObsControllers[sourceIndex]?.text.trim() ?? '';
    final reasonName = _model.batchReasonNames[sourceIndex] ?? '';

    final confirmed = await showDialog<bool>(
      context: context,
      barrierColor: const Color(0x80000000),
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.0)),
        title: Text(
          'Replicar para todas?',
          style: GoogleFonts.lexend(fontWeight: FontWeight.w600, fontSize: 17.0),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Deseja aplicar o mesmo motivo e observacao para as demais ${widget.items.length - 1} tarefas?',
              style: GoogleFonts.lexend(fontSize: 14.0, color: AppTheme.of(context).secondaryText),
            ),
            const SizedBox(height: 12.0),
            Container(
              padding: const EdgeInsets.all(10.0),
              decoration: BoxDecoration(
                color: AppTheme.of(context).primaryBackground,
                borderRadius: BorderRadius.circular(8.0),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.warning_amber_rounded, size: 14.0, color: AppTheme.of(context).error),
                      const SizedBox(width: 6.0),
                      Expanded(
                        child: Text(
                          reasonName,
                          style: GoogleFonts.lexend(fontSize: 13.0, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    obs,
                    style: GoogleFonts.lexend(fontSize: 12.0, color: AppTheme.of(context).secondaryText),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: Text('Nao', style: GoogleFonts.lexend(color: AppTheme.of(context).secondaryText)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.of(context).primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
            ),
            onPressed: () => Navigator.pop(dialogContext, true),
            child: Text('Sim, replicar', style: GoogleFonts.lexend(color: Colors.white, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      safeSetState(() {
        for (int i = 0; i < widget.items.length; i++) {
          if (i == sourceIndex) continue;
          _model.batchReasonIds[i] = reasonId;
          _model.batchReasonNames[i] = reasonName;
          _model.batchShowReasonError[i] = false;
          if (obs.isNotEmpty) {
            _model.batchObsControllers[i]?.text = obs;
          }
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Botões
  // ---------------------------------------------------------------------------

  Widget _buildButtons(BuildContext context) {
    final allFilled =
        !_isBatch || _model.isBatchValid(widget.items.length);

    return Row(
      children: [
        Expanded(
          child: AppButton(
            onPressed: _model.isLoading
                ? null
                : () async {
                    Navigator.pop(context);
                  },
            text: 'Cancelar',
            options: AppButtonOptions(
              width: double.infinity,
              height: 48.0,
              padding: const EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
              iconPadding:
                  const EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
              color: AppTheme.of(context).primaryBackground,
              textStyle: AppTheme.of(context).labelMedium.override(
                    font: GoogleFonts.lexend(
                      fontWeight: FontWeight.w600,
                      fontStyle:
                          AppTheme.of(context).labelMedium.fontStyle,
                    ),
                    letterSpacing: 0.0,
                    fontWeight: FontWeight.w600,
                    fontStyle:
                        AppTheme.of(context).labelMedium.fontStyle,
                  ),
              elevation: 0.0,
              borderSide: BorderSide(
                color: AppTheme.of(context).alternate,
                width: 1.0,
              ),
              borderRadius: BorderRadius.circular(14.0),
            ),
          ),
        ),
        const SizedBox(width: 12.0),
        Expanded(
          child: AppButton(
            onPressed: (_model.isLoading || !allFilled)
                ? null
                : () async {
                    await _onConfirm();
                  },
            text: _model.isLoading ? 'Enviando...' : 'Confirmar S.Suc.',
            options: AppButtonOptions(
              width: double.infinity,
              height: 48.0,
              padding: const EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
              iconPadding:
                  const EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
              color: (_model.isLoading || !allFilled)
                  ? AppTheme.of(context).error.withValues(alpha: 0.4)
                  : AppTheme.of(context).error,
              textStyle: AppTheme.of(context).titleSmall.override(
                    font: GoogleFonts.lexend(
                      fontWeight: FontWeight.w600,
                      fontStyle:
                          AppTheme.of(context).titleSmall.fontStyle,
                    ),
                    color: Colors.white,
                    fontSize: 15.0,
                    letterSpacing: 0.0,
                    fontWeight: FontWeight.w600,
                    fontStyle: AppTheme.of(context).titleSmall.fontStyle,
                  ),
              elevation: 0.0,
              borderSide: const BorderSide(color: Colors.transparent),
              borderRadius: BorderRadius.circular(14.0),
            ),
          ),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Widgets reutilizáveis internos
  // ---------------------------------------------------------------------------

  Widget _labelText(BuildContext context, String text) {
    return Text(
      text,
      style: AppTheme.of(context).bodyMedium.override(
            font: GoogleFonts.lexend(
              fontWeight: FontWeight.w600,
              fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
            ),
            letterSpacing: 0.0,
            fontWeight: FontWeight.w600,
            fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
          ),
    );
  }

  Widget _errorText(BuildContext context, String text) {
    return Text(
      text,
      style: AppTheme.of(context).bodySmall.override(
            font: GoogleFonts.lexend(
              fontWeight: AppTheme.of(context).bodySmall.fontWeight,
              fontStyle: AppTheme.of(context).bodySmall.fontStyle,
            ),
            color: AppTheme.of(context).error,
            letterSpacing: 0.0,
            fontWeight: AppTheme.of(context).bodySmall.fontWeight,
            fontStyle: AppTheme.of(context).bodySmall.fontStyle,
          ),
    );
  }

  Widget _buildReasonDropdown({
    required BuildContext context,
    required bool isLoadingReasons,
    required String? selectedId,
    required bool showError,
    required ValueChanged<String?> onChanged,
  }) {
    if (isLoadingReasons) {
      return Container(
        width: double.infinity,
        height: 48.0,
        decoration: BoxDecoration(
          color: AppTheme.of(context).primaryBackground,
          borderRadius: BorderRadius.circular(12.0),
          border: Border.all(
            color: AppTheme.of(context).alternate,
            width: 1.0,
          ),
        ),
        child: Center(
          child: SizedBox(
            width: 20.0,
            height: 20.0,
            child: CircularProgressIndicator(
              strokeWidth: 2.0,
              color: AppTheme.of(context).primary,
            ),
          ),
        ),
      );
    }

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppTheme.of(context).primaryBackground,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(
          color: showError
              ? AppTheme.of(context).error
              : AppTheme.of(context).alternate,
          width: showError ? 2.0 : 1.0,
        ),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: selectedId,
          isExpanded: true,
          hint: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Text(
              'Selecione o motivo...',
              style: AppTheme.of(context).labelMedium.override(
                    font: GoogleFonts.lexend(
                      fontWeight:
                          AppTheme.of(context).labelMedium.fontWeight,
                      fontStyle:
                          AppTheme.of(context).labelMedium.fontStyle,
                    ),
                    letterSpacing: 0.0,
                    fontWeight:
                        AppTheme.of(context).labelMedium.fontWeight,
                    fontStyle:
                        AppTheme.of(context).labelMedium.fontStyle,
                  ),
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          borderRadius: BorderRadius.circular(12.0),
          dropdownColor: AppTheme.of(context).secondaryBackground,
          icon: Icon(
            Icons.keyboard_arrow_down_rounded,
            color: AppTheme.of(context).secondaryText,
          ),
          items:
              _model.reasons.map<DropdownMenuItem<String>>((reason) {
            final id =
                getJsonField(reason, r'$.id')?.toString() ?? '';
            final name =
                getJsonField(reason, r'$.name')?.toString() ?? '';
            return DropdownMenuItem<String>(
              value: id,
              child: Text(
                name,
                style: AppTheme.of(context).bodyMedium.override(
                      font: GoogleFonts.lexend(
                        fontWeight:
                            AppTheme.of(context).bodyMedium.fontWeight,
                        fontStyle:
                            AppTheme.of(context).bodyMedium.fontStyle,
                      ),
                      letterSpacing: 0.0,
                      fontWeight:
                          AppTheme.of(context).bodyMedium.fontWeight,
                      fontStyle:
                          AppTheme.of(context).bodyMedium.fontStyle,
                    ),
              ),
            );
          }).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  Widget _buildObsField({
    required BuildContext context,
    required TextEditingController controller,
    int minLines = 2,
    int maxLines = 4,
    ValueChanged<String>? onChanged,
  }) {
    return TextFormField(
      controller: controller,
      onChanged: onChanged,
      maxLines: maxLines,
      minLines: minLines,
      decoration: InputDecoration(
        hintText: 'Descreva observacoes adicionais (opcional)...',
        hintStyle: AppTheme.of(context).labelMedium.override(
              font: GoogleFonts.lexend(
                fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                fontStyle: AppTheme.of(context).labelMedium.fontStyle,
              ),
              letterSpacing: 0.0,
              fontWeight: AppTheme.of(context).labelMedium.fontWeight,
              fontStyle: AppTheme.of(context).labelMedium.fontStyle,
            ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(
            color: AppTheme.of(context).alternate,
            width: 1.0,
          ),
          borderRadius: BorderRadius.circular(12.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(
            color: AppTheme.of(context).primary,
            width: 2.0,
          ),
          borderRadius: BorderRadius.circular(12.0),
        ),
        errorBorder: OutlineInputBorder(
          borderSide: BorderSide(
            color: AppTheme.of(context).error,
            width: 1.0,
          ),
          borderRadius: BorderRadius.circular(12.0),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderSide: BorderSide(
            color: AppTheme.of(context).error,
            width: 2.0,
          ),
          borderRadius: BorderRadius.circular(12.0),
        ),
        filled: true,
        fillColor: AppTheme.of(context).primaryBackground,
        contentPadding:
            const EdgeInsetsDirectional.fromSTEB(16.0, 12.0, 16.0, 12.0),
      ),
      style: AppTheme.of(context).bodyMedium.override(
            font: GoogleFonts.lexend(
              fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
              fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
            ),
            letterSpacing: 0.0,
            fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
            fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
          ),
    );
  }
}
