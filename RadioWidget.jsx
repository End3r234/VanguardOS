// RadioWidget — standalone resizable radio panel, usable in Dispatch, Police, Fire/EMS
import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Radio, Plus, X, Users, Lock, Mic, MicOff, GripHorizontal, Maximize2, Minimize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CrimsonButton from '@/components/CrimsonButton';
import { playTone } from '@/lib/toneEngine';

const RADIO_COLORS = ['#F59E0B', '#CE0000', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

const DEPT_LABELS = { police: 'LEO', fire: 'Fire', ems: 'EMS', dispatch: 'Dispatch' };

const SIZES = [
  { label: 'S', height: 220 },
  { label: 'M', height: 340 },
  { label: 'L', height: 480 },
  { label: 'XL', height: 640 },
];

export default function RadioWidget({ serverId, user, myMember, isOwner, isAdmin, compact = false }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newRadio, setNewRadio] = useState({ name: '', color: '#3B82F6', description: '', allowed_dept_types: [] });
  const [sizeIdx, setSizeIdx] = useState(compact ? 0 : 1);
  const queryClient = useQueryClient();

  const { data: radios = [] } = useQuery({
    queryKey: ['radios', serverId],
    queryFn: () => base44.entities.RadioChannel.filter({ server_id: serverId }),
    refetchInterval: 5000,
  });

  const userDeptType = myMember?.department_type || '';

  const canAccessRadio = (radio) => {
    if (isOwner || isAdmin) return true;
    const allowed = radio.allowed_dept_types || [];
    if (allowed.length === 0) return true;
    return allowed.includes(userDeptType);
  };

  const createMutation = useMutation({
    mutationFn: () => base44.entities.RadioChannel.create({ ...newRadio, server_id: serverId, active_users: [] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radios'] });
      setShowCreate(false);
      setNewRadio({ name: '', color: '#3B82F6', description: '', allowed_dept_types: [] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RadioChannel.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['radios'] }),
  });

  const toggleJoin = useMutation({
    mutationFn: async (radio) => {
      const current = radio.active_users || [];
      const isOn = current.includes(user?.email);
      const updated = isOn ? current.filter(e => e !== user?.email) : [...current, user?.email];
      playTone('radio_click');
      return base44.entities.RadioChannel.update(radio.id, { active_users: updated });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['radios'] }),
  });

  const toggleDeptFilter = (dept) => {
    setNewRadio(prev => {
      const cur = prev.allowed_dept_types || [];
      return { ...prev, allowed_dept_types: cur.includes(dept) ? cur.filter(d => d !== dept) : [...cur, dept] };
    });
  };

  const visibleRadios = radios.filter(r => canAccessRadio(r));
  const activeCount = visibleRadios.filter(r => (r.active_users || []).includes(user?.email)).length;
  const currentHeight = SIZES[sizeIdx].height;

  return (
    <div className="flex flex-col rounded-xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-white/[0.02] flex-shrink-0">
        <div className="flex items-center gap-2">
          <Radio size={12} className="text-crimson" />
          <span className="text-white/70 text-[11px] font-bold uppercase tracking-widest font-mono-cad">Radio</span>
          {activeCount > 0 && (
            <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {activeCount} LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Size picker */}
          <div className="flex items-center gap-0.5 mr-1">
            {SIZES.map((s, i) => (
              <button key={s.label} onClick={() => setSizeIdx(i)}
                className={`text-[9px] w-5 h-5 rounded font-bold transition-all ${sizeIdx === i ? 'bg-crimson/30 text-crimson border border-crimson/40' : 'text-white/20 hover:text-white/50'}`}>
                {s.label}
              </button>
            ))}
          </div>
          {(isOwner || isAdmin) && (
            <button onClick={() => setShowCreate(true)} className="p-1 hover:bg-white/10 rounded transition-colors">
              <Plus size={11} className="text-white/40 hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Channel list */}
      <div className="overflow-y-auto p-2 space-y-1.5 transition-all duration-200" style={{ height: currentHeight }}>
        {visibleRadios.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Radio size={20} className="text-white/10 mb-2" />
            <p className="text-white/20 text-[10px]">
              {(isOwner || isAdmin) ? 'No channels yet. Create one.' : 'No channels available.'}
            </p>
          </div>
        ) : (
          visibleRadios.map(radio => {
            const onRadio = (radio.active_users || []).includes(user?.email);
            const count = (radio.active_users || []).length;
            const locked = !canAccessRadio(radio);
            const depts = radio.allowed_dept_types || [];

            return (
              <div
                key={radio.id}
                className={`group relative rounded-lg overflow-hidden transition-all duration-150 ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.01]'}`}
                style={{
                  border: `1px solid ${radio.color}${onRadio ? '55' : '1A'}`,
                  background: `${radio.color}${onRadio ? '18' : '08'}`,
                }}
                onClick={() => !locked && toggleJoin.mutate(radio)}
              >
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  {/* Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: radio.color + (onRadio ? '28' : '14'), border: `1px solid ${radio.color}${onRadio ? '50' : '25'}` }}>
                      {locked ? <Lock size={13} style={{ color: radio.color }} />
                        : onRadio ? <Mic size={13} style={{ color: radio.color }} />
                        : <MicOff size={13} style={{ color: radio.color + '88' }} />}
                    </div>
                    {onRadio && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0d0d0d] animate-pulse" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-bold text-xs truncate font-mono-cad tracking-wide">{radio.name}</span>
                      {onRadio && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase"
                          style={{ background: radio.color + '28', color: radio.color }}>LIVE</span>
                      )}
                    </div>
                    {radio.description && (
                      <div className="text-white/30 text-[9px] truncate leading-tight mt-0.5">{radio.description}</div>
                    )}
                    {depts.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {depts.map(d => (
                          <span key={d} className="text-[8px] px-1.5 py-0.5 rounded-md font-semibold"
                            style={{ background: radio.color + '20', color: radio.color + 'CC' }}>
                            {DEPT_LABELS[d] || d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-white/30 text-[10px] flex items-center gap-0.5">
                      <Users size={9} /> {count}
                    </span>
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={e => { e.stopPropagation(); deleteMutation.mutate(radio.id); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-white/20 rounded transition-all"
                      ><X size={10} /></button>
                    )}
                  </div>
                </div>

                {/* Active users strip — count only, no emails */}
                {onRadio && count > 0 && (
                  <div className="px-3 pb-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/40">
                        {count} unit{count !== 1 ? 's' : ''} on channel
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create channel dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><Radio size={15} className="text-crimson" /> New Radio Channel</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-white/60 text-xs">Channel Name</Label>
              <Input value={newRadio.name} onChange={e => setNewRadio({ ...newRadio, name: e.target.value })}
                className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="e.g. TAC 1, LEO RTO, Fire OPS" />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Description <span className="text-white/30">(optional)</span></Label>
              <Input value={newRadio.description} onChange={e => setNewRadio({ ...newRadio, description: e.target.value })}
                className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="Short channel description" />
            </div>
            <div>
              <Label className="text-white/60 text-xs mb-2 block">Restrict to Departments <span className="text-white/30">(leave empty = all)</span></Label>
              <div className="flex flex-wrap gap-2">
                {['police', 'fire', 'ems', 'dispatch'].map(dept => {
                  const active = (newRadio.allowed_dept_types || []).includes(dept);
                  return (
                    <button key={dept} onClick={() => toggleDeptFilter(dept)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all capitalize ${active ? 'bg-crimson/20 border-crimson/40 text-crimson' : 'bg-white/[0.04] border-white/10 text-white/40 hover:border-white/20'}`}>
                      {dept}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className="text-white/60 text-xs">Channel Color</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {RADIO_COLORS.map(c => (
                  <button key={c} onClick={() => setNewRadio({ ...newRadio, color: c })}
                    className={`w-7 h-7 rounded-lg border-2 transition-all ${newRadio.color === c ? 'border-white scale-110' : 'border-transparent hover:border-white/30'}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <CrimsonButton variant="ghost" onClick={() => setShowCreate(false)}>Cancel</CrimsonButton>
              <CrimsonButton onClick={() => createMutation.mutate()} disabled={!newRadio.name}>Create Channel</CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}