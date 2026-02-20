import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { workforceApi, usersApi } from '../../services';
import type { WorkforceDailyLog, WorkforceHistogram } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusBadge from '../../components/common/StatusBadge';
import SearchableSelect from '../../components/common/SearchableSelect';
import { Plus, Edit, Trash2, X, LogIn, LogOut, BarChart2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLOR_MAP: Record<string, { bg: string; color: string; label: string }> = {
  presente:    { bg: '#dcfce7', color: '#15803d', label: 'Presente' },
  ausente:     { bg: '#fee2e2', color: '#b91c1c', label: 'Ausente' },
  meio_periodo: { bg: '#fef9c3', color: '#a16207', label: 'Meio período' },
};

// ---------------------------------------------------------------------------
// Sub-types for forms
// ---------------------------------------------------------------------------

interface CreateLogForm {
  users_id: number | '';
  log_date: string;
  check_in: string;
  team: string;
  observation: string;
}

interface CheckOutForm {
  check_out: string;
}

interface UserOption {
  id: number;
  name: string;
}

const EMPTY_CREATE_FORM: CreateLogForm = {
  users_id: '',
  log_date: new Date().toISOString().split('T')[0],
  check_in: '',
  team: '',
  observation: '',
};

const EMPTY_CHECKOUT_FORM: CheckOutForm = {
  check_out: '',
};

// ---------------------------------------------------------------------------
// Histogram bar component
// ---------------------------------------------------------------------------

function HistogramBar({ label, planned, present, absent }: {
  label: string;
  planned: number;
  present: number;
  absent: number;
}) {
  const maxValue = Math.max(planned, present, absent, 1);
  const plannedPct = (planned / maxValue) * 100;
  const presentPct = (present / maxValue) * 100;
  const absentPct  = (absent / maxValue)  * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: '1 0 60px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px', width: '100%', justifyContent: 'center' }}>
        <div
          title={`Planejado: ${planned}`}
          style={{
            width: '14px',
            height: `${plannedPct}%`,
            minHeight: planned > 0 ? '4px' : '0',
            background: 'var(--color-primary)',
            borderRadius: '3px 3px 0 0',
            opacity: 0.7,
          }}
        />
        <div
          title={`Presentes: ${present}`}
          style={{
            width: '14px',
            height: `${presentPct}%`,
            minHeight: present > 0 ? '4px' : '0',
            background: '#16a34a',
            borderRadius: '3px 3px 0 0',
          }}
        />
        <div
          title={`Ausentes: ${absent}`}
          style={{
            width: '14px',
            height: `${absentPct}%`,
            minHeight: absent > 0 ? '4px' : '0',
            background: '#dc2626',
            borderRadius: '3px 3px 0 0',
            opacity: 0.8,
          }}
        />
      </div>
      <span style={{ fontSize: '10px', color: 'var(--color-secondary-text)', textAlign: 'center', maxWidth: '52px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function WorkforceControl() {
  const { t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();

  // ------------------------------------------------------------------
  // List state
  // ------------------------------------------------------------------
  const [logs, setLogs] = useState<WorkforceDailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ------------------------------------------------------------------
  // Filters
  // ------------------------------------------------------------------
  const [filterDate, setFilterDate] = useState('');
  const [filterTeam, setFilterTeam] = useState('');

  // ------------------------------------------------------------------
  // Users for select
  // ------------------------------------------------------------------
  const [users, setUsers] = useState<UserOption[]>([]);

  // ------------------------------------------------------------------
  // Create log modal
  // ------------------------------------------------------------------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateLogForm>(EMPTY_CREATE_FORM);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // ------------------------------------------------------------------
  // Check-out modal
  // ------------------------------------------------------------------
  const [checkOutLog, setCheckOutLog] = useState<WorkforceDailyLog | null>(null);
  const [checkOutForm, setCheckOutForm] = useState<CheckOutForm>(EMPTY_CHECKOUT_FORM);
  const [checkOutLoading, setCheckOutLoading] = useState(false);

  // ------------------------------------------------------------------
  // Edit modal
  // ------------------------------------------------------------------
  const [editingLog, setEditingLog] = useState<WorkforceDailyLog | null>(null);
  const [editForm, setEditForm] = useState<CreateLogForm>(EMPTY_CREATE_FORM);
  const [editLoading, setEditLoading] = useState(false);

  // ------------------------------------------------------------------
  // Delete confirm
  // ------------------------------------------------------------------
  const [deleteLogId, setDeleteLogId] = useState<number | null>(null);

  // ------------------------------------------------------------------
  // Histogram
  // ------------------------------------------------------------------
  const [histogram, setHistogram] = useState<WorkforceHistogram[]>([]);
  const [histogramLoading, setHistogramLoading] = useState(false);
  const [showHistogram, setShowHistogram] = useState(false);
  const [histInitialDate, setHistInitialDate] = useState('');
  const [histFinalDate, setHistFinalDate] = useState('');

  // ------------------------------------------------------------------
  // Toast
  // ------------------------------------------------------------------
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // ------------------------------------------------------------------
  // Nav selection
  // ------------------------------------------------------------------
  useEffect(() => {
    setNavBarSelection(22);
  }, []);

  // ------------------------------------------------------------------
  // Load users
  // ------------------------------------------------------------------
  useEffect(() => {
    usersApi.queryAllUsers({ per_page: 200 })
      .then((data) => {
        const items = (data.items || data) as Array<{ id: number; name?: string; full_name?: string }>;
        setUsers(items.map((u) => ({ id: u.id, name: u.name || u.full_name || String(u.id) })));
      })
      .catch((err) => console.error('Failed to load users:', err));
  }, []);

  // ------------------------------------------------------------------
  // Show toast helper
  // ------------------------------------------------------------------
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ------------------------------------------------------------------
  // Load list
  // ------------------------------------------------------------------
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof workforceApi.listDailyLogs>[0] = {
        page,
        per_page: perPage,
        log_date: filterDate || undefined,
        team: filterTeam || undefined,
      };
      if (projectsInfo) params.projects_id = projectsInfo.id;
      const data = await workforceApi.listDailyLogs(params);
      setLogs(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load workforce logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, filterDate, filterTeam, projectsInfo]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // ------------------------------------------------------------------
  // Load histogram
  // ------------------------------------------------------------------
  const loadHistogram = async () => {
    if (!projectsInfo) {
      showToast('Selecione um projeto para visualizar o histograma.', 'error');
      return;
    }
    setHistogramLoading(true);
    try {
      const data = await workforceApi.getHistogram({
        projects_id: projectsInfo.id,
        initial_date: histInitialDate || undefined,
        final_date: histFinalDate || undefined,
      });
      setHistogram(data);
      setShowHistogram(true);
    } catch (err) {
      console.error('Failed to load histogram:', err);
      showToast('Erro ao carregar histograma.', 'error');
    } finally {
      setHistogramLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Create log (check-in)
  // ------------------------------------------------------------------
  const handleCreate = async () => {
    if (!createForm.users_id || !createForm.log_date) {
      setCreateError('Colaborador e data são obrigatórios.');
      return;
    }
    setCreateLoading(true);
    setCreateError('');
    try {
      if (createForm.check_in) {
        await workforceApi.checkIn({
          projects_id: projectsInfo?.id,
          users_id: Number(createForm.users_id),
          log_date: createForm.log_date,
          check_in: createForm.check_in,
          team: createForm.team || undefined,
        });
      } else {
        await workforceApi.createDailyLog({
          projects_id: projectsInfo?.id,
          users_id: Number(createForm.users_id),
          log_date: createForm.log_date,
          team: createForm.team || undefined,
          observation: createForm.observation || undefined,
        });
      }
      setShowCreateModal(false);
      setCreateForm(EMPTY_CREATE_FORM);
      showToast('Registro criado com sucesso!');
      loadLogs();
    } catch (err) {
      console.error('Failed to create log:', err);
      setCreateError('Erro ao criar registro.');
    } finally {
      setCreateLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Check-out
  // ------------------------------------------------------------------
  const openCheckOut = (log: WorkforceDailyLog) => {
    setCheckOutLog(log);
    setCheckOutForm({ check_out: new Date().toTimeString().slice(0, 5) });
  };

  const handleCheckOut = async () => {
    if (!checkOutLog || !checkOutForm.check_out) return;
    setCheckOutLoading(true);
    try {
      await workforceApi.checkOut(checkOutLog.id, { check_out: checkOutForm.check_out });
      setCheckOutLog(null);
      showToast('Check-out registrado!');
      loadLogs();
    } catch (err) {
      console.error('Failed to check out:', err);
      showToast('Erro ao registrar check-out.', 'error');
    } finally {
      setCheckOutLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Edit log
  // ------------------------------------------------------------------
  const openEdit = (log: WorkforceDailyLog) => {
    setEditingLog(log);
    setEditForm({
      users_id: log.users_id,
      log_date: log.log_date,
      check_in: log.check_in || '',
      team: log.team || '',
      observation: log.observation || '',
    });
  };

  const handleEdit = async () => {
    if (!editingLog) return;
    setEditLoading(true);
    try {
      await workforceApi.updateDailyLog(editingLog.id, {
        log_date: editForm.log_date,
        check_in: editForm.check_in || undefined,
        team: editForm.team || undefined,
        observation: editForm.observation || undefined,
      });
      setEditingLog(null);
      showToast('Registro atualizado!');
      loadLogs();
    } catch (err) {
      console.error('Failed to update log:', err);
      showToast('Erro ao atualizar registro.', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Delete log
  // ------------------------------------------------------------------
  const handleDelete = async (id: number) => {
    try {
      await workforceApi.deleteDailyLog(id);
      showToast('Registro removido.');
      loadLogs();
    } catch (err) {
      console.error('Failed to delete log:', err);
      showToast('Erro ao remover registro.', 'error');
    }
    setDeleteLogId(null);
  };

  // ------------------------------------------------------------------
  // Resolve user name
  // ------------------------------------------------------------------
  const resolveUserName = (log: WorkforceDailyLog): string => {
    if (log.user_name) return log.user_name;
    const found = users.find((u) => u.id === log.users_id);
    return found ? found.name : String(log.users_id);
  };

  // ------------------------------------------------------------------
  // Histogram legend
  // ------------------------------------------------------------------
  const histogramMaxVal = histogram.reduce(
    (acc, h) => Math.max(acc, h.total_planned, h.total_present, h.total_absent),
    1,
  );

  // ------------------------------------------------------------------
  // JSX
  // ------------------------------------------------------------------

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            padding: '12px 20px',
            borderRadius: '8px',
            background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {toast.message}
        </div>
      )}

      <PageHeader
        title="Controle de Mão de Obra"
        subtitle="Registro de presença, check-in/check-out e histograma de efetivo por dia"
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowHistogram((v) => !v)}
            >
              <BarChart2 size={18} /> Histograma
            </button>
            <button
              className="btn btn-primary"
              onClick={() => { setCreateForm(EMPTY_CREATE_FORM); setCreateError(''); setShowCreateModal(true); }}
            >
              <Plus size={18} /> Registrar
            </button>
          </div>
        }
      />
      <ProjectFilterDropdown />

      {/* Histogram section */}
      {showHistogram && (
        <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
              Histograma de Efetivo
            </h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '11px' }}>De</label>
                <input
                  type="date"
                  className="input-field"
                  value={histInitialDate}
                  onChange={(e) => setHistInitialDate(e.target.value)}
                  style={{ padding: '6px 10px' }}
                />
              </div>
              <div className="input-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '11px' }}>Até</label>
                <input
                  type="date"
                  className="input-field"
                  value={histFinalDate}
                  onChange={(e) => setHistFinalDate(e.target.value)}
                  style={{ padding: '6px 10px' }}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={loadHistogram}
                disabled={histogramLoading}
                style={{ alignSelf: 'flex-end' }}
              >
                {histogramLoading ? <span className="spinner" /> : 'Carregar'}
              </button>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', background: 'var(--color-primary)', borderRadius: '3px', opacity: 0.7 }} />
              <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>Planejado</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', background: '#16a34a', borderRadius: '3px' }} />
              <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>Presentes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', background: '#dc2626', borderRadius: '3px', opacity: 0.8 }} />
              <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>Ausentes</span>
            </div>
          </div>

          {histogram.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-secondary-text)', fontSize: '14px' }}>
              Selecione o período e clique em "Carregar" para ver o histograma.
            </div>
          ) : (
            <>
              {/* Y-axis scale reference */}
              <div style={{ display: 'flex', gap: '0', alignItems: 'flex-end', borderBottom: '1px solid var(--color-border)', paddingBottom: '4px' }}>
                <div style={{ width: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '80px', paddingRight: '4px' }}>
                  <span style={{ fontSize: '9px', color: 'var(--color-secondary-text)', textAlign: 'right' }}>{histogramMaxVal}</span>
                  <span style={{ fontSize: '9px', color: 'var(--color-secondary-text)', textAlign: 'right' }}>{Math.round(histogramMaxVal / 2)}</span>
                  <span style={{ fontSize: '9px', color: 'var(--color-secondary-text)', textAlign: 'right' }}>0</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', flex: 1, paddingBottom: '4px' }}>
                  {histogram.map((entry) => (
                    <HistogramBar
                      key={entry.date}
                      label={entry.date.slice(5)}
                      planned={entry.total_planned}
                      present={entry.total_present}
                      absent={entry.total_absent}
                    />
                  ))}
                </div>
              </div>

              {/* Summary row */}
              <div style={{ display: 'flex', gap: '24px', marginTop: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-secondary-text)' }}>Total planejado: </span>
                  <span style={{ fontWeight: 600 }}>{histogram.reduce((s, h) => s + h.total_planned, 0)}</span>
                </div>
                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-secondary-text)' }}>Total presentes: </span>
                  <span style={{ fontWeight: 600, color: '#16a34a' }}>{histogram.reduce((s, h) => s + h.total_present, 0)}</span>
                </div>
                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-secondary-text)' }}>Total ausentes: </span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>{histogram.reduce((s, h) => s + h.total_absent, 0)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="input-group" style={{ margin: 0, flex: '0 0 180px' }}>
          <label style={{ fontSize: '12px' }}>Data</label>
          <input
            type="date"
            className="input-field"
            value={filterDate}
            onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
          />
        </div>
        <div className="input-group" style={{ margin: 0, flex: '0 0 200px' }}>
          <label style={{ fontSize: '12px' }}>Equipe</label>
          <input
            type="text"
            className="input-field"
            placeholder="Filtrar por equipe..."
            value={filterTeam}
            onChange={(e) => { setFilterTeam(e.target.value); setPage(1); }}
          />
        </div>
        {(filterDate || filterTeam) && (
          <button
            className="btn btn-secondary"
            style={{ alignSelf: 'flex-end' }}
            onClick={() => { setFilterDate(''); setFilterTeam(''); setPage(1); }}
          >
            <X size={16} /> Limpar
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : logs.length === 0 ? (
        <EmptyState
          message="Nenhum registro de presença encontrado."
          action={
            <button className="btn btn-primary" onClick={() => { setCreateForm(EMPTY_CREATE_FORM); setCreateError(''); setShowCreateModal(true); }}>
              <Plus size={18} /> Registrar presença
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Data</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Equipe</th>
                <th>Status</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {logs.map((log) => (
                <motion.tr key={log.id} variants={tableRowVariants}>
                  <td>
                    <span style={{ fontWeight: 500 }}>{resolveUserName(log)}</span>
                  </td>
                  <td>{log.log_date}</td>
                  <td>
                    {log.check_in ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <LogIn size={13} color="var(--color-success)" />
                        {log.check_in}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>-</span>
                    )}
                  </td>
                  <td>
                    {log.check_out ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <LogOut size={13} color="var(--color-error)" />
                        {log.check_out}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>-</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>{log.team || '-'}</td>
                  <td>
                    {log.status ? (
                      <StatusBadge status={log.status} colorMap={STATUS_COLOR_MAP} />
                    ) : (
                      <span style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>-</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
                      {log.check_in && !log.check_out && (
                        <button
                          className="btn btn-icon"
                          title="Registrar saída"
                          onClick={() => openCheckOut(log)}
                        >
                          <LogOut size={15} color="var(--color-warning)" />
                        </button>
                      )}
                      <button
                        className="btn btn-icon"
                        title={t('common.edit')}
                        onClick={() => openEdit(log)}
                      >
                        <Edit size={15} color="var(--color-secondary-text)" />
                      </button>
                      <button
                        className="btn btn-icon"
                        title={t('common.delete')}
                        onClick={() => setDeleteLogId(log.id)}
                      >
                        <Trash2 size={15} color="var(--color-error)" />
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
            onPerPageChange={(pp) => { setPerPage(pp); setPage(1); }}
          />
        </div>
      )}

      {/* Create Log Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ padding: '24px', width: '480px', maxWidth: '95vw' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Registrar presença</h3>
              <button className="btn btn-icon" onClick={() => setShowCreateModal(false)} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label>Colaborador *</label>
                <SearchableSelect
                  options={users.map((u) => ({ value: u.id, label: u.name }))}
                  value={createForm.users_id || undefined}
                  onChange={(val) => setCreateForm((p) => ({ ...p, users_id: val !== undefined ? Number(val) : '' }))}
                  placeholder="Selecione um colaborador"
                  allowClear
                />
              </div>
              <div className="input-group">
                <label>Data *</label>
                <input
                  type="date"
                  className="input-field"
                  value={createForm.log_date}
                  onChange={(e) => setCreateForm((p) => ({ ...p, log_date: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>Horário de entrada</label>
                <input
                  type="time"
                  className="input-field"
                  value={createForm.check_in}
                  onChange={(e) => setCreateForm((p) => ({ ...p, check_in: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>Equipe</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Equipe A"
                  value={createForm.team}
                  onChange={(e) => setCreateForm((p) => ({ ...p, team: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>Observação</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={createForm.observation}
                  onChange={(e) => setCreateForm((p) => ({ ...p, observation: e.target.value }))}
                />
              </div>

              {createError && (
                <p style={{ color: 'var(--color-error)', fontSize: '13px' }}>{createError}</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={createLoading || !createForm.users_id || !createForm.log_date}
              >
                {createLoading ? <span className="spinner" /> : (
                  <>
                    <LogIn size={16} /> Registrar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-out Modal */}
      {checkOutLog && (
        <div className="modal-backdrop" onClick={() => setCheckOutLog(null)}>
          <div className="modal-content" style={{ padding: '24px', width: '380px', maxWidth: '95vw' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Registrar saída</h3>
              <button className="btn btn-icon" onClick={() => setCheckOutLog(null)} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-secondary-text)', marginBottom: '16px' }}>
              Colaborador: <strong style={{ color: 'var(--color-primary-text)' }}>{resolveUserName(checkOutLog)}</strong>
            </p>
            <div className="input-group">
              <label>Horário de saída *</label>
              <input
                type="time"
                className="input-field"
                value={checkOutForm.check_out}
                onChange={(e) => setCheckOutForm({ check_out: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setCheckOutLog(null)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCheckOut}
                disabled={checkOutLoading || !checkOutForm.check_out}
              >
                {checkOutLoading ? <span className="spinner" /> : (
                  <>
                    <LogOut size={16} /> Confirmar saída
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingLog && (
        <div className="modal-backdrop" onClick={() => setEditingLog(null)}>
          <div className="modal-content" style={{ padding: '24px', width: '440px', maxWidth: '95vw' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Editar registro</h3>
              <button className="btn btn-icon" onClick={() => setEditingLog(null)} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label>Data</label>
                <input
                  type="date"
                  className="input-field"
                  value={editForm.log_date}
                  onChange={(e) => setEditForm((p) => ({ ...p, log_date: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>Horário de entrada</label>
                <input
                  type="time"
                  className="input-field"
                  value={editForm.check_in}
                  onChange={(e) => setEditForm((p) => ({ ...p, check_in: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>Equipe</label>
                <input
                  type="text"
                  className="input-field"
                  value={editForm.team}
                  onChange={(e) => setEditForm((p) => ({ ...p, team: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>Observação</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={editForm.observation}
                  onChange={(e) => setEditForm((p) => ({ ...p, observation: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setEditingLog(null)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleEdit}
                disabled={editLoading}
              >
                {editLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteLogId !== null && (
        <ConfirmModal
          title="Remover registro"
          message="Tem certeza que deseja remover este registro de presença?"
          onConfirm={() => handleDelete(deleteLogId)}
          onCancel={() => setDeleteLogId(null)}
        />
      )}
    </div>
  );
}
