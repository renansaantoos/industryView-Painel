import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getScheduleAnalysis, type AnalysisType, type AnalysisResponse } from '../../../services/api/agents';
import { fadeUpChild } from '../../../lib/motion';
import ScheduleCharts from './ScheduleCharts';

interface AnalysisCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  analysisType: AnalysisType;
  projectId: number | null;
}

export default function AnalysisCard({ title, description, icon, color, analysisType, projectId }: AnalysisCardProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleAnalyze = async () => {
    if (!projectId) {
      setError('Selecione um projeto primeiro.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getScheduleAnalysis(projectId, analysisType);
      setResult(data);
      setExpanded(true);
    } catch {
      setError('Erro ao executar analise. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={fadeUpChild}
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        border: expanded ? `1px solid ${color}30` : '1px solid var(--color-alternate)',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: expanded ? '1px solid var(--color-alternate)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
            }}
          >
            {icon}
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary-text)', margin: 0 }}>{title}</h4>
            <p style={{ fontSize: 12, color: 'var(--color-secondary-text)', margin: 0 }}>{description}</p>
          </div>
        </div>

        <button
          onClick={expanded ? () => setExpanded(false) : handleAnalyze}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${color}40`,
            backgroundColor: loading ? 'var(--color-alternate)' : `${color}10`,
            color: loading ? 'var(--color-secondary-text)' : color,
            fontSize: 12,
            fontWeight: 500,
            cursor: loading ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-family)',
            transition: 'all var(--transition-fast)',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Analisando...
            </>
          ) : expanded ? 'Recolher' : result ? 'Expandir' : 'Analisar'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 20px', color: 'var(--color-error)', fontSize: 13 }}>{error}</div>
      )}

      {expanded && result && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ padding: '16px 20px', maxHeight: 700, overflowY: 'auto' }}
        >
          {result.charts && result.charts.length > 0 && (
            <ScheduleCharts charts={result.charts} />
          )}
          <div className="markdown-content" style={{ fontSize: 13, lineHeight: 1.7 }}>
            <ReactMarkdown>{result.insights}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}
