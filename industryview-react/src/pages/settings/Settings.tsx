import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, tableRowVariants } from '../../lib/motion';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { useAuth } from '../../hooks/useAuth';
import { tasksApi, equipamentTypesApi, holidaysApi } from '../../services';
import type { Holiday, WorkCalendar } from '../../services/api/holidays';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import { Plus, Trash2, Edit, Ruler, BookOpen, Tag, Calendar, CalendarDays, Save } from 'lucide-react';

interface SettingsItem {
  id: number;
  displayName: string;
}

type ActiveTab = 'unity' | 'discipline' | 'category' | 'holidays' | 'work-calendar';

const WEEKDAY_KEYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'] as const;

export default function Settings() {
  const { t } = useTranslation();
  const { setNavBarSelection } = useAppState();
  const { user } = useAuth();
  const companyId = user?.companyId;

  const [activeTab, setActiveTab] = useState<ActiveTab>('unity');
  const [unities, setUnities] = useState<SettingsItem[]>([]);
  const [disciplines, setDisciplines] = useState<SettingsItem[]>([]);
  const [categories, setCategories] = useState<SettingsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: ActiveTab; id: number } | null>(null);

  // Add/Edit modal (for CRUD tabs)
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: number } | null>(null);
  const [itemName, setItemName] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Holidays state
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayYear, setHolidayYear] = useState(new Date().getFullYear());
  const [holidaysLoading, setHolidaysLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [holidayForm, setHolidayForm] = useState({ date: '', name: '', type: 'custom' as string, recurring: false });
  const [holidayModalLoading, setHolidayModalLoading] = useState(false);

  // Work Calendar state
  const [workCalendar, setWorkCalendar] = useState<WorkCalendar>({
    company_id: 0,
    seg_ativo: true,
    ter_ativo: true,
    qua_ativo: true,
    qui_ativo: true,
    sex_ativo: true,
    sab_ativo: false,
    dom_ativo: false,
  });
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarSaving, setCalendarSaving] = useState(false);

  useEffect(() => {
    setNavBarSelection(11);
  }, []);

  // ---------------------------------------------------------------------------
  // Load CRUD data (unities, disciplines, categories)
  // ---------------------------------------------------------------------------
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [unityData, disciplineData, categoryData] = await Promise.all([
        tasksApi.getUnity().catch(() => []),
        tasksApi.getDisciplines().catch(() => []),
        equipamentTypesApi.queryAllEquipamentTypes().catch(() => []),
      ]);

      const rawUnities = Array.isArray(unityData) ? unityData : [];
      const rawDisciplines = Array.isArray(disciplineData) ? disciplineData : [];
      const rawCategories = Array.isArray(categoryData) ? categoryData : [];

      setUnities(rawUnities.map((u) => {
        const row = u as { id?: number | string; unity?: string; name?: string };
        return {
          id: Number(row.id),
          displayName: row.unity || row.name || `#${row.id}`,
        };
      }));

      setDisciplines(rawDisciplines.map((d) => {
        const row = d as { id?: number | string; discipline?: string; name?: string };
        return {
          id: Number(row.id),
          displayName: row.discipline || row.name || `#${row.id}`,
        };
      }));

      setCategories(rawCategories.map((c) => {
        const row = c as { id?: number | string; type?: string; name?: string };
        return {
          id: Number(row.id),
          displayName: row.type || row.name || `#${row.id}`,
        };
      }));
    } catch (err) {
      console.error('Failed to load settings data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------------------------------------------------------------------
  // Load holidays
  // ---------------------------------------------------------------------------
  const loadHolidays = useCallback(async () => {
    if (!companyId) return;
    setHolidaysLoading(true);
    try {
      const data = await holidaysApi.listHolidays(companyId, holidayYear);
      setHolidays(data);
    } catch (err) {
      console.error('Failed to load holidays:', err);
    } finally {
      setHolidaysLoading(false);
    }
  }, [companyId, holidayYear]);

  useEffect(() => {
    if (activeTab === 'holidays') loadHolidays();
  }, [activeTab, loadHolidays]);

  // ---------------------------------------------------------------------------
  // Load work calendar
  // ---------------------------------------------------------------------------
  const loadWorkCalendar = useCallback(async () => {
    if (!companyId) return;
    setCalendarLoading(true);
    try {
      const data = await holidaysApi.getWorkCalendar(companyId);
      setWorkCalendar({ ...data, company_id: companyId });
    } catch (err) {
      console.error('Failed to load work calendar:', err);
    } finally {
      setCalendarLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (activeTab === 'work-calendar') loadWorkCalendar();
  }, [activeTab, loadWorkCalendar]);

  // ---------------------------------------------------------------------------
  // CRUD handlers (unity/discipline/category)
  // ---------------------------------------------------------------------------
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setItemName('');
    setShowModal(true);
  };

  const handleOpenEditModal = (item: SettingsItem) => {
    setEditingItem({ id: item.id });
    setItemName(item.displayName);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!itemName.trim()) return;
    setModalLoading(true);
    try {
      if (activeTab === 'unity') {
        if (editingItem) {
          await tasksApi.editUnity(editingItem.id, { name: itemName.trim() });
        } else {
          await tasksApi.addUnity({ name: itemName.trim() });
        }
      } else if (activeTab === 'discipline') {
        if (editingItem) {
          await tasksApi.editDiscipline(editingItem.id, { name: itemName.trim() });
        } else {
          await tasksApi.addDiscipline({ name: itemName.trim() });
        }
      } else if (activeTab === 'category') {
        if (editingItem) {
          await equipamentTypesApi.editEquipamentType(editingItem.id, { type: itemName.trim() });
        } else {
          await equipamentTypesApi.addEquipamentType({ type: itemName.trim() });
        }
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (type: ActiveTab, id: number) => {
    try {
      if (type === 'unity') {
        await tasksApi.deleteUnity(id);
      } else if (type === 'discipline') {
        await tasksApi.deleteDiscipline(id);
      } else if (type === 'category') {
        await equipamentTypesApi.deleteEquipamentType(id);
      } else if (type === 'holidays') {
        await holidaysApi.deleteHoliday(id);
        loadHolidays();
      }
      if (type !== 'holidays') loadData();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
    setDeleteConfirm(null);
  };

  // ---------------------------------------------------------------------------
  // Holiday handlers
  // ---------------------------------------------------------------------------
  const handleSeedHolidays = async () => {
    if (!companyId) return;
    setSeedLoading(true);
    try {
      await holidaysApi.seedHolidays(companyId, holidayYear);
      loadHolidays();
    } catch (err) {
      console.error('Failed to seed holidays:', err);
    } finally {
      setSeedLoading(false);
    }
  };

  const handleOpenHolidayCreate = () => {
    setEditingHoliday(null);
    setHolidayForm({ date: '', name: '', type: 'custom', recurring: false });
    setShowHolidayModal(true);
  };

  const handleOpenHolidayEdit = (h: Holiday) => {
    setEditingHoliday(h);
    setHolidayForm({
      date: h.date.substring(0, 10),
      name: h.name,
      type: h.type,
      recurring: h.recurring,
    });
    setShowHolidayModal(true);
  };

  const handleSaveHoliday = async () => {
    if (!companyId || !holidayForm.date || !holidayForm.name.trim()) return;
    setHolidayModalLoading(true);
    try {
      if (editingHoliday) {
        await holidaysApi.updateHoliday(editingHoliday.id, {
          date: holidayForm.date,
          name: holidayForm.name.trim(),
          type: holidayForm.type,
          recurring: holidayForm.recurring,
        });
      } else {
        await holidaysApi.createHoliday({
          company_id: companyId,
          date: holidayForm.date,
          name: holidayForm.name.trim(),
          type: holidayForm.type,
          recurring: holidayForm.recurring,
        });
      }
      setShowHolidayModal(false);
      loadHolidays();
    } catch (err) {
      console.error('Failed to save holiday:', err);
    } finally {
      setHolidayModalLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Work Calendar handlers
  // ---------------------------------------------------------------------------
  const handleToggleDay = (key: typeof WEEKDAY_KEYS[number]) => {
    const fieldKey = `${key}_ativo` as keyof WorkCalendar;
    setWorkCalendar((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  const handleSaveWorkCalendar = async () => {
    if (!companyId) return;
    setCalendarSaving(true);
    try {
      await holidaysApi.upsertWorkCalendar({ ...workCalendar, company_id: companyId });
    } catch (err) {
      console.error('Failed to save work calendar:', err);
    } finally {
      setCalendarSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CRUD tab helpers
  // ---------------------------------------------------------------------------
  const isCrudTab = activeTab === 'unity' || activeTab === 'discipline' || activeTab === 'category';

  const currentItems: SettingsItem[] = (() => {
    if (activeTab === 'unity') return unities;
    if (activeTab === 'discipline') return disciplines;
    if (activeTab === 'category') return categories;
    return [];
  })();

  const getAddLabel = () => {
    if (activeTab === 'unity') return t('settings.addUnity');
    if (activeTab === 'discipline') return t('settings.addDiscipline');
    return t('settings.addCategory');
  };

  const getModalTitle = () => {
    if (activeTab === 'unity') return editingItem ? t('settings.editUnity') : t('settings.addUnity');
    if (activeTab === 'discipline') return editingItem ? t('settings.editDiscipline') : t('settings.addDiscipline');
    return editingItem ? t('settings.editCategory') : t('settings.addCategory');
  };

  const tabStyle = (tab: ActiveTab) => ({
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500 as const,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-secondary-text)',
    borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
    marginBottom: '-2px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  });

  const weekdayLabels: Record<string, string> = {
    seg: t('settings.monday'),
    ter: t('settings.tuesday'),
    qua: t('settings.wednesday'),
    qui: t('settings.thursday'),
    sex: t('settings.friday'),
    sab: t('settings.saturday'),
    dom: t('settings.sunday'),
  };

  const holidayTypeLabels: Record<string, string> = {
    national: t('settings.holidayNational'),
    state: t('settings.holidayState'),
    municipal: t('settings.holidayMunicipal'),
    custom: t('settings.holidayCustom'),
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div>
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid var(--color-alternate)', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('unity')} style={tabStyle('unity')}>
          <Ruler size={16} />
          {t('settings.unities')}
        </button>
        <button onClick={() => setActiveTab('discipline')} style={tabStyle('discipline')}>
          <BookOpen size={16} />
          {t('settings.disciplines')}
        </button>
        <button onClick={() => setActiveTab('category')} style={tabStyle('category')}>
          <Tag size={16} />
          {t('settings.categories')}
        </button>
        <button onClick={() => setActiveTab('holidays')} style={tabStyle('holidays')}>
          <Calendar size={16} />
          {t('settings.holidays')}
        </button>
        <button onClick={() => setActiveTab('work-calendar')} style={tabStyle('work-calendar')}>
          <CalendarDays size={16} />
          {t('settings.workCalendar')}
        </button>
      </div>

      {/* ================================================================= */}
      {/* CRUD Tabs: Unity / Discipline / Category */}
      {/* ================================================================= */}
      {isCrudTab && (
        <>
          {/* Action bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', margin: 0 }}>
              {currentItems.length} {currentItems.length === 1 ? 'item' : 'itens'}
            </p>
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              <Plus size={18} />
              {getAddLabel()}
            </button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : currentItems.length === 0 ? (
            <EmptyState
              message={t('common.noData')}
              action={
                <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                  <Plus size={18} />
                  {getAddLabel()}
                </button>
              }
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t('settings.name')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <motion.tbody key={activeTab} variants={staggerParent} initial="initial" animate="animate">
                  {currentItems.map((item) => (
                    <motion.tr key={item.id} variants={tableRowVariants}>
                      <td style={{ fontWeight: 500 }}>{item.displayName}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn-icon" title={t('common.edit')} onClick={() => handleOpenEditModal(item)}>
                            <Edit size={16} color="var(--color-secondary-text)" />
                          </button>
                          <button
                            className="btn btn-icon"
                            title={t('common.delete')}
                            onClick={() => setDeleteConfirm({ type: activeTab, id: item.id })}
                          >
                            <Trash2 size={16} color="var(--color-error)" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ================================================================= */}
      {/* Holidays Tab */}
      {/* ================================================================= */}
      {activeTab === 'holidays' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '14px', fontWeight: 500 }}>{t('settings.year')}:</label>
              <select
                className="input-field"
                style={{ width: '120px' }}
                value={holidayYear}
                onChange={(e) => setHolidayYear(Number(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', margin: 0 }}>
                {holidays.length} {holidays.length === 1 ? t('settings.holiday') : t('settings.holidaysCount')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={handleSeedHolidays} disabled={seedLoading}>
                {seedLoading ? <span className="spinner" /> : <Calendar size={18} />}
                {t('settings.seedHolidays')} {holidayYear}
              </button>
              <button className="btn btn-primary" onClick={handleOpenHolidayCreate}>
                <Plus size={18} />
                {t('settings.addHoliday')}
              </button>
            </div>
          </div>

          {holidaysLoading ? (
            <LoadingSpinner />
          ) : holidays.length === 0 ? (
            <EmptyState
              message={t('common.noData')}
              action={
                <button className="btn btn-secondary" onClick={handleSeedHolidays} disabled={seedLoading}>
                  <Calendar size={18} />
                  {t('settings.seedHolidays')} {holidayYear}
                </button>
              }
            />
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>{t('common.date')}</th>
                    <th>{t('settings.name')}</th>
                    <th>{t('common.type')}</th>
                    <th>{t('settings.recurring')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <motion.tbody key="holidays" variants={staggerParent} initial="initial" animate="animate">
                  {holidays.map((h) => (
                    <motion.tr key={h.id} variants={tableRowVariants}>
                      <td>{new Date(h.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                      <td style={{ fontWeight: 500 }}>{h.name}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          background: h.type === 'national' ? 'var(--color-primary-bg)' : 'var(--color-alternate)',
                          color: h.type === 'national' ? 'var(--color-primary)' : 'var(--color-secondary-text)',
                        }}>
                          {holidayTypeLabels[h.type] || h.type}
                        </span>
                      </td>
                      <td>{h.recurring ? t('common.yes') : t('common.no')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn-icon" title={t('common.edit')} onClick={() => handleOpenHolidayEdit(h)}>
                            <Edit size={16} color="var(--color-secondary-text)" />
                          </button>
                          <button
                            className="btn btn-icon"
                            title={t('common.delete')}
                            onClick={() => setDeleteConfirm({ type: 'holidays', id: h.id })}
                          >
                            <Trash2 size={16} color="var(--color-error)" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ================================================================= */}
      {/* Work Calendar Tab */}
      {/* ================================================================= */}
      {activeTab === 'work-calendar' && (
        <>
          {calendarLoading ? (
            <LoadingSpinner />
          ) : (
            <div style={{ maxWidth: '500px' }}>
              <p style={{ fontSize: '14px', color: 'var(--color-secondary-text)', marginBottom: '24px' }}>
                {t('settings.workCalendarDescription')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {WEEKDAY_KEYS.map((key) => {
                  const fieldKey = `${key}_ativo` as keyof WorkCalendar;
                  const isActive = workCalendar[fieldKey] as boolean;
                  return (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        background: isActive ? 'var(--color-primary-bg)' : 'var(--color-alternate)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => handleToggleDay(key)}
                    >
                      <span style={{ fontWeight: 500, fontSize: '14px' }}>
                        {weekdayLabels[key]}
                      </span>
                      <div
                        style={{
                          width: '44px',
                          height: '24px',
                          borderRadius: '12px',
                          background: isActive ? 'var(--color-primary)' : '#ccc',
                          position: 'relative',
                          transition: 'background 0.2s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: '#fff',
                            position: 'absolute',
                            top: '2px',
                            left: isActive ? '22px' : '2px',
                            transition: 'left 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '24px' }}>
                <button className="btn btn-primary" onClick={handleSaveWorkCalendar} disabled={calendarSaving}>
                  {calendarSaving ? <span className="spinner" /> : <Save size={18} />}
                  {t('common.save')}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================================================================= */}
      {/* CRUD Create/Edit Modal (unity/discipline/category) */}
      {/* ================================================================= */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>{getModalTitle()}</h3>
            <div className="input-group">
              <label>{t('settings.name')} *</label>
              <input
                className="input-field"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                {t('common.cancel')}
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={modalLoading || !itemName.trim()}>
                {modalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Holiday Create/Edit Modal */}
      {/* ================================================================= */}
      {showHolidayModal && (
        <div className="modal-backdrop" onClick={() => setShowHolidayModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>
              {editingHoliday ? t('settings.editHoliday') : t('settings.addHoliday')}
            </h3>
            <div className="input-group">
              <label>{t('common.date')} *</label>
              <input
                className="input-field"
                type="date"
                value={holidayForm.date}
                onChange={(e) => setHolidayForm((p) => ({ ...p, date: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="input-group" style={{ marginTop: '12px' }}>
              <label>{t('settings.name')} *</label>
              <input
                className="input-field"
                value={holidayForm.name}
                onChange={(e) => setHolidayForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="input-group" style={{ marginTop: '12px' }}>
              <label>{t('common.type')}</label>
              <select
                className="input-field"
                value={holidayForm.type}
                onChange={(e) => setHolidayForm((p) => ({ ...p, type: e.target.value }))}
              >
                <option value="national">{t('settings.holidayNational')}</option>
                <option value="state">{t('settings.holidayState')}</option>
                <option value="municipal">{t('settings.holidayMunicipal')}</option>
                <option value="custom">{t('settings.holidayCustom')}</option>
              </select>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="holiday-recurring"
                checked={holidayForm.recurring}
                onChange={(e) => setHolidayForm((p) => ({ ...p, recurring: e.target.checked }))}
              />
              <label htmlFor="holiday-recurring" style={{ fontSize: '14px' }}>{t('settings.recurring')}</label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setShowHolidayModal(false)}>
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveHoliday}
                disabled={holidayModalLoading || !holidayForm.date || !holidayForm.name.trim()}
              >
                {holidayModalLoading ? <span className="spinner" /> : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ConfirmModal
          title={t('common.confirmDelete')}
          message={t('settings.confirmDelete')}
          onConfirm={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
