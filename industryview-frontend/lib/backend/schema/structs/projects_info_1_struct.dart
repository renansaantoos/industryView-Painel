// ignore_for_file: unnecessary_getters_setters

import '/backend/schema/util/schema_util.dart';

import 'index.dart';
import '/flutter_flow/flutter_flow_util.dart';

class ProjectsInfo1Struct extends BaseStruct {
  ProjectsInfo1Struct({
    int? id,
    String? registrationNumber,
    String? name,
    int? projectCreationDate,
    String? originRegistration,
    String? art,
    String? rrt,
    String? cib,
    String? realStateRegistration,
    String? startDate,
    String? permitNumber,
    String? cnae,
    String? situationDate,
    String? responsible,
    String? cep,
    String? city,
    String? number,
    String? state,
    String? country,
    String? street,
    String? neighborhood,
    String? complement,
    int? projectsStatusesId,
    String? cnpj,
    int? completionPercentage,
    String? createdAt,
    String? updatedAt,
    int? projectsWorksSituationsId,
    String? category,
    String? destination,
    String? projectWorkType,
    String? resultingWorkArea,
    LastTeamCreatedStruct? lastTeamCreated,
    String? url,
    String? fileName,
  })  : _id = id,
        _registrationNumber = registrationNumber,
        _name = name,
        _projectCreationDate = projectCreationDate,
        _originRegistration = originRegistration,
        _art = art,
        _rrt = rrt,
        _cib = cib,
        _realStateRegistration = realStateRegistration,
        _startDate = startDate,
        _permitNumber = permitNumber,
        _cnae = cnae,
        _situationDate = situationDate,
        _responsible = responsible,
        _cep = cep,
        _city = city,
        _number = number,
        _state = state,
        _country = country,
        _street = street,
        _neighborhood = neighborhood,
        _complement = complement,
        _projectsStatusesId = projectsStatusesId,
        _cnpj = cnpj,
        _completionPercentage = completionPercentage,
        _createdAt = createdAt,
        _updatedAt = updatedAt,
        _projectsWorksSituationsId = projectsWorksSituationsId,
        _category = category,
        _destination = destination,
        _projectWorkType = projectWorkType,
        _resultingWorkArea = resultingWorkArea,
        _lastTeamCreated = lastTeamCreated,
        _url = url,
        _fileName = fileName;

  // "id" field.
  int? _id;
  int get id => _id ?? 0;
  set id(int? val) => _id = val;

  void incrementId(int amount) => id = id + amount;

  bool hasId() => _id != null;

  // "registration_number" field.
  String? _registrationNumber;
  String get registrationNumber => _registrationNumber ?? '';
  set registrationNumber(String? val) => _registrationNumber = val;

  bool hasRegistrationNumber() => _registrationNumber != null;

  // "name" field.
  String? _name;
  String get name => _name ?? '';
  set name(String? val) => _name = val;

  bool hasName() => _name != null;

  // "project_creation_date" field.
  int? _projectCreationDate;
  int get projectCreationDate => _projectCreationDate ?? 0;
  set projectCreationDate(int? val) => _projectCreationDate = val;

  void incrementProjectCreationDate(int amount) =>
      projectCreationDate = projectCreationDate + amount;

  bool hasProjectCreationDate() => _projectCreationDate != null;

  // "origin_registration" field.
  String? _originRegistration;
  String get originRegistration => _originRegistration ?? '';
  set originRegistration(String? val) => _originRegistration = val;

  bool hasOriginRegistration() => _originRegistration != null;

  // "art" field.
  String? _art;
  String get art => _art ?? '';
  set art(String? val) => _art = val;

  bool hasArt() => _art != null;

  // "rrt" field.
  String? _rrt;
  String get rrt => _rrt ?? '';
  set rrt(String? val) => _rrt = val;

  bool hasRrt() => _rrt != null;

  // "cib" field.
  String? _cib;
  String get cib => _cib ?? '';
  set cib(String? val) => _cib = val;

  bool hasCib() => _cib != null;

