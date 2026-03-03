import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/components/modal_info_widget.dart';
import '/components/modal_sucess_qrcode_widget.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import 'dart:async';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'modal_escala_manual_model.dart';
export 'modal_escala_manual_model.dart';

class ModalEscalaManualWidget extends StatefulWidget {
  const ModalEscalaManualWidget({super.key});

  @override
  State<ModalEscalaManualWidget> createState() =>
      _ModalEscalaManualWidgetState();
}

class _ModalEscalaManualWidgetState extends State<ModalEscalaManualWidget> {
  late ModalEscalaManualModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalEscalaManualModel());

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

    return Align(
      alignment: AlignmentDirectional(0.0, 1.0),
      child: Container(
        width: double.infinity,
        constraints: BoxConstraints(
          maxHeight: MediaQuery.sizeOf(context).height * 0.9,
        ),
        decoration: BoxDecoration(
          color: AppTheme.of(context).secondaryBackground,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24.0),
            topRight: Radius.circular(24.0),
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF105DFB).withOpacity(0.10),
              blurRadius: 32,
              offset: const Offset(0, -8),
            ),
          ],
        ),
        child: Padding(
          padding: EdgeInsetsDirectional.fromSTEB(24.0, 12.0, 24.0, 24.0),
          child: Column(
            mainAxisSize: MainAxisSize.max,
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 40.0,
                  height: 4.0,
                  margin: const EdgeInsets.only(bottom: 16.0),
                  decoration: BoxDecoration(
                    color: AppTheme.of(context).alternate,
                    borderRadius: BorderRadius.circular(2.0),
                  ),
                ),
              ),
              Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 36.0,
                    height: 36.0,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFFECF5FF), Color(0xFFD6EBFF)],
                      ),
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                    child: Icon(
                      Icons.people_rounded,
                      color: const Color(0xFF105DFB),
                      size: 20.0,
                    ),
                  ),
                  Expanded(
                    child: Text(
                      AppLocalizations.of(context).getText(
                        'nql6xby5' /* Escala do dia */,
                      ),
                      style: AppTheme.of(context).titleLarge.override(
                            font: GoogleFonts.lexend(
                              fontWeight: FontWeight.w600,
                              fontStyle: AppTheme.of(context)
                                  .titleLarge
                                  .fontStyle,
                            ),
                            color: const Color(0xFF2D323F),
                            fontSize: 20.0,
                            letterSpacing: 0.0,
                            fontWeight: FontWeight.w600,
                            fontStyle: AppTheme.of(context)
                                .titleLarge
                                .fontStyle,
                          ),
                    ),
                  ),
                ].divide(SizedBox(width: 12.0)),
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 16.0, 0.0, 16.0),
                child: Container(
                  width: 600.0,
                  child: TextFormField(
                    controller: _model.textController,
                    focusNode: _model.textFieldFocusNode,
                    onChanged: (_) => EasyDebounce.debounce(
                      '_model.textController',
                      Duration(milliseconds: 2000),
                      () async {
                        safeSetState(() {
                          _model.clearNextPageCache();
                          _model.apiRequestCompleted = false;
                        });
                        await _model.waitForApiRequestCompleted();
                      },
                    ),
                    onFieldSubmitted: (_) async {
                      safeSetState(() {
                        _model.clearNextPageCache();
                        _model.apiRequestCompleted = false;
                      });
                      await _model.waitForApiRequestCompleted();
                    },
                    autofocus: false,
                    obscureText: false,
                    decoration: InputDecoration(
                      labelText: AppLocalizations.of(context).getText(
                        'cap78f1h' /* Procurar por nome do funcionár... */,
                      ),
                      labelStyle:
                          AppTheme.of(context).labelSmall.override(
                                font: GoogleFonts.lexend(
                                  fontWeight: AppTheme.of(context)
                                      .labelSmall
                                      .fontWeight,
                                  fontStyle: AppTheme.of(context)
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
                      hintStyle:
                          AppTheme.of(context).labelSmall.override(
                                font: GoogleFonts.lexend(
                                  fontWeight: AppTheme.of(context)
                                      .labelSmall
                                      .fontWeight,
                                  fontStyle: AppTheme.of(context)
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
                      enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: AppTheme.of(context).alternate,
                          width: 1.0,
                        ),
                        borderRadius: BorderRadius.circular(14.0),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: AppTheme.of(context).primary,
                          width: 1.5,
                        ),
                        borderRadius: BorderRadius.circular(14.0),
                      ),
                      errorBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: AppTheme.of(context).error,
                          width: 1.0,
                        ),
                        borderRadius: BorderRadius.circular(14.0),
                      ),
                      focusedErrorBorder: OutlineInputBorder(
                        borderSide: BorderSide(
                          color: AppTheme.of(context).error,
                          width: 1.5,
                        ),
                        borderRadius: BorderRadius.circular(14.0),
                      ),
                      filled: true,
                      fillColor: AppTheme.of(context).primaryBackground,
                      contentPadding:
                          EdgeInsetsDirectional.fromSTEB(20.0, 14.0, 12.0, 14.0),
                      prefixIcon: Icon(
                        Icons.search_sharp,
                      ),
                    ),
                    style: AppTheme.of(context).bodySmall.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FontWeight.w500,
                            fontStyle: AppTheme.of(context)
                                .bodySmall
                                .fontStyle,
                          ),
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w500,
                          fontStyle:
                              AppTheme.of(context).bodySmall.fontStyle,
                        ),
                    cursorColor: AppTheme.of(context).primary,
                    validator:
                        _model.textControllerValidator.asValidator(context),
                  ),
                ),
              ),
              Flexible(
                child: FutureBuilder<ApiCallResponse>(
                  future: _model
                      .nextPage(
                    requestFn: () =>
                        ProjectsGroup.listaMembrosDeUmaEquipeCall.call(
                      teamsId: AppState().user.teamsId,
                      page: _model.page,
                      perPage: _model.perPage,
                      token: currentAuthenticationToken,
                      search: _model.textController.text,
                    ),
                  )
                      .then((result) {
                    _model.apiRequestCompleted = true;
                    return result;
                  }),
                  builder: (context, snapshot) {
                    // Customize what your widget looks like when it's loading.
                    if (!snapshot.hasData) {
                      return Center(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 32.0),
                          child: SizedBox(
                            width: 40.0,
                            height: 40.0,
                            child: CircularProgressIndicator(
                              strokeWidth: 3.0,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                AppTheme.of(context).primary,
                              ),
                            ),
                          ),
                        ),
                      );
                    }
                    final containerListaMembrosDeUmaEquipeResponse =
                        snapshot.data!;

                    return Container(
                      decoration: BoxDecoration(),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Expanded(
                            child: Builder(
                              builder: (context) {
                                final list =
                                    ProjectsGroup.listaMembrosDeUmaEquipeCall
                                            .list(
                                              containerListaMembrosDeUmaEquipeResponse
                                                  .jsonBody,
                                            )
                                            ?.toList() ??
                                        [];

                                return RefreshIndicator(
                                  onRefresh: () async {
                                    safeSetState(() {
                                      _model.clearNextPageCache();
                                      _model.apiRequestCompleted = false;
                                    });
                                    await _model.waitForApiRequestCompleted();
                                  },
                                  child: ListView.separated(
                                    padding: EdgeInsets.zero,
                                    shrinkWrap: true,
                                    scrollDirection: Axis.vertical,
                                    itemCount: list.length,
                                    separatorBuilder: (_, __) =>
                                        SizedBox(height: 12.0),
                                    itemBuilder: (context, listIndex) {
                                      final listItem = list[listIndex];
                                      final isSelected = _model.id ==
                                          getJsonField(listItem, r'''$.users.id''');
                                      final isAlreadyReleased = AppState()
                                          .allIds
                                          .contains(getJsonField(listItem, r'''$.users.id'''));
                                      return AnimatedContainer(
                                        duration: const Duration(milliseconds: 200),
                                        width: double.infinity,
                                        decoration: BoxDecoration(
                                          color: isAlreadyReleased
                                              ? const Color(0xFFF0F5FF)
                                              : isSelected
                                                  ? const Color(0xFFF0F5FF)
                                                  : AppTheme.of(context).secondaryBackground,
                                          borderRadius:
                                              BorderRadius.circular(14.0),
                                          border: Border.all(
                                            color: isSelected
                                                ? AppTheme.of(context).primary.withOpacity(0.5)
                                                : Colors.transparent,
                                            width: 1.5,
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withOpacity(0.04),
                                              blurRadius: 10,
                                              offset: const Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: Padding(
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  14.0, 10.0, 14.0, 10.0),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Row(
                                                mainAxisSize: MainAxisSize.max,
                                                children: [
                                                  if (!isAlreadyReleased && !isSelected)
                                                    InkWell(
                                                      splashColor: Colors.transparent,
                                                      focusColor: Colors.transparent,
                                                      hoverColor: Colors.transparent,
                                                      highlightColor: Colors.transparent,
                                                      onTap: () async {
                                                        _model.id = getJsonField(
                                                          listItem,
                                                          r'''$.users.id''',
                                                        );
                                                        safeSetState(() {});
                                                      },
                                                      child: Container(
                                                        width: 22.0,
                                                        height: 22.0,
                                                        decoration: BoxDecoration(
                                                          borderRadius: BorderRadius.circular(6.0),
                                                          border: Border.all(
                                                            color: AppTheme.of(context).alternate,
                                                            width: 2.0,
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                  if (isSelected && !isAlreadyReleased)
                                                    InkWell(
                                                      splashColor: Colors.transparent,
                                                      focusColor: Colors.transparent,
                                                      hoverColor: Colors.transparent,
                                                      highlightColor: Colors.transparent,
                                                      onTap: () async {
                                                        _model.id = null;
                                                        _model.updatePage(() {});
                                                      },
                                                      child: AnimatedContainer(
                                                        duration: const Duration(milliseconds: 200),
                                                        width: 22.0,
                                                        height: 22.0,
                                                        decoration: BoxDecoration(
                                                          color: AppTheme.of(context).primary,
                                                          borderRadius: BorderRadius.circular(6.0),
                                                        ),
                                                        alignment: AlignmentDirectional(0.0, 0.0),
                                                        child: Icon(
                                                          Icons.check_rounded,
                                                          color: Colors.white,
                                                          size: 16.0,
                                                        ),
                                                      ),
                                                    ),
                                                  if (isAlreadyReleased)
                                                    Container(
                                                      width: 22.0,
                                                      height: 22.0,
                                                      decoration: BoxDecoration(
                                                        color: const Color(0xFF4CAF50),
                                                        borderRadius: BorderRadius.circular(6.0),
                                                      ),
                                                      alignment: AlignmentDirectional(0.0, 0.0),
                                                      child: Icon(
                                                        Icons.check_rounded,
                                                        color: Colors.white,
                                                        size: 16.0,
                                                      ),
                                                    ),
                                                ],
                                              ),
                                              Padding(
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        10.0, 0.0, 0.0, 0.0),
                                                child: Container(
                                                  width: 40.0,
                                                  height: 40.0,
                                                  decoration: BoxDecoration(
                                                    gradient: const LinearGradient(
                                                      begin: Alignment.topLeft,
                                                      end: Alignment.bottomRight,
                                                      colors: [Color(0xFFECF5FF), Color(0xFFD6EBFF)],
                                                    ),
                                                    shape: BoxShape.circle,
                                                  ),
                                                  child: ClipRRect(
                                                    borderRadius:
                                                        BorderRadius.circular(20.0),
                                                    child: Image.network(
                                                      valueOrDefault<String>(
                                                        getJsonField(
                                                          listItem,
                                                          r'''$.users.profile_picture''',
                                                        )?.toString(),
                                                        'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg',
                                                      ),
                                                      width: 40.0,
                                                      height: 40.0,
                                                      fit: BoxFit.cover,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                              Padding(
                                                padding: EdgeInsetsDirectional
                                                    .fromSTEB(
                                                        8.0, 0.0, 0.0, 0.0),
                                                child: Column(
                                                  mainAxisSize:
                                                      MainAxisSize.min,
                                                  mainAxisAlignment:
                                                      MainAxisAlignment.center,
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Row(
                                                      mainAxisSize:
                                                          MainAxisSize.max,
                                                      children: [
                                                        Text(
                                                          valueOrDefault<
                                                              String>(
                                                            getJsonField(
                                                              listItem,
                                                              r'''$.users.name''',
                                                            )?.toString(),
                                                            ' - ',
                                                          ),
                                                          style: AppTheme
                                                                  .of(context)
                                                              .bodySmall
                                                              .override(
                                                                font:
                                                                    GoogleFonts
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
                                                      ].divide(
                                                          SizedBox(width: 4.0)),
                                                    ),
                                                    Padding(
                                                      padding:
                                                          EdgeInsetsDirectional
                                                              .fromSTEB(
                                                                  0.0,
                                                                  4.0,
                                                                  0.0,
                                                                  0.0),
                                                      child: Text(
                                                        valueOrDefault<String>(
                                                          getJsonField(
                                                            listItem,
                                                            r'''$.users.hr_data.cargo''',
                                                          )?.toString() ??
                                                          getJsonField(
                                                            listItem,
                                                            r'''$.users.users_permissions.users_roles.role''',
                                                          )?.toString(),
                                                          ' - ',
                                                        ),
                                                        style:
                                                            AppTheme.of(
                                                                    context)
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
                                                    if (isAlreadyReleased)
                                                      Padding(
                                                        padding: EdgeInsetsDirectional.fromSTEB(0.0, 2.0, 0.0, 0.0),
                                                        child: Builder(
                                                          builder: (context) {
                                                            final userId = castToType<int>(getJsonField(listItem, r'''$.users.id'''));
                                                            final entryTimeStr = userId != null ? AppState().escalaEntryTimes[userId] : null;
                                                            String timeText = 'Registrado';
                                                            if (entryTimeStr != null) {
                                                              final dt = DateTime.tryParse(entryTimeStr);
                                                              if (dt != null) {
                                                                final local = dt.toLocal();
                                                                timeText = 'Entrada às ${local.hour.toString().padLeft(2, '0')}:${local.minute.toString().padLeft(2, '0')}';
                                                              }
                                                            }
                                                            return Row(
                                                              mainAxisSize: MainAxisSize.min,
                                                              children: [
                                                                Icon(
                                                                  Icons.access_time_rounded,
                                                                  color: const Color(0xFF4CAF50),
                                                                  size: 12.0,
                                                                ),
                                                                SizedBox(width: 4.0),
                                                                Text(
                                                                  timeText,
                                                                  style: AppTheme.of(context).bodySmall.override(
                                                                    font: GoogleFonts.lexend(
                                                                      fontWeight: FontWeight.w500,
                                                                    ),
                                                                    color: const Color(0xFF4CAF50),
                                                                    fontSize: 11.0,
                                                                    letterSpacing: 0.0,
                                                                    fontWeight: FontWeight.w500,
                                                                  ),
                                                                ),
                                                              ],
                                                            );
                                                          },
                                                        ),
                                                      ),
                                                  ],
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
                          if (_model.page <
                              ProjectsGroup.listaMembrosDeUmaEquipeCall
                                  .pageTotal(
                                containerListaMembrosDeUmaEquipeResponse
                                    .jsonBody,
                              )!)
                            Align(
                              alignment: AlignmentDirectional(-1.0, 0.0),
                              child: Padding(
                                padding: EdgeInsetsDirectional.fromSTEB(
                                    0.0, 16.0, 0.0, 0.0),
                                child: AppButton(
                                  onPressed: () async {
                                    _model.perPage = 10;
                                    safeSetState(() {});
                                    safeSetState(() {
                                      _model.clearNextPageCache();
                                      _model.apiRequestCompleted = false;
                                    });
                                    await _model.waitForApiRequestCompleted();
                                  },
                                  text: AppLocalizations.of(context).getText(
                                    'kzhorq1z' /* Ver mais */,
                                  ),
                                  options: AppButtonOptions(
                                    height: 40.0,
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        20.0, 0.0, 20.0, 0.0),
                                    iconPadding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 0.0, 0.0, 0.0),
                                    color:
                                        AppTheme.of(context).status03,
                                    textStyle: AppTheme.of(context)
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
                                    elevation: 0.0,
                                    borderSide: BorderSide(
                                      color:
                                          AppTheme.of(context).primary,
                                    ),
                                    borderRadius: BorderRadius.circular(10.0),
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              Builder(
                builder: (context) => Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0.0, 16.0, 0.0, 0.0),
                  child: AppButton(
                    onPressed: () async {
                      var _shouldSetState = false;
                      _shouldSetState = true;
                      if (_model.id != null) {
                        AppState().addToLiberaManual(_model.id!);
                        AppState().addToAllIds(_model.id!);
                        AppState().addEscalaEntryTime(_model.id!, DateTime.now().toUtc().toIso8601String());
                        safeSetState(() {});
                        // Registrar check-in no controle de mão de obra
                        try {
                          ProjectsGroup.workforceCheckInCall.call(
                            usersId: _model.id,
                            projectsId: AppState().user.projectId,
                            teamsId: AppState().user.teamsId,
                            token: currentAuthenticationToken,
                          );
                        } catch (_) {}
                        await showDialog(
                          context: context,
                          builder: (dialogContext) {
                            return Dialog(
                              elevation: 0,
                              insetPadding: EdgeInsets.zero,
                              backgroundColor: Colors.transparent,
                              alignment: AlignmentDirectional(0.0, 0.0)
                                  .resolve(Directionality.of(context)),
                              child: ModalSucessQrcodeWidget(
                                text: AppLocalizations.of(context).getText(
                                  '8ss1g5sq' /* Funcionário liberado manualmen... */,
                                ),
                              ),
                            );
                          },
                        );

                        Navigator.pop(context);
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
                              child: ModalInfoWidget(
                                title: AppLocalizations.of(context).getText(
                                  'rg9vm2xh' /* Erro */,
                                ),
                                description: AppLocalizations.of(context)
                                    .getVariableText(
                                  ptText: 'Selecione um funcionário para liberar',
                                  esText: 'Seleccione un empleado para liberar',
                                  enText: 'Select an employee to release',
                                ),
                              ),
                            );
                          },
                        );

                        if (_shouldSetState) safeSetState(() {});
                        return;
                      }

                      if (_shouldSetState) safeSetState(() {});
                    },
                    icon: const Icon(
                      Icons.person_add_alt_rounded,
                      color: Colors.white,
                      size: 20.0,
                    ),
                    text: AppLocalizations.of(context).getText(
                      'jks9ub5u' /* Liberar funcionário */,
                    ),
                    options: AppButtonOptions(
                      width: double.infinity,
                      height: 48.0,
                      padding:
                          EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                      iconPadding:
                          EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      color: AppTheme.of(context).primary,
                      textStyle:
                          AppTheme.of(context).labelMedium.override(
                                font: GoogleFonts.lexend(
                                  fontWeight: FontWeight.w600,
                                  fontStyle: AppTheme.of(context)
                                      .labelMedium
                                      .fontStyle,
                                ),
                                color: Colors.white,
                                fontSize: 15.0,
                                letterSpacing: 0.0,
                                fontWeight: FontWeight.w600,
                                fontStyle: AppTheme.of(context)
                                    .labelMedium
                                    .fontStyle,
                              ),
                      elevation: 0.0,
                      borderRadius: BorderRadius.circular(14.0),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(0.0, 16.0, 0.0, 0.0),
                child: AppButton(
                  onPressed: () async {
                    Navigator.pop(context);
                  },
                  text: AppLocalizations.of(context).getText(
                    'mlocknv7' /* Cancelar */,
                  ),
                  options: AppButtonOptions(
                    width: double.infinity,
                    height: 48.0,
                    padding:
                        EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                    iconPadding:
                        EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                    color: AppTheme.of(context).primaryBackground,
                    textStyle:
                        AppTheme.of(context).labelMedium.override(
                              font: GoogleFonts.lexend(
                                fontWeight: FontWeight.w500,
                                fontStyle: AppTheme.of(context)
                                    .labelMedium
                                    .fontStyle,
                              ),
                              color: AppTheme.of(context).secondaryText,
                              fontSize: 15.0,
                              letterSpacing: 0.0,
                              fontWeight: FontWeight.w500,
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
      ),
    );
  }
}
