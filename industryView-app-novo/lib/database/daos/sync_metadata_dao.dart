import 'package:sqflite/sqflite.dart';
import '../database_helper.dart';
import '../models/sync_metadata_model.dart';

class SyncMetadataDao {
  static const String tableName = 'sync_metadata';
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  /// Get last sync timestamp for an entity type
  Future<DateTime?> getLastSyncAt(String entityType) async {
    try {
      final db = await _dbHelper.database;
      final maps = await db.query(
        tableName,
        where: 'entity_type = ?',
        whereArgs: [entityType],
        limit: 1,
      );

      if (maps.isEmpty) return null;

      final model = SyncMetadataModel.fromMap(maps.first);
      if (model.lastSyncAt == null) return null;

      return DateTime.fromMillisecondsSinceEpoch(model.lastSyncAt! * 1000);
    } catch (e) {
      print('SyncMetadataDao: Error getting last sync at: $e');
      return null;
    }
  }

  /// Update last sync timestamp for an entity type
  Future<void> updateLastSyncAt(String entityType, DateTime syncedAt) async {
    try {
      final db = await _dbHelper.database;
      final timestampSeconds = syncedAt.millisecondsSinceEpoch ~/ 1000;

      // Check if record exists
      final existing = await db.query(
        tableName,
        where: 'entity_type = ?',
        whereArgs: [entityType],
        limit: 1,
      );

      if (existing.isEmpty) {
        // Insert new record
        await db.insert(
          tableName,
          {
            'entity_type': entityType,
            'last_sync_at': timestampSeconds,
            'last_sync_status': 'success',
            'sync_version': 1,
          },
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      } else {
        // Update existing record
        await db.update(
          tableName,
          {
            'last_sync_at': timestampSeconds,
            'last_sync_status': 'success',
          },
          where: 'entity_type = ?',
          whereArgs: [entityType],
        );
      }
    } catch (e) {
      print('SyncMetadataDao: Error updating last sync at: $e');
      rethrow;
    }
  }

  /// Update sync status for an entity type
  Future<void> updateSyncStatus(String entityType, String status) async {
    try {
      final db = await _dbHelper.database;

      // Check if record exists
      final existing = await db.query(
        tableName,
        where: 'entity_type = ?',
        whereArgs: [entityType],
        limit: 1,
      );

      if (existing.isEmpty) {
        // Insert new record
        await db.insert(
          tableName,
          {
            'entity_type': entityType,
            'last_sync_status': status,
            'sync_version': 1,
          },
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
      } else {
        // Update existing record
        await db.update(
          tableName,
          {'last_sync_status': status},
          where: 'entity_type = ?',
          whereArgs: [entityType],
        );
      }
    } catch (e) {
      print('SyncMetadataDao: Error updating sync status: $e');
      rethrow;
    }
  }

  /// Reset all sync timestamps (for full re-sync)
  Future<void> resetAll() async {
    try {
      final db = await _dbHelper.database;
      await db.delete(tableName);
    } catch (e) {
      print('SyncMetadataDao: Error resetting all: $e');
      rethrow;
    }
  }

  /// Reset sync timestamp for a specific entity type
  Future<void> reset(String entityType) async {
    try {
      final db = await _dbHelper.database;
      await db.delete(
        tableName,
        where: 'entity_type = ?',
        whereArgs: [entityType],
      );
    } catch (e) {
      print('SyncMetadataDao: Error resetting entity type: $e');
      rethrow;
    }
  }

  /// Get sync metadata for an entity type
  Future<SyncMetadataModel?> findByEntityType(String entityType) async {
    try {
      final db = await _dbHelper.database;
      final maps = await db.query(
        tableName,
        where: 'entity_type = ?',
        whereArgs: [entityType],
        limit: 1,
      );

      if (maps.isEmpty) return null;
      return SyncMetadataModel.fromMap(maps.first);
    } catch (e) {
      print('SyncMetadataDao: Error finding by entity type: $e');
      return null;
    }
  }

  /// Get all sync metadata
  Future<List<SyncMetadataModel>> findAll() async {
    try {
      final db = await _dbHelper.database;
      final maps = await db.query(tableName);
      return maps.map((map) => SyncMetadataModel.fromMap(map)).toList();
    } catch (e) {
      print('SyncMetadataDao: Error finding all: $e');
      return [];
    }
  }
}
