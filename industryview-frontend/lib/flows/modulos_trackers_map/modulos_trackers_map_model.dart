import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/esqueleto1_widget.dart';
import '/components/esqueleto2_widget.dart';
import '/components/modal_confirm_delete/modal_confirm_delete_widget.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/components/status_stakes_widget.dart';
import '/flows/heavy_array_pier/heavy_array_pier_widget.dart';
import '/flows/projeto/mapa_de_trackers/filtro_status_fundacao/filtro_status_fundacao_widget.dart';
import '/flows/projeto/mapa_de_trackers/filtro_status_trackers/filtro_status_trackers_widget.dart';
import '/flows/projeto/mapa_de_trackers/filtro_tipode_tracker/filtro_tipode_tracker_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_add_fileira/modal_add_fileira_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_add_nova_row/modal_add_nova_row_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_add_nova_secao/modal_add_nova_secao_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_editar_lote_selecionado/modal_editar_lote_selecionado_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_grafico_de_porcentagem/modal_grafico_de_porcentagem_widget.dart';
import '/flows/projeto/mapa_de_trackers/modal_novo_campo/modal_novo_campo_widget.dart';
import '/flows/projeto/mapa_de_trackers/options_secao/options_secao_widget.dart';
import '/flows/trackers/heavy_array_pier_edge/heavy_array_pier_edge_widget.dart';
import '/flows/trackers/heavy_motor_pier/heavy_motor_pier_widget.dart';
import '/flows/trackers/standart_array_pier/standart_array_pier_widget.dart';
import '/flows/trackers/standart_array_pier_edge/standart_array_pier_edge_widget.dart';
import '/flows/trackers/standart_motor_pier/standart_motor_pier_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/index.dart';
import 'modulos_trackers_map_widget.dart' show ModulosTrackersMapWidget;
import 'package:aligned_dialog/aligned_dialog.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

