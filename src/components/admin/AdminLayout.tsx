import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { Menu, Bell, ExternalLink, ChevronRight, UserCheck } from 'lucide-react';
import { getNotifications, DATASTORE_CHANGE_EVENT } from '../../utils/dataStore';
import { dbGetNotifications } from '../../lib/supabaseService';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const location = useLocation();

  const updateUnread = async () => {
    try {
      const local = getNotifications();
      const localUnread = local.filter(n => !n.isRead).length;
      setUnreadCount(localUnread);

      const remote = await dbGetNotifications();
      if (remote.length > 0) {
        const remoteUnread = remote.filter(n => !n.isRead).length;
        setUnreadCount(remoteUnread);
      }
    } catch {
      setUnreadCount(getNotifications().filter(n => !n.isRead).length);
    }
  };

  useEffect(() => {
    updateUnread();
    window.addEventListener(DATASTORE_CHANGE_EVENT, updateUnread);
    return () => {
      window.removeEventListener(DATASTORE_CHANGE_EVENT, updateUnread);
    };
  }, []);

  // Helper to construct breadcrumbs and title from route
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Admin', path: '/admin/dashboard' }];
    
    if (paths.length > 1) {
      if (paths[1] === 'dashboard') {
        crumbs.push({ label: 'Dashboard', path: '/admin/dashboard' });
      } else if (paths[1] === 'donations') {
        crumbs.push({ label: 'Public Donations', path: '/admin/donations' });
      } else if (paths[1] === 'members') {
        crumbs.push({ label: 'Members', path: '/admin/members' });
        if (paths[2] === 'applications') {
          crumbs.push({ label: 'Applications', path: '/admin/members/applications' });
        } else if (paths[2] === 'payments') {
          crumbs.push({ label: 'Payments', path: '/admin/members/payments' });
        }
      } else if (paths[1] === 'finance') {
        crumbs.push({ label: 'Finance', path: '/admin/finance/treasury' });
        if (paths[2] === 'contributions') {
          crumbs.push({ label: 'Contributions', path: '/admin/finance/contributions' });
        } else if (paths[2] === 'expenses') {
          crumbs.push({ label: 'Expenses', path: '/admin/finance/expenses' });
        } else if (paths[2] === 'treasury') {
          crumbs.push({ label: 'Treasury Overview', path: '/admin/finance/treasury' });
        }
      } else {
        const capitalized = paths[1].charAt(0).toUpperCase() + paths[1].slice(1).replace('-', ' ');
        crumbs.push({ label: capitalized, path: location.pathname });
      }
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const currentPageTitle = breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1E293B] flex flex-col md:flex-row antialiased">
      
      {/* Desktop Fixed Left Sidebar */}
      <div className="hidden md:block shrink-0 sticky top-0 h-screen">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
            <AdminSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Admin Top Header Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-[#064E3B] hover:bg-slate-100 transition-colors"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div>
              <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-sans">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.path + idx}>
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
                    {idx === breadcrumbs.length - 1 ? (
                      <span className="font-bold text-[#064E3B]">{crumb.label}</span>
                    ) : (
                      <Link to={crumb.path} className="hover:text-[#047857] transition-colors">
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </nav>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-[#064E3B] leading-tight">
                {currentPageTitle}
              </h1>
            </div>
          </div>

          {/* Top Actions & Profile Area */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Link back to public site */}
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#047857] hover:bg-emerald-100 text-xs font-semibold transition-colors"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Notifications Button */}
            <Link
              to="/admin/notifications"
              className="relative p-2 rounded-xl text-slate-500 hover:text-[#064E3B] hover:bg-slate-100 transition-colors"
              aria-label="Admin Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-sans text-[10px] font-extrabold leading-none shadow-xs animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Admin Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#064E3B] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <UserCheck className="w-4 h-4 text-emerald-200" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">Coordinator</p>
                <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Admin Role</p>
              </div>
            </div>

          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>

        {/* Admin Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-8 text-xs font-sans text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Silah-e-Khair Foundation — Secure Administration Portal</p>
          <p className="text-emerald-700 font-semibold">Phase 4: Supabase Live Database Connected</p>
        </footer>

      </div>

    </div>
  );
};
