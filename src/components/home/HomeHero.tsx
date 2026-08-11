import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, ShieldCheck } from 'lucide-react';
import { PrimaryButton } from '../common/PrimaryButton';
import { getActiveMemberCount, DATASTORE_CHANGE_EVENT } from '../../utils/dataStore';

interface HomeHeroProps {
  onOpenMembership: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onOpenMembership }) => {
  const [memberCount, setMemberCount] = useState(getActiveMemberCount());

  useEffect(() => {
    const handleUpdate = () => setMemberCount(getActiveMemberCount());
    window.addEventListener(DATASTORE_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, handleUpdate);
  }, []);

  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-20 lg:pt-40 lg:pb-28 bg-[#FAF9F6] border-b border-[#047857]/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          
          {/* Left Text & Action Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Real Member Figure Sub-heading */}
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#047857] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse" />
              <span>{memberCount} Contributing Members & Growing</span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#064E3B] tracking-tight leading-[1.08]">
              Connecting Hearts <br className="hidden sm:inline" />
              <span className="text-[#047857]">Through Giving</span>
            </h1>

            {/* Supporting Text */}
            <p className="font-sans text-base sm:text-lg md:text-xl text-[#1E293B]/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Together, we turn small monthly contributions into meaningful support for families and communities in need.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <PrimaryButton
                size="lg"
                icon={<Heart className="w-4.5 h-4.5 fill-current text-white" />}
                onClick={onOpenMembership}
                className="w-full sm:w-auto shadow-md"
              >
                Become a Member
              </PrimaryButton>

              <Link
                to="/our-work"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg border border-[#047857]/20 bg-white hover:bg-[#ECFDF5] text-[#064E3B] font-sans font-bold text-sm transition-colors shadow-2xs"
              >
                <span>Explore Our Work</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Authentic Direct Delivery Note */}
            <div className="pt-4 border-t border-[#047857]/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#64748B] font-sans">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#047857]" />
                <span>Direct Monthly Ration & Meal Support</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#047857]" />
                <span>Verified Household Delivery</span>
              </div>
            </div>

          </div>

          {/* Right Hero Image Column - Pure Editorial Photo */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-lg bg-white border border-[#047857]/15">
                <img
                  src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200&auto=format&fit=crop"
                  alt="Silah-e-Khair Foundation Community Support"
                  className="w-full h-[380px] sm:h-[460px] object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#064E3B]/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                  <p className="font-serif text-lg font-bold">
                    Community-Driven Humanitarian Action
                  </p>
                  <p className="font-sans text-xs text-emerald-100/90">
                    Friends pooling monthly contributions to care for neighbors with dignity.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
