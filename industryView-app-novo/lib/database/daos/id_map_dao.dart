import 'package:sqflite/sqflite.dart';
import '../database_helper.dart';
import '../models/id_map_model.dart';

class IdMapDao {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<int> insert(IdMapModel map) async {
    final db = await _dbHelper.database;
    return await db.insert(
      'id_map',
      map.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<IdMapModel?> findByClientId({
    required String entityType,
    required String clientId,
  }) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'id_map',
      where: 'entity_type = ? AND client_id = ?',
      whereArgs: [entityType, clientId],
      limit: 1,
    );
    if (maps.isEmpty) return null;
    return IdMapModel.fromMap(maps.first);
  }

  Future<IdMapModel?> findByServerId({
    required String entityType,
    required String serverId,
  }) async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'id_map',
      where: 'entity_type = ? AND server_id = ?',
      whereArgs: [entityType, serverId],
      limit: 1,
    );
    if (maps.isEmpty) return null;
    return IdMapModel.fromMap(maps.first);
  }
}