  // "real_state_registration" field.
  String? _realStateRegistration;
  String get realStateRegistration => _realStateRegistration ?? '';
  set realStateRegistration(String? val) => _realStateRegistration = val;

  bool hasRealStateRegistration() => _realStateRegistration != null;

  // "start_date" field.
  String? _startDate;
  String get startDate => _startDate ?? '';
  set startDate(String? val) => _startDate = val;

  bool hasStartDate() => _startDate != null;

  // "permit_number" field.
  String? _permitNumber;
  String get permitNumber => _permitNumber ?? '';
  set permitNumber(String? val) => _permitNumber = val;

  bool hasPermitNumber() => _permitNumber != null;

  // "cnae" field.
  String? _cnae;
  String get cnae => _cnae ?? '';
  set cnae(String? val) => _cnae = val;

  bool hasCnae() => _cnae != null;

  // "situation_date" field.
  String? _situationDate;
  String get situationDate => _situationDate ?? '';
  set situationDate(String? val) => _situationDate = val;

  bool hasSituationDate() => _situationDate != null;

  // "responsible" field.
  String? _responsible;
  String get responsible => _responsible ?? '';
  set responsible(String? val) => _responsible = val;

  bool hasResponsible() => _responsible != null;

  // "cep" field.
  String? _cep;
  String get cep => _cep ?? '';
  set cep(String? val) => _cep = val;

  bool hasCep() => _cep != null;

  // "city" field.
  String? _city;
  String get city => _city ?? '';
  set city(String? val) => _city = val;

  bool hasCity() => _city != null;

  // "number" field.
  String? _number;
  String get number => _number ?? '';
  set number(String? val) => _number = val;

  bool hasNumber() => _number != null;

  // "state" field.
  String? _state;
  String get state => _state ?? '';
  set state(String? val) => _state = val;

  bool hasState() => _state != null;

  // "country" field.
  String? _country;
  String get country => _country ?? '';
  set country(String? val) => _country = val;

  bool hasCountry() => _country != null;

  // "street" field.
  String? _street;
  String get street => _street ?? '';
  set street(String? val) => _street = val;

  bool hasStreet() => _street != null;

  // "neighborhood" field.
  String? _neighborhood;
  String get neighborhood => _neighborhood ?? '';
  set neighborhood(String? val) => _neighborhood = val;

  bool hasNeighborhood() => _neighborhood != null;

  // "complement" field.
  String? _complement;
  String get complement => _complement ?? '';
  set complement(String? val) => _complement = val;

  bool hasComplement() => _complement != null;

  // "projects_statuses_id" field.
  int? _projectsStatusesId;
  int get projectsStatusesId => _projectsStatusesId ?? 0;
  set projectsStatusesId(int? val) => _projectsStatusesId = val;

  void incrementProjectsStatusesId(int amount) =>
      projectsStatusesId = projectsStatusesId + amount;

  bool hasProjectsStatusesId() => _projectsStatusesId != null;

  // "cnpj" field.
  String? _cnpj;
  String get cnpj => _cnpj ?? '';
  set cnpj(String? val) => _cnpj = val;

  bool hasCnpj() => _cnpj != null;

  // "completion_percentage" field.
  int? _completionPercentage;
  int get completionPercentage => _completionPercentage ?? 0;
  set completionPercentage(int? val) => _completionPercentage = val;

  void incrementCompletionPercentage(int amount) =>
      completionPercentage = completionPercentage + amount;

  bool hasCompletionPercentage() => _completionPercentage != null;

  // "created_at" field.
  String? _createdAt;
  String get createdAt => _createdAt ?? '';
  set createdAt(String? val) => _createdAt = val;

  bool hasCreatedAt() => _createdAt != null;

  // "updated_at" field.
  String? _updatedAt;
  String get updatedAt => _updatedAt ?? '';
  set updatedAt(String? val) => _updatedAt = val;

  bool hasUpdatedAt() => _updatedAt != null;

  // "projects_works_situations_id" field.
  int? _projectsWorksSituationsId;
  int get projectsWorksSituationsId => _projectsWorksSituationsId ?? 0;
  set projectsWorksSituationsId(int? val) => _projectsWorksSituationsId = val;

