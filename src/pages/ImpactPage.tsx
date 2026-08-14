import React, { useState, useEffect } from 'react';
import { ShieldCheck, Heart, Info } from 'lucide-react';
import { PageHero } from '../components/common/PageHero';
import { IMPACT_METRICS, SITE_CONFIG } from '../config/siteConfig';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { getActiveMemberCount, DATASTORE_CHANGE_EVENT } from '../utils/dataStore';

interface ImpactPageProps {
  onOpenMembership: () => void;
}

export const ImpactPage: React.FC<ImpactPageProps> = ({ onOpenMembership }) => {
  const [memberCount, setMemberCount] = useState(getActiveMemberCount());

  useEffect(() => {
    document.title = 'Our Impact | Silah-e-Khair Foundation';
    window.scrollTo(0, 0);

    const handleUpdate = () => setMemberCount(getActiveMemberCount());
    window.addEventListener(DATASTORE_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, handleUpdate);
  }, []);

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Community Record"
        title="Our Verified Impact"
        subtitle="A honest overview of our member community growth and field support activities."
      />

      {/* Metrics Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex items-center gap-3 bg-[#ECFDF5] p-4 rounded-xl border border-[#047857]/20 text-xs md:text-sm text-[#064E3B] font-sans">
            <Info className="w-5 h-5 text-[#047857] shrink-0" />
            <span>
              <strong>Integrity Mandate:</strong> We only publish verified numbers from official foundation registers. Unverified estimates or fabricated beneficiary metrics are strictly excluded.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {IMPACT_METRICS.map((metric) => (
              <div
                key={metric.id}
                className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#047857]/15 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#047857]">
                    {metric.isVerifiedLive ? 'Verified Figure' : 'Field Category'}
                  </span>
                  {metric.isVerifiedLive && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-[#ECFDF5] text-[#047857] px-2 py-0.5 rounded-full border border-[#047857]/20 font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      Live Register
                    </span>
                  )}
                </div>

                <div className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B]">
                  {metric.id === 'members' ? memberCount : metric.value}
                </div>

                <h3 className="font-sans text-sm font-bold text-[#1E293B]">
                  {metric.label}
                </h3>

                <p className="font-sans text-xs text-[#64748B] leading-relaxed">
                  {metric.description}
                </p>

                <div className="pt-3 border-t border-[#047857]/10 text-[10px] text-[#64748B] font-sans">
                  Source: {metric.source}
                </div>
              </div>
            ))}
          </div>

          {/* Foundation Impact Narrative */}
          <div className="bg-[#FAF9F6] p-8 rounded-3xl border border-[#047857]/15 space-y-6">
            <span className="text-xs font-bold text-[#047857] uppercase tracking-wider block">
              Field Activity & Verification
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B]">
              How Support Reaches Those In Need
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs md:text-sm text-[#1E293B]/80 leading-relaxed font-sans">
              <div className="space-y-2 bg-white p-5 rounded-xl border border-[#047857]/10">
                <h4 className="font-bold text-[#064E3B] text-base font-serif">1. Household Verification</h4>
                <p>Every ration applicant is personally visited by two foundation members to ensure genuine financial distress without publicity.</p>
              </div>

              <div className="space-y-2 bg-white p-5 rounded-xl border border-[#047857]/10">
                <h4 className="font-bold text-[#064E3B] text-base font-serif">2. Prescription Verification</h4>
                <p>Emergency medical support requests require valid medical prescriptions and pharmacy estimates before funds are disbursed directly to vendors.</p>
              </div>

              <div className="space-y-2 bg-white p-5 rounded-xl border border-[#047857]/10">
                <h4 className="font-bold text-[#064E3B] text-base font-serif">3. Member Audit Reports</h4>
                <p>Detailed logs of all monthly distributions are shared directly with contributing members during regular review sessions.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#ECFDF5] border-t border-b border-[#047857]/20 text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B]">
            Become Part of Our Growing Impact
          </h2>
          <p className="font-sans text-sm text-[#047857] font-medium">
            Join {memberCount} members turning small monthly contributions into meaningful community support.
          </p>
          <PrimaryButton
            size="lg"
            variant="primary"
            icon={<Heart className="w-4 h-4 fill-current" />}
            onClick={onOpenMembership}
            className="shadow-md"
          >
            Become a Member
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
};
