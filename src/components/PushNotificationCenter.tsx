import React from 'react';
import { 
  X, 
  Bell, 
  ShieldAlert, 
  Truck, 
  Users, 
  Radio, 
  Check, 
  Trash2, 
  ExternalLink,
  Volume2
} from 'lucide-react';
import { NotificationItem, Incident } from '../types';

interface PushNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onSelectIncidentById: (incidentId: string) => void;
  onClearAll: () => void;
  onMarkAsRead: (notifId: string) => void;
}

export const PushNotificationCenter: React.FC<PushNotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectIncidentById,
  onClearAll,
  onMarkAsRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#05060a]/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d1117] border-l border-[#21262d] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-[#21262d] flex items-center justify-between bg-[#05060a]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f0f6fc]">Live Push Notifications & Alerts</h3>
              <p className="text-[11px] text-[#8b949e] font-mono">
                Real-Time Sentinel AI Telemetry Dispatch Stream
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#161b22] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-4 py-2 bg-[#05060a]/40 border-b border-[#21262d] flex items-center justify-between text-xs font-mono">
          <span className="text-[#8b949e]">{notifications.length} Total Alerts</span>
          <button
            onClick={onClearAll}
            className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8b949e] font-mono">
              No active notification alerts. System operating normally.
            </div>
          ) : (
            notifications.map(notif => {
              const isCritical = notif.type === 'CRITICAL_ALERT' || notif.type === 'WEATHER_WARNING';

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkAsRead(notif.id);
                    if (notif.incidentId) {
                      onSelectIncidentById(notif.incidentId);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    notif.read
                      ? 'bg-[#05060a]/60 border-[#21262d]/60 opacity-70'
                      : isCritical
                      ? 'bg-rose-950/30 border-rose-800/80 shadow-md shadow-rose-950/20'
                      : 'bg-[#05060a] border-cyan-500/40 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      isCritical ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}>
                      {notif.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-[#8b949e]">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#f0f6fc] mb-1">{notif.title}</h4>
                  <p className="text-xs text-[#c9d1d9] leading-relaxed mb-2">{notif.message}</p>

                  {notif.incidentId && (
                    <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 font-semibold">
                      <span>View Incident Dossier</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
