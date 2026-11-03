'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Check, ChevronDown, Sparkles, ArrowRight } from 'lucide-react';

const PRICING_QUESTIONS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. You keep access until the end of the billing period you paid for. No hidden fees or contracts.',
  },
  {
    q: 'Do I need a card to try it?',
    a: 'No. The free plan has no payment step. You can edit and preview full 9:16 posts completely free.',
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col text-white">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-16 flex flex-col gap-10">
        {/* Title */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-bold text-slate-200 glass-pill uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span>Simple transparent pricing</span>
          </div>

          <h1 className="text-[34px] sm:text-[44px] md:text-[50px] font-bold text-white tracking-tight leading-tight">
            Plans for every creator.
          </h1>
          <p className="text-[16px] sm:text-[18px] text-slate-300 max-w-md leading-relaxed">
            Editing and preview are free forever. Upgrade when you want to publish live.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="mt-4 flex items-center p-1 rounded-full bg-white/[0.06] border border-white/10 shadow-sm">
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-150 ${
                billing === 'monthly'
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('yearly')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-150 ${
                billing === 'yearly'
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Yearly</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] text-[10px] font-bold uppercase tracking-wider border border-[#00D2FF]/30">
                2 months free
              </span>
            </button>
          </div>
        </div>

        {/* Plans: Pro first on phone, then Free, then Agency */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-4xl mx-auto w-full">
          {/* 1. Pro Plan (Highlighted with Radiant Ring) */}
          <div className="glass-surface p-7 flex flex-col justify-between gap-6 md:order-2 relative shadow-apple-lg border-2 border-[#00D2FF]/60 shadow-[0_0_40px_rgba(0,210,255,0.25)] ring-4 ring-[#00D2FF]/15">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#00D2FF] via-[#7C3AED] to-[#EC4899] text-white text-[11px] font-black tracking-wide uppercase shadow-md">
              Most Popular
            </div>

            <div className="flex flex-col gap-5 pt-2">
              <div>
                <span className="text-[14px] font-bold text-[#00D2FF] uppercase tracking-wider">
                  Pro
                </span>
                <div className="text-[42px] font-black text-white mt-1 tracking-tight">
                  {billing === 'yearly' ? '$9' : '$11'}
                  <span className="text-[15px] font-medium text-slate-400">
                    /month
                  </span>
                </div>
                <p className="text-[14px] text-slate-300 mt-1">
                  For creators publishing regularly without crop limitations.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-white/10 text-[14px] text-slate-200 font-medium">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/40 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Publish full 9:16 to Instagram</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/40 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Up to 3 connected accounts</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/40 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Unlimited posts & carousels</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/40 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Post history & drafts</span>
                </div>
              </div>
            </div>

            <Link href="/editor" className="group/cta btn-primary w-full justify-center h-12 rounded-full text-[15px] font-bold shadow-glow-primary gap-2">
              <span>Get Pro</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover/cta:translate-x-1" />
            </Link>
          </div>

          {/* 2. Free Plan */}
          <div className="solid-card p-7 flex flex-col justify-between gap-6 md:order-1 shadow-apple border border-white/10">
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[14px] font-bold text-slate-400 uppercase tracking-wider">
                  Free
                </span>
                <div className="text-[42px] font-black text-white mt-1 tracking-tight">
                  $0
                </div>
                <p className="text-[14px] text-slate-300 mt-1">
                  Free forever to edit and test your full-screen photos.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-white/10 text-[14px] text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00D2FF] shrink-0" />
                  <span>Editor and full-screen preview</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00D2FF] shrink-0" />
                  <span>Photos up to 9:16 aspect ratio</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00D2FF] shrink-0" />
                  <span>Drafts saved locally</span>
                </div>
              </div>
            </div>

            <Link href="/editor" className="btn-secondary w-full justify-center h-12 rounded-full text-[15px]">
              Start free
            </Link>
          </div>

          {/* 3. Agency Plan */}
          <div className="solid-card p-7 flex flex-col justify-between gap-6 md:order-3 shadow-apple border border-white/10">
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[14px] font-bold text-slate-400 uppercase tracking-wider">
                  Agency
                </span>
                <div className="text-[42px] font-black text-white mt-1 tracking-tight">
                  {billing === 'yearly' ? '$25' : '$31'}
                  <span className="text-[15px] font-medium text-slate-400">
                    /month
                  </span>
                </div>
                <p className="text-[14px] text-slate-300 mt-1">
                  For marketing agencies managing multiple creator brands.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-white/10 text-[14px] text-slate-300">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00D2FF] shrink-0" />
                  <span>Unlimited connected accounts</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00D2FF] shrink-0" />
                  <span>Team members collaboration</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#00D2FF] shrink-0" />
                  <span>Switch between client accounts</span>
                </div>
              </div>
            </div>

            <Link href="/contact" className="btn-secondary w-full justify-center h-12 rounded-full text-[15px]">
              Contact us
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-4 pt-4">
          <h2 className="text-[22px] font-bold text-white text-center tracking-tight">
            Frequently asked questions
          </h2>

          <div className="flex flex-col gap-3">
            {PRICING_QUESTIONS.map((item, index) => {
              const isOpen = openQuestion === index;
              return (
                <div key={index} className="solid-card overflow-hidden transition-all border border-white/10">
                  <button
                    type="button"
                    onClick={() => toggleQuestion(index)}
                    className="w-full p-5 flex items-center justify-between text-left gap-4 min-h-[50px] hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-[15px] font-bold text-white">
                      {item.q}
                    </span>
                    <div className={`w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-[#00D2FF]/20 text-[#00D2FF]' : 'text-slate-400'}`}>
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
