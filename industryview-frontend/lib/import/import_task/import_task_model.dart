import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/csv_comp_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import '/import/headers/headers_widget.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/flutter_flow/custom_functions.dart' as functions;
import '/index.dart';
import 'import_task_widget.dart' show ImportTaskWidget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ImportTaskModel extends FlutterFlowModel<ImportTaskWidget> {
  ///  Local state fields for this page.

  bool mostra = false;

  bool previa = false;

  List<dynamic> csv = [];
  void addToCsv(dynamic item) => csv.add(item);
  void removeFromCsv(dynamic item) => csv.remove(item);
  void removeAtIndexFromCsv(int index) => csv.removeAt(index);
  void insertAtIndexInCsv(int index, dynamic item) => csv.insert(index, item);
  void updateCsvAtIndex(int index, Function(dynamic) updateFn) =>
      csv[index] = updateFn(csv[index]);

  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (tarefas sem page e perpage)] action in import_task widget.
  ApiCallResponse? allTasks;
  // Stores action output result for [Backend Call - API (Equipments)]
  ApiCallResponse? allEquipments;
  // Stores action output result for [Backend Call - API (Units)]
  ApiCallResponse? allUnits;
  // Stores action output result for [Backend Call - API (Discipline)]
  ApiCallResponse? allDisciplines;
  ApiCallResponse? apiResultImport;
  // Model for navBar component.
  late NavBarModel navBarModel;
  // Stores action output result for [Custom Action - csvJson] action in Button widget.
  List<dynamic>? csvJson;
  // Stores action output result for [Custom Action - extractCsvHeaders] action in Button widget.
  List<String>? headers;
  // State field(s) for DropDown widget.
  String? dropDownValue1;
  FormFieldController<String>? dropDownValueController1;
  // State field(s) for DropDown widget.
  String? dropDownValue2;
  FormFieldController<String>? dropDownValueController2;
  // State field(s) for DropDown widget.
  String? dropDownValue3;
  FormFieldController<String>? dropDownValueController3;
  // State field(s) for DropDown widget.
  String? dropDownValue4;
  FormFieldController<String>? dropDownValueController4;

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
  }

  @override
  void dispose() {
    navBarModel.dispose();
  }
}
