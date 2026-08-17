import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  Crown, 
  Shield, 
  CheckCircle2, 
  Key, 
  Clock, 
  Activity, 
  Radio, 
  FileCheck2, 
  Sliders, 
  Globe2, 
  Compass, 
  Check, 
  Lock,
  ArrowLeft
} from 'lucide-react';
import { UserProfile, AuthorityLevel, AuditLogItem } from '../types';
import { PRESET_DESTINATIONS } from './InteractiveEarthGlobe';

interface UserProfilePageProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  currentAuthority: AuthorityLevel;
  onOpenAuthorityModal: () => void;
  auditLogs: AuditLogItem[];
  onNavigate: (tab: 'landing' | 'command' | 'map' | 'globe' | 'copilot' | 'predictive' | 'incidents' | 'crews' | 'community' | 'analytics' | 'profile') => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  userProfile,
  onUpdateProfile,
  currentAuthority,
  onOpenAuthorityModal,
  auditLogs,
  onNavigate
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const handleSelectPresetCity = (cityId: string) => {
    const found = PRESET_DESTINATIONS.find(d => d.id === cityId);
    if (found) {
      const updated = {
        location: `${found.name}, ${found.country}`,
        country: found.country,
        coordinates: { lat: found.lat, lng: found.lng }
      };
      setFormData(prev => ({ ...prev, ...updated }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-indigo-400">
              <span>Commander Profile & Settings</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400">ID: {userProfile.badgeId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              User Account & Operations Settings
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAuthorityModal}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
              currentAuthority === 'SUPER_MONITOR'
                ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
            }`}
          >
            {currentAuthority === 'SUPER_MONITOR' ? <Crown className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            <span>Authority Clearance: <strong>{currentAuthority === 'SUPER_MONITOR' ? 'L2 Super Monitor' : 'L1 Monitor'}</strong></span>
          </button>
        </div>
      </div>

      {isSavedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Profile details updated successfully across all command modules.</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">SAVED TO LOCAL PERSISTENCE</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile Card & Quick Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/20">
                {userProfile.avatarInitials}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">{userProfile.name}</h2>
                <p className="text-xs text-indigo-400 font-semibold">{userProfile.role}</p>
                <p className="text-xs text-slate-400">{userProfile.agency}</p>
              </div>

              <div className="w-full pt-4 border-t border-slate-800 space-y-2 text-left text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Base Location:
                  </span>
                  <span className="font-bold text-white">{userProfile.location}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Compass className="w-3.5 h-3.5 text-indigo-400" /> Coordinates:
                  </span>
                  <span className="font-mono text-cyan-300">
                    {userProfile.coordinates.lat.toFixed(2)}°, {userProfile.coordinates.lng.toFixed(2)}°
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" /> Duty Status:
                  </span>
                  <span className="font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {userProfile.dutyStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Session Joined:
                  </span>
                  <span className="font-mono text-slate-400">{userProfile.joinedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Duty Status Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Change Active Duty Status</span>
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {[
                { status: 'ACTIVE_DUTY', label: 'Active Command Duty', color: 'text-emerald-400 border-emerald-800 bg-emerald-950/40' },
                { status: 'ON_CALL', label: 'On Call Response', color: 'text-cyan-400 border-cyan-800 bg-cyan-950/40' },
                { status: 'EMERGENCY_STANDBY', label: 'Emergency Standby', color: 'text-amber-400 border-amber-800 bg-amber-950/40' },
                { status: 'EXECUTIVE_COMMAND', label: 'Executive Command', color: 'text-purple-400 border-purple-800 bg-purple-950/40' }
              ].map((item) => (
                <button
                  key={item.status}
                  onClick={() => {
                    onUpdateProfile({ dutyStatus: item.status as any });
                    setFormData(prev => ({ ...prev, dutyStatus: item.status as any }));
                  }}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    userProfile.dutyStatus === item.status
                      ? `${item.color} shadow-lg`
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {userProfile.dutyStatus === item.status && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form & Activity Audit Logs */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-800">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Edit User Profile Information</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Commander Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      name: e.target.value,
                      avatarInitials: e.target.value.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || 'US'
                    })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Agency / Command Department
                  </label>
                  <input
                    type="text"
                    value={formData.agency}
                    onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Operating Base Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Badge ID Number
                  </label>
                  <input
                    type="text"
                    value={formData.badgeId}
                    onChange={(e) => setFormData({ ...formData, badgeId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Geographic Coordinates */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Operating Coordinates (Latitude & Longitude)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block mb-1">Latitude (°N)</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.coordinates.lat}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        coordinates: { ...formData.coordinates, lat: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block mb-1">Longitude (°E)</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.coordinates.lng}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        coordinates: { ...formData.coordinates, lng: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Select Presets */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-2">
                  Set Base Location from Preset Cities:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_DESTINATIONS.slice(0, 8).map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectPresetCity(city.id)}
                      className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-700 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>{city.flag} {city.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{city.lat.toFixed(0)}°N</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Updated Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Audit & Security Log Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Security & Command Sign-Off Logs</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                Audit Trail Active
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-slate-200">{log.actionTitle}</div>
                    <div className="text-[10px] text-slate-400">{log.targetEntity} • {log.actorName}</div>
                  </div>
                  <div className="text-right font-mono text-[10px]">
                    <span className="text-cyan-400">{log.timestamp}</span>
                    <div className="text-slate-500 truncate max-w-[120px]">{log.digitalSignature}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
