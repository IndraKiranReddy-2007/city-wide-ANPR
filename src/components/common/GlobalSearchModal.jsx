import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Video, AlertTriangle, ShieldAlert, X, ArrowRight, CornerDownLeft, MapPin } from 'lucide-react';

export default function GlobalSearchModal() {
  const { 
    isSearchOpen, setIsSearchOpen,
    cameras, alerts, incidents,
    setActiveTab, setSelectedCamera, setIsCameraDetailsOpen,
    setSelectedIncident, setIsIncidentModalOpen
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingCameras = q ? cameras.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.id.toLowerCase().includes(q) || 
    c.location.toLowerCase().includes(q) ||
    c.zone.toLowerCase().includes(q)
  ) : cameras.slice(0, 4);

  const matchingAlerts = q ? alerts.filter(a =>
    a.type.toLowerCase().includes(q) ||
    a.id.toLowerCase().includes(q) ||
    a.cameraName.toLowerCase().includes(q) ||
    a.location.toLowerCase().includes(q)
  ) : alerts.slice(0, 3);

  const matchingIncidents = q ? incidents.filter(i =>
    i.title.toLowerCase().includes(q) ||
    i.id.toLowerCase().includes(q) ||
    i.type.toLowerCase().includes(q) ||
    i.location.toLowerCase().includes(q)
  ) : incidents.slice(0, 2);

  const handleSelectCamera = (cam) => {
    setSelectedCamera(cam);
    setIsCameraDetailsOpen(true);
    setIsSearchOpen(false);
  };

  const handleSelectAlert = (alert) => {
    setActiveTab('alerts');
    setIsSearchOpen(false);
  };

  const handleSelectIncident = (incident) => {
    setSelectedIncident(incident);
    setIsIncidentModalOpen(true);
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-command-surface border border-command-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-command-border bg-command-card/50">
          <Search className="w-5 h-5 text-command-accent mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search cameras, locations, alerts, incidents, ANPR plates..."
            className="w-full bg-transparent text-white placeholder-command-muted text-sm font-sans focus:outline-none"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-command-muted hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-6">
          {/* Cameras Section */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-command-textDim font-heading mb-2 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-command-cyan" />
              Surveillance Cameras ({matchingCameras.length})
            </div>
            <div className="space-y-1.5">
              {matchingCameras.map(cam => (
                <div
                  key={cam.id}
                  onClick={() => handleSelectCamera(cam)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-command-card/40 hover:bg-command-card hover:border-command-accent/40 border border-transparent cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${cam.status === 'online' ? 'bg-command-success' : cam.status === 'alert' ? 'bg-command-warning' : 'bg-command-danger'}`} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white group-hover:text-command-cyan transition-colors truncate">
                        {cam.name} <span className="text-xs font-mono text-command-muted ml-1">({cam.id})</span>
                      </div>
                      <div className="text-xs text-command-muted flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" /> {cam.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-command-surface border border-command-border text-command-textDim">
                      {cam.type}
                    </span>
                    <ArrowRight className="w-4 h-4 text-command-muted group-hover:text-command-cyan transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              ))}
              {matchingCameras.length === 0 && (
                <div className="text-xs text-command-muted py-2">No matching cameras found</div>
              )}
            </div>
          </div>

          {/* Alerts Section */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-command-textDim font-heading mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-command-warning" />
              Security Alerts ({matchingAlerts.length})
            </div>
            <div className="space-y-1.5">
              {matchingAlerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => handleSelectAlert(alert)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-command-card/40 hover:bg-command-card hover:border-command-warning/40 border border-transparent cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                      alert.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' :
                      alert.severity === 'HIGH' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                      'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {alert.severity}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white group-hover:text-command-warning transition-colors truncate">
                        {alert.type}
                      </div>
                      <div className="text-xs text-command-muted truncate">
                        {alert.cameraName} · {alert.confidence}% Confidence
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-command-muted group-hover:text-command-warning transition-transform group-hover:translate-x-0.5" />
                </div>
              ))}
              {matchingAlerts.length === 0 && (
                <div className="text-xs text-command-muted py-2">No matching alerts found</div>
              )}
            </div>
          </div>

          {/* Incidents Section */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-command-textDim font-heading mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-command-danger" />
              Incident Reports ({matchingIncidents.length})
            </div>
            <div className="space-y-1.5">
              {matchingIncidents.map(inc => (
                <div
                  key={inc.id}
                  onClick={() => handleSelectIncident(inc)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-command-card/40 hover:bg-command-card hover:border-command-danger/40 border border-transparent cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-semibold text-command-danger">
                      {inc.id}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {inc.title}
                      </div>
                      <div className="text-xs text-command-muted truncate">
                        Status: <span className="text-command-text capitalize">{inc.status}</span> · Assigned: {inc.assignedOperator}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-command-muted group-hover:text-command-danger transition-transform group-hover:translate-x-0.5" />
                </div>
              ))}
              {matchingIncidents.length === 0 && (
                <div className="text-xs text-command-muted py-2">No matching incidents found</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-command-border bg-command-surface text-[11px] text-command-muted font-mono">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-command-card border border-command-border text-command-textDim">ESC</span> to close
          </div>
          <div>Live Intelligent Search Engine</div>
        </div>
      </div>
    </div>
  );
}
