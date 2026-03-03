import 'dart:async';
import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class NetworkService {
  static final NetworkService instance = NetworkService._internal();
  StreamController<bool>? _connectionController;
  Stream<bool>? _connectionStream;
  bool _isConnected = false;
  Timer? _periodicCheckTimer;
  StreamSubscription<InternetStatus>? _statusSubscription;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;
  bool _lastConnectivityHasNetwork = false;
  bool? _overrideConnection;

  NetworkService._internal() {
    _init();
  }

  void _init() {
    _connectionController = StreamController<bool>.broadcast();
    _connectionStream = _connectionController!.stream;
    
    // Check initial connection status
    checkConnection();

    // Listen to realtime connection status changes
    _statusSubscription = InternetConnection().onStatusChange.listen(
      (status) {
        final isConnected = status == InternetStatus.connected;
        if (isConnected != _isConnected) {
          _isConnected = isConnected;
          _connectionController?.add(_isConnected);
        }
      },
    );

    // Also listen to connectivity changes to trigger immediate recheck
    _connectivitySubscription =
        Connectivity().onConnectivityChanged.listen((results) {
      final hasNetwork =
          results.any((result) => result != ConnectivityResult.none);
      _lastConnectivityHasNetwork = hasNetwork;
      if (hasNetwork != _isConnected) {
        _isConnected = hasNetwork;
        _connectionController?.add(_isConnected);
      }
      // Ainda checa em background para usos internos.
      checkConnection();
    });
    
    // Set up periodic checking every 30 seconds
    _periodicCheckTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => checkConnection(),
    );
  }

  /// Check current internet connection status
  Future<bool> checkConnection() async {
    try {
      if (_overrideConnection != null) {
        _isConnected = _overrideConnection!;
        _connectionController?.add(_isConnected);
        return _isConnected;
      }
      final checker = InternetConnection();
      final isConnected = await checker.hasInternetAccess;
      // Para UI, prioriza status da rede (wifi/5g). Só derruba se não houver rede.
      if (!_lastConnectivityHasNetwork && _isConnected) {
        _isConnected = false;
        _connectionController?.add(false);
      }
      if (_lastConnectivityHasNetwork && !_isConnected) {
        _isConnected = true;
        _connectionController?.add(true);
      }
      return _isConnected;
    } catch (e) {
      if (!_lastConnectivityHasNetwork) {
        _isConnected = false;
        _connectionController?.add(false);
      }
      return false;
    }
  }

  /// Get current connection status (cached)
  bool get isConnected => _overrideConnection ?? _isConnected;

  void setConnectionOverride(bool? isConnected) {
    _overrideConnection = isConnected;
    if (isConnected != null && isConnected != _isConnected) {
      _isConnected = isConnected;
      _connectionController?.add(_isConnected);
    }
  }

  /// Stream of connection status changes
  Stream<bool> get connectionStream => _connectionStream ?? const Stream.empty();

  /// Listen to connection changes
  StreamSubscription<bool> listenConnection(
    void Function(bool isConnected) onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) {
    return connectionStream.listen(
      onData,
      onError: onError,
      onDone: onDone,
      cancelOnError: cancelOnError,
    );
  }

  /// Dispose resources
  void dispose() {
    _periodicCheckTimer?.cancel();
    _statusSubscription?.cancel();
    _connectivitySubscription?.cancel();
    _connectionController?.close();
    _connectionController = null;
    _connectionStream = null;
  }
}
