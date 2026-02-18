import '/backend/api_requests/api_calls.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/upload_data.dart';
import 'dart:ui';
import 'modal_import_widget.dart' show ModalImportWidget;
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModalImportModel extends FlutterFlowModel<ModalImportWidget> {
  ///  Local state fields for this component.

  bool erroImport = false;

  ///  State fields for stateful widgets in this component.

  bool isDataUploading_uploadData3d4 = false;
  FFUploadedFile uploadedLocalFile_uploadData3d4 =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');

  // Stores action output result for [Backend Call - API (Import users csv)] action in Button widget.
  ApiCallResponse? importCsv;

  @override
  void initState(BuildContext context) {}

  @override
  void dispose() {}
}
