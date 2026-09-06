# Non-New Origination Forecast — Validation Findings & Gaps

*Session log — compiled from SQL validation work against `tblActuals` and the Excel `3.3` tab*

> **Note (added on repo reconciliation):** This file is the authoritative source on the
> `months_between()` direction bug described in Section 3.2 below. `project_summary.md`
> §5d/§6 contains an older, disputed claim that the same query was "verified exact
> match" with "0 mismatched cells" — that claim is contradicted by the finding here
> and should not be trusted until the query is re-run and re-checked against Section
> 3.3's spot-check cases. Where the two files disagree, treat this one as current.

---

## 1. Summary

Two things were being validated in this session:

1. **Source data integrity** — does the live `tblactuals` table in Postgres still match the current Excel `3.3 Actual Origination Cnt PM` tab?
2. **Regression matrix logic** — does the SQL that builds the lag-feature table (`m01_new_cn` ... `m15_new_cn`) actually compute what it's supposed to?

(1) passed cleanly. (2) initially **failed** — a real bug was found and fixed. A third piece of work (the newer `pf2_all_data` / calendar-apportionment script) was reviewed and has **two unresolved issues** before it's usable.

---

## 2. Source data validation — PASSED

**Goal:** confirm `tblactuals` (already loaded, 14,142 rows) still matches a fresh export of Excel `3.3`.

**Process:**
- Excel `3.3` was exported to `excel_3_3.csv`. The export included the 7 real data columns plus **7 extra helper/lookup columns** (concatenated keys, `Grouping`, blank headers) and **329 fully blank trailing rows** — total 14,471 rows / 14 columns in the raw file.
- Loaded raw file into a 14-column `excel_3_3_staging` table, then inserted only the 7 real columns (filtering `WHERE orig_yr IS NOT NULL`) into a clean `excel_3_3` table.

**Result:**
| Check | Result |
|---|---|
| `excel_3_3_staging` row count | 14,471 ✅ (matches 14,142 real + 329 blank) |
| `excel_3_3` row count | 14,142 ✅ |
| `excel_3_3 EXCEPT tblactuals` | 0 rows ✅ |
| `tblactuals EXCEPT excel_3_3` | 0 rows ✅ |

**Conclusion:** the two tables are row-for-row identical. Source data has not drifted since the original load. **This only validates the raw input data — it says nothing about whether downstream SQL logic is correct.**

---

## 3. Regression matrix validation — BUG FOUND AND FIXED

### 3.1 What the regression matrix is supposed to do

For every NON_NEW origination (state, product, channel, month), find how many NEW originations happened in that same state/channel exactly 1, 2, 3 ... 15 months **before** it, and put each of those 15 counts in its own column (`m01_new_cn` ... `m15_new_cn`). This produces one row per (month, state, current product, previous product, channel), 6,168 rows total across all 4 lane combinations (ILP→ILP, ILP→PDL, PDL→ILP, PDL→PDL).

### 3.2 Bug found: `months_between()` argument order was reversed

**Original code:**
```sql
sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 1 then t2."cn" else 0 end) as m01_new_cn,
```
where `t1` = NON_NEW (later event), `t2` = NEW (should be the earlier event).

