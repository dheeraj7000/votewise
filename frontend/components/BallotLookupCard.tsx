'use client';

import React, { useState } from 'react';

import {
  MapPin,
  Search,
  Lock,
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Vote,
  FileText,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { BallotLookupResponse } from '@/types/election';
import { getBallotByAddress } from '@/services/api';
import { VerificationBadge } from '@/components/VerificationBadge';

interface Props {
  className?: string;
}

const PRESET_ADDRESSES = [
  { label: 'Seattle (City & State Ballot)', address: '400 Pine St, Seattle, WA 98101' },
  { label: 'Spokane (Statewide Ballot)', address: '808 W Spokane Falls Blvd, Spokane, WA 99201' },
  { label: 'Jersey City, NJ', address: '280 Grove St, Jersey City, NJ 07302' },
  { label: 'Los Angeles, CA', address: '200 N Spring St, Los Angeles, CA 90012' },
];

export function BallotLookupCard({ className = '' }: Props) {
  const [address, setAddress] = useState<string>('');
  const [ballot, setBallot] = useState<BallotLookupResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleLookup = async (targetAddress?: string) => {
    const query = (targetAddress !== undefined ? targetAddress : address).trim();
    if (!query) {
      setError('Please enter a street address or select a sample location below.');
      return;
    }
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const data = await getBallotByAddress(query);
      setBallot(data);
    } catch (err: any) {
      console.error('Ballot lookup error:', err);
      setError('Unable to load ballot information for this address. Please verify your address or state election portal.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreset = (presetAddr: string) => {
    setAddress(presetAddr);
    handleLookup(presetAddr);
  };

  const handleClear = () => {
    setAddress('');
    setBallot(null);
    setHasSearched(false);
    setError(null);
  };

  return (
    <section
      id="ballot-lookup"
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 ${className}`}
      aria-labelledby="ballot-lookup-title"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
              <Vote className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-blue-900">
              Democracy Works Address Resolver
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
              <Lock className="w-3 h-3 text-emerald-600" />
              Never Saved
            </span>
          </div>
          <h2 id="ballot-lookup-title" className="text-2xl sm:text-3xl font-extrabold text-[#0B1E36] tracking-tight">
            What's On My Ballot?
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Enter your residential address to inspect your certified candidate contests, statewide ballot initiatives, and your official 24-hour ballot drop box.
          </p>
        </div>

        {/* Privacy Seal */}
        <div className="shrink-0 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs max-w-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero-Knowledge Guarantee</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Addresses are evaluated ephemerally in memory to resolve electoral precincts. No personal addresses or voter profiles are ever saved to disk or database.
          </p>
        </div>
      </div>

      {/* Address Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLookup();
        }}
        className="mt-6"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your street address (e.g., 400 Pine St, Seattle, WA 98101)..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition-colors"
              aria-label="Enter your street address to look up what is on your ballot"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#0F2942] hover:bg-blue-900 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors shrink-0 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Resolving Ballot...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Look Up My Ballot</span>
              </>
            )}
          </button>
          {hasSearched && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Quick Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          <span className="text-slate-400 font-medium">Quick Test:</span>
          {PRESET_ADDRESSES.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePreset(p.address)}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-900 hover:border-blue-200 border border-slate-200 text-slate-700 font-medium transition-colors"
            >
              📍 {p.label}
            </button>
          ))}
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Ballot Results View */}
      {ballot && !loading && (
        <div className="mt-8 space-y-6 pt-6 border-t border-slate-200">
          {/* Resolved Jurisdiction Bar */}
          <div className="bg-slate-900 text-white rounded-lg p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Electoral District</span>
              </div>
              <div className="text-lg font-bold text-white">
                {ballot.jurisdiction.municipality}, {ballot.jurisdiction.stateName}
              </div>
              <div className="text-xs text-slate-300 mt-1 flex flex-wrap gap-2">
                {ballot.jurisdiction.county && (
                  <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    County: {ballot.jurisdiction.county}
                  </span>
                )}
                {ballot.jurisdiction.congressionalDistrict && (
                  <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    Congressional: {ballot.jurisdiction.congressionalDistrict}
                  </span>
                )}
                {ballot.jurisdiction.councilDistrict && (
                  <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    Council: {ballot.jurisdiction.councilDistrict}
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:items-end gap-1.5 text-xs">
              <div className="text-slate-300">
                <span className="text-slate-400">Election:</span>{' '}
                <strong className="text-white">{ballot.election.name}</strong>
              </div>
              <div className="text-slate-300">
                <span className="text-slate-400">Election Date:</span>{' '}
                <strong className="text-emerald-400">{ballot.election.date}</strong>
              </div>
              {ballot.election.verifyRegistrationUrl && (
                <a
                  href={ballot.election.verifyRegistrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200 font-semibold underline text-xs"
                >
                  Verify Registration Status <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Contests on Ballot */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Vote className="w-4 h-4 text-blue-800" />
                <span>Certified Contests on Your Ballot ({ballot.contests.length})</span>
              </h3>
              <span className="text-xs text-slate-400 font-semibold">100% Sourced Records</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ballot.contests.map((contest, cIdx) => (
                <div
                  key={cIdx}
                  className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">
                      <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-[10px]">
                        {contest.level}
                      </span>
                      <span>{contest.district}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 mb-3">{contest.office}</div>

                    <div className="space-y-2">
                      {contest.candidates.map((cand, candIdx) => (
                        <div
                          key={candIdx}
                          className="bg-white p-3 rounded-md border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {cand.officialPhoto && (
                              <img
                                src={cand.officialPhoto}
                                alt={cand.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                            )}
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-900 truncate">{cand.name}</div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {cand.party} • {cand.status}
                              </div>
                            </div>
                          </div>

                          {cand.id && !cand.id.includes('-candidate') ? (
                            <a
                              href={`/candidate/${cand.id}`}
                              className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline shrink-0 inline-flex items-center gap-0.5"
                            >
                              <span>Profile</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold uppercase shrink-0">
                              Certified
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Measures on Ballot */}
          {ballot.measures.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Certified Ballot Measures ({ballot.measures.length})</span>
                </h3>
                <span className="text-xs text-slate-400 font-semibold">Voter Pamphlet Data</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ballot.measures.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                          {m.number}
                        </span>
                        <VerificationBadge tier={m.trustTier} level={m.verificationLevel} size="sm" />
                      </div>
                      <div className="text-sm font-bold text-slate-900 leading-snug">{m.title}</div>
                      <div className="text-xs text-slate-500 mt-1">Jurisdiction: {m.jurisdiction}</div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Includes Official Fiscal Note</span>
                      <a
                        href={`/measure/${m.id}`}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Breakdown</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drop Box & Polling Station */}
          {ballot.dropBox && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-sm text-slate-900">
                    Official Assigned Ballot Drop Box
                  </span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                    {ballot.dropBox.type}
                  </span>
                </div>
                {ballot.dropBox.lookupUrl && (
                  <a
                    href={ballot.dropBox.lookupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-700 hover:text-blue-900 hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    View on Official State Locator <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800 block mb-0.5">Location:</span>
                  <span className="text-slate-900 font-medium">{ballot.dropBox.name}</span>
                  <div className="text-slate-500">{ballot.dropBox.address}</div>
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block mb-0.5">Operating Hours:</span>
                  <span className="text-slate-900 font-medium">{ballot.dropBox.hours}</span>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Ballots collected and sealed by sworn bipartisan county elections staff.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Privacy Affirmation */}
          <div className="text-[11px] text-slate-400 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100">
            <div>
              Address Query: <span className="font-mono text-slate-600">{ballot.queryAddress}</span>
            </div>
            <div>{ballot.privacyNotice}</div>
          </div>
        </div>
      )}
    </section>
  );
}
