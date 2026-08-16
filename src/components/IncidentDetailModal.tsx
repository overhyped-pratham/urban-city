import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Truck, 
  CheckCircle2, 
  FileText, 
  Printer, 
  Users, 
  AlertTriangle, 
  Radio, 
  Droplets, 
  Zap, 
  Wrench,
  Send,
  Sparkles
} from 'lucide-react';
import { Incident, MaintenanceCrew, CitizenReport, IncidentStatus } from '../types';
import confetti from 'canvas-confetti';

interface IncidentDetailModalProps {
  incident: Incident | null;
  crews: MaintenanceCrew[];
  citizenReports: CitizenReport[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (incidentId: string, status: IncidentStatus) => void;
  onAssignCrew: (incidentId: string, crewId: string) => void;
  onIssuePublicAdvisory: (incidentId: string) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  crews,
  citizenReports,
  isOpen,
  onClose,
  onUpdateStatus,
  onAssignCrew,
  onIssuePublicAdvisory
}) => {
  const [selectedCrewId, setSelectedCrewId] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [showPrintView, setShowPrintView] = useState<boolean>(false);

  if (!isOpen || !incident) return null;

  const matchingCitizenReports = citizenReports.filter(
    r => r.matchedIncidentId === incident.id || 
    (Math.abs(r.location.lat - incident.location.lat) < 0.01 && Math.abs(r.location.lng - incident.location.lng) < 0.01)
  );

  const availableCrews = crews.filter(c => c.status === 'AVAILABLE' || c.id === incident.assignedCrewId);
  const isCritical = incident.severity === 'CRITICAL';

  const handleCrewAssignment = () => {
    if (!selectedCrewId) return;
    onAssignCrew(incident.id, selectedCrewId);
    confetti({ particleCount: 25, spread: 50 });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              isCritical ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">{incident.id}</span>
                <span className="text-xs font-mono px-2 py-0.2 rounded bg-slate-800 text-slate-300">
                  {incident.workOrderNumber || 'WO-PENDING'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isCritical ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {incident.severity}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">{incident.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Print / Save Official Work Order Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Status Progression Bar */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Municipal Response Lifecycle
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold">
                Current Status: {incident.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['DETECTED', 'AI_VERIFIED', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED'] as IncidentStatus[]).map((st, idx) => {
                const isCurrent = incident.status === st;
                const isPast = ['DETECTED', 'AI_VERIFIED', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED'].indexOf(incident.status) >= idx;

                return (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(incident.id, st)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold text-center border transition-all ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                        : isPast
                        ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60'
                        : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Incident Image & Spatial Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            
            {/* Satellite Image & Sensor telemetry */}
            <div className="md:col-span-5 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <img
                src={incident.satelliteImage}
                alt={incident.title}
                className="w-full h-52 object-cover"
              />
              <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Sensor:</span>
                  <span className="text-slate-200">{incident.satelliteSensor}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Pass ID:</span>
                  <span className="text-slate-200">{incident.satellitePassId}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Detection Timestamp:</span>
                  <span className="text-slate-200">{new Date(incident.detectedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* AI Diagnostics & Metrics */}
            <div className="md:col-span-7 space-y-4">
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                    Affected Surface Area
                  </span>
                  <span className="text-sm font-mono font-bold text-white">
                    {incident.aiAnalysis.affectedAreaSqMeters.toLocaleString()} m²
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                    {incident.category === 'POWER_FAILURE' ? 'Outage Radius' : 'Est. Water Depth'}
                  </span>
                  <span className="text-sm font-mono font-bold text-cyan-400">
                    {incident.category === 'POWER_FAILURE'
                      ? `${incident.aiAnalysis.powerOutageRadiusMeters || 1200} m`
                      : `${incident.aiAnalysis.estimatedWaterDepthCm || 65} cm`}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                    Affected Citizens
                  </span>
                  <span className="text-sm font-mono font-bold text-amber-400">
                    ~{incident.aiAnalysis.estimatedAffectedHouseholds.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Location card */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-white block">{incident.location.address}</span>
                  <span className="text-slate-400 font-mono">
                    {incident.location.ward} • {incident.location.zone} ({incident.location.lat.toFixed(4)}° N, {incident.location.lng.toFixed(4)}° E)
                  </span>
                </div>
              </div>

              {/* AI Diagnostic Summary */}
              <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-xs leading-relaxed text-slate-200">
                <strong className="text-cyan-400">Gemini Remote Sensing Diagnosis:</strong> {incident.aiAnalysis.aiSummary}
              </div>

            </div>

          </div>

          {/* Maintenance Crew Dispatch & Work Order Section */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-400" />
              Municipal Crew Assignment & Action Order
            </h4>

            {incident.assignedCrewName ? (
              <div className="p-3 rounded-lg bg-slate-900 border border-purple-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-white block flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Assigned: {incident.assignedCrewName}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Estimated Time of Arrival: ~{incident.assignedCrewEtaMinutes || 10} minutes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCrewId}
                    onChange={e => setSelectedCrewId(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5"
                  >
                    <option value="">Reassign crew...</option>
                    {availableCrews.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleCrewAssignment}
                    disabled={!selectedCrewId}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs disabled:opacity-50"
                  >
                    Reassign
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1">
                  <select
                    value={selectedCrewId}
                    onChange={e => setSelectedCrewId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">Select recommended crew to dispatch...</option>
                    {availableCrews.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.leadEngineer} ({c.type.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleCrewAssignment}
                  disabled={!selectedCrewId}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Crew Now
                </button>
              </div>
            )}

            {/* Required Equipment Checklist */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Required Equipment for this Ticket:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {incident.aiAnalysis.requiredEquipment.map((eq, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5">
                    <Wrench className="w-3 h-3 text-amber-400" />
                    {eq}
                  </span>
                ))}
              </div>
            </div>

            {/* Public Advisory Button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400">
                Citizen Advisory: {incident.publicAdvisoryIssued ? '📢 Public Traffic Advisory Broadcasted' : 'No advisory broadcasted'}
              </span>
              {!incident.publicAdvisoryIssued && (
                <button
                  onClick={() => onIssuePublicAdvisory(incident.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-800/60 hover:bg-amber-900 text-amber-300 text-xs font-semibold"
                >
                  Broadcast Public Ward Advisory
                </button>
              )}
            </div>
          </div>

          {/* Community Ground-Truth Corroboration */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Citizen Ground-Truth Corroborations ({matchingCitizenReports.length})
            </h4>

            {matchingCitizenReports.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-center">
                No citizen reports logged near these coordinates yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matchingCitizenReports.map(rep => (
                  <div key={rep.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{rep.userName}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(rep.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {rep.photoUrl && (
                      <img
                        src={rep.photoUrl}
                        alt="Citizen proof"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    )}
                    <p className="text-xs text-slate-300">{rep.description}</p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
                      <span>👍 {rep.upvotes} Citizen Upvotes</span>
                      <span>Verified: {rep.verifiedByMunicipal ? 'Yes' : 'Pending'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
