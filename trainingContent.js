// VanguardOS Training Content — RCPD/POST-sourced material

export const LEO_TRAINING = {
  name: 'Law Enforcement',
  icon: 'Shield',
  tiers: [
    {
      level: 1,
      name: 'Basic — Foundational',
      sections: [
        {
          title: 'Jurisdiction & Authority',
          content: 'Officers must understand city vs. county limits and mutual aid protocols. Primary jurisdiction defines where you have full law enforcement authority. Mutual aid allows you to assist neighboring agencies upon request, within legal parameters. Always confirm jurisdiction before initiating enforcement action in border areas.'
        },
        {
          title: 'Activity & Professionalism',
          content: 'Officers are required to maintain the biweekly activity cycle — logging patrol activity at minimum every two weeks. Professional standards apply at all times: appearance, conduct, radio etiquette, and civilian interaction. Failure to maintain activity standards may result in suspension or termination from the department.'
        },
        {
          title: 'Equipment & Uniforms',
          content: 'Standard-issue weapon structure is rank-restricted. Motorpool vehicles are assigned based on rank and certification level. Always verify your rank authorization before deploying special equipment such as long-arms or specialized vehicles. Unauthorized equipment use may result in disciplinary action. Uniform standards must be maintained at all times while on duty.'
        },
        {
          title: 'Radio Basics & 10-Codes',
          content: 'Your callsign is derived from your vehicle plate. Radio traffic must be clear, concise, and professional. Core 10-codes you must know:\n• 10-8: In Service / Available\n• 10-7: Out of Service / On Break\n• 10-6: Busy / Stand By\n• 10-42: Off Duty\n• 10-97: On Scene\n• 10-11: In Pursuit\nAlways identify your callsign before transmitting. Unnecessary radio traffic is prohibited.'
        }
      ],
      exam: [
        { q: 'What does 10-8 mean?', options: ['In Service', 'Out of Service', 'On Scene', 'Off Duty'], answer: 0 },
        { q: 'Your callsign is based on what?', options: ['Badge number', 'Vehicle plate', 'Rank', 'Name'], answer: 1 },
        { q: 'How often must officers log activity?', options: ['Weekly', 'Biweekly', 'Monthly', 'Daily'], answer: 1 },
        { q: 'What is mutual aid?', options: ['Assisting another agency in their jurisdiction', 'Calling for backup within your department', 'Requesting civilian help', 'None of the above'], answer: 0 },
        { q: 'What does 10-42 mean?', options: ['On Scene', 'In Pursuit', 'Off Duty', 'Traffic Stop'], answer: 2 },
        { q: 'Which 10-code means you are In Pursuit?', options: ['10-6', '10-7', '10-11', '10-97'], answer: 2 },
      ]
    },
    {
      level: 2,
      name: 'Standard — Operations',
      sections: [
        {
          title: 'Response Codes',
          content: 'Response codes define how urgently you respond:\n\n• Code 1: No lights or sirens — Routine response, no immediate threat to life.\n• Code 2: Lights only — Urgent but not life-threatening. Use when speed is needed but siren is not required.\n• Code 3: Lights AND sirens — Emergency response. Imminent threat to life. Always confirm your response code with dispatch before proceeding.'
        },
        {
          title: 'Traffic Safety — The 15% Visibility Rule',
          content: 'Radar enforcement vehicles must be at least 15% visible to oncoming traffic. Fully concealed speed enforcement is NOT authorized under department policy. Your patrol vehicle must be positioned so that a reasonable driver could observe it from the roadway. Fully hidden radar operations are considered entrapment and void any resulting citation.'
        },
        {
          title: 'Force Continuum',
          content: 'The use of force follows a structured escalation:\n\n1. Officer Presence — Your uniform and authority alone.\n2. Verbal Commands — Direct, clear, and lawful orders.\n3. Soft Control — Open-hand techniques, guiding, or controlling movements.\n4. Hard Control — Closed-fist strikes or takedown techniques.\n5. Intermediate Weapons — Taser, OC spray, baton.\n6. Lethal Force — Only when there is an imminent threat of death or serious bodily harm.\n\nAlways use the minimum force necessary. Skipping levels without justification is a policy violation.'
        },
        {
          title: 'Weapon Discharge & OIS Reporting',
          content: 'Any discharge of a department-issued firearm — even accidental — requires IMMEDIATE supervisor notification. Officer-Involved Shootings (OIS) must be reported to a supervisor and fully documented per department policy. The scene must be preserved. Involved officers should not discuss the incident without a supervisor or representative present. All weapons involved must be secured by a supervisor until an investigation is complete.'
        }
      ],
      exam: [
        { q: 'What is a Code 3 response?', options: ['No lights', 'Lights only', 'Lights and sirens', 'Silent response'], answer: 2 },
        { q: 'Radar cars must be at least ___% visible to traffic.', options: ['5%', '10%', '15%', '25%'], answer: 2 },
        { q: 'What is the first level of the force continuum?', options: ['Verbal Commands', 'Officer Presence', 'Soft Control', 'Hard Control'], answer: 1 },
        { q: 'True or False: OIS does not require supervisor notification.', options: ['True', 'False'], answer: 1 },
        { q: 'Code 2 means:', options: ['Routine, no lights', 'Lights only, urgent', 'Lights and sirens', 'Stealth approach'], answer: 1 },
        { q: 'What comes BEFORE hard control in the force continuum?', options: ['Lethal force', 'Soft control', 'Intermediate weapons', 'Taser'], answer: 1 },
      ]
    },
    {
      level: 3,
      name: 'Advanced — Technical/Critical',
      sections: [
        {
          title: 'Pursuit Intervention Technique (PIT)',
          content: 'PIT maneuvers are authorized ONLY at specific speed thresholds and MUST be approved by a supervisor before execution. The PIT is a controlled contact maneuver designed to safely end a pursuit by forcing the suspect vehicle into a spin. Unauthorized PIT attempts above posted thresholds are a policy violation and may result in termination. Always broadcast intent before executing and confirm authorization over radio.'
        },
        {
          title: 'Spike Strip Deployment',
          content: 'Spike strip deployment requires explicit approval from a supervisor or watch commander. Deployment position must account for:\n• Civilian traffic and bystander safety\n• Suspect vehicle angle and speed\n• Officer safety zone (always deploy from a covered position)\n\nOnce deployed, broadcast the strip location immediately to all pursuing units to prevent friendly-vehicle contact.'
        },
        {
          title: 'Tactical Medical — POST Standard',
          content: 'When encountering a wounded individual on scene:\n\n1. GLOVE UP — Personal protective equipment is mandatory.\n2. Check Airway, Breathing, and Circulation (ABC).\n3. Apply direct pressure to the wound site.\n4. Pack the wound cavity with hemostatic gauze if available.\n\nTOURNIQUET APPLICATION:\n• ARM or LEG placement ONLY — never apply to neck, torso, or joints.\n• Apply 2–3 inches ABOVE the wound site.\n• Tighten until active bleeding ceases.\n• Mark the time of application on the tourniquet or patient.'
        },
        {
          title: 'Medical Priority Rule',
          content: 'Treating patients and wounded individuals takes PRIORITY over chasing suspects once the scene is safe. This applies equally to suspects, victims, and bystanders. An officer who bypasses a critically wounded person to pursue a suspect without justification may face disciplinary action. Request EMS immediately and remain with the patient until higher-level care arrives. Scene safety always comes first — do not approach a patient in an active threat environment.'
        }
      ],
      exam: [
        { q: 'PIT maneuvers require approval from:', options: ['Any officer', 'Dispatch', 'A supervisor', 'No one'], answer: 2 },
        { q: 'Where can tourniquets be applied?', options: ['Neck and torso', 'Arms and legs only', 'Anywhere', 'Head only'], answer: 1 },
        { q: 'True or False: Medical aid takes priority over pursuit once scene is safe.', options: ['True', 'False'], answer: 0 },
        { q: 'Spike strips require approval from:', options: ['Any officer on scene', 'Supervisor or watch commander', 'Dispatch only', 'The chief'], answer: 1 },
        { q: 'The first step in wound packing is:', options: ['Apply tourniquet', 'Glove up', 'Call EMS', 'Elevate the limb'], answer: 1 },
        { q: 'How far above the wound should a tourniquet be placed?', options: ['At the wound', '2-3 inches above', '6 inches above', 'As close as possible'], answer: 1 },
      ]
    }
  ]
};

