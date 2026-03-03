// Helper para debug do banco de dados
// Use este arquivo para verificar comentários no banco

import 'package:sqflite/sqflite.dart';
import '../database/database_helper.dart';

class DebugDbHelper {
  static final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  /// Ver todas as tarefas com comentários
  static Future<List<Map<String, dynamic>>> getTasksWithComments() async {
    final db = await _dbHelper.database;
    return await db.query(
      'sprints_tasks',
      columns: [
        'id',
        'sprints_tasks_id',
        'description',
        'comment',
        'sprints_tasks_statuses_id',
        'updated_at',
        'synced_at',
      ],
      where: 'comment IS NOT NULL AND comment != ?',
      whereArgs: [''],
      orderBy: 'updated_at DESC',
    );
  }

  /// Ver tarefas com comentários não sincronizados
  static Future<List<Map<String, dynamic>>> getUnsyncedTasksWithComments() async {
    final db = await _dbHelper.database;
    return await db.query(
      'sprints_tasks',
      columns: [
        'sprints_tasks_id',
        'description',
        'comment',
        'updated_at',
      ],
      where: 'comment IS NOT NULL AND comment != ? AND synced_at IS NULL',
      whereArgs: [''],
      orderBy: 'updated_at DESC',
    );
  }

  /// Verificar comentário de uma tarefa específica
  static Future<Map<String, dynamic>?> getTaskComment(int taskId) async {
    final db = await _dbHelper.database;
    final results = await db.query(
      'sprints_tasks',
      columns: [
        'sprints_tasks_id',
        'description',
        'comment',
        'updated_at',
        'synced_at',
      ],
      where: 'sprints_tasks_id = ?',
      whereArgs: [taskId],
      limit: 1,
    );
    return results.isNotEmpty ? results.first : null;
  }

  /// Contar tarefas com comentários
  static Future<int> countTasksWithComments() async {
    final db = await _dbHelper.database;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM sprints_tasks WHERE comment IS NOT NULL AND comment != ?',
      [''],
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }

  /// Ver itens na fila de sincronização relacionados a tarefas
  static Future<List<Map<String, dynamic>>> getSyncQueueTasks() async {
    final db = await _dbHelper.database;
    return await db.query(
      'sync_queue',
      columns: [
        'id',
        'operation_id',
        'entity_type',
        'entity_id',
        'operation_type',
        'status',
        'created_at',
        'last_attempt_at',
      ],
      where: 'entity_type = ?',
      whereArgs: ['sprints_tasks'],
      orderBy: 'created_at DESC',
    );
  }

  /// Ver dados de um item específico da fila de sincronização
  static Future<Map<String, dynamic>?> getSyncQueueItem(int queueId) async {
    final db = await _dbHelper.database;
    final results = await db.query(
      'sync_queue',
      where: 'id = ?',
      whereArgs: [queueId],
      limit: 1,
    );
    if (results.isEmpty) return null;
    
    final item = results.first;
    // Decodificar o JSON dos dados
    try {
      final data = item['data'] as String?;
      if (data != null) {
        item['data_parsed'] = data; // Você pode usar json.decode(data) se necessário
      }
    } catch (e) {
      // Ignorar erro
    }
    return item;
  }
}
