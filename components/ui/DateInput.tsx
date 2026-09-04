'use client';

import { useEffect, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface DateInputProps {
  label?: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  calendar?: boolean;
}

function formatDisplayDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}

function parseDisplayDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) return null;
  return `${year}-${month}-${day}`;
}

export function DateInput({ label, id, value, onChange, required, className, calendar = false }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState(formatDisplayDate(value));
  const calendarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayValue(formatDisplayDate(value));
  }, [value]);

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder="DD/MM/YYYY"
          value={displayValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDisplayValue(nextValue);
            const isoValue = parseDisplayDate(nextValue);
            if (isoValue) onChange(isoValue);
          }}
          onBlur={() => {
            const isoValue = parseDisplayDate(displayValue);
            if (isoValue) {
              setDisplayValue(formatDisplayDate(isoValue));
              onChange(isoValue);
            } else {
              setDisplayValue(formatDisplayDate(value));
            }
          }}
          required={required}
          className={cn(
            'block w-full h-9 rounded-lg border border-gray-300 dark:border-slate-600 px-3 text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder-gray-400 dark:placeholder-slate-500',
            'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors',
            calendar && 'pr-10',
            className,
          )}
        />
        {calendar && (
          <>
            <input
              ref={calendarRef}
              type="date"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none absolute right-9 top-0 h-9 w-1 opacity-0"
            />
            <button
              type="button"
              onClick={() => calendarRef.current?.showPicker?.()}
              className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center text-gray-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              aria-label={`Open ${label ?? 'date'} calendar`}
            >
              <CalendarDays className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
