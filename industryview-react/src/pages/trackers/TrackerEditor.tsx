import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { trackersApi, manufacturersApi } from '../../services';
import type { Tracker, Manufacturer, TrackerType } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Plus,
  Search,
  ArrowLeft,
  Edit,
  Trash2,
  SunMedium,
  Eye,
} from 'lucide-react';
import SearchableSelect from '../../components/common/SearchableSelect';

export default function TrackerEditor() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectsInfo } = useAppState();

  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingTracker, setEditingTracker] = useState<Tracker | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Form fields
  const [trackerName, setTrackerName] = useState('');
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [trackerTypes, setTrackerTypes] = useState<TrackerType[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<number | ''>('');
  const [selectedType, setSelectedType] = useState<number | ''>('');
  const [qtdModules, setQtdModules] = useState('');
  const [qtdStakes, setQtdStakes] = useState('');

  useEffect(() => {
    if (!projectsInfo) {
      navigate('/projetos');
      return;
    }
    loadInitialData();
  }, [projectsInfo, navigate]);

  const loadInitialData = async () => {
    try {
      const [mfrs, types] = await Promise.all([
        manufacturersApi.queryAllManufacturers().catch(() => ({ items: [] as Manufacturer[] })),
        trackersApi.queryAllTrackerTypes().catch(() => []),
      ]);
      const mfrItems = 'items' in mfrs ? mfrs.items : (Array.isArray(mfrs) ? mfrs : []);
      setManufacturers(mfrItems);
      setTrackerTypes(Array.isArray(types) ? types : []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const loadTrackers = useCallback(async () => {
    if (!projectsInfo) return;
    setLoading(true);
    try {
      const data = await trackersApi.queryAllTrackers({
        projects_id: projectsInfo.id,
        page,
        per_page: perPage,
        search: search || undefined,
      });
      setTrackers(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load trackers:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, perPage, search]);

  useEffect(() => {
    loadTrackers();
  }, [loadTrackers]);

  const handleOpenCreateModal = () => {
    setEditingTracker(null);
    setTrackerName('');
    setSelectedManufacturer('');
    setSelectedType('');
    setQtdModules('');
    setQtdStakes('');
    setShowModal(true);
  };

  const handleOpenEditModal = (tracker: Tracker) => {
    setEditingTracker(tracker);
    setTrackerName(tracker.name || '');
    setSelectedManufacturer(tracker.manufacturersId || tracker.trackersTypesId || '');
    setSelectedType(tracker.trackerTypesId || tracker.trackersTypesId || '');
    setQtdModules(String(tracker.qtdModules || ''));
    setQtdStakes(String(tracker.qtdStakes || ''));
    setShowModal(true);
  };

  const handleSaveTracker = async () => {
    if (!projectsInfo) return;
    setModalLoading(true);
    try {
      const payload: Record<string, unknown> = {
        projects_id: projectsInfo.id,
        name: trackerName.trim() || undefined,
        manufacturers_id: selectedManufacturer || undefined,
        trackers_types_id: selectedType || undefined,
        qtd_modules: qtdModules ? parseInt(qtdModules, 10) : undefined,
        qtd_stakes: qtdStakes ? parseInt(qtdStakes, 10) : undefined,
      };
      if (editingTracker) {
        await trackersApi.editTracker(editingTracker.id, payload);
      } else {
        await trackersApi.addTracker(payload);
      }
      setShowModal(false);
      loadTrackers();
    } catch (err) {
      console.error('Failed to save tracker:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteTracker = async (id: number) => {
    try {
      await trackersApi.deleteTracker(id);
      loadTrackers();
    } catch (err) {
      console.error('Failed to delete tracker:', err);
    }
    setDeleteConfirm(null);
  };

  const handleViewStakes = (tracker: Tracker) => {
    navigate(`/modulos-trackers-map?trackerId=${tracker.id}`);
  };

  if (!projectsInfo) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title={t('trackers.title')}
        subtitle={t('trackers.subtitle')}
        breadcrumb={`${t('projects.title')} / ${projectsInfo.name} / ${t('trackers.title')}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/projeto-detalhes')}>
              <ArrowLeft size={18} /> {t('common.back')}
            </button>
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={18} /> {t('trackers.createTracker')}
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
            placeholder={t('trackers.searchTrackers')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Trackers Table */}
      {loading ? (
        <LoadingSpinner />
      ) : trackers.length === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={18} /> {t('trackers.createTracker')}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('trackers.trackerName')}</th>
                <th>{t('trackers.manufacturer')}</th>
                <th>{t('trackers.type')}</th>
                <th>{t('trackers.modules')}</th>
                <th>{t('trackers.stakes')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {trackers.map((tracker) => (
                <motion.tr key={tracker.id} variants={tableRowVariants}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <SunMedium size={16} color="var(--color-primary)" />
                      <span style={{ fontWeight: 500 }}>{tracker.name || `Tracker #${tracker.id}`}</span>
                    </div>
                  </td>
                  <td>{tracker.manufacturerName || '-'}</td>
                  <td>{tracker.trackerTypeName || '-'}</td>
                  <td>{tracker.qtdModules ?? '-'}</td>
                  <td>{tracker.qtdStakes ?? '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-icon" title={t('trackers.viewStakes')} onClick={() => handleViewStakes(tracker)}>
                        <Eye size={16} color="var(--color-primary)" />
                      </button>
                      <button className="btn btn-icon" title={t('common.edit')} onClick={() => handleOpenEditModal(tracker)}>
                        <Edit size={16} color="var(--color-secondary-text)" />
                      </button>
                      <button className="btn btn-icon" title={t('common.delete')} onClick={() => setDeleteConfirm(tracker.id)}>
                        <Trash2 size={16} color="var(--color-error)" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            perPage={perPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onPerPageChange={(pp) => {
              setPerPage(pp);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Create/Edit Tracker Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '16px' }}>
              {editingTracker ? t('trackers.editTracker') : t('trackers.createTracker')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>{t('trackers.trackerName')}</label>
                <input className="input-field" value={trackerName} onChange={(e) => setTrackerName(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t('trackers.manufacturer')}</label>
                <SearchableSelect
                  options={manufacturers.map((m) => ({ value: m.id, label: m.name }))}
                  value={selectedManufacturer || undefined}
                  onChange={(value) => setSelectedManufacturer(value ? Number(value) : '')}
                  placeholder={t('common.select')}
                  searchPlaceholder={t('common.search')}
                />
              </div>
              <div className="input-group">
                <label>{t('trackers.type')}</label>
                <SearchableSelect
                  options={trackerTypes.map((tt) => ({ value: tt.id, label: tt.name }))}
                  value={selectedType || undefined}
                  onChange={(value) => setSelectedType(value ? Number(value) : '')}
                  placeholder={t('common.select')}
                  searchPlaceholder={t('common.search')}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>{t('trackers.modules')}</label>
                  <input
                    type="number"
                    className="input-field"
                    value={qtdModules}
                    onChange={(e) => setQtdModules(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>{t('trackers.stakes')}</label>
                  <input
                    type="number"
                    className="input-field"
                    value={qtdStakes}
                    onChange={(e) => setQtdStakes(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                {t('common.cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleSaveTracker} disabled={modalLoading}>
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
          message={t('trackers.confirmDelete')}
          onConfirm={() => handleDeleteTracker(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
