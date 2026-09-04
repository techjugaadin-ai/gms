import { Card, CardTitle, CardValue } from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
}

export function MetricCard({ title, value, icon, className, valueClassName }: MetricCardProps) {
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <CardTitle>{title}</CardTitle>
        {icon && <div className="text-gray-400 dark:text-slate-500 flex-shrink-0">{icon}</div>}
      </div>
      <CardValue className={valueClassName}>{value}</CardValue>
    </Card>
  );
}
