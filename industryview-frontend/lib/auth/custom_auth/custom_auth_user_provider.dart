import 'package:rxdart/rxdart.dart';

import 'custom_auth_manager.dart';

class ParqueSolarAuthUser {
  ParqueSolarAuthUser({required this.loggedIn, this.uid});

  bool loggedIn;
  String? uid;
}

/// Generates a stream of the authenticated user.
BehaviorSubject<ParqueSolarAuthUser> parqueSolarAuthUserSubject =
    BehaviorSubject.seeded(ParqueSolarAuthUser(loggedIn: false));
Stream<ParqueSolarAuthUser> parqueSolarAuthUserStream() =>
    parqueSolarAuthUserSubject
        .asBroadcastStream()
        .map((user) => currentUser = user);
