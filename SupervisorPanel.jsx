import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Star, FileText, History, Play } from 'lucide-react';
import { format } from 'date-fns';
import PanelHandbook from '@/components/panels/PanelHandbook';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GlassCard from '@/components/GlassCard';
import StatusBadge from '@/components/StatusBadge';
import ReportsPanel from '@/components/panels/ReportsPanel';
import CallReportProgress from '@/components/dispatch/CallReportProgress';
import IncidentReplay from '@/components/replay/IncidentReplay';

export default function SupervisorPanel({ server, units, calls, user, serverId, members, isAdmin }) {
  const [showReplay, setShowReplay] = useState(null);
  const activeUnits = units.filter(u => u.status !== '10-42');
  const activeCalls = calls.filter(c => c.status !== 'closed');
  const closedCalls = calls.filter(c => c.status === 'closed')
    .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', serverId],
    queryFn: () => base44.entities.IncidentReport.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Star size={20} className="text-yellow-400" />
        <h2 className="text-white font-bold text-lg">Supervisor</h2>
        <PanelHandbook panel="supervisor" />
      </div>

      <Tabs defaultValue="reports">
        <TabsList className="bg-white/[0.04] border border-white/10 rounded-xl mb-6">
          <TabsTrigger value="reports" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <FileText size={13} className="mr-1.5" /> Report Review
          </TabsTrigger>
          <TabsTrigger value="units" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            Active Units
          </TabsTrigger>
          <TabsTrigger value="calls" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            Active Calls
          </TabsTrigger>
          <TabsTrigger value="history" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <History size={13} className="mr-1.5" /> Call History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <ReportsPanel serverId={serverId} user={user} myUnit={null} isSupervisor={true} departmentType={null} />
        </TabsContent>

        <TabsContent value="units">
          <div className="space-y-2">
            {activeUnits.length === 0 ? (
              <GlassCard className="text-center py-10 text-white/30">No active units</GlassCard>
            ) : (
              activeUnits.map(u => (
                <GlassCard key={u.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="text-white font-semibold">{u.callsign}</span>
                    <span className="text-white/30 text-xs ml-2">{u.department_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.location && <span className="text-white/30 text-xs">{u.location}</span>}
                    <StatusBadge status={u.status} />
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="calls">
          <div className="space-y-2">
            {activeCalls.length === 0 ? (
              <GlassCard className="text-center py-10 text-white/30">No active calls</GlassCard>
            ) : (
              activeCalls.map(c => (
                <GlassCard key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <span className="text-white font-semibold">{c.type}</span>
                    <span className="text-white/30 text-xs ml-2">{c.location}</span>
                  </div>
                  <StatusBadge status={c.priority} type="priority" />
                </GlassCard>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-3">
            {closedCalls.length === 0 ? (
              <GlassCard className="text-center py-10 text-white/30">No completed calls</GlassCard>
            ) : (
              closedCalls.map(call => (
                <div key={call.id} className="space-y-2">
                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">{call.type}</span>
                        {call.incident_id && <span className="text-[9px] font-mono-cad text-crimson/60">{call.incident_id}</span>}
                      </div>
                      <span className="text-white/30 text-xs">{call.location} {call.created_date ? `• ${format(new Date(call.created_date), 'MMM d, HH:mm')}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowReplay(call)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-crimson hover:bg-crimson/10 transition-all">
                        <Play size={10} /> Replay
                      </button>
                      <StatusBadge status={call.priority} type="priority" />
                    </div>
                  </div>
                  <CallReportProgress call={call} units={units} reports={reports} />
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {showReplay && (
        <IncidentReplay call={showReplay} serverId={serverId} onClose={() => setShowReplay(null)} />
      )}
    </div>
  );
}