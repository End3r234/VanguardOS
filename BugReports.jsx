import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import VanguardLogo from '@/components/VanguardLogo';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import { GOD_MODE_EMAIL, CAD_MODERATOR_EMAIL } from '@/lib/platformAuth';

const SEVERITY_COLORS = {
  low: 'text-green-400 bg-green-500/10 border-green-500/30',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  critical: 'text-red-400 bg-red-500/10 border-red-500/30',
};
const STATUS_COLORS = {
  open: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  in_progress: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  resolved: 'text-green-400 bg-green-500/10 border-green-500/30',
  closed: 'text-white/40 bg-white/5 border-white/10',
};

export default function BugReports() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(null);
  const [notes, setNotes] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const isAdmin = user?.email === GOD_MODE_EMAIL || user?.email === CAD_MODERATOR_EMAIL;

  const { data: reports = [] } = useQuery({
    queryKey: ['bug-reports'],
    queryFn: () => base44.entities.BugReport.list('-created_date', 200),
    enabled: isAdmin,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BugReport.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bug-reports'] }),
  });

  const filtered = filterStatus === 'all' ? reports : reports.filter(r => r.status === filterStatus);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <GlassCard className="text-center py-12 px-8">
          <Bug size={36} className="mx-auto mb-3 text-crimson/40" />
          <p className="text-white font-bold text-lg mb-1">Access Denied</p>
          <p className="text-white/40 text-sm mb-4">This panel is restricted to platform administrators.</p>
          <Link to="/"><CrimsonButton variant="outline">Go Home</CrimsonButton></Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <header className="border-b border-crimson/20 bg-[#1a0000]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="text-white/40 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
          <VanguardLogo size="sm" />
          <span className="text-white/30 text-sm">/ Bug Reports</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-crimson/20 border border-crimson/30 text-crimson font-semibold">{reports.filter(r => r.status === 'open').length} open</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Filter */}
        <div className="flex items-center gap-3 mb-6">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filterStatus === s ? 'bg-white/10 border-white/30 text-white' : 'border-white/10 text-white/40 hover:text-white/70'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(report => (
            <GlassCard key={report.id} className="cursor-pointer" onClick={() => setExpanded(expanded === report.id ? null : report.id)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold uppercase ${SEVERITY_COLORS[report.severity]}`}>{report.severity}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold uppercase ${STATUS_COLORS[report.status]}`}>{report.status?.replace('_', ' ')}</span>
                    <span className="text-white/20 text-xs">{new Date(report.created_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white font-semibold text-sm">{report.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{report.reporter_name || report.reporter_email}</p>
                </div>
                {expanded === report.id ? <ChevronUp size={14} className="text-white/30 flex-shrink-0 mt-1" /> : <ChevronDown size={14} className="text-white/30 flex-shrink-0 mt-1" />}
              </div>

              {expanded === report.id && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3" onClick={e => e.stopPropagation()}>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Description</p>
                    <p className="text-white/80 text-sm">{report.description}</p>
                  </div>
                  {report.steps_to_reproduce && (
                    <div>
                      <p className="text-white/40 text-xs mb-1">Steps to Reproduce</p>
                      <p className="text-white/80 text-sm whitespace-pre-wrap">{report.steps_to_reproduce}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white/40 text-xs">Status</Label>
                      <Select value={report.status} onValueChange={v => updateMutation.mutate({ id: report.id, data: { status: v } })}>
                        <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm h-9"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/40 text-xs">Severity</Label>
                      <Select value={report.severity} onValueChange={v => updateMutation.mutate({ id: report.id, data: { severity: v } })}>
                        <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm h-9"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white/40 text-xs">Admin Notes</Label>
                    <Textarea
                      value={notes[report.id] ?? (report.admin_notes || '')}
                      onChange={e => setNotes(n => ({ ...n, [report.id]: e.target.value }))}
                      className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"
                      rows={2}
                      placeholder="Internal notes..."
                    />
                    <CrimsonButton
                      className="mt-2 h-8 text-xs"
                      onClick={() => updateMutation.mutate({ id: report.id, data: { admin_notes: notes[report.id] ?? report.admin_notes } })}
                    >
                      Save Notes
                    </CrimsonButton>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <Bug size={36} className="mx-auto mb-3 opacity-30" />
              <p>No bug reports found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}