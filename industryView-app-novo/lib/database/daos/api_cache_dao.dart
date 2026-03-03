import 'package:sqflite/sqflite.dart';
import '../database_helper.dart';
import '../models/api_cache_model.dart';

class ApiCacheDao {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<void> upsert(ApiCacheModel item) async {
    final db = await _dbHelper.database;
    await db.insert(
      'api_cache',
      item.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<ApiCacheModel?> findByKey(String cacheKey) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'api_cache',
      where: 'cache_key = ?',
      whereArgs: [cacheKey],
      limit: 1,
    );
    if (maps.isEmpty) return null;
    return ApiCacheModel.fromMap(maps.first);
  }
}
