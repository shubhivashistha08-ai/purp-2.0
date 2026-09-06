import { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

// Small headless multi-select: a button that toggles a checkbox list.
// Empty selection means "no filter applied" (all rows pass) — this matches
// the source sheet's "Allows multiple selections" annotation, where an
// unset filter shouldn't hide everything.
export default function MultiSelect({ label, options, selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  const summary = selected.length === 0 ? 'All' : `${selected.length} selected`;

  return (
    <div className="multiselect" ref={ref}>
      <label className="multiselect-label">{label}</label>
      <button type="button" className="multiselect-trigger" onClick={() => setOpen((o) => !o)}>
        {summary}
        <span className="multiselect-caret">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="multiselect-panel">
          <button type="button" className="multiselect-clear" onClick={() => onChange([])}>
            Clear
          </button>
          {options.map((option) => (
            <label key={option} className="multiselect-option">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
