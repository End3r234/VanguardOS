import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Shield, Flame, Radio, Lock, CheckCircle2 } from 'lucide-react';
import VanguardLogo from '@/components/VanguardLogo';
import GlassCard from '@/components/GlassCard';
import { LEO_TRAINING, FIRE_TRAINING, DISPATCH_TRAINING } from '@/lib/trainingContent';
import { GOD_MODE_EMAIL } from '@/lib/platformAuth';

export default function LMS() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: certs = [] } = useQuery({
    queryKey: ['my-certs', user?.email],
    queryFn: () => base44.entities.UserCertification.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['my-profile-lms', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const profile = profiles[0];
  const hasGlobalBypass = (user?.email === GOD_MODE_EMAIL) || (profile && ['developer', 'global_mod', 'admin', 'cad_moderator'].includes(profile.global_role));

  const tracks = [
    { key: 'leo', training: LEO_TRAINING, icon: Shield, color: 'text-blue-400', bgColor: 'bg-blue-500/10 border-blue-500/20', certKey: 'police_key', tierKey: 'leo_tier' },
    { key: 'fire', training: FIRE_TRAINING, icon: Flame, color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/20', certKey: 'fire_key', tierKey: 'fire_tier' },
    { key: 'dispatch', training: DISPATCH_TRAINING, icon: Radio, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20', certKey: 'dispatch_key', tierKey: 'dispatch_tier' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <header className="border-b border-crimson/20 bg-[#1a0000]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="text-white/40 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
          <VanguardLogo size="sm" />
          <span className="text-white/30 text-sm">/ VanguardOS Training</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-crimson/20 to-crimson/5 border border-crimson/20 flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={28} className="text-crimson" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">VanguardOS Training Academy</h1>
          <p className="text-white/40 max-w-md mx-auto">Complete certification tracks to unlock department access across servers.</p>
          {hasGlobalBypass && (
            <span className="inline-block mt-3 text-xs px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Global Bypass Active — Full Access
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tracks.map(({ key, training, icon: Icon, color, bgColor, certKey, tierKey }) => {
            const maxTier = Math.max(...(certs.map(c => c[tierKey] || 0)), 0);
            const certified = hasGlobalBypass || certs.some(c => c[certKey]);
            const totalTiers = training.tiers.length;

            return (
              <GlassCard key={key} className="flex flex-col">
                <div className={`w-12 h-12 rounded-xl ${bgColor} border flex items-center justify-center mb-4`}>
                  <Icon size={22} className={color} />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{training.name}</h3>
                <p className="text-white/30 text-sm mb-4 flex-1">{totalTiers} tier{totalTiers !== 1 ? 's' : ''} of training</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/40 mb-1.5">
                    <span>Progress</span>
                    <span>{maxTier}/{totalTiers}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full bg-crimson rounded-full transition-all" style={{ width: `${(maxTier / totalTiers) * 100}%` }} />
                  </div>
                </div>

                {certified && (
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs mb-3">
                    <CheckCircle2 size={13} /> Certified
                  </div>
                )}

                <div className="space-y-1.5">
                  {training.tiers.map(tier => {
                    const unlocked = hasGlobalBypass || maxTier >= tier.level;
                    const current = maxTier === tier.level - 1;
                    return (
                      <Link
                        key={tier.level}
                        to={`/training/${key}/${tier.level}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          current
                            ? 'bg-crimson/10 border border-crimson/30 text-crimson'
                            : unlocked
                              ? 'bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'
                              : 'bg-white/[0.02] text-white/20 cursor-not-allowed'
                        }`}
                      >
                        {unlocked ? <CheckCircle2 size={13} /> : <Lock size={13} />}
                        Tier {tier.level}: {tier.name.split('—')[0].trim()}
                      </Link>
                    );
                  })}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}