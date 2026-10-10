import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Server, FileText, Shield, Flag, Activity, Search, ChevronDown, ChevronRight, Eye, AlertTriangle, BarChart2, Zap } from 'lucide-react';
import { canAccessGodPanel } from '@/lib/platformAuth';
import VanguardLogo from '@/components/VanguardLogo';
import GlassCard from '@/components/GlassCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function StatCard({ icon: Icon, label, value, color = 'text-crimson' }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-white/40 text-xs">{label}</div>
        <div className="text-white font-bold text-xl">{value}</div>
      </div>
    </div>
  );
}

function ExpandableRow({ label, sub, data }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-all text-left">
        <div>
          <div className="text-white text-sm font-medium">{label}</div>
          {sub && <div className="text-white/30 text-xs mt-0.5">{sub}</div>}
        </div>
        {open ? <ChevronDown size={14} className="text-white/30" /> : <ChevronRight size={14} className="text-white/30" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/[0.06] pt-3">
          <pre className="text-white/60 text-[10px] overflow-x-auto whitespace-pre-wrap max-h-60">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function GodPanel() {
  const [userSearch, setUserSearch] = useState('');
  const [serverSearch, setServerSearch] = useState('');
  const [reportSearch, setReportSearch] = useState('');

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: myProfiles = [] } = useQuery({
    queryKey: ['my-god-profile', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });
  const myProfile = myProfiles[0];
  const isGod = canAccessGodPanel(myProfile, user?.email);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['god-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    enabled: isGod,
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['god-profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200),
    enabled: isGod,
  });

  const { data: allServers = [] } = useQuery({
    queryKey: ['god-servers'],
    queryFn: () => base44.entities.Server.list('-created_date', 200),
    enabled: isGod,
  });

  const { data: allMembers = [] } = useQuery({
    queryKey: ['god-members'],
    queryFn: () => base44.entities.ServerMember.list('-created_date', 500),
    enabled: isGod,
  });

  const { data: allReports = [] } = useQuery({
    queryKey: ['god-reports'],
    queryFn: () => base44.entities.BugReport.list('-created_date', 200),
    enabled: isGod,
  });

  const { data: allAuditLogs = [] } = useQuery({
    queryKey: ['god-audit'],
    queryFn: () => base44.entities.AdminAuditLog.list('-created_date', 500),
    enabled: isGod,
  });

  const { data: allCivilians = [] } = useQuery({
    queryKey: ['god-civilians'],
    queryFn: () => base44.entities.Civilian.list('-created_date', 500),
    enabled: isGod,
  });

  const { data: allCalls = [] } = useQuery({
    queryKey: ['god-calls'],
    queryFn: () => base44.entities.Call.list('-created_date', 500),
    enabled: isGod,
  });

  const { data: allUnits = [] } = useQuery({
    queryKey: ['god-units'],
    queryFn: () => base44.entities.Unit.list('-created_date', 500),
    enabled: isGod,
  });

  const { data: allIncidentReports = [] } = useQuery({
    queryKey: ['god-incident-reports'],
    queryFn: () => base44.entities.IncidentReport.list('-created_date', 500),
    enabled: isGod,
  });

  const { data: allAnalyticsEvents = [] } = useQuery({
    queryKey: ['god-analytics'],
    queryFn: () => base44.entities.AnalyticsEvent.list('-created_date', 500),
    enabled: isGod,
  });

  // Aggregate analytics
  const pageViews = allAnalyticsEvents.filter(e => e.event_name === 'page_view');
  const featureUses = allAnalyticsEvents.filter(e => e.event_name !== 'page_view');
  const pageCounts = {};
  pageViews.forEach(e => { const p = e.properties?.path || 'unknown'; pageCounts[p] = (pageCounts[p] || 0) + 1; });
  const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const featureCounts = {};
  featureUses.forEach(e => { featureCounts[e.event_name] = (featureCounts[e.event_name] || 0) + 1; });
  const topFeatures = Object.entries(featureCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Gate — god mode only (after all hooks)
  if (user && !isGod) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={40} className="mx-auto mb-3 text-crimson" />
          <p className="text-white/40">Access Denied.</p>
          <Link to="/" className="mt-4 inline-block text-crimson text-sm underline">Go Home</Link>
        </div>
      </div>
    );
  }

  const filteredUsers = allUsers.filter(u =>
    !userSearch || u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.full_name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredServers = allServers.filter(s =>
    !serverSearch || s.name?.toLowerCase().includes(serverSearch.toLowerCase())
  );

  const filteredReports = allReports.filter(r =>
    !reportSearch || r.title?.toLowerCase().includes(reportSearch.toLowerCase()) || r.reporter_email?.toLowerCase().includes(reportSearch.toLowerCase())
  );

  const severityColor = { low: 'text-green-400', medium: 'text-yellow-400', high: 'text-orange-400', critical: 'text-red-400' };
  const statusColor = { open: 'bg-red-500/20 text-red-400', in_progress: 'bg-yellow-500/20 text-yellow-400', resolved: 'bg-green-500/20 text-green-400', closed: 'bg-white/10 text-white/40' };

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <header className="border-b border-crimson/30 bg-[#1a0000]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/30 hover:text-white transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <VanguardLogo size="sm" />
            <div className="px-2 py-0.5 rounded-md bg-crimson/20 border border-crimson/40 text-crimson text-[10px] font-bold uppercase tracking-widest">
              GOD PANEL
            </div>
          </div>
          <div className="text-white/30 text-xs font-mono">{user?.email}</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
          <StatCard icon={Users} label="Total Users" value={allUsers.length} color="text-blue-400" />
          <StatCard icon={Server} label="Servers" value={allServers.length} color="text-emerald-400" />
          <StatCard icon={Shield} label="Members" value={allMembers.length} color="text-purple-400" />
          <StatCard icon={FileText} label="Bug Reports" value={allReports.length} color="text-orange-400" />
          <StatCard icon={Activity} label="Audit Logs" value={allAuditLogs.length} color="text-yellow-400" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard icon={Users} label="Civilians" value={allCivilians.length} color="text-teal-400" />
          <StatCard icon={Activity} label="Active Calls" value={allCalls.filter(c => c.status !== 'closed').length} color="text-crimson" />
          <StatCard icon={Shield} label="Online Units" value={allUnits.filter(u => u.status !== '10-42').length} color="text-blue-400" />
          <StatCard icon={FileText} label="Incident Reports" value={allIncidentReports.length} color="text-white/50" />
        </div>

        <Tabs defaultValue="users">
          <TabsList className="bg-white/[0.04] border border-white/10 rounded-xl mb-6 flex-wrap h-auto gap-1 p-1">
            {[
              { value: 'users', label: 'Users' },
              { value: 'profiles', label: 'Profiles' },
              { value: 'servers', label: 'Servers' },
              { value: 'members', label: 'Members' },
              { value: 'bugreports', label: 'Bug Reports' },
              { value: 'audit', label: 'Audit Log' },
              { value: 'calls', label: 'Calls' },
              { value: 'units', label: 'Units' },
              { value: 'civilians', label: 'Civilians' },
              { value: 'incidents', label: 'Incidents' },
              { value: 'analytics', label: 'Analytics' },
            ].map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-white/50 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg text-xs px-3 py-1.5">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* USERS */}
          <TabsContent value="users">
            <div className="flex items-center gap-2 mb-4">
              <Search size={14} className="text-white/30" />
              <Input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name or email..." className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl h-8 text-sm max-w-xs" />
              <span className="text-white/30 text-xs">{filteredUsers.length} users</span>
            </div>
            <div className="space-y-2">
              {filteredUsers.map(u => (
                <ExpandableRow
                  key={u.id}
                  label={u.full_name || u.email}
                  sub={`${u.email} • Joined: ${new Date(u.created_date).toLocaleDateString()}`}
                  data={u}
                />
              ))}
            </div>
          </TabsContent>

          {/* PROFILES */}
          <TabsContent value="profiles">
            <div className="text-white/30 text-xs mb-3">{allProfiles.length} profiles</div>
            <div className="space-y-2">
              {allProfiles.map(p => (
                <ExpandableRow
                  key={p.id}
                  label={p.display_name || p.user_email}
                  sub={`${p.user_email} • Role: ${p.global_role} • Badges: ${(p.platform_badges || []).join(', ') || 'none'}`}
                  data={p}
                />
              ))}
            </div>
          </TabsContent>

          {/* SERVERS */}
          <TabsContent value="servers">
            <div className="flex items-center gap-2 mb-4">
              <Search size={14} className="text-white/30" />
              <Input value={serverSearch} onChange={e => setServerSearch(e.target.value)} placeholder="Search servers..." className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl h-8 text-sm max-w-xs" />
              <span className="text-white/30 text-xs">{filteredServers.length} servers</span>
            </div>
            <div className="space-y-2">
              {filteredServers.map(s => (
                <ExpandableRow
                  key={s.id}
                  label={s.name}
                  sub={`Owner: ${s.owner_email} • Members: ${s.member_count || 0} • Tier: ${s.server_tier} • Verified: ${s.is_verified ? '✓' : '✗'}`}
                  data={s}
                />
              ))}
            </div>
          </TabsContent>

          {/* MEMBERS */}
          <TabsContent value="members">
            <div className="text-white/30 text-xs mb-3">{allMembers.length} memberships</div>
            <div className="space-y-2">
              {allMembers.map(m => (
                <ExpandableRow
                  key={m.id}
                  label={`${m.user_name || m.user_email} — ${m.role}`}
                  sub={`Server: ${m.server_id} • Dept: ${m.department_type || 'none'} • Callsign: ${m.callsign || 'none'}`}
                  data={m}
                />
              ))}
            </div>
          </TabsContent>

          {/* BUG REPORTS */}
          <TabsContent value="bugreports">
            <div className="flex items-center gap-2 mb-4">
              <Search size={14} className="text-white/30" />
              <Input value={reportSearch} onChange={e => setReportSearch(e.target.value)} placeholder="Search reports..." className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl h-8 text-sm max-w-xs" />
              <span className="text-white/30 text-xs">{filteredReports.length} reports</span>
            </div>
            <div className="space-y-2">
              {filteredReports.map(r => (
                <ExpandableRow
                  key={r.id}
                  label={r.title}
                  sub={`${r.reporter_email} • Severity: ${r.severity} • Status: ${r.status}`}
                  data={r}
                />
              ))}
            </div>
          </TabsContent>

          {/* AUDIT LOG */}
          <TabsContent value="audit">
            <div className="text-white/30 text-xs mb-3">{allAuditLogs.length} audit entries</div>
            <div className="space-y-1.5">
              {allAuditLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <Activity size={12} className="text-white/20 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-xs font-medium">{log.action}</span>
                      <span className="text-white/30 text-[10px]">by {log.admin_email}</span>
                      {log.target_email && <span className="text-crimson text-[10px]">→ {log.target_email}</span>}
                    </div>
                    {log.details && <div className="text-white/40 text-[10px] mt-0.5 truncate">{log.details}</div>}
                    <div className="text-white/20 text-[9px] mt-0.5">{new Date(log.created_date).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* CALLS */}
          <TabsContent value="calls">
            <div className="text-white/30 text-xs mb-3">{allCalls.length} total calls — {allCalls.filter(c => c.status !== 'closed').length} active</div>
            <div className="space-y-2">
              {allCalls.map(c => (
                <ExpandableRow
                  key={c.id}
                  label={`[${c.call_number || c.id.slice(0, 8)}] ${c.type} — ${c.location}`}
                  sub={`Priority: ${c.priority} • Status: ${c.status} • Server: ${c.server_id?.slice(0, 8)}`}
                  data={c}
                />
              ))}
            </div>
          </TabsContent>

          {/* UNITS */}
          <TabsContent value="units">
            <div className="text-white/30 text-xs mb-3">{allUnits.length} total units — {allUnits.filter(u => u.status !== '10-42').length} on duty</div>
            <div className="space-y-2">
              {allUnits.map(u => (
                <ExpandableRow
                  key={u.id}
                  label={`${u.callsign} — ${u.department_type}`}
                  sub={`${u.user_email} • Status: ${u.status} • Server: ${u.server_id?.slice(0, 8)}`}
                  data={u}
                />
              ))}
            </div>
          </TabsContent>

          {/* CIVILIANS */}
          <TabsContent value="civilians">
            <div className="text-white/30 text-xs mb-3">{allCivilians.length} civilians</div>
            <div className="space-y-2">
              {allCivilians.map(c => (
                <ExpandableRow
                  key={c.id}
                  label={c.name}
                  sub={`${c.user_email} • DOB: ${c.dob || 'N/A'} • DL: ${c.dl_status || 'N/A'} • Server: ${c.server_id?.slice(0, 8)}`}
                  data={c}
                />
              ))}
            </div>
          </TabsContent>

          {/* INCIDENT REPORTS */}
          <TabsContent value="incidents">
            <div className="text-white/30 text-xs mb-3">{allIncidentReports.length} incident reports</div>
            <div className="space-y-2">
              {allIncidentReports.map(r => (
                <ExpandableRow
                  key={r.id}
                  label={`[${r.report_number || r.id.slice(0, 8)}] ${r.report_type} — ${r.title || 'Untitled'}`}
                  sub={`${r.author_email} • Dept: ${r.department_type} • Status: ${r.status} • Server: ${r.server_id?.slice(0, 8)}`}
                  data={r}
                />
              ))}
            </div>
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent value="analytics">
            <div className="mb-6 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-crimson" />
                <p className="text-white font-semibold text-sm">Platform Analytics</p>
              </div>
              <p className="text-white/30 text-xs mt-1">Anonymous usage data — feature usage, page visits, and adoption trends to guide development.</p>
            </div>

            {allAnalyticsEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-white/20">
                <BarChart2 size={32} className="mb-3 opacity-40" />
                <p className="text-sm">No analytics events recorded yet.</p>
                <p className="text-xs mt-1">Events will appear here as users interact with the platform.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <div>
                  <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity size={12} className="text-crimson" /> Most Visited Pages
                  </h3>
                  <div className="space-y-1.5">
                    {topPages.map(([path, count]) => (
                      <div key={path} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-white/60 text-xs font-mono-cad truncate">{path}</span>
                        <span className="text-white font-bold text-sm flex-shrink-0 ml-3">{count}</span>
                      </div>
                    ))}
                    {topPages.length === 0 && <p className="text-white/20 text-xs">No page visits recorded</p>}
                  </div>
                </div>

                {/* Top Features */}
                <div>
                  <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap size={12} className="text-crimson" /> Most Used Features
                  </h3>
                  <div className="space-y-1.5">
                    {topFeatures.map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-white/60 text-xs font-mono-cad truncate">{name}</span>
                        <span className="text-white font-bold text-sm flex-shrink-0 ml-3">{count}</span>
                      </div>
                    ))}
                    {topFeatures.length === 0 && <p className="text-white/20 text-xs">No feature usage recorded</p>}
                  </div>
                </div>

                {/* Recent Events */}
                <div className="lg:col-span-2">
                  <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity size={12} className="text-crimson" /> Recent Events
                  </h3>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {allAnalyticsEvents.slice(0, 30).map(evt => (
                      <div key={evt.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-xs">
                        <span className="text-white/20 font-mono-cad text-[10px] flex-shrink-0">{evt.created_date ? new Date(evt.created_date).toLocaleTimeString() : '--'}</span>
                        <span className="text-crimson font-mono-cad text-[10px] flex-shrink-0">{evt.event_name}</span>
                        <span className="text-white/30 text-[10px] truncate">{evt.properties ? JSON.stringify(evt.properties).slice(0, 80) : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}