import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../../lib/motion';
import { qualityApi } from '../../../services';
import type { NonConformance } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import { AlertOctagon, FolderOpen, CheckCircle, Flame } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface NonConformancesTabProps {
  usersId: number;
}

// ── Config ────────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  baixa:   { label: 'Baixa',   bg: '#D1FAE5', color: '#065F46' },
  media:   { label: 'Media',   bg: '#FEF3C7', color: '#92400E' },
  alta:    { label: 'Alta',    bg: '#FED7AA', color: '#9A3412' },
  critica: { label: 'Critica', bg: '#FDE8E8', color: '#C0392B' },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  aberta:        { label: 'Aberta',        bg: '#FDE8E8', color: '#C0392B' },
  em_analise:    { label: 'Em Analise',    bg: '#FEF3C7', color: '#92400E' },
  em_tratamento: { label: 'Em Tratamento', bg: '#DBEAFE', color: '#1E40AF' },
  verificacao:   { label: 'Verificacao',   bg: '#E0E7FF', color: '#4338CA' },
  encerrada:     { label: 'Encerrada',     bg: '#F3F4F6', color: '#6B7280' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const cfg = SEVERITY_CONFIG[severity] ?? { label: severity, bg: '#F3F4F6', color: '#6B7280' };
  return (
    <span
      className="badge"
      style={{ backgroundColor: cfg.bg, color: cfg.color, borderRadius: '12px' }}
    >
      {cfg.label}
    </span>
  );
}

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

export default function NonConformancesTab({ usersId }: NonConformancesTabProps) {
  const [items, setItems] = useState<NonConformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await qualityApi.listNonConformances({
        responsible_user_id: usersId,
        page,
        per_page: perPage,
      });
      setItems(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load non-conformances:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, page, perPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openStatuses = new Set(['aberta', 'em_analise', 'em_tratamento']);
  const highSeverities = new Set(['alta', 'critica']);

  const countOpen = items.filter((nc) => openStatuses.has(nc.status)).length;
  const countClosed = items.filter((nc) => nc.status === 'encerrada').length;
  const countCritical = items.filter((nc) => highSeverities.has(nc.severity)).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <SummaryCard
          icon={<AlertOctagon size={20} />}
          label="Total de NCs"
          value={totalItems}
          color="var(--color-primary)"
        />
        <SummaryCard
          icon={<FolderOpen size={20} />}
          label="NCs Abertas"
          value={countOpen}
          color="#C0392B"
        />
        <SummaryCard
          icon={<CheckCircle size={20} />}
          label="NCs Encerradas"
          value={countClosed}
          color="#028F58"
        />
        <SummaryCard
          icon={<Flame size={20} />}
          label="NCs Criticas"
          value={countCritical}
          color="#9A3412"
        />
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <EmptyState message="Nenhuma nao-conformidade registrada para este colaborador." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Severidade</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Prazo</th>
                <th>Origem</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {items.map((nc) => (
                <motion.tr key={nc.id} variants={tableRowVariants}>
                  <td style={{ fontWeight: 500 }}>{nc.title || '-'}</td>
                  <td>
                    <SeverityBadge severity={nc.severity} />
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                    {nc.category || '-'}
                  </td>
                  <td>
                    <StatusBadge status={nc.status} />
                  </td>
                  <td>{formatDate(nc.deadline)}</td>
                  <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                    {nc.origin || '-'}
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
