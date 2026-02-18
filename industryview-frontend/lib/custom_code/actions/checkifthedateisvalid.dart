// Automatic FlutterFlow imports
import '/backend/schema/structs/index.dart';
import '/actions/actions.dart' as action_blocks;
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom actions
import '/flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom action code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

// verifica se a forma que estou passando é uma data valida, ex: 34/53/4533 isso não é uma data valida, então retorna false.
import 'package:intl/intl.dart';

Future<bool> checkifthedateisvalid(String date) async {
  if (date.isEmpty) {
    return false;
  }

  try {
    // Remove any extra spaces
    String cleanDate = date.trim();

    // Check if the date format matches dd/MM/yyyy pattern
    RegExp dateRegex = RegExp(r'^\d{2}/\d{2}/\d{4}$');
    if (!dateRegex.hasMatch(cleanDate)) {
      return false;
    }

    // Split the date to validate individual components
    List<String> parts = cleanDate.split('/');
    if (parts.length != 3) {
      return false;
    }

    int day = int.parse(parts[0]);
    int month = int.parse(parts[1]);
    int year = int.parse(parts[2]);

    // Basic range validation
    if (day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12 ||
        year < 1900 ||
        year > 2100) {
      return false;
    }

    // Strict parsing using parseStrict (instead of .parse with lenient)
    DateFormat formatter = DateFormat('dd/MM/yyyy');
    DateTime parsedDate = formatter.parseStrict(cleanDate);

    // Extra check: ensure formatted date matches original
    String formattedBack = formatter.format(parsedDate);
    if (formattedBack != cleanDate) {
      return false;
    }

    return true;
  } catch (e) {
    return false; // Parsing failed → invalid date
  }
}
