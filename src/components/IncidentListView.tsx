import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  Droplets,
  Zap,
  Radio
} from 'lucide-react';
import { Incident, IncidentCategory, IncidentSeverity, IncidentStatus } from '../types';

interface IncidentListViewProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onOpenSatelliteAnalyzer: () => void;
}

export const IncidentListView: React.FC<IncidentListViewProps> = ({
  incidents,
  onSelectIncident,
  onOpenSatelliteAnalyzer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = 
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.location.ward.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || inc.category === categoryFilter;
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const inProgressCount = incidents.filter(i => i.status === 'IN_PROGRESS' || i.status === 'DISPATCHED').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Stat Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active Incidents</span>
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{incidents.length}</div>
          <span className="text-[11px] text-slate-500 font-mono">Monitored by Sentinel-2 & SAR</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Critical Escalations</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">{criticalCount}</div>
          <span className="text-[11px] text-rose-400/70 font-mono">Immediate crew intervention required</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-900/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Active Crews Dispatched</span>
            <Truck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-300">{inProgressCount}</div>
          <span className="text-[11px] text-purple-400/70 font-mono">En route / on-site remediation</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Resolved Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-300">{resolvedCount}</div>
          <span className="text-[11px] text-emerald-400/70 font-mono">Avg MTTR: 42.8 mins</span>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Ward, Address, Hazard Keyword..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick AI Scan trigger */}
          <button
            onClick={onOpenSatelliteAnalyzer}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>New Satellite Scan</span>
          </button>

        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            <option value="WATER_LOGGING">Water Logging / Flood</option>
            <option value="POWER_FAILURE">Power Failure / Grid</option>
            <option value="DRAINAGE_BLOCKAGE">Drainage / Canal Blockage</option>
            <option value="ROAD_SUBSIDENCE">Road Subsidence / Cave-in</option>
          </select>

          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="DETECTED">Detected</option>
            <option value="AI_VERIFIED">AI Verified</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <div className="ml-auto text-xs font-mono text-slate-400">
            Showing <strong>{filteredIncidents.length}</strong> of {incidents.length} incidents
          </div>

        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIncidents.map(inc => {
          const isCritical = inc.severity === 'CRITICAL';

          return (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer bg-slate-900/90 backdrop-blur-md flex flex-col justify-between hover:scale-[1.01] ${
                isCritical ? 'border-rose-900/50 hover:border-rose-500 shadow-lg shadow-rose-950/20' : 'border-slate-800 hover:border-cyan-500/50'
              }`}
            >
              <div>
                {/* Image header with sensor tag */}
                <div className="relative rounded-xl overflow-hidden h-36 mb-3 bg-slate-950">
                  <img
                    src={inc.satelliteImage}
                    alt={inc.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-cyan-300">
                    {inc.satelliteSensor}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-950/90 border border-slate-700 text-white">
                    {inc.id}
                  </div>
                </div>

                {/* Category and Severity Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isCritical ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {inc.severity} SEVERITY
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(inc.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{inc.title}</h3>
                
                <p className="text-xs text-slate-400 mb-3 flex items-start gap-1 line-clamp-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{inc.location.address}</span>
                </p>

                {/* AI Detection Summary snippet */}
                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 mb-3 line-clamp-2 leading-relaxed">
                  {inc.aiAnalysis.aiSummary}
                </p>
              </div>

              {/* Footer row with crew status & button */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-xs font-mono">
                  <span className="text-slate-400 block text-[10px]">Status / Assigned:</span>
                  <span className="text-cyan-400 font-bold">
                    {inc.assignedCrewName || 'Crew Unassigned'}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIncident(inc);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
