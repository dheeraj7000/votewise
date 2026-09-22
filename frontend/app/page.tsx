'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  User,
  Vote,
  Tag,
  ShieldCheck,
  Building2,
  FileCheck2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { VerificationBadge } from '@/components/VerificationBadge';
import { AiSidePanel } from '@/components/AiSidePanel';
import { searchElection } from '@/services/api';
import { SearchResultItem, ElectionTopic } from '@/types/election';

export default function LandingPage() {
  const [candidates, setCandidates] = useState<SearchResultItem[]>([]);
  const [measures, setMeasures] = useState<SearchResultItem[]>([]);
  const [topics, setTopics] = useState<ElectionTopic[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'candidates' | 'measures' | 'topics'>('all');

  useEffect(() => {
    async function loadInitialData() {
      try {
        const data = await searchElection('');
        setCandidates(data.candidates || []);
        setMeasures(data.measures || []);
        setTopics(data.topics || []);
      } catch (err) {
        console.error('Failed to load initial election data:', err);
      }
    }
    loadInitialData();
  }, []);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Dashboard-First • 100% Sourced Public Documents</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0B1E36] tracking-tight leading-tight">
            Verified Election Intelligence, <br className="hidden sm:inline" />
            <span className="text-blue-900">Direct From Government Depository Records.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Explore audited legislative voting histories, certified campaign finance disclosures, and official verbatim statements without synthetic spin or AI hallucinations.
          </p>

          {/* Prominent Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <SearchBar
              placeholder="Search candidate name, elected office, ballot proposition, or topic..."
              autoFocus
            />

            {/* Quick Filter CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-medium text-slate-600">
              <span className="text-slate-400">Jump to:</span>
              <button
                onClick={() => setActiveCategory('candidates')}
                className={`px-3 py-1.5 rounded-md border transition-colors ${
                  activeCategory === 'candidates'
                    ? 'bg-[#0F2942] text-white border-[#0F2942]'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Search Candidates ({candidates.length})
              </button>
              <button
                onClick={() => setActiveCategory('measures')}
                className={`px-3 py-1.5 rounded-md border transition-colors ${
                  activeCategory === 'measures'
                    ? 'bg-[#0F2942] text-white border-[#0F2942]'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Search Ballot Measures ({measures.length})
              </button>
              <button
                onClick={() => setActiveCategory('topics')}
                className={`px-3 py-1.5 rounded-md border transition-colors ${
                  activeCategory === 'topics'
                    ? 'bg-[#0F2942] text-white border-[#0F2942]'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Search Topics ({topics.length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Candidates Section */}
        {(activeCategory === 'all' || activeCategory === 'candidates') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Featured Candidates & Public Officials</h2>
                <p className="text-xs text-slate-500">
                  Click any profile to access their full interactive dashboard, career timeline, and FEC records.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{candidates.length} Profiles</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {candidates.map((cand) => (
                <Link
                  key={cand.id}
                  href={`/candidate/${cand.id}`}
                  className="group bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {cand.officialPhoto ? (
                          <img
                            src={cand.officialPhoto}
                            alt={cand.name || 'Candidate photo'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base text-slate-900 group-hover:text-blue-900 truncate">
                          {cand.name}
                        </div>
                        <div className="text-xs text-slate-600 font-medium truncate mt-0.5">
                          {cand.office}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Party: <span className="font-semibold text-slate-700">{cand.party}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <VerificationBadge tier={cand.trustTier} level={cand.verificationLevel} size="sm" />
                      <span className="text-xs font-semibold text-blue-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Open Dashboard</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Certified Ballot Measures */}
        {(activeCategory === 'all' || activeCategory === 'measures') && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Certified Statewide & Local Ballot Measures</h2>
                <p className="text-xs text-slate-500">
                  Certified ballot titles, fiscal impact statements, and verified pro/con arguments.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-semibold">{measures.length} Measures</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {measures.map((m) => (
                <Link
                  key={m.id}
                  href={`/measure/${m.id}`}
                  className="group bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                        {m.number}
                      </span>
                      <VerificationBadge tier={m.trustTier} level={m.verificationLevel} size="sm" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 leading-snug">
                      {m.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                      Jurisdiction: {m.jurisdiction}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Includes Official Fiscal Note</span>
                    <span className="font-semibold text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View Breakdown</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Policy Topics Grid */}
        {(activeCategory === 'all' || activeCategory === 'topics') && (
          <section className="space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-xl font-bold text-slate-900">Election Policy Topics</h2>
              <p className="text-xs text-slate-500">
                Direct policy positions sourced from official hearing transcripts and legislative records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Tag className="w-4 h-4 text-blue-700" />
                    <h3 className="font-bold text-sm text-slate-900">{t.name}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {t.description}
                  </p>
                  {t.keyLaws && (
                    <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                      <span className="font-semibold text-slate-700">Governing Statutes: </span>
                      {t.keyLaws.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trust Model Explainer Section */}
        <section id="trust-model" className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-300 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>The TrustVote Verification Model</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Why We Never Use Trust "Scores" or Percentages
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Numerical scores (e.g. "82% credible") pretend to quantify complex civic records using opaque black-box algorithms. TrustVote instead exposes the complete provenance chain of every fact so you can inspect the original primary document.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <div className="font-bold text-emerald-950 text-sm mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Tier 1: Government Records</span>
              </div>
              <p className="text-xs text-emerald-900/90 leading-relaxed">
                Direct statutory texts, Congressional Record transcripts, FEC disclosures, state roll-call votes, and certified court decrees.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <div className="font-bold text-blue-950 text-sm mb-1 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-blue-700" />
                <span>Tier 2: Verified Fact-Checks</span>
              </div>
              <p className="text-xs text-blue-900/90 leading-relaxed">
                Independent journalistic investigations adhering strictly to the International Fact-Checking Network (IFCN) code of standards.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-100/60">
              <div className="font-bold text-slate-950 text-sm mb-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-slate-700" />
                <span>Tier 3: Consensus Archives</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed">
                Accredited university alumni archives, state bar association registrations, and certified engineering registries.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Ask TrustVote Side Assistant */}
      <AiSidePanel />
    </div>
  );
}
