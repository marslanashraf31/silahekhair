import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FoundationLogo } from '../components/common/FoundationLogo';
import { isMemberAuthenticated, getLoggedInMember, logoutMember } from '../utils/memberAuth';
import { MemberRecord, DATASTORE_CHANGE_EVENT } from '../utils/dataStore';
import {
  LayoutDashboard,
  User,
  Receipt,
  Calendar,
  Award,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export const MemberLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [member, setMember] = useState<MemberRecord | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const checkAuthAndLoad = () => {
    if (!isMemberAuthenticated()) {
      navigate('/member/login', { replace: true });
      return;
    }
    const current = getLoggedInMember();
    if (!current) {
      logoutMember();
      navigate('/member/login', { replace: true });
      return;
    }
    setMember(current);
  };

  useEffect(() => {
    checkAuthAndLoad();
    window.addEventListener(DATASTORE_CHANGE_EVENT, checkAuthAndLoad);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, checkAuthAndLoad);
  }, [location.pathname]);

  const handleLogout = () => {
    logoutMember();
    navigate('/member/login', { replace: true });
  };

  if (!member) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Member Portal Top Navigation */}
      <header className="bg-[#064E3B] text-white border-b border-emerald-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Portal Tag */}
            <div className="flex items-center gap-3">
              <FoundationLogo variant="white" size="sm" />
              <span className={`hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                member.status === 'pending'
                  ? 'bg-amber-400 text-amber-950 font-extrabold'
                  : 'bg-emerald-800 text-emerald-200'
              }`}>
                {member.status === 'pending' ? 'PENDING APPROVAL' : 'Member Portal'}
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/member/dashboard"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    isActive ? 'bg-[#047857] text-white' : 'text-emerald-100/90 hover:bg-emerald-800/60 hover:text-white'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-300" />
                <span>Dashboard</span>
                {member.status === 'pending' && <span className="text-[10px] opacity-75">🔒</span>}
              </NavLink>

              <NavLink
                to="/member/contributions"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    isActive ? 'bg-[#047857] text-white' : 'text-emerald-100/90 hover:bg-emerald-800/60 hover:text-white'
                  }`
                }
              >
                <Receipt className="w-4 h-4 text-emerald-300" />
                <span>My Contributions</span>
                {member.status === 'pending' && <span className="text-[10px] opacity-75">🔒</span>}
              </NavLink>

              <NavLink
                to="/member/events"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    isActive ? 'bg-[#047857] text-white' : 'text-emerald-100/90 hover:bg-emerald-800/60 hover:text-white'
                  }`
                }
              >
                <Calendar className="w-4 h-4 text-emerald-300" />
                <span>Events & Drives</span>
                {member.status === 'pending' && <span className="text-[10px] opacity-75">🔒</span>}
              </NavLink>

              <NavLink
                to="/member/points"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    isActive ? 'bg-[#047857] text-white' : 'text-emerald-100/90 hover:bg-emerald-800/60 hover:text-white'
                  }`
                }
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Points & Activity</span>
                {member.status === 'pending' && <span className="text-[10px] opacity-75">🔒</span>}
              </NavLink>

              <NavLink
                to="/member/profile"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    isActive ? 'bg-[#047857] text-white' : 'text-emerald-100/90 hover:bg-emerald-800/60 hover:text-white'
                  }`
                }
              >
                <User className="w-4 h-4 text-emerald-300" />
                <span>My Profile</span>
              </NavLink>
            </nav>

            {/* Member Profile Badge & Logout */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-white leading-tight">{member.name}</p>
                <p className="text-[10px] text-emerald-300 font-mono">
                  {member.id} • <span className="text-amber-300 font-bold">{member.points || 0} pts</span>
                </p>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800/70 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-emerald-200 hover:text-white rounded-xl focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#064E3B] border-t border-emerald-800 px-4 pt-2 pb-4 space-y-1">
            <div className="p-3 bg-emerald-950/50 rounded-xl mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{member.name}</p>
                <p className="text-[10px] text-emerald-300 font-mono">{member.id}</p>
              </div>
              <span className="text-xs font-bold text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-700/40">
                {member.points || 0} Points
              </span>
            </div>

            <NavLink
              to="/member/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-100 hover:bg-emerald-800"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-300" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/member/contributions"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-100 hover:bg-emerald-800"
            >
              <Receipt className="w-4 h-4 text-emerald-300" />
              <span>My Contributions</span>
            </NavLink>

            <NavLink
              to="/member/events"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-100 hover:bg-emerald-800"
            >
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span>Events & Drives</span>
            </NavLink>

            <NavLink
              to="/member/points"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-100 hover:bg-emerald-800"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Points & Activity</span>
            </NavLink>

            <NavLink
              to="/member/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-100 hover:bg-emerald-800"
            >
              <User className="w-4 h-4 text-emerald-300" />
              <span>Profile Settings</span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-900/40 transition-colors pt-3"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Member Portal Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Silah-e-Khair Foundation • Member Portal Dashboard</p>
      </footer>
    </div>
  );
};
