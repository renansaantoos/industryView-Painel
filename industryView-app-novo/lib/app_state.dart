import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import '/core/utils/request_manager.dart';
import '/backend/schema/structs/index.dart';
import '/backend/api_requests/api_manager.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/utils/app_utils.dart';

class AppState extends ChangeNotifier {
  static AppState _instance = AppState._internal();

  factory AppState() {
    return _instance;
  }

  AppState._internal();

  static void reset() {
    _instance = AppState._internal();
  }

  Future initializePersistedState() async {
    prefs = await SharedPreferences.getInstance();
    _safeInit(() {
      if (prefs.containsKey('ff_user')) {
        try {
          final serializedData = prefs.getString('ff_user') ?? '{}';
          _user =
              UserLoginStruct.fromSerializableMap(jsonDecode(serializedData));
        } catch (e) {
          print("Can't decode persisted data type. Error: $e.");
        }
      }
    });
    _safeInit(() {
      if (prefs.containsKey('ff_project_contexts')) {
        try {
          final serializedData = prefs.getString('ff_project_contexts') ?? '[]';
          final list = jsonDecode(serializedData) as List<dynamic>;
          _projectContexts = list
              .map((e) => ActiveProjectContextStruct.fromSerializableMap(
                  (e as Map).cast<String, dynamic>()))
              .toList();
        } catch (e) {
          print("Can't decode project contexts. Error: $e.");
        }
      }
    });
    _safeInit(() {
      _activeProjectIndex = prefs.getInt('ff_active_project_index') ?? -1;
    });
    _cleanOldProjectContexts();
  }

  void update(VoidCallback callback) {
    callback();
    notifyListeners();
  }

  /// Incrementa quando a conexão volta (offline -> online). As páginas reagem
  /// e fazem refresh dos dados (clear cache + setState).
  int _connectionRestoredTrigger = 0;
  int get connectionRestoredTrigger => _connectionRestoredTrigger;
  void signalConnectionRestored() {
    _connectionRestoredTrigger++;
    notifyListeners();
  }

  /// Incrementa quando uma tarefa tem status alterado (sucesso/falha).
  /// A HomePage reage limpando cache e recarregando a lista.
  int _tasksRefreshTrigger = 0;
  int get tasksRefreshTrigger => _tasksRefreshTrigger;
  void signalTasksRefresh() {
    _tasksRefreshTrigger++;
    notifyListeners();
  }

  late SharedPreferences prefs;

  int _filters = 0;
  int get filters => _filters;
  set filters(int value) {
    _filters = value;
  }

  UserLoginStruct _user = UserLoginStruct();
  UserLoginStruct get user => _user;
  set user(UserLoginStruct value) {
    _user = value;
    prefs.setString('ff_user', value.serialize());
  }

  void updateUserStruct(Function(UserLoginStruct) updateFn) {
    updateFn(_user);
    prefs.setString('ff_user', _user.serialize());
  }

  bool _loading = false;
  bool get loading => _loading;
  set loading(bool value) {
    _loading = value;
  }

  List<DateTime> _datesPicked = [];
  List<DateTime> get datesPicked => _datesPicked;
  set datesPicked(List<DateTime> value) {
    _datesPicked = value;
  }

  void addToDatesPicked(DateTime value) {
    datesPicked.add(value);
  }

  void removeFromDatesPicked(DateTime value) {
    datesPicked.remove(value);
  }

  void removeAtIndexFromDatesPicked(int index) {
    datesPicked.removeAt(index);
  }

  void updateDatesPickedAtIndex(
    int index,
    DateTime Function(DateTime) updateFn,
  ) {
    datesPicked[index] = updateFn(_datesPicked[index]);
  }

  void insertAtIndexInDatesPicked(int index, DateTime value) {
    datesPicked.insert(index, value);
  }

  bool _filterSprint = false;
  bool get filterSprint => _filterSprint;
  set filterSprint(bool value) {
    _filterSprint = value;
  }

  FiltersStruct _filterSprint01 = FiltersStruct();
  FiltersStruct get filterSprint01 => _filterSprint01;
  set filterSprint01(FiltersStruct value) {
    _filterSprint01 = value;
  }

  void updateFilterSprint01Struct(Function(FiltersStruct) updateFn) {
    updateFn(_filterSprint01);
  }

  SprintsStruct _sprints = SprintsStruct();
  SprintsStruct get sprints => _sprints;
  set sprints(SprintsStruct value) {
    _sprints = value;
  }

  void updateSprintsStruct(Function(SprintsStruct) updateFn) {
    updateFn(_sprints);
  }

  bool _setado = false;
  bool get setado => _setado;
  set setado(bool value) {
    _setado = value;
  }

  List<int> _liberaManual = [];
  List<int> get liberaManual => _liberaManual;
  set liberaManual(List<int> value) {
    _liberaManual = value;
  }

