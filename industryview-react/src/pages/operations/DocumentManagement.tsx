import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuth } from '../../hooks/useAuth';
import { qualityApi, projectsApi } from '../../services';
import type { Document, PendingDocument } from '../../types';
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

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DOC_STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  em_elaboracao: { bg: 'var(--color-alternate)',   color: 'var(--color-secondary-text)', label: 'Em Elaboração' },
  em_revisao:    { bg: 'var(--color-status-02)',   color: 'var(--color-warning)',         label: 'Em Revisão' },
  aprovado:      { bg: 'var(--color-status-04)',   color: 'var(--color-success)',         label: 'Aprovado' },
  obsoleto:      { bg: 'var(--color-status-01)',   color: 'var(--color-error)',           label: 'Obsoleto' },
};

const DOC_TYPE_OPTIONS = [
  { value: 'procedimento',        label: 'Procedimento' },
  { value: 'instrucao_trabalho',  label: 'Instrucao de Trabalho' },
  { value: 'projeto',             label: 'Projeto' },
  { value: 'certificado',         label: 'Certificado' },
  { value: 'licenca',             label: 'Licenca' },
  { value: 'laudo',               label: 'Laudo' },
  { value: 'contrato',            label: 'Contrato' },
  { value: 'ata',                 label: 'Ata' },
  { value: 'relatorio',           label: 'Relatorio' },
] as const;

const DOC_TYPE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  DOC_TYPE_OPTIONS.map((t) => [t.value, t.label]),
);

const DOC_STATUS_OPTIONS = ['em_elaboracao', 'em_revisao', 'aprovado', 'obsoleto'] as const;

