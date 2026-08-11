import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Receipt,
  TrendingDown,
  Wallet,
  Bell,
  ArrowRight,
  ShieldAlert,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import {
  getMembersList,
  getApplications,
  getContributions,
  getExpenses,
  getEvents,
  getNotifications,
  getAuditLogs,
  DATASTORE_CHANGE_EVENT
} from '../../utils/dataStore';

export const AdminDashboardPage: React.FC = () => {
  const [members, setMembers] = useState(getMembersList());
  const [applications, setApplications] = useState(getApplications());
  const [contributions, setContributions] = useState(getContributions());
  const [expenses, setExpenses] = useState(getExpenses());
  const [events, setEvents] = useState(getEvents());
  const [notifications, setNotifications] = useState(getNotifications());
  const [auditLogs, setAuditLogs] = useState(getAuditLogs());

  const loadAll = () => {
    setMembers(getMembersList());
    setApplications(getApplications());
    setContributions(getContributions());
    setExpenses(getExpenses());
    setEvents(getEvents());
    setNotifications(getNotifications());
    setAuditLogs(getAuditLogs());
  };

  useEffect(() => {
    loadAll();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadAll);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadAll);
  }, []);

  // Calculated Metrics
  const totalActiveMembers = members.filter(m => m.status === 'active').length;
  const pendingApps = applications.filter(a => a.status === 'pending').length;

  const paidContribsTotal = contributions
    .filter(c => c.status === 'Paid')
    .reduce((sum, c) => sum + c.amount, 0);

  const confirmedExpensesTotal = expenses
    .filter(e => e.status !== 'Archived')
    .reduce((sum, e) => sum + e.amount, 0);

  const availableBalance = paidContribsTotal - confirmedExpensesTotal;

  const upcomingEventsCount = events.filter(e => e.status === 'published').length;
  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#ECFDF5] border border-[#047857]/30 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#064E3B] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#047857]" />
            Foundation Operations Dashboard
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#047857] leading-relaxed">
            Live frontend operational state. All workflows (applications, treasury, events, points) are synchronized and prepared for future database connection.
          </p>
        </div>
        <Link
          to="/admin/members/applications"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#047857] hover:bg-[#064E3B] text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
        >
          <span>Review Applications ({pendingApps})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Link
          to="/admin/members"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Members
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-[#064E3B]">
            {totalActiveMembers}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium group-hover:text-[#047857] transition-colors">
            {members.length} registered total →
          </p>
        </Link>

        <Link
          to="/admin/members/applications"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-500/50 transition-all group"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Applications
            </span>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-amber-600">
            {pendingApps}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium group-hover:text-amber-700 transition-colors">
            Requires coordinator review →
          </p>
        </Link>

        <Link
          to="/admin/finance/contributions"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-500/50 transition-all group"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Confirmed Contributions
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-serif font-bold text-emerald-700">
            PKR {paidContribsTotal.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium group-hover:text-[#047857] transition-colors">
            From verified member pledges →
          </p>
        </Link>

        <Link
          to="/admin/finance/treasury"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-teal-500/50 transition-all group"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Available Net Balance
            </span>
            <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-3xl font-serif font-bold ${availableBalance >= 0 ? 'text-[#064E3B]' : 'text-rose-600'}`}>
            PKR {availableBalance.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-medium group-hover:text-teal-700 transition-colors">
            Contributions - Expenses →
          </p>
        </Link>
      </div>

      {/* Sub KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/finance/expenses"
          className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Expenses</p>
            <p className="text-lg font-bold font-serif text-rose-600">PKR {confirmedExpensesTotal.toLocaleString()}</p>
          </div>
          <TrendingDown className="w-5 h-5 text-rose-500" />
        </Link>

        <Link
          to="/admin/events"
          className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div>
            <p className="text-xs text-slate-500 font-semibold">Upcoming Published Events</p>
            <p className="text-lg font-bold font-serif text-[#064E3B]">{upcomingEventsCount} Drives</p>
          </div>
          <Calendar className="w-5 h-5 text-[#047857]" />
        </Link>

        <Link
          to="/admin/notifications"
          className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div>
            <p className="text-xs text-slate-500 font-semibold">Unread Notifications</p>
            <p className="text-lg font-bold font-serif text-blue-600">{unreadNotifsCount} Notifications</p>
          </div>
          <Bell className="w-5 h-5 text-blue-500" />
        </Link>
      </div>

      {/* 4 Sub-Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Applications Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-serif text-base font-bold text-[#064E3B]">
              Recent Membership Applications
            </h3>
            <Link
              to="/admin/members/applications"
              className="text-xs font-bold text-[#047857] hover:underline"
            >
              Manage Applications
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <UserPlus className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No applications received yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.slice(0, 4).map(app => (
                <div key={app.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{app.fullName}</p>
                    <p className="text-[11px] text-slate-500">{app.phone} • Pledge: {app.pledgedAmount}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    app.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {app.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Contributions Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-serif text-base font-bold text-[#064E3B]">
              Recent Member Contributions
            </h3>
            <Link
              to="/admin/finance/contributions"
              className="text-xs font-bold text-[#047857] hover:underline"
            >
              View Full Ledger
            </Link>
          </div>

          {contributions.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No contributions recorded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {contributions.slice(0, 4).map(ctr => (
                <div key={ctr.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{ctr.memberName}</p>
                    <p className="text-[11px] text-slate-500">{ctr.month} • {ctr.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif font-bold text-emerald-700">PKR {ctr.amount.toLocaleString()}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{ctr.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-serif text-base font-bold text-[#064E3B]">
              Upcoming Foundation Drives
            </h3>
            <Link
              to="/admin/events"
              className="text-xs font-bold text-[#047857] hover:underline"
            >
              All Events
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No events scheduled</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {events.slice(0, 3).map(evt => (
                <div key={evt.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{evt.title}</p>
                    <p className="text-[11px] text-slate-500">{evt.date} • {evt.location}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200">
                    {evt.registrations.length} Volunteers
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent System Audit Activity Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-serif text-base font-bold text-[#064E3B]">
              Recent Admin Audit Trail
            </h3>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-bold text-[#047857] hover:underline"
            >
              Full Audit Logs
            </Link>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No audit activity recorded</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {auditLogs.slice(0, 4).map(log => (
                <div key={log.id} className="py-2.5 text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{log.reason || log.module}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
