import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Radio, Plus, X, Users, Lock, Mic, MicOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CrimsonButton from '@/components/CrimsonButton';
import { playTone } from '@/lib/toneEngine';

const RADIO_COLORS = ['#F59E0B', '#CE0000', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#6B7280'];

const DEPT_OPTIONS = [
  { value: '', label: 'All Departments' },
  { value: 'police', label: 'Law Enforcement' },
  { value: 'fire', label: 'Fire' },
  { value: 'ems', label: 'EMS' },
  { value: 'dispatch', label: 'Dispatch' },
];

export default function RadioSidebar({ serverId, user, myMember, isOwner, isAdmin }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newRadio, setNewRadio] = useState({ name: '', color: '#3B82F6', description: '', allowed_dept_types: [] });
  const [deptFilter, setDeptFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: radios = [] } = useQuery({
    queryKey: ['radios', serverId],
    queryFn: () => base44.entities.RadioChannel.filter({ server_id: serverId }),
  });

  const userDeptType = myMember?.department_type || '';

  // Check if user can access this radio channel
  const canAccessRadio = (radio) => {
    if (isOwner || isAdmin) return true;
    const allowed = radio.allowed_dept_types || [];
    if (allowed.length === 0) return true;
    return allowed.includes(userDeptType);
  };

  const createMutation = useMutation({
    mutationFn: () => base44.entities.RadioChannel.create({
      ...newRadio,
      server_id: serverId,
      active_users: [],
    }),
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
      const current = prev.allowed_dept_types || [];
      return {
        ...prev,
        allowed_dept_types: current.includes(dept)
          ? current.filter(d => d !== dept)
          : [...current, dept],
      };
    });
  };

  const visibleRadios = radios.filter(r => canAccessRadio(r));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-widest">
          <Radio size={12} /> Radio
          {visibleRadios.length > 0 && <span className="text-white/25 font-normal normal-case tracking-normal">({visibleRadios.length})</span>}
        </div>
        {(isOwner || isAdmin) && (
          <button onClick={() => setShowCreate(true)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors border border-white/[0.06]">
            <Plus size={12} className="text-white/40 hover:text-white" />
          </button>
        )}
      </div>

      {visibleRadios.map(radio => {
        const onRadio = (radio.active_users || []).includes(user?.email);
        const count = (radio.active_users || []).length;
        const locked = !canAccessRadio(radio);
        return (
          <div
            key={radio.id}
            className={`group relative rounded-xl overflow-hidden transition-all ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            style={{ border: `1px solid ${radio.color}${onRadio ? '60' : '20'}` }}
            onClick={() => !locked && toggleJoin.mutate(radio)}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between px-3 py-2.5" style={{ background: radio.color + (onRadio ? '22' : '0D') }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: radio.color + '30', border: `1px solid ${radio.color}40` }}>
                    {locked ? <Lock size={12} style={{ color: radio.color }} /> : onRadio ? <Mic size={12} style={{ color: radio.color }} /> : <MicOff size={12} style={{ color: radio.color + 'AA' }} />}
                  </div>
                  {onRadio && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-[#111] animate-pulse" />}
                </div>
                <div className="min-w-0">
                  <div className="text-white text-xs font-bold truncate leading-tight">{radio.name}</div>
                  {radio.description && <div className="text-white/30 text-[9px] truncate leading-tight mt-0.5">{radio.description}</div>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                {onRadio && <span className="text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wide" style={{ background: radio.color + '30', color: radio.color }}>LIVE</span>}
                <span className="text-white/25 text-[9px] flex items-center gap-0.5"><Users size={9} />{count}</span>
                {(isOwner || isAdmin) && (
                  <button
                    onClick={e => { e.stopPropagation(); deleteMutation.mutate(radio.id); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-white/20 rounded transition-all"
                  ><X size={10} /></button>
                )}
              </div>
            </div>
            {/* Dept tags */}
            {(radio.allowed_dept_types || []).length > 0 && (
              <div className="flex gap-1 px-3 pb-2 flex-wrap" style={{ background: radio.color + '08' }}>
                {radio.allowed_dept_types.map(d => (
                  <span key={d} className="text-[8px] px-1.5 py-0.5 rounded-md font-medium capitalize" style={{ background: radio.color + '20', color: radio.color }}>{d}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {visibleRadios.length === 0 && (
        <div className="text-center py-6 text-white/20 text-[10px] border border-dashed border-white/[0.08] rounded-xl">
          {(isOwner || isAdmin) ? 'No channels yet. Create one.' : 'No channels available.'}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white">
          <DialogHeader><DialogTitle className="text-white">Create Radio Channel</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-white/60 text-xs">Channel Name</Label>
              <Input value={newRadio.name} onChange={e => setNewRadio({ ...newRadio, name: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="e.g. TAC 1, LEO RTO" />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Description</Label>
              <Input value={newRadio.description} onChange={e => setNewRadio({ ...newRadio, description: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="Optional" />
            </div>
            <div>
              <Label className="text-white/60 text-xs mb-2 block">Department Restrictions <span className="text-white/30">(empty = all)</span></Label>
              <div className="flex flex-wrap gap-2">
                {['police', 'fire', 'ems', 'dispatch'].map(dept => {
                  const active = (newRadio.allowed_dept_types || []).includes(dept);
                  return (
                    <button
                      key={dept}
                      onClick={() => toggleDeptFilter(dept)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all capitalize ${active ? 'bg-crimson/20 border-crimson/40 text-crimson' : 'bg-white/[0.04] border-white/10 text-white/40 hover:border-white/20'}`}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label className="text-white/60 text-xs">Color</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {RADIO_COLORS.map(c => (
                  <button key={c} onClick={() => setNewRadio({ ...newRadio, color: c })}
                    className={`w-7 h-7 rounded-lg border-2 transition-all ${newRadio.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <CrimsonButton variant="ghost" onClick={() => setShowCreate(false)}>Cancel</CrimsonButton>
              <CrimsonButton onClick={() => createMutation.mutate()} disabled={!newRadio.name}>Create</CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}