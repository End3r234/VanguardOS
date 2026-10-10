import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, User, Car, AlertTriangle, ChevronDown, ChevronUp, Shield, FileText, Edit2, Check, X, Plus, Tag, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GlassCard from '@/components/GlassCard';
import SafetyAlertBanner from '@/components/officer-safety/SafetyAlertBanner';
import SafetyAlertManager from '@/components/officer-safety/SafetyAlertManager';

const PREDEFINED_FLAGS = [
  'Armed & Dangerous', 'Flight Risk', 'Aggressive', 'Mentally Ill',
  'Warrant Issued', 'Known Gang Member', 'Drug User', 'Violent History',
  'Suicidal', 'Medical Alert',
];

const DL_STATUS_COLOR = {
  Valid: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Suspended: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Revoked: 'text-red-400 bg-red-500/10 border-red-500/20',
  Expired: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  None: 'text-white/30 bg-white/[0.04] border-white/10',
};

const PLATE_STATUS_COLOR = {
  Valid: 'text-emerald-400',
  Stolen: 'text-red-400',
  Expired: 'text-orange-400',
  Suspended: 'text-amber-400',
};

function CivilianResult({ civilian, reports, onUpdate, civAlerts, addrAlerts, canView, canManage, user, serverId }) {
  const [expanded, setExpanded] = useState(false);
  const [editingDL, setEditingDL] = useState(false);
  const [newDLStatus, setNewDLStatus] = useState(civilian.dl_status || 'Valid');
  const [addingFlag, setAddingFlag] = useState(false);
  const [customFlag, setCustomFlag] = useState('');
  const [selectedFlag, setSelectedFlag] = useState('');
  const dlStyle = DL_STATUS_COLOR[civilian.dl_status] || DL_STATUS_COLOR.None;
  const civReports = (reports || []).filter(r => r.involved_parties?.toLowerCase().includes(civilian.name?.toLowerCase()));

  const handleDLSave = () => {
    onUpdate(civilian.id, { dl_status: newDLStatus });
    setEditingDL(false);
  };

  const handleAddFlag = () => {
    const flag = customFlag.trim() || selectedFlag;
    if (!flag) return;
    const existing = civilian.flags || [];
    if (!existing.includes(flag)) {
      onUpdate(civilian.id, { flags: [...existing, flag] });
    }
    setCustomFlag('');
    setSelectedFlag('');
    setAddingFlag(false);
  };

  const handleRemoveFlag = (flag) => {
    const updated = (civilian.flags || []).filter(f => f !== flag);
    onUpdate(civilian.id, { flags: updated });
  };

  const combinedAlerts = [...(civAlerts || []), ...(addrAlerts || [])];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.03]" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <User size={14} className="text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">{civilian.name}</span>
              {(civilian.flags || []).length > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded border bg-red-500/10 border-red-500/20 text-red-400 font-bold flex items-center gap-0.5">
                  <AlertTriangle size={9} /> FLAGGED
                </span>
              )}
              {combinedAlerts.length > 0 && canView && (
                <span className="text-[9px] px-1.5 py-0.5 rounded border bg-red-500/20 border-red-500/40 text-red-400 font-bold flex items-center gap-0.5 animate-pulse">
                  <AlertTriangle size={9} /> {combinedAlerts.length} SAFETY ALERT{combinedAlerts.length !== 1 ? 'S' : ''}
                </span>
              )}
            </div>
            <div className="text-white/30 text-xs">{civilian.dob ? `DOB: ${civilian.dob}` : ''} {civilian.address ? `• ${civilian.address}` : ''}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${dlStyle}`}>DL: {civilian.dl_status}</span>
          {expanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/[0.06] pt-3 grid grid-cols-2 gap-2 text-xs">
          {/* Officer Safety Alert Banner */}
          {combinedAlerts.length > 0 && canView && (
            <div className="col-span-2">
              <SafetyAlertBanner alerts={combinedAlerts} />
            </div>
          )}

          {/* DL Status Editor */}
          <div className="col-span-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-white/30 text-xs">Driver's License Status:</span>
              {editingDL ? (
                <div className="flex items-center gap-1">
                  <select
                    value={newDLStatus}
                    onChange={e => setNewDLStatus(e.target.value)}
                    className="text-xs bg-[#1a1a1a] border border-white/20 text-white rounded px-2 py-0.5"
                  >
                    {['Valid','Suspended','Revoked','Expired','None'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={handleDLSave} className="text-emerald-400 hover:text-emerald-300 p-0.5"><Check size={12} /></button>
                  <button onClick={() => setEditingDL(false)} className="text-white/30 hover:text-white p-0.5"><X size={12} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${dlStyle}`}>{civilian.dl_status}</span>
                  <button onClick={() => setEditingDL(true)} className="text-white/30 hover:text-white/70 transition-all" title="Update DL status">
                    <Edit2 size={10} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {[
            ['Gender', civilian.gender], ['Ethnicity', civilian.ethnicity],
            ['Height', civilian.height], ['Weight', civilian.weight],
            ['Eye Color', civilian.eye_color], ['Hair Color', civilian.hair_color],
            ['Occupation', civilian.occupation], ['Phone', civilian.phone],
            ["DL Number", civilian.drivers_license], ['Insurance', civilian.insurance],
            ['Nationality', civilian.nationality], ['Emergency Contact', civilian.emergency_contact],
          ].map(([label, val]) => val ? (
            <div key={label}>
              <span className="text-white/30">{label}: </span>
              <span className="text-white/70">{val}</span>
            </div>
          ) : null)}
          {/* Vehicles */}
          {(civilian.license_plates || []).length > 0 && (
            <div className="col-span-2 mt-1">
              <div className="text-white/40 text-xs mb-1 font-semibold uppercase tracking-wider">Registered Vehicles</div>
              <div className="space-y-1">
                {civilian.license_plates.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-white/[0.03] rounded-lg px-3 py-1.5">
                    <Car size={11} className="text-white/30" />
                    <span className="text-white font-mono font-bold">{v.plate}</span>
                    <span className="text-white/40">{v.year} {v.color} {v.make} {v.model}</span>
                    <span className={`ml-auto text-[9px] font-bold ${PLATE_STATUS_COLOR[v.status] || ''}`}>{v.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Reports linked */}
          {civReports.length > 0 && (
            <div className="col-span-2 mt-1">
              <div className="text-white/40 text-xs mb-1 font-semibold uppercase tracking-wider flex items-center gap-1"><FileText size={10} /> Prior Reports ({civReports.length})</div>
              {civReports.slice(0, 3).map(r => (
                <div key={r.id} className="text-xs text-white/40 flex items-center gap-2 py-0.5">
                  <span className="text-white/60">{r.title || r.report_type}</span>
                  <span className="text-white/20">{r.location}</span>
                  <span className={`ml-auto text-[9px] ${r.status === 'approved' ? 'text-emerald-400' : 'text-white/30'}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
          {/* Flags management */}
          <div className="col-span-2 mt-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-red-400 text-xs font-semibold flex items-center gap-1"><AlertTriangle size={11} /> Flags</div>
              <button onClick={() => setAddingFlag(true)} className="text-white/30 hover:text-crimson transition-all" title="Add flag">
                <Plus size={10} />
              </button>
            </div>
            {addingFlag && (
              <div className="flex items-center gap-1 mb-2 flex-wrap">
                <select
                  value={selectedFlag}
                  onChange={e => { setSelectedFlag(e.target.value); setCustomFlag(''); }}
                  className="text-xs bg-[#1a1a1a] border border-white/20 text-white rounded px-2 py-0.5"
                >
                  <option value="">— Preset flags —</option>
                  {PREDEFINED_FLAGS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <span className="text-white/30 text-[10px]">or</span>
                <input
                  value={customFlag}
                  onChange={e => { setCustomFlag(e.target.value); setSelectedFlag(''); }}
                  placeholder="Custom tag..."
                  className="text-xs bg-[#1a1a1a] border border-white/20 text-white rounded px-2 py-0.5 w-28"
                />
                <button onClick={handleAddFlag} className="text-emerald-400 hover:text-emerald-300"><Check size={12} /></button>
                <button onClick={() => setAddingFlag(false)} className="text-white/30 hover:text-white"><X size={12} /></button>
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              {(civilian.flags || []).map(f => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1 group">
                  {f}
                  <button onClick={() => handleRemoveFlag(f)} className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-300 transition-all"><X size={8} /></button>
                </span>
              ))}
              {(civilian.flags || []).length === 0 && <span className="text-white/20 text-[10px]">No flags</span>}
            </div>
          </div>
          {/* Officer Safety Alert Manager */}
          {canView && (
            <div className="col-span-2 mt-1">
              <SafetyAlertManager
                serverId={serverId}
                recordType="civilian"
                recordId={civilian.id}
                recordIdentifier={civilian.name}
                canManage={canManage}
                canView={canView}
                user={user}
              />
              {civilian.address && (
                <div className="mt-2">
                  <SafetyAlertManager
                    serverId={serverId}
                    recordType="address"
                    recordId={civilian.address}
                    recordIdentifier={civilian.address}
                    canManage={canManage}
                    canView={canView}
                    user={user}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlateResult({ plate, civilian, alerts, canView, canManage, user, serverId }) {
  const status = PLATE_STATUS_COLOR[plate.status] || '';
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      {canView && alerts?.length > 0 && (
        <div className="px-3 pt-3">
          <SafetyAlertBanner alerts={alerts} />
        </div>
      )}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
          <Car size={14} className="text-white/50" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-mono font-bold text-sm">{plate.plate}</span>
            <span className={`text-[9px] font-bold ${status}`}>{plate.status}</span>
            {plate.status === 'Stolen' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold flex items-center gap-0.5"><AlertTriangle size={9} /> STOLEN</span>}
          </div>
          <div className="text-white/40 text-xs">{plate.year} {plate.color} {plate.make} {plate.model} {plate.state ? `• ${plate.state}` : ''}</div>
        </div>
        {civilian && (
          <div className="text-right text-xs">
            <div className="text-white/60">{civilian.name}</div>
            <div className={`text-[9px] ${DL_STATUS_COLOR[civilian.dl_status]?.split(' ')[0] || ''}`}>DL: {civilian.dl_status}</div>
          </div>
        )}
      </div>
      {canView && (
        <div className="px-3 pb-3">
          <SafetyAlertManager
            serverId={serverId}
            recordType="vehicle"
            recordId={plate.plate}
            recordIdentifier={plate.plate}
            canManage={canManage}
            canView={canView}
            user={user}
          />
        </div>
      )}
    </div>
  );
}

export default function DatabaseSearch({ serverId, server, user, myMember, isAdmin, isOwner }) {
  const [civQuery, setCivQuery] = useState('');
  const [plateQuery, setPlateQuery] = useState('');
  const [addrQuery, setAddrQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: civilians = [], isFetching: civFetching } = useQuery({
    queryKey: ['db-civilians', serverId],
    queryFn: () => base44.entities.Civilian.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const updateCivilianMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Civilian.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['db-civilians', serverId] }),
  });

  const handleCivilianUpdate = (id, data) => updateCivilianMutation.mutate({ id, data });

  const { data: reports = [] } = useQuery({
    queryKey: ['db-reports', serverId],
    queryFn: () => base44.entities.IncidentReport.filter({ server_id: serverId }),
    enabled: !!serverId,
  });

  const officerSafetyEnabled = server?.officer_safety_enabled ?? false;
  const canViewAlerts = officerSafetyEnabled && (isAdmin || isOwner || myMember?.permissions?.view_safety_alerts !== false);
  const canManageAlerts = officerSafetyEnabled && (isAdmin || isOwner || myMember?.permissions?.manage_safety_alerts);

  const { data: allAlerts = [] } = useQuery({
    queryKey: ['safety-alerts-server', serverId],
    queryFn: () => base44.entities.OfficerSafetyAlert.filter({ server_id: serverId }),
    enabled: !!serverId && officerSafetyEnabled,
  });

  const filterAlerts = (type, id) =>
    (allAlerts || []).filter(a => a.record_type === type && a.record_id === id && a.is_active !== false);

  const filteredCivs = civQuery.trim()
    ? civilians.filter(c =>
        c.name?.toLowerCase().includes(civQuery.toLowerCase()) ||
        c.dob?.includes(civQuery) ||
        c.drivers_license?.toLowerCase().includes(civQuery.toLowerCase())
      )
    : [];

  const allPlates = civilians.flatMap(c =>
    (c.license_plates || []).map(p => ({ ...p, _civId: c.id }))
  );
  const filteredPlates = plateQuery.trim()
    ? allPlates.filter(p => p.plate?.toLowerCase().includes(plateQuery.toLowerCase()))
    : [];

  // Address search — unique addresses matching the query
  const matchingAddrs = addrQuery.trim()
    ? [...new Set(civilians.filter(c => c.address?.toLowerCase().includes(addrQuery.toLowerCase())).map(c => c.address))].filter(Boolean)
    : [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={20} className="text-blue-400" />
        <h2 className="text-white font-bold text-lg">Database Search</h2>
        {officerSafetyEnabled && canViewAlerts && (
          <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold flex items-center gap-1">
            <AlertTriangle size={9} /> OFFICER SAFETY ACTIVE
          </span>
        )}
      </div>

      <Tabs defaultValue="civilians">
        <TabsList className="bg-white/[0.04] border border-white/10 rounded-xl mb-5">
          <TabsTrigger value="civilians" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <User size={13} className="mr-1.5" /> Civilians
          </TabsTrigger>
          <TabsTrigger value="plates" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <Car size={13} className="mr-1.5" /> Plates
          </TabsTrigger>
          <TabsTrigger value="addresses" className="text-white/60 data-[state=active]:text-white data-[state=active]:bg-white/10 rounded-lg">
            <MapPin size={13} className="mr-1.5" /> Addresses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="civilians">
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              value={civQuery}
              onChange={e => setCivQuery(e.target.value)}
              placeholder="Search by name, DOB, or license number..."
              className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl"
            />
          </div>
          {civQuery.trim() === '' ? (
            <GlassCard className="text-center py-12">
              <User size={32} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/40 text-sm">Enter a name or license number to search</p>
            </GlassCard>
          ) : filteredCivs.length === 0 ? (
            <GlassCard className="text-center py-12">
              <p className="text-white/40 text-sm">No records found for "{civQuery}"</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {filteredCivs.map(c => (
                <CivilianResult
                  key={c.id}
                  civilian={c}
                  reports={reports}
                  onUpdate={handleCivilianUpdate}
                  civAlerts={filterAlerts('civilian', c.id)}
                  addrAlerts={c.address ? filterAlerts('address', c.address) : []}
                  canView={canViewAlerts}
                  canManage={canManageAlerts}
                  user={user}
                  serverId={serverId}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="plates">
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              value={plateQuery}
              onChange={e => setPlateQuery(e.target.value)}
              placeholder="Enter license plate number..."
              className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl font-mono"
            />
          </div>
          {plateQuery.trim() === '' ? (
            <GlassCard className="text-center py-12">
              <Car size={32} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/40 text-sm">Enter a plate number to search</p>
            </GlassCard>
          ) : filteredPlates.length === 0 ? (
            <GlassCard className="text-center py-12">
              <p className="text-white/40 text-sm">No plates found for "{plateQuery}"</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {filteredPlates.map((p, i) => {
                const civ = civilians.find(c => c.id === p._civId);
                return (
                  <PlateResult
                    key={i}
                    plate={p}
                    civilian={civ}
                    alerts={filterAlerts('vehicle', p.plate)}
                    canView={canViewAlerts}
                    canManage={canManageAlerts}
                    user={user}
                    serverId={serverId}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="addresses">
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <Input
              value={addrQuery}
              onChange={e => setAddrQuery(e.target.value)}
              placeholder="Search by address..."
              className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl"
            />
          </div>
          {addrQuery.trim() === '' ? (
            <GlassCard className="text-center py-12">
              <MapPin size={32} className="mx-auto mb-3 text-white/20" />
              <p className="text-white/40 text-sm">Enter an address to search</p>
            </GlassCard>
          ) : matchingAddrs.length === 0 ? (
            <GlassCard className="text-center py-12">
              <p className="text-white/40 text-sm">No addresses found for "{addrQuery}"</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {matchingAddrs.map(addr => {
                const addrAlerts = filterAlerts('address', addr);
                const residents = civilians.filter(c => c.address === addr);
                return (
                  <div key={addr} className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                        <MapPin size={14} className="text-teal-400" />
                      </div>
                      <div>
                        <span className="text-white font-semibold text-sm">{addr}</span>
                        <span className="text-white/30 text-xs ml-2">{residents.length} resident{residents.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    {addrAlerts.length > 0 && canViewAlerts && (
                      <div className="px-3 pb-1">
                        <SafetyAlertBanner alerts={addrAlerts} />
                      </div>
                    )}
                    <div className="px-3 pb-3">
                      {canViewAlerts && (
                        <SafetyAlertManager
                          serverId={serverId}
                          recordType="address"
                          recordId={addr}
                          recordIdentifier={addr}
                          canManage={canManageAlerts}
                          canView={canViewAlerts}
                          user={user}
                        />
                      )}
                      {residents.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/[0.06]">
                          <div className="text-white/40 text-[10px] mb-1 uppercase tracking-wider">Residents</div>
                          {residents.map(r => (
                            <div key={r.id} className="text-xs text-white/60 py-0.5 flex items-center gap-2">
                              <User size={10} className="text-white/30" />
                              {r.name}
                              {r.dob && <span className="text-white/20">DOB: {r.dob}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}