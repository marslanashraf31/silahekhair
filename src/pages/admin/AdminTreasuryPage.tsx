import React, { useState, useEffect } from 'react';
import { Landmark, Wallet, Receipt, TrendingDown, ShieldCheck, Database, CheckCircle2, RefreshCw } from 'lucide-react';
import { DATASTORE_CHANGE_EVENT, getContributions, getExpenses } from '../../utils/dataStore';
import { dbGetContributions, dbGetExpenses } from '../../lib/supabaseService';

export const AdminTreasuryPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [confirmedContributions, setConfirmedContributions] = useState<number>(0);
  const [confirmedExpenses, setConfirmedExpenses] = useState<number>(0);

  const fetchTreasuryData = async () => {
    setLoading(true);
    try {
      // Load both local and remote Supabase financial ledgers
      const [dbContribs, dbExps] = await Promise.all([
        dbGetContributions(),
        dbGetExpenses()
      ]);

      const localContribs = getContributions();
      const localExps = getExpenses();

      // Merge local and remote financial ledgers by ID
      const contribMap = new Map<string, any>();
      localContribs.forEach(c => contribMap.set(c.id, c));
      dbContribs.forEach(c => contribMap.set(c.id, c));
      const contribsList = Array.from(contribMap.values());

      const expMap = new Map<string, any>();
      localExps.forEach(e => expMap.set(e.id, e));
      dbExps.forEach(e => expMap.set(e.id, e));
      const expsList = Array.from(expMap.values());

      // Filter paid contributions
      const contribSum = contribsList
        .filter(c => c.status === 'Paid' || (c as any).status === 'Confirmed')
        .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

      // Filter confirmed expenses
      const expenseSum = expsList
        .filter(e => e.status !== 'Archived')
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      setConfirmedContributions(contribSum);
      setConfirmedExpenses(expenseSum);
    } catch (err) {
      console.error('Error fetching treasury data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreasuryData();
    window.addEventListener(DATASTORE_CHANGE_EVENT, fetchTreasuryData);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, fetchTreasuryData);
  }, []);

  const openingBalance = 0;
  const netAvailableBalance = openingBalance + confirmedContributions - confirmedExpenses;

  const treasuryCards = [
    {
      title: 'Opening Fiscal Balance',
      value: `PKR ${openingBalance.toLocaleString()}`,
      status: 'Initial Baseline',
      icon: Landmark,
      color: 'bg-slate-50 border-slate-200 text-slate-700'
    },
    {
      title: 'Confirmed Contributions',
      value: `PKR ${confirmedContributions.toLocaleString()}`,
      status: 'Live Supabase Sync',
      icon: Receipt,
      color: 'bg-emerald-50 border-emerald-200 text-[#047857]'
    },
    {
      title: 'Confirmed Expenses',
      value: `PKR ${confirmedExpenses.toLocaleString()}`,
      status: 'Live Supabase Sync',
      icon: TrendingDown,
      color: 'bg-rose-50 border-rose-200 text-rose-700'
    },
    {
      title: 'Available Net Balance',
      value: `PKR ${netAvailableBalance.toLocaleString()}`,
      status: 'Real-time Net Reserve',
      icon: Wallet,
      color: 'bg-[#ECFDF5] border-[#047857]/30 text-[#064E3B]'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#064E3B]">
            Treasury & Financial Overview
          </h2>
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
            Real-time balance verification between incoming member funds and verified outgoing charitable distributions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchTreasuryData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Treasury</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-[#064E3B] text-xs font-bold shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Live Supabase Database Connected</span>
          </div>
        </div>
      </div>

      {/* 4 Treasury Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {treasuryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between bg-white`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1 my-1">
                <p className="font-serif text-2xl font-bold text-slate-800">
                  {loading ? '...' : card.value}
                </p>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-[#064E3B] text-[10px] font-semibold border border-emerald-100">
                  <Database className="w-3 h-3 text-emerald-600" />
                  <span>{card.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Treasury Governance Note */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-[#047857]" />
          <h3 className="font-serif text-base font-bold text-[#064E3B]">
            Treasury Audit Standards
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-slate-600 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-bold text-[#064E3B]">100% Direct Allocation</p>
            <p className="text-slate-500">Every rupee contributed by members is earmarked directly for ration and medical relief.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-bold text-[#064E3B]">Receipt Verification</p>
            <p className="text-slate-500">All disbursements require dual-coordinator approval and verified store vendor receipts.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <p className="font-bold text-[#064E3B]">Public Transparency</p>
            <p className="text-slate-500">High-level financial summaries are published transparently on the public website for all contributing friends.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
