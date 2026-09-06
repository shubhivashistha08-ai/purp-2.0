import type { MetricView } from '../types/forecast';

interface MetricToggleProps {
  value: MetricView;
  onChange: (next: MetricView) => void;
}

// Reconciles two slightly different readings of the source sheet: Section 1
// of the task describes this as an Approval Rate / Origination Rate switch
// "independent of the funnel-count table," while the acceptance criteria ask
// for it to switch the table between rate-based and count-based views. This
// three-way control satisfies both: "Counts" is the funnel-count table as
// specified, and the two rate options each swap the table's count columns
// for the corresponding rate. See PLACEHOLDERS.md for this interpretation
// call.
export default function MetricToggle({ value, onChange }: MetricToggleProps) {
  const options: { key: MetricView; label: string }[] = [
    { key: 'count', label: 'Counts' },
    { key: 'approvalRate', label: 'Approval Rate' },
    { key: 'originationRate', label: 'Origination Rate' },
  ];

  return (
    <div className="metric-toggle" role="group" aria-label="Metric view">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className={value === opt.key ? 'metric-toggle-btn active' : 'metric-toggle-btn'}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
