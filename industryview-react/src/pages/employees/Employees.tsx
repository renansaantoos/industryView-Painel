import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { usersApi } from '../../services';
import type { UserFull } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Plus, Search, Edit, Trash2, UserCircle, Mail, Phone, Shield } from 'lucide-react';
import SortableHeader, { useBackendSort } from '../../components/common/SortableHeader';

export default function Employees() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setNavBarSelection } = useAppState();

  const [employees, setEmployees] = useState<UserFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

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
      });
      setEmployees(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search, sortField, sortDirection]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const handleDelete = async (id: number) => {
    try {
      await usersApi.deleteUser(id);
      loadEmployees();
    } catch (err) {
      console.error('Failed to delete employee:', err);
    }
    setDeleteConfirm(null);
  };

  return (
    <div>
      <PageHeader
        title={t('employees.title')}
        subtitle={t('employees.subtitle')}
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/funcionario/novo')}>
            <Plus size={18} /> {t('employees.addEmployee')}
          </button>
        }
      />

      {/* Search */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
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
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : employees.length === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <button className="btn btn-primary" onClick={() => navigate('/funcionario/novo')}>
              <Plus size={18} /> {t('employees.addEmployee')}
            </button>
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
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {employees.map((emp) => (
                <motion.tr
                  key={emp.id}
                  variants={tableRowVariants}
                  onClick={() => navigate(`/funcionario/${emp.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserCircle size={20} color="var(--color-primary)" />
                      <span style={{ fontWeight: 500 }}>{emp.name || '-'}</span>
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
                    <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-icon" title={t('common.edit')} onClick={() => navigate(`/funcionario/${emp.id}`)}>
                        <Edit size={16} color="var(--color-secondary-text)" />
                      </button>
                      <button className="btn btn-icon" title={t('common.delete')} onClick={() => setDeleteConfirm(emp.id)}>
                        <Trash2 size={16} color="var(--color-error)" />
                      </button>
                    </div>
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

      {/* Delete Confirm */}
      {deleteConfirm !== null && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('employees.confirmDelete')}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
