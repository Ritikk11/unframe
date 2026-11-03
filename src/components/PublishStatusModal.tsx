'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, Loader2, AlertCircle, ExternalLink, X } from 'lucide-react';

interface PublishStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'idle' | 'publishing' | 'success' | 'error';
  errorMessage?: string;
  resultData?: {
    isDemo?: boolean;
    postId?: string;
    permalink?: string;
    message?: string;
  };
}

export default function PublishStatusModal({
  isOpen,
  onClose,
  status,
  errorMessage,
  resultData,
}: PublishStatusModalProps) {
  useEffect(() => {
    if (status === 'success') {
      import('canvas-confetti')
        .then((confettiModule) => {
          const confetti = confettiModule.default;
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.55 },
            colors: ['#3b82f6', '#10b981', '#a855f7', '#f43f5e', '#fbbf24'],
          });
        })
        .catch(() => {});
    }
  }, [status]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md anim-fade-in">
      <div className="relative w-full max-w-sm glass-panel rounded-[32px] p-6 sm:p-7 overflow-hidden shadow-2xl anim-scale-in">
        {status !== 'publishing' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full glass-pill flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors press cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex flex-col items-center text-center py-2">
          {status === 'publishing' && (
            <>
              <div className="w-14 h-14 rounded-2xl glass-pill flex items-center justify-center text-zinc-900 dark:text-white mb-3.5 shadow-md">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Publishing Carousel</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-xs leading-relaxed">
                Staging slides and deploying directly to your live Instagram audience...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-3.5 shadow-lg anim-scale-in">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Carousel Published!</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
                Your carousel post is live on Instagram with Slide 1 dynamic ratio preserved.
              </p>

              <div className="mt-5 flex items-center gap-2 w-full">
                {resultData?.permalink && (
                  <a
                    href={resultData.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full glass-pill hover:bg-black/5 dark:hover:bg-white/10 text-zinc-900 dark:text-white text-xs font-semibold transition-all press"
                  >
                    <span>View Post</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold transition-all press cursor-pointer shadow-md"
                >
                  Done
                </button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-3.5 shadow-lg anim-scale-in">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Unable to Publish</h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-xs break-words leading-relaxed">
                {errorMessage || 'Failed to complete publish. Please verify your Instagram connection.'}
              </p>
              <button
                onClick={onClose}
                className="mt-5 w-full px-4 py-2.5 rounded-full glass-pill hover:bg-black/5 dark:hover:bg-white/10 text-zinc-900 dark:text-white text-xs font-medium transition-all press cursor-pointer"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
