import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import '/flutter_flow/upload_data.dart';
import 'dart:ui';
import '/actions/actions.dart' as action_blocks;
import '/index.dart';
import 'modal_add_usuario_widget.dart' show ModalAddUsuarioWidget;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';
import 'package:provider/provider.dart';

class ModalAddUsuarioModel extends FlutterFlowModel<ModalAddUsuarioWidget> {
  ///  Local state fields for this component.

  List<ListRolesStruct> listRoles = [];
  void addToListRoles(ListRolesStruct item) => listRoles.add(item);
  void removeFromListRoles(ListRolesStruct item) => listRoles.remove(item);
  void removeAtIndexFromListRoles(int index) => listRoles.removeAt(index);
  void insertAtIndexInListRoles(int index, ListRolesStruct item) =>
      listRoles.insert(index, item);
  void updateListRolesAtIndex(int index, Function(ListRolesStruct) updateFn) =>
      listRoles[index] = updateFn(listRoles[index]);

  List<ListTypeAcessStruct> listTypeAcess = [];
  void addToListTypeAcess(ListTypeAcessStruct item) => listTypeAcess.add(item);
  void removeFromListTypeAcess(ListTypeAcessStruct item) =>
      listTypeAcess.remove(item);
  void removeAtIndexFromListTypeAcess(int index) =>
      listTypeAcess.removeAt(index);
  void insertAtIndexInListTypeAcess(int index, ListTypeAcessStruct item) =>
      listTypeAcess.insert(index, item);
  void updateListTypeAcessAtIndex(
          int index, Function(ListTypeAcessStruct) updateFn) =>
      listTypeAcess[index] = updateFn(listTypeAcess[index]);

  List<ListControlSystemStruct> listControlSystem = [];
  void addToListControlSystem(ListControlSystemStruct item) =>
      listControlSystem.add(item);
  void removeFromListControlSystem(ListControlSystemStruct item) =>
      listControlSystem.remove(item);
  void removeAtIndexFromListControlSystem(int index) =>
      listControlSystem.removeAt(index);
  void insertAtIndexInListControlSystem(
          int index, ListControlSystemStruct item) =>
      listControlSystem.insert(index, item);
  void updateListControlSystemAtIndex(
          int index, Function(ListControlSystemStruct) updateFn) =>
      listControlSystem[index] = updateFn(listControlSystem[index]);

  bool erroCargo = false;

  bool erroTipoAcesso = false;

  bool erroNivelAcesso = false;

  ///  State fields for stateful widgets in this component.

  final formKey = GlobalKey<FormState>();
  // Stores action output result for [Backend Call - API (Query all users_roles records)] action in modal_addUsuario widget.
  ApiCallResponse? aPiQueryRoles;
  // Stores action output result for [Backend Call - API (Query all users_system_access records)] action in modal_addUsuario widget.
  ApiCallResponse? aPiQueryTypeAcess;
  // Stores action output result for [Backend Call - API (Query all users_control_system records)] action in modal_addUsuario widget.
  ApiCallResponse? aPiQueryControlSystem;
  bool isDataUploading_uploadDataP = false;
  FFUploadedFile uploadedLocalFile_uploadDataP =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');

  // State field(s) for name widget.
  FocusNode? nameFocusNode;
  TextEditingController? nameTextController;
  String? Function(BuildContext, String?)? nameTextControllerValidator;
  String? _nameTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '4eoxsd0r' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for Telefone widget.
  FocusNode? telefoneFocusNode;
  TextEditingController? telefoneTextController;
  late MaskTextInputFormatter telefoneMask;
  String? Function(BuildContext, String?)? telefoneTextControllerValidator;
  String? _telefoneTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'o0520iu8' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for emailAddress widget.
  FocusNode? emailAddressFocusNode;
  TextEditingController? emailAddressTextController;
  String? Function(BuildContext, String?)? emailAddressTextControllerValidator;
  String? _emailAddressTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'hzmc8dpc' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for DropRoles widget.
  int? dropRolesValue;
  FormFieldController<int>? dropRolesValueController;
  // State field(s) for DropSystem widget.
  int? dropSystemValue;
  FormFieldController<int>? dropSystemValueController;
  // State field(s) for DropControl widget.
  int? dropControlValue;
  FormFieldController<int>? dropControlValueController;
  // Stores action output result for [Backend Call - API (Add users )] action in Button widget.
  ApiCallResponse? aPiAddUser1;
  // Stores action output result for [Backend Call - API (Add users )] action in Button widget.
  ApiCallResponse? lideres;
  // Stores action output result for [Backend Call - API (Add users )] action in Button widget.
  ApiCallResponse? funcionarioEquipe;
  // Stores action output result for [Backend Call - API (Patch users)] action in Button widget.
  ApiCallResponse? aPiAttUser;

  @override
  void initState(BuildContext context) {
    nameTextControllerValidator = _nameTextControllerValidator;
    telefoneTextControllerValidator = _telefoneTextControllerValidator;
    emailAddressTextControllerValidator = _emailAddressTextControllerValidator;
  }

  @override
  void dispose() {
    nameFocusNode?.dispose();
    nameTextController?.dispose();

    telefoneFocusNode?.dispose();
    telefoneTextController?.dispose();

    emailAddressFocusNode?.dispose();
    emailAddressTextController?.dispose();
  }
}
