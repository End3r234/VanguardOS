import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Zap, Shield, Star, CheckCircle, Lock } from 'lucide-react';
import VanguardLogo from '@/components/VanguardLogo';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';

export default function Marketplace() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: myServers = [] } = useQuery({
    queryKey: ['my-owned-servers', user?.email],
    queryFn: () => base44.entities.Server.filter({ owner_email: user?.email }),
    enabled: !!user?.email,
  });

  const hasPremium = myServers.some(s => s.server_tier === 'premium');

  const features = [
    { icon: GraduationCap, title: 'Full LMS Access', desc: 'Unlock 3-tier training programs for LEO, Fire, and Dispatch departments.' },
    { icon: Shield, title: 'Automated Cert Keys', desc: 'Members auto-receive dept access keys upon passing their LMS exams.' },
    { icon: Zap, title: 'Priority Support', desc: 'Skip the queue with dedicated support for premium server owners.' },
    { icon: Star, title: 'Premium Badge', desc: 'Premium crown badge displayed on your server card in the directory.' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <header className="border-b border-crimson/20 bg-[#1a0000]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="text-white/40 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
          <VanguardLogo size="sm" />
          <span className="text-white/30 text-sm">/ Vanguard Marketplace</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {hasPremium ? (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium mb-6">
              <Star size={14} /> Premium Active
            </div>
            <h1 className="text-4xl font-black text-white mb-3">You're on Premium</h1>
            <p className="text-white/40 text-lg">All features are unlocked for your server. Thank you for supporting VanguardOS!</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-crimson/10 border border-crimson/30 text-crimson text-sm font-medium mb-6">
                <Lock size={14} /> LMS Locked
              </div>
              <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
                Unlock the Full <span className="text-crimson">VanguardOS</span> Experience
              </h1>
              <p className="text-white/40 text-lg max-w-xl mx-auto">
                Upgrade to VanguardOS Premium to unlock the full Learning Management System and automated certification pipeline for your server.
              </p>
            </div>

            {/* CTA Card */}
            <div className="relative rounded-3xl overflow-hidden mb-10">
              <div className="absolute inset-0 bg-gradient-to-br from-crimson/20 via-crimson/5 to-transparent" />
              <div className="absolute inset-0 border border-crimson/30 rounded-3xl" />
              <div className="relative p-10 text-center">
                <div className="text-6xl font-black text-white mb-2">$9.99<span className="text-2xl font-medium text-white/40">/mo</span></div>
                <p className="text-white/40 mb-8">Per server. Cancel anytime.</p>
                <a
                  href="https://discord.gg/VdpRVJADWM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-crimson to-crimson-dark hover:from-crimson-light hover:to-crimson text-white rounded-xl font-inter font-semibold shadow-lg shadow-crimson/20 transition-all text-base px-10 py-3"
                >
                  <Zap size={16} /> Get Premium — $9.99/mo
                </a>
                <p className="text-white/20 text-xs mt-4">Join our Discord to purchase. Secure payment processed by staff.</p>
              </div>
            </div>
          </>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {features.map(({ icon: Icon, title, desc }) => (
            <GlassCard key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-crimson/10 border border-crimson/20 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-crimson" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white font-semibold text-sm">{title}</p>
                  {hasPremium && <CheckCircle size={12} className="text-emerald-400" />}
                </div>
                <p className="text-white/40 text-sm">{desc}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="text-center py-6">
          <p className="text-white/40 text-sm mb-1">💡 <span className="text-white/70 font-medium">Manual Access Still Available</span></p>
          <p className="text-white/30 text-xs max-w-md mx-auto">
            Even without Premium, server admins can manually grant department access keys to members in the Admin Panel → Dept Keys tab. Premium only automates this via LMS exam completion.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}