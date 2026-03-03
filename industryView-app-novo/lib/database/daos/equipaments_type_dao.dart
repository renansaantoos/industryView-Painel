import 'package:sqflite/sqflite.dart';
import '../database_helper.dart';
import '../models/equipaments_type_model.dart';

class EquipamentsTypeDao {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<int> insert(EquipamentsTypeModel item) async {
    final db = await _dbHelper.database;
    return await db.insert(
      'equipaments_types',
      item.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<int> delete(int equipamentsTypeId) async {
    final db = await _dbHelper.database;
    return await db.delete(
      'equipaments_types',
      where: 'equipaments_type_id = ?',
      whereArgs: [equipamentsTypeId],
    );
  }

  Future<List<EquipamentsTypeModel>> findAll() async {
    final db = await _dbHelper.database;
    final maps = await db.query(
      'equipaments_types',
      orderBy: 'type ASC',
    );
    return maps.map((map) => EquipamentsTypeModel.fromMap(map)).toList();
  }
}
