import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../../lib/motion';
import { safetyApi } from '../../../services';
import type { WorkerTraining } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import { ExternalLink, BookOpen } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface TrainingsTabProps {
  usersId: number;
}

type ValidityStatus = 'valido' | 'vencendo' | 'vencido';

// ── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;

function computeValidityStatus(expiryDate?: string | null): ValidityStatus {
  if (!expiryDate) return 'valido';
  const now = Date.now();
  const expiry = new Date(expiryDate).getTime();
  if (expiry < now) return 'vencido';
  if (expiry < now + DAYS_30_MS) return 'vencendo';
  return 'valido';
}

const VALIDITY_CONFIG: Record<ValidityStatus, { label: string; bg: string; color: string }> = {
  valido:   { label: 'Válido',   bg: '#F4FEF9', color: '#028F58' },
  vencendo: { label: 'Vencendo', bg: '#FFF9E6', color: '#B98E00' },
  vencido:  { label: 'Vencido',  bg: '#FDE8E8', color: '#C0392B' },
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ValidityBadge({ expiryDate }: { expiryDate?: string | null }) {
  const status = computeValidityStatus(expiryDate);
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

// ── Main Component ────────────────────────────────────────────────────────────

export default function TrainingsTab({ usersId }: TrainingsTabProps) {
  const [trainings, setTrainings] = useState<WorkerTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadTrainings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safetyApi.listWorkerTrainings({
        users_id: usersId,
        page,
        per_page: perPage,
      });
      setTrainings(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load worker trainings:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, page, perPage]);

  useEffect(() => {
    loadTrainings();
  }, [loadTrainings]);

  if (loading) return <LoadingSpinner />;

  if (trainings.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen size={48} />}
        message="Nenhum treinamento registrado para este colaborador."
      />
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Treinamento</th>
            <th>Data Conclusão</th>
            <th>Validade</th>
            <th>Status</th>
            <th>Certificado</th>
          </tr>
        </thead>
        <motion.tbody variants={staggerParent} initial="initial" animate="animate">
          {trainings.map((training) => (
            <motion.tr key={training.id} variants={tableRowVariants}>
              <td style={{ fontWeight: 500 }}>
                {training.training_type_name || '-'}
              </td>
              <td>{formatDate(training.training_date)}</td>
              <td>{formatDate(training.expiry_date)}</td>
              <td>
                <ValidityBadge expiryDate={training.expiry_date} />
              </td>
              <td>
                {training.certificate_url ? (
                  <a
                    href={training.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--color-primary)',
                      fontSize: '13px',
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={14} />
                    Ver certificado
                  </a>
                ) : (
                  <span style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                    -
                  </span>
                )}
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
  );
}
