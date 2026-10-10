import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SafetyAlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="rounded-xl border-2 border-red-500/40 bg-gradient-to-r from-red-500/15 to-red-500/5 p-3.5 mb-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-red-400" />
          <span className="text-red-400 font-black text-sm uppercase tracking-widest">Officer Safety Alert</span>
        </div>
        <div className="space-y-1.5">
          {alerts.map(a => (
            <div key={a.id} className="flex items-start gap-2">
              <span className="text-red-400 text-sm leading-tight">•</span>
              <div>
                <span className="text-red-300 font-semibold text-sm">{a.alert_type}</span>
                {a.notes && <span className="text-red-300/50 text-xs ml-2">— {a.notes}</span>}
              </div>
            </div>
          ))}
        </div>
        <p className="text-red-400/80 text-xs mt-2 font-bold tracking-wider uppercase">⚠ Exercise Caution</p>
      </div>
    </div>
  );
}