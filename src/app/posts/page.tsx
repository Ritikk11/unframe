'use client';

import React, { useState, useEffect } from 'react';
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

  const openPostModal = (post: InstagramPost) => {
    setViewingPost(post);
    setModalSlideIndex(0);
  };

  const closePostModal = () => {
    setViewingPost(null);
    setModalSlideIndex(0);
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!viewingPost) return;
      if (e.key === 'Escape') closePostModal();
      if (e.key === 'ArrowLeft') {
        const total = viewingPost.children && viewingPost.children.length > 0 ? viewingPost.children.length : 1;
        setModalSlideIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
      }
      if (e.key === 'ArrowRight') {
        const total = viewingPost.children && viewingPost.children.length > 0 ? viewingPost.children.length : 1;
        setModalSlideIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewingPost]);

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
    <div className="min-h-[100dvh] flex flex-col pb-24 md:pb-8 text-white">
      <Navbar connectedUsername={selectedAccount?.username} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        {/* Header with Account Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] md:text-[34px] font-bold text-white tracking-tight flex items-center gap-3">
              <span>Instagram posts</span>
              <span className="text-[13px] font-semibold px-3 py-1 rounded-full bg-white/10 text-slate-300 border border-white/15">
                View only
              </span>
            </h1>
            <p className="text-[15px] text-slate-400 mt-1">
              Browse published feed photos and carousels across your connected accounts.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            {accounts.length > 1 && (
              <div className="flex items-center gap-2 p-1 rounded-full bg-white/[0.06] border border-white/15 shadow-apple-sm">
                {accounts.map((acc) => {
                  const isActive = selectedAccount?.id === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleAccountChange(acc)}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#00D2FF]/20 to-[#7C3AED]/20 text-white border border-[#00D2FF]/40 shadow-sm'
                          : 'text-slate-400 hover:text-white'
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
              className="btn-secondary h-10 w-10 p-0 rounded-full shrink-0 flex items-center justify-center text-slate-300 hover:text-white"
              title="Refresh posts"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00D2FF]' : ''}`} />
            </button>

            <Link
              href="/editor"
              className="btn-primary text-[14px] h-10 px-5 gap-2 rounded-full shadow-glow-primary font-bold shrink-0 hidden sm:inline-flex"
            >
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </Link>
          </div>
        </div>

        {/* Selected Account Profile Bar */}
        {selectedAccount && (
          <div className="solid-card p-4 mb-6 flex items-center justify-between gap-4 border border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00D2FF] via-[#7C3AED] to-[#EC4899] p-[2px] shrink-0">
                <div className="w-full h-full rounded-full bg-black p-[1px]">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[13px] font-bold text-white overflow-hidden">
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
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-white">@{selectedAccount.username}</span>
                  <span className="text-[12px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
                    Live Feed
                  </span>
                </div>
                <span className="text-[12px] text-slate-400">
                  {posts.length} {posts.length === 1 ? 'post' : 'posts'} loaded • {selectedAccount.pageName || 'Facebook Page linked'}
                </span>
              </div>
            </div>

            <a
              href={`https://instagram.com/${selectedAccount.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary h-8 px-3 text-[12px] rounded-full text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <span>Instagram Profile</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Error notification if any */}
        {errorMsg && (
          <div className="solid-card p-4 mb-6 bg-rose-950/70 border border-rose-500/40 text-rose-200 text-[14px]">
            {errorMsg}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="solid-card aspect-[4/5] bg-white/[0.03] rounded-2xl border border-white/10" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          /* Posts Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {posts.map((post) => {
              const isCarousel = post.mediaType === 'CAROUSEL_ALBUM' || (post.children && post.children.length > 0);
              const slidesCount = post.children && post.children.length > 0 ? post.children.length : 1;

              return (
                <div
                  key={post.id}
                  onClick={() => openPostModal(post)}
                  className="solid-card overflow-hidden flex flex-col relative group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-[#00D2FF]/50 shadow-apple"
                >
                  {/* Photo Thumbnail */}
                  <div className="w-full aspect-[4/5] bg-black/80 relative overflow-hidden">
                    {post.mediaUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.mediaUrl}
                        alt={post.caption || 'Instagram post'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-[13px]">
                        No image
                      </div>
                    )}

                    {/* Gradient Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5">
                      <div className="flex items-center justify-end">
                        <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-md text-white shadow-sm">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-white text-[13px] font-bold">
                        {post.likeCount !== undefined && post.likeCount > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Heart className="w-4 h-4 fill-white" />
                            {post.likeCount}
                          </span>
                        )}
                        {post.commentsCount !== undefined && post.commentsCount > 0 && (
                          <span className="flex items-center gap-1.5">
                            <MessageCircle className="w-4 h-4 fill-white" />
                            {post.commentsCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Carousel Indicator Badge */}
                    {isCarousel && (
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-bold border border-white/15 flex items-center gap-1.5 shadow-sm">
                        <Layers className="w-3 h-3 text-[#00D2FF]" />
                        <span>{slidesCount}</span>
                      </div>
                    )}

                    {/* Date Badge */}
                    {post.timestamp && (
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-slate-300 text-[10px] font-medium border border-white/10">
                        {formatDate(post.timestamp)}
                      </div>
                    )}
                  </div>

                  {/* Caption preview footer */}
                  <div className="p-3 flex flex-col gap-1 border-t border-white/10 bg-white/[0.02]">
                    <p className="text-[12px] text-slate-300 line-clamp-2 leading-relaxed">
                      {post.caption || <span className="text-slate-500 italic">No caption</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="solid-card p-12 flex flex-col items-center justify-center text-center gap-4 my-8 border border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-[#00D2FF]/15 border border-[#00D2FF]/30 text-[#00D2FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,210,255,0.25)]">
              <ImageIcon className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h2 className="text-[20px] font-bold text-white">No published posts found</h2>
              <p className="text-[15px] text-slate-400 leading-relaxed">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={closePostModal}
        >
          <div
            className="solid-card max-w-3xl w-full max-h-[90vh] overflow-hidden rounded-3xl border border-white/20 shadow-2xl flex flex-col md:flex-row bg-[#0b0c16]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Media Display (Supports Carousel slide navigation) */}
            <div className="md:w-[58%] aspect-[4/5] md:aspect-auto md:min-h-[460px] bg-black relative flex items-center justify-center overflow-hidden">
              {(() => {
                const slides =
                  viewingPost.children && viewingPost.children.length > 0
                    ? viewingPost.children
                    : [{ id: viewingPost.id, mediaUrl: viewingPost.mediaUrl, mediaType: viewingPost.mediaType }];
                const currentSlide = slides[modalSlideIndex] || slides[0];

                return (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentSlide.mediaUrl}
                      alt="Instagram media"
                      className="w-full h-full object-contain max-h-[75vh]"
                    />

                    {/* Carousel navigation arrows */}
                    {slides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setModalSlideIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-md transition-all"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalSlideIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-md transition-all"
                          aria-label="Next slide"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Slide Counter Dots */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/10">
                          {slides.map((_, idx) => (
                            <span
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                idx === modalSlideIndex ? 'bg-[#00D2FF] w-3' : 'bg-white/40'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Right: Post Details (View Only, No Changes) */}
            <div className="md:w-[42%] p-5 sm:p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 bg-white/[0.02]">
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[40vh] md:max-h-[55vh] pr-1">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00D2FF] via-[#7C3AED] to-[#EC4899] p-[1.5px] shrink-0">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[12px] font-bold text-white overflow-hidden">
                        {selectedAccount?.profilePictureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={selectedAccount.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (selectedAccount?.username || 'U').slice(0, 1).toUpperCase()
                        )}
                      </div>
                    </div>
                    <span className="text-[14px] font-bold text-white">@{selectedAccount?.username}</span>
                  </div>
                  <button
                    type="button"
                    onClick={closePostModal}
                    className="w-8 h-8 rounded-full text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Date & Type Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  {viewingPost.timestamp && (
                    <span className="text-[12px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(viewingPost.timestamp)}
                    </span>
                  )}
                  {viewingPost.children && viewingPost.children.length > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#00D2FF]/15 text-[#00D2FF] font-semibold border border-[#00D2FF]/30">
                      {viewingPost.children.length} Slides Carousel
                    </span>
                  )}
                </div>

                {/* Caption Full View */}
                <div className="text-[13px] text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {viewingPost.caption || <span className="text-slate-500 italic">No caption provided.</span>}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  View-Only Mode
                </span>

                {viewingPost.permalink ? (
                  <a
                    href={viewingPost.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary h-9 px-4 text-[12px] rounded-full gap-1.5 shadow-sm font-semibold"
                  >
                    <span>View on Instagram</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={closePostModal}
                    className="btn-secondary h-9 px-4 text-[12px] rounded-full"
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
