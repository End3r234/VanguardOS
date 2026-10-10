import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, Save, User, Palette, Award, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VanguardLogo from '@/components/VanguardLogo';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import PlatformBadge from '@/components/PlatformBadge';
import { PLATFORM_BADGES } from '@/lib/platformAuth';

export default function Profile() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: profiles = [] } = useQuery({
    queryKey: ['my-profile', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const profile = profiles[0];
  const [form, setForm] = useState({ display_name: '', bio: '', badge: '', accent_color: '#CE0000' });

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || user?.full_name || '',
        bio: profile.bio || '',
        badge: profile.badge || '',
        accent_color: profile.accent_color || '#CE0000',
      });
    } else if (user) {
      setForm(f => ({ ...f, display_name: user.full_name || '' }));
    }
  }, [profile, user]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (profile) return base44.entities.UserProfile.update(profile.id, form);
      return base44.entities.UserProfile.create({ ...form, user_email: user.email });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-profile'] }),
  });

  const [localUrls, setLocalUrls] = useState({});

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setLocalUrls(u => ({ ...u, [field]: localPreview }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (profile?.id) {
      await base44.entities.UserProfile.update(profile.id, { [field]: file_url });
    } else {
      await base44.entities.UserProfile.create({ user_email: user.email, display_name: user.full_name || '', [field]: file_url });
    }
    setLocalUrls(u => ({ ...u, [field]: file_url }));
    queryClient.invalidateQueries({ queryKey: ['my-profile'] });
  };

  const accentColors = ['#CE0000', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
  const grantedBadges = profile?.platform_badges || [];

  const ROLE_META = {
    cad_moderator: { label: 'CAD Moderator', color: '#3B82F6' },
    developer: { label: 'Developer', color: '#10B981' },
    global_mod: { label: 'Global Mod', color: '#8B5CF6' },
    admin: { label: 'Admin', color: '#EF4444' },
    moderator: { label: 'Moderator', color: '#3B82F6' },
    owner: { label: 'Owner', color: '#FFD700' },
    community_manager: { label: 'Community Manager', color: '#A78BFA' },
  };
  const roleMeta = ROLE_META[profile?.global_role];

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <header className="border-b border-white/[0.06] bg-[#0B0B0B]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white/40 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
            <VanguardLogo size="sm" />
          </div>
          <CrimsonButton onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="h-9 px-4 text-sm">
            <Save size={14} className="mr-1" /> {saveMutation.isPending ? 'Saving...' : 'Save'}
          </CrimsonButton>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Preview Card */}
        <GlassCard className="mb-8 overflow-hidden p-0">
          <div className="h-32 relative overflow-hidden" style={{ background: (localUrls.banner_url || profile?.banner_url) ? `url(${localUrls.banner_url || profile.banner_url}) center/cover no-repeat` : `linear-gradient(135deg, ${form.accent_color}33, #0B0B0B)`, backgroundSize: 'cover' }}>
            <label className="absolute bottom-2 right-2 p-2 rounded-xl bg-black/60 backdrop-blur cursor-pointer hover:bg-black/80 transition-all flex items-center gap-1.5 text-xs text-white font-medium z-10">
              <Camera size={13} className="text-white" /> Change Banner
              <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, 'banner_url')} />
            </label>
          </div>
          <div className="px-6 pb-6 -mt-10 relative">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-2xl border-4 border-[#0B0B0B] overflow-hidden bg-zinc-800">
                {(localUrls.avatar_url || profile?.avatar_url) ? <img src={localUrls.avatar_url || profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User size={28} className="text-white/30" /></div>}
              </div>
              <label className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-crimson cursor-pointer hover:bg-crimson-light transition">
                <Camera size={10} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload(e, 'avatar_url')} />
              </label>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-white font-bold text-xl">{form.display_name || 'Your Name'}</h2>
                {roleMeta && (
                  <span className="text-xs px-2 py-0.5 rounded-md font-medium border" style={{ color: roleMeta.color, borderColor: roleMeta.color + '50', background: roleMeta.color + '18' }}>{roleMeta.label}</span>
                )}
              </div>
              <p className="text-white/40 text-sm">{user?.email}</p>
              {/* Platform Badges */}
              {grantedBadges.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {grantedBadges.map(b => <PlatformBadge key={b} badgeKey={b} />)}
                </div>
              )}
              {form.badge && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-md border" style={{ borderColor: form.accent_color + '60', color: form.accent_color, background: form.accent_color + '15' }}>
                  {form.badge}
                </span>
              )}
            </div>
          </div>
        </GlassCard>

        <Tabs defaultValue="info">
          <TabsList className="bg-white/[0.04] border border-white/10 rounded-xl mb-6">
            <TabsTrigger value="info" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">Info</TabsTrigger>
            <TabsTrigger value="customize" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">Customize</TabsTrigger>
            <TabsTrigger value="badges" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
              <Star size={12} className="mr-1" /> Badges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <GlassCard>
              <div className="space-y-4">
                <div>
                  <Label className="text-white/60">Display Name</Label>
                  <Input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl" />
                </div>
                <div>
                  <Label className="text-white/60">Bio</Label>
                  <Textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl" rows={3} placeholder="Tell others about yourself..." />
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="customize">
            <GlassCard>
              <div className="space-y-5">
                <div>
                  <Label className="text-white/60 flex items-center gap-1.5"><Award size={13} /> Role Badge</Label>
                  <Input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl" placeholder="e.g. Sergeant, Lead Dispatcher" />
                </div>
                <div>
                  <Label className="text-white/60 flex items-center gap-1.5"><Palette size={13} /> Accent Color</Label>
                  <div className="flex gap-2 mt-2">
                    {accentColors.map(color => (
                      <button key={color} onClick={() => setForm({ ...form, accent_color: color })}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${form.accent_color === color ? 'border-white scale-110' : 'border-transparent hover:border-white/30'}`}
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="badges">
            <GlassCard>
              <p className="text-white/40 text-sm mb-4">Platform badges are granted by VanguardOS staff. They appear on your profile across all servers.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(PLATFORM_BADGES).map(([key, def]) => {
                  const has = grantedBadges.includes(key);
                  return (
                    <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${has ? 'border-white/20 bg-white/[0.06]' : 'border-white/[0.06] opacity-40'}`}>
                      <PlatformBadge badgeKey={key} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white/60 text-xs">{def.description}</p>
                      </div>
                      {has && <span className="text-emerald-400 text-xs">✓ Earned</span>}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}