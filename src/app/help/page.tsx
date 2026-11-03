import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { APP_CONFIG } from '@/lib/config';
import { HelpCircle, Image as ImageIcon, AlertCircle, Mail, CheckCircle2 } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col text-white">
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 md:py-16 flex flex-col gap-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00D2FF]/15 border border-[#00D2FF]/30 text-[#00D2FF] text-[12px] font-bold tracking-wide uppercase mb-3 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Center</span>
          </div>
          <h1 className="text-[32px] md:text-[44px] font-bold text-white tracking-tight">
            How to use {APP_CONFIG.name}
          </h1>
          <p className="text-[16px] text-slate-300 mt-1">
            Common questions and technical guidelines for posting uncropped photos to Instagram.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {/* Section 1 */}
          <div className="solid-card p-6 flex flex-col gap-2.5 shadow-apple border border-white/10">
            <h2 className="text-[18px] font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#00D2FF]" />
              <span>Connect your Instagram account</span>
            </h2>
            <p className="text-[15px] text-slate-300 leading-relaxed">
              Click <strong className="text-white">Connect Instagram</strong> and log in via Facebook. Your Instagram account must be set to a <strong className="text-white">Business</strong> or <strong className="text-white">Creator</strong> profile and linked to a Facebook Page. To switch, open the Instagram mobile app → <strong className="text-white">Settings</strong> → <strong className="text-white">Account type and tools</strong>.
            </p>
          </div>

          {/* Section 2 */}
          <div className="solid-card p-6 flex flex-col gap-4 shadow-apple border border-white/10">
            <h2 className="text-[18px] font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#00D2FF]" />
              <span>Supported photo sizes & aspect ratios</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-[#00D2FF]/10 border border-[#00D2FF]/30 flex flex-col gap-1 shadow-[0_0_15px_rgba(0,210,255,0.15)]">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#00D2FF]">Full Screen</span>
                <span className="text-[19px] font-black text-white">9:16</span>
                <span className="text-[13px] text-slate-400">1080 × 1920 px</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Portrait</span>
                <span className="text-[19px] font-black text-white">4:5</span>
                <span className="text-[13px] text-slate-400">1080 × 1350 px</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Square</span>
                <span className="text-[19px] font-black text-white">1:1</span>
                <span className="text-[13px] text-slate-400">1080 × 1080 px</span>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="solid-card p-6 flex flex-col gap-2.5 shadow-apple border border-white/10">
            <h2 className="text-[18px] font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#00D2FF]" />
              <span>Why a photo might be rejected</span>
            </h2>
            <p className="text-[15px] text-slate-300 leading-relaxed">
              Photos taller than 9:16 (aspect ratio narrower than 0.56) are rejected by Instagram&apos;s API. Files must be standard JPG or PNG images and under 8 MB each.
            </p>
          </div>

          {/* Section 4 */}
          <div className="solid-card p-6 flex flex-col gap-2.5 shadow-apple border border-white/10">
            <h2 className="text-[18px] font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#00D2FF]" />
              <span>Still stuck?</span>
            </h2>
            <p className="text-[15px] text-slate-300 leading-relaxed">
              Email{' '}
              <a
                href={`mailto:${APP_CONFIG.supportEmail}`}
                className="text-[#00D2FF] font-semibold underline hover:text-[#00D2FF]/80"
              >
                {APP_CONFIG.supportEmail}
              </a>
              . We typically reply within 24 hours.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
