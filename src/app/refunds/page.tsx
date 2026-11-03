import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { APP_CONFIG } from '@/lib/config';

export default function RefundsPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[680px] mx-auto px-4 py-8 md:py-16">
        <div className="solid-card p-6 sm:p-8 flex flex-col gap-6">
          <div>
            <h1 className="text-[28px] md:text-[34px] font-bold text-[#111111]">
              Refunds and cancellation
            </h1>
            <p className="text-[14px] text-[#737373] mt-1">
              Last updated: {APP_CONFIG.lastUpdated}
            </p>
          </div>

          <div className="flex flex-col gap-5 text-[16px] text-[#444444] leading-relaxed">
            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Cancellation
              </h2>
              <p>
                Cancel any time from Account. You keep access until the end of the period you paid for.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Refunds
              </h2>
              <p>
                You can ask for a full refund within 7 days of your first payment.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                How to ask for a refund
              </h2>
              <p>
                To ask for a refund, email{' '}
                <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-[#4f46e5] underline">
                  {APP_CONFIG.supportEmail}
                </a>{' '}
                from your account email. We reply within 2 working days.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