export const FIRE_TRAINING = {
  name: 'Fire & Rescue',
  icon: 'Flame',
  tiers: [
    {
      level: 1,
      name: 'Basic — Apparatus & Equipment',
      sections: [
        { title: 'Apparatus Identification', content: 'Engine: Primary fire suppression unit with pump, water tank, hoses, and ground ladders. Truck/Ladder: Aerial ladder or platform, specialized rescue tools, ventilation fans. Rescue: Technical rescue, extrication, HAZMAT initial response. Know which apparatus to request based on the nature of the call before arriving on scene.' },
        { title: 'Hydrant Supply Lines', content: 'Supply line is the large-diameter hose connecting the hydrant to the engine. Attack lines are smaller hoses going from the engine to the fire. Always establish a water supply BEFORE committing to interior operations. Never advance on a structure fire without a confirmed water source.' }
      ],
      exam: [
        { q: 'An Engine is primarily for:', options: ['Aerial operations', 'Fire suppression', 'Hazmat only', 'Transport'], answer: 1 },
        { q: 'Supply lines connect the ___ to the engine.', options: ['Station', 'Hydrant', 'Truck', 'Hospital'], answer: 1 },
        { q: 'True or False: Attack lines go from the engine to the fire.', options: ['True', 'False'], answer: 0 },
        { q: 'Interior ops should not begin without a confirmed:', options: ['Supervisor', 'Water source', 'Media clearance', 'Second engine'], answer: 1 }
      ]
    },
    {
      level: 2,
      name: 'Standard — Scene Operations',
      sections: [
        { title: 'Scene Staging', content: 'Stage at a safe distance until cleared by Incident Command. Do NOT self-deploy to the scene interior. Wait for assignment from IC before engaging. Staging protects personnel from unknown hazards and prevents freelancing that can endanger the whole crew.' },
        { title: 'Duty to Act', content: 'Medical emergencies create a legal and ethical duty to act. If you encounter a patient requiring care, you are obligated to provide assistance within your scope of training until relieved by equal or higher-level care. Abandoning a patient without handoff is a serious violation.' }
      ],
      exam: [
        { q: 'Staging means:', options: ['Rushing to the scene', 'Waiting at a safe distance for assignment', 'Going home', 'Calling dispatch'], answer: 1 },
        { q: 'Duty to Act applies when:', options: ['You feel like it', 'You encounter a patient in need', 'Only during shifts', 'Never'], answer: 1 },
        { q: 'Who assigns crews to positions at a scene?', options: ['Any firefighter', 'The driver', 'Incident Command', 'The dispatcher'], answer: 2 }
      ]
    },
    {
      level: 3,
      name: 'Advanced — ALS & Pharmacology',
      sections: [
        { title: 'EMT-A Pharmacology Basics', content: 'Advanced EMTs may administer specific medications under medical direction. The five authorized medications and their uses:\n• Epinephrine — Anaphylaxis (severe allergic reaction)\n• Naloxone (Narcan) — Opioid overdose reversal\n• Albuterol — Bronchospasm / asthma attack\n• Oral glucose — Hypoglycemia (low blood sugar)\n\nAlways verify the 5 Rights before administration:\n1. Right Patient\n2. Right Drug\n3. Right Dose\n4. Right Route\n5. Right Time' },
        { title: 'ALS Scene Management', content: 'Advanced Life Support operations require a structured approach:\n1. Establish scene safety before approaching\n2. Primary assessment — ABCDE (Airway, Breathing, Circulation, Disability, Exposure)\n3. Rapid transport decision — "load and go" vs. "stay and play"\n4. Ongoing reassessment during transport\n\nThe ALS provider coordinates with BLS providers on scene. Clear communication and role definition prevents duplication and gaps in care.' }
      ],
      exam: [
        { q: 'Naloxone is used for:', options: ['Anaphylaxis', 'Opioid overdose', 'Cardiac arrest', 'Burns'], answer: 1 },
        { q: 'The 5 Rights include Right Patient and:', options: ['Right drug, dose, route, time', 'Right form, color, size, shape', 'Right hospital, ambulance, crew, time', 'None'], answer: 0 },
        { q: 'ALS scene management starts with:', options: ['Transport immediately', 'Scene safety', 'Administer drugs', 'Call the hospital'], answer: 1 },
        { q: 'Epinephrine is given for:', options: ['Opioid overdose', 'Bronchospasm', 'Anaphylaxis', 'Hypoglycemia'], answer: 2 }
      ]
    }
  ]
};

