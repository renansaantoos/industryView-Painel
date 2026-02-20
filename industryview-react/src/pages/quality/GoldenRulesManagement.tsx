import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { qualityApi } from '../../services';
import type { GoldenRule } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchableSelect from '../../components/common/SearchableSelect';
import { Plus, Edit, Trash2, ShieldAlert, X } from 'lucide-react';

type Severity = 'baixa' | 'media' | 'alta' | 'critica';

const SEVERITY_LABELS: Record<Severity, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  critica: 'Crítica',
};

const SEVERITY_COLORS: Record<Severity, { bg: string; text: string }> = {
  baixa: { bg: '#E8F5E9', text: '#2E7D32' },
  media: { bg: '#FFF3E0', text: '#E65100' },
  alta: { bg: '#FFEBEE', text: '#C62828' },
  critica: { bg: '#F3E5F5', text: '#6A1B9A' },
};

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function GoldenRulesManagement() {
  const { t } = useTranslation();
  const { setNavBarSelection } = useAppState();
  const { user } = useAuthContext();

  useEffect(() => {
    setNavBarSelection(-1);
  }, []);

  const [rules, setRules] = useState<GoldenRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // ── Modal state ───────────────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<GoldenRule | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSeverity, setFormSeverity] = useState<Severity>('media');
  const [formIsActive, setFormIsActive] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);

  // ── Delete state ──────────────────────────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState<GoldenRule | null>(null);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Load rules ────────────────────────────────────────────────────────────────
  const loadRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await qualityApi.listGoldenRules();
      const list = Array.isArray(data) ? data : (data as any)?.items ?? [];
      setRules(list);
    } catch {
      showToast('Erro ao carregar regras de ouro', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // ── Modal helpers ─────────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingRule(null);
    setFormTitle('');
    setFormDescription('');
    setFormSeverity('media');
    setFormIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (rule: GoldenRule) => {
    setEditingRule(rule);
    setFormTitle(rule.title || '');
    setFormDescription(rule.description || '');
    setFormSeverity((rule.severity as Severity) || 'media');
    setFormIsActive(rule.is_active);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formDescription.trim()) return;
    setModalLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        severity: formSeverity,
        is_active: formIsActive,
      };
      if (editingRule) {
        await qualityApi.updateGoldenRule(editingRule.id, payload);
        showToast('Regra de ouro atualizada com sucesso', 'success');
      } else {
        payload.company_id = user?.companyId || 1;
        await qualityApi.createGoldenRule(payload);
        showToast('Regra de ouro criada com sucesso', 'success');
      }
      setShowModal(false);
      loadRules();
    } catch {
      showToast('Erro ao salvar regra de ouro', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await qualityApi.deleteGoldenRule(deleteConfirm.id);
      showToast('Regra de ouro excluída com sucesso', 'success');
      loadRules();
    } catch {
      showToast('Erro ao excluir regra de ouro', 'error');
    }
    setDeleteConfirm(null);
  };

  // ── Severity badge helper ─────────────────────────────────────────────────────
  const renderSeverityBadge = (severity?: string) => {
    const sev = (severity as Severity) || 'media';
    const colors = SEVERITY_COLORS[sev] || SEVERITY_COLORS.media;
    return (
      <span className="badge" style={{ background: colors.bg, color: colors.text }}>
        {SEVERITY_LABELS[sev] || severity || '-'}
      </span>
    );
  };

  return (
    <div>
      <PageHeader
        title="Regras de Ouro"
        subtitle="Gerencie as regras de ouro de segurança e qualidade da empresa"
        breadcrumb="Qualidade"
      />

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 2000,
            padding: '12px 20px',
            borderRadius: '8px',
            background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 0.2s ease',
            maxWidth: '360px',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Action bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} />
          Nova Regra de Ouro
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : rules.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert size={48} />}
          message="Nenhuma regra de ouro cadastrada."
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} />
              Nova Regra de Ouro
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Descrição</th>
                <th style={{ width: '100px' }}>Severidade</th>
                <th style={{ width: '80px' }}>Ativo</th>
                <th style={{ width: '100px' }}>Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {rules.map((rule) => (
                <motion.tr key={rule.id} variants={tableRowVariants}>
                  <td style={{ fontWeight: 500 }}>{rule.title}</td>
                  <td
                    style={{
                      color: 'var(--color-secondary-text)',
                      maxWidth: '360px',
                    }}
                  >
                    <span
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {rule.description}
                    </span>
                  </td>
                  <td>{renderSeverityBadge(rule.severity)}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: rule.is_active
                          ? 'var(--color-status-04)'
                          : 'var(--color-status-05)',
                        color: rule.is_active
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                      }}
                    >
                      {rule.is_active ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-icon"
                        title="Editar regra"
                        onClick={() => openEditModal(rule)}
                      >
                        <Edit size={16} color="var(--color-secondary-text)" />
                      </button>
                      <button
                        className="btn btn-icon"
                        title="Excluir regra"
                        onClick={() => setDeleteConfirm(rule)}
                      >
                        <Trash2 size={16} color="var(--color-error)" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      )}

      {/* ── Modal: Create / Edit Rule ─────────────────────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', minWidth: '440px', maxWidth: '560px' }}
          >
            {/* Modal header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h3>{editingRule ? 'Editar Regra de Ouro' : 'Nova Regra de Ouro'}</h3>
              <button
                className="btn btn-icon"
                onClick={() => setShowModal(false)}
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="input-group">
                <label>Título *</label>
                <input
                  className="input-field"
                  placeholder="Ex.: Uso obrigatório de EPI"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Descrição *</label>
                <textarea
                  className="input-field"
                  placeholder="Descreva a regra de ouro em detalhes..."
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="input-group">
                <label>Severidade</label>
                <SearchableSelect
                  options={Object.entries(SEVERITY_LABELS).map(([value, label]) => ({ value, label }))}
                  value={formSeverity}
                  onChange={(val) => setFormSeverity((val as Severity) ?? 'baixa')}
                />
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                />
                Regra ativa
              </label>
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '20px',
              }}
            >
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={modalLoading || !formTitle.trim() || !formDescription.trim()}
              >
                {modalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm: Delete Rule ──────────────────────────────────────────────── */}
      {deleteConfirm && (
        <ConfirmModal
          title="Excluir Regra de Ouro"
          message={`Tem certeza que deseja excluir a regra "${deleteConfirm.title}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
