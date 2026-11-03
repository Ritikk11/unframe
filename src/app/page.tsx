'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PhoneOutlineDemo from '@/components/PhoneOutlineDemo';
import { ArrowRight, Check, ChevronDown, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const QUESTIONS = [
  {
    q: 'How does it post full-height without Instagram cropping?',
    a: 'Instagram has strict aspect ratio rules when posting from their app. By using the official Meta API, posts can be published at their natural vertical height up to 9:16 without being cropped into squares or 4:5 rectangles.',
  },
  {
    q: 'Can I post carousels with multiple photos?',
    a: 'Yes. You can add up to 10 photos in a single carousel. The first photo sets the aspect ratio for the entire carousel post, ensuring full vertical immersion.',
  },
  {
    q: 'Do I need an Instagram Business or Creator account?',
    a: "Yes. Meta's official API requires a Creator or Business account. It is completely free to switch from personal in your Instagram app settings in under a minute.",
  },
  {
    q: 'Is my Instagram account safe?',
    a: '100% safe. You authenticate directly through official Meta OAuth. We never see or store your password, and we only request the permissions required to upload media.',
  },
];

export default function HomePage() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col text-white">
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-4 sm:py-8 md:py-16 flex flex-col gap-8 md:gap-16">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center gap-3.5 sm:gap-5 pt-1 sm:pt-2 md:pt-6">
          {/* PromptSoul-inspired Glass Pill Eyebrow */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11.5px] sm:text-[13px] font-bold text-slate-200 glass-pill max-w-full">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00D2FF] shrink-0" />
            <span className="truncate">Unframe • Full 9:16 Instagram Publishing</span>
          </div>

          <h1 className="font-heading max-w-3xl text-[30px] sm:text-[48px] md:text-[60px] font-black tracking-tight leading-[1.14] text-white">
            Post full-screen photos <br className="hidden sm:inline" />
            on <span className="font-serif-italic font-bold px-1.5 inline-block accent-gradient">Instagram.</span>
          </h1>

          <p className="text-[14.5px] sm:text-[18px] md:text-[19px] text-slate-300 leading-relaxed max-w-xl font-sans">
            Most tools crop your photos to fit standard squares. <strong className="text-white font-semibold">{APP_CONFIG.name}</strong> posts them at their full height, up to 9:16 without losing a single pixel.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto pt-1 sm:pt-2">
            <Link
              href="/editor"
              className="group/cta btn-primary w-full sm:w-auto text-[16px] px-8 py-3.5 h-13 gap-2.5 rounded-full shadow-glow-primary"
            >
              <span>Open the editor</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover/cta:translate-x-1" />
            </Link>

            <a
              href="#how-it-works"
              className="group/sec btn-secondary w-full sm:w-auto text-[16px] px-7 py-3.5 h-13 rounded-full gap-2"
            >
              <span>See how it works</span>
              <ArrowRight className="w-4 h-4 opacity-40 transition-all duration-200 ease-out group-hover/sec:translate-x-1 group-hover/sec:opacity-100" />
            </a>
          </div>
        </section>

        {/* Visual Phone Outlines Comparison */}
        <section className="w-full">
          <PhoneOutlineDemo />
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <span className="text-[13px] font-bold uppercase tracking-wider text-[#00D2FF]">
              Simple 3-step workflow
            </span>
            <h2 className="text-[24px] md:text-[30px] font-bold text-white tracking-tight">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="solid-card-interactive p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00D2FF]/15 border border-[#00D2FF]/30 flex items-center justify-center text-[#00D2FF] font-bold text-[16px] shadow-sm">
                1
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[17px] font-bold text-white">
                  Connect Instagram
                </h3>
                <p className="text-[14px] text-slate-300 leading-relaxed">
                  Log in on Instagram&apos;s own page. We never see or store your password.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="solid-card-interactive p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] font-bold text-[16px] shadow-sm">
                2
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[17px] font-bold text-white">
                  Add full 9:16 photos
                </h3>
                <p className="text-[14px] text-slate-300 leading-relaxed">
                  Upload up to 10 photos. See an accurate live preview of how they render on a phone.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="solid-card-interactive p-6 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EC4899]/15 border border-[#EC4899]/30 flex items-center justify-center text-[#EC4899] font-bold text-[16px] shadow-sm">
                3
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[17px] font-bold text-white">
                  Publish uncropped
                </h3>
                <p className="text-[14px] text-slate-300 leading-relaxed">
                  One tap publishes directly to your feed without Instagram cropping a single pixel.
                </p>
              </div>
            </div>
          </div>

          {/* Good to know banner */}
          <div className="solid-card p-5 bg-gradient-to-r from-[#00D2FF]/10 via-[#7C3AED]/10 to-[#EC4899]/10 border border-[#00D2FF]/30 flex items-start sm:items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00D2FF] to-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-md">
              <InstagramIcon className="w-5 h-5" />
            </div>
            <p className="text-[14px] text-slate-200 leading-relaxed">
              <strong className="text-white font-semibold">Good to know:</strong> Works with Instagram Business and Creator accounts. Switching to one is free and takes about a minute in Instagram settings.
            </p>
          </div>
        </section>

        {/* Questions Section */}
        <section className="flex flex-col gap-5 pt-4">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <span className="text-[13px] font-bold uppercase tracking-wider text-[#00D2FF]">
              Clear answers
            </span>
            <h2 className="text-[24px] md:text-[30px] font-bold text-white tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {QUESTIONS.map((item, index) => {
              const isOpen = openQuestion === index;
              return (
                <div
                  key={index}
                  className="solid-card overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleQuestion(index)}
                    className="w-full p-5 flex items-center justify-between text-left gap-4 min-h-[50px] hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-[16px] font-semibold text-white">
                      {item.q}
                    </span>
                    <div className={`w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-[#00D2FF]/20 text-[#00D2FF]' : 'text-slate-400'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-[15px] text-slate-300 leading-relaxed border-t border-white/5">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Final CTA Card */}
        <section className="glass-surface p-8 md:p-12 flex flex-col items-center text-center gap-5 my-4 relative overflow-hidden border border-white/15 shadow-apple-lg">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#00D2FF]/15 blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00D2FF]/15 border border-[#00D2FF]/30 text-[#00D2FF] text-[12px] font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Try it now</span>
          </div>

          <h2 className="text-[26px] md:text-[36px] font-bold text-white tracking-tight max-w-md">
            Try it with your own photo.
          </h2>
          <p className="text-[16px] text-slate-300 max-w-md leading-relaxed">
            See how your 9:16 photos look on a real Instagram feed before publishing.
          </p>

          <Link
            href="/editor"
            className="group/cta btn-primary w-full sm:w-auto text-[16px] px-8 py-3.5 h-12 gap-2 rounded-full shadow-glow-primary"
          >
            <span>Open the editor</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover/cta:translate-x-1" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
