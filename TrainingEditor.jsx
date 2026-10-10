import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, BookOpen, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import ReactMarkdown from 'react-markdown';

const DEPT_OPTIONS = [
  { value: 'police', label: 'Law Enforcement', color: 'text-blue-400' },
  { value: 'fire', label: 'Fire & Rescue', color: 'text-orange-400' },
  { value: 'dispatch', label: 'Dispatch', color: 'text-emerald-400' },
  { value: 'ems', label: 'EMS', color: 'text-red-400' },
];

function ModuleCard({ module, onEdit, onDelete }) {
  const [preview, setPreview] = useState(false);
  const dept = DEPT_OPTIONS.find(d => d.value === module.department_type);
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0">
            <BookOpen size={13} className={dept?.color || 'text-white/40'} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm">{module.title}</span>
              <span className={`text-[9px] font-semibold ${dept?.color || 'text-white/30'}`}>Tier {module.tier_level}</span>
              {!module.is_active && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white/30">Inactive</span>}
            </div>
            <div className="text-white/30 text-xs">{dept?.label}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setPreview(!preview)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all">
            {preview ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button onClick={() => onEdit(module)} className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all text-xs px-2">Edit</button>
          <button onClick={() => onDelete(module.id)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {preview && module.content_markdown && (
        <div className="px-4 pb-4 border-t border-white/[0.06]">
          <div className="mt-3 p-4 rounded-xl bg-white/[0.03] text-sm text-white/60 prose prose-sm prose-invert max-w-none max-h-48 overflow-y-auto">
            <ReactMarkdown>{module.content_markdown}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainingEditor({ serverId }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: '', department_type: 'police', tier_level: 1, content_markdown: '', passing_score: 80, is_active: true,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['custom-training', serverId],
    queryFn: () => base44.entities.CustomTraining.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const saveMutation = useMutation({
    mutationFn: () => editing
      ? base44.entities.CustomTraining.update(editing.id, { ...form, server_id: serverId })
      : base44.entities.CustomTraining.create({ ...form, server_id: serverId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-training', serverId] });
      setShowCreate(false);
      setEditing(null);
      setForm({ title: '', department_type: 'police', tier_level: 1, content_markdown: '', passing_score: 80, is_active: true });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomTraining.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom-training', serverId] }),
  });

  const openEdit = (module) => {
    setEditing(module);
    setForm({
      title: module.title, department_type: module.department_type,
      tier_level: module.tier_level, content_markdown: module.content_markdown || '',
      passing_score: module.passing_score || 80, is_active: module.is_active ?? true,
    });
    setShowCreate(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', department_type: 'police', tier_level: 1, content_markdown: '', passing_score: 80, is_active: true });
    setShowCreate(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <GraduationCap size={16} className="text-white/60" />
          <h3 className="text-white font-semibold">Custom Training Modules</h3>
          <span className="text-xs text-white/30 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/[0.06]">{modules.length}</span>
        </div>
        <CrimsonButton onClick={openCreate} className="h-8 text-xs px-3">
          <Plus size={13} className="mr-1" /> New Module
        </CrimsonButton>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-10 text-white/25 border border-dashed border-white/[0.08] rounded-xl text-sm">
          No custom training modules yet. Create one to supplement the default curriculum.
        </div>
      ) : (
        <div className="space-y-2">
          {modules.map(m => (
            <ModuleCard key={m.id} module={m} onEdit={openEdit} onDelete={(id) => deleteMutation.mutate(id)} />
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditing(null); } }}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editing ? 'Edit Training Module' : 'New Training Module'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label className="text-white/60 text-xs">Module Title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Advanced Pursuit Tactics" className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" />
              </div>
              <div>
                <Label className="text-white/60 text-xs">Tier Level</Label>
                <Input type="number" min={1} max={10} value={form.tier_level} onChange={e => setForm({ ...form, tier_level: parseInt(e.target.value) || 1 })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/60 text-xs">Department</Label>
                <Select value={form.department_type} onValueChange={v => setForm({ ...form, department_type: v })}>
                  <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    {DEPT_OPTIONS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/60 text-xs">Passing Score (%)</Label>
                <Input type="number" min={50} max={100} value={form.passing_score} onChange={e => setForm({ ...form, passing_score: parseInt(e.target.value) || 80 })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-white/60 text-xs flex items-center gap-1.5 mb-1">
                Training Content <span className="text-white/25">(Markdown supported)</span>
              </Label>
              <Textarea
                value={form.content_markdown}
                onChange={e => setForm({ ...form, content_markdown: e.target.value })}
                placeholder={"# Module Title\n\n## Overview\nDescribe the training content here...\n\n## Key Points\n- Point 1\n- Point 2\n\n## Procedures\n1. Step one\n2. Step two"}
                className="bg-white/[0.05] border-white/10 text-white rounded-xl text-sm font-mono"
                rows={12}
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
              <Label htmlFor="is_active" className="text-white/60 text-xs cursor-pointer">Active (visible to members)</Label>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <CrimsonButton variant="ghost" onClick={() => { setShowCreate(false); setEditing(null); }}>Cancel</CrimsonButton>
              <CrimsonButton onClick={() => saveMutation.mutate()} disabled={!form.title || !form.content_markdown || saveMutation.isPending}>
                <Save size={13} className="mr-1" /> {editing ? 'Update' : 'Create'} Module
              </CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}