import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Code2, FlaskConical, Shield, CheckCircle2, XCircle, Archive,
  MessageSquare, ChevronDown, ChevronUp, Pencil, Filter, Clock, User
} from 'lucide-react';
import VanguardLogo from '@/components/VanguardLogo';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { canAccessGodPanel } from '@/lib/platformAuth';

const ROLE_META = {
  developer: { icon: Code2, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Developer' },
  tester: { icon: FlaskConical, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Tester' },
  moderator: { icon: Shield, color: 'text-crimson', bg: 'bg-crimson/10 border-crimson/20', label: 'Moderator' },
};

const STATUS_META = {
  pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  accepted: { label: 'Accepted', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  denied: { label: 'Denied', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  closed: { label: 'Closed', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
};

function ApplicationCard({ app, user, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editAnswers, setEditAnswers] = useState(app.answers || {});
  const queryClient = useQueryClient();

  const roleMeta = ROLE_META[app.role] || ROLE_META.moderator;
  const statusMeta = STATUS_META[app.status] || STATUS_META.pending;
  const Icon = roleMeta.icon;

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.StaffApplication.update(app.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['staff-applications'] }); },
  });

  const addComment = () => {
    if (!comment.trim()) return;
    const comments = [...(app.admin_comments || []), {
      author: user?.full_name || user?.email || 'Admin',
      text: comment.trim(),
      timestamp: new Date().toISOString(),
    }];
    updateMutation.mutate({ admin_comments: comments });
    setComment('');
  };

  const saveEdits = () => {
    updateMutation.mutate({ answers: editAnswers });
    setEditMode(false);
  };

  const answers = app.answers || {};
  const answerEntries = Object.entries(answers);

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 p-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${roleMeta.bg}`}>
          <Icon size={16} className={roleMeta.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{app.applicant_name || app.applicant_email}</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${roleMeta.bg} ${roleMeta.color}`}>{roleMeta.label}</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusMeta.color}`}>{statusMeta.label}</span>
          </div>
          <p className="text-white/30 text-xs mt-0.5">{app.applicant_email} · {new Date(app.created_date).toLocaleDateString()}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {app.status === 'pending' && (
            <>
              <button onClick={() => updateMutation.mutate({ status: 'accepted' })} title="Accept" className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-400 transition-all">
                <CheckCircle2 size={16} />
              </button>
              <button onClick={() => updateMutation.mutate({ status: 'denied' })} title="Deny" className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all">
                <XCircle size={16} />
              </button>
            </>
          )}
          {app.status !== 'closed' && (
            <button onClick={() => updateMutation.mutate({ status: 'closed' })} title="Close" className="p-1.5 rounded-lg hover:bg-zinc-500/20 text-zinc-400 transition-all">
              <Archive size={16} />
            </button>
          )}
          <button onClick={() => setEditMode(e => !e)} title="Edit answers" className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
            <Pencil size={15} />
          </button>
          <button onClick={() => setExpanded(e => !e)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-white/[0.06] p-4 space-y-5">

          {/* Answers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">Application Answers</p>
              {editMode && (
                <div className="flex gap-2">
                  <button onClick={() => setEditMode(false)} className="text-white/30 hover:text-white text-xs">Cancel</button>
                  <button onClick={saveEdits} className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold">Save</button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {answerEntries.map(([key, val]) => (
                <div key={key} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                  <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-1">{key.replace(/_/g, ' ')}</p>
                  {editMode ? (
                    <Textarea
                      value={editAnswers[key] || ''}
                      onChange={e => setEditAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                      className="bg-white/[0.05] border-white/10 text-white text-sm rounded-lg min-h-[60px]"
                    />
                  ) : (
                    <p className="text-white/75 text-sm leading-relaxed">{val}</p>
                  )}
                </div>
              ))}
              {answerEntries.length === 0 && <p className="text-white/20 text-sm">No answers recorded.</p>}
            </div>
          </div>

          {/* Comments */}
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-3">Admin Comments ({(app.admin_comments || []).length})</p>
            <div className="space-y-2 mb-3">
              {(app.admin_comments || []).map((c, i) => (
                <div key={i} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={11} className="text-white/30" />
                    <span className="text-white/50 text-xs font-semibold">{c.author}</span>
                    <span className="text-white/20 text-xs">{new Date(c.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-white/75 text-sm">{c.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="bg-white/[0.05] border-white/10 text-white text-sm rounded-xl flex-1 min-h-[60px]"
              />
              <button
                onClick={addComment}
                disabled={!comment.trim()}
                className="px-3 py-2 rounded-xl bg-crimson hover:bg-crimson-light disabled:opacity-30 text-white text-sm font-semibold transition-all self-end"
              >
                <MessageSquare size={15} />
              </button>
            </div>
          </div>

          {/* Status override */}
          <div className="flex items-center gap-3">
            <p className="text-white/40 text-xs">Override status:</p>
            <Select value={app.status} onValueChange={v => updateMutation.mutate({ status: v })}>
              <SelectTrigger className="w-36 bg-white/[0.05] border-white/10 text-white text-sm rounded-xl h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                {Object.keys(STATUS_META).map(s => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationsAdmin() {
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: profiles = [] } = useQuery({
    queryKey: ['my-profile-admin'],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });
  const myProfile = profiles[0];

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['staff-applications'],
    queryFn: () => base44.entities.StaffApplication.list('-created_date', 200),
  });

  const isAdmin = canAccessGodPanel(myProfile, user?.email) || user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-white/40 text-lg mb-4">Access denied.</p>
          <Link to="/" className="text-crimson hover:underline text-sm">Back to Home</Link>
        </div>
      </div>
    );
  }

  const filtered = applications.filter(app => {
    const roleMatch = roleFilter === 'all' || app.role === roleFilter;
    const statusMatch = statusFilter === 'all' || app.status === statusFilter;
    const searchMatch = !search || app.applicant_email?.includes(search) || app.applicant_name?.toLowerCase().includes(search.toLowerCase());
    return roleMatch && statusMatch && searchMatch;
  });

  const counts = {
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    denied: applications.filter(a => a.status === 'denied').length,
    closed: applications.filter(a => a.status === 'closed').length,
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      {/* Nav */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.06] bg-black/20">
        <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <VanguardLogo size="sm" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Staff Applications</h1>
          <p className="text-white/40 text-sm">Review, comment, and manage all incoming team applications.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {Object.entries(counts).map(([status, count]) => {
            const meta = STATUS_META[status];
            return (
              <div key={status} className={`p-3 rounded-xl border text-center ${meta.color}`}>
                <p className="text-xl font-black">{count}</p>
                <p className="text-xs uppercase tracking-wider font-semibold opacity-70">{meta.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-56 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 text-sm rounded-xl h-9"
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36 bg-white/[0.04] border-white/10 text-white text-sm rounded-xl h-9">
              <Filter size={12} className="mr-1 opacity-50" /><SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="tester">Tester</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-white/[0.04] border-white/10 text-white text-sm rounded-xl h-9">
              <Clock size={12} className="mr-1 opacity-50" /><SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Application list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-white/[0.03] animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/25">
            <Archive size={32} className="mx-auto mb-3" />
            <p className="text-sm">No applications match your filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(app => (
              <ApplicationCard key={app.id} app={app} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}