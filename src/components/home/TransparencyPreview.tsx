import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, FileText } from 'lucide-react';

export const TransparencyPreview: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-[#FAF9F6] border-b border-[#047857]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold text-[#047857] uppercase tracking-widest block">
              Financial Accountability
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#064E3B] tracking-tight leading-tight">
              Every Contribution Matters. <br />
              Every Distribution Is Recorded.
            </h2>

            <p className="font-sans text-base sm:text-lg text-[#1E293B]/80 leading-relaxed">
              Silah-e-Khair Foundation is committed to clear, member-accessible record keeping. We document all monthly pooled pledges alongside verified receipts for every ration package, meal distribution, and emergency medical disbursement.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-[#ECFDF5] text-[#047857] mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans text-base font-bold text-[#064E3B]">Zero Commercial Overhead</h4>
                  <p className="font-sans text-xs text-[#64748B] leading-relaxed">Administered voluntarily by members without intermediary commissions or corporate salaries.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-[#ECFDF5] text-[#047857] mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans text-base font-bold text-[#064E3B]">Documented Disbursements</h4>
                  <p className="font-sans text-xs text-[#64748B] leading-relaxed">Purchase vouchers and pharmacy receipts are logged and open for member audit.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/transparency"
                className="inline-flex items-center gap-2 bg-[#064E3B] text-white px-6 py-3.5 rounded-lg font-sans text-sm font-bold hover:bg-[#047857] transition-colors shadow-2xs"
              >
                <span>View Financial Records</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Clean Neutral Reporting State - NO Developer / Debug Messages */}
          <div className="lg:col-span-5 bg-white p-8 rounded-2xl border border-[#047857]/15 shadow-2xs space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#064E3B]">
              Public Financial Reporting
            </h3>
            
            <p className="font-sans text-xs text-[#64748B] leading-relaxed">
              Financial records will be published here as the foundation's public reporting system is connected. All records are reviewed periodically during member audit sessions.
            </p>

            <div className="pt-4 border-t border-[#047857]/10 text-xs text-[#064E3B] font-sans flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#047857]" />
              <span>Audited Member Financial Policy</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
