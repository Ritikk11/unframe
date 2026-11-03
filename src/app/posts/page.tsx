'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomTabBar from '@/components/BottomTabBar';
import { Plus, Image as ImageIcon, MoreHorizontal, ExternalLink, Copy, Edit } from 'lucide-react';

interface PostRecord {
  id: string;
  coverUrl?: string;
  slidesCount: number;
  aspectRatio: string;
  date: string;
  status: 'Published' | 'Draft';
  permalink?: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const published = JSON.parse(localStorage.getItem('ps_published_posts') || '[]');
      const drafts = JSON.parse(localStorage.getItem('ps_drafts') || '[]');
      
      const formattedDrafts: PostRecord[] = drafts.map((d: any) => ({
        id: d.id,
        coverUrl: d.slides?.[0]?.previewUrl,
        slidesCount: d.slides?.length || 0,
        aspectRatio: d.aspectRatio || '9:16',
        date: 'Draft',
        status: 'Draft',
      }));

      setPosts([...published, ...formattedDrafts]);
    } catch {}
  }, []);

  const handleDuplicate = (post: PostRecord) => {
    const duplicated: PostRecord = {
      ...post,
      id: `post_${Date.now()}`,
      date: 'Just now',
      status: 'Draft',
    };
    const nextPosts = [duplicated, ...posts];
    setPosts(nextPosts);
    try {
      const drafts = JSON.parse(localStorage.getItem('ps_drafts') || '[]');
      drafts.unshift(duplicated);
      localStorage.setItem('ps_drafts', JSON.stringify(drafts));
    } catch {}
    setActiveMenuId(null);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col pb-24 md:pb-8 text-white">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        {/* Title & Subtext */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] md:text-[34px] font-bold text-white tracking-tight">
              Your posts
            </h1>
            <p className="text-[15px] text-slate-400 mt-1">
              Published full-screen posts and drafts.
            </p>
          </div>

          <Link href="/editor" className="group/btn btn-primary text-[14px] h-11 px-6 gap-2 rounded-full shadow-glow-primary font-bold">
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover/btn:rotate-90" />
            <span>Create a post</span>
          </Link>
        </div>

        {/* Posts Grid: 2 columns on phones, 3 columns on >=768px */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="solid-card overflow-hidden flex flex-col relative group transition-all duration-200 hover:-translate-y-1 hover:border-[#00D2FF]/50 shadow-apple"
              >
                {/* Photo Thumbnail */}
                <div className="w-full aspect-[4/5] bg-black/60 relative overflow-hidden">
                  {post.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-[13px]">
                      No photo
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    {post.status === 'Published' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/80 backdrop-blur-md text-white text-[11px] font-bold shadow-sm border border-emerald-400/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_6px_#6ee7b7]" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/80 backdrop-blur-md text-white text-[11px] font-bold shadow-sm border border-amber-400/40">
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Slides count badge */}
                  {post.slidesCount > 1 && (
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                      {post.slidesCount} slides
                    </div>
                  )}
                </div>

                {/* Card Footer Info */}
                <div className="p-3.5 flex items-center justify-between gap-2 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-white">
                      {post.aspectRatio || '9:16'}
                    </span>
                    <span className="text-[12px] text-slate-400">
                      {post.date}
                    </span>
                  </div>

                  {/* Action Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      aria-label="Options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {activeMenuId === post.id && (
                      <div className="absolute right-0 bottom-full mb-1.5 w-36 glass-surface p-1 shadow-apple-lg border border-white/20 bg-[#0e1022]/95 z-20 flex flex-col gap-0.5 text-[13px] rounded-xl animate-in fade-in duration-150">
                        <Link
                          href="/editor"
                          className="px-3 py-1.5 rounded-lg text-slate-200 hover:bg-white/10 hover:text-white flex items-center gap-2 font-medium"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Open</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(post)}
                          className="px-3 py-1.5 rounded-lg text-slate-200 hover:bg-white/10 hover:text-white text-left flex items-center gap-2 font-medium"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Duplicate</span>
                        </button>
                        {post.permalink && (
                          <a
                            href={post.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-[#00D2FF] hover:bg-[#00D2FF]/10 flex items-center gap-2 font-medium"
                            onClick={() => setActiveMenuId(null)}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Instagram</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="solid-card p-12 flex flex-col items-center justify-center text-center gap-4 my-8 border border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-[#00D2FF]/15 border border-[#00D2FF]/30 text-[#00D2FF] flex items-center justify-center shadow-[0_0_20px_rgba(0,210,255,0.25)]">
              <ImageIcon className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h2 className="text-[20px] font-bold text-white">
                No posts yet
              </h2>
              <p className="text-[15px] text-slate-400 leading-relaxed">
                Your published full-screen posts and drafts will show up here.
              </p>
            </div>
            <Link href="/editor" className="group/btn btn-primary text-[14px] h-11 px-7 mt-2 gap-2 rounded-full shadow-glow-primary font-bold">
              <Plus className="w-4 h-4 transition-transform duration-200 group-hover/btn:rotate-90" />
              <span>Create a post</span>
            </Link>
          </div>
        )}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
      <BottomTabBar />
    </div>
  );
}
