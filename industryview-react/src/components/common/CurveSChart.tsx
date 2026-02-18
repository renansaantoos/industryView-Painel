import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import type { CurveSData } from '../../types';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

interface CurveSChartProps {
  data: CurveSData[];
  loading?: boolean;
  title?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: 'var(--color-secondary-bg, #1e293b)',
        border: '1px solid var(--color-alternate)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--color-text)' }}>
        {label ? new Date(label).toLocaleDateString('pt-BR') : label}
      </p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name}: <strong>{entry.value.toFixed(1)}%</strong>
        </p>
      ))}
    </div>
  );
}

function formatXAxisTick(value: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function CurveSChart({ data, loading = false, title }: CurveSChartProps) {
  if (loading) return <LoadingSpinner />;

  if (!data || data.length === 0) {
    return (
      <EmptyState message="Sem dados de Curva S disponíveis para esta baseline. Selecione uma baseline com dados históricos." />
    );
  }

  // Find today's position for a reference line
  const today = new Date().toISOString().split('T')[0];
  const dataHasToday = data.some((d) => d.date >= today);

  // Determine the variance at the last actual data point
  const lastActualPoint = [...data]
    .reverse()
    .find((d) => d.actual_percent > 0);
  const variance = lastActualPoint
    ? (lastActualPoint.actual_percent - lastActualPoint.planned_percent).toFixed(1)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {title && (
        <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>{title}</h4>
      )}

      {/* Variance badge */}
      {variance !== null && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <VarianceBadge value={Number(variance)} />
          {lastActualPoint && (
            <span style={{ fontSize: '12px', color: 'var(--color-secondary-text)', alignSelf: 'center' }}>
              Última atualização: {new Date(lastActualPoint.date).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-alternate)"
            opacity={0.5}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxisTick}
            tick={{ fontSize: 11, fill: 'var(--color-secondary-text)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-alternate)' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 11, fill: 'var(--color-secondary-text)' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '13px', paddingTop: '8px' }}
            formatter={(value) =>
              value === 'planned_percent' ? 'Planejado (%)' : 'Realizado (%)'
            }
          />

          {/* Area fill for planned */}
          <Area
            type="monotone"
            dataKey="planned_percent"
            fill="rgba(59,130,246,0.08)"
            stroke="transparent"
            isAnimationActive={false}
          />

          {/* Area fill for actual */}
          <Area
            type="monotone"
            dataKey="actual_percent"
            fill="rgba(34,197,94,0.08)"
            stroke="transparent"
            isAnimationActive={false}
          />

          {/* Planned line — blue dashed */}
          <Line
            type="monotone"
            dataKey="planned_percent"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            activeDot={{ r: 5, fill: '#3b82f6' }}
            name="planned_percent"
          />

          {/* Actual line — green solid */}
          <Line
            type="monotone"
            dataKey="actual_percent"
            stroke="#22c55e"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#22c55e' }}
            name="actual_percent"
          />

          {/* Today reference line */}
          {dataHasToday && (
            <ReferenceLine
              x={today}
              stroke="#eab308"
              strokeDasharray="4 2"
              label={{
                value: 'Hoje',
                position: 'insideTopRight',
                fontSize: 11,
                fill: '#eab308',
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function VarianceBadge({ value }: { value: number }) {
  const isPositive = value > 0;
  const isNeutral = Math.abs(value) < 0.5;

  const color = isNeutral ? 'var(--color-secondary-text)' : isPositive ? '#22c55e' : '#ef4444';
  const bgColor = isNeutral
    ? 'rgba(148,163,184,0.1)'
    : isPositive
    ? 'rgba(34,197,94,0.1)'
    : 'rgba(239,68,68,0.1)';

  const label = isNeutral ? 'No prazo' : isPositive ? `+${value}% adiantado` : `${value}% atrasado`;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        color,
        background: bgColor,
        border: `1px solid ${color}`,
      }}
    >
      {label}
    </span>
  );
}
