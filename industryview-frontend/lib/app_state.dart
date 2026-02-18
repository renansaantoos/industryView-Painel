import 'package:flutter/material.dart';
import '/backend/schema/structs/index.dart';
import '/backend/api_requests/api_manager.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'flutter_flow/flutter_flow_util.dart';
import 'dart:convert';

class FFAppState extends ChangeNotifier {
  static FFAppState _instance = FFAppState._internal();

  factory FFAppState() {
    return _instance;
  }

  FFAppState._internal();

  static void reset() {
    _instance = FFAppState._internal();
  }

  Future initializePersistedState() async {
    prefs = await SharedPreferences.getInstance();
    _safeInit(() {
      _navBarSelection = prefs.getInt('ff_navBarSelection') ?? _navBarSelection;
    });
    _safeInit(() {
      _token = prefs.getString('ff_token') ?? _token;
    });
    _safeInit(() {
      if (prefs.containsKey('ff_infoUser')) {
        try {
          final serializedData = prefs.getString('ff_infoUser') ?? '{}';
          _infoUser =
              VarInfoUserStruct.fromSerializableMap(jsonDecode(serializedData));
        } catch (e) {
          print("Can't decode persisted data type. Error: $e.");
        }
      }
    });
    _safeInit(() {
      if (prefs.containsKey('ff_projectsInfo')) {
        try {
          final serializedData = prefs.getString('ff_projectsInfo') ?? '{}';
          _projectsInfo = ProjectsInfo1Struct.fromSerializableMap(
              jsonDecode(serializedData));
        } catch (e) {
          print("Can't decode persisted data type. Error: $e.");
        }
      }
    });
    _safeInit(() {
      _teamId = prefs.getInt('ff_teamId') ?? _teamId;
    });
    _safeInit(() {
      _secaoVazia = prefs.getStringList('ff_secaoVazia') ?? _secaoVazia;
    });
    _safeInit(() {
      _fileiraVazia = prefs.getStringList('ff_fileiraVazia') ?? _fileiraVazia;
    });
    _safeInit(() {
      _trackerVazio = prefs.getStringList('ff_trackerVazio') ?? _trackerVazio;
    });
    _safeInit(() {
      _listaVazia =
          prefs.getStringList('ff_listaVazia')?.map(int.parse).toList() ??
              _listaVazia;
    });
    _safeInit(() {
      if (prefs.containsKey('ff_tarefas')) {
        try {
          _tarefas = jsonDecode(prefs.getString('ff_tarefas') ?? '');
        } catch (e) {
          print("Can't decode persisted json. Error: $e.");
        }
      }
    });
  }

  void update(VoidCallback callback) {
    callback();
    notifyListeners();
  }

  late SharedPreferences prefs;

  int _navBarSelection = 1;
  int get navBarSelection => _navBarSelection;
  set navBarSelection(int value) {
    _navBarSelection = value;
    prefs.setInt('ff_navBarSelection', value);
  }

  String _token = '';
  String get token => _token;
  set token(String value) {
    _token = value;
    prefs.setString('ff_token', value);
  }

  VarInfoUserStruct _infoUser = VarInfoUserStruct();
  VarInfoUserStruct get infoUser => _infoUser;
  set infoUser(VarInfoUserStruct value) {
    _infoUser = value;
    prefs.setString('ff_infoUser', value.serialize());
  }

  void updateInfoUserStruct(Function(VarInfoUserStruct) updateFn) {
    updateFn(_infoUser);
    prefs.setString('ff_infoUser', _infoUser.serialize());
  }

  List<Manufacturers2Struct> _filterManufacturers = [];
  List<Manufacturers2Struct> get filterManufacturers => _filterManufacturers;
  set filterManufacturers(List<Manufacturers2Struct> value) {
    _filterManufacturers = value;
  }

  void addToFilterManufacturers(Manufacturers2Struct value) {
    filterManufacturers.add(value);
  }

  void removeFromFilterManufacturers(Manufacturers2Struct value) {
    filterManufacturers.remove(value);
  }

  void removeAtIndexFromFilterManufacturers(int index) {
    filterManufacturers.removeAt(index);
  }

  void updateFilterManufacturersAtIndex(
    int index,
    Manufacturers2Struct Function(Manufacturers2Struct) updateFn,
  ) {
    filterManufacturers[index] = updateFn(_filterManufacturers[index]);
  }

  void insertAtIndexInFilterManufacturers(
      int index, Manufacturers2Struct value) {
    filterManufacturers.insert(index, value);
  }

