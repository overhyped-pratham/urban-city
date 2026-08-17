import React, { useState } from 'react';
import { 
  CloudRain, 
  Wind, 
  Waves, 
  AlertTriangle, 
  Bell, 
  Radio, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  Anchor, 
  Gauge, 
  ExternalLink,
  Volume2,
  Sparkles
} from 'lucide-react';
import { WeatherData } from '../types';

interface WindRainSurgeAlertBannerProps {
  weather: WeatherData | null;
  onTriggerPushAlert?: (title: string, message: string) => void;
  onOpenEmergencyBroadcast?: () => void;
  onViewMap?: () => void;
}

export const WindRainSurgeAlertBanner: React.FC<WindRainSurgeAlertBannerProps> = ({
  weather,
  onTriggerPushAlert,
  onOpenEmergencyBroadcast,
  onViewMap
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);

  if (!weather) return null;

  const precip = weather.precipitationMmPerHour || 62.5;
  const windSpeed = weather.windSpeedKmh || 58;
  const windGusts = weather.windGustsKmh || 88;
  const surgeHeight = weather.stormSurgeMeters || 4.85;

  const handleTriggerPush = () => {
    if (onTriggerPushAlert) {
      onTriggerPushAlert(
        '🔴 HIGH SURGE, WIND & RAIN RED ALERT',
        `Torrential precipitation (${precip}mm/hr), gale winds (${windGusts} km/h gusts), and astronomical high tide surge (+${surgeHeight}m) active across coastal zones. All seawall sluice gates engaged.`
      );
      setLastTriggered('Push notification sent to all active municipal command channels.');
      setTimeout(() => setLastTriggered(null), 4000);
    }
  };

  return (
    <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border-b-2 border-rose-600 shadow-2xl transition-all">
      {/* Top Main Emergency Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white">
        
        {/* Left Indicator & Ticker */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-2 rounded-xl bg-rose-600/30 border border-rose-500 text-rose-300 shadow-lg shadow-rose-600/20">
            <AlertTriangle className="w-5 h-5 animate-pulse text-rose-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide text-rose-200 uppercase font-mono flex items-center gap-1.5">
                <span>SEVERE WEATHER & HIGH SURGE RED ALERT</span>
                <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[10px] font-bold">LEVEL 4</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
              Astronomical tide (+{surgeHeight}m) + Torrential Rain ({precip}mm/h) + Gale Winds ({windGusts} km/h)
            </p>
          </div>
        </div>

        {/* Center Quick Live Telemetry Counters */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-rose-900/60 font-mono text-xs">
          
          {/* Heavy Rain */}
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-cyan-400 animate-bounce" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-tight">Rain Intensity</span>
              <span className="font-bold text-cyan-300">{precip} mm/hr</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Wind & Gusts */}
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-tight">Gale Winds</span>
              <span className="font-bold text-indigo-200">{windSpeed} / {windGusts} gust km/h</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* High Tide Surge */}
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-slate-400 block leading-tight">Tidal High Surge</span>
              <span className="font-bold text-amber-300">+{surgeHeight}m Chart Datum</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          
          {/* Trigger Push Notification */}
          <button
            onClick={handleTriggerPush}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/30 border border-rose-400/50 transition-all cursor-pointer"
            title="Dispatch High Surge & Wind Push Alert to Notification Center"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Push Surge Alert</span>
            <span className="sm:hidden">Push</span>
          </button>

          {/* Broadcast Alert */}
          {onOpenEmergencyBroadcast && (
            <button
              onClick={onOpenEmergencyBroadcast}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              title="Broadcast Cell-Emergency Citizen Advisory"
            >
              <Radio className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden md:inline">Cell Broadcast</span>
            </button>
          )}

          {/* Expand / Collapse Button */}
          <button
            onClick={() => setIsExpanded(prev => !prev)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse Alert Detail' : 'Expand High Surge Telemetry'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Expanded Detailed Telemetry Panel */}
      {isExpanded && (
        <div className="border-t border-rose-900/40 bg-slate-950/90 p-4 font-sans text-slate-200">
          <div className="max-w-7xl mx-auto space-y-3">
            
            {lastTriggered && (
              <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lastTriggered}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              
              {/* Rain Card */}
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-cyan-200 flex items-center justify-between gap-2">
                    <span>Heavy Downpour Warning</span>
                    <span className="text-[10px] font-mono text-cyan-400 font-normal">Active Radar</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Torrential monsoon rain measured at <strong className="text-white">{precip} mm/hr</strong>. Runoff capacity in Ward G-North and H-East at critical threshold.
                  </p>
                </div>
              </div>

              {/* Wind Card */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-indigo-200 flex items-center justify-between gap-2">
                    <span>Severe Gale Wind Red Alert</span>
                    <span className="text-[10px] font-mono text-indigo-400 font-normal">Beaufort Scale 9</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Sustained winds <strong className="text-white">{windSpeed} km/h</strong> with severe gusts hitting <strong className="text-white">{windGusts} km/h</strong>. Risk of tree falls and line trips.
                  </p>
                </div>
              </div>

              {/* Surge Card */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-amber-200 flex items-center justify-between gap-2">
                    <span>High Astronomical Surge</span>
                    <span className="text-[10px] font-mono text-amber-400 font-normal">Tide Peak</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Tidal surge reaching <strong className="text-white">+{surgeHeight}m</strong> chart datum. Seawater backflow threat along low-lying coastal outfalls.
                  </p>
                </div>
              </div>

              {/* Sluice Gate & Barrier Card */}
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                  <Anchor className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-rose-200 flex items-center justify-between gap-2">
                    <span>Coastal Sluice Gates Status</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Auto-Engaged</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    Tidal gates #1-#8 closed to block ocean backflow. Dewatering pump barges positioned along outfall points.
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Map Link */}
            {onViewMap && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={onViewMap}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open GIS Storm Surge Overlay Map</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
