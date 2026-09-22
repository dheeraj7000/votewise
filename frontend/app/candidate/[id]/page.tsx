'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  GraduationCap,
  Calendar,
  DollarSign,
  Quote,
  CheckSquare,
  ShieldCheck,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Share2,
  Printer,
} from 'lucide-react';
import { getCandidate } from '@/services/api';
import { Candidate } from '@/types/election';
import { CandidateOverviewCard } from '@/components/CandidateOverviewCard';
import { BiographyCard } from '@/components/BiographyCard';
import { TimelineCard } from '@/components/TimelineCard';
import { CampaignFinanceCard } from '@/components/CampaignFinanceCard';
import { OfficialStatementsCard } from '@/components/OfficialStatementsCard';
import { PublicActionsCard } from '@/components/PublicActionsCard';
import { TrustSourcesCard } from '@/components/TrustSourcesCard';
import { AiSidePanel } from '@/components/AiSidePanel';

const NAV_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'biography', label: 'Biography', icon: GraduationCap },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'statements', label: 'Statements', icon: Quote },
  { id: 'actions', label: 'Public Actions', icon: CheckSquare },
  { id: 'finance', label: 'Campaign Finance', icon: DollarSign },
  { id: 'sources', label: 'Trust Sources', icon: ShieldCheck },
];

export default function CandidateDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCandidate(id);
        setCandidate(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load candidate dossier.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Scrollspy observer for active section tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (const section of NAV_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        <div className="font-semibold text-sm text-slate-800">
          Loading verified candidate dossier...
        </div>
        <div className="text-xs text-slate-500">
          Fetching certified government records & FEC filings
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-xl text-center space-y-4 shadow-xs">
        <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Candidate Record Not Found</h1>
        <p className="text-xs text-slate-600">
          We could not locate an official public record for <code className="bg-slate-100 px-1 py-0.5 rounded">{id}</code>.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F2942] text-white text-xs font-semibold rounded-lg hover:bg-blue-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Election Search</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Navigation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Candidates & Measures</span>
        </Link>

        <div className="flex items-center gap-2 text-slate-500">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1 p-1.5 px-2.5 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
            title="Print or export verified dossier as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Sticky Sidebar + Structured Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Left Navigation Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
              Dossier Sections
            </div>
            <nav className="space-y-1" aria-label="Candidate dossier sections">
              {NAV_SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.getElementById(sec.id);
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setActiveSection(sec.id);
                      }
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#0F2942] text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{sec.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Verification Box */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Provenance</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every fact on this page is tethered to primary government depository URLs with zero synthetic embellishment.
            </p>
            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400">
              Last audited: {candidate.lastUpdated}
            </div>
          </div>
        </aside>

        {/* Main Content Area: Structured Cards */}
        <main className="lg:col-span-9 space-y-8">
          <CandidateOverviewCard candidate={candidate} />
          <BiographyCard candidate={candidate} />
          <TimelineCard timeline={candidate.timeline} />
          <OfficialStatementsCard statements={candidate.officialStatements} />
          <PublicActionsCard actions={candidate.publicActions} />
          <CampaignFinanceCard finance={candidate.campaignFinance} />
          <TrustSourcesCard trustSources={candidate.trustSources} sourceCount={candidate.sourceCount} />
        </main>
      </div>

      {/* Floating Side AI Panel ("Ask TrustVote") */}
      <AiSidePanel candidateId={candidate.id} candidateName={candidate.name} />
    </div>
  );
}
