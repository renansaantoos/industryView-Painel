import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info_widget.dart';
import '/components/row_list_subtasks_widget.dart';
import '/components/tasks_sem_sucesso_widget.dart';
import '/core/widgets/app_drop_down.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import '/core/widgets/form_field_controller.dart';
import 'dart:ui';
import '/core/utils/custom_functions.dart' as functions;
import '/index.dart';
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'confirmdialog_model.dart';
export 'confirmdialog_model.dart';

class ConfirmdialogWidget extends StatefulWidget {
  const ConfirmdialogWidget({
    super.key,
    required this.action,
  });

  final Future Function()? action;

  @override
  State<ConfirmdialogWidget> createState() => _ConfirmdialogWidgetState();
}

class _ConfirmdialogWidgetState extends State<ConfirmdialogWidget> {
  late ConfirmdialogModel _model;

  bool _isOfflineResponse(ApiCallResponse? response) {
    return getJsonField(response?.jsonBody, r'''$.offline''') == true;
  }

  void _addOfflineMaskIfNeeded(
    ApiCallResponse? response,
    List<TasksListStruct> tasks,
  ) {
    final isOffline = _isOfflineResponse(response);
    if (!isOffline) {
      return;
    }
    final ids = tasks.map((e) => e.sprintsTasksId).whereType<int>().toList();
    if (ids.isEmpty) {
      return;
    }
    AppState().update(() {
      final current = AppState().offlineMaskedTasksIds.toList();
      for (final id in ids) {
        if (!current.contains(id)) {
          current.add(id);
        }
      }
      AppState().offlineMaskedTasksIds = current;
    });
  }

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ConfirmdialogModel());

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
          width: 530.0,
          constraints: const BoxConstraints(
            maxHeight: double.infinity,
          ),
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
          child: Padding(
            padding: const EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 24.0),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.max,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (_model.fase == 1)
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsetsDirectional.fromSTEB(
                                    0.0, 0.0, 0.0, 16.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      width: 32.0,
                                      height: 32.0,
                                      decoration: BoxDecoration(
                                        color: AppTheme.of(context)
                                            .secondaryBackground,
                                      ),
                                    ),
                                    Align(
                                      alignment: const AlignmentDirectional(0.0, 0.0),
                                      child: Icon(
                                        Icons.task,
                                        color: AppTheme.of(context)
                                            .primary,
                                        size: 32.0,
                                      ),
                                    ),
                                    Align(
                                      alignment:
                                          const AlignmentDirectional(1.0, -1.0),
                                      child: AppIconButton(
                                        borderColor:
                                            AppTheme.of(context)
                                                .primary,
                                        borderRadius: 8.0,
                                        buttonSize: 32.0,
                                        fillColor: AppTheme.of(context)
                                            .secondary,
                                        icon: Icon(
                                          Icons.close,
                                          color: AppTheme.of(context)
                                              .primary,
                                          size: 16.0,
                                        ),
                                        onPressed: () async {
                                          AppState().tasksfinish = [];
                                          AppState().update(() {});
                                          Navigator.pop(context);
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                AppLocalizations.of(context).getText(
                                  'haubphh0' /* Todas as tarefas foram executa... */,
                                ),
                                textAlign: TextAlign.start,
                                style: AppTheme.of(context)
                                    .headlineSmall
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: AppTheme.of(context)
                                            .headlineSmall
                                            .fontWeight,
                                        fontStyle: AppTheme.of(context)
                                            .headlineSmall
                                            .fontStyle,
                                      ),
                                      letterSpacing: 0.0,
                                      fontWeight: AppTheme.of(context)
                                          .headlineSmall
                                          .fontWeight,
                                      fontStyle: AppTheme.of(context)
                                          .headlineSmall
                                          .fontStyle,
                                    ),
                              ),
                              Align(
                                alignment: const AlignmentDirectional(-1.0, 0.0),
                                child: Padding(
                                  padding: const EdgeInsetsDirectional.fromSTEB(
                                      0.0, 8.0, 0.0, 0.0),
                                  child: Text(
                                    AppLocalizations.of(context).getText(
                                      'b1ti6dz5' /* Se todas foram concluídas com ... */,
                                    ),
                                    style: AppTheme.of(context)
                                        .bodyMedium
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                AppTheme.of(context)
                                                    .bodyMedium
                                                    .fontWeight,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .bodyMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              AppTheme.of(context)
                                                  .bodyMedium
                                                  .fontWeight,
                                          fontStyle:
                                              AppTheme.of(context)
                                                  .bodyMedium
                                                  .fontStyle,
                                        ),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsetsDirectional.fromSTEB(
                                    0.0, 24.0, 0.0, 0.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  children: [
                                    Expanded(
                                      child: Align(
                                        alignment:
                                            const AlignmentDirectional(1.0, 1.0),
                                        child: Builder(
                                          builder: (context) => AppButton(
                                            onPressed: () async {
                                              var shouldSetState = false;
                                              
                                              // Sincronizar comentários do tasksfinish para taskslist
                                              for (final finishItem in AppState().tasksfinish) {
                                                if (finishItem.comment.isNotEmpty) {
                                                  final taskIndex = AppState().taskslist.indexWhere(
                                                    (task) => task.sprintsTasksId == finishItem.sprintsTasksId,
                                                  );
                                                  if (taskIndex >= 0) {
                                                    final currentComment = AppState().taskslist[taskIndex].comment;
                                                    // Só atualiza se o comentário do tasksfinish não estiver vazio e for diferente
                                                    if (currentComment.isEmpty || currentComment != finishItem.comment) {
                                                      AppState().updateTaskslistAtIndex(
                                                        taskIndex,
                                                        (task) => task..comment = finishItem.comment,
                                                      );
                                                    }
                                                  }
                                                }
                                              }
                                              
                                              _model.editProgressSprintSucesso =
                                                  await SprintsGroup
                                                      .atualizaStatusDaSprintTaskCall
                                                      .call(
                                                scheduleId:
                                                    AppState().user.sheduleId,
                                                token:
                                                    currentAuthenticationToken,
                                                tasksListJson: functions
                                                    .retornaJsonTaskList(
                                                        AppState()
                                                            .taskslist
                                                            .toList())
                                                    .map((e) => e.toMap())
                                                    .toList(),
                                              );

                                              shouldSetState = true;
                                              if ((_model
                                                      .editProgressSprintSucesso
                                                      ?.succeeded ??
                                                  true)) {
                                                final isOffline =
                                                    _isOfflineResponse(_model
                                                        .editProgressSprintSucesso);
                                                _addOfflineMaskIfNeeded(
                                                  _model
                                                      .editProgressSprintSucesso,
                                                  AppState()
                                                      .taskslist
                                                      .toList(),
                                                );
                                                AppState().comment = '';
                                                AppState().taskslist = [];
                                                AppState().tasksfinish = [];
                                                AppState().update(() {});
                                                await widget.action?.call();
                                                Navigator.pop(context);
                                              } else {
                                                await showDialog(
                                                  context: context,
                                                  builder: (dialogContext) {
                                                    return Dialog(
                                                      elevation: 0,
                                                      insetPadding:
                                                          EdgeInsets.zero,
                                                      backgroundColor:
                                                          Colors.transparent,
                                                      alignment:
                                                          const AlignmentDirectional(
                                                                  0.0, 0.0)
                                                              .resolve(
                                                                  Directionality.of(
                                                                      context)),
                                                      child: ModalInfoWidget(
                                                        title:
                                                            AppLocalizations.of(
                                                                    context)
                                                                .getText(
                                                          'apatljfn' /* Erro */,
                                                        ),
                                                        description:
                                                            getJsonField(
                                                          (_model.editProgressSprintSucesso
                                                                  ?.jsonBody ??
                                                              ''),
                                                          r'''$.message''',
                                                        ).toString(),
                                                      ),
                                                    );
                                                  },
                                                );

                                                if (shouldSetState) {
                                                  safeSetState(() {});
                                                }
                                                return;
                                              }

                                              if (shouldSetState) {
                                                safeSetState(() {});
                                              }
                                            },
                                            text: AppLocalizations.of(context)
                                                .getText(
                                              '1b0xc4lv' /* Sim */,
                                            ),
                                            options: AppButtonOptions(
                                              width: 200.0,
                                              height: 48.0,
                                              padding: const EdgeInsetsDirectional
                                                  .fromSTEB(
                                                      16.0, 0.0, 16.0, 0.0),
                                              iconPadding: const EdgeInsetsDirectional
                                                  .fromSTEB(0.0, 0.0, 0.0, 0.0),
                                              color:
                                                  AppTheme.of(context)
                                                      .primary,
                                              textStyle: AppTheme.of(
                                                      context)
                                                  .labelMedium
                                                  .override(
                                                    font: GoogleFonts.lexend(
                                                      fontWeight:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .fontStyle,
                                                    ),
                                                    color: AppTheme.of(
                                                            context)
                                                        .info,
                                                    fontSize: 14.0,
                                                    letterSpacing: 0.0,
                                                    fontWeight:
                                                        AppTheme.of(
                                                                context)
                                                            .labelMedium
                                                            .fontWeight,
                                                    fontStyle:
                                                        AppTheme.of(
                                                                context)
                                                            .labelMedium
                                                            .fontStyle,
                                                  ),
                                              elevation: 0.0,
                                              borderRadius:
                                                  BorderRadius.circular(14.0),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Align(
                                        alignment:
                                            const AlignmentDirectional(1.0, 1.0),
                                        child: AppButton(
                                          onPressed: () async {
                                            _model.fase = 2;
                                            safeSetState(() {});
                                          },
                                          text: AppLocalizations.of(context)
                                              .getText(
                                            'kqv63umr' /* Não */,
                                          ),
                                          options: AppButtonOptions(
                                            width: 200.0,
                                            height: 48.0,
                                            padding:
                                                const EdgeInsetsDirectional.fromSTEB(
                                                    16.0, 0.0, 16.0, 0.0),
                                            iconPadding:
                                                const EdgeInsetsDirectional.fromSTEB(
                                                    0.0, 0.0, 0.0, 0.0),
                                            color: AppTheme.of(context)
                                                .status01,
                                            textStyle:
                                                AppTheme.of(context)
                                                    .labelMedium
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            AppTheme.of(
                                                                    context)
                                                                .labelMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            AppTheme.of(
                                                                    context)
                                                                .labelMedium
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          AppTheme.of(
                                                                  context)
                                                              .error,
                                                      fontSize: 14.0,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .fontStyle,
                                                    ),
                                            elevation: 0.0,
                                            borderRadius:
                                                BorderRadius.circular(14.0),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ].divide(const SizedBox(width: 16.0)),
                                ),
                              ),
                            ],
                          ),
                        if (_model.fase == 2)
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsetsDirectional.fromSTEB(
                                    0.0, 0.0, 0.0, 16.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      width: 32.0,
                                      height: 32.0,
                                      decoration: BoxDecoration(
                                        color: AppTheme.of(context)
                                            .secondaryBackground,
                                      ),
                                    ),
                                    Align(
                                      alignment: const AlignmentDirectional(0.0, 0.0),
                                      child: Icon(
                                        Icons.task,
                                        color: AppTheme.of(context)
                                            .primary,
                                        size: 32.0,
                                      ),
                                    ),
                                    Align(
                                      alignment:
                                          const AlignmentDirectional(1.0, -1.0),
                                      child: AppIconButton(
                                        borderColor:
                                            AppTheme.of(context)
                                                .primary,
                                        borderRadius: 8.0,
                                        buttonSize: 32.0,
                                        fillColor: AppTheme.of(context)
                                            .secondary,
                                        icon: Icon(
                                          Icons.close,
                                          color: AppTheme.of(context)
                                              .primary,
                                          size: 16.0,
                                        ),
                                        onPressed: () async {
                                          Navigator.pop(context);
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                AppLocalizations.of(context).getText(
                                  'sg67i0zz' /* Identifique as tarefas com fal... */,
                                ),
                                textAlign: TextAlign.start,
                                style: AppTheme.of(context)
                                    .headlineSmall
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: AppTheme.of(context)
                                            .headlineSmall
                                            .fontWeight,
                                        fontStyle: AppTheme.of(context)
                                            .headlineSmall
                                            .fontStyle,
                                      ),
                                      letterSpacing: 0.0,
                                      fontWeight: AppTheme.of(context)
                                          .headlineSmall
                                          .fontWeight,
                                      fontStyle: AppTheme.of(context)
                                          .headlineSmall
                                          .fontStyle,
                                    ),
                              ),
                              Align(
                                alignment: const AlignmentDirectional(-1.0, 0.0),
                                child: Padding(
                                  padding: const EdgeInsetsDirectional.fromSTEB(
                                      0.0, 8.0, 0.0, 0.0),
                                  child: Text(
                                    AppLocalizations.of(context).getText(
                                      '8tcm52tq' /* Por favor, selecione as tarefa... */,
                                    ),
                                    style: AppTheme.of(context)
                                        .bodyMedium
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                AppTheme.of(context)
                                                    .bodyMedium
                                                    .fontWeight,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .bodyMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              AppTheme.of(context)
                                                  .bodyMedium
                                                  .fontWeight,
                                          fontStyle:
                                              AppTheme.of(context)
                                                  .bodyMedium
                                                  .fontStyle,
                                        ),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsetsDirectional.fromSTEB(
                                    0.0, 16.0, 0.0, 0.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  children: [
                                    RichText(
                                      textScaler:
                                          MediaQuery.of(context).textScaler,
                                      text: TextSpan(
                                        children: [
                                          TextSpan(
                                            text: AppLocalizations.of(context)
                                                .getText(
                                              'wcowp62x' /* Tarefas selecionadas  */,
                                            ),
                                            style: AppTheme.of(context)
                                                .bodyMedium
                                                .override(
                                                  font: GoogleFonts.lexend(
                                                    fontWeight:
                                                        AppTheme.of(
                                                                context)
                                                            .bodyMedium
                                                            .fontWeight,
                                                    fontStyle:
                                                        AppTheme.of(
                                                                context)
                                                            .bodyMedium
                                                            .fontStyle,
                                                  ),
                                                  letterSpacing: 0.0,
                                                  fontWeight:
                                                      AppTheme.of(
                                                              context)
                                                          .bodyMedium
                                                          .fontWeight,
                                                  fontStyle:
                                                      AppTheme.of(
                                                              context)
                                                          .bodyMedium
                                                          .fontStyle,
                                                ),
                                          ),
                                          TextSpan(
                                            text: valueOrDefault<String>(
                                              AppState()
                                                  .tasksfinish
                                                  .where((e) =>
                                                      e.sprintsTasksStatusesId ==
                                                      0)
                                                  .toList()
                                                  .length
                                                  .toString(),
                                              '0',
                                            ),
                                            style: TextStyle(
                                              color:
                                                  AppTheme.of(context)
                                                      .primary,
                                            ),
                                          )
                                        ],
                                        style: AppTheme.of(context)
                                            .bodyMedium
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight:
                                                    AppTheme.of(context)
                                                        .bodyMedium
                                                        .fontWeight,
                                                fontStyle:
                                                    AppTheme.of(context)
                                                        .bodyMedium
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  AppTheme.of(context)
                                                      .bodyMedium
                                                      .fontWeight,
                                              fontStyle:
                                                  AppTheme.of(context)
                                                      .bodyMedium
                                                      .fontStyle,
                                            ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Builder(
                                builder: (context) => Padding(
                                  padding: const EdgeInsetsDirectional.fromSTEB(
                                      0.0, 4.0, 0.0, 0.0),
                                  child: InkWell(
                                    splashColor: Colors.transparent,
                                    focusColor: Colors.transparent,
                                    hoverColor: Colors.transparent,
                                    highlightColor: Colors.transparent,
                                    onTap: () async {
                                      await showAlignedDialog(
                                        barrierColor: Colors.transparent,
                                        context: context,
                                        isGlobal: false,
                                        avoidOverflow: true,
                                        targetAnchor:
                                            const AlignmentDirectional(1.0, 1.0)
                                                .resolve(
                                                    Directionality.of(context)),
                                        followerAnchor:
                                            const AlignmentDirectional(-1.0, -1.0)
                                                .resolve(
                                                    Directionality.of(context)),
                                        builder: (dialogContext) {
                                          return Material(
                                            color: Colors.transparent,
                                            child: SizedBox(
                                              width: 530.0,
                                              child: const TasksSemSucessoWidget(),
                                            ),
                                          );
                                        },
                                      );
                                    },
                                    child: Container(
                                      width: double.infinity,
                                      height: 48.0,
                                      decoration: BoxDecoration(
                                        color: AppTheme.of(context)
                                            .primaryBackground,
                                        borderRadius:
                                            BorderRadius.circular(14.0),
                                        border: Border.all(
                                          color: AppTheme.of(context)
                                              .alternate,
                                        ),
                                      ),
                                      child: Padding(
                                        padding: const EdgeInsetsDirectional.fromSTEB(
                                            12.0, 0.0, 12.0, 0.0),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.max,
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              valueOrDefault<String>(
                                                AppState()
                                                        .tasksfinish
                                                        .where((e) =>
                                                            e.sprintsTasksStatusesId ==
                                                            0)
                                                        .toList()
                                                        .isNotEmpty
                                                    ? functions
                                                        .retornaIdsSetados(
                                                            AppState()
                                                                .tasksfinish
                                                                .toList())
                                                    : 'Selecione a tarefa com falha',
                                                '0',
                                              ),
                                              style:
                                                  AppTheme.of(context)
                                                      .bodyMedium
                                                      .override(
                                                        font:
                                                            GoogleFonts.lexend(
                                                          fontWeight:
                                                              AppTheme.of(
                                                                      context)
                                                                  .bodyMedium
                                                                  .fontWeight,
                                                          fontStyle:
                                                              AppTheme.of(
                                                                      context)
                                                                  .bodyMedium
                                                                  .fontStyle,
                                                        ),
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            AppTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            AppTheme.of(
                                                                    context)
                                                                .bodyMedium
                                                                .fontStyle,
                                                      ),
                                            ),
                                            Icon(
                                              Icons.keyboard_arrow_down_rounded,
                                              color:
                                                  AppTheme.of(context)
                                                      .secondaryText,
                                              size: 24.0,
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsetsDirectional.fromSTEB(
                                    0.0, 24.0, 0.0, 0.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  children: [
                                    Expanded(
                                      child: Align(
                                        alignment:
                                            const AlignmentDirectional(1.0, 1.0),
                                        child: Builder(
                                          builder: (context) => AppButton(
                                            onPressed: () async {
                                              _model.erro1 = false;
                                              safeSetState(() {});
                                              if (AppState()
                                                  .taskslist
                                                  .where((e) =>
                                                      e.sprintsTasksStatusesId ==
                                                      0)
                                                  .toList()
                                                  .isNotEmpty) {
                                                _model.fase = 3;
                                                safeSetState(() {});
                                              } else {
                                                await showDialog(
                                                  context: context,
                                                  builder: (dialogContext) {
                                                    return Dialog(
                                                      elevation: 0,
                                                      insetPadding:
                                                          EdgeInsets.zero,
                                                      backgroundColor:
                                                          Colors.transparent,
                                                      alignment:
                                                          const AlignmentDirectional(
                                                                  0.0, 0.0)
                                                              .resolve(
                                                                  Directionality.of(
                                                                      context)),
                                                      child: ModalInfoWidget(
                                                        title:
                                                            AppLocalizations.of(
                                                                    context)
                                                                .getText(
                                                          'nmckbejo' /* Atenção */,
                                                        ),
                                                        description:
                                                            AppLocalizations.of(
                                                                    context)
                                                                .getText(
                                                          'c5tvkxa6' /* Selecione as tarefas sem suces... */,
                                                        ),
                                                      ),
                                                    );
                                                  },
                                                );

                                                _model.erro1 = true;
                                                safeSetState(() {});
                                              }
                                            },
                                            text: AppLocalizations.of(context)
                                                .getText(
                                              'a56c8i52' /* Proximo */,
                                            ),
                                            options: AppButtonOptions(
                                              width: 200.0,
                                              height: 48.0,
                                              padding: const EdgeInsetsDirectional
                                                  .fromSTEB(
                                                      16.0, 0.0, 16.0, 0.0),
                                              iconPadding: const EdgeInsetsDirectional
                                                  .fromSTEB(0.0, 0.0, 0.0, 0.0),
                                              color:
                                                  AppTheme.of(context)
                                                      .primary,
                                              textStyle: AppTheme.of(
                                                      context)
                                                  .labelMedium
                                                  .override(
                                                    font: GoogleFonts.lexend(
                                                      fontWeight:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .fontStyle,
                                                    ),
                                                    color: AppTheme.of(
                                                            context)
                                                        .info,
                                                    fontSize: 14.0,
                                                    letterSpacing: 0.0,
                                                    fontWeight:
                                                        AppTheme.of(
                                                                context)
                                                            .labelMedium
                                                            .fontWeight,
                                                    fontStyle:
                                                        AppTheme.of(
                                                                context)
                                                            .labelMedium
                                                            .fontStyle,
                                                  ),
                                              elevation: 0.0,
                                              borderRadius:
                                                  BorderRadius.circular(14.0),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Align(
                                        alignment:
                                            const AlignmentDirectional(1.0, 1.0),
                                        child: AppButton(
                                          onPressed: () async {
                                            _model.fase = 1;
                                            safeSetState(() {});
                                          },
                                          text: AppLocalizations.of(context)
                                              .getText(
                                            'zmuwf7qv' /* Voltar */,
                                          ),
                                          options: AppButtonOptions(
                                            width: 200.0,
                                            height: 48.0,
                                            padding:
                                                const EdgeInsetsDirectional.fromSTEB(
                                                    16.0, 0.0, 16.0, 0.0),
                                            iconPadding:
                                                const EdgeInsetsDirectional.fromSTEB(
                                                    0.0, 0.0, 0.0, 0.0),
                                            color: AppTheme.of(context)
                                                .alternate,
                                            textStyle:
                                                AppTheme.of(context)
                                                    .labelMedium
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            AppTheme.of(
                                                                    context)
                                                                .labelMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            AppTheme.of(
                                                                    context)
                                                                .labelMedium
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          AppTheme.of(
                                                                  context)
                                                              .primaryText,
                                                      fontSize: 14.0,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .fontStyle,
                                                    ),
                                            elevation: 0.0,
                                            borderSide: BorderSide(
                                              color:
                                                  AppTheme.of(context)
                                                      .alternate,
                                            ),
                                            borderRadius:
                                                BorderRadius.circular(14.0),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ].divide(const SizedBox(width: 16.0)),
                                ),
                              ),
                            ],
                          ),
                        if (_model.fase == 3)
                          Column(
                            mainAxisSize: MainAxisSize.max,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsetsDirectional.fromSTEB(
                                    0.0, 0.0, 0.0, 16.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      width: 32.0,
                                      height: 32.0,
                                      decoration: BoxDecoration(
                                        color: AppTheme.of(context)
                                            .secondaryBackground,
                                      ),
                                    ),
                                    Align(
                                      alignment: const AlignmentDirectional(0.0, 0.0),
                                      child: Icon(
                                        Icons.task,
                                        color: AppTheme.of(context)
                                            .primary,
                                        size: 32.0,
                                      ),
                                    ),
                                    Align(
                                      alignment:
                                          const AlignmentDirectional(1.0, -1.0),
                                      child: AppIconButton(
                                        borderColor:
                                            AppTheme.of(context)
                                                .primary,
                                        borderRadius: 8.0,
                                        buttonSize: 32.0,
                                        fillColor: AppTheme.of(context)
                                            .secondary,
                                        icon: Icon(
                                          Icons.close,
                                          color: AppTheme.of(context)
                                              .primary,
                                          size: 16.0,
                                        ),
                                        onPressed: () async {
                                          Navigator.pop(context);
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                AppLocalizations.of(context).getText(
                                  'zpnho10m' /* Status  */,
                                ),
                                textAlign: TextAlign.start,
                                style: AppTheme.of(context)
                                    .headlineSmall
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: AppTheme.of(context)
                                            .headlineSmall
                                            .fontWeight,
                                        fontStyle: AppTheme.of(context)
                                            .headlineSmall
                                            .fontStyle,
                                      ),
                                      letterSpacing: 0.0,
                                      fontWeight: AppTheme.of(context)
                                          .headlineSmall
                                          .fontWeight,
                                      fontStyle: AppTheme.of(context)
                                          .headlineSmall
                                          .fontStyle,
                                    ),
                              ),
                              Align(
                                alignment: const AlignmentDirectional(-1.0, 0.0),
                                child: Padding(
                                  padding: const EdgeInsetsDirectional.fromSTEB(
                                      0.0, 8.0, 0.0, 0.0),
                                  child: RichText(
                                    textScaler:
                                        MediaQuery.of(context).textScaler,
                                    text: TextSpan(
                                      children: [
                                        TextSpan(
                                          text: AppLocalizations.of(context)
                                              .getText(
                                            '7iku26rr' /* Escolha o status de falha da t... */,
                                          ),
                                          style: AppTheme.of(context)
                                              .bodyMedium
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight:
                                                      AppTheme.of(
                                                              context)
                                                          .bodyMedium
                                                          .fontWeight,
                                                  fontStyle:
                                                      AppTheme.of(
                                                              context)
                                                          .bodyMedium
                                                          .fontStyle,
                                                ),
                                                letterSpacing: 0.0,
                                                fontWeight:
                                                    AppTheme.of(context)
                                                        .bodyMedium
                                                        .fontWeight,
                                                fontStyle:
                                                    AppTheme.of(context)
                                                        .bodyMedium
                                                        .fontStyle,
                                              ),
                                        ),
                                        TextSpan(
                                          text: AppLocalizations.of(context)
                                              .getText(
                                            'w32q5hxy' /* Sem sucesso, sem impedimento */,
                                          ),
                                          style: TextStyle(
                                            color: AppTheme.of(context)
                                                .primaryText,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        TextSpan(
                                          text: AppLocalizations.of(context)
                                              .getText(
                                            'jvqcbyev' /*  ou  */,
                                          ),
                                          style: const TextStyle(),
                                        ),
                                        TextSpan(
                                          text: AppLocalizations.of(context)
                                              .getText(
                                            't05u5a58' /* Sem sucesso, com impedimento */,
                                          ),
                                          style: TextStyle(
                                            color: AppTheme.of(context)
                                                .primaryText,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        TextSpan(
                                          text: AppLocalizations.of(context)
                                              .getText(
                                            '5rc9klky' /* ". */,
                                          ),
                                          style: const TextStyle(),
                                        )
                                      ],
                                      style: AppTheme.of(context)
                                          .bodyMedium
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  AppTheme.of(context)
                                                      .bodyMedium
                                                      .fontWeight,
                                              fontStyle:
                                                  AppTheme.of(context)
                                                      .bodyMedium
                                                      .fontStyle,
                                            ),
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                AppTheme.of(context)
                                                    .bodyMedium
                                                    .fontWeight,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .bodyMedium
                                                    .fontStyle,
                                          ),
                                    ),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsetsDirectional.fromSTEB(
                                    0.0, 8.0, 0.0, 0.0),
                                child: Column(
                                  mainAxisSize: MainAxisSize.max,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    AppDropDown<int>(
                                      controller:
                                          _model.dropStatusValueController ??=
                                              FormFieldController<int>(null),
                                      options: List<int>.from([1, 2, 3]),
                                      optionLabels: [
                                        AppLocalizations.of(context).getText(
                                          '0vhawvnj' /* Sem sucesso, com impedimento */,
                                        ),
                                        AppLocalizations.of(context).getText(
                                          'v0q9vcht' /* Sem sucesso, sem impedimento */,
                                        ),
                                        AppLocalizations.of(context).getText(
                                          '5rpm6l4n' /* Com sucesso */,
                                        )
                                      ],
                                      onChanged: (val) async {
                                        safeSetState(
                                            () => _model.dropStatusValue = val);
                                        _model.erroDrop = false;
                                        safeSetState(() {});
                                      },
                                      width: double.infinity,
                                      height: 48.0,
                                      maxHeight: 300.0,
                                      textStyle: AppTheme.of(context)
                                          .bodyMedium
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  AppTheme.of(context)
                                                      .bodyMedium
                                                      .fontWeight,
                                              fontStyle:
                                                  AppTheme.of(context)
                                                      .bodyMedium
                                                      .fontStyle,
                                            ),
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                AppTheme.of(context)
                                                    .bodyMedium
                                                    .fontWeight,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .bodyMedium
                                                    .fontStyle,
                                          ),
                                      hintText:
                                          AppLocalizations.of(context).getText(
                                        '44ryozxd' /* Selecione o status da tarefa */,
                                      ),
                                      icon: Icon(
                                        Icons.keyboard_arrow_down_rounded,
                                        color: AppTheme.of(context)
                                            .secondaryText,
                                        size: 24.0,
                                      ),
                                      fillColor: AppTheme.of(context)
                                          .primaryBackground,
                                      elevation: 2.0,
                                      borderColor: _model.erroDrop
                                          ? AppTheme.of(context).error
                                          : AppTheme.of(context)
                                              .alternate,
                                      borderWidth: 0.0,
                                      borderRadius: 12.0,
                                      margin: const EdgeInsetsDirectional.fromSTEB(
                                          12.0, 0.0, 12.0, 0.0),
                                      hidesUnderline: true,
                                      isOverButton: false,
                                      isSearchable: false,
                                      isMultiSelect: false,
                                    ),
                                    if (_model.erroDrop)
                                      Text(
                                        AppLocalizations.of(context).getText(
                                          'gitypcyz' /* Selecione o status da tarefa */,
                                        ),
                                        style: AppTheme.of(context)
                                            .bodyMedium
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight:
                                                    AppTheme.of(context)
                                                        .bodyMedium
                                                        .fontWeight,
                                                fontStyle:
                                                    AppTheme.of(context)
                                                        .bodyMedium
                                                        .fontStyle,
                                              ),
                                              color:
                                                  AppTheme.of(context)
                                                      .error,
                                              fontSize: 10.0,
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  AppTheme.of(context)
                                                      .bodyMedium
                                                      .fontWeight,
                                              fontStyle:
                                                  AppTheme.of(context)
                                                      .bodyMedium
                                                      .fontStyle,
                                            ),
                                      ),
                                    Padding(
                                      padding: const EdgeInsetsDirectional.fromSTEB(
                                          0.0, 8.0, 0.0, 0.0),
                                      child: Container(
                                        constraints: const BoxConstraints(
                                          maxHeight: 280.0,
                                        ),
                                        decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(0.0),
                                        ),
                                        child: Builder(
                                          builder: (context) {
                                            final falhas = AppState()
                                                .tasksfinish
                                                .toList();

                                            return ListView.separated(
                                              padding: EdgeInsets.zero,
                                              shrinkWrap: true,
                                              scrollDirection: Axis.vertical,
                                              itemCount: falhas.length,
                                              separatorBuilder: (_, __) =>
                                                  const SizedBox(height: 8.0),
                                              itemBuilder:
                                                  (context, falhasIndex) {
                                                final falhasItem =
                                                    falhas[falhasIndex];
                                                return Column(
                                                  mainAxisSize:
                                                      MainAxisSize.max,
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Container(
                                                      decoration: BoxDecoration(
                                                        color: () {
                                                          if (falhasItem
                                                                  .sprintsTasksStatusesId ==
                                                              1) {
                                                            return const Color(
                                                                0xFFFFE9E9);
                                                          } else if (falhasItem
                                                                  .sprintsTasksStatusesId ==
                                                              2) {
                                                            return const Color(
                                                                0xFFFEF7D6);
                                                          } else if (falhasItem
                                                                  .sprintsTasksStatusesId ==
                                                              3) {
                                                            return const Color(
                                                                0xFFD2FFEC);
                                                          } else {
                                                            return AppTheme
                                                                    .of(context)
                                                                .alternate;
                                                          }
                                                        }(),
                                                        borderRadius:
                                                            BorderRadius.only(
                                                          bottomLeft:
                                                              Radius.circular(
                                                                  valueOrDefault<
                                                                      double>(
                                                            (falhasItem.unityId !=
                                                                        0) &&
                                                                    (falhasItem
                                                                            .subtasksId !=
                                                                        0)
                                                                ? 0.0
                                                                : 8.0,
                                                            0.0,
                                                          )),
                                                          bottomRight:
                                                              Radius.circular(
                                                                  valueOrDefault<
                                                                      double>(
                                                            (falhasItem.unityId !=
                                                                        0) &&
                                                                    (falhasItem
                                                                            .subtasksId !=
                                                                        0)
                                                                ? 0.0
                                                                : 8.0,
                                                            0.0,
                                                          )),
                                                          topLeft:
                                                              const Radius.circular(
                                                                  8.0),
                                                          topRight:
                                                              const Radius.circular(
                                                                  8.0),
                                                        ),
                                                      ),
                                                      child: Padding(
                                                        padding:
                                                            const EdgeInsetsDirectional
                                                                .fromSTEB(
                                                                    8.0,
                                                                    4.0,
                                                                    8.0,
                                                                    4.0),
                                                        child: Row(
                                                          mainAxisSize:
                                                              MainAxisSize.max,
                                                          children: [
                                                            Padding(
                                                              padding:
                                                                  const EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          0.0,
                                                                          0.0,
                                                                          8.0,
                                                                          0.0),
                                                              child: Row(
                                                                mainAxisSize:
                                                                    MainAxisSize
                                                                        .max,
                                                                children: [
                                                                  if (!_model
                                                                          .ids
                                                                          .contains(falhasItem
                                                                              .sprintsTasksId) &&
                                                                      (falhasItem
                                                                              .sucesso ==
                                                                          false))
                                                                    InkWell(
                                                                      splashColor:
                                                                          Colors
                                                                              .transparent,
                                                                      focusColor:
                                                                          Colors
                                                                              .transparent,
                                                                      hoverColor:
                                                                          Colors
                                                                              .transparent,
                                                                      highlightColor:
                                                                          Colors
                                                                              .transparent,
                                                                      onTap:
                                                                          () async {
                                                                        if (!(_model.dropStatusValue !=
                                                                            null)) {
                                                                          _model.erroDrop =
                                                                              true;
                                                                          safeSetState(
                                                                              () {});
                                                                          return;
                                                                        }
                                                                        AppState()
                                                                            .updateTasksfinishAtIndex(
                                                                          falhasIndex,
                                                                          (e) => e
                                                                            ..sprintsTasksStatusesId =
                                                                                _model.dropStatusValue
                                                                            ..checkTasks = true,
                                                                        );
                                                                        safeSetState(
                                                                            () {});
                                                                        _model.addToIds(
                                                                            falhasItem.sprintsTasksId);
                                                                        safeSetState(
                                                                            () {});
                                                                      },
                                                                      child:
                                                                          Container(
                                                                        width:
                                                                            30.0,
                                                                        height:
                                                                            30.0,
                                                                        decoration:
                                                                            const BoxDecoration(),
                                                                        alignment: const AlignmentDirectional(
                                                                            0.0,
                                                                            0.0),
                                                                        child:
                                                                            Column(
                                                                          mainAxisSize:
                                                                              MainAxisSize.max,
                                                                          mainAxisAlignment:
                                                                              MainAxisAlignment.center,
                                                                          children: [
                                                                            Container(
                                                                              width: 18.0,
                                                                              height: 18.0,
                                                                              decoration: BoxDecoration(
                                                                                color: AppTheme.of(context).secondaryBackground,
                                                                                borderRadius: BorderRadius.circular(4.0),
                                                                                border: Border.all(
                                                                                  color: AppTheme.of(context).alternate,
                                                                                  width: 2.0,
                                                                                ),
                                                                              ),
                                                                            ),
                                                                          ],
                                                                        ),
                                                                      ),
                                                                    ),
                                                                  if (_model.ids.contains(
                                                                          falhasItem
                                                                              .sprintsTasksId) &&
                                                                      (falhasItem
                                                                              .sucesso ==
                                                                          false))
                                                                    InkWell(
                                                                      splashColor:
                                                                          Colors
                                                                              .transparent,
                                                                      focusColor:
                                                                          Colors
                                                                              .transparent,
                                                                      hoverColor:
                                                                          Colors
                                                                              .transparent,
                                                                      highlightColor:
                                                                          Colors
                                                                              .transparent,
                                                                      onTap:
                                                                          () async {
                                                                        AppState()
                                                                            .updateTasksfinishAtIndex(
                                                                          falhasIndex,
                                                                          (e) => e
                                                                            ..sprintsTasksStatusesId =
                                                                                0
                                                                            ..checkTasks = false,
                                                                        );
                                                                        safeSetState(
                                                                            () {});
                                                                        _model.removeFromIds(
                                                                            falhasItem.sprintsTasksId);
                                                                        safeSetState(
                                                                            () {});
                                                                      },
                                                                      child:
                                                                          Container(
                                                                        width:
                                                                            30.0,
                                                                        height:
                                                                            30.0,
                                                                        decoration:
                                                                            const BoxDecoration(),
                                                                        alignment: const AlignmentDirectional(
                                                                            0.0,
                                                                            0.0),
                                                                        child:
                                                                            Column(
                                                                          mainAxisSize:
                                                                              MainAxisSize.max,
                                                                          mainAxisAlignment:
                                                                              MainAxisAlignment.center,
                                                                          children: [
                                                                            Container(
                                                                              width: 18.0,
                                                                              height: 18.0,
                                                                              decoration: BoxDecoration(
                                                                                color: AppTheme.of(context).primary,
                                                                                borderRadius: BorderRadius.circular(4.0),
                                                                                border: Border.all(
                                                                                  color: AppTheme.of(context).primary,
                                                                                  width: 2.0,
                                                                                ),
                                                                              ),
                                                                              alignment: const AlignmentDirectional(0.0, 0.0),
                                                                              child: Icon(
                                                                                Icons.check_rounded,
                                                                                color: AppTheme.of(context).secondaryBackground,
                                                                                size: 15.0,
                                                                              ),
                                                                            ),
                                                                          ],
                                                                        ),
                                                                      ),
                                                                    ),
                                                                  Container(
                                                                    width: 30.0,
                                                                    height:
                                                                        30.0,
                                                                    decoration:
                                                                        const BoxDecoration(),
                                                                    alignment:
                                                                        const AlignmentDirectional(
                                                                            0.0,
                                                                            0.0),
                                                                    child:
                                                                        Column(
                                                                      mainAxisSize:
                                                                          MainAxisSize
                                                                              .max,
                                                                      mainAxisAlignment:
                                                                          MainAxisAlignment
                                                                              .center,
                                                                      children: [
                                                                        if (falhasItem
                                                                            .sucesso)
                                                                          Container(
                                                                            width:
                                                                                18.0,
                                                                            height:
                                                                                18.0,
                                                                            decoration:
                                                                                BoxDecoration(
                                                                              color: AppTheme.of(context).primaryText,
                                                                              borderRadius: BorderRadius.circular(4.0),
                                                                              border: Border.all(
                                                                                color: AppTheme.of(context).primaryText,
                                                                                width: 2.0,
                                                                              ),
                                                                            ),
                                                                            alignment:
                                                                                const AlignmentDirectional(0.0, 0.0),
                                                                            child:
                                                                                Icon(
                                                                              Icons.check_rounded,
                                                                              color: AppTheme.of(context).secondaryBackground,
                                                                              size: 15.0,
                                                                            ),
                                                                          ),
                                                                      ],
                                                                    ),
                                                                  ),
                                                                ],
                                                              ),
                                                            ),
                                                            Flexible(
                                                              child: RichText(
                                                                textScaler: MediaQuery.of(
                                                                        context)
                                                                    .textScaler,
                                                                text: TextSpan(
                                                                  children: [
                                                                    TextSpan(
                                                                      text: AppLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        '1bm1fbeq' /* COD:  */,
                                                                      ),
                                                                      style: AppTheme.of(
                                                                              context)
                                                                          .bodyMedium
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.lexend(
                                                                              fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                              fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                            ),
                                                                            color:
                                                                                AppTheme.of(context).primary,
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                AppTheme.of(context).bodyMedium.fontWeight,
                                                                            fontStyle:
                                                                                AppTheme.of(context).bodyMedium.fontStyle,
                                                                          ),
                                                                    ),
                                                                    TextSpan(
                                                                      text: valueOrDefault<
                                                                          String>(
                                                                        falhasItem
                                                                            .sprintsTasksId
                                                                            .toString(),
                                                                        '1',
                                                                      ),
                                                                      style:
                                                                          TextStyle(
                                                                        color: AppTheme.of(context)
                                                                            .primary,
                                                                      ),
                                                                    ),
                                                                    TextSpan(
                                                                      text: AppLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        'osm9t2ao' /*  -  */,
                                                                      ),
                                                                      style:
                                                                          const TextStyle(),
                                                                    ),
                                                                    TextSpan(
                                                                      text: valueOrDefault<
                                                                          String>(
                                                                        falhasItem
                                                                            .description,
                                                                        'txt',
                                                                      ),
                                                                      style:
                                                                          const TextStyle(),
                                                                    )
                                                                  ],
                                                                  style: AppTheme.of(
                                                                          context)
                                                                      .bodyMedium
                                                                      .override(
                                                                        font: GoogleFonts
                                                                            .lexend(
                                                                          fontWeight: AppTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontWeight,
                                                                          fontStyle: AppTheme.of(context)
                                                                              .bodyMedium
                                                                              .fontStyle,
                                                                        ),
                                                                        letterSpacing:
                                                                            0.0,
                                                                        fontWeight: AppTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontWeight,
                                                                        fontStyle: AppTheme.of(context)
                                                                            .bodyMedium
                                                                            .fontStyle,
                                                                      ),
                                                                ),
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    ),
                                                    if (!falhasItem.sucesso)
                                                      RowListSubtasksWidget(
                                                        key: Key(
                                                            'Keytl6_${falhasIndex}_of_${falhas.length}'),
                                                        id: falhasItem
                                                            .sprintsTasksId,
                                                        description:
                                                            valueOrDefault<
                                                                String>(
                                                          falhasItem
                                                              .description,
                                                          'txt',
                                                        ),
                                                        unityID:
                                                            falhasItem.unity.id,
                                                        unity: falhasItem
                                                            .unity.unity,
                                                        index: falhasIndex,
                                                        checktasks: falhasItem
                                                            .checkTasks,
                                                        sucesso:
                                                            falhasItem.sucesso,
                                                        quantity: falhasItem
                                                            .quantityDone,
                                                        comment:
                                                            falhasItem.comment,
                                                        subtaskID: falhasItem
                                                            .subtasksId,
                                                      ),
                                                  ],
                                                );
                                              },
                                            );
                                          },
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsetsDirectional.fromSTEB(
                                    0.0, 24.0, 0.0, 0.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  children: [
                                    Expanded(
                                      child: Align(
                                        alignment:
                                            const AlignmentDirectional(1.0, 1.0),
                                        child: Builder(
                                          builder: (context) => AppButton(
                                            onPressed: () async {
                                              var shouldSetState = false;
                                              if (!functions.allStatus(
                                                  AppState()
                                                      .taskslist
                                                      .toList())!) {
                                                await showDialog(
                                                  context: context,
                                                  builder: (dialogContext) {
                                                    return Dialog(
                                                      elevation: 0,
                                                      insetPadding:
                                                          EdgeInsets.zero,
                                                      backgroundColor:
                                                          Colors.transparent,
                                                      alignment:
                                                          const AlignmentDirectional(
                                                                  0.0, 0.0)
                                                              .resolve(
                                                                  Directionality.of(
                                                                      context)),
                                                      child: ModalInfoWidget(
                                                        title:
                                                            AppLocalizations.of(
                                                                    context)
                                                                .getText(
                                                          'ixhzuegl' /* Tarefas sem status */,
                                                        ),
                                                        description:
                                                            AppLocalizations.of(
                                                                    context)
                                                                .getText(
                                                          'i38360nm' /* Existem tarefas que ainda não ... */,
                                                        ),
                                                      ),
                                                    );
                                                  },
                                                );

                                                if (shouldSetState) {
                                                  safeSetState(() {});
                                                }
                                                return;
                                              }
                                              
                                              // Sincronizar comentários do tasksfinish para taskslist
                                              for (final finishItem in AppState().tasksfinish) {
                                                if (finishItem.comment.isNotEmpty) {
                                                  final taskIndex = AppState().taskslist.indexWhere(
                                                    (task) => task.sprintsTasksId == finishItem.sprintsTasksId,
                                                  );
                                                  if (taskIndex >= 0) {
                                                    final currentComment = AppState().taskslist[taskIndex].comment;
                                                    // Só atualiza se o comentário do tasksfinish não estiver vazio e for diferente
                                                    if (currentComment.isEmpty || currentComment != finishItem.comment) {
                                                      AppState().updateTaskslistAtIndex(
                                                        taskIndex,
                                                        (task) => task..comment = finishItem.comment,
                                                      );
                                                    }
                                                  }
                                                }
                                              }
                                              
                                              _model.editProgressSprintSemSucesso =
                                                  await SprintsGroup
                                                      .atualizaStatusDaSprintTaskCall
                                                      .call(
                                                scheduleId:
                                                    AppState().user.sheduleId,
                                                token:
                                                    currentAuthenticationToken,
                                                tasksListJson: functions
                                                    .retornaJsonTaskList(
                                                        AppState()
                                                            .taskslist
                                                            .toList())
                                                    .map((e) => e.toMap())
                                                    .toList(),
                                              );

                                              shouldSetState = true;
                                              if ((_model
                                                      .editProgressSprintSemSucesso
                                                      ?.succeeded ??
                                                  true)) {
                                                final isOffline =
                                                    _isOfflineResponse(_model
                                                        .editProgressSprintSemSucesso);
                                                _addOfflineMaskIfNeeded(
                                                  _model
                                                      .editProgressSprintSemSucesso,
                                                  AppState()
                                                      .taskslist
                                                      .toList(),
                                                );
                                                for (int loop1Index = 0;
                                                    loop1Index <
                                                        AppState()
                                                            .tasksfinish
                                                            .length;
                                                    loop1Index++) {
                                                  final currentLoop1Item =
                                                      AppState().tasksfinish[
                                                          loop1Index];
                                                  _model.addComment =
                                                      await TasksGroup
                                                          .addCommentCall
                                                          .call(
                                                    comment: currentLoop1Item
                                                        .comment,
                                                    projectsBacklogsId:
                                                        currentLoop1Item
                                                            .sprintsTasksId,
                                                    subtasksId:
                                                        valueOrDefault<int>(
                                                      currentLoop1Item
                                                          .subtasksId,
                                                      0,
                                                    ),
                                                    createdUserId:
                                                        AppState().user.id,
                                                    token:
                                                        currentAuthenticationToken,
                                                  );

                                                  shouldSetState = true;
                                                }
                                                AppState().comment = '';
                                                AppState().taskslist = [];
                                                AppState().tasksfinish = [];
                                                AppState().update(() {});

                                                context.pushNamed(
                                                  HomePageTarefasWidget
                                                      .routeName,
                                                  extra: <String, dynamic>{
                                                    kTransitionInfoKey:
                                                        const TransitionInfo(
                                                      hasTransition: true,
                                                      transitionType:
                                                          PageTransitionType
                                                              .fade,
                                                      duration: Duration(
                                                          milliseconds: 500),
                                                    ),
                                                  },
                                                );
                                              } else {
                                                await showDialog(
                                                  context: context,
                                                  builder: (dialogContext) {
                                                    return Dialog(
                                                      elevation: 0,
                                                      insetPadding:
                                                          EdgeInsets.zero,
                                                      backgroundColor:
                                                          Colors.transparent,
                                                      alignment:
                                                          const AlignmentDirectional(
                                                                  0.0, 0.0)
                                                              .resolve(
                                                                  Directionality.of(
                                                                      context)),
                                                      child: ModalInfoWidget(
                                                        title:
                                                            AppLocalizations.of(
                                                                    context)
                                                                .getText(
                                                          '9va460z9' /* Erro */,
                                                        ),
                                                        description:
                                                            getJsonField(
                                                          (_model.editProgressSprintSemSucesso
                                                                  ?.jsonBody ??
                                                              ''),
                                                          r'''$.message''',
                                                        ).toString(),
                                                      ),
                                                    );
                                                  },
                                                );

                                                if (shouldSetState) {
                                                  safeSetState(() {});
                                                }
                                                return;
                                              }

                                              if (shouldSetState) {
                                                safeSetState(() {});
                                              }
                                            },
                                            text: AppLocalizations.of(context)
                                                .getText(
                                              'w6z4j997' /* Finalizar */,
                                            ),
                                            options: AppButtonOptions(
                                              width: 200.0,
                                              height: 48.0,
                                              padding: const EdgeInsetsDirectional
                                                  .fromSTEB(
                                                      16.0, 0.0, 16.0, 0.0),
                                              iconPadding: const EdgeInsetsDirectional
                                                  .fromSTEB(0.0, 0.0, 0.0, 0.0),
                                              color:
                                                  AppTheme.of(context)
                                                      .primary,
                                              textStyle: AppTheme.of(
                                                      context)
                                                  .labelMedium
                                                  .override(
                                                    font: GoogleFonts.lexend(
                                                      fontWeight:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .fontStyle,
                                                    ),
                                                    color: AppTheme.of(
                                                            context)
                                                        .info,
                                                    fontSize: 14.0,
                                                    letterSpacing: 0.0,
                                                    fontWeight:
                                                        AppTheme.of(
                                                                context)
                                                            .labelMedium
                                                            .fontWeight,
                                                    fontStyle:
                                                        AppTheme.of(
                                                                context)
                                                            .labelMedium
                                                            .fontStyle,
                                                  ),
                                              elevation: 0.0,
                                              borderRadius:
                                                  BorderRadius.circular(14.0),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                    Expanded(
                                      child: Align(
                                        alignment:
                                            const AlignmentDirectional(1.0, 1.0),
                                        child: AppButton(
                                          onPressed: () async {
                                            _model.fase = 2;
                                            safeSetState(() {});
                                          },
                                          text: AppLocalizations.of(context)
                                              .getText(
                                            'guhgheah' /* Voltar */,
                                          ),
                                          options: AppButtonOptions(
                                            width: 200.0,
                                            height: 48.0,
                                            padding:
                                                const EdgeInsetsDirectional.fromSTEB(
                                                    16.0, 0.0, 16.0, 0.0),
                                            iconPadding:
                                                const EdgeInsetsDirectional.fromSTEB(
                                                    0.0, 0.0, 0.0, 0.0),
                                            color: AppTheme.of(context)
                                                .alternate,
                                            textStyle:
                                                AppTheme.of(context)
                                                    .labelMedium
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            AppTheme.of(
                                                                    context)
                                                                .labelMedium
                                                                .fontWeight,
                                                        fontStyle:
                                                            AppTheme.of(
                                                                    context)
                                                                .labelMedium
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          AppTheme.of(
                                                                  context)
                                                              .primaryText,
                                                      fontSize: 14.0,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelMedium
                                                              .fontStyle,
                                                    ),
                                            elevation: 0.0,
                                            borderSide: BorderSide(
                                              color:
                                                  AppTheme.of(context)
                                                      .alternate,
                                            ),
                                            borderRadius:
                                                BorderRadius.circular(14.0),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ].divide(const SizedBox(width: 16.0)),
                                ),
                              ),
                            ],
                          ),
                      ],
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
