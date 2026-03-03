import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:path_provider_platform_interface/path_provider_platform_interface.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

import 'package:industryview_app/database/database_helper.dart';
import 'package:industryview_app/database/daos/sync_queue_dao.dart';
import 'package:industryview_app/database/models/sync_queue_model.dart';
import 'package:industryview_app/services/sync_service.dart';
import 'package:industryview_app/services/offline_api_wrapper.dart';
import 'package:industryview_app/services/network_service.dart';
import 'package:industryview_app/backend/api_requests/api_manager.dart';

class _TestPathProvider extends PathProviderPlatform {
  @override
  Future<String?> getApplicationDocumentsPath() async {
    return Directory.systemTemp.createTempSync('industryview_test').path;
  }
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
    PathProviderPlatform.instance = _TestPathProvider();
    await DatabaseHelper.instance.database;
  });

  setUp(() async {
    await DatabaseHelper.instance.clearAllTables();
  });

  test('enfileirar offline', () async {
    NetworkService.instance.setConnectionOverride(false);
    final response = await OfflineApiWrapper.instance.call(
      callName: 'Edit progress sprint',
      apiUrl: 'https://example.com/sprints/1',
      callType: ApiCallType.PATCH,
      headers: {},
      params: {},
      body: '{"id":1,"title":"t","objective":"o"}',
      bodyType: BodyType.JSON,
      returnBody: true,
    );
    expect(response.statusCode, 200);
    final count = await SyncQueueDao().countPending();
    expect(count, greaterThan(0));
    NetworkService.instance.setConnectionOverride(null);
  });

  test('dedupe por operation_id', () async {
    final dao = SyncQueueDao();
    final item = SyncQueueModel(
      operationId: 'op-1',
      operationType: SyncOperationType.create,
      entityType: 'sprints',
      entityId: 1,
      data: '{"id":1}',
      createdAt: DateTime.now().millisecondsSinceEpoch,
    );
    await dao.insert(item);
    await dao.insert(item);
    final count = await dao.countPending();
    expect(count, 1);
  });

  test('retry com backoff (determinístico)', () async {
    final service = SyncService.instance;
    final t1 = service.testCalculateNextAttemptAt(
      attempt: 1,
      jitterOverride: 1.0,
    );
    final t2 = service.testCalculateNextAttemptAt(
      attempt: 2,
      jitterOverride: 1.0,
    );
    expect(t2, greaterThan(t1));
  });

  test('conflito 409 é detectado', () async {
    final service = SyncService.instance;
    final response = ApiCallResponse({}, {}, 409);
    final result = service.testResultFromApi(response);
    expect(result.isConflict, true);
  });

  test('app kill: syncing volta para pending', () async {
    final dao = SyncQueueDao();
    final item = SyncQueueModel(
      operationId: 'op-2',
      operationType: SyncOperationType.update,
      entityType: 'sprints',
      entityId: 2,
      data: '{"id":2}',
      status: SyncStatus.syncing,
      createdAt: DateTime.now().millisecondsSinceEpoch,
    );
    await dao.insert(item);
    await dao.resetSyncingToPending();
    final pending = await dao.findPending(limit: 10, entityType: 'sprints');
    expect(pending.isNotEmpty, true);
  });

  test('reconexão após longo offline respeita next_attempt_at', () async {
    final dao = SyncQueueDao();
    final now = DateTime.now().millisecondsSinceEpoch;
    final futureItem = SyncQueueModel(
      operationId: 'op-3',
      operationType: SyncOperationType.update,
      entityType: 'sprints',
      entityId: 3,
      data: '{"id":3}',
      createdAt: now,
      nextAttemptAt: now + 100000,
    );
    await dao.insert(futureItem);
    final pastItem = SyncQueueModel(
      operationId: 'op-4',
      operationType: SyncOperationType.update,
      entityType: 'sprints',
      entityId: 4,
      data: '{"id":4}',
      createdAt: now,
      nextAttemptAt: now - 1000,
    );
    await dao.insert(pastItem);
    final pending = await dao.findPending(limit: 10, entityType: 'sprints');
    expect(pending.where((i) => i.operationId == 'op-3').isEmpty, true);
    expect(pending.any((i) => i.operationId == 'op-4'), true);
  });
}
