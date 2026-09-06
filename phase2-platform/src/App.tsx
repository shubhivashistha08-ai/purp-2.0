import { useMemo, useState } from 'react';
import './App.css';
import FilterPanel from './components/FilterPanel';
import MetricToggle from './components/MetricToggle';
import ScenarioTabs from './components/ScenarioTabs';
import LeversPanel from './components/LeversPanel';
import ForecastTable from './components/ForecastTable';
import { getMockForecastRows } from './data/mockForecast';
import { DEFAULT_LEVERS } from './data/scenarioEngine';
import type { FilterState, MetricView, ScenarioKey, ScenarioLevers } from './types/forecast';

const EMPTY_FILTERS: FilterState = {
  state: [],
  customerType: [],
  channel: [],
  hTactic: [],
  detailTactic: [],
  product: [],
};

function cloneLevers(levers: ScenarioLevers): ScenarioLevers {
  return { marketing: { ...levers.marketing }, creditAndPricing: levers.creditAndPricing };
}

function App() {
  const rows = useMemo(() => getMockForecastRows(), []);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [metricView, setMetricView] = useState<MetricView>('count');
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('baseline');
  const [scenario1Levers, setScenario1Levers] = useState<ScenarioLevers>(cloneLevers(DEFAULT_LEVERS));
  const [scenario2Levers, setScenario2Levers] = useState<ScenarioLevers>(cloneLevers(DEFAULT_LEVERS));
  const [scenario3Levers, setScenario3Levers] = useState<ScenarioLevers>(cloneLevers(DEFAULT_LEVERS));

  const activeLevers =
    activeScenario === 'scenario1' ? scenario1Levers :
    activeScenario === 'scenario2' ? scenario2Levers :
    activeScenario === 'scenario3' ? scenario3Levers :
    null;

  const setActiveLevers =
    activeScenario === 'scenario1' ? setScenario1Levers :
    activeScenario === 'scenario2' ? setScenario2Levers :
    setScenario3Levers;

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Non-New Origination Scenario Planner</h1>
        <p className="app-header-note">
          UI prototype — every number below is fabricated. Not a Phase 1 or Phase 2
          deliverable. See <code>/PLACEHOLDERS.md</code>.
        </p>
      </header>

      <FilterPanel filters={filters} onChange={setFilters} />

      <div className="controls-row">
        <MetricToggle value={metricView} onChange={setMetricView} />
      </div>

      <ScenarioTabs active={activeScenario} onChange={setActiveScenario} />

      {activeLevers && (
        <LeversPanel levers={activeLevers} onChange={setActiveLevers} />
      )}

      <ForecastTable
        rows={rows}
        filters={filters}
        metricView={metricView}
        scenario1Levers={scenario1Levers}
        scenario2Levers={scenario2Levers}
        scenario3Levers={scenario3Levers}
      />
    </div>
  );
}

export default App;
