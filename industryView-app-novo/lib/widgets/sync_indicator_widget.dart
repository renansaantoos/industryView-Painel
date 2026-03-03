import 'package:flutter/material.dart';
import '../services/network_service.dart';
import '../services/sync_service.dart';
import '../components/modal_info_widget.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/app_utils.dart';
import '/index.dart';

class SyncIndicatorWidget extends StatefulWidget {
  final bool showText;
  final double? size;

  const SyncIndicatorWidget({
    Key? key,
    this.showText = true,
    this.size,
  }) : super(key: key);

  @override
  State<SyncIndicatorWidget> createState() => _SyncIndicatorWidgetState();
}

class _SyncIndicatorWidgetState extends State<SyncIndicatorWidget> {
  final NetworkService _networkService = NetworkService.instance;
  final SyncService _syncService = SyncService.instance;
  bool _isOnline = true;
  SyncServiceStatus _syncStatus = SyncServiceStatus.idle;
  int _pendingCount = 0;
  int _conflictCount = 0;
  int _failedCount = 0;

  @override
  void initState() {
    super.initState();
    _isOnline = _networkService.isConnected;
    _syncStatus = _syncService.status;
    
    _networkService.listenConnection((isConnected) {
      if (mounted) {
        setState(() {
          _isOnline = isConnected;
        });
      }
    });

    _syncService.statusStream.listen((status) {
      if (mounted) {
        setState(() {
          _syncStatus = status;
        });
        _updateCounts();
      }
    });

    _syncService.conflictCountStream.listen((count) {
      if (mounted) {
        setState(() {
          _conflictCount = count;
        });
      }
    });

    _syncService.failedCountStream.listen((count) {
      if (mounted) {
        setState(() {
          _failedCount = count;
        });
      }
    });

    _syncService.pendingCountStream.listen((count) {
      if (mounted) {
        setState(() {
          _pendingCount = count;
        });
      }
    });

    _updateCounts();
  }

  Future<void> _updateCounts() async {
    final count = await _syncService.getPendingCount();
    final conflictCount = await _syncService.getPendingConflictCount();
    final failedCount = await _syncService.getFailedCount();
    if (mounted) {
      setState(() {
        _pendingCount = count;
        _conflictCount = conflictCount;
        _failedCount = failedCount;
      });
    }
  }

  void _showStatusModal(BuildContext context) {
    // Se houver conflitos, navegar diretamente para a tela de resolução
    if (_conflictCount > 0) {
      context.pushNamed(SyncConflictsWidget.routeName);
      return;
    }

    String title;
    String description;

    if (!_isOnline) {
      title = AppLocalizations.of(context).getVariableText(
        ptText: 'Status: Offline',
        esText: 'Estado: Sin conexión',
        enText: 'Status: Offline',
      );
      description = AppLocalizations.of(context).getVariableText(
        ptText: 'Você está sem conexão com a internet. Seus dados serão sincronizados quando a conexão voltar.',
        esText: 'No tienes conexión a internet. Tus datos se sincronizarán cuando vuelva la conexión.',
        enText: 'You are not connected to the internet. Your data will be synchronized when the connection returns.',
      );
    } else {
      // Quando online, mostra que está online com descrição
      title = AppLocalizations.of(context).getVariableText(
        ptText: 'Você está online',
        esText: 'Estás en línea',
        enText: 'You are online',
      );
      description = AppLocalizations.of(context).getVariableText(
        ptText: 'Você está conectado à internet e pode usar todas as funcionalidades do aplicativo.',
        esText: 'Estás conectado a internet y puedes usar todas las funcionalidades de la aplicación.',
        enText: 'You are connected to the internet and can use all application features.',
      );
    }

    showDialog(
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
              title: title,
              description: description,
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final iconSize = widget.size ?? 20.0;
    IconData icon;
    Color color;
    String? tooltip;

    if (!_isOnline) {
      icon = Icons.cloud_off;
      color = Colors.red;
      tooltip = 'Offline';
    } else if (_conflictCount > 0) {
      icon = Icons.warning_amber_rounded;
      color = Colors.amber;
      tooltip = '$_conflictCount conflito(s)';
    } else if (_failedCount > 0) {
      icon = Icons.error_outline;
      color = Colors.red;
      tooltip = '$_failedCount erro(s)';
    } else if (_syncStatus == SyncServiceStatus.syncing) {
      icon = Icons.sync;
      color = Colors.blue;
      tooltip = 'Sincronizando...';
    } else if (_pendingCount > 0) {
      icon = Icons.cloud_upload;
      color = Colors.orange;
      tooltip = '$_pendingCount pendente(s)';
    } else {
      icon = Icons.cloud_done;
      color = Colors.green;
      tooltip = 'Sincronizado';
    }

    Widget indicator = Icon(
      icon,
      size: iconSize,
      color: color,
    );

    if (_syncStatus == SyncServiceStatus.syncing) {
      indicator = SizedBox(
        width: iconSize,
        height: iconSize,
        child: CircularProgressIndicator(
          strokeWidth: 2.0,
          valueColor: AlwaysStoppedAnimation<Color>(color),
        ),
      );
    }

    // Widget clicável que abre a modal
    Widget clickableIndicator = InkWell(
      onTap: () => _showStatusModal(context),
      borderRadius: BorderRadius.circular(iconSize / 2),
      child: Padding(
        padding: EdgeInsets.all(4.0),
        child: indicator,
      ),
    );

    if (widget.showText) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          clickableIndicator,
          const SizedBox(width: 4),
          Text(
            tooltip ?? '',
            style: TextStyle(
              color: color,
              fontSize: 12,
            ),
          ),
        ],
      );
    }

    return Tooltip(
      message: tooltip ?? '',
      child: clickableIndicator,
    );
  }
}

class SyncButtonWidget extends StatelessWidget {
  final bool showText;

  const SyncButtonWidget({
    Key? key,
    this.showText = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final syncService = SyncService.instance;
    final networkService = NetworkService.instance;

    return StreamBuilder<bool>(
      stream: networkService.connectionStream,
      initialData: networkService.isConnected,
        builder: (context, snapshot) {
        final isOnline = snapshot.data ?? false;
        final currentStatus = syncService.status;
        final canSync = isOnline && currentStatus != SyncServiceStatus.syncing;

        return StreamBuilder<SyncServiceStatus>(
          stream: syncService.statusStream,
          initialData: syncService.status,
          builder: (context, statusSnapshot) {
            final syncStatus = statusSnapshot.data ?? SyncServiceStatus.idle;
            final isSyncing = syncStatus == SyncServiceStatus.syncing;

            return ElevatedButton.icon(
              onPressed: canSync
                  ? () async {
                      await syncService.syncPendingChanges(force: true);
                    }
                  : null,
              icon: isSyncing
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                      ),
                    )
                  : const Icon(Icons.sync),
              label: showText
                  ? Text(isSyncing ? 'Sincronizando...' : 'Sincronizar')
                  : const SizedBox.shrink(),
            );
          },
        );
      },
    );
  }
}
