import 'dart:async';
import 'package:provider/provider.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_web_plugins/url_strategy.dart';

import 'auth/custom_auth/auth_util.dart';
import 'auth/custom_auth/custom_auth_user_provider.dart';

import '/core/theme/app_theme.dart';
import 'core/utils/app_utils.dart';
import 'core/i18n/app_localizations.dart';
import 'core/navigation/app_router.dart';
import 'index.dart';
import 'services/initial_sync_service.dart';
import 'services/network_service.dart';
import 'services/auth_session_service.dart';
import 'database/database_helper.dart';
import 'widgets/sync_snackbar_listener.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  GoRouter.optionURLReflectsImperativeAPIs = true;
  usePathUrlStrategy();

  // Initialize database
  await DatabaseHelper.instance.database;

  await AppLocalizations.initialize();

  await authManager.initialize();

  // Validate session on startup
  final sessionValid = await AuthSessionService.instance.validateSessionOnStartup();
  if (kDebugMode) {
    print('Main: Session validation result: $sessionValid');
  }

  // Start token expiration monitoring
  AuthSessionService.instance.startMonitoring();

  final appState = AppState(); // Initialize AppState
  await appState.initializePersistedState();

  // Perform initial sync if needed (in background) - only if user is already logged in
  // This will be triggered after login in the login page
  if (loggedIn && currentAuthenticationToken != null && sessionValid) {
    // Executar sync em background sem bloquear a inicialização do app
    Future.microtask(() async {
      try {
        await InitialSyncService.instance.performInitialSyncIfNeeded();
      } catch (e) {
        // Não propagar erro - sync pode falhar sem quebrar o app
        if (kDebugMode) {
          print('Main: Erro no initial sync (não crítico): $e');
        }
      }
    });
  }

  // Quando voltar a ficar online: dispara refresh na página atual e sync em background
  bool _wasOffline = false;
  NetworkService.instance.listenConnection((isConnected) {
    if (isConnected && _wasOffline) {
      _wasOffline = false;
      AppState().signalConnectionRestored(); // refresh na página atual
    } else if (!isConnected) {
      _wasOffline = true;
    }
    if (isConnected && loggedIn && currentAuthenticationToken != null) {
      Future.microtask(() async {
        try {
          await InitialSyncService.instance.performInitialSyncIfNeeded(force: true);
        } catch (e) {
          if (kDebugMode) {
            print('Main: Erro no sync ao reconectar (não crítico): $e');
          }
        }
      });
    }
  });

  runApp(ChangeNotifierProvider(
    create: (context) => appState,
    child: MyApp(),
  ));
}

class MyApp extends StatefulWidget {
  // This widget is the root of your application.
  @override
  State<MyApp> createState() => _MyAppState();

  static _MyAppState of(BuildContext context) =>
      context.findAncestorStateOfType<_MyAppState>()!;
}

class MyAppScrollBehavior extends MaterialScrollBehavior {
  @override
  Set<PointerDeviceKind> get dragDevices => {
        PointerDeviceKind.touch,
        PointerDeviceKind.mouse,
      };
}

class _OfflineBannerWrapper extends StatelessWidget {
  final Widget child;
  final Widget banner;
  final bool isOnline;

  const _OfflineBannerWrapper({
    required this.child,
    required this.banner,
    required this.isOnline,
  });

  @override
  Widget build(BuildContext context) {
    return _wrapChildWithBanner(child, banner, isOnline);
  }

  Widget _wrapChildWithBanner(Widget child, Widget banner, bool isOnline) {
    if (child is Scaffold) {
      final scaffold = child as Scaffold;
      final showBanner = !isOnline;
      
      final Widget? wrappedBody = showBanner
          ? Column(
              children: [
                banner,
                Expanded(child: scaffold.body ?? const SizedBox.shrink()),
              ],
            )
          : scaffold.body;

      return Scaffold(
        key: scaffold.key,
        appBar: scaffold.appBar,
        body: wrappedBody,
        backgroundColor: scaffold.backgroundColor,
        bottomNavigationBar: scaffold.bottomNavigationBar,
        drawer: scaffold.drawer,
        endDrawer: scaffold.endDrawer,
        floatingActionButton: scaffold.floatingActionButton,
        floatingActionButtonLocation: scaffold.floatingActionButtonLocation,
        persistentFooterButtons: scaffold.persistentFooterButtons,
        resizeToAvoidBottomInset: scaffold.resizeToAvoidBottomInset,
        primary: scaffold.primary,
        drawerEnableOpenDragGesture: scaffold.drawerEnableOpenDragGesture,
        endDrawerEnableOpenDragGesture: scaffold.endDrawerEnableOpenDragGesture,
        extendBody: scaffold.extendBody,
        extendBodyBehindAppBar: scaffold.extendBodyBehindAppBar,
        drawerScrimColor: scaffold.drawerScrimColor,
        drawerEdgeDragWidth: scaffold.drawerEdgeDragWidth,
        drawerDragStartBehavior: scaffold.drawerDragStartBehavior,
        restorationId: scaffold.restorationId,
        bottomSheet: scaffold.bottomSheet,
      );
    }
    
    // Se não for Scaffold, retorna o child original
    return child;
  }
}

