import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Volume2, Palette, Save, Camera, Play, Building2, Scale, Map, GraduationCap, Bell, Radio, Monitor, Keyboard } from 'lucide-react';
import EmailNotifications from '@/components/settings/EmailNotifications';
import PenalCodeManager from '@/components/settings/PenalCodeManager';
import DepartmentManager from '@/components/settings/DepartmentManager';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import TrainingEditor from '@/components/settings/TrainingEditor';
import LiveMapSettings from '@/components/settings/LiveMapSettings';
import KeyboardShortcuts from '@/components/settings/KeyboardShortcuts';
import { getToneOptions, playTone, getDefaultTones } from '@/lib/toneEngine';

export default function ServerSettings({ server, serverId, user, isAdmin, isOwner }) {
  const queryClient = useQueryClient();
  const toneOptions = getToneOptions();

  const [general, setGeneral] = useState({
    name: server?.name || '',
    description: server?.description || '',
    is_public: server?.is_public ?? true,
    dispatch_ai_enabled: server?.dispatch_ai_enabled ?? false,
    smart_report_builder: server?.smart_report_builder ?? false,
    officer_safety_enabled: server?.officer_safety_enabled ?? false,
    email_notifications_enabled: server?.email_notifications_enabled ?? false,
    icon_url: server?.icon_url || '',
    ui_theme: server?.ui_theme || 'modern',
  });

  const [tones, setTones] = useState(server?.tones || getDefaultTones());

  const [appearance, setAppearance] = useState({
    theme: server?.theme || 'dark',
    custom_bg_url: server?.custom_bg_url || '',
    map_url: server?.map_url || '',
  });

  useEffect(() => {
    if (server) {
    setGeneral({ name: server.name || '', description: server.description || '', is_public: server.is_public ?? true, dispatch_ai_enabled: server.dispatch_ai_enabled ?? false, smart_report_builder: server.smart_report_builder ?? false, officer_safety_enabled: server.officer_safety_enabled ?? false, email_notifications_enabled: server.email_notifications_enabled ?? false, icon_url: server.icon_url || '', ui_theme: server.ui_theme || 'modern' });
      setTones(server.tones || getDefaultTones());
      setAppearance({ theme: server.theme || 'dark', custom_bg_url: server.custom_bg_url || '', map_url: server.map_url || '' });
    }
  }, [server]);

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.Server.update(serverId, {
      ...general,
      tones,
      ...appearance,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server'] }),
  });

  const handleBgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAppearance(a => ({ ...a, custom_bg_url: file_url }));
  };

  const handleMapUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setAppearance(a => ({ ...a, map_url: file_url }));
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setGeneral(g => ({ ...g, icon_url: file_url }));
    await base44.entities.Server.update(serverId, { icon_url: file_url });
    queryClient.invalidateQueries({ queryKey: ['server'] });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-white/60" />
          <h2 className="text-white font-bold text-lg">Server Settings</h2>
        </div>
        <CrimsonButton onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="h-9 text-sm">
          <Save size={14} className="mr-1" /> {saveMutation.isPending ? 'Saving...' : 'Save All'}
        </CrimsonButton>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-white/[0.04] border border-white/10 rounded-xl mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">General</TabsTrigger>
          <TabsTrigger value="tones" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <Volume2 size={13} className="mr-1.5" /> Tones
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <Palette size={13} className="mr-1.5" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="departments" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <Building2 size={13} className="mr-1.5" /> Departments
          </TabsTrigger>
          <TabsTrigger value="penal" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <Scale size={13} className="mr-1.5" /> Penal Code
          </TabsTrigger>
          <TabsTrigger value="map" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <Map size={13} className="mr-1.5" /> Map
          </TabsTrigger>
          <TabsTrigger value="training" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <GraduationCap size={13} className="mr-1.5" /> Training
          </TabsTrigger>
          <TabsTrigger value="livemap" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <Radio size={13} className="mr-1.5" /> Live Map
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <Bell size={13} className="mr-1.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="keyboard" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <Keyboard size={13} className="mr-1.5" /> Keyboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GlassCard>
            <div className="space-y-4">
              <div>
                <Label className="text-white/60">Server Name</Label>
                <Input value={general.name} onChange={e => setGeneral({ ...general, name: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-white/60">Description</Label>
                <Textarea value={general.description} onChange={e => setGeneral({ ...general, description: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl" rows={3} />
              </div>
              <div>
                <Label className="text-white/60">Invite Code</Label>
                <Input value={server?.invite_code || ''} readOnly className="bg-white/[0.03] border-white/10 text-white/50 mt-1 rounded-xl font-mono" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div>
                  <p className="text-white text-sm font-medium">Dispatch AI Assistant</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {general.dispatch_ai_enabled ? 'Enabled — Dispatchers can use the AI assistant' : 'Disabled — AI assistant is hidden from dispatchers'}
                  </p>
                </div>
                <button
                  onClick={() => setGeneral(g => ({ ...g, dispatch_ai_enabled: !g.dispatch_ai_enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${general.dispatch_ai_enabled ? 'bg-emerald-500' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${general.dispatch_ai_enabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div>
                  <p className="text-white text-sm font-medium flex items-center gap-1.5">
                    Smart Report Builder
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-crimson/10 text-crimson border border-crimson/20 font-semibold">NEW</span>
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {general.smart_report_builder ? 'Enabled — Report forms adapt based on type (traffic stop, arrest, fire, EMS)' : 'Disabled — All report types use the same form'}
                  </p>
                </div>
                <button
                  onClick={() => setGeneral(g => ({ ...g, smart_report_builder: !g.smart_report_builder }))}
                  className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${general.smart_report_builder ? 'bg-emerald-500' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${general.smart_report_builder ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div>
                  <p className="text-white text-sm font-medium flex items-center gap-1.5">
                    Officer Safety Alerts
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-crimson/10 text-crimson border border-crimson/20 font-semibold">NEW</span>
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {general.officer_safety_enabled ? 'Enabled — Safety alerts appear when officers search the database' : 'Disabled — No safety alerts shown during database searches'}
                  </p>
                </div>
                <button
                  onClick={() => setGeneral(g => ({ ...g, officer_safety_enabled: !g.officer_safety_enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${general.officer_safety_enabled ? 'bg-emerald-500' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${general.officer_safety_enabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div>
                  <p className="text-white text-sm font-medium">Email Notifications</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {general.email_notifications_enabled ? 'Enabled — Members can subscribe for session/training emails' : 'Disabled — Email notification subscriptions are hidden from members'}
                  </p>
                </div>
                <button
                  onClick={() => setGeneral(g => ({ ...g, email_notifications_enabled: !g.email_notifications_enabled }))}
                  className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${general.email_notifications_enabled ? 'bg-emerald-500' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${general.email_notifications_enabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div>
                  <p className="text-white text-sm font-medium">Server Visibility</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {general.is_public ? 'Public — Anyone can discover and join this server' : 'Private — Requires invite code to join'}
                  </p>
                </div>
                <button
                  onClick={() => setGeneral(g => ({ ...g, is_public: !g.is_public }))}
                  className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${general.is_public ? 'bg-emerald-500' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${general.is_public ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div>
                <Label className="text-white/60 flex items-center gap-1.5"><Monitor size={13} /> CAD Interface Theme</Label>
                <p className="text-white/30 text-[10px] mt-0.5 mb-2">Choose the visual style for your server's CAD. Applies to all users.</p>
                <Select value={general.ui_theme || 'modern'} onValueChange={v => setGeneral({ ...general, ui_theme: v })}>
                  <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectItem value="modern">Modern — Default glassmorphism</SelectItem>
                    <SelectItem value="retro">Retro — Early 2000s desktop</SelectItem>
                    <SelectItem value="tactical">Tactical — Military command</SelectItem>
                    <SelectItem value="eoc">EOC — Emergency operations (light)</SelectItem>
                    <SelectItem value="cyber">Cyber Ops — Futuristic neon</SelectItem>
                    <SelectItem value="firstresponder">First Responder — Department colors</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-white/20 text-[10px] mt-2 leading-relaxed">
                  <span className="text-white/35">Tactical:</span> matte black, olive green, amber accents, grid backgrounds. ·{' '}
                  <span className="text-white/35">EOC:</span> clean white &amp; navy, professional emergency management. ·{' '}
                  <span className="text-white/35">Cyber Ops:</span> dark charcoal, electric cyan, glass &amp; glow. ·{' '}
                  <span className="text-white/35">First Responder:</span> each department gets its own accent color (police=blue, fire=red, EMS=green, dispatch=gold).
                </p>
              </div>
              <div>
                <Label className="text-white/60">Server Icon</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/[0.06] border border-white/10 flex items-center justify-center">
                    {server?.icon_url ? <img src={server.icon_url} alt="" className="w-full h-full object-cover" /> : <span className="text-white/20 text-xl font-bold">{server?.name?.[0] || '?'}</span>}
                  </div>
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/10 flex items-center gap-2 text-sm transition-all">
                    <Camera size={14} /> Upload Icon
                    <input type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                  </label>
                </div>
              </div>
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="tones">
          <GlassCard>
            <p className="text-white/40 text-sm mb-4">Customize the names and sounds of dispatch tones for your server.</p>
            <div className="space-y-4">
              {Object.entries(tones).map(([key, tone]) => (
                <div key={key} className="grid grid-cols-3 gap-3 items-end">
                  <div>
                    <Label className="text-white/60 text-xs">Name</Label>
                    <Input
                      value={tone.name || ''}
                      onChange={e => setTones({ ...tones, [key]: { ...tone, name: e.target.value } })}
                      className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-white/60 text-xs">Sound</Label>
                    <Select value={tone.sound || key} onValueChange={v => setTones({ ...tones, [key]: { ...tone, sound: v } })}>
                      <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                        {toneOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    onClick={() => playTone(tone.sound || key)}
                    className="h-10 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/10 flex items-center gap-2 text-sm transition-all"
                  >
                    <Play size={13} /> Preview
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="appearance">
          <GlassCard>
            <p className="text-white/40 text-sm mb-4">Choose a theme or upload a custom background. Changes apply to all users in this server.</p>
            <div className="space-y-5">
              <div>
                <Label className="text-white/60">Theme</Label>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  {[
                    { key: 'dark', label: 'Dark', color: '#0B0B0B' },
                    { key: 'midnight', label: 'Midnight', color: '#0A0E1A' },
                    { key: 'futuristic', label: 'Futuristic', color: '#050A0F' },
                    { key: 'light', label: 'Light', color: '#F0F0F0' },
                  ].map(t => (
                    <button
                      key={t.key}
                      onClick={() => setAppearance({ ...appearance, theme: t.key })}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        appearance.theme === t.key ? 'border-crimson' : 'border-white/10 hover:border-white/20'
                      }`}
                      style={{ background: t.color }}
                    >
                      <span className={`text-sm font-medium ${t.key === 'light' ? 'text-black' : 'text-white'}`}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-white/60">Custom Background Image</Label>
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex-1 h-24 rounded-xl border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-crimson/40 transition-colors overflow-hidden">
                    {appearance.custom_bg_url ? (
                      <img src={appearance.custom_bg_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Camera size={20} className="mx-auto text-white/30 mb-1" />
                        <span className="text-white/30 text-xs">Upload image</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
                  </label>
                  {appearance.custom_bg_url && (
                    <CrimsonButton variant="ghost" onClick={() => setAppearance({ ...appearance, custom_bg_url: '' })} className="text-xs">
                      Remove
                    </CrimsonButton>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </TabsContent>
        <TabsContent value="departments">
          <GlassCard>
            <DepartmentManager serverId={serverId} />
          </GlassCard>
        </TabsContent>
        <TabsContent value="penal">
          <PenalCodeManager server={server} serverId={serverId} />
        </TabsContent>
        <TabsContent value="map">
          <GlassCard>
            <p className="text-white/40 text-sm mb-4">Upload a custom map image for your server. Members can view it in the Map tab.</p>
            <div className="space-y-4">
              <div>
                <label className="flex flex-col items-center justify-center w-full h-48 rounded-xl border border-dashed border-white/20 cursor-pointer hover:border-crimson/40 transition-colors overflow-hidden bg-white/[0.02]">
                  {appearance.map_url ? (
                    <img src={appearance.map_url} alt="Map" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <Map size={28} className="mx-auto text-white/20 mb-2" />
                      <span className="text-white/30 text-sm">Click to upload map image</span>
                      <p className="text-white/15 text-xs mt-1">PNG, JPG, or any image format</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleMapUpload} />
                </label>
                {appearance.map_url && (
                  <button onClick={() => setAppearance(a => ({ ...a, map_url: '' }))} className="mt-2 text-xs text-white/30 hover:text-red-400 transition-colors">
                    Remove map
                  </button>
                )}
              </div>
            </div>
          </GlassCard>
        </TabsContent>
        <TabsContent value="livemap">
          <LiveMapSettings server={server} serverId={serverId} />
        </TabsContent>
        <TabsContent value="training">
          <GlassCard>
            <TrainingEditor serverId={serverId} />
          </GlassCard>
        </TabsContent>
        <TabsContent value="notifications">
          <EmailNotifications
            server={server}
            serverId={serverId}
            user={user}
            isAdmin={isAdmin}
            isOwner={isOwner}
          />
        </TabsContent>
        <TabsContent value="keyboard">
          <GlassCard>
            <KeyboardShortcuts />
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}