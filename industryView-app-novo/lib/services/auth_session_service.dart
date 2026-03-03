import 'dart:async';
import 'package:flutter/foundation.dart';
import '../auth/custom_auth/auth_util.dart';
import '../app_state.dart';
import '../backend/schema/structs/index.dart';
import '../services/token_validator.dart';

/// Events emitted by the authentication session service
enum AuthEvent {
  logout, // Token invalid/expired, force logout
  tokenExpiringSoon, // Token will expire soon (warning)
  sessionValidated, // Session validated on startup
}

/// Singleton service that manages authentication session lifecycle
///
/// Responsibilities:
/// - Monitor token expiration with periodic checks
/// - Handle 401 unauthorized responses globally
/// - Validate token on app startup
/// - Emit events for UI to react to (logout, warnings, etc.)
class AuthSessionService {
  static final AuthSessionService instance = AuthSessionService._internal();

  AuthSessionService._internal();

  // Stream controller for auth events
  final StreamController<AuthEvent> _authEventController =
      StreamController<AuthEvent>.broadcast();

  // Public stream for listening to auth events
  Stream<AuthEvent> get authEventStream => _authEventController.stream;

  // Timer for periodic token expiration checks
  Timer? _monitoringTimer;

  // Flag to prevent multiple simultaneous logout operations
  bool _isLoggingOut = false;

  // Flag to track if monitoring has started
  bool _isMonitoring = false;

  /// Start monitoring token expiration
  ///
  /// Checks every 60 seconds for:
  /// 1. Token expired -> trigger logout
  /// 2. Token expires in 5 minutes -> emit warning
  void startMonitoring() {
    if (_isMonitoring) {
      if (kDebugMode) {
        print('AuthSessionService: Monitoring already started');
      }
      return;
    }

    _isMonitoring = true;
    if (kDebugMode) {
      print('AuthSessionService: Starting token expiration monitoring');
    }

    // Check immediately on start
    _checkTokenExpiration();

    // Then check every 60 seconds
    _monitoringTimer = Timer.periodic(
      const Duration(seconds: 60),
      (timer) => _checkTokenExpiration(),
    );
  }

  /// Stop monitoring token expiration
  void stopMonitoring() {
    if (kDebugMode) {
      print('AuthSessionService: Stopping token expiration monitoring');
    }
    _monitoringTimer?.cancel();
    _monitoringTimer = null;
    _isMonitoring = false;
  }

  /// Check if token is expired or expiring soon
  void _checkTokenExpiration() {
    final tokenExpiration = currentAuthTokenExpiration;
    if (tokenExpiration == null) {
      // No token, no need to check
      return;
    }

    final now = DateTime.now();

    // Check if token is already expired
    if (tokenExpiration.isBefore(now)) {
      if (kDebugMode) {
        print('AuthSessionService: Token expired at $tokenExpiration, triggering logout');
      }
      _triggerLogout();
      return;
    }

    // Check if token expires in the next 5 minutes
    final fiveMinutesFromNow = now.add(const Duration(minutes: 5));
    if (tokenExpiration.isBefore(fiveMinutesFromNow)) {
      if (kDebugMode) {
        print('AuthSessionService: Token expiring soon at $tokenExpiration');
      }
      _authEventController.add(AuthEvent.tokenExpiringSoon);
    }
  }

  /// Validate session on app startup
  ///
  /// Returns true if session is valid, false if logged out
  ///
  /// Logic:
  /// 1. If no token exists -> do nothing (user not logged in)
  /// 2. If token exists but expired -> silent logout
  /// 3. If token exists and not expired -> validate with server
  /// 4. If server says invalid -> logout
  Future<bool> validateSessionOnStartup() async {
    final token = currentAuthenticationToken;
    final tokenExpiration = currentAuthTokenExpiration;

    // No token, user is not logged in
    if (token == null || token.isEmpty) {
      if (kDebugMode) {
        print('AuthSessionService: No token found on startup');
      }
      return false;
    }

    // Token exists but is expired
    if (tokenExpiration != null && tokenExpiration.isBefore(DateTime.now())) {
      if (kDebugMode) {
        print('AuthSessionService: Token expired on startup, logging out silently');
      }
      await authManager.signOut();
      _clearUserData();
      return false;
    }

    // Token exists and not expired, validate with server
    try {
      if (kDebugMode) {
        print('AuthSessionService: Validating token with server on startup');
      }

      final isValid = await TokenValidator.instance.validateToken();

      if (!isValid) {
        if (kDebugMode) {
          print('AuthSessionService: Server rejected token on startup, logging out');
        }
        await authManager.signOut();
        _clearUserData();
        return false;
      }

      if (kDebugMode) {
        print('AuthSessionService: Token validated successfully on startup');
      }
      _authEventController.add(AuthEvent.sessionValidated);
      return true;
    } catch (e) {
      if (kDebugMode) {
        print('AuthSessionService: Error validating token on startup: $e');
      }
      // On error, keep user logged in but don't validate
      // This allows offline use when server is unreachable
      return true;
    }
  }

  /// Handle 401 unauthorized response from API
  ///
  /// This should be called whenever an API call returns 401 status
  /// Will trigger logout if not already in progress
  void handleUnauthorized() {
    if (_isLoggingOut) {
      // Already logging out, ignore
      return;
    }

    if (kDebugMode) {
      print('AuthSessionService: 401 Unauthorized detected, triggering logout');
    }

    _triggerLogout();
  }

  /// Trigger logout and emit event
  void _triggerLogout() {
    if (_isLoggingOut) {
      return;
    }

    _isLoggingOut = true;

    // Perform logout
    Future.microtask(() async {
      try {
        await authManager.signOut();
        _clearUserData();

        // Emit logout event for UI to react
        _authEventController.add(AuthEvent.logout);

        if (kDebugMode) {
          print('AuthSessionService: Logout completed, event emitted');
        }
      } catch (e) {
        if (kDebugMode) {
          print('AuthSessionService: Error during logout: $e');
        }
      } finally {
        _isLoggingOut = false;
      }
    });
  }

  /// Clear user data from AppState
  void _clearUserData() {
    try {
      AppState().user = UserLoginStruct();
      if (kDebugMode) {
        print('AuthSessionService: User data cleared from AppState');
      }
    } catch (e) {
      if (kDebugMode) {
        print('AuthSessionService: Error clearing user data: $e');
      }
    }
  }

  /// Dispose resources
  void dispose() {
    stopMonitoring();
    _authEventController.close();
  }
}
