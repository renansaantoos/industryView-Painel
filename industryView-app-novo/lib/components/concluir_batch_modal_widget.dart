import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/modal_info_widget.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/utils/custom_functions.dart' as functions;

class ConcluirBatchModalWidget extends StatefulWidget {
  const ConcluirBatchModalWidget({
    super.key,
    required this.onConfirmed,
  });

  final Future Function() onConfirmed;

  @override
  State<ConcluirBatchModalWidget> createState() =>
      _ConcluirBatchModalWidgetState();
}

class _ConcluirBatchModalWidgetState extends State<ConcluirBatchModalWidget> {
  late List<TextEditingController> _controllers;
  bool _isLoading = false;

  bool _isOfflineResponse(ApiCallResponse? response) {
    return getJsonField(response?.jsonBody, r'''$.offline''') == true;
  }

  void _addOfflineMaskIfNeeded(
    ApiCallResponse? response,
    List<TasksListStruct> tasks,
  ) {
    if (!_isOfflineResponse(response)) return;
    final ids = tasks.map((e) => e.sprintsTasksId).whereType<int>().toList();
    if (ids.isEmpty) return;
    AppState().update(() {
      final current = AppState().offlineMaskedTasksIds.toList();
      for (final id in ids) {
        if (!current.contains(id)) {
          current.add(id);
        }
      }
      AppState().offlineMaskedTasksIds = current;
    });
  }

