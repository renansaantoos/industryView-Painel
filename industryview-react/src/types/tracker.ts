/** Tracker info (from TrackersStruct) */
export interface Tracker {
  id: number;
  name?: string;
  manufacturerName?: string;
  trackerTypeName?: string;
  stakesCount?: number;
  maxModules?: number;
  manufacturersId?: number;
  trackerTypesId?: number;
  trackersTypesId?: number;
  qtdModules?: number;
  qtdStakes?: number;
  projectsId?: number;
}

/** Tracker type (from TrackerTypesStruct) */
export interface TrackerType {
  id: number;
  name: string;
}

/** Add/edit tracker data (from VarAddTracker1Struct) */
export interface TrackerFormData {
  id?: number;
  typePage: string;
  qtdModules: number;
  qtdStakes: number;
  manufacturersTxt: string;
  typeTrackerTxt: string;
  manufacturesId: number;
  typeTrackerId: number;
}

/** Tracker stakes info (from ListTrackersStakesStruct / StakesStruct) */
export interface TrackerStake {
  id: number;
  name: string;
  order: number;
  status?: number;
  trackersId: number;
}

/** Stakes statuses (from StakesStatusesStruct) */
export interface StakeStatus {
  id: number;
  name: string;
  color?: string;
}

/** Stakes types (from StakesTypesStruct) */
export interface StakeType {
  id: number;
  name: string;
}

/** Map trackers row (from MapTrackersStruct) */
export interface MapTrackersRow {
  id: number;
  name: string;
  order: number;
  trackers: TrackerMapItem[];
}

/** Tracker map item within a row */
export interface TrackerMapItem {
  id: number;
  name: string;
  stakes: TrackerStake[];
  modules: ModuleItem[];
}

/** Module item (from Modules1Struct / Modules2Struct) */
export interface ModuleItem {
  id: number;
  manufacturer: string;
  model: string;
  voltage?: number;
  current?: number;
  shortCircuitCurrent?: number;
  power?: number;
  vco?: number;
  im?: number;
  vm?: number;
}

/** Module types (from ListModulesTypesStruct) */
export interface ModuleType {
  id: number;
  name: string;
  manufacturer: string;
}

/** Infos trackers type (from InfosTrackersTypeStruct) */
export interface InfosTrackerType {
  id: number;
  name: string;
  manufacturerName: string;
  trackerTypeName: string;
}

/** List rows trackers (from ListRowsTrackersStruct) */
export interface ListRowsTrackers {
  id: number;
  name: string;
  order: number;
}

/** List modules trackers (from ListModulesTrackersStruct) */
export interface ListModulesTrackers {
  id: number;
  modulesId: number;
  trackersId: number;
}

/** Add tracker form data (from VarAddTracker3Struct) */
export interface VarAddTracker3 {
  id: number;
  name: string;
  qty: number;
}
