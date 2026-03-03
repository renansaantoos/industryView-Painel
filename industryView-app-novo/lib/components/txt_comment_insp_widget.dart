import '/backend/schema/structs/index.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/core/actions/index.dart' as actions;
import '/core/utils/custom_functions.dart' as functions;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'txt_comment_insp_model.dart';
export 'txt_comment_insp_model.dart';

class TxtCommentInspWidget extends StatefulWidget {
  const TxtCommentInspWidget({
    super.key,
    this.index,
  });

  final int? index;

  @override
  State<TxtCommentInspWidget> createState() => _TxtCommentInspWidgetState();
}

class _TxtCommentInspWidgetState extends State<TxtCommentInspWidget> {
  late TxtCommentInspModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => TxtCommentInspModel());

    _model.textController ??= TextEditingController();
    _model.textFieldFocusNode ??= FocusNode();

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

    return Row(
      mainAxisSize: MainAxisSize.max,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Padding(
            padding: EdgeInsetsDirectional.fromSTEB(
                0.0,
                0.0,
                valueOrDefault<double>(
                  functions.checkFirstComment(AppState().tasksfinish.toList(),
                              widget!.index!) &&
                          (AppState().taskslist.length > 1)
                      ? 8.0
                      : 0.0,
                  0.0,
                ),
                0.0),
            child: Container(
              width: 100.0,
              child: TextFormField(
                controller: _model.textController,
                focusNode: _model.textFieldFocusNode,
                onFieldSubmitted: (_) async {
                  AppState().updateTasksfinishAtIndex(
                    widget!.index!,
                    (e) => e..comment = _model.textController.text,
                  );
                  safeSetState(() {});
                },
                autofocus: false,
                enabled: true,
                obscureText: false,
                decoration: InputDecoration(
                  isDense: true,
                  labelStyle: AppTheme.of(context).labelMedium.override(
                        font: GoogleFonts.lexend(
                          fontWeight: AppTheme.of(context)
                              .labelMedium
                              .fontWeight,
                          fontStyle: AppTheme.of(context)
                              .labelMedium
                              .fontStyle,
                        ),
                        letterSpacing: 0.0,
                        fontWeight:
                            AppTheme.of(context).labelMedium.fontWeight,
                        fontStyle:
                            AppTheme.of(context).labelMedium.fontStyle,
                      ),
                  hintText: AppLocalizations.of(context).getText(
                    'kd3hxhke' /* Comentario da tarefa */,
                  ),
                  hintStyle: AppTheme.of(context).labelMedium.override(
                        font: GoogleFonts.lexend(
                          fontWeight: AppTheme.of(context)
                              .labelMedium
                              .fontWeight,
                          fontStyle: AppTheme.of(context)
                              .labelMedium
                              .fontStyle,
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
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                      color: AppTheme.of(context).primary,
                      width: 1.0,
                    ),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  errorBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                      color: AppTheme.of(context).error,
                      width: 1.0,
                    ),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  focusedErrorBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                      color: AppTheme.of(context).error,
                      width: 1.0,
                    ),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  filled: true,
                  fillColor: AppTheme.of(context).secondaryBackground,
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
                cursorColor: AppTheme.of(context).primaryText,
                enableInteractiveSelection: true,
                validator: _model.textControllerValidator.asValidator(context),
              ),
            ),
          ),
        ),
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (functions.checkFirstComment(
                    AppState().tasksfinish.toList(), widget!.index!) &&
                (AppState().taskslist.length > 1))
              AppIconButton(
                borderRadius: 8.0,
                buttonSize: 32.0,
                fillColor: AppTheme.of(context).primary,
                icon: Icon(
                  Icons.repeat,
                  color: AppTheme.of(context).info,
                  size: 16.0,
                ),
                onPressed: () async {
                  await actions.updateAllComments(
                    _model.textController.text,
                  );
                },
              ),
          ],
        ),
      ],
    );
  }
}
