import 'package:sqflite/sqflite.dart';
import '../database_helper.dart';
import '../models/sync_queue_model.dart';

class SyncQueueDao {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<int> insert(SyncQueueModel item) async {
    final db = await _dbHelper.database;
    return await db.insert(
      'sync_queue',
      item.toMap(),
      conflictAlgorithm: ConflictAlgorithm.ignore,
    );
  }

  Future<int> update(SyncQueueModel item) async {
    final db = await _dbHelper.database;
    return await db.update(
      'sync_queue',
      item.toMap(),
      where: 'id = ?',
      whereArgs: [item.id],
    );
  }

  Future<int> delete(int id) async {
    final db = await _dbHelper.database;
    return await db.delete(
      'sync_queue',
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<SyncQueueModel?> findById(int id) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'sync_queue',
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );

    if (maps.isEmpty) return null;
    return SyncQueueModel.fromMap(maps.first);
  }

  Future<SyncQueueModel?> findByOperationId(String operationId) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'sync_queue',
      where: 'operation_id = ?',
      whereArgs: [operationId],
      limit: 1,
    );
    if (maps.isEmpty) return null;
    return SyncQueueModel.fromMap(maps.first);
  }

  Future<List<SyncQueueModel>> findPending({
    int? limit,
    String? entityType,
  }) async {
    try {
      final db = await _dbHelper.database;
      String where =
          "status = 'pending' AND (next_attempt_at IS NULL OR next_attempt_at <= ?)";
      final now = DateTime.now().millisecondsSinceEpoch;
      List<dynamic> whereArgs = [now];

      if (entityType != null) {
        where += ' AND entity_type = ?';
        whereArgs.add(entityType);
      }

      final maps = await db.query(
        'sync_queue',
        where: where,
        whereArgs: whereArgs.isNotEmpty ? whereArgs : null,
        limit: limit,
        orderBy: 'created_at ASC',
      );

      return maps.map((map) => SyncQueueModel.fromMap(map)).toList();
    } catch (e) {
      // Retornar lista vazia em caso de erro para não quebrar o app
      print('SyncQueueDao: Erro ao buscar pending items: $e');
      return [];
    }
  }

  Future<SyncQueueModel?> findEquivalent({
    required SyncOperationType operationType,
    required String entityType,
    required int? entityId,
    required String data,
  }) async {
    final db = await _dbHelper.database;
    final whereArgs = <dynamic>[operationType.name, entityType, data];
    String where =
        "operation_type = ? AND entity_type = ? AND data = ? AND status IN ('pending', 'syncing')";
    if (entityId == null) {
      where += ' AND entity_id IS NULL';
    } else {
      where += ' AND entity_id = ?';
      whereArgs.add(entityId);
    }
    final maps = await db.query(
      'sync_queue',
      where: where,
      whereArgs: whereArgs,
      limit: 1,
      orderBy: 'created_at DESC',
    );
    if (maps.isEmpty) return null;
    return SyncQueueModel.fromMap(maps.first);
  }

  Future<List<SyncQueueModel>> findAll({
    SyncStatus? status,
    String? entityType,
    int? limit,
    int? offset,
  }) async {
    final db = await _dbHelper.database;
    String where = '1=1';
    List<dynamic> whereArgs = [];

    if (status != null) {
      where += " AND status = ?";
      whereArgs.add(status.name);
    }
    if (entityType != null) {
      where += ' AND entity_type = ?';
      whereArgs.add(entityType);
    }

    final maps = await db.query(
      'sync_queue',
      where: where,
      whereArgs: whereArgs.isNotEmpty ? whereArgs : null,
      limit: limit,
      offset: offset,
      orderBy: 'created_at DESC',
    );

    return maps.map((map) => SyncQueueModel.fromMap(map)).toList();
  }

  Future<int> countPending() async {
    final db = await _dbHelper.database;
    final result = await db.rawQuery(
      "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'",
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<int> countFailed() async {
    final db = await _dbHelper.database;
    final result = await db.rawQuery(
      "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'failed'",
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<int> deleteCompleted(int olderThanDays) async {
    final db = await _dbHelper.database;
    final cutoffTime = DateTime.now()
        .subtract(Duration(days: olderThanDays))
        .millisecondsSinceEpoch;
    return await db.delete(
      'sync_queue',
      where: "status = 'completed' AND updated_at < ?",
      whereArgs: [cutoffTime],
    );
  }

  Future<int> incrementRetryCount(int id) async {
    final db = await _dbHelper.database;
    return await db.rawUpdate(
      'UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?',
      [id],
    );
  }

  Future<int> resetSyncingToPending() async {
    final db = await _dbHelper.database;
    return await db.rawUpdate(
      "UPDATE sync_queue SET status = 'pending' WHERE status = 'syncing'",
    );
  }

  Future<void> sanitizeQueue() async {
    final db = await _dbHelper.database;
    await db.rawUpdate(
      "UPDATE sync_queue SET status = 'pending' WHERE status NOT IN ('pending','syncing','completed','failed','conflict')",
    );
    await db.rawUpdate(
      "UPDATE sync_queue SET retry_count = 0 WHERE retry_count IS NULL OR retry_count < 0",
    );
  }
}
