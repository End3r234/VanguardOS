import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Map, Clock, Save, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import AIMapImport from './AIMapImport';
import { ERLC_MAP_IMAGE } from '@/lib/erlcMapData';
import { LOS_SANTOS_MAP_IMAGE, LOS_SANTOS_STREETS } from '@/lib/losStantosMapData';

export default function LiveMapSettings({ server, serverId }) {
  const queryClient = useQueryClient();

  const [enabled, setEnabled] = useState(server?.live_map_enabled ?? false);
  const [dmsEnabled, setDmsEnabled] = useState(server?.live_map_dms_enabled ?? false);
  const [preset, setPreset] = useState(server?.live_map_preset || 'none');
  const [pingInterval, setPingInterval] = useState(server?.unit_ping_interval ?? 120);
  const [customMapUrl, setCustomMapUrl] = useState(server?.map_url || '');
  const [aiResult, setAiResult] = useState(null);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Server.update(serverId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server'] }),
  });

  const handleSave = () => {
    saveMutation.mutate({
      live_map_enabled: enabled,
      live_map_dms_enabled: dmsEnabled,
      live_map_preset: preset,
      unit_ping_interval: Number(pingInterval),
      map_url: preset === 'lossantos' ? LOS_SANTOS_MAP_IMAGE : customMapUrl,
      ...(preset === 'lossantos' ? { map_streets_data: LOS_SANTOS_STREETS } : aiResult ? { map_streets_data: aiResult } : {}),
    });
  };

  return (
    <div className="space-y-4">
      {/* Enable toggle */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm flex items-center gap-2">
              <Map size={14} className="text-crimson" /> Live Dispatch Map
            </p>
            <p className="text-white/40 text-xs mt-0.5">
              {enabled ? 'Enabled — units and dispatchers can use the live map' : 'Disabled — live map tab is hidden'}
            </p>
          </div>
          <button
            onClick={() => setEnabled(e => !e)}
            className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${enabled ? 'bg-emerald-500' : 'bg-white/20'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${enabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </GlassCard>

      {enabled && (
        <>
          {/* DM toggle */}
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold text-sm flex items-center gap-2">
                  <MessageSquare size={14} className="text-crimson" /> Member DMs
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  {dmsEnabled ? 'Dispatchers can DM members from the live map' : 'Dispatchers must use radio to contact units'}
                </p>
              </div>
              <button
                onClick={() => setDmsEnabled(e => !e)}
                className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${dmsEnabled ? 'bg-emerald-500' : 'bg-white/20'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${dmsEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </GlassCard>

          {/* Preset selector */}
          <GlassCard>
            <Label className="text-white/60 text-xs mb-2 block">Map Preset</Label>
            <Select value={preset} onValueChange={setPreset}>
              <SelectTrigger className="bg-white/[0.05] border-white/10 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                <SelectItem value="erlc">ER:LC — Emergency Response: Liberty County</SelectItem>
                <SelectItem value="lossantos">Los Santos — GTA V / FiveM</SelectItem>
                <SelectItem value="custom">Custom — Upload your own map</SelectItem>
                <SelectItem value="none">None — No map image</SelectItem>
              </SelectContent>
            </Select>

            {preset === 'erlc' && (
              <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                <img src={ERLC_MAP_IMAGE} alt="ERLC Map" className="w-full object-contain max-h-48" />
                <p className="text-white/30 text-[10px] p-2 bg-black/20">
                  Pre-loaded with all ER:LC postal codes and street names
                </p>
              </div>
            )}

            {preset === 'lossantos' && (
              <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                <img src={LOS_SANTOS_MAP_IMAGE} alt="Los Santos Map" className="w-full object-contain max-h-48" />
                <p className="text-white/30 text-[10px] p-2 bg-black/20">
                  Pre-loaded with Los Santos streets, postal zones, and neighborhoods
                </p>
              </div>
            )}

            {preset === 'custom' && (
              <AIMapImport
                mapUrl={customMapUrl}
                onMapUrlChange={setCustomMapUrl}
                onResult={setAiResult}
              />
            )}
          </GlassCard>

          {/* Ping interval */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-white/50" />
              <Label className="text-white/60 text-xs">Unit Location Ping Interval</Label>
            </div>
            <p className="text-white/30 text-[10px] mb-3">
              How often (in seconds) to prompt on-duty units (10-8, 10-23) to update their map location.
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={15}
                max={3600}
                value={pingInterval}
                onChange={e => setPingInterval(e.target.value)}
                className="bg-white/[0.05] border-white/10 text-white rounded-xl w-28"
              />
              <span className="text-white/40 text-sm">seconds</span>
              <span className="text-white/20 text-xs">
                ({Math.floor(pingInterval / 60)}m {pingInterval % 60}s)
              </span>
            </div>
          </GlassCard>
        </>
      )}

      <div className="flex justify-end">
        <CrimsonButton onClick={handleSave} disabled={saveMutation.isPending} className="h-9 text-sm">
          <Save size={14} className="mr-1" />
          {saveMutation.isPending ? 'Saving...' : 'Save Map Settings'}
        </CrimsonButton>
      </div>
    </div>
  );
}