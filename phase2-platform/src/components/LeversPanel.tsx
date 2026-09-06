import type { MarketingLevers, ScenarioLevers } from '../types/forecast';

interface LeversPanelProps {
  levers: ScenarioLevers;
  onChange: (next: ScenarioLevers) => void;
}

const MARKETING_LABELS: { key: keyof MarketingLevers; label: string }[] = [
  { key: 'paidSearch', label: 'Paid Search' },
  { key: 'paidSocial', label: 'Paid Social' },
  { key: 'prescreen', label: 'Prescreen' },
  { key: 'referrals', label: 'Referrals' },
  { key: 'leadGeneration', label: 'Lead Generation' },
  { key: 'sweepstakes', label: 'Sweepstakes' },
];

// PLACEHOLDER — see /PLACEHOLDERS.md items 3 and 4.
// Rendered as 0-100 range sliders to match UX_V2.xlsx's actual Scroll Bar
// controls (Min 0 / Max 100, unsigned) for every lever in this panel,
// confirmed by reading the source file directly. The exact unit each slider
// represents (a % delta on spend, a touchpoint count, a rate itself) is
// still unconfirmed with the client — only the 0-100, non-negative range is
// confirmed-real.
export default function LeversPanel({ levers, onChange }: LeversPanelProps) {
  function setMarketing(key: keyof MarketingLevers, value: number) {
    onChange({ ...levers, marketing: { ...levers.marketing, [key]: value } });
  }

  function setCreditAndPricing(key: keyof ScenarioLevers['creditAndPricing'], value: number) {
    onChange({ ...levers, creditAndPricing: { ...levers.creditAndPricing, [key]: value } });
  }

  return (
    <div className="levers-panel">
      <fieldset className="levers-group">
        <legend>Marketing Levers (0-100, % delta from baseline)</legend>
        {MARKETING_LABELS.map(({ key, label }) => (
          <label key={key} className="lever-input">
            <span>{label}</span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={levers.marketing[key]}
              onChange={(e) => setMarketing(key, Number(e.target.value))}
            />
            <span className="lever-value">{levers.marketing[key]}%</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="levers-group">
        <legend>Credit and Pricing Levers</legend>
        <label className="lever-input">
          <span>Approval Rate</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={levers.creditAndPricing.approvalRate}
            onChange={(e) => setCreditAndPricing('approvalRate', Number(e.target.value))}
          />
          <span className="lever-value">{levers.creditAndPricing.approvalRate}%</span>
        </label>
        <label className="lever-input">
          <span>Origination Rate</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={levers.creditAndPricing.originationRate}
            onChange={(e) => setCreditAndPricing('originationRate', Number(e.target.value))}
          />
          <span className="lever-value">{levers.creditAndPricing.originationRate}%</span>
        </label>
        <p className="lever-note">
          Confirmed from UX_V2.xlsx: two named sub-levers, Approval Rate and Origination Rate
          (not a single generic field). Exact semantics (delta vs. override, unit) still need
          client confirmation. See PLACEHOLDERS.md item 4.
        </p>
      </fieldset>
    </div>
  );
}
