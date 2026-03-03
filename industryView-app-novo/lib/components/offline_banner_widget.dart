import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/services/network_service.dart';
import 'package:flutter/material.dart';

class OfflineBannerWidget extends StatelessWidget {
  const OfflineBannerWidget({
    super.key,
    this.margin = const EdgeInsets.only(bottom: 12.0),
  });

  final EdgeInsetsGeometry margin;

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<bool>(
      stream: NetworkService.instance.connectionStream,
      initialData: NetworkService.instance.isConnected,
      builder: (context, snapshot) {
        final isOnline = snapshot.data ?? NetworkService.instance.isConnected;
        return AnimatedCrossFade(
          duration: const Duration(milliseconds: 300),
          crossFadeState:
              isOnline ? CrossFadeState.showFirst : CrossFadeState.showSecond,
          firstChild: const SizedBox.shrink(),
          secondChild: Padding(
            padding: margin,
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppTheme.of(context).warning.withOpacity(0.18),
                    AppTheme.of(context).warning.withOpacity(0.10),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14.0),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 10.0,
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.cloud_off,
                      size: 18.0,
                      color: AppTheme.of(context).warning,
                    ),
                    const SizedBox(width: 10.0),
                    Expanded(
                      child: Text(
                        AppLocalizations.of(context).getText(
                          'offline_banner_message' /* Modo offline ativo. Seus dados serão sincronizados quando a conexão voltar */,
                        ),
                        style: AppTheme.of(context).bodySmall.override(
                              color: AppTheme.of(context).warning,
                              fontSize: 12.0,
                              fontWeight: FontWeight.w500,
                            ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
