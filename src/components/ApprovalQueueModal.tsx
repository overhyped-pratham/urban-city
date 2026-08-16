import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Crown, 
  Shield, 
  Sparkles, 
  FileCheck, 
  Send, 
  Clock, 
  MapPin, 
  Layers, 
  Radio, 
  Zap, 
  Waves, 
  Truck,
  FileText,
  Lock,
  Search
} from 'lucide-react';
import { ApprovalRequest, AuthorityLevel, ApprovalCategory } from '../types';
import { playNotificationChime } from '../utils/audio';
import confetti from 'canvas-confetti';

interface ApprovalQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAuthority: AuthorityLevel;
  approvalRequests: ApprovalRequest[];
  onApproveRequest: (requestId: string, reviewNotes?: string) => void;
  onRejectRequest: (requestId: string, reviewNotes?: string) => void;
  onSubmitNewRequest: (req: Omit<ApprovalRequest, 'id' | 'requestedAt' | 'status'>) => void;
  onOpenAuthorityModal: () => void;
}

export const ApprovalQueueModal: React.FC<ApprovalQueueModalProps> = ({
  isOpen,
  onClose,
  currentAuthority,
  approvalRequests,
  onApproveRequest,
  onRejectRequest,
  onSubmitNewRequest,
  onOpenAuthorityModal
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'submit'>('pending');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [signOffNote, setSignOffNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // New Request Form state for Monitor
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<ApprovalCategory>('CRITICAL_DISPATCH');
  const [newWard, setNewWard] = useState('Ward 4 (Industrial Basin)');
  const [newUrgency, setNewUrgency] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('CRITICAL');

  if (!isOpen) return null;

  const isSuperMonitor = currentAuthority === 'SUPER_MONITOR';
  const pendingRequests = approvalRequests.filter(r => r.status === 'PENDING');
  const historyRequests = approvalRequests.filter(r => r.status !== 'PENDING');

  const selectedRequest = approvalRequests.find(r => r.id === selectedRequestId) || pendingRequests[0] || null;

  const handleApprove = (reqId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      onApproveRequest(reqId, signOffNote || 'Authorized under Emergency Operations Protocol.');
      confetti({ particleCount: 50, spread: 60 });
      playNotificationChime();
      setIsProcessing(false);
      setSignOffNote('');
    }, 400);
  };

  const handleReject = (reqId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      onRejectRequest(reqId, signOffNote || 'Escalation rejected pending additional sensor telemetry.');
      setIsProcessing(false);
      setSignOffNote('');
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    onSubmitNewRequest({
      requestedBy: isSuperMonitor ? 'Commissioner Dr. Ananya Sen (Super Monitor)' : 'Officer Vikram Malhotra (Monitor L1)',
      requestedByRole: isSuperMonitor ? 'Chief Incident Commander' : 'Duty Operations Monitor',
      category: newCategory,
      title: newTitle,
      description: newDesc,
      ward: newWard,
      urgency: newUrgency
    });

    setNewTitle('');
    setNewDesc('');
    setActiveTab('pending');
  };

  const getCategoryIcon = (cat: ApprovalCategory) => {
    switch (cat) {
      case 'CRITICAL_DISPATCH':
        return <Waves className="w-4 h-4 text-cyan-400" />;
      case 'GRID_LOCKOUT':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'EMERGENCY_BROADCAST':
        return <Radio className="w-4 h-4 text-rose-400" />;
      case 'SLUICE_GATE_OVERRIDE':
        return <Layers className="w-4 h-4 text-blue-400" />;
      case 'TANKER_EMERGENCY_FLEET':
        return <Truck className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border shadow-inner ${
              isSuperMonitor 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
            }`}>
              {isSuperMonitor ? <Crown className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Emergency Escalation & Approval Ledger
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                  isSuperMonitor
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}>
                  {isSuperMonitor ? 'SUPER MONITOR SIGN-OFF ACTIVE' : 'MONITOR ESCALATION QUEUE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isSuperMonitor
                  ? 'Review high-impact requests requiring executive sign-off.'
                  : 'Submit critical incident escalations to the Municipal Commissioner for authorization.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAuthorityModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Switch Role</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pending'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Pending Escalations</span>
              {pendingRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Audit & Sign-Off History</span>
              <span className="text-[10px] font-mono text-slate-400">({historyRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('submit')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Draft New Escalation Ticket</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Authority: <strong className={isSuperMonitor ? 'text-amber-400' : 'text-cyan-400'}>
              {isSuperMonitor ? 'Level 2 Super Monitor' : 'Level 1 Monitor'}
            </strong>
          </span>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: PENDING REQUESTS */}
          {activeTab === 'pending' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: List of Pending Items */}
              <div className="lg:col-span-5 space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {pendingRequests.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <h5 className="text-sm font-bold text-white">All Escalations Cleared</h5>
                    <p className="text-xs text-slate-400">
                      No pending critical actions awaiting Super Monitor sign-off at this time.
                    </p>
                  </div>
                ) : (
                  pendingRequests.map(req => {
                    const isSelected = selectedRequest?.id === req.id;
                    const isCritical = req.urgency === 'CRITICAL';
                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequestId(req.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {getCategoryIcon(req.category)}
                            <span className="text-[10px] font-mono font-bold text-slate-300">
                              {req.id}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            isCritical
                              ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {req.urgency}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">
                          {req.title}
                        </h4>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{req.ward}</span>
                          <span>{req.requestedAt}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right Column: Selected Request Inspection & Sign-off */}
              <div className="lg:col-span-7">
                {selectedRequest ? (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                            {selectedRequest.category.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {selectedRequest.ward}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {selectedRequest.title}
                        </h3>
                      </div>

                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {selectedRequest.status}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Submitted By</span>
                        <span className="text-slate-200 font-semibold">{selectedRequest.requestedBy}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Timestamp</span>
                        <span className="text-slate-200 font-semibold">{selectedRequest.requestedAt}</span>
                      </div>
                    </div>

                    {/* Full Description */}
                    <div className="space-y-1 text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        Tactical Operational Rationale
                      </span>
                      <p className="text-slate-300 leading-relaxed p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                        {selectedRequest.description}
                      </p>
                    </div>

                    {/* Super Monitor Action Box */}
                    {isSuperMonitor ? (
                      <div className="pt-3 border-t border-slate-800 space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-1">
                            Executive Direct Sign-Off Signature Notes
                          </label>
                          <input
                            type="text"
                            value={signOffNote}
                            onChange={e => setSignOffNote(e.target.value)}
                            placeholder="Add cryptographic sign-off notes (e.g. Authorized by Commissioner Dr. Sen)..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleReject(selectedRequest.id)}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                          >
                            Reject Escalation
                          </button>

                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => handleApprove(selectedRequest.id)}
                            className="flex-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                          >
                            <FileCheck className="w-4 h-4" />
                            <span>Executive Sign-Off & Authorize</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Monitor view: Waiting for approval */
                      <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                          <Lock className="w-4 h-4" />
                          <span>Awaiting Super Monitor Sign-Off</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          As Level 1 Duty Monitor, this critical action has been routed to Commissioner Dr. Ananya Sen for digital authorization. Switch to Super Monitor to execute directly.
                        </p>
                        <button
                          type="button"
                          onClick={onOpenAuthorityModal}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Switch to Super Monitor (L2)
                        </button>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-400 text-xs">
                    Select an escalation request to inspect telemetry and sign off.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: AUDIT & SIGN-OFF HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Completed Escalation Approvals ({historyRequests.length})</span>
                <span className="font-mono text-[11px]">Audit Compliant • SHA-256 Ledger</span>
              </div>

              {historyRequests.map(req => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {req.status}
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-400">{req.id}</span>
                      <span className="text-xs font-bold text-white">{req.title}</span>
                    </div>
                    <p className="text-xs text-slate-400">{req.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                      <span>Ward: {req.ward}</span>
                      <span>Requested: {req.requestedBy}</span>
                      {req.reviewedBy && <span>Authorized by: <strong className="text-amber-400">{req.reviewedBy}</strong></span>}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-emerald-400 block">
                      {req.digitalSignature || 'SIG-SHA256-AUTH-VERIFIED'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 block">{req.reviewedAt || 'Approved'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DRAFT NEW ESCALATION TICKET */}
          {activeTab === 'submit' && (
            <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white">Draft Escalation for Executive Authorization</h4>
                <p className="text-xs text-slate-400">
                  Route high-voltage lockouts, 5000 GPM dewatering squads, or emergency broadcasts for Super Monitor sign-off.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Escalation Category
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as ApprovalCategory)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="CRITICAL_DISPATCH">🌊 Critical Dewatering / Rescue Squad Allocation</option>
                  <option value="GRID_LOCKOUT">⚡ 33kV Power Grid Substation Protective Lockout</option>
                  <option value="EMERGENCY_BROADCAST">📢 Cell-Broadcast EAS Citizen Warning</option>
                  <option value="SLUICE_GATE_OVERRIDE">🚰 Sluice Gate Backflow Valve Opening</option>
                  <option value="TANKER_EMERGENCY_FLEET">🚚 Emergency Potable Water Tanker Fleet Deployment</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Action Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Urgent 5000 GPM Pump Divert to Western Flyover Inundation"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Target Municipal Ward
                  </label>
                  <select
                    value={newWard}
                    onChange={e => setNewWard(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Ward 4 (Industrial Basin)">Ward 4 (Industrial Basin)</option>
                    <option value="Ward G-North (Dadar / Mahim)">Ward G-North (Dadar / Mahim)</option>
                    <option value="Ward 18 (Eastern Basin)">Ward 18 (Eastern Basin)</option>
                    <option value="Ward 12 (Urban Core)">Ward 12 (Urban Core)</option>
                    <option value="All Municipal Zones">All Municipal Zones (Citywide)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Urgency Tier
                  </label>
                  <select
                    value={newUrgency}
                    onChange={e => setNewUrgency(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CRITICAL">🔴 CRITICAL (Immediate Life/Asset Threat)</option>
                    <option value="HIGH">🟠 HIGH (Within 2 Hours)</option>
                    <option value="MEDIUM">🟡 MEDIUM (Routine High-Capacity)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Telemetry Justification & Rationale
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Detail sensor readings, Doppler precipitation rate, or field reports necessitating this executive action..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('pending')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Super Monitor Queue</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>2-Tier Municipal Escalation Engine • All actions timestamped</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
