"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Line = dynamic(() => import('react-chartjs-2').then((m) => m.Line), { ssr: false });

type Agg = 'none' | 'minute' | 'hour' | 'day';

type ApiRow = { timestamp: string; value?: number | null; avg?: number; };

export default function MonitoringChart({ component = '276' }: { component?: string }) {
  const [agg, setAgg] = useState<Agg>('none');
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [data, setData] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const end = new Date();
    const start = new Date(Date.now() - (range === '7d' ? 7 : range === '30d' ? 30 : 90) * 24 * 3600 * 1000);
    setLoading(true);
    fetch(`/api/monitoring?component=${component}&start=${start.toISOString()}&end=${end.toISOString()}&agg=${agg}`)
      .then((r) => r.json())
    .then((json) => setData(json.data ?? []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [agg, range, component]);

  if (loading) return <div>Loading…</div>;

  const labels = data.map((d) => d.timestamp);
  const values = data.map((d) => d.avg ?? d.value ?? null);

  const chartData = {
    labels,
    datasets: [
      {
        label: `Component ${component}`,
        data: values,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25,118,210,0.1)',
        tension: 0.2,
      },
    ],
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
  <select value={range} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRange(e.target.value as '7d' | '30d' | '90d')}>
          <option value="7d">7 days</option>
          <option value="30d">30 days</option>
          <option value="90d">90 days</option>
        </select>
        <select value={agg} onChange={(e) => setAgg(e.target.value as Agg)}>
          <option value="none">Raw</option>
          <option value="minute">Minute</option>
          <option value="hour">Hour</option>
          <option value="day">Day</option>
        </select>
      </div>

      <div style={{ width: '100%', maxWidth: 1000 }}>
        {/* Line is dynamically imported with ssr: false; render directly */}
        <Line data={chartData} />
      </div>
    </div>
  );
}
