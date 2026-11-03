import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { APP_CONFIG } from '@/lib/config';

export default function ContactPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[680px] mx-auto px-4 py-8 md:py-16">
        <div className="solid-card p-6 sm:p-8 flex flex-col gap-6">
          <div>
            <h1 className="text-[28px] md:text-[34px] font-bold text-[#111111]">
              Contact us
            </h1>
            <p className="text-[14px] text-[#737373] mt-1">
              We&apos;re here to help with any questions.
            </p>
          </div>

          <div className="flex flex-col gap-5 text-[16px] text-[#444444] leading-relaxed">
            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Email support
              </h2>
              <p>
                Email:{' '}
                <a
                  href={`mailto:${APP_CONFIG.supportEmail}`}
                  className="text-[#4f46e5] font-medium underline"
                >
                  {APP_CONFIG.supportEmail}
                </a>
                . We reply within 2 working days.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Company address
              </h2>
              <p>
                {APP_CONFIG.company}<br />
                San Francisco, CA<br />
                {APP_CONFIG.country}
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

