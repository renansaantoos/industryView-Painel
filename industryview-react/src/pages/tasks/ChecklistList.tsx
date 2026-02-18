import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { qualityApi } from '../../services';
import type { ChecklistTemplate, ChecklistTemplateItem } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Plus, Search, Edit, Trash2, CheckSquare, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChecklistFormState {
  name: string;
  description: string;
  items: string[];
}

const EMPTY_FORM: ChecklistFormState = {
  name: '',
  description: '',
  items: [''],
};

// ---------------------------------------------------------------------------
// Section styles (matches TaskList pattern)
// ---------------------------------------------------------------------------

const sectionStyle: React.CSSProperties = {
  marginBottom: '20px',
  background: 'var(--color-surface)',
  borderRadius: '12px',
  border: '1px solid var(--color-alternate)',
  overflow: 'hidden',
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 20px',
  borderBottom: '1px solid var(--color-alternate)',
  background: 'var(--color-bg)',
};

const sectionIconStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const sectionBodyStyle: React.CSSProperties = {
  padding: '20px',
};

const PER_PAGE_DEFAULT = 10;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChecklistList() {
  const { t } = useTranslation();
  const { setNavBarSelection } = useAppState();
  const { user } = useAuthContext();

  // ------------------------------------------------------------------
  // List state
  // ------------------------------------------------------------------
  const [allChecklists, setAllChecklists] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE_DEFAULT);

  // ------------------------------------------------------------------
  // Modal state
  // ------------------------------------------------------------------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<ChecklistTemplate | null>(null);
  const [form, setForm] = useState<ChecklistFormState>(EMPTY_FORM);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // ------------------------------------------------------------------
  // Bootstrap
  // ------------------------------------------------------------------

  useEffect(() => {
    setNavBarSelection(29);
  }, []);

  const loadChecklists = useCallback(async () => {
    setLoading(true);
    try {
      const result = await qualityApi.listChecklistTemplates();
      // API returns array directly
      const list = Array.isArray(result) ? result : (result as any)?.items ?? [];
      setAllChecklists(list);
    } catch (err) {
      console.error('Failed to load checklist templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChecklists();
  }, [loadChecklists]);

  // ------------------------------------------------------------------
  // Client-side filtering + pagination
  // ------------------------------------------------------------------

  const filtered = allChecklists.filter((cl) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      cl.name.toLowerCase().includes(term) ||
      (cl.description ?? '').toLowerCase().includes(term)
    );
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const pageStart = (page - 1) * perPage;
  const displayedChecklists = filtered.slice(pageStart, pageStart + perPage);

  // Reset to first page when search or perPage changes
  useEffect(() => {
    setPage(1);
  }, [search, perPage]);

  // ------------------------------------------------------------------
  // Create
  // ------------------------------------------------------------------

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setModalLoading(true);
    try {
      const items = form.items
        .map((desc) => desc.trim())
        .filter((desc) => desc.length > 0)
        .map((desc, idx) => ({
          description: desc,
          item_order: idx,
          response_type: 'sim_nao',
          is_critical: false,
          _action: 'create' as const,
        }));
      await qualityApi.createChecklistTemplate({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        company_id: user?.companyId || 1,
        checklist_type: 'geral',
        items,
      });
      setShowCreateModal(false);
      loadChecklists();
    } catch (err) {
      console.error('Failed to create checklist template:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Edit
  // ------------------------------------------------------------------

  const openEditModal = (checklist: ChecklistTemplate) => {
    setEditingChecklist(checklist);
    setForm({
      name: checklist.name,
      description: checklist.description ?? '',
      items: checklist.items?.map((i) => i.description) ?? [''],
    });
  };

  const handleEdit = async () => {
    if (!editingChecklist || !form.name.trim()) return;
    setModalLoading(true);
    try {
      // Build items: delete existing, create new
      const deleteItems = (editingChecklist.items || []).map((i) => ({
        id: i.id,
        _action: 'delete' as const,
      }));
      const createItems = form.items
        .map((desc) => desc.trim())
        .filter((desc) => desc.length > 0)
        .map((desc, idx) => ({
          description: desc,
          item_order: idx,
          response_type: 'sim_nao',
          is_critical: false,
          _action: 'create' as const,
        }));
      await qualityApi.updateChecklistTemplate(editingChecklist.id, {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        items: [...deleteItems, ...createItems],
      });
      setEditingChecklist(null);
      loadChecklists();
    } catch (err) {
      console.error('Failed to update checklist template:', err);
    } finally {
      setModalLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Delete
  // ------------------------------------------------------------------

  const handleDelete = async (id: number) => {
    try {
      await qualityApi.deleteChecklistTemplate(id);
      loadChecklists();
    } catch (err) {
      console.error('Failed to delete checklist template:', err);
    }
    setDeleteConfirm(null);
  };

  // ------------------------------------------------------------------
  // Form helpers
  // ------------------------------------------------------------------

  const updateFormItem = (index: number, value: string) => {
    const updated = [...form.items];
    updated[index] = value;
    setForm((prev) => ({ ...prev, items: updated }));
  };

  const addFormItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, ''] }));
  };

  const removeFormItem = (index: number) => {
    if (form.items.length <= 1) return;
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  // ------------------------------------------------------------------
  // Modal content
  // ------------------------------------------------------------------

  const isModalOpen = showCreateModal || editingChecklist !== null;
  const isEditMode = editingChecklist !== null;
  const modalTitle = isEditMode ? t('tasks.editChecklist') : t('tasks.createChecklist');

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingChecklist(null);
  };

  const handleModalSubmit = isEditMode ? handleEdit : handleCreate;
  const isSubmitDisabled = modalLoading || !form.name.trim();

  // ------------------------------------------------------------------
  // JSX
  // ------------------------------------------------------------------

  return (
    <div>
      <PageHeader
        title={t('tasks.checklistsTitle')}
        subtitle={t('tasks.checklistsSubtitle')}
        actions={
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> {t('tasks.createChecklist')}
          </button>
        }
      />

      {/* Search bar */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '400px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-secondary-text)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : displayedChecklists.length === 0 ? (
        <EmptyState
          message={t('tasks.noChecklists')}
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> {t('tasks.createChecklist')}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('common.name')}</th>
                <th>{t('tasks.description')}</th>
                <th>{t('tasks.checklistItemsCount')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {displayedChecklists.map((checklist) => (
                <motion.tr key={checklist.id} variants={tableRowVariants}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckSquare size={16} color="var(--color-primary)" />
                      <span style={{ fontWeight: 500 }}>{checklist.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)', maxWidth: '300px' }}>
                    {checklist.description || '-'}
                  </td>
                  <td>
                    {checklist.items && checklist.items.length > 0 ? (
                      <span className="badge">
                        {checklist.items.length} {t('tasks.checklistItemsCount')}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-secondary-text)' }}>0 {t('tasks.checklistItemsCount')}</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-icon"
                        title={t('common.edit')}
                        onClick={() => openEditModal(checklist)}
                      >
                        <Edit size={16} color="var(--color-secondary-text)" />
                      </button>
                      <button
                        className="btn btn-icon"
                        title={t('common.delete')}
                        onClick={() => setDeleteConfirm(checklist.id)}
                      >
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '700px', width: '95%', padding: '24px' }}
          >
            <h3 style={{ marginBottom: '20px' }}>{modalTitle}</h3>

            {/* Basic info section */}
            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>
                <div style={{ ...sectionIconStyle, background: 'var(--color-status-01)' }}>
                  <CheckSquare size={18} color="var(--color-primary)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
                    {t('tasks.checklistsTitle')}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                    {t('tasks.checklistsSubtitle')}
                  </span>
                </div>
              </div>
              <div style={sectionBodyStyle}>
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label>{t('common.name')} *</label>
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder={t('tasks.checklistNamePlaceholder')}
                  />
                </div>
                <div className="input-group">
                  <label>{t('tasks.description')}</label>
                  <textarea
                    className="input-field"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder={t('tasks.checklistDescriptionPlaceholder')}
                    style={{ resize: 'vertical', minHeight: '60px' }}
                  />
                </div>
              </div>
            </div>

            {/* Verification items section */}
            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>
                <div style={{ ...sectionIconStyle, background: '#E8F5E9' }}>
                  <CheckSquare size={18} color="#2E7D32" />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
                    {t('tasks.checklistItems')}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                    {t('tasks.checklistItemPlaceholder')}
                  </span>
                </div>
              </div>
              <div style={sectionBodyStyle}>
                {form.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        color: 'var(--color-secondary-text)',
                        minWidth: '22px',
                        textAlign: 'right',
                      }}
                    >
                      {idx + 1}.
                    </span>
                    <input
                      className="input-field"
                      value={item}
                      onChange={(e) => updateFormItem(idx, e.target.value)}
                      placeholder={t('tasks.checklistItemPlaceholder')}
                      style={{ flex: 1 }}
                    />
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFormItem(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-error)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          borderRadius: '4px',
                        }}
                        title={t('common.remove')}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFormItem}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 0',
                    marginTop: '4px',
                  }}
                >
                  <Plus size={14} /> {t('tasks.addChecklistItem')}
                </button>
              </div>
            </div>

            {/* Footer actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button className="btn btn-secondary" onClick={closeModal}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleModalSubmit}
                disabled={isSubmitDisabled}
              >
                {modalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm !== null && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('tasks.deleteChecklistConfirm')}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
