import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/calendar_widget.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:provider/provider.dart';
import 'modal_sprints_filtro_model.dart';
export 'modal_sprints_filtro_model.dart';

class ModalSprintsFiltroWidget extends StatefulWidget {
  const ModalSprintsFiltroWidget({
    super.key,
    required this.action1,
  });

  final Future Function()? action1;

  @override
  State<ModalSprintsFiltroWidget> createState() =>
      _ModalSprintsFiltroWidgetState();
}

class _ModalSprintsFiltroWidgetState extends State<ModalSprintsFiltroWidget> {
  late ModalSprintsFiltroModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalSprintsFiltroModel());

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

    double _normalizeProgress(dynamic raw) {
      final numValue = raw is num
          ? raw.toDouble()
          : double.tryParse(raw?.toString() ?? '') ?? 0.0;
      final normalized = numValue > 1 ? numValue / 100 : numValue;
      return normalized.clamp(0.0, 1.0);
    }

    double _displayProgress(dynamic raw) {
      final numValue = raw is num
          ? raw.toDouble()
          : double.tryParse(raw?.toString() ?? '') ?? 0.0;
      return numValue > 1 ? numValue : (numValue * 100);
    }

    return Align(
      alignment: AlignmentDirectional(0.0, 0.0),
      child: Padding(
        padding: EdgeInsets.all(24.0),
        child: Container(
          width: 490.0,
          constraints: BoxConstraints(
            maxHeight: 460.0,
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
          child: Padding(
            padding: EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Expanded(
                      child: Text(
                        AppLocalizations.of(context).getText(
                          'pzb8y9q2' /* Filtre por sprints */,
                        ),
                        style: AppTheme.of(context).titleLarge.override(
                              font: GoogleFonts.lexend(
                                fontWeight: AppTheme.of(context)
                                    .titleLarge
                                    .fontWeight,
                                fontStyle: AppTheme.of(context)
                                    .titleLarge
                                    .fontStyle,
                              ),
                              letterSpacing: 0.0,
                              fontWeight: AppTheme.of(context)
                                  .titleLarge
                                  .fontWeight,
                              fontStyle: AppTheme.of(context)
                                  .titleLarge
                                  .fontStyle,
                            ),
                      ),
                    ),
                    Align(
                      alignment: AlignmentDirectional(1.0, -1.0),
                      child: AppIconButton(
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
                    ),
                  ],
                ),
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 16.0, 0.0, 0.0),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Flexible(
                        child: Text(
                          AppLocalizations.of(context).getText(
                            'r0k0lwsl' /* Filtre por data e depois selec... */,
                          ),
                          style:
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
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 16.0, 0.0, 0.0),
                  child: Row(
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      if (!AppState().filterSprint)
                        Builder(
                          builder: (context) => InkWell(
                            splashColor: Colors.transparent,
                            focusColor: Colors.transparent,
                            hoverColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () async {
                              await showDialog(
                                context: context,
                                builder: (dialogContext) {
                                  return Dialog(
                                    elevation: 0,
                                    insetPadding: EdgeInsets.zero,
                                    backgroundColor: Colors.transparent,
                                    alignment: AlignmentDirectional(0.0, 0.0)
                                        .resolve(Directionality.of(context)),
                                    child: CalendarWidget(
                                      action: () async {
                                        safeSetState(() =>
                                            _model.apiRequestCompleter = null);
                                        await _model
                                            .waitForApiRequestCompleted();
                                      },
                                    ),
                                  );
                                },
                              );
                            },
                            child: Container(
                              height: 44.0,
                              decoration: BoxDecoration(
                                color: AppTheme.of(context)
                                    .primaryBackground,
                                borderRadius: BorderRadius.circular(14.0),
                                border: Border.all(
                                  color: AppTheme.of(context).alternate,
                                ),
                              ),
                              child: Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    16.0, 0.0, 16.0, 0.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      AppLocalizations.of(context).getText(
                                        '0w4u62um' /* Selecione um período de datas */,
                                      ),
                                      style: AppTheme.of(context)
                                          .labelSmall
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  AppTheme.of(context)
                                                      .labelSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  AppTheme.of(context)
                                                      .labelSmall
                                                      .fontStyle,
                                            ),
                                            color: AppTheme.of(context)
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
                                    Icon(
                                      Icons.calendar_month,
                                      color: AppTheme.of(context)
                                          .primaryText,
                                      size: 18.0,
                                    ),
                                  ].divide(SizedBox(width: 8.0)),
                                ),
                              ),
                            ),
                          ),
                        ),
                      if (AppState().filterSprint)
                        Builder(
                          builder: (context) => InkWell(
                            splashColor: Colors.transparent,
                            focusColor: Colors.transparent,
                            hoverColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () async {
                              await showDialog(
                                context: context,
                                builder: (dialogContext) {
                                  return Dialog(
                                    elevation: 0,
                                    insetPadding: EdgeInsets.zero,
                                    backgroundColor: Colors.transparent,
                                    alignment: AlignmentDirectional(0.0, 0.0)
                                        .resolve(Directionality.of(context)),
                                    child: CalendarWidget(
                                      action: () async {
                                        safeSetState(() =>
                                            _model.apiRequestCompleter = null);
                                        await _model
                                            .waitForApiRequestCompleted();
                                      },
                                    ),
                                  );
                                },
                              );
                            },
                            child: Container(
                              height: 44.0,
                              decoration: BoxDecoration(
                                color: AppTheme.of(context).secondary,
                                borderRadius: BorderRadius.circular(14.0),
                                border: Border.all(
                                  color: AppTheme.of(context).primary,
                                ),
                              ),
                              child: Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    16.0, 0.0, 16.0, 0.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      '${dateTimeFormat(
                                        "d/M/y",
                                        AppState().datesPicked.firstOrNull,
                                        locale: AppLocalizations.of(context)
                                            .languageCode,
                                      )}${AppLocalizations.of(context).getVariableText(
                                        ptText: ' até ',
                                        esText: ' hasta ',
                                        enText: ' until ',
                                      )}${dateTimeFormat(
                                        "d/M/y",
                                        AppState().datesPicked.lastOrNull,
                                        locale: AppLocalizations.of(context)
                                            .languageCode,
                                      )}',
                                      style: AppTheme.of(context)
                                          .labelSmall
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  AppTheme.of(context)
                                                      .labelSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  AppTheme.of(context)
                                                      .labelSmall
                                                      .fontStyle,
                                            ),
                                            color: AppTheme.of(context)
                                                .primary,
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
                                    Icon(
                                      Icons.calendar_month,
                                      color:
                                          AppTheme.of(context).primary,
                                      size: 18.0,
                                    ),
                                  ].divide(SizedBox(width: 8.0)),
                                ),
                              ),
                            ),
                          ),
                        ),
                      if (AppState().filterSprint)
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(
                              4.0, 0.0, 0.0, 0.0),
                          child: AppIconButton(
                            borderColor: AppTheme.of(context).error,
                            borderRadius: 12.0,
                            borderWidth: 0.5,
                            buttonSize: 36.0,
                            fillColor: AppTheme.of(context).status01,
                            icon: Icon(
                              Icons.filter_list_off,
                              color: AppTheme.of(context).error,
                              size: 18.0,
                            ),
                            onPressed: () async {
                              AppState().datesPicked = [];
                              AppState().filterSprint = false;
                              AppState().filterSprint01 = FiltersStruct();
                              AppState().setado = false;
                              safeSetState(() {});
                              safeSetState(
                                  () => _model.apiRequestCompleter = null);
                              await _model.waitForApiRequestCompleted();
                            },
                          ),
                        ),
                    ],
                  ),
                ),
                if (AppState().filterSprint)
                  Flexible(
                    child: Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(0.0, 8.0, 0.0, 0.0),
                      child: SingleChildScrollView(
                        child: Column(
                          mainAxisSize: MainAxisSize.max,
                          children: [
                            FutureBuilder<ApiCallResponse>(
                              future: (_model.apiRequestCompleter ??= Completer<
                                      ApiCallResponse>()
                                    ..complete(
                                        SprintsGroup.getSprintAtivaCall.call(
                                      page: _model.page,
                                      perPage: _model.perPage,
                                      projectsId: AppState().user.projectId,
                                      token: currentAuthenticationToken,
                                      dtStart: AppState()
                                          .datesPicked
                                          .firstOrNull
                                          ?.millisecondsSinceEpoch,
                                      dtEnd: AppState()
                                          .datesPicked
                                          .lastOrNull
                                          ?.millisecondsSinceEpoch,
                                    )))
                                  .future,
                              builder: (context, snapshot) {
                                // Customize what your widget looks like when it's loading.
                                if (!snapshot.hasData) {
                                  return Center(
                                    child: SizedBox(
                                      width: 50.0,
                                      height: 50.0,
                                      child: CircularProgressIndicator(
                                        valueColor:
                                            AlwaysStoppedAnimation<Color>(
                                          AppTheme.of(context).primary,
                                        ),
                                      ),
                                    ),
                                  );
                                }
                                final containerGetSprintAtivaResponse =
                                    snapshot.data!;

                                return Container(
                                  decoration: BoxDecoration(),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Builder(
                                        builder: (context) {
                                          final list =
                                              SprintsGroup.getSprintAtivaCall
                                                      .listConcluidas(
                                                        containerGetSprintAtivaResponse
                                                            .jsonBody,
                                                      )
                                                      ?.toList() ??
                                                  [];

                                          return ListView.separated(
                                            padding: EdgeInsets.zero,
                                            shrinkWrap: true,
                                            scrollDirection: Axis.vertical,
                                            itemCount: list.length,
                                            separatorBuilder: (_, __) =>
                                                SizedBox(height: 0.0),
                                            itemBuilder: (context, listIndex) {
                                              final listItem = list[listIndex];
                                              return Padding(
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        0.0, 0.0, 0.0, 8.0),
                                                child: InkWell(
                                                  splashColor:
                                                      Colors.transparent,
                                                  focusColor:
                                                      Colors.transparent,
                                                  hoverColor:
                                                      Colors.transparent,
                                                  highlightColor:
                                                      Colors.transparent,
                                                  onTap: () async {
                                                    _model.id = getJsonField(
                                                      listItem,
                                                      r'''$.id''',
                                                    );
                                                    _model.title = getJsonField(
                                                      listItem,
                                                      r'''$.title''',
                                                    ).toString();
                                                    _model.objective =
                                                        getJsonField(
                                                      listItem,
                                                      r'''$.objective''',
                                                    ).toString();
                                                    _model.progress =
                                                        getJsonField(
                                                      listItem,
                                                      r'''$.progress_percentage''',
                                                    );
                                                    _model.endDate =
                                                        getJsonField(
                                                      listItem,
                                                      r'''$.end_date''',
                                                    );
                                                    _model.startDate =
                                                        getJsonField(
                                                      listItem,
                                                      r'''$.start_date''',
                                                    );
                                                    _model.projectsId =
                                                        getJsonField(
                                                      listItem,
                                                      r'''$.projects_id''',
                                                    );
                                                    _model.sprintsStatusesId =
                                                        getJsonField(
                                                      listItem,
                                                      r'''$.sprints_statuses_id''',
                                                    );
                                                    _model.setado = true;
                                                    safeSetState(() {});
                                                    AppState().setado = true;
                                                    safeSetState(() {});
                                                  },
                                                  child: Container(
                                                    width: 400.0,
                                                    decoration: BoxDecoration(
                                                      color: (_model.id ==
                                                                  getJsonField(
                                                                    listItem,
                                                                    r'''$.id''',
                                                                  )) ||
                                                              (AppState()
                                                                      .sprints
                                                                      .id ==
                                                                  getJsonField(
                                                                    listItem,
                                                                    r'''$.id''',
                                                                  ))
                                                          ? AppTheme.of(
                                                                  context)
                                                              .status03
                                                          : AppTheme.of(
                                                                  context)
                                                              .primaryBackground,
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              12.0),
                                                      border: Border.all(
                                                        color: valueOrDefault<
                                                            Color>(
                                                          (_model.id ==
                                                                      getJsonField(
                                                                        listItem,
                                                                        r'''$.id''',
                                                                      )) ||
                                                                  (AppState()
                                                                          .sprints
                                                                          .id ==
                                                                      getJsonField(
                                                                        listItem,
                                                                        r'''$.id''',
                                                                      ))
                                                              ? AppTheme
                                                                      .of(
                                                                          context)
                                                                  .primary
                                                              : AppTheme
                                                                      .of(context)
                                                                  .alternate,
                                                          AppTheme.of(
                                                                  context)
                                                              .alternate,
                                                        ),
                                                      ),
                                                    ),
                                                    child: Padding(
                                                      padding:
                                                          EdgeInsetsDirectional
                                                              .fromSTEB(
                                                                  12.0,
                                                                  8.0,
                                                                  12.0,
                                                                  8.0),
                                                      child: Row(
                                                        mainAxisSize:
                                                            MainAxisSize.min,
                                                        children: [
                                                          CircularPercentIndicator(
                                                            percent:
                                                                _normalizeProgress(
                                                              getJsonField(
                                                                listItem,
                                                                r'''$.progress_percentage''',
                                                              ),
                                                            ),
                                                            radius: 20.0,
                                                            lineWidth: 2.0,
                                                            animation: true,
                                                            animateFromLastPercent:
                                                                true,
                                                            progressColor:
                                                                AppTheme.of(
                                                                        context)
                                                                    .primary,
                                                            backgroundColor:
                                                                AppTheme.of(
                                                                        context)
                                                                    .alternate,
                                                            center: Text(
                                                              (double var1) {
                                                                return '${(var1 * 100).toStringAsFixed(1)}%';
                                                              }(_displayProgress(
                                                                getJsonField(
                                                                  listItem,
                                                                  r'''$.progress_percentage''',
                                                                ),
                                                              ) /
                                                                  100),
                                                              style: AppTheme
                                                                      .of(context)
                                                                  .labelSmall
                                                                  .override(
                                                                    font: GoogleFonts
                                                                        .lexend(
                                                                      fontWeight: AppTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .fontWeight,
                                                                      fontStyle: AppTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .fontStyle,
                                                                    ),
                                                                    letterSpacing:
                                                                        0.0,
                                                                    fontWeight: AppTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .fontWeight,
                                                                    fontStyle: AppTheme.of(
                                                                            context)
                                                                        .labelSmall
                                                                        .fontStyle,
                                                                  ),
                                                            ),
                                                          ),
                                                          Column(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .min,
                                                            crossAxisAlignment:
                                                                CrossAxisAlignment
                                                                    .start,
                                                            children: [
                                                              Row(
                                                                mainAxisSize:
                                                                    MainAxisSize
                                                                        .max,
                                                                children: [
                                                                  Align(
                                                                    alignment:
                                                                        AlignmentDirectional(
                                                                            -1.0,
                                                                            1.0),
                                                                    child: Text(
                                                                      valueOrDefault<
                                                                          String>(
                                                                        getJsonField(
                                                                          listItem,
                                                                          r'''$.title''',
                                                                        )?.toString(),
                                                                        ' - ',
                                                                      ),
                                                                      style: AppTheme.of(
                                                                              context)
                                                                          .labelLarge
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.lexend(
                                                                              fontWeight: AppTheme.of(context).labelLarge.fontWeight,
                                                                              fontStyle: AppTheme.of(context).labelLarge.fontStyle,
                                                                            ),
                                                                            color:
                                                                                AppTheme.of(context).primaryText,
                                                                            fontSize:
                                                                                14.0,
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                AppTheme.of(context).labelLarge.fontWeight,
                                                                            fontStyle:
                                                                                AppTheme.of(context).labelLarge.fontStyle,
                                                                          ),
                                                                    ),
                                                                  ),
                                                                ].divide(SizedBox(
                                                                    width:
                                                                        8.0)),
                                                              ),
                                                              Align(
                                                                alignment:
                                                                    AlignmentDirectional(
                                                                        -1.0,
                                                                        1.0),
                                                                child: Text(
                                                                  '${valueOrDefault<String>(
                                                                    dateTimeFormat(
                                                                      "d/M/y",
                                                                      DateTime.fromMillisecondsSinceEpoch(
                                                                          getJsonField(
                                                                        listItem,
                                                                        r'''$.start_date''',
                                                                      )),
                                                                      locale: AppLocalizations.of(
                                                                              context)
                                                                          .languageCode,
                                                                    ),
                                                                    '0',
                                                                  )}${AppLocalizations.of(context).getVariableText(
                                                                    ptText:
                                                                        ' até ',
                                                                    esText:
                                                                        ' hasta ',
                                                                    enText:
                                                                        ' until ',
                                                                  )}${valueOrDefault<String>(
                                                                    dateTimeFormat(
                                                                      "d/M/y",
                                                                      DateTime.fromMillisecondsSinceEpoch(
                                                                          getJsonField(
                                                                        listItem,
                                                                        r'''$.end_date''',
                                                                      )),
                                                                      locale: AppLocalizations.of(
                                                                              context)
                                                                          .languageCode,
                                                                    ),
                                                                    '0',
                                                                  )}',
                                                                  style: AppTheme.of(
                                                                          context)
                                                                      .labelLarge
                                                                      .override(
                                                                        font: GoogleFonts
                                                                            .lexend(
                                                                          fontWeight: AppTheme.of(context)
                                                                              .labelLarge
                                                                              .fontWeight,
                                                                          fontStyle: AppTheme.of(context)
                                                                              .labelLarge
                                                                              .fontStyle,
                                                                        ),
                                                                        color: AppTheme.of(context)
                                                                            .primary,
                                                                        fontSize:
                                                                            14.0,
                                                                        letterSpacing:
                                                                            0.0,
                                                                        fontWeight: AppTheme.of(context)
                                                                            .labelLarge
                                                                            .fontWeight,
                                                                        fontStyle: AppTheme.of(context)
                                                                            .labelLarge
                                                                            .fontStyle,
                                                                      ),
                                                                ),
                                                              ),
                                                              Text(
                                                                valueOrDefault<
                                                                    String>(
                                                                  getJsonField(
                                                                    listItem,
                                                                    r'''$.objective''',
                                                                  )?.toString(),
                                                                  ' - ',
                                                                ).maybeHandleOverflow(
                                                                  maxChars: 25,
                                                                  replacement:
                                                                      '…',
                                                                ),
                                                                style: AppTheme.of(
                                                                        context)
                                                                    .labelMedium
                                                                    .override(
                                                                      font: GoogleFonts
                                                                          .lexend(
                                                                        fontWeight: AppTheme.of(context)
                                                                            .labelMedium
                                                                            .fontWeight,
                                                                        fontStyle: AppTheme.of(context)
                                                                            .labelMedium
                                                                            .fontStyle,
                                                                      ),
                                                                      color: AppTheme.of(
                                                                              context)
                                                                          .secondaryText,
                                                                      letterSpacing:
                                                                          0.0,
                                                                      fontWeight: AppTheme.of(
                                                                              context)
                                                                          .labelMedium
                                                                          .fontWeight,
                                                                      fontStyle: AppTheme.of(
                                                                              context)
                                                                          .labelMedium
                                                                          .fontStyle,
                                                                    ),
                                                              ),
                                                            ],
                                                          ),
                                                        ].divide(SizedBox(
                                                            width: 8.0)),
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              );
                                            },
                                          );
                                        },
                                      ),
                                      if (_model.page <
                                          getJsonField(
                                            containerGetSprintAtivaResponse
                                                .jsonBody,
                                            r'''$.sprints_concluida.pageTotal''',
                                          ))
                                        Align(
                                          alignment:
                                              AlignmentDirectional(-1.0, 0.0),
                                          child: Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    0.0, 16.0, 0.0, 0.0),
                                            child: AppButton(
                                              onPressed: () async {
                                                _model.perPage =
                                                    _model.perPage + 10;
                                                safeSetState(() {});
                                                safeSetState(() =>
                                                    _model.apiRequestCompleter =
                                                        null);
                                                await _model
                                                    .waitForApiRequestCompleted();
                                              },
                                              text: AppLocalizations.of(context)
                                                  .getText(
                                                'h05kq77r' /* Ver mais */,
                                              ),
                                              options: AppButtonOptions(
                                                height: 32.0,
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        16.0, 0.0, 16.0, 0.0),
                                                iconPadding:
                                                    EdgeInsetsDirectional
                                                        .fromSTEB(
                                                            0.0, 0.0, 0.0, 0.0),
                                                color:
                                                    AppTheme.of(context)
                                                        .secondary,
                                                textStyle: AppTheme.of(
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
                                                      color:
                                                          AppTheme.of(
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
                                                elevation: 0.0,
                                                borderSide: BorderSide(
                                                  color: AppTheme.of(
                                                          context)
                                                      .primary,
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(14.0),
                                              ),
                                            ),
                                          ),
                                        ),
                                    ],
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 16.0, 0.0, 0.0),
                  child: AppButton(
                    onPressed: (!AppState().setado || _model.id == null)
                        ? null
                        : () async {
                            _model.erroData = false;
                            safeSetState(() {});
                            if (AppState().setado) {
                              AppState().filterSprint01 = FiltersStruct(
                                id: _model.id,
                                name: _model.title,
                              );
                              AppState().sprints = SprintsStruct(
                                id: _model.id,
                                title: _model.title,
                                objective: _model.objective,
                                startDate: _model.startDate,
                                endDate: _model.endDate,
                                progressPercentage: _model.progress,
                              );
                              safeSetState(() {});
                              await widget.action1?.call();
                              Navigator.pop(context);
                            } else {
                              _model.erroData = true;
                              safeSetState(() {});
                              return;
                            }
                          },
                    text: AppLocalizations.of(context).getText(
                      'rbp40dih' /* Filtrar */,
                    ),
                    options: AppButtonOptions(
                      width: MediaQuery.sizeOf(context).width * 1.0,
                      height: 48.0,
                      padding:
                          EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                      iconPadding:
                          EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      color: AppTheme.of(context).primary,
                      textStyle:
                          AppTheme.of(context).titleSmall.override(
                                font: GoogleFonts.lexend(
                                  fontWeight: AppTheme.of(context)
                                      .titleSmall
                                      .fontWeight,
                                  fontStyle: AppTheme.of(context)
                                      .titleSmall
                                      .fontStyle,
                                ),
                                color: Colors.white,
                                letterSpacing: 0.0,
                                fontWeight: AppTheme.of(context)
                                    .titleSmall
                                    .fontWeight,
                                fontStyle: AppTheme.of(context)
                                    .titleSmall
                                    .fontStyle,
                              ),
                      elevation: 0.0,
                      borderRadius: BorderRadius.circular(14.0),
                      disabledColor: AppTheme.of(context).alternate,
                      disabledTextColor:
                          AppTheme.of(context).secondaryText,
                    ),
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
