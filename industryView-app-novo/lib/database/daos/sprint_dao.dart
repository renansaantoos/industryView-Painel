import 'package:sqflite/sqflite.dart';
import '../database_helper.dart';
import '../models/sprint_model.dart';

class SprintDao {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<int> insert(SprintModel sprint) async {
    final db = await _dbHelper.database;
    return await db.insert(
      'sprints',
      sprint.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<int> update(SprintModel sprint) async {
    final db = await _dbHelper.database;
    return await db.update(
      'sprints',
      sprint.toMap(),
      where: 'id = ?',
      whereArgs: [sprint.sprintId],
    );
  }

  Future<int> delete(int sprintId) async {
    final db = await _dbHelper.database;
    return await db.delete(
      'sprints',
      where: 'id = ?',
      whereArgs: [sprintId],
    );
  }

  Future<SprintModel?> findById(int sprintId) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'sprints',
      where: 'id = ?',
      whereArgs: [sprintId],
      limit: 1,
    );

    if (maps.isEmpty) return null;
    return SprintModel.fromMap(maps.first);
  }

  Future<int> updateServerIdByClientId({
    required String clientId,
    required int serverId,
  }) async {
    final db = await _dbHelper.database;
    return await db.rawUpdate(
      'UPDATE sprints SET id = ?, sprint_id = ? WHERE client_id = ?',
      [serverId, serverId, clientId],
    );
  }

  Future<List<SprintModel>> findAll({
    int? projectsId,
    int? dtStart,
    int? dtEnd,
    int? limit,
    int? offset,
  }) async {
    final db = await _dbHelper.database;
    String where = '1=1';
    List<dynamic> whereArgs = [];

    if (projectsId != null) {
      where += ' AND projects_id = ?';
      whereArgs.add(projectsId);
    }
    if (dtStart != null && dtStart > 0) {
      where += ' AND start_date >= ?';
      whereArgs.add(dtStart);
    }
    if (dtEnd != null && dtEnd > 0) {
      where += ' AND end_date <= ?';
      whereArgs.add(dtEnd);
    }

    final maps = await db.query(
      'sprints',
      where: where,
      whereArgs: whereArgs.isNotEmpty ? whereArgs : null,
      limit: limit,
      offset: offset,
      orderBy: 'start_date DESC',
    );

    return maps.map((map) => SprintModel.fromMap(map)).toList();
  }

  Future<SprintModel?> findActiveSprint(int projectsId) async {
    final db = await _dbHelper.database;
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    final maps = await db.query(
      'sprints',
      where: 'projects_id = ? AND start_date <= ? AND end_date >= ?',
      whereArgs: [projectsId, now, now],
      limit: 1,
      orderBy: 'start_date DESC',
    );

    if (maps.isEmpty) return null;
    return SprintModel.fromMap(maps.first);
  }

  Future<int> updateSyncedAt(int sprintId, int syncedAt) async {
    final db = await _dbHelper.database;
    return await db.rawUpdate(
      'UPDATE sprints SET synced_at = ? WHERE id = ?',
      [syncedAt, sprintId],
    );
  }

  Future<void> insertOrUpdateBatch(List<SprintModel> sprints) async {
    try {
      final db = await _dbHelper.database;
      await db.transaction((txn) async {
        final batch = txn.batch();

        for (final sprint in sprints) {
          batch.insert(
            'sprints',
            sprint.toMap(),
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }

        await batch.commit(noResult: false);
      });
    } catch (e) {
      print('SprintDao: Erro ao inserir/atualizar batch de sprints: $e');
      rethrow;
    }
  }
}
