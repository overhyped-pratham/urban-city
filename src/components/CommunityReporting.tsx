import React, { useState } from 'react';
import { 
  Users, 
  Camera, 
  MapPin, 
  ThumbsUp, 
  CheckCircle2, 
  AlertCircle, 
  Droplets, 
  Zap, 
  Upload, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  Send
} from 'lucide-react';
import { CitizenReport, IncidentCategory, Incident } from '../types';
import confetti from 'canvas-confetti';

interface CommunityReportingProps {
  reports: CitizenReport[];
  incidents: Incident[];
  onSubmitReport: (reportData: Partial<CitizenReport>) => void;
  onVerifyReport: (reportId: string) => void;
}

export const CommunityReporting: React.FC<CommunityReportingProps> = ({
  reports,
  incidents,
  onSubmitReport,
  onVerifyReport
}) => {
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('Ward G-North');
  const [category, setCategory] = useState<IncidentCategory>('WATER_LOGGING');
  const [waterLevel, setWaterLevel] = useState<'ANKLE_DEEP' | 'KNEE_DEEP' | 'WAIST_DEEP' | 'VEHICLES_SUBMERGED'>('KNEE_DEEP');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !address || !description) return;

    setIsSubmitting(true);

    const newReport: Partial<CitizenReport> = {
      userName,
      userPhone,
      location: {
        lat: 19.0760 + (Math.random() - 0.5) * 0.02,
        lng: 72.8777 + (Math.random() - 0.5) * 0.02,
        address,
        ward,
        zone: 'Zone II'
      },
      category,
      waterLevelDescription: category === 'WATER_LOGGING' ? waterLevel : undefined,
      description,
      photoUrl
    };

    onSubmitReport(newReport);
    confetti({ particleCount: 30, spread: 50 });

    // Reset form fields
    setDescription('');
    setIsSubmitting(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-cyan-400" />
          Citizen Ground-Truth & Community Verification Portal
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Crowdsourced Verification Cross-Correlated with Satellite Telemetry
        </p>
      </div>

      {/* Main Grid: Submit Form (Left) & Live Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Citizen Report Form (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-cyan-400" />
              Submit Ground-Truth Observation
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
              GPS Verified
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98200 12345"
                  value={userPhone}
                  onChange={e => setUserPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Hazard Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as IncidentCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="WATER_LOGGING">Water Logging / Flooding</option>
                  <option value="POWER_FAILURE">Power Outage / Sparks</option>
                  <option value="DRAINAGE_BLOCKAGE">Drainage / Sluice Clog</option>
                  <option value="ROAD_SUBSIDENCE">Road Cavity / Burst Pipe</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Municipal Ward</label>
                <select
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Ward G-North">Ward G-North (Dadar / Mahim)</option>
                  <option value="Ward L-East">Ward L-East (Kurla / Saki Naka)</option>
                  <option value="Ward H-East">Ward H-East (Bandra East / Khar)</option>
                  <option value="Ward F-South">Ward F-South (Parel / Sewri)</option>
                  <option value="Ward K-West">Ward K-West (Andheri / Juhu)</option>
                </select>
              </div>
            </div>

            {category === 'WATER_LOGGING' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Observed Water Depth</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'ANKLE_DEEP', label: 'Ankle (~15cm)' },
                    { id: 'KNEE_DEEP', label: 'Knee (~45cm)' },
                    { id: 'WAIST_DEEP', label: 'Waist (~80cm)' },
                    { id: 'VEHICLES_SUBMERGED', label: 'Vehicles Submerged' },
                  ].map(w => (
                    <button
                      type="button"
                      key={w.id}
                      onClick={() => setWaterLevel(w.id as typeof waterLevel)}
                      className={`p-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                        waterLevel === w.id
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Exact Location / Landmark</label>
              <input
                type="text"
                required
                placeholder="e.g. Near Sunshine Tower, Underpass Service Road"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Description of Situation</label>
              <textarea
                required
                rows={3}
                placeholder="Describe current severity, stranded vehicles, sparks, or blocked culverts..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Photo Upload or Preset */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ground Evidence Photo</label>
              <div className="flex items-center gap-3">
                <img
                  src={photoUrl}
                  alt="Evidence Preview"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-800"
                />
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Choose Photo / Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Ground-Truth Report</span>
            </button>

          </form>
        </div>

        {/* Right: Community Corroboration Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Crowdsourced Verification Stream ({reports.length} Reports)
            </h3>
            <span className="text-xs text-cyan-400 font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Cross-Correlation Active
            </span>
          </div>

          <div className="space-y-3">
            {reports.map(rep => {
              const matchedIncident = incidents.find(i => i.id === rep.matchedIncidentId);

              return (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-xs font-bold text-cyan-400 font-mono">
                        {rep.userName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{rep.userName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {rep.location.ward} • {new Date(rep.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rep.category === 'WATER_LOGGING' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                      rep.category === 'POWER_FAILURE' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      {rep.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Body text & Image */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {rep.photoUrl && (
                      <img
                        src={rep.photoUrl}
                        alt="Citizen proof"
                        className="sm:col-span-4 w-full h-24 object-cover rounded-xl border border-slate-800"
                      />
                    )}
                    <div className={rep.photoUrl ? 'sm:col-span-8' : 'sm:col-span-12'}>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        "{rep.description}"
                      </p>
                      {rep.waterLevelDescription && (
                        <div className="mt-2 inline-block px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-400">
                          Water Level: {rep.waterLevelDescription.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Satellite Match & Verification Bar */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    {matchedIncident ? (
                      <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        Correlated with Satellite Pass ({matchedIncident.id})
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Awaiting Satellite Pass Alignment
                      </span>
                    )}

                    <button
                      onClick={() => onVerifyReport(rep.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5 text-xs font-sans font-semibold transition-all cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Confirm ({rep.upvotes})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
