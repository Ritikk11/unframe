'use client';

import React from 'react';
import { Hash } from 'lucide-react';

interface CaptionEditorProps {
  caption: string;
  onCaptionChange: (caption: string) => void;
}

const QUICK_TAGS = ['#carousel', '#contentcreator', '#instagramtips', '#visualdesign', '#growth', '#storytelling'];

export default function CaptionEditor({ caption, onCaptionChange }: CaptionEditorProps) {
  const charCount = caption.length;
  const maxChars = 2200;

  const hashtags = caption.match(/#[a-z0-9_]+/gi) || [];
  const tagCount = hashtags.length;
  const maxTags = 30;

  const handleToggleTag = (tag: string) => {
    if (caption.includes(tag)) {
      const regex = new RegExp(`\\s*${tag}`, 'g');
      onCaptionChange(caption.replace(regex, '').trim());
    } else {
      const separator = caption.endsWith(' ') || caption.length === 0 ? '' : ' ';
      onCaptionChange(caption + separator + tag);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header with Title & Counters */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          Caption
        </label>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span
            className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
              tagCount > maxTags
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'glass-pill text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {tagCount}/{maxTags} tags
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
              charCount > maxChars
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'glass-pill text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {charCount}/{maxChars}
          </span>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          rows={5}
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Write your caption... The first 90 characters are visible before '... more' on Instagram."
          className="w-full glass-input rounded-2xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition-all resize-none shadow-xs leading-relaxed"
        />
      </div>

      {/* Suggested Tags */}
      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 mr-1">
          <Hash className="w-3 h-3" />
          <span>Tags:</span>
        </span>
        {QUICK_TAGS.map((tag) => {
          const isSelected = caption.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => handleToggleTag(tag)}
              className={`text-[11px] px-3 py-1 rounded-full transition-all press cursor-pointer ${
                isSelected
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium shadow-xs'
                  : 'glass-pill text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
