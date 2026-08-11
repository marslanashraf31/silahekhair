import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const WhoWeArePreview: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-[#047857]/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        <span className="text-xs font-bold text-[#047857] uppercase tracking-widest block">
          Small Monthly Contributions • Meaningful Community Support
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#064E3B] tracking-tight max-w-3xl mx-auto leading-tight">
          A Circle of Friends Giving Together
        </h2>

        <p className="font-sans text-base sm:text-lg md:text-xl text-[#1E293B]/80 max-w-3xl mx-auto leading-relaxed">
          Silah-e-Khair Foundation was started by friends who contribute together each month to support individuals and families in need. By combining modest individual pledges into a predictable monthly fund, we ensure reliable food security, medical assistance, and emergency relief delivered with dignity and complete care.
        </p>

        <div className="pt-4">
          <Link
            to="/about"
            className="inline-flex items-center gap-2 font-sans text-sm font-bold text-[#064E3B] hover:text-[#047857] group"
          >
            <span>Learn About Us</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
};