  @override
  void initState() {
    super.initState();
    final tasks = AppState().tasksfinish;
    _controllers = List.generate(tasks.length, (i) {
      final qty = tasks[i].quantityAssigned;
      return TextEditingController(
        text: qty.truncateToDouble() == qty
            ? qty.toInt().toString()
            : qty.toString(),
      );
    });
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _onConfirm() async {
    setState(() => _isLoading = true);

    // Atualizar quantityDone em cada task do taskslist com o valor digitado
    final tasks = AppState().taskslist.toList();
    for (var i = 0; i < AppState().tasksfinish.length && i < _controllers.length; i++) {
      final finishItem = AppState().tasksfinish[i];
      final qty = double.tryParse(_controllers[i].text) ?? finishItem.quantityAssigned;

      final taskIndex = tasks.indexWhere(
        (t) => t.sprintsTasksId == finishItem.sprintsTasksId,
      );
      if (taskIndex >= 0) {
        AppState().updateTaskslistAtIndex(
          taskIndex,
          (task) => task..quantityDone = qty,
        );
      }
    }

    // Chamar API batch
    final apiResult = await SprintsGroup.atualizaStatusDaSprintTaskCall.call(
      scheduleId: AppState().user.sheduleId,
      token: currentAuthenticationToken,
      tasksListJson: functions
          .retornaJsonTaskList(AppState().taskslist.toList())
          .map((e) => e.toMap())
          .toList(),
    );

    if (apiResult.succeeded) {
      // Vincular tarefas ao schedule do dia
      try {
        final scheduleId = AppState().user.sheduleId;
        if (scheduleId != null && scheduleId != 0) {
          final taskIds = AppState().taskslist
              .map((t) => t.sprintsTasksId)
              .where((id) => id != 0)
              .toList();
          if (taskIds.isNotEmpty) {
            await ProjectsGroup.linkTasksToScheduleCall.call(
              token: currentAuthenticationToken,
              scheduleId: scheduleId,
              sprintsTasksIds: taskIds,
            );
            if (kDebugMode) print('Batch tasks $taskIds linked to schedule $scheduleId');
          }
        }
      } catch (e) {
        if (kDebugMode) print('Error linking batch tasks to schedule: $e');
      }
      _addOfflineMaskIfNeeded(apiResult, AppState().taskslist.toList());
      AppState().comment = '';
      AppState().taskslist = [];
      AppState().tasksfinish = [];
      AppState().update(() {});
      await widget.onConfirmed.call();
      if (mounted) Navigator.pop(context);
    } else {
      setState(() => _isLoading = false);
      if (mounted) {
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
                title: 'Erro',
                description: getJsonField(
                  apiResult.jsonBody,
                  r'''$.message''',
                ).toString(),
              ),
            );
          },
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final tasks = AppState().tasksfinish;

    return Align(
      alignment: AlignmentDirectional(0.0, 0.0),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 24.0),
        child: Material(
          color: Colors.transparent,
          child: Container(
            width: 530.0,
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.8,
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
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header
                Padding(
                  padding: const EdgeInsets.fromLTRB(24.0, 24.0, 24.0, 0.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Concluir Tarefas',
                        style: GoogleFonts.lexend(
                          fontWeight: FontWeight.w600,
                          color: AppTheme.of(context).primaryText,
                          fontSize: 18.0,
                        ),
                      ),
                      InkWell(
                        onTap: () => Navigator.pop(context),
                        borderRadius: BorderRadius.circular(8.0),
                        child: Container(
                          width: 32.0,
                          height: 32.0,
                          decoration: BoxDecoration(
                            color: AppTheme.of(context).secondary,
                            borderRadius: BorderRadius.circular(8.0),
                            border: Border.all(
                              color: AppTheme.of(context).primary,
                            ),
                          ),
                          alignment: Alignment.center,
                          child: Icon(
                            Icons.close,
                            color: AppTheme.of(context).primary,
                            size: 16.0,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
                  child: Divider(
                    color: AppTheme.of(context).alternate,
                    height: 1.0,
                  ),
                ),
                // Lista de tarefas scrollável
                Flexible(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24.0),
                    child: ListView.separated(
                      shrinkWrap: true,
                      itemCount: tasks.length,
                      separatorBuilder: (_, __) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Divider(
                          color: AppTheme.of(context).alternate.withOpacity(0.5),
                          height: 1.0,
                        ),
                      ),
                      itemBuilder: (context, index) {
                        final task = tasks[index];
                        final qtyAssigned = task.quantityAssigned;
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Nome da tarefa
                            Text(
                              task.description.isNotEmpty ? task.description : '(Sem nome)',
                              style: GoogleFonts.lexend(
                                color: AppTheme.of(context).primaryText,
                                fontWeight: FontWeight.w600,
                                fontSize: 14.0,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 8.0),
                            // Label: Quantidade Executada (Designado: X)
                            RichText(
                              text: TextSpan(
                                children: [
                                  TextSpan(
                                    text: 'Quantidade Executada  ',
                                    style: GoogleFonts.lexend(
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.of(context).primaryText,
                                      fontSize: 13.0,
                                    ),
                                  ),
                                  TextSpan(
                                    text: '(Designado: ${qtyAssigned.truncateToDouble() == qtyAssigned ? qtyAssigned.toInt() : qtyAssigned})',
                                    style: GoogleFonts.lexend(
                                      color: AppTheme.of(context).secondaryText,
                                      fontSize: 12.0,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 6.0),
                            // TextField numérico
                            TextField(
                              controller: _controllers[index],
                              keyboardType: const TextInputType.numberWithOptions(decimal: true),
                              decoration: InputDecoration(
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8.0),
                                  borderSide: BorderSide(color: AppTheme.of(context).alternate),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8.0),
                                  borderSide: BorderSide(color: AppTheme.of(context).alternate),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8.0),
                                  borderSide: BorderSide(
                                    color: AppTheme.of(context).primary,
                                    width: 2.0,
                                  ),
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: 12.0,
                                  vertical: 10.0,
                                ),
                                isDense: true,
                              ),
                              style: GoogleFonts.lexend(
                                color: AppTheme.of(context).primaryText,
                                fontSize: 14.0,
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ),
                // Botões
                Padding(
                  padding: const EdgeInsets.fromLTRB(24.0, 16.0, 24.0, 24.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextButton(
                          onPressed: _isLoading ? null : () => Navigator.pop(context),
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 14.0),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                          ),
                          child: Text(
                            'Cancelar',
                            style: GoogleFonts.lexend(
                              color: AppTheme.of(context).secondaryText,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12.0),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _isLoading ? null : _onConfirm,
                          icon: _isLoading
                              ? SizedBox(
                                  width: 18.0,
                                  height: 18.0,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.0,
                                    color: Colors.white,
                                  ),
                                )
                              : const Icon(Icons.check_circle_outline, size: 18.0),
                          label: Text(_isLoading ? 'Processando...' : 'Confirmar'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.of(context).primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 14.0),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
                            textStyle: GoogleFonts.lexend(fontWeight: FontWeight.w600),
                          ),
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
    );
  }
}