class ModulosTrackersMapModel
    extends FlutterFlowModel<ModulosTrackersMapWidget> {
  ///  Local state fields for this page.

  int fieldId = 0;

  List<dynamic> jsonFieldRef = [];
  void addToJsonFieldRef(dynamic item) => jsonFieldRef.add(item);
  void removeFromJsonFieldRef(dynamic item) => jsonFieldRef.remove(item);
  void removeAtIndexFromJsonFieldRef(int index) => jsonFieldRef.removeAt(index);
  void insertAtIndexInJsonFieldRef(int index, dynamic item) =>
      jsonFieldRef.insert(index, item);
  void updateJsonFieldRefAtIndex(int index, Function(dynamic) updateFn) =>
      jsonFieldRef[index] = updateFn(jsonFieldRef[index]);

  List<dynamic> jsonSectionsRef = [];
  void addToJsonSectionsRef(dynamic item) => jsonSectionsRef.add(item);
  void removeFromJsonSectionsRef(dynamic item) => jsonSectionsRef.remove(item);
  void removeAtIndexFromJsonSectionsRef(int index) =>
      jsonSectionsRef.removeAt(index);
  void insertAtIndexInJsonSectionsRef(int index, dynamic item) =>
      jsonSectionsRef.insert(index, item);
  void updateJsonSectionsRefAtIndex(int index, Function(dynamic) updateFn) =>
      jsonSectionsRef[index] = updateFn(jsonSectionsRef[index]);

  int sectionsId = 0;

  int? sectionNumber;

  List<int> setsIds = [];
  void addToSetsIds(int item) => setsIds.add(item);
  void removeFromSetsIds(int item) => setsIds.remove(item);
  void removeAtIndexFromSetsIds(int index) => setsIds.removeAt(index);
  void insertAtIndexInSetsIds(int index, int item) =>
      setsIds.insert(index, item);
  void updateSetsIdsAtIndex(int index, Function(int) updateFn) =>
      setsIds[index] = updateFn(setsIds[index]);

  int contador = 0;

  bool checkBox = false;

  List<dynamic> rowslist = [];
  void addToRowslist(dynamic item) => rowslist.add(item);
  void removeFromRowslist(dynamic item) => rowslist.remove(item);
  void removeAtIndexFromRowslist(int index) => rowslist.removeAt(index);
  void insertAtIndexInRowslist(int index, dynamic item) =>
      rowslist.insert(index, item);
  void updateRowslistAtIndex(int index, Function(dynamic) updateFn) =>
      rowslist[index] = updateFn(rowslist[index]);

  ///  State fields for stateful widgets in this page.

  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token )] action in ModulosTrackersMap widget.
  ApiCallResponse? aPiTokenAuth;
  // API variables removed

  // Stores action output result for [Custom Action - actRetornaValidacaoStatusStake] action in ModulosTrackersMap widget.
  bool? returnAction;
  // Stores action output result for [Custom Action - actAddInfosTracker] action in ModulosTrackersMap widget.
  List<DropSelect1Struct>? action1;
  // Model for navBar component.
  late NavBarModel navBarModel;
  // State field(s) for dropCampo widget.
  int? dropCampoValue;
  FormFieldController<int>? dropCampoValueController;
  // Stores action output result for [Backend Call - API (Query all sections records)] action in dropCampo widget.
  ApiCallResponse? listSections;
  // Stores action output result for [Backend Call - API (Query all rows records)] action in dropCampo widget.
  ApiCallResponse? listRowsField;
  // Stores action output result for [Custom Action - actRetornaValidacaoStatusStake] action in dropCampo widget.
  bool? returnAction2;
  // Stores action output result for [Backend Call - API (Query all rows records)] action in Button widget.
  ApiCallResponse? listRowsDeleteFilter;
  // Stores action output result for [Custom Action - actRetornaValidacaoStatusStake] action in Button widget.
  bool? returnActionDelete;
  // Stores action output result for [Backend Call - API (Query all rows records)] action in Container widget.
  ApiCallResponse? listRows;
  // Stores action output result for [Custom Action - actRetornaValidacaoStatusStake] action in Container widget.
  bool? returnAction3;
  // Stores action output result for [Custom Action - actGetIdsRowsTracker] action in Icon widget.
  List<int>? listIdsRowsTracker;
  // Stores action output result for [Custom Action - actGetIdsRows] action in Icon widget.
  List<int>? listIdsRow;
  // Models removed

  // Stores action output result for [Backend Call - API (delete row)] action in IconButton widget.
  ApiCallResponse? deleteRowsTrackersSectionCheckBox;
  // Stores action output result for [Custom Action - actGetIdsRows] action in IconButton widget.
  List<int>? listIdsRowCheckBox;
  // Stores action output result for [Custom Action - actGetIdsRowsTracker] action in IconButton widget.
  List<int>? listIdsRowsTrackerCheckBox;
  // Stores action output result for [Backend Call - API (Import map trackers)] action in Button widget.
  ApiCallResponse? retornoApi;
  // Stores action output result for [Custom Action - actAddInfosTracker] action in Container widget.
  List<DropSelect1Struct>? returnaticon;
  // Stores action output result for [Custom Action - checkStakesStatusRow] action in Container widget.
  bool? deleteChecktracker;
  // Models removed


  // Stores action output result for [Backend Call - API (Query all fields records)] action in ModulosTrackersMap widget.
  ApiCallResponse? listFieldsLoad;
  // Stores action output result for [Backend Call - API (Query all sections records)] action in ModulosTrackersMap widget.
  ApiCallResponse? listSectionsLoad;
  // Stores action output result for [Backend Call - API (Query all rows records)] action in ModulosTrackersMap widget.
  ApiCallResponse? listRowsLoad;
  // Model for esqueleto1 component.
  late Esqueleto1Model esqueleto1Model;
  // Model for esqueleto2 component.
  late Esqueleto2Model esqueleto2Model;

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
    esqueleto1Model = createModel(context, () => Esqueleto1Model());
    esqueleto2Model = createModel(context, () => Esqueleto2Model());
  }

  @override
  void dispose() {
    navBarModel.dispose();
    esqueleto1Model.dispose();
    esqueleto2Model.dispose();
  }
}