`months_between(end_date, start_date)` computes `AGE(end_date, start_date)`. Called as `months_between(t2, t1)`, this computes `t2 − t1`. For a genuine "N months before" match, `t2` should be earlier than `t1`, making `t2 − t1` **negative** — which can never equal a positive N. The `CASE WHEN ... = 1..15` therefore only matched cases where `t2` fell chronologically **after** `t1** — i.e., every `mXX_new_cn` column was silently pulling NEW-customer counts from **N months after** the non-new event, not N months before.

**Confirmation:** 5 independently-computed spot-checks (values calculated directly from `tblActuals.csv` outside SQL) all showed `non_new_cn` matching exactly, but every `mXX_new_cn` value mismatched. Testing the "N months after" hypothesis against the same 5 cases matched the actual SQL output exactly in all 5 — confirming the direction, not just the presence, of the bug.

**Fix:** swap the argument order —
```sql
sum(case when months_between(t1.bom_orig_dt, t2.bom_orig_dt) = 1 then t2."cn" else 0 end) as m01_new_cn,
```
applied across all 15 lag columns.

**Impact:** every `m01_new_cn` ... `m15_new_cn` value in the previously-built `regression_matrix` table (all 6,168 rows) was wrong before this fix. Row counts, `non_new_cn`, and the source-data checks in Section 2 all passed throughout — none of those checks would have caught this, because the bug is purely in join/aggregation direction, not row counts or raw data.

**⚠️ Reconciliation note:** the query as printed in `project_summary.md` §5d still uses the
*original* (buggy) argument order shown above, not the fixed version. The "fix" described
here has not been confirmed as applied to that file's copy of the query — check the live
SQL directly, don't assume `project_summary.md` reflects this fix.

### 3.3 Spot-check methodology used

5 test pairs, values computed independently from `tblActuals.csv` (not from the SQL being tested):

| # | Lane | Target month | Gap | Source month | Purpose |
|---|---|---|---|---|---|
| 1 | AL / ILP→ILP / PHYSICAL | Oct-2022 | 6 | Apr-2022 | baseline, mid-year |
| 2 | CA / PDL→PDL / DIGITAL | Mar-2023 | 3 | Dec-2022 | different state/product/channel |
| 3 | TX / PDL→PDL / PHYSICAL | Jan-2023 | 12 | Jan-2022 | full-year gap, same calendar month |
| 4 | AL / ILP→ILP / DIGITAL | Jan-2023 | 1 | Dec-2022 | Dec→Jan year-boundary |
| 5 | CA / PDL→PDL / DIGITAL | Jan-2023 | 2 | Nov-2022 | Dec→Jan year-boundary, 2-month gap |

All 5 currently only test same-product lanes (ILP→ILP, PDL→PDL) — **cross-product lanes (ILP→PDL, PDL→ILP) have not yet been spot-checked** with independently-sourced values. This is a gap (see Section 5).

**Status after fix:** all 5 should now read `PASS` — confirm by rerunning after rebuilding `regression_matrix` with the corrected query.

**Note on confidence level:** 5 rows out of 6,168 is a reasonable spot-check, not proof of correctness across the whole table. A full independent diff (rebuilding expected values via plain date arithmetic for every row and `EXCEPT`-ing against `regression_matrix`) has not been done.

---

## 4. Newer `pf2_all_data` / calendar-apportionment script — NOT YET VALIDATED, 2 open issues

A newer version of the pipeline (dated 31-Aug/1-Sep in the SQL comments) adds calendar/region/look-alike-state logic and apportions monthly counts across working days. This has **not been spot-checked at all** — and has two structural issues to resolve first.

### 4.1 Missing dependency tables

The script requires `calendar.csv`, `state_cd.csv`, `product_cd.csv`, `channel_cd.csv`, `customer_tp.csv` to already be loaded. None were available in this session. Breakdown of what's actually needed:

| Table | Derivable from `tblactuals`? | Notes |
|---|---|---|
| `product_cd` | ✅ Yes — `SELECT DISTINCT product_cd` | Trivial |
| `channel_cd` | ✅ Yes — `SELECT DISTINCT customer_channel` | Trivial |
| `customer_tp` | ✅ Yes — `SELECT DISTINCT customer_tp` | Trivial — worth checking for blank/NaN values seen during earlier CSV inspection |
| `state_cd` | ❌ No | Needs `region` and `look_alike_state_cd` — business mapping rules, not inferable from origination counts. **Already flagged in `project_summary.md` as an open item under "Dimension hierarchies."** |
| `calendar` | ⚠️ Partial | Weekday/weekend flag is computable (`EXTRACT(ISODOW FROM date) < 6`); holiday exclusions (if the original `is_workday` logic accounts for holidays, which is likely) are not derivable without the actual file. |

### 4.2 Join regression: cross-product lanes silently dropped

```sql
left join (...NEW...) t2
on      t1.orig_state_cd = t2.orig_state_cd
and     t1.channel_cd = t2.channel_cd
and     t1.product_cd = t2.product_cd   -- forces same product on both sides
```

This restricts the join to only **ILP→ILP** and **PDL→PDL** — the two cross-lane combinations (**ILP→PDL**, **PDL→ILP**) that were specifically fixed earlier in this same project (changelog: *"31-Aug: Added script to handle all 4 renewal lanes"*) are structurally impossible to produce with this join condition. This directly contradicts the changelog comment sitting right above it in the same file.

**Status: unresolved.** Need to confirm whether this restriction is intentional in the newer script, or a regression that should be removed (dropping `t1.product_cd = t2.product_cd` from the join, matching the earlier verified-correct version).

### 4.3 Decimal apportionment and integer rounding

The script apportions each month's whole-number count across working days:
```sql
cast((is_workday*dt.cn*1.000/working_days_num) as decimal(7,3)) as cn
```
This is intentional (feeds the working-day-normalized weekly rollup described in the proposal), not a bug — but it means `pf2_all_data.cn` is fractional per day.

**Recommended fix (not yet applied/tested):** round only at final aggregation, not per-day:
```sql
ROUND(sum(case when mob = 1 then cn_new else 0 end))::int as m01_new_cn,
```
Rounding per-day before summing would compound rounding error across the month (e.g., `100/22 = 4.545` → rounds to `5` per day × 22 days = `110`, inflating the true total of `100`).

**Open question:** even summing fractional daily values back up and rounding once at the end is not guaranteed to exactly reproduce the original integer `cn` — this round-trip has not been tested. Should be included in spot-checks once the join issue (4.2) is resolved.

---

## 5. Full list of open gaps

| # | Gap | Status |
|---|---|---|
| 1 | `pf2_all_data` script: missing `calendar`, `state_cd` (with region/look-alike), `product_cd`, `channel_cd`, `customer_tp` tables | Blocked — 3 of 5 are trivial to derive, 2 need external input |
| 2 | `pf2_all_data` script: join forces `t1.product_cd = t2.product_cd`, dropping cross-product lanes | Unresolved — confirm intentional or regression |
| 3 | Decimal-to-integer rounding fix for `pf2_all_data` apportionment | Proposed fix not yet applied or tested |
| 4 | Cross-product lanes (ILP→PDL, PDL→ILP) in `regression_matrix` | Not yet spot-checked with independent values (only same-product lanes checked so far) |
| 5 | Full independent diff of all 6,168 `regression_matrix` rows | Not done — only 5-row spot-check completed |
| 6 | Sheet `3.1 Refcst Non_new origination` | Blocked — needs customer/loan-level transaction data (`MONTHS_SINCE_PREV_ORIG`, `PREV_PRODUCT_CD`) that aggregate `tblActuals` cannot supply |
| 7 | `tempo_applications` table | Schema exists, table empty — source CSV (`tempoApr26+.csv`) never provided |
| 8 | Dimension hierarchies (state→region, product→family, date→fiscal quarter) | Not started — needs actual business mapping rules from the team |
| 9 | "Look-alike fields" definition | Undefined — needs clarification on intended meaning |
| 10 | Validation against actual Excel forecast model (state tabs `AL`/`CA`/`TX`, sheet `3.1`) | Not started — everything validated so far is against the *aggregate source data* (`3.3`), not the *forecast logic* itself |
| 11 | Infographic (shared earlier in session) — Step 4 calculation logic | Incorrect: illustrated one fixed pool multiplied across all 16 month-gap rates ("lifetime renewal" calc), but the actual Excel formula pulls a *different* historical pool for each gap, matched to a specific target month |
| 12 | `lookup` concat key in `regression_matrix` | Does not include `customerChannel` — not a unique key; do not use for joins/dedup without adding channel |
| 13 | `project_summary.md` §5d/§6 "verified exact match" claim | Contradicted by Section 3.2 above — needs reconciliation (re-run and confirm which claim is actually current) |

---

## 6. What has NOT been validated (be clear-eyed about this)

- The regression matrix has only been checked against **raw aggregate source data** (`tblactuals`/`excel_3_3`), never against the **actual Excel forecast/vintage model** (state tabs, `3.1`). Those two things test different claims — passing one doesn't imply the other passes.
- The `pf2_all_data` calendar/apportionment script has not been run or checked at all in this session (blocked on missing tables and the join issue above).
- Cross-product lanes in the main regression matrix are unverified against independent numbers.
- Whether `project_summary.md`'s copy of the §5d query has actually been updated with the fix described in Section 3.2 above — unconfirmed, treat as not fixed until checked directly.
