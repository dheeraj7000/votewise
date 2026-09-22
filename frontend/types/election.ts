export type TrustTierLevel = 'Tier 1 - Government' | 'Tier 2 - Verified Fact Check' | 'Tier 3 - Consensus';

export type VerificationStatus = 'Government Verified' | 'Verified Organization' | 'Consensus';

export interface SourceReference {
  title: string;
  url: string;
  organization?: string;
  tier: TrustTierLevel;
  publishedDate?: string;
  excerpt?: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  year: string;
  source: SourceReference;
}

export interface CareerEntry {
  role: string;
  organization: string;
  period: string;
  source: SourceReference;
}

export interface MilitaryRecord {
  served: boolean;
  branch: string;
  rank: string;
  years: string;
  source: SourceReference;
}

export interface PublicServiceEntry {
  role: string;
  jurisdiction: string;
  period: string;
  source: SourceReference;
}

export interface Biography {
  summary: string;
  education: EducationEntry[];
  career: CareerEntry[];
  military: MilitaryRecord;
  publicService: PublicServiceEntry[];
  previousOffices: string[];
  yearsInOffice: number;
}

export interface TimelineEvent {
  id: string;
  year: string;
  date: string;
  title: string;
  category: 'Elected Office' | 'Legislative Milestone' | 'Executive Action' | 'Campaign Milestone';
  description: string;
  source: SourceReference;
}

export interface DonorSector {
  sector: string;
  amount: number;
  percentage: number;
}

export interface MajorFiling {
  reportType: string;
  filingDate: string;
  coveragePeriod: string;
  docUrl: string;
  source: string;
}

export interface CampaignFinance {
  cycle: string;
  totalRaised: number;
  totalSpent: number;
  cashOnHand: number;
  debt: number;
  fecCommitteeId: string;
  fecUrl: string;
  lastFilingDate: string;
  topSectors: DonorSector[];
  majorFilings: MajorFiling[];
  source: SourceReference;
}

export interface OfficialStatement {
  id: string;
  topic: 'Education' | 'Healthcare' | 'Transportation' | 'Economy' | 'Environment' | 'Public Safety' | string;
  statement: string;
  context: string;
  date: string;
  documentType: string;
  source: SourceReference;
}

export interface PublicAction {
  id: string;
  type: string;
  title: string;
  date: string;
  status: string;
  description: string;
  source: SourceReference;
}

export interface TrustSourceBreakdown {
  tier: TrustTierLevel;
  tierDescription: string;
  count: number;
  sampleSources: string[];
}

export interface Candidate {
  id: string;
  name: string;
  office: string;
  party: string;
  status: string;
  officialPhoto: string;
  officialWebsite: string;
  campaignWebsite: string;
  governmentLinks: SourceReference[];
  verificationLevel: VerificationStatus;
  trustTier: TrustTierLevel;
  sourceCount: number;
  lastUpdated: string;
  biography: Biography;
  timeline: TimelineEvent[];
  campaignFinance: CampaignFinance;
  officialStatements: OfficialStatement[];
  publicActions: PublicAction[];
  trustSources: TrustSourceBreakdown[];
}

export interface BallotMeasure {
  id: string;
  number: string;
  title: string;
  jurisdiction: string;
  electionDate: string;
  status: string;
  summary: string;
  yesVoteMeans: string;
  noVoteMeans: string;
  fiscalImpact: {
    totalBondAmount?: string;
    annualDebtService?: string;
    annualRevenue?: string;
    costPerHousehold?: string;
    revenueSource?: string;
    officialSource: string;
  };
  supporters: Array<{ name: string; argument: string; source: string }>;
  opponents: Array<{ name: string; argument: string; source: string }>;
  officialDocuments: SourceReference[];
  verificationLevel: VerificationStatus;
  trustTier: TrustTierLevel;
  lastUpdated: string;
}

export interface ElectionTopic {
  id: string;
  name: string;
  description: string;
  relatedCandidates?: string[];
  relatedMeasures?: string[];
  keyLaws?: string[];
}

export interface SearchResultItem {
  id: string;
  name?: string;
  title?: string;
  number?: string;
  office?: string;
  party?: string;
  jurisdiction?: string;
  description?: string;
  officialPhoto?: string;
  verificationLevel?: VerificationStatus;
  trustTier?: TrustTierLevel;
  type: 'candidate' | 'measure' | 'topic';
}

export interface SearchResponse {
  query?: string;
  candidates: SearchResultItem[];
  measures: SearchResultItem[];
  topics: ElectionTopic[];
  totalResults: number;
}

export interface AskRequest {
  question: string;
  candidateId?: string;
}

export interface AskResponse {
  answer: string;
  trustTier: TrustTierLevel;
  confidence: 'High' | 'Medium' | 'Insufficient Data';
  sources: SourceReference[];
  verified: boolean;
  notice?: string;
}
