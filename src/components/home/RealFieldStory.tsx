import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';

export const RealFieldStory: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#047857]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Large Real Foundation Activity Photo */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-[#047857]/15 bg-[#FAF9F6]">
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1200&auto=format&fit=crop"
                alt="Silah-e-Khair Foundation Field Relief Activity"
                className="w-full h-[360px] sm:h-[460px] object-cover"
                loading="lazy"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] font-bold text-[#064E3B] uppercase tracking-wider shadow-2xs">
                Field Activity Log • Ration Support
              </div>
            </div>
          </div>

          {/* Story Narrative Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#047857] uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-[#047857] fill-current" />
              <span>Humanitarian Impact</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#064E3B] leading-tight">
              A contribution becomes a ration package. <br />
              A ration package becomes hope for a family.
            </h2>

            <p className="font-sans text-base text-[#1E293B]/80 leading-relaxed">
              When a family faces unexpected financial hardship or job loss, basic grocery shopping can quickly become a source of daily distress. Through the steady monthly pledges of our members, Silah-e-Khair Foundation delivers comprehensive ration packs containing essential wheat flour, rice, pulses, and oil directly to verified doors.
            </p>

            <p className="font-sans text-sm text-[#64748B] leading-relaxed">
              Every package is handed over with complete respect, privacy, and discretion—preserving human dignity while ensuring children receive wholesome meals every day.
            </p>

            <div className="pt-2">
              <Link
                to="/our-work"
                className="inline-flex items-center gap-2 font-sans text-sm font-bold text-[#064E3B] hover:text-[#047857] group"
              >
                <span>Read Full Field Work Overview</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
