import { useMemo } from 'react';
import type { FilterState, ForecastRow, FunnelMetrics, MetricView, ScenarioLevers } from '../types/forecast';
import { applyLevers } from '../data/scenarioEngine';

interface ForecastTableProps {
  rows: ForecastRow[];
  filters: FilterState;
  metricView: MetricView;
  scenario1Levers: ScenarioLevers;
  scenario2Levers: ScenarioLevers;
  scenario3Levers: ScenarioLevers;
}

const MAX_RENDERED_ROWS = 500;

function matches(value: string, selected: string[]): boolean {
  return selected.length === 0 || selected.includes(value);
}

function formatCell(metrics: FunnelMetrics, view: MetricView): string {
  if (view === 'approvalRate') return `${(metrics.approvalRate * 100).toFixed(1)}%`;
  if (view === 'originationRate') return `${(metrics.originationRate * 100).toFixed(1)}%`;
  return String(metrics.applications);
}

function ScenarioCells({ metrics, view }: { metrics: FunnelMetrics; view: MetricView }) {
  if (view === 'approvalRate' || view === 'originationRate') {
    return <td>{formatCell(metrics, view)}</td>;
  }
  return (
    <>
      <td>{metrics.applications}</td>
      <td>{metrics.approvals}</td>
      <td>{metrics.originations}</td>
    </>
  );
}

export default function ForecastTable({
  rows,
  filters,
  metricView,
  scenario1Levers,
  scenario2Levers,
  scenario3Levers,
}: ForecastTableProps) {
  const filteredRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          matches(r.state, filters.state) &&
          matches(r.customerType, filters.customerType) &&
          matches(r.channel, filters.channel) &&
          matches(r.hTactic, filters.hTactic) &&
          matches(r.detailTactic, filters.detailTactic) &&
          matches(r.product, filters.product),
      ),
    [rows, filters],
  );

  const visibleRows = filteredRows.slice(0, MAX_RENDERED_ROWS);
  const countColSpan = metricView === 'count' ? 3 : 1;

  return (
    <div className="forecast-table-wrap">
      <p className="forecast-table-summary">
        Showing {visibleRows.length.toLocaleString()} of {filteredRows.length.toLocaleString()} matching rows
        {filteredRows.length > MAX_RENDERED_ROWS ? ' — narrow filters to see more' : ''}.
      </p>
      <div className="forecast-table-scroll">
        <table className="forecast-table">
          <thead>
            <tr>
              <th rowSpan={2}>State</th>
              <th rowSpan={2}>Customer Type</th>
              <th rowSpan={2}>Channel</th>
              <th rowSpan={2}>H Tactic</th>
              <th rowSpan={2}>Detail Tactic</th>
              <th rowSpan={2}>Product</th>
              <th rowSpan={2}>Month</th>
              <th colSpan={countColSpan} className="group-baseline">Baseline</th>
              <th colSpan={countColSpan} className="group-scenario1">Scenario 1</th>
              <th colSpan={countColSpan} className="group-scenario2">Scenario 2</th>
              <th colSpan={countColSpan} className="group-scenario3">Scenario 3</th>
            </tr>
            <tr>
              {metricView === 'count' ? (
                <>
                  <th>Applications</th><th>Approvals</th><th>Originations</th>
                  <th>Applications</th><th>Approvals</th><th>Originations</th>
                  <th>Applications</th><th>Approvals</th><th>Originations</th>
                  <th>Applications</th><th>Approvals</th><th>Originations</th>
                </>
              ) : (
                <>
                  <th>{metricView === 'approvalRate' ? 'Approval Rate' : 'Origination Rate'}</th>
                  <th>{metricView === 'approvalRate' ? 'Approval Rate' : 'Origination Rate'}</th>
                  <th>{metricView === 'approvalRate' ? 'Approval Rate' : 'Origination Rate'}</th>
                  <th>{metricView === 'approvalRate' ? 'Approval Rate' : 'Origination Rate'}</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const key = `${row.state}|${row.customerType}|${row.channel}|${row.hTactic}|${row.detailTactic}|${row.product}|${row.month}`;
              const s1 = applyLevers(row, scenario1Levers);
              const s2 = applyLevers(row, scenario2Levers);
              const s3 = applyLevers(row, scenario3Levers);
              return (
                <tr key={key}>
                  <td>{row.state}</td>
                  <td>{row.customerType}</td>
                  <td>{row.channel}</td>
                  <td>{row.hTactic}</td>
                  <td>{row.detailTactic}</td>
                  <td>{row.product}</td>
                  <td>{row.month}</td>
                  <ScenarioCells metrics={row.baseline} view={metricView} />
                  <ScenarioCells metrics={s1} view={metricView} />
                  <ScenarioCells metrics={s2} view={metricView} />
                  <ScenarioCells metrics={s3} view={metricView} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
