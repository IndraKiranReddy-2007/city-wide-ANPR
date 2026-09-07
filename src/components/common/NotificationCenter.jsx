import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, X, ExternalLink } from 'lucide-react';

export default function NotificationCenter({ isOpen, onClose }) {
  const { 
    notifications, 
    alerts, 
    acknowledgeAlert, 
    setActiveTab, 
    setSelectedCamera, 
    cameras,
    setIsCameraDetailsOpen 
  } = useApp();

  if (!isOpen) return null;

  const activeAlerts = alerts.filter(a => a.status === 'Active');

  const handleOpenAlert = (alert) => {
    setActiveTab('alerts');
    onClose();
  };

  const handleViewCamera = (cameraId) => {
    const cam = cameras.find(c => c.id === cameraId);
    if (cam) {
      setSelectedCamera(cam);
      setIsCameraDetailsOpen(true);
      onClose();
    }
  };

  return (
    <div 
      className="absolute right-0 top-14 w-96 max-w-[calc(100vw-2rem)] bg-command-surface border border-command-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[520px] animate-in fade-in duration-150"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-command-border bg-command-card/80">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-command-accent" />
          <span className="text-sm font-semibold font-heading text-white">Event Notifications</span>
          {activeAlerts.length > 0 && (
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-red-600 text-white">
              {activeAlerts.length} active
            </span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="text-command-muted hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto p-2 space-y-2 divide-y divide-command-border/40">
        {activeAlerts.length === 0 && alerts.length === 0 && (
          <div className="text-center py-8 text-sm text-command-muted">
            <CheckCircle2 className="w-8 h-8 text-command-success mx-auto mb-2 opacity-80" />
            No active alerts in queue
          </div>
        )}

        {alerts.slice(0, 8).map(alert => (
          <div 
            key={alert.id}
            className={`p-3 rounded-lg transition-colors ${
              alert.status === 'Active' 
                ? 'bg-command-card/70 hover:bg-command-card border border-command-border' 
                : 'opacity-60 hover:opacity-100 bg-transparent'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  alert.severity === 'CRITICAL' ? 'bg-red-500 animate-pulse' :
                  alert.severity === 'HIGH' ? 'bg-orange-500' :
                  alert.severity === 'MEDIUM' ? 'bg-amber-500' : 'bg-cyan-500'
                }`} />
                <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                  {alert.type}
                </span>
              </div>
              <span className="text-[10px] font-mono text-command-muted">
                {alert.id}
              </span>
            </div>

            <p className="text-xs text-command-textDim line-clamp-2 mb-2 leading-relaxed">
              {alert.description}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-command-border/40 text-[11px]">
              <span className="text-command-muted font-mono truncate max-w-[150px]">
                {alert.cameraName}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewCamera(alert.cameraId)}
                  className="text-command-cyan hover:underline flex items-center gap-0.5"
                >
                  Camera <ExternalLink className="w-2.5 h-2.5" />
                </button>
                {alert.status === 'Active' ? (
                  <button
                    onClick={() => acknowledgeAlert(alert.id)}
                    className="px-2 py-0.5 rounded bg-command-accent/20 hover:bg-command-accent/30 text-command-cyan text-[10px] font-medium border border-command-accent/30 transition-colors"
                  >
                    Ack
                  </button>
                ) : (
                  <span className="text-command-success text-[10px] font-mono">
                    Acknowledged
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-command-border bg-command-card/50 text-center">
        <button
          onClick={() => { setActiveTab('alerts'); onClose(); }}
          className="text-xs text-command-cyan hover:text-white font-medium transition-colors"
        >
          View All Alerts in Alert Center →
        </button>
      </div>
    </div>
  );
}
