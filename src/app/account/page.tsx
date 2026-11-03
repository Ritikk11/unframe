'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BottomTabBar from '@/components/BottomTabBar';
import Footer from '@/components/Footer';
import { InstagramAccount } from '@/types';
import { AlertTriangle, Check, Trash2, LogOut } from 'lucide-react';

export default function AccountPage() {
  const [account, setAccount] = useState<InstagramAccount | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        setIsLive(data.isLive);
        if (data.accounts?.length > 0) {
          setAccount(data.accounts[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleDisconnect = async () => {
    await fetch('/api/auth/status', { method: 'DELETE' });
    setAccount(null);
    setIsLive(false);
    setFeedback('Instagram account disconnected.');
  };

  const handleDeleteAccount = async () => {
    localStorage.clear();
    await fetch('/api/auth/status', { method: 'DELETE' });
    window.location.href = '/';
  };

  return (
    <div className="min-h-[100dvh] flex flex-col pb-24 md:pb-8 text-white">
      <Navbar connectedUsername={account?.username} />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div>
          <h1 className="text-[28px] md:text-[34px] font-bold text-white tracking-tight">
            Account settings
          </h1>
          <p className="text-[15px] text-slate-400 mt-1">
            Manage your connected Instagram profile, plan, and data.
          </p>
        </div>

        {feedback && (
          <div className="solid-card p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[15px] flex items-center gap-2.5 shadow-sm">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">{feedback}</span>
          </div>
        )}

        {/* 1. Instagram account section */}
        <div className="solid-card p-6 flex flex-col gap-4 shadow-apple border border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-white">
              Instagram connection
            </h2>
            {account && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                Active
              </span>
            )}
          </div>

          {account ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#00D2FF] via-[#7C3AED] to-[#EC4899] p-[2px]">
                  <div className="w-full h-full rounded-full bg-black p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[14px] font-bold text-white overflow-hidden">
                      {account.profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={account.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        account.username.slice(0, 1).toUpperCase()
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-bold text-white">
                    @{account.username}
                  </span>
                  <span className="text-[13px] text-slate-400">
                    Meta Graph API Linked
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDisconnect}
                className="btn-secondary h-10 px-4 text-[13px] rounded-full self-end sm:self-auto text-rose-400 hover:text-rose-300 hover:border-rose-500/50"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
              <span className="text-[14px] text-slate-300">
                No Instagram account connected yet.
              </span>
              <a
                href="/api/auth/facebook"
                className="btn-primary h-10 px-5 text-[13px] rounded-full shadow-glow-primary font-bold"
              >
                Connect Instagram
              </a>
            </div>
          )}
        </div>

        {/* 2. Plan section */}
        <div className="solid-card p-6 flex flex-col gap-4 shadow-apple border border-white/10">
          <h2 className="text-[17px] font-bold text-white">
            Subscription plan
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-white">
                Free Plan
              </span>
              <span className="text-[13px] text-slate-400">
                Unlimited editing, 9:16 aspect ratio preview, and local drafts
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/pricing"
                className="btn-primary h-10 px-5 text-[13px] rounded-full shadow-glow-primary font-bold"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Delete account section */}
        <div className="solid-card p-6 flex flex-col gap-4 border border-rose-500/20 shadow-apple">
          <div className="flex flex-col">
            <h2 className="text-[17px] font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Delete account & data</span>
            </h2>
            <p className="text-[14px] text-slate-400 mt-1 leading-relaxed">
              Permanently delete all your uploaded photos, saved drafts, and disconnect your Instagram access token immediately.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="btn-secondary h-10 px-4 text-[13px] rounded-full text-rose-400 hover:bg-rose-500/10 hover:border-rose-400 transition-colors"
            >
              Delete account
            </button>
          </div>
        </div>

        {/* 4. Log out action */}
        <div className="flex justify-start pt-2">
          <button
            type="button"
            onClick={handleDisconnect}
            className="text-[14px] font-semibold text-slate-400 hover:text-white flex items-center gap-2 px-3.5 py-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-150">
          <div className="solid-card max-w-md w-full p-6 flex flex-col gap-4 shadow-apple-lg border border-white/20">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-[20px] font-bold text-white">
                Delete account?
              </h3>
              <p className="text-[14px] text-slate-300 leading-relaxed">
                This deletes your photos, drafts, and Instagram connection. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 min-h-[44px] rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-[14px] transition-colors shadow-sm"
              >
                Delete account
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1 justify-center rounded-full text-[14px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomTabBar />
    </div>
  );
}
