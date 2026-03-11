import 'package:sqflite/sqflite.dart';
import '../database_helper.dart';

class RdoFinalizationDao {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  /// Verifica se já foi finalizado hoje
  Future<bool> wasFinalizedToday() async {
    final db = await _dbHelper.database;
    final today = DateTime.now();
    final todayStr = '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';
    
    final result = await db.query(
      'rdo_finalization',
      where: 'finalization_date = ?',
      whereArgs: [todayStr],
      limit: 1,
    );
    
    return result.isNotEmpty;
  }

  /// Registra a finalização de hoje
  Future<void> markAsFinalizedToday() async {
    final db = await _dbHelper.database;
    final today = DateTime.now();
    final todayStr = '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';
    final now = DateTime.now().millisecondsSinceEpoch;
    
    await db.insert(
      'rdo_finalization',
      {
        'finalization_date': todayStr,
        'created_at': now,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Remove o registro de finalização de hoje (para permitir nova jornada)
  Future<void> clearToday() async {
    final db = await _dbHelper.database;
    final today = DateTime.now();
    final todayStr = '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';
    await db.delete('rdo_finalization', where: 'finalization_date = ?', whereArgs: [todayStr]);
  }

  /// Obtém a data da última finalização
  Future<DateTime?> getLastFinalizationDate() async {
    final db = await _dbHelper.database;
    final result = await db.query(
      'rdo_finalization',
      orderBy: 'created_at DESC',
      limit: 1,
    );
    
    if (result.isEmpty) return null;
    
    try {
      final dateStr = result.first['finalization_date'] as String;
      final parts = dateStr.split('-');
      if (parts.length == 3) {
        return DateTime(
          int.parse(parts[0]),
          int.parse(parts[1]),
          int.parse(parts[2]),
        );
      }
    } catch (e) {
      return null;
    }
    
    return null;
  }
}
