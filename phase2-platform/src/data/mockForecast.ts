// PLACEHOLDER — see /PLACEHOLDERS.md item 1.
// Every number here is fabricated for layout/interaction purposes only.
// There is no real Phase 1 forecast output to draw from yet (see CLAUDE.md
// Section 0 — four modeling methodologies tried, none working).

import type { ForecastRow, FunnelMetrics } from '../types/forecast';
import {
  STATE_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
  CHANNEL_OPTIONS,
  H_TACTIC_OPTIONS,
  DETAIL_TACTIC_OPTIONS,
  PRODUCT_OPTIONS,
} from './filterOptions';

// PLACEHOLDER — see /PLACEHOLDERS.md item 7. Source sheet horizon (Mar 2026
// - Feb 2027), not yet extended to Dec 2027.
export const MONTH_OPTIONS: string[] = [
  '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08',
  '2026-09', '2026-10', '2026-11', '2026-12', '2027-01', '2027-02',
];

// Deterministic pseudo-random hash so the same filter combination always
// renders the same fabricated numbers across re-renders.
function hashSeed(parts: string[]): number {
  let h = 0;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function seededRatio(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  const frac = x - Math.floor(x);
  return min + frac * (max - min);
}

function buildBaselineMetrics(seed: number): FunnelMetrics {
  const applications = Math.round(seededRatio(seed, 20, 400));
  const approvalRate = seededRatio(seed * 1.7, 0.35, 0.85);
  const approvals = Math.round(applications * approvalRate);
  const originationRate = seededRatio(seed * 2.3, 0.5, 0.95);
  const originations = Math.round(approvals * originationRate);
  return {
    applications,
    approvals,
    originations,
    approvalRate: applications > 0 ? approvals / applications : 0,
    originationRate: approvals > 0 ? originations / approvals : 0,
  };
}

function generateAllRows(): ForecastRow[] {
  const rows: ForecastRow[] = [];
  for (const state of STATE_OPTIONS) {
    for (const customerType of CUSTOMER_TYPE_OPTIONS) {
      for (const channel of CHANNEL_OPTIONS) {
        for (const hTactic of H_TACTIC_OPTIONS) {
          for (const detailTactic of DETAIL_TACTIC_OPTIONS) {
            for (const product of PRODUCT_OPTIONS) {
              for (const month of MONTH_OPTIONS) {
                const key = [state, customerType, channel, hTactic, detailTactic, product, month];
                const seed = hashSeed(key);
                rows.push({
                  state,
                  customerType,
                  channel,
                  hTactic,
                  detailTactic,
                  product,
                  month,
                  baseline: buildBaselineMetrics(seed),
                });
              }
            }
          }
        }
      }
    }
  }
  return rows;
}

// Memoized module-level generation — ~108k rows, formulaic, generated once.
let cached: ForecastRow[] | null = null;

export function getMockForecastRows(): ForecastRow[] {
  if (!cached) {
    cached = generateAllRows();
  }
  return cached;
}
