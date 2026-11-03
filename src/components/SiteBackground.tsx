'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Clean, subtle, atmospheric background inspired by PromptSoul:
 * - Deep obsidian midnight canvas (#060713)
 * - Whisper-subtle cyber grid (barely-there texture, never noisy)
 * - Soft, deeply diffused atmospheric ambient glow (moonlit depth)
 * - Smooth GPU cursor spotlight
 */
export default function SiteBackground() {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const spotlight = spotlightRef.current;
    if (!spotlight) return;

    let frame = 0;
    let clientX = window.innerWidth * 0.5;
    let clientY = window.innerHeight * 0.3;

    const update = () => {
      frame = 0;
      if (spotlight) {
        spotlight.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
        spotlight.style.opacity = '1';
      }
    };

    const onMove = (e: MouseEvent) => {
      clientX = e.clientX;
      clientY = e.clientY;
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      id="site-background-canvas"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden w-full max-w-full bg-[#060713] transform-gpu [backface-visibility:hidden] [contain:paint]"
      aria-hidden="true"
    >
      {/* 1. Base radial wash from top center */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,rgba(124,58,237,0.18),transparent_60%)]" />

      {/* 2. Soft, atmospheric ambient glows (ultra-diffused, subtle) */}
      {/* Soft Purple Glow (Top Left) */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[65vw] h-[60vh] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, transparent 65%)',
          filter: 'blur(120px)',
        }}
      />

      {/* Soft Blue Glow (Top Right) */}
      <div
        className="absolute -top-[10%] -right-[10%] w-[60vw] h-[55vh] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, transparent 65%)',
          filter: 'blur(120px)',
        }}
      />

      {/* Subtle Pink/Violet Glow (Mid-Right) */}
      <div
        className="absolute top-[35%] -right-[15%] w-[55vw] h-[50vh] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 65%)',
          filter: 'blur(130px)',
        }}
      />

      {/* Subtle Teal Glow (Bottom Left) */}
      <div
        className="absolute bottom-[-10%] -left-[10%] w-[60vw] h-[50vh] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.12) 0%, transparent 65%)',
          filter: 'blur(130px)',
        }}
      />

      {/* 3. Whisper-subtle Cyber Grid (Quiet, clean, elegant 56px) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      {/* 4. Gentle Cursor Spotlight */}
      <div
        ref={spotlightRef}
        id="cursor-spotlight"
        className="pointer-events-none absolute top-0 left-0 h-[440px] w-[440px] rounded-full opacity-0 will-change-transform transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle, rgba(0, 210, 255, 0.12) 0%, rgba(139, 92, 246, 0.06) 40%, transparent 70%)',
          transform: 'translate3d(50vw, 30vh, 0) translate(-50%, -50%)',
        }}
      />
    </div>
  );
}
