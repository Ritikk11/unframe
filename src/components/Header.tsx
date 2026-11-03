'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { InstagramAccount } from '@/types';
import { LogOut, ChevronDown, Check, ArrowUpRight, Settings, Sun, Moon, ArrowRight } from 'lucide-react';

interface HeaderProps {
  accounts?: InstagramAccount[];
  selectedAccount?: InstagramAccount;
  onSelectAccount?: (account: InstagramAccount) => void;
  isLive?: boolean;
  isConfigured?: boolean;
  theme?: 'light' | 'dark' | 'system';
  onQuickToggleTheme?: () => void;
  onOpenSettings?: () => void;
  onOpenSetupGuide?: () => void;
  onDisconnect?: () => void;
}

const NAV_LINKS = [
  { href: '/studio', label: 'Studio' },
  { href: '/history', label: 'History' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/guide', label: 'Guide' },
];

export default function Header({
  accounts = [],
  selectedAccount,
  onSelectAccount,
  isLive = false,
  theme = 'light',
  onQuickToggleTheme,
  onOpenSettings,
  onDisconnect,
}: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 px-4 sm:px-6 pt-3 pb-2 anim-fade-in-up">
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel rounded-2xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 press cursor-pointer">
              <div className="w-8 h-8 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs tracking-tight shadow-xs">
                PS
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-xs sm:text-sm tracking-tight text-zinc-900 dark:text-white">
                  PromptStudio
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium hidden sm:block">
                  Carousel Publisher
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-black/5 dark:border-white/10">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all press cursor-pointer ${
                      isActive
                        ? 'bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-white font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Account Selector (if present) */}
            {accounts.length > 0 && selectedAccount && onSelectAccount ? (
              <div className="relative group">
                <button className="flex items-center gap-2 glass-pill hover:bg-black/5 dark:hover:bg-white/[0.08] rounded-full pl-1.5 pr-3 py-1 text-xs text-zinc-800 dark:text-zinc-200 press cursor-pointer">
                  {selectedAccount.profilePictureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedAccount.profilePictureUrl}
                      alt={selectedAccount.username}
                      className="w-5 h-5 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/15"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-medium text-zinc-800 dark:text-zinc-300">
                      {selectedAccount.username.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium max-w-[100px] sm:max-w-[130px] truncate">
                    @{selectedAccount.username}
                  </span>
                  {isLive && (
                    <span className="inline-flex items-center text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Connected
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-transform duration-200 group-hover:rotate-180" />
                </button>

                {/* Account Dropdown */}
                <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl shadow-xl p-1.5 hidden group-hover:block z-50 anim-scale-in">
                  <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider px-2.5 py-1.5">
                    Switch Account
                  </div>
                  {accounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => onSelectAccount(acc)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs transition-all press cursor-pointer ${
                        acc.id === selectedAccount.id
                          ? 'bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-white font-medium'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.05] hover:text-zinc-900 dark:hover:text-zinc-200'
                      }`}
                    >
                      {acc.profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={acc.profilePictureUrl} alt="" className="w-6 h-6 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/15" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs">
                          {acc.username.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 truncate">
                        <div className="truncate text-zinc-900 dark:text-zinc-200 font-medium">@{acc.username}</div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{acc.pageName}</div>
                      </div>
                      {acc.id === selectedAccount.id && (
                        <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-200 shrink-0" />
                      )}
                    </button>
                  ))}
                  {isLive && onDisconnect && (
                    <button
                      onClick={onDisconnect}
                      className="w-full mt-1 pt-1.5 border-t border-black/5 dark:border-white/10 flex items-center gap-1.5 px-2.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors press cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Disconnect Session</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <a
                href="/api/auth/facebook"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium transition-all shadow-xs press cursor-pointer"
              >
                <span>Connect Instagram</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Launch Studio CTA if on other pages */}
            {pathname !== '/studio' && (
              <Link
                href="/studio"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium transition-all shadow-xs press cursor-pointer"
              >
                <span>Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Quick Theme Toggle */}
            {onQuickToggleTheme && (
              <button
                onClick={onQuickToggleTheme}
                className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all press cursor-pointer"
                title="Toggle Theme"
              >
                <Sun className="w-4 h-4 dark:hidden" />
                <Moon className="w-4 h-4 hidden dark:block" />
              </button>
            )}

            {/* Settings Modal Button */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all press cursor-pointer"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
