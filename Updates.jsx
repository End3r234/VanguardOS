import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, GitBranch, CheckCircle2, Zap, Bug, Wrench, Sparkles,
  Radio, MapPin, MessageSquare, Palette, Scale, Bell, Bot, Clock,
  ChevronDown, Layers, Users, Wand2, ShieldCheck,
  GraduationCap, Undo2, Keyboard, Smartphone, Maximize2, Download, BellRing,
  History, Monitor
} from 'lucide-react';
import VanguardLogo from '@/components/VanguardLogo';
import { openAIAssistant } from '@/lib/openAIAssistant';

const UPDATES = [
  {
    version: 'v1.01',
    date: 'August 3, 2026',
    title: 'Operational Replay & Command Mode',
    tag: 'Feature',
    tagColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: History,
    summary: 'After-action review tools for supervisors and a real-time EOC overview for dispatchers, plus refined product positioning throughout the platform.',
    changes: [
      { category: 'New Feature', icon: History, title: 'Operational Replay System', detail: 'Every incident now automatically records a complete event timeline from creation through closure — including dispatch updates, unit assignments, status changes, en route and arrival timestamps, additional responding units, priority changes, call notes, report submissions, report approvals, and incident closure. A playback interface with play/pause, step controls, and adjustable speed (1x/2x/4x) lets supervisors and training staff review incidents chronologically. If unit position history exists, map data is available for movement replay.' },
      { category: 'New Feature', icon: Monitor, title: 'Command Mode for Dispatchers', detail: 'An optional EOC-style full-screen operational overview accessible via a Command button in the dispatch panel. Displays active incidents, priority breakdowns, units available vs committed, officer safety alert status, average response times, mutual aid calls, incident locations, recently escalated calls, and a unit status breakdown. Incidents can be pinned for focused monitoring. Command Mode is a live overlay that does not replace the normal dispatch interface.' },
      { category: 'Improvement', icon: Sparkles, title: 'Refined Product Positioning', detail: 'Platform copy throughout the website, documentation, and FAQ has been updated to focus on the value VanguardOS provides — faster dispatching, less repetitive paperwork, better situational awareness, and smarter workflows — rather than simply listing features. VanguardOS is now positioned as "The Modern CAD Built for Serious Roleplay Communities," emphasizing that the platform helps users spend less time managing the CAD and more time roleplaying.' },
    ],
  },
  {
    version: 'v1.0',
    date: 'August 2, 2026',
    title: 'Onboarding, Focus Mode, Mobile Companion & Server Templates',
    tag: 'Major',
    tagColor: 'bg-crimson/20 text-crimson border-crimson/30',
    icon: Sparkles,
    summary: 'A massive quality-of-life release focused on onboarding, accessibility, and user experience. Introduces an interactive Learning Center with 12 guided tutorials, undo protection, customizable keyboard shortcuts, a mobile companion mode, dispatcher focus mode, server template import, and mini popup notifications.',
    changes: [
      { category: 'New Feature', icon: GraduationCap, title: 'Interactive Onboarding Center', detail: '12 step-by-step guided tutorials covering profile creation, server joining/creation, CAD navigation, dispatch, law enforcement, fire/EMS, civilian workflow, live maps, report creation, AI assistant, and bug reports. A first-login prompt offers an optional walkthrough. The Learning Center page lets users revisit tutorials anytime with completion tracking and onboarding toggle controls.' },
      { category: 'New Feature', icon: Undo2, title: 'Undo Protection', detail: 'Destructive actions now show a temporary Undo notification with a 10-second countdown. The system stores the deleted item and its restore function, allowing one-click recovery without manual recreation.' },
      { category: 'New Feature', icon: Keyboard, title: 'Custom Keyboard Shortcuts', detail: 'A new Keyboard tab in Server Settings lets members customize 8 default shortcuts (New Call, Open Dispatch, Open Live Map, Open Radio, Search, Notifications, Messages, Toggle Sidebar). Click-to-record keybinding, duplicate prevention, restore defaults, and per-user preference saving.' },
      { category: 'New Feature', icon: Smartphone, title: 'Mobile Companion Mode', detail: 'On screens under 768px, the CAD renders a simplified companion interface with bottom-tab navigation (Calls, Map, Reports, Search, Messages). Mobile users can view active calls, track units, read and approve reports, search civilians/plates, and receive messages — leaving advanced dispatching to desktop.' },
      { category: 'New Feature', icon: Maximize2, title: 'Dispatcher Focus Mode', detail: 'A Focus button in the dispatch panel hides the left unit sidebar and right radio/penal sidebar, expanding the calls grid to full width for distraction-free dispatching. A floating exit button restores the full layout instantly.' },
      { category: 'New Feature', icon: Download, title: 'Server Template Import', detail: 'When creating a new server, owners and admins can import a template from an existing server they manage. This copies departments, penal codes, tones, report types, and all server settings — but no operational data (calls, units, civilians, reports).' },
      { category: 'New Feature', icon: BellRing, title: 'Mini Popup Notifications', detail: 'Contextual popup notifications appear in the bottom-right corner for key dispatch actions: call creation, unit assignment, note additions, call closure, and status affirmations. Color-coded by type with auto-dismiss.' },
      { category: 'Improvement', icon: Zap, title: 'Reduced Empty Space in CAD', detail: 'CAD panels tightened to reduce blank space. Dispatch calls grid padding reduced, empty states are more compact, and layout density improved for better screen utilization.' },
      { category: 'Improvement', icon: Palette, title: 'Settings Tabs Wrap', detail: 'The Server Settings tab bar now wraps to multiple lines on smaller screens instead of overflowing horizontally, ensuring all settings tabs remain accessible.' },
    ],
  },
  {
    version: 'v0.10',
    date: 'August 1, 2026',
    title: 'Cinematic Welcome, Officer Safety Alerts & Crash Reconstruction',
    tag: 'Major',
    tagColor: 'bg-crimson/20 text-crimson border-crimson/30',
    icon: Sparkles,
    summary: 'Three major features land together: a cinematic welcome experience with ambient music and real UI showcase, an Officer Safety Alert system that warns officers during database searches, and a full Crash Reconstruction tool with interactive canvas, plus Incident IDs, Smart Report Builder, enhanced dynamic dispatch, and report completion tracking.',
    changes: [
      {
        category: 'New Feature',
        icon: Sparkles,
        title: 'Cinematic Welcome Experience',
        detail: 'A five-phase cinematic intro plays on first visit: blackout with ambient glow → blue and red emergency light sweeps → VanguardOS logo assembly with converging particles and metallic bloom → interface showcase cycling through real CAD screenshots with feature labels → seamless transition to the live application. Ambient cinematic music plays via the Web Audio API. A Skip Intro button is available at any time.',
      },
      {
        category: 'New Feature',
        icon: ShieldCheck,
        title: 'Officer Safety Alert System',
        detail: 'When enabled by server admins, searching any person, vehicle, or address in the database automatically displays a prominent pulsing warning banner showing all active safety alerts (Known to Carry Weapons, History of Violence, Previous Assault on Law Enforcement, Mental Health Crisis History, and more). Authorized users can add, edit, and remove alerts with internal notes. Alerts attach to civilians, vehicles, and addresses. A new Addresses search tab was added.',
      },
      {
        category: 'New Feature',
        icon: MapPin,
        title: 'Crash Reconstruction Tool',
        detail: 'A built-in crash reconstruction workspace accessible from the Law Enforcement panel with an interactive top-down canvas: drag-and-drop vehicle placement with rotation and direction controls, skid mark drawing, impact/debris/evidence markers (auto-numbered), text annotations, traffic signs, four road templates (straight, intersection, curve, highway), weather and road condition selectors, and PNG/PDF export. Reconstructions save directly to the associated incident report via Incident ID.',
      },
      {
        category: 'New Feature',
        icon: Layers,
        title: 'Incident ID System',
        detail: 'Every new dispatch call auto-generates a unique Incident ID (e.g. INC-2026-000124) that links calls, responding units, and reports together. The ID persists on units after calls close for history tracking. Reports created from calls inherit all incident metadata automatically.',
      },
      {
        category: 'New Feature',
        icon: Wand2,
        title: 'Smart Report Builder',
        detail: 'When enabled in server settings, report forms dynamically adapt based on report type: traffic stops show driver/vehicle/citation/warning fields, arrests show charges/booking/Miranda/jail time, fire reports show apparatus/cause/damage, EMS shows patient/transport/hospital. Type-specific data is stored in a flexible extra_data field without changing the existing approval workflow.',
      },
      {
        category: 'New Feature',
        icon: Radio,
        title: 'Enhanced Dynamic Dispatch Recommendations',
        detail: 'The assign unit dialog now shows scored recommendations based on availability, department compatibility, assignment status, unit type (supervisor vs patrol), and GPS data. Each recommendation displays a confidence percentage and reason label (Closest Available, Same Department, Available Backup). Dispatchers can still select any unit from the full list.',
      },
      {
        category: 'New Feature',
        icon: ShieldCheck,
        title: 'Report Completion Tracking',
        detail: 'A new Call History tab in the Supervisor panel shows every completed call with per-unit report status indicators (Submitted, Pending, Approved, Rejected) and a completion counter, making it easy to see which officers still need to file reports.',
      },
      {
        category: 'New Feature',
        icon: ShieldCheck,
        title: 'Granular Permissions',
        detail: 'Four new per-member permissions are configurable: View Officer Safety Alerts, Manage Officer Safety Alerts, Access Crash Reconstruction, and Edit Crash Reconstructions. Admins and owners retain all permissions by default.',
      },
    ],
  },
  {
    version: 'v0.9',
    date: 'July 13, 2026',
    title: 'Revamped AI Map Import — Confidence Scoring, Manual Review & Learning',
    tag: 'Major',
    tagColor: 'bg-crimson/20 text-crimson border-crimson/30',
    icon: Wand2,
    summary: 'The AI map import system is overhauled with automatic image preprocessing, per-detection confidence scoring, an interactive manual review workflow with zoom-and-drag corrections, and persistent learning that auto-applies prior corrections on re-scan.',
    changes: [
      {
        category: 'New Feature',
        icon: Wand2,
        title: 'Automatic Image Preprocessing',
        detail: 'Before AI analysis, uploaded map images are automatically enhanced: small images are upscaled up to 2× for better text recognition, contrast is boosted ~45% to sharpen text edges, brightness is slightly increased, and color saturation is enriched. This significantly improves detection accuracy in dense map areas with overlapping streets and postal codes.',
      },
      {
        category: 'New Feature',
        icon: ShieldCheck,
        title: 'Confidence Scoring & Color-Coded Indicators',
        detail: 'Every detected street, postal, highway, and landmark now receives a confidence score (0.0–1.0) from the AI. Detections are color-coded: 🟢 High Confidence (≥85%, auto-accepted), 🟡 Low Confidence (50–84%, flagged for review), 🔴 Manual Review Required (<50%, needs correction). Low-confidence detections are no longer automatically accepted.',
      },
      {
        category: 'New Feature',
        icon: MapPin,
        title: 'Interactive Manual Review Workflow',
        detail: 'After scanning, an import summary shows detected roads, streets, postals, overall AI confidence, and the number of items needing review. A collapsible "Review Required" panel lists only the items needing attention. Selecting an item zooms the map to its approximate location (2.5× zoom with smooth animation), highlights the area with a pulsing ring, and lets you drag the marker to reposition, edit the name/postal, and mark it as verified.',
      },
      {
        category: 'New Feature',
        icon: Sparkles,
        title: 'Persistent Learning — Corrections Are Remembered',
        detail: 'When you manually correct a street or postal, the correction is saved locally for that specific map image. If you re-scan or reimport the same map, prior corrections are automatically applied to matching detections (by position proximity), and auto-applied items are marked with a "learned" badge. Your map gets smarter over time — repeat imports require fewer manual fixes.',
      },
      {
        category: 'Improvement',
        icon: Zap,
        title: 'Staged Progress Animation & Enhanced AI Model',
        detail: 'The scanning process now shows a smooth staged progress bar with labels for each step: image enhancement → road detection → street extraction → postal reading → confidence scoring. The AI model has been upgraded to Gemini 3.1 Pro for improved accuracy in congested and dense map regions.',
      },
    ],
  },
  {
    version: 'v0.8',
    date: 'July 12, 2026',
    title: 'Four New CAD Interface Themes + Icon Refresh',
    tag: 'Major',
    tagColor: 'bg-crimson/20 text-crimson border-crimson/30',
    icon: Palette,
    summary: 'Four new selectable CAD interface themes — Tactical, EOC, Cyber Ops, and First Responder — join Modern and Retro, plus a refresh of in-CAD navigation icons to match the website.',
    changes: [
      {
        category: 'New Feature',
        icon: Palette,
        title: 'Tactical Theme — Military Command Center',
        detail: 'A modern military operations center aesthetic inspired by NATO command centers and Blue Force Tracker. Matte black backgrounds with olive-green and dark-gray surfaces, amber accent colors, and tactical-green highlights. Square corners (5px), thin outlined buttons, an animated grid background overlay, mono coordinate-style fonts for data fields, and an enhanced pulse animation on P1 emergency incidents. Perfect for serious FiveM realism servers.',
      },
      {
        category: 'New Feature',
        icon: Palette,
        title: 'EOC Theme — Emergency Operations Center',
        detail: 'Inspired by real emergency management software (FEMA, state EOCs, 911 communications centers). A clean, professional light theme — white surfaces on a light-gray base with navy-blue headers, red alert accents, and orange warning highlights. Soft shadows, larger typography, information-dense cards, and minimal glow. All text colors flip to dark for readability on the light background.',
      },
      {
        category: 'New Feature',
        icon: Palette,
        title: 'Cyber Ops Theme — Futuristic',
        detail: 'A premium sci-fi command interface inspired by modern SOC dashboards. Dark charcoal backgrounds with electric cyan, purple, magenta, and neon-blue accents. Glass panels with neon borders, glow effects on hover, animated drifting gradient overlays, focus glow on inputs, and a magenta pulse on P1 incidents. Showcases the AI features and makes the interface feel cutting-edge without becoming cheesy.',
      },
      {
        category: 'New Feature',
        icon: Palette,
        title: 'First Responder Theme — Department Colors',
        detail: 'A theme based on emergency-services identity rather than a pure aesthetic. Shared UI elements stay on a neutral dark base, while each department panel adopts its own accent color throughout: Police = blue, Fire = red, EMS = green, Dispatch = gold. The accent color dynamically changes based on which panel is currently active, improving usability and making department context instantly clear when switching panels.',
      },
      {
        category: 'Improvement',
        icon: Sparkles,
        title: 'CAD Navigation Icon Refresh',
        detail: 'The in-CAD navigation bar icons were updated to match the website feature icons: Dispatch now uses the Radio icon (matching the website), Police uses Shield, Civilian uses User, the static Map tab uses Map, Live Map uses MapPin, and Settings uses the Settings icon. This creates visual consistency between the marketing site and the CAD interface.',
      },
    ],
  },
  {
    version: 'v0.7',
    date: 'July 12, 2026',
    title: 'Home Page Redesign — QoL Update 1',
    tag: 'QoL',
    tagColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: Sparkles,
    summary: 'A quality-of-life update focused on the home page experience — new headline, comparison section, community showcase, animated feature cards, and a bold final CTA.',
    changes: [
      {
        category: 'New Section',
        icon: Sparkles,
        title: 'Updated Home Page Headline',
        detail: 'The home page headline was updated from "Command Your Operations" to "The Ultimate CAD Platform for FiveM & Roleplay Communities" with a new subheading describing the full scope of the platform: dispatch, law enforcement, fire, EMS, civilians, training, and server operations — all from one powerful platform built for realism.',
      },
      {
        category: 'New Section',
        icon: Sparkles,
        title: 'Why Communities Choose VanguardOS — Comparison Section',
        detail: 'A new comparison section was added to the home page, comparing VanguardOS against traditional CAD systems across 7 dimensions: AI Assisted Dispatch, Modern Interface, Built-in LMS, Live Maps, Server Discovery, Department Management, and Custom Themes. Each row shows what VanguardOS offers (green checkmark) vs what traditional CAD tools lack (grey X), with animated entrance effects on scroll.',
      },
      {
        category: 'New Section',
        icon: Users,
        title: 'Community Showcase Section',
        detail: 'A new community section was added with four visually appealing cards featuring hover animations: Featured Servers (scrolls to server discovery), Discord Community (join link), Staff Team (applications), and Recent Updates (update log). Each card has a colored icon with scale-on-hover, a radial glow effect on hover, and a lift animation powered by Framer Motion.',
      },
      {
        category: 'Enhancement',
        icon: Sparkles,
        title: 'Animated Feature Cards',
        detail: 'The feature highlights section now uses Framer Motion entrance animations. Each of the 11 feature cards fades in and slides up with a staggered delay (0.06s per card) as it enters the viewport, creating a polished scroll experience. The existing hover effects (border glow, background tint, screenshot zoom) remain intact.',
      },
      {
        category: 'New Section',
        icon: Zap,
        title: 'Final Call-to-Action Section',
        detail: 'A bold full-width CTA section was added before the footer with the headline "Ready to Modernize Your Roleplay Server?" and a subheading about creating a free server in seconds. Features a crimson gradient background with a radial glow, a "Create Your Server" button (triggers the create server dialog), and a "Read the Docs" link. The section scales in on scroll via Framer Motion.',
      },
      {
        category: 'Improvement',
        icon: Bot,
        title: 'Support Buttons Now Open AI Assistant',
        detail: 'All "Contact Support", "Submit Feedback", "Get Support", and "Bug Reports" links across the site (footer, FAQ, About page hero + CTA card, Updates page) now open the floating AI assistant panel instead of redirecting to the admin-only Bug Reports page. A shared helper (openAIAssistant) dispatches a window event that the FloatingAI component listens for and opens the panel.',
      },
      {
        category: 'Improvement',
        icon: MapPin,
        title: 'AI Map Extraction — Faster & More Reliable',
        detail: 'The AI-powered street extraction for custom map uploads was switched from Claude Sonnet to Gemini Flash for significantly faster processing. The prompt was rewritten to be more concise and reliable — the previous prompt demanded 200-300 locations per scan, which caused timeouts and empty results. The new prompt extracts whatever the AI can clearly identify with the same coordinate accuracy and blurry-area fallback naming.',
      },
    ],
  },
  {
    version: 'v0.6',
    date: 'July 7, 2026',
    title: 'Live Map DMs, Position History & Retro Theme Overhaul',
    tag: 'Major',
    tagColor: 'bg-crimson/20 text-crimson border-crimson/30',
    icon: Radio,
    summary: 'A comprehensive update focused on dispatcher-unit communication, movement tracking, and visual customization.',
    changes: [
      {
        category: 'New Feature',
        icon: MessageSquare,
        title: 'Dispatcher-to-Unit Direct Messaging',
        detail: 'Dispatchers can now send direct messages to on-duty units directly from the Live Dispatch Map. Messages are delivered in real-time with unread badge counts. The DM button (labeled "DMs" with a MessageSquare icon) is visible to all authorized personnel — dispatch, police, fire, and EMS — not just dispatch. A dedicated inbox panel shows conversation threads with each unit, and recipients see read/unread states.',
      },
      {
        category: 'New Feature',
        icon: MapPin,
        title: 'Unit Position History Tracking',
        detail: 'A new UnitPositionHistory entity logs every position update a unit makes on the live map. Dispatchers can open the history panel on any unit to see a retrospective trail of movements — including timestamps, coordinates (x/y percentage), and the nearest postal/street. This creates a full audit trail of unit activity during a session and is always available to dispatch (no longer gated behind a toggle).',
      },
      {
        category: 'Enhancement',
        icon: Palette,
        title: 'Retro CAD Theme (Early 2000s)',
        detail: 'Server owners can now choose between "Modern" (default) and "Retro" interface themes from Settings → General. The retro theme recreates the classic early-2000s desktop CAD aesthetic with beveled 3D panels, gradient navy title bars, Tahoma typography, and sunken inset input fields — all on a refined dark palette (no harsh bright silver/white). Glass cards, inputs, and text colors are overridden for full visual consistency.',
      },
      {
        category: 'Enhancement',
        icon: Bot,
        title: 'AI Map Extraction — Higher Accuracy',
        detail: 'The AI-powered street/postal extraction (used for custom map uploads) has been significantly improved. The system now enforces a minimum of 200-300 locations per scan with a self-check instruction — if fewer than 200 are found, it re-scans more carefully. Blurry or ambiguous regions are no longer skipped; the AI generates area-based fallback names (e.g. "Area: NE Residential" with codes like "NE-01").',
      },
      {
        category: 'Content',
        icon: Scale,
        title: 'Expanded Default Penal Code',
        detail: 'The default penal code library grew from ~44 charges to 91. 47 new traffic and petty-crime charges were added including: red light violations (VC 21453), stop sign failures, speeding tiers, driving without/suspended license, no proof of insurance, expired registration, window tint, exhaust noise, cell phone use, open container, street racing, reckless evading, joyriding, failure to yield, trespassing, petty theft, vandalism, solicitation, public intoxication, fare evasion, credit card fraud, and more.',
      },
      {
        category: 'Improvement',
        icon: MapPin,
        title: 'Preset Map Data Refreshed',
        detail: 'Both built-in map presets (ER:LC Liberty County and Los Santos/GTA V) had their street/postal databases expanded from ~100 to ~155 entries each. New areas added include East Industrial, West Suburban, Sandy Shores, Chumash, Chamberlain Hills, and more — with improved coordinate accuracy across the board.',
      },
      {
        category: 'Change',
        icon: Layers,
        title: 'Marketplace Page Removed',
        detail: 'The dedicated Marketplace page has been removed from navigation. Server discovery remains fully functional through the home page "Discover Servers" section, which provides the same search, join, and browsing capabilities. The marketplace route was deprecated to streamline navigation.',
      },
    ],
  },
  {
    version: 'v0.5',
    date: 'June 2026',
    title: 'Email Notifications & Community Engagement',
    tag: 'Feature',
    tagColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: Bell,
    summary: 'Introduced opt-in email notifications for server members to stay informed about sessions and training.',
    changes: [
      {
        category: 'New Feature',
        icon: Bell,
        title: 'Email Notification System',
        detail: 'Server owners can enable email notifications from Settings → Notifications. Members can subscribe with an optional department label (visible only to themselves). The system respects privacy — subscriber emails are never shown to other users. A Notify tab appears in the CAD when enabled.',
      },
      {
        category: 'New Feature',
        icon: Users,
        title: 'EMS SOP Document Support',
        detail: 'Servers can now attach an EMS Scope of Practice / SOP document URL. This gives EMS personnel quick access to their medical protocols directly within the CAD environment.',
      },
    ],
  },
  {
    version: 'v0.4',
    date: 'May 2026',
    title: 'Live Map System Un-Gated & AI Dispatch Refinements',
    tag: 'Major',
    tagColor: 'bg-crimson/20 text-crimson border-crimson/30',
    icon: Zap,
    summary: 'The Live Map System moved from a paid/premium feature to free for all servers, encouraging wider adoption.',
    changes: [
      {
        category: 'Change',
        icon: Zap,
        title: 'Live Map System — Free for All',
        detail: 'The Live Dispatch Map and all associated features (unit pings, position tracking, postal detection) are no longer gated behind a premium subscription. All servers — free and premium — can now enable and use the full live map system.',
      },
      {
        category: 'Enhancement',
        icon: MapPin,
        title: 'Department-Colored Map Pins & Logos',
        detail: 'Unit pins on the live dispatch map are now color-coded by department type (Police = blue, Fire = orange, EMS = red, Dispatch = emerald). Department logos are rendered on pins when available, giving dispatchers instant visual identification.',
      },
      {
        category: 'Enhancement',
        icon: Bot,
        title: 'Dispatch AI — Improved Context',
        detail: 'The AI Dispatch Assistant received context improvements for better understanding of live call queues and unit rosters. Response accuracy for assignment suggestions and call summaries was improved.',
      },
      {
        category: 'Enhancement',
        icon: Clock,
        title: 'Configurable Unit Ping Interval',
        detail: 'Server owners can now configure how often (in seconds) on-duty units are prompted to update their location. Default is 120 seconds. Units that ignore 4+ reminders have their callsign turn red in the dispatch sidebar.',
      },
    ],
  },
  {
    version: 'v0.3',
    date: 'April 2026',
    title: 'Custom Maps, AI Extraction & Tone System Polish',
    tag: 'Feature',
    tagColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: MapPin,
    summary: 'Introduced custom map uploads with AI-powered street extraction, plus refinements to the dispatch tone engine.',
    changes: [
      {
        category: 'New Feature',
        icon: MapPin,
        title: 'Custom Map Upload + AI Street Extraction',
        detail: 'Server owners can now upload their own map image and use AI to automatically extract all visible street names and postal codes with coordinates. The AI divides the image into a grid, estimates positions, and generates area fallback names for ambiguous regions. Extracted data powers postal detection for unit location pings.',
      },
      {
        category: 'New Feature',
        icon: MapPin,
        title: 'ER:LC & Los Santos Map Presets',
        detail: 'Two built-in map presets were added: ER:LC (Emergency Response: Liberty County) and Los Santos (GTA V / FiveM). Both come pre-loaded with postal codes and street data so servers can use them immediately without extraction.',
      },
      {
        category: 'New Feature',
        icon: MapPin,
        title: 'Interactive Unit Location Picker',
        detail: 'Units set their map position by clicking a 📍 Navigation button in their panel header. A map dialog opens, they click their location, and the nearest postal code and street name are auto-detected. The position syncs to the live map in real-time.',
      },
      {
        category: 'Enhancement',
        icon: Radio,
        title: 'Tone Engine Refinements',
        detail: 'The Web Audio API tone engine was polished for cleaner audio synthesis. Standard, Priority, and Emergency tones are now more distinct in pitch and rhythm, making call urgency recognizable by sound alone.',
      },
    ],
  },
  {
    version: 'v0.2',
    date: 'March 2026',
    title: 'Platform Launch — Full CAD Suite',
    tag: 'Launch',
    tagColor: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    icon: Sparkles,
    summary: 'The complete VanguardOS CAD platform launched with all core modules, real-time sync, and AI integration.',
    changes: [
      {
        category: 'New Feature',
        icon: Radio,
        title: 'Live Dispatch Board',
        detail: 'Real-time call creation with P1–P4 priority sorting, unit assignment flows, call notes logging, and Signal 100 emergency protocol. All updates push live to every connected client via entity subscriptions — no polling, no refreshes.',
      },
      {
        category: 'New Feature',
        icon: Bot,
        title: 'AI Dispatch Assistant',
        detail: 'An optional LLM-powered agent embedded in the dispatch panel with direct context access to the live call queue and unit roster. Helps dispatchers generate summaries, suggest assignments, and answer tactical questions in real time.',
      },
      {
        category: 'New Feature',
        icon: Radio,
        title: 'Radio Channel System',
        detail: 'In-CAD radio channels with department-restricted access, live participant tracking, and admin-controlled channel creation. Ties directly into the audio tone engine for a unified communications experience.',
      },
      {
        category: 'New Feature',
        icon: Users,
        title: 'Profile & Community Directory',
        detail: 'Platform-wide user profiles with customizable display name, bio, avatar, banner, accent color, and badges. Includes a searchable member directory with community reviews and ratings.',
      },
      {
        category: 'New Feature',
        icon: Scale,
        title: 'Penal Code Manager',
        detail: 'Server owners can define a full penal code library with offense codes, titles, categories, fines, and jail times. Accessible to all members during active patrol operations.',
      },
      {
        category: 'New Feature',
        icon: Layers,
        title: 'Role-Based Access Control',
        detail: 'Fine-grained permission management per server: Owner, Admin, Moderator, and Member roles, each with configurable department access keys (Police, Fire, EMS, Dispatch) and CAD panel permissions.',
      },
    ],
  },
  {
    version: 'v0.1',
    date: 'January 2026',
    title: 'Core CAD Architecture & Department Panels',
    tag: 'Launch',
    tagColor: 'bg-white/10 text-white/50 border-white/20',
    icon: Wrench,
    summary: 'The foundational data model and all department-specific operation panels were built from the ground up.',
    changes: [
      {
        category: 'New Feature',
        icon: Wrench,
        title: 'Core Data Model',
        detail: 'Built the foundational entity model — Servers, Units, Calls, Members, Civilians, IncidentReports, and more. Real-time subscriptions via live entity sync were wired in from day one.',
      },
      {
        category: 'New Feature',
        icon: Radio,
        title: 'Dispatch Panel & Tone Engine',
        detail: 'The dispatch board shipped with priority queuing, P1–P4 call cards, unit assignment flows, and a fully custom Web Audio API tone engine for standard, priority, and emergency alerts.',
      },
      {
        category: 'New Feature',
        icon: Sparkles,
        title: 'Law Enforcement Panel',
        detail: 'Full LEO panel — on-duty management, callsign/rank/RP name tracking, status codes (10-8 through 10-42), civilian database lookups, vehicle plate searches, and incident reporting with supervisor review.',
      },
      {
        category: 'New Feature',
        icon: Sparkles,
        title: 'Fire / EMS Panel',
        detail: 'Fire and EMS operations panel — apparatus type selection, ICS-aligned protocols, and department-specific incident report types for structured scene documentation.',
      },
      {
        category: 'New Feature',
        icon: Users,
        title: 'Civilian Panel & Database',
        detail: 'Multi-character civilian support — personal profiles with physical descriptions, DL status, vehicle registration, and flags. All data queryable in real time by LEO units during active stops.',
      },
      {
        category: 'New Feature',
        icon: Sparkles,
        title: 'Training & LMS',
        detail: 'The learning management system launched with tiered certification per department (LEO, Fire, EMS, Dispatch). Server owners can create custom training modules with Markdown content and multiple-choice exams.',
      },
    ],
  },
];

