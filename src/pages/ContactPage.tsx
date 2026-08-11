import React, { useEffect } from 'react';
import { MessageSquare, Phone, Mail, MapPin, Heart, Instagram, ArrowUpRight } from 'lucide-react';
import { PageHero } from '../components/common/PageHero';
import { SITE_CONFIG } from '../config/siteConfig';
import { PrimaryButton } from '../components/common/PrimaryButton';

interface ContactPageProps {
  onOpenMembership: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onOpenMembership }) => {
  useEffect(() => {
    document.title = 'Contact Silah-e-Khair Foundation';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Direct Foundation Access"
        title="Contact Silah-e-Khair Foundation"
        subtitle="For member inquiries, beneficiary verifications, or general questions, connect with our management team."
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Primary WhatsApp Direct Communication Banner */}
          <div className="bg-linear-to-r from-[#ECFDF5] via-white to-[#ECFDF5] p-8 md:p-10 rounded-3xl border border-[#047857]/20 shadow-sm text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 text-[#064E3B] text-xs font-bold uppercase tracking-wider">
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366] fill-current" />
                <span>Fastest Response Channel</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#064E3B]">
                Connect Directly on WhatsApp
              </h2>
              <p className="font-sans text-sm text-[#64748B] leading-relaxed">
                WhatsApp is our primary communication channel for instant inquiry, contribution confirmation, and beneficiary verification.
              </p>
            </div>

            <a
              href={`https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.contact)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 bg-[#25D366] text-white px-7 py-4 rounded-xl font-sans font-bold text-base hover:bg-[#20BD5A] transition-all shadow-md shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
              <span>Message {SITE_CONFIG.whatsappNumber}</span>
            </a>
          </div>

          {/* Contact Details Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#047857]/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#25D366] fill-current" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#064E3B]">
                Official WhatsApp
              </h3>
              <p className="font-sans text-xs text-[#64748B]">
                Direct line for members & beneficiaries
              </p>
              <p className="font-sans text-sm font-bold text-[#064E3B] pt-1">
                {SITE_CONFIG.whatsappNumber}
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#047857]/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#064E3B]">
                Phone Contact
              </h3>
              <p className="font-sans text-xs text-[#64748B]">
                Voice coordination & inquiries
              </p>
              <p className="font-sans text-sm font-bold text-[#064E3B] pt-1">
                {SITE_CONFIG.whatsappNumber}
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#047857]/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#064E3B]">
                Official Email
              </h3>
              <p className="font-sans text-xs text-[#64748B]">
                Institutional desk
              </p>
              <p className="font-sans text-xs font-bold text-[#064E3B] pt-1">
                silahekhairfoundation@gmail.com
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-[#047857]/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-[#064E3B]">
                Foundation Scope
              </h3>
              <p className="font-sans text-xs text-[#64748B]">
                Community field coverage
              </p>
              <p className="font-sans text-sm font-bold text-[#064E3B] pt-1">
                Jhang, Punjab, Pakistan
              </p>
            </div>

          </div>

          {/* Social Media Channels */}
          <div className="space-y-4 pt-2">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-xl font-bold text-[#064E3B]">
                Official Social Media Channels
              </h3>
              <p className="font-sans text-xs text-[#64748B] mt-1">
                Follow Silah-e-Khair Foundation on Instagram & TikTok for verified ground updates, distribution videos, and field reports.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Instagram Card */}
              <a
                href={SITE_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 bg-[#FAF9F6] hover:bg-[#F3F0EA] border border-[#047857]/15 rounded-2xl transition-all group shadow-2xs"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Instagram className="w-6 h-6" />
                </div>
                <div className="grow space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-bold text-[#064E3B] group-hover:text-[#047857] transition-colors">
                      Instagram
                    </h4>
                    <ArrowUpRight className="w-4 h-4 text-[#047857] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="font-sans text-xs text-[#64748B]">
                    @silahekhairfoundation
                  </p>
                </div>
              </a>

              {/* TikTok Card */}
              <a
                href={SITE_CONFIG.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 bg-[#FAF9F6] hover:bg-[#F3F0EA] border border-[#047857]/15 rounded-2xl transition-all group shadow-2xs"
              >
                <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.33 22a6.33 6.33 0 0 0 6.33-6.33V9.12a8.16 8.16 0 0 0 3.93 1.02V6.69z"/>
                  </svg>
                </div>
                <div className="grow space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-bold text-[#064E3B] group-hover:text-[#047857] transition-colors">
                      TikTok
                    </h4>
                    <ArrowUpRight className="w-4 h-4 text-[#047857] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p className="font-sans text-xs text-[#64748B]">
                    @silahekhair
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Verification & Membership Callout */}
          <div className="bg-[#ECFDF5] border border-[#047857]/20 p-8 rounded-3xl text-center space-y-6 shadow-xs">
            <div className="max-w-2xl mx-auto space-y-3">
              <h3 className="font-serif text-2xl font-bold text-[#064E3B]">
                Interested in Becoming a Contributing Member?
              </h3>
              <p className="font-sans text-sm text-[#047857] font-medium leading-relaxed">
                Complete our official membership form or send a message via WhatsApp to speak with a founding member.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <PrimaryButton
                size="lg"
                variant="primary"
                icon={<Heart className="w-4 h-4 fill-current text-white" />}
                onClick={onOpenMembership}
                className="shadow-md"
              >
                Become a Member
              </PrimaryButton>

              <a
                href={`https://wa.me/${SITE_CONFIG.whatsappRaw}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessages.membership)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-3.5 rounded-xl font-sans font-bold text-sm transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>WhatsApp Coordinator</span>
              </a>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