  void incrementProjectsWorksSituationsId(int amount) =>
      projectsWorksSituationsId = projectsWorksSituationsId + amount;

  bool hasProjectsWorksSituationsId() => _projectsWorksSituationsId != null;

  // "category" field.
  String? _category;
  String get category => _category ?? '';
  set category(String? val) => _category = val;

  bool hasCategory() => _category != null;

  // "destination" field.
  String? _destination;
  String get destination => _destination ?? '';
  set destination(String? val) => _destination = val;

  bool hasDestination() => _destination != null;

  // "project_work_type" field.
  String? _projectWorkType;
  String get projectWorkType => _projectWorkType ?? '';
  set projectWorkType(String? val) => _projectWorkType = val;

  bool hasProjectWorkType() => _projectWorkType != null;

  // "resulting_work_area" field.
  String? _resultingWorkArea;
  String get resultingWorkArea => _resultingWorkArea ?? '';
  set resultingWorkArea(String? val) => _resultingWorkArea = val;

  bool hasResultingWorkArea() => _resultingWorkArea != null;

  // "last_team_created" field.
  LastTeamCreatedStruct? _lastTeamCreated;
  LastTeamCreatedStruct get lastTeamCreated =>
      _lastTeamCreated ?? LastTeamCreatedStruct();
  set lastTeamCreated(LastTeamCreatedStruct? val) => _lastTeamCreated = val;

  void updateLastTeamCreated(Function(LastTeamCreatedStruct) updateFn) {
    updateFn(_lastTeamCreated ??= LastTeamCreatedStruct());
  }

  bool hasLastTeamCreated() => _lastTeamCreated != null;

  // "url" field.
  String? _url;
  String get url => _url ?? '';
  set url(String? val) => _url = val;

  bool hasUrl() => _url != null;

  // "file_name" field.
  String? _fileName;
  String get fileName => _fileName ?? '';
  set fileName(String? val) => _fileName = val;

  bool hasFileName() => _fileName != null;

  static ProjectsInfo1Struct fromMap(Map<String, dynamic> data) =>
      ProjectsInfo1Struct(
        id: castToType<int>(data['id']),
        registrationNumber: data['registration_number'] as String?,
        name: data['name'] as String?,
        projectCreationDate: castToType<int>(data['project_creation_date']),
        originRegistration: data['origin_registration'] as String?,
        art: data['art'] as String?,
        rrt: data['rrt'] as String?,
        cib: data['cib'] as String?,
        realStateRegistration: data['real_state_registration'] as String?,
        startDate: data['start_date'] as String?,
        permitNumber: data['permit_number'] as String?,
        cnae: data['cnae'] as String?,
        situationDate: data['situation_date'] as String?,
        responsible: data['responsible'] as String?,
        cep: data['cep'] as String?,
        city: data['city'] as String?,
        number: data['number'] as String?,
        state: data['state'] as String?,
        country: data['country'] as String?,
        street: data['street'] as String?,
        neighborhood: data['neighborhood'] as String?,
        complement: data['complement'] as String?,
        projectsStatusesId: castToType<int>(data['projects_statuses_id']),
        cnpj: data['cnpj'] as String?,
        completionPercentage: castToType<int>(data['completion_percentage']),
        createdAt: castToType<String>(data['created_at']),
        updatedAt: castToType<String>(data['updated_at']),
        projectsWorksSituationsId:
            castToType<int>(data['projects_works_situations_id']),
        category: data['category'] as String?,
        destination: data['destination'] as String?,
        projectWorkType: data['project_work_type'] as String?,
        resultingWorkArea: data['resulting_work_area'] as String?,
        lastTeamCreated: data['last_team_created'] is LastTeamCreatedStruct
            ? data['last_team_created']
            : LastTeamCreatedStruct.maybeFromMap(data['last_team_created']),
        url: data['url'] as String?,
        fileName: data['file_name'] as String?,
      );

  static ProjectsInfo1Struct? maybeFromMap(dynamic data) => data is Map
      ? ProjectsInfo1Struct.fromMap(data.cast<String, dynamic>())
      : null;

