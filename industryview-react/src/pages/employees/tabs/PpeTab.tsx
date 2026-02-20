import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, tableRowVariants, modalBackdropVariants, modalContentVariants } from '../../../lib/motion';
import { ppeApi } from '../../../services';
import type { PpeDelivery, UserPpeStatus, PpeType } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { Package, RotateCcw, ShieldCheck, ShieldOff, ShieldAlert, Plus } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface PpeTabProps {
  usersId: number;
}

type DeliveryStatus = 'ativo' | 'vencido' | 'devolvido';

interface DeliveryFormData {
  ppe_types_id: string;
  quantity: string;
  delivery_date: string;
  observation: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

const EMPTY_DELIVERY_FORM: DeliveryFormData = {
  ppe_types_id: '',
  quantity: '1',
  delivery_date: '',
  observation: '',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function getTodayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function computeExpiry(delivery: PpeDelivery): string | null {
  const months = delivery.ppe_type?.validity_months;
  if (!months || !delivery.delivery_date) return null;
  const d = new Date(delivery.delivery_date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

function computeDeliveryStatus(delivery: PpeDelivery): DeliveryStatus {
  if (delivery.returned || delivery.return_date) return 'devolvido';
  // Use expiry_date from the enriched endpoint when available, fall back to local computation
  const expiry = delivery.expiry_date ?? computeExpiry(delivery);
  if (expiry && new Date(expiry) < new Date()) return 'vencido';
  return 'ativo';
}

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; bg: string; color: string }> = {
  ativo:      { label: 'Ativo',      bg: '#F4FEF9', color: '#028F58' },
  vencido:    { label: 'Vencido',    bg: '#FDE8E8', color: '#C0392B' },
  devolvido:  { label: 'Devolvido',  bg: '#F5F5F5', color: '#6B7280' },
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="badge"
      style={{ backgroundColor: cfg.bg, color: cfg.color, borderRadius: '12px' }}
    >
      {cfg.label}
    </span>
  );
}

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function SummaryCard({ icon, label, value, color }: SummaryCardProps) {
  return (
    <div
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '140px' }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
          {value}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', margin: 0 }}>
          {label}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PpeTab({ usersId }: PpeTabProps) {
  const [deliveries, setDeliveries] = useState<PpeDelivery[]>([]);
  const [ppeStatus, setPpeStatus] = useState<UserPpeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Create delivery modal state
  const [ppeTypes, setPpeTypes] = useState<PpeType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<DeliveryFormData>(EMPTY_DELIVERY_FORM);
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [deliveriesData, statusData] = await Promise.all([
        ppeApi.listDeliveries({ users_id: usersId, page, per_page: perPage }),
        ppeApi.getUserPpeStatus(usersId),
      ]);
      setDeliveries(deliveriesData.items || []);
      setTotalPages(deliveriesData.pageTotal || 1);
      setTotalItems(deliveriesData.itemsTotal || 0);
      setPpeStatus(statusData);
    } catch (err) {
      console.error('Failed to load PPE data:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, page, perPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    ppeApi.listPpeTypes().then(setPpeTypes).catch(() => {});
  }, []);

  const handleRegisterReturn = async (deliveryId: number) => {
    setReturningId(deliveryId);
    try {
      const updated = await ppeApi.registerReturn(deliveryId);
      setDeliveries((prev) =>
        prev.map((d) => (d.id === deliveryId ? { ...d, ...updated } : d)),
      );
      // Refresh status counts after return
      const statusData = await ppeApi.getUserPpeStatus(usersId);
      setPpeStatus(statusData);
    } catch (err) {
      console.error('Failed to register PPE return:', err);
    } finally {
      setReturningId(null);
    }
  };

  // ── Toast helper ──────────────────────────────────────────────────────────

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setForm({ ...EMPTY_DELIVERY_FORM, delivery_date: getTodayISO() });
    setTouched({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(EMPTY_DELIVERY_FORM);
    setTouched({});
  };

  const handleFormChange = (field: keyof DeliveryFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: false }));
  };

