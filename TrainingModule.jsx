import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, Clock, ChevronRight } from 'lucide-react';
import VanguardLogo from '@/components/VanguardLogo';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import { getTrainingForDept } from '@/lib/trainingContent';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TrainingModule() {
  const pathParts = window.location.pathname.split('/');
  const dept = pathParts[2]; // leo, fire, dispatch
  const tierLevel = parseInt(pathParts[3]) || 1;

  const [phase, setPhase] = useState('learn'); // learn | exam | result
  const [currentSection, setCurrentSection] = useState(0);
  const [examAnswers, setExamAnswers] = useState({});
  const [score, setScore] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: certs = [] } = useQuery({
    queryKey: ['my-certs-train', user?.email],
    queryFn: () => base44.entities.UserCertification.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const training = getTrainingForDept(dept);
  const tier = training?.tiers?.find(t => t.level === tierLevel);

  const shuffledExam = useMemo(() => {
    if (!tier?.exam) return [];
    return shuffleArray(tier.exam.map(q => ({
      ...q,
      shuffledOptions: shuffleArray(q.options.map((opt, idx) => ({ text: opt, originalIdx: idx }))),
    })));
  }, [tier]);

  // Check cooldown
  const cert = certs[0];
  const cooldownActive = cert?.last_failed_attempt && cert?.failed_dept === dept &&
    (Date.now() - new Date(cert.last_failed_attempt).getTime()) < 30 * 60 * 1000;
  const cooldownRemaining = cooldownActive ? Math.ceil((30 * 60 * 1000 - (Date.now() - new Date(cert.last_failed_attempt).getTime())) / 60000) : 0;

  const submitExam = useMutation({
    mutationFn: async () => {
      let correct = 0;
      shuffledExam.forEach((q, idx) => {
        const selected = examAnswers[idx];
        if (selected !== undefined) {
          const selectedOriginalIdx = q.shuffledOptions[selected]?.originalIdx;
          if (selectedOriginalIdx === q.answer) correct++;
        }
      });
      const pct = (correct / shuffledExam.length) * 100;
      setScore({ correct, total: shuffledExam.length, pct });
      setPhase('result');

      const passed = pct >= 75;
      const tierKey = dept === 'leo' ? 'leo_tier' : dept === 'fire' ? 'fire_tier' : 'dispatch_tier';
      const certKey = dept === 'leo' ? 'police_key' : dept === 'fire' ? 'fire_key' : 'dispatch_key';

      if (cert) {
        if (passed) {
          const updates = { [tierKey]: Math.max(cert[tierKey] || 0, tierLevel) };
          if (tierLevel === training.tiers.length) updates[certKey] = true;
          await base44.entities.UserCertification.update(cert.id, updates);
        } else {
          await base44.entities.UserCertification.update(cert.id, {
            last_failed_attempt: new Date().toISOString(),
            failed_dept: dept,
          });
        }
      } else {
        const data = {
          user_email: user.email,
          server_id: 'global',
        };
        if (passed) {
          data[tierKey] = tierLevel;
          if (tierLevel === training.tiers.length) data[certKey] = true;
        } else {
          data.last_failed_attempt = new Date().toISOString();
          data.failed_dept = dept;
        }
        await base44.entities.UserCertification.create(data);
      }
      queryClient.invalidateQueries({ queryKey: ['my-certs-train'] });
    },
  });

  if (!training || !tier) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Training module not found.</p>
          <Link to="/lms"><CrimsonButton>Back to LMS</CrimsonButton></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <header className="border-b border-white/[0.06] bg-[#0B0B0B]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/lms" className="text-white/40 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
          <VanguardLogo size="sm" />
          <span className="text-white/30 text-sm">/ {training.name} — Tier {tierLevel}</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Learn Phase */}
        {phase === 'learn' && (
          <>
            <div className="flex items-center gap-2 text-white/30 text-xs mb-6">
              {tier.sections.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSection(i)}
                  className={`flex-1 h-1.5 rounded-full transition-all ${i <= currentSection ? 'bg-crimson' : 'bg-white/10'}`}
                />
              ))}
            </div>

            <GlassCard className="mb-6">
              <div className="flex items-center gap-2 text-crimson text-xs font-medium mb-3">
                <BookOpen size={13} />
                Section {currentSection + 1} of {tier.sections.length}
              </div>
              <h2 className="text-white font-bold text-xl mb-4">{tier.sections[currentSection].title}</h2>
              <div className="text-white/60 leading-relaxed text-sm whitespace-pre-line">
                {tier.sections[currentSection].content}
              </div>
            </GlassCard>

            <div className="flex justify-between">
              <CrimsonButton
                variant="ghost"
                disabled={currentSection === 0}
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              >
                Previous
              </CrimsonButton>
              {currentSection < tier.sections.length - 1 ? (
                <CrimsonButton onClick={() => setCurrentSection(currentSection + 1)}>
                  Next <ChevronRight size={14} className="ml-1" />
                </CrimsonButton>
              ) : (
                <CrimsonButton
                  onClick={() => {
                    if (cooldownActive) return;
                    setPhase('exam');
                    setExamAnswers({});
                  }}
                  disabled={cooldownActive}
                >
                  {cooldownActive ? `Cooldown: ${cooldownRemaining}min` : 'Take Exam'}
                </CrimsonButton>
              )}
            </div>
          </>
        )}

        {/* Exam Phase */}
        {phase === 'exam' && (
          <>
            <h2 className="text-white font-bold text-xl mb-6">Certification Exam — {tier.name}</h2>
            <div className="space-y-5">
              {shuffledExam.map((q, qIdx) => (
                <GlassCard key={qIdx}>
                  <p className="text-white font-medium mb-3 text-sm">{qIdx + 1}. {q.q}</p>
                  <div className="space-y-2">
                    {q.shuffledOptions.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => setExamAnswers({ ...examAnswers, [qIdx]: oIdx })}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all border ${
                          examAnswers[qIdx] === oIdx
                            ? 'bg-crimson/10 border-crimson/40 text-crimson'
                            : 'bg-white/[0.03] border-white/[0.06] text-white/60 hover:bg-white/[0.06]'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <CrimsonButton
                onClick={() => submitExam.mutate()}
                disabled={Object.keys(examAnswers).length < shuffledExam.length}
              >
                Submit Exam
              </CrimsonButton>
            </div>
          </>
        )}

        {/* Result Phase */}
        {phase === 'result' && score && (
          <div className="text-center py-12">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
              score.pct >= 75 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'
            }`}>
              {score.pct >= 75 ? (
                <CheckCircle2 size={36} className="text-emerald-400" />
              ) : (
                <XCircle size={36} className="text-red-400" />
              )}
            </div>
            <h2 className="text-white font-bold text-2xl mb-2">
              {score.pct >= 75 ? 'Certification Passed!' : 'Exam Failed'}
            </h2>
            <p className="text-white/40 mb-2">
              Score: {score.correct}/{score.total} ({Math.round(score.pct)}%)
            </p>
            {score.pct < 75 && (
              <p className="text-white/30 text-sm flex items-center justify-center gap-1">
                <Clock size={13} /> 30-minute cooldown before retrying
              </p>
            )}
            <div className="mt-6">
              <Link to="/lms"><CrimsonButton>Back to Academy</CrimsonButton></Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}