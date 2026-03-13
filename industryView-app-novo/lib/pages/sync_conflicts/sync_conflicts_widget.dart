import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import '/database/daos/sync_conflict_dao.dart';
import '/database/models/sync_conflict_model.dart';
import '/services/sync_service.dart';
import '/core/theme/app_theme.dart';
import '/core/utils/app_utils.dart';
import '/core/widgets/app_button.dart';

class SyncConflictsWidget extends StatefulWidget {
  const SyncConflictsWidget({super.key});

  static String routeName = 'SyncConflicts';
  static String routePath = '/sync-conflicts';

  @override
  State<SyncConflictsWidget> createState() => _SyncConflictsWidgetState();
}

class _SyncConflictsWidgetState extends State<SyncConflictsWidget> {
  final SyncConflictDao _conflictDao = SyncConflictDao();
  final SyncService _syncService = SyncService.instance;
  final scaffoldKey = GlobalKey<ScaffoldState>();

  List<SyncConflictModel> _conflicts = [];
  bool _isLoading = true;
  int? _expandedConflictId;

  @override
  void initState() {
    super.initState();
    _loadConflicts();
  }

  Future<void> _loadConflicts() async {
    setState(() => _isLoading = true);
    try {
      final conflicts = await _conflictDao.findPending();
      if (mounted) {
        setState(() {
          _conflicts = conflicts;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        _showSnackBar('Erro ao carregar conflitos: $e', isError: true);
      }
    }
  }

  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? AppTheme.of(context).error : null,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  String _getEntityTypeLabel(String entityType) {
    switch (entityType) {
      case 'sprints_tasks':
        return AppLocalizations.of(context).getVariableText(
          ptText: 'Tarefa de Sprint',
          esText: 'Tarea de Sprint',
          enText: 'Sprint Task',
        );
      case 'schedules':
        return AppLocalizations.of(context).getVariableText(
          ptText: 'Escala',
          esText: 'Escala',
          enText: 'Schedule',
        );
      case 'sprints':
        return AppLocalizations.of(context).getVariableText(
          ptText: 'Sprint',
          esText: 'Sprint',
          enText: 'Sprint',
        );
      case 'api_call':
        return AppLocalizations.of(context).getVariableText(
          ptText: 'Chamada API',
          esText: 'Llamada API',
          enText: 'API Call',
        );
      default:
        return entityType;
    }
  }

  String _getOperationTypeLabel(String operationType) {
    switch (operationType) {
      case 'create':
        return AppLocalizations.of(context).getVariableText(
          ptText: 'Criar',
          esText: 'Crear',
          enText: 'Create',
        );
      case 'update':
        return AppLocalizations.of(context).getVariableText(
          ptText: 'Atualizar',
          esText: 'Actualizar',
          enText: 'Update',
        );
      case 'delete':
        return AppLocalizations.of(context).getVariableText(
          ptText: 'Excluir',
          esText: 'Eliminar',
          enText: 'Delete',
        );
      default:
        return operationType;
    }
  }

  String _formatDate(int timestamp) {
    final date = DateTime.fromMillisecondsSinceEpoch(timestamp);
    return DateFormat('dd/MM/yyyy HH:mm').format(date);
  }

  String _formatJson(String jsonString) {
    try {
      final decoded = json.decode(jsonString);
      return const JsonEncoder.withIndent('  ').convert(decoded);
    } catch (_) {
      return jsonString;
    }
  }

  Future<void> _resolveConflict(SyncConflictModel conflict, bool keepLocal) async {
    try {
      final success = keepLocal
          ? await _syncService.resolveConflictKeepLocal(conflict.id!)
          : await _syncService.resolveConflictUseServer(conflict.id!);

      if (success) {
        setState(() {
          _conflicts.removeWhere((c) => c.id == conflict.id);
        });

        final message = keepLocal
            ? AppLocalizations.of(context).getVariableText(
                ptText: 'Conflito resolvido: manteve dados locais',
                esText: 'Conflicto resuelto: se mantuvieron datos locales',
                enText: 'Conflict resolved: kept local data',
              )
            : AppLocalizations.of(context).getVariableText(
                ptText: 'Conflito resolvido: usou dados do servidor',
                esText: 'Conflicto resuelto: se usaron datos del servidor',
                enText: 'Conflict resolved: used server data',
              );

        _showSnackBar(message);
      } else {
        _showSnackBar(
          AppLocalizations.of(context).getVariableText(
            ptText: 'Erro ao resolver conflito',
            esText: 'Error al resolver conflicto',
            enText: 'Error resolving conflict',
          ),
          isError: true,
        );
      }
    } catch (e) {
      _showSnackBar(
        '${AppLocalizations.of(context).getVariableText(
          ptText: 'Erro',
          esText: 'Error',
          enText: 'Error',
        )}: $e',
        isError: true,
      );
    }
  }

