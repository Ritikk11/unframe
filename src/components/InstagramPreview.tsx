'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SlideItem, InstagramAccount } from '@/types';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Image as ImageIcon,
  Smartphone,
  Check,
} from 'lucide-react';

interface InstagramPreviewProps {
  slides: SlideItem[];
  caption: string;
  account?: InstagramAccount;
}

export default function InstagramPreview({ slides, caption, account }: InstagramPreviewProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Drag / Swipe State
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);

  const username = account?.username || 'studio_creator';
  const avatar = account?.profilePictureUrl;

  const anchorSlide = slides[0];

  // Adjust active slide index if slides array shrinks
  useEffect(() => {
    if (activeSlideIndex >= slides.length && slides.length > 0) {
      setActiveSlideIndex(slides.length - 1);
    }
  }, [slides.length, activeSlideIndex]);

  // Compute CSS aspect ratio style strictly anchored to Slide 1 (up to 9:16 vertical without cropping)
  let containerAspectStyle = 'aspect-[4/5]';
  let ratioBadge = '4:5 Portrait';

  if (anchorSlide) {
    const ratio = anchorSlide.aspectRatio;
    if (ratio <= 0.65) {
      containerAspectStyle = 'aspect-[9/16]';
      ratioBadge = '9:16 Vertical';
    } else if (ratio <= 0.88) {
      containerAspectStyle = 'aspect-[4/5]';
      ratioBadge = '4:5 Portrait';
    } else if (ratio <= 1.1) {
      containerAspectStyle = 'aspect-square';
      ratioBadge = '1:1 Square';
    } else if (ratio >= 1.7) {
      containerAspectStyle = 'aspect-video';
      ratioBadge = '16:9 Landscape';
    } else {
      containerAspectStyle = 'aspect-[1.91/1]';
      ratioBadge = '1.91:1 Wide';
    }
  }

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : prev));
  };

  // Double tap / double click to like with popping heart
  const lastTapRef = useRef<number>(0);
  const handlePhotoTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap triggered
      setIsLiked(true);
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 850);
    }
    lastTapRef.current = now;
  };

  // Touch handlers for fluid swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchDeltaX(currentX - touchStartX);
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

  const handleShare = () => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const truncatedCaptionLength = 95;
  const isLongCaption = caption.length > truncatedCaptionLength;

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto anim-fade-in-up">
      {/* Top Status Bar with Live Dot */}
      <div className="w-full mb-3 flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
          <Smartphone className="w-3.5 h-3.5 text-zinc-500" />
          <span className="font-semibold text-xs tracking-tight">Interactive Feed Mockup</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive</span>
          </span>
          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 glass-pill px-2.5 py-0.5 rounded-full">
            {ratioBadge}
          </span>
        </div>
      </div>

      {/* Realistic Instagram Device Simulator */}
      <div className="w-full relative rounded-[36px] bg-zinc-950 text-white border border-black/15 dark:border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden font-sans transition-all duration-300">
        {/* Post Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center ring-1 ring-white/10">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-medium text-zinc-200">{username.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div className="leading-tight">
              <span className="text-xs font-semibold tracking-tight hover:underline cursor-pointer">
                {username}
              </span>
              <p className="text-[10px] text-zinc-400">Carousel</p>
            </div>
          </div>
          <button className="text-zinc-400 hover:text-white p-1 cursor-pointer transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel Media Viewport with Smooth Horizontal Sliding Track */}
        <div
          onClick={handlePhotoTap}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative w-full ${containerAspectStyle} bg-zinc-900 flex items-center justify-center overflow-hidden select-none cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}
        >
          {slides.length > 0 ? (
            <>
              {/* Sliding Horizontal Track */}
              <div
                className="flex w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  transform: `translateX(-${activeSlideIndex * 100}%)`,
                }}
              >
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="w-full h-full shrink-0 relative flex items-center justify-center bg-black/95 overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.previewUrl}
                      alt={`Slide ${idx + 1}`}
                      className="w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                ))}
              </div>

              {/* Double-tap Bouncing Heart Pop Animation */}
              {showHeartPop && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <Heart className="w-24 h-24 text-white fill-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] anim-heart-pop" />
                </div>
              )}

              {/* Share Toast Feedback */}
              {showShareToast && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-[11px] font-medium flex items-center gap-1.5 shadow-xl anim-scale-in z-30">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Link copied to clipboard</span>
                </div>
              )}

              {/* Slide Counter Badge */}
              {slides.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full pointer-events-none shadow-md z-20">
                  {activeSlideIndex + 1}/{slides.length}
                </div>
              )}

              {/* Prev / Next controls with Spring Hover */}
              {activeSlideIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center shadow-lg press cursor-pointer z-20 hover:scale-110 transition-transform"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {activeSlideIndex < slides.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center shadow-lg press cursor-pointer z-20 hover:scale-110 transition-transform"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 shadow-inner">
                <ImageIcon className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-xs font-medium text-zinc-300">Add slides to preview</p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className={`transition-all duration-200 press cursor-pointer ${
                  isLiked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-zinc-200 hover:text-white'
                }`}
                aria-label="Like post"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCaptionExpanded(!isCaptionExpanded);
                }}
                className="text-zinc-200 hover:text-white transition-colors cursor-pointer press"
                aria-label="Comments"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="text-zinc-200 hover:text-white transition-colors cursor-pointer press"
                aria-label="Share post"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Pagination Dots with Smooth Pill Morph */}
            {slides.length > 1 && (
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlideIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeSlideIndex
                        ? 'w-4 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                        : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSaved(!isSaved);
              }}
              className={`transition-all duration-200 press cursor-pointer ${
                isSaved ? 'text-white fill-white scale-110' : 'text-zinc-200 hover:text-white'
              }`}
              aria-label="Save post"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Likes Count with Live Toggle */}
          <div className="text-xs font-semibold text-zinc-100 mb-1">
            {isLiked ? '1,285 likes' : '1,284 likes'}
          </div>

          {/* Caption with Smooth Expansion */}
          <div className="text-xs text-zinc-200 leading-snug break-words">
            <span className="font-semibold mr-1.5">{username}</span>
            {caption.trim() ? (
              <span>
                {isLongCaption && !isCaptionExpanded ? (
                  <>
                    <span className="whitespace-pre-line">
                      {caption.slice(0, truncatedCaptionLength)}
                    </span>
                    <button
                      onClick={() => setIsCaptionExpanded(true)}
                      className="text-zinc-400 hover:text-zinc-200 ml-1 font-normal cursor-pointer"
                    >
                      ... more
                    </button>
                  </>
                ) : (
                  <span className="whitespace-pre-line">{caption}</span>
                )}
              </span>
            ) : (
              <span className="text-zinc-400 italic">No caption...</span>
            )}
          </div>

          <div
            onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
            className="mt-1.5 text-[11px] text-zinc-400 cursor-pointer hover:text-zinc-200 transition-colors"
          >
            {isCaptionExpanded ? 'Collapse comments' : 'View all 42 comments'}
          </div>
          <div className="mt-0.5 text-[10px] text-zinc-500">
            Just now · Double-tap photo to like ❤️
          </div>
        </div>
      </div>
    </div>
  );
}
