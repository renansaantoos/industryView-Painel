import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/nav_bar_widget.dart';
import '/components/offline_banner_widget.dart';
import '/components/modal_comment_widget.dart';
import '/widgets/sync_indicator_widget.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/index.dart';
import 'dart:async';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'detalhes_da_tarefa_model.dart';
export 'detalhes_da_tarefa_model.dart';

class DetalhesDaTarefaWidget extends StatefulWidget {
  const DetalhesDaTarefaWidget({
    super.key,
    this.item,
  });

  final dynamic item;

  static String routeName = 'DetalhesDaTarefa';
  static String routePath = '/detalhesDaTarefa';

  @override
  State<DetalhesDaTarefaWidget> createState() => _DetalhesDaTarefaWidgetState();
}

class _DetalhesDaTarefaWidgetState extends State<DetalhesDaTarefaWidget> {
  late DetalhesDaTarefaModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => DetalhesDaTarefaModel());

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _model.validTokenCopy = await AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall
          .call(
        bearerAuth: currentAuthenticationToken,
      );

      if ((_model.validTokenCopy?.succeeded ?? true)) {
        return;
      }

      AppState().loading = false;
      safeSetState(() {});
      return;
    });

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<AppState>();

    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: AppTheme.of(context).secondaryBackground,
        appBar: AppBar(
          backgroundColor: AppTheme.of(context).secondaryBackground,
          automaticallyImplyLeading: false,
          actions: const [
            Padding(
              padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 12.0, 0.0),
              child: SyncIndicatorWidget(
                showText: false,
                size: 20.0,
              ),
            ),
          ],
          title: Padding(
            padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 0.0, 0.0),
            child: Row(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                AppIconButton(
                  borderColor: AppTheme.of(context).primary,
                  borderRadius: 8.0,
                  buttonSize: 32.0,
                  fillColor: AppTheme.of(context).secondary,
                  icon: Icon(
                    Icons.arrow_back,
                    color: AppTheme.of(context).primary,
                    size: 16.0,
                  ),
                  onPressed: () async {
                    AppState().update(() {});
                    context.safePop();
                  },
                ),
                Text(
                  'COD: ${valueOrDefault<String>(
                    getJsonField(
                      widget!.item,
                      r'''$.id''',
                    )?.toString(),
                    ' - ',
                  )}',
                  style: AppTheme.of(context).headlineSmall.override(
                        font: GoogleFonts.lexend(
                          fontWeight: AppTheme.of(context)
                              .headlineSmall
                              .fontWeight,
                          fontStyle: AppTheme.of(context)
                              .headlineSmall
                              .fontStyle,
                        ),
                        color: AppTheme.of(context).primary,
                        letterSpacing: 0.0,
                        fontWeight: AppTheme.of(context)
                            .headlineSmall
                            .fontWeight,
                        fontStyle: AppTheme.of(context)
                            .headlineSmall
                            .fontStyle,
                      ),
                ),
                Container(
                  width: 32.0,
                  height: 32.0,
                  decoration: BoxDecoration(
                    color: AppTheme.of(context).secondaryBackground,
                  ),
                ),
              ].divide(SizedBox(width: 12.0)),
            ),
          ),
          centerTitle: false,
          elevation: 0.0,
        ),
        body: SafeArea(
          top: true,
          child: Stack(
            children: [
              Align(
                alignment: AlignmentDirectional(0.0, 0.0),
                child: Padding(
                  padding:
                      EdgeInsetsDirectional.fromSTEB(24.0, 8.0, 24.0, 24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const OfflineBannerWidget(),
                      Row(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              color: () {
                                if (AppConstants.um ==
                                    getJsonField(
                                      widget!.item,
                                      r'''$.projects_backlogs.equipaments_types_id''',
                                    )) {
                                  return AppTheme.of(context).status04;
                                } else if (AppConstants.dois ==
                                    getJsonField(
                                      widget!.item,
                                      r'''$.projects_backlogs.equipaments_types_id''',
                                    )) {
                                  return AppTheme.of(context).secondary;
                                } else if (AppConstants.tres ==
                                    getJsonField(
                                      widget!.item,
                                      r'''$.projects_backlogs.equipaments_types_id''',
                                    )) {
                                  return AppTheme.of(context).status02;
                                } else {
                                  return AppTheme.of(context).alternate;
                                }
                              }(),
                              borderRadius: BorderRadius.circular(100.0),
                              border: Border.all(
                                color: () {
                                  if (AppConstants.um ==
                                      getJsonField(
                                        widget!.item,
                                        r'''$.projects_backlogs.equipaments_types_id''',
                                      )) {
                                    return AppTheme.of(context).success;
                                  } else if (AppConstants.dois ==
                                      getJsonField(
                                        widget!.item,
                                        r'''$.projects_backlogs.equipaments_types_id''',
                                      )) {
                                    return AppTheme.of(context).primary;
                                  } else if (AppConstants.tres ==
                                      getJsonField(
                                        widget!.item,
                                        r'''$.projects_backlogs.equipaments_types_id''',
                                      )) {
                                    return AppTheme.of(context)
                                        .tertiary;
                                  } else {
                                    return AppTheme.of(context)
                                        .alternate;
                                  }
                                }(),
                              ),
                            ),
                            child: Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  12.0, 4.0, 12.0, 4.0),
                              child: Text(
                                valueOrDefault<String>(
                                  getJsonField(
                                    widget!.item,
                                    r'''$.projects_backlogs.equipaments_types.type ''',
                                  )?.toString(),
                                  ' - ',
                                ),
                                style: AppTheme.of(context)
                                    .titleSmall
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: AppTheme.of(context)
                                            .titleSmall
                                            .fontWeight,
                                        fontStyle: AppTheme.of(context)
                                            .titleSmall
                                            .fontStyle,
                                      ),
                                      color: () {
                                        if (AppConstants.um ==
                                            getJsonField(
                                              widget!.item,
                                              r'''$.projects_backlogs.equipaments_types_id''',
                                            )) {
                                          return AppTheme.of(context)
                                              .success;
                                        } else if (AppConstants.dois ==
                                            getJsonField(
                                              widget!.item,
                                              r'''$.projects_backlogs.equipaments_types_id''',
                                            )) {
                                          return AppTheme.of(context)
                                              .primary;
                                        } else if (AppConstants.tres ==
                                            getJsonField(
                                              widget!.item,
                                              r'''$.projects_backlogs.equipaments_types_id''',
                                            )) {
                                          return AppTheme.of(context)
                                              .tertiary;
                                        } else {
                                          return AppTheme.of(context)
                                              .secondaryText;
                                        }
                                      }(),
                                      letterSpacing: 0.0,
                                      fontWeight: AppTheme.of(context)
                                          .titleSmall
                                          .fontWeight,
                                      fontStyle: AppTheme.of(context)
                                          .titleSmall
                                          .fontStyle,
                                    ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      Padding(
                        padding:
                            EdgeInsetsDirectional.fromSTEB(0.0, 16.0, 0.0, 0.0),
                        child: RichText(
                          textScaler: MediaQuery.of(context).textScaler,
                          text: TextSpan(
                            children: [
                              TextSpan(
                                text: valueOrDefault<String>(
                                  getJsonField(
                                    widget!.item,
                                    r'''$.sprints.title''',
                                  )?.toString(),
                                  ' - ',
                                ),
                                style: AppTheme.of(context)
                                    .titleLarge
                                    .override(
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
                              )
                            ],
                            style: TextStyle(),
                          ),
                        ),
                      ),
                      Padding(
                        padding:
                            EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 8.0),
                        child: Row(
                          mainAxisSize: MainAxisSize.max,
                          children: [
                            Align(
                              alignment: AlignmentDirectional(-1.0, 1.0),
                              child: Text(
                                valueOrDefault<String>(
                                  getJsonField(
                                    widget!.item,
                                    r'''$.projects_backlogs.description''',
                                  )?.toString(),
                                  ' - ',
                                ),
                                style: AppTheme.of(context)
                                    .labelLarge
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FontWeight.normal,
                                        fontStyle: AppTheme.of(context)
                                            .labelLarge
                                            .fontStyle,
                                      ),
                                      color: AppTheme.of(context)
                                          .primaryText,
                                      fontSize: 14.0,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.normal,
                                      fontStyle: AppTheme.of(context)
                                          .labelLarge
                                          .fontStyle,
                                    ),
                              ),
                            ),
                          ].divide(SizedBox(width: 8.0)),
                        ),
                      ),
                      Align(
                        alignment: AlignmentDirectional(-1.0, 1.0),
                        child: Text(
                          '${dateTimeFormat(
                            "d/M/y",
                            DateTime.fromMillisecondsSinceEpoch(
                                valueOrDefault<int>(
                              getJsonField(
                                widget!.item,
                                r'''$.sprints.start_date''',
                              ),
                              0,
                            )),
                            locale: AppLocalizations.of(context).languageCode,
                          )}${AppLocalizations.of(context).getVariableText(
                            ptText: ' até ',
                            esText: ' hasta ',
                            enText: ' until ',
                          )}${dateTimeFormat(
                            "d/M/y",
                            DateTime.fromMillisecondsSinceEpoch(
                                valueOrDefault<int>(
                              getJsonField(
                                widget!.item,
                                r'''$.sprints.end_date''',
                              ),
                              0,
                            )),
                            locale: AppLocalizations.of(context).languageCode,
                          )}',
                          style:
                              AppTheme.of(context).labelLarge.override(
                                    font: GoogleFonts.lexend(
                                      fontWeight: AppTheme.of(context)
                                          .labelLarge
                                          .fontWeight,
                                      fontStyle: AppTheme.of(context)
                                          .labelLarge
                                          .fontStyle,
                                    ),
                                    color: AppTheme.of(context).primary,
                                    letterSpacing: 0.0,
                                    fontWeight: AppTheme.of(context)
                                        .labelLarge
                                        .fontWeight,
                                    fontStyle: AppTheme.of(context)
                                        .labelLarge
                                        .fontStyle,
                                  ),
                        ),
                      ),
                      if (getJsonField(
                            widget!.item,
                            r'''$.projects_backlogs.trackers''',
                          ) !=
                          null)
                        Expanded(
                          child: Column(
                            mainAxisSize: MainAxisSize.max,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 8.0, 0.0, 12.0),
                                child: Wrap(
                                  spacing: 4.0,
                                  runSpacing: 8.0,
                                  alignment: WrapAlignment.start,
                                  crossAxisAlignment: WrapCrossAlignment.center,
                                  direction: Axis.horizontal,
                                  runAlignment: WrapAlignment.start,
                                  verticalDirection: VerticalDirection.down,
                                  clipBehavior: Clip.none,
                                  children: [
                                    Container(
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            AppTheme.of(context)
                                                .secondaryBackground,
                                            AppTheme.of(context)
                                                .primaryBackground
                                          ],
                                          stops: [0.0, 1.0],
                                          begin:
                                              AlignmentDirectional(-1.0, 0.0),
                                          end: AlignmentDirectional(1.0, 0),
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(8.0),
                                        border: Border.all(
                                          color: AppTheme.of(context)
                                              .alternate,
                                        ),
                                      ),
                                      child: Padding(
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            8.0, 4.0, 8.0, 4.0),
                                        child: RichText(
                                          textScaler:
                                              MediaQuery.of(context).textScaler,
                                          text: TextSpan(
                                            children: [
                                              TextSpan(
                                                text:
                                                    AppLocalizations.of(context)
                                                        .getText(
                                                  'evq73iqa' /* Campo  */,
                                                ),
                                                style: AppTheme.of(
                                                        context)
                                                    .bodySmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            AppTheme.of(
                                                                    context)
                                                                .bodySmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            AppTheme.of(
                                                                    context)
                                                                .bodySmall
                                                                .fontStyle,
                                                      ),
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          AppTheme.of(
                                                                  context)
                                                              .bodySmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .bodySmall
                                                              .fontStyle,
                                                    ),
                                              ),
                                              TextSpan(
                                                text: valueOrDefault<String>(
                                                  getJsonField(
                                                    widget!.item,
                                                    r'''$.projects_backlogs.fields.name''',
                                                  )?.toString(),
                                                  ' - ',
                                                ),
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
                                              )
                                            ],
                                            style: TextStyle(),
                                          ),
                                        ),
                                      ),
                                    ),
                                    Icon(
                                      Icons.keyboard_arrow_right_rounded,
                                      color: AppTheme.of(context)
                                          .secondaryText,
                                      size: 16.0,
                                    ),
                                    Container(
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            AppTheme.of(context)
                                                .secondaryBackground,
                                            AppTheme.of(context)
                                                .primaryBackground
                                          ],
                                          stops: [0.0, 1.0],
                                          begin:
                                              AlignmentDirectional(-1.0, 0.0),
                                          end: AlignmentDirectional(1.0, 0),
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(8.0),
                                        border: Border.all(
                                          color: AppTheme.of(context)
                                              .alternate,
                                        ),
                                      ),
                                      child: Padding(
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            8.0, 4.0, 8.0, 4.0),
                                        child: RichText(
                                          textScaler:
                                              MediaQuery.of(context).textScaler,
                                          text: TextSpan(
                                            children: [
                                              TextSpan(
                                                text:
                                                    AppLocalizations.of(context)
                                                        .getText(
                                                  'vpccsoey' /* Seção  */,
                                                ),
                                                style: AppTheme.of(
                                                        context)
                                                    .bodySmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            AppTheme.of(
                                                                    context)
                                                                .bodySmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            AppTheme.of(
                                                                    context)
                                                                .bodySmall
                                                                .fontStyle,
                                                      ),
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          AppTheme.of(
                                                                  context)
                                                              .bodySmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .bodySmall
                                                              .fontStyle,
                                                    ),
                                              ),
                                              TextSpan(
                                                text: valueOrDefault<String>(
                                                  getJsonField(
                                                    widget!.item,
                                                    r'''$.projects_backlogs.sections.section_number''',
                                                  )?.toString(),
                                                  ' - ',
                                                ),
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
                                              )
                                            ],
                                            style: TextStyle(),
                                          ),
                                        ),
                                      ),
                                    ),
                                    Icon(
                                      Icons.keyboard_arrow_right_rounded,
                                      color: AppTheme.of(context)
                                          .secondaryText,
                                      size: 16.0,
                                    ),
                                    Container(
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            AppTheme.of(context)
                                                .secondaryBackground,
                                            AppTheme.of(context)
                                                .primaryBackground
                                          ],
                                          stops: [0.0, 1.0],
                                          begin:
                                              AlignmentDirectional(-1.0, 0.0),
                                          end: AlignmentDirectional(1.0, 0),
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(8.0),
                                        border: Border.all(
                                          color: AppTheme.of(context)
                                              .alternate,
                                        ),
                                      ),
                                      child: Padding(
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            8.0, 4.0, 8.0, 4.0),
                                        child: RichText(
                                          textScaler:
                                              MediaQuery.of(context).textScaler,
                                          text: TextSpan(
                                            children: [
                                              TextSpan(
                                                text:
                                                    AppLocalizations.of(context)
                                                        .getText(
                                                  'q69hklms' /* Fileira  */,
                                                ),
                                                style: AppTheme.of(
                                                        context)
                                                    .bodySmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            AppTheme.of(
                                                                    context)
                                                                .bodySmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            AppTheme.of(
                                                                    context)
                                                                .bodySmall
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          AppTheme.of(
                                                                  context)
                                                              .primaryText,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          AppTheme.of(
                                                                  context)
                                                              .bodySmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .bodySmall
                                                              .fontStyle,
                                                    ),
                                              ),
                                              TextSpan(
                                                text: valueOrDefault<String>(
                                                  getJsonField(
                                                    widget!.item,
                                                    r'''$.projects_backlogs.rows.row_number''',
                                                  )?.toString(),
                                                  ' - ',
                                                ),
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
                                              )
                                            ],
                                            style: TextStyle(),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Align(
                                alignment: AlignmentDirectional(-1.0, -1.0),
                                child: Container(
                                  width: MediaQuery.sizeOf(context).width * 1.0,
                                  decoration: BoxDecoration(
                                    color: AppTheme.of(context)
                                        .primaryBackground,
                                    borderRadius: BorderRadius.circular(8.0),
                                    border: Border.all(
                                      color: AppTheme.of(context)
                                          .alternate,
                                      width: 1.0,
                                    ),
                                  ),
                                  child: Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        12.0, 4.0, 12.0, 4.0),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.max,
                                      children: [
                                        Container(
                                          width: 32.0,
                                          height: 32.0,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                          ),
                                          alignment:
                                              AlignmentDirectional(0.0, 0.0),
                                          child: Text(
                                            valueOrDefault<String>(
                                              getJsonField(
                                                widget!.item,
                                                r'''$.projects_backlogs.trackers.stake_quantity''',
                                              )?.toString(),
                                              ' - ',
                                            ),
                                            style: AppTheme.of(context)
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
                                                      .primary,
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
                                          ),
                                        ),
                                        Expanded(
                                          child: Column(
                                            mainAxisSize: MainAxisSize.max,
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                valueOrDefault<String>(
                                                  getJsonField(
                                                    widget!.item,
                                                    r'''$.projects_backlogs.trackers.trackers_types.type''',
                                                  )?.toString(),
                                                  ' - ',
                                                ),
                                                style: AppTheme.of(
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
                                                      color:
                                                          AppTheme.of(
                                                                  context)
                                                              .primaryText,
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
                                              ),
                                              Text(
                                                valueOrDefault<String>(
                                                  getJsonField(
                                                    widget!.item,
                                                    r'''$.projects_backlogs.trackers.manufacturers.name''',
                                                  )?.toString(),
                                                  ' - ',
                                                ),
                                                style: AppTheme.of(
                                                        context)
                                                    .bodySmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            AppTheme.of(
                                                                    context)
                                                                .bodySmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            AppTheme.of(
                                                                    context)
                                                                .bodySmall
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          AppTheme.of(
                                                                  context)
                                                              .primaryText,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          AppTheme.of(
                                                                  context)
                                                              .bodySmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .bodySmall
                                                              .fontStyle,
                                                    ),
                                              ),
                                            ].divide(SizedBox(height: 0.0)),
                                          ),
                                        ),
                                      ].divide(SizedBox(width: 0.0)),
                                    ),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 12.0, 12.0, 0.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  children: [
                                    Text(
                                      AppLocalizations.of(context).getText(
                                        '8uexfrgt' /* Quantidade de módulos:  */,
                                      ),
                                      style: AppTheme.of(context)
                                          .labelLarge
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  AppTheme.of(context)
                                                      .labelLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  AppTheme.of(context)
                                                      .labelLarge
                                                      .fontStyle,
                                            ),
                                            color: AppTheme.of(context)
                                                .primaryText,
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                AppTheme.of(context)
                                                    .labelLarge
                                                    .fontWeight,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .labelLarge
                                                    .fontStyle,
                                          ),
                                    ),
                                    Text(
                                      valueOrDefault<String>(
                                        getJsonField(
                                          widget!.item,
                                          r'''$.projects_backlogs.trackers.max_modules''',
                                        )?.toString(),
                                        ' - ',
                                      ),
                                      style: AppTheme.of(context)
                                          .labelLarge
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  AppTheme.of(context)
                                                      .labelLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  AppTheme.of(context)
                                                      .labelLarge
                                                      .fontStyle,
                                            ),
                                            color: AppTheme.of(context)
                                                .primary,
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                AppTheme.of(context)
                                                    .labelLarge
                                                    .fontWeight,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .labelLarge
                                                    .fontStyle,
                                          ),
                                    ),
                                  ].divide(SizedBox(width: 4.0)),
                                ),
                              ),
                              Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 12.0, 12.0, 8.0),
                                child: Row(
                                  mainAxisSize: MainAxisSize.max,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        AppLocalizations.of(context).getText(
                                          'wi23haxt' /* Sequencia de estacas */,
                                        ),
                                        style: AppTheme.of(context)
                                            .labelLarge
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight:
                                                    AppTheme.of(context)
                                                        .labelLarge
                                                        .fontWeight,
                                                fontStyle:
                                                    AppTheme.of(context)
                                                        .labelLarge
                                                        .fontStyle,
                                              ),
                                              color:
                                                  AppTheme.of(context)
                                                      .primaryText,
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  AppTheme.of(context)
                                                      .labelLarge
                                                      .fontWeight,
                                              fontStyle:
                                                  AppTheme.of(context)
                                                      .labelLarge
                                                      .fontStyle,
                                            ),
                                      ),
                                    ),
                                  ].divide(SizedBox(width: 4.0)),
                                ),
                              ),
                              Expanded(
                                child: SizedBox.shrink(),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              if (false)
                wrapWithModel(
                  model: _model.navBarModel,
                  updateCallback: () => safeSetState(() {}),
                  child: NavBarWidget(
                    page: 0,
                  ),
                ),
            ],
          ),
        ),
        bottomNavigationBar: _buildActionBar(context),
      ),
    );
  }

  /// Verifica se a tarefa está em status pendente (1) ou em andamento (2)
  bool _isTaskActionable() {
    final statusId = castToType<int>(getJsonField(
      widget.item,
      r'''$.sprints_tasks_statuses_id''',
    ));
    return statusId == 1 || statusId == 2;
  }

  /// Constrói a barra de ações fixa na parte inferior
  Widget? _buildActionBar(BuildContext context) {
    if (!_isTaskActionable()) return null;

    return Container(
      padding: EdgeInsetsDirectional.fromSTEB(24.0, 12.0, 24.0, 24.0),
      decoration: BoxDecoration(
        color: AppTheme.of(context).secondaryBackground,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            // Botão Sucesso
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _model.isActionLoading
                    ? null
                    : () => _handleSuccess(context),
                icon: Icon(Icons.check_circle_outline, size: 20.0),
                label: Text('Concluir'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.of(context).success,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: 14.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                  textStyle: GoogleFonts.lexend(
                    fontSize: 14.0,
                    fontWeight: FontWeight.w600,
                  ),
                  elevation: 0,
                ),
              ),
            ),
            SizedBox(width: 12.0),
            // Botão Sem Sucesso
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _model.isActionLoading
                    ? null
                    : () => _handleFailure(context),
                icon: Icon(Icons.cancel_outlined, size: 20.0),
                label: Text('Sem Sucesso'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.of(context).error,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: 14.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                  textStyle: GoogleFonts.lexend(
                    fontSize: 14.0,
                    fontWeight: FontWeight.w600,
                  ),
                  elevation: 0,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Lógica para marcar tarefa como concluída com sucesso (status 3)
  Future<void> _handleSuccess(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppTheme.of(context).secondaryBackground,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.0),
          ),
          title: Text(
            'Confirmar conclusão',
            style: GoogleFonts.lexend(
              fontWeight: FontWeight.w600,
              color: AppTheme.of(context).primaryText,
            ),
          ),
          content: Text(
            'Deseja marcar esta tarefa como concluída com sucesso?',
            style: GoogleFonts.lexend(
              color: AppTheme.of(context).secondaryText,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, false),
              child: Text(
                'Cancelar',
                style: GoogleFonts.lexend(
                  color: AppTheme.of(context).secondaryText,
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(dialogContext, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.of(context).success,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.0),
                ),
              ),
              child: Text(
                'Confirmar',
                style: GoogleFonts.lexend(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        );
      },
    );

    if (confirmed != true) return;

    safeSetState(() => _model.isActionLoading = true);

    final taskId = castToType<int>(getJsonField(
      widget.item,
      r'''$.id''',
    ));

    _model.statusUpdateResult =
        await SprintsGroup.atualizaStatusDaSprintTaskCall.call(
      scheduleId: AppState().user.sheduleId,
      tasksListJson: [
        {
          'sprints_tasks_id': taskId,
          'sprints_tasks_statuses_id': 3,
        }
      ],
      token: currentAuthenticationToken,
    );

    safeSetState(() => _model.isActionLoading = false);

    if (_model.statusUpdateResult?.succeeded ?? false) {
      _model.statusChanged = true;
      AppState().signalTasksRefresh();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Tarefa concluída com sucesso!'),
            backgroundColor: AppTheme.of(context).success,
          ),
        );
        context.safePop();
      }
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao atualizar status. Tente novamente.'),
            backgroundColor: AppTheme.of(context).error,
          ),
        );
      }
    }
  }

  /// Lógica para marcar tarefa sem sucesso (status 4) - abre modal de comentário
  Future<void> _handleFailure(BuildContext context) async {
    final taskId = castToType<int>(getJsonField(
      widget.item,
      r'''$.id''',
    ));
    final projectsBacklogsId = castToType<int>(getJsonField(
      widget.item,
      r'''$.projects_backlogs_id''',
    )) ?? castToType<int>(getJsonField(
      widget.item,
      r'''$.projects_backlogs.id''',
    )) ?? 0;
    final subtasksId = castToType<int>(getJsonField(
      widget.item,
      r'''$.subtasks_id''',
    )) ?? 0;

    final result = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return Dialog(
          elevation: 0,
          insetPadding: EdgeInsets.zero,
          backgroundColor: Colors.transparent,
          alignment: AlignmentDirectional(0.0, 0.0)
              .resolve(Directionality.of(context)),
          child: ModalCommentWidget(
            projectsBacklogsId: projectsBacklogsId,
            subtasksId: subtasksId,
            createdUserId: AppState().user.id,
            sprintTaskId: taskId ?? 0,
            scheduleId: AppState().user.sheduleId,
          ),
        );
      },
    );

    if (result == true) {
      _model.statusChanged = true;
      AppState().signalTasksRefresh();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Tarefa marcada como sem sucesso.'),
            backgroundColor: AppTheme.of(context).error,
          ),
        );
        context.safePop();
      }
    }
  }
}
