import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { APP_CONFIG } from '@/lib/config';

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[680px] mx-auto px-4 py-8 md:py-16">
        <div className="solid-card p-6 sm:p-8 flex flex-col gap-6">
          <div>
            <h1 className="text-[28px] md:text-[34px] font-bold text-[#111111]">
              Privacy policy
            </h1>
            <p className="text-[14px] text-[#737373] mt-1">
              Last updated: {APP_CONFIG.lastUpdated}
            </p>
          </div>

          <div className="flex flex-col gap-5 text-[16px] text-[#444444] leading-relaxed">
            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Who we are
              </h2>
              <p>
                {APP_CONFIG.company} runs {APP_CONFIG.name}. If you have any questions about this policy, contact us at{' '}
                <a href={`mailto:${APP_CONFIG.privacyEmail}`} className="text-[#4f46e5] underline">
                  {APP_CONFIG.privacyEmail}
                </a>.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                What we collect
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your name and email address when you sign up.</li>
                <li>Your Instagram account ID, username and access token when you connect your account.</li>
                <li>The photos, captions and drafts you upload to the editor.</li>
                <li>Payment details, which are handled directly by our payment processor {APP_CONFIG.paymentProvider}. We never store your credit card numbers.</li>
                <li>Basic device and usage data (such as browser type and IP address) to maintain security and prevent abuse.</li>
              </ul>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Why we use it
              </h2>
              <p>
                We use your information to provide and improve the service, publish approved posts to Instagram on your behalf, process subscriptions, keep the service secure, and answer your support questions.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Instagram permissions
              </h2>
              <p>
                We only use permissions to publish the posts you create. We never read your direct messages, follow or unfollow accounts, like posts, or comment on your behalf.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Who we share it with
              </h2>
              <p>
                We share data only with Instagram (to publish your approved posts), our hosting provider {APP_CONFIG.hostingProvider}, and our payment provider {APP_CONFIG.paymentProvider}. We never sell your personal data to anyone.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                How long we keep it
              </h2>
              <p>
                We keep your account information until you delete your account. Uploaded photos are deleted within {APP_CONFIG.photosRetentionDays} days after publishing, or immediately when you delete them.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Your rights
              </h2>
              <p>
                You can ask to see, correct or delete your data at any time by emailing{' '}
                <a href={`mailto:${APP_CONFIG.privacyEmail}`} className="text-[#4f46e5] underline">
                  {APP_CONFIG.privacyEmail}
                </a>. You can also delete your account yourself from the Account page.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Age limit
              </h2>
              <p>
                {APP_CONFIG.name} is not intended for or directed to anyone under 13 years of age.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Changes to this policy
              </h2>
              <p>
                If we make changes to this policy that matter, we will notify you by email or through a notice in the app.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Complaints
              </h2>
              <p>
                If you have a concern or complaint, write to{' '}
                <a href={`mailto:${APP_CONFIG.privacyEmail}`} className="text-[#4f46e5] underline">
                  {APP_CONFIG.privacyEmail}
                </a>. We reply within 7 days.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

