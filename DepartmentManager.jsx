import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Shield, Flame, Radio, Pencil, Camera, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CrimsonButton from '@/components/CrimsonButton';

const DEPT_TYPES = [
  { value: 'police', label: 'LEO (Police)', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { value: 'fire', label: 'Fire Rescue', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  { value: 'ems', label: 'EMS / Medical', icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { value: 'dispatch', label: 'Dispatch', icon: Radio, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
];

const TYPE_META = Object.fromEntries(DEPT_TYPES.map(d => [d.value, d]));
const BLANK = { name: '', type: 'police', short_name: '', logo_url: '' };

export default function DepartmentManager({ serverId }) {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [uploading, setUploading] = useState(false);

  const { data: serverData } = useQuery({
    queryKey: ['server', serverId],
    queryFn: async () => { const s = await base44.entities.Server.filter({ id: serverId }); return s[0]; },
    enabled: !!serverId,
  });

  const departments = serverData?.departments || [];

  const saveMutation = useMutation({
    mutationFn: (depts) => base44.entities.Server.update(serverId, { departments: depts }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['server', serverId] });
      setDialog(null);
    },
  });

  const openAdd = () => { setForm(BLANK); setDialog({ mode: 'add' }); };
  const openEdit = (idx) => { setForm({ ...BLANK, ...departments[idx] }); setDialog({ mode: 'edit', idx }); };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, logo_url: file_url }));
    setUploading(false);
  };

  const handleSave = () => {
    if (!form.name) return;
    let updated;
    if (dialog.mode === 'add') {
      updated = [...departments, { ...form }];
    } else {
      updated = departments.map((d, i) => i === dialog.idx ? { ...form } : d);
    }
    saveMutation.mutate(updated);
  };

  const removeDept = (idx) => {
    saveMutation.mutate(departments.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-white/40 text-sm">Define departments in your server. Each maps to a type: LEO, Fire, EMS, or Dispatch.</p>
        <CrimsonButton onClick={openAdd} className="h-8 px-3 text-xs">
          <Plus size={13} className="mr-1" /> Add Department
        </CrimsonButton>
      </div>

      <div className="space-y-2">
        {departments.map((dept, idx) => {
          const meta = TYPE_META[dept.type] || TYPE_META.police;
          const Icon = meta.icon;
          return (
            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${meta.bg}`}>
              <div className="flex items-center gap-3">
                {dept.logo_url ? (
                  <img src={dept.logo_url} alt={dept.name} className="w-9 h-9 rounded-lg object-contain bg-black/30 p-0.5 border border-white/10"
                    onError={e => { e.target.style.display='none'; }} />
                ) : (
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${meta.bg}`}>
                    <Icon size={16} className={meta.color} />
                  </div>
                )}
                <div>
                  <span className="text-white font-medium text-sm">{dept.name}</span>
                  {dept.short_name && <span className="text-white/30 text-xs ml-2">[{dept.short_name}]</span>}
                  <div className={`text-[10px] uppercase font-semibold tracking-wide ${meta.color}`}>{meta.label}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(idx)} className="text-white/20 hover:text-white/70 transition-colors p-1.5 rounded hover:bg-white/10">
                  <Pencil size={12} />
                </button>
                <button onClick={() => removeDept(idx)} className="text-white/20 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-500/10">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
        {departments.length === 0 && (
          <div className="text-center py-8 text-white/20 text-sm border border-dashed border-white/10 rounded-xl">
            No departments yet. Add one to get started.
          </div>
        )}
      </div>

      <Dialog open={!!dialog} onOpenChange={open => !open && setDialog(null)}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-white font-semibold">
              {dialog?.mode === 'edit' ? 'Edit Department' : 'Add Department'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-white/60 text-xs">Classification</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {DEPT_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/60 text-xs">Department Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="e.g. Blaine County Sheriff's Office" />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Short Name / Tag</Label>
              <Input value={form.short_name} onChange={e => setForm(f => ({ ...f, short_name: e.target.value }))} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="e.g. BCSO" />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Department Logo</Label>
              <div className="mt-2 flex items-center gap-3">
                {form.logo_url ? (
                  <div className="relative">
                    <img src={form.logo_url} alt="Logo" className="w-14 h-14 rounded-xl object-contain bg-black/40 border border-white/10 p-1" />
                    <button
                      onClick={() => setForm(f => ({ ...f, logo_url: '' }))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 text-white text-[10px] flex items-center justify-center hover:bg-red-500"
                    >×</button>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white/[0.04] border border-dashed border-white/20 flex items-center justify-center">
                    <Camera size={16} className="text-white/20" />
                  </div>
                )}
                <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-sm transition-all">
                  <Upload size={13} />
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                </label>
                <p className="text-white/25 text-xs">PNG with transparent<br />background works best</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <CrimsonButton variant="ghost" onClick={() => setDialog(null)}>Cancel</CrimsonButton>
              <CrimsonButton onClick={handleSave} disabled={!form.name || saveMutation.isPending}>
                {dialog?.mode === 'edit' ? 'Save Changes' : 'Add Department'}
              </CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}