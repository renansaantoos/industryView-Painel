import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/components/nav_bar/nav_bar_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import '/flutter_flow/upload_data.dart';
import 'dart:ui';
import '/custom_code/actions/index.dart' as actions;
import '/flutter_flow/custom_functions.dart' as functions;
import '/flutter_flow/request_manager.dart';

import '/index.dart';
import 'editar_projeto_widget.dart' show EditarProjetoWidget;
import 'package:aligned_tooltip/aligned_tooltip.dart';
import 'package:easy_debounce/easy_debounce.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';
import 'package:provider/provider.dart';

class EditarProjetoModel extends FlutterFlowModel<EditarProjetoWidget> {
  ///  Local state fields for this page.

  int campos = 1;

  bool mostraPdf = false;

  bool cpf = true;

  bool erroUpload = false;

  String? filename;

  FFUploadedFile? upload;

  bool uploadset = false;

  ///  State fields for stateful widgets in this page.

  final formKey = GlobalKey<FormState>();
  // Stores action output result for [Backend Call - API (Get the record belonging to the authentication token )] action in EditarProjeto widget.
  ApiCallResponse? aPiTokenAuth;
  // Model for navBar component.
  late NavBarModel navBarModel;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered1 = false;
  bool isDataUploading_uploadDataFdy1Edit = false;
  FFUploadedFile uploadedLocalFile_uploadDataFdy1Edit =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');

  // Stores action output result for [Custom Action - extractFileNameFromPath] action in Container widget.
  String? returnFileName;
  // State field(s) for MouseRegion widget.
  bool mouseRegionHovered2 = false;
  bool isDataUploading_uploadDataFdy12 = false;
  FFUploadedFile uploadedLocalFile_uploadDataFdy12 =
      FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');

