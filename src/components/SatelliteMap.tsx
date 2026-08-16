import React, { useState, useMemo } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow 
} from '@vis.gl/react-google-maps';
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
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  MapPin,
  Users,
  Navigation,
  Key,
  Flame
} from 'lucide-react';
import { 
  Incident, 
  MaintenanceCrew, 
  CitizenReport, 
  IncidentCategory, 
  IncidentSeverity, 
  IncidentStatus, 
  SegFormerSARWaterlogging,
  HistoricalRiskHotspot
} from '../types';
import { 
  GIS_POWER_LINES, 
  GIS_DRAINAGE_NETWORK, 
  INITIAL_SAR_WATERLOGGING,
  HISTORICAL_RISK_HOTSPOTS
} from '../data/mockData';
import { MapPolyline, MapCircle, MapPolygon, MapCameraPan } from './GoogleMapOverlays';

interface SatelliteMapProps {
  incidents: Incident[];
  crews: MaintenanceCrew[];
  citizenReports: CitizenReport[];
  selectedIncident: Incident | null;
  showHistoricalHeatmap?: boolean;
  onToggleHistoricalHeatmap?: (active: boolean) => void;
  historicalHeatmapCategory?: string;
  onSelectHistoricalHeatmapCategory?: (cat: string) => void;
  onSelectIncident: (incident: Incident) => void;
  onOpenDispatchForIncident: (incident: Incident) => void;
  onOpenSatelliteAnalyzer: () => void;
  onUpdateStatus?: (incidentId: string, status: IncidentStatus) => void;
  onAssignCrew?: (incidentId: string, crewId: string) => void;
}

