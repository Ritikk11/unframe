'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Bookmark, Grid3X3, Smartphone, Sparkles } from 'lucide-react';
import { SlideItem } from '@/types';

interface PhonePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: SlideItem[];
  caption: string;
  username?: string;
  avatarUrl?: string;
}

export default function PhonePreviewModal({
  isOpen,
  onClose,
  slides,
  caption,
  username = 'your_account',
  avatarUrl,
}: PhonePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'grid'>('feed');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Touch Swipe
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);

  if (!isOpen) return null;

  const anchorSlide = slides[0];
  let containerAspectStyle = 'aspect-[4/5]';
  if (anchorSlide) {
    const ratio = anchorSlide.aspectRatio;
    if (ratio <= 0.65) containerAspectStyle = 'aspect-[9/16]';
    else if (ratio <= 0.88) containerAspectStyle = 'aspect-[4/5]';
    else if (ratio <= 1.1) containerAspectStyle = 'aspect-square';
    else containerAspectStyle = 'aspect-[4/5]';
  }

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    setTouchDeltaX(e.touches[0].clientX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (touchDeltaX < -40 && activeSlideIndex < slides.length - 1) {
      handleNext();
    } else if (touchDeltaX > 40 && activeSlideIndex > 0) {
      handlePrev();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-2xl p-2 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] sm:max-w-sm flex flex-col justify-center my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Control Bar */}
        <div className="glass-surface px-3 py-1.5 sm:py-2 mb-2 sm:mb-3 flex items-center justify-between gap-2 rounded-full border border-white/15 shadow-apple-lg">
          <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-full border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold transition-all duration-150 ${
                activeTab === 'feed'
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Feed</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full text-[12px] sm:text-[13px] font-semibold transition-all duration-150 ${
                activeTab === 'grid'
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Profile grid</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Close preview"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* iPhone Chassis (Compact on mobile, realistic on desktop) */}
        <div className="w-full rounded-[28px] sm:rounded-[38px] p-2 sm:p-2.5 bg-gradient-to-b from-[#1E2038] via-slate-900 to-black shadow-apple-lg border sm:border-2 border-white/20 flex flex-col ring-2 sm:ring-8 ring-black/40 shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_30px_rgba(0,210,255,0.2)]">
          {/* Dynamic Island Notch (Hidden on mobile where real screen has notch) */}
          <div className="hidden sm:flex w-20 h-4 rounded-full bg-black mx-auto mb-2 items-center justify-end px-2 shrink-0 border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] shadow-[0_0_6px_#00d2ff]" />
          </div>

          {/* Screen Content */}
          <div className="w-full rounded-[22px] sm:rounded-[28px] bg-black overflow-hidden flex flex-col border border-white/10 text-white">
            {activeTab === 'feed' ? (
              /* Feed View */
              <div className="flex flex-col bg-black">
                {/* Instagram Post Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-[#00D2FF] via-[#7C3AED] to-[#EC4899] p-[1.5px]">
                      <div className="w-full h-full rounded-full bg-black p-[1px]">
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-white overflow-hidden">
                          {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            username.slice(0, 1).toUpperCase()
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-[12px] sm:text-[13px] font-bold text-white">
                      {username}
                    </span>
                  </div>
                  <div className="flex gap-0.5 text-slate-400">
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                  </div>
                </div>

                {/* Media Viewport */}
                <div
                  className={`relative w-full ${containerAspectStyle} max-h-[50vh] sm:max-h-none bg-black overflow-hidden flex items-center justify-center select-none touch-pan-y`}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {slides.length > 0 ? (
                    <>
                      <div
                        className="flex w-full h-full transition-transform duration-300 ease-out"
                        style={{ transform: `translateX(-${activeSlideIndex * 100}%)` }}
                      >
                        {slides.map((s, idx) => (
                          <div key={s.id || idx} className="w-full h-full shrink-0 flex items-center justify-center bg-black">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={s.previewUrl}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Slide Counter */}
                      {slides.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm border border-white/10">
                          {activeSlideIndex + 1}/{slides.length}
                        </div>
                      )}

                      {/* Chevrons */}
                      {activeSlideIndex > 0 && (
                        <button
                          type="button"
                          onClick={(e) => handlePrev(e)}
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center active:scale-90 transition-transform border border-white/10"
                          aria-label="Previous"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      )}
                      {activeSlideIndex < slides.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleNext(e)}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center active:scale-90 transition-transform border border-white/10"
                          aria-label="Next"
                        >
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-slate-500 text-[12px] sm:text-[13px]">No photos uploaded</div>
                  )}
                </div>

                {/* Instagram Actions Bar */}
                <div className="px-3 pt-2 pb-2.5 flex flex-col gap-1.5 bg-black">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>

                    {slides.length > 1 && (
                      <div className="flex items-center gap-1">
                        {slides.map((_, idx) => (
                          <span
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              idx === activeSlideIndex ? 'bg-[#00D2FF] w-2.5 sm:w-3 shadow-[0_0_6px_#00d2ff]' : 'bg-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>

                  {/* Caption */}
                  <div className="text-[12px] sm:text-[13px] text-slate-200 leading-snug break-words max-h-16 overflow-y-auto">
                    <span className="font-bold mr-1.5 text-white">{username}</span>
                    {caption ? (
                      <span>{caption}</span>
                    ) : (
                      <span className="text-slate-500 italic">No caption added yet...</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Profile Grid View */
              <div className="p-3 sm:p-3.5 flex flex-col gap-2.5 sm:gap-3 bg-black">
                <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#00D2FF]" />
                  <span>Profile Grid Preview (1:1 Center)</span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  <div className="aspect-square bg-slate-900 rounded-md border border-white/5" />
                  <div className="aspect-square bg-slate-800 rounded-md border border-white/5" />
                  <div className="aspect-square bg-slate-900 rounded-md border border-white/5" />
                  
                  {/* Active Post Preview */}
                  <div className="aspect-square bg-black rounded-md overflow-hidden relative ring-2 ring-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.4)]">
                    {slides[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={slides[0].previewUrl}
                        alt="Grid preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                        Cover
                      </div>
                    )}
                    {slides.length > 1 && (
                      <div className="absolute top-1 right-1 bg-black/70 p-0.5 rounded-xs border border-white/20">
                        <div className="w-2.5 h-2.5 border border-white" />
                      </div>
                    )}
                  </div>

                  <div className="aspect-square bg-slate-800 rounded-md border border-white/5" />
                  <div className="aspect-square bg-slate-900 rounded-md border border-white/5" />
                </div>
                <p className="text-[11px] text-slate-400 text-center leading-normal px-2">
                  Instagram displays the center square on your grid while the feed post displays in full 9:16.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
