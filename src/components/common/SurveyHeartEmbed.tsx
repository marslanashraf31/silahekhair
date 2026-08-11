import React, { useState } from 'react';
import { ExternalLink, RefreshCw, MessageSquare } from 'lucide-react';
import { SITE_CONFIG } from '../../config/siteConfig';

export const SurveyHeartEmbed: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSlow, setIsSlow] = useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    setIsSlow(false);

    // Show a helpful tip if iframe takes more than 6 seconds to load
    const timer = setTimeout(() => {
      setIsSlow(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex flex-col items-center space-y-2">
      {/* Top Banner if loading is slow */}
      {isSlow && isLoading && (
        <div className="w-full bg-[#FEF3C7] border border-[#F59E0B]/30 rounded-lg p-3 text-xs text-[#92400E] flex flex-col sm:flex-row items-center justify-between gap-2 animate-in fade-in duration-200">
          <p className="font-sans font-medium text-center sm:text-left">
            Form loading slow in preview? You can open it directly in a new tab or chat on WhatsApp.
          </p>
          <a
            href={SITE_CONFIG.surveyHeartFormUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-[#064E3B] bg-white px-3 py-1.5 rounded border border-[#F59E0B]/30 hover:bg-emerald-50 shrink-0 transition-colors"
          >
            <span>Open Direct Form</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Frame Container */}
      <div className="w-full bg-[#FAF9F6] border border-[#047857]/15 rounded-xl overflow-hidden relative min-h-[420px] sm:min-h-[500px] shadow-2xs flex flex-col justify-center">
        
        {/* Loading Spinner State */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center z-10 space-y-3">
            <RefreshCw className="w-8 h-8 sm:w-9 sm:h-9 text-[#047857] animate-spin" />
            <p className="font-sans text-xs sm:text-sm font-bold text-[#064E3B]">
              Loading Official Membership Form...
            </p>
            <p className="font-sans text-xs text-[#64748B] max-w-xs">
              Connecting securely to Silah-e-Khair Foundation Form
            </p>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.membership)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#047857] hover:text-[#064E3B] bg-[#ECFDF5] px-3.5 py-2 rounded-lg border border-[#047857]/20 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366] fill-current" />
              <span>Or Apply via WhatsApp ({SITE_CONFIG.whatsappNumber})</span>
            </a>
          </div>
        )}

        {/* Embedded Iframe */}
        <iframe
          src={SITE_CONFIG.surveyHeartFormUrl}
          title="Silah-e-Khair Foundation Membership Application Form"
          className="w-full h-[460px] sm:h-[540px] md:h-[600px] border-0"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>

      <div className="pt-1 flex flex-col sm:flex-row items-center justify-between w-full gap-2 px-1 text-xs text-[#64748B] font-sans">
        <p className="text-center sm:text-left">
          WhatsApp Coordinator: <strong className="text-[#064E3B]">{SITE_CONFIG.whatsappNumber}</strong>
        </p>
        <a
          href={SITE_CONFIG.surveyHeartFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-[#047857] hover:text-[#064E3B] underline underline-offset-4"
        >
          <span>Open form in new window</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
