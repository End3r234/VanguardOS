import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, AlertTriangle, Edit2, ShieldAlert } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export const ALERT_TYPES = [
  'Known to Carry Weapons',
  'History of Violence',
  'Previous Assault on Law Enforcement',
  'Mental Health Crisis History',
  'Known to Flee',
  'Frequent Caller',
  'Dangerous Animals',
  'Gate Access Required',
  'Officer Safety Hazard',
  'Medical Alert',
];

export default function SafetyAlertManager({ serverId, recordType, recordId, recordIdentifier, canManage, canView, user }) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newAlert, setNewAlert] = useState({ alert_type: '', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [editNotes, setEditNotes] = useState('');

  const { data: alerts = [] } = useQuery({
    queryKey: ['safety-alerts', serverId, recordType, recordId],
    queryFn: () => base44.entities.OfficerSafetyAlert.filter({
      server_id: serverId, record_type: recordType, record_id: recordId
    }),
    enabled: !!serverId && !!recordId && canView,
  });

  const addMutation = useMutation({
    mutationFn: () => base44.entities.OfficerSafetyAlert.create({
      server_id: serverId,
      record_type: recordType,
      record_id: recordId,
      record_identifier: recordIdentifier,
      alert_type: newAlert.alert_type,
      notes: newAlert.notes,
      added_by_email: user?.email,
      added_by_name: user?.full_name,
      is_active: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-alerts', serverId, recordType, recordId] });
      queryClient.invalidateQueries({ queryKey: ['safety-alerts-server', serverId] });
      setNewAlert({ alert_type: '', notes: '' });
      setShowAdd(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id) => base44.entities.OfficerSafetyAlert.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-alerts', serverId, recordType, recordId] });
      queryClient.invalidateQueries({ queryKey: ['safety-alerts-server', serverId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.OfficerSafetyAlert.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-alerts', serverId, recordType, recordId] });
      queryClient.invalidateQueries({ queryKey: ['safety-alerts-server', serverId] });
      setEditingId(null);
    },
  });

  if (!canView) return null;

  return (
    <div className="mt-3 rounded-xl border border-red-500/15 bg-red-500/[0.03] p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <ShieldAlert size={12} className="text-red-400" />
          <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">Officer Safety Alerts</span>
          <span className="text-red-400/40 text-[10px]">({alerts.length})</span>
        </div>
        {canManage && (
          <button onClick={() => setShowAdd(!showAdd)} className="text-red-400/60 hover:text-red-400 transition-all">
            <Plus size={14} />
          </button>
        )}
      </div>

      {showAdd && canManage && (
        <div className="space-y-2 mb-3 pb-3 border-b border-red-500/10">
          <div>
            <Label className="text-white/40 text-[10px]">Alert Type</Label>
            <Select value={newAlert.alert_type} onValueChange={v => setNewAlert({ ...newAlert, alert_type: v })}>
              <SelectTrigger className="bg-white/[0.04] border-white/10 text-white text-xs mt-1 rounded-lg h-8">
                <SelectValue placeholder="Select alert type..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                {ALERT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/40 text-[10px]">Internal Notes</Label>
            <Textarea
              value={newAlert.notes}
              onChange={e => setNewAlert({ ...newAlert, notes: e.target.value })}
              placeholder="Why does this alert exist?"
              className="bg-white/[0.04] border-white/10 text-white text-xs mt-1 rounded-lg"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => addMutation.mutate()}
              disabled={!newAlert.alert_type}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all disabled:opacity-40"
            >
              Add Alert
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="text-xs px-3 py-1.5 rounded-lg text-white/40 hover:text-white/70"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {alerts.map(a => (
          <div key={a.id} className="flex items-start gap-2 rounded-lg bg-red-500/[0.06] border border-red-500/10 px-2.5 py-2 group">
            <AlertTriangle size={11} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-red-300 text-sm font-medium">{a.alert_type}</div>
              {editingId === a.id ? (
                <div className="mt-1">
                  <Textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    className="bg-white/[0.04] border-white/10 text-white text-xs rounded-lg"
                    rows={2}
                  />
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => updateMutation.mutate({ id: a.id, data: { notes: editNotes } })} className="text-xs text-emerald-400 hover:text-emerald-300">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-white/30 hover:text-white">Cancel</button>
                  </div>
                </div>
              ) : (
                a.notes && <div className="text-red-300/50 text-xs mt-0.5">{a.notes}</div>
              )}
              <div className="text-white/20 text-[9px] mt-0.5">By {a.added_by_name || a.added_by_email?.split('@')[0]}</div>
            </div>
            {canManage && editingId !== a.id && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingId(a.id); setEditNotes(a.notes || ''); }} className="text-white/30 hover:text-white/70"><Edit2 size={10} /></button>
                <button onClick={() => removeMutation.mutate(a.id)} className="text-white/30 hover:text-red-400"><X size={11} /></button>
              </div>
            )}
          </div>
        ))}
        {alerts.length === 0 && !showAdd && (
          <div className="text-white/25 text-xs text-center py-2">No safety alerts on file</div>
        )}
      </div>
    </div>
  );
}