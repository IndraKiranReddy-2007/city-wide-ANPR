import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Video, 
  MapPin, Clock, Search, Filter, ShieldCheck, Check, ArrowRight
} from 'lucide-react';

export default function AlertsPage() {
  const { 
    alerts, 
    cameras,
    acknowledgeAlert, 
    resolveAlert, 
    createIncident,
    setSelectedCamera,
    setIsCameraDetailsOpen,
    setActiveTab,
    addToast
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Active' | 'Acknowledged' | 'Resolved'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter(a => {
    const matchesSev = severityFilter === 'ALL' || a.severity.toUpperCase() === severityFilter.toUpperCase();
    const matchesStat = statusFilter === 'ALL' || a.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = a.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.cameraName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesStat && matchesSearch;
  });

  const handleCreateIncidentFromAlert = (alert) => {
    createIncident({
      title: `Incident: ${alert.type} at ${alert.cameraName}`,
      type: alert.type,
      severity: alert.severity,
      cameraId: alert.cameraId,
      cameraName: alert.cameraName,
      location: alert.location,
      description: `Dispatched from Alert ${alert.id} (${alert.confidence}% AI confidence). ${alert.description}`,
      assignedOperator: 'Duty Responder',
      evidence: [
        { type: 'Snapshot', url: alert.snapshot, caption: `AI Detection Frame - ${alert.id}` }
      ]
    });
    acknowledgeAlert(alert.id);
    setActiveTab('incidents');
  };

  const handleViewCamera = (cameraId) => {
    const cam = cameras.find(c => c.id === cameraId);
    if (cam) {
      setSelectedCamera(cam);
      setIsCameraDetailsOpen(true);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="glass-panel p-4 lg:p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h1 className="text-base font-bold font-heading text-white tracking-wide">
              REAL-TIME SECURITY ALERT CENTER
            </h1>
          </div>
          <p className="text-xs text-command-textDim font-sans mt-0.5">
            Automated vision anomaly triggers categorized by severity. Triage alerts, dispatch incidents, or mark resolved.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-command-muted">Active Queue:</span>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-red-950/80 text-red-400 border border-red-800">
            {alerts.filter(a => a.status === 'Active').length} PENDING
          </span>
        </div>
      </div>

      {/* Severity & Status Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-command-card/40 p-3 rounded-xl border border-command-border">
        {/* Severity Tabs */}
        <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                severityFilter === sev 
                  ? sev === 'CRITICAL' ? 'bg-red-600 text-white shadow-md' :
                    sev === 'HIGH' ? 'bg-orange-600 text-white shadow-md' :
                    sev === 'MEDIUM' ? 'bg-amber-600 text-white shadow-md' :
                    'bg-command-accent text-black shadow-md'
                  : 'bg-command-surface text-command-muted hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'Active', 'Acknowledged', 'Resolved'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                statusFilter === st ? 'bg-command-card text-command-cyan border border-command-cyan/30' : 'text-command-muted hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid / Cards */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => {
          const isCritical = alert.severity === 'CRITICAL';
          const isHigh = alert.severity === 'HIGH';
          const isActive = alert.status === 'Active';

          return (
            <div 
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${
                isActive 
                  ? isCritical 
                    ? 'bg-red-950/20 border-red-800/70 shadow-lg shadow-red-950/20' 
                    : isHigh
                    ? 'bg-orange-950/20 border-orange-800/60'
                    : 'bg-command-surface border-command-border'
                  : 'bg-command-surface/50 border-command-border/60 opacity-80'
              } flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
            >
              {/* Left Details */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <img
                  src={alert.snapshot}
                  alt="Alert Evidence"
                  className="w-16 h-12 rounded-lg object-cover border border-command-border bg-black shrink-0"
                />

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                      alert.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                      alert.severity === 'HIGH' ? 'bg-orange-600 text-white' :
                      alert.severity === 'MEDIUM' ? 'bg-amber-600 text-white' :
                      'bg-cyan-600 text-white'
                    }`}>
                      {alert.severity}
                    </span>

                    <span className="text-xs font-mono text-command-muted">{alert.id}</span>

                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                      alert.status === 'Active' ? 'text-red-400 border-red-800 bg-red-950/40' :
                      alert.status === 'Acknowledged' ? 'text-amber-400 border-amber-800 bg-amber-950/40' :
                      'text-emerald-400 border-emerald-800 bg-emerald-950/40'
                    }`}>
                      {alert.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold font-heading text-white truncate">
                    {alert.type}
                  </h3>

                  <p className="text-xs text-command-textDim leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-command-muted pt-1">
                    <span className="flex items-center gap-1 text-command-cyan">
                      <Video className="w-3 h-3" /> {alert.cameraName} ({alert.cameraId})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {alert.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-purple-300">
                      AI Confidence: {alert.confidence}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Requirement 5) */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-command-border/40">
                <button
                  onClick={() => handleViewCamera(alert.cameraId)}
                  className="px-3 py-1.5 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-xs text-command-cyan font-mono transition-colors"
                >
                  View Camera
                </button>

                <button
                  onClick={() => {
                    setSelectedCamera(cameras.find(c => c.id === alert.cameraId));
                    setActiveTab('map');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-xs text-command-textDim hover:text-white font-mono transition-colors"
                >
                  View Map
                </button>

                {isActive && (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-3 py-1.5 rounded-lg bg-command-accent/20 hover:bg-command-accent/30 text-command-cyan border border-command-accent/40 text-xs font-mono font-medium transition-colors"
                  >
                    Acknowledge
                  </button>
                )}

                {alert.status !== 'Resolved' && (
                  <>
                    <button
                      onClick={() => handleCreateIncidentFromAlert(alert)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-xs font-mono font-bold text-purple-300 transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" /> Incident
                    </button>

                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-xs font-mono font-bold text-emerald-300 transition-colors"
                    >
                      Resolve
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="text-center py-16 text-command-muted space-y-2">
            <CheckCircle2 className="w-12 h-12 text-command-success mx-auto opacity-80" />
            <div className="text-sm font-heading font-semibold text-white">No alerts match active filters</div>
            <div className="text-xs">The city surveillance alert queue is clear.</div>
          </div>
        )}
      </div>
    </div>
  );
}
