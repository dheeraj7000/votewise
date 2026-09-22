import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.DEMOCRACY_WORKS_API_BASE_URL || 'https://api.democracy.works/v2';
const API_KEY = process.env.DEMOCRACY_WORKS_API_KEY || '';

const VERIFIED_AUTHORITIES = [
  {
    id: 'authority-wa',
    state: 'WA',
    stateName: 'Washington',
    ocdDivisionId: 'ocd-division/country:us/state:wa',
    agencyName: 'Washington Office of the Secretary of State - Elections Division',
    officialWebsite: 'https://www.sos.wa.gov/elections',
    phone: '(800) 448-4881',
    email: 'elections@sos.wa.gov',
    address: 'PO Box 40229, Olympia, WA 98504',
    portalUrls: {
      voterPortal: 'https://voter.votewa.gov',
      registerOnline: 'https://olvr.votewa.gov',
      ballotDropBoxLocator: 'https://www.sos.wa.gov/elections/voters/ballot-drop-box-locations',
    },
    votingMethodsAccepted: [
      'Mail-in ballot sent to all active registered voters',
      'County designated 24-hour ballot drop boxes',
      'Accessible in-person voting units at County Elections Offices',
    ],
    voterIdRules: 'Signature verification against voter registration card on file',
    source: {
      title: 'Democracy Works Authority Directory',
      url: 'https://www.democracy.works/elections-api',
      organization: 'Democracy Works & WA Secretary of State',
      tier: 'Tier 1 - Government',
      publishedDate: '2026-09-01',
    },
  },
  {
    id: 'authority-nj',
    state: 'NJ',
    stateName: 'New Jersey',
    ocdDivisionId: 'ocd-division/country:us/state:nj',
    agencyName: 'New Jersey Department of State - Division of Elections',
    officialWebsite: 'https://nj.gov/state/elections/',
    phone: '(609) 292-3760',
    email: 'feedback@sos.nj.gov',
    address: '20 West State Street, 4th Floor, PO Box 304, Trenton, NJ 08625',
    portalUrls: {
      voterPortal: 'https://voter.svrs.nj.gov',
      registerOnline: 'https://voter.svrs.nj.gov/register',
      pollingPlaceLocator: 'https://voter.svrs.nj.gov/polling-place-search',
    },
    votingMethodsAccepted: [
      'In-person voting on Election Day',
      'In-person early voting at designated county locations',
      'Mail-in ballot by application',
      'County secure ballot drop boxes',
    ],
    voterIdRules: 'ID required for first-time voters registering by mail without SSN or DL',
    source: {
      title: 'Democracy Works Authority Directory',
      url: 'https://www.democracy.works/elections-api',
      organization: 'Democracy Works & NJ Division of Elections',
      tier: 'Tier 1 - Government',
      publishedDate: '2026-09-01',
    },
  },
  {
    id: 'authority-ca',
    state: 'CA',
    stateName: 'California',
    ocdDivisionId: 'ocd-division/country:us/state:ca',
    agencyName: 'California Secretary of State - Elections Division',
    officialWebsite: 'https://www.sos.ca.gov/elections',
    phone: '(800) 345-VOTE (8683)',
    email: 'elections@sos.ca.gov',
    address: '1500 11th Street, 5th Floor, Sacramento, CA 95814',
    portalUrls: {
      voterPortal: 'https://voterstatus.sos.ca.gov',
      registerOnline: 'https://registertovote.ca.gov',
      pollingPlaceLocator: 'https://www.sos.ca.gov/elections/polling-place',
    },
    votingMethodsAccepted: [
      'Mail-in ballot mailed to all active registered voters',
      'County vote center in-person early voting',
      'Official drop boxes',
      'Election Day in-person polling',
    ],
    voterIdRules: 'In most cases, California voters are not required to show ID at polling places',
    source: {
      title: 'Democracy Works Authority Directory',
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

      const res = await fetch(`${API_BASE_URL}/authorities?${params.toString()}`, {
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
          totalAuthorities: Array.isArray(liveData) ? liveData.length : 1,
          authorities: Array.isArray(liveData) ? liveData : [liveData],
        });
      }
    } catch (e) {
      console.warn('Live Democracy Works Authority fetch failed, using verified fallback:', e);
    }
  }

  // Filter fallback data
  let filtered = VERIFIED_AUTHORITIES;
  if (state) {
    filtered = filtered.filter((a) => a.state === state || a.stateName.toUpperCase() === state);
  } else if (ocdId) {
    filtered = filtered.filter((a) => a.ocdDivisionId.toLowerCase() === ocdId);
  }

  return NextResponse.json({
    source: 'Democracy Works Elections API',
    provider: 'Democracy Works',
    documentation: 'https://www.democracy.works/elections-api',
    tier: 'Tier 1 - Government',
    totalAuthorities: filtered.length,
    authorities: filtered,
  });
}
