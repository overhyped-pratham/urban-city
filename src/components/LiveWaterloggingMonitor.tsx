import React, { useState } from 'react';
import { 
  Radio, 
  Satellite, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Maximize2, 
  Sliders, 
  Download, 
  Truck, 
  MapPin, 
  Activity,
  Droplets,
  Eye,
  RefreshCw,
  Info,
  Clock,
  Gauge,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { SegFormerSARWaterlogging } from '../types';

interface LiveWaterloggingMonitorProps {
  sarData: SegFormerSARWaterlogging;
  onViewOnMap?: () => void;
  onDispatchCrew?: (ward: string) => void;
}

export const LiveWaterloggingMonitor: React.FC<LiveWaterloggingMonitorProps> = ({
  sarData,
  onViewOnMap,
  onDispatchCrew
}) => {
  const [viewMode, setViewMode] = useState<'SPLIT' | 'SLIDER' | 'INSPECTOR'>('SPLIT');
  const [sliderPosition, setSliderPosition] = useState<number>(65); // percentage for wipe
  const [probThreshold, setProbThreshold] = useState<number>(0.68);
  const [selectedPol, setSelectedPol] = useState<'DUAL' | 'VV' | 'VH'>('DUAL');
  const [isReprocessing, setIsReprocessing] = useState<boolean>(false);
  const [pipelineExpanded, setPipelineExpanded] = useState<boolean>(false);
  const [hoverPixel, setHoverPixel] = useState<{ x: number; y: number; prob: number; depth: number; db: number } | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(sarData.highRiskZones[0]?.id || '');
  const [dispatchedZones, setDispatchedZones] = useState<Record<string, boolean>>({});

  // Dynamic calculated area based on threshold slider
  const calculatedArea = (sarData.totalWaterloggedAreaKm2 * (1.2 - (probThreshold - 0.5) * 0.6)).toFixed(2);
  const calculatedConfidence = Math.min(99, Math.round(sarData.confidencePercentage + (probThreshold - 0.68) * 15));

  const handleSimulateReprocess = () => {
    setIsReprocessing(true);
    setTimeout(() => {
      setIsReprocessing(false);
    }, 1400);
  };

  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      metadata: {
        satellite: sarData.satellite,
        passId: sarData.passId,
        sensor: sarData.pipelineDetails.sensor,
        timestamp: sarData.overpassTimestamp,
        model: 'SegFormer-B2-SAR-Waterlogging',
        areaKm2: parseFloat(calculatedArea),
        confidence: calculatedConfidence
      },
      features: sarData.highRiskZones.map((zone) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [zone.lng, zone.lat]
        },
        properties: {
          zoneId: zone.id,
          ward: zone.ward,
          locationName: zone.locationName,
          areaSqMeters: zone.areaSqMeters,
          depthCm: zone.depthCm,
          priority: zone.priority,
          threat: zone.criticalAssetThreat
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel1_segformer_waterlogging_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDispatchForZone = (zoneId: string, ward: string) => {
    setDispatchedZones(prev => ({ ...prev, [zoneId]: true }));
    if (onDispatchCrew) onDispatchCrew(ward);
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden text-slate-100 transition-all">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900 animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Near-Real-Time Satellite Waterlogging Monitor
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-cyan-950/90 border border-cyan-700/60 text-cyan-300 font-mono text-[11px] font-semibold">
                SegFormer-B2 + Sentinel-1 SAR
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-800/60 text-rose-300 text-[11px] font-bold">
                🔴 HIGH RISK
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
              <span>🛰️ <strong className="text-slate-300">Overpass:</strong> {sarData.updatedTimeAgo} ({sarData.passId.slice(0, 24)}...)</span>
              <span>📡 <strong className="text-slate-300">Orbit:</strong> {sarData.orbitMode}</span>
              <span>⚡ <strong className="text-slate-300">Ground Res:</strong> 10m C-Band Microwave</span>
            </p>
          </div>
        </div>

        {/* Top Control Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('SPLIT')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'SPLIT' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Show Before -> Current SAR -> AI Detection side by side"
            >
              Split 3-Way
            </button>
            <button
              onClick={() => setViewMode('SLIDER')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'SLIDER' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Interactive Wipe Slider comparison"
            >
              Interactive Wiper
            </button>
            <button
              onClick={() => setViewMode('INSPECTOR')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'INSPECTOR' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
              title="Pixel-Level Probability HUD Inspector"
            >
              Pixel HUD
            </button>
          </div>

          {/* Quick Action: Re-run inference */}
          <button
            onClick={handleSimulateReprocess}
            disabled={isReprocessing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all disabled:opacity-50"
            title="Re-run SegFormer-B2 inference on latest calibrated SAR pass"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReprocessing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            {isReprocessing ? 'Inferencing...' : 'Re-run Pass'}
          </button>
        </div>
      </div>

      {/* Main Visual Comparison Window */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* MODE 1: SPLIT 3-WAY (BEFORE -> SATELLITE SAR -> AI SEGFORMER MASK) */}
        {viewMode === 'SPLIT' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1. BEFORE: Optical Normal Baseline */}
            <div className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col">
              <div className="p-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">1. Baseline (Normal)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Optical Dry Baseline</span>
              </div>
              <div className="relative h-56 sm:h-64 bg-slate-900 overflow-hidden">
                <img 
                  src={sarData.images.beforeNormalUrl} 
                  alt="Normal Baseline Satellite Optical" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <span className="inline-block px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 text-[10px] font-medium border border-slate-700">
                    Dry conditions: Standard urban drainage &amp; transport corridors
                  </span>
                </div>
              </div>
            </div>

            {/* 2. SATELLITE: Current Sentinel-1 SAR Radar Pass */}
            <div className="group relative rounded-xl overflow-hidden border border-cyan-900/50 bg-slate-950 flex flex-col">
              <div className="p-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">2. Sentinel-1 SAR Pass</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">VV + VH Backscatter</span>
              </div>
              <div className="relative h-56 sm:h-64 bg-slate-900 overflow-hidden">
                <img 
                  src={sarData.images.currentSarUrl} 
                  alt="Raw Sentinel-1 SAR Backscatter Pass" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter contrast-125 hue-rotate-15"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                {/* Radar Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d415_1px,transparent_1px),linear-gradient(to_bottom,#06b6d415_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                
                <div className="absolute top-2.5 right-2.5 bg-slate-950/80 border border-cyan-500/40 rounded px-2 py-1 text-[10px] font-mono text-cyan-300">
                  σ0_VV: -21.4 dB
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <span className="inline-block px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-200 text-[10px] font-medium border border-cyan-700/60">
                    Microwave penetration: Pierces clouds &amp; nocturnal rain fronts
                  </span>
                </div>
              </div>
            </div>

            {/* 3. AI MASK: SegFormer-B2 Semantic Segmentation */}
            <div className="group relative rounded-xl overflow-hidden border border-indigo-500/50 bg-slate-950 flex flex-col shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/30">
              <div className="p-2.5 bg-indigo-950/60 border-b border-indigo-800/60 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" style={{ animationDuration: '4s' }} />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">3. SegFormer-B2 Mask</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-700/60">
                  {calculatedConfidence}% Conf
                </span>
              </div>
              <div className="relative h-56 sm:h-64 bg-slate-900 overflow-hidden">
                <img 
                  src={sarData.images.segFormerMaskUrl} 
                  alt="SegFormer-B2 Waterlogged AI Mask" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-110 saturate-150"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual Water Mask Layer */}
                <div className="absolute inset-0 bg-cyan-500/30 mix-blend-screen pointer-events-none" />
                
                {/* Simulated Inundation Hotspot Callouts */}
                <div className="absolute top-1/4 left-1/3 p-1.5 rounded-lg bg-rose-950/90 border border-rose-500/80 text-[10px] text-white shadow-lg animate-bounce">
                  <div className="flex items-center gap-1 font-bold text-rose-300">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Ward 12 Underpass
                  </div>
                  <div className="text-[9px] text-slate-300 font-mono">Depth: 55cm | 420k m²</div>
                </div>

                <div className="absolute bottom-1/3 right-1/4 p-1.5 rounded-lg bg-rose-950/90 border border-rose-500/80 text-[10px] text-white shadow-lg">
                  <div className="flex items-center gap-1 font-bold text-rose-300">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Ward 4 Sluice Basin
                  </div>
                  <div className="text-[9px] text-slate-300 font-mono">Depth: 42cm | 890k m²</div>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-900/90 text-cyan-300 text-[10px] font-bold border border-cyan-500/50">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      🟦 Waterlogged: {calculatedArea} km²
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/90 text-rose-300 text-[10px] font-bold border border-rose-500/50">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      🟥 High Risk
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: INTERACTIVE WIPER / SLIDER */}
        {viewMode === 'SLIDER' && (
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-80 sm:h-96">
            {/* Background: Baseline Normal */}
            <img 
              src={sarData.images.beforeNormalUrl} 
              alt="Baseline Normal" 
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* Foreground: SegFormer-B2 Mask clipped by slider position */}
            <div 
              className="absolute inset-0 overflow-hidden" 
              style={{ width: `${sliderPosition}%` }}
            >
              <img 
                src={sarData.images.segFormerMaskUrl} 
                alt="AI SegFormer-B2 Inundation Mask" 
                className="absolute inset-0 w-full h-full object-cover max-w-none filter brightness-110 saturate-150"
                style={{ width: '100vw', maxWidth: 'none' }}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-cyan-500/25 mix-blend-screen pointer-events-none" />
              <div className="absolute top-4 left-4 bg-indigo-950/90 border border-indigo-500/80 rounded-lg px-2.5 py-1 text-xs font-bold text-cyan-300 shadow-xl">
                AI SegFormer-B2 SAR Water Mask
              </div>
            </div>

            <div className="absolute top-4 right-4 bg-slate-950/90 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-300 shadow-xl">
              Baseline Optical (Dry)
            </div>

            {/* Slider Divider Line */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center font-black text-xs">
                ↔
              </div>
            </div>

            {/* Range input controller */}
            <input 
              type="range" 
              min="5" 
              max="95" 
              value={sliderPosition} 
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
            />

            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 flex items-center justify-between">
              <span>Drag slider horizontally to contrast dry baseline against AI-segmented Sentinel-1 inundation pixels</span>
              <span className="font-mono font-bold text-cyan-400">Coverage: {sliderPosition}%</span>
            </div>
          </div>
        )}

        {/* MODE 3: PIXEL HUD INSPECTOR */}
        {viewMode === 'INSPECTOR' && (
          <div 
            className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-80 sm:h-96 cursor-crosshair group"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
              const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
              const prob = Math.min(99, Math.max(12, Math.round(92 - (Math.abs(x - 45) + Math.abs(y - 50)) * 0.8)));
              const depth = Math.max(5, Math.round((prob / 100) * 60));
              const db = parseFloat((-24 + (100 - prob) * 0.15).toFixed(1));
              setHoverPixel({ x, y, prob, depth, db });
            }}
            onMouseLeave={() => setHoverPixel(null)}
          >
            <img 
              src={sarData.images.segFormerMaskUrl} 
              alt="Pixel Level SegFormer-B2 Map" 
              className="w-full h-full object-cover filter brightness-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-cyan-500/20 mix-blend-screen pointer-events-none" />
            
            {/* Grid crosshair overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#38bdf812_1px,transparent_1px),linear-gradient(to_bottom,#38bdf812_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            {/* Hover HUD Card */}
            {hoverPixel && (
              <div 
                className="absolute z-30 pointer-events-none bg-slate-950/95 border border-cyan-500/60 rounded-xl p-3 shadow-2xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full mb-3 min-w-[200px]"
                style={{ left: `${hoverPixel.x}%`, top: `${hoverPixel.y}%` }}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="font-bold text-cyan-300">Pixel Vector Inspect</span>
                  <span className="font-mono text-[10px] text-slate-400">10m × 10m Pixel</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Waterlogging Probability:</span>
                  <strong className={`font-mono ${hoverPixel.prob > 65 ? 'text-rose-400 font-black' : 'text-slate-400'}`}>
                    {hoverPixel.prob}%
                  </strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>SAR Backscatter (dB):</span>
                  <strong className="font-mono text-cyan-300">{hoverPixel.db} dB</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Est. Submersion Depth:</span>
                  <strong className="font-mono text-amber-300">{hoverPixel.depth} cm</strong>
                </div>
                <div className="text-[10px] text-slate-400 italic pt-1">
                  {hoverPixel.prob > 68 ? '🔴 Confirmed Waterlogged Surface' : '⚪ Permeable / Dry Pavement'}
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-700 rounded-lg p-2 text-xs text-slate-300">
              Hover over any sector of the satellite image to inspect raw microwave backscatter &amp; SegFormer-B2 softmax probabilities.
            </div>
          </div>
        )}

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Metric 1: Confidence */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Detection Confidence</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="my-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{calculatedConfidence}%</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-300">
                High Precision
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">SegFormer-B2 Transformer</p>
          </div>

          {/* Metric 2: Area */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Total Waterlogged Area</span>
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="my-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-cyan-300">{calculatedArea}</span>
              <span className="text-xs font-semibold text-slate-400">km²</span>
              <span className="text-[10px] text-rose-400 font-bold">+{sarData.deltaLast3HoursKm2} km²/3h</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">234 Hectares Submerged</p>
          </div>

          {/* Metric 3: Status */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Threat Level</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="my-1.5 flex items-baseline gap-2">
              <span className="text-lg font-black text-rose-400">🔴 HIGH RISK</span>
            </div>
            <p className="text-[10px] text-slate-400">Max Depth: {sarData.maxEstimatedDepthCm} cm</p>
          </div>

          {/* Metric 4: Satellite Pass */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Copernicus Overpass</span>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="my-1.5">
              <span className="text-sm font-bold text-slate-200">{sarData.updatedTimeAgo}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono truncate" title={sarData.satellite}>
              {sarData.satellite}
            </p>
          </div>
        </div>

        {/* High Risk Inundation Zones List + Dispatch Controls */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Segmented High-Risk Inundation Clusters
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              ~{sarData.vulnerableHouseholdsInMask.toLocaleString()} households within segmented polygons
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sarData.highRiskZones.map((zone) => {
              const isDispatched = dispatchedZones[zone.id];
              return (
                <div 
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`cursor-pointer rounded-xl p-3 border transition-all flex flex-col justify-between gap-2.5 ${
                    selectedZoneId === zone.id 
                      ? 'bg-slate-900 border-cyan-500/80 ring-1 ring-cyan-500/40' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          zone.priority === 'P1' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {zone.priority}
                        </span>
                        <h4 className="text-xs font-bold text-white">{zone.locationName}</h4>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400 font-semibold">{zone.confidence}%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" /> {zone.ward}
                    </p>
                    <p className="text-[11px] text-rose-300/90 mt-1">
                      ⚠️ <strong>Threat:</strong> {zone.criticalAssetThreat}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="font-mono text-slate-300">
                      Area: {(zone.areaSqMeters / 10000).toFixed(1)} ha | Depth: {zone.depthCm} cm
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDispatchForZone(zone.id, zone.ward);
                      }}
                      disabled={isDispatched}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        isDispatched 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' 
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow shadow-cyan-600/30'
                      }`}
                    >
                      {isDispatched ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Crew Dispatched
                        </>
                      ) : (
                        <>
                          <Truck className="w-3 h-3" />
                          Deploy Sump Crew
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Interactive Toolbar: Threshold Slider, GeoJSON Export & GIS Linking */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
          {/* Threshold Tuning Slider */}
          <div className="flex-1 space-y-1 max-w-md">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                SegFormer Softmax Threshold:
              </span>
              <span className="font-mono font-bold text-cyan-400">{probThreshold.toFixed(2)}</span>
            </div>
            <input 
              type="range"
              min="0.50"
              max="0.95"
              step="0.02"
              value={probThreshold}
              onChange={(e) => setProbThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.50 (High Recall / Broad Floods)</span>
              <span>0.95 (High Precision / Deep Water)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 justify-end">
            <button
              onClick={() => setPipelineExpanded(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-all"
            >
              <Info className="w-3.5 h-3.5 text-slate-400" />
              {pipelineExpanded ? 'Hide Architecture' : 'Model Architecture'}
            </button>

            <button
              onClick={handleExportGeoJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all shadow-sm"
              title="Download vectorized GeoJSON polygons of detected waterlogged areas"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Export GeoJSON Mask
            </button>

            {onViewOnMap && (
              <button
                onClick={onViewOnMap}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30"
              >
                <Layers className="w-3.5 h-3.5" />
                Highlight on GIS Map
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Architecture Pipeline Breakdown */}
        {pipelineExpanded && (
          <div className="rounded-xl bg-slate-950 border border-indigo-900/50 p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Sentinel-1 SAR + SegFormer-B2 Semantic Segmentation Pipeline
              </h4>
              <span className="text-[10px] font-mono text-slate-400">Inference Latency: 340ms</span>
            </div>

            {/* Pipeline Step-by-Step Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-slate-200">1. Sentinel-1 SAR</div>
                <div className="text-[10px] text-slate-400">C-Band Microwave Radar (VV + VH Channels)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-cyan-300">2. Preprocessing</div>
                <div className="text-[10px] text-slate-400">Radiometric Calibration + 7x7 Lee Speckle Filter</div>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-950/80 border border-indigo-700/60 space-y-1">
                <div className="font-bold text-indigo-200">3. SegFormer-B2</div>
                <div className="text-[10px] text-indigo-300">Hierarchical Transformer Encoder + MLP Decoder</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-amber-300">4. Threshold &amp; Post</div>
                <div className="text-[10px] text-slate-400">Probability Map &gt; {probThreshold.toFixed(2)} + Hydro-connectivity</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="font-bold text-emerald-300">5. GIS Output</div>
                <div className="text-[10px] text-slate-400">GeoJSON Polygon Vectorization &amp; Municipal Work Orders</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              <strong>Technical Note:</strong> Unlike optical sensors (e.g. Sentinel-2 / Landsat) which are blocked by heavy monsoon cloud cover, Sentinel-1 Synthetic Aperture Radar (SAR) emits 5.4 GHz microwave pulses that penetrate clouds, heavy torrential downpours, and operate in darkness. Smooth water bodies reflect radar pulses away from the antenna (specular reflection), creating sharp low-backscatter decibel signatures (&sigma;0 &lt; -18 dB) segmented by the SegFormer-B2 model into exact street-level inundation boundaries.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
