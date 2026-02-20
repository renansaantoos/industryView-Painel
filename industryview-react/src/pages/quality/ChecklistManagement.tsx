import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { qualityApi } from '../../services';
import type {
  ChecklistTemplate,
  ChecklistTemplateItem,
  ChecklistResponse,
} from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchableSelect from '../../components/common/SearchableSelect';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ClipboardList,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

type ActiveTab = 'templates' | 'responses';

type ItemType = ChecklistTemplateItem['item_type'];

const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  sim_nao: 'Sim / Não',
  conforme_nao_conforme: 'Conforme / Não Conforme',
  texto: 'Texto livre',
  numero: 'Número',
};

interface DraftItem {
  /** Temporary key for list rendering */
  _key: number;
  item_order: number;
  description: string;
  item_type: ItemType;
  is_required: boolean;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

let _draftItemKey = 0;
function nextKey() {
  _draftItemKey += 1;
  return _draftItemKey;
}

export default function ChecklistManagement() {
  const { t } = useTranslation();
  const { setNavBarSelection } = useAppState();

  useEffect(() => {
    setNavBarSelection(-1);
  }, []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('templates');
  const [toast, setToast] = useState<ToastState | null>(null);

  // ── Templates tab state ──────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [tplName, setTplName] = useState('');
  const [tplDescription, setTplDescription] = useState('');
  const [tplCategory, setTplCategory] = useState('');
  const [tplItems, setTplItems] = useState<DraftItem[]>([]);
  const [tplModalLoading, setTplModalLoading] = useState(false);
  const [deleteTemplateConfirm, setDeleteTemplateConfirm] = useState<ChecklistTemplate | null>(
    null,
  );

  // ── Responses tab state ──────────────────────────────────────────────────────
  const [responses, setResponses] = useState<ChecklistResponse[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responsePage, setResponsePage] = useState(1);
  const [responsePerPage, setResponsePerPage] = useState(10);
  const [responseTotalPages, setResponseTotalPages] = useState(1);
  const [responseTotalItems, setResponseTotalItems] = useState(0);
  const [expandedResponseId, setExpandedResponseId] = useState<number | null>(null);
  const [expandedResponseData, setExpandedResponseData] = useState<ChecklistResponse | null>(null);
  const [expandedLoading, setExpandedLoading] = useState(false);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // ── Data loaders ─────────────────────────────────────────────────────────────
  const loadTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    try {
      const data = await qualityApi.listChecklistTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch {
      showToast('Erro ao carregar templates', 'error');
    } finally {
      setTemplatesLoading(false);
    }
  }, [showToast]);

  const loadResponses = useCallback(async () => {
    setResponsesLoading(true);
    try {
      const data = await qualityApi.listChecklistResponses({
        page: responsePage,
        per_page: responsePerPage,
      });
      setResponses(data.items || []);
      setResponseTotalPages(data.pageTotal || 1);
      setResponseTotalItems(data.itemsTotal || 0);
    } catch {
      showToast('Erro ao carregar respostas', 'error');
    } finally {
      setResponsesLoading(false);
    }
  }, [responsePage, responsePerPage, showToast]);

  useEffect(() => {
    if (activeTab === 'templates') loadTemplates();
    if (activeTab === 'responses') loadResponses();
  }, [activeTab, loadTemplates, loadResponses]);

  // ── Template modal helpers ────────────────────────────────────────────────────
  const openCreateModal = () => {
    setEditingTemplate(null);
    setTplName('');
    setTplDescription('');
    setTplCategory('');
    setTplItems([
      {
        _key: nextKey(),
        item_order: 1,
        description: '',
        item_type: 'sim_nao',
        is_required: false,
      },
    ]);
    setShowTemplateModal(true);
  };

  const openEditModal = (template: ChecklistTemplate) => {
    setEditingTemplate(template);
    setTplName(template.name);
    setTplDescription(template.description || '');
    setTplCategory(template.category || '');
    setTplItems(
      (template.items || []).map((item) => ({
        _key: nextKey(),
        item_order: item.item_order,
        description: item.description,
        item_type: item.item_type,
        is_required: item.is_required,
      })),
    );
    setShowTemplateModal(true);
  };

  const addDraftItem = () => {
    setTplItems((prev) => [
      ...prev,
      {
        _key: nextKey(),
        item_order: prev.length + 1,
        description: '',
        item_type: 'sim_nao' as ItemType,
        is_required: false,
      },
    ]);
  };

  const removeDraftItem = (key: number) => {
    setTplItems((prev) =>
      prev
        .filter((i) => i._key !== key)
        .map((i, idx) => ({ ...i, item_order: idx + 1 })),
    );
  };

  const updateDraftItem = (key: number, patch: Partial<Omit<DraftItem, '_key'>>) => {
    setTplItems((prev) =>
      prev.map((i) => (i._key === key ? { ...i, ...patch } : i)),
    );
  };

  const handleSaveTemplate = async () => {
    if (!tplName.trim()) return;
    setTplModalLoading(true);
    try {
      const newItems = tplItems
        .filter((i) => i.description.trim())
        .map((i) => ({
          item_order: i.item_order,
          description: i.description.trim(),
          item_type: i.item_type,
          is_required: i.is_required,
          _action: 'create' as const,
        }));
      if (editingTemplate) {
        const deleteItems = (editingTemplate.items || []).map((i) => ({
          id: i.id,
          _action: 'delete' as const,
        }));
        await qualityApi.updateChecklistTemplate(editingTemplate.id, {
          name: tplName.trim(),
          description: tplDescription.trim() || undefined,
          category: tplCategory.trim() || undefined,
          items: [...deleteItems, ...newItems],
        });
        showToast('Template atualizado com sucesso', 'success');
      } else {
        await qualityApi.createChecklistTemplate({
          name: tplName.trim(),
          description: tplDescription.trim() || undefined,
          category: tplCategory.trim() || undefined,
          items: newItems,
        });
        showToast('Template criado com sucesso', 'success');
      }
      setShowTemplateModal(false);
      loadTemplates();
    } catch {
      showToast('Erro ao salvar template', 'error');
    } finally {
      setTplModalLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTemplateConfirm) return;
    try {
      await qualityApi.deleteChecklistTemplate(deleteTemplateConfirm.id);
      showToast('Template excluído com sucesso', 'success');
      loadTemplates();
    } catch {
      showToast('Erro ao excluir template', 'error');
    }
    setDeleteTemplateConfirm(null);
  };

  // ── Response detail expand ────────────────────────────────────────────────────
  const handleToggleResponseDetail = async (response: ChecklistResponse) => {
    if (expandedResponseId === response.id) {
      setExpandedResponseId(null);
      setExpandedResponseData(null);
      return;
    }
    setExpandedResponseId(response.id);
    setExpandedLoading(true);
    try {
      const data = await qualityApi.getChecklistResponse(response.id);
      setExpandedResponseData(data);
    } catch {
      showToast('Erro ao carregar detalhes da resposta', 'error');
    } finally {
      setExpandedLoading(false);
    }
  };

  // ── Tab button style helper ───────────────────────────────────────────────────
  const tabStyle = (tab: ActiveTab) => ({
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500 as const,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-secondary-text)',
    borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
    marginBottom: '-2px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });

  return (
    <div>
      <PageHeader
        title="Checklists"
        subtitle="Gerencie templates de checklist e visualize as respostas preenchidas"
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

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          marginBottom: '24px',
          borderBottom: '2px solid var(--color-alternate)',
        }}
      >
        <button onClick={() => setActiveTab('templates')} style={tabStyle('templates')}>
          <ClipboardList size={16} />
          Templates
        </button>
        <button onClick={() => setActiveTab('responses')} style={tabStyle('responses')}>
          <CheckSquare size={16} />
          Respostas
        </button>
      </div>

      {/* ── Tab: Templates ────────────────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} />
              Novo Template
            </button>
          </div>

          {templatesLoading ? (
            <LoadingSpinner />
          ) : templates.length === 0 ? (
            <EmptyState
              message="Nenhum template criado ainda."
              action={
                <button className="btn btn-primary" onClick={openCreateModal}>
                  <Plus size={18} />
                  Novo Template
                </button>
              }
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th style={{ width: '80px' }}>Ativo</th>
                    <th style={{ width: '100px' }}>Ações</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {templates.map((tpl) => (
                    <motion.tr key={tpl.id} variants={tableRowVariants}>
                      <td style={{ fontWeight: 500 }}>{tpl.name}</td>
                      <td style={{ color: 'var(--color-secondary-text)' }}>
                        {tpl.description || '-'}
                      </td>
                      <td style={{ color: 'var(--color-secondary-text)' }}>
                        {tpl.category || '-'}
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: tpl.is_active
                              ? 'var(--color-status-04)'
                              : 'var(--color-status-05)',
                            color: tpl.is_active
                              ? 'var(--color-success)'
                              : 'var(--color-error)',
                          }}
                        >
                          {tpl.is_active ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            className="btn btn-icon"
                            title="Editar template"
                            onClick={() => openEditModal(tpl)}
                          >
                            <Edit size={16} color="var(--color-secondary-text)" />
                          </button>
                          <button
                            className="btn btn-icon"
                            title="Excluir template"
                            onClick={() => setDeleteTemplateConfirm(tpl)}
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
        </>
      )}

      {/* ── Tab: Responses ────────────────────────────────────────────────────── */}
      {activeTab === 'responses' && (
        <>
          {responsesLoading ? (
            <LoadingSpinner />
          ) : responses.length === 0 ? (
            <EmptyState message="Nenhuma resposta de checklist encontrada." />
          ) : (
            <>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Template</th>
                      <th>Preenchido por</th>
                      <th>Concluído em</th>
                      <th style={{ width: '80px' }}>Detalhes</th>
                    </tr>
                  </thead>
                  <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                    {responses.map((resp) => (
                      <>
                        <motion.tr key={resp.id} variants={tableRowVariants}>
                          <td style={{ fontWeight: 500 }}>{resp.template_name || '-'}</td>
                          <td style={{ color: 'var(--color-secondary-text)' }}>
                            {resp.filler_name || resp.filled_by}
                          </td>
                          <td style={{ color: 'var(--color-secondary-text)' }}>
                            {resp.completed_at
                              ? new Date(resp.completed_at).toLocaleDateString('pt-BR')
                              : '-'}
                          </td>
                          <td>
                            <button
                              className="btn btn-icon"
                              title={
                                expandedResponseId === resp.id
                                  ? 'Fechar detalhes'
                                  : 'Ver detalhes'
                              }
                              onClick={() => handleToggleResponseDetail(resp)}
                            >
                              {expandedResponseId === resp.id ? (
                                <ChevronUp size={16} color="var(--color-primary)" />
                              ) : (
                                <Eye size={16} color="var(--color-primary)" />
                              )}
                            </button>
                          </td>
                        </motion.tr>

                        {expandedResponseId === resp.id && (
                          <tr key={`${resp.id}-detail`}>
                            <td
                              colSpan={4}
                              style={{
                                padding: '0',
                                background: 'var(--color-tertiary-bg)',
                              }}
                            >
                              {expandedLoading ? (
                                <div style={{ padding: '16px' }}>
                                  <LoadingSpinner />
                                </div>
                              ) : expandedResponseData?.items &&
                                expandedResponseData.items.length > 0 ? (
                                <table
                                  style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    fontSize: '13px',
                                  }}
                                >
                                  <thead>
                                    <tr>
                                      <th
                                        style={{
                                          padding: '8px 16px',
                                          textAlign: 'left',
                                          color: 'var(--color-secondary-text)',
                                          fontWeight: 500,
                                          borderBottom: '1px solid var(--color-alternate)',
                                        }}
                                      >
                                        Item
                                      </th>
                                      <th
                                        style={{
                                          padding: '8px 16px',
                                          textAlign: 'left',
                                          color: 'var(--color-secondary-text)',
                                          fontWeight: 500,
                                          borderBottom: '1px solid var(--color-alternate)',
                                        }}
                                      >
                                        Resposta
                                      </th>
                                      <th
                                        style={{
                                          padding: '8px 16px',
                                          textAlign: 'left',
                                          color: 'var(--color-secondary-text)',
                                          fontWeight: 500,
                                          borderBottom: '1px solid var(--color-alternate)',
                                        }}
                                      >
                                        Observação
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {expandedResponseData.items.map((item) => (
                                      <tr
                                        key={item.id}
                                        style={{
                                          borderBottom: '1px solid var(--color-alternate)',
                                        }}
                                      >
                                        <td style={{ padding: '8px 16px' }}>
                                          {item.item_description || `#${item.checklist_template_items_id}`}
                                        </td>
                                        <td
                                          style={{
                                            padding: '8px 16px',
                                            fontWeight: 500,
                                          }}
                                        >
                                          {item.value}
                                        </td>
                                        <td
                                          style={{
                                            padding: '8px 16px',
                                            color: 'var(--color-secondary-text)',
                                          }}
                                        >
                                          {item.observation || '-'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <div
                                  style={{
                                    padding: '16px',
                                    color: 'var(--color-secondary-text)',
                                    fontSize: '13px',
                                  }}
                                >
                                  Nenhum item registrado nesta resposta.
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </motion.tbody>
                </table>
              </div>

              <div style={{ marginTop: '16px' }}>
                <Pagination
                  currentPage={responsePage}
                  totalPages={responseTotalPages}
                  perPage={responsePerPage}
                  totalItems={responseTotalItems}
                  onPageChange={setResponsePage}
                  onPerPageChange={(pp) => {
                    setResponsePerPage(pp);
                    setResponsePage(1);
                  }}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* ── Modal: Create / Edit Template ─────────────────────────────────────── */}
      {showTemplateModal && (
        <div className="modal-backdrop" onClick={() => setShowTemplateModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', minWidth: '560px', maxWidth: '720px', width: '90vw' }}
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
              <h3>{editingTemplate ? 'Editar Template' : 'Novo Template'}</h3>
              <button
                className="btn btn-icon"
                onClick={() => setShowTemplateModal(false)}
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Basic fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div className="input-group">
                <label>Nome *</label>
                <input
                  className="input-field"
                  placeholder="Nome do template"
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Categoria</label>
                  <input
                    className="input-field"
                    placeholder="Ex.: Segurança"
                    value={tplCategory}
                    onChange={(e) => setTplCategory(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Descrição</label>
                  <input
                    className="input-field"
                    placeholder="Descrição opcional"
                    value={tplDescription}
                    onChange={(e) => setTplDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Items editor */}
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Itens do Checklist</span>
                <button className="btn btn-secondary" onClick={addDraftItem}>
                  <Plus size={14} />
                  Adicionar item
                </button>
              </div>

              {tplItems.length === 0 ? (
                <div
                  style={{
                    padding: '16px',
                    textAlign: 'center',
                    color: 'var(--color-secondary-text)',
                    fontSize: '13px',
                    border: '1px dashed var(--color-alternate)',
                    borderRadius: '8px',
                  }}
                >
                  Nenhum item. Clique em "Adicionar item" para começar.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
                  {tplItems.map((item, idx) => (
                    <div
                      key={item._key}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 1fr 160px 80px 36px',
                        gap: '8px',
                        alignItems: 'center',
                        padding: '8px',
                        background: 'var(--color-tertiary-bg)',
                        borderRadius: '6px',
                      }}
                    >
                      {/* Order */}
                      <input
                        type="number"
                        className="input-field"
                        min={1}
                        value={item.item_order}
                        onChange={(e) =>
                          updateDraftItem(item._key, { item_order: Number(e.target.value) })
                        }
                        style={{ textAlign: 'center', padding: '4px 6px', fontSize: '13px' }}
                        title="Ordem"
                      />

                      {/* Description */}
                      <input
                        className="input-field"
                        placeholder={`Item ${idx + 1}`}
                        value={item.description}
                        onChange={(e) =>
                          updateDraftItem(item._key, { description: e.target.value })
                        }
                        style={{ padding: '4px 8px', fontSize: '13px' }}
                      />

                      {/* Type */}
                      <SearchableSelect
                        options={Object.entries(ITEM_TYPE_LABELS).map(([val, label]) => ({ value: val, label }))}
                        value={item.item_type}
                        onChange={(val) => updateDraftItem(item._key, { item_type: String(val ?? '') as ItemType })}
                        style={{ fontSize: '13px' }}
                      />

                      {/* Required */}
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.is_required}
                          onChange={(e) =>
                            updateDraftItem(item._key, { is_required: e.target.checked })
                          }
                        />
                        Obrig.
                      </label>

                      {/* Remove */}
                      <button
                        className="btn btn-icon"
                        title="Remover item"
                        onClick={() => removeDraftItem(item._key)}
                      >
                        <X size={14} color="var(--color-error)" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setShowTemplateModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveTemplate}
                disabled={tplModalLoading || !tplName.trim()}
              >
                {tplModalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm: Delete Template ──────────────────────────────────────────── */}
      {deleteTemplateConfirm && (
        <ConfirmModal
          title="Excluir Template"
          message={`Tem certeza que deseja excluir o template "${deleteTemplateConfirm.name}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          variant="danger"
          onConfirm={handleDeleteTemplate}
          onCancel={() => setDeleteTemplateConfirm(null)}
        />
      )}
    </div>
  );
}
