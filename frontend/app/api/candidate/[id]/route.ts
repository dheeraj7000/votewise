import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fullPath = path.join(process.cwd(), '..', 'backend', 'candidate-json', 'candidates.json');
  
  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'Data store not found' }, { status: 500 });
  }

  const candidates = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const candidate = candidates.find((c: any) => c.id === id);

  if (!candidate) {
    return NextResponse.json({ error: 'Candidate not found', id }, { status: 404 });
  }

  return NextResponse.json(candidate);
}
