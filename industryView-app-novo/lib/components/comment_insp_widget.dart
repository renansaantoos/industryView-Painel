import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/txt_comment_insp_widget.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'comment_insp_model.dart';
export 'comment_insp_model.dart';

class CommentInspWidget extends StatefulWidget {
  const CommentInspWidget({
    super.key,
    required this.refresh,
  });

  final Future Function()? refresh;

  @override
  State<CommentInspWidget> createState() => _CommentInspWidgetState();
}

class _CommentInspWidgetState extends State<CommentInspWidget> {
  late CommentInspModel _model;

  void _addOfflineMaskForTasks(List<TasksListStruct> tasks) {
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
    _model = createModel(context, () => CommentInspModel());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      AppState().tasksfinish =
          AppState().taskslist.toList().cast<TasksListStruct>();
      safeSetState(() {});
    });

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
      alignment: AlignmentDirectional(0.0, 0.0),
      child: Padding(
        padding: EdgeInsets.all(24.0),
        child: Container(
          width: double.infinity,
          constraints: BoxConstraints(
            maxHeight: double.infinity,
          ),
          decoration: BoxDecoration(
            color: AppTheme.of(context).secondaryBackground,
            borderRadius: BorderRadius.circular(16.0),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.12),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.max,
              children: [
                if (_model.page == 1)
                  Padding(
                    padding:
                        EdgeInsetsDirectional.fromSTEB(24.0, 24.0, 24.0, 24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          decoration: BoxDecoration(),
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.max,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            AppIconButton(
                              borderColor: AppTheme.of(context).primary,
                              borderRadius: 8.0,
                              borderWidth: 1.0,
                              buttonSize: 32.0,
                              fillColor: AppTheme.of(context).secondary,
                              icon: Icon(
                                Icons.keyboard_return,
                                color: AppTheme.of(context).primary,
                                size: 16.0,
                              ),
                              onPressed: () async {
                                context.safePop();
                              },
                            ),
                            Flexible(
                              child: Column(
                                mainAxisSize: MainAxisSize.max,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    AppLocalizations.of(context).getText(
                                      'p8vdi2fm' /* Status da Inspeção */,
                                    ),
                                    style: AppTheme.of(context)
                                        .headlineMedium
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight: FontWeight.w500,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .headlineMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight: FontWeight.w500,
                                          fontStyle:
                                              AppTheme.of(context)
                                                  .headlineMedium
                                                  .fontStyle,
                                        ),
                                  ),
                                  Text(
                                    AppLocalizations.of(context).getText(
                                      'jgmjtq32' /* Selecione se a inspeção foi Ap... */,
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
                                          color: AppTheme.of(context)
                                              .secondaryText,
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
                                ].divide(SizedBox(height: 4.0)),
                              ),
                            ),
                          ].divide(SizedBox(width: 12.0)),
                        ),
                        Row(
                          mainAxisSize: MainAxisSize.max,
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Expanded(
                              child: Align(
                                alignment: AlignmentDirectional(1.0, 1.0),
                                child: AppButton(
                                  onPressed: () async {
                                    _model.page = 2;
                                    safeSetState(() {});
                                  },
                                  text: AppLocalizations.of(context).getText(
                                    'oir64qfo' /* Reprovado */,
                                  ),
                                  options: AppButtonOptions(
                                    width: 200.0,
                                    height: 48.0,
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        16.0, 0.0, 16.0, 0.0),
                                    iconPadding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 0.0, 0.0, 0.0),
                                    color:
                                        AppTheme.of(context).status01,
                                    textStyle: AppTheme.of(context)
                                        .labelMedium
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                AppTheme.of(context)
                                                    .labelMedium
                                                    .fontWeight,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .labelMedium
                                                    .fontStyle,
                                          ),
                                          color: AppTheme.of(context)
                                              .error,
                                          fontSize: 14.0,
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              AppTheme.of(context)
                                                  .labelMedium
                                                  .fontWeight,
                                          fontStyle:
                                              AppTheme.of(context)
                                                  .labelMedium
                                                  .fontStyle,
                                        ),
                                    elevation: 0.0,
                                    borderRadius: BorderRadius.circular(14.0),
                                  ),
                                ),
                              ),
                            ),
                            Expanded(
                              child: Align(
                                alignment: AlignmentDirectional(1.0, 1.0),
                                child: AppButton(
                                  onPressed: () async {
                                    var hasOfflineResponse = false;
                                    for (int loop1Index = 0;
                                        loop1Index <
                                            AppState().taskslist.length;
                                        loop1Index++) {
                                      final currentLoop1Item =
                                          AppState().taskslist[loop1Index];
                                      _model.aprovado = await SprintsGroup
                                          .updateInspectionCall
                                          .call(
                                        sprintsTasksId:
                                            currentLoop1Item.sprintsTasksId,
                                        qualityStatusId: 2,
                                        token: currentAuthenticationToken,
                                      );
                                      if (getJsonField(
                                            _model.aprovado?.jsonBody,
                                            r'''$.offline''',
                                          ) ==
                                          true) {
                                        hasOfflineResponse = true;
                                      }
                                    }
                                    if (hasOfflineResponse) {
                                      _addOfflineMaskForTasks(
                                        AppState().taskslist.toList(),
                                      );
                                    }
                                    await widget.refresh?.call();
                                    AppState().tasksfinish = [];
                                    AppState().taskslist = [];
                                    safeSetState(() {});
                                    Navigator.pop(context);

                                    safeSetState(() {});
                                  },
                                  text: AppLocalizations.of(context).getText(
                                    '9q06rsyo' /* Aprovado */,
                                  ),
                                  options: AppButtonOptions(
                                    width: 200.0,
                                    height: 48.0,
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        16.0, 0.0, 16.0, 0.0),
                                    iconPadding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 0.0, 0.0, 0.0),
                                    color: Color(0xFFD6FFEB),
                                    textStyle: AppTheme.of(context)
                                        .labelMedium
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                AppTheme.of(context)
                                                    .labelMedium
                                                    .fontWeight,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .labelMedium
                                                    .fontStyle,
                                          ),
                                          color: AppTheme.of(context)
                                              .success,
                                          fontSize: 14.0,
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              AppTheme.of(context)
                                                  .labelMedium
                                                  .fontWeight,
                                          fontStyle:
                                              AppTheme.of(context)
                                                  .labelMedium
                                                  .fontStyle,
                                        ),
                                    elevation: 0.0,
                                    borderRadius: BorderRadius.circular(14.0),
                                  ),
                                ),
                              ),
                            ),
                          ].divide(SizedBox(width: 12.0)),
                        ),
                      ].divide(SizedBox(height: 16.0)),
                    ),
                  ),
                if (_model.page == 2)
                  Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.max,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            AppIconButton(
                              borderColor: AppTheme.of(context).primary,
                              borderRadius: 8.0,
                              borderWidth: 1.0,
                              buttonSize: 32.0,
                              fillColor: AppTheme.of(context).secondary,
                              icon: Icon(
                                Icons.keyboard_return,
                                color: AppTheme.of(context).primary,
                                size: 16.0,
                              ),
                              onPressed: () async {
                                context.safePop();
                              },
                            ),
                            Flexible(
                              child: Column(
                                mainAxisSize: MainAxisSize.max,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    AppLocalizations.of(context).getText(
                                      '1qq2uysz' /* Reprovação nas tarefas selecio... */,
                                    ),
                                    style: AppTheme.of(context)
                                        .headlineMedium
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight: FontWeight.w500,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .headlineMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight: FontWeight.w500,
                                          fontStyle:
                                              AppTheme.of(context)
                                                  .headlineMedium
                                                  .fontStyle,
                                        ),
                                  ),
                                  Text(
                                    AppLocalizations.of(context).getText(
                                      'y69hg5nb' /* As tarefas selecionadas foram ... */,
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
                                          color: AppTheme.of(context)
                                              .secondaryText,
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
                                ].divide(SizedBox(height: 4.0)),
                              ),
                            ),
                          ].divide(SizedBox(width: 12.0)),
                        ),
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 24.0, 0.0, 0.0),
                          child: Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Expanded(
                                child: Align(
                                  alignment: AlignmentDirectional(1.0, 1.0),
                                  child: AppButton(
                                    onPressed: () async {
                                      _model.page = 3;
                                      safeSetState(() {});
                                    },
                                    text: AppLocalizations.of(context).getText(
                                      'uuz62wkt' /* Comentar */,
                                    ),
                                    options: AppButtonOptions(
                                      width: 200.0,
                                      height: 48.0,
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          16.0, 0.0, 16.0, 0.0),
                                      iconPadding:
                                          EdgeInsetsDirectional.fromSTEB(
                                              0.0, 0.0, 0.0, 0.0),
                                      color: AppTheme.of(context)
                                          .secondaryBackground,
                                      textStyle: AppTheme.of(context)
                                          .labelMedium
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  AppTheme.of(context)
                                                      .labelMedium
                                                      .fontWeight,
                                              fontStyle:
                                                  AppTheme.of(context)
                                                      .labelMedium
                                                      .fontStyle,
                                            ),
                                            color: AppTheme.of(context)
                                                .primary,
                                            fontSize: 14.0,
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                AppTheme.of(context)
                                                    .labelMedium
                                                    .fontWeight,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .labelMedium
                                                    .fontStyle,
                                          ),
                                      elevation: 0.0,
                                      borderSide: BorderSide(
                                        color: AppTheme.of(context)
                                            .alternate,
                                      ),
                                      borderRadius: BorderRadius.circular(14.0),
                                    ),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: Align(
                                  alignment: AlignmentDirectional(1.0, 1.0),
                                  child: AppButton(
                                    onPressed: () async {
                                      var hasOfflineResponse = false;
                                      for (int loop1Index = 0;
                                          loop1Index <
                                              AppState().taskslist.length;
                                          loop1Index++) {
                                        final currentLoop1Item =
                                            AppState().taskslist[loop1Index];
                                        _model.reprovadoSemComentario =
                                            await SprintsGroup
                                                .updateInspectionCall
                                                .call(
                                          sprintsTasksId:
                                              currentLoop1Item.sprintsTasksId,
                                          qualityStatusId: 3,
                                          token: currentAuthenticationToken,
                                        );
                                        if (getJsonField(
                                              _model.reprovadoSemComentario
                                                  ?.jsonBody,
                                              r'''$.offline''',
                                            ) ==
                                            true) {
                                          hasOfflineResponse = true;
                                        }
                                      }
                                      if (hasOfflineResponse) {
                                        _addOfflineMaskForTasks(
                                          AppState().taskslist.toList(),
                                        );
                                      }
                                      AppState().comment = '';
                                      AppState().taskslist = [];
                                      AppState().tasksfinish = [];
                                      AppState().update(() {});
                                      await widget.refresh?.call();
                                      Navigator.pop(context);

                                      safeSetState(() {});
                                    },
                                    text: AppLocalizations.of(context).getText(
                                      'b350j8ev' /* Finalizar */,
                                    ),
                                    options: AppButtonOptions(
                                      width: 200.0,
                                      height: 48.0,
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          16.0, 0.0, 16.0, 0.0),
                                      iconPadding:
                                          EdgeInsetsDirectional.fromSTEB(
                                              0.0, 0.0, 0.0, 0.0),
                                      color:
                                          AppTheme.of(context).primary,
                                      textStyle: AppTheme.of(context)
                                          .labelMedium
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  AppTheme.of(context)
                                                      .labelMedium
                                                      .fontWeight,
                                              fontStyle:
                                                  AppTheme.of(context)
                                                      .labelMedium
                                                      .fontStyle,
                                            ),
                                            color: AppTheme.of(context)
                                                .secondaryBackground,
                                            fontSize: 14.0,
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                AppTheme.of(context)
                                                    .labelMedium
                                                    .fontWeight,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .labelMedium
                                                    .fontStyle,
                                          ),
                                      elevation: 0.0,
                                      borderRadius: BorderRadius.circular(14.0),
                                    ),
                                  ),
                                ),
                              ),
                            ].divide(SizedBox(width: 12.0)),
                          ),
                        ),
                      ],
                    ),
                  ),
                if (_model.page == 3)
                  Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.max,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            AppIconButton(
                              borderColor: AppTheme.of(context).primary,
                              borderRadius: 8.0,
                              borderWidth: 1.0,
                              buttonSize: 32.0,
                              fillColor: AppTheme.of(context).secondary,
                              icon: Icon(
                                Icons.keyboard_return,
                                color: AppTheme.of(context).primary,
                                size: 16.0,
                              ),
                              onPressed: () async {
                                context.safePop();
                              },
                            ),
                            Flexible(
                              child: Column(
                                mainAxisSize: MainAxisSize.max,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    AppLocalizations.of(context).getText(
                                      'k6lzi8xo' /* Comentários */,
                                    ),
                                    style: AppTheme.of(context)
                                        .headlineMedium
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight: FontWeight.w500,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .headlineMedium
                                                    .fontStyle,
                                          ),
                                          letterSpacing: 0.0,
                                          fontWeight: FontWeight.w500,
                                          fontStyle:
                                              AppTheme.of(context)
                                                  .headlineMedium
                                                  .fontStyle,
                                        ),
                                  ),
                                  Text(
                                    AppLocalizations.of(context).getText(
                                      'dm3dq3q7' /* Você pode adicionar um comentá... */,
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
                                          color: AppTheme.of(context)
                                              .secondaryText,
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
                                ].divide(SizedBox(height: 4.0)),
                              ),
                            ),
                          ].divide(SizedBox(width: 12.0)),
                        ),
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 16.0, 0.0, 0.0),
                          child: Builder(
                            builder: (context) {
                              final tasksInsp =
                                  AppState().tasksfinish.toList();

                              return ListView.separated(
                                padding: EdgeInsets.zero,
                                shrinkWrap: true,
                                scrollDirection: Axis.vertical,
                                itemCount: tasksInsp.length,
                                separatorBuilder: (_, __) =>
                                    SizedBox(height: 8.0),
                                itemBuilder: (context, tasksInspIndex) {
                                  final tasksInspItem =
                                      tasksInsp[tasksInspIndex];
                                  return Column(
                                    mainAxisSize: MainAxisSize.max,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      RichText(
                                        textScaler:
                                            MediaQuery.of(context).textScaler,
                                        text: TextSpan(
                                          children: [
                                            TextSpan(
                                              text:
                                                  'COD: ${tasksInspItem.sprintsTasksId.toString()}',
                                              style: AppTheme.of(
                                                      context)
                                                  .labelSmall
                                                  .override(
                                                    font: GoogleFonts.lexend(
                                                      fontWeight:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontStyle,
                                                    ),
                                                    color: AppTheme.of(
                                                            context)
                                                        .primary,
                                                    letterSpacing: 0.0,
                                                    fontWeight:
                                                        AppTheme.of(
                                                                context)
                                                            .labelSmall
                                                            .fontWeight,
                                                    fontStyle:
                                                        AppTheme.of(
                                                                context)
                                                            .labelSmall
                                                            .fontStyle,
                                                  ),
                                            ),
                                            TextSpan(
                                              text: AppLocalizations.of(context)
                                                  .getText(
                                                's3q5mjdd' /*   -  */,
                                              ),
                                              style: TextStyle(),
                                            ),
                                            TextSpan(
                                              text: valueOrDefault<String>(
                                                tasksInspItem.description,
                                                '-',
                                              ),
                                              style: AppTheme.of(
                                                      context)
                                                  .labelLarge
                                                  .override(
                                                    font: GoogleFonts.lexend(
                                                      fontWeight:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelLarge
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelLarge
                                                              .fontStyle,
                                                    ),
                                                    color: AppTheme.of(
                                                            context)
                                                        .primaryText,
                                                    letterSpacing: 0.0,
                                                    fontWeight:
                                                        AppTheme.of(
                                                                context)
                                                            .labelLarge
                                                            .fontWeight,
                                                    fontStyle:
                                                        AppTheme.of(
                                                                context)
                                                            .labelLarge
                                                            .fontStyle,
                                                  ),
                                            )
                                          ],
                                          style: AppTheme.of(context)
                                              .labelSmall
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight:
                                                      AppTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontWeight,
                                                  fontStyle:
                                                      AppTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontStyle,
                                                ),
                                                color:
                                                    AppTheme.of(context)
                                                        .primaryText,
                                                letterSpacing: 0.0,
                                                fontWeight:
                                                    AppTheme.of(context)
                                                        .labelSmall
                                                        .fontWeight,
                                                fontStyle:
                                                    AppTheme.of(context)
                                                        .labelSmall
                                                        .fontStyle,
                                              ),
                                        ),
                                      ),
                                      TxtCommentInspWidget(
                                        key: Key(
                                            'Keyjil_${tasksInspIndex}_of_${tasksInsp.length}'),
                                        index: tasksInspIndex,
                                      ),
                                      Divider(
                                        thickness: 1.0,
                                        color: AppTheme.of(context)
                                            .alternate,
                                      ),
                                    ].divide(SizedBox(height: 8.0)),
                                  );
                                },
                              );
                            },
                          ),
                        ),
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 24.0, 0.0, 0.0),
                          child: AppButton(
                            onPressed: () async {
                              var hasOfflineResponse = false;
                              for (int loop1Index = 0;
                                  loop1Index < AppState().taskslist.length;
                                  loop1Index++) {
                                final currentLoop1Item =
                                    AppState().taskslist[loop1Index];
                                _model.reprovadoComComentario =
                                    await SprintsGroup.updateInspectionCall
                                        .call(
                                  sprintsTasksId:
                                      currentLoop1Item.sprintsTasksId,
                                  qualityStatusId: 3,
                                  token: currentAuthenticationToken,
                                  comment: currentLoop1Item.comment,
                                );
                                if (getJsonField(
                                      _model.reprovadoComComentario?.jsonBody,
                                      r'''$.offline''',
                                    ) ==
                                    true) {
                                  hasOfflineResponse = true;
                                }
                              }
                              if (hasOfflineResponse) {
                                _addOfflineMaskForTasks(
                                  AppState().taskslist.toList(),
                                );
                              }
                              AppState().comment = '';
                              AppState().taskslist = [];
                              AppState().tasksfinish = [];
                              AppState().update(() {});
                              await widget.refresh?.call();
                              Navigator.pop(context);

                              safeSetState(() {});
                            },
                            text: AppLocalizations.of(context).getText(
                              '2gcbyrzc' /* Finalizar */,
                            ),
                            options: AppButtonOptions(
                              width: double.infinity,
                              height: 48.0,
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 0.0, 16.0, 0.0),
                              iconPadding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 0.0, 0.0),
                              color: AppTheme.of(context).primary,
                              textStyle: AppTheme.of(context)
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
                                    color: AppTheme.of(context)
                                        .secondaryBackground,
                                    fontSize: 14.0,
                                    letterSpacing: 0.0,
                                    fontWeight: AppTheme.of(context)
                                        .labelMedium
                                        .fontWeight,
                                    fontStyle: AppTheme.of(context)
                                        .labelMedium
                                        .fontStyle,
                                  ),
                              elevation: 0.0,
                              borderRadius: BorderRadius.circular(14.0),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
