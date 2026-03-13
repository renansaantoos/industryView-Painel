import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'qrcode_model.dart';
export 'qrcode_model.dart';

class QrcodeWidget extends StatefulWidget {
  const QrcodeWidget({super.key});

  @override
  State<QrcodeWidget> createState() => _QrcodeWidgetState();
}

class _QrcodeWidgetState extends State<QrcodeWidget> {
  late QrcodeModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => QrcodeModel());

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

    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: FutureBuilder<ApiCallResponse>(
        future: _model.user(
          requestFn: () => UserGroup.getUserIdCall.call(
            usersId: AppState().user.id,
            bearerAuth: currentAuthenticationToken,
          ),
        ),
        builder: (context, snapshot) {
          // Customize what your widget looks like when it's loading.
          if (!snapshot.hasData) {
            return Center(
              child: SizedBox(
                width: 50.0,
                height: 50.0,
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(
                    AppTheme.of(context).primary,
                  ),
                ),
              ),
            );
          }
          final containerGetUserIdResponse = snapshot.data!;

          return Container(
            width: 400.0,
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
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Align(
                        alignment: const AlignmentDirectional(1.0, -1.0),
                        child: AppIconButton(
                          borderColor: AppTheme.of(context).primary,
                          borderRadius: 8.0,
                          borderWidth: 1.0,
                          buttonSize: 32.0,
                          fillColor: AppTheme.of(context).secondary,
                          icon: Icon(
                            Icons.close_sharp,
                            color: AppTheme.of(context).primary,
                            size: 16.0,
                          ),
                          onPressed: () async {
                            Navigator.pop(context);
                          },
                        ),
                      ),
                    ].divide(const SizedBox(width: 12.0)),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      Expanded(
                        child: Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color:
                                AppTheme.of(context).primaryBackground,
                            borderRadius: BorderRadius.circular(14.0),
                            border: Border.all(
                              color: AppTheme.of(context).alternate,
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Row(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                Flexible(
                                  child: Text(
                                    valueOrDefault<String>(
                                      UserGroup.getUserIdCall.name(
                                        containerGetUserIdResponse.jsonBody,
                                      ),
                                      '-',
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
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ].divide(const SizedBox(width: 16.0)),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      Container(
                        width: 120.0,
                        decoration: BoxDecoration(
                          color: AppTheme.of(context).primaryBackground,
                          borderRadius: BorderRadius.circular(14.0),
                          border: Border.all(
                            color: AppTheme.of(context).alternate,
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Row(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              Flexible(
                                child: Text(
                                  valueOrDefault<String>(
                                    UserGroup.getUserIdCall.phone(
                                      containerGetUserIdResponse.jsonBody,
                                    ),
                                    '-',
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
                                        fontWeight: AppTheme.of(context)
                                            .bodyMedium
                                            .fontWeight,
                                        fontStyle: AppTheme.of(context)
                                            .bodyMedium
                                            .fontStyle,
                                      ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Expanded(
                        child: Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color:
                                AppTheme.of(context).primaryBackground,
                            borderRadius: BorderRadius.circular(14.0),
                            border: Border.all(
                              color: AppTheme.of(context).alternate,
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Row(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                Flexible(
                                  child: Text(
                                    valueOrDefault<String>(
                                      UserGroup.getUserIdCall.email(
                                        containerGetUserIdResponse.jsonBody,
                                      ),
                                      '-',
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
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ].divide(const SizedBox(width: 12.0)),
                  ),
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppTheme.of(context).primaryBackground,
                      borderRadius: BorderRadius.circular(14.0),
                      border: Border.all(
                        color: AppTheme.of(context).alternate,
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        children: [
                          Flexible(
                            child: Text(
                              valueOrDefault<String>(
                                getJsonField(
                                  containerGetUserIdResponse.jsonBody,
                                  r'''$.result1.users_permissions.users_roles.role''',
                                )?.toString(),
                                '-',
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
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.max,
                    children: [
                      Expanded(
                        child: Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color:
                                AppTheme.of(context).primaryBackground,
                            borderRadius: BorderRadius.circular(14.0),
                            border: Border.all(
                              color: AppTheme.of(context).alternate,
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Row(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                Flexible(
                                  child: Text(
                                    valueOrDefault<String>(
                                      getJsonField(
                                        containerGetUserIdResponse.jsonBody,
                                        r'''$.result1.users_permissions.users_system_access.env''',
                                      )?.toString(),
                                      '-',
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
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color:
                                AppTheme.of(context).primaryBackground,
                            borderRadius: BorderRadius.circular(14.0),
                            border: Border.all(
                              color: AppTheme.of(context).alternate,
                            ),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: Row(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                Flexible(
                                  child: Text(
                                    valueOrDefault<String>(
                                      getJsonField(
                                        containerGetUserIdResponse.jsonBody,
                                        r'''$.result1.users_permissions.users_control_system.access_level''',
                                      )?.toString(),
                                      '-',
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
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ].divide(const SizedBox(width: 12.0)),
                  ),
                  if (UserGroup.getUserIdCall.qrcode(
                            containerGetUserIdResponse.jsonBody,
                          ) !=
                          null &&
                      UserGroup.getUserIdCall.qrcode(
                            containerGetUserIdResponse.jsonBody,
                          ) !=
                          '')
                    Align(
                      alignment: const AlignmentDirectional(0.0, 0.0),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8.0),
                        child: Image.network(
                          UserGroup.getUserIdCall.qrcode(
                            containerGetUserIdResponse.jsonBody,
                          )!,
                          width: 120.0,
                          height: 120.0,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                ].divide(const SizedBox(height: 16.0)),
              ),
            ),
          );
        },
      ),
    );
  }
}
