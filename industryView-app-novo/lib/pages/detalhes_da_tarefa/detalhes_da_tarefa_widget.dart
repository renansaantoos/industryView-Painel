import '/auth/custom_auth/auth_util.dart';
import '/backend/api_requests/api_calls.dart';
import '/backend/schema/structs/index.dart';
import '/components/nav_bar_widget.dart';
import '/components/offline_banner_widget.dart';
import '/components/modal_comment_widget.dart';
import '/widgets/sync_indicator_widget.dart';
import '/core/widgets/app_icon_button.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';
import 'dart:ui';
import '/index.dart';
import 'dart:async';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'detalhes_da_tarefa_model.dart';
export 'detalhes_da_tarefa_model.dart';

class DetalhesDaTarefaWidget extends StatefulWidget {
  const DetalhesDaTarefaWidget({
    super.key,
    this.item,
  });

  final dynamic item;

  static String routeName = 'DetalhesDaTarefa';
  static String routePath = '/detalhesDaTarefa';

  @override
  State<DetalhesDaTarefaWidget> createState() => _DetalhesDaTarefaWidgetState();
}

class _DetalhesDaTarefaWidgetState extends State<DetalhesDaTarefaWidget> {
  late DetalhesDaTarefaModel _model;

  final scaffoldKey = GlobalKey<ScaffoldState>();

  /// Parseia data que pode vir como int (ms since epoch) ou String (ISO date)
  DateTime? _parseDate(dynamic value) {
    if (value == null) return null;
    if (value is int) return DateTime.fromMillisecondsSinceEpoch(value);
    if (value is String && value.isNotEmpty) {
      try {
        return DateTime.parse(value);
      } catch (_) {
        return null;
      }
    }
    return null;
  }

