import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../contexts/AppStateContext';
import { safetyApi } from '../../services';
import type { DdsRecord, DdsParticipant, DdsStatistics } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import ProjectFilterDropdown from '../../components/common/ProjectFilterDropdown';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Plus,
  ClipboardList,
  CalendarDays,
  Users,
  ChevronDown,
  ChevronRight,
  UserPlus,
  PenLine,
} from 'lucide-react';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function SafetyDDS() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { projectsInfo, setNavBarSelection } = useAppState();

  // ── List state ────────────────────────────────────────────────────────────
  const [records, setRecords] = useState<DdsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // ── Statistics state ──────────────────────────────────────────────────────
  const [stats, setStats] = useState<DdsStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── Create DDS modal ──────────────────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTopic, setCreateTopic] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createTeam, setCreateTeam] = useState('');
  const [createDate, setCreateDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [createLoading, setCreateLoading] = useState(false);

  // ── Add participant modal ─────────────────────────────────────────────────
  const [addParticipantDdsId, setAddParticipantDdsId] = useState<number | null>(null);
  const [participantUserId, setParticipantUserId] = useState('');
  const [participantLoading, setParticipantLoading] = useState(false);

  // ── Sign participation modal ──────────────────────────────────────────────
  const [signDdsId, setSignDdsId] = useState<number | null>(null);
  const [signUserId, setSignUserId] = useState('');
  const [signLoading, setSignLoading] = useState(false);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    setNavBarSelection(16);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await safetyApi.listDdsRecords({
        projects_id: projectsInfo?.id,
        company_id: user?.companyId,
        page,
        per_page: perPage,
      });
      setRecords(data.items || []);
      setTotalPages(data.pageTotal || 1);
      setTotalItems(data.itemsTotal || 0);
    } catch (err) {
      console.error('Failed to load DDS records:', err);
      showToast(t('common.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  }, [projectsInfo, user?.companyId, page, perPage, showToast, t]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await safetyApi.getDdsStatistics({
        projects_id: projectsInfo?.id,
        company_id: user?.companyId,
      });
      setStats(data);
    } catch (err) {
      console.error('Failed to load DDS statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [projectsInfo, user?.companyId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleToggleExpand = useCallback(
    async (ddsId: number) => {
      if (expandedRow === ddsId) {
        setExpandedRow(null);
        return;
      }
      setExpandedRow(ddsId);
      // Fetch full record with participants if not already loaded
      const existing = records.find((r) => r.id === ddsId);
      if (existing && !existing.participants) {
        try {
          const full = await safetyApi.getDdsRecord(ddsId);
          setRecords((prev) => prev.map((r) => (r.id === ddsId ? { ...r, participants: full.participants } : r)));
        } catch (err) {
          console.error('Failed to load DDS participants:', err);
        }
      }
    },
    [expandedRow, records],
  );

  const handleCreateDds = async () => {
    if (!createTopic.trim()) return;
    setCreateLoading(true);
    try {
      await safetyApi.createDdsRecord({
        topic: createTopic.trim(),
        description: createDescription.trim() || undefined,
        team: createTeam.trim() || undefined,
        dds_date: createDate,
        projects_id: projectsInfo?.id,
        company_id: user?.companyId,
      });
      setCreateTopic('');
      setCreateDescription('');
      setCreateTeam('');
      setCreateDate(new Date().toISOString().split('T')[0]);
      setShowCreateModal(false);
      showToast(t('dds.createSuccess'), 'success');
      loadRecords();
      loadStats();
    } catch (err) {
      console.error('Failed to create DDS record:', err);
      showToast(t('common.errorSaving'), 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!addParticipantDdsId || !participantUserId.trim()) return;
    setParticipantLoading(true);
    try {
      await safetyApi.addDdsParticipant(addParticipantDdsId, {
        users_id: parseInt(participantUserId, 10),
      });
      // Refresh the expanded row participants
      const full = await safetyApi.getDdsRecord(addParticipantDdsId);
      setRecords((prev) =>
        prev.map((r) => (r.id === addParticipantDdsId ? { ...r, participants: full.participants, participants_count: full.participants_count } : r)),
      );
      setParticipantUserId('');
      setAddParticipantDdsId(null);
      showToast(t('dds.participantAdded'), 'success');
    } catch (err) {
      console.error('Failed to add participant:', err);
      showToast(t('common.errorSaving'), 'error');
    } finally {
      setParticipantLoading(false);
    }
  };

  const handleSign = async () => {
    if (!signDdsId || !signUserId.trim()) return;
    setSignLoading(true);
    try {
      await safetyApi.signDdsParticipation(signDdsId, {
        users_id: parseInt(signUserId, 10),
      });
      // Refresh participants list
      const full = await safetyApi.getDdsRecord(signDdsId);
      setRecords((prev) =>
        prev.map((r) => (r.id === signDdsId ? { ...r, participants: full.participants } : r)),
      );
      setSignUserId('');
      setSignDdsId(null);
      showToast(t('dds.signedSuccess'), 'success');
    } catch (err) {
      console.error('Failed to sign DDS participation:', err);
      showToast(t('common.errorSaving'), 'error');
    } finally {
      setSignLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // ── Stats card definitions ────────────────────────────────────────────────
  const statCards = [
    {
      key: 'total',
      label: t('dds.totalDds'),
      value: statsLoading ? '—' : (stats?.total ?? 0),
      icon: <ClipboardList size={24} />,
      color: 'var(--color-primary)',
    },
    {
      key: 'this_month',
      label: t('dds.thisMonth'),
      value: statsLoading ? '—' : (stats?.this_month ?? 0),
      icon: <CalendarDays size={24} />,
      color: 'var(--color-success)',
    },
    {
      key: 'avg_participants',
      label: t('dds.avgParticipants'),
      value: statsLoading ? '—' : (stats?.avg_participants != null ? stats.avg_participants.toFixed(1) : '0.0'),
      icon: <Users size={24} />,
      color: 'var(--color-warning)',
    },
  ];

  return (
    <div>
      <PageHeader
        title={t('dds.title')}
        subtitle={t('dds.subtitle')}
        actions={
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> {t('dds.newDds')}
          </button>
        }
      />

      <ProjectFilterDropdown />

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {statCards.map((card) => (
          <div key={card.key} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: `${card.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                flexShrink: 0,
              }}
            >
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginBottom: '2px' }}>
                {card.label}
              </p>
              <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-primary-text)' }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : records.length === 0 ? (
        <EmptyState
          message={t('common.noData')}
          action={
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> {t('dds.newDds')}
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '36px' }} />
                <th>{t('dds.date')}</th>
                <th>{t('dds.topic')}</th>
                <th>{t('dds.conductor')}</th>
                <th>{t('dds.team')}</th>
                <th>{t('dds.participantsCount')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <motion.tbody variants={staggerParent} initial="initial" animate="animate">
              {records.map((record) => (
                <>
                  <motion.tr key={record.id} variants={tableRowVariants}>
                    {/* Expand toggle */}
                    <td>
                      <button
                        className="btn btn-icon"
                        onClick={() => handleToggleExpand(record.id)}
                        style={{ padding: '2px' }}
                      >
                        {expandedRow === record.id ? (
                          <ChevronDown size={16} color="var(--color-primary)" />
                        ) : (
                          <ChevronRight size={16} color="var(--color-secondary-text)" />
                        )}
                      </button>
                    </td>
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {formatDate(record.dds_date)}
                    </td>
                    <td style={{ fontWeight: 500, maxWidth: '240px' }}>
                      <span
                        style={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={record.topic}
                      >
                        {record.topic}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px' }}>{record.conductor_name || '-'}</td>
                    <td style={{ fontSize: '13px' }}>{record.team || '-'}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: 'var(--color-status-04)',
                          color: 'var(--color-success)',
                        }}
                      >
                        <Users size={12} style={{ marginRight: '4px' }} />
                        {record.participants_count ?? 0}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="btn btn-icon"
                          title={t('dds.addParticipant')}
                          onClick={() => {
                            setAddParticipantDdsId(record.id);
                            setExpandedRow(record.id);
                          }}
                        >
                          <UserPlus size={16} color="var(--color-primary)" />
                        </button>
                        <button
                          className="btn btn-icon"
                          title={t('dds.signParticipation')}
                          onClick={() => setSignDdsId(record.id)}
                        >
                          <PenLine size={16} color="var(--color-success)" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>

                  {/* Expanded participants row */}
                  {expandedRow === record.id && (
                    <tr key={`${record.id}-expanded`}>
                      <td colSpan={7} style={{ padding: '0', backgroundColor: 'var(--color-primary-bg)' }}>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-alternate)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary-text)' }}>
                              {t('dds.participants')}
                            </p>
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: '12px', padding: '4px 10px' }}
                              onClick={() => setAddParticipantDdsId(record.id)}
                            >
                              <UserPlus size={13} /> {t('dds.addParticipant')}
                            </button>
                          </div>
                          {!record.participants ? (
                            <LoadingSpinner />
                          ) : record.participants.length === 0 ? (
                            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', fontStyle: 'italic' }}>
                              {t('dds.noParticipants')}
                            </p>
                          ) : (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {record.participants.map((participant: DdsParticipant) => (
                                <div
                                  key={participant.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    backgroundColor: participant.signed
                                      ? 'var(--color-status-04)'
                                      : 'var(--color-alternate)',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    color: participant.signed
                                      ? 'var(--color-success)'
                                      : 'var(--color-secondary-text)',
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor: participant.signed
                                        ? 'var(--color-success)'
                                        : 'var(--color-secondary-text)',
                                      flexShrink: 0,
                                    }}
                                  />
                                  {participant.user_name || `ID ${participant.users_id}`}
                                  {participant.signed && (
                                    <span style={{ fontSize: '10px', opacity: 0.8 }}>
                                      {t('dds.signed')}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
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

      {/* Create DDS Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div
            className="modal-content"
            style={{ padding: '24px', width: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
              {t('dds.newDds')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label>{t('dds.topic')} *</label>
                <input
                  className="input-field"
                  value={createTopic}
                  onChange={(e) => setCreateTopic(e.target.value)}
                  placeholder={t('dds.topicPlaceholder')}
                  autoFocus
                />
              </div>
              <div className="input-group">
                <label>{t('dds.description')}</label>
                <textarea
                  className="input-field"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder={t('dds.descriptionPlaceholder')}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>{t('dds.team')}</label>
                  <input
                    className="input-field"
                    value={createTeam}
                    onChange={(e) => setCreateTeam(e.target.value)}
                    placeholder={t('dds.teamPlaceholder')}
                  />
                </div>
                <div className="input-group">
                  <label>{t('dds.date')} *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={createDate}
                    onChange={(e) => setCreateDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateDds}
                disabled={createLoading || !createTopic.trim()}
              >
                {createLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Participant Modal */}
      {addParticipantDdsId !== null && (
        <div className="modal-backdrop" onClick={() => setAddParticipantDdsId(null)}>
          <div
            className="modal-content"
            style={{ padding: '24px', width: '380px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
              {t('dds.addParticipant')}
            </h3>
            <div className="input-group">
              <label>{t('dds.userId')} *</label>
              <input
                type="number"
                className="input-field"
                value={participantUserId}
                onChange={(e) => setParticipantUserId(e.target.value)}
                placeholder={t('dds.userIdPlaceholder')}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setAddParticipantDdsId(null)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddParticipant}
                disabled={participantLoading || !participantUserId.trim()}
              >
                {participantLoading ? <span className="spinner" /> : t('common.add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Participation Modal */}
      {signDdsId !== null && (
        <div className="modal-backdrop" onClick={() => setSignDdsId(null)}>
          <div
            className="modal-content"
            style={{ padding: '24px', width: '380px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
              {t('dds.signParticipation')}
            </h3>
            <div className="input-group">
              <label>{t('dds.userId')} *</label>
              <input
                type="number"
                className="input-field"
                value={signUserId}
                onChange={(e) => setSignUserId(e.target.value)}
                placeholder={t('dds.userIdPlaceholder')}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setSignDdsId(null)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSign}
                disabled={signLoading || !signUserId.trim()}
              >
                {signLoading ? <span className="spinner" /> : t('dds.sign')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 2000,
            padding: '12px 20px',
            borderRadius: '8px',
            background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: 'var(--shadow-lg)',
            animation: 'fadeIn 0.2s ease',
            maxWidth: '360px',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
