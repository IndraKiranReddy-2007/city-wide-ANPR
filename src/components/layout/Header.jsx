import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Shield, Search, Bell, Volume2, VolumeX, Plus, 
  Radio, Clock, UserCheck, AlertCircle, RefreshCw, Cpu, Sun, Moon
} from 'lucide-react';
import NotificationCenter from '../common/NotificationCenter';

export default function Header() {
  const { 
    activeRole, setActiveRole,
    demoMode, setDemoMode,
    liveConnectionStatus,
    setIsSearchOpen,
    setIsAddCameraOpen,
    alerts,
    audioEnabled, setAudioEnabled,
    theme, setTheme,
    fetchAllData
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;

  const roles = ['Admin', 'Operator', 'Analyst', 'Viewer'];

  return (
    <header className="h-16 bg-command-surface/90 backdrop-blur-md border-b border-command-border px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Branding & Status Indicators */}
      <div className="flex items-center gap-3 lg:gap-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-command-accent to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="text-sm font-bold font-heading tracking-wide text-white flex items-center gap-2">
              <span>CITY-WIDE AI ENGINE</span>
              <span className="hidden sm:inline-block text-[10px] font-mono font-normal px-1.5 py-0.2 rounded bg-command-card border border-command-border text-command-cyan">
                v2.4
              </span>
            </div>
            <div className="text-[10px] font-mono text-command-muted hidden md:block">
              MULTI-CAMERA INTELLIGENCE COMMAND CENTER
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-command-border hidden sm:block" />

        {/* Operational Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ALL SYSTEMS OPERATIONAL</span>
        </div>

        {/* Live SSE Stream Connection Badge (Requirement 9) */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
          liveConnectionStatus === 'connected' 
            ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400' 
            : 'bg-amber-950/40 border-amber-800/50 text-amber-400 animate-pulse'
        }`}>
          <Radio className="w-3 h-3" />
          <span className="hidden sm:inline">
            {liveConnectionStatus === 'connected' ? 'LIVE CONNECTION' : 'RECONNECTING...'}
          </span>
        </div>
      </div>

      {/* Center/Right: Clock, Search, Controls */}
      <div className="flex items-center gap-2 lg:gap-3.5">
        {/* Real-time UTC & Local Clock */}
        <div className="hidden 2xl:flex items-center gap-3 px-3 py-1 rounded-lg bg-command-card/50 border border-command-border text-xs font-mono text-command-textDim">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-command-accent" />
            <span>UTC {time.toISOString().slice(11, 19)}</span>
          </div>
          <span className="text-command-border">|</span>
          <span className="text-white font-medium">{time.toLocaleTimeString()}</span>
        </div>

        {/* Global Search Shortcut (Requirement 8) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-command-card/60 hover:bg-command-card border border-command-border hover:border-command-accent/50 text-xs text-command-textDim hover:text-white transition-all shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-command-cyan" />
          <span className="hidden md:inline">Search (Ctrl+K)</span>
          <kbd className="hidden lg:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-command-surface border border-command-border text-command-muted">
            ⌘K
          </kbd>
        </button>

        {/* Demo Mode Toggle (Requirement 14) */}
        <button
          onClick={() => setDemoMode(prev => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
            demoMode 
              ? 'bg-command-cyan/15 border-command-cyan/40 text-command-cyan shadow-sm shadow-cyan-500/10' 
              : 'bg-command-card border-command-border text-command-muted hover:text-white'
          }`}
          title="Toggle Simulated AI Streams & Telemetry"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">DEMO DATA</span>
        </button>

        {/* Audio Alerts Toggle */}
        <button
          onClick={() => setAudioEnabled(prev => !prev)}
          className="p-2 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-command-textDim hover:text-white transition-colors"
          title={audioEnabled ? "Mute alert audio chimes" : "Unmute alert audio chimes"}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-command-cyan" /> : <VolumeX className="w-4 h-4 text-command-muted" />}
        </button>

        <button
          onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          className="theme-toggle flex items-center gap-1.5 rounded-lg bg-command-card px-2.5 py-1.5 text-xs font-mono font-semibold text-command-textDim hover:bg-command-cardHover hover:text-white border border-command-border transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-teal-600" />}
          <span>{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
        </button>

        {/* Notification Bell (Requirement 8) */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="p-2 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-command-textDim hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-mono font-bold flex items-center justify-center animate-bounce">
                {activeAlertsCount}
              </span>
            )}
          </button>
          <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* Role Selector (Requirement 8) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-command-card border border-command-border">
          <UserCheck className="w-3.5 h-3.5 text-command-cyan" />
          <select
            value={activeRole}
            onChange={e => setActiveRole(e.target.value)}
            className="bg-transparent text-xs font-mono font-medium text-white focus:outline-none cursor-pointer"
          >
            {roles.map(r => (
              <option key={r} value={r} className="bg-command-surface text-white">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Add Camera Quick Action (Requirement 2) */}
        <button
          onClick={() => setIsAddCameraOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-command-accent to-cyan-500 hover:from-cyan-400 hover:to-cyan-600 text-black font-semibold text-xs font-heading tracking-wide transition-all shadow-md shadow-cyan-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">+ Add Live Camera</span>
        </button>
      </div>
    </header>
  );
}
