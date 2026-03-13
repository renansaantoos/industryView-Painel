import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/components/modal_info_widget.dart';
import '/database/daos/rdo_finalization_dao.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import '/core/utils/upload_data.dart';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'confirmdialog_r_d_o_model.dart';
export 'confirmdialog_r_d_o_model.dart';

class ConfirmdialogRDOWidget extends StatefulWidget {
  const ConfirmdialogRDOWidget({
    super.key,
    required this.action,
    this.listaTasks,
  });

  final Future Function()? action;
  final List<dynamic>? listaTasks;

  @override
  State<ConfirmdialogRDOWidget> createState() => _ConfirmdialogRDOWidgetState();
}

class _ConfirmdialogRDOWidgetState extends State<ConfirmdialogRDOWidget> {
  late ConfirmdialogRDOModel _model;

  @override
  void setState(VoidCallback callback) {
    super.setState(callback);
    _model.onUpdate();
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => ConfirmdialogRDOModel());

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.maybeDispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<AppState>();

    return Align(
      alignment: const AlignmentDirectional(0.0, 0.0),
      child: Padding(
        padding: const EdgeInsetsDirectional.fromSTEB(16.0, 24.0, 16.0, 24.0),
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(
            maxWidth: 530.0,
          ),
          decoration: BoxDecoration(
            color: AppTheme.of(context).secondaryBackground,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.12),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
            borderRadius: BorderRadius.circular(16.0),
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Flexible(
                  child: Padding(
                    padding:
                        const EdgeInsetsDirectional.fromSTEB(24.0, 24.0, 24.0, 16.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsetsDirectional.fromSTEB(
                              0.0, 0.0, 0.0, 16.0),
                          child: Row(
                            mainAxisSize: MainAxisSize.max,
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                width: 32.0,
                                height: 32.0,
                                decoration: BoxDecoration(
                                  color: AppTheme.of(context)
                                      .secondaryBackground,
                                ),
                              ),
                              Align(
                                alignment: const AlignmentDirectional(0.0, 0.0),
                                child: Icon(
                                  Icons.read_more,
                                  color: AppTheme.of(context).primary,
                                  size: 32.0,
                                ),
                              ),
                              Align(
                                alignment: const AlignmentDirectional(1.0, -1.0),
                                child: AppIconButton(
                                  borderColor:
                                      AppTheme.of(context).primary,
                                  borderRadius: 8.0,
                                  buttonSize: 32.0,
                                  fillColor:
                                      AppTheme.of(context).secondary,
                                  icon: Icon(
                                    Icons.close,
                                    color: AppTheme.of(context).primary,
                                    size: 16.0,
                                  ),
                                  onPressed: () async {
                                    Navigator.pop(context);
                                  },
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          AppLocalizations.of(context).getText(
                            '7x2b7c3z' /* Finalizar dia de serviço! */,
                          ),
                          textAlign: TextAlign.start,
                          style: AppTheme.of(context)
                              .headlineSmall
                              .override(
                                font: GoogleFonts.lexend(
                                  fontWeight: AppTheme.of(context)
                                      .headlineSmall
                                      .fontWeight,
                                  fontStyle: AppTheme.of(context)
                                      .headlineSmall
                                      .fontStyle,
                                ),
                                letterSpacing: 0.0,
                                fontWeight: AppTheme.of(context)
                                    .headlineSmall
                                    .fontWeight,
                                fontStyle: AppTheme.of(context)
                                    .headlineSmall
                                    .fontStyle,
                              ),
                        ),
                        Padding(
                          padding: const EdgeInsetsDirectional.fromSTEB(
                              0.0, 16.0, 0.0, 0.0),
                          child: Text(
                            AppLocalizations.of(context).getText(
                              '61j1tqp6' /* Ótimo trabalho hoje. Para fina... */,
                            ),
                            textAlign: TextAlign.center,
                            style: AppTheme.of(context)
                                .labelMedium
                                .override(
                                  font: GoogleFonts.lexend(
                                    fontWeight: AppTheme.of(context)
                                        .labelMedium
                                        .fontWeight,
                                    fontStyle: AppTheme.of(context)
                                        .labelMedium
                                        .fontStyle,
                                  ),
                                  letterSpacing: 0.0,
                                  fontWeight: AppTheme.of(context)
                                      .labelMedium
                                      .fontWeight,
                                  fontStyle: AppTheme.of(context)
                                      .labelMedium
                                      .fontStyle,
                                ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsetsDirectional.fromSTEB(
                              0.0, 16.0, 0.0, 0.0),
                          child: InkWell(
                            splashColor: Colors.transparent,
                            focusColor: Colors.transparent,
                            hoverColor: Colors.transparent,
                            highlightColor: Colors.transparent,
                            onTap: () async {
                              final selectedMedia = await selectMedia(
                                maxWidth: 1200.00,
                                imageQuality: 100,
                                mediaSource: MediaSource.photoGallery,
                                multiImage: true,
                              );
                              if (selectedMedia != null &&
                                  selectedMedia.every((m) => validateFileFormat(
                                      m.storagePath, context))) {
                                safeSetState(() => _model
                                    .isDataUploading_uploadDataYq1 = true);
                                var selectedUploadedFiles = <UploadedFile>[];

                                try {
                                  showUploadMessage(
                                    context,
                                    'Uploading file...',
                                    showLoading: true,
                                  );
                                  selectedUploadedFiles = selectedMedia
                                      .map((m) => UploadedFile(
                                            name: m.storagePath.split('/').last,
                                            bytes: m.bytes,
                                            height: m.dimensions?.height,
                                            width: m.dimensions?.width,
                                            blurHash: m.blurHash,
                                            originalFilename:
                                                m.originalFilename,
                                          ))
                                      .toList();
                                } finally {
                                  ScaffoldMessenger.of(context)
                                      .hideCurrentSnackBar();
                                  _model.isDataUploading_uploadDataYq1 = false;
                                }
                                if (selectedUploadedFiles.length ==
                                    selectedMedia.length) {
                                  safeSetState(() {
                                    _model.uploadedLocalFiles_uploadDataYq1 =
                                        selectedUploadedFiles;
                                  });
                                  showUploadMessage(context, 'Success!');
                                } else {
                                  safeSetState(() {});
                                  showUploadMessage(
                                      context, 'Failed to upload data');
                                  return;
                                }
                              }

                              _model.contador = 0;
                              safeSetState(() {});
                              while (_model.contador <
                                  _model.uploadedLocalFiles_uploadDataYq1
                                      .length) {
                                _model.addToImg(_model
                                    .uploadedLocalFiles_uploadDataYq1
                                    .elementAtOrNull(_model.contador)!);
                                safeSetState(() {});
                                _model.contador = _model.contador + 1;
                                safeSetState(() {});
                              }
                            },
                            child: Container(
                              width: double.infinity,
                              height: 44.0,
                              decoration: BoxDecoration(
                                color: AppTheme.of(context).secondary,
                                borderRadius: BorderRadius.circular(14.0),
                                border: Border.all(
                                  color: AppTheme.of(context).primary,
                                ),
                              ),
                              child: Padding(
                                padding: const EdgeInsetsDirectional.fromSTEB(
                                    0.0, 4.0, 0.0, 4.0),
                                child: Icon(
                                  Icons.add_circle,
                                  color: AppTheme.of(context).primary,
                                  size: 24.0,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Builder(
                          builder: (context) {
                            final listImgs = _model.img.toList();

                            return GridView.builder(
                              padding: const EdgeInsets.fromLTRB(
                                0,
                                8.0,
                                0,
                                8.0,
                              ),
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 3,
                                crossAxisSpacing: 12.0,
                                mainAxisSpacing: 12.0,
                                childAspectRatio: 1.2,
                              ),
                              shrinkWrap: true,
                              scrollDirection: Axis.vertical,
                              itemCount: listImgs.length,
                              itemBuilder: (context, listImgsIndex) {
                                final listImgsItem = listImgs[listImgsIndex];
                                return Container(
                                  width: 70.0,
                                  height: 70.0,
                                  decoration: BoxDecoration(
                                    color: AppTheme.of(context)
                                        .secondaryBackground,
                                    borderRadius: BorderRadius.circular(14.0),
                                    border: Border.all(
                                      color: AppTheme.of(context)
                                          .alternate,
                                    ),
                                  ),
                                  child: Stack(
                                    children: [
                                      ClipRRect(
                                        borderRadius:
                                            BorderRadius.circular(8.0),
                                        child: Image.memory(
                                          listImgsItem.bytes ??
                                              Uint8List.fromList([]),
                                          width: 200.0,
                                          height: 200.0,
                                          fit: BoxFit.cover,
                                        ),
                                      ),
                                      Align(
                                        alignment:
                                            const AlignmentDirectional(1.0, -1.0),
                                        child: Padding(
                                          padding:
                                              const EdgeInsetsDirectional.fromSTEB(
                                                  0.0, 2.0, 2.0, 0.0),
                                          child: InkWell(
                                            splashColor: Colors.transparent,
                                            focusColor: Colors.transparent,
                                            hoverColor: Colors.transparent,
                                            highlightColor: Colors.transparent,
                                            onTap: () async {
                                              _model
                                                  .removeFromImg(listImgsItem);
                                              safeSetState(() {});
                                            },
                                            child: Container(
                                              decoration: BoxDecoration(
                                                color:
                                                    AppTheme.of(context)
                                                        .error,
                                                borderRadius:
                                                    BorderRadius.circular(
                                                        100.0),
                                              ),
                                              child: Padding(
                                                padding: const EdgeInsets.all(4.0),
                                                child: Icon(
                                                  Icons.delete_forever_rounded,
                                                  color: AppTheme.of(
                                                          context)
                                                      .info,
                                                  size: 16.0,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            );
                          },
                        ),
                        Builder(
                          builder: (context) => Padding(
                            padding: const EdgeInsetsDirectional.fromSTEB(
                                0.0, 24.0, 0.0, 0.0),
                            child: AppButton(
                              onPressed: () async {
                                var shouldSetState = false;
                                if (_model.img.length < 3) {
                                  await showDialog(
                                    context: context,
                                    builder: (dialogContext) {
                                      return Dialog(
                                        elevation: 0,
                                        insetPadding: EdgeInsets.zero,
                                        backgroundColor: Colors.transparent,
                                        alignment:
                                            const AlignmentDirectional(0.0, 0.0)
                                                .resolve(
                                                    Directionality.of(context)),
                                        child: ModalInfoWidget(
                                          title: AppLocalizations.of(context)
                                              .getText(
                                            'u4tn1dll' /* Quantidade Mínima de Imagens R... */,
                                          ),
                                          description:
                                              AppLocalizations.of(context)
                                                  .getText(
                                            'ep7kksyg' /* O número mínimo de imagens sol... */,
                                          ),
                                        ),
                                      );
                                    },
                                  );

                                  if (shouldSetState) safeSetState(() {});
                                  return;
                                } else {
                                  _model.contador = 0;
                                  safeSetState(() {});
                                  bool allImagesSuccess = true;
                                  while (_model.contador < _model.img.length) {
                                    _model.editImages =
                                        await ProjectsGroup.addImagensCall.call(
                                      content: _model.img
                                          .elementAtOrNull(_model.contador),
                                      scheduleId: AppState().user.sheduleId,
                                      token: currentAuthenticationToken,
                                    );

                                    shouldSetState = true;
                                    if ((_model.editImages?.succeeded ??
                                        true)) {
                                      _model.contador = _model.contador + 1;
                                      safeSetState(() {});
                                    } else {
                                      allImagesSuccess = false;
                                      _model.contador = _model.contador + 1;
                                      safeSetState(() {});
                                    }
                                  }
                                  
                                  // Só marca como finalizado se todas as imagens foram enviadas com sucesso
                                  if (allImagesSuccess) {
                                    // Enviar batch de tarefas concluídas ao backend
                                    if (widget.listaTasks != null && widget.listaTasks!.isNotEmpty) {
                                      final tasksList = widget.listaTasks!.map((task) {
                                        final taskId = getJsonField(task, r'''$.id''');
                                        final currentStatus = getJsonField(task, r'''$.sprints_tasks_statuses_id''') ?? 3;
                                        return {
                                          'sprints_tasks_id': taskId,
                                          'sprints_tasks_statuses_id': currentStatus,
                                        };
                                      }).toList();

                                      await SprintsGroup.atualizaStatusDaSprintTaskCall.call(
                                        scheduleId: AppState().user.sheduleId,
                                        tasksListJson: tasksList,
                                        token: currentAuthenticationToken,
                                      );
                                    }

                                    // Também enviar tarefas da lista local do AppState (taskslist)
                                    if (AppState().taskslist.isNotEmpty) {
                                      final localTasksList = AppState().taskslist.map((t) => {
                                        'sprints_tasks_id': t.sprintsTasksId,
                                        'sprints_tasks_statuses_id': t.sprintsTasksStatusesId,
                                      }).toList();

                                      await SprintsGroup.atualizaStatusDaSprintTaskCall.call(
                                        scheduleId: AppState().user.sheduleId,
                                        tasksListJson: localTasksList,
                                        token: currentAuthenticationToken,
                                      );
                                    }

                                    final rdoFinalizationDao = RdoFinalizationDao();
                                    await rdoFinalizationDao.markAsFinalizedToday();

                                    // Sinalizar refresh das tarefas
                                    AppState().signalTasksRefresh();
                                  }

                                  await widget.action?.call();
                                  Navigator.pop(context);
                                  if (shouldSetState) safeSetState(() {});
                                  return;
                                }

                                if (shouldSetState) safeSetState(() {});
                              },
                              text: AppLocalizations.of(context).getText(
                                'bfztiwah' /* Finalizar RDO */,
                              ),
                              options: AppButtonOptions(
                                width: double.infinity,
                                height: 48.0,
                                padding: const EdgeInsetsDirectional.fromSTEB(
                                    20.0, 0.0, 20.0, 0.0),
                                iconPadding: const EdgeInsetsDirectional.fromSTEB(
                                    0.0, 0.0, 0.0, 0.0),
                                color: AppTheme.of(context).primary,
                                textStyle: AppTheme.of(context)
                                    .titleSmall
                                    .override(
                                      font: GoogleFonts.lexend(
                                        fontWeight: FontWeight.w600,
                                        fontStyle: AppTheme.of(context)
                                            .titleSmall
                                            .fontStyle,
                                      ),
                                      color: Colors.white,
                                      fontSize: 15.0,
                                      letterSpacing: 0.0,
                                      fontWeight: FontWeight.w600,
                                      fontStyle: AppTheme.of(context)
                                          .titleSmall
                                          .fontStyle,
                                    ),
                                elevation: 0.0,
                                borderSide: const BorderSide(
                                  color: Colors.transparent,
                                ),
                                borderRadius: BorderRadius.circular(14.0),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
