import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuth } from '../../hooks/useAuth';
import { usersApi, employeesApi } from '../../services';
import type { UserFull } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Plus, Search, Edit, UserCircle, Mail, Phone, Shield, UserMinus, UserCheck } from 'lucide-react';
import SortableHeader, { useBackendSort } from '../../components/common/SortableHeader';

export default function Employees() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setNavBarSelection } = useAppState();
  const { user } = useAuth();

  const [employees, setEmployees] = useState<UserFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('ativo');
  const [dismissConfirm, setDismissConfirm] = useState<UserFull | null>(null);
  const [reactivateConfirm, setReactivateConfirm] = useState<UserFull | null>(null);

  const { sortField, sortDirection, handleSort } = useBackendSort();

  useEffect(() => {
    setNavBarSelection(8);
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersApi.queryAllUsers({
        page,
        per_page: perPage,
        search: search || undefined,
        sort_field: sortField || undefined,
        sort_direction: sortDirection || undefined,
        status: statusFilter !== 'todos' ? statusFilter : undefined,
      });
      // client-side filter as fallback if backend does not support status param
      const items = (data.items || []).filter((emp) => {
        if (statusFilter === 'ativo') return !emp.hr_data?.data_demissao;
        if (statusFilter === 'inativo') return !!emp.hr_data?.data_demissao;
        return true;
      });
      setEmployees(items);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, sortField, sortDirection, statusFilter]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleDismiss = async (emp: UserFull) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await employeesApi.upsertHrData(emp.id, { data_demissao: today });
      loadEmployees();
    } catch (err) {
      console.error('Failed to dismiss employee:', err);
    }
    setDismissConfirm(null);
  };

  const handleReactivate = async (emp: UserFull) => {
    try {
      await employeesApi.upsertHrData(emp.id, { data_demissao: '' });
      loadEmployees();
    } catch (err) {
      console.error('Failed to reactivate employee:', err);
    }
    setReactivateConfirm(null);
  };

  return (
    <div>
      <PageHeader
        title={t('employees.title')}
        subtitle={t('employees.subtitle')}
        actions={
          <Link to="/funcionario/novo" className="btn btn-primary">
            <Plus size={18} /> {t('employees.addEmployee')}
          </Link>
        }
      />

      {/* Search + Filters */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-secondary-text)',
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder={t('employees.searchEmployees')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-alternate)' }}>
          {(['ativo', 'inativo', 'todos'] as const).map((opt) => {
            const labels = { ativo: 'Ativos', inativo: 'Inativos', todos: 'Todos' };
            const active = statusFilter === opt;
            return (
              <button
                key={opt}
                onClick={() => { setStatusFilter(opt); setPage(1); }}
                style={{
                  padding: '7px 16px',
                  fontSize: '0.82rem',
                  fontWeight: active ? 600 : 400,
                  background: active ? 'var(--color-primary)' : 'transparent',
                  color: active ? '#fff' : 'var(--color-secondary-text)',
                  border: 'none',
                  borderRight: opt !== 'todos' ? '1px solid var(--color-alternate)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {labels[opt]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : employees.length === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <Link to="/funcionario/novo" className="btn btn-primary">
              <Plus size={18} /> {t('employees.addEmployee')}
            </Link>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <SortableHeader label={t('employees.name')} field="name" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('employees.email')} field="email" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('employees.phone')} field="phone" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <SortableHeader label={t('employees.role')} field="roleName" currentField={sortField} currentDirection={sortDirection} onSort={handleSort} />
                <th>Status</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {employees.map((emp) => {
                const isInactive = !!emp.hr_data?.data_demissao;
                return (
                  <motion.tr
                    key={emp.id}
                    variants={tableRowVariants}
                    onClick={() => navigate(`/funcionario/${emp.id}`)}
                    style={{ cursor: 'pointer', opacity: isInactive ? 0.6 : 1 }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UserCircle size={20} color={isInactive ? 'var(--color-secondary-text)' : 'var(--color-primary)'} />
                        <span style={{ fontWeight: 500 }}>{emp.hr_data?.nome_completo || emp.name || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={14} color="var(--color-secondary-text)" />
                        {emp.email || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="var(--color-secondary-text)" />
                        {emp.phone || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Shield size={14} color="var(--color-secondary-text)" />
                        {emp.hr_data?.cargo || '-'}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: isInactive ? 'var(--color-alternate)' : 'rgba(34,197,94,0.12)',
                        color: isInactive ? 'var(--color-secondary-text)' : '#16a34a',
                      }}>
                        {isInactive ? 'Inativo' : 'Ativo'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                        <Link to={`/funcionario/${emp.id}`} className="btn btn-icon" title={t('common.edit')}>
                          <Edit size={16} color="var(--color-secondary-text)" />
                        </Link>
                        {emp.id !== user?.id && (
                          isInactive ? (
                            <button
                              className="btn btn-icon"
                              title="Reativar funcionário"
                              onClick={() => setReactivateConfirm(emp)}
                            >
                              <UserCheck size={16} color="var(--color-success, #16a34a)" />
                            </button>
                          ) : (
                            <button
                              className="btn btn-icon"
                              title="Demitir funcionário"
                              onClick={() => setDismissConfirm(emp)}
                            >
                              <UserMinus size={16} color="var(--color-error)" />
                            </button>
                          )
                        )}
                      </div>
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
            onPageChange={setPage}
            onPerPageChange={(pp) => {
              setPerPage(pp);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Dismiss Confirm */}
      {dismissConfirm !== null && (
        <ConfirmModal
          title="Demitir funcionário"
          message={`Tem certeza que deseja demitir ${dismissConfirm.hr_data?.nome_completo || dismissConfirm.name}? O funcionário será marcado como inativo e seu histórico será preservado.`}
          onConfirm={() => handleDismiss(dismissConfirm)}
          onCancel={() => setDismissConfirm(null)}
        />
      )}

      {/* Reactivate Confirm */}
      {reactivateConfirm !== null && (
        <ConfirmModal
          title="Reativar funcionário"
          message={`Deseja reativar ${reactivateConfirm.hr_data?.nome_completo || reactivateConfirm.name}?`}
          onConfirm={() => handleReactivate(reactivateConfirm)}
          onCancel={() => setReactivateConfirm(null)}
        />
      )}
    </div>
  );
}
