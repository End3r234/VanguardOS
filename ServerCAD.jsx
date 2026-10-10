import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Radio, Shield, Flame, Settings, GraduationCap, User, BadgeCheck, AlertTriangle, ShieldAlert, Map, Activity, Bell, MapPin } from 'lucide-react';
import EmailNotifications from '@/components/settings/EmailNotifications';
import VanguardLogo from '@/components/VanguardLogo';
import CrimsonButton from '@/components/CrimsonButton';
import DispatchPanel from '@/components/panels/DispatchPanel';
import PolicePanel from '@/components/panels/PolicePanel';
import FireEMSPanel from '@/components/panels/FireEMSPanel';
import EMSPanel from '@/components/panels/EMSPanel';
import ServerSettings from '@/components/panels/ServerSettings';
import AdminPanel from '@/components/panels/AdminPanel';
import CivilianPanel from '@/components/panels/CivilianPanel';
import SupervisorPanel from '@/components/panels/SupervisorPanel';
import MapPanel from '@/components/panels/MapPanel';
import LiveDispatchMap from '@/components/panels/LiveDispatchMap';
import { hasPlatformBypass } from '@/lib/platformAuth';
import { playTone } from '@/lib/toneEngine';
import CADLoadingScreen from '@/components/CADLoadingScreen';
import '@/styles/retro-cad.css';
import '@/styles/cad-themes.css';
import MobileCompanion from '@/components/mobile/MobileCompanion';
import UndoToast from '@/components/UndoToast';
import OnboardingPrompt from '@/components/onboarding/OnboardingPrompt';
import MiniPopups from '@/components/MiniPopups';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { loadShortcuts } from '@/lib/keyboardShortcuts';

const THEME_BG = {
  dark: '#0B0B0B', midnight: '#0A0E1A', futuristic: '#050A0F', light: '#F0F0F0',
};

// Solid backgrounds for themed CAD interfaces (CSS handles grids/glow on top)
const THEME_SOLID_BG = {
  retro: 'var(--retro-bg)',
  tactical: '#0a0a08',
  eoc: '#e8eaed',
  cyber: '#08080f',
  firstresponder: '#0d0d0f',
};

