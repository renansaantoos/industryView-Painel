import 'package:sqflite/sqflite.dart';
import '../database_helper.dart';
import '../models/sync_conflict_model.dart';

class SyncConflictDao {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<int> insert(SyncConflictModel conflict) async {
    final db = await _dbHelper.database;
    return await db.insert(
      'sync_conflicts',
      conflict.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<int> update(SyncConflictModel conflict) async {
    final db = await _dbHelper.database;
    return await db.update(
      'sync_conflicts',
      conflict.toMap(),
      where: 'id = ?',
      whereArgs: [conflict.id],
    );
  }

  Future<SyncConflictModel?> findById(int id) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'sync_conflicts',
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );
    if (maps.isEmpty) return null;
    return SyncConflictModel.fromMap(maps.first);
  }

  Future<int> countPending() async {
    final db = await _dbHelper.database;
    final result = await db.rawQuery(
      "SELECT COUNT(*) as count FROM sync_conflicts WHERE status = 'pending'",
    );
    return Sqflite.firstIntValue(result) ?? 0;
  }

  Future<List<SyncConflictModel>> findPending({
    int? limit,
    int? offset,
  }) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'sync_conflicts',
      where: "status = 'pending'",
      limit: limit,
      offset: offset,
      orderBy: 'created_at DESC',
    );
    return maps.map(SyncConflictModel.fromMap).toList();
  }

  Future<List<SyncConflictModel>> findAll({
    String? status,
    int? limit,
    int? offset,
  }) async {
    final db = await _dbHelper.database;
    String where = '1=1';
    final args = <dynamic>[];
    if (status != null) {
      where += ' AND status = ?';
      args.add(status);
    }
    final maps = await db.query(
      'sync_conflicts',
      where: where,
      whereArgs: args.isEmpty ? null : args,
      limit: limit,
      offset: offset,
      orderBy: 'created_at DESC',
    );
    return maps.map(SyncConflictModel.fromMap).toList();
  }
}
