// Automatic FlutterFlow imports
import '/backend/schema/structs/index.dart';
import '/actions/actions.dart' as action_blocks;
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import 'index.dart'; // Imports other custom widgets
import '/custom_code/actions/index.dart'; // Imports custom actions
import '/flutter_flow/custom_functions.dart'; // Imports custom functions
import 'package:flutter/material.dart';
// Begin custom widget code
// DO NOT REMOVE OR MODIFY THE CODE ABOVE!

import 'package:universal_html/html.dart';
import 'dart:ui_web' if (dart.library.io) 'ui_web_stub.dart' as ui_web;
import 'package:flutter/foundation.dart';

class TrackerWebView extends StatefulWidget {
  const TrackerWebView({
    super.key,
    this.width,
    this.height,
    required this.projectsID,
    required this.fieldsID,
    required this.authToken,
    required this.mode,
    required this.companyID,
    required this.locale,
  });

  final double? width;
  final double? height;
  final int projectsID;
  final int fieldsID;
  final String authToken;
  final String mode;
  final int companyID;
  final String locale;

  @override
  State<TrackerWebView> createState() => _TrackerWebViewState();
}

class _TrackerWebViewState extends State<TrackerWebView> {
  late final String viewId;

  @override
  void initState() {
    super.initState();

    // 🔥 viewId ÚNICO para forçar recriação do iframe
    viewId =
        'tracker-webview-${widget.locale}-${DateTime.now().millisecondsSinceEpoch}';

    if (kIsWeb) {
      final uri = Uri.parse(
        'https://samantha-maia.github.io/mapa-de-tracker/',
      ).replace(queryParameters: {
        'projectId': widget.projectsID.toString(),
        'fieldId': widget.fieldsID.toString(),
        'authToken': widget.authToken,
        'mode': widget.mode,
        'companyId': widget.companyID.toString(),
        'locale': widget.locale,
      });

      ui_web.platformViewRegistry.registerViewFactory(
        viewId,
        (int viewId) {
          final iframe = IFrameElement()
            ..src = uri.toString()
            ..style.border = 'none'
            ..style.width = '100%'
            ..style.height = '100%';
          return iframe;
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return kIsWeb
        ? SizedBox(
            width: widget.width ?? double.infinity,
            height: widget.height ?? double.infinity,
            child: HtmlElementView(viewType: viewId),
          )
        : const Text('Disponível apenas na versão Web.');
  }
}
