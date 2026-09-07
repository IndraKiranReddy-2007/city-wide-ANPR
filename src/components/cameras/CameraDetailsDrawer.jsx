import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Video, Activity, MapPin, Eye, Camera, Edit2, 
  Power, Trash2, AlertTriangle, ShieldCheck, Clock, ExternalLink, Cpu
} from 'lucide-react';
import VideoPlayer from '../video/VideoPlayer';

export default function CameraDetailsDrawer() {
  const { 
    selectedCamera, 
    setSelectedCamera,
    isCameraDetailsOpen, 
    setIsCameraDetailsOpen,
    updateCamera,
    deleteCamera,
    setActiveTab,
    addToast
  } = useApp();

  const [isDeleting, setIsDeleting] = useState(false);
  const [localSpeedLimit, setLocalSpeedLimit] = useState(selectedCamera?.speedLimit || 50);

  React.useEffect(() => {
    setLocalSpeedLimit(selectedCamera?.speedLimit || 50);
  }, [selectedCamera]);

  if (!isCameraDetailsOpen || !selectedCamera) return null;

  const cam = selectedCamera;
  const isOnline = cam.status === 'online';

  const handleToggleDisable = async () => {
    const newStatus = cam.status === 'offline' ? 'online' : 'offline';
    await updateCamera(cam.id, { status: newStatus });
  };

  const handleDelete = async () => {
    await deleteCamera(cam.id);
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-command-surface border-l border-command-border h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-command-border bg-command-card/80">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              cam.status === 'online' ? 'bg-command-success' : cam.status === 'alert' ? 'bg-command-warning' : 'bg-command-danger'
            }`} />
            <div>
              <div className="text-sm font-bold font-heading text-white tracking-wide truncate max-w-xs">
                {cam.name}
              </div>
              <div className="text-[11px] font-mono text-command-muted">
                {cam.id} · {cam.type} Node
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsCameraDetailsOpen(false)}
            className="text-command-muted hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Live Video Preview in Drawer */}
          <div className="rounded-lg overflow-hidden border border-command-border bg-black shadow-lg">
            <VideoPlayer camera={cam} autoPlay={true} aspectRatio="aspect-video" />
          </div>

          {/* Quick Action Toolbar */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => {
                setActiveTab('live');
                setIsCameraDetailsOpen(false);
              }}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-xs text-white transition-colors"
            >
              <Video className="w-4 h-4 text-command-cyan" />
              <span>Open Live</span>
            </button>

            <button
              onClick={() => {
                addToast('Snapshot Captured', `Captured from ${cam.id}`, 'success');
              }}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-xs text-white transition-colors"
            >
              <Camera className="w-4 h-4 text-command-warning" />
              <span>Snapshot</span>
            </button>

            <button
              onClick={handleToggleDisable}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-colors ${
                cam.status === 'offline' 
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' 
                  : 'bg-command-card hover:bg-command-cardHover border-command-border text-command-muted hover:text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{cam.status === 'offline' ? 'Enable' : 'Disable'}</span>
            </button>

            <button
              onClick={() => setIsDeleting(true)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-red-950/30 hover:bg-red-900/40 border border-red-800/40 text-xs text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>

          {/* Delete Confirmation Modal Overlay */}
          {isDeleting && (
            <div className="p-4 rounded-lg bg-red-950/60 border border-red-800 text-xs text-white space-y-3">
              <div className="font-bold font-heading text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Confirm Node Decommission
              </div>
              <p className="text-command-textDim">
                Are you sure you want to permanently delete <strong>{cam.id}</strong>? Stream links and associated local data will be removed.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="px-3 py-1 rounded bg-command-card hover:bg-command-cardHover border border-command-border text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}

          {/* Specifications & Telemetry */}
          <div className="space-y-3">
            <div className="text-xs font-semibold font-heading uppercase text-command-textDim flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-command-cyan" /> Hardware Telemetry & Specs
            </div>

            <div className="bg-command-card/50 rounded-lg border border-command-border p-4 divide-y divide-command-border/40 text-xs font-mono">
              <div className="flex justify-between py-2">
                <span className="text-command-muted">Stream Protocol:</span>
                <span className="text-white">{cam.streamType}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-command-muted">Resolution & Framerate:</span>
                <span className="text-white">{cam.resolution} @ {cam.fps} FPS</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-command-muted">Telemetry Latency:</span>
                <span className="text-command-cyan">{cam.latency} ms</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-command-muted">System Uptime:</span>
                <span className="text-emerald-400 font-bold">{cam.uptime}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-command-muted">Location / Zone:</span>
                <span className="text-white truncate max-w-[240px]">{cam.location}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-command-muted">GPS Coordinates:</span>
                <span className="text-command-cyan">{cam.lat}, {cam.lng}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-command-muted">Last Detection:</span>
                <span className="text-white">{cam.lastDetection}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-command-muted">Last Security Alert:</span>
                <span className="text-amber-400">{cam.lastAlert}</span>
              </div>
            </div>
          </div>

          {/* AI Vision Pipeline Configuration */}
          <div className="space-y-3">
            <div className="text-xs font-semibold font-heading uppercase text-command-textDim flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" /> AI Detection Pipeline
            </div>

            <div className="p-4 rounded-lg bg-command-card/50 border border-command-border space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-command-muted font-mono">Status:</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                  cam.aiEnabled ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-gray-800 text-gray-400'
                }`}>
                  {cam.aiEnabled ? 'AI INFERENCE ACTIVE' : 'AI DISABLED'}
                </span>
              </div>

              <div>
                <span className="text-command-muted font-mono block mb-1.5">Active Detection Classes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {cam.aiClasses?.map(cls => (
                    <span key={cls} className="px-2 py-0.5 rounded bg-command-surface border border-command-border text-[11px] text-command-cyan font-mono">
                      {cls}
                    </span>
                  )) || <span className="text-command-muted font-mono">None</span>}
                </div>
              </div>

              <div className="flex items-center justify-between font-mono pt-2 border-t border-command-border/40">
                <span className="text-command-muted">Confidence Threshold:</span>
                <span className="text-white font-bold">{cam.confidenceThreshold}%</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-command-muted">Alert Sensitivity:</span>
                <span className="text-amber-400 font-bold">{cam.alertSensitivity}</span>
              </div>
              <div className="flex items-center justify-between font-mono pt-2">
                <span className="text-command-muted">Speed Limit (km/h):</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={localSpeedLimit}
                    onChange={(e) => setLocalSpeedLimit(e.target.value)}
                    className="w-20 px-2 py-1 rounded bg-command-surface border border-command-border text-xs text-white"
                  />
                  <button
                    onClick={async () => {
                      const value = Number(localSpeedLimit) || 50;
                      await updateCamera(cam.id, { speedLimit: value });
                      addToast('Speed Limit Saved', `Speed limit set to ${value} km/h for ${cam.id}`, 'success');
                    }}
                    className="px-2 py-1 rounded bg-command-accent hover:bg-cyan-400 text-black text-xs font-bold"
                  >Save</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
