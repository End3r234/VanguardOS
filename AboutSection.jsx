import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Shield, Code2, Heart, Globe, Users, Zap, Radio, FileText, GraduationCap, MapPin, Bot, MessageSquare, ArrowRight } from 'lucide-react';

function ExpandableCard({ title, icon: Icon, iconColor, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.03] transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08]`}>
            <Icon size={15} className={iconColor} />
          </div>
          <span className="text-white font-semibold text-base">{title}</span>
        </div>
        {open
          ? <ChevronUp size={16} className="text-white/30" />
          : <ChevronDown size={16} className="text-white/30" />
        }
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-white/[0.06]">
          {children}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-3 text-center">
      <div className="text-white font-bold text-lg">{value}</div>
      <div className="text-white/40 text-xs mt-0.5">{label}</div>
    </div>
  );
}

function Feature({ icon: Icon, color, title, desc }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] flex-shrink-0 mt-0.5`}>
        <Icon size={13} className={color} />
      </div>
      <div>
        <p className="text-white text-sm font-medium">{title}</p>
        <p className="text-white/45 text-xs mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export default function AboutSection() {
  return (
    <div className="max-w-7xl mx-auto px-6 pb-16 relative z-10">
      <div className="mb-6">
        <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
          <Heart size={14} className="text-crimson" /> Learn More
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* About VanguardOS */}
        <ExpandableCard title="About VanguardOS" icon={Shield} iconColor="text-crimson" defaultOpen={false}>
          <div className="mt-4 space-y-4">
            <p className="text-white/60 text-sm leading-relaxed">
              VanguardOS is a full-featured, web-based <span className="text-white font-medium">Computer-Aided Dispatch (CAD)</span> and emergency services management platform designed exclusively for FiveM, Roblox RP, and other online roleplay communities. It brings the realism and structure of professional dispatch systems to the gaming world.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <Stat label="Modules" value="10+" />
              <Stat label="Dept. Types" value="4" />
              <Stat label="Penal Charges" value="91" />
            </div>

            <div className="mt-2">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-3">Core Modules</p>
              <Feature icon={Radio} color="text-emerald-400" title="Live Dispatch Board" desc="Real-time call management with priority sorting, unit assignment, tone alerts, and Signal 100 protocol." />
              <Feature icon={Shield} color="text-blue-400" title="Law Enforcement Panel" desc="Full LEO operations: status tracking, civilian database lookups, traffic stop protocols, and incident reporting." />
              <Feature icon={Zap} color="text-orange-400" title="Fire & EMS Panel" desc="Apparatus management, ICS protocol support, and response documentation for fire and medical units." />
              <Feature icon={Users} color="text-teal-400" title="Civilian Panel" desc="Multi-character creation with vehicle registration, license tracking, and full records visible to law enforcement." />
              <Feature icon={GraduationCap} color="text-yellow-400" title="Training & Certification (LMS)" desc="Tiered training modules with exam-based certification per department, plus custom module creation for server owners." />
              <Feature icon={FileText} color="text-purple-400" title="Incident Reports" desc="Typed report submission workflow with supervisor approval/rejection and narrative logging." />
              <Feature icon={MapPin} color="text-pink-400" title="Live Dispatch Map" desc="Interactive real-time map with department-colored unit pins, postal auto-detection, position history, and AI-powered custom map extraction." />
              <Feature icon={MessageSquare} color="text-rose-400" title="Direct Messaging" desc="Dispatchers can DM on-duty units from the live map with real-time delivery and unread badges." />
              <Feature icon={Bot} color="text-violet-400" title="AI Dispatch Assistant" desc="Optional AI assistant for dispatchers that understands your live call queue and unit statuses in real time." />
            </div>

            <p className="text-white/40 text-xs leading-relaxed border-t border-white/[0.06] pt-4">
              VanguardOS is not affiliated with any real-world law enforcement, fire, or emergency medical agency. It is a simulation platform designed purely for immersive online roleplay.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 mt-2 text-sm font-semibold text-crimson hover:text-crimson-light transition-colors"
            >
              Read the full VanguardOS story <ArrowRight size={13} />
            </Link>
          </div>
        </ExpandableCard>

        {/* About the Developer */}
        <ExpandableCard title="About the Developer" icon={Code2} iconColor="text-blue-400" defaultOpen={false}>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 flex-shrink-0 bg-black/30">
                <img
                  src="https://media.base44.com/images/public/69c6a8c8b372cbc680406011/242b575f9_Screenshot2026-01-04154836.png"
                  alt="End3r234"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">End3r234</p>
                <p className="text-white/40 text-xs mt-0.5">Independent Developer</p>
                <p className="text-white/30 text-xs">Built for the Roleplay Community</p>
              </div>
            </div>

            <p className="text-white/60 text-sm leading-relaxed">
              VanguardOS was designed and built by <span className="text-white font-medium">End3r234</span>, a solo developer deeply embedded in the FiveM and Roblox roleplay communities. Frustrated by the limitations and clunky UX of existing CAD tools, the goal was simple: build something that actually feels modern, works reliably, and is genuinely enjoyable to use during an active session.
            </p>

            <p className="text-white/60 text-sm leading-relaxed">
              Every feature in VanguardOS was built from real experience running and participating in RP servers — from the dispatch tone system to the supervisor report review flow to the Signal 100 protocol. <span className="text-white font-medium">It's designed by a roleplayer, for roleplayers.</span>
            </p>

            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-3">Tech Stack</p>
              {[
                { label: 'Frontend', value: 'React + Tailwind CSS' },
                { label: 'Backend / DB', value: 'Base44 Platform' },
                { label: 'Real-time', value: 'Live entity subscriptions' },
                { label: 'Audio', value: 'Web Audio API (custom tone engine)' },
                { label: 'AI', value: 'LLM-powered dispatch assistant' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <span className="text-white/35">{label}</span>
                  <span className="text-white/70 font-medium">{value}</span>
                </div>
              ))}
            </div>

            <p className="text-white/60 text-sm leading-relaxed">
              VanguardOS is continuously updated based on community feedback. Bug reports, feature requests, and general suggestions are always welcome through the <span className="text-white font-medium">Bug Reports</span> page. The platform is free to use, with premium tiers planned for advanced server features.
            </p>

            <div className="flex items-center gap-2 text-xs text-white/30 border-t border-white/[0.06] pt-3">
              <Heart size={11} className="text-crimson" />
              <span>Made with care for the RP community. Thank you for using VanguardOS.</span>
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 mt-1 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Meet the developer — full story <ArrowRight size={13} />
            </Link>
          </div>
        </ExpandableCard>

      </div>
    </div>
  );
}