'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Building2,
  Calendar,
} from 'lucide-react';
import { askBedrock } from '@/services/api';
import { AskResponse } from '@/types/election';
import { VerificationBadge } from './VerificationBadge';

interface Props {
  candidateId?: string;
  candidateName?: string;
}

const DEFAULT_SUGGESTIONS = [
  'Has this candidate discussed affordable housing?',
  'Has this person mentioned public transportation?',
  'Where can I read official statements about education?',
  'Where can I find campaign finance information?',
  'What bills has this person sponsored?',
];

export function AiSidePanel({ candidateId, candidateName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q) return;

    if (queryText) {
      setQuestion(queryText);
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await askBedrock(q, candidateId);
      setResult(res);
    } catch (err: any) {
      setError('Unable to query the verified knowledge base. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#0F2942] hover:bg-blue-900 text-white font-semibold text-sm rounded-full shadow-xl hover:shadow-2xl border-2 border-white/20 transition-all hover:scale-105 active:scale-95"
          aria-expanded={isOpen}
          aria-controls="trustvote-ai-panel"
          title="Open Ask TrustVote verified AI assistant"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          </div>
          <span>Ask TrustVote</span>
          <span className="hidden sm:inline-block text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-normal">
            Side Assistant
          </span>
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs z-40 transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Slide-over Drawer */}
      <aside
        id="trustvote-ai-panel"
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[460px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Ask TrustVote Verified Assistant"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-[#0F2942] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Ask TrustVote</h2>
              <div className="text-[11px] text-slate-300">
                Amazon Bedrock Knowledge Base RAG
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Assistant Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-[11px] text-slate-600 flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Strict citations only. Zero pretrained model hallucinations.</span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {candidateName && (
            <div className="text-xs text-slate-500 pb-2 border-b border-slate-100">
              Inquiry context: <span className="font-semibold text-slate-900">{candidateName}</span>
            </div>
          )}

          {/* Suggested Prompts */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Verified Suggested Inquiries
            </span>
            <div className="space-y-1.5">
              {DEFAULT_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(sug)}
                  disabled={isLoading}
                  className="w-full text-left text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-200 hover:text-blue-900 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{sug}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-700" />
              <div className="text-xs font-semibold text-slate-800">
                Retrieving from Bedrock Knowledge Base...
              </div>
              <div className="text-[11px] text-slate-500">
                Searching verified S3 documents & OpenSearch index
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Card */}
          {result && !isLoading && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
              {/* Header with confidence & trust tier */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <VerificationBadge tier={result.trustTier} size="sm" showDetails />
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    result.confidence === 'High'
                      ? 'bg-emerald-100 text-emerald-800'
                      : result.confidence === 'Medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  Confidence: {result.confidence}
                </span>
              </div>

              {/* Refusal Notice Banner if unverified */}
              {!result.verified && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Verification Refusal Enforced</div>
                    <div className="text-[11px] text-amber-800 mt-0.5">
                      This question cannot be answered from certified public documents. TrustVote does not speculate.
                    </div>
                  </div>
                </div>
              )}

              {/* Answer Content */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Retrieved Official Summary
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                  {result.answer}
                </p>
              </div>

              {/* Source Citations */}
              {result.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Retrieved Knowledge Base Citations ({result.sources.length})
                  </span>
                  <div className="space-y-2">
                    {result.sources.map((src, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-600"
                      >
                        <div className="font-semibold text-slate-900 mb-1 flex items-center justify-between">
                          <span>{src.title}</span>
                          <span className="text-[11px] text-emerald-700 font-normal">
                            {src.tier.split(' - ')[0]}
                          </span>
                        </div>
                        {src.excerpt && (
                          <p className="italic text-[11px] text-slate-500 mb-2 border-l border-slate-300 pl-2">
                            "{src.excerpt}"
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-[10px] text-slate-400">
                            {src.organization || 'Official Depository'}
                          </span>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 hover:underline text-[11px]"
                          >
                            <span>Open Source</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about official votes, bills, filings..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-900"
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="px-3.5 py-2.5 bg-[#0F2942] hover:bg-blue-900 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center font-medium shrink-0"
              aria-label="Send question to verified assistant"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
          <div className="text-[10px] text-slate-400 text-center mt-2">
            Nonpartisan AI assistant powered by Amazon Bedrock & Claude 3.5 Sonnet.
          </div>
        </div>
      </aside>
    </>
  );
}
