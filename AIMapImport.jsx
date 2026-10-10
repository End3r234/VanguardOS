import React, { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Zap, Loader2, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight, MapPin, Sparkles, Wand2 } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import CrimsonButton from '@/components/CrimsonButton';
import MapReviewer from './MapReviewer';

const CONFIDENCE_HIGH = 0.85;
const CONFIDENCE_LOW = 0.5;

const SCAN_STAGES = [
  { progress: 12, label: 'Enhancing image resolution & contrast...' },
  { progress: 30, label: 'Uploading enhanced image for analysis...' },
  { progress: 45, label: 'Detecting roads and highways...' },
  { progress: 62, label: 'Extracting street names in dense areas...' },
  { progress: 78, label: 'Reading postal codes...' },
  { progress: 92, label: 'Calculating confidence scores...' },
];

function getCorrectionsKey(mapUrl) {
  let hash = 0;
  for (let i = 0; i < mapUrl.length; i++) {
    hash = ((hash << 5) - hash + mapUrl.charCodeAt(i)) | 0;
  }
  return `vanguard_map_corr_${Math.abs(hash)}`;
}

function loadCorrections(mapUrl) {
  try {
    return JSON.parse(localStorage.getItem(getCorrectionsKey(mapUrl)) || '[]');
  } catch { return []; }
}

function saveCorrection(mapUrl, correction) {
  try {
    const existing = loadCorrections(mapUrl);
    const filtered = existing.filter(c => Math.hypot(c.x_pct - correction.x_pct, c.y_pct - correction.y_pct) > 3);
    filtered.push(correction);
    localStorage.setItem(getCorrectionsKey(mapUrl), JSON.stringify(filtered));
  } catch { /* localStorage may be full */ }
}

function preprocessImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 3000;
      const baseScale = img.width < 1600 ? 2 : (img.width < 2400 ? 1.5 : 1);
      const scale = Math.min(baseScale, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      // Enhance contrast, brightness, saturation for text legibility
      ctx.filter = 'contrast(1.45) brightness(1.05) saturate(1.2)';
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob((blob) => {
        if (!blob) { resolve(file); return; }
        resolve(new File([blob], 'map_enhanced.png', { type: 'image/png' }));
      }, 'image/png', 0.95);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

export default function AIMapImport({ mapUrl, onMapUrlChange, onResult }) {
  const [stage, setStage] = useState('idle'); // idle | uploading | scanning | review
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [detections, setDetections] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviewExpanded, setReviewExpanded] = useState(true);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [verifiedIds, setVerifiedIds] = useState(new Set());
  const [error, setError] = useState(null);
  const progressTimer = useRef(null);

  // Notify parent whenever cleaned data changes
  useEffect(() => {
    if (detections.length > 0) {
      onResult(detections.map(d => ({
        name: d.name, postal: d.postal, x_pct: d.x_pct, y_pct: d.y_pct,
      })));
    }
  }, [detections, onResult]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setStage('uploading');
    setProgressLabel('Enhancing image resolution & contrast...');
    setProgress(8);
    try {
      const enhanced = await preprocessImage(file);
      setProgress(20);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: enhanced });
      onMapUrlChange(file_url);
      setStage('idle');
      setProgress(0);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      setStage('idle');
      setProgress(0);
    }
  };

  const runScan = async () => {
    if (!mapUrl) return;
    setError(null);
    setStage('scanning');
    setProgress(0);
    setDetections([]);
    setStats(null);
    setVerifiedIds(new Set());
    setSelectedReviewId(null);

    // Staged progress animation
    let stageIdx = 0;
    progressTimer.current = setInterval(() => {
      if (stageIdx < SCAN_STAGES.length) {
        setProgressLabel(SCAN_STAGES[stageIdx].label);
        setProgress(SCAN_STAGES[stageIdx].progress);
        stageIdx++;
      }
    }, 2200);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        model: 'gemini_3_1_pro',
        prompt: `You are a cartographic analyst examining an enhanced roleplay city map. The image has been preprocessed with increased resolution, sharpened text, and improved contrast.

COORDINATES (the image is a 2D map grid):
- x_pct: 0 = far LEFT edge, 50 = horizontal center, 100 = far RIGHT edge
- y_pct: 0 = TOP edge, 50 = vertical center, 100 = BOTTOM edge
- Estimate each label position relative to the four edges. Be precise.

EXTRACT (one entry per label):
1. Street / road / avenue / boulevard / highway names → type: "street" or "highway"
2. Postal codes / zone numbers → type: "postal"
3. Neighborhood / district / area names → type: "area"
4. Landmarks / buildings / POI → type: "landmark"

PER ENTRY:
- "name": the label text. For postal-only entries, use the number. For areas, use the area name.
- "postal": nearest numeric postal/zone as STRING, or "" if none nearby.
- "x_pct", "y_pct": position 0-100
- "type": "street" | "highway" | "postal" | "area" | "landmark"
- "confidence": 0.0 to 1.0 — how certain you are the label is correctly read AND positioned.
  • 0.90-1.0: text is crisp, clearly readable, position exact
  • 0.70-0.89: text readable but slightly blurry or in a somewhat congested area
  • 0.50-0.69: text partially legible, position approximate
  • 0.30-0.49: text mostly unreadable — best guess, needs manual review
  • 0.0-0.29: suspected label but cannot read — include with a descriptive name like "Unreadable - [area direction]" so a human can fill it in

DENSE / CONGESTED AREAS — CRITICAL:
Pay special attention to areas with overlapping streets and postal numbers. Do NOT skip congested areas. For each overlapping or hard-to-read label, create a separate entry with an appropriately low confidence score. It is better to include a low-confidence detection than to miss a label entirely.

CONFIDENCE GUIDANCE:
Be conservative. If you are not certain a label is correctly read, assign a lower confidence. Low-confidence detections will be manually reviewed — do not guess confidently.

Also compute "stats":
- roads_detected: total road segments (streets + highways) visible on the map
- streets_detected: named streets extracted
- postals_detected: postal codes extracted
- overall_confidence: average confidence across all detections (0-1)

Scan systematically from top-left to bottom-right. Cover the ENTIRE image. Every numbered postal zone and every named street is a separate entry.`,
        file_urls: [mapUrl],
        response_json_schema: {
          type: 'object',
          properties: {
            locations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  postal: { type: 'string' },
                  x_pct: { type: 'number' },
                  y_pct: { type: 'number' },
                  type: { type: 'string' },
                  confidence: { type: 'number' },
                },
              },
            },
            stats: {
              type: 'object',
              properties: {
                roads_detected: { type: 'number' },
                streets_detected: { type: 'number' },
                postals_detected: { type: 'number' },
                overall_confidence: { type: 'number' },
              },
            },
          },
        },
      });

      clearInterval(progressTimer.current);
      setProgress(100);
      setProgressLabel('Complete');

      // Process detections with IDs and defaults
      const processed = (result.locations || []).map((loc, i) => ({
        id: `det_${i}`,
        name: loc.name || '',
        postal: loc.postal || '',
        x_pct: typeof loc.x_pct === 'number' ? loc.x_pct : 50,
        y_pct: typeof loc.y_pct === 'number' ? loc.y_pct : 50,
        confidence: typeof loc.confidence === 'number' ? loc.confidence : 0.5,
        type: loc.type || 'street',
        original_name: loc.name || '',
        original_postal: loc.postal || '',
      }));

      // Apply learned corrections from prior imports
      const corrections = loadCorrections(mapUrl);
      const withCorrections = processed.map(d => {
        const match = corrections.find(c => Math.hypot(c.x_pct - d.x_pct, c.y_pct - d.y_pct) < 3);
        if (match) {
          return {
            ...d,
            name: match.correctedName,
            postal: match.correctedPostal,
            x_pct: match.x_pct,
            y_pct: match.y_pct,
            learned: true,
          };
        }
        return d;
      });

      const autoVerified = new Set(
        withCorrections.filter(d => d.learned).map(d => d.id)
      );

      setDetections(withCorrections);
      setStats(result.stats || null);
      setVerifiedIds(autoVerified);
      setReviewExpanded(true);
      setStage('review');
    } catch (err) {
      clearInterval(progressTimer.current);
      setError(
        err?.message?.includes('credit') || err?.message?.includes('quota')
          ? 'AI scan failed — integration credits may be exhausted. Upgrade your plan or wait for credits to reset.'
          : 'AI scan failed. Please try again.'
      );
      setStage('idle');
      setProgress(0);
    }
  };

  // Clean up timer on unmount
  useEffect(() => () => clearInterval(progressTimer.current), []);

  const reviewItems = detections.filter(d => d.confidence < CONFIDENCE_HIGH && !verifiedIds.has(d.id));
  const reviewCount = reviewItems.length;
  const verifiedCount = verifiedIds.size;
  const statsData = stats || {
    roads_detected: detections.filter(d => d.type === 'street' || d.type === 'highway').length,
    streets_detected: detections.filter(d => d.type === 'street').length,
    postals_detected: detections.filter(d => d.type === 'postal' || d.postal).length,
    overall_confidence: detections.length > 0 ? detections.reduce((a, d) => a + d.confidence, 0) / detections.length : 0,
  };

  const handlePositionChange = useCallback((id, x, y) => {
    setDetections(prev => prev.map(d => d.id === id ? { ...d, x_pct: x, y_pct: y } : d));
  }, []);

  const handleVerify = (item, corrections) => {
    saveCorrection(mapUrl, {
      x_pct: item.x_pct,
      y_pct: item.y_pct,
      correctedName: corrections.name,
      correctedPostal: corrections.postal,
    });
    setDetections(prev => prev.map(d =>
      d.id === item.id
        ? { ...d, name: corrections.name, postal: corrections.postal }
        : d
    ));
    setVerifiedIds(prev => new Set([...prev, item.id]));
    // Auto-advance to next review item
    const remaining = reviewItems.filter(r => r.id !== item.id && !verifiedIds.has(r.id));
    if (remaining.length > 0) {
      setSelectedReviewId(remaining[0].id);
    } else {
      setSelectedReviewId(null);
    }
  };

  const selectedItem = detections.find(d => d.id === selectedReviewId);

  return (
    <div className="mt-3 space-y-3">
      {/* Upload + enhanced image */}
      <div>
        <label className="flex flex-col items-center justify-center w-full h-36 rounded-xl border border-dashed border-white/20 cursor-pointer hover:border-crimson/40 transition-colors overflow-hidden bg-white/[0.02]">
          {mapUrl ? (
            <img src={mapUrl} alt="Custom map" className="w-full h-full object-contain" />
          ) : stage === 'uploading' ? (
            <div className="flex items-center gap-2 text-white/40">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs">{progressLabel || 'Uploading...'}</span>
            </div>
          ) : (
            <div className="text-center">
              <Upload size={20} className="mx-auto text-white/30 mb-2" />
              <span className="text-white/30 text-sm">Upload map image</span>
              <p className="text-white/15 text-xs mt-1">PNG, JPG — auto-enhanced for AI</p>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
        {mapUrl && (
          <p className="text-white/20 text-[10px] mt-1 flex items-center gap-1">
            <Wand2 size={9} className="text-emerald-400/50" />
            Image automatically enhanced (upscaled, contrast-boosted, sharpened) before AI analysis
          </p>
        )}
      </div>

      {/* Scan button */}
      {mapUrl && stage !== 'review' && (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-white/60 text-xs mb-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-400" />
            AI Street & Postal Extraction
          </p>
          <p className="text-white/30 text-[10px] mb-3">
            Enhanced AI detects roads, streets, postals, and landmarks — then assigns a confidence score to each.
            Low-confidence detections are flagged for quick manual review.
          </p>
          <CrimsonButton onClick={runScan} disabled={stage === 'scanning' || stage === 'uploading'} className="h-8 text-xs w-full">
            {stage === 'scanning' ? (
              <><Loader2 size={12} className="mr-1 animate-spin" /> Analyzing map...</>
            ) : stage === 'uploading' ? (
              <><Loader2 size={12} className="mr-1 animate-spin" /> Preparing image...</>
            ) : (
              <><Zap size={12} className="mr-1" /> Scan Map with AI</>
            )}
          </CrimsonButton>
          {error && (
            <p className="text-red-400 text-[10px] mt-2 flex items-center gap-1">
              <AlertTriangle size={10} /> {error}
            </p>
          )}
        </div>
      )}

      {/* Progress bar during scanning */}
      {stage === 'scanning' && (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-crimson to-crimson-light rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/40 text-[10px] text-center">{progressLabel}</p>
        </div>
      )}

      {/* Summary + Review after scan */}
      {stage === 'review' && (
        <>
          {/* Import summary */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <p className="text-white font-semibold text-sm">Import Complete</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                <p className="text-emerald-400 text-lg font-bold">{statsData.roads_detected}</p>
                <p className="text-white/30 text-[9px] uppercase tracking-wide">Roads</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                <p className="text-emerald-400 text-lg font-bold">{statsData.streets_detected}</p>
                <p className="text-white/30 text-[9px] uppercase tracking-wide">Streets</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                <p className="text-emerald-400 text-lg font-bold">{statsData.postals_detected}</p>
                <p className="text-white/30 text-[9px] uppercase tracking-wide">Postals</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">AI Confidence</span>
              <span className="text-emerald-400 font-semibold">{(statsData.overall_confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-white/40">Verified / Total</span>
              <span className="text-white/60">{verifiedCount} / {detections.length}</span>
            </div>
          </div>

          {/* Collapsible Review Required panel */}
          {reviewCount > 0 && (
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
              <button
                onClick={() => setReviewExpanded(e => !e)}
                className="w-full flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-white/70 text-xs font-medium flex items-center gap-2">
                  {reviewExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-amber-400" />
                    Manual Review Required
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">{reviewCount}</span>
                  </span>
                </span>
              </button>
              {reviewExpanded && (
                <div className="px-3 pb-3 space-y-1">
                  {reviewItems.map(item => {
                    const isSelected = item.id === selectedReviewId;
                    const isLow = item.confidence >= CONFIDENCE_LOW;
                    const dotColor = isLow ? 'bg-amber-400' : 'bg-red-500';
                    const label = isLow ? 'Low Confidence' : 'Manual Review Required';
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedReviewId(isSelected ? null : item.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-all text-left ${
                          isSelected ? 'bg-crimson/10 border border-crimson/30' : 'hover:bg-white/[0.03] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                          <div className="min-w-0">
                            <p className="text-white/70 text-xs truncate">
                              {item.type === 'postal' ? `Postal ${item.name}` : (item.name || 'Unknown Location')}
                            </p>
                            <p className={`text-[9px] ${isLow ? 'text-amber-400/60' : 'text-red-400/60'}`}>{label}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.learned && (
                            <span className="text-emerald-400/60 text-[9px] flex items-center gap-0.5">
                              <CheckCircle2 size={8} /> learned
                            </span>
                          )}
                          <span className="text-white/30 text-[10px]">{(item.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Interactive map reviewer for selected item */}
          {selectedItem && (
            <MapReviewer
              mapUrl={mapUrl}
              detections={detections}
              selectedItem={selectedItem}
              onPositionChange={handlePositionChange}
              onVerify={handleVerify}
              verifiedIds={verifiedIds}
            />
          )}

          {/* All clear message */}
          {reviewCount === 0 && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <p className="text-emerald-400 text-xs">All detections verified — ready to save.</p>
            </div>
          )}

          {/* Rescan button */}
          <button
            onClick={runScan}
            disabled={stage === 'scanning'}
            className="text-white/30 text-[10px] hover:text-white/50 transition-colors flex items-center gap-1"
          >
            <Zap size={9} /> Re-scan map
          </button>
        </>
      )}
    </div>
  );
}