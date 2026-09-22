'use client';

import React from 'react';
import { ExternalLink, Building2, Calendar, FileText } from 'lucide-react';
import { SourceReference } from '@/types/election';
import { VerificationBadge } from './VerificationBadge';

interface SourceCardProps {
  source: SourceReference;
  compact?: boolean;
}

export function SourceCard({ source, compact = false }: SourceCardProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 mt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 truncate max-w-[70%]">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium text-slate-700 truncate">{source.organization || source.title}</span>
          {source.publishedDate && (
            <span className="text-slate-400 shrink-0">• {source.publishedDate}</span>
          )}
        </div>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 hover:underline shrink-0"
        >
          <span>Open Original</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 text-xs text-slate-600 mt-4 transition-colors hover:border-slate-300">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-slate-900">{source.title}</span>
        </div>
        <VerificationBadge tier={source.tier} size="sm" showDetails />
      </div>

      {source.excerpt && (
        <p className="italic text-slate-600 mb-2.5 border-l-2 border-slate-300 pl-2">
          "{source.excerpt}"
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
        <div className="flex items-center gap-3">
          {source.organization && (
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" />
              <span>{source.organization}</span>
            </span>
          )}
          {source.publishedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>{source.publishedDate}</span>
            </span>
          )}
        </div>

        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 hover:underline"
        >
          <span>Open Original Filing</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
