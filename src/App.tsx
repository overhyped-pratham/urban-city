/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { SatelliteMap } from './components/SatelliteMap';
import { IncidentListView } from './components/IncidentListView';
import { DispatchManagement } from './components/DispatchManagement';
import { CommunityReporting } from './components/CommunityReporting';
import { HistoricalTrends } from './components/HistoricalTrends';
import { SatelliteAnalyzerModal } from './components/SatelliteAnalyzerModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { PushNotificationCenter } from './components/PushNotificationCenter';
import { EmergencyBroadcastModal } from './components/EmergencyBroadcastModal';

import { Incident, MaintenanceCrew, CitizenReport, NotificationItem, WeatherData, IncidentStatus } from './types';
import { INITIAL_INCIDENTS, INITIAL_CREWS, INITIAL_CITIZEN_REPORTS, INITIAL_WEATHER } from './data/mockData';
import { playNotificationChime } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'incidents' | 'crews' | 'analytics' | 'community'>('map');
  
  // Primary datasets
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [crews, setCrews] = useState<MaintenanceCrew[]>(INITIAL_CREWS);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>(INITIAL_CITIZEN_REPORTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(INITIAL_WEATHER);

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
      const [incRes, crewRes, citRes, notifRes, analyticsRes] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/crews'),
        fetch('/api/citizen-reports'),
        fetch('/api/notifications'),
        fetch('/api/analytics')
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
    } catch (err) {
      console.warn('Backend fetch fallback to local state:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    // Periodic refresh
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        weather={weather}
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
        {activeTab === 'map' && (
          <SatelliteMap
            incidents={incidents}
            crews={crews}
            citizenReports={citizenReports}
            selectedIncident={selectedIncident}
            onSelectIncident={handleSelectIncident}
            onOpenDispatchForIncident={handleOpenDispatchForIncident}
            onOpenSatelliteAnalyzer={() => setIsSatelliteModalOpen(true)}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentListView
            incidents={incidents}
            onSelectIncident={handleSelectIncident}
            onOpenSatelliteAnalyzer={() => setIsSatelliteModalOpen(true)}
          />
        )}

        {activeTab === 'crews' && (
          <DispatchManagement
            crews={crews}
            incidents={incidents}
            onDispatchCrew={handleAssignCrew}
            onSelectIncident={handleSelectIncident}
          />
        )}

        {activeTab === 'community' && (
          <CommunityReporting
            reports={citizenReports}
            incidents={incidents}
            onSubmitReport={handleSubmitCitizenReport}
            onVerifyReport={handleVerifyCitizenReport}
          />
        )}

        {activeTab === 'analytics' && (
          <HistoricalTrends
            incidents={incidents}
          />
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
