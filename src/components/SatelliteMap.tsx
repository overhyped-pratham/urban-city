import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Zap, 
  Droplets, 
  Truck, 
  Camera, 
  Compass, 
  Eye, 
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Incident, MaintenanceCrew, CitizenReport } from '../types';
import { GIS_POWER_LINES, GIS_DRAINAGE_NETWORK } from '../data/mockData';

interface SatelliteMapProps {
  incidents: Incident[];
  crews: MaintenanceCrew[];
  citizenReports: CitizenReport[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onOpenDispatchForIncident: (incident: Incident) => void;
  onOpenSatelliteAnalyzer: () => void;
}

export const SatelliteMap: React.FC<SatelliteMapProps> = ({
  incidents,
  crews,
  citizenReports,
  selectedIncident,
  onSelectIncident,
  onOpenDispatchForIncident,
  onOpenSatelliteAnalyzer
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<{
    incidents?: L.LayerGroup;
    crews?: L.LayerGroup;
    citizen?: L.LayerGroup;
    powerGrid?: L.LayerGroup;
    drainage?: L.LayerGroup;
    spectralPolygons?: L.LayerGroup;
  }>({});

  const [baseMap, setBaseMap] = useState<'satellite' | 'dark' | 'streets'>('satellite');
  const [spectralMode, setSpectralMode] = useState<'normal' | 'ndwi' | 'thermal' | 'sar'>('normal');
  const [showPowerGrid, setShowPowerGrid] = useState(true);
  const [showDrainage, setShowDrainage] = useState(true);
  const [showCrews, setShowCrews] = useState(true);
  const [showCitizens, setShowCitizens] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Tile layers references
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on city region (19.0760, 72.8777)
    const map = L.map(mapContainerRef.current, {
      center: [19.0760, 72.8777],
      zoom: 13,
      zoomControl: true,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Initialize layer groups
    layersGroupRef.current = {
      incidents: L.layerGroup().addTo(map),
      crews: L.layerGroup().addTo(map),
      citizen: L.layerGroup().addTo(map),
      powerGrid: L.layerGroup().addTo(map),
      drainage: L.layerGroup().addTo(map),
      spectralPolygons: L.layerGroup().addTo(map),
    };

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Map Tiles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let options: L.TileLayerOptions = {
      maxZoom: 19,
      attribution: 'Esri World Imagery'
    };

    if (baseMap === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      options = { maxZoom: 19, subdomains: 'abcd' };
    } else if (baseMap === 'streets') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      options = { maxZoom: 19 };
    }

    tileLayerRef.current = L.tileLayer(url, options).addTo(map);
  }, [baseMap]);

  // Render Power Grid GIS vector polylines
  useEffect(() => {
    const group = layersGroupRef.current.powerGrid;
    if (!group) return;
    group.clearLayers();

    if (!showPowerGrid) return;

    GIS_POWER_LINES.forEach(line => {
      const isFault = line.status === 'FAULT';
      const color = isFault ? '#ef4444' : '#06b6d4';
      const polyline = L.polyline(line.coordinates as [number, number][], {
        color,
        weight: isFault ? 4 : 3,
        dashArray: isFault ? '6, 8' : undefined,
        opacity: isFault ? 0.9 : 0.75
      });

      polyline.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <div style="font-weight: 700; color: ${color}; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
            ⚡ ${line.name}
          </div>
          <div style="color: #cbd5e1;">Voltage: <strong>${line.voltage}</strong></div>
          <div style="color: #cbd5e1;">Status: <span style="color: ${isFault ? '#f87171' : '#4ade80'}; font-weight: 700;">${line.status}</span></div>
          ${isFault ? '<div style="margin-top: 6px; padding: 4px; background: rgba(239, 68, 68, 0.2); border-radius: 4px; color: #fca5a5; font-size: 11px;">⚠️ Trip detected via thermal satellite sensor. Linemen dispatched.</div>' : ''}
        </div>
      `);

      polyline.addTo(group);
    });
  }, [showPowerGrid]);

  // Render Drainage Network GIS vector polylines
  useEffect(() => {
    const group = layersGroupRef.current.drainage;
    if (!group) return;
    group.clearLayers();

    if (!showDrainage) return;

    GIS_DRAINAGE_NETWORK.forEach(drain => {
      const isOverflow = drain.currentStatus === 'CRITICAL_OVERFLOW';
      const isBlocked = drain.currentStatus === 'OBSTRUCTED';
      const color = isOverflow ? '#dc2626' : isBlocked ? '#f59e0b' : '#3b82f6';

      const polyline = L.polyline(drain.coordinates as [number, number][], {
        color,
        weight: 5,
        opacity: 0.85
      });

      polyline.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <div style="font-weight: 700; color: ${color}; margin-bottom: 4px;">
            🌊 ${drain.name}
          </div>
          <div style="color: #cbd5e1;">Design Capacity: <strong>${drain.capacityM3s} m³/s</strong></div>
          <div style="color: #cbd5e1;">Current State: <span style="color: ${color}; font-weight: 700;">${drain.currentStatus.replace('_', ' ')}</span></div>
        </div>
      `);

      polyline.addTo(group);
    });
  }, [showDrainage]);

