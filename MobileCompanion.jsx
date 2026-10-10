import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Phone, MapPin, FileText, Search, MessageSquare, Users, ChevronLeft } from 'lucide-react';
import VanguardLogo from '@/components/VanguardLogo';

const PRIORITY_COLORS = {
  P1: 'text-red-400 bg-red-500/10 border-red-500/20',
  P2: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  P3: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  P4: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

const STATUS_LABELS = {
  '10-8': 'In Service', '10-7': 'Out of Service', '10-6': 'Busy',
  '10-97': 'On Scene', '10-11': 'Traffic Stop', '10-23': 'Standby', '10-42': 'Off Duty',
};

const DEPT_COLOR = {
  police: '#3b82f6', fire: '#f97316', ems: '#10b981', dispatch: '#CE0000',
};

export default function MobileCompanion({ serverId, server, user, onExit }) {
  const [tab, setTab] = useState('calls');

  const { data: calls = [] } = useQuery({
    queryKey: ['m-calls', serverId],
    queryFn: () => base44.entities.Call.filter({ server_id: serverId, status: 'active' }),
    enabled: !!serverId,
  });

  const { data: units = [] } = useQuery({
    queryKey: ['m-units', serverId],
    queryFn: () => base44.entities.Unit.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['m-reports', serverId],
    queryFn: () => base44.entities.IncidentReport.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['m-messages', serverId, user?.email],
    queryFn: () => base44.entities.MapMessage.filter({ server_id: serverId, to_email: user?.email }),
    enabled: !!serverId && !!user?.email,
  });

  const myUnit = units.find(u => u.user_email === user?.email);
  const activeUnits = units.filter(u => u.status !== '10-42');

  const tabs = [
    { id: 'calls', icon: Phone, label: 'Calls', badge: calls.length },
    { id: 'map', icon: MapPin, label: 'Map' },
    { id: 'reports', icon: FileText, label: 'Reports', badge: reports.filter(r => r.status === 'pending').length },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'messages', icon: MessageSquare, label: 'Inbox', badge: messages.filter(m => !m.read).length },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0E0E0E] sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {onExit && (
            <button onClick={onExit} className="text-white/40 hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
          )}
          <VanguardLogo size="sm" />
        </div>
        {myUnit && (
          <span className={`text-[10px] px-2 py-1 rounded-lg font-bold font-inter ${myUnit.status === '10-8' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
            {myUnit.callsign} · {STATUS_LABELS[myUnit.status] || myUnit.status}
          </span>
        )}
      </header>

      {/* Server name */}
      <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.04]">
        <span className="text-white/40 text-xs font-medium font-inter">{server?.name || 'Server'}</span>
        <span className="text-white/20 text-xs ml-2">{activeUnits.length} on duty</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* CALLS */}
        {tab === 'calls' && (
          <div className="p-3 space-y-2">
            {calls.length === 0 ? (
              <EmptyState icon={Phone} text="No active calls" />
            ) : (
              calls.map(c => (
                <div key={c.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-semibold text-sm font-inter">{c.type}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-bold ${PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.P3}`}>
                      {c.priority}
                    </span>
                  </div>
                  <p className="text-white/50 text-xs font-inter">{c.location}</p>
                  {c.description && <p className="text-white/30 text-xs mt-1 font-inter">{c.description}</p>}
                  {c.assigned_units?.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Users size={11} className="text-white/30" />
                      <span className="text-white/40 text-[10px] font-inter">{c.assigned_units.length} unit(s) assigned</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* MAP */}
        {tab === 'map' && (
          <div className="p-3">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
              <div className="px-3 py-2 border-b border-white/[0.06] flex items-center gap-2">
                <MapPin size={14} className="text-crimson" />
                <span className="text-white/60 text-xs font-semibold font-inter">Live Map — {activeUnits.length} units</span>
              </div>
              <div className="relative aspect-square bg-[#080808]">
                {server?.map_url ? (
                  <img src={server.map_url} alt="Map" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs font-inter">No map configured</div>
                )}
                {activeUnits.filter(u => u.map_x_pct != null).map(u => (
                  <div
                    key={u.id}
                    className="absolute w-2.5 h-2.5 rounded-full border-2 border-white/80"
                    style={{
                      left: `${u.map_x_pct}%`,
                      top: `${u.map_y_pct}%`,
                      background: DEPT_COLOR[u.department_type] || '#CE0000',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-2 space-y-1">
              {activeUnits.map(u => (
                <div key={u.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${u.status === '10-8' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-white/70 text-xs font-medium font-inter">{u.callsign}</span>
                    <span className="text-white/30 text-[10px] font-inter">{STATUS_LABELS[u.status] || u.status}</span>
                  </div>
                  <span className="text-white/30 text-[10px] font-inter">{u.location || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {tab === 'reports' && (
          <div className="p-3 space-y-2">
            {reports.length === 0 ? (
              <EmptyState icon={FileText} text="No reports" />
            ) : (
              reports.slice(0, 30).map(r => (
                <div key={r.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-semibold text-sm font-inter">{r.title || r.report_type}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold font-inter ${
                      r.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                      r.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                      r.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                      'bg-white/5 text-white/40'
                    }`}>{r.status}</span>
                  </div>
                  <p className="text-white/40 text-xs font-inter">{r.author_callsign || r.author_email}</p>
                  {r.location && <p className="text-white/30 text-xs mt-0.5 font-inter">{r.location}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {/* SEARCH */}
        {tab === 'search' && <SearchTab serverId={serverId} />}

        {/* MESSAGES */}
        {tab === 'messages' && (
          <div className="p-3 space-y-2">
            {messages.length === 0 ? (
              <EmptyState icon={MessageSquare} text="No messages" />
            ) : (
              messages.map(m => (
                <div key={m.id} className={`rounded-xl border p-3 ${m.read ? 'border-white/[0.06] bg-white/[0.02]' : 'border-crimson/20 bg-crimson/5'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-xs font-inter">{m.from_name}</span>
                    {!m.read && <span className="w-1.5 h-1.5 rounded-full bg-crimson" />}
                  </div>
                  <p className="text-white/60 text-sm font-inter">{m.body}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md flex items-center justify-around px-2 py-2 bg-[#0E0E0E] border-t border-white/[0.06] z-20">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${tab === t.id ? 'text-crimson' : 'text-white/40'}`}
            >
              <Icon size={20} />
              <span className="text-[9px] font-medium font-inter">{t.label}</span>
              {t.badge > 0 && (
                <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-crimson text-white text-[8px] font-bold flex items-center justify-center font-inter">
                  {t.badge > 9 ? '9+' : t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="text-center py-12">
      <Icon size={32} className="mx-auto mb-3 text-white/20" />
      <p className="text-white/30 text-sm font-inter">{text}</p>
    </div>
  );
}

function SearchTab({ serverId }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('civilian');

  const { data: civilians = [] } = useQuery({
    queryKey: ['m-civilians', serverId],
    queryFn: () => base44.entities.Civilian.filter({ server_id: serverId }),
    enabled: !!serverId && type === 'civilian',
  });

  const results = query.trim() && type === 'civilian'
    ? civilians.filter(c =>
        c.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.drivers_license?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="p-3">
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setType('civilian')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium font-inter transition-all ${type === 'civilian' ? 'bg-white/10 text-white' : 'text-white/40'}`}
        >
          Civilians
        </button>
        <button
          onClick={() => setType('plate')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium font-inter transition-all ${type === 'plate' ? 'bg-white/10 text-white' : 'text-white/40'}`}
        >
          Plates
        </button>
      </div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={type === 'civilian' ? 'Search name or license...' : 'Search plate...'}
        className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/30 mb-3 font-inter"
      />
      {query.trim() && results.length === 0 && type === 'civilian' && (
        <EmptyState icon={Search} text="No results" />
      )}
      <div className="space-y-2">
        {results.map(c => (
          <div key={c.id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-sm font-inter">{c.name}</span>
              <span className="text-white/30 text-[10px] font-inter">{c.dl_status}</span>
            </div>
            <p className="text-white/40 text-xs font-inter">{c.address}</p>
            {(c.license_plates || []).length > 0 && (
              <p className="text-white/30 text-[10px] mt-1 font-inter">{c.license_plates.length} vehicle(s)</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}