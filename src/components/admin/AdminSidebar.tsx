import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FoundationLogo } from '../common/FoundationLogo';
import { logoutAdmin } from '../../utils/adminAuth';
import { getContributions } from '../../utils/dataStore';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Receipt,
  Wallet,
  TrendingDown,
  Landmark,
  FolderKanban,
  Image as ImageIcon,
  Newspaper,
  Calendar,
  Award,
  Bell,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  X,
  Heart
} from 'lucide-react';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onCloseMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Submenu open states
  const isMembersActive = location.pathname.startsWith('/admin/members');
  const isFinanceActive = location.pathname.startsWith('/admin/finance');

  const [membersOpen, setMembersOpen] = useState(isMembersActive || true);
  const [financeOpen, setFinanceOpen] = useState(isFinanceActive || true);

  const pendingDonationsCount = getContributions().filter(c => c.status === 'Pending' || c.status === 'Pending Review').length;

  const handleLogout = () => {
    void logoutAdmin();
    if (onCloseMobile) onCloseMobile();
    navigate('/admin/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-[#064E3B] text-white flex flex-col h-full border-r border-[#047857]/40 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-emerald-800/60 flex items-center justify-between">
        <FoundationLogo variant="white" size="sm" />
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/50 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 custom-scrollbar text-sm">
        
        {/* Dashboard */}
        <NavLink
          to="/admin/dashboard"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
              isActive
                ? 'bg-[#047857] text-white font-bold shadow-xs'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Dashboard</span>
        </NavLink>

        {/* Members Section */}
        <div>
          <button
            onClick={() => setMembersOpen(!membersOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              isMembersActive
                ? 'text-white font-semibold bg-emerald-900/30'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Members</span>
            </div>
            {membersOpen ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>

          {membersOpen && (
            <div className="mt-1 ml-4 pl-3 border-l border-emerald-700/50 space-y-1">
              <NavLink
                to="/admin/members"
                end
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#047857] text-white font-bold'
                      : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/30'
                  }`
                }
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>All Members</span>
              </NavLink>

              <NavLink
                to="/admin/members/applications"
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#047857] text-white font-bold'
                      : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/30'
                  }`
                }
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span>Applications</span>
              </NavLink>

              <NavLink
                to="/admin/members/payments"
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#047857] text-white font-bold'
                      : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/30'
                  }`
                }
              >
                <Receipt className="w-3.5 h-3.5 shrink-0" />
                <span>Member Payments</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Finance Section */}
        <div>
          <button
            onClick={() => setFinanceOpen(!financeOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
              isFinanceActive
                ? 'text-white font-semibold bg-emerald-900/30'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Finance</span>
            </div>
            {financeOpen ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />}
          </button>

          {financeOpen && (
            <div className="mt-1 ml-4 pl-3 border-l border-emerald-700/50 space-y-1">
              <NavLink
                to="/admin/donations"
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#047857] text-white font-bold'
                      : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/30'
                  }`
                }
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-300 shrink-0 fill-rose-300/30" />
                  <span>Public Donations</span>
                </div>
                {pendingDonationsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-extrabold">
                    {pendingDonationsCount}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/admin/finance/contributions"
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#047857] text-white font-bold'
                      : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/30'
                  }`
                }
              >
                <Receipt className="w-3.5 h-3.5 shrink-0" />
                <span>Contributions</span>
              </NavLink>

              <NavLink
                to="/admin/finance/expenses"
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#047857] text-white font-bold'
                      : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/30'
                  }`
                }
              >
                <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                <span>Expenses</span>
              </NavLink>

              <NavLink
                to="/admin/finance/treasury"
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#047857] text-white font-bold'
                      : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/30'
                  }`
                }
              >
                <Landmark className="w-3.5 h-3.5 shrink-0" />
                <span>Treasury Overview</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Content Management Items */}
        <NavLink
          to="/admin/programs"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
              isActive
                ? 'bg-[#047857] text-white font-bold'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`
          }
        >
          <FolderKanban className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Programs</span>
        </NavLink>

        <NavLink
          to="/admin/gallery"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
              isActive
                ? 'bg-[#047857] text-white font-bold'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`
          }
        >
          <ImageIcon className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Gallery</span>
        </NavLink>

        <NavLink
          to="/admin/updates"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
              isActive
                ? 'bg-[#047857] text-white font-bold'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`
          }
        >
          <Newspaper className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Updates</span>
        </NavLink>

        <NavLink
          to="/admin/events"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
              isActive
                ? 'bg-[#047857] text-white font-bold'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`
          }
        >
          <Calendar className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Events</span>
        </NavLink>

        <NavLink
          to="/admin/engagement"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
              isActive
                ? 'bg-[#047857] text-white font-bold'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`
          }
        >
          <Award className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Engagement / Points</span>
        </NavLink>

        <div className="pt-2 border-t border-emerald-800/50 my-2"></div>

        {/* System Administration Items */}
        <NavLink
          to="/admin/notifications"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
              isActive
                ? 'bg-[#047857] text-white font-bold'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`
          }
        >
          <Bell className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Notifications</span>
        </NavLink>

        <NavLink
          to="/admin/audit-logs"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
              isActive
                ? 'bg-[#047857] text-white font-bold'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`
          }
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Audit Logs</span>
        </NavLink>

        <NavLink
          to="/admin/settings"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-colors ${
              isActive
                ? 'bg-[#047857] text-white font-bold'
                : 'text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white'
            }`
          }
        >
          <Settings className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Settings</span>
        </NavLink>

      </nav>

      {/* Admin User Footer / Logout */}
      <div className="p-3.5 border-t border-emerald-800/60 bg-emerald-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Admin Portal</p>
              <p className="text-[10px] text-emerald-300/80 truncate">admin@silah-e-khair.org</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800/50 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
