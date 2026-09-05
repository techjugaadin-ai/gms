'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard, Users, CreditCard, BarChart2,
  Bell, Settings, ClipboardList, Building2, X, Info,
} from 'lucide-react';
import { useState, useEffect } from 'react';

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
  { label: 'About', href: '/about', icon: Info },
];

const superAdminNav: NavItem[] = [
  { label: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { label: 'Gyms', href: '/super-admin/gyms', icon: Building2 },
  { label: 'Notifications', href: '/super-admin/notifications', icon: Bell },
  { label: 'Settings', href: '/super-admin/settings', icon: Settings },
  { label: 'About', href: '/about', icon: Info },
];

interface SidebarProps {
  role: 'GYM_OWNER' | 'SUPER_ADMIN';
  gymName?: string;
  userName?: string;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ role, gymName, userName, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const nav = role === 'SUPER_ADMIN' ? superAdminNav : gymOwnerNav;

  // Close sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    router.push('/login');
  };

  const isActive = (href: string, hasChildren: boolean) => {
    // For routes with children, highlight parent when on sub-pages
    if (hasChildren) {
      return pathname === href || pathname.startsWith(href + '/');
    }
    // For regular routes, use exact match only
    // Special case: don't let /super-admin match /super-admin/gyms
    if (href === '/super-admin' && pathname.startsWith('/super-admin/')) {
      return false;
    }
    return pathname === href;
  };

  const NavLinks = () => (
    <nav className="flex-1 overflow-y-auto py-3 px-3">
      <div className="space-y-0.5">
        {nav.map((item) => (
          <div key={item.href}>
            {item.children ? (
              <>
                <button
                  onClick={() => setExpandedMenu(expandedMenu === item.href ? null : item.href)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive(item.href, true)
                      ? 'bg-blue-600 text-white'
                      : 'text-white hover:bg-slate-700 hover:text-white'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <svg className={cn('h-3.5 w-3.5 transition-transform', expandedMenu === item.href && 'rotate-90')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
                {expandedMenu === item.href && (
                  <div className="ml-4 mt-0.5 pl-4 border-l border-slate-700 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'block px-3 py-1.5 rounded-md text-sm transition-colors',
                          pathname === child.href
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-white hover:text-white hover:bg-slate-700'
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive(item.href, false)
                    ? 'bg-blue-600 text-white'
                    : 'text-white hover:bg-slate-700 hover:text-white'
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-40 flex flex-col w-64 bg-slate-900 dark:bg-slate-950 transition-transform duration-200 ease-out flex-shrink-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-700/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-600 flex-shrink-0">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h12" /></svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white leading-none">GMS</p>
              <p className="text-xs text-slate-400 truncate max-w-[140px] mt-0.5">{gymName ?? 'Gym Management'}</p>
            </div>
          </div>
          <button
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <NavLinks />

        {/* User / Sign out */}
        <div className="border-t border-slate-700/60 px-3 py-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-700 flex-shrink-0">
              <span className="text-xs font-semibold text-slate-200">{userName?.[0]?.toUpperCase() ?? 'U'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{userName}</p>
              <p className="text-xs text-slate-500">{role === 'SUPER_ADMIN' ? 'Super Admin' : 'Gym Owner'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
