import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Cell
} from 'recharts';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  Layers,
  Wrench,
  ShieldAlert,
  CheckCircle2,
  Truck,
  Sliders,
  DollarSign,
  ChevronRight,
  Info,
  Clock,
  MapPin,
  Sparkles,
  RefreshCw,
  Columns,
  Maximize2,
  Minimize2,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  HeartPulse,
  Droplets,
  Zap,
  Flame,
  Trash2,
  MessageSquareWarning,
  Check,
  ShieldCheck
} from 'lucide-react';
import {
  INITIAL_30DAY_TREND_DATA,
  ASSET_CATEGORIES,
  InfrastructureFailureTrendPoint
} from '../data/maintenanceTrendData';
import { CityHealthOverview } from '../types';
import confetti from 'canvas-confetti';

interface MaintenanceCityHealthSplitViewProps {
  cityHealth: CityHealthOverview;
  onDispatchCrew?: (crewType: string, ward: string) => void;
  onSelectWard?: (wardName: string) => void;
  onCloseSplitView?: () => void;
}

export const MaintenanceCityHealthSplitView: React.FC<MaintenanceCityHealthSplitViewProps> = ({
  cityHealth,
  onDispatchCrew,
  onSelectWard,
  onCloseSplitView
}) => {
  // Horizon Filter: 7 Days, 15 Days, 30 Days
  const [horizonDays, setHorizonDays] = useState<7 | 15 | 30>(30);
  
  // Selected Day for deep synchronized inspection
  const [selectedDayNum, setSelectedDayNum] = useState<number>(8); // Default to peak Day 8

  // Split View Layout Mode: 'SPLIT_50_50' | 'CORRELATION_FOCUSED' | 'MAINTENANCE_ONLY' | 'HEALTH_ONLY'
  const [viewMode, setViewMode] = useState<'SPLIT_50_50' | 'CORRELATION_FOCUSED' | 'MAINTENANCE_ONLY' | 'HEALTH_ONLY'>('SPLIT_50_50');

  // Simulation Multipliers
  const [rainMultiplier, setRainMultiplier] = useState<number>(1.0);
  const [heatMultiplier, setHeatMultiplier] = useState<number>(1.0);
  const [agingMultiplier, setAgingMultiplier] = useState<number>(1.0);
  const [showSimControls, setShowSimControls] = useState<boolean>(false);

  // Active simulated preventive interventions
  const [activeInterventions, setActiveInterventions] = useState<Record<number, boolean>>({});

  // Work order dispatched feedback
  const [dispatchedDays, setDispatchedDays] = useState<Record<number, boolean>>({});

  // Compute dynamic trend points
  const computedTrendData = useMemo(() => {
    return INITIAL_30DAY_TREND_DATA.slice(0, horizonDays).map(pt => {
      let dProb = pt.drainageFailureProb;
      let rProb = pt.roadFailureProb;
      let pProb = pt.powerGridFailureProb;
      let wProb = pt.waterMainsFailureProb;
      let sProb = pt.wasteEquipmentProb;

      // Rainfall affects drainage and roads
      if (pt.weatherEvent === 'HEAVY_MONSOON' || pt.weatherEvent === 'TIDAL_HIGH') {
        dProb = Math.min(99, Math.round(dProb * rainMultiplier));
        rProb = Math.min(99, Math.round(rProb * (1 + (rainMultiplier - 1) * 0.7)));
      }

      // Heat affects power grid & water mains
      if (pt.weatherEvent === 'HEATWAVE_SURGE') {
        pProb = Math.min(99, Math.round(pProb * heatMultiplier));
        wProb = Math.min(99, Math.round(wProb * (1 + (heatMultiplier - 1) * 0.8)));
        sProb = Math.min(99, Math.round(sProb * (1 + (heatMultiplier - 1) * 0.5)));
      }

      // Aging factor
      if (agingMultiplier > 1.0) {
        dProb = Math.min(99, Math.round(dProb * agingMultiplier));
        rProb = Math.min(99, Math.round(rProb * agingMultiplier));
        pProb = Math.min(99, Math.round(pProb * agingMultiplier));
        wProb = Math.min(99, Math.round(wProb * agingMultiplier));
        sProb = Math.min(99, Math.round(sProb * agingMultiplier));
      }

      // If user toggled preventive intervention for this day, reduce failure probability by 65%
      const isIntervened = activeInterventions[pt.day] || dispatchedDays[pt.day];
      if (isIntervened) {
        dProb = Math.max(12, Math.round(dProb * 0.35));
        rProb = Math.max(14, Math.round(rProb * 0.38));
        pProb = Math.max(10, Math.round(pProb * 0.32));
        wProb = Math.max(15, Math.round(wProb * 0.36));
        sProb = Math.max(12, Math.round(sProb * 0.35));
      }

      const composite = Math.round((dProb * 0.28) + (rProb * 0.22) + (pProb * 0.22) + (wProb * 0.16) + (sProb * 0.12));
      const priority: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'NOMINAL' = 
        composite >= 70 ? 'CRITICAL' : composite >= 50 ? 'HIGH' : composite >= 40 ? 'ELEVATED' : 'NOMINAL';

      // Correlate with projected City Health Score for this day
      // Higher composite asset failure causes city health score to plummet
      const rawHealth = 100 - (composite * 0.72);
      const projectedCityHealth = Math.max(18, Math.min(98, Math.round(rawHealth)));

      // Correlate with projected citizen complaint influx
      const projectedComplaints = Math.round(15 + (composite * 0.95));

      return {
        ...pt,
        drainageFailureProb: dProb,
        roadFailureProb: rProb,
        powerGridFailureProb: pProb,
        waterMainsFailureProb: wProb,
        wasteEquipmentProb: sProb,
        compositeRiskScore: composite,
        priorityLevel: priority,
        projectedCityHealth,
        projectedComplaints,
        isIntervened
      };
    });
  }, [horizonDays, rainMultiplier, heatMultiplier, agingMultiplier, activeInterventions, dispatchedDays]);

  // Selected item
  const selectedDayPoint = useMemo(() => {
    return computedTrendData.find(d => d.day === selectedDayNum) || computedTrendData[0];
  }, [computedTrendData, selectedDayNum]);

  // Radar chart comparing 5 domains: Asset Degradation vs. City Domain Risk vs. Target With Intervention
  const radarCorrelationData = useMemo(() => {
    if (!selectedDayPoint) return [];
    return [
      {
        domain: 'Stormwater / Flood',
        assetDegradation: selectedDayPoint.drainageFailureProb,
        cityRisk: cityHealth.floodRisk,
        postIntervention: Math.round(selectedDayPoint.drainageFailureProb * 0.35),
        fullMark: 100
      },
      {
        domain: 'Roads & Bridges',
        assetDegradation: selectedDayPoint.roadFailureProb,
        cityRisk: cityHealth.roadRisk,
        postIntervention: Math.round(selectedDayPoint.roadFailureProb * 0.38),
        fullMark: 100
      },
      {
        domain: '33kV Electrical Grid',
        assetDegradation: selectedDayPoint.powerGridFailureProb,
        cityRisk: cityHealth.heatRisk + 15, // Grid load correlates with heat & substation health
        postIntervention: Math.round(selectedDayPoint.powerGridFailureProb * 0.32),
        fullMark: 100
      },
      {
        domain: 'Water Supply Mains',
        assetDegradation: selectedDayPoint.waterMainsFailureProb,
        cityRisk: cityHealth.waterRisk,
        postIntervention: Math.round(selectedDayPoint.waterMainsFailureProb * 0.36),
        fullMark: 100
      },
      {
        domain: 'Solid Waste Units',
        assetDegradation: selectedDayPoint.wasteEquipmentProb,
        cityRisk: cityHealth.wasteRisk,
        postIntervention: Math.round(selectedDayPoint.wasteEquipmentProb * 0.35),
        fullMark: 100
      }
    ];
  }, [selectedDayPoint, cityHealth]);

  // Handle Proactive Dispatch
  const handleProactiveDispatch = (point: InfrastructureFailureTrendPoint) => {
    setDispatchedDays(prev => ({ ...prev, [point.day]: true }));
    setActiveInterventions(prev => ({ ...prev, [point.day]: true }));
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 }
    });

    let crew = 'DEWATERING_PUMP_UNIT';
    if (point.powerGridFailureProb > point.drainageFailureProb && point.powerGridFailureProb > 60) {
      crew = 'HIGH_VOLTAGE_LINEMEN';
    } else if (point.roadFailureProb > point.drainageFailureProb && point.roadFailureProb > 60) {
      crew = 'CIVIL_ROAD_REPAIR';
    } else if (point.waterMainsFailureProb > 60) {
      crew = 'DRAINAGE_JETTING_SQUAD';
    }

    onDispatchCrew?.(crew, point.targetWard);
  };

  const handleToggleIntervention = (day: number) => {
    setActiveInterventions(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleResetSim = () => {
    setRainMultiplier(1.0);
    setHeatMultiplier(1.0);
    setAgingMultiplier(1.0);
    setActiveInterventions({});
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-6">
      
      {/* 1. Header with Mode Switcher & Synchronized Horizon Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
              <Columns className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Split-View Correlation Engine
                </h2>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Infrastructure Failure ⇄ City Health Dynamics
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Compare predicted asset degradation timelines side-by-side with overall city health indicators, citizen complaints, and public risk cascade.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Time Horizon Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded-2xl border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('SPLIT_50_50')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'SPLIT_50_50' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split 50/50</span>
            </button>
            <button
              onClick={() => setViewMode('CORRELATION_FOCUSED')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'CORRELATION_FOCUSED' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Correlation Matrix</span>
            </button>
          </div>

          {/* Horizon Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded-2xl border border-slate-700 text-xs">
            <button
              onClick={() => setHorizonDays(7)}
              className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                horizonDays === 7 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              7d
            </button>
            <button
              onClick={() => setHorizonDays(15)}
              className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                horizonDays === 15 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              15d
            </button>
            <button
              onClick={() => setHorizonDays(30)}
              className={`px-2.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                horizonDays === 30 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              30d
            </button>
          </div>

          {/* Stress Sim Toggle */}
          <button
            onClick={() => setShowSimControls(!showSimControls)}
            className={`px-3 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showSimControls 
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Stress Simulator</span>
            {(rainMultiplier > 1 || heatMultiplier > 1 || agingMultiplier > 1) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {onCloseSplitView && (
            <button
              onClick={onCloseSplitView}
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Close Split View"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>

      {/* 2. Collapsible Simulation Sliders Drawer */}
      {showSimControls && (
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Dynamic Stress & Climate Sensitivity Multipliers
            </span>
            <button
              onClick={handleResetSim}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Baselines
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Precipitation Surge:</span>
                <span className="font-mono font-bold text-cyan-400">{rainMultiplier.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.6"
                step="0.05"
                value={rainMultiplier}
                onChange={(e) => setRainMultiplier(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Heatwave Surge:</span>
                <span className="font-mono font-bold text-amber-400">{heatMultiplier.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={heatMultiplier}
                onChange={(e) => setHeatMultiplier(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Asset Age Factor:</span>
                <span className="font-mono font-bold text-rose-400">{agingMultiplier.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="1.3"
                step="0.05"
                value={agingMultiplier}
                onChange={(e) => setAgingMultiplier(parseFloat(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Interactive Synchronized Day Timeline Scrubber */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              Synchronized 30-Day Timeline Scrubber:
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold">
              Day {selectedDayPoint.day} ({selectedDayPoint.dateStr})
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-slate-400">Jump to Major Stress Events:</span>
            <button
              onClick={() => setSelectedDayNum(8)}
              className={`px-2 py-0.5 rounded-lg font-mono transition cursor-pointer ${
                selectedDayNum === 8 ? 'bg-rose-600 text-white font-bold' : 'bg-slate-800 text-rose-300 hover:bg-slate-700'
              }`}
            >
              Day 8 (Monsoon Peak)
            </button>
            <button
              onClick={() => setSelectedDayNum(20)}
              className={`px-2 py-0.5 rounded-lg font-mono transition cursor-pointer ${
                selectedDayNum === 20 ? 'bg-amber-600 text-white font-bold' : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
              }`}
            >
              Day 20 (Heat Grid Strain)
            </button>
            <button
              onClick={() => setSelectedDayNum(28)}
              className={`px-2 py-0.5 rounded-lg font-mono transition cursor-pointer ${
                selectedDayNum === 28 ? 'bg-purple-600 text-white font-bold' : 'bg-slate-800 text-purple-300 hover:bg-slate-700'
              }`}
            >
              Day 28 (Spring Tide Surge)
            </button>
          </div>
        </div>

        {/* Day Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          {computedTrendData.map((pt) => {
            const isSelected = pt.day === selectedDayNum;
            const isCritical = pt.compositeRiskScore >= 70;
            const isHigh = pt.compositeRiskScore >= 50 && pt.compositeRiskScore < 70;

            return (
              <button
                key={pt.day}
                onClick={() => setSelectedDayNum(pt.day)}
                className={`shrink-0 flex flex-col items-center px-2.5 py-1.5 rounded-xl border text-[11px] transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg scale-105 z-10'
                    : isCritical
                    ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/50'
                    : isHigh
                    ? 'bg-amber-950/30 border-amber-800/50 text-amber-300 hover:bg-amber-900/40'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
                }`}
              >
                <span className="font-bold font-mono">D{pt.day}</span>
                <span className="text-[9px] opacity-80">{pt.dateStr.split(' ')[0]}</span>
                <span className="text-[10px] font-mono font-black mt-0.5">{pt.compositeRiskScore}%</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. SPLIT VIEW: LEFT (MAINTENANCE PREDICTIVE) VS RIGHT (CITY HEALTH IMPACT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT PANE: INFRASTRUCTURE ASSET MAINTENANCE TRENDS */}
        <div className={`space-y-4 ${viewMode === 'SPLIT_50_50' ? 'lg:col-span-6' : viewMode === 'CORRELATION_FOCUSED' ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4 h-full flex flex-col justify-between">
            
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      Asset Degradation Trajectory
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        {selectedDayPoint.targetWard}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Physical failure probabilities across 5 civic vectors</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-rose-400 font-mono">
                    {selectedDayPoint.compositeRiskScore}%
                  </span>
                  <span className="text-[9px] text-slate-400 block font-mono">Composite Fragility</span>
                </div>
              </div>

              {/* Multi-Asset Mini Bars */}
              <div className="space-y-2 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-cyan-300 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Stormwater Sluice & Culverts
                    </span>
                    <span className="font-mono font-bold text-white">{selectedDayPoint.drainageFailureProb}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 rounded-full transition-all duration-500" 
                      style={{ width: `${selectedDayPoint.drainageFailureProb}%` }} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-orange-300 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-orange-400" />
                      Road Subgrade & Pavements
                    </span>
                    <span className="font-mono font-bold text-white">{selectedDayPoint.roadFailureProb}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-500" 
                      style={{ width: `${selectedDayPoint.roadFailureProb}%` }} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-yellow-300 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      33kV Electrical Grid & Substations
                    </span>
                    <span className="font-mono font-bold text-white">{selectedDayPoint.powerGridFailureProb}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full transition-all duration-500" 
                      style={{ width: `${selectedDayPoint.powerGridFailureProb}%` }} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-blue-300 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      Water Mains & Booster Cavitation
                    </span>
                    <span className="font-mono font-bold text-white">{selectedDayPoint.waterMainsFailureProb}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                      style={{ width: `${selectedDayPoint.waterMainsFailureProb}%` }} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-emerald-300 flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Solid Waste Compactors & Fleets
                    </span>
                    <span className="font-mono font-bold text-white">{selectedDayPoint.wasteEquipmentProb}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${selectedDayPoint.wasteEquipmentProb}%` }} 
                    />
                  </div>
                </div>
              </div>

              {/* AI Prescriptive Recommendation */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  Prescriptive Action on {selectedDayPoint.dateStr}:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {selectedDayPoint.recommendedPreventiveAction}
                </p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                  <span>Target Ward: <strong>{selectedDayPoint.targetWard}</strong></span>
                  <span className="text-emerald-400 font-bold">Cost Avoidance: ${selectedDayPoint.costAvoidanceThousands}k</span>
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={() => handleToggleIntervention(selectedDayPoint.day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                  selectedDayPoint.isIntervened
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {selectedDayPoint.isIntervened ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Intervention Applied (-65% Risk)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Simulate Maintenance</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleProactiveDispatch(selectedDayPoint)}
                disabled={Boolean(dispatchedDays[selectedDayPoint.day])}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition shadow flex items-center gap-1.5 cursor-pointer ${
                  dispatchedDays[selectedDayPoint.day]
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{dispatchedDays[selectedDayPoint.day] ? 'Crew Scheduled' : 'Dispatch Crew'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT PANE: CITY HEALTH OVERVIEW & OPERATIONAL IMPACT */}
        <div className={`space-y-4 ${viewMode === 'SPLIT_50_50' ? 'lg:col-span-6' : viewMode === 'CORRELATION_FOCUSED' ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4 h-full flex flex-col justify-between">
            
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    <HeartPulse className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      Projected City Health Score
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        selectedDayPoint.projectedCityHealth >= 75 ? 'bg-emerald-500/20 text-emerald-300' :
                        selectedDayPoint.projectedCityHealth >= 50 ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {selectedDayPoint.projectedCityHealth >= 75 ? 'OPTIMAL' : selectedDayPoint.projectedCityHealth >= 50 ? 'DEGRADED' : 'CRITICAL OUTAGE'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Live operational resilience under infrastructure strain</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="text-2xl font-black text-pink-400 font-mono">
                      {selectedDayPoint.projectedCityHealth}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/ 100</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block font-mono">
                    Baseline: {cityHealth.overallScore}/100 ({selectedDayPoint.projectedCityHealth - cityHealth.overallScore >= 0 ? '+' : ''}{selectedDayPoint.projectedCityHealth - cityHealth.overallScore} pts)
                  </span>
                </div>
              </div>

              {/* City Health Key Impact Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">Flood Risk</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-cyan-400">{Math.round((cityHealth.floodRisk + selectedDayPoint.drainageFailureProb) / 2)}%</span>
                  </div>
                  <span className="text-[9px] text-cyan-300 font-mono">Sluice-driven</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">Road Health</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-orange-400">{Math.round((cityHealth.roadRisk + selectedDayPoint.roadFailureProb) / 2)}%</span>
                  </div>
                  <span className="text-[9px] text-orange-300 font-mono">Transit delay</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">Water Security</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-blue-400">{Math.round((cityHealth.waterRisk + selectedDayPoint.waterMainsFailureProb) / 2)}%</span>
                  </div>
                  <span className="text-[9px] text-blue-300 font-mono">Cavitation risk</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">Citizen Calls</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg font-black text-rose-400">~{selectedDayPoint.projectedComplaints}</span>
                  </div>
                  <span className="text-[9px] text-rose-300 font-mono">Daily influx</span>
                </div>
              </div>

              {/* City Impact Narrative */}
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-2">
                <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Citywide Infrastructure Outage Cascade:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedDayPoint.compositeRiskScore >= 70
                    ? `Critical fragility on ${selectedDayPoint.dateStr}: Failure in ${selectedDayPoint.targetWard} (${selectedDayPoint.criticalVulnerabilityTag}) is modeled to trigger a ${Math.abs(selectedDayPoint.projectedCityHealth - cityHealth.overallScore)}pt drop in overall city resilience, amplifying civic complaints to ${selectedDayPoint.projectedComplaints}/day.`
                    : selectedDayPoint.compositeRiskScore >= 50
                    ? `Elevated operational load on ${selectedDayPoint.dateStr}: Moderate sub-system stress detected. Preventive maintenance will prevent cascade into main arterial waterlogging and power brownouts.`
                    : `Nominal city conditions on ${selectedDayPoint.dateStr}: Baseline preventive inspections maintain city health score at ${selectedDayPoint.projectedCityHealth}/100.`}
                </p>
              </div>

            </div>

            {/* Bottom Telemetry Metrics */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Active Alerts: <strong>{cityHealth.activeCriticalAlerts} Critical</strong>
              </span>
              <span className="text-emerald-400 font-mono font-bold">
                {cityHealth.preventiveActionsDeployedToday} Crews Active Today
              </span>
            </div>

          </div>
        </div>

      </div>

      {/* 5. SIDE-BY-SIDE CORRELATION VISUALIZATION (RADAR & DUAL-AXIS TRAJECTORY) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Radar Chart: 5-Domain Cross-Correlation */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                5-Domain Failure ⇄ City Risk Radar
              </h4>
              <p className="text-[11px] text-slate-500">Day {selectedDayPoint.day} Asset Stress vs. City Vulnerability</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">Correlation</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarCorrelationData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="domain" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9, fill: '#64748b' }} />
                <Radar
                  name="Predicted Asset Failure %"
                  dataKey="assetDegradation"
                  stroke="#ec4899"
                  fill="#ec4899"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Current City Risk %"
                  dataKey="cityRisk"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.25}
                />
                <Radar
                  name="Post-Intervention Target"
                  dataKey="postIntervention"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.15}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} 
                  iconSize={8}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs text-white shadow-xl space-y-1">
                          <strong className="text-white">{item.domain}</strong>
                          <div className="text-pink-400">Asset Degradation: <span className="font-bold">{item.assetDegradation}%</span></div>
                          <div className="text-cyan-400">City Risk Metric: <span className="font-bold">{item.cityRisk}%</span></div>
                          <div className="text-emerald-400">Post-Intervention: <span className="font-bold">{item.postIntervention}%</span></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dual-Axis Synchronized Trajectory: Asset Fragility vs. Projected City Health */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                Infrastructure Degradation vs. Projected City Health (Next {horizonDays} Days)
              </h4>
              <p className="text-[11px] text-slate-500">Notice inverse correlation: failure probability spikes drive city health score down</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-pink-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Composite Fragility (%)
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Projected City Health (Score)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={computedTrendData}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    setSelectedDayNum(e.activePayload[0].payload.day);
                  }
                }}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="dateStr" 
                  stroke="#64748b" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  interval={horizonDays === 30 ? 2 : 0}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#64748b" 
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-2xl text-white text-xs space-y-1.5">
                          <div className="font-bold text-slate-300">Day {data.day} ({data.dateStr}) • {data.dayOfWeek}</div>
                          <div className="text-pink-400 font-mono">Composite Asset Fragility: <strong>{data.compositeRiskScore}%</strong></div>
                          <div className="text-emerald-400 font-mono">Projected City Health: <strong>{data.projectedCityHealth}/100</strong></div>
                          <div className="text-rose-400 font-mono">Projected Citizen Complaints: <strong>{data.projectedComplaints} / day</strong></div>
                          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                            {data.criticalVulnerabilityTag}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                
                {/* Composite Asset Risk Area */}
                <Area
                  type="monotone"
                  dataKey="compositeRiskScore"
                  name="Composite Asset Risk"
                  stroke="#ec4899"
                  fill="#ec4899"
                  fillOpacity={0.2}
                  strokeWidth={2.5}
                />

                {/* Projected City Health Line */}
                <Line
                  type="monotone"
                  dataKey="projectedCityHealth"
                  name="Projected City Health"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 2, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />

                {/* Warning and Critical Lines */}
                <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" />
                <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 6. CORRELATION MATRIX BREAKDOWN CARDS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Direct Impact Mapping: Infrastructure Failure Vectors ➔ Municipal Performance Indicators
          </h4>
          <span className="text-xs text-slate-500 font-mono">Auto-Tuned Cross-Domain Analysis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          
          {/* Card 1: Stormwater ➔ Flood Risk & Transit Block */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                Stormwater Sluice Vector
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Drainage #{selectedDayPoint.day}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Sluice gate silt accumulation and culvert head-loss directly reduce drainage throughput by <strong>42%</strong>, escalating city flood risk score to <strong>{cityHealth.floodRisk}%</strong> and inundating bus transit underpasses.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Impact: <strong>+18 Citizen Calls/hr</strong></span>
              <span className="text-emerald-400 font-bold">ROI: 5.2x</span>
            </div>
          </div>

          {/* Card 2: 33kV Grid ➔ Power Outage & Water Pumping Stall */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-yellow-400" />
                33kV Electrical Grid Vector
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                Grid #{selectedDayPoint.day}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Substation transformer thermal overload and water ingress de-energize booster pumps and street lighting, generating <strong>4 Active Critical Alerts</strong> and cascading into residential water shortages.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Impact: <strong>14.2k Households</strong></span>
              <span className="text-emerald-400 font-bold">ROI: 6.8x</span>
            </div>
          </div>

          {/* Card 3: Road Subgrade ➔ Commerce & Emergency Lane Paralysis */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-orange-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Road & Pavement Vector
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20">
                Roads #{selectedDayPoint.day}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Sub-base moisture saturation leads to rapid pothole proliferation and asphalt cracking, increasing emergency vehicle response times by <strong>14.5 minutes</strong> across Ward 8 and Ward 11.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Impact: <strong>-18% Transit Velocity</strong></span>
              <span className="text-emerald-400 font-bold">ROI: 3.9x</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
