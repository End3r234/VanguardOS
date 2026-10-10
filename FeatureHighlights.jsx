import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Shield, Flame, User, GraduationCap, MapPin, Settings, Star, FileText, Globe, MessageSquare, Palette, Bot } from 'lucide-react';

const FEATURES = [
  {
    icon: Radio,
    color: '#10B981',
    title: 'Live Dispatch Board',
    description: 'Manage incoming calls in real-time with priority levels, unit assignment, tone alerts, and live status tracking across all departments.',
    tags: ['P1–P4 Priorities', 'Tone Alerts', 'Unit Assignment'],
    screenshot: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/c571c88a6_Screenshot2026-04-03102750.png',
  },
  {
    icon: Shield,
    color: '#3B82F6',
    title: 'Law Enforcement Panel',
    description: 'Full LEO toolkit — go on duty, run plates & civilians through the database, write incident reports, and track arrests.',
    tags: ['Database Search', 'Incident Reports', 'Traffic Stops'],
    screenshot: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/d2a156968_Screenshot2026-04-03102842.png',
  },
  {
    icon: Flame,
    color: '#F97316',
    title: 'Fire & EMS Operations',
    description: 'Fire and EMS units can respond to calls, update apparatus status, and file detailed operational reports.',
    tags: ['Apparatus Tracking', 'EMS Reports', 'Multi-Unit Response'],
    screenshot: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/a7d792d30_Screenshot2026-04-03102857.png',
  },
  {
    icon: User,
    color: '#06B6D4',
    title: 'Civilian Characters',
    description: 'Create detailed civilian profiles with full physical descriptions, driver\'s licenses, vehicles, and insurance records.',
    tags: ['Character Builder', 'License Plates', 'Criminal History'],
    screenshot: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/8977c472b_Screenshot2026-04-03103011.png',
  },
  {
    icon: GraduationCap,
    color: '#8B5CF6',
    title: 'Training & Certifications',
    description: 'Complete structured training modules for LEO, Fire, and Dispatch. Pass exams to unlock department access tiers.',
    tags: ['Tiered Curriculum', 'Exams', 'Certifications'],
    screenshot: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/4666110c0_Screenshot2026-04-03104509.png',
  },
  {
    icon: MapPin,
    color: '#F59E0B',
    title: 'Live Dispatch Map',
    description: 'Interactive real-time map with department-colored unit pins, postal/street auto-detection, position history tracking, and ER:LC + Los Santos presets. Custom uploads with AI street extraction.',
    tags: ['Unit Pins', 'Position History', 'AI Extraction'],
    screenshot: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/88fb04f09_Screenshot2026-04-03103148.png',
  },
  {
    icon: MessageSquare,
    color: '#EC4899',
    title: 'Dispatcher Direct Messaging',
    description: 'Dispatchers can send real-time direct messages to on-duty units from the live map. Unread badge counts, conversation threads, and instant delivery.',
    tags: ['Real-Time DMs', 'Unread Badges', 'Unit Threads'],
    screenshot: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/f7d5a267a_Screenshot2026-04-03103205.png',
  },
  {
    icon: Bot,
    color: '#A855F7',
    title: 'AI Dispatch Assistant',
    description: 'An optional AI agent embedded in the dispatch panel with live context awareness — summaries, assignment suggestions, and tactical queries in real time.',
    tags: ['Live Context', 'Smart Suggestions', 'Call Summaries'],
    screenshot: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/529d954cf_Screenshot2026-04-03103249.png',
  },
  {
    icon: Palette,
    color: '#CE0000',
    title: 'Modern & Retro Themes',
    description: 'Choose between a sleek modern glassmorphism look or an early-2000s retro desktop aesthetic with beveled panels and gradient title bars.',
    tags: ['Modern UI', 'Retro 2000s', 'Server-Wide'],
    screenshot: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/57b7db9e0_Screenshot2026-04-03103227.png',
  },
  {
    icon: Globe,
    color: '#06B6D4',
    title: 'Public Server Discovery',
    description: 'Browse and join public roleplay servers. Verified servers get highlighted. Private servers require an invite code.',
    tags: ['Verified Servers', 'Invite Codes', 'Server Directory'],
    screenshot: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/529d954cf_Screenshot2026-04-03103249.png',
  },
  {
    icon: Settings,
    color: '#6B7280',
    title: 'Full Server Control',
    description: 'Owners configure departments, 91-charge penal code, dispatch tones, themes, live maps, and member access — all from one settings panel.',
    tags: ['Custom Departments', 'Penal Code Editor', 'Role Management'],
    screenshot: 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/57b7db9e0_Screenshot2026-04-03103227.png',
  },
];

const ROLES = ['a Police Officer', 'a Firefighter', 'a Dispatcher', 'an EMT', 'a Civilian', null];
const ROLE_COLORS = ['#3B82F6', '#F97316', '#10B981', '#EC4899', '#06B6D4', '#CE0000'];

function CyclingText() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % ROLES.length);
        setVisible(true);
      }, 300);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const role = ROLES[index];
  const color = ROLE_COLORS[index];

  return (
    <div className="text-center mt-8 mb-2 h-12 flex items-center justify-center">
      <span
        className="text-xl font-bold transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-6px)',
          color,
        }}
      >
        {role ? `Become ${role} →` : '— VanguardOS has it all'}
      </span>
    </div>
  );
}

export default function FeatureHighlights() {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">
          <Star size={11} /> Platform Features
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight mb-3">
          Everything you need to{' '}
          <span className="text-crimson">run the scene</span>
        </h2>
        <p className="text-white/40 max-w-lg mx-auto text-sm">
          From dispatch to civilian records — VanguardOS is a complete CAD ecosystem built for serious roleplay communities.
        </p>
        <CyclingText />
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((feature, i) => {
          const Icon = feature.icon;
          const isHovered = hovered === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-300 cursor-default overflow-hidden flex flex-col"
              style={{
                borderColor: isHovered ? feature.color + '40' : undefined,
                background: isHovered ? feature.color + '08' : undefined,
              }}
            >
              {/* Glow */}
              {isHovered && (
                <div
                  className="absolute inset-0 pointer-events-none rounded-2xl opacity-20"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${feature.color}40, transparent 70%)` }}
                />
              )}

              <div className="relative flex-1">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: feature.color + '18', border: `1px solid ${feature.color}30` }}
                >
                  <Icon size={18} style={{ color: feature.color }} />
                </div>

                <h3 className="text-white font-bold text-sm mb-2">{feature.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed mb-4">{feature.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {feature.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ color: feature.color, background: feature.color + '15', border: `1px solid ${feature.color}25` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Screenshot */}
              {feature.screenshot && (
                <div className="relative mt-2 rounded-xl overflow-hidden border border-white/[0.06]" style={{ height: '140px' }}>
                  <img
                    src={feature.screenshot}
                    alt={feature.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500"
                    style={{
                      filter: `brightness(0.85) saturate(1.1)`,
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    }}
                  />
                  {/* Gradient overlay for fade effect */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom, transparent 40%, ${feature.color}18 100%), linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)`,
                    }}
                  />
                  <div
                    className="absolute bottom-0 left-0 right-0 h-8"
                    style={{ background: 'linear-gradient(to top, rgba(11,11,11,0.9), transparent)' }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}