import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../../lib/motion';
import { workforceApi } from '../../../services';
import type { WorkforceDailyLog } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import { Clock, AlertCircle } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface TimeTrackingTabProps {
  usersId: number;
}

type AttendanceStatus = 'presente' | 'ausente' | 'meio_periodo';

// ── Constants ─────────────────────────────────────────────────────────────────

const PER_PAGE_OPTIONS = [10, 20, 50];

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; bg: string; color: string }> = {
  presente:     { label: 'Presente',     bg: '#F4FEF9', color: '#028F58' },
  ausente:      { label: 'Ausente',      bg: '#FDE8E8', color: '#C0392B' },
  meio_periodo: { label: 'Meio Período', bg: '#FFF9E6', color: '#B98E00' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatTime(timeStr?: string | null): string {
  if (!timeStr) return '-';
  // Time values may be ISO timestamps or "HH:MM:SS" strings
  if (timeStr.includes('T')) {
    return new Date(timeStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  // "HH:MM:SS" — take first 5 chars
  return timeStr.slice(0, 5);
}

function computeWorkedHours(checkIn?: string | null, checkOut?: string | null): string {
  if (!checkIn || !checkOut) return '-';
  const parseMs = (val: string) => {
    if (val.includes('T')) return new Date(val).getTime();
    // "HH:MM:SS" — create a dummy date so we can subtract
    return new Date(`1970-01-01T${val}`).getTime();
  };
  const diffMs = parseMs(checkOut) - parseMs(checkIn);
  if (diffMs <= 0) return '-';
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: AttendanceStatus | null }) {
  if (!status) {
    return (
      <span style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>-</span>
    );
  }
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
  value: string;
  color: string;
}

function SummaryCard({ icon, label, value, color }: SummaryCardProps) {
  return (
    <div
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '180px' }}
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
        <p style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
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

export default function TimeTrackingTab({ usersId }: TimeTrackingTabProps) {
  const [logs, setLogs] = useState<WorkforceDailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // The workforce API does not support users_id filtering server-side.
  // We fetch all logs and filter client-side by users_id.
  // When the backend adds users_id support, the filter can be removed here
  // and passed directly as a query param instead.
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await workforceApi.listDailyLogs({
        page,
        per_page: perPage,
        log_date: startDate || undefined,
      });

      const userLogs = (data.items || []).filter(
        (log) => log.users_id === usersId,
      );

      // Apply client-side date range filter when both bounds are set
      const filtered =
        startDate && endDate
          ? userLogs.filter((log) => {
              const d = log.log_date;
              return d >= startDate && d <= endDate;
            })
          : userLogs;

      setLogs(filtered);
      // Pagination counts reflect the server page since we can't know the true
      // total for this user without fetching all pages.
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load time tracking data:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, page, perPage, startDate, endDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Aggregate hours from the currently loaded (client-filtered) logs
  const totalWorkedMinutes = logs.reduce((acc, log) => {
    if (!log.check_in || !log.check_out) return acc;
    const parseMs = (val: string) =>
      val.includes('T') ? new Date(val).getTime() : new Date(`1970-01-01T${val}`).getTime();
    const diffMs = parseMs(log.check_out) - parseMs(log.check_in);
    return acc + Math.max(0, Math.floor(diffMs / 60000));
  }, 0);

  const formatTotalHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}min`;
  };

  const daysPresent = logs.filter((l) => l.status === 'presente').length;

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Notice about client-side filtering */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          backgroundColor: '#FFF9E6',
          border: '1px solid #F5D76E',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#7D6608',
        }}
      >
        <AlertCircle size={15} style={{ flexShrink: 0 }} />
        <span>
          Os registros são filtrados localmente por colaborador. Para resultados
          mais precisos, utilize a página de Controle de Mão de Obra com filtros
          avançados.
        </span>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <SummaryCard
          icon={<Clock size={20} />}
          label="Total de Horas (página atual)"
          value={formatTotalHours(totalWorkedMinutes)}
          color="var(--color-primary)"
        />
        <SummaryCard
          icon={<Clock size={20} />}
          label="Dias Presentes (página atual)"
          value={String(daysPresent)}
          color="#028F58"
        />
      </div>

      {/* Date Filters */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
            Data inicial
          </label>
          <input
            type="date"
            className="input-field"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            style={{ minWidth: '160px' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>
            Data final
          </label>
          <input
            type="date"
            className="input-field"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            style={{ minWidth: '160px' }}
          />
        </div>
        {(startDate || endDate) && (
          <button
            className="btn btn-secondary"
            style={{ alignSelf: 'flex-end' }}
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setPage(1);
            }}
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Table */}
      {logs.length === 0 ? (
        <EmptyState
          icon={<Clock size={48} />}
          message="Nenhum registro de ponto encontrado para este colaborador nesta página."
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Horas Trabalhadas</th>
                <th>Status</th>
                <th>Observação</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {logs.map((log) => (
                <motion.tr key={log.id} variants={tableRowVariants}>
                  <td style={{ fontWeight: 500 }}>{formatDate(log.log_date)}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatTime(log.check_in)}
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatTime(log.check_out)}
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {computeWorkedHours(log.check_in, log.check_out)}
                  </td>
                  <td>
                    <StatusBadge status={log.status as AttendanceStatus | null} />
                  </td>
                  <td
                    style={{
                      color: 'var(--color-secondary-text)',
                      fontSize: '13px',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={log.observation || undefined}
                  >
                    {log.observation || '-'}
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
            perPageOptions={PER_PAGE_OPTIONS}
          />
        </div>
      )}
    </div>
  );
}
