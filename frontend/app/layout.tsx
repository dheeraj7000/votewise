import type { Metadata } from 'next';
import './globals.css';
import { AccessibilityProvider } from '@/hooks/useAccessibility';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'TrustVote | Nonpartisan Verified Election Intelligence',
  description:
    'An interactive election information dashboard presenting structured, verified public records. Sourced from certified government depositories with zero algorithmic scoring.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <AccessibilityProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 text-center">
            <div className="max-w-7xl mx-auto space-y-2">
              <p className="font-semibold text-slate-700">
                TrustVote • Nonpartisan Civic Intelligence System
              </p>
              <p>
                All data sourced from official records (Congress.gov, Federal Election Commission, State Secretaries of State). Zero synthetic political summaries.
              </p>
              <div className="pt-2 flex justify-center gap-4 text-slate-400">
                <a href="#trust-model" className="hover:text-slate-600 hover:underline">
                  Trust Model & Verification Tiers
                </a>
                <span>•</span>
                <a href="https://www.vote.org" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 hover:underline">
                  Register to Vote (Vote.org)
                </a>
              </div>
            </div>
          </footer>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
