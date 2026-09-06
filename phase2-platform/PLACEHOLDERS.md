# Placeholder Registry — Non-New Origination Scenario Planner (React UI prototype)

This registry tracks every fabricated number, naive placeholder behavior, and
unconfirmed UX assumption in this project. See `CLAUDE.md` and the task
brief for the full framing: this is a UI prototype only, built ahead of Phase 1
sign-off at the client's explicit instruction, and is not an approved Phase 2
deliverable. Every number the app shows is fabricated. Update this file's
`Status` field and remove/rewrite an entry the moment its placeholder is
replaced with real logic — do not let stale entries accumulate.

## [0] `UX_V2.xlsx` — now read directly, corrected two earlier guesses
- **Location:** N/A — applies to the whole build
- **What it does now:** `UX_V2.xlsx` was added to the repo after this
  prototype's first pass, which had been built from the task brief's prose
  description of the sheet's structure. On re-reading the actual file
  (`Sheet1`, via its embedded Excel Form Controls — dropdowns, checkboxes,
  scroll bars — not just cell values), two things the prose description got
  wrong were corrected: see items 4 and 5 below. Everything else (5 dropdown
  filters, a distinct "Products" checkbox group, 3 scenario blocks each with
  Marketing Levers + Credit and Pricing Levers, the funnel table layout and
  12-month horizon) matched what was already built.
- **What it should do:** Nothing further needed for this item — the file is
  now the actual source of truth used, not a secondhand description of it.
- **Status:** confirmed-real

## [0b] Excel Form Controls in the source file are unconfigured mockup shapes
- **Location:** N/A — applies to `filterOptions.ts` and `LeversPanel.tsx`
- **What it does now:** `UX_V2.xlsx`'s dropdown controls (State, Customer
  Type, Channel, H Tactic, Detail Tactic) have no bound cell link or list
  range configured at all (confirmed by inspecting the file's raw XML/VML —
  no `fmlaLink`/`fmlaRange` anywhere) — they're purely visual placeholder
  shapes dropped onto the canvas, never wired up, consistent with this being
  a layout mockup rather than a working spreadsheet tool. Same for the
  checkboxes and scroll bars: no linked cells.
- **What it should do:** This confirms (not just assumes) that filter option
  lists and lever semantics need client input — there was never a real answer
  encoded in the file to extract. See items 4, 5, and 6.
- **Status:** confirmed-real

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
- **What it does now:** Naive placeholder logic, chosen explicitly (not left
  ambiguous): each Marketing Lever's % delta multiplies Applications only for
  rows whose `detailTactic` matches that lever (e.g. the "Paid Search" lever
  only moves rows where Detail Tactic = Paid Search). The Approval Rate lever
  multiplies the approval-rate conversion directly (`1 + delta/100`); the
  Origination Rate lever does the same to origination-rate conversion,
  independently. There is no statistical basis for treating these three
  effects as independent linear multipliers — it exists solely to prove the
  lever → table wiring works.
- **What it should do:** Whatever the actual scenario-modeling logic turns
  out to be under Phase 2 Workstream 2 ("like-for-like forecasts using the
  statistical structure of comparable lanes" per the SOW).
- **Status:** placeholder

## [3] Marketing/Credit Levers input type — corrected to match the source file
- **Location:** `src/components/LeversPanel.tsx`, `src/types/forecast.ts` (`MarketingLevers`, `CreditAndPricingLevers`)
- **What it does now:** Built as 0-100 range sliders, one per lever. This was
  changed from an earlier free-typed numeric field once `UX_V2.xlsx` was
  actually read: every lever in the sheet (Marketing and Credit and Pricing
  alike) is implemented as an Excel Form Control **Scroll Bar** with `Min=0`,
  `Max=100` — a control type that is structurally incapable of going
  negative. The 0-100, non-negative range is now confirmed-real; what each
  slider's value actually represents (a % delta on spend, a touchpoint
  count, a rate itself) is still not stated anywhere in the file.
- **What it should do:** Needs client confirmation on the unit/meaning of
  each slider. Changing this only requires editing `MarketingLevers`/
  `CreditAndPricingLevers`, `LeversPanel.tsx`, and the corresponding math in
  `scenarioEngine.ts` — no other component reaches into lever internals
  directly.
- **Status:** needs-client-input

## [4] Credit and Pricing Levers — corrected from "no sub-items" to two named levers
- **Location:** `src/components/LeversPanel.tsx`, `src/types/forecast.ts` (`ScenarioLevers.creditAndPricing`)
- **What it does now:** Two sliders, "Approval Rate" and "Origination Rate,"
  each independently moving that named conversion rate. This replaces an
  earlier single generic "Credit and Pricing Adjustment (%)" field, built
  before `UX_V2.xlsx` was available, on the assumption (stated in the task
  brief) that "no sub-items were specified in the sheet at all." Reading the
  actual file showed that's wrong: each scenario's "Credit and Pricing
  Levers" group box contains exactly two named scroll-bar controls,
  literally labeled "Approval Rate" and "Origination Rate" — the same two
  metrics the Metric Toggle displays. The existence and naming of these two
  sub-levers is now confirmed-real; what they actually do when moved (set an
  absolute target rate vs. apply a delta to the baseline rate) is not stated
  in the file and is implemented here as a delta, matching the Marketing
  Levers' interpretation — that choice is not confirmed.
- **What it should do:** Needs the client to confirm whether these are
  absolute rate overrides or deltas, and by what mechanism (e.g. FICO
  cutoff, APR change) they'd actually move approval/origination rates.
- **Status:** needs-client-input

## [5] H Tactic vs. Product — resolved by reading the source file directly
- **Location:** `src/data/filterOptions.ts` (`H_TACTIC_OPTIONS`, `PRODUCT_OPTIONS`)
- **What it does now:** `PRODUCT_OPTIONS` is `ILP, FLC, Line of Credit,
  Payday Loan, Not Funded` — confirmed directly from `UX_V2.xlsx`: those five
  values are checkboxes inside a group box whose own caption literally reads
  "Products" (Sheet1, Group Box 17). This is the opposite of what this
  prototype originally guessed (that list had been assigned to H Tactic, on
  the assumption from the task brief that the sheet's own labeling might be
  wrong). It wasn't wrong — the ambiguity was in the *prose description* of
  the sheet, not the sheet itself. `H_TACTIC_OPTIONS` is now a small, clearly
  fake placeholder list (`Tactic Alpha/Beta/Gamma`) rather than a plausible-
  looking guess, because H Tactic's dropdown control in the source file has
  no configured option list at all (see item 0b) — there was nothing to
  extract for it.
- **What it should do:** Needs the client to supply H Tactic's actual value
  list; nothing in `UX_V2.xlsx` defines one.
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
  and `Detail Tactic` option lists could not be sourced from `tblActuals.csv`
  (which only carries `PRODUCT_CD` at ILP/PDL grain, not this level of
  detail); `Product` is confirmed-real from `UX_V2.xlsx` directly (see item
  5), `Detail Tactic` matches the sheet's Marketing Levers row labels, and
  `H Tactic` is an intentionally-fake placeholder list since the source file
  defines none (see item 5).
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
