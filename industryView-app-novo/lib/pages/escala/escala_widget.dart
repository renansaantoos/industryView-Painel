import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/logout_widget.dart';
import '/components/modal_info_widget.dart';
import '/components/nav_bar_widget.dart';
import '/components/offline_banner_widget.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_drop_down.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/widgets/form_field_controller.dart';
import '/services/network_service.dart';
import '/index.dart';
import '/pages/project_selection/project_selection_widget.dart';
import '/core/navigation/nav.dart';
import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
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

class _EscalaWidgetState extends State<EscalaWidget> {
  late EscalaModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();
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

    SchedulerBinding.instance.addPostFrameCallback((_) async {
      AppState().update(() {
        AppState().loading = true;
      });
      try {
        final isOnline = await NetworkService.instance.checkConnection();

        if (isOnline) {
          _model.validToken = await AuthenticationGroup
              .getTheRecordBelongingToTheAuthenticationTokenCall
              .call(bearerAuth: currentAuthenticationToken);

          if (!(_model.validToken?.succeeded ?? true)) {
            safeSetState(() {});
            return;
          }
        } else {
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
                  final usersIdRaw = getJsonField(item, r'''$.users_id''', true);
                  if (usersIdRaw is List) {
                    idsSet.addAll(usersIdRaw.map(castToType<int>).whereType<int>());
                  }
                }
              } else {
                final usersIdRaw = getJsonField(data, r'''$.users_id''', true);
                if (usersIdRaw is List) {
                  idsSet.addAll(usersIdRaw.map(castToType<int>).whereType<int>());
                }
              }
              AppState().update(() {
                AppState().escalaServerIds = idsSet.toList();
              });
            }
          } catch (_) {}
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
                  .ids((_model.escalaDia?.jsonBody))
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
          if (mounted) {
            await showDialog(
              context: context,
              builder: (dialogContext) => Dialog(
                elevation: 0,
                insetPadding: EdgeInsets.zero,
                backgroundColor: Colors.transparent,
                alignment: const AlignmentDirectional(0.0, 0.0)
                    .resolve(Directionality.of(context)),
                child: GestureDetector(
                  onTap: () {
                    FocusScope.of(dialogContext).unfocus();
                    FocusManager.instance.primaryFocus?.unfocus();
                  },
                  child: ModalInfoWidget(
                    title: 'Erro',
                    description: getJsonField(
                      (_model.escalaDia?.jsonBody),
                      r'''$.message''',
                    ).toString(),
                  ),
                ),
              ),
            );
          }
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

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();
    super.dispose();
  }

  // ─── Avatar colors ──────────────────────────────────────────────────────────
  static const _avatarColors = [
    Color(0xFF105DFB),
    Color(0xFF8B5CF6),
    Color(0xFF06B6D4),
    Color(0xFFF59E0B),
    Color(0xFF10B981),
    Color(0xFFEF4444),
  ];

  String _getInitials(String name) {
    final parts = name.trim().split(' ');
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[parts.length - 1][0]}'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<AppState>();
    final theme = AppTheme.of(context);

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
          if (!snapshot.hasData) {
            return Scaffold(
              backgroundColor: theme.secondaryBackground,
              body: const Center(child: CircularProgressIndicator()),
            );
          }
          final escalaResponse = snapshot.data!;

          return Stack(
            children: [
              GestureDetector(
                onTap: () {
                  FocusScope.of(context).unfocus();
                  FocusManager.instance.primaryFocus?.unfocus();
                },
                child: Scaffold(
                  key: scaffoldKey,
                  backgroundColor: const Color(0xFFF5F7FA),
                  appBar: _buildAppBar(theme),
                  body: SafeArea(
                    top: true,
                    child: Stack(
                      children: [
                        // NavBar
                        Align(
                          alignment: const AlignmentDirectional(0.0, 1.0),
                          child: wrapWithModel(
                            model: _model.navBarModel,
                            updateCallback: () => safeSetState(() {}),
                            child: const NavBarWidget(page: 3),
                          ),
                        ),
                        // Content
                        Padding(
                          padding: const EdgeInsetsDirectional.fromSTEB(16, 8, 16, 16),
                          child: Column(
                            children: [
                              const OfflineBannerWidget(
                                margin: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 8),
                              ),
                              // Project name + switch
                              _buildProjectHeader(theme),
                              const SizedBox(height: 12),
                              // Search bar
                              _buildSearchBar(theme),
                              const SizedBox(height: 12),
                              // Selection header
                              _buildSelectionHeader(theme, escalaResponse),
                              const SizedBox(height: 10),
                              // Workers list
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsetsDirectional.fromSTEB(0, 0, 0, 64),
                                  child: Column(
                                    children: [
                                      Expanded(
                                        child: _buildWorkersList(theme, escalaResponse),
                                      ),
                                      // Load more
                                      if (_model.page <
                                          (ProjectsGroup.listaMembrosDeUmaEquipeCall
                                                  .pageTotal(escalaResponse.jsonBody) ??
                                              0))
                                        _buildLoadMoreButton(theme),
                                      const SizedBox(height: 12),
                                      // Update button
                                      _buildUpdateButton(theme),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Success banner
                        if (_model.sucesso) _buildSuccessBanner(theme),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  // ─── AppBar (identical to home) ───────────────────────────────────────────
  PreferredSizeWidget _buildAppBar(AppTheme theme) {
    return PreferredSize(
      preferredSize: const Size.fromHeight(85.0),
      child: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: false,
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.light,
          statusBarBrightness: Brightness.dark,
        ),
        actions: const [],
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF011741), Color(0xFF0A2F6E)],
            ),
          ),
          child: FlexibleSpaceBar(
            title: Padding(
              padding: const EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 4.0),
              child: Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Expanded(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Builder(
                          builder: (context) => Padding(
                            padding: const EdgeInsetsDirectional.fromSTEB(0, 0, 12, 0),
                            child: InkWell(
                              splashColor: Colors.transparent,
                              focusColor: Colors.transparent,
                              hoverColor: Colors.transparent,
                              highlightColor: Colors.transparent,
                              onTap: () async {
                                showDialog(
                                  barrierColor: const Color(0x80000000),
                                  context: context,
                                  builder: (dialogContext) => Dialog(
                                    elevation: 0,
                                    insetPadding: EdgeInsets.zero,
                                    backgroundColor: Colors.transparent,
                                    alignment: const AlignmentDirectional(-1.0, -1.0)
                                        .resolve(Directionality.of(context)),
                                    child: GestureDetector(
                                      onTap: () {
                                        FocusScope.of(dialogContext).unfocus();
                                        FocusManager.instance.primaryFocus?.unfocus();
                                      },
                                      child: LogoutWidget(),
                                    ),
                                  ),
                                );
                              },
                              child: Container(
                                width: 44.0,
                                height: 44.0,
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.15),
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Colors.white.withValues(alpha: 0.4),
                                    width: 2.0,
                                  ),
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(100.0),
                                  child: CachedNetworkImage(
                                    imageUrl: valueOrDefault<String>(
                                      AppState().user.image,
                                      'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg',
                                    ),
                                    width: 48.0,
                                    height: 48.0,
                                    fit: BoxFit.cover,
                                    placeholder: (context, url) => Container(
                                      color: theme.secondaryBackground,
                                    ),
                                    errorWidget: (context, url, error) => Container(
                                      color: theme.secondaryBackground,
                                      child: Icon(Icons.person, color: theme.secondaryText),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Olá',
                              style: GoogleFonts.lexend(
                                fontSize: 12.0,
                                fontWeight: FontWeight.w400,
                                color: Colors.white.withValues(alpha: 0.75),
                                letterSpacing: 0.2,
                              ),
                            ),
                            Text(
                              () {
                                final fullName = valueOrDefault<String>(
                                  AppState().user.name, ' - ');
                                final parts = fullName.trim().split(' ');
                                if (parts.length <= 2) return fullName;
                                return '${parts.first} ${parts.last}';
                              }(),
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                              style: GoogleFonts.lexend(
                                fontSize: 15.0,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                                letterSpacing: 0.1,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Builder(
                        builder: (context) => AppIconButton(
                          borderRadius: 10.0,
                          buttonSize: 36.0,
                          fillColor: Colors.white.withValues(alpha: 0.15),
                          icon: const Icon(
                            Icons.qr_code_rounded,
                            color: Colors.white,
                            size: 18.0,
                          ),
                          onPressed: () {
                            context.goNamedAuth(
                              PageCheckQrcodeWidget.routeName,
                              context.mounted,
                              extra: <String, dynamic>{
                                kTransitionInfoKey: const TransitionInfo(
                                  hasTransition: true,
                                  transitionType: PageTransitionType.fade,
                                  duration: Duration(milliseconds: 250),
                                ),
                              },
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 6.0),
                      AppDropDown<String>(
                        controller: _model.dropDownValueController2 ??=
                            FormFieldController<String>(
                          _model.dropDownValue2 ??=
                              AppLocalizations.of(context).languageCode,
                        ),
                        options: List<String>.from(['pt', 'en', 'es']),
                        optionLabels: const ['PT', 'EN', 'ES'],
                        onChanged: (val) async {
                          if (val == null) return;
                          safeSetState(() => _model.dropDownValue2 = val);
                          await AppLocalizations.storeLocale(val);
                          setAppLanguage(context, val);
                        },
                        width: 70.0,
                        height: 36.0,
                        textStyle: GoogleFonts.lexend(
                          fontSize: 12.0,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                        hintText: 'PT',
                        icon: const Icon(
                          Icons.keyboard_arrow_down_rounded,
                          color: Colors.white70,
                          size: 18.0,
                        ),
                        fillColor: Colors.white.withValues(alpha: 0.15),
                        elevation: 0.0,
                        borderColor: Colors.white.withValues(alpha: 0.25),
                        borderWidth: 1.0,
                        borderRadius: 10.0,
                        margin: const EdgeInsetsDirectional.fromSTEB(4, 0, 0, 0),
                        hidesUnderline: true,
                        isOverButton: false,
                        isSearchable: false,
                        isMultiSelect: false,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            centerTitle: true,
            expandedTitleScale: 1.0,
          ),
        ),
      ),
    );
  }

  // ─── Project header ─────────────────────────────────────────────────────────
  Widget _buildProjectHeader(AppTheme theme) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: Row(
              children: [
                Icon(Icons.business_rounded, color: theme.primary, size: 18.0),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    AppState().user.projectName.isNotEmpty
                        ? (AppState().user.teamName.isNotEmpty
                            ? '${AppState().user.projectName} / ${AppState().user.teamName}'
                            : AppState().user.projectName)
                        : 'Projeto',
                    style: GoogleFonts.lexend(
                      fontSize: 14.0,
                      fontWeight: FontWeight.w600,
                      color: theme.primaryText,
                      letterSpacing: 0.0,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          InkWell(
            onTap: () {
              AppState().updateUserStruct(
                (e) => e
                  ..sheduleId = null
                  ..projectId = null
                  ..teamsId = null
                  ..teamName = null
                  ..sprint = SprintsStruct(),
              );
              AppState().update(() {});
              if (!context.mounted) return;
              context.goNamedAuth(
                ProjectSelectionWidget.routeName,
                context.mounted,
                extra: <String, dynamic>{
                  kTransitionInfoKey: const TransitionInfo(
                    hasTransition: true,
                    transitionType: PageTransitionType.fade,
                  ),
                },
              );
            },
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.swap_horiz_rounded, color: theme.primary, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    'Trocar',
                    style: GoogleFonts.lexend(
                      fontSize: 12.0,
                      fontWeight: FontWeight.w500,
                      color: theme.primary,
                      letterSpacing: 0.0,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Search bar ──────────────────────────────────────────────────────────────
  Widget _buildSearchBar(AppTheme theme) {
    return TextFormField(
      controller: _model.textController,
      focusNode: _model.textFieldFocusNode,
      onChanged: (_) => EasyDebounce.debounce(
        '_model.textController',
        const Duration(milliseconds: 700),
        () async {
          safeSetState(() {
            AppState().clearEscalaCache();
            _model.apiRequestCompleted = false;
          });
          await _model.waitForApiRequestCompleted();
        },
      ),
      onFieldSubmitted: (_) async {
        safeSetState(() {
          AppState().clearEscalaCache();
          _model.apiRequestCompleted = false;
        });
        await _model.waitForApiRequestCompleted();
      },
      autofocus: false,
      decoration: InputDecoration(
        hintText: 'Procurar por nome do funcionário...',
        hintStyle: GoogleFonts.lexend(
          fontSize: 13,
          color: theme.secondaryText,
        ),
        prefixIcon: Icon(Icons.search_rounded, color: theme.secondaryText, size: 20),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: theme.alternate),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: theme.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: theme.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: BorderSide(color: theme.error),
        ),
      ),
      style: GoogleFonts.lexend(
        fontSize: 13,
        fontWeight: FontWeight.w500,
        color: theme.primaryText,
      ),
      cursorColor: theme.primary,
    );
  }

  // ─── Selection header ────────────────────────────────────────────────────────
  Widget _buildSelectionHeader(AppTheme theme, ApiCallResponse escalaResponse) {
    final selectedCount = _model.setIds.length;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.alternate),
      ),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: theme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(7),
            ),
            child: Icon(Icons.people_rounded, color: theme.primary, size: 14),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Selecionados para a escala',
              style: GoogleFonts.lexend(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: theme.primaryText,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: selectedCount > 0
                  ? theme.primary.withValues(alpha: 0.1)
                  : theme.alternate.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '$selectedCount',
              style: GoogleFonts.lexend(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: selectedCount > 0 ? theme.primary : theme.secondaryText,
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Select all / deselect all
          InkWell(
            onTap: () {
              if (_model.setIds.isNotEmpty) {
                _model.setIds = [];
                _model.allCheck = false;
              } else {
                final allUsers = ProjectsGroup.listaMembrosDeUmaEquipeCall
                        .list(escalaResponse.jsonBody) ??
                    [];
                _model.setIds = (allUsers
                        .map((e) => getJsonField(e, r'''$.users.id'''))
                        .toList() as List)
                    .cast<int>()
                    .toList();
                _model.allCheck = true;
              }
              _persistManualSelection();
              safeSetState(() {});
            },
            borderRadius: BorderRadius.circular(6),
            child: Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: _model.setIds.isNotEmpty
                    ? theme.primary
                    : Colors.white,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: _model.setIds.isNotEmpty
                      ? theme.primary
                      : theme.alternate,
                  width: 2,
                ),
              ),
              child: _model.setIds.isNotEmpty
                  ? Icon(
                      _model.allCheck ? Icons.remove_rounded : Icons.check_rounded,
                      color: Colors.white,
                      size: 16,
                    )
                  : null,
            ),
          ),
        ],
      ),
    );
  }

  // ─── Workers list ────────────────────────────────────────────────────────────
  Widget _buildWorkersList(AppTheme theme, ApiCallResponse escalaResponse) {
    final rawList = ProjectsGroup.listaMembrosDeUmaEquipeCall
            .list(escalaResponse.jsonBody)
            ?.toList() ??
        [];

    final list = rawList.where((item) {
      if (item is String) return false;
      try {
        final name = getJsonField(item, r'''$.users.name''');
        return name != null && name.toString().isNotEmpty;
      } catch (e) {
        return false;
      }
    }).toList();

    if (list.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.people_outline_rounded,
                size: 48, color: theme.secondaryText.withValues(alpha: 0.4)),
            const SizedBox(height: 12),
            Text(
              'Nenhum funcionário encontrado',
              style: GoogleFonts.lexend(
                fontSize: 14,
                color: theme.secondaryText,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      color: theme.primary,
      onRefresh: () async {
        safeSetState(() {
          AppState().clearEscalaCache();
          _model.apiRequestCompleted = false;
        });
        await _model.waitForApiRequestCompleted();
      },
      child: ListView.separated(
        padding: EdgeInsets.zero,
        itemCount: list.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, i) {
          final item = list[i];
          final userId = getJsonField(item, r'''$.users.id''');
          final name = valueOrDefault<String>(
            getJsonField(item, r'''$.users.name''')?.toString(),
            ' - ',
          );
          final role = valueOrDefault<String>(
            getJsonField(item, r'''$.users.hr_data.cargo''')?.toString(),
            '',
          );
          final cpfMasked = getJsonField(item, r'''$.users.hr_data.cpf_masked''')?.toString() ?? '';
          final imageUrl =
              getJsonField(item, r'''$.users.profile_picture.url''')?.toString();
          final isSelected = _model.setIds.contains(userId);
          final avatarColor = _avatarColors[i % _avatarColors.length];

          return InkWell(
            onTap: () {
              if (isSelected) {
                _model.removeFromSetIds(userId);
              } else {
                _model.addToSetIds(userId);
              }
              _persistManualSelection();
              safeSetState(() {});
            },
            borderRadius: BorderRadius.circular(14),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              decoration: BoxDecoration(
                color: isSelected
                    ? theme.primary.withValues(alpha: 0.06)
                    : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected
                      ? theme.primary.withValues(alpha: 0.3)
                      : theme.alternate,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Checkbox
                  Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: isSelected ? theme.primary : Colors.white,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: isSelected ? theme.primary : theme.alternate,
                        width: 2,
                      ),
                    ),
                    child: isSelected
                        ? const Icon(Icons.check_rounded, color: Colors.white, size: 14)
                        : null,
                  ),
                  const SizedBox(width: 12),
                  // Avatar
                  if (NetworkService.instance.isConnected && imageUrl != null && imageUrl.isNotEmpty)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: CachedNetworkImage(
                        imageUrl: imageUrl,
                        width: 40,
                        height: 40,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => _buildInitialsAvatar(name, avatarColor),
                        errorWidget: (_, __, ___) => _buildInitialsAvatar(name, avatarColor),
                      ),
                    )
                  else
                    _buildInitialsAvatar(name, avatarColor),
                  const SizedBox(width: 12),
                  // Name + role
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          name,
                          style: GoogleFonts.lexend(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: theme.primaryText,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (role.isNotEmpty && role != ' - ') ...[
                          const SizedBox(height: 2),
                          Text(
                            role,
                            style: GoogleFonts.lexend(
                              fontSize: 12,
                              color: theme.secondaryText,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                        if (cpfMasked.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            'CPF: $cpfMasked',
                            style: GoogleFonts.lexend(
                              fontSize: 11,
                              color: theme.secondaryText.withValues(alpha: 0.7),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  // Status indicator
                  if (isSelected)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        'Na escala',
                        style: GoogleFonts.lexend(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF10B981),
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
  }

  Widget _buildInitialsAvatar(String name, Color color) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        shape: BoxShape.circle,
        border: Border.all(color: color.withValues(alpha: 0.3), width: 1.5),
      ),
      child: Center(
        child: Text(
          _getInitials(name),
          style: GoogleFonts.lexend(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
      ),
    );
  }

  // ─── Load more button ────────────────────────────────────────────────────────
  Widget _buildLoadMoreButton(AppTheme theme) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: InkWell(
        onTap: () async {
          _model.perPage = _model.perPage + 20;
          safeSetState(() {
            AppState().clearEscalaCache();
            _model.apiRequestCompleted = false;
          });
          await _model.waitForApiRequestCompleted();
        },
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: theme.primary.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: theme.primary.withValues(alpha: 0.2)),
          ),
          child: Center(
            child: Text(
              'Ver mais',
              style: GoogleFonts.lexend(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: theme.primary,
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ─── Update button ───────────────────────────────────────────────────────────
  Widget _buildUpdateButton(AppTheme theme) {
    return Builder(
      builder: (context) => SizedBox(
        width: double.infinity,
        height: 52,
        child: ElevatedButton(
          onPressed: () => _handleUpdateEscala(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: theme.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle_outline_rounded, size: 20),
              const SizedBox(width: 8),
              Text(
                'Atualizar escala',
                style: GoogleFonts.lexend(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Success banner ──────────────────────────────────────────────────────────
  Widget _buildSuccessBanner(AppTheme theme) {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF10B981),
          boxShadow: [
            BoxShadow(
              blurRadius: 8,
              color: Colors.black.withValues(alpha: 0.15),
              offset: const Offset(0, 2),
            ),
          ],
          borderRadius: const BorderRadius.only(
            bottomLeft: Radius.circular(14),
            bottomRight: Radius.circular(14),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white, size: 22),
            const SizedBox(width: 10),
            Text(
              'Escala atualizada com sucesso!',
              style: GoogleFonts.lexend(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Handle update ───────────────────────────────────────────────────────────
  Future<void> _handleUpdateEscala(BuildContext context) async {
    if (_model.setIds.isNotEmpty) {
      _model.editaEscala =
          await ProjectsGroup.editaEscalaDosColaboradoresCall.call(
        usersIdList: _model.setIds,
        scheduleId: AppState().user.sheduleId,
        token: currentAuthenticationToken,
      );

      if ((_model.editaEscala?.succeeded ?? true)) {
        safeSetState(() {
          AppState().clearEscalaCache();
          _model.apiRequestCompleted = false;
        });
        await _model.waitForApiRequestCompleted();
        _model.sucesso = true;
        safeSetState(() {});
        await Future.delayed(const Duration(milliseconds: 1500));
        _model.sucesso = false;
        safeSetState(() {});
        return;
      } else {
        if (mounted) {
          await showDialog(
            context: context,
            builder: (dialogContext) => Dialog(
              elevation: 0,
              insetPadding: EdgeInsets.zero,
              backgroundColor: Colors.transparent,
              alignment: const AlignmentDirectional(0.0, 0.0)
                  .resolve(Directionality.of(context)),
              child: GestureDetector(
                onTap: () {
                  FocusScope.of(dialogContext).unfocus();
                  FocusManager.instance.primaryFocus?.unfocus();
                },
                child: ModalInfoWidget(
                  title: 'Erro',
                  description: getJsonField(
                    (_model.editaEscala?.jsonBody),
                    r'''$.message''',
                  ).toString(),
                ),
              ),
            ),
          );
        }
        return;
      }
    } else {
      if (mounted) {
        await showDialog(
          context: context,
          builder: (dialogContext) => Dialog(
            elevation: 0,
            insetPadding: EdgeInsets.zero,
            backgroundColor: Colors.transparent,
            alignment: const AlignmentDirectional(0.0, 0.0)
                .resolve(Directionality.of(context)),
            child: GestureDetector(
              onTap: () {
                FocusScope.of(dialogContext).unfocus();
                FocusManager.instance.primaryFocus?.unfocus();
              },
              child: const ModalInfoWidget(
                title: 'Selecione um colaborador',
                description:
                    'É preciso selecionar um ou mais colaboradores da escala.',
              ),
            ),
          ),
        );
      }
    }
  }
}
