import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, HelpCircle } from 'lucide-react';
import VanguardLogo from '@/components/VanguardLogo';
import { openAIAssistant } from '@/lib/openAIAssistant';

const FAQS = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is VanguardOS?',
        a: 'VanguardOS is The Modern CAD Built for Serious Roleplay Communities — a platform designed to help you spend less time managing software and more time roleplaying. It delivers faster dispatching, less repetitive paperwork, better situational awareness, and smarter workflows through real-time dispatch, law enforcement tools, Fire/EMS panels, civilian management, AI assistance, and an after-action replay system, all in one modern interface.',
      },
      {
        q: 'How do I join a server?',
        a: 'From the home page, browse public servers in the Discover section and click "Enter." If a server is private, you\'ll need an invite code from the server owner.',
      },
      {
        q: 'How do I create my own server?',
        a: 'Click the "Create Server" button on the home page, give your server a name and description, and you\'re ready to go. You\'ll be set as the owner with full access to all panels and settings.',
      },
      {
        q: 'Is VanguardOS free to use?',
        a: 'Yes! VanguardOS has a free tier that covers the core CAD features. Premium servers unlock additional perks like enhanced visibility and advanced customization.',
      },
    ],
  },
  {
    category: 'Dispatch & Operations',
    items: [
      {
        q: 'How do priority levels work?',
        a: 'Calls are assigned P1 (Critical), P2 (Urgent), P3 (Routine), or P4 (Low) priority. P1 calls pulse red on the dispatch board and trigger emergency tones automatically.',
      },
      {
        q: 'What are dispatch tones?',
        a: 'Dispatch tones are audio alerts played when a unit is assigned to a call. Owners can customize the name and sound of Standard, Priority, and Emergency tones in Server Settings.',
      },
      {
        q: 'What is Signal 100?',
        a: 'Signal 100 is an emergency traffic lockdown — when activated by an admin, it displays a server-wide banner indicating all non-emergency radio traffic should cease immediately.',
      },
      {
        q: 'Can the Dispatch AI help me manage calls?',
        a: 'Yes! If your server owner has enabled the Dispatch AI in settings, dispatchers get access to an AI assistant that can analyze live call and unit data, suggest unit assignments, and flag urgent situations.',
      },
    ],
  },
  {
    category: 'Departments & Access',
    items: [
      {
        q: 'How do I get access to a department panel?',
        a: 'Server admins grant department keys (Police, Fire, EMS, Dispatch) to members from the Admin panel. Once granted, you\'ll see the corresponding panel tab in the CAD.',
      },
      {
        q: 'What are training tiers?',
        a: 'Each department (LEO, Fire, Dispatch) has 3 training tiers. You complete a study module and pass an exam to unlock each tier. Higher tiers may be required for advanced access on some servers.',
      },
      {
        q: 'Can I be in multiple departments?',
        a: 'Yes. Admins can grant you keys for multiple departments simultaneously, allowing you to switch between panels as needed.',
      },
    ],
  },
  {
    category: 'Profiles & Characters',
    items: [
      {
        q: 'What is a Civilian character?',
        a: 'Civilian characters are detailed profiles you create for roleplay — including name, DOB, address, physical description, driver\'s license, and registered vehicles. Officers can look them up through the LEO database.',
      },
      {
        q: 'Can I have multiple civilian characters?',
        a: 'Yes, you can create multiple civilian characters per server. Switch between them from the Civilian panel.',
      },
      {
        q: 'What are platform badges?',
        a: 'Platform badges are recognition tokens granted by VanguardOS staff. They appear on your profile across all servers and represent things like being a verified developer, staff member, or early supporter.',
      },
    ],
  },
  {
    category: 'Server Management',
    items: [
      {
        q: 'How do I customize my server?',
        a: 'Go to the Settings tab inside your CAD server. You can configure departments, upload a custom map, set dispatch tones, choose a background theme, pick a CAD interface theme (Modern or Retro), upload a background image, manage the 91-charge penal code, enable email notifications, and control member access.',
      },
      {
        q: 'How do verified servers work?',
        a: 'VanguardOS staff can grant Verified status to servers that meet community standards. Verified servers receive a blue checkmark badge and appear with higher prominence in the server discovery list.',
      },
      {
        q: 'What is the Audit Log?',
        a: 'The audit log records all admin actions taken within your server — including role changes, kicks, and key grants — so you have a full record of moderation activity.',
      },
    ],
  },
  {
    category: 'Live Map & Communication',
    items: [
      {
        q: 'What is the Live Dispatch Map?',
        a: 'The Live Dispatch Map is an interactive real-time map that shows all on-duty unit positions as color-coded pins (blue=Police, orange=Fire, red=EMS, emerald=Dispatch). Department logos appear on pins, and dispatchers can click any pin to view unit details. It supports ER:LC, Los Santos, and custom map presets.',
      },
      {
        q: 'How do units update their map position?',
        a: 'Units click the 📍 Navigation button in their panel header. A map dialog opens, they click their current location, and the nearest postal code and street name are auto-detected. The position syncs to the live map in real-time. Units that ignore 4+ location reminders have their callsign turn red in the dispatch sidebar.',
      },
      {
        q: 'What is Unit Position History?',
        a: 'Every time a unit updates their map position, the update is logged with a timestamp, coordinates, and nearest postal/street. Dispatchers can open a history panel on any unit to see a full retrospective trail of movements during a session. This is always available to dispatchers — no toggle required.',
      },
      {
        q: 'Can dispatchers message units directly?',
        a: 'Yes! If the server owner has enabled Live Map DMs, dispatchers can send direct messages to on-duty units from the live map. Click the "DMs" button in the map toolbar to open your inbox. Messages deliver in real-time with unread badge counts. The DM feature is available to dispatch, police, fire, and EMS personnel.',
      },
      {
        q: 'Can I upload my own custom map?',
        a: 'Yes. In Settings → Live Map, select the "Custom" preset and upload your map image. Then click "Extract Streets with AI" — the AI scans your map and extracts 200+ visible street names and postal codes with grid-based coordinate estimation. Blurry regions get auto-generated area names.',
      },
      {
        q: 'What are the CAD interface themes?',
        a: 'Server owners can choose from six CAD interface themes in Settings → General: Modern (default glassmorphism), Retro (early-2000s desktop), Tactical (military command center with matte black, olive green, amber accents, and an animated grid), EOC (clean light emergency-operations-center look with white and navy), Cyber Ops (futuristic dark with electric cyan and neon glow), and First Responder (each department panel uses its own accent color — police=blue, fire=red, EMS=green, dispatch=gold). The theme applies server-wide to all users.',
      },
      {
        q: 'How does the AI map import work for custom maps?',
        a: 'When you upload a custom map image (Settings → Live Map → Custom preset), the system automatically enhances it (upscaled resolution, boosted contrast, sharpened text) before AI analysis. The AI then detects roads, streets, postal codes, and landmarks — assigning a confidence score (0-100%) to each. High-confidence detections (≥85%) are auto-accepted; lower-confidence items are flagged in a collapsible "Review Required" panel with color-coded indicators (🟡 yellow = low confidence, 🔴 red = needs manual correction). Click any review item to zoom the map to its location, drag the marker to reposition, edit the name/postal, and mark it as verified. Your corrections are saved per-map so future re-scans auto-apply them.',
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border border-white/[0.06] rounded-xl overflow-hidden transition-all duration-200"
      style={{ background: open ? 'rgba(206,0,0,0.04)' : 'rgba(255,255,255,0.02)', borderColor: open ? 'rgba(206,0,0,0.2)' : undefined }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-white text-sm font-medium pr-4">{q}</span>
        <ChevronDown
          size={16}
          className="text-white/40 flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-white/50 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <header className="border-b border-crimson/20 bg-[#1a0000]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="text-white/40 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
          <VanguardLogo size="sm" />
          <span className="text-white/30 text-sm">/ FAQ</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-crimson/10 border border-crimson/20 mb-5">
            <HelpCircle size={24} className="text-crimson" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Frequently Asked Questions</h1>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Everything you need to know about VanguardOS. Can't find an answer? Ask our AI assistant for help.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-10">
          {FAQS.map(section => (
            <div key={section.category}>
              <h2 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-4 h-px bg-crimson/50 inline-block" />
                {section.category}
              </h2>
              <div className="space-y-2">
                {section.items.map(item => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-white/30 text-sm mb-3">Still have questions?</p>
          <button onClick={openAIAssistant} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-crimson/30 bg-crimson/10 text-crimson text-sm font-semibold hover:bg-crimson/20 transition-all">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}