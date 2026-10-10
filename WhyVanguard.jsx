import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Bot, Monitor, GraduationCap, MapPin, Globe, Shield, Palette, Sparkles } from 'lucide-react';

const COMPARISONS = [
  {
    icon: Bot,
    feature: 'AI Assisted Dispatch',
    vanguard: 'Built-in AI assistant with live call & unit context',
    traditional: 'No AI — fully manual dispatch',
  },
  {
    icon: Monitor,
    feature: 'Modern Interface',
    vanguard: 'Glassmorphism design, Inter + Rajdhani typography',
    traditional: 'Outdated, clunky 2012-era UI',
  },
  {
    icon: GraduationCap,
    feature: 'Built-in LMS',
    vanguard: 'Tiered training modules with exams & certifications',
    traditional: 'External Google Docs or Discord pins',
  },
  {
    icon: MapPin,
    feature: 'Live Maps',
    vanguard: 'Real-time unit pins, position history & DMs',
    traditional: 'Static images or no map at all',
  },
  {
    icon: Globe,
    feature: 'Server Discovery',
    vanguard: 'Built-in public server directory with verified badges',
    traditional: 'Manual invites & Discord advertising only',
  },
  {
    icon: Shield,
    feature: 'Department Management',
    vanguard: 'Full RBAC with per-department keys & roles',
    traditional: 'Basic or no role management',
  },
  {
    icon: Palette,
    feature: 'Custom Themes',
    vanguard: 'Modern & Retro themes, custom backgrounds',
    traditional: 'No theming options',
  },
];

export default function WhyVanguard() {
  return (
    <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-crimson/20 bg-crimson/10 text-crimson text-xs font-semibold uppercase tracking-widest mb-4">
          <Sparkles size={11} /> Why VanguardOS
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight mb-3">
          Why Communities Choose <span className="text-crimson">VanguardOS</span>
        </h2>
        <p className="text-white/40 max-w-lg mx-auto text-sm">
          See how VanguardOS stacks up against traditional CAD systems used by roleplay communities.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_1fr_1fr] sm:grid-cols-[2fr_1.5fr_1.5fr] border-b border-white/[0.08]">
          <div className="p-4 sm:p-5">
            <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">Feature</span>
          </div>
          <div className="p-4 sm:p-5 border-l border-white/[0.08] bg-crimson/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-crimson" />
              <span className="text-white font-bold text-sm">VanguardOS</span>
            </div>
          </div>
          <div className="p-4 sm:p-5 border-l border-white/[0.08]">
            <span className="text-white/40 font-bold text-sm">Traditional CAD</span>
          </div>
        </div>

        {/* Comparison rows */}
        {COMPARISONS.map((row, i) => {
          const Icon = row.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`grid grid-cols-[1fr_1fr_1fr] sm:grid-cols-[2fr_1.5fr_1.5fr] ${i < COMPARISONS.length - 1 ? 'border-b border-white/[0.04]' : ''}`}
            >
              <div className="p-4 sm:p-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.05] border border-white/[0.08] flex-shrink-0">
                  <Icon size={14} className="text-white/60" />
                </div>
                <span className="text-white font-medium text-sm">{row.feature}</span>
              </div>
              <div className="p-4 sm:p-5 border-l border-white/[0.04] bg-crimson/[0.03] flex items-start gap-2.5">
                <Check size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-white/70 text-xs sm:text-sm leading-relaxed">{row.vanguard}</span>
              </div>
              <div className="p-4 sm:p-5 border-l border-white/[0.04] flex items-start gap-2.5">
                <X size={16} className="text-white/25 flex-shrink-0 mt-0.5" />
                <span className="text-white/35 text-xs sm:text-sm leading-relaxed">{row.traditional}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}