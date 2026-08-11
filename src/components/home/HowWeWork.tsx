import React from 'react';
import { SectionHeading } from '../common/SectionHeading';
import { PROCESS_STEPS } from '../../config/siteConfig';

export const HowWeWork: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-[#FAF9F6] border-b border-[#047857]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <SectionHeading
          eyebrow="Operational Discipline"
          title="How We Work"
          subtitle="A transparent, dignity-first process ensuring every member contribution reaches verified families efficiently."
          align="center"
        />

        {/* Desktop Process Flow */}
        <div className="hidden lg:grid grid-cols-5 gap-6 pt-4 relative">
          {PROCESS_STEPS.map((step, idx) => (
            <div key={step.number} className="space-y-3 relative">
              <div className="flex items-center gap-3">
                <span className="font-serif text-4xl font-bold text-[#064E3B]">
                  {step.number}
                </span>
                {idx < PROCESS_STEPS.length - 1 && (
                  <div className="grow h-px bg-[#047857]/20" />
                )}
              </div>
              <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                {step.title}
              </h3>
              <p className="font-sans text-xs text-[#64748B] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="lg:hidden space-y-8 pl-4 border-l-2 border-[#047857]/20">
          {PROCESS_STEPS.map((step) => (
            <div key={step.number} className="relative pl-6 space-y-1">
              <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-[#064E3B] border-2 border-white" />
              <span className="text-xs font-bold text-[#047857] block">
                {step.number}
              </span>
              <h3 className="font-serif text-lg font-bold text-[#064E3B]">
                {step.title}
              </h3>
              <p className="font-sans text-xs text-[#64748B] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
