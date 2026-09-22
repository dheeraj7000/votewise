'use client';

import React from 'react';
import { CheckSquare, ScrollText, Vote, Building2 } from 'lucide-react';
import { PublicAction } from '@/types/election';
import { SourceCard } from './SourceCard';

interface Props {
  actions: PublicAction[];
}

export function PublicActionsCard({ actions }: Props) {
  return (
    <section id="actions" className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-xl font-bold text-slate-900">Legislative & Public Actions</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Sponsored statutes, official executive orders, and recorded roll call votes on public record.
        </p>
      </div>

      <div className="space-y-4">
        {actions.map((act) => (
          <div
            key={act.id}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                  <ScrollText className="w-3 h-3 text-slate-600" />
                  {act.type}
                </span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {act.status}
                </span>
              </div>

              <span className="text-xs text-slate-500 font-medium">{act.date}</span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900">{act.title}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{act.description}</p>

            <SourceCard source={act.source} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
