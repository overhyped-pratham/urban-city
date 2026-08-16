import React from 'react';
import { 
  Radio, 
  Satellite, 
  Map, 
  Users, 
  BarChart3, 
  Truck, 
  Bell, 
  ShieldAlert, 
  CloudRain, 
  Volume2, 
  VolumeX,
  Sparkles,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { WeatherData, NotificationItem } from '../types';

interface NavbarProps {
  activeTab: 'map' | 'incidents' | 'crews' | 'analytics' | 'community';
  setActiveTab: (tab: 'map' | 'incidents' | 'crews' | 'analytics' | 'community') => void;
  weather: WeatherData | null;
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenSatelliteAnalyzer: () => void;
  onOpenEmergencyBroadcast: () => void;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isRefreshing: boolean;
  onRefresh: () => void;
  criticalIncidentsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  weather,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenSatelliteAnalyzer,
  onOpenEmergencyBroadcast,
  soundEnabled,
  setSoundEnabled,
  isRefreshing,
  onRefresh,
  criticalIncidentsCount
}) => {
  return (
    <header className="bg-[#0d1117]/95 backdrop-blur-md border-b border-[#21262d] sticky top-0 z-40 px-4 py-2.5 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Live Satellite Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/10">
              <Satellite className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-[#f0f6fc] flex items-center gap-1.5">
                  UrbanWatch <span className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-800/60 rounded">SENTINEL</span>
                </span>
              </div>
              <p className="text-[11px] text-[#8b949e] font-mono flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse inline" />
                MUNICIPAL SATELLITE & DISPATCH COMMAND
              </p>
            </div>
          </div>

          {/* Quick status pill for mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[#c9d1d9] hover:text-white"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {unreadNotifsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* View Switcher Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#05060a]/90 p-1 rounded-xl border border-[#21262d] overflow-x-auto max-w-full">
          <button
            id="nav-tab-map"
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'map'
                ? 'bg-cyan-500 text-[#05060a] shadow-md shadow-cyan-500/20 font-bold'
                : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            GIS Satellite Map
          </button>

          <button
            id="nav-tab-incidents"
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'incidents'
                ? 'bg-cyan-500 text-[#05060a] shadow-md shadow-cyan-500/20 font-bold'
                : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Incident Reports
            {criticalIncidentsCount > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${activeTab === 'incidents' ? 'bg-[#0d1117] text-rose-400' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}>
                {criticalIncidentsCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-crews"
            onClick={() => setActiveTab('crews')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'crews'
                ? 'bg-cyan-500 text-[#05060a] shadow-md shadow-cyan-500/20 font-bold'
                : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Crew Dispatch
          </button>

          <button
            id="nav-tab-community"
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'community'
                ? 'bg-cyan-500 text-[#05060a] shadow-md shadow-cyan-500/20 font-bold'
                : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Citizen Verifications
          </button>

          <button
            id="nav-tab-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-500 text-[#05060a] shadow-md shadow-cyan-500/20 font-bold'
                : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Historical Trends
          </button>
        </nav>

        {/* Action Controls & Telemetry */}
        <div className="hidden md:flex items-center gap-2.5">
          
          {/* Weather radar tag */}
          {weather && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#05060a]/90 border border-[#21262d] text-xs font-mono">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
              <span className="text-[#c9d1d9] font-medium">{weather.precipitationMmPerHour} mm/h</span>
              <span className="text-[10px] text-amber-400 uppercase font-semibold bg-amber-950/50 px-1 py-0.2 rounded border border-amber-800/50">
                Monsoon Alert
              </span>
            </div>
          )}

          {/* AI Satellite Scan Launcher */}
          <button
            id="btn-scan-satellite"
            onClick={onOpenSatelliteAnalyzer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 border border-cyan-400/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            AI Satellite Scan
          </button>

          {/* Emergency Municipal Broadcast */}
          <button
            id="btn-emergency-broadcast"
            onClick={onOpenEmergencyBroadcast}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border border-rose-700/60 text-xs font-semibold transition-all cursor-pointer shadow-md shadow-rose-950/30"
            title="Send Emergency Municipal Citizen Warning"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Broadcast Alert
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className="p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[#c9d1d9] hover:text-white transition-colors"
            title={soundEnabled ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-[#8b949e]" />}
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[#c9d1d9] hover:text-white transition-colors disabled:opacity-50"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Notification bell */}
          <button
            id="btn-notifications-drawer"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[#c9d1d9] hover:text-white transition-colors"
            title="View Real-Time Push Notifications"
          >
            <Bell className="w-4 h-4 text-[#c9d1d9]" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full shadow-lg shadow-rose-500/50">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