  Widget _buildConflictCard(SyncConflictModel conflict) {
    final isExpanded = _expandedConflictId == conflict.id;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      elevation: 2.0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InkWell(
            onTap: () {
              setState(() {
                _expandedConflictId = isExpanded ? null : conflict.id;
              });
            },
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(14.0),
              topRight: Radius.circular(14.0),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          _getEntityTypeLabel(conflict.entityType),
                          style: AppTheme.of(context).titleMedium.override(
                            fontWeight: FontWeight.w600,
                            color: AppTheme.of(context).primaryText,
                            letterSpacing: 0.0,
                          ),
                        ),
                      ),
                      Icon(
                        isExpanded ? Icons.expand_less : Icons.expand_more,
                        color: AppTheme.of(context).secondaryText,
                      ),
                    ],
                  ),
                  const SizedBox(height: 8.0),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8.0,
                          vertical: 4.0,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.of(context).accent2,
                          borderRadius: BorderRadius.circular(4.0),
                        ),
                        child: Text(
                          _getOperationTypeLabel(conflict.operationType),
                          style: AppTheme.of(context).labelSmall.override(
                            color: AppTheme.of(context).primary,
                            letterSpacing: 0.0,
                          ),
                        ),
                      ),
                      if (conflict.entityId != null) ...[
                        const SizedBox(width: 8.0),
                        Text(
                          'ID: ${conflict.entityId}',
                          style: AppTheme.of(context).labelSmall.override(
                            letterSpacing: 0.0,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 8.0),
                  Text(
                    _formatDate(conflict.createdAt),
                    style: AppTheme.of(context).labelSmall.override(
                      letterSpacing: 0.0,
                    ),
                  ),
                  if (conflict.errorMessage != null) ...[
                    const SizedBox(height: 8.0),
                    Container(
                      padding: const EdgeInsets.all(8.0),
                      decoration: BoxDecoration(
                        color: AppTheme.of(context).status01,
                        borderRadius: BorderRadius.circular(8.0),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 16.0,
                            color: AppTheme.of(context).error,
                          ),
                          const SizedBox(width: 8.0),
                          Expanded(
                            child: Text(
                              conflict.errorMessage!,
                              style: AppTheme.of(context).bodySmall.override(
                                color: AppTheme.of(context).error,
                                letterSpacing: 0.0,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          if (isExpanded) ...[
            const Divider(height: 1.0),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 600;

                  if (isWide) {
                    return Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: _buildPayloadSection(
                            title: AppLocalizations.of(context).getVariableText(
                              ptText: 'Dados Locais',
                              esText: 'Datos Locales',
                              enText: 'Local Data',
                            ),
                            payload: conflict.localPayload,
                          ),
                        ),
                        const SizedBox(width: 16.0),
                        Expanded(
                          child: _buildPayloadSection(
                            title: AppLocalizations.of(context).getVariableText(
                              ptText: 'Dados Servidor',
                              esText: 'Datos del Servidor',
                              enText: 'Server Data',
                            ),
                            payload: conflict.serverPayload,
                          ),
                        ),
                      ],
                    );
                  } else {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        _buildPayloadSection(
                          title: AppLocalizations.of(context).getVariableText(
                            ptText: 'Dados Locais',
                            esText: 'Datos Locales',
                            enText: 'Local Data',
                          ),
                          payload: conflict.localPayload,
                        ),
                        const SizedBox(height: 16.0),
                        _buildPayloadSection(
                          title: AppLocalizations.of(context).getVariableText(
                            ptText: 'Dados Servidor',
                            esText: 'Datos del Servidor',
                            enText: 'Server Data',
                          ),
                          payload: conflict.serverPayload,
                        ),
                      ],
                    );
                  }
                },
              ),
            ),
            const Divider(height: 1.0),
          ],
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: AppButton(
                    onPressed: () => _resolveConflict(conflict, true),
                    text: AppLocalizations.of(context).getVariableText(
                      ptText: 'Manter Local',
                      esText: 'Mantener Local',
                      enText: 'Keep Local',
                    ),
                    options: AppButtonOptions(
                      height: 40.0,
                      padding: const EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      iconPadding: const EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      color: AppTheme.of(context).primary,
                      textStyle: AppTheme.of(context).labelMedium.override(
                        color: AppTheme.of(context).info,
                        letterSpacing: 0.0,
                      ),
                      elevation: 0.0,
                      borderSide: const BorderSide(
                        color: Colors.transparent,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                ),
                const SizedBox(width: 12.0),
                Expanded(
                  child: AppButton(
                    onPressed: () => _resolveConflict(conflict, false),
                    text: AppLocalizations.of(context).getVariableText(
                      ptText: 'Usar Servidor',
                      esText: 'Usar Servidor',
                      enText: 'Use Server',
                    ),
                    options: AppButtonOptions(
                      height: 40.0,
                      padding: const EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      iconPadding: const EdgeInsetsDirectional.fromSTEB(0.0, 0.0, 0.0, 0.0),
                      color: AppTheme.of(context).secondaryBackground,
                      textStyle: AppTheme.of(context).labelMedium.override(
                        color: AppTheme.of(context).primary,
                        letterSpacing: 0.0,
                      ),
                      elevation: 0.0,
                      borderSide: BorderSide(
                        color: AppTheme.of(context).primary,
                        width: 1.0,
                      ),
                      borderRadius: BorderRadius.circular(8.0),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPayloadSection({required String title, String? payload}) {
    return Container(
      padding: const EdgeInsets.all(12.0),
      decoration: BoxDecoration(
        color: AppTheme.of(context).primaryBackground,
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTheme.of(context).labelMedium.override(
              fontWeight: FontWeight.w600,
              letterSpacing: 0.0,
            ),
          ),
          const SizedBox(height: 8.0),
          Container(
            constraints: const BoxConstraints(maxHeight: 200.0),
            child: SingleChildScrollView(
              child: Text(
                payload != null ? _formatJson(payload) : '-',
                style: AppTheme.of(context).bodySmall.override(
                  fontFamily: 'Courier',
                  letterSpacing: 0.0,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.check_circle_outline,
              size: 80.0,
              color: AppTheme.of(context).success,
            ),
            const SizedBox(height: 24.0),
            Text(
              AppLocalizations.of(context).getVariableText(
                ptText: 'Nenhum conflito pendente',
                esText: 'No hay conflictos pendientes',
                enText: 'No pending conflicts',
              ),
              style: AppTheme.of(context).headlineSmall.override(
                letterSpacing: 0.0,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8.0),
            Text(
              AppLocalizations.of(context).getVariableText(
                ptText: 'Todos os conflitos foram resolvidos',
                esText: 'Todos los conflictos han sido resueltos',
                enText: 'All conflicts have been resolved',
              ),
              style: AppTheme.of(context).bodyMedium.override(
                color: AppTheme.of(context).secondaryText,
                letterSpacing: 0.0,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: Scaffold(
        key: scaffoldKey,
        backgroundColor: AppTheme.of(context).primaryBackground,
        appBar: AppBar(
          backgroundColor: AppTheme.of(context).secondaryBackground,
          automaticallyImplyLeading: true,
          leading: IconButton(
            icon: Icon(
              Icons.arrow_back,
              color: AppTheme.of(context).primaryText,
            ),
            onPressed: () => context.safePop(),
          ),
          title: Text(
            AppLocalizations.of(context).getVariableText(
              ptText: 'Conflitos de Sincronização',
              esText: 'Conflictos de Sincronización',
              enText: 'Sync Conflicts',
            ),
            style: AppTheme.of(context).headlineMedium.override(
              letterSpacing: 0.0,
            ),
          ),
          actions: [
            if (_conflicts.isNotEmpty)
              IconButton(
                icon: Icon(
                  Icons.refresh,
                  color: AppTheme.of(context).primaryText,
                ),
                onPressed: _loadConflicts,
              ),
          ],
          centerTitle: false,
          elevation: 1.0,
        ),
        body: SafeArea(
          top: true,
          child: _isLoading
              ? Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      AppTheme.of(context).primary,
                    ),
                  ),
                )
              : _conflicts.isEmpty
                  ? _buildEmptyState()
                  : RefreshIndicator(
                      onRefresh: _loadConflicts,
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        itemCount: _conflicts.length,
                        itemBuilder: (context, index) {
                          return _buildConflictCard(_conflicts[index]);
                        },
                      ),
                    ),
        ),
      ),
    );
  }
}
