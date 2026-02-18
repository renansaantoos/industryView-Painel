import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import 'csv_comp_widget.dart' show CsvCompWidget;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class CsvCompModel extends FlutterFlowModel<CsvCompWidget> {
  ///  State fields for stateful widgets in this component.

  // State field(s) for Switch widget.
  bool? switchValue;
  // State field(s) for DropDown widget.
  int? dropDownValue1;
  FormFieldController<int>? dropDownValueController1;
  // State field(s) for DropDown widget.
  String? dropDownValue2;
  FormFieldController<String>? dropDownValueController2;
  // State field(s) for Equipament DropDown.
  int? equipamentValue;
  FormFieldController<int>? equipamentValueController;
  // State field(s) for TextField widget.
  FocusNode? pesoFocusNode;
  TextEditingController? pesoTextController;
  String? Function(BuildContext, String?)? pesoTextControllerValidator;
  // State field(s) for DropDown widget.
  String? unidadeValue;
  FormFieldController<String>? unidadeValueController;
  // State field(s) for TextField widget.
  FocusNode? quantidadeFocusNode;
  TextEditingController? quantidadeTextController;
  String? Function(BuildContext, String?)? quantidadeTextControllerValidator;
  // State field(s) for DropDown widget.
  String? disciplinaValue;
  FormFieldController<String>? disciplinaValueController;
  // State field(s) for TextField widget.
  FocusNode? qtdTarefasFocusNode;
  TextEditingController? qtdTarefasTextController;
  String? Function(BuildContext, String?)? qtdTarefasTextControllerValidator;

  @override
  void initState(BuildContext context) {
    pesoTextController = TextEditingController();
    quantidadeTextController = TextEditingController();
    qtdTarefasTextController = TextEditingController(text: '1');
  }

  @override
  void dispose() {
    pesoFocusNode?.dispose();
    pesoTextController?.dispose();

    quantidadeFocusNode?.dispose();
    quantidadeTextController?.dispose();

    qtdTarefasFocusNode?.dispose();
    qtdTarefasTextController?.dispose();
  }
}
