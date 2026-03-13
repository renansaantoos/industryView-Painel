import '/backend/schema/structs/index.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import '/services/network_service.dart';
import '/auth/custom_auth/auth_util.dart';
import 'dart:ui';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'logout_model.dart';
export 'logout_model.dart';

class LogoutWidget extends StatefulWidget {
  const LogoutWidget({super.key});

  @override
  State<LogoutWidget> createState() => _LogoutWidgetState();
}

class _LogoutWidgetState extends State<LogoutWidget> {
  late LogoutModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => LogoutModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsetsDirectional.fromSTEB(24.0, 80.0, 0.0, 0.0),
      child: Container(
        width: 280.0,
        decoration: BoxDecoration(
          color: AppTheme.of(context).secondaryBackground,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.12),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
          borderRadius: BorderRadius.circular(16.0),
        ),
        child: Padding(
          padding: const EdgeInsets.all(28.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AppButton(
                onPressed: () async {
                  // Verificar se está offline
                  final isOffline = !NetworkService.instance.isConnected;
                  
                  if (isOffline) {
                    // Mostrar modal de confirmação adicional quando offline
                    final confirmLogout = await showDialog<bool>(
                      context: context,
                      barrierDismissible: false,
                      builder: (dialogContext) {
                        return AlertDialog(
                          title: Text(
                            'Atenção',
                            style: AppTheme.of(context).headlineMedium.override(
                              fontFamily: 'Lexend',
                              letterSpacing: 0.0,
                            ),
                          ),
                          content: Text(
                            'Você está no modo offline. Se você sair agora, só será possível conectar novamente quando tiver acesso à internet.\n\nTem certeza que deseja deslogar?',
                            style: AppTheme.of(context).bodyMedium.override(
                              fontFamily: 'Lexend',
                              letterSpacing: 0.0,
                            ),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(dialogContext).pop(false),
                              child: Text(
                                'Cancelar',
                                style: AppTheme.of(context).bodyMedium.override(
                                  fontFamily: 'Lexend',
                                  color: AppTheme.of(context).primaryText,
                                  letterSpacing: 0.0,
                                ),
                              ),
                            ),
                            TextButton(
                              onPressed: () => Navigator.of(dialogContext).pop(true),
                              child: Text(
                                'Deslogar',
                                style: AppTheme.of(context).bodyMedium.override(
                                  fontFamily: 'Lexend',
                                  color: AppTheme.of(context).error,
                                  letterSpacing: 0.0,
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    );
                    
                    // Se o usuário cancelou, não fazer logout
                    if (confirmLogout != true) {
                      return;
                    }
                  }
                  
                  // Fazer logout completo
                  await authManager.signOut();
                  AppState().user = UserLoginStruct();
                  safeSetState(() {});
                  Navigator.pop(context);

                  context.goNamed(LoginWidget.routeName);
                },
                text: AppLocalizations.of(context).getText(
                  'zvzp1hao' /* Logout */,
                ),
                options: AppButtonOptions(
                  width: double.infinity,
                  height: 48.0,
                  padding: const EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                  iconPadding:
                      const EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                  color: AppTheme.of(context).error,
                  textStyle: AppTheme.of(context).bodyMedium.override(
                        font: GoogleFonts.lexend(
                          fontWeight: FontWeight.w600,
                          fontStyle:
                              AppTheme.of(context).bodyMedium.fontStyle,
                        ),
                        color: Colors.white,
                        fontSize: 15.0,
                        letterSpacing: 0.0,
                        fontWeight: FontWeight.w600,
                        fontStyle:
                            AppTheme.of(context).bodyMedium.fontStyle,
                      ),
                  elevation: 0.0,
                  borderSide: const BorderSide(
                    color: Colors.transparent,
                    width: 1.0,
                  ),
                  borderRadius: BorderRadius.circular(14.0),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
