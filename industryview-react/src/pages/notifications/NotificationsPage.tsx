import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { notificationsApi } from '../../services';
import type { Notification } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchableSelect from '../../components/common/SearchableSelect';
import { Bell, BellOff, Trash2, CheckCheck, Filter } from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

const NOTIFICATION_TYPES = [
  'task',
  'sprint',
  'project',
  'team',
  'inventory',
  'safety',
  'system',
] as const;

type ReadFilter = 'all' | 'unread' | 'read';

function getTypeBadgeStyle(type: string): { backgroundColor: string; color: string } {
  const styles: Record<string, { backgroundColor: string; color: string }> = {
    task: { backgroundColor: 'var(--color-tertiary-bg)', color: 'var(--color-primary)' },
    sprint: { backgroundColor: 'var(--color-status-03)', color: '#5B4FCF' },
    project: { backgroundColor: 'var(--color-accent2)', color: '#1A7ABF' },
    team: { backgroundColor: 'var(--color-status-04)', color: 'var(--color-success)' },
    inventory: { backgroundColor: 'var(--color-status-06)', color: 'var(--color-tertiary)' },
    safety: { backgroundColor: 'var(--color-status-05)', color: 'var(--color-error)' },
    system: { backgroundColor: 'var(--color-status-01)', color: 'var(--color-secondary-text)' },
  };
  return styles[type] ?? { backgroundColor: 'var(--color-status-01)', color: 'var(--color-secondary-text)' };
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { setNavBarSelection } = useAppState();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setNavBarSelection(29);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof notificationsApi.listNotifications>[0] = {
        page,
        per_page: perPage,
      };
      if (typeFilter) params.type = typeFilter;
      if (readFilter === 'read') params.is_read = true;
      if (readFilter === 'unread') params.is_read = false;

      const data = await notificationsApi.listNotifications(params);
      setNotifications(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, typeFilter, readFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: number) => {
    setActionLoading(id);
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      showToast(t('notifications.markAsRead'));
    } catch (err) {
      console.error('Failed to mark as read:', err);
      showToast(t('common.errorOccurred'), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkAllLoading(true);
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast(t('notifications.markAllAsRead'));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      showToast(t('common.errorOccurred'), 'error');
    } finally {
      setMarkAllLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationsApi.deleteNotification(id);
      loadNotifications();
      showToast(t('common.deleted'));
    } catch (err) {
      console.error('Failed to delete notification:', err);
      showToast(t('common.errorOccurred'), 'error');
    }
    setDeleteConfirm(null);
  };

  const handleFilterChange = (field: 'type' | 'read', value: string) => {
    if (field === 'type') setTypeFilter(value);
    if (field === 'read') setReadFilter(value as ReadFilter);
    setPage(1);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <PageHeader
        title={t('notifications.title')}
        subtitle={t('notifications.subtitle')}
        actions={
          <button
            className="btn btn-secondary"
            onClick={handleMarkAllAsRead}
            disabled={markAllLoading || unreadCount === 0}
          >
            <CheckCheck size={18} />
            {markAllLoading ? t('common.loading') : t('notifications.markAllAsRead')}
          </button>
        }
      />

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={16} color="var(--color-secondary-text)" />
          <span style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
            {t('common.filters', 'Filtros')}:
          </span>
        </div>

        {/* Type dropdown */}
        <SearchableSelect
          options={NOTIFICATION_TYPES.map((type) => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }))}
          value={typeFilter || undefined}
          onChange={(val) => handleFilterChange('type', String(val ?? ''))}
          placeholder={t('common.allTypes', 'Todos os tipos')}
          allowClear
          style={{ minWidth: '160px' }}
        />

        {/* Read status toggle */}
        <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--color-alternate)' }}>
          {(['all', 'unread', 'read'] as ReadFilter[]).map((status) => {
            const labels: Record<ReadFilter, string> = {
              all: t('common.all', 'Todas'),
              unread: t('notifications.unread'),
              read: t('notifications.read'),
            };
            const isActive = readFilter === status;
            return (
              <button
                key={status}
                onClick={() => handleFilterChange('read', status)}
                style={{
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  border: 'none',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--color-secondary-text)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                }}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>

        {unreadCount > 0 && (
          <span className="badge" style={{
            backgroundColor: 'var(--color-status-05)',
            color: 'var(--color-error)',
            fontWeight: 600,
          }}>
            {unreadCount} {t('notifications.unread')}
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<BellOff size={48} />}
          message={t('notifications.noNotifications')}
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '28px' }} />
                <th>{t('common.title', 'Titulo')}</th>
                <th>{t('common.message', 'Mensagem')}</th>
                <th>{t('common.type', 'Tipo')}</th>
                <th>{t('common.status', 'Status')}</th>
                <th>{t('common.date', 'Data')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {notifications.map((notification) => {
                const isUnread = !notification.is_read;
                const badgeStyle = getTypeBadgeStyle(notification.type);

                return (
                  <motion.tr
                    key={notification.id}
                    variants={tableRowVariants}
                    style={{
                      backgroundColor: isUnread ? 'var(--color-status-03)' : 'transparent',
                    }}
                  >
                    {/* Unread indicator dot */}
                    <td style={{ textAlign: 'center' }}>
                      {isUnread && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                          margin: '0 auto',
                        }} />
                      )}
                    </td>

                    {/* Title */}
                    <td style={{ minWidth: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell
                          size={15}
                          color={isUnread ? 'var(--color-primary)' : 'var(--color-secondary-text)'}
                        />
                        <span style={{
                          fontWeight: isUnread ? 600 : 400,
                          fontSize: '13px',
                          color: 'var(--color-primary-text)',
                        }}>
                          {notification.title}
                        </span>
                      </div>
                    </td>

                    {/* Message preview */}
                    <td style={{ maxWidth: '280px' }}>
                      <span style={{
                        fontSize: '13px',
                        color: 'var(--color-secondary-text)',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {notification.message}
                      </span>
                    </td>

                    {/* Type badge */}
                    <td>
                      <span className="badge" style={badgeStyle}>
                        {notification.type}
                      </span>
                    </td>

                    {/* Read status */}
                    <td>
                      <span
                        className="badge"
                        style={isUnread
                          ? { backgroundColor: 'var(--color-status-05)', color: 'var(--color-error)' }
                          : { backgroundColor: 'var(--color-status-04)', color: 'var(--color-success)' }
                        }
                      >
                        {isUnread ? t('notifications.unread') : t('notifications.read')}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap', color: 'var(--color-secondary-text)' }}>
                      {formatDateTime(notification.created_at)}
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {isUnread && (
                          <button
                            className="btn btn-icon"
                            title={t('notifications.markAsRead')}
                            disabled={actionLoading === notification.id}
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            {actionLoading === notification.id ? (
                              <div className="spinner" style={{ width: '14px', height: '14px' }} />
                            ) : (
                              <CheckCheck size={15} color="var(--color-success)" />
                            )}
                          </button>
                        )}
                        <button
                          className="btn btn-icon"
                          title={t('common.delete')}
                          onClick={() => setDeleteConfirm(notification.id)}
                        >
                          <Trash2 size={15} color="var(--color-error)" />
                        </button>
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

      {/* Delete confirm modal */}
      {deleteConfirm !== null && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('common.confirmDeleteMessage', 'Tem certeza que deseja excluir esta notificacao?')}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 2000,
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: 'var(--shadow-lg)',
          maxWidth: '320px',
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
