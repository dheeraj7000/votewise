'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Vote } from 'lucide-react';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import { SearchBar } from './SearchBar';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xs border-b border-slate-200">
      {/* Official Government / Nonpartisan Banner */}
      <div className="bg-[#0F2942] text-white text-[11px] py-1 px-4 sm:px-8 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Official Nonpartisan Public Election Information System</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-300">
          <span>Zero Algorithmic Scoring</span>
          <span>•</span>
          <span>100% Sourced Public Records</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-lg bg-[#0F2942] text-white flex items-center justify-center font-bold shadow-xs group-hover:bg-blue-900 transition-colors">
            <Vote className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-blue-900">
              TrustVote
            </span>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              Verified Election Intelligence
            </span>
          </div>
        </Link>

        {/* Global Search */}
        <div className="hidden md:block flex-1 max-w-lg mx-4">
          <SearchBar placeholder="Search candidates, ballot measures, topics..." />
        </div>

        {/* Right Actions & Accessibility */}
        <div className="flex items-center gap-3">
          <Link
            href="/#trust-model"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-colors py-1.5 px-2.5 rounded-md hover:bg-slate-100"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Trust Model</span>
          </Link>

          <AccessibilityToolbar />
        </div>
      </div>

      {/* Mobile search bar row */}
      <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-100">
        <SearchBar placeholder="Search candidates, measures..." />
      </div>
    </header>
  );
}
