import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerParent, fadeUpChild, tableRowVariants } from '../../lib/motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../contexts/AppStateContext';
import { tasksApi } from '../../services';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ArrowLeft, Upload, FileSpreadsheet, Check, X } from 'lucide-react';
import { parseCsvFile } from '../../utils/csvUtils';
import SearchableSelect from '../../components/common/SearchableSelect';

interface CsvRow {
  [key: string]: string;
}

interface HeaderMapping {
  csvHeader: string;
  systemField: string;
}

const SYSTEM_FIELDS = [
  { key: 'name', label: 'Nome da Tarefa' },
  { key: 'description', label: 'Descricao' },
  { key: 'quantity', label: 'Quantidade' },
  { key: 'unity', label: 'Unidade' },
  { key: 'discipline', label: 'Disciplina' },
  { key: 'skip', label: '-- Ignorar --' },
];

export default function ImportTask() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectsInfo } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'done'>('upload');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [headerMappings, setHeaderMappings] = useState<HeaderMapping[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectsInfo) {
      navigate('/projetos');
    }
  }, [projectsInfo, navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    try {
      const result = await parseCsvFile(file);
      if (!result || !result.data || result.data.length === 0) {
        setError(t('import.emptyFile'));
        return;
      }

      const headers = result.headers;
      setCsvHeaders(headers);
      setCsvData(result.data as CsvRow[]);

      // Auto-map headers based on name matching
      const mappings: HeaderMapping[] = headers.map((header) => {
        const normalizedHeader = header.toLowerCase().trim();
        let systemField = 'skip';

        if (normalizedHeader.includes('nome') || normalizedHeader.includes('name') || normalizedHeader.includes('tarefa') || normalizedHeader.includes('task')) {
          systemField = 'name';
        } else if (normalizedHeader.includes('desc')) {
          systemField = 'description';
        } else if (normalizedHeader.includes('qtd') || normalizedHeader.includes('quant') || normalizedHeader.includes('quantity')) {
          systemField = 'quantity';
        } else if (normalizedHeader.includes('unid') || normalizedHeader.includes('unity') || normalizedHeader.includes('unit')) {
          systemField = 'unity';
        } else if (normalizedHeader.includes('disc') || normalizedHeader.includes('discipli')) {
          systemField = 'discipline';
        }

        return { csvHeader: header, systemField };
      });

      setHeaderMappings(mappings);
      setStep('mapping');
    } catch (err) {
      setError(t('import.parseError'));
      console.error('CSV parse error:', err);
    }
  };

  const handleMappingChange = (index: number, systemField: string) => {
    setHeaderMappings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], systemField };
      return updated;
    });
  };

  const handleStartImport = async () => {
    if (!projectsInfo) return;

    const nameMapping = headerMappings.find((m) => m.systemField === 'name');
    if (!nameMapping) {
      setError(t('import.nameRequired'));
      return;
    }

    setStep('importing');
    let success = 0;
    let failed = 0;

    for (const row of csvData) {
      const name = row[nameMapping.csvHeader]?.trim();
      if (!name) {
        failed++;
        continue;
      }

      try {
        await tasksApi.addTask({ name });
        success++;
      } catch {
        failed++;
      }
    }

    setImportResult({ success, failed });
    setStep('done');
  };

  if (!projectsInfo) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title={t('import.title')}
        subtitle={t('import.subtitle')}
        breadcrumb={`${t('projects.title')} / ${projectsInfo.name} / ${t('import.title')}`}
        actions={
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> {t('common.back')}
          </button>
        }
      />

      {error && <div className="auth-error" style={{ marginBottom: '16px' }}>{error}</div>}

      {/* Step: Upload */}
      {step === 'upload' && (
        <motion.div variants={fadeUpChild} initial="initial" animate="animate" className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <FileSpreadsheet size={48} color="var(--color-primary)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>
            {t('import.uploadCsv')}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--color-secondary-text)', marginBottom: '24px' }}>
            {t('import.uploadDescription')}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} /> {t('import.selectFile')}
          </button>
        </motion.div>
      )}

      {/* Step: Mapping */}
      {step === 'mapping' && (
        <motion.div variants={fadeUpChild} initial="initial" animate="animate" className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px' }}>
            {t('import.mapHeaders')}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '16px' }}>
            {t('import.mapDescription')} ({csvData.length} {t('import.rowsFound')})
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {headerMappings.map((mapping, index) => (
              <div
                key={mapping.csvHeader}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-alternate)',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{mapping.csvHeader}</span>
                <span style={{ color: 'var(--color-secondary-text)' }}>-&gt;</span>
                <SearchableSelect
                  options={SYSTEM_FIELDS.map((field) => ({ value: field.key, label: field.label }))}
                  value={mapping.systemField}
                  onChange={(value) => handleMappingChange(index, value ? String(value) : 'skip')}
                  placeholder="Selecione..."
                  searchPlaceholder="Pesquisar..."
                  allowClear={false}
                />
              </div>
            ))}
          </div>

          {/* Preview table */}
          <h4 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
            {t('import.preview')} ({Math.min(5, csvData.length)} {t('import.rows')})
          </h4>
          <div className="table-container" style={{ marginBottom: '24px' }}>
            <table>
              <thead>
                <tr>
                  {csvHeaders.map((header) => (
                    <th key={header} style={{ fontSize: '12px' }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                {csvData.slice(0, 5).map((row, i) => (
                  <motion.tr key={i} variants={tableRowVariants}>
                    {csvHeaders.map((header) => (
                      <td key={header} style={{ fontSize: '12px' }}>{row[header] || '-'}</td>
                    ))}
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => { setStep('upload'); setCsvData([]); setCsvHeaders([]); }}>
              {t('common.cancel')}
            </button>
            <button className="btn btn-primary" onClick={handleStartImport}>
              <Upload size={18} /> {t('import.startImport')} ({csvData.length} {t('import.rows')})
            </button>
          </div>
        </motion.div>
      )}

      {/* Step: Importing */}
      {step === 'importing' && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <LoadingSpinner />
          <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--color-secondary-text)' }}>
            {t('import.importing')}...
          </p>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && importResult && (
        <motion.div variants={fadeUpChild} initial="initial" animate="animate" className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Check size={48} color="var(--color-success)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '16px' }}>
            {t('import.complete')}
          </h3>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={18} color="var(--color-success)" />
              <span style={{ fontWeight: 500, color: 'var(--color-success)' }}>{importResult.success} {t('import.imported')}</span>
            </div>
            {importResult.failed > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <X size={18} color="var(--color-error)" />
                <span style={{ fontWeight: 500, color: 'var(--color-error)' }}>{importResult.failed} {t('import.failed')}</span>
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            {t('common.back')}
          </button>
        </motion.div>
      )}
    </div>
  );
}
