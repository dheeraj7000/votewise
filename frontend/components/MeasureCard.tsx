'use client';

import React from 'react';
import { Vote, FileText, CheckCircle2, XCircle, DollarSign, Calendar, MapPin, Building2, ExternalLink } from 'lucide-react';
import { BallotMeasure } from '@/types/election';
import { VerificationBadge } from './VerificationBadge';
import { SourceCard } from './SourceCard';

interface Props {
  measure: BallotMeasure;
}

export function MeasureCard({ measure }: Props) {
  return (
    <article className="space-y-6">
      {/* Overview Card */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold px-3 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
              {measure.number}
            </span>
            <VerificationBadge tier={measure.trustTier} level={measure.verificationLevel} size="md" />
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {measure.jurisdiction}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Vote: {measure.electionDate}
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {measure.title}
        </h1>

        <p className="text-sm text-slate-700 mt-4 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200/80">
          <span className="font-bold text-slate-900 block mb-1">Official Ballot Summary:</span>
          {measure.summary}
        </p>
      </section>

      {/* Yes vs No Vote Meaning */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border-2 border-emerald-200 p-6 shadow-xs bg-gradient-to-b from-emerald-50/30 to-white">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-base mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>A "YES" Vote Means</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
            {measure.yesVoteMeans}
          </p>
        </div>

        <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-xs bg-gradient-to-b from-slate-50/50 to-white">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base mb-3">
            <XCircle className="w-5 h-5 text-slate-500" />
            <span>A "NO" Vote Means</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
            {measure.noVoteMeans}
          </p>
        </div>
      </section>

      {/* Fiscal Impact */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex items-center gap-2 text-base font-bold text-slate-900 mb-4 border-b border-slate-200 pb-3">
          <DollarSign className="w-5 h-5 text-blue-700" />
          <span>Audited Fiscal Impact & Cost Breakdown</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {measure.fiscalImpact.totalBondAmount && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                Principal Bond Sum
              </span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {measure.fiscalImpact.totalBondAmount}
              </div>
            </div>
          )}

          {measure.fiscalImpact.annualDebtService && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                Annual Debt Service
              </span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {measure.fiscalImpact.annualDebtService}
              </div>
            </div>
          )}

          {measure.fiscalImpact.costPerHousehold && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">
                Household Cost
              </span>
              <div className="text-xl font-extrabold text-slate-900 mt-1">
                {measure.fiscalImpact.costPerHousehold}
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="font-semibold text-slate-900">Source of Fiscal Analysis: </span>
          {measure.fiscalImpact.officialSource}
        </div>
      </section>

      {/* Pro & Con Official Arguments */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-3">
          Official Statements from the State Voters' Pamphlet
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supporters */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md inline-block mb-3 border border-emerald-200">
              Arguments in Favor (For)
            </div>
            <div className="space-y-3">
              {measure.supporters.map((sup, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-xs text-slate-900 mb-1">{sup.name}</div>
                  <p className="text-xs text-slate-600 italic">"{sup.argument}"</p>
                  <div className="text-[10px] text-slate-400 mt-2">Source: {sup.source}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Opponents */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md inline-block mb-3 border border-rose-200">
              Arguments Against (Against)
            </div>
            <div className="space-y-3">
              {measure.opponents.map((opp, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-xs text-slate-900 mb-1">{opp.name}</div>
                  <p className="text-xs text-slate-600 italic">"{opp.argument}"</p>
                  <div className="text-[10px] text-slate-400 mt-2">Source: {opp.source}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Official Certified Documents */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Certified Public Records & Source Texts</h2>
        <div className="space-y-3">
          {measure.officialDocuments.map((doc, idx) => (
            <SourceCard key={idx} source={doc} />
          ))}
        </div>
      </section>
    </article>
  );
}
