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
    <Card className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <CardValue className={valueClassName}>{value}</CardValue>
    </Card>
  );
}
