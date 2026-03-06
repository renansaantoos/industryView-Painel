import '/backend/api_requests/api_calls.dart';
import '/components/nav_bar_widget.dart';
import '/core/utils/app_utils.dart';
import '/core/utils/request_manager.dart';
import '/core/widgets/form_field_controller.dart';

import 'rdo_widget.dart' show RdoWidget;
import 'package:flutter/material.dart';

class RdoModel extends PageModel<RdoWidget> {
  // Controllers de texto
  final safetyTopicController = TextEditingController();
  final observationsController = TextEditingController();
  final tempMinController = TextEditingController();
  final tempMaxController = TextEditingController();

  // Seleções de dropdown
  String? selectedShift;
  String? weatherMorning;
  String? weatherAfternoon;
  String? weatherNight;

  // Fotos
  List<UploadedFile> selectedPhotos = [];

  // Estado
  bool isLoading = false;
  bool isFinalizedToday = false;
  bool isFinalizing = false;

  // Dados carregados
  ApiCallResponse? validTokenCopy;

  // Language dropdown
  String? dropDownValue2;
  FormFieldController<String>? dropDownValueController2;

  // Model para NavBar
  late NavBarModel navBarModel;

  // Cache managers
  final _tasksSprintsManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> tasksSprints({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _tasksSprintsManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearTasksSprintsCache() => _tasksSprintsManager.clear();
  void clearTasksSprintsCacheKey(String? uniqueKey) =>
      _tasksSprintsManager.clearRequest(uniqueKey);

  final _rdoDiaManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> rdoDia({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _rdoDiaManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearRdoDiaCache() => _rdoDiaManager.clear();
  void clearRdoDiaCacheKey(String? uniqueKey) =>
      _rdoDiaManager.clearRequest(uniqueKey);

  // Opções de dropdown
  static const List<String> shiftOptions = [
    'Integral',
    'Manhã',
    'Tarde',
    'Noite',
  ];

  static const List<String> weatherOptions = [
    'Ensolarado',
    'Parcialmente nublado',
    'Nublado',
    'Chuvoso',
    'Tempestade',
    'Garoa',
    'Ventania',
    'Frio intenso',
    'Calor intenso',
  ];

  // Helpers para fotos
  void addPhoto(UploadedFile photo) {
    selectedPhotos.add(photo);
  }

  void removePhotoAt(int index) {
    if (index >= 0 && index < selectedPhotos.length) {
      selectedPhotos.removeAt(index);
    }
  }

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
  }

  @override
  void dispose() {
    safetyTopicController.dispose();
    observationsController.dispose();
    tempMinController.dispose();
    tempMaxController.dispose();
    navBarModel.dispose();
    clearTasksSprintsCache();
    clearRdoDiaCache();
  }
}
