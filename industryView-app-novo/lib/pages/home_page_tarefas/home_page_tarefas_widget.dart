import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/comment_insp_widget.dart';
import '/components/concluir_batch_modal_widget.dart';
import '/components/confirmdialog_widget.dart';
import '/components/empty_widget.dart';
import '/components/logout_widget.dart';
import '/components/modal_info_widget.dart';
import '/components/sem_sucesso_modal_widget.dart';
import '/components/modal_sucess_qrcode_widget.dart';
import '/components/nav_bar_widget.dart';
import '/components/offline_banner_widget.dart';
import '/core/widgets/app_tab_bar.dart';
import '/core/widgets/app_drop_down.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import '/core/widgets/form_field_controller.dart';
import '/services/network_service.dart';
import '/services/rdo_prefetch_service.dart';
import 'dart:ui';
import '/core/actions/index.dart' as actions;
import '/core/utils/custom_functions.dart' as functions;
import '/index.dart';
import '/pages/project_selection/project_selection_widget.dart';
import 'dart:async';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:flutter_barcode_scanner/flutter_barcode_scanner.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'home_page_tarefas_model.dart';
export 'home_page_tarefas_model.dart';

class HomePageTarefasWidget extends StatefulWidget {
  const HomePageTarefasWidget({super.key});

  static String routeName = 'HomePage-Tarefas';
  static String routePath = '/homePageTarefas';

  @override
  State<HomePageTarefasWidget> createState() => _HomePageTarefasWidgetState();
}

