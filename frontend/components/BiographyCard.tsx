'use client';

import React from 'react';
import { GraduationCap, Briefcase, Shield, History, Award } from 'lucide-react';
import { Candidate } from '@/types/election';
import { SourceCard } from './SourceCard';

interface Props {
  candidate: Candidate;
}

export function BiographyCard({ candidate }: Props) {
  const { biography } = candidate;

  return (
    <section id="biography" className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Verified Biography & Public Record</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Academic credentials, military service, and public sector tenure verified via official archives.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 block uppercase font-semibold">Tenure in Office</span>
          <span className="text-lg font-bold text-slate-900">{biography.yearsInOffice} Years</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wide">
            <GraduationCap className="w-4 h-4 text-blue-700" />
            <span>Higher Education</span>
          </div>

          <div className="space-y-3">
            {biography.education.map((edu, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <div className="font-semibold text-slate-900 text-sm">{edu.degree}</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {edu.institution} • Class of {edu.year}
                </div>
                <SourceCard source={edu.source} compact />
              </div>
            ))}
          </div>
        </div>

        {/* Professional & Military Record */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wide">
            <Shield className="w-4 h-4 text-blue-700" />
            <span>Military & Defense Service</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
            {biography.military.served ? (
              <div>
                <div className="font-semibold text-slate-900 text-sm">{biography.military.branch}</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Rank: {biography.military.rank} ({biography.military.years})
                </div>
                <SourceCard source={biography.military.source} compact />
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">
                No military service reported on official public disclosure filings.
              </div>
            )}
          </div>

          {/* Career Highlights */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
              <Briefcase className="w-4 h-4 text-blue-700" />
              <span>Prior Professional Career</span>
            </div>

            <div className="space-y-3">
              {biography.career.map((car, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="font-semibold text-slate-900 text-sm">{car.role}</div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {car.organization} ({car.period})
                  </div>
                  <SourceCard source={car.source} compact />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Public Service & Previous Offices */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
          <History className="w-4 h-4 text-blue-700" />
          <span>Elected & Appointed Public Service</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {biography.publicService.map((ps, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-semibold text-slate-900 text-sm">{ps.role}</div>
              <div className="text-xs text-slate-600 mt-0.5">
                Jurisdiction: {ps.jurisdiction} • {ps.period}
              </div>
              <SourceCard source={ps.source} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
