// Shared data contract. Every component must consume data through these
// shapes only — this is the seam where real backend data replaces the mock
// in mockForecast.ts without touching component internals.

export interface FunnelMetrics {
  applications: number;
  approvals: number;
  originations: number;
  approvalRate: number; // approvals / applications
  originationRate: number; // originations / approvals
}

export interface ForecastRow {
  state: string;
  customerType: string;
  channel: string;
  hTactic: string;
  detailTactic: string;
  product: string;
  month: string; // "2026-03" format
  baseline: FunnelMetrics;
  scenario1?: FunnelMetrics;
  scenario2?: FunnelMetrics;
  scenario3?: FunnelMetrics;
}

export type ScenarioKey = 'baseline' | 'scenario1' | 'scenario2' | 'scenario3';

export interface MarketingLevers {
  paidSearch: number; // % delta from baseline spend
  paidSocial: number;
  prescreen: number;
  referrals: number;
  leadGeneration: number;
  sweepstakes: number;
}

export interface ScenarioLevers {
  marketing: MarketingLevers;
  creditAndPricing: number; // % delta, placeholder single lever
}

export type MetricView = 'count' | 'approvalRate' | 'originationRate';

export interface FilterState {
  state: string[];
  customerType: string[];
  channel: string[];
  hTactic: string[];
  detailTactic: string[];
  product: string[];
}
