/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { CityCommandDashboard } from './components/CityCommandDashboard';
import { AICommandCenter } from './components/AICommandCenter';
import { PredictiveHub } from './components/PredictiveHub';
import { SatelliteMap } from './components/SatelliteMap';
import { IncidentListView } from './components/IncidentListView';
import { DispatchManagement } from './components/DispatchManagement';
import { CommunityReporting } from './components/CommunityReporting';
import { HistoricalTrends } from './components/HistoricalTrends';
import { SatelliteAnalyzerModal } from './components/SatelliteAnalyzerModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { PushNotificationCenter } from './components/PushNotificationCenter';
import { EmergencyBroadcastModal } from './components/EmergencyBroadcastModal';

import { 
  Incident, 
  MaintenanceCrew, 
  CitizenReport, 
  NotificationItem, 
  WeatherData, 
  IncidentStatus,
  CityHealthOverview,
  PredictiveFloodForecast,
  YoloRoadDamageDetection,
  WasteHotspotItem,
  HeatwaveForecastItem,
  WaterSecurityForecastItem,
  WardRiskProfile
} from './types';
import { 
  INITIAL_INCIDENTS, 
  INITIAL_CREWS, 
  INITIAL_CITIZEN_REPORTS, 
  INITIAL_WEATHER,
  INITIAL_CITY_HEALTH,
  INITIAL_PREDICTIVE_FLOOD,
  INITIAL_ROAD_DAMAGES,
  INITIAL_WASTE_HOTSPOTS,
  INITIAL_HEATWAVE,
  INITIAL_WATER_SECURITY,
  WARD_RISK_PROFILES
} from './data/mockData';
import { playNotificationChime } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<'command' | 'map' | 'copilot' | 'predictive' | 'incidents' | 'crews' | 'community' | 'analytics'>('command');
  
  // Primary datasets
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [crews, setCrews] = useState<MaintenanceCrew[]>(INITIAL_CREWS);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>(INITIAL_CITIZEN_REPORTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(INITIAL_WEATHER);

  // Resilience AI datasets
  const [cityHealth, setCityHealth] = useState<CityHealthOverview>(INITIAL_CITY_HEALTH);
  const [predictiveFlood, setPredictiveFlood] = useState<PredictiveFloodForecast>(INITIAL_PREDICTIVE_FLOOD);
  const [roadDamages, setRoadDamages] = useState<YoloRoadDamageDetection[]>(INITIAL_ROAD_DAMAGES);
  const [wasteHotspots, setWasteHotspots] = useState<WasteHotspotItem[]>(INITIAL_WASTE_HOTSPOTS);
  const [heatwave, setHeatwave] = useState<HeatwaveForecastItem>(INITIAL_HEATWAVE);
  const [waterSecurity, setWaterSecurity] = useState<WaterSecurityForecastItem>(INITIAL_WATER_SECURITY);
  const [wardProfiles, setWardProfiles] = useState<WardRiskProfile[]>(WARD_RISK_PROFILES);

  // Modals & Drawers state
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSatelliteModalOpen, setIsSatelliteModalOpen] = useState(false);
  const [isNotificationsDrawerOpen, setIsNotificationsDrawerOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  // System options
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all live data from backend
  const fetchAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [incRes, crewRes, citRes, notifRes, analyticsRes, resilienceRes, roadRes, wasteRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/crews'),
        fetch('/api/citizen-reports'),
        fetch('/api/notifications'),
        fetch('/api/analytics'),
        fetch('/api/resilience/overview'),
        fetch('/api/resilience/road-intelligence'),
        fetch('/api/resilience/waste-intelligence')
      ]);

      if (incRes.ok) {
        const data = await incRes.json();
        if (data.incidents) setIncidents(data.incidents);
      }
      if (crewRes.ok) {
        const data = await crewRes.json();
        if (data.crews) setCrews(data.crews);
      }
      if (citRes.ok) {
        const data = await citRes.json();
        if (data.reports) setCitizenReports(data.reports);
      }
      if (notifRes.ok) {
        const data = await notifRes.json();
        if (data.notifications) setNotifications(data.notifications);
      }
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        if (data.weather) setWeather(data.weather);
      }
      if (resilienceRes.ok) {
        const data = await resilienceRes.json();
        if (data.cityHealth) setCityHealth(data.cityHealth);
        if (data.predictiveFlood) setPredictiveFlood(data.predictiveFlood);
        if (data.wardRiskProfiles) setWardProfiles(data.wardRiskProfiles);
        if (data.heatwaveForecast) setHeatwave(data.heatwaveForecast);
        if (data.waterSecurity) setWaterSecurity(data.waterSecurity);
      }
      if (roadRes.ok) {
        const data = await roadRes.json();
        if (data.roadDamages) setRoadDamages(data.roadDamages);
      }
      if (wasteRes.ok) {
        const data = await wasteRes.json();
        if (data.hotspots) setWasteHotspots(data.hotspots);
      }
    } catch (err) {
      console.warn('Backend fetch fallback to local state:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 20000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Handler: Select Incident
  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailModalOpen(true);
  };

  // Handler: Select Incident from Notification by ID
  const handleSelectIncidentById = (incidentId: string) => {
    const found = incidents.find(i => i.id === incidentId);
    if (found) {
      setSelectedIncident(found);
      setIsDetailModalOpen(true);
      setActiveTab('map');
    }
  };

  // Handler: Open Dispatch from map
  const handleOpenDispatchForIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setActiveTab('crews');
  };

  // Handler: Create Incident from AI Satellite Analysis
  const handleCreateIncidentFromAnalysis = async (incidentData: Partial<Incident>) => {
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData)
      });

      if (res.ok) {
        const data = await res.json();
        setIncidents(prev => [data.incident, ...prev]);
        setSelectedIncident(data.incident);
        if (soundEnabled) playNotificationChime('critical');
        setActiveTab('map');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Update Incident Status
  const handleUpdateStatus = async (incidentId: string, status: IncidentStatus) => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        const data = await res.json();
        setIncidents(prev => prev.map(i => i.id === incidentId ? data.incident : i));
        if (selectedIncident?.id === incidentId) {
          setSelectedIncident(data.incident);
        }
        if (soundEnabled) playNotificationChime(status === 'RESOLVED' ? 'success' : 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Assign Crew
  const handleAssignCrew = async (incidentId: string, crewId: string) => {
    try {
      const res = await fetch(`/api/crews/${crewId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId, etaMinutes: 12 })
      });

      if (res.ok) {
        const data = await res.json();
        setCrews(prev => prev.map(c => c.id === crewId ? data.crew : c));
        setIncidents(prev => prev.map(i => {
          if (i.id === incidentId) {
            return {
              ...i,
              status: 'DISPATCHED',
              assignedCrewId: crewId,
              assignedCrewName: data.crew.name,
              assignedCrewEtaMinutes: 12
            };
          }
          return i;
        }));

        if (selectedIncident?.id === incidentId) {
          setSelectedIncident(prev => prev ? {
            ...prev,
            status: 'DISPATCHED',
            assignedCrewId: crewId,
            assignedCrewName: data.crew.name,
            assignedCrewEtaMinutes: 12
          } : null);
        }

        if (soundEnabled) playNotificationChime('dispatch');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Public Advisory
  const handleIssuePublicAdvisory = async (incidentId: string) => {
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicAdvisoryIssued: true })
      });

      if (res.ok) {
        const data = await res.json();
        setIncidents(prev => prev.map(i => i.id === incidentId ? data.incident : i));
        if (selectedIncident?.id === incidentId) {
          setSelectedIncident(data.incident);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Submit Citizen Report
  const handleSubmitCitizenReport = async (reportData: Partial<CitizenReport>) => {
    try {
      const res = await fetch('/api/citizen-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });

      if (res.ok) {
        const data = await res.json();
        setCitizenReports(prev => [data.report, ...prev]);
        if (soundEnabled) playNotificationChime('info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Verify Citizen Report
  const handleVerifyCitizenReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/citizen-reports/${reportId}/verify`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        setCitizenReports(prev => prev.map(r => r.id === reportId ? data.report : r));
        if (soundEnabled) playNotificationChime('success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handler: Send Emergency Broadcast
  const handleSendBroadcast = async (title: string, message: string, targetWard: string) => {
    try {
      const res = await fetch('/api/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, targetWard })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.notification) {
          setNotifications(prev => [data.notification, ...prev]);
        }
        if (soundEnabled) playNotificationChime('critical');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Unread notifications count
  const unreadNotifsCount = notifications.filter(n => !n.read).length;
  const criticalIncidentsCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        weather={weather}
        cityHealth={cityHealth}
        notifications={notifications}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationsDrawerOpen(true)}
        onOpenSatelliteAnalyzer={() => setIsSatelliteModalOpen(true)}
        onOpenEmergencyBroadcast={() => setIsBroadcastModalOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        isRefreshing={isRefreshing}
        onRefresh={fetchAllData}
        criticalIncidentsCount={criticalIncidentsCount}
      />

      {/* Main View Port */}
      <main className="flex-1 w-full relative">
        {/* Command Dashboard */}
        {activeTab === 'command' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <CityCommandDashboard
              cityHealth={cityHealth}
              wardProfiles={wardProfiles}
              floodForecast={predictiveFlood}
              onNavigateTab={setActiveTab}
              onSelectWard={(ward) => {
                setActiveTab('map');
              }}
              onTriggerQuickAction={(act) => {
                if (act === 'broadcast') setIsBroadcastModalOpen(true);
              }}
            />
          </div>
        )}

        {/* AI Command Center Copilot */}
        {activeTab === 'copilot' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <AICommandCenter
              onTriggerAction={(actionType) => {
                if (actionType === 'BROADCAST') setIsBroadcastModalOpen(true);
                if (actionType === 'DISPATCH') setActiveTab('crews');
              }}
            />
          </div>
        )}

        {/* Predictive Intelligence Hub */}
        {activeTab === 'predictive' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <PredictiveHub
              floodForecast={predictiveFlood}
              roadDamages={roadDamages}
              wasteHotspots={wasteHotspots}
              heatwave={heatwave}
              waterSecurity={waterSecurity}
              onDispatchCrew={() => setActiveTab('crews')}
            />
          </div>
        )}

        {/* GIS Map */}
        {activeTab === 'map' && (
          <SatelliteMap
            incidents={incidents}
            crews={crews}
            citizenReports={citizenReports}
            selectedIncident={selectedIncident}
            onSelectIncident={handleSelectIncident}
            onOpenDispatchForIncident={handleOpenDispatchForIncident}
            onOpenSatelliteAnalyzer={() => setIsSatelliteModalOpen(true)}
            onUpdateStatus={handleUpdateStatus}
            onAssignCrew={handleAssignCrew}
          />
        )}

        {/* Incident List */}
        {activeTab === 'incidents' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <IncidentListView
              incidents={incidents}
              onSelectIncident={handleSelectIncident}
              onOpenSatelliteAnalyzer={() => setIsSatelliteModalOpen(true)}
            />
          </div>
        )}

        {/* Dispatch Management */}
        {activeTab === 'crews' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <DispatchManagement
              crews={crews}
              incidents={incidents}
              onDispatchCrew={handleAssignCrew}
              onSelectIncident={handleSelectIncident}
            />
          </div>
        )}

        {/* Citizen Reporting & NLP */}
        {activeTab === 'community' && (
          <CommunityReporting
            reports={citizenReports}
            incidents={incidents}
            onSubmitReport={handleSubmitCitizenReport}
            onVerifyReport={handleVerifyCitizenReport}
          />
        )}

        {/* Historical Trends */}
        {activeTab === 'analytics' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <HistoricalTrends
              incidents={incidents}
            />
          </div>
        )}
      </main>

      {/* Satellite AI Scanner Modal */}
      <SatelliteAnalyzerModal
        isOpen={isSatelliteModalOpen}
        onClose={() => setIsSatelliteModalOpen(false)}
        onCreateIncidentFromAnalysis={handleCreateIncidentFromAnalysis}
      />

      {/* Full Incident Dossier Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        crews={crews}
        citizenReports={citizenReports}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onAssignCrew={handleAssignCrew}
        onIssuePublicAdvisory={handleIssuePublicAdvisory}
      />

      {/* Push Notification Drawer */}
      <PushNotificationCenter
        isOpen={isNotificationsDrawerOpen}
        onClose={() => setIsNotificationsDrawerOpen(false)}
        notifications={notifications}
        onSelectIncidentById={handleSelectIncidentById}
        onClearAll={() => setNotifications([])}
        onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
      />

      {/* Emergency Broadcast Modal */}
      <EmergencyBroadcastModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onSendBroadcast={handleSendBroadcast}
      />

    </div>
  );
}
