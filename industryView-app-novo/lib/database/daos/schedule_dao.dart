import 'dart:convert';

import 'package:sqflite/sqflite.dart';
import '../database_helper.dart';
import '../models/schedule_model.dart';

class ScheduleDao {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<int> insert(ScheduleModel schedule) async {
    final db = await _dbHelper.database;
    return await db.insert(
      'schedules',
      schedule.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<int> update(ScheduleModel schedule) async {
    final db = await _dbHelper.database;
    return await db.update(
      'schedules',
      schedule.toMap(),
      where: 'schedule_id = ?',
      whereArgs: [schedule.scheduleId],
    );
  }

  Future<int> delete(int scheduleId) async {
    final db = await _dbHelper.database;
    return await db.delete(
      'schedules',
      where: 'schedule_id = ?',
      whereArgs: [scheduleId],
    );
  }

  Future<ScheduleModel?> findById(int scheduleId) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'schedules',
      where: 'schedule_id = ?',
      whereArgs: [scheduleId],
      limit: 1,
    );

    if (maps.isEmpty) return null;
    return ScheduleModel.fromMap(maps.first);
  }

  Future<int> updateServerIdByClientId({
    required String clientId,
    required int serverId,
  }) async {
    final db = await _dbHelper.database;
    return await db.rawUpdate(
      'UPDATE schedules SET id = ?, schedule_id = ? WHERE client_id = ?',
      [serverId, serverId, clientId],
    );
  }

  Future<ScheduleModel?> findByClientId(String clientId) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'schedules',
      where: 'client_id = ?',
      whereArgs: [clientId],
      limit: 1,
    );
    if (maps.isEmpty) return null;
    return ScheduleModel.fromMap(maps.first);
  }

  Future<List<ScheduleModel>> findAll({
    int? projectsId,
    int? teamsId,
    int? sprintsId,
    String? scheduleDate,
  }) async {
    final db = await _dbHelper.database;
    String where = '1=1';
    List<dynamic> whereArgs = [];

    if (projectsId != null) {
      where += ' AND projects_id = ?';
      whereArgs.add(projectsId);
    }
    if (teamsId != null) {
      where += ' AND teams_id = ?';
      whereArgs.add(teamsId);
    }
    if (sprintsId != null) {
      where += ' AND sprints_id = ?';
      whereArgs.add(sprintsId);
    }
    if (scheduleDate != null) {
      where += ' AND schedule_date = ?';
      whereArgs.add(scheduleDate);
    }

    final maps = await db.query(
      'schedules',
      where: where,
      whereArgs: whereArgs.isNotEmpty ? whereArgs : null,
      orderBy: 'schedule_date DESC',
    );

    return maps.map((map) => ScheduleModel.fromMap(map)).toList();
  }

  Future<int> updateSyncedAt(int scheduleId, int syncedAt) async {
    final db = await _dbHelper.database;
    return await db.rawUpdate(
      'UPDATE schedules SET synced_at = ? WHERE schedule_id = ?',
      [syncedAt, scheduleId],
    );
  }

  Future<void> updateUsersIds({
    required int scheduleId,
    required List<int> usersId,
  }) async {
    final db = await _dbHelper.database;
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    await db.rawUpdate(
      '''
      UPDATE schedules
      SET
        users_id = ?,
        updated_at = ?,
        synced_at = NULL
      WHERE schedule_id = ?
      ''',
      [
        json.encode(usersId),
        now,
        scheduleId,
      ],
    );
  }

  Future<void> updateSprintsTasksIds({
    required int scheduleId,
    required List<dynamic> sprintsTasksId,
  }) async {
    final db = await _dbHelper.database;
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    await db.rawUpdate(
      '''
      UPDATE schedules
      SET
        sprints_tasks_id = ?,
        updated_at = ?,
        synced_at = NULL
      WHERE schedule_id = ?
      ''',
      [
        json.encode(sprintsTasksId),
        now,
        scheduleId,
      ],
    );
  }
}
