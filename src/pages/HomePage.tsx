import React, { useEffect } from 'react';
import { HomeHero } from '../components/home/HomeHero';
import { WhoWeArePreview } from '../components/home/WhoWeArePreview';
import { OurWorkPreview } from '../components/home/OurWorkPreview';
import { ImpactPreview } from '../components/home/ImpactPreview';
import { HowWeWork } from '../components/home/HowWeWork';
import { RealFieldStory } from '../components/home/RealFieldStory';
import { TransparencyPreview } from '../components/home/TransparencyPreview';
import { UpdatesPreview } from '../components/home/UpdatesPreview';
import { FinalMembershipCTA } from '../components/home/FinalMembershipCTA';

interface HomePageProps {
  onOpenMembership: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenMembership }) => {
  useEffect(() => {
    document.title = 'Silah-e-Khair Foundation | Connecting Hearts Through Giving';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Section 01 — Hero */}
      <HomeHero onOpenMembership={onOpenMembership} />

      {/* Section 02 — Foundation Introduction */}
      <WhoWeArePreview />

      {/* Section 03 — What We Do */}
      <OurWorkPreview />

      {/* Section 04 — Impact */}
      <ImpactPreview />

      {/* Section 05 — How We Work */}
      <HowWeWork />

      {/* Section 06 — Real Field Story */}
      <RealFieldStory />

      {/* Section 07 — Transparency */}
      <TransparencyPreview />

      {/* Section 08 — Latest Updates */}
      <UpdatesPreview />

      {/* Section 09 — Become a Member (Final CTA) */}
      <FinalMembershipCTA onOpenMembership={onOpenMembership} />
    </div>
  );
};
