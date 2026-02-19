import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../../lib/motion';
import { workPermitsApi } from '../../../services';
import type { WorkPermit } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import { ClipboardCheck, ShieldCheck, CalendarCheck } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface WorkPermitsTabProps {
  usersId: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PERMIT_TYPE_LABELS: Record<string, string> = {
  geral:      'Geral',
  quente:     'Trabalho a Quente',
  altura:     'Trabalho em Altura',
  confinado:  'Espaco Confinado',
  eletrica:   'Servico Eletrico',
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  solicitada: { label: 'Solicitada', bg: '#DBEAFE', color: '#1E40AF' },
  aprovada:   { label: 'Aprovada',   bg: '#D1FAE5', color: '#065F46' },
  ativa:      { label: 'Ativa',      bg: '#D1FAE5', color: '#065F46' },
  encerrada:  { label: 'Encerrada',  bg: '#F3F4F6', color: '#6B7280' },
  cancelada:  { label: 'Cancelada',  bg: '#FDE8E8', color: '#C0392B' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: '#F3F4F6', color: '#6B7280' };
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
  value: number | string;
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

export default function WorkPermitsTab({ usersId }: WorkPermitsTabProps) {
  const [permits, setPermits] = useState<WorkPermit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await workPermitsApi.listWorkPermits({
        signer_user_id: usersId,
        page,
        per_page: perPage,
      });
      setPermits(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load work permits:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, page, perPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCount = permits.filter(
    (p) => p.status === 'ativa' || p.status === 'aprovada',
  ).length;

  const latestDate = permits.length > 0
    ? formatDate(
        permits.reduce((latest, p) => {
          const curr = p.created_at ?? '';
          return curr > latest ? curr : latest;
        }, ''),
      )
    : '-';

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <SummaryCard
          icon={<ClipboardCheck size={20} />}
          label="Total de PTs"
          value={totalItems}
          color="var(--color-primary)"
        />
        <SummaryCard
          icon={<ShieldCheck size={20} />}
          label="PTs Ativas"
          value={activeCount}
          color="#028F58"
        />
        <SummaryCard
          icon={<CalendarCheck size={20} />}
          label="Ultima PT"
          value={latestDate}
          color="#6B7280"
        />
      </div>

      {/* Table */}
      {permits.length === 0 ? (
        <EmptyState message="Nenhuma permissao de trabalho registrada para este colaborador." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Local</th>
                <th>Status</th>
                <th>Validade</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {permits.map((permit) => (
                <motion.tr key={permit.id} variants={tableRowVariants}>
                  <td>{formatDate(permit.created_at)}</td>
                  <td style={{ fontWeight: 500 }}>
                    {PERMIT_TYPE_LABELS[permit.permit_type] ?? permit.permit_type}
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                    {permit.location || '-'}
                  </td>
                  <td>
                    <StatusBadge status={permit.status} />
                  </td>
                  <td>{formatDate(permit.valid_until)}</td>
                </motion.tr>
              ))}
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
