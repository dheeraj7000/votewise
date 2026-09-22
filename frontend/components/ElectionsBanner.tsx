'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, ExternalLink, Clock, Building2, MapPin, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { ElectionInfo, ElectionAuthority } from '@/types/election';
import { getElections, getAuthorities } from '@/services/api';
import { VerificationBadge } from '@/components/VerificationBadge';

interface Props {
  initialState?: string;
  className?: string;
}

export function ElectionsBanner({ initialState = 'WA', className = '' }: Props) {
  const [selectedState, setSelectedState] = useState<string>(initialState);
  const [election, setElection] = useState<ElectionInfo | null>(null);
  const [authority, setAuthority] = useState<ElectionAuthority | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [elecRes, authRes] = await Promise.all([
          getElections(selectedState),
          getAuthorities(selectedState),
        ]);
        if (isMounted) {
          setElection(elecRes.elections[0] || null);
          setAuthority(authRes.authorities[0] || null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load Democracy Works election deadlines:', err);
          setError('Unable to load real-time election deadlines. Please visit your state election office.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedState]);

  return (
    <section
      className={`bg-slate-900 text-white rounded-xl border border-slate-800 shadow-md overflow-hidden p-5 sm:p-6 my-6 ${className}`}
      aria-labelledby="elections-banner-title"
    >
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
              Official Election Calendar & Deadlines
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Democracy Works API
            </span>
          </div>
          <h2 id="elections-banner-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {election ? election.description : `${selectedState} Election Deadlines`}
          </h2>
        </div>

        {/* State Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="state-select" className="text-xs text-slate-300 font-medium whitespace-nowrap">
            Select State:
          </label>
          <select
            id="state-select"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-800 text-white text-sm rounded-lg border border-slate-700 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Filter election deadlines by state"
          >
            <option value="WA">Washington (WA)</option>
            <option value="NJ">New Jersey (NJ)</option>
            <option value="CA">California (CA)</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="py-8 text-center text-slate-400 text-sm animate-pulse">
          Retrieving verified election deadlines from Democracy Works...
        </div>
      )}

      {error && !loading && (
        <div className="py-4 text-amber-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && election && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Election Day */}
          <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Election Day
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {new Date(election.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-slate-200">Hours:</span> {election.pollingTimes || 'Consult local county'}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700/60 text-[11px] text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              General Election
            </div>
          </div>

          {/* Card 2: Registration Deadlines */}
          <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Registration Deadlines
              </div>
              <ul className="text-xs space-y-1.5 text-slate-200 mt-2">
                <li>
                  <span className="text-slate-400 font-medium">Online:</span>{' '}
                  <strong className="text-white">{election.registrationDeadlines.online || 'N/A'}</strong>
                </li>
                <li>
                  <span className="text-slate-400 font-medium">Mail:</span>{' '}
                  <strong className="text-white">{election.registrationDeadlines.mail || 'N/A'}</strong>
                </li>
                <li className="text-[11px] text-slate-300">
                  <span className="text-slate-400 font-medium">In-Person:</span> {election.registrationDeadlines.inPerson}
                </li>
              </ul>
            </div>
            {election.registrationDeadlines.registrationStatusUrl && (
              <div className="mt-3 pt-2 border-t border-slate-700/60">
                <a
                  href={election.registrationDeadlines.registrationStatusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-300 hover:text-cyan-200 font-semibold inline-flex items-center gap-1"
                >
                  Verify Your Registration <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Card 3: Early & Mail Voting */}
          <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                Early & Mail Voting
              </div>
              <div className="text-xs space-y-1.5 text-slate-200 mt-2">
                {election.earlyVoting.startDate && (
                  <div>
                    <span className="text-slate-400 font-medium">Early Voting:</span>{' '}
                    <strong className="text-white">
                      {election.earlyVoting.startDate} to {election.earlyVoting.endDate}
                    </strong>
                  </div>
                )}
                {election.ballotDeadlines.returnPostmarkDeadline && (
                  <div className="text-[11px] text-slate-300">
                    <span className="text-slate-400 font-medium">Postmark Deadline:</span>{' '}
                    {election.ballotDeadlines.returnPostmarkDeadline}
                  </div>
                )}
                {election.earlyVoting.votingMethod && (
                  <div className="text-[11px] text-slate-400 italic">
                    {election.earlyVoting.votingMethod}
                  </div>
                )}
              </div>
            </div>
            {authority?.portalUrls?.ballotDropBoxLocator && (
              <div className="mt-3 pt-2 border-t border-slate-700/60">
                <a
                  href={authority.portalUrls.ballotDropBoxLocator}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-300 hover:text-amber-200 font-semibold inline-flex items-center gap-1"
                >
                  Find Ballot Drop Box <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Card 4: Official Authority Contact */}
          <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/80 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold flex items-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Official Election Office
              </div>
              <div className="text-xs text-white font-medium line-clamp-2 mt-1">
                {authority ? authority.agencyName : `${election.stateName} Elections Division`}
              </div>
              {authority?.phone && (
                <div className="text-xs text-slate-300 mt-2">
                  <span className="text-slate-400 font-medium">Phone:</span> {authority.phone}
                </div>
              )}
              {authority?.email && (
                <div className="text-[11px] text-slate-400 truncate">
                  <span className="text-slate-400 font-medium">Email:</span> {authority.email}
                </div>
              )}
            </div>

            {authority?.officialWebsite && (
              <div className="mt-3 pt-2 border-t border-slate-700/60">
                <a
                  href={authority.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
                >
                  Visit State Election Portal <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Attribution */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
        <div>
          Data sourced & continually verified via{' '}
          <a
            href="https://www.democracy.works/elections-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline font-medium inline-flex items-center gap-0.5"
          >
            Democracy Works Elections API <ExternalLink className="w-2.5 h-2.5" />
          </a>
          . Official Tier 1 civic election data.
        </div>
        <div>
          OCD Division: <span className="font-mono text-slate-300">{election?.ocdDivisionId || 'ocd-division/country:us'}</span>
        </div>
      </div>
    </section>
  );
}