  void addToLiberaManual(int value) {
    liberaManual.add(value);
  }

  void removeFromLiberaManual(int value) {
    liberaManual.remove(value);
  }

  void removeAtIndexFromLiberaManual(int index) {
    liberaManual.removeAt(index);
  }

  void updateLiberaManualAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    liberaManual[index] = updateFn(_liberaManual[index]);
  }

  void insertAtIndexInLiberaManual(int index, int value) {
    liberaManual.insert(index, value);
  }

  List<int> _qrCodeIDs = [];
  List<int> get qrCodeIDs => _qrCodeIDs;
  set qrCodeIDs(List<int> value) {
    _qrCodeIDs = value;
  }

  void addToQrCodeIDs(int value) {
    qrCodeIDs.add(value);
  }

  void removeFromQrCodeIDs(int value) {
    qrCodeIDs.remove(value);
  }

  void removeAtIndexFromQrCodeIDs(int index) {
    qrCodeIDs.removeAt(index);
  }

  void updateQrCodeIDsAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    qrCodeIDs[index] = updateFn(_qrCodeIDs[index]);
  }

  void insertAtIndexInQrCodeIDs(int index, int value) {
    qrCodeIDs.insert(index, value);
  }

  List<int> _allIds = [];
  List<int> get allIds => _allIds;
  set allIds(List<int> value) {
    _allIds = value;
  }

  void addToAllIds(int value) {
    allIds.add(value);
  }

  void removeFromAllIds(int value) {
    allIds.remove(value);
  }

  void removeAtIndexFromAllIds(int index) {
    allIds.removeAt(index);
  }

  void updateAllIdsAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    allIds[index] = updateFn(_allIds[index]);
  }

  void insertAtIndexInAllIds(int index, int value) {
    allIds.insert(index, value);
  }

  List<TarefasStruct> _tarefas = [];
  List<TarefasStruct> get tarefas => _tarefas;
  set tarefas(List<TarefasStruct> value) {
    _tarefas = value;
  }

  void addToTarefas(TarefasStruct value) {
    tarefas.add(value);
  }

  void removeFromTarefas(TarefasStruct value) {
    tarefas.remove(value);
  }

  void removeAtIndexFromTarefas(int index) {
    tarefas.removeAt(index);
  }

  void updateTarefasAtIndex(
    int index,
    TarefasStruct Function(TarefasStruct) updateFn,
  ) {
    tarefas[index] = updateFn(_tarefas[index]);
  }

  void insertAtIndexInTarefas(int index, TarefasStruct value) {
    tarefas.insert(index, value);
  }

  List<TasksListStruct> _taskslist = [];
  List<TasksListStruct> get taskslist => _taskslist;
  set taskslist(List<TasksListStruct> value) {
    _taskslist = value;
  }

  void addToTaskslist(TasksListStruct value) {
    taskslist.add(value);
  }

  void removeFromTaskslist(TasksListStruct value) {
    taskslist.remove(value);
  }

  void removeAtIndexFromTaskslist(int index) {
    taskslist.removeAt(index);
  }

  void updateTaskslistAtIndex(
    int index,
    TasksListStruct Function(TasksListStruct) updateFn,
  ) {
    taskslist[index] = updateFn(_taskslist[index]);
  }

  void insertAtIndexInTaskslist(int index, TasksListStruct value) {
    taskslist.insert(index, value);
  }

  List<int> _escalaServerIds = [];
  List<int> get escalaServerIds => _escalaServerIds;
  set escalaServerIds(List<int> value) {
    _escalaServerIds = value;
  }

  void addToEscalaServerIds(int value) {
    escalaServerIds.add(value);
  }

  void removeFromEscalaServerIds(int value) {
    escalaServerIds.remove(value);
  }

  void removeAtIndexFromEscalaServerIds(int index) {
    escalaServerIds.removeAt(index);
  }

  void updateEscalaServerIdsAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    escalaServerIds[index] = updateFn(_escalaServerIds[index]);
  }

  void insertAtIndexInEscalaServerIds(int index, int value) {
    escalaServerIds.insert(index, value);
  }

  List<int> _escalaLocalIds = [];
  List<int> get escalaLocalIds => _escalaLocalIds;
  set escalaLocalIds(List<int> value) {
    _escalaLocalIds = value;
  }

  void addToEscalaLocalIds(int value) {
    escalaLocalIds.add(value);
  }

  void removeFromEscalaLocalIds(int value) {
    escalaLocalIds.remove(value);
  }

  void removeAtIndexFromEscalaLocalIds(int index) {
    escalaLocalIds.removeAt(index);
  }

  void updateEscalaLocalIdsAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    escalaLocalIds[index] = updateFn(_escalaLocalIds[index]);
  }

  void insertAtIndexInEscalaLocalIds(int index, int value) {
    escalaLocalIds.insert(index, value);
  }

  List<int> _escalaRemovedIds = [];
  List<int> get escalaRemovedIds => _escalaRemovedIds;
  set escalaRemovedIds(List<int> value) {
    _escalaRemovedIds = value;
  }

  void addToEscalaRemovedIds(int value) {
    escalaRemovedIds.add(value);
  }

  void removeFromEscalaRemovedIds(int value) {
    escalaRemovedIds.remove(value);
  }

  void removeAtIndexFromEscalaRemovedIds(int index) {
    escalaRemovedIds.removeAt(index);
  }

  void updateEscalaRemovedIdsAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    escalaRemovedIds[index] = updateFn(_escalaRemovedIds[index]);
  }

  void insertAtIndexInEscalaRemovedIds(int index, int value) {
    escalaRemovedIds.insert(index, value);
  }

  // Mapa de userId → horário de entrada (ISO string) para funcionários já registrados no dia
  Map<int, String> _escalaEntryTimes = {};
  Map<int, String> get escalaEntryTimes => _escalaEntryTimes;
  set escalaEntryTimes(Map<int, String> value) {
    _escalaEntryTimes = value;
  }

  void addEscalaEntryTime(int userId, String createdAt) {
    _escalaEntryTimes[userId] = createdAt;
  }

  List<int> _escalaSelectedIds = [];
  List<int> get escalaSelectedIds => _escalaSelectedIds;
  set escalaSelectedIds(List<int> value) {
    _escalaSelectedIds = value;
  }

  void addToEscalaSelectedIds(int value) {
    escalaSelectedIds.add(value);
  }

  void removeFromEscalaSelectedIds(int value) {
    escalaSelectedIds.remove(value);
  }

  void removeAtIndexFromEscalaSelectedIds(int index) {
    escalaSelectedIds.removeAt(index);
  }

  void updateEscalaSelectedIdsAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    escalaSelectedIds[index] = updateFn(_escalaSelectedIds[index]);
  }

  void insertAtIndexInEscalaSelectedIds(int index, int value) {
    escalaSelectedIds.insert(index, value);
  }

  List<int> _offlineMaskedTasksIds = [];
  List<int> get offlineMaskedTasksIds => _offlineMaskedTasksIds;
  set offlineMaskedTasksIds(List<int> value) {
    _offlineMaskedTasksIds = value;
  }

  void addToOfflineMaskedTasksIds(int value) {
    offlineMaskedTasksIds.add(value);
  }

  void removeFromOfflineMaskedTasksIds(int value) {
    offlineMaskedTasksIds.remove(value);
  }

  void removeAtIndexFromOfflineMaskedTasksIds(int index) {
    offlineMaskedTasksIds.removeAt(index);
  }

  void updateOfflineMaskedTasksIdsAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    offlineMaskedTasksIds[index] = updateFn(_offlineMaskedTasksIds[index]);
  }

  void insertAtIndexInOfflineMaskedTasksIds(int index, int value) {
    offlineMaskedTasksIds.insert(index, value);
  }

  String _comment = '';
  String get comment => _comment;
  set comment(String value) {
    _comment = value;
  }

  List<TasksListStruct> _tasksfinish = [];
  List<TasksListStruct> get tasksfinish => _tasksfinish;
  set tasksfinish(List<TasksListStruct> value) {
    _tasksfinish = value;
  }

  void addToTasksfinish(TasksListStruct value) {
    tasksfinish.add(value);
  }

  void removeFromTasksfinish(TasksListStruct value) {
    tasksfinish.remove(value);
  }

  void removeAtIndexFromTasksfinish(int index) {
    tasksfinish.removeAt(index);
  }

  void updateTasksfinishAtIndex(
    int index,
    TasksListStruct Function(TasksListStruct) updateFn,
  ) {
    tasksfinish[index] = updateFn(_tasksfinish[index]);
  }

  void insertAtIndexInTasksfinish(int index, TasksListStruct value) {
    tasksfinish.insert(index, value);
  }

  // ═══════════════════════════════════════════════════════════════
  // Multi-Project Context Management
  // ═══════════════════════════════════════════════════════════════

  List<ActiveProjectContextStruct> _projectContexts = [];
  List<ActiveProjectContextStruct> get projectContexts => _projectContexts;
  set projectContexts(List<ActiveProjectContextStruct> value) {
    _projectContexts = value;
    _persistProjectContexts();
  }

  int _activeProjectIndex = -1;
  int get activeProjectIndex => _activeProjectIndex;
  set activeProjectIndex(int value) {
    _activeProjectIndex = value;
    prefs.setInt('ff_active_project_index', value);
  }

  ActiveProjectContextStruct? get activeProjectContext {
    if (_activeProjectIndex >= 0 &&
        _activeProjectIndex < _projectContexts.length) {
      return _projectContexts[_activeProjectIndex];
    }
    return null;
  }

  void _persistProjectContexts() {
    final serialized =
        jsonEncode(_projectContexts.map((e) => e.toSerializableMap()).toList());
    prefs.setString('ff_project_contexts', serialized);
  }

  void _cleanOldProjectContexts() {
    final today = DateTime.now().toIso8601String().substring(0, 10);
    final before = _projectContexts.length;
    _projectContexts.removeWhere((ctx) => ctx.date != today);
    if (_projectContexts.length != before) {
      if (_activeProjectIndex >= _projectContexts.length) {
        _activeProjectIndex = -1;
        prefs.setInt('ff_active_project_index', -1);
      }
      _persistProjectContexts();
      if (kDebugMode) {
        print('Cleaned ${before - _projectContexts.length} old project contexts');
      }
    }
  }

  int findProjectContextIndex(int projectId) {
    final today = DateTime.now().toIso8601String().substring(0, 10);
    return _projectContexts.indexWhere(
        (ctx) => ctx.projectId == projectId && ctx.date == today);
  }

  int addOrGetProjectContext({
    required int projectId,
    required String projectName,
    required int teamsId,
    int? scheduleId,
    int? sprintId,
    String? sprintTitle,
  }) {
    final today = DateTime.now().toIso8601String().substring(0, 10);
    final existingIndex = findProjectContextIndex(projectId);
    if (existingIndex >= 0) {
      return existingIndex;
    }
    _projectContexts.add(ActiveProjectContextStruct(
      projectId: projectId,
      projectName: projectName,
      teamsId: teamsId,
      scheduleId: scheduleId,
      sprintId: sprintId,
      sprintTitle: sprintTitle,
      date: today,
      allIds: [],
      qrCodeIDs: [],
      liberaManual: [],
      rdoFinalized: false,
    ));
    _persistProjectContexts();
    return _projectContexts.length - 1;
  }

  void switchToProject(int index) {
    if (index < 0 || index >= _projectContexts.length) return;
    _activeProjectIndex = index;
    prefs.setInt('ff_active_project_index', index);
    final ctx = _projectContexts[index];

    // Sincronizar AppState global com o contexto ativo
    updateUserStruct((e) => e
      ..projectId = ctx.projectId
      ..projectName = ctx.projectName
      ..teamsId = ctx.teamsId
      ..sheduleId = ctx.scheduleId != 0 ? ctx.scheduleId : null
      ..sprint = SprintsStruct(id: ctx.sprintId, title: ctx.sprintTitle));

    allIds = ctx.allIds.toList();
    qrCodeIDs = ctx.qrCodeIDs.toList();
    liberaManual = ctx.liberaManual.toList();

    if (kDebugMode) {
      print('Switched to project context $index: ${ctx.projectName} (id: ${ctx.projectId})');
    }
    notifyListeners();
  }

  void saveCurrentToActiveContext() {
    if (_activeProjectIndex < 0 ||
        _activeProjectIndex >= _projectContexts.length) return;
    final ctx = _projectContexts[_activeProjectIndex];
    ctx.scheduleId = user.sheduleId;
    ctx.allIds = allIds.toList();
    ctx.qrCodeIDs = qrCodeIDs.toList();
    ctx.liberaManual = liberaManual.toList();
    _persistProjectContexts();
  }

  void markActiveProjectRdoFinalized() {
    if (_activeProjectIndex < 0 ||
        _activeProjectIndex >= _projectContexts.length) return;
    _projectContexts[_activeProjectIndex].rdoFinalized = true;
    _persistProjectContexts();
  }

  void clearAllProjectContexts() {
    _projectContexts.clear();
    _activeProjectIndex = -1;
    prefs.setInt('ff_active_project_index', -1);
    _persistProjectContexts();
  }

  bool get hasUnfinalizedProjects {
    return _projectContexts.any((ctx) => !ctx.rdoFinalized && ctx.scheduleId != 0);
  }

  final _escalaManager = FutureRequestManager<ApiCallResponse>();
  Future<ApiCallResponse> escala({
    String? uniqueQueryKey,
    bool? overrideCache,
    required Future<ApiCallResponse> Function() requestFn,
  }) =>
      _escalaManager.performRequest(
        uniqueQueryKey: uniqueQueryKey,
        overrideCache: overrideCache,
        requestFn: requestFn,
      );
  void clearEscalaCache() => _escalaManager.clear();
  void clearEscalaCacheKey(String? uniqueKey) =>
      _escalaManager.clearRequest(uniqueKey);

}

void _safeInit(Function() initializeField) {
  try {
    initializeField();
  } catch (_) {}
}

Future _safeInitAsync(Function() initializeField) async {
  try {
    await initializeField();
  } catch (_) {}
}
