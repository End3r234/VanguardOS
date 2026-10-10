import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Code2, FlaskConical, Shield, CheckCircle2, ChevronRight } from 'lucide-react';
import VanguardLogo from '@/components/VanguardLogo';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BG_URL = 'https://media.base44.com/images/public/69c6a8c8b372cbc680406011/b5d5b432b_Untitleddesign17.png';

const ROLES = [
  {
    id: 'developer',
    icon: Code2,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/30',
    activeBg: 'bg-blue-500/20 border-blue-400',
    title: 'Developer',
    desc: 'Contribute to the VanguardOS codebase, build features, and help shape the platform.',
  },
  {
    id: 'tester',
    icon: FlaskConical,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    activeBg: 'bg-emerald-500/20 border-emerald-400',
    title: 'Tester',
    desc: 'Find bugs, stress-test features, and verify fixes before they reach production.',
  },
  {
    id: 'moderator',
    icon: Shield,
    color: 'text-crimson',
    bg: 'bg-crimson/10 border-crimson/30',
    activeBg: 'bg-crimson/20 border-crimson',
    title: 'Moderator',
    desc: 'Keep the VanguardOS community safe, enforce guidelines, and support members.',
  },
];

const QUESTIONS = {
  developer: [
    { key: 'age', label: 'How old are you?', type: 'text', placeholder: 'e.g. 18' },
    { key: 'timezone', label: 'What timezone are you in?', type: 'text', placeholder: 'e.g. EST, GMT+2' },
    { key: 'experience_years', label: 'How many years of development experience do you have?', type: 'text', placeholder: 'e.g. 3 years' },
    { key: 'languages', label: 'What programming languages and frameworks are you proficient in?', type: 'textarea', placeholder: 'e.g. React, TypeScript, Python, Node.js...' },
    { key: 'react_exp', label: 'Describe your experience with React specifically. Have you built production applications?', type: 'textarea', placeholder: 'Tell us about your React projects...' },
    { key: 'portfolio', label: 'Do you have a portfolio, GitHub, or any projects you can share? (links welcome)', type: 'textarea', placeholder: 'GitHub, portfolio links, or project descriptions...' },
    { key: 'fivem_exp', label: 'Do you have experience with FiveM development or roleplay server infrastructure?', type: 'textarea', placeholder: 'Tell us about your RP/FiveM dev background...' },
    { key: 'availability', label: 'How many hours per week are you realistically available to contribute?', type: 'text', placeholder: 'e.g. 10-15 hours/week' },
    { key: 'motivation', label: 'Why do you want to join the VanguardOS development team specifically?', type: 'textarea', placeholder: 'Be honest and specific...' },
    { key: 'contribution', label: 'What specific area of VanguardOS would you most want to work on and why?', type: 'textarea', placeholder: 'e.g. dispatch panel, mobile, AI features...' },
    { key: 'ui_ux', label: 'How comfortable are you with UI/UX design and Tailwind CSS?', type: 'select', options: ['Not experienced', 'Beginner', 'Intermediate', 'Advanced', 'Expert'] },
    { key: 'git', label: 'Describe your experience with Git, pull requests, and collaborative development workflows.', type: 'textarea', placeholder: 'Tell us about your Git experience...' },
    { key: 'challenge', label: 'Describe the most technically challenging project or feature you have built. What made it hard?', type: 'textarea', placeholder: 'Walk us through the challenge and your solution...' },
    { key: 'realtime', label: 'Have you worked with real-time systems (WebSockets, live data subscriptions, etc.)? Describe your experience.', type: 'textarea', placeholder: 'Any real-time or reactive data experience...' },
    { key: 'learn', label: 'Is there a skill or technology you are currently learning or want to improve?', type: 'textarea', placeholder: 'Ongoing learning...' },
    { key: 'feedback', label: 'How do you handle constructive criticism of your code?', type: 'textarea', placeholder: 'Your approach to code reviews and feedback...' },
    { key: 'solo_vs_team', label: 'Do you prefer solo or collaborative development? Why?', type: 'textarea', placeholder: 'Your preferred working style...' },
    { key: 'anything_else', label: 'Is there anything else you would like us to know about you?', type: 'textarea', placeholder: 'Optional additional information...' },
  ],
  tester: [
    { key: 'age', label: 'How old are you?', type: 'text', placeholder: 'e.g. 18' },
    { key: 'timezone', label: 'What timezone are you in?', type: 'text', placeholder: 'e.g. EST, GMT+2' },
    { key: 'rp_experience', label: 'How long have you been involved in FiveM or Roblox roleplay communities?', type: 'text', placeholder: 'e.g. 3 years' },
    { key: 'cad_experience', label: 'Have you used other CAD/MDT systems before VanguardOS? Which ones?', type: 'textarea', placeholder: 'e.g. CAD by Sonoran, Burner CAD, custom MDTs...' },
    { key: 'vos_usage', label: 'How long have you been using VanguardOS and in what capacity?', type: 'textarea', placeholder: 'Describe your VOS usage — dispatch, LEO, civilian, etc.' },
    { key: 'bug_reporting', label: 'Have you reported bugs before? Describe your approach to writing a useful bug report.', type: 'textarea', placeholder: 'Steps, expected vs actual, environment, etc.' },
    { key: 'reproducibility', label: 'When you find a bug, how do you determine if it is reproducible vs. a one-off issue?', type: 'textarea', placeholder: 'Your testing methodology...' },
    { key: 'devices', label: 'What devices and browsers do you regularly use? (for cross-platform testing)', type: 'textarea', placeholder: 'e.g. Windows / Chrome, Mac / Firefox, iOS Safari...' },
    { key: 'availability', label: 'How many hours per week can you dedicate to testing?', type: 'text', placeholder: 'e.g. 5-10 hours/week' },
    { key: 'motivation', label: 'Why do you want to be a VanguardOS tester?', type: 'textarea', placeholder: 'Your motivation...' },
    { key: 'attention_detail', label: 'Describe a time you caught a bug or issue that others missed. What did you notice?', type: 'textarea', placeholder: 'A real example of your attention to detail...' },
    { key: 'edge_cases', label: 'How do you think about edge cases when testing a feature?', type: 'textarea', placeholder: 'Your edge-case testing mindset...' },
    { key: 'feedback_style', label: 'How would you describe your feedback style — blunt, diplomatic, or somewhere in between?', type: 'select', options: ['Very blunt / direct', 'Mostly direct with context', 'Balanced', 'Diplomatic but clear', 'Very diplomatic'] },
    { key: 'stress_test', label: 'What does a "stress test" mean to you in the context of a platform like VanguardOS?', type: 'textarea', placeholder: 'Your understanding of stress/load testing...' },
    { key: 'discord', label: 'What is your Discord username? (for coordination)', type: 'text', placeholder: 'e.g. username#0000 or @username' },
    { key: 'anything_else', label: 'Anything else you want to tell us?', type: 'textarea', placeholder: 'Optional...' },
  ],
  moderator: [
    { key: 'age', label: 'How old are you?', type: 'text', placeholder: 'e.g. 18' },
    { key: 'timezone', label: 'What timezone are you in?', type: 'text', placeholder: 'e.g. EST, GMT+2' },
    { key: 'rp_background', label: 'Describe your background in online roleplay communities.', type: 'textarea', placeholder: 'Servers you have been part of, roles held, etc.' },
    { key: 'mod_experience', label: 'Have you previously moderated a Discord server, forum, or online community? Describe your experience.', type: 'textarea', placeholder: 'Platforms, team size, responsibilities...' },
    { key: 'vos_usage', label: 'How long have you been using VanguardOS and in what roles?', type: 'textarea', placeholder: 'Dispatch, LEO, admin, etc.' },
    { key: 'availability', label: 'How many hours per week are you available to moderate?', type: 'text', placeholder: 'e.g. 15 hours/week across evenings' },
    { key: 'conflict_resolution', label: 'Describe how you would handle a heated conflict between two members in the VanguardOS community.', type: 'textarea', placeholder: 'Walk us through your approach step by step...' },
    { key: 'rule_break', label: 'A member you personally like breaks a community rule. How do you handle it?', type: 'textarea', placeholder: 'Be honest about your approach to impartiality...' },
    { key: 'false_report', label: 'You receive a moderation report but after investigation you believe it is false or exaggerated. What do you do?', type: 'textarea', placeholder: 'Your process for handling unclear or false reports...' },
    { key: 'escalation', label: 'What types of situations would you escalate to a senior admin vs. handle independently?', type: 'textarea', placeholder: 'Where you draw the escalation line...' },
    { key: 'toxic_behavior', label: 'How do you identify and address subtle toxic behavior that does not obviously break rules?', type: 'textarea', placeholder: 'Your approach to grey-area conduct...' },
    { key: 'burnout', label: 'Moderation can be mentally draining. How do you manage moderator burnout?', type: 'textarea', placeholder: 'Your approach to sustainability in the role...' },
    { key: 'languages_spoken', label: 'What languages do you speak fluently?', type: 'text', placeholder: 'e.g. English, Spanish, French' },
    { key: 'discord', label: 'What is your Discord username?', type: 'text', placeholder: 'e.g. @username' },
    { key: 'motivation', label: 'Why do you want to moderate VanguardOS specifically?', type: 'textarea', placeholder: 'Your genuine motivation...' },
    { key: 'strengths', label: 'What is your single greatest strength as a potential moderator?', type: 'textarea', placeholder: 'Be specific, not generic...' },
    { key: 'weaknesses', label: 'What is an area you are actively working to improve in?', type: 'textarea', placeholder: 'Honest self-assessment...' },
    { key: 'anything_else', label: 'Is there anything else you would like us to know?', type: 'textarea', placeholder: 'Optional...' },
  ],
};

