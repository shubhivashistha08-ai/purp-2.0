import type { FilterState } from '../types/forecast';
import {
  STATE_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
  CHANNEL_OPTIONS,
  H_TACTIC_OPTIONS,
  DETAIL_TACTIC_OPTIONS,
  PRODUCT_OPTIONS,
} from '../data/filterOptions';
import MultiSelect from './MultiSelect';

interface FilterPanelProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <div className="filter-panel">
      <MultiSelect
        label="State"
        options={STATE_OPTIONS}
        selected={filters.state}
        onChange={(v) => onChange({ ...filters, state: v })}
      />
      <MultiSelect
        label="Customer Type"
        options={CUSTOMER_TYPE_OPTIONS}
        selected={filters.customerType}
        onChange={(v) => onChange({ ...filters, customerType: v })}
      />
      <MultiSelect
        label="Channel"
        options={CHANNEL_OPTIONS}
        selected={filters.channel}
        onChange={(v) => onChange({ ...filters, channel: v })}
      />
      <MultiSelect
        label="H Tactic"
        options={H_TACTIC_OPTIONS}
        selected={filters.hTactic}
        onChange={(v) => onChange({ ...filters, hTactic: v })}
      />
      <MultiSelect
        label="Detail Tactic"
        options={DETAIL_TACTIC_OPTIONS}
        selected={filters.detailTactic}
        onChange={(v) => onChange({ ...filters, detailTactic: v })}
      />
      <MultiSelect
        label="Product"
        options={PRODUCT_OPTIONS}
        selected={filters.product}
        onChange={(v) => onChange({ ...filters, product: v })}
      />
    </div>
  );
}
