import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import '/services/network_service.dart';
import '/services/rdo_prefetch_service.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lottie/lottie.dart';

/// Widget de empty state específico para RDO quando offline e sem dados locais
class RdoEmptyStateWidget extends StatelessWidget {
  final VoidCallback? onRetry;

  const RdoEmptyStateWidget({
    super.key,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final isOnline = NetworkService.instance.isConnected;

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppTheme.of(context).secondaryBackground,
      ),
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Builder(
              builder: (context) {
                try {
                  return Lottie.asset(
                    'assets/jsons/Empty.json',
                    width: 150.0,
                    height: 150.0,
                    fit: BoxFit.contain,
                    animate: true,
                  );
                } catch (e) {
                  return Icon(
                    Icons.inbox_outlined,
                    size: 80.0,
                    color: AppTheme.of(context).secondaryText,
                  );
                }
              },
            ),
            const SizedBox(height: 24.0),
            Text(
              isOnline
                  ? 'Sem dados ainda'
                  : 'Sem dados offline ainda',
              style: AppTheme.of(context).headlineSmall.override(
                    font: GoogleFonts.lexend(
                      fontWeight: FontWeight.bold,
                    ),
                    letterSpacing: 0.0,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12.0),
            Text(
              isOnline
                  ? 'Conecte-se à internet e abra a RDO para carregar os dados pela primeira vez.'
                  : 'Conecte-se à internet para carregar a RDO pela primeira vez.',
              style: AppTheme.of(context).bodyMedium.override(
                    font: GoogleFonts.lexend(),
                    letterSpacing: 0.0,
                    color: AppTheme.of(context).secondaryText,
                  ),
              textAlign: TextAlign.center,
            ),
            if (isOnline && onRetry != null) ...[
              const SizedBox(height: 24.0),
              AppButton(
                onPressed: () async {
                  // Tentar fazer prefetch
                  final success = await RdoPrefetchService.instance.prefetchRdoData(force: true);
                  if (success) {
                    // Recarregar a página
                    onRetry?.call();
                  } else {
                    // Mostrar erro se necessário
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Não foi possível carregar os dados. Tente novamente.'),
                        backgroundColor: AppTheme.of(context).error,
                      ),
                    );
                  }
                },
                text: 'Tentar novamente',
                options: AppButtonOptions(
                  width: 200.0,
                  height: 48.0,
                  padding: const EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                  iconPadding: const EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                  color: AppTheme.of(context).primary,
                  textStyle: AppTheme.of(context).titleSmall.override(
                        font: GoogleFonts.lexend(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                        letterSpacing: 0.0,
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
          ],
        ),
      ),
    );
  }
}
