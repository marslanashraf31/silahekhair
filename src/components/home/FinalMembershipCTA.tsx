import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import { PrimaryButton } from '../common/PrimaryButton';
import { SITE_CONFIG } from '../../config/siteConfig';
import { getActiveMemberCount, DATASTORE_CHANGE_EVENT } from '../../utils/dataStore';

interface FinalMembershipCTAProps {
  onOpenMembership: () => void;
}

export const FinalMembershipCTA: React.FC<FinalMembershipCTAProps> = ({ onOpenMembership }) => {
  const [memberCount, setMemberCount] = useState(getActiveMemberCount());

  useEffect(() => {
    const handleUpdate = () => setMemberCount(getActiveMemberCount());
    window.addEventListener(DATASTORE_CHANGE_EVENT, handleUpdate);
    return () => window.removeEventListener(DATASTORE_CHANGE_EVENT, handleUpdate);
  }, []);

  return (
    <section className="py-20 md:py-24 bg-[#ECFDF5] border-t border-[#047857]/20 text-[#064E3B] text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#064E3B]/10 text-[#047857] text-xs font-bold uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 text-[#047857] fill-current" />
          <span>Community Pledge</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight text-[#064E3B]">
          Be Part of the Next Chapter.
        </h2>

        <p className="font-sans text-base sm:text-lg md:text-xl text-[#047857] font-medium max-w-2xl mx-auto leading-relaxed">
          Join {memberCount} friends contributing together to create meaningful support for people and families in need.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <PrimaryButton
            size="lg"
            variant="primary"
            icon={<Heart className="w-4 h-4 fill-current text-white" />}
            onClick={onOpenMembership}
            className="w-full sm:w-auto font-serif shadow-md"
          >
            Become a Member
          </PrimaryButton>

          <a
            href={`https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.membership)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-sans font-bold text-sm transition-colors shadow-xs"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>Chat with Coordinator ({SITE_CONFIG.whatsappNumber})</span>
          </a>
        </div>

      </div>
    </section>
  );
};
