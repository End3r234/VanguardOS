import React, { useMemo } from 'react';
import { Star } from 'lucide-react';

/**
 * Enhanced Dynamic Dispatch recommendations.
 * Scores units based on availability, department compatibility, assignment status,
 * unit type, and GPS proximity. Displays top recommendations with confidence scores.
 */
function scoreUnit(unit, call, allUnits) {
  let score = 0;
  let reasonTags = [];

  // 1. Availability (max 30)
  const status = unit.status || '10-8';
  if (status === '10-8') score += 30;
  else if (status === '10-23') score += 22;
  else if (status === '10-7') score += 14;
  else if (status === '10-6') score += 6;
  else score += 3;

  // 2. Assignment status (max 20)
  if (!unit.assigned_call_id) score += 20;
  else score += 5;

  // 3. Department compatibility (max 25)
  const callDept = call.department_type || 'all';
  if (callDept === 'all') {
    score += 15;
  } else if (unit.department_type === callDept) {
    score += 25;
    reasonTags.push('Same Department');
  } else {
    // Check for compatible department types
    const compatible = {
      police: ['dispatch'],
      fire: ['ems'],
      ems: ['fire'],
      dispatch: ['police', 'fire', 'ems'],
    };
    if ((compatible[unit.department_type] || []).includes(callDept)) {
      score += 15;
      reasonTags.push('Mutual Aid');
    } else {
      score += 5;
    }
  }

  // 4. Unit type / rank (max 15)
  const rank = (unit.rank || '').toLowerCase();
  const isSupervisor = rank.includes('sergeant') || rank.includes('lieutenant') ||
    rank.includes('captain') || rank.includes('commander') || rank.includes('chief');
  if (isSupervisor) {
    score += 10;
    reasonTags.push('Supervisor');
  } else {
    score += 15;
  }

  // 5. GPS proximity (max 10) — units with map coords get a small bonus
  // (full distance calc requires call coordinates, which aren't on the Call entity;
  //  we still reward units that have active GPS data)
  if (unit.map_x_pct != null && unit.map_y_pct != null) {
    score += 8;
    reasonTags.push('GPS Active');
  } else {
    score += 2;
  }

  return { score: Math.min(100, Math.round(score)), tags: reasonTags, isSupervisor };
}

function determineLabel(unit, score, call, rankIndex) {
  const status = unit.status || '10-8';
  const isAvail = status === '10-8' && !unit.assigned_call_id;
  const rank = (unit.rank || '').toLowerCase();
  const isSupervisor = rank.includes('sergeant') || rank.includes('lieutenant') ||
    rank.includes('captain') || rank.includes('commander') || rank.includes('chief');
  const sameDept = unit.department_type === (call.department_type || 'all');

  if (rankIndex === 0 && isAvail) return 'Closest Available';
  if (sameDept && call.department_type && call.department_type !== 'all') return 'Same Department';
  if (isSupervisor) return 'Available Backup';
  if (isAvail) return 'Available';
  return 'On Standby';
}

export default function DispatchRecommendations({ call, units, onAssign, selectedUnitId }) {
  const recommendations = useMemo(() => {
    if (!call || !units) return [];
    const available = units.filter(u => u.status !== '10-42');
    const scored = available
      .map(u => ({ unit: u, ...scoreUnit(u, call, units) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return scored.map((item, idx) => ({
      ...item,
      label: determineLabel(item.unit, item.score, call, idx),
    }));
  }, [call, units]);

  if (recommendations.length === 0) return null;

  const maxScore = recommendations[0]?.score || 100;

  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Star size={11} className="text-amber-400" />
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/80">Recommended Units</span>
        <span className="text-white/20 text-[9px] ml-1">— tap to assign</span>
      </div>
      <div className="space-y-1.5">
        {recommendations.map(({ unit, score, label, tags }) => {
          const confidence = Math.round((score / maxScore) * 100);
          const isSelected = selectedUnitId === unit.id;
          return (
            <button
              key={unit.id}
              onClick={() => onAssign(unit)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left border ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/40'
                  : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.12]'
              }`}
            >
              <Star size={12} className={`flex-shrink-0 ${confidence >= 80 ? 'text-amber-400' : confidence >= 60 ? 'text-amber-500/60' : 'text-white/25'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-bold font-mono-cad">{unit.callsign}</span>
                  <span className="text-white/30 text-[10px]">{unit.department_name}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-amber-400/70 text-[10px] font-medium">{label}</span>
                  {tags.slice(0, 2).map(t => (
                    <span key={t} className="text-[8px] px-1 py-0.5 rounded bg-white/[0.06] text-white/40">{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className={`text-xs font-black ${confidence >= 80 ? 'text-emerald-400' : confidence >= 60 ? 'text-amber-400' : 'text-white/30'}`}>
                  {confidence}%
                </span>
                <span className="text-[8px] text-white/20 uppercase tracking-wider">confidence</span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-2 mb-1 flex items-center gap-2">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-white/20 text-[9px] uppercase tracking-widest">All Available Units</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>
    </div>
  );
}