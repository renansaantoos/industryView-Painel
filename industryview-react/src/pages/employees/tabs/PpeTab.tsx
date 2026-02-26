import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerParent, tableRowVariants, modalBackdropVariants, modalContentVariants } from '../../../lib/motion';
import { ppeApi } from '../../../services';
import type { PpeDelivery, UserPpeStatus, PpeType } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import SearchableSelect from '../../../components/common/SearchableSelect';
import { Package, RotateCcw, ShieldCheck, ShieldOff, ShieldAlert, Plus, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

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

interface ReturnFormData {
  motivo_devolucao: string;
  justificativa_devolucao: string;
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

const EMPTY_RETURN_FORM: ReturnFormData = {
  motivo_devolucao: '',
  justificativa_devolucao: '',
};

const MOTIVOS_DEVOLUCAO = ['Demissão', 'Substituição', 'Outro'];

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

// ── PDF Generator ─────────────────────────────────────────────────────────────

function generatePpeFicha(deliveries: PpeDelivery[], userName?: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 14;
  const colW = pageW - margin * 2;
  let y = 20;

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Ficha de EPIs Entregues', margin, y);
  y += 7;

  if (userName) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Colaborador: ${userName}`, margin, y);
    y += 6;
  }

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, y);
  doc.setTextColor(0);
  y += 8;

  // Table header
  const cols = {
    epi:       { x: margin, w: 60 },
    ca:        { x: margin + 60, w: 25 },
    entrega:   { x: margin + 85, w: 28 },
    validade:  { x: margin + 113, w: 28 },
    status:    { x: margin + 141, w: 24 },
    motivo:    { x: margin + 165, w: colW - 165 },
  };

  const rowH = 8;
  const drawRow = (
    epi: string, ca: string, entrega: string, validade: string, status: string, motivo: string,
    isHeader: boolean, shade: boolean,
  ) => {
    if (shade) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y - 5.5, colW, rowH, 'F');
    }
    if (isHeader) {
      doc.setFillColor(30, 64, 175);
      doc.rect(margin, y - 5.5, colW, rowH, 'F');
      doc.setTextColor(255);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
    }
    doc.setFontSize(8);
    const truncate = (s: string, maxW: number) => {
      const chars = Math.floor(maxW / 1.8);
      return s.length > chars ? s.slice(0, chars - 1) + '…' : s;
    };
    doc.text(truncate(epi, cols.epi.w - 2), cols.epi.x + 1, y);
    doc.text(truncate(ca, cols.ca.w - 2), cols.ca.x + 1, y);
    doc.text(entrega, cols.entrega.x + 1, y);
    doc.text(validade, cols.validade.x + 1, y);
    doc.text(status, cols.status.x + 1, y);
    doc.text(truncate(motivo, cols.motivo.w - 2), cols.motivo.x + 1, y);
    y += rowH;

    // bottom border
    doc.setDrawColor(210);
    doc.line(margin, y - 2, margin + colW, y - 2);
    doc.setTextColor(0);
  };

  drawRow('EPI', 'CA', 'Entrega', 'Validade', 'Status', 'Motivo Dev.', true, false);

  const activeDeliveries = deliveries.filter((d) => !d.returned && !d.return_date);
  const returnedDeliveries = deliveries.filter((d) => d.returned || d.return_date);

  const renderRows = (rows: PpeDelivery[], shade: boolean) => {
    rows.forEach((d, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const status = computeDeliveryStatus(d);
      drawRow(
        d.ppe_type?.name || d.ppe_type_name || '-',
        d.ppe_type?.ca_number || '-',
        formatDate(d.delivery_date),
        formatDate(d.expiry_date ?? computeExpiry(d)),
        STATUS_CONFIG[status].label,
        d.motivo_devolucao || '-',
        false,
        shade ? i % 2 === 0 : i % 2 !== 0,
      );
    });
  };

  if (activeDeliveries.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 64, 175);
    doc.text('EPIs Ativos', margin, y);
    doc.setTextColor(0);
    y += 5;
    renderRows(activeDeliveries, true);
    y += 2;
  }

  if (returnedDeliveries.length > 0) {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('EPIs Devolvidos', margin, y);
    doc.setTextColor(0);
    y += 5;
    renderRows(returnedDeliveries, false);
  }

  doc.save(`ficha-epis.pdf`);
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

  // Return modal state
  const [returnDeliveryId, setReturnDeliveryId] = useState<number | null>(null);
  const [returnForm, setReturnForm] = useState<ReturnFormData>(EMPTY_RETURN_FORM);
  const [returnLoading, setReturnLoading] = useState(false);

  // All deliveries (for PDF) — loaded once for ficha generation
  const [allDeliveries, setAllDeliveries] = useState<PpeDelivery[]>([]);
  const [userName, setUserName] = useState<string>('');

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
      // Store enriched deliveries (all pages) from status for PDF
      if (statusData?.deliveries) {
        setAllDeliveries(statusData.deliveries as unknown as PpeDelivery[]);
        const firstName = statusData.deliveries[0]?.user?.name;
        if (firstName) setUserName(firstName);
      }
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

  // ── Toast helper ──────────────────────────────────────────────────────────

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Create Delivery Modal helpers ─────────────────────────────────────────

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

  // ── Return Modal helpers ──────────────────────────────────────────────────

  const openReturnModal = (deliveryId: number) => {
    setReturnDeliveryId(deliveryId);
    setReturnForm(EMPTY_RETURN_FORM);
  };

  const closeReturnModal = () => {
    setReturnDeliveryId(null);
    setReturnForm(EMPTY_RETURN_FORM);
  };

  const handleConfirmReturn = async () => {
    if (!returnDeliveryId) return;
    setReturnLoading(true);
    try {
      const updated = await ppeApi.registerReturn(returnDeliveryId, {
        motivo_devolucao: returnForm.motivo_devolucao || undefined,
        justificativa_devolucao: returnForm.justificativa_devolucao || undefined,
      });
      setDeliveries((prev) =>
        prev.map((d) => (d.id === returnDeliveryId ? { ...d, ...updated } : d)),
      );
      const statusData = await ppeApi.getUserPpeStatus(usersId);
      setPpeStatus(statusData);
      if (statusData?.deliveries) setAllDeliveries(statusData.deliveries as unknown as PpeDelivery[]);
      closeReturnModal();
      showToast('Devolução registrada com sucesso.', 'success');
    } catch (err) {
      console.error('Failed to register PPE return:', err);
      showToast('Erro ao registrar devolução. Tente novamente.', 'error');
    } finally {
      setReturnLoading(false);
    }
  };

  // ── Derived summary values ────────────────────────────────────────────────

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="btn btn-secondary"
          onClick={() => generatePpeFicha(allDeliveries.length > 0 ? allDeliveries : deliveries, userName)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FileText size={15} />
          Gerar Ficha
        </button>
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
                <th>Motivo Devolução</th>
                <th>Ações</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {deliveries.map((delivery) => {
                const status = computeDeliveryStatus(delivery);
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
                    <td style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                      {status === 'devolvido'
                        ? (delivery.motivo_devolucao || '-')
                        : '-'}
                    </td>
                    <td>
                      {status === 'ativo' && (
                        <button
                          className="btn btn-icon"
                          title="Registrar Devolução"
                          onClick={() => openReturnModal(delivery.id)}
                        >
                          <RotateCcw size={15} color="var(--color-secondary-text)" />
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

                {/* Data de Entrega (required, max = today) */}
                <div className="input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Data de Entrega
                    <span style={{ color: '#C0392B' }}>*</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.delivery_date}
                    max={getTodayISO()}
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

      {/* Return Modal */}
      <AnimatePresence>
        {returnDeliveryId !== null && (
          <motion.div
            className="modal-backdrop"
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={closeReturnModal}
          >
            <motion.div
              className="modal-content"
              variants={modalContentVariants}
              style={{ width: '440px', maxWidth: '95vw' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>
                  Registrar Devolução
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                  Informe o motivo para registrar a devolução do EPI.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Motivo */}
                <div className="input-group">
                  <label>
                    Motivo
                    <span style={{ color: '#C0392B', marginLeft: '3px' }}>*</span>
                  </label>
                  <select
                    className="input-field"
                    value={returnForm.motivo_devolucao}
                    onChange={(e) => setReturnForm((prev) => ({ ...prev, motivo_devolucao: e.target.value }))}
                  >
                    <option value="">Selecione o motivo...</option>
                    {MOTIVOS_DEVOLUCAO.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Justificativa (opcional) */}
                <div className="input-group">
                  <label>Justificativa <span style={{ color: 'var(--color-secondary-text)', fontSize: '12px' }}>(opcional)</span></label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={returnForm.justificativa_devolucao}
                    onChange={(e) => setReturnForm((prev) => ({ ...prev, justificativa_devolucao: e.target.value }))}
                    placeholder="Detalhes adicionais sobre a devolução..."
                    style={{ resize: 'vertical', minHeight: '72px' }}
                  />
                </div>
              </div>

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
                  onClick={closeReturnModal}
                  disabled={returnLoading}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmReturn}
                  disabled={returnLoading || !returnForm.motivo_devolucao}
                  style={{ minWidth: '120px' }}
                >
                  {returnLoading ? (
                    <>
                      <span className="spinner" style={{ width: 14, height: 14, marginRight: 6 }} />
                      Registrando...
                    </>
                  ) : (
                    'Confirmar Devolução'
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
