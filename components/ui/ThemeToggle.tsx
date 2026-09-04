'use client';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
  };

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={toggle}
      className="relative flex-shrink-0 w-14 h-7 rounded-full bg-gray-200 dark:bg-slate-600 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Knob — positioned with top/left so it stays inside the pill */}
      <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center transition-all duration-200 ${isDark ? 'left-8' : 'left-1'}`}>
        {isDark
          ? <Sun className="h-3 w-3 text-amber-500" />
          : <Moon className="h-3 w-3 text-slate-500" />
        }
      </span>
    </button>
  );
}
