import React from 'react';
import { ShieldCheck, Lock, History, Search } from 'lucide-react';

export const AdminAuditLogsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-[#064E3B]">
            System Audit Logs
          </h2>
          <p className="font-sans text-xs sm:text-sm text-slate-500 mt-1">
            Immutable chronological record of administrator actions, data changes, and authentication history.
          </p>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Administrator</th>
                <th className="py-3.5 px-4 sm:px-6">Action Performed</th>
                <th className="py-3.5 px-4 sm:px-6">Target Record</th>
                <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                <th className="py-3.5 px-4 sm:px-6">Result Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state */}
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="max-w-xs mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#047857] flex items-center justify-center mx-auto border border-emerald-100">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <p className="font-serif font-bold text-slate-800 text-base">
                      Audit Trail Inactive
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      Awaiting database connection. Production operations will be recorded here with encrypted timestamps.
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
