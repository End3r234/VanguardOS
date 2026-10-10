import React, { useState, useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Navigation, Search, X, RefreshCw, Clock, Radio, AlertCircle, MessageSquare, Send, History, Inbox } from 'lucide-react';
import { ERLC_STREETS, ERLC_MAP_IMAGE } from '@/lib/erlcMapData';
import { Input } from '@/components/ui/input';

const DEPT_COLORS = {
  police: '#3B82F6',
  fire: '#F97316',
  ems: '#EF4444',
  dispatch: '#10B981',
};

const STATUS_SHOW = ['10-8', '10-23', '10-97', '10-6'];

function UnitPin({ unit, selected, onClick, deptLogo }) {
  const x = unit.map_x_pct ?? null;
  const y = unit.map_y_pct ?? null;
  if (x === null || y === null) return null;

  const color = DEPT_COLORS[unit.department_type] || '#ffffff';
  const isActive = unit.status === '10-8' || unit.status === '10-23';

  return (
    <div
      className="absolute z-10 cursor-pointer transition-transform hover:scale-125"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -100%)' }}
      onClick={(e) => { e.stopPropagation(); onClick(unit); }}
    >
      {isActive && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ background: color, width: 22, height: 22, top: -3, left: -3 }}
        />
      )}
      {deptLogo ? (
        <div
          className="w-5 h-5 rounded-full border-2 border-white shadow-lg overflow-hidden flex items-center justify-center bg-black"
          style={{ boxShadow: `0 0 8px ${color}80` }}
        >
          <img src={deptLogo} alt="" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
          style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
        />
      )}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold whitespace-nowrap px-1 rounded"
        style={{ color: '#fff', background: 'rgba(0,0,0,0.75)' }}
      >
        {unit.callsign}
      </div>
    </div>
  );
}

function PostalLabel({ street, zoom }) {
  if (zoom < 1.5) return null;
  return (
    <div
      className="absolute pointer-events-none text-[7px] font-mono text-white/50 leading-tight"
      style={{ left: `${street.x_pct}%`, top: `${street.y_pct}%`, transform: 'translate(-50%, -50%)' }}
    >
      {street.postal}
    </div>
  );
}

