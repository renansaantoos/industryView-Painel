import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { qualityApi } from '../../services';
import type { Document, DocumentAcknowledgment } from '../../types';
import SearchableSelect from '../../components/common/SearchableSelect';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Plus,
  Search,
  FileText,
  Edit2,
  CheckCircle,
  Bell,
  X,
  Filter,
  ExternalLink,
  ThumbsUp,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const DOC_STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  rascunho:   { bg: 'var(--color-alternate)',   color: 'var(--color-secondary-text)', label: 'Rascunho' },
  em_revisao: { bg: 'var(--color-status-02)',   color: 'var(--color-warning)',         label: 'Em Revisão' },
  aprovado:   { bg: 'var(--color-status-04)',   color: 'var(--color-success)',         label: 'Aprovado' },
  obsoleto:   { bg: 'var(--color-status-01)',   color: 'var(--color-error)',           label: 'Obsoleto' },
};

const DOC_TYPE_OPTIONS = [
  'Procedimento',
  'Instrução de Trabalho',
  'Formulário',
  'Manual',
  'Especificação',
  'Norma',
  'Relatório',
  'Outro',
] as const;

const DOC_STATUS_OPTIONS = ['rascunho', 'em_revisao', 'aprovado', 'obsoleto'] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface DocumentForm {
  document_number: string;
  title: string;
  document_type: string;
  category: string;
  revision: string;
  file_url: string;
}

const EMPTY_FORM: DocumentForm = {
  document_number: '',
  title: '',
  document_type: '',
  category: '',
  revision: 'A',
  file_url: '',
};

