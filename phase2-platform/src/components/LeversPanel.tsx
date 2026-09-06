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

// PLACEHOLDER — see /PLACEHOLDERS.md items 3 and 4. Inputs here are a % delta
// numeric field for every Marketing Lever and a single generic Credit and
// Pricing lever; neither the input type nor the credit/pricing sub-levers
// are confirmed with the client.
export default function LeversPanel({ levers, onChange }: LeversPanelProps) {
  function setMarketing(key: keyof MarketingLevers, value: number) {
    onChange({ ...levers, marketing: { ...levers.marketing, [key]: value } });
  }

  return (
    <div className="levers-panel">
      <fieldset className="levers-group">
        <legend>Marketing Levers (% delta from baseline)</legend>
        {MARKETING_LABELS.map(({ key, label }) => (
          <label key={key} className="lever-input">
            <span>{label}</span>
            <input
              type="number"
              step={1}
              value={levers.marketing[key]}
              onChange={(e) => setMarketing(key, Number(e.target.value))}
            />
            <span className="lever-unit">%</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="levers-group">
        <legend>Credit and Pricing Levers</legend>
        <label className="lever-input">
          <span>Credit and Pricing Adjustment</span>
          <input
            type="number"
            step={1}
            value={levers.creditAndPricing}
            onChange={(e) => onChange({ ...levers, creditAndPricing: Number(e.target.value) })}
          />
          <span className="lever-unit">%</span>
        </label>
        <p className="lever-note">
          Placeholder single lever — real sub-levers (e.g. FICO cutoff, APR, credit score
          percentile threshold) need client confirmation. See PLACEHOLDERS.md item 4.
        </p>
      </fieldset>
    </div>
  );
}
