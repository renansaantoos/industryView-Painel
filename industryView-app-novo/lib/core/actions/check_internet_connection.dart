



import 'dart:async';

import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';

Future<bool> checkInternetConnection() async {
  bool result = await InternetConnection().hasInternetAccess;
  return result;
}
