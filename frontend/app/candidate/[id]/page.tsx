import CandidateDashboardClient from './CandidateDashboardClient';

export function generateStaticParams() {
  return [
    { id: 'marcus-vance' },
    { id: 'elena-rostova' },
    { id: 'david-chen' },
  ];
}

export default async function CandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <CandidateDashboardClient id={resolvedParams.id} />;
}
