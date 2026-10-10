import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Clock, Phone, FileText, Download, AlertTriangle, Send, CheckCircle } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';

function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ShiftSummaryReport({ serverId, user, myUnit, departmentType }) {
  const [generated, setGenerated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  // Fetch reports by this user this session
  const { data: reports = [] } = useQuery({
    queryKey: ['shift-reports', serverId, user?.email, departmentType],
    queryFn: () => base44.entities.IncidentReport.filter({
      server_id: serverId,
      author_email: user?.email,
      department_type: departmentType,
    }),
    enabled: !!serverId && !!user?.email && generated,
  });

  // Fetch calls this unit was involved in
  const { data: allCalls = [] } = useQuery({
    queryKey: ['shift-calls', serverId],
    queryFn: () => base44.entities.Call.filter({ server_id: serverId }),
    enabled: !!serverId && generated,
  });

  const submitToSupervisorMutation = useMutation({
    mutationFn: async () => {
      const narrative = [
        `Officer: ${user?.full_name || user?.email}`,
        `Callsign: ${myUnit?.callsign}`,
        `Department: ${myUnit?.department_name || departmentType}`,
        `On Duty Since: ${onDutySince ? new Date(onDutySince).toLocaleString() : 'N/A'}`,
        `Total On Duty Time: ${dutyMs > 0 ? formatDuration(dutyMs) : 'N/A'}`,
        ``,
        `Calls Assigned (${myCalls.length}):`,
        ...myCalls.map((c, i) => `  ${i+1}. [${c.priority}] ${c.type} — ${c.location}`),
        ``,
        `Reports Filed (${reports.length}):`,
        ...reports.map((r, i) => `  ${i+1}. ${r.title || r.report_type} — ${r.status}`),
      ].join('\n');

      return base44.entities.IncidentReport.create({
        server_id: serverId,
        report_number: 'SR-' + Date.now().toString().slice(-6),
        report_type: 'supplement',
        department_type: departmentType === 'police' ? 'police' : 'fire',
        author_email: user?.email,
        author_callsign: myUnit?.callsign,
        title: `Shift Summary — ${myUnit?.callsign} — ${new Date().toLocaleDateString()}`,
        narrative,
        status: 'pending',
        location: myUnit?.location || 'N/A',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      setSubmitted(true);
    },
  });

  const callsign = myUnit?.callsign || 'Unknown';
  const onDutySince = myUnit?.on_duty_since;
  const nowMs = Date.now();
  const dutyMs = onDutySince ? nowMs - new Date(onDutySince).getTime() : 0;

  // Filter calls where this unit was assigned
  const myCalls = allCalls.filter(c =>
    Array.isArray(c.assigned_units) && c.assigned_units.includes(callsign)
  );

  const handleDownload = () => {
    const lines = [
      `SHIFT SUMMARY REPORT`,
      `===================`,
      `Generated: ${new Date().toLocaleString()}`,
      `Officer: ${user?.full_name || user?.email}`,
      `Callsign: ${callsign}`,
      `Department: ${myUnit?.department_name || departmentType}`,
      `On Duty Since: ${onDutySince ? new Date(onDutySince).toLocaleString() : 'N/A'}`,
      `Total Time On Duty: ${dutyMs > 0 ? formatDuration(dutyMs) : 'N/A'}`,
      ``,
      `CALLS HANDLED (${myCalls.length})`,
      `------------------------------`,
      ...myCalls.map((c, i) =>
        `${i + 1}. [${c.priority || '—'}] ${c.type || 'Unknown'} — ${c.location || 'No location'} (${c.status})`
      ),
      myCalls.length === 0 ? '  No calls assigned this shift.' : '',
      ``,
      `INCIDENT REPORTS FILED (${reports.length})`,
      `------------------------------`,
      ...reports.map((r, i) =>
        `${i + 1}. ${r.title || r.report_type} — Status: ${r.status}`
      ),
      reports.length === 0 ? '  No reports filed this shift.' : '',
      ``,
      `---`,
      `VanguardOS CAD — Shift Summary`,
    ];

    const text = lines.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-summary-${callsign}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!myUnit || myUnit.status === '10-42') {
    return (
      <div className="px-6 pb-6 pt-4">
        <GlassCard>
          <div className="flex items-center gap-3 text-white/30">
            <AlertTriangle size={16} />
            <p className="text-sm">You must be on duty to generate a shift summary.</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 pt-4 space-y-4">
      {/* Shift overview */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={15} className="text-crimson" />
          <p className="text-white font-semibold text-sm">Shift Summary</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
            <Clock size={14} className="mx-auto mb-1 text-white/40" />
            <p className="text-white font-bold text-lg">{dutyMs > 0 ? formatDuration(dutyMs) : '—'}</p>
            <p className="text-white/30 text-[10px] uppercase tracking-wide">On Duty</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
            <Phone size={14} className="mx-auto mb-1 text-white/40" />
            <p className="text-white font-bold text-lg">{generated ? myCalls.length : '—'}</p>
            <p className="text-white/30 text-[10px] uppercase tracking-wide">Calls</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
            <FileText size={14} className="mx-auto mb-1 text-white/40" />
            <p className="text-white font-bold text-lg">{generated ? reports.length : '—'}</p>
            <p className="text-white/30 text-[10px] uppercase tracking-wide">Reports</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
            <ClipboardList size={14} className="mx-auto mb-1 text-white/40" />
            <p className="text-white text-xs font-semibold mt-1">{callsign}</p>
            <p className="text-white/30 text-[10px] uppercase tracking-wide">Callsign</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {!generated ? (
            <CrimsonButton onClick={() => setGenerated(true)} className="h-9 text-sm">
              <ClipboardList size={13} className="mr-1.5" /> Generate Summary
            </CrimsonButton>
          ) : (
            <>
              <CrimsonButton onClick={handleDownload} className="h-9 text-sm">
                <Download size={13} className="mr-1.5" /> Download
              </CrimsonButton>
              {submitted ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                  <CheckCircle size={14} /> Submitted to Supervisor
                </div>
              ) : (
                <CrimsonButton
                  variant="outline"
                  onClick={() => submitToSupervisorMutation.mutate()}
                  disabled={submitToSupervisorMutation.isPending}
                  className="h-9 text-sm"
                >
                  <Send size={13} className="mr-1.5" />
                  {submitToSupervisorMutation.isPending ? 'Submitting...' : 'Submit to Supervisor'}
                </CrimsonButton>
              )}
            </>
          )}
        </div>
      </GlassCard>

      {/* Calls list */}
      {generated && (
        <GlassCard>
          <p className="text-white/60 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <Phone size={11} /> Calls Assigned This Shift ({myCalls.length})
          </p>
          {myCalls.length === 0 ? (
            <p className="text-white/25 text-sm">No calls were assigned to your unit this shift.</p>
          ) : (
            <div className="space-y-2">
              {myCalls.map(call => (
                <div key={call.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${
                    call.priority === 'P1' ? 'bg-red-500/20 text-red-400' :
                    call.priority === 'P2' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-white/10 text-white/50'
                  }`}>{call.priority || 'P?'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{call.type || 'Unknown Incident'}</p>
                    <p className="text-white/35 text-xs">{call.location}</p>
                    {call.description && <p className="text-white/25 text-xs mt-0.5 truncate">{call.description}</p>}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                    call.status === 'closed' ? 'bg-white/[0.06] text-white/30' :
                    call.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' :
                    'bg-yellow-500/15 text-yellow-400'
                  }`}>{call.status}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}

      {/* Reports list */}
      {generated && (
        <GlassCard>
          <p className="text-white/60 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText size={11} /> Reports Filed This Shift ({reports.length})
          </p>
          {reports.length === 0 ? (
            <p className="text-white/25 text-sm">No incident reports filed this shift.</p>
          ) : (
            <div className="space-y-2">
              {reports.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <FileText size={13} className="text-white/30 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{r.title || r.report_type}</p>
                    <p className="text-white/30 text-xs">{r.report_type} · {formatDate(r.created_date)}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    r.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                    r.status === 'rejected' ? 'bg-red-500/15 text-red-400' :
                    'bg-yellow-500/15 text-yellow-400'
                  }`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}