// PLACEHOLDER — see /PLACEHOLDERS.md item 2.
// This is the naive placeholder logic chosen for this prototype: each
// Marketing Lever moves Applications only for rows whose detailTactic
// matches that lever. The Credit and Pricing Levers ("Approval Rate" and
// "Origination Rate", confirmed as the two real sub-levers from
// UX_V2.xlsx — see PLACEHOLDERS.md item 4) each move their own named
// conversion rate directly, independently of each other. There is no
// statistical basis for treating these as independent linear deltas — this
// exists only to prove the lever -> table wiring works.

import type { ForecastRow, FunnelMetrics, ScenarioLevers } from '../types/forecast';

const DETAIL_TACTIC_TO_LEVER_KEY: Record<string, keyof ScenarioLevers['marketing']> = {
  'Paid Search': 'paidSearch',
  'Paid Social': 'paidSocial',
  Prescreen: 'prescreen',
  Referrals: 'referrals',
  'Lead Generation': 'leadGeneration',
  Sweepstakes: 'sweepstakes',
};

export function applyLevers(row: ForecastRow, levers: ScenarioLevers): FunnelMetrics {
  const leverKey = DETAIL_TACTIC_TO_LEVER_KEY[row.detailTactic];
  const marketingDeltaPct = leverKey ? levers.marketing[leverKey] : 0;

  const applicationsMultiplier = 1 + marketingDeltaPct / 100;
  const approvalRateMultiplier = 1 + levers.creditAndPricing.approvalRate / 100;
  const originationRateMultiplier = 1 + levers.creditAndPricing.originationRate / 100;

  const applications = Math.max(0, Math.round(row.baseline.applications * applicationsMultiplier));
  const approvalRate = Math.min(1, Math.max(0, row.baseline.approvalRate * approvalRateMultiplier));
  const approvals = Math.round(applications * approvalRate);
  const originationRate = Math.min(1, Math.max(0, row.baseline.originationRate * originationRateMultiplier));
  const originations = Math.round(approvals * originationRate);

  return {
    applications,
    approvals,
    originations,
    approvalRate: applications > 0 ? approvals / applications : 0,
    originationRate: approvals > 0 ? originations / approvals : 0,
  };
}

export const DEFAULT_LEVERS: ScenarioLevers = {
  marketing: {
    paidSearch: 0,
    paidSocial: 0,
    prescreen: 0,
    referrals: 0,
    leadGeneration: 0,
    sweepstakes: 0,
  },
  creditAndPricing: {
    approvalRate: 0,
    originationRate: 0,
  },
};
