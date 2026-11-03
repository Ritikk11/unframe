'use client';

import React from 'react';
import { X, Sun, Moon, Laptop, Sliders, Trash2, ArrowUpRight } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  showMismatchWarnings: boolean;
  onToggleMismatchWarnings: (val: boolean) => void;
  isLive: boolean;
  onDisconnect: () => void;
  onOpenSetupGuide?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  showMismatchWarnings,
  onToggleMismatchWarnings,
  isLive,
  onDisconnect,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/75 backdrop-blur-md anim-fade-in">
      <div className="relative w-full max-w-md glass-panel rounded-[28px] p-6 overflow-hidden shadow-2xl anim-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl glass-pill flex items-center justify-center text-zinc-700 dark:text-zinc-200">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Settings</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Theme & publishing preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full glass-pill flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors press cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs">
          {/* Section 1: Appearance */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              Appearance
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onThemeChange('light')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all press cursor-pointer ${
                  theme === 'light'
                    ? 'bg-zinc-100 dark:bg-white/10 border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-medium shadow-xs'
                    : 'glass-card border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>

              <button
                onClick={() => onThemeChange('dark')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all press cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-zinc-100 dark:bg-white/10 border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-medium shadow-xs'
                    : 'glass-card border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => onThemeChange('system')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all press cursor-pointer ${
                  theme === 'system'
                    ? 'bg-zinc-100 dark:bg-white/10 border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-medium shadow-xs'
                    : 'glass-card border-black/5 dark:border-white/5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Auto</span>
              </button>
            </div>
          </div>

          {/* Section 2: Carousel Behavior */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              Carousel Layout
            </label>
            <div className="glass-card rounded-2xl p-3.5 space-y-2 border border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Ratio Mismatch Indicators
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Show indicators when slides differ in shape from the cover slide
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={showMismatchWarnings}
                  onChange={(e) => onToggleMismatchWarnings(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-500 cursor-pointer accent-zinc-900 dark:accent-white"
                />
              </div>

              <div className="pt-2 border-t border-black/5 dark:border-white/10 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                The first slide establishes the frame (1:1, 4:5, or 9:16) for the whole carousel without cropping.
              </div>
            </div>
          </div>

          {/* Section 3: Account & Connection */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
              Instagram Account
            </label>
            <div className="glass-card rounded-2xl p-3.5 space-y-2.5 border border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {isLive ? 'Connected Instagram Profile' : 'Not Connected'}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {isLive ? 'Ready for live publishing' : 'Connect via Facebook Login to publish'}
                  </p>
                </div>
                {!isLive ? (
                  <a
                    href="/api/auth/facebook"
                    className="px-3.5 py-1.5 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-medium press cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Connect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      onDisconnect();
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors press cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium transition-all press cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
