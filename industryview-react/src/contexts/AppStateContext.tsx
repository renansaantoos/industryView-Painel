import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ProjectInfo, Manufacturer, ModuleType, InfosTrackerType, FilterState } from '../types';

interface AppStateContextValue {
  /** Current navbar selection index */
  navBarSelection: number;
  setNavBarSelection: (value: number) => void;

  /** Current project info */
  projectsInfo: ProjectInfo | null;
  setProjectsInfo: (info: ProjectInfo | null) => void;

  /** Current team ID */
  teamId: number;
  setTeamId: (id: number) => void;

  /** Pagination state */
  page: number;
  setPage: (p: number) => void;
  perPage: number;
  setPerPage: (pp: number) => void;
  itemsTotal: number;
  setItemsTotal: (total: number) => void;

  /** Loading state */
  loading: boolean;
  setLoading: (l: boolean) => void;

  /** Filter states */
  filterManufacturers: Manufacturer[];
  setFilterManufacturers: (list: Manufacturer[]) => void;
  listTypeManufacturers: Manufacturer[];
  setListTypeManufacturers: (list: Manufacturer[]) => void;
  listTypeModules: ModuleType[];
  setListTypeModules: (list: ModuleType[]) => void;
  filterTypeModules: ModuleType[];
  setFilterTypeModules: (list: ModuleType[]) => void;
  infosTrackersType: InfosTrackerType[];
  setInfosTrackersType: (list: InfosTrackerType[]) => void;
  filterTrackers: InfosTrackerType[];
  setFilterTrackers: (list: InfosTrackerType[]) => void;

  /** Generic filter structs */
  filterManufactures: FilterState;
  setFilterManufactures: (f: FilterState) => void;
  filterTracker: FilterState;
  setFilterTracker: (f: FilterState) => void;
  filterModules: FilterState;
  setFilterModules: (f: FilterState) => void;

  /** Filter IDs */
  filtroIdsStatusStakes: number[];
  setFiltroIdsStatusStakes: (ids: number[]) => void;
  filtroIdsStatusTracker: number[];
  setFiltroIdsStatusTracker: (ids: number[]) => void;
  filtroIdsTypeTracker: number[];
  setFiltroIdsTypeTracker: (ids: number[]) => void;
  filtroIdsCargo: number[];
  setFiltroIdsCargo: (ids: number[]) => void;
  filtroTeams: number[];
  setFiltroTeams: (ids: number[]) => void;

  /** Projects page visibility */
  projects: boolean;
  setProjects: (v: boolean) => void;

  /** Map view toggle */
  isMap: boolean;
  setIsMap: (v: boolean) => void;

  /** Backlog filter */
  filterBacklog: number;
  setFilterBacklog: (v: number) => void;

  /** Reset all filters */
  resetFilters: () => void;
}

const defaultFilterState: FilterState = { ids: [], names: [], active: false };

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  // Persisted state from localStorage
  const [navBarSelection, setNavBarSelectionRaw] = useState<number>(() => {
    const stored = localStorage.getItem('ff_navBarSelection');
    return stored ? parseInt(stored, 10) : 1;
  });

  const [projectsInfo, setProjectsInfoRaw] = useState<ProjectInfo | null>(() => {
    const stored = localStorage.getItem('ff_projectsInfo');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });

  const [teamId, setTeamIdRaw] = useState<number>(() => {
    const stored = localStorage.getItem('ff_teamId');
    return stored ? parseInt(stored, 10) : 0;
  });

  // Non-persisted state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [filterManufacturers, setFilterManufacturers] = useState<Manufacturer[]>([]);
  const [listTypeManufacturers, setListTypeManufacturers] = useState<Manufacturer[]>([]);
  const [listTypeModules, setListTypeModules] = useState<ModuleType[]>([]);
  const [filterTypeModules, setFilterTypeModules] = useState<ModuleType[]>([]);
  const [infosTrackersType, setInfosTrackersType] = useState<InfosTrackerType[]>([]);
  const [filterTrackers, setFilterTrackers] = useState<InfosTrackerType[]>([]);

  const [filterManufactures, setFilterManufactures] = useState<FilterState>(defaultFilterState);
  const [filterTracker, setFilterTracker] = useState<FilterState>(defaultFilterState);
  const [filterModules, setFilterModules] = useState<FilterState>(defaultFilterState);

  const [filtroIdsStatusStakes, setFiltroIdsStatusStakes] = useState<number[]>([]);
  const [filtroIdsStatusTracker, setFiltroIdsStatusTracker] = useState<number[]>([]);
  const [filtroIdsTypeTracker, setFiltroIdsTypeTracker] = useState<number[]>([]);
  const [filtroIdsCargo, setFiltroIdsCargo] = useState<number[]>([]);
  const [filtroTeams, setFiltroTeams] = useState<number[]>([]);

  const [projects, setProjects] = useState(false);
  const [isMap, setIsMap] = useState(false);
  const [filterBacklog, setFilterBacklog] = useState(1);

  // Persist wrappers
  const setNavBarSelection = useCallback((value: number) => {
    setNavBarSelectionRaw(value);
    localStorage.setItem('ff_navBarSelection', String(value));
  }, []);

  const setProjectsInfo = useCallback((info: ProjectInfo | null) => {
    setProjectsInfoRaw(info);
    if (info) {
      localStorage.setItem('ff_projectsInfo', JSON.stringify(info));
    } else {
      localStorage.removeItem('ff_projectsInfo');
    }
  }, []);

  const setTeamId = useCallback((id: number) => {
    setTeamIdRaw(id);
    localStorage.setItem('ff_teamId', String(id));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterManufacturers([]);
    setListTypeManufacturers([]);
    setListTypeModules([]);
    setFilterTypeModules([]);
    setFilterTrackers([]);
    setFilterManufactures(defaultFilterState);
    setFilterTracker(defaultFilterState);
    setFilterModules(defaultFilterState);
    setFiltroIdsStatusStakes([]);
    setFiltroIdsStatusTracker([]);
    setFiltroIdsTypeTracker([]);
    setFiltroIdsCargo([]);
    setFiltroTeams([]);
    setFilterBacklog(1);
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        navBarSelection, setNavBarSelection,
        projectsInfo, setProjectsInfo,
        teamId, setTeamId,
        page, setPage,
        perPage, setPerPage,
        itemsTotal, setItemsTotal,
        loading, setLoading,
        filterManufacturers, setFilterManufacturers,
        listTypeManufacturers, setListTypeManufacturers,
        listTypeModules, setListTypeModules,
        filterTypeModules, setFilterTypeModules,
        infosTrackersType, setInfosTrackersType,
        filterTrackers, setFilterTrackers,
        filterManufactures, setFilterManufactures,
        filterTracker, setFilterTracker,
        filterModules, setFilterModules,
        filtroIdsStatusStakes, setFiltroIdsStatusStakes,
        filtroIdsStatusTracker, setFiltroIdsStatusTracker,
        filtroIdsTypeTracker, setFiltroIdsTypeTracker,
        filtroIdsCargo, setFiltroIdsCargo,
        filtroTeams, setFiltroTeams,
        projects, setProjects,
        isMap, setIsMap,
        filterBacklog, setFilterBacklog,
        resetFilters,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

export default AppStateContext;
