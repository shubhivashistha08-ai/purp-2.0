// PLACEHOLDER — see /PLACEHOLDERS.md item 2.
// This is the naive placeholder multiplier chosen for this prototype: each
// Marketing Lever moves Applications only for rows whose detailTactic
// matches that lever, and the Credit and Pricing lever moves approval/
// origination conversion for every row in the scenario. There is no
// statistical basis for these coefficients — they exist only to prove the
// lever -> table wiring works.

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
  const creditDeltaPct = levers.creditAndPricing;

  const applicationsMultiplier = 1 + marketingDeltaPct / 100;
  const conversionMultiplier = 1 + (creditDeltaPct / 100) * 0.5;

  const applications = Math.max(0, Math.round(row.baseline.applications * applicationsMultiplier));
  const approvalRate = Math.min(1, Math.max(0, row.baseline.approvalRate * conversionMultiplier));
  const approvals = Math.round(applications * approvalRate);
  const originationRate = Math.min(1, Math.max(0, row.baseline.originationRate * conversionMultiplier));
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
  creditAndPricing: 0,
};