export const SatelliteMap: React.FC<SatelliteMapProps> = ({
  incidents,
  crews,
  citizenReports,
  selectedIncident,
  showHistoricalHeatmap = false,
  onToggleHistoricalHeatmap,
  historicalHeatmapCategory = 'ALL',
  onSelectHistoricalHeatmapCategory,
  onSelectIncident,
  onOpenDispatchForIncident,
  onOpenSatelliteAnalyzer,
  onUpdateStatus,
  onAssignCrew
}) => {
  // Read Google Maps API Key from environment
  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';
  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  // Map settings
  const [mapType, setMapType] = useState<google.maps.MapTypeId | 'hybrid' | 'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [showPowerGrid, setShowPowerGrid] = useState(true);
  const [showDrainage, setShowDrainage] = useState(true);
  const [showCrews, setShowCrews] = useState(true);
  const [showCitizens, setShowCitizens] = useState(true);
  const [showHazardRadius, setShowHazardRadius] = useState(true);
  const [showSarWaterMask, setShowSarWaterMask] = useState(true);

  // Local fallback for historical heatmap if not controlled
  const [localHistoricalHeatmap, setLocalHistoricalHeatmap] = useState(false);
  const isHistoricalHeatmapActive = onToggleHistoricalHeatmap ? showHistoricalHeatmap : localHistoricalHeatmap;
  const handleToggleHistoricalHeatmap = (active: boolean) => {
    setLocalHistoricalHeatmap(active);
    onToggleHistoricalHeatmap?.(active);
  };

  const [localHistoricalCategory, setLocalHistoricalCategory] = useState('ALL');
  const activeHistoricalCategory = onSelectHistoricalHeatmapCategory ? historicalHeatmapCategory : localHistoricalCategory;
  const handleSelectHistoricalCategory = (cat: string) => {
    setLocalHistoricalCategory(cat);
    onSelectHistoricalHeatmapCategory?.(cat);
  };

  // Filters
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Active info window on map
  const [infoWindowIncident, setInfoWindowIncident] = useState<Incident | null>(selectedIncident);
  const [selectedCrew, setSelectedCrew] = useState<MaintenanceCrew | null>(null);
  const [selectedCitizenReport, setSelectedCitizenReport] = useState<CitizenReport | null>(null);
  const [selectedSarZone, setSelectedSarZone] = useState<typeof INITIAL_SAR_WATERLOGGING.highRiskZones[0] | null>(null);
  const [selectedHistoricalHotspot, setSelectedHistoricalHotspot] = useState<HistoricalRiskHotspot | null>(null);

  // Sync selected incident when changed from props
  React.useEffect(() => {
    if (selectedIncident) {
      setInfoWindowIncident(selectedIncident);
    }
  }, [selectedIncident]);

  // Filtered incidents calculation
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      // Filter by Type
      if (filterType !== 'ALL' && inc.category !== filterType) {
        return false;
      }
      // Filter by Severity
      if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) {
        return false;
      }
      // Filter by Status
      if (filterStatus !== 'ALL') {
        if (filterStatus === 'ACTIVE' && inc.status === 'RESOLVED') return false;
        if (filterStatus !== 'ACTIVE' && inc.status !== filterStatus) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = inc.title.toLowerCase().includes(q);
        const matchAddress = inc.location.address.toLowerCase().includes(q);
        const matchWard = inc.location.ward.toLowerCase().includes(q);
        const matchId = inc.id.toLowerCase().includes(q);
        if (!matchTitle && !matchAddress && !matchWard && !matchId) {
          return false;
        }
      }
      return true;
    });
  }, [incidents, filterType, filterSeverity, filterStatus, searchQuery]);

  // Statistics for badges
  const stats = useMemo(() => {
    const waterlogging = incidents.filter(i => i.category === 'WATER_LOGGING' && i.status !== 'RESOLVED').length;
    const powerOutages = incidents.filter(i => i.category === 'POWER_FAILURE' && i.status !== 'RESOLVED').length;
    const drainage = incidents.filter(i => i.category === 'DRAINAGE_BLOCKAGE' && i.status !== 'RESOLVED').length;
    const critical = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
    const resolved = incidents.filter(i => i.status === 'RESOLVED').length;
    return { waterlogging, powerOutages, drainage, critical, resolved, total: incidents.length };
  }, [incidents]);

  // Handle crew status update click directly on marker/infowindow
  const handleStatusChange = (incidentId: string, newStatus: IncidentStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(incidentId, newStatus);
      if (infoWindowIncident && infoWindowIncident.id === incidentId) {
        setInfoWindowIncident(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilterType('ALL');
    setFilterSeverity('ALL');
    setFilterStatus('ALL');
    setSearchQuery('');
  };

  // 1. Mandatory Splash Screen if API Key is not configured
  if (!hasValidKey) {
    return (
      <div className="w-full h-[calc(100vh-68px)] bg-[#05060a] flex items-center justify-center p-6 text-[#c9d1d9]">
        <div className="max-w-xl w-full bg-[#0d1117] border border-[#21262d] rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#21262d]">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Key className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f0f6fc]">Google Maps Platform API Key Required</h2>
              <p className="text-xs text-[#8b949e] font-mono">UrbanWatch Municipal Incident Command System</p>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-[#8b949e]">
            <p>
              To render the real-time Google Maps interactive dashboard with live waterlogging markers, power outage telemetry, and GIS vector lines:
            </p>

            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-2.5">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span className="text-[#c9d1d9]">
                  Get an API key from the{' '}
                  <a
                    href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline hover:text-cyan-300 font-semibold"
                  >
                    Google Cloud Console (Maps APIs)
                  </a>
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                <span className="text-[#c9d1d9]">
                  When the <strong>"Enter your environment variable to continue"</strong> popup appears, paste your key.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                <span className="text-[#c9d1d9]">
                  Or manually: Open <strong>Settings</strong> (⚙️ gear icon, top-right corner) → <strong>Secrets</strong> → type <code className="px-1.5 py-0.5 rounded bg-[#0d1117] text-cyan-300 font-mono text-[11px] border border-[#30363d]">GOOGLE_MAPS_PLATFORM_KEY</code> → press <strong>Enter</strong> → paste your key → press <strong>Enter</strong>.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-cyan-300 text-[11px] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>The application rebuilds automatically upon secret injection — no browser reload needed.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Full Interactive Google Maps Dashboard
  return (
    <div className="relative w-full h-[calc(100vh-68px)] bg-[#05060a] flex overflow-hidden">
      
      {/* Google Maps Canvas Provider */}
      <APIProvider apiKey={API_KEY} version="weekly">
        <div id="google-maps-container" className="w-full h-full relative z-0">
          <Map
            defaultCenter={{ lat: 19.0760, lng: 72.8777 }}
            defaultZoom={13}
            mapId="DEMO_MAP_ID"
            mapTypeId={mapType as any}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            gestureHandling="greedy"
            disableDefaultUI={false}
          >
            {/* Map Camera Controller */}
            <MapCameraPan
              target={selectedIncident ? { lat: selectedIncident.location.lat, lng: selectedIncident.location.lng } : null}
            />

            {/* GIS Vector Overlays: Power Grid Lines */}
            {showPowerGrid && GIS_POWER_LINES.map(line => {
              const isFault = line.status === 'FAULT';
              const path = line.coordinates.map(([lat, lng]) => ({ lat, lng }));
              return (
                <MapPolyline
                  key={line.id}
                  path={path}
                  options={{
                    strokeColor: isFault ? '#ef4444' : '#06b6d4',
                    strokeWeight: isFault ? 4 : 3,
                    strokeOpacity: isFault ? 0.95 : 0.75,
                  }}
                />
              );
            })}

            {/* GIS Vector Overlays: Drainage Network */}
            {showDrainage && GIS_DRAINAGE_NETWORK.map(drain => {
              const isOverflow = drain.currentStatus === 'CRITICAL_OVERFLOW';
              const isBlocked = drain.currentStatus === 'OBSTRUCTED';
              const color = isOverflow ? '#dc2626' : isBlocked ? '#f59e0b' : '#3b82f6';
              const path = drain.coordinates.map(([lat, lng]) => ({ lat, lng }));
              return (
                <MapPolyline
                  key={drain.id}
                  path={path}
                  options={{
                    strokeColor: color,
                    strokeWeight: 4.5,
                    strokeOpacity: 0.85
                  }}
                />
              );
            })}

            {/* AI SegFormer-B2 + Sentinel-1 SAR Waterlogging Inundation Polygons */}
            {showSarWaterMask && INITIAL_SAR_WATERLOGGING.polygonCoordinates.map((polygon, pIdx) => (
              <MapPolygon
                key={`sar-polygon-${pIdx}`}
                paths={polygon}
                options={{
                  fillColor: '#06b6d4',
                  fillOpacity: 0.38,
                  strokeColor: '#0891b2',
                  strokeWeight: 2,
                  strokeOpacity: 0.9,
                }}
              />
            ))}

            {/* Sentinel-1 SAR High-Risk Inundation Cluster Centroid Markers */}
            {showSarWaterMask && INITIAL_SAR_WATERLOGGING.highRiskZones.map((zone) => (
              <AdvancedMarker
                key={zone.id}
                position={{ lat: zone.lat, lng: zone.lng }}
                onClick={() => {
                  setSelectedSarZone(zone);
                  setInfoWindowIncident(null);
                  setSelectedCrew(null);
                  setSelectedCitizenReport(null);
                  setSelectedHistoricalHotspot(null);
                }}
                title={`SAR Inundation Cluster: ${zone.locationName} (${zone.confidence}% Confidence)`}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#0369a1',
                    border: '2px solid #38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 14px #06b6d4aa',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <span style={{ fontSize: '15px' }}>🛰️</span>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '8px',
                      fontWeight: 'bold',
                      padding: '1px 3px',
                      borderRadius: '4px',
                      border: '1px solid #7f1d1d'
                    }}
                  >
                    {zone.priority}
                  </span>
                </div>
              </AdvancedMarker>
            ))}

            {/* HISTORICAL RISK HEATMAP OVERLAYS (5-Year PostGIS Recurrence Baselines) */}
            {isHistoricalHeatmapActive && HISTORICAL_RISK_HOTSPOTS
              .filter(h => activeHistoricalCategory === 'ALL' || h.category === activeHistoricalCategory)
              .map(hotspot => {
                const isSelected = selectedHistoricalHotspot?.id === hotspot.id;
                return (
                  <React.Fragment key={`hist-overlay-${hotspot.id}`}>
                    {/* Outer Ambient Heat Buffer Ring */}
                    <MapCircle
                      center={{ lat: hotspot.lat, lng: hotspot.lng }}
                      radius={hotspot.radiusMeters * 1.4}
                      options={{
                        fillColor: hotspot.colorHex,
                        fillOpacity: 0.12,
                        strokeColor: hotspot.colorHex,
                        strokeOpacity: 0.3,
                        strokeWeight: 1,
                      }}
                      onClick={() => {
                        setSelectedHistoricalHotspot(hotspot);
                        setInfoWindowIncident(null);
                        setSelectedCrew(null);
                        setSelectedCitizenReport(null);
                        setSelectedSarZone(null);
                      }}
                    />

                    {/* Mid Chronic Risk Impact Ring */}
                    <MapCircle
                      center={{ lat: hotspot.lat, lng: hotspot.lng }}
                      radius={hotspot.radiusMeters * 0.85}
                      options={{
                        fillColor: hotspot.colorHex,
                        fillOpacity: isSelected ? 0.38 : 0.25,
                        strokeColor: hotspot.colorHex,
                        strokeOpacity: 0.65,
                        strokeWeight: isSelected ? 2.5 : 1.5,
                      }}
                      onClick={() => {
                        setSelectedHistoricalHotspot(hotspot);
                        setInfoWindowIncident(null);
                        setSelectedCrew(null);
                        setSelectedCitizenReport(null);
                        setSelectedSarZone(null);
                      }}
                    />

                    {/* Core Infrastructure Failure Center */}
                    <MapCircle
                      center={{ lat: hotspot.lat, lng: hotspot.lng }}
                      radius={Math.max(hotspot.radiusMeters * 0.35, 60)}
                      options={{
                        fillColor: '#ef4444',
                        fillOpacity: isSelected ? 0.55 : 0.42,
                        strokeColor: '#f87171',
                        strokeOpacity: 0.85,
                        strokeWeight: 2,
                      }}
                      onClick={() => {
                        setSelectedHistoricalHotspot(hotspot);
                        setInfoWindowIncident(null);
                        setSelectedCrew(null);
                        setSelectedCitizenReport(null);
                        setSelectedSarZone(null);
                      }}
                    />

                    {/* Centroid Recurrence Flame Marker */}
                    <AdvancedMarker
                      position={{ lat: hotspot.lat, lng: hotspot.lng }}
                      onClick={() => {
                        setSelectedHistoricalHotspot(hotspot);
                        setInfoWindowIncident(null);
                        setSelectedCrew(null);
                        setSelectedCitizenReport(null);
                        setSelectedSarZone(null);
                      }}
                      title={`Historical Risk Hotspot: ${hotspot.name} (${hotspot.historicalFrequencyScore}% 5-Yr Recurrence)`}
                    >
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '12px',
                          backgroundColor: '#1e112a',
                          border: `2px solid ${isSelected ? '#f43f5e' : '#f59e0b'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 0 16px ${isSelected ? '#f43f5e' : '#f59e0b'}88`,
                          cursor: 'pointer',
                          position: 'relative',
                          transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>🔥</span>
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-6px',
                            right: '-6px',
                            backgroundColor: '#e11d48',
                            color: '#fff',
                            fontSize: '8px',
                            fontWeight: '900',
                            padding: '1px 3px',
                            borderRadius: '4px',
                            border: '1px solid #881337',
                            fontFamily: 'monospace',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {hotspot.incidentsCount5Years}x
                        </span>
                      </div>
                    </AdvancedMarker>
                  </React.Fragment>
                );
              })}

            {/* Hazard Impact Radius Circles */}
            {showHazardRadius && filteredIncidents.map(inc => {
              if (inc.status === 'RESOLVED') return null;
              const isWater = inc.category === 'WATER_LOGGING';
              const isPower = inc.category === 'POWER_FAILURE';
              const radius = isWater 
                ? (inc.aiAnalysis.affectedAreaSqMeters ? Math.max(Math.sqrt(inc.aiAnalysis.affectedAreaSqMeters / Math.PI), 90) : 100)
                : isPower
                ? (inc.aiAnalysis.powerOutageRadiusMeters || 350)
                : 80;

              const fillColor = isWater ? '#06b6d4' : isPower ? '#f59e0b' : '#a855f7';
              const strokeColor = isWater ? '#22d3ee' : isPower ? '#fbbf24' : '#c084fc';

              return (
                <MapCircle
                  key={`circle-${inc.id}`}
                  center={{ lat: inc.location.lat, lng: inc.location.lng }}
                  radius={radius}
                  options={{
                    fillColor,
                    fillOpacity: isWater ? 0.22 : 0.15,
                    strokeColor,
                    strokeOpacity: 0.6,
                    strokeWeight: 1.5,
                  }}
                />
              );
            })}

            {/* Real-Time Incident Markers */}
            {filteredIncidents.map(inc => {
              const isSelected = selectedIncident?.id === inc.id;
              const isCritical = inc.severity === 'CRITICAL';
              const isResolved = inc.status === 'RESOLVED';
              
              // Marker styling according to category
              let borderColor = '#06b6d4';
              let badgeBg = '#083344';
              let iconChar = '💧';
              let label = 'Waterlogging';

              if (inc.category === 'POWER_FAILURE') {
                borderColor = '#f59e0b';
                badgeBg = '#451a03';
                iconChar = '⚡';
                label = 'Grid Outage';
              } else if (inc.category === 'DRAINAGE_BLOCKAGE') {
                borderColor = '#ec4899';
                badgeBg = '#500724';
                iconChar = '🚧';
                label = 'Drain Block';
              } else if (inc.category === 'ROAD_SUBSIDENCE') {
                borderColor = '#a855f7';
                badgeBg = '#2e1065';
                iconChar = '⚠️';
                label = 'Subsidence';
              }

              if (isResolved) {
                borderColor = '#10b981';
                badgeBg = '#064e3b';
                iconChar = '✅';
              }

              return (
                <AdvancedMarker
                  key={inc.id}
                  position={{ lat: inc.location.lat, lng: inc.location.lng }}
                  onClick={() => {
                    onSelectIncident(inc);
                    setInfoWindowIncident(inc);
                    setSelectedCrew(null);
                    setSelectedCitizenReport(null);
                  }}
                  title={`${inc.title} (${inc.severity})`}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    {/* Live Ping Ring for Critical Incidents */}
                    {isCritical && !isResolved && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: '-6px',
                          borderRadius: '16px',
                          border: '2px solid #ef4444',
                          animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                          opacity: 0.75
                        }}
                      />
                    )}

                    {/* Main Marker Box */}
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        backgroundColor: '#0d1117',
                        border: `2.5px solid ${isSelected ? '#38bdf8' : borderColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isSelected 
                          ? `0 0 18px ${borderColor}, 0 4px 8px rgba(0,0,0,0.8)` 
                          : `0 0 10px ${borderColor}66, 0 3px 6px rgba(0,0,0,0.6)`,
                        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease-out'
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{iconChar}</span>
                    </div>

                    {/* Severity / Status Dot */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: isResolved ? '#10b981' : isCritical ? '#ef4444' : inc.severity === 'HIGH' ? '#f59e0b' : '#38bdf8',
                        border: '2px solid #0d1117'
                      }}
                    />
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Maintenance Crews GPS Real-Time Markers */}
            {showCrews && crews.map(crew => {
              const isWorking = crew.status === 'WORKING' || crew.status === 'EN_ROUTE';
              return (
                <AdvancedMarker
                  key={crew.id}
                  position={{ lat: crew.currentLocation.lat, lng: crew.currentLocation.lng }}
                  onClick={() => {
                    setSelectedCrew(crew);
                    setInfoWindowIncident(null);
                    setSelectedCitizenReport(null);
                  }}
                  title={`${crew.name} - ${crew.status}`}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: '#0d1117',
                      border: `2px solid ${isWorking ? '#a855f7' : '#10b981'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 12px ${isWorking ? '#a855f7' : '#10b981'}88`,
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>🚚</span>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Citizen Ground-Truth Photo Markers */}
            {showCitizens && citizenReports.map(rep => (
              <AdvancedMarker
                key={rep.id}
                position={{ lat: rep.location.lat, lng: rep.location.lng }}
                onClick={() => {
                  setSelectedCitizenReport(rep);
                  setInfoWindowIncident(null);
                  setSelectedCrew(null);
                }}
                title={`Citizen Report by ${rep.userName}`}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#0d1117',
                    border: '2px solid #38bdf8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(56, 189, 248, 0.5)',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '13px' }}>📸</span>
                </div>
              </AdvancedMarker>
            ))}

            {/* Interactive InfoWindow for Selected Incident */}
            {infoWindowIncident && (
              <InfoWindow
                position={{ lat: infoWindowIncident.location.lat, lng: infoWindowIncident.location.lng }}
                onCloseClick={() => setInfoWindowIncident(null)}
                pixelOffset={[0, -25]}
              >
                <div className="text-[#c9d1d9] font-sans p-1 max-w-xs sm:max-w-sm space-y-3">
                  
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#30363d] pb-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          infoWindowIncident.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : infoWindowIncident.severity === 'HIGH'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {infoWindowIncident.severity}
                        </span>
                        <span className="text-[10px] font-mono text-[#8b949e]">
                          {infoWindowIncident.id}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#f0f6fc] leading-snug">
                        {infoWindowIncident.title}
                      </h4>
                    </div>
                  </div>

                  {/* Location and Telemetry */}
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-[#8b949e]">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="line-clamp-1">{infoWindowIncident.location.address}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-[#161b22] border border-[#21262d] font-mono text-[10px]">
                      <div>
                        <span className="text-[#8b949e] block">
                          {infoWindowIncident.category === 'POWER_FAILURE' ? 'Outage Radius' : 'Est. Water Depth'}
                        </span>
                        <span className="text-cyan-400 font-bold">
                          {infoWindowIncident.category === 'POWER_FAILURE'
                            ? `${infoWindowIncident.aiAnalysis.powerOutageRadiusMeters || 1200}m`
                            : `${infoWindowIncident.aiAnalysis.estimatedWaterDepthCm || 65} cm`}
                        </span>
                      </div>

                      <div>
                        <span className="text-[#8b949e] block">Affected Area</span>
                        <span className="text-[#f0f6fc] font-bold">
                          {infoWindowIncident.aiAnalysis.affectedAreaSqMeters.toLocaleString()} m²
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MAINTENANCE CREW STATUS CONTROLS */}
                  <div className="space-y-1.5 pt-1 border-t border-[#30363d]">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#8b949e]">
                      <span>Maintenance Crew Status</span>
                      <span className="text-cyan-400 font-mono">
                        {infoWindowIncident.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Step buttons for maintenance crew updates */}
                    <div className="grid grid-cols-4 gap-1">
                      {(['DETECTED', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED'] as IncidentStatus[]).map(st => {
                        const isCurrent = infoWindowIncident.status === st;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(infoWindowIncident.id, st)}
                            className={`py-1 px-1 text-[9px] font-bold rounded border transition-all cursor-pointer text-center ${
                              isCurrent
                                ? st === 'RESOLVED'
                                  ? 'bg-emerald-500 text-[#05060a] border-emerald-400 shadow-sm'
                                  : 'bg-cyan-500 text-[#05060a] border-cyan-400 shadow-sm'
                                : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-[#c9d1d9] hover:bg-[#21262d]'
                            }`}
                            title={`Update incident status to ${st}`}
                          >
                            {st === 'DETECTED' ? 'Reported' : st === 'DISPATCHED' ? 'Dispatched' : st === 'IN_PROGRESS' ? 'Progress' : 'Resolved'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onOpenDispatchForIncident(infoWindowIncident)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-[#30363d]"
                    >
                      <Truck className="w-3 h-3" />
                      <span>{infoWindowIncident.assignedCrewName ? 'Manage Crew' : 'Assign Crew'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectIncident(infoWindowIncident)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#05060a] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Full Dossier</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                </div>
              </InfoWindow>
            )}

            {/* Crew InfoWindow */}
            {selectedCrew && (
              <InfoWindow
                position={{ lat: selectedCrew.currentLocation.lat, lng: selectedCrew.currentLocation.lng }}
                onCloseClick={() => setSelectedCrew(null)}
                pixelOffset={[0, -20]}
              >
                <div className="text-[#c9d1d9] font-sans p-1 max-w-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-[#30363d] pb-1.5">
                    <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      {selectedCrew.name}
                    </h4>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      {selectedCrew.status}
                    </span>
                  </div>
                  <div className="text-[11px] space-y-1">
                    <p className="text-[#8b949e]">Lead: <strong className="text-[#c9d1d9]">{selectedCrew.leadEngineer}</strong></p>
                    <p className="text-[#8b949e]">Contact: <span className="font-mono text-[#c9d1d9]">{selectedCrew.contactNumber}</span></p>
                    <p className="text-[#8b949e]">Location: <span className="italic text-[#c9d1d9]">{selectedCrew.currentLocation.label}</span></p>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Citizen Report InfoWindow */}
            {selectedCitizenReport && (
              <InfoWindow
                position={{ lat: selectedCitizenReport.location.lat, lng: selectedCitizenReport.location.lng }}
                onCloseClick={() => setSelectedCitizenReport(null)}
                pixelOffset={[0, -20]}
              >
                <div className="text-[#c9d1d9] font-sans p-1 max-w-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-[#30363d] pb-1.5">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" />
                      Citizen Ground Report
                    </span>
                    <span className="text-[10px] font-mono text-[#8b949e]">
                      👍 {selectedCitizenReport.upvotes}
                    </span>
                  </div>
                  {selectedCitizenReport.photoUrl && (
                    <img
                      src={selectedCitizenReport.photoUrl}
                      alt="Ground report"
                      className="w-full h-24 object-cover rounded-lg border border-[#30363d]"
                    />
                  )}
                  <p className="text-[11px] text-[#c9d1d9] leading-relaxed">
                    "{selectedCitizenReport.description}"
                  </p>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    {selectedCitizenReport.verifiedByMunicipal ? '✅ Verified by Municipal AI' : '⏳ Pending Corroboration'}
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Sentinel-1 SAR SegFormer Cluster InfoWindow */}
            {selectedSarZone && (
              <InfoWindow
                position={{ lat: selectedSarZone.lat, lng: selectedSarZone.lng }}
                onCloseClick={() => setSelectedSarZone(null)}
                pixelOffset={[0, -20]}
              >
                <div className="text-[#c9d1d9] font-sans p-1 max-w-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-[#30363d] pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-cyan-300">🛰️ Sentinel-1 SAR Detection</span>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                        {selectedSarZone.priority}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1 py-0.5 rounded border border-emerald-800">
                      {selectedSarZone.confidence}% Conf
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-bold text-[#f0f6fc]">{selectedSarZone.locationName}</h4>
                    <p className="text-[10px] text-[#8b949e]">{selectedSarZone.ward}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-[#161b22] border border-[#21262d] font-mono text-[10px]">
                    <div>
                      <span className="text-[#8b949e] block">Est. Submersion</span>
                      <span className="text-cyan-400 font-bold">{selectedSarZone.depthCm} cm</span>
                    </div>
                    <div>
                      <span className="text-[#8b949e] block">Water Area</span>
                      <span className="text-[#f0f6fc] font-bold">{(selectedSarZone.areaSqMeters / 10000).toFixed(1)} ha</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-rose-300">
                    ⚠️ {selectedSarZone.criticalAssetThreat}
                  </p>

                  <div className="pt-1 border-t border-[#30363d] flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-400">SegFormer-B2 Model</span>
                    <button
                      type="button"
                      onClick={() => onOpenSatelliteAnalyzer()}
                      className="px-2 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Inspect Water Mask
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Historical Risk Hotspot InfoWindow */}
            {selectedHistoricalHotspot && (
              <InfoWindow
                position={{ lat: selectedHistoricalHotspot.lat, lng: selectedHistoricalHotspot.lng }}
                onCloseClick={() => setSelectedHistoricalHotspot(null)}
                pixelOffset={[0, -25]}
              >
                <div className="text-[#c9d1d9] font-sans p-1.5 max-w-xs sm:max-w-sm space-y-2.5">
                  
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#30363d] pb-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                          {selectedHistoricalHotspot.vulnerabilityGrade.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          {selectedHistoricalHotspot.ward}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#f0f6fc] leading-snug">
                        {selectedHistoricalHotspot.name}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white">
                      {selectedHistoricalHotspot.historicalFrequencyScore}% 5-Yr Risk
                    </span>
                  </div>

                  {/* Telemetry and Recurrence Metrics */}
                  <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-[#161b22] border border-[#21262d] font-mono text-[10px]">
                    <div>
                      <span className="text-[#8b949e] block">Historical Events</span>
                      <span className="text-rose-400 font-bold">{selectedHistoricalHotspot.incidentsCount5Years} in 5 Years</span>
                    </div>
                    <div>
                      <span className="text-[#8b949e] block">Zone Buffer</span>
                      <span className="text-cyan-300 font-bold">{selectedHistoricalHotspot.radiusMeters}m radius</span>
                    </div>
                  </div>

                  {/* Recurrence Trigger & Root Cause */}
                  <div className="space-y-1.5 text-[11px]">
                    <div className="text-[#8b949e]">
                      <strong className="text-amber-300">⚡ Trigger: </strong>
                      <span className="text-slate-300">{selectedHistoricalHotspot.recurrenceTrigger}</span>
                    </div>
                    <div className="text-[#8b949e]">
                      <strong className="text-slate-200">🏗️ Root Cause: </strong>
                      <span className="text-slate-300">{selectedHistoricalHotspot.primaryCause}</span>
                    </div>
                  </div>

                  {/* Active Incident Overlap & Comparison */}
                  {selectedHistoricalHotspot.activeIncidentOverlapId && (
                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 space-y-1 text-[10px]">
                      <div className="flex items-center justify-between text-amber-300 font-bold">
                        <span>🔥 Active Incident Overlap Detected</span>
                        <span className="font-mono">{selectedHistoricalHotspot.activeIncidentOverlapId}</span>
                      </div>
                      <p className="text-amber-200/90 leading-tight">
                        {selectedHistoricalHotspot.activeIncidentOverlapTitle}
                      </p>
                      
                      {/* Action to select and view active incident */}
                      {(() => {
                        const matchingInc = incidents.find(i => i.id === selectedHistoricalHotspot.activeIncidentOverlapId);
                        if (!matchingInc) return null;
                        return (
                          <div className="pt-1 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                onSelectIncident(matchingInc);
                                setInfoWindowIncident(matchingInc);
                                setSelectedHistoricalHotspot(null);
                              }}
                              className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-[9px] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Focus Incident Dossier</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Long-Term Mitigation */}
                  <div className="pt-1.5 border-t border-[#30363d] text-[10px] text-emerald-400">
                    <strong className="text-emerald-300">💡 AI Long-Term Plan: </strong>
                    <span className="text-slate-300">{selectedHistoricalHotspot.longTermMitigationPlan}</span>
                  </div>

                </div>
              </InfoWindow>
            )}

          </Map>
        </div>
      </APIProvider>

      {/* FLOATING TOP-CENTER HISTORICAL RISK HEATMAP COMPARISON HUD */}
      {isHistoricalHeatmapActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-auto max-w-xl w-full px-4 hidden md:block">
          <div className="bg-[#0d1117]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-rose-500/40 shadow-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                <Flame className="w-4 h-4" />
              </span>
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  Historical Risk Heatmap Overlay
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    5-Yr Recurrence
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Comparing current real-time incidents with 8 chronic infrastructure failure zones.
                </div>
              </div>
            </div>

            {/* Quick Category Switcher */}
            <div className="flex items-center gap-1">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'WATER_LOGGING', label: '🌊 Flood' },
                { id: 'DRAINAGE_BLOCKAGE', label: '🚰 Drains' },
                { id: 'POWER_FAILURE', label: '⚡ Grid' },
                { id: 'ROAD_SUBSIDENCE', label: '🚧 Roads' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectHistoricalCategory(cat.id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    activeHistoricalCategory === cat.id
                      ? 'bg-rose-600 text-white'
                      : 'bg-[#161b22] text-[#8b949e] hover:text-white border border-[#30363d]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handleToggleHistoricalHeatmap(false)}
                className="ml-1 text-[10px] font-mono text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                title="Hide Historical Heatmap"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP COMMAND DASHBOARD & MULTI-FILTER BAR */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-sm sm:max-w-md pointer-events-auto">
        
        {/* Main Filter & Metric HUD */}
        <div className="bg-[#0d1117]/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#21262d] shadow-2xl space-y-3">
          
          {/* Header & Search */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider">
                  Urban Incident Command Map
                </h3>
                <p className="text-[10px] font-mono text-[#8b949e]">
                  {filteredIncidents.length} shown of {incidents.length} total
                </p>
              </div>
            </div>

            <button
              onClick={onOpenSatelliteAnalyzer}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-[#05060a] font-bold text-[11px] flex items-center gap-1 shadow-md shadow-cyan-500/20 cursor-pointer transition-all"
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Scan</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Ward, Address, or Ticket ID..."
              className="w-full bg-[#161b22] border border-[#30363d] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[#8b949e] hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Metrics Badges Bar */}
          <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
            <div
              onClick={() => setFilterType(filterType === 'WATER_LOGGING' ? 'ALL' : 'WATER_LOGGING')}
              className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                filterType === 'WATER_LOGGING'
                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                  : 'bg-[#161b22] border-[#21262d] text-[#8b949e] hover:border-[#30363d]'
              }`}
            >
              <span className="text-[10px] block">💧 Flooding</span>
              <strong className="text-xs text-cyan-400">{stats.waterlogging}</strong>
            </div>

            <div
              onClick={() => setFilterType(filterType === 'POWER_FAILURE' ? 'ALL' : 'POWER_FAILURE')}
              className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                filterType === 'POWER_FAILURE'
                  ? 'bg-amber-950/60 border-amber-400 text-amber-300'
                  : 'bg-[#161b22] border-[#21262d] text-[#8b949e] hover:border-[#30363d]'
              }`}
            >
              <span className="text-[10px] block">⚡ Power</span>
              <strong className="text-xs text-amber-400">{stats.powerOutages}</strong>
            </div>

            <div
              onClick={() => setFilterSeverity(filterSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
              className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                filterSeverity === 'CRITICAL'
                  ? 'bg-rose-950/60 border-rose-400 text-rose-300'
                  : 'bg-[#161b22] border-[#21262d] text-[#8b949e] hover:border-[#30363d]'
              }`}
            >
              <span className="text-[10px] block">🚨 Critical</span>
              <strong className="text-xs text-rose-400">{stats.critical}</strong>
            </div>

            <div
              onClick={() => setFilterStatus(filterStatus === 'RESOLVED' ? 'ALL' : 'RESOLVED')}
              className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                filterStatus === 'RESOLVED'
                  ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300'
                  : 'bg-[#161b22] border-[#21262d] text-[#8b949e] hover:border-[#30363d]'
              }`}
            >
              <span className="text-[10px] block">✅ Resolved</span>
              <strong className="text-xs text-emerald-400">{stats.resolved}</strong>
            </div>
          </div>

          {/* DETAILED MULTI-DIMENSIONAL FILTERS */}
          <div className="space-y-2 pt-2 border-t border-[#21262d] text-xs">
            
            {/* Filter 1: Incident Type */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-[#8b949e]">Type:</span>
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'WATER_LOGGING', label: 'Water' },
                  { id: 'POWER_FAILURE', label: 'Power Grid' },
                  { id: 'DRAINAGE_BLOCKAGE', label: 'Drainage' },
                  { id: 'ROAD_SUBSIDENCE', label: 'Roads' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setFilterType(t.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      filterType === t.id
                        ? 'bg-cyan-500 text-[#05060a] font-bold'
                        : 'bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 2: Severity */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-[#8b949e]">Severity:</span>
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'CRITICAL', label: 'Critical' },
                  { id: 'HIGH', label: 'High' },
                  { id: 'MEDIUM', label: 'Medium' },
                  { id: 'LOW', label: 'Low' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setFilterSeverity(s.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      filterSeverity === s.id
                        ? 'bg-amber-500 text-[#05060a] font-bold'
                        : 'bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 3: Status */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-[#8b949e]">Status:</span>
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'DETECTED', label: 'Detected' },
                  { id: 'DISPATCHED', label: 'Dispatched' },
                  { id: 'IN_PROGRESS', label: 'In Progress' },
                  { id: 'RESOLVED', label: 'Resolved' }
                ].map(st => (
                  <button
                    key={st.id}
                    onClick={() => setFilterStatus(st.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      filterStatus === st.id
                        ? 'bg-purple-500 text-white font-bold'
                        : 'bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Filters button if any active */}
            {(filterType !== 'ALL' || filterSeverity !== 'ALL' || filterStatus !== 'ALL' || searchQuery) && (
              <div className="pt-1 flex justify-end">
                <button
                  onClick={handleResetFilters}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset all filters
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Map Type & Vector Layer Toggles */}
        <div className="bg-[#0d1117]/95 backdrop-blur-md p-3 rounded-2xl border border-[#21262d] shadow-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Google Map Layers
            </span>
            <div className="flex items-center gap-1 text-[10px]">
              {(['roadmap', 'satellite', 'hybrid', 'terrain'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setMapType(type)}
                  className={`px-2 py-0.5 rounded font-semibold capitalize transition-all cursor-pointer ${
                    mapType === type
                      ? 'bg-cyan-500 text-[#05060a] font-bold'
                      : 'bg-[#161b22] text-[#8b949e] hover:text-[#c9d1d9]'
                  }`}
                >
                  {type === 'roadmap' ? 'Map' : type === 'satellite' ? 'Sat' : type === 'hybrid' ? 'Hybrid' : 'Terrain'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#c9d1d9] pt-1 border-t border-[#21262d]">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showPowerGrid}
                onChange={e => setShowPowerGrid(e.target.checked)}
                className="rounded bg-[#161b22] border-[#30363d] text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Power Grid (33kV)
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showDrainage}
                onChange={e => setShowDrainage(e.target.checked)}
                className="rounded bg-[#161b22] border-[#30363d] text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-blue-400" />
                Storm Drainage
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCrews}
                onChange={e => setShowCrews(e.target.checked)}
                className="rounded bg-[#161b22] border-[#30363d] text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3 text-purple-400" />
                Crews (GPS)
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCitizens}
                onChange={e => setShowCitizens(e.target.checked)}
                className="rounded bg-[#161b22] border-[#30363d] text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Camera className="w-3 h-3 text-emerald-400" />
                Citizen Photos
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none col-span-2 pt-1 border-t border-[#21262d]">
              <input
                type="checkbox"
                checked={showSarWaterMask}
                onChange={e => setShowSarWaterMask(e.target.checked)}
                className="rounded bg-[#161b22] border-[#30363d] text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1 font-semibold text-cyan-300">
                <span className="text-xs">🛰️</span>
                Sentinel-1 SAR Mask (SegFormer-B2)
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none col-span-2 pt-1 border-t border-[#21262d]">
              <input
                type="checkbox"
                checked={isHistoricalHeatmapActive}
                onChange={e => handleToggleHistoricalHeatmap(e.target.checked)}
                className="rounded bg-[#161b22] border-[#30363d] text-rose-500 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center justify-between w-full font-semibold text-rose-400">
                <span className="flex items-center gap-1">
                  <span className="text-xs">🔥</span>
                  Historical Risk Heatmap (5-Yr)
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono">
                  {HISTORICAL_RISK_HOTSPOTS.length} Zones
                </span>
              </span>
            </label>
          </div>
        </div>

      </div>

      {/* RIGHT-SIDE QUICK INCIDENT DRAWER */}
      <div className="absolute top-4 right-4 z-10 w-80 max-h-[calc(100vh-100px)] flex flex-col gap-2 pointer-events-auto">
        
        {/* Drawer Header Card */}
        <div className="bg-[#0d1117]/95 backdrop-blur-md p-3 rounded-2xl border border-[#21262d] shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold text-[#f0f6fc]">
              Live Incidents Feed ({filteredIncidents.length})
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer"
          >
            {isSidebarOpen ? 'Minimize' : 'Expand'}
          </button>
        </div>

        {/* Scrollable list of active incidents */}
        {isSidebarOpen && (
          <div className="overflow-y-auto space-y-2 pr-1 max-h-[480px]">
            {filteredIncidents.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#0d1117]/95 border border-[#21262d] text-center text-xs text-[#8b949e]">
                No incidents matching the active filter criteria.
              </div>
            ) : (
              filteredIncidents.map(inc => {
                const isSelected = selectedIncident?.id === inc.id;
                const isCritical = inc.severity === 'CRITICAL';
                const isResolved = inc.status === 'RESOLVED';

                return (
                  <div
                    key={inc.id}
                    id={`incident-card-${inc.id}`}
                    onClick={() => {
                      onSelectIncident(inc);
                      setInfoWindowIncident(inc);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer bg-[#0d1117]/95 backdrop-blur-md shadow-lg ${
                      isSelected
                        ? 'border-cyan-400 ring-1 ring-cyan-400/50 bg-[#161b22]'
                        : isCritical && !isResolved
                        ? 'border-rose-900/60 hover:border-rose-500'
                        : 'border-[#21262d] hover:border-[#30363d]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isResolved
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : isCritical
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}>
                          {inc.severity}
                        </span>
                        <span className="text-[10px] font-mono text-[#8b949e]">
                          {inc.category === 'WATER_LOGGING' ? '💧 Water' : inc.category === 'POWER_FAILURE' ? '⚡ Power' : '🚧 Drain'}
                        </span>
                      </div>
                      
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

                    {/* Maintenance Crew & Quick Status Updates */}
                    <div className="pt-2 border-t border-[#21262d] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-cyan-400 font-semibold truncate max-w-[140px]">
                          {inc.assignedCrewName ? `🚚 ${inc.assignedCrewName}` : 'Crew Unassigned'}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded font-bold ${
                          isResolved ? 'text-emerald-400' : 'text-purple-400'
                        }`}>
                          {inc.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Quick Status Buttons on Sidebar Card */}
                      <div className="flex items-center gap-1 pt-1">
                        {(['DISPATCHED', 'IN_PROGRESS', 'RESOLVED'] as IncidentStatus[]).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(inc.id, st);
                            }}
                            className={`flex-1 py-0.5 rounded text-[9px] font-bold border transition-colors cursor-pointer ${
                              inc.status === st
                                ? 'bg-cyan-500 text-[#05060a] border-cyan-400'
                                : 'bg-[#161b22] text-[#8b949e] border-[#21262d] hover:text-[#c9d1d9]'
                            }`}
                          >
                            {st === 'DISPATCHED' ? 'Dispatch' : st === 'IN_PROGRESS' ? 'Work' : 'Resolve'}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

      </div>

    </div>
  );
};
