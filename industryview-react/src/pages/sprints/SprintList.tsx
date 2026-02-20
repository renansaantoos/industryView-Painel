import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { sprintsApi } from '../../services';
import type { Sprint, SprintListResponse, SprintPaginatedCategory, SprintStatus } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchableSelect from '../../components/common/SearchableSelect';
import ProjectSelector from '../../components/common/ProjectSelector';
import { Plus, Search, ArrowLeft, Eye, Trash2, Calendar, Kanban } from 'lucide-react';
import { formatTimestamp } from '../../utils/dateUtils';
import { formatPercentage } from '../../utils/formatters';

type CategoryKey = 'sprints_ativa' | 'sprints_futura' | 'sprints_concluida';

const CATEGORY_CONFIG: { key: CategoryKey; color: string; bgColor: string }[] = [
  { key: 'sprints_ativa', color: 'var(--color-success)', bgColor: 'var(--color-status-04)' },
  { key: 'sprints_futura', color: 'var(--color-warning)', bgColor: 'var(--color-status-02)' },
  { key: 'sprints_concluida', color: 'var(--color-primary)', bgColor: 'var(--color-status-03)' },
];

export default function SprintList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectsInfo } = useAppState();

  const [sprintData, setSprintData] = useState<SprintListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Sprint statuses
  const [sprintStatuses, setSprintStatuses] = useState<SprintStatus[]>([]);

  // Create Sprint modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintStart, setNewSprintStart] = useState('');
  const [newSprintEnd, setNewSprintEnd] = useState('');
  const [newSprintStatusId, setNewSprintStatusId] = useState<number | undefined>(undefined);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const loadSprints = useCallback(async () => {
    if (!projectsInfo) return;
    setLoading(true);
    try {
      const data = await sprintsApi.queryAllSprints({
        projects_id: projectsInfo.id,
      });
      setSprintData(data);
    } catch (err) {
      console.error('Failed to load sprints:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsInfo]);

  useEffect(() => {
    loadSprints();
  }, [loadSprints]);

  useEffect(() => {
    sprintsApi.queryAllSprintStatuses().then((data) => {
      setSprintStatuses(Array.isArray(data) ? data : (data as any).items ?? []);
    }).catch(console.error);
  }, []);

  const handleCreateSprint = async () => {
    if (!projectsInfo || !newSprintName.trim()) return;
    setModalLoading(true);
    try {
      await sprintsApi.addSprint({
        title: newSprintName.trim(),
        projects_id: projectsInfo.id,
        start_date: newSprintStart || new Date().toISOString().split('T')[0],
        end_date: newSprintEnd || new Date().toISOString().split('T')[0],
        sprints_statuses_id: newSprintStatusId,
      });
      setNewSprintName('');
      setNewSprintStart('');
      setNewSprintEnd('');
      setNewSprintStatusId(undefined);
      setShowCreateModal(false);
      loadSprints();
    } catch (err) {
      console.error('Failed to create sprint:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteSprint = async (id: number) => {
    try {
      await sprintsApi.deleteSprint(id);
      loadSprints();
    } catch (err) {
      console.error('Failed to delete sprint:', err);
    }
    setDeleteConfirm(null);
  };

  const handleViewSprint = (sprint: Sprint) => {
    navigate(`/sprint-atual?sprintId=${sprint.id}`);
  };

  const getCategoryLabel = (key: CategoryKey): string => {
    switch (key) {
      case 'sprints_ativa':
        return t('sprints.activeSprints');
      case 'sprints_futura':
        return t('sprints.futureSprints');
      case 'sprints_concluida':
        return t('sprints.completedSprints');
    }
  };

  const filterSprints = (items: Sprint[]): Sprint[] => {
    if (!search.trim()) return items;
    return items.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));
  };

  const totalSprints = sprintData
    ? (sprintData.sprints_ativa?.itemsTotal || 0) +
      (sprintData.sprints_futura?.itemsTotal || 0) +
      (sprintData.sprints_concluida?.itemsTotal || 0)
    : 0;

  if (!projectsInfo) return <ProjectSelector />;

  const renderSprintCard = (sprint: Sprint, categoryConfig: typeof CATEGORY_CONFIG[number]) => (
    <motion.div key={sprint.id} variants={fadeUpChild} className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Kanban size={18} color="var(--color-primary)" />
          <h4 style={{ fontSize: '14px', fontWeight: 600 }}>{sprint.title}</h4>
        </div>
        <span
          className="badge"
          style={{ backgroundColor: categoryConfig.bgColor, color: categoryConfig.color }}
        >
          {getCategoryLabel(categoryConfig.key)}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} />
          <span>
            {sprint.start_date ? formatTimestamp(sprint.start_date) : '-'} - {sprint.end_date ? formatTimestamp(sprint.end_date) : '-'}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
          <span style={{ color: 'var(--color-secondary-text)' }}>{t('sprints.progress')}</span>
          <span style={{ fontWeight: 500 }}>{formatPercentage(sprint.progress_percentage || 0)}</span>
        </div>
        <div style={{ height: '6px', backgroundColor: 'var(--color-alternate)', borderRadius: '3px' }}>
          <div
            style={{
              height: '100%',
              width: `${sprint.progress_percentage || 0}%`,
              backgroundColor: 'var(--color-primary)',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
        <button className="btn btn-icon" title={t('common.view')} onClick={() => handleViewSprint(sprint)}>
          <Eye size={16} color="var(--color-primary)" />
        </button>
        <button
          className="btn btn-icon"
          title={t('common.delete')}
          onClick={() => setDeleteConfirm(sprint.id)}
        >
          <Trash2 size={16} color="var(--color-error)" />
        </button>
      </div>
    </motion.div>
  );

  const renderCategory = (categoryConfig: typeof CATEGORY_CONFIG[number]) => {
    if (!sprintData) return null;
    const category: SprintPaginatedCategory = sprintData[categoryConfig.key];
    if (!category) return null;
    const filtered = filterSprints(category.items || []);
    if (filtered.length === 0) return null;

    return (
      <div key={categoryConfig.key} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '4px', height: '20px', backgroundColor: categoryConfig.color, borderRadius: '2px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
            {getCategoryLabel(categoryConfig.key)}
          </h3>
          <span
            className="badge"
            style={{
              backgroundColor: categoryConfig.bgColor,
              color: categoryConfig.color,
              fontSize: '12px',
            }}
          >
            {filtered.length}
          </span>
        </div>
        <motion.div
          variants={staggerParent}
          initial="initial"
          animate="animate"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {filtered.map((sprint) => renderSprintCard(sprint, categoryConfig))}
        </motion.div>
      </div>
    );
  };

  return (
    <div>
      <PageHeader
        title={t('sprints.title')}
        subtitle={t('sprints.subtitle')}
        breadcrumb={`${t('projects.title')} / ${projectsInfo.name} / ${t('sprints.title')}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/projeto-detalhes')}>
              <ArrowLeft size={18} /> {t('common.back')}
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> {t('sprints.createSprint')}
            </button>
          </div>
        }
      />

      {/* Search */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-secondary-text)',
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder={t('sprints.searchSprints')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Sprint Categories */}
      {loading ? (
        <LoadingSpinner />
      ) : totalSprints === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> {t('sprints.createSprint')}
            </button>
          }
        />
      ) : (
        <>
          {CATEGORY_CONFIG.map((config) => renderCategory(config))}
        </>
      )}

      {/* Create Sprint Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', minWidth: '400px' }}>
            <h3 style={{ marginBottom: '16px' }}>{t('sprints.createSprint')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>{t('sprints.sprintName')} *</label>
                <input
                  className="input-field"
                  value={newSprintName}
                  onChange={(e) => setNewSprintName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>{t('sprints.startDate')}</label>
                <input type="date" className="input-field" value={newSprintStart} onChange={(e) => setNewSprintStart(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t('sprints.endDate')}</label>
                <input type="date" className="input-field" value={newSprintEnd} onChange={(e) => setNewSprintEnd(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t('sprints.status')}</label>
                <SearchableSelect
                  options={sprintStatuses
                    .filter((s) => s.status === 'Futura' || s.status === 'Ativa')
                    .map((s) => ({ value: s.id, label: s.status }))}
                  value={newSprintStatusId}
                  onChange={(val) => setNewSprintStatusId(val !== undefined ? Number(val) : undefined)}
                  placeholder={t('sprints.selectStatus')}
                  allowClear
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                {t('common.cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleCreateSprint} disabled={modalLoading}>
                {modalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('sprints.confirmDelete')}
          onConfirm={() => handleDeleteSprint(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
