# Placeholder Registry — Non-New Origination Scenario Planner (React UI prototype)

This registry tracks every fabricated number, naive placeholder behavior, and
unconfirmed UX assumption in this project. See `CLAUDE.md` and the task
brief for the full framing: this is a UI prototype only, built ahead of Phase 1
sign-off at the client's explicit instruction, and is not an approved Phase 2
deliverable. Every number the app shows is fabricated. Update this file's
`Status` field and remove/rewrite an entry the moment its placeholder is
replaced with real logic — do not let stale entries accumulate.

## [0] `UX_V2.xlsx` was not available in this repo
- **Location:** N/A — applies to the whole build
- **What it does now:** The layout, filter list, scenario structure, and
  output table shape were built directly from the structure already extracted
  and described in the task brief (Section 1), not from opening `UX_V2.xlsx`
  itself — that file is not present in this repository.
- **What it should do:** If/when `UX_V2.xlsx` is added to the repo, someone
  should diff its actual layout, exact filter option lists, and any cell
  annotations against what's built here, since the extraction in the task
  brief already flags one ambiguity (item 5 below) and may have missed others.
- **Status:** needs-client-input

## [1] Forecast numbers
- **Location:** `src/data/mockForecast.ts` (`buildBaselineMetrics`, `generateAllRows`)
- **What it does now:** Applications/Approvals/Originations are generated with
  a deterministic pseudo-random formula (`Math.sin` based hash keyed on the
  row's dimension values), so the same filter combination always renders the
  same numbers across re-renders, but the numbers carry no real-world meaning.
- **What it should do:** Phase 1 regression engine output, once it exists and
  is validated against the production Excel model (see `CLAUDE.md` Section 0
  — currently blocked: four modeling methodologies tried, none working;
  additional data requested from Akriti, blocked pending her return from
  leave; all-hands sprint targeting ~September 15).
- **Status:** placeholder

## [2] Scenario lever effect on the table
- **Location:** `src/data/scenarioEngine.ts` (`applyLevers`)
- **What it does now:** Naive placeholder multiplier, chosen explicitly (not
  left ambiguous): each Marketing Lever's % delta multiplies Applications
  only for rows whose `detailTactic` matches that lever (e.g. the "Paid
  Search" lever only moves rows where Detail Tactic = Paid Search). The
  Credit and Pricing lever's % delta is applied as `1 + delta/100 * 0.5` to
  both the approval-rate and origination-rate conversion for every row in
  that scenario, uniformly. There is no statistical basis for the 0.5
  coefficient or for treating marketing/credit effects as independent
  multipliers — it exists solely to prove the lever → table wiring works.
- **What it should do:** Whatever the actual scenario-modeling logic turns
  out to be under Phase 2 Workstream 2 ("like-for-like forecasts using the
  statistical structure of comparable lanes" per the SOW).
- **Status:** placeholder

## [3] Marketing Levers input type
- **Location:** `src/components/LeversPanel.tsx`, `src/types/forecast.ts` (`MarketingLevers`)
- **What it does now:** Built as numeric % delta from baseline spend, one
  input per channel (Paid Search, Paid Social, Prescreen, Referrals, Lead
  Generation, Sweepstakes). This was a default assumption — `UX_V2.xlsx`'s
  extracted structure doesn't specify the input type.
- **What it should do:** Needs client confirmation on whether these should be
  spend-dollar inputs, touchpoint-count inputs, or something else. Changing
  this only requires editing `MarketingLevers`, `LeversPanel.tsx`, and the
  corresponding math in `scenarioEngine.ts` — no other component reaches into
  lever internals directly.
- **Status:** needs-client-input

## [4] Credit and Pricing Levers
- **Location:** `src/components/LeversPanel.tsx`, `src/types/forecast.ts` (`ScenarioLevers.creditAndPricing`)
- **What it does now:** A single generic numeric "Credit and Pricing
  Adjustment (%)" input. No sub-levers were specified in the source sheet
  structure at all.
- **What it should do:** Needs the client to specify actual levers (e.g. FICO
  cutoff, APR, credit score percentile threshold) before this can be built as
  more than one placeholder field.
- **Status:** needs-client-input

## [5] H Tactic vs. Product ambiguity
- **Location:** `src/data/filterOptions.ts` (`H_TACTIC_OPTIONS`)
- **What it does now:** The filter list extracted from the sheet
  ("ILP, FLC, Line of Credit, Payday Loan, Not Funded") is assigned to the "H
  Tactic" filter, on the assumption that it is a high-level tactic dimension.
- **What it should do:** A "Products" label also appears near this list in
  the source sheet's structure — this may actually be the Product list,
  mislabeled, rather than a genuine H Tactic dimension distinct from Product.
  Needs confirmation with the client before finalizing; do not assume the
  current assignment is correct.
- **Status:** needs-client-input

## [6] Filter option lists
- **Location:** `src/data/filterOptions.ts`
- **What it does now:** `STATE_OPTIONS`, `CUSTOMER_TYPE_OPTIONS`, and
  `CHANNEL_OPTIONS` are the full distinct values pulled from `tblActuals.csv`
  (25 states, 2 customer types, 3 channels including `UNKNOWN`). Note: this
  25-state list does **not** match `CLAUDE.md` Section 1's list of 21
  confirmed production-workbook state tabs (KS, NC, SC, TN appear in
  `tblActuals.csv` but not in the 21-tab list) — that discrepancy is
  unresolved and not something this prototype attempts to reconcile; per
  `CLAUDE.md` Section 8, in-scope-state status is a scope boundary, not a
  data-availability boundary, and the two should not be conflated. `H Tactic`,
  `Detail Tactic`, and `Product` option lists come from the UX_V2.xlsx
  structure as described in the task brief (not from `tblActuals.csv`, which
  only carries `PRODUCT_CD` at ILP/PDL grain).
- **What it should do:** Once a real backend/data source exists, these should
  be derived from live data rather than hardcoded, and the state-list
  discrepancy above should be resolved with the client-facing team.
- **Status:** placeholder

## [7] 12-month horizon vs. Dec 2027
- **Location:** `src/data/mockForecast.ts` (`MONTH_OPTIONS`)
- **What it does now:** Table shows Mar 2026 – Feb 2027 (12 months), matching
  the source sheet's own horizon.
- **What it should do:** Extend to Dec 2027 to match the actual Phase 1
  forecast horizon per the SOW. Flagged, not fixed, in this pass — task brief
  explicitly deferred this.
- **Status:** placeholder

## [8] Metric toggle: reconciling two spec readings
- **Location:** `src/components/MetricToggle.tsx`
- **What it does now:** A three-way toggle — Counts / Approval Rate /
  Origination Rate — that swaps the funnel table's three count columns
  (Applications/Approvals/Originations) per scenario group for a single rate
  column. This is an interpretation call, not a spec-confirmed decision: the
  task brief's Section 1 describes the toggle as switching between Approval
  Rate and Origination Rate "independent of the funnel-count table," while
  the acceptance criteria (Section 7) ask for a toggle that switches the
  table between rate-based and count-based views. This implementation
  satisfies both readings but was not confirmed with the client.
- **What it should do:** Confirm with the client whether the metric toggle
  should affect the funnel table at all, or whether it should instead drive a
  separate rate-only chart/summary that leaves the funnel-count table
  untouched.
- **Status:** needs-client-input

## [9] Row cap on the rendered table
- **Location:** `src/components/ForecastTable.tsx` (`MAX_RENDERED_ROWS`)
- **What it does now:** The full filtered result set is computed, but only
  the first 500 rows are rendered in the `<table>`, with a "Showing X of Y —
  narrow filters to see more" note. The full cross-product of all filter
  dimensions × 12 months is ~108,000 rows; a plain `<table>` rendering all of
  them at once would be a real performance problem in the browser, which
  Section 2 of the task brief anticipated ("a small headless table lib if the
  row count grows large").
- **What it should do:** If the row count needs to be fully browsable without
  narrowing filters, swap in a virtualized/windowed table component instead of
  raising the cap.
- **Status:** placeholder
