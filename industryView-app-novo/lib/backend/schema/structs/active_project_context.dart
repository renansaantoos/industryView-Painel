import '/backend/schema/util/schema_util.dart';
import 'index.dart';
import '/core/utils/app_utils.dart';

class ActiveProjectContextStruct extends BaseStruct {
  ActiveProjectContextStruct({
    int? projectId,
    String? projectName,
    int? teamsId,
    int? scheduleId,
    int? sprintId,
    String? sprintTitle,
    String? date,
    List<int>? allIds,
    List<int>? qrCodeIDs,
    List<int>? liberaManual,
    bool? rdoFinalized,
  })  : _projectId = projectId,
        _projectName = projectName,
        _teamsId = teamsId,
        _scheduleId = scheduleId,
        _sprintId = sprintId,
        _sprintTitle = sprintTitle,
        _date = date,
        _allIds = allIds,
        _qrCodeIDs = qrCodeIDs,
        _liberaManual = liberaManual,
        _rdoFinalized = rdoFinalized;

  int? _projectId;
  int get projectId => _projectId ?? 0;
  set projectId(int? val) => _projectId = val;
  bool hasProjectId() => _projectId != null;

  String? _projectName;
  String get projectName => _projectName ?? '';
  set projectName(String? val) => _projectName = val;
  bool hasProjectName() => _projectName != null;

  int? _teamsId;
  int get teamsId => _teamsId ?? 0;
  set teamsId(int? val) => _teamsId = val;
  bool hasTeamsId() => _teamsId != null;

  int? _scheduleId;
  int get scheduleId => _scheduleId ?? 0;
  set scheduleId(int? val) => _scheduleId = val;
  bool hasScheduleId() => _scheduleId != null;

  int? _sprintId;
  int get sprintId => _sprintId ?? 0;
  set sprintId(int? val) => _sprintId = val;
  bool hasSprintId() => _sprintId != null;

  String? _sprintTitle;
  String get sprintTitle => _sprintTitle ?? '';
  set sprintTitle(String? val) => _sprintTitle = val;
  bool hasSprintTitle() => _sprintTitle != null;

  String? _date;
  String get date => _date ?? '';
  set date(String? val) => _date = val;
  bool hasDate() => _date != null;

  List<int>? _allIds;
  List<int> get allIds => _allIds ?? const [];
  set allIds(List<int>? val) => _allIds = val;
  bool hasAllIds() => _allIds != null;

  List<int>? _qrCodeIDs;
  List<int> get qrCodeIDs => _qrCodeIDs ?? const [];
  set qrCodeIDs(List<int>? val) => _qrCodeIDs = val;
  bool hasQrCodeIDs() => _qrCodeIDs != null;

  List<int>? _liberaManual;
  List<int> get liberaManual => _liberaManual ?? const [];
  set liberaManual(List<int>? val) => _liberaManual = val;
  bool hasLiberaManual() => _liberaManual != null;

  bool? _rdoFinalized;
  bool get rdoFinalized => _rdoFinalized ?? false;
  set rdoFinalized(bool? val) => _rdoFinalized = val;
  bool hasRdoFinalized() => _rdoFinalized != null;

  static ActiveProjectContextStruct fromMap(Map<String, dynamic> data) =>
      ActiveProjectContextStruct(
        projectId: castToType<int>(data['project_id']),
        projectName: data['project_name'] as String?,
        teamsId: castToType<int>(data['teams_id']),
        scheduleId: castToType<int>(data['schedule_id']),
        sprintId: castToType<int>(data['sprint_id']),
        sprintTitle: data['sprint_title'] as String?,
        date: data['date'] as String?,
        allIds: (data['all_ids'] as List<dynamic>?)?.map((e) => castToType<int>(e)!).toList(),
        qrCodeIDs: (data['qr_code_i_ds'] as List<dynamic>?)?.map((e) => castToType<int>(e)!).toList(),
        liberaManual: (data['libera_manual'] as List<dynamic>?)?.map((e) => castToType<int>(e)!).toList(),
        rdoFinalized: data['rdo_finalized'] as bool?,
      );

