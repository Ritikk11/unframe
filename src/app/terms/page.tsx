import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { APP_CONFIG } from '@/lib/config';

export default function TermsPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[680px] mx-auto px-4 py-8 md:py-16">
        <div className="solid-card p-6 sm:p-8 flex flex-col gap-6">
          <div>
            <h1 className="text-[28px] md:text-[34px] font-bold text-[#111111]">
              Terms of service
            </h1>
            <p className="text-[14px] text-[#737373] mt-1">
              Last updated: {APP_CONFIG.lastUpdated}
            </p>
          </div>

          <div className="flex flex-col gap-5 text-[16px] text-[#444444] leading-relaxed">
            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Using {APP_CONFIG.name}
              </h2>
              <p>
                {APP_CONFIG.name} lets you edit, preview and publish photos and carousels to your own Instagram account.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Your account
              </h2>
              <p>
                You need a Business or Creator Instagram account to publish posts. Keep your login details safe. You are responsible for all activity that occurs on your account.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Your content
              </h2>
              <p>
                You retain complete ownership of your photos and captions. You grant us permission to store them and transfer them to Instagram when you instruct us to publish. You confirm you own or have the legal right to post any content you upload.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                What&apos;s not allowed
              </h2>
              <p>
                You may not upload illegal content, material that infringes intellectual property rights, spam, malicious code, or anything that violates Instagram&apos;s Terms of Use or Community Guidelines.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Instagram&apos;s rules still apply
              </h2>
              <p>
                Instagram operates independently. Instagram may update its platform policies, change its API, or take enforcement action against accounts. We are not responsible for actions taken by Instagram or Meta.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Paid plans
              </h2>
              <p>
                Paid plans automatically renew on a monthly or yearly cycle until cancelled. Subscription fees are billed in advance. We provide at least 30 days&apos; notice before any price adjustments take effect.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Cancelling
              </h2>
              <p>
                You can cancel your subscription at any time from your Account page. You will maintain full access to your plan until the end of your current billing period.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Suspension
              </h2>
              <p>
                We reserve the right to suspend or terminate accounts that breach these terms. If we suspend an account, we will provide an explanation.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                No guarantees
              </h2>
              <p>
                The service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee uninterrupted, error-free operation.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Limit of liability
              </h2>
              <p>
                We are not liable for any indirect, consequential, or incidental damages. Our total liability for any claim is limited to the amount you paid us in the 12 months preceding the event.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Governing law
              </h2>
              <p>
                These terms are governed by the laws of the {APP_CONFIG.country}.
              </p>
            </section>

            <section className="flex flex-col gap-1.5">
              <h2 className="text-[18px] font-bold text-[#111111]">
                Contact
              </h2>
              <p>
                For questions regarding these terms, write to{' '}
                <a href={`mailto:${APP_CONFIG.supportEmail}`} className="text-[#4f46e5] underline">
                  {APP_CONFIG.supportEmail}
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

