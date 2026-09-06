import type { ScenarioKey } from '../types/forecast';

interface ScenarioTabsProps {
  active: ScenarioKey;
  onChange: (next: ScenarioKey) => void;
}

const TABS: { key: ScenarioKey; label: string }[] = [
  { key: 'baseline', label: 'Baseline' },
  { key: 'scenario1', label: 'Scenario 1' },
  { key: 'scenario2', label: 'Scenario 2' },
  { key: 'scenario3', label: 'Scenario 3' },
];

export default function ScenarioTabs({ active, onChange }: ScenarioTabsProps) {
  return (
    <div className="scenario-tabs" role="tablist" aria-label="Scenario">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          className={active === tab.key ? 'scenario-tab active' : 'scenario-tab'}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
