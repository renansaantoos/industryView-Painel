import 'package:rxdart/rxdart.dart';

import 'custom_auth_manager.dart';

class IndustryViewAuthUser {
  IndustryViewAuthUser({required this.loggedIn, this.uid});

  bool loggedIn;
  String? uid;
}

/// Generates a stream of the authenticated user.
BehaviorSubject<IndustryViewAuthUser> industryViewAuthUserSubject =
    BehaviorSubject.seeded(IndustryViewAuthUser(loggedIn: false));
Stream<IndustryViewAuthUser> industryViewAuthUserStream() =>
    industryViewAuthUserSubject
        .asBroadcastStream()
        .map((user) => currentUser = user);
