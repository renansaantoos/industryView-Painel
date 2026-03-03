import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info_widget.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/index.dart';
import '/pages/project_selection/project_selection_widget.dart';
import '/services/initial_sync_service.dart';
import '/services/network_service.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '/services/login_service.dart';

class LoginWidget extends StatefulWidget {
  const LoginWidget({
    super.key,
    this.email,
  });

  final String? email;

  static String routeName = 'Login';
  static String routePath = '/login';

  @override
  State<LoginWidget> createState() => _LoginWidgetState();
}

class _LoginWidgetState extends State<LoginWidget> {
  late final LoginService _loginService;

  final scaffoldKey = GlobalKey<ScaffoldState>();
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _emailFocusNode = FocusNode();
  final _passwordController = TextEditingController();
  final _passwordFocusNode = FocusNode();
  bool _passwordVisibility = false;
  ApiCallResponse? _apiLogin;
  ApiCallResponse? _validToken;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loginService = LoginService();
  }

  @override
  void dispose() {
    _emailFocusNode.dispose();
    _emailController.dispose();

    _passwordFocusNode.dispose();
    _passwordController.dispose();

    super.dispose();
  }

  String? _validateEmail(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return AppLocalizations.of(context).getText(
        '602c6ku5' /* O e-mail é obrigatório */,
      );
    }
    return null;
  }

  String? _validatePassword(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return AppLocalizations.of(context).getText(
        'klavozuq' /* A senhal é obrigatório */,
      );
    }
    return null;
  }

  Future<void> _showModalInfo({
    required String title,
    required String description,
  }) async {
    if (!mounted) return;
    await showDialog(
      context: context,
      builder: (dialogContext) {
        return Dialog(
          elevation: 0,
          insetPadding: EdgeInsets.zero,
          backgroundColor: Colors.transparent,
          alignment:
              AlignmentDirectional(0.0, 0.0).resolve(Directionality.of(context)),
          child: GestureDetector(
            onTap: () {
              FocusScope.of(dialogContext).unfocus();
              FocusManager.instance.primaryFocus?.unfocus();
            },
            child: ModalInfoWidget(
              title: title,
              description: description,
            ),
          ),
        );
      },
    );
  }

  void _persistUserState({
    required ApiCallResponse tokenResponse,
    required ApiCallResponse loginResponse,
    ApiCallResponse? sprintResponse,
    bool skipProjectData = false,
  }) {
    final tokenJson = tokenResponse.jsonBody ?? '';
    final loginJson = loginResponse.jsonBody ?? '';

    final meCall = AuthenticationGroup
        .getTheRecordBelongingToTheAuthenticationTokenCall;

    int? projectId;
    int? teamsId;
    SprintsStruct? sprintData;

    if (!skipProjectData) {
      // projectId vem de projects[0] do /me/app
      final allProjects = meCall.allProjectIds(tokenJson);
      projectId = allProjects.isNotEmpty ? allProjects.first : null;

      // teamsId vem de teams.leader[0].id ou teams.member[0].id
      final leaders = meCall.teamsLeader(tokenJson);
      final members = meCall.teamsMember(tokenJson);
      if (leaders != null && leaders.isNotEmpty) {
        teamsId = castToType<int>(getJsonField(leaders.first, r'''$.id'''));
      } else if (members != null && members.isNotEmpty) {
        teamsId = castToType<int>(getJsonField(members.first, r'''$.id'''));
      }

      // Sprint data vem da chamada separada GET /sprints (passo 3)
      if (sprintResponse != null) {
        final sprintItems = SprintsGroup.getSprintAtivaCall
            .listAtivas(sprintResponse.jsonBody ?? '');
        if (sprintItems != null && sprintItems.isNotEmpty) {
          final s = sprintItems.first;
          sprintData = SprintsStruct(
            id: castToType<int>(getJsonField(s, r'''$.id''')),
            title: castToType<String>(getJsonField(s, r'''$.title''')),
            objective: castToType<String>(getJsonField(s, r'''$.objective''')),
            startDate: parseDateToMillis(getJsonField(s, r'''$.start_date''')),
            endDate: parseDateToMillis(getJsonField(s, r'''$.end_date''')),
            progressPercentage: castToType<double>(
                getJsonField(s, r'''$.progress_percentage''')),
          );
        }
      }
    }

    AppState().user = UserLoginStruct(
      token: AuthenticationGroup.loginAndRetrieveAnAuthenticationTokenCall.token(
        loginJson,
      ),
      id: meCall.id(tokenJson),
      name: meCall.name(tokenJson),
      email: meCall.email(tokenJson),
      phone: meCall.phone(tokenJson),
      image: meCall.image(tokenJson),
      userPermissions: UserPermissionsStruct(
        permissaoId: meCall.permissions(tokenJson),
        userSystemAccessId: meCall.system(tokenJson),
        userRolesId: meCall.roles(tokenJson),
        userControlSystemId: meCall.control(tokenJson),
      ),
      teamsId: teamsId,
      projectId: projectId,
      sprint: sprintData ?? SprintsStruct(),
      companyId: meCall.companyID(tokenJson),
    );
    AppState().update(() {});
  }

  Future<void> _handleLogin() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    FocusScope.of(context).unfocus();
    FocusManager.instance.primaryFocus?.unfocus();

    setState(() => _isSubmitting = true);

    try {
      final result = await _loginService.login(
        email: _emailController.text,
        password: _passwordController.text,
      );

      switch (result.status) {
        case LoginStatus.connectionError:
          await _showModalInfo(
            title: AppLocalizations.of(context).getText(
              'iwfkhl1s' /* Erro */,
            ),
            description: AppLocalizations.of(context).getText(
              '7ccdas4q' /* Você está sem conexão com a internet. */,
            ),
          );
          return;
        case LoginStatus.invalidCredentials:
          await _showModalInfo(
            title: AppLocalizations.of(context).getText(
              '8hwqpseo' /* Erro */,
            ),
            description: AppLocalizations.of(context).getVariableText(
              ptText: 'Senha invalida',
              esText: 'Contraseña inválida',
              enText: 'Invalid password',
            ),
          );
          return;
        case LoginStatus.noSprint:
          await _showModalInfo(
            title: AppLocalizations.of(context).getVariableText(
              ptText: 'Nenhuma Sprint ativa',
              esText: 'No hay sprints activos',
              enText: 'No active Sprints',
            ),
            description: AppLocalizations.of(context).getVariableText(
              ptText:
                  'Nenhuma sprint foi encontrada neste projeto. Aguarde até que uma sprint seja adicionada.',
              esText:
                  'No se encontraron sprints para este proyecto. Espere hasta que se agregue uno.',
              enText:
                  'No sprints were found for this project. Please wait until a sprint is added.',
            ),
          );
          return;
        case LoginStatus.noAccess:
          await _showModalInfo(
            title: AppLocalizations.of(context).getText(
              'i9a5uiw7' /* Erro */,
            ),
            description: AppLocalizations.of(context).getText(
              'au2xr1nb' /* Esté usuário não tem acesso a esse app */,
            ),
          );
          return;
        case LoginStatus.apiError:
          await _showModalInfo(
            title: AppLocalizations.of(context).getVariableText(
              ptText: 'Erro',
              esText: 'Error',
              enText: 'Error',
            ),
            description: result.message ??
                AppLocalizations.of(context).getVariableText(
                  ptText: 'Erro ao realizar login',
                  esText: 'Error al iniciar sesión',
                  enText: 'Login failed',
                ),
          );
          return;
        case LoginStatus.unexpected:
          await _showModalInfo(
            title: AppLocalizations.of(context).getVariableText(
              ptText: 'Erro inesperado',
              esText: 'Error inesperado',
              enText: 'Unexpected error',
            ),
            description: result.message ??
                AppLocalizations.of(context).getVariableText(
                  ptText: 'Erro ao realizar login',
                  esText: 'Error al iniciar sesión',
                  enText: 'Login failed',
                ),
          );
          return;
        case LoginStatus.success:
          _validToken = result.tokenResponse;
          _apiLogin = result.loginResponse;
          break;
      }

      if (_validToken == null || _apiLogin == null) {
        await _showModalInfo(
          title: AppLocalizations.of(context).getVariableText(
            ptText: 'Erro inesperado',
            esText: 'Error inesperado',
            enText: 'Unexpected error',
          ),
          description: AppLocalizations.of(context).getVariableText(
            ptText: 'Erro ao realizar login',
            esText: 'Error al iniciar sesión',
            enText: 'Login failed',
          ),
        );
        return;
      }

      final meCall = AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall;
      final allProjectIds = meCall.allProjectIds(_validToken!.jsonBody ?? '');

      final authToken = AuthenticationGroup
          .loginAndRetrieveAnAuthenticationTokenCall
          .token((_apiLogin?.jsonBody ?? ''));

      // Buscar projetos do backend para filtrar por status ativo/em andamento
      final companyId = meCall.companyID(_validToken!.jsonBody ?? '');
      List<Map<String, dynamic>> activeProjects = [];

      if (companyId != null && authToken != null && allProjectIds.isNotEmpty) {
        final projectsResponse = await ProjectsGroup.getUserProjectsCall.call(
          companyId: companyId,
          token: authToken,
        );
        if (projectsResponse.succeeded) {
          final allItems = ProjectsGroup.getUserProjectsCall.items(
            projectsResponse.jsonBody ?? '',
          );
          if (allItems != null) {
            final userIds = allProjectIds.toSet();
            // Status permitidos: 1 (Ativo) e 3 (Em andamento)
            const allowedStatuses = {1, 3};
            for (final item in allItems) {
              final id = castToType<int>(getJsonField(item, r'''$.id'''));
              final statusId = castToType<int>(
                  getJsonField(item, r'''$.projects_statuses_id'''));
              if (id != null &&
                  userIds.contains(id) &&
                  statusId != null &&
                  allowedStatuses.contains(statusId)) {
                activeProjects.add({
                  'id': id,
                  'name': castToType<String>(getJsonField(item, r'''$.name''')) ?? 'Projeto',
                });
              }
            }
          }
        }
      }

      final hasMultipleProjects = activeProjects.length > 1;

      if (hasMultipleProjects) {
        // Múltiplos projetos ativos: persist parcial (sem projectId/teamsId/sprint)
        _persistUserState(
          tokenResponse: _validToken!,
          loginResponse: _apiLogin!,
          skipProjectData: true,
        );

        GoRouter.of(context).prepareAuthEvent();
        await authManager.signIn(
          authenticationToken: authToken,
        );

        if (!mounted) return;
        context.pushNamedAuth(
          ProjectSelectionWidget.routeName,
          context.mounted,
          extra: <String, dynamic>{
            kTransitionInfoKey: TransitionInfo(
              hasTransition: true,
              transitionType: PageTransitionType.fade,
            ),
            'tokenResponse': _validToken!,
            'loginResponse': _apiLogin!,
          },
        );
      } else {
        // 0 ou 1 projeto ativo: fluxo direto
        _persistUserState(
          tokenResponse: _validToken!,
          loginResponse: _apiLogin!,
          sprintResponse: result.sprintResponse,
        );

        // Definir nome do projeto ativo (se houver)
        if (activeProjects.isNotEmpty) {
          AppState().updateUserStruct((user) {
            user.projectName = activeProjects.first['name'] as String;
          });
        }

        GoRouter.of(context).prepareAuthEvent();
        await authManager.signIn(
          authenticationToken: authToken,
        );

        if (!mounted) return;
        context.pushNamedAuth(
          PageCheckQrcodeWidget.routeName,
          context.mounted,
          extra: <String, dynamic>{
            kTransitionInfoKey: TransitionInfo(
              hasTransition: true,
              transitionType: PageTransitionType.fade,
            ),
          },
        );
      }
    } catch (error) {
      await _showModalInfo(
        title: AppLocalizations.of(context).getVariableText(
          ptText: 'Erro inesperado',
          esText: 'Error inesperado',
          enText: 'Unexpected error',
        ),
        description: error.toString(),
      );
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: Colors.transparent,
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFFECF5FF), Color(0xFFFAFAFA)],
            ),
          ),
          child: SafeArea(
            top: true,
            child: SingleChildScrollView(
            child: Align(
              alignment: AlignmentDirectional(0.0, 0.0),
              child: Padding(
                padding: EdgeInsetsDirectional.fromSTEB(30.0, 0.0, 32.0, 32.0),
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    minHeight: MediaQuery.of(context).size.height - 
                               MediaQuery.of(context).padding.top - 
                               MediaQuery.of(context).padding.bottom,
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(
                            0.0, 0.0, 0.0, 24.0),
                        child: Text(
                          'IndustryView',
                          style: AppTheme.of(context)
                              .displayMedium
                              .override(
                                font: GoogleFonts.lexend(
                                  fontWeight: FontWeight.w800,
                                  fontStyle: AppTheme.of(context)
                                      .displayMedium
                                      .fontStyle,
                                ),
                                color: Color(0xFF2B5EA7),
                                fontSize: 32.0,
                                letterSpacing: -0.5,
                                fontWeight: FontWeight.w800,
                                fontStyle: AppTheme.of(context)
                                    .displayMedium
                                    .fontStyle,
                              ),
                        ),
                      ),
                    ],
                  ).animate().fadeIn(duration: 600.ms).slideY(begin: -0.2),
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.of(context).secondaryBackground,
                      borderRadius: BorderRadius.circular(24.0),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF105DFB).withOpacity(0.08),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Form(
                        key: _formKey,
                        autovalidateMode: AutovalidateMode.disabled,
                        child: Padding(
                          padding: EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.max,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                AppLocalizations.of(context).getText(
                                  'lx7o6elx' /* Bem-vindo! */,
                                ),
                                style: AppTheme.of(context)
                                    .headlineMedium
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FontWeight.w500,
                                        fontStyle: AppTheme.of(context)
                                            .headlineMedium
                                            .fontStyle,
                                      ),
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w500,
                                      fontStyle: AppTheme.of(context)
                                          .headlineMedium
                                          .fontStyle,
                                    ),
                              ),
                              Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 4.0, 0.0, 16.0),
                                child: Text(
                                  AppLocalizations.of(context).getText(
                                    '3cbe7wnu' /* Faça seu login na plataforma p... */,
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
                                        letterSpacing: 0.0,
                                        fontWeight: AppTheme.of(context)
                                            .labelSmall
                                            .fontWeight,
                                        fontStyle: AppTheme.of(context)
                                            .labelSmall
                                            .fontStyle,
                                      ),
                                ),
                              ),
                              Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 0.0, 0.0, 16.0),
                                child: Container(
                                  width: double.infinity,
                                  child: TextFormField(
                                    controller: _emailController,
                                    focusNode: _emailFocusNode,
                                    autofocus: false,
                                    autofillHints: [AutofillHints.email],
                                    obscureText: false,
                                    decoration: InputDecoration(
                                      labelText:
                                          AppLocalizations.of(context).getText(
                                        'c1xdwbed' /* Email */,
                                      ),
                                      labelStyle: AppTheme.of(context)
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
                                          width: 1.5,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(14.0),
                                      ),
                                      errorBorder: OutlineInputBorder(
                                        borderSide: BorderSide(
                                          color: AppTheme.of(context)
                                              .alternate,
                                          width: 1.0,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(14.0),
                                      ),
                                      focusedErrorBorder: OutlineInputBorder(
                                        borderSide: BorderSide(
                                          color: AppTheme.of(context)
                                              .alternate,
                                          width: 1.0,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(14.0),
                                      ),
                                      filled: true,
                                      fillColor: AppTheme.of(context)
                                          .primaryBackground,
                                      contentPadding:
                                          const EdgeInsets.symmetric(
                                              horizontal: 16, vertical: 14),
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
                                    keyboardType: TextInputType.emailAddress,
                                    validator: (val) =>
                                        _validateEmail(context, val),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 0.0, 0.0, 16.0),
                                child: Container(
                                  width: double.infinity,
                                  child: TextFormField(
                                    controller: _passwordController,
                                    focusNode: _passwordFocusNode,
                                    autofocus: false,
                                    autofillHints: [AutofillHints.password],
                                    obscureText: !_passwordVisibility,
                                    decoration: InputDecoration(
                                      labelText:
                                          AppLocalizations.of(context).getText(
                                        'kirg2ays' /* Senha */,
                                      ),
                                      labelStyle: AppTheme.of(context)
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
                                          width: 1.5,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(14.0),
                                      ),
                                      errorBorder: OutlineInputBorder(
                                        borderSide: BorderSide(
                                          color: AppTheme.of(context)
                                              .alternate,
                                          width: 1.0,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(14.0),
                                      ),
                                      focusedErrorBorder: OutlineInputBorder(
                                        borderSide: BorderSide(
                                          color: AppTheme.of(context)
                                              .alternate,
                                          width: 1.0,
                                        ),
                                        borderRadius:
                                            BorderRadius.circular(14.0),
                                      ),
                                      filled: true,
                                      fillColor: AppTheme.of(context)
                                          .primaryBackground,
                                      contentPadding:
                                          const EdgeInsets.symmetric(
                                              horizontal: 16, vertical: 14),
                                      suffixIcon: InkWell(
                                        onTap: () => setState(
                                          () => _passwordVisibility =
                                              !_passwordVisibility,
                                        ),
                                        focusNode:
                                            FocusNode(skipTraversal: true),
                                        child: Icon(
                                          _passwordVisibility
                                              ? Icons.visibility_outlined
                                              : Icons.visibility_off_outlined,
                                          color: AppTheme.of(context)
                                              .secondaryText,
                                          size: 24.0,
                                        ),
                                      ),
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
                                    validator: (val) =>
                                        _validatePassword(context, val),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 0.0, 0.0, 16.0),
                                child: InkWell(
                                  splashColor: Colors.transparent,
                                  focusColor: Colors.transparent,
                                  hoverColor: Colors.transparent,
                                  highlightColor: Colors.transparent,
                                  onTap: () async {
                                    // Verificar se tem internet antes de permitir acesso
                                    if (!NetworkService.instance.isConnected) {
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
                                                title: AppLocalizations.of(context).getVariableText(
                                                  ptText: 'Aviso',
                                                  esText: 'Aviso',
                                                  enText: 'Notice',
                                                ),
                                                description: AppLocalizations.of(context).getVariableText(
                                                  ptText: 'Esta funcionalidade está disponível apenas com conexão à internet.',
                                                  esText: 'Esta funcionalidad solo está disponible con conexión a internet.',
                                                  enText: 'This feature is only available with internet connection.',
                                                ),
                                              ),
                                            ),
                                          );
                                        },
                                      );
                                      return;
                                    }
                                    context.pushNamed(
                                        EsqueciSenhaWidget.routeName);
                                  },
                                  child: Container(
                                    decoration: BoxDecoration(),
                                    child: Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          8.0, 0.0, 0.0, 0.0),
                                      child: Text(
                                        AppLocalizations.of(context).getText(
                                          '5hk3a0gv' /* Esqueci minha senha */,
                                        ),
                                        style: AppTheme.of(context)
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
                                              color:
                                                  AppTheme.of(context)
                                                      .primary,
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
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              Builder(
                                builder: (context) => AppButton(
                                  onPressed: _isSubmitting ? null : _handleLogin,
                                  text: AppLocalizations.of(context).getText(
                                    'xhugv4p6' /* Fazer Login */,
                                  ),
                                  options: AppButtonOptions(
                                    width: double.infinity,
                                    height: 48.0,
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 0.0, 0.0, 0.0),
                                    iconPadding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 0.0, 0.0, 0.0),
                                    color: AppTheme.of(context).primary,
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
                                          color:
                                              AppTheme.of(context).info,
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
                                      color: Colors.transparent,
                                      width: 1.0,
                                    ),
                                    borderRadius: BorderRadius.circular(14.0),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ).animate().fadeIn(duration: 400.ms, delay: 200.ms).slideY(begin: 0.1),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        ),
      ),
    );
  }
}
