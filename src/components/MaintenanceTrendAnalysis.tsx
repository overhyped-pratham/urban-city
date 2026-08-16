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
  Cell,
  Brush
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  Calendar,
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
  FileCheck
} from 'lucide-react';
import {
  INITIAL_30DAY_TREND_DATA,
  ASSET_CATEGORIES,
  InfrastructureFailureTrendPoint
} from '../data/maintenanceTrendData';
import confetti from 'canvas-confetti';

interface MaintenanceTrendAnalysisProps {
  onDispatchCrew?: (crewType: string, ward: string) => void;
  onSelectWard?: (wardName: string) => void;
}

export const MaintenanceTrendAnalysis: React.FC<MaintenanceTrendAnalysisProps> = ({
  onDispatchCrew,
  onSelectWard
}) => {
  // Horizon Filter: 7 Days, 15 Days, 30 Days
  const [horizonDays, setHorizonDays] = useState<7 | 15 | 30>(30);
  
  // Active Asset Filter
  const [activeAssetFilter, setActiveAssetFilter] = useState<'ALL' | 'drainage' | 'roads' | 'powerGrid' | 'waterMains' | 'wasteEquipment'>('ALL');
  
  // Selected Day for deep inspection
  const [selectedDayNum, setSelectedDayNum] = useState<number>(8); // Default to peak Day 8
  
  // Simulation Multipliers
  const [rainMultiplier, setRainMultiplier] = useState<number>(1.0);
  const [heatMultiplier, setHeatMultiplier] = useState<number>(1.0);
  const [agingMultiplier, setAgingMultiplier] = useState<number>(1.0);
  const [showSimControls, setShowSimControls] = useState<boolean>(false);

  // Work order dispatched feedback
  const [dispatchedDays, setDispatchedDays] = useState<Record<number, boolean>>({});

  // Compute dynamic trend points based on horizon and multipliers
  const computedTrendData = useMemo(() => {
    return INITIAL_30DAY_TREND_DATA.slice(0, horizonDays).map(pt => {
      // Apply weather & aging multipliers
      let dProb = pt.drainageFailureProb;
      let rProb = pt.roadFailureProb;
      let pProb = pt.powerGridFailureProb;
      let wProb = pt.waterMainsFailureProb;
      let sProb = pt.wasteEquipmentProb;

      // Rainfall affects drainage and roads heavily
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

      const composite = Math.round((dProb * 0.28) + (rProb * 0.22) + (pProb * 0.22) + (wProb * 0.16) + (sProb * 0.12));
      const priority: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'NOMINAL' = 
        composite >= 70 ? 'CRITICAL' : composite >= 50 ? 'HIGH' : composite >= 40 ? 'ELEVATED' : 'NOMINAL';

      const point: InfrastructureFailureTrendPoint = {
        ...pt,
        drainageFailureProb: dProb,
        roadFailureProb: rProb,
        powerGridFailureProb: pProb,
        waterMainsFailureProb: wProb,
        wasteEquipmentProb: sProb,
        compositeRiskScore: composite,
        priorityLevel: priority
      };
      return point;
    });
  }, [horizonDays, rainMultiplier, heatMultiplier, agingMultiplier]);

  // Selected item
  const selectedDayPoint = useMemo(() => {
    return computedTrendData.find(d => d.day === selectedDayNum) || computedTrendData[0];
  }, [computedTrendData, selectedDayNum]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    let maxRiskPoint = computedTrendData[0];
    let totalCriticalDays = 0;
    let totalCostAvoidance = 0;

    computedTrendData.forEach(pt => {
      if (pt.compositeRiskScore > maxRiskPoint.compositeRiskScore) {
        maxRiskPoint = pt;
      }
      if (pt.compositeRiskScore >= 65 || pt.drainageFailureProb >= 75 || pt.powerGridFailureProb >= 75) {
        totalCriticalDays++;
      }
      totalCostAvoidance += pt.costAvoidanceThousands;
    });

    return {
      peakDay: maxRiskPoint,
      criticalDaysCount: totalCriticalDays,
      totalCostAvoidance: totalCostAvoidance,
      meanCompositeRisk: Math.round(computedTrendData.reduce((acc, curr) => acc + curr.compositeRiskScore, 0) / computedTrendData.length)
    };
  }, [computedTrendData]);

  // Handle Disptach
  const handleProactiveDispatch = (point: InfrastructureFailureTrendPoint) => {
    setDispatchedDays(prev => ({ ...prev, [point.day]: true }));
    confetti({
      particleCount: 40,
      spread: 60,
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

  // Reset multipliers
  const handleResetSim = () => {
    setRainMultiplier(1.0);
    setHeatMultiplier(1.0);
    setAgingMultiplier(1.0);
  };

  // Custom Chart Tooltip
  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: InfrastructureFailureTrendPoint = payload[0]?.payload;
      if (!data) return null;

      return (
        <div className="bg-slate-900/95 border border-slate-700 p-4 rounded-2xl shadow-2xl backdrop-blur-md text-white max-w-xs space-y-2.5 z-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="text-xs font-bold text-slate-400">Day {data.day} • {data.dayOfWeek}</span>
              <h4 className="text-sm font-bold text-white">{data.dateStr} (2026)</h4>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
              data.priorityLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
              data.priorityLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}>
              {data.priorityLevel} RISK
            </span>
          </div>

          {/* Failure Probabilities */}
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center text-cyan-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Stormwater & Sluices:
              </span>
              <strong className="text-white">{data.drainageFailureProb}%</strong>
            </div>

            <div className="flex justify-between items-center text-orange-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                Roads & Pavements:
              </span>
              <strong className="text-white">{data.roadFailureProb}%</strong>
            </div>

            <div className="flex justify-between items-center text-yellow-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                33kV Power Grid:
              </span>
              <strong className="text-white">{data.powerGridFailureProb}%</strong>
            </div>

            <div className="flex justify-between items-center text-blue-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Water Mains & Pumps:
              </span>
              <strong className="text-white">{data.waterMainsFailureProb}%</strong>
            </div>

            <div className="flex justify-between items-center text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Solid Waste Compactors:
              </span>
              <strong className="text-white">{data.wasteEquipmentProb}%</strong>
            </div>

            <div className="flex justify-between items-center pt-1.5 border-t border-slate-800 text-pink-300 font-bold">
              <span>Composite City Fragility:</span>
              <span className="text-pink-400 text-sm">{data.compositeRiskScore}%</span>
            </div>
          </div>

          {/* Action note */}
          {data.recommendedPreventiveAction && (
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
              <span className="text-slate-400 font-semibold block">Prescriptive Action:</span>
              <p className="text-emerald-300 mt-0.5 leading-snug">⚡ {data.recommendedPreventiveAction}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-6">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5 flex-wrap">
                30-Day Predictive Maintenance Trend Analysis
                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Stochastic Weibull & TimesFM Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate component failure probabilities, hydrological head-loss, and grid thermal stress to trigger preventive work orders before breakdown.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Time Horizon & Sim Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Horizon Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-800/90 rounded-2xl border border-slate-700 text-xs">
            <button
              onClick={() => setHorizonDays(7)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                horizonDays === 7 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              7-Day Sprint
            </button>
            <button
              onClick={() => setHorizonDays(15)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                horizonDays === 15 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              15-Day Mid
            </button>
            <button
              onClick={() => setHorizonDays(30)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                horizonDays === 30 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              30-Day Full Horizon
            </button>
          </div>

          {/* Stress Sim Toggle */}
          <button
            onClick={() => setShowSimControls(!showSimControls)}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
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

        </div>
      </div>

      {/* 2. Simulation Sliders Drawer (Collapsible) */}
      {showSimControls && (
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
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
            {/* Rain Multiplier */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Precipitation Surge Multiplier:</span>
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
              <span className="text-[10px] text-slate-500">Amplifies drainage & culvert head-loss</span>
            </div>

            {/* Heat Multiplier */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Heatwave Surge Multiplier:</span>
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
              <span className="text-[10px] text-slate-500">Increases transformer & water cavitation risk</span>
            </div>

            {/* Aging Multiplier */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Asset Age & Wear Multiplier:</span>
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
              <span className="text-[10px] text-slate-500">Simulates deferred municipal maintenance</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Top Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Peak Fragility Window</span>
          <div className="mt-1">
            <span className="text-xl font-black text-rose-400">{summaryMetrics.peakDay.dateStr}</span>
            <span className="text-[10px] text-rose-300 font-mono ml-2">Day {summaryMetrics.peakDay.day}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">
            {summaryMetrics.peakDay.compositeRiskScore}% Peak Risk ({summaryMetrics.peakDay.weatherEvent?.replace('_', ' ')})
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Critical Risk Days (≥65%)</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{summaryMetrics.criticalDaysCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">/ {horizonDays} days</span>
          </div>
          <span className="text-[10px] text-amber-400/80 mt-1">Require immediate work orders</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Proactive Cost Avoidance</span>
          <div className="mt-1">
            <span className="text-xl font-black text-emerald-400">${(summaryMetrics.totalCostAvoidance).toLocaleString()}k</span>
          </div>
          <span className="text-[10px] text-emerald-300 mt-1">Preventing major civic outages</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-medium">Mean City Fragility</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-400">{summaryMetrics.meanCompositeRisk}%</span>
            <span className="text-[10px] text-cyan-300 font-semibold">Overall index</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Weighted infrastructure score</span>
        </div>
      </div>

      {/* 4. Filter Asset Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold mr-1">Highlight Asset Vector:</span>
          
          <button
            onClick={() => setActiveAssetFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeAssetFilter === 'ALL'
                ? 'bg-pink-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All 5 Vectors + Composite
          </button>

          <button
            onClick={() => setActiveAssetFilter('drainage')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAssetFilter === 'drainage'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Stormwater Sluices
          </button>

          <button
            onClick={() => setActiveAssetFilter('roads')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAssetFilter === 'roads'
                ? 'bg-orange-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            Road Pavements
          </button>

          <button
            onClick={() => setActiveAssetFilter('powerGrid')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAssetFilter === 'powerGrid'
                ? 'bg-yellow-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            33kV Grid
          </button>

          <button
            onClick={() => setActiveAssetFilter('waterMains')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAssetFilter === 'waterMains'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            Water Supply
          </button>

          <button
            onClick={() => setActiveAssetFilter('wasteEquipment')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAssetFilter === 'wasteEquipment'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Solid Waste
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-rose-500" />
            &gt;70% Critical
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-amber-500" />
            &gt;50% Warning
          </span>
        </div>
      </div>

      {/* 5. Main Recharts Area & Line Chart */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Predicted Failure Probability Curve Over Next {horizonDays} Days (%)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Click any data point or day below to inspect telemetry
          </span>
        </div>

        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={computedTrendData}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  setSelectedDayNum(e.activePayload[0].payload.day);
                }
              }}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="compositeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="drainageGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

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
                unit="%"
              />
              
              <Tooltip content={<CustomTrendTooltip />} />
              
              {/* Reference Lines */}
              <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Critical (70%)', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }} />
              <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Warning (50%)', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} />

              {/* Composite Risk Area */}
              {(activeAssetFilter === 'ALL') && (
                <Area
                  type="monotone"
                  dataKey="compositeRiskScore"
                  name="Composite City Risk"
                  stroke="#ec4899"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#compositeGrad)"
                  activeDot={{ r: 7, fill: '#ec4899', stroke: '#ffffff' }}
                />
              )}

              {/* Drainage */}
              {(activeAssetFilter === 'ALL' || activeAssetFilter === 'drainage') && (
                <Line
                  type="monotone"
                  dataKey="drainageFailureProb"
                  name="Stormwater & Sluices"
                  stroke="#06b6d4"
                  strokeWidth={activeAssetFilter === 'drainage' ? 3.5 : 2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {/* Roads */}
              {(activeAssetFilter === 'ALL' || activeAssetFilter === 'roads') && (
                <Line
                  type="monotone"
                  dataKey="roadFailureProb"
                  name="Road Pavements"
                  stroke="#f97316"
                  strokeWidth={activeAssetFilter === 'roads' ? 3.5 : 2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {/* Power Grid */}
              {(activeAssetFilter === 'ALL' || activeAssetFilter === 'powerGrid') && (
                <Line
                  type="monotone"
                  dataKey="powerGridFailureProb"
                  name="33kV Grid"
                  stroke="#eab308"
                  strokeWidth={activeAssetFilter === 'powerGrid' ? 3.5 : 2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {/* Water Mains */}
              {(activeAssetFilter === 'ALL' || activeAssetFilter === 'waterMains') && (
                <Line
                  type="monotone"
                  dataKey="waterMainsFailureProb"
                  name="Water Mains"
                  stroke="#3b82f6"
                  strokeWidth={activeAssetFilter === 'waterMains' ? 3.5 : 2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}

              {/* Waste Equipment */}
              {(activeAssetFilter === 'ALL' || activeAssetFilter === 'wasteEquipment') && (
                <Line
                  type="monotone"
                  dataKey="wasteEquipmentProb"
                  name="Solid Waste"
                  stroke="#10b981"
                  strokeWidth={activeAssetFilter === 'wasteEquipment' ? 3.5 : 2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Deep Drilldown on Selected Day & Asset Vulnerability Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Left Column: Selected Day Prescriptive Work Order Directive */}
        <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-700">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
                    selectedDayPoint.priorityLevel === 'CRITICAL' ? 'bg-rose-500 text-white' :
                    selectedDayPoint.priorityLevel === 'HIGH' ? 'bg-amber-500 text-slate-950 font-black' :
                    'bg-cyan-500 text-slate-950 font-black'
                  }`}>
                    {selectedDayPoint.priorityLevel} RISK HORIZON
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-slate-300 font-medium">{selectedDayPoint.targetWard}</span>
                </div>
                <h3 className="text-base font-bold text-white leading-tight">
                  Day {selectedDayPoint.day} ({selectedDayPoint.dayOfWeek}, {selectedDayPoint.dateStr}) — Predictive Asset Diagnostics
                </h3>
              </div>

              <div className="text-right shrink-0">
                <span className="text-2xl font-black text-pink-400 font-mono">
                  {selectedDayPoint.compositeRiskScore}%
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Composite Risk</span>
              </div>
            </div>

            {/* Diagnostics Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">Weather Stress:</span>
                <p className="font-bold text-cyan-300">{selectedDayPoint.weatherEvent?.replace('_', ' ') || 'Normal'}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">Cost Avoidance:</span>
                <p className="font-bold text-emerald-400">${selectedDayPoint.costAvoidanceThousands}k USD</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-semibold block">Primary Threat:</span>
                <p className="font-bold text-amber-300 truncate">{selectedDayPoint.criticalVulnerabilityTag}</p>
              </div>
            </div>

            {/* Prescriptive Engineering Action */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-1.5">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-emerald-400" />
                AI Prescriptive Engineering Maintenance Action:
              </span>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                {selectedDayPoint.recommendedPreventiveAction}
              </p>
            </div>

            {/* Asset breakdown mini-bars */}
            <div className="space-y-2 pt-1 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Probability Breakdown on {selectedDayPoint.dateStr}:
              </span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-cyan-300">Stormwater Sluices</span>
                  <span className="font-mono font-bold text-white">{selectedDayPoint.drainageFailureProb}%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-orange-300">Road Pavements</span>
                  <span className="font-mono font-bold text-white">{selectedDayPoint.roadFailureProb}%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-yellow-300">33kV Power Grid</span>
                  <span className="font-mono font-bold text-white">{selectedDayPoint.powerGridFailureProb}%</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-blue-300">Water Supply Mains</span>
                  <span className="font-mono font-bold text-white">{selectedDayPoint.waterMainsFailureProb}%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Dispatch Button */}
          <div className="pt-3 border-t border-slate-700 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 font-mono">
              Auto-generated Preventive Work Order #{selectedDayPoint.day * 1042}
            </span>

            <button
              onClick={() => handleProactiveDispatch(selectedDayPoint)}
              disabled={Boolean(dispatchedDays[selectedDayPoint.day])}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer ${
                dispatchedDays[selectedDayPoint.day]
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {dispatchedDays[selectedDayPoint.day] ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Work Order Scheduled & Crew Flagged
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  Dispatch Preventive Maintenance Crew
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: Asset Class Comparative Bar Chart */}
        <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Asset Category 30-Day Mean Vulnerability
                </h4>
                <p className="text-[11px] text-slate-400">Mean probability & critical component count</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">5 Core Vectors</span>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ASSET_CATEGORIES}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#64748b" 
                    tick={{ fontSize: 10, fill: '#cbd5e1' }}
                    width={90}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs text-white shadow-xl space-y-1">
                            <strong className="text-cyan-300">{item.name}</strong>
                            <div className="text-[11px] text-slate-300">Mean 30-Day Failure Prob: <span className="font-bold text-white">{item.meanProbability}%</span></div>
                            <div className="text-[11px] text-slate-400">Critical Units: {item.criticalComponentsCount} assets</div>
                            <div className="text-[10px] text-amber-300">Driver: {item.primaryRiskDriver}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="meanProbability" radius={[0, 6, 6, 0]}>
                    {ASSET_CATEGORIES.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Mini list */}
            <div className="space-y-2 text-xs pt-1">
              {ASSET_CATEGORIES.slice(0, 3).map((cat) => (
                <div key={cat.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <p className="text-[10px] text-slate-400 truncate">{cat.primaryRiskDriver}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-white">{cat.meanProbability}%</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{cat.leadTimeDays}d lead time</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

          <div className="pt-2 border-t border-slate-700 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Prescriptive Maintenance ROI: <strong>4.8x</strong></span>
            <span className="text-cyan-400 font-mono font-bold">Auto-Tuned PostGIS</span>
          </div>

        </div>

      </div>

    </div>
  );
};