class _HomePageTarefasWidgetState extends State<HomePageTarefasWidget>
    with TickerProviderStateMixin {
  late HomePageTarefasModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  /// ID da tarefa que está processando uma ação (loading individual)
  int? _loadingTaskId;

  /// Tipo da ação em loading: 'concluir', 'aprovado', 'reprovado', 'semSucesso'
  String? _loadingAction;

  bool _isOfflineMaskedTask(dynamic item) {
    if (NetworkService.instance.isConnected) {
      return false;
    }
    final taskId = castToType<int>(getJsonField(item, r'''$.id'''));
    if (taskId == null) {
      return false;
    }
    return AppState().offlineMaskedTasksIds.contains(taskId);
  }

  Map<String, dynamic>? _getScheduleStatus(dynamic item) {
    final scheduledFor = getJsonField(item, r'$.scheduled_for')?.toString();
    if (scheduledFor == null || scheduledFor.isEmpty) return null;
    try {
      final scheduled = DateTime.parse(scheduledFor);
      final today = DateTime.now();
      final todayDate = DateTime(today.year, today.month, today.day);
      final scheduledDate = DateTime(scheduled.year, scheduled.month, scheduled.day);
      if (scheduledDate.compareTo(todayDate) >= 0) {
        return {'label': 'Em dia', 'color': const Color(0xFF16A34A), 'bgColor': const Color(0x2622C55E)};
      }
      return {'label': 'Atrasado', 'color': const Color(0xFFDC2626), 'bgColor': const Color(0x26EF4444)};
    } catch (_) { return null; }
  }

  String _getCriticalityLabel(String? criticality) {
    switch (criticality?.toLowerCase()) {
      case 'baixa': return 'Baixa';
      case 'media': return 'Média';
      case 'alta': return 'Alta';
      case 'critica': return 'Crítica';
      default: return '';
    }
  }

  Map<String, Color> _getCriticalityColors(String? criticality) {
    switch (criticality?.toLowerCase()) {
      case 'baixa': return {'bg': const Color(0x2622C55E), 'text': const Color(0xFF16A34A)};
      case 'media': return {'bg': const Color(0x26EAB308), 'text': const Color(0xFFCA8A04)};
      case 'alta': return {'bg': const Color(0x26F97316), 'text': const Color(0xFFEA580C)};
      case 'critica': return {'bg': const Color(0x26EF4444), 'text': const Color(0xFFDC2626)};
      default: return {'bg': const Color(0x1A9CA3AF), 'text': const Color(0xFF6B7280)};
    }
  }

  /// Vincula tarefa ao schedule do dia (schedule_sprints_tasks)
  Future<void> _linkTaskToSchedule(int taskId) async {
    try {
      final scheduleId = AppState().user.sheduleId;
      if (scheduleId == null || scheduleId == 0) return;
      await ProjectsGroup.linkTasksToScheduleCall.call(
        token: currentAuthenticationToken,
        scheduleId: scheduleId,
        sprintsTasksIds: [taskId],
      );
      if (kDebugMode) print('Task $taskId linked to schedule $scheduleId');
    } catch (e) {
      if (kDebugMode) print('Error linking task to schedule: $e');
    }
  }

  /// Modal para concluir tarefa com quantidade executada
  Future<void> _showQuantityCompleteModal(
      BuildContext context, dynamic item, VoidCallback onSuccess) async {
    final taskId = castToType<int>(getJsonField(item, r'$.id')) ?? 0;
    final qtyAssigned =
        castToType<double>(getJsonField(item, r'$.quantity_assigned')) ?? 0.0;
    final taskName = valueOrDefault<String>(
      (getJsonField(item, r'$.projects_backlogs.tasks_template.description') ??
              getJsonField(item, r'$.projects_backlogs.description'))
          ?.toString(),
      '',
    );

    final controller = TextEditingController(
        text: qtyAssigned.truncateToDouble() == qtyAssigned
            ? qtyAssigned.toInt().toString()
            : qtyAssigned.toString());

    final result = await showDialog<double?>(
      context: context,
      barrierDismissible: false,
      barrierColor: const Color(0x80000000),
      builder: (dialogContext) {
        return AlertDialog(
          backgroundColor: AppTheme.of(context).secondaryBackground,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.0),
          ),
          title: Text(
            'Concluir Tarefa',
            style: GoogleFonts.lexend(
              fontWeight: FontWeight.w600,
              color: AppTheme.of(context).primaryText,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Divider(color: AppTheme.of(context).alternate),
              const SizedBox(height: 8.0),
              if (taskName.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: Text(
                    taskName,
                    style: GoogleFonts.lexend(
                      color: AppTheme.of(context).secondaryText,
                      fontSize: 13.0,
                    ),
                  ),
                ),
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: 'Quantidade Executada  ',
                      style: GoogleFonts.lexend(
                        fontWeight: FontWeight.w600,
                        color: AppTheme.of(context).primaryText,
                        fontSize: 14.0,
                      ),
                    ),
                    TextSpan(
                      text:
                          '(Designado: ${qtyAssigned.truncateToDouble() == qtyAssigned ? qtyAssigned.toInt() : qtyAssigned})',
                      style: GoogleFonts.lexend(
                        color: AppTheme.of(context).secondaryText,
                        fontSize: 13.0,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8.0),
              TextField(
                controller: controller,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                autofocus: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8.0),
                    borderSide:
                        BorderSide(color: AppTheme.of(context).alternate),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8.0),
                    borderSide:
                        BorderSide(color: AppTheme.of(context).alternate),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8.0),
                    borderSide: BorderSide(
                        color: AppTheme.of(context).primary, width: 2.0),
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 12.0, vertical: 12.0),
                ),
                style: GoogleFonts.lexend(
                  color: AppTheme.of(context).primaryText,
                  fontSize: 14.0,
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext, null),
              child: Text(
                'Cancelar',
                style: GoogleFonts.lexend(
                  color: AppTheme.of(context).secondaryText,
                ),
              ),
            ),
            ElevatedButton.icon(
              onPressed: () {
                final qty = double.tryParse(controller.text) ?? qtyAssigned;
                Navigator.pop(dialogContext, qty);
              },
              icon: const Icon(Icons.check_circle_outline, size: 18.0),
              label: const Text('Confirmar'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.of(context).primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.0),
                ),
                textStyle: GoogleFonts.lexend(fontWeight: FontWeight.w600),
              ),
            ),
          ],
        );
      },
    );

    if (result == null) return;

    // Ativar loading no card
    safeSetState(() {
      _loadingTaskId = taskId;
      _loadingAction = 'concluir';
    });

    try {
      // Chamar API single para concluir com quantidade
      final apiResult =
          await SprintsGroup.atualizaStatusSingleTaskCall.call(
        sprintsTasksId: taskId,
        sprintsTasksStatusesId: 3,
        quantityDone: result,
        token: currentAuthenticationToken,
      );

      if (apiResult.succeeded) {
        // Vincular tarefa ao schedule do dia
        _linkTaskToSchedule(taskId);
        // Se offline, mascarar a tarefa para desaparecer da lista
        if (getJsonField(apiResult.jsonBody, r'''$.offline''') == true) {
          AppState().update(() {
            final current = AppState().offlineMaskedTasksIds.toList();
            if (!current.contains(taskId)) {
              current.add(taskId);
              AppState().offlineMaskedTasksIds = current;
            }
          });
        }
        AppState().signalTasksRefresh();
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                getJsonField(apiResult.jsonBody, r'''$.offline''') == true
                    ? 'Tarefa salva localmente. Será sincronizada ao reconectar.'
                    : 'Tarefa concluída com sucesso!',
              ),
              backgroundColor: AppTheme.of(context).success,
            ),
          );
          onSuccess();
        }
      } else {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('Erro ao concluir tarefa. Tente novamente.'),
              backgroundColor: AppTheme.of(context).error,
            ),
          );
      }
    }
    } finally {
      // Desativar loading
      if (mounted) {
        safeSetState(() {
          _loadingTaskId = null;
          _loadingAction = null;
        });
      }
    }
  }

  /// Checkbox branco para o header azul das subtarefas
  Widget _buildHeaderCheckbox(BuildContext context, dynamic item, int taskId, bool isChecked) {
    final subtasksId = castToType<int>(getJsonField(item, r'$.subtasks_id')) ?? 0;
    final isSubtask = subtasksId != 0;
    TasksListStruct buildStruct() {
      return TasksListStruct(
        sprintsTasksId: taskId,
        sprintsTasksStatusesId: 3,
        description: isSubtask
            ? valueOrDefault<String>(getJsonField(item, r'$.subtasks.description')?.toString(), ' - ')
            : valueOrDefault<String>(
                (getJsonField(item, r'$.projects_backlogs.description') ??
                        getJsonField(item, r'$.projects_backlogs.tasks_template.description'))
                    ?.toString(), ' - '),
        subtasksId: subtasksId,
        unity: UnityStruct(
          id: castToType<int>(getJsonField(item, r'$.subtasks.unity.id') ??
              getJsonField(item, r'$.projects_backlogs.unity.id')),
          unity: (getJsonField(item, r'$.subtasks.unity.unity') ??
                  getJsonField(item, r'$.projects_backlogs.unity.unity'))?.toString() ?? '',
        ),
        unityId: castToType<int>(getJsonField(item, r'$.subtasks.unity_id')),
        quantityDone: castToType<double>(getJsonField(item, r'$.subtasks') != null
            ? getJsonField(item, r'$.subtasks.quantity') : 0.0) ?? 0.0,
        inspection: getJsonField(item, r'$.projects_backlogs.is_inspection') == true,
        quantityAssigned: castToType<double>(getJsonField(item, r'$.quantity_assigned')) ?? 0.0,
      );
    }

    return InkWell(
      splashColor: Colors.transparent,
      focusColor: Colors.transparent,
      hoverColor: Colors.transparent,
      highlightColor: Colors.transparent,
      onTap: () {
        if (isChecked) {
          AppState().removeFromTaskslist(buildStruct());
        } else {
          AppState().addToTaskslist(buildStruct());
        }
        safeSetState(() {});
      },
      child: Container(
        width: 28.0,
        height: 28.0,
        alignment: Alignment.center,
        child: Container(
          width: 18.0,
          height: 18.0,
          decoration: BoxDecoration(
            color: isChecked ? Colors.white : Colors.white.withValues(alpha: 0.25),
            borderRadius: BorderRadius.circular(4.0),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.6),
              width: 1.5,
            ),
          ),
          alignment: Alignment.center,
          child: isChecked
              ? Icon(Icons.check, size: 14.0, color: const Color(0xFF3B6EC8))
              : null,
        ),
      ),
    );
  }

  Widget _buildCheckbox(BuildContext context, dynamic item, int taskId, TasksListStruct Function() buildStruct) {
    final isChecked = functions.checkIds(AppState().taskslist.toList(), taskId);
    return InkWell(
      splashColor: Colors.transparent,
      focusColor: Colors.transparent,
      hoverColor: Colors.transparent,
      highlightColor: Colors.transparent,
      onTap: () async {
        if (isChecked) {
          AppState().removeFromTaskslist(buildStruct());
          safeSetState(() {});
          return;
        }
        if ((AppConstants.um ==
                getJsonField(item, r'$.projects_backlogs.equipaments_types_id')) &&
            (false == getJsonField(item, r'$.can_conclude'))) {
          await showDialog(
            context: context,
            builder: (dialogContext) {
              return Dialog(
                elevation: 0,
                insetPadding: EdgeInsets.zero,
                backgroundColor: Colors.transparent,
                alignment: AlignmentDirectional(0.0, 0.0)
                    .resolve(Directionality.of(context)),
                child: GestureDetector(
                  onTap: () {
                    FocusScope.of(dialogContext).unfocus();
                    FocusManager.instance.primaryFocus?.unfocus();
                  },
                  child: ModalInfoWidget(
                    title: 'Atenção',
                    description:
                        'Conclua todas as etapas de cravação de estacas para finalizar esta tarefa.',
                  ),
                ),
              );
            },
          );
          return;
        }
        AppState().addToTaskslist(buildStruct());
        safeSetState(() {});
      },
      child: Container(
        width: 30.0,
        height: 30.0,
        alignment: Alignment.center,
        child: Container(
          width: 18.0,
          height: 18.0,
          decoration: BoxDecoration(
            color: isChecked ? AppTheme.of(context).primary : AppTheme.of(context).secondaryBackground,
            borderRadius: BorderRadius.circular(4.0),
            border: Border.all(
              color: isChecked ? AppTheme.of(context).primary : AppTheme.of(context).alternate,
              width: 2.0,
            ),
          ),
          alignment: Alignment.center,
          child: isChecked
              ? (_model.allCheck
                  ? Container(
                      width: 10.0,
                      height: 3.0,
                      decoration: BoxDecoration(
                        color: AppTheme.of(context).secondaryBackground,
                      ),
                    )
                  : FaIcon(
                      FontAwesomeIcons.check,
                      color: AppTheme.of(context).info,
                      size: 14.0,
                    ))
              : null,
        ),
      ),
    );
  }

  List<Widget> _buildAndamentoCardBody(BuildContext context, dynamic item, {bool isInspection = false, bool isSemSucesso = false}) {
    final taskId = castToType<int>(getJsonField(item, r'$.id')) ?? 0;
    final subtasksId = castToType<int>(getJsonField(item, r'$.subtasks_id')) ?? 0;
    final isSubtask = subtasksId != 0;
    // Usa mesma condição para evitar nome duplicado
    final hasBlueHeader = isSubtask;

    final taskName = isSubtask
        ? valueOrDefault<String>(
            getJsonField(item, r'$.subtasks.description')?.toString(), '-')
        : valueOrDefault<String>(
            (getJsonField(item, r'$.projects_backlogs.description') ??
                    getJsonField(item, r'$.projects_backlogs.tasks_template.description'))
                ?.toString(),
            '-');

    final discipline = valueOrDefault<String>(
        getJsonField(item, r'$.projects_backlogs.discipline.discipline')?.toString(), '-');

    final unityName = isSubtask
        ? valueOrDefault<String>(
            getJsonField(item, r'$.subtasks.unity.unity')?.toString(), '')
        : valueOrDefault<String>(
            getJsonField(item, r'$.projects_backlogs.unity.unity')?.toString(), '');

    final quantityAssigned =
        castToType<double>(getJsonField(item, r'$.quantity_assigned')) ?? 0.0;
    final quantityDone =
        castToType<double>(getJsonField(item, r'$.quantity_done')) ?? 0.0;
    final progressPct =
        quantityAssigned > 0 ? (quantityDone / quantityAssigned).clamp(0.0, 1.0) : 0.0;

    final scheduleStatus = _getScheduleStatus(item);

    final teamName = getJsonField(item, r'$.teams.name')?.toString();
    final criticality = getJsonField(item, r'$.criticality')?.toString();
    final critLabel = _getCriticalityLabel(criticality);
    final critColors = _getCriticalityColors(criticality);

    final scheduledFor = getJsonField(item, r'$.scheduled_for')?.toString();
    String? formattedDate;
    if (scheduledFor != null && scheduledFor.isNotEmpty) {
      try {
        final dt = DateTime.parse(scheduledFor);
        formattedDate =
            '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
      } catch (_) {}
    }

    TasksListStruct _buildTaskStruct() {
      return TasksListStruct(
        sprintsTasksId: taskId,
        sprintsTasksStatusesId: 3,
        description: isSubtask
            ? valueOrDefault<String>(
                getJsonField(item, r'$.subtasks.description')?.toString(), ' - ')
            : valueOrDefault<String>(
                (getJsonField(item, r'$.projects_backlogs.description') ??
                        getJsonField(item, r'$.projects_backlogs.tasks_template.description'))
                    ?.toString(),
                ' - '),
        subtasksId: subtasksId,
        unity: UnityStruct(
          id: castToType<int>(getJsonField(item, r'$.subtasks.unity.id') ??
              getJsonField(item, r'$.projects_backlogs.unity.id')),
          unity: (getJsonField(item, r'$.subtasks.unity.unity') ??
                  getJsonField(item, r'$.projects_backlogs.unity.unity'))
              ?.toString() ?? '',
        ),
        unityId: castToType<int>(getJsonField(item, r'$.subtasks.unity_id')),
        quantityDone: castToType<double>(getJsonField(item, r'$.subtasks') != null
            ? getJsonField(item, r'$.subtasks.quantity')
            : 0.0) ?? 0.0,
        inspection: getJsonField(item, r'$.projects_backlogs.is_inspection') == true,
        quantityAssigned: castToType<double>(getJsonField(item, r'$.quantity_assigned')) ?? 0.0,
      );
    }

    return [
      // Task name + Checkbox alinhados na mesma row
      // Nome + checkbox (somente se NÃO tem header azul)
      if (!hasBlueHeader)
        Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(12.0, 8.0, 4.0, 0.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(right: 4.0, top: 2.0),
                  child: Text(
                    taskName,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: AppTheme.of(context).bodyMedium.override(
                          font: GoogleFonts.lexend(
                            fontWeight: FontWeight.w600,
                          ),
                          fontSize: 13.0,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
              ),
              _buildCheckbox(context, item, taskId, _buildTaskStruct),
            ],
          ),
        ),

      if (!hasBlueHeader)
        const SizedBox(height: 6.0),

      // Status badge (Em dia / Atrasado)
      if (scheduleStatus != null)
        Padding(
          padding: EdgeInsetsDirectional.fromSTEB(12.0, hasBlueHeader ? 10.0 : 0.0, 12.0, 0.0),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 3.0),
            decoration: BoxDecoration(
              color: scheduleStatus['bgColor'] as Color,
              borderRadius: BorderRadius.circular(6.0),
            ),
            child: Text(
              scheduleStatus['label'] as String,
              style: AppTheme.of(context).bodySmall.override(
                    font: GoogleFonts.lexend(fontWeight: FontWeight.w600),
                    color: scheduleStatus['color'] as Color,
                    fontSize: 11.0,
                    letterSpacing: 0.0,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ),

      const SizedBox(height: 4.0),

      // Discipline · Unity
      Padding(
        padding: const EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
        child: Text(
          unityName.isNotEmpty ? '$discipline · $unityName' : discipline,
          style: AppTheme.of(context).bodySmall.override(
                font: GoogleFonts.lexend(),
                color: AppTheme.of(context).secondaryText,
                fontSize: 11.0,
                letterSpacing: 0.0,
              ),
        ),
      ),

      // Progress bar
      if (quantityAssigned > 0) ...[
        const SizedBox(height: 8.0),
        Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${quantityDone.toStringAsFixed(quantityDone.truncateToDouble() == quantityDone ? 0 : 1)} / ${quantityAssigned.toStringAsFixed(quantityAssigned.truncateToDouble() == quantityAssigned ? 0 : 1)} $unityName',
                    style: AppTheme.of(context).bodySmall.override(
                          font: GoogleFonts.lexend(),
                          fontSize: 11.0,
                          letterSpacing: 0.0,
                        ),
                  ),
                  Text(
                    '${(progressPct * 100).toStringAsFixed(0)}%',
                    style: AppTheme.of(context).bodySmall.override(
                          font: GoogleFonts.lexend(fontWeight: FontWeight.w600),
                          fontSize: 11.0,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
              ),
              const SizedBox(height: 4.0),
              ClipRRect(
                borderRadius: BorderRadius.circular(4.0),
                child: LinearProgressIndicator(
                  value: progressPct,
                  backgroundColor: const Color(0xFFE5E7EB),
                  valueColor: AlwaysStoppedAnimation<Color>(
                    progressPct >= 1.0
                        ? const Color(0xFF16A34A)
                        : AppTheme.of(context).primary,
                  ),
                  minHeight: 4.0,
                ),
              ),
            ],
          ),
        ),
      ],

      // Team + Criticality badges
      if ((teamName != null && teamName.isNotEmpty) || critLabel.isNotEmpty) ...[
        const SizedBox(height: 8.0),
        Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
          child: Wrap(
            spacing: 6.0,
            runSpacing: 4.0,
            children: [
              if (teamName != null && teamName.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 3.0),
                  decoration: BoxDecoration(
                    color: const Color(0x1A7C3AED),
                    borderRadius: BorderRadius.circular(6.0),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.groups_outlined, size: 13.0, color: const Color(0xFF7C3AED)),
                      const SizedBox(width: 4.0),
                      Text(
                        teamName,
                        style: AppTheme.of(context).bodySmall.override(
                              font: GoogleFonts.lexend(fontWeight: FontWeight.w500),
                              color: const Color(0xFF7C3AED),
                              fontSize: 11.0,
                              letterSpacing: 0.0,
                              fontWeight: FontWeight.w500,
                            ),
                      ),
                    ],
                  ),
                ),
              if (critLabel.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 3.0),
                  decoration: BoxDecoration(
                    color: critColors['bg'],
                    borderRadius: BorderRadius.circular(6.0),
                  ),
                  child: Text(
                    critLabel,
                    style: AppTheme.of(context).bodySmall.override(
                          font: GoogleFonts.lexend(fontWeight: FontWeight.w600),
                          color: critColors['text'],
                          fontSize: 11.0,
                          letterSpacing: 0.0,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
            ],
          ),
        ),
      ],

      // Scheduled date
      if (formattedDate != null) ...[
        const SizedBox(height: 6.0),
        Padding(
          padding: const EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
          child: Row(
            children: [
              Icon(Icons.calendar_today_outlined,
                  size: 13.0, color: AppTheme.of(context).secondaryText),
              const SizedBox(width: 4.0),
              Text(
                'Agendada: $formattedDate',
                style: AppTheme.of(context).bodySmall.override(
                      font: GoogleFonts.lexend(),
                      color: AppTheme.of(context).secondaryText,
                      fontSize: 11.0,
                      letterSpacing: 0.0,
                    ),
              ),
            ],
          ),
        ),
      ],

      const SizedBox(height: 10.0),

      // Action buttons row
      Padding(
        padding: const EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 12.0, 0.0),
        child: Row(
          children: [
            // Detalhes button
            Expanded(
              child: InkWell(
                borderRadius: BorderRadius.circular(8.0),
                onTap: () {
                  context.goNamedAuth(
                    DetalhesDaTarefaWidget.routeName,
                    context.mounted,
                    extra: <String, dynamic>{
                      'item': item,
                      kTransitionInfoKey: TransitionInfo(
                        hasTransition: true,
                        transitionType: PageTransitionType.fade,
                        duration: const Duration(milliseconds: 250),
                      ),
                    },
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0F4FF),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.visibility_outlined,
                          size: 14.0, color: AppTheme.of(context).primary),
                      const SizedBox(width: 4.0),
                      Text(
                        'Detalhes',
                        style: AppTheme.of(context).bodySmall.override(
                              font: GoogleFonts.lexend(fontWeight: FontWeight.w600),
                              color: AppTheme.of(context).primary,
                              fontSize: 11.0,
                              letterSpacing: 0.0,
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 6.0),
            // Concluir / Aprovado button
            Expanded(
              child: Builder(
                builder: (context) => InkWell(
                  borderRadius: BorderRadius.circular(8.0),
                  onTap: _loadingTaskId != null ? null : () async {
                    if (isInspection) {
                      // Aprovado — modal de confirmação + updateInspectionCall com qualityStatusId: 2
                      final confirmed = await showDialog<bool>(
                        barrierColor: const Color(0x80000000),
                        context: context,
                        builder: (dialogContext) => AlertDialog(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.0)),
                          title: Text('Aprovar Inspeção', style: GoogleFonts.lexend(fontWeight: FontWeight.w600, fontSize: 18.0)),
                          content: Text('Deseja aprovar esta tarefa de inspeção?', style: GoogleFonts.lexend(fontSize: 14.0)),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(dialogContext, false),
                              child: Text('Cancelar', style: GoogleFonts.lexend(color: AppTheme.of(context).secondaryText)),
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF16A34A),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
                              ),
                              onPressed: () => Navigator.pop(dialogContext, true),
                              child: Text('Aprovar', style: GoogleFonts.lexend(color: Colors.white, fontWeight: FontWeight.w600)),
                            ),
                          ],
                        ),
                      );
                      if (confirmed != true) return;
                      safeSetState(() {
                        _loadingTaskId = taskId;
                        _loadingAction = 'aprovado';
                      });
                      try {
                        final result = await SprintsGroup.updateInspectionCall.call(
                          sprintsTasksId: taskId,
                          qualityStatusId: 2,
                          token: currentAuthenticationToken,
                        );
                        // Vincular tarefa ao schedule do dia
                        _linkTaskToSchedule(taskId);
                        if (getJsonField(result?.jsonBody, r'''$.offline''') == true) {
                          AppState().update(() {
                            final current = AppState().offlineMaskedTasksIds.toList();
                            if (!current.contains(taskId)) {
                              current.add(taskId);
                              AppState().offlineMaskedTasksIds = current;
                            }
                          });
                        }
                        safeSetState(() {
                          _model.clearHomePageCache();
                          _model.apiRequestCompleted = false;
                        });
                        await _model.waitForApiRequestCompleted();
                      } finally {
                        if (mounted) {
                          safeSetState(() {
                            _loadingTaskId = null;
                            _loadingAction = null;
                          });
                        }
                      }
                      return;
                    }
                    if ((AppConstants.um ==
                            getJsonField(item, r'$.projects_backlogs.equipaments_types_id')) &&
                        (false == getJsonField(item, r'$.can_conclude'))) {
                      await showDialog(
                        context: context,
                        builder: (dialogContext) {
                          return Dialog(
                            elevation: 0,
                            insetPadding: EdgeInsets.zero,
                            backgroundColor: Colors.transparent,
                            alignment: AlignmentDirectional(0.0, 0.0)
                                .resolve(Directionality.of(context)),
                            child: GestureDetector(
                              onTap: () {
                                FocusScope.of(dialogContext).unfocus();
                                FocusManager.instance.primaryFocus?.unfocus();
                              },
                              child: ModalInfoWidget(
                                title: 'Atenção',
                                description:
                                    'Conclua todas as etapas de cravação de estacas para finalizar esta tarefa.',
                              ),
                            ),
                          );
                        },
                      );
                      return;
                    }
                    if (quantityAssigned > 0) {
                      // Tarefa com quantidade — abrir modal para informar quantidade executada
                      await _showQuantityCompleteModal(context, item, () {
                        safeSetState(() {
                          _model.clearHomePageCache();
                          _model.apiRequestCompleted = false;
                        });
                        _model.waitForApiRequestCompleted();
                      });
                    } else {
                      // Tarefa sem quantidade — concluir direto
                      safeSetState(() {
                        _loadingTaskId = taskId;
                        _loadingAction = 'concluir';
                      });
                      try {
                      AppState().tasksfinish = [];
                      AppState().tasksfinish = [_buildTaskStruct()];
                      safeSetState(() {});
                      await showDialog(
                        barrierColor: const Color(0x80000000),
                        context: context,
                        builder: (dialogContext) {
                          return Dialog(
                            elevation: 0,
                            insetPadding: EdgeInsets.zero,
                            backgroundColor: Colors.transparent,
                            alignment: AlignmentDirectional(0.0, 0.0)
                                .resolve(Directionality.of(context)),
                            child: GestureDetector(
                              onTap: () {
                                FocusScope.of(dialogContext).unfocus();
                                FocusManager.instance.primaryFocus?.unfocus();
                              },
                              child: ConfirmdialogWidget(
                                action: () async {
                                  safeSetState(() {
                                    _model.clearHomePageCache();
                                    _model.apiRequestCompleted = false;
                                  });
                                  await _model.waitForApiRequestCompleted();
                                },
                              ),
                            ),
                          );
                        },
                      );
                      } finally {
                        if (mounted) {
                          safeSetState(() {
                            _loadingTaskId = null;
                            _loadingAction = null;
                          });
                        }
                      }
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    decoration: BoxDecoration(
                      color: const Color(0x1622C55E),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _loadingTaskId == taskId && _loadingAction == 'concluir'
                          ? const SizedBox(width: 14.0, height: 14.0, child: CircularProgressIndicator(strokeWidth: 2.0, color: Color(0xFF16A34A)))
                          : const Icon(Icons.check_circle_outline,
                            size: 14.0, color: Color(0xFF16A34A)),
                        const SizedBox(width: 4.0),
                        Text(
                          isInspection ? 'Aprovado' : 'Concluir',
                          style: AppTheme.of(context).bodySmall.override(
                                font: GoogleFonts.lexend(fontWeight: FontWeight.w600),
                                color: const Color(0xFF16A34A),
                                fontSize: 11.0,
                                letterSpacing: 0.0,
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 6.0),
            // Sem Sucesso / Reprovado button
            Expanded(
              child: Builder(
                builder: (context) => InkWell(
                borderRadius: BorderRadius.circular(8.0),
                onTap: _loadingTaskId != null ? null : () async {
                  if (isInspection) {
                    // Reprovado — modal de confirmação + updateInspectionCall com qualityStatusId: 3
                    final confirmed = await showDialog<bool>(
                      barrierColor: const Color(0x80000000),
                      context: context,
                      builder: (dialogContext) => AlertDialog(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.0)),
                        title: Text('Reprovar Inspeção', style: GoogleFonts.lexend(fontWeight: FontWeight.w600, fontSize: 18.0)),
                        content: Text('Deseja reprovar esta tarefa de inspeção?', style: GoogleFonts.lexend(fontSize: 14.0)),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(dialogContext, false),
                            child: Text('Cancelar', style: GoogleFonts.lexend(color: AppTheme.of(context).secondaryText)),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFDC2626),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10.0)),
                            ),
                            onPressed: () => Navigator.pop(dialogContext, true),
                            child: Text('Reprovar', style: GoogleFonts.lexend(color: Colors.white, fontWeight: FontWeight.w600)),
                          ),
                        ],
                      ),
                    );
                    if (confirmed != true) return;
                    safeSetState(() {
                      _loadingTaskId = taskId;
                      _loadingAction = 'reprovado';
                    });
                    try {
                      final result = await SprintsGroup.updateInspectionCall.call(
                        sprintsTasksId: taskId,
                        qualityStatusId: 3,
                        token: currentAuthenticationToken,
                      );
                      // Vincular tarefa ao schedule do dia
                      _linkTaskToSchedule(taskId);
                      if (getJsonField(result?.jsonBody, r'''$.offline''') == true) {
                        AppState().update(() {
                          final current = AppState().offlineMaskedTasksIds.toList();
                          if (!current.contains(taskId)) {
                            current.add(taskId);
                            AppState().offlineMaskedTasksIds = current;
                          }
                        });
                      }
                      safeSetState(() {
                        _model.clearHomePageCache();
                        _model.apiRequestCompleted = false;
                      });
                      await _model.waitForApiRequestCompleted();
                    } finally {
                      if (mounted) {
                        safeSetState(() {
                          _loadingTaskId = null;
                          _loadingAction = null;
                        });
                      }
                    }
                    return;
                  }
                  await showDialog(
                    barrierColor: Color(0x80000000),
                    context: context,
                    builder: (dialogContext) {
                      return Dialog(
                        elevation: 0,
                        insetPadding: EdgeInsets.zero,
                        backgroundColor: Colors.transparent,
                        alignment: AlignmentDirectional(0.0, 0.0)
                            .resolve(Directionality.of(context)),
                        child: GestureDetector(
                          onTap: () {
                            FocusScope.of(dialogContext).unfocus();
                            FocusManager.instance.primaryFocus?.unfocus();
                          },
                          child: SemSucessoModalWidget(
                            items: [item],
                            action: () async {
                              safeSetState(() {
                                _model.clearHomePageCache();
                                _model.apiRequestCompleted = false;
                              });
                              await _model.waitForApiRequestCompleted();
                            },
                          ),
                        ),
                      );
                    },
                  );
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  decoration: BoxDecoration(
                    color: const Color(0x16EF4444),
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _loadingTaskId == taskId && (_loadingAction == 'reprovado' || _loadingAction == 'semSucesso')
                        ? const SizedBox(width: 14.0, height: 14.0, child: CircularProgressIndicator(strokeWidth: 2.0, color: Color(0xFFDC2626)))
                        : const Icon(Icons.cancel_outlined,
                          size: 14.0, color: Color(0xFFDC2626)),
                      const SizedBox(width: 4.0),
                      Text(
                        isInspection ? 'Reprovado' : 'S. Suc.',
                        style: AppTheme.of(context).bodySmall.override(
                              font: GoogleFonts.lexend(fontWeight: FontWeight.w600),
                              color: const Color(0xFFDC2626),
                              fontSize: 11.0,
                              letterSpacing: 0.0,
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                    ],
                  ),
                ),
              ),
            )),
          ],
        ),
      ),
    ];
  }

  int _lastConnectionRestoredTrigger = 0;
  int _lastTasksRefreshTrigger = 0;

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => HomePageTarefasModel());
    _lastConnectionRestoredTrigger = AppState().connectionRestoredTrigger;
    _lastTasksRefreshTrigger = AppState().tasksRefreshTrigger;

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      AppState().filterSprint = false;
      AppState().filterSprint01 = FiltersStruct();
      AppState().taskslist = [];
      AppState().update(() {});
      _model.drop = 0;
      _model.filtros = false;
      _model.semSucesso = false;
      safeSetState(() {});
      final isOnline = await NetworkService.instance.checkConnection();
      if (!isOnline) {
        AppState().loading = false;
        safeSetState(() {});
        return;
      }
      // Pré-carregar RDO em background ao entrar na Home (Tarefas da sprint + escala do dia)
      // assim a tela de RDO já vem preenchida e, se ficar offline, traz as tarefas concluídas
      Future.microtask(() async {
        try {
          await RdoPrefetchService.instance.prefetchRdoData();
        } catch (_) {}
      });

      // Verificar se ainda tem schedule ativo — se não, voltar para seleção
      if (AppState().user.sheduleId == 0 || AppState().user.sheduleId == null) {
        AppState().loading = false;
        safeSetState(() {});

        context.goNamedAuth(
          PageCheckQrcodeWidget.routeName,
          context.mounted,
          extra: <String, dynamic>{
            kTransitionInfoKey: TransitionInfo(
              hasTransition: true,
              transitionType: PageTransitionType.fade,
              duration: Duration(milliseconds: 250),
            ),
            'skipProjectCheck': true,
          },
        );

        return;
      }
    });

    _model.textController ??= TextEditingController();
    _model.textFieldFocusNode ??= FocusNode();

    _model.tabBarController = TabController(
      vsync: this,
      length: 2,
      initialIndex: 0,
    )..addListener(() => safeSetState(() {}));

    WidgetsBinding.instance.addPostFrameCallback((_) => safeSetState(() {}));
  }

  @override
  void dispose() {
    _model.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    context.watch<AppState>();
    final t = AppState().connectionRestoredTrigger;
    if (t != _lastConnectionRestoredTrigger) {
      _lastConnectionRestoredTrigger = t;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _model.clearHomePageCache();
          safeSetState(() {});
        }
      });
    }

    // Recarregar lista de tarefas quando status de alguma tarefa muda
    final tr = AppState().tasksRefreshTrigger;
    if (tr != _lastTasksRefreshTrigger) {
      _lastTasksRefreshTrigger = tr;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _model.clearHomePageCache();
          safeSetState(() {});
        }
      });
    }

    return FutureBuilder<ApiCallResponse>(
      future: _model
          .homePage(
        requestFn: () => SprintsGroup.queryAllSprintsTasksRecordCall.call(
          projectsId: AppState().user.projectId,
          teamsId: AppState().user.teamsId,
          token: currentAuthenticationToken,
          search: _model.textController.text,
          page: _model.page,
          perPage: _model.perPage,
          sprintsId: AppState().user.sprint.id,
          equipamentsTypesId: _model.drop,
        ),
      )
          .then((result) {
        _model.apiRequestCompleted = true;
        return result;
      }),
      builder: (context, snapshot) {
        // Customize what your widget looks like when it's loading.
        if (!snapshot.hasData) {
          return Scaffold(
            backgroundColor: AppTheme.of(context).secondaryBackground,
            body: const Center(child: CircularProgressIndicator()),
          );
        }
        final homePageTarefasQueryAllSprintsTasksRecordResponse =
            snapshot.data!;

        return GestureDetector(
          onTap: () {
            FocusScope.of(context).unfocus();
            FocusManager.instance.primaryFocus?.unfocus();
          },
          child: PopScope(
            canPop: false,
            child: Scaffold(
              key: scaffoldKey,
              backgroundColor: const Color(0xFFF5F7FA),
              appBar: PreferredSize(
                preferredSize: Size.fromHeight(85.0),
                child: AppBar(
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                  automaticallyImplyLeading: false,
                  systemOverlayStyle: const SystemUiOverlayStyle(
                    statusBarColor: Colors.transparent,
                    statusBarIconBrightness: Brightness.light,
                    statusBarBrightness: Brightness.dark,
                  ),
                  actions: [],
                  flexibleSpace: Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF011741), Color(0xFF0A2F6E)],
                      ),
                    ),
                    child: FlexibleSpaceBar(
                    title: Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 4.0),
                      child: Row(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Expanded(
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                              Builder(
                                builder: (context) => Padding(
                                  padding: EdgeInsetsDirectional.fromSTEB(
                                      0.0, 0.0, 12.0, 0.0),
                                  child: InkWell(
                                    splashColor: Colors.transparent,
                                    focusColor: Colors.transparent,
                                    hoverColor: Colors.transparent,
                                    highlightColor: Colors.transparent,
                                    onTap: () async {
                                      showDialog(
                                        barrierColor: Color(0x80000000),
                                        context: context,
                                        builder: (dialogContext) {
                                          return Dialog(
                                            elevation: 0,
                                            insetPadding: EdgeInsets.zero,
                                            backgroundColor: Colors.transparent,
                                            alignment: AlignmentDirectional(
                                                    -1.0, -1.0)
                                                .resolve(
                                                    Directionality.of(context)),
                                            child: GestureDetector(
                                              onTap: () {
                                                FocusScope.of(dialogContext)
                                                    .unfocus();
                                                FocusManager
                                                    .instance.primaryFocus
                                                    ?.unfocus();
                                              },
                                              child: LogoutWidget(),
                                            ),
                                          );
                                        },
                                      );
                                    },
                                    child: Container(
                                      width: 44.0,
                                      height: 44.0,
                                      decoration: BoxDecoration(
                                        color: Colors.white.withOpacity(0.15),
                                        shape: BoxShape.circle,
                                        border: Border.all(
                                          color: Colors.white.withOpacity(0.4),
                                          width: 2.0,
                                        ),
                                      ),
                                      child: ClipRRect(
                                        borderRadius:
                                            BorderRadius.circular(100.0),
                                        child: CachedNetworkImage(
                                          imageUrl: valueOrDefault<String>(
                                            AppState().user.image,
                                            'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg',
                                          ),
                                          width: 48.0,
                                          height: 48.0,
                                          fit: BoxFit.cover,
                                          placeholder: (context, url) =>
                                              Container(
                                            color: AppTheme.of(context)
                                                .secondaryBackground,
                                          ),
                                          errorWidget: (context, url, error) =>
                                              Container(
                                            color: AppTheme.of(context)
                                                .secondaryBackground,
                                            child: Icon(
                                              Icons.person,
                                              color:
                                                  AppTheme.of(context)
                                                      .secondaryText,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    AppLocalizations.of(context).getText(
                                      'ucytgbzo' /* Olá */,
                                    ),
                                    style: GoogleFonts.lexend(
                                      fontSize: 12.0,
                                      fontWeight: FontWeight.w400,
                                      color: Colors.white.withOpacity(0.75),
                                      letterSpacing: 0.2,
                                    ),
                                  ),
                                  Text(
                                    () {
                                      final fullName = valueOrDefault<String>(
                                        AppState().user.name,
                                        ' - ',
                                      );
                                      final parts = fullName.trim().split(' ');
                                      if (parts.length <= 2) return fullName;
                                      return '${parts.first} ${parts.last}';
                                    }(),
                                    overflow: TextOverflow.ellipsis,
                                    maxLines: 1,
                                    style: GoogleFonts.lexend(
                                      fontSize: 15.0,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                      letterSpacing: 0.1,
                                    ),
                                  ),
                                ],
                              ),
                              ],
                            ),
                          ),
                          Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Builder(
                                  builder: (context) => AppIconButton(
                                    borderRadius: 10.0,
                                    buttonSize: 36.0,
                                    fillColor: Colors.white.withOpacity(0.15),
                                    icon: const Icon(
                                      Icons.qr_code_rounded,
                                      color: Colors.white,
                                      size: 18.0,
                                    ),
                                    onPressed: () {
                                      context.goNamedAuth(
                                        PageCheckQrcodeWidget.routeName,
                                        context.mounted,
                                        extra: <String, dynamic>{
                                          kTransitionInfoKey: TransitionInfo(
                                            hasTransition: true,
                                            transitionType: PageTransitionType.fade,
                                            duration: const Duration(milliseconds: 250),
                                          ),
                                        },
                                      );
                                    },
                                  ),
                                ),
                                const SizedBox(width: 6.0),
                                AppIconButton(
                                  borderRadius: 10.0,
                                  buttonSize: 36.0,
                                  fillColor: Colors.white.withOpacity(0.15),
                                  icon: const Icon(
                                    Icons.swap_horiz_rounded,
                                    color: Colors.white,
                                    size: 18.0,
                                  ),
                                  onPressed: () {
                                    context.goNamedAuth(
                                      ProjectSelectionWidget.routeName,
                                      context.mounted,
                                      extra: <String, dynamic>{
                                        kTransitionInfoKey: TransitionInfo(
                                          hasTransition: true,
                                          transitionType: PageTransitionType.fade,
                                          duration: const Duration(milliseconds: 250),
                                        ),
                                      },
                                    );
                                  },
                                ),
                                const SizedBox(width: 6.0),
                                AppDropDown<String>(
                                    controller: _model.dropDownValueController2 ??=
                                        FormFieldController<String>(
                                      _model.dropDownValue2 ??=
                                          AppLocalizations.of(context).languageCode,
                                    ),
                                    options: List<String>.from(['pt', 'en', 'es']),
                                    optionLabels: const ['PT', 'EN', 'ES'],
                                    onChanged: (val) async {
                                      if (val == null) {
                                        return;
                                      }
                                      safeSetState(
                                          () => _model.dropDownValue2 = val);
                                      await AppLocalizations.storeLocale(val);
                                      setAppLanguage(context, val);
                                    },
                                    width: 70.0,
                                    height: 36.0,
                                    textStyle: GoogleFonts.lexend(
                                      fontSize: 12.0,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                    ),
                                    hintText: 'PT',
                                    icon: const Icon(
                                      Icons.keyboard_arrow_down_rounded,
                                      color: Colors.white70,
                                      size: 18.0,
                                    ),
                                    fillColor: Colors.white.withOpacity(0.15),
                                    elevation: 0.0,
                                    borderColor: Colors.white.withOpacity(0.25),
                                    borderWidth: 1.0,
                                    borderRadius: 10.0,
                                    margin: EdgeInsetsDirectional.fromSTEB(
                                        4.0, 0.0, 0.0, 0.0),
                                    hidesUnderline: true,
                                    isOverButton: false,
                                    isSearchable: false,
                                    isMultiSelect: false,
                                  ),
                              ],
                            ),
                        ],
                      ),
                    ),
                    centerTitle: true,
                    expandedTitleScale: 1.0,
                  ),
                  ),
                ),
              ),
              body: SafeArea(
                top: true,
                child: Stack(
                  children: [
                    Align(
                      alignment: AlignmentDirectional(0.0, 1.0),
                      child: wrapWithModel(
                        model: _model.navBarModel,
                        updateCallback: () => safeSetState(() {}),
                        child: NavBarWidget(
                          page: 1,
                          totalSprints:
                              SprintsGroup.queryAllSprintsTasksRecordCall
                                      .nOandamento(
                                        homePageTarefasQueryAllSprintsTasksRecordResponse
                                            .jsonBody,
                                      )!
                                      .length +
                                  SprintsGroup.queryAllSprintsTasksRecordCall
                                      .nOconcluidas(
                                        homePageTarefasQueryAllSprintsTasksRecordResponse
                                            .jsonBody,
                                      )!
                                      .length,
                          concluidasSprints:
                              SprintsGroup.queryAllSprintsTasksRecordCall
                                  .nOconcluidas(
                                    homePageTarefasQueryAllSprintsTasksRecordResponse
                                        .jsonBody,
                                  )
                                  ?.length,
                        ),
                      ),
                    ),
                    Padding(
                      padding:
                          EdgeInsetsDirectional.fromSTEB(16.0, 8.0, 16.0, 16.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.max,
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(
                                  0.0, 0.0, 0.0, 64.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const OfflineBannerWidget(),
                                  // Nome do projeto + botão trocar
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 10.0),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      crossAxisAlignment: CrossAxisAlignment.center,
                                      children: [
                                        Expanded(
                                          child: Row(
                                            children: [
                                              Icon(
                                                Icons.business_rounded,
                                                color: AppTheme.of(context).primary,
                                                size: 18.0,
                                              ),
                                              const SizedBox(width: 6),
                                              Flexible(
                                                child: Text(
                                                  AppState().user.projectName.isNotEmpty
                                                      ? (AppState().user.teamName.isNotEmpty
                                                          ? '${AppState().user.projectName} / ${AppState().user.teamName}'
                                                          : AppState().user.projectName)
                                                      : AppLocalizations.of(context).getVariableText(
                                                          ptText: 'Projeto',
                                                          esText: 'Proyecto',
                                                          enText: 'Project',
                                                        ),
                                                  style: GoogleFonts.lexend(
                                                    fontSize: 14.0,
                                                    fontWeight: FontWeight.w600,
                                                    color: AppTheme.of(context).primaryText,
                                                    letterSpacing: 0.0,
                                                  ),
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        InkWell(
                                          onTap: () async {
                                            // Limpar dados de projeto/equipe para forçar novo fluxo
                                            AppState().updateUserStruct(
                                              (e) => e
                                                ..sheduleId = null
                                                ..projectId = null
                                                ..teamsId = null
                                                ..teamName = null
                                                ..sprint = SprintsStruct(),
                                            );
                                            AppState().update(() {});
                                            if (!context.mounted) return;
                                            context.goNamedAuth(
                                              ProjectSelectionWidget.routeName,
                                              context.mounted,
                                              extra: <String, dynamic>{
                                                kTransitionInfoKey: TransitionInfo(
                                                  hasTransition: true,
                                                  transitionType: PageTransitionType.fade,
                                                ),
                                              },
                                            );
                                          },
                                          borderRadius: BorderRadius.circular(8),
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
                                            child: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  Icons.swap_horiz_rounded,
                                                  color: AppTheme.of(context).primary,
                                                  size: 16.0,
                                                ),
                                                const SizedBox(width: 4),
                                                Text(
                                                  AppLocalizations.of(context).getVariableText(
                                                    ptText: 'Trocar',
                                                    esText: 'Cambiar',
                                                    enText: 'Switch',
                                                  ),
                                                  style: GoogleFonts.lexend(
                                                    fontSize: 12.0,
                                                    fontWeight: FontWeight.w500,
                                                    color: AppTheme.of(context).primary,
                                                    letterSpacing: 0.0,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Builder(
                                    builder: (context) {
                                      final _resp = homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody;
                                      final _api = SprintsGroup.queryAllSprintsTasksRecordCall;
                                      final _pendCount = _api.pendentes(_resp)?.length ?? 0;
                                      final _andCount = _api.nOandamento(_resp)?.length ?? 0;
                                      final _concCount = _api.nOconcluidas(_resp)?.length ?? 0;
                                      final _semSucCount = _api.nOsemSucesso(_resp)?.length ?? 0;
                                      final _inspCount = _api.yESandamento(_resp)?.length ?? 0;
                                      final totalTasks = _pendCount + _andCount + _concCount + _semSucCount + _inspCount;
                                      final doneTasks = _concCount + _inspCount + _semSucCount;
                                      return GestureDetector(
                                        onTap: () {
                                          _model.sprintExpanded = !_model.sprintExpanded;
                                          safeSetState(() {});
                                        },
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius: BorderRadius.circular(14),
                                            border: Border.all(
                                              color: const Color(0xFF105DFB).withOpacity(0.12),
                                            ),
                                            boxShadow: [
                                              BoxShadow(
                                                color: Colors.black.withOpacity(0.05),
                                                blurRadius: 10,
                                                offset: const Offset(0, 2),
                                              ),
                                            ],
                                          ),
                                          child: Column(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              // Header compacto: sempre visível
                                              Row(
                                                children: [
                                                  Container(
                                                    width: 28,
                                                    height: 28,
                                                    decoration: BoxDecoration(
                                                      color: AppTheme.of(context).primary.withOpacity(0.1),
                                                      borderRadius: BorderRadius.circular(7),
                                                    ),
                                                    child: Icon(
                                                      Icons.rocket_launch_rounded,
                                                      color: AppTheme.of(context).primary,
                                                      size: 14.0,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 8),
                                                  Expanded(
                                                    child: Text(
                                                      valueOrDefault<String>(
                                                        AppState().user.sprint.title,
                                                        ' - ',
                                                      ),
                                                      style: GoogleFonts.lexend(
                                                        fontSize: 13.0,
                                                        fontWeight: FontWeight.w600,
                                                        color: AppTheme.of(context).primaryText,
                                                        letterSpacing: 0.0,
                                                      ),
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 6),
                                                  Text(
                                                    '$doneTasks/$totalTasks',
                                                    style: GoogleFonts.lexend(
                                                      fontSize: 12.0,
                                                      fontWeight: FontWeight.w600,
                                                      color: AppTheme.of(context).primary,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 4),
                                                  AppIconButton(
                                                    borderColor:
                                                        AppTheme.of(context)
                                                            .alternate,
                                                    borderRadius: 8.0,
                                                    buttonSize: 28.0,
                                                    fillColor:
                                                        const Color(0xFFF5F7FA),
                                                    icon: Icon(
                                                      Icons.refresh_rounded,
                                                      color:
                                                          AppTheme.of(context)
                                                              .primary,
                                                      size: 14.0,
                                                    ),
                                                    onPressed: () async {
                                                      safeSetState(() {
                                                        _model.clearHomePageCache();
                                                        _model.apiRequestCompleted =
                                                            false;
                                                      });
                                                      await _model
                                                          .waitForApiRequestCompleted();
                                                    },
                                                  ),
                                                  const SizedBox(width: 2),
                                                  AnimatedRotation(
                                                    turns: _model.sprintExpanded ? 0.5 : 0.0,
                                                    duration: const Duration(milliseconds: 200),
                                                    child: Icon(
                                                      Icons.keyboard_arrow_down_rounded,
                                                      color: AppTheme.of(context).secondaryText,
                                                      size: 20.0,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              // Conteúdo expandido
                                              AnimatedSize(
                                                duration: const Duration(milliseconds: 250),
                                                curve: Curves.easeInOut,
                                                child: !_model.sprintExpanded
                                                    ? const SizedBox.shrink()
                                                    : Padding(
                                                        padding: const EdgeInsets.only(top: 10.0),
                                                        child: Column(
                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                          children: [
                                                            // Datas com ícone
                                                            Row(
                                                              mainAxisSize: MainAxisSize.min,
                                                              crossAxisAlignment: CrossAxisAlignment.center,
                                                              children: [
                                                                Icon(
                                                                  Icons.calendar_today_rounded,
                                                                  size: 13,
                                                                  color: AppTheme.of(context).primary,
                                                                ),
                                                                const SizedBox(width: 5),
                                                                Text(
                                                                  '${valueOrDefault<String>(
                                                                    dateTimeFormat(
                                                                      "d/M/y",
                                                                      DateTime.fromMillisecondsSinceEpoch(
                                                                          AppState().user.sprint.startDate),
                                                                      locale: AppLocalizations.of(context).languageCode,
                                                                    ),
                                                                    '0',
                                                                  )}${AppLocalizations.of(context).getVariableText(
                                                                    ptText: ' até ',
                                                                    esText: ' hasta ',
                                                                    enText: ' until ',
                                                                  )}${valueOrDefault<String>(
                                                                    dateTimeFormat(
                                                                      "d/M/y",
                                                                      DateTime.fromMillisecondsSinceEpoch(
                                                                          AppState().user.sprint.endDate),
                                                                      locale: AppLocalizations.of(context).languageCode,
                                                                    ),
                                                                    '0',
                                                                  )}',
                                                                  style: GoogleFonts.lexend(
                                                                    fontSize: 12.0,
                                                                    fontWeight: FontWeight.w500,
                                                                    color: AppTheme.of(context).primary,
                                                                    letterSpacing: 0.0,
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                            const SizedBox(height: 10),
                                                            // Barra de progresso estilo painel
                                                            Builder(
                                                              builder: (context) {
                                                                final emAndamentoCount = SprintsGroup
                                                                    .queryAllSprintsTasksRecordCall
                                                                    .nOandamento(homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody)?.length ?? 0;
                                                                final concluidasCount = SprintsGroup
                                                                    .queryAllSprintsTasksRecordCall
                                                                    .nOconcluidas(homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody)?.length ?? 0;
                                                                final semSucessoCount = SprintsGroup
                                                                    .queryAllSprintsTasksRecordCall
                                                                    .nOsemSucesso(homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody)?.length ?? 0;
                                                                final inspecaoCount = SprintsGroup
                                                                    .queryAllSprintsTasksRecordCall
                                                                    .yESandamento(homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody)?.length ?? 0;
                                                                final pct = totalTasks > 0 ? ((doneTasks / totalTasks) * 100).round() : 0;
                                                                return Column(
                                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                                  children: [
                                                                    Row(
                                                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                                      children: [
                                                                        Text(
                                                                          AppLocalizations.of(context).getVariableText(
                                                                            ptText: 'Progresso',
                                                                            esText: 'Progreso',
                                                                            enText: 'Progress',
                                                                          ),
                                                                          style: GoogleFonts.lexend(
                                                                            fontSize: 13.0,
                                                                            fontWeight: FontWeight.w500,
                                                                            color: AppTheme.of(context).primaryText,
                                                                          ),
                                                                        ),
                                                                        Text(
                                                                          '$pct%',
                                                                          style: GoogleFonts.lexend(
                                                                            fontSize: 13.0,
                                                                            fontWeight: FontWeight.w600,
                                                                            color: AppTheme.of(context).primary,
                                                                          ),
                                                                        ),
                                                                      ],
                                                                    ),
                                                                    const SizedBox(height: 8),
                                                                    ClipRRect(
                                                                      borderRadius: BorderRadius.circular(4),
                                                                      child: LinearProgressIndicator(
                                                                        value: totalTasks > 0 ? doneTasks / totalTasks : 0.0,
                                                                        backgroundColor: AppTheme.of(context).alternate,
                                                                        valueColor: AlwaysStoppedAnimation<Color>(
                                                                          AppTheme.of(context).primary,
                                                                        ),
                                                                        minHeight: 8,
                                                                      ),
                                                                    ),
                                                                    const SizedBox(height: 10),
                                                                    Wrap(
                                                                      spacing: 16,
                                                                      runSpacing: 4,
                                                                      children: [
                                                                        Text(
                                                                          'Em Andamento: $emAndamentoCount',
                                                                          style: GoogleFonts.lexend(fontSize: 11, color: AppTheme.of(context).primary),
                                                                        ),
                                                                        Text(
                                                                          'Inspeção: $inspecaoCount',
                                                                          style: GoogleFonts.lexend(fontSize: 11, color: const Color(0xFFCA8A04)),
                                                                        ),
                                                                        Text(
                                                                          'Concluída: $concluidasCount',
                                                                          style: GoogleFonts.lexend(fontSize: 11, color: const Color(0xFF16A34A)),
                                                                        ),
                                                                        Text(
                                                                          'Sem Sucesso: $semSucessoCount',
                                                                          style: GoogleFonts.lexend(fontSize: 11, color: const Color(0xFFDC2626)),
                                                                        ),
                                                                      ],
                                                                    ),
                                                                  ],
                                                                );
                                                              },
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                  Padding(
                                    padding: EdgeInsetsDirectional.fromSTEB(
                                        0.0, 10.0, 0.0, 0.0),
                                    child: InkWell(
                                      splashColor: Colors.transparent,
                                      focusColor: Colors.transparent,
                                      hoverColor: Colors.transparent,
                                      highlightColor: Colors.transparent,
                                      borderRadius: BorderRadius.circular(10),
                                      onTap: () async {
                                        _model.filtros = !_model.filtros;
                                        safeSetState(() {});
                                      },
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12.0,
                                          vertical: 8.0,
                                        ),
                                        decoration: BoxDecoration(
                                          color: _model.filtros
                                              ? AppTheme.of(context).primary.withOpacity(0.08)
                                              : Colors.white,
                                          borderRadius: BorderRadius.circular(10),
                                          border: Border.all(
                                            color: _model.filtros
                                                ? AppTheme.of(context).primary.withOpacity(0.3)
                                                : AppTheme.of(context).alternate,
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.max,
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Icon(
                                                  Icons.tune_rounded,
                                                  color: _model.filtros
                                                      ? AppTheme.of(context).primary
                                                      : AppTheme.of(context).secondaryText,
                                                  size: 16.0,
                                                ),
                                                const SizedBox(width: 8),
                                                Text(
                                                  AppLocalizations.of(context).getText(
                                                    '8997bn6w' /* Filtros */,
                                                  ),
                                                  style: GoogleFonts.lexend(
                                                    fontSize: 13.0,
                                                    fontWeight: FontWeight.w500,
                                                    color: _model.filtros
                                                        ? AppTheme.of(context).primary
                                                        : AppTheme.of(context).primaryText,
                                                  ),
                                                ),
                                              ],
                                            ),
                                            AnimatedRotation(
                                              turns: _model.filtros ? 0.5 : 0.0,
                                              duration: const Duration(milliseconds: 200),
                                              child: Icon(
                                                Icons.keyboard_arrow_down_rounded,
                                                color: _model.filtros
                                                    ? AppTheme.of(context).primary
                                                    : AppTheme.of(context).secondaryText,
                                                size: 20.0,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                  AnimatedSize(
                                    duration: const Duration(milliseconds: 250),
                                    curve: Curves.easeInOut,
                                    child: !_model.filtros
                                        ? const SizedBox.shrink()
                                        : Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          0.0, 8.0, 0.0, 8.0),
                                      child: Column(
                                        mainAxisSize: MainAxisSize.max,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Container(
                                            width: double.infinity,
                                            child: TextFormField(
                                                    controller:
                                                        _model.textController,
                                                    focusNode: _model
                                                        .textFieldFocusNode,
                                                    onFieldSubmitted:
                                                        (_) async {
                                                      safeSetState(() {
                                                        _model
                                                            .clearHomePageCache();
                                                        _model.apiRequestCompleted =
                                                            false;
                                                      });
                                                      await _model
                                                          .waitForApiRequestCompleted();
                                                    },
                                                    autofocus: false,
                                                    obscureText: false,
                                                    decoration: InputDecoration(
                                                      labelText:
                                                          AppLocalizations.of(
                                                                  context)
                                                              .getText(
                                                        'ttsaqd5y' /* Procurar por código ou descriç... */,
                                                      ),
                                                      labelStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .override(
                                                                font:
                                                                    GoogleFonts
                                                                        .lexend(
                                                                  fontWeight: AppTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontWeight,
                                                                  fontStyle: AppTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontStyle,
                                                                ),
                                                                letterSpacing:
                                                                    0.0,
                                                                fontWeight: AppTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontWeight,
                                                                fontStyle: AppTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontStyle,
                                                              ),
                                                      hintStyle:
                                                          AppTheme.of(
                                                                  context)
                                                              .labelSmall
                                                              .override(
                                                                font:
                                                                    GoogleFonts
                                                                        .lexend(
                                                                  fontWeight: AppTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontWeight,
                                                                  fontStyle: AppTheme.of(
                                                                          context)
                                                                      .labelSmall
                                                                      .fontStyle,
                                                                ),
                                                                letterSpacing:
                                                                    0.0,
                                                                fontWeight: AppTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontWeight,
                                                                fontStyle: AppTheme.of(
                                                                        context)
                                                                    .labelSmall
                                                                    .fontStyle,
                                                              ),
                                                      enabledBorder:
                                                          OutlineInputBorder(
                                                        borderSide: BorderSide(
                                                          color: AppTheme
                                                                  .of(context)
                                                              .alternate,
                                                          width: 1.0,
                                                        ),
                                                        borderRadius:
                                                            BorderRadius.circular(14.0),
                                                      ),
                                                      focusedBorder:
                                                          OutlineInputBorder(
                                                        borderSide: BorderSide(
                                                          color: AppTheme
                                                                  .of(context)
                                                              .primary,
                                                          width: 1.0,
                                                        ),
                                                        borderRadius:
                                                            BorderRadius.circular(14.0),
                                                      ),
                                                      errorBorder:
                                                          OutlineInputBorder(
                                                        borderSide: BorderSide(
                                                          color: AppTheme
                                                                  .of(context)
                                                              .error,
                                                          width: 1.0,
                                                        ),
                                                        borderRadius:
                                                            BorderRadius.circular(14.0),
                                                      ),
                                                      focusedErrorBorder:
                                                          OutlineInputBorder(
                                                        borderSide: BorderSide(
                                                          color: AppTheme
                                                                  .of(context)
                                                              .error,
                                                          width: 1.0,
                                                        ),
                                                        borderRadius:
                                                            BorderRadius.circular(14.0),
                                                      ),
                                                      filled: true,
                                                      fillColor:
                                                          AppTheme.of(
                                                                  context)
                                                              .primaryBackground,
                                                      contentPadding:
                                                          EdgeInsetsDirectional
                                                              .fromSTEB(
                                                                  20.0,
                                                                  0.0,
                                                                  0.0,
                                                                  0.0),
                                                      prefixIcon: Icon(
                                                        Icons.search_sharp,
                                                      ),
                                                    ),
                                                    style: AppTheme.of(
                                                            context)
                                                        .bodySmall
                                                        .override(
                                                          font: GoogleFonts
                                                              .lexend(
                                                            fontWeight:
                                                                FontWeight.w500,
                                                            fontStyle:
                                                                AppTheme.of(
                                                                        context)
                                                                    .bodySmall
                                                                    .fontStyle,
                                                          ),
                                                          letterSpacing: 0.0,
                                                          fontWeight:
                                                              FontWeight.w500,
                                                          fontStyle:
                                                              AppTheme.of(
                                                                      context)
                                                                  .bodySmall
                                                                  .fontStyle,
                                                        ),
                                                    cursorColor:
                                                        AppTheme.of(
                                                                context)
                                                            .primary,
                                                    validator: _model
                                                        .textControllerValidator
                                                        .asValidator(context),
                                                  ),
                                                ),
                                          SizedBox(height: 10.0),
                                          InkWell(
                                            splashColor: Colors.transparent,
                                            focusColor: Colors.transparent,
                                            hoverColor: Colors.transparent,
                                            highlightColor: Colors.transparent,
                                            borderRadius: BorderRadius.circular(14.0),
                                            onTap: () async {
                                              _model.semSucesso =
                                                  !_model.semSucesso;
                                              safeSetState(() {});
                                            },
                                            child: Container(
                                              height: 40.0,
                                              padding: EdgeInsetsDirectional.fromSTEB(16.0, 0.0, 16.0, 0.0),
                                              decoration: BoxDecoration(
                                                color: !_model.semSucesso
                                                    ? AppTheme.of(context).primaryBackground
                                                    : AppTheme.of(context).status01,
                                                borderRadius: BorderRadius.circular(14.0),
                                                border: Border.all(
                                                  color: !_model.semSucesso
                                                      ? AppTheme.of(context).alternate
                                                      : AppTheme.of(context).error,
                                                ),
                                              ),
                                              alignment: AlignmentDirectional(0.0, 0.0),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  Icon(
                                                    !_model.semSucesso
                                                        ? Icons.filter_list_rounded
                                                        : Icons.filter_list_off_rounded,
                                                    size: 16.0,
                                                    color: !_model.semSucesso
                                                        ? AppTheme.of(context).secondaryText
                                                        : AppTheme.of(context).error,
                                                  ),
                                                  SizedBox(width: 6.0),
                                                  Text(
                                                    AppLocalizations.of(context).getText(
                                                      'ln1ovg5a' /* Tarefa "Sem sucesso" */,
                                                    ),
                                                    style: AppTheme.of(context)
                                                        .bodySmall
                                                        .override(
                                                          font: GoogleFonts.lexend(
                                                            fontWeight: FontWeight.w500,
                                                            fontStyle: AppTheme.of(context).bodySmall.fontStyle,
                                                          ),
                                                          color: !_model.semSucesso
                                                              ? AppTheme.of(context).primaryText
                                                              : AppTheme.of(context).error,
                                                          letterSpacing: 0.0,
                                                          fontWeight: FontWeight.w500,
                                                          fontStyle: AppTheme.of(context).bodySmall.fontStyle,
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
                                  Expanded(
                                    child: Padding(
                                      padding: EdgeInsetsDirectional.fromSTEB(
                                          0.0, 0.0, 0.0, 16.0),
                                      child: Container(
                                        decoration: BoxDecoration(),
                                        child: Column(
                                          mainAxisSize: MainAxisSize.max,
                                          children: [
                                            // Batch select row integrada
                                            Padding(
                                              padding: const EdgeInsets.symmetric(vertical: 6.0, horizontal: 4.0),
                                              child: Row(
                                                mainAxisAlignment: MainAxisAlignment.end,
                                                children: [
                                                  Text(
                                                    AppState().taskslist.isNotEmpty
                                                        ? 'Desmarcar todas'
                                                        : 'Selecionar todas',
                                                    style: GoogleFonts.lexend(
                                                      fontSize: 12.0,
                                                      fontWeight: FontWeight.w500,
                                                      color: AppTheme.of(context).secondaryText,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 6.0),
                                                  if (AppState().taskslist.isNotEmpty)
                                                    Padding(
                                                      padding: const EdgeInsets.only(right: 4.0),
                                                      child: Container(
                                                        padding: const EdgeInsets.symmetric(horizontal: 6.0, vertical: 2.0),
                                                        decoration: BoxDecoration(
                                                          color: AppTheme.of(context).primary.withOpacity(0.1),
                                                          borderRadius: BorderRadius.circular(10),
                                                        ),
                                                        child: Text(
                                                          '${AppState().taskslist.length}',
                                                          style: GoogleFonts.lexend(
                                                            fontSize: 11.0,
                                                            fontWeight: FontWeight.w600,
                                                            color: AppTheme.of(context).primary,
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                  // Checkbox de seleção em lote
                                                  if (!(AppState().taskslist.isNotEmpty))
                                                    InkWell(
                                                      splashColor: Colors.transparent,
                                                      focusColor: Colors.transparent,
                                                      hoverColor: Colors.transparent,
                                                      highlightColor: Colors.transparent,
                                                      onTap: () async {
                                                        if (_model.tabBarCurrentIndex == 0) {
                                                          if (!_model.semSucesso) {
                                                            _model.allCheck = true;
                                                            safeSetState(() {});
                                                            _model.retornoAciton = await actions.setIdsEquipamento(
                                                              SprintsGroup.queryAllSprintsTasksRecordCall.nOandamento(
                                                                homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                              )!.toList(),
                                                            );
                                                            AppState().taskslist = _model.retornoAciton!.toList().cast<TasksListStruct>();
                                                          } else {
                                                            _model.allCheck = true;
                                                            safeSetState(() {});
                                                            _model.retornoAcitonSemSucesso = await actions.setIdsEquipamento(
                                                              SprintsGroup.queryAllSprintsTasksRecordCall.nOsemSucesso(
                                                                homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                              )!.toList(),
                                                            );
                                                            AppState().taskslist = _model.retornoAcitonSemSucesso!.toList().cast<TasksListStruct>();
                                                          }
                                                        } else {
                                                          _model.allCheck = true;
                                                          safeSetState(() {});
                                                          _model.yesandamento = await actions.addIdsDataType(
                                                            SprintsGroup.queryAllSprintsTasksRecordCall.yESandamento(
                                                              homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                            )!.toList(),
                                                          );
                                                          AppState().taskslist = _model.yesandamento!.toList().cast<TasksListStruct>();
                                                        }
                                                        safeSetState(() {});
                                                      },
                                                      child: Container(
                                                        width: 30.0,
                                                        height: 30.0,
                                                        alignment: AlignmentDirectional(0.0, 0.0),
                                                        child: Container(
                                                          width: 18.0,
                                                          height: 18.0,
                                                          decoration: BoxDecoration(
                                                            color: AppTheme.of(context).secondaryBackground,
                                                            borderRadius: BorderRadius.circular(4.0),
                                                            border: Border.all(
                                                              color: AppTheme.of(context).alternate,
                                                              width: 2.0,
                                                            ),
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                  if (AppState().taskslist.isNotEmpty)
                                                    InkWell(
                                                      splashColor: Colors.transparent,
                                                      focusColor: Colors.transparent,
                                                      hoverColor: Colors.transparent,
                                                      highlightColor: Colors.transparent,
                                                      onTap: () async {
                                                        _model.allCheck = false;
                                                        safeSetState(() {});
                                                        AppState().taskslist = [];
                                                        safeSetState(() {});
                                                      },
                                                      child: Container(
                                                        width: 30.0,
                                                        height: 30.0,
                                                        alignment: AlignmentDirectional(0.0, 0.0),
                                                        child: Container(
                                                          width: 18.0,
                                                          height: 18.0,
                                                          decoration: BoxDecoration(
                                                            color: AppTheme.of(context).primary,
                                                            borderRadius: BorderRadius.circular(4.0),
                                                            border: Border.all(
                                                              color: AppTheme.of(context).primary,
                                                              width: 2.0,
                                                            ),
                                                          ),
                                                          alignment: AlignmentDirectional(0.0, 0.0),
                                                          child: Stack(
                                                            alignment: AlignmentDirectional(0.0, 0.0),
                                                            children: [
                                                              if (!_model.allCheck)
                                                                FaIcon(
                                                                  FontAwesomeIcons.check,
                                                                  color: AppTheme.of(context).info,
                                                                  size: 14.0,
                                                                ),
                                                              if (_model.allCheck)
                                                                Container(
                                                                  width: 100.0,
                                                                  height: 3.0,
                                                                  decoration: BoxDecoration(
                                                                    color: AppTheme.of(context).secondaryBackground,
                                                                  ),
                                                                ),
                                                            ],
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                ],
                                              ),
                                            ),
                                            Expanded(
                                              child: Column(
                                                children: [
                                                  Align(
                                                    alignment:
                                                        Alignment(0.0, 0),
                                                    child:
                                                        AppTabBar(
                                                      useToggleButtonStyle:
                                                          true,
                                                      labelStyle:
                                                          GoogleFonts.lexend(
                                                            fontSize: 14.0,
                                                            fontWeight: FontWeight.w600,
                                                            letterSpacing: 0.2,
                                                          ),
                                                      unselectedLabelStyle:
                                                          GoogleFonts.lexend(
                                                            fontSize: 14.0,
                                                            fontWeight: FontWeight.w500,
                                                            letterSpacing: 0.2,
                                                          ),
                                                      labelColor:
                                                          Colors.white,
                                                      unselectedLabelColor:
                                                          AppTheme.of(
                                                                  context)
                                                              .secondaryText,
                                                      backgroundColor:
                                                          AppTheme.of(
                                                                  context)
                                                              .primary,
                                                      unselectedBackgroundColor:
                                                          Colors.white,
                                                      borderColor:
                                                          AppTheme.of(
                                                                  context)
                                                              .alternate,
                                                      borderWidth: 1.0,
                                                      borderRadius: 12.0,
                                                      elevation: 0.0,
                                                      buttonMargin:
                                                          EdgeInsetsDirectional
                                                              .fromSTEB(
                                                                  6.0,
                                                                  0.0,
                                                                  6.0,
                                                                  0.0),
                                                      tabs: [
                                                        Tab(
                                                          text: AppLocalizations
                                                                  .of(context)
                                                              .getText(
                                                            'pv86xn2h' /* Tarefas */,
                                                          ),
                                                        ),
                                                        Tab(
                                                          text: AppLocalizations
                                                                  .of(context)
                                                              .getText(
                                                            'esu4od55' /* Inspeções */,
                                                          ),
                                                        ),
                                                      ],
                                                      controller: _model
                                                          .tabBarController,
                                                      onTap: (i) async {
                                                        [
                                                          () async {
                                                            _model.allCheck =
                                                                false;
                                                            safeSetState(() {});
                                                            AppState()
                                                                .taskslist = [];
                                                            safeSetState(() {});
                                                          },
                                                          () async {
                                                            _model.allCheck =
                                                                false;
                                                            safeSetState(() {});
                                                            AppState()
                                                                .taskslist = [];
                                                            safeSetState(() {});
                                                          }
                                                        ][i]();
                                                      },
                                                    ),
                                                  ),
                                                  Expanded(
                                                    child: TabBarView(
                                                      controller: _model
                                                          .tabBarController,
                                                      children: [
                                                        Padding(
                                                          padding:
                                                              EdgeInsetsDirectional
                                                                  .fromSTEB(
                                                                      0.0,
                                                                      8.0,
                                                                      0.0,
                                                                      0.0),
                                                          child: Column(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .max,
                                                            children: [
                                                              if (_model
                                                                  .semSucesso)
                                                                Expanded(
                                                                  child:
                                                                      Builder(
                                                                    builder:
                                                                        (context) {
                                                                      final listaSemSucesso = SprintsGroup
                                                                              .queryAllSprintsTasksRecordCall
                                                                              .nOsemSucesso(
                                                                                homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                                              )
                                                                              ?.toList() ??
                                                                          [];
                                                                      if (listaSemSucesso
                                                                          .isEmpty) {
                                                                        return Container(
                                                                          width:
                                                                              double.infinity,
                                                                          child:
                                                                              EmptyWidget(),
                                                                        );
                                                                      }

                                                                      return RefreshIndicator(
                                                                        onRefresh:
                                                                            () async {
                                                                          safeSetState(
                                                                              () {
                                                                            _model.clearHomePageCache();
                                                                            _model.apiRequestCompleted =
                                                                                false;
                                                                          });
                                                                          await _model
                                                                              .waitForApiRequestCompleted();
                                                                        },
                                                                        child: ListView
                                                                            .builder(
                                                                          padding:
                                                                              EdgeInsets.zero,
                                                                          primary:
                                                                              false,
                                                                          shrinkWrap:
                                                                              true,
                                                                          scrollDirection:
                                                                              Axis.vertical,
                                                                          itemCount:
                                                                              listaSemSucesso.length,
                                                                          itemBuilder:
                                                                              (context, listaSemSucessoIndex) {
                                                                            final listaSemSucessoItem =
                                                                                listaSemSucesso[listaSemSucessoIndex];
                                                                            if (_isOfflineMaskedTask(listaSemSucessoItem)) {
                                                                              return const SizedBox.shrink();
                                                                            }
                                                                            return Padding(
                                                                              padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 12.0),
                                                                              child: Column(
                                                                                mainAxisSize: MainAxisSize.max,
                                                                                children: [
                                                                                  Material(
                                                                                    color: Colors.transparent,
                                                                                    elevation: 0.0,
                                                                                    shape: RoundedRectangleBorder(
                                                                                      borderRadius: BorderRadius.circular(14.0),
                                                                                    ),
                                                                                    child: Container(
                                                                                      width: MediaQuery.sizeOf(context).width * 1.0,
                                                                                      decoration: BoxDecoration(
                                                                                        color: Colors.white,
                                                                                        borderRadius: BorderRadius.circular(14.0),
                                                                                        boxShadow: [
                                                                                          BoxShadow(
                                                                                            color: Colors.black.withOpacity(0.07),
                                                                                            blurRadius: 12,
                                                                                            offset: const Offset(0, 3),
                                                                                          ),
                                                                                        ],
                                                                                        border: Border.all(
                                                                                          color: const Color(0xFFE8EAED),
                                                                                        ),
                                                                                      ),
                                                                                      child: Padding(
                                                                                        padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 8.0),
                                                                                        child: Column(
                                                                                          mainAxisSize: MainAxisSize.min,
                                                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                                                          children: [
                                                                                            if (AppConstants.zero !=
                                                                                                getJsonField(
                                                                                                  listaSemSucessoItem,
                                                                                                  r'''$.subtasks_id''',
                                                                                                ) && getJsonField(listaSemSucessoItem, r'''$.subtasks_id''') != null)
                                                                                              Container(
                                                                                                width: double.infinity,
                                                                                                decoration: BoxDecoration(
                                                                                                  gradient: const LinearGradient(
                                                                                                    begin: Alignment.topLeft,
                                                                                                    end: Alignment.bottomRight,
                                                                                                    colors: [Color(0xFF3B6EC8), Color(0xFF487EDA)],
                                                                                                  ),
                                                                                                  borderRadius: BorderRadius.only(
                                                                                                    bottomLeft: Radius.circular(0.0),
                                                                                                    bottomRight: Radius.circular(0.0),
                                                                                                    topLeft: Radius.circular(14.0),
                                                                                                    topRight: Radius.circular(14.0),
                                                                                                  ),
                                                                                                ),
                                                                                                child: Padding(
                                                                                                  padding: EdgeInsetsDirectional.fromSTEB(10.0, 6.0, 6.0, 6.0),
                                                                                                  child: Row(
                                                                                                    children: [
                                                                                                      Expanded(
                                                                                                        child: Text(
                                                                                                    valueOrDefault<String>(
                                                                                                      'Tarefa: ${valueOrDefault<String>(
                                                                                                        getJsonField(
                                                                                                          listaSemSucessoItem,
                                                                                                          r'''$.projects_backlogs.id''',
                                                                                                        )?.toString(),
                                                                                                        '0',
                                                                                                      )} - ${valueOrDefault<String>(
                                                                                                        (getJsonField(
                                                                                                          listaSemSucessoItem,
                                                                                                          r'''$.projects_backlogs.description''',
                                                                                                        ) ?? getJsonField(
                                                                                                          listaSemSucessoItem,
                                                                                                          r'''$.projects_backlogs.tasks_template.description''',
                                                                                                        ))?.toString(),
                                                                                                        '-',
                                                                                                      )}',
                                                                                                      '-',
                                                                                                    ),
                                                                                                    style: AppTheme.of(context).bodyMedium.override(
                                                                                                          font: GoogleFonts.lexend(
                                                                                                            fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                          ),
                                                                                                          color: AppTheme.of(context).secondaryBackground,
                                                                                                          letterSpacing: 0.0,
                                                                                                          fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                          fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                        ),
                                                                                                  ),
                                                                                                      ),
                                                                                                      // Checkbox no header azul
                                                                                                      Builder(builder: (ctx) {
                                                                                                        final _tid = castToType<int>(getJsonField(listaSemSucessoItem, r'''$.id''')) ?? 0;
                                                                                                        final _checked = functions.checkIds(AppState().taskslist.toList(), _tid);
                                                                                                        return _buildHeaderCheckbox(ctx, listaSemSucessoItem, _tid, _checked);
                                                                                                      }),
                                                                                                    ],
                                                                                                  ),
                                                                                                ),
                                                                                              ),
                                                                                            ..._buildAndamentoCardBody(context, listaSemSucessoItem, isSemSucesso: true),
                                                                                          ],
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                ].divide(SizedBox(height: 8.0)),
                                                                              ),
                                                                            );
                                                                          },
                                                                        ),
                                                                      );
                                                                    },
                                                                  ),
                                                                ),
                                                              if (!_model
                                                                  .semSucesso)
                                                                Expanded(
                                                                  child:
                                                                      Builder(
                                                                    builder:
                                                                        (context) {
                                                                      final listaAndamento = SprintsGroup
                                                                              .queryAllSprintsTasksRecordCall
                                                                              .nOandamento(
                                                                                homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                                              )
                                                                              ?.toList() ??
                                                                          [];
                                                                      if (listaAndamento
                                                                          .isEmpty) {
                                                                        return Container(
                                                                          width:
                                                                              double.infinity,
                                                                          child:
                                                                              EmptyWidget(),
                                                                        );
                                                                      }

                                                                      return RefreshIndicator(
                                                                        onRefresh:
                                                                            () async {
                                                                          safeSetState(
                                                                              () {
                                                                            _model.clearHomePageCache();
                                                                            _model.apiRequestCompleted =
                                                                                false;
                                                                          });
                                                                          await _model
                                                                              .waitForApiRequestCompleted();
                                                                        },
                                                                        child: ListView
                                                                            .builder(
                                                                          padding:
                                                                              EdgeInsets.zero,
                                                                          primary:
                                                                              false,
                                                                          shrinkWrap:
                                                                              true,
                                                                          scrollDirection:
                                                                              Axis.vertical,
                                                                          itemCount:
                                                                              listaAndamento.length,
                                                                          itemBuilder:
                                                                              (context, listaAndamentoIndex) {
                                                                            final listaAndamentoItem =
                                                                                listaAndamento[listaAndamentoIndex];
                                                                            if (_isOfflineMaskedTask(
                                                                                listaAndamentoItem)) {
                                                                              return const SizedBox.shrink();
                                                                            }
                                                                            return Padding(
                                                                              padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 12.0),
                                                                              child: Column(
                                                                                mainAxisSize: MainAxisSize.max,
                                                                                children: [
                                                                                  Material(
                                                                                    color: Colors.transparent,
                                                                                    elevation: 0.0,
                                                                                    shape: RoundedRectangleBorder(
                                                                                      borderRadius: BorderRadius.circular(14.0),
                                                                                    ),
                                                                                    child: Container(
                                                                                      width: MediaQuery.sizeOf(context).width * 1.0,
                                                                                      decoration: BoxDecoration(
                                                                                        color: Colors.white,
                                                                                        borderRadius: BorderRadius.circular(14.0),
                                                                                        boxShadow: [
                                                                                          BoxShadow(
                                                                                            color: Colors.black.withOpacity(0.07),
                                                                                            blurRadius: 12,
                                                                                            offset: const Offset(0, 3),
                                                                                          ),
                                                                                        ],
                                                                                        border: Border.all(
                                                                                          color: const Color(0xFFE8EAED),
                                                                                        ),
                                                                                      ),
                                                                                      child: Padding(
                                                                                        padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 8.0),
                                                                                        child: Column(
                                                                                          mainAxisSize: MainAxisSize.min,
                                                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                                                          children: [
                                                                                            if (getJsonField(listaAndamentoItem, r'''$.subtasks_id''') != null &&
                                                                                                AppConstants.zero != getJsonField(listaAndamentoItem, r'''$.subtasks_id'''))
                                                                                              Container(
                                                                                                width: double.infinity,
                                                                                                decoration: BoxDecoration(
                                                                                                  gradient: const LinearGradient(
                                                                                                    begin: Alignment.topLeft,
                                                                                                    end: Alignment.bottomRight,
                                                                                                    colors: [Color(0xFF3B6EC8), Color(0xFF487EDA)],
                                                                                                  ),
                                                                                                  borderRadius: BorderRadius.only(
                                                                                                    bottomLeft: Radius.circular(0.0),
                                                                                                    bottomRight: Radius.circular(0.0),
                                                                                                    topLeft: Radius.circular(14.0),
                                                                                                    topRight: Radius.circular(14.0),
                                                                                                  ),
                                                                                                ),
                                                                                                child: Padding(
                                                                                                  padding: EdgeInsetsDirectional.fromSTEB(10.0, 6.0, 6.0, 6.0),
                                                                                                  child: Row(
                                                                                                    children: [
                                                                                                      Expanded(
                                                                                                        child: Text(
                                                                                                    valueOrDefault<String>(
                                                                                                      'Tarefa: ${valueOrDefault<String>(
                                                                                                        getJsonField(
                                                                                                          listaAndamentoItem,
                                                                                                          r'''$.projects_backlogs.id''',
                                                                                                        )?.toString(),
                                                                                                        '0',
                                                                                                      )} - ${valueOrDefault<String>(
                                                                                                        (getJsonField(
                                                                                                          listaAndamentoItem,
                                                                                                          r'''$.projects_backlogs.description''',
                                                                                                        ) ?? getJsonField(
                                                                                                          listaAndamentoItem,
                                                                                                          r'''$.projects_backlogs.tasks_template.description''',
                                                                                                        ))?.toString(),
                                                                                                        '-',
                                                                                                      )}',
                                                                                                      '-',
                                                                                                    ),
                                                                                                    style: AppTheme.of(context).bodyMedium.override(
                                                                                                          font: GoogleFonts.lexend(
                                                                                                            fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                          ),
                                                                                                          color: AppTheme.of(context).secondaryBackground,
                                                                                                          letterSpacing: 0.0,
                                                                                                          fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                          fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                        ),
                                                                                                  ),
                                                                                                      ),
                                                                                                      // Checkbox no header azul
                                                                                                      Builder(builder: (ctx) {
                                                                                                        final _tid = castToType<int>(getJsonField(listaAndamentoItem, r'''$.id''')) ?? 0;
                                                                                                        final _checked = functions.checkIds(AppState().taskslist.toList(), _tid);
                                                                                                        return _buildHeaderCheckbox(ctx, listaAndamentoItem, _tid, _checked);
                                                                                                      }),
                                                                                                    ],
                                                                                                  ),
                                                                                                ),
                                                                                              ),
                                                                                            ..._buildAndamentoCardBody(context, listaAndamentoItem),
                                                                                          ],
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                ].divide(SizedBox(height: 8.0)),
                                                                              ),
                                                                            );
                                                                          },
                                                                        ),
                                                                      );
                                                                    },
                                                                  ),
                                                                ),
                                                              if (SprintsGroup
                                                                      .queryAllSprintsTasksRecordCall
                                                                      .nOandamentoPage(
                                                                    homePageTarefasQueryAllSprintsTasksRecordResponse
                                                                        .jsonBody,
                                                                  )! >
                                                                  _model.page)
                                                                Align(
                                                                  alignment:
                                                                      AlignmentDirectional(
                                                                          -1.0,
                                                                          0.0),
                                                                  child:
                                                                      Padding(
                                                                    padding: EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            0.0,
                                                                            12.0,
                                                                            0.0,
                                                                            0.0),
                                                                    child:
                                                                        AppButton(
                                                                      onPressed:
                                                                          () async {
                                                                        _model.page =
                                                                            1;
                                                                        _model.perPage =
                                                                            _model.perPage +
                                                                                50;
                                                                        safeSetState(
                                                                            () {});
                                                                        safeSetState(
                                                                            () {
                                                                          _model
                                                                              .clearHomePageCache();
                                                                          _model.apiRequestCompleted =
                                                                              false;
                                                                        });
                                                                        await _model
                                                                            .waitForApiRequestCompleted();
                                                                      },
                                                                      text: AppLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        'euravd3h' /* Ver mais */,
                                                                      ),
                                                                      options:
                                                                          AppButtonOptions(
                                                                        height:
                                                                            30.0,
                                                                        padding: EdgeInsetsDirectional.fromSTEB(
                                                                            16.0,
                                                                            0.0,
                                                                            16.0,
                                                                            0.0),
                                                                        iconPadding: EdgeInsetsDirectional.fromSTEB(
                                                                            0.0,
                                                                            0.0,
                                                                            0.0,
                                                                            0.0),
                                                                        color: AppTheme.of(context)
                                                                            .secondary,
                                                                        textStyle: AppTheme.of(context)
                                                                            .labelSmall
                                                                            .override(
                                                                              font: GoogleFonts.lexend(
                                                                                fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                              ),
                                                                              color: AppTheme.of(context).primary,
                                                                              letterSpacing: 0.0,
                                                                              fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                              fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                            ),
                                                                        elevation:
                                                                            0.0,
                                                                        borderSide:
                                                                            BorderSide(
                                                                          color:
                                                                              AppTheme.of(context).primary,
                                                                        ),
                                                                        borderRadius:
                                                                            BorderRadius.circular(8.0),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                ),
                                                            ],
                                                          ),
                                                        ),
                                                        Padding(
                                                          padding:
                                                              EdgeInsetsDirectional
                                                                  .fromSTEB(
                                                                      0.0,
                                                                      8.0,
                                                                      0.0,
                                                                      0.0),
                                                          child: Column(
                                                            mainAxisSize:
                                                                MainAxisSize
                                                                    .max,
                                                            children: [
                                                              if (!_model
                                                                  .semSucesso)
                                                                Expanded(
                                                                  child:
                                                                      Builder(
                                                                    builder:
                                                                        (context) {
                                                                      final listaAndamento = SprintsGroup
                                                                              .queryAllSprintsTasksRecordCall
                                                                              .yESandamento(
                                                                                homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                                              )
                                                                              ?.toList() ??
                                                                          [];
                                                                      if (listaAndamento
                                                                          .isEmpty) {
                                                                        return Container(
                                                                          width:
                                                                              double.infinity,
                                                                          child:
                                                                              EmptyWidget(),
                                                                        );
                                                                      }

                                                                      return RefreshIndicator(
                                                                        onRefresh:
                                                                            () async {
                                                                          safeSetState(
                                                                              () {
                                                                            _model.clearHomePageCache();
                                                                            _model.apiRequestCompleted =
                                                                                false;
                                                                          });
                                                                          await _model
                                                                              .waitForApiRequestCompleted();
                                                                        },
                                                                        child: ListView
                                                                            .builder(
                                                                          padding:
                                                                              EdgeInsets.zero,
                                                                          primary:
                                                                              false,
                                                                          shrinkWrap:
                                                                              true,
                                                                          scrollDirection:
                                                                              Axis.vertical,
                                                                          itemCount:
                                                                              listaAndamento.length,
                                                                          itemBuilder:
                                                                              (context, listaAndamentoIndex) {
                                                                            final listaAndamentoItem =
                                                                                listaAndamento[listaAndamentoIndex];
                                                                            if (_isOfflineMaskedTask(
                                                                                listaAndamentoItem)) {
                                                                              return const SizedBox.shrink();
                                                                            }
                                                                            return Padding(
                                                                              padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 12.0),
                                                                              child: Column(
                                                                                mainAxisSize: MainAxisSize.max,
                                                                                children: [
                                                                                  Material(
                                                                                    color: Colors.transparent,
                                                                                    elevation: 0.0,
                                                                                    shape: RoundedRectangleBorder(
                                                                                      borderRadius: BorderRadius.circular(14.0),
                                                                                    ),
                                                                                    child: Container(
                                                                                      width: MediaQuery.sizeOf(context).width * 1.0,
                                                                                      decoration: BoxDecoration(
                                                                                        color: Colors.white,
                                                                                        borderRadius: BorderRadius.circular(14.0),
                                                                                        boxShadow: [
                                                                                          BoxShadow(
                                                                                            color: Colors.black.withOpacity(0.07),
                                                                                            blurRadius: 12,
                                                                                            offset: const Offset(0, 3),
                                                                                          ),
                                                                                        ],
                                                                                        border: Border.all(
                                                                                          color: const Color(0xFFE8EAED),
                                                                                        ),
                                                                                      ),
                                                                                      child: Padding(
                                                                                        padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 8.0),
                                                                                        child: Column(
                                                                                          mainAxisSize: MainAxisSize.min,
                                                                                          crossAxisAlignment: CrossAxisAlignment.start,
                                                                                          children: [
                                                                                            // Header azul com checkbox (mesmo padrão da aba Tarefas)
                                                                                            if (getJsonField(listaAndamentoItem, r'''$.subtasks_id''') != null &&
                                                                                                AppConstants.zero != getJsonField(listaAndamentoItem, r'''$.subtasks_id'''))
                                                                                              Container(
                                                                                                width: double.infinity,
                                                                                                decoration: BoxDecoration(
                                                                                                  gradient: const LinearGradient(
                                                                                                    begin: Alignment.topLeft,
                                                                                                    end: Alignment.bottomRight,
                                                                                                    colors: [Color(0xFF3B6EC8), Color(0xFF487EDA)],
                                                                                                  ),
                                                                                                  borderRadius: BorderRadius.only(
                                                                                                    bottomLeft: Radius.circular(0.0),
                                                                                                    bottomRight: Radius.circular(0.0),
                                                                                                    topLeft: Radius.circular(14.0),
                                                                                                    topRight: Radius.circular(14.0),
                                                                                                  ),
                                                                                                ),
                                                                                                child: Padding(
                                                                                                  padding: EdgeInsetsDirectional.fromSTEB(10.0, 6.0, 6.0, 6.0),
                                                                                                  child: Row(
                                                                                                    children: [
                                                                                                      Expanded(
                                                                                                        child: Text(
                                                                                                    valueOrDefault<String>(
                                                                                                      'Tarefa: ${valueOrDefault<String>(
                                                                                                        getJsonField(
                                                                                                          listaAndamentoItem,
                                                                                                          r'''$.projects_backlogs.id''',
                                                                                                        )?.toString(),
                                                                                                        '0',
                                                                                                      )} - ${(getJsonField(
                                                                                                        listaAndamentoItem,
                                                                                                        r'''$.projects_backlogs.description''',
                                                                                                      ) ?? getJsonField(
                                                                                                        listaAndamentoItem,
                                                                                                        r'''$.projects_backlogs.tasks_template.description''',
                                                                                                      ) ?? '').toString()}',
                                                                                                      '-',
                                                                                                    ),
                                                                                                    style: AppTheme.of(context).bodyMedium.override(
                                                                                                          font: GoogleFonts.lexend(
                                                                                                            fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                            fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                          ),
                                                                                                          color: AppTheme.of(context).secondaryBackground,
                                                                                                          letterSpacing: 0.0,
                                                                                                          fontWeight: AppTheme.of(context).bodyMedium.fontWeight,
                                                                                                          fontStyle: AppTheme.of(context).bodyMedium.fontStyle,
                                                                                                        ),
                                                                                                  ),
                                                                                                      ),
                                                                                                      Builder(builder: (ctx) {
                                                                                                        final _tid = castToType<int>(getJsonField(listaAndamentoItem, r'''$.id''')) ?? 0;
                                                                                                        final _checked = functions.checkIds(AppState().taskslist.toList(), _tid);
                                                                                                        return _buildHeaderCheckbox(ctx, listaAndamentoItem, _tid, _checked);
                                                                                                      }),
                                                                                                    ],
                                                                                                  ),
                                                                                                ),
                                                                                              ),
                                                                                            // Reutilizar body padronizado com botões de inspeção
                                                                                            ..._buildAndamentoCardBody(context, listaAndamentoItem, isInspection: true),
                                                                                          ],
                                                                                        ),
                                                                                      ),
                                                                                    ),
                                                                                  ),
                                                                                ].divide(SizedBox(height: 8.0)),
                                                                              ),
                                                                            );
                                                                          },
                                                                        ),
                                                                      );
                                                                    },
                                                                  ),
                                                                ),
                                                              if (SprintsGroup
                                                                      .queryAllSprintsTasksRecordCall
                                                                      .yESandamentoPage(
                                                                    homePageTarefasQueryAllSprintsTasksRecordResponse
                                                                        .jsonBody,
                                                                  )! >
                                                                  _model.page)
                                                                Align(
                                                                  alignment:
                                                                      AlignmentDirectional(
                                                                          -1.0,
                                                                          0.0),
                                                                  child:
                                                                      Padding(
                                                                    padding: EdgeInsetsDirectional
                                                                        .fromSTEB(
                                                                            0.0,
                                                                            12.0,
                                                                            0.0,
                                                                            0.0),
                                                                    child:
                                                                        AppButton(
                                                                      onPressed:
                                                                          () async {
                                                                        _model.page =
                                                                            1;
                                                                        _model.perPage =
                                                                            _model.perPage +
                                                                                50;
                                                                        safeSetState(
                                                                            () {});
                                                                        safeSetState(
                                                                            () {
                                                                          _model
                                                                              .clearHomePageCache();
                                                                          _model.apiRequestCompleted =
                                                                              false;
                                                                        });
                                                                        await _model
                                                                            .waitForApiRequestCompleted();
                                                                      },
                                                                      text: AppLocalizations.of(
                                                                              context)
                                                                          .getText(
                                                                        'jbltf1jo' /* Ver mais */,
                                                                      ),
                                                                      options:
                                                                          AppButtonOptions(
                                                                        height:
                                                                            30.0,
                                                                        padding: EdgeInsetsDirectional.fromSTEB(
                                                                            16.0,
                                                                            0.0,
                                                                            16.0,
                                                                            0.0),
                                                                        iconPadding: EdgeInsetsDirectional.fromSTEB(
                                                                            0.0,
                                                                            0.0,
                                                                            0.0,
                                                                            0.0),
                                                                        color: AppTheme.of(context)
                                                                            .secondary,
                                                                        textStyle: AppTheme.of(context)
                                                                            .labelSmall
                                                                            .override(
                                                                              font: GoogleFonts.lexend(
                                                                                fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                                fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                              ),
                                                                              color: AppTheme.of(context).primary,
                                                                              letterSpacing: 0.0,
                                                                              fontWeight: AppTheme.of(context).labelSmall.fontWeight,
                                                                              fontStyle: AppTheme.of(context).labelSmall.fontStyle,
                                                                            ),
                                                                        elevation:
                                                                            0.0,
                                                                        borderSide:
                                                                            BorderSide(
                                                                          color:
                                                                              AppTheme.of(context).primary,
                                                                        ),
                                                                        borderRadius:
                                                                            BorderRadius.circular(8.0),
                                                                      ),
                                                                    ),
                                                                  ),
                                                                ),
                                                            ],
                                                          ),
                                                        ),
                                                      ],
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
                                  if (_model.tabBarCurrentIndex == 0)
                                    Builder(
                                      builder: (context) => Row(
                                        children: [
                                          // Botao Concluir selecionadas
                                          Expanded(
                                            child: AppButton(
                                              onPressed: !(AppState()
                                                      .taskslist
                                                      .isNotEmpty)
                                                  ? null
                                                  : () async {
                                                      AppState().tasksfinish = [];
                                                      safeSetState(() {});
                                                      AppState().tasksfinish =
                                                          AppState()
                                                              .taskslist
                                                              .toList()
                                                              .cast<
                                                                  TasksListStruct>();
                                                      safeSetState(() {});
                                                      await showDialog(
                                                        barrierColor:
                                                            Color(0x80000000),
                                                        barrierDismissible: false,
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
                                                            child: GestureDetector(
                                                              onTap: () {
                                                                FocusScope.of(
                                                                        dialogContext)
                                                                    .unfocus();
                                                                FocusManager.instance
                                                                    .primaryFocus
                                                                    ?.unfocus();
                                                              },
                                                              child:
                                                                  ConcluirBatchModalWidget(
                                                                onConfirmed: () async {
                                                                  safeSetState(() {
                                                                    _model
                                                                        .clearHomePageCache();
                                                                    _model.apiRequestCompleted =
                                                                        false;
                                                                  });
                                                                  await _model
                                                                      .waitForApiRequestCompleted();
                                                                },
                                                              ),
                                                            ),
                                                          );
                                                        },
                                                      );
                                                    },
                                              text: 'Concluir',
                                              icon: Icon(Icons.check_circle_outline, size: 18.0, color: Colors.white),
                                              options: AppButtonOptions(
                                                width: double.infinity,
                                                height: 48.0,
                                                padding:
                                                    EdgeInsetsDirectional.fromSTEB(
                                                        8.0, 0.0, 8.0, 0.0),
                                                iconPadding:
                                                    EdgeInsetsDirectional.fromSTEB(
                                                        0.0, 0.0, 4.0, 0.0),
                                                color: AppTheme.of(context)
                                                    .primary,
                                                textStyle: AppTheme.of(
                                                        context)
                                                    .titleSmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight:
                                                            AppTheme.of(
                                                                    context)
                                                                .titleSmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            AppTheme.of(
                                                                    context)
                                                                .titleSmall
                                                                .fontStyle,
                                                      ),
                                                      color: Colors.white,
                                                      fontSize: 13.0,
                                                      letterSpacing: 0.0,
                                                      fontWeight:
                                                          AppTheme.of(context)
                                                              .titleSmall
                                                              .fontWeight,
                                                      fontStyle:
                                                          AppTheme.of(context)
                                                              .titleSmall
                                                              .fontStyle,
                                                    ),
                                                elevation: 0.0,
                                                borderRadius:
                                                    BorderRadius.circular(14.0),
                                                disabledColor:
                                                    AppTheme.of(context)
                                                        .alternate,
                                                disabledTextColor:
                                                    AppTheme.of(context)
                                                        .secondaryText,
                                              ),
                                            ),
                                          ),
                                          SizedBox(width: 8.0),
                                          // Botao Sem Sucesso selecionadas
                                          Expanded(
                                            child: AppButton(
                                              onPressed: !(AppState()
                                                      .taskslist
                                                      .isNotEmpty)
                                                  ? null
                                                  : () async {
                                                      // Coletar os items JSON originais das tarefas selecionadas
                                                      final allItems = SprintsGroup
                                                              .queryAllSprintsTasksRecordCall
                                                              .nOandamento(
                                                                homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                              )
                                                              ?.toList() ??
                                                          [];
                                                      final selectedTaskIds = AppState()
                                                          .taskslist
                                                          .map((t) => t.sprintsTasksId)
                                                          .toSet();
                                                      final selectedItems = allItems
                                                          .where((item) =>
                                                              selectedTaskIds.contains(
                                                                  getJsonField(item, r'$.id')))
                                                          .toList();
                                                      if (selectedItems.isEmpty) return;
                                                      await showDialog(
                                                        barrierColor:
                                                            Color(0x80000000),
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
                                                            child: GestureDetector(
                                                              onTap: () {
                                                                FocusScope.of(
                                                                        dialogContext)
                                                                    .unfocus();
                                                                FocusManager.instance
                                                                    .primaryFocus
                                                                    ?.unfocus();
                                                              },
                                                              child:
                                                                  SemSucessoModalWidget(
                                                                items: selectedItems,
                                                                action: () async {
                                                                  safeSetState(() {
                                                                    _model
                                                                        .clearHomePageCache();
                                                                    _model.apiRequestCompleted =
                                                                        false;
                                                                  });
                                                                  await _model
                                                                      .waitForApiRequestCompleted();
                                                                },
                                                              ),
                                                            ),
                                                          );
                                                        },
                                                      );
                                                    },
                                              text: 'Sem Sucesso',
                                              icon: Icon(Icons.cancel_outlined, size: 18.0, color: Colors.white),
                                              options: AppButtonOptions(
                                                width: double.infinity,
                                                height: 48.0,
                                                padding:
                                                    EdgeInsetsDirectional.fromSTEB(
                                                        8.0, 0.0, 8.0, 0.0),
                                                iconPadding:
                                                    EdgeInsetsDirectional.fromSTEB(
                                                        0.0, 0.0, 4.0, 0.0),
                                                color: const Color(0xFFDC2626),
                                                textStyle: AppTheme.of(
                                                        context)
                                                    .titleSmall
                                                    .override(
                                                      font: GoogleFonts.lexend(
                                                        fontWeight: FontWeight.w600,
                                                        fontStyle:
                                                            AppTheme.of(
                                                                    context)
                                                                .titleSmall
                                                                .fontStyle,
                                                      ),
                                                      color: Colors.white,
                                                      fontSize: 13.0,
                                                      letterSpacing: 0.0,
                                                      fontWeight: FontWeight.w600,
                                                      fontStyle:
                                                          AppTheme.of(context)
                                                              .titleSmall
                                                              .fontStyle,
                                                    ),
                                                elevation: 0.0,
                                                borderRadius:
                                                    BorderRadius.circular(14.0),
                                                disabledColor:
                                                    AppTheme.of(context)
                                                        .alternate,
                                                disabledTextColor:
                                                    AppTheme.of(context)
                                                        .secondaryText,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  if (_model.tabBarCurrentIndex == 1)
                                    Builder(
                                      builder: (context) => Padding(
                                        padding: EdgeInsetsDirectional.fromSTEB(
                                            0.0, 8.0, 0.0, 0.0),
                                        child: Row(
                                          children: [
                                            // Botão Aprovado
                                            Expanded(
                                              child: AppButton(
                                                onPressed: !(AppState()
                                                        .taskslist
                                                        .isNotEmpty)
                                                    ? null
                                                    : () async {
                                                        AppState().tasksfinish = [];
                                                        AppState().update(() {});
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
                                                              child: GestureDetector(
                                                                onTap: () {
                                                                  FocusScope.of(
                                                                          dialogContext)
                                                                      .unfocus();
                                                                  FocusManager
                                                                      .instance
                                                                      .primaryFocus
                                                                      ?.unfocus();
                                                                },
                                                                child:
                                                                    CommentInspWidget(
                                                                  refresh: () async {
                                                                    safeSetState(() {
                                                                      _model
                                                                          .clearHomePageCache();
                                                                      _model.apiRequestCompleted =
                                                                          false;
                                                                    });
                                                                    await _model
                                                                        .waitForApiRequestCompleted();
                                                                  },
                                                                ),
                                                              ),
                                                            );
                                                          },
                                                        );
                                                      },
                                                text: 'Aprovado',
                                                icon: Icon(Icons.check_circle_outline, size: 18.0, color: Colors.white),
                                                options: AppButtonOptions(
                                                  width: double.infinity,
                                                  height: 48.0,
                                                  padding:
                                                      EdgeInsetsDirectional.fromSTEB(
                                                          8.0, 0.0, 8.0, 0.0),
                                                  iconPadding:
                                                      EdgeInsetsDirectional.fromSTEB(
                                                          0.0, 0.0, 4.0, 0.0),
                                                  color: AppTheme.of(context)
                                                      .primary,
                                                  textStyle: AppTheme.of(
                                                          context)
                                                      .titleSmall
                                                      .override(
                                                        font: GoogleFonts.lexend(
                                                          fontWeight:
                                                              AppTheme.of(
                                                                      context)
                                                                  .titleSmall
                                                                  .fontWeight,
                                                          fontStyle:
                                                              AppTheme.of(
                                                                      context)
                                                                  .titleSmall
                                                                  .fontStyle,
                                                        ),
                                                        color: Colors.white,
                                                        fontSize: 13.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight:
                                                            AppTheme.of(context)
                                                                .titleSmall
                                                                .fontWeight,
                                                        fontStyle:
                                                            AppTheme.of(context)
                                                                .titleSmall
                                                                .fontStyle,
                                                      ),
                                                  elevation: 0.0,
                                                  borderRadius:
                                                      BorderRadius.circular(14.0),
                                                  disabledColor:
                                                      AppTheme.of(context)
                                                          .alternate,
                                                  disabledTextColor:
                                                      AppTheme.of(context)
                                                          .secondaryText,
                                                ),
                                              ),
                                            ),
                                            SizedBox(width: 8.0),
                                            // Botão Reprovado (inspeção)
                                            Expanded(
                                              child: AppButton(
                                                onPressed: !(AppState()
                                                        .taskslist
                                                        .isNotEmpty)
                                                    ? null
                                                    : () async {
                                                        final allItems = SprintsGroup
                                                                .queryAllSprintsTasksRecordCall
                                                                .yESandamento(
                                                                  homePageTarefasQueryAllSprintsTasksRecordResponse.jsonBody,
                                                                )
                                                                ?.toList() ??
                                                            [];
                                                        final selectedTaskIds = AppState()
                                                            .taskslist
                                                            .map((t) => t.sprintsTasksId)
                                                            .toSet();
                                                        final selectedItems = allItems
                                                            .where((item) =>
                                                                selectedTaskIds.contains(
                                                                    getJsonField(item, r'$.id')))
                                                            .toList();
                                                        if (selectedItems.isEmpty) return;
                                                        await showDialog(
                                                          barrierColor:
                                                              Color(0x80000000),
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
                                                              child: GestureDetector(
                                                                onTap: () {
                                                                  FocusScope.of(
                                                                          dialogContext)
                                                                      .unfocus();
                                                                  FocusManager.instance
                                                                      .primaryFocus
                                                                      ?.unfocus();
                                                                },
                                                                child:
                                                                    SemSucessoModalWidget(
                                                                  items: selectedItems,
                                                                  action: () async {
                                                                    safeSetState(() {
                                                                      _model
                                                                          .clearHomePageCache();
                                                                      _model.apiRequestCompleted =
                                                                          false;
                                                                    });
                                                                    await _model
                                                                        .waitForApiRequestCompleted();
                                                                  },
                                                                ),
                                                              ),
                                                            );
                                                          },
                                                        );
                                                      },
                                                text: 'Reprovado',
                                                icon: Icon(Icons.cancel_outlined, size: 18.0, color: Colors.white),
                                                options: AppButtonOptions(
                                                  width: double.infinity,
                                                  height: 48.0,
                                                  padding:
                                                      EdgeInsetsDirectional.fromSTEB(
                                                          8.0, 0.0, 8.0, 0.0),
                                                  iconPadding:
                                                      EdgeInsetsDirectional.fromSTEB(
                                                          0.0, 0.0, 4.0, 0.0),
                                                  color: const Color(0xFFDC2626),
                                                  textStyle: AppTheme.of(
                                                          context)
                                                      .titleSmall
                                                      .override(
                                                        font: GoogleFonts.lexend(
                                                          fontWeight: FontWeight.w600,
                                                          fontStyle:
                                                              AppTheme.of(
                                                                      context)
                                                                  .titleSmall
                                                                  .fontStyle,
                                                        ),
                                                        color: Colors.white,
                                                        fontSize: 13.0,
                                                        letterSpacing: 0.0,
                                                        fontWeight: FontWeight.w600,
                                                        fontStyle:
                                                            AppTheme.of(context)
                                                                .titleSmall
                                                                .fontStyle,
                                                      ),
                                                  elevation: 0.0,
                                                  borderRadius:
                                                      BorderRadius.circular(14.0),
                                                  disabledColor:
                                                      AppTheme.of(context)
                                                          .alternate,
                                                  disabledTextColor:
                                                      AppTheme.of(context)
                                                          .secondaryText,
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
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
