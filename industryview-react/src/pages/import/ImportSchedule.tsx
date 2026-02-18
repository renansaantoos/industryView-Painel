import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeUpChild, staggerParent, tableRowVariants } from '../../lib/motion';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../contexts/AppStateContext';
import { planningApi } from '../../services';
import type { ImportResult } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchableSelect from '../../components/common/SearchableSelect';
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  Check,
  X,
  Download,
  ChevronRight,
  AlertCircle,
  Info,
  FileText,
  Flag,
  GanttChartSquare,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

type ImportStep = 'upload' | 'mapeamento' | 'preview' | 'resultado';
type ImportMode = 'create' | 'update' | 'replace';
type FileType = 'xlsx' | 'csv' | 'xml' | 'unknown';

const IMPORT_MODE_OPTIONS = [
  {
    value: 'create',
    label: 'Criar — adicionar novas tarefas',
    description: 'Importa todas as tarefas como novas. Ideal para a primeira importação.',
  },
  {
    value: 'update',
    label: 'Atualizar — atualizar tarefas existentes',
    description: 'Atualiza tarefas com base no ID externo. Novas tarefas são criadas.',
  },
  {
    value: 'replace',
    label: 'Substituir — apagar e reimportar',
    description: 'Remove todas as tarefas existentes e reimporta. Use com cuidado.',
  },
];

const SCHEDULE_SYSTEM_FIELDS = [
  { key: 'wbs_code', label: 'Código WBS' },
  { key: 'descricao', label: 'Descrição / Nome' },
  { key: 'data_inicio', label: 'Data Início Planejada' },
  { key: 'data_fim', label: 'Data Fim Planejada' },
  { key: 'duracao', label: 'Duração (dias)' },
  { key: 'predecessores', label: 'Predecessores' },
  { key: 'custo', label: 'Custo Planejado' },
  { key: 'peso', label: 'Peso / Ponderação' },
  { key: 'marco', label: 'É Marco (sim/não)' },
  { key: 'nivel', label: 'Nível WBS' },
  { key: 'id_externo', label: 'ID Externo / Origem' },
  { key: 'skip', label: '-- Ignorar --' },
];

const ACCEPTED_FORMATS = ['.xlsx', '.xls', '.csv', '.xml'];

// Auto-mapping heuristics: maps common header keywords → system field keys
const AUTO_MAP_RULES: { keywords: string[]; field: string }[] = [
  { keywords: ['wbs', 'codigo', 'code'], field: 'wbs_code' },
  { keywords: ['desc', 'nome', 'name', 'tarefa', 'task', 'atividade', 'activity'], field: 'descricao' },
  { keywords: ['inicio', 'start', 'começo', 'begin'], field: 'data_inicio' },
  { keywords: ['fim', 'end', 'termino', 'finish', 'term'], field: 'data_fim' },
  { keywords: ['dur', 'dias', 'days', 'prazo'], field: 'duracao' },
  { keywords: ['pred', 'predecessor', 'depend'], field: 'predecessores' },
  { keywords: ['custo', 'cost', 'valor', 'budget'], field: 'custo' },
  { keywords: ['peso', 'weight', 'pond'], field: 'peso' },
  { keywords: ['marco', 'milestone'], field: 'marco' },
  { keywords: ['nivel', 'level', 'hierarq'], field: 'nivel' },
  { keywords: ['id', 'externo', 'source', 'uid', 'external'], field: 'id_externo' },
];

function autoMapHeader(header: string): string {
  const normalized = header.toLowerCase().trim();
  for (const rule of AUTO_MAP_RULES) {
    if (rule.keywords.some((kw) => normalized.includes(kw))) {
      return rule.field;
    }
  }
  return 'skip';
}

