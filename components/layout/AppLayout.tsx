'use client';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  role: 'GYM_OWNER' | 'SUPER_ADMIN';
  gymName?: string;
  userName?: string;
  title: string;
}

export function AppLayout({ children, role, gymName, userName, title }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} gymName={gymName} userName={userName} />
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-0">
        <TopNav title={title} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
