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

Future actRemoveInfoTracker(List<DropSelect1Struct> trackers) async {
  for (int i = 0; i < trackers.length; i++) {
    FFAppState().updateAddFileiraTrackerAtIndex(
      i,
      (tracker) => tracker..rowsTrackersId = null,
    );
  }
  FFAppState().update(() {});
}
