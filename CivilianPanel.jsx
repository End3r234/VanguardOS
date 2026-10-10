import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, User, Car, FileText, Trash2 } from 'lucide-react';
import PanelHandbook from '@/components/panels/PanelHandbook';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';

export default function CivilianPanel({ server, user, serverId }) {
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ plate: '', state: '', make: '', model: '', color: '', year: '', status: 'Valid' });
  const [form, setForm] = useState({
    name: '', dob: '', address: '', gender: 'Male', occupation: '', phone: '',
    height: '', weight: '', eye_color: '', hair_color: '', ethnicity: '',
    drivers_license: '', dl_status: 'Valid', insurance: '', emergency_contact: '', nationality: 'US Citizen',
  });
  const queryClient = useQueryClient();

  const { data: characters = [] } = useQuery({
    queryKey: ['civilians', serverId, user?.email],
    queryFn: () => base44.entities.Civilian.filter({ server_id: serverId, user_email: user?.email }),
    enabled: !!user?.email && !!serverId,
  });

  const allChars = characters;
  const currentChar = selected ? allChars.find(c => c.id === selected?.id || c.id === selected) || selected : null;

  const createMutation = useMutation({
    mutationFn: () => base44.entities.Civilian.create({ ...form, server_id: serverId, user_email: user?.email }),
    onSuccess: (newChar) => {
      queryClient.invalidateQueries({ queryKey: ['civilians', serverId, user?.email] });
      setSelected(newChar);
      setShowCreate(false);
      setForm({ name: '', dob: '', address: '', gender: 'Male', occupation: '', phone: '', height: '', weight: '', eye_color: '', hair_color: '', ethnicity: '', drivers_license: '', dl_status: 'Valid', insurance: '', emergency_contact: '', nationality: 'US Citizen' });
    },
  });

  const handleCreate = () => {
    if (!form.name) return;
    createMutation.mutate();
  };

  const addVehicleMutation = useMutation({
    mutationFn: async () => {
      const current = currentChar?.license_plates || [];
      return base44.entities.Civilian.update(currentChar.id, { license_plates: [...current, vehicleForm] });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['civilians', serverId, user?.email] });
      setSelected(updated);
      setShowAddVehicle(false);
      setVehicleForm({ plate: '', state: '', make: '', model: '', color: '', year: '', status: 'Valid' });
    },
  });

  const removeVehicleMutation = useMutation({
    mutationFn: async (idx) => {
      const current = [...(currentChar?.license_plates || [])];
      current.splice(idx, 1);
      return base44.entities.Civilian.update(currentChar.id, { license_plates: current });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['civilians', serverId, user?.email] });
      setSelected(updated);
    },
  });

  return (
    <div className="flex h-[calc(100vh-3rem)]">
      {/* Sidebar */}
      <div className="w-56 border-r border-white/[0.06] bg-black/30 flex flex-col">
        <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs font-medium uppercase tracking-wider">My Characters</span>
            <PanelHandbook panel="civilian" />
          </div>
          <button onClick={() => setShowCreate(true)} className="p-1 hover:bg-white/10 rounded-lg transition-colors ml-auto">
            <Plus size={14} className="text-white/50 hover:text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {allChars.map(c => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                (selected?.id || selected) === c.id ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                <User size={13} className="text-teal-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{c.name}</div>
                <div className="text-[10px] text-white/30 truncate">{c.occupation}</div>
              </div>
            </button>
          ))}
          {allChars.length === 0 && (
            <div className="text-center py-8 text-white/20 text-xs">No characters yet</div>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentChar ? (
          <>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                  <User size={24} className="text-white/30" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">{currentChar.name}</h2>
                  <p className="text-white/40 text-sm">DOB: {currentChar.dob} &nbsp;•&nbsp; {currentChar.address}</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="info">
              <TabsList className="bg-white/[0.04] border border-white/[0.08] rounded-xl mb-5 p-1 h-auto">
                <TabsTrigger value="info" className="text-white/40 data-[state=active]:text-titanium data-[state=active]:bg-white/10 data-[state=active]:border data-[state=active]:border-white/20 rounded-lg text-xs font-semibold px-3 py-1.5">Info</TabsTrigger>
                <TabsTrigger value="vehicles" className="text-white/40 data-[state=active]:text-titanium data-[state=active]:bg-white/10 data-[state=active]:border data-[state=active]:border-white/20 rounded-lg text-xs font-semibold px-3 py-1.5">Vehicles</TabsTrigger>
                <TabsTrigger value="licenses" className="text-white/40 data-[state=active]:text-titanium data-[state=active]:bg-white/10 data-[state=active]:border data-[state=active]:border-white/20 rounded-lg text-xs font-semibold px-3 py-1.5">Licenses</TabsTrigger>
              </TabsList>

              <TabsContent value="info">
                <GlassCard>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Gender', value: currentChar.gender },
                      { label: 'Nationality', value: currentChar.nationality },
                      { label: 'Phone', value: currentChar.phone },
                      { label: 'Occupation', value: currentChar.occupation },
                      { label: 'Address', value: currentChar.address },
                      { label: 'Height', value: currentChar.height },
                      { label: 'Weight', value: currentChar.weight },
                      { label: 'Eye Color', value: currentChar.eye_color },
                      { label: 'Hair Color', value: currentChar.hair_color },
                      { label: 'Ethnicity', value: currentChar.ethnicity },
                      { label: "Driver's License", value: currentChar.drivers_license },
                      { label: 'DL Status', value: currentChar.dl_status },
                      { label: 'Insurance', value: currentChar.insurance },
                      { label: 'Emergency Contact', value: currentChar.emergency_contact },
                    ].map(({ label, value }) => (
                      <div key={label} className="border border-white/[0.06] rounded-xl p-4">
                        <div className="text-white/40 text-xs mb-1">{label}</div>
                        <div className="text-white font-medium">{value || '—'}</div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </TabsContent>
              <TabsContent value="vehicles">
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <CrimsonButton onClick={() => setShowAddVehicle(true)} className="h-8 px-3 text-xs">
                      <Plus size={13} className="mr-1" /> Register Vehicle
                    </CrimsonButton>
                  </div>
                  {(currentChar?.license_plates || []).length === 0 ? (
                    <GlassCard className="text-center py-12 text-white/30">
                      <Car size={28} className="mx-auto mb-2" />
                      No vehicles registered
                    </GlassCard>
                  ) : (
                    (currentChar?.license_plates || []).map((v, i) => (
                      <GlassCard key={i} className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                            <Car size={18} className="text-white/40" />
                          </div>
                          <div>
                            <div className="text-white font-bold text-sm">{v.year} {v.make} {v.model}</div>
                            <div className="text-white/50 text-xs mt-0.5">{v.color} — {v.plate} ({v.state})</div>
                            <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              v.status === 'Valid' ? 'bg-emerald-500/20 text-emerald-400' :
                              v.status === 'Stolen' ? 'bg-red-500/20 text-red-400' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>{v.status}</span>
                          </div>
                        </div>
                        <button onClick={() => removeVehicleMutation.mutate(i)} className="p-1.5 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                          <Trash2 size={13} />
                        </button>
                      </GlassCard>
                    ))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="licenses">
                <GlassCard className="text-center py-12 text-white/30">
                  <FileText size={28} className="mx-auto mb-2" />
                  No licenses registered
                </GlassCard>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <User size={40} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/40 mb-4">Select a character or create one</p>
              <CrimsonButton onClick={() => setShowCreate(true)}><Plus size={14} className="mr-1" /> New Character</CrimsonButton>
            </div>
          </div>
        )}
      </div>

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white">
          <DialogHeader><DialogTitle className="text-white">Register Vehicle</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-white/60 text-xs">License Plate *</Label><Input value={vehicleForm.plate} onChange={e => setVehicleForm({ ...vehicleForm, plate: e.target.value })} placeholder="ABC-1234" className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">State / Region</Label><Input value={vehicleForm.state} onChange={e => setVehicleForm({ ...vehicleForm, state: e.target.value })} placeholder="e.g. CA" className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">Make</Label><Input value={vehicleForm.make} onChange={e => setVehicleForm({ ...vehicleForm, make: e.target.value })} placeholder="e.g. Toyota" className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">Model</Label><Input value={vehicleForm.model} onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })} placeholder="e.g. Camry" className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">Color</Label><Input value={vehicleForm.color} onChange={e => setVehicleForm({ ...vehicleForm, color: e.target.value })} placeholder="e.g. Black" className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">Year</Label><Input value={vehicleForm.year} onChange={e => setVehicleForm({ ...vehicleForm, year: e.target.value })} placeholder="e.g. 2021" className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div className="col-span-2"><Label className="text-white/60 text-xs">Registration Status</Label>
                <Select value={vehicleForm.status} onValueChange={v => setVehicleForm({ ...vehicleForm, status: v })}>
                  <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectItem value="Valid">Valid</SelectItem>
                    <SelectItem value="Stolen">Stolen</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <CrimsonButton variant="ghost" onClick={() => setShowAddVehicle(false)}>Cancel</CrimsonButton>
              <CrimsonButton onClick={() => addVehicleMutation.mutate()} disabled={!vehicleForm.plate || addVehicleMutation.isPending}>Register</CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white">
          <DialogHeader><DialogTitle className="text-white">New Character</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2 max-h-[70vh] overflow-y-auto pr-1">
            <p className="text-white/30 text-xs">Personal Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-white/60 text-xs">Full Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">Date of Birth</Label><Input value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} placeholder="YYYY-MM-DD" className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">Gender</Label>
                <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                  <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white"><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Non-Binary">Non-Binary</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-white/60 text-xs">Nationality</Label>
                <Select value={form.nationality} onValueChange={v => setForm({ ...form, nationality: v })}>
                  <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white"><SelectItem value="US Citizen">US Citizen</SelectItem><SelectItem value="Permanent Resident">Permanent Resident</SelectItem><SelectItem value="Visitor">Visitor</SelectItem><SelectItem value="Unknown">Unknown</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-white/60 text-xs">Phone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(555) 000-0000" className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">Occupation</Label><Input value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div className="col-span-2"><Label className="text-white/60 text-xs">Home Address</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
            </div>
            <p className="text-white/30 text-xs pt-1">Physical Description</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-white/60 text-xs">Height</Label><Input value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} placeholder='e.g. 5&apos;10"' className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">Weight</Label><Input value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 180 lbs" className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">Eye Color</Label><Input value={form.eye_color} onChange={e => setForm({ ...form, eye_color: e.target.value })} placeholder="Brown, Blue…" className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">Hair Color</Label><Input value={form.hair_color} onChange={e => setForm({ ...form, hair_color: e.target.value })} placeholder="Black, Blonde…" className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">Ethnicity</Label><Input value={form.ethnicity} onChange={e => setForm({ ...form, ethnicity: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
            </div>
            <p className="text-white/30 text-xs pt-1">Licensing</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-white/60 text-xs">Driver's License #</Label><Input value={form.drivers_license} onChange={e => setForm({ ...form, drivers_license: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">DL Status</Label>
                <Select value={form.dl_status} onValueChange={v => setForm({ ...form, dl_status: v })}>
                  <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white"><SelectItem value="Valid">Valid</SelectItem><SelectItem value="Suspended">Suspended</SelectItem><SelectItem value="Revoked">Revoked</SelectItem><SelectItem value="Expired">Expired</SelectItem><SelectItem value="None">None</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-white/60 text-xs">Insurance</Label><Input value={form.insurance} onChange={e => setForm({ ...form, insurance: e.target.value })} placeholder="Carrier / Policy #" className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
              <div><Label className="text-white/60 text-xs">Emergency Contact</Label><Input value={form.emergency_contact} onChange={e => setForm({ ...form, emergency_contact: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <CrimsonButton variant="ghost" onClick={() => setShowCreate(false)}>Cancel</CrimsonButton>
              <CrimsonButton onClick={handleCreate} disabled={!form.name}>Create</CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}