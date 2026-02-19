import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../contexts/AppStateContext';
import { projectsApi } from '../../services';
import type { ProjectInfo } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import SortableHeader, { useBackendSort } from '../../components/common/SortableHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Plus, Search, Eye, Edit, Trash2, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';


export default function ProjectList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { setProjectsInfo, setNavBarSelection } = useAppState();

  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const { sortField, sortDirection, handleSort } = useBackendSort();

  useEffect(() => {
    setNavBarSelection(2);
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectsApi.queryAllProjects({ page, per_page: perPage, search, sort_field: sortField || undefined, sort_direction: sortDirection || undefined });
      setProjects(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, token, sortField, sortDirection]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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
          <button className="btn btn-primary" onClick={() => navigate('/criar-projeto')}>
            <Plus size={18} />
            {t('projects.createProject')}
          </button>
        }
      />

      {/* Search bar */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-text)' }} />
          <input
            type="text"
            className="input-field"
            placeholder={t('projects.searchProjects')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : projects.length === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <button className="btn btn-primary" onClick={() => navigate('/criar-projeto')}>
              <Plus size={18} /> {t('projects.createProject')}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <SortableHeader label={t('projects.projectName')} field="name" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('projects.responsible')} field="responsible" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('projects.status')} field="status_name" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <th>Tarefas</th>
                <SortableHeader label="Progresso" field="completionPercentage" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {projects.map(project => {
                const totalTasks = project.schedule_total_tasks ?? 0;
                const completedTasks = project.schedule_completed_tasks ?? 0;
                const inProgressTasks = project.schedule_in_progress_tasks ?? 0;
                const actualProgress = project.schedule_actual_progress ?? 0;
                const progressColor = actualProgress >= 100 ? '#22c55e' : actualProgress > 0 ? '#3b82f6' : 'var(--color-secondary-text)';
                const statusName = project.status_name || 'Pendente';
                const statusColor = (() => {
                  const s = statusName.toLowerCase();
                  if (s === 'ativo' || s === 'em andamento') return { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' };
                  if (s === 'concluido' || s === 'concluído') return { bg: 'rgba(34,197,94,0.1)', color: '#22c55e' };
                  if (s === 'cancelado') return { bg: 'rgba(239,68,68,0.1)', color: '#ef4444' };
                  return { bg: 'rgba(148,163,184,0.1)', color: 'var(--color-secondary-text)' };
                })();

                return (
                  <motion.tr key={project.id} variants={tableRowVariants}>
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
                    <td>{project.responsible || '-'}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          background: statusColor.bg,
                          color: statusColor.color,
                          border: `1px solid ${statusColor.color}33`,
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
            currentPage={page}
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
