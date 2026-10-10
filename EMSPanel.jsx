import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, Radio, Plus, PowerOff, Power, FileText, Scale, Heart, Upload, X, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import ShiftSummaryReport from '@/components/panels/ShiftSummaryReport';
import PanelHandbook from '@/components/panels/PanelHandbook';
import RadioWidget from '@/components/panels/RadioWidget';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import StatusBadge from '@/components/StatusBadge';
import AssignedCallBanner from '@/components/dispatch/AssignedCallBanner';
import ReportsPanel from '@/components/panels/ReportsPanel';
import PenalCodeManager from '@/components/settings/PenalCodeManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Basic vitals reference card
const VITAL_RANGES = [
  { label: 'Heart Rate', normal: '60–100 bpm', low: '< 60 (bradycardia)', high: '> 100 (tachycardia)' },
  { label: 'Systolic BP', normal: '90–120 mmHg', low: '< 90 (hypotension)', high: '> 140 (hypertension)' },
  { label: 'Diastolic BP', normal: '60–80 mmHg', low: '< 60', high: '> 90' },
  { label: 'SpO2', normal: '95–100%', low: '< 95% (hypoxia)', high: '—' },
  { label: 'Resp Rate', normal: '12–20 /min', low: '< 12 (bradypnea)', high: '> 20 (tachypnea)' },
  { label: 'Temp', normal: '36.1–37.2 °C', low: '< 35 (hypothermia)', high: '> 38 (fever)' },
  { label: 'GCS', normal: '15 (normal)', low: '< 8 (severe', high: '—' },
  { label: 'Blood Glucose', normal: '4–7 mmol/L', low: '< 4 (hypoglycemia)', high: '> 11 (hyperglycemia)' },
];

