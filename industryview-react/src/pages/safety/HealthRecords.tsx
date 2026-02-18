import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useAppState } from '../../contexts/AppStateContext';
import { healthApi } from '../../services';
import type { HealthRecord } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Plus,
  Edit,
  ClipboardList,
  Filter,
  X,
  AlertTriangle,
} from 'lucide-react';

/* =========================================
   Constants
   ========================================= */

const EXAM_TYPES = [
  { value: 'admissional', label: 'Admissional' },
  { value: 'periodico', label: 'Periódico' },
  { value: 'retorno_trabalho', label: 'Retorno ao Trabalho' },
  { value: 'mudanca_funcao', label: 'Mudança de Função' },
  { value: 'demissional', label: 'Demissional' },
] as const;

const RESULT_OPTIONS = [
  { value: 'apto', label: 'Apto' },
  { value: 'inapto', label: 'Inapto' },
  { value: 'apto_restricao', label: 'Apto com Restrição' },
] as const;

const PER_PAGE = 10;

/* =========================================
   Types
   ========================================= */

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

interface RecordForm {
  users_id: string;
  exam_type: string;
  exam_date: string;
  expiry_date: string;
  result: string;
  restriction_description: string;
  doctor_name: string;
  crm: string;
}

const EMPTY_FORM: RecordForm = {
  users_id: '',
  exam_type: 'admissional',
  exam_date: new Date().toISOString().slice(0, 10),
  expiry_date: '',
  result: 'apto',
  restriction_description: '',
  doctor_name: '',
  crm: '',
};

/* =========================================
   Helpers
   ========================================= */

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('pt-BR');
}

function getExpiryStatus(expiry_date?: string): 'expired' | 'expiring_soon' | 'ok' | 'none' {
  if (!expiry_date) return 'none';
  const now = new Date();
  const expiry = new Date(expiry_date);
  if (isNaN(expiry.getTime())) return 'none';
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring_soon';
  return 'ok';
}

function getResultBadgeStyle(result: HealthRecord['result']): React.CSSProperties {
  switch (result) {
    case 'apto':
      return { backgroundColor: 'var(--color-status-04)', color: 'var(--color-success)' };
    case 'inapto':
      return { backgroundColor: 'var(--color-status-05)', color: 'var(--color-error)' };
    case 'apto_restricao':
      return { backgroundColor: '#FFF8E7', color: 'var(--color-warning)' };
  }
}

function getResultLabel(result: HealthRecord['result']): string {
  return RESULT_OPTIONS.find((r) => r.value === result)?.label ?? result;
}

function getExamTypeLabel(examType: string): string {
  return EXAM_TYPES.find((et) => et.value === examType)?.label ?? examType;
}

function getRowBackground(expiryStatus: ReturnType<typeof getExpiryStatus>): string | undefined {
  if (expiryStatus === 'expired') return 'rgba(230, 84, 84, 0.06)';
  if (expiryStatus === 'expiring_soon') return 'rgba(239, 169, 83, 0.08)';
  return undefined;
}

/* =========================================
   Main Component
   ========================================= */

