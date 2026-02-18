import '/backend/api_requests/api_calls.dart';
import '/flutter_flow/flutter_flow_theme.dart';
import '/flutter_flow/flutter_flow_util.dart';
import '/flutter_flow/flutter_flow_widgets.dart';
import '/flutter_flow/flutter_flow_icon_button.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ModalAddDisciplineWidget extends StatefulWidget {
  const ModalAddDisciplineWidget({
    Key? key,
    this.id,
    this.name,
    this.action,
  }) : super(key: key);

  final int? id;
  final String? name;
  final Future Function()? action;

  @override
  _ModalAddDisciplineWidgetState createState() => _ModalAddDisciplineWidgetState();
}

class _ModalAddDisciplineWidgetState extends State<ModalAddDisciplineWidget> {
  late TextEditingController _nameController;
  final _formKey = GlobalKey<FormState>();

  bool get isEditing => widget.id != null;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.name ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: EdgeInsets.all(16),
      backgroundColor: Colors.transparent,
      alignment: Alignment.center,
      child: Container(
        width: 400,
        decoration: BoxDecoration(
          color: FlutterFlowTheme.of(context).secondaryBackground,
          borderRadius: BorderRadius.circular(16),
        ),
        padding: EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cabeçalho: Título e Botão Fechar
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                   Text(
                    isEditing ? 'Editar disciplina' : 'Criar disciplina',
                    style: FlutterFlowTheme.of(context).titleLarge.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FontWeight.w500,
                            color: FlutterFlowTheme.of(context).primaryText,
                          ),
                        ),
                  ),
                  FlutterFlowIconButton(
                    borderColor: FlutterFlowTheme.of(context).primary,
                    borderRadius: 8.0,
                    borderWidth: 0.5,
                    buttonSize: 32.0,
                    fillColor: FlutterFlowTheme.of(context).secondaryBackground,
                    icon: Icon(
                      Icons.close_sharp,
                      color: FlutterFlowTheme.of(context).primary,
                      size: 16.0,
                    ),
                    onPressed: () async {
                      Navigator.pop(context);
                    },
                    hoverColor: FlutterFlowTheme.of(context).hoverNavBar,
                    hoverIconColor: FlutterFlowTheme.of(context).secondaryBackground,
                    hoverBorderColor: FlutterFlowTheme.of(context).hoverNavBar,
                  ),
                ],
              ),
              SizedBox(height: 24),
              // Campo de Texto
              TextFormField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: 'Nome da disciplina',
                  labelStyle: FlutterFlowTheme.of(context).labelMedium,
                  hintStyle: FlutterFlowTheme.of(context).labelMedium,
                  enabledBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                      color: FlutterFlowTheme.of(context).alternate,
                      width: 1,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderSide: BorderSide(
                      color: FlutterFlowTheme.of(context).primary,
                      width: 1,
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  filled: true,
                  fillColor: FlutterFlowTheme.of(context).primaryBackground,
                  contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
                style: FlutterFlowTheme.of(context).bodyMedium,
                validator: (val) {
                  if (val == null || val.isEmpty) {
                    return 'Campo obrigatório';
                  }
                  return null;
                },
              ),
              SizedBox(height: 24),
              // Botão de Ação (Alinhado a Esquerda)
              FFButtonWidget(
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    if (isEditing) {
                       var _editResp = await DisciplineGroup.editDisciplineCall.call(
                         disciplineId: widget.id,
                         discipline: _nameController.text,
                         token: FFAppState().token,
                         companyId: FFAppState().infoUser.companyId,
                       );
                       if ((_editResp.succeeded ?? true)) {
                          if (widget.action != null) {
                            await widget.action!();
                          }
                          Navigator.pop(context, {
                            'name': _nameController.text,
                            'id': widget.id,
                            'is_edit': true,
                          });
                       } else {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro ao editar disciplina')));
                       }
                    } else {
                       var _createResp = await DisciplineGroup.addDisciplineCall.call(
                         discipline: _nameController.text,
                         token: FFAppState().token,
                         companyId: FFAppState().infoUser.companyId,
                       );
                       if ((_createResp.succeeded ?? true)) {
                          if (widget.action != null) {
                            await widget.action!();
                          }
                          Navigator.pop(context, {
                            'name': _nameController.text,
                            'id': getJsonField(_createResp.jsonBody, r'''$.id'''),
                            'is_edit': false,
                          });
                       } else {
                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erro ao criar disciplina')));
                       }
                    }
                  }
                },
                text: isEditing ? 'Salvar Alterações' : 'Criar Disciplina',
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
            ],
          ),
        ),
      ),
    );
  }
}
