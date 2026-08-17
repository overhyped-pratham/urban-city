import React, { useState, useRef, useEffect } from 'react';
import { 
  Layers, 
  Sparkles, 
  Cpu, 
  Github, 
  Sliders, 
  Download, 
  RefreshCw, 
  Eye, 
  Building2, 
  Mountain, 
  CloudOff, 
  Waves, 
  CheckCircle2, 
  BarChart3, 
  MapPin, 
  Maximize2, 
  Box, 
  Play, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { ControlNetSatConfig, ControlNetReconstructionResult } from '../types';

const SAMPLE_RECONSTRUCTION_SCENES: ControlNetReconstructionResult[] = [
  {
    id: 'beijing-central',
    title: 'Beijing Financial Center - 3D Height & Shadow Recovery',
    location: 'Beijing, China',
    lat: 39.9042,
    lng: 116.4074,
    originalImageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=800&q=80',
    conditioningMapUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    reconstructedImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    psnrDb: 35.4,
    ssimScore: 0.962,
    maeHeightMeters: 0.34,
    demResolutionMeters: 0.25,
    reconstructionTimeMs: 1420,
    buildingCount: 142,
    detectedBuildings: [
      { name: 'China Zun Tower', heightMeters: 528, status: 'Structural Intact' },
      { name: 'Guomao Phase III', heightMeters: 330, status: 'Structural Intact' },
      { name: 'CCTV Headquarters', heightMeters: 234, status: 'Minor Water Risk' },
      { name: 'Sub-surface Drainage Node', heightMeters: -12, status: 'Active Pump On' }
    ]
  },
  {
    id: 'shanghai-pudong',
    title: 'Shanghai Pudong - Sub-Surface Inundation & Depth Mapping',
    location: 'Shanghai, China',
    lat: 31.2304,
    lng: 121.4737,
    originalImageUrl: 'https://images.unsplash.com/photo-1506158669146-619067262a00?auto=format&fit=crop&w=800&q=80',
    conditioningMapUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    reconstructedImageUrl: 'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=800&q=80',
    psnrDb: 34.1,
    ssimScore: 0.948,
    maeHeightMeters: 0.41,
    demResolutionMeters: 0.30,
    reconstructionTimeMs: 1680,
    buildingCount: 218,
    detectedBuildings: [
      { name: 'Shanghai Tower', heightMeters: 632, status: 'Structural Intact' },
      { name: 'Shanghai World Financial', heightMeters: 492, status: 'Structural Intact' },
      { name: 'Oriental Pearl Tower', heightMeters: 468, status: 'Perimeter Flooded' },
      { name: 'Pudong Sluice Barrier', heightMeters: 18, status: 'Sluice Gates Open' }
    ]
  },
  {
    id: 'yangtze-basin',
    title: 'Yangtze River Basin - Cloud Removal & DEM Elevation',
    location: 'Wuhan, China',
    lat: 30.5928,
    lng: 114.3055,
    originalImageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
    conditioningMapUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    reconstructedImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    psnrDb: 36.8,
    ssimScore: 0.971,
    maeHeightMeters: 0.28,
    demResolutionMeters: 0.20,
    reconstructionTimeMs: 1250,
    buildingCount: 95,
    detectedBuildings: [
      { name: 'Yellow Crane Tower', heightMeters: 51, status: 'Elevated Safe' },
      { name: 'Wuhan Center', heightMeters: 438, status: 'Structural Intact' },
      { name: 'Yangtze Flood Embankment', heightMeters: 15, status: 'Water Level High' }
    ]
  }
];

export const ControlNetSatelliteReconstruction: React.FC = () => {
  const [selectedScene, setSelectedScene] = useState<ControlNetReconstructionResult>(SAMPLE_RECONSTRUCTION_SCENES[0]);
  const [activeTab, setActiveTab] = useState<'comparison' | '3dmesh' | 'metrics' | 'modelconfig'>('comparison');
  
  // ControlNet Model Parameters
  const [config, setConfig] = useState<ControlNetSatConfig>({
    repoUrl: 'https://github.com/overhyped-pratham/controlnet-satellite-reconstruction',
    modelName: 'ControlNet-SatRecon-v1.4',
    conditioningMode: 'DEM_DEPTH',
    guidanceScale: 7.5,
    controlNetScale: 1.0,
    resolution: '768',
    numInferenceSteps: 30,
    seed: 421089
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [customImageUploaded, setCustomImageUploaded] = useState<string | null>(null);

  // Trigger simulated inference run using ControlNet pipeline
  const handleRunReconstruction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      // Slightly fluctuate metrics to simulate parameter impact
      setSelectedScene(prev => ({
        ...prev,
        psnrDb: +(33 + Math.random() * 4).toFixed(1),
        ssimScore: +(0.93 + Math.random() * 0.05).toFixed(3),
        maeHeightMeters: +(0.25 + Math.random() * 0.2).toFixed(2),
        reconstructionTimeMs: Math.round(1100 + Math.random() * 800)
      }));
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Banner & Model Repository Citation */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Custom ML Model Integration</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ControlNet Satellite Reconstruction Engine
              </h1>
            </div>
          </div>

          <a
            href={config.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white transition-all hover:scale-105 shadow-xl cursor-pointer"
          >
            <Github className="w-4 h-4 text-cyan-400" />
            <span>overhyped-pratham/controlnet-satellite-reconstruction</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
          Powered by <strong>ControlNet Satellite Reconstruction</strong>. This machine learning pipeline converts low-resolution, cloud-occluded, or blurry satellite imagery into high-fidelity 3D terrain representations, Digital Elevation Models (DEM), and accurate building height metrics.
        </p>

        {/* Quick Parameter Summary Badges */}
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Conditioning: <strong className="text-cyan-300">{config.conditioningMode}</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Guidance: <strong className="text-white">{config.guidanceScale}</strong> | ControlNet Scale: <strong className="text-white">{config.controlNetScale}</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resolution: <strong className="text-emerald-300">{config.resolution}x{config.resolution} px</strong></span>
          </div>
        </div>
      </div>

      {/* Main Grid: Scene Selector & Control Panel (Left) + Interactive Visualizer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Test Scenes & Hyperparameters */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Preset Scene Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Select Satellite Scene
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                3 Scenes
              </span>
            </h2>

            <div className="space-y-2.5">
              {SAMPLE_RECONSTRUCTION_SCENES.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => setSelectedScene(scene)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    selectedScene.id === scene.id
                      ? 'bg-indigo-950/80 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={scene.originalImageUrl}
                    alt={scene.title}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{scene.title}</div>
                    <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{scene.location} ({scene.lat.toFixed(2)}°, {scene.lng.toFixed(2)}°)</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                      <span>PSNR: {scene.psnrDb}dB</span>
                      <span>•</span>
                      <span>MAE: {scene.maeHeightMeters}m</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ControlNet Hyperparameter Tuning Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Model Conditioning Controls</h3>
              </div>
              <button
                onClick={handleRunReconstruction}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Running...' : 'Run ML Model'}</span>
              </button>
            </div>

            {/* Conditioning Mode Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Conditioning Input Vector
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { mode: 'DEM_DEPTH', label: 'DEM Depth Map', icon: Mountain },
                  { mode: 'BUILDING_HEIGHT', label: '3D Building Heights', icon: Building2 },
                  { mode: 'CLOUD_REMOVAL', label: 'Cloud Removal', icon: CloudOff },
                  { mode: 'INUNDATION_SUB_SURFACE', label: 'Inundation Sub-surface', icon: Waves }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.mode}
                      onClick={() => setConfig({ ...config, conditioningMode: item.mode as any })}
                      className={`p-2.5 rounded-xl border text-[11px] font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        config.conditioningMode === item.mode
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guidance Scale Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Guidance Scale (CFG):</span>
                <span className="text-cyan-400 font-bold">{config.guidanceScale}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="15.0"
                step="0.5"
                value={config.guidanceScale}
                onChange={(e) => setConfig({ ...config, guidanceScale: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 bg-slate-950 cursor-pointer"
              />
            </div>

            {/* ControlNet Weight Scale */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>ControlNet Weight Scale:</span>
                <span className="text-indigo-400 font-bold">{config.controlNetScale}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={config.controlNetScale}
                onChange={(e) => setConfig({ ...config, controlNetScale: parseFloat(e.target.value) })}
                className="w-full accent-indigo-400 bg-slate-950 cursor-pointer"
              />
            </div>

            {/* Resolution Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Output Resolution
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['512', '768', '1024'].map((res) => (
                  <button
                    key={res}
                    onClick={() => setConfig({ ...config, resolution: res as any })}
                    className={`py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      config.resolution === res
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {res}x{res}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Main Content: Reconstruction Viewers & 3D Terrain */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tab Controls */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
              {[
                { id: 'comparison', label: 'Side-by-Side Split View', icon: Eye },
                { id: '3dmesh', label: '3D Elevation & Buildings', icon: Box },
                { id: 'metrics', label: 'Evaluation Metrics', icon: BarChart3 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inference Time: {selectedScene.reconstructionTimeMs}ms</span>
            </div>
          </div>

          {/* TAB 1: Split-Screen Comparison View */}
          {activeTab === 'comparison' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Raw / Low-Res Satellite Image
                </span>
                <span className="font-mono text-cyan-400">
                  Drag Slider to Compare (Position: {sliderPos}%)
                </span>
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  ControlNet Reconstructed Output
                </span>
              </div>

              {/* Interactive Image Split Slider */}
              <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-slate-700 select-none group">
                
                {/* Reconstructed High-Res Image (Background layer) */}
                <img
                  src={selectedScene.reconstructedImageUrl}
                  alt="Reconstructed High-Res"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Raw Satellite Image (Foreground clipped layer) */}
                <div 
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={selectedScene.originalImageUrl}
                    alt="Raw Satellite"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/80 text-white text-[10px] font-mono border border-white/20">
                    RAW SATELLITE
                  </div>
                </div>

                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-950/90 text-emerald-300 text-[10px] font-mono border border-emerald-700">
                  CONTROLNET RECONSTRUCTED
                </div>

                {/* Slider Handle */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize flex items-center justify-center shadow-2xl z-20"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-xl border-2 border-white">
                    ↔
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
              </div>

              {/* Three Panel Map Preview */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-300">1. Raw Input</div>
                  <img src={selectedScene.originalImageUrl} className="w-full h-24 rounded-xl object-cover" alt="Raw" />
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-cyan-300 flex items-center justify-between">
                    <span>2. ControlNet DEM Map</span>
                    <span className="text-[9px] font-mono text-cyan-400">Depth</span>
                  </div>
                  <img src={selectedScene.conditioningMapUrl} className="w-full h-24 rounded-xl object-cover filter contrast-125" alt="Conditioning Map" />
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-emerald-300">3. Reconstructed 3D</div>
                  <img src={selectedScene.reconstructedImageUrl} className="w-full h-24 rounded-xl object-cover" alt="Reconstructed" />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: 3D Elevation & Buildings Mesh Renderer */}
          {activeTab === '3dmesh' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Box className="w-5 h-5 text-cyan-400" />
                    <span>3D Building & Terrain Height Recovery</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Recovered structural height matrices calculated from ControlNet shadow vectors and monocular depth estimation.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono">
                  Building Count: {selectedScene.buildingCount}
                </span>
              </div>

              {/* Simulated 3D Building Grid Canvas Representation */}
              <div className="relative w-full h-[360px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

                {/* 3D Isometric Building Projection Cards */}
                <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                  {selectedScene.detectedBuildings.map((bldg, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-900/80 hover:border-cyan-400 transition-all shadow-xl space-y-2 group"
                    >
                      <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                        <span>#00{idx + 1}</span>
                        <Building2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-xs font-bold text-white truncate">{bldg.name}</div>
                      <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
                        {bldg.heightMeters} meters
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{bldg.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Evaluation Metrics Table */}
          {activeTab === 'metrics' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  <span>ControlNet Model Accuracy Benchmarks</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">PSNR (Signal-Noise Ratio)</div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">{selectedScene.psnrDb} dB</div>
                  <div className="text-[10px] text-emerald-400">High Fidelity</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">SSIM Index</div>
                  <div className="text-2xl font-black text-indigo-400 font-mono">{selectedScene.ssimScore}</div>
                  <div className="text-[10px] text-emerald-400">Structural Alignment</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Height MAE Error</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">±{selectedScene.maeHeightMeters} m</div>
                  <div className="text-[10px] text-emerald-400">Sub-meter accuracy</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">DEM Grid Spatial</div>
                  <div className="text-2xl font-black text-amber-400 font-mono">{selectedScene.demResolutionMeters} m/px</div>
                  <div className="text-[10px] text-emerald-400">Ultra-high Res</div>
                </div>
              </div>

              {/* Detected Buildings Data Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                  Reconstructed Building Height Catalog ({selectedScene.location})
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono">
                        <th className="py-2.5 px-3">Structure Name</th>
                        <th className="py-2.5 px-3">ControlNet Height</th>
                        <th className="py-2.5 px-3">Structural Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {selectedScene.detectedBuildings.map((b, i) => (
                        <tr key={i} className="hover:bg-slate-950/60">
                          <td className="py-2.5 px-3 text-white font-bold">{b.name}</td>
                          <td className="py-2.5 px-3 text-cyan-400">{b.heightMeters} m</td>
                          <td className="py-2.5 px-3 text-emerald-400">{b.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
