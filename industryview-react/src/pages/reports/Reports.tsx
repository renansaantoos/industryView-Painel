import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { reportsApi, sprintsApi } from '../../services';
import type { DailyReport, Sprint } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Plus, Search, ArrowLeft, Eye, Trash2, Calendar, Download } from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { generateSimplePdf } from '../../utils/pdfUtils';
import SearchableSelect from '../../components/common/SearchableSelect';
import SortableHeader, { useBackendSort } from '../../components/common/SortableHeader';
import ProjectSelector from '../../components/common/ProjectSelector';

export default function Reports() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projectsInfo } = useAppState();

  const projectsId = parseInt(searchParams.get('projectsId') || String(projectsInfo?.id || 0), 10);
  const sprintIdParam = parseInt(searchParams.get('sprintId') || '0', 10);

  const [reports, setReports] = useState<DailyReport[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedSprintId, setSelectedSprintId] = useState(sprintIdParam);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Create report modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reportDate, setReportDate] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportWeather, setReportWeather] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const { sortField, sortDirection, handleSort } = useBackendSort();

  useEffect(() => {
    if (!projectsInfo) return;
    loadSprints();
  }, [projectsInfo]);

  const loadSprints = async () => {
    if (!projectsInfo) return;
    try {
      const data = await sprintsApi.queryAllSprints({
        projects_id: projectsInfo.id,
        per_page: 50,
      });
      setSprints(data.items || []);
    } catch (err) {
      console.error('Failed to load sprints:', err);
    }
  };

  const loadReports = useCallback(async () => {
    if (!projectsId) return;
    setLoading(true);
    try {
      const data = await reportsApi.queryAllDailyReports({
        projects_id: projectsId,
        page,
        per_page: perPage,
        sort_field: sortField || undefined,
        sort_direction: sortDirection || undefined,
      });
      setReports(data.result1?.items || []);
      setTotalPages(data.result1?.pageTotal || 1);
      setTotalItems(data.result1?.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsId, selectedSprintId, page, perPage, search, sortField, sortDirection]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleCreateReport = async () => {
    if (!projectsId) return;
    setModalLoading(true);
    try {
      await reportsApi.addDailyReport({
        projects_id: projectsId,
        date: reportDate || new Date().toISOString().split('T')[0],
        schedule_id: [],
      });
      setReportDate('');
      setReportDescription('');
      setReportWeather('');
      setShowCreateModal(false);
      loadReports();
    } catch (err) {
      console.error('Failed to create report:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteReport = async (id: number) => {
    try {
      await reportsApi.deleteDailyReport(id);
      loadReports();
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
    setDeleteConfirm(null);
  };

  const handleViewReport = (reportId: number) => {
    navigate(`/relatorio-r-d-o?reportId=${reportId}`);
  };

  const handleExportPdf = () => {
    if (reports.length === 0) return;
    const lines = reports.map((r) => `${formatDate(r.date || '')} - ${r.description || 'Sem descricao'}`);
    generateSimplePdf(
      `Relatorios - ${projectsInfo?.name || ''}`,
      lines.join('\n')
    );
  };

  if (!projectsInfo) return <ProjectSelector />;

  return (
    <div>
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        breadcrumb={`${t('projects.title')} / ${projectsInfo.name} / ${t('reports.title')}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/projeto-detalhes')}>
              <ArrowLeft size={18} /> {t('common.back')}
            </button>
            <button className="btn btn-secondary" onClick={handleExportPdf}>
              <Download size={18} /> PDF
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> {t('reports.createReport')}
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
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
            placeholder={t('reports.searchReports')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <SearchableSelect
          options={sprints.map((s) => ({ value: s.id, label: s.name }))}
          value={selectedSprintId || undefined}
          onChange={(value) => {
            setSelectedSprintId(value ? Number(value) : 0);
            setPage(1);
          }}
          placeholder={t('reports.allSprints')}
          searchPlaceholder={t('common.search')}
          style={{ maxWidth: '200px' }}
        />
      </div>

      {/* Reports Table */}
      {loading ? (
        <LoadingSpinner />
      ) : reports.length === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> {t('reports.createReport')}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <SortableHeader label={t('reports.date')} field="date" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('reports.description')} field="description" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('reports.weather')} field="weather" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('reports.createdAt')} field="createdAt" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {reports.map((report) => (
                <motion.tr key={report.id} variants={tableRowVariants}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} color="var(--color-primary)" />
                      <span style={{ fontWeight: 500 }}>{report.date ? formatDate(report.date) : '-'}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {report.description || '-'}
                  </td>
                  <td>{report.weather || '-'}</td>
                  <td>{report.createdAt ? formatDateTime(report.createdAt) : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-icon" title={t('common.view')} onClick={() => handleViewReport(report.id)}>
                        <Eye size={16} color="var(--color-primary)" />
                      </button>
                      <button className="btn btn-icon" title={t('common.delete')} onClick={() => setDeleteConfirm(report.id)}>
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

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>{t('reports.createReport')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>{t('reports.date')} *</label>
                <input type="date" className="input-field" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
              </div>
              <div className="input-group">
                <label>{t('reports.description')}</label>
                <textarea
                  className="input-field"
                  rows={4}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>{t('reports.weather')}</label>
                <input className="input-field" value={reportWeather} onChange={(e) => setReportWeather(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                {t('common.cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleCreateReport} disabled={modalLoading}>
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
          message={t('reports.confirmDelete')}
          onConfirm={() => handleDeleteReport(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
