import React, { useState } from 'react';
import { BookOpen, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';

const HANDBOOKS = {
  dispatch: {
    title: 'Dispatch Operations Handbook',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    bgColor: 'bg-emerald-500/10',
    sections: [
      {
        title: '1. Role & Responsibilities',
        content: `Dispatch is the backbone of all CAD operations. Your job is to **receive, prioritize, and coordinate** all incoming calls for service. You do not respond physically — you manage the scene remotely.

**Core duties:**
- Answer all incoming calls and create accurate call logs
- Assign the correct units based on geography, availability, and call type
- Monitor unit status and update call logs in real time
- Maintain radio discipline and relay critical information
- Escalate Priority 1/2 incidents to supervisors immediately`,
      },
      {
        title: '2. Call Priority System',
        content: `All calls are assigned a priority level upon creation:

| Priority | Code | Description | Response Time |
|----------|------|-------------|---------------|
| **P1** | Critical | Life-threatening, active crime in progress, officer down | Immediate — all available units |
| **P2** | Urgent | Injury accident, fight in progress, robbery | < 5 minutes |
| **P3** | Routine | Non-injury accident, noise complaints, minor offenses | Standard response |
| **P4** | Low | Abandoned vehicles, cold reports, paperwork assists | When available |

**P1 protocol:** Announce over all channels, assign minimum 2 units, notify supervisor, activate Signal 100 if warranted.`,
      },
      {
        title: '3. Call Creation Standards',
        content: `When creating a call, always document:
- **Call type** — be specific (e.g. "Armed Robbery" not just "Crime")
- **Exact location** — street address or cross streets
- **Caller info** — name, callback number if applicable
- **Description** — suspect descriptions, vehicle info, weapons
- **Priority** — set correctly before dispatching

Never create a vague call. Incomplete call logs create dangerous situations for responding units.`,
      },
      {
        title: '4. Unit Assignment, Live Map & Tone Protocol',
        content: `Before assigning a unit, verify:
1. Unit is **10-8** (available) or **10-7** (out of service but available)
2. Unit is geographically closest when possible — use the **Live Map tab** if enabled
3. Department type matches call type (Police → crime, Fire → fire/hazmat, EMS → medical)

**Live Map (if enabled):**
- Click the **Live Map** tab in the CAD header to open the live dispatch map
- Unit pins are color-coded by department (blue=Police, orange=Fire, red=EMS, emerald=Dispatch) and show department logos
- Click any unit pin to view callsign, status, RP name, and last known location
- Units without a position set show a ⚠️ "No position" warning — prompt them to update
- Use the **DMs** button to send direct messages to any on-duty unit
- Click the history icon on a unit to view their **Position History** — a full trail of their movements during the session

**Direct Messaging (if enabled):**
- Click the **DMs** button in the live map toolbar to open your inbox
- Select any on-duty unit to start a conversation thread
- Messages are delivered in real-time with unread badge counts
- Use DMs for non-radio communication: instructions, clarifications, or sensitive info

**Tone usage:**
- 🔈 **Standard tone** — routine P3/P4 dispatch
- 🔔 **Priority tone** — P2 calls, urgent response needed
- 🚨 **Emergency tone** — P1 calls, Signal 100, officer needs assistance

Always announce the call type and location immediately after the tone.`,
      },
      {
        title: '5. Radio Discipline',
        content: `Dispatch owns the radio. All traffic routes through you unless units are in an emergency.

**Standard format:**
> *"[Unit callsign], [Dispatch], [message]"*
> Example: *"1-Adam-12, Dispatch, respond to 100 Main St, report of a 10-50 with injuries, P2."*

**Rules:**
- Keep transmissions short and clear
- Use 10-codes consistently (set by server)
- Never talk over emergency traffic
- Acknowledge all unit status updates within 30 seconds
- Log all significant radio exchanges in call notes`,
      },
      {
        title: '6. Signal 100',
        content: `**Signal 100** is a declaration of emergency radio silence — only emergency traffic is permitted on primary channels.

**Activate when:**
- An officer is down or in immediate danger
- An active shooter / mass casualty event is in progress
- Command orders communications silence for tactical operations

**Procedure:**
1. Activate Signal 100 via the header button
2. Announce: *"All units, Signal 100 is now in effect. Emergency traffic only."*
3. Keep all non-essential traffic off primary channels
4. Clear Signal 100 only when the scene is safe and command authorizes`,
      },
      {
        title: '7. CAD Interface Theme',
        content: `Server owners can choose between two CAD interface themes in **Settings → General**:

| Theme | Description |
|-------|-------------|
| **Modern** | Default — glassmorphism surfaces, Inter typography, crimson accents on near-black |
| **Retro** | Early 2000s desktop aesthetic — beveled 3D panels, navy gradient title bars, Tahoma font, sunken inputs |

The theme applies to the entire CAD experience for all users in the server. Dispatchers should be aware of which theme is active, as visual elements (buttons, panels, inputs) render differently.`,
      },
    ],
  },

  police: {
    title: 'Law Enforcement Operations Handbook',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
    sections: [
      {
        title: '1. Going On Duty',
        content: `Before going on duty, ensure you have:
- A valid, unique **callsign** (e.g. 1-Adam-12, Unit 42, K9-3)
- Your **vehicle** identified (CVPI, SUV, Motorcycle, etc.)
- Your **RP name** and **rank** entered
- Selected the correct **agency/department**

**10-42** = Off Duty. You are not visible to dispatch until you go 10-8.
**10-8** = Available for calls. You are active and can be assigned.

Once on duty, monitor the dispatch board and radio at all times.`,
      },
      {
        title: '2. Status Codes & How to Update',
        content: `Use status codes consistently to keep dispatch informed:

| Code | Meaning | When to use |
|------|---------|-------------|
| **10-8** | In Service / Available | Default patrol status |
| **10-7** | Out of Service (available) | Meal break, brief stop |
| **10-6** | Busy — Do Not Disturb | Active scene, writing report |
| **10-97** | Arrived on Scene | When you reach a call location |
| **10-11** | Busy with Traffic Stop | During any traffic enforcement |

**How to update your status:**
- Use the **status dropdown** in the top header bar (next to Off Duty)
- OR click the **status badge** on your own unit card in the Units tab

Always update your status in real time. Dispatch depends on this to manage resources.`,
      },
      {
        title: '3. Live Map & Location Updates',
        content: `If the server has the **Live Map** enabled, you must keep your position updated.

**Setting your location:**
1. Click the **Navigation button** (📍) in the top header bar — it turns green when your location is set
2. A map dialog opens — click your current location on the map
3. The nearest postal code and street name are automatically detected
4. Click **Confirm** to submit your position

**Automatic reminders:** The server may be configured to send you a reminder bar at the top of the panel at set intervals. When you see it, update your location immediately. If you ignore 4+ reminders, your callsign turns **red** in the dispatch sidebar.

**Position History:** Every position update you make is logged. Dispatchers can view a retrospective trail of your movements — including timestamps and locations. Keep your position accurate and current.

**Why it matters:** Dispatch uses the live map to assign units geographically and monitor scene coverage. An outdated or missing position makes their job significantly harder.`,
      },
      {
        title: '4. Direct Messages from Dispatch',
        content: `If the server has **Live Map DMs** enabled, dispatchers can send you direct messages from the live map.

**Receiving DMs:**
- A **DMs** button appears in the live map toolbar when enabled
- Unread messages show a badge count
- Messages are real-time — no refresh needed

**When to expect DMs:**
- Non-radio instructions or clarifications
- Sensitive information not for open radio
- Assignment confirmations or scene-specific guidance

Always check your DMs when you see an unread badge — it may contain critical dispatch instructions.`,
      },
      {
        title: '5. Traffic Stops',
        content: `**Pre-stop:**
1. Run the plate via the Database panel before stopping if possible
2. Advise dispatch: *"[Callsign], traffic stop, [location], [plate]"*
3. Set status to **10-11**

**During stop:**
- Approach from the driver's rear quarter
- Request license, registration, insurance
- Run the subject through the civilian database
- Check for warrants, license status, vehicle status

**Post-stop:**
- Clear dispatch: *"[Callsign], traffic stop clear, [outcome]"*
- File a Traffic Stop incident report
- Return to **10-8**`,
      },
      {
        title: '6. Penal Code Reference',
        content: `The **Penal Code** tab gives you quick access to all charges defined by your server.

**Each charge shows:**
- Code (e.g. "187 PC", "VC 23152")
- Title (e.g. "Murder", "DUI")
- Category — Infraction, Misdemeanor, Felony, Detention
- Fine amount
- Jail time

**Categories are color-coded:**
- 🟡 Infraction — minor violations (traffic, petty)
- 🔵 Misdemeanor — moderate crimes
- 🔴 Felony — serious crimes
- 🟣 Detention — holds (e.g. psychiatric)

Use the search bar to quickly find charges during stops or arrests. The penal code is also referenced when filing arrest reports.`,
      },
      {
        title: '7. Civilian Database',
        content: `Use the **Database tab** to search civilians and vehicles.

**Civilian lookup provides:**
- Full name, DOB, physical description
- Driver's license status (Valid / Suspended / Revoked / Expired)
- Vehicle registrations and plate status
- Flags and known criminal history

**Vehicle lookup provides:**
- Registered owner
- Registration status (Valid / Stolen / Expired)
- Vehicle description

**⚠️ Important:** A stolen plate does not guarantee the driver is the thief. Conduct a lawful stop and investigate properly.`,
      },
      {
        title: '8. Use of Force & Incident Reports',
        content: `Use of force must be **reasonable, necessary, and proportional** to the threat presented.

**Force continuum (low → high):**
1. Officer presence / verbal commands
2. Non-lethal force (taser, pepper spray)
3. Lethal force — only when life is in imminent danger

**Documentation:** Every use of force above verbal commands **requires** a Use of Force report via the **Reports tab**, filed before going 10-8.

**All report types available:**
- Arrest, Traffic Stop, Use of Force, Incident, Supplement

**Standards:** First person, past tense, factual. Submit for supervisor approval before clearing when possible.`,
      },
    ],
  },

  fire: {
    title: 'Fire & EMS Operations Handbook',
    color: 'text-orange-400',
    borderColor: 'border-orange-500/30',
    bgColor: 'bg-orange-500/10',
    sections: [
      {
        title: '1. Going On Duty',
        content: `Select your department type carefully:
- **Fire** — structural fires, vehicle fires, hazmat, rescue
- **EMS** — medical emergencies, trauma, cardiac, overdose

Enter your **callsign** (e.g. Engine-1, Medic-7, Rescue-3) and **apparatus** (Engine 41, Medic Unit 7, Ladder 2).

**Apparatus types:**
- Engine — primary fire suppression
- Ladder/Tower — aerial operations, rescue
- Medic Unit — advanced life support
- Rescue — technical rescue, extrication`,
      },
      {
        title: '2. Status Codes & How to Update',
        content: `| Code | Meaning |
|------|---------|
| **10-8** | Available / In Service |
| **10-7** | Out of service (brief) |
| **10-97** | On Scene |
| **10-6** | Busy |
| **10-42** | Off Duty |

**How to update your status:**
- Use the **status dropdown** in the top header bar
- OR click the **status badge** on your own unit card in the Units tab

Update status **immediately** when responding and upon arrival. Dispatch tracks your availability for multi-unit incidents.`,
      },
      {
        title: '3. Live Map & Location Updates',
        content: `If the server has the **Live Map** enabled, keep your position current.

**Setting your location:**
1. Click the **Navigation button** (📍) in the top header bar
2. A map dialog opens — click your current location
3. Postal code / street is auto-detected from your click
4. Click **Confirm** to save

**Automatic reminders:** A yellow reminder bar may appear at the top of the panel at timed intervals. Select **Update Now** to open the location dialog immediately. If you ignore 4+ reminders, your callsign turns **red** in the dispatch sidebar.

**Position History:** Every position update is logged. Dispatchers can view a retrospective trail of your movements during the session. Keep your position accurate — especially when 10-97 on scene.

**Direct Messages:** If Live Map DMs are enabled, dispatchers can send you direct messages from the live map. Check the **DMs** button for unread messages — they may contain critical instructions.`,
      },
      {
        title: '4. Fire Response Protocol',
        content: `**Upon dispatch to a structure fire:**
1. Respond and set status to **10-97** on arrival
2. Conduct scene size-up: building type, smoke conditions, life safety
3. Establish **Incident Command** if first on scene
4. Request additional resources early — don't wait until overwhelmed
5. Primary search: locate and remove all occupants
6. Fire suppression: extinguish and overhaul

**Scene size-up (radio report):**
> *"Engine-1 on scene, two-story residential, heavy smoke showing from the second floor, going to work."*

**Resource requests:** Always request through dispatch. State what you need and why.`,
      },
      {
        title: '4. EMS Response Protocol',
        content: `**Upon arrival at a medical emergency:**
1. Scene safety first — is the scene safe? Hazards? Violence?
2. Form general impression: is the patient responsive?
3. Primary assessment: Airway → Breathing → Circulation
4. Obtain history: chief complaint, SAMPLE (Signs, Allergies, Medications, Past history, Last oral intake, Events)
5. Vital signs: pulse, respirations, blood pressure, SpO2
6. Treat and transport

**Critical patients (priority transport):**
- Unresponsive / altered mental status
- Respiratory distress / failure
- Cardiac events (chest pain, suspected MI)
- Severe trauma / major bleeding
- Stroke symptoms (facial droop, arm drift, speech issues)`,
      },
      {
        title: '5. Incident Command System (ICS)',
        content: `The ICS is the standardized management structure for emergency incidents.

**First unit on scene establishes command:**
> *"Engine-1 is establishing [Location] Command."*

**Command responsibilities:**
- Assess the situation and request resources
- Assign arriving units to sectors/divisions
- Communicate with dispatch continuously
- Transfer command if a higher-ranking officer arrives

**Basic ICS structure:**
- **Command** — overall incident management
- **Operations** — tactical operations
- **Safety** — scene safety monitoring
- **Logistics** — resources and support`,
      },
      {
        title: '6. Incident Reports',
        content: `File a report for **every** call response. Use the **Reports tab**.

**Fire reports must include:**
- Address and building type
- Units responding and actions taken
- Fire cause (if determined)
- Casualties / injuries

**EMS reports must include:**
- Patient chief complaint and age
- Assessment findings
- Interventions performed
- Transport decision and destination

Reports are reviewed by supervisors. Incomplete reports will be rejected.`,
      },
    ],
  },

  civilian: {
    title: 'Civilian Operations Handbook',
    color: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    bgColor: 'bg-teal-500/10',
    sections: [
      {
        title: '1. Creating Your Character',
        content: `Your civilian character is your in-game identity. Fill out your profile completely for the best roleplay experience and to avoid issues when stopped by law enforcement.

**Required fields:**
- Full Name
- Date of Birth
- Address

**Recommended fields:**
- Physical description (height, weight, eye/hair color)
- Occupation
- Driver's license number and status
- Emergency contact

Your character's information **will be visible to law enforcement** when they run your plate or search your name in their database.`,
      },
      {
        title: '2. Driver\'s License & Status',
        content: `Your DL status affects how law enforcement interactions play out:

| Status | Meaning | Consequence |
|--------|---------|-------------|
| **Valid** | Fully licensed | No issues |
| **Suspended** | Temporarily revoked | Criminal charge, vehicle impound |
| **Revoked** | Permanently revoked | Arrest, vehicle impound |
| **Expired** | License past expiration | Citation, possible vehicle issue |
| **None** | No license | Arrest for unlicensed operation |

Keep your license status accurate to your character's backstory.`,
      },
      {
        title: '3. Vehicle Registration',
        content: `Register all vehicles your character owns in the **Vehicles tab**.

**Vehicle status types:**
- **Valid** — properly registered, no issues
- **Stolen** — reported stolen (will trigger a stop and investigation if run)
- **Expired** — registration lapsed (citation likely)
- **Suspended** — registration suspended (vehicle can be impounded)

**Plate format:** Match your server's style (e.g. "ABC-1234" for a US state format).

Vehicles registered as **Stolen** will show up as stolen when officers run your plates — only use this for intentional roleplay scenarios.`,
      },
      {
        title: '4. Interacting with Law Enforcement',
        content: `When stopped by police:
1. **Pull over promptly** and remain in your vehicle
2. Keep your hands visible
3. Provide your license, registration, and insurance when asked
4. You have the right to remain silent regarding questions beyond identification
5. Do not flee — this escalates the situation significantly

**If arrested:**
- You may be held, processed, and charged
- A supervisor may need to authorize release
- Do not break character unless there is a real-world safety issue

**Important:** Always roleplay realistically. Do not use out-of-character knowledge during stops.`,
      },
      {
        title: '5. Roleplay Best Practices',
        content: `**Do:**
- Stay in character during active roleplay
- React realistically to situations
- Communicate with officers and emergency services naturally
- Report injuries, call for help, interact with the environment

**Don't:**
- Metagame (use out-of-character info in character)
- Randomly commit crimes with no narrative reason (RDM / VDM)
- Suicide to avoid arrest or consequences
- Log off to escape roleplay consequences (combat logging)

Your character's actions have consequences. Engage with the system fully for the best experience.`,
      },
    ],
  },

  supervisor: {
    title: 'Supervisor Operations Handbook',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    bgColor: 'bg-yellow-500/10',
    sections: [
      {
        title: '1. Supervisor Role',
        content: `As a supervisor, you are responsible for the **oversight, accountability, and performance** of personnel under your command. You do not typically handle routine calls — you manage people and critical incidents.

**Core responsibilities:**
- Review and approve/reject incident reports
- Monitor active units and calls for safety issues
- Respond to officer needs assistance, use of force, and major incidents
- Conduct debriefs after critical incidents
- Ensure report quality and policy compliance`,
      },
      {
        title: '2. Report Review Process',
        content: `Use the **Report Review tab** to manage submitted reports.

**Review checklist:**
- Is the report factual and free of opinion?
- Are all required fields completed?
- Does the narrative match the call type?
- Is use of force documented if it occurred?
- Are all involved parties listed?

**Actions:**
- ✅ **Approve** — report meets standards, filed to record
- ❌ **Reject** — send back with supervisor notes explaining what needs correction

**Turnaround standard:** All reports should be reviewed within the session they are submitted.`,
      },
      {
        title: '3. Critical Incident Response',
        content: `Supervisors must respond in person (virtually) to:
- Officer-involved shootings
- Use of force complaints
- Pursuits (to monitor and potentially terminate)
- Deaths in custody or on scene
- Any P1 incident with multiple units

**Upon arrival at a critical scene:**
1. Assess scene safety
2. Brief the officer-in-charge
3. Assume command if warranted
4. Ensure all reporting is initiated
5. Notify administration if required`,
      },
      {
        title: '4. Pursuit Policy',
        content: `Vehicle pursuits are high-risk and must be managed actively.

**Supervisor responsibilities during a pursuit:**
- Monitor radio continuously
- Evaluate risk vs. reward (severity of crime vs. public safety risk)
- Authorize or terminate the pursuit

**Termination criteria (any one is sufficient):**
- Speeds exceed safe limits for the environment
- The suspect's identity is known (can be arrested later)
- Weather or traffic creates unacceptable risk
- Distance from the jurisdiction is excessive
- More than 3 units are involved (no extra units needed)

**Terminating a pursuit:**
> *"All units, [Supervisor callsign], terminate the pursuit. All units return to patrol."*`,
      },
      {
        title: '5. Performance & Accountability',
        content: `Supervisors set the standard for the department.

**Unit monitoring:**
- Regularly check unit statuses on the supervisor board
- Address units that have been 10-6 or 10-97 for extended periods without updates
- Ensure units are clearing calls and filing reports promptly

**Counseling and discipline:**
- Address policy violations promptly and privately
- Document any formal counseling in an audit log
- Escalate repeat violations to server administration

**Positive reinforcement:**
- Acknowledge good work publicly on radio
- Recommend commendations for outstanding performance`,
      },
    ],
  },
};

function Section({ title, content, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/[0.06] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.04] transition-all"
      >
        <span className="text-white font-semibold text-sm">{title}</span>
        {open ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/[0.06] pt-3">
          <ReactMarkdown
            className="prose prose-sm prose-invert max-w-none text-white/75 [&>*:first-child]:mt-0 [&>table]:w-full [&>table]:border-collapse [&_th]:text-white/60 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:py-1.5 [&_th]:px-2 [&_th]:border [&_th]:border-white/[0.08] [&_td]:py-1.5 [&_td]:px-2 [&_td]:border [&_td]:border-white/[0.06] [&_td]:text-sm [&_tr:nth-child(even)]:bg-white/[0.02]"
            components={{
              p: ({ children }) => <p className="my-1.5 leading-relaxed text-sm">{children}</p>,
              ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-0.5">{children}</ul>,
              ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-0.5">{children}</ol>,
              li: ({ children }) => <li className="text-sm text-white/75">{children}</li>,
              strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-white/20 pl-3 my-2 text-white/50 italic text-sm">{children}</blockquote>
              ),
              code: ({ children }) => <code className="px-1 py-0.5 rounded bg-white/10 text-xs">{children}</code>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default function PanelHandbook({ panel }) {
  const [open, setOpen] = useState(false);
  const handbook = HANDBOOKS[panel];
  if (!handbook) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${handbook.bgColor} ${handbook.borderColor} ${handbook.color} hover:opacity-80`}
      >
        <BookOpen size={12} />
        Handbook
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 rounded-2xl text-white max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 [&>button]:hidden">
          <div className={`flex items-center justify-between px-5 py-4 border-b border-white/[0.06]`}>
            <div className="flex items-center gap-2">
              <BookOpen size={16} className={handbook.color} />
              <h2 className="text-white font-bold text-base">{handbook.title}</h2>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
              <X size={15} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-2">
            {handbook.sections.map((s, i) => (
              <Section key={i} title={s.title} content={s.content} defaultOpen={i === 0} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}