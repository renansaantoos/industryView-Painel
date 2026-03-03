import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/components/loading_copy_widget.dart';
import '/components/loading_widget.dart';
import '/components/modal_info_widget.dart';
import '/components/nav_bar_widget.dart';
import '/components/offline_banner_widget.dart';
import '/core/widgets/app_animations.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/services/network_service.dart';
import '/core/widgets/app_button.dart';
import 'dart:math';
import 'dart:ui';
import '/index.dart';
import 'dart:async';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'escala_model.dart';
export 'escala_model.dart';

class EscalaWidget extends StatefulWidget {
  const EscalaWidget({super.key});

  static String routeName = 'Escala';
  static String routePath = '/escala';

  @override
  State<EscalaWidget> createState() => _EscalaWidgetState();
}

class _EscalaWidgetState extends State<EscalaWidget>
    with TickerProviderStateMixin {
  late EscalaModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();
  var hasContainerTriggered = false;
  final animationsMap = <String, AnimationInfo>{};
  int _lastConnectionRestoredTrigger = 0;

  void _persistManualSelection() {
    final serverIds = AppState().escalaServerIds.toList();
    final selectedIds = _model.setIds.toList();
    final removedIds =
        serverIds.where((id) => !selectedIds.contains(id)).toList();
    final localIds =
        selectedIds.where((id) => !serverIds.contains(id)).toList();
    AppState().update(() {
      AppState().escalaLocalIds = localIds;
      AppState().escalaRemovedIds = removedIds;
    });
  }

  void _applySelectionFromCache() {
    final serverIds = AppState().escalaServerIds.toList();
    final localIds = AppState().escalaLocalIds.toList();
    final removedIds = AppState().escalaRemovedIds.toList();
    _model.setIds = {
      ...serverIds.where((id) => !removedIds.contains(id)),
      ...localIds,
    }.toList();
    _model.allCheck = _model.setIds.isNotEmpty;
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => EscalaModel());
    _lastConnectionRestoredTrigger = AppState().connectionRestoredTrigger;

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      AppState().update(() {
        AppState().loading = true;
      });
      try {
        final isOnline = await NetworkService.instance.checkConnection();

        if (isOnline) {
          _model.validToken = await AuthenticationGroup
              .getTheRecordBelongingToTheAuthenticationTokenCall
              .call(
            bearerAuth: currentAuthenticationToken,
          );

          if (!(_model.validToken?.succeeded ?? true)) {
            safeSetState(() {});
            return;
          }
        } else {
          // Offline: tenta carregar seleção da escala do dia pelo cache local
          try {
            final escalaDia =
                await ProjectsGroup.listaColaboradoresDaEscalaDoDiaCall.call(
              projectsId: AppState().user.projectId,
              teamsId: AppState().user.teamsId,
              token: currentAuthenticationToken,
            );
            if (escalaDia.succeeded) {
              final idsSet = <int>{};
              final data = escalaDia.jsonBody;
              if (data is List) {
                for (final item in data) {
                  final usersIdRaw = getJsonField(
                    item,
                    r'''$.users_id''',
                    true,
                  );
                  if (usersIdRaw is List) {
                    idsSet.addAll(
                      usersIdRaw
                          .map(castToType<int>)
                          .whereType<int>(),
                    );
                  }
                }
              } else {
                final usersIdRaw = getJsonField(
                  data,
                  r'''$.users_id''',
                  true,
                );
                if (usersIdRaw is List) {
                  idsSet.addAll(
                    usersIdRaw
                        .map(castToType<int>)
                        .whereType<int>(),
                  );
                }
              }
              final ids = idsSet.toList();
              AppState().update(() {
                AppState().escalaServerIds = ids;
              });
            }
          } catch (_) {
            // Ignorar erro offline
          }
          _applySelectionFromCache();
          safeSetState(() {});
          return;
        }

        _model.escalaDia =
            await ProjectsGroup.listaColaboradoresDaEscalaDoDiaCall.call(
          projectsId: AppState().user.projectId,
          teamsId: AppState().user.teamsId,
          token: currentAuthenticationToken,
        );

        if ((_model.escalaDia?.succeeded ?? true)) {
          final apiIds = ProjectsGroup.listaColaboradoresDaEscalaDoDiaCall
                  .ids(
                    (_model.escalaDia?.jsonBody ?? ''),
                  )
                  ?.toList()
                  .cast<int>() ??
              <int>[];
          AppState().update(() {
            AppState().escalaServerIds = apiIds;
            AppState().escalaLocalIds = [];
            AppState().escalaRemovedIds = [];
          });
          _applySelectionFromCache();
          safeSetState(() {});
          return;
        } else {
          await showDialog(
            context: context,
            builder: (dialogContext) {
              return Dialog(
                elevation: 0,
                insetPadding: EdgeInsets.zero,
                backgroundColor: Colors.transparent,
                alignment: AlignmentDirectional(0.0, 0.0)
                    .resolve(Directionality.of(context)),
                child: GestureDetector(
                  onTap: () {
                    FocusScope.of(dialogContext).unfocus();
                    FocusManager.instance.primaryFocus?.unfocus();
                  },
                  child: ModalInfoWidget(
                    title: 'Erro',
                    description: getJsonField(
                      (_model.escalaDia?.jsonBody ?? ''),
                      r'''$.message''',
                    ).toString(),
                  ),
                ),
              );
            },
          );

          return;
        }
      } finally {
        AppState().update(() {
          AppState().loading = false;
        });
      }
    });

    _model.textController ??= TextEditingController();
    _model.textFieldFocusNode ??= FocusNode();

    animationsMap.addAll({
      'containerOnActionTriggerAnimation': AnimationInfo(
        trigger: AnimationTrigger.onActionTrigger,
        applyInitialState: false,
        effectsBuilder: () => [
          MoveEffect(
            curve: Curves.easeInOut,
            delay: 0.0.ms,
            duration: 600.0.ms,
            begin: Offset(0.0, -60.0),
            end: Offset(0.0, 0.0),
          ),
        ],
      ),
    });
    setupAnimations(
      animationsMap.values.where((anim) =>
          anim.trigger == AnimationTrigger.onActionTrigger ||
          !anim.applyInitialState),
      this,
    );

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
    final t = AppState().connectionRestoredTrigger;
    if (t != _lastConnectionRestoredTrigger) {
      _lastConnectionRestoredTrigger = t;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          AppState().clearEscalaCache();
          safeSetState(() {});
        }
      });
    }

    return Builder(
      builder: (context) => FutureBuilder<ApiCallResponse>(
        future: AppState()
            .escala(
          requestFn: () async {
            AppState().update(() {
              AppState().loading = true;
            });
            try {
              return await ProjectsGroup.listaMembrosDeUmaEquipeCall.call(
                teamsId: AppState().user.teamsId,
                page: _model.page,
                perPage: _model.perPage,
                token: currentAuthenticationToken,
                search: _model.textController.text,
              );
            } catch (_) {
              return const ApiCallResponse({}, {}, 503);
            } finally {
              AppState().update(() {
                AppState().loading = false;
              });
            }
          },
        )
            .then((result) {
          _model.apiRequestCompleted = true;
          return result;
        }),
        builder: (context, snapshot) {
          // Customize what your widget looks like when it's loading.
          if (!snapshot.hasData) {
            return Scaffold(
              backgroundColor: AppTheme.of(context).secondaryBackground,
              body: LoadingCopyWidget(),
            );
          }
          final escalaListaMembrosDeUmaEquipeResponse = snapshot.data!;

          return Stack(
            children: [
              GestureDetector(
            onTap: () {
              FocusScope.of(context).unfocus();
              FocusManager.instance.primaryFocus?.unfocus();
            },
            child: Scaffold(
              key: scaffoldKey,
              backgroundColor: AppTheme.of(context).secondaryBackground,
              appBar: AppBar(
                backgroundColor:
                    AppTheme.of(context).secondaryBackground,
                automaticallyImplyLeading: false,
                toolbarHeight: 0.0,
                actions: [],
                centerTitle: false,
                elevation: 0.0,
              ),
              body: SafeArea(
                top: true,
                child: Stack(
                  children: [
                    Align(
                      alignment: AlignmentDirectional(0.0, 1.0),
                      child: wrapWithModel(
                        model: _model.navBarModel,
                        updateCallback: () => safeSetState(() {}),
                        child: NavBarWidget(
                          page: 3,
                        ),
                      ),
                    ),
                    Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(24.0, 0.0, 24.0, 24.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          const SizedBox(height: 24.0),
                          const OfflineBannerWidget(
                            margin: EdgeInsetsDirectional.fromSTEB(
                                0.0, 0.0, 0.0, 12.0),
                          ),
                          Padding(
                            padding: const EdgeInsetsDirectional.fromSTEB(
                                0.0, 0.0, 0.0, 16.0),
                            child: Align(
                              alignment: AlignmentDirectional(-1.0, 0.0),
                              child: Row(
                                mainAxisSize: MainAxisSize.max,
                                mainAxisAlignment: MainAxisAlignment.start,
                                children: [
                                  Icon(
                                    Icons.people,
                                    color: AppTheme.of(context).primary,
                                    size: 22.0,
                                  ),
                                  Text(
                                    AppLocalizations.of(context).getText(
                                      'escala_page_title' /* Escala */,
                                    ),
                                    style: AppTheme.of(context)
                                        .titleLarge
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                AppTheme.of(context)
                                                    .titleLarge
                                                    .fontWeight,
                                            fontStyle: AppTheme.of(
                                                    context)
                                                .titleLarge
                                                .fontStyle,
                                          ),
                                          color: AppTheme.of(context)
                                              .primaryText,
                                          letterSpacing: 0.0,
                                          fontWeight: AppTheme.of(
                                                  context)
                                              .titleLarge
                                              .fontWeight,
                                          fontStyle: AppTheme.of(
                                                  context)
                                              .titleLarge
                                              .fontStyle,
                                        ),
                                  ),
                                ].divide(const SizedBox(width: 8.0)),
                              ),
                            ),
                          ),
                          Expanded(
                            child: Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 0.0, 50.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 600.0,
                                    child: TextFormField(
                                      controller: _model.textController,
                                      focusNode: _model.textFieldFocusNode,
                                      onChanged: (_) => EasyDebounce.debounce(
                                        '_model.textController',
                                        Duration(milliseconds: 700),
                                        () async {
                                          safeSetState(() {
                                            AppState().clearEscalaCache();
                                            _model.apiRequestCompleted = false;
                                          });
                                          await _model
                                              .waitForApiRequestCompleted();
                                        },
                                      ),
                                      onFieldSubmitted: (_) async {
                                        safeSetState(() {
                                          AppState().clearEscalaCache();
                                          _model.apiRequestCompleted = false;
                                        });
                                        await _model
                                            .waitForApiRequestCompleted();
                                      },
                                      autofocus: false,
                                      obscureText: false,
                                      decoration: InputDecoration(
                                        labelText:
                                            AppLocalizations.of(context).getText(
                                          'qbcn9pb2' /* Procurar por nome do funcionar... */,
                                        ),
                                        labelStyle: AppTheme.of(context)
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
                                        hintStyle: AppTheme.of(context)
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
                                        enabledBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: AppTheme.of(context)
                                                .alternate,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(14.0),
                                        ),
                                        focusedBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: AppTheme.of(context)
                                                .primary,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(14.0),
                                        ),
                                        errorBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: AppTheme.of(context)
                                                .error,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(14.0),
                                        ),
                                        focusedErrorBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: AppTheme.of(context)
                                                .error,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(14.0),
                                        ),
                                        filled: true,
                                        fillColor: AppTheme.of(context)
                                            .primaryBackground,
                                        contentPadding:
                                            EdgeInsetsDirectional.fromSTEB(
                                                20.0, 0.0, 0.0, 0.0),
                                        prefixIcon: Icon(
                                          Icons.search_sharp,
                                        ),
                                      ),
                                      style: AppTheme.of(context)
                                          .bodySmall
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight: FontWeight.w500,
                                              fontStyle:
                                                  AppTheme.of(context)
                                                      .bodySmall
                                                      .fontStyle,
                                            ),
                                            letterSpacing: 0.0,
                                            fontWeight: FontWeight.w500,
                                            fontStyle:
                                                AppTheme.of(context)
                                                    .bodySmall
                                                    .fontStyle,
                                          ),
                                      cursorColor:
                                          AppTheme.of(context).primary,
                                      validator: _model.textControllerValidator
                                          .asValidator(context),
                                    ),
                                  ),
                                  Expanded(
                                    child: Container(
                                      decoration: BoxDecoration(),
                                      child: Column(
                                        mainAxisSize: MainAxisSize.max,
                                        children: [
                                          Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    0.0, 16.0, 0.0, 16.0),
                                            child: Container(
                                              height: 40.0,
                                              decoration: BoxDecoration(
                                                color:
                                                    AppTheme.of(context)
                                                        .primaryBackground,
                                                borderRadius:
                                                    BorderRadius.circular(14.0),
                                                border: Border.all(
                                                  color: AppTheme.of(
                                                          context)
                                                      .alternate,
                                                ),
                                              ),
                                              child: Padding(
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        16.0, 0.0, 16.0, 0.0),
                                                child: Row(
                                                  mainAxisSize:
                                                      MainAxisSize.max,
                                                  children: [
                                                    Expanded(
                                                      child: Text(
                                                        AppLocalizations.of(
                                                                context)
                                                            .getText(
                                                          'bz6r8act' /* Selecionados para a escala */,
                                                        ),
                                                        style:
                                                            AppTheme.of(
                                                                    context)
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
                                                                  color: AppTheme.of(
                                                                          context)
                                                                      .primaryText,
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
                                                    Text(
                                                      valueOrDefault<String>(
                                                        _model.setIds.length
                                                            .toString(),
                                                        '0',
                                                      ),
                                                      style:
                                                          AppTheme.of(
                                                                  context)
                                                              .bodyMedium
                                                              .override(
                                                                font:
                                                                    GoogleFonts
                                                                        .lexend(
                                                                  fontWeight: AppTheme.of(
                                                                          context)
                                                                      .bodyMedium
                                                                      .fontWeight,
                                                                  fontStyle: AppTheme.of(
                                                                          context)
                                                                      .bodyMedium
                                                                      .fontStyle,
                                                                ),
                                                                color: AppTheme.of(
                                                                        context)
                                                                    .primary,
                                                                letterSpacing:
                                                                    0.0,
                                                                fontWeight: AppTheme.of(
                                                                        context)
                                                                    .bodyMedium
                                                                    .fontWeight,
                                                                fontStyle: AppTheme.of(
                                                                        context)
                                                                    .bodyMedium
                                                                    .fontStyle,
                                                              ),
                                                    ),
                                                    Row(
                                                      mainAxisSize:
                                                          MainAxisSize.max,
                                                      children: [
                                                        if (!(_model
                                                            .setIds.isNotEmpty))
                                                          InkWell(
                                                            splashColor: Colors
                                                                .transparent,
                                                            focusColor: Colors
                                                                .transparent,
                                                            hoverColor: Colors
                                                                .transparent,
                                                            highlightColor:
                                                                Colors
                                                                    .transparent,
                                                            onTap: () async {
                                                              final allUsers =
                                                                  ProjectsGroup
                                                                          .listaMembrosDeUmaEquipeCall
                                                                          .list(
                                                                            escalaListaMembrosDeUmaEquipeResponse
                                                                                .jsonBody,
                                                                          ) ??
                                                                      [];
                                                              _model
                                                                  .setIds = (allUsers
                                                                      .map((e) =>
                                                                          getJsonField(
                                                                            e,
                                                                            r'''$.users.id''',
                                                                          ))
                                                                      .toList() as List)
                                                                  .cast<int>()
                                                                  .toList()
                                                                  .cast<int>();
                                                              _model.allCheck =
                                                                  true;
                                                              _persistManualSelection();
                                                              safeSetState(
                                                                  () {});
                                                            },
                                                            child: Container(
                                                              width: 18.0,
                                                              height: 18.0,
                                                              decoration:
                                                                  BoxDecoration(
                                                                color: AppTheme.of(
                                                                        context)
                                                                    .secondaryBackground,
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            4.0),
                                                                border:
                                                                    Border.all(
                                                                  color: AppTheme.of(
                                                                          context)
                                                                      .alternate,
                                                                  width: 2.0,
                                                                ),
                                                              ),
                                                            ),
                                                          ),
                                                        if (_model
                                                            .setIds.isNotEmpty)
                                                          InkWell(
                                                            splashColor: Colors
                                                                .transparent,
                                                            focusColor: Colors
                                                                .transparent,
                                                            hoverColor: Colors
                                                                .transparent,
                                                            highlightColor:
                                                                Colors
                                                                    .transparent,
                                                            onTap: () async {
                                                              _model.setIds =
                                                                  [];
                                                              _model.allCheck =
                                                                  false;
                                                              _persistManualSelection();
                                                              safeSetState(
                                                                  () {});
                                                            },
                                                            child: Container(
                                                              width: 18.0,
                                                              height: 18.0,
                                                              decoration:
                                                                  BoxDecoration(
                                                                color: AppTheme.of(
                                                                        context)
                                                                    .primary,
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            4.0),
                                                                border:
                                                                    Border.all(
                                                                  color: AppTheme.of(
                                                                          context)
                                                                      .primary,
                                                                  width: 2.0,
                                                                ),
                                                              ),
                                                              alignment:
                                                                  AlignmentDirectional(
                                                                      0.0, 0.0),
                                                              child: Align(
                                                                alignment:
                                                                    AlignmentDirectional(
                                                                        0.0,
                                                                        0.0),
                                                                child: Stack(
                                                                  alignment:
                                                                      AlignmentDirectional(
                                                                          0.0,
                                                                          0.0),
                                                                  children: [
                                                                    if (!_model
                                                                        .allCheck)
                                                                      Align(
                                                                        alignment: AlignmentDirectional(
                                                                            0.0,
                                                                            0.0),
                                                                        child:
                                                                            FaIcon(
                                                                          FontAwesomeIcons
                                                                              .check,
                                                                          color:
                                                                              AppTheme.of(context).info,
                                                                          size:
                                                                              14.0,
                                                                        ),
                                                                      ),
                                                                    if (_model
                                                                        .allCheck)
                                                                      Align(
                                                                        alignment: AlignmentDirectional(
                                                                            0.0,
                                                                            0.0),
                                                                        child:
                                                                            Container(
                                                                          width:
                                                                              100.0,
                                                                          height:
                                                                              3.0,
                                                                          decoration:
                                                                              BoxDecoration(
                                                                            color:
                                                                                AppTheme.of(context).secondaryBackground,
                                                                          ),
                                                                        ),
                                                                      ),
                                                                  ],
                                                                ),
                                                              ),
                                                            ),
                                                          ),
                                                      ],
                                                    ),
                                                  ].divide(
                                                      SizedBox(width: 4.0)),
                                                ),
                                              ),
                                            ),
                                          ),
                                          Expanded(
                                            child: Padding(
                                              padding: EdgeInsetsDirectional
                                                  .fromSTEB(
                                                      0.0, 0.0, 0.0, 16.0),
                                              child: Builder(
                                                builder: (context) {
                                                  final rawList = ProjectsGroup
                                                          .listaMembrosDeUmaEquipeCall
                                                          .list(
                                                            escalaListaMembrosDeUmaEquipeResponse
                                                                .jsonBody,
                                                          )
                                                          ?.toList() ??
                                                      [];
                                                  
                                                  // Filtrar apenas itens válidos (objetos JSON, não strings de erro)
                                                  final list = rawList.where((item) {
                                                    if (item is String) return false;
                                                    try {
                                                      final name = getJsonField(item, r'''$.users.name''');
                                                      return name != null && name.toString().isNotEmpty;
                                                    } catch (e) {
                                                      return false;
                                                    }
                                                  }).toList();

                                                  return RefreshIndicator(
                                                    onRefresh: () async {
                                                      safeSetState(() {
                                                        AppState()
                                                            .clearEscalaCache();
                                                        _model.apiRequestCompleted =
                                                            false;
                                                      });
                                                      await _model
                                                          .waitForApiRequestCompleted();
                                                    },
                                                    child: ListView.separated(
                                                      padding: EdgeInsets.zero,
                                                      shrinkWrap: true,
                                                      scrollDirection:
                                                          Axis.vertical,
                                                      itemCount: list.length,
                                                      separatorBuilder:
                                                          (_, __) => SizedBox(
                                                              height: 12.0),
                                                      itemBuilder:
                                                          (context, listIndex) {
                                                        final listItem =
                                                            list[listIndex];
                                                        return Container(
                                                          width:
                                                              MediaQuery.sizeOf(
                                                                          context)
                                                                      .width *
                                                                  1.0,
                                                          decoration:
                                                              BoxDecoration(
                                                            gradient:
                                                                LinearGradient(
                                                              colors: [
                                                                AppTheme.of(
                                                                        context)
                                                                    .secondaryBackground,
                                                                AppTheme.of(
                                                                        context)
                                                                    .primaryBackground
                                                              ],
                                                              stops: [0.0, 1.0],
                                                              begin:
                                                                  AlignmentDirectional(
                                                                      -1.0,
                                                                      0.0),
                                                              end:
                                                                  AlignmentDirectional(
                                                                      1.0, 0),
                                                            ),
                                                            borderRadius:
                                                                BorderRadius
                                                                    .circular(
                                                                        12.0),
                                                            border: Border.all(
                                                              color: AppTheme
                                                                      .of(context)
                                                                  .alternate,
                                                            ),
                                                          ),
                                                          child: Padding(
                                                            padding:
                                                                EdgeInsetsDirectional
                                                                    .fromSTEB(
                                                                        12.0,
                                                                        4.0,
                                                                        12.0,
                                                                        4.0),
                                                            child: Row(
                                                              mainAxisSize:
                                                                  MainAxisSize
                                                                      .max,
                                                              children: [
                                                                Padding(
                                                                  padding: EdgeInsetsDirectional
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
                                                                          .setIds
                                                                          .contains(
                                                                              getJsonField(
                                                                        listItem,
                                                                        r'''$.users.id''',
                                                                      )))
                                                                        InkWell(
                                                                          splashColor:
                                                                              Colors.transparent,
                                                                          focusColor:
                                                                              Colors.transparent,
                                                                          hoverColor:
                                                                              Colors.transparent,
                                                                          highlightColor:
                                                                              Colors.transparent,
                                                                          onTap:
                                                                              () async {
                                                                            _model.addToSetIds(getJsonField(
                                                                              listItem,
                                                                              r'''$.users.id''',
                                                                            ));
                                                                            _persistManualSelection();
                                                                            safeSetState(() {});
                                                                          },
                                                                          child:
                                                                              Container(
                                                                            width:
                                                                                18.0,
                                                                            height:
                                                                                18.0,
                                                                            decoration:
                                                                                BoxDecoration(
                                                                              color: AppTheme.of(context).secondaryBackground,
                                                                              borderRadius: BorderRadius.circular(4.0),
                                                                              border: Border.all(
                                                                                color: AppTheme.of(context).alternate,
                                                                                width: 2.0,
                                                                              ),
                                                                            ),
                                                                          ),
                                                                        ),
                                                                      if (_model
                                                                          .setIds
                                                                          .contains(
                                                                              getJsonField(
                                                                        listItem,
                                                                        r'''$.users.id''',
                                                                      )))
                                                                        InkWell(
                                                                          splashColor:
                                                                              Colors.transparent,
                                                                          focusColor:
                                                                              Colors.transparent,
                                                                          hoverColor:
                                                                              Colors.transparent,
                                                                          highlightColor:
                                                                              Colors.transparent,
                                                                          onTap:
                                                                              () async {
                                                                            _model.removeFromSetIds(getJsonField(
                                                                              listItem,
                                                                              r'''$.users.id''',
                                                                            ));
                                                                            _persistManualSelection();
                                                                            safeSetState(() {});
                                                                          },
                                                                          child:
                                                                              Container(
                                                                            width:
                                                                                18.0,
                                                                            height:
                                                                                18.0,
                                                                            decoration:
                                                                                BoxDecoration(
                                                                              color: AppTheme.of(context).primary,
                                                                              borderRadius: BorderRadius.circular(4.0),
                                                                              border: Border.all(
                                                                                color: AppTheme.of(context).primary,
                                                                                width: 2.0,
                                                                              ),
                                                                            ),
                                                                            alignment:
                                                                                AlignmentDirectional(0.0, 0.0),
                                                                            child:
                                                                                Align(
                                                                              alignment: AlignmentDirectional(0.0, 0.0),
                                                                              child: Stack(
                                                                                alignment: AlignmentDirectional(0.0, 0.0),
                                                                                children: [
                                                                                  if (!_model.allCheck)
                                                                                    Align(
                                                                                      alignment: AlignmentDirectional(0.0, 0.0),
                                                                                      child: FaIcon(
                                                                                        FontAwesomeIcons.check,
                                                                                        color: AppTheme.of(context).info,
                                                                                        size: 14.0,
                                                                                      ),
                                                                                    ),
                                                                                  if (_model.allCheck)
                                                                                    Align(
                                                                                      alignment: AlignmentDirectional(0.0, 0.0),
                                                                                      child: Container(
                                                                                        width: 100.0,
                                                                                        height: 3.0,
                                                                                        decoration: BoxDecoration(
                                                                                          color: AppTheme.of(context).secondaryBackground,
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                ],
                                                                              ),
                                                                            ),
                                                                          ),
                                                                        ),
                                                                    ],
                                                                  ),
                                                                ),
                                                                if (NetworkService.instance.isConnected)
                                                                  ClipRRect(
                                                                    borderRadius:
                                                                        BorderRadius
                                                                            .circular(
                                                                                40.0),
                                                                    child: Image
                                                                        .network(
                                                                      valueOrDefault<
                                                                          String>(
                                                                        getJsonField(
                                                                          listItem,
                                                                          r'''$.users.profile_picture.url''',
                                                                        )?.toString(),
                                                                        'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg',
                                                                      ),
                                                                      width: 36.0,
                                                                      height:
                                                                          36.0,
                                                                      fit: BoxFit
                                                                          .cover,
                                                                    ),
                                                                  ),
                                                                Expanded(
                                                                  child: Padding(
                                                                    padding: EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            8.0,
                                                                            0.0,
                                                                            0.0,
                                                                            0.0),
                                                                    child: Column(
                                                                      mainAxisSize:
                                                                          MainAxisSize
                                                                              .min,
                                                                      mainAxisAlignment:
                                                                          MainAxisAlignment
                                                                              .center,
                                                                      crossAxisAlignment:
                                                                          CrossAxisAlignment
                                                                              .start,
                                                                      children: [
                                                                        Text(
                                                                          valueOrDefault<String>(
                                                                            getJsonField(
                                                                              listItem,
                                                                              r'''$.users.name''',
                                                                            )?.toString(),
                                                                            ' - ',
                                                                          ),
                                                                          style: AppTheme.of(context).bodySmall.override(
                                                                                font: GoogleFonts.lexend(
                                                                                  fontWeight: FontWeight.w500,
                                                                                  fontStyle: AppTheme.of(context).bodySmall.fontStyle,
                                                                                ),
                                                                                letterSpacing: 0.0,
                                                                                fontWeight: FontWeight.w500,
                                                                                fontStyle: AppTheme.of(context).bodySmall.fontStyle,
                                                                              ),
                                                                          overflow: TextOverflow.ellipsis,
                                                                          maxLines: 1,
                                                                        ),
                                                                        Padding(
                                                                          padding: EdgeInsetsDirectional.fromSTEB(
                                                                              0.0,
                                                                              4.0,
                                                                              0.0,
                                                                              0.0),
                                                                          child:
                                                                              Text(
                                                                            valueOrDefault<
                                                                                String>(
                                                                              getJsonField(
                                                                                listItem,
                                                                                r'''$.users.users_permissions.users_roles.role''',
                                                                              )?.toString(),
                                                                              ' - ',
                                                                            ),
                                                                            style: AppTheme.of(context)
                                                                                .bodySmall
                                                                                .override(
                                                                                  font: GoogleFonts.lexend(
                                                                                    fontWeight: AppTheme.of(context).bodySmall.fontWeight,
                                                                                    fontStyle: AppTheme.of(context).bodySmall.fontStyle,
                                                                                  ),
                                                                                  color: AppTheme.of(context).secondaryText,
                                                                                  letterSpacing: 0.0,
                                                                                  fontWeight: AppTheme.of(context).bodySmall.fontWeight,
                                                                                  fontStyle: AppTheme.of(context).bodySmall.fontStyle,
                                                                                ),
                                                                            overflow: TextOverflow.ellipsis,
                                                                            maxLines: 1,
                                                                          ),
                                                                        ),
                                                                      ],
                                                                    ),
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                          ),
                                                        );
                                                      },
                                                    ),
                                                  );
                                                },
                                              ),
                                            ),
                                          ),
                                          if (_model.page <
                                              (ProjectsGroup
                                                      .listaMembrosDeUmaEquipeCall
                                                      .pageTotal(
                                                    escalaListaMembrosDeUmaEquipeResponse
                                                        .jsonBody,
                                                  ) ??
                                                  0))
                                            Align(
                                              alignment: AlignmentDirectional(
                                                  -1.0, 0.0),
                                              child: AppButton(
                                                onPressed: () async {
                                                  _model.perPage =
                                                      _model.perPage + 20;
                                                  safeSetState(() {});
                                                  safeSetState(() {
                                                    AppState()
                                                        .clearEscalaCache();
                                                    _model.apiRequestCompleted =
                                                        false;
                                                  });
                                                  await _model
                                                      .waitForApiRequestCompleted();
                                                },
                                                text:
                                                    AppLocalizations.of(context)
                                                        .getText(
                                                  'x0n39t43' /* Ver mais */,
                                                ),
                                                options: AppButtonOptions(
                                                  height: 32.0,
                                                  padding: EdgeInsetsDirectional
                                                      .fromSTEB(
                                                          16.0, 0.0, 16.0, 0.0),
                                                  iconPadding:
                                                      EdgeInsetsDirectional
                                                          .fromSTEB(0.0, 0.0,
                                                              0.0, 0.0),
                                                  color: AppTheme.of(
                                                          context)
                                                      .secondary,
                                                  textStyle: AppTheme
                                                          .of(context)
                                                      .labelSmall
                                                      .override(
                                                        font:
                                                            GoogleFonts.lexend(
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
                                                      BorderRadius.circular(
                                                          12.0),
                                                ),
                                              ),
                                            ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  Builder(
                                    builder: (context) => Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          0.0, 16.0, 0.0, 0.0),
                                      child: AppButton(
                                        onPressed: () async {
                                          var _shouldSetState = false;
                                          if (_model.setIds.isNotEmpty) {
                                            _model.editaEscala = await ProjectsGroup
                                                .editaEscalaDosColaboradoresCall
                                                .call(
                                              usersIdList: _model.setIds,
                                              scheduleId:
                                                  AppState().user.sheduleId,
                                              token: currentAuthenticationToken,
                                            );

                                            _shouldSetState = true;
                                            if ((_model
                                                    .editaEscala?.succeeded ??
                                                true)) {
                                              safeSetState(() {
                                                AppState().clearEscalaCache();
                                                _model.apiRequestCompleted =
                                                    false;
                                              });
                                              await _model
                                                  .waitForApiRequestCompleted();
                                              _model.sucesso = true;
                                              safeSetState(() {});
                                              await Future.delayed(
                                                Duration(
                                                  milliseconds: 1500,
                                                ),
                                              );
                                              _model.sucesso = false;
                                              safeSetState(() {});
                                              if (_shouldSetState)
                                                safeSetState(() {});
                                              return;
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
                                                        AlignmentDirectional(
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
                                                      child: ModalInfoWidget(
                                                        title:
                                                            AppLocalizations.of(
                                                                    context)
                                                                .getText(
                                                          '0faydghs' /* Erro */,
                                                        ),
                                                        description:
                                                            getJsonField(
                                                          (_model.editaEscala
                                                                  ?.jsonBody ??
                                                              ''),
                                                          r'''$.message''',
                                                        ).toString(),
                                                      ),
                                                    ),
                                                  );
                                                },
                                              );

                                              if (_shouldSetState)
                                                safeSetState(() {});
                                              return;
                                            }
                                          } else {
                                            await showDialog(
                                              context: context,
                                              builder: (dialogContext) {
                                                return Dialog(
                                                  elevation: 0,
                                                  insetPadding: EdgeInsets.zero,
                                                  backgroundColor:
                                                      Colors.transparent,
                                                  alignment:
                                                      AlignmentDirectional(
                                                              0.0, 0.0)
                                                          .resolve(
                                                              Directionality.of(
                                                                  context)),
                                                  child: GestureDetector(
                                                    onTap: () {
                                                      FocusScope.of(
                                                              dialogContext)
                                                          .unfocus();
                                                      FocusManager
                                                          .instance.primaryFocus
                                                          ?.unfocus();
                                                    },
                                                    child: ModalInfoWidget(
                                                      title: AppLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'nm5v3yl8' /* Selecione um colaborador */,
                                                      ),
                                                      description:
                                                          AppLocalizations.of(
                                                                  context)
                                                              .getText(
                                                        'gm0fjm1z' /* É preciso selecionar um ou mai... */,
                                                      ),
                                                    ),
                                                  ),
                                                );
                                              },
                                            );

                                            if (_shouldSetState)
                                              safeSetState(() {});
                                            return;
                                          }

                                          if (_shouldSetState)
                                            safeSetState(() {});
                                        },
                                        text:
                                            AppLocalizations.of(context).getText(
                                          'jpsimc69' /* Atualizar escala */,
                                        ),
                                        options: AppButtonOptions(
                                          width:
                                              MediaQuery.sizeOf(context).width *
                                                  1.0,
                                          height: 48.0,
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  16.0, 0.0, 16.0, 0.0),
                                          iconPadding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  0.0, 0.0, 0.0, 0.0),
                                          color: AppTheme.of(context)
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
                                                color:
                                                    AppTheme.of(context)
                                                        .info,
                                                fontSize: 16.0,
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
                                          borderRadius:
                                              BorderRadius.circular(14.0),
                                        ),
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
                    if (_model.sucesso)
                      Container(
                        width: double.infinity,
                        height: 60.0,
                        decoration: BoxDecoration(
                          color: AppTheme.of(context).status04,
                          boxShadow: [
                            BoxShadow(
                              blurRadius: 4.0,
                              color: Color(0x33000000),
                              offset: Offset(
                                0.0,
                                2.0,
                              ),
                            )
                          ],
                          borderRadius: BorderRadius.only(
                            bottomLeft: Radius.circular(14.0),
                            bottomRight: Radius.circular(14.0),
                            topLeft: Radius.circular(0.0),
                            topRight: Radius.circular(0.0),
                          ),
                        ),
                        alignment: AlignmentDirectional(0.0, 0.0),
                        child: Row(
                          mainAxisSize: MainAxisSize.max,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            FaIcon(
                              FontAwesomeIcons.solidCheckCircle,
                              color: AppTheme.of(context).success,
                              size: 24.0,
                            ),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 0.0, 16.0, 0.0),
                              child: Text(
                                AppLocalizations.of(context).getText(
                                  'yj5ftx57' /* Escala atualizado com sucesso. */,
                                ),
                                style: AppTheme.of(context)
                                    .bodyMedium
                                    .override(
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
                            ),
                          ],
                        ),
                      ).animateOnActionTrigger(
                          animationsMap['containerOnActionTriggerAnimation']!,
                          hasBeenTriggered: hasContainerTriggered),
                  ],
                ),
              ),
            ),
              ),
              const LoadingWidget(),
            ],
          );
        },
      ),
    );
  }
}
