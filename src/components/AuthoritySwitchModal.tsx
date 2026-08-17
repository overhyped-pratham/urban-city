import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Crown, 
  CheckCircle2, 
  XCircle, 
  Key, 
  Lock, 
  Sparkles, 
  UserCheck, 
  AlertTriangle, 
  ChevronRight,
  ShieldAlert,
  Radio,
  Sliders,
  FileCheck2,
  Clock
} from 'lucide-react';
import { AuthorityLevel, AuthorityUser, AuditLogItem } from '../types';
import { AUTHORITY_USERS } from '../data/mockData';

interface AuthoritySwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAuthority: AuthorityLevel;
  onSwitchAuthority: (level: AuthorityLevel) => void;
  pendingApprovalsCount: number;
  auditLogs: AuditLogItem[];
}

export const AuthoritySwitchModal: React.FC<AuthoritySwitchModalProps> = ({
  isOpen,
  onClose,
  currentAuthority,
  onSwitchAuthority,
  pendingApprovalsCount,
  auditLogs
}) => {
  const [selectedLevel, setSelectedLevel] = useState<AuthorityLevel>(currentAuthority);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showQuickBypass, setShowQuickBypass] = useState(true);

  if (!isOpen) return null;

  const monitorUser = AUTHORITY_USERS.MONITOR;
  const superMonitorUser = AUTHORITY_USERS.SUPER_MONITOR;
  const headAdminUser = AUTHORITY_USERS.HEAD_ADMIN;
  const activeUser = AUTHORITY_USERS[currentAuthority];

  const handleApplySwitch = (targetLevel: AuthorityLevel) => {
    onSwitchAuthority(targetLevel);
    setSelectedLevel(targetLevel);
    setPinError('');
    onClose();
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedPin = AUTHORITY_USERS[selectedLevel].pinCode;
    if (pinInput === expectedPin || pinInput === '0000') {
      handleApplySwitch(selectedLevel);
    } else {
      setPinError(`Invalid Security PIN for ${AUTHORITY_USERS[selectedLevel].title}. (Demo PIN: ${expectedPin})`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-inner">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Municipal Command Authority Center
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-950 border border-indigo-700 text-indigo-300">
                  2-Tier Role Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage operational clearance, approval gates, and executive sign-off authority.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Current Active Identity Pill Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{activeUser.name}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 ${
                    currentAuthority === 'HEAD_ADMIN'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : currentAuthority === 'SUPER_MONITOR'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {currentAuthority === 'HEAD_ADMIN' ? <Sparkles className="w-3 h-3 text-purple-400" /> : currentAuthority === 'SUPER_MONITOR' ? <Crown className="w-3 h-3 text-amber-400" /> : <Shield className="w-3 h-3 text-cyan-400" />}
                    {currentAuthority === 'HEAD_ADMIN' ? 'LEVEL 3: HEAD ADMIN' : currentAuthority === 'SUPER_MONITOR' ? 'LEVEL 2: SUPER MONITOR' : 'LEVEL 1: MONITOR'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{activeUser.title} • <span className="font-mono text-[11px] text-slate-500">{activeUser.badgeId}</span></p>
                <p className="text-[11px] text-indigo-400/90 font-medium">{activeUser.securityClearance}</p>
              </div>
            </div>

            {currentAuthority === 'SUPER_MONITOR' && pendingApprovalsCount > 0 && (
              <div className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>{pendingApprovalsCount} Escalations Awaiting Your Sign-Off</span>
              </div>
            )}
          </div>

          {/* Role Comparison Cards */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Select Authority Clearance Level
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Level 1 Monitor */}
              <div 
                onClick={() => setSelectedLevel('MONITOR')}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedLevel === 'MONITOR'
                    ? 'bg-cyan-950/30 border-cyan-500 ring-2 ring-cyan-500/20 shadow-xl'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {currentAuthority === 'MONITOR' && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500 text-slate-950">
                    ACTIVE NOW
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-cyan-400 font-bold">LEVEL 1 AUTHORITY</div>
                      <div className="text-sm font-bold text-white">{monitorUser.title}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Designed for 24/7 duty desk operators, field telemetry analysts, and routine emergency dispatch units.
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Live Radar & SAR Inundation Monitoring</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>GIS Incident Filtering & Historical Heatmaps</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Dispatch Routine Road & Drain Squads (Low/Med)</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400">
                      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Draft Escalation Tickets for Super Monitor</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-slate-600" />
                      <span>No Direct Citywide EAS Broadcast</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-slate-600" />
                      <span>No AI Model Threshold Tuning</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">PIN: 1111</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplySwitch('MONITOR');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentAuthority === 'MONITOR'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                    }`}
                  >
                    {currentAuthority === 'MONITOR' ? 'Current Session' : 'Switch to Monitor'}
                  </button>
                </div>
              </div>

              {/* Card 2: Level 2 Super Monitor */}
              <div 
                onClick={() => setSelectedLevel('SUPER_MONITOR')}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedLevel === 'SUPER_MONITOR'
                    ? 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/20 shadow-xl'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {currentAuthority === 'SUPER_MONITOR' && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950">
                    ACTIVE NOW
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-amber-400 font-bold">LEVEL 2 AUTHORITY</div>
                      <div className="text-sm font-bold text-white">{superMonitorUser.title}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Executive command clearance for the Municipal Commissioner & Disaster Management Chief.
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                      <span>All Level 1 Monitoring Privileges Included</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Digital Sign-Off on Critical Tactical Units (5000 GPM)</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Execute Citywide Cell-Broadcast & EAS Warnings</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Remote 33kV Grid Lockout & Sluice Gate Overrides</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Calibrate SegFormer & TimesFM Risk Thresholds</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Executive Sign-Off & Audit Trail Clearance</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">PIN: 9999</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplySwitch('SUPER_MONITOR');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentAuthority === 'SUPER_MONITOR'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    }`}
                  >
                    {currentAuthority === 'SUPER_MONITOR' ? 'Current Session' : 'Switch to Super Monitor'}
                  </button>
                </div>
              </div>

              {/* Card 3: Level 3 Head Admin Clearance */}
              <div 
                onClick={() => setSelectedLevel('HEAD_ADMIN')}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedLevel === 'HEAD_ADMIN'
                    ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20 shadow-xl'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {currentAuthority === 'HEAD_ADMIN' && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500 text-white">
                    ACTIVE NOW
                  </span>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-inner">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-purple-400 font-bold">LEVEL 3 AUTHORITY</div>
                      <div className="text-sm font-bold text-white">{headAdminUser.title}</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Supreme quality inspection clearance to verify whether reported incidents are genuinely solved or need reopening.
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center gap-2 text-purple-300 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
                      <span>Supreme Resolution Audit Authority</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Inspect Solved Issues & Verify Field Proof</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Evaluate Google Forms Citizen Ground Feedback</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Officially Sign Off & Close Verified Solved Issues</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Re-Open Unresolved Issues & Force Re-Dispatch</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">PIN: 0000</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplySwitch('HEAD_ADMIN');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentAuthority === 'HEAD_ADMIN'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-purple-600 hover:bg-purple-500 text-white font-black shadow-md shadow-purple-600/20'
                    }`}
                  >
                    {currentAuthority === 'HEAD_ADMIN' ? 'Current Session' : 'Switch to Head Admin'}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Quick PIN Verification or 1-Click Sandbox Override */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                <h5 className="text-xs font-bold text-white">Security Credential Authorization</h5>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Demo Quick PIN: <strong className="text-cyan-300">1111</strong> (Monitor) | <strong className="text-amber-300">9999</strong> (Super Monitor)
              </span>
            </div>

            <form onSubmit={handlePinSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="Enter 4-digit badge PIN..."
                className="w-full sm:w-64 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-center font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Authenticate & Unlock {selectedLevel === 'SUPER_MONITOR' ? 'Super Monitor' : 'Monitor'}
              </button>

              <button
                type="button"
                onClick={() => handleApplySwitch(selectedLevel)}
                className="w-full sm:w-auto text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 font-medium cursor-pointer"
              >
                ⚡ 1-Click Demo Switch
              </button>
            </form>

            {pinError && (
              <p className="text-[11px] text-rose-400 font-medium">{pinError}</p>
            )}
          </div>

          {/* Recent Executive Sign-Off Audit Log Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold uppercase tracking-wider text-[10px]">Recent Authorization Sign-Off Audit</span>
              <span className="font-mono text-[10px]">SHA-256 Verified Ledger</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {auditLogs.slice(0, 3).map(log => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className={`w-3.5 h-3.5 ${log.actorLevel === 'SUPER_MONITOR' ? 'text-amber-400' : 'text-cyan-400'}`} />
                    <div>
                      <span className="text-slate-200 font-semibold">{log.actionTitle}</span>
                      <p className="text-[10px] text-slate-400">{log.actorName} • {log.targetEntity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-indigo-400">{log.digitalSignature}</span>
                    <span className="block text-[9px] text-slate-500">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            Active: <strong className="text-white">{activeUser.name}</strong> ({activeUser.title})
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Authority Panel
          </button>
        </div>

      </div>
    </div>
  );
};