export default function HealthRecords() {
  const { projectsInfo, setNavBarSelection } = useAppState();

  useEffect(() => {
    setNavBarSelection(19);
  }, []);

  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [filterExamType, setFilterExamType] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [form, setForm] = useState<RecordForm>(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<HealthRecord | null>(null);

  const [toast, setToast] = useState<ToastState | null>(null);

  /* =========================================
     Toast
     ========================================= */

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  /* =========================================
     Load Records
     ========================================= */

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof healthApi.listRecords>[0] = {
        page,
        per_page: PER_PAGE,
      };
      if (projectsInfo) params.company_id = projectsInfo.id;
      if (filterExamType) params.exam_type = filterExamType;
      const data = await healthApi.listRecords(params);
      setRecords(data.items ?? []);
      setTotalPages(data.pageTotal ?? 1);
      setTotalItems(data.itemsTotal ?? 0);
    } catch {
      showToast('Erro ao carregar registros de saúde', 'error');
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, filterExamType, showToast]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  /* =========================================
     Handlers
     ========================================= */

  const openCreateModal = () => {
    setEditingRecord(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (record: HealthRecord) => {
    setEditingRecord(record);
    setForm({
      users_id: String(record.users_id),
      exam_type: record.exam_type,
      exam_date: record.exam_date.slice(0, 10),
      expiry_date: record.expiry_date ? record.expiry_date.slice(0, 10) : '',
      result: record.result,
      restriction_description: record.restriction_description ?? '',
      doctor_name: record.doctor_name ?? '',
      crm: record.crm ?? '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.users_id || !form.exam_type || !form.exam_date || !form.result) {
      showToast('Colaborador, tipo de exame, data e resultado são obrigatórios', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const payload = {
        users_id: parseInt(form.users_id, 10),
        exam_type: form.exam_type,
        exam_date: form.exam_date,
        expiry_date: form.expiry_date || undefined,
        result: form.result,
        restriction_description: form.result === 'apto_restricao' ? form.restriction_description.trim() || undefined : undefined,
        doctor_name: form.doctor_name.trim() || undefined,
        crm: form.crm.trim() || undefined,
      };
      if (editingRecord) {
        await healthApi.updateRecord(editingRecord.id, payload);
        showToast('Registro atualizado com sucesso', 'success');
      } else {
        await healthApi.createRecord(payload);
        showToast('Registro criado com sucesso', 'success');
      }
      setShowModal(false);
      loadRecords();
    } catch {
      showToast('Erro ao salvar registro', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Health records don't have a dedicated delete endpoint in the service,
  // so the delete confirm is wired but handled gracefully.
  const handleDeleteConfirmed = async () => {
    if (!deleteConfirm) return;
    try {
      await healthApi.updateRecord(deleteConfirm.id, { is_active: false });
      showToast('Registro inativado', 'success');
    } catch {
      showToast('Erro ao excluir registro', 'error');
    } finally {
      setDeleteConfirm(null);
      loadRecords();
    }
  };

  const handleClearFilters = () => {
    setFilterExamType('');
    setPage(1);
  };

  /* =========================================
     Render
     ========================================= */

  return (
    <div>
      <PageHeader
        title="Registros de Saúde"
        subtitle="Controle de ASOs e aptidão ocupacional dos colaboradores"
        breadcrumb="Segurança / Saúde Ocupacional"
        actions={
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> Novo Registro
          </button>
        }
      />

      <ProjectFilterDropdown />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-secondary-text)' }}>
          <Filter size={16} />
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Filtrar por tipo:</span>
        </div>
        <div className="input-group" style={{ margin: 0, flex: '0 0 220px' }}>
          <select
            className="select-field"
            value={filterExamType}
            onChange={(e) => { setFilterExamType(e.target.value); setPage(1); }}
          >
            <option value="">Todos os tipos de exame</option>
            {EXAM_TYPES.map((et) => (
              <option key={et.value} value={et.value}>{et.label}</option>
            ))}
          </select>
        </div>
        {filterExamType && (
          <button className="btn btn-icon" title="Limpar filtro" onClick={handleClearFilters}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : records.length === 0 ? (
        <EmptyState
          message="Nenhum registro de saúde encontrado"
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> Novo Registro
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Tipo de Exame</th>
                <th>Data do Exame</th>
                <th>Data de Validade</th>
                <th>Resultado</th>
                <th>Médico / CRM</th>
                <th>Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {records.map((record) => {
                const expiryStatus = getExpiryStatus(record.expiry_date);
                const rowBg = getRowBackground(expiryStatus);
                return (
                  <motion.tr key={record.id} variants={tableRowVariants} style={{ backgroundColor: rowBg }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClipboardList size={16} color="var(--color-primary)" />
                        <span style={{ fontWeight: 500 }}>
                          {record.user_name ?? `ID ${record.users_id}`}
                        </span>
                      </div>
                    </td>
                    <td>{getExamTypeLabel(record.exam_type)}</td>
                    <td>{formatDate(record.exam_date)}</td>
                    <td>
                      {record.expiry_date ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {expiryStatus !== 'ok' && (
                            <AlertTriangle
                              size={14}
                              color={expiryStatus === 'expired' ? 'var(--color-error)' : 'var(--color-warning)'}
                            />
                          )}
                          <span
                            style={{
                              color: expiryStatus === 'expired'
                                ? 'var(--color-error)'
                                : expiryStatus === 'expiring_soon'
                                ? 'var(--color-warning)'
                                : 'var(--color-primary-text)',
                              fontWeight: expiryStatus !== 'ok' ? 600 : 400,
                            }}
                          >
                            {formatDate(record.expiry_date)}
                          </span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <div>
                        <span className="badge" style={getResultBadgeStyle(record.result)}>
                          {getResultLabel(record.result)}
                        </span>
                        {record.result === 'apto_restricao' && record.restriction_description && (
                          <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '4px', maxWidth: '200px' }}>
                            {record.restriction_description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                      {record.doctor_name ?? '-'}
                      {record.crm && (
                        <div style={{ fontSize: '11px' }}>CRM: {record.crm}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="btn btn-icon"
                          title="Editar"
                          onClick={() => openEditModal(record)}
                        >
                          <Edit size={16} color="var(--color-primary)" />
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
            perPage={PER_PAGE}
            totalItems={totalItems}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <h3 style={{ marginBottom: '20px' }}>
              {editingRecord ? 'Editar Registro de Saúde' : 'Novo Registro de Saúde (ASO)'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>ID do Colaborador *</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="ID do usuário"
                  value={form.users_id}
                  onChange={(e) => setForm((f) => ({ ...f, users_id: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>Tipo de Exame *</label>
                <select
                  className="select-field"
                  value={form.exam_type}
                  onChange={(e) => setForm((f) => ({ ...f, exam_type: e.target.value }))}
                >
                  {EXAM_TYPES.map((et) => (
                    <option key={et.value} value={et.value}>{et.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Data do Exame *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.exam_date}
                    onChange={(e) => setForm((f) => ({ ...f, exam_date: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label>Data de Validade</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.expiry_date}
                    onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Resultado *</label>
                <select
                  className="select-field"
                  value={form.result}
                  onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))}
                >
                  {RESULT_OPTIONS.map((ro) => (
                    <option key={ro.value} value={ro.value}>{ro.label}</option>
                  ))}
                </select>
              </div>
              {form.result === 'apto_restricao' && (
                <div className="input-group">
                  <label>Descrição da Restrição</label>
                  <textarea
                    className="input-field"
                    placeholder="Descreva as restrições..."
                    rows={3}
                    value={form.restriction_description}
                    onChange={(e) => setForm((f) => ({ ...f, restriction_description: e.target.value }))}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Nome do Médico</label>
                  <input
                    className="input-field"
                    placeholder="Dr. João Silva"
                    value={form.doctor_name}
                    onChange={(e) => setForm((f) => ({ ...f, doctor_name: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label>CRM</label>
                  <input
                    className="input-field"
                    placeholder="CRM/SP 12345"
                    value={form.crm}
                    onChange={(e) => setForm((f) => ({ ...f, crm: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={formLoading}>
                {formLoading ? <span className="spinner" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ConfirmModal
          title="Inativar Registro"
          message={`Tem certeza que deseja inativar o registro de saúde de "${deleteConfirm.user_name ?? `ID ${deleteConfirm.users_id}`}"?`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 2000,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: 'var(--shadow-lg)',
            maxWidth: '360px',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
