'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomTabBar from '@/components/BottomTabBar';
import { InstagramPost, InstagramAccount } from '@/types';
import {
  Plus,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Calendar,
  Play,
  Music,
  Info,
} from 'lucide-react';

export default function PostsPage() {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InstagramAccount | null>(null);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // View-Only Modal State
  const [viewingPost, setViewingPost] = useState<InstagramPost | null>(null);
  const [modalSlideIndex, setModalSlideIndex] = useState(0);
  const [modalSlides, setModalSlides] = useState<{ id: string; mediaType: string; mediaUrl: string }[]>([]);
  const [isLoadingSlides, setIsLoadingSlides] = useState(false);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);

  // Load accounts and initial posts
  const loadPosts = async (targetAccountId?: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const url = targetAccountId ? `/api/posts?accountId=${targetAccountId}` : '/api/posts';
      const res = await fetch(url);
      const data = await res.json();

      if (data.accounts?.length > 0) {
        setAccounts(data.accounts);
      }

      if (data.currentAccount) {
        setSelectedAccount(data.currentAccount);
      }

      if (data.posts) {
        setPosts(data.posts);
      } else if (data.error) {
        setErrorMsg(data.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load posts';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleAccountChange = (acc: InstagramAccount) => {
    setSelectedAccount(acc);
    loadPosts(acc.id);
  };

  // Open modal and ensure all carousel slides are loaded
  const openPostModal = async (post: InstagramPost) => {
    setViewingPost(post);
    setModalSlideIndex(0);

    const initialSlides =
      post.children && post.children.length > 0
        ? post.children
        : [{ id: post.id, mediaUrl: post.mediaUrl, mediaType: post.mediaType }];
    setModalSlides(initialSlides);

    // If it's a carousel but children array had only 1 or 0 items, dynamically fetch full list
    if (post.mediaType === 'CAROUSEL_ALBUM' && (!post.children || post.children.length <= 1)) {
      setIsLoadingSlides(true);
      try {
        const res = await fetch(`/api/posts?accountId=${selectedAccount?.id}&mediaId=${post.id}`);
        const data = await res.json();
        if (data.success && data.children?.length > 0) {
          setModalSlides(data.children);
        }
      } catch {
        // keep initial slides
      } finally {
        setIsLoadingSlides(false);
      }
    }
  };

  const closePostModal = () => {
    setViewingPost(null);
    setModalSlideIndex(0);
    setModalSlides([]);
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!viewingPost) return;
      if (e.key === 'Escape') closePostModal();
      if (e.key === 'ArrowLeft') {
        const total = modalSlides.length > 0 ? modalSlides.length : 1;
        setModalSlideIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
      }
      if (e.key === 'ArrowRight') {
        const total = modalSlides.length > 0 ? modalSlides.length : 1;
        setModalSlideIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingPost, modalSlides]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || modalSlides.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swipe Left -> Next
        setModalSlideIndex((prev) => (prev < modalSlides.length - 1 ? prev + 1 : 0));
      } else {
        // Swipe Right -> Prev
        setModalSlideIndex((prev) => (prev > 0 ? prev - 1 : modalSlides.length - 1));
      }
    }
    touchStartX.current = null;
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col pb-24 md:pb-8 text-white bg-[#06070d]">
      <Navbar connectedUsername={selectedAccount?.username} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        {/* Header with Account Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] md:text-[34px] font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Instagram Posts</span>
              <span className="text-[12px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-cyan-500/15 text-[#00D2FF] border border-[#00D2FF]/30">
                View Only
              </span>
            </h1>
            <p className="text-[15px] text-slate-300 mt-1">
              Browse and inspect all published feed photos, carousels, and captions.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto flex-wrap">
            {accounts.length > 1 && (
              <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.08] border border-white/20 shadow-apple-sm">
                {accounts.map((acc) => {
                  const isActive = selectedAccount?.id === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleAccountChange(acc)}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#00D2FF] to-[#7C3AED] text-white shadow-glow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>@{acc.username}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={() => loadPosts(selectedAccount?.id)}
              disabled={isLoading}
              className="btn-secondary h-10 w-10 p-0 rounded-full shrink-0 flex items-center justify-center text-white hover:text-[#00D2FF] border border-white/20"
              title="Refresh posts"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00D2FF]' : ''}`} />
            </button>

            <Link
              href="/editor"
              className="btn-primary text-[14px] h-10 px-5 gap-2 rounded-full shadow-glow-primary font-bold shrink-0 hidden sm:inline-flex"
            >
              <Plus className="w-4 h-4" />
              <span>New 9:16 Post</span>
            </Link>
          </div>
        </div>

        {/* Selected Account Profile Bar */}
        {selectedAccount && (
          <div className="solid-card p-4 sm:p-5 mb-6 flex items-center justify-between gap-4 border border-white/15 bg-white/[0.04] shadow-apple-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00D2FF] via-[#7C3AED] to-[#EC4899] p-[2px] shrink-0">
                <div className="w-full h-full rounded-full bg-black p-[1px]">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[15px] font-extrabold text-white overflow-hidden">
                    {selectedAccount.profilePictureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedAccount.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      selectedAccount.username.slice(0, 1).toUpperCase()
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2.5">
                  <span className="text-[17px] font-bold text-white tracking-tight">@{selectedAccount.username}</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    Live Feed
                  </span>
                </div>
                <span className="text-[13px] text-slate-300 font-medium">
                  {posts.length} {posts.length === 1 ? 'post' : 'posts'} • Linked Page: {selectedAccount.pageName || 'Facebook Page'}
                </span>
              </div>
            </div>

            <a
              href={`https://instagram.com/${selectedAccount.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary h-9 px-4 text-[13px] rounded-full text-white hover:text-[#00D2FF] border border-white/20 flex items-center gap-1.5 font-semibold"
            >
              <span>View Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {/* Music Notice Pill Banner */}
        <div className="p-3.5 mb-6 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30 flex items-start gap-3 text-[13px] text-blue-200">
          <Music className="w-4 h-4 text-[#00D2FF] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-white">Adding Music to Posts:</span>
            <span className="text-slate-300">
              Meta does not allow third-party apps to attach commercial music to photo carousels via API (music is exclusive to Reels or direct app posting). To use trending music with 9:16 portrait carousels, you can download your uncropped 9:16 slides from the Editor and tap the 🎵 Music icon inside Instagram!
            </span>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div className="solid-card p-4 mb-6 bg-rose-950/80 border border-rose-500/50 text-rose-100 text-[14px] font-medium">
            {errorMsg}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="solid-card aspect-[4/5] bg-white/[0.04] rounded-2xl border border-white/10" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          /* Posts Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {posts.map((post) => {
              const isCarousel = post.mediaType === 'CAROUSEL_ALBUM' || (post.children && post.children.length > 0);
              const slidesCount = post.children && post.children.length > 0 ? post.children.length : (isCarousel ? 2 : 1);

              return (
                <div
                  key={post.id}
                  onClick={() => openPostModal(post)}
                  className="solid-card overflow-hidden flex flex-col relative group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#00D2FF]/60 shadow-apple border border-white/15"
                >
                  {/* Photo Thumbnail */}
                  <div className="w-full aspect-[4/5] bg-black relative overflow-hidden">
                    {post.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.mediaUrl}
                        alt={post.caption || 'Instagram post'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-[13px] font-medium">
                        No image preview
                      </div>
                    )}

                    {/* Gradient Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5">
                      <div className="flex items-center justify-end">
                        <span className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white shadow-md">
                          <ExternalLink className="w-4 h-4" />
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-white text-[13px] font-bold">
                        {post.likeCount !== undefined && post.likeCount > 0 && (
                          <span className="flex items-center gap-1.5 drop-shadow-md">
                            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                            {post.likeCount}
                          </span>
                        )}
                        {post.commentsCount !== undefined && post.commentsCount > 0 && (
                          <span className="flex items-center gap-1.5 drop-shadow-md">
                            <MessageCircle className="w-4 h-4 fill-white text-white" />
                            {post.commentsCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Carousel Indicator Badge */}
                    {isCarousel && (
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md text-white text-[11px] font-extrabold border border-white/20 flex items-center gap-1.5 shadow-md">
                        <Layers className="w-3.5 h-3.5 text-[#00D2FF]" />
                        <span>{slidesCount} Slides</span>
                      </div>
                    )}

                    {/* Video Badge */}
                    {post.mediaType === 'VIDEO' && (
                      <div className="absolute top-2.5 left-2.5 p-1.5 rounded-full bg-black/85 backdrop-blur-md text-white border border-white/20 shadow-md">
                        <Play className="w-3 h-3 fill-white" />
                      </div>
                    )}

                    {/* Date Badge */}
                    {post.timestamp && (
                      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20">
                        {formatDate(post.timestamp)}
                      </div>
                    )}
                  </div>

                  {/* Caption preview footer */}
                  <div className="p-3.5 flex flex-col gap-1 border-t border-white/15 bg-white/[0.04]">
                    <p className="text-[13px] text-slate-100 font-medium line-clamp-2 leading-relaxed">
                      {post.caption || <span className="text-slate-400 italic font-normal">No caption</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="solid-card p-12 flex flex-col items-center justify-center text-center gap-4 my-8 border border-white/15">
            <div className="w-16 h-16 rounded-2xl bg-[#00D2FF]/15 border border-[#00D2FF]/30 text-[#00D2FF] flex items-center justify-center shadow-[0_0_24px_rgba(0,210,255,0.25)]">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div className="flex flex-col gap-1.5 max-w-sm">
              <h2 className="text-[22px] font-bold text-white">No published posts found</h2>
              <p className="text-[15px] text-slate-300 leading-relaxed">
                Posts published to this Instagram account will appear here for you to view in full resolution.
              </p>
            </div>
            <Link
              href="/editor"
              className="group/btn btn-primary text-[14px] h-11 px-7 mt-2 gap-2 rounded-full shadow-glow-primary font-bold"
            >
              <Plus className="w-4 h-4 transition-transform duration-200 group-hover/btn:rotate-90" />
              <span>Create a post</span>
            </Link>
          </div>
        )}
      </main>

      {/* VIEW-ONLY POST MODAL (NO CHANGES) */}
      {viewingPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200"
          onClick={closePostModal}
        >
          <div
            className="solid-card max-w-4xl w-full max-h-[92vh] overflow-hidden rounded-3xl border border-white/25 shadow-2xl flex flex-col md:flex-row bg-[#0c0d18]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Media Display (Supports Carousel slide navigation & touch swipes) */}
            <div
              className="md:w-[60%] aspect-[4/5] md:aspect-auto md:min-h-[480px] bg-black relative flex items-center justify-center overflow-hidden select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {(() => {
                const currentSlide = modalSlides[modalSlideIndex] || modalSlides[0] || {
                  id: viewingPost.id,
                  mediaUrl: viewingPost.mediaUrl,
                  mediaType: viewingPost.mediaType,
                };

                return (
                  <>
                    {currentSlide.mediaType === 'VIDEO' ? (
                      <video
                        src={currentSlide.mediaUrl}
                        controls
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-contain max-h-[75vh]"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentSlide.mediaUrl}
                        alt="Instagram media"
                        className="w-full h-full object-contain max-h-[75vh]"
                      />
                    )}

                    {/* Carousel navigation arrows */}
                    {modalSlides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalSlideIndex((prev) => (prev > 0 ? prev - 1 : modalSlides.length - 1));
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg transition-all active:scale-95"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalSlideIndex((prev) => (prev < modalSlides.length - 1 ? prev + 1 : 0));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg transition-all active:scale-95"
                          aria-label="Next slide"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Top Slide Counter Pill */}
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[12px] font-extrabold border border-white/20 shadow-md">
                          {modalSlideIndex + 1} / {modalSlides.length}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}

              {/* Bottom Thumbnail Strip for Carousels */}
              {modalSlides.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 max-w-[90%] overflow-x-auto">
                  {modalSlides.map((slide, idx) => (
                    <button
                      key={slide.id || idx}
                      type="button"
                      onClick={() => setModalSlideIndex(idx)}
                      className={`relative w-8 h-10 rounded-lg overflow-hidden shrink-0 border transition-all ${
                        idx === modalSlideIndex
                          ? 'border-[#00D2FF] ring-2 ring-[#00D2FF]/50 scale-105'
                          : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slide.mediaUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Post Details (View Only, High Contrast Text) */}
            <div className="md:w-[40%] p-5 sm:p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/15 bg-white/[0.03]">
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[42vh] md:max-h-[58vh] pr-1">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/15">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00D2FF] via-[#7C3AED] to-[#EC4899] p-[2px] shrink-0">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[13px] font-bold text-white overflow-hidden">
                        {selectedAccount?.profilePictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={selectedAccount.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (selectedAccount?.username || 'U').slice(0, 1).toUpperCase()
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-bold text-white">@{selectedAccount?.username}</span>
                      <span className="text-[12px] text-slate-300">Instagram Feed Post</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closePostModal}
                    className="w-9 h-9 rounded-full text-slate-300 hover:text-white hover:bg-white/15 flex items-center justify-center transition-colors border border-white/15"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Date & Carousel Info */}
                <div className="flex items-center gap-2 flex-wrap">
                  {viewingPost.timestamp && (
                    <span className="text-[13px] text-slate-200 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-4 h-4 text-[#00D2FF]" />
                      {formatDate(viewingPost.timestamp)}
                    </span>
                  )}
                  {modalSlides.length > 1 && (
                    <span className="text-[12px] px-2.5 py-0.5 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] font-bold border border-[#00D2FF]/40">
                      {modalSlides.length} Carousel Slides
                    </span>
                  )}
                </div>

                {/* Caption Full View with High Contrast */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-bold text-slate-300 uppercase tracking-wider">Caption</span>
                  <div className="text-[14px] text-white leading-relaxed whitespace-pre-wrap font-normal p-3.5 rounded-2xl bg-black/40 border border-white/10 select-text">
                    {viewingPost.caption || <span className="text-slate-400 italic">No caption provided.</span>}
                  </div>
                </div>

                {/* Engagement Metrics */}
                {(viewingPost.likeCount !== undefined || viewingPost.commentsCount !== undefined) && (
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-[13px] font-bold">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      {viewingPost.likeCount || 0} Likes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 fill-white text-white" />
                      {viewingPost.commentsCount || 0} Comments
                    </span>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 mt-4 border-t border-white/15 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-300 uppercase tracking-wider font-bold">
                  View-Only Mode
                </span>

                {viewingPost.permalink ? (
                  <a
                    href={viewingPost.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary h-10 px-5 text-[13px] rounded-full gap-2 shadow-glow-primary font-bold"
                  >
                    <span>View on Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={closePostModal}
                    className="btn-secondary h-10 px-5 text-[13px] rounded-full font-semibold"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomTabBar />
    </div>
  );
}
