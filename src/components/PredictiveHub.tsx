import React, { useState, useMemo } from 'react';
import { 
  Waves, 
  Construction, 
  Trash2, 
  Flame, 
  Droplets, 
  Sparkles, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Camera, 
  Upload, 
  Scan, 
  ShieldCheck, 
  Truck, 
  Activity, 
  FileText,
  ThermometerSun,
  Maximize2,
  TrendingUp,
  History,
  Eye,
  Info,
  ChevronRight
} from 'lucide-react';
import { 
  PredictiveFloodForecast, 
  YoloRoadDamageDetection, 
  WasteHotspotItem, 
  HeatwaveForecastItem, 
  WaterSecurityForecastItem,
  SegFormerSARWaterlogging,
  HistoricalRiskHotspot
} from '../types';
import { INITIAL_SAR_WATERLOGGING, HISTORICAL_RISK_HOTSPOTS, INITIAL_INCIDENTS } from '../data/mockData';
import { LiveWaterloggingMonitor } from './LiveWaterloggingMonitor';
import { MaintenanceTrendAnalysis } from './MaintenanceTrendAnalysis';

interface PredictiveHubProps {
  floodForecast: PredictiveFloodForecast;
  roadDamages: YoloRoadDamageDetection[];
  wasteHotspots: WasteHotspotItem[];
  heatwave: HeatwaveForecastItem;
  waterSecurity: WaterSecurityForecastItem;
  sarData?: SegFormerSARWaterlogging;
  showHistoricalHeatmap?: boolean;
  onToggleHistoricalHeatmap?: (active: boolean) => void;
  historicalHeatmapCategory?: string;
  onSelectHistoricalHeatmapCategory?: (cat: string) => void;
  onDispatchCrew?: (crewType: string, ward: string) => void;
  onViewOnMap?: () => void;
}

