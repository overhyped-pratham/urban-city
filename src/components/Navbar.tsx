import React from 'react';
import { 
  Radio, 
  Satellite, 
  Map, 
  Globe,
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
  AlertTriangle,
  LayoutDashboard,
  BrainCircuit,
  Waves,
  Shield,
  Crown,
  FileCheck2,
  Home,
  User,
  MapPin,
  Cpu
} from 'lucide-react';
import { WeatherData, NotificationItem, CityHealthOverview, AuthorityLevel, UserProfile } from '../types';
import { AUTHORITY_USERS } from '../data/mockData';

interface NavbarProps {
  activeTab: 'landing' | 'command' | 'map' | 'globe' | 'copilot' | 'predictive' | 'incidents' | 'crews' | 'community' | 'analytics' | 'profile' | 'controlnet';
  setActiveTab: (tab: 'landing' | 'command' | 'map' | 'globe' | 'copilot' | 'predictive' | 'incidents' | 'crews' | 'community' | 'analytics' | 'profile' | 'controlnet') => void;
  userProfile?: UserProfile;
  weather: WeatherData | null;
  cityHealth?: CityHealthOverview;
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
  currentAuthority: AuthorityLevel;
  onOpenAuthorityModal: () => void;
  pendingApprovalsCount: number;
  onOpenApprovalQueue: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  weather,
  cityHealth,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenSatelliteAnalyzer,
  onOpenEmergencyBroadcast,
  soundEnabled,
  setSoundEnabled,
  isRefreshing,
  onRefresh,
  criticalIncidentsCount,
  currentAuthority,
  onOpenAuthorityModal,
  pendingApprovalsCount,
  onOpenApprovalQueue
}) => {
  const activeUser = AUTHORITY_USERS[currentAuthority];
  const isSuperMonitor = currentAuthority === 'SUPER_MONITOR';

  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-2.5 shadow-xl text-slate-100">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & User Details Indicator */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  Urban Resilience <span className="text-indigo-400 text-xs px-1.5 py-0.5 bg-indigo-950/80 border border-indigo-700/60 rounded font-mono">AI OS</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <span>Predictive Municipal Intelligence</span>
              </p>
            </div>
          </div>

          {/* Persistent User Badge Button */}
          {userProfile && (
            <button
              onClick={() => setActiveTab('profile')}
              className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-left"
              title="Click to manage User Profile & Operating Location"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {userProfile.avatarInitials}
              </div>
              <div className="text-[11px] leading-tight">
                <div className="font-bold text-slate-200 truncate max-w-[110px]">{userProfile.name}</div>
                <div className="text-[9px] text-cyan-400 flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                  <span className="truncate max-w-[100px]">{userProfile.location}</span>
                </div>
              </div>
            </button>
          )}

          {/* Quick status pill for mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAuthorityModal}
              className={`p-1.5 rounded-lg border flex items-center gap-1 text-[10px] font-bold ${
                isSuperMonitor
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-cyan-950 text-cyan-300 border-cyan-800'
              }`}
            >
              {isSuperMonitor ? <Crown className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
              <span>{isSuperMonitor ? 'L2 Super' : 'L1 Monitor'}</span>
            </button>

            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
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

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          
          <button
            id="nav-tab-landing"
            onClick={() => setActiveTab('landing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'landing'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-indigo-300" />
            Home
          </button>

          <button
            id="nav-tab-globe"
            onClick={() => setActiveTab('globe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'globe'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-300" />
            3D Globe
          </button>

          <button
            id="nav-tab-command"
            onClick={() => setActiveTab('command')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'command'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            City Command
          </button>

          <button
            id="nav-tab-map"
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'map'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            GIS Map
          </button>

          <button
            id="nav-tab-controlnet"
            onClick={() => setActiveTab('controlnet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'controlnet'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md font-bold ring-1 ring-cyan-400'
                : 'text-cyan-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-300" />
            ControlNet ML
          </button>

          <button
            id="nav-tab-copilot"
            onClick={() => setActiveTab('copilot')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'copilot'
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            AI Copilot
          </button>

          <button
            id="nav-tab-predictive"
            onClick={() => setActiveTab('predictive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'predictive'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            Predictive Hub
          </button>

          <button
            id="nav-tab-incidents"
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'incidents'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Incidents
            {criticalIncidentsCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full font-bold bg-rose-500 text-white">
                {criticalIncidentsCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-profile"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5 text-cyan-400" />
            Profile
          </button>

          <button
            id="nav-tab-community"
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'community'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Citizen NLP
          </button>

          <button
            id="nav-tab-crews"
            onClick={() => setActiveTab('crews')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'crews'
                ? 'bg-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Dispatch
          </button>
        </nav>

        {/* Action Controls & Authority Badge */}
        <div className="hidden md:flex items-center gap-2">
          
          {/* 2-LEVEL AUTHORITY BADGE BUTTON */}
          <button
            id="btn-authority-switch"
            onClick={onOpenAuthorityModal}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm group ${
              isSuperMonitor
                ? 'bg-amber-950/80 hover:bg-amber-900/90 text-amber-200 border-amber-700/80 shadow-amber-500/10'
                : 'bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-200 border-cyan-700/80 shadow-cyan-500/10'
            }`}
            title="Click to switch or view 2-Level Authority clearance"
          >
            <div className={`p-1 rounded-lg ${
              isSuperMonitor ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
            }`}>
              {isSuperMonitor ? <Crown className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left leading-tight">
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <span>{isSuperMonitor ? 'Level 2' : 'Level 1'}</span>
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-xs font-bold text-white group-hover:text-amber-200 transition-colors">
                {isSuperMonitor ? 'Super Monitor' : 'Monitor'}
              </div>
            </div>
          </button>

          {/* Pending Approvals Hub Button */}
          <button
            id="btn-approval-queue"
            onClick={onOpenApprovalQueue}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              pendingApprovalsCount > 0
                ? 'bg-rose-950/70 hover:bg-rose-900/80 text-rose-200 border-rose-700/80'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Open Emergency Approval Ledger & Escalation Queue"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-indigo-300" />
            <span>Escalations</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          {/* AI Satellite Scan Launcher */}
          <button
            id="btn-scan-satellite"
            onClick={onOpenSatelliteAnalyzer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 border border-indigo-400/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            Satellite Scan
          </button>

          {/* Emergency Municipal Broadcast */}
          <button
            id="btn-emergency-broadcast"
            onClick={onOpenEmergencyBroadcast}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 text-xs font-semibold transition-all cursor-pointer shadow-md"
            title="Send Emergency Municipal Citizen Warning"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Broadcast Alert
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Notification bell */}
          <button
            id="btn-notifications-drawer"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="View Real-Time Push Notifications"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full shadow-lg">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
