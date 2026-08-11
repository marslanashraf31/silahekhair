import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileCheck, Lock, Shield, Receipt, RefreshCw, Calendar, Layers, ChevronDown, ChevronUp, Tag } from 'lucide-react';
import { PageHero } from '../components/common/PageHero';
import { ExpenseRecord, SubExpenseItem } from '../types';
import { DATASTORE_CHANGE_EVENT, getExpenses, saveExpenses } from '../utils/dataStore';
import { dbGetExpenses } from '../lib/supabaseService';

export const TransparencyPage: React.FC = () => {
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'events' | 'ledger'>('events');
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({});

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const remote = await dbGetExpenses();
      const valid = remote.filter(e => e.status !== 'Archived');
      setExpenseRecords(valid);
      saveExpenses(valid);
    } catch (err) {
      setExpenseRecords(getExpenses().filter(e => e.status !== 'Archived'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Financial Transparency | Silah-e-Khair Foundation';
    window.scrollTo(0, 0);

    loadExpenses();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadExpenses);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadExpenses);
  }, []);

  const totalExpenseAmount = expenseRecords.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Group expenses by Event Name
  const groupedByEvent: Record<string, ExpenseRecord[]> = expenseRecords.reduce((acc, rec) => {
    const key = rec.eventName || 'General & Operational Expenses';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(rec);
    return acc;
  }, {} as Record<string, ExpenseRecord[]>);

  const toggleEventExpand = (eventName: string) => {
    setExpandedEvents(prev => ({ ...prev, [eventName]: !prev[eventName] }));
  };

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Accountability & Trust"
        title="Financial Transparency & Expense Logs"
        subtitle="Silah-e-Khair Foundation is committed to clear, responsible record keeping. Every rupee collected and spent is documented and reviewed during member audit sessions."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Member Audit Policy Banner */}
          <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#047857]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#ECFDF5] text-[#047857] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                  Member-Audited Financial Policy
                </h3>
                <p className="font-sans text-xs md:text-sm text-[#64748B] leading-relaxed">
                  We operate with zero commercial overhead. All member contributions go directly toward food security, medical assistance, and verified community relief.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-[#047857] bg-[#ECFDF5] px-3.5 py-2 rounded-lg border border-[#047857]/20">
              <Lock className="w-4 h-4" />
              <span>Member Records Protected</span>
            </div>
          </div>

          {/* Controls & View Mode Switcher */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#047857]/10 pb-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#064E3B]">
                  Public Expense Logs
                </h2>
                <p className="text-xs text-[#64748B] font-sans mt-0.5">
                  Itemized ledger of verified foundation purchases, event expenses, and aid disbursements.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* View Mode Switcher Tabs */}
                <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setViewMode('events')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      viewMode === 'events'
                        ? 'bg-[#064E3B] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Grouped by Events
                  </button>
                  <button
                    onClick={() => setViewMode('ledger')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      viewMode === 'ledger'
                        ? 'bg-[#064E3B] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Expenses Ledger
                  </button>
                </div>

                <button
                  onClick={loadExpenses}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#064E3B] text-xs font-bold border border-[#047857]/20">
                  <Receipt className="w-3.5 h-3.5 text-[#047857]" />
                  <span>Total: PKR {totalExpenseAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* View Mode 1: Grouped by Events */}
            {viewMode === 'events' && (
              <div className="space-y-6">
                {Object.keys(groupedByEvent).length > 0 ? (
                  Object.entries(groupedByEvent).map(([eventName, records]) => {
                    const eventTotal = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
                    const isExpanded = expandedEvents[eventName] !== false; // Default expanded

                    return (
                      <div
                        key={eventName}
                        className="bg-white rounded-2xl border border-[#047857]/20 shadow-2xs overflow-hidden transition-all"
                      >
                        {/* Event Group Header */}
                        <div
                          onClick={() => toggleEventExpand(eventName)}
                          className="bg-[#FAF9F6] p-5 border-b border-[#047857]/10 flex items-center justify-between cursor-pointer hover:bg-emerald-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-[#064E3B] text-white shrink-0">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                                  {eventName}
                                </h3>
                                <span className="text-[10px] font-bold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#047857]/20">
                                  {records.length} {records.length === 1 ? 'Record' : 'Records'}
                                </span>
                              </div>
                              <p className="text-xs text-[#64748B] font-sans mt-0.5">
                                Verified Event Expenses & Itemized Purchases
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Event Cost</span>
                              <span className="font-serif font-bold text-lg text-[#064E3B]">
                                PKR {eventTotal.toLocaleString()}
                              </span>
                            </div>
                            <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>

                        {/* Event Group Expenses Content */}
                        {isExpanded && (
                          <div className="p-5 space-y-4 divide-y divide-slate-100">
                            {records.map((rec) => (
                              <div key={rec.id} className="pt-4 first:pt-0 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs text-[#064E3B]">
                                        {rec.description}
                                      </span>
                                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                                        {rec.category}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-400 block mt-0.5">
                                      Disbursement Date: {rec.date}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="font-serif font-bold text-sm text-[#064E3B]">
                                      PKR {rec.amount.toLocaleString()}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded">
                                      <FileCheck className="w-3 h-3" />
                                      Audited
                                    </span>
                                  </div>
                                </div>

                                {/* Itemized Sub-Expenses Table (Rickshaw, Deg, Packing, etc.) */}
                                {rec.items && rec.items.length > 0 && (
                                  <div className="bg-[#FAF9F6] p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#064E3B] flex items-center gap-1.5">
                                      <Layers className="w-3.5 h-3.5 text-[#047857]" />
                                      <span>Itemized Expense Breakdown</span>
                                    </span>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {rec.items.map((sub, idx) => (
                                        <div
                                          key={idx}
                                          className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs shadow-2xs"
                                        >
                                          <span className="font-medium text-slate-700 truncate pr-2">
                                            {sub.name}
                                          </span>
                                          <span className="font-bold text-[#064E3B] shrink-0 font-mono">
                                            PKR {sub.amount.toLocaleString()}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-2xl border border-[#047857]/15 p-12 text-center">
                    <Shield className="w-8 h-8 text-[#047857] mx-auto opacity-80" />
                    <h4 className="font-serif text-base font-bold text-[#064E3B] mt-2">
                      No Expenses Recorded Yet
                    </h4>
                  </div>
                )}
              </div>
            )}

            {/* View Mode 2: All Expenses Ledger */}
            {viewMode === 'ledger' && (
              <div className="bg-white rounded-2xl border border-[#047857]/15 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-[#FAF9F6] border-b border-[#047857]/10 text-[#064E3B] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Event / Context</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Description & Items</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FAF9F6] text-[#1E293B]">
                      {expenseRecords.length > 0 ? (
                        expenseRecords.map((rec) => (
                          <tr key={rec.id} className="hover:bg-[#FAF9F6]">
                            <td className="py-3 px-4 font-semibold whitespace-nowrap">{rec.date}</td>
                            <td className="py-3 px-4 font-medium text-[#064E3B]">
                              {rec.eventName || 'General'}
                            </td>
                            <td className="py-3 px-4">{rec.category}</td>
                            <td className="py-3 px-4 text-[#64748B]">
                              <div>{rec.description}</div>
                              {rec.items && rec.items.length > 0 && (
                                <div className="text-[10px] text-emerald-800 font-mono pt-1">
                                  Items: {rec.items.map(i => `${i.name} (PKR ${i.amount})`).join(', ')}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 font-bold text-[#064E3B] whitespace-nowrap">
                              PKR {rec.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded">
                                <FileCheck className="w-3 h-3" />
                                Audited
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 px-4 text-center">
                            <div className="max-w-md mx-auto space-y-3">
                              <Shield className="w-8 h-8 text-[#047857] mx-auto opacity-80" />
                              <h4 className="font-serif text-base font-bold text-[#064E3B]">
                                Official Ledger Reporting
                              </h4>
                              <p className="text-xs text-[#64748B] leading-relaxed">
                                Financial records will be published here as the foundation's public reporting system is connected.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
};
