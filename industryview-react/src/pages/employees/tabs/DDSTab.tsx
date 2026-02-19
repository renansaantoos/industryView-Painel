import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../../lib/motion';
import { safetyApi } from '../../../services';
import type { DdsRecord } from '../../../types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Pagination from '../../../components/common/Pagination';
import { Users, CalendarCheck, PenTool } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface DDSTabProps {
  usersId: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

export default function DDSTab({ usersId }: DDSTabProps) {
  const [records, setRecords] = useState<DdsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safetyApi.listDdsRecords({
        participant_user_id: usersId,
        page,
        per_page: perPage,
      });
      setRecords(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load DDS records:', err);
    } finally {
      setLoading(false);
    }
  }, [usersId, page, perPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const lastParticipation =
    records.length > 0
      ? formatDate(records[0].dds_date)
      : '-';

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <SummaryCard
          icon={<Users size={20} />}
          label="Total de Participacoes"
          value={totalItems}
          color="var(--color-primary)"
        />
        <SummaryCard
          icon={<CalendarCheck size={20} />}
          label="Ultima Participacao"
          value={lastParticipation}
          color="#028F58"
        />
        <SummaryCard
          icon={<PenTool size={20} />}
          label="Assinaturas"
          value={totalItems}
          color="#6B7280"
        />
      </div>

      {/* Table */}
      {records.length === 0 ? (
        <EmptyState message="Nenhuma participacao em DDS registrada para este colaborador." />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tema</th>
                <th>Condutor</th>
                <th>Equipe</th>
                <th>Participantes</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {records.map((record) => (
                <motion.tr key={record.id} variants={tableRowVariants}>
                  <td>{formatDate(record.dds_date)}</td>
                  <td style={{ fontWeight: 500 }}>{record.topic || '-'}</td>
                  <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                    {record.conductor_name || '-'}
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                    {record.team || '-'}
                  </td>
                  <td style={{ color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                    {record.participants_count ?? '-'}
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