  // Render Spectral NDWI / Thermal flood extent polygons
  useEffect(() => {
    const group = layersGroupRef.current.spectralPolygons;
    if (!group) return;
    group.clearLayers();

    incidents.forEach(inc => {
      let fillColor = '#06b6d4';
      let strokeColor = '#22d3ee';
      let fillOpacity = 0.35;

      if (spectralMode === 'ndwi') {
        fillColor = inc.category === 'WATER_LOGGING' ? '#0284c7' : '#64748b';
        fillOpacity = 0.55;
      } else if (spectralMode === 'thermal') {
        fillColor = inc.category === 'POWER_FAILURE' ? '#dc2626' : '#1e293b';
        fillOpacity = 0.6;
      } else if (spectralMode === 'sar') {
        fillColor = '#8b5cf6';
        fillOpacity = 0.45;
      }

      const radius = inc.aiAnalysis.affectedAreaSqMeters 
        ? Math.sqrt(inc.aiAnalysis.affectedAreaSqMeters / Math.PI) 
        : 60;

      const circle = L.circle([inc.location.lat, inc.location.lng], {
        radius: Math.max(radius, 80),
        color: strokeColor,
        fillColor,
        fillOpacity,
        weight: 1.5,
        dashArray: '3, 4'
      });

      circle.addTo(group);
    });
  }, [incidents, spectralMode]);

