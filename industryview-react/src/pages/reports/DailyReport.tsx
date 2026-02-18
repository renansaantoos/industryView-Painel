import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild } from '../../lib/motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { reportsApi } from '../../services';
import type { DailyReport as DailyReportType } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, Calendar, CloudSun, FileText, Download, Edit, Save } from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/dateUtils';
import { generateSimplePdf } from '../../utils/pdfUtils';

export default function DailyReport() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projectsInfo } = useAppState();

  const reportId = parseInt(searchParams.get('reportId') || '0', 10);

  const [report, setReport] = useState<DailyReportType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [editDescription, setEditDescription] = useState('');
  const [editWeather, setEditWeather] = useState('');
  const [editObservations, setEditObservations] = useState('');

  useEffect(() => {
    if (!reportId) {
      navigate(-1);
      return;
    }
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await reportsApi.getDailyReport(reportId) as DailyReportType;
      setReport(data);
      setEditDescription(data?.description || '');
      setEditWeather(data?.weather || '');
      setEditObservations(data?.observations || '');
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    setSaving(true);
    try {
      await reportsApi.editDailyReport(report.id, {
        description: editDescription.trim(),
        weather: editWeather.trim(),
        observations: editObservations.trim(),
      });
      setEditing(false);
      loadReport();
    } catch (err) {
      console.error('Failed to save report:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = () => {
    if (!report) return;
    const content = [
      `Data: ${formatDate(report.date || '')}`,
      `Projeto: ${projectsInfo?.name || ''}`,
      `Clima: ${report.weather || '-'}`,
      '',
      'Descricao:',
      report.description || '-',
      '',
      'Observacoes:',
      report.observations || '-',
    ].join('\n');
    generateSimplePdf(`RDO - ${formatDate(report.date || '')}`, content);
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!report) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title={`RDO - ${formatDate(report.date || '')}`}
        subtitle={t('reports.dailyReportDetail')}
        breadcrumb={`${t('projects.title')} / ${projectsInfo?.name || ''} / ${t('reports.title')} / RDO`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} /> {t('common.back')}
            </button>
            <button className="btn btn-secondary" onClick={handleExportPdf}>
              <Download size={18} /> PDF
            </button>
            {editing ? (
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" /> : <><Save size={18} /> {t('common.save')}</>}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setEditing(true)}>
                <Edit size={18} /> {t('common.edit')}
              </button>
            )}
          </div>
        }
      />

      <motion.div variants={staggerParent} initial="initial" animate="animate" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <motion.div variants={fadeUpChild} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar size={20} color="var(--color-primary)" />
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{t('reports.date')}</p>
            <p style={{ fontWeight: 500 }}>{report.date ? formatDate(report.date) : '-'}</p>
          </div>
        </motion.div>
        <motion.div variants={fadeUpChild} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <CloudSun size={20} color="var(--color-warning)" />
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{t('reports.weather')}</p>
            {editing ? (
              <input
                className="input-field"
                value={editWeather}
                onChange={(e) => setEditWeather(e.target.value)}
                style={{ fontSize: '14px', padding: '4px 8px' }}
              />
            ) : (
              <p style={{ fontWeight: 500 }}>{report.weather || '-'}</p>
            )}
          </div>
        </motion.div>
        <motion.div variants={fadeUpChild} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText size={20} color="var(--color-success)" />
          <div>
            <p style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{t('reports.createdAt')}</p>
            <p style={{ fontWeight: 500 }}>{report.createdAt ? formatDateTime(report.createdAt) : '-'}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Description */}
      <motion.div variants={fadeUpChild} initial="initial" animate="animate" className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '12px' }}>
          {t('reports.description')}
        </h3>
        {editing ? (
          <textarea
            className="input-field"
            rows={8}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
        ) : (
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-primary-text)', whiteSpace: 'pre-wrap' }}>
            {report.description || t('common.noData')}
          </p>
        )}
      </motion.div>

      {/* Observations */}
      <motion.div variants={fadeUpChild} initial="initial" animate="animate" className="card">
        <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '12px' }}>
          {t('reports.observations')}
        </h3>
        {editing ? (
          <textarea
            className="input-field"
            rows={4}
            value={editObservations}
            onChange={(e) => setEditObservations(e.target.value)}
          />
        ) : (
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-primary-text)', whiteSpace: 'pre-wrap' }}>
            {report.observations || t('common.noData')}
          </p>
        )}
      </motion.div>
    </div>
  );
}
