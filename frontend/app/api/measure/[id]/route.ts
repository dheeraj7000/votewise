import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fullPath = path.join(process.cwd(), '..', 'backend', 'candidate-json', 'ballot-measures.json');
  
  if (!fs.existsSync(fullPath)) {
    return NextResponse.json({ error: 'Data store not found' }, { status: 500 });
  }

  const measures = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const measure = measures.find((m: any) => m.id === id);

  if (!measure) {
    return NextResponse.json({ error: 'Ballot measure not found', id }, { status: 404 });
  }

  return NextResponse.json(measure);
}
