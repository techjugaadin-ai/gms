'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard, Users, CreditCard, BarChart2,
  Bell, Settings, ClipboardList, Building2, X, Menu,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const gymOwnerNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Members', href: '/members', icon: Users },
  { label: 'Payments', href: '/payments', icon: CreditCard },
  { label: 'Reports', href: '/reports', icon: BarChart2 },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  {
    label: 'Admin', href: '/admin', icon: Settings,
    children: [
      { label: 'Settings', href: '/admin/settings' },
      { label: 'Membership Plans', href: '/admin/membership-plans' },
    ],
  },
];

const superAdminNav: NavItem[] = [
  { label: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { label: 'Gyms', href: '/super-admin/gyms', icon: Building2 },
];

interface SidebarProps {
  role: 'GYM_OWNER' | 'SUPER_ADMIN';
  gymName?: string;
  userName?: string;
}

export function Sidebar({ role, gymName, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = role === 'SUPER_ADMIN' ? superAdminNav : gymOwnerNav;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const NavLinks = () => (
    <nav className="flex-1 overflow-y-auto py-4 px-3">
      <div className="space-y-1">
        {nav.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive(item.href) && !item.children
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
            {item.children && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'block px-3 py-1.5 rounded-lg text-sm transition-colors',
                      pathname === child.href
                        ? 'text-blue-600 font-medium bg-blue-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white border-r border-gray-200 transition-transform duration-200',
          'lg:translate-x-0 lg:static lg:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <p className="text-base font-bold text-blue-600 leading-tight">GMS</p>
            <p className="text-xs text-gray-500 truncate max-w-[160px]">{gymName ?? 'Gym Management'}</p>
          </div>
          <button className="lg:hidden p-1" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <NavLinks />

        {/* User / Logout */}
        <div className="border-t border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-800 truncate">{userName}</p>
          <p className="text-xs text-gray-400 mb-3">{role === 'SUPER_ADMIN' ? 'Super Admin' : 'Gym Owner'}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
