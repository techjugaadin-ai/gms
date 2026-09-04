import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return <div className={cn('flex items-center justify-between gap-3 mb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }: CardProps) {
  return <p className={cn('text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest', className)}>{children}</p>;
}

export function CardValue({ className, children }: CardProps) {
  return <p className={cn('text-3xl font-bold text-gray-900 dark:text-white tracking-tight', className)}>{children}</p>;
}
