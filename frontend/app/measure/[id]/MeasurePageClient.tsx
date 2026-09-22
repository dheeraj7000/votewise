'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { getMeasure } from '@/services/api';
import { BallotMeasure } from '@/types/election';
import { MeasureCard } from '@/components/MeasureCard';
import { AiSidePanel } from '@/components/AiSidePanel';

interface Props {
  id?: string;
}

export default function MeasurePageClient({ id: propId }: Props) {
  const params = useParams();
  const rawId = propId || (params?.id as string) || '';
  const [measureId, setMeasureId] = useState<string>(rawId);

  const [measure, setMeasure] = useState<BallotMeasure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let resolved = rawId;
    if (!resolved && typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && last !== 'measure') {
        resolved = last.replace(/\.html$/, '');
      }
    }
    if (resolved && resolved !== measureId) {
      setMeasureId(resolved);
    }
  }, [rawId, measureId]);

  useEffect(() => {
    if (!measureId) return;
    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMeasure(measureId);
        setMeasure(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load ballot measure.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [measureId]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700" />
        <div className="font-semibold text-sm text-slate-800">
          Loading certified ballot measure...
        </div>
        <div className="text-xs text-slate-500">
          Fetching official explanatory statement and fiscal note
        </div>
      </div>
    );
  }

  if (error || !measure) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-xl text-center space-y-4 shadow-xs">
        <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
        <h1 className="text-xl font-bold text-slate-900">Ballot Measure Not Found</h1>
        <p className="text-xs text-slate-600">
          We could not locate an official record for proposition <code className="bg-slate-100 px-1 py-0.5 rounded">{measureId || 'this proposition'}</code>.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F2942] text-white text-xs font-semibold rounded-lg hover:bg-blue-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Election Search</span>
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 pb-4 border-b border-slate-200">
        <a
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Candidates & Ballot Measures</span>
        </a>
      </div>

      <MeasureCard measure={measure} />

      {/* Floating Ask TrustVote Side Assistant */}
      <AiSidePanel candidateId={measure.id} candidateName={measure.number} />
    </div>
  );
}
