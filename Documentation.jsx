import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Book, Radio, Shield, Flame, MonitorSpeaker, Users, Settings, GraduationCap, UserCircle2, AlertTriangle, FileText, Mic, MapPin, BarChart2, BadgeCheck, Search, Zap } from 'lucide-react';
import VanguardLogo from '@/components/VanguardLogo';

const DOCS = [
  {
    category: 'Getting Started',
    icon: Book,
    color: 'text-crimson',
    articles: [
      {
        title: 'What is VanguardOS?',
        content: `VanguardOS is **The Modern CAD Built for Serious Roleplay Communities** — a web-based Computer-Aided Dispatch platform designed to help you spend less time managing the CAD and more time roleplaying. It delivers faster dispatching, less repetitive paperwork, better situational awareness, and smarter workflows through a modern, intuitive interface.

**Core modules include:**
- Live Dispatch Board with call creation, priority management, unit assignment, and auto-generated Incident IDs
- Law Enforcement Panel with status tracking, database lookups, Officer Safety Alerts, Crash Reconstruction, and reporting
- Fire & EMS Panel for apparatus management and incident documentation
- Civilian Panel for character creation and vehicle management
- Supervisor Panel with report reviews, unit oversight, and Call History with report completion tracking
- Training & Certification (LMS) system for department-level education
- Server Administration with member management, penal codes, and custom departments
- Radio Channel system with department-based access controls
- AI Dispatch Assistant for real-time operational support with dynamic dispatch recommendations
- Live Dispatch Map with real-time unit pins, position history, and direct messaging
- Smart Report Builder with type-adaptive forms (traffic stop, arrest, fire, EMS)
- Six CAD interface themes (modern, retro, tactical, EOC, cyber ops, first responder)
- Cinematic welcome experience with ambient music on first visit
- Email notification system for session and training alerts
- Granular per-member permissions for Officer Safety and Crash Reconstruction tools
- Interactive Learning Center with 12 guided onboarding tutorials
- Custom keyboard shortcuts with per-user preferences
- Mobile companion mode for on-the-go access
- Dispatcher focus mode for distraction-free dispatching
- Server template import/export for quick setup
- Mini popup notifications for dispatch actions
- Undo protection for destructive actions
- Operational Replay system for after-action incident review
- Command Mode (EOC-style live operational overview for dispatchers)

VanguardOS is **not affiliated** with any real-world agency. It is a simulation platform built for immersive roleplay.`,
      },
      {
        title: 'Creating Your First Server',
        content: `To create a server on VanguardOS:

1. Log in with your account
2. Click **Create Server** in the top navigation bar
3. Enter a name and description for your community
4. Click **Create Server** — your server is ready immediately

**What happens automatically:**
- Three default departments are created: Police Department (PD), Fire Department (FD), Dispatch (DSP)
- You are assigned the **Owner** role with full access to all panels
- A unique **Community ID** (invite code) is generated — share this with your members

**Next steps after creation:**
- Go to **Settings** to customize departments, tones, and appearance
- Share your Community ID with members so they can join
- Configure department access keys for your members in the **Admin** panel`,
      },
      {
        title: 'Joining a Server',
        content: `**To join a public server:**
1. From the home page, browse **Discover Servers**
2. Click on any server card to join

**To join with an invite code:**
1. Click **Join with ID** on the home page
2. Enter the **Community ID** provided by the server owner
3. You'll be automatically added as a member and redirected to the CAD

**After joining:**
- You start with **Member** role — access is limited to the Civilian panel by default
- The server **Owner or Admin** must grant you department keys to access Police, Fire/EMS, or Dispatch panels
- You can access the **Map** tab at any time
- To get your access updated, contact your server's admin`,
      },
      {
        title: 'Roles & Permissions',
        content: `VanguardOS has two levels of roles: **Platform Roles** (global) and **Server Roles** (per-server).

**Server Roles:**
| Role | Description |
|------|-------------|
| Owner | Full access, cannot be removed or demoted |
| Admin | Access to Admin panel, all CAD panels, can manage members |
| Moderator | Moderation access, can view audit logs |
| Member | Access determined by department keys |

**Department Keys (granted by Admins):**
| Key | Panel Unlocked |
|-----|---------------|
| Police | Law Enforcement Panel |
| Fire | Fire/EMS Panel (Fire side) |
| EMS | Fire/EMS Panel (EMS side) |
| Dispatch | Dispatch Panel |

**Platform Roles** (managed by VanguardOS staff):
- Developer, Admin, Global Moderator, CAD Moderator, Community Manager`,
      },
    ],
  },
  {
    category: 'Dispatch',
    icon: MonitorSpeaker,
    color: 'text-emerald-400',
    articles: [
      {
        title: 'Dispatch Panel Overview',
        content: `The Dispatch Panel is the **operational hub** of the CAD. Dispatchers manage all incoming calls, coordinate unit responses, and maintain situational awareness across all departments.

**Layout:**
- **Left sidebar** — searchable list of all active units with status indicators
- **Main center area** — active call board with call cards sorted by priority
- **Right sidebar** — grouped unit list by department + radio channel access
- **Top bar** — tone controls, call counter, P1/P2 alerts, New Call button

**Key responsibilities of a dispatcher:**
1. Monitor the call board for incoming calls
2. Assign appropriate units to each call
3. Update call notes with scene developments
4. Close calls when units clear
5. Manage radio channel access and tones`,
      },
      {
        title: 'Creating & Managing Calls',
        content: `**Creating a new call:**
1. Click **New Call** in the top bar
2. Fill in:
   - **Type** — be specific (e.g. "Armed Robbery in Progress" not "Crime")
   - **Priority** — P1 Critical, P2 Urgent, P3 Routine, P4 Low
   - **Location** — exact address or cross streets
   - **Description** — full detail of the situation
   - **Caller Info** — name, callback number if applicable
3. Click **Create Call**

**Call Priority Guide:**
| Priority | Code | Situation | Indicator |
|----------|------|-----------|-----------|
| P1 | Critical | Life threat, active shooter, officer down | Red pulsing card |
| P2 | Urgent | Injury crash, fight in progress | Orange card |
| P3 | Routine | Non-injury crash, noise complaint | Yellow card |
| P4 | Low | Abandoned vehicle, cold report | Blue card |

**Call actions:**
- **Assign** — add a unit to the call; their status updates to 10-97
- **Add Note** — log scene developments, updates, descriptions
- **Close** — mark call complete; assigned units return to 10-8`,
      },
      {
        title: 'Tone System',
        content: `The tone system lets dispatchers broadcast audio alerts to all units before making a radio assignment.

**Built-in tone types:**
- 🔈 **Standard** — routine P3/P4 dispatches
- 🔔 **Priority** — P2 calls, urgent response needed
- 🚨 **Emergency** — P1 calls, Signal 100, officer needs assistance

**Using tones:**
1. Click a tone button in the top bar of the Dispatch panel
2. A sound plays client-side for the dispatcher (and any users with audio enabled)
3. Announce the call immediately after the tone

**Customizing tones:**
Server owners can rename and remap tones in **Settings → Tones**. Each tone has a name and a selectable sound from the tone library.`,
      },
      {
        title: 'Signal 100',
        content: `**Signal 100** is an emergency communications protocol that locks down all non-critical radio traffic.

**Activate Signal 100 when:**
- An officer is down or in immediate danger
- An active shooter or mass casualty event is in progress
- Command orders radio silence for tactical operations

**How to activate:**
1. Click the **SIG 100** button in the top-right of the CAD header (Admins/Owners only)
2. A red pulsing banner appears sitewide for all users in the server
3. Announce on all channels: *"All units, Signal 100 is in effect. Emergency traffic only."*

**Clearing Signal 100:**
- Click the **Clear** link in the Signal 100 banner
- Announce clearance on radio: *"All units, Signal 100 is now clear. Resume normal operations."*`,
      },
      {
        title: 'Unit Management',
        content: `The left and right sidebars display all active units across all departments.

**Click any unit** to open a detail dialog showing:
- Callsign and department
- Roleplay name
- Current status code
- On-duty time (calculated from when unit went on duty)
- Vehicle/Apparatus
- Last known location

**Unit status codes:**
| Code | Meaning | Color |
|------|---------|-------|
| 10-8 | Available / In Service | Green |
| 10-7 | Out of Service (available) | Amber |
| 10-6 | Busy — Do Not Disturb | Yellow |
| 10-97 | Arrived on Scene | Blue |
| 10-11 | Traffic Stop | Purple |
| 10-23 | Arrived / Standby | Cyan |
| 10-42 | Off Duty (hidden from board) | Gray |

**Red unit names:** If a unit's callsign appears in red in the left sidebar, they have ignored 4 or more location update reminders. Contact them on radio to prompt a map update.`,
      },
      {
        title: 'Operational Replay',
        content: `**Operational Replay** automatically records the complete timeline of every incident from creation through closure — an after-action review tool for supervisors, training staff, and administrators.

**What gets recorded:**
- Incident creation
- Unit assignments and additional responding units
- Unit status changes (en route, on scene)
- Priority changes
- Call notes
- Report submissions and approvals
- Incident closure

**Viewing a replay:**
1. Click the **Replay** button on any call card (dispatch panel) or call history entry (supervisor panel)
2. A dialog opens with a chronological event timeline and event details
3. Use playback controls: play/pause, skip forward/back, and adjustable speed (1x, 2x, 4x)
4. If unit position history exists, map data is available for movement replay

**Access:** Dispatchers, Supervisors, Admins, and Owners. Replays are read-only and do not modify the live dispatch workflow.`,
      },
      {
        title: 'Command Mode',
        content: `**Command Mode** is an optional full-screen operational overview for dispatchers — designed to feel like a real Emergency Operations Center.

**Accessing:** Click the **Command** button in the dispatch panel top bar (next to Focus Mode).

**What it shows:**
- Active incidents count with P1/P2 priority breakdown
- Units available vs committed (on scene, busy, traffic stop)
- Officer Safety Alerts status (on/off)
- Average response time (call creation to first assignment)
- Mutual aid calls (cross-department incidents)
- Incident locations list with priority indicators
- Recently escalated calls (P1/P2 created most recently)
- Unit status breakdown by code

**Pinning incidents:** Click the pin icon on any incident to pin it to the top for focused monitoring.

**Exiting:** Click the Exit button to return to the normal dispatch interface. Command Mode is a live overlay — it does not replace the dispatch workflow.`,
      },
    ],
  },
  {
    category: 'Law Enforcement',
    icon: Shield,
    color: 'text-blue-400',
    articles: [
      {
        title: 'Going On Duty',
        content: `**To go on duty as a police officer:**
1. Navigate to the **Police** tab in your server's CAD
2. Click **Go On Duty**
3. Fill in:
   - **Roleplay Name** — your in-character name (e.g. "John Smith")
   - **Callsign** — your unit identifier (e.g. "1-Adam-12", "Unit 42", "K9-3")
   - **Vehicle** — your patrol vehicle (e.g. "CVPI", "SUV", "Motorcycle")
   - **Agency** — select from configured departments
4. Click **Go On Duty**

You'll appear on the dispatch board with **10-8** status immediately. Use the dropdown in the unit bar to update your status as needed.

**Going off duty:**
Click **Off Duty** in the unit bar. Your unit is hidden from the board but your session remains active.`,
      },
      {
        title: 'Status Code Usage',
        content: `Always keep your status updated — dispatch depends on this for resource management.

| Code | Meaning | When to Use |
|------|---------|-------------|
| **10-8** | In Service | Default patrol status — available for calls |
| **10-7** | Out of Service | Meal break, brief administrative stop |
| **10-6** | Busy | Active scene, writing reports — do not disturb |
| **10-97** | On Scene | Set this when you arrive at a call location |
| **10-11** | Traffic Stop | Set immediately when initiating any traffic stop |
| **10-23** | Arrived / Standby | Arrived at a scene but awaiting instructions |
| **10-42** | Off Duty | When ending your shift |

**How to update:**
- Use the **status dropdown** in the top header bar of your panel
- OR click the **status badge** on your own unit card in the Units tab

Always update in real time — dispatch assigns calls based on your status.`,
      },
      {
        title: 'Civilian Database Search',
        content: `The **Database** tab inside the Police panel gives you access to the full civilian registry.

**Civilian Search:**
- Enter a full or partial name, DOB, or license number
- Results show: full name, DOB, physical description, address, occupation, nationality
- Driver's license status with ability to **update it directly**
- Registered vehicles with plate numbers and status
- Known flags (see below)

**License Plate Search:**
- Enter a plate number (partial or full)
- Results show: registered owner, vehicle description, registration status

**Updating Driver's License Status:**
1. Expand a civilian record by clicking it
2. Next to the DL Status, click the ✏️ **edit icon**
3. Select the new status: Valid, Suspended, Revoked, Expired, or None
4. Click ✓ to confirm — change is saved immediately

**Adding Flags / Tags:**
1. Expand a civilian record
2. Click the **+** icon next to Flags
3. Select a preset flag (Flight Risk, Aggressive, Mentally Ill, Armed & Dangerous, etc.) or type a custom one
4. Click ✓ — the flag appears on the record and is visible to all officers in your server
5. Hover a flag and click **×** to remove it

**License & Plate Status Meanings:**
| Status | Meaning |
|--------|---------|
| Valid | No issues |
| Suspended | Temporarily revoked |
| Revoked | Permanently cancelled |
| Expired | Lapsed registration/license |
| Stolen | Reported stolen — investigate |

⚠️ A stolen plate does not confirm the driver stole the vehicle. Conduct a lawful stop and investigate properly.`,
      },
      {
        title: 'Traffic Stop Protocol',
        content: `**Pre-stop:**
1. Run the plate via **Database → Plate Search** before initiating if possible
2. Advise dispatch: *"[Callsign], traffic stop, [location], [plate/description]"*
3. Set status to **10-11**

**During stop:**
- Request license, registration, and insurance
- Run the driver via **Civilian Search**
- Check DL status, vehicle registration, and any active flags
- Run full vehicle plate check

**Post-stop:**
1. Clear dispatch: *"[Callsign], traffic stop clear, [outcome]"*
2. File a **Traffic Stop** incident report in the Reports tab
3. Return status to **10-8**`,
      },
      {
        title: 'Incident Reports',
        content: `All significant incidents require a written report. Use the **Reports** tab inside the Police panel.

**Report Types:**
| Type | When to File |
|------|-------------|
| Arrest | Any detention resulting in charges |
| Traffic Stop | All traffic enforcement contacts |
| Use of Force | Any physical force beyond presence/verbal |
| Incident | General report for any other call |
| Supplement | Additional info added to an existing report |

**Writing standards:**
- Write in **first person, past tense**
- Be **factual** — no opinions or assumptions
- Include all involved parties, times, and locations
- Include the associated call ID when applicable
- Submit for supervisor approval

**Report statuses:**
- Pending — submitted, awaiting supervisor review
- Approved — accepted and filed
- Rejected — returned with supervisor notes for revision

**Incident IDs:**
Every dispatch call generates a unique Incident ID (e.g. INC-2026-000124) that links the call, assigned units, and reports together. When a call is closed, assigned officers can click **From Call** in the Reports tab to create a report pre-filled with the call's incident data — type, location, dispatch notes, responding units, and timestamps.

**Smart Report Builder (if enabled by your server):**
When enabled, report forms adapt to the selected type:
- Traffic Stop → Driver Info, Vehicle Info, Citation, Warnings
- Arrest → Charges, Booking, Miranda, Jail Time
- Fire → Apparatus, Cause, Damage Assessment
- EMS → Patient Info, Transport, Hospital
- Use of Force → Force Used, Justification, Injuries`,
      },
      {
        title: 'Officer Safety Alerts',
        content: `**Officer Safety Alerts** warn officers when searching flagged records in the database. This system must be enabled by a server admin in **Settings → General**.

**When enabled:**
- Searching a **civilian, vehicle plate, or address** automatically checks for active safety alerts
- A **pulsing red banner** appears at the top of the record showing all active alerts
- The record header shows a badge indicating the number of alerts

**Alert types include:**
- Known to Carry Weapons
- History of Violence
- Previous Assault on Law Enforcement
- Mental Health Crisis History
- Known to Flee
- Frequent Caller
- Dangerous Animals
- Gate Access Required
- Officer Safety Hazard
- Medical Alert

**Managing alerts (requires permission):**
1. Expand a civilian, plate, or address record
2. Scroll to the **Officer Safety Alerts** section
3. Click **+** to add an alert
4. Select an alert type and optionally add **internal notes** explaining why the alert exists
5. Click **Add Alert**
6. Hover an existing alert and use the ✏️ to edit notes or ✕ to remove

**Permissions:**
- **View Safety Alerts** — who can see alerts when searching (default: all members)
- **Manage Safety Alerts** — who can add/edit/remove alerts (default: admins only)

**Addresses tab:**
A dedicated Addresses search tab lets you search by address and view all safety alerts and residents at that location.`,
      },
      {
        title: 'Crash Reconstruction Tool',
        content: `The **Crash Reconstruction** tool lets officers document and reconstruct motor vehicle collisions with an interactive top-down canvas. Access it from the **Crash** tab in the Police panel.

**Toolbar tools:**
| Tool | Function |
|------|----------|
| Select/Move | Click and drag objects to reposition |
| Vehicle | Place a vehicle (choose color from the palette) |
| Skid Mark | Click and drag to draw skid lines |
| Impact Point | Place a point-of-impact star marker |
| Debris | Place debris scatter markers |
| Evidence # | Place auto-numbered evidence markers |
| Text | Add text annotations |
| Traffic Sign | Place stop signs, yield signs, traffic lights |
| Delete | Click objects to remove them |

**Selected object controls:**
When a vehicle or sign is selected, use the **Rotate**, **Direction**, and **Sign Type** buttons in the header bar.

**Road templates:**
- Straight Road
- Intersection (four-way with crosswalks)
- Curve (bezier path)
- Highway (multi-lane with lane markings)

**Scene settings (sidebar):**
- **Weather** — clear, rain, snow, fog, storm
- **Road Condition** — dry, wet, icy, snowy, gravel

**Export options:**
- **PNG** — download as a PNG image
- **PDF** — download as a PDF with scene metadata

**Saving to a report:**
1. Click **Save to Report**
2. Enter a title for the reconstruction
3. Optionally link it to one of your existing reports (the Incident ID is inherited automatically)
4. Click **Save Reconstruction** — the PNG is uploaded and stored as an attachment on the report

**Permissions:**
- **Access Crash Reconstruction** — who can open the tool
- **Edit Crash Reconstructions** — who can modify existing reconstructions`,
      },
    ],
  },
  {
    category: 'Fire & EMS',
    icon: Flame,
    color: 'text-orange-400',
    articles: [
      {
        title: 'Going On Duty',
        content: `**To go on duty as Fire or EMS:**
1. Navigate to the **Fire / EMS** tab
2. Click **Go On Duty**
3. Fill in:
   - **Roleplay Name** — your in-character name
   - **Type** — select Fire or EMS
   - **Callsign** — your apparatus identifier (e.g. "Engine-1", "Medic-7", "Rescue-3")
   - **Vehicle/Apparatus** — your unit (e.g. "Engine 41", "Medic Unit 7", "Ladder 2")
   - **Agency** — select from configured departments
4. Click **Go On Duty**

**Apparatus types:**
- **Engine** — primary fire suppression
- **Ladder/Tower** — aerial operations, rescue
- **Medic Unit** — advanced life support (EMS)
- **Rescue** — technical rescue, extrication
- **Battalion** — command vehicle`,
      },
      {
        title: 'Fire Response Protocol',
        content: `**Upon dispatch to a structure fire:**
1. Respond and set status to **10-97** on arrival
2. Conduct scene size-up: building type, smoke conditions, life safety threats
3. Establish **Incident Command** if first on scene
4. Request additional resources early — don't wait until overwhelmed
5. Primary search: locate and remove all occupants
6. Fire suppression: extinguish and overhaul

**Size-up radio report format:**
*"Engine-1 on scene, two-story residential, heavy smoke showing from second floor, going to work. Engine-1 establishing [location] Command."*

**Common fire call types:**
- Structure Fire (residential / commercial)
- Vehicle Fire
- Brush / Wildland Fire
- Hazardous Materials (Hazmat)
- Technical Rescue / Collapse
- Carbon Monoxide / Gas Leak`,
      },
      {
        title: 'EMS Response Protocol',
        content: `**Patient assessment sequence:**

1. **Scene Safety** — Is it safe? Hazards? Violence risk?
2. **General Impression** — Is the patient conscious and responsive?
3. **Primary Survey** — Airway → Breathing → Circulation (ABC)
4. **SAMPLE History** — Signs/Symptoms, Allergies, Medications, Past history, Last oral intake, Events leading up
5. **Vital Signs** — Pulse, respirations, blood pressure, SpO2, GCS
6. **Treatment** — Address life threats, stabilize
7. **Transport** — Determine destination priority

**Priority transport indicators:**
- Unresponsive or altered mental status
- Respiratory distress or failure
- Suspected cardiac event (chest pain, diaphoresis)
- Severe trauma or uncontrolled bleeding
- Stroke symptoms (facial droop, arm drift, speech slurring)
- Pediatric emergencies`,
      },
      {
        title: 'Incident Command System (ICS)',
        content: `The **ICS** is the standardized management structure for emergency incidents. All Fire and EMS units must operate within ICS when on scene.

**First unit on scene establishes command:**
*"Engine-1 is establishing Oak Street Command."*

**ICS Sections:**
- **Command** — overall incident management, communicates with dispatch
- **Operations** — tactical execution (firefighting, rescue, patient care)
- **Safety Officer** — scene safety monitoring, hazard identification
- **Logistics** — resource requests, staging, supply
- **Staging** — holds additional units until needed

**Transfer of command:**
When a higher-ranking officer arrives:
*"Battalion-1 to Engine-1, I am assuming Oak Street Command."*
*"Engine-1, copy — transferring command to Battalion-1."*`,
      },
    ],
  },
  {
    category: 'Civilian Panel',
    icon: UserCircle2,
    color: 'text-teal-400',
    articles: [
      {
        title: 'Creating a Character',
        content: `The Civilian Panel lets you create and manage roleplay characters.

**To create a character:**
1. Go to the **Civilian** tab
2. Click **New Character**
3. Fill in your character's details (required: full name)
4. Recommended fields:
   - Date of Birth
   - Address
   - Physical description (height, weight, hair/eye color, ethnicity)
   - Driver's License number and status
   - Occupation, phone, emergency contact
5. Click **Create**

**Multiple characters:**
You can create multiple characters per server. Use the left sidebar to switch between them.

**Privacy:**
Your character data is visible to **law enforcement officers** when they search the civilian database within your shared server. Your real email is never displayed.`,
      },
      {
        title: 'Vehicles & License Plates',
        content: `Each character can own multiple registered vehicles.

**To register a vehicle:**
1. Open your character in the Civilian panel
2. Go to the **Vehicles** tab
3. Click **Add Vehicle**
4. Fill in:
   - License plate
   - State
   - Make, model, year, color
   - Registration status

**Vehicle Registration Statuses:**
| Status | Meaning | Law Enforcement Impact |
|--------|---------|----------------------|
| Valid | Registered and insured | No action |
| Stolen | Reported stolen | Officers will investigate a stop |
| Expired | Registration lapsed | Citation likely |
| Suspended | Registration suspended | Vehicle may be impounded |

Only mark a vehicle as **Stolen** if you intend that to be part of your roleplay scenario.`,
      },
      {
        title: 'Roleplay Guidelines',
        content: `**Do:**
- Stay in character during all active roleplay situations
- React realistically — if your car is stopped, pull over calmly
- Cooperate with or reasonably resist law enforcement based on your character
- Call for help naturally (e.g. describe your character calling 911)
- Accept consequences for your character's actions

**Don't:**
- **Metagame** — use out-of-character knowledge inside a scene
- **RDM (Random Death Match)** — attack others without narrative reason
- **VDM (Vehicle Death Match)** — use your vehicle as a weapon without RP justification
- **Combat Log** — disconnect to avoid arrest or consequences
- **Suicide to escape** — don't end your character's life to avoid RP consequences

**Interacting with law enforcement:**
When pulled over, your character should pull over promptly, keep hands visible, and provide license and registration when asked. You may roleplay refusing to cooperate, but accept the consequences that follow.`,
      },
    ],
  },
  {
    category: 'Supervisor Panel',
    icon: BadgeCheck,
    color: 'text-yellow-400',
    articles: [
      {
        title: 'Supervisor Responsibilities',
        content: `Supervisors handle **oversight, accountability, and critical incident management**. You do not typically handle routine calls — you manage people and escalated situations.

**Core duties:**
- Review and approve or reject incident reports in the Reports tab
- Review **shift summary reports** submitted by on-duty units
- Monitor active units for prolonged inactivity or unusual status
- Respond to officer needs assistance and use-of-force calls
- Oversee active calls on the supervisor board
- Debrief personnel after critical incidents

**Shift Summary Reports:**
When a unit submits their shift summary from the **Shift** tab, it is automatically sent to the Supervisor panel as a "Supplement" report for review.

**Access:**
The Supervisor panel is unlocked by the server Admin granting a Supervisor department key. It is not the same as the Admin panel.`,
      },
      {
        title: 'Report Review Process',
        content: `Use the **Reports** tab in the Supervisor panel to manage all submitted incident reports.

**Review checklist:**
1. Is the report factual and free of opinion or speculation?
2. Are all required fields completed?
3. Does the narrative accurately reflect the call type?
4. Is use of force documented if it occurred?
5. Are all involved parties (civilians, officers) listed?

**Actions:**
- ✅ **Approve** — report meets standards; it is filed permanently
- ❌ **Reject** — return with supervisor notes explaining what needs to be fixed

After rejection, the submitting officer must revise and resubmit.

**Standard:** All reports should be reviewed within the active session they are submitted.`,
      },
      {
        title: 'Pursuit Management',
        content: `Vehicle pursuits are high-risk and require active supervisor oversight.

**Supervisor duties during a pursuit:**
1. Monitor all radio traffic
2. Evaluate risk vs. reward: severity of offense vs. public safety
3. Authorize continuation or order termination

**Terminate when:**
- Speeds exceed safe limits for environment (residential, school zone, heavy traffic)
- Suspect identity is confirmed (can be arrested later)
- Weather, road conditions, or traffic create unacceptable risk
- The pursuit crosses into another jurisdiction without authorization
- More than 3 units are already engaged (no additional units needed)

**Terminating:**
*"All units, [Supervisor callsign], terminate the pursuit. All units break off and return to patrol."*`,
      },
    ],
  },
  {
    category: 'Admin Panel',
    icon: Settings,
    color: 'text-purple-400',
    articles: [
      {
        title: 'Admin Panel Overview',
        content: `The **Admin Panel** is available to server Owners and Admins. It provides tools for managing members, permissions, and server health.

**Tabs in the Admin panel:**
- **Members** — view all members, change roles, remove members
- **Access Keys** — grant or revoke department access per member
- **Audit Log** — chronological record of all admin actions
- **AI Settings** — enable or disable the Dispatch AI assistant

**Admin vs Owner:**
- **Owner** has full control including server deletion and settings
- **Admin** can manage members and keys but cannot delete the server or demote the Owner`,
      },
      {
        title: 'Managing Member Access',
        content: `**Granting department access:**
1. Go to the **Admin** panel
2. Click the **Access Keys** tab
3. Find the member by name
4. Toggle the department keys on or off:
   - **Police** — unlocks the Law Enforcement Panel
   - **Fire** — unlocks Fire in the Fire/EMS Panel
   - **EMS** — unlocks EMS in the Fire/EMS Panel
   - **Dispatch** — unlocks the Dispatch Panel

**Member removal:**
1. Go to the **Members** tab
2. Click the remove button next to a member
3. Confirm removal — their data remains but they lose server access

All admin actions are recorded in the **Audit Log** with timestamp, actor, and action.`,
      },
      {
        title: 'Audit Logs',
        content: `The **Audit Log** provides a tamper-evident record of all administrative actions in your server.

**Logged events include:**
- Member role changes (promotions, demotions)
- Department key grants and revocations
- Member removals (kicks)
- Signal 100 activations
- Settings changes (where applicable)

**Format:**
Each log entry shows: timestamp, admin email, action taken, target member, and relevant details.

Use audit logs to:
- Investigate disputes about who made what change
- Monitor for unauthorized admin activity
- Maintain accountability in your leadership team`,
      },
    ],
  },
  {
    category: 'Server Settings',
    icon: Settings,
    color: 'text-white',
    articles: [
      {
        title: 'General Settings',
        content: `Access server settings from the **Settings** tab (owners only).

**Configurable fields:**
- **Server Name** — displayed in the server list and CAD header
- **Description** — shown on the public server card
- **Server Visibility** — Public (discoverable) or Private (invite only)
- **Dispatch AI** — enable or disable the AI dispatch assistant for dispatchers
- **Server Icon** — upload a logo shown on the server card
- **Invite Code** — unique Community ID for joining; read-only (set at creation)

**Saving changes:**
Click **Save All** in the top right of the Settings panel. All general, tone, and appearance changes save together.`,
      },
      {
        title: 'Departments',
        content: `Configure your server's departments in **Settings → Departments**.

**Each department has:**
- **Name** — full department name (e.g. "Blaine County Sheriff's Office")
- **Short Name** — abbreviation shown in brackets (e.g. "BCSO")
- **Type** — LEO, Fire, EMS, or Dispatch — determines which panel this department belongs to
- **Logo** — upload a custom badge/patch image (PNG with transparency recommended)

**Department logos appear:**
- On unit cards in the Dispatch panel
- In the Police and Fire/EMS panel unit lists
- In the unit detail dialog
- When officers select their agency during duty signup

**Editing departments:**
Click the edit (pencil) icon on any department. Changes save immediately after clicking **Save Changes**.`,
      },
      {
        title: 'Penal Codes',
        content: `Configure your server's legal code in **Settings → Penal Code**.

**Each charge includes:**
 - **Code** — numeric or alphanumeric identifier (e.g. "187 PC", "VC 23152")
 - **Title** — offense name (e.g. "Murder", "DUI")
 - **Category** — classification (Infraction, Misdemeanor, Felony, Detention, Other)
 - **Fine** — monetary amount
 - **Jail Time** — duration string (e.g. "15 years", "90 days")

**Default library:** VanguardOS ships with 91 default charges covering:
 - **Felonies** — murder, robbery, arson, burglary, assault with deadly weapon, etc.
 - **Misdemeanors** — assault, battery, theft, vandalism, disorderly conduct, etc.
 - **Traffic violations** — red lights, stop signs, speeding, no insurance, expired registration, window tint, street racing, DUI, evading, etc.
 - **Petty crimes** — trespassing, petty theft, public intoxication, fare evasion, littering, etc.

**Usage:**
 Penal codes are referenced during arrest reports and available to officers in the Penal Code tab during active patrol. Having a complete penal code makes arrests more realistic and consistent across your server.

**Reset to default:** Click **Reset Default** to restore the full 91-charge library at any time.`,
      },
      {
        title: 'Dispatch Tones',
        content: `Customize the three dispatch tones in **Settings → Tones**.

**Each tone slot has:**
- **Name** — displayed on the tone button (e.g. "Signal")
- **Sound** — choose from the tone library

**Tone library includes:**
- Standard beeps and two-tone sequences
- Priority alert tones
- Emergency klaxon variants
- Radio clear signals

**Preview:** Click **Preview** next to any tone to hear it before saving.

After saving, the tones appear in the Dispatch panel's tone bar for all dispatchers in your server.`,
      },
      {
        title: 'Live Map & Presets',
        content: `The Live Dispatch Map lets dispatchers and units see real-time unit positions on a map image.

**Enabling the map:**
Settings → Map → toggle "Live Dispatch Map" on.

**Map Presets:**
| Preset | Description |
|--------|-------------|
| ER:LC | Emergency Response: Liberty County — pre-loaded with all postal codes and streets |
| Los Santos | GTA V / FiveM Los Santos — pre-loaded streets, postal zones, and neighborhoods |
| Custom | Upload your own map image and use AI to extract streets |
| None | No map image — units and dispatchers can still see coordinates |

**Custom Map + AI Extraction (Enhanced):**
 1. Select **Custom** preset
 2. Upload your map image (PNG/JPG) — the image is **automatically preprocessed**: resolution is increased (upscaled up to 2× for small images), contrast and brightness are boosted, and text is sharpened to improve AI recognition — especially in dense areas with overlapping streets and postals
 3. Click **Scan Map with AI** — a staged progress animation shows each step: image enhancement → road detection → street extraction → postal reading → confidence scoring
 4. Review the **Import Summary** showing detected roads, streets, postals, and overall AI confidence percentage
 5. Open the collapsible **Manual Review Required** panel — items are color-coded by confidence:
    - 🟢 **High Confidence** (≥85%) — auto-accepted
    - 🟡 **Low Confidence** (50-84%) — needs review
    - 🔴 **Manual Review Required** (<50%) — needs correction
 6. Click any review item to **zoom the map** to its approximate location. Drag the marker to reposition, edit the name/postal, then click **Mark as Verified**
 7. **Learning**: manual corrections are saved per-map — if you re-scan or reimport the same map, prior corrections are auto-applied so you don't repeat the same fixes
 8. Click **Save Map Settings** to persist the verified street/postal data

**Unit Location Updates (Live Map):**
 - Units set their position by clicking the 📍 Navigation button in their panel header
 - A click on the map confirms the position; nearest postal code is auto-detected
 - The server owner sets how often units are reminded to update (Settings → Live Map → Ping Interval)
 - If a unit ignores 4+ reminders, their name turns **red** in the dispatch sidebar
 - Every position update is logged in the **Unit Position History** — dispatchers can view a full movement trail

**Using the map as dispatcher:**
 Go to the **Live Map** tab to see all unit pins in real-time. Pins are color-coded by department and show department logos. Click any pin to view unit details.

**Direct Messaging (if enabled):**
 - Click the **DMs** button in the live map toolbar to open your inbox
 - Select any on-duty unit to start a conversation thread
 - Messages deliver in real-time with unread badge counts
 - DMs are available to dispatch, police, fire, and EMS personnel

**Position History:**
 - Click the history icon on any unit to view their movement trail
 - Each entry shows timestamp, coordinates, and nearest postal/street
 - History is always available to dispatchers — no toggle required`,
      },
      {
        title: 'Server Appearance & CAD Theme',
        content: `Customize the visual theme of your server's CAD in **Settings → Appearance** and **Settings → General**.

      **Background Themes:**
      | Theme | Background Color |
      |-------|----------------|
      | Dark | Deep black (#0B0B0B) |
      | Midnight | Dark navy blue |
      | Futuristic | Near black with blue tint |
      | Light | Light gray (#F0F0F0) |

      **CAD Interface Theme (Settings → General):**
      | Theme | Description |
      |-------|-------------|
      | Modern | Default — glassmorphism surfaces, Inter typography, crimson accents on near-black |
      | Retro | Early 2000s desktop aesthetic — beveled 3D panels, navy gradient title bars, Tahoma font, sunken inputs |
      | Tactical | Military command center — matte black, olive green, amber accents, animated grid background, square corners, mono fonts for data |
      | EOC | Emergency Operations Center — clean light white & navy, soft shadows, professional emergency-management look |
      | Cyber Ops | Futuristic — dark charcoal, electric cyan & purple, glass panels, neon borders, glow effects, animated drift |
      | First Responder | Department-based — each panel uses its own accent color (police=blue, fire=red, EMS=green, dispatch=gold) on a neutral dark base |

      Each themed interface overrides glass cards, inputs, headers, borders, and accent colors for full visual consistency. The First Responder theme dynamically changes its accent color based on which department panel is currently active.

      **Custom Background Image:**
      Upload any image to use as the full-screen background for your server's CAD. The image is shown at a reduced opacity to keep the UI readable.

      Appearance settings affect **all users** in your server once saved.`,
      },
      {
        title: 'Email Notifications',
        content: `Server owners can enable opt-in email notifications from **Settings → Notifications**.

      **How it works:**
      1. Owner enables email notifications in Settings
      2. A **Notify** tab appears in the CAD for all members
      3. Members subscribe with an optional department label (visible only to themselves)
      4. Notifications are sent for session starts, training events, and other server activity

      **Privacy:**
      - Subscriber emails are **never shown** to other users
      - Only the subscriber sees their own label
      - Subscription is fully opt-in — members are never auto-subscribed`,
      },
    ],
  },
  {
    category: 'Training & LMS',
    icon: GraduationCap,
    color: 'text-yellow-400',
    articles: [
      {
        title: 'Training Module System',
        content: `VanguardOS includes a built-in **Learning Management System (LMS)** for department training and certification.

**Accessing training:**
- Click the graduation cap icon in the CAD header, or
- Navigate to **/lms** from the home page

**Built-in content:**
Each department (Police, Fire, Dispatch) has tiered training modules covering:
- Role responsibilities and core duties
- Call priority systems
- Protocol procedures
- Radio discipline
- Report writing standards
- Use of force / escalation policies

**Tiers:**
Training is organized in tiers (Tier 1 → Tier 2 → Tier 3). Complete lower tiers before advancing.`,
      },
      {
        title: 'Exams & Certification',
        content: `Each training module ends with a **multiple-choice exam**.

**Exam rules:**
- A minimum passing score (default: 80%) is required
- If you fail, you must wait before retrying (cooldown tracked per department)
- Passing awards a certification tracked in your UserCertification record

**Certification tracking:**
- Certifications are tracked per-server and per-department
- Server admins can view member certifications in the Admin panel
- Certifications unlock higher department tiers

**Failed attempt:**
If you fail an exam, the system records the timestamp. You must wait the configured cooldown period before retrying the same department tier.`,
      },
      {
        title: 'Custom Training (Server Owners)',
        content: `Server owners can create custom training modules specific to their community in **Settings → Training**.

**Each custom module includes:**
- **Title** — name of the training
- **Department Type** — Police, Fire, EMS, or Dispatch
- **Tier Level** — numeric tier (1, 2, 3...)
- **Content** — full Markdown-formatted lesson content
- **Exam Questions** — multiple choice questions with correct answer index
- **Passing Score** — minimum percentage to pass (default 80%)
- **Active/Inactive toggle** — control visibility

**Markdown in content:**
You can use headers, bold, italic, lists, tables, and code blocks in training content for rich formatting.`,
      },
    ],
  },
  {
    category: 'Radio System',
    icon: Mic,
    color: 'text-pink-400',
    articles: [
      {
        title: 'Radio Channels',
        content: `The radio system allows units to communicate within designated channels visible in the CAD.

**Accessing radio:**
The Radio panel appears in the right sidebar of the **Dispatch** panel.

**Channel features:**
- Each channel has a **name**, **color**, and optional **description**
- Channels can be restricted to specific department types (e.g. Police-only, Dispatch-only)
- An empty department restriction means all departments can access the channel
- Active users on each channel are listed

**Joining a channel:**
Click **Join** on any accessible channel. Click again to leave.

**Common channel setups:**
- PRIMARY — main dispatch channel (all departments)
- TAC 1 / TAC 2 — tactical channels for specific operations
- FIRE OPS — fire department only
- EMS OPS — EMS only`,
      },
      {
        title: 'Creating & Managing Channels',
        content: `**Who can create channels:**
Server Owners and Admins can create radio channels from the Radio panel sidebar.

**Creating a channel:**
1. Click the **+** icon in the Radio panel
2. Enter: name, description (optional), color, department access restrictions
3. Click **Create**

**Deleting channels:**
Click the trash icon on a channel you own or have admin access to.

**Best practices:**
- Keep channel names short and tactical (TAC1, FIRE, EMS, DISP)
- Use colors to visually distinguish channel types
- Restrict sensitive channels (e.g. undercover operations) to specific departments`,
      },
    ],
  },
  {
    category: 'AI Features',
    icon: Zap,
    color: 'text-violet-400',
    articles: [
      {
        title: 'Dispatch AI Assistant',
        content: `The **Dispatch AI Assistant** is an optional AI tool for dispatchers that provides real-time operational support.

**Enabling the AI:**
Server owners can enable the AI in **Settings → General → Dispatch AI Assistant**.

**What the AI can do:**
- Summarize all active calls and unit statuses
- Suggest which units to assign based on proximity and availability
- Answer questions about call types and protocol
- Help dispatchers manage high-call-volume situations

**Using the AI:**
When enabled, a floating chat button appears in the bottom-right of the Dispatch panel. Click it to open the AI assistant. Ask it anything about current operations.

**Quick queries:**
- "Who is available for a P1?"
- "What are all active calls right now?"
- "Which units have been on scene the longest?"

**Privacy note:** The AI has contextual access to active calls and unit data only within your current session. No data is stored externally.`,
      },
      {
        title: 'Server Owner AI Assistant',
        content: `The **Owner AI Assistant** is a dedicated AI for server owners to manage their server using natural language.

**Access:**
The Owner AI is available in the Admin panel under the AI Settings tab.

**Capabilities:**
- Read, create, update, and delete server data
- Manage member roles and access
- Query calls, units, civilians, and incident reports
- Answer questions about server statistics and activity

**Example queries:**
- "How many calls have been created this week?"
- "Give me a list of all members and their roles"
- "Update the status of unit 1-Adam-12 to 10-8"
- "How many active units do we have right now?"

**Important:** The AI always operates within your specific server_id. It will not affect other servers.`,
      },
      {
        title: 'AI Map Import System',
        content: `The **AI Map Import** system extracts streets, postal codes, highways, and landmarks from uploaded custom map images with high accuracy — even in dense areas with overlapping labels.

**Image Preprocessing:**
Before AI analysis, uploaded images are automatically enhanced:
- **Resolution increase** — small images are upscaled up to 2× for better text recognition
- **Contrast enhancement** — contrast is boosted by ~45% to make text edges sharper
- **Brightness adjustment** — slight brightness increase for legibility
- **Saturation boost** — colors are enriched to distinguish map features

This preprocessing significantly improves detection accuracy in congested map regions where street names and postal codes overlap.

**AI Detection:**
The AI uses an enhanced vision model to detect:
- Roads, streets, avenues, boulevards, and highways
- Postal codes and zone numbers
- Neighborhood, district, and area names
- Landmarks, buildings, and points of interest

Each detection includes a **confidence score** (0.0–1.0) indicating how certain the AI is about the label text and position.

**Confidence Scoring:**
| Level | Score | Color | Behavior |
|-------|-------|-------|----------|
| High | ≥0.85 | 🟢 Green | Auto-accepted — no action needed |
| Low | 0.50–0.84 | 🟡 Yellow | Flagged for manual review |
| Manual | <0.50 | 🔴 Red | Requires correction before use |

**Manual Review Workflow:**
After the scan completes, a summary card shows:
- Roads detected, streets detected, postals detected
- Overall AI confidence percentage
- Count of items requiring manual review

The collapsible **Review Required** panel lists only the items needing attention. Selecting an item:
1. **Zooms the map** to the item's approximate location (2.5× zoom with smooth animation)
2. **Highlights the area** with a pulsing marker ring
3. Shows a **correction form** with editable name and postal fields
4. Allows **dragging the marker** to reposition it precisely
5. Click **Mark as Verified** to confirm the correction

**Learning & Persistence:**
When you manually correct a street or postal, the correction is saved locally for that specific map image. If you re-scan or reimport the same map in the future:
- Prior corrections are **auto-applied** to matching detections (by position proximity)
- Auto-applied items are marked with a **"learned"** badge
- You only need to review newly detected or changed items

This means your map gets smarter over time — repeat imports require fewer manual fixes.

**Re-scanning:**
You can re-scan the map at any time by clicking **Re-scan**. This runs a fresh AI pass and re-applies all learned corrections automatically.`,
      },
    ],
  },
  {
    category: 'Profile & Directory',
    icon: Users,
    color: 'text-cyan-400',
    articles: [
      {
        title: 'Your Platform Profile',
        content: `Your **VanguardOS Profile** is your global identity across all servers.

**Customizable fields:**
- **Display Name** — your public username
- **Bio** — short personal description (shown on your profile card)
- **Avatar** — profile photo (upload any image)
- **Banner** — wide header image for your profile
- **Accent Color** — color used for your profile card border and badge highlights
- **Role Badge** — flair badge displayed on your profile

**Viewing your profile:**
Click **Profile** in the home navigation. Your profile is visible to all members in the **Directory**.

**Saving changes:**
Click **Save Profile** after making any changes.`,
      },
      {
        title: 'Platform Badges',
        content: `**Platform Badges** are special indicators granted by VanguardOS staff recognizing platform contributions or roles.

**Current badges:**
| Badge | Description |
|-------|-------------|
| Developer | VanguardOS platform developer |
| Admin | Platform administrator |
| Global Moderator | Community-wide moderation staff |
| CAD Moderator | CAD-specific moderation |
| Community Manager | Community engagement team |
| Early Adopter | Joined during platform beta |
| Verified | Identity-verified member |
| Bug Hunter | Identified and reported platform bugs |

Badges are visible on your profile card in the Directory and cannot be self-assigned.`,
      },
      {
        title: 'Member Directory',
        content: `The **Member Directory** shows all registered VanguardOS users who have created a public profile.

**Features:**
- Search by display name
- View profiles including bio, badges, accent colors, and role indicators
- Click a profile card to open the full profile modal
- Leave a **review/rating** for other community members from the profile modal

**Real-time updates:**
The directory updates automatically when new members join or update their profiles — no refresh required.

**Privacy:**
Email addresses are never shown in the directory. Only the display name, bio, avatar, badges, and stats are visible.`,
      },
    ],
  },
];