export const PredictiveHub: React.FC<PredictiveHubProps> = ({
  floodForecast,
  roadDamages,
  wasteHotspots,
  heatwave,
  waterSecurity,
  sarData = INITIAL_SAR_WATERLOGGING,
  showHistoricalHeatmap = false,
  onToggleHistoricalHeatmap,
  historicalHeatmapCategory = 'ALL',
  onSelectHistoricalHeatmapCategory,
  onDispatchCrew,
  onViewOnMap
}) => {
  const [activeEngine, setActiveEngine] = useState<'FLOOD' | 'ROAD' | 'WASTE' | 'HEAT' | 'WATER' | 'MAINTENANCE'>('FLOOD');
  
  // Local fallback if not controlled from parent
  const [localHeatmapActive, setLocalHeatmapActive] = useState(false);
  const isHeatmapActive = onToggleHistoricalHeatmap ? showHistoricalHeatmap : localHeatmapActive;
  
  const handleToggleHeatmap = (active: boolean) => {
    setLocalHeatmapActive(active);
    onToggleHistoricalHeatmap?.(active);
  };

  const [localCategory, setLocalCategory] = useState<string>('ALL');
  const activeCategory = onSelectHistoricalHeatmapCategory ? historicalHeatmapCategory : localCategory;
  const handleCategorySelect = (cat: string) => {
    setLocalCategory(cat);
    onSelectHistoricalHeatmapCategory?.(cat);
  };

  const [timeHorizon, setTimeHorizon] = useState<'5YR_BASELINE' | '3YR_EXTREMES' | '10YR_CLIMATE'>('5YR_BASELINE');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>(HISTORICAL_RISK_HOTSPOTS[0].id);

  // Filter historical hotspots by active category
  const filteredHotspots = useMemo(() => {
    if (activeCategory === 'ALL') return HISTORICAL_RISK_HOTSPOTS;
    return HISTORICAL_RISK_HOTSPOTS.filter(h => h.category === activeCategory);
  }, [activeCategory]);

  const selectedHotspot = useMemo(() => {
    return HISTORICAL_RISK_HOTSPOTS.find(h => h.id === selectedHotspotId) || HISTORICAL_RISK_HOTSPOTS[0];
  }, [selectedHotspotId]);

  // Road Vision tester state
  const [selectedRoadItem, setSelectedRoadItem] = useState<YoloRoadDamageDetection>(roadDamages[0]);
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);
  const [activeTabMode, setActiveTabMode] = useState<'MODEL' | 'CCTV' | 'SIMULATION'>('MODEL');

  // Waste truck dispatch state
  const [dispatchedTrucks, setDispatchedTrucks] = useState<Record<string, boolean>>({});

  const handleDispatchWasteTruck = (hotspotId: string) => {
    setDispatchedTrucks(prev => ({ ...prev, [hotspotId]: true }));
  };

  const handleOpenMapWithHeatmap = () => {
    handleToggleHeatmap(true);
    onViewOnMap?.();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI &amp; ML Modeling Engines
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Predictive Urban Intelligence Hub</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate and inspect domain-specific models: TimesFM, YOLOv11, LightGBM, SegFormer, and PostGIS Hydrology.
          </p>
        </div>

        {/* Engine Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveEngine('FLOOD')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeEngine === 'FLOOD'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Flood (TimesFM)</span>
          </button>

          <button
            onClick={() => setActiveEngine('ROAD')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeEngine === 'ROAD'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Construction className="w-3.5 h-3.5" />
            <span>Roads (YOLOv11)</span>
          </button>

          <button
            onClick={() => setActiveEngine('WASTE')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeEngine === 'WASTE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Waste Hotspots</span>
          </button>

          <button
            onClick={() => setActiveEngine('HEAT')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeEngine === 'HEAT'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatwaves</span>
          </button>

          <button
            onClick={() => setActiveEngine('WATER')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeEngine === 'WATER'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Water Security</span>
          </button>

          <button
            onClick={() => setActiveEngine('MAINTENANCE')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeEngine === 'MAINTENANCE'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Maintenance Trends (30-Day)</span>
          </button>
        </div>
      </div>

      {/* HISTORICAL RISK HEATMAP OVERLAY & INCIDENT CORRELATION CONTROL CENTER */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white space-y-6">
        
        {/* Top Control Bar with Master Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <History className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                  Historical Risk Heatmaps &amp; Incident Correlation Engine
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    5-Yr PostGIS Archive (2021-2025)
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Overlay empirical high-recurrence hazard density zones on the GIS map to compare current live incidents against chronic infrastructure failure corridors.
                </p>
              </div>
            </div>
          </div>

          {/* Master Map Overlay Toggle Control */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 shadow-inner">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200">Overlay on Map View</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {isHeatmapActive ? '🔥 Heatmap Layer Active' : 'Layer Disabled'}
                </span>
              </div>
              
              <button
                type="button"
                role="switch"
                aria-checked={isHeatmapActive}
                onClick={() => handleToggleHeatmap(!isHeatmapActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isHeatmapActive ? 'bg-rose-500' : 'bg-slate-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isHeatmapActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenMapWithHeatmap}
              className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Inspect Overlay on GIS Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Statistical Summary Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Incident Correlation</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-400">87.5%</span>
              <span className="text-[10px] text-emerald-400 font-bold">7 / 8 Matched</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Active incidents fall inside chronic zones</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Chronic Risk Hotspots</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{HISTORICAL_RISK_HOTSPOTS.length}</span>
              <span className="text-[10px] text-rose-400 font-mono font-bold">4 P1 Chronic</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Underpasses, canals &amp; 33kV substations</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Historical 5-Yr Event Log</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-cyan-400">284</span>
              <span className="text-[10px] text-slate-400 font-mono">Events (2021-25)</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Indexed with rainfall &amp; tidal heads</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Top Failure Mode</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-base font-bold text-amber-400">Hydraulic Bowl</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Topographical depression (-1.9m MSL)</span>
          </div>
        </div>

        {/* Hazard Filters & Time Horizon */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold mr-1">Hazard Category:</span>
            {[
              { id: 'ALL', label: 'All Hazards', count: HISTORICAL_RISK_HOTSPOTS.length },
              { id: 'WATER_LOGGING', label: '🌊 Flood Basins', count: 3 },
              { id: 'DRAINAGE_BLOCKAGE', label: '🚰 Sluice Clogs', count: 1 },
              { id: 'POWER_FAILURE', label: '⚡ 33kV Substation', count: 1 },
              { id: 'ROAD_SUBSIDENCE', label: '🚧 Subsidence', count: 2 },
              { id: 'HEAT_ISLAND', label: '🔥 Heat Island', count: 1 }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Time Horizon Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-slate-700/70 text-xs">
            <button
              onClick={() => setTimeHorizon('5YR_BASELINE')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                timeHorizon === '5YR_BASELINE' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              5-Yr Baseline (2021-25)
            </button>
            <button
              onClick={() => setTimeHorizon('3YR_EXTREMES')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                timeHorizon === '3YR_EXTREMES' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Extreme Storms (&gt;50mm/h)
            </button>
            <button
              onClick={() => setTimeHorizon('10YR_CLIMATE')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                timeHorizon === '10YR_CLIMATE' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              10-Yr Climate Trend
            </button>
          </div>
        </div>

        {/* Master Comparison Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          
          {/* Left Column: Historical Hotspots List */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between pb-1">
              <span>Historical Recurrence Clusters ({filteredHotspots.length})</span>
              <span className="text-[11px] font-mono text-rose-400">Click to Compare</span>
            </div>

            {filteredHotspots.map(hotspot => {
              const isSelected = hotspot.id === selectedHotspot.id;
              const hasActiveOverlap = Boolean(hotspot.activeIncidentOverlapId || hotspot.activeIncidentOverlapTitle);

              return (
                <div
                  key={hotspot.id}
                  onClick={() => setSelectedHotspotId(hotspot.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-rose-500 shadow-md ring-1 ring-rose-500/50'
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: hotspot.colorHex }}
                        />
                        <span className="text-xs font-bold text-white line-clamp-1">
                          {hotspot.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{hotspot.ward}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        {hotspot.historicalFrequencyScore}% Recurrence
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {hotspot.incidentsCount5Years} events in 5 yrs
                      </div>
                    </div>
                  </div>

                  {/* Overlap indicator tag */}
                  {hasActiveOverlap && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="line-clamp-1">{hotspot.activeIncidentOverlapTitle || 'Active Incident Overlap'}</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">MATCHED</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: In-Depth Incident vs Historical Comparison Card */}
          <div className="lg:col-span-7 bg-slate-800/70 border border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-700">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                      {selectedHotspot.vulnerabilityGrade.replace('_', ' ')}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-300 font-medium">{selectedHotspot.ward}</span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    {selectedHotspot.name}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-rose-500 text-white shadow-sm">
                    {selectedHotspot.historicalFrequencyScore}/100 Risk Score
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    Radius: {selectedHotspot.radiusMeters}m zone
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison Matrix */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Live Telemetry vs. 5-Year Empirical Baseline
                </span>
                
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 font-mono text-xs">
                  <div className="space-y-2 border-r border-slate-800 pr-2">
                    <div className="text-[10px] text-cyan-400 font-bold uppercase">Real-Time Incident State</div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Status / ID</span>
                      <span className="font-bold text-white">{selectedHotspot.activeIncidentOverlapId || 'SAR Monitored'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Live Inundation / Depth</span>
                      <span className="font-bold text-cyan-300">
                        {selectedHotspot.category === 'WATER_LOGGING' ? '72 cm (Severe)' : 'Active telemetry verified'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pl-2">
                    <div className="text-[10px] text-rose-400 font-bold uppercase">5-Year Historical Mean</div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Historical Event Count</span>
                      <span className="font-bold text-white">{selectedHotspot.incidentsCount5Years} logged events</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Empirical Avg Impact</span>
                      <span className="font-bold text-amber-300">{selectedHotspot.averageSubmersionOrImpact}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recurrence Trigger & Root Cause */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/60 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">Empirical Recurrence Trigger:</span>
                  <p className="text-slate-200 font-medium">⚡ {selectedHotspot.recurrenceTrigger}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700/60 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">Root Infrastructure Contributing Factor:</span>
                  <p className="text-slate-200 leading-relaxed">🏗️ {selectedHotspot.primaryCause}</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 space-y-1">
                  <span className="text-emerald-400 font-semibold block text-[11px]">AI Long-Term Capital Improvement Plan (CIP):</span>
                  <p className="text-emerald-200 leading-relaxed">💡 {selectedHotspot.longTermMitigationPlan}</p>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-700 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-mono">
                PostGIS Kernel Density Estimation (KDE)
              </span>

              <button
                type="button"
                onClick={handleOpenMapWithHeatmap}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>View {selectedHotspot.name.slice(0, 20)}... On Map</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 1. FLOOD ENGINE TAB */}
      {activeEngine === 'FLOOD' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Model Overview */}
            <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Waves className="w-5 h-5 text-cyan-600" />
                    TimesFM / TFT Hydrological Flood Pipeline
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Multi-variate time-series transformer correlating rainfall rates, soil drainage capacity, and culvert head-loss.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  {floodForecast.probability}% Inundation Prob
                </span>
              </div>

              {/* Key Hydrological Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Accumulated Rain</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">{floodForecast.expectedRainfallTotalMm} mm</p>
                  <span className="text-[10px] text-cyan-600 font-semibold">Doppler Forecast</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Peak Inundation</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">{floodForecast.peakHours}</p>
                  <span className="text-[10px] text-rose-600 font-semibold">Tidal High (19:40)</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Soil Saturation</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">{floodForecast.soilSaturationPercentage}%</p>
                  <span className="text-[10px] text-amber-600 font-semibold">Zero Infiltration</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Trunk Overflow Risk</span>
                  <p className="text-xl font-bold text-rose-600 mt-1">{floodForecast.drainageOverflowRisk}</p>
                  <span className="text-[10px] text-slate-500 font-semibold">Culvert 14B Clog</span>
                </div>
              </div>

              {/* Hydrograph Chart & Time Curve */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>6-Hour Inundation &amp; Drainage Runoff Hydrograph</span>
                  <span className="text-slate-400">Peak flow: 15,200 L/sec</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {floodForecast.timeline.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{item.time}</span>
                      <div className="w-full bg-slate-200 h-24 rounded-lg relative overflow-hidden flex items-end">
                        <div 
                          className="w-full bg-gradient-to-t from-cyan-600 via-blue-500 to-indigo-600 rounded-b-lg transition-all"
                          style={{ height: `${item.inundationRisk}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-900">
                          {item.inundationRisk}%
                        </span>
                      </div>
                      <div className="text-center text-[10px] text-slate-500 font-medium">
                        <div>{item.rainfallMm} mm/h</div>
                        <div className="text-indigo-600 font-semibold">{item.runoffLitresSec} L/s</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decision Support & Pre-Positioning Directive */}
            <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 text-white p-6 shadow-sm flex flex-col justify-between border border-slate-800">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    Target Wards &amp; Actions
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    High Vulnerability
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Predicted Inundation Wards:</span>
                  <div className="space-y-1.5">
                    {floodForecast.highRiskWards.map((w, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{w}</span>
                        <span className="text-[11px] text-rose-400 font-bold">85-92% Prob</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs text-slate-400 font-medium">Automated Decision Actions:</span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Pre-position 2x 150HP Dewatering Pumps at Sector 4</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Clear trash debris at Tidal Sluice Gate 14B</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Issue SMS early alerts to 14k households</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={() => onDispatchCrew?.('DEWATERING_PUMP_UNIT', 'Ward 12')}
                  className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  Pre-Position Dewatering Fleet
                </button>
              </div>
            </div>
          </div>

          {/* Near-Real-Time SegFormer-B2 Sentinel-1 SAR Waterlogging Monitor Component */}
          <LiveWaterloggingMonitor
            sarData={sarData}
            onViewOnMap={onViewOnMap}
            onDispatchCrew={(ward) => onDispatchCrew?.('DEWATERING_PUMP_UNIT', ward)}
          />
        </div>
      )}

      {/* 2. ROAD & INFRASTRUCTURE TAB (YOLOv11) */}
      {activeEngine === 'ROAD' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Inspection Screen with YOLO Bounding Box */}
            <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Construction className="w-5 h-5 text-orange-600" />
                    YOLOv11 Computer Vision Pothole &amp; Pavement Inspector
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time object detection inference classifying potholes, alligator cracks, and subsidence from municipal camera feeds.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  Model: YOLOv11-UrbanRoads
                </span>
              </div>

              {/* Sample Feeds / Detected Damages Selector */}
              <div className="grid grid-cols-3 gap-3">
                {roadDamages.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRoadItem(item)}
                    className={`cursor-pointer rounded-xl border p-3 transition-all ${
                      selectedRoadItem.id === item.id
                        ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-200'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                      <span>{item.defectType.replace('_', ' ')}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-700">
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{item.location.address}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>Conf: {item.confidence}%</span>
                      <span className="font-semibold text-orange-600">{item.repairUrgency}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Canvas / Image with Bounding Boxes */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center group">
                <img
                  src={selectedRoadItem.imageUrl}
                  alt="Road Inspection"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />

                {/* Simulated YOLO Bounding Box */}
                {selectedRoadItem.boundingBoxes.map((box, i) => (
                  <div
                    key={i}
                    className="absolute border-2 border-orange-400 bg-orange-500/20 rounded shadow-lg pointer-events-none transition-all"
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                  >
                    <span className="absolute -top-6 left-0 bg-orange-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow">
                      {box.label} ({Math.round(box.confidence * 100)}%)
                    </span>
                  </div>
                ))}

                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg text-white text-xs flex items-center gap-2">
                  <Scan className="w-3.5 h-3.5 text-orange-400" />
                  <span>GPS: {selectedRoadItem.location.lat.toFixed(4)}, {selectedRoadItem.location.lng.toFixed(4)} ({selectedRoadItem.location.ward})</span>
                </div>
              </div>
            </div>

            {/* Defect Diagnostics & Maintenance Priority */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Defect Assessment
                    </span>
                    <span className="px-2 py-0.5 rounded font-bold text-xs bg-rose-100 text-rose-700">
                      Priority: {selectedRoadItem.priority}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg mt-1">
                    {selectedRoadItem.defectType.replace('_', ' ')}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedRoadItem.location.address}</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Repair Urgency</span>
                    <span className="font-bold text-rose-600">{selectedRoadItem.repairUrgency}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Estimated Dimensions</span>
                    <span className="font-semibold text-slate-800">{selectedRoadItem.estimatedAreaSqM} m² (Depth: {selectedRoadItem.estimatedDepthCm} cm)</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">YOLO Confidence</span>
                    <span className="font-semibold text-emerald-600">{selectedRoadItem.confidence}%</span>
                  </div>
                  <div className="py-2">
                    <span className="text-slate-500 block mb-1">Recommended Engineering Repair:</span>
                    <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-medium">
                      {selectedRoadItem.recommendedRepair}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => onDispatchCrew?.('CIVIL_ROAD_REPAIR', selectedRoadItem.location.ward)}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Construction className="w-4 h-4" />
                  Generate P1 Civil Repair Work Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. WASTE INTELLIGENCE TAB */}
      {activeEngine === 'WASTE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wasteHotspots.map((spot) => {
              const isDispatched = dispatchedTrucks[spot.id] || spot.assignedTruckId;
              return (
                <div key={spot.id} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all">
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100">
                      <img src={spot.cameraImageUrl} alt={spot.hotspotName} className="w-full h-full object-cover" />
                      <span className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full shadow ${
                        spot.currentWasteLevel === 'CRITICAL_OVERFLOW' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {spot.currentWasteLevel.replace('_', ' ')}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{spot.hotspotName}</h4>
                      <p className="text-xs text-slate-500">{spot.location.address}</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Bin Fill Level:</span>
                        <span className="font-bold text-slate-900">{spot.binCapacityPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${spot.binCapacityPercentage > 100 ? 'bg-rose-500' : 'bg-amber-500'}`} 
                          style={{ width: `${Math.min(spot.binCapacityPercentage, 100)}%` }} 
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-slate-500">Predicted Overflow:</span>
                        <span className="font-bold text-rose-600">In {spot.predictedOverflowHours} hours</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Collection Delay:</span>
                        <span className="font-semibold text-slate-700">{spot.collectionDelayHours} hrs</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>AI Directive:</strong> {spot.actionRequired}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleDispatchWasteTruck(spot.id)}
                      disabled={Boolean(isDispatched)}
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        isDispatched 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95'
                      }`}
                    >
                      {isDispatched ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Compactor Truck En Route
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4" />
                          Dispatch Garbage Compactor
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. HEATWAVE PREDICTION TAB */}
      {activeEngine === 'HEAT' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-600" />
                    LightGBM Urban Microclimate &amp; Heatwave Predictor
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Spatial regression model analyzing surface albedo, building height canyon density, and ambient humidity.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Heat Risk: {heatwave.riskLevel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <span className="text-xs text-amber-700 font-semibold">Peak Temperature</span>
                  <p className="text-3xl font-black text-slate-900 mt-1">{heatwave.peakTemperatureC}°C</p>
                  <span className="text-[11px] text-amber-700">12:30 PM – 4:30 PM</span>
                </div>
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <span className="text-xs text-rose-700 font-semibold">Heat Index (Feels Like)</span>
                  <p className="text-3xl font-black text-rose-600 mt-1">{heatwave.heatIndexC}°C</p>
                  <span className="text-[11px] text-rose-600">Extreme Health Hazard</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold">Cooling Centres Active</span>
                  <p className="text-3xl font-black text-slate-900 mt-1">{heatwave.coolingCentresActive}</p>
                  <span className="text-[11px] text-emerald-600 font-medium">Cap: {heatwave.totalCoolingCapacity} people</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Municipal Heat Advisory
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {heatwave.advisoryText}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-base">Vulnerable Heat Islands</h4>
                <div className="space-y-2">
                  {heatwave.vulnerableWards.map((ward, i) => (
                    <div key={i} className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-xs flex items-center justify-between">
                      <span className="font-medium text-slate-800">{ward}</span>
                      <span className="text-[11px] font-bold text-amber-700">Surface +4.8°C</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-xs text-slate-600 space-y-2">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span>Misting Stations Deployed:</span>
                    <span className="font-bold text-slate-900">{heatwave.waterMistingStationsDeployed} stations</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span>Vulnerable Demographic:</span>
                    <span className="font-bold text-slate-900">42,000 seniors / outdoor workers</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <ThermometerSun className="w-4 h-4" />
                  Expand Public Cooling Center Hours
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. WATER SECURITY TAB */}
      {activeEngine === 'WATER' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-600" />
                    Water Security &amp; Reservoir Resilience Forecasting
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hydro-meteorological balance modeling reservoir drawdown, aquifer levels, and supply line pressure loss.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Reservoir: {waterSecurity.reservoirLevelsPercentage}% Capacity
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <span className="text-xs text-blue-700 font-semibold">Reservoir Storage</span>
                  <p className="text-3xl font-black text-slate-900 mt-1">{waterSecurity.reservoirLevelsPercentage}%</p>
                  <span className="text-[11px] text-blue-700">48.2M Litres Available</span>
                </div>
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <span className="text-xs text-amber-700 font-semibold">Groundwater Depletion</span>
                  <p className="text-3xl font-black text-amber-600 mt-1">{waterSecurity.groundwaterDepletionIndex}</p>
                  <span className="text-[11px] text-amber-700">High Drawdown Rate</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-semibold">Pipeline Leakage Alerts</span>
                  <p className="text-3xl font-black text-slate-900 mt-1">{waterSecurity.leakageAlertCount}</p>
                  <span className="text-[11px] text-rose-600 font-medium">Acoustic sensors flagged</span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Upcoming Supply Stress Forecast (5-Day Horizon)
                </span>
                <div className="space-y-2">
                  {waterSecurity.stressPredictedWards.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{item.ward}</span>
                        <p className="text-[11px] text-slate-500">Predicted supply stress in {item.daysUntilStress} days</p>
                      </div>
                      <span className="px-2 py-1 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                        {item.severity} STRESS
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-base">Emergency Tanker Fleet</h4>
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Available Tankers:</span>
                    <span className="font-bold text-slate-900">{waterSecurity.emergencyTankersAvailable}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Dispatched Today:</span>
                    <span className="font-bold text-blue-700">{waterSecurity.emergencyTankersDispatched}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Preventive Recommendation:</strong> Pre-allocate 6 tankers to Ward 9 &amp; Ward 18 distribution plazas before weekend demand spike.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Droplets className="w-4 h-4" />
                  Authorize Tanker Pre-Allocation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MAINTENANCE TREND ANALYSIS ENGINE TAB */}
      {activeEngine === 'MAINTENANCE' && (
        <div className="space-y-6">
          <MaintenanceTrendAnalysis 
            onDispatchCrew={onDispatchCrew}
            onSelectWard={() => onViewOnMap?.()}
          />
        </div>
      )}

      {/* Persistent Maintenance Trend Analysis Section when not on MAINTENANCE tab */}
      {activeEngine !== 'MAINTENANCE' && (
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Predicted Infrastructure Degradation & Maintenance Trends
              </h3>
            </div>
            <button
              onClick={() => setActiveEngine('MAINTENANCE')}
              className="text-xs font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Expand Full 30-Day Trend Engine</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <MaintenanceTrendAnalysis 
            onDispatchCrew={onDispatchCrew}
            onSelectWard={() => onViewOnMap?.()}
          />
        </div>
      )}
    </div>
  );
};
