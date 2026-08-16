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
import { InteractiveEarthGlobe } from './components/InteractiveEarthGlobe';
import { IncidentListView } from './components/IncidentListView';
import { DispatchManagement } from './components/DispatchManagement';
import { CommunityReporting } from './components/CommunityReporting';
import { HistoricalTrends } from './components/HistoricalTrends';
import { SatelliteAnalyzerModal } from './components/SatelliteAnalyzerModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { PushNotificationCenter } from './components/PushNotificationCenter';
import { EmergencyBroadcastModal } from './components/EmergencyBroadcastModal';
import { AuthoritySwitchModal } from './components/AuthoritySwitchModal';
import { ApprovalQueueModal } from './components/ApprovalQueueModal';

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
  WardRiskProfile,
  AuthorityLevel,
  ApprovalRequest,
  AuditLogItem
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
  WARD_RISK_PROFILES,
  INITIAL_APPROVAL_REQUESTS,
  INITIAL_AUDIT_LOGS,
  AUTHORITY_USERS
} from './data/mockData';
import { playNotificationChime } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<'command' | 'map' | 'globe' | 'copilot' | 'predictive' | 'incidents' | 'crews' | 'community' | 'analytics'>('command');
  
  // 2-Level Authority State (Default: Level 1 Monitor)
  const [currentAuthority, setCurrentAuthority] = useState<AuthorityLevel>('MONITOR');
  const [isAuthorityModalOpen, setIsAuthorityModalOpen] = useState(false);
  const [isApprovalQueueModalOpen, setIsApprovalQueueModalOpen] = useState(false);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(INITIAL_APPROVAL_REQUESTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);

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

  // Historical Risk Heatmap GIS Layer State
  const [showHistoricalHeatmap, setShowHistoricalHeatmap] = useState<boolean>(false);
  const [historicalHeatmapCategory, setHistoricalHeatmapCategory] = useState<string>('ALL');

  // System options
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Authority Handlers
  const handleSwitchAuthority = (level: AuthorityLevel) => {
    setCurrentAuthority(level);
    const user = AUTHORITY_USERS[level];
    if (soundEnabled) playNotificationChime(level === 'SUPER_MONITOR' ? 'critical' : 'info');
    
    // Add audit log entry
    const newLog: AuditLogItem = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      actorName: user.name,
      actorLevel: level,
      actionTitle: `Switched Session Authority to ${user.title} (${level})`,
      targetEntity: `Command Session Clearance: ${user.badgeId}`,
      category: 'SESSION_AUTH_SWITCH',
      digitalSignature: `SIG-SHA256-${Date.now().toString(16).toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleApproveApprovalRequest = (requestId: string, notes?: string) => {
    const sig = `SIG-SHA256-${Date.now().toString(16).toUpperCase()}`;
    const targetReq = approvalRequests.find(r => r.id === requestId);

    setApprovalRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'APPROVED',
          reviewedAt: 'Just now',
          reviewedBy: 'Commissioner Dr. Ananya Sen (Super Monitor L2)',
          reviewNotes: notes || 'Authorized under Emergency Operations Protocol.',
          digitalSignature: sig
        };
      }
      return req;
    }));

    // Add to audit logs
    if (targetReq) {
      const newLog: AuditLogItem = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        actorName: 'Commissioner Dr. Ananya Sen',
        actorLevel: 'SUPER_MONITOR',
        actionTitle: `Authorized Escalation Ticket #${requestId}`,
        targetEntity: targetReq.title,
        category: 'EXECUTIVE_SIGN_OFF',
        digitalSignature: sig
      };
      setAuditLogs(prev => [newLog, ...prev]);

      // Add emergency notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        timestamp: 'Just now',
        title: `✅ Super Monitor Sign-Off: ${targetReq.category.replace('_', ' ')}`,
        message: `Commissioner Dr. Sen signed off on "${targetReq.title}" for ${targetReq.ward}. Tactical orders dispatched.`,
        type: 'CRITICAL_ALERT',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleRejectApprovalRequest = (requestId: string, notes?: string) => {
    setApprovalRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'REJECTED',
          reviewedAt: 'Just now',
          reviewedBy: 'Commissioner Dr. Ananya Sen (Super Monitor L2)',
          reviewNotes: notes || 'Rejected pending telemetry corroboration.'
        };
      }
      return req;
    }));
  };

  const handleSubmitNewApprovalRequest = (reqData: Omit<ApprovalRequest, 'id' | 'requestedAt' | 'status'>) => {
    const newReq: ApprovalRequest = {
      ...reqData,
      id: `APR-2026-${Math.floor(100 + Math.random() * 900)}`,
      requestedAt: 'Just now',
      status: 'PENDING'
    };

    setApprovalRequests(prev => [newReq, ...prev]);

    // Push notification to user
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      title: `⚡ Escalation Ticket Submitted: ${newReq.id}`,
      message: `"${newReq.title}" forwarded to Commissioner Dr. Sen for executive authorization.`,
      type: 'CRITICAL_ALERT',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    if (soundEnabled) playNotificationChime('info');
  };

  const handleEscalateFromComponent = (title: string, description: string, ward: string) => {
    handleSubmitNewApprovalRequest({
      requestedBy: currentAuthority === 'SUPER_MONITOR' ? 'Commissioner Dr. Ananya Sen (Super Monitor)' : 'Officer Vikram Malhotra (Monitor L1)',
      requestedByRole: currentAuthority === 'SUPER_MONITOR' ? 'Chief Incident Commander' : 'Duty Operations Monitor',
      category: title.includes('Broadcast') ? 'EMERGENCY_BROADCAST' : 'CRITICAL_DISPATCH',
      title,
      description,
      ward,
      urgency: 'CRITICAL'
    });
    setIsApprovalQueueModalOpen(true);
  };

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

  // Counts
  const unreadNotifsCount = notifications.filter(n => !n.read).length;
  const criticalIncidentsCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const pendingApprovalsCount = approvalRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* Top Navigation Bar with Authority Badge */}
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
        currentAuthority={currentAuthority}
        onOpenAuthorityModal={() => setIsAuthorityModalOpen(true)}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenApprovalQueue={() => setIsApprovalQueueModalOpen(true)}
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
              currentAuthority={currentAuthority}
              onOpenAuthorityModal={() => setIsAuthorityModalOpen(true)}
              onOpenApprovalQueue={() => setIsApprovalQueueModalOpen(true)}
              pendingApprovalsCount={pendingApprovalsCount}
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
              cityHealth={cityHealth}
              floodForecast={predictiveFlood}
              roadDamages={roadDamages}
              wasteHotspots={wasteHotspots}
              heatwave={heatwave}
              waterSecurity={waterSecurity}
              showHistoricalHeatmap={showHistoricalHeatmap}
              onToggleHistoricalHeatmap={setShowHistoricalHeatmap}
              historicalHeatmapCategory={historicalHeatmapCategory}
              onSelectHistoricalHeatmapCategory={setHistoricalHeatmapCategory}
              onDispatchCrew={() => setActiveTab('crews')}
              onViewOnMap={() => setActiveTab('map')}
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
            showHistoricalHeatmap={showHistoricalHeatmap}
            onToggleHistoricalHeatmap={setShowHistoricalHeatmap}
            historicalHeatmapCategory={historicalHeatmapCategory}
            onSelectHistoricalHeatmapCategory={setHistoricalHeatmapCategory}
            onSelectIncident={handleSelectIncident}
            onOpenDispatchForIncident={handleOpenDispatchForIncident}
            onOpenSatelliteAnalyzer={() => setIsSatelliteModalOpen(true)}
            onUpdateStatus={handleUpdateStatus}
            onAssignCrew={handleAssignCrew}
          />
        )}

        {/* 3D Interactive Earth Globe */}
        {activeTab === 'globe' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <InteractiveEarthGlobe
              onSelectLocation={(lat, lng, name) => {
                console.log(`Globe locked on: ${name} (${lat}, ${lng})`);
              }}
              onOpenSatelliteAnalyzer={() => setIsSatelliteModalOpen(true)}
              onDispatchCrew={() => setActiveTab('crews')}
            />
          </div>
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
              currentAuthority={currentAuthority}
              onRequestEscalation={handleEscalateFromComponent}
              onOpenAuthorityModal={() => setIsAuthorityModalOpen(true)}
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

      {/* Authority Clearance Switcher Modal */}
      <AuthoritySwitchModal
        isOpen={isAuthorityModalOpen}
        onClose={() => setIsAuthorityModalOpen(false)}
        currentAuthority={currentAuthority}
        onSwitchAuthority={handleSwitchAuthority}
        pendingApprovalsCount={pendingApprovalsCount}
        auditLogs={auditLogs}
      />

      {/* Escalations & Approvals Queue Modal */}
      <ApprovalQueueModal
        isOpen={isApprovalQueueModalOpen}
        onClose={() => setIsApprovalQueueModalOpen(false)}
        currentAuthority={currentAuthority}
        approvalRequests={approvalRequests}
        onApproveRequest={handleApproveApprovalRequest}
        onRejectRequest={handleRejectApprovalRequest}
        onSubmitNewRequest={handleSubmitNewApprovalRequest}
        onOpenAuthorityModal={() => {
          setIsApprovalQueueModalOpen(false);
          setIsAuthorityModalOpen(true);
        }}
      />

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
        currentAuthority={currentAuthority}
        onRequestEscalation={handleEscalateFromComponent}
        onOpenAuthorityModal={() => setIsAuthorityModalOpen(true)}
      />

    </div>
  );
}

