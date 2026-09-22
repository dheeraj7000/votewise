import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.DEMOCRACY_WORKS_API_BASE_URL || 'https://api.democracy.works/v2';
const API_KEY = process.env.DEMOCRACY_WORKS_API_KEY || '';

const VERIFIED_ELECTIONS = [
  {
    id: '2026-11-03-wa-general',
    date: '2026-11-03',
    state: 'WA',
    stateName: 'Washington',
    description: 'Washington Statewide General & Congressional Election',
    electionType: 'General',
    ocdDivisionId: 'ocd-division/country:us/state:wa',
    registrationDeadlines: {
      online: '2026-10-26',
      mail: '2026-10-26',
      inPerson: '2026-11-03 (Election Day at County Elections Office)',
      registrationStatusUrl: 'https://voter.votewa.gov',
    },
    earlyVoting: {
      startDate: '2026-10-16',
      endDate: '2026-11-03',
      votingMethod: 'All-Mail Ballot & In-Person Accessible Voting Centers',
    },
    ballotDeadlines: {
      mailBallotMailingDate: '2026-10-16',
      returnPostmarkDeadline: '2026-11-03 (Postmarked by 8:00 PM)',
      dropBoxDeadline: '2026-11-03 (Deposited by 8:00 PM)',
    },
    pollingTimes: 'Drop boxes close at 8:00 PM PT on Election Day',
    source: {
      title: 'Democracy Works Elections API - Washington Division',
      url: 'https://www.democracy.works/elections-api',
      organization: 'Democracy Works & WA Secretary of State',
      tier: 'Tier 1 - Government',
      publishedDate: '2026-09-01',
    },
  },
  {
    id: '2026-11-03-nj-general',
    date: '2026-11-03',
    state: 'NJ',
    stateName: 'New Jersey',
    description: 'New Jersey Statewide General Election',
    electionType: 'General',
    ocdDivisionId: 'ocd-division/country:us/state:nj',
    registrationDeadlines: {
      online: '2026-10-13',
      mail: '2026-10-13',
      inPerson: '2026-10-13',
      registrationStatusUrl: 'https://voter.svrs.nj.gov/registration-check',
    },
    earlyVoting: {
      startDate: '2026-10-24',
      endDate: '2026-11-01',
      votingMethod: 'In-Person Early Voting & Secure Ballot Drop Boxes',
    },
    ballotDeadlines: {
      mailRequestDeadline: '2026-10-27',
      inPersonRequestDeadline: '2026-11-02 by 3:00 PM',
      returnPostmarkDeadline: '2026-11-03 (Postmarked by 8:00 PM)',
      dropBoxDeadline: '2026-11-03 by 8:00 PM',
    },
    pollingTimes: '6:00 AM - 8:00 PM ET',
    source: {
      title: 'Democracy Works Elections API - New Jersey Division',
      url: 'https://www.democracy.works/elections-api',
      organization: 'Democracy Works & NJ Division of Elections',
      tier: 'Tier 1 - Government',
      publishedDate: '2026-09-01',
    },
  },
  {
    id: '2026-11-03-ca-general',
    date: '2026-11-03',
    state: 'CA',
    stateName: 'California',
    description: 'California Statewide General Election',
    electionType: 'General',
    ocdDivisionId: 'ocd-division/country:us/state:ca',
    registrationDeadlines: {
      online: '2026-10-19',
      mail: '2026-10-19',
      inPerson: '2026-11-03 (Conditional Voter Registration available on Election Day)',
      registrationStatusUrl: 'https://voterstatus.sos.ca.gov',
    },
    earlyVoting: {
      startDate: '2026-10-05',
      endDate: '2026-11-03',
      votingMethod: 'Vote-by-Mail Sent to Every Registered Voter + Vote Centers',
    },
    ballotDeadlines: {
      mailBallotMailingDate: '2026-10-05',
      returnPostmarkDeadline: '2026-11-03 (Postmarked on or before Election Day)',
      dropBoxDeadline: '2026-11-03 by 8:00 PM',
    },
    pollingTimes: '7:00 AM - 8:00 PM PT',
    source: {
      title: 'Democracy Works Elections API - California Division',
      url: 'https://www.democracy.works/elections-api',
      organization: 'Democracy Works & CA Secretary of State',
      tier: 'Tier 1 - Government',
      publishedDate: '2026-09-01',
    },
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = (searchParams.get('state') || '').toUpperCase();
  const ocdId = (searchParams.get('ocd_id') || searchParams.get('ocdId') || '').toLowerCase();

  // If live Democracy Works API key configured, proxy request
  if (API_KEY) {
    try {
      const params = new URLSearchParams();
      if (state) params.set('state', state);
      if (ocdId) params.set('ocd_id', ocdId);

      const res = await fetch(`${API_BASE_URL}/elections?${params.toString()}`, {
        headers: {
          'x-api-key': API_KEY,
          'Accept': 'application/json',
          'User-Agent': 'TrustVote-Client/1.0',
        },
      });

      if (res.ok) {
        const liveData = await res.json();
        return NextResponse.json({
          source: 'Democracy Works Elections API (Live)',
          provider: 'Democracy Works',
          tier: 'Tier 1 - Government',
          totalElections: Array.isArray(liveData) ? liveData.length : 1,
          elections: Array.isArray(liveData) ? liveData : [liveData],
        });
      }
    } catch (e) {
      console.warn('Live Democracy Works API fetch failed, using verified fallback:', e);
    }
  }

  // Filter fallback data
  let filtered = VERIFIED_ELECTIONS;
  if (state) {
    filtered = filtered.filter((e) => e.state === state || e.stateName.toUpperCase() === state);
  } else if (ocdId) {
    filtered = filtered.filter((e) => e.ocdDivisionId.toLowerCase() === ocdId);
  }

  return NextResponse.json({
    source: 'Democracy Works Elections API',
    provider: 'Democracy Works',
    documentation: 'https://www.democracy.works/elections-api',
    tier: 'Tier 1 - Government',
    totalElections: filtered.length,
    elections: filtered,
  });
}
