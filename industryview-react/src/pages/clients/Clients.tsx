import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { clientsApi } from '../../services';
import type { Client } from '../../services/api/clients';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { ClientFormModal, maskCNPJ } from '../../components/clients/ClientFormModal';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building2,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ClientUnit } from '../../services/api/clients';

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalize(text: string | null | undefined): string {
  if (!text) return '';
  return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function fuzzyMatch(target: string | null | undefined, query: string): boolean {
  if (!target) return false;
  if (!query) return true;
  return normalize(target).includes(normalize(query));
}

function unmask(value: string): string {
  return value.replace(/\D/g, '');
}

function applyMask(value: string, mask: string): string {
  const digits = unmask(value);
  let result = '';
  let digitIndex = 0;
  for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
    if (mask[i] === '9') {
      result += digits[digitIndex++];
    } else {
      result += mask[i];
    }
  }
  return result;
}

function maskPhone(value: string): string {
  const digits = unmask(value);
  if (digits.length <= 10) return applyMask(value, '(99) 9999-9999');
  return applyMask(value, '(99) 99999-9999');
}

// Códigos de país ordenados do mais longo para o mais curto (para match correto)
const PHONE_COUNTRY_CODES = ['+598', '+595', '+591', '+44', '+49', '+33', '+34', '+39', '+54', '+56', '+57', '+51', '+58', '+86', '+81', '+55', '+1'];

function formatPhoneWithPrefix(raw: string): string {
  if (!raw) return '';
  const allDigits = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) {
    for (const code of PHONE_COUNTRY_CODES) {
      const codeDigits = code.replace(/\D/g, '');
      if (allDigits.startsWith(codeDigits)) {
        const localDigits = allDigits.slice(codeDigits.length);
        return `${code} ${maskPhone(localDigits)}`;
      }
    }
  }
  return maskPhone(raw);
}

