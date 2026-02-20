import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants, modalBackdropVariants, modalContentVariants } from '../../../lib/motion';
import { AnimatePresence } from 'framer-motion';
import { employeesApi, safetyApi } from '../../../services';
import type { EmployeeDocument } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { Plus, Edit, Trash2, FileText, ExternalLink, Upload } from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const PER_PAGE = 10;

const DOCUMENT_TYPES = [
  { value: 'certificado', label: 'Certificado' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'contrato', label: 'Contrato' },
  { value: 'atestado', label: 'Atestado' },
  { value: 'outro', label: 'Outro' },
] as const;

type DocumentTipo = (typeof DOCUMENT_TYPES)[number]['value'];

const TYPE_LABEL: Record<string, string> = {
  certificado: 'Certificado',
  diploma: 'Diploma',
  contrato: 'Contrato',
  atestado: 'Atestado',
  outro: 'Outro',
};

type StatusDisplay = 'ativo' | 'vencido' | 'cancelado';

const STATUS_STYLE: Record<StatusDisplay, { backgroundColor: string; color: string }> = {
  ativo: { backgroundColor: '#F4FEF9', color: '#028F58' },
  vencido: { backgroundColor: '#FDE8E8', color: '#C0392B' },
  cancelado: { backgroundColor: '#F2F2F2', color: '#6B7280' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateInput(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  return dateStr.substring(0, 10);
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function isExpired(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function resolveStatusDisplay(doc: EmployeeDocument): StatusDisplay {
  if (doc.status === 'cancelado') return 'cancelado';
  if (isExpired(doc.data_validade)) return 'vencido';
  return 'ativo';
}

const STATUS_LABEL: Record<StatusDisplay, string> = {
  ativo: 'Ativo',
  vencido: 'Vencido',
  cancelado: 'Cancelado',
};

// ── Form state shape ──────────────────────────────────────────────────────────

interface DocumentFormState {
  tipo: string;
  nome: string;
  descricao: string;
  numero_documento: string;
  data_emissao: string;
  data_validade: string;
  file_url: string;
}

const EMPTY_FORM: DocumentFormState = {
  tipo: 'certificado',
  nome: '',
  descricao: '',
  numero_documento: '',
  data_emissao: '',
  data_validade: '',
  file_url: '',
};

// ── Badge ─────────────────────────────────────────────────────────────────────

function StatusBadge({ doc }: { doc: EmployeeDocument }) {
  const statusDisplay = resolveStatusDisplay(doc);
  const style = STATUS_STYLE[statusDisplay];
  return (
    <span
      style={{
        padding: '4px 8px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 500,
        ...style,
      }}
    >
      {STATUS_LABEL[statusDisplay]}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface DocumentsTabProps {
  usersId: number;
}

export default function DocumentsTab({ usersId }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterTipo, setFilterTipo] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<EmployeeDocument | null>(null);
  const [form, setForm] = useState<DocumentFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState(false);

  const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchDocuments = useCallback(async (page: number, tipo: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await employeesApi.listDocuments({
        users_id: usersId,
        tipo: tipo || undefined,
        page,
        per_page: PER_PAGE,
      });
      setDocuments(response.items);
      setTotalItems(response.itemsTotal);
      setTotalPages(response.pageTotal || 1);
    } catch {
      setError('Erro ao carregar documentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [usersId]);

  useEffect(() => {
    fetchDocuments(currentPage, filterTipo);
  }, [fetchDocuments, currentPage, filterTipo]);

  // Reset to page 1 when filter changes
  const handleTipoFilterChange = (value: string) => {
    setFilterTipo(value);
    setCurrentPage(1);
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingDocument(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setTouched({});
    setIsModalOpen(true);
  };

  const openEditModal = (doc: EmployeeDocument) => {
    setEditingDocument(doc);
    setForm({
      tipo: doc.tipo,
      nome: doc.nome,
      descricao: doc.descricao ?? '',
      numero_documento: doc.numero_documento ?? '',
      data_emissao: toDateInput(doc.data_emissao),
      data_validade: toDateInput(doc.data_validade),
      file_url: doc.file_url ?? '',
    });
    setFormError(null);
    setTouched({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDocument(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setTouched({});
  };

  const updateField = <K extends keyof DocumentFormState>(key: K, value: DocumentFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setTouched({ tipo: true, nome: true });
    const errors: string[] = [];
    if (!form.tipo) errors.push('Tipo');
    if (!form.nome.trim()) errors.push('Nome');
    if (errors.length > 0) {
      setFormError(`Preencha os campos obrigatorios: ${errors.join(', ')}`);
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      if (editingDocument) {
        await employeesApi.updateDocument(editingDocument.id, {
          tipo: form.tipo,
          nome: form.nome.trim(),
          descricao: form.descricao.trim() || undefined,
          numero_documento: form.numero_documento.trim() || undefined,
          data_emissao: form.data_emissao || undefined,
          data_validade: form.data_validade || undefined,
          file_url: form.file_url.trim() || undefined,
        });
      } else {
        await employeesApi.createDocument({
          users_id: usersId,
          tipo: form.tipo,
          nome: form.nome.trim(),
          descricao: form.descricao.trim() || undefined,
          numero_documento: form.numero_documento.trim() || undefined,
          data_emissao: form.data_emissao || undefined,
          data_validade: form.data_validade || undefined,
          file_url: form.file_url.trim() || undefined,
        });
      }
      closeModal();
      fetchDocuments(currentPage, filterTipo);
    } catch {
      setFormError('Erro ao salvar documento. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (deletingDocumentId === null) return;
    try {
      await employeesApi.deleteDocument(deletingDocumentId);
      setDeletingDocumentId(null);
      // If the last item on a page > 1 was deleted, go back one page
      const newPage = documents.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setCurrentPage(newPage);
      fetchDocuments(newPage, filterTipo);
    } catch {
      setDeletingDocumentId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <SearchableSelect
          options={DOCUMENT_TYPES.map(dt => ({ value: dt.value, label: dt.label }))}
          value={filterTipo || undefined}
          onChange={v => handleTipoFilterChange(v != null ? String(v) : '')}
          placeholder="Todos os tipos"
          allowClear
          style={{ maxWidth: 200 }}
        />

        <button className="btn btn-primary" onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} />
          Novo Documento
        </button>
      </div>

      {/* Content area */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div
          style={{
            padding: '32px',
            textAlign: 'center',
            color: 'var(--color-danger)',
            fontSize: 14,
          }}
        >
          {error}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} />}
          message="Nenhum documento encontrado."
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              Adicionar documento
            </button>
          }
        />
      ) : (
        <>
          <div className="table-container">
            <motion.table
              style={{ width: '100%', borderCollapse: 'collapse' }}
              variants={staggerParent}
              initial="initial"
              animate="animate"
            >
              <thead>
                <tr>
                  {['Tipo', 'Nome', 'Numero', 'Emissao', 'Validade', 'Status', 'Acoes'].map(col => (
                    <th
                      key={col}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--color-secondary-text)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '1px solid var(--color-border)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <motion.tr
                    key={doc.id}
                    variants={tableRowVariants}
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                  >
                    <td style={{ padding: '10px 12px', fontSize: 14 }}>
                      {TYPE_LABEL[doc.tipo] ?? doc.tipo}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {doc.nome}
                        {doc.file_url && (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--color-primary)', lineHeight: 1 }}
                            title="Abrir arquivo"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 14, color: 'var(--color-secondary-text)' }}>
                      {doc.numero_documento || '-'}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 14 }}>
                      {formatDate(doc.data_emissao)}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 14 }}>
                      {formatDate(doc.data_validade)}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <StatusBadge doc={doc} />
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-icon"
                          title="Editar"
                          onClick={() => openEditModal(doc)}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          className="btn btn-icon"
                          title="Excluir"
                          onClick={() => setDeletingDocumentId(doc.id)}
                          style={{ color: 'var(--color-danger)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop: 16 }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                perPage={PER_PAGE}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Create / Edit modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="modal-backdrop"
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={closeModal}
            style={{ animation: 'none' }}
          >
            <motion.div
              className="modal-content"
              variants={modalContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 520, padding: 28 }}
            >
              {/* Modal header */}
              <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>
                {editingDocument ? 'Editar Documento' : 'Novo Documento'}
              </h3>

              {/* Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Tipo */}
                <div className="input-group">
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>
                    Tipo <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <SearchableSelect
                    options={DOCUMENT_TYPES.map(dt => ({ value: dt.value, label: dt.label }))}
                    value={form.tipo || undefined}
                    onChange={v => updateField('tipo', (v != null ? String(v) : '') as DocumentTipo)}
                    placeholder="Selecione o tipo"
                    style={{ ...(touched.tipo && !form.tipo ? { borderColor: '#C0392B' } : {}) }}
                  />
                  {touched.tipo && !form.tipo && (
                    <span style={{ color: '#C0392B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                      Campo obrigatorio
                    </span>
                  )}
                </div>

                {/* Nome */}
                <div className="input-group">
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>
                    Nome <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Nome do documento"
                    value={form.nome}
                    onChange={e => updateField('nome', e.target.value)}
                    style={{ ...(touched.nome && !form.nome.trim() ? { borderColor: '#C0392B' } : {}) }}
                  />
                  {touched.nome && !form.nome.trim() && (
                    <span style={{ color: '#C0392B', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                      Campo obrigatorio
                    </span>
                  )}
                </div>

                {/* Descricao */}
                <div className="input-group">
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>
                    Descricao
                  </label>
                  <textarea
                    className="input-field"
                    placeholder="Descricao opcional"
                    rows={3}
                    value={form.descricao}
                    onChange={e => updateField('descricao', e.target.value)}
                    style={{ resize: 'vertical', minHeight: 72 }}
                  />
                </div>

                {/* Numero do documento */}
                <div className="input-group">
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>
                    Numero do documento
                  </label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Ex: 12345-AB"
                    value={form.numero_documento}
                    onChange={e => updateField('numero_documento', e.target.value)}
                  />
                </div>

                {/* Data de emissao / Data de validade — side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="input-group">
                    <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>
                      Data de emissao
                    </label>
                    <input
                      className="input-field"
                      type="date"
                      value={form.data_emissao}
                      onChange={e => updateField('data_emissao', e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>
                      Data de validade
                    </label>
                    <input
                      className="input-field"
                      type="date"
                      value={form.data_validade}
                      onChange={e => updateField('data_validade', e.target.value)}
                    />
                  </div>
                </div>

                {/* Documento (URL ou Upload) */}
                <div className="input-group">
                  <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>
                    Documento
                  </label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      className="input-field"
                      type="text"
                      placeholder="https://... ou faca upload"
                      value={form.file_url}
                      onChange={e => updateField('file_url', e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        background: 'var(--color-secondary-bg, #f3f4f6)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 6,
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--color-primary-text)',
                        whiteSpace: 'nowrap',
                        opacity: uploading ? 0.6 : 1,
                      }}
                    >
                      <Upload size={15} />
                      {uploading ? 'Enviando...' : 'Upload'}
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                        disabled={uploading}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploading(true);
                          try {
                            const result = await safetyApi.uploadFile(file);
                            updateField('file_url', result.file_url);
                          } catch {
                            setFormError('Erro ao fazer upload do arquivo. Tente novamente.');
                          } finally {
                            setUploading(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                  {form.file_url && (
                    <div style={{ marginTop: 6, fontSize: 12, color: 'var(--color-secondary-text)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ExternalLink size={12} />
                      <a href={form.file_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                        {form.file_url.length > 50 ? form.file_url.substring(0, 50) + '...' : form.file_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Form error */}
              {formError && (
                <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-danger)' }}>
                  {formError}
                </p>
              )}

              {/* Modal actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving || uploading}>
                  {saving ? 'Salvando...' : editingDocument ? 'Salvar alteracoes' : 'Criar documento'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deletingDocumentId !== null}
        title="Excluir documento"
        message="Tem certeza que deseja excluir este documento? Esta acao nao pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingDocumentId(null)}
      />
    </div>
  );
}
