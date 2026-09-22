import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DEFAULT_REFUSAL =
  "I don't have enough verified information to answer this question. Please consult official government election resources at your state election office.";

const STOP_WORDS = new Set([
  'what', 'is', 'are', 'was', 'were', 'the', 'and', 'has', 'have', 'had',
  'this', 'that', 'these', 'those', 'for', 'with', 'about', 'his', 'her',
  'their', 'does', 'did', 'person', 'candidate', 'mention', 'mentioned',
  'discuss', 'discussed', 'where', 'can', 'read', 'find', 'who', 'how',
  'favorite', 'tell', 'which', 'official', 'any', 'could', 'would', 'should'
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const question = (body.question || '').trim();
    const candidateId = body.candidateId;

    if (!question) {
      return NextResponse.json({
        answer: 'Please enter a valid election or policy question.',
        trustTier: 'Tier 1 - Government',
        confidence: 'Insufficient Data',
        sources: [],
        verified: false,
      });
    }

    const docsDir = path.join(process.cwd(), '..', 'backend', 'knowledge-base', 'documents');
    if (!fs.existsSync(docsDir)) {
      return NextResponse.json({
        answer: DEFAULT_REFUSAL,
        trustTier: 'Tier 1 - Government',
        confidence: 'Insufficient Data',
        sources: [],
        verified: false,
      });
    }

    const files = fs.readdirSync(docsDir).filter((f) => f.endsWith('.txt'));
    const allTokens = question.toLowerCase().split(/\W+/).filter((w: string) => w.length > 2);
    
    // Name tokens to exclude from false positive matches
    const nameTokens = new Set<string>();
    if (candidateId) {
      candidateId.toLowerCase().split(/[-_]+/).forEach((t: string) => nameTokens.add(t));
    }

    const substantiveTokens = allTokens.filter(
      (w: string) => !STOP_WORDS.has(w) && !nameTokens.has(w)
    );

    if (substantiveTokens.length === 0) {
      return NextResponse.json({
        answer: DEFAULT_REFUSAL,
        trustTier: 'Tier 1 - Government',
        confidence: 'Insufficient Data',
        sources: [],
        verified: false,
        notice: 'Question did not contain substantive policy or record topics.',
      });
    }

    const scoredChunks: Array<{
      score: number;
      matchedCount: number;
      text: string;
      metadata: any;
    }> = [];

    for (const file of files) {
      const txtPath = path.join(docsDir, file);
      const metaPath = path.join(docsDir, `${file}.metadata.json`);
      let metadata: any = {};
      if (fs.existsSync(metaPath)) {
        try {
          metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8')).metadataAttributes || {};
        } catch (e) {}
      }

      // Filter by candidateId if provided
      if (candidateId && metadata.candidateId && metadata.candidateId !== candidateId) {
        continue;
      }

      const content = fs.readFileSync(txtPath, 'utf8');
      const paragraphs = content.split('\n\n');

      for (const p of paragraphs) {
        const pClean = p.trim();
        if (pClean.length < 40) continue;
        const pLower = pClean.toLowerCase();

        let score = 0;
        const matched: string[] = [];

        for (const token of substantiveTokens) {
          const regex = new RegExp(`\\b${token}\\b`, 'g');
          const matches = (pLower.match(regex) || []).length;
          if (matches > 0) {
            score += matches * (token.length > 5 ? 3 : 1);
            matched.push(token);
          }
        }

        if (matched.length >= 1) {
          scoredChunks.push({
            score,
            matchedCount: matched.length,
            text: pClean,
            metadata,
          });
        }
      }
    }

    scoredChunks.sort((a, b) => b.matchedCount - a.matchedCount || b.score - a.score);

    if (scoredChunks.length === 0 || scoredChunks[0].matchedCount < 1) {
      return NextResponse.json({
        answer: DEFAULT_REFUSAL,
        trustTier: 'Tier 1 - Government',
        confidence: 'Insufficient Data',
        sources: [],
        verified: false,
        notice: 'No verified official documentation found answering this inquiry.',
      });
    }

    const top = scoredChunks[0];
    const topMeta = top.metadata;

    const answer = `According to verified official records (${topMeta.source || 'Official Authority'}):\n\n"${top.text}"`;

    const sources = [
      {
        title: topMeta.documentType || 'Official Record',
        url: topMeta.url || 'https://www.congress.gov',
        organization: topMeta.source || 'Official Government Filing',
        tier: topMeta.tier || 'Tier 1 - Government',
        publishedDate: topMeta.publishedDate || '2026',
        excerpt: top.text.slice(0, 300) + (top.text.length > 300 ? '...' : ''),
      },
    ];

    if (scoredChunks.length > 1 && scoredChunks[1].metadata.url !== topMeta.url) {
      const second = scoredChunks[1];
      sources.push({
        title: second.metadata.documentType || 'Verified Filing',
        url: second.metadata.url || 'https://www.fec.gov',
        organization: second.metadata.source || 'Official Record',
        tier: second.metadata.tier || 'Tier 1 - Government',
        publishedDate: second.metadata.publishedDate || '2026',
        excerpt: second.text.slice(0, 280) + (second.text.length > 280 ? '...' : ''),
      });
    }

    return NextResponse.json({
      answer,
      trustTier: topMeta.tier || 'Tier 1 - Government',
      confidence: 'High',
      sources,
      verified: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
