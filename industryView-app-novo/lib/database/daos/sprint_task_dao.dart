import 'package:sqflite/sqflite.dart';
import '../database_helper.dart';
import '../models/sprint_task_model.dart';

class SprintTaskDao {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<int> insert(SprintTaskModel task) async {
    final db = await _dbHelper.database;
    return await db.insert(
      'sprints_tasks',
      task.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<int> update(SprintTaskModel task) async {
    final db = await _dbHelper.database;
    return await db.update(
      'sprints_tasks',
      task.toMap(),
      where: 'sprints_tasks_id = ?',
      whereArgs: [task.sprintsTasksId],
    );
  }

  Future<int> delete(int sprintsTasksId) async {
    final db = await _dbHelper.database;
    return await db.delete(
      'sprints_tasks',
      where: 'sprints_tasks_id = ?',
      whereArgs: [sprintsTasksId],
    );
  }

  Future<SprintTaskModel?> findById(int sprintsTasksId) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'sprints_tasks',
      where: 'sprints_tasks_id = ?',
      whereArgs: [sprintsTasksId],
      limit: 1,
    );

    if (maps.isEmpty) return null;
    return SprintTaskModel.fromMap(maps.first);
  }

  Future<int> updateServerIdByClientId({
    required String clientId,
    required int serverId,
  }) async {
    final db = await _dbHelper.database;
    return await db.rawUpdate(
      'UPDATE sprints_tasks SET id = ?, sprints_tasks_id = ? WHERE client_id = ?',
      [serverId, serverId, clientId],
    );
  }

  Future<List<SprintTaskModel>> findAll({
    int? sprintsId,
    int? projectsId,
    int? teamsId,
    int? equipamentsTypesId,
    String? search,
    int? limit,
    int? offset,
  }) async {
    final db = await _dbHelper.database;
    String where = '1=1';
    List<dynamic> whereArgs = [];

    if (sprintsId != null) {
      where += ' AND sprints_id = ?';
      whereArgs.add(sprintsId);
    }
    if (projectsId != null) {
      where += ' AND projects_id = ?';
      whereArgs.add(projectsId);
    }
    if (teamsId != null) {
      where += ' AND teams_id = ?';
      whereArgs.add(teamsId);
    }
    if (equipamentsTypesId != null) {
      where += ' AND equipaments_types_id = ?';
      whereArgs.add(equipamentsTypesId);
    }
    if (search != null && search.isNotEmpty) {
      where += ' AND description LIKE ?';
      whereArgs.add('%$search%');
    }

    final maps = await db.query(
      'sprints_tasks',
      where: where,
      whereArgs: whereArgs.isNotEmpty ? whereArgs : null,
      limit: limit,
      offset: offset,
      orderBy: 'updated_at DESC',
    );

    return maps.map((map) => SprintTaskModel.fromMap(map)).toList();
  }

