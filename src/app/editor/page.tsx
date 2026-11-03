'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PhonePreviewModal from '@/components/PhonePreviewModal';
import { SlideItem, InstagramAccount } from '@/types';
import { getImageDimensions } from '@/lib/image-utils';
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Link as LinkIcon,
  Upload,
  Sparkles,
  Smartphone,
  Grid3X3,
  Bookmark,
  Heart,
  MessageCircle,
  Send,
  Layers,
  ArrowRight,
  Edit3,
} from 'lucide-react';

function EditorContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth / Account state
  const [account, setAccount] = useState<InstagramAccount | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Content state
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [caption, setCaption] = useState('');

  // Image URL Input state
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputImageUrl, setInputImageUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  // UI state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [desktopPreviewTab, setDesktopPreviewTab] = useState<'feed' | 'grid'>('feed');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Feedback messages
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'draft'; text: string; link?: string } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Load account status on mount and handle OAuth feedback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authError = params.get('auth_error');
      const authSuccess = params.get('auth');

      if (authError) {
        setToastMessage({
          type: 'error',
          text: decodeURIComponent(authError),
        });
        window.history.replaceState({}, '', window.location.pathname);
      } else if (authSuccess === 'success') {
        setToastMessage({
          type: 'success',
          text: 'Instagram connected successfully.',
        });
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        setIsLive(data.isLive);
        if (data.accounts?.length > 0) {
          setAccount(data.accounts[0]);
        } else {
          setAccount(null);
        }
      })
      .catch(() => {
        setAccount(null);
      });
  }, []);

  // Handle image files
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

      // Check ratio: reject photos taller than 9:16 (aspectRatio < 0.55)
      if (meta.aspectRatio < 0.55) {
        setToastMessage({
          type: 'error',
          text: "This photo can't be posted. It's taller than 9:16. Crop it or choose another.",
        });
        continue;
      }

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

    if (newSlides.length > 0) {
      setSlides((prev) => [...prev, ...newSlides]);
    }
  };

  // Handle direct image URL
  const handleAddImageUrl = async () => {
    const url = inputImageUrl.trim();
    if (!url) return;

    if (slides.length >= 10) {
      setToastMessage({ type: 'error', text: 'Instagram allows a maximum of 10 photos.' });
      return;
    }

    setIsLoadingUrl(true);
    try {
      const meta = await getImageDimensions(url);

      if (meta.aspectRatio < 0.55) {
        setToastMessage({
          type: 'error',
          text: "This photo can't be posted. It's taller than 9:16. Crop it or choose another.",
        });
        setIsLoadingUrl(false);
        return;
      }

      const newSlide: SlideItem = {
        id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        previewUrl: url,
        width: meta.width,
        height: meta.height,
        aspectRatio: meta.aspectRatio,
        ratioLabel: meta.ratioLabel,
        status: 'ready',
      };

      setSlides((prev) => [...prev, newSlide]);
      setInputImageUrl('');
      setShowUrlInput(false);
    } catch {
      setToastMessage({
        type: 'error',
        text: 'Failed to load image from URL. Make sure the URL is public and ends in .jpg or .png',
      });
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleRemoveSlide = (id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const handleMoveSlide = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    setSlides((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  // Derive post shape from first photo
  let postShapeText = 'Full screen 9:16';
  let containerAspectStyle = 'aspect-[4/5]';
  if (slides[0]) {
    const ratio = slides[0].aspectRatio;
    if (ratio <= 0.65) {
      postShapeText = 'Full screen 9:16';
      containerAspectStyle = 'aspect-[9/16]';
    } else if (ratio <= 0.88) {
      postShapeText = 'Portrait 4:5';
      containerAspectStyle = 'aspect-[4/5]';
    } else if (ratio <= 1.1) {
      postShapeText = 'Square 1:1';
      containerAspectStyle = 'aspect-square';
    } else {
      postShapeText = 'Custom ratio';
      containerAspectStyle = 'aspect-[4/5]';
    }
  }

  // Save Draft action
  const handleSaveDraft = () => {
    if (slides.length === 0) {
      setToastMessage({
        type: 'error',
        text: 'Add at least one photo before saving a draft.',
      });
      return;
    }

    try {
      const drafts = JSON.parse(localStorage.getItem('ps_drafts') || '[]');
      const newDraft = {
        id: `draft_${Date.now()}`,
        caption,
        slidesCount: slides.length,
        aspectRatio: postShapeText,
        date: 'Today',
        status: 'Draft',
        coverUrl: slides[0]?.previewUrl,
      };
      drafts.unshift(newDraft);
      localStorage.setItem('ps_drafts', JSON.stringify(drafts));

      setToastMessage({
        type: 'draft',
        text: 'Draft saved.',
      });
    } catch {
      setToastMessage({
        type: 'draft',
        text: 'Draft saved locally.',
      });
    }
  };

  // Publish action
  const handlePublish = async () => {
    if (slides.length === 0) {
      setToastMessage({
        type: 'error',
        text: 'Add at least one photo to publish.',
      });
      return;
    }

    if (!isLive || !account) {
      setToastMessage({
        type: 'error',
        text: 'Connect Instagram to publish. You can still edit and preview.',
      });
      return;
    }

    setIsPublishing(true);
    setToastMessage(null);

    try {
      const finalImageUrls: string[] = [];

      for (const slide of slides) {
        if (slide.file) {
          const formData = new FormData();
          formData.append('file', slide.file);
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(uploadData.error || 'Failed to upload photo');
          const imageUrl = uploadData.url.startsWith('http')
            ? uploadData.url
            : `${window.location.origin}${uploadData.url}`;
          finalImageUrls.push(imageUrl);
        } else {
          // Direct Image URL
          finalImageUrls.push(slide.previewUrl);
        }
      }

      const publishRes = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          igUserId: account.id,
          accessToken: account.pageAccessToken,
          imageUrls: finalImageUrls,
          caption,
        }),
      });

      const resData = await publishRes.json();
      if (!publishRes.ok) {
        throw new Error(resData.error || 'Failed to publish post');
      }

      // Record in local history
      try {
        const published = JSON.parse(localStorage.getItem('ps_published_posts') || '[]');
        published.unshift({
          id: resData.postId || `post_${Date.now()}`,
          coverUrl: finalImageUrls[0],
          slidesCount: slides.length,
          aspectRatio: postShapeText,
          date: 'Just now',
          status: 'Published',
          permalink: resData.permalink,
        });
        localStorage.setItem('ps_published_posts', JSON.stringify(published));
      } catch {}

      setToastMessage({
        type: 'success',
        text: 'Published. View on Instagram.',
        link: resData.permalink || 'https://instagram.com',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Publish failed. Try again.';
      setToastMessage({
        type: 'error',
        text: msg,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col pb-28 lg:pb-12">
      <Navbar connectedUsername={account?.username} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 md:py-8">
        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {/* Global Toast / Feedback Bar */}
        {toastMessage && (
          <div
            className={`solid-card mb-4 sm:mb-6 p-4 flex items-center justify-between gap-3 text-[15px] animate-in fade-in duration-200 border ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/80 text-rose-200 border-rose-500/40 shadow-[0_0_24px_rgba(244,63,94,0.3)]'
                : toastMessage.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40 shadow-[0_0_24px_rgba(16,185,129,0.3)]'
                : 'bg-cyan-950/80 text-cyan-200 border-cyan-500/40 shadow-[0_0_24px_rgba(0,210,255,0.3)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toastMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              ) : (
                <Check className="w-5 h-5 shrink-0 text-emerald-400" />
              )}
              <span className="font-medium text-white">{toastMessage.text}</span>
              {toastMessage.link && (
                <a
                  href={toastMessage.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline ml-2 inline-flex items-center gap-1 text-[#00D2FF] hover:underline"
                >
                  Open <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mobile Top Segmented Switcher: [ Edit Post ] | [ Live Preview (X) ] */}
        <div className="lg:hidden flex items-center justify-center mb-4">
          <div className="glass-surface p-1 rounded-full border border-white/15 flex items-center shadow-apple-sm">
            <button
              type="button"
              onClick={() => setMobileTab('edit')}
              className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                mobileTab === 'edit'
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Post</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('preview')}
              className={`flex items-center gap-1.5 px-5 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                mobileTab === 'preview'
                  ? 'bg-white/15 text-white shadow-sm border border-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-[#00D2FF]" />
              <span>Live Preview</span>
              {slides.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] text-[10px] font-black flex items-center justify-center">
                  {slides.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 1024px+ Desktop 2-Column Grid / Phone Single Column Toggle */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Editor controls */}
          <div className={`lg:col-span-7 flex flex-col gap-6 ${mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
            {/* 1. Account Section */}
            <div className="solid-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-apple-sm">
              {account ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00D2FF] via-[#7C3AED] to-[#EC4899] p-[1.5px] shrink-0">
                    <div className="w-full h-full rounded-full bg-black p-[1px]">
                      <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[12px] font-bold text-white overflow-hidden">
                        {account.profilePictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={account.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          account.username.slice(0, 1).toUpperCase()
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-white">
                        @{account.username}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                        Connected
                      </span>
                    </div>
                    <span className="text-[12px] text-slate-400">
                      Publishing full-screen photos live to feed
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-white">
                      Connect Instagram to publish
                    </span>
                    <span className="text-[13px] text-slate-400">
                      You can still edit and preview full 9:16 posts before connecting.
                    </span>
                  </div>
                  <a
                    href="/api/auth/facebook"
                    className="btn-primary shrink-0 text-[14px] h-10 px-5 gap-2 rounded-full shadow-glow-primary"
                  >
                    <span>Connect Instagram</span>
                  </a>
                </div>
              )}

              {account && (
                <Link
                  href="/account"
                  className="btn-secondary h-9 px-3.5 text-[13px] rounded-full self-end sm:self-auto"
                >
                  Change
                </Link>
              )}
            </div>

            {/* 2. Photos Section */}
            <div className="solid-card p-5 flex flex-col gap-4 shadow-apple-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-bold text-white">
                    Photos
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[12px] font-semibold text-slate-300 border border-white/10">
                    {slides.length} of 10
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[13px] text-[#00D2FF] font-semibold hover:text-[#00D2FF]/80 flex items-center gap-1 transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>{showUrlInput ? 'Hide URL' : 'Paste URL'}</span>
                  </button>
                  {slides.length > 0 && slides.length < 10 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[13px] text-[#00D2FF] font-semibold hover:text-[#00D2FF]/80 flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add files</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Paste Image URL Drawer */}
              {showUrlInput && (
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in duration-150">
                  <input
                    type="url"
                    value={inputImageUrl}
                    onChange={(e) => setInputImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-[14px] text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00D2FF] focus:ring-2 focus:ring-[#00D2FF]/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={isLoadingUrl || !inputImageUrl.trim()}
                    className="btn-primary text-[13px] h-10 px-5 shrink-0 rounded-full shadow-glow-primary font-bold"
                  >
                    {isLoadingUrl ? 'Loading...' : 'Add photo'}
                  </button>
                </div>
              )}

              {slides.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {/* Horizontal Thumbnails Strip */}
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
                    {slides.map((slide, idx) => (
                      <div
                        key={slide.id || idx}
                        className="relative w-24 h-24 shrink-0 rounded-2xl border border-white/15 bg-black/40 overflow-hidden shadow-apple-sm group transition-transform hover:scale-[1.02]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slide.previewUrl}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Slide order badge */}
                        <span className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold border border-white/10">
                          {idx + 1}
                        </span>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveSlide(slide.id)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center hover:bg-rose-600 transition-colors"
                          aria-label="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>

                        {/* Reorder controls on thumbnail */}
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveSlide(idx, 'left')}
                            className="w-5 h-5 rounded-md bg-black/70 backdrop-blur-sm text-white flex items-center justify-center disabled:opacity-20 active:scale-90 transition-all border border-white/10"
                            aria-label="Move left"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === slides.length - 1}
                            onClick={() => handleMoveSlide(idx, 'right')}
                            className="w-5 h-5 rounded-md bg-black/70 backdrop-blur-sm text-white flex items-center justify-center disabled:opacity-20 active:scale-90 transition-all border border-white/10"
                            aria-label="Move right"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Photos Tile at End */}
                    {slides.length < 10 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 shrink-0 rounded-2xl border-2 border-dashed border-white/20 hover:border-[#00D2FF]/60 bg-white/[0.03] hover:bg-[#00D2FF]/10 flex flex-col items-center justify-center gap-1.5 text-slate-300 hover:text-[#00D2FF] transition-all"
                      >
                        <Plus className="w-6 h-6" />
                        <span className="text-[11px] font-bold">Add photo</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[12px] text-slate-400 flex items-center gap-1">
                    <span>Use arrows on thumbnails to reorder slides.</span>
                  </p>
                </div>
              ) : (
                /* Empty Dropzone State */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-2xl border-2 border-dashed border-white/15 hover:border-[#00D2FF]/50 p-8 flex flex-col items-center justify-center text-center bg-white/[0.02] hover:bg-[#00D2FF]/5 cursor-pointer transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#00D2FF]/15 text-[#00D2FF] border border-[#00D2FF]/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,210,255,0.2)]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-[16px] font-bold text-white">
                    Add your photos to start
                  </p>
                  <p className="text-[14px] text-slate-400 mt-1 mb-4 max-w-xs">
                    Drop up to 10 photos, tap to browse, or paste an image link.
                  </p>
                  <div className="flex items-center gap-2.5 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="btn-primary text-[13px] h-10 px-5 rounded-full shadow-glow-primary"
                    >
                      Choose file
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUrlInput(true);
                      }}
                      className="btn-secondary text-[13px] h-10 px-5 rounded-full flex items-center gap-1.5"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Paste URL</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Post Shape Section */}
            <div className="solid-card p-5 flex flex-col gap-2 shadow-apple-sm">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold uppercase tracking-wider text-slate-400">
                  Post shape
                </span>
                <span className="text-[12px] text-slate-400">
                  Set by first slide
                </span>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="px-3.5 py-1.5 rounded-full bg-[#00D2FF]/15 border border-[#00D2FF]/40 text-[#00D2FF] font-bold text-[14px] flex items-center gap-2 shadow-[0_0_12px_rgba(0,210,255,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-[#00D2FF] shadow-[0_0_6px_#00d2ff]" />
                  <span>{postShapeText}</span>
                </div>
                <span className="text-[13px] text-slate-300">
                  (100% full vertical visibility on Instagram)
                </span>
              </div>
            </div>

            {/* 4. Caption Section */}
            <div className="solid-card p-5 flex flex-col gap-2.5 shadow-apple-sm">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="caption-input"
                  className="text-[15px] font-bold text-white"
                >
                  Caption
                </label>
                <span className="text-[12px] font-medium text-slate-400">
                  {caption.length} / 2,200
                </span>
              </div>

              <textarea
                id="caption-input"
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your caption with #hashtags..."
                maxLength={2200}
                className="w-full p-3.5 rounded-2xl border border-white/15 bg-black/40 text-[15px] text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00D2FF] focus:ring-2 focus:ring-[#00D2FF]/20 resize-y transition-all"
              />
            </div>

            {/* 5. Mobile Preview Post trigger */}
            <div className="lg:hidden flex flex-col">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="btn-secondary w-full justify-center gap-2 rounded-full h-12 shadow-sm"
              >
                <Eye className="w-4 h-4 text-[#00D2FF]" />
                <span className="font-semibold text-white">Preview post in full-screen phone</span>
              </button>
            </div>

            {/* Desktop Sticky Publish Bar */}
            <div className="hidden lg:flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn-secondary flex-1 justify-center rounded-full h-12"
              >
                Save draft
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || slides.length === 0}
                className="group/pub btn-primary flex-1 justify-center gap-2 rounded-full h-12 shadow-glow-primary text-[16px]"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing to Instagram...</span>
                  </>
                ) : (
                  <>
                    <span>Publish</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover/pub:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Preview Frame (Desktop right column / Mobile Preview tab) */}
          <div className={`lg:col-span-5 lg:sticky lg:top-20 flex flex-col gap-3 ${mobileTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex items-center justify-between px-1">
              <span className="text-[15px] font-bold text-white">
                Live preview
              </span>
              <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-full border border-white/10">
                <button
                  type="button"
                  onClick={() => setDesktopPreviewTab('feed')}
                  className={`px-3.5 py-1 text-[12px] rounded-full font-semibold transition-all ${
                    desktopPreviewTab === 'feed'
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Feed
                </button>
                <button
                  type="button"
                  onClick={() => setDesktopPreviewTab('grid')}
                  className={`px-3.5 py-1 text-[12px] rounded-full font-semibold transition-all ${
                    desktopPreviewTab === 'grid'
                      ? 'bg-white/15 text-white shadow-sm border border-white/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Profile grid
                </button>
              </div>
            </div>

            {/* Realistic iPhone Preview Frame */}
            <div className="w-full rounded-[28px] sm:rounded-[38px] p-2 sm:p-2.5 bg-gradient-to-b from-[#1E2038] via-slate-900 to-black shadow-apple-lg border sm:border-2 border-white/20 flex flex-col ring-2 sm:ring-8 ring-black/40 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,210,255,0.2)]">
              {/* Dynamic Island (Desktop/tablet only) */}
              <div className="hidden sm:flex w-20 h-4 rounded-full bg-black mx-auto mb-2 items-center justify-end px-2 shrink-0 border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00D2FF] shadow-[0_0_6px_#00d2ff]" />
              </div>

              {/* Screen Content */}
              <div className="w-full rounded-[28px] bg-black overflow-hidden flex flex-col border border-white/10 text-white">
                {desktopPreviewTab === 'feed' ? (
                  <div className="flex flex-col bg-black">
                    {/* Header */}
                    <div className="px-3.5 py-2.5 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00D2FF] via-[#7C3AED] to-[#EC4899] p-[1.5px]">
                          <div className="w-full h-full rounded-full bg-black p-[1px]">
                            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                              {account?.profilePictureUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={account.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                (account?.username || 'you').slice(0, 1).toUpperCase()
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="text-[13px] font-bold text-white">
                          {account?.username || 'your_account'}
                        </span>
                      </div>
                      <div className="flex gap-0.5 text-slate-400">
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                      </div>
                    </div>

                    {/* Viewport */}
                    <div className={`relative w-full ${containerAspectStyle} bg-black overflow-hidden flex items-center justify-center`}>
                      {slides.length > 0 ? (
                        <>
                          <div
                            className="flex w-full h-full transition-transform duration-300 ease-out"
                            style={{ transform: `translateX(-${activeSlideIndex * 100}%)` }}
                          >
                            {slides.map((s, idx) => (
                              <div key={s.id || idx} className="w-full h-full shrink-0 flex items-center justify-center bg-black">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={s.previewUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>

                          {slides.length > 1 && (
                            <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-full shadow-sm border border-white/10">
                              {activeSlideIndex + 1}/{slides.length}
                            </div>
                          )}

                          {activeSlideIndex > 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveSlideIndex((p) => p - 1)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center active:scale-90 transition-transform border border-white/10"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                          )}
                          {activeSlideIndex < slides.length - 1 && (
                            <button
                              type="button"
                              onClick={() => setActiveSlideIndex((p) => p + 1)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center active:scale-90 transition-transform border border-white/10"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="text-slate-500 text-[13px]">Add a photo to see preview</div>
                      )}
                    </div>

                    {/* Actions & Caption */}
                    <div className="px-3.5 pt-2.5 pb-3 flex flex-col gap-2 bg-black">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          <Heart className="w-5 h-5 text-white" />
                          <MessageCircle className="w-5 h-5 text-white" />
                          <Send className="w-5 h-5 text-white" />
                        </div>
                        {slides.length > 1 && (
                          <div className="flex items-center gap-1">
                            {slides.map((_, idx) => (
                              <span
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  idx === activeSlideIndex ? 'bg-[#00D2FF] w-3 shadow-[0_0_6px_#00d2ff]' : 'bg-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <Bookmark className="w-5 h-5 text-white" />
                      </div>

                      <div className="text-[13px] text-slate-200 leading-snug break-words">
                        <span className="font-bold mr-1.5 text-white">{account?.username || 'your_account'}</span>
                        {caption || <span className="text-slate-500 italic">No caption yet...</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Profile Grid */
                  <div className="p-3.5 flex flex-col gap-3 bg-black">
                    <div className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
                      Grid View (Center Square)
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="aspect-square bg-slate-900 rounded-md border border-white/5" />
                      <div className="aspect-square bg-slate-800 rounded-md border border-white/5" />
                      <div className="aspect-square bg-slate-900 rounded-md border border-white/5" />
                      <div className="aspect-square bg-black rounded-md overflow-hidden relative ring-2 ring-[#00D2FF] shadow-[0_0_15px_rgba(0,210,255,0.4)]">
                        {slides[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={slides[0].previewUrl} alt="" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div className="aspect-square bg-slate-800 rounded-md border border-white/5" />
                      <div className="aspect-square bg-slate-900 rounded-md border border-white/5" />
                    </div>
                    <p className="text-[11px] text-slate-400 text-center">
                      Grid always displays the center 1:1 square.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Unified Action Dock (Clean, single dock, above safe area) */}
      <div className="lg:hidden fixed bottom-3 sm:bottom-4 left-0 right-0 z-30 px-3 pointer-events-none">
        <div className="max-w-md mx-auto glass-surface p-1.5 sm:p-2 flex items-center justify-between gap-2 shadow-apple-lg border border-white/20 rounded-full pointer-events-auto">
          {/* Quick Preview / Edit Switcher */}
          <button
            type="button"
            onClick={() => setMobileTab(mobileTab === 'edit' ? 'preview' : 'edit')}
            className="btn-secondary h-11 px-3.5 text-[13px] gap-1.5 rounded-full flex items-center shrink-0"
          >
            {mobileTab === 'edit' ? (
              <>
                <Eye className="w-4 h-4 text-[#00D2FF]" />
                <span className="font-semibold text-white">Preview</span>
                {slides.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] text-[10px] font-black flex items-center justify-center">
                    {slides.length}
                  </span>
                )}
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 text-[#00D2FF]" />
                <span className="font-semibold text-white">Edit</span>
              </>
            )}
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={handleSaveDraft}
            className="btn-secondary h-11 px-3 text-[13px] rounded-full font-medium shrink-0"
          >
            Save
          </button>

          {/* Publish Button */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing || slides.length === 0}
            className="group/pub btn-primary flex-1 h-11 px-4 text-[14px] gap-1.5 rounded-full shadow-glow-primary font-bold justify-center"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Publish</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover/pub:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Full-Screen Preview Modal */}
      <PhonePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        slides={slides}
        caption={caption}
        username={account?.username}
        avatarUrl={account?.profilePictureUrl}
      />
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] flex items-center justify-center text-[15px] text-slate-500">Loading editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
