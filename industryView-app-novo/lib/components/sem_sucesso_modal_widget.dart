import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import '/core/widgets/app_icon_button.dart';
import 'dart:ui';
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

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => SemSucessoModalModel());

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

  Future<void> _onConfirm() async {
    // Validar motivo selecionado
    if (_model.selectedReasonId == null) {
      safeSetState(() => _model.showReasonError = true);
      return;
    }

    safeSetState(() {
      _model.isLoading = true;
      _model.showReasonError = false;
    });

    // Montar taskslist com status "sem sucesso" (sprintsTasksStatusesId = 1 => sem sucesso com impedimento)
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

    if (!(_model.updateStatusResponse?.succeeded ?? true)) {
      safeSetState(() => _model.isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao atualizar status. Tente novamente.'),
            backgroundColor: AppTheme.of(context).error,
          ),
        );
      }
      return;
    }

    // Mascarar tarefas se resposta veio do offline wrapper
    if (getJsonField(_model.updateStatusResponse?.jsonBody, r'''$.offline''') == true) {
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

    // Salvar motivo e observações nos campos estruturados da tarefa
    final obs = _model.observationsController?.text.trim() ?? '';
    for (final item in widget.items) {
      final taskId = castToType<int>(getJsonField(item, r'$.id')) ?? 0;
      if (taskId > 0) {
        await SprintsGroup.editSprintTaskCall.call(
          taskId: taskId,
          nonExecutionReasonId: int.tryParse(_model.selectedReasonId ?? ''),
          nonExecutionObservations: obs.isNotEmpty ? obs : null,
          token: currentAuthenticationToken,
        );
      }

      // Manter comentário para histórico
      if (obs.isNotEmpty || _model.selectedReasonName != null) {
        final commentText = _model.selectedReasonName != null
            ? 'Motivo: ${_model.selectedReasonName}.${obs.isNotEmpty ? ' $obs' : ''}'
            : obs;
        final projectsBacklogsId =
            castToType<int>(getJsonField(item, r'$.projects_backlogs_id')) ??
                castToType<int>(getJsonField(item, r'$.projects_backlogs.id')) ??
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

  @override
  Widget build(BuildContext context) {
    context.watch<AppState>();

    final reasons = _model.reasons;
    final isLoadingReasons =
        _model.nonExecutionReasonsResponse == null;

    return Align(
      alignment: AlignmentDirectional(0.0, 0.0),
      child: Padding(
        padding: EdgeInsetsDirectional.fromSTEB(16.0, 24.0, 16.0, 24.0),
        child: Container(
          width: double.infinity,
          constraints: BoxConstraints(maxWidth: 530.0),
          decoration: BoxDecoration(
            color: AppTheme.of(context).secondaryBackground,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.12),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
            borderRadius: BorderRadius.circular(16.0),
          ),
          child: SingleChildScrollView(
            child: Padding(
              padding:
                  EdgeInsetsDirectional.fromSTEB(24.0, 24.0, 24.0, 24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(width: 32.0, height: 32.0),
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
                  ),
                  SizedBox(height: 16.0),
                  // Titulo
                  Text(
                    'Sem Sucesso',
                    style: AppTheme.of(context).headlineSmall.override(
                          font: GoogleFonts.lexend(
                            fontWeight: AppTheme.of(context)
                                .headlineSmall
                                .fontWeight,
                            fontStyle: AppTheme.of(context)
                                .headlineSmall
                                .fontStyle,
                          ),
                          color: AppTheme.of(context).error,
                          letterSpacing: 0.0,
                          fontWeight: AppTheme.of(context)
                              .headlineSmall
                              .fontWeight,
                          fontStyle: AppTheme.of(context)
                              .headlineSmall
                              .fontStyle,
                        ),
                  ),
                  SizedBox(height: 4.0),
                  Text(
                    widget.items.length > 1
                        ? 'Informe o motivo para ${widget.items.length} tarefas sem sucesso.'
                        : 'Informe o motivo pelo qual a tarefa nao foi concluida com sucesso.',
                    style: AppTheme.of(context).labelMedium.override(
                          font: GoogleFonts.lexend(
                            fontWeight: AppTheme.of(context)
                                .labelMedium
                                .fontWeight,
                            fontStyle: AppTheme.of(context)
                                .labelMedium
                                .fontStyle,
                          ),
                          letterSpacing: 0.0,
                          fontWeight: AppTheme.of(context)
                              .labelMedium
                              .fontWeight,
                          fontStyle: AppTheme.of(context)
                              .labelMedium
                              .fontStyle,
                        ),
                  ),
                  SizedBox(height: 16.0),
                  // Label "Motivo da Falha *"
                  Text(
                    'Motivo da Falha *',
                    style: AppTheme.of(context).bodyMedium.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FontWeight.w600,
                            fontStyle: AppTheme.of(context)
                                .bodyMedium
                                .fontStyle,
                          ),
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w600,
                          fontStyle: AppTheme.of(context)
                              .bodyMedium
                              .fontStyle,
                        ),
                  ),
                  SizedBox(height: 8.0),
                  // Dropdown de motivos
                  if (isLoadingReasons)
                    Container(
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
                    )
                  else
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: AppTheme.of(context).primaryBackground,
                        borderRadius: BorderRadius.circular(12.0),
                        border: Border.all(
                          color: _model.showReasonError
                              ? AppTheme.of(context).error
                              : AppTheme.of(context).alternate,
                          width: _model.showReasonError ? 2.0 : 1.0,
                        ),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _model.selectedReasonId,
                          isExpanded: true,
                          hint: Padding(
                            padding: EdgeInsets.symmetric(horizontal: 16.0),
                            child: Text(
                              'Selecione o motivo...',
                              style: AppTheme.of(context)
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
                                    letterSpacing: 0.0,
                                    fontWeight: AppTheme.of(context)
                                        .labelMedium
                                        .fontWeight,
                                    fontStyle: AppTheme.of(context)
                                        .labelMedium
                                        .fontStyle,
                                  ),
                            ),
                          ),
                          padding: EdgeInsets.symmetric(horizontal: 16.0),
                          borderRadius: BorderRadius.circular(12.0),
                          dropdownColor:
                              AppTheme.of(context).secondaryBackground,
                          icon: Icon(
                            Icons.keyboard_arrow_down_rounded,
                            color: AppTheme.of(context).secondaryText,
                          ),
                          items: reasons.map<DropdownMenuItem<String>>((reason) {
                            final id =
                                getJsonField(reason, r'$.id')?.toString() ?? '';
                            final name =
                                getJsonField(reason, r'$.name')?.toString() ??
                                    '';
                            return DropdownMenuItem<String>(
                              value: id,
                              child: Text(
                                name,
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
                            );
                          }).toList(),
                          onChanged: (value) {
                            final selected = reasons.firstWhere(
                              (r) =>
                                  getJsonField(r, r'$.id')?.toString() == value,
                              orElse: () => null,
                            );
                            safeSetState(() {
                              _model.selectedReasonId = value;
                              _model.selectedReasonName = selected != null
                                  ? getJsonField(selected, r'$.name')
                                          ?.toString() ??
                                      ''
                                  : null;
                              _model.showReasonError = false;
                            });
                          },
                        ),
                      ),
                    ),
                  if (_model.showReasonError) ...[
                    SizedBox(height: 4.0),
                    Text(
                      'Selecione um motivo',
                      style: AppTheme.of(context).bodySmall.override(
                            font: GoogleFonts.lexend(
                              fontWeight: AppTheme.of(context)
                                  .bodySmall
                                  .fontWeight,
                              fontStyle: AppTheme.of(context)
                                  .bodySmall
                                  .fontStyle,
                            ),
                            color: AppTheme.of(context).error,
                            letterSpacing: 0.0,
                            fontWeight: AppTheme.of(context)
                                .bodySmall
                                .fontWeight,
                            fontStyle: AppTheme.of(context)
                                .bodySmall
                                .fontStyle,
                          ),
                    ),
                  ],
                  SizedBox(height: 16.0),
                  // Label "Observacoes"
                  Text(
                    'Observacoes',
                    style: AppTheme.of(context).bodyMedium.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FontWeight.w600,
                            fontStyle: AppTheme.of(context)
                                .bodyMedium
                                .fontStyle,
                          ),
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w600,
                          fontStyle: AppTheme.of(context)
                              .bodyMedium
                              .fontStyle,
                        ),
                  ),
                  SizedBox(height: 8.0),
                  // Campo de observacoes
                  TextFormField(
                    controller: _model.observationsController,
                    maxLines: 4,
                    minLines: 2,
                    decoration: InputDecoration(
                      hintText: 'Descreva observacoes adicionais (opcional)...',
                      hintStyle:
                          AppTheme.of(context).labelMedium.override(
                                font: GoogleFonts.lexend(
                                  fontWeight: AppTheme.of(context)
                                      .labelMedium
                                      .fontWeight,
                                  fontStyle: AppTheme.of(context)
                                      .labelMedium
                                      .fontStyle,
                                ),
                                letterSpacing: 0.0,
                                fontWeight: AppTheme.of(context)
                                    .labelMedium
                                    .fontWeight,
                                fontStyle: AppTheme.of(context)
                                    .labelMedium
                                    .fontStyle,
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
                      contentPadding: EdgeInsetsDirectional.fromSTEB(
                          16.0, 12.0, 16.0, 12.0),
                    ),
                    style: AppTheme.of(context).bodyMedium.override(
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
                  SizedBox(height: 24.0),
                  // Botoes
                  Row(
                    children: [
                      // Cancelar
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
                            padding: EdgeInsetsDirectional.fromSTEB(
                                16.0, 0.0, 16.0, 0.0),
                            iconPadding: EdgeInsetsDirectional.fromSTEB(
                                0.0, 0.0, 0.0, 0.0),
                            color: AppTheme.of(context).primaryBackground,
                            textStyle:
                                AppTheme.of(context).labelMedium.override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FontWeight.w600,
                                        fontStyle: AppTheme.of(context)
                                            .labelMedium
                                            .fontStyle,
                                      ),
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w600,
                                      fontStyle: AppTheme.of(context)
                                          .labelMedium
                                          .fontStyle,
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
                      SizedBox(width: 12.0),
                      // Confirmar
                      Expanded(
                        child: AppButton(
                          onPressed: _model.isLoading ? null : () async {
                            await _onConfirm();
                          },
                          text: _model.isLoading
                              ? 'Enviando...'
                              : 'Confirmar S.Suc.',
                          options: AppButtonOptions(
                            width: double.infinity,
                            height: 48.0,
                            padding: EdgeInsetsDirectional.fromSTEB(
                                16.0, 0.0, 16.0, 0.0),
                            iconPadding: EdgeInsetsDirectional.fromSTEB(
                                0.0, 0.0, 0.0, 0.0),
                            color: AppTheme.of(context).error,
                            textStyle:
                                AppTheme.of(context).titleSmall.override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FontWeight.w600,
                                        fontStyle: AppTheme.of(context)
                                            .titleSmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      fontSize: 15.0,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w600,
                                      fontStyle: AppTheme.of(context)
                                          .titleSmall
                                          .fontStyle,
                                    ),
                            elevation: 0.0,
                            borderSide:
                                BorderSide(color: Colors.transparent),
                            borderRadius: BorderRadius.circular(14.0),
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
