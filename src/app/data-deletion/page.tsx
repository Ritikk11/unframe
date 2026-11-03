import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { APP_CONFIG } from '@/lib/config';

export default function DataDeletionPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[680px] mx-auto px-4 py-8 md:py-16">
        <div className="solid-card p-6 sm:p-8 flex flex-col gap-6">
          <div>
            <h1 className="text-[28px] md:text-[34px] font-bold text-[#111111]">
              Delete your data
            </h1>
            <p className="text-[14px] text-[#737373] mt-1">
              Last updated: {APP_CONFIG.lastUpdated}
            </p>
          </div>

          <div className="flex flex-col gap-5 text-[16px] text-[#444444] leading-relaxed">
            <p>
              You can delete your {APP_CONFIG.name} account and all data we store about you at any time.
            </p>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                In the app
              </h2>
              <p>
                Go to Account, then Delete account, and confirm. We remove your photos, captions, drafts and Instagram connection straight away.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                By email
              </h2>
              <p>
                Write to{' '}
                <a href={`mailto:${APP_CONFIG.privacyEmail}`} className="text-[#4f46e5] underline">
                  {APP_CONFIG.privacyEmail}
                </a>{' '}
                from the email on your account. We delete everything within 7 days and reply when it&apos;s done.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                From Instagram
              </h2>
              <p>
                You can also remove {APP_CONFIG.name} under Settings, Apps and websites on Instagram. This stops us from posting but doesn&apos;t delete your data, so use one of the options above as well.
              </p>
            </section>

            <div className="p-4 rounded-xl bg-zinc-50 border border-[#E5E5E5] text-[15px] text-[#555555]">
              Posts already published to Instagram stay on Instagram. Delete them there.
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

