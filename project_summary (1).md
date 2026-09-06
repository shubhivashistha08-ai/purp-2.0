# Non-New Origination Forecast — Project Summary

*Status as of this session*

> **⚠️ Correction note added after later review — see `validation_findings_and_gaps.md` §3.2.**
> The "0 mismatched cells" result in Section 6 below and the "verified exact match"
> label on the query in Section 5d were disputed by a later validation pass, which
> found that the exact `months_between()` argument order used in the query below
> (`months_between(t2.bom_orig_dt, t1.bom_orig_dt)`) computes the wrong direction —
> pulling NEW-customer counts from N months *after* the non-new event instead of
> N months *before* — and that "every `mXX_new_cn` value mismatched" when independently
> spot-checked. **Do not treat Section 5d or Section 6's regression-matrix rows as
> verified until this is re-run and re-checked.** Row counts and lane coverage
> (also in Section 6) are unaffected by this bug and remain valid.

---

## 1. Background

The client's current forecasting model is an Excel-based, single-factor vintage-curve model that predicts non-new (renewal) loan originations. It's built by state (20+ tabs), and the only driver used is **months since the customer's previous origination**. The engagement goal is to replace/extend this with a multi-factor, Python/SQL-based model that can incorporate marketing spend, credit score, and funded amount.

---

## 2. Current methodology, explained

Each state tab tracks a matrix:

- **Rows** = a "lane" (Product + Channel + Customer Type, e.g. `ILP + PHYSICAL + NON_NEW`) crossed against the customer's **previous lane** (Product + Channel only) and **months since that previous origination** (buckets 0–15, plus "first-time"/"long ago").
- **Columns** = calendar month.
- **Each cell** = actual count of originations matching that exact lane / prior-lane / month-gap / calendar-month combination.

### Worked example (real numbers, Alabama, ILP physical lane)

