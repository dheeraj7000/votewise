'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { TrustTierLevel, VerificationStatus } from '@/types/election';

interface Props {
  tier?: TrustTierLevel;
  level?: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function VerificationBadge({ tier, level = 'Government Verified', size = 'md', showDetails = false }: Props) {
  let badgeText: string = level;
  let bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  let Icon = ShieldCheck;

  if (tier?.includes('Tier 1') || level === 'Government Verified') {
    badgeText = 'Government Verified';
    bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    Icon = ShieldCheck;
  } else if (tier?.includes('Tier 2') || level === 'Verified Organization') {
    badgeText = 'Verified Organization';
    bgClass = 'bg-blue-50 text-blue-800 border-blue-300';
    Icon = CheckCircle2;
  } else if (tier?.includes('Tier 3') || level === 'Consensus') {
    badgeText = 'Consensus Source';
    bgClass = 'bg-slate-100 text-slate-800 border-slate-300';
    Icon = Award;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${bgClass} ${sizeClasses[size]}`}
      role="status"
      aria-label={`Verification Status: ${badgeText}`}
      title="Verified through official government or accredited nonpartisan records"
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} aria-hidden="true" />
      <span>{badgeText}</span>
      {showDetails && tier && (
        <span className="opacity-75 font-normal text-[11px] border-l border-current pl-1.5 ml-0.5">
          {tier.split(' - ')[0]}
        </span>
      )}
    </span>
  );
}
