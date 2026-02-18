import 'package:flutter/services.dart';
import '/flutter_flow/flutter_flow_drop_down.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/form_field_controller.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'csv_comp_model.dart';
export 'csv_comp_model.dart';

class CsvCompWidget extends StatefulWidget {
  const CsvCompWidget({
    super.key,
    this.parameter1,
    this.parameter2,
    this.equipamentNames,
    this.equipamentIds,
    required this.csvJson,
    required this.index,
    this.taskToEquipIdMap,
    this.units,
    this.disciplines,
    this.taskName,
  });

  final List<String>? parameter1;
  final List<int>? parameter2;
  final List<String>? equipamentNames;
  final List<int>? equipamentIds;
  final dynamic csvJson;
  final int? index;
  final Map<int, int>? taskToEquipIdMap;
  final List<dynamic>? units;
  final List<dynamic>? disciplines;
  final String? taskName;

  @override
  State<CsvCompWidget> createState() => _CsvCompWidgetState();
}

class _CsvCompWidgetState extends State<CsvCompWidget> {
  late CsvCompModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => CsvCompModel());

    _model.switchValue = false;
    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
    
    // Set default value for Qtd Tarefas
    _model.qtdTarefasTextController?.text = '1';
    
    // Listeners for TextFields to update JSON
    _model.pesoTextController?.addListener(_updateJson);
    _model.quantidadeTextController?.addListener(_updateJson);
    _model.qtdTarefasTextController?.addListener(_updateJson);
  }

  void _updateJson() {
    if (widget.csvJson is! Map) return;
    
    final json = widget.csvJson as Map;
    json['peso'] = _model.pesoTextController.text;
    json['unidade'] = _model.unidadeValue ?? '';
    json['unity_id'] = int.tryParse(_model.unidadeValue ?? '') ?? 0;
    json['quantidade'] = _model.quantidadeTextController.text;
    json['disciplina'] = _model.disciplinaValue ?? '';
    json['discipline_id'] = int.tryParse(_model.disciplinaValue ?? '') ?? 0;
    json['equipaments_types_id'] = _model.equipamentValue ?? 0; // New field
    json['qtd_tarefas'] = _model.qtdTarefasTextController.text;
    json['tarefa_id'] = _model.switchValue! ? _model.dropDownValue1 : 0;
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    bool shouldLock = [1, 5, 6].contains(_model.dropDownValue1);

    return Row(
      mainAxisSize: MainAxisSize.max,
      children: [
        Container(
          width: 30.0,
          height: 30.0,
          decoration: BoxDecoration(
            border: Border.all(
              color: FlutterFlowTheme.of(context).alternate,
            ),
          ),
          alignment: AlignmentDirectional(0.0, 0.0),
          child: Text(
            widget.index!.toString(),
            style: FlutterFlowTheme.of(context).bodyMedium.override(
                  font: GoogleFonts.lexend(
                    fontWeight: FontWeight.w500,
                    fontStyle:
                        FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                  ),
                  fontSize: 14.0,
                  letterSpacing: 0.0,
                  fontWeight: FontWeight.w500,
                  fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                ),
          ),
        ),
        Expanded(
          child: Container(
            width: 30.0,
            height: 30.0,
            decoration: BoxDecoration(
              border: Border.all(
                color: FlutterFlowTheme.of(context).alternate,
              ),
            ),
            alignment: AlignmentDirectional(-1.0, 0.0),
            child: Padding(
              padding: EdgeInsetsDirectional.fromSTEB(24.0, 0.0, 0.0, 0.0),
              child: Text(
                valueOrDefault<String>(
                  widget.taskName != null && widget.taskName!.isNotEmpty
                      ? widget.taskName
                      : getJsonField(
                          widget!.csvJson,
                          r'''$.nome''',
                        )?.toString(),
                  '-',
                ),
                style: FlutterFlowTheme.of(context).bodyMedium.override(
                      font: GoogleFonts.lexend(
                        fontWeight: FontWeight.w500,
                        fontStyle:
                            FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                      ),
                      fontSize: 14.0,
                      letterSpacing: 0.0,
                      fontWeight: FontWeight.w500,
                      fontStyle:
                          FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                    ),
              ),
            ),
          ),
        ),
        Container(
          width: 90.0,
          height: 30.0,
          decoration: BoxDecoration(
            border: Border.all(
              color: FlutterFlowTheme.of(context).alternate,
            ),
          ),
          alignment: AlignmentDirectional(-1.0, 0.0),
          child: Padding(
            padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
            child: Switch.adaptive(
              value: _model.switchValue!,
              onChanged: (newValue) async {
                safeSetState(() => _model.switchValue = newValue!);
                _updateJson();
              },
              activeColor: FlutterFlowTheme.of(context).primary,
              activeTrackColor: FlutterFlowTheme.of(context).primary,
              inactiveTrackColor: FlutterFlowTheme.of(context).alternate,
              inactiveThumbColor:
                  FlutterFlowTheme.of(context).secondaryBackground,
            ),
          ),
        ),
        Expanded(
          child: Container(
            width: 30.0,
            height: 30.0,
            decoration: BoxDecoration(
              border: Border.all(
                color: FlutterFlowTheme.of(context).alternate,
              ),
            ),
            alignment: AlignmentDirectional(-1.0, 0.0),
            child: FlutterFlowDropDown<int>(
              controller: _model.dropDownValueController1 ??=
                  FormFieldController<int>(null),
              options: List<int>.from(widget!.parameter2!),
              optionLabels: widget!.parameter1!,
              onChanged: (val) {
                safeSetState(() => _model.dropDownValue1 = val);
                // Auto-fill Equipment
                if (widget.taskToEquipIdMap != null && val != null) {
                  final equipId = widget.taskToEquipIdMap![val];
                  if (equipId != null && (widget.equipamentIds?.contains(equipId) ?? false)) {
                     safeSetState(() {
                        _model.equipamentValue = equipId;
                        _model.equipamentValueController?.value = equipId;
                     });
                  }
                }
                _updateJson();
              },
              width: double.infinity,
              height: 40.0,
              maxHeight: 200.0,
              textStyle: FlutterFlowTheme.of(context).bodyMedium.override(
                    font: GoogleFonts.lexend(
                      fontWeight:
                          FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                      fontStyle:
                          FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                    ),
                    color: _model.switchValue!
                        ? FlutterFlowTheme.of(context).primaryText
                        : FlutterFlowTheme.of(context).secondaryText,
                    letterSpacing: 0.0,
                    fontWeight:
                        FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                    fontStyle:
                        FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                  ),
              hintText: FFLocalizations.of(context).getText(
                'tuiyc58c' /* Selecionar comparação */,
              ),
              icon: Icon(
                Icons.keyboard_arrow_down_rounded,
                color: FlutterFlowTheme.of(context).secondaryText,
                size: 24.0,
              ),
              fillColor: _model.switchValue!
                  ? FlutterFlowTheme.of(context).status03
                  : FlutterFlowTheme.of(context).alternate,
              elevation: 2.0,
              borderColor: Colors.transparent,
              borderWidth: 0.0,
              borderRadius: 0.0,
              margin: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
              hidesUnderline: true,
              disabled: !_model.switchValue!,
              isOverButton: false,
              isSearchable: true,
              isMultiSelect: false,
            ),
          ),
        ),
        // EQUIPAMENTOS (Novo Dropdown)
        Expanded(
          child: Container(
            width: 30.0,
            height: 30.0,
            decoration: BoxDecoration(
              border: Border.all(
                color: FlutterFlowTheme.of(context).alternate,
              ),
            ),
            alignment: AlignmentDirectional(-1.0, 0.0),
            child: FlutterFlowDropDown<int>(
              controller: _model.equipamentValueController ??=
                  FormFieldController<int>(null),
              options: widget.equipamentIds ?? [],
              optionLabels: widget.equipamentNames ?? [],
              onChanged: (val) {
                safeSetState(() => _model.equipamentValue = val);
                _updateJson();
              },
              width: double.infinity,
              height: 40.0,
              maxHeight: 200.0,
              textStyle: FlutterFlowTheme.of(context).bodyMedium.override(
                    font: GoogleFonts.lexend(
                      fontWeight:
                          FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                      fontStyle:
                          FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                    ),
                    color: FlutterFlowTheme.of(context).primaryText,
                    letterSpacing: 0.0,
                    fontWeight:
                        FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                    fontStyle:
                        FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                  ),
              hintText: 'Equipamento',
              icon: Icon(
                Icons.keyboard_arrow_down_rounded,
                color: FlutterFlowTheme.of(context).secondaryText,
                size: 24.0,
              ),
              fillColor: FlutterFlowTheme.of(context).status03,
              elevation: 2.0,
              borderColor: Colors.transparent,
              borderWidth: 0.0,
              borderRadius: 0.0,
              margin: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
              hidesUnderline: true,
              disabled: false,
              isOverButton: false,
              isSearchable: true,
              isMultiSelect: false,
            ),
          ),
        ),
        // PESO TAREFA
        Container(
          width: 100.0,
          height: 30.0,
          decoration: BoxDecoration(
            border: Border.all(
              color: FlutterFlowTheme.of(context).alternate,
            ),
          ),
          child: Padding(
            padding: EdgeInsetsDirectional.fromSTEB(8.0, 0.0, 8.0, 0.0),
            child: TextFormField(
              controller: _model.pesoTextController,
              focusNode: _model.pesoFocusNode,
              autofocus: false,
              readOnly: shouldLock,
              obscureText: false,
              decoration: InputDecoration(
                hintText: '1.0',
                hintStyle: FlutterFlowTheme.of(context).labelMedium,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                errorBorder: InputBorder.none,
                focusedErrorBorder: InputBorder.none,
                prefixText: 'x',
                prefixStyle: FlutterFlowTheme.of(context).bodyMedium.override(
                      font: GoogleFonts.lexend(),
                      color: shouldLock
                          ? FlutterFlowTheme.of(context).secondaryText
                          : FlutterFlowTheme.of(context).primaryText,
                    ),
              ),
              style: FlutterFlowTheme.of(context).bodyMedium.override(
                    font: GoogleFonts.lexend(),
                    color: shouldLock
                        ? FlutterFlowTheme.of(context).secondaryText
                        : FlutterFlowTheme.of(context).primaryText,
                  ),
              textAlign: TextAlign.start,
              keyboardType: TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp('[0-9.]')),
              ],
            ),
          ),
        ),
        // UNIDADE MEDIDA
        Container(
          width: 120.0,
          height: 30.0,
          decoration: BoxDecoration(
            border: Border.all(
              color: FlutterFlowTheme.of(context).alternate,
            ),
          ),
          child: FlutterFlowDropDown<String>(
            controller: _model.unidadeValueController ??=
                FormFieldController<String>(null),
            options: widget.units != null 
                ? widget.units!.map((u) => u['id'].toString()).toList()
                : ['Metro (m)', 'Unidade (un)', 'Hora (h)', 'Metro Quadrado (m²)', 'Metro Cúbico (m³)'],
            optionLabels: widget.units != null
                ? widget.units!.map((u) => u['unity'].toString()).toList()
                : null,
            onChanged: (val) {
              safeSetState(() => _model.unidadeValue = val);
              _updateJson();
            },
            width: double.infinity,
            height: 40.0,
            textStyle: FlutterFlowTheme.of(context).bodyMedium.override(
                  font: GoogleFonts.lexend(
                    fontWeight:
                        FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                    fontStyle:
                        FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                  ),
                  color: shouldLock
                      ? FlutterFlowTheme.of(context).secondaryText
                      : FlutterFlowTheme.of(context).primaryText,
                  letterSpacing: 0.0,
                  fontWeight:
                      FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                  fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                ),
            hintText: 'Unidade',
            icon: Icon(
              Icons.keyboard_arrow_down_rounded,
              color: FlutterFlowTheme.of(context).secondaryText,
              size: 24.0,
            ),
            fillColor: shouldLock
                ? FlutterFlowTheme.of(context).alternate
                : FlutterFlowTheme.of(context).status03,
            elevation: 2.0,
            borderColor: Colors.transparent,
            borderWidth: 0.0,
            borderRadius: 0.0,
            margin: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
            hidesUnderline: true,
            disabled: shouldLock,
            isSearchable: true,
          ),
        ),
        // QUANTIDADE
        Container(
          width: 100.0,
          height: 30.0,
          decoration: BoxDecoration(
            border: Border.all(
              color: FlutterFlowTheme.of(context).alternate,
            ),
          ),
          child: Padding(
            padding: EdgeInsetsDirectional.fromSTEB(8.0, 0.0, 8.0, 0.0),
            child: TextFormField(
              controller: _model.quantidadeTextController,
              focusNode: _model.quantidadeFocusNode,
              autofocus: false,
              readOnly: shouldLock,
              obscureText: false,
              decoration: InputDecoration(
                hintText: '100',
                hintStyle: FlutterFlowTheme.of(context).labelMedium,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                errorBorder: InputBorder.none,
                focusedErrorBorder: InputBorder.none,
              ),
              style: FlutterFlowTheme.of(context).bodyMedium.override(
                    font: GoogleFonts.lexend(),
                    color: shouldLock
                        ? FlutterFlowTheme.of(context).secondaryText
                        : FlutterFlowTheme.of(context).primaryText,
                  ),
              keyboardType: TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp('[0-9.]')),
              ],
            ),
          ),
        ),
        // DISCIPLINA
        Container(
          width: 120.0,
          height: 30.0,
          decoration: BoxDecoration(
            border: Border.all(
              color: FlutterFlowTheme.of(context).alternate,
            ),
          ),
          child: FlutterFlowDropDown<String>(
            controller: _model.disciplinaValueController ??=
                FormFieldController<String>(null),
            options: widget.disciplines != null 
                ? widget.disciplines!.map((d) => d['id'].toString()).toList()
                : ['Civil', 'Elétrica', 'Mecânica', 'Geral'],
            optionLabels: widget.disciplines != null
                ? widget.disciplines!.map((d) => d['discipline'].toString()).toList() // Assuming 'discipline' field
                : null,
            onChanged: (val) {
              safeSetState(() => _model.disciplinaValue = val);
              _updateJson();
            },
            width: double.infinity,
            height: 40.0,
            textStyle: FlutterFlowTheme.of(context).bodyMedium.override(
                  font: GoogleFonts.lexend(
                    fontWeight:
                        FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                    fontStyle:
                        FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                  ),
                  color: shouldLock
                      ? FlutterFlowTheme.of(context).secondaryText
                      : FlutterFlowTheme.of(context).primaryText,
                  letterSpacing: 0.0,
                  fontWeight:
                      FlutterFlowTheme.of(context).bodyMedium.fontWeight,
                  fontStyle: FlutterFlowTheme.of(context).bodyMedium.fontStyle,
                ),
            hintText: 'Disciplina',
            icon: Icon(
              Icons.keyboard_arrow_down_rounded,
              color: FlutterFlowTheme.of(context).secondaryText,
              size: 24.0,
            ),
            fillColor: shouldLock
                ? FlutterFlowTheme.of(context).alternate
                : FlutterFlowTheme.of(context).status03,
            elevation: 2.0,
            borderColor: Colors.transparent,
            borderWidth: 0.0,
            borderRadius: 0.0,
            margin: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
            hidesUnderline: true,
            disabled: shouldLock,
            isSearchable: true,
          ),
        ),
        // QTD TAREFAS
        Container(
          width: 100.0,
          height: 30.0,
          decoration: BoxDecoration(
            border: Border.all(
              color: FlutterFlowTheme.of(context).alternate,
            ),
          ),
          child: Padding(
            padding: EdgeInsetsDirectional.fromSTEB(8.0, 0.0, 8.0, 0.0),
            child: TextFormField(
              controller: _model.qtdTarefasTextController,
              focusNode: _model.qtdTarefasFocusNode,
              autofocus: false,
              readOnly: shouldLock,
              obscureText: false,
              decoration: InputDecoration(
                hintText: '1',
                hintStyle: FlutterFlowTheme.of(context).labelMedium,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                errorBorder: InputBorder.none,
                focusedErrorBorder: InputBorder.none,
              ),
              style: FlutterFlowTheme.of(context).bodyMedium.override(
                    font: GoogleFonts.lexend(),
                    color: shouldLock
                        ? FlutterFlowTheme.of(context).secondaryText
                        : FlutterFlowTheme.of(context).primaryText,
                  ),
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
              ],
            ),
          ),
        ),

      ],
    );
  }
}
