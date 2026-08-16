import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Radio, 
  Send, 
  Users, 
  MapPin, 
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EmergencyBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendBroadcast: (title: string, message: string, targetWard: string) => void;
}

export const EmergencyBroadcastModal: React.FC<EmergencyBroadcastModalProps> = ({
  isOpen,
  onClose,
  onSendBroadcast
}) => {
  const [title, setTitle] = useState('FLASH FLOOD & POWER GRID WARNING');
  const [message, setMessage] = useState('Severe waterlogging detected in Sector 4 underpass and Eastern Industrial Ring. High-voltage lines de-energized. Avoid arterial corridors. Pumping squads dispatched.');
  const [targetWard, setTargetWard] = useState('All Municipal Zones');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsBroadcasting(true);
    onSendBroadcast(title, message, targetWard);
    confetti({ particleCount: 40, spread: 70 });
    setIsBroadcasting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-rose-800/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-rose-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Broadcast Municipal Emergency Alert</h3>
              <p className="text-[11px] text-rose-300/80 font-mono">Geofenced Citizen & First-Responder Push Feed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Alert Title / Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Geofenced Ward Target
            </label>
            <select
              value={targetWard}
              onChange={e => setTargetWard(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="All Municipal Zones">All Municipal Zones (Metro-Wide)</option>
              <option value="Ward G-North">Ward G-North (Dadar / Matunga / Mahim)</option>
              <option value="Ward L-East">Ward L-East (Kurla / Saki Naka)</option>
              <option value="Ward H-East">Ward H-East (Bandra East / Khar)</option>
              <option value="Ward F-South">Ward F-South (Parel / Sewri)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Emergency Message Content (SMS & App Push)
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 resize-none leading-relaxed"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
            📡 Will immediately push to ~420,000 registered citizen mobile devices in {targetWard}.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBroadcasting}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Broadcast Emergency Warning</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
