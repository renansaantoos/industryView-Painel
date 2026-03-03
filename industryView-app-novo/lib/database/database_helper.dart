import 'dart:async';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._internal();
  static Database? _database;

  DatabaseHelper._internal();

  Future<Database> get database async {
    if (_database != null) return _database!;
    try {
      _database = await _initDatabase();
      return _database!;
    } catch (e) {
      // Se houver erro na inicialização, tentar novamente
      // Isso pode acontecer se o banco estiver corrompido ou bloqueado
      _database = null;
      _database = await _initDatabase();
      return _database!;
    }
  }

  Future<Database> _initDatabase() async {
    final documentsDirectory = await getApplicationDocumentsDirectory();
    final path = join(documentsDirectory.path, 'industryview.db');

    return await openDatabase(
      path,
      version: 10,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Sprints table
    await db.execute('''
      CREATE TABLE sprints (
        id INTEGER PRIMARY KEY,
        client_id TEXT,
        title TEXT,
        objective TEXT,
        start_date INTEGER,
        end_date INTEGER,
        progress_percentage REAL,
        tasks_concluidas INTEGER,
        tasks_andamento INTEGER,
        projects_id INTEGER,
        sprints_statuses_id INTEGER,
        updated_at INTEGER,
        created_at INTEGER,
        synced_at INTEGER
      )
    ''');

    // Sprints tasks table
    await db.execute('''
      CREATE TABLE sprints_tasks (
        id INTEGER PRIMARY KEY,
        sprints_tasks_id INTEGER,
        client_id TEXT,
        sprints_id INTEGER,
        projects_id INTEGER,
        teams_id INTEGER,
        description TEXT,
        sprints_tasks_statuses_id INTEGER,
        subtasks_id INTEGER,
        unity_id INTEGER,
        unity TEXT,
        quantity_done REAL,
        check_field INTEGER DEFAULT 0,
        sucesso INTEGER DEFAULT 1,
        inspection INTEGER DEFAULT 0,
        can_conclude INTEGER DEFAULT 0,
        comment TEXT,
        first_comment INTEGER DEFAULT 0,
        check_tasks INTEGER DEFAULT 0,
        equipaments_types_id INTEGER,
        projects_backlogs_json TEXT,
        subtasks_json TEXT,
        updated_at INTEGER,
        created_at INTEGER,
        synced_at INTEGER
      )
    ''');

    // Schedules table
    await db.execute('''
      CREATE TABLE schedules (
        id INTEGER PRIMARY KEY,
        schedule_id INTEGER,
        client_id TEXT,
        teams_id INTEGER,
        projects_id INTEGER,
        sprints_id INTEGER,
        schedule_date TEXT,
        users_id TEXT,
        sprints_tasks_id TEXT,
        updated_at INTEGER,
        created_at INTEGER,
        synced_at INTEGER
      )
    ''');

    // Users table
    await db.execute('''
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        name TEXT,
        email TEXT,
        phone TEXT,
        image TEXT,
        teams_id INTEGER,
        project_id INTEGER,
        company_id INTEGER,
        updated_at INTEGER,
        created_at INTEGER,
        synced_at INTEGER
      )
    ''');

    // Projects table
    await db.execute('''
      CREATE TABLE projects (
        id INTEGER PRIMARY KEY,
        project_id INTEGER,
        name TEXT,
        updated_at INTEGER,
        created_at INTEGER,
        synced_at INTEGER
      )
    ''');

    // Equipaments types table
    await db.execute('''
      CREATE TABLE equipaments_types (
        id INTEGER PRIMARY KEY,
        equipaments_type_id INTEGER,
        type TEXT,
        updated_at INTEGER,
        created_at INTEGER,
        synced_at INTEGER
      )
    ''');

    // Task comments table
    await db.execute('''
      CREATE TABLE task_comments (
        id INTEGER PRIMARY KEY,
        comment_id INTEGER,
        projects_backlogs_id INTEGER,
        subtasks_id INTEGER,
        created_user_id INTEGER,
        comment TEXT,
        updated_at INTEGER,
        created_at INTEGER,
        synced_at INTEGER
      )
    ''');

    // Inspections table
    await db.execute('''
      CREATE TABLE inspections (
        id INTEGER PRIMARY KEY,
        inspection_id INTEGER,
        sprints_tasks_id INTEGER,
        quality_status_id INTEGER,
        comment TEXT,
        updated_at INTEGER,
        created_at INTEGER,
        synced_at INTEGER
      )
    ''');

    // Sync queue table
    await db.execute('''
      CREATE TABLE sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation_id TEXT NOT NULL UNIQUE,
        operation_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        data TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        retry_count INTEGER DEFAULT 0,
        error_message TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER,
        last_attempt_at INTEGER,
        next_attempt_at INTEGER,
        last_error_code INTEGER,
        last_error_message TEXT
      )
    ''');

    // Sync metadata table
    await db.execute('''
      CREATE TABLE sync_metadata (
        id INTEGER PRIMARY KEY,
        entity_type TEXT UNIQUE NOT NULL,
        last_sync_at INTEGER,
        last_sync_status TEXT,
        sync_version INTEGER DEFAULT 1
      )
    ''');

    // Sync conflicts table
    await db.execute('''
      CREATE TABLE sync_conflicts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        operation_type TEXT NOT NULL,
        local_payload TEXT NOT NULL,
        server_payload TEXT,
        local_version TEXT,
        server_version TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        resolved_at INTEGER,
        resolution TEXT,
        error_message TEXT
      )
    ''');

    // ID mapping table
    await db.execute('''
      CREATE TABLE id_map (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        client_id TEXT NOT NULL,
        server_id TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    ''');

    // API cache table (para suportar filtros offline)
    await db.execute('''
      CREATE TABLE api_cache (
        cache_key TEXT PRIMARY KEY,
        response_json TEXT NOT NULL,
        updated_at INTEGER
      )
    ''');

    // RDO finalization tracking (para limitar finalização a 1x por dia)
    await db.execute('''
      CREATE TABLE rdo_finalization (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        finalization_date TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL
      )
    ''');
    await db.execute('CREATE UNIQUE INDEX idx_rdo_finalization_date ON rdo_finalization(finalization_date)');

    // Task state overrides (para espelhar comportamento online no offline)
    await db.execute('''
      CREATE TABLE task_state_overrides (
        sprints_tasks_id INTEGER PRIMARY KEY,
        status_group TEXT NOT NULL,
        inspection INTEGER,
        sucesso INTEGER,
        check_field INTEGER,
        check_tasks INTEGER,
        updated_at INTEGER
      )
    ''');

    // Create indexes for better performance
    await db.execute('CREATE INDEX idx_sprints_tasks_sprints_id ON sprints_tasks(sprints_id)');
    await db.execute('CREATE INDEX idx_sprints_tasks_projects_id ON sprints_tasks(projects_id)');
    await db.execute('CREATE INDEX idx_sprints_tasks_teams_id ON sprints_tasks(teams_id)');
    await db.execute('CREATE INDEX idx_sync_queue_status ON sync_queue(status)');
    await db.execute('CREATE INDEX idx_sync_queue_entity ON sync_queue(entity_type, entity_id)');
    await db.execute('CREATE INDEX idx_sync_conflicts_status ON sync_conflicts(status)');
    await db.execute('CREATE INDEX idx_sync_conflicts_entity ON sync_conflicts(entity_type, entity_id)');
    await db.execute('CREATE UNIQUE INDEX idx_id_map_client ON id_map(entity_type, client_id)');
    await db.execute('CREATE INDEX idx_id_map_server ON id_map(entity_type, server_id)');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Handle database migrations here
    if (oldVersion < newVersion) {
      if (oldVersion < 2) {
        await db.execute('''
          CREATE TABLE IF NOT EXISTS equipaments_types (
            id INTEGER PRIMARY KEY,
            equipaments_type_id INTEGER,
            type TEXT,
            updated_at INTEGER,
            created_at INTEGER,
            synced_at INTEGER
          )
        ''');
      }
      if (oldVersion < 3) {
        await _addColumnIfNotExists(
          db,
          'sprints_tasks',
          'can_conclude',
          'INTEGER DEFAULT 0',
        );
        await _addColumnIfNotExists(
          db,
          'sprints_tasks',
          'projects_backlogs_json',
          'TEXT',
        );
        await _addColumnIfNotExists(
          db,
          'sprints_tasks',
          'subtasks_json',
          'TEXT',
        );
      }
      if (oldVersion < 4) {
        await db.execute('''
          CREATE TABLE IF NOT EXISTS api_cache (
            cache_key TEXT PRIMARY KEY,
            response_json TEXT NOT NULL,
            updated_at INTEGER
          )
        ''');
      }
      if (oldVersion < 5) {
        await db.execute('''
          CREATE TABLE IF NOT EXISTS task_state_overrides (
            sprints_tasks_id INTEGER PRIMARY KEY,
            status_group TEXT NOT NULL,
            inspection INTEGER,
            sucesso INTEGER,
            check_field INTEGER,
            check_tasks INTEGER,
            updated_at INTEGER
          )
        ''');
      }
      if (oldVersion < 6) {
        await _addColumnIfNotExists(
          db,
          'sync_queue',
          'operation_id',
          'TEXT',
        );
        await _addColumnIfNotExists(
          db,
          'sync_queue',
          'last_attempt_at',
          'INTEGER',
        );
        await _addColumnIfNotExists(
          db,
          'sync_queue',
          'next_attempt_at',
          'INTEGER',
        );
        await _addColumnIfNotExists(
          db,
          'sync_queue',
          'last_error_code',
          'INTEGER',
        );
        await _addColumnIfNotExists(
          db,
          'sync_queue',
          'last_error_message',
          'TEXT',
        );
        await db.execute(
          'CREATE UNIQUE INDEX IF NOT EXISTS idx_sync_queue_operation_id ON sync_queue(operation_id)',
        );
        await db.execute(
          "UPDATE sync_queue SET operation_id = 'legacy-' || id || '-' || created_at WHERE operation_id IS NULL OR operation_id = ''",
        );
      }
      if (oldVersion < 7) {
        await db.execute('''
          CREATE TABLE IF NOT EXISTS sync_conflicts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            operation_id TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT,
            operation_type TEXT NOT NULL,
            local_payload TEXT NOT NULL,
            server_payload TEXT,
            local_version TEXT,
            server_version TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at INTEGER NOT NULL,
            resolved_at INTEGER,
            resolution TEXT,
            error_message TEXT
          )
        ''');
        await db.execute('CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status ON sync_conflicts(status)');
        await db.execute('CREATE INDEX IF NOT EXISTS idx_sync_conflicts_entity ON sync_conflicts(entity_type, entity_id)');
      }
      if (oldVersion < 8) {
        await _addColumnIfNotExists(
          db,
          'sprints',
          'client_id',
          'TEXT',
        );
        await _addColumnIfNotExists(
          db,
          'sprints_tasks',
          'client_id',
          'TEXT',
        );
        await _addColumnIfNotExists(
          db,
          'schedules',
          'client_id',
          'TEXT',
        );
        await db.execute('''
          CREATE TABLE IF NOT EXISTS id_map (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entity_type TEXT NOT NULL,
            client_id TEXT NOT NULL,
            server_id TEXT NOT NULL,
            created_at INTEGER NOT NULL
          )
        ''');
        await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_id_map_client ON id_map(entity_type, client_id)');
        await db.execute('CREATE INDEX IF NOT EXISTS idx_id_map_server ON id_map(entity_type, server_id)');
      }
      if (oldVersion < 9) {
        await db.execute('''
          CREATE TABLE IF NOT EXISTS rdo_finalization (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            finalization_date TEXT NOT NULL UNIQUE,
            created_at INTEGER NOT NULL
          )
        ''');
        await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS idx_rdo_finalization_date ON rdo_finalization(finalization_date)');
      }
      if (oldVersion < 10) {
        // Drop tracker-related tables no longer needed
        await db.execute('DROP TABLE IF EXISTS fields');
        await db.execute('DROP TABLE IF EXISTS sections');
        await db.execute('DROP TABLE IF EXISTS rows');
        await db.execute('DROP TABLE IF EXISTS trackers');
      }
    }
  }

  Future<void> _addColumnIfNotExists(
    Database db,
    String table,
    String column,
    String type,
  ) async {
    final result = await db.rawQuery('PRAGMA table_info($table)');
    final exists = result.any((row) => row['name'] == column);
    if (!exists) {
      await db.execute('ALTER TABLE $table ADD COLUMN $column $type');
    }
  }

  Future<void> close() async {
    final db = await database;
    await db.close();
  }

  Future<void> clearAllTables() async {
    final db = await database;
    await db.delete('sprints');
    await db.delete('sprints_tasks');
    await db.delete('schedules');
    await db.delete('users');
    await db.delete('projects');
    await db.delete('task_comments');
    await db.delete('inspections');
    await db.delete('sync_queue');
    await db.delete('sync_metadata');
    await db.delete('api_cache');
    await db.delete('task_state_overrides');
  }
}
