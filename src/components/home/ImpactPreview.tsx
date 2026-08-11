import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getActiveMemberCount, DATASTORE_CHANGE_EVENT } from '../../utils/dataStore';

export const ImpactPreview: React.FC = () => {
  const [memberCount, setMemberCount] = useState(getActiveMemberCount());

  useEffect(() => {
    const handleUpdate = () => setMemberCount(getActiveMemberCount());
    window.addEventListener(DATASTORE_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, handleUpdate);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#047857]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold text-[#047857] uppercase tracking-widest block">
              Verified Field Impact
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#064E3B] tracking-tight">
              Action Over Words
            </h2>
          </div>
          <Link
            to="/impact"
            className="inline-flex items-center gap-2 font-sans text-sm font-bold text-[#064E3B] hover:text-[#047857] group shrink-0"
          >
            <span>Explore Full Impact</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Large Editorial Numbers Grid - No Heavy Boxed Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-4 border-t border-[#047857]/10">
          
          <div className="space-y-2">
            <div className="font-serif text-5xl md:text-6xl font-bold text-[#064E3B] tracking-tight">
              {memberCount}
            </div>
            <h3 className="font-sans text-base font-bold text-[#1E293B]">
              Contributing Members
            </h3>
            <p className="font-sans text-xs text-[#64748B] leading-relaxed">
              Dedicated friends and community supporters pooling monthly pledges.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-serif text-5xl md:text-6xl font-bold text-[#064E3B] tracking-tight">
              Monthly
            </div>
            <h3 className="font-sans text-base font-bold text-[#1E293B]">
              Ration Packages
            </h3>
            <p className="font-sans text-xs text-[#64748B] leading-relaxed">
              Full grocery packages hand-delivered directly to pre-verified households.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-serif text-5xl md:text-6xl font-bold text-[#064E3B] tracking-tight">
              Daily
            </div>
            <h3 className="font-sans text-base font-bold text-[#1E293B]">
              Meals Served
            </h3>
            <p className="font-sans text-xs text-[#64748B] leading-relaxed">
              Freshly cooked warm meals for daily wage laborers and travelers in need.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-serif text-5xl md:text-6xl font-bold text-[#064E3B] tracking-tight">
              Discreet
            </div>
            <h3 className="font-sans text-base font-bold text-[#1E293B]">
              Emergency Relief Aid
            </h3>
            <p className="font-sans text-xs text-[#64748B] leading-relaxed">
              Warm blankets, winter supplies, and rapid crisis response packages.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
