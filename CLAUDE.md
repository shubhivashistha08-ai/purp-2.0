# Non-New Origination Forecast — Claude Code project instructions

This file is read automatically by Claude Code. It is the single source of truth for
scope, known bugs, and what "done" means. Do not skip the validation section — several
past bugs in this project passed row-count checks and were only caught by independent
spot-checks against raw data.

**Last reconciled:** against `ScopeOfWork.pdf`, `project_summary.md`,
`validation_findings_and_gaps.md`, the live `.xlsx` workbook, and the two most recent
client emails (scope-shift + structure email; progress-update email). See Section 0
for what changed and why.

## 0. Status flags — read this before anything else

- **Regression lag-matrix query in `project_summary.md` §5d is NOT confirmed correct.**
  The SQL as printed there still uses `months_between(t2.bom_orig_dt, t1.bom_orig_dt)`
  in every `mXX_new_cn` column — this is the exact buggy argument order documented in
  `validation_findings_and_gaps.md` §3.2, which found that this ordering pulls
  NEW-customer counts from N months *after* the non-new event instead of N months
  *before*, and that "every `mXX_new_cn` value mismatched" when checked. `project_summary.md`
  §6's claim of "0 mismatched cells across 201,024 cells" contradicts this and should
  be treated as stale/invalid until re-verified. **Do not build features on top of
  this table without first re-running the swap (`months_between(t1, t2)`) and
  re-checking values by hand.**
- **Marketing touchpoint frequency has been added to Phase 1 scope** (client email,
  in addition to marketing spend, which was already in-scope for Phase 1 per the SOW).
  See Section 6.
- **Workstream 5's build/ownership split is being actively re-negotiated with the
  client's IT team, not settled.** A same-week alignment call was requested by the
  client to confirm "where the lines of responsibility will lie," and scope/price
  are explicitly under discussion. Section 7's description reflects the SOW's
  original language, which may not be final — confirm before treating it as binding.
- **Phase 1 modeling is underway and currently failing.** Per the latest client
  update: data preparation is complete, four modeling methodologies have been
  tried, and none produced promising results. Additional data has been requested
  from Akriti in a different shape and is blocked pending her return from leave.
  An all-hands 5–7 day sprint is planned once that data lands, targeting
  **~September 15** for a high-accuracy result. This is schedule risk that isn't
  reflected anywhere else in this repo — treat the Phase 1 timeline as at risk
  until the sprint outcome is known.
- **`ScopeOfWork.pdf` is referred to below as authoritative for scope**, but its
  signature status has not been independently confirmed from any document in this
  repo — don't cite it as "signed" without checking with the client-facing team.

## 1. What this project is

The client forecasts loan originations from **non-new (returning) customers** at
state × product × channel granularity. The current production model is a manual
Excel workbook: 21 state tabs (confirmed directly from the workbook — MS, TX, FL, WI,
UT, OK, OH, NV, MO, ID, AL, DE, KY, RI, WY, MI, LA, IA, IN, CA, CO), single driver =
months-since-previous-origination, 15-month cohort renewal curves. It cannot absorb
new states/products without manual tab creation and ignores marketing spend,
marketing touchpoints, credit risk, and funded amount as predictors.

Two-phase engagement (see `ScopeOfWork.pdf` in this repo for the authoritative text):

- **Phase 1** — rebuild the forecast as a statistically rigorous, multi-factor
  regression engine. Deliverable is a **forecast file + methodology document**, not
  a platform.
- **Phase 2** — five workstreams extending Phase 1: sparse-data reliability, what-if
  scenario modeling, additional variable integration, a Python front-end
  (Streamlit-class), and technology-team implementation support.

**Do not build Phase 2 before Phase 1 is delivered and accepted.** Phase 2 is priced
and scoped separately per the SOW. If asked to jump ahead, flag it rather than
proceeding silently.

## 2. Data already in this repo

