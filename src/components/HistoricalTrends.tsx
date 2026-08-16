import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Droplets, 
  Zap, 
  Calendar, 
  MapPin,
  Activity,
  Layers
} from 'lucide-react';
import { WardRiskProfile, Incident } from '../types';
import { WARD_RISK_PROFILES } from '../data/mockData';

interface HistoricalTrendsProps {
  incidents: Incident[];
}

export const HistoricalTrends: React.FC<HistoricalTrendsProps> = ({ incidents }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Realistic historical trend data
  const hourlyTrends = [
    { time: '04:00', waterlogging: 0, powerOutages: 0, drainageBlock: 1, rainMm: 4 },
    { time: '05:00', waterlogging: 1, powerOutages: 0, drainageBlock: 1, rainMm: 12 },
    { time: '06:00', waterlogging: 4, powerOutages: 1, drainageBlock: 2, rainMm: 28 },
    { time: '07:00', waterlogging: 8, powerOutages: 3, drainageBlock: 5, rainMm: 52 },
    { time: '08:00', waterlogging: 14, powerOutages: 6, drainageBlock: 7, rainMm: 64 },
    { time: '09:00', waterlogging: 11, powerOutages: 5, drainageBlock: 6, rainMm: 45 },
    { time: '10:00', waterlogging: 7, powerOutages: 3, drainageBlock: 4, rainMm: 30 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header with Time Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Historical Trends & Municipal Vulnerability Analytics
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Spatial Inundation Recurrence, Grid Resiliency, & Resolution Benchmarks
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
          {(['24h', '7d', '30d'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === t
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Past {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Performance Benchmarks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mean Time to Dispatch</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-400">9.4 min</div>
          <span className="text-[11px] text-emerald-400 font-mono">↓ 24% faster with Satellite AI</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mean Time to Resolution</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-300">42.8 min</div>
          <span className="text-[11px] text-emerald-400 font-mono">↓ 18% improvement</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Satellite AI Precision</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300">96.2%</div>
          <span className="text-[11px] text-slate-400 font-mono">Corroborated by ground crews</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Drainage Inundation Index</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-400">0.72 NDWI</div>
          <span className="text-[11px] text-amber-400 font-mono">High flood probability</span>
        </div>

      </div>

      {/* Hourly Incident & Rain Graph */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Temporal Incident Surge vs. Precipitation Intensity (mm/h)
          </h3>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /> Waterlogging
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Grid Outages
            </span>
            <span className="flex items-center gap-1.5 text-blue-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Rain Rate (mm/h)
            </span>
          </div>
        </div>

        {/* Custom Visual Bar Chart */}
        <div className="space-y-3 pt-2">
          {hourlyTrends.map((h, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{h.time}</span>
                <span>Rainfall: <strong className="text-blue-300">{h.rainMm} mm/h</strong></span>
              </div>
              <div className="h-6 w-full bg-slate-950 rounded-lg overflow-hidden flex items-center p-0.5 gap-1 border border-slate-800">
                {/* Waterlogging segment */}
                <div
                  style={{ width: `${Math.min(h.waterlogging * 5, 50)}%` }}
                  className="h-full bg-sky-500 rounded text-[10px] font-mono text-slate-950 font-bold flex items-center px-1.5 transition-all"
                  title={`Waterlogging: ${h.waterlogging} incidents`}
                >
                  {h.waterlogging > 0 ? `${h.waterlogging} Water` : ''}
                </div>
                {/* Power Outage segment */}
                <div
                  style={{ width: `${Math.min(h.powerOutages * 5, 30)}%` }}
                  className="h-full bg-amber-500 rounded text-[10px] font-mono text-slate-950 font-bold flex items-center px-1.5 transition-all"
                  title={`Power Outages: ${h.powerOutages} incidents`}
                >
                  {h.powerOutages > 0 ? `${h.powerOutages} Grid` : ''}
                </div>
                {/* Drainage Block segment */}
                <div
                  style={{ width: `${Math.min(h.drainageBlock * 5, 20)}%` }}
                  className="h-full bg-purple-500 rounded text-[10px] font-mono text-white font-bold flex items-center px-1.5 transition-all"
                  title={`Drainage Clogs: ${h.drainageBlock} incidents`}
                >
                  {h.drainageBlock > 0 ? `${h.drainageBlock} Drain` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Municipal Ward Vulnerability Matrix Table */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Municipal Ward Vulnerability & Infrastructure Health Index
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Ward / Zone</th>
                <th className="p-3">Risk Score</th>
                <th className="p-3">Active Floods</th>
                <th className="p-3">Grid Outages</th>
                <th className="p-3">Drainage Capacity</th>
                <th className="p-3">Transformer Health</th>
                <th className="p-3">Flood Vulnerability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {WARD_RISK_PROFILES.map(ward => {
                const isHighRisk = ward.currentRiskScore >= 80;

                return (
                  <tr key={ward.wardId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-white">
                      {ward.wardName}
                      <span className="block text-[10px] text-slate-500">{ward.zone} • Pop: {ward.population.toLocaleString()}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        isHighRisk ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {ward.currentRiskScore}/100
                      </span>
                    </td>
                    <td className="p-3 text-sky-400 font-bold">{ward.activeWaterloggingCount}</td>
                    <td className="p-3 text-amber-400 font-bold">{ward.activePowerOutageCount}</td>
                    <td className="p-3 text-slate-300">
                      <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden inline-block mr-2 align-middle">
                        <div
                          style={{ width: `${ward.drainageCapacityPercentage}%` }}
                          className={`h-full ${ward.drainageCapacityPercentage < 40 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        />
                      </div>
                      {ward.drainageCapacityPercentage}%
                    </td>
                    <td className="p-3 text-slate-300">{ward.transformerHealthScore}%</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold ${
                        ward.historicalFloodVulnerability === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {ward.historicalFloodVulnerability}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
