import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VanguardLogo from '@/components/VanguardLogo';
import { openAIAssistant } from '@/lib/openAIAssistant';
import {
  Shield, Code2, Heart, Radio, Flame, Users, GraduationCap, FileText,
  MapPin, Bot, ArrowLeft, ExternalLink, Zap, ChevronDown, Star,
  Cpu, Globe, BookOpen, Bug, Layers, Lock, Clock, Terminal,
  CheckCircle2, Sparkles
} from 'lucide-react';

const CAD_PREVIEW_URL = 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/5d25846ac_imgref2.png';
const DEV_IMG_URL = 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/242b575f9_Screenshot2026-01-04154836.png';
const VOS_LOGO_BG = 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/b5d5b432b_Untitleddesign17.png';

function Section({ children, className = '' }) {
  return (
    <section className={`max-w-4xl mx-auto px-6 py-20 ${className}`}>
      {children}
    </section>
  );
}

function Tag({ children, color = 'bg-crimson/20 text-crimson border-crimson/30' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${color}`}>
      {children}
    </span>
  );
}

function Divider() {
  return <div className="border-t border-white/[0.06] my-8" />;
}

function FeatureBlock({ icon: Icon, color, title, body }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08] flex-shrink-0`}>
        <Icon size={16} className={color} />
      </div>
      <div>
        <p className="text-white font-semibold text-sm">{title}</p>
        <p className="text-white/50 text-sm mt-1 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function Timeline({ items }) {
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${item.done ? 'bg-crimson' : 'bg-white/20'}`} />
            {i < items.length - 1 && <div className="w-px flex-1 bg-white/[0.06] my-1" />}
          </div>
          <div className="pb-6">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-white font-semibold text-sm">{item.title}</span>
              {item.done && <CheckCircle2 size={12} className="text-emerald-400" />}
              {item.tag && <Tag color={item.done ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/10 text-white/40 border-white/10'}>{item.tag}</Tag>}
            </div>
            <p className="text-white/50 text-sm leading-relaxed">{item.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const TIMELINE = [
  {
    title: 'Concept & Research',
    body: 'Frustrated with fragmented, outdated CAD tools, End3r234 began drafting what VanguardOS would look like from the ground up — pulling from real FiveM server experience and years of roleplay participation.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Core CAD Architecture',
    body: 'The foundational data model was built — Servers, Units, Calls, and Members. Real-time subscriptions via live entity sync were wired in from day one, making live dispatch the primary experience.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Dispatch Panel & Tone Engine',
    body: 'The dispatch board shipped with priority queuing, P1–P4 call cards, unit assignment flows, and a fully custom Web Audio API tone engine for standard, priority, and emergency alerts.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Law Enforcement Panel',
    body: 'The full LEO panel launched — including on-duty management, callsign/rank/RP name tracking, status codes (10-8 through 10-42), civilian database lookups, vehicle plate searches, and incident reporting with supervisor review.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Fire / EMS Panel',
    body: 'Fire and EMS operations panel shipped — with apparatus type selection, ICS-aligned protocols, and department-specific incident report types for structured scene documentation.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Civilian Panel & Database',
    body: 'Multi-character civilian support arrived — personal profiles with physical descriptions, DL status, vehicle registration, and flags. All data queryable in real time by LEO units during active stops.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Training & LMS',
    body: 'The learning management system launched with tiered certification per department (LEO, Fire, EMS, Dispatch). Server owners can create custom training modules with Markdown content and multiple-choice exam questions.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Radio Channel System',
    body: 'In-CAD radio channels with department-restricted access, real-time participant tracking, and admin-controlled channel creation. Ties directly into the dispatch audio tone engine.',
    done: true, tag: 'Complete',
  },
  {
    title: 'AI Dispatch Assistant',
    body: 'The optional AI assistant agent launched — understanding your live call queue, unit statuses, and server context in real time. Helps dispatchers generate summaries, suggest assignments, and answer tactical questions.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Profile & Community Directory',
    body: 'Platform-wide user profiles with badge systems, community reviews, rating scores, and a searchable member directory. The first social layer of VanguardOS.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Live Dispatch Map System',
    body: 'The full live map system shipped — interactive unit pins color-coded by department with logos, real-time position tracking, postal/street auto-detection, configurable ping intervals, and ER:LC + Los Santos preset maps. Later un-gated from premium to free for all servers.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Custom Maps & AI Street Extraction',
    body: 'Server owners can upload custom map images and use AI to automatically extract all visible street names, postal codes, and coordinates. The AI enforces 200+ locations per scan with grid-based coordinate estimation and area-naming for ambiguous regions.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Dispatcher-to-Unit Direct Messaging',
    body: 'A real-time DM system was added to the live dispatch map. Dispatchers can message any on-duty unit directly — messages deliver instantly with unread badge counts. The DM button is visible to dispatch, police, fire, and EMS personnel.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Unit Position History',
    body: 'A dedicated tracking system logs every position update a unit makes on the live map. Dispatchers can open a retrospective movement trail for any unit — timestamps, coordinates, and nearest postal/street — creating a full audit trail of activity during a session.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Retro CAD Theme',
    body: 'A second interface theme was added alongside Modern — an early-2000s desktop aesthetic with beveled 3D panels, navy gradient title bars, Tahoma typography, and sunken inset inputs on a refined dark palette. Selectable from Settings → General.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Expanded Penal Code & Email Notifications',
    body: 'The default penal code library was expanded to 91 charges with comprehensive traffic and petty-crime coverage. An opt-in email notification system was added for session and training alerts, with EMS SOP document support for medical protocols.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Four New CAD Interface Themes',
    body: 'Four new selectable CAD themes launched alongside Modern and Retro: Tactical (military command center with matte black, olive green, amber accents, and animated grid backgrounds), EOC (clean light emergency-operations-center aesthetic with white and navy), Cyber Ops (futuristic dark charcoal with electric cyan, purple, glass panels, and glow effects), and First Responder (each department panel adopts its own accent color — police blue, fire red, EMS green, dispatch gold). CAD navigation icons were also refreshed to match the website.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Onboarding, Focus Mode & Mobile Companion (v1.0)',
    body: 'A massive quality-of-life release: 12 interactive onboarding tutorials with a Learning Center, undo protection for destructive actions, custom keyboard shortcuts, a mobile companion mode, dispatcher focus mode, server template import, and mini popup notifications.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Operational Replay & Command Mode (v1.01)',
    body: 'After-action review tools for supervisors and training staff — every incident automatically records a complete event timeline (creation, assignments, status changes, notes, reports, closure) with playback controls and unit movement replay. A new Command Mode gives dispatchers a real-time EOC-style operational overview with pinning, response times, and mutual aid monitoring.',
    done: true, tag: 'Complete',
  },
  {
    title: 'Premium Server Tiers',
    body: 'Paid server tiers unlocking advanced features — higher member caps, AI dispatch, custom theming, priority support, and verified server badges.',
    done: false, tag: 'Upcoming',
  },
  {
    title: 'Mobile App (iOS / Android)',
    body: 'A native-feel mobile experience powered by the same React codebase, enabling unit status updates, call monitoring, and dispatch operations from any device.',
    done: false, tag: 'Planned',
  },
  {
    title: 'Cross-Server API Integrations',
    body: 'Direct server-to-server CAD push from FiveM scripts via public API — automatic civilian lookup triggers, plate pings, and bolo alerts synced between in-game and VanguardOS.',
    done: false, tag: 'Planned',
  },
];

export default function About() {
  const contentRef = useRef(null);

  const scrollDown = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Background image */}
        <img
          src={CAD_PREVIEW_URL}
          alt="VanguardOS CAD Preview"
          className="absolute inset-0 w-full h-full object-cover object-right"
          style={{ filter: 'brightness(0.28) saturate(0.6)' }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        {/* Nav bar */}
        <div className="relative z-10 flex items-center justify-between px-8 py-6">
          <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
            <ArrowLeft size={15} />
            Back to Home
          </Link>
          <VanguardLogo size="sm" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 max-w-3xl pb-24">
          <Tag color="bg-crimson/20 text-crimson border-crimson/30">
            <Sparkles size={10} /> VanguardOS — The Full Story
          </Tag>
          <h1 className="mt-5 font-black text-5xl md:text-7xl leading-[1.0] tracking-tight">
            Introducing<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">VanguardOS</span>
          </h1>
          <p className="mt-6 text-white/50 text-lg leading-relaxed max-w-xl">
            The Modern CAD Built for Serious Roleplay Communities — spend less time managing software and more time in the scene. This is the complete story — the developer, the vision, the technology, and everything that comes next.
          </p>
          <div className="mt-8 flex items-center gap-4 flex-wrap">
            <Link to="/docs" className="flex items-center gap-2 bg-crimson hover:bg-crimson-light text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-crimson/20">
              <BookOpen size={15} /> Read the Docs
            </Link>
            <button onClick={openAIAssistant} className="flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-medium text-sm px-5 py-3 rounded-xl transition-all">
              <Bug size={15} /> Submit Feedback
            </button>
          </div>
        </div>

        {/* Scroll cue */}
        <button
          onClick={scrollDown}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
          <ChevronDown size={18} className="animate-bounce" />
        </button>
      </div>

      {/* ─── CONTENT ──────────────────────────────────────────────── */}
      <div ref={contentRef} className="relative">
        {/* VOS Logo watermark background for content sections */}
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${VOS_LOGO_BG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.04,
            filter: 'grayscale(1) brightness(3)',
          }}
        />

        {/* ── SECTION 1: What is VanguardOS ── */}
        <Section>
          <Tag color="bg-crimson/20 text-crimson border-crimson/30">
            <Shield size={10} /> Platform Overview
          </Tag>
          <h2 className="mt-4 text-3xl md:text-4xl font-black leading-tight">What is VanguardOS?</h2>
          <p className="mt-5 text-white/60 text-base leading-relaxed">
            VanguardOS is <strong className="text-white">The Modern CAD Built for Serious Roleplay Communities</strong> — a fully web-based Computer-Aided Dispatch platform that helps you spend less time managing the CAD and more time roleplaying. It delivers faster dispatching, less repetitive paperwork, better situational awareness, and smarter workflows. Originally purpose-built for online roleplay communities — primarily FiveM (GTA V roleplay) and Roblox RP servers, though any structured roleplay environment can benefit from it.
          </p>
          <p className="mt-4 text-white/60 text-base leading-relaxed">
            Traditional CAD tools used in the RP community have historically been either too simplified to provide a realistic experience, or too clunky and outdated to actually enjoy using during a live session. VanguardOS was built to be the answer to that problem: a platform that takes real-world emergency dispatch concepts and translates them into an environment that is fast, intuitive, beautiful, and genuinely immersive.
          </p>
          <p className="mt-4 text-white/60 text-base leading-relaxed">
            The platform is structured around the concept of <strong className="text-white">Servers</strong> — each RP community gets its own isolated environment with full configuration control. Inside a server, administrators can define departments, set up radio channels, create training programs, customize the appearance, upload a custom map, and manage their entire membership. Officers, firefighters, paramedics, dispatchers, and civilians each have their own dedicated interface panels designed around their specific roles.
          </p>
          <p className="mt-4 text-white/60 text-base leading-relaxed">
            Real-time data is at the core of everything. When a dispatcher creates a call, every connected unit sees it instantly. When an officer goes 10-97 on scene, the status updates live across all panels. When a civilian is stopped and an officer runs their plate, the system surfaces the full character profile — driver's license status, vehicle history, flags — in seconds. This is <strong className="text-white">real emergency services simulation, in the browser, in real time.</strong>
          </p>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <FeatureBlock icon={Radio} color="text-emerald-400" title="Live Dispatch Board" body="Real-time call creation, P1–P4 priority sorting, unit assignment, dispatch tones, Signal 100 protocol, and call notes logging — all updating live across every connected session." />
            <FeatureBlock icon={Shield} color="text-blue-400" title="Law Enforcement Panel" body="Full LEO operations with on-duty management, callsign tracking, rank and RP name logging, civilian database lookups, vehicle plate queries, and a complete incident reporting system." />
            <FeatureBlock icon={Flame} color="text-orange-400" title="Fire & EMS Panel" body="Apparatus-based unit management, ICS-aligned response protocol guidance, and department-typed incident reports for structured post-scene documentation." />
            <FeatureBlock icon={Users} color="text-teal-400" title="Civilian Panel" body="Multi-character civilian creation with physical description, driver's license tracking, vehicle registration, insurance, flags, and emergency contacts — all queryable by LEO in real time." />
            <FeatureBlock icon={GraduationCap} color="text-yellow-400" title="Training & LMS" body="Tiered certification system per department type, with Markdown-based training modules, multiple-choice exams, pass thresholds, and progress tracking per user per server." />
            <FeatureBlock icon={FileText} color="text-purple-400" title="Incident Reports" body="Typed report submission (arrest, use of force, traffic stop, fire, EMS, supplement) with a supervisor approval/rejection workflow and narrative-based documentation standards." />
            <FeatureBlock icon={MapPin} color="text-pink-400" title="Live Dispatch Map" body="Interactive real-time map with department-colored unit pins and logos, postal/street auto-detection, configurable ping intervals, position history tracking, and ER:LC + Los Santos presets. Custom map uploads with AI street extraction." />
            <FeatureBlock icon={Bot} color="text-violet-400" title="AI Dispatch Assistant" body="An optional LLM-powered agent embedded into the dispatch panel, with awareness of your live call queue and unit statuses, ready to help with summaries, assignments, and tactical queries." />
            <FeatureBlock icon={Radio} color="text-sky-400" title="Radio Channel System" body="In-CAD radio channels with department-restricted access controls, live participant tracking, and admin-controlled channel management integrated into the audio tone engine." />
            <FeatureBlock icon={Layers} color="text-rose-400" title="Penal Code Manager" body="A 91-charge default library covering felonies, misdemeanors, traffic violations, and petty crimes. Server owners can fully customize codes, titles, categories, fines, and jail times — accessible to all members during patrol." />
            <FeatureBlock icon={Lock} color="text-amber-400" title="Role-Based Access Control" body="Fine-grained permission management per server: Owner, Admin, Moderator, and Member roles, each with configurable department access keys and CAD panel permissions." />
            <FeatureBlock icon={Globe} color="text-indigo-400" title="Community Directory" body="Discover and join other VanguardOS-powered communities in the public server directory, with verified badges, member counts, department listings, and invite code access." />
          </div>
        </Section>

        {/* ── SECTION 2: The Developer ── */}
        <div className="border-t border-white/[0.06]">
          <Section>
            <Tag color="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Code2 size={10} /> Meet the Developer
            </Tag>
            <h2 className="mt-4 text-3xl md:text-4xl font-black leading-tight">The Person Behind the Platform</h2>

            <div className="mt-8 flex flex-col md:flex-row items-start gap-8">
              <div className="w-32 h-32 rounded-3xl overflow-hidden border border-white/10 flex-shrink-0 bg-black/40">
                <img
                  src={DEV_IMG_URL}
                  alt="End3r234"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black text-2xl">End3r234</h3>
                <p className="text-white/40 text-sm mt-1">Independent Developer · Solo Project · Built for the Roleplay Community</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['FiveM Veteran', 'Roblox RP', 'Solo Dev', 'UI/UX', 'Full-Stack', 'Community Builder'].map(t => (
                    <span key={t} className="text-[10px] uppercase tracking-wide font-semibold px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/50">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <Divider />

            <p className="text-white/65 text-base leading-relaxed">
              VanguardOS wasn't born in a boardroom or a startup pitch. It was born out of <strong className="text-white">genuine frustration</strong> — the kind that builds up over years of playing in RP servers and constantly running into the same pain points: CAD systems that felt like they were built in 2012, dispatch tools that crashed under load, unit management boards that required a dozen clicks to update a single status, and training systems that were just Discord channels with a pinned Google Doc.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              End3r234 is a developer who grew up in the FiveM and Roblox roleplay communities — not as an outsider building tools for a niche market, but as an active participant who has <strong className="text-white">played the dispatcher, worn the badge, run the fire engine, and managed the civilian.</strong> That experience is the entire blueprint for VanguardOS.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              The process started, as most passion projects do, with a napkin-sketch idea: "What if we built a CAD that was actually good?" What followed was months of design iteration, technical architecture decisions, and a commitment to making every interaction feel deliberate and polished. No placeholder UIs, no feature-flag sprawl, no half-baked panels — every module in VanguardOS was built to actually work in a live RP session under real conditions.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              One of the defining philosophies of the project is that <strong className="text-white">everything has a reason.</strong> The dispatch tone system isn't just a sound effect — it's modeled on real municipal dispatch audio protocols with standard, priority, and emergency differentiators. The 10-code status system isn't arbitrary — it matches the real-world APCO 10-code standard that law enforcement has used for decades. The incident report approval workflow isn't bureaucracy for the sake of it — it's how real departments ensure accountability and documentation quality.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              Building VanguardOS as a solo developer has been equal parts rewarding and demanding. Every design decision, every line of code, every UX flow, every bug fix — all of it has come from one person's hands and one person's vision. There's no team to delegate to, no project manager setting timelines, no QA department catching regressions. What that means in practice is that every feature that ships has been <strong className="text-white">personally validated to work the way it's supposed to</strong>, because the developer himself would be using it.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              The feedback loop with the community has been one of the most valuable parts of the development process. Bug reports, feature requests, design critiques — all of it is taken seriously and actively shapes the platform's direction. VanguardOS is not a static product. It's a living system that responds to the people who use it. That's a promise, not a tagline.
            </p>

            <Divider />

            <h3 className="text-white font-bold text-xl mb-4">Technical Philosophy</h3>
            <p className="text-white/65 text-base leading-relaxed">
              From a technical standpoint, VanguardOS is built on a <strong className="text-white">React + Tailwind CSS</strong> frontend running on top of the Base44 platform for backend-as-a-service infrastructure. This stack was chosen deliberately: React's component model allows for the kind of modular, panel-based UI that a CAD system requires; Tailwind provides the design velocity to build fast without sacrificing visual quality; and Base44 gives a production-grade backend — database, authentication, real-time subscriptions, file storage, AI integrations — without requiring a dedicated backend codebase.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              Real-time data synchronization is powered by live entity subscriptions — not polling, not WebSocket hacks, but a first-class reactive data layer that pushes changes to every connected client the moment they happen. This is what makes the dispatch board actually useful: when a unit goes 10-97, you don't need to refresh the page.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              The audio tone engine is a custom implementation using the Web Audio API — generating synthesized dispatch tones at specific frequencies that match real-world DTMF and public safety radio tone patterns. The standard, priority, and emergency tones are distinct in pitch and rhythm so dispatchers can recognize call urgency by sound alone, even without looking at the screen.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              AI integration is handled through a purpose-built dispatch assistant agent with direct context access to the live call queue and unit roster. Unlike generic chatbots, this agent knows your server's current state — it can tell you which units are available, summarize active P1 incidents, suggest unit assignments, and generate radio-ready call briefings.
            </p>

            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-4">Tech Stack</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                {[
                  { label: 'Frontend Framework', value: 'React 18 + Vite' },
                  { label: 'Styling', value: 'Tailwind CSS + CSS Variables' },
                  { label: 'Backend / Database', value: 'Base44 Platform' },
                  { label: 'Real-time Sync', value: 'Live Entity Subscriptions' },
                  { label: 'State Management', value: 'TanStack Query v5' },
                  { label: 'Audio Engine', value: 'Web Audio API (Custom)' },
                  { label: 'AI Integration', value: 'LLM Agent w/ Live Context' },
                  { label: 'Authentication', value: 'Platform Auth (Session-based)' },
                  { label: 'File Storage', value: 'Base44 Storage CDN' },
                  { label: 'Component Library', value: 'shadcn/ui + Radix Primitives' },
                  { label: 'Routing', value: 'React Router v6' },
                  { label: 'Animations', value: 'Framer Motion' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm border-b border-white/[0.04] pb-2">
                    <span className="text-white/35">{label}</span>
                    <span className="text-white/70 font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* ── SECTION 3: Design Philosophy ── */}
        <div className="border-t border-white/[0.06]">
          <Section>
            <Tag color="bg-violet-500/20 text-violet-400 border-violet-500/30">
              <Sparkles size={10} /> Design System
            </Tag>
            <h2 className="mt-4 text-3xl md:text-4xl font-black leading-tight">Design Philosophy &amp; Visual Identity</h2>
            <p className="mt-5 text-white/65 text-base leading-relaxed">
              VanguardOS has a distinct visual identity that was not an accident. Every color, every spacing decision, every typographic choice was made with a specific intent: to feel like a <strong className="text-white">real operations center</strong>, not a consumer app.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              The primary color palette is built around <strong className="text-white">near-black backgrounds</strong> (#0B0B0B primary surface) with <strong className="text-crimson">Crimson (#CE0000)</strong> as the accent. This combination was chosen deliberately — in real dispatch centers, high-contrast dark environments reduce eye strain during extended shifts, and red/amber alerts immediately draw attention. VanguardOS mimics this logic.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              Typography is built around two faces: <strong className="text-white">Inter</strong> for interface copy and data — chosen for its exceptional legibility at small sizes, a critical requirement for information-dense panels — and <strong className="text-white">Rajdhani</strong> for display headings and callsigns, which brings a slightly tactical, semi-compressed quality that fits the emergency services aesthetic without being gimmicky.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              The CAD panels themselves use a system of glass-morphism surfaces — transparent layers with subtle borders and backdrop blur — to create visual depth without adding clutter. This allows the information (calls, unit statuses, personnel data) to be the focal point, not the interface chrome around it.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              Status codes use a color-coded badge system that is immediately interpretable even at a glance: 10-8 (available) is emerald green, 10-97 (on scene) is blue, 10-7 (out of service) is amber, and 10-42 (off duty) is a muted zinc. Priority levels follow a standard threat color model: P1 is red with a pulsing animation, P2 is orange, P3 is yellow, P4 is blue. These choices are not aesthetic — they are <strong className="text-white">functional communication decisions</strong>.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              The entire design system is tokenized — all colors, fonts, and spacing units are defined as CSS variables that cascade through a Tailwind configuration. This means future theme support (custom server themes, light mode, etc.) is a configuration change, not a rewrite.
            </p>
          </Section>
        </div>

        {/* ── SECTION 4: How CAD Works ── */}
        <div className="border-t border-white/[0.06]">
          <Section>
            <Tag color="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Terminal size={10} /> How It Works
            </Tag>
            <h2 className="mt-4 text-3xl md:text-4xl font-black leading-tight">Inside the VanguardOS CAD System</h2>
            <p className="mt-5 text-white/65 text-base leading-relaxed">
              Understanding VanguardOS requires understanding the architecture of a real CAD system and how those concepts are applied here.
            </p>

            <Divider />

            <h3 className="text-white font-bold text-xl mb-3">The Server Model</h3>
            <p className="text-white/65 text-base leading-relaxed">
              Every roleplay community that uses VanguardOS operates within a <strong className="text-white">Server</strong> — a fully isolated environment with its own departments, members, calls, civilians, training programs, radio channels, and configuration. Servers can be public (discoverable in the marketplace) or private (invite-only). Server owners have complete control over their environment and can assign administrative roles to trusted members.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              Each server can have multiple departments, each typed as Police, Fire, EMS, or Dispatch. Departments can have short-name tags (e.g., BCSO for Blaine County Sheriff's Office) and can be added, edited, or removed at any time without disrupting active operations. Units on duty are always associated with a specific department, making cross-departmental coordination clear and organized.
            </p>

            <Divider />

            <h3 className="text-white font-bold text-xl mb-3">The Real-Time Data Layer</h3>
            <p className="text-white/65 text-base leading-relaxed">
              The backbone of VanguardOS is its real-time data architecture. Rather than polling an API on a timer, the platform uses live entity subscriptions — every entity type (Units, Calls, Members, etc.) can be subscribed to, and the client receives push notifications the moment any record is created, updated, or deleted. This means:
            </p>
            <ul className="mt-4 space-y-2 text-white/60 text-base">
              {[
                'A dispatcher creates a call → every connected member sees it appear instantly on the dispatch board.',
                'An officer updates their status to 10-97 → their badge updates live in the unit sidebar.',
                'A supervisor approves an incident report → the officer\'s report panel updates immediately.',
                'A civilian adds a vehicle → LEO searching that civilian\'s plate sees the new vehicle in real time.',
                'A radio channel gets a new participant → the channel participant list updates live for all users on that channel.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-crimson/20 border border-crimson/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-crimson text-[9px] font-bold">{i + 1}</span>
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Divider />

            <h3 className="text-white font-bold text-xl mb-3">The Dispatch Workflow</h3>
            <p className="text-white/65 text-base leading-relaxed">
              The dispatch panel is the nerve center of any active VanguardOS session. A dispatcher's workflow on a typical call follows this path:
            </p>
            <ol className="mt-4 space-y-3 text-white/60 text-base">
              {[
                { title: 'Call Creation', body: 'Dispatcher receives a report (in-game, voice, or direct) and creates a new call with type, location, priority (P1–P4), description, and caller info. The call immediately appears on the board.' },
                { title: 'Tone Dispatch', body: 'Dispatcher selects the appropriate tone (Standard, Priority, or Emergency) and plays it — alerting all connected units via the Web Audio API. The tone is server-customizable by name and audio signature.' },
                { title: 'Unit Assignment', body: 'Dispatcher selects available units from the unit sidebar (filtered by department type and current status) and assigns them to the call. Assigned units receive a visual assignment notification in their panel.' },
                { title: 'Status Monitoring', body: 'As units respond, their statuses update live (10-97 on scene, 10-6 busy). Dispatchers monitor the board and coordinate additional resources as needed.' },
                { title: 'Call Notes', body: 'Any significant development gets logged as a timestamped call note — suspect fled on foot, additional units requested, scene secured, etc.' },
                { title: 'Call Close', body: 'When the incident is resolved, the dispatcher closes the call. Assigned units are automatically set back to 10-8 (available) and cleared from call assignment.' },
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-crimson font-black text-lg flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{step.title}</p>
                    <p className="text-white/55 text-sm mt-1 leading-relaxed">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Divider />

            <h3 className="text-white font-bold text-xl mb-3">Training & Certification System</h3>
            <p className="text-white/65 text-base leading-relaxed">
              The Learning Management System (LMS) in VanguardOS is designed to give server communities a structured on-boarding and skill progression path. Each department type (Law Enforcement, Fire, EMS, Dispatch) has its own certification track with multiple tier levels.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              Server owners and admins can create custom training modules using Markdown — meaning content can include formatted text, tables, images, checklists, code blocks, and structured procedure guides. Each module has a configurable multiple-choice exam with a set passing threshold (default 80%). Users who fail must wait before retrying. Users who pass receive a certification tier that can be displayed on their profile.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              Department access keys can be tied to certification levels — meaning a member must complete their LEO training before gaining access to the Law Enforcement panel. This creates a genuine qualification pathway that mirrors how real RP server onboarding should work.
            </p>
          </Section>
        </div>

        {/* ── SECTION 5: Development Timeline ── */}
        <div className="border-t border-white/[0.06]">
          <Section>
            <Tag color="bg-amber-500/20 text-amber-400 border-amber-500/30">
              <Clock size={10} /> Development Progress
            </Tag>
            <h2 className="mt-4 text-3xl md:text-4xl font-black leading-tight">Where We've Been &amp; Where We're Going</h2>
            <p className="mt-5 text-white/65 text-base leading-relaxed">
              VanguardOS has been built iteratively, shipping features as they reach production quality. Below is the complete development timeline — what's been shipped, what's in progress, and what's planned for future releases.
            </p>
            <div className="mt-10">
              <Timeline items={TIMELINE} />
            </div>
          </Section>
        </div>

        {/* ── SECTION 6: Community ── */}
        <div className="border-t border-white/[0.06]">
          <Section>
            <Tag color="bg-teal-500/20 text-teal-400 border-teal-500/30">
              <Users size={10} /> Community
            </Tag>
            <h2 className="mt-4 text-3xl md:text-4xl font-black leading-tight">Built With the Community, For the Community</h2>
            <p className="mt-5 text-white/65 text-base leading-relaxed">
              VanguardOS isn't a platform that was designed in isolation and shipped to users as a finished product. From the earliest prototypes, real RP community members have been involved — providing feedback on dispatch workflows, testing edge cases in the civilian database, stress-testing the real-time sync under heavy multi-user load, and contributing ideas that have directly become features.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              The Signal 100 feature — a server-wide emergency communication lockdown mode that restricts radio traffic to emergency-only channels — came directly from a dispatcher who asked: "Does VanguardOS support Signal 100 protocol?" It didn't at the time. Within two updates, it did.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              The supervisor report approval workflow was shaped by feedback from server owners who needed a way to enforce narrative quality standards in their departments without manually reviewing every submitted document outside the platform. The result is a first-class report review interface with note capability directly in the CAD.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              The community of VanguardOS users is the quality assurance team, the product roadmap, and the proof of concept all at once. Every server that goes live is a real test of the platform under real conditions, with real stakes (for the roleplay, at least). That feedback loop makes VanguardOS better with every session.
            </p>
            <p className="mt-4 text-white/65 text-base leading-relaxed">
              Bug reports can be submitted directly through the platform's Bug Reports page. Feature suggestions and general discussion happen in the community Discord. Server owners with specific customization needs are always welcome to reach out directly — the developer is accessible and responsive, because the people who use VanguardOS are the reason it exists.
            </p>

            <Divider />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {[
                { icon: Star, color: 'text-yellow-400', title: 'Free to Use', body: 'VanguardOS is free for all communities, with premium tiers planned for servers that need advanced features like higher member caps, AI dispatch, and verified badges.' },
                { icon: Heart, color: 'text-crimson', title: 'Community Driven', body: 'Every major feature on the platform roadmap has come from community feedback. Your bug reports and suggestions directly shape what gets built next.' },
                { icon: Cpu, color: 'text-violet-400', title: 'Always Improving', body: 'VanguardOS ships updates continuously. The platform you use today will be more capable next month — and the month after that — because development never stops.' },
              ].map(({ icon: Icon, color, title, body }) => (
                <div key={title} className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
                  <Icon size={24} className={`${color} mx-auto mb-3`} />
                  <p className="text-white font-bold text-sm">{title}</p>
                  <p className="text-white/45 text-sm mt-2 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── SECTION 7: Docs / CTA ── */}
        <div className="border-t border-white/[0.06]">
          <Section>
            <Tag color="bg-crimson/20 text-crimson border-crimson/30">
              <BookOpen size={10} /> Resources
            </Tag>
            <h2 className="mt-4 text-3xl md:text-4xl font-black leading-tight">Start Using VanguardOS</h2>
            <p className="mt-5 text-white/65 text-base leading-relaxed">
              Whether you're setting up a new community, onboarding your first officers, or diving deep into the advanced configuration options, the documentation has everything you need to get the most out of VanguardOS.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: BookOpen, title: 'Platform Documentation', body: 'Step-by-step guides for every feature — from creating your first server to configuring training programs, penal codes, and AI dispatch.', to: '/docs', label: 'Read the Docs', color: 'bg-crimson hover:bg-crimson-light text-white shadow-crimson/20' },
                { icon: Bug, title: 'Support & Feedback', body: 'Found something that doesn\'t work as expected, or need help? Ask the VanguardOS AI assistant — it can answer questions and log your report.', action: 'ai', label: 'Ask the AI', color: 'bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/10' },
                { icon: Globe, title: 'Server Directory', body: 'Discover active VanguardOS communities, join public servers, and find your next roleplay home in the public server directory.', to: '/', label: 'Browse Servers', color: 'bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/10' },
                { icon: Users, title: 'Profile Directory', body: 'Browse the VanguardOS member directory, view profiles, check platform badges, and connect with other roleplayers in the community.', to: '/directory', label: 'View Directory', color: 'bg-white/[0.06] hover:bg-white/[0.10] text-white border border-white/10' },
              ].map(({ icon: Icon, title, body, to, action, label, color }) => (
                <div key={title} className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon size={15} className="text-white/50" />
                      <p className="text-white font-semibold text-sm">{title}</p>
                    </div>
                    <p className="text-white/45 text-sm leading-relaxed">{body}</p>
                  </div>
                  {action === 'ai' ? (
                    <button onClick={openAIAssistant} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${color}`}>
                      {label} <Bot size={13} />
                    </button>
                  ) : (
                    <Link to={to} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${color}`}>
                      {label} <ExternalLink size={13} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ── FOOTER ── */}
        <div className="border-t border-white/[0.06] py-12 px-8 text-center">
          <VanguardLogo size="sm" />
          <p className="text-white/25 text-sm mt-4 max-w-lg mx-auto leading-relaxed">
            VanguardOS is an independent project built by End3r234. It is not affiliated with any real-world law enforcement, fire, or emergency medical services agency. For roleplay use only.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-4 text-white/25 text-xs">
            <Heart size={11} className="text-crimson" />
            <span>Made with care for the RP community.</span>
          </div>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-white/30 hover:text-white transition-colors text-sm">
            <ArrowLeft size={13} /> Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}