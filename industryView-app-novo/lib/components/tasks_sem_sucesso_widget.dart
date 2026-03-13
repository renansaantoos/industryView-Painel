import '/backend/schema/structs/index.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/core/actions/index.dart' as actions;
import '/core/utils/custom_functions.dart' as functions;
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'tasks_sem_sucesso_model.dart';
export 'tasks_sem_sucesso_model.dart';

class TasksSemSucessoWidget extends StatefulWidget {
  const TasksSemSucessoWidget({super.key});

  @override
  State<TasksSemSucessoWidget> createState() => _TasksSemSucessoWidgetState();
}

class _TasksSemSucessoWidgetState extends State<TasksSemSucessoWidget> {
  late TasksSemSucessoModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => TasksSemSucessoModel());

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

    return Padding(
      padding: const EdgeInsetsDirectional.fromSTEB(40.0, 0.0, 40.0, 0.0),
      child: Container(
        width: 482.0,
        constraints: const BoxConstraints(
          maxHeight: 250.0,
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
          padding: const EdgeInsetsDirectional.fromSTEB(12.0, 8.0, 12.0, 8.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (AppState().taskslist.length > 1)
                Row(
                  mainAxisSize: MainAxisSize.max,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        if (!valueOrDefault<bool>(
                          functions
                              .checkBool(AppState().tasksfinish.toList()),
                          false,
                        ))
                          InkWell(
                            splashColor: Colors.transparent,
                            focusColor: Colors.transparent,
                            hoverColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () async {
                              await actions.statusTasks0(
                                AppState().tasksfinish.toList(),
                              );
                            },
                            child: Container(
                              width: 30.0,
                              height: 30.0,
                              decoration: const BoxDecoration(),
                              alignment: const AlignmentDirectional(0.0, 0.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    width: 18.0,
                                    height: 18.0,
                                    decoration: BoxDecoration(
                                      color: AppTheme.of(context)
                                          .secondaryBackground,
                                      borderRadius: BorderRadius.circular(4.0),
                                      border: Border.all(
                                        color: AppTheme.of(context)
                                            .alternate,
                                        width: 2.0,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        if (valueOrDefault<bool>(
                          functions
                              .checkBool(AppState().tasksfinish.toList()),
                          false,
                        ))
                          InkWell(
                            splashColor: Colors.transparent,
                            focusColor: Colors.transparent,
                            hoverColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () async {
                              await actions.statusTasks3(
                                AppState().tasksfinish.toList(),
                              );
                            },
                            child: Container(
                              width: 30.0,
                              height: 30.0,
                              decoration: const BoxDecoration(),
                              alignment: const AlignmentDirectional(0.0, 0.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    width: 18.0,
                                    height: 18.0,
                                    decoration: BoxDecoration(
                                      color:
                                          AppTheme.of(context).primary,
                                      borderRadius: BorderRadius.circular(4.0),
                                      border: Border.all(
                                        color: AppTheme.of(context)
                                            .primary,
                                        width: 2.0,
                                      ),
                                    ),
                                    alignment: const AlignmentDirectional(0.0, 0.0),
                                    child: SizedBox(
                                      width: 18.0,
                                      height: 18.0,
                                      child: Stack(
                                        alignment:
                                            const AlignmentDirectional(0.0, 0.0),
                                        children: [
                                          if (_model.allcheck)
                                            Container(
                                              width: 100.0,
                                              height: 3.0,
                                              decoration: BoxDecoration(
                                                color:
                                                    AppTheme.of(context)
                                                        .secondaryBackground,
                                              ),
                                            ),
                                          if (!_model.allcheck)
                                            Icon(
                                              Icons.check_rounded,
                                              color:
                                                  AppTheme.of(context)
                                                      .secondaryBackground,
                                              size: 15.0,
                                            ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                    Padding(
                      padding:
                          const EdgeInsetsDirectional.fromSTEB(8.0, 0.0, 0.0, 0.0),
                      child: Text(
                        AppLocalizations.of(context).getText(
                          'tu8maiei' /* Selecionar todas tarefas */,
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
                    ),
                  ],
                ),
              Flexible(
                child: Padding(
                  padding: const EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 0.0, 0.0),
                  child: Builder(
                    builder: (context) {
                      final semSucesso = AppState().tasksfinish.toList();

                      return ListView.separated(
                        padding: EdgeInsets.zero,
                        shrinkWrap: true,
                        scrollDirection: Axis.vertical,
                        itemCount: semSucesso.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8.0),
                        itemBuilder: (context, semSucessoIndex) {
                          final semSucessoItem = semSucesso[semSucessoIndex];
                          return Row(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              if (semSucessoItem.check == false)
                                InkWell(
                                  splashColor: Colors.transparent,
                                  focusColor: Colors.transparent,
                                  hoverColor: Colors.transparent,
                                  highlightColor: Colors.transparent,
                                  onTap: () async {
                                    AppState().updateTasksfinishAtIndex(
                                      semSucessoIndex,
                                      (e) => e
                                        ..sprintsTasksStatusesId = 0
                                        ..check = true
                                        ..sucesso = false,
                                    );
                                    safeSetState(() {});
                                  },
                                  child: Container(
                                    width: 30.0,
                                    height: 30.0,
                                    decoration: const BoxDecoration(),
                                    alignment: const AlignmentDirectional(0.0, 0.0),
                                    child: Column(
                                      mainAxisSize: MainAxisSize.max,
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Container(
                                          width: 18.0,
                                          height: 18.0,
                                          decoration: BoxDecoration(
                                            color: AppTheme.of(context)
                                                .secondaryBackground,
                                            borderRadius:
                                                BorderRadius.circular(4.0),
                                            border: Border.all(
                                              color:
                                                  AppTheme.of(context)
                                                      .alternate,
                                              width: 2.0,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              if (semSucessoItem.check == true)
                                InkWell(
                                  splashColor: Colors.transparent,
                                  focusColor: Colors.transparent,
                                  hoverColor: Colors.transparent,
                                  highlightColor: Colors.transparent,
                                  onTap: () async {
                                    AppState().updateTasksfinishAtIndex(
                                      semSucessoIndex,
                                      (e) => e
                                        ..sprintsTasksStatusesId = 3
                                        ..check = false
                                        ..sucesso = true,
                                    );
                                    safeSetState(() {});
                                  },
                                  child: Container(
                                    width: 30.0,
                                    height: 30.0,
                                    decoration: const BoxDecoration(),
                                    alignment: const AlignmentDirectional(0.0, 0.0),
                                    child: Column(
                                      mainAxisSize: MainAxisSize.max,
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Container(
                                          width: 18.0,
                                          height: 18.0,
                                          decoration: BoxDecoration(
                                            color: AppTheme.of(context)
                                                .primary,
                                            borderRadius:
                                                BorderRadius.circular(4.0),
                                            border: Border.all(
                                              color:
                                                  AppTheme.of(context)
                                                      .primary,
                                              width: 2.0,
                                            ),
                                          ),
                                          alignment:
                                              const AlignmentDirectional(0.0, 0.0),
                                          child: SizedBox(
                                            width: 18.0,
                                            height: 18.0,
                                            child: Stack(
                                              alignment: const AlignmentDirectional(
                                                  0.0, 0.0),
                                              children: [
                                                if (valueOrDefault<bool>(
                                                  _model.allcheck,
                                                  false,
                                                ))
                                                  Container(
                                                    width: 100.0,
                                                    height: 3.0,
                                                    decoration: BoxDecoration(
                                                      color: AppTheme
                                                              .of(context)
                                                          .secondaryBackground,
                                                    ),
                                                  ),
                                                if (!valueOrDefault<bool>(
                                                  _model.allcheck,
                                                  false,
                                                ))
                                                  Icon(
                                                    Icons.check_rounded,
                                                    color: AppTheme.of(
                                                            context)
                                                        .secondaryBackground,
                                                    size: 15.0,
                                                  ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              Flexible(
                                child: Padding(
                                  padding: const EdgeInsetsDirectional.fromSTEB(
                                      8.0, 0.0, 0.0, 0.0),
                                  child: RichText(
                                    textScaler:
                                        MediaQuery.of(context).textScaler,
                                    text: TextSpan(
                                      children: [
                                        TextSpan(
                                          text: AppLocalizations.of(context)
                                              .getText(
                                            'zeup5me6' /* COD:  */,
                                          ),
                                          style: TextStyle(
                                            color: AppTheme.of(context)
                                                .primary,
                                          ),
                                        ),
                                        TextSpan(
                                          text: valueOrDefault<String>(
                                            semSucessoItem.sprintsTasksId
                                                .toString(),
                                            '1',
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
                                                color:
                                                    AppTheme.of(context)
                                                        .primary,
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
                                            'n1azztlj' /*  -  */,
                                          ),
                                          style: const TextStyle(),
                                        ),
                                        TextSpan(
                                          text: valueOrDefault<String>(
                                            semSucessoItem.description,
                                            'txt',
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
      ),
    );
  }
}
