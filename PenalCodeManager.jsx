import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Save, Scale } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';

const DEFAULT_PENAL_CODE = [
  { code: '148 PC', title: 'Resisting Arrest', category: 'Misdemeanor', fine: 1000, jail: '30 days' },
  { code: '187 PC', title: 'Murder (1st Degree)', category: 'Felony', fine: 0, jail: 'Life' },
  { code: '192 PC', title: 'Manslaughter', category: 'Felony', fine: 5000, jail: '15 years' },
  { code: '211 PC', title: 'Robbery', category: 'Felony', fine: 10000, jail: '9 years' },
  { code: '215 PC', title: 'Carjacking', category: 'Felony', fine: 10000, jail: '9 years' },
  { code: '240 PC', title: 'Assault', category: 'Misdemeanor', fine: 2000, jail: '6 months' },
  { code: '242 PC', title: 'Battery', category: 'Misdemeanor', fine: 2000, jail: '6 months' },
  { code: '243 PC', title: 'Battery on an Officer', category: 'Felony', fine: 10000, jail: '3 years' },
  { code: '245 PC', title: 'Assault with Deadly Weapon', category: 'Felony', fine: 10000, jail: '12 years' },
  { code: '261 PC', title: 'Sexual Assault', category: 'Felony', fine: 0, jail: '8 years' },
  { code: '288 PC', title: 'Lewd Acts with Minor', category: 'Felony', fine: 0, jail: '16 years' },
  { code: '314 PC', title: 'Indecent Exposure', category: 'Misdemeanor', fine: 1000, jail: '6 months' },
  { code: '368 PC', title: 'Elder/Child Abuse', category: 'Felony', fine: 5000, jail: '4 years' },
  { code: '390 PC', title: 'Loitering', category: 'Infraction', fine: 250, jail: 'None' },
  { code: '417 PC', title: 'Brandishing a Weapon', category: 'Misdemeanor', fine: 3000, jail: '1 year' },
  { code: '422 PC', title: 'Criminal Threats', category: 'Felony', fine: 5000, jail: '3 years' },
  { code: '451 PC', title: 'Arson', category: 'Felony', fine: 15000, jail: '9 years' },
  { code: '459 PC', title: 'Burglary', category: 'Felony', fine: 10000, jail: '6 years' },
  { code: '470 PC', title: 'Forgery', category: 'Felony', fine: 10000, jail: '3 years' },
  { code: '487 PC', title: 'Grand Theft', category: 'Felony', fine: 5000, jail: '3 years' },
  { code: '488 PC', title: 'Petty Theft', category: 'Misdemeanor', fine: 1000, jail: '6 months' },
  { code: '496 PC', title: 'Receiving Stolen Property', category: 'Felony', fine: 5000, jail: '3 years' },
  { code: '503 PC', title: 'Embezzlement', category: 'Felony', fine: 50000, jail: '3 years' },
  { code: '518 PC', title: 'Extortion', category: 'Felony', fine: 10000, jail: '4 years' },
  { code: '537 PC', title: 'Defrauding an Innkeeper', category: 'Misdemeanor', fine: 2000, jail: '6 months' },
  { code: '594 PC', title: 'Vandalism', category: 'Misdemeanor', fine: 2500, jail: '1 year' },
  { code: '646 PC', title: 'Stalking', category: 'Felony', fine: 5000, jail: '5 years' },
  { code: '647 PC', title: 'Disorderly Conduct', category: 'Misdemeanor', fine: 1000, jail: '6 months' },
  { code: '653 PC', title: 'Wiretapping', category: 'Felony', fine: 5000, jail: '3 years' },
  { code: '664 PC', title: 'Attempted Crime', category: 'Felony', fine: 5000, jail: 'Varies' },
  { code: '182 PC', title: 'Conspiracy', category: 'Felony', fine: 10000, jail: '9 years' },
  { code: 'HS 11350', title: 'Possession of Controlled Substance', category: 'Misdemeanor', fine: 2000, jail: '1 year' },
  { code: 'HS 11351', title: 'Possession w/ Intent to Sell', category: 'Felony', fine: 20000, jail: '4 years' },
  { code: 'HS 11352', title: 'Trafficking Narcotics', category: 'Felony', fine: 50000, jail: '9 years' },
  { code: 'HS 11550', title: 'Under Influence of Controlled Substance', category: 'Misdemeanor', fine: 500, jail: '90 days' },
  { code: 'VC 2800', title: 'Evading Police', category: 'Felony', fine: 10000, jail: '3 years' },
  { code: 'VC 20001', title: 'Hit and Run (Injury)', category: 'Felony', fine: 10000, jail: '4 years' },
  { code: 'VC 20002', title: 'Hit and Run (Property)', category: 'Misdemeanor', fine: 2000, jail: '6 months' },
  { code: 'VC 23103', title: 'Reckless Driving', category: 'Misdemeanor', fine: 1500, jail: '90 days' },
  { code: 'VC 23152', title: 'DUI', category: 'Misdemeanor', fine: 5000, jail: '6 months' },
  { code: 'VC 31', title: 'False Identification to Officer', category: 'Misdemeanor', fine: 1000, jail: '6 months' },
  { code: 'WI 5150', title: 'Psychiatric Hold', category: 'Detention', fine: 0, jail: '72 hours' },
  { code: '12021 PC', title: 'Felon in Possession of Firearm', category: 'Felony', fine: 10000, jail: '3 years' },
  { code: '25850 PC', title: 'Carrying Loaded Firearm in Public', category: 'Misdemeanor', fine: 2500, jail: '1 year' },

  // === TRAFFIC / VEHICLE CODE ===
  { code: 'VC 21453', title: 'Failure to Stop at Red Light', category: 'Infraction', fine: 490, jail: 'None' },
  { code: 'VC 22450', title: 'Failure to Stop at Stop Sign', category: 'Infraction', fine: 238, jail: 'None' },
  { code: 'VC 22349', title: 'Exceeding Maximum Speed (65+)', category: 'Infraction', fine: 355, jail: 'None' },
  { code: 'VC 22350', title: 'Unsafe Speed for Conditions', category: 'Infraction', fine: 355, jail: 'None' },
  { code: 'VC 22356', title: 'Speeding Over 70 MPH', category: 'Infraction', fine: 490, jail: 'None' },
  { code: 'VC 12500', title: 'Driving Without a License', category: 'Misdemeanor', fine: 1000, jail: '6 months' },
  { code: 'VC 14601', title: 'Driving on Suspended License', category: 'Misdemeanor', fine: 1000, jail: '6 months' },
  { code: 'VC 14601.5', title: 'Driving on Suspended License (DUI)', category: 'Misdemeanor', fine: 2000, jail: '1 year' },
  { code: 'VC 16028', title: 'No Proof of Insurance', category: 'Infraction', fine: 900, jail: 'None' },
  { code: 'VC 4000a', title: 'Expired Registration', category: 'Infraction', fine: 190, jail: 'None' },
  { code: 'VC 5200', title: 'Improper Display of Plates', category: 'Infraction', fine: 178, jail: 'None' },
  { code: 'VC 4463', title: 'Fraudulent Registration', category: 'Felony', fine: 5000, jail: '3 years' },
  { code: 'VC 26708b', title: 'Illegal Window Tint', category: 'Infraction', fine: 192, jail: 'None' },
  { code: 'VC 27150', title: 'Excessive Exhaust Noise', category: 'Infraction', fine: 193, jail: 'None' },
  { code: 'VC 27151', title: 'Modified Exhaust System', category: 'Infraction', fine: 193, jail: 'None' },
  { code: 'VC 24400', title: 'Inoperative Headlight', category: 'Infraction', fine: 190, jail: 'None' },
  { code: 'VC 24600', title: 'Inoperative Taillight', category: 'Infraction', fine: 190, jail: 'None' },
  { code: 'VC 23123', title: 'Cell Phone While Driving', category: 'Infraction', fine: 162, jail: 'None' },
  { code: 'VC 23123.5', title: 'Texting While Driving', category: 'Infraction', fine: 162, jail: 'None' },
  { code: 'VC 23221', title: 'Open Container in Vehicle', category: 'Infraction', fine: 250, jail: 'None' },
  { code: 'VC 23222', title: 'Possession of Marijuana in Vehicle', category: 'Infraction', fine: 100, jail: 'None' },
  { code: 'VC 23109', title: 'Speed Contest / Street Racing', category: 'Misdemeanor', fine: 2000, jail: '90 days' },
  { code: 'VC 2800.1', title: 'Reckless Evading Police', category: 'Felony', fine: 10000, jail: '3 years' },
  { code: 'VC 10851', title: 'Unauthorized Use of Vehicle (Joyriding)', category: 'Felony', fine: 5000, jail: '3 years' },
  { code: 'VC 22107', title: 'Unsafe Turn or Lane Change', category: 'Infraction', fine: 238, jail: 'None' },
  { code: 'VC 21801', title: 'Unsafe Lane Change', category: 'Infraction', fine: 238, jail: 'None' },
  { code: 'VC 21802', title: 'Failure to Yield at Stop Sign', category: 'Infraction', fine: 238, jail: 'None' },
  { code: 'VC 21950', title: 'Failure to Yield to Pedestrian', category: 'Infraction', fine: 238, jail: 'None' },
  { code: 'VC 27007', title: 'Loud Stereo / Vehicle Noise', category: 'Infraction', fine: 192, jail: 'None' },
  { code: 'VC 21200', title: 'Bicycle Traffic Violation', category: 'Infraction', fine: 197, jail: 'None' },
  { code: 'VC 21202', title: 'Slow Moving Vehicle Violation', category: 'Infraction', fine: 238, jail: 'None' },
  { code: 'VC 22101', title: 'Failure to Follow Turn Sign', category: 'Infraction', fine: 238, jail: 'None' },
  { code: 'VC 21453a', title: 'Red Light Violation', category: 'Infraction', fine: 490, jail: 'None' },

  // === PETTY CRIMES / QUALITY OF LIFE ===
  { code: 'PC 602', title: 'Trespassing', category: 'Misdemeanor', fine: 750, jail: '6 months' },
  { code: 'PC 490.2', title: 'Petty Theft (Under $950)', category: 'Misdemeanor', fine: 500, jail: '6 months' },
  { code: 'PC 594.3', title: 'Vandalism (Under $400)', category: 'Misdemeanor', fine: 400, jail: '1 year' },
  { code: 'PC 647b', title: 'Solicitation', category: 'Misdemeanor', fine: 1000, jail: '6 months' },
  { code: 'PC 647f', title: 'Public Intoxication', category: 'Misdemeanor', fine: 500, jail: '6 months' },
  { code: 'PC 653m', title: 'Harassing Communications', category: 'Misdemeanor', fine: 750, jail: '6 months' },
  { code: 'PC 640', title: 'Fare Evasion', category: 'Infraction', fine: 250, jail: 'None' },
  { code: 'PC 308b', title: 'Minor in Possession of Tobacco', category: 'Infraction', fine: 250, jail: 'None' },
  { code: 'PC 484g', title: 'Credit Card Fraud', category: 'Felony', fine: 5000, jail: '3 years' },
  { code: 'PC 502.5', title: 'Computer Fraud', category: 'Felony', fine: 5000, jail: '3 years' },
  { code: 'PC 415', title: 'Disturbing the Peace', category: 'Misdemeanor', fine: 400, jail: '90 days' },
  { code: 'PC 372', title: 'Public Nuisance', category: 'Misdemeanor', fine: 500, jail: '6 months' },
  { code: 'PC 370', title: 'Maintaining Public Nuisance', category: 'Misdemeanor', fine: 500, jail: '6 months' },
  { code: 'HS 11364', title: 'Possession of Drug Paraphernalia', category: 'Misdemeanor', fine: 500, jail: '6 months' },
  { code: 'B&P 25608', title: 'Open Container in Public', category: 'Infraction', fine: 250, jail: 'None' },
  { code: 'B&P 25658', title: 'Furnishing Alcohol to Minor', category: 'Misdemeanor', fine: 1000, jail: '6 months' },
  { code: 'B&P 25662', title: 'Minor in Possession of Alcohol', category: 'Misdemeanor', fine: 250, jail: 'None' },
  { code: 'PC 193.8', title: 'Littering', category: 'Infraction', fine: 250, jail: 'None' },
  { code: 'PC 314.1', title: 'Indecent Exposure', category: 'Misdemeanor', fine: 1000, jail: '6 months' },
  { code: 'PC 647c', title: 'Aggressive Panhandling', category: 'Infraction', fine: 250, jail: 'None' },
];

