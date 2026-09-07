import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, UserCheck, Shield, Lock, Volume2, 
  Cpu, HardDrive, Check, Radio, CheckCircle2, Server
} from 'lucide-react';

export default function SettingsPage() {
  const { 
    activeRole, setActiveRole, 
    audioEnabled, setAudioEnabled,
    demoMode, setDemoMode,
    addToast 
  } = useApp();

  const [hlsLowLatency, setHlsLowLatency] = useState(true);
  const [streamQuality, setStreamQuality] = useState('1080p');
  const [retentionDays, setRetentionDays] = useState(60);

  const rolesMatrix = [
    { role: 'Admin', access: 'Full access: Add/Edit/Delete Cameras, Configure AI Models, Storage Policies, Manage Users' },
    { role: 'Operator', access: 'Live Surveillance, Alert Triage, Incident Case Management, Map Operations' },
    { role: 'Analyst', access: 'Analytics Trends, Spatial Heatmaps, Intelligence Reports Generation & PDF Export' },
    { role: 'Viewer', access: 'Read-only access to Live Camera wall and Public City Map' },
  ];

  const handleSaveSettings = () => {
    addToast('Configuration Saved', 'System preferences updated and synced.', 'success');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1200px] mx-auto animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="glass-panel p-4 lg:p-5 rounded-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-command-cyan" />
            <h1 className="text-base font-bold font-heading text-white tracking-wide">
              SYSTEM CONFIGURATION & SECURITY SETTINGS
            </h1>
          </div>
          <p className="text-xs text-command-textDim font-sans mt-0.5">
            Manage operator permissions, video stream bandwidth parameters, alert sound chimes, and Render cloud environment settings.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-command-accent hover:bg-cyan-400 text-black text-xs font-bold font-heading transition-all shadow-md shadow-cyan-500/20"
        >
          <Check className="w-4 h-4 stroke-[2.5]" /> Save Changes
        </button>
      </div>

      {/* 1. Active Role & RBAC Permissions Matrix */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <h2 className="text-xs font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-command-cyan" /> Role-Based Access Control (RBAC)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rolesMatrix.map(item => (
            <div
              key={item.role}
              onClick={() => setActiveRole(item.role)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeRole === item.role
                  ? 'bg-command-accent/15 border-command-accent shadow-md shadow-cyan-500/10'
                  : 'bg-command-card/50 border-command-border hover:border-command-borderLight'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-heading font-bold text-sm text-white">{item.role}</span>
                {activeRole === item.role && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-command-accent text-black">
                    ACTIVE ROLE
                  </span>
                )}
              </div>
              <p className="text-xs text-command-textDim font-sans leading-relaxed">
                {item.access}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Security & RTSP Privacy Safeguards */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <h2 className="text-xs font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-400" /> Security & Credential Protection Safeguards (Section 11)
        </h2>

        <div className="bg-command-card/40 p-4 rounded-lg border border-command-border space-y-2 text-xs font-mono text-command-textDim">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> RTSP Passwords & Keys Masked on Frontend
          </div>
          <p className="text-[11px] font-sans text-command-muted">
            All RTSP credentials and stream access tokens are handled strictly within the backend media gateway. Sensitive camera auth strings are never stored in localStorage or exposed in DOM elements.
          </p>
        </div>
      </div>

      {/* 3. Audio & Notification Preferences */}
      <div className="glass-panel p-5 rounded-xl space-y-4">
        <h2 className="text-xs font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-command-cyan" /> Audio Chimes & Simulation Preferences
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-command-card/40 border border-command-border">
            <div>
              <div className="text-xs font-semibold text-white">Audio Alert Chimes</div>
              <div className="text-[11px] text-command-muted font-sans">Plays synthetic audio tone on critical/high security anomalies</div>
            </div>
            <input
              type="checkbox"
              checked={audioEnabled}
              onChange={e => setAudioEnabled(e.target.checked)}
              className="w-5 h-5 accent-command-accent cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-lg bg-command-card/40 border border-command-border">
            <div>
              <div className="text-xs font-semibold text-white">Surveillance Demo Simulation Mode</div>
              <div className="text-[11px] text-command-muted font-sans">Enables simulated CCTV canvas feeds, vehicle movements, and detection noise</div>
            </div>
            <input
              type="checkbox"
              checked={demoMode}
              onChange={e => setDemoMode(e.target.checked)}
              className="w-5 h-5 accent-command-accent cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 4. Deployment Environment Info */}
      <div className="glass-panel p-5 rounded-xl space-y-3">
        <h2 className="text-xs font-bold font-heading text-white uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-purple-400" /> Deployment Runtime Environment
        </h2>

        <div className="bg-command-card/40 p-4 rounded-lg border border-command-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-command-muted block text-[10px]">HOSTING PLATFORM</span>
            <span className="text-white font-bold">Render Web Service</span>
          </div>
          <div>
            <span className="text-command-muted block text-[10px]">NODE ENVIRONMENT</span>
            <span className="text-emerald-400 font-bold">production / standard</span>
          </div>
          <div>
            <span className="text-command-muted block text-[10px]">FRONTEND BUILD</span>
            <span className="text-command-cyan font-bold">Vite 6 + React 18</span>
          </div>
          <div>
            <span className="text-command-muted block text-[10px]">API GATEWAY PORT</span>
            <span className="text-white font-bold">PORT 5000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
