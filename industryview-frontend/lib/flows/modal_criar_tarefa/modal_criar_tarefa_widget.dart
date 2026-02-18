import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info/modal_info_widget.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/components/modal_confirm/modal_confirm_widget.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import '/index.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'modal_criar_tarefa_model.dart';
export 'modal_criar_tarefa_model.dart';

import 'modal_add_unity_widget.dart';
import 'modal_add_discipline_widget.dart';

class ModalCriarTarefaWidget extends StatefulWidget {
  const ModalCriarTarefaWidget({
    super.key,
    required this.typePage,
    this.desciption,
    this.equipamentTxt,
    this.equipamentId,
    this.wight,
    this.id,
    this.unity,
    this.discipline,
  });

  final String? typePage;
  final String? desciption;
  final String? equipamentTxt;
  final int? equipamentId;
  final double? wight;
  final int? id;
  final int? unity;
  final int? discipline;

  @override
  State<ModalCriarTarefaWidget> createState() => _ModalCriarTarefaWidgetState();
}

class _ModalCriarTarefaWidgetState extends State<ModalCriarTarefaWidget> {
  late ModalCriarTarefaModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalCriarTarefaModel());

    // On component load action.
    /*
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _model.equipaments = EquipamentsTypeStruct(
        id: valueOrDefault<int>(
          widget!.equipamentId != null ? widget!.equipamentId : 1,
          1,
        ),
      );
      safeSetState(() {});
    });
    */

    _model.descriptionTextController ??=
        TextEditingController(text: widget!.desciption);
    _model.descriptionFocusNode ??= FocusNode();

    _model.weightTextController ??=
        TextEditingController(text: widget!.wight?.toString());
    _model.weightFocusNode ??= FocusNode();

    // Inicializando Dropdowns para Edição
    if (widget!.unity != null) {
      _model.unityValue = widget!.unity;
    }
    if (widget!.discipline != null) {
      _model.dropDisciplineValue = widget!.discipline;
    }

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<FFAppState>();

    return Padding(
      padding: EdgeInsets.all(24.0),
      child: FutureBuilder<ApiCallResponse>(
        future: _model.criarTarefa(
          requestFn: () => ProjectsGroup.equipamentsTypeCall.call(
            bearerAuth: FFAppState().token,
          ),
        ),
        builder: (context, snapshot) {
          // Customize what your widget looks like when it's loading.
          if (!snapshot.hasData) {
            return Center(
              child: SizedBox(
                width: 50.0,
                height: 50.0,
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(
                    FlutterFlowTheme.of(context).primary,
                  ),
                ),
              ),
            );
          }
          final containerEquipamentsTypeResponse = snapshot.data!;

          return Container(
            width: 500.0,
            decoration: BoxDecoration(
              color: FlutterFlowTheme.of(context).secondaryBackground,
              boxShadow: [
                BoxShadow(
                  blurRadius: 4.0,
                  color: Color(0x33000000),
                  offset: Offset(
                    0.0,
                    2.0,
                  ),
                )
              ],
              borderRadius: BorderRadius.circular(12.0),
            ),
            child: Padding(
              padding: EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.task_rounded,
                                color: FlutterFlowTheme.of(context).primary,
                                size: 24.0,
                              ),
                              Align(
                                alignment: AlignmentDirectional(-1.0, -1.0),
                                child: SelectionArea(
                                    child: Text(
                                  widget!.typePage == 'creat'
                                      ? 'Criar tarefa'
                                      : 'Editar tarefa',
                                  style: FlutterFlowTheme.of(context)
                                      .headlineMedium
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight: FontWeight.w500,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .headlineMedium
                                                  .fontStyle,
                                        ),
                                        letterSpacing: 0.0,
                                        fontWeight: FontWeight.w500,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .headlineMedium
                                            .fontStyle,
                                      ),
                                )),
                              ),
                            ].divide(SizedBox(width: 8.0)),
                          ),
                          SelectionArea(
                              child: Text(
                            FFLocalizations.of(context).getText(
                              'ohgnzfxi' /* Crie e edite uma nova tarefa, ... */,
                            ),
                            style: FlutterFlowTheme.of(context)
                                .labelMedium
                                .override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight: FlutterFlowTheme.of(context)
                                      .labelMedium
                                      .fontWeight,
                                  fontStyle: FlutterFlowTheme.of(context)
                                      .labelMedium
                                      .fontStyle,
                                ),
                          )),
                        ],
                      ),
                      Divider(
                        height: 18.0,
                        thickness: 1.0,
                        color: FlutterFlowTheme.of(context).alternate,
                      ),
                    ].divide(SizedBox(height: 12.0)),
                  ),
                  SingleChildScrollView(
                    primary: false,
                    child: Column(
                      mainAxisSize: MainAxisSize.max,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Form(
                          key: _model.formKey,
                          autovalidateMode: AutovalidateMode.disabled,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              
                              Column(
                                mainAxisSize: MainAxisSize.max,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  SelectionArea(
                                      child: Text(
                                    FFLocalizations.of(context).getText(
                                      'yioccsr8' /* Descrição da tarefa */,
                                    ),
                                    style: FlutterFlowTheme.of(context)
                                        .titleMedium
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .titleMedium
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .titleMedium
                                                    .fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(context)
                                              .primaryText,
                                          fontSize: 12.0,
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .titleMedium
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .titleMedium
                                                  .fontStyle,
                                        ),
                                  )),
                                  Container(
                                    width:
                                        MediaQuery.sizeOf(context).width * 1.0,
                                    child: TextFormField(
                                      controller:
                                          _model.descriptionTextController,
                                      focusNode: _model.descriptionFocusNode,
                                      autofocus: true,
                                      obscureText: false,
                                      decoration: InputDecoration(
                                        alignLabelWithHint: false,
                                        hintText:
                                            FFLocalizations.of(context).getText(
                                          '2e7rds5m' /* Descreva brevemente essa taref... */,
                                        ),
                                        errorStyle: FlutterFlowTheme.of(context)
                                            .labelSmall
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmall
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmall
                                                        .fontStyle,
                                              ),
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .error,
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontStyle,
                                            ),
                                        enabledBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: FlutterFlowTheme.of(context)
                                                .alternate,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                        ),
                                        focusedBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: FlutterFlowTheme.of(context)
                                                .primary,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                        ),
                                        errorBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: FlutterFlowTheme.of(context)
                                                .error,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                        ),
                                        focusedErrorBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: FlutterFlowTheme.of(context)
                                                .error,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                        ),
                                        filled: true,
                                        fillColor: FlutterFlowTheme.of(context)
                                            .primaryBackground,
                                      ),
                                      style: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontStyle,
                                            ),
                                            color: FlutterFlowTheme.of(context)
                                                .primaryText,
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .fontStyle,
                                          ),
                                      maxLines: 2,
                                      keyboardType: TextInputType.number,
                                      validator: _model
                                          .descriptionTextControllerValidator
                                          .asValidator(context),
                                    ),
                                  ),
                                ].divide(SizedBox(height: 4.0)),
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.max,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  SelectionArea(
                                      child: Text(
                                    FFLocalizations.of(context).getText(
                                      'o6ytgny0' /* Peso da tarefa */,
                                    ),
                                    style: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(context)
                                              .primaryText,
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .labelSmall
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .labelSmall
                                                  .fontStyle,
                                        ),
                                  )),
                                  Container(
                                    width:
                                        MediaQuery.sizeOf(context).width * 1.0,
                                    child: TextFormField(
                                      controller: _model.weightTextController,
                                      focusNode: _model.weightFocusNode,
                                      autofocus: false,
                                      obscureText: false,
                                      decoration: InputDecoration(
                                        alignLabelWithHint: false,
                                        hintText:
                                            FFLocalizations.of(context).getText(
                                          'dzztgqf2' /* O peso da tarefa deve ser um m... */,
                                        ),
                                        hintStyle: FlutterFlowTheme.of(context)
                                            .labelSmall
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmall
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmall
                                                        .fontStyle,
                                              ),
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .secondaryText,
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontStyle,
                                            ),
                                        errorStyle: FlutterFlowTheme.of(context)
                                            .labelSmall
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmall
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .labelSmall
                                                        .fontStyle,
                                              ),
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .error,
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontStyle,
                                            ),
                                        enabledBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: FlutterFlowTheme.of(context)
                                                .alternate,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                        ),
                                        focusedBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: FlutterFlowTheme.of(context)
                                                .primary,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                        ),
                                        errorBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: FlutterFlowTheme.of(context)
                                                .error,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                        ),
                                        focusedErrorBorder: OutlineInputBorder(
                                          borderSide: BorderSide(
                                            color: FlutterFlowTheme.of(context)
                                                .error,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                        ),
                                        filled: true,
                                        fillColor: FlutterFlowTheme.of(context)
                                            .primaryBackground,
                                      ),
                                      style: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .labelSmall
                                                      .fontStyle,
                                            ),
                                            color: FlutterFlowTheme.of(context)
                                                .primaryText,
                                            letterSpacing: 0.0,
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .fontStyle,
                                          ),
                                      keyboardType:
                                          const TextInputType.numberWithOptions(
                                              decimal: true),
                                      validator: _model
                                          .weightTextControllerValidator
                                          .asValidator(context),
                                      inputFormatters: [
                                        FilteringTextInputFormatter.allow(
                                            RegExp('^\\d*\\.?\\d*\$'))
                                      ],
                                    ),
                                  ),
                                ].divide(SizedBox(height: 4.0)),
                              ),
                            ].divide(SizedBox(height: 16.0)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SelectionArea(
                          child: Text(
                        FFLocalizations.of(context).getText(
                          '49x352yx' /* Unidade/Medida */,
                        ),
                        style: FlutterFlowTheme.of(context)
                            .titleMedium
                            .override(
                              font: GoogleFonts.lexend(
                                fontWeight: FlutterFlowTheme.of(context)
                                    .titleMedium
                                    .fontWeight,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .titleMedium
                                    .fontStyle,
                              ),
                              color: FlutterFlowTheme.of(context).primaryText,
                              fontSize: 12.0,
                              letterSpacing: 0.0,
                              fontWeight: FlutterFlowTheme.of(context)
                                  .titleMedium
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .titleMedium
                                  .fontStyle,
                            ),
                      )),
                      FutureBuilder<ApiCallResponse>(
                        future: _model.unity(
                          requestFn: () => TasksGroup.getUnityCall.call(
                            token: FFAppState().token,
                            companyId: FFAppState().infoUser.companyId,
                          ),
                        ),
                        builder: (context, snapshot) {
                          // Customize what your widget looks like when it's loading.
                          if (!snapshot.hasData) {
                            return Center(
                              child: SizedBox(
                                width: 50.0,
                                height: 50.0,
                                child: CircularProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    FlutterFlowTheme.of(context).primary,
                                  ),
                                ),
                              ),
                            );
                          }
                          final unityGetUnityResponse = snapshot.data!;

                          return Builder(
                            builder: (context) {
                              final unityIds = List<int>.from(
                                  TasksGroup.getUnityCall.id(
                                        unityGetUnityResponse.jsonBody,
                                      ) ??
                                      []);
                              final unityLabels = List<String>.from(
                                  TasksGroup.getUnityCall.unity(
                                        unityGetUnityResponse.jsonBody,
                                      ) ??
                                      []);

                              final Map<int, String> unityMap = Map.fromIterables(unityIds, unityLabels);
                              final selectedLabel = unityMap[_model.unityValue] ?? FFLocalizations.of(context).getText('9dtsxeg7' /* Selecione */);

                              return Builder(
                                builder: (triggerContext) {
                                  return InkWell(
                                    onTap: () async {
                                      // 1. Calcular posição e tamanho do Trigger
                                      final RenderBox renderBox = triggerContext.findRenderObject() as RenderBox;
                                      final offset = renderBox.localToGlobal(Offset.zero);
                                      final size = renderBox.size;
                                      final screenSize = MediaQuery.of(context).size;
                                      
                                      // 2. Definir dimensões e direção de abertura
                                      const double maxMenuHeight = 350.0;
                                      // Removido gap extra para ficar grudado
                                      final double bottomSpace = screenSize.height - (offset.dy + size.height); 
                                      final double topSpace = offset.dy; 
                                      
                                      // Lógica: Tenta abrir para baixo. Só inverte se for muito apertado (<200) e tiver mais espaço em cima.
                                      bool opensUpward = false;
                                      if (bottomSpace < 200.0 && topSpace > bottomSpace) {
                                        opensUpward = true;
                                      }
                                      
                                      // Calcula altura final permitida
                                      final double availableHeight = opensUpward ? topSpace : bottomSpace;
                                      final double menuHeight = availableHeight < maxMenuHeight ? availableHeight : maxMenuHeight;

                                      await showDialog(
                                        context: context,
                                        barrierColor: Colors.transparent, // Sem fundo preto
                                        builder: (dialogContext) {
                                          String searchText = '';
                                          return Stack(
                                            children: [
                                              // GestureDetector para fechar ao clicar fora
                                              Positioned.fill(
                                                child: GestureDetector(
                                                  onTap: () => Navigator.pop(dialogContext),
                                                  behavior: HitTestBehavior.translucent,
                                                  child: Container(color: Colors.transparent),
                                                ),
                                              ),
                                              // O Menu Flutuante Ancorado
                                              Positioned(
                                                left: offset.dx,
                                                top: opensUpward ? null : offset.dy + size.height, // Gap zerado
                                                bottom: opensUpward ? screenSize.height - offset.dy : null, // Gap zerado
                                                width: size.width,
                                                child: Material(
                                                  color: Colors.transparent,
                                                  elevation: 4,
                                                  borderRadius: BorderRadius.circular(8),
                                                  child: Container(
                                                    constraints: BoxConstraints(maxHeight: menuHeight), // Altura Dinâmica
                                                    decoration: BoxDecoration(
                                                      color: FlutterFlowTheme.of(context).secondaryBackground,
                                                      borderRadius: BorderRadius.circular(8),
                                                      border: Border.all(color: FlutterFlowTheme.of(context).alternate),
                                                    ),
                                                    child: StatefulBuilder(
                                                      builder: (context, setModalState) {
                                                        final filteredIds = unityIds.where((id) {
                                                          final label = unityMap[id] ?? '';
                                                          return label.toLowerCase().contains(searchText.toLowerCase());
                                                        }).toList();

                                                        return Column(
                                                          mainAxisSize: MainAxisSize.min,
                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                          children: [
                                                            // Busca
                                                            Padding(
                                                              padding: EdgeInsets.fromLTRB(12, 12, 12, 8),
                                                              child: TextFormField(
                                                                autofocus: true,
                                                                onChanged: (val) => setModalState(() => searchText = val),
                                                                decoration: InputDecoration(
                                                                  isDense: true,
                                                                  hintText: 'Procurar',
                                                                  hintStyle: FlutterFlowTheme.of(context).labelMedium,
                                                                  enabledBorder: OutlineInputBorder(
                                                                    borderSide: BorderSide(color: FlutterFlowTheme.of(context).alternate),
                                                                    borderRadius: BorderRadius.circular(8),
                                                                  ),
                                                                  focusedBorder: OutlineInputBorder(
                                                                    borderSide: BorderSide(color: FlutterFlowTheme.of(context).primary),
                                                                    borderRadius: BorderRadius.circular(8),
                                                                  ),
                                                                  filled: true,
                                                                  fillColor: FlutterFlowTheme.of(context).primaryBackground,
                                                                  prefixIcon: Icon(Icons.search_rounded, size: 18, color: FlutterFlowTheme.of(context).secondaryText),
                                                                  contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                                                                ),
                                                                style: FlutterFlowTheme.of(context).bodyMedium,
                                                              ),
                                                            ),
                                                            Divider(height: 1, thickness: 1, color: FlutterFlowTheme.of(context).alternate),
                                                            
                                                            // Lista
                                                            Flexible(
                                                              child: filteredIds.isEmpty
                                                                  ? Padding(
                                                                      padding: EdgeInsets.all(16),
                                                                      child: size.height > 0 ? Text('Nenhum resultado', style: FlutterFlowTheme.of(context).labelMedium) : SizedBox.shrink(),
                                                                    )
                                                                  : ListView.builder(
                                                                      padding: EdgeInsets.zero,
                                                                      shrinkWrap: true,
                                                                      itemCount: filteredIds.length,
                                                                    itemBuilder: (context, index) {
                                                                        final id = filteredIds[index];
                                                                        final label = unityMap[id] ?? '';
                                                                        final isSelected = _model.unityValue == id;
                                                                        
                                                                        return Container(
                                                                          color: isSelected ? FlutterFlowTheme.of(context).primary.withOpacity(0.08) : null,
                                                                          child: Row(
                                                                            children: [
                                                                              Expanded(
                                                                                child: InkWell(
                                                                                  onTap: () {
                                                                                    safeSetState(() => _model.unityValue = id);
                                                                                    Navigator.pop(dialogContext);
                                                                                  },
                                                                                  child: Padding(
                                                                                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                                                                    child: Row(
                                                                                      children: [
                                                                                        Expanded(
                                                                                          child: Text(
                                                                                            label,
                                                                                            style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                                                              font: GoogleFonts.lexend(
                                                                                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                                                                                color: isSelected ? FlutterFlowTheme.of(context).primary : FlutterFlowTheme.of(context).primaryText,
                                                                                              ),
                                                                                            ),
                                                                                          ),
                                                                                        ),
                                                                                        if (isSelected) 
                                                                                          Icon(Icons.check, size: 16, color: FlutterFlowTheme.of(context).primary),
                                                                                      ],
                                                                                    ),
                                                                                  ),
                                                                                ),
                                                                              ),
                                                                              Row(
                                                                                mainAxisSize: MainAxisSize.min,
                                                                                children: [
                                                                                  InkWell(
                                                                                    onTap: () async {
                                                                                       /* Lógica de Edição */
                                                                                       final _unityEdit = await showDialog(
                                                                                         context: context,
                                                                                         builder: (dialogContext) {
                                                                                           return ModalAddUnityWidget(
                                                                                             id: id,
                                                                                             name: label,
                                                                                             action: () async {
                                                                                                _model.clearUnityCache();
                                                                                                _model.apiResultUnidades = await TasksGroup.getUnityCall.call(token: FFAppState().token, companyId: FFAppState().infoUser.companyId);
                                                                                                _model.clearDisciplineCache();
                                                                                                _model.apiResultDisciplinas = await DisciplineGroup.disciplineCall.call(token: FFAppState().token, companyId: FFAppState().infoUser.companyId);
                                                                                             },
                                                                                           );
                                                                                         },
                                                                                       );
                                                                                       
                                                                                      // Selecionar se editado? O modal já executa a action e fecha.
                                                                                       safeSetState(() {}); 
                                                                                    },
                                                                                    borderRadius: BorderRadius.circular(4),
                                                                                    child: Padding(
                                                                                      padding: EdgeInsets.all(8),
                                                                                      child: Icon(Icons.edit_outlined, size: 18, color: FlutterFlowTheme.of(context).secondaryText),
                                                                                    ),
                                                                                  ),
                                                                                  InkWell(
                                                                                    onTap: () async {
                                                                                       await showDialog(
                                                                                         context: context,
                                                                                         builder: (dialogContext) {
                                                                                           return ModalConfirmWidget(
                                                                                             title: 'Excluir Unidade',
                                                                                             description: 'Deseja realmente excluir "$label"?',
                                action: () async {
  var _deleteUnity = await TasksGroup.deleteUnityCall.call(
    unityId: id,
    token: FFAppState().token,
  );
  if ((_deleteUnity.succeeded ?? true)) {
    _model.clearUnityCache();
    _model.apiResultUnidades = await TasksGroup.getUnityCall.call(
      token: FFAppState().token,
      companyId: FFAppState().infoUser.companyId,
    );
  } else {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Erro ao excluir unidade',
          style: TextStyle(
            color: FlutterFlowTheme.of(context).primaryText,
          ),
        ),
        duration: Duration(milliseconds: 4000),
        backgroundColor: FlutterFlowTheme.of(context).error,
      ),
    );
  }
},
                                                                                           );
                                                                                         },
                                                                                       );
                                                                                       safeSetState(() {});
                                                                                    },
                                                                                    borderRadius: BorderRadius.circular(4),
                                                                                    child: Padding(
                                                                                      padding: EdgeInsets.fromLTRB(8, 8, 16, 8),
                                                                                      child: Icon(Icons.delete_outline, size: 18, color: FlutterFlowTheme.of(context).secondaryText),
                                                                                    ),
                                                                                  ),
                                                                                ],
                                                                              ),
                                                                            ],
                                                                          ),
                                                                        );
                                                                      },
                                                                    ),
                                                            ),
                                                            
                                                            // Botão Criar (Rodapé) - Ajustado para esquerda
                                                            Padding(
                                                              padding: EdgeInsets.all(12),
                                                              child: Align(
                                                                alignment: Alignment.centerLeft,
                                                                child: FFButtonWidget(
                                                                  onPressed: () async {
                                                                    Navigator.pop(dialogContext);
                                                                    // Ação Criar
                                                                    final _unityCreate = await showDialog(
                                                                      context: context,
                                                                      builder: (dialogContext) {
                                                                        return ModalAddUnityWidget(
                                                                           action: () async {
                                                                              _model.clearUnityCache();
                                                                              _model.apiResultUnidades = await TasksGroup.getUnityCall.call(token: FFAppState().token, companyId: FFAppState().infoUser.companyId);
                                                                              _model.clearDisciplineCache();
                                                                              _model.apiResultDisciplinas = await DisciplineGroup.disciplineCall.call(token: FFAppState().token, companyId: FFAppState().infoUser.companyId);
                                                                           },
                                                                        );
                                                                      },
                                                                    );
                                                                    if (_unityCreate != null) {
                                                                         if (_unityCreate['id'] != null) {
                                                                             safeSetState(() => _model.unityValue = _unityCreate['id']);
                                                                         }
                                                                         safeSetState(() {});
                                                                    }
                                                                  },
                                                                  text: 'Criar Unidade',
                                                                  icon: null,
                                                                  options: FFButtonOptions(
                                                                    width: 170.0,
                                                                    height: 40.0,
                                                                    padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                                                                    iconPadding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                                                                    color: FlutterFlowTheme.of(context).primary,
                                                                    textStyle: FlutterFlowTheme.of(context).labelMedium.override(
                                                                      font: GoogleFonts.lexend(
                                                                        fontWeight: FlutterFlowTheme.of(context).labelMedium.fontWeight,
                                                                        fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                      ),
                                                                      color: FlutterFlowTheme.of(context).info,
                                                                      letterSpacing: 0.0,
                                                                    ),
                                                                    elevation: 0.0,
                                                                    borderRadius: BorderRadius.circular(12.0),
                                                                  ),
                                                                ),
                                                              ),
                                                            ),
                                                          ],
                                                        );
                                                      },
                                                    ),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          );
                                        },
                                      );
                                    },
                                    borderRadius: BorderRadius.circular(8.0),
                                    child: Container(
                                      width: double.infinity,
                                      height: 48.0,
                                      decoration: BoxDecoration(
                                        color: FlutterFlowTheme.of(context).primaryBackground,
                                        borderRadius: BorderRadius.circular(8.0),
                                        border: Border.all(
                                          color: FlutterFlowTheme.of(context).alternate,
                                          width: 1.0,
                                        ),
                                      ),
                                      padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.max,
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            selectedLabel,
                                            style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                  font: GoogleFonts.lexend(
                                                    color: _model.unityValue != null 
                                                        ? FlutterFlowTheme.of(context).primaryText 
                                                        : FlutterFlowTheme.of(context).secondaryText,
                                                  ),
                                                ),
                                          ),
                                          Icon(
                                            Icons.keyboard_arrow_down_rounded,
                                            color: FlutterFlowTheme.of(context).secondaryText,
                                            size: 24.0,
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                }
                              );
                            },
                          );
                        },
                      ),
                    ].divide(SizedBox(height: 4.0)),
                  ),
                  Column(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SelectionArea(
                          child: Text(
                        FFLocalizations.of(context).getText(
                          'dhypkai4' /* Disciplina */,
                        ),
                        style: FlutterFlowTheme.of(context)
                            .titleMedium
                            .override(
                              font: GoogleFonts.lexend(
                                fontWeight: FlutterFlowTheme.of(context)
                                    .titleMedium
                                    .fontWeight,
                                fontStyle: FlutterFlowTheme.of(context)
                                    .titleMedium
                                    .fontStyle,
                              ),
                              color: FlutterFlowTheme.of(context).primaryText,
                              fontSize: 12.0,
                              letterSpacing: 0.0,
                              fontWeight: FlutterFlowTheme.of(context)
                                  .titleMedium
                                  .fontWeight,
                              fontStyle: FlutterFlowTheme.of(context)
                                  .titleMedium
                                  .fontStyle,
                            ),
                      )),
                      FutureBuilder<ApiCallResponse>(
                        future: _model.discipline(
                          requestFn: () => DisciplineGroup.disciplineCall.call(
                            token: FFAppState().token,
                            companyId: FFAppState().infoUser.companyId,
                          ),
                        ),
                        builder: (context, snapshot) {
                          // Customize what your widget looks like when it's loading.
                          if (!snapshot.hasData) {
                            return Center(
                              child: SizedBox(
                                width: 50.0,
                                height: 50.0,
                                child: CircularProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    FlutterFlowTheme.of(context).primary,
                                  ),
                                ),
                              ),
                            );
                          }
                          final dropDisciplineDisciplineResponse = snapshot.data!;
                          final disciplineIds = List<int>.from(DisciplineGroup.disciplineCall.id(dropDisciplineDisciplineResponse.jsonBody) ?? []);
                          final disciplineLabels = List<String>.from(DisciplineGroup.disciplineCall.discipline(dropDisciplineDisciplineResponse.jsonBody) ?? []);
                          final disciplineMap = Map<int, String>.fromIterables(disciplineIds, disciplineLabels);
                          final selectedLabel = _model.dropDisciplineValue != null ? (disciplineMap[_model.dropDisciplineValue] ?? 'Selecione') : 'Selecione';

                          return Builder(
                            builder: (triggerContext) {
                              return InkWell(
                                onTap: () async {
                                  // 1. Calcular posição e tamanho
                                  final RenderBox renderBox = triggerContext.findRenderObject() as RenderBox;
                                  final offset = renderBox.localToGlobal(Offset.zero);
                                  final size = renderBox.size;
                                  final screenSize = MediaQuery.of(context).size;
                                  
                                  // 2. Definir dimensões
                                  const double maxMenuHeight = 350.0;
                                  final double bottomSpace = screenSize.height - (offset.dy + size.height);
                                  final double topSpace = offset.dy;
                                  
                                  bool opensUpward = false;
                                  if (bottomSpace < 100.0 && topSpace > bottomSpace) {
                                    opensUpward = true;
                                  }
                                  
                                  final double availableHeight = opensUpward ? topSpace : bottomSpace;
                                  final double menuHeight = availableHeight < maxMenuHeight ? availableHeight : maxMenuHeight;

                                  await showDialog(
                                    context: context,
                                    barrierColor: Colors.transparent,
                                    builder: (dialogContext) {
                                      String searchText = '';
                                      return Stack(
                                        children: [
                                          Positioned.fill(
                                            child: GestureDetector(
                                              onTap: () => Navigator.pop(dialogContext),
                                              behavior: HitTestBehavior.translucent,
                                              child: Container(color: Colors.transparent),
                                            ),
                                          ),
                                          Positioned(
                                            left: offset.dx,
                                            top: opensUpward ? null : offset.dy + size.height,
                                            bottom: opensUpward ? screenSize.height - offset.dy : null,
                                            width: size.width,
                                            child: Material(
                                              color: Colors.transparent,
                                              elevation: 4,
                                              borderRadius: BorderRadius.circular(8),
                                              child: Container(
                                                constraints: BoxConstraints(maxHeight: menuHeight),
                                                decoration: BoxDecoration(
                                                  color: FlutterFlowTheme.of(context).secondaryBackground,
                                                  borderRadius: BorderRadius.circular(8),
                                                  border: Border.all(color: FlutterFlowTheme.of(context).alternate),
                                                ),
                                                child: StatefulBuilder(
                                                  builder: (context, setModalState) {
                                                    final filteredIds = disciplineIds.where((id) {
                                                      final label = disciplineMap[id] ?? '';
                                                      return label.toLowerCase().contains(searchText.toLowerCase());
                                                    }).toList();

                                                    return Column(
                                                      mainAxisSize: MainAxisSize.min,
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      children: [
                                                        Padding(
                                                          padding: EdgeInsets.fromLTRB(12, 12, 12, 8),
                                                          child: TextFormField(
                                                            autofocus: true,
                                                            onChanged: (val) => setModalState(() => searchText = val),
                                                            decoration: InputDecoration(
                                                              isDense: true,
                                                              hintText: 'Procurar',
                                                              hintStyle: FlutterFlowTheme.of(context).labelMedium,
                                                              enabledBorder: OutlineInputBorder(
                                                                borderSide: BorderSide(color: FlutterFlowTheme.of(context).alternate),
                                                                borderRadius: BorderRadius.circular(8),
                                                              ),
                                                              focusedBorder: OutlineInputBorder(
                                                                borderSide: BorderSide(color: FlutterFlowTheme.of(context).primary),
                                                                borderRadius: BorderRadius.circular(8),
                                                              ),
                                                              filled: true,
                                                              fillColor: FlutterFlowTheme.of(context).primaryBackground,
                                                              prefixIcon: Icon(Icons.search_rounded, size: 18, color: FlutterFlowTheme.of(context).secondaryText),
                                                              contentPadding: EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                                                            ),
                                                            style: FlutterFlowTheme.of(context).bodyMedium,
                                                          ),
                                                        ),
                                                        Divider(height: 1, thickness: 1, color: FlutterFlowTheme.of(context).alternate),
                                                        Flexible(
                                                          child: filteredIds.isEmpty
                                                              ? Padding(
                                                                  padding: EdgeInsets.all(16),
                                                                  child: size.height > 0 ? Text('Nenhum resultado', style: FlutterFlowTheme.of(context).labelMedium) : SizedBox.shrink(),
                                                                )
                                                              : ListView.builder(
                                                                  padding: EdgeInsets.zero,
                                                                  shrinkWrap: true,
                                                                  itemCount: filteredIds.length,
                                                                  itemBuilder: (context, index) {
                                                                    final id = filteredIds[index];
                                                                    final label = disciplineMap[id] ?? '';
                                                                    final isSelected = _model.dropDisciplineValue == id;
                                                                    
                                                                    return Container(
                                                                      color: isSelected ? FlutterFlowTheme.of(context).primary.withOpacity(0.08) : null,
                                                                      child: Row(
                                                                        children: [
                                                                          Expanded(
                                                                            child: InkWell(
                                                                              onTap: () {
                                                                                safeSetState(() => _model.dropDisciplineValue = id);
                                                                                Navigator.pop(dialogContext);
                                                                              },
                                                                              child: Padding(
                                                                                padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                                                                child: Row(
                                                                                  children: [
                                                                                    Expanded(
                                                                                      child: Text(
                                                                                        label,
                                                                                        style: FlutterFlowTheme.of(context).bodyMedium.override(
                                                                                          font: GoogleFonts.lexend(
                                                                                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                                                                            color: isSelected ? FlutterFlowTheme.of(context).primary : FlutterFlowTheme.of(context).primaryText,
                                                                                          ),
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                    if (isSelected) 
                                                                                      Icon(Icons.check, size: 16, color: FlutterFlowTheme.of(context).primary),
                                                                                  ],
                                                                                ),
                                                                              ),
                                                                            ),
                                                                          ),
                                                                          Row(
                                                                            mainAxisSize: MainAxisSize.min,
                                                                            children: [
                                                                              InkWell(
                                                                                onTap: () async {
                                                                                  /* Editar */
                                                                                  final _disciplineEdit = await showDialog(
                                                                                    context: context,
                                                                                    builder: (dialogContext) {
                                                                                      return ModalAddDisciplineWidget(
                                                                                         id: id,
                                                                                         name: label,
                                                                                         action: () async {
                                                                                            _model.clearUnityCache();
                                                                                            _model.apiResultUnidades = await TasksGroup.getUnityCall.call(token: FFAppState().token, companyId: FFAppState().infoUser.companyId);
                                                                                            _model.clearDisciplineCache();
                                                                                            _model.apiResultDisciplinas = await DisciplineGroup.disciplineCall.call(token: FFAppState().token, companyId: FFAppState().infoUser.companyId);
                                                                                         },
                                                                                      );
                                                                                    },
                                                                                  );
                                                                                  
                                                                                  if (_disciplineEdit != null) {
                                                                                       if (Navigator.of(dialogContext).canPop()) {
                                                                                        Navigator.pop(dialogContext);
                                                                                       }
                                                                                       safeSetState(() => _model.dropDisciplineValue = id);
                                                                                  }
                                                                                  safeSetState(() {});
                                                                                },
                                                                                borderRadius: BorderRadius.circular(4),
                                                                                child: Padding(
                                                                                  padding: EdgeInsets.all(8),
                                                                                  child: Icon(Icons.edit_outlined, size: 18, color: FlutterFlowTheme.of(context).secondaryText),
                                                                                ),
                                                                              ),
                                                                              InkWell(
                                                                                onTap: () async {
                                                                                   await showDialog(
                                                                                     context: context,
                                                                                     builder: (dialogContext) {
                                                                                       return ModalConfirmWidget(
                                                                                         title: 'Excluir Disciplina',
                                                                                         description: 'Deseja realmente excluir "$label"?',
                              action: () async {
  var _deleteDiscipline = await DisciplineGroup.deleteDisciplineCall.call(
    disciplineId: id,
    token: FFAppState().token, // Refresh fix confirmed
  );
  if ((_deleteDiscipline.succeeded ?? true)) {
    _model.clearDisciplineCache();
    _model.apiResultDisciplinas = await DisciplineGroup.disciplineCall.call(
      token: FFAppState().token,
      companyId: FFAppState().infoUser.companyId,
    );
  } else {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Erro ao excluir disciplina',
           style: TextStyle(
            color: FlutterFlowTheme.of(context).primaryText,
          ),
        ),
        duration: Duration(milliseconds: 4000),
        backgroundColor: FlutterFlowTheme.of(context).error,
      ),
    );
  }
},
                                                                                       );
                                                                                     },
                                                                                   );
                                                                                   safeSetState(() {});
                                                                                },
                                                                                borderRadius: BorderRadius.circular(4),
                                                                                child: Padding(
                                                                                  padding: EdgeInsets.fromLTRB(8, 8, 16, 8),
                                                                                  child: Icon(Icons.delete_outline, size: 18, color: FlutterFlowTheme.of(context).secondaryText),
                                                                                ),
                                                                              ),
                                                                            ],
                                                                          ),
                                                                        ],
                                                                      ),
                                                                    );
                                                                  },
                                                                ),
                                                        ),
                                                        Padding(
                                                          padding: EdgeInsets.all(12),
                                                          child: Align(
                                                            alignment: Alignment.centerLeft,
                                                            child: FFButtonWidget(
                                                              onPressed: () async {
                                                                Navigator.pop(dialogContext);
                                                                final _disciplineCreate = await showDialog(
                                                                  context: context,
                                                                  builder: (dialogContext) {
                                                                    return ModalAddDisciplineWidget(
                                                                       action: () async {
                                                                          _model.clearUnityCache();
                                                                          _model.apiResultUnidades = await TasksGroup.getUnityCall.call(token: FFAppState().token, companyId: FFAppState().infoUser.companyId);
                                                                          _model.clearDisciplineCache();
                                                                          _model.apiResultDisciplinas = await DisciplineGroup.disciplineCall.call(token: FFAppState().token, companyId: FFAppState().infoUser.companyId);
                                                                       },
                                                                    );
                                                                  },
                                                                );
                                                                if (_disciplineCreate != null) {
                                                                     if (_disciplineCreate['id'] != null) {
                                                                         safeSetState(() => _model.dropDisciplineValue = _disciplineCreate['id']);
                                                                     }
                                                                     safeSetState(() {});
                                                                }
                                                              },
                                                              text: 'Criar Disciplina',
                                                              icon: null,
                                                              options: FFButtonOptions(
                                                                width: 170.0,
                                                                height: 40.0,
                                                                padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                                                                iconPadding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                                                                color: FlutterFlowTheme.of(context).primary,
                                                                textStyle: FlutterFlowTheme.of(context).labelMedium.override(
                                                                  font: GoogleFonts.lexend(
                                                                    fontWeight: FlutterFlowTheme.of(context).labelMedium.fontWeight,
                                                                    fontStyle: FlutterFlowTheme.of(context).labelMedium.fontStyle,
                                                                  ),
                                                                  color: FlutterFlowTheme.of(context).info,
                                                                  letterSpacing: 0.0,
                                                                ),
                                                                elevation: 0.0,
                                                                borderRadius: BorderRadius.circular(12.0),
                                                              ),
                                                            ),
                                                          ),
                                                        ),
                                                      ],
                                                    );
                                                  },
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      );
                                    },
                                  );
                                },
                                child: Container(
                                  height: 48.0,
                                  decoration: BoxDecoration(
                                    color: FlutterFlowTheme.of(context).primaryBackground,
                                    borderRadius: BorderRadius.circular(8.0),
                                    border: Border.all(
                                      color: _model.erroDiscipline
                                          ? FlutterFlowTheme.of(context).error
                                          : FlutterFlowTheme.of(context).alternate,
                                      width: 1.0,
                                    ),
                                  ),
                                  padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.max,
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        selectedLabel,
                                        style: FlutterFlowTheme.of(context).bodyMedium.override(
                                          font: GoogleFonts.lexend(
                                            color: _model.dropDisciplineValue != null
                                                ? FlutterFlowTheme.of(context).primaryText
                                                : FlutterFlowTheme.of(context).secondaryText,
                                          ),
                                        ),
                                      ),
                                      Icon(
                                        Icons.keyboard_arrow_down_rounded,
                                        color: FlutterFlowTheme.of(context).secondaryText,
                                        size: 24.0,
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }
                          );
                        },
                      ),
                      if (_model.erroDiscipline)
                        Text(
                          FFLocalizations.of(context).getText(
                            'fq923khh' /* * Campo obrigatório */,
                          ),
                          style:
                              FlutterFlowTheme.of(context).bodyMedium.override(
                                    font: GoogleFonts.lexend(
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .fontStyle,
                                    ),
                                    color: FlutterFlowTheme.of(context).error,
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .bodyMedium
                                        .fontStyle,
                                  ),
                        ),
                    ].divide(SizedBox(height: 4.0)),
                  ),
                  Divider(
                    thickness: 1.0,
                    color: FlutterFlowTheme.of(context).alternate,
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      FFButtonWidget(
                        onPressed: () async {
                          Navigator.pop(context);
                        },
                        text: FFLocalizations.of(context).getText(
                          'w7tx6wny' /* Cancelar */,
                        ),
                        options: FFButtonOptions(
                          width: 200.0,
                          height: 40.0,
                          padding: EdgeInsetsDirectional.fromSTEB(
                              16.0, 0.0, 16.0, 0.0),
                          iconPadding: EdgeInsetsDirectional.fromSTEB(
                              0.0, 0.0, 0.0, 0.0),
                          color: FlutterFlowTheme.of(context).secondary,
                          textStyle:
                              FlutterFlowTheme.of(context).labelMedium.override(
                                    font: GoogleFonts.lexend(
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .labelMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .labelMedium
                                          .fontStyle,
                                    ),
                                    color: FlutterFlowTheme.of(context).primary,
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .fontStyle,
                                  ),
                          elevation: 0.0,
                          borderSide: BorderSide(
                            color: FlutterFlowTheme.of(context).alternate,
                            width: 1.0,
                          ),
                          borderRadius: BorderRadius.circular(12.0),
                          hoverColor: FlutterFlowTheme.of(context).hoverNavBar,
                          hoverBorderSide: BorderSide(
                            color: FlutterFlowTheme.of(context).hoverNavBar,
                            width: 1.0,
                          ),
                          hoverTextColor:
                              FlutterFlowTheme.of(context).secondaryBackground,
                        ),
                      ),
                      Expanded(
                        child: Builder(
                          builder: (context) => FFButtonWidget(
                            onPressed: () async {
                              var _shouldSetState = false;
                              _model.form = true;
                              if (_model.formKey.currentState == null ||
                                  !_model.formKey.currentState!.validate()) {
                                _model.form = false;
                              }
                              _shouldSetState = true;
                              if (_model.form! &&
                                  (_model.dropDisciplineValue != null)) {
                                _model.erroDiscipline = false;
                                safeSetState(() {});
                              } else {
                                _model.erroDiscipline =
                                    _model.dropDisciplineValue != null
                                        ? false
                                        : true;
                                safeSetState(() {});
                                await showDialog(
                                  context: context,
                                  builder: (dialogContext) {
                                    return Dialog(
                                      elevation: 0,
                                      insetPadding: EdgeInsets.zero,
                                      backgroundColor: Colors.transparent,
                                      alignment: AlignmentDirectional(0.0, 0.0)
                                          .resolve(Directionality.of(context)),
                                      child: ModalInfoWidget(
                                        title:
                                            FFLocalizations.of(context).getText(
                                          '1q7pgvy5' /* Preencha os campos obrigatório... */,
                                        ),
                                        description:
                                            FFLocalizations.of(context).getText(
                                          'z6s4ri7p' /* Para prosseguir é preciso pree... */,
                                        ),
                                      ),
                                    );
                                  },
                                );

                                if (_shouldSetState) safeSetState(() {});
                                return;
                              }

                              if (widget!.typePage == 'creat') {
                                _model.aPiCreatTask =
                                    await TasksGroup.addTasksRecordCall.call(
                                  bearerAuth: FFAppState().token,
                                  description:
                                      _model.descriptionTextController.text,
                                  amount: 0.0,
                                  weight: double.tryParse(
                                      _model.weightTextController.text),
                                  unity: _model.unityValue,
                                  companyId: FFAppState().infoUser.companyId,
                                  disciplineId: _model.dropDisciplineValue,
                                );

                                _shouldSetState = true;
                                if ((_model.aPiCreatTask?.succeeded ?? true)) {
                                  context.pushNamed(
                                    TarefasWidget.routeName,
                                    extra: <String, dynamic>{
                                      kTransitionInfoKey: TransitionInfo(
                                        hasTransition: true,
                                        transitionType: PageTransitionType.fade,
                                        duration: Duration(milliseconds: 0),
                                      ),
                                    },
                                  );

                                  if (_shouldSetState) safeSetState(() {});
                                  return;
                                } else {
                                  await showDialog(
                                    context: context,
                                    builder: (dialogContext) {
                                      return Dialog(
                                        elevation: 0,
                                        insetPadding: EdgeInsets.zero,
                                        backgroundColor: Colors.transparent,
                                        alignment:
                                            AlignmentDirectional(0.0, 0.0)
                                                .resolve(
                                                    Directionality.of(context)),
                                        child: ModalInfoWidget(
                                          title: FFLocalizations.of(context)
                                              .getText(
                                            'k6xp9rco' /* Erro! */,
                                          ),
                                          description: getJsonField(
                                            (_model.aPiCreatTask?.jsonBody ??
                                                ''),
                                            r'''$.message''',
                                          ).toString(),
                                        ),
                                      );
                                    },
                                  );

                                  if (_shouldSetState) safeSetState(() {});
                                  return;
                                }
                              } else {
                                _model.aPiEditTask =
                                    await TasksGroup.editTasksRecordCall.call(
                                  tasksId: widget!.id,
                                  bearerAuth: FFAppState().token,
                                  description:
                                      _model.descriptionTextController.text,
                                  equipamentsTypesId: _model.equipaments?.id,
                                  weight: double.tryParse(
                                      _model.weightTextController.text),
                                  unity: _model.unityValue,
                                  companyId: FFAppState().infoUser.companyId,
                                  disciplineId: _model.dropDisciplineValue,
                                );

                                _shouldSetState = true;
                                if ((_model.aPiEditTask?.succeeded ?? true)) {
                                  context.pushNamed(
                                    TarefasWidget.routeName,
                                    extra: <String, dynamic>{
                                      kTransitionInfoKey: TransitionInfo(
                                        hasTransition: true,
                                        transitionType: PageTransitionType.fade,
                                        duration: Duration(milliseconds: 0),
                                      ),
                                    },
                                  );

                                  if (_shouldSetState) safeSetState(() {});
                                  return;
                                } else {
                                  await showDialog(
                                    context: context,
                                    builder: (dialogContext) {
                                      return Dialog(
                                        elevation: 0,
                                        insetPadding: EdgeInsets.zero,
                                        backgroundColor: Colors.transparent,
                                        alignment:
                                            AlignmentDirectional(0.0, 0.0)
                                                .resolve(
                                                    Directionality.of(context)),
                                        child: ModalInfoWidget(
                                          title: FFLocalizations.of(context)
                                              .getText(
                                            'yjti39s2' /* Erro! */,
                                          ),
                                          description: getJsonField(
                                            (_model.aPiEditTask?.jsonBody ??
                                                ''),
                                            r'''$.message''',
                                          ).toString(),
                                        ),
                                      );
                                    },
                                  );

                                  if (_shouldSetState) safeSetState(() {});
                                  return;
                                }
                              }

                              if (_shouldSetState) safeSetState(() {});
                            },
                            text: FFLocalizations.of(context).getText(
                              '92u07e7y' /* Salvar tarefa */,
                            ),
                            options: FFButtonOptions(
                              width: 200.0,
                              height: 40.0,
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  16.0, 0.0, 16.0, 0.0),
                              iconPadding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 0.0, 0.0),
                              color: FlutterFlowTheme.of(context).primary,
                              textStyle: FlutterFlowTheme.of(context)
                                  .labelMedium
                                  .override(
                                    font: GoogleFonts.lexend(
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .labelMedium
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .labelMedium
                                          .fontStyle,
                                    ),
                                    color: FlutterFlowTheme.of(context).info,
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .labelMedium
                                        .fontStyle,
                                  ),
                              elevation: 0.0,
                              borderRadius: BorderRadius.circular(12.0),
                            ),
                          ),
                        ),
                      ),
                    ].divide(SizedBox(width: 12.0)),
                  ),
                ].divide(SizedBox(height: 16.0)),
              ),
            ),
          );
        },
      ),
    );
  }
}
