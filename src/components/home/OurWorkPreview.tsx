import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '../common/SectionHeading';
import { Program } from '../../types';
import { getProgramsList, DATASTORE_CHANGE_EVENT } from '../../utils/dataStore';
import { dbGetPrograms } from '../../lib/supabaseService';

export const OurWorkPreview: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const remotePrograms = await dbGetPrograms();
        setPrograms(remotePrograms.filter(program => program.status !== 'draft' && program.status !== 'archived'));
      } catch (err) {
        console.warn('Error loading homepage programs from Supabase; using cached programs:', err);
        setPrograms(getProgramsList().filter(program => program.status !== 'draft' && program.status !== 'archived'));
      }
    };
    loadPrograms();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadPrograms);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadPrograms);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-[#FAF9F6] border-b border-[#047857]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#047857]/10 pb-8">
          <SectionHeading
            eyebrow="Humanitarian Pillars"
            title="Where Your Contribution Creates Support"
            subtitle="Explore how pooled monthly member pledges are translated into immediate field relief."
          />
          <Link
            to="/our-work"
            className="inline-flex items-center gap-2 font-sans text-sm font-bold text-[#064E3B] hover:text-[#047857] group shrink-0"
          >
            <span>Explore All Programs</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Editorial Asymmetric Layout (2x2 grid with rich image + narrative pairings) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {programs.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col sm:flex-row gap-6 items-start border-b border-[#047857]/10 pb-8"
            >
              <div className="w-full sm:w-48 h-40 rounded-xl overflow-hidden shrink-0 bg-emerald-950/10">
                <img
                  src={item.featuredImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              <div className="space-y-2.5 flex-1">
                <span className="text-[11px] font-bold text-[#047857] uppercase tracking-wider block">
                  {item.category}
                </span>

                <h3 className="font-serif text-xl font-bold text-[#064E3B] group-hover:text-[#047857] transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="font-sans text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  {item.shortDescription || item.fullDescription}
                </p>

                <div className="pt-2">
                  <Link
                    to="/our-work"
                    className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-[#064E3B] hover:text-[#047857]"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
