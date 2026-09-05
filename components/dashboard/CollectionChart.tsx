'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/Card';
import { getISTDate } from '@/lib/utils/date';

interface CollectionChartProps {
  data: { date: string; amount: number }[];
}

export function CollectionChart({ data }: CollectionChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: getISTDate(new Date(d.date)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
  }));

  return (
    <Card className="p-5 w-full">
      <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-4">Last 7 Days Collection</p>
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatted} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v / 1000}k`} width={40} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Collection']}
              contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: 13 }}
            />
            <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
