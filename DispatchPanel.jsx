import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Search, Radio, AlertTriangle, Users, X, Clock,
  ChevronDown, MapPin, Phone, FileText, Zap, Scale, Maximize2, Minimize2, Monitor, Play
} from 'lucide-react';
import PenalCodeManager from '@/components/settings/PenalCodeManager';
import PanelHandbook from '@/components/panels/PanelHandbook';
import RadioWidget from '@/components/panels/RadioWidget';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CallCard from '@/components/dispatch/CallCard';
import DispatchRecommendations from '@/components/dispatch/DispatchRecommendations';
import TonePanel from '@/components/dispatch/TonePanel';
import CrimsonButton from '@/components/CrimsonButton';
import { playDispatchTone } from '@/lib/toneEngine';
import DispatchAI from '@/components/dispatch/DispatchAI';
import { showPopup } from '@/lib/miniPopups';
import { logIncidentEvent } from '@/lib/incidentEvents';
import { trackEvent } from '@/lib/analytics';
import CommandMode from '@/components/dispatch/CommandMode';
import IncidentReplay from '@/components/replay/IncidentReplay';

const STATUS_CODES = ['10-8', '10-7', '10-6', '10-97', '10-42', '10-11', '10-23'];
const STATUS_COLORS = {
  '10-8':  { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25' },
  '10-7':  { bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/25'   },
  '10-6':  { bg: 'bg-yellow-500/15',  text: 'text-yellow-400',  border: 'border-yellow-500/25'  },
  '10-97': { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/25'    },
  '10-42': { bg: 'bg-zinc-500/15',    text: 'text-zinc-400',    border: 'border-zinc-500/25'    },
  '10-11': { bg: 'bg-purple-500/15',  text: 'text-purple-400',  border: 'border-purple-500/25'  },
  '10-23': { bg: 'bg-cyan-500/15',    text: 'text-cyan-400',    border: 'border-cyan-500/25'    },
};
const PRIO_STYLES = {
  P1: { bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400',    dot: 'bg-red-500' },
  P2: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' },
  P3: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  P4: { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-400',   dot: 'bg-blue-500' },
};

function UnitStatusButton({ unit, onStatusChange }) {
  const st = unit.status || '10-8';
  const col = STATUS_COLORS[st] || STATUS_COLORS['10-8'];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`text-[9px] px-1.5 py-0.5 rounded font-black border transition-all hover:opacity-80 flex items-center gap-0.5 ${col.bg} ${col.text} ${col.border}`}>
          {st} <ChevronDown size={7} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#111] border-white/10 text-white text-xs min-w-[100px]" side="right">
        {STATUS_CODES.map(code => {
          const c = STATUS_COLORS[code] || STATUS_COLORS['10-8'];
          return (
            <DropdownMenuItem key={code} onClick={() => onStatusChange(unit.id, code)}
              className={`text-xs font-mono cursor-pointer ${c.text} hover:bg-white/[0.06] focus:bg-white/[0.06]`}>
              {code}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const getDeptLogo = (server, unit) => {
  const depts = server?.departments || [];
  return depts.find(d => d.name === unit.department_name)?.logo_url || null;
};

export default function DispatchPanel({ server, units, calls, user, myMember, serverId, isAdmin, isOwner }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [showNote, setShowNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [recUnit, setRecUnit] = useState(null);
  const [newCall, setNewCall] = useState({ type: '', location: '', description: '', caller_info: '', priority: 'P3', department_type: 'all' });
  const [focusMode, setFocusMode] = useState(false);
  const [commandMode, setCommandMode] = useState(false);
  const [showReplay, setShowReplay] = useState(null);
  const queryClient = useQueryClient();

  const activeCalls = calls.filter(c => c.status !== 'closed');
  const availableUnits = units.filter(u => u.status !== '10-42');
  const p1Count = activeCalls.filter(c => c.priority === 'P1').length;
  const p2Count = activeCalls.filter(c => c.priority === 'P2').length;

  const createCallMutation = useMutation({
    mutationFn: async () => {
      const year = new Date().getFullYear();
      const existingCalls = await base44.entities.Call.filter({ server_id: serverId });
      const yearCount = existingCalls.filter(c => c.incident_id?.includes(`INC-${year}-`)).length;
      const nextNum = String(yearCount + 1).padStart(6, '0');
      const incident_id = `INC-${year}-${nextNum}`;
      const num = 'C-' + Date.now().toString().slice(-6);
      return base44.entities.Call.create({ ...newCall, server_id: serverId, call_number: num, incident_id, status: 'pending', assigned_units: [], notes: [] });
    },
    onSuccess: (createdCall) => {
      queryClient.invalidateQueries({ queryKey: ['server-calls'] });
      setShowCreate(false);
      showPopup({ type: 'call', title: 'New Call Created', message: `${newCall.type} at ${newCall.location}` });
      logIncidentEvent({ server_id: serverId, incident_id: createdCall?.incident_id, call_id: createdCall?.id, event_type: 'created', description: `${newCall.type} at ${newCall.location}`, actor_email: user?.email, actor_name: myMember?.callsign || 'Dispatcher', metadata: { priority: newCall.priority, type: newCall.type } });
      trackEvent('call_create', { priority: newCall.priority });
      setNewCall({ type: '', location: '', description: '', caller_info: '', priority: 'P3', department_type: 'all' });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ callId, unitId }) => {
      const call = calls.find(c => c.id === callId);
      const existing = call?.assigned_units || [];
      if (!existing.includes(unitId)) {
        await base44.entities.Call.update(callId, { assigned_units: [...existing, unitId], status: 'active' });
      }
      await base44.entities.Unit.update(unitId, { assigned_call_id: callId, incident_id: call?.incident_id || '', status: '10-97' });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['server-calls'] });
      queryClient.invalidateQueries({ queryKey: ['server-units'] });
      const call = calls.find(c => c.id === variables.callId);
      if (call) playDispatchTone(call.priority);
      const unit = units.find(u => u.id === variables.unitId);
      showPopup({ type: 'affirmation', title: 'Unit Assigned', message: `${unit?.callsign || 'Unit'} assigned to ${call?.type || 'call'}` });
      logIncidentEvent({ server_id: serverId, incident_id: call?.incident_id, call_id: call?.id, event_type: call?.assigned_units?.length > 1 ? 'additional_unit' : 'unit_assigned', description: `${unit?.callsign || 'Unit'} assigned to ${call?.type || 'call'}`, actor_email: user?.email, actor_name: myMember?.callsign || 'Dispatcher', metadata: { unit_callsign: unit?.callsign, unit_id: variables.unitId } });
      trackEvent('unit_assign');
      setShowAssign(null);
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const call = calls.find(c => c.id === showNote.id);
      const notes = [...(call?.notes || []), { text: noteText, author: user?.full_name || user?.email, timestamp: new Date().toISOString() }];
      return base44.entities.Call.update(showNote.id, { notes });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['server-calls'] }); setShowNote(null); logIncidentEvent({ server_id: serverId, incident_id: showNote?.incident_id, call_id: showNote?.id, event_type: 'note_added', description: noteText, actor_email: user?.email, actor_name: myMember?.callsign || 'Dispatcher' }); setNoteText(''); showPopup({ type: 'info', title: 'Note Added', message: 'Call notes have been updated.' }); },
  });

  const closeCallMutation = useMutation({
    mutationFn: async (call) => {
      await base44.entities.Call.update(call.id, { status: 'closed' });
      for (const uid of (call.assigned_units || [])) {
        await base44.entities.Unit.update(uid, { assigned_call_id: '', status: '10-8' });
      }
    },
    onSuccess: (_, call) => {
      queryClient.invalidateQueries({ queryKey: ['server-calls'] });
      queryClient.invalidateQueries({ queryKey: ['server-units'] });
      showPopup({ type: 'affirmation', title: 'Call Closed', message: 'Call marked as closed. Units returned to 10-8.' });
      logIncidentEvent({ server_id: serverId, incident_id: call?.incident_id, call_id: call?.id, event_type: 'incident_closed', description: `${call?.type || 'Call'} closed`, actor_email: user?.email, actor_name: myMember?.callsign || 'Dispatcher', metadata: { assigned_units: call?.assigned_units?.length || 0 } });
    },
  });

  const changeUnitStatus = useMutation({
    mutationFn: ({ unitId, status }) => base44.entities.Unit.update(unitId, { status }),
    onSuccess: (_, { unitId, status }) => {
      queryClient.invalidateQueries({ queryKey: ['server-units'] });
      const unit = units.find(u => u.id === unitId);
      if (unit?.incident_id && (status === '10-97' || status === '10-23' || status === '10-6')) {
        logIncidentEvent({ server_id: serverId, incident_id: unit.incident_id, call_id: unit.assigned_call_id, event_type: 'status_change', description: `${unit.callsign} went ${status}`, actor_email: user?.email, actor_name: myMember?.callsign || 'Dispatcher', metadata: { unit_callsign: unit.callsign, status } });
      }
    },
  });

  const sortedCalls = [...activeCalls].sort((a, b) => {
    const prio = { P1: 0, P2: 1, P3: 2, P4: 3 };
    return (prio[a.priority] || 3) - (prio[b.priority] || 3);
  });

  const filteredUnits = availableUnits.filter(u =>
    !search || u.callsign?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-3rem)] bg-[#0A0A0A] font-inter font-inter">

      {/* ── LEFT SIDEBAR: Unit List ── */}
      {!focusMode && (
      <div className="w-60 border-r border-white/[0.05] flex flex-col overflow-hidden bg-[#0C0C0C]">
        {/* Search */}
        <div className="p-2.5 border-b border-white/[0.05] flex-shrink-0">
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search units..."
              className="pl-7 h-7 text-[11px] bg-white/[0.04] border-white/[0.07] text-white placeholder:text-white/20 rounded-md font-inter" />
          </div>
        </div>

        {/* Units */}
        <div className="flex-1 overflow-y-auto">
          {/* Police */}
          {filteredUnits.filter(u => u.department_type === 'police').length > 0 && (
            <div>
              <div className="px-3 pt-2.5 pb-1">
                <span className="text-[9px] text-blue-400/70 font-black uppercase tracking-[0.12em]">LEO</span>
              </div>
              {filteredUnits.filter(u => u.department_type === 'police').map(u => (
                <UnitListRow key={u.id} unit={u} onSelect={() => setSelectedUnit(u)}
                  deptLogoUrl={getDeptLogo(server, u)}
                  onStatusChange={(id, s) => changeUnitStatus.mutate({ unitId: id, status: s })} />
              ))}
            </div>
          )}
          {/* Fire/EMS */}
          {filteredUnits.filter(u => u.department_type === 'fire' || u.department_type === 'ems').length > 0 && (
            <div>
              <div className="px-3 pt-2.5 pb-1">
                <span className="text-[9px] text-orange-400/70 font-black uppercase tracking-[0.12em]">Fire / EMS</span>
              </div>
              {filteredUnits.filter(u => u.department_type === 'fire' || u.department_type === 'ems').map(u => (
                <UnitListRow key={u.id} unit={u} onSelect={() => setSelectedUnit(u)}
                  deptLogoUrl={getDeptLogo(server, u)}
                  onStatusChange={(id, s) => changeUnitStatus.mutate({ unitId: id, status: s })} />
              ))}
            </div>
          )}
          {/* Dispatch */}
          {filteredUnits.filter(u => u.department_type === 'dispatch').length > 0 && (
            <div>
              <div className="px-3 pt-2.5 pb-1">
                <span className="text-[9px] text-emerald-400/70 font-black uppercase tracking-[0.12em]">Dispatch</span>
              </div>
              {filteredUnits.filter(u => u.department_type === 'dispatch').map(u => (
                <UnitListRow key={u.id} unit={u} onSelect={() => setSelectedUnit(u)}
                  deptLogoUrl={getDeptLogo(server, u)}
                  onStatusChange={(id, s) => changeUnitStatus.mutate({ unitId: id, status: s })} />
              ))}
            </div>
          )}
          {filteredUnits.length === 0 && (
            <div className="text-center py-10 text-white/15 text-[10px]">
              <Radio size={18} className="mx-auto mb-2 opacity-30" />
              No units online
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-white/[0.05] flex-shrink-0">
          <div className="flex items-center gap-1.5 text-[9px] text-white/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            <span>{availableUnits.length} units online</span>
          </div>
        </div>
      </div>
      )}

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] bg-[#0C0C0C] flex-shrink-0">
          <div className="flex items-center gap-4">
            <PanelHandbook panel="dispatch" />
            <div className="h-4 w-px bg-white/[0.08]" />
            {/* Live stats */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 font-mono-cad">{activeCalls.length} CALLS</span>
              {p1Count > 0 && (
                <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded border bg-red-500/10 border-red-500/25 text-red-400 font-black uppercase tracking-widest pulse-p1">
                  <AlertTriangle size={9} /> {p1Count} P1
                </span>
              )}
              {p2Count > 0 && (
                <span className="text-[9px] px-2 py-0.5 rounded border bg-orange-500/10 border-orange-500/25 text-orange-400 font-black uppercase tracking-widest">
                  {p2Count} P2
                </span>
              )}
            </div>
          </div>

          {/* Tones + New Call */}
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <button
              onClick={() => setFocusMode(f => !f)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all ${focusMode ? 'bg-crimson text-white' : 'text-white/40 hover:text-white hover:bg-white/[0.06]'}`}
              title={focusMode ? 'Exit Focus Mode' : 'Focus Mode — Hide sidebars'}
            >
              {focusMode ? <Minimize2 size={12} /> : <Maximize2 size={12} />} Focus
            </button>
            <button
              onClick={() => setCommandMode(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all text-white/40 hover:text-white hover:bg-white/[0.06]"
              title="Command Mode — EOC overview"
            >
              <Monitor size={12} /> Command
            </button>
            <TonePanel serverTones={server?.tones} />
            <div className="h-4 w-px bg-white/[0.08]" />
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-crimson/90 hover:bg-crimson text-white text-[11px] font-bold uppercase tracking-widest transition-all">
              <Plus size={12} /> New Call
            </button>
          </div>
        </div>

        {/* Calls grid */}
        <div className="flex-1 overflow-y-auto p-3">
          {sortedCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/10 py-8">
              <Radio size={28} className="mb-2 opacity-40" />
              <p className="text-xs font-mono-cad tracking-widest uppercase">No Active Calls</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {sortedCalls.map(call => (
                <CallCard key={call.id} call={call}
                  onAssign={() => setShowAssign(call)}
                  onAddNote={() => setShowNote(call)}
                  onClose={() => closeCallMutation.mutate(call)}
                  onReplay={() => setShowReplay(call)} />
              ))}
            </div>
          )}
        </div>
        {focusMode && (
          <button
            onClick={() => setFocusMode(false)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-crimson text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-crimson/20 hover:bg-crimson-dark transition-all"
          >
            <Minimize2 size={14} /> Exit Focus Mode
          </button>
        )}
      </div>

      {/* ── RIGHT SIDEBAR: Radio + Penal Code ── */}
      {!focusMode && (
        <div className="w-64 border-l border-white/[0.05] bg-[#0C0C0C] flex flex-col overflow-hidden">
          <RightSidebar serverId={serverId} user={user} myMember={myMember} isOwner={isOwner} isAdmin={isAdmin} />
        </div>
      )}

      {commandMode && (
        <CommandMode calls={calls} units={units} server={server} serverId={serverId} onClose={() => setCommandMode(false)} />
      )}

      {showReplay && (
        <IncidentReplay call={showReplay} serverId={serverId} onClose={() => setShowReplay(null)} />
      )}

      {/* ── CREATE CALL DIALOG ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#0f0f0f] border-white/[0.08] rounded-2xl text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white font-black tracking-wide flex items-center gap-2">
              <Zap size={15} className="text-crimson" /> NEW CALL
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Call Type</Label>
                <Input value={newCall.type} onChange={e => setNewCall({ ...newCall, type: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08] text-white mt-1.5 rounded-lg text-sm font-inter" placeholder="e.g. Traffic Stop" />
              </div>
              <div>
                <Label className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Priority</Label>
                <Select value={newCall.priority} onValueChange={v => setNewCall({ ...newCall, priority: v })}>
                  <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white mt-1.5 rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#151515] border-white/10 text-white">
                    {['P1','P2','P3','P4'].map(p => {
                      const s = PRIO_STYLES[p];
                      return <SelectItem key={p} value={p} className={s.text}>{p} — {p==='P1'?'Critical':p==='P2'?'Urgent':p==='P3'?'Routine':'Low'}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-white/40 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1"><MapPin size={9} /> Location</Label>
              <Input value={newCall.location} onChange={e => setNewCall({ ...newCall, location: e.target.value })}
                className="bg-white/[0.04] border-white/[0.08] text-white mt-1.5 rounded-lg text-sm" placeholder="e.g. 100 Main St & Oak Ave" />
            </div>
            <div>
              <Label className="text-white/40 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1"><FileText size={9} /> Description</Label>
              <Textarea value={newCall.description} onChange={e => setNewCall({ ...newCall, description: e.target.value })}
                className="bg-white/[0.04] border-white/[0.08] text-white mt-1.5 rounded-lg text-sm" rows={2} placeholder="Incident description..." />
            </div>
            <div>
              <Label className="text-white/40 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1"><Phone size={9} /> Caller Info</Label>
              <Input value={newCall.caller_info} onChange={e => setNewCall({ ...newCall, caller_info: e.target.value })}
                className="bg-white/[0.04] border-white/[0.08] text-white mt-1.5 rounded-lg text-sm" placeholder="Name, callback number..." />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <CrimsonButton variant="ghost" onClick={() => setShowCreate(false)}>Cancel</CrimsonButton>
              <CrimsonButton onClick={() => createCallMutation.mutate()} disabled={!newCall.type || !newCall.location}>
                Create Call
              </CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── ASSIGN UNIT DIALOG ── */}
      <Dialog open={!!showAssign} onOpenChange={() => setShowAssign(null)}>
        <DialogContent className="bg-[#0f0f0f] border-white/[0.08] rounded-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-white font-black tracking-wide text-sm uppercase">Assign Unit</DialogTitle>
          </DialogHeader>
          {showAssign && (
            <div className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-2">
                {(() => { const s = PRIO_STYLES[showAssign.priority] || PRIO_STYLES.P3; return <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border ${s.bg} ${s.text} ${s.border}`}>{showAssign.priority}</span>; })()}
                <span className="text-white font-bold text-sm">{showAssign.type}</span>
              </div>
              <p className="text-white/40 text-xs mt-1">{showAssign.location}</p>
            </div>
          )}
          <DispatchRecommendations
            call={showAssign}
            units={availableUnits}
            onAssign={(unit) => { setRecUnit(unit.id); assignMutation.mutate({ callId: showAssign.id, unitId: unit.id }); }}
            selectedUnitId={recUnit}
          />
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {availableUnits.map(unit => {
              const st = unit.status || '10-8';
              const col = STATUS_COLORS[st] || STATUS_COLORS['10-8'];
              return (
                <button key={unit.id}
                  onClick={() => assignMutation.mutate({ callId: showAssign.id, unitId: unit.id })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-all text-left border border-transparent hover:border-white/[0.06]">
                  <Radio size={13} className="text-crimson flex-shrink-0" />
                  <span className="text-white text-sm font-bold font-mono-cad">{unit.callsign}</span>
                  <span className="text-white/30 text-xs flex-1">{unit.department_name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border ${col.bg} ${col.text} ${col.border}`}>{st}</span>
                </button>
              );
            })}
            {availableUnits.length === 0 && <p className="text-white/25 text-sm text-center py-4">No active units online</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── UNIT DETAIL DIALOG ── */}
      <Dialog open={!!selectedUnit} onOpenChange={() => setSelectedUnit(null)}>
        <DialogContent className="bg-[#0f0f0f] border-white/[0.08] rounded-2xl text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white font-black tracking-wide text-sm uppercase flex items-center gap-2">
              <Radio size={14} className="text-crimson" /> Unit Details
            </DialogTitle>
          </DialogHeader>
          {selectedUnit && (() => {
            const st = selectedUnit.status || '10-8';
            const col = STATUS_COLORS[st] || STATUS_COLORS['10-8'];
            const onDutySince = selectedUnit.on_duty_since ? new Date(selectedUnit.on_duty_since) : selectedUnit.created_date ? new Date(selectedUnit.created_date) : null;
            const mins = onDutySince ? Math.max(0, Math.floor((Date.now() - onDutySince.getTime()) / 60000)) : null;
            const dutyTime = mins !== null ? (mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}h ${mins%60}m`) : '—';
            return (
              <div className="space-y-3 mt-1">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div>
                    <p className="text-white font-black text-xl font-mono-cad tracking-wider">{selectedUnit.callsign}</p>
                    <p className="text-white/40 text-xs">{selectedUnit.department_name}</p>
                  </div>
                  <div className="ml-auto flex flex-col items-end gap-2">
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-black border ${col.bg} ${col.text} ${col.border}`}>{st}</span>
                    {/* Dispatcher can change status from here too */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-[9px] text-white/30 hover:text-white flex items-center gap-0.5 border border-white/10 px-1.5 py-0.5 rounded transition-all">
                          Change <ChevronDown size={8} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#111] border-white/10 text-white min-w-[100px]" side="left">
                        {STATUS_CODES.map(code => {
                          const c = STATUS_COLORS[code] || STATUS_COLORS['10-8'];
                          return (
                            <DropdownMenuItem key={code} onClick={() => { changeUnitStatus.mutate({ unitId: selectedUnit.id, status: code }); setSelectedUnit(prev => ({ ...prev, status: code })); }}
                              className={`text-xs font-mono cursor-pointer ${c.text} hover:bg-white/[0.06] focus:bg-white/[0.06]`}>
                              {code}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <p className="text-white/30 text-[9px] uppercase tracking-wider mb-1">RP Name</p>
                    <p className="text-white text-sm font-semibold">{selectedUnit.rp_name || '—'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <p className="text-white/30 text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1"><Clock size={8} /> On Duty</p>
                    <p className="text-white text-sm font-semibold">{dutyTime}</p>
                  </div>
                  {selectedUnit.vehicle && (
                    <div className="col-span-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <p className="text-white/30 text-[9px] uppercase tracking-wider mb-1">Vehicle</p>
                      <p className="text-white text-sm font-semibold">{selectedUnit.vehicle}</p>
                    </div>
                  )}
                  {selectedUnit.location && (
                    <div className="col-span-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <p className="text-white/30 text-[9px] uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={8} /> Location</p>
                      <p className="text-white text-sm font-semibold">{selectedUnit.location}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── ADD NOTE DIALOG ── */}
      <Dialog open={!!showNote} onOpenChange={() => setShowNote(null)}>
        <DialogContent className="bg-[#0f0f0f] border-white/[0.08] rounded-2xl text-white">
          <DialogHeader><DialogTitle className="text-white font-black tracking-wide text-sm uppercase">Add Note</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Textarea value={noteText} onChange={e => setNoteText(e.target.value)}
              className="bg-white/[0.04] border-white/[0.08] text-white rounded-xl" rows={3} placeholder="Enter call note..." />
            <div className="flex justify-end gap-2">
              <CrimsonButton variant="ghost" onClick={() => setShowNote(null)}>Cancel</CrimsonButton>
              <CrimsonButton onClick={() => addNoteMutation.mutate()} disabled={!noteText}>Add Note</CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {server?.dispatch_ai_enabled && (
        <DispatchAI serverId={serverId} calls={calls} units={units} user={user} />
      )}
    </div>
  );
}

function RightSidebar({ serverId, user, myMember, isOwner, isAdmin }) {
  const [tab, setTab] = useState('radio');
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab switcher */}
      <div className="flex border-b border-white/[0.05] flex-shrink-0">
        <button
          onClick={() => setTab('radio')}
          className={`flex-1 py-2 text-[10px] font-inter font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 ${tab === 'radio' ? 'text-white border-b-2 border-crimson' : 'text-white/30 hover:text-white/60'}`}
        >
          <Radio size={10} /> Radio
        </button>
        <button
          onClick={() => setTab('penal')}
          className={`flex-1 py-2 text-[10px] font-inter font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 ${tab === 'penal' ? 'text-white border-b-2 border-crimson' : 'text-white/30 hover:text-white/60'}`}
        >
          <Scale size={10} /> Penal
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'radio' && (
          <div className="p-2.5">
            <RadioWidget serverId={serverId} user={user} myMember={myMember} isOwner={isOwner} isAdmin={isAdmin} />
          </div>
        )}
        {tab === 'penal' && (
          <div className="p-2.5">
            <PenalCodeManager server={null} serverId={serverId} readOnly />
          </div>
        )}
      </div>
    </div>
  );
}

// Inline unit list row with status dropdown
function UnitListRow({ unit, onSelect, onStatusChange, deptLogoUrl }) {
  const st = unit.status || '10-8';
  const col = STATUS_COLORS[st] || STATUS_COLORS['10-8'];
  const ignoreCount = unit.location_reminder_ignores || 0;
  const isIgnoring = ignoreCount >= 4;
  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 mx-1 rounded-lg hover:bg-white/[0.05] group transition-all">
      <button onClick={onSelect} className="flex-1 flex items-center gap-1.5 min-w-0 text-left">
        <div className="w-6 h-6 rounded-md bg-black/40 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/[0.06]">
          {deptLogoUrl
            ? <img src={deptLogoUrl} alt="" className="w-full h-full object-contain p-0.5" onError={e => { e.target.style.display='none'; }} />
            : <span className="text-white/30 text-[8px] font-bold font-inter">{unit.callsign?.slice(0,3)}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-[11px] font-semibold font-inter leading-tight ${isIgnoring ? 'text-red-400' : 'text-white/85'}`} title={isIgnoring ? 'Unit has ignored location updates 4+ times' : ''}>
            {unit.callsign}
            {isIgnoring && <span className="ml-1 text-[8px] text-red-400/70">⚠</span>}
          </p>
          {unit.location && <p className="text-white/25 text-[9px] truncate leading-tight font-inter">{unit.location}</p>}
        </div>
      </button>
      <UnitStatusButton unit={unit} onStatusChange={onStatusChange} />
    </div>
  );
}