import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../contexts/AppStateContext';
import { projectsApi, clientsApi } from '../../services';
import type { Client } from '../../services/api/clients';
import type { ProjectInfo } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import SortableHeader from '../../components/common/SortableHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SearchableSelect from '../../components/common/SearchableSelect';
import { Plus, Search, Eye, Edit, Trash2, CheckCircle2, Clock, ListTodo, XCircle, PauseCircle, PlayCircle, Zap, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';

/* =========================================
   Status helpers
   ========================================= */

const STATUS_CONFIG: Record<string, { bg: string; color: string; icon: typeof Zap }> = {
  ativo:          { bg: 'rgba(59,130,246,0.1)',   color: '#3b82f6',  icon: Zap },
  'em andamento': { bg: 'rgba(245,158,11,0.1)',   color: '#f59e0b',  icon: PlayCircle },
  inativo:        { bg: 'rgba(148,163,184,0.12)',  color: '#64748b',  icon: PauseCircle },
  cancelado:      { bg: 'rgba(239,68,68,0.1)',     color: '#ef4444',  icon: XCircle },
  concluido:      { bg: 'rgba(34,197,94,0.1)',     color: '#22c55e',  icon: CheckCircle2 },
};

function getStatusConfig(statusName: string) {
  const key = statusName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return STATUS_CONFIG[key] || STATUS_CONFIG[statusName.toLowerCase()] || { bg: 'rgba(148,163,184,0.1)', color: '#64748b', icon: PauseCircle };
}

function normalizeStatus(statusName: string): string {
  return statusName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const FILTER_OPTIONS = [
  { key: 'todos',          label: 'Todos' },
  { key: 'ativo',          label: 'Ativos',         color: '#3b82f6', icon: Zap },
  { key: 'em andamento',   label: 'Em andamento',   color: '#f59e0b', icon: PlayCircle },
  { key: 'inativo',        label: 'Inativos',       color: '#64748b', icon: PauseCircle },
  { key: 'concluido',      label: 'Concluídos',     color: '#22c55e', icon: CheckCircle2 },
];

/* =========================================
   Component
   ========================================= */

export default function ProjectList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { setProjectsInfo, setNavBarSelection } = useAppState();

  const [allProjects, setAllProjects] = useState<ProjectInfo[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ativo');
  const [clientFilter, setClientFilter] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Sort state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') { setSortField(null); setSortDirection(null); }
      else setSortDirection('asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    setNavBarSelection(2);
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const [projectsResult, clientsResult] = await Promise.allSettled([
        projectsApi.queryAllProjects({ per_page: 200 }),
        clientsApi.listClients({ per_page: 50 }),
      ]);
      if (projectsResult.status === 'fulfilled') {
        setAllProjects(projectsResult.value.items || []);
      } else {
        console.error('Failed to load projects:', projectsResult.reason);
      }
      if (clientsResult.status === 'fulfilled') {
        setClients(clientsResult.value.items || []);
      } else {
        console.error('Failed to load clients:', clientsResult.reason);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Status counts for cards
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ativo: 0, 'em andamento': 0, inativo: 0, cancelado: 0, concluido: 0 };
    allProjects.forEach((p) => {
      const key = normalizeStatus(p.status_name || '');
      if (key in counts) counts[key]++;
    });
    return counts;
  }, [allProjects]);

  // Client-side filter + search + sort + pagination
  const filtered = useMemo(() => {
    let result = allProjects;

    // Status filter
    if (statusFilter !== 'todos') {
      result = result.filter((p) => normalizeStatus(p.status_name || '') === statusFilter);
    }

    // Client filter
    if (clientFilter !== undefined) {
      result = result.filter((p) => p.client_id === clientFilter);
    }

    // Text search
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((p) =>
        (p.name || '').toLowerCase().includes(term) ||
        (p.responsible || '').toLowerCase().includes(term) ||
        (p.status_name || '').toLowerCase().includes(term) ||
        (p.client_name || '').toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortField && sortDirection) {
      result = [...result].sort((a, b) => {
        let aVal: string | number = '';
        let bVal: string | number = '';
        if (sortField === 'name') { aVal = (a.name || '').toLowerCase(); bVal = (b.name || '').toLowerCase(); }
        else if (sortField === 'responsible') { aVal = (a.responsible || '').toLowerCase(); bVal = (b.responsible || '').toLowerCase(); }
        else if (sortField === 'status_name') { aVal = (a.status_name || '').toLowerCase(); bVal = (b.status_name || '').toLowerCase(); }
        else if (sortField === 'completionPercentage') { aVal = a.schedule_actual_progress ?? 0; bVal = b.schedule_actual_progress ?? 0; }
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [allProjects, statusFilter, clientFilter, search, sortField, sortDirection]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(page, totalPages);
  const displayedProjects = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, clientFilter, perPage]);

  // Options for client SearchableSelect
  const clientOptions = useMemo(() =>
    clients.map((c) => ({
      value: c.id,
      label: c.trade_name || c.legal_name || String(c.id),
    })),
    [clients]
  );

  const handleViewProject = (project: ProjectInfo) => {
    setProjectsInfo(project);
    navigate('/projeto-detalhes');
  };

  const handleEditProject = (project: ProjectInfo) => {
    setProjectsInfo(project);
    navigate('/editar-projeto');
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este projeto?')) return;
    try {
      await projectsApi.deleteProject(projectId);
      loadProjects();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('projects.title')}
        subtitle={t('projects.subtitle')}
        actions={
          <Link to="/criar-projeto" className="btn btn-primary">
            <Plus size={18} />
            {t('projects.createProject')}
          </Link>
        }
      />

      {/* Status filter cards */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          {/* Card "Todos" */}
          {(() => {
            const totalCount = allProjects.length;
            const isActive = statusFilter === 'todos';
            const cardColor = '#8b5cf6';
            return (
              <div
                onClick={() => setStatusFilter('todos')}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: `1.5px solid ${isActive ? cardColor : 'var(--color-alternate)'}`,
                  background: isActive ? `${cardColor}08` : 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isActive ? `0 4px 16px ${cardColor}18` : 'none',
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    background: cardColor, borderRadius: '14px 14px 0 0',
                  }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{
                      fontSize: '26px', fontWeight: 800, lineHeight: 1,
                      color: isActive ? cardColor : 'var(--color-primary-text)',
                      transition: 'color 0.2s ease',
                    }}>
                      {totalCount}
                    </div>
                    <div style={{
                      fontSize: '12px', fontWeight: 600, marginTop: '6px',
                      color: isActive ? cardColor : 'var(--color-secondary-text)',
                      letterSpacing: '0.02em',
                      transition: 'color 0.2s ease',
                    }}>
                      Todos
                    </div>
                  </div>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: `${cardColor}${isActive ? '18' : '0a'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s ease',
                  }}>
                    <LayoutGrid size={20} color={cardColor} style={{ opacity: isActive ? 1 : 0.6 }} />
                  </div>
                </div>
              </div>
            );
          })()}
          {FILTER_OPTIONS.filter((o) => o.key !== 'todos').map((opt) => {
            const count = statusCounts[opt.key] || 0;
            const isActive = statusFilter === opt.key;
            const IconComp = opt.icon!;
            return (
              <div
                key={opt.key}
                onClick={() => setStatusFilter(isActive ? 'todos' : opt.key)}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: `1.5px solid ${isActive ? opt.color! : 'var(--color-alternate)'}`,
                  background: isActive ? `${opt.color!}08` : 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isActive ? `0 4px 16px ${opt.color!}18` : 'none',
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    background: opt.color!, borderRadius: '14px 14px 0 0',
                  }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{
                      fontSize: '26px', fontWeight: 800, lineHeight: 1,
                      color: isActive ? opt.color! : 'var(--color-primary-text)',
                      transition: 'color 0.2s ease',
                    }}>
                      {count}
                    </div>
                    <div style={{
                      fontSize: '12px', fontWeight: 600, marginTop: '6px',
                      color: isActive ? opt.color! : 'var(--color-secondary-text)',
                      letterSpacing: '0.02em',
                      transition: 'color 0.2s ease',
                    }}>
                      {opt.label}
                    </div>
                  </div>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px',
                    background: `${opt.color!}${isActive ? '18' : '0a'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s ease',
                  }}>
                    <IconComp size={20} color={opt.color!} style={{ opacity: isActive ? 1 : 0.6 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search bar + Client filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ maxWidth: '400px', flex: '1 1 280px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-text)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="input-field"
            placeholder={t('projects.searchProjects')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', height: '40px', borderRadius: '10px' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-secondary-text)', fontSize: '16px', lineHeight: 1, padding: '2px',
              }}
            >
              &times;
            </button>
          )}
        </div>
        <div style={{ minWidth: '220px' }}>
          <SearchableSelect
            options={clientOptions}
            value={clientFilter}
            onChange={(v) => setClientFilter(v !== undefined ? Number(v) : undefined)}
            placeholder="Todos os clientes"
            searchPlaceholder="Buscar cliente..."
            allowClear
          />
        </div>
      </div>

      {/* Active client filter chip */}
      {clientFilter !== undefined && (() => {
        const activeClient = clients.find((c) => c.id === clientFilter);
        if (!activeClient) return null;
        return (
          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>Filtrando por cliente:</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 600, padding: '4px 12px',
              borderRadius: '20px', background: 'rgba(59,130,246,0.1)',
              color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)',
            }}>
              {activeClient.trade_name || activeClient.legal_name}
              <button
                onClick={() => setClientFilter(undefined)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#3b82f6', fontSize: '15px', lineHeight: 1, padding: 0,
                  display: 'flex', alignItems: 'center',
                }}
              >
                &times;
              </button>
            </span>
          </div>
        );
      })()}

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : displayedProjects.length === 0 ? (
        <EmptyState
          message={search ? `Nenhum projeto encontrado para "${search}"` : statusFilter !== 'todos' ? `Nenhum projeto com status "${FILTER_OPTIONS.find(o => o.key === statusFilter)?.label}"` : t('common.noData')}
          action={
            statusFilter !== 'todos' ? (
              <button className="btn btn-secondary" onClick={() => setStatusFilter('todos')}>
                Mostrar todos
              </button>
            ) : (
              <Link to="/criar-projeto" className="btn btn-primary">
                <Plus size={18} /> {t('projects.createProject')}
              </Link>
            )
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <SortableHeader label={t('projects.projectName')} field="name" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <th>Cliente</th>
                <SortableHeader label={t('projects.responsible')} field="responsible" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('projects.status')} field="status_name" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <th>Tarefas</th>
                <SortableHeader label="Progresso" field="completionPercentage" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody key={displayedProjects.map(p => p.id).join()} variants={staggerParent} initial="initial" animate="animate">
              {displayedProjects.map(project => {
                const totalTasks = project.schedule_total_tasks ?? 0;
                const completedTasks = project.schedule_completed_tasks ?? 0;
                const inProgressTasks = project.schedule_in_progress_tasks ?? 0;
                const actualProgress = project.schedule_actual_progress ?? 0;
                const progressColor = actualProgress >= 100 ? '#22c55e' : actualProgress > 0 ? '#3b82f6' : 'var(--color-secondary-text)';
                const statusName = project.status_name || 'Pendente';
                const sc = getStatusConfig(statusName);

                return (
                  <motion.tr key={project.id} variants={tableRowVariants}>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)' }}>
                        #{project.id}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{project.name}</div>
                        {project.registrationNumber && (
                          <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '2px' }}>
                            {project.registrationNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px' }}>
                        {project.client_name || '-'}
                      </span>
                    </td>
                    <td>{project.responsible || '-'}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          background: sc.bg,
                          color: sc.color,
                          border: `1px solid ${sc.color}33`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {statusName}
                      </span>
                    </td>
                    <td>
                      {totalTasks > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ListTodo size={13} color="var(--color-secondary-text)" />
                            <span style={{ fontWeight: 600 }}>{totalTasks}</span>
                            <span style={{ color: 'var(--color-secondary-text)' }}>total</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', color: 'var(--color-secondary-text)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle2 size={11} color="#22c55e" />
                              {completedTasks}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Clock size={11} color="#3b82f6" />
                              {inProgressTasks}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-secondary-text)', fontSize: '12px' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-alternate)', borderRadius: '3px', maxWidth: '100px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${Math.min(actualProgress, 100)}%`,
                            backgroundColor: progressColor,
                            borderRadius: '3px',
                            transition: 'width 0.3s ease',
                          }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: progressColor, minWidth: '36px' }}>
                          {actualProgress.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn btn-icon" title="Ver" onClick={() => handleViewProject(project)}>
                          <Eye size={16} color="var(--color-primary)" />
                        </button>
                        <button className="btn btn-icon" title="Editar" onClick={() => handleEditProject(project)}>
                          <Edit size={16} color="var(--color-secondary-text)" />
                        </button>
                        <button className="btn btn-icon" title="Excluir" onClick={() => handleDeleteProject(project.id)}>
                          <Trash2 size={16} color="var(--color-error)" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            perPage={perPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }}
          />
        </div>
      )}
    </div>
  );
}
