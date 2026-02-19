import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../../lib/motion';
import { ppeApi } from '../../../services';
import type { PpeDelivery, UserPpeStatus } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import { Package, RotateCcw, ShieldCheck, ShieldOff, ShieldAlert } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface PpeTabProps {
  usersId: number;
}

type DeliveryStatus = 'ativo' | 'vencido' | 'devolvido';

// ── Helpers ──────────────────────────────────────────────────────────────────

function computeDeliveryStatus(delivery: PpeDelivery): DeliveryStatus {
  if (delivery.returned || delivery.return_date) return 'devolvido';
  if (delivery.expiry_date && new Date(delivery.expiry_date) < new Date()) return 'vencido';
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

function computeExpiry(delivery: PpeDelivery): string | null {
  const months = delivery.ppe_type?.validity_months;
  if (!months || !delivery.delivery_date) return null;
  const d = new Date(delivery.delivery_date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
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

  // Derive summary counts from ppeStatus or fall back to local computation
  const ppeItems = ppeStatus?.ppe_items ?? [];
  const summaryTotal    = ppeItems.length || totalItems;
  const summaryActive   = ppeItems.length
    ? ppeItems.filter((i) => i.status === 'ok').length
    : deliveries.filter((d) => computeDeliveryStatus(d) === 'ativo').length;
  const summaryExpired  = ppeItems.length
    ? ppeItems.filter((i) => i.status === 'vencido').length
    : deliveries.filter((d) => computeDeliveryStatus(d) === 'vencido').length;
  const summaryReturned = deliveries.filter((d) => computeDeliveryStatus(d) === 'devolvido').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
    </div>
  );
}