- April 2022: Alabama had **496** total ILP-physical originations (the "pool" — new + non-new + unclassified).
- Of that pool, **60** came back as a non-new ILP-physical origination exactly 6 months later, in October 2022.
- Historical renewal rate at month 6 for this lane = 60 ÷ 496 = **12.1%**.
- The forecast for a future cohort is: (size of that month's originating pool) × (historical rate at the relevant month-gap), summed across all month-gaps.

**Key limitation:** the rate depends only on months-since-last-origination. No marketing spend, credit score, or loan size factors into it — which is exactly the gap the new engagement is meant to close.

**Lane, defined simply:** a lane = one specific Product + Channel + Customer Type combination. Each lane is modeled with its own separate renewal curve.

---

## 3. Task status

| # | Task | Status |
|---|---|---|
| 1 | Understand current methodology | ✅ Done (documented above) |
| 2 | Install PostgreSQL + pgAdmin | ✅ Done |
| 3a | Load data into sheet **3.3 Actual Origination Cnt PM** | ✅ Done — verified exact match (14,142 rows) |
| 3b | Load data into sheet **3.1 Refcst Non_new origination** | ❌ Blocked — see below |
| 4 | SK sheet pivot queries | ✅ Done — verified exact match |
| 5 | Regression-ready lag matrix (all 4 renewal lanes) | ⚠️ Row/lane structure done (6,168 rows) — **lag-column values disputed, see correction note above** |
| 6 | Dimension hierarchies (state/product/channel/date) | 🔲 Not started |
| 7 | "Look-alike fields" | ⚠️ Undefined — needs clarification from the team |

### Why 3.1 is blocked

`tblActuals.csv` (and the SQL that loads it) contains only aggregate monthly counts — no customer or loan identifier. Sheet 3.1 requires `MONTHS_SINCE_PREV_ORIG`, `PREV_PRODUCT_CD`, and `SUM(PRINCIPAL_AMT)` computed **per customer**, which is structurally impossible from an aggregate-count source. This would require a transaction-level table (one row per loan, with a customer/loan ID) — closer to the schema in `pg.sql`'s `tempo_applications` table, whose source CSV (`tempoApr26+.csv`) has never been provided.

---

## 4. Data currently loaded in Postgres

| Table | Source | Rows | Status |
|---|---|---|---|
| `public.tblactuals` | `tblActuals.csv` via `dataUpload.sql` | 14,142 | Loaded, verified against source CSV and sheet 3.3 |
| `public.tempo_applications` | `pg.sql` (schema only — script's `CREATE TABLE` was commented out, run manually) | 0 | Schema created, empty — no source CSV available |

Note: `tblactuals` was created twice, with two different column-naming conventions, across this project:
- **camelCase** (`origYr`, `customerType`, etc.) — from the original `dataUpload.sql`. **This is the live version.**
- **snake_case** (`orig_yr`, `customer_tp`, etc.) — from a later script variant. Not the currently loaded table; scripts must be written against camelCase to match what's actually in Postgres.

---

## 5. SQL scripts

### 5a. Load script (`dataUpload.sql`) — run, verified

```sql
drop table if exists public.tblActuals;

create table public.tblActuals (
    "origYr" int,
    "origMnth" varchar(3),
    "origStateCd" varchar(2),
    "productCd" varchar(10),
    "customerChannel" varchar(20),
    "customerType" varchar(20),
    "cn" int
);

COPY public.tblActuals
FROM '/tmp/tblActuals.csv'
WITH (
        FORMAT CSV,
        HEADER TRUE,
        NULL '',
        FORCE_NULL ("origYr", "origMnth", "origStateCd", "productCd", "customerChannel", "customerType", "cn"));
```

Actual load in this project was done via psql's `\copy` (client-side), not server-side `COPY`, due to a pgAdmin GUI hang and permission issues with `/tmp` on macOS:

```sql
\copy public.tblactuals ("origYr","origMnth","origStateCd","productCd","customerChannel","customerType","cn")
FROM '/Users/shubhivashistha/Downloads/tblActuals.csv'
WITH (FORMAT csv, HEADER, DELIMITER ',');
```
Result: `COPY 14142` — confirmed.

### 5b. SK-sheet pivot replication (verified exact match)

```sql
CREATE OR REPLACE VIEW v_non_new_jun2026 AS
SELECT "origStateCd" AS "STATE_CD", "productCd" AS "PRODUCT_CD", SUM("cn") AS "Sum of CNT"
FROM public.tblactuals
WHERE "origYr" = 2026 AND "origMnth" = 'Jun' AND "customerType" = 'NON_NEW'
GROUP BY "origStateCd", "productCd";

CREATE OR REPLACE VIEW v_new_2025_by_month AS
SELECT
    "origStateCd" AS "STATE_CD", "productCd" AS "PRODUCT_CD",
    SUM(CASE WHEN "origMnth"='Jan' THEN "cn" ELSE 0 END) AS "Jan",
    SUM(CASE WHEN "origMnth"='Feb' THEN "cn" ELSE 0 END) AS "Feb",
    SUM(CASE WHEN "origMnth"='Mar' THEN "cn" ELSE 0 END) AS "Mar",
    SUM(CASE WHEN "origMnth"='Apr' THEN "cn" ELSE 0 END) AS "Apr",
    SUM(CASE WHEN "origMnth"='May' THEN "cn" ELSE 0 END) AS "May",
    SUM(CASE WHEN "origMnth"='Jun' THEN "cn" ELSE 0 END) AS "Jun",
    SUM(CASE WHEN "origMnth"='Jul' THEN "cn" ELSE 0 END) AS "Jul",
    SUM(CASE WHEN "origMnth"='Aug' THEN "cn" ELSE 0 END) AS "Aug",
    SUM(CASE WHEN "origMnth"='Sep' THEN "cn" ELSE 0 END) AS "Sep",
    SUM(CASE WHEN "origMnth"='Oct' THEN "cn" ELSE 0 END) AS "Oct",
    SUM(CASE WHEN "origMnth"='Nov' THEN "cn" ELSE 0 END) AS "Nov",
    SUM(CASE WHEN "origMnth"='Dec' THEN "cn" ELSE 0 END) AS "Dec"
FROM public.tblactuals
WHERE "origYr" = 2025 AND "customerType" = 'NEW'
GROUP BY "origStateCd", "productCd";

SELECT
    COALESCE(a."STATE_CD", b."STATE_CD")     AS "STATE_CD",
    COALESCE(a."PRODUCT_CD", b."PRODUCT_CD") AS "PRODUCT_CD",
    a."Sum of CNT" AS "NonNew_Jun2026_Cnt",
    b."Jan", b."Feb", b."Mar", b."Apr", b."May", b."Jun",
    b."Jul", b."Aug", b."Sep", b."Oct", b."Nov", b."Dec"
FROM v_non_new_jun2026 a
FULL OUTER JOIN v_new_2025_by_month b
    ON a."STATE_CD" = b."STATE_CD" AND a."PRODUCT_CD" = b."PRODUCT_CD"
ORDER BY 1, 2;
```
`FULL OUTER JOIN` used deliberately, so state/product combos present in only one pivot aren't silently dropped.

### 5c. Regression lag matrix — ⚠️ buggy version (do not use)

Received from the team, claimed to "handle all 4 renewal lanes":

```sql
where (t1.product_cd = 'PDL' and t2.product_cd = 'PDL'
or  t1.product_cd = 'PDL' and t2.product_cd = 'ILP')
```

**Bug:** only keeps rows where the non-new side (`t1`) is `PDL`. Every `ILP` non-new row (`ILP→ILP` and `ILP→PDL`) is silently dropped — 2 of 4 lane combinations only. This was caught by inspecting the WHERE clause logically; this exact version was never run/diffed as output.

### 5d. Regression lag matrix — row/lane structure corrected; ⚠️ lag-column direction still disputed

This query is corrected relative to **5c's** bug (the `PDL`-only WHERE clause) — it produces
the right row count (6,168) and all 4 lane combinations. It has **not** been confirmed
correct on the `months_between()` argument order used below. Per
`validation_findings_and_gaps.md` §3.2, this exact argument order
(`months_between(t2.bom_orig_dt, t1.bom_orig_dt)`) was later found to compute the
lag direction backwards. **Before using this query's output as a regression feature,
re-run the 5 hand-computed spot-checks in `validation_findings_and_gaps.md` §3.3 and,
if they fail, swap the arguments to `months_between(t1.bom_orig_dt, t2.bom_orig_dt)`.**

```sql
CREATE OR REPLACE FUNCTION months_between(end_date date, start_date date)
RETURNS integer STRICT IMMUTABLE LANGUAGE sql AS $$
    SELECT (
        EXTRACT(YEAR FROM AGE(end_date, start_date)) * 12 +
        EXTRACT(MONTH FROM AGE(end_date, start_date))
    )::integer;
$$;

select
    concat(to_char(t1.bom_orig_dt, 'yymm'), '|', t1."origStateCd", '|', t1."productCd", '|', t2."productCd") as lookup,
    to_char(t1.bom_orig_dt, 'yyyymm') as orig_ym,
    t1."origStateCd",
    t1."productCd",
    t2."productCd" as prev_product_cd,
    t1."customerChannel",
    t1."cn" as non_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 1 then t2."cn" else 0 end) as m01_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 2 then t2."cn" else 0 end) as m02_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 3 then t2."cn" else 0 end) as m03_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 4 then t2."cn" else 0 end) as m04_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 5 then t2."cn" else 0 end) as m05_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 6 then t2."cn" else 0 end) as m06_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 7 then t2."cn" else 0 end) as m07_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 8 then t2."cn" else 0 end) as m08_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 9 then t2."cn" else 0 end) as m09_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 10 then t2."cn" else 0 end) as m10_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 11 then t2."cn" else 0 end) as m11_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 12 then t2."cn" else 0 end) as m12_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 13 then t2."cn" else 0 end) as m13_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 14 then t2."cn" else 0 end) as m14_new_cn,
    sum(case when months_between(t2.bom_orig_dt, t1.bom_orig_dt) = 15 then t2."cn" else 0 end) as m15_new_cn
from
    (select TO_DATE("origYr" || '-' || "origMnth", 'YYYY-Mon') as bom_orig_dt,
            "origStateCd", "productCd", "customerChannel", "cn"
     from public.tblactuals
     where "customerType" = 'NON_NEW') t1
left join
    (select TO_DATE("origYr" || '-' || "origMnth", 'YYYY-Mon') as bom_orig_dt,
            "origStateCd", "productCd", "customerChannel", "cn"
     from public.tblactuals
     where "customerType" = 'NEW') t2
on  t1."origStateCd" = t2."origStateCd"
and t1."customerChannel" = t2."customerChannel"
where t1."productCd" in ('PDL','ILP')
  and t2."productCd" in ('PDL','ILP')
group by
    concat(to_char(t1.bom_orig_dt, 'yymm'), '|', t1."origStateCd", '|', t1."productCd", '|', t2."productCd"),
    to_char(t1.bom_orig_dt, 'yyyymm'),
    t1."origStateCd", t1."productCd", t2."productCd", t1."customerChannel", t1."cn"
order by
    to_char(t1.bom_orig_dt, 'yyyymm'),
    t1."origStateCd", t1."productCd", t2."productCd", t1."customerChannel";
```

**What this produces:** one row per (non-new lane, previous lane, month), with `non_new_cn` = actual renewal count, and `m01_new_cn`...`m15_new_cn` = raw NEW-customer counts intended to be in that same lane, 1–15 months earlier — lagged predictor columns for a regression model. Output: 6,168 rows. **As currently written, the direction of the lag is disputed — see the warning above.**

**Caveat on the `lookup` field:** `concat(yymm, state, productCd, prev_productCd)` does **not** include channel, so it is not a unique key (Digital and Physical rows share the same `lookup` value). Do not use it as a join/dedup key downstream without adding channel to it.

---

## 6. Verification performed

| What | Method | Result |
|---|---|---|
| `tblactuals` vs `tblActuals.csv` | Row-by-row diff, all 7 columns | 0 mismatches (14,142 rows) |
| `tblactuals` vs sheet 3.3 | Row-by-row diff | 0 mismatches (14,142 rows) |
| SK pivot 1 (non-new Jun 2026) | Grouped-sum comparison vs raw table | Exact match on sampled states |
| SK pivot 2 (new, 2025–Jun 2026) | Grouped-sum comparison vs raw table | Exact match on sampled states/products (AL/ILP, CA/PDL, FL/ILP) |
| Regression lag matrix — row count | Independent Python replica vs SQL output | 6,168 = 6,168 (valid — unaffected by the disputed direction issue) |
| Regression lag matrix — lane coverage | Grouped by (productCd, prev_product_cd) | All 4 combinations present: ILP→ILP (1,537), ILP→PDL (1,170), PDL→ILP (1,392), PDL→PDL (2,069) (valid — unaffected by the disputed direction issue) |
| Regression lag matrix — full value check | Independent Python replica joined on full key (orig_ym + state + product + prev_product + channel), all 16 numeric columns | Originally reported as **0 mismatched cells** across 6,168 rows × 16 columns (201,024 cells). **⚠️ Disputed — see correction note at top of this file and `validation_findings_and_gaps.md` §3.2, which found the opposite result (every `mXX_new_cn` value mismatched) when checking the same query. Do not rely on this row until re-run.** |

**Note on methodology:** the first attempt at the full value check produced 68,694 false-positive mismatches, caused by joining on the non-unique `lookup` field instead of the full grouping key (including channel). Corrected and re-run before reporting results — but see the dispute above regarding this re-run's actual correctness.

---

## 7. Open items

1. **Sheet 3.1** — blocked pending a transaction-level source file with a customer/loan identifier.
2. **`tempo_applications`** — table schema exists in Postgres, but is empty; no source CSV has been provided.
3. **Dimension hierarchies** (state→region, product→family, date→fiscal quarter) — not started; needs the actual business mapping rules from the team (region groupings, fiscal calendar), which cannot be inferred from the data alone.
4. **"Look-alike fields"** — undefined. Needs clarification from the team on whether this means a technique for borrowing patterns from similar/larger lanes for sparse-data segments, or a specific existing definition elsewhere in the project.
5. **Regression lag-matrix direction** — see correction note at top. Needs to be re-run and re-verified against `validation_findings_and_gaps.md` §3.3's hand-checked cases before Phase 1 modeling relies on it.
