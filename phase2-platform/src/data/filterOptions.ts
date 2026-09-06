// PLACEHOLDER — see /PLACEHOLDERS.md item 6.
// State/Customer Type/Channel are the full distinct values from tblActuals.csv
// (25 states appear there; CLAUDE.md's Section 1 lists 21 confirmed workbook
// state tabs — that mismatch is unresolved, see the registry entry, so all
// 25 are included here rather than silently dropping 4).
// H Tactic / Detail Tactic / Product are taken from the UX_V2.xlsx structure
// as described in the task, not from tblActuals.csv (which only has ILP/PDL
// at the product_cd grain) — see PLACEHOLDERS.md item 5 for the H
// Tactic vs. Product labeling ambiguity this reflects.

export const STATE_OPTIONS = [
  'AL', 'CA', 'CO', 'DE', 'FL', 'IA', 'ID', 'IN', 'KS', 'KY', 'LA', 'MI',
  'MO', 'MS', 'NC', 'NV', 'OH', 'OK', 'RI', 'SC', 'TN', 'TX', 'UT', 'WI', 'WY',
];

export const CUSTOMER_TYPE_OPTIONS = ['NEW', 'NON_NEW'];

export const CHANNEL_OPTIONS = ['DIGITAL', 'PHYSICAL', 'UNKNOWN'];

// See PLACEHOLDERS.md item 5 — may actually be the Product list, mislabeled.
export const H_TACTIC_OPTIONS = ['ILP', 'FLC', 'Line of Credit', 'Payday Loan', 'Not Funded'];

export const DETAIL_TACTIC_OPTIONS = [
  'Paid Search', 'Paid Social', 'Prescreen', 'Referrals', 'Lead Generation', 'Sweepstakes',
];

export const PRODUCT_OPTIONS = ['ILP', 'PDL'];
