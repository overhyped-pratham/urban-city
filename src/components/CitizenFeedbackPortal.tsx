import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Send, 
  Star, 
  ExternalLink, 
  MessageSquare, 
  UserCheck, 
  RefreshCw, 
  Sparkles, 
  Filter, 
  Camera, 
  Clock, 
  MapPin, 
  HelpCircle, 
  Check, 
  ChevronRight, 
  ShieldAlert, 
  FileText,
  Building2,
  ListChecks,
  User,
  ThumbsUp,
  ThumbsDown,
  Layers
} from 'lucide-react';
import { Incident, AuthorityLevel, CitizenFeedbackItem } from '../types';
import { AUTHORITY_USERS } from '../data/mockData';

interface CitizenFeedbackPortalProps {
  incidents: Incident[];
  currentAuthority: AuthorityLevel;
  onSwitchAuthority: (level: AuthorityLevel) => void;
  feedbackList: CitizenFeedbackItem[];
  onAddFeedback: (feedback: CitizenFeedbackItem) => void;
  onVerifyResolutionByHeadAdmin: (incidentId: string, isSolved: boolean, notes: string) => void;
}

export const CitizenFeedbackPortal: React.FC<CitizenFeedbackPortalProps> = ({
  incidents,
  currentAuthority,
  onSwitchAuthority,
  feedbackList,
  onAddFeedback,
  onVerifyResolutionByHeadAdmin
}) => {
  const [activeTab, setActiveTab] = useState<'submit_form' | 'feedback_feed' | 'head_admin_inspection'>('submit_form');
  
  // Google Forms Submit State
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || 'INC-2026-8812');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [ward, setWard] = useState(incidents[0]?.location.ward || 'Ward G-North');
  const [groundSituation, setGroundSituation] = useState<'FULLY_SOLVED' | 'PARTIALLY_SOLVED' | 'NOT_SOLVED_CRITICAL'>('FULLY_SOLVED');
  const [responseRating, setResponseRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Head Admin Inspection State
  const [inspectionFilter, setInspectionFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED_SOLVED' | 'REOPENED'>('ALL');
  const [inspectingIncident, setInspectingIncident] = useState<Incident | null>(null);
  const [headAdminNotesInput, setHeadAdminNotesInput] = useState('');
  const [showFormEmbedMode, setShowFormEmbedMode] = useState(false);

  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  const handleSubmitGoogleForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    const newFeedback: CitizenFeedbackItem = {
      id: `FBK-2026-${Math.floor(100 + Math.random() * 900)}`,
      incidentId: selectedIncidentId,
      incidentTitle: activeIncident?.title || 'Municipal Issue',
      submittedAt: 'Just now',
      citizenName: citizenName.trim() || 'Anonymous Resident',
      citizenPhone: citizenPhone.trim() || '+91 98000 00000',
      ward: ward || activeIncident?.location.ward || 'Ward Central',
      groundSituation,
      responseRating,
      feedbackText: feedbackText.trim(),
      photoUrl: photoUrl.trim() || activeIncident?.satelliteImage || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
      googleFormResponseId: `GFORM-RESP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      verifiedByHeadAdmin: false
    };

    onAddFeedback(newFeedback);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFeedbackText('');
      setPhotoUrl('');
    }, 4000);
  };

  const handleHeadAdminAction = (incidentId: string, isSolved: boolean) => {
    onVerifyResolutionByHeadAdmin(
      incidentId, 
      isSolved, 
      headAdminNotesInput || (isSolved ? 'Head Admin field audit confirmed issue is 100% resolved.' : 'Head Admin rejected resolution based on ground citizen reports. Work order reopened.')
    );
    setInspectingIncident(null);
    setHeadAdminNotesInput('');
  };

  // Calculate statistics from feedback
  const totalFeedbackCount = feedbackList.length;
  const solvedCount = feedbackList.filter(f => f.groundSituation === 'FULLY_SOLVED').length;
  const solvedPercent = totalFeedbackCount > 0 ? Math.round((solvedCount / totalFeedbackCount) * 100) : 100;
  const avgRating = totalFeedbackCount > 0 
    ? (feedbackList.reduce((acc, item) => acc + item.responseRating, 0) / totalFeedbackCount).toFixed(1) 
    : '4.8';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/40 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Google Forms Ground Situation Engine
              </span>
              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                Head Admin Verified
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Citizen Feedback & Issue Resolution Inspector</span>
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Citizens submit real-time ground status via Google Forms to confirm if local issues (waterlogging, power outage, sewage) are genuinely resolved. Level 3 Head Admin inspects feedback & field evidence before official closure.
            </p>
          </div>

          {/* Quick Authority Switch Badge */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md flex flex-col items-end gap-2 shrink-0">
            <div className="text-xs font-mono text-slate-400">Current Command Clearance</div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 shadow-md ${
                currentAuthority === 'HEAD_ADMIN'
                  ? 'bg-purple-600 text-white border border-purple-400'
                  : currentAuthority === 'SUPER_MONITOR'
                  ? 'bg-amber-500 text-slate-950 border border-amber-400'
                  : 'bg-cyan-600 text-white border border-cyan-400'
              }`}>
                {currentAuthority === 'HEAD_ADMIN' && <UserCheck className="w-4 h-4" />}
                {currentAuthority === 'SUPER_MONITOR' && <Sparkles className="w-4 h-4" />}
                {currentAuthority === 'MONITOR' && <ShieldCheck className="w-4 h-4" />}
                {currentAuthority === 'HEAD_ADMIN' ? 'LEVEL 3: HEAD ADMIN' : currentAuthority === 'SUPER_MONITOR' ? 'LEVEL 2: SUPER MONITOR' : 'LEVEL 1: MONITOR'}
              </span>

              {currentAuthority !== 'HEAD_ADMIN' ? (
                <button
                  onClick={() => onSwitchAuthority('HEAD_ADMIN')}
                  className="px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Switch to Head Admin</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Full Audit Power Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('submit_form')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'submit_form'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Forms Situation Portal</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback_feed')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'feedback_feed'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Citizen Feedback Feed ({feedbackList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('head_admin_inspection')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'head_admin_inspection'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400'
                : 'bg-slate-900/60 text-purple-300 hover:bg-purple-950/40 border border-purple-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4 text-purple-300" />
            <span>Head Admin Resolution Verification Panel</span>
            {currentAuthority === 'HEAD_ADMIN' && (
              <span className="px-2 py-0.5 rounded-full text-[9px] bg-purple-400 text-slate-950 font-black">
                ACTIVE
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400">Total Ground Responses</div>
            <div className="text-2xl font-black text-white mt-1">{totalFeedbackCount} Forms Submitted</div>
            <div className="text-[11px] text-purple-400 mt-0.5">Google Forms Live Sync</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400">Citizen Solved Rate</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{solvedPercent}% Confirmed Fixed</div>
            <div className="text-[11px] text-emerald-500 mt-0.5">{solvedCount} of {totalFeedbackCount} report issue solved</div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400">Avg Ground Satisfaction</div>
            <div className="text-2xl font-black text-amber-300 mt-1 flex items-center gap-1">
              <span>{avgRating}</span>
              <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Municipal Crew Service Rating</div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Star className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400">Head Admin Verification</div>
            <div className="text-2xl font-black text-purple-300 mt-1">Level 3 Sign-Off</div>
            <div className="text-[11px] text-slate-400 mt-0.5">DG R. K. Varma Final Audit</div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TAB 1: Google Forms Situation Portal */}
      {activeTab === 'submit_form' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Controls / Simulated Google Form */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/40">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">Google Forms Citizen Issue Checker</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                      Official Form #GFORM-9921
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Report current ground situation to help Head Admin verify if municipal work is solved.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFormEmbedMode(!showFormEmbedMode)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{showFormEmbedMode ? 'Interactive Form Mode' : 'Embedded View'}</span>
              </button>
            </div>

            {formSubmitted && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Feedback Successfully Submitted to Google Forms Database!</p>
                  <p className="text-[11px] text-emerald-400/90 mt-0.5">
                    Response registered under ID <span className="font-mono font-bold">GFORM-RESP-8849105</span>. Head Admin will review this ground feedback during the final resolution verification.
                  </p>
                </div>
              </div>
            )}

            {!showFormEmbedMode ? (
              <form onSubmit={handleSubmitGoogleForm} className="space-y-5">
                
                {/* Select Incident / Issue */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>1. Select Municipal Issue Being Verified</span>
                    <span className="text-[10px] text-purple-400 font-normal">Active Incidents List</span>
                  </label>

                  <select
                    value={selectedIncidentId}
                    onChange={(e) => {
                      setSelectedIncidentId(e.target.value);
                      const match = incidents.find(i => i.id === e.target.value);
                      if (match) setWard(match.location.ward);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    {incidents.map((inc) => (
                      <option key={inc.id} value={inc.id}>
                        [{inc.id}] {inc.title} ({inc.location.ward}) - Status: {inc.status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ground Situation Checklist Options */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    2. Current Ground Situation (Is the Issue Solved?) *
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setGroundSituation('FULLY_SOLVED')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        groundSituation === 'FULLY_SOLVED'
                          ? 'bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <CheckCircle2 className={`w-5 h-5 ${groundSituation === 'FULLY_SOLVED' ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          100% FIXED
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs font-bold text-white">Fully Solved</div>
                        <p className="text-[10px] text-slate-400 mt-1">Water cleared, power restored, road open.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGroundSituation('PARTIALLY_SOLVED')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        groundSituation === 'PARTIALLY_SOLVED'
                          ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/20 text-amber-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Clock className={`w-5 h-5 ${groundSituation === 'PARTIALLY_SOLVED' ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                          PARTIAL
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs font-bold text-white">Partially Solved</div>
                        <p className="text-[10px] text-slate-400 mt-1">Progress made but minor issues remain.</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGroundSituation('NOT_SOLVED_CRITICAL')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        groundSituation === 'NOT_SOLVED_CRITICAL'
                          ? 'bg-rose-950/50 border-rose-500 ring-2 ring-rose-500/20 text-rose-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <XCircle className={`w-5 h-5 ${groundSituation === 'NOT_SOLVED_CRITICAL' ? 'text-rose-400' : 'text-slate-500'}`} />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                          NOT SOLVED
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="text-xs font-bold text-white">Not Solved / Ongoing</div>
                        <p className="text-[10px] text-slate-400 mt-1">Hazard still active or worsening!</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Rating municipal response */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>3. Municipal Crew Response Speed & Quality</span>
                    <span className="text-xs font-bold text-amber-300">{responseRating} / 5 Stars</span>
                  </label>

                  <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 p-3.5 rounded-2xl">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setResponseRating(star)}
                        className="p-1.5 transition-transform hover:scale-125 cursor-pointer"
                      >
                        <Star className={`w-7 h-7 ${star <= responseRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback text */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    4. Detailed Ground Observation / Feedback *
                  </label>

                  <textarea
                    rows={3}
                    required
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Describe what you see on the ground (e.g. Water fully pumped out, traffic moving smoothly OR pump stopped working...)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Citizen Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300">Your Name (Optional)</label>
                    <input
                      type="text"
                      value={citizenName}
                      onChange={(e) => setCitizenName(e.target.value)}
                      placeholder="e.g. Rahul Deshmukh"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300">Phone Number for Verification</label>
                    <input
                      type="text"
                      value={citizenPhone}
                      onChange={(e) => setCitizenPhone(e.target.value)}
                      placeholder="+91 98XXX XXXXX"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Response to Google Forms Database</span>
                </button>
              </form>
            ) : (
              /* Embedded Google Forms Mock View */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 flex items-center justify-between text-xs text-purple-200">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                    <span>Embedded Google Form URL: <span className="font-mono text-purple-300">https://docs.google.com/forms/d/e/1FAIpQLSf...</span></span>
                  </div>
                  <a
                    href="https://docs.google.com/forms"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors flex items-center gap-1"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 space-y-6">
                  <div className="border-t-8 border-purple-600 bg-slate-900 p-5 rounded-xl border border-slate-800">
                    <h3 className="text-xl font-bold text-white">Urban Resilience Incident Verification Form</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Municipal Citizen Ground Check • Head Admin Quality Inspection Office
                    </p>
                  </div>

                  <div className="space-y-4 text-xs text-slate-300">
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="font-bold text-white mb-2">1. Has waterlogging/hazard been cleared in your ward?</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="gform_sol" defaultChecked className="text-purple-500" />
                          <span>Yes, water is 100% drained and road is open.</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="gform_sol" className="text-purple-500" />
                          <span>Partially, minor water/issues remain.</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="gform_sol" className="text-purple-500" />
                          <span>No, situation is still blocked/worsening.</span>
                        </label>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="font-bold text-white mb-2">2. Upload Ground Evidence Photo</p>
                      <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center text-slate-500 hover:border-purple-500 transition-colors cursor-pointer">
                        <Camera className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                        <span>Click or drag photo to attach to Google Form</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Info & Active Selected Incident Summary */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Active Incident Under Review Card */}
            {activeIncident && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Target Incident Context
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                    {activeIncident.id}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-black text-white">{activeIncident.title}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span>{activeIncident.location.address}</span> • <span className="text-purple-300 font-bold">{activeIncident.location.ward}</span>
                  </p>
                </div>

                <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-700 group">
                  <img
                    src={activeIncident.satelliteImage}
                    alt={activeIncident.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-white font-mono font-bold border border-slate-700">
                      Sensor: {activeIncident.satelliteSensor}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg font-bold ${
                      activeIncident.status === 'RESOLVED'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-amber-500 text-slate-950'
                    }`}>
                      Status: {activeIncident.status}
                    </span>
                  </div>
                </div>

                {/* Assigned Crew & Notes */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-300 font-medium">
                    <span>Assigned Squad:</span>
                    <span className="text-white font-bold">{activeIncident.assignedCrewName || 'Dewatering Squad #02'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 font-medium">
                    <span>Work Order #:</span>
                    <span className="font-mono text-indigo-400 font-bold">{activeIncident.workOrderNumber || 'WO-2026-9081'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 font-medium">
                    <span>Head Admin Clearance:</span>
                    <span className={`font-bold ${activeIncident.headAdminVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {activeIncident.headAdminVerified ? 'Verified & Closed' : 'Pending Level 3 Audit'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Google Forms Integration Info Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-purple-950/40 to-slate-900 border border-purple-500/30 space-y-4">
              <div className="flex items-center gap-3 text-purple-300">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">How Google Forms Feedback Audit Works</h3>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">1</span>
                  <span>Citizens scan QR codes placed at affected wards to open the official Google Form on their mobile device.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">2</span>
                  <span>Responses feed directly into the Urban Resilience Municipal Database.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">3</span>
                  <span>Director General R. K. Varma (Head Admin) evaluates ground sentiment before marking any issue as officially solved.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Live Citizen Feedback Feed */}
      {activeTab === 'feedback_feed' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Google Forms Ground Responses Feed</h2>
              <p className="text-xs text-slate-400">All submitted citizen feedback regarding solved/unsolved municipal issues</p>
            </div>

            <div className="text-xs font-mono text-purple-400 bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-800">
              {feedbackList.length} Responses Synced from Google Forms
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbackList.map((item) => (
              <div 
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                      {item.googleFormResponseId}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{item.submittedAt}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{item.incidentTitle}</h3>
                    <p className="text-xs text-purple-300 font-semibold">{item.ward} • Reported by {item.citizenName}</p>
                  </div>

                  {/* Ground situation status badge */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                      item.groundSituation === 'FULLY_SOLVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : item.groundSituation === 'PARTIALLY_SOLVED'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {item.groundSituation === 'FULLY_SOLVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {item.groundSituation === 'PARTIALLY_SOLVED' && <Clock className="w-3.5 h-3.5" />}
                      {item.groundSituation === 'NOT_SOLVED_CRITICAL' && <XCircle className="w-3.5 h-3.5" />}
                      {item.groundSituation === 'FULLY_SOLVED' ? 'Ground Issue Fully Solved' : item.groundSituation === 'PARTIALLY_SOLVED' ? 'Partially Solved' : 'Not Solved - Critical'}
                    </span>

                    <div className="flex items-center text-amber-300 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300 mr-1" />
                      <span>{item.responseRating}/5</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 leading-relaxed">
                    "{item.feedbackText}"
                  </p>

                  {item.photoUrl && (
                    <div className="h-32 rounded-xl overflow-hidden border border-slate-800">
                      <img src={item.photoUrl} alt="Ground Evidence" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Phone: {item.citizenPhone || 'N/A'}</span>
                  <span className={`font-bold ${item.verifiedByHeadAdmin ? 'text-purple-400' : 'text-slate-500'}`}>
                    {item.verifiedByHeadAdmin ? 'Verified by Head Admin' : 'Awaiting Audit'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Head Admin Resolution Verification Panel */}
      {activeTab === 'head_admin_inspection' && (
        <div className="space-y-6">
          
          {/* Head Admin Identity Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={AUTHORITY_USERS.HEAD_ADMIN.avatar}
                alt={AUTHORITY_USERS.HEAD_ADMIN.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400 shadow-xl"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white">{AUTHORITY_USERS.HEAD_ADMIN.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500 text-slate-950 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    LEVEL 3 HEAD ADMIN CLEARANCE
                  </span>
                </div>
                <p className="text-xs text-purple-200 mt-0.5">{AUTHORITY_USERS.HEAD_ADMIN.title}</p>
                <p className="text-[11px] text-slate-400">{AUTHORITY_USERS.HEAD_ADMIN.department}</p>
              </div>
            </div>

            {currentAuthority !== 'HEAD_ADMIN' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2 max-w-md">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>You are currently viewing in {currentAuthority} mode.</span>
                </div>
                <p className="text-[11px] text-amber-200/80">
                  To execute official Head Admin sign-offs or reopen unresolved issues, switch your active authority clearance level.
                </p>
                <button
                  onClick={() => onSwitchAuthority('HEAD_ADMIN')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Switch to Head Admin Clearance (PIN: 0000)
                </button>
              </div>
            )}
          </div>

          {/* Incident Inspection & Verification List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Is the Issue Solved? Head Admin Verification Console</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Cross-examine field crew claims, satellite re-scans, and Google Forms citizen reports before issuing final sign-off.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
                {(['ALL', 'PENDING', 'VERIFIED_SOLVED', 'REOPENED'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setInspectionFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      inspectionFilter === filterKey
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filterKey === 'ALL' && 'All Issues'}
                    {filterKey === 'PENDING' && 'Pending Audit'}
                    {filterKey === 'VERIFIED_SOLVED' && 'Verified Solved'}
                    {filterKey === 'REOPENED' && 'Reopened'}
                  </button>
                ))}
              </div>
            </div>

            {/* Incidents List */}
            <div className="space-y-4">
              {incidents
                .filter((inc) => {
                  if (inspectionFilter === 'PENDING') return !inc.headAdminVerified;
                  if (inspectionFilter === 'VERIFIED_SOLVED') return inc.headAdminResolutionStatus === 'VERIFIED_RESOLVED';
                  if (inspectionFilter === 'REOPENED') return inc.headAdminResolutionStatus === 'REOPENED_FOR_ACTION';
                  return true;
                })
                .map((incident) => {
                  const matchingFeedback = feedbackList.filter(f => f.incidentId === incident.id);
                  const solvedCountForInc = matchingFeedback.filter(f => f.groundSituation === 'FULLY_SOLVED').length;
                  const incidentSolvedPercent = matchingFeedback.length > 0 
                    ? Math.round((solvedCountForInc / matchingFeedback.length) * 100) 
                    : 100;

                  return (
                    <div 
                      key={incident.id}
                      className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 transition-all space-y-4 shadow-lg"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <img
                            src={incident.satelliteImage}
                            alt={incident.title}
                            className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-purple-300 font-bold border border-slate-700">
                                {incident.id}
                              </span>
                              <span className="text-xs font-bold text-slate-400">Ward: {incident.location.ward}</span>
                            </div>
                            <h4 className="text-base font-bold text-white">{incident.title}</h4>
                            <p className="text-xs text-slate-400">{incident.location.address}</p>
                          </div>
                        </div>

                        {/* Head Admin Resolution Status Badge */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-[10px] font-mono text-slate-400">Head Admin Audit Status</div>
                            <span className={`px-3 py-1 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 mt-0.5 ${
                              incident.headAdminResolutionStatus === 'VERIFIED_RESOLVED'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : incident.headAdminResolutionStatus === 'REOPENED_FOR_ACTION'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}>
                              {incident.headAdminResolutionStatus === 'VERIFIED_RESOLVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {incident.headAdminResolutionStatus === 'REOPENED_FOR_ACTION' && <XCircle className="w-3.5 h-3.5" />}
                              {(!incident.headAdminResolutionStatus || incident.headAdminResolutionStatus === 'PENDING_HEAD_ADMIN_REVIEW') && <Clock className="w-3.5 h-3.5" />}
                              {incident.headAdminResolutionStatus === 'VERIFIED_RESOLVED' 
                                ? 'VERIFIED SOLVED & SIGNED OFF' 
                                : incident.headAdminResolutionStatus === 'REOPENED_FOR_ACTION' 
                                ? 'REOPENED FOR RE-DISPATCH' 
                                : 'PENDING HEAD ADMIN AUDIT'}
                            </span>
                          </div>

                          <button
                            onClick={() => setInspectingIncident(inspectingIncident?.id === incident.id ? null : incident)}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <UserCheck className="w-4 h-4" />
                            <span>{inspectingIncident?.id === incident.id ? 'Close Inspection' : 'Inspect & Decide'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Evidence Summary Strip */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-900 text-xs">
                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-400">Assigned Crew:</span>
                          <span className="text-white font-bold">{incident.assignedCrewName || 'Dewatering Squad'}</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-400">Google Forms Confirm:</span>
                          <span className={`font-bold ${incidentSolvedPercent >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {incidentSolvedPercent}% Citizens Say Fixed
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                          <span className="text-slate-400">AI NDWI Water Index:</span>
                          <span className="text-cyan-400 font-mono font-bold">
                            {incident.aiAnalysis.spectralIndex?.ndwi.toFixed(2) || '+0.68'}
                          </span>
                        </div>
                      </div>

                      {/* Head Admin Decision Drawer */}
                      {inspectingIncident?.id === incident.id && (
                        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-500/50 space-y-4 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <h5 className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-purple-400" />
                              Level 3 Head Admin Final Decision Panel
                            </h5>
                            <span className="text-[10px] font-mono text-slate-400">
                              Inspector: Dir. Gen. R. K. Varma
                            </span>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-300">
                              Head Admin Audit & Quality Inspection Notes
                            </label>
                            <textarea
                              rows={2}
                              value={headAdminNotesInput}
                              onChange={(e) => setHeadAdminNotesInput(e.target.value)}
                              placeholder="Enter official sign-off observation or reason for reopening..."
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            <div className="text-[11px] text-slate-400 font-mono">
                              Digital Signature will be attached: <span className="text-purple-300 font-bold">SIG-HEAD-ADMIN-VERIFIED-991A</span>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <button
                                onClick={() => handleHeadAdminAction(incident.id, false)}
                                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>NOT SOLVED: Re-Open & Re-Dispatch Crew</span>
                              </button>

                              <button
                                onClick={() => handleHeadAdminAction(incident.id, true)}
                                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>SOLVED: Officially Confirm & Sign Off Close</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
