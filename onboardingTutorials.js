import {
  UserCircle2, Users, Server, Compass, Radio, Shield, Flame, MapPin,
  FileText, Bot, Bug, BookOpen, CheckCircle2, ClipboardList, Navigation, Database, ShieldAlert
} from 'lucide-react';

export const TUTORIAL_CATEGORIES = [
  { id: 'getting-started', name: 'Getting Started', color: 'text-crimson' },
  { id: 'panels', name: 'CAD Panels', color: 'text-blue-400' },
  { id: 'features', name: 'Features & Tools', color: 'text-emerald-400' },
];

export const ONBOARDING_TUTORIALS = [
  {
    id: 'create-profile',
    title: 'Creating a VanguardOS Profile',
    description: 'Set up your display name, avatar, and bio',
    icon: UserCircle2,
    category: 'getting-started',
    steps: [
      { title: 'Access Your Profile', description: 'Click your profile icon in the top navigation bar to open your profile page. This is your public-facing identity across VanguardOS.', icon: UserCircle2 },
      { title: 'Set Your Display Name', description: 'Enter your preferred display name — this is how other users see you across all servers and the member directory.', icon: UserCircle2 },
      { title: 'Add an Avatar', description: 'Upload an avatar image and an optional banner to personalize your profile. These appear on your profile card.', icon: UserCircle2 },
      { title: 'Write a Bio', description: 'Add a short bio and choose an accent color for your profile badge. Save when done — your profile is now live.', icon: CheckCircle2 },
    ],
  },
  {
    id: 'join-server',
    title: 'Joining an Existing Server',
    description: 'Find and join a community',
    icon: Users,
    category: 'getting-started',
    steps: [
      { title: 'Browse Servers', description: 'From the home page, scroll to Discover Servers to browse public communities. Each card shows the server name, description, and member count.', icon: Users },
      { title: 'Join a Public Server', description: 'Click any server card to join instantly. You\'ll be added as a member and redirected to the CAD.', icon: Users },
      { title: 'Join with an Invite Code', description: 'If you have a Community ID from a server owner, click "Join with ID" on the home page, enter the code, and join.', icon: Users },
      { title: 'Get Department Access', description: 'After joining, you start as a Member. Ask your server\'s admin for department keys to access Police, Fire/EMS, or Dispatch panels.', icon: CheckCircle2 },
    ],
  },
  {
    id: 'create-server',
    title: 'Creating a New Server',
    description: 'Start your own community',
    icon: Server,
    category: 'getting-started',
    steps: [
      { title: 'Open the Create Dialog', description: 'Click "Create Server" in the top navigation bar on the home page to open the creation dialog.', icon: Server },
      { title: 'Name Your Server', description: 'Enter a name and description for your community. This is what members will see in the server directory.', icon: Server },
      { title: 'Auto-Setup', description: 'Three default departments (Police, Fire, Dispatch) are created automatically. You\'re assigned the Owner role with full access.', icon: Server },
      { title: 'Share Your Invite Code', description: 'A unique Community ID is generated — share it with your members so they can join. Configure departments, tones, and themes in Settings.', icon: CheckCircle2 },
    ],
  },
  {
    id: 'basic-cad-nav',
    title: 'Basic CAD Navigation',
    description: 'Learn the CAD interface layout',
    icon: Compass,
    category: 'getting-started',
    steps: [
      { title: 'Navigation Tabs', description: 'The top of the CAD shows department tabs — Dispatch, Police, Fire/EMS, Civilian, Admin. Click any tab to switch panels. Your access depends on department keys.', icon: Compass },
      { title: 'Status Bar', description: 'When on duty, a sticky header shows your callsign, status, and assigned call. Use the status dropdown to update your 10-code at any time.', icon: Compass },
      { title: 'Sub-Tabs', description: 'Within each panel, sub-tabs provide access to features like Units, Database, Reports, Radio, and Penal Code. Explore each tab to see what\'s available.', icon: Compass },
      { title: 'Help Menu', description: 'The handbook icon opens role-specific operating guides. The help menu also links to the Learning Center for tutorials.', icon: BookOpen },
      { title: 'You\'re Ready', description: 'You now know the basics. Explore each panel\'s tutorial for detailed workflows.', icon: CheckCircle2 },
    ],
  },
  {
    id: 'using-dispatch',
    title: 'Using Dispatch',
    description: 'Manage calls and assign units',
    icon: Radio,
    category: 'panels',
    steps: [
      { title: 'Create a Call', description: 'In the Dispatch panel, click "New Call" to open the call dialog. Enter the call type, priority (P1–P4), location, and description.', icon: Radio },
      { title: 'Assign Units', description: 'Click an active call to open its details. Click "Assign Unit" to see a list of available units. Dynamic recommendations show the best-fit units with confidence scores.', icon: Radio },
      { title: 'Track Units', description: 'The right sidebar shows all on-duty units with their status codes. Monitor 10-8 (available), 10-6 (busy), 10-97 (on scene) in real time.', icon: Radio },
      { title: 'Add Notes', description: 'Open any call to add dispatch notes with timestamps. Notes are inherited by reports created from that call via the Incident ID system.', icon: Radio },
      { title: 'Close Calls', description: 'When a call is resolved, change its status to Closed. Assigned officers can then create reports pre-filled with the call\'s data.', icon: CheckCircle2 },
    ],
  },
  {
    id: 'using-police',
    title: 'Using the Law Enforcement Panel',
    description: 'Go on duty, search databases, file reports',
    icon: Shield,
    category: 'panels',
    steps: [
      { title: 'Go On Duty', description: 'In the Police panel, click "Go On Duty". Enter your roleplay name, callsign, vehicle, and select your agency. You\'ll appear on the board with 10-8 status.', icon: Shield },
      { title: 'Update Status', description: 'Use the status dropdown to update your 10-code: 10-8 (in service), 10-11 (traffic stop), 10-97 (on scene), 10-6 (busy writing reports).', icon: Shield },
      { title: 'Database Search', description: 'The Database tab lets you search civilians by name or license, and plates by number. Expand any record to see full details, flags, and prior reports.', icon: Database },
      { title: 'Officer Safety Alerts', description: 'If enabled by your server, safety alerts appear as pulsing red banners when searching flagged persons, vehicles, or addresses. Always read these before approaching.', icon: ShieldAlert },
      { title: 'File Reports', description: 'Use the Reports tab to file incident reports. Click "From Call" to auto-fill report data from a linked dispatch call. Submit for supervisor approval.', icon: FileText },
    ],
  },
  {
    id: 'fire-ems-workflow',
    title: 'Fire & EMS Workflow',
    description: 'Apparatus management and patient documentation',
    icon: Flame,
    category: 'panels',
    steps: [
      { title: 'Go On Duty', description: 'In the Fire/EMS panel, click "Go On Duty". Select Fire or EMS type, enter your apparatus callsign (e.g. Engine-1, Medic-7), and choose your agency.', icon: Flame },
      { title: 'Respond to Calls', description: 'When dispatched, set status to 10-97 on arrival. Establish Incident Command if first on scene and conduct a scene size-up.', icon: Flame },
      { title: 'Patient Care (EMS)', description: 'Follow the assessment sequence: Scene Safety → General Impression → ABC → SAMPLE History → Vitals → Treatment → Transport. Document in your report.', icon: Flame },
      { title: 'File Reports', description: 'Use the Reports tab to document incidents. Fire reports include apparatus, cause, and damage. EMS reports include patient info, transport, and hospital.', icon: FileText },
      { title: 'Crash Reconstruction', description: 'The Crash tab (if you have permission) provides an interactive canvas for documenting motor vehicle collisions with vehicles, skid marks, and evidence markers.', icon: CheckCircle2 },
    ],
  },
  {
    id: 'civilian-workflow',
    title: 'Civilian Workflow',
    description: 'Create characters and manage vehicles',
    icon: Users,
    category: 'panels',
    steps: [
      { title: 'Create a Character', description: 'In the Civilian panel, create a new character with name, DOB, address, physical description, occupation, and contact info.', icon: Users },
      { title: 'Driver\'s License', description: 'Your character starts with a valid driver\'s license. Officers can update its status (Suspended, Revoked) during traffic stops.', icon: Users },
      { title: 'Register Vehicles', description: 'Add vehicles with plate numbers, make, model, color, and year. Plate status can be flagged as Stolen or Suspended by law enforcement.', icon: Users },
      { title: 'Flags', description: 'Officers can add safety flags to your character (Armed & Dangerous, Flight Risk, etc.). These are visible to all officers during database searches.', icon: ShieldAlert },
      { title: 'Multiple Characters', description: 'You can create multiple civilians in the same server. Each is independent with its own license, vehicles, and flags.', icon: CheckCircle2 },
    ],
  },
  {
    id: 'live-map',
    title: 'Live Map Overview',
    description: 'Real-time unit tracking and messaging',
    icon: MapPin,
    category: 'features',
    steps: [
      { title: 'Open the Map', description: 'The Map tab shows a live dispatch map with unit pins positioned in real time. Each pin is color-coded by department type (police, fire, EMS, dispatch).', icon: MapPin },
      { title: 'Unit Details', description: 'Click any unit pin to see its callsign, status, location, and last update time. Dispatchers can see all units; field units see on-duty colleagues.', icon: MapPin },
      { title: 'Location Updates', description: 'When prompted, use the location picker to update your position on the map. Your unit\'s map pin moves for all dispatchers and colleagues to see.', icon: Navigation },
      { title: 'Direct Messages', description: 'If enabled by the server, dispatchers can DM units from the map. Messages appear in the Messages tab and are marked read/unread.', icon: CheckCircle2 },
    ],
  },
  {
    id: 'report-creation',
    title: 'Report Creation and Approval',
    description: 'File, review, and approve incident reports',
    icon: FileText,
    category: 'features',
    steps: [
      { title: 'Create a Report', description: 'In your panel\'s Reports tab, click "New Report". Select the report type (arrest, traffic stop, use of force, incident, fire, EMS, supplement).', icon: FileText },
      { title: 'Inherit Call Data', description: 'If you have an assigned call, click "From Call" to auto-fill the report with the call\'s type, location, dispatch notes, and responding units via the Incident ID.', icon: FileText },
      { title: 'Smart Report Builder', description: 'If enabled by your server, the form adapts based on type: traffic stops show driver/vehicle/citation fields, arrests show charges/booking/Miranda, EMS shows patient/transport/hospital.', icon: FileText },
      { title: 'Submit for Review', description: 'Write your narrative in first person, past tense. Include all parties, times, and locations. Submit for supervisor approval.', icon: ClipboardList },
      { title: 'Supervisor Approval', description: 'Supervisors see pending reports in the Supervisor panel. They can approve, reject with notes, or request supplements. The Call History tab tracks which reports are still needed.', icon: CheckCircle2 },
    ],
  },
  {
    id: 'ai-dispatch',
    title: 'AI Dispatch Assistant Features',
    description: 'Leverage AI for dispatch support',
    icon: Bot,
    category: 'features',
    steps: [
      { title: 'AI Assistant Panel', description: 'The AI Dispatch Assistant provides real-time operational support. Ask questions about active calls, unit availability, and recommended responses.', icon: Bot },
      { title: 'Dynamic Recommendations', description: 'When assigning units, the system shows scored recommendations based on availability, department compatibility, assignment status, and GPS data.', icon: Bot },
      { title: 'AI Map Import', description: 'Server admins can upload a map image and the AI automatically extracts streets, postals, and landmarks with confidence scoring and a manual review workflow.', icon: MapPin },
      { title: 'Owner AI Assistant', description: 'Server owners have access to an AI assistant for server management, configuration help, and operational guidance.', icon: CheckCircle2 },
    ],
  },
  {
    id: 'bug-reports',
    title: 'Submitting Bug Reports and Feature Requests',
    description: 'Report issues and suggest improvements',
    icon: Bug,
    category: 'features',
    steps: [
      { title: 'Open Bug Reports', description: 'Navigate to the Bug Reports page from the home page footer or navigation. This is where you report issues and request features.', icon: Bug },
      { title: 'Describe the Issue', description: 'Enter a clear title and description. Include steps to reproduce the bug so the development team can replicate it.', icon: Bug },
      { title: 'Set Severity', description: 'Choose a severity level: Low (minor inconvenience), Medium (feature broken), High (major feature down), Critical (platform unusable).', icon: Bug },
      { title: 'Track Status', description: 'Bug reports move through statuses: Open → In Progress → Resolved → Closed. You can check back anytime to see updates.', icon: CheckCircle2 },
    ],
  },
];

// --- Helpers ---

export function startTutorial(tutorialId) {
  window.dispatchEvent(new CustomEvent('vos-start-tutorial', { detail: tutorialId }));
}

export function markTutorialComplete(tutorialId) {
  const completed = getCompletedTutorials();
  if (!completed.includes(tutorialId)) {
    completed.push(tutorialId);
    localStorage.setItem('vos-onboarding-completed', JSON.stringify(completed));
  }
  window.dispatchEvent(new CustomEvent('vos-tutorial-completed', { detail: tutorialId }));
}

export function getCompletedTutorials() {
  try {
    return JSON.parse(localStorage.getItem('vos-onboarding-completed') || '[]');
  } catch (e) {
    return [];
  }
}

export function isTutorialComplete(tutorialId) {
  return getCompletedTutorials().includes(tutorialId);
}

export function hasSeenOnboardingPrompt() {
  return !!localStorage.getItem('vos-onboarding-prompted');
}

export function markOnboardingPrompted() {
  localStorage.setItem('vos-onboarding-prompted', '1');
}