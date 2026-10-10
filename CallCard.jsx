import React from 'react';
import { MapPin, Clock, UserPlus, FileText, X, Radio, Play } from 'lucide-react';
import StatusBadge from '../StatusBadge';
import { format } from 'date-fns';

const PRIORITY_STYLES = {
  P1: 'border-red-500/50 bg-red-500/[0.04] shadow-red-500/10 shadow-lg pulse-p1',
  P2: 'border-orange-500/35 bg-orange-500/[0.03] shadow-orange-500/10 shadow-sm',
  P3: 'border-white/[0.08] bg-white/[0.02]',
  P4: 'border-white/[0.06] bg-transparent',
};

const PRIORITY_BADGE = {
  P1: 'bg-red-500/20 text-red-400 border border-red-500/30',
  P2: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  P3: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  P4: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
};

export default function CallCard({ call, onAssign, onAddNote, onClose, onReplay }) {
  return (
    <div className={`rounded-md border ${PRIORITY_STYLES[call.priority] || PRIORITY_STYLES.P3} p-3.5 hover:brightness-110 transition-all group font-rajdhani`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-widest uppercase ${PRIORITY_BADGE[call.priority] || PRIORITY_BADGE.P3}`}>
            {call.priority}
          </span>
          <span className="text-white font-semibold text-sm tracking-wide truncate">{call.type}</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {onAssign && (
            <button onClick={() => onAssign(call)} title="Assign Unit" className="p-1.5 hover:bg-white/10 rounded transition-colors">
              <UserPlus size={13} className="text-crimson" />
            </button>
          )}
          {onAddNote && (
            <button onClick={() => onAddNote(call)} title="Add Note" className="p-1.5 hover:bg-white/10 rounded transition-colors">
              <FileText size={13} className="text-white/40 hover:text-white/70" />
            </button>
          )}
          {onClose && (
            <button onClick={() => onClose(call)} title="Close Call" className="p-1.5 hover:bg-red-500/20 rounded transition-colors">
              <X size={13} className="text-white/30 hover:text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-white/50 text-xs mb-1.5 tracking-wide">
        <MapPin size={10} className="flex-shrink-0" />
        <span className="truncate">{call.location}</span>
      </div>

      {/* Description */}
      {call.description && (
        <p className="text-white/35 text-xs mb-2 line-clamp-2 font-inter">{call.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-white/25 pt-1.5 border-t border-white/[0.05]">
        <div className="flex items-center gap-1">
          <Clock size={9} />
          <span className="font-mono-cad">{call.created_date ? format(new Date(call.created_date), 'HH:mm') : '--:--'}</span>
        </div>
        <div className="flex items-center gap-2">
          {call.assigned_units?.length > 0 && (
            <span className="flex items-center gap-1">
              <Radio size={9} /> {call.assigned_units.length}u
            </span>
          )}
          {call.incident_id && (
            <span className="font-mono-cad text-crimson/50 text-[9px]">{call.incident_id}</span>
          )}
          {call.call_number && (
            <span className="font-mono-cad opacity-40 text-[9px]">#{call.call_number}</span>
          )}
          {onReplay && (
            <button onClick={() => onReplay(call)} title="View Replay" className="p-0.5 hover:text-crimson transition-colors">
              <Play size={10} className="text-crimson/50" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}