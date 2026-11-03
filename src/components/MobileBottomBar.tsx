'use client';

import React from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';

interface MobileBottomBarProps {
  slideCount: number;
  anchorRatioLabel?: string;
  isPublishing: boolean;
  onPublish: () => void;
  canPublish: boolean;
  publishWarning?: string;
}

export default function MobileBottomBar({
  slideCount,
  anchorRatioLabel,
  isPublishing,
  onPublish,
  canPublish,
  publishWarning,
}: MobileBottomBarProps) {
  return (
    <div className="lg:hidden fixed bottom-3 left-0 right-0 z-40 px-3 anim-fade-in-up">
      <div className="glass-panel rounded-full p-2.5 max-w-md mx-auto shadow-2xl flex items-center justify-between gap-3 border border-black/10 dark:border-white/10">
        <div className="flex flex-col pl-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-medium">
            <span>{slideCount}/10 Slides</span>
            {anchorRatioLabel && (
              <span className="text-[10px] text-zinc-600 dark:text-zinc-300 glass-pill px-2 py-0.5 rounded-full">
                {anchorRatioLabel.split(' ')[0]}
              </span>
            )}
          </div>
          {publishWarning ? (
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
              <AlertCircle className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate max-w-[140px]">{publishWarning}</span>
            </span>
          ) : (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              Ready to publish
            </span>
          )}
        </div>

        <button
          onClick={onPublish}
          disabled={!canPublish || isPublishing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium shadow-sm press disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isPublishing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Publish</span>
        </button>
      </div>
    </div>
  );
}
