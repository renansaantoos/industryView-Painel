import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuth } from '../../hooks/useAuth';
import { auditApi } from '../../services';
import type { AuditLog } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ClipboardList, ChevronDown, ChevronUp, Search, Calendar, Filter } from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

const ACTION_OPTIONS: AuditAction[] = ['INSERT', 'UPDATE', 'DELETE'];

function getActionBadgeStyle(action: AuditAction): { backgroundColor: string; color: string } {
  switch (action) {
    case 'INSERT':
      return { backgroundColor: 'var(--color-status-04)', color: 'var(--color-success)' };
    case 'UPDATE':
      return { backgroundColor: 'var(--color-status-03)', color: 'var(--color-primary)' };
    case 'DELETE':
      return { backgroundColor: 'var(--color-status-05)', color: 'var(--color-error)' };
  }
}

function getActionLabel(action: AuditAction, t: (key: string) => string): string {
  switch (action) {
    case 'INSERT': return t('audit.insert');
    case 'UPDATE': return t('audit.updateAction');
    case 'DELETE': return t('audit.deleteAction');
  }
}

interface JsonPanelProps {
  label: string;
  values: Record<string, unknown> | null | undefined;
}

function JsonPanel({ label, values }: JsonPanelProps) {
  const hasValues = values && Object.keys(values).length > 0;
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--color-secondary-text)',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label}
      </p>
      {hasValues ? (
        <pre style={{
          backgroundColor: 'var(--color-primary-bg)',
          border: '1px solid var(--color-alternate)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          fontSize: '12px',
          color: 'var(--color-primary-text)',
          overflowX: 'auto',
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '260px',
          overflowY: 'auto',
          lineHeight: '1.5',
        }}>
          {JSON.stringify(values, null, 2)}
        </pre>
      ) : (
        <p style={{
          fontSize: '12px',
          color: 'var(--color-secondary-text)',
          fontStyle: 'italic',
          padding: '10px 12px',
          backgroundColor: 'var(--color-primary-bg)',
          border: '1px solid var(--color-alternate)',
          borderRadius: 'var(--radius-sm)',
          margin: 0,
        }}>
          —
        </p>
      )}
    </div>
  );
}