  Map<String, dynamic> toMap() => {
        'id': _id,
        'registration_number': _registrationNumber,
        'name': _name,
        'project_creation_date': _projectCreationDate,
        'origin_registration': _originRegistration,
        'art': _art,
        'rrt': _rrt,
        'cib': _cib,
        'real_state_registration': _realStateRegistration,
        'start_date': _startDate,
        'permit_number': _permitNumber,
        'cnae': _cnae,
        'situation_date': _situationDate,
        'responsible': _responsible,
        'cep': _cep,
        'city': _city,
        'number': _number,
        'state': _state,
        'country': _country,
        'street': _street,
        'neighborhood': _neighborhood,
        'complement': _complement,
        'projects_statuses_id': _projectsStatusesId,
        'cnpj': _cnpj,
        'completion_percentage': _completionPercentage,
        'created_at': _createdAt,
        'updated_at': _updatedAt,
        'projects_works_situations_id': _projectsWorksSituationsId,
        'category': _category,
        'destination': _destination,
        'project_work_type': _projectWorkType,
        'resulting_work_area': _resultingWorkArea,
        'last_team_created': _lastTeamCreated?.toMap(),
        'url': _url,
        'file_name': _fileName,
      }.withoutNulls;

  @override
  Map<String, dynamic> toSerializableMap() => {
        'id': serializeParam(
          _id,
          ParamType.int,
        ),
        'registration_number': serializeParam(
          _registrationNumber,
          ParamType.String,
        ),
        'name': serializeParam(
          _name,
          ParamType.String,
        ),
        'project_creation_date': serializeParam(
          _projectCreationDate,
          ParamType.int,
        ),
        'origin_registration': serializeParam(
          _originRegistration,
          ParamType.String,
        ),
        'art': serializeParam(
          _art,
          ParamType.String,
        ),
        'rrt': serializeParam(
          _rrt,
          ParamType.String,
        ),
        'cib': serializeParam(
          _cib,
          ParamType.String,
        ),
        'real_state_registration': serializeParam(
          _realStateRegistration,
          ParamType.String,
        ),
        'start_date': serializeParam(
          _startDate,
          ParamType.String,
        ),
        'permit_number': serializeParam(
          _permitNumber,
          ParamType.String,
        ),
        'cnae': serializeParam(
          _cnae,
          ParamType.String,
        ),
        'situation_date': serializeParam(
          _situationDate,
          ParamType.String,
        ),
        'responsible': serializeParam(
          _responsible,
          ParamType.String,
        ),
        'cep': serializeParam(
          _cep,
          ParamType.String,
        ),
        'city': serializeParam(
          _city,
          ParamType.String,
        ),
        'number': serializeParam(
          _number,
          ParamType.String,
        ),
        'state': serializeParam(
          _state,
          ParamType.String,
        ),
        'country': serializeParam(
          _country,
          ParamType.String,
        ),
        'street': serializeParam(
          _street,
          ParamType.String,
        ),
        'neighborhood': serializeParam(
          _neighborhood,
          ParamType.String,
        ),
        'complement': serializeParam(
          _complement,
          ParamType.String,
        ),
        'projects_statuses_id': serializeParam(
          _projectsStatusesId,
          ParamType.int,
        ),
        'cnpj': serializeParam(
          _cnpj,
          ParamType.String,
        ),
        'completion_percentage': serializeParam(
          _completionPercentage,
          ParamType.int,
        ),
        'created_at': serializeParam(
          _createdAt,
          ParamType.String,
        ),
        'updated_at': serializeParam(
          _updatedAt,
          ParamType.String,
        ),
        'projects_works_situations_id': serializeParam(
          _projectsWorksSituationsId,
          ParamType.int,
        ),
        'category': serializeParam(
          _category,
          ParamType.String,
        ),
        'destination': serializeParam(
          _destination,
          ParamType.String,
        ),
        'project_work_type': serializeParam(
          _projectWorkType,
          ParamType.String,
        ),
        'resulting_work_area': serializeParam(
          _resultingWorkArea,
          ParamType.String,
        ),
        'last_team_created': serializeParam(
          _lastTeamCreated,
          ParamType.DataStruct,
        ),
        'url': serializeParam(
          _url,
          ParamType.String,
        ),
        'file_name': serializeParam(
          _fileName,
          ParamType.String,
        ),
      }.withoutNulls;

