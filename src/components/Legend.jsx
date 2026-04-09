import React from 'react';

const LEGENDS = [
  { label: 'Unsorted',   color: '#374151' },
  { label: 'Comparing',  color: '#f59e0b' },
  { label: 'Swapping',   color: '#dc2626' },
  { label: 'Selected',   color: '#f97316' },
  { label: 'Sorted',     color: '#22c55e' },
  { label: 'Found',      color: '#f87171' },
];

export default function Legend() {
  return (
    <div className="legend">
      {LEGENDS.map(({ cls, label, color }) => (
        <div key={cls} className="legend-item">
          <div className="color-swatch" style={{ background: color }} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
