import 'dart:async';

import 'package:flutter/material.dart';
import '../services/sync_service.dart';
import '../core/utils/app_utils.dart';
import '/index.dart';

class SyncSnackbarListener extends StatefulWidget {
  final Widget child;

  const SyncSnackbarListener({
    super.key,
    required this.child,
  });

  @override
  State<SyncSnackbarListener> createState() => _SyncSnackbarListenerState();
}

class _SyncSnackbarListenerState extends State<SyncSnackbarListener> {
  final SyncService _syncService = SyncService.instance;
  StreamSubscription<int>? _conflictSubscription;
  StreamSubscription<int>? _failedSubscription;
  StreamSubscription<SyncUserMessage>? _messageSubscription;
  int _lastConflictCount = 0;
  int _lastFailedCount = 0;

  @override
  void initState() {
    super.initState();
    _conflictSubscription = _syncService.conflictCountStream.listen((count) {
      if (!mounted) return;
      if (count > _lastConflictCount && count > 0) {
        _showConflictSnackbar(count);
      }
      _lastConflictCount = count;
    });

    _failedSubscription = _syncService.failedCountStream.listen((count) {
      if (!mounted) return;
      if (count > _lastFailedCount && count > 0) {
        _showErrorSnackbar();
      }
      _lastFailedCount = count;
    });

    _messageSubscription = _syncService.messageStream.listen((message) {
      if (!mounted) return;
      if (message.type == SyncUserMessageType.savedOffline) {
        _showSimpleSnackbar(message.message);
      }
    });
  }

  void _showConflictSnackbar(int count) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Conflito detectado ($count). Toque para resolver.'),
          action: SnackBarAction(
            label: 'Resolver',
            onPressed: () {
              context.pushNamed(SyncConflictsWidget.routeName);
            },
          ),
        ),
      );
    });
  }

  void _showErrorSnackbar() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Erro ao sincronizar.'),
          action: SnackBarAction(
            label: 'Tentar novamente',
            onPressed: () {
              _syncService.syncPendingChanges(force: true);
            },
          ),
        ),
      );
    });
  }

  void _showSimpleSnackbar(String message) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).hideCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
        ),
      );
    });
  }

  @override
  void dispose() {
    _conflictSubscription?.cancel();
    _failedSubscription?.cancel();
    _messageSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
