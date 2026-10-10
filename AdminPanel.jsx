import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserX, ShieldCheck, Key, Users, Layout, Sparkles } from 'lucide-react';
import OwnerAIAssistant from '@/components/panels/OwnerAIAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';

const PANEL_KEYS = [
  { key: 'police', label: 'Police', color: 'text-blue-400' },
  { key: 'fire', label: 'Fire / EMS', color: 'text-orange-400' },
  { key: 'ems', label: 'EMS (separate)', color: 'text-red-400' },
  { key: 'dispatch', label: 'Dispatch', color: 'text-emerald-400' },
  { key: 'supervisor', label: 'Supervisor', color: 'text-yellow-400' },
];

export default function AdminPanel({ server, members, serverId, isOwner, user, units, calls }) {
  const queryClient = useQueryClient();

  const kickMutation = useMutation({
    mutationFn: async (member) => {
      const units = await base44.entities.Unit.filter({ server_id: serverId, user_email: member.user_email });
      for (const u of units) await base44.entities.Unit.delete(u.id);
      await base44.entities.ServerMember.delete(member.id);
      await base44.entities.Server.update(serverId, { member_count: Math.max(0, (server?.member_count || 1) - 1) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server-members'] }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }) => base44.entities.ServerMember.update(memberId, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server-members'] }),
  });

  const toggleKeyMutation = useMutation({
    mutationFn: async ({ memberId, dept, value, member }) => {
      const keys = { ...(member.dept_keys || {}), [dept]: value };
      await base44.entities.ServerMember.update(memberId, { dept_keys: keys });
      await base44.entities.AdminAuditLog.create({
        server_id: serverId,
        admin_email: user?.email || 'admin',
        action: value ? `Granted ${dept} access` : `Revoked ${dept} access`,
        target_email: member.user_email,
        details: `Panel access ${value ? 'granted' : 'revoked'} for ${dept}`,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server-members'] }),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck size={20} className="text-purple-400" />
        <h2 className="text-white font-bold text-lg">Administration</h2>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="bg-white/[0.04] border border-white/10 rounded-xl mb-6">
          <TabsTrigger value="members" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <Users size={13} className="mr-1.5" /> Members
          </TabsTrigger>
          <TabsTrigger value="panels" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <Layout size={13} className="mr-1.5" /> Panel Access
          </TabsTrigger>
          <TabsTrigger value="keys" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <Key size={13} className="mr-1.5" /> Dept Keys
          </TabsTrigger>
          {isOwner && server?.dispatch_ai_enabled && (
            <TabsTrigger value="ai" className="text-purple-400/60 data-[state=active]:text-purple-300 data-[state=active]:bg-purple-500/10 rounded-lg">
              <Sparkles size={13} className="mr-1.5" /> AI Assistant
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members">
          <div className="space-y-2">
            {members.map(m => (
              <GlassCard key={m.id} className="flex items-center justify-between py-3">
                <div>
                  <span className="text-white font-medium text-sm">{m.user_name || m.user_email}</span>
                  <span className="text-white/30 text-xs ml-2">{m.user_email}</span>
                  <span className="text-white/20 text-xs ml-2 capitalize">({m.role})</span>
                </div>
                <div className="flex items-center gap-3">
                  {isOwner && m.role !== 'owner' && (
                    <Select value={m.role} onValueChange={v => updateRoleMutation.mutate({ memberId: m.id, role: v })}>
                      <SelectTrigger className="w-28 bg-white/[0.05] border-white/10 text-white text-xs rounded-lg h-8"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {m.role === 'owner' && (
                    <span className="text-crimson text-xs font-medium px-2 py-1 rounded-lg bg-crimson/10 border border-crimson/20">Owner</span>
                  )}
                  {m.role !== 'owner' && m.user_email !== user?.email && (
                    <CrimsonButton variant="ghost" className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => kickMutation.mutate(m)}>
                      <UserX size={14} className="mr-1" /> Kick
                    </CrimsonButton>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="panels">
          <p className="text-white/40 text-sm mb-4">Control which panels each member can access. Admins & owners always have full access.</p>
          <div className="space-y-3">
            {members.filter(m => m.role !== 'owner' && m.role !== 'admin').map(m => (
              <GlassCard key={m.id}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-white font-medium text-sm">{m.user_name || m.user_email}</span>
                    <span className="text-white/30 text-xs ml-2 capitalize">{m.role}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {PANEL_KEYS.map(p => (
                    <div key={p.key} className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-2 py-1.5">
                      <Switch
                        checked={m.dept_keys?.[p.key] || false}
                        onCheckedChange={v => toggleKeyMutation.mutate({ memberId: m.id, dept: p.key, value: v, member: m })}
                      />
                      <Label className={`text-xs ${p.color}`}>{p.label}</Label>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
            {members.filter(m => m.role !== 'owner' && m.role !== 'admin').length === 0 && (
              <GlassCard className="text-center py-8 text-white/30 text-sm">No non-admin members to configure</GlassCard>
            )}
          </div>
        </TabsContent>

        <TabsContent value="keys">
          <p className="text-white/40 text-sm mb-4">Department certification keys override LMS training requirements for this server.</p>
          <div className="space-y-2">
            {members.filter(m => m.role !== 'owner').map(m => (
              <GlassCard key={m.id} className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{m.user_name || m.user_email}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['police', 'fire', 'ems', 'dispatch'].map(dept => (
                    <div key={dept} className="flex items-center gap-2">
                      <Switch checked={m.dept_keys?.[dept] || false} onCheckedChange={v => toggleKeyMutation.mutate({ memberId: m.id, dept, value: v, member: m })} />
                      <Label className="text-white/60 text-xs capitalize">{dept}</Label>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </TabsContent>

        {isOwner && server?.dispatch_ai_enabled && (
          <TabsContent value="ai">
            <OwnerAIAssistant serverId={serverId} server={server} members={members} user={user} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}