// PCR (Pre-hospital Care Report) form
function PCRDialog({ open, onClose, myUnit, serverId, user }) {
  const [pcr, setPcr] = useState({
    patient_name: '', age: '', gender: '', chief_complaint: '',
    mechanism: '', vitals_hr: '', vitals_bp: '', vitals_spo2: '',
    vitals_rr: '', vitals_gcs: '', vitals_temp: '', treatment: '',
    medications: '', allergies: '', history: '', outcome: '', narrative: '',
  });
  const queryClient = useQueryClient();

  const submit = useMutation({
    mutationFn: () => base44.entities.IncidentReport.create({
      server_id: serverId,
      report_type: 'ems',
      department_type: 'ems',
      author_email: user?.email,
      author_callsign: myUnit?.callsign,
      status: 'pending',
      title: `PCR — ${pcr.patient_name || 'Unknown Patient'} — ${pcr.chief_complaint || 'EMS Call'}`,
      narrative: `PATIENT: ${pcr.patient_name}, ${pcr.age}y ${pcr.gender}
CHIEF COMPLAINT: ${pcr.chief_complaint}
MECHANISM: ${pcr.mechanism}

VITALS: HR ${pcr.vitals_hr} | BP ${pcr.vitals_bp} | SpO2 ${pcr.vitals_spo2}% | RR ${pcr.vitals_rr} | GCS ${pcr.vitals_gcs} | Temp ${pcr.vitals_temp}

HX/ALLERGIES: ${pcr.history} / ${pcr.allergies}
MEDS: ${pcr.medications}

TREATMENT: ${pcr.treatment}
OUTCOME/DISPOSITION: ${pcr.outcome}

NARRATIVE:
${pcr.narrative}`,
      location: '',
      involved_parties: pcr.patient_name,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident-reports'] });
      onClose();
      setPcr({ patient_name: '', age: '', gender: '', chief_complaint: '', mechanism: '', vitals_hr: '', vitals_bp: '', vitals_spo2: '', vitals_rr: '', vitals_gcs: '', vitals_temp: '', treatment: '', medications: '', allergies: '', history: '', outcome: '', narrative: '' });
    },
  });

  const f = (key, placeholder, label, half = false) => (
    <div className={half ? '' : 'col-span-2'}>
      <Label className="text-white/50 text-[10px] uppercase tracking-wider">{label}</Label>
      <Input value={pcr[key]} onChange={e => setPcr({ ...pcr, [key]: e.target.value })}
        className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder={placeholder} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Heart size={16} className="text-red-400" /> Pre-hospital Care Report (PCR)
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Patient info */}
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 border-b border-white/[0.06] pb-1">Patient Information</p>
            <div className="grid grid-cols-2 gap-2">
              {f('patient_name', 'John Doe', 'Patient Name', true)}
              {f('age', '35', 'Age', true)}
              <div>
                <Label className="text-white/50 text-[10px] uppercase tracking-wider">Gender</Label>
                <Select value={pcr.gender} onValueChange={v => setPcr({ ...pcr, gender: v })}>
                  <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {f('chief_complaint', 'e.g. Chest pain', 'Chief Complaint', true)}
              {f('mechanism', 'e.g. MVC, Fall, Medical', 'Mechanism / Nature', false)}
            </div>
          </div>

          {/* Vitals */}
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 border-b border-white/[0.06] pb-1">Vitals</p>
            <div className="grid grid-cols-3 gap-2">
              {f('vitals_hr', '72', 'HR (bpm)', true)}
              {f('vitals_bp', '120/80', 'BP (mmHg)', true)}
              {f('vitals_spo2', '98', 'SpO2 (%)', true)}
              {f('vitals_rr', '16', 'RR (/min)', true)}
              {f('vitals_gcs', '15', 'GCS', true)}
              {f('vitals_temp', '36.8', 'Temp (°C)', true)}
            </div>
          </div>

          {/* History */}
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 border-b border-white/[0.06] pb-1">History & Medications</p>
            <div className="grid grid-cols-2 gap-2">
              {f('history', 'PMHx: HTN, DM...', 'Past Medical History', true)}
              {f('allergies', 'NKDA / Penicillin...', 'Allergies', true)}
              {f('medications', 'Metoprolol, Insulin...', 'Current Medications', false)}
            </div>
          </div>

          {/* Treatment */}
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 border-b border-white/[0.06] pb-1">Treatment & Outcome</p>
            <div className="grid grid-cols-2 gap-2">
              {f('treatment', 'O2 via NRB, IV access, 12-lead ECG...', 'Treatment Administered', false)}
              {f('outcome', 'Transported to General Hospital', 'Outcome / Disposition', false)}
            </div>
          </div>

          {/* Narrative */}
          <div>
            <Label className="text-white/50 text-[10px] uppercase tracking-wider">Narrative</Label>
            <Textarea value={pcr.narrative} onChange={e => setPcr({ ...pcr, narrative: e.target.value })}
              className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm h-28 resize-none"
              placeholder="Detailed narrative of the call..." />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <CrimsonButton variant="ghost" onClick={onClose}>Cancel</CrimsonButton>
            <CrimsonButton onClick={() => submit.mutate()} disabled={submit.isPending || !pcr.chief_complaint}>
              {submit.isPending ? 'Submitting...' : 'Submit PCR'}
            </CrimsonButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Vital reference card component
function VitalsReference() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] transition-all">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-red-400" />
          <span className="text-white/70 text-sm font-semibold">Vital Signs Reference</span>
        </div>
        {open ? <ChevronUp size={13} className="text-white/30" /> : <ChevronDown size={13} className="text-white/30" />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 gap-1.5">
            {VITAL_RANGES.map(v => (
              <div key={v.label} className="grid grid-cols-4 gap-2 text-[11px] py-1.5 border-b border-white/[0.04] last:border-0">
                <span className="text-white/60 font-medium">{v.label}</span>
                <span className="text-green-400">{v.normal}</span>
                <span className="text-yellow-400">{v.low}</span>
                <span className="text-red-400">{v.high}</span>
              </div>
            ))}
            <div className="grid grid-cols-4 gap-2 text-[10px] mt-1">
              <span className="text-white/30">Parameter</span>
              <span className="text-green-400/50">Normal</span>
              <span className="text-yellow-400/50">Low Alert</span>
              <span className="text-red-400/50">High Alert</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EMSPanel({ server, units, calls, user, myMember, serverId, isAdmin, isOwner }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showPCR, setShowPCR] = useState(false);
  const [newUnit, setNewUnit] = useState({ callsign: '', vehicle: '', department_name: '', rp_name: '' });
  const [uploadingSOP, setUploadingSOP] = useState(false);
  const queryClient = useQueryClient();

  const { data: serverFull } = useQuery({
    queryKey: ['server', serverId],
    queryFn: async () => { const s = await base44.entities.Server.filter({ id: serverId }); return s[0]; },
    enabled: !!serverId,
  });

  const myUnit = units.find(u => u.user_email === user?.email && u.department_type === 'ems');
  const allEMSUnits = units.filter(u => u.department_type === 'ems' && u.status !== '10-42');
  const assignedCall = myUnit?.assigned_call_id ? calls.find(c => c.id === myUnit.assigned_call_id) : null;
  const emsDepts = (server?.departments || []).filter(d => d.type === 'ems');

  const createUnit = useMutation({
    mutationFn: () => base44.entities.Unit.create({
      server_id: serverId, user_email: user.email,
      callsign: newUnit.callsign, department_type: 'ems',
      department_name: newUnit.department_name || emsDepts[0]?.name || 'EMS',
      vehicle: newUnit.vehicle, status: '10-8',
      rp_name: newUnit.rp_name, on_duty_since: new Date().toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-units'] });
      setShowCreate(false);
      setNewUnit({ callsign: '', vehicle: '', department_name: '', rp_name: '' });
    },
  });

  const updateStatus = useMutation({
    mutationFn: (status) => base44.entities.Unit.update(myUnit.id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server-units'] }),
  });

  const goOffDuty = useMutation({
    mutationFn: () => base44.entities.Unit.update(myUnit.id, { status: '10-42' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server-units'] }),
  });

  const handleSOPUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSOP(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Server.update(serverId, { ems_sop_url: file_url });
    queryClient.invalidateQueries({ queryKey: ['server', serverId] });
    setUploadingSOP(false);
  };

  const statuses = ['10-8', '10-7', '10-6', '10-97', '10-11'];
  const myDept = emsDepts.find(d => d.name === myUnit?.department_name) || emsDepts[0];

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/[0.06] bg-[#0d0d0d] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {myDept?.logo_url
            ? <img src={myDept.logo_url} alt={myDept.name} className="w-8 h-8 rounded-lg object-contain bg-black/30 p-0.5" onError={e => { e.target.style.display='none'; }} />
            : <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20"><Activity size={15} className="text-red-400" /></div>}
          <div>
            <h2 className="text-white font-semibold text-sm">EMS</h2>
            {myUnit && <p className="text-white/35 text-[10px]">{myUnit.callsign} · {myUnit.department_name}</p>}
          </div>
          <PanelHandbook panel="fire" />
        </div>
        <div className="flex items-center gap-2">
          {myUnit && myUnit.status !== '10-42' && (
            <CrimsonButton variant="outline" onClick={() => setShowPCR(true)} className="h-9 text-sm">
              <Heart size={14} className="mr-1" /> PCR
            </CrimsonButton>
          )}
          {!myUnit && (
            <CrimsonButton onClick={() => setShowCreate(true)} className="h-9 text-sm">
              <Plus size={14} className="mr-1" /> Go On Duty
            </CrimsonButton>
          )}
          {myUnit && myUnit.status !== '10-42' && (
            <CrimsonButton variant="outline" onClick={() => goOffDuty.mutate()} className="h-9 text-sm">
              <PowerOff size={14} className="mr-1" /> Go Off Duty
            </CrimsonButton>
          )}
          {myUnit && myUnit.status === '10-42' && (
            <CrimsonButton onClick={() => { setNewUnit({ callsign: '', vehicle: '', department_name: emsDepts[0]?.name || '' }); setShowCreate(true); }} className="h-9 text-sm">
              <Power size={14} className="mr-1" /> Go Back On Duty
            </CrimsonButton>
          )}
        </div>
      </div>

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
              <TabsTrigger value="vitals" className="text-white/40 data-[state=active]:text-titanium data-[state=active]:bg-white/10 data-[state=active]:border data-[state=active]:border-white/20 rounded-lg text-xs font-semibold px-3 py-1.5">
                <Activity size={12} className="mr-1.5" /> Vitals
              </TabsTrigger>
              <TabsTrigger value="reports" className="text-white/40 data-[state=active]:text-titanium data-[state=active]:bg-white/10 data-[state=active]:border data-[state=active]:border-white/20 rounded-lg text-xs font-semibold px-3 py-1.5">
                <FileText size={12} className="mr-1.5" /> Reports
              </TabsTrigger>
              <TabsTrigger value="radio" className="text-white/40 data-[state=active]:text-titanium data-[state=active]:bg-white/10 data-[state=active]:border data-[state=active]:border-white/20 rounded-lg text-xs font-semibold px-3 py-1.5">
                <Radio size={12} className="mr-1.5" /> Radio
              </TabsTrigger>
              <TabsTrigger value="sop" className="text-white/40 data-[state=active]:text-titanium data-[state=active]:bg-white/10 data-[state=active]:border data-[state=active]:border-white/20 rounded-lg text-xs font-semibold px-3 py-1.5">
                <Upload size={12} className="mr-1.5" /> SOP
              </TabsTrigger>
              <TabsTrigger value="shift" className="text-white/40 data-[state=active]:text-titanium data-[state=active]:bg-white/10 data-[state=active]:border data-[state=active]:border-white/20 rounded-lg text-xs font-semibold px-3 py-1.5">
                <ClipboardList size={12} className="mr-1.5" /> Shift
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Units tab */}
          <TabsContent value="units" className="px-6 pb-6 pt-4">
            {myUnit && myUnit.status !== '10-42' && (
              <GlassCard className="mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                      <Activity size={15} className="text-red-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{myUnit.callsign}</span>
                        <StatusBadge status={myUnit.status} />
                      </div>
                      <span className="text-white/30 text-xs">{myUnit.department_name} • {myUnit.vehicle}</span>
                    </div>
                  </div>
                  <Select value={myUnit.status} onValueChange={v => updateStatus.mutate(v)}>
                    <SelectTrigger className="w-32 bg-white/[0.05] border-white/10 text-white text-sm rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                      {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </GlassCard>
            )}
            <p className="text-white/30 text-xs mb-3">{allEMSUnits.length} active EMS unit{allEMSUnits.length !== 1 ? 's' : ''} on duty</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allEMSUnits.map(unit => {
                const deptMeta = emsDepts.find(d => d.name === unit.department_name);
                return (
                  <div key={unit.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 p-3 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/[0.07]">
                      {deptMeta?.logo_url
                        ? <img src={deptMeta.logo_url} alt="" className="w-full h-full object-contain p-0.5" onError={e => { e.target.style.display='none'; }} />
                        : <Activity size={14} className="text-red-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold">{unit.callsign}</p>
                      <p className="text-white/35 text-[10px] truncate">{unit.department_name}</p>
                    </div>
                    <StatusBadge status={unit.status} />
                  </div>
                );
              })}
              {allEMSUnits.length === 0 && (
                <div className="col-span-2 text-center py-12 text-white/20 border border-dashed border-white/[0.06] rounded-xl">
                  <Activity size={24} className="mx-auto mb-2 opacity-30" />
                  No active EMS units
                </div>
              )}
            </div>
          </TabsContent>

          {/* Vitals tab */}
          <TabsContent value="vitals" className="px-6 pb-6 pt-4 space-y-4">
            <VitalsReference />
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-2">
              <p className="text-white/60 text-sm font-semibold flex items-center gap-2"><Heart size={13} className="text-red-400" /> Quick PCR</p>
              <p className="text-white/30 text-xs">Fill out a full Pre-hospital Care Report for your current call.</p>
              <CrimsonButton onClick={() => setShowPCR(true)} className="h-9 text-sm mt-2" disabled={!myUnit || myUnit.status === '10-42'}>
                <Heart size={14} className="mr-1.5" /> Open PCR Form
              </CrimsonButton>
            </div>
          </TabsContent>

          {/* Reports tab */}
          <TabsContent value="reports" className="flex-1 overflow-y-auto">
            <ReportsPanel serverId={serverId} user={user} myUnit={myUnit} isSupervisor={false} departmentType="ems" />
          </TabsContent>

          {/* Radio tab */}
          <TabsContent value="radio" className="px-6 pb-6 pt-4">
            <RadioWidget serverId={serverId} user={user} myMember={myMember} isOwner={isOwner} isAdmin={isAdmin} />
          </TabsContent>

          {/* Shift Summary tab */}
          <TabsContent value="shift">
            <ShiftSummaryReport serverId={serverId} user={user} myUnit={myUnit} departmentType="ems" />
          </TabsContent>

          {/* SOP tab */}
          <TabsContent value="sop" className="px-6 pb-6 pt-4 space-y-4">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              <p className="text-white/70 text-sm font-semibold mb-1">Scope of Practice / SOP Document</p>
              <p className="text-white/30 text-xs mb-4">Server owners can upload a PDF or document defining the EMS scope of practice for this server.</p>
              {serverFull?.ems_sop_url ? (
                <div className="space-y-3">
                  <a href={serverFull.ems_sop_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-crimson hover:underline">
                    <FileText size={14} /> View Scope of Practice Document
                  </a>
                  {isOwner && (
                    <label className="flex items-center gap-2 cursor-pointer text-white/40 text-xs hover:text-white/60 transition-all">
                      <Upload size={12} /> Replace document
                      <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleSOPUpload} disabled={uploadingSOP} />
                    </label>
                  )}
                </div>
              ) : (
                <div>
                  {isOwner ? (
                    <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/20 cursor-pointer hover:border-crimson/40 hover:bg-crimson/5 transition-all text-white/40 text-sm ${uploadingSOP ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Upload size={16} />
                      {uploadingSOP ? 'Uploading...' : 'Upload SOP / Scope of Practice (PDF, DOC)'}
                      <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleSOPUpload} disabled={uploadingSOP} />
                    </label>
                  ) : (
                    <p className="text-white/20 text-sm">No SOP uploaded. Contact your server owner.</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Go On Duty Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white">
          <DialogHeader><DialogTitle className="text-white">Go On Duty — EMS</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-white/60 text-xs">Roleplay Name</Label>
              <Input value={newUnit.rp_name} onChange={e => setNewUnit({ ...newUnit, rp_name: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="e.g. Jane Smith" />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Callsign</Label>
              <Input value={newUnit.callsign} onChange={e => setNewUnit({ ...newUnit, callsign: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="e.g. Medic-1" />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Vehicle/Unit</Label>
              <Input value={newUnit.vehicle} onChange={e => setNewUnit({ ...newUnit, vehicle: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="e.g. Ambulance 42" />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Agency</Label>
              {emsDepts.length > 0 ? (
                <Select value={newUnit.department_name} onValueChange={v => setNewUnit({ ...newUnit, department_name: v })}>
                  <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"><SelectValue placeholder="Select agency" /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    {emsDepts.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-white/30 text-xs mt-1 p-2 rounded-lg bg-white/[0.03] border border-white/10">No EMS agencies configured.</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <CrimsonButton variant="ghost" onClick={() => setShowCreate(false)}>Cancel</CrimsonButton>
              <CrimsonButton onClick={() => createUnit.mutate()} disabled={!newUnit.callsign}>Go On Duty</CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PCR Dialog */}
      <PCRDialog open={showPCR} onClose={() => setShowPCR(false)} myUnit={myUnit} serverId={serverId} user={user} />
    </div>
  );
}