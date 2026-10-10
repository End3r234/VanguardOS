import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Award, Search, Check, BadgeCheck, Server, Megaphone, Tag, Pin, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VanguardLogo from '@/components/VanguardLogo';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import PlatformBadge from '@/components/PlatformBadge';
import { PLATFORM_BADGES, CAD_MODERATOR_EMAIL, GOD_MODE_EMAIL } from '@/lib/platformAuth';

// Custom badges stored per-user on the platform
const ALL_BADGE_KEYS = Object.keys(PLATFORM_BADGES);

export default function BadgeAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });
  const { data: myProfiles = [] } = useQuery({
    queryKey: ['my-profile', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });
  const myProfile = myProfiles[0];

  // Only owner / god mode can access
  const isOwner = user?.email === CAD_MODERATOR_EMAIL ||
    user?.email === GOD_MODE_EMAIL ||
    (myProfile?.platform_badges || []).includes('staff') ||
    (myProfile?.platform_badges || []).includes('developer');

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['all-profiles-admin'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200),
    enabled: isOwner,
  });

  const [serverSearch, setServerSearch] = useState('');
  const { data: allServers = [] } = useQuery({
    queryKey: ['all-servers-admin'],
    queryFn: () => base44.entities.Server.list('-created_date', 200),
    enabled: isOwner,
  });

  const filteredServers = allServers.filter(s =>
    !serverSearch || (s.name || '').toLowerCase().includes(serverSearch.toLowerCase())
  );

  const toggleVerifiedMutation = useMutation({
    mutationFn: (server) => base44.entities.Server.update(server.id, { is_verified: !server.is_verified }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-servers-admin'] }),
  });

  const filtered = allProfiles.filter(p =>
    !search ||
    (p.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.user_email || '').toLowerCase().includes(search.toLowerCase())
  );

  const grantBadgeMutation = useMutation({
    mutationFn: async ({ profileId, badgeKey, currentBadges }) => {
      const updated = currentBadges.includes(badgeKey)
        ? currentBadges.filter(b => b !== badgeKey)
        : [...currentBadges, badgeKey];
      return base44.entities.UserProfile.update(profileId, { platform_badges: updated });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-profiles-admin'] }),
  });

  const grantSelfBadge = (badgeKey) => {
    if (!myProfile) return;
    const current = myProfile.platform_badges || [];
    grantBadgeMutation.mutate({ profileId: myProfile.id, badgeKey, currentBadges: current });
  };

  // Custom Badges
  const { data: customBadges = [] } = useQuery({
    queryKey: ['custom-badges'],
    queryFn: () => base44.entities.CustomBadge.list('-created_date', 100),
    enabled: isOwner,
  });

  const [newBadge, setNewBadge] = useState({ name: '', description: '', icon: '🏅', color: '#CE0000', bg_color: '#1a0000' });
  const createBadgeMutation = useMutation({
    mutationFn: () => base44.entities.CustomBadge.create({ ...newBadge, created_by: user?.email }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['custom-badges'] }); setNewBadge({ name: '', description: '', icon: '🏅', color: '#CE0000', bg_color: '#1a0000' }); },
  });
  const deleteBadgeMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomBadge.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom-badges'] }),
  });

  const grantCustomBadgeMutation = useMutation({
    mutationFn: async ({ profileId, badgeName, currentBadges }) => {
      const updated = currentBadges.includes(badgeName)
        ? currentBadges.filter(b => b !== badgeName)
        : [...currentBadges, badgeName];
      return base44.entities.UserProfile.update(profileId, { platform_badges: updated });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-profiles-admin'] }),
  });

  // Role management
  const GLOBAL_ROLES = [
    { value: 'user', label: 'User', color: '#6B7280' },
    { value: 'moderator', label: 'Moderator', color: '#3B82F6' },
    { value: 'admin', label: 'Admin', color: '#EF4444' },
    { value: 'developer', label: 'Developer', color: '#10B981' },
    { value: 'global_mod', label: 'Global Mod', color: '#8B5CF6' },
    { value: 'cad_moderator', label: 'CAD Moderator', color: '#3B82F6' },
    { value: 'owner', label: 'Owner', color: '#FFD700' },
    { value: 'community_manager', label: 'Community Manager', color: '#A78BFA' },
  ];

  const updateRoleMutation = useMutation({
    mutationFn: ({ profileId, role }) => base44.entities.UserProfile.update(profileId, { global_role: role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['all-profiles-admin'] }),
  });

  // Announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements-admin'],
    queryFn: () => base44.entities.Announcement.list('-created_date', 100),
    enabled: isOwner,
  });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', body: '', type: 'announcement', pinned: false, tags: '' });
  const createAnnouncementMutation = useMutation({
    mutationFn: () => base44.entities.Announcement.create({
      ...newAnnouncement,
      tags: newAnnouncement.tags ? newAnnouncement.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      author_email: user?.email,
      author_name: user?.full_name || user?.email,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['announcements-admin'] }); setNewAnnouncement({ title: '', body: '', type: 'announcement', pinned: false, tags: '' }); },
  });
  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id) => base44.entities.Announcement.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements-admin'] }),
  });

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <GlassCard className="text-center py-12 px-8">
          <Award size={36} className="mx-auto mb-3 text-crimson/40" />
          <p className="text-white font-bold text-lg mb-1">Access Denied</p>
          <p className="text-white/40 text-sm mb-4">Badge administration is restricted to VanguardOS platform owners.</p>
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
          <span className="text-white/30 text-sm">/ Badge Administration</span>
          <Link to="/bug-reports" className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all flex items-center gap-1.5">
            <Shield size={12} /> Bug Reports
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <Tabs defaultValue="users">
          <TabsList className="bg-white/[0.04] border border-white/10 rounded-xl mb-6">
            <TabsTrigger value="users" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
              Manage User Badges
            </TabsTrigger>
            <TabsTrigger value="self" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
              My Own Badges
            </TabsTrigger>
            <TabsTrigger value="servers" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
              <BadgeCheck size={13} className="mr-1" /> Verify Servers
            </TabsTrigger>
            <TabsTrigger value="catalog" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
              Badge Catalog
            </TabsTrigger>
            <TabsTrigger value="custom-badges" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
              <Award size={13} className="mr-1" /> Custom Badges
            </TabsTrigger>
            <TabsTrigger value="announcements" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
              <Megaphone size={13} className="mr-1" /> Announcements
            </TabsTrigger>
            <TabsTrigger value="roles" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
              <Shield size={13} className="mr-1" /> Roles
            </TabsTrigger>
          </TabsList>

          {/* USER MANAGEMENT */}
          <TabsContent value="users">
            <div className="mb-4 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              {filtered.map(profile => {
                const currentBadges = profile.platform_badges || [];
                return (
                  <GlassCard key={profile.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm">{profile.display_name || profile.user_email}</p>
                        <p className="text-white/30 text-xs mb-2">{profile.user_email}</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {currentBadges.map(b => <PlatformBadge key={b} badgeKey={b} small />)}
                          {currentBadges.length === 0 && <span className="text-white/20 text-xs">No badges</span>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {ALL_BADGE_KEYS.map(key => {
                          const has = currentBadges.includes(key);
                          const def = PLATFORM_BADGES[key];
                          return (
                            <button
                              key={key}
                              onClick={() => grantBadgeMutation.mutate({ profileId: profile.id, badgeKey: key, currentBadges })}
                              title={has ? `Remove ${def.label}` : `Grant ${def.label}`}
                              className={`text-[10px] px-2 py-1 rounded-md border font-medium transition-all flex items-center gap-1 ${
                                has ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 bg-transparent text-white/40 hover:border-white/30 hover:text-white/70'
                              }`}
                            >
                              {has && <Check size={9} />}
                              {def.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </TabsContent>

          {/* SELF BADGES */}
          <TabsContent value="self">
            <p className="text-white/40 text-sm mb-4">Grant or revoke badges from your own profile.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ALL_BADGE_KEYS.map(key => {
                const def = PLATFORM_BADGES[key];
                const has = (myProfile?.platform_badges || []).includes(key);
                return (
                  <GlassCard key={key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PlatformBadge badgeKey={key} />
                      <div>
                        <p className="text-white text-sm font-medium">{def.label}</p>
                        <p className="text-white/30 text-xs">{def.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => grantSelfBadge(key)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                        has ? 'border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20' : 'border-crimson/30 text-crimson bg-crimson/10 hover:bg-crimson/20'
                      }`}
                    >
                      {has ? 'Revoke' : 'Grant'}
                    </button>
                  </GlassCard>
                );
              })}
            </div>
          </TabsContent>

          {/* SERVER VERIFICATION */}
          <TabsContent value="servers">
            <p className="text-white/40 text-sm mb-4">Grant or revoke Vanguard Verified status for servers. Verified servers get a blue checkmark and higher visibility.</p>
            <div className="mb-4 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                value={serverSearch}
                onChange={e => setServerSearch(e.target.value)}
                placeholder="Search servers..."
                className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl"
              />
            </div>
            <div className="space-y-3">
              {filteredServers.map(server => (
                <GlassCard key={server.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {server.icon_url ? (
                      <img src={server.icon_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-crimson/20 flex items-center justify-center flex-shrink-0">
                        <Server size={16} className="text-crimson" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">{server.name}</span>
                        {server.is_verified && (
                          <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold">
                            <BadgeCheck size={9} /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-white/30 text-xs truncate">{server.owner_email} • {server.member_count || 0} members</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleVerifiedMutation.mutate(server)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all flex-shrink-0 ml-3 ${
                      server.is_verified
                        ? 'border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20'
                        : 'border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
                    }`}
                  >
                    {server.is_verified ? 'Revoke' : 'Verify'}
                  </button>
                </GlassCard>
              ))}
            </div>
          </TabsContent>

          {/* CATALOG */}
          <TabsContent value="catalog">
            <p className="text-white/40 text-sm mb-4">All platform badges and their descriptions.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ALL_BADGE_KEYS.map(key => {
                const def = PLATFORM_BADGES[key];
                return (
                  <GlassCard key={key} className="flex items-center gap-4">
                    <PlatformBadge badgeKey={key} />
                    <div>
                      <p className="text-white font-semibold text-sm">{def.label}</p>
                      <p className="text-white/40 text-xs">{def.description}</p>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </TabsContent>
          {/* CUSTOM BADGES */}
          <TabsContent value="custom-badges">
            <GlassCard className="mb-6">
              <h3 className="text-white font-semibold text-sm mb-4">Create Custom Badge</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-white/60 text-xs">Name</Label>
                  <Input value={newBadge.name} onChange={e => setNewBadge({ ...newBadge, name: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="e.g. Elite Dispatcher" />
                </div>
                <div>
                  <Label className="text-white/60 text-xs">Icon (emoji)</Label>
                  <Input value={newBadge.icon} onChange={e => setNewBadge({ ...newBadge, icon: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="🏅" />
                </div>
                <div className="col-span-2">
                  <Label className="text-white/60 text-xs">Description</Label>
                  <Input value={newBadge.description} onChange={e => setNewBadge({ ...newBadge, description: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="What this badge represents" />
                </div>
                <div>
                  <Label className="text-white/60 text-xs">Text Color</Label>
                  <div className="flex gap-2 mt-1 items-center">
                    <input type="color" value={newBadge.color} onChange={e => setNewBadge({ ...newBadge, color: e.target.value })} className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                    <Input value={newBadge.color} onChange={e => setNewBadge({ ...newBadge, color: e.target.value })} className="bg-white/[0.05] border-white/10 text-white rounded-xl text-sm h-9" />
                  </div>
                </div>
                <div>
                  <Label className="text-white/60 text-xs">Background Color</Label>
                  <div className="flex gap-2 mt-1 items-center">
                    <input type="color" value={newBadge.bg_color} onChange={e => setNewBadge({ ...newBadge, bg_color: e.target.value })} className="w-9 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                    <Input value={newBadge.bg_color} onChange={e => setNewBadge({ ...newBadge, bg_color: e.target.value })} className="bg-white/[0.05] border-white/10 text-white rounded-xl text-sm h-9" />
                  </div>
                </div>
              </div>
              {newBadge.name && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-white/40 text-xs">Preview:</span>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border font-medium" style={{ color: newBadge.color, background: newBadge.bg_color, borderColor: newBadge.color + '50' }}>
                    {newBadge.icon} {newBadge.name}
                  </span>
                </div>
              )}
              <div className="mt-4">
                <CrimsonButton onClick={() => createBadgeMutation.mutate()} disabled={!newBadge.name || createBadgeMutation.isPending} className="h-9 text-sm">
                  <Plus size={14} className="mr-1" /> Create Badge
                </CrimsonButton>
              </div>
            </GlassCard>

            <div className="space-y-3">
              {customBadges.map(badge => (
                <GlassCard key={badge.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border font-medium" style={{ color: badge.color, background: badge.bg_color, borderColor: badge.color + '50' }}>
                        {badge.icon} {badge.name}
                      </span>
                      <p className="text-white/40 text-xs">{badge.description}</p>
                    </div>
                    <button onClick={() => deleteBadgeMutation.mutate(badge.id)} className="p-1.5 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {/* Grant section */}
                  <div className="mt-3 pt-3 border-t border-white/[0.06]">
                    <p className="text-white/30 text-xs mb-2">Grant to users:</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {allProfiles.slice(0, 20).map(p => {
                        const has = (p.platform_badges || []).includes(badge.name);
                        return (
                          <div key={p.id} className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/[0.03]">
                            <span className="text-white/60 text-xs">{p.display_name || p.user_email}</span>
                            <button
                              onClick={() => grantCustomBadgeMutation.mutate({ profileId: p.id, badgeName: badge.name, currentBadges: p.platform_badges || [] })}
                              className={`text-[10px] px-2 py-0.5 rounded-md border font-medium transition-all ${has ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-white/10 text-white/40 hover:text-white hover:border-white/30'}`}
                            >
                              {has ? 'Revoke' : 'Grant'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </GlassCard>
              ))}
              {customBadges.length === 0 && (
                <p className="text-white/30 text-sm text-center py-8">No custom badges yet.</p>
              )}
            </div>
          </TabsContent>

          {/* ANNOUNCEMENTS */}
          <TabsContent value="announcements">
            <GlassCard className="mb-6">
              <h3 className="text-white font-semibold text-sm mb-4">Post Announcement</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-white/60 text-xs">Title</Label>
                  <Input value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="Post title" />
                </div>
                <div>
                  <Label className="text-white/60 text-xs">Body (Markdown supported)</Label>
                  <Textarea value={newAnnouncement.body} onChange={e => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" rows={5} placeholder="Write your announcement here... Markdown is supported." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white/60 text-xs">Type</Label>
                    <Select value={newAnnouncement.type} onValueChange={v => setNewAnnouncement({ ...newAnnouncement, type: v })}>
                      <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white/60 text-xs">Tags (comma-separated)</Label>
                    <Input value={newAnnouncement.tags} onChange={e => setNewAnnouncement({ ...newAnnouncement, tags: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" placeholder="e.g. v2.0, police, patch" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="pinned" checked={newAnnouncement.pinned} onChange={e => setNewAnnouncement({ ...newAnnouncement, pinned: e.target.checked })} className="rounded" />
                  <Label htmlFor="pinned" className="text-white/60 text-xs cursor-pointer">Pin this post</Label>
                </div>
                <CrimsonButton onClick={() => createAnnouncementMutation.mutate()} disabled={!newAnnouncement.title || !newAnnouncement.body || createAnnouncementMutation.isPending} className="h-9 text-sm">
                  <Megaphone size={14} className="mr-1" /> Publish
                </CrimsonButton>
              </div>
            </GlassCard>

            <div className="space-y-3">
              {announcements.map(post => (
                <GlassCard key={post.id} className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {post.pinned && <Pin size={11} className="text-yellow-400" />}
                      <span className="text-[10px] uppercase tracking-wide text-white/30 font-semibold border border-white/10 px-1.5 py-0.5 rounded-full">{post.type}</span>
                      <span className="text-white/20 text-xs">{new Date(post.created_date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-white font-semibold text-sm">{post.title}</p>
                    <p className="text-white/40 text-xs mt-1 line-clamp-2">{post.body.replace(/[#*`]/g, '')}</p>
                  </div>
                  <button onClick={() => deleteAnnouncementMutation.mutate(post.id)} className="p-1.5 text-red-400/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0">
                    <Trash2 size={13} />
                  </button>
                </GlassCard>
              ))}
              {announcements.length === 0 && (
                <p className="text-white/30 text-sm text-center py-8">No announcements yet.</p>
              )}
            </div>
          </TabsContent>

          {/* ROLES */}
          <TabsContent value="roles">
            <p className="text-white/40 text-sm mb-4">Manage global platform roles for users.</p>
            <div className="mb-4 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              {filtered.map(profile => (
                <GlassCard key={profile.id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm">{profile.display_name || profile.user_email}</p>
                    <p className="text-white/30 text-xs">{profile.user_email}</p>
                  </div>
                  <Select
                    value={profile.global_role || 'user'}
                    onValueChange={role => updateRoleMutation.mutate({ profileId: profile.id, role })}
                  >
                    <SelectTrigger className="w-48 bg-white/[0.05] border-white/10 text-white rounded-xl text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                      {GLOBAL_ROLES.map(r => (
                        <SelectItem key={r.value} value={r.value}>
                          <span style={{ color: r.color }}>{r.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </GlassCard>
              ))}
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}