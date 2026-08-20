'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/Card';

interface CollectionChartProps {
  data: { date: string; amount: number }[];
}

export function CollectionChart({ data }: CollectionChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
  }));

  return (
    <Card className="col-span-2">
      <p className="text-sm font-medium text-gray-500 mb-4">Last 7 Days Collection</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={formatted}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
          <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Collection']} />
          <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
