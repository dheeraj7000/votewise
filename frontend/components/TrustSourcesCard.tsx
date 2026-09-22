'use client';

import React from 'react';
import { Shield, CheckCircle2, Award, FileSpreadsheet, Lock } from 'lucide-react';
import { TrustSourceBreakdown } from '@/types/election';

interface Props {
  trustSources: TrustSourceBreakdown[];
  sourceCount: number;
}

export function TrustSourcesCard({ trustSources, sourceCount }: Props) {
  return (
    <section id="sources" className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Trust Sources & Verification Audit</h2>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-300">
              {sourceCount} Documents Indexed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Every datum on this dashboard is backed by audited government registries, statutory texts, or consensus archives.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>No unverified opinion or social media data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trustSources.map((ts, idx) => {
          let Icon = Shield;
          let tierColor = 'border-emerald-300 bg-emerald-50/40 text-emerald-900';
          if (ts.tier.includes('Tier 2')) {
            Icon = CheckCircle2;
            tierColor = 'border-blue-300 bg-blue-50/40 text-blue-900';
          } else if (ts.tier.includes('Tier 3')) {
            Icon = Award;
            tierColor = 'border-slate-300 bg-slate-100/60 text-slate-900';
          }

          return (
            <div key={idx} className={`p-4 rounded-xl border ${tierColor} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{ts.tier}</span>
                  </div>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white border border-current shadow-2xs">
                    {ts.count} Docs
                  </span>
                </div>

                <p className="text-xs opacity-90 leading-relaxed mb-4">
                  {ts.tierDescription}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75 mb-1.5">
                  Sample Depository Sources:
                </span>
                <ul className="text-xs space-y-1 list-disc list-inside opacity-90">
                  {ts.sampleSources.map((source, sIdx) => (
                    <li key={sIdx} className="truncate">
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