export default function Documentation() {
  const [activeCategory, setActiveCategory] = useState(DOCS[0].category);
  const [activeArticle, setActiveArticle] = useState(DOCS[0].articles[0]);

  const activeSection = DOCS.find(d => d.category === activeCategory);

  const renderContent = (content) => {
    return content.split('\n\n').map((block, i) => {
      // Table
      if (block.includes('|') && block.split('\n').filter(r => r.includes('|')).length >= 2) {
        const rows = block.split('\n').filter(r => r.includes('|') && !r.match(/^[\|\s\-:]+$/));
        if (rows.length < 1) return <p key={i} className="text-white/70 text-sm leading-relaxed my-3">{block}</p>;
        return (
          <div key={i} className="my-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {rows[0].split('|').filter(Boolean).map((h, j) => (
                    <th key={j} className="text-white/50 text-xs uppercase tracking-wider text-left py-2 pr-6 font-semibold whitespace-nowrap"
                      dangerouslySetInnerHTML={{ __html: h.trim().replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, j) => (
                  <tr key={j} className="border-b border-white/[0.04]">
                    {row.split('|').filter(Boolean).map((cell, k) => (
                      <td key={k} className="py-2 pr-6 text-white/65"
                        dangerouslySetInnerHTML={{ __html: cell.trim().replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      // List
      if (block.startsWith('- ') || /^\d+\./.test(block)) {
        const items = block.split('\n').filter(Boolean);
        const ordered = /^\d+\./.test(items[0]);
        const Tag = ordered ? 'ol' : 'ul';
        return (
          <Tag key={i} className={`my-3 ml-4 space-y-1.5 ${ordered ? 'list-decimal' : 'list-disc'}`}>
            {items.map((item, j) => (
              <li key={j} className="text-white/70 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.replace(/^[-\d.]+\s/, '').replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }}
              />
            ))}
          </Tag>
        );
      }
      // Bold heading line
      if (block.startsWith('**') && block.endsWith('**') && !block.includes('\n')) {
        return <h3 key={i} className="text-white font-semibold text-sm mt-5 mb-1.5">{block.replace(/\*\*/g, '')}</h3>;
      }
      // Italic blockquote
      if (block.startsWith('*') && block.endsWith('*') && !block.includes('**')) {
        return <blockquote key={i} className="border-l-2 border-white/20 pl-3 my-2 text-white/40 italic text-sm"
          dangerouslySetInnerHTML={{ __html: block.replace(/^\*/, '').replace(/\*$/, '') }}
        />;
      }
      // Regular paragraph
      return (
        <p key={i} className="text-white/70 text-sm leading-relaxed my-2"
          dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>') }}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col">
      <header className="border-b border-white/[0.06] bg-[#111]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/"><VanguardLogo size="sm" /></Link>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/" className="hover:text-white transition-colors">← Back to Home</Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full px-6 py-10 gap-10">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <p className="text-white/20 text-[10px] uppercase tracking-widest font-semibold mb-4">Documentation</p>
          <nav className="space-y-0.5">
            {DOCS.map(section => {
              const Icon = section.icon;
              const isActive = activeCategory === section.category;
              return (
                <div key={section.category}>
                  <button
                    onClick={() => { setActiveCategory(section.category); setActiveArticle(section.articles[0]); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${isActive ? 'bg-white/[0.08] text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}
                  >
                    <Icon size={13} className={isActive ? section.color : 'text-white/30'} />
                    {section.category}
                  </button>
                  {isActive && (
                    <div className="ml-4 mt-0.5 mb-1 space-y-0.5 border-l border-white/[0.06] pl-3">
                      {section.articles.map(article => (
                        <button
                          key={article.title}
                          onClick={() => setActiveArticle(article)}
                          className={`w-full text-left px-2 py-1.5 rounded text-xs transition-all ${activeArticle?.title === article.title ? 'text-white font-medium' : 'text-white/35 hover:text-white/60'}`}
                        >
                          {article.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 max-w-3xl">
          {activeArticle && (
            <div>
              <div className="mb-6 pb-4 border-b border-white/[0.06]">
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">{activeCategory}</p>
                <h1 className="text-2xl font-bold text-white">{activeArticle.title}</h1>
              </div>
              <div>{renderContent(activeArticle.content)}</div>

              {/* Article navigation */}
              <div className="mt-10 pt-6 border-t border-white/[0.06] flex items-center justify-between">
                {(() => {
                  const allArticles = DOCS.flatMap(d => d.articles.map(a => ({ ...a, category: d.category })));
                  const idx = allArticles.findIndex(a => a.title === activeArticle.title);
                  const prev = allArticles[idx - 1];
                  const next = allArticles[idx + 1];
                  return (
                    <>
                      {prev ? (
                        <button onClick={() => { setActiveCategory(prev.category); setActiveArticle(prev); }} className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-all">
                          ← {prev.title}
                        </button>
                      ) : <div />}
                      {next ? (
                        <button onClick={() => { setActiveCategory(next.category); setActiveArticle(next); }} className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-all">
                          {next.title} →
                        </button>
                      ) : <div />}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}