import MeasurePageClient from './MeasurePageClient';

export function generateStaticParams() {
  return [
    { id: 'measure-101' },
    { id: 'measure-102' },
  ];
}

export default async function MeasurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <MeasurePageClient id={resolvedParams.id} />;
}
