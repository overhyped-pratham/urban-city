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
  Send,
  Wand2,
  Building2,
  AlertTriangle
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
  const [userName, setUserName] = useState('Ananya Sharma');
  const [userPhone, setUserPhone] = useState('+91 98201 44829');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('Ward 12');
  const [category, setCategory] = useState<IncidentCategory>('WATER_LOGGING');
  const [waterLevel, setWaterLevel] = useState<'ANKLE_DEEP' | 'KNEE_DEEP' | 'WAIST_DEEP' | 'VEHICLES_SUBMERGED'>('KNEE_DEEP');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNlpExtracting, setIsNlpExtracting] = useState(false);
  const [nlpDepartment, setNlpDepartment] = useState<string | null>(null);

  // Quick NLP extraction from free-text
  const handleNlpExtract = async () => {
    if (!description.trim()) return;
    setIsNlpExtracting(true);
    try {
      const res = await fetch('/api/nlp-complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: description,
          userName,
          locationText: address,
          photoUrl
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.parsed) {
          if (data.parsed.category) setCategory(data.parsed.category);
          if (data.parsed.ward) setWard(data.parsed.ward);
          if (data.parsed.location && !address) setAddress(data.parsed.location);
          if (data.parsed.department) setNlpDepartment(data.parsed.department);
          confetti({ particleCount: 35, spread: 60 });
        }
      }
    } catch (e) {
      console.warn('NLP extraction fallback', e);
    } finally {
      setIsNlpExtracting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !description) return;

    setIsSubmitting(true);

    const newReport: Partial<CitizenReport> = {
      userName,
      userPhone,
      location: {
        lat: 19.0760 + (Math.random() - 0.5) * 0.02,
        lng: 72.8777 + (Math.random() - 0.5) * 0.02,
        address: address || 'Sector Road Link',
        ward,
        zone: 'Zone II'
      },
      category,
      waterLevelDescription: category === 'WATER_LOGGING' ? waterLevel : undefined,
      description,
      photoUrl
    };

    onSubmitReport(newReport);
    confetti({ particleCount: 40, spread: 70 });

    setDescription('');
    setAddress('');
    setNlpDepartment(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Citizen Intelligence &amp; NLP Routing
          </div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Citizen Ground-Truth &amp; Incident Reporting Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Crowdsourced reports cross-correlated with satellite radar and automatically categorized by Gemini NLP for direct municipal department dispatch.
          </p>
        </div>
      </div>

      {/* Main Grid: Submit Form (Left) & Live Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-600" />
              Report Urban Hazard
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Input problem details or paste natural text for AI automated classification
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Natural Language AI Box */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                  NLP Auto-Extraction
                </span>
                <button
                  type="button"
                  onClick={handleNlpExtract}
                  disabled={!description.trim() || isNlpExtracting}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold transition-all disabled:opacity-40 flex items-center gap-1"
                >
                  {isNlpExtracting ? 'Analyzing...' : 'Auto-Classify with AI'}
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="e.g., 'Road near XYZ school has a huge pothole and water is overflowing from the drain slab'"
                className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {nlpDepartment && (
                <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Auto-routed to: <strong>{nlpDepartment}</strong>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Municipal Ward</label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                >
                  <option value="Ward 12">Ward 12 (Central Civic Core)</option>
                  <option value="Ward 4">Ward 4 (North Basin)</option>
                  <option value="Ward 7">Ward 7 (Industrial Ring)</option>
                  <option value="Ward 18">Ward 18 (Eastern Hillside)</option>
                  <option value="Ward 9">Ward 9 (Upper Heights)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                >
                  <option value="WATER_LOGGING">🌊 Waterlogging / Flood</option>
                  <option value="DRAINAGE_BLOCKAGE">🕳️ Drainage / Silt Clog</option>
                  <option value="ROAD_SUBSIDENCE">🛣️ Pothole / Road Damage</option>
                  <option value="POWER_FAILURE">⚡ Power / Transformer</option>
                  <option value="SEWAGE_OVERFLOW">🗑️ Waste / Overflow</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specific Landmark or Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Underpass near Sector 4 bus depot"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Photo Evidence</label>
              <div className="flex items-center gap-3">
                <img src={photoUrl} alt="Preview" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
                <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              Submit Citizen Ground Report
            </button>
          </form>
        </div>

        {/* Live Feed Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Verified Community Ground Reports ({reports.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Citizen corroborations mapped against satellite radar &amp; IoT sensors
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {reports.map((report) => (
                <div key={report.id} className="py-4 flex flex-col sm:flex-row items-start gap-4">
                  <img
                    src={report.photoUrl}
                    alt="Citizen Upload"
                    className="w-full sm:w-28 h-24 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{report.userName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                          {report.location.ward}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(report.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {report.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span>{report.location.address}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {report.verifiedByMunicipal ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Municipal Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Pending Field Verification</span>
                        )}
                      </div>

                      <button
                        onClick={() => onVerifyReport(report.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Upvote ({report.upvotes})
                      </button>
                    </div>
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