  Future<List<SprintTaskModel>> findPendingSync() async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'sprints_tasks',
      where: 'synced_at IS NULL OR synced_at < updated_at',
      orderBy: 'updated_at ASC',
    );

    return maps.map((map) => SprintTaskModel.fromMap(map)).toList();
  }

  Future<int> updateSyncedAt(int sprintsTasksId, int syncedAt) async {
    final db = await _dbHelper.database;
    return await db.rawUpdate(
      'UPDATE sprints_tasks SET synced_at = ? WHERE sprints_tasks_id = ?',
      [syncedAt, sprintsTasksId],
    );
  }

  Future<int> count({
    int? sprintsId,
    int? projectsId,
    int? teamsId,
  }) async {
    final db = await _dbHelper.database;
    String where = '1=1';
    List<dynamic> whereArgs = [];

    if (sprintsId != null) {
      where += ' AND sprints_id = ?';
      whereArgs.add(sprintsId);
    }
    if (projectsId != null) {
      where += ' AND projects_id = ?';
      whereArgs.add(projectsId);
    }
    if (teamsId != null) {
      where += ' AND teams_id = ?';
      whereArgs.add(teamsId);
    }

    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM sprints_tasks WHERE $where',
      whereArgs.isNotEmpty ? whereArgs : null,
    );

    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<void> insertOrUpdateBatch(List<SprintTaskModel> tasks) async {
    try {
      final db = await _dbHelper.database;
      await db.transaction((txn) async {
        final batch = txn.batch();

        for (final task in tasks) {
          batch.insert(
            'sprints_tasks',
            task.toMap(),
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }

        await batch.commit(noResult: false);
      });
    } catch (e) {
      print('SprintTaskDao: Erro ao inserir/atualizar batch de tarefas: $e');
      rethrow;
    }
  }

  Future<void> fillMissingContext({
    required List<int> taskIds,
    int? sprintsId,
    int? projectsId,
    int? teamsId,
  }) async {
    if (taskIds.isEmpty) return;
    if (sprintsId == null && projectsId == null && teamsId == null) return;

    final db = await _dbHelper.database;
    final placeholders = List.filled(taskIds.length, '?').join(',');
    await db.rawUpdate(
      '''
      UPDATE sprints_tasks
      SET
        sprints_id = COALESCE(sprints_id, ?),
        projects_id = COALESCE(projects_id, ?),
        teams_id = COALESCE(teams_id, ?)
      WHERE sprints_tasks_id IN ($placeholders)
      ''',
      [
        sprintsId,
        projectsId,
        teamsId,
        ...taskIds,
      ],
    );
  }

  Future<void> updateStatusBatch(List<Map<String, dynamic>> updates) async {
    if (updates.isEmpty) return;
    final db = await _dbHelper.database;
    await db.transaction((txn) async {
      final batch = txn.batch();
      final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;

      for (final update in updates) {
        final rawTaskId = update['sprints_tasks_id'];
        final taskId = rawTaskId is int
            ? rawTaskId
            : (rawTaskId is String ? int.tryParse(rawTaskId) : null);
        if (taskId == null) continue;

        final comment = update['comment'] as String?;
        // Sempre atualizar o comentário se fornecido (não null e não vazio)
        // Se comment for null ou vazio, manter o comentário existente
        batch.rawUpdate(
          '''
        UPDATE sprints_tasks
        SET
          sprints_tasks_statuses_id = ?,
          quantity_done = ?,
          check_field = ?,
          sucesso = ?,
          comment = CASE WHEN ? IS NOT NULL AND ? != '' THEN ? ELSE comment END,
          updated_at = ?,
          synced_at = NULL
        WHERE sprints_tasks_id = ?
        ''',
          [
            update['sprints_tasks_statuses_id'],
            update['quantity_done'],
            update['check_field'],
            update['sucesso'],
            comment, // Para verificar se é null
            comment, // Para verificar se é vazio
            comment, // Valor a ser usado se não for null nem vazio
            now,
            taskId,
          ],
        );
      }

      await batch.commit(noResult: true);
    });
  }

  Future<void> updateInspectionStatus({
    required int taskId,
    required int checkField,
    int? sucesso,
    String? comment,
    int? statusId,
    int? checkTasks,
  }) async {
    final db = await _dbHelper.database;
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    await db.rawUpdate(
      '''
      UPDATE sprints_tasks
      SET
        check_field = ?,
        sucesso = ?,
        comment = ?,
        sprints_tasks_statuses_id = COALESCE(?, sprints_tasks_statuses_id),
        check_tasks = COALESCE(?, check_tasks),
        updated_at = ?,
        synced_at = NULL
      WHERE sprints_tasks_id = ?
      ''',
      [
        checkField,
        sucesso,
        comment,
        statusId,
        checkTasks,
        now,
        taskId,
      ],
    );
  }

  Future<void> updateTaskComment({
    required int taskId,
    required String comment,
  }) async {
    final db = await _dbHelper.database;
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    await db.rawUpdate(
      '''
      UPDATE sprints_tasks
      SET
        comment = ?,
        updated_at = ?,
        synced_at = NULL
      WHERE sprints_tasks_id = ?
      ''',
      [
        comment,
        now,
        taskId,
      ],
    );
  }
}
