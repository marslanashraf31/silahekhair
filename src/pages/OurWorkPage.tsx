import React, { useState, useEffect } from 'react';
import { PackageCheck, Utensils, HeartPulse, ShieldAlert, GraduationCap, MessageSquare, Heart } from 'lucide-react';
import { PageHero } from '../components/common/PageHero';
import { SITE_CONFIG } from '../config/siteConfig';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { getProgramsList, DATASTORE_CHANGE_EVENT } from '../utils/dataStore';
import { dbGetPrograms } from '../lib/supabaseService';
import { Program } from '../types';

interface OurWorkPageProps {
  onOpenMembership: () => void;
}

export const OurWorkPage: React.FC<OurWorkPageProps> = ({ onOpenMembership }) => {
  const [programs, setPrograms] = useState<Program[]>([]);

  const loadPrograms = async () => {
    try {
      const remotePrograms = await dbGetPrograms();
      const publishedPrograms = remotePrograms.filter(program => program.status !== 'draft' && program.status !== 'archived');
      setPrograms(publishedPrograms);
    } catch (err) {
      console.warn('Error loading programs from Supabase; using cached programs:', err);
      setPrograms(getProgramsList().filter(program => program.status !== 'draft' && program.status !== 'archived'));
    }
  };

  useEffect(() => {
    document.title = 'Our Work | Silah-e-Khair Foundation';
    window.scrollTo(0, 0);

    loadPrograms();
    window.addEventListener(DATASTORE_CHANGE_EVENT, loadPrograms);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, loadPrograms);
  }, []);

  const getProgramIcon = (name: string) => {
    switch (name) {
      case 'PackageCheck': return <PackageCheck className="w-8 h-8 text-[#047857]" />;
      case 'Utensils': return <Utensils className="w-8 h-8 text-[#047857]" />;
      case 'HeartPulse': return <HeartPulse className="w-8 h-8 text-[#047857]" />;
      case 'ShieldAlert': return <ShieldAlert className="w-8 h-8 text-[#047857]" />;
      case 'GraduationCap': return <GraduationCap className="w-8 h-8 text-[#047857]" />;
      default: return <PackageCheck className="w-8 h-8 text-[#047857]" />;
    }
  };

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Community Support Programs"
        title="Where Your Monthly Support Goes"
        subtitle="Explore the four core humanitarian pillars powered by the pooled monthly contributions of Silah-e-Khair members."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {programs.map((prog, index) => (
            <div
              key={prog.id}
              id={prog.id}
              className={`p-8 md:p-10 rounded-3xl border border-[#047857]/20 transition-all ${
                index % 2 === 0 ? 'bg-[#FAF9F6]' : 'bg-white shadow-xs'
              }`}
            >
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#047857]/15">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#047857]/20 shrink-0">
                      {getProgramIcon(prog.iconName)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#047857] uppercase tracking-wider block">
                        {prog.category}
                      </span>
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B]">
                        {prog.title}
                      </h2>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(`Assalam-o-Alaikum, I would like to know more about the ${prog.title} program of Silah-e-Khair Foundation.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold bg-[#25D366]/10 text-[#064E3B] px-4 py-2.5 rounded-lg hover:bg-[#25D366]/20 transition-colors shrink-0"
                  >
                    <MessageSquare className="w-4 h-4 text-[#25D366] fill-current" />
                    <span>Inquire via WhatsApp</span>
                  </a>
                </div>

                {/* Description */}
                <p className="font-sans text-base text-[#1E293B]/80 leading-relaxed">
                  {prog.fullDescription}
                </p>

                {/* Grid details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-white p-4 rounded-xl border border-[#047857]/10 space-y-1">
                    <span className="text-[11px] font-bold text-[#047857] uppercase tracking-wider block">
                      Program Purpose
                    </span>
                    <p className="font-sans text-xs text-[#64748B] leading-relaxed">
                      {prog.purpose}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#047857]/10 space-y-1">
                    <span className="text-[11px] font-bold text-[#047857] uppercase tracking-wider block">
                      Delivery Method
                    </span>
                    <p className="font-sans text-xs text-[#64748B] leading-relaxed">
                      {prog.deliveryMethod}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#047857]/10 space-y-1">
                    <span className="text-[11px] font-bold text-[#047857] uppercase tracking-wider block">
                      Community Impact
                    </span>
                    <p className="font-sans text-xs text-[#64748B] leading-relaxed">
                      {prog.impactExplanation}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-[#FAF9F6] border-t border-[#047857]/10 text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B]">
            Support These Programs Monthly
          </h2>
          <p className="font-sans text-sm text-[#64748B]">
            Your monthly contribution will be directed to verified recipients across ration, medical, and meal distributions.
          </p>
          <PrimaryButton
            size="lg"
            icon={<Heart className="w-4 h-4 fill-current" />}
            onClick={onOpenMembership}
          >
            Become a Member
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
};
