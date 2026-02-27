import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { projectCalendarApi } from '../../services';
import type { ProjectHoliday, ProjectWorkCalendar, CalendarOverride } from '../../services/api/projectCalendar';
import PageHeader from '../../components/common/PageHeader';
import ProjectSelector from '../../components/common/ProjectSelector';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Download,
  X,
  Check,
} from 'lucide-react';

const DAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'] as const;
type DayKey = (typeof DAYS)[number];

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DEFAULT_CAL: Record<string, any> = {};
for (const d of DAYS) {
  DEFAULT_CAL[`${d}_ativo`] = DAYS.indexOf(d) < 5;
  DEFAULT_CAL[`${d}_entrada`] = '08:00';
  DEFAULT_CAL[`${d}_intervalo_ini`] = '12:00';
  DEFAULT_CAL[`${d}_intervalo_fim`] = '13:00';
  DEFAULT_CAL[`${d}_saida`] = '17:00';
}

const DAY_LABELS: Record<DayKey, string> = {
  seg: 'Segunda', ter: 'Terça', qua: 'Quarta',
  qui: 'Quinta', sex: 'Sexta', sab: 'Sábado', dom: 'Domingo',
};

interface ToastState { message: string; type: 'success' | 'error' }

export default function ProjectCalendar() {
  const { t } = useTranslation();
  const { projectsInfo } = useAppState();

  const [activeTab, setActiveTab] = useState<'holidays' | 'calendar'>('holidays');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // ── Holidays state ──
  const [holidays, setHolidays] = useState<ProjectHoliday[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [holidayModal, setHolidayModal] = useState<{ open: boolean; editing: ProjectHoliday | null }>({ open: false, editing: null });
  const [holidayForm, setHolidayForm] = useState({ date: '', name: '', type: 'national', recurring: false });

  // ── Calendar state ──
  const [calendar, setCalendar] = useState<ProjectWorkCalendar | null>(null);
  const [calForm, setCalForm] = useState<Record<string, any>>({ ...DEFAULT_CAL });
  const [overrides, setOverrides] = useState<CalendarOverride[]>([]);
  const [overrideModal, setOverrideModal] = useState<{ open: boolean; month: number; existing: CalendarOverride | null }>({ open: false, month: 1, existing: null });
  const [overrideForm, setOverrideForm] = useState<Record<string, any>>({ ...DEFAULT_CAL, year: '' });

  if (!projectsInfo) return <ProjectSelector />;

  const projectId = projectsInfo.id;
  const country = (projectsInfo as any).country || 'Brasil';

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Load holidays ──
  const loadHolidays = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectCalendarApi.listHolidays(projectId, selectedYear);
      setHolidays(data);
    } catch { showToast(t('common.error'), 'error'); }
    setLoading(false);
  }, [projectId, selectedYear]);

  // ── Load calendar ──
  const loadCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectCalendarApi.getWorkCalendar(projectId);
      setCalendar(data);
      const form: Record<string, any> = {};
      for (const d of DAYS) {
        form[`${d}_ativo`] = (data as any)[`${d}_ativo`] ?? DEFAULT_CAL[`${d}_ativo`];
        form[`${d}_entrada`] = (data as any)[`${d}_entrada`] ?? '08:00';
        form[`${d}_intervalo_ini`] = (data as any)[`${d}_intervalo_ini`] ?? '12:00';
        form[`${d}_intervalo_fim`] = (data as any)[`${d}_intervalo_fim`] ?? '13:00';
        form[`${d}_saida`] = (data as any)[`${d}_saida`] ?? '17:00';
      }
      setCalForm(form);
      setOverrides(data.overrides ?? []);
    } catch { showToast(t('common.error'), 'error'); }
    setLoading(false);
  }, [projectId]);

  useEffect(() => { loadHolidays(); }, [loadHolidays]);
  useEffect(() => { if (activeTab === 'calendar') loadCalendar(); }, [activeTab, loadCalendar]);

  // ── Holiday CRUD ──
  const handleSeedHolidays = async () => {
    setLoading(true);
    try {
      const result = await projectCalendarApi.seedHolidays(projectId, selectedYear);
      if (result.ok === false) {
        if (result.message === 'unsupported_country') {
          showToast(t('projectCalendar.seedUnsupportedCountry', { country: result.country }), 'error');
        } else {
          showToast(t('projectCalendar.seedApiError'), 'error');
        }
      } else {
        showToast(t('projectCalendar.seedSuccess'), 'success');
        await loadHolidays();
      }
    } catch { showToast(t('common.error'), 'error'); }
    setLoading(false);
  };

  const openHolidayModal = (holiday?: ProjectHoliday) => {
    if (holiday) {
      setHolidayForm({ date: holiday.date.substring(0, 10), name: holiday.name, type: holiday.type, recurring: holiday.recurring });
      setHolidayModal({ open: true, editing: holiday });
    } else {
      setHolidayForm({ date: '', name: '', type: 'national', recurring: false });
      setHolidayModal({ open: true, editing: null });
    }
  };

  const saveHoliday = async () => {
    if (!holidayForm.date || !holidayForm.name) return;
    setLoading(true);
    try {
      if (holidayModal.editing) {
        await projectCalendarApi.updateHoliday(holidayModal.editing.id, holidayForm);
      } else {
        await projectCalendarApi.createHoliday({ projects_id: projectId, ...holidayForm });
      }
      setHolidayModal({ open: false, editing: null });
      showToast(t('common.success'), 'success');
      await loadHolidays();
    } catch { showToast(t('common.error'), 'error'); }
    setLoading(false);
  };

  const removeHoliday = async (id: number) => {
    if (!confirm(t('common.confirmDeleteMessage'))) return;
    try {
      await projectCalendarApi.deleteHoliday(id);
      showToast(t('common.success'), 'success');
      await loadHolidays();
    } catch { showToast(t('common.error'), 'error'); }
  };

  // ── Calendar save ──
  const saveCalendar = async () => {
    setLoading(true);
    try {
      await projectCalendarApi.upsertWorkCalendar({ projects_id: projectId, ...calForm } as any);
      showToast(t('common.success'), 'success');
      await loadCalendar();
    } catch { showToast(t('common.error'), 'error'); }
    setLoading(false);
  };

  // ── Override ──
  const openOverrideModal = (month: number) => {
    const existing = overrides.find((o) => o.month === month);
    const base = existing ?? calForm;
    const form: Record<string, any> = { year: existing?.year ?? '' };
    for (const d of DAYS) {
      form[`${d}_ativo`] = (base as any)[`${d}_ativo`] ?? DEFAULT_CAL[`${d}_ativo`];
      form[`${d}_entrada`] = (base as any)[`${d}_entrada`] ?? '08:00';
      form[`${d}_intervalo_ini`] = (base as any)[`${d}_intervalo_ini`] ?? '12:00';
      form[`${d}_intervalo_fim`] = (base as any)[`${d}_intervalo_fim`] ?? '13:00';
      form[`${d}_saida`] = (base as any)[`${d}_saida`] ?? '17:00';
    }
    setOverrideForm(form);
    setOverrideModal({ open: true, month, existing: existing ?? null });
  };

  const saveOverride = async () => {
    if (!calendar?.id) {
      showToast(t('projectCalendar.saveCalendarFirst'), 'error');
      return;
    }
    setLoading(true);
    try {
      const { year, ...dayFields } = overrideForm;
      await projectCalendarApi.upsertCalendarOverride({
        project_work_calendar_id: calendar.id,
        month: overrideModal.month,
        year: year ? Number(year) : null,
        ...dayFields,
      } as any);
      setOverrideModal({ open: false, month: 1, existing: null });
      showToast(t('common.success'), 'success');
      await loadCalendar();
    } catch { showToast(t('common.error'), 'error'); }
    setLoading(false);
  };

  const removeOverride = async () => {
    if (!overrideModal.existing) return;
    try {
      await projectCalendarApi.deleteCalendarOverride(overrideModal.existing.id);
      setOverrideModal({ open: false, month: 1, existing: null });
      showToast(t('common.success'), 'success');
      await loadCalendar();
    } catch { showToast(t('common.error'), 'error'); }
  };

  // ── Type badge color ──
  const typeBadgeColor = (type: string) => {
    switch (type) {
      case 'national': return { bg: '#028F5820', color: '#028F58' };
      case 'state': return { bg: '#2563eb20', color: '#2563eb' };
      case 'municipal': return { bg: '#7c3aed20', color: '#7c3aed' };
      default: return { bg: '#64748b20', color: '#64748b' };
    }
  };

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      national: t('projectCalendar.holidayNational'),
      state: t('projectCalendar.holidayState'),
      municipal: t('projectCalendar.holidayMunicipal'),
      custom: t('projectCalendar.holidayCustom'),
    };
    return map[type] || type;
  };

  // ── Day row component ──
  const DayRow = ({ day, form, setForm }: { day: DayKey; form: Record<string, any>; setForm: (f: Record<string, any>) => void }) => {
    const active = form[`${day}_ativo`];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--color-alternate)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setForm({ ...form, [`${day}_ativo`]: e.target.checked })}
            style={{ accentColor: 'var(--color-primary)' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 500, color: active ? 'var(--color-primary-text)' : 'var(--color-secondary-text)' }}>
            {DAY_LABELS[day]}
          </span>
        </label>
        {(['entrada', 'intervalo_ini', 'intervalo_fim', 'saida'] as const).map((field) => (
          <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--color-secondary-text)' }}>
              {field === 'entrada' ? t('projectCalendar.entrada') :
               field === 'intervalo_ini' ? t('projectCalendar.intervaloInicio') :
               field === 'intervalo_fim' ? t('projectCalendar.intervaloFim') :
               t('projectCalendar.saida')}
            </span>
            <input
              type="time"
              value={form[`${day}_${field}`] ?? ''}
              disabled={!active}
              onChange={(e) => setForm({ ...form, [`${day}_${field}`]: e.target.value })}
              style={{
                padding: '4px 8px', fontSize: '13px', borderRadius: '6px',
                border: '1px solid var(--color-alternate)', background: active ? 'var(--color-secondary-bg)' : 'var(--color-alternate)',
                color: active ? 'var(--color-primary-text)' : 'var(--color-secondary-text)',
                width: '100px',
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  const yearOptions = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div>
      <PageHeader
        title={t('projectCalendar.title')}
        subtitle={t('projectCalendar.subtitle')}
        breadcrumb={`${projectsInfo.name} / ${t('projectCalendar.title')}`}
        actions={
          <Link to="/projeto-detalhes" className="btn btn-secondary">
            <ArrowLeft size={18} /> {t('common.back')}
          </Link>
        }
      />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          padding: '12px 20px', borderRadius: '8px', color: '#fff',
          background: toast.type === 'success' ? '#028F58' : '#C0392B',
          fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toast.message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid var(--color-alternate)' }}>
        {(['holidays', 'calendar'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 24px', fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              border: 'none', background: 'none',
              color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-secondary-text)',
              borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            {tab === 'holidays' ? t('projectCalendar.tabHolidays') : t('projectCalendar.tabWorkCalendar')}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}

      {/* ══════ TAB: HOLIDAYS ══════ */}
      {activeTab === 'holidays' && (
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input"
              style={{ width: '120px' }}
            >
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <span style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
              {holidays.length} {t('projectCalendar.tabHolidays').toLowerCase()}
            </span>
            <div style={{ flex: 1 }} />
            <button className="btn btn-secondary" onClick={handleSeedHolidays} disabled={loading}>
              <Download size={16} /> {t('projectCalendar.seedHolidaysForCountry', { country })}
            </button>
            <button className="btn btn-primary" onClick={() => openHolidayModal()}>
              <Plus size={16} /> {t('projectCalendar.addHoliday')}
            </button>
          </div>

          {/* Table */}
          <div className="card" style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-alternate)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>{t('common.date')}</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>{t('common.name')}</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>{t('common.type')}</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', fontWeight: 600 }}>{t('projectCalendar.recurring')}</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600 }}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {holidays.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--color-secondary-text)' }}>{t('common.noData')}</td></tr>
                )}
                {holidays.map((h) => {
                  const badge = typeBadgeColor(h.type);
                  return (
                    <tr key={h.id} style={{ borderBottom: '1px solid var(--color-alternate)' }}>
                      <td style={{ padding: '10px 12px' }}>{new Date(h.date).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '10px 12px' }}>{h.name}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 500, background: badge.bg, color: badge.color }}>
                          {typeLabel(h.type)}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {h.recurring ? <Check size={16} style={{ color: '#028F58' }} /> : <X size={16} style={{ color: '#94a3b8' }} />}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => openHolidayModal(h)}><Pencil size={14} /></button>
                          <button className="btn btn-secondary" style={{ padding: '4px 8px', color: '#C0392B' }} onClick={() => removeHoliday(h.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Holiday Modal */}
          {holidayModal.open && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
              <div className="card" style={{ width: '420px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {holidayModal.editing ? t('projectCalendar.editHoliday') : t('projectCalendar.addHoliday')}
                  </h3>
                  <button onClick={() => setHolidayModal({ open: false, editing: null })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>{t('common.date')}</label>
                    <input type="date" className="input" value={holidayForm.date} onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>{t('common.name')}</label>
                    <input type="text" className="input" value={holidayForm.name} onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })} placeholder="Ex: Natal" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>{t('common.type')}</label>
                    <select className="input" value={holidayForm.type} onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value })} style={{ width: '100%' }}>
                      <option value="national">{t('projectCalendar.holidayNational')}</option>
                      <option value="state">{t('projectCalendar.holidayState')}</option>
                      <option value="municipal">{t('projectCalendar.holidayMunicipal')}</option>
                      <option value="custom">{t('projectCalendar.holidayCustom')}</option>
                    </select>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={holidayForm.recurring} onChange={(e) => setHolidayForm({ ...holidayForm, recurring: e.target.checked })} style={{ accentColor: 'var(--color-primary)' }} />
                    <span style={{ fontSize: '13px' }}>{t('projectCalendar.recurring')}</span>
                  </label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                  <button className="btn btn-secondary" onClick={() => setHolidayModal({ open: false, editing: null })}>{t('common.cancel')}</button>
                  <button className="btn btn-primary" onClick={saveHoliday} disabled={loading}>{t('common.save')}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════ TAB: WORK CALENDAR ══════ */}
      {activeTab === 'calendar' && (
        <div>
          {/* Default Schedule */}
          <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>{t('projectCalendar.defaultSchedule')}</h3>
            {DAYS.map((d) => (
              <DayRow key={d} day={d} form={calForm} setForm={setCalForm} />
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={saveCalendar} disabled={loading}>{t('common.save')}</button>
            </div>
          </div>

          {/* Monthly Overrides */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{t('projectCalendar.monthlyOverrides')}</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginBottom: '16px' }}>{t('projectCalendar.monthlyOverridesDesc')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {MONTH_NAMES.map((name, i) => {
                const hasOvr = overrides.some((o) => o.month === i + 1);
                return (
                  <button
                    key={i}
                    onClick={() => openOverrideModal(i + 1)}
                    style={{
                      padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                      border: hasOvr ? '2px solid var(--color-primary)' : '1px solid var(--color-alternate)',
                      background: hasOvr ? 'var(--color-primary-bg)' : 'var(--color-secondary-bg)',
                      color: hasOvr ? 'var(--color-primary)' : 'var(--color-primary-text)',
                      position: 'relative',
                    }}
                  >
                    {name}
                    {hasOvr && (
                      <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        width: '10px', height: '10px', borderRadius: '50%',
                        background: '#028F58', border: '2px solid var(--color-secondary-bg)',
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Override Modal */}
          {overrideModal.open && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
              <div className="card" style={{ width: '600px', maxHeight: '90vh', overflow: 'auto', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                    {t('projectCalendar.overrideMonth', { month: MONTH_NAMES[overrideModal.month - 1] })}
                  </h3>
                  <button onClick={() => setOverrideModal({ open: false, month: 1, existing: null })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, marginBottom: '4px', display: 'block' }}>
                    {t('projectCalendar.overrideYear')}
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={overrideForm.year}
                    onChange={(e) => setOverrideForm({ ...overrideForm, year: e.target.value })}
                    placeholder={t('projectCalendar.overrideYearHint')}
                    style={{ width: '150px' }}
                  />
                </div>
                {DAYS.map((d) => (
                  <DayRow key={d} day={d} form={overrideForm} setForm={setOverrideForm} />
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <div>
                    {overrideModal.existing && (
                      <button className="btn btn-secondary" style={{ color: '#C0392B' }} onClick={removeOverride}>
                        {t('projectCalendar.removeOverride')}
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" onClick={() => setOverrideModal({ open: false, month: 1, existing: null })}>{t('common.cancel')}</button>
                    <button className="btn btn-primary" onClick={saveOverride} disabled={loading}>{t('common.save')}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
