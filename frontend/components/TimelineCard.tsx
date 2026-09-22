'use client';

import React, { useState } from 'react';
import { Calendar, Filter, Milestone, CheckCircle } from 'lucide-react';
import { TimelineEvent } from '@/types/election';
import { SourceCard } from './SourceCard';

interface Props {
  timeline: TimelineEvent[];
}

export function TimelineCard({ timeline }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(timeline.map((e) => e.category)))];

  const filtered = selectedCategory === 'All'
    ? timeline
    : timeline.filter((e) => e.category === selectedCategory);

  return (
    <section id="timeline" className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Career & Legislative Timeline</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key verified political, legislative, and executive milestones in chronological order.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Timeline category filters">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#0F2942] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              aria-pressed={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 ml-2">
        {filtered.map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline bullet dot */}
            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:bg-white" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 transition-colors hover:border-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>

                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                  {item.category}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-1">{item.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.description}</p>

              <SourceCard source={item.source} compact />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
