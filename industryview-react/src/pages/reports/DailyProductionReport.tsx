import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants, fadeUpChild } from '../../lib/motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { reportsApi } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ArrowLeft, Calendar, BarChart3 } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { formatPercentage, formatNumber } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DailyProductionEntry {
  id: number;
  date?: string;
  taskName?: string;
  quantity?: number;
  unityName?: string;
  progress?: number;
  responsible?: string;
  observations?: string;
}

export default function DailyProductionReport() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectsInfo } = useAppState();

  const [entries, setEntries] = useState<DailyProductionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [dateFilter, setDateFilter] = useState('');
  const [chartData, setChartData] = useState<{ name: string; produced: number; planned: number }[]>([]);

  useEffect(() => {
    if (!projectsInfo) {
      navigate('/projetos');
    }
  }, [projectsInfo, navigate]);

  const loadEntries = useCallback(async () => {
    if (!projectsInfo) return;
    setLoading(true);
    try {
      const data = await reportsApi.getDailyProduction({
        projects_id: projectsInfo.id,
        date: dateFilter || undefined,
        page,
        per_page: perPage,
      });

      const items = (data as Record<string, unknown>)?.items;
      if (Array.isArray(items)) {
        setEntries(items as DailyProductionEntry[]);
        setTotalPages(((data as Record<string, unknown>)?.pageTotal as number) || 1);
        setTotalItems(((data as Record<string, unknown>)?.itemsTotal as number) || 0);
      } else {
        setEntries([]);
        setTotalPages(1);
        setTotalItems(0);
      }

      // Build chart data from entries
      const chartMap = new Map<string, { produced: number; planned: number }>();
      (Array.isArray(items) ? items : []).forEach((entry: DailyProductionEntry) => {
        const key = entry.taskName || 'Outros';
        const existing = chartMap.get(key) || { produced: 0, planned: 0 };
        existing.produced += entry.quantity || 0;
        chartMap.set(key, existing);
      });
      setChartData(
        Array.from(chartMap.entries()).map(([name, val]) => ({
          name: name.length > 20 ? name.slice(0, 20) + '...' : name,
          produced: val.produced,
          planned: val.planned,
        }))
      );
    } catch (err) {
      console.error('Failed to load daily production:', err);
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, page, perPage, dateFilter]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  if (!projectsInfo) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title={t('reports.dailyProduction')}
        subtitle={t('reports.dailyProductionSubtitle')}
        breadcrumb={`${t('projects.title')} / ${projectsInfo.name} / ${t('reports.dailyProduction')}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/projeto-detalhes')}>
              <ArrowLeft size={18} /> {t('common.back')}
            </button>
          </div>
        }
      />

      {/* Date filter */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <label style={{ marginBottom: '4px', fontSize: '13px' }}>{t('reports.filterByDate')}</label>
          <input
            type="date"
            className="input-field"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: '200px' }}
          />
        </div>
        {dateFilter && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setDateFilter('');
              setPage(1);
            }}
            style={{ alignSelf: 'flex-end' }}
          >
            {t('common.clearFilter')}
          </button>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <motion.div variants={fadeUpChild} initial="initial" animate="animate" className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>
            <BarChart3 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} color="var(--color-primary)" />
            {t('reports.productionChart')}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="produced" fill="var(--color-primary)" name={t('reports.produced')} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : entries.length === 0 ? (
        <EmptyState message={t('common.noData')} />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>{t('reports.date')}</th>
                <th>{t('reports.task')}</th>
                <th>{t('reports.quantity')}</th>
                <th>{t('reports.unity')}</th>
                <th>{t('reports.progress')}</th>
                <th>{t('reports.responsible')}</th>
                <th>{t('reports.observations')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {entries.map((entry) => (
                <motion.tr key={entry.id} variants={tableRowVariants}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="var(--color-primary)" />
                      {entry.date ? formatDate(entry.date) : '-'}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{entry.taskName || '-'}</td>
                  <td>{entry.quantity != null ? formatNumber(entry.quantity) : '-'}</td>
                  <td>{entry.unityName || '-'}</td>
                  <td>
                    {entry.progress != null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-alternate)', borderRadius: '3px', maxWidth: '80px' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${entry.progress}%`,
                              backgroundColor: 'var(--color-primary)',
                              borderRadius: '3px',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '12px' }}>{formatPercentage(entry.progress)}</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{entry.responsible || '-'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.observations || '-'}
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
            onPageChange={setPage}
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