const CATEGORIES = ['Infraction', 'Misdemeanor', 'Felony', 'Detention', 'Other'];

export default function PenalCodeManager({ server: serverProp, serverId, readOnly = false }) {
  const queryClient = useQueryClient();
  const [charges, setCharges] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCharge, setNewCharge] = useState({ code: '', title: '', category: 'Misdemeanor', fine: 0, jail: '' });
  const [search, setSearch] = useState('');

  // If readOnly (used in police/dispatch panels), fetch server ourselves
  const { data: fetchedServer } = useQuery({
    queryKey: ['server', serverId],
    queryFn: async () => { const s = await base44.entities.Server.filter({ id: serverId }); return s[0]; },
    enabled: !!serverId && !serverProp,
  });

  const server = serverProp || fetchedServer;

  useEffect(() => {
    if (server) {
      setCharges(server.penal_code?.length ? server.penal_code : DEFAULT_PENAL_CODE);
    }
  }, [server]);

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.Server.update(serverId, { penal_code: charges }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['server'] }),
  });

  const addCharge = () => {
    if (!newCharge.code || !newCharge.title) return;
    setCharges(prev => [...prev, newCharge]);
    setNewCharge({ code: '', title: '', category: 'Misdemeanor', fine: 0, jail: '' });
    setShowAdd(false);
  };

  const removeCharge = (idx) => setCharges(prev => prev.filter((_, i) => i !== idx));

  const resetToDefault = () => setCharges(DEFAULT_PENAL_CODE);

  const filtered = charges.filter(c =>
    !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase())
  );

  const catColor = { Infraction: '#F59E0B', Misdemeanor: '#3B82F6', Felony: '#CE0000', Detention: '#8B5CF6', Other: '#6B7280' };

  return (
    <div className="font-inter">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Scale size={14} className="text-crimson" /> Penal Code
          </h3>
          <p className="text-white/30 text-[11px] mt-0.5 font-mono-cad">{charges.length} charges defined</p>
        </div>
        {!readOnly && (
          <div className="flex gap-2">
            <button
              onClick={resetToDefault}
              className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/20 transition-all font-inter"
            >
              Reset Default
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="text-[11px] px-3 py-1.5 rounded-lg border border-crimson/30 bg-crimson/10 text-crimson hover:bg-crimson/20 flex items-center gap-1 transition-all font-inter font-medium"
            >
              <Plus size={11} /> Add Charge
            </button>
            <CrimsonButton onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="h-8 text-[11px] px-3">
              <Save size={11} className="mr-1" /> {saveMutation.isPending ? 'Saving...' : 'Save'}
            </CrimsonButton>
          </div>
        )}
      </div>

      <Input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search charges..."
        className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/25 mb-3 rounded-xl text-[11px] h-8 font-inter"
      />

      {showAdd && !readOnly && (
        <div className="mb-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] grid grid-cols-2 gap-3">
          <div>
            <Label className="text-white/40 text-[10px] uppercase tracking-wider font-inter">Penal Code</Label>
            <Input value={newCharge.code} onChange={e => setNewCharge({ ...newCharge, code: e.target.value })} className="bg-white/[0.05] border-white/[0.08] text-white mt-1 rounded-xl text-[11px] h-8 font-mono-cad" placeholder="e.g. 187 PC" />
          </div>
          <div>
            <Label className="text-white/40 text-[10px] uppercase tracking-wider font-inter">Title</Label>
            <Input value={newCharge.title} onChange={e => setNewCharge({ ...newCharge, title: e.target.value })} className="bg-white/[0.05] border-white/[0.08] text-white mt-1 rounded-xl text-[11px] h-8 font-inter" placeholder="e.g. Murder" />
          </div>
          <div>
            <Label className="text-white/40 text-[10px] uppercase tracking-wider font-inter">Category</Label>
            <Select value={newCharge.category} onValueChange={v => setNewCharge({ ...newCharge, category: v })}>
              <SelectTrigger className="bg-white/[0.05] border-white/[0.08] text-white mt-1 rounded-xl text-[11px] h-8"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white text-xs">
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white/40 text-[10px] uppercase tracking-wider font-inter">Fine ($)</Label>
            <Input type="number" value={newCharge.fine} onChange={e => setNewCharge({ ...newCharge, fine: Number(e.target.value) })} className="bg-white/[0.05] border-white/[0.08] text-white mt-1 rounded-xl text-[11px] h-8 font-inter" />
          </div>
          <div>
            <Label className="text-white/40 text-[10px] uppercase tracking-wider font-inter">Jail Time</Label>
            <Input value={newCharge.jail} onChange={e => setNewCharge({ ...newCharge, jail: e.target.value })} className="bg-white/[0.05] border-white/[0.08] text-white mt-1 rounded-xl text-[11px] h-8 font-inter" placeholder="e.g. 5 years" />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={() => setShowAdd(false)} className="text-[11px] px-3 py-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 font-inter transition-all">Cancel</button>
            <CrimsonButton onClick={addCharge} disabled={!newCharge.code || !newCharge.title} className="h-8 text-[11px] px-4">Add</CrimsonButton>
          </div>
        </div>
      )}

      {/* Charges table */}
      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[80px_1fr_100px_80px_70px_30px] gap-0 px-3 py-2 bg-white/[0.04] border-b border-white/[0.06]">
          <span className="text-white/30 text-[9px] uppercase tracking-widest font-semibold font-inter">Code</span>
          <span className="text-white/30 text-[9px] uppercase tracking-widest font-semibold font-inter">Charge</span>
          <span className="text-white/30 text-[9px] uppercase tracking-widest font-semibold font-inter">Category</span>
          <span className="text-white/30 text-[9px] uppercase tracking-widest font-semibold font-inter">Fine</span>
          <span className="text-white/30 text-[9px] uppercase tracking-widest font-semibold font-inter">Jail</span>
          <span />
        </div>
        <div className="max-h-[50vh] overflow-y-auto divide-y divide-white/[0.04]">
          {filtered.map((charge, idx) => (
            <div key={idx} className="grid grid-cols-[80px_1fr_100px_80px_70px_30px] gap-0 items-center px-3 py-2.5 hover:bg-white/[0.03] transition-all group">
              <span className="font-mono-cad text-[10px] text-white/50">{charge.code}</span>
              <span className="font-inter text-[11px] text-white/85 truncate pr-2">{charge.title}</span>
              <span>
                <span
                  className="font-inter text-[9px] px-1.5 py-0.5 rounded-md font-semibold uppercase tracking-wide"
                  style={{ color: catColor[charge.category] || '#6B7280', background: (catColor[charge.category] || '#6B7280') + '18', border: `1px solid ${(catColor[charge.category] || '#6B7280')}25` }}
                >
                  {charge.category}
                </span>
              </span>
              <span className="font-mono-cad text-[10px] text-white/40">{charge.fine > 0 ? `$${charge.fine.toLocaleString()}` : '—'}</span>
              <span className="font-inter text-[10px] text-white/30">{charge.jail && charge.jail !== 'None' ? charge.jail : '—'}</span>
              {!readOnly && (
                <button onClick={() => removeCharge(idx)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-crimson text-white/20 transition-all justify-self-end">
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-white/20 text-xs font-inter">No charges found</div>
          )}
        </div>
      </div>
    </div>
  );
}