'use client';

import React, { useState } from 'react';
import { Quote, Tag, FileText, ExternalLink, AlertCircle } from 'lucide-react';
import { OfficialStatement } from '@/types/election';
import { SourceCard } from './SourceCard';

interface Props {
  statements: OfficialStatement[];
}

export function OfficialStatementsCard({ statements }: Props) {
  const topics = ['All Topics', ...Array.from(new Set(statements.map((s) => s.topic)))];
  const [selectedTopic, setSelectedTopic] = useState('All Topics');

  const filtered = selectedTopic === 'All Topics'
    ? statements
    : statements.filter((s) => s.topic === selectedTopic);

  return (
    <section id="statements" className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Official Statements on Key Topics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct, unaltered verbatim quotes and testimony from public records. Zero synthetic summaries.
          </p>
        </div>

        {/* Nonpartisan Policy Notice */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Verbatim citations only</span>
        </div>
      </div>

      {/* Topic Filter Pills */}
      <div className="flex flex-wrap gap-1.5 mb-6" role="tablist" aria-label="Policy topic filters">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              selectedTopic === t
                ? 'bg-[#0F2942] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            role="tab"
            aria-selected={selectedTopic === t}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Statements List */}
      <div className="space-y-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                <Tag className="w-3 h-3" />
                {item.topic}
              </span>

              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className="font-medium text-slate-700">{item.documentType}</span>
                <span>•</span>
                <span>{item.date}</span>
              </div>
            </div>

            {/* Direct retrieved quote */}
            <div className="relative pl-6 py-1">
              <Quote className="absolute left-0 top-0 w-4 h-4 text-blue-400 -scale-x-100" />
              <blockquote className="text-sm font-medium text-slate-900 leading-relaxed italic">
                "{item.statement}"
              </blockquote>
            </div>

            <div className="mt-2 text-xs text-slate-600 pl-6">
              <span className="font-semibold text-slate-700">Context: </span>
              {item.context}
            </div>

            <div className="mt-3">
              <SourceCard source={item.source} compact />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
