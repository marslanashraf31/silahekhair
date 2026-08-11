import React, { useState, useEffect } from 'react';
import { getLoggedInMember } from '../../utils/memberAuth';
import {
  PointTransaction,
  getPointTransactions,
  getMemberLevels,
  DATASTORE_CHANGE_EVENT,
  MemberLevelConfig
} from '../../utils/dataStore';
import { Award, TrendingUp, History, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const MemberPointsPage: React.FC = () => {
  const member = getLoggedInMember();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [levels, setLevels] = useState<MemberLevelConfig[]>([]);

  const loadData = () => {
    if (member) {
      const allTx = getPointTransactions();
      setTransactions(allTx.filter(t => t.memberId === member.id));
      setLevels(getMemberLevels());
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadData);
  }, []);

  if (!member) return null;

  const currentPoints = member.points || 0;

  // Determine current level config and next level config
  const currentLvlConfig = levels.find(l => currentPoints >= l.minPoints && currentPoints <= l.maxPoints) || levels[0];
  const nextLvlConfig = levels.find(l => l.minPoints > currentPoints);

  const progressPercent = nextLvlConfig
    ? Math.min(100, Math.round(((currentPoints - (currentLvlConfig?.minPoints || 0)) / ((nextLvlConfig.minPoints - (currentLvlConfig?.minPoints || 0)) || 1)) * 100))
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B] flex items-center gap-2.5">
          <Award className="w-7 h-7 text-amber-500" />
          Community Engagement & Points Ledger
        </h1>
        <p className="font-sans text-xs text-slate-500 mt-1">
          Points recognize consistent monthly pledge payments, volunteer drive participation, and active community engagement.
        </p>
      </div>

      {/* Anti-Abuse Disclaimer Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Community Recognition Disclaimer:</p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Points are a recognition system designed to celebrate active community participation and encourage volunteer responsibility. Points are NOT a requirement for membership and do NOT bestow sensitive administrative or financial control.
          </p>
        </div>
      </div>

      {/* Current Progression Status Card */}
      <div className="bg-gradient-to-r from-[#064E3B] to-[#047857] text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
              CURRENT LEVEL: {member.level || 'ACTIVE MEMBER'}
            </span>
            <h2 className="font-serif text-3xl font-bold pt-1 text-white">
              {currentPoints.toLocaleString()} <span className="text-emerald-200 text-lg font-sans">Points</span>
            </h2>
          </div>

          {nextLvlConfig && (
            <div className="text-left sm:text-right text-xs text-emerald-100">
              <p className="font-bold">Next Milestone: {nextLvlConfig.levelName}</p>
              <p className="text-[11px] text-emerald-200">
                Need {(nextLvlConfig.minPoints - currentPoints).toLocaleString()} more points
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {nextLvlConfig && (
          <div className="space-y-1.5">
            <div className="w-full bg-emerald-950/60 rounded-full h-3 overflow-hidden border border-emerald-700/50 p-0.5">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-emerald-200 font-mono">
              <span>{currentLvlConfig?.minPoints.toLocaleString() || 0} pts</span>
              <span>{progressPercent}% Complete</span>
              <span>{nextLvlConfig.minPoints.toLocaleString()} pts</span>
            </div>
          </div>
        )}

        {/* Level Benefits */}
        {currentLvlConfig && (
          <div className="pt-4 border-t border-emerald-700/60 space-y-2">
            <p className="text-xs font-bold text-amber-300">Level Privileges & Recognition:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-100">
              {currentLvlConfig.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Points Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <h3 className="font-serif text-sm font-bold text-[#064E3B] flex items-center gap-2">
            <History className="w-4 h-4 text-[#047857]" />
            Personal Points Transaction History
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {transactions.length} Transactions
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-serif text-base font-bold text-slate-800">No transactions recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Points are awarded upon admin verification of monthly contribution payments and volunteer drive attendance.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Activity Description</th>
                  <th className="py-3 px-4">Points Delta</th>
                  <th className="py-3 px-4">Running Total</th>
                  <th className="py-3 px-4">Reason / Verified By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500">{tx.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{tx.activity}</td>
                    <td className="py-3.5 px-4 font-serif font-bold">
                      <span className={tx.points >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        {tx.points >= 0 ? `+${tx.points}` : tx.points} pts
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-serif font-bold text-slate-800">
                      {tx.runningTotal.toLocaleString()} pts
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {tx.reason || `Verified by ${tx.adminName || 'Admin'}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
