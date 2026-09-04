import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange';

const variants: Record<BadgeVariant, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-800',
  yellow: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800',
  red: 'bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-800',
  blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800',
  gray: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600',
  orange: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:ring-orange-800',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap', variants[variant], className)}>
      {children}
    </span>
  );
}