function QuestionField({ q, value, onChange }) {
  if (q.type === 'textarea') {
    return (
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm min-h-[80px]"
        placeholder={q.placeholder}
      />
    );
  }
  if (q.type === 'select') {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
          {q.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  }
  return (
    <Input
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"
      placeholder={q.placeholder}
    />
  );
}

export default function Apply() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const submitMutation = useMutation({
    mutationFn: () => base44.entities.StaffApplication.create({
      applicant_email: user.email,
      applicant_name: user.full_name || user.email,
      role: selectedRole,
      status: 'pending',
      answers,
      admin_comments: [],
    }),
    onSuccess: () => setSubmitted(true),
  });

  const questions = selectedRole ? QUESTIONS[selectedRole] : [];
  const answeredCount = questions.filter(q => answers[q.key]?.trim()).length;
  const requiredAnswered = questions.filter(q => !['anything_else'].includes(q.key) && answers[q.key]?.trim()).length;
  const requiredTotal = questions.filter(q => !['anything_else'].includes(q.key)).length;
  const canSubmit = requiredAnswered === requiredTotal;

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-emerald-400" />
          </div>
          <h1 className="text-white font-black text-3xl mb-3">Application Submitted</h1>
          <p className="text-white/50 text-base leading-relaxed mb-8">
            Your <strong className="text-white capitalize">{selectedRole}</strong> application has been received. We'll review it and get back to you. Thank you for your interest in the VanguardOS team.
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson-light text-white font-semibold px-6 py-3 rounded-xl transition-all">
            <ArrowLeft size={15} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white relative">
      {/* BG */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: `url(${BG_URL})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.05 }} />

      {/* Nav */}
      <div className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/[0.06]">
        <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <VanguardLogo size="sm" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-crimson/20 text-crimson border-crimson/30 mb-4">
            VanguardOS Staff Applications
          </span>
          <h1 className="text-4xl font-black mt-3 mb-3">Join the Team</h1>
          <p className="text-white/50 text-base max-w-lg mx-auto leading-relaxed">
            VanguardOS is built and maintained by passionate volunteers. We're looking for developers, testers, and moderators to help shape the future of the platform.
          </p>
        </div>

        {/* Role selection */}
        {!selectedRole && (
          <div className="space-y-4">
            <p className="text-white/40 text-sm uppercase tracking-wider font-semibold text-center mb-6">Choose a role to apply for</p>
            {ROLES.map(role => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => { setSelectedRole(role.id); setAnswers({}); }}
                  className={`w-full flex items-center gap-5 p-5 rounded-2xl border transition-all text-left hover:scale-[1.01] ${role.bg}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-black/20 border border-white/10 flex-shrink-0`}>
                    <Icon size={20} className={role.color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold text-base">{role.title}</p>
                    <p className="text-white/50 text-sm mt-0.5 leading-relaxed">{role.desc}</p>
                  </div>
                  <ChevronRight size={18} className="text-white/30 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}

        {/* Application form */}
        {selectedRole && (
          <div>
            {/* Role header */}
            {(() => {
              const role = ROLES.find(r => r.id === selectedRole);
              const Icon = role.icon;
              return (
                <div className={`flex items-center gap-4 p-4 rounded-2xl border mb-8 ${role.bg}`}>
                  <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center border border-white/10">
                    <Icon size={18} className={role.color} />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold">{role.title} Application</p>
                    <p className="text-white/50 text-xs">{answeredCount} of {questions.length} answered</p>
                  </div>
                  <button onClick={() => setSelectedRole(null)} className="text-white/30 hover:text-white text-xs underline">
                    Change role
                  </button>
                </div>
              );
            })()}

            {/* Progress bar */}
            <div className="w-full h-1 bg-white/[0.06] rounded-full mb-8 overflow-hidden">
              <div
                className="h-full bg-crimson rounded-full transition-all"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>

            <div className="space-y-6">
              {questions.map((q, i) => (
                <div key={q.key} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <Label className="text-white/80 text-sm font-medium leading-relaxed">
                    <span className="text-crimson font-black mr-2">{String(i + 1).padStart(2, '0')}.</span>
                    {q.label}
                    {q.key === 'anything_else' && <span className="text-white/30 ml-2 text-xs">(optional)</span>}
                  </Label>
                  <div className="mt-2">
                    <QuestionField
                      q={q}
                      value={answers[q.key] || ''}
                      onChange={val => setAnswers(prev => ({ ...prev, [q.key]: val }))}
                    />
                  </div>
                </div>
              ))}
            </div>

            {!canSubmit && (
              <p className="text-white/30 text-xs text-center mt-6">
                Please answer all required questions to submit. ({requiredAnswered}/{requiredTotal} complete)
              </p>
            )}

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setSelectedRole(null)} className="px-5 py-3 rounded-xl text-white/40 hover:text-white border border-white/10 hover:border-white/20 transition-all text-sm">
                Cancel
              </button>
              <button
                onClick={() => submitMutation.mutate()}
                disabled={!canSubmit || submitMutation.isPending}
                className="px-6 py-3 rounded-xl bg-crimson hover:bg-crimson-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-crimson/20"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}