export default function ServerCAD() {
  const pathParts = window.location.pathname.split('/');
  const serverId = pathParts[pathParts.indexOf('server') + 1];
  const [activeTab, setActiveTab] = useState('dispatch');
  const [signal100, setSignal100] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [kbShortcuts] = useState(() => loadShortcuts());
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: myProfiles = [] } = useQuery({
    queryKey: ['my-profile-cad', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });
  const myGlobalProfile = myProfiles[0];
  const globalBypass = hasPlatformBypass(myGlobalProfile, user?.email);

  const { data: server, isLoading } = useQuery({
    queryKey: ['server', serverId],
    queryFn: async () => { const s = await base44.entities.Server.filter({ id: serverId }); return s[0]; },
    enabled: !!serverId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['server-members', serverId],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const { data: units = [] } = useQuery({
    queryKey: ['server-units', serverId],
    queryFn: () => base44.entities.Unit.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const { data: calls = [] } = useQuery({
    queryKey: ['server-calls', serverId],
    queryFn: () => base44.entities.Call.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const myMember = members.find(m => m.user_email === user?.email);
  const isOwner = globalBypass || myMember?.role === 'owner';
  const isAdmin = isOwner || myMember?.role === 'admin';

  // Auto-join
  useEffect(() => {
    if (user && serverId && members.length > 0 && !myMember) {
      base44.entities.ServerMember.create({
        server_id: serverId, user_email: user.email, user_name: user.full_name, role: 'member',
      }).then(() => queryClient.invalidateQueries({ queryKey: ['server-members'] }));
    }
  }, [user, serverId, members, myMember]);

  // Panel access check — owner/admin/globalBypass bypass all, otherwise use dept_keys
  const canAccess = (panel) => {
    if (globalBypass || isOwner || isAdmin) return true;
    const k = myMember?.dept_keys || {};
    if (panel === 'dispatch') return k.dispatch || false;
    if (panel === 'police') return k.police || false;
    if (panel === 'fire') return k.fire || false;
    if (panel === 'ems') return k.ems || false;
    if (panel === 'civilian') return true;
    if (panel === 'supervisor') return k.supervisor || false;
    if (panel === 'map') return true;
    if (panel === 'notifications') return true;
    if (panel === 'livemap') return true;
    return false;
  };

  const bgColor = THEME_BG[server?.theme || 'dark'];
  const uiTheme = server?.ui_theme || 'modern';
  const isRetro = uiTheme === 'retro';
  const themeClass = uiTheme !== 'modern' ? `cad-${uiTheme}` : '';
  const activeDept = ['police', 'fire', 'ems', 'dispatch'].includes(activeTab) ? activeTab : 'neutral';
  const bgVal = THEME_SOLID_BG[uiTheme] || (server?.custom_bg_url ? `url(${server.custom_bg_url}) center/cover fixed` : bgColor);

  const NAV = [
    { key: 'dispatch', label: 'Dispatch', icon: Radio, dot: 'bg-emerald-400' },
    { key: 'police', label: 'Police', icon: Shield, dot: 'bg-blue-400' },
    { key: 'fire', label: 'Fire', icon: Flame, dot: 'bg-orange-400' },
    { key: 'ems', label: 'EMS', icon: Activity, dot: 'bg-red-400' },
    { key: 'civilian', label: 'Civilian', icon: User, dot: 'bg-teal-400' },
    { key: 'supervisor', label: 'Supervisor', icon: BadgeCheck, dot: 'bg-yellow-400' },
    ...(!(server?.live_map_enabled && server?.live_map_preset !== 'none') ? [{ key: 'map', label: 'Map', icon: Map, dot: 'bg-teal-400' }] : []),
    ...(server?.live_map_enabled ? [{ key: 'livemap', label: 'Live Map', icon: MapPin, dot: 'bg-crimson' }] : []),
    ...(server?.email_notifications_enabled ? [{ key: 'notifications', label: 'Notify', icon: Bell, dot: 'bg-emerald-400' }] : []),
    ...(isAdmin ? [{ key: 'admin', label: 'Admin', icon: ShieldAlert, dot: 'bg-purple-400' }] : []),
    ...(isOwner ? [{ key: 'settings', label: 'Settings', icon: Settings, dot: 'bg-white/50' }] : []),
  ].filter(n => canAccess(n.key) || isAdmin || isOwner);

  const isFullyLoaded = !isLoading && server && members.length >= 0 && units.length >= 0 && calls.length >= 0;
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (isFullyLoaded) {
      const t = setTimeout(() => setShowLoading(false), 3600);
      return () => clearTimeout(t);
    }
  }, [isFullyLoaded]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useKeyboardShortcuts(kbShortcuts, {
    'open-dispatch': () => setActiveTab('dispatch'),
    'open-map': () => setActiveTab('livemap'),
    'open-radio': () => setActiveTab('dispatch'),
    'toggle-sidebar': () => window.dispatchEvent(new CustomEvent('vos-shortcut', { detail: { id: 'toggle-sidebar' } })),
    'new-call': () => window.dispatchEvent(new CustomEvent('vos-shortcut', { detail: { id: 'new-call' } })),
    'search': () => window.dispatchEvent(new CustomEvent('vos-shortcut', { detail: { id: 'search' } })),
  });

  if (isLoading || showLoading) return <CADLoadingScreen serverName={server?.name} />;

  if (!server) return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
      <div className="text-center">
        <p className="text-white/40 mb-4">Server not found.</p>
        <Link to="/"><CrimsonButton>Go Home</CrimsonButton></Link>
      </div>
    </div>
  );

  if (isMobile) return (
    <MobileCompanion serverId={serverId} server={server} user={user} onExit={() => { window.location.href = '/'; }} />
  );

  return (
    <div
      className={`cad-root min-h-screen flex flex-col ${isRetro ? 'cad-retro retro-root' : ''} ${themeClass}`}
      data-dept={uiTheme === 'firstresponder' ? activeDept : undefined}
      style={{ background: bgVal }}
    >
      <header className={`border-b sticky top-0 z-50 shadow-lg shadow-black/40 ${isRetro ? 'retro-titlebar border-[#404040] !rounded-none' : 'border-white/[0.08] bg-[#110000]/95 backdrop-blur-2xl'}`}>
        <div className="px-4 flex items-center justify-between gap-2" style={{ height: '52px' }}>
          {/* Left: logo + server name */}
          <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
            <Link to="/" className={`w-7 h-7 flex items-center justify-center transition-all ${isRetro ? 'retro-btn !min-w-0 !p-1 text-black' : 'rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white'}`}>
              <ArrowLeft size={14} />
            </Link>
            <div className={isRetro ? 'w-px h-4 bg-[#808080]' : 'w-px h-4 bg-white/[0.08]'} />
            <VanguardLogo size="sm" />
            <div className="hidden sm:flex items-center gap-2">
              <div className={isRetro ? 'w-px h-4 bg-[#808080]' : 'w-px h-4 bg-white/[0.08]'} />
              <div>
                <div className={`text-xs font-semibold leading-none tracking-wide ${isRetro ? 'text-black' : 'text-white font-inter'}`}>{server.name}</div>
                <div className={`text-[9px] mt-0.5 uppercase tracking-widest ${isRetro ? 'text-black/60' : 'text-white/25 font-mono-cad'}`}>CAD System</div>
              </div>
            </div>
          </div>

          {/* Center: Nav tabs */}
          <nav className="flex items-center gap-0.5 overflow-x-auto py-1">
            {NAV.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold transition-all whitespace-nowrap ${
                    isRetro
                      ? active
                        ? 'retro-tab retro-tab-active'
                        : 'retro-tab'
                      : active
                        ? 'bg-white/[0.08] text-white border border-white/[0.12] rounded-lg'
                        : 'text-white/35 hover:text-white/55 hover:bg-white/[0.04] rounded-lg'
                  }`}
                >
                  {active && !isRetro && <span className={`w-1.5 h-1.5 rounded-full ${item.dot} flex-shrink-0`} />}
                  <Icon size={12} />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {(isAdmin || isOwner) && (
              <button
                onClick={() => {
                  const next = !signal100;
                  setSignal100(next);
                  if (next) playTone('signal100');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-bold border transition-all font-inter tracking-widest uppercase ${
                  signal100
                    ? 'bg-crimson text-white border-crimson shadow-lg shadow-crimson/30 animate-pulse'
                    : 'bg-transparent text-white/35 border-white/[0.08] hover:border-crimson/40 hover:text-crimson hover:bg-crimson/10'
                }`}
              >
                <AlertTriangle size={11} /> SIG 100
              </button>
            )}
            <div className="w-px h-4 bg-white/[0.08] mx-0.5" />
            <Link to="/lms" title="Training" className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
              <GraduationCap size={14} />
            </Link>
            <Link to="/" title="Home" className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all">
              <ArrowLeft size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Signal 100 Banner */}
      {signal100 && (
        <div className="sticky top-12 z-40 bg-crimson text-white text-center py-2 text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-3 animate-pulse font-inter">
          <AlertTriangle size={15} /> SIGNAL 100 — EMERGENCY TRAFFIC ONLY <AlertTriangle size={15} />
          <button onClick={() => setSignal100(false)} className="ml-4 text-xs underline opacity-70 hover:opacity-100 font-normal normal-case tracking-normal">Clear</button>
        </div>
      )}

      <main className="flex-1">
        {activeTab === 'dispatch' && <DispatchPanel server={server} units={units} calls={calls} user={user} myMember={myMember} serverId={serverId} isAdmin={isAdmin} isOwner={isOwner} />}
        {activeTab === 'police' && <PolicePanel server={server} units={units} calls={calls} user={user} myMember={myMember} serverId={serverId} isAdmin={isAdmin} isOwner={isOwner} />}
        {activeTab === 'fire' && <FireEMSPanel server={server} units={units} calls={calls} user={user} myMember={myMember} serverId={serverId} isAdmin={isAdmin} isOwner={isOwner} />}
        {activeTab === 'ems' && <EMSPanel server={server} units={units} calls={calls} user={user} myMember={myMember} serverId={serverId} isAdmin={isAdmin} isOwner={isOwner} />}
        {activeTab === 'civilian' && <CivilianPanel server={server} user={user} serverId={serverId} />}
        {activeTab === 'supervisor' && <SupervisorPanel server={server} units={units} calls={calls} user={user} serverId={serverId} members={members} isAdmin={isAdmin} />}
        {activeTab === 'map' && <MapPanel server={server} />}
        {activeTab === 'livemap' && (
          <LiveDispatchMap
            server={server}
            serverId={serverId}
            units={units}
            user={user}
            isDispatch={myMember?.department_type === 'dispatch' || isAdmin || isOwner}
          />
        )}
        {activeTab === 'admin' && isAdmin && <AdminPanel server={server} members={members} serverId={serverId} isOwner={isOwner} user={user} units={units} calls={calls} />}
        {activeTab === 'notifications' && (
          <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-5">
              <Bell size={18} className="text-crimson" />
              <h2 className="text-white font-bold text-lg">Email Notifications</h2>
            </div>
            <EmailNotifications server={server} serverId={serverId} user={user} isAdmin={isAdmin} isOwner={isOwner} />
          </div>
        )}
        {activeTab === 'settings' && isOwner && <ServerSettings server={server} serverId={serverId} user={user} isAdmin={isAdmin} isOwner={isOwner} />}
      </main>

      <UndoToast />
      <OnboardingPrompt />
      <MiniPopups />
    </div>
  );
}