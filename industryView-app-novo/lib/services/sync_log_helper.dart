import 'dart:developer';

class SyncLogHelper {
  static void logEvent(
    String level,
    String event, {
    Map<String, dynamic>? data,
  }) {
    final payload = <String, dynamic>{
      'level': level,
      'event': event,
      if (data != null) 'data': data,
    };
    log(payload.toString(), name: 'sync');
  }

  static void logSyncStart({
    required String trigger,
  }) {
    logEvent(
      'info',
      'sync_start',
      data: {
        'trigger': trigger,
      },
    );
  }

  static void logSyncEnd({
    required bool success,
    required int durationMs,
  }) {
    logEvent(
      'info',
      'sync_end',
      data: {
        'success': success,
        'duration_ms': durationMs,
      },
    );
  }

  static void logItemProcessed({
    required String operationId,
    required String entityType,
    required String status,
    required int retryCount,
  }) {
    logEvent(
      'info',
      'item_processed',
      data: {
        'operation_id': operationId,
        'entity_type': entityType,
        'status': status,
        'retry_count': retryCount,
      },
    );
  }

  static void logRetryScheduled({
    required String operationId,
    required String entityType,
    required int retryCount,
    required int delayMs,
  }) {
    logEvent(
      'warn',
      'retry_scheduled',
      data: {
        'operation_id': operationId,
        'entity_type': entityType,
        'retry_count': retryCount,
        'delay_ms': delayMs,
      },
    );
  }

  static void logFatalError({
    required String operationId,
    required String entityType,
    required int? statusCode,
  }) {
    logEvent(
      'error',
      'fatal_error',
      data: {
        'operation_id': operationId,
        'entity_type': entityType,
        'status_code': statusCode,
      },
    );
  }

  static void logConflictDetected({
    required String operationId,
    required String entityType,
    required int? statusCode,
  }) {
    logEvent(
      'warn',
      'conflict_detected',
      data: {
        'operation_id': operationId,
        'entity_type': entityType,
        'status_code': statusCode,
      },
    );
  }

  static void logConflictResolved({
    required String operationId,
    required String resolution,
  }) {
    logEvent(
      'info',
      'conflict_resolved',
      data: {
        'operation_id': operationId,
        'resolution': resolution,
      },
    );
  }

  static void logPullStart({
    required String entityType,
    DateTime? lastSyncAt,
  }) {
    logEvent(
      'info',
      'pull_start',
      data: {
        'entity_type': entityType,
        'last_sync_at': lastSyncAt?.toIso8601String(),
        'sync_type': lastSyncAt != null ? 'delta' : 'full',
      },
    );
  }

  static void logPullEnd({
    required String entityType,
    required bool success,
  }) {
    logEvent(
      'info',
      'pull_end',
      data: {
        'entity_type': entityType,
        'success': success,
      },
    );
  }
}

class SyncMetrics {
  static int syncCount = 0;
  static int totalDurationMs = 0;
  static int totalRetries = 0;
  static int totalFatalErrors = 0;
  static int totalConflicts = 0;

  static void recordSyncDuration(int durationMs) {
    syncCount += 1;
    totalDurationMs += durationMs;
  }

  static void recordRetry() {
    totalRetries += 1;
  }

  static void recordFatalError() {
    totalFatalErrors += 1;
  }

  static void recordConflict() {
    totalConflicts += 1;
  }

  static double get avgSyncDurationMs =>
      syncCount == 0 ? 0 : totalDurationMs / syncCount;
}
