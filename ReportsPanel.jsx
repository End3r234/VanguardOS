import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileText, CheckCircle, XCircle, Clock, Send, ChevronDown, ChevronUp, Link2, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import { getSmartSections } from '@/lib/smartReportSections';
import { format } from 'date-fns';

const STATUS_STYLES = {
  pending: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  approved: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  draft: { label: 'Draft', color: 'text-white/40', bg: 'bg-white/[0.06] border-white/10' },
};

const REPORT_TYPES = [
  { value: 'arrest', label: 'Arrest Report' },
  { value: 'use_of_force', label: 'Use of Force' },
  { value: 'traffic_stop', label: 'Traffic Stop' },
  { value: 'incident', label: 'Incident Report' },
  { value: 'fire', label: 'Fire Report' },
  { value: 'ems', label: 'EMS Report' },
  { value: 'supplement', label: 'Supplement Report' },
];

function ReportCard({ report, isSupervisor, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS_STYLES[report.status] || STATUS_STYLES.pending;
  const sections = report.extra_data ? getSmartSections(report.report_type) : null;
  const hasExtraData = report.extra_data && Object.keys(report.extra_data).length > 0;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.03]" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3 min-w-0">
          <FileText size={14} className="text-white/40 flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">{report.title || REPORT_TYPES.find(t => t.value === report.report_type)?.label || 'Report'}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${s.bg} ${s.color}`}>{s.label}</span>
              {report.incident_id && (
                <span className="text-[9px] font-mono-cad text-crimson/60">{report.incident_id}</span>
              )}
            </div>
            <div className="text-white/30 text-xs">{report.author_callsign || report.author_email?.split('@')[0]} • {report.location}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-white/20 text-[10px]">{new Date(report.created_date).toLocaleDateString()}</span>
          {expanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/[0.06]">
          <div className="mt-3 space-y-3">
            {/* Inherited call data */}
            {report.call_title && (
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <Link2 size={11} className="text-crimson/50" />
                <span className="text-white/40">Linked:</span>
                <span className="text-white/70 font-medium">{report.call_title}</span>
                {report.responding_units && (
                  <span className="text-white/30">— Units: {report.responding_units}</span>
                )}
                {report.primary_department && (
                  <span className="text-white/30">— Dept: {report.primary_department}</span>
                )}
              </div>
            )}
            {report.dispatch_notes && (
              <div>
                <div className="text-white/40 text-xs mb-1">Dispatch Notes</div>
                <p className="text-white/50 text-sm bg-white/[0.02] rounded-lg p-2 text-xs italic">{report.dispatch_notes}</p>
              </div>
            )}

            {report.narrative && (
              <div>
                <div className="text-white/40 text-xs mb-1">Narrative</div>
                <p className="text-white/70 text-sm leading-relaxed bg-white/[0.03] rounded-lg p-3">{report.narrative}</p>
              </div>
            )}
            {report.involved_parties && (
              <div>
                <div className="text-white/40 text-xs mb-1">Involved Parties</div>
                <p className="text-white/70 text-sm">{report.involved_parties}</p>
              </div>
            )}

            {/* Smart report builder extra data */}
            {hasExtraData && sections && sections.map(section => (
              <div key={section.key}>
                <div className="text-white/40 text-xs mb-1">{section.label}</div>
                <div className="grid grid-cols-2 gap-2">
                  {section.fields.map(f => {
                    const val = report.extra_data[f.key];
                    if (!val) return null;
                    return (
                      <div key={f.key} className="bg-white/[0.02] rounded-lg p-2">
                        <span className="text-white/30 text-[10px] uppercase tracking-wider">{f.label}</span>
                        <p className="text-white/70 text-sm">{val}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {report.supervisor_notes && (
              <div>
                <div className="text-white/40 text-xs mb-1">Supervisor Notes</div>
                <p className="text-amber-300/70 text-sm italic">{report.supervisor_notes}</p>
              </div>
            )}
            {isSupervisor && report.status === 'pending' && (
              <div className="flex gap-2 pt-1">
                <CrimsonButton onClick={() => onApprove(report)} className="h-8 text-xs px-3">
                  <CheckCircle size={12} className="mr-1" /> Approve
                </CrimsonButton>
                <CrimsonButton variant="outline" onClick={() => onReject(report)} className="h-8 text-xs px-3">
                  <XCircle size={12} className="mr-1" /> Reject
                </CrimsonButton>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPanel({ serverId, user, myUnit, isSupervisor, departmentType }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showLinkedCalls, setShowLinkedCalls] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState({
    report_type: 'incident', title: '', location: '', narrative: '', involved_parties: '',
  });
  const [extraData, setExtraData] = useState({});
  const [linkedCall, setLinkedCall] = useState(null);

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', serverId],
    queryFn: () => base44.entities.IncidentReport.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const { data: server } = useQuery({
    queryKey: ['server', serverId],
    queryFn: () => base44.entities.Server.get(serverId),
    enabled: !!serverId,
  });

  const { data: calls = [] } = useQuery({
    queryKey: ['server-calls', serverId],
    queryFn: () => base44.entities.Call.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const { data: units = [] } = useQuery({
    queryKey: ['server-units', serverId],
    queryFn: () => base44.entities.Unit.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const smartBuilderEnabled = server?.smart_report_builder ?? false;
  const smartSections = smartBuilderEnabled ? getSmartSections(form.report_type) : null;

  const myReports = isSupervisor ? reports : reports.filter(r => r.author_email === user?.email);
  const filtered = filterStatus === 'all' ? myReports : myReports.filter(r => r.status === filterStatus);

  const myClosedCalls = myUnit
    ? calls.filter(c => c.status === 'closed' && (c.assigned_units || []).includes(myUnit.id))
        .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
    : [];

  const createMutation = useMutation({
    mutationFn: () => base44.entities.IncidentReport.create({
      ...form,
      server_id: serverId,
      author_email: user?.email,
      author_callsign: myUnit?.callsign || '',
      department_type: departmentType,
      status: 'pending',
      report_number: 'RPT-' + Date.now().toString().slice(-6),
      incident_id: linkedCall?.incident_id || '',
      call_id: linkedCall?.id || '',
      call_title: linkedCall?.type || '',
      dispatch_notes: (linkedCall?.notes || []).map(n => n.text).join(' | ') || '',
      responding_units: (linkedCall?.assigned_units || []).map(uid => {
        const u = units.find(uu => uu.id === uid);
        return u?.callsign || '';
      }).filter(Boolean).join(', ') || '',
      primary_department: linkedCall?.department_type || '',
      call_created_at: linkedCall?.created_date || '',
      location: linkedCall?.location || form.location,
      extra_data: smartBuilderEnabled && Object.keys(extraData).length > 0 ? extraData : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', serverId] });
      setShowCreate(false);
      setForm({ report_type: 'incident', title: '', location: '', narrative: '', involved_parties: '' });
      setExtraData({});
      setLinkedCall(null);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (report) => base44.entities.IncidentReport.update(report.id, { status: 'approved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports', serverId] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (report) => base44.entities.IncidentReport.update(report.id, { status: 'rejected' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports', serverId] }),
  });

  const handleCreateFromCall = (call) => {
    setLinkedCall(call);
    setShowLinkedCalls(false);
    setForm(f => ({
      ...f,
      title: call.type || '',
      location: call.location || '',
    }));
    setShowCreate(true);
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-white/60" />
          <h2 className="text-white font-bold text-lg">Incident Reports</h2>
          {isSupervisor && pendingCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">{pendingCount} pending</span>
          )}
          {smartBuilderEnabled && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-crimson/10 text-crimson border border-crimson/20 font-semibold flex items-center gap-1">
              <Zap size={9} /> Smart Builder
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {myUnit && myClosedCalls.length > 0 && (
            <CrimsonButton variant="outline" onClick={() => setShowLinkedCalls(true)} className="h-9 text-sm">
              <Link2 size={14} className="mr-1" /> From Call
              <span className="ml-1 text-[10px] bg-crimson/20 px-1.5 py-0.5 rounded">{myClosedCalls.length}</span>
            </CrimsonButton>
          )}
          <CrimsonButton onClick={() => { setLinkedCall(null); setExtraData({}); setShowCreate(true); }} className="h-9 text-sm">
            <Plus size={14} className="mr-1" /> New Report
          </CrimsonButton>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'approved', label: 'Approved' },
          { key: 'rejected', label: 'Rejected' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${filterStatus === f.key ? 'bg-white/10 border-white/20 text-white' : 'border-white/[0.08] text-white/40 hover:text-white/70'}`}
          >
            {f.label} ({f.key === 'all' ? myReports.length : myReports.filter(r => r.status === f.key).length})
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <GlassCard className="text-center py-14">
            <FileText size={32} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40 text-sm">No reports found</p>
          </GlassCard>
        ) : (
          filtered.map(r => (
            <ReportCard
              key={r.id}
              report={r}
              isSupervisor={isSupervisor}
              onApprove={(rep) => approveMutation.mutate(rep)}
              onReject={(rep) => rejectMutation.mutate(rep)}
            />
          ))
        )}
      </div>

      {/* ── CREATE REPORT DIALOG ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {linkedCall ? <><Link2 size={15} className="text-crimson" /> Report from {linkedCall.incident_id || 'Call'}</> : 'New Incident Report'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2 max-h-[70vh] overflow-y-auto pr-1">
            {/* Inherited call data banner */}
            {linkedCall && (
              <div className="p-3 rounded-xl bg-crimson/[0.06] border border-crimson/15 space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  {linkedCall.incident_id && <span className="font-mono-cad text-crimson/70 text-[10px]">{linkedCall.incident_id}</span>}
                  <span className="text-white font-semibold">{linkedCall.type}</span>
                  <span className="text-white/30">• {linkedCall.location}</span>
                </div>
                {linkedCall.description && <p className="text-white/40 text-[11px]">{linkedCall.description}</p>}
                <div className="flex items-center gap-3 text-[10px] text-white/30">
                  {linkedCall.department_type && <span>Dept: {linkedCall.department_type}</span>}
                  {linkedCall.created_date && <span>Opened: {format(new Date(linkedCall.created_date), 'MMM d, HH:mm')}</span>}
                  {linkedCall.assigned_units?.length > 0 && <span>{linkedCall.assigned_units.length} units assigned</span>}
                </div>
                {linkedCall.notes?.length > 0 && (
                  <div className="mt-1 pt-1.5 border-t border-white/[0.06]">
                    <span className="text-white/30 text-[10px] uppercase tracking-wider">Dispatch Notes</span>
                    {linkedCall.notes.map((n, i) => (
                      <p key={i} className="text-white/50 text-[11px] italic">"{n.text}" — {n.author}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/60 text-xs">Report Type</Label>
                <Select value={form.report_type} onValueChange={v => { setForm({ ...form, report_type: v }); setExtraData({}); }}>
                  <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    {REPORT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/60 text-xs">Title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Brief title..." className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-white/60 text-xs">Location</Label>
              <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Incident location..." className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" />
            </div>

            {/* Smart report builder sections */}
            {smartBuilderEnabled && smartSections && smartSections.map(section => (
              <div key={section.key}>
                <Label className="text-white/60 text-xs">{section.label}</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  {section.fields.map(field => (
                    <div key={field.key} className={field.type === 'textarea' ? 'col-span-2' : ''}>
                      {field.type === 'textarea' ? (
                        <Textarea
                          value={extraData[field.key] || ''}
                          onChange={e => setExtraData(d => ({ ...d, [field.key]: e.target.value }))}
                          placeholder={field.label}
                          className="bg-white/[0.05] border-white/10 text-white rounded-xl text-sm"
                          rows={2}
                        />
                      ) : (
                        <Input
                          value={extraData[field.key] || ''}
                          onChange={e => setExtraData(d => ({ ...d, [field.key]: e.target.value }))}
                          placeholder={field.label}
                          className="bg-white/[0.05] border-white/10 text-white rounded-xl text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Hide involved_parties when smart sections are shown */}
            {!(smartBuilderEnabled && smartSections) && (
              <div>
                <Label className="text-white/60 text-xs">Involved Parties</Label>
                <Input value={form.involved_parties} onChange={e => setForm({ ...form, involved_parties: e.target.value })} placeholder="Names, vehicles, etc..." className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" />
              </div>
            )}
            <div>
              <Label className="text-white/60 text-xs">Narrative</Label>
              <Textarea value={form.narrative} onChange={e => setForm({ ...form, narrative: e.target.value })} placeholder="Describe the incident in detail..." className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" rows={5} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <CrimsonButton variant="ghost" onClick={() => setShowCreate(false)}>Cancel</CrimsonButton>
              <CrimsonButton onClick={() => createMutation.mutate()} disabled={!form.narrative || createMutation.isPending}>
                <Send size={13} className="mr-1" /> Submit Report
              </CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── LINKED CALLS DIALOG ── */}
      <Dialog open={showLinkedCalls} onOpenChange={setShowLinkedCalls}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Link2 size={15} className="text-crimson" /> Create Report from Call
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/40 text-xs mt-1 mb-3">Select a completed call to auto-fill the report with incident data.</p>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {myClosedCalls.map(call => (
              <button
                key={call.id}
                onClick={() => handleCreateFromCall(call)}
                className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:border-crimson/20 transition-all"
              >
                <div className="flex items-center gap-2">
                  {call.incident_id && <span className="font-mono-cad text-crimson/60 text-[10px]">{call.incident_id}</span>}
                  <span className="text-white font-semibold text-sm">{call.type}</span>
                </div>
                <div className="text-white/30 text-xs mt-0.5">{call.location}</div>
                <div className="flex items-center gap-3 text-[10px] text-white/25 mt-1">
                  {call.created_date && <span>{format(new Date(call.created_date), 'MMM d, HH:mm')}</span>}
                  {call.assigned_units?.length > 0 && <span>{call.assigned_units.length} units</span>}
                  {call.notes?.length > 0 && <span>{call.notes.length} notes</span>}
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}