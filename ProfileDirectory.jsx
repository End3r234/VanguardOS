import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, User, Clock, Server } from 'lucide-react';
import { Input } from '@/components/ui/input';
import VanguardLogo from '@/components/VanguardLogo';
import GlassCard from '@/components/GlassCard';
import PlatformBadge from '@/components/PlatformBadge';
import ProfileReviewModal from '@/components/profile/ProfileReviewModal';

const ROLE_STYLES = {
  developer: { label: 'Developer', color: '#10B981' },
  admin: { label: 'Admin', color: '#CE0000' },
  global_mod: { label: 'Global Mod', color: '#8B5CF6' },
  cad_moderator: { label: 'CAD Mod', color: '#3B82F6' },
  moderator: { label: 'Moderator', color: '#F59E0B' },
  user: null,
};

export default function ProfileDirectory() {
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: profiles = [], isLoading: loadingProfiles } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 200),
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    refetchInterval: 5 * 60 * 1000,
  });

  const isLoading = loadingProfiles || loadingUsers;

  useEffect(() => {
    const unsub = base44.entities.UserProfile.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['all-profiles'] });
    });
    return unsub;
  }, [queryClient]);

  // Merge: for users without a profile, create a stub entry
  const profilesByEmail = new Map(profiles.map(p => [p.user_email, p]));
  const mergedMembers = [
    ...profiles,
    ...allUsers
      .filter(u => !profilesByEmail.has(u.email))
      .map(u => ({
        id: `stub-${u.email}`,
        user_email: u.email,
        display_name: u.full_name || u.email?.split('@')[0] || 'Unknown',
        global_role: u.role || 'user',
        platform_badges: [],
        accent_color: '#CE0000',
        _isStub: true,
      })),
  ];

  const filtered = mergedMembers.filter(p =>
    !search || (p.display_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <header className="border-b border-crimson/20 bg-[#1a0000]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="text-white/40 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
          <VanguardLogo size="sm" />
          <span className="text-white/30 text-sm">/ Directory</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white font-black text-2xl">Member Directory</h1>
            <p className="text-white/30 text-sm mt-0.5">{mergedMembers.length} registered members</p>
          </div>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search members..."
              className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl h-9 text-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="rounded-2xl glass h-48 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const roleStyle = ROLE_STYLES[p.global_role];
              const badges = p.platform_badges || [];
              return (
                <GlassCard key={p.id} className="overflow-hidden p-0 hover:scale-[1.01] transition-transform cursor-pointer" onClick={() => setSelectedProfile(p)}>
                  {/* Banner */}
                  <div className="h-20 relative overflow-hidden" style={{ background: p.banner_url ? `url(${p.banner_url}) center/cover` : `linear-gradient(135deg, ${p.accent_color || '#CE0000'}44, #0B0B0B)` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {roleStyle && (
                      <div className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-md font-bold" style={{ background: roleStyle.color + '25', color: roleStyle.color, border: `1px solid ${roleStyle.color}40` }}>
                        {roleStyle.label}
                      </div>
                    )}
                  </div>

                  <div className="px-4 pb-4 -mt-7 relative">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-2xl border-2 border-[#0B0B0B] overflow-hidden bg-zinc-800 mb-2 shadow-lg" style={{ borderColor: p.accent_color || '#CE0000' }}>
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-900">
                          <User size={20} className="text-white/40" />
                        </div>
                      )}
                    </div>

                    {/* Name (no email for privacy) */}
                    <h3 className="text-white font-bold text-sm leading-tight">{p.display_name || 'Unknown'}</h3>

                    {/* Bio */}
                    {p.bio && <p className="text-white/40 text-xs mb-2 line-clamp-2 leading-relaxed">{p.bio}</p>}

                    {/* Stats row */}
                    <div className="flex items-center gap-3 mb-2 text-[10px] text-white/30">
                      {p.total_hours > 0 && (
                        <span className="flex items-center gap-1"><Clock size={9} />{p.total_hours}h</span>
                      )}
                      {p.servers_joined > 0 && (
                        <span className="flex items-center gap-1"><Server size={9} />{p.servers_joined} servers</span>
                      )}
                    </div>

                    {/* Badges */}
                    {badges.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {badges.map(b => <PlatformBadge key={b} badgeKey={b} small />)}
                      </div>
                    )}
                    {p.badge && !badges.length && (
                      <span className="inline-block text-[9px] px-1.5 py-0.5 rounded border" style={{ borderColor: (p.accent_color || '#CE0000') + '50', color: p.accent_color || '#CE0000', background: (p.accent_color || '#CE0000') + '10' }}>
                        {p.badge}
                      </span>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

      <ProfileReviewModal
        profile={selectedProfile}
        currentUser={user}
        onClose={() => setSelectedProfile(null)}
      />

        {filtered.length === 0 && !isLoading && (
          <GlassCard className="text-center py-16">
            <User size={40} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40">No members found.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}