import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, AlertTriangle, Users, Shield, Clock, MapPin, Activity,
  Pin, PinOff, Radio, TrendingUp, Zap,
} from 'lucide-react';
import { format } from 'date-fns';

function StatCard({ icon: Icon, label, value, color, sublabel }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-white font-black text-xl leading-none">{value}</p>
        <p className="text-white/30 text-[10px] uppercase tracking-widest mt-1">{label}</p>
        {sublabel && <p className="text-white/20 text-[9px] mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

export default function CommandMode({ calls, units, server, serverId, onClose }) {
  const [pinned, setPinned] = useState(new Set());

  const activeCalls = calls.filter(c => c.status !== 'closed');
  const closedCalls = calls.filter(c => c.status === 'closed');
  const p1Calls = activeCalls.filter(c => c.priority === 'P1');
  const p2Calls = activeCalls.filter(c => c.priority === 'P2');
  const availableUnits = units.filter(u => u.status === '10-8');
  const committedUnits = units.filter(u => u.status === '10-97' || u.status === '10-6' || u.status === '10-11');
  const offDutyUnits = units.filter(u => u.status === '10-42');

  // Officer safety alerts (would need to fetch, but we show the server setting)
  const safetyEnabled = server?.officer_safety_enabled;

  // Response times
  const responseTimes = activeCalls
    .filter(c => c.assigned_units?.length > 0 && c.created_date)
    .map(c => {
      const created = new Date(c.created_date).getTime();
      const updated = new Date(c.updated_date).getTime();
      return Math.round((updated - created) / 1000);
    });
  const avgResponse = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  // Cross-department calls (mutual aid)
  const mutualAidCalls = activeCalls.filter(c => c.department_type === 'all' || c.assigned_units?.length > 0);

  // Recently escalated (P1/P2 that were created recently)
  const recentlyEscalated = [...activeCalls]
    .filter(c => c.priority === 'P1' || c.priority === 'P2')
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  const sortedActive = [...activeCalls].sort((a, b) => {
    const pinnedA = pinned.has(a.id) ? 0 : 1;
    const pinnedB = pinned.has(b.id) ? 0 : 1;
    if (pinnedA !== pinnedB) return pinnedA - pinnedB;
    const prio = { P1: 0, P2: 1, P3: 2, P4: 3 };
    return (prio[a.priority] || 3) - (prio[b.priority] || 3);
  });

  const togglePin = (id) => {
    setPinned(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#080808]/98 backdrop-blur-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0C0C0C]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-crimson/10 border border-crimson/20 flex items-center justify-center">
            <Activity size={18} className="text-crimson" />
          </div>
          <div>
            <h2 className="text-white font-black text-lg tracking-wide uppercase">Command Mode</h2>
            <p className="text-white/30 text-[10px] uppercase tracking-widest">Emergency Operations Center — Live Overview</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-crimson text-white text-xs font-bold uppercase tracking-widest hover:bg-crimson-dark transition-all"
        >
          <X size={14} /> Exit
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 px-6 py-4 border-b border-white/[0.06]">
        <StatCard icon={Radio} label="Active Incidents" value={activeCalls.length} color="bg-crimson/15 text-crimson" />
        <StatCard icon={AlertTriangle} label="P1 Critical" value={p1Calls.length} color="bg-red-500/15 text-red-400" />
        <StatCard icon={Zap} label="P2 Urgent" value={p2Calls.length} color="bg-orange-500/15 text-orange-400" />
        <StatCard icon={Users} label="Units Available" value={availableUnits.length} color="bg-emerald-500/15 text-emerald-400" sublabel={`${committedUnits.length} committed`} />
        <StatCard icon={Shield} label="Safety Alerts" value={safetyEnabled ? 'ON' : 'OFF'} color="bg-amber-500/15 text-amber-400" />
        <StatCard icon={Clock} label="Avg Response" value={`${avgResponse}s`} color="bg-blue-500/15 text-blue-400" />
        <StatCard icon={TrendingUp} label="Mutual Aid" value={mutualAidCalls.length} color="bg-purple-500/15 text-purple-400" />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incident list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Radio size={12} className="text-crimson" /> Active Incidents
                {pinned.size > 0 && <span className="text-crimson/60">({pinned.size} pinned)</span>}
              </h3>
            </div>
            <div className="space-y-2">
              {sortedActive.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-white/15">
                  <Radio size={28} className="mb-2 opacity-30" />
                  <p className="text-xs uppercase tracking-widest">No active incidents</p>
                </div>
              ) : (
                sortedActive.map(call => (
                  <div
                    key={call.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${pinned.has(call.id) ? 'border-crimson/30 bg-crimson/[0.04]' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'}`}
                  >
                    <button
                      onClick={() => togglePin(call.id)}
                      className="p-1 rounded hover:bg-white/10 transition-all flex-shrink-0"
                      title={pinned.has(call.id) ? 'Unpin' : 'Pin incident'}
                    >
                      {pinned.has(call.id) ? <Pin size={14} className="text-crimson" /> : <PinOff size={14} className="text-white/20" />}
                    </button>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase flex-shrink-0 ${
                      call.priority === 'P1' ? 'bg-red-500/20 text-red-400' :
                      call.priority === 'P2' ? 'bg-orange-500/20 text-orange-400' :
                      call.priority === 'P3' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {call.priority}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{call.type}</p>
                      <p className="text-white/30 text-xs flex items-center gap-1 mt-0.5">
                        <MapPin size={9} /> {call.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {call.assigned_units?.length > 0 && (
                        <span className="flex items-center gap-1 text-white/40 text-xs">
                          <Users size={10} /> {call.assigned_units.length}
                        </span>
                      )}
                      {call.incident_id && (
                        <span className="text-[9px] font-mono-cad text-crimson/40">{call.incident_id}</span>
                      )}
                      <span className="text-[10px] text-white/20 font-mono-cad">
                        {call.created_date ? format(new Date(call.created_date), 'HH:mm') : '--'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Recently escalated */}
            <div>
              <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                <AlertTriangle size={12} className="text-orange-400" /> Recently Escalated
              </h3>
              <div className="space-y-2">
                {recentlyEscalated.length === 0 ? (
                  <p className="text-white/20 text-xs">No recently escalated calls</p>
                ) : (
                  recentlyEscalated.map(call => (
                    <div key={call.id} className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          call.priority === 'P1' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                        }`}>{call.priority}</span>
                        <span className="text-white/70 text-xs font-semibold truncate flex-1">{call.type}</span>
                      </div>
                      <p className="text-white/25 text-[10px] mt-1">{call.location}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Unit breakdown */}
            <div>
              <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                <Users size={12} className="text-emerald-400" /> Unit Status
              </h3>
              <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-2">
                {[
                  { label: '10-8 Available', count: availableUnits.length, color: 'text-emerald-400' },
                  { label: '10-97 On Scene', count: units.filter(u => u.status === '10-97').length, color: 'text-blue-400' },
                  { label: '10-6 Busy', count: units.filter(u => u.status === '10-6').length, color: 'text-yellow-400' },
                  { label: '10-11 Traffic Stop', count: units.filter(u => u.status === '10-11').length, color: 'text-purple-400' },
                  { label: '10-42 Off Duty', count: offDutyUnits.length, color: 'text-zinc-400' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between text-xs">
                    <span className={`font-mono-cad ${s.color}`}>{s.label}</span>
                    <span className="text-white font-bold">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Incident locations */}
            <div>
              <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                <MapPin size={12} className="text-crimson" /> Incident Locations
              </h3>
              <div className="space-y-1.5">
                {activeCalls.slice(0, 6).map(call => (
                  <div key={call.id} className="flex items-center gap-2 text-xs">
                    <MapPin size={9} className="text-white/20 flex-shrink-0" />
                    <span className="text-white/50 truncate flex-1">{call.location}</span>
                    <span className={`text-[9px] font-bold ${call.priority === 'P1' ? 'text-red-400' : call.priority === 'P2' ? 'text-orange-400' : 'text-white/30'}`}>{call.priority}</span>
                  </div>
                ))}
                {activeCalls.length === 0 && <p className="text-white/20 text-xs">No active incident locations</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}