  static ProjectsInfo1Struct fromSerializableMap(Map<String, dynamic> data) =>
      ProjectsInfo1Struct(
        id: deserializeParam(
          data['id'],
          ParamType.int,
          false,
        ),
        registrationNumber: deserializeParam(
          data['registration_number'],
          ParamType.String,
          false,
        ),
        name: deserializeParam(
          data['name'],
          ParamType.String,
          false,
        ),
        projectCreationDate: deserializeParam(
          data['project_creation_date'],
          ParamType.int,
          false,
        ),
        originRegistration: deserializeParam(
          data['origin_registration'],
          ParamType.String,
          false,
        ),
        art: deserializeParam(
          data['art'],
          ParamType.String,
          false,
        ),
        rrt: deserializeParam(
          data['rrt'],
          ParamType.String,
          false,
        ),
        cib: deserializeParam(
          data['cib'],
          ParamType.String,
          false,
        ),
        realStateRegistration: deserializeParam(
          data['real_state_registration'],
          ParamType.String,
          false,
        ),
        startDate: deserializeParam(
          data['start_date'],
          ParamType.String,
          false,
        ),
        permitNumber: deserializeParam(
          data['permit_number'],
          ParamType.String,
          false,
        ),
        cnae: deserializeParam(
          data['cnae'],
          ParamType.String,
          false,
        ),
        situationDate: deserializeParam(
          data['situation_date'],
          ParamType.String,
          false,
        ),
        responsible: deserializeParam(
          data['responsible'],
          ParamType.String,
          false,
        ),
        cep: deserializeParam(
          data['cep'],
          ParamType.String,
          false,
        ),
        city: deserializeParam(
          data['city'],
          ParamType.String,
          false,
        ),
        number: deserializeParam(
          data['number'],
          ParamType.String,
          false,
        ),
        state: deserializeParam(
          data['state'],
          ParamType.String,
          false,
        ),
        country: deserializeParam(
          data['country'],
          ParamType.String,
          false,
        ),
        street: deserializeParam(
          data['street'],
          ParamType.String,
          false,
        ),
        neighborhood: deserializeParam(
          data['neighborhood'],
          ParamType.String,
          false,
        ),
        complement: deserializeParam(
          data['complement'],
          ParamType.String,
          false,
        ),
        projectsStatusesId: deserializeParam(
          data['projects_statuses_id'],
          ParamType.int,
          false,
        ),
        cnpj: deserializeParam(
          data['cnpj'],
          ParamType.String,
          false,
        ),
        completionPercentage: deserializeParam(
          data['completion_percentage'],
          ParamType.int,
          false,
        ),
        createdAt: deserializeParam(
          data['created_at'],
          ParamType.String,
          false,
        ),
        updatedAt: deserializeParam(
          data['updated_at'],
          ParamType.String,
          false,
        ),
        projectsWorksSituationsId: deserializeParam(
          data['projects_works_situations_id'],
          ParamType.int,
          false,
        ),
        category: deserializeParam(
          data['category'],
          ParamType.String,
          false,
        ),
        destination: deserializeParam(
          data['destination'],
          ParamType.String,
          false,
        ),
        projectWorkType: deserializeParam(
          data['project_work_type'],
          ParamType.String,
          false,
        ),
        resultingWorkArea: deserializeParam(
          data['resulting_work_area'],
          ParamType.String,
          false,
        ),
        lastTeamCreated: deserializeStructParam(
          data['last_team_created'],
          ParamType.DataStruct,
          false,
          structBuilder: LastTeamCreatedStruct.fromSerializableMap,
        ),
        url: deserializeParam(
          data['url'],
          ParamType.String,
          false,
        ),
        fileName: deserializeParam(
          data['file_name'],
          ParamType.String,
          false,
        ),
      );