  static ActiveProjectContextStruct? maybeFromMap(dynamic data) => data is Map
      ? ActiveProjectContextStruct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'project_id': _projectId,
        'project_name': _projectName,
        'teams_id': _teamsId,
        'schedule_id': _scheduleId,
        'sprint_id': _sprintId,
        'sprint_title': _sprintTitle,
        'date': _date,
        'all_ids': _allIds,
        'qr_code_i_ds': _qrCodeIDs,
        'libera_manual': _liberaManual,
        'rdo_finalized': _rdoFinalized,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'project_id': serializeParam(_projectId, ParamType.int),
        'project_name': serializeParam(_projectName, ParamType.String),
        'teams_id': serializeParam(_teamsId, ParamType.int),
        'schedule_id': serializeParam(_scheduleId, ParamType.int),
        'sprint_id': serializeParam(_sprintId, ParamType.int),
        'sprint_title': serializeParam(_sprintTitle, ParamType.String),
        'date': serializeParam(_date, ParamType.String),
        'all_ids': serializeParam(_allIds, ParamType.int, isList: true),
        'qr_code_i_ds': serializeParam(_qrCodeIDs, ParamType.int, isList: true),
        'libera_manual': serializeParam(_liberaManual, ParamType.int, isList: true),
        'rdo_finalized': serializeParam(_rdoFinalized, ParamType.bool),
      }.withoutNulls;

  static ActiveProjectContextStruct fromSerializableMap(
          Map<String, dynamic> data) =>
      ActiveProjectContextStruct(
        projectId: deserializeParam(data['project_id'], ParamType.int, false),
        projectName:
            deserializeParam(data['project_name'], ParamType.String, false),
        teamsId: deserializeParam(data['teams_id'], ParamType.int, false),
        scheduleId: deserializeParam(data['schedule_id'], ParamType.int, false),
        sprintId: deserializeParam(data['sprint_id'], ParamType.int, false),
        sprintTitle:
            deserializeParam(data['sprint_title'], ParamType.String, false),
        date: deserializeParam(data['date'], ParamType.String, false),
        allIds: deserializeParam<int>(data['all_ids'], ParamType.int, true)
            ?.cast<int>()
            .toList(),
        qrCodeIDs:
            deserializeParam<int>(data['qr_code_i_ds'], ParamType.int, true)
                ?.cast<int>()
                .toList(),
        liberaManual:
            deserializeParam<int>(data['libera_manual'], ParamType.int, true)
                ?.cast<int>()
                .toList(),
        rdoFinalized:
            deserializeParam(data['rdo_finalized'], ParamType.bool, false),
      );

  @override
  String toString() => 'ActiveProjectContextStruct(${toMap()})';

  @override
  bool operator ==(Object other) {
    const listEquality = ListEquality();
    return other is ActiveProjectContextStruct &&
        projectId == other.projectId &&
        projectName == other.projectName &&
        teamsId == other.teamsId &&
        scheduleId == other.scheduleId &&
        sprintId == other.sprintId &&
        sprintTitle == other.sprintTitle &&
        date == other.date &&
        listEquality.equals(allIds, other.allIds) &&
        listEquality.equals(qrCodeIDs, other.qrCodeIDs) &&
        listEquality.equals(liberaManual, other.liberaManual) &&
        rdoFinalized == other.rdoFinalized;
  }

  @override
  int get hashCode => const ListEquality().hash([
        projectId,
        projectName,
        teamsId,
        scheduleId,
        sprintId,
        sprintTitle,
        date,
        allIds,
        qrCodeIDs,
        liberaManual,
        rdoFinalized,
      ]);
}

ActiveProjectContextStruct createActiveProjectContextStruct({
  int? projectId,
  String? projectName,
  int? teamsId,
  int? scheduleId,
  int? sprintId,
  String? sprintTitle,
  String? date,
  bool? rdoFinalized,
}) =>
    ActiveProjectContextStruct(
      projectId: projectId,
      projectName: projectName,
      teamsId: teamsId,
      scheduleId: scheduleId,
      sprintId: sprintId,
      sprintTitle: sprintTitle,
      date: date,
      rdoFinalized: rdoFinalized,
    );