const CATEGORY_OPTIONS = [
  'Seguranca',
  'Qualidade',
  'Meio Ambiente',
  'Saude',
  'Engenharia',
  'Operacional',
  'Administrativo',
  'Outro',
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface DocumentForm {
  projects_id: string;
  document_number: string;
  title: string;
  document_type: string;
  category: string;
  description: string;
  revision: string;
  file_url: string;
  requires_acknowledgment: boolean;
  valid_until: string;
}

const EMPTY_FORM: DocumentForm = {
  projects_id: '',
  document_number: '',
  title: '',
  document_type: '',
  category: '',
  description: '',
  revision: 'Rev 00',
  file_url: '',
  requires_acknowledgment: false,
  valid_until: '',
};

type ActiveTab = 'documents' | 'acknowledgments';

const errorBorder: React.CSSProperties = { border: '1px solid #dc2626' };
const errorText: React.CSSProperties = { color: '#dc2626', fontSize: '12px', marginTop: '2px' };

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DocumentManagement() {
  const { t: _t } = useTranslation();
  const { projectsInfo, setNavBarSelection } = useAppState();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('documents');

  // Projects list (for create dropdown)
  const [projectsList, setProjectsList] = useState<{ id: number; name: string }[]>([]);

  // Documents list state
  const [documents, setDocuments]       = useState<Document[]>([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [perPage, setPerPage]           = useState(10);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalItems, setTotalItems]     = useState(0);

  // Pending acknowledgments state
  const [pendingDocs, setPendingDocs]   = useState<PendingDocument[]>([]);
  const [acksLoading, setAcksLoading]   = useState(false);
  const [ackDocId, setAckDocId]         = useState<number | null>(null);
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
  const [fieldErrors, setFieldErrors]   = useState<Record<string, string>>({});

  // Approve confirm
  const [approveDocId, setApproveDocId]   = useState<number | null>(null);
  const [approveLoading, setApproveLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    setNavBarSelection(24);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await projectsApi.queryAllProjects({ per_page: 100 });
        const list = (data.items || []).map((p: any) => ({ id: Number(p.id), name: p.name }));
        setProjectsList(list);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    })();
  }, []);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, per_page: perPage };
      if (filterType)   params.document_type = filterType;
      if (filterStatus) params.status        = filterStatus;
      if (filterSearch) params.search        = filterSearch;

      const data = await qualityApi.listDocuments(params);
      setDocuments(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, filterType, filterStatus, filterSearch]);

  const loadPendingAcknowledgments = useCallback(async () => {
    if (!user?.id) return;
    setAcksLoading(true);
    try {
      const data = await qualityApi.getPendingAcknowledgments({ users_id: user.id });
      setPendingDocs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load pending acknowledgments:', err);
    } finally {
      setAcksLoading(false);
    }
  }, [user?.id]);

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
    setForm({ ...EMPTY_FORM, projects_id: projectsInfo ? String(projectsInfo.id) : '' });
    setEditDoc(null);
    setModalError('');
    setFieldErrors({});
    setShowModal(true);
  };

  const openEditModal = (doc: Document) => {
    setModalMode('edit');
    setEditDoc(doc);
    setForm({
      projects_id:            doc.projects_id ? String(doc.projects_id) : '',
      document_number:        doc.document_number,
      title:                  doc.title,
      document_type:          doc.document_type  || '',
      category:               doc.category       || '',
      description:            doc.description    || '',
      revision:               doc.revision       || '',
      file_url:               doc.file_url       || '',
      requires_acknowledgment: doc.requires_acknowledgment ?? false,
      valid_until:            doc.valid_until ? doc.valid_until.split('T')[0] : '',
    });
    setModalError('');
    setFieldErrors({});
    setShowModal(true);
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      setModalError('Usuário não autenticado. Faça login novamente.');
      return;
    }

    // Validacao campo a campo
    const errors: Record<string, string> = {};
    if (!form.document_number.trim()) errors.document_number = 'Número do documento é obrigatório';
    if (!form.title.trim())           errors.title           = 'Título é obrigatório';
    if (!form.document_type)          errors.document_type   = 'Tipo de documento é obrigatório';
    if (!form.category)               errors.category        = 'Categoria é obrigatória';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setModalLoading(true);
    setModalError('');
    try {
      if (modalMode === 'create') {
        const payload: Record<string, unknown> = {
          document_number:        form.document_number.trim(),
          title:                  form.title.trim(),
          document_type:          form.document_type.trim(),
          category:               form.category.trim(),
          created_by_user_id:     user?.id,
        };
        if (form.projects_id)         payload.projects_id            = Number(form.projects_id);
        if (form.description.trim())  payload.description            = form.description.trim();
        if (form.revision.trim())     payload.revision               = form.revision.trim();
        if (form.file_url.trim())     payload.file_url               = form.file_url.trim();
        if (form.valid_until)         payload.valid_until            = form.valid_until;
        payload.requires_acknowledgment = form.requires_acknowledgment;

        await qualityApi.createDocument(payload);
      } else if (editDoc) {
        const payload: Record<string, unknown> = {
          title:           form.title.trim(),
          document_type:   form.document_type.trim(),
          category:        form.category.trim(),
        };
        if (form.description.trim())  payload.description            = form.description.trim();
        if (form.file_url.trim())     payload.file_url               = form.file_url.trim();
        if (form.valid_until)         payload.valid_until            = form.valid_until;
        payload.requires_acknowledgment = form.requires_acknowledgment;

        await qualityApi.updateDocument(editDoc.id, payload);
      }

      setShowModal(false);
      loadDocuments();
      showToast(modalMode === 'create' ? 'Documento criado com sucesso.' : 'Documento atualizado com sucesso.');
    } catch (err) {
      console.error('Failed to save document:', err);
      setModalError('Erro ao salvar documento. Tente novamente.');
      showToast(modalMode === 'create' ? 'Erro ao criar documento.' : 'Erro ao atualizar documento.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleApprove = async () => {
    if (approveDocId === null || !user?.id) return;
    setApproveLoading(true);
    try {
      await qualityApi.approveDocument(approveDocId, { approved_by_user_id: user.id });
      setApproveDocId(null);
      loadDocuments();
      showToast('Documento aprovado com sucesso.');
    } catch (err) {
      console.error('Failed to approve document:', err);
      showToast('Erro ao aprovar documento.', 'error');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (ackDocId === null || !user?.id) return;
    setAckLoading(true);
    try {
      await qualityApi.acknowledgeDocument(ackDocId, { users_id: user.id });
      setAckDocId(null);
      loadPendingAcknowledgments();
      showToast('Ciencia confirmada com sucesso.');
    } catch (err) {
      console.error('Failed to acknowledge document:', err);
      showToast('Erro ao confirmar ciencia.', 'error');
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
    <div>
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
            { key: 'acknowledgments',  label: `Pendentes de Ciencia${pendingDocs.length > 0 ? ` (${pendingDocs.length})` : ''}`, icon: <Bell size={14} /> },
          ] as { key: ActiveTab; label: string; icon: React.ReactNode }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
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
                  placeholder="Buscar por titulo ou numero"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
              </div>

              <div className="input-group" style={{ flex: '1 1 180px', minWidth: '160px' }}>
                <SearchableSelect
                  options={DOC_TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
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
                          'N. Documento',
                          'Titulo',
                          'Tipo',
                          'Categoria',
                          'Revisao',
                          'Status',
                          'Acoes',
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
                            {doc.created_by?.name && (
                              <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '2px' }}>
                                por {doc.created_by.name}
                              </div>
                            )}
                          </td>

                          {/* Type */}
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                            {DOC_TYPE_LABEL_MAP[doc.document_type || ''] || doc.document_type || '\u2014'}
                          </td>

                          {/* Category */}
                          <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                            {doc.category || '\u2014'}
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
                              {doc.revision || '\u2014'}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '12px 16px' }}>
                            <StatusBadge status={doc.status} colorMap={DOC_STATUS_MAP} />
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {doc.status !== 'aprovado' && (
                                <button
                                  className="btn btn-icon"
                                  title="Editar"
                                  onClick={() => openEditModal(doc)}
                                >
                                  <Edit2 size={15} />
                                </button>
                              )}

                              {(doc.status === 'em_revisao' || doc.status === 'em_elaboracao') && (
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
          ) : pendingDocs.length === 0 ? (
            <EmptyState
              icon={<ThumbsUp size={48} />}
              message="Nenhum documento pendente de ciencia. Tudo em dia!"
            />
          ) : (
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['N. Documento', 'Título', 'Tipo', 'Criado por', 'Ação'].map((col) => (
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
                  {pendingDocs.map((doc) => (
                    <motion.tr key={doc.id} variants={tableRowVariants} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                        {doc.document_number}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {doc.title}
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
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                        {DOC_TYPE_LABEL_MAP[doc.document_type || ''] || doc.document_type || '\u2014'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                        {doc.created_by?.name || '\u2014'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => setAckDocId(doc.id)}
                        >
                          <CheckCircle size={14} />
                          Confirmar Ciencia
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
            style={{ padding: '24px', width: '600px', maxWidth: '96vw', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
                {modalMode === 'create' ? 'Novo Documento' : 'Editar Documento'}
              </h3>
              <button className="btn btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {modalMode === 'create' && (
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                    Projeto
                  </label>
                  <SearchableSelect
                    options={projectsList.map((p) => ({ value: String(p.id), label: p.name }))}
                    value={form.projects_id || undefined}
                    onChange={(val) => { setForm((f) => ({ ...f, projects_id: String(val ?? '') })); clearFieldError('projects_id'); }}
                    placeholder="Selecionar projeto (opcional)"
                    allowClear
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                    N. do Documento *
                  </label>
                  <input
                    className="input-field"
                    style={fieldErrors.document_number ? errorBorder : undefined}
                    placeholder="Ex: PRO-001"
                    value={form.document_number}
                    onChange={(e) => { setForm((f) => ({ ...f, document_number: e.target.value })); clearFieldError('document_number'); }}
                    disabled={modalMode === 'edit'}
                  />
                  {fieldErrors.document_number && <span style={errorText}>{fieldErrors.document_number}</span>}
                </div>

                <div className="input-group" style={{ flex: '0 0 120px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                    Revisao
                  </label>
                  <input
                    className="input-field"
                    placeholder="Rev 00"
                    value={form.revision}
                    onChange={(e) => setForm((f) => ({ ...f, revision: e.target.value }))}
                    disabled={modalMode === 'edit'}
                  />
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                  Titulo *
                </label>
                <input
                  className="input-field"
                  style={fieldErrors.title ? errorBorder : undefined}
                  placeholder="Titulo completo do documento"
                  value={form.title}
                  onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); clearFieldError('title'); }}
                />
                {fieldErrors.title && <span style={errorText}>{fieldErrors.title}</span>}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                    Tipo de Documento *
                  </label>
                  <SearchableSelect
                    options={DOC_TYPE_OPTIONS.map((t) => ({ value: t.value, label: t.label }))}
                    value={form.document_type || undefined}
                    onChange={(val) => { setForm((f) => ({ ...f, document_type: String(val ?? '') })); clearFieldError('document_type'); }}
                    placeholder="Selecionar tipo"
                    allowClear
                    style={fieldErrors.document_type ? errorBorder : undefined}
                  />
                  {fieldErrors.document_type && <span style={errorText}>{fieldErrors.document_type}</span>}
                </div>

                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                    Categoria *
                  </label>
                  <SearchableSelect
                    options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))}
                    value={form.category || undefined}
                    onChange={(val) => { setForm((f) => ({ ...f, category: String(val ?? '') })); clearFieldError('category'); }}
                    placeholder="Selecionar categoria"
                    allowClear
                    style={fieldErrors.category ? errorBorder : undefined}
                  />
                  {fieldErrors.category && <span style={errorText}>{fieldErrors.category}</span>}
                </div>
              </div>

              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                  Descrição
                </label>
                <textarea
                  className="input-field"
                  placeholder="Descrição do documento..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
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

              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                    Validade
                  </label>
                  <input
                    className="input-field"
                    type="date"
                    value={form.valid_until}
                    onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))}
                  />
                </div>

                <div className="input-group" style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 0' }}>
                    <input
                      type="checkbox"
                      checked={form.requires_acknowledgment}
                      onChange={(e) => setForm((f) => ({ ...f, requires_acknowledgment: e.target.checked }))}
                      style={{ width: '16px', height: '16px' }}
                    />
                    Requer ciencia
                  </label>
                </div>
              </div>
            </div>

            {modalError && (
              <p style={{ color: 'var(--color-error)', fontSize: '13px', marginTop: '12px' }}>{modalError}</p>
            )}

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={modalLoading}
              >
                {modalLoading
                  ? 'Salvando...'
                  : modalMode === 'create'
                    ? 'Criar Documento'
                    : 'Salvar Alteracoes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approve Confirm ──────────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={approveDocId !== null}
        title="Aprovar Documento"
        message="Tem certeza que deseja aprovar este documento? O status sera alterado para Aprovado."
        confirmLabel={approveLoading ? 'Aprovando...' : 'Aprovar'}
        variant="primary"
        onConfirm={handleApprove}
        onCancel={() => setApproveDocId(null)}
      />

      {/* ── Acknowledge Confirm ──────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={ackDocId !== null}
        title="Confirmar Ciencia"
        message="Confirma que leu e compreendeu este documento?"
        confirmLabel={ackLoading ? 'Confirmando...' : 'Confirmar Ciencia'}
        variant="primary"
        onConfirm={handleAcknowledge}
        onCancel={() => setAckDocId(null)}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '24px',
              zIndex: 2000,
              padding: '12px 20px',
              borderRadius: '8px',
              fontWeight: 500,
              fontSize: '14px',
              backgroundColor:
                toast.type === 'success'
                  ? 'var(--color-success, #028F58)'
                  : 'var(--color-error, #C0392B)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
