import React from 'react';
import StatusBadge from '../StatusBadge';

export default function UnitRow({ unit, onClick, compact = false }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-2.5 px-2.5 py-2 rounded hover:bg-white/[0.06] cursor-pointer transition-all group border border-transparent hover:border-white/[0.08]"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-xs tracking-wide font-inter">{unit.callsign}</span>
          <StatusBadge status={unit.status} />
        </div>
        {!compact && unit.department_name && (
          <span className="text-white/30 text-[10px] font-inter">{unit.department_name}</span>
        )}
      </div>
      {unit.location && (
        <span className="text-white/20 text-[10px] font-inter truncate max-w-16">{unit.location}</span>
      )}
    </div>
  );
}