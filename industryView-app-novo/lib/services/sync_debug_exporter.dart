import '../database/daos/sync_queue_dao.dart';
import '../database/daos/sync_conflict_dao.dart';

class SyncDebugExporter {
  final SyncQueueDao _syncQueueDao = SyncQueueDao();
  final SyncConflictDao _syncConflictDao = SyncConflictDao();

  Future<Map<String, dynamic>> exportSyncQueueSummary() async {
    final items = await _syncQueueDao.findAll();
    final list = items
        .map(
          (item) => {
            'id': item.id,
            'operation_id': item.operationId,
            'entity_type': item.entityType,
            'status': item.status.name,
            'retry_count': item.retryCount,
            'created_at': item.createdAt,
            'last_attempt_at': item.lastAttemptAt,
            'next_attempt_at': item.nextAttemptAt,
            'last_error_code': item.lastErrorCode,
          },
        )
        .toList();
    return {
      'count': list.length,
      'items': list,
    };
  }

  Future<Map<String, dynamic>> exportConflictsSummary() async {
    final conflicts = await _syncConflictDao.findAll();
    final list = conflicts
        .map(
          (conflict) => {
            'id': conflict.id,
            'operation_id': conflict.operationId,
            'entity_type': conflict.entityType,
            'entity_id': conflict.entityId,
            'operation_type': conflict.operationType,
            'status': conflict.status,
            'created_at': conflict.createdAt,
            'resolved_at': conflict.resolvedAt,
            'resolution': conflict.resolution,
          },
        )
        .toList();
    return {
      'count': list.length,
      'items': list,
    };
  }
}
