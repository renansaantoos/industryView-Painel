import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useAppState } from '../../contexts/AppStateContext';
import { environmentalApi } from '../../services';
import type { EnvironmentalLicense, EnvironmentalCondition } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Plus,
  Edit,
  Trash2,
  Leaf,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ClipboardCheck,
  ExternalLink,
} from 'lucide-react';

/* =========================================
   Constants
   ========================================= */

const LICENSE_STATUS_CONFIG: Record<
  EnvironmentalLicense['status'],
  { label: string; bg: string; color: string }
> = {
  vigente:   { label: 'Vigente',    bg: 'var(--color-status-04)', color: 'var(--color-success)' },
  vencendo:  { label: 'Vencendo',   bg: '#FFF8E7',                color: 'var(--color-warning)' },
  vencida:   { label: 'Vencida',    bg: 'var(--color-status-05)', color: 'var(--color-error)'   },
  renovacao: { label: 'Renovação',  bg: 'var(--color-status-03)', color: 'var(--color-primary)' },
};

const CONDITION_STATUS_CONFIG: Record<
  EnvironmentalCondition['status'],
  { label: string; bg: string; color: string }
> = {
  pendente:     { label: 'Pendente',     bg: 'var(--color-status-01)', color: 'var(--color-secondary-text)' },
  em_andamento: { label: 'Em Andamento', bg: 'var(--color-status-03)', color: 'var(--color-primary)'        },
  cumprida:     { label: 'Cumprida',     bg: 'var(--color-status-04)', color: 'var(--color-success)'        },
  atrasada:     { label: 'Atrasada',     bg: 'var(--color-status-05)', color: 'var(--color-error)'          },
};

const CONDITION_STATUS_OPTIONS: Array<{ value: EnvironmentalCondition['status']; label: string }> = [
  { value: 'pendente',     label: 'Pendente'     },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'cumprida',     label: 'Cumprida'     },
  { value: 'atrasada',     label: 'Atrasada'     },
];

const PER_PAGE = 10;

/* =========================================
   Types
   ========================================= */

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

interface LicenseForm {
  license_number: string;
  license_type: string;
  issuing_agency: string;
  issue_date: string;
  expiry_date: string;
  file_url: string;
  observation: string;
}

interface ConditionForm {
  description: string;
  deadline: string;
  responsible_id: string;
}

const EMPTY_LICENSE_FORM: LicenseForm = {
  license_number: '',
  license_type: '',
  issuing_agency: '',
  issue_date: '',
  expiry_date: '',
  file_url: '',
  observation: '',
};

