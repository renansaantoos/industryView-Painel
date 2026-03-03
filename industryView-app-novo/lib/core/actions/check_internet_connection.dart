
import '/backend/schema/structs/index.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import 'index.dart';
import '/core/utils/custom_functions.dart';
import 'package:flutter/material.dart';



import 'dart:async';

import 'package:internet_connection_checker_plus/internet_connection_checker_plus.dart';

Future<bool> checkInternetConnection() async {
  bool result = await InternetConnection().hasInternetAccess;
  return result;
}