  // State field(s) for projeto widget.
  FocusNode? projetoFocusNode;
  TextEditingController? projetoTextController;
  String? Function(BuildContext, String?)? projetoTextControllerValidator;
  String? _projetoTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '1nrnvj02' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for obra widget.
  FocusNode? obraFocusNode;
  TextEditingController? obraTextController;
  String? Function(BuildContext, String?)? obraTextControllerValidator;
  String? _obraTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'dizaewgo' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for origemCad widget.
  FocusNode? origemCadFocusNode;
  TextEditingController? origemCadTextController;
  String? Function(BuildContext, String?)? origemCadTextControllerValidator;
  String? _origemCadTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'qpnz2req' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for ART widget.
  FocusNode? artFocusNode;
  TextEditingController? artTextController;
  String? Function(BuildContext, String?)? artTextControllerValidator;
  String? _artTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        't8wji87v' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for RRT widget.
  FocusNode? rrtFocusNode;
  TextEditingController? rrtTextController;
  String? Function(BuildContext, String?)? rrtTextControllerValidator;
  String? _rrtTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'y2qcqpua' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for CIB widget.
  FocusNode? cibFocusNode;
  TextEditingController? cibTextController;
  String? Function(BuildContext, String?)? cibTextControllerValidator;
  String? _cibTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'nb3dovgq' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for cadImobiliario widget.
  FocusNode? cadImobiliarioFocusNode;
  TextEditingController? cadImobiliarioTextController;
  String? Function(BuildContext, String?)?
      cadImobiliarioTextControllerValidator;
  String? _cadImobiliarioTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'pu1uwldb' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for dtIniObra widget.
  FocusNode? dtIniObraFocusNode;
  TextEditingController? dtIniObraTextController;
  late MaskTextInputFormatter dtIniObraMask;
  String? Function(BuildContext, String?)? dtIniObraTextControllerValidator;
  String? _dtIniObraTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '1uco46u0' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for CNAE widget.
  FocusNode? cnaeFocusNode;
  TextEditingController? cnaeTextController;
  String? Function(BuildContext, String?)? cnaeTextControllerValidator;
  String? _cnaeTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'nf9ai88d' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for numAlvara widget.
  FocusNode? numAlvaraFocusNode;
  TextEditingController? numAlvaraTextController;
  String? Function(BuildContext, String?)? numAlvaraTextControllerValidator;
  String? _numAlvaraTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'foac9aa3' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for dropSituacao widget.
  int? dropSituacaoValue;
  FormFieldController<int>? dropSituacaoValueController;
  // State field(s) for dtSituacao widget.
  FocusNode? dtSituacaoFocusNode;
  TextEditingController? dtSituacaoTextController;
  late MaskTextInputFormatter dtSituacaoMask;
  String? Function(BuildContext, String?)? dtSituacaoTextControllerValidator;
  String? _dtSituacaoTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '3xzle3jp' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for responsavel widget.
  FocusNode? responsavelFocusNode;
  TextEditingController? responsavelTextController;
  String? Function(BuildContext, String?)? responsavelTextControllerValidator;
  String? _responsavelTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'hznrz88h' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for cpf widget.
  FocusNode? cpfFocusNode;
  TextEditingController? cpfTextController;
  String? Function(BuildContext, String?)? cpfTextControllerValidator;
  String? _cpfTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '7febgyxf' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for cep widget.
  FocusNode? cepFocusNode;
  TextEditingController? cepTextController;
  late MaskTextInputFormatter cepMask;
  String? Function(BuildContext, String?)? cepTextControllerValidator;
  String? _cepTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'g7bffwq0' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // Stores action output result for [Backend Call - API (Get Cep)] action in cep widget.
  ApiCallResponse? aPiGetCep;
  // State field(s) for logradouro widget.
  FocusNode? logradouroFocusNode;
  TextEditingController? logradouroTextController;
  String? Function(BuildContext, String?)? logradouroTextControllerValidator;
  String? _logradouroTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'skooa9d9' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for numero widget.
  FocusNode? numeroFocusNode;
  TextEditingController? numeroTextController;
  String? Function(BuildContext, String?)? numeroTextControllerValidator;
  String? _numeroTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '8ewjd8vv' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for neighbourhood widget.
  FocusNode? neighbourhoodFocusNode;
  TextEditingController? neighbourhoodTextController;
  String? Function(BuildContext, String?)? neighbourhoodTextControllerValidator;
  String? _neighbourhoodTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'dlxio2hm' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for municipio widget.
  FocusNode? municipioFocusNode;
  TextEditingController? municipioTextController;
  String? Function(BuildContext, String?)? municipioTextControllerValidator;
  String? _municipioTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'b9f2bh9z' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for uf widget.
  FocusNode? ufFocusNode;
  TextEditingController? ufTextController;
  late MaskTextInputFormatter ufMask;
  String? Function(BuildContext, String?)? ufTextControllerValidator;
  String? _ufTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        's83o7ln9' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for pais widget.
  FocusNode? paisFocusNode;
  TextEditingController? paisTextController;
  String? Function(BuildContext, String?)? paisTextControllerValidator;
  String? _paisTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        's8g9jq13' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for complemento widget.
  FocusNode? complementoFocusNode;
  TextEditingController? complementoTextController;
  String? Function(BuildContext, String?)? complementoTextControllerValidator;
  // State field(s) for categoria widget.
  FocusNode? categoriaFocusNode;
  TextEditingController? categoriaTextController;
  String? Function(BuildContext, String?)? categoriaTextControllerValidator;
  String? _categoriaTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        '3rhxcmyx' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for destinacao widget.
  FocusNode? destinacaoFocusNode;
  TextEditingController? destinacaoTextController;
  String? Function(BuildContext, String?)? destinacaoTextControllerValidator;
  String? _destinacaoTextControllerValidator(
      BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'cjagj09v' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for tpObra widget.
  FocusNode? tpObraFocusNode;
  TextEditingController? tpObraTextController;
  String? Function(BuildContext, String?)? tpObraTextControllerValidator;
  String? _tpObraTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'a842v4hc' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // State field(s) for areaObra widget.
  FocusNode? areaObraFocusNode;
  TextEditingController? areaObraTextController;
  String? Function(BuildContext, String?)? areaObraTextControllerValidator;
  String? _areaObraTextControllerValidator(BuildContext context, String? val) {
    if (val == null || val.isEmpty) {
      return FFLocalizations.of(context).getText(
        'fvav501x' /* *Campo obrigatório */,
      );
    }

    return null;
  }

  // Stores action output result for [Validate Form] action in Button widget.
  bool? form;
  // Stores action output result for [Backend Call - API (Edit projects record)] action in Button widget.
  ApiCallResponse? aPiEditProject;

  /// Query cache managers for this widget.

  final _statusManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> status({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _statusManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearStatusCache() => _statusManager.clear();
  void clearStatusCacheKey(String? uniqueKey) =>
      _statusManager.clearRequest(uniqueKey);

  @override
  void initState(BuildContext context) {
    navBarModel = createModel(context, () => NavBarModel());
    projetoTextControllerValidator = _projetoTextControllerValidator;
    obraTextControllerValidator = _obraTextControllerValidator;
    origemCadTextControllerValidator = _origemCadTextControllerValidator;
    artTextControllerValidator = _artTextControllerValidator;
    rrtTextControllerValidator = _rrtTextControllerValidator;
    cibTextControllerValidator = _cibTextControllerValidator;
    cadImobiliarioTextControllerValidator =
        _cadImobiliarioTextControllerValidator;
    dtIniObraTextControllerValidator = _dtIniObraTextControllerValidator;
    cnaeTextControllerValidator = _cnaeTextControllerValidator;
    numAlvaraTextControllerValidator = _numAlvaraTextControllerValidator;
    dtSituacaoTextControllerValidator = _dtSituacaoTextControllerValidator;
    responsavelTextControllerValidator = _responsavelTextControllerValidator;
    cpfTextControllerValidator = _cpfTextControllerValidator;
    cepTextControllerValidator = _cepTextControllerValidator;
    logradouroTextControllerValidator = _logradouroTextControllerValidator;
    numeroTextControllerValidator = _numeroTextControllerValidator;
    neighbourhoodTextControllerValidator =
        _neighbourhoodTextControllerValidator;
    municipioTextControllerValidator = _municipioTextControllerValidator;
    ufTextControllerValidator = _ufTextControllerValidator;
    paisTextControllerValidator = _paisTextControllerValidator;
    categoriaTextControllerValidator = _categoriaTextControllerValidator;
    destinacaoTextControllerValidator = _destinacaoTextControllerValidator;
    tpObraTextControllerValidator = _tpObraTextControllerValidator;
    areaObraTextControllerValidator = _areaObraTextControllerValidator;
  }

  @override
  void dispose() {
    navBarModel.dispose();
    projetoFocusNode?.dispose();
    projetoTextController?.dispose();

    obraFocusNode?.dispose();
    obraTextController?.dispose();

    origemCadFocusNode?.dispose();
    origemCadTextController?.dispose();

    artFocusNode?.dispose();
    artTextController?.dispose();

    rrtFocusNode?.dispose();
    rrtTextController?.dispose();

    cibFocusNode?.dispose();
    cibTextController?.dispose();

    cadImobiliarioFocusNode?.dispose();
    cadImobiliarioTextController?.dispose();

    dtIniObraFocusNode?.dispose();
    dtIniObraTextController?.dispose();

    cnaeFocusNode?.dispose();
    cnaeTextController?.dispose();

    numAlvaraFocusNode?.dispose();
    numAlvaraTextController?.dispose();

    dtSituacaoFocusNode?.dispose();
    dtSituacaoTextController?.dispose();

    responsavelFocusNode?.dispose();
    responsavelTextController?.dispose();

    cpfFocusNode?.dispose();
    cpfTextController?.dispose();

    cepFocusNode?.dispose();
    cepTextController?.dispose();

    logradouroFocusNode?.dispose();
    logradouroTextController?.dispose();

    numeroFocusNode?.dispose();
    numeroTextController?.dispose();

    neighbourhoodFocusNode?.dispose();
    neighbourhoodTextController?.dispose();

    municipioFocusNode?.dispose();
    municipioTextController?.dispose();

    ufFocusNode?.dispose();
    ufTextController?.dispose();

    paisFocusNode?.dispose();
    paisTextController?.dispose();

    complementoFocusNode?.dispose();
    complementoTextController?.dispose();

    categoriaFocusNode?.dispose();
    categoriaTextController?.dispose();

    destinacaoFocusNode?.dispose();
    destinacaoTextController?.dispose();

    tpObraFocusNode?.dispose();
    tpObraTextController?.dispose();

    areaObraFocusNode?.dispose();
    areaObraTextController?.dispose();

    /// Dispose query cache managers for this widget.

    clearStatusCache();
  }
}
