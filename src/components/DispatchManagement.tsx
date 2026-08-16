import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Radio, 
  Navigation, 
  Send,
  UserCheck
} from 'lucide-react';
import { MaintenanceCrew, Incident } from '../types';
import confetti from 'canvas-confetti';

interface DispatchManagementProps {
  crews: MaintenanceCrew[];
  incidents: Incident[];
  onDispatchCrew: (crewId: string, incidentId: string, eta: number) => void;
  onSelectIncident: (incident: Incident) => void;
}

export const DispatchManagement: React.FC<DispatchManagementProps> = ({
  crews,
  incidents,
  onDispatchCrew,
  onSelectIncident
}) => {
  const [selectedCrew, setSelectedCrew] = useState<MaintenanceCrew | null>(crews[0] || null);
  const [dispatchIncidentId, setDispatchIncidentId] = useState<string>('');
  const [etaInput, setEtaInput] = useState<number>(15);

  const availableIncidents = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CLOSED');

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrew || !dispatchIncidentId) return;

    onDispatchCrew(selectedCrew.id, dispatchIncidentId, etaInput);
    confetti({ particleCount: 30, spread: 60 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title & Quick Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-cyan-400" />
            Municipal Maintenance Crew & Fleet Dispatch Center
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Rapid Response Dewatering, High-Voltage Linemen, & Desilting Squads
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs font-mono">
          <span className="text-emerald-400 font-bold">
            {crews.filter(c => c.status === 'AVAILABLE').length} Available
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-purple-400 font-bold">
            {crews.filter(c => c.status === 'WORKING' || c.status === 'EN_ROUTE').length} Deployed
          </span>
        </div>
      </div>

      {/* Crew Grid and Dispatch Control Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Crew Roster List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Maintenance Units ({crews.length})
          </h3>

          <div className="space-y-3">
            {crews.map(crew => {
              const isSelected = selectedCrew?.id === crew.id;
              const isDeployed = crew.status === 'WORKING' || crew.status === 'EN_ROUTE';
              const assignedIncident = incidents.find(i => i.id === crew.assignedIncidentId);

              return (
                <div
                  key={crew.id}
                  onClick={() => setSelectedCrew(crew)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-slate-900/90 backdrop-blur-md ${
                    isSelected
                      ? 'border-cyan-400 bg-slate-800/90 shadow-lg shadow-cyan-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{crew.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {crew.vehicleRegistration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Lead: <strong className="text-slate-200">{crew.leadEngineer}</strong> • {crew.contactNumber}
                      </p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      crew.status === 'AVAILABLE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      crew.status === 'EN_ROUTE' ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' :
                      crew.status === 'WORKING' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {crew.status}
                    </span>
                  </div>

                  {/* Location & Task info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono pt-3 border-t border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {crew.currentLocation.label}
                    </span>

                    {assignedIncident ? (
                      <span className="text-purple-400 font-semibold flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        Ticket: {assignedIncident.id} ({crew.etaToIncidentMinutes || 0}m ETA)
                      </span>
                    ) : (
                      <span className="text-emerald-400">Ready for Dispatch</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Crew Dossier & Action Dispatch Form (5 cols) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          
          {selectedCrew ? (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Unit Profile</span>
                  <h3 className="text-base font-bold text-white">{selectedCrew.name}</h3>
                </div>
                <span className="p-2 rounded-xl bg-slate-950 text-cyan-400 border border-slate-800">
                  <Wrench className="w-5 h-5" />
                </span>
              </div>

              {/* Equipment onboard */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Specialized Onboard Rigging & Pumps
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedCrew.equipment.map((eq, i) => (
                    <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-emerald-400">✔</span>
                      <span>{eq}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dispatch Form */}
              <form onSubmit={handleDispatch} className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-purple-400" />
                  Assign & Dispatch to Incident
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Select Target Incident Ticket
                  </label>
                  <select
                    value={dispatchIncidentId}
                    onChange={e => setDispatchIncidentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    required
                  >
                    <option value="">Choose active incident ticket...</option>
                    {availableIncidents.map(inc => (
                      <option key={inc.id} value={inc.id}>
                        [{inc.severity}] {inc.title} - {inc.location.ward}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Target Site ETA (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={etaInput}
                    onChange={e => setEtaInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!dispatchIncidentId}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>Transmit Radio Dispatch Order</span>
                </button>
              </form>

            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
              Select a maintenance unit from the list to view telemetry and dispatch.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