type ActiveTab = 'documents' | 'acknowledgments';

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DocumentManagement() {
  const { t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();

  const [activeTab, setActiveTab] = useState<ActiveTab>('documents');

  // Documents list state
  const [documents, setDocuments]       = useState<Document[]>([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [perPage, setPerPage]           = useState(10);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalItems, setTotalItems]     = useState(0);

  // Pending acknowledgments state
  const [pendingAcks, setPendingAcks]   = useState<DocumentAcknowledgment[]>([]);
  const [acksLoading, setAcksLoading]   = useState(false);
  const [ackId, setAckId]               = useState<number | null>(null);
  const [ackLoading, setAckLoading]     = useState(false);

  // Filters
  const [filterType,   setFilterType]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // Create / edit modal
  const [modalMode, setModalMode]       = useState<'create' | 'edit'>('create');
  const [showModal, setShowModal]       = useState(false);
  const [editDoc, setEditDoc]           = useState<Document | null>(null);
  const [form, setForm]                 = useState<DocumentForm>(EMPTY_FORM);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError]     = useState('');

  // Approve confirm
  const [approveDocId, setApproveDocId]   = useState<number | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);

  useEffect(() => {
    setNavBarSelection(24);
  }, []);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, per_page: perPage };
      if (projectsInfo)   params.projects_id   = projectsInfo.id;
      if (filterType)     params.document_type = filterType;
      if (filterStatus)   params.status        = filterStatus;
      if (filterSearch)   params.search        = filterSearch;

      const data = await qualityApi.listDocuments(params);
      setDocuments(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, perPage, filterType, filterStatus, filterSearch]);

  const loadPendingAcknowledgments = useCallback(async () => {
    setAcksLoading(true);
    try {
      const data = await qualityApi.getPendingAcknowledgments();
      setPendingAcks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load pending acknowledgments:', err);
    } finally {
      setAcksLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (activeTab === 'acknowledgments') {
      loadPendingAcknowledgments();
    }
  }, [activeTab, loadPendingAcknowledgments]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [filterType, filterStatus, filterSearch]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setModalMode('create');
    setForm(EMPTY_FORM);
    setEditDoc(null);
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (doc: Document) => {
    setModalMode('edit');
    setEditDoc(doc);
    setForm({
      document_number: doc.document_number,
      title:           doc.title,
      document_type:   doc.document_type  || '',
      category:        doc.category       || '',
      revision:        doc.revision       || '',
      file_url:        doc.file_url       || '',
    });
    setModalError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.document_number.trim() || !form.title.trim()) {
      setModalError('Número e título do documento são obrigatórios.');
      return;
    }
    setModalLoading(true);
    setModalError('');
    try {
      const payload: Record<string, unknown> = {
        document_number: form.document_number.trim(),
        title:           form.title.trim(),
      };
      if (projectsInfo)              payload.projects_id   = projectsInfo.id;
      if (form.document_type.trim()) payload.document_type = form.document_type.trim();
      if (form.category.trim())      payload.category      = form.category.trim();
      if (form.revision.trim())      payload.revision      = form.revision.trim();
      if (form.file_url.trim())      payload.file_url      = form.file_url.trim();

      if (modalMode === 'create') {
        await qualityApi.createDocument(payload);
      } else if (editDoc) {
        await qualityApi.updateDocument(editDoc.id, payload);
      }

      setShowModal(false);
      loadDocuments();
    } catch (err) {
      console.error('Failed to save document:', err);
      setModalError('Erro ao salvar documento. Tente novamente.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleApprove = async () => {
    if (approveDocId === null) return;
    setApproveLoading(true);
    try {
      await qualityApi.approveDocument(approveDocId);
      setApproveDocId(null);
      loadDocuments();
    } catch (err) {
      console.error('Failed to approve document:', err);
    } finally {
      setApproveLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (ackId === null) return;
    setAckLoading(true);
    try {
      await qualityApi.acknowledgeDocument(ackId);
      setAckId(null);
      loadPendingAcknowledgments();
    } catch (err) {
      console.error('Failed to acknowledge document:', err);
    } finally {
      setAckLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterType('');
    setFilterStatus('');
    setFilterSearch('');
  };

  const hasActiveFilters = filterType || filterStatus || filterSearch;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <PageHeader
        title="Gestão de Documentos"
        subtitle="Controle o ciclo de vida de documentos, revisões e aprovações."
        breadcrumb="Operações"
        actions={
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            Novo Documento
          </button>
        }
      />
      <ProjectFilterDropdown />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--color-alternate)', marginBottom: '24px', gap: '4px' }}>
        {(
          [
            { key: 'documents',        label: 'Documentos',               icon: <FileText size={14} /> },
            { key: 'acknowledgments',  label: `Pendentes de Ciência${pendingAcks.length > 0 ? ` (${pendingAcks.length})` : ''}`, icon: <Bell size={14} /> },
          ] as { key: ActiveTab; label: string; icon: React.ReactNode }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: activeTab === tab.key ? 600 : 400,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key
                ? '2px solid var(--color-primary)'
                : '2px solid transparent',
              marginBottom: '-2px',
              cursor: 'pointer',
              color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-secondary-text)',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Documents Tab ────────────────────────────────────────────────────── */}
      {activeTab === 'documents' && (
        <>
          {/* Filters */}
          <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-secondary-text)', fontSize: '13px', fontWeight: 500 }}>
                <Filter size={14} />
                Filtros
              </div>

              <div className="input-group" style={{ flex: '1 1 200px', minWidth: '180px', position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-text)', pointerEvents: 'none' }} />
                <input
                  className="input-field"
                  placeholder="Buscar por título ou número"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
              </div>

              <div className="input-group" style={{ flex: '1 1 180px', minWidth: '160px' }}>
                <SearchableSelect
                  options={DOC_TYPE_OPTIONS.map((t) => ({ value: t, label: t }))}
                  value={filterType || undefined}
                  onChange={(val) => setFilterType(String(val ?? ''))}
                  placeholder="Todos os tipos"
                  allowClear
                  style={{ minWidth: '160px' }}
                />
              </div>

              <div className="input-group" style={{ flex: '1 1 160px', minWidth: '140px' }}>
                <SearchableSelect
                  options={DOC_STATUS_OPTIONS.map((s) => ({ value: s, label: DOC_STATUS_MAP[s]?.label || s }))}
                  value={filterStatus || undefined}
                  onChange={(val) => setFilterStatus(String(val ?? ''))}
                  placeholder="Todos os status"
                  allowClear
                  style={{ minWidth: '140px' }}
                />
              </div>

              {hasActiveFilters && (
                <button
                  className="btn btn-secondary"
                  onClick={clearFilters}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                >
                  <X size={14} />
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <LoadingSpinner />
            ) : documents.length === 0 ? (
              <EmptyState
                icon={<FileText size={48} />}
                message="Nenhum documento encontrado."
                action={
                  <button className="btn btn-primary" onClick={openCreateModal}>
                    <Plus size={16} />
                    Criar Documento
                  </button>
                }
              />
            ) : (
              <>
                <div className="table-container">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                        {[
                          'Nº Documento',
                          'Título',
                          'Tipo',
                          'Categoria',
                          'Revisão',
                          'Status',
                          'Ações',
                        ].map((col) => (
                          <th
                            key={col}
                            style={{
                              padding: '12px 16px',
                              textAlign: 'left',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: 'var(--color-secondary-text)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                      {documents.map((doc) => (
                        <motion.tr
                          variants={tableRowVariants}
                          key={doc.id}
                          style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.15s' }}
                        >
                          {/* Doc Number */}
                          <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                            {doc.document_number}
                          </td>

                          {/* Title */}
                          <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500, maxWidth: '260px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.title}>
                                {doc.title}
                              </span>
                              {doc.file_url && (
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: 'var(--color-secondary-text)', flexShrink: 0 }}
                                  title="Abrir arquivo"
                                >
                                  <ExternalLink size={13} />
                                </a>
                              )}
                            </div>
                            {doc.creator_name && (
                              <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '2px' }}>
                                por {doc.creator_name}
                              </div>
                            )}
                          </td>

                          {/* Type */}
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                            {doc.document_type || '—'}
                          </td>

                          {/* Category */}
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                            {doc.category || '—'}
                          </td>

                          {/* Revision */}
                          <td style={{ padding: '12px 16px', fontSize: '13px', textAlign: 'center' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                minWidth: '28px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'var(--color-alternate)',
                                fontWeight: 600,
                                fontSize: '12px',
                              }}
                            >
                              {doc.revision || '—'}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '12px 16px' }}>
                            <StatusBadge status={doc.status} colorMap={DOC_STATUS_MAP} />
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <button
                                className="btn btn-icon"
                                title="Editar"
                                onClick={() => openEditModal(doc)}
                              >
                                <Edit2 size={15} />
                              </button>

                              {doc.status === 'em_revisao' && (
                                <button
                                  className="btn btn-secondary"
                                  style={{ fontSize: '12px', padding: '4px 10px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  onClick={() => setApproveDocId(doc.id)}
                                >
                                  <CheckCircle size={13} />
                                  Aprovar
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>

                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    perPage={perPage}
                    totalItems={totalItems}
                    onPageChange={setPage}
                    onPerPageChange={(v) => { setPerPage(v); setPage(1); }}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── Acknowledgments Tab ──────────────────────────────────────────────── */}
      {activeTab === 'acknowledgments' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {acksLoading ? (
            <LoadingSpinner />
          ) : pendingAcks.length === 0 ? (
            <EmptyState
              icon={<ThumbsUp size={48} />}
              message="Nenhum documento pendente de ciência. Tudo em dia!"
            />
          ) : (
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['Documento', 'Usuário', 'Ação'].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--color-secondary-text)',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {pendingAcks.map((ack) => (
                    <motion.tr key={ack.id} variants={tableRowVariants} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500 }}>
                        {ack.document_title || `Documento #${ack.documents_id}`}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                        {ack.user_name || `Usuário #${ack.users_id}`}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setAckId(ack.documents_id)}
                        >
                          <CheckCircle size={14} />
                          Confirmar Ciência
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Create / Edit Document Modal ─────────────────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '28px', width: '540px', maxWidth: '96vw' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
                {modalMode === 'create' ? 'Novo Documento' : 'Editar Documento'}
              </h2>
              <button className="btn btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                    Nº do Documento *
                  </label>
                  <input
                    className="input-field"
                    placeholder="Ex: PRO-001"
                    value={form.document_number}
                    onChange={(e) => setForm((f) => ({ ...f, document_number: e.target.value }))}
                  />
                </div>

                <div className="input-group" style={{ flex: '0 0 100px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                    Revisão
                  </label>
                  <input
                    className="input-field"
                    placeholder="A"
                    value={form.revision}
                    onChange={(e) => setForm((f) => ({ ...f, revision: e.target.value }))}
                  />
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                  Título *
                </label>
                <input
                  className="input-field"
                  placeholder="Título completo do documento"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                    Tipo de Documento
                  </label>
                  <SearchableSelect
                    options={DOC_TYPE_OPTIONS.map((t) => ({ value: t, label: t }))}
                    value={form.document_type || undefined}
                    onChange={(val) => setForm((f) => ({ ...f, document_type: String(val ?? '') }))}
                    placeholder="Selecionar tipo"
                    allowClear
                  />
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                    Categoria
                  </label>
                  <input
                    className="input-field"
                    placeholder="Ex: Segurança, Qualidade..."
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  />
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                  URL do Arquivo
                </label>
                <input
                  className="input-field"
                  placeholder="https://..."
                  value={form.file_url}
                  onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
                />
              </div>
            </div>

            {modalError && (
              <p style={{ color: 'var(--color-error)', fontSize: '13px', marginTop: '12px' }}>{modalError}</p>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={modalLoading || !form.document_number.trim() || !form.title.trim()}
              >
                {modalLoading
                  ? 'Salvando...'
                  : modalMode === 'create'
                    ? 'Criar Documento'
                    : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve Confirm ──────────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={approveDocId !== null}
        title="Aprovar Documento"
        message="Tem certeza que deseja aprovar este documento? O status será alterado para Aprovado."
        confirmLabel={approveLoading ? 'Aprovando...' : 'Aprovar'}
        variant="primary"
        onConfirm={handleApprove}
        onCancel={() => setApproveDocId(null)}
      />

      {/* ── Acknowledge Confirm ──────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={ackId !== null}
        title="Confirmar Ciência"
        message="Confirma que leu e compreendeu este documento?"
        confirmLabel={ackLoading ? 'Confirmando...' : 'Confirmar Ciência'}
        variant="primary"
        onConfirm={handleAcknowledge}
        onCancel={() => setAckId(null)}
      />
    </div>
  );
}
