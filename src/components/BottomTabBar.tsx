'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Edit3, Grid, User } from 'lucide-react';

export default function BottomTabBar() {
  const pathname = usePathname();

  const tabs = [
    { href: '/editor', label: 'Editor', icon: Edit3, active: pathname === '/editor' || pathname === '/studio' },
    { href: '/posts', label: 'Posts', icon: Grid, active: pathname === '/posts' || pathname === '/history' },
    { href: '/account', label: 'Account', icon: User, active: pathname === '/account' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-1 pointer-events-none">
      <div className="max-w-[340px] mx-auto glass-surface px-2 py-1.5 flex items-center justify-between rounded-full shadow-apple-lg border border-white/20 pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center min-h-[46px] py-1 px-3 rounded-full transition-all duration-200 active:scale-95 ${
                tab.active
                  ? 'text-white font-bold bg-white/15 border border-white/20 shadow-[0_0_12px_rgba(0,210,255,0.25)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[12px] tracking-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
