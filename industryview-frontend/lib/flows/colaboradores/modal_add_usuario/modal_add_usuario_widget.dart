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
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';
import 'package:provider/provider.dart';
import 'modal_add_usuario_model.dart';
export 'modal_add_usuario_model.dart';

class ModalAddUsuarioWidget extends StatefulWidget {
  const ModalAddUsuarioWidget({
    super.key,
    required this.typePage,
    this.name,
    this.phone,
    this.id,
    this.email,
    this.roleId,
    this.typeAcessId,
    this.controlAcessId,
    this.roleTxt,
    this.typeAcessTxt,
    this.controlAcessTxt,
    this.img,
    this.userPermission,
    this.typePage2,
    this.nomeEquipe,
  });

  final String? typePage;
  final String? name;
  final String? phone;
  final int? id;
  final String? email;
  final int? roleId;
  final int? typeAcessId;
  final int? controlAcessId;
  final String? roleTxt;
  final String? typeAcessTxt;
  final String? controlAcessTxt;
  final String? img;
  final int? userPermission;
  final String? typePage2;
  final String? nomeEquipe;

  @override
  State<ModalAddUsuarioWidget> createState() => _ModalAddUsuarioWidgetState();
}

class _ModalAddUsuarioWidgetState extends State<ModalAddUsuarioWidget> {
  late ModalAddUsuarioModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ModalAddUsuarioModel());

    // On component load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      try {
        print('🔵 ModalAddUsuarioWidget: initState callback started');
        safeSetState(() {
          _model.isDataUploading_uploadDataP = false;
          _model.uploadedLocalFile_uploadDataP =
              FFUploadedFile(bytes: Uint8List.fromList([]), originalFilename: '');
        });

        _model.listRoles = [];
        _model.listTypeAcess = [];
        _model.listControlSystem = [];
        safeSetState(() {});
        print('🔵 Calling queryAllUsersRolesRecordsCall...');
        _model.aPiQueryRoles = await UserGroup.queryAllUsersRolesRecordsCall.call(
          bearerAuth: FFAppState().token,
        );

        print('🔵 queryAllUsersRolesRecordsCall completed. Success: ${_model.aPiQueryRoles?.succeeded}');
        print('🔵 Response body: ${_model.aPiQueryRoles?.jsonBody}');
        
        if ((_model.aPiQueryRoles?.succeeded ?? true)) {
          try {
            final jsonBody = _model.aPiQueryRoles?.jsonBody;
            print('🔵 jsonBody type: ${jsonBody.runtimeType}');
            print('🔵 jsonBody content: $jsonBody');
            
            if (jsonBody is List) {
              _model.listRoles = jsonBody
                  .map<ListRolesStruct?>((item) => ListRolesStruct.maybeFromMap(item))
                  .whereType<ListRolesStruct>()
                  .toList();
              print('🔵 listRoles populated with ${_model.listRoles.length} items');
            } else {
              print('🔴 jsonBody is not a List! Type: ${jsonBody.runtimeType}');
            }
          } catch (e) {
            print('🔴 Error parsing listRoles: $e');
          }
          setState(() {});
          print('🔵 Calling queryAllUsersSystemAccessRecordsCall...');
          _model.aPiQueryTypeAcess =
              await UserGroup.queryAllUsersSystemAccessRecordsCall.call(
            bearerAuth: FFAppState().token,
          );

          print('🔵 queryAllUsersSystemAccessRecordsCall completed. Success: ${_model.aPiQueryTypeAcess?.succeeded}');
          print('🔵 Response body: ${_model.aPiQueryTypeAcess?.jsonBody}');
          
          if ((_model.aPiQueryTypeAcess?.succeeded ?? true)) {
            try {
              final jsonBody = _model.aPiQueryTypeAcess?.jsonBody;
              print('🔵 jsonBody type: ${jsonBody.runtimeType}');
              
              if (jsonBody is List) {
                _model.listTypeAcess = jsonBody
                    .map<ListTypeAcessStruct?>((item) => ListTypeAcessStruct.maybeFromMap(item))
                    .whereType<ListTypeAcessStruct>()
                    .toList();
                print('🔵 listTypeAcess populated with ${_model.listTypeAcess.length} items');
              } else {
                print('🔴 jsonBody is not a List! Type: ${jsonBody.runtimeType}');
              }
            } catch (e) {
              print('🔴 Error parsing listTypeAcess: $e');
            }
            setState(() {});
            print('🔵 Calling queryAllUsersControlSystemRecordsCall...');
            _model.aPiQueryControlSystem =
                await UserGroup.queryAllUsersControlSystemRecordsCall.call(
              bearerAuth: FFAppState().token,
            );

            print('🔵 queryAllUsersControlSystemRecordsCall completed. Success: ${_model.aPiQueryControlSystem?.succeeded}');
            print('🔵 Response body: ${_model.aPiQueryControlSystem?.jsonBody}');
            
            if ((_model.aPiQueryControlSystem?.succeeded ?? true)) {
              try {
                final jsonBody = _model.aPiQueryControlSystem?.jsonBody;
                print('🔵 jsonBody type: ${jsonBody.runtimeType}');
                
                if (jsonBody is List) {
                  _model.listControlSystem = jsonBody
                      .map<ListControlSystemStruct?>((item) => ListControlSystemStruct.maybeFromMap(item))
                      .whereType<ListControlSystemStruct>()
                      .toList();
                  print('🔵 listControlSystem populated with ${_model.listControlSystem.length} items');
                } else {
                  print('🔴 jsonBody is not a List! Type: ${jsonBody.runtimeType}');
                }
              } catch (e) {
                print('🔴 Error parsing listControlSystem: $e');
              }
              setState(() {});
              print('🟢 All APIs completed successfully!');
              return;
            } else {
              print('🔴 queryAllUsersControlSystemRecordsCall failed');
              await action_blocks.aPiUsers0(context);
              return;
            }
          } else {
            print('🔴 queryAllUsersSystemAccessRecordsCall failed');
            await action_blocks.aPiUsers0(context);
            return;
          }
        } else {
          print('🔴 queryAllUsersRolesRecordsCall failed');
          await action_blocks.aPiUsers0(context);
          return;
        }
      } catch (e, stackTrace) {
        print('🔴🔴🔴 CRITICAL ERROR in initState callback: $e');
        print('🔴 Stack trace: $stackTrace');
      }
    });

    _model.nameTextController ??= TextEditingController(
        text: widget!.typePage == 'edit' ? widget!.name : '');
    _model.nameFocusNode ??= FocusNode();

    _model.telefoneTextController ??= TextEditingController(
        text: widget!.typePage == 'edit' ? widget!.phone : '');
    _model.telefoneFocusNode ??= FocusNode();

    _model.telefoneMask = MaskTextInputFormatter(mask: '(##) # ####-####');
    _model.emailAddressTextController ??= TextEditingController(
        text: widget!.typePage == 'edit' ? widget!.email : '');
    _model.emailAddressFocusNode ??= FocusNode();

    if (widget.typePage == 'edit') {
      if (widget.roleId != null) {
        _model.dropRolesValue = widget.roleId;
      }
      if (widget.typeAcessId != null) {
        _model.dropSystemValue = widget.typeAcessId;
      }
      if (widget.controlAcessId != null) {
        _model.dropControlValue = widget.controlAcessId;
      }
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
    
    print('🟣 BUILD: listRoles=${_model.listRoles.length}, listTypeAcess=${_model.listTypeAcess.length}, listControlSystem=${_model.listControlSystem.length}');

    return Align(
      alignment: AlignmentDirectional(0.0, 0.0),
      child: Padding(
        padding: EdgeInsets.all(24.0),
        child: Material(
          color: Colors.transparent,
          elevation: 2.0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24.0),
          ),
          child: Container(
            constraints: BoxConstraints(
              maxWidth: 510.0,
            ),
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
              borderRadius: BorderRadius.circular(24.0),
            ),
            child: Form(
              key: _model.formKey,
              autovalidateMode: AutovalidateMode.disabled,
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Padding(
                      padding: EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              SelectionArea(
                                  child: Text(
                                widget!.typePage == 'creat'
                                    ? FFLocalizations.of(context)
                                        .getVariableText(
                                        ptText: 'Criar usuário',
                                        esText: 'Crear usuario',
                                        enText: 'Create user',
                                      )
                                    : FFLocalizations.of(context)
                                        .getVariableText(
                                        ptText: 'Editar usuário',
                                        esText: 'Editar usuario',
                                        enText: 'Edit user',
                                      ),
                                style: FlutterFlowTheme.of(context)
                                    .titleLarge
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FontWeight.w500,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .titleLarge
                                            .fontStyle,
                                      ),
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w500,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .titleLarge
                                          .fontStyle,
                                    ),
                              )),
                              Align(
                                alignment: AlignmentDirectional(1.0, -1.0),
                                child: FlutterFlowIconButton(
                                  borderColor:
                                      FlutterFlowTheme.of(context).primary,
                                  borderRadius: 8.0,
                                  borderWidth: 0.5,
                                  buttonSize: 32.0,
                                  fillColor:
                                      FlutterFlowTheme.of(context).secondary,
                                  icon: Icon(
                                    Icons.close_sharp,
                                    color: FlutterFlowTheme.of(context).primary,
                                    size: 16.0,
                                  ),
                                  onPressed: () async {
                                    Navigator.pop(context);
                                  },
                                ),
                              ),
                            ].divide(SizedBox(width: 12.0)),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                0.0, 8.0, 0.0, 24.0),
                            child: SelectionArea(
                                child: Text(
                              FFLocalizations.of(context).getText(
                                'hv0oq6kz' /* Preencha todos os dados para o... */,
                              ),
                              style: FlutterFlowTheme.of(context)
                                  .labelSmall
                                  .override(
                                    font: GoogleFonts.lexend(
                                      fontWeight: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .fontWeight,
                                      fontStyle: FlutterFlowTheme.of(context)
                                          .labelSmall
                                          .fontStyle,
                                    ),
                                    letterSpacing: 0.0,
                                    fontWeight: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontWeight,
                                    fontStyle: FlutterFlowTheme.of(context)
                                        .labelSmall
                                        .fontStyle,
                                  ),
                            )),
                          ),
                          Row(
                            mainAxisSize: MainAxisSize.max,
                            children: [
                              Stack(
                                alignment: AlignmentDirectional(1.0, 1.0),
                                children: [
                                  if (valueOrDefault<bool>(
                                    _model.uploadedLocalFile_uploadDataP ==
                                            null ||
                                        (_model.uploadedLocalFile_uploadDataP
                                                .bytes?.isEmpty ??
                                            true),
                                    false,
                                  ))
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(50.0),
                                      child: Image.network(
                                        valueOrDefault<String>(
                                          widget!.img,
                                          'https://x8ki-letl-twmt.n7.xano.io/vault/iaWPz-tD/8ler69Ci8dU8B1ExemIRgXluexs/JGrgRQ../no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg ',
                                        ),
                                        width: 64.0,
                                        height: 64.0,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  if (valueOrDefault<bool>(
                                    _model.uploadedLocalFile_uploadDataP !=
                                            null &&
                                        (_model.uploadedLocalFile_uploadDataP
                                                .bytes?.isNotEmpty ??
                                            false),
                                    false,
                                  ))
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(50.0),
                                      child: Image.memory(
                                        _model.uploadedLocalFile_uploadDataP
                                                .bytes ??
                                            Uint8List.fromList([]),
                                        width: 64.0,
                                        height: 64.0,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  InkWell(
                                    splashColor: Colors.transparent,
                                    focusColor: Colors.transparent,
                                    hoverColor: Colors.transparent,
                                    highlightColor: Colors.transparent,
                                    onTap: () async {
                                      final selectedMedia =
                                          await selectMediaWithSourceBottomSheet(
                                        context: context,
                                        imageQuality: 90,
                                        allowPhoto: true,
                                      );
                                      if (selectedMedia != null &&
                                          selectedMedia.every((m) =>
                                              validateFileFormat(
                                                  m.storagePath, context))) {
                                        safeSetState(() =>
                                            _model.isDataUploading_uploadDataP =
                                                true);
                                        var selectedUploadedFiles =
                                            <FFUploadedFile>[];

                                        try {
                                          selectedUploadedFiles = selectedMedia
                                              .map((m) => FFUploadedFile(
                                                    name: m.storagePath
                                                        .split('/')
                                                        .last,
                                                    bytes: m.bytes,
                                                    height:
                                                        m.dimensions?.height,
                                                    width: m.dimensions?.width,
                                                    blurHash: m.blurHash,
                                                    originalFilename:
                                                        m.originalFilename,
                                                  ))
                                              .toList();
                                        } finally {
                                          _model.isDataUploading_uploadDataP =
                                              false;
                                        }
                                        if (selectedUploadedFiles.length ==
                                            selectedMedia.length) {
                                          safeSetState(() {
                                            _model.uploadedLocalFile_uploadDataP =
                                                selectedUploadedFiles.first;
                                          });
                                        } else {
                                          safeSetState(() {});
                                          return;
                                        }
                                      }
                                    },
                                    child: Icon(
                                      Icons.add_circle,
                                      color:
                                          FlutterFlowTheme.of(context).primary,
                                      size: 24.0,
                                    ),
                                  ),
                                ],
                              ),
                              Expanded(
                                child: Column(
                                  mainAxisSize: MainAxisSize.max,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      FFLocalizations.of(context).getText(
                                        'hmedpafq' /* Nome */,
                                      ),
                                      style: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight: FontWeight.w500,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .bodyMedium
                                                      .fontStyle,
                                            ),
                                            letterSpacing: 0.0,
                                            fontWeight: FontWeight.w500,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMedium
                                                    .fontStyle,
                                          ),
                                    ),
                                    Container(
                                      width: MediaQuery.sizeOf(context).width *
                                          1.0,
                                      child: TextFormField(
                                        controller: _model.nameTextController,
                                        focusNode: _model.nameFocusNode,
                                        autofocus: true,
                                        obscureText: false,
                                        decoration: InputDecoration(
                                          labelStyle: FlutterFlowTheme.of(
                                                  context)
                                              .labelSmall
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontStyle,
                                                ),
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
                                          hintText: FFLocalizations.of(context)
                                              .getText(
                                            'iocqi7xz' /* João Silva */,
                                          ),
                                          hintStyle: FlutterFlowTheme.of(
                                                  context)
                                              .labelSmall
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
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
                                          errorStyle: FlutterFlowTheme.of(
                                                  context)
                                              .labelSmall
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
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
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .alternate,
                                              width: 1.0,
                                            ),
                                            borderRadius:
                                                BorderRadius.circular(12.0),
                                          ),
                                          focusedBorder: OutlineInputBorder(
                                            borderSide: BorderSide(
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .primary,
                                              width: 1.0,
                                            ),
                                            borderRadius:
                                                BorderRadius.circular(12.0),
                                          ),
                                          errorBorder: OutlineInputBorder(
                                            borderSide: BorderSide(
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .error,
                                              width: 1.0,
                                            ),
                                            borderRadius:
                                                BorderRadius.circular(12.0),
                                          ),
                                          focusedErrorBorder:
                                              OutlineInputBorder(
                                            borderSide: BorderSide(
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .error,
                                              width: 1.0,
                                            ),
                                            borderRadius:
                                                BorderRadius.circular(12.0),
                                          ),
                                          filled: true,
                                          fillColor:
                                              FlutterFlowTheme.of(context)
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
                                              color:
                                                  FlutterFlowTheme.of(context)
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
                                        validator: _model
                                            .nameTextControllerValidator
                                            .asValidator(context),
                                      ),
                                    ),
                                  ].divide(SizedBox(height: 4.0)),
                                ),
                              ),
                            ].divide(SizedBox(width: 16.0)),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                0.0, 16.0, 0.0, 0.0),
                            child: Row(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                Expanded(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.max,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        FFLocalizations.of(context).getText(
                                          'x0sm9p3u' /* Telefone */,
                                        ),
                                        style: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight: FontWeight.w500,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .bodyMedium
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight: FontWeight.w500,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .bodyMedium
                                                      .fontStyle,
                                            ),
                                      ),
                                      Container(
                                        width:
                                            MediaQuery.sizeOf(context).width *
                                                1.0,
                                        child: TextFormField(
                                          controller:
                                              _model.telefoneTextController,
                                          focusNode: _model.telefoneFocusNode,
                                          autofocus: false,
                                          obscureText: false,
                                          decoration: InputDecoration(
                                            labelStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontStyle,
                                                      ),
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontStyle,
                                                    ),
                                            hintText:
                                                FFLocalizations.of(context)
                                                    .getText(
                                              'wmui1mck' /* (12) 3 4567-8912 */,
                                            ),
                                            hintStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .secondaryText,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontStyle,
                                                    ),
                                            errorStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .error,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontStyle,
                                                    ),
                                            counterStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .secondaryText,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontStyle,
                                                    ),
                                            enabledBorder: OutlineInputBorder(
                                              borderSide: BorderSide(
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .alternate,
                                                width: 1.0,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(12.0),
                                            ),
                                            focusedBorder: OutlineInputBorder(
                                              borderSide: BorderSide(
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .primary,
                                                width: 1.0,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(12.0),
                                            ),
                                            errorBorder: OutlineInputBorder(
                                              borderSide: BorderSide(
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .error,
                                                width: 1.0,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(12.0),
                                            ),
                                            focusedErrorBorder:
                                                OutlineInputBorder(
                                              borderSide: BorderSide(
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .error,
                                                width: 1.0,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(12.0),
                                            ),
                                            filled: true,
                                            fillColor:
                                                FlutterFlowTheme.of(context)
                                                    .primaryBackground,
                                          ),
                                          style: FlutterFlowTheme.of(context)
                                              .labelSmall
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontStyle,
                                                ),
                                                color:
                                                    FlutterFlowTheme.of(context)
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
                                          maxLength: 16,
                                          maxLengthEnforcement:
                                              MaxLengthEnforcement.enforced,
                                          buildCounter: (context,
                                                  {required currentLength,
                                                  required isFocused,
                                                  maxLength}) =>
                                              null,
                                          keyboardType: TextInputType.number,
                                          validator: _model
                                              .telefoneTextControllerValidator
                                              .asValidator(context),
                                          inputFormatters: [
                                            _model.telefoneMask
                                          ],
                                        ),
                                      ),
                                    ].divide(SizedBox(height: 4.0)),
                                  ),
                                ),
                                Expanded(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.max,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        FFLocalizations.of(context).getText(
                                          'rgwef68m' /* Email */,
                                        ),
                                        style: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight: FontWeight.w500,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .bodyMedium
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight: FontWeight.w500,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .bodyMedium
                                                      .fontStyle,
                                            ),
                                      ),
                                      Container(
                                        width:
                                            MediaQuery.sizeOf(context).width *
                                                1.0,
                                        child: TextFormField(
                                          controller:
                                              _model.emailAddressTextController,
                                          focusNode:
                                              _model.emailAddressFocusNode,
                                          autofocus: false,
                                          autofillHints: [AutofillHints.email],
                                          obscureText: false,
                                          decoration: InputDecoration(
                                            labelStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontStyle,
                                                      ),
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontStyle,
                                                    ),
                                            hintText:
                                                FFLocalizations.of(context)
                                                    .getText(
                                              'r8x9n5x1' /* novo@email.com */,
                                            ),
                                            errorStyle:
                                                FlutterFlowTheme.of(context)
                                                    .labelSmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            FlutterFlowTheme.of(
                                                                    context)
                                                                .labelSmall
                                                                .fontStyle,
                                                      ),
                                                      color:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .error,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .fontStyle,
                                                    ),
                                            enabledBorder: OutlineInputBorder(
                                              borderSide: BorderSide(
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .alternate,
                                                width: 1.0,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(12.0),
                                            ),
                                            focusedBorder: OutlineInputBorder(
                                              borderSide: BorderSide(
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .primary,
                                                width: 1.0,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(12.0),
                                            ),
                                            errorBorder: OutlineInputBorder(
                                              borderSide: BorderSide(
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .error,
                                                width: 1.0,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(12.0),
                                            ),
                                            focusedErrorBorder:
                                                OutlineInputBorder(
                                              borderSide: BorderSide(
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .error,
                                                width: 1.0,
                                              ),
                                              borderRadius:
                                                  BorderRadius.circular(12.0),
                                            ),
                                            filled: true,
                                            fillColor:
                                                FlutterFlowTheme.of(context)
                                                    .primaryBackground,
                                          ),
                                          style: FlutterFlowTheme.of(context)
                                              .labelSmall
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelSmall
                                                          .fontStyle,
                                                ),
                                                color:
                                                    FlutterFlowTheme.of(context)
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
                                              TextInputType.emailAddress,
                                          validator: _model
                                              .emailAddressTextControllerValidator
                                              .asValidator(context),
                                        ),
                                      ),
                                    ].divide(SizedBox(height: 4.0)),
                                  ),
                                ),
                              ].divide(SizedBox(width: 12.0)),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                0.0, 16.0, 0.0, 0.0),
                            child: Column(
                              mainAxisSize: MainAxisSize.max,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  FFLocalizations.of(context).getText(
                                    'ghgi7mnr' /* Tipos de cargo */,
                                  ),
                                  style: FlutterFlowTheme.of(context)
                                      .bodyMedium
                                      .override(
                                        font: GoogleFonts.lexend(
                                          fontWeight: FontWeight.w500,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .bodyMedium
                                                  .fontStyle,
                                        ),
                                        color: FlutterFlowTheme.of(context)
                                            .primaryText,
                                        letterSpacing: 0.0,
                                        fontWeight: FontWeight.w500,
                                        fontStyle: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .fontStyle,
                                      ),
                                ),
                                Container(
                                  child: FlutterFlowDropDown<int>(
                                    controller:
                                        _model.dropRolesValueController ??=
                                            FormFieldController<int>(
                                      _model.dropRolesValue ??=
                                          valueOrDefault<int>(
                                        widget!.typePage == 'edit'
                                            ? widget!.roleId
                                            : 0,
                                        0,
                                      ),
                                    ),
                                    options: List<int>.from(_model.listRoles
                                        .map((e) => e.id)
                                        .toList()),
                                    optionLabels: _model.listRoles
                                        .map((e) => e.role)
                                        .toList(),
                                    onChanged: (val) async {
                                      safeSetState(
                                          () => _model.dropRolesValue = val);
                                      if (_model.dropRolesValue != 0) {
                                        _model.erroCargo = false;
                                        safeSetState(() {});
                                      }
                                    },
                                    width:
                                        MediaQuery.sizeOf(context).width * 1.0,
                                    height: 48.0,
                                    maxHeight: 250.0,
                                    searchHintTextStyle:
                                        FlutterFlowTheme.of(context)
                                            .labelMedium
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .labelMedium
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .labelMedium
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .labelMedium
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .labelMedium
                                                      .fontStyle,
                                            ),
                                    searchTextStyle:
                                        FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .bodyMedium
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .bodyMedium
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .bodyMedium
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .bodyMedium
                                                      .fontStyle,
                                            ),
                                    textStyle: FlutterFlowTheme.of(context)
                                        .bodySmall
                                        .override(
                                          font: GoogleFonts.lexend(
                                            fontWeight:
                                                FlutterFlowTheme.of(context)
                                                    .bodySmall
                                                    .fontWeight,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .bodySmall
                                                    .fontStyle,
                                          ),
                                          color: FlutterFlowTheme.of(context)
                                              .primaryText,
                                          letterSpacing: 0.0,
                                          fontWeight:
                                              FlutterFlowTheme.of(context)
                                                  .bodySmall
                                                  .fontWeight,
                                          fontStyle:
                                              FlutterFlowTheme.of(context)
                                                  .bodySmall
                                                  .fontStyle,
                                        ),
                                    hintText:
                                        FFLocalizations.of(context).getText(
                                      'patqor33' /* Selecione um cargo */,
                                    ),
                                    searchHintText:
                                        FFLocalizations.of(context).getText(
                                      '6ny4cj95' /* Procurar... */,
                                    ),
                                    icon: Icon(
                                      Icons.keyboard_arrow_down_rounded,
                                      color: FlutterFlowTheme.of(context)
                                          .secondaryText,
                                      size: 24.0,
                                    ),
                                    fillColor: FlutterFlowTheme.of(context)
                                        .primaryBackground,
                                    elevation: 2.0,
                                    borderColor: _model.erroCargo
                                        ? FlutterFlowTheme.of(context).error
                                        : FlutterFlowTheme.of(context)
                                            .alternate,
                                    borderWidth: 1.0,
                                    borderRadius: 12.0,
                                    margin: EdgeInsetsDirectional.fromSTEB(
                                        12.0, 0.0, 12.0, 0.0),
                                    hidesUnderline: true,
                                    isOverButton: false,
                                    isSearchable: true,
                                    isMultiSelect: false,
                                  ),
                                ),
                                if (_model.erroCargo)
                                  Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        12.0, 0.0, 0.0, 0.0),
                                    child: Text(
                                      FFLocalizations.of(context).getText(
                                        'phd6zn5h' /* *Campo obrigatório */,
                                      ),
                                      style: FlutterFlowTheme.of(context)
                                          .bodyMedium
                                          .override(
                                            font: GoogleFonts.lexend(
                                              fontWeight: FontWeight.w500,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .bodyMedium
                                                      .fontStyle,
                                            ),
                                            color: FlutterFlowTheme.of(context)
                                                .error,
                                            fontSize: 12.0,
                                            letterSpacing: 0.0,
                                            fontWeight: FontWeight.w500,
                                            fontStyle:
                                                FlutterFlowTheme.of(context)
                                                    .bodyMedium
                                                    .fontStyle,
                                          ),
                                    ),
                                  ),
                              ].divide(SizedBox(height: 4.0)),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                0.0, 16.0, 0.0, 0.0),
                            child: Row(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                Expanded(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.max,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        FFLocalizations.of(context).getText(
                                          'tiyjpyru' /* Tipos de acesso */,
                                        ),
                                        style: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight: FontWeight.w500,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .bodyMedium
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight: FontWeight.w500,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .bodyMedium
                                                      .fontStyle,
                                            ),
                                      ),
                                      FlutterFlowDropDown<int>(
                                        controller:
                                            _model.dropSystemValueController ??=
                                                FormFieldController<int>(
                                          _model.dropSystemValue ??=
                                              valueOrDefault<int>(
                                            widget!.typePage == 'edit'
                                                ? widget!.typeAcessId
                                                : 0,
                                            0,
                                          ),
                                        ),
                                        options: List<int>.from(_model
                                            .listTypeAcess
                                            .map((e) => e.id)
                                            .toList()),
                                        optionLabels: _model.listTypeAcess
                                            .map((e) => e.env)
                                            .toList(),
                                        onChanged: (val) async {
                                          safeSetState(() =>
                                              _model.dropSystemValue = val);
                                          if (_model.dropSystemValue != 0) {
                                            _model.erroTipoAcesso = false;
                                            safeSetState(() {});
                                          }
                                        },
                                        width:
                                            MediaQuery.sizeOf(context).width *
                                                1.0,
                                        height: 48.0,
                                        maxHeight: 250.0,
                                        textStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .bodySmall
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .bodySmall
                                                        .fontStyle,
                                              ),
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .primaryText,
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .bodySmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .bodySmall
                                                      .fontStyle,
                                            ),
                                        hintText:
                                            FFLocalizations.of(context).getText(
                                          'vfbq3e4t' /* Selecione um tipo de acesso */,
                                        ),
                                        icon: Icon(
                                          Icons.keyboard_arrow_down_rounded,
                                          color: FlutterFlowTheme.of(context)
                                              .secondaryText,
                                          size: 24.0,
                                        ),
                                        fillColor: FlutterFlowTheme.of(context)
                                            .primaryBackground,
                                        elevation: 2.0,
                                        borderColor: _model.erroTipoAcesso
                                            ? FlutterFlowTheme.of(context).error
                                            : FlutterFlowTheme.of(context)
                                                .alternate,
                                        borderWidth: 1.0,
                                        borderRadius: 12.0,
                                        margin: EdgeInsetsDirectional.fromSTEB(
                                            12.0, 0.0, 12.0, 0.0),
                                        hidesUnderline: true,
                                        isOverButton: false,
                                        isSearchable: false,
                                        isMultiSelect: false,
                                      ),
                                      if (_model.erroTipoAcesso)
                                        Expanded(
                                          child: Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    12.0, 0.0, 0.0, 0.0),
                                            child: Text(
                                              FFLocalizations.of(context)
                                                  .getText(
                                                'tomjzeoe' /* *Campo obrigatório */,
                                              ),
                                              style: FlutterFlowTheme.of(
                                                      context)
                                                  .bodyMedium
                                                  .override(
                                                    font: GoogleFonts.lexend(
                                                      fontWeight:
                                                          FontWeight.w500,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .bodyMedium
                                                              .fontStyle,
                                                    ),
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .error,
                                                    fontSize: 12.0,
                                                    letterSpacing: 0.0,
                                                    fontWeight: FontWeight.w500,
                                                    fontStyle:
                                                        FlutterFlowTheme.of(
                                                                context)
                                                            .bodyMedium
                                                            .fontStyle,
                                                  ),
                                            ),
                                          ),
                                        ),
                                    ].divide(SizedBox(height: 4.0)),
                                  ),
                                ),
                                Expanded(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.max,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        FFLocalizations.of(context).getText(
                                          'aykjk1mv' /* Niveis de acesso */,
                                        ),
                                        style: FlutterFlowTheme.of(context)
                                            .bodyMedium
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight: FontWeight.w500,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .bodyMedium
                                                        .fontStyle,
                                              ),
                                              letterSpacing: 0.0,
                                              fontWeight: FontWeight.w500,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .bodyMedium
                                                      .fontStyle,
                                            ),
                                      ),
                                      FlutterFlowDropDown<int>(
                                        controller: _model
                                                .dropControlValueController ??=
                                            FormFieldController<int>(
                                          _model.dropControlValue ??=
                                              valueOrDefault<int>(
                                            widget!.typePage == 'edit'
                                                ? widget!.controlAcessId
                                                : 0,
                                            0,
                                          ),
                                        ),
                                        options: List<int>.from(_model
                                            .listControlSystem
                                            .map((e) => e.id)
                                            .toList()),
                                        optionLabels: _model.listControlSystem
                                            .map((e) => e.accessLevel)
                                            .toList(),
                                        onChanged: (val) async {
                                          safeSetState(() =>
                                              _model.dropControlValue = val);
                                          if (_model.dropControlValue != 0) {
                                            _model.erroNivelAcesso = false;
                                            safeSetState(() {});
                                          }
                                        },
                                        width:
                                            MediaQuery.sizeOf(context).width *
                                                1.0,
                                        height: 48.0,
                                        maxHeight: 250.0,
                                        textStyle: FlutterFlowTheme.of(context)
                                            .bodySmall
                                            .override(
                                              font: GoogleFonts.lexend(
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .bodySmall
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .bodySmall
                                                        .fontStyle,
                                              ),
                                              color:
                                                  FlutterFlowTheme.of(context)
                                                      .primaryText,
                                              letterSpacing: 0.0,
                                              fontWeight:
                                                  FlutterFlowTheme.of(context)
                                                      .bodySmall
                                                      .fontWeight,
                                              fontStyle:
                                                  FlutterFlowTheme.of(context)
                                                      .bodySmall
                                                      .fontStyle,
                                            ),
                                        hintText:
                                            FFLocalizations.of(context).getText(
                                          'd7qt1lfh' /* Selecione o nível de acesso */,
                                        ),
                                        icon: Icon(
                                          Icons.keyboard_arrow_down_rounded,
                                          color: FlutterFlowTheme.of(context)
                                              .secondaryText,
                                          size: 24.0,
                                        ),
                                        fillColor: FlutterFlowTheme.of(context)
                                            .primaryBackground,
                                        elevation: 2.0,
                                        borderColor: _model.erroNivelAcesso
                                            ? FlutterFlowTheme.of(context).error
                                            : FlutterFlowTheme.of(context)
                                                .alternate,
                                        borderWidth: 1.0,
                                        borderRadius: 12.0,
                                        margin: EdgeInsetsDirectional.fromSTEB(
                                            12.0, 0.0, 12.0, 0.0),
                                        hidesUnderline: true,
                                        isOverButton: false,
                                        isSearchable: false,
                                        isMultiSelect: false,
                                      ),
                                      if (_model.erroNivelAcesso)
                                        Expanded(
                                          child: Padding(
                                            padding:
                                                EdgeInsetsDirectional.fromSTEB(
                                                    12.0, 0.0, 0.0, 0.0),
                                            child: Text(
                                              FFLocalizations.of(context)
                                                  .getText(
                                                'n7r00bbo' /* *Campo obrigatório */,
                                              ),
                                              style: FlutterFlowTheme.of(
                                                      context)
                                                  .bodyMedium
                                                  .override(
                                                    font: GoogleFonts.lexend(
                                                      fontWeight:
                                                          FontWeight.w500,
                                                      fontStyle:
                                                          FlutterFlowTheme.of(
                                                                  context)
                                                              .bodyMedium
                                                              .fontStyle,
                                                    ),
                                                    color: FlutterFlowTheme.of(
                                                            context)
                                                        .error,
                                                    fontSize: 12.0,
                                                    letterSpacing: 0.0,
                                                    fontWeight: FontWeight.w500,
                                                    fontStyle:
                                                        FlutterFlowTheme.of(
                                                                context)
                                                            .bodyMedium
                                                            .fontStyle,
                                                  ),
                                            ),
                                          ),
                                        ),
                                    ].divide(SizedBox(height: 4.0)),
                                  ),
                                ),
                              ].divide(SizedBox(width: 12.0)),
                            ),
                          ),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(
                                0.0, 16.0, 0.0, 0.0),
                            child: Row(
                              mainAxisSize: MainAxisSize.max,
                              children: [
                                if (widget!.typePage == 'creat')
                                  Expanded(
                                    child: Builder(
                                      builder: (context) => FFButtonWidget(
                                        onPressed: () async {
                                          var _shouldSetState = false;
                                          _model.erroCargo = false;
                                          _model.erroTipoAcesso = false;
                                          _model.erroNivelAcesso = false;
                                          safeSetState(() {});
                                          if ((_model.dropRolesValue == 0) ||
                                              (_model.dropSystemValue == 0) ||
                                              (_model.dropControlValue == 0)) {
                                            _model.erroCargo =
                                                _model.dropRolesValue == 0
                                                    ? true
                                                    : false;
                                            _model.erroTipoAcesso =
                                                _model.dropSystemValue == 0
                                                    ? true
                                                    : false;
                                            _model.erroNivelAcesso =
                                                _model.dropControlValue == 0
                                                    ? true
                                                    : false;
                                            safeSetState(() {});
                                            if (_model.formKey.currentState ==
                                                    null ||
                                                !_model.formKey.currentState!
                                                    .validate()) {
                                              return;
                                            }
                                            if (_shouldSetState)
                                              safeSetState(() {});
                                            return;
                                          } else if ((_model
                                                          .nameTextController.text ==
                                                      null ||
                                                  _model.nameTextController
                                                          .text ==
                                                      '') ||
                                              (_model.telefoneTextController
                                                          .text ==
                                                      null ||
                                                  _model.telefoneTextController
                                                          .text ==
                                                      '') ||
                                              (_model.emailAddressTextController
                                                          .text ==
                                                      null ||
                                                  _model.emailAddressTextController
                                                          .text ==
                                                      '')) {
                                            if (_model.formKey.currentState ==
                                                    null ||
                                                !_model.formKey.currentState!
                                                    .validate()) {
                                              return;
                                            }
                                            if (_shouldSetState)
                                              safeSetState(() {});
                                            return;
                                          }

                                          if (widget!.typePage2 == '1') {
                                            _model.aPiAddUser1 = await UserGroup
                                                .addUsersCall
                                                .call(
                                              bearerAuth: FFAppState().token,
                                              name: _model
                                                  .nameTextController.text,
                                              phone: _model
                                                  .telefoneTextController.text,
                                              email: _model
                                                  .emailAddressTextController
                                                  .text,
                                              usersRolesId:
                                                  _model.dropRolesValue,
                                              usersSystemAccessId:
                                                  _model.dropSystemValue,
                                              profilePicture: _model
                                                  .uploadedLocalFile_uploadDataP,
                                              usersControlSystemId:
                                                  _model.dropControlValue,
                                              projectsId: 0,
                                              companyId: FFAppState()
                                                  .infoUser
                                                  .companyId,
                                            );

                                            _shouldSetState = true;
                                            if (!(_model
                                                    .aPiAddUser1?.succeeded ??
                                                true)) {
                                              await showDialog(
                                                context: context,
                                                builder: (dialogContext) {
                                                  return Dialog(
                                                    elevation: 0,
                                                    insetPadding:
                                                        EdgeInsets.zero,
                                                    backgroundColor:
                                                        Colors.transparent,
                                                    alignment:
                                                        AlignmentDirectional(
                                                                0.0, 0.0)
                                                            .resolve(
                                                                Directionality.of(
                                                                    context)),
                                                    child: ModalInfoWidget(
                                                      title: FFLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'u7xxvjt6' /* Erro! */,
                                                      ),
                                                      description: getJsonField(
                                                        (_model.aPiAddUser1
                                                                ?.jsonBody ??
                                                            ''),
                                                        r'''$.message''',
                                                      ).toString(),
                                                    ),
                                                  );
                                                },
                                              );

                                              if (_shouldSetState)
                                                safeSetState(() {});
                                              return;
                                            }

                                            context.pushNamed(
                                              FuncionarioWidget.routeName,
                                              extra: <String, dynamic>{
                                                kTransitionInfoKey:
                                                    TransitionInfo(
                                                  hasTransition: true,
                                                  transitionType:
                                                      PageTransitionType.fade,
                                                  duration:
                                                      Duration(milliseconds: 0),
                                                ),
                                              },
                                            );

                                            if (_shouldSetState)
                                              safeSetState(() {});
                                            return;
                                          } else if (widget!.typePage2 == '2') {
                                            _model.lideres = await UserGroup
                                                .addUsersCall
                                                .call(
                                              bearerAuth: FFAppState().token,
                                              name: _model
                                                  .nameTextController.text,
                                              phone: _model
                                                  .telefoneTextController.text,
                                              email: _model
                                                  .emailAddressTextController
                                                  .text,
                                              usersRolesId:
                                                  _model.dropRolesValue,
                                              usersSystemAccessId:
                                                  _model.dropSystemValue,
                                              profilePicture: _model
                                                  .uploadedLocalFile_uploadDataP,
                                              usersControlSystemId:
                                                  _model.dropControlValue,
                                              projectsId:
                                                  FFAppState().projectsInfo.id,
                                              companyId: FFAppState()
                                                  .infoUser
                                                  .companyId,
                                              teamsId: FFAppState().teamId,
                                              isLeader: true,
                                            );

                                            _shouldSetState = true;
                                            if (!(_model.lideres?.succeeded ??
                                                true)) {
                                              await showDialog(
                                                context: context,
                                                builder: (dialogContext) {
                                                  return Dialog(
                                                    elevation: 0,
                                                    insetPadding:
                                                        EdgeInsets.zero,
                                                    backgroundColor:
                                                        Colors.transparent,
                                                    alignment:
                                                        AlignmentDirectional(
                                                                0.0, 0.0)
                                                            .resolve(
                                                                Directionality.of(
                                                                    context)),
                                                    child: ModalInfoWidget(
                                                      title: FFLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'f8leuwue' /* Erro! */,
                                                      ),
                                                      description: getJsonField(
                                                        (_model.lideres
                                                                ?.jsonBody ??
                                                            ''),
                                                        r'''$.message''',
                                                      ).toString(),
                                                    ),
                                                  );
                                                },
                                              );

                                              if (_shouldSetState)
                                                safeSetState(() {});
                                              return;
                                            }
                                          } else {
                                            _model.funcionarioEquipe =
                                                await UserGroup.addUsersCall
                                                    .call(
                                              bearerAuth: FFAppState().token,
                                              name: _model
                                                  .nameTextController.text,
                                              phone: _model
                                                  .telefoneTextController.text,
                                              email: _model
                                                  .emailAddressTextController
                                                  .text,
                                              usersRolesId:
                                                  _model.dropRolesValue,
                                              usersSystemAccessId:
                                                  _model.dropSystemValue,
                                              profilePicture: _model
                                                  .uploadedLocalFile_uploadDataP,
                                              usersControlSystemId:
                                                  _model.dropControlValue,
                                              projectsId:
                                                  FFAppState().projectsInfo.id,
                                              companyId: FFAppState()
                                                  .infoUser
                                                  .companyId,
                                              teamsId: FFAppState().teamId,
                                              isLeader: false,
                                            );

                                            _shouldSetState = true;
                                            if (!(_model.funcionarioEquipe
                                                    ?.succeeded ??
                                                true)) {
                                              await showDialog(
                                                context: context,
                                                builder: (dialogContext) {
                                                  return Dialog(
                                                    elevation: 0,
                                                    insetPadding:
                                                        EdgeInsets.zero,
                                                    backgroundColor:
                                                        Colors.transparent,
                                                    alignment:
                                                        AlignmentDirectional(
                                                                0.0, 0.0)
                                                            .resolve(
                                                                Directionality.of(
                                                                    context)),
                                                    child: ModalInfoWidget(
                                                      title: FFLocalizations.of(
                                                              context)
                                                          .getText(
                                                        'jllfyq5c' /* Erro! */,
                                                      ),
                                                      description: getJsonField(
                                                        (_model.funcionarioEquipe
                                                                ?.jsonBody ??
                                                            ''),
                                                        r'''$.message''',
                                                      ).toString(),
                                                    ),
                                                  );
                                                },
                                              );

                                              if (_shouldSetState)
                                                safeSetState(() {});
                                              return;
                                            }
                                          }

                                          context.pushNamed(
                                            GestaoDeEquipeWidget.routeName,
                                            extra: <String, dynamic>{
                                              kTransitionInfoKey:
                                                  TransitionInfo(
                                                hasTransition: true,
                                                transitionType:
                                                    PageTransitionType.fade,
                                                duration:
                                                    Duration(milliseconds: 0),
                                              ),
                                            },
                                          );

                                          if (_shouldSetState)
                                            safeSetState(() {});
                                        },
                                        text:
                                            FFLocalizations.of(context).getText(
                                          'y9lx4lbf' /* Cadastrar usuário */,
                                        ),
                                        options: FFButtonOptions(
                                          width: double.infinity,
                                          height: 40.0,
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  0.0, 0.0, 0.0, 0.0),
                                          iconPadding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  0.0, 0.0, 0.0, 0.0),
                                          color: FlutterFlowTheme.of(context)
                                              .primary,
                                          textStyle: FlutterFlowTheme.of(
                                                  context)
                                              .labelMedium
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelMedium
                                                          .fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelMedium
                                                          .fontStyle,
                                                ),
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .info,
                                                letterSpacing: 0.0,
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .labelMedium
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .labelMedium
                                                        .fontStyle,
                                              ),
                                          elevation: 3.0,
                                          borderSide: BorderSide(
                                            color: Colors.transparent,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                        ),
                                      ),
                                    ),
                                  ),
                                if (widget!.typePage == 'edit')
                                  Expanded(
                                    child: Builder(
                                      builder: (context) => FFButtonWidget(
                                        onPressed: () async {
                                          var _shouldSetState = false;
                                          _model.erroCargo = false;
                                          _model.erroTipoAcesso = false;
                                          _model.erroNivelAcesso = false;
                                          safeSetState(() {});
                                          if ((_model.dropRolesValue == 0) ||
                                              (_model.dropSystemValue == 0) ||
                                              (_model.dropControlValue == 0)) {
                                            _model.erroCargo =
                                                _model.dropRolesValue == 0
                                                    ? true
                                                    : false;
                                            _model.erroTipoAcesso =
                                                _model.dropSystemValue == 0
                                                    ? true
                                                    : false;
                                            _model.erroNivelAcesso =
                                                _model.dropControlValue == 0
                                                    ? true
                                                    : false;
                                            safeSetState(() {});
                                            if (_model.formKey.currentState ==
                                                    null ||
                                                !_model.formKey.currentState!
                                                    .validate()) {
                                              return;
                                            }
                                            if (_shouldSetState)
                                              safeSetState(() {});
                                            return;
                                          } else if ((_model
                                                          .nameTextController.text ==
                                                      null ||
                                                  _model.nameTextController
                                                          .text ==
                                                      '') ||
                                              (_model.telefoneTextController
                                                          .text ==
                                                      null ||
                                                  _model.telefoneTextController
                                                          .text ==
                                                      '') ||
                                              (_model.emailAddressTextController
                                                          .text ==
                                                      null ||
                                                  _model.emailAddressTextController
                                                          .text ==
                                                      '')) {
                                            if (_model.formKey.currentState ==
                                                    null ||
                                                !_model.formKey.currentState!
                                                    .validate()) {
                                              return;
                                            }
                                            if (_shouldSetState)
                                              safeSetState(() {});
                                            return;
                                          }

                                          _model.aPiAttUser = await UserGroup
                                              .patchUsersCall
                                              .call(
                                            usersId: widget!.id,
                                            bearerAuth: FFAppState().token,
                                            name:
                                                _model.nameTextController.text,
                                            phone: _model
                                                .telefoneTextController.text,
                                            profilePicture: _model
                                                .uploadedLocalFile_uploadDataP,
                                            usersControlSystemId:
                                                _model.dropControlValue,
                                            usersRolesId: _model.dropRolesValue,
                                            usersSystemAccessId:
                                                _model.dropSystemValue,
                                            email: _model
                                                .emailAddressTextController
                                                .text,
                                            projectsId: 0,
                                            companyId:
                                                FFAppState().infoUser.companyId,
                                          );

                                          _shouldSetState = true;
                                          if ((_model.aPiAttUser?.succeeded ??
                                              true)) {
                                            if (widget!.id ==
                                                FFAppState().infoUser.id) {
                                              FFAppState().updateInfoUserStruct(
                                                (e) => e
                                                  ..name = _model
                                                      .nameTextController.text
                                                  ..email = _model
                                                      .emailAddressTextController
                                                      .text
                                                  ..phone = _model
                                                      .telefoneTextController
                                                      .text
                                                  ..usersSystemAccessId =
                                                      _model.dropSystemValue
                                                  ..usersControlSystemId =
                                                      _model.dropControlValue
                                                  ..usersRolesId =
                                                      _model.dropRolesValue
                                                  ..url = getJsonField(
                                                    (_model.aPiAttUser
                                                            ?.jsonBody ??
                                                        ''),
                                                    r'''$.profile_picture.url''',
                                                  ).toString(),
                                              );
                                              FFAppState().update(() {});
                                            }
                                            if (widget!.typePage2 == '1') {
                                              context.pushNamed(
                                                FuncionarioWidget.routeName,
                                                extra: <String, dynamic>{
                                                  kTransitionInfoKey:
                                                      TransitionInfo(
                                                    hasTransition: true,
                                                    transitionType:
                                                        PageTransitionType.fade,
                                                    duration: Duration(
                                                        milliseconds: 0),
                                                  ),
                                                },
                                              );
                                            } else {
                                              context.pushNamed(
                                                GestaoDeEquipeWidget.routeName,
                                                extra: <String, dynamic>{
                                                  kTransitionInfoKey:
                                                      TransitionInfo(
                                                    hasTransition: true,
                                                    transitionType:
                                                        PageTransitionType.fade,
                                                    duration: Duration(
                                                        milliseconds: 0),
                                                  ),
                                                },
                                              );
                                            }
                                          } else {
                                            await showDialog(
                                              context: context,
                                              builder: (dialogContext) {
                                                return Dialog(
                                                  elevation: 0,
                                                  insetPadding: EdgeInsets.zero,
                                                  backgroundColor:
                                                      Colors.transparent,
                                                  alignment:
                                                      AlignmentDirectional(
                                                              0.0, 0.0)
                                                          .resolve(
                                                              Directionality.of(
                                                                  context)),
                                                  child: ModalInfoWidget(
                                                    title: FFLocalizations.of(
                                                            context)
                                                        .getText(
                                                      'ertjleh2' /* Erro! */,
                                                    ),
                                                    description: getJsonField(
                                                      (_model.aPiAttUser
                                                              ?.jsonBody ??
                                                          ''),
                                                      r'''$.message''',
                                                    ).toString(),
                                                  ),
                                                );
                                              },
                                            );

                                            if (_shouldSetState)
                                              safeSetState(() {});
                                            return;
                                          }

                                          if (_shouldSetState)
                                            safeSetState(() {});
                                        },
                                        text:
                                            FFLocalizations.of(context).getText(
                                          '9ljvayj4' /* Atualizar usuário */,
                                        ),
                                        options: FFButtonOptions(
                                          width: double.infinity,
                                          height: 40.0,
                                          padding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  0.0, 0.0, 0.0, 0.0),
                                          iconPadding:
                                              EdgeInsetsDirectional.fromSTEB(
                                                  0.0, 0.0, 0.0, 0.0),
                                          color: FlutterFlowTheme.of(context)
                                              .primary,
                                          textStyle: FlutterFlowTheme.of(
                                                  context)
                                              .labelMedium
                                              .override(
                                                font: GoogleFonts.lexend(
                                                  fontWeight:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelMedium
                                                          .fontWeight,
                                                  fontStyle:
                                                      FlutterFlowTheme.of(
                                                              context)
                                                          .labelMedium
                                                          .fontStyle,
                                                ),
                                                color:
                                                    FlutterFlowTheme.of(context)
                                                        .info,
                                                letterSpacing: 0.0,
                                                fontWeight:
                                                    FlutterFlowTheme.of(context)
                                                        .labelMedium
                                                        .fontWeight,
                                                fontStyle:
                                                    FlutterFlowTheme.of(context)
                                                        .labelMedium
                                                        .fontStyle,
                                              ),
                                          elevation: 3.0,
                                          borderSide: BorderSide(
                                            color: Colors.transparent,
                                            width: 1.0,
                                          ),
                                          borderRadius:
                                              BorderRadius.circular(12.0),
                                        ),
                                      ),
                                    ),
                                  ),
                              ].divide(SizedBox(width: 12.0)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