const EMPTY_CONDITION_FORM: ConditionForm = {
  description: '',
  deadline: '',
  responsible_id: '',
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

/* =========================================
   Sub-component: Conditions Panel
   ========================================= */

interface ConditionsPanelProps {
  license: EnvironmentalLicense;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

function ConditionsPanel({ license, onShowToast }: ConditionsPanelProps) {
  const [conditions, setConditions] = useState<EnvironmentalCondition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<ConditionForm>(EMPTY_CONDITION_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [editingCondition, setEditingCondition] = useState<EnvironmentalCondition | null>(null);
  const [editStatus, setEditStatus] = useState<EnvironmentalCondition['status']>('pendente');
  const [editStatusLoading, setEditStatusLoading] = useState(false);

  const loadConditions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await environmentalApi.getConditions(license.id);
      setConditions(Array.isArray(data) ? data : []);
    } catch {
      onShowToast('Erro ao carregar condicionantes', 'error');
    } finally {
      setLoading(false);
    }
  }, [license.id, onShowToast]);

  useEffect(() => {
    loadConditions();
  }, [loadConditions]);

  const handleAddCondition = async () => {
    if (!form.description.trim()) {
      onShowToast('A descrição da condicionante é obrigatória', 'error');
      return;
    }
    setFormLoading(true);
    try {
      await environmentalApi.createCondition(license.id, {
        description: form.description.trim(),
        deadline: form.deadline || undefined,
        responsible_id: form.responsible_id ? parseInt(form.responsible_id, 10) : undefined,
      });
      onShowToast('Condicionante adicionada com sucesso', 'success');
      setShowAddModal(false);
      setForm(EMPTY_CONDITION_FORM);
      loadConditions();
    } catch {
      onShowToast('Erro ao adicionar condicionante', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!editingCondition) return;
    setEditStatusLoading(true);
    try {
      await environmentalApi.updateCondition(editingCondition.id, { status: editStatus });
      onShowToast('Status atualizado com sucesso', 'success');
      setEditingCondition(null);
      loadConditions();
    } catch {
      onShowToast('Erro ao atualizar status', 'error');
    } finally {
      setEditStatusLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-primary-bg)',
      borderTop: '1px solid var(--color-alternate)',
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary-text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ClipboardCheck size={15} color="var(--color-primary)" />
          Condicionantes
        </span>
        <button
          className="btn btn-secondary"
          style={{ padding: '4px 12px', fontSize: '12px' }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : conditions.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', padding: '8px 0' }}>
          Nenhuma condicionante cadastrada para esta licença.
        </p>
      ) : (
        <div className="table-container" style={{ marginBottom: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Prazo</th>
                <th>Status</th>
                <th>Responsável</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {conditions.map((condition) => {
                const statusCfg = CONDITION_STATUS_CONFIG[condition.status];
                return (
                  <tr key={condition.id}>
                    <td style={{ maxWidth: '320px', fontSize: '13px' }}>{condition.description}</td>
                    <td style={{ fontSize: '13px' }}>{formatDate(condition.deadline)}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                      {condition.responsible_name ?? (condition.responsible_id ? `ID ${condition.responsible_id}` : '-')}
                    </td>
                    <td>
                      <button
                        className="btn btn-icon"
                        title="Atualizar Status"
                        onClick={() => {
                          setEditingCondition(condition);
                          setEditStatus(condition.status);
                        }}
                      >
                        <Edit size={14} color="var(--color-primary)" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Condition Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <h3>Nova Condicionante</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>Descrição *</label>
                <textarea
                  className="input-field"
                  placeholder="Descreva a condicionante ambiental..."
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Prazo</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.deadline}
                    onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label>ID do Responsável</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="ID do usuário"
                    value={form.responsible_id}
                    onChange={(e) => setForm((f) => ({ ...f, responsible_id: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAddCondition} disabled={formLoading}>
                {formLoading ? <span className="spinner" /> : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {editingCondition && (
        <div className="modal-backdrop" onClick={() => setEditingCondition(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3>Atualizar Status</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '16px' }}>
              {editingCondition.description}
            </p>
            <div className="input-group">
              <label>Status</label>
              <select
                className="select-field"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as EnvironmentalCondition['status'])}
              >
                {CONDITION_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditingCondition(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={editStatusLoading}>
                {editStatusLoading ? <span className="spinner" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================
   Main Component
   ========================================= */

export default function EnvironmentalLicenses() {
  const { projectsInfo, setNavBarSelection } = useAppState();

  useEffect(() => {
    setNavBarSelection(20);
  }, []);

  const [licenses, setLicenses] = useState<EnvironmentalLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [expandedLicenseId, setExpandedLicenseId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingLicense, setEditingLicense] = useState<EnvironmentalLicense | null>(null);
  const [form, setForm] = useState<LicenseForm>(EMPTY_LICENSE_FORM);
  const [formLoading, setFormLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<EnvironmentalLicense | null>(null);

  const [toast, setToast] = useState<ToastState | null>(null);

  /* =========================================
     Toast
     ========================================= */

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  /* =========================================
     Load Licenses
     ========================================= */

  const loadLicenses = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof environmentalApi.listLicenses>[0] = {
        page,
        per_page: PER_PAGE,
      };
      if (projectsInfo) params.projects_id = projectsInfo.id;
      const data = await environmentalApi.listLicenses(params);
      setLicenses(data.items ?? []);
      setTotalPages(data.pageTotal ?? 1);
      setTotalItems(data.itemsTotal ?? 0);
    } catch {
      showToast('Erro ao carregar licenças ambientais', 'error');
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, showToast]);

  useEffect(() => {
    loadLicenses();
  }, [loadLicenses]);

  /* =========================================
     Handlers
     ========================================= */

  const openCreateModal = () => {
    setEditingLicense(null);
    setForm(EMPTY_LICENSE_FORM);
    setShowModal(true);
  };

  const openEditModal = (license: EnvironmentalLicense) => {
    setEditingLicense(license);
    setForm({
      license_number: license.license_number,
      license_type: license.license_type,
      issuing_agency: license.issuing_agency,
      issue_date: license.issued_date?.slice(0, 10) ?? '',
      expiry_date: license.expiry_date?.slice(0, 10) ?? '',
      file_url: license.file_url ?? '',
      observation: license.observations ?? '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.license_number.trim() || !form.license_type.trim() || !form.issuing_agency.trim() || !form.issue_date || !form.expiry_date) {
      showToast('Número, tipo, órgão emissor, emissão e validade são obrigatórios', 'error');
      return;
    }
    if (!projectsInfo?.id) {
      showToast('Selecione um projeto antes de salvar a licença', 'error');
      return;
    }
    setFormLoading(true);
    try {
      const payload = {
        license_number: form.license_number.trim(),
        license_type: form.license_type.trim(),
        issuing_authority: form.issuing_agency.trim(),
        issued_at: form.issue_date,
        expires_at: form.expiry_date,
        file_url: form.file_url.trim() || undefined,
        notes: form.observation.trim() || undefined,
        projects_id: projectsInfo.id,
      };
      if (editingLicense) {
        await environmentalApi.updateLicense(editingLicense.id, payload);
        showToast('Licença atualizada com sucesso', 'success');
      } else {
        await environmentalApi.createLicense(payload);
        showToast('Licença criada com sucesso', 'success');
      }
      setShowModal(false);
      loadLicenses();
    } catch {
      showToast('Erro ao salvar licença', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await environmentalApi.deleteLicense(deleteConfirm.id);
      showToast('Licença excluída com sucesso', 'success');
      setDeleteConfirm(null);
      if (expandedLicenseId === deleteConfirm.id) setExpandedLicenseId(null);
      loadLicenses();
    } catch {
      showToast('Erro ao excluir licença', 'error');
      setDeleteConfirm(null);
    }
  };

  const toggleExpand = (licenseId: number) => {
    setExpandedLicenseId((prev) => (prev === licenseId ? null : licenseId));
  };

  /* =========================================
     Render
     ========================================= */

  return (
    <div>
      <PageHeader
        title="Licenças Ambientais"
        subtitle="Gestão de licenças ambientais e suas condicionantes"
        breadcrumb="Meio Ambiente / Licenças"
        actions={
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> Nova Licença
          </button>
        }
      />

      <ProjectFilterDropdown />

      {loading ? (
        <LoadingSpinner />
      ) : licenses.length === 0 ? (
        <EmptyState
          message="Nenhuma licença ambiental cadastrada"
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> Nova Licença
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Número da Licença</th>
                <th>Tipo</th>
                <th>Órgão Emissor</th>
                <th>Emissão</th>
                <th>Validade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {licenses.map((license) => {
                const statusCfg = LICENSE_STATUS_CONFIG[license.status];
                const isExpanded = expandedLicenseId === license.id;
                return (
                  <>
                    <motion.tr
                      key={license.id}
                      variants={tableRowVariants}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleExpand(license.id)}
                    >
                      <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', paddingRight: 0 }}>
                        <button
                          className="btn btn-icon"
                          style={{ padding: '2px' }}
                          onClick={() => toggleExpand(license.id)}
                          title={isExpanded ? 'Recolher condicionantes' : 'Ver condicionantes'}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Leaf size={16} color="var(--color-success)" />
                          <span style={{ fontWeight: 600 }}>{license.license_number}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px' }}>{license.license_type}</td>
                      <td style={{ fontSize: '13px' }}>{license.issuing_agency}</td>
                      <td style={{ fontSize: '13px' }}>{formatDate(license.issued_date)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {(license.status === 'vencida' || license.status === 'vencendo') && (
                            <AlertTriangle
                              size={14}
                              color={license.status === 'vencida' ? 'var(--color-error)' : 'var(--color-warning)'}
                            />
                          )}
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: license.status !== 'vigente' ? 600 : 400,
                              color: license.status === 'vencida'
                                ? 'var(--color-error)'
                                : license.status === 'vencendo'
                                ? 'var(--color-warning)'
                                : 'var(--color-primary-text)',
                            }}
                          >
                            {formatDate(license.expiry_date)}
                          </span>
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <span className="badge" style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {license.file_url && (
                            <a
                              href={license.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-icon"
                              title="Ver documento"
                            >
                              <ExternalLink size={16} color="var(--color-primary)" />
                            </a>
                          )}
                          <button
                            className="btn btn-icon"
                            title="Editar"
                            onClick={() => openEditModal(license)}
                          >
                            <Edit size={16} color="var(--color-primary)" />
                          </button>
                          <button
                            className="btn btn-icon"
                            title="Excluir"
                            onClick={() => setDeleteConfirm(license)}
                          >
                            <Trash2 size={16} color="var(--color-error)" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                    {isExpanded && (
                      <tr key={`${license.id}-conditions`}>
                        <td colSpan={8} style={{ padding: 0, borderTop: 'none' }}>
                          <ConditionsPanel license={license} onShowToast={showToast} />
                        </td>
                      </tr>
                    )}
                  </>
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
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <h3>
              {editingLicense ? 'Editar Licença Ambiental' : 'Nova Licença Ambiental'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Número da Licença *</label>
                  <input
                    className="input-field"
                    placeholder="Ex: LP-001/2024"
                    value={form.license_number}
                    onChange={(e) => setForm((f) => ({ ...f, license_number: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label>Tipo de Licença *</label>
                  <input
                    className="input-field"
                    placeholder="Ex: Licença de Operação"
                    value={form.license_type}
                    onChange={(e) => setForm((f) => ({ ...f, license_type: e.target.value }))}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Órgão Emissor *</label>
                <input
                  className="input-field"
                  placeholder="Ex: CETESB, IBAMA"
                  value={form.issuing_agency}
                  onChange={(e) => setForm((f) => ({ ...f, issuing_agency: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label>Data de Emissão *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.issue_date}
                    onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label>Data de Validade *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.expiry_date}
                    onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>URL do Documento</label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://..."
                  value={form.file_url}
                  onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label>Observações</label>
                <textarea
                  className="input-field"
                  placeholder="Observações adicionais sobre a licença..."
                  rows={3}
                  value={form.observation}
                  onChange={(e) => setForm((f) => ({ ...f, observation: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
            <div className="modal-actions">
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
          title="Excluir Licença Ambiental"
          message={`Tem certeza que deseja excluir a licença "${deleteConfirm.license_number}"? Todas as condicionantes associadas também serão excluídas.`}
          onConfirm={handleDelete}
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