  @override
  void initState() {
    super.initState();
    _model = createModel(context, () => DetalhesDaTarefaModel());

    // On page load action.
    SchedulerBinding.instance.addPostFrameCallback((_) async {
      _model.validTokenCopy = await AuthenticationGroup
          .getTheRecordBelongingToTheAuthenticationTokenCall
          .call(
        bearerAuth: currentAuthenticationToken,
      );

      if ((_model.validTokenCopy?.succeeded ?? true)) {
        return;
      }

      AppState().loading = false;
      safeSetState(() {});
      return;
    });

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

    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: AppTheme.of(context).secondaryBackground,
        appBar: AppBar(
          backgroundColor: AppTheme.of(context).secondaryBackground,
          automaticallyImplyLeading: false,
          actions: const [
            Padding(
              padding: EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 12.0, 0.0),
              child: SyncIndicatorWidget(
                showText: false,
                size: 20.0,
              ),
            ),
          ],
          title: Padding(
            padding: EdgeInsetsDirectional.fromSTEB(12.0, 0.0, 0.0, 0.0),
            child: Row(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                AppIconButton(
                  borderColor: AppTheme.of(context).primary,
                  borderRadius: 8.0,
                  buttonSize: 32.0,
                  fillColor: AppTheme.of(context).secondary,
                  icon: Icon(
                    Icons.arrow_back,
                    color: AppTheme.of(context).primary,
                    size: 16.0,
                  ),
                  onPressed: () async {
                    AppState().update(() {});
                    context.safePop();
                  },
                ),
                Text(
                  'COD: ${valueOrDefault<String>(
                    getJsonField(
                      widget!.item,
                      r'''$.id''',
                    )?.toString(),
                    ' - ',
                  )}',
                  style: AppTheme.of(context).headlineSmall.override(
                        font: GoogleFonts.lexend(
                          fontWeight: AppTheme.of(context)
                              .headlineSmall
                              .fontWeight,
                          fontStyle: AppTheme.of(context)
                              .headlineSmall
                              .fontStyle,
                        ),
                        color: AppTheme.of(context).primary,
                        letterSpacing: 0.0,
                        fontWeight: AppTheme.of(context)
                            .headlineSmall
                            .fontWeight,
                        fontStyle: AppTheme.of(context)
                            .headlineSmall
                            .fontStyle,
                      ),
                ),
                Container(
                  width: 32.0,
                  height: 32.0,
                  decoration: BoxDecoration(
                    color: AppTheme.of(context).secondaryBackground,
                  ),
                ),
              ].divide(SizedBox(width: 12.0)),
            ),
          ),
          centerTitle: false,
          elevation: 0.0,
        ),
        body: SafeArea(
          top: true,
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24.0, 8.0, 24.0, 24.0),
            child: _buildDetailsBody(context),
          ),
        ),
        bottomNavigationBar: _buildActionBar(context),
      ),
    );
  }

  // ─── Helpers de formatação ──────────────────────────────────────────────────

  String _formatDate(dynamic value) {
    final dt = _parseDate(value);
    if (dt == null) return '—';
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
  }

  String _formatDateTime(dynamic value) {
    final dt = _parseDate(value);
    if (dt == null) return '—';
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
  }

  /// Retorna (label, cor texto, cor fundo) do status de agendamento
  ({String label, Color color, Color bgColor})? _getScheduleStatus() {
    final statusId = castToType<int>(getJsonField(widget.item, r'''$.sprints_tasks_statuses_id'''));
    if (statusId == 3) {
      return (label: 'Concluído', color: const Color(0xFF16a34a), bgColor: const Color(0x2622c55e));
    }
    if (statusId == 4) {
      return (label: 'Sem Sucesso', color: const Color(0xFFdc2626), bgColor: const Color(0x26ef4444));
    }
    final scheduledFor = getJsonField(widget.item, r'''$.scheduled_for''')?.toString();
    if (scheduledFor == null || scheduledFor.isEmpty) return null;
    final scheduled = _parseDate(scheduledFor);
    if (scheduled == null) return null;
    final today = DateTime(DateTime.now().year, DateTime.now().month, DateTime.now().day);
    final schedDay = DateTime(scheduled.year, scheduled.month, scheduled.day);
    if (schedDay.compareTo(today) >= 0) {
      return (label: 'Em dia', color: const Color(0xFF16a34a), bgColor: const Color(0x2622c55e));
    }
    return (label: 'Atrasado', color: const Color(0xFFdc2626), bgColor: const Color(0x26ef4444));
  }

  /// Retorna (cor texto, cor fundo) para criticidade
  ({Color color, Color bgColor}) _getCriticalityColors(String criticality) {
    switch (criticality.toLowerCase()) {
      case 'baixa':
        return (color: const Color(0xFF16a34a), bgColor: const Color(0x2622c55e));
      case 'media':
        return (color: const Color(0xFFca8a04), bgColor: const Color(0x26eab308));
      case 'alta':
        return (color: const Color(0xFFea580c), bgColor: const Color(0x26f97316));
      case 'critica':
        return (color: const Color(0xFFdc2626), bgColor: const Color(0x26ef4444));
      default:
        return (color: AppTheme.of(context).secondaryText, bgColor: AppTheme.of(context).alternate);
    }
  }

  String _getCriticalityLabel(String criticality) {
    switch (criticality.toLowerCase()) {
      case 'baixa': return 'Baixa';
      case 'media': return 'Média';
      case 'alta': return 'Alta';
      case 'critica': return 'Crítica';
      default: return criticality;
    }
  }

  // ─── Body principal com layout igual ao painel ────────────────────────────

  Widget _buildDetailsBody(BuildContext context) {
    final item = widget.item;

    // ── Dados extraídos do JSON ──
    final taskName = valueOrDefault<String>(
      (getJsonField(item, r'''$.projects_backlogs.tasks_template.description''') ??
              getJsonField(item, r'''$.projects_backlogs.description'''))
          ?.toString(),
      'Tarefa',
    );
    final subtaskDesc = getJsonField(item, r'''$.subtasks.description''')?.toString();
    final teamName = getJsonField(item, r'''$.teams.name''')?.toString();
    final criticality = getJsonField(item, r'''$.criticality''')?.toString();
    final statusName = getJsonField(item, r'''$.sprints_tasks_statuses.name''')?.toString();

    final qtyAssigned = castToType<double>(getJsonField(item, r'''$.quantity_assigned''')) ?? 0.0;
    final qtyDone = castToType<double>(getJsonField(item, r'''$.quantity_done''')) ?? 0.0;
    final pct = qtyAssigned > 0 ? ((qtyDone / qtyAssigned) * 100).round() : 0;

    final discipline = getJsonField(item, r'''$.projects_backlogs.discipline.discipline''')?.toString() ??
        getJsonField(item, r'''$.projects_backlogs.discipline.name''')?.toString();
    final unityName = getJsonField(item, r'''$.projects_backlogs.unity.abbreviation''')?.toString() ??
        getJsonField(item, r'''$.projects_backlogs.unity.unity''')?.toString() ??
        getJsonField(item, r'''$.projects_backlogs.unity.name''')?.toString();
    final equipType = getJsonField(item, r'''$.projects_backlogs.equipaments_types.type''')?.toString();
    final weight = getJsonField(item, r'''$.projects_backlogs.weight''');
    final wbsCode = getJsonField(item, r'''$.projects_backlogs.wbs_code''')?.toString();
    final installMethod = getJsonField(item, r'''$.projects_backlogs.tasks_template.installation_method''')?.toString();

    final scheduledFor = getJsonField(item, r'''$.scheduled_for''');
    final plannedStart = getJsonField(item, r'''$.projects_backlogs.planned_start_date''');
    final plannedEnd = getJsonField(item, r'''$.projects_backlogs.planned_end_date''');
    final updatedAt = getJsonField(item, r'''$.updated_at''');
    final actualStart = getJsonField(item, r'''$.actual_start_time''');
    final actualEnd = getJsonField(item, r'''$.actual_end_time''');

    final subtaskQty = castToType<double>(getJsonField(item, r'''$.subtasks.quantity'''));
    final subtaskQtyDone = castToType<double>(getJsonField(item, r'''$.subtasks.quantity_done''')) ?? 0.0;
    final subtaskUnity = getJsonField(item, r'''$.subtasks.unity.unity''')?.toString() ??
        getJsonField(item, r'''$.subtasks.unity.name''')?.toString() ?? '';

    final scheduleStatus = _getScheduleStatus();
    final hasInfoGeral = discipline != null || unityName != null || equipType != null || installMethod != null || wbsCode != null;
    final hasSubtask = subtaskDesc != null && subtaskDesc.isNotEmpty;
    final hasDates = scheduledFor != null || plannedStart != null || plannedEnd != null || actualStart != null || actualEnd != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Header: nome da tarefa + badges de status ──
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Text(
                taskName,
                style: GoogleFonts.lexend(
                  fontSize: 18.0,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.of(context).primaryText,
                  height: 1.3,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Wrap(
              spacing: 6.0,
              children: [
                if (scheduleStatus != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: scheduleStatus.bgColor,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      scheduleStatus.label,
                      style: GoogleFonts.lexend(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: scheduleStatus.color,
                      ),
                    ),
                  ),
                if (statusName != null && statusName.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.of(context).alternate,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      statusName,
                      style: GoogleFonts.lexend(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.of(context).secondaryText,
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),

        // ── Subtarefa descrição ──
        if (subtaskDesc != null && subtaskDesc.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              subtaskDesc,
              style: GoogleFonts.lexend(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: AppTheme.of(context).primary,
              ),
            ),
          ),

        // ── Badges: equipe + criticidade ──
        Padding(
          padding: const EdgeInsets.only(top: 12),
          child: Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              if (teamName != null && teamName.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppTheme.of(context).primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.people_outline, size: 11, color: AppTheme.of(context).primary),
                      const SizedBox(width: 4),
                      Text(
                        teamName,
                        style: GoogleFonts.lexend(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: AppTheme.of(context).primary,
                        ),
                      ),
                    ],
                  ),
                ),
              if (criticality != null && criticality.isNotEmpty) ...[
                Builder(builder: (context) {
                  final colors = _getCriticalityColors(criticality);
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                    decoration: BoxDecoration(
                      color: colors.bgColor,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      _getCriticalityLabel(criticality),
                      style: GoogleFonts.lexend(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: colors.color,
                      ),
                    ),
                  );
                }),
              ],
            ],
          ),
        ),

        const SizedBox(height: 16),
        Divider(color: AppTheme.of(context).alternate),
        const SizedBox(height: 16),

        // ── Progresso (se tiver quantidade atribuída) ──
        if (qtyAssigned > 0) ...[
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppTheme.of(context).alternate,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Progresso',
                      style: GoogleFonts.lexend(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.of(context).primaryText,
                      ),
                    ),
                    Text(
                      '$pct%',
                      style: GoogleFonts.lexend(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.of(context).primary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(3),
                  child: LinearProgressIndicator(
                    value: (pct / 100).clamp(0.0, 1.0),
                    minHeight: 6,
                    backgroundColor: AppTheme.of(context).secondaryBackground,
                    valueColor: AlwaysStoppedAnimation<Color>(AppTheme.of(context).primary),
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${_formatQty(qtyDone)} ${unityName ?? ''}',
                      style: GoogleFonts.lexend(fontSize: 12, color: AppTheme.of(context).secondaryText),
                    ),
                    Text(
                      '${_formatQty(qtyAssigned)} ${unityName ?? ''}',
                      style: GoogleFonts.lexend(fontSize: 12, color: AppTheme.of(context).secondaryText),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
        ],

        // ── Informações Gerais ──
        if (hasInfoGeral) ...[
          _buildSectionTitle('INFORMAÇÕES GERAIS'),
          _buildSectionCard([
            if (discipline != null) _buildDetailRow('Disciplina', discipline),
            if (unityName != null) _buildDetailRow('Unidade', unityName),
            if (equipType != null) _buildDetailRow('Equipamento', equipType),
            if (installMethod != null) _buildDetailRow('Método', installMethod),
            if (weight != null) _buildDetailRow('Peso', weight.toString()),
            if (wbsCode != null) _buildDetailRow('WBS', wbsCode),
          ]),
          const SizedBox(height: 4),
        ],

        // ── Subtarefa ──
        if (hasSubtask) ...[
          _buildSectionTitle('SUBTAREFA'),
          _buildSectionCard([
            _buildDetailRow('Descrição', subtaskDesc),
            if (subtaskQty != null)
              _buildDetailRow('Quantidade', '${_formatQty(subtaskQtyDone)} / ${_formatQty(subtaskQty)} $subtaskUnity'),
            _buildDetailRow('Quantidade Atribuída', _formatQty(qtyAssigned)),
          ]),
          const SizedBox(height: 4),
        ],

        // ── Datas ──
        if (hasDates) ...[
          _buildSectionTitle('DATAS'),
          _buildSectionCard([
            if (scheduledFor != null) _buildDetailRow('Agendada para', _formatDate(scheduledFor)),
            if (plannedStart != null) _buildDetailRow('Início Planejado', _formatDate(plannedStart)),
            if (plannedEnd != null) _buildDetailRow('Fim Planejado', _formatDate(plannedEnd)),
            if (actualStart != null) _buildDetailRow('Início Real', _formatDateTime(actualStart)),
            if (actualEnd != null) _buildDetailRow('Fim Real', _formatDateTime(actualEnd)),
            if (updatedAt != null) _buildDetailRow('Registrado em', _formatDateTime(updatedAt)),
          ]),
          const SizedBox(height: 4),
        ],
      ],
    );
  }

  // ── Widgets auxiliares ──

  String _formatQty(double value) {
    return value.truncateToDouble() == value ? value.toInt().toString() : value.toString();
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: GoogleFonts.lexend(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.8,
          color: AppTheme.of(context).secondaryText,
        ),
      ),
    );
  }

  Widget _buildSectionCard(List<Widget> rows) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.of(context).secondaryBackground,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.of(context).alternate),
      ),
      child: Column(children: rows),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppTheme.of(context).alternate, width: 1),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.lexend(
              fontSize: 13,
              color: AppTheme.of(context).secondaryText,
            ),
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value.isEmpty ? '—' : value,
              textAlign: TextAlign.right,
              style: GoogleFonts.lexend(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: AppTheme.of(context).primaryText,
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Verifica se a tarefa está em status pendente (1) ou em andamento (2)
  bool _isTaskActionable() {
    final statusId = castToType<int>(getJsonField(
      widget.item,
      r'''$.sprints_tasks_statuses_id''',
    ));
    return statusId == 1 || statusId == 2;
  }

  /// Constrói a barra de ações fixa na parte inferior
  Widget? _buildActionBar(BuildContext context) {
    if (!_isTaskActionable()) return null;

    return Container(
      padding: EdgeInsetsDirectional.fromSTEB(24.0, 12.0, 24.0, 24.0),
      decoration: BoxDecoration(
        color: AppTheme.of(context).secondaryBackground,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            // Botão Sucesso
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _model.isActionLoading
                    ? null
                    : () => _handleSuccess(context),
                icon: Icon(Icons.check_circle_outline, size: 20.0),
                label: Text('Concluir'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.of(context).success,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: 14.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                  textStyle: GoogleFonts.lexend(
                    fontSize: 14.0,
                    fontWeight: FontWeight.w600,
                  ),
                  elevation: 0,
                ),
              ),
            ),
            SizedBox(width: 12.0),
            // Botão Sem Sucesso
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _model.isActionLoading
                    ? null
                    : () => _handleFailure(context),
                icon: Icon(Icons.cancel_outlined, size: 20.0),
                label: Text('Sem Sucesso'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.of(context).error,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: 14.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.0),
                  ),
                  textStyle: GoogleFonts.lexend(
                    fontSize: 14.0,
                    fontWeight: FontWeight.w600,
                  ),
                  elevation: 0,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Lógica para marcar tarefa como concluída com sucesso (status 3)
  Future<void> _handleSuccess(BuildContext context) async {
    final taskId = castToType<int>(getJsonField(
      widget.item,
      r'''$.id''',
    ));
    final quantityAssigned =
        castToType<double>(getJsonField(widget.item, r'''$.quantity_assigned''')) ?? 0.0;

    if (quantityAssigned > 0) {
      // Tarefa com quantidade — abrir modal para informar quantidade executada
      await _showQuantityModal(context, taskId, quantityAssigned);
    } else {
      // Tarefa sem quantidade — concluir direto com confirmação
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (dialogContext) {
          return AlertDialog(
            backgroundColor: AppTheme.of(context).secondaryBackground,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16.0),
            ),
            title: Text(
              'Confirmar conclusão',
              style: GoogleFonts.lexend(
                fontWeight: FontWeight.w600,
                color: AppTheme.of(context).primaryText,
              ),
            ),
            content: Text(
              'Deseja marcar esta tarefa como concluída com sucesso?',
              style: GoogleFonts.lexend(
                color: AppTheme.of(context).secondaryText,
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogContext, false),
                child: Text(
                  'Cancelar',
                  style: GoogleFonts.lexend(
                    color: AppTheme.of(context).secondaryText,
                  ),
                ),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(dialogContext, true),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.of(context).success,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.0),
                  ),
                ),
                child: Text(
                  'Confirmar',
                  style: GoogleFonts.lexend(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          );
        },
      );

      if (confirmed != true) return;
      await _executeComplete(context, taskId, null);
    }
  }

  /// Modal para informar quantidade executada antes de concluir
  Future<void> _showQuantityModal(
      BuildContext context, int? taskId, double quantityAssigned) async {
    final controller = TextEditingController(
        text: quantityAssigned.truncateToDouble() == quantityAssigned
            ? quantityAssigned.toInt().toString()
            : quantityAssigned.toString());

    final taskName = valueOrDefault<String>(
      (getJsonField(widget.item, r'''$.projects_backlogs.tasks_template.description''') ??
              getJsonField(widget.item, r'''$.projects_backlogs.description'''))
          ?.toString(),
      '',
    );

    final result = await showDialog<double?>(
      context: context,
      barrierDismissible: false,
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
                      text: '(Designado: ${quantityAssigned.truncateToDouble() == quantityAssigned ? quantityAssigned.toInt() : quantityAssigned})',
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
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                autofocus: true,
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
                    borderSide: BorderSide(color: AppTheme.of(context).primary, width: 2.0),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 12.0),
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
                final qty = double.tryParse(controller.text) ?? quantityAssigned;
                Navigator.pop(dialogContext, qty);
              },
              icon: const Icon(Icons.check_circle_outline, size: 18.0),
              label: Text('Confirmar'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.of(context).primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8.0),
                ),
                textStyle: GoogleFonts.lexend(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        );
      },
    );

    if (result == null) return;
    await _executeComplete(context, taskId, result);
  }

  /// Executa a conclusão da tarefa via API
  Future<void> _executeComplete(BuildContext context, int? taskId, double? quantityDone) async {
    safeSetState(() => _model.isActionLoading = true);

    _model.statusUpdateResult =
        await SprintsGroup.atualizaStatusSingleTaskCall.call(
      sprintsTasksId: taskId,
      sprintsTasksStatusesId: 3,
      quantityDone: quantityDone,
      token: currentAuthenticationToken,
    );

    safeSetState(() => _model.isActionLoading = false);

    if (_model.statusUpdateResult?.succeeded ?? false) {
      // Vincular tarefa ao schedule do dia
      try {
        final scheduleId = AppState().user.sheduleId;
        if (scheduleId != null && scheduleId != 0 && taskId != null && taskId != 0) {
          ProjectsGroup.linkTasksToScheduleCall.call(
            token: currentAuthenticationToken,
            scheduleId: scheduleId,
            sprintsTasksIds: [taskId],
          );
        }
      } catch (_) {}
      _model.statusChanged = true;
      AppState().signalTasksRefresh();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Tarefa concluída com sucesso!'),
            backgroundColor: AppTheme.of(context).success,
          ),
        );
        context.safePop();
      }
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao atualizar status. Tente novamente.'),
            backgroundColor: AppTheme.of(context).error,
          ),
        );
      }
    }
  }

  /// Lógica para marcar tarefa sem sucesso (status 4) - abre modal de comentário
  Future<void> _handleFailure(BuildContext context) async {
    final taskId = castToType<int>(getJsonField(
      widget.item,
      r'''$.id''',
    ));
    final projectsBacklogsId = castToType<int>(getJsonField(
      widget.item,
      r'''$.projects_backlogs_id''',
    )) ?? castToType<int>(getJsonField(
      widget.item,
      r'''$.projects_backlogs.id''',
    )) ?? 0;
    final subtasksId = castToType<int>(getJsonField(
      widget.item,
      r'''$.subtasks_id''',
    )) ?? 0;

    final result = await showDialog<bool>(
      context: context,
      builder: (dialogContext) {
        return Dialog(
          elevation: 0,
          insetPadding: EdgeInsets.zero,
          backgroundColor: Colors.transparent,
          alignment: AlignmentDirectional(0.0, 0.0)
              .resolve(Directionality.of(context)),
          child: ModalCommentWidget(
            projectsBacklogsId: projectsBacklogsId,
            subtasksId: subtasksId,
            createdUserId: AppState().user.id,
            sprintTaskId: taskId ?? 0,
            scheduleId: AppState().user.sheduleId,
          ),
        );
      },
    );

    if (result == true) {
      _model.statusChanged = true;
      AppState().signalTasksRefresh();
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Tarefa marcada como sem sucesso.'),
            backgroundColor: AppTheme.of(context).error,
          ),
        );
        context.safePop();
      }
    }
  }
}
