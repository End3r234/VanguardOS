import React, { useState } from 'react';
import { MapPin, ChevronDown, ChevronUp, Users, StickyNote } from 'lucide-react';
import StatusBadge from '../StatusBadge';

export default function AssignedCallBanner({ call }) {
  const [expanded, setExpanded] = useState(false);
  if (!call) return null;

  const isP1 = call.priority === 'P1';

  return (
    <div className={`rounded-xl border p-4 mb-4 transition-all ${isP1 ? 'border-red-500/40 bg-red-500/5 pulse-p1' : 'border-crimson/20 bg-crimson/5'}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <StatusBadge status={call.priority} type="priority" />
          <span className="text-white font-semibold text-sm">{call.type}</span>
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <MapPin size={11} />
            {call.location}
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
          {call.description && <p className="text-white/60 text-sm">{call.description}</p>}
          {call.caller_info && <p className="text-white/40 text-xs">Caller: {call.caller_info}</p>}
          {call.assigned_units?.length > 0 && (
            <div className="flex items-center gap-1 text-white/40 text-xs">
              <Users size={11} />
              {call.assigned_units.length} unit(s) assigned
            </div>
          )}
          {call.notes?.length > 0 && (
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-1 text-white/50 text-xs"><StickyNote size={11} /> Notes</div>
              {call.notes.slice(-3).map((n, i) => (
                <div key={i} className="text-white/40 text-xs pl-4 border-l border-white/10">
                  {n.text} <span className="text-white/20">— {n.author}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}