// ── Toast ─────────────────────────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Clients() {
  const { t } = useTranslation();
  const { setNavBarSelection } = useAppState();

  // List state
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Expanded units rows
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set());

  function toggleUnits(clientId: number) {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      next.has(clientId) ? next.delete(clientId) : next.add(clientId);
      return next;
    });
  }

  // Toast
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNavBarSelection(32);
  }, []);

  // ── Toast helpers ──────────────────────────────────────────────────────────

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Data loading ───────────────────────────────────────────────────────────

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientsApi.listClients({
        page,
        per_page: perPage,
        search: search || undefined,
      });
      setClients(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load clients:', err);
      showToast(t('common.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, showToast, t]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // ── Client-side filtered list ──────────────────────────────────────────────

  const filteredClients = clients.filter((client) => {
    if (!search) return true;
    return (
      fuzzyMatch(client.legal_name, search) ||
      fuzzyMatch(client.trade_name, search) ||
      fuzzyMatch(client.cnpj, search) ||
      fuzzyMatch(client.billing_city, search) ||
      fuzzyMatch(client.purchasing_contact_name, search) ||
      fuzzyMatch(client.industry_segment, search)
    );
  });

  // ── Modal helpers ──────────────────────────────────────────────────────────

  function openCreateModal() {
    setEditingClient(null);
    setShowModal(true);
  }

  function openEditModal(client: Client) {
    setEditingClient(client);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingClient(null);
  }

  function handleModalSave(_savedClient: Client) {
    const isEdit = editingClient !== null;
    showToast(isEdit ? t('clients.updateSuccess') : t('clients.createSuccess'));
    closeModal();
    loadClients();
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete(id: number) {
    try {
      await clientsApi.deleteClient(id);
      showToast(t('clients.deleteSuccess'));
      loadClients();
    } catch (err) {
      console.error('Failed to delete client:', err);
      showToast(t('common.errorSaving'), 'error');
    } finally {
      setDeleteConfirm(null);
    }
  }

  // ── Industry segment label lookup ──────────────────────────────────────────

  const SEGMENT_OPTIONS = [
    { value: 'alimentar', label: t('clients.segments.food') },
    { value: 'metalmecanico', label: t('clients.segments.metalworking') },
    { value: 'quimico', label: t('clients.segments.chemical') },
    { value: 'farmaceutico', label: t('clients.segments.pharmaceutical') },
    { value: 'automotivo', label: t('clients.segments.automotive') },
    { value: 'textil', label: t('clients.segments.textile') },
    { value: 'construcao_civil', label: t('clients.segments.construction') },
    { value: 'energia', label: t('clients.segments.energy') },
    { value: 'mineracao', label: t('clients.segments.mining') },
    { value: 'outro', label: t('clients.segments.other') },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title={t('clients.title')}
        subtitle={t('clients.subtitle')}
        actions={
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={18} /> {t('clients.addClient')}
          </button>
        }
      />

      {/* Search bar */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
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
            placeholder={t('clients.searchPlaceholder')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredClients.length === 0 ? (
        <EmptyState
          message={t('clients.noClients')}
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={18} /> {t('clients.addClient')}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('clients.legalName')} / {t('clients.tradeName')}</th>
                <th>{t('clients.cnpj')}</th>
                <th>{t('clients.industrySegment')}</th>
                <th>{t('clients.city')} / {t('clients.state')}</th>
                <th>{t('clients.purchasingContact')}</th>
                <th>Matriz / Filiais</th>
                <th>{t('clients.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {filteredClients.map((client) => (
                <React.Fragment key={client.id}>
                <motion.tr variants={tableRowVariants}>
                  {/* Name */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={18} color="var(--color-primary)" />
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {client.trade_name || client.legal_name || '-'}
                        </div>
                        {client.trade_name && client.legal_name && (
                          <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                            {client.legal_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* CNPJ — display with mask */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="var(--color-secondary-text)" />
                      {client.cnpj ? maskCNPJ(client.cnpj) : '-'}
                    </div>
                  </td>
                  {/* Segment */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={14} color="var(--color-secondary-text)" />
                      {client.industry_segment
                        ? SEGMENT_OPTIONS.find((s) => s.value === client.industry_segment)?.label ||
                          client.industry_segment
                        : '-'}
                    </div>
                  </td>
                  {/* City / State */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--color-secondary-text)" />
                      {[client.billing_city, client.billing_state].filter(Boolean).join(' / ') || '-'}
                    </div>
                  </td>
                  {/* Purchasing contact */}
                  <td>
                    <div>
                      <div>{client.purchasing_contact_name || '-'}</div>
                      {client.purchasing_contact_phone && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--color-secondary-text)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Phone size={11} />
                          {formatPhoneWithPrefix(client.purchasing_contact_phone)}
                        </div>
                      )}
                    </div>
                  </td>
                  {/* Matriz / Filiais — botão expansível */}
                  <td>
                    {(() => {
                      const units: ClientUnit[] = client.units || [];
                      if (units.length === 0) {
                        return <span style={{ color: 'var(--color-secondary-text)' }}>—</span>;
                      }
                      const isOpen = expandedUnits.has(client.id);
                      const nMatriz = units.filter((u) => u.unit_type === 'MATRIZ').length;
                      const nFilial = units.filter((u) => u.unit_type === 'FILIAL').length;
                      return (
                        <button
                          type="button"
                          onClick={() => toggleUnits(client.id)}
                          title="M = Matriz · F = Filial"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--color-border)',
                            background: isOpen ? 'var(--color-primary)' : 'transparent',
                            color: isOpen ? '#fff' : 'var(--color-text)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            transition: 'all 0.15s',
                          }}
                        >
                          {nMatriz > 0 && (
                            <span style={{
                              fontSize: '0.68rem', fontWeight: 700, padding: '1px 5px',
                              borderRadius: '3px',
                              background: isOpen ? 'rgba(255,255,255,0.25)' : 'var(--color-primary)',
                              color: '#fff',
                            }}>
                              {nMatriz}M
                            </span>
                          )}
                          {nFilial > 0 && (
                            <span style={{
                              fontSize: '0.68rem', fontWeight: 700, padding: '1px 5px',
                              borderRadius: '3px',
                              background: isOpen ? 'rgba(255,255,255,0.25)' : 'transparent',
                              color: isOpen ? '#fff' : 'var(--color-primary)',
                              border: isOpen ? 'none' : '1px solid var(--color-primary)',
                            }}>
                              {nFilial}F
                            </span>
                          )}
                          {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      );
                    })()}
                  </td>

                  {/* Actions */}
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-icon"
                        title={t('common.edit')}
                        onClick={() => openEditModal(client)}
                      >
                        <Edit size={16} color="var(--color-secondary-text)" />
                      </button>
                      <button
                        className="btn btn-icon"
                        title={t('common.delete')}
                        onClick={() => setDeleteConfirm(client.id)}
                      >
                        <Trash2 size={16} color="var(--color-error)" />
                      </button>
                    </div>
                  </td>
                </motion.tr>

                {/* Linha expansível de unidades */}
                <AnimatePresence>
                  {expandedUnits.has(client.id) && (client.units?.length ?? 0) > 0 && (
                    <motion.tr
                      key={`units-${client.id}`}
                      initial={{ opacity: 0, scaleY: 0.8 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0.8 }}
                      style={{ transformOrigin: 'top' }}
                    >
                      <td colSpan={7} style={{ padding: '0', background: 'var(--color-surface, #f8f9fa)', borderBottom: '2px solid var(--color-primary)' }}>
                        <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                          {client.units!.map((u) => (
                            <div key={u.id} style={{
                              borderRadius: '8px',
                              border: '1px solid var(--color-border)',
                              padding: '12px 14px',
                              background: 'var(--color-bg, #fff)',
                            }}>
                              {/* Header do card */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{
                                  fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
                                  borderRadius: '4px', letterSpacing: '0.05em',
                                  background: u.unit_type === 'MATRIZ' ? 'var(--color-primary)' : 'transparent',
                                  color: u.unit_type === 'MATRIZ' ? '#fff' : 'var(--color-primary)',
                                  border: u.unit_type === 'MATRIZ' ? 'none' : '1px solid var(--color-primary)',
                                }}>
                                  {u.unit_type}
                                </span>
                                {u.label && (
                                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{u.label}</span>
                                )}
                              </div>

                              {/* CNPJ */}
                              {u.cnpj && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--color-secondary-text)', marginBottom: '4px' }}>
                                  <FileText size={12} />
                                  {maskCNPJ(u.cnpj)}
                                </div>
                              )}

                              {/* Endereço */}
                              {(u.address || u.city) && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.82rem', color: 'var(--color-secondary-text)' }}>
                                  <MapPin size={12} style={{ marginTop: '2px', flexShrink: 0 }} />
                                  <span>
                                    {[
                                      u.address && u.number ? `${u.address}, ${u.number}` : u.address,
                                      u.complement,
                                      u.neighborhood,
                                      u.city && u.state ? `${u.city} - ${u.state}` : (u.city || u.state),
                                      u.cep,
                                    ].filter(Boolean).join(' · ')}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
                </React.Fragment>
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
      <ClientFormModal
        isOpen={showModal}
        onClose={closeModal}
        onSave={handleModalSave}
        editingClient={editingClient}
      />

      {/* Delete confirmation */}
      {deleteConfirm !== null && (
        <ConfirmModal
          title={t('clients.deleteClient')}
          message={t('clients.confirmDelete')}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

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