function ChangeCard({ change }) {
  const [open, setOpen] = useState(false);
  const Icon = change.icon;
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-all"
      >
        <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon size={13} className="text-white/60" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] uppercase tracking-widest font-bold text-crimson bg-crimson/10 px-1.5 py-0.5 rounded">{change.category}</span>
            <span className="text-white font-semibold text-sm">{change.title}</span>
          </div>
          {!open && <p className="text-white/40 text-xs mt-1 line-clamp-1">{change.detail}</p>}
        </div>
        <ChevronDown size={14} className={`text-white/30 flex-shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] ml-10">
          <p className="text-white/55 text-sm leading-relaxed">{change.detail}</p>
        </div>
      )}
    </div>
  );
}

export default function UpdateLog() {
  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <header className="border-b border-crimson/20 bg-[#1a0000]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="text-white/40 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
          <VanguardLogo size="sm" />
          <span className="text-white/30 text-sm">/ Updates</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-crimson/10 border border-crimson/20 mb-5">
            <GitBranch size={24} className="text-crimson" />
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Update Log</h1>
          <p className="text-white/40 text-sm max-w-lg leading-relaxed">
            A complete, in-depth record of every VanguardOS update — what shipped, what changed, and why. Sorted newest first.
          </p>
        </div>

        {/* Updates */}
        <div className="space-y-12">
          {UPDATES.map((update, i) => {
            const UpdateIcon = update.icon;
            return (
              <div key={update.version} className="relative">
                {/* Timeline dot + line */}
                <div className="flex gap-5">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${update.tagColor}`}>
                      <UpdateIcon size={18} />
                    </div>
                    {i < UPDATES.length - 1 && <div className="w-px flex-1 bg-white/[0.08] my-2 min-h-[40px]" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span className="text-white font-black text-xl">{update.version}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${update.tagColor}`}>{update.tag}</span>
                      <span className="text-white/30 text-xs">{update.date}</span>
                    </div>
                    <h2 className="text-white/80 font-semibold text-base mb-1">{update.title}</h2>
                    <p className="text-white/45 text-sm leading-relaxed mb-4">{update.summary}</p>

                    {/* Changes */}
                    <div className="space-y-2">
                      {update.changes.map((change, j) => (
                        <ChangeCard key={j} change={change} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] text-center">
          <p className="text-white/30 text-sm mb-3">Want to suggest a feature or report a bug?</p>
          <button onClick={openAIAssistant} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-crimson/30 bg-crimson/10 text-crimson text-sm font-semibold hover:bg-crimson/20 transition-all">
            <Bug size={14} /> Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}