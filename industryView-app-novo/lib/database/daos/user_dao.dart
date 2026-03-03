import 'package:sqflite/sqflite.dart';
import '../database_helper.dart';
import '../models/user_model.dart';

class UserDao {
  final DatabaseHelper _dbHelper = DatabaseHelper.instance;

  Future<int> insert(UserModel user) async {
    try {
      final db = await _dbHelper.database;
      return await db.insert(
        'users',
        user.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    } catch (e) {
      print('UserDao: Erro ao inserir usuário: $e');
      rethrow;
    }
  }

  Future<int> update(UserModel user) async {
    try {
      final db = await _dbHelper.database;
      return await db.update(
        'users',
        user.toMap(),
        where: 'user_id = ?',
        whereArgs: [user.userId],
      );
    } catch (e) {
      print('UserDao: Erro ao atualizar usuário: $e');
      rethrow;
    }
  }

  Future<int> delete(int userId) async {
    try {
      final db = await _dbHelper.database;
      return await db.delete(
        'users',
        where: 'user_id = ?',
        whereArgs: [userId],
      );
    } catch (e) {
      print('UserDao: Erro ao deletar usuário: $e');
      rethrow;
    }
  }

  Future<UserModel?> findById(int userId) async {
    try {
      final db = await _dbHelper.database;
      final maps = await db.query(
        'users',
        where: 'user_id = ?',
        whereArgs: [userId],
        limit: 1,
      );

      if (maps.isEmpty) return null;
      return UserModel.fromMap(maps.first);
    } catch (e) {
      print('UserDao: Erro ao buscar usuário por ID: $e');
      return null;
    }
  }

  Future<List<UserModel>> findAll({
    int? teamsId,
    int? projectId,
    String? search,
    int? limit,
    int? offset,
  }) async {
    try {
      final db = await _dbHelper.database;
      String where = '1=1';
      List<dynamic> whereArgs = [];

      if (teamsId != null) {
        where += ' AND teams_id = ?';
        whereArgs.add(teamsId);
      }

      if (projectId != null) {
        where += ' AND project_id = ?';
        whereArgs.add(projectId);
      }

      if (search != null && search.isNotEmpty) {
        where += ' AND (name LIKE ? OR email LIKE ?)';
        final searchPattern = '%$search%';
        whereArgs.add(searchPattern);
        whereArgs.add(searchPattern);
      }

      final maps = await db.query(
        'users',
        where: where,
        whereArgs: whereArgs.isNotEmpty ? whereArgs : null,
        limit: limit,
        offset: offset,
        orderBy: 'name ASC',
      );

      return maps.map((map) => UserModel.fromMap(map)).toList();
    } catch (e) {
      print('UserDao: Erro ao buscar usuários: $e');
      return [];
    }
  }

  Future<void> insertOrUpdateBatch(List<UserModel> users) async {
    try {
      final db = await _dbHelper.database;
      await db.transaction((txn) async {
        final batch = txn.batch();

        for (final user in users) {
          batch.insert(
            'users',
            user.toMap(),
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
        }

        await batch.commit(noResult: false);
      });
    } catch (e) {
      print('UserDao: Erro ao inserir/atualizar batch de usuários: $e');
      rethrow;
    }
  }
}
