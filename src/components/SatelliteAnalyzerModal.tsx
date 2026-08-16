import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  Satellite, 
  CheckCircle2, 
  ShieldAlert, 
  Droplets, 
  Zap, 
  Wrench, 
  AlertTriangle,
  ArrowRight,
  Activity,
  Layers
} from 'lucide-react';
import { SATELLITE_PRESETS } from '../data/mockData';
import { AiSatelliteAnalysis, Incident, IncidentCategory } from '../types';
import confetti from 'canvas-confetti';

interface SatelliteAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateIncidentFromAnalysis: (incidentData: Partial<Incident>) => void;
}

export const SatelliteAnalyzerModal: React.FC<SatelliteAnalyzerModalProps> = ({
  isOpen,
  onClose,
  onCreateIncidentFromAnalysis
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SATELLITE_PRESETS[0].id);
  const [customImageBase64, setCustomImageBase64] = useState<string | null>(null);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const [sensorType, setSensorType] = useState<string>('Sentinel-2 Multispectral (NDWI)');
  const [locationContext, setLocationContext] = useState<string>('Sector 4 Expressway Underpass, Ward G-North');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiSatelliteAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPreset = SATELLITE_PRESETS.find(p => p.id === selectedPresetId);
  const activeImageUrl = customImagePreview || currentPreset?.imageUrl || '';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCustomImageBase64(result);
      setCustomImagePreview(result);
      setSelectedPresetId('custom');
      setAnalysisResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisResult(null);

    try {
      let imageBase64ToSend = customImageBase64;
      
      // If using preset image, fetch and convert to base64
      if (!imageBase64ToSend && currentPreset?.imageUrl) {
        try {
          const res = await fetch(currentPreset.imageUrl);
          const blob = await res.blob();
          const reader = new FileReader();
          imageBase64ToSend = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch (fetchErr) {
          console.warn('Preset fetch fallback:', fetchErr);
        }
      }

      const response = await fetch('/api/analyze-satellite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64ToSend,
          sensorType: selectedPresetId === 'custom' ? sensorType : (currentPreset?.sensor || sensorType),
          locationContext: selectedPresetId === 'custom' ? locationContext : (currentPreset?.location.address || locationContext),
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed on server');
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to complete AI satellite scan. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateIncident = () => {
    if (!analysisResult) return;

    const presetLoc = currentPreset?.location || {
      lat: 19.0760,
      lng: 72.8777,
      address: locationContext,
      ward: 'Ward G-North',
      zone: 'Zone II'
    };

    const newIncident: Partial<Incident> = {
      title: `${analysisResult.severity} ${analysisResult.hazardType.replace('_', ' ')} - ${presetLoc.address}`,
      category: analysisResult.hazardType as IncidentCategory,
      severity: analysisResult.severity,
      status: 'AI_VERIFIED',
      location: presetLoc,
      satelliteImage: activeImageUrl,
      satellitePassId: `PASS-SENTINEL-${Math.floor(100 + Math.random() * 900)}`,
      satelliteSensor: selectedPresetId === 'custom' ? sensorType : (currentPreset?.sensor || sensorType),
      aiAnalysis: analysisResult,
    };

    onCreateIncidentFromAnalysis(newIncident);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05060a]/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0d1117] border border-[#21262d] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#21262d] flex items-center justify-between bg-[#05060a]/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f0f6fc] flex items-center gap-2">
                AI Satellite Remote Sensing Analyzer
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                  GEMINI 3.7 FLASH VISION
                </span>
              </h3>
              <p className="text-xs text-[#8b949e] font-mono">
                Multispectral NDWI & SAR Radar Hazard Detection Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#161b22] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Preset Selector or Upload */}
          <div>
            <label className="block text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-2">
              Select Satellite Feed or Upload Aerial Pass
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
              {SATELLITE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    setCustomImageBase64(null);
                    setCustomImagePreview(null);
                    setAnalysisResult(null);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedPresetId === preset.id
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/10'
                      : 'border-[#21262d] bg-[#05060a]/60 hover:border-[#30363d]'
                  }`}
                >
                  <img
                    src={preset.imageUrl}
                    alt={preset.name}
                    className="w-full h-20 object-cover rounded-lg mb-2"
                  />
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded block w-fit mb-1 ${
                    preset.category === 'WATER_LOGGING' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                    preset.category === 'POWER_FAILURE' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}>
                    {preset.category.replace('_', ' ')}
                  </span>
                  <p className="text-xs font-bold text-[#f0f6fc] line-clamp-1">{preset.name}</p>
                  <p className="text-[10px] text-[#8b949e] font-mono mt-0.5">{preset.sensor}</p>
                </button>
              ))}
            </div>

            {/* Custom file upload input */}
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#30363d] hover:border-cyan-500/60 bg-[#05060a]/40 text-[#c9d1d9] hover:text-white text-xs font-semibold cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload Custom Drone / Satellite Imagery (.PNG, .JPG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {selectedPresetId === 'custom' && (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Custom Image Loaded
                </span>
              )}
            </div>
          </div>

          {/* Active Image Preview & Trigger Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            
            {/* Left: Satellite image preview HUD */}
            <div className="md:col-span-5 relative rounded-xl overflow-hidden border border-[#21262d] bg-[#05060a]">
              <img
                src={activeImageUrl}
                alt="Active Satellite Preview"
                className="w-full h-56 object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#05060a]/80 backdrop-blur-md border border-[#30363d] text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                {selectedPresetId === 'custom' ? sensorType : currentPreset?.sensor}
              </div>
              <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded bg-[#05060a]/90 backdrop-blur-md border border-[#21262d] text-[11px] text-[#c9d1d9]">
                📍 {selectedPresetId === 'custom' ? locationContext : currentPreset?.location.address}
              </div>
            </div>

            {/* Right: Controls & Parameters */}
            <div className="md:col-span-7 space-y-4">
              {selectedPresetId === 'custom' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#8b949e] mb-1">
                      Sensor Modality
                    </label>
                    <select
                      value={sensorType}
                      onChange={e => setSensorType(e.target.value)}
                      className="w-full bg-[#05060a] border border-[#21262d] rounded-lg px-3 py-2 text-xs text-[#c9d1d9] focus:outline-none focus:border-cyan-500"
                    >
                      <option>Sentinel-2 Multispectral (NDWI Water Extraction)</option>
                      <option>SAR Sentinel-1 Radar Reflectivity (Debris / Culvert)</option>
                      <option>Landsat-9 Thermal Infrared (Power Grid Faults)</option>
                      <option>WorldView-3 High-Res Optical (Road Subsidence)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#8b949e] mb-1">
                      Location Context / Ward
                    </label>
                    <input
                      type="text"
                      value={locationContext}
                      onChange={e => setLocationContext(e.target.value)}
                      placeholder="e.g. Underpass near Sector 4, Ward G-North"
                      className="w-full bg-[#05060a] border border-[#21262d] rounded-lg px-3 py-2 text-xs text-[#c9d1d9] focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-[#8b949e] leading-relaxed">
                Gemini 3.7 Flash analyzes spatial pixels, NDWI spectral bands, and thermal anomalies to detect waterlogging depth, electrical blackout perimeters, and canal clogs.
              </p>

              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-[#05060a] font-bold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-[#05060a]" />
                    <span>Processing Multispectral AI Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#05060a]" />
                    <span>Run AI Satellite Hazard Analysis</span>
                  </>
                )}
              </button>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

          </div>

          {/* AI Analysis Output Dossier */}
          {analysisResult && (
            <div className="p-5 rounded-xl bg-[#05060a]/80 border border-cyan-500/40 shadow-xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#21262d]">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#f0f6fc] flex items-center gap-2">
                      Detection Verified: {analysisResult.hazardType.replace('_', ' ')}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                        {analysisResult.severity}
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-[#8b949e]">
                    Confidence: <strong className="text-cyan-400">{analysisResult.confidence}%</strong>
                  </div>
                  <div className="text-[#8b949e]">
                    Priority Score: <strong className="text-amber-400">{analysisResult.dispatchPriorityScore}/100</strong>
                  </div>
                </div>
              </div>

              {/* Metric badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#21262d]">
                  <span className="text-[10px] font-bold text-[#8b949e] uppercase block mb-1">
                    Affected Area
                  </span>
                  <span className="text-sm font-mono font-bold text-[#f0f6fc]">
                    {analysisResult.affectedAreaSqMeters.toLocaleString()} m²
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#21262d]">
                  <span className="text-[10px] font-bold text-[#8b949e] uppercase block mb-1">
                    {analysisResult.hazardType === 'POWER_FAILURE' ? 'Outage Radius' : 'Water Depth'}
                  </span>
                  <span className="text-sm font-mono font-bold text-cyan-400">
                    {analysisResult.hazardType === 'POWER_FAILURE'
                      ? `${analysisResult.powerOutageRadiusMeters || 1200} m`
                      : `${analysisResult.estimatedWaterDepthCm || 65} cm`}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#21262d]">
                  <span className="text-[10px] font-bold text-[#8b949e] uppercase block mb-1">
                    Affected Citizens
                  </span>
                  <span className="text-sm font-mono font-bold text-amber-400">
                    ~{analysisResult.estimatedAffectedHouseholds.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#0d1117] border border-[#21262d]">
                  <span className="text-[10px] font-bold text-[#8b949e] uppercase block mb-1">
                    Spectral NDWI
                  </span>
                  <span className="text-sm font-mono font-bold text-blue-400">
                    {analysisResult.spectralIndex?.ndwi ? `+${analysisResult.spectralIndex.ndwi}` : '0.72 (Water)'}
                  </span>
                </div>
              </div>

              {/* AI Summary */}
              <div className="p-3 rounded-lg bg-[#0d1117]/60 border border-[#21262d]">
                <p className="text-xs text-[#c9d1d9] leading-relaxed">
                  <strong className="text-cyan-400">AI Diagnostic Summary:</strong> {analysisResult.aiSummary}
                </p>
              </div>

              {/* Detected Features & Equipment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <h5 className="font-bold text-[#8b949e] mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Detected Spatial Signatures
                  </h5>
                  <ul className="space-y-1 text-[#c9d1d9]">
                    {analysisResult.detectedFeatures.map((feat, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-500">•</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-[#8b949e] mb-2 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    Required Dispatch Equipment
                  </h5>
                  <ul className="space-y-1 text-[#c9d1d9]">
                    {analysisResult.requiredEquipment.map((eq, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500">✔</span>
                        <span>{eq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-[#21262d] flex justify-end">
                <button
                  onClick={handleCreateIncident}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#05060a] font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
                >
                  <span>Create Official Incident & Generate Work Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
