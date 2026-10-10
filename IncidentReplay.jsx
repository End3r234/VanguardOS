import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, X, Clock, UserPlus,
  FileText, CheckCircle2, XCircle, MessageSquare, Activity,
  AlertTriangle, ChevronRight, MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EVENT_CONFIG = {
  created: { icon: FileText, color: 'text-crimson', bg: 'bg-crimson/10', border: 'border-crimson/20', label: 'Incident Created' },
  unit_assigned: { icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Unit Assigned' },
  additional_unit: { icon: UserPlus, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'Additional Unit' },
  status_change: { icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Status Change' },
  priority_change: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Priority Change' },
  note_added: { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Note Added' },
  report_submitted: { icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Report Submitted' },
  report_approved: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Report Approved' },
  report_rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Report Rejected' },
  incident_closed: { icon: CheckCircle2, color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20', label: 'Incident Closed' },
};

export default function IncidentReplay({ call, serverId, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['incident-events', call?.incident_id],
    queryFn: () => base44.entities.IncidentEvent.filter({ incident_id: call.incident_id }),
    enabled: !!call?.incident_id,
  });

  const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const { data: positionHistory = [] } = useQuery({
    queryKey: ['replay-positions', call?.id],
    queryFn: async () => {
      const unitIds = call.assigned_units || [];
      if (unitIds.length === 0) return [];
      const results = await Promise.all(
        unitIds.map(uid => base44.entities.UnitPositionHistory.filter({ unit_id: uid }))
      );
      return results.flat();
    },
    enabled: !!call?.id,
  });

  const hasMapData = positionHistory.length > 0;

  useEffect(() => {
    if (!isPlaying || sortedEvents.length === 0) return;
    const interval = setInterval(() => {
      setCurrentStep(s => {
        if (s >= sortedEvents.length - 1) {
          setIsPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 2000 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed, sortedEvents.length]);

  const currentEvent = sortedEvents[currentStep];
  const startTime = sortedEvents[0] ? new Date(sortedEvents[0].timestamp) : null;
  const endTime = sortedEvents[sortedEvents.length - 1] ? new Date(sortedEvents[sortedEvents.length - 1].timestamp) : null;
  const totalDuration = startTime && endTime ? Math.round((endTime - startTime) / 1000) : 0;

  const getElapsedSeconds = () => {
    if (!currentEvent || !startTime) return 0;
    return Math.round((new Date(currentEvent.timestamp) - startTime) / 1000);
  };

  return (
    <Dialog open={!!call} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f0f0f] border-white/[0.08] rounded-2xl text-white max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white font-black tracking-wide text-sm uppercase flex items-center gap-2">
            <Play size={14} className="text-crimson" /> Operational Replay
            {call?.incident_id && <span className="text-[10px] font-mono-cad text-crimson/60 ml-2">{call.incident_id}</span>}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-crimson/20 border-t-crimson rounded-full animate-spin" />
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/20">
            <Clock size={32} className="mb-3 opacity-40" />
            <p className="text-sm">No events recorded for this incident.</p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Summary bar */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/30 uppercase tracking-widest">Events</span>
                <span className="text-white font-bold text-sm">{sortedEvents.length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/30 uppercase tracking-widest">Duration</span>
                <span className="text-white font-bold text-sm">{totalDuration}s</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white/30 uppercase tracking-widest">Units</span>
                <span className="text-white font-bold text-sm">{call?.assigned_units?.length || 0}</span>
              </div>
              {hasMapData && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={10} className="text-crimson" />
                  <span className="text-[10px] text-crimson uppercase tracking-widest font-bold">Map Data Available</span>
                </div>
              )}
            </div>

            {/* Timeline + Detail */}
            <div className="flex flex-1 overflow-hidden">
              {/* Timeline */}
              <div className="w-64 border-r border-white/[0.06] overflow-y-auto flex-shrink-0">
                {sortedEvents.map((evt, i) => {
                  const config = EVENT_CONFIG[evt.event_type] || EVENT_CONFIG.note_added;
                  const Icon = config.icon;
                  const isActive = i === currentStep;
                  return (
                    <button
                      key={evt.id}
                      onClick={() => { setCurrentStep(i); setIsPlaying(false); }}
                      className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-all border-l-2 ${isActive ? 'bg-white/[0.06] border-crimson' : 'border-transparent hover:bg-white/[0.03]'}`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg} ${config.border} border`}>
                        <Icon size={11} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-semibold leading-tight ${isActive ? 'text-white' : 'text-white/60'}`}>{config.label}</p>
                        <p className="text-[9px] text-white/30 font-mono-cad mt-0.5">{evt.timestamp ? format(new Date(evt.timestamp), 'HH:mm:ss') : '--'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detail panel */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                  {currentEvent && (
                    <motion.div
                      key={currentEvent.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {(() => {
                        const config = EVENT_CONFIG[currentEvent.event_type] || EVENT_CONFIG.note_added;
                        const Icon = config.icon;
                        return (
                          <>
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.border} border`}>
                                <Icon size={18} className={config.color} />
                              </div>
                              <div>
                                <p className="text-white font-bold text-base">{config.label}</p>
                                <p className="text-white/40 text-xs font-mono-cad">{currentEvent.timestamp ? format(new Date(currentEvent.timestamp), 'MMM d, yyyy — HH:mm:ss') : ''}</p>
                              </div>
                            </div>

                            {currentEvent.description && (
                              <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <p className="text-white/70 text-sm leading-relaxed">{currentEvent.description}</p>
                              </div>
                            )}

                            {currentEvent.actor_name && (
                              <div className="mb-3 flex items-center gap-2">
                                <span className="text-[10px] text-white/30 uppercase tracking-widest">Dispatcher</span>
                                <span className="text-white/60 text-xs">{currentEvent.actor_name}</span>
                              </div>
                            )}

                            {currentEvent.metadata && Object.keys(currentEvent.metadata).length > 0 && (
                              <div>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Details</p>
                                <div className="space-y-1.5">
                                  {Object.entries(currentEvent.metadata).map(([key, val]) => (
                                    <div key={key} className="flex items-center gap-2 text-xs">
                                      <span className="text-white/30 font-mono-cad">{key}:</span>
                                      <span className="text-white/60">{String(val)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Map replay indicator */}
                            {hasMapData && (
                              <div className="mt-4 p-3 rounded-xl bg-crimson/5 border border-crimson/15 flex items-center gap-2">
                                <MapPin size={14} className="text-crimson" />
                                <p className="text-white/50 text-xs">Unit position history available for this incident. Use playback controls to trace unit movements over time.</p>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Playback controls */}
            <div className="flex items-center gap-3 px-4 py-3 border-t border-white/[0.06] bg-white/[0.02]">
              <button
                onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-all"
                title="Restart"
              >
                <SkipBack size={14} className="text-white/40" />
              </button>
              <button
                onClick={() => { setIsPlaying(p => !p); if (currentStep >= sortedEvents.length - 1) setCurrentStep(0); }}
                className="p-2 rounded-lg bg-crimson hover:bg-crimson-dark text-white transition-all"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <button
                onClick={() => { setCurrentStep(s => Math.min(s + 1, sortedEvents.length - 1)); setIsPlaying(false); }}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-all"
                title="Next event"
              >
                <SkipForward size={14} className="text-white/40" />
              </button>

              {/* Progress */}
              <div className="flex-1 flex items-center gap-2">
                <span className="text-[10px] text-white/30 font-mono-cad">{getElapsedSeconds()}s</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-crimson to-crimson-dark rounded-full transition-all duration-300"
                    style={{ width: `${sortedEvents.length > 0 ? ((currentStep + 1) / sortedEvents.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/30 font-mono-cad">{totalDuration}s</span>
              </div>

              {/* Speed */}
              <div className="flex items-center gap-1">
                {[1, 2, 4].map(s => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${speed === s ? 'bg-crimson text-white' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.06]'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}