  List<Manufacturers2Struct> _listTypeManufacturers = [];
  List<Manufacturers2Struct> get listTypeManufacturers =>
      _listTypeManufacturers;
  set listTypeManufacturers(List<Manufacturers2Struct> value) {
    _listTypeManufacturers = value;
  }

  void addToListTypeManufacturers(Manufacturers2Struct value) {
    listTypeManufacturers.add(value);
  }

  void removeFromListTypeManufacturers(Manufacturers2Struct value) {
    listTypeManufacturers.remove(value);
  }

  void removeAtIndexFromListTypeManufacturers(int index) {
    listTypeManufacturers.removeAt(index);
  }

  void updateListTypeManufacturersAtIndex(
    int index,
    Manufacturers2Struct Function(Manufacturers2Struct) updateFn,
  ) {
    listTypeManufacturers[index] = updateFn(_listTypeManufacturers[index]);
  }

  void insertAtIndexInListTypeManufacturers(
      int index, Manufacturers2Struct value) {
    listTypeManufacturers.insert(index, value);
  }

  List<ListModulesTypesStruct> _listTypeModules = [];
  List<ListModulesTypesStruct> get listTypeModules => _listTypeModules;
  set listTypeModules(List<ListModulesTypesStruct> value) {
    _listTypeModules = value;
  }

  void addToListTypeModules(ListModulesTypesStruct value) {
    listTypeModules.add(value);
  }

  void removeFromListTypeModules(ListModulesTypesStruct value) {
    listTypeModules.remove(value);
  }

  void removeAtIndexFromListTypeModules(int index) {
    listTypeModules.removeAt(index);
  }

  void updateListTypeModulesAtIndex(
    int index,
    ListModulesTypesStruct Function(ListModulesTypesStruct) updateFn,
  ) {
    listTypeModules[index] = updateFn(_listTypeModules[index]);
  }

  void insertAtIndexInListTypeModules(int index, ListModulesTypesStruct value) {
    listTypeModules.insert(index, value);
  }

  List<ListModulesTypesStruct> _filterTypeModules = [];
  List<ListModulesTypesStruct> get filterTypeModules => _filterTypeModules;
  set filterTypeModules(List<ListModulesTypesStruct> value) {
    _filterTypeModules = value;
  }

  void addToFilterTypeModules(ListModulesTypesStruct value) {
    filterTypeModules.add(value);
  }

  void removeFromFilterTypeModules(ListModulesTypesStruct value) {
    filterTypeModules.remove(value);
  }

  void removeAtIndexFromFilterTypeModules(int index) {
    filterTypeModules.removeAt(index);
  }

  void updateFilterTypeModulesAtIndex(
    int index,
    ListModulesTypesStruct Function(ListModulesTypesStruct) updateFn,
  ) {
    filterTypeModules[index] = updateFn(_filterTypeModules[index]);
  }

  void insertAtIndexInFilterTypeModules(
      int index, ListModulesTypesStruct value) {
    filterTypeModules.insert(index, value);
  }

  ProjectsInfo1Struct _projectsInfo = ProjectsInfo1Struct();
  ProjectsInfo1Struct get projectsInfo => _projectsInfo;
  set projectsInfo(ProjectsInfo1Struct value) {
    _projectsInfo = value;
    prefs.setString('ff_projectsInfo', value.serialize());
  }

  void updateProjectsInfoStruct(Function(ProjectsInfo1Struct) updateFn) {
    updateFn(_projectsInfo);
    prefs.setString('ff_projectsInfo', _projectsInfo.serialize());
  }

  List<int> _setIds = [];
  List<int> get setIds => _setIds;
  set setIds(List<int> value) {
    _setIds = value;
  }

  void addToSetIds(int value) {
    setIds.add(value);
  }

  void removeFromSetIds(int value) {
    setIds.remove(value);
  }

  void removeAtIndexFromSetIds(int index) {
    setIds.removeAt(index);
  }