  @override
  String toString() => 'ProjectsInfo1Struct(${toMap()})';

  @override
  bool operator ==(Object other) {
    return other is ProjectsInfo1Struct &&
        id == other.id &&
        registrationNumber == other.registrationNumber &&
        name == other.name &&
        projectCreationDate == other.projectCreationDate &&
        originRegistration == other.originRegistration &&
        art == other.art &&
        rrt == other.rrt &&
        cib == other.cib &&
        realStateRegistration == other.realStateRegistration &&
        startDate == other.startDate &&
        permitNumber == other.permitNumber &&
        cnae == other.cnae &&
        situationDate == other.situationDate &&
        responsible == other.responsible &&
        cep == other.cep &&
        city == other.city &&
        number == other.number &&
        state == other.state &&
        country == other.country &&
        street == other.street &&
        neighborhood == other.neighborhood &&
        complement == other.complement &&
        projectsStatusesId == other.projectsStatusesId &&
        cnpj == other.cnpj &&
        completionPercentage == other.completionPercentage &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        projectsWorksSituationsId == other.projectsWorksSituationsId &&
        category == other.category &&
        destination == other.destination &&
        projectWorkType == other.projectWorkType &&
        resultingWorkArea == other.resultingWorkArea &&
        lastTeamCreated == other.lastTeamCreated &&
        url == other.url &&
        fileName == other.fileName;
  }

  @override
  int get hashCode => const ListEquality().hash([
        id,
        registrationNumber,
        name,
        projectCreationDate,
        originRegistration,
        art,
        rrt,
        cib,
        realStateRegistration,
        startDate,
        permitNumber,
        cnae,
        situationDate,
        responsible,
        cep,
        city,
        number,
        state,
        country,
        street,
        neighborhood,
        complement,
        projectsStatusesId,
        cnpj,
        completionPercentage,
        createdAt,
        updatedAt,
        projectsWorksSituationsId,
        category,
        destination,
        projectWorkType,
        resultingWorkArea,
        lastTeamCreated,
        url,
        fileName
      ]);
}

ProjectsInfo1Struct createProjectsInfo1Struct({
  int? id,
  String? registrationNumber,
  String? name,
  int? projectCreationDate,
  String? originRegistration,
  String? art,
  String? rrt,
  String? cib,
  String? realStateRegistration,
  String? startDate,
  String? permitNumber,
  String? cnae,
  String? situationDate,
  String? responsible,
  String? cep,
  String? city,
  String? number,
  String? state,
  String? country,
  String? street,
  String? neighborhood,
  String? complement,
  int? projectsStatusesId,
  String? cnpj,
  int? completionPercentage,
  String? createdAt,
  String? updatedAt,
  int? projectsWorksSituationsId,
  String? category,
  String? destination,
  String? projectWorkType,
  String? resultingWorkArea,
  LastTeamCreatedStruct? lastTeamCreated,
  String? url,
  String? fileName,
}) =>
    ProjectsInfo1Struct(
      id: id,
      registrationNumber: registrationNumber,
      name: name,
      projectCreationDate: projectCreationDate,
      originRegistration: originRegistration,
      art: art,
      rrt: rrt,
      cib: cib,
      realStateRegistration: realStateRegistration,
      startDate: startDate,
      permitNumber: permitNumber,
      cnae: cnae,
      situationDate: situationDate,
      responsible: responsible,
      cep: cep,
      city: city,
      number: number,
      state: state,
      country: country,
      street: street,
      neighborhood: neighborhood,
      complement: complement,
      projectsStatusesId: projectsStatusesId,
      cnpj: cnpj,
      completionPercentage: completionPercentage,
      createdAt: createdAt,
      updatedAt: updatedAt,
      projectsWorksSituationsId: projectsWorksSituationsId,
      category: category,
      destination: destination,
      projectWorkType: projectWorkType,
      resultingWorkArea: resultingWorkArea,
      lastTeamCreated: lastTeamCreated ?? LastTeamCreatedStruct(),
      url: url,
      fileName: fileName,
    );
