'use client';

import React, { useRef, useState } from 'react';
import { SlideItem } from '@/types';
import { getImageDimensions } from '@/lib/image-utils';
import {
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  Trash2,
  RotateCcw,
} from 'lucide-react';

interface SlideUploaderProps {
  slides: SlideItem[];
  onSlidesChange: (slides: SlideItem[]) => void;
  showMismatchWarnings?: boolean;
}

export const SAMPLE_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&h=1920&fit=crop',
    ratio: 1080 / 1920,
    label: '9:16 Vertical',
    w: 1080,
    h: 1920,
  },
  {
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1080&h=1920&fit=crop',
    ratio: 1080 / 1920,
    label: '9:16 Vertical',
    w: 1080,
    h: 1920,
  },
  {
    url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1080&h=1920&fit=crop',
    ratio: 1080 / 1920,
    label: '9:16 Vertical',
    w: 1080,
    h: 1920,
  },
];

export default function SlideUploader({
  slides,
  onSlidesChange,
  showMismatchWarnings = true,
}: SlideUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const anchorSlide = slides[0];

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const availableSlots = 10 - slides.length;
    const filesToProcess = fileArray.slice(0, availableSlots);

    const newSlides: SlideItem[] = [];

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) continue;

      const previewUrl = URL.createObjectURL(file);
      const meta = await getImageDimensions(previewUrl);

      newSlides.push({
        id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        file,
        previewUrl,
        width: meta.width,
        height: meta.height,
        aspectRatio: meta.aspectRatio,
        ratioLabel: meta.ratioLabel,
        status: 'ready',
      });
    }

    onSlidesChange([...slides, ...newSlides]);
  };

  const handleRemoveSlide = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onSlidesChange(slides.filter((s) => s.id !== id));
  };

  const handleMoveSlide = (index: number, direction: 'left' | 'right', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const [moved] = newSlides.splice(index, 1);
    newSlides.splice(targetIndex, 0, moved);
    onSlidesChange(newSlides);
  };

  const handleLoadSample = () => {
    const sampleItems: SlideItem[] = SAMPLE_SLIDES.map((s, idx) => ({
      id: `sample_${idx}_${Date.now()}`,
      previewUrl: s.url,
      width: s.w,
      height: s.h,
      aspectRatio: s.ratio,
      ratioLabel: s.label,
      status: 'ready',
    }));
    onSlidesChange(sampleItems);
  };

  const handleClear = () => {
    onSlidesChange([]);
  };

  return (
    <div className="space-y-3.5">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            Slides
          </label>
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400">
            {slides.length} of 10
          </span>
          {anchorSlide && (
            <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              {anchorSlide.ratioLabel.split(' ')[0]} Format
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {slides.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-xs text-zinc-800 dark:text-zinc-200 font-medium px-3 py-1.5 rounded-full glass-pill hover:bg-black/5 dark:hover:bg-white/[0.08] transition-all press cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSample}
                className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 font-medium px-2.5 py-1.5 rounded-full glass-pill hover:bg-black/5 dark:hover:bg-white/[0.08] transition-all press cursor-pointer"
                title="Reset sample slides"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Samples</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium px-2.5 py-1.5 rounded-full glass-pill hover:bg-rose-500/10 transition-all press cursor-pointer"
                title="Clear all slides"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLoadSample}
              className="flex items-center gap-1.5 text-xs text-zinc-800 dark:text-zinc-200 font-medium px-3.5 py-1.5 rounded-full glass-pill hover:bg-black/5 dark:hover:bg-white/[0.08] transition-all press cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Load sample slides</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty Dropzone */}
      {slides.length === 0 && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative overflow-hidden rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2.5 border-2 border-dashed press ${
            isDragging
              ? 'bg-zinc-100 dark:bg-white/[0.06] border-zinc-500 scale-[0.99]'
              : 'border-zinc-300/80 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 glass-card'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl glass-pill flex items-center justify-center text-zinc-700 dark:text-zinc-300 shadow-xs">
            <Upload className="w-5 h-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
              Drop images here or <span className="underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm leading-relaxed">
              Slide 1 sets the shape for the entire carousel without cropping.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 glass-pill px-2.5 py-0.5 rounded-full">
              PNG, JPG, WEBP
            </span>
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 glass-pill px-2.5 py-0.5 rounded-full">
              Up to 9:16 Vertical
            </span>
          </div>
        </div>
      )}

      {/* Slide Cards Grid */}
      {slides.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {slides.map((slide, index) => {
            const isAnchor = index === 0;
            const matchesAnchor =
              !isAnchor &&
              anchorSlide &&
              Math.abs(slide.aspectRatio - anchorSlide.aspectRatio) < 0.15;

            return (
              <div
                key={slide.id}
                className={`relative group rounded-2xl p-2.5 flex flex-col gap-2 transition-all duration-300 glass-card anim-fade-in-up hover:-translate-y-1 hover:shadow-md ${
                  isAnchor
                    ? 'ring-2 ring-zinc-900/15 dark:ring-white/20 shadow-xs'
                    : ''
                }`}
                style={{ animationDelay: `${0.04 * index}s` }}
              >
                {/* Image Viewport */}
                <div className="relative w-full aspect-square rounded-xl bg-black/90 overflow-hidden flex items-center justify-center border border-black/10 dark:border-white/10 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.previewUrl}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                  />

                  {/* Badge */}
                  <div className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white font-medium shadow-xs">
                    Slide {index + 1}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleRemoveSlide(slide.id, e)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-zinc-200 hover:text-white flex items-center justify-center transition-all press cursor-pointer shadow-xs"
                    title="Remove Slide"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Status / Ratio Info */}
                <div className="flex flex-col gap-0.5 text-[11px] px-0.5">
                  {isAnchor ? (
                    <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-200 shrink-0" />
                      <span className="truncate">Cover format</span>
                    </div>
                  ) : matchesAnchor ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">Matches cover</span>
                    </div>
                  ) : showMismatchWarnings ? (
                    <div className="text-zinc-500 dark:text-zinc-400 truncate font-medium">
                      Fits {anchorSlide?.ratioLabel.split(' ')[0]}
                    </div>
                  ) : (
                    <div className="text-zinc-500 dark:text-zinc-400 truncate">
                      {slide.ratioLabel}
                    </div>
                  )}
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {slide.width} × {slide.height}
                  </span>
                </div>

                {/* Reorder Chevrons */}
                <div className="flex items-center justify-between pt-1.5 border-t border-black/5 dark:border-white/10">
                  <button
                    disabled={index === 0}
                    onClick={(e) => handleMoveSlide(index, 'left', e)}
                    className="p-1 rounded-lg glass-pill hover:bg-black/5 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all press cursor-pointer disabled:cursor-not-allowed"
                    title="Move left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {index + 1}/{slides.length}
                  </span>
                  <button
                    disabled={index === slides.length - 1}
                    onClick={(e) => handleMoveSlide(index, 'right', e)}
                    className="p-1 rounded-lg glass-pill hover:bg-black/5 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all press cursor-pointer disabled:cursor-not-allowed"
                    title="Move right"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Quick Append Card */}
          {slides.length < 10 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-zinc-300/80 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/20 cursor-pointer transition-all glass-card text-center min-h-[140px] press group"
            >
              <div className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                Add Slide {slides.length + 1}
              </span>
              <span className="text-[10px] text-zinc-400">Drop or tap</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