  // Render Incidents Markers
  useEffect(() => {
    const group = layersGroupRef.current.incidents;
    if (!group) return;
    group.clearLayers();

    const filtered = filterCategory === 'ALL' 
      ? incidents 
      : incidents.filter(i => i.category === filterCategory);

    filtered.forEach(inc => {
      const isCritical = inc.severity === 'CRITICAL';
      const iconColor = 
        inc.category === 'WATER_LOGGING' ? '#38bdf8' :
        inc.category === 'POWER_FAILURE' ? '#f59e0b' :
        inc.category === 'DRAINAGE_BLOCKAGE' ? '#ec4899' : '#10b981';

      // Custom HTML Marker
      const customIcon = L.divIcon({
        className: 'custom-incident-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            background: #0f172a;
            border: 2px solid ${iconColor};
            border-radius: 10px;
            box-shadow: 0 0 16px ${iconColor}66, 0 4px 6px rgba(0,0,0,0.5);
            cursor: pointer;
            transform: translate(-50%, -50%);
          ">
            ${isCritical ? `<div style="
              position: absolute;
              inset: -4px;
              border: 2px solid #ef4444;
              border-radius: 12px;
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              opacity: 0.75;
            "></div>` : ''}
            <span style="font-size: 16px;">
              ${inc.category === 'WATER_LOGGING' ? '💧' : inc.category === 'POWER_FAILURE' ? '⚡' : inc.category === 'DRAINAGE_BLOCKAGE' ? '🚧' : '⚠️'}
            </span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([inc.location.lat, inc.location.lng], { icon: customIcon });

      marker.on('click', () => {
        onSelectIncident(inc);
      });

      // Quick hover popup
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${isCritical ? '#7f1d1d' : '#1e293b'}; color: ${isCritical ? '#fca5a5' : '#94a3b8'};">
              ${inc.severity}
            </span>
            <span style="font-size: 10px; color: #64748b; font-family: monospace;">${inc.id}</span>
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #f8fafc; margin-bottom: 4px;">
            ${inc.title}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
            📍 ${inc.location.address}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; color: #cbd5e1; background: rgba(15, 23, 42, 0.8); padding: 6px; border-radius: 6px; margin-bottom: 8px;">
            <div>Water Depth: <strong>${inc.aiAnalysis.estimatedWaterDepthCm ? `${inc.aiAnalysis.estimatedWaterDepthCm} cm` : 'N/A'}</strong></div>
            <div>AI Confidence: <strong>${inc.aiAnalysis.confidence}%</strong></div>
          </div>
          <div style="font-size: 11px; color: #38bdf8; margin-bottom: 6px;">
            Status: <strong>${inc.status.replace('_', ' ')}</strong>
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="popup-btn-detail-${inc.id}" style="flex: 1; padding: 5px; background: #0284c7; color: #fff; border: none; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;">
              Open Full Dossier
            </button>
          </div>
        </div>
      `);

      marker.addTo(group);
    });
  }, [incidents, filterCategory, onSelectIncident]);

  // Render Maintenance Crews Live GPS Markers
  useEffect(() => {
    const group = layersGroupRef.current.crews;
    if (!group) return;
    group.clearLayers();

    if (!showCrews) return;

    crews.forEach(crew => {
      const isWorking = crew.status === 'WORKING' || crew.status === 'EN_ROUTE';
      const customIcon = L.divIcon({
        className: 'custom-crew-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: #1e1b4b;
            border: 2px solid ${isWorking ? '#a855f7' : '#10b981'};
            border-radius: 50%;
            box-shadow: 0 0 10px ${isWorking ? '#a855f7' : '#10b981'}88;
            cursor: pointer;
            transform: translate(-50%, -50%);
          ">
            <span style="font-size: 14px;">🚚</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([crew.currentLocation.lat, crew.currentLocation.lng], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 200px;">
          <div style="font-weight: 700; color: #c084fc; margin-bottom: 2px;">
            ${crew.name}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
            Lead: ${crew.leadEngineer} | ${crew.contactNumber}
          </div>
          <div style="font-size: 11px; color: #cbd5e1;">
            Status: <span style="font-weight: 700; color: ${isWorking ? '#e879f9' : '#34d399'};">${crew.status}</span>
          </div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">
            Location: <em>${crew.currentLocation.label}</em>
          </div>
        </div>
      `);

      marker.addTo(group);
    });
  }, [crews, showCrews]);

  // Render Citizen Ground Photo Markers
  useEffect(() => {
    const group = layersGroupRef.current.citizen;
    if (!group) return;
    group.clearLayers();

    if (!showCitizens) return;

    citizenReports.forEach(rep => {
      const customIcon = L.divIcon({
        className: 'custom-citizen-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            background: #1e293b;
            border: 2px solid #38bdf8;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
            transform: translate(-50%, -50%);
          ">
            <span style="font-size: 12px;">📸</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([rep.location.lat, rep.location.lng], { icon: customIcon });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; max-width: 240px;">
          <div style="font-weight: 700; color: #38bdf8; margin-bottom: 2px;">
            Citizen Ground Truth Report
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">
            By ${rep.userName} (${rep.upvotes} upvotes)
          </div>
          <img src="${rep.photoUrl}" alt="Ground evidence" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />
          <p style="font-size: 11px; color: #cbd5e1; margin-bottom: 4px;">
            "${rep.description.substring(0, 100)}..."
          </p>
          <div style="font-size: 10px; color: #34d399; font-weight: 600;">
            ${rep.verifiedByMunicipal ? '✅ Municipal AI Verified' : '⏳ Pending Confirmation'}
          </div>
        </div>
      `);

      marker.addTo(group);
    });
  }, [citizenReports, showCitizens]);

  // Pan to selected incident
  useEffect(() => {
    if (!selectedIncident || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([selectedIncident.location.lat, selectedIncident.location.lng], 15, {
      duration: 1.2
    });
  }, [selectedIncident]);

  return (
    <div className="relative w-full h-[calc(100vh-68px)] bg-[#05060a] flex overflow-hidden">
      
      {/* Map Element */}
      <div id="leaflet-satellite-canvas" ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating GIS & Spectral HUD Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-xs">
        
        {/* Base Map Selector */}
        <div className="bg-[#0d1117]/95 backdrop-blur-md p-2.5 rounded-xl border border-[#21262d] shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              GIS Satellite Base
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setBaseMap('satellite')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                baseMap === 'satellite' ? 'bg-cyan-500 text-[#05060a] font-bold shadow-sm shadow-cyan-500/20' : 'bg-[#161b22] text-[#c9d1d9] hover:bg-[#21262d]'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setBaseMap('dark')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                baseMap === 'dark' ? 'bg-cyan-500 text-[#05060a] font-bold shadow-sm shadow-cyan-500/20' : 'bg-[#161b22] text-[#c9d1d9] hover:bg-[#21262d]'
              }`}
            >
              Dark GIS
            </button>
            <button
              onClick={() => setBaseMap('streets')}
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                baseMap === 'streets' ? 'bg-cyan-500 text-[#05060a] font-bold shadow-sm shadow-cyan-500/20' : 'bg-[#161b22] text-[#c9d1d9] hover:bg-[#21262d]'
              }`}
            >
              Streets
            </button>
          </div>
        </div>

        {/* Spectral Index Simulator HUD */}
        <div className="bg-[#0d1117]/95 backdrop-blur-md p-2.5 rounded-xl border border-[#21262d] shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Spectral Sensor Filter
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => setSpectralMode('normal')}
              className={`px-2 py-1.5 rounded text-[11px] font-medium transition-all text-left ${
                spectralMode === 'normal' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              Optical (True Color)
            </button>
            <button
              onClick={() => setSpectralMode('ndwi')}
              className={`px-2 py-1.5 rounded text-[11px] font-medium transition-all text-left ${
                spectralMode === 'ndwi' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50' : 'bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              NDWI (Water Index)
            </button>
            <button
              onClick={() => setSpectralMode('thermal')}
              className={`px-2 py-1.5 rounded text-[11px] font-medium transition-all text-left ${
                spectralMode === 'thermal' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50' : 'bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              Thermal IR (Grid Fault)
            </button>
            <button
              onClick={() => setSpectralMode('sar')}
              className={`px-2 py-1.5 rounded text-[11px] font-medium transition-all text-left ${
                spectralMode === 'sar' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' : 'bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]'
              }`}
            >
              SAR Radar Reflectivity
            </button>
          </div>
        </div>

        {/* GIS Vector Layer Toggles */}
        <div className="bg-[#0d1117]/95 backdrop-blur-md p-2.5 rounded-xl border border-[#21262d] shadow-xl">
          <div className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            Active Municipal Layers
          </div>
          <div className="space-y-1.5 text-xs">
            <label className="flex items-center justify-between text-[#c9d1d9] hover:text-white cursor-pointer select-none">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                33kV/11kV Power Grid
              </span>
              <input
                type="checkbox"
                checked={showPowerGrid}
                onChange={e => setShowPowerGrid(e.target.checked)}
                className="rounded bg-[#161b22] border-[#30363d] text-cyan-500 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-[#c9d1d9] hover:text-white cursor-pointer select-none">
              <span className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                Storm Drainage Culverts
              </span>
              <input
                type="checkbox"
                checked={showDrainage}
                onChange={e => setShowDrainage(e.target.checked)}
                className="rounded bg-[#161b22] border-[#30363d] text-cyan-500 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-[#c9d1d9] hover:text-white cursor-pointer select-none">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-purple-400" />
                Maintenance Crews (GPS)
              </span>
              <input
                type="checkbox"
                checked={showCrews}
                onChange={e => setShowCrews(e.target.checked)}
                className="rounded bg-[#161b22] border-[#30363d] text-cyan-500 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-[#c9d1d9] hover:text-white cursor-pointer select-none">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                Citizen Ground Truth
              </span>
              <input
                type="checkbox"
                checked={showCitizens}
                onChange={e => setShowCitizens(e.target.checked)}
                className="rounded bg-[#161b22] border-[#30363d] text-cyan-500 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

      </div>

      {/* Right-Side Incident Quick Drawer */}
      <div className="absolute top-4 right-4 z-10 w-80 max-h-[calc(100vh-100px)] flex flex-col gap-2 pointer-events-auto">
        
        {/* Header Pill */}
        <div className="bg-[#0d1117]/95 backdrop-blur-md p-3 rounded-xl border border-[#21262d] shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#f0f6fc] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Live Incidents ({incidents.length})
            </span>
            <button
              onClick={onOpenSatelliteAnalyzer}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              New Scan
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {['ALL', 'WATER_LOGGING', 'POWER_FAILURE', 'DRAINAGE_BLOCKAGE'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md whitespace-nowrap transition-colors ${
                  filterCategory === cat
                    ? 'bg-cyan-500 text-[#05060a]'
                    : 'bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat === 'WATER_LOGGING' ? 'Water' : cat === 'POWER_FAILURE' ? 'Grid' : 'Drain'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list of active incidents on map */}
        <div className="overflow-y-auto space-y-2 pr-1 max-h-[460px]">
          {incidents
            .filter(i => filterCategory === 'ALL' || i.category === filterCategory)
            .map(inc => {
              const isSelected = selectedIncident?.id === inc.id;
              const isCritical = inc.severity === 'CRITICAL';

              return (
                <div
                  key={inc.id}
                  id={`map-card-${inc.id}`}
                  onClick={() => onSelectIncident(inc)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer bg-[#0d1117]/95 backdrop-blur-md shadow-lg ${
                    isSelected
                      ? 'border-cyan-400 ring-1 ring-cyan-400/50 bg-[#161b22]'
                      : isCritical
                      ? 'border-rose-900/60 hover:border-rose-500'
                      : 'border-[#21262d] hover:border-[#30363d]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCritical ? 'bg-rose-950 text-rose-300 border border-rose-800/60' : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                    }`}>
                      {inc.severity}
                    </span>
                    <span className="text-[10px] font-mono text-[#8b949e] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(inc.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#f0f6fc] mb-1 line-clamp-1">
                    {inc.title}
                  </h4>

                  <p className="text-[11px] text-[#8b949e] mb-2 line-clamp-1">
                    📍 {inc.location.address}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#c9d1d9] pt-2 border-t border-[#21262d]">
                    <span className="text-cyan-400 font-semibold">
                      {inc.assignedCrewName ? `Unit: ${inc.assignedCrewName}` : 'Crew Unassigned'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDispatchForIncident(inc);
                      }}
                      className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-sans font-semibold transition-colors"
                    >
                      {inc.assignedCrewName ? 'Manage' : 'Dispatch'}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

      </div>

    </div>
  );
};
