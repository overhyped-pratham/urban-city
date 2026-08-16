import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Droplets, 
  Flame, 
  Waves, 
  Trash2, 
  Construction, 
  Users, 
  BellRing, 
  ArrowUpRight, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  Compass,
  MapPin,
  ExternalLink,
  Radio
} from 'lucide-react';
import { CityHealthOverview, WardRiskProfile, PredictiveFloodForecast, SegFormerSARWaterlogging } from '../types';
import { INITIAL_SAR_WATERLOGGING } from '../data/mockData';
import { LiveWaterloggingMonitor } from './LiveWaterloggingMonitor';

interface CityCommandDashboardProps {
  cityHealth: CityHealthOverview;
  wardProfiles: WardRiskProfile[];
  floodForecast: PredictiveFloodForecast;
  sarData?: SegFormerSARWaterlogging;
  onNavigateTab: (tab: any) => void;
  onSelectWard: (ward: WardRiskProfile) => void;
  onTriggerQuickAction: (action: string) => void;
}

export const CityCommandDashboard: React.FC<CityCommandDashboardProps> = ({
  cityHealth,
  wardProfiles,
  floodForecast,
  sarData = INITIAL_SAR_WATERLOGGING,
  onNavigateTab,
  onSelectWard,
  onTriggerQuickAction,
}) => {
  const [selectedVector, setSelectedVector] = useState<'ALL' | 'FLOOD' | 'HEAT' | 'WATER' | 'WASTE' | 'ROAD'>('ALL');
  const [simulating, setSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);

  const handleRunSimulation = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setSimulationComplete(true);
      setTimeout(() => setSimulationComplete(false), 5000);
    }, 1800);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Core Philosophy */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 p-6 shadow-xl text-white">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Unified City Intelligence Layer
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Urban Resilience AI Operating System
            </h1>
            <p className="text-slate-300 text-sm italic">
              &ldquo;Don’t wait for the city to break. Predict what will break next.&rdquo;
            </p>
            <p className="text-xs text-slate-400">
              Synthesizing real-time Doppler radar, satellite thermal/SAR passes, 450+ IoT culvert sensors, YOLOv11 pavement scans, and citizen reports into proactive municipal interventions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('copilot')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Launch AI Command Copilot
            </button>
            <button
              onClick={handleRunSimulation}
              disabled={simulating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-xs transition-all active:scale-95 disabled:opacity-50"
            >
              {simulating ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-amber-400" />
                  Running 6-Hour Forecast...
                </>
              ) : simulationComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Simulation Updated
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-indigo-400" />
                  Simulate Monsoon Impact (TimesFM)
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Row: City Health Score + 5 Core Risk Vectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* City Health Score Card */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              City Health Score
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Elevated Stress
            </span>
          </div>

          <div className="my-4 flex items-baseline gap-3">
            <span className="text-5xl font-black tracking-tight text-slate-900">
              {cityHealth.overallScore}
            </span>
            <span className="text-lg font-medium text-slate-400">/ 100</span>
            <span className="text-xs text-rose-600 font-semibold inline-flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> -4.2% today
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full" 
                style={{ width: `${cityHealth.overallScore}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Diagnosis:</strong> Multiple overlapping pressures in Ward 4 &amp; Ward 12. Monsoon surge expected at 18:00 hrs.
            </p>
          </div>
        </div>

        {/* 1. Flood Risk */}
        <div 
          onClick={() => setSelectedVector('FLOOD')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all hover:border-cyan-400 ${
            selectedVector === 'FLOOD' ? 'bg-cyan-50/50 border-cyan-500 ring-2 ring-cyan-200' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Waves className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
              HIGH
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">Flood Risk</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{cityHealth.floodRisk}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-cyan-600 h-full rounded-full" style={{ width: `${cityHealth.floodRisk}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Peak: 6:00–9:00 PM</p>
        </div>

        {/* 2. Heat Risk */}
        <div 
          onClick={() => setSelectedVector('HEAT')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all hover:border-amber-400 ${
            selectedVector === 'HEAT' ? 'bg-amber-50/50 border-amber-500 ring-2 ring-amber-200' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">
              MOD
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">Heat Risk</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{cityHealth.heatRisk}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${cityHealth.heatRisk}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Peak 44.2°C ambient</p>
        </div>

        {/* 3. Water Stress */}
        <div 
          onClick={() => setSelectedVector('WATER')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all hover:border-blue-400 ${
            selectedVector === 'WATER' ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-200' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Droplets className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
              MOD
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">Water Security</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{cityHealth.waterRisk}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${cityHealth.waterRisk}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Reservoirs at 48.2%</p>
        </div>

        {/* 4. Waste & Roads */}
        <div 
          onClick={() => setSelectedVector('ROAD')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-sm transition-all hover:border-orange-400 ${
            selectedVector === 'ROAD' ? 'bg-orange-50/50 border-orange-500 ring-2 ring-orange-200' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
              <Construction className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
              P1
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">Road Degradation</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{cityHealth.roadRisk}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${cityHealth.roadRisk}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">12 Critical Potholes</p>
        </div>
      </div>

      {/* Near-Real-Time Satellite Waterlogging Monitor (SegFormer-B2 + Sentinel-1 SAR) */}
      <LiveWaterloggingMonitor
        sarData={sarData}
        onViewOnMap={() => onNavigateTab('map')}
        onDispatchCrew={(ward) => onNavigateTab('crews')}
      />

      {/* Middle Grid: TimesFM Flood Forecast + AI Recommended Preventive Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flood Probability & Timeline Card */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <h3 className="font-bold text-slate-900 text-base">
                  TimesFM Flood Early-Warning Forecast
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                AI pipeline combining satellite precipitation, digital elevation models, and culvert flow telemetry
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-lg font-bold">
                Flood Probability: {floodForecast.probability}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500">Expected Rainfall Total</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{floodForecast.expectedRainfallTotalMm} mm</p>
              <p className="text-[11px] text-rose-600 font-medium mt-1">Convective Monsoon Core</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500">Expected Peak Timing</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{floodForecast.peakHours}</p>
              <p className="text-[11px] text-amber-600 font-medium mt-1">High-Tide Confluence (19:40)</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500">Soil Saturation Index</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{floodForecast.soilSaturationPercentage}%</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Immediate Runoff Threshold</p>
            </div>
          </div>

          {/* Timeline Bars */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Forecast Timeline (Inundation Risk)</span>
              <span>Runoff Volume (L/s)</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {floodForecast.timeline.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700">{item.time}</span>
                  <div className="w-full bg-slate-200 h-16 rounded-lg relative overflow-hidden flex items-end">
                    <div 
                      className={`w-full transition-all rounded-b-lg ${
                        item.inundationRisk > 75 
                          ? 'bg-gradient-to-t from-rose-600 to-rose-400' 
                          : item.inundationRisk > 50 
                          ? 'bg-gradient-to-t from-amber-500 to-amber-400'
                          : 'bg-gradient-to-t from-cyan-500 to-cyan-400'
                      }`}
                      style={{ height: `${item.inundationRisk}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-800 drop-shadow-sm">
                      {item.inundationRisk}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{item.rainfallMm}mm</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Target Wards:</span>
              {floodForecast.highRiskWards.map((w, i) => (
                <span key={i} className="text-xs px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md font-medium">
                  {w}
                </span>
              ))}
            </div>
            <button
              onClick={() => onNavigateTab('predictive')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              Open Predictive Engine <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* AI Actionable Recommendations (Decision Support) */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 text-white p-6 shadow-sm flex flex-col justify-between border border-slate-800">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-base">
                  Preventive AI Actions
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                Decision Support Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 mb-4">
              AI recommendations answering: <em>&ldquo;What should municipal authorities do right now?&rdquo;</em>
            </p>

            <div className="space-y-2.5">
              {floodForecast.aiRecommendedActions.slice(0, 4).map((action, idx) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs flex items-start gap-2.5 hover:bg-slate-800 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-slate-200 leading-snug">{action}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
            <button
              onClick={() => onNavigateTab('crews')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Authorize &amp; Pre-Position Crews
            </button>
          </div>
        </div>
      </div>

      {/* Ward Resilience Risk Scoring Matrix */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              Unified Ward Resilience Scoreboard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-vector risk index calculated from Flood + Heat + Water + Waste + Road telemetry
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('map')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              View GIS Map Layers
            </button>
          </div>
        </div>

        {/* Table of Wards */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">Ward &amp; Zone</th>
                <th className="pb-3">Overall Risk</th>
                <th className="pb-3">🌊 Flood</th>
                <th className="pb-3">🌡️ Heat</th>
                <th className="pb-3">💧 Water</th>
                <th className="pb-3">🗑️ Waste</th>
                <th className="pb-3">🛣️ Roads</th>
                <th className="pb-3">Recommended Preventive Directive</th>
                <th className="pb-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {wardProfiles.map((ward) => (
                <tr 
                  key={ward.wardId}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => onSelectWard(ward)}
                >
                  <td className="py-3.5 pl-2 font-semibold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span>{ward.wardName}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-normal">{ward.zone} • Pop: {(ward.population / 1000).toFixed(0)}k</span>
                  </td>

                  <td className="py-3.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-800">
                      <span className={`w-2 h-2 rounded-full ${
                        ward.currentRiskScore > 80 ? 'bg-rose-500' : ward.currentRiskScore > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      {ward.currentRiskScore}
                    </div>
                  </td>

                  <td className="py-3.5 font-medium">
                    <span className={ward.floodRiskScore > 75 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                      {ward.floodRiskScore}%
                    </span>
                  </td>

                  <td className="py-3.5 font-medium">
                    <span className={ward.heatRiskScore > 70 ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                      {ward.heatRiskScore}%
                    </span>
                  </td>

                  <td className="py-3.5 font-medium">
                    <span className={ward.waterRiskScore > 75 ? 'text-blue-600 font-bold' : 'text-slate-600'}>
                      {ward.waterRiskScore}%
                    </span>
                  </td>

                  <td className="py-3.5 font-medium">
                    <span className={ward.wasteRiskScore > 70 ? 'text-orange-600 font-bold' : 'text-slate-600'}>
                      {ward.wasteRiskScore}%
                    </span>
                  </td>

                  <td className="py-3.5 font-medium">
                    <span className={ward.roadRiskScore > 75 ? 'text-purple-600 font-bold' : 'text-slate-600'}>
                      {ward.roadRiskScore}%
                    </span>
                  </td>

                  <td className="py-3.5 text-slate-600 max-w-xs truncate pr-3">
                    {ward.recommendedAction}
                  </td>

                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWard(ward);
                        onNavigateTab('map');
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      Inspect Ward
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
