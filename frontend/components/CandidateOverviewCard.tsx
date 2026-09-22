'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink, Globe, Landmark, Building, Calendar, CheckCircle2 } from 'lucide-react';
import { Candidate } from '@/types/election';
import { VerificationBadge } from './VerificationBadge';

interface Props {
  candidate: Candidate;
}

export function CandidateOverviewCard({ candidate }: Props) {
  return (
    <section id="overview" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:items-start">
          {/* Photo & Quick Badges */}
          <div className="flex flex-col items-center sm:items-start shrink-0">
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden border-2 border-slate-200 shadow-xs bg-slate-100">
              <img
                src={candidate.officialPhoto}
                alt={`Official portrait of ${candidate.name}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-3 flex flex-col items-center sm:items-start gap-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status: <span className="text-slate-900">{candidate.status}</span>
              </span>
              <span className="text-xs text-slate-500">
                Party: <span className="font-semibold text-slate-900">{candidate.party}</span>
              </span>
            </div>
          </div>

          {/* Core Identification Details */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {candidate.name}
                </h1>
                <div className="text-base sm:text-lg font-medium text-slate-700 mt-0.5">
                  {candidate.office}
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <VerificationBadge level={candidate.verificationLevel} tier={candidate.trustTier} size="lg" />
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Last verified: {candidate.lastUpdated}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              {candidate.biography.summary}
            </p>

            {/* Official Web & Campaign Links */}
            <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={candidate.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Landmark className="w-4 h-4 text-blue-700 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-900">Official Office Website</div>
                    <div className="text-[11px] text-slate-500 truncate">{candidate.officialWebsite}</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 shrink-0" />
              </a>

              <a
                href={candidate.campaignWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-900">Campaign Website</div>
                    <div className="text-[11px] text-slate-500 truncate">{candidate.campaignWebsite}</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 shrink-0" />
              </a>
            </div>

            {/* Government Links */}
            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                Certified Government Depository Links
              </span>
              <div className="flex flex-wrap gap-2">
                {candidate.governmentLinks.map((govLink, idx) => (
                  <a
                    key={idx}
                    href={govLink.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium py-1.5 px-3 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-700 transition-colors shadow-2xs"
                  >
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{govLink.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
