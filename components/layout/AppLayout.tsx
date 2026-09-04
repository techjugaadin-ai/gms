'use client';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ReactNode, useState } from 'react';

interface LayoutProps {
  children: ReactNode;
  role: 'GYM_OWNER' | 'SUPER_ADMIN';
  gymName?: string;
  userName?: string;
  title: string;
}

export function AppLayout({ children, role, gymName, userName, title }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar role={role} gymName={gymName} userName={userName} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav title={title} onMenuToggle={() => setMobileOpen((o) => !o)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
