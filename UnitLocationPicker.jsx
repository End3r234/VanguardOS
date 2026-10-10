import React, { useRef, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, X, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ERLC_MAP_IMAGE, ERLC_STREETS } from '@/lib/erlcMapData';

export default function UnitLocationPicker({ server, myUnit, open, onClose }) {
  const queryClient = useQueryClient();
  const mapRef = useRef(null);
  const [pending, setPending] = useState(null); // { x, y, postal, name }

  const preset = server?.live_map_preset || 'none';
  const mapImage = preset === 'erlc' ? ERLC_MAP_IMAGE : (preset === 'custom' ? server?.map_url : null);
  const streets = preset === 'erlc' ? ERLC_STREETS : (server?.map_streets_data || []);

  const updateMutation = useMutation({
    mutationFn: async ({ x_pct, y_pct, location }) => {
      await base44.entities.Unit.update(myUnit.id, { map_x_pct: x_pct, map_y_pct: y_pct, location, map_updated_at: new Date().toISOString() });
      await base44.entities.UnitPositionHistory.create({
        server_id: server?.id,
        unit_id: myUnit.id,
        user_email: myUnit.user_email,
        callsign: myUnit.callsign,
        department_type: myUnit.department_type,
        x_pct, y_pct, location,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server-units'] });
      queryClient.invalidateQueries({ queryKey: ['unit-history'] });
      setPending(null);
      onClose();
    },
  });

  const handleMapClick = useCallback((e) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Find nearest postal/street
    const nearest = streets.length > 0
      ? streets.reduce((best, s) => {
          const d = Math.hypot(s.x_pct - x, s.y_pct - y);
          return d < best.dist ? { ...s, dist: d } : best;
        }, { dist: 999, postal: '', name: '' })
      : { postal: '', name: '' };

    setPending({ x, y, postal: nearest.postal || '', name: nearest.name || '' });
  }, [streets]);

  const confirm = () => {
    if (!pending) return;
    updateMutation.mutate({
      x_pct: pending.x,
      y_pct: pending.y,
      location: [pending.postal, pending.name].filter(Boolean).join(' ') || `${pending.x.toFixed(1)}%, ${pending.y.toFixed(1)}%`,
    });
  };

  if (!myUnit) return null;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="bg-[#0f0f0f] border-white/10 rounded-2xl text-white max-w-2xl p-0 gap-0 [&>button]:hidden">
        <DialogHeader className="px-5 py-4 border-b border-white/[0.06] flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-white flex items-center gap-2 text-base">
            <MapPin size={15} className="text-crimson" /> Set Your Location on Map
          </DialogTitle>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
            <X size={15} />
          </button>
        </DialogHeader>

        <div className="p-4 space-y-3">
          {pending && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-crimson" />
                <span className="text-white/70">
                  {[pending.postal, pending.name].filter(Boolean).join(' ') || `(${pending.x.toFixed(1)}%, ${pending.y.toFixed(1)}%)`}
                </span>
              </div>
              <button
                onClick={confirm}
                disabled={updateMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs hover:bg-emerald-500/30 transition-all disabled:opacity-50"
              >
                {updateMutation.isPending ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                Confirm
              </button>
            </div>
          )}

          {!mapImage ? (
            <div className="h-64 flex items-center justify-center bg-white/[0.02] rounded-xl border border-dashed border-white/10">
              <div className="text-center">
                <MapPin size={24} className="mx-auto mb-2 text-white/20" />
                <p className="text-white/30 text-sm">No map configured</p>
                <p className="text-white/20 text-xs mt-1">Ask your server owner to set up the live map in Settings</p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-white/10 cursor-crosshair" style={{ height: 420 }}>
              <img
                ref={mapRef}
                src={mapImage}
                alt="Map"
                className="w-full h-full object-contain bg-[#0a0a0a] select-none"
                draggable={false}
                onClick={handleMapClick}
              />
              {/* Existing position */}
              {myUnit.map_x_pct != null && !pending && (
                <div
                  className="absolute pointer-events-none"
                  style={{ left: `${myUnit.map_x_pct}%`, top: `${myUnit.map_y_pct}%`, transform: 'translate(-50%, -100%)' }}
                >
                  <div className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                    {myUnit.callsign}
                  </div>
                </div>
              )}
              {/* Pending position */}
              {pending && (
                <div
                  className="absolute pointer-events-none"
                  style={{ left: `${pending.x}%`, top: `${pending.y}%`, transform: 'translate(-50%, -100%)' }}
                >
                  <div className="bg-crimson text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg whitespace-nowrap animate-pulse">
                    {myUnit.callsign}
                  </div>
                </div>
              )}
              <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/40 text-[10px] bg-black/60 px-3 py-1 rounded-full pointer-events-none">
                Click anywhere on the map to set your position
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}