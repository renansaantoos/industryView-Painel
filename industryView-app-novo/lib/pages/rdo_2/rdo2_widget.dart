import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/components/empty_widget.dart';
import '/components/imagens_widget.dart';
import '/components/nav_bar_widget.dart';
import '/components/offline_banner_widget.dart';
import '/core/widgets/app_tab_bar.dart';
import '/core/widgets/app_expanded_image.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/core/utils/custom_functions.dart' as functions;
import '/index.dart';
import '/services/network_service.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:page_transition/page_transition.dart';
import 'package:provider/provider.dart';
import 'rdo2_model.dart';
export 'rdo2_model.dart';

class Rdo2Widget extends StatefulWidget {
  const Rdo2Widget({
    super.key,
    required this.item,
    this.list,
  });

  final dynamic item;
  final List<dynamic>? list;

  static String routeName = 'RDO-2';
  static String routePath = '/rdo2';

  @override
  State<Rdo2Widget> createState() => _Rdo2WidgetState();
}

class _Rdo2WidgetState extends State<Rdo2Widget> with TickerProviderStateMixin {
  late Rdo2Model _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => Rdo2Model());

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

    _model.tabBarController = TabController(
      vsync: this,
      length: 2,
      initialIndex: 0,
    )..addListener(() => safeSetState(() {}));

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
        body: SafeArea(
          top: true,
          child: Stack(
            children: [
              wrapWithModel(
                model: _model.navBarModel,
                updateCallback: () => safeSetState(() {}),
                child: const NavBarWidget(
                  page: 2,
                ),
              ),
              Padding(
                padding:
                    const EdgeInsetsDirectional.fromSTEB(24.0, 24.0, 24.0, 72.0),
                child: Column(
                  mainAxisSize: MainAxisSize.max,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const OfflineBannerWidget(),
                    if ((functions
                                .returnNumberJsonList(getJsonField(
                                  widget.item,
                                  r'''$.images''',
                                  true,
                                ))
                                .toString() !=
                            '0') &&
                        (functions
                                .returnNumberJsonList(getJsonField(
                                  widget.item,
                                  r'''$.images''',
                                  true,
                                ))
                                .toString() !=
                            '1'))
                      Padding(
                        padding: const EdgeInsetsDirectional.fromSTEB(
                            0.0, 16.0, 0.0, 16.0),
                        child: Column(
                          mainAxisSize: MainAxisSize.max,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                AppIconButton(
                                  borderColor:
                                      AppTheme.of(context).primary,
                                  borderRadius: 8.0,
                                  borderWidth: 1.0,
                                  buttonSize: 32.0,
                                  fillColor:
                                      AppTheme.of(context).secondary,
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
                                  child: Text(
                                    AppLocalizations.of(context).getText(
                                      'm0f3eq93' /* Detalhes do relatório diário d... */,
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
                                ),
                              ].divide(const SizedBox(width: 12.0)),
                            ),
                            Padding(
                              padding: const EdgeInsetsDirectional.fromSTEB(
                                  0.0, 8.0, 0.0, 0.0),
                              child: Text(
                                AppLocalizations.of(context).getText(
                                  'owk3b8ng' /* Imagens da obra */,
                                ),
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
                                      color: AppTheme.of(context)
                                          .primaryText,
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
                            Padding(
                              padding: const EdgeInsetsDirectional.fromSTEB(
                                  0.0, 8.0, 0.0, 0.0),
                              child: Builder(
                                builder: (context) {
                                  final listImages = getJsonField(
                                    widget.item,
                                    r'''$.images''',
                                  ).toList();
                                  final limitedImages =
                                      listImages.take(3).toList();
                                  final isOffline =
                                      !NetworkService.instance.isConnected;

                                  if (isOffline && limitedImages.isEmpty) {
                                    return Container(
                                      width: double.infinity,
                                      padding: const EdgeInsetsDirectional.fromSTEB(
                                          12.0, 10.0, 12.0, 10.0),
                                      decoration: BoxDecoration(
                                        color: AppTheme.of(context)
                                            .alternate
                                            .withOpacity(0.2),
                                        borderRadius:
                                            BorderRadius.circular(14.0),
                                      ),
                                      child: Text(
                                        'Não é possível visualizar as imagens no modo offline.',
                                        style: AppTheme.of(context)
                                            .bodySmall
                                            .override(
                                              color:
                                                  AppTheme.of(context)
                                                      .secondaryText,
                                              fontSize: 12.0,
                                              fontWeight: FontWeight.w500,
                                            ),
                                      ),
                                    );
                                  }

                                  return Row(
                                    mainAxisSize: MainAxisSize.max,
                                    children: [
                                      SingleChildScrollView(
                                        scrollDirection: Axis.horizontal,
                                        child: Row(
                                          mainAxisSize: MainAxisSize.max,
                                          children: List.generate(
                                            limitedImages.length,
                                            (listImagesIndex) {
                                              final listImagesItem =
                                                  limitedImages[listImagesIndex];
                                              return Container(
                                                width: 60.0,
                                                height: 60.0,
                                                decoration: BoxDecoration(
                                                  color:
                                                      AppTheme.of(context)
                                                          .secondaryBackground,
                                                  borderRadius:
                                                      BorderRadius.circular(14.0),
                                                  border: Border.all(
                                                    color: AppTheme.of(
                                                            context)
                                                        .alternate,
                                                  ),
                                                ),
                                                child: InkWell(
                                                  splashColor:
                                                      Colors.transparent,
                                                  focusColor: Colors.transparent,
                                                  hoverColor: Colors.transparent,
                                                  highlightColor:
                                                      Colors.transparent,
                                                  onTap: () async {
                                                    await Navigator.push(
                                                      context,
                                                      PageTransition(
                                                        type:
                                                            PageTransitionType.fade,
                                                        child:
                                                            AppExpandedImageView(
                                                          image: Image.network(
                                                            getJsonField(
                                                              listImagesItem,
                                                              r'''$.url''',
                                                            ).toString(),
                                                            fit: BoxFit.contain,
                                                          ),
                                                          allowRotation: true,
                                                          tag: getJsonField(
                                                            listImagesItem,
                                                            r'''$.url''',
                                                          ).toString(),
                                                          useHeroAnimation: true,
                                                        ),
                                                      ),
                                                    );
                                                  },
                                                  child: Hero(
                                                    tag: getJsonField(
                                                      listImagesItem,
                                                      r'''$.url''',
                                                    ).toString(),
                                                    transitionOnUserGestures:
                                                        true,
                                                    child: ClipRRect(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              8.0),
                                                      child: Image.network(
                                                        getJsonField(
                                                          listImagesItem,
                                                          r'''$.url''',
                                                        ).toString(),
                                                        width: 200.0,
                                                        height: 200.0,
                                                        fit: BoxFit.cover,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                              );
                                            },
                                          ).divide(const SizedBox(width: 8.0)),
                                        ),
                                      ),
                                      if (valueOrDefault<int>(
                                            functions.returnNumberJsonList(
                                              getJsonField(
                                                widget.item,
                                                r'''$.images''',
                                                true,
                                              ),
                                            ),
                                            0,
                                          ) >
                                          3)
                                        Builder(
                                          builder: (context) => InkWell(
                                            splashColor: Colors.transparent,
                                            focusColor: Colors.transparent,
                                            hoverColor: Colors.transparent,
                                            highlightColor: Colors.transparent,
                                            onTap: () async {
                                              await showDialog(
                                                barrierColor: const Color(0x7F000000),
                                                context: context,
                                                builder: (dialogContext) {
                                                  return Dialog(
                                                    elevation: 0,
                                                    insetPadding: EdgeInsets.zero,
                                                    backgroundColor:
                                                        Colors.transparent,
                                                    alignment:
                                                        const AlignmentDirectional(
                                                                0.0, 0.0)
                                                            .resolve(
                                                                Directionality.of(
                                                                    context)),
                                                    child: GestureDetector(
                                                      onTap: () {
                                                        FocusScope.of(
                                                                dialogContext)
                                                            .unfocus();
                                                        FocusManager.instance
                                                            .primaryFocus
                                                            ?.unfocus();
                                                      },
                                                      child: ImagensWidget(
                                                        images: getJsonField(
                                                          widget.item,
                                                          r'''$.images''',
                                                          true,
                                                        ),
                                                      ),
                                                    ),
                                                  );
                                                },
                                              );
                                            },
                                            child: Container(
                                              width: 60.0,
                                              height: 60.0,
                                              decoration: BoxDecoration(
                                                color: AppTheme.of(context)
                                                    .secondary,
                                                borderRadius:
                                                    BorderRadius.circular(14.0),
                                                border: Border.all(
                                                  color:
                                                      AppTheme.of(context)
                                                          .primary,
                                                ),
                                              ),
                                              alignment:
                                                  const AlignmentDirectional(0.0, 0.0),
                                              child: Text(
                                                valueOrDefault<String>(
                                                  'Ver +${(valueOrDefault<int>(
                                                        functions
                                                            .returnNumberJsonList(
                                                                getJsonField(
                                                          widget.item,
                                                          r'''$.images''',
                                                          true,
                                                        )),
                                                        0,
                                                      ) - 3).toString()} imagens',
                                                  '0',
                                                ),
                                                textAlign: TextAlign.center,
                                                style:
                                                    AppTheme.of(context)
                                                        .labelSmall
                                                        .override(
                                                          font:
                                                              GoogleFonts.lexend(
                                                            fontWeight:
                                                                AppTheme
                                                                        .of(
                                                                            context)
                                                                    .labelSmall
                                                                    .fontWeight,
                                                            fontStyle:
                                                                AppTheme
                                                                        .of(
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
                                              ),
                                            ),
                                          ),
                                        ),
                                    ].divide(const SizedBox(width: 8.0)),
                                  );
                                },
                              ),
                            ),
                          ].divide(const SizedBox(height: 0.0)),
                        ),
                      ),
                    Expanded(
                      child: Column(
                        children: [
                          Align(
                            alignment: const Alignment(0.0, 0),
                            child: AppTabBar(
                              useToggleButtonStyle: true,
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
                              unselectedLabelStyle: AppTheme.of(context)
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
                              labelColor: AppTheme.of(context).primary,
                              unselectedLabelColor:
                                  AppTheme.of(context).primaryText,
                              backgroundColor:
                                  AppTheme.of(context).secondary,
                              unselectedBackgroundColor:
                                  AppTheme.of(context)
                                      .secondaryBackground,
                              borderColor:
                                  AppTheme.of(context).alternate,
                              unselectedBorderColor:
                                  AppTheme.of(context).alternate,
                              borderWidth: 1.0,
                              borderRadius: 12.0,
                              elevation: 0.0,
                              buttonMargin: const EdgeInsetsDirectional.fromSTEB(
                                  8.0, 0.0, 8.0, 0.0),
                              tabs: [
                                Tab(
                                  text: AppLocalizations.of(context).getText(
                                    '3zwh7xox' /* Tarefas concluídas */,
                                  ),
                                ),
                                Tab(
                                  text: AppLocalizations.of(context).getText(
                                    '4umzio73' /* Escala do dia */,
                                  ),
                                ),
                              ],
                              controller: _model.tabBarController,
                              onTap: (i) async {
                                [() async {}, () async {}][i]();
                              },
                            ),
                          ),
                          Expanded(
                            child: TabBarView(
                              controller: _model.tabBarController,
                              children: [
                                Stack(
                                  children: [
                                    if (functions
                                            .returnNumberJsonList(getJsonField(
                                              widget.item,
                                              r'''$.sprints_tasks_id''',
                                              true,
                                            ))
                                            .toString() !=
                                        '0')
                                      Builder(
                                        builder: (context) {
                                          final listRows =
                                              widget.list?.toList() ?? [];
                                          if (listRows.isEmpty) {
                                            return const EmptyWidget();
                                          }

                                          return ListView.builder(
                                            padding: EdgeInsets.zero,
                                            shrinkWrap: true,
                                            scrollDirection: Axis.vertical,
                                            itemCount: listRows.length,
                                            itemBuilder:
                                                (context, listRowsIndex) {
                                              final listRowsItem =
                                                  listRows[listRowsIndex];
                                              return Column(
                                                mainAxisSize: MainAxisSize.max,
                                                children: [
                                                  Material(
                                                    color: Colors.transparent,
                                                    elevation: 0.0,
                                                    shape:
                                                        RoundedRectangleBorder(
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              12.0),
                                                    ),
                                                    child: Container(
                                                      width: MediaQuery.sizeOf(
                                                                  context)
                                                              .width *
                                                          1.0,
                                                      decoration: BoxDecoration(
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(14.0),
                                                        border: Border.all(
                                                          color: AppTheme
                                                                  .of(context)
                                                              .alternate,
                                                        ),
                                                      ),
                                                      child: Padding(
                                                        padding: const EdgeInsets.all(
                                                            12.0),
                                                        child: Column(
                                                          mainAxisSize:
                                                              MainAxisSize.min,
                                                          crossAxisAlignment:
                                                              CrossAxisAlignment
                                                                  .start,
                                                          children: [
                                                            Padding(
                                                              padding:
                                                                  const EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          0.0,
                                                                          0.0,
                                                                          0.0,
                                                                          12.0),
                                                              child: Container(
                                                                decoration:
                                                                    BoxDecoration(
                                                                  color: () {
                                                                    if (AppConstants
                                                                            .um ==
                                                                        getJsonField(
                                                                          listRowsItem,
                                                                          r'''$.projects_backlogs.equipaments_types_id''',
                                                                        )) {
                                                                      return AppTheme.of(
                                                                              context)
                                                                          .status04;
                                                                    } else if (AppConstants
                                                                            .dois ==
                                                                        getJsonField(
                                                                          listRowsItem,
                                                                          r'''$.projects_backlogs.equipaments_types_id''',
                                                                        )) {
                                                                      return AppTheme.of(
                                                                              context)
                                                                          .secondary;
                                                                    } else if (AppConstants
                                                                            .tres ==
                                                                        getJsonField(
                                                                          listRowsItem,
                                                                          r'''$.projects_backlogs.equipaments_types_id''',
                                                                        )) {
                                                                      return AppTheme.of(
                                                                              context)
                                                                          .status02;
                                                                    } else {
                                                                      return AppTheme.of(
                                                                              context)
                                                                          .alternate;
                                                                    }
                                                                  }(),
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .circular(
                                                                              100.0),
                                                                  border: Border
                                                                      .all(
                                                                    color: () {
                                                                      if (AppConstants
                                                                              .um ==
                                                                          getJsonField(
                                                                            listRowsItem,
                                                                            r'''$.projects_backlogs.equipaments_types_id''',
                                                                          )) {
                                                                        return AppTheme.of(context)
                                                                            .success;
                                                                      } else if (AppConstants
                                                                              .dois ==
                                                                          getJsonField(
                                                                            listRowsItem,
                                                                            r'''$.projects_backlogs.equipaments_types_id''',
                                                                          )) {
                                                                        return AppTheme.of(context)
                                                                            .primary;
                                                                      } else if (AppConstants
                                                                              .tres ==
                                                                          getJsonField(
                                                                            listRowsItem,
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
                                                                  padding: const EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          12.0,
                                                                          4.0,
                                                                          12.0,
                                                                          4.0),
                                                                  child: Text(
                                                                    valueOrDefault<
                                                                        String>(
                                                                      getJsonField(
                                                                        listRowsItem,
                                                                        r'''$.projects_backlogs.equipaments_types.type''',
                                                                      )?.toString(),
                                                                      '-',
                                                                    ),
                                                                    style: AppTheme.of(
                                                                            context)
                                                                        .bodySmall
                                                                        .override(
                                                                          font:
                                                                              GoogleFonts.lexend(
                                                                            fontWeight:
                                                                                AppTheme.of(context).bodySmall.fontWeight,
                                                                            fontStyle:
                                                                                AppTheme.of(context).bodySmall.fontStyle,
                                                                          ),
                                                                          color:
                                                                              () {
                                                                            if (AppConstants.um ==
                                                                                getJsonField(
                                                                                  listRowsItem,
                                                                                  r'''$.projects_backlogs.equipaments_types_id''',
                                                                                )) {
                                                                              return AppTheme.of(context).success;
                                                                            } else if (AppConstants.dois ==
                                                                                getJsonField(
                                                                                  listRowsItem,
                                                                                  r'''$.projects_backlogs.equipaments_types_id''',
                                                                                )) {
                                                                              return AppTheme.of(context).primary;
                                                                            } else if (AppConstants.tres ==
                                                                                getJsonField(
                                                                                  listRowsItem,
                                                                                  r'''$.projects_backlogs.equipaments_types_id''',
                                                                                )) {
                                                                              return AppTheme.of(context).tertiary;
                                                                            } else {
                                                                              return AppTheme.of(context).primaryText;
                                                                            }
                                                                          }(),
                                                                          letterSpacing:
                                                                              0.0,
                                                                          fontWeight: AppTheme.of(context)
                                                                              .bodySmall
                                                                              .fontWeight,
                                                                          fontStyle: AppTheme.of(context)
                                                                              .bodySmall
                                                                              .fontStyle,
                                                                        ),
                                                                  ),
                                                                ),
                                                              ),
                                                            ),
                                                            Row(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .max,
                                                              children: [
                                                                Expanded(
                                                                  child:
                                                                      RichText(
                                                                    textScaler:
                                                                        MediaQuery.of(context)
                                                                            .textScaler,
                                                                    text:
                                                                        TextSpan(
                                                                      children: [
                                                                        TextSpan(
                                                                          text:
                                                                              'COD: ${valueOrDefault<String>(
                                                                            getJsonField(
                                                                              listRowsItem,
                                                                              r'''$.id''',
                                                                            )?.toString(),
                                                                            ' - ',
                                                                          )}',
                                                                          style: AppTheme.of(context)
                                                                              .labelSmall
                                                                              .override(
                                                                                font: GoogleFonts.lexend(
                                                                                  fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                  fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                ),
                                                                                color: AppTheme.of(context).primary,
                                                                                letterSpacing: 0.0,
                                                                                fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                              ),
                                                                        ),
                                                                        TextSpan(
                                                                          text:
                                                                              AppLocalizations.of(context).getText(
                                                                            'sszd6ju5' /* 
 */
                                                                            ,
                                                                          ),
                                                                          style: AppTheme.of(context)
                                                                              .labelLarge
                                                                              .override(
                                                                                font: GoogleFonts.lexend(
                                                                                  fontWeight: AppTheme.of(context).labelLarge.fontWeight,
                                                                                  fontStyle: AppTheme.of(context).labelLarge.fontStyle,
                                                                                ),
                                                                                color: AppTheme.of(context).primaryText,
                                                                                letterSpacing: 0.0,
                                                                                fontWeight: AppTheme.of(context).labelLarge.fontWeight,
                                                                                fontStyle: AppTheme.of(context).labelLarge.fontStyle,
                                                                              ),
                                                                        ),
                                                                        TextSpan(
                                                                          text: AppConstants.zero ==
                                                                                  valueOrDefault<int>(
                                                                                    getJsonField(
                                                                                      listRowsItem,
                                                                                      r'''$.subtasks_id''',
                                                                                    ),
                                                                                    0,
                                                                                  )
                                                                              ? valueOrDefault<String>(
                                                                                  getJsonField(
                                                                                    listRowsItem,
                                                                                    r'''$.projects_backlogs.description''',
                                                                                  )?.toString(),
                                                                                  '-',
                                                                                )
                                                                              : valueOrDefault<String>(
                                                                                  getJsonField(
                                                                                    listRowsItem,
                                                                                    r'''$.subtasks.description''',
                                                                                  )?.toString(),
                                                                                  '-',
                                                                                ),
                                                                          style: AppTheme.of(context)
                                                                              .labelLarge
                                                                              .override(
                                                                                font: GoogleFonts.lexend(
                                                                                  fontWeight: AppTheme.of(context).labelLarge.fontWeight,
                                                                                  fontStyle: AppTheme.of(context).labelLarge.fontStyle,
                                                                                ),
                                                                                color: AppTheme.of(context).primaryText,
                                                                                letterSpacing: 0.0,
                                                                                fontWeight: AppTheme.of(context).labelLarge.fontWeight,
                                                                                fontStyle: AppTheme.of(context).labelLarge.fontStyle,
                                                                              ),
                                                                        )
                                                                      ],
                                                                      style: AppTheme.of(
                                                                              context)
                                                                          .labelSmall
                                                                          .override(
                                                                            font:
                                                                                GoogleFonts.lexend(
                                                                              fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                              fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                            ),
                                                                            color:
                                                                                AppTheme.of(context).primaryText,
                                                                            letterSpacing:
                                                                                0.0,
                                                                            fontWeight:
                                                                                AppTheme.of(context).labelSmall.fontWeight,
                                                                            fontStyle:
                                                                                AppTheme.of(context).labelSmall.fontStyle,
                                                                          ),
                                                                    ),
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                            if (AppConstants
                                                                    .zero !=
                                                                valueOrDefault<
                                                                    int>(
                                                                  getJsonField(
                                                                    listRowsItem,
                                                                    r'''$.projects_backlogs.tasks_template_id''',
                                                                  ),
                                                                  0,
                                                                ))
                                                              Padding(
                                                                padding:
                                                                    const EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            0.0,
                                                                            8.0,
                                                                            0.0,
                                                                            0.0),
                                                                child: Wrap(
                                                                  spacing: 2.0,
                                                                  runSpacing:
                                                                      8.0,
                                                                  alignment:
                                                                      WrapAlignment
                                                                          .start,
                                                                  crossAxisAlignment:
                                                                      WrapCrossAlignment
                                                                          .center,
                                                                  direction: Axis
                                                                      .horizontal,
                                                                  runAlignment:
                                                                      WrapAlignment
                                                                          .start,
                                                                  verticalDirection:
                                                                      VerticalDirection
                                                                          .down,
                                                                  clipBehavior:
                                                                      Clip.none,
                                                                  children: [
                                                                    if (AppState()
                                                                            .filters ==
                                                                        0)
                                                                      Row(
                                                                        mainAxisSize:
                                                                            MainAxisSize.min,
                                                                        children: [
                                                                          Container(
                                                                            decoration:
                                                                                BoxDecoration(
                                                                              gradient: LinearGradient(
                                                                                colors: [
                                                                                  AppTheme.of(context).secondaryBackground,
                                                                                  AppTheme.of(context).primaryBackground
                                                                                ],
                                                                                stops: const [
                                                                                  0.0,
                                                                                  1.0
                                                                                ],
                                                                                begin: const AlignmentDirectional(-1.0, 0.0),
                                                                                end: const AlignmentDirectional(1.0, 0),
                                                                              ),
                                                                              borderRadius: BorderRadius.circular(8.0),
                                                                              border: Border.all(
                                                                                color: AppTheme.of(context).alternate,
                                                                              ),
                                                                            ),
                                                                            child:
                                                                                Padding(
                                                                              padding: const EdgeInsetsDirectional.fromSTEB(12.0, 4.0, 12.0, 4.0),
                                                                              child: RichText(
                                                                                textScaler: MediaQuery.of(context).textScaler,
                                                                                text: TextSpan(
                                                                                  children: [
                                                                                    TextSpan(
                                                                                      text: AppLocalizations.of(context).getText(
                                                                                        'lpdd6c9f' /* Campo  */,
                                                                                      ),
                                                                                      style: AppTheme.of(context).labelSmall.override(
                                                                                            font: GoogleFonts.lexend(
                                                                                              fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                              fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                            ),
                                                                                            color: AppTheme.of(context).primaryText,
                                                                                            letterSpacing: 0.0,
                                                                                            fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                            fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                          ),
                                                                                    ),
                                                                                    TextSpan(
                                                                                      text: valueOrDefault<String>(
                                                                                        getJsonField(
                                                                                          listRowsItem,
                                                                                          r'''$.projects_backlogs.fields.name''',
                                                                                        )?.toString(),
                                                                                        ' - ',
                                                                                      ),
                                                                                      style: AppTheme.of(context).labelMedium.override(
                                                                                            font: GoogleFonts.lexend(
                                                                                              fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                              fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                            ),
                                                                                            color: AppTheme.of(context).primary,
                                                                                            letterSpacing: 0.0,
                                                                                            fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                            fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                          ),
                                                                                    )
                                                                                  ],
                                                                                  style: const TextStyle(),
                                                                                ),
                                                                              ),
                                                                            ),
                                                                          ),
                                                                          Icon(
                                                                            Icons.keyboard_arrow_right_sharp,
                                                                            color:
                                                                                AppTheme.of(context).secondaryText,
                                                                            size:
                                                                                16.0,
                                                                          ),
                                                                        ],
                                                                      ),
                                                                    if (AppState()
                                                                            .filters <=
                                                                        1)
                                                                      Row(
                                                                        mainAxisSize:
                                                                            MainAxisSize.min,
                                                                        children: [
                                                                          Container(
                                                                            decoration:
                                                                                BoxDecoration(
                                                                              gradient: LinearGradient(
                                                                                colors: [
                                                                                  AppTheme.of(context).secondaryBackground,
                                                                                  AppTheme.of(context).primaryBackground
                                                                                ],
                                                                                stops: const [
                                                                                  0.0,
                                                                                  1.0
                                                                                ],
                                                                                begin: const AlignmentDirectional(-1.0, 0.0),
                                                                                end: const AlignmentDirectional(1.0, 0),
                                                                              ),
                                                                              borderRadius: BorderRadius.circular(8.0),
                                                                              border: Border.all(
                                                                                color: AppTheme.of(context).alternate,
                                                                              ),
                                                                            ),
                                                                            child:
                                                                                Padding(
                                                                              padding: const EdgeInsetsDirectional.fromSTEB(12.0, 4.0, 12.0, 4.0),
                                                                              child: RichText(
                                                                                textScaler: MediaQuery.of(context).textScaler,
                                                                                text: TextSpan(
                                                                                  children: [
                                                                                    TextSpan(
                                                                                      text: AppLocalizations.of(context).getText(
                                                                                        'p8b1b15o' /* Seção  */,
                                                                                      ),
                                                                                      style: AppTheme.of(context).labelSmall.override(
                                                                                            font: GoogleFonts.lexend(
                                                                                              fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                              fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                            ),
                                                                                            color: AppTheme.of(context).primaryText,
                                                                                            letterSpacing: 0.0,
                                                                                            fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                            fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                          ),
                                                                                    ),
                                                                                    TextSpan(
                                                                                      text: valueOrDefault<String>(
                                                                                        getJsonField(
                                                                                          listRowsItem,
                                                                                          r'''$.projects_backlogs.sections.section_number''',
                                                                                        )?.toString(),
                                                                                        ' - ',
                                                                                      ),
                                                                                      style: AppTheme.of(context).labelMedium.override(
                                                                                            font: GoogleFonts.lexend(
                                                                                              fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                              fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                            ),
                                                                                            color: AppTheme.of(context).primary,
                                                                                            letterSpacing: 0.0,
                                                                                            fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                            fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                          ),
                                                                                    )
                                                                                  ],
                                                                                  style: const TextStyle(),
                                                                                ),
                                                                              ),
                                                                            ),
                                                                          ),
                                                                          Icon(
                                                                            Icons.keyboard_arrow_right_sharp,
                                                                            color:
                                                                                AppTheme.of(context).secondaryText,
                                                                            size:
                                                                                16.0,
                                                                          ),
                                                                        ],
                                                                      ),
                                                                    if (AppState()
                                                                            .filters <=
                                                                        2)
                                                                      Row(
                                                                        mainAxisSize:
                                                                            MainAxisSize.min,
                                                                        children: [
                                                                          Container(
                                                                            decoration:
                                                                                BoxDecoration(
                                                                              gradient: LinearGradient(
                                                                                colors: [
                                                                                  AppTheme.of(context).secondaryBackground,
                                                                                  AppTheme.of(context).primaryBackground
                                                                                ],
                                                                                stops: const [
                                                                                  0.0,
                                                                                  1.0
                                                                                ],
                                                                                begin: const AlignmentDirectional(-1.0, 0.0),
                                                                                end: const AlignmentDirectional(1.0, 0),
                                                                              ),
                                                                              borderRadius: BorderRadius.circular(8.0),
                                                                              border: Border.all(
                                                                                color: AppTheme.of(context).alternate,
                                                                              ),
                                                                            ),
                                                                            child:
                                                                                Padding(
                                                                              padding: const EdgeInsetsDirectional.fromSTEB(12.0, 4.0, 12.0, 4.0),
                                                                              child: RichText(
                                                                                textScaler: MediaQuery.of(context).textScaler,
                                                                                text: TextSpan(
                                                                                  children: [
                                                                                    TextSpan(
                                                                                      text: AppLocalizations.of(context).getText(
                                                                                        '0fheqycn' /* Fileira  */,
                                                                                      ),
                                                                                      style: AppTheme.of(context).labelSmall.override(
                                                                                            font: GoogleFonts.lexend(
                                                                                              fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                              fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                            ),
                                                                                            color: AppTheme.of(context).primaryText,
                                                                                            letterSpacing: 0.0,
                                                                                            fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                            fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                          ),
                                                                                    ),
                                                                                    TextSpan(
                                                                                      text: valueOrDefault<String>(
                                                                                        getJsonField(
                                                                                          listRowsItem,
                                                                                          r'''$.projects_backlogs.rows.row_number''',
                                                                                        )?.toString(),
                                                                                        ' - ',
                                                                                      ),
                                                                                      style: AppTheme.of(context).labelMedium.override(
                                                                                            font: GoogleFonts.lexend(
                                                                                              fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                              fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                            ),
                                                                                            color: AppTheme.of(context).primary,
                                                                                            letterSpacing: 0.0,
                                                                                            fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                            fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                          ),
                                                                                    )
                                                                                  ],
                                                                                  style: const TextStyle(),
                                                                                ),
                                                                              ),
                                                                            ),
                                                                          ),
                                                                          Icon(
                                                                            Icons.keyboard_arrow_right_sharp,
                                                                            color:
                                                                                AppTheme.of(context).secondaryText,
                                                                            size:
                                                                                16.0,
                                                                          ),
                                                                        ],
                                                                      ),
                                                                    if (AppState()
                                                                            .filters <=
                                                                        3)
                                                                      Row(
                                                                        mainAxisSize:
                                                                            MainAxisSize.min,
                                                                        children: [
                                                                          Container(
                                                                            decoration:
                                                                                BoxDecoration(
                                                                              gradient: LinearGradient(
                                                                                colors: [
                                                                                  AppTheme.of(context).secondaryBackground,
                                                                                  AppTheme.of(context).primaryBackground
                                                                                ],
                                                                                stops: const [
                                                                                  0.0,
                                                                                  1.0
                                                                                ],
                                                                                begin: const AlignmentDirectional(-1.0, 0.0),
                                                                                end: const AlignmentDirectional(1.0, 0),
                                                                              ),
                                                                              borderRadius: BorderRadius.circular(8.0),
                                                                              border: Border.all(
                                                                                color: AppTheme.of(context).alternate,
                                                                              ),
                                                                            ),
                                                                            child:
                                                                                Padding(
                                                                              padding: const EdgeInsetsDirectional.fromSTEB(12.0, 4.0, 12.0, 4.0),
                                                                              child: RichText(
                                                                                textScaler: MediaQuery.of(context).textScaler,
                                                                                text: TextSpan(
                                                                                  children: [
                                                                                    TextSpan(
                                                                                      text: AppLocalizations.of(context).getText(
                                                                                        '1wfetz3y' /* Tracker  */,
                                                                                      ),
                                                                                      style: AppTheme.of(context).labelSmall.override(
                                                                                            font: GoogleFonts.lexend(
                                                                                              fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                              fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                            ),
                                                                                            color: AppTheme.of(context).primaryText,
                                                                                            letterSpacing: 0.0,
                                                                                            fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                            fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                          ),
                                                                                    ),
                                                                                    TextSpan(
                                                                                      text: valueOrDefault<String>(
                                                                                        getJsonField(
                                                                                          listRowsItem,
                                                                                          r'''$.projects_backlogs.rows_trackers.position''',
                                                                                        )?.toString(),
                                                                                        ' - ',
                                                                                      ),
                                                                                      style: AppTheme.of(context).labelMedium.override(
                                                                                            font: GoogleFonts.lexend(
                                                                                              fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                              fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                            ),
                                                                                            color: AppTheme.of(context).primary,
                                                                                            letterSpacing: 0.0,
                                                                                            fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                            fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                          ),
                                                                                    )
                                                                                  ],
                                                                                  style: const TextStyle(),
                                                                                ),
                                                                              ),
                                                                            ),
                                                                          ),
                                                                          Icon(
                                                                            Icons.keyboard_arrow_right_sharp,
                                                                            color:
                                                                                AppTheme.of(context).secondaryText,
                                                                            size:
                                                                                16.0,
                                                                          ),
                                                                        ],
                                                                      ),
                                                                    Container(
                                                                      decoration:
                                                                          BoxDecoration(
                                                                        gradient:
                                                                            LinearGradient(
                                                                          colors: [
                                                                            AppTheme.of(context).secondaryBackground,
                                                                            AppTheme.of(context).primaryBackground
                                                                          ],
                                                                          stops: const [
                                                                            0.0,
                                                                            1.0
                                                                          ],
                                                                          begin: const AlignmentDirectional(
                                                                              -1.0,
                                                                              0.0),
                                                                          end: const AlignmentDirectional(
                                                                              1.0,
                                                                              0),
                                                                        ),
                                                                        borderRadius:
                                                                            BorderRadius.circular(8.0),
                                                                        border:
                                                                            Border.all(
                                                                          color:
                                                                              AppTheme.of(context).alternate,
                                                                        ),
                                                                      ),
                                                                      child:
                                                                          Padding(
                                                                        padding: const EdgeInsetsDirectional.fromSTEB(
                                                                            12.0,
                                                                            4.0,
                                                                            12.0,
                                                                            4.0),
                                                                        child:
                                                                            RichText(
                                                                          textScaler:
                                                                              MediaQuery.of(context).textScaler,
                                                                          text:
                                                                              TextSpan(
                                                                            children: [
                                                                              TextSpan(
                                                                                text: AppLocalizations.of(context).getText(
                                                                                  'qxd67311' /* Estaca  */,
                                                                                ),
                                                                                style: AppTheme.of(context).labelSmall.override(
                                                                                      font: GoogleFonts.lexend(
                                                                                        fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                        fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                      ),
                                                                                      color: AppTheme.of(context).primaryText,
                                                                                      letterSpacing: 0.0,
                                                                                      fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                      fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                                    ),
                                                                              ),
                                                                              TextSpan(
                                                                                text: valueOrDefault<String>(
                                                                                  getJsonField(
                                                                                    listRowsItem,
                                                                                    r'''$.projects_backlogs.rows_stakes.stakes.position''',
                                                                                  )?.toString(),
                                                                                  ' - ',
                                                                                ),
                                                                                style: AppTheme.of(context).labelMedium.override(
                                                                                      font: GoogleFonts.lexend(
                                                                                        fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                        fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                      ),
                                                                                      color: AppTheme.of(context).primary,
                                                                                      letterSpacing: 0.0,
                                                                                      fontWeight: AppTheme.of(context).labelMedium.fontWeight,
                                                                                      fontStyle: AppTheme.of(context).labelMedium.fontStyle,
                                                                                    ),
                                                                              )
                                                                            ],
                                                                            style:
                                                                                const TextStyle(),
                                                                          ),
                                                                        ),
                                                                      ),
                                                                    ),
                                                                  ],
                                                                ),
                                                              ),
                                                            Padding(
                                                              padding:
                                                                  const EdgeInsetsDirectional
                                                                      .fromSTEB(
                                                                          0.0,
                                                                          8.0,
                                                                          0.0,
                                                                          0.0),
                                                              child: Container(
                                                                decoration:
                                                                    BoxDecoration(
                                                                  color: const Color(
                                                                      0x1A028F58),
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .circular(
                                                                              8.0),
                                                                  border: Border
                                                                      .all(
                                                                    color: AppTheme.of(
                                                                            context)
                                                                        .success,
                                                                  ),
                                                                ),
                                                                child: Row(
                                                                  mainAxisSize:
                                                                      MainAxisSize
                                                                          .min,
                                                                  children: [
                                                                    Padding(
                                                                      padding: const EdgeInsetsDirectional.fromSTEB(
                                                                          12.0,
                                                                          4.0,
                                                                          12.0,
                                                                          4.0),
                                                                      child:
                                                                          Text(
                                                                        AppLocalizations.of(context)
                                                                            .getText(
                                                                          '0ye0crjo' /* Tarefa concluída */,
                                                                        ),
                                                                        style: AppTheme.of(context)
                                                                            .labelSmall
                                                                            .override(
                                                                              font: GoogleFonts.lexend(
                                                                                fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                              ),
                                                                              color: AppTheme.of(context).success,
                                                                              letterSpacing: 0.0,
                                                                              fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                              fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                            ),
                                                                      ),
                                                                    ),
                                                                  ],
                                                                ),
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    ),
                                                  ),
                                                ]
                                                    .divide(
                                                        const SizedBox(height: 8.0))
                                                    .addToStart(
                                                        const SizedBox(height: 8.0)),
                                              );
                                            },
                                          );
                                        },
                                      ),
                                    if (functions
                                            .returnNumberJsonList(getJsonField(
                                              widget.item,
                                              r'''$.sprints_tasks_id''',
                                              true,
                                            ))
                                            .toString() ==
                                        '0')
                                      wrapWithModel(
                                        model: _model.emptyModel,
                                        updateCallback: () =>
                                            safeSetState(() {}),
                                        child: const EmptyWidget(),
                                      ),
                                  ],
                                ),
                                Builder(
                                  builder: (context) {
                                    final listUsers = getJsonField(
                                      widget.item,
                                      r'''$.schedule_user_of_schedule''',
                                    ).toList();

                                    return ListView.builder(
                                      padding: EdgeInsets.zero,
                                      shrinkWrap: true,
                                      scrollDirection: Axis.vertical,
                                      itemCount: listUsers.length,
                                      itemBuilder: (context, listUsersIndex) {
                                        final listUsersItem =
                                            listUsers[listUsersIndex];
                                        return Padding(
                                          padding:
                                              const EdgeInsetsDirectional.fromSTEB(
                                                  0.0, 8.0, 0.0, 0.0),
                                          child: Container(
                                            width: MediaQuery.sizeOf(context)
                                                    .width *
                                                1.0,
                                            decoration: BoxDecoration(
                                              gradient: LinearGradient(
                                                colors: [
                                                  AppTheme.of(context)
                                                      .secondaryBackground,
                                                  AppTheme.of(context)
                                                      .primaryBackground
                                                ],
                                                stops: const [0.0, 1.0],
                                                begin: const AlignmentDirectional(
                                                    -1.0, 0.0),
                                                end: const AlignmentDirectional(
                                                    1.0, 0),
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(14.0),
                                              border: Border.all(
                                                color:
                                                    AppTheme.of(context)
                                                        .alternate,
                                              ),
                                            ),
                                            child: Padding(
                                              padding: const EdgeInsetsDirectional
                                                  .fromSTEB(
                                                      12.0, 8.0, 12.0, 8.0),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  Stack(
                                                    alignment:
                                                        const AlignmentDirectional(
                                                            1.0, 1.0),
                                                    children: [
                                                      ClipRRect(
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(40.0),
                                                        child: Image.network(
                                                          valueOrDefault<
                                                              String>(
                                                            getJsonField(
                                                              listUsersItem,
                                                              r'''$.schedule_user_of_schedule.user.profile_picture.url''',
                                                            )?.toString(),
                                                            'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg',
                                                          ),
                                                          width: 36.0,
                                                          height: 36.0,
                                                          fit: BoxFit.cover,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                  Padding(
                                                    padding:
                                                        const EdgeInsetsDirectional
                                                            .fromSTEB(8.0, 0.0,
                                                                0.0, 0.0),
                                                    child: Column(
                                                      mainAxisSize:
                                                          MainAxisSize.min,
                                                      mainAxisAlignment:
                                                          MainAxisAlignment
                                                              .center,
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        Row(
                                                          mainAxisSize:
                                                              MainAxisSize.max,
                                                          children: [
                                                            Text(
                                                              valueOrDefault<
                                                                  String>(
                                                                getJsonField(
                                                                  listUsersItem,
                                                                  r'''$.user.name''',
                                                                )?.toString(),
                                                                ' - ',
                                                              ),
                                                              style: AppTheme
                                                                      .of(context)
                                                                  .bodySmall
                                                                  .override(
                                                                    font: GoogleFonts
                                                                        .lexend(
                                                                      fontWeight:
                                                                          FontWeight
                                                                              .w500,
                                                                      fontStyle: AppTheme.of(
                                                                              context)
                                                                          .bodySmall
                                                                          .fontStyle,
                                                                    ),
                                                                    letterSpacing:
                                                                        0.0,
                                                                    fontWeight:
                                                                        FontWeight
                                                                            .w500,
                                                                    fontStyle: AppTheme.of(
                                                                            context)
                                                                        .bodySmall
                                                                        .fontStyle,
                                                                  ),
                                                            ),
                                                          ].divide(const SizedBox(
                                                              width: 4.0)),
                                                        ),
                                                        Padding(
                                                          padding:
                                                              const EdgeInsetsDirectional
                                                                  .fromSTEB(
                                                                      0.0,
                                                                      4.0,
                                                                      0.0,
                                                                      0.0),
                                                          child: Text(
                                                            valueOrDefault<
                                                                String>(
                                                              getJsonField(
                                                                listUsersItem,
                                                                r'''$.user.users_permissions.users_roles.role''',
                                                              )?.toString(),
                                                              ' - ',
                                                            ),
                                                            style: AppTheme
                                                                    .of(context)
                                                                .bodySmall
                                                                .override(
                                                                  font: GoogleFonts
                                                                      .lexend(
                                                                    fontWeight: AppTheme.of(
                                                                            context)
                                                                        .bodySmall
                                                                        .fontWeight,
                                                                    fontStyle: AppTheme.of(
                                                                            context)
                                                                        .bodySmall
                                                                        .fontStyle,
                                                                  ),
                                                                  color: AppTheme.of(
                                                                          context)
                                                                      .secondaryText,
                                                                  letterSpacing:
                                                                      0.0,
                                                                  fontWeight: AppTheme.of(
                                                                          context)
                                                                      .bodySmall
                                                                      .fontWeight,
                                                                  fontStyle: AppTheme.of(
                                                                          context)
                                                                      .bodySmall
                                                                      .fontStyle,
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
                                        );
                                      },
                                    );
                                  },
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