export default function AuditLogs() {
  const { t } = useTranslation();
  const { setNavBarSelection } = useAppState();
  const { user } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  // Filters
  const [tableNameFilter, setTableNameFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [usersIdFilter, setUsersIdFilter] = useState('');
  const [initialDate, setInitialDate] = useState('');
  const [finalDate, setFinalDate] = useState('');

  // Pending filter inputs (applied on search button click)
  const [pendingTableName, setPendingTableName] = useState('');
  const [pendingUsersId, setPendingUsersId] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    setNavBarSelection(30);
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof auditApi.listLogs>[0] = {
        page,
        per_page: perPage,
      };

      if (user?.companyId) params.company_id = user.companyId;
      if (tableNameFilter) params.table_name = tableNameFilter;
      if (actionFilter) params.action = actionFilter;
      if (usersIdFilter) params.users_id = parseInt(usersIdFilter, 10);
      if (initialDate) params.initial_date = initialDate;
      if (finalDate) params.final_date = finalDate;

      const data = await auditApi.listLogs(params);
      setLogs(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, tableNameFilter, actionFilter, usersIdFilter, initialDate, finalDate, user?.companyId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleApplyTextFilters = () => {
    setTableNameFilter(pendingTableName);
    setUsersIdFilter(pendingUsersId);
    setPage(1);
    setExpandedRowId(null);
  };

  const handleFilterChange = <K extends string>(setter: (v: K) => void, value: K) => {
    setter(value);
    setPage(1);
    setExpandedRowId(null);
  };

  const handleResetFilters = () => {
    setPendingTableName('');
    setPendingUsersId('');
    setTableNameFilter('');
    setActionFilter('');
    setUsersIdFilter('');
    setInitialDate('');
    setFinalDate('');
    setPage(1);
    setExpandedRowId(null);
  };

  const toggleExpandRow = (id: number) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const hasActiveFilters = tableNameFilter || actionFilter || usersIdFilter || initialDate || finalDate;

  return (
    <div>
      <PageHeader
        title={t('audit.title')}
        subtitle={t('audit.subtitle')}
      />

      {/* Filters */}
      <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <Filter size={15} color="var(--color-secondary-text)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-secondary-text)' }}>
            {t('common.filters', 'Filtros')}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Table name */}
          <div className="input-group" style={{ margin: 0, flex: '1 1 160px', minWidth: '140px' }}>
            <label style={{ fontSize: '12px' }}>{t('audit.tableName')}</label>
            <div style={{ position: 'relative' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-secondary-text)',
                }}
              />
              <input
                type="text"
                className="input-field"
                placeholder="ex: tasks"
                value={pendingTableName}
                onChange={(e) => setPendingTableName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyTextFilters(); }}
                style={{ paddingLeft: '30px' }}
              />
            </div>
          </div>

          {/* Action dropdown */}
          <div className="input-group" style={{ margin: 0, flex: '1 1 130px', minWidth: '120px' }}>
            <label style={{ fontSize: '12px' }}>{t('audit.action')}</label>
            <select
              className="select-field"
              value={actionFilter}
              onChange={(e) => handleFilterChange(setActionFilter, e.target.value)}
            >
              <option value="">{t('common.all', 'Todas')}</option>
              {ACTION_OPTIONS.map((action) => (
                <option key={action} value={action}>
                  {getActionLabel(action, t)}
                </option>
              ))}
            </select>
          </div>

          {/* User ID */}
          <div className="input-group" style={{ margin: 0, flex: '1 1 130px', minWidth: '120px' }}>
            <label style={{ fontSize: '12px' }}>{t('audit.user')} (ID)</label>
            <input
              type="number"
              className="input-field"
              placeholder="ex: 42"
              value={pendingUsersId}
              onChange={(e) => setPendingUsersId(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyTextFilters(); }}
            />
          </div>

          {/* Date range */}
          <div className="input-group" style={{ margin: 0, flex: '1 1 150px', minWidth: '140px' }}>
            <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> {t('common.startDate', 'Data inicial')}
            </label>
            <input
              type="date"
              className="input-field"
              value={initialDate}
              onChange={(e) => handleFilterChange(setInitialDate, e.target.value)}
            />
          </div>

          <div className="input-group" style={{ margin: 0, flex: '1 1 150px', minWidth: '140px' }}>
            <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> {t('common.endDate', 'Data final')}
            </label>
            <input
              type="date"
              className="input-field"
              value={finalDate}
              onChange={(e) => handleFilterChange(setFinalDate, e.target.value)}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', paddingBottom: '1px' }}>
            <button className="btn btn-primary" onClick={handleApplyTextFilters}>
              <Search size={15} /> {t('common.search', 'Buscar')}
            </button>
            {hasActiveFilters && (
              <button className="btn btn-secondary" onClick={handleResetFilters}>
                {t('common.reset', 'Limpar')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={48} />}
          message={t('common.noData')}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '36px' }} />
                <th>{t('common.date', 'Data')}</th>
                <th>{t('audit.user')}</th>
                <th>{t('audit.tableName')}</th>
                <th>{t('common.recordId', 'Registro')}</th>
                <th>{t('audit.action')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {logs.map((log) => {
                const isExpanded = expandedRowId === log.id;
                const badgeStyle = getActionBadgeStyle(log.action);

                return (
                  <>
                    <motion.tr key={log.id} variants={tableRowVariants}>
                      {/* Expand toggle */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-icon"
                          title={isExpanded ? t('common.collapse', 'Recolher') : t('common.expand', 'Expandir')}
                          onClick={() => toggleExpandRow(log.id)}
                        >
                          {isExpanded
                            ? <ChevronUp size={15} color="var(--color-primary)" />
                            : <ChevronDown size={15} color="var(--color-secondary-text)" />
                          }
                        </button>
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: '13px', whiteSpace: 'nowrap', color: 'var(--color-secondary-text)' }}>
                        {formatDateTime(log.created_at)}
                      </td>

                      {/* User */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>
                            {log.user_name || `ID ${log.users_id}`}
                          </span>
                          {log.user_email && (
                            <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>
                              {log.user_email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Table name */}
                      <td>
                        <code style={{
                          fontSize: '12px',
                          backgroundColor: 'var(--color-status-01)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-primary-text)',
                        }}>
                          {log.table_name}
                        </code>
                      </td>

                      {/* Record ID */}
                      <td style={{ fontSize: '13px', color: 'var(--color-secondary-text)', fontFamily: 'monospace' }}>
                        #{log.record_id}
                      </td>

                      {/* Action badge */}
                      <td>
                        <span className="badge" style={badgeStyle}>
                          {getActionLabel(log.action, t)}
                        </span>
                      </td>
                    </motion.tr>

                    {/* Expanded row: old_values / new_values */}
                    {isExpanded && (
                      <tr key={`${log.id}-expanded`}>
                        <td />
                        <td colSpan={5} style={{ padding: '12px 16px 16px' }}>
                          <div style={{
                            display: 'flex',
                            gap: '16px',
                            flexWrap: 'wrap',
                          }}>
                            <JsonPanel
                              label={t('audit.oldValues')}
                              values={log.old_values}
                            />
                            <JsonPanel
                              label={t('audit.newValues')}
                              values={log.new_values}
                            />
                          </div>
                          {log.ip_address && (
                            <p style={{ fontSize: '11px', color: 'var(--color-secondary-text)', marginTop: '8px' }}>
                              IP: {log.ip_address}
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
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