class _MyAppState extends State<MyApp> {
  Locale? _locale;

  ThemeMode _themeMode = ThemeMode.system;

  late AppStateNotifier _appStateNotifier;
  late GoRouter _router;
  String getRoute([RouteMatch? routeMatch]) {
    final RouteMatch lastMatch =
        routeMatch ?? _router.routerDelegate.currentConfiguration.last;
    final RouteMatchList matchList = lastMatch is ImperativeRouteMatch
        ? lastMatch.matches
        : _router.routerDelegate.currentConfiguration;
    return matchList.uri.toString();
  }

  List<String> getRouteStack() =>
      _router.routerDelegate.currentConfiguration.matches
          .map((e) => getRoute(e))
          .toList();
  late Stream<IndustryViewAuthUser> userStream;
  StreamSubscription<AuthEvent>? _authEventSubscription;

  @override
  void initState() {
    super.initState();

    _appStateNotifier = AppStateNotifier.instance;
    _router = createRouter(_appStateNotifier);
    _locale = AppLocalizations.getStoredLocale();
    userStream = industryViewAuthUserStream()
      ..listen((user) {
        _appStateNotifier.update(user);
      });

    // Listen to auth events
    _authEventSubscription = AuthSessionService.instance.authEventStream.listen(
      (event) {
        _handleAuthEvent(event);
      },
    );

    Future.delayed(
      Duration(milliseconds: 1000),
      () => _appStateNotifier.stopShowingSplashImage(),
    );
  }

  @override
  void dispose() {
    _authEventSubscription?.cancel();
    super.dispose();
  }

  /// Handle authentication events from AuthSessionService
  void _handleAuthEvent(AuthEvent event) {
    switch (event) {
      case AuthEvent.logout:
        // Navigate to login page and show message
        if (kDebugMode) {
          print('Main: Auth logout event received, navigating to login');
        }

        // Use goNamed to replace the entire route stack
        _router.goNamed(LoginWidget.routeName);

        // Show snackbar message
        Future.delayed(const Duration(milliseconds: 500), () {
          final context = appNavigatorKey.currentContext;
          if (context != null && context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Sua sessão expirou. Por favor, faça login novamente.'),
                backgroundColor: Colors.red,
                duration: Duration(seconds: 5),
              ),
            );
          }
        });
        break;

      case AuthEvent.tokenExpiringSoon:
        // Optionally show warning that token is expiring soon
        if (kDebugMode) {
          print('Main: Token expiring soon');
        }
        // Could show a snackbar warning here if desired
        break;

      case AuthEvent.sessionValidated:
        if (kDebugMode) {
          print('Main: Session validated successfully');
        }
        break;
    }
  }

  void setLocale(String language) {
    safeSetState(() => _locale = createLocale(language));
  }

  void setThemeMode(ThemeMode mode) => safeSetState(() {
        _themeMode = mode;
      });

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      title: 'IndustryView',
      scrollBehavior: MyAppScrollBehavior(),
      builder: (context, child) {
        return SyncSnackbarListener(
          child: child ?? const SizedBox.shrink(),
        );
      },
      localizationsDelegates: [
        AppLocalizationsDelegate(),
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        FallbackMaterialLocalizationDelegate(),
        FallbackCupertinoLocalizationDelegate(),
      ],
      locale: _locale,
      supportedLocales: const [
        Locale('pt'),
        Locale('es'),
        Locale('en'),
      ],
      theme: ThemeData(
        brightness: Brightness.light,
        useMaterial3: false,
      ),
      themeMode: _themeMode,
      routerConfig: _router,
    );
  }
}
