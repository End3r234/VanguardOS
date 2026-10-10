import React, { useMemo } from 'react';
import { CheckCircle, Clock, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

/**
 * Report Completion Tracking for a completed call.
 * Shows which assigned units have submitted / approved / pending reports.
 */
export default function CallReportProgress({ call, units, reports }) {
  const assignedUnits = useMemo(() => {
    const ids = call.assigned_units || [];
    return ids
      .map(id => units.find(u => u.id === id))
      .filter(Boolean);
  }, [call, units]);

  const callReports = useMemo(() => {
    if (call.incident_id) {
      return reports.filter(r => r.incident_id === call.incident_id);
    }
    return reports.filter(r => r.call_id === call.id);
  }, [call, reports]);

  const getUnitReportStatus = (unit) => {
    const unitReports = callReports.filter(r =>
      r.author_email === unit.user_email || r.author_callsign === unit.callsign
    );
    if (unitReports.length === 0) return { status: 'pending', label: 'Pending' };
    if (unitReports.some(r => r.status === 'approved')) return { status: 'approved', label: 'Approved' };
    if (unitReports.some(r => r.status === 'rejected')) return { status: 'rejected', label: 'Rejected' };
    return { status: 'submitted', label: 'Submitted' };
  };

  const statusConfig = {
    submitted: { icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    approved:  { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    pending:   { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    rejected:  { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };

  const submittedCount = assignedUnits.filter(u => {
    const s = getUnitReportStatus(u);
    return s.status !== 'pending';
  }).length;

  if (assignedUnits.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-white/30 text-xs">No units were assigned to this call.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-white/40" />
          <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Reports</span>
          {call.incident_id && (
            <span className="text-[9px] font-mono-cad text-crimson/60 ml-1">{call.incident_id}</span>
          )}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
          submittedCount === assignedUnits.length
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        }`}>
          {submittedCount}/{assignedUnits.length} complete
        </span>
      </div>

      {/* Unit rows */}
      <div className="divide-y divide-white/[0.04]">
        {assignedUnits.map(unit => {
          const { status, label } = getUnitReportStatus(unit);
          const cfg = statusConfig[status];
          const Icon = cfg.icon;
          return (
            <div key={unit.id} className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2.5">
                <span className="text-white/80 text-sm font-semibold font-mono-cad">{unit.callsign}</span>
                <span className="text-white/25 text-[10px]">{unit.department_name}</span>
              </div>
              <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                <Icon size={10} />
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}