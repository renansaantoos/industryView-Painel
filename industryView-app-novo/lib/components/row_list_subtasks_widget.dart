import '/backend/schema/structs/index.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/core/actions/index.dart' as actions;
import '/core/utils/custom_functions.dart' as functions;
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'row_list_subtasks_model.dart';
export 'row_list_subtasks_model.dart';

class RowListSubtasksWidget extends StatefulWidget {
  const RowListSubtasksWidget({
    super.key,
    this.id,
    this.description,
    this.unityID,
    this.unity,
    this.index,
    bool? checktasks,
    bool? sucesso,
    this.quantity,
    this.comment,
    this.subtaskID,
  })  : this.checktasks = checktasks ?? false,
        this.sucesso = sucesso ?? false;

  final int? id;
  final String? description;
  final int? unityID;
  final String? unity;
  final int? index;
  final bool checktasks;
  final bool sucesso;
  final double? quantity;
  final String? comment;
  final int? subtaskID;

  @override
  State<RowListSubtasksWidget> createState() => _RowListSubtasksWidgetState();
}

class _RowListSubtasksWidgetState extends State<RowListSubtasksWidget> {
  late RowListSubtasksModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => RowListSubtasksModel());

    _model.textController1 ??= TextEditingController(
        text: widget!.quantity != 0.0 ? widget!.quantity?.toString() : '');
    _model.textFieldFocusNode1 ??= FocusNode();

    _model.textController2 ??= TextEditingController(text: widget!.comment);
    _model.textFieldFocusNode2 ??= FocusNode();

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

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.of(context).primaryBackground,
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(8.0),
          bottomRight: Radius.circular(8.0),
          topLeft: Radius.circular(0.0),
          topRight: Radius.circular(0.0),
        ),
      ),
      child: Padding(
        padding: EdgeInsetsDirectional.fromSTEB(32.0, 8.0, 32.0, 8.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (widget!.unityID != 0)
              Column(
                mainAxisSize: MainAxisSize.max,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      Text(
                        AppLocalizations.of(context).getText(
                          'xx2076lf' /* Quantidade executada do dia */,
                        ),
                        style: AppTheme.of(context).bodyMedium.override(
                              font: GoogleFonts.lexend(
                                fontWeight: FontWeight.w500,
                                fontStyle: AppTheme.of(context)
                                    .bodyMedium
                                    .fontStyle,
                              ),
                              fontSize: 10.0,
                              letterSpacing: 0.0,
                              fontWeight: FontWeight.w500,
                              fontStyle: AppTheme.of(context)
                                  .bodyMedium
                                  .fontStyle,
                            ),
                      ),
                    ],
                  ),
                  Padding(
                    padding: EdgeInsetsDirectional.fromSTEB(0.0, 2.0, 0.0, 0.0),
                    child: Row(
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(6.0),
                          ),
                          child: Container(
                            width: 80.0,
                            child: TextFormField(
                              controller: _model.textController1,
                              focusNode: _model.textFieldFocusNode1,
                              onChanged: (_) => EasyDebounce.debounce(
                                '_model.textController1',
                                Duration(milliseconds: 2000),
                                () async {
                                  AppState().updateTaskslistAtIndex(
                                    widget!.index!,
                                    (e) => e
                                      ..quantityDone = double.tryParse(
                                          _model.textController1.text),
                                  );
                                  safeSetState(() {});
                                },
                              ),
                              autofocus: false,
                              readOnly: !widget!.checktasks,
                              obscureText: false,
                              decoration: InputDecoration(
                                isDense: true,
                                labelStyle: AppTheme.of(context)
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
                                      fontSize: 12.0,
                                      letterSpacing: 0.0,
                                      fontWeight: AppTheme.of(context)
                                          .labelMedium
                                          .fontWeight,
                                      fontStyle: AppTheme.of(context)
                                          .labelMedium
                                          .fontStyle,
                                    ),
                                hintText: AppLocalizations.of(context).getText(
                                  'hohczhfj' /* ex: 10000 */,
                                ),
                                hintStyle: AppTheme.of(context)
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
                                      fontSize: 12.0,
                                      letterSpacing: 0.0,
                                      fontWeight: AppTheme.of(context)
                                          .labelMedium
                                          .fontWeight,
                                      fontStyle: AppTheme.of(context)
                                          .labelMedium
                                          .fontStyle,
                                    ),
                                errorStyle: AppTheme.of(context)
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
                                      color: AppTheme.of(context).error,
                                      fontSize: 12.0,
                                      letterSpacing: 0.0,
                                      fontWeight: AppTheme.of(context)
                                          .bodyMedium
                                          .fontWeight,
                                      fontStyle: AppTheme.of(context)
                                          .bodyMedium
                                          .fontStyle,
                                    ),
                                enabledBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: !widget!.checktasks
                                        ? AppTheme.of(context).error
                                        : AppTheme.of(context)
                                            .alternate,
                                    width: 1.0,
                                  ),
                                  borderRadius: BorderRadius.circular(6.0),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: AppTheme.of(context).primary,
                                    width: 1.0,
                                  ),
                                  borderRadius: BorderRadius.circular(6.0),
                                ),
                                errorBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: AppTheme.of(context).error,
                                    width: 1.0,
                                  ),
                                  borderRadius: BorderRadius.circular(6.0),
                                ),
                                focusedErrorBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: AppTheme.of(context).error,
                                    width: 1.0,
                                  ),
                                  borderRadius: BorderRadius.circular(6.0),
                                ),
                                filled: true,
                                fillColor: AppTheme.of(context)
                                    .secondaryBackground,
                              ),
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
                                    fontSize: 12.0,
                                    letterSpacing: 0.0,
                                    fontWeight: AppTheme.of(context)
                                        .bodyMedium
                                        .fontWeight,
                                    fontStyle: AppTheme.of(context)
                                        .bodyMedium
                                        .fontStyle,
                                  ),
                              cursorColor:
                                  AppTheme.of(context).primaryText,
                              enableInteractiveSelection: true,
                              validator: _model.textController1Validator
                                  .asValidator(context),
                            ),
                          ),
                        ),
                        Text(
                          valueOrDefault<String>(
                            widget!.unity,
                            '-',
                          ),
                          style:
                              AppTheme.of(context).bodyMedium.override(
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
                      ].divide(SizedBox(width: 8.0)),
                    ),
                  ),
                  if (!widget!.checktasks && !widget!.sucesso)
                    Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(0.0, 2.0, 0.0, 0.0),
                      child: Text(
                        AppLocalizations.of(context).getText(
                          'sf1akum3' /* Selecione o check-box para pre... */,
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
                              color: AppTheme.of(context).error,
                              fontSize: 10.0,
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
                ].divide(SizedBox(height: 4.0)),
              ),
            Padding(
              padding: EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 0.0, 0.0),
              child: Text(
                AppLocalizations.of(context).getText(
                  '3hj2jbb3' /* Comentários */,
                ),
                style: AppTheme.of(context).bodyMedium.override(
                      font: GoogleFonts.lexend(
                        fontWeight: FontWeight.w500,
                        fontStyle:
                            AppTheme.of(context).bodyMedium.fontStyle,
                      ),
                      letterSpacing: 0.0,
                      fontWeight: FontWeight.w500,
                      fontStyle:
                          AppTheme.of(context).bodyMedium.fontStyle,
                    ),
              ),
            ),
            Column(
              mainAxisSize: MainAxisSize.max,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 4.0, 0.0, 0.0),
                  child: Row(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              0.0,
                              0.0,
                              valueOrDefault<double>(
                                functions.checkFirstComment(
                                            AppState().taskslist.toList(),
                                            widget!.index!) &&
                                        (AppState().taskslist.length > 1)
                                    ? 8.0
                                    : 0.0,
                                0.0,
                              ),
                              0.0),
                          child: Container(
                            width: 200.0,
                            child: TextFormField(
                              controller: _model.textController2,
                              focusNode: _model.textFieldFocusNode2,
                              onChanged: (_) => EasyDebounce.debounce(
                                '_model.textController2',
                                Duration(milliseconds: 2000),
                                () async {
                                  if (functions.hasOnlyOneFirstComment(
                                          AppState().tasksfinish.toList()) ||
                                      functions.checkFirstComment(
                                          AppState().tasksfinish.toList(),
                                          widget!.index!)) {
                                    AppState().updateTaskslistAtIndex(
                                      widget!.index!,
                                      (e) => e
                                        ..comment = _model.textController2.text
                                        ..firstComment = false,
                                    );
                                    safeSetState(() {});
                                  } else {
                                    AppState().updateTaskslistAtIndex(
                                      widget!.index!,
                                      (e) => e
                                        ..comment = _model.textController2.text
                                        ..firstComment = true,
                                    );
                                    safeSetState(() {});
                                  }
                                },
                              ),
                              autofocus: false,
                              enabled: true,
                              readOnly: !widget!.checktasks,
                              obscureText: false,
                              decoration: InputDecoration(
                                isDense: false,
                                labelStyle: AppTheme.of(context)
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
                                hintText: AppLocalizations.of(context).getText(
                                  '42ljkfby' /* Digite o cometário para essa t... */,
                                ),
                                hintStyle: AppTheme.of(context)
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
                                errorStyle: AppTheme.of(context)
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
                                      color: AppTheme.of(context).error,
                                      letterSpacing: 0.0,
                                      fontWeight: AppTheme.of(context)
                                          .bodyMedium
                                          .fontWeight,
                                      fontStyle: AppTheme.of(context)
                                          .bodyMedium
                                          .fontStyle,
                                    ),
                                enabledBorder: OutlineInputBorder(
                                  borderSide: BorderSide(
                                    color: !widget!.checktasks
                                        ? AppTheme.of(context).error
                                        : AppTheme.of(context)
                                            .alternate,
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
                                fillColor: AppTheme.of(context)
                                    .secondaryBackground,
                              ),
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
                              cursorColor:
                                  AppTheme.of(context).primaryText,
                              enableInteractiveSelection: true,
                              validator: _model.textController2Validator
                                  .asValidator(context),
                            ),
                          ),
                        ),
                      ),
                      if (functions.checkFirstComment(
                              AppState().taskslist.toList(),
                              widget!.index!) &&
                          (AppState().tasksfinish.length > 1))
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
                              _model.textController2.text,
                            );
                          },
                        ),
                    ],
                  ),
                ),
              ],
            ),
            if (!widget!.checktasks && !widget!.sucesso)
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 2.0, 0.0, 0.0),
                child: Text(
                  AppLocalizations.of(context).getText(
                    '2fz3x0bl' /* Selecione o check-box para esc... */,
                  ),
                  style: AppTheme.of(context).bodyMedium.override(
                        font: GoogleFonts.lexend(
                          fontWeight: AppTheme.of(context)
                              .bodyMedium
                              .fontWeight,
                          fontStyle:
                              AppTheme.of(context).bodyMedium.fontStyle,
                        ),
                        color: AppTheme.of(context).error,
                        fontSize: 10.0,
                        letterSpacing: 0.0,
                        fontWeight:
                            AppTheme.of(context).bodyMedium.fontWeight,
                        fontStyle:
                            AppTheme.of(context).bodyMedium.fontStyle,
                      ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
