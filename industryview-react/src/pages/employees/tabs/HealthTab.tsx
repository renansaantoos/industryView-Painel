import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../../lib/motion';
import { healthApi } from '../../../services';
import type { HealthRecord } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import { FileHeart, CalendarClock, AlertCircle, Stethoscope } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface HealthTabProps {
  usersId: number;
}

type ValidityStatus = 'valido' | 'vencendo' | 'vencido' | 'sem_validade';

// ── Helpers ──────────────────────────────────────────────────────────────────

const EXAM_TYPE_LABELS: Record<string, string> = {
  admissional:      'Admissional',
  periodico:        'Periodico',
  retorno_trabalho: 'Retorno ao Trabalho',
  mudanca_funcao:   'Mudanca de Funcao',
  demissional:      'Demissional',
};

const RESULT_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  apto:           { label: 'Apto',              bg: '#D1FAE5', color: '#065F46' },
  inapto:         { label: 'Inapto',            bg: '#FDE8E8', color: '#C0392B' },
  apto_restricao: { label: 'Apto c/ Restricao', bg: '#FEF3C7', color: '#92400E' },
};

const VALIDITY_CONFIG: Record<ValidityStatus, { label: string; bg: string; color: string }> = {
  valido:       { label: 'Valido',       bg: '#D1FAE5', color: '#065F46' },
  vencendo:     { label: 'Vencendo',     bg: '#FEF3C7', color: '#92400E' },
  vencido:      { label: 'Vencido',      bg: '#FDE8E8', color: '#C0392B' },
  sem_validade: { label: 'Sem Validade', bg: '#F3F4F6', color: '#6B7280' },
};

function computeValidityStatus(record: HealthRecord): ValidityStatus {
  if (!record.expiry_date) return 'sem_validade';
  const expiry = new Date(record.expiry_date);
  const today = new Date();
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'vencido';
  if (diffDays <= 30) return 'vencendo';
  return 'valido';
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ResultBadge({ result }: { result: string }) {
  const cfg = RESULT_CONFIG[result] ?? { label: result, bg: '#F3F4F6', color: '#6B7280' };
  return (
    <span
      className="badge"
      style={{ backgroundColor: cfg.bg, color: cfg.color, borderRadius: '12px' }}
    >
      {cfg.label}
    </span>
  );
}

function ValidityBadge({ status }: { status: ValidityStatus }) {
  const cfg = VALIDITY_CONFIG[status];
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
  value: string | number;
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

export default function HealthTab({ usersId }: HealthTabProps) {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await healthApi.listRecords({ users_id: usersId, page, per_page: perPage });
      setRecords(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load health records:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, page, perPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── KPI derivations ───────────────────────────────────────────────────────

  const today = new Date();

  const nextExpiry = records
    .filter((r) => r.expiry_date && new Date(r.expiry_date) >= today)
    .sort((a, b) => new Date(a.expiry_date!).getTime() - new Date(b.expiry_date!).getTime())[0];

  const expiredCount = records.filter(
    (r) => r.expiry_date && new Date(r.expiry_date) < today,
  ).length;

  const latestExam = records
    .slice()
    .sort((a, b) => new Date(b.exam_date).getTime() - new Date(a.exam_date).getTime())[0];

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <SummaryCard
          icon={<FileHeart size={20} />}
          label="Total de Exames"
          value={totalItems}
          color="var(--color-primary)"
        />
        <SummaryCard
          icon={<CalendarClock size={20} />}
          label="Proximo Vencimento"
          value={nextExpiry ? formatDate(nextExpiry.expiry_date) : '-'}
          color="#028F58"
        />
        <SummaryCard
          icon={<AlertCircle size={20} />}
          label="Exames Vencidos"
          value={expiredCount}
          color="#C0392B"
        />
        <SummaryCard
          icon={<Stethoscope size={20} />}
          label="Ultimo Exame"
          value={latestExam ? formatDate(latestExam.exam_date) : '-'}
          color="#6B7280"
        />
      </div>

      {/* Table */}
      {records.length === 0 ? (
        <EmptyState message="Nenhum registro de saude encontrado para este colaborador." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tipo Exame</th>
                <th>Data</th>
                <th>Validade</th>
                <th>Resultado</th>
                <th>Medico</th>
                <th>CRM</th>
                <th>Status Validade</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {records.map((record) => {
                const validityStatus = computeValidityStatus(record);
                return (
                  <motion.tr key={record.id} variants={tableRowVariants}>
                    <td style={{ fontWeight: 500 }}>
                      {EXAM_TYPE_LABELS[record.exam_type] ?? record.exam_type}
                    </td>
                    <td>{formatDate(record.exam_date)}</td>
                    <td>{formatDate(record.expiry_date)}</td>
                    <td>
                      <ResultBadge result={record.result} />
                    </td>
                    <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                      {record.doctor_name || '-'}
                    </td>
                    <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                      {record.crm || '-'}
                    </td>
                    <td>
                      <ValidityBadge status={validityStatus} />
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
