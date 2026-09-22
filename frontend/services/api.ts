import { Candidate, BallotMeasure, ElectionTopic, SearchResponse, AskResponse, ElectionsResponse, AuthoritiesResponse } from '@/types/election';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function searchElection(query: string = '', category?: string): Promise<SearchResponse> {
  const url = `${BASE_API_URL}/api/search?q=${encodeURIComponent(query)}${category ? `&category=${encodeURIComponent(category)}` : ''}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Search failed: ${res.statusText}`);
  }
  return res.json();
}

export async function getCandidate(id: string): Promise<Candidate> {
  const url = `${BASE_API_URL}/api/candidate/${encodeURIComponent(id)}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Failed to fetch candidate profile: ${res.statusText}`);
  }
  return res.json();
}

export async function getMeasure(id: string): Promise<BallotMeasure> {
  const url = `${BASE_API_URL}/api/measure/${encodeURIComponent(id)}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Failed to fetch ballot measure: ${res.statusText}`);
  }
  return res.json();
}

export async function getTopics(): Promise<ElectionTopic[]> {
  const url = `${BASE_API_URL}/api/search`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    return [];
  }
  const data: SearchResponse = await res.json();
  return data.topics || [];
}

export async function askBedrock(question: string, candidateId?: string): Promise<AskResponse> {
  const url = `${BASE_API_URL}/api/ask`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ question, candidateId }),
  });
  if (!res.ok) {
    throw new Error(`Ask query failed: ${res.statusText}`);
  }
  return res.json();
}

export async function getElections(state?: string): Promise<ElectionsResponse> {
  const url = `${BASE_API_URL}/api/elections${state ? `?state=${encodeURIComponent(state)}` : ''}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Failed to fetch elections from Democracy Works: ${res.statusText}`);
  }
  return res.json();
}

export async function getAuthorities(state?: string): Promise<AuthoritiesResponse> {
  const url = `${BASE_API_URL}/api/authorities${state ? `?state=${encodeURIComponent(state)}` : ''}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Failed to fetch election authorities from Democracy Works: ${res.statusText}`);
  }
  return res.json();
}
