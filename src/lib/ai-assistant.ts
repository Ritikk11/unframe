/**
 * Paperpillar-Style AI Assistant Utilities for Instagram Carousels
 */

export interface HookTemplate {
  category: string;
  hook: string;
}

export const CAROUSEL_HOOKS: HookTemplate[] = [
  { category: 'Framework', hook: 'Most creators overcomplicate carousels. Here is the 3-step system:' },
  { category: 'Mistakes', hook: '5 mistakes that hurt your reach (and how to fix them today):' },
  { category: 'Insight', hook: 'The blueprint nobody talks about when scaling on Instagram:' },
  { category: 'Visual', hook: 'How to structure high-retention carousels from start to finish:' },
  { category: 'Growth', hook: 'Stop posting single images. Why carousels get 3.2x more saves:' },
];

export const CAROUSEL_CTAS = [
  '👉 Swipe through to see the breakdown →',
  '📌 Save this post so you don’t lose it later.',
  '💬 Which slide resonated with you most? Drop your thoughts below.',
  '🚀 Share this with someone who needs this framework today.',
];

export function applyHookToCaption(currentCaption: string, hookText: string): string {
  // If caption already has text, prepend the hook cleanly
  const trimmed = currentCaption.trim();
  if (!trimmed) {
    return `${hookText}\n\n`;
  }
  return `${hookText}\n\n${trimmed}`;
}

export function appendCtaToCaption(currentCaption: string, ctaText: string): string {
  const trimmed = currentCaption.trim();
  if (!trimmed) {
    return ctaText;
  }
  // Check if CTA already included
  if (trimmed.includes(ctaText)) return trimmed;
  return `${trimmed}\n\n${ctaText}`;
}

export function formatCaptionLayout(caption: string): string {
  const lines = caption.split('\n');
  const hashtags: string[] = [];
  const textLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      const tags = trimmed.match(/#[a-z0-9_]+/gi) || [];
      hashtags.push(...tags);
    } else {
      textLines.push(trimmed);
    }
  }

  // Combine body text with normalized spacing
  let formatted = textLines.filter((l, i) => l !== '' || (textLines[i - 1] !== '' && i > 0)).join('\n');

  // Append clean hashtags at bottom
  if (hashtags.length > 0) {
    const uniqueTags = Array.from(new Set(hashtags));
    formatted += `\n\n---\n${uniqueTags.join(' ')}`;
  }

  return formatted.trim();
}

export function getSlideRoleBadge(index: number, totalSlides: number): { label: string; role: 'hook' | 'value' | 'cta' } {
  if (index === 0) {
    return { label: 'Hook Slide', role: 'hook' };
  }
  if (index === totalSlides - 1 && totalSlides >= 3) {
    return { label: 'CTA Slide', role: 'cta' };
  }
  return { label: `Slide ${index + 1}`, role: 'value' };
}

