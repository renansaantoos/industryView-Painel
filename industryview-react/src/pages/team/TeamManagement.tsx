import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { projectsApi, usersApi } from '../../services';
import type {
  Team, TeamMember, TeamLeader,
  TeamProject, TeamProjectHistory, MemberSnapshotEntry, ProjectInfo, TeamConflictResponse,
  TeamMembersHistory,
} from '../../types';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchableSelect from '../../components/common/SearchableSelect';
import SortableHeader from '../../components/common/SortableHeader';
import ProjectSelector from '../../components/common/ProjectSelector';
import {
  Plus, Search, ArrowLeft, Trash2, UserPlus, Crown, Users,
  ChevronLeft, ChevronRight, UserCheck, FolderOpen,
  Link2, Unlink, History, ChevronDown, ChevronUp, Filter, X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild, tableRowVariants } from '../../lib/motion';

/* =========================================
   Helpers
   ========================================= */

function getAvatarUrl(name: string) {
  const initials = (name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(initials)}&size=128`;
}

/** Remove acentos, converte para minúsculo */
function normalize(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Busca por similaridade: cada palavra digitada deve aparecer no texto alvo.
 * Ex: "mont alpha" encontra "Equipe Montagem Alpha"
 * Ex: "eletrica" encontra "Equipe Elétrica Norte"
 */
function fuzzyMatch(target: string | null | undefined, query: string): boolean {
  if (!target) return false;
  const norm = normalize(target);
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  return words.every((w) => norm.includes(w));
}

/** Aplica mascara de telefone BR: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX */
function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function paginate<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(page, totalPages);
  return {
    items: items.slice((safePage - 1) * perPage, safePage * perPage),
    page: safePage,
    totalPages,
    total: items.length,
  };
}

const TEAMS_PER_PAGE = 10;
const LEADERS_PER_PAGE = 6;
const MEMBERS_PER_PAGE = 10;

/* =========================================
   Pagination Controls
   ========================================= */

function PaginationControls({ page, totalPages, total, perPage, onPageChange, label }: {
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (p: number) => void;
  label?: string;
}) {
  if (totalPages <= 1) return null;
  const startItem = total > 0 ? (page - 1) * perPage + 1 : 0;
  const endItem = Math.min(page * perPage, total);
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0 0',
      borderTop: '1px solid var(--color-alternate)',
      marginTop: '12px',
    }}>
      <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>
        {startItem}-{endItem} de {total} {label || 'resultados'}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          className="btn btn-icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={{ opacity: page <= 1 ? 0.3 : 1, padding: '4px' }}
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: '12px', fontWeight: 500, minWidth: '48px', textAlign: 'center' }}>
          {page} / {totalPages}
        </span>
        <button
          className="btn btn-icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{ opacity: page >= totalPages ? 0.3 : 1, padding: '4px' }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* =========================================
   AddUserModal
   ========================================= */

interface QuickRegisterForm {
  name: string;
  email: string;
  phone: string;
  users_roles_id: number;
}

interface Role {
  id: number;
  role: string;
}

interface AddUserModalProps {
  title: string;
  onClose: () => void;
  onSave: (userIds: number[]) => Promise<void>;
  saving: boolean;
  teamId?: number;
}

interface SearchUserItem {
  id: number;
  name: string;
  email: string;
  hasTeam?: boolean;
  isMemberOfCurrentTeam?: boolean;
}

interface SelectedUser {
  id: number;
  name: string;
}

function AddUserModal({ title, onClose, onSave, saving, teamId }: AddUserModalProps) {
  const { t } = useTranslation();

  const [userSearch, setUserSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [showQuickRegister, setShowQuickRegister] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Partial<QuickRegisterForm & { submit: string }>>({});

  // Paginated user search state
  const [searchResults, setSearchResults] = useState<SearchUserItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [quickForm, setQuickForm] = useState<QuickRegisterForm>({
    name: '',
    email: '',
    phone: '',
    users_roles_id: 0,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedUserIds = useMemo(() => new Set(selectedUsers.map((u) => u.id)), [selectedUsers]);

  // Fetch users from paginated API
  const fetchUsers = useCallback(async (search: string, page: number, append = false) => {
    setSearchLoading(true);
    try {
      const data = await usersApi.searchUsersForTeam({
        search: search || undefined,
        page,
        per_page: 15,
        teams_id: teamId || undefined,
      });
      const items = (data.items || []) as SearchUserItem[];
      setSearchResults(prev => append ? [...prev, ...items] : items);
      setTotalResults(data.itemsTotal || 0);
      setHasMore(page < (data.pageTotal || 1));
      setSearchPage(page);
    } catch (err) {
      console.error('Error searching users:', err);
      if (!append) setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Load initial results on mount
  useEffect(() => {
    fetchUsers('', 1);
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers(userSearch, 1);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [userSearch, fetchUsers]);

  // Load more on scroll
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || searchLoading || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
      fetchUsers(userSearch, searchPage + 1, true);
    }
  }, [searchLoading, hasMore, userSearch, searchPage, fetchUsers]);

  const hasSearchTerm = userSearch.trim().length > 0;
  const showNoResults = hasSearchTerm && !searchLoading && searchResults.length === 0 && !showQuickRegister;

  const openQuickRegister = useCallback(async () => {
    setQuickForm((prev) => ({ ...prev, name: userSearch.trim() }));
    setShowQuickRegister(true);

    if (roles.length === 0) {
      setRolesLoading(true);
      try {
        const data = await usersApi.queryAllRoles();
        const list = Array.isArray(data) ? data : (data?.items ?? []);
        setRoles(list);
      } catch {
        setRoles([]);
      } finally {
        setRolesLoading(false);
      }
    }
  }, [userSearch, roles.length]);

  const handleBackToSearch = () => {
    setShowQuickRegister(false);
    setFormErrors({});
    setSuccessMessage('');
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const validateQuickForm = (): boolean => {
    const errors: Partial<QuickRegisterForm & { submit: string }> = {};
    if (!quickForm.name.trim()) errors.name = t('teams.nameRequired');
    if (!quickForm.email.trim()) errors.email = t('teams.emailRequired');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleQuickRegister = async () => {
    if (!validateQuickForm()) return;
    setRegisterLoading(true);
    setFormErrors({});

    try {
      const newUser = await usersApi.addUser({
        name: quickForm.name.trim(),
        email: quickForm.email.trim(),
        phone: quickForm.phone.replace(/\D/g, '').trim() || undefined,
        users_roles_id: quickForm.users_roles_id > 0 ? quickForm.users_roles_id : undefined,
      });

      setSuccessMessage(t('teams.collaboratorRegistered'));

      setTimeout(async () => {
        await onSave([newUser.id]);
      }, 800);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setFormErrors({
        submit: apiError?.response?.data?.message ?? 'Erro ao cadastrar colaborador. Verifique os dados e tente novamente.',
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  // Toggle a user in/out of the selected set without touching the search input
  const handleSelectUser = (user: SearchUserItem) => {
    setSelectedUsers((prev) => {
      const alreadySelected = prev.some((u) => u.id === user.id);
      if (alreadySelected) {
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, { id: user.id, name: user.name }];
    });
  };

  const handleRemoveChip = (userId: number) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleSaveSelected = async () => {
    if (selectedUsers.length === 0) return;
    await onSave(selectedUsers.map((u) => u.id));
  };

  const modalWidth = showQuickRegister ? '520px' : '460px';

  const saveLabel = selectedUsers.length > 0
    ? `${t('common.save')} (${selectedUsers.length})`
    : t('common.save');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes chipIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      <div
        className="modal-content"
        style={{ padding: '24px', width: modalWidth, transition: 'width 0.25s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          {showQuickRegister && (
            <button
              className="btn btn-icon"
              onClick={handleBackToSearch}
              title={t('teams.backToSearch')}
              style={{ flexShrink: 0 }}
            >
              <ChevronLeft size={18} color="var(--color-secondary-text)" />
            </button>
          )}
          <h3 style={{ fontSize: '16px', fontWeight: 600, flex: 1 }}>
            {showQuickRegister ? t('teams.quickRegister') : title}
          </h3>
        </div>

        {!showQuickRegister && (
          <>
            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: 500 }}>{t('teams.searchUser')}</label>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute', left: '10px', top: '50%',
                    transform: 'translateY(-50%)', color: 'var(--color-secondary-text)',
                  }}
                />
                <input
                  ref={searchInputRef}
                  className="input-field"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={t('teams.searchUserPlaceholder')}
                  style={{ paddingLeft: '32px' }}
                  autoFocus
                />
              </div>
            </div>

            {/* Selected users chips */}
            {selectedUsers.length > 0 && (
              <div
                style={{
                  display: 'flex', flexWrap: 'wrap', gap: '6px',
                  marginTop: '10px', padding: '8px',
                  background: 'var(--color-tertiary-bg)',
                  border: '1px solid var(--color-primary)',
                  borderRadius: '8px', maxHeight: '96px', overflowY: 'auto',
                }}
              >
                {selectedUsers.map((u) => (
                  <div
                    key={u.id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '3px 6px 3px 4px',
                      background: 'var(--color-primary)', color: '#fff',
                      borderRadius: '20px', fontSize: '12px', fontWeight: 500,
                      animation: 'chipIn 0.18s ease',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={getAvatarUrl(u.name)}
                      alt=""
                      style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0 }}
                    />
                    <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.name}
                    </span>
                    <button
                      onClick={() => handleRemoveChip(u.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', padding: '0',
                        color: 'rgba(255,255,255,0.8)', lineHeight: 1,
                      }}
                      aria-label={`Remover ${u.name}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div
              ref={listRef}
              onScroll={handleScroll}
              style={{
                maxHeight: '240px', overflowY: 'auto', marginTop: '8px',
                border: '1px solid var(--color-alternate)', borderRadius: '8px',
              }}
            >
              {showNoResults ? (
                <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '12px' }}>
                    {t('teams.noUserFound')}
                  </p>
                  <button
                    onClick={openQuickRegister}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', border: '1.5px dashed var(--color-primary)',
                      borderRadius: '8px', background: 'var(--color-tertiary-bg)',
                      color: 'var(--color-primary)', fontSize: '13px', fontWeight: 600,
                      cursor: 'pointer', width: '100%', justifyContent: 'center',
                    }}
                  >
                    <UserPlus size={15} />
                    {t('teams.registerNewCollaborator')}
                  </button>
                </div>
              ) : searchResults.length === 0 && searchLoading ? (
                <div style={{ padding: '16px 12px', textAlign: 'center' }}>
                  <span className="spinner" style={{ width: '18px', height: '18px', margin: '0 auto' }} />
                </div>
              ) : (
                <>
                  {totalResults > 0 && (
                    <div style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--color-secondary-text)', borderBottom: '1px solid var(--color-alternate)', background: 'var(--color-bg)' }}>
                      {totalResults} {t('common.results', 'resultados')}
                    </div>
                  )}
                  {searchResults.map((u) => {
                    const isInCurrentTeam = u.isMemberOfCurrentTeam === true;
                    const isSelected = selectedUserIds.has(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => !isInCurrentTeam && handleSelectUser(u)}
                        style={{
                          padding: '10px 12px',
                          cursor: isInCurrentTeam ? 'default' : 'pointer',
                          opacity: isInCurrentTeam ? 0.55 : 1,
                          backgroundColor: isSelected ? 'var(--color-tertiary-bg)' : 'transparent',
                          borderBottom: '1px solid var(--color-alternate)',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          transition: 'background-color 0.12s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected && !isInCurrentTeam) e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <img src={getAvatarUrl(u.name)} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                          {isSelected && !isInCurrentTeam && (
                            <div style={{
                              position: 'absolute', inset: 0, borderRadius: '50%',
                              background: 'rgba(99,102,241,0.85)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <UserCheck size={14} color="#fff" />
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px', color: isSelected ? 'var(--color-primary)' : 'inherit' }}>
                            {u.name}
                            {isInCurrentTeam && (
                              <span style={{
                                fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                                background: 'var(--color-alternate)',
                                color: 'var(--color-secondary-text)',
                                fontWeight: 600, whiteSpace: 'nowrap',
                              }}>
                                Ja na equipe
                              </span>
                            )}
                            {!isInCurrentTeam && u.hasTeam === false && (
                              <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'var(--color-status-04)', color: 'var(--color-success)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {t('teams.available', 'Disponível')}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {u.email}
                          </div>
                        </div>
                        {isSelected && !isInCurrentTeam && (
                          <UserCheck size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                        )}
                      </div>
                    );
                  })}
                  {searchLoading && searchResults.length > 0 && (
                    <div style={{ padding: '8px', textAlign: 'center' }}>
                      <span className="spinner" style={{ width: '16px', height: '16px', margin: '0 auto' }} />
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={onClose}>{t('common.cancel')}</button>
              <button className="btn btn-primary" onClick={handleSaveSelected} disabled={saving || selectedUsers.length === 0}>
                {saving ? <span className="spinner" /> : saveLabel}
              </button>
            </div>
          </>
        )}

        {showQuickRegister && (
          <div style={{ animation: 'slideIn 0.2s ease' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginBottom: '16px', lineHeight: 1.5 }}>
              {t('teams.quickRegisterSubtitle')}
            </p>
            <div style={{
              padding: '16px', borderRadius: '10px', border: '1.5px solid var(--color-primary)',
              background: 'var(--color-tertiary-bg)', display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              <div className="input-group">
                <label style={{ fontSize: '12px', fontWeight: 500 }}>
                  {t('teams.fullName')} <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  className={`input-field${formErrors.name ? ' error' : ''}`}
                  style={{ background: 'var(--color-secondary-bg)', fontSize: '13px' }}
                  value={quickForm.name}
                  onChange={(e) => {
                    setQuickForm((prev) => ({ ...prev, name: e.target.value }));
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder={t('teams.fullNamePlaceholder')}
                  autoFocus
                />
                {formErrors.name && <span className="input-error">{formErrors.name}</span>}
              </div>
              <div className="input-group">
                <label style={{ fontSize: '12px', fontWeight: 500 }}>
                  {t('common.email')} <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  className={`input-field${formErrors.email ? ' error' : ''}`}
                  style={{ background: 'var(--color-secondary-bg)', fontSize: '13px' }}
                  type="email"
                  value={quickForm.email}
                  onChange={(e) => {
                    setQuickForm((prev) => ({ ...prev, email: e.target.value }));
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder={t('teams.emailPlaceholder')}
                />
                {formErrors.email && <span className="input-error">{formErrors.email}</span>}
              </div>
              <div className="input-group">
                <label style={{ fontSize: '12px', fontWeight: 500 }}>{t('common.phone')}</label>
                <input
                  className="input-field"
                  style={{ background: 'var(--color-secondary-bg)', fontSize: '13px' }}
                  type="tel"
                  value={quickForm.phone}
                  onChange={(e) => setQuickForm((prev) => ({ ...prev, phone: formatPhoneBR(e.target.value) }))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
              <div className="input-group">
                <label style={{ fontSize: '12px', fontWeight: 500 }}>{t('teams.role')}</label>
                {rolesLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                    <span className="spinner" style={{ width: '16px', height: '16px' }} />
                    <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{t('common.loading')}</span>
                  </div>
                ) : (
                  <SearchableSelect
                    options={roles.map((r) => ({ value: r.id, label: r.role }))}
                    value={quickForm.users_roles_id || undefined}
                    onChange={(value) => setQuickForm((prev) => ({ ...prev, users_roles_id: value ? Number(value) : 0 }))}
                    placeholder={t('teams.roleSelect')}
                    searchPlaceholder={t('common.search')}
                    style={{ background: 'var(--color-secondary-bg)', fontSize: '13px' }}
                  />
                )}
              </div>
            </div>
            {formErrors.submit && (
              <div style={{
                marginTop: '10px', padding: '10px 12px', borderRadius: '8px',
                background: 'var(--color-status-05)', border: '1px solid var(--color-error)',
                fontSize: '12px', color: 'var(--color-error)',
              }}>
                {formErrors.submit}
              </div>
            )}
            {successMessage && (
              <div style={{
                marginTop: '10px', padding: '10px 12px', borderRadius: '8px',
                background: 'var(--color-status-04)', border: '1px solid var(--color-success)',
                fontSize: '12px', color: 'var(--color-success)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <UserCheck size={14} />
                {successMessage}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={handleBackToSearch} disabled={registerLoading}>
                <ChevronLeft size={16} /> {t('teams.backToSearch')}
              </button>
              <button className="btn btn-primary" onClick={handleQuickRegister} disabled={registerLoading || !!successMessage}>
                {registerLoading ? <span className="spinner" /> : <><UserPlus size={16} /> {t('teams.registerAndAdd')}</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================
   Main Component
   ========================================= */

export default function TeamManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectsInfo, teamId, setTeamId } = useAppState();

  const [teams, setTeams] = useState<Team[]>([]);
  const [leaders, setLeaders] = useState<TeamLeader[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  // allUsers removed - AddUserModal now fetches paginated data directly
  const [loading, setLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedTeamName, setSelectedTeamName] = useState('');

  // Pagination state
  const [teamsPage, setTeamsPage] = useState(1);
  const [leadersPage, setLeadersPage] = useState(1);
  const [membersPage, setMembersPage] = useState(1);

  // Members sort state
  const [membersSortField, setMembersSortField] = useState<string | null>(null);
  const [membersSortDirection, setMembersSortDirection] = useState<'asc' | 'desc' | null>(null);

  // Modal states
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddLeaderModal, setShowAddLeaderModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: number } | null>(null);

  // Teams-Projects states
  const [linkedProjects, setLinkedProjects] = useState<TeamProject[]>([]);
  const [showLinkProjectModal, setShowLinkProjectModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<TeamProjectHistory[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [expandedHistoryId, setExpandedHistoryId] = useState<number | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectInfo[]>([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [conflictData, setConflictData] = useState<TeamConflictResponse | null>(null);
  const [pendingLinkProjectId, setPendingLinkProjectId] = useState<number | null>(null);
  const [unlinkConfirm, setUnlinkConfirm] = useState<{ teams_id: number; projects_id: number; project_name: string } | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);

  // Members history states
  const [showMembersHistoryModal, setShowMembersHistoryModal] = useState(false);
  const [membersHistoryData, setMembersHistoryData] = useState<TeamMembersHistory[]>([]);
  const [membersHistoryPage, setMembersHistoryPage] = useState(1);
  const [membersHistoryTotal, setMembersHistoryTotal] = useState(0);
  const [membersHistoryTotalPages, setMembersHistoryTotalPages] = useState(1);

  // Leaders history states
  const [showLeadersHistoryModal, setShowLeadersHistoryModal] = useState(false);
  const [leadersHistoryData, setLeadersHistoryData] = useState<TeamMembersHistory[]>([]);
  const [leadersHistoryPage, setLeadersHistoryPage] = useState(1);
  const [leadersHistoryTotal, setLeadersHistoryTotal] = useState(0);
  const [leadersHistoryTotalPages, setLeadersHistoryTotalPages] = useState(1);

  // Project filter state (-1 = "sem projeto")
  const [projectFilter, setProjectFilter] = useState<number[]>([]);
  const [showProjectFilter, setShowProjectFilter] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const projectFilterRef = useRef<HTMLDivElement>(null);
  const filterSearchRef = useRef<HTMLInputElement>(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (projectFilterRef.current && !projectFilterRef.current.contains(e.target as Node)) {
        setShowProjectFilter(false);
        setFilterSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Auto-focus search input when filter opens
  useEffect(() => {
    if (showProjectFilter) {
      setTimeout(() => filterSearchRef.current?.focus(), 50);
    }
  }, [showProjectFilter]);

  // All company projects for the filter dropdown
  const availableProjectsForFilter = useMemo(() => {
    const mapped = allProjects
      .map((p) => ({ id: Number(p.id), name: p.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
    if (!filterSearch.trim()) return mapped;
    return mapped.filter((p) => fuzzyMatch(p.name, filterSearch.trim()));
  }, [allProjects, filterSearch]);

  const toggleProjectFilter = (id: number) => {
    setProjectFilter((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
    setTeamsPage(1);
  };

  // Reset teams pagination when search or filter changes
  useEffect(() => {
    setTeamsPage(1);
  }, [globalSearch, projectFilter]);

  // Reset leaders/members pagination when team changes
  useEffect(() => {
    setLeadersPage(1);
    setMembersPage(1);
  }, [teamId]);

  // projectsInfo guard is handled by the early return below

  /* --- Data loading --- */

  const loadTeams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectsApi.queryAllTeams({ per_page: 100 });
      const list = Array.isArray(data) ? data : (data.items || []);
      setTeams(list);
    } catch (err) {
      console.error('Erro ao carregar equipes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLeaders = useCallback(async () => {
    if (!teamId || teamId === 0) { setLeaders([]); return; }
    try {
      const data = await projectsApi.queryAllTeamLeaders(teamId);
      const list = Array.isArray(data) ? data : [];
      setLeaders(list.map((l: Record<string, unknown>) => ({
        id: l.id as number,
        teamsId: l.teams_id as number,
        usersId: (l.users as Record<string, unknown>)?.id as number || l.users_id as number,
        userName: (l.users as Record<string, unknown>)?.name as string || '',
        userEmail: (l.users as Record<string, unknown>)?.email as string || '',
      })));
    } catch (err) {
      console.error('Erro ao carregar líderes:', err);
      setLeaders([]);
    }
  }, [teamId]);

  const loadMembers = useCallback(async () => {
    if (!teamId || teamId === 0) { setMembers([]); return; }
    try {
      const data = await projectsApi.queryAllTeamMembers(teamId);
      const list = Array.isArray(data) ? data : (data as unknown as { items?: unknown[] })?.items || [];
      setMembers((list as Record<string, unknown>[]).map((m) => ({
        id: m.id as number,
        teamsId: m.teams_id as number,
        usersId: (m.users as Record<string, unknown>)?.id as number || m.users_id as number,
        userName: (m.users as Record<string, unknown>)?.name as string || '',
        userEmail: (m.users as Record<string, unknown>)?.email as string || '',
        roleName: (m.users as Record<string, unknown>)?.users_permissions
          ? ((m.users as Record<string, unknown>).users_permissions as Record<string, unknown>)?.users_roles
            ? (((m.users as Record<string, unknown>).users_permissions as Record<string, unknown>).users_roles as Record<string, unknown>)?.name as string
              || ((((m.users as Record<string, unknown>).users_permissions as Record<string, unknown>).users_roles as Record<string, unknown>)?.role as string)
              || '-'
            : '-'
          : '-',
      })));
    } catch (err) {
      console.error('Erro ao carregar membros:', err);
      setMembers([]);
    }
  }, [teamId]);

  const loadLinkedProjects = useCallback(async () => {
    if (!teamId || teamId === 0) { setLinkedProjects([]); return; }
    try {
      const data = await projectsApi.listTeamProjects({ teams_id: teamId });
      const items = Array.isArray(data) ? data : (data.items || []);
      setLinkedProjects(items);
    } catch (err) {
      console.error('Erro ao carregar projetos vinculados:', err);
      setLinkedProjects([]);
    }
  }, [teamId]);

  const loadAllProjects = useCallback(async () => {
    try {
      const data = await projectsApi.queryAllProjects({ per_page: 100 });
      const list = Array.isArray(data) ? data : (data.items || []);
      setAllProjects(list);
    } catch (err) {
      console.error('Erro ao carregar todos os projetos:', err);
    }
  }, []);

  const loadHistory = useCallback(async (page: number = 1) => {
    if (!teamId || teamId === 0) return;
    try {
      const data = await projectsApi.getTeamProjectHistory({ teams_id: teamId, page, per_page: 10 });
      setHistoryData(data.items || []);
      setHistoryTotal(data.itemsTotal || 0);
      setHistoryTotalPages(data.pageTotal || 1);
      setHistoryPage(page);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setHistoryData([]);
    }
  }, [teamId]);

  const loadMembersHistory = useCallback(async (page: number = 1) => {
    if (!teamId || teamId === 0) return;
    try {
      const data = await projectsApi.getTeamMembersHistory({ teams_id: teamId, page, per_page: 10, member_type: 'member' });
      setMembersHistoryData(data.items || []);
      setMembersHistoryTotal(data.itemsTotal || 0);
      setMembersHistoryTotalPages(data.pageTotal || 1);
      setMembersHistoryPage(page);
    } catch (err) {
      console.error('Erro ao carregar histórico de membros:', err);
      setMembersHistoryData([]);
    }
  }, [teamId]);

  const loadLeadersHistory = useCallback(async (page: number = 1) => {
    if (!teamId || teamId === 0) return;
    try {
      const data = await projectsApi.getTeamMembersHistory({ teams_id: teamId, page, per_page: 10, member_type: 'leader' });
      setLeadersHistoryData(data.items || []);
      setLeadersHistoryTotal(data.itemsTotal || 0);
      setLeadersHistoryTotalPages(data.pageTotal || 1);
      setLeadersHistoryPage(page);
    } catch (err) {
      console.error('Erro ao carregar histórico de líderes:', err);
      setLeadersHistoryData([]);
    }
  }, [teamId]);

  useEffect(() => { loadTeams(); }, [loadTeams]);
  useEffect(() => { loadAllProjects(); }, [loadAllProjects]);
  useEffect(() => { loadLeaders(); loadMembers(); loadLinkedProjects(); }, [loadLeaders, loadMembers, loadLinkedProjects]);

  // Sync selectedTeamName when teams load or teamId changes
  useEffect(() => {
    if (teamId > 0 && teams.length > 0) {
      const found = teams.find((t: Team) => t.id === teamId);
      if (found) setSelectedTeamName(found.name);
    }
  }, [teamId, teams]);

  /* --- Filtered + Paginated data --- */

  const searchTrimmed = globalSearch.trim();

  const filteredTeams = useMemo(() => {
    let result = teams;

    // Apply project filter
    if (projectFilter.length > 0) {
      const wantNoProject = projectFilter.includes(-1);
      const projectIds = projectFilter.filter((id) => id !== -1);

      result = result.filter((team) => {
        const rawLinks = (team as any).teams_projects;
        const teamProjectIds: number[] = [];
        if (Array.isArray(rawLinks)) {
          rawLinks.forEach((lp: any) => {
            if (lp.projects?.id) teamProjectIds.push(Number(lp.projects.id));
          });
        }
        const hasNoProject = teamProjectIds.length === 0;
        if (wantNoProject && hasNoProject) return true;
        if (projectIds.length > 0 && projectIds.some((pid) => teamProjectIds.includes(pid))) return true;
        return false;
      });
    }

    // Apply text search - search in team name AND linked project names
    if (searchTrimmed) {
      result = result.filter((t) => {
        if (fuzzyMatch(t.name, searchTrimmed)) return true;
        const rawLinks = (t as any).teams_projects;
        if (Array.isArray(rawLinks)) {
          for (const lp of rawLinks) {
            if (lp.projects?.name && fuzzyMatch(lp.projects.name, searchTrimmed)) return true;
          }
        }
        return false;
      });
    }

    return result;
  }, [teams, searchTrimmed, projectFilter]);

  const filteredLeaders = useMemo(() => {
    if (!searchTrimmed) return leaders;
    return leaders.filter((l) =>
      fuzzyMatch(l.userName || '', searchTrimmed) ||
      fuzzyMatch(l.userEmail || '', searchTrimmed)
    );
  }, [leaders, searchTrimmed]);

  const filteredMembers = useMemo(() => {
    let result = members;
    if (searchTrimmed) {
      result = result.filter((m) =>
        fuzzyMatch(m.userName || '', searchTrimmed) ||
        fuzzyMatch(m.userEmail || '', searchTrimmed)
      );
    }
    if (membersSortField && membersSortDirection) {
      result = [...result].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[membersSortField] ?? '';
        const bVal = (b as Record<string, unknown>)[membersSortField] ?? '';
        const aStr = String(aVal);
        const bStr = String(bVal);
        const cmp = aStr.localeCompare(bStr, undefined, { sensitivity: 'base', numeric: true });
        return membersSortDirection === 'desc' ? -cmp : cmp;
      });
    }
    return result;
  }, [members, searchTrimmed, membersSortField, membersSortDirection]);

  const teamsPag = paginate(filteredTeams, teamsPage, TEAMS_PER_PAGE);
  const leadersPag = paginate(filteredLeaders, leadersPage, LEADERS_PER_PAGE);
  const membersPag = paginate(filteredMembers, membersPage, MEMBERS_PER_PAGE);

  /* --- Handlers --- */

  const handleCreateTeam = async () => {
    if (!projectsInfo || !newTeamName.trim()) return;
    setModalLoading(true);
    try {
      const team = await projectsApi.addTeam({ name: newTeamName.trim(), projects_id: projectsInfo.id });
      setTeamId(team.id);
      setSelectedTeamName(newTeamName.trim());
      setNewTeamName('');
      setShowCreateTeamModal(false);
      loadTeams();
    } catch (err) {
      console.error('Erro ao criar equipe:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddLeader = async (userIds: number[]) => {
    if (!teamId || userIds.length === 0) return;
    setModalLoading(true);
    try {
      await projectsApi.bulkAddTeamLeaders({ teams_id: teamId, users_ids: userIds });
      setShowAddLeaderModal(false);
      loadLeaders();
    } catch (err) {
      console.error('Erro ao adicionar lideres:', err);
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddMember = async (userIds: number[]) => {
    if (!teamId || userIds.length === 0) return;
    setModalLoading(true);
    try {
      await projectsApi.bulkAddTeamMembers({ teams_id: teamId, users_ids: userIds });
      setShowAddMemberModal(false);
      loadMembers();
    } catch (err) {
      console.error('Erro ao adicionar membros:', err);
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleMembersSort = (field: string) => {
    if (membersSortField === field) {
      if (membersSortDirection === 'asc') setMembersSortDirection('desc');
      else if (membersSortDirection === 'desc') { setMembersSortField(null); setMembersSortDirection(null); }
      else setMembersSortDirection('asc');
    } else {
      setMembersSortField(field);
      setMembersSortDirection('asc');
    }
  };

  const handleDeleteTeam = async (id: number) => {
    try {
      await projectsApi.deleteTeam(id);
      if (teamId === id) { setTeamId(0); setSelectedTeamName(''); }
      loadTeams();
    } catch (err) {
      console.error('Erro ao excluir equipe:', err);
    }
    setDeleteConfirm(null);
  };

  const handleDeleteMember = async (id: number) => {
    try {
      await projectsApi.deleteTeamMember(id);
      loadMembers();
    } catch (err) {
      console.error('Erro ao remover membro:', err);
    }
    setDeleteConfirm(null);
  };

  const handleDeleteLeader = async (id: number) => {
    try {
      await projectsApi.deleteTeamLeader(id);
      loadLeaders();
    } catch (err) {
      console.error('Erro ao remover líder:', err);
    }
    setDeleteConfirm(null);
  };

  const handleSelectTeam = (team: Team) => {
    setTeamId(team.id);
    setSelectedTeamName(team.name);
  };

  /* --- Teams-Projects handlers --- */

  const handleOpenLinkModal = async () => {
    if (allProjects.length === 0) await loadAllProjects();
    setProjectSearch('');
    setShowLinkProjectModal(true);
  };

  const handleLinkProject = async (projectId: number) => {
    if (!teamId) return;
    setLinkLoading(true);
    try {
      // Check conflicts first
      const conflicts = await projectsApi.checkTeamConflicts(teamId);
      if (conflicts.has_conflicts) {
        setConflictData(conflicts);
        setPendingLinkProjectId(projectId);
        setLinkLoading(false);
        return;
      }
      await doLinkProject(projectId);
    } catch (err) {
      console.error('Erro ao vincular:', err);
      setLinkLoading(false);
    }
  };

  const doLinkProject = async (projectId: number) => {
    if (!teamId) return;
    setLinkLoading(true);
    try {
      await projectsApi.linkTeamToProject({ teams_id: teamId, projects_id: projectId });
      setShowLinkProjectModal(false);
      setConflictData(null);
      setPendingLinkProjectId(null);
      loadLinkedProjects();
      loadTeams();
    } catch (err) {
      console.error('Erro ao vincular:', err);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleUnlinkProject = async () => {
    if (!unlinkConfirm) return;
    setLinkLoading(true);
    try {
      await projectsApi.unlinkTeamFromProject({
        teams_id: unlinkConfirm.teams_id,
        projects_id: unlinkConfirm.projects_id,
      });
      setUnlinkConfirm(null);
      loadLinkedProjects();
      loadTeams();
    } catch (err) {
      console.error('Erro ao desvincular:', err);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleOpenHistory = async () => {
    setExpandedHistoryId(null);
    await loadHistory(1);
    setShowHistoryModal(true);
  };

  const handleOpenMembersHistory = async () => {
    await loadMembersHistory(1);
    setShowMembersHistoryModal(true);
  };

  const handleOpenLeadersHistory = async () => {
    await loadLeadersHistory(1);
    setShowLeadersHistoryModal(true);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // Available projects for linking (exclude already linked)
  const linkedProjectIds = new Set(linkedProjects.map(lp => lp.projects_id));
  const availableProjects = allProjects.filter(
    (p) => !linkedProjectIds.has(p.id) && (!projectSearch || fuzzyMatch(p.name || '', projectSearch))
  );

  if (!projectsInfo) return <ProjectSelector />;

  const projectName = projectsInfo.name;

  return (
    <div>
      <PageHeader
        title={t('teams.title')}
        subtitle={t('teams.subtitle')}
        breadcrumb={`${t('projects.title')} / ${projectName} / ${t('teams.title')}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/projeto-detalhes')}>
              <ArrowLeft size={18} /> {t('common.back')}
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreateTeamModal(true)}>
              <Plus size={18} /> {t('teams.createTeam')}
            </button>
          </div>
        }
      />

      {/* Search + Project Filter + Chips - compact row */}
      <div style={{ marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '340px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute', left: '10px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--color-secondary-text)',
            }}
          />
          <input
            type="text"
            className="input-field"
            placeholder={t('teams.globalSearch')}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            style={{ paddingLeft: '34px', fontSize: '13px', height: '36px', borderRadius: '8px' }}
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-secondary-text)',
                fontSize: '16px', lineHeight: 1, padding: '2px',
              }}
            >
              &times;
            </button>
          )}
        </div>

        {/* Project Filter Dropdown */}
        <div ref={projectFilterRef} style={{ position: 'relative' }}>
          <button
            className={`btn ${projectFilter.length > 0 ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => {
              setShowProjectFilter(!showProjectFilter);
              if (showProjectFilter) setFilterSearch('');
            }}
            style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', whiteSpace: 'nowrap', padding: '0 12px' }}
          >
            <Filter size={15} />
            {t('teams.inProject')}
            {projectFilter.length > 0 && (
              <span style={{
                background: 'rgba(255,255,255,0.25)', borderRadius: '10px',
                padding: '1px 7px', fontSize: '11px', fontWeight: 600,
              }}>
                {projectFilter.length}
              </span>
            )}
          </button>
          {showProjectFilter && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
              width: '320px',
              backgroundColor: 'var(--color-secondary-bg)',
              border: '1px solid var(--color-alternate)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden', animation: 'fadeIn 0.15s ease',
            }}>
              {/* Header with title and count */}
              <div style={{
                padding: '10px 12px', borderBottom: '1px solid var(--color-alternate)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary-text)' }}>
                  {t('teams.inProject')}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)', background: 'var(--color-secondary)', padding: '1px 6px', borderRadius: '8px' }}>
                  {allProjects.length} {allProjects.length === 1 ? 'projeto' : 'projetos'}
                </span>
              </div>

              {/* Search inside filter */}
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-alternate)' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-text)' }} />
                  <input
                    ref={filterSearchRef}
                    type="text"
                    className="input-field"
                    placeholder="Buscar projeto..."
                    value={filterSearch}
                    onChange={(e) => setFilterSearch(e.target.value)}
                    style={{ paddingLeft: '28px', fontSize: '12px', height: '30px', borderRadius: '6px', width: '100%' }}
                  />
                  {filterSearch && (
                    <button
                      onClick={() => setFilterSearch('')}
                      style={{
                        position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-secondary-text)',
                        fontSize: '14px', lineHeight: 1, padding: '2px',
                      }}
                    >
                      &times;
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable project list */}
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {/* Sem projeto option - only show when not searching */}
                {!filterSearch.trim() && (
                  <label
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                      backgroundColor: projectFilter.includes(-1) ? 'var(--color-tertiary-bg)' : 'transparent',
                      borderBottom: '1px solid var(--color-alternate)',
                    }}
                    onMouseEnter={(e) => { if (!projectFilter.includes(-1)) e.currentTarget.style.backgroundColor = 'var(--color-secondary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = projectFilter.includes(-1) ? 'var(--color-tertiary-bg)' : 'transparent'; }}
                  >
                    <input
                      type="checkbox"
                      checked={projectFilter.includes(-1)}
                      onChange={() => toggleProjectFilter(-1)}
                      style={{ accentColor: 'var(--color-primary)', flexShrink: 0 }}
                    />
                    <FolderOpen size={14} color="var(--color-accent4)" style={{ flexShrink: 0 }} />
                    <span style={{ fontStyle: 'italic', color: 'var(--color-accent4)' }}>{t('teams.noProject')}</span>
                  </label>
                )}
                {availableProjectsForFilter.length === 0 ? (
                  <div style={{ padding: '16px 12px', textAlign: 'center', fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                    {filterSearch ? `Nenhum projeto encontrado para "${filterSearch}"` : 'Nenhum projeto disponivel'}
                  </div>
                ) : (
                  availableProjectsForFilter.map((p) => {
                    const isChecked = projectFilter.includes(p.id);
                    // Count teams linked to this project
                    const linkedTeamsCount = teams.filter((team) => {
                      const rawLinks = (team as any).teams_projects;
                      if (!Array.isArray(rawLinks)) return false;
                      return rawLinks.some((lp: any) => Number(lp.projects?.id) === p.id);
                    }).length;

                    return (
                      <label
                        key={p.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                          backgroundColor: isChecked ? 'var(--color-tertiary-bg)' : 'transparent',
                          transition: 'background-color 0.1s ease',
                        }}
                        onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.backgroundColor = 'var(--color-secondary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isChecked ? 'var(--color-tertiary-bg)' : 'transparent'; }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleProjectFilter(p.id)}
                          style={{ accentColor: 'var(--color-primary)', flexShrink: 0 }}
                        />
                        <FolderOpen size={14} color={linkedTeamsCount > 0 ? 'var(--color-success)' : 'var(--color-secondary-text)'} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.name}</span>
                        {linkedTeamsCount > 0 && (
                          <span style={{
                            fontSize: '10px', color: 'var(--color-secondary-text)',
                            background: 'var(--color-secondary)', padding: '1px 5px',
                            borderRadius: '6px', flexShrink: 0,
                          }}>
                            {linkedTeamsCount} {linkedTeamsCount === 1 ? 'equipe' : 'equipes'}
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>

              {/* Footer with clear action */}
              {projectFilter.length > 0 && (
                <div style={{ padding: '8px 12px', borderTop: '1px solid var(--color-alternate)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-secondary-text)' }}>
                    {projectFilter.length} {projectFilter.length === 1 ? 'selecionado' : 'selecionados'}
                  </span>
                  <button
                    onClick={() => { setProjectFilter([]); setTeamsPage(1); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '12px', color: 'var(--color-error)', fontWeight: 500,
                    }}
                  >
                    <X size={14} /> {t('common.clear')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {projectFilter.length > 0 && projectFilter.map((id) => {
          const label = id === -1 ? t('teams.noProject') : allProjects.find((p) => Number(p.id) === id)?.name || `#${id}`;
          return (
            <span
              key={id}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '3px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: 500,
                background: 'var(--color-tertiary-bg)', border: '1px solid var(--color-primary)',
                color: 'var(--color-primary)',
              }}
            >
              {label}
              <X
                size={12}
                style={{ cursor: 'pointer' }}
                onClick={() => toggleProjectFilter(id)}
              />
            </span>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        {/* ========== Left Column: Teams List ========== */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>
              {t('teams.teamsList')}
            </h3>
            <span style={{
              fontSize: '11px', color: 'var(--color-secondary-text)',
              background: 'var(--color-secondary)', padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}>
              {filteredTeams.length}
            </span>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : filteredTeams.length === 0 ? (
            <EmptyState message={globalSearch ? `Nenhuma equipe encontrada para "${globalSearch}"` : t('common.noData')} />
          ) : (
            <>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto', marginRight: '-4px', paddingRight: '4px' }}
              >
                {teamsPag.items.map((team, index) => {
                  const isSelected = teamId === team.id;
                  // Extrai nomes dos projetos via junction teams_projects
                  const teamProjectLinks: { id: number; name: string }[] = [];
                  const rawLinks = (team as any).teams_projects;
                  if (Array.isArray(rawLinks)) {
                    rawLinks.forEach((lp: any) => {
                      if (lp.projects?.name) teamProjectLinks.push({ id: Number(lp.projects.id), name: lp.projects.name });
                    });
                  }
                  const hasProjects = teamProjectLinks.length > 0;
                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.03 }}
                      onClick={() => handleSelectTeam(team)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: `1.5px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-alternate)'}`,
                        backgroundColor: isSelected ? 'var(--color-tertiary-bg)' : 'transparent',
                        borderLeft: isSelected ? '4px solid var(--color-primary)' : '1.5px solid var(--color-alternate)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 8px rgba(29, 92, 198, 0.15)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={15} color={isSelected ? 'var(--color-primary)' : 'var(--color-secondary-text)'} />
                          <span style={{
                            fontWeight: isSelected ? 600 : 500,
                            fontSize: '13px',
                            color: isSelected ? 'var(--color-primary)' : 'var(--color-primary-text)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {team.name}
                          </span>
                        </div>
                        {hasProjects ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '23px' }}>
                            {teamProjectLinks.map((p) => (
                              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FolderOpen size={11} color="var(--color-success)" />
                                <span style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {p.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '23px' }}>
                            <FolderOpen size={11} color="var(--color-accent4)" />
                            <span style={{ fontSize: '10px', color: 'var(--color-accent4)', fontWeight: 500 }}>
                              {t('teams.noProject')}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        className="btn btn-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({ type: 'team', id: team.id });
                        }}
                        style={{ flexShrink: 0 }}
                      >
                        <Trash2 size={14} color="var(--color-error)" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
              <div style={{ flexShrink: 0 }}>
                <PaginationControls
                  page={teamsPag.page}
                  totalPages={teamsPag.totalPages}
                  total={teamsPag.total}
                  perPage={TEAMS_PER_PAGE}
                  onPageChange={setTeamsPage}
                  label={t('teams.results')}
                />
              </div>
            </>
          )}
        </div>

        {/* ========== Right Column: Linked Projects + Leaders + Members ========== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'hidden' }}>

          {/* --- Linked Projects Section --- */}
          <div className="card" style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: linkedProjects.length > 0 || teamId === 0 ? '16px' : '0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderOpen size={18} color="var(--color-success)" />
                {t('teams.linkedProjects')}
                {selectedTeamName && (
                  <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-secondary-text)' }}>
                    &mdash; {selectedTeamName}
                  </span>
                )}
                {teamId > 0 && (
                  <span style={{
                    fontSize: '11px', background: 'var(--color-status-04)',
                    color: 'var(--color-success)', padding: '2px 8px',
                    borderRadius: 'var(--radius-full)', fontWeight: 500, marginLeft: '4px',
                  }}>
                    {linkedProjects.length}
                  </span>
                )}
              </h3>
              {teamId > 0 && (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {linkedProjects.length === 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)', fontStyle: 'italic', marginRight: '4px' }}>
                      {t('teams.noLinkedProjects')}
                    </span>
                  )}
                  <button
                    className="btn btn-secondary"
                    onClick={handleOpenHistory}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  >
                    <History size={14} /> {t('teams.history')}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleOpenLinkModal}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  >
                    <Link2 size={14} /> {t('teams.linkToProject')}
                  </button>
                </div>
              )}
            </div>
            {teamId === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', textAlign: 'center', padding: '12px 0' }}>
                {t('teams.noTeamSelected')}
              </p>
            ) : linkedProjects.length === 0 ? (
              null
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {linkedProjects.map((lp) => (
                  <div
                    key={lp.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px', borderRadius: '8px',
                      border: '1px solid var(--color-alternate)',
                      backgroundColor: 'var(--color-primary-bg)',
                      flex: '1 1 calc(50% - 4px)', maxWidth: 'calc(50% - 4px)',
                      minWidth: '200px',
                    }}
                  >
                    <FolderOpen size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lp.projects?.name || `Projeto #${lp.projects_id}`}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--color-secondary-text)' }}>
                        {t('teams.since')} {formatDate(lp.start_at)}
                      </div>
                    </div>
                    <button
                      className="btn btn-icon"
                      onClick={() => setUnlinkConfirm({
                        teams_id: lp.teams_id,
                        projects_id: lp.projects_id,
                        project_name: lp.projects?.name || `Projeto #${lp.projects_id}`,
                      })}
                      title={t('teams.unlinkFromProject')}
                      style={{ flexShrink: 0 }}
                    >
                      <Unlink size={14} color="var(--color-error)" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- Leaders Section --- */}
          <div className="card" style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crown size={18} color="var(--color-warning)" />
                {t('teams.leaders')}
                {selectedTeamName && (
                  <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-secondary-text)' }}>
                    &mdash; {selectedTeamName}
                  </span>
                )}
                {teamId > 0 && (
                  <span style={{
                    fontSize: '11px', background: 'var(--color-status-06)',
                    color: 'var(--color-warning)', padding: '2px 8px',
                    borderRadius: 'var(--radius-full)', fontWeight: 500, marginLeft: '4px',
                  }}>
                    {filteredLeaders.length}
                  </span>
                )}
              </h3>
              {teamId > 0 && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={handleOpenLeadersHistory}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  >
                    <History size={14} /> {t('teams.leadersHistory')}
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowAddLeaderModal(true)}>
                    <UserPlus size={16} /> {t('teams.addLeader')}
                  </button>
                </div>
              )}
            </div>
            {teamId === 0 ? (
              <EmptyState message={t('teams.noTeamSelected')} />
            ) : filteredLeaders.length === 0 ? (
              <EmptyState message={globalSearch ? `Nenhum líder encontrado para "${globalSearch}"` : t('teams.noLeaders')} />
            ) : (
              <>
                <motion.div
                  key={leaders.map((l) => l.id).join()}
                  variants={staggerParent}
                  initial="initial"
                  animate="animate"
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}
                >
                  {leadersPag.items.map((leader) => (
                    <motion.div
                      key={leader.id}
                      variants={fadeUpChild}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', borderRadius: '8px',
                        border: '1px solid var(--color-alternate)',
                        backgroundColor: 'var(--color-primary-bg)',
                        minWidth: '240px', flex: '1 1 calc(33% - 10px)',
                        maxWidth: 'calc(33.33% - 7px)',
                      }}
                    >
                      <img
                        src={getAvatarUrl(leader.userName || '')}
                        alt={leader.userName || ''}
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {leader.userName || '-'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-secondary-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {leader.userEmail || ''}
                        </div>
                      </div>
                      <button
                        className="btn btn-icon"
                        onClick={() => setDeleteConfirm({ type: 'leader', id: leader.id })}
                        style={{ flexShrink: 0 }}
                      >
                        <Trash2 size={14} color="var(--color-error)" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
                <PaginationControls
                  page={leadersPag.page}
                  totalPages={leadersPag.totalPages}
                  total={leadersPag.total}
                  perPage={LEADERS_PER_PAGE}
                  onPageChange={setLeadersPage}
                  label={t('teams.results')}
                />
              </>
            )}
          </div>

          {/* --- Members Section --- */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="var(--color-primary)" />
                {t('teams.members')}
                {selectedTeamName && (
                  <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-secondary-text)' }}>
                    &mdash; {selectedTeamName}
                  </span>
                )}
                {teamId > 0 && (
                  <span style={{
                    fontSize: '11px', background: 'var(--color-status-03)',
                    color: 'var(--color-primary)', padding: '2px 8px',
                    borderRadius: 'var(--radius-full)', fontWeight: 500, marginLeft: '4px',
                  }}>
                    {filteredMembers.length}
                  </span>
                )}
              </h3>
              {teamId > 0 && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={handleOpenMembersHistory}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  >
                    <History size={14} /> {t('teams.membersHistory')}
                  </button>
                  <button className="btn btn-primary" onClick={() => setShowAddMemberModal(true)}>
                    <UserPlus size={16} /> {t('teams.addMember')}
                  </button>
                </div>
              )}
            </div>
            {teamId === 0 ? (
              <EmptyState message={t('teams.noTeamSelected')} />
            ) : filteredMembers.length === 0 ? (
              <EmptyState message={globalSearch ? `Nenhum membro encontrado para "${globalSearch}"` : t('teams.noMembers')} />
            ) : (
              <>
                <div className="table-container" style={{ flex: 1, overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <SortableHeader label={t('teams.memberName')} field="userName" currentField={membersSortField} currentDirection={membersSortDirection} onSort={handleMembersSort} style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--color-secondary)' }} />
                        <SortableHeader label={t('teams.memberEmail')} field="userEmail" currentField={membersSortField} currentDirection={membersSortDirection} onSort={handleMembersSort} style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--color-secondary)' }} />
                        <SortableHeader label={t('teams.memberRole')} field="roleName" currentField={membersSortField} currentDirection={membersSortDirection} onSort={handleMembersSort} style={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--color-secondary)' }} />
                        <th style={{ width: '60px', position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'var(--color-secondary)' }}>{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <motion.tbody key={members.map((m) => m.id).join()} variants={staggerParent} initial="initial" animate="animate">
                      {membersPag.items.map((member) => (
                        <motion.tr key={member.id} variants={tableRowVariants}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img
                                src={getAvatarUrl(member.userName || '')}
                                alt={member.userName || ''}
                                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                              />
                              {member.userName || '-'}
                            </div>
                          </td>
                          <td>{member.userEmail || '-'}</td>
                          <td>{member.roleName || '-'}</td>
                          <td>
                            <button
                              className="btn btn-icon"
                              onClick={() => setDeleteConfirm({ type: 'member', id: member.id })}
                            >
                              <Trash2 size={14} color="var(--color-error)" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <PaginationControls
                    page={membersPag.page}
                    totalPages={membersPag.totalPages}
                    total={membersPag.total}
                    perPage={MEMBERS_PER_PAGE}
                    onPageChange={setMembersPage}
                    label={t('teams.results')}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Criar Equipe */}
      {showCreateTeamModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateTeamModal(false)}>
          <div className="modal-content" style={{ padding: '24px', width: '400px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>{t('teams.createTeam')}</h3>
            <div className="input-group">
              <label>{t('teams.teamName')}</label>
              <input
                className="input-field"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder={t('teams.teamNamePlaceholder')}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowCreateTeamModal(false)}>
                {t('common.cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleCreateTeam} disabled={modalLoading || !newTeamName.trim()}>
                {modalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Líder */}
      {showAddLeaderModal && (
        <AddUserModal
          title={t('teams.addLeader')}
          onClose={() => setShowAddLeaderModal(false)}
          onSave={handleAddLeader}
          saving={modalLoading}
          teamId={teamId}
        />
      )}

      {/* Modal: Adicionar Membro */}
      {showAddMemberModal && (
        <AddUserModal
          title={t('teams.addMember')}
          onClose={() => setShowAddMemberModal(false)}
          onSave={handleAddMember}
          saving={modalLoading}
          teamId={teamId}
        />
      )}

      {/* Modal: Confirmar exclusão */}
      {deleteConfirm && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('common.confirmDeleteMessage')}
          onConfirm={() => {
            if (deleteConfirm.type === 'team') handleDeleteTeam(deleteConfirm.id);
            else if (deleteConfirm.type === 'member') handleDeleteMember(deleteConfirm.id);
            else if (deleteConfirm.type === 'leader') handleDeleteLeader(deleteConfirm.id);
          }}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Modal: Vincular Projeto */}
      {showLinkProjectModal && (
        <div className="modal-backdrop" onClick={() => setShowLinkProjectModal(false)}>
          <div
            className="modal-content"
            style={{ padding: '24px', width: '460px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link2 size={18} color="var(--color-primary)" />
              {t('teams.selectProject')}
            </h3>
            <div className="input-group" style={{ marginBottom: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-text)' }}
                />
                <input
                  className="input-field"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  placeholder={t('teams.selectProjectPlaceholder')}
                  style={{ paddingLeft: '32px' }}
                  autoFocus
                />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--color-alternate)', borderRadius: '8px' }}>
              {availableProjects.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-secondary-text)', fontSize: '13px' }}>
                  {t('teams.noAvailableProjects')}
                </div>
              ) : (
                availableProjects.slice(0, 20).map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleLinkProject(project.id)}
                    style={{
                      padding: '10px 12px', cursor: 'pointer',
                      borderBottom: '1px solid var(--color-alternate)',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-tertiary-bg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <FolderOpen size={16} color="var(--color-primary)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {project.name}
                      </div>
                    </div>
                    {linkLoading && <span className="spinner" style={{ width: 16, height: 16 }} />}
                  </div>
                ))
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowLinkProjectModal(false)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Conflito de vinculação */}
      {conflictData && pendingLinkProjectId && (
        <ConfirmModal
          title={t('teams.conflictWarningTitle')}
          message={t('teams.conflictWarningMessage', {
            count: conflictData.active_projects.length,
            projects: conflictData.active_projects.map(p => p.project_name).join(', '),
          })}
          variant="warning"
          confirmLabel={t('teams.linkAnyway')}
          onConfirm={() => doLinkProject(pendingLinkProjectId)}
          onCancel={() => { setConflictData(null); setPendingLinkProjectId(null); }}
        />
      )}

      {/* Modal: Confirmar desvinculação */}
      {unlinkConfirm && (
        <ConfirmModal
          title={t('teams.confirmUnlink')}
          message={t('teams.confirmUnlinkMessage', { project: unlinkConfirm.project_name })}
          variant="warning"
          confirmLabel={t('teams.unlinkFromProject')}
          onConfirm={handleUnlinkProject}
          onCancel={() => setUnlinkConfirm(null)}
        />
      )}

      {/* Modal: Histórico */}
      {showHistoryModal && (
        <div className="modal-backdrop" onClick={() => setShowHistoryModal(false)}>
          <div
            className="modal-content"
            style={{ padding: '24px', width: '700px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="var(--color-primary)" />
              {t('teams.historyTitle')}
              {selectedTeamName && (
                <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-secondary-text)' }}>
                  &mdash; {selectedTeamName}
                </span>
              )}
            </h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {historyData.length === 0 ? (
                <EmptyState message={t('teams.noHistory')} />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: '30px' }}></th>
                        <th>{t('teams.historyDate')}</th>
                        <th>{t('teams.historyAction')}</th>
                        <th>{t('teams.historyProject')}</th>
                        <th>{t('teams.historyPerformedBy')}</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                      {historyData.map((entry) => {
                        const isExpanded = expandedHistoryId === entry.id;
                        const snapshot: MemberSnapshotEntry[] = Array.isArray(entry.members_snapshot) ? entry.members_snapshot : [];
                        return (
                          <>
                            <motion.tr key={entry.id} variants={tableRowVariants} style={{ cursor: snapshot.length > 0 ? 'pointer' : 'default' }}
                              onClick={() => {
                                if (snapshot.length > 0) setExpandedHistoryId(isExpanded ? null : entry.id);
                              }}
                            >
                              <td>
                                {snapshot.length > 0 && (
                                  isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                                )}
                              </td>
                              <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDate(entry.created_at)}</td>
                              <td>
                                <span style={{
                                  padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                                  background: entry.action === 'VINCULADO' ? 'var(--color-status-04)' : 'var(--color-status-05)',
                                  color: entry.action === 'VINCULADO' ? 'var(--color-success)' : 'var(--color-error)',
                                }}>
                                  {entry.action === 'VINCULADO' ? t('teams.historyLinked') : t('teams.historyUnlinked')}
                                </span>
                              </td>
                              <td style={{ fontSize: '12px' }}>{entry.project_name || '-'}</td>
                              <td style={{ fontSize: '12px' }}>{entry.performed_by_name || '-'}</td>
                            </motion.tr>
                            {isExpanded && snapshot.length > 0 && (
                              <tr key={`${entry.id}-snapshot`}>
                                <td colSpan={5} style={{ padding: '8px 12px', backgroundColor: 'var(--color-tertiary-bg)' }}>
                                  <div style={{ fontSize: '11px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-secondary-text)' }}>
                                    {t('teams.historyMembers')} ({snapshot.length})
                                  </div>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {snapshot.map((member, idx) => (
                                      <div
                                        key={idx}
                                        style={{
                                          padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                                          background: 'var(--color-primary-bg)', border: '1px solid var(--color-alternate)',
                                          display: 'flex', alignItems: 'center', gap: '4px',
                                        }}
                                      >
                                        {member.role === 'leader' ? (
                                          <Crown size={10} color="var(--color-warning)" />
                                        ) : (
                                          <Users size={10} color="var(--color-primary)" />
                                        )}
                                        <span style={{ fontWeight: 500 }}>{member.name}</span>
                                        <span style={{ color: 'var(--color-secondary-text)' }}>({member.email})</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </motion.tbody>
                  </table>
                </div>
              )}
              {historyTotalPages > 1 && (
                <PaginationControls
                  page={historyPage}
                  totalPages={historyTotalPages}
                  total={historyTotal}
                  perPage={10}
                  onPageChange={(p) => loadHistory(p)}
                  label={t('teams.results')}
                />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Histórico de Membros */}
      {showMembersHistoryModal && (
        <div className="modal-backdrop" onClick={() => setShowMembersHistoryModal(false)}>
          <div
            className="modal-content"
            style={{ padding: '24px', width: '700px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="var(--color-primary)" />
              {t('teams.membersHistoryTitle')}
              {selectedTeamName && (
                <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-secondary-text)' }}>
                  &mdash; {selectedTeamName}
                </span>
              )}
            </h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {membersHistoryData.length === 0 ? (
                <EmptyState message={t('teams.noMembersHistory')} />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>{t('teams.membersHistoryDate')}</th>
                        <th>{t('teams.membersHistoryAction')}</th>
                        <th>{t('teams.membersHistoryUser')}</th>
                        <th>{t('teams.membersHistoryPerformedBy')}</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                      {membersHistoryData.map((entry) => (
                        <motion.tr key={entry.id} variants={tableRowVariants}>
                          <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDate(entry.created_at)}</td>
                          <td>
                            <span style={{
                              padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                              background: entry.action === 'ADICIONADO' ? 'var(--color-status-04)' : 'var(--color-status-05)',
                              color: entry.action === 'ADICIONADO' ? 'var(--color-success)' : 'var(--color-error)',
                            }}>
                              {entry.action === 'ADICIONADO' ? t('teams.membersHistoryAdded') : t('teams.membersHistoryRemoved')}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px' }}>
                              <div style={{ fontWeight: 500 }}>{entry.user_name || '-'}</div>
                              <div style={{ fontSize: '10px', color: 'var(--color-secondary-text)' }}>{entry.user_email || ''}</div>
                            </div>
                          </td>
                          <td style={{ fontSize: '12px' }}>{entry.performed_by_name || '-'}</td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              )}
              {membersHistoryTotalPages > 1 && (
                <PaginationControls
                  page={membersHistoryPage}
                  totalPages={membersHistoryTotalPages}
                  total={membersHistoryTotal}
                  perPage={10}
                  onPageChange={(p) => loadMembersHistory(p)}
                  label={t('teams.results')}
                />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowMembersHistoryModal(false)}>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Histórico de Líderes */}
      {showLeadersHistoryModal && (
        <div className="modal-backdrop" onClick={() => setShowLeadersHistoryModal(false)}>
          <div
            className="modal-content"
            style={{ padding: '24px', width: '700px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="var(--color-warning)" />
              {t('teams.leadersHistoryTitle')}
              {selectedTeamName && (
                <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--color-secondary-text)' }}>
                  &mdash; {selectedTeamName}
                </span>
              )}
            </h3>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {leadersHistoryData.length === 0 ? (
                <EmptyState message={t('teams.noLeadersHistory')} />
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>{t('teams.membersHistoryDate')}</th>
                        <th>{t('teams.membersHistoryAction')}</th>
                        <th>{t('teams.membersHistoryUser')}</th>
                        <th>{t('teams.membersHistoryPerformedBy')}</th>
                      </tr>
                    </thead>
                    <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                      {leadersHistoryData.map((entry) => (
                        <motion.tr key={entry.id} variants={tableRowVariants}>
                          <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{formatDate(entry.created_at)}</td>
                          <td>
                            <span style={{
                              padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                              background: entry.action === 'ADICIONADO' ? 'var(--color-status-04)' : 'var(--color-status-05)',
                              color: entry.action === 'ADICIONADO' ? 'var(--color-success)' : 'var(--color-error)',
                            }}>
                              {entry.action === 'ADICIONADO' ? t('teams.membersHistoryAdded') : t('teams.membersHistoryRemoved')}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontSize: '12px' }}>
                              <div style={{ fontWeight: 500 }}>{entry.user_name || '-'}</div>
                              <div style={{ fontSize: '10px', color: 'var(--color-secondary-text)' }}>{entry.user_email || ''}</div>
                            </div>
                          </td>
                          <td style={{ fontSize: '12px' }}>{entry.performed_by_name || '-'}</td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                </div>
              )}
              {leadersHistoryTotalPages > 1 && (
                <PaginationControls
                  page={leadersHistoryPage}
                  totalPages={leadersHistoryTotalPages}
                  total={leadersHistoryTotal}
                  perPage={10}
                  onPageChange={(p) => loadLeadersHistory(p)}
                  label={t('teams.results')}
                />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowLeadersHistoryModal(false)}>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
