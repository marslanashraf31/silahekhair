import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLoggedInMember } from '../../utils/memberAuth';
import {
  MemberRecord,
  getContributions,
  getEvents,
  DATASTORE_CHANGE_EVENT,
  ContributionRecord,
  EventItem
} from '../../utils/dataStore';
import { SITE_CONFIG } from '../../config/siteConfig';
import {
  Award,
  Receipt,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Lock,
  LayoutDashboard,
  MessageSquare
} from 'lucide-react';

export const MemberDashboardPage: React.FC = () => {
  const [member, setMember] = useState<MemberRecord | null>(getLoggedInMember());
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  const loadData = () => {
    const current = getLoggedInMember();
    setMember(current);
    if (current) {
      const allContribs = getContributions();
      setContributions(allContribs.filter(c => c.memberId === current.id));

      const allEvts = getEvents();
      setEvents(allEvts.filter(e => e.registrations.some(r => r.memberId === current.id)));
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadData);
  }, []);

  if (!member) return null;

  // Render Pending Member Portal State if status is 'pending'
  if (member.status === 'pending') {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Pending Welcome Banner */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden border border-amber-600/30">
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-amber-400 text-amber-950 font-extrabold text-xs tracking-wider uppercase shadow-xs">
                PENDING APPROVAL
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-950/60 text-amber-200 text-xs font-bold border border-amber-500/30 font-mono">
                Member ID: {member.id}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Assalam-o-Alaikum, {member.name}!
            </h1>

            <p className="font-sans text-xs sm:text-sm text-amber-100/90 max-w-2xl leading-relaxed">
              Your official membership application has been submitted and is currently being reviewed by our Admin Coordinators.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-amber-200">
              <span>Application ID / Username: <strong className="text-white font-bold">{member.id}</strong></span>
              <span>•</span>
              <span>Pledge: <strong className="text-amber-300 font-bold">{member.monthlyContribution || 'PKR 300 / month'}</strong></span>
            </div>
          </div>
        </div>

        {/* Informational Banner */}
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4 text-amber-900">
          <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-amber-950">Application Under Review</h3>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              Your account will become fully active after Admin approval. Once approved, you will gain access to your contribution ledger, event registrations, and community points.
            </p>
          </div>
        </div>

        {/* Locked Modules Grid */}
        <div className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500" />
            <span>Member Portal Modules (Pending Approval)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Dashboard Locked */}
            <div className="bg-slate-100/80 border border-slate-200 p-5 rounded-2xl space-y-3 opacity-80">
              <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-700">Dashboard</h4>
                <p className="text-xs text-slate-500 mt-1">Overview & stats (Locked 🔒)</p>
              </div>
            </div>

            {/* Contributions Locked */}
            <div className="bg-slate-100/80 border border-slate-200 p-5 rounded-2xl space-y-3 opacity-80">
              <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-700">My Contributions</h4>
                <p className="text-xs text-slate-500 mt-1">Payment receipts & ledger (Locked 🔒)</p>
              </div>
            </div>

            {/* Events Locked */}
            <div className="bg-slate-100/80 border border-slate-200 p-5 rounded-2xl space-y-3 opacity-80">
              <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-700">Events & Drives</h4>
                <p className="text-xs text-slate-500 mt-1">Volunteer registration (Locked 🔒)</p>
              </div>
            </div>

            {/* Points Locked */}
            <div className="bg-slate-100/80 border border-slate-200 p-5 rounded-2xl space-y-3 opacity-80">
              <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-700">Points & Badges</h4>
                <p className="text-xs text-slate-500 mt-1">Activity badges (Locked 🔒)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Coordinator Support */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 text-center">
          <p className="text-xs text-slate-600">
            Have questions about your application status or need urgent assistance?
          </p>
          <a
            href={`https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(`Assalam-o-Alaikum, I am checking my application status for Member ID ${member.id}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-xs"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>Contact Admin Coordinator on WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  const getPledgeAmount = (): number => {
    if (typeof member.monthlyPledge === 'number' && member.monthlyPledge > 0) {
      return member.monthlyPledge;
    }
    if (member.monthlyContribution) {
      const parsed = parseInt(String(member.monthlyContribution).replace(/[^\d]/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 300;
  };

  const pledgeAmount = getPledgeAmount();
  const currentMonthStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const hasPaidCurrentMonth = contributions.some(c => c.month === currentMonthStr && c.status === 'Paid');

  const totalLifetimePaid = contributions
    .filter(c => c.status === 'Paid')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#064E3B] to-[#047857] text-white p-6 sm:p-8 rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold border border-emerald-700">
              {member.status === 'active' ? 'ACTIVE MEMBER' : 'INACTIVE'}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {member.level || 'ACTIVE MEMBER'}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Assalam-o-Alaikum, {member.name}!
          </h1>

          <p className="font-sans text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Welcome to your Silah-e-Khair member dashboard. Thank you for your monthly pledge commitment of <span className="font-bold text-amber-300">PKR {pledgeAmount.toLocaleString()}/month</span> supporting local ration and relief programs.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-emerald-200">
            <span>Member ID: <strong className="text-white">{member.id}</strong></span>
            <span>•</span>
            <span>Join Date: <strong className="text-white">{member.joinDate}</strong></span>
            <span>•</span>
            <span>Current Points: <strong className="text-amber-300 font-bold font-serif text-sm">{(member.points || 0).toLocaleString()} PTS</strong></span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Pledge</span>
            <Receipt className="w-4 h-4 text-[#047857]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#064E3B]">
            PKR {pledgeAmount.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            Min requirement: 300 PKR/month
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">{currentMonthStr} Status</span>
            {hasPaidCurrentMonth ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <p className={`text-xl font-serif font-bold ${hasPaidCurrentMonth ? 'text-emerald-700' : 'text-amber-600'}`}>
            {hasPaidCurrentMonth ? 'Paid & Verified' : 'Payment Due'}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            {hasPaidCurrentMonth ? 'Receipt confirmed' : 'Submit proof to maintain standing'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Contributions</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-serif font-bold text-emerald-700">
            PKR {totalLifetimePaid.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            Lifetime verified pledge payments
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Points Balance</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-serif font-bold text-amber-600">
            {(member.points || 0).toLocaleString()} PTS
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            Level: {member.level || 'ACTIVE MEMBER'}
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/member/contributions"
          className="p-5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <h3 className="font-serif text-sm font-bold text-[#064E3B]">
              Submit Monthly Payment Proof
            </h3>
            <p className="text-xs text-emerald-800/80">
              Upload bank transfer or mobile wallet transaction ref
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-[#047857] group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/member/events"
          className="p-5 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <h3 className="font-serif text-sm font-bold text-amber-900">
              Register for Volunteer Drives
            </h3>
            <p className="text-xs text-amber-800/80">
              Join ration distribution drives and earn engagement points
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-700 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/member/points"
          className="p-5 bg-teal-50/70 hover:bg-teal-100/80 border border-teal-200/80 rounded-2xl transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="space-y-1">
            <h3 className="font-serif text-sm font-bold text-teal-900">
              View Points & Activity History
            </h3>
            <p className="text-xs text-teal-800/80">
              See point ledger logs and progression levels
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-teal-700 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Sub Panels: My Contributions & Registered Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Contributions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-serif text-base font-bold text-[#064E3B]">
              My Contribution History
            </h3>
            <Link to="/member/contributions" className="text-xs font-bold text-[#047857] hover:underline">
              View All
            </Link>
          </div>

          {contributions.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No contribution records logged</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Submit your monthly contribution receipt using the button above to populate your history.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {contributions.slice(0, 4).map(c => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{c.month}</p>
                    <p className="text-[11px] text-slate-500">{c.paymentMethod} • Ref: {c.receiptReference || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif font-bold text-emerald-700">PKR {c.amount.toLocaleString()}</p>
                    <span className={`text-[10px] font-bold ${
                      c.status === 'Paid' ? 'text-emerald-700' : 'text-amber-600'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registered Drives */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-serif text-base font-bold text-[#064E3B]">
              My Volunteer Drive Registrations
            </h3>
            <Link to="/member/events" className="text-xs font-bold text-[#047857] hover:underline">
              Browse Drives
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Not registered for any upcoming drives</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Express interest in upcoming distribution drives to volunteer with fellow members.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {events.map(evt => {
                const regInfo = evt.registrations.find(r => r.memberId === member.id);
                return (
                  <div key={evt.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{evt.title}</p>
                      <p className="text-[11px] text-slate-500">{evt.date} • {evt.location}</p>
                    </div>
                    <div>
                      {regInfo?.attended ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Attended (+{evt.pointsForAttendance} pts)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                          <Clock className="w-3 h-3 text-amber-600" /> Registered
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
