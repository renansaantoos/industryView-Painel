import 'package:sqflite/sqflite.dart';
import '../database_helper.dart';
import '../models/task_state_override_model.dart';

class TaskStateOverrideDao {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<int> upsert(TaskStateOverrideModel item) async {
    final db = await _dbHelper.database;
    return await db.insert(
      'task_state_overrides',
      item.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<List<TaskStateOverrideModel>> findByTaskIds(
    List<int> sprintsTasksIds,
  ) async {
    if (sprintsTasksIds.isEmpty) return [];
    final db = await _dbHelper.database;
    final placeholders = List.filled(sprintsTasksIds.length, '?').join(',');
    final maps = await db.rawQuery(
      'SELECT * FROM task_state_overrides WHERE sprints_tasks_id IN ($placeholders)',
      sprintsTasksIds,
    );
    return maps.map((map) => TaskStateOverrideModel.fromMap(map)).toList();
  }

  Future<int> deleteByTaskId(int sprintsTasksId) async {
    final db = await _dbHelper.database;
    return await db.delete(
      'task_state_overrides',
      where: 'sprints_tasks_id = ?',
      whereArgs: [sprintsTasksId],
    );
  }

  Future<int> deleteByTaskIds(List<int> sprintsTasksIds) async {
    if (sprintsTasksIds.isEmpty) return 0;
    final db = await _dbHelper.database;
    final placeholders = List.filled(sprintsTasksIds.length, '?').join(',');
    return await db.rawDelete(
      'DELETE FROM task_state_overrides WHERE sprints_tasks_id IN ($placeholders)',
      sprintsTasksIds,
    );
  }
}
