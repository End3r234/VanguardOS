import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Globe, Compass, ArrowRight, Users, Zap, Hash, Eye, LogOut, ChevronDown, ChevronUp, Shield, Code2, Heart, FlaskConical } from 'lucide-react';
import { isGodMode, canAccessGodPanel } from '@/lib/platformAuth';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import VanguardLogo from '@/components/VanguardLogo';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import ServerCard from '@/components/ServerCard';
import FeatureHighlights from '@/components/FeatureHighlights';
import HomeSlideshow from '@/components/HomeSlideshow';
import HomeFooter from '@/components/HomeFooter';
import AboutSection from '@/components/AboutSection';
import CADPromoVideo from '@/components/home/CADPromoVideo';
import WhyVanguard from '@/components/WhyVanguard';
import CommunitySection from '@/components/CommunitySection';
import FinalCTA from '@/components/FinalCTA';
import CinematicWelcome from '@/components/CinematicWelcome';
import OnboardingPrompt from '@/components/onboarding/OnboardingPrompt';

export default function Home() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [newServer, setNewServer] = useState({ name: '', description: '' });
  const [importFrom, setImportFrom] = useState('');
  const [showCinematic, setShowCinematic] = useState(() => !sessionStorage.getItem('vos-cinematic-shown'));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myGlobalProfiles = [] } = useQuery({
    queryKey: ['my-home-profile', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });
  const myGlobalProfile = myGlobalProfiles[0];

  const { data: servers = [], isLoading } = useQuery({
    queryKey: ['servers'],
    queryFn: () => base44.entities.Server.list('-created_date', 50),
    refetchInterval: 30000,
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ['my-memberships', user?.email],
    queryFn: () => base44.entities.ServerMember.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      let templateData = {};
      if (importFrom) {
        const template = servers.find(s => s.id === importFrom);
        if (template) {
          templateData = {
            penal_code: template.penal_code || [],
            report_types: template.report_types || [],
            tones: template.tones || {},
            tags: template.tags || [],
            dispatch_ai_enabled: template.dispatch_ai_enabled || false,
            smart_report_builder: template.smart_report_builder || false,
            officer_safety_enabled: template.officer_safety_enabled || false,
            ui_theme: template.ui_theme || 'modern',
            live_map_enabled: template.live_map_enabled || false,
            live_map_preset: template.live_map_preset || 'none',
            unit_ping_interval: template.unit_ping_interval || 120,
            departments: template.departments || [],
          };
        }
      }
      const server = await base44.entities.Server.create({
        ...newServer,
        ...templateData,
        owner_email: user.email,
        invite_code: code,
        member_count: 1,
        is_public: true,
        departments: (templateData.departments && templateData.departments.length > 0) ? templateData.departments : [
          { name: 'Police Department', type: 'police', short_name: 'PD' },
          { name: 'Fire Department', type: 'fire', short_name: 'FD' },
          { name: 'Dispatch', type: 'dispatch', short_name: 'DSP' },
        ],
      });
      await base44.entities.ServerMember.create({
        server_id: server.id,
        user_email: user.email,
        user_name: user.full_name,
        role: 'owner',
        dept_keys: { police: true, fire: true, ems: true, dispatch: true },
      });
      return server;
    },
    onSuccess: (server) => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      setShowCreate(false);
      setNewServer({ name: '', description: '' });
      setImportFrom('');
      navigate(`/server/${server.id}`);
    },
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      setJoinError('');
      const code = joinCode.trim().toUpperCase();
      const results = await base44.entities.Server.filter({ invite_code: code });
      if (!results || results.length === 0) throw new Error('No server found with that Community ID.');
      const server = results[0];
      // Check if already a member
      const existing = await base44.entities.ServerMember.filter({ server_id: server.id, user_email: user.email });
      if (existing.length > 0) {
        navigate(`/server/${server.id}`);
        return server;
      }
      await base44.entities.ServerMember.create({
        server_id: server.id,
        user_email: user.email,
        user_name: user.full_name,
        role: 'member',
      });
      await base44.entities.Server.update(server.id, { member_count: (server.member_count || 0) + 1 });
      queryClient.invalidateQueries({ queryKey: ['servers'] });
      queryClient.invalidateQueries({ queryKey: ['my-memberships'] });
      return server;
    },
    onSuccess: (server) => {
      setShowJoin(false);
      setJoinCode('');
      navigate(`/server/${server.id}`);
    },
    onError: (err) => {
      setJoinError(err.message || 'Failed to join server.');
    },
  });

  const myServerIds = new Set(myMemberships.map(m => m.server_id));
  const myServers = servers.filter(s => myServerIds.has(s.id));
  const ownedIds = new Set(servers.filter(s => s.owner_email === user?.email).map(s => s.id));
  const importableServers = servers.filter(s => s.owner_email === user?.email || myMemberships.some(m => m.server_id === s.id && (m.role === 'admin' || m.role === 'owner')));
  const publicServers = servers.filter(s => s.is_public && !myServerIds.has(s.id));
  const filtered = publicServers
    .filter(s => !search || s.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.is_verified ? 1 : 0) - (a.is_verified ? 1 : 0));

  const BG_URL = 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/b5d5b432b_Untitleddesign17.png';

  return (
    <div className="min-h-screen bg-[#0B0B0B] relative">
      {showCinematic && (
        <CinematicWelcome onComplete={() => {
          sessionStorage.setItem('vos-cinematic-shown', 'true');
          setShowCinematic(false);
        }} />
      )}
      <OnboardingPrompt />
      {/* VOS branded background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url(${BG_URL})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          opacity: 0.07,
        }}
      />
      {/* Header */}
      <header className="border-b border-crimson/20 bg-[#1a0000]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <VanguardLogo size="md" />
          <nav className="flex items-center gap-4">
            <Link to="/profile" className="text-white/50 hover:text-white text-sm transition-colors">Profile</Link>
            <Link to="/directory" className="text-white/50 hover:text-white text-sm transition-colors">Directory</Link>
            <Link to="/updates" className="text-white/50 hover:text-white text-sm transition-colors">Updates</Link>
            <Link to="/blog" className="text-white/50 hover:text-white text-sm transition-colors">Blog</Link>
            <Link to="/faq" className="text-white/50 hover:text-white text-sm transition-colors">FAQ</Link>
            <Link to="/badge-admin" className="text-white/50 hover:text-white text-sm transition-colors">Badge Admin</Link>
            {canAccessGodPanel(myGlobalProfile, user?.email) && (
              <>
                <Link to="/god" className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border border-crimson/40 bg-crimson/10 text-crimson hover:bg-crimson/20 transition-all">
                  <Eye size={12} /> GOD
                </Link>
                <Link to="/applications-admin" className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all">
                  <Shield size={12} /> APPS
                </Link>
              </>
            )}
            <CrimsonButton onClick={() => setShowCreate(true)} className="h-9 px-4 text-sm">
              <Plus size={14} className="mr-1" /> Create Server
            </CrimsonButton>
            <button
              onClick={() => base44.auth.logout('/')}
              title="Sign Out"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.08] border border-white/10 text-xs transition-all"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-crimson/30 bg-crimson/10 text-crimson text-xs font-semibold uppercase tracking-widest mb-4" style={{ display: 'none' }}>
              ⚡ VanguardOS Platform
            </div>
            <h1
              className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #ffffff 40%, #CE0000 70%, #8B0000 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              The Ultimate CAD Platform<br />for FiveM &amp; Roleplay Communities
            </h1>
            <p className="text-white/55 text-base max-w-2xl mx-auto">
              Manage dispatch, law enforcement, fire, EMS, civilians, training, and server operations from one powerful platform built for realism.
            </p>
            <HomeSlideshow />
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-10">
            {[
              { icon: Globe, label: 'Active Servers', value: servers.length },
              { icon: Users, label: 'Total Members', value: servers.reduce((a, s) => a + (s.member_count || 0), 0) },
              { icon: Zap, label: 'Your Servers', value: myServers.length },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-2 text-white/40 text-xs mb-1">
                  <Icon size={12} /> {label}
                </div>
                <div className="text-white font-bold text-2xl">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
        {/* My Servers */}
        {myServers.length > 0 && (
          <section className="mb-12">
            <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Zap size={14} className="text-crimson" /> Your Servers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myServers.map(s => <ServerCard key={s.id} server={s} owned={ownedIds.has(s.id)} />)}
            </div>
          </section>
        )}

        {/* Discovery */}
        <section id="discover">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <Compass size={14} className="text-crimson" /> Discover Servers
            </h2>
            <div className="flex items-center gap-2">
              <CrimsonButton variant="outline" onClick={() => { setShowJoin(true); setJoinError(''); setJoinCode(''); }} className="h-9 px-3 text-sm">
                <Hash size={13} className="mr-1" /> Join with ID
              </CrimsonButton>
              <div className="relative w-52">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <Input
                  placeholder="Search servers..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl glass h-32 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <GlassCard className="text-center py-16">
              <Compass size={40} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/40">No servers found. Create one to get started!</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.map(s => <ServerCard key={s.id} server={s} />)}
            </div>
          )}
        </section>
      </div>

      {/* Feature Highlights */}
      <FeatureHighlights />

      {/* Why VanguardOS — Comparison */}
      <WhyVanguard />

      {/* Promo Video Section */}
      <div className="max-w-7xl mx-auto px-6 pb-10 relative z-10">
        <CADPromoVideo />
      </div>

      {/* Community Section */}
      <CommunitySection />

      {/* Learning Center CTA */}
      <div className="max-w-7xl mx-auto px-6 pb-10 relative z-10">
        <Link to="/learning-center" className="block rounded-2xl border border-crimson/20 bg-crimson/5 hover:bg-crimson/10 transition-all p-6 md:p-8 group">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-black text-xl mb-1 font-rajdhani">Learning Center</h3>
              <p className="text-white/50 text-sm font-inter">New to VanguardOS? Explore interactive tutorials and get up to speed in minutes.</p>
            </div>
            <ArrowRight size={24} className="text-crimson group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </div>
        </Link>
      </div>

      {/* Applications Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16 relative z-10">
        <div className="mb-6">
          <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
            <Users size={14} className="text-crimson" /> Join the Team
          </h2>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
          <div className="max-w-2xl mb-8">
            <h3 className="text-white font-black text-2xl mb-2">Staff Applications Open</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              VanguardOS is built by the community, for the community. We're actively looking for developers, testers, and moderators to help shape the platform's future. If you're passionate about roleplay and want to contribute, apply below.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { role: 'developer', Icon: Code2, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', title: 'Developer', desc: 'Build features, fix bugs, and contribute to the VanguardOS codebase.' },
              { role: 'tester', Icon: FlaskConical, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', title: 'Tester', desc: 'Find bugs, stress-test features, and keep the platform stable.' },
              { role: 'moderator', Icon: Shield, color: 'text-crimson', bg: 'bg-crimson/10 border-crimson/20', title: 'Moderator', desc: 'Keep the community safe, enforce guidelines, and support members.' },
            ].map(({ role, Icon, color, bg, title, desc }) => (
              <Link
                key={role}
                to={`/apply?role=${role}`}
                className={`flex flex-col gap-3 p-5 rounded-2xl border transition-all hover:scale-[1.02] ${bg}`}
              >
                <div className="w-10 h-10 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center">
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{title}</p>
                  <p className="text-white/45 text-xs mt-1 leading-relaxed">{desc}</p>
                </div>
                <span className={`text-xs font-semibold ${color}`}>Apply now →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <AboutSection />

      {/* Final CTA */}
      <FinalCTA onCreateServer={() => setShowCreate(true)} />

      {/* Footer */}
      <HomeFooter />

      {/* Join Server Dialog */}
      <Dialog open={showJoin} onOpenChange={setShowJoin}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2"><Hash size={16} className="text-crimson" /> Join a Server</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-white/40 text-sm">Enter the Community ID shared by the server owner to join their server.</p>
            <div>
              <Label className="text-white/60 text-xs">Community ID</Label>
              <Input
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl tracking-widest text-base font-mono"
                placeholder="e.g. AB12CD"
                maxLength={8}
                onKeyDown={e => e.key === 'Enter' && joinCode.trim() && joinMutation.mutate()}
              />
              {joinError && <p className="text-red-400 text-xs mt-1.5">{joinError}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <CrimsonButton variant="ghost" onClick={() => setShowJoin(false)}>Cancel</CrimsonButton>
              <CrimsonButton onClick={() => joinMutation.mutate()} disabled={!joinCode.trim() || joinMutation.isPending}>
                {joinMutation.isPending ? 'Joining...' : 'Join Server'}
              </CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Server Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Create Server</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-white/60">Server Name</Label>
              <Input
                value={newServer.name}
                onChange={e => setNewServer({ ...newServer, name: e.target.value })}
                className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl"
                placeholder="My Roleplay Server"
              />
            </div>
            <div>
              <Label className="text-white/60">Description</Label>
              <Textarea
                value={newServer.description}
                onChange={e => setNewServer({ ...newServer, description: e.target.value })}
                className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl"
                placeholder="What's this server about?"
              />
            </div>
            {importableServers.length > 0 && (
              <div>
                <Label className="text-white/60">Import Template (optional)</Label>
                <p className="text-white/30 text-xs mb-1.5">Copy departments, penal codes, tones, and settings from an existing server. No data is copied.</p>
                <select
                  value={importFrom}
                  onChange={e => setImportFrom(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 text-white rounded-xl px-3 py-2 text-sm"
                >
                  <option value="">— Start fresh (default departments) —</option>
                  {importableServers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} {s.owner_email === user?.email ? '(owned)' : '(admin)'}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <CrimsonButton variant="ghost" onClick={() => setShowCreate(false)}>Cancel</CrimsonButton>
              <CrimsonButton
                onClick={() => createMutation.mutate()}
                disabled={!newServer.name || createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Server'}
              </CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}