  const handleSave = async () => {
    const requiredFields: (keyof DeliveryFormData)[] = ['ppe_types_id', 'delivery_date'];
    const missing = requiredFields.filter((f) => !form[f]);

    if (missing.length > 0) {
      const newTouched: Record<string, boolean> = {};
      missing.forEach((f) => { newTouched[f] = true; });
      setTouched((prev) => ({ ...prev, ...newTouched }));
      showToast('Preencha os campos obrigatórios antes de continuar.', 'error');
      return;
    }

    setModalLoading(true);
    try {
      await ppeApi.createDelivery({
        ppe_types_id: Number(form.ppe_types_id),
        users_id: usersId,
        quantity: Number(form.quantity) || 1,
        delivery_date: form.delivery_date,
        observation: form.observation || undefined,
      });
      closeModal();
      await loadData();
      showToast('EPI entregue com sucesso.', 'success');
    } catch (err) {
      console.error('Failed to create PPE delivery:', err);
      showToast('Erro ao registrar entrega. Tente novamente.', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // ── Derived summary values ────────────────────────────────────────────────

  // Use backend-provided counts (covers ALL deliveries, not just the current page)
  const summaryTotal    = ppeStatus?.total_deliveries ?? totalItems;
  const summaryActive   = ppeStatus?.active ?? 0;
  const summaryExpired  = ppeStatus?.expired ?? 0;
  const summaryReturned = ppeStatus?.returned ?? 0;

  const ppeTypeOptions = ppeTypes
    .map((t) => ({
      value: String(t.id),
      label: `${t.name}${t.ca_number ? ` (${t.ca_number})` : ''}`,
    }));

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="ppe-toast"
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '24px',
              zIndex: 2000,
              padding: '12px 18px',
              borderRadius: '10px',
              backgroundColor: toast.type === 'success' ? '#028F58' : '#C0392B',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
              maxWidth: '340px',
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={openCreateModal} style={{ marginLeft: 'auto' }}>
          <Plus size={16} style={{ marginRight: 6 }} />
          Entregar EPI
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <SummaryCard
          icon={<Package size={20} />}
          label="Total Entregues"
          value={summaryTotal}
          color="var(--color-primary)"
        />
        <SummaryCard
          icon={<ShieldCheck size={20} />}
          label="Ativos"
          value={summaryActive}
          color="#028F58"
        />
        <SummaryCard
          icon={<ShieldOff size={20} />}
          label="Vencidos"
          value={summaryExpired}
          color="#C0392B"
        />
        <SummaryCard
          icon={<ShieldAlert size={20} />}
          label="Devolvidos"
          value={summaryReturned}
          color="#6B7280"
        />
      </div>

      {/* Table */}
      {deliveries.length === 0 ? (
        <EmptyState message="Nenhuma entrega de EPI registrada para este colaborador." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>EPI</th>
                <th>CA</th>
                <th>Data Entrega</th>
                <th>Validade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {deliveries.map((delivery) => {
                const status = computeDeliveryStatus(delivery);
                const isReturning = returningId === delivery.id;
                return (
                  <motion.tr key={delivery.id} variants={tableRowVariants}>
                    <td style={{ fontWeight: 500 }}>
                      {delivery.ppe_type?.name || delivery.ppe_type_name || '-'}
                    </td>
                    <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                      {delivery.ppe_type?.ca_number || '-'}
                    </td>
                    <td>{formatDate(delivery.delivery_date)}</td>
                    <td>{formatDate(delivery.expiry_date ?? computeExpiry(delivery))}</td>
                    <td>
                      <DeliveryStatusBadge status={status} />
                    </td>
                    <td>
                      {status === 'ativo' && (
                        <button
                          className="btn btn-icon"
                          title="Registrar Devolução"
                          disabled={isReturning}
                          onClick={() => handleRegisterReturn(delivery.id)}
                          style={{ opacity: isReturning ? 0.5 : 1 }}
                        >
                          {isReturning ? (
                            <span className="spinner" style={{ width: 14, height: 14 }} />
                          ) : (
                            <RotateCcw size={15} color="var(--color-secondary-text)" />
                          )}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            perPage={perPage}
            totalItems={totalItems}
            onPageChange={(p) => setPage(p)}
            onPerPageChange={(pp) => {
              setPerPage(pp);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Create Delivery Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-backdrop"
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={closeModal}
          >
            <motion.div
              className="modal-content"
              variants={modalContentVariants}
              style={{ width: '480px', maxWidth: '95vw' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Entregar EPI
                </h3>
              </div>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* EPI (required) */}
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    EPI
                    <span style={{ color: '#C0392B' }}>*</span>
                  </label>
                  <SearchableSelect
                    options={ppeTypeOptions}
                    value={form.ppe_types_id}
                    onChange={(val) => handleFormChange('ppe_types_id', val ? String(val) : '')}
                    placeholder="Selecione o EPI..."
                    style={
                      touched.ppe_types_id && !form.ppe_types_id
                        ? { outline: '2px solid #C0392B', borderRadius: 'var(--radius-md)' }
                        : undefined
                    }
                  />
                  {touched.ppe_types_id && !form.ppe_types_id && (
                    <span style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>
                      Campo obrigatório
                    </span>
                  )}
                </div>

                {/* Data de Entrega (required) */}
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Data de Entrega
                    <span style={{ color: '#C0392B' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.delivery_date}
                    onChange={(e) => handleFormChange('delivery_date', e.target.value)}
                    style={
                      touched.delivery_date && !form.delivery_date
                        ? { borderColor: '#C0392B' }
                        : undefined
                    }
                  />
                  {touched.delivery_date && !form.delivery_date && (
                    <span style={{ fontSize: '12px', color: '#C0392B', marginTop: '4px' }}>
                      Campo obrigatório
                    </span>
                  )}
                </div>

                {/* Quantidade */}
                <div className="input-group">
                  <label>Quantidade</label>
                  <input
                    type="number"
                    className="input-field"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => handleFormChange('quantity', e.target.value)}
                  />
                </div>

                {/* Observação */}
                <div className="input-group">
                  <label>Observação</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={form.observation}
                    onChange={(e) => handleFormChange('observation', e.target.value)}
                    placeholder="Observações sobre a entrega (opcional)"
                    style={{ resize: 'vertical', minHeight: '72px' }}
                  />
                </div>

              </div>

              {/* Modal footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '24px',
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={modalLoading}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={modalLoading}
                  style={{ minWidth: '100px' }}
                >
                  {modalLoading ? (
                    <>
                      <span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />
                      Entregando...
                    </>
                  ) : (
                    'Entregar'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
