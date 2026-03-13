import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import '/core/widgets/app_icon_button.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_comment_model.dart';
export 'modal_comment_model.dart';

class ModalCommentWidget extends StatefulWidget {
  const ModalCommentWidget({
    super.key,
    required this.projectsBacklogsId,
    required this.subtasksId,
    required this.createdUserId,
    required this.sprintTaskId,
    required this.scheduleId,
  });

  final int projectsBacklogsId;
  final int subtasksId;
  final int createdUserId;
  final int sprintTaskId;
  final int scheduleId;

  @override
  State<ModalCommentWidget> createState() => _ModalCommentWidgetState();
}

class _ModalCommentWidgetState extends State<ModalCommentWidget> {
  late ModalCommentModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalCommentModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();
    super.dispose();
  }

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
                color: Colors.black.withOpacity(0.12),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
            borderRadius: BorderRadius.circular(16.0),
          ),
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsetsDirectional.fromSTEB(24.0, 24.0, 24.0, 24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header com ícone e botão fechar
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      SizedBox(width: 32.0, height: 32.0),
                      Icon(
                        Icons.comment_outlined,
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
                          Navigator.pop(context, false);
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 16.0),
                  // Título
                  Text(
                    'Tarefa sem sucesso',
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
                          fontStyle:
                              AppTheme.of(context).headlineSmall.fontStyle,
                        ),
                  ),
                  const SizedBox(height: 8.0),
                  Text(
                    'Informe o motivo pelo qual a tarefa não foi concluída com sucesso.',
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
                  const SizedBox(height: 16.0),
                  // Campo de comentário
                  TextFormField(
                    controller: _model.commentController,
                    autofocus: true,
                    maxLines: 5,
                    minLines: 3,
                    decoration: InputDecoration(
                      hintText: 'Descreva o motivo...',
                      hintStyle: AppTheme.of(context).labelMedium.override(
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
                      contentPadding: const EdgeInsetsDirectional.fromSTEB(
                          16.0, 12.0, 16.0, 12.0),
                    ),
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
                  const SizedBox(height: 24.0),
                  // Botão enviar
                  AppButton(
                    onPressed: _model.isLoading
                        ? null
                        : () async {
                            final comment =
                                _model.commentController?.text.trim() ?? '';
                            if (comment.isEmpty) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: const Text(
                                      'O comentário é obrigatório para tarefas sem sucesso.'),
                                  backgroundColor:
                                      AppTheme.of(context).error,
                                ),
                              );
                              return;
                            }

                            safeSetState(() => _model.isLoading = true);

                            // 1. Enviar comentário
                            _model.addCommentResult =
                                await TasksGroup.addCommentCall.call(
                              comment: comment,
                              projectsBacklogsId: widget.projectsBacklogsId,
                              subtasksId: widget.subtasksId,
                              createdUserId: widget.createdUserId,
                              token: currentAuthenticationToken,
                            );

                            if (!(_model.addCommentResult?.succeeded ??
                                false)) {
                              safeSetState(() => _model.isLoading = false);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: const Text(
                                      'Erro ao enviar comentário. Tente novamente.'),
                                  backgroundColor:
                                      AppTheme.of(context).error,
                                ),
                              );
                              return;
                            }

                            // 2. Atualizar status para "sem sucesso" (4)
                            _model.updateStatusResult = await SprintsGroup
                                .atualizaStatusDaSprintTaskCall
                                .call(
                              scheduleId: widget.scheduleId,
                              tasksListJson: [
                                {
                                  'sprints_tasks_id': widget.sprintTaskId,
                                  'sprints_tasks_statuses_id': 4,
                                }
                              ],
                              token: currentAuthenticationToken,
                            );

                            // 3. Salvar observação no campo estruturado da tarefa
                            await SprintsGroup.editSprintTaskCall.call(
                              taskId: widget.sprintTaskId,
                              nonExecutionObservations: comment,
                              token: currentAuthenticationToken,
                            );

                            safeSetState(() => _model.isLoading = false);

                            if (_model.updateStatusResult?.succeeded ??
                                false) {
                              if (context.mounted) {
                                Navigator.pop(context, true);
                              }
                            } else {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: const Text(
                                        'Erro ao atualizar status da tarefa. Tente novamente.'),
                                    backgroundColor:
                                        AppTheme.of(context).error,
                                  ),
                                );
                              }
                            }
                          },
                    text: _model.isLoading ? 'Enviando...' : 'Enviar',
                    icon: _model.isLoading
                        ? null
                        : const Icon(Icons.send_rounded, size: 18.0),
                    options: AppButtonOptions(
                      width: double.infinity,
                      height: 48.0,
                      padding: const EdgeInsetsDirectional.fromSTEB(
                          20.0, 0.0, 20.0, 0.0),
                      iconPadding: const EdgeInsetsDirectional.fromSTEB(
                          0.0, 0.0, 8.0, 0.0),
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
                      borderSide: const BorderSide(color: Colors.transparent),
                      borderRadius: BorderRadius.circular(14.0),
                    ),
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