export default function LiveDispatchMap({ server, serverId, units = [], user, isDispatch = false }) {
  const queryClient = useQueryClient();
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [search, setSearch] = useState('');
  const [showPing, setShowPing] = useState(false);
  const [dmText, setDmText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showInbox, setShowInbox] = useState(false);

  const pingInterval = server?.unit_ping_interval || 120;
  const preset = server?.live_map_preset || 'none';
  const dmsEnabled = server?.live_map_dms_enabled ?? false;
  const streets = preset === 'erlc' ? ERLC_STREETS : (server?.map_streets_data || []);
  const mapImage = preset === 'erlc' ? ERLC_MAP_IMAGE : (preset === 'custom' ? server?.map_url : null);
  const departments = server?.departments || [];

  // Find my unit
  const myUnit = units.find(u => u.user_email === user?.email);
  const needsPing = myUnit && (myUnit.status === '10-8' || myUnit.status === '10-97');

  // Get department logo for a unit
  const getDeptLogo = (unit) => {
    if (!unit?.department_name) return null;
    const dept = departments.find(d => d.name === unit.department_name && d.type === unit.department_type);
    return dept?.logo_url || null;
  };

  // Ping sound
  const playPingSound = () => {
    try {
      if (!window._pingAudioCtx || window._pingAudioCtx.state === 'closed') {
        window._pingAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ac = window._pingAudioCtx;
      if (ac.state === 'suspended') ac.resume();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sine';
      o.frequency.value = 1760;
      o.connect(g);
      g.connect(ac.destination);
      const t = ac.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.85, t + 0.05);
      g.gain.setValueAtTime(0.85, t + 2.3);
      g.gain.linearRampToValueAtTime(0, t + 2.5);
      o.start(t);
      o.stop(t + 2.52);
    } catch (e) { /* ignore */ }
  };

  // Location ping prompt timer
  useEffect(() => {
    if (!needsPing || isDispatch) return;
    const timer = setInterval(() => {
      setShowPing(true);
      playPingSound();
    }, pingInterval * 1000);
    if (myUnit && !myUnit.map_x_pct && !myUnit.map_y_pct) {
      setShowPing(true);
      playPingSound();
    }
    return () => clearInterval(timer);
  }, [needsPing, pingInterval, isDispatch]);

  // Position history
  const { data: history = [] } = useQuery({
    queryKey: ['unit-history', serverId],
    queryFn: () => base44.entities.UnitPositionHistory.filter({ server_id: serverId }),
    enabled: !!serverId && isDispatch,
  });

  // DM messages
  const { data: messages = [] } = useQuery({
    queryKey: ['map-messages', serverId, user?.email],
    queryFn: () => base44.entities.MapMessage.filter({ server_id: serverId }),
    enabled: !!serverId && dmsEnabled,
    refetchInterval: 5000,
  });

  const updateLocationMutation = useMutation({
    mutationFn: async ({ x_pct, y_pct, location }) => {
      // Update unit position
      await base44.entities.Unit.update(myUnit.id, { map_x_pct: x_pct, map_y_pct: y_pct, location, map_updated_at: new Date().toISOString() });
      // Save to history
      await base44.entities.UnitPositionHistory.create({
        server_id: serverId,
        unit_id: myUnit.id,
        user_email: myUnit.user_email,
        callsign: myUnit.callsign,
        department_type: myUnit.department_type,
        x_pct, y_pct, location,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-units'] });
      queryClient.invalidateQueries({ queryKey: ['unit-history'] });
      setShowPing(false);
    },
  });

  // Handle map click to set own location
  const handleMapClick = useCallback((e) => {
    if (!myUnit || !needsPing || !showPing || isPanning) return;
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const nearest = streets.reduce((best, s) => {
      const d = Math.hypot(s.x_pct - x, s.y_pct - y);
      return d < best.dist ? { ...s, dist: d } : best;
    }, { dist: 999, postal: '', name: '' });
    updateLocationMutation.mutate({ x_pct: x, y_pct: y, location: `${nearest.postal} ${nearest.name}`.trim() });
  }, [myUnit, needsPing, showPing, isPanning, streets]);

  // Send DM
  const sendDmMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.MapMessage.create({
        server_id: serverId,
        from_email: user?.email,
        from_name: user?.full_name || user?.email,
        to_email: selectedUnit.user_email,
        to_name: selectedUnit.rp_name || selectedUnit.callsign,
        body: dmText,
      });
      setDmText('');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['map-messages'] }),
  });

  // Mark messages as read
  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.MapMessage.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['map-messages'] }),
  });

  // Zoom & Pan
  const handleWheel = (e) => {
    e.preventDefault();
    setZoom(z => Math.min(4, Math.max(0.5, z - e.deltaY * 0.001)));
  };
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };
  const handleMouseUp = () => setIsPanning(false);

  const filteredUnits = units.filter(u =>
    STATUS_SHOW.includes(u.status) && (u.map_x_pct != null)
  );

  const searchResults = search
    ? streets.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.postal.includes(search)
      ).slice(0, 8)
    : [];

  const activeUnits = units.filter(u => STATUS_SHOW.includes(u.status));

  // DM conversation with selected unit
  const dmThread = selectedUnit
    ? messages.filter(m =>
        (m.to_email === selectedUnit.user_email && m.from_email === user?.email) ||
        (m.from_email === selectedUnit.user_email && m.to_email === user?.email)
      ).sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    : [];

  // My inbox (messages to me)
  const myInbox = messages.filter(m => m.to_email === user?.email).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  const unreadCount = myInbox.filter(m => !m.read).length;

  return (
    <div className="flex h-full min-h-[600px] bg-[#0a0a0a] font-inter">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-white/[0.06] flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-white/[0.06]">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search postal / street..."
              className="pl-8 bg-white/[0.05] border-white/10 text-white text-xs rounded-lg h-8"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-1 rounded-lg border border-white/10 bg-[#111] overflow-hidden">
              {searchResults.map((s, i) => (
                <button
                  key={i}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-white/[0.06] border-b border-white/[0.04] last:border-0"
                  onClick={() => {
                    setSearch('');
                    if (containerRef.current && mapRef.current) {
                      const cw = containerRef.current.offsetWidth;
                      const ch = containerRef.current.offsetHeight;
                      const tx = -(s.x_pct / 100 * cw * zoom - cw / 2);
                      const ty = -(s.y_pct / 100 * ch * zoom - ch / 2);
                      setPan({ x: tx, y: ty });
                    }
                  }}
                >
                  <span className="text-crimson font-mono">{s.postal}</span>
                  <span className="text-white/60 ml-1.5">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active units list */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold">
              Active Units ({activeUnits.length})
            </p>
            <div className="flex items-center gap-1">
              {dmsEnabled && (
                <button
                  onClick={() => { setShowInbox(!showInbox); if (!showInbox) setShowHistory(false); }}
                  className={`flex items-center gap-1 px-2 py-1 rounded transition-all relative text-[10px] font-semibold ${showInbox ? 'text-crimson bg-crimson/10' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                  title="Direct Messages"
                >
                  <MessageSquare size={11} />
                  <span>DMs</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-crimson text-white text-[8px] rounded-full flex items-center justify-center font-bold">{unreadCount}</span>
                  )}
                </button>
              )}
              {isDispatch && (
                <button
                  onClick={() => { setShowHistory(!showHistory); if (!showHistory) setShowInbox(false); }}
                  className={`p-1 rounded transition-all ${showHistory ? 'text-crimson bg-crimson/10' : 'text-white/30 hover:text-white'}`}
                  title="Position History"
                >
                  <History size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Inbox view */}
          {showInbox && dmsEnabled ? (
            <div className="space-y-1.5">
              {myInbox.length === 0 && <p className="text-white/20 text-xs text-center py-4">No messages</p>}
              {myInbox.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    const sender = units.find(u => u.user_email === m.from_email);
                    if (sender) { setSelectedUnit(sender); setShowInbox(false); }
                    if (!m.read) markReadMutation.mutate(m.id);
                  }}
                  className={`w-full text-left p-2 rounded-lg border transition-all ${!m.read ? 'border-crimson/30 bg-crimson/5' : 'border-white/[0.04] bg-white/[0.02]'}`}
                >
                  <p className="text-white text-[10px] font-semibold">{m.from_name}</p>
                  <p className="text-white/50 text-[10px] truncate">{m.body}</p>
                  <p className="text-white/20 text-[8px] mt-0.5">{new Date(m.created_date).toLocaleTimeString()}</p>
                </button>
              ))}
            </div>
          ) : showHistory && isDispatch ? (
            <div className="space-y-1">
              {history.length === 0 && <p className="text-white/20 text-xs text-center py-4">No history yet</p>}
              {[...history].reverse().slice(0, 50).map(h => (
                <div key={h.id} className="p-2 rounded-lg border border-white/[0.04] bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: DEPT_COLORS[h.department_type] || '#fff' }} />
                    <span className="text-white text-[10px] font-bold">{h.callsign}</span>
                    <span className="text-white/20 text-[8px] ml-auto">{new Date(h.created_date).toLocaleTimeString()}</span>
                  </div>
                  {h.location && <p className="text-white/40 text-[9px] mt-0.5">{h.location}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {activeUnits.map(u => {
                const color = DEPT_COLORS[u.department_type] || '#fff';
                const logo = getDeptLogo(u);
                const hasLoc = u.map_x_pct != null;
                const hasUnread = messages.some(m => m.from_email === u.user_email && m.to_email === user?.email && !m.read);
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUnit(selectedUnit?.id === u.id ? null : u)}
                    className={`w-full text-left p-2 rounded-lg border transition-all ${
                      selectedUnit?.id === u.id
                        ? 'border-white/20 bg-white/[0.08]'
                        : 'border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {logo ? (
                        <img src={logo} alt="" className="w-4 h-4 rounded-full object-cover" />
                      ) : (
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                      )}
                      <span className="text-white text-xs font-bold">{u.callsign}</span>
                      <span className="text-white/30 text-[10px] ml-auto">{u.status}</span>
                      {hasUnread && dmsEnabled && <span className="w-2 h-2 rounded-full bg-crimson flex-shrink-0" />}
                    </div>
                    {u.rp_name && <p className="text-white/40 text-[10px] mt-0.5 ml-4">{u.rp_name}</p>}
                    {u.location && <p className="text-white/30 text-[10px] ml-4 truncate">{u.location}</p>}
                    {!hasLoc && <p className="text-amber-400/60 text-[9px] ml-4 flex items-center gap-1 mt-0.5"><AlertCircle size={8} /> No position</p>}
                  </button>
                );
              })}
              {activeUnits.length === 0 && (
                <p className="text-white/20 text-xs text-center py-8">No active units</p>
              )}
            </div>
          )}
        </div>

        {/* Zoom controls */}
        <div className="p-3 border-t border-white/[0.06] flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="flex-1 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white/60 hover:text-white text-xs transition-all">+</button>
          <span className="text-white/30 text-xs">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="flex-1 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white/60 hover:text-white text-xs transition-all">−</button>
          <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-white/40 hover:text-white transition-all" title="Reset"><RefreshCw size={11} /></button>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden" ref={containerRef}>
        {/* Location ping prompt */}
        {showPing && !isDispatch && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[#1a0a00] border border-amber-500/40 rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl">
            <Clock size={14} className="text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-white text-xs font-semibold">Location Update Required</p>
              <p className="text-white/50 text-[10px]">Click on the map to update your position</p>
            </div>
            <button onClick={() => setShowPing(false)} className="text-white/30 hover:text-white ml-2">
              <X size={13} />
            </button>
          </div>
        )}

        {/* Selected unit info + DM */}
        {selectedUnit && (
          <div className="absolute top-3 right-3 z-20 bg-[#111]/90 border border-white/10 rounded-xl p-3 w-64 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getDeptLogo(selectedUnit) ? (
                  <img src={getDeptLogo(selectedUnit)} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: DEPT_COLORS[selectedUnit.department_type] || '#fff' }} />
                )}
                <span className="text-white font-bold text-sm">{selectedUnit.callsign}</span>
              </div>
              <button onClick={() => setSelectedUnit(null)} className="text-white/30 hover:text-white"><X size={12} /></button>
            </div>
            <div className="space-y-1 text-xs">
              {selectedUnit.rp_name && <p className="text-white/60">{selectedUnit.rp_name}</p>}
              <p className="text-white/40">{selectedUnit.department_type?.toUpperCase()}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-white/30">Status:</span>
                <span className="text-emerald-400 font-mono">{selectedUnit.status}</span>
              </div>
              {selectedUnit.location && (
                <div className="flex items-start gap-1.5 mt-1">
                  <MapPin size={10} className="text-crimson mt-0.5 flex-shrink-0" />
                  <span className="text-white/60">{selectedUnit.location}</span>
                </div>
              )}
              {selectedUnit.vehicle && <p className="text-white/40">{selectedUnit.vehicle}</p>}
            </div>

            {/* DM panel */}
            {dmsEnabled && selectedUnit.user_email !== user?.email && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-white/50 text-[10px] font-semibold mb-1.5 flex items-center gap-1">
                  <MessageSquare size={10} /> Direct Message
                </p>
                <div className="max-h-32 overflow-y-auto space-y-1 mb-2">
                  {dmThread.map(m => (
                    <div key={m.id} className={`text-[10px] p-1.5 rounded ${m.from_email === user?.email ? 'bg-crimson/10 text-crimson/90' : 'bg-white/5 text-white/70'}`}>
                      <p>{m.body}</p>
                      <p className="text-white/20 text-[8px] mt-0.5">{new Date(m.created_date).toLocaleTimeString()}</p>
                    </div>
                  ))}
                  {dmThread.length === 0 && <p className="text-white/20 text-[9px] text-center py-1">No messages yet</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    value={dmText}
                    onChange={e => setDmText(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-white/[0.05] border-white/10 text-white text-[10px] h-7 rounded-lg"
                    onKeyDown={e => { if (e.key === 'Enter' && dmText.trim()) sendDmMutation.mutate(); }}
                  />
                  <button
                    onClick={() => dmText.trim() && sendDmMutation.mutate()}
                    disabled={!dmText.trim() || sendDmMutation.isPending}
                    className="p-1.5 rounded-lg bg-crimson/20 border border-crimson/30 text-crimson hover:bg-crimson/30 transition-all disabled:opacity-30"
                  >
                    <Send size={11} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map canvas */}
        <div
          className="w-full h-full"
          style={{ cursor: isPanning ? 'grabbing' : showPing && !isDispatch ? 'crosshair' : 'grab' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            ref={mapRef}
            className="relative origin-top-left select-none"
            style={{
              width: '100%',
              height: '100%',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
            onClick={handleMapClick}
          >
            {mapImage ? (
              <img
                src={mapImage}
                alt="Dispatch Map"
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#111]">
                <p className="text-white/20 text-sm">No map image configured</p>
              </div>
            )}

            {/* Postal labels */}
            {streets.map((s, i) => (
              <PostalLabel key={i} street={s} zoom={zoom} />
            ))}

            {/* Unit pins */}
            {filteredUnits.map(u => (
              <UnitPin
                key={u.id}
                unit={u}
                selected={selectedUnit?.id === u.id}
                onClick={setSelectedUnit}
                deptLogo={getDeptLogo(u)}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-[#0a0a0a]/80 border border-white/10 rounded-xl p-2.5 backdrop-blur-sm">
          <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1.5">Units</p>
          {departments.filter(d => d.logo_url).length > 0 ? (
            <div className="space-y-1">
              {departments.filter(d => d.logo_url).map(d => (
                <div key={d.name} className="flex items-center gap-1.5 mb-1">
                  <img src={d.logo_url} alt="" className="w-3 h-3 rounded-full object-cover" />
                  <span className="text-white/50 text-[10px]">{d.short_name || d.name}</span>
                </div>
              ))}
            </div>
          ) : (
            Object.entries(DEPT_COLORS).map(([dept, color]) => (
              <div key={dept} className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-white/50 text-[10px] capitalize">{dept}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}