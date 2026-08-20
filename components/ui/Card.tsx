import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface CardProps {
  className?: string;
  children: ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-100 p-5', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return <div className={cn('flex items-center justify-between mb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }: CardProps) {
  return <h3 className={cn('text-sm font-medium text-gray-500', className)}>{children}</h3>;
}

export function CardValue({ className, children }: CardProps) {
  return <p className={cn('text-2xl font-bold text-gray-900 mt-1', className)}>{children}</p>;
}
