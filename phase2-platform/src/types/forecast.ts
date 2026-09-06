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
  paidSearch: number; // 0-100 slider, % delta from baseline spend
  paidSocial: number;
  prescreen: number;
  referrals: number;
  leadGeneration: number;
  sweepstakes: number;
}

// UX_V2.xlsx's "Credit and Pricing Levers" group has two named scroll-bar
// controls per scenario, "Approval Rate" and "Origination Rate" — not one
// generic field. See PLACEHOLDERS.md item 4.
export interface CreditAndPricingLevers {
  approvalRate: number; // 0-100 slider, % delta from baseline approval rate
  originationRate: number; // 0-100 slider, % delta from baseline origination rate
}

export interface ScenarioLevers {
  marketing: MarketingLevers;
  creditAndPricing: CreditAndPricingLevers;
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
