import React, { useState } from 'react';
import { 
  Globe, 
  LayoutDashboard, 
  Sparkles, 
  ShieldAlert, 
  Waves, 
  Truck, 
  Users, 
  MapPin, 
  User, 
  Briefcase, 
  Building2, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Radio, 
  Sliders, 
  ChevronRight,
  Satellite,
  BarChart3,
  Award,
  Zap,
  Eye,
  Lock,
  Globe2,
  Cpu
} from 'lucide-react';
import { UserProfile, AuthorityLevel } from '../types';
import { PRESET_DESTINATIONS } from './InteractiveEarthGlobe';

interface LandingPageProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onNavigate: (tab: 'landing' | 'command' | 'map' | 'globe' | 'copilot' | 'predictive' | 'incidents' | 'crews' | 'community' | 'analytics' | 'profile' | 'controlnet') => void;
  currentAuthority: AuthorityLevel;
  onOpenAuthorityModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  userProfile,
  onUpdateProfile,
  onNavigate,
  currentAuthority,
  onOpenAuthorityModal
}) => {
  const [isEditingForm, setIsEditingForm] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });
  const [selectedPresetCityId, setSelectedPresetCityId] = useState<string>('beijing');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditingForm(false);
  };

  const handleSelectPresetCity = (cityId: string) => {
    const found = PRESET_DESTINATIONS.find(d => d.id === cityId);
    if (found) {
      setSelectedPresetCityId(cityId);
      const updated = {
        location: `${found.name}, ${found.country}`,
        country: found.country,
        coordinates: { lat: found.lat, lng: found.lng }
      };
      setFormData(prev => ({ ...prev, ...updated }));
      onUpdateProfile(updated);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pb-12">
      
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-gradient-to-b from-indigo-950/40 via-slate-950 to-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Top Status & Authority Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-900/40 border border-indigo-700/50 text-xs text-indigo-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>GLOBAL RESILIENCE AI OS • ONLINE v4.8</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenAuthorityModal}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Clearance: <strong className="text-white">{currentAuthority === 'SUPER_MONITOR' ? 'L2 Super Monitor' : 'L1 Monitor'}</strong></span>
              </button>
            </div>
          </div>

          {/* Hero Headlines */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-semibold">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                <span>Global Multi-City Emergency & Urban Resiliency OS</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">Urban Resilience AI</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                A unified multi-page intelligence portal connecting 3D Earth digital twin telemetry, AI-driven flood prediction, live satellite waterlogging scans, and real-time emergency crew dispatch.
              </p>

              {/* User Profile Overview Pill */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-900/60 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
                    {userProfile.avatarInitials}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <span>{userProfile.role}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-400 font-bold">{userProfile.dutyStatus.replace('_', ' ')}</span>
                    </div>
                    <div className="text-base font-bold text-white flex items-center gap-2">
                      <span>{userProfile.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                        {userProfile.badgeId}
                      </span>
                    </div>
                    <div className="text-xs text-cyan-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Operating Base: <strong>{userProfile.location}</strong> ({userProfile.coordinates.lat.toFixed(2)}°, {userProfile.coordinates.lng.toFixed(2)}°)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingForm(prev => !prev)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isEditingForm ? 'Hide Details Form' : 'Update User Details'}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('globe')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Launch 3D Globe</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* User Details Registration & Editing Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-bold text-white">Commander Profile Details</h2>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Active Session
                  </span>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value, avatarInitials: e.target.value.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || 'US' })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        placeholder="Enter commander name"
                        required
                      />
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Role / Designation
                      </label>
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. Chief Resiliency Officer"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Agency / Department
                      </label>
                      <input
                        type="text"
                        value={formData.agency}
                        onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. Water Command"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Operating Location
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        placeholder="City, Country"
                        required
                      />
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Preset Quick Select for Cities */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1.5">
                      Quick Teleport Home Base City:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PRESET_DESTINATIONS.slice(0, 6).map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => handleSelectPresetCity(city.id)}
                          className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all flex items-center justify-between ${
                            selectedPresetCityId === city.id || formData.location.includes(city.name)
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <span className="truncate">{city.flag} {city.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save & Apply User Profile</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Pages & System Sections Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-400 mb-1">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Multi-Page Navigation Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Explore System Webpages & Operations Modules
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Access specific intelligence sections, real-time monitors, and emergency dispatch modules tailored for <strong>{userProfile.name}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Featured ML Model Card: ControlNet Satellite Reconstruction */}
          <div 
            onClick={() => onNavigate('controlnet')}
            className="group bg-gradient-to-b from-indigo-950/80 to-slate-900 border border-cyan-500/60 hover:border-cyan-400 rounded-3xl p-6 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-3 ring-1 ring-cyan-500/30"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                  <Cpu className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase font-bold">
                      Integrated ML Model
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      github.com/overhyped-pratham/controlnet-satellite-reconstruction
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2 mt-1">
                    <span>ControlNet Satellite Reconstruction Engine</span>
                    <ChevronRight className="w-5 h-5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-cyan-600 group-hover:bg-cyan-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2 whitespace-nowrap">
                <span>Launch ControlNet Model Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <p className="text-slate-300 text-xs mt-3 leading-relaxed max-w-4xl">
              Deep learning satellite image reconstruction conditioned on Digital Elevation Models (DEM), 3D building heights, cloud removal algorithms, and sub-surface flood inundation maps. Reconstructs high-definition terrain elevation with sub-meter accuracy.
            </p>
          </div>

          {/* Page 1: 3D Digital Earth Globe */}
          <div 
            onClick={() => onNavigate('globe')}
            className="group bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 rounded-3xl p-6 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                  WebGL 3D Twin
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                <span>3D Digital Earth Globe</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
              </h3>

              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Interactive WebGL globe with high-speed camera flights, global city telemetry, regional hubs (Beijing, Shanghai, Shenzhen), atmosphere shaders & GeoJSON borders.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-semibold">
              <span>Launch 3D Explorer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Page 2: City Command Dashboard */}
          <div 
            onClick={() => onNavigate('command')}
            className="group bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 rounded-3xl p-6 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase">
                  Central GIS
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors flex items-center gap-2">
                <span>City Command Center</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400" />
              </h3>

              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Primary GIS map overview with real-time waterlogging sensor feeds, automated sluice gate status, and city ward resilience indicators.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-indigo-400 font-semibold">
              <span>View City Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Page 3: Live GIS Map */}
          <div 
            onClick={() => onNavigate('map')}
            className="group bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 rounded-3xl p-6 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                  Leaflet Map
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                <span>Interactive GIS Map</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
              </h3>

              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Leaflet-powered satellite & street topography map, ward polygon risk heatmap layers, live sensor telemetry pins, and historical trend filters.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Open GIS Map Page</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Page 4: AI Resiliency Copilot */}
          <div 
            onClick={() => onNavigate('copilot')}
            className="group bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 rounded-3xl p-6 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 uppercase">
                  Gemini AI
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                <span>AI Resiliency Copilot</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400" />
              </h3>

              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Natural language query engine powered by Gemini AI. Ask questions about urban waterlogging, crew dispatch orders, and sluice gate overrides.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-purple-400 font-semibold">
              <span>Chat with AI Copilot</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Page 5: Predictive Flood & Heatwave Engine */}
          <div 
            onClick={() => onNavigate('predictive')}
            className="group bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-3xl p-6 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Waves className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 uppercase">
                  AI Forecasting
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-2">
                <span>Predictive Risk Hub</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
              </h3>

              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Hydrological machine learning models calculating 6-36 hour flood inundation risks, heatwave warnings, and ground subsidence vectors.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-semibold">
              <span>View Predictive Hub</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Page 6: Incident Management & Dispatch */}
          <div 
            onClick={() => onNavigate('incidents')}
            className="group bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 rounded-3xl p-6 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800 uppercase">
                  Emergency Desk
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors flex items-center gap-2">
                <span>Incident Operations & Dispatch</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-rose-400" />
              </h3>

              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Live incident triage queue, automated severity classification, emergency work order generator, and 2-Level Executive approval signatures.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-rose-400 font-semibold">
              <span>View Active Incidents</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* Footer Credentials */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-slate-400">Urban Resilience OS • Logged in as <strong>{userProfile.name}</strong> ({userProfile.location})</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => onNavigate('profile')} className="hover:text-white transition-colors cursor-pointer">Profile Settings</button>
            <span>•</span>
            <button onClick={() => onNavigate('globe')} className="hover:text-white transition-colors cursor-pointer">3D Earth Twin</button>
            <span>•</span>
            <button onClick={() => onNavigate('command')} className="hover:text-white transition-colors cursor-pointer">Command Center</button>
          </div>
        </div>
      </footer>

    </div>
  );
};
