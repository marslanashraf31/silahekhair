import React, { useState, useEffect } from 'react';
import { ShieldCheck, Heart, Users, Target, Compass, Sparkles } from 'lucide-react';
import { PageHero } from '../components/common/PageHero';
import { HowWeWork } from '../components/home/HowWeWork';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SITE_CONFIG } from '../config/siteConfig';
import { getActiveMemberCount, DATASTORE_CHANGE_EVENT } from '../utils/dataStore';

interface AboutPageProps {
  onOpenMembership: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenMembership }) => {
  const [memberCount, setMemberCount] = useState(getActiveMemberCount());

  useEffect(() => {
    document.title = 'About Silah-e-Khair Foundation';
    window.scrollTo(0, 0);

    const handleUpdate = () => setMemberCount(getActiveMemberCount());
    window.addEventListener(DATASTORE_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, handleUpdate);
  }, []);

  const values = [
    { title: 'Trust', icon: ShieldCheck, desc: 'Unwavering commitment to honesty, member audits, and clear record-keeping.' },
    { title: 'Humanity', icon: Heart, desc: 'Treating every beneficiary with love, empathy, and sincere brotherhood.' },
    { title: 'Dignity', icon: Users, desc: 'Delivering aid discreetly without public display or compromising self-respect.' },
    { title: 'Transparency', icon: Compass, desc: 'Every rupee collected and spent is documented and visible to contributors.' },
    { title: 'Community', icon: Target, desc: 'Uniting friends and neighbors to turn modest individual gifts into collective strength.' },
    { title: 'Hope', icon: Sparkles, desc: 'Restoring security and peace of mind to families enduring hardship.' },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Our Foundation Charter"
        title="About Silah-e-Khair Foundation"
        subtitle="A real community-based charitable foundation created by friends who contribute together to support people in need with dignity and transparency."
      />

      {/* Editorial Story Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="space-y-6">
            <span className="text-xs font-bold text-[#047857] uppercase tracking-widest block">
              01 — Who We Are
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B] leading-tight">
              A Circle of Friends Built on Genuine Care
            </h2>
            <p className="font-sans text-base md:text-lg text-[#1E293B]/80 leading-relaxed">
              Silah-e-Khair Foundation is not a corporate non-profit or commercial donation platform. It was born out of a simple, heartfelt conversation among close friends who wanted to make a tangible, lasting difference in the lives of struggling families.
            </p>
            <p className="font-sans text-base text-[#1E293B]/80 leading-relaxed">
              We recognized that while individual donations can solve temporary emergencies, consistency is what creates real security. By committing to regular monthly contributions, our growing community of {memberCount} members ensures a predictable pool of funds every single month.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#047857]/10">
            <div className="space-y-3 bg-[#FAF9F6] p-6 rounded-2xl border border-[#047857]/15">
              <span className="text-xs font-bold text-[#047857] uppercase tracking-wider block">
                Our Mission
              </span>
              <h3 className="font-serif text-xl font-bold text-[#064E3B]">
                Dependable Humanitarian Lifelines
              </h3>
              <p className="font-sans text-sm text-[#64748B] leading-relaxed">
                To transform monthly member contributions into direct food rations, urgent prescription aid, and warm meals for pre-verified households, preserving human dignity at every step.
              </p>
            </div>

            <div className="space-y-3 bg-[#FAF9F6] p-6 rounded-2xl border border-[#047857]/15">
              <span className="text-xs font-bold text-[#047857] uppercase tracking-wider block">
                Our Vision
              </span>
              <h3 className="font-serif text-xl font-bold text-[#064E3B]">
                A Resilient Community Network
              </h3>
              <p className="font-sans text-sm text-[#64748B] leading-relaxed">
                To expand our circle of contributors so no family in our surrounding neighborhood suffers quietly from food insecurity or untreated illness.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 md:py-24 bg-[#FAF9F6] border-y border-[#047857]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#047857] uppercase tracking-widest">
              Guided Principles
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#064E3B]">
              Our Foundation Values
            </h2>
            <p className="font-sans text-sm md:text-base text-[#64748B]">
              Every distribution, verification call, and financial ledger entry is governed by these six pillar values.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((val) => {
              const Icon = val.icon;
              return (
                <div
                  key={val.title}
                  className="bg-white p-6 rounded-2xl border border-[#047857]/15 space-y-3 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                    {val.title}
                  </h3>
                  <p className="font-sans text-xs text-[#64748B] leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Operational Process */}
      <HowWeWork />

      {/* Call to Join */}
      <section className="py-16 bg-[#ECFDF5] border-t border-b border-[#047857]/20 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B]">
            Join Our Circle of Contributors
          </h2>
          <p className="font-sans text-sm md:text-base text-[#047857] font-medium max-w-xl mx-auto leading-relaxed">
            Silah-e-Khair welcomes friends, family members, and community supporters who share our vision of transparent, dignity-first giving.
          </p>
          <PrimaryButton
            size="lg"
            variant="primary"
            icon={<Heart className="w-4 h-4 fill-current text-white" />}
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
