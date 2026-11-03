import React from 'react';
import Link from 'next/link';
import { APP_CONFIG } from '@/lib/config';

export default function Footer() {
  const links = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/refunds', label: 'Refunds' },
    { href: '/data-deletion', label: 'Data Deletion' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <footer className="w-full mt-auto py-10 px-4 border-t border-white/10 bg-black/40 backdrop-blur-xl text-[14px] text-slate-400">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-4">
        {/* Navigation links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-400 hover:text-white transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="flex flex-col sm:flex-row items-center gap-1.5 text-[13px] text-slate-500 pt-1">
          <span>&copy; 2026 {APP_CONFIG.company} All rights reserved.</span>
          <span className="hidden sm:inline">•</span>
          <span>{APP_CONFIG.name} is not affiliated with Instagram or Meta.</span>
        </div>
      </div>
    </footer>
  );
}
