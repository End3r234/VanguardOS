import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Car, MousePointer2, Spline, Zap, Trash2, Type, MapPin, Flag,
  Save, Download, FileText, RotateCw, ChevronLeft, Sun, CloudRain, CloudSnow, CloudFog, CloudLightning
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CrimsonButton from '@/components/CrimsonButton';
import jsPDF from 'jspdf';

const ROAD_TEMPLATES = {
  straight: { label: 'Straight Road', desc: 'Single straight road' },
  intersection: { label: 'Intersection', desc: 'Four-way intersection' },
  curve: { label: 'Curve', desc: 'Curved road' },
  highway: { label: 'Highway', desc: 'Multi-lane highway' },
};

const WEATHER_ICONS = { clear: Sun, rain: CloudRain, snow: CloudSnow, fog: CloudFog, storm: CloudLightning };
const VEHICLE_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#f97316', '#ffffff', '#1e293b'];

const CANVAS_W = 860;
const CANVAS_H = 560;

export default function CrashReconstruction({ serverId, user, myUnit, onClose }) {
  const canvasRef = useRef(null);
  const queryClient = useQueryClient();
  const [tool, setTool] = useState('select');
  const [roadTemplate, setRoadTemplate] = useState('intersection');
  const [weather, setWeather] = useState('clear');
  const [roadCondition, setRoadCondition] = useState('dry');
  const [objects, setObjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [drawingSkid, setDrawingSkid] = useState(false);
  const [skidStart, setSkidStart] = useState(null);
  const [textDialog, setTextDialog] = useState(null);
  const [evidenceNum, setEvidenceNum] = useState(1);
  const [vehicleColor, setVehicleColor] = useState(VEHICLE_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', serverId],
    queryFn: () => base44.entities.IncidentReport.filter({ server_id: serverId }),
    enabled: !!serverId,
  });
  const myReports = reports.filter(r => r.author_email === user?.email);
  const [selectedReportId, setSelectedReportId] = useState('');

  // Draw canvas
  useEffect(() => {
    drawCanvas();
  }, [objects, roadTemplate, weather, roadCondition, selectedId]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background based on weather
    const bgColors = {
      clear: '#1a1f14', rain: '#141a1f', snow: '#1f2024', fog: '#1c1c1e', storm: '#12141a'
    };
    ctx.fillStyle = bgColors[weather] || '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    drawRoad(ctx);
    drawWeatherOverlay(ctx);

    objects.forEach(obj => drawObject(ctx, obj, obj.id === selectedId));
  };

  const drawRoad = (ctx) => {
    ctx.save();
    ctx.fillStyle = '#2a2a2a';
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;

    if (roadTemplate === 'straight') {
      ctx.fillRect(0, CANVAS_H / 2 - 80, CANVAS_W, 160);
      // Lane markings
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H / 2);
      ctx.lineTo(CANVAS_W, CANVAS_H / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (roadTemplate === 'intersection') {
      ctx.fillRect(0, CANVAS_H / 2 - 80, CANVAS_W, 160);
      ctx.fillRect(CANVAS_W / 2 - 80, 0, 160, CANVAS_H);
      // Crosswalks
      ctx.fillStyle = '#666';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(CANVAS_W / 2 - 80 + i * 20, CANVAS_H / 2 - 90, 10, 8);
        ctx.fillRect(CANVAS_W / 2 - 80 + i * 20, CANVAS_H / 2 + 82, 10, 8);
      }
    } else if (roadTemplate === 'curve') {
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H - 60);
      ctx.bezierCurveTo(CANVAS_W * 0.3, CANVAS_H - 60, CANVAS_W * 0.4, 60, CANVAS_W, 60);
      ctx.lineWidth = 160;
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#facc15';
      ctx.setLineDash([20, 15]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (roadTemplate === 'highway') {
      ctx.fillRect(0, CANVAS_H / 2 - 120, CANVAS_W, 240);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 15]);
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H / 2 - 40); ctx.lineTo(CANVAS_W, CANVAS_H / 2 - 40); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H / 2 + 40); ctx.lineTo(CANVAS_W, CANVAS_H / 2 + 40); ctx.stroke();
      ctx.setLineDash([]);
      // Solid center line
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H / 2); ctx.lineTo(CANVAS_W, CANVAS_H / 2); ctx.stroke();
    }
    ctx.restore();
  };

  const drawWeatherOverlay = (ctx) => {
    ctx.save();
    if (weather === 'rain') {
      ctx.strokeStyle = 'rgba(100,150,200,0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 30; i++) {
        const x = (i * 37 + (Date.now() / 20) % CANVAS_W) % CANVAS_W;
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x - 5, 15); ctx.stroke();
      }
    } else if (weather === 'snow') {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    } else if (weather === 'fog') {
      ctx.fillStyle = 'rgba(180,180,190,0.08)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    ctx.restore();
  };

  const drawObject = (ctx, obj, selected) => {
    ctx.save();
    if (obj.type === 'vehicle') {
      ctx.translate(obj.x, obj.y);
      ctx.rotate((obj.rotation || 0) * Math.PI / 180);
      ctx.fillStyle = obj.color || '#3b82f6';
      ctx.fillRect(-32, -16, 64, 32);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(-16, -13, 22, 26);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(20, -13, 8, 26);
      ctx.strokeStyle = selected ? '#CE0000' : 'rgba(255,255,255,0.4)';
      ctx.lineWidth = selected ? 2.5 : 1;
      ctx.strokeRect(-32, -16, 64, 32);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(obj.label || 'V', 0, 4);
      if (obj.direction) {
        ctx.fillStyle = '#CE0000';
        ctx.beginPath();
        ctx.moveTo(36, 0); ctx.lineTo(44, -6); ctx.lineTo(44, 6); ctx.fill();
      }
    } else if (obj.type === 'skid') {
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(obj.x1, obj.y1);
      ctx.lineTo(obj.x2, obj.y2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(60,60,60,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (selected) {
        ctx.strokeStyle = '#CE0000';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else if (obj.type === 'impact') {
      ctx.translate(obj.x, obj.y);
      ctx.fillStyle = '#CE0000';
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const r = i % 2 === 0 ? 14 : 7;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = selected ? '#fff' : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = selected ? 2 : 1;
      ctx.stroke();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('POI', 0, 3);
    } else if (obj.type === 'debris') {
      ctx.translate(obj.x, obj.y);
      ctx.fillStyle = '#8B4513';
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + obj.seed;
        ctx.fillRect(Math.cos(a) * 8, Math.sin(a) * 8, 4, 4);
      }
      if (selected) {
        ctx.strokeStyle = '#CE0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (obj.type === 'evidence') {
      ctx.translate(obj.x, obj.y);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = selected ? '#CE0000' : '#1a1a1a';
      ctx.lineWidth = selected ? 2.5 : 2;
      ctx.stroke();
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(obj.num || '1', 0, 4);
    } else if (obj.type === 'text') {
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      const metrics = ctx.measureText(obj.text);
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(obj.x - metrics.width / 2 - 6, obj.y - 10, metrics.width + 12, 20);
      ctx.fillStyle = selected ? '#CE0000' : 'white';
      ctx.fillText(obj.text, obj.x, obj.y + 4);
    } else if (obj.type === 'sign') {
      ctx.translate(obj.x, obj.y);
      const colors = { stop: '#dc2626', yield: '#eab308', light: '#1e293b', speed: '#3b82f6' };
      if (obj.signType === 'stop') {
        ctx.fillStyle = colors.stop;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          const px = Math.cos(a) * 14, py = Math.sin(a) * 14;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'white'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('STOP', 0, 3);
      } else if (obj.signType === 'light') {
        ctx.fillStyle = colors.light;
        ctx.fillRect(-8, -16, 16, 32);
        ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(0, -9, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#eab308'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(0, 9, 4, 0, Math.PI * 2); ctx.fill();
      }
      if (selected) {
        ctx.strokeStyle = '#CE0000'; ctx.lineWidth = 2;
        ctx.strokeRect(-16, -18, 32, 36);
      }
    }
    ctx.restore();
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const hitTest = (x, y) => {
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (obj.type === 'skid') {
        const dx = obj.x2 - obj.x1, dy = obj.y2 - obj.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) continue;
        const t = Math.max(0, Math.min(1, ((x - obj.x1) * dx + (y - obj.y1) * dy) / (len * len)));
        const px = obj.x1 + t * dx, py = obj.y1 + t * dy;
        if (Math.hypot(x - px, y - py) < 8) return obj;
      } else {
        if (Math.hypot(x - obj.x, y - obj.y) < 20) return obj;
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);

    if (tool === 'select') {
      const hit = hitTest(pos.x, pos.y);
      if (hit) {
        setSelectedId(hit.id);
        setDragging(true);
        setDragStart({ x: pos.x - (hit.x || hit.x1), y: pos.y - (hit.y || hit.y1) });
      } else {
        setSelectedId(null);
      }
    } else if (tool === 'vehicle') {
      const id = Date.now();
      setObjects([...objects, { id, type: 'vehicle', x: pos.x, y: pos.y, rotation: 0, color: vehicleColor, label: `V${objects.filter(o => o.type === 'vehicle').length + 1}` }]);
      setSelectedId(id);
      setTool('select');
    } else if (tool === 'skid') {
      setDrawingSkid(true);
      setSkidStart(pos);
    } else if (tool === 'impact') {
      setObjects([...objects, { id: Date.now(), type: 'impact', x: pos.x, y: pos.y }]);
      setTool('select');
    } else if (tool === 'debris') {
      setObjects([...objects, { id: Date.now(), type: 'debris', x: pos.x, y: pos.y, seed: Math.random() * 6 }]);
      setTool('select');
    } else if (tool === 'evidence') {
      setObjects([...objects, { id: Date.now(), type: 'evidence', x: pos.x, y: pos.y, num: evidenceNum }]);
      setEvidenceNum(evidenceNum + 1);
      setTool('select');
    } else if (tool === 'text') {
      setTextDialog({ x: pos.x, y: pos.y });
    } else if (tool === 'sign') {
      setObjects([...objects, { id: Date.now(), type: 'sign', x: pos.x, y: pos.y, signType: 'stop' }]);
      setSelectedId(Date.now());
      setTool('select');
    } else if (tool === 'delete') {
      const hit = hitTest(pos.x, pos.y);
      if (hit) {
        setObjects(objects.filter(o => o.id !== hit.id));
        setSelectedId(null);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (dragging && selectedId) {
      const pos = getMousePos(e);
      setObjects(objects.map(o => {
        if (o.id !== selectedId) return o;
        if (o.type === 'skid') {
          const dx = pos.x - dragStart.x - o.x1, dy = pos.y - dragStart.y - o.y1;
          return { ...o, x1: o.x1 + dx, y1: o.y1 + dy, x2: o.x2 + dx, y2: o.y2 + dy };
        }
        return { ...o, x: pos.x - dragStart.x, y: pos.y - dragStart.y };
      }));
    } else if (drawingSkid && skidStart) {
      const pos = getMousePos(e);
      setObjects(objects.map(o => o)); // trigger redraw
      // Draw preview
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      drawCanvas();
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(skidStart.x, skidStart.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const handleMouseUp = (e) => {
    if (drawingSkid && skidStart) {
      const pos = getMousePos(e);
      if (Math.hypot(pos.x - skidStart.x, pos.y - skidStart.y) > 10) {
        setObjects([...objects, { id: Date.now(), type: 'skid', x1: skidStart.x, y1: skidStart.y, x2: pos.x, y2: pos.y }]);
      }
      setDrawingSkid(false);
      setSkidStart(null);
      setTool('select');
    }
    setDragging(false);
  };

  const rotateSelected = () => {
    if (!selectedId) return;
    setObjects(objects.map(o => o.id === selectedId ? { ...o, rotation: ((o.rotation || 0) + 15) % 360 } : o));
  };

  const toggleDirection = () => {
    if (!selectedId) return;
    setObjects(objects.map(o => o.id === selectedId && o.type === 'vehicle' ? { ...o, direction: !o.direction } : o));
  };

  const cycleSignType = () => {
    if (!selectedId) return;
    const types = ['stop', 'yield', 'light', 'speed'];
    setObjects(objects.map(o => {
      if (o.id !== selectedId || o.type !== 'sign') return o;
      const idx = types.indexOf(o.signType);
      return { ...o, signType: types[(idx + 1) % types.length] };
    }));
  };

  const exportPNG = () => {
    const canvas = canvasRef.current;
    setSelectedId(null);
    setTimeout(() => {
      drawCanvas();
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `crash-reconstruction-${Date.now()}.png`;
      a.click();
    }, 50);
  };

  const exportPDF = () => {
    const canvas = canvasRef.current;
    setSelectedId(null);
    setTimeout(() => {
      drawCanvas();
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [CANVAS_W + 80, CANVAS_H + 100] });
      pdf.setFillColor(10, 10, 10);
      pdf.rect(0, 0, CANVAS_W + 80, CANVAS_H + 100, 'F');
      pdf.addImage(imgData, 'PNG', 40, 60, CANVAS_W, CANVAS_H);
      pdf.setFontSize(16);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Crash Reconstruction', 40, 40);
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Weather: ${weather} | Road: ${roadCondition} | Template: ${ROAD_TEMPLATES[roadTemplate].label}`, 40, CANVAS_H + 80);
      pdf.save(`crash-reconstruction-${Date.now()}.pdf`);
    }, 50);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const canvas = canvasRef.current;
      const pngUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(pngUrl)).blob();
      const file = new File([blob], `crash-${Date.now()}.png`, { type: 'image/png' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const report = reports.find(r => r.id === selectedReportId);
      return base44.entities.CrashReconstruction.create({
        server_id: serverId,
        report_id: selectedReportId || '',
        incident_id: report?.incident_id || '',
        title: saveTitle || 'Crash Reconstruction',
        canvas_data: { objects, roadTemplate, weather, roadCondition },
        weather,
        road_condition: roadCondition,
        export_png_url: file_url,
        created_by_email: user?.email,
        created_by_callsign: myUnit?.callsign || '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crash-reconstructions', serverId] });
      setSaving(false);
      setShowSaveDialog(false);
      setSaveTitle('');
      setSelectedReportId('');
    },
    onError: () => setSaving(false),
  });

  const handleSave = () => {
    setSaving(true);
    saveMutation.mutate();
  };

  const TOOLS = [
    { id: 'select', icon: MousePointer2, label: 'Select/Move' },
    { id: 'vehicle', icon: Car, label: 'Vehicle' },
    { id: 'skid', icon: Spline, label: 'Skid Mark' },
    { id: 'impact', icon: Zap, label: 'Impact Point' },
    { id: 'debris', icon: Trash2, label: 'Debris' },
    { id: 'evidence', icon: Flag, label: 'Evidence #' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'sign', icon: MapPin, label: 'Traffic Sign' },
    { id: 'delete', icon: Trash2, label: 'Delete' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-[#0C0C0C] flex-shrink-0">
        <div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all">
              <ChevronLeft size={16} />
            </button>
          )}
          <Car size={16} className="text-crimson" />
          <h2 className="text-white font-bold text-sm uppercase tracking-wider">Crash Reconstruction</h2>
          {selectedId && (
            <div className="flex items-center gap-1.5 ml-2">
              <button onClick={rotateSelected} className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.06] text-white/60 hover:text-white border border-white/10 flex items-center gap-1">
                <RotateCw size={10} /> Rotate
              </button>
              <button onClick={toggleDirection} className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.06] text-white/60 hover:text-white border border-white/10">
                Direction
              </button>
              <button onClick={cycleSignType} className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.06] text-white/60 hover:text-white border border-white/10">
                Sign Type
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportPNG} className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-all">
            <Download size={12} /> PNG
          </button>
          <button onClick={exportPDF} className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-white/60 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-all">
            <FileText size={12} /> PDF
          </button>
          <CrimsonButton onClick={() => setShowSaveDialog(true)} className="h-8 text-xs px-3">
            <Save size={12} className="mr-1" /> Save to Report
          </CrimsonButton>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar */}
        <div className="w-16 border-r border-white/[0.06] bg-[#0C0C0C] flex flex-col items-center py-3 gap-1 flex-shrink-0">
          {TOOLS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                title={t.label}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  tool === t.id ? 'bg-crimson/20 text-crimson border border-crimson/30' : 'text-white/40 hover:text-white hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                <Icon size={16} />
              </button>
            );
          })}
          {tool === 'vehicle' && (
            <div className="mt-2 flex flex-col gap-1.5 items-center">
              {VEHICLE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setVehicleColor(c)}
                  className={`w-6 h-6 rounded-full border-2 ${vehicleColor === c ? 'border-white' : 'border-white/20'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-[#080808] overflow-hidden p-4">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="rounded-xl border border-white/[0.08] shadow-2xl cursor-crosshair max-w-full max-h-full"
            style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
          />
        </div>

        {/* Sidebar */}
        <div className="w-64 border-l border-white/[0.06] bg-[#0C0C0C] p-4 overflow-y-auto flex-shrink-0">
          <div className="space-y-4">
            <div>
              <Label className="text-white/50 text-[10px] uppercase tracking-wider">Road Template</Label>
              <Select value={roadTemplate} onValueChange={setRoadTemplate}>
                <SelectTrigger className="bg-white/[0.04] border-white/10 text-white mt-1.5 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {Object.entries(ROAD_TEMPLATES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white/50 text-[10px] uppercase tracking-wider">Weather</Label>
              <div className="grid grid-cols-5 gap-1.5 mt-1.5">
                {Object.entries(WEATHER_ICONS).map(([key, Icon]) => (
                  <button
                    key={key}
                    onClick={() => setWeather(key)}
                    title={key}
                    className={`h-9 rounded-lg flex items-center justify-center transition-all ${
                      weather === key ? 'bg-crimson/20 text-crimson border border-crimson/30' : 'bg-white/[0.04] text-white/40 hover:text-white/70 border border-transparent'
                    }`}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white/50 text-[10px] uppercase tracking-wider">Road Condition</Label>
              <Select value={roadCondition} onValueChange={setRoadCondition}>
                <SelectTrigger className="bg-white/[0.04] border-white/10 text-white mt-1.5 rounded-lg text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {['dry', 'wet', 'icy', 'snowy', 'gravel'].map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <div className="text-white/40 text-[10px] uppercase tracking-wider mb-2">Scene Objects ({objects.length})</div>
              <button
                onClick={() => { setObjects([]); setSelectedId(null); setEvidenceNum(1); }}
                className="text-[10px] text-white/40 hover:text-red-400 transition-all"
              >
                Clear all objects
              </button>
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <div className="text-white/30 text-[10px] leading-relaxed">
                <p className="mb-1"><span className="text-white/50">Select</span> tool: click & drag to move objects</p>
                <p className="mb-1"><span className="text-white/50">Skid</span> tool: click & drag to draw</p>
                <p className="mb-1"><span className="text-white/50">Evidence</span> tool: auto-numbers each marker</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Text input dialog */}
      <Dialog open={!!textDialog} onOpenChange={() => setTextDialog(null)}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white max-w-sm">
          <DialogHeader><DialogTitle className="text-white text-sm">Add Text Annotation</DialogTitle></DialogHeader>
          <Input
            autoFocus
            placeholder="Enter annotation text..."
            onKeyDown={e => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                setObjects([...objects, { id: Date.now(), type: 'text', x: textDialog.x, y: textDialog.y, text: e.target.value.trim() }]);
                setTextDialog(null);
                setTool('select');
              }
            }}
            className="bg-white/[0.05] border-white/10 text-white mt-2 rounded-xl"
          />
          <div className="flex justify-end gap-2 mt-2">
            <CrimsonButton variant="ghost" onClick={() => setTextDialog(null)}>Cancel</CrimsonButton>
            <CrimsonButton onClick={() => {
              const input = document.querySelector('[placeholder="Enter annotation text..."]');
              if (input?.value?.trim()) {
                setObjects([...objects, { id: Date.now(), type: 'text', x: textDialog.x, y: textDialog.y, text: input.value.trim() }]);
                setTextDialog(null);
                setTool('select');
              }
            }}>Add</CrimsonButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save to report dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-[#111] border-white/10 rounded-2xl text-white max-w-md">
          <DialogHeader><DialogTitle className="text-white text-sm flex items-center gap-2"><Save size={14} className="text-crimson" /> Save Reconstruction to Report</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-white/60 text-xs">Title</Label>
              <Input value={saveTitle} onChange={e => setSaveTitle(e.target.value)} placeholder="Crash reconstruction title..." className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm" />
            </div>
            <div>
              <Label className="text-white/60 text-xs">Link to Report</Label>
              <Select value={selectedReportId} onValueChange={setSelectedReportId}>
                <SelectTrigger className="bg-white/[0.05] border-white/10 text-white mt-1 rounded-xl text-sm"><SelectValue placeholder="Select a report (optional)..." /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {myReports.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.incident_id ? `${r.incident_id} — ` : ''}{r.title || r.report_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {myReports.length === 0 && <p className="text-white/30 text-[10px] mt-1">No reports available. Save without linking or create a report first.</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <CrimsonButton variant="ghost" onClick={() => setShowSaveDialog(false)}>Cancel</CrimsonButton>
              <CrimsonButton onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Reconstruction'}
              </CrimsonButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}