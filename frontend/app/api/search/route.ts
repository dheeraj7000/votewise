import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function loadJson(relPath: string) {
  const fullPath = path.join(process.cwd(), '..', 'backend', 'candidate-json', relPath);
  if (fs.existsSync(fullPath)) {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  }
  return [];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  const candidates = loadJson('candidates.json');
  const measures = loadJson('ballot-measures.json');
  const topics = loadJson('topics.json');

  if (!q) {
    return NextResponse.json({
      candidates: candidates.map((c: any) => ({
        id: c.id,
        name: c.name,
        office: c.office,
        party: c.party,
        officialPhoto: c.officialPhoto,
        verificationLevel: c.verificationLevel,
        trustTier: c.trustTier,
        type: 'candidate',
      })),
      measures: measures.map((m: any) => ({
        id: m.id,
        number: m.number,
        title: m.title,
        jurisdiction: m.jurisdiction,
        verificationLevel: m.verificationLevel,
        trustTier: m.trustTier,
        type: 'measure',
      })),
      topics,
      totalResults: candidates.length + measures.length + topics.length,
    });
  }

  const tokens = q.split(/\s+/);

  const matchedCandidates = candidates
    .filter((c: any) => {
      const text = `${c.name} ${c.office} ${c.party} ${c.biography?.summary || ''} ${c.officialStatements?.map((s: any) => s.statement + ' ' + s.topic).join(' ')}`.toLowerCase();
      return tokens.some((token) => text.includes(token));
    })
    .map((c: any) => ({
      id: c.id,
      name: c.name,
      office: c.office,
      party: c.party,
      officialPhoto: c.officialPhoto,
      verificationLevel: c.verificationLevel,
      trustTier: c.trustTier,
      type: 'candidate',
    }));

  const matchedMeasures = measures
    .filter((m: any) => {
      const text = `${m.number} ${m.title} ${m.jurisdiction} ${m.summary}`.toLowerCase();
      return tokens.some((token) => text.includes(token));
    })
    .map((m: any) => ({
      id: m.id,
      number: m.number,
      title: m.title,
      jurisdiction: m.jurisdiction,
      verificationLevel: m.verificationLevel,
      trustTier: m.trustTier,
      type: 'measure',
    }));

  const matchedTopics = topics.filter((t: any) => {
    const text = `${t.name} ${t.description}`.toLowerCase();
    return tokens.some((token) => text.includes(token));
  });

  return NextResponse.json({
    query: q,
    candidates: matchedCandidates,
    measures: matchedMeasures,
    topics: matchedTopics,
    totalResults: matchedCandidates.length + matchedMeasures.length + matchedTopics.length,
  });
}
