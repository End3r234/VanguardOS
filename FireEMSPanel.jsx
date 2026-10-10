import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame, Radio, Plus, PowerOff, Power, FileText, Scale, ClipboardList, MapPin, ChevronDown, Navigation, X, Bell } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import UnitLocationPicker from '@/components/panels/UnitLocationPicker';
import ShiftSummaryReport from '@/components/panels/ShiftSummaryReport';
import PanelHandbook from '@/components/panels/PanelHandbook';
import RadioWidget from '@/components/panels/RadioWidget';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import StatusBadge from '@/components/StatusBadge';
import AssignedCallBanner from '@/components/dispatch/AssignedCallBanner';
import ReportsPanel from '@/components/panels/ReportsPanel';
import PenalCodeManager from '@/components/settings/PenalCodeManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FireEMSPanel({ server, units, calls, user, myMember, serverId, isAdmin, isOwner }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showLocationReminder, setShowLocationReminder] = useState(false);
  const [newUnit, setNewUnit] = useState({ callsign: '', vehicle: '', department_name: '', rp_name: '' });
  const queryClient = useQueryClient();

  const myUnit = units.find(u => u.user_email === user?.email && u.department_type === 'fire');
  const allFireUnits = units.filter(u => u.department_type === 'fire' && u.status !== '10-42');
  const assignedCall = myUnit?.assigned_call_id ? calls.find(c => c.id === myUnit.assigned_call_id) : null;

  const fireDepts = (server?.departments || []).filter(d => d.type === 'fire');

  const createUnitMutation = useMutation({
    mutationFn: () => base44.entities.Unit.create({
      server_id: serverId,
      user_email: user.email,
      callsign: newUnit.callsign,
      department_type: 'fire',
      department_name: newUnit.department_name || fireDepts[0]?.name || 'Fire',
      vehicle: newUnit.vehicle,
      status: '10-8',
      rp_name: newUnit.rp_name,
      on_duty_since: new Date().toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-units'] });
      setShowCreate(false);
      setNewUnit({ callsign: '', vehicle: '', department_name: '', rp_name: '' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status) => base44.entities.Unit.update(myUnit.id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server-units'] }),
  });

  const goOffDuty = useMutation({
    mutationFn: () => base44.entities.Unit.update(myUnit.id, { status: '10-42' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server-units'] }),
  });

  // Location reminder interval (only when live map enabled and unit is on duty)
  const pingInterval = server?.unit_ping_interval;
  const liveMapEnabled = server?.live_map_enabled && server?.live_map_preset !== 'none';
  useEffect(() => {
    if (!liveMapEnabled || !myUnit || !pingInterval || myUnit.status === '10-42') return;
    const ms = (Number(pingInterval) || 120) * 1000;
    const timer = setInterval(() => setShowLocationReminder(true), ms);
    return () => clearInterval(timer);
  }, [liveMapEnabled, myUnit?.id, pingInterval]);

  const dismissReminder = () => {
    setShowLocationReminder(false);
    if (myUnit) {
      const ignores = (myUnit.location_reminder_ignores || 0) + 1;
      base44.entities.Unit.update(myUnit.id, { location_reminder_ignores: ignores })
        .then(() => queryClient.invalidateQueries({ queryKey: ['server-units'] }));
    }
  };

  const statuses = ['10-8', '10-7', '10-6', '10-97', '10-11', '10-23'];
  const STATUS_COLORS = {
    '10-8':  'text-emerald-400', '10-7': 'text-amber-400', '10-6': 'text-yellow-400',
    '10-97': 'text-blue-400',   '10-42': 'text-zinc-400', '10-11': 'text-purple-400',
    '10-23': 'text-cyan-400',
  };

  const changeUnitStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Unit.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server-units'] }),
  });

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div className="px-5 py-3 border-b border-white/[0.06] bg-[#0d0d0d] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {(() => {
            const myDept = fireDepts.find(d => d.name === myUnit?.department_name) || fireDepts[0];
            return myDept?.logo_url
              ? <img src={myDept.logo_url} alt={myDept.name} className="w-8 h-8 rounded-lg object-contain bg-black/30 p-0.5" onError={e => { e.target.style.display='none'; }} />
              : <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20"><Flame size={15} className="text-orange-400" /></div>;
          })()}
          <div>
            <h2 className="text-white font-semibold text-sm">Fire / EMS</h2>
            {myUnit && <p className="text-white/55 text-xs font-semibold tracking-wide">{myUnit.rp_name || myUnit.callsign} · {myUnit.callsign}</p>}
          </div>
          <PanelHandbook panel="fire" />
        </div>
        {!myUnit && (
          <CrimsonButton onClick={() => setShowCreate(true)} className="h-9 text-sm">
            <Plus size={14} className="mr-1" /> Go On Duty
          </CrimsonButton>
        )}
        {myUnit && myUnit.status !== '10-42' && (
          <div className="flex items-center gap-2">
            <Select value={myUnit.status} onValueChange={v => updateStatusMutation.mutate(v)}>
              <SelectTrigger className="w-32 bg-white/[0.05] border-white/10 text-white text-sm rounded-xl h-8"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {liveMapEnabled && (
              <button
                onClick={() => setShowLocationPicker(true)}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-xs transition-all"
                title="Set map location"
              >
                <Navigation size={12} className={myUnit.map_x_pct != null ? 'text-emerald-400' : 'text-white/40'} />
                <span className="hidden md:inline max-w-[90px] truncate">{myUnit.location || 'Set Location'}</span>
              </button>
            )}
            <CrimsonButton variant="outline" onClick={() => goOffDuty.mutate()} className="h-8 text-sm">
              <PowerOff size={14} className="mr-1" /> Off Duty
            </CrimsonButton>
          </div>
        )}
        {myUnit && myUnit.status === '10-42' && (
          <CrimsonButton onClick={() => { setNewUnit({ callsign: '', vehicle: '', department_name: fireDepts[0]?.name || '' }); setShowCreate(true); }} className="h-9 text-sm">
            <Power size={14} className="mr-1" /> Go Back On Duty
          </CrimsonButton>
        )}
      </div>

      {/* Location reminder banner */}
      {showLocationReminder && myUnit && (
        <div className="flex items-center gap-3 px-5 py-2 bg-amber-500/10 border-b border-amber-500/20 flex-shrink-0">
          <Bell size={13} className="text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-xs flex-1">Time to update your map location. Dispatch needs your current position.</p>
          <button
            onClick={() => { setShowLocationReminder(false); setShowLocationPicker(true); }}
            className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition-all"
          >
            Update Now
          </button>
          <button onClick={dismissReminder} className="text-white/30 hover:text-white transition-all">
            <X size={13} />
          </button>
        </div>
      )}

      {assignedCall && (
        <div className="px-6 pt-3 flex-shrink-0"><AssignedCallBanner call={assignedCall} /></div>
      )}

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="units" className="h-full flex flex-col">
          <div className="px-6 pt-4 flex-shrink-0">
            <TabsList className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 h-auto">
              <TabsTrigger value="units" className="text-white/40 data-[state=active]:text-titanium data-[state=active]:bg-white/10 data-[state=active]:border data-[state=active]:border-white/20 rounded-lg text-xs font-semibold px-3 py-1.5">
                <Radio size={12} className="mr-1.5" /> Units
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-white/40 data-[state=active]:text-titanium data-[state=active]:bg-white/10 data-[state=active]:border data-[state=active]:border-white/20 rounded-lg text-xs font-semibold px-3 py-1.5">
                <FileText size={12} className="mr-1.5" /> Reports
              </TabsTrigger>
              <TabsTrigger value="radio" className="text-white/40 data-[state=active]:text-titanium data-[state=active]:bg-white/10 data-[state=active]:border data-[state=active]:border-white/20 rounded-lg text-xs font-semibold px-3 py-1.5">
                <Radio size={12} className="mr-1.5" /> Radio
              </TabsTrigger>
              <TabsTrigger value="penal" className="text-white/40 data-[state=active]:text-titanium data-[state=active]:bg-white/10 data-[state=active]:border data-[state=active]:border-white/20 rounded-lg text-xs font-semibold px-3 py-1.5">
                <Scale size={12} className="mr-1.5" /> Penal Code
              </TabsTrigger>
              <TabsTrigger value="shift" className="text-white/40 data-[state=active]:text-titanium data-[state=active]:bg-white/10 data-[state=active]:border data-[state=active]:border-white/20 rounded-lg text-xs font-semibold px-3 py-1.5">
                <ClipboardList size={12} className="mr-1.5" /> Shift
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="units" className="px-6 pb-6 pt-4">
            {myUnit && myUnit.status !== '10-42' && (
              <GlassCard className="mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Radio size={15} className="text-orange-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{myUnit.callsign}</span>
                        <StatusBadge status={myUnit.status} />
                      </div>
                      <span className="text-white/30 text-xs">{myUnit.department_name} • {myUnit.vehicle}</span>
                    </div>
                  </div>
                  <Select value={myUnit.status} onValueChange={v => updateStatusMutation.mutate(v)}>
                    <SelectTrigger className="w-32 bg-white/[0.05] border-white/10 text-white text-sm rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                      {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </GlassCard>
            )}
            <p className="text-white/30 text-xs mb-3">{allFireUnits.length} active unit{allFireUnits.length !== 1 ? 's' : ''} on duty</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allFireUnits.map(unit => {
                const deptMeta = fireDepts.find(d => d.name === unit.department_name);
                const isMyUnit = unit.user_email === user?.email;
                return (
                <div key={unit.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 p-3 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/[0.07]">
                    {deptMeta?.logo_url
                      ? <img src={deptMeta.logo_url} alt="" className="w-full h-full object-contain p-0.5" onError={e => { e.target.style.display='none'; }} />
                      : <Flame size={14} className="text-orange-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{unit.callsign}{isMyUnit && <span className="ml-1.5 text-[9px] text-white/30">(you)</span>}</p>
                    <p className="text-white/35 text-[10px] truncate">{unit.department_name}</p>
                  </div>
                  {isMyUnit ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/10 transition-all ${STATUS_COLORS[unit.status] || 'text-white'}`}>
                          {unit.status} <ChevronDown size={10} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#1a1a1a] border-white/10 text-white min-w-[100px]">
                        {statuses.map(s => (
                          <DropdownMenuItem key={s} onClick={() => changeUnitStatusMutation.mutate({ id: unit.id, status: s })}
                            className={`text-xs font-mono cursor-pointer ${STATUS_COLORS[s] || 'text-white'} hover:bg-white/[0.06] focus:bg-white/[0.06]`}>
                            {s}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <StatusBadge status={unit.status} />
                  )}
                </div>
                );
              })}
              {allFireUnits.length === 0 && (
                <div className="col-span-2 text-center py-12 text-white/20 border border-dashed border-white/[0.06] rounded-xl">
                  <Flame size={24} className="mx-auto mb-2 opacity-30" />
                  No active Fire units
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="reports" className="flex-1 overflow-y-auto">
            <ReportsPanel serverId={serverId} user={user} myUnit={myUnit} isSupervisor={false} departmentType="fire" />
          </TabsContent>
          <TabsContent value="radio" className="px-6 pb-6 pt-4">
            <RadioWidget serverId={serverId} user={user} myMember={myMember} isOwner={isOwner} isAdmin={isAdmin} />
          </TabsContent>
          <TabsContent value="penal" className="px-6 pb-6 pt-4">
            <PenalCodeManager server={null} serverId={serverId} readOnly />
          </TabsContent>
          <TabsContent value="shift">
            <ShiftSummaryReport serverId={serverId} user={user} myUnit={myUnit} departmentType="fire" />
          </TabsContent>
        </Tabs>
      </div>

      <UnitLocationPicker
        server={server}
        myUnit={myUnit}
        open={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
      />

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white">
          <DialogHeader><DialogTitle className="text-white">Go On Duty — Fire</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-white/60 text-xs">Roleplay Name</Label>
              <Input value={newUnit.rp_name} onChange={e => setNewUnit({ ...newUnit, rp_name: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="e.g. John Smith" />
            </div>

            <div>
              <Label className="text-white/60 text-xs">Callsign</Label>
              <Input value={newUnit.callsign} onChange={e => setNewUnit({ ...newUnit, callsign: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="e.g. Engine-1" />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Vehicle/Apparatus</Label>
              <Input value={newUnit.vehicle} onChange={e => setNewUnit({ ...newUnit, vehicle: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="e.g. Engine 41" />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Agency</Label>
              {fireDepts.length > 0 ? (
                <Select value={newUnit.department_name} onValueChange={v => setNewUnit({ ...newUnit, department_name: v })}>
                  <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"><SelectValue placeholder="Select agency" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    {fireDepts.map(d => <SelectItem key={d.name} value={d.name}>{d.name} {d.short_name ? `(${d.short_name})` : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-white/30 text-xs mt-1 p-2 rounded-lg bg-white/[0.03] border border-white/10">No agencies configured. Ask your server owner to add departments in Settings.</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <CrimsonButton variant="ghost" onClick={() => setShowCreate(false)}>Cancel</CrimsonButton>
              <CrimsonButton onClick={() => createUnitMutation.mutate()} disabled={!newUnit.callsign || (!newUnit.department_name && fireDepts.length > 0)}>Go On Duty</CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}