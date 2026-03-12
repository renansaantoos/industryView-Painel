import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import type { ChartConfig } from '../../../services/api/agents';

interface ScheduleChartsProps {
  charts: ChartConfig[];
}

const FALLBACK_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6', '#EC4899', '#06B6D4'];

function ChartWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-alternate)',
        padding: 16,
        marginBottom: 16,
      }}
    >
      <h5
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--color-primary-text)',
          margin: '0 0 12px 0',
          fontFamily: 'var(--font-family)',
        }}
      >
        {title}
      </h5>
      <div style={{ width: '100%', height: 240 }}>
        {children}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-alternate)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        fontFamily: 'var(--font-family)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--color-primary-text)' }}>{label}</div>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ color: entry.color, marginBottom: 2 }}>
          {entry.name}: <strong>{typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

function BarChartRenderer({ chart }: { chart: ChartConfig }) {
  return (
    <ChartWrapper title={chart.title}>
      <ResponsiveContainer>
        <BarChart data={chart.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-alternate)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--color-secondary-text)' }}
            axisLine={{ stroke: 'var(--color-alternate)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-secondary-text)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
            {chart.data.map((entry, index) => (
              <Cell key={index} fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

function StackedBarChartRenderer({ chart }: { chart: ChartConfig }) {
  const bars = chart.bars || [];
  return (
    <ChartWrapper title={chart.title}>
      <ResponsiveContainer>
        <BarChart data={chart.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-alternate)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--color-secondary-text)' }}
            axisLine={{ stroke: 'var(--color-alternate)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-secondary-text)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-family)' }}
          />
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.name}
              fill={bar.color}
              stackId="stack"
              radius={[2, 2, 0, 0]}
              maxBarSize={50}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

function PieChartRenderer({ chart }: { chart: ChartConfig }) {
  const total = chart.data.reduce((sum, d) => sum + d.value, 0);
  return (
    <ChartWrapper title={chart.title}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chart.data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            label={({ name, value }) => `${name} (${value})`}
            labelLine={{ stroke: 'var(--color-secondary-text)', strokeWidth: 1 }}
          >
            {chart.data.map((entry, index) => (
              <Cell key={index} fill={entry.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-alternate)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 12,
                    fontFamily: 'var(--font-family)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  <div style={{ fontWeight: 600, color: d.color }}>{d.name}</div>
                  <div>{d.value} ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)</div>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

function LineChartRenderer({ chart }: { chart: ChartConfig }) {
  const lines = chart.bars || [{ key: chart.yKey || 'value', color: '#3B82F6', name: 'Valor' }];
  return (
    <ChartWrapper title={chart.title}>
      <ResponsiveContainer>
        <LineChart data={chart.data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-alternate)" />
          <XAxis
            dataKey={chart.xKey || 'name'}
            tick={{ fontSize: 11, fill: 'var(--color-secondary-text)' }}
            axisLine={{ stroke: 'var(--color-alternate)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-secondary-text)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font-family)' }} />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 3, fill: line.color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

export default function ScheduleCharts({ charts }: ScheduleChartsProps) {
  if (!charts || charts.length === 0) return null;

  // Filter out charts with empty data
  const validCharts = charts.filter(c => c.data && c.data.length > 0);
  if (validCharts.length === 0) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: validCharts.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16,
        marginBottom: 16,
      }}
    >
      {validCharts.map((chart, index) => {
        switch (chart.type) {
          case 'bar':
            return <BarChartRenderer key={index} chart={chart} />;
          case 'stacked_bar':
            return <StackedBarChartRenderer key={index} chart={chart} />;
          case 'pie':
            return <PieChartRenderer key={index} chart={chart} />;
          case 'line':
            return <LineChartRenderer key={index} chart={chart} />;
          default:
            return <BarChartRenderer key={index} chart={chart} />;
        }
      })}
    </div>
  );
}