export const DISPATCH_TRAINING = {
  name: 'Dispatch',
  icon: 'Radio',
  tiers: [
    {
      level: 1,
      name: 'Basic — CAD & Call-Taking',
      sections: [
        { title: 'CAD Navigation', content: 'The Computer-Aided Dispatch system is your primary tool. Master the following:\n• Creating new calls with all required fields\n• Updating unit statuses in real time\n• Managing the active call queue by priority\n\nKey unit statuses: 10-8 (Available), 10-7 (On Break), 10-97 (On Scene), 10-42 (Off Duty). Keep the CAD accurate at all times — it is the single source of truth for all active units and incidents.' },
        { title: 'Call-Taking Basics', content: 'Every call requires four core pieces of information:\n1. Location — Be as specific as possible (street, intersection, landmark)\n2. Nature of the call — What is happening?\n3. Caller information — Name and callback number if possible\n4. Additional details — Weapons, injuries, suspect descriptions\n\nPriority assignment:\n• P1 — Imminent danger to life (in-progress violence, active shooting)\n• P2 — Urgent (injury accident, fight in progress)\n• P3 — Routine (non-injury traffic complaint, noise)\n• P4 — Non-emergency (informational, civil matters)' }
      ],
      exam: [
        { q: '10-8 means:', options: ['Off Duty', 'Available', 'On Scene', 'Break'], answer: 1 },
        { q: 'P1 priority indicates:', options: ['Non-emergency', 'Routine', 'Imminent danger', 'Information only'], answer: 2 },
        { q: 'What information is required for every call?', options: ['Just the location', 'Location, nature, caller info, details', 'Only the caller name', 'Nothing'], answer: 1 },
        { q: 'What system is the dispatcher\'s primary tool?', options: ['Radio', 'CAD', 'Email', 'Phone'], answer: 1 }
      ]
    },
    {
      level: 2,
      name: 'Standard — Multi-Unit Management',
      sections: [
        { title: 'Signal 100 — Emergency Traffic Only', content: 'Signal 100 means EMERGENCY TRAFFIC ONLY. When activated by dispatch or command:\n• All non-essential radio traffic CEASES immediately\n• Only units involved in the active emergency may transmit\n• The channel is held for life-safety communications only\n\nSignal 100 is typically activated for officer-in-distress, active pursuit with cross-county movement, or mass-casualty incidents. It is lifted by the dispatcher or command when the emergency is resolved.' },
        { title: 'Managing Multi-Unit Pursuits', content: 'During a pursuit, the dispatcher\'s role is critical:\n• Maintain unit count (primary, secondary, supervisor)\n• Monitor cross-jurisdictional movement and notify neighboring agencies\n• Coordinate aerial, spike strip, and roadblock resources if authorized\n• Keep a running log: speeds, locations, direction of travel, involved units\n\nNever lose track of the primary unit. Request supervisor authorization for PIT or spike strips as needed.' }
      ],
      exam: [
        { q: 'Signal 100 means:', options: ['All clear', 'Emergency traffic only', 'Lunch break', 'Shift change'], answer: 1 },
        { q: 'During a pursuit, dispatchers should track:', options: ['Only the primary unit', 'Speeds, locations, and all involved units', 'Nothing, just listen', 'Only the suspect vehicle'], answer: 1 },
        { q: 'Who can lift Signal 100?', options: ['Any officer', 'Dispatcher or command', 'The chief only', 'Nobody'], answer: 1 }
      ]
    },
    {
      level: 3,
      name: 'Advanced — Incident Command',
      sections: [
        { title: 'BREAK! Command Protocol', content: '"BREAK! BREAK! BREAK!" is a radio interrupt command used exclusively for critical, life-safety communications. When you hear BREAK:\n• All units STOP transmitting immediately\n• The unit calling BREAK delivers their urgent information\n• Dispatch acknowledges and assigns a dedicated channel if needed\n\nBREAK is ONLY used when a unit is in immediate danger, has life-safety information, or there is an urgent update that overrides all current traffic. Misuse of BREAK is a serious policy violation.' },
        { title: 'Incident Command Coordination', content: 'For large-scale incidents (mass casualty, active shooter, major structure fire), the dispatcher serves as the central communication hub:\n• Coordinate directly with the Incident Commander (IC) for resource requests\n• Activate mutual aid channels as needed\n• Assign dedicated radio channels per discipline (Law, Fire, EMS, Command)\n• Log ALL resource deployments with timestamps\n\nThe dispatcher does not make tactical decisions — that is IC\'s role. Your job is to facilitate communication and resource flow.' }
      ],
      exam: [
        { q: 'BREAK! is used for:', options: ['Routine updates', 'Life-safety interruptions only', 'Shift changes', 'Lunch orders'], answer: 1 },
        { q: 'In a large incident, the dispatcher coordinates with:', options: ['Civilians', 'Media', 'Incident Command', 'Nobody'], answer: 2 },
        { q: 'The dispatcher\'s role in a large incident is:', options: ['Make tactical decisions', 'Facilitate communication and resource flow', 'Run the scene', 'Evacuate civilians'], answer: 1 }
      ]
    }
  ]
};

export function getTrainingForDept(dept) {
  if (dept === 'police' || dept === 'leo') return LEO_TRAINING;
  if (dept === 'fire' || dept === 'ems') return FIRE_TRAINING;
  if (dept === 'dispatch') return DISPATCH_TRAINING;
  return null;
}