  void updateSetIdsAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    setIds[index] = updateFn(_setIds[index]);
  }

  void insertAtIndexInSetIds(int index, int value) {
    setIds.insert(index, value);
  }

  List<VarAddTracker1Struct> _listSequenciaEstacas = [];
  List<VarAddTracker1Struct> get listSequenciaEstacas => _listSequenciaEstacas;
  set listSequenciaEstacas(List<VarAddTracker1Struct> value) {
    _listSequenciaEstacas = value;
  }

  void addToListSequenciaEstacas(VarAddTracker1Struct value) {
    listSequenciaEstacas.add(value);
  }

  void removeFromListSequenciaEstacas(VarAddTracker1Struct value) {
    listSequenciaEstacas.remove(value);
  }

  void removeAtIndexFromListSequenciaEstacas(int index) {
    listSequenciaEstacas.removeAt(index);
  }

  void updateListSequenciaEstacasAtIndex(
    int index,
    VarAddTracker1Struct Function(VarAddTracker1Struct) updateFn,
  ) {
    listSequenciaEstacas[index] = updateFn(_listSequenciaEstacas[index]);
  }

  void insertAtIndexInListSequenciaEstacas(
      int index, VarAddTracker1Struct value) {
    listSequenciaEstacas.insert(index, value);
  }

  List<User2Struct> _user0 = [];
  List<User2Struct> get user0 => _user0;
  set user0(List<User2Struct> value) {
    _user0 = value;
  }

  void addToUser0(User2Struct value) {
    user0.add(value);
  }

  void removeFromUser0(User2Struct value) {
    user0.remove(value);
  }

  void removeAtIndexFromUser0(int index) {
    user0.removeAt(index);
  }

  void updateUser0AtIndex(
    int index,
    User2Struct Function(User2Struct) updateFn,
  ) {
    user0[index] = updateFn(_user0[index]);
  }

  void insertAtIndexInUser0(int index, User2Struct value) {
    user0.insert(index, value);
  }

  int _page = 1;
  int get page => _page;
  set page(int value) {
    _page = value;
  }

  int _perPage = 10;
  int get perPage => _perPage;
  set perPage(int value) {
    _perPage = value;
  }

  int _itemsReceived = 0;
  int get itemsReceived => _itemsReceived;
  set itemsReceived(int value) {
    _itemsReceived = value;
  }

  int _nextPage = 0;
  int get nextPage => _nextPage;
  set nextPage(int value) {
    _nextPage = value;
  }

  int _prevPage = 0;
  int get prevPage => _prevPage;
  set prevPage(int value) {
    _prevPage = value;
  }

  int _itemsTotal = 0;
  int get itemsTotal => _itemsTotal;
  set itemsTotal(int value) {
    _itemsTotal = value;
  }

  bool _loading = false;
  bool get loading => _loading;
  set loading(bool value) {
    _loading = value;
  }

  int _teamId = 0;
  int get teamId => _teamId;
  set teamId(int value) {
    _teamId = value;
    prefs.setInt('ff_teamId', value);
  }

  List<User1Struct> _filterUserSet = [];
  List<User1Struct> get filterUserSet => _filterUserSet;
  set filterUserSet(List<User1Struct> value) {
    _filterUserSet = value;
  }

  void addToFilterUserSet(User1Struct value) {
    filterUserSet.add(value);
  }

  void removeFromFilterUserSet(User1Struct value) {
    filterUserSet.remove(value);
  }

  void removeAtIndexFromFilterUserSet(int index) {
    filterUserSet.removeAt(index);
  }

  void updateFilterUserSetAtIndex(
    int index,
    User1Struct Function(User1Struct) updateFn,
  ) {
    filterUserSet[index] = updateFn(_filterUserSet[index]);
  }

  void insertAtIndexInFilterUserSet(int index, User1Struct value) {
    filterUserSet.insert(index, value);
  }

  List<InfosTrackersTypeStruct> _infostrackerstype = [];
  List<InfosTrackersTypeStruct> get infostrackerstype => _infostrackerstype;
  set infostrackerstype(List<InfosTrackersTypeStruct> value) {
    _infostrackerstype = value;
  }

  void addToInfostrackerstype(InfosTrackersTypeStruct value) {
    infostrackerstype.add(value);
  }

  void removeFromInfostrackerstype(InfosTrackersTypeStruct value) {
    infostrackerstype.remove(value);
  }

  void removeAtIndexFromInfostrackerstype(int index) {
    infostrackerstype.removeAt(index);
  }

  void updateInfostrackerstypeAtIndex(
    int index,
    InfosTrackersTypeStruct Function(InfosTrackersTypeStruct) updateFn,
  ) {
    infostrackerstype[index] = updateFn(_infostrackerstype[index]);
  }

  void insertAtIndexInInfostrackerstype(
      int index, InfosTrackersTypeStruct value) {
    infostrackerstype.insert(index, value);
  }

  List<int> _qtdEstacas = [];
  List<int> get qtdEstacas => _qtdEstacas;
  set qtdEstacas(List<int> value) {
    _qtdEstacas = value;
  }

  void addToQtdEstacas(int value) {
    qtdEstacas.add(value);
  }

  void removeFromQtdEstacas(int value) {
    qtdEstacas.remove(value);
  }

  void removeAtIndexFromQtdEstacas(int index) {
    qtdEstacas.removeAt(index);
  }

  void updateQtdEstacasAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    qtdEstacas[index] = updateFn(_qtdEstacas[index]);
  }

  void insertAtIndexInQtdEstacas(int index, int value) {
    qtdEstacas.insert(index, value);
  }

  bool _form1 = false;
  bool get form1 => _form1;
  set form1(bool value) {
    _form1 = value;
  }

  bool _form2 = false;
  bool get form2 => _form2;
  set form2(bool value) {
    _form2 = value;
  }

  List<bool> _statusCheckGlobal = [];
  List<bool> get statusCheckGlobal => _statusCheckGlobal;
  set statusCheckGlobal(List<bool> value) {
    _statusCheckGlobal = value;
  }

  void addToStatusCheckGlobal(bool value) {
    statusCheckGlobal.add(value);
  }

  void removeFromStatusCheckGlobal(bool value) {
    statusCheckGlobal.remove(value);
  }

  void removeAtIndexFromStatusCheckGlobal(int index) {
    statusCheckGlobal.removeAt(index);
  }

  void updateStatusCheckGlobalAtIndex(
    int index,
    bool Function(bool) updateFn,
  ) {
    statusCheckGlobal[index] = updateFn(_statusCheckGlobal[index]);
  }

  void insertAtIndexInStatusCheckGlobal(int index, bool value) {
    statusCheckGlobal.insert(index, value);
  }

  /// Para controlar o disable do checkbox da estaca
  List<int> _ultimosClicks = [];
  List<int> get ultimosClicks => _ultimosClicks;
  set ultimosClicks(List<int> value) {
    _ultimosClicks = value;
  }

  void addToUltimosClicks(int value) {
    ultimosClicks.add(value);
  }

  void removeFromUltimosClicks(int value) {
    ultimosClicks.remove(value);
  }

  void removeAtIndexFromUltimosClicks(int index) {
    ultimosClicks.removeAt(index);
  }

  void updateUltimosClicksAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    ultimosClicks[index] = updateFn(_ultimosClicks[index]);
  }

  void insertAtIndexInUltimosClicks(int index, int value) {
    ultimosClicks.insert(index, value);
  }

  /// Reserva para gravar somente o botão para adicionar.
  int _idEstaca = 0;
  int get idEstaca => _idEstaca;
  set idEstaca(int value) {
    _idEstaca = value;
  }

  List<DropSelect1Struct> _addFileiraTracker = [];
  List<DropSelect1Struct> get addFileiraTracker => _addFileiraTracker;
  set addFileiraTracker(List<DropSelect1Struct> value) {
    _addFileiraTracker = value;
  }

  void addToAddFileiraTracker(DropSelect1Struct value) {
    addFileiraTracker.add(value);
  }

  void removeFromAddFileiraTracker(DropSelect1Struct value) {
    addFileiraTracker.remove(value);
  }

  void removeAtIndexFromAddFileiraTracker(int index) {
    addFileiraTracker.removeAt(index);
  }

  void updateAddFileiraTrackerAtIndex(
    int index,
    DropSelect1Struct Function(DropSelect1Struct) updateFn,
  ) {
    addFileiraTracker[index] = updateFn(_addFileiraTracker[index]);
  }

  void insertAtIndexInAddFileiraTracker(int index, DropSelect1Struct value) {
    addFileiraTracker.insert(index, value);
  }

  List<int> _idsExistentes = [];
  List<int> get idsExistentes => _idsExistentes;
  set idsExistentes(List<int> value) {
    _idsExistentes = value;
  }

  void addToIdsExistentes(int value) {
    idsExistentes.add(value);
  }

  void removeFromIdsExistentes(int value) {
    idsExistentes.remove(value);
  }

  void removeAtIndexFromIdsExistentes(int index) {
    idsExistentes.removeAt(index);
  }

  void updateIdsExistentesAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    idsExistentes[index] = updateFn(_idsExistentes[index]);
  }

  void insertAtIndexInIdsExistentes(int index, int value) {
    idsExistentes.insert(index, value);
  }

  bool _esqueleto1 = false;
  bool get esqueleto1 => _esqueleto1;
  set esqueleto1(bool value) {
    _esqueleto1 = value;
  }

  bool _esqueleto2 = false;
  bool get esqueleto2 => _esqueleto2;
  set esqueleto2(bool value) {
    _esqueleto2 = value;
  }

  bool _excluiuTrackers = false;
  bool get excluiuTrackers => _excluiuTrackers;
  set excluiuTrackers(bool value) {
    _excluiuTrackers = value;
  }

  int _id = 0;
  int get id => _id;
  set id(int value) {
    _id = value;
  }

  bool _actionReturn = false;
  bool get actionReturn => _actionReturn;
  set actionReturn(bool value) {
    _actionReturn = value;
  }

  List<MapTrackersStruct> _jsonRowsRef = [];
  List<MapTrackersStruct> get jsonRowsRef => _jsonRowsRef;
  set jsonRowsRef(List<MapTrackersStruct> value) {
    _jsonRowsRef = value;
  }

  void addToJsonRowsRef(MapTrackersStruct value) {
    jsonRowsRef.add(value);
  }

  void removeFromJsonRowsRef(MapTrackersStruct value) {
    jsonRowsRef.remove(value);
  }

  void removeAtIndexFromJsonRowsRef(int index) {
    jsonRowsRef.removeAt(index);
  }

  void updateJsonRowsRefAtIndex(
    int index,
    MapTrackersStruct Function(MapTrackersStruct) updateFn,
  ) {
    jsonRowsRef[index] = updateFn(_jsonRowsRef[index]);
  }

  void insertAtIndexInJsonRowsRef(int index, MapTrackersStruct value) {
    jsonRowsRef.insert(index, value);
  }

  List<int> _filtroIdsStatusStakes = [];
  List<int> get filtroIdsStatusStakes => _filtroIdsStatusStakes;
  set filtroIdsStatusStakes(List<int> value) {
    _filtroIdsStatusStakes = value;
  }

  void addToFiltroIdsStatusStakes(int value) {
    filtroIdsStatusStakes.add(value);
  }

  void removeFromFiltroIdsStatusStakes(int value) {
    filtroIdsStatusStakes.remove(value);
  }

  void removeAtIndexFromFiltroIdsStatusStakes(int index) {
    filtroIdsStatusStakes.removeAt(index);
  }

  void updateFiltroIdsStatusStakesAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    filtroIdsStatusStakes[index] = updateFn(_filtroIdsStatusStakes[index]);
  }

  void insertAtIndexInFiltroIdsStatusStakes(int index, int value) {
    filtroIdsStatusStakes.insert(index, value);
  }

  List<int> _filtroIdsStatusTracker = [];
  List<int> get filtroIdsStatusTracker => _filtroIdsStatusTracker;
  set filtroIdsStatusTracker(List<int> value) {
    _filtroIdsStatusTracker = value;
  }

  void addToFiltroIdsStatusTracker(int value) {
    filtroIdsStatusTracker.add(value);
  }

  void removeFromFiltroIdsStatusTracker(int value) {
    filtroIdsStatusTracker.remove(value);
  }

  void removeAtIndexFromFiltroIdsStatusTracker(int index) {
    filtroIdsStatusTracker.removeAt(index);
  }

  void updateFiltroIdsStatusTrackerAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    filtroIdsStatusTracker[index] = updateFn(_filtroIdsStatusTracker[index]);
  }

  void insertAtIndexInFiltroIdsStatusTracker(int index, int value) {
    filtroIdsStatusTracker.insert(index, value);
  }

  List<int> _filtroIdsTypeTracker = [];
  List<int> get filtroIdsTypeTracker => _filtroIdsTypeTracker;
  set filtroIdsTypeTracker(List<int> value) {
    _filtroIdsTypeTracker = value;
  }

  void addToFiltroIdsTypeTracker(int value) {
    filtroIdsTypeTracker.add(value);
  }

  void removeFromFiltroIdsTypeTracker(int value) {
    filtroIdsTypeTracker.remove(value);
  }

  void removeAtIndexFromFiltroIdsTypeTracker(int index) {
    filtroIdsTypeTracker.removeAt(index);
  }

  void updateFiltroIdsTypeTrackerAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    filtroIdsTypeTracker[index] = updateFn(_filtroIdsTypeTracker[index]);
  }

  void insertAtIndexInFiltroIdsTypeTracker(int index, int value) {
    filtroIdsTypeTracker.insert(index, value);
  }

  List<int> _filtroIdsCargo = [];
  List<int> get filtroIdsCargo => _filtroIdsCargo;
  set filtroIdsCargo(List<int> value) {
    _filtroIdsCargo = value;
  }

  void addToFiltroIdsCargo(int value) {
    filtroIdsCargo.add(value);
  }

  void removeFromFiltroIdsCargo(int value) {
    filtroIdsCargo.remove(value);
  }

  void removeAtIndexFromFiltroIdsCargo(int index) {
    filtroIdsCargo.removeAt(index);
  }

  void updateFiltroIdsCargoAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    filtroIdsCargo[index] = updateFn(_filtroIdsCargo[index]);
  }

  void insertAtIndexInFiltroIdsCargo(int index, int value) {
    filtroIdsCargo.insert(index, value);
  }


  List<int> _filtroTeams = [];
  List<int> get filtroTeams => _filtroTeams;
  set filtroTeams(List<int> value) {
    _filtroTeams = value;
  }

  void addToFiltroTeams(int value) {
    filtroTeams.add(value);
  }

  void removeFromFiltroTeams(int value) {
    filtroTeams.remove(value);
  }

  void removeAtIndexFromFiltroTeams(int index) {
    filtroTeams.removeAt(index);
  }

  void updateFiltroTeamsAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    filtroTeams[index] = updateFn(_filtroTeams[index]);
  }

  void insertAtIndexInFiltroTeams(int index, int value) {
    filtroTeams.insert(index, value);
  }

  List<String> _secaoVazia = ['Selecione um campo'];
  List<String> get secaoVazia => _secaoVazia;
  set secaoVazia(List<String> value) {
    _secaoVazia = value;
    prefs.setStringList('ff_secaoVazia', value);
  }

  void addToSecaoVazia(String value) {
    secaoVazia.add(value);
    prefs.setStringList('ff_secaoVazia', _secaoVazia);
  }

  void removeFromSecaoVazia(String value) {
    secaoVazia.remove(value);
    prefs.setStringList('ff_secaoVazia', _secaoVazia);
  }

  void removeAtIndexFromSecaoVazia(int index) {
    secaoVazia.removeAt(index);
    prefs.setStringList('ff_secaoVazia', _secaoVazia);
  }

  void updateSecaoVaziaAtIndex(
    int index,
    String Function(String) updateFn,
  ) {
    secaoVazia[index] = updateFn(_secaoVazia[index]);
    prefs.setStringList('ff_secaoVazia', _secaoVazia);
  }

  void insertAtIndexInSecaoVazia(int index, String value) {
    secaoVazia.insert(index, value);
    prefs.setStringList('ff_secaoVazia', _secaoVazia);
  }

  List<String> _fileiraVazia = ['Selecione uma seção'];
  List<String> get fileiraVazia => _fileiraVazia;
  set fileiraVazia(List<String> value) {
    _fileiraVazia = value;
    prefs.setStringList('ff_fileiraVazia', value);
  }

  void addToFileiraVazia(String value) {
    fileiraVazia.add(value);
    prefs.setStringList('ff_fileiraVazia', _fileiraVazia);
  }

  void removeFromFileiraVazia(String value) {
    fileiraVazia.remove(value);
    prefs.setStringList('ff_fileiraVazia', _fileiraVazia);
  }

  void removeAtIndexFromFileiraVazia(int index) {
    fileiraVazia.removeAt(index);
    prefs.setStringList('ff_fileiraVazia', _fileiraVazia);
  }

  void updateFileiraVaziaAtIndex(
    int index,
    String Function(String) updateFn,
  ) {
    fileiraVazia[index] = updateFn(_fileiraVazia[index]);
    prefs.setStringList('ff_fileiraVazia', _fileiraVazia);
  }

  void insertAtIndexInFileiraVazia(int index, String value) {
    fileiraVazia.insert(index, value);
    prefs.setStringList('ff_fileiraVazia', _fileiraVazia);
  }

  List<String> _trackerVazio = ['Selecione uma fileira'];
  List<String> get trackerVazio => _trackerVazio;
  set trackerVazio(List<String> value) {
    _trackerVazio = value;
    prefs.setStringList('ff_trackerVazio', value);
  }

  void addToTrackerVazio(String value) {
    trackerVazio.add(value);
    prefs.setStringList('ff_trackerVazio', _trackerVazio);
  }

  void removeFromTrackerVazio(String value) {
    trackerVazio.remove(value);
    prefs.setStringList('ff_trackerVazio', _trackerVazio);
  }

  void removeAtIndexFromTrackerVazio(int index) {
    trackerVazio.removeAt(index);
    prefs.setStringList('ff_trackerVazio', _trackerVazio);
  }

  void updateTrackerVazioAtIndex(
    int index,
    String Function(String) updateFn,
  ) {
    trackerVazio[index] = updateFn(_trackerVazio[index]);
    prefs.setStringList('ff_trackerVazio', _trackerVazio);
  }

  void insertAtIndexInTrackerVazio(int index, String value) {
    trackerVazio.insert(index, value);
    prefs.setStringList('ff_trackerVazio', _trackerVazio);
  }

  List<int> _listaVazia = [0];
  List<int> get listaVazia => _listaVazia;
  set listaVazia(List<int> value) {
    _listaVazia = value;
    prefs.setStringList(
        'ff_listaVazia', value.map((x) => x.toString()).toList());
  }

  void addToListaVazia(int value) {
    listaVazia.add(value);
    prefs.setStringList(
        'ff_listaVazia', _listaVazia.map((x) => x.toString()).toList());
  }

  void removeFromListaVazia(int value) {
    listaVazia.remove(value);
    prefs.setStringList(
        'ff_listaVazia', _listaVazia.map((x) => x.toString()).toList());
  }

  void removeAtIndexFromListaVazia(int index) {
    listaVazia.removeAt(index);
    prefs.setStringList(
        'ff_listaVazia', _listaVazia.map((x) => x.toString()).toList());
  }

  void updateListaVaziaAtIndex(
    int index,
    int Function(int) updateFn,
  ) {
    listaVazia[index] = updateFn(_listaVazia[index]);
    prefs.setStringList(
        'ff_listaVazia', _listaVazia.map((x) => x.toString()).toList());
  }

  void insertAtIndexInListaVazia(int index, int value) {
    listaVazia.insert(index, value);
    prefs.setStringList(
        'ff_listaVazia', _listaVazia.map((x) => x.toString()).toList());
  }

  bool _filtroBacklogSprint = false;
  bool get filtroBacklogSprint => _filtroBacklogSprint;
  set filtroBacklogSprint(bool value) {
    _filtroBacklogSprint = value;
  }

  List<InfosTrackersTypeStruct> _filterTrackers = [];
  List<InfosTrackersTypeStruct> get filterTrackers => _filterTrackers;
  set filterTrackers(List<InfosTrackersTypeStruct> value) {
    _filterTrackers = value;
  }

  void addToFilterTrackers(InfosTrackersTypeStruct value) {
    filterTrackers.add(value);
  }

  void removeFromFilterTrackers(InfosTrackersTypeStruct value) {
    filterTrackers.remove(value);
  }

  void removeAtIndexFromFilterTrackers(int index) {
    filterTrackers.removeAt(index);
  }

  void updateFilterTrackersAtIndex(
    int index,
    InfosTrackersTypeStruct Function(InfosTrackersTypeStruct) updateFn,
  ) {
    filterTrackers[index] = updateFn(_filterTrackers[index]);
  }

  void insertAtIndexInFilterTrackers(int index, InfosTrackersTypeStruct value) {
    filterTrackers.insert(index, value);
  }

  FilterStruct _filterManufactures = FilterStruct();
  FilterStruct get filterManufactures => _filterManufactures;
  set filterManufactures(FilterStruct value) {
    _filterManufactures = value;
  }

  void updateFilterManufacturesStruct(Function(FilterStruct) updateFn) {
    updateFn(_filterManufactures);
  }

  FilterStruct _filterTracker = FilterStruct();
  FilterStruct get filterTracker => _filterTracker;
  set filterTracker(FilterStruct value) {
    _filterTracker = value;
  }

  void updateFilterTrackerStruct(Function(FilterStruct) updateFn) {
    updateFn(_filterTracker);
  }

  FilterStruct _filterModules = FilterStruct();
  FilterStruct get filterModules => _filterModules;
  set filterModules(FilterStruct value) {
    _filterModules = value;
  }

  void updateFilterModulesStruct(Function(FilterStruct) updateFn) {
    updateFn(_filterModules);
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

  List<ItemsStruct> _userLideres = [];
  List<ItemsStruct> get userLideres => _userLideres;
  set userLideres(List<ItemsStruct> value) {
    _userLideres = value;
  }

  void addToUserLideres(ItemsStruct value) {
    userLideres.add(value);
  }

  void removeFromUserLideres(ItemsStruct value) {
    userLideres.remove(value);
  }

  void removeAtIndexFromUserLideres(int index) {
    userLideres.removeAt(index);
  }

  void updateUserLideresAtIndex(
    int index,
    ItemsStruct Function(ItemsStruct) updateFn,
  ) {
    userLideres[index] = updateFn(_userLideres[index]);
  }

  void insertAtIndexInUserLideres(int index, ItemsStruct value) {
    userLideres.insert(index, value);
  }

  int _filterBacklog = 1;
  int get filterBacklog => _filterBacklog;
  set filterBacklog(int value) {
    _filterBacklog = value;
  }

  bool _duplicado = false;
  bool get duplicado => _duplicado;
  set duplicado(bool value) {
    _duplicado = value;
  }

  List<DateTime> _filtroData = [];
  List<DateTime> get filtroData => _filtroData;
  set filtroData(List<DateTime> value) {
    _filtroData = value;
  }

  void addToFiltroData(DateTime value) {
    filtroData.add(value);
  }

  void removeFromFiltroData(DateTime value) {
    filtroData.remove(value);
  }

  void removeAtIndexFromFiltroData(int index) {
    filtroData.removeAt(index);
  }

  void updateFiltroDataAtIndex(
    int index,
    DateTime Function(DateTime) updateFn,
  ) {
    filtroData[index] = updateFn(_filtroData[index]);
  }

  void insertAtIndexInFiltroData(int index, DateTime value) {
    filtroData.insert(index, value);
  }

  bool _exportar = false;
  bool get exportar => _exportar;
  set exportar(bool value) {
    _exportar = value;
  }

  DateTime? _dataInforme;
  DateTime? get dataInforme => _dataInforme;
  set dataInforme(DateTime? value) {
    _dataInforme = value;
  }

  List<ListaTasksStruct> _listatasks = [];
  List<ListaTasksStruct> get listatasks => _listatasks;
  set listatasks(List<ListaTasksStruct> value) {
    _listatasks = value;
  }

  void addToListatasks(ListaTasksStruct value) {
    listatasks.add(value);
  }

  void removeFromListatasks(ListaTasksStruct value) {
    listatasks.remove(value);
  }

  void removeAtIndexFromListatasks(int index) {
    listatasks.removeAt(index);
  }

  void updateListatasksAtIndex(
    int index,
    ListaTasksStruct Function(ListaTasksStruct) updateFn,
  ) {
    listatasks[index] = updateFn(_listatasks[index]);
  }

  void insertAtIndexInListatasks(int index, ListaTasksStruct value) {
    listatasks.insert(index, value);
  }

  FilterStruct _filtroEstoqueStatus = FilterStruct();
  FilterStruct get filtroEstoqueStatus => _filtroEstoqueStatus;
  set filtroEstoqueStatus(FilterStruct value) {
    _filtroEstoqueStatus = value;
  }

  void updateFiltroEstoqueStatusStruct(Function(FilterStruct) updateFn) {
    updateFn(_filtroEstoqueStatus);
  }

  FilterStruct _filtroCategoryInventory = FilterStruct();
  FilterStruct get filtroCategoryInventory => _filtroCategoryInventory;
  set filtroCategoryInventory(FilterStruct value) {
    _filtroCategoryInventory = value;
  }

  void updateFiltroCategoryInventoryStruct(Function(FilterStruct) updateFn) {
    updateFn(_filtroCategoryInventory);
  }

  int _campoID = 0;
  int get campoID => _campoID;
  set campoID(int value) {
    _campoID = value;
  }

  String _mode = '';
  String get mode => _mode;
  set mode(String value) {
    _mode = value;
  }

  dynamic _tarefas;
  dynamic get tarefas => _tarefas;
  set tarefas(dynamic value) {
    _tarefas = value;
    prefs.setString('ff_tarefas', jsonEncode(value));
  }

  String _email = '';
  String get email => _email;
  set email(String value) {
    _email = value;
  }

  String _senha = '';
  String get senha => _senha;
  set senha(String value) {
    _senha = value;
  }

  bool _projects = false;
  bool get projects => _projects;
  set projects(bool value) {
    _projects = value;
  }

  bool _isMap = false;
  bool get isMap => _isMap;
  set isMap(bool value) {
    _isMap = value;
  }

  List<String> _headers = [];
  List<String> get headers => _headers;
  set headers(List<String> value) {
    _headers = value;
  }

  void addToHeaders(String value) {
    headers.add(value);
  }

  void removeFromHeaders(String value) {
    headers.remove(value);
  }

  void removeAtIndexFromHeaders(int index) {
    headers.removeAt(index);
  }

  void updateHeadersAtIndex(
    int index,
    String Function(String) updateFn,
  ) {
    headers[index] = updateFn(_headers[index]);
  }

  void insertAtIndexInHeaders(int index, String value) {
    headers.insert(index, value);
  }

  List<HeadersStruct> _headersSet = [];
  List<HeadersStruct> get headersSet => _headersSet;
  set headersSet(List<HeadersStruct> value) {
    _headersSet = value;
  }

  void addToHeadersSet(HeadersStruct value) {
    headersSet.add(value);
  }

  void removeFromHeadersSet(HeadersStruct value) {
    headersSet.remove(value);
  }

  void removeAtIndexFromHeadersSet(int index) {
    headersSet.removeAt(index);
  }

  void updateHeadersSetAtIndex(
    int index,
    HeadersStruct Function(HeadersStruct) updateFn,
  ) {
    headersSet[index] = updateFn(_headersSet[index]);
  }

  void insertAtIndexInHeadersSet(int index, HeadersStruct value) {
    headersSet.insert(index, value);
  }
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