| File | Contents | Status |
|---|---|---|
| `tblActuals.csv` | 14,142 rows, aggregate monthly counts by year/month/state/product/channel/customer type | Loaded, verified against source |
| `dataUpload.sql` | Creates `public.tblActuals` (camelCase columns), loads the CSV | Verified — **camelCase is the live schema**, a later snake_case variant is NOT what's loaded |
| `pg.sql` | Schema for `public.tempo_applications` (loan-level, credit attributes) | Table created, **empty** — source CSV (`tempoApr26+.csv`) has never been provided |
| `FPA_2026_Origination_Renewal_Model_*.xlsx` | The current production Excel model (21 state tabs, vintage curves, plus pivot/lookup/rollup tabs including `3.1 Refcst Non_new origination` and `3.3 Actual Origination Cnt PM`) | Ground truth for Phase 1 parity checks |
| `Marketing_Forecast_Proposal.docx` | Original proposal narrative | Background only, not authoritative on scope — `ScopeOfWork.pdf` is |
| `ScopeOfWork.pdf` | Scope, phase boundaries, out-of-scope list | **Authoritative for what to build** — signature status unconfirmed, see Section 0 |
| `project_summary.md` | Methodology explanation, task status, SQL history | Read before touching any SQL — contains the §5d query, whose "verified" label is disputed (Section 0) |
| `validation_findings_and_gaps.md` | Full bug log and open gaps | Read before writing new SQL — documents the months_between direction bug and other unresolved gaps; treat as more current than `project_summary.md` where the two disagree |

`tempo_applications` (credit score, funded amount, per-loan data) is a Phase 2
dependency (Workstream 3) and currently has no source data. Do not assume it's
populated.

## 3. Regression lag-matrix query — reuse the logic, but re-verify the direction first

The lag-matrix query in `project_summary.md` §5d is structurally sound: it correctly
produces one row per (month, state, current product, previous product, channel),
6,168 rows total, with all 4 lane combinations present (ILP→ILP, ILP→PDL, PDL→ILP,
PDL→PDL). **Do not rederive the row/lane structure from scratch.**

However, per Section 0, the specific `months_between()` argument order printed in
that query has not been confirmed fixed, and a directly contradictory result exists
in the source docs (`project_summary.md` claims 0 mismatches; `validation_findings_and_gaps.md`
found every `mXX_new_cn` value wrong under this exact argument order). Before using
this table as a feature source:

1. Confirm which argument order is actually deployed by re-running the 5 hand-computed
   spot-checks in `validation_findings_and_gaps.md` §3.3 against current output.
2. If they fail, apply the swap: `months_between(t1.bom_orig_dt, t2.bom_orig_dt)`.
3. Extend the spot-check to the two cross-product lanes (ILP→PDL, PDL→ILP), which
   `validation_findings_and_gaps.md` explicitly flags as never independently checked
   (only same-product lanes have hand-verified values).
4. A full independent diff of all 6,168 rows has never been done — only a 5-row
   spot-check. Don't describe the table as "fully verified" in any methodology
   document until that's actually been run.

## 4. Known bugs — do not reintroduce these

1. **`months_between()` argument order.** See Section 0 and Section 3 — this is not
   a closed issue. The buggy order silently pulls "N months after" instead of
   "N months before" and passes row-count and source-data checks anyway. When you
   write any date-gap logic, verify direction with hand-computed examples, not
   just row counts.
2. **Cross-product lane drop via join condition.** A newer draft (`pf2_all_data`)
   joins on `t1.product_cd = t2.product_cd`, which structurally excludes
   ILP→PDL and PDL→ILP. This is currently **unresolved** — confirm intent before
   reusing that join pattern.
3. **The `lookup` concat key** (`yymm|state|product|prev_product`) is not unique —
   it omits channel, so Digital and Physical rows collide. Never use it as a
   join or dedup key; add channel to the key first.
4. **Per-day rounding before summing.** Apportioning a monthly count across
   working days and rounding each day *before* summing inflates totals
   (e.g. 100/22 → 4.545 → rounds to 5 × 22 = 110 ≠ 100). Round once, at final
   aggregation, never per-row.

## 5. Open gaps — do not silently assume these are solved

- **Regression lag-matrix direction and completeness** (see Sections 0/3): the
  claimed "0 mismatched cells" full check is contradicted by a later bug report
  and should not be trusted as-is. Cross-product lanes have never been
  independently spot-checked. A full row-by-row diff has never been run.
- Sheet `3.1 Refcst Non_new origination` needs `MONTHS_SINCE_PREV_ORIG` and
  `PREV_PRODUCT_CD` computed **per customer** — structurally impossible from the
  aggregate `tblActuals` source. Needs transaction-level data with a loan/customer
  ID (closer to the `tempo_applications` schema). Flag this rather than
  approximating it from aggregates.
- Dimension hierarchies (state→region, product→family, date→fiscal quarter) need
  business mapping rules from the client — not inferable from the data. Don't
  invent a region grouping.
- "Look-alike state" definition is undefined by the client. Do not assume a
  specific technique (e.g. geographic proximity) without confirming.
