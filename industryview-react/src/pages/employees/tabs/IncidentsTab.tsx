import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../../lib/motion';
import { safetyApi } from '../../../services';
import type { SafetyIncident, PaginatedResponse } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import { AlertTriangle, Calendar, Activity, Shield } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface IncidentsTabProps {
  usersId: number;
}

// ── Config ───────────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  quase_acidente:      { label: 'Quase Acidente',     bg: '#FEF3C7', color: '#92400E' },
  primeiros_socorros:  { label: 'Primeiros Socorros', bg: '#DBEAFE', color: '#1E40AF' },
  sem_afastamento:     { label: 'Sem Afastamento',    bg: '#FED7AA', color: '#9A3412' },
  com_afastamento:     { label: 'Com Afastamento',    bg: '#FDE8E8', color: '#C0392B' },
  fatal:               { label: 'Fatal',              bg: '#374151', color: '#FFFFFF' },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  registrado:       { label: 'Registrado',      bg: '#DBEAFE', color: '#1E40AF' },
  em_investigacao:  { label: 'Em Investigacao', bg: '#FEF3C7', color: '#92400E' },
  investigado:      { label: 'Investigado',     bg: '#D1FAE5', color: '#065F46' },
  encerrado:        { label: 'Encerrado',       bg: '#F3F4F6', color: '#6B7280' },
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  tipico:             'Tipico',
  trajeto:            'Trajeto',
  doenca_ocupacional: 'Doenca Ocupacional',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

/** Returns how many of the loaded incidents occurred within the past 12 months */
function countIncidentsLast12Months(incidents: SafetyIncident[]): number {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  return incidents.filter((i) => i.incident_date && new Date(i.incident_date) >= cutoff).length;
}

function deriveRiskStatus(countLast12m: number): { label: string; color: string } {
  if (countLast12m === 0) return { label: 'Baixo', color: '#028F58' };
  if (countLast12m === 1) return { label: 'Medio', color: '#D97706' };
  return { label: 'Alto', color: '#C0392B' };
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

export default function IncidentsTab({ usersId }: IncidentsTabProps) {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data: PaginatedResponse<SafetyIncident> = await safetyApi.listIncidents({
        involved_user_id: usersId,
        page,
        per_page: perPage,
      });
      setIncidents(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, page, perPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Derived KPI values ──────────────────────────────────────────────────────

  const totalDaysLost = incidents.reduce((acc, i) => acc + (i.days_lost ?? 0), 0);

  const latestIncidentDate = incidents.length > 0
    ? incidents.reduce((latest, i) => {
        if (!i.incident_date) return latest;
        return !latest || i.incident_date > latest ? i.incident_date : latest;
      }, null as string | null)
    : null;

  const countLast12m = countIncidentsLast12Months(incidents);
  const riskStatus = deriveRiskStatus(countLast12m);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <SummaryCard
          icon={<AlertTriangle size={20} />}
          label="Total de Incidentes"
          value={totalItems}
          color="var(--color-primary)"
        />
        <SummaryCard
          icon={<Calendar size={20} />}
          label="Dias Perdidos"
          value={totalDaysLost}
          color="#C0392B"
        />
        <SummaryCard
          icon={<Activity size={20} />}
          label="Ultimo Incidente"
          value={latestIncidentDate ? formatDate(latestIncidentDate) : '-'}
          color="#D97706"
        />
        <SummaryCard
          icon={<Shield size={20} />}
          label="Status de Risco"
          value={riskStatus.label}
          color={riskStatus.color}
        />
      </div>

      {/* Table */}
      {incidents.length === 0 ? (
        <EmptyState message="Nenhum incidente registrado para este colaborador." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>N Incidente</th>
                <th>Severidade</th>
                <th>Classificacao</th>
                <th>Parte do Corpo</th>
                <th>Dias Perdidos</th>
                <th>Status</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {incidents.map((incident) => (
                <motion.tr key={incident.id} variants={tableRowVariants}>
                  <td>{formatDate(incident.incident_date)}</td>
                  <td style={{ fontWeight: 500 }}>
                    {incident.incident_number || '-'}
                  </td>
                  <td>
                    <SeverityBadge severity={incident.severity} />
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                    {CLASSIFICATION_LABELS[incident.classification] ?? incident.classification ?? '-'}
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                    {incident.body_part_affected || '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {incident.days_lost ?? 0}
                  </td>
                  <td>
                    <StatusBadge status={incident.status} />
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