function detectFileType(file: File): FileType {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'xlsx';
  if (name.endsWith('.csv')) return 'csv';
  if (name.endsWith('.xml')) return 'xml';
  return 'unknown';
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepIndicator({ current, steps }: { current: ImportStep; steps: { key: ImportStep; label: string }[] }) {
  const currentIndex = steps.findIndex((s) => s.key === current);
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px' }}>
      {steps.map((step, i) => (
        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                background: i < currentIndex
                  ? 'var(--color-success, #22c55e)'
                  : i === currentIndex
                  ? 'var(--color-primary, #3b82f6)'
                  : 'rgba(255,255,255,0.1)',
                color: i <= currentIndex ? 'white' : 'var(--color-secondary-text)',
                border: i === currentIndex ? '2px solid var(--color-primary)' : '2px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              {i < currentIndex ? <Check size={14} /> : i + 1}
            </div>
            <span style={{ fontSize: '11px', fontWeight: i === currentIndex ? 600 : 400, color: i === currentIndex ? 'var(--color-primary)' : 'var(--color-secondary-text)', whiteSpace: 'nowrap' }}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                flex: 1,
                height: '2px',
                background: i < currentIndex ? 'var(--color-success)' : 'rgba(255,255,255,0.1)',
                margin: '0 8px',
                marginBottom: '18px',
                transition: 'background 0.3s ease',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

interface PreviewRow {
  [key: string]: string;
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ImportSchedule() {
  const navigate = useNavigate();
  const { projectsInfo } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ImportStep>('upload');
  const [importMode, setImportMode] = useState<ImportMode>('create');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>('unknown');
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');

  // Mapping step
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvPreviewRows, setCsvPreviewRows] = useState<PreviewRow[]>([]);
  const [headerMappings, setHeaderMappings] = useState<{ csvHeader: string; systemField: string }[]>([]);

  // Upload/import state
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Template download
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  useEffect(() => {
    if (!projectsInfo) {
      navigate('/projetos');
    }
  }, [projectsInfo, navigate]);

  const STEPS: { key: ImportStep; label: string }[] = [
    { key: 'upload', label: 'Upload' },
    { key: 'mapeamento', label: 'Mapeamento' },
    { key: 'preview', label: 'Preview' },
    { key: 'resultado', label: 'Resultado' },
  ];

  const handleFileSelect = useCallback((file: File) => {
    setError('');
    const detected = detectFileType(file);

    if (detected === 'unknown') {
      setError('Formato de arquivo não suportado. Use .xlsx, .xls, .csv ou .xml.');
      return;
    }

    setSelectedFile(file);
    setFileType(detected);

    if (detected === 'xml') {
      // XML: skip column mapping, go straight to preview
      setStep('preview');
      return;
    }

    // For CSV/XLSX: parse headers from CSV using FileReader
    if (detected === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;
        const lines = text.split('\n').filter((l) => l.trim());
        if (lines.length === 0) {
          setError('Arquivo CSV vazio.');
          return;
        }
        // Parse comma or semicolon separated
        const separator = lines[0].includes(';') ? ';' : ',';
        const headers = lines[0].split(separator).map((h) => h.trim().replace(/^"|"$/g, ''));
        const previewRows: PreviewRow[] = lines.slice(1, 6).map((line) => {
          const values = line.split(separator).map((v) => v.trim().replace(/^"|"$/g, ''));
          const row: PreviewRow = {};
          headers.forEach((h, i) => { row[h] = values[i] ?? ''; });
          return row;
        });
        setCsvHeaders(headers);
        setCsvPreviewRows(previewRows);
        setHeaderMappings(headers.map((h) => ({ csvHeader: h, systemField: autoMapHeader(h) })));
        setStep('mapeamento');
      };
      reader.readAsText(file, 'UTF-8');
    } else {
      // XLSX: we can't parse in browser without a lib, show generic column mapping with placeholder headers
      const placeholderHeaders = ['Coluna A', 'Coluna B', 'Coluna C', 'Coluna D', 'Coluna E', 'Coluna F'];
      setCsvHeaders(placeholderHeaders);
      setCsvPreviewRows([]);
      setHeaderMappings(placeholderHeaders.map((h) => ({ csvHeader: h, systemField: 'skip' })));
      setStep('mapeamento');
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleMappingChange = (index: number, systemField: string) => {
    setHeaderMappings((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], systemField };
      return next;
    });
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const blob = await planningApi.downloadTemplate('xlsx');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_cronograma.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Erro ao baixar template. Verifique sua conexão e tente novamente.');
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleImport = async () => {
    if (!projectsInfo || !selectedFile) return;

    setUploading(true);
    setError('');
    try {
      const columnMapping: Record<string, string> = {};
      headerMappings.forEach(({ csvHeader, systemField }) => {
        if (systemField !== 'skip') columnMapping[csvHeader] = systemField;
      });

      const result = await planningApi.uploadSchedule(
        projectsInfo.id,
        selectedFile,
        importMode,
        Object.keys(columnMapping).length > 0 ? columnMapping : undefined,
      );
      setImportResult(result);
      setStep('resultado');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError?.response?.data?.message ?? 'Erro ao importar o cronograma. Verifique o arquivo e tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  if (!projectsInfo) return <LoadingSpinner fullPage />;

  return (
    <div>
      <PageHeader
        title="Importar Cronograma"
        subtitle={`Importe o cronograma do projeto — ${projectsInfo.name}`}
        breadcrumb={`Cronograma / Importar`}
        actions={
          <button className="btn btn-secondary" onClick={() => navigate('/cronograma')}>
            <ArrowLeft size={16} /> Voltar
          </button>
        }
      />

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444',
            fontSize: '14px',
            marginBottom: '20px',
          }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <StepIndicator current={step} steps={STEPS} />

      {/* ── Step 1: Upload ───────────────────────────────────────────────────── */}
      {step === 'upload' && (
        <motion.div variants={fadeUpChild} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Import mode selector */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px' }}>
              Modo de Importação
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {IMPORT_MODE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${importMode === option.value ? 'var(--color-primary)' : 'var(--color-alternate)'}`,
                    cursor: 'pointer',
                    background: importMode === option.value ? 'rgba(59,130,246,0.06)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="importMode"
                    value={option.value}
                    checked={importMode === option.value as ImportMode}
                    onChange={() => setImportMode(option.value as ImportMode)}
                    style={{ marginTop: '2px', accentColor: 'var(--color-primary)' }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{option.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-secondary-text)', marginTop: '2px' }}>
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {importMode === 'replace' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '12px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  fontSize: '13px',
                  color: '#ef4444',
                }}
              >
                <AlertCircle size={14} />
                Atenção: o modo Substituir irá apagar permanentemente todas as tarefas e dependências do projeto antes de importar.
              </div>
            )}
          </div>

          {/* Formats info + download template */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: 'var(--color-secondary-text)',
              }}
            >
              <Info size={14} />
              Formatos aceitos:
              {ACCEPTED_FORMATS.map((fmt) => (
                <span
                  key={fmt}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid var(--color-alternate)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {fmt}
                </span>
              ))}
            </div>
            <button
              className="btn btn-secondary"
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate}
              style={{ fontSize: '13px' }}
            >
              {downloadingTemplate ? <span className="spinner" /> : <Download size={14} />}
              Baixar Template
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="card"
            style={{
              padding: '56px 32px',
              textAlign: 'center',
              cursor: 'pointer',
              border: `2px dashed ${isDragOver ? 'var(--color-primary)' : 'var(--color-alternate)'}`,
              background: isDragOver ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FORMATS.join(',')}
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
            <FileSpreadsheet
              size={48}
              color={isDragOver ? 'var(--color-primary)' : 'var(--color-secondary-text)'}
              style={{ marginBottom: '16px' }}
            />
            <h3 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
              {isDragOver ? 'Solte o arquivo aqui' : 'Arraste o arquivo ou clique para selecionar'}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '20px' }}>
              Suporta arquivos MS Project (XML), Excel (XLSX) e CSV.
            </p>
            <button
              className="btn btn-primary"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            >
              <Upload size={16} />
              Selecionar Arquivo
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Step 2: Mapeamento ───────────────────────────────────────────────── */}
      {step === 'mapeamento' && selectedFile && (
        <motion.div variants={fadeUpChild} initial="initial" animate="animate" className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <FileText size={18} color="var(--color-primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Mapeamento de Colunas</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginBottom: '20px' }}>
            Arquivo: <strong>{selectedFile.name}</strong> ({fileType.toUpperCase()}) — Mapeie as colunas do arquivo para os campos do sistema.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {/* Column header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', padding: '6px 12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Coluna do Arquivo
              </span>
              <span />
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Campo do Sistema
              </span>
            </div>

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
                  background: mapping.systemField !== 'skip' ? 'rgba(59,130,246,0.04)' : 'transparent',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {mapping.csvHeader}
                </span>
                <ChevronRight size={14} color="var(--color-secondary-text)" />
                <SearchableSelect
                  options={SCHEDULE_SYSTEM_FIELDS.map((f) => ({ value: f.key, label: f.label }))}
                  value={mapping.systemField}
                  onChange={(value) => handleMappingChange(index, value ? String(value) : 'skip')}
                  placeholder="Selecione..."
                  searchPlaceholder="Buscar campo..."
                  allowClear={false}
                />
              </div>
            ))}
          </div>

          {/* Preview rows (CSV only) */}
          {csvPreviewRows.length > 0 && (
            <>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
                Prévia dos dados ({csvPreviewRows.length} linha{csvPreviewRows.length !== 1 ? 's' : ''})
              </h4>
              <div className="table-container" style={{ marginBottom: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      {csvHeaders.map((h) => (
                        <th key={h} style={{ fontSize: '11px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                    {csvPreviewRows.map((row, i) => (
                      <motion.tr key={i} variants={tableRowVariants}>
                        {csvHeaders.map((h) => (
                          <td key={h} style={{ fontSize: '12px' }}>{row[h] || '-'}</td>
                        ))}
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => { setStep('upload'); setSelectedFile(null); setCsvHeaders([]); }}
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setStep('preview')}
            >
              Avançar para Prévia
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Step 3: Preview ──────────────────────────────────────────────────── */}
      {step === 'preview' && selectedFile && (
        <motion.div variants={fadeUpChild} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>Confirmação da Importação</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>
                  Arquivo: <strong>{selectedFile.name}</strong> |
                  Modo: <strong>{IMPORT_MODE_OPTIONS.find((o) => o.value === importMode)?.label ?? importMode}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { label: 'Coluna WBS', mapped: headerMappings.find((m) => m.systemField === 'wbs_code') },
                  { label: 'Descrição', mapped: headerMappings.find((m) => m.systemField === 'descricao') },
                  { label: 'Data Início', mapped: headerMappings.find((m) => m.systemField === 'data_inicio') },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '12px',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: item.mapped ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      border: `1px solid ${item.mapped ? '#22c55e33' : '#ef444433'}`,
                      color: item.mapped ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {item.mapped ? <Check size={11} /> : <X size={11} />}
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Mapping summary table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Coluna do Arquivo</th>
                    <th>Campo do Sistema</th>
                    <th style={{ width: '80px' }}>Status</th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                  {headerMappings.filter((m) => m.systemField !== 'skip').map((mapping, i) => (
                    <motion.tr key={i} variants={tableRowVariants}>
                      <td style={{ fontWeight: 500 }}>{mapping.csvHeader}</td>
                      <td style={{ color: 'var(--color-secondary-text)' }}>
                        {SCHEDULE_SYSTEM_FIELDS.find((f) => f.key === mapping.systemField)?.label ?? mapping.systemField}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: 'rgba(34,197,94,0.1)',
                            color: '#22c55e',
                            border: '1px solid #22c55e33',
                          }}
                        >
                          <Check size={10} /> Mapeado
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                  {headerMappings.filter((m) => m.systemField === 'skip').length > 0 && (
                    <motion.tr variants={tableRowVariants}>
                      <td
                        colSpan={3}
                        style={{ fontSize: '12px', color: 'var(--color-secondary-text)', fontStyle: 'italic' }}
                      >
                        {headerMappings.filter((m) => m.systemField === 'skip').length} coluna(s) ignorada(s): {headerMappings.filter((m) => m.systemField === 'skip').map((m) => m.csvHeader).join(', ')}
                      </td>
                    </motion.tr>
                  )}
                </motion.tbody>
              </table>
            </div>
          </div>

          {/* XML notice */}
          {fileType === 'xml' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.3)',
                fontSize: '13px',
                color: 'var(--color-primary)',
              }}
            >
              <Info size={14} />
              Arquivo XML (MS Project) detectado. O mapeamento de campos é automático.
            </div>
          )}

          {/* Warning for replace mode */}
          {importMode === 'replace' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                fontSize: '13px',
                color: '#ef4444',
              }}
            >
              <AlertCircle size={14} />
              Esta importação irá APAGAR todas as tarefas existentes do projeto. Esta ação não pode ser desfeita.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setStep(fileType === 'xml' ? 'upload' : 'mapeamento')}
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Confirmar Importação
                </>
              )}
            </button>
          </div>

          {uploading && (
            <div style={{ textAlign: 'center' }}>
              <LoadingSpinner />
              <p style={{ fontSize: '13px', color: 'var(--color-secondary-text)', marginTop: '8px' }}>
                Processando arquivo... Isso pode levar alguns minutos.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Step 4: Resultado ────────────────────────────────────────────────── */}
      {step === 'resultado' && importResult && (
        <motion.div variants={fadeUpChild} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: importResult.failed_tasks === 0 ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Check
                size={32}
                color={importResult.failed_tasks === 0 ? '#22c55e' : '#eab308'}
              />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Importação Concluída
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-secondary-text)', marginBottom: '24px' }}>
              O cronograma foi processado com sucesso.
            </p>

            {/* Result stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                marginBottom: '24px',
                maxWidth: '600px',
                margin: '0 auto 24px',
              }}
            >
              {[
                { label: 'Importadas', value: importResult.imported_tasks, color: '#22c55e', icon: <Check size={16} /> },
                { label: 'Falhas', value: importResult.failed_tasks, color: importResult.failed_tasks > 0 ? '#ef4444' : 'var(--color-secondary-text)', icon: <X size={16} /> },
                { label: 'Dependências', value: importResult.dependencies_created, color: '#3b82f6', icon: <Flag size={16} /> },
                { label: 'Total', value: importResult.total_tasks, color: 'var(--color-primary)', icon: <FileSpreadsheet size={16} /> },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: `${stat.color}0d`,
                    border: `1px solid ${stat.color}33`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ color: stat.color }}>{stat.icon}</span>
                  <span style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)' }}>{stat.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/cronograma')}>
                <GanttChartSquare size={16} />
                Ver Cronograma
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setStep('upload');
                  setSelectedFile(null);
                  setImportResult(null);
                  setCsvHeaders([]);
                  setCsvPreviewRows([]);
                  setHeaderMappings([]);
                  setError('');
                }}
              >
                <Upload size={16} />
                Nova Importação
              </button>
            </div>
          </div>

          {/* Error log */}
          {importResult.errors.length > 0 && (
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                Erros de Importação ({importResult.errors.length})
              </h4>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Linha</th>
                      <th>Erro</th>
                    </tr>
                  </thead>
                  <motion.tbody variants={staggerParent} initial="initial" animate="animate">
                    {importResult.errors.map((err, i) => (
                      <motion.tr key={i} variants={tableRowVariants}>
                        <td style={{ fontWeight: 600, color: '#ef4444' }}>{err.row}</td>
                        <td style={{ fontSize: '13px', color: 'var(--color-secondary-text)' }}>{err.error}</td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