- Nothing has yet been validated against the **actual Excel forecast/vintage
  model** (state tabs, sheet `3.1`) — only against raw aggregate source data
  (`tblActuals` / `3.3`). Passing a source-data check is not the same as matching
  the production model's output.
- The `pf2_all_data` calendar/apportionment script has not been run or checked at
  all — blocked on missing dependency tables (`calendar`, `state_cd` with region/
  look-alike mapping) and the join-regression bug above.

## 6. Phase 1 — build this first

**Objective:** predict non-new booking counts at state × product × channel level
through December 2027.

**Required:**
- Statistical regression (start with Ridge or a distributed-lag approach; confirm
  via exploratory data analysis, not by default)
- Inputs: prior new-customer bookings (primary driver), **marketing spend by
  channel, and marketing touchpoint frequency by channel** (touchpoints added to
  Phase 1 scope per client request — previously only spend was explicit here).
  Add other variables only if they demonstrably improve accuracy — document the
  comparison, don't add variables on assumption.
- Output: a forecast file (state × product × channel × month, through Dec 2027)
  and a methodology document explaining the approach, variables, and validation
  results.
- Validate against the existing Excel model's historical output before treating
  the new engine as correct — a new model that merely runs without error is not
  a validated model.

**Current status (see Section 0):** data prep is complete; four modeling
methodologies have been tried against this objective and none has produced
promising results yet. A data reshape has been requested from Akriti and is
blocking further progress until she returns from leave. An all-hands sprint is
planned once that data arrives, targeting ~September 15. Treat the Phase 1
timeline as at risk, not on track, until that sprint concludes.

**Explicitly not in Phase 1:** any Streamlit/React interface, real-time data
integration, automated retraining, new-customer forecasting, or states/products
not currently in scope.

## 7. Phase 2 — build only after Phase 1 is accepted

Five workstreams, each independently scoped:

1. Sparse-data reliability (look-alike borrowing, Bayesian shrinkage, pooled
   estimation) — prerequisite for new-launch forecasting.
2. What-if scenario modeling for product/state launches.
3. Additional variables: credit risk score distributions (mean/25th/75th
   percentile), funded amount.
4. Python front-end (Streamlit-class) for non-technical users to run forecasts
   and track actuals vs. forecast.
5. Technology implementation support. **Per the SOW this was capped at 12 hours
   total, with the consulting side limited to a technical requirements document
   plus one reference Python script, and the client's technology team owning the
   production build.** However, per the client's most recent structure email,
   this split is currently being re-confirmed directly with IT (who raised
   concerns about owning externally-developed code), and scope/price for this
   workstream may change as a result. **Do not treat the 12-hour cap or the
   division of labor as final until that alignment call has happened.**

If a React frontend is requested instead of Streamlit for Workstream 4, that's a
valid substitution but adds a second codebase, a second host, and CORS
configuration the SOW's "Streamlit or equivalent" language doesn't require —
call this out rather than defaulting into it.

## 8. Explicitly out of scope (do not build without a written change request)

- New-customer forecasting
- Data extraction/cleansing/pipeline build from source systems (client supplies
  data in agreed format)
- Real-time integration or automated retraining pipelines
- Ongoing model monitoring/maintenance post-implementation
- States, products, or channels not currently **in scope** (note: this is a scope
  boundary, not a data-availability boundary — a state could be in scope with no
  data loaded yet, or vice versa; don't conflate the two)

## 9. Validation standard

Before marking anything "done":
- Row counts matching is necessary but not sufficient (see bug #1 above) — spot
  check actual values by hand for at least 5 cases across different lanes and
  month gaps.
- Any join must be checked for silently dropped categories (see bug #2) —
  verify all expected lane/category combinations appear in the output, not just
  that row counts look plausible.
- State the confidence level explicitly: "spot-checked N of M rows" is not the
  same as "independently diffed all rows" — don't conflate them in the
  methodology doc. (This exact conflation is why Section 0's flag on the §5d
  query exists — don't repeat it.)

## 10. Suggested repo structure

```
/data/                  # tblActuals.csv, any new source files as they arrive
/sql/                   # dataUpload.sql, pg.sql, and new query files
/phase1-forecast/        # Python: feature engineering, regression model, forecast output
/phase2-platform/        # Streamlit or React+FastAPI app (only after Phase 1 sign-off)
/docs/                   # methodology.md, validation_report.md, this file's source docs
```
