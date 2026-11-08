'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sparkles, User } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface NavbarProps {
  connectedUsername?: string;
  onConnect?: () => void;
}

export default function Navbar({ connectedUsername, onConnect }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(connectedUsername || null);

  useEffect(() => {
    if (connectedUsername) {
      setUsername(connectedUsername);
      return;
    }
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.isLive && data.accounts?.length > 0) {
          setUsername(data.accounts[0].username);
        }
      })
      .catch(() => {});
  }, [connectedUsername]);

  const navLinks = [
    { href: '/editor', label: 'Editor' },
    { href: '/posts', label: 'Posts' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/help', label: 'Help' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-3 pb-2 transition-all">
      <div className="max-w-5xl mx-auto">
        <nav className="glass-surface px-4 sm:px-5 py-2.5 flex items-center justify-between rounded-full border border-white/10 shadow-apple">
          {/* Logo with Gradient Brand Icon */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[18px] sm:text-[19px] font-bold tracking-tight text-white group"
            onClick={() => setIsOpen(false)}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00D2FF] via-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shadow-md text-white group-hover:scale-105 transition-transform duration-200">
              <span className="text-[14px] font-black tracking-tight">U</span>
            </div>
            <span className="font-heading font-black text-[19px] tracking-tight text-white">
              {APP_CONFIG.name}
            </span>
          </Link>

          {/* Desktop Links (768px and up) */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === '/editor' && pathname === '/studio');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-white/12 text-white shadow-sm font-semibold border border-white/15'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Action */}
          <div className="hidden md:flex items-center gap-3">
            {username ? (
              <Link
                href="/account"
                className="btn-secondary h-10 px-4 text-[14px] gap-2 rounded-full"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="font-medium text-white">@{username}</span>
              </Link>
            ) : onConnect ? (
              <button
                type="button"
                onClick={onConnect}
                className="btn-primary h-10 px-5 text-[14px] gap-2 rounded-full shadow-glow-primary"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Connect Instagram</span>
              </button>
            ) : (
              <a
                href="/api/auth/instagram"
                className="btn-primary h-10 px-5 text-[14px] gap-2 rounded-full shadow-glow-primary bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:opacity-95"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Connect Instagram</span>
              </a>
            )}
          </div>

          {/* Phone Menu Toggle (< 768px) */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-slate-200 hover:bg-white/10 active:scale-95 transition-all"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </nav>

        {/* Phone Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden mt-2 glass-surface p-3 flex flex-col gap-1.5 rounded-2xl border border-white/10 shadow-apple-md animate-in fade-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === '/editor' && pathname === '/studio');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`py-2.5 px-3.5 rounded-xl text-[15px] font-medium transition-all ${
                    isActive
                      ? 'bg-white/12 text-white font-semibold border border-white/15'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-white/10 mt-1">
              {username ? (
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary w-full justify-center h-11 text-[14px] gap-2 rounded-full"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span>Account (@{username})</span>
                </Link>
              ) : onConnect ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onConnect();
                  }}
                  className="btn-primary w-full justify-center h-11 text-[14px] gap-2 rounded-full"
                >
                  <InstagramIcon className="w-4 h-4" />
                  <span>Connect Instagram</span>
                </button>
              ) : (
                <a
                  href="/api/auth/instagram"
                  className="btn-primary w-full justify-center h-11 text-[14px] gap-2 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:opacity-95"
                >
                  <InstagramIcon className="w-4 h-4" />
                  <span>Connect Instagram</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
