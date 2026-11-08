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
  const [allAccounts, setAllAccounts] = useState<InstagramAccount[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        setIsLive(data.isLive);
        if (data.accounts?.length > 0) {
          setAllAccounts(data.accounts);
          const savedId = typeof window !== 'undefined' ? localStorage.getItem('ps_selected_account_id') : null;
          const matched = data.accounts.find((a: InstagramAccount) => a.id === savedId);
          setAccount(matched || data.accounts[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectAccount = (selected: InstagramAccount) => {
    setAccount(selected);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ps_selected_account_id', selected.id);
    }
    setFeedback(`Active account set to @${selected.username}`);
  };

  const handleDisconnect = async () => {
    await fetch('/api/auth/status', { method: 'DELETE' });
    setAccount(null);
    setAllAccounts([]);
    setIsLive(false);
    setFeedback('All Instagram accounts disconnected.');
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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-[17px] font-bold text-white">
                Connected Instagram accounts
              </h2>
              <p className="text-[13px] text-slate-400 mt-0.5">
                All Instagram Creator/Business profiles linked to your Facebook Pages.
              </p>
            </div>
            {allAccounts.length > 0 && (
              <div className="flex items-center gap-2">
                <a
                  href="/api/auth/instagram"
                  className="btn-secondary h-8 px-3 text-[12px] rounded-full text-slate-300 hover:text-white"
                >
                  + Add Instagram
                </a>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="btn-secondary h-8 px-3 text-[12px] rounded-full text-rose-400 hover:text-rose-300 hover:border-rose-500/50"
                >
                  Disconnect All
                </button>
              </div>
            )}
          </div>

          {allAccounts.length > 0 ? (
            <div className="flex flex-col gap-3">
              {allAccounts.map((acc) => {
                const isSelected = account?.id === acc.id;
                return (
                  <div
                    key={acc.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-white/[0.08] border-[#00D2FF]/40 shadow-[0_0_15px_rgba(0,210,255,0.15)]'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#00D2FF] via-[#7C3AED] to-[#EC4899] p-[2px] shrink-0">
                        <div className="w-full h-full rounded-full bg-black p-[1.5px]">
                          <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[14px] font-bold text-white overflow-hidden">
                            {acc.profilePictureUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={acc.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              acc.username.slice(0, 1).toUpperCase()
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-bold text-white">
                            @{acc.username}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                              Active in Studio
                            </span>
                          )}
                        </div>
                        <span className="text-[13px] text-slate-400">
                          Linked via Facebook Page: <span className="text-slate-200 font-medium">{acc.pageName || 'Main Page'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="self-end sm:self-auto">
                      {isSelected ? (
                        <Link
                          href="/editor"
                          className="btn-primary h-8 px-4 text-[12px] rounded-full"
                        >
                          Open in Editor
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectAccount(acc)}
                          className="btn-secondary h-8 px-4 text-[12px] rounded-full text-slate-200 hover:text-white"
                        >
                          Select Account
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
              <span className="text-[14px] text-slate-300">
                No Instagram account connected yet.
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                <a
                  href="/api/auth/instagram"
                  className="btn-primary h-10 px-5 text-[13px] rounded-full shadow-glow-primary font-bold bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:opacity-95"
                >
                  Log in with Instagram
                </a>
                <a
                  href="/api/auth/facebook"
                  className="text-slate-400 hover:text-white text-[12px] underline"
                >
                  Via Facebook
                </a>
              </div>
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
