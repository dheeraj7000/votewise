'use client';

import React from 'react';
import { DollarSign, PieChart, FileText, ExternalLink, ShieldCheck } from 'lucide-react';
import { CampaignFinance } from '@/types/election';
import { SourceCard } from './SourceCard';

interface Props {
  finance: CampaignFinance;
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CampaignFinanceCard({ finance }: Props) {
  return (
    <section id="finance" className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Campaign Finance & FEC Filings</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold border border-slate-200">
              {finance.cycle} Cycle
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct audited financial records from the Federal Election Commission / State PDC.
          </p>
        </div>

        <a
          href={finance.fecUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors shrink-0"
        >
          <span>Official FEC Candidate Profile</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Financial Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Raised
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatUSD(finance.totalRaised)}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium block mt-1">
            All itemized & unitemized contributions
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Spent
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatUSD(finance.totalSpent)}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Operating disbursements & media buys
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Cash On Hand
          </span>
          <div className="text-2xl font-extrabold text-blue-800 mt-1">
            {formatUSD(finance.cashOnHand)}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Debts owed: {formatUSD(finance.debt)}
          </span>
        </div>
      </div>

      {/* Top Contributor Sectors Breakdown */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-blue-700" />
          <span>Top Contributing Donor Sectors</span>
        </h3>

        <div className="space-y-3">
          {finance.topSectors.map((sector, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-900">{sector.sector}</span>
                <span className="font-bold text-slate-700">
                  {formatUSD(sector.amount)} ({sector.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#0F2942] h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(sector.percentage * 2, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Major Recent Filings Table */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-700" />
          <span>Recent Certified Filings on Record</span>
        </h3>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-4">Report Type</th>
                <th className="py-2.5 px-4">Filing Date</th>
                <th className="py-2.5 px-4 hidden sm:table-cell">Coverage Period</th>
                <th className="py-2.5 px-4 text-right">Official Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {finance.majorFilings.map((filing, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{filing.reportType}</td>
                  <td className="py-2.5 px-4 text-slate-600">{filing.filingDate}</td>
                  <td className="py-2.5 px-4 text-slate-500 hidden sm:table-cell">{filing.coveragePeriod}</td>
                  <td className="py-2.5 px-4 text-right">
                    <a
                      href={filing.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      <span>FEC Document</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SourceCard source={finance.source} />
    </section>
  );
}
