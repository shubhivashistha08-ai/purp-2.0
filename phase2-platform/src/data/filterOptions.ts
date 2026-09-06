// State/Customer Type/Channel: full distinct values from tblActuals.csv
// (25 states appear there; CLAUDE.md's Section 1 lists 21 confirmed workbook
// state tabs — that mismatch is unresolved, see PLACEHOLDERS.md item 6, so
// all 25 are included here rather than silently dropping 4). The dropdown
// controls for these three in UX_V2.xlsx (Excel Form Controls) were found
// unconfigured with no bound list range, so there's no source-of-truth list
// to read from the file itself — see PLACEHOLDERS.md item 6.

export const STATE_OPTIONS = [
  'AL', 'CA', 'CO', 'DE', 'FL', 'IA', 'ID', 'IN', 'KS', 'KY', 'LA', 'MI',
  'MO', 'MS', 'NC', 'NV', 'OH', 'OK', 'RI', 'SC', 'TN', 'TX', 'UT', 'WI', 'WY',
];

export const CUSTOMER_TYPE_OPTIONS = ['NEW', 'NON_NEW'];

export const CHANNEL_OPTIONS = ['DIGITAL', 'PHYSICAL', 'UNKNOWN'];

// UX_V2.xlsx's "H Tactic" dropdown (Drop Down 5, Sheet1) has no list range
// configured at all — it's an empty combo box in the source file, not
// mislabeled Product data (see PRODUCT_OPTIONS below for where that list
// actually lives). These are placeholder labels only, deliberately generic
// so they can't be mistaken for a real client-confirmed tactic list. See
// PLACEHOLDERS.md item 5.
export const H_TACTIC_OPTIONS = ['Tactic Alpha', 'Tactic Beta', 'Tactic Gamma'];

export const DETAIL_TACTIC_OPTIONS = [
  'Paid Search', 'Paid Social', 'Prescreen', 'Referrals', 'Lead Generation', 'Sweepstakes',
];

// Confirmed from UX_V2.xlsx: a checkbox group explicitly labeled "Products"
// (Group Box 17, Sheet1) containing exactly these 5 checkboxes. This is the
// real source of the "ILP, FLC, Line of Credit, Payday Loan, Not Funded"
// list — it belongs to Product, not H Tactic. See PLACEHOLDERS.md item 5.
export const PRODUCT_OPTIONS = ['ILP', 'FLC', 'Line of Credit', 'Payday Loan', 'Not Funded'];
