import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Video, Eye, Camera, Power, Trash2, MapPin, 
  Activity, Users, Car, AlertTriangle, MoreVertical, Maximize2
} from 'lucide-react';
import VideoPlayer from '../video/VideoPlayer';

export default function CameraCard({ camera, onSelectLive, onOpenDetails }) {
  const { updateCamera, deleteCamera, addToast, setSelectedCamera, setIsCameraDetailsOpen } = useApp();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isAlert = camera.status === 'alert';
  const isOffline = camera.status === 'offline';

  const handleToggleStatus = async (e) => {
    e.stopPropagation();
    const newStatus = isOffline ? 'online' : 'offline';
    await updateCamera(camera.id, { status: newStatus });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteCamera(camera.id);
    setShowConfirmDelete(false);
  };

  const handleDetails = (e) => {
    e.stopPropagation();
    setSelectedCamera(camera);
    setIsCameraDetailsOpen(true);
  };

  return (
    <div className="bg-command-surface border border-command-border hover:border-command-accent/40 rounded-xl overflow-hidden shadow-lg transition-all duration-200 flex flex-col group relative">
      {/* Video Stream Container */}
      <div className="relative aspect-video bg-black cursor-pointer" onClick={handleDetails}>
        <VideoPlayer
          camera={camera}
          autoPlay={true}
          aspectRatio="h-full w-full"
        />

        {/* Top Floating Badge overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isOffline ? 'bg-red-950 text-red-400 border border-red-800' :
            isAlert ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse' :
            'bg-emerald-950 text-emerald-400 border border-emerald-800'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isOffline ? 'bg-red-500' : isAlert ? 'bg-amber-400' : 'bg-emerald-400'
            }`} />
            {isOffline ? 'OFFLINE' : isAlert ? 'ALERT' : 'ONLINE'}
          </span>

          <span className="px-1.5 py-0.5 rounded bg-black/70 border border-white/10 text-[10px] font-mono text-white">
            {camera.id}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3 bg-command-card/40">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 
              onClick={handleDetails}
              className="text-sm font-semibold font-heading text-white hover:text-command-cyan cursor-pointer transition-colors truncate"
              title={camera.name}
            >
              {camera.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-xs text-command-muted mt-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-command-cyan shrink-0" />
            <span className="truncate">{camera.location}</span>
          </div>
        </div>

        {/* Verified telemetry only. Missing values are never replaced with generated counts. */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-command-border/40 text-[11px] font-mono">
          <div className="flex items-center gap-1 text-command-textDim">
            <Users className="w-3.5 h-3.5 text-command-cyan shrink-0" />
            <span>{Number.isFinite(camera.peopleCount) ? `${camera.peopleCount} ppl` : 'Data unavailable'}</span>
          </div>
          <div className="flex items-center gap-1 text-command-textDim">
            <Car className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>{Number.isFinite(camera.vehicleCount) ? `${camera.vehicleCount} veh` : 'Data unavailable'}</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isAlert ? 'text-amber-400' : 'text-command-muted'}`} />
            <span className={isAlert ? 'text-amber-400 font-bold' : 'text-command-muted'}>
              {Number.isFinite(camera.activeAlerts) ? `${camera.activeAlerts} Alerts` : 'Data unavailable'}
            </span>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[10px] font-mono text-command-muted">
            {camera.fps ? `${camera.fps} FPS` : 'FPS unavailable'} · {camera.streamType?.split(' ')[0] || 'Stream unavailable'}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleDetails}
              className="px-2.5 py-1 rounded bg-command-card hover:bg-command-cardHover border border-command-border text-xs text-command-cyan font-medium transition-colors"
            >
              Details
            </button>
            <button
              onClick={handleToggleStatus}
              className={`p-1.5 rounded text-xs transition-colors ${
                isOffline ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800' : 'bg-command-card text-command-muted hover:text-white border border-command-border'
              }`}
              title={isOffline ? "Enable Camera" : "Disable Camera"}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true); }}
              className="p-1.5 rounded bg-command-card text-command-muted hover:text-red-400 border border-command-border transition-colors"
              title="Delete Camera"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Inline Delete Confirmation */}
      {showConfirmDelete && (
        <div className="absolute inset-0 z-30 bg-command-surface/95 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 animate-bounce" />
          <div className="text-xs font-bold font-heading text-white">
            Delete {camera.id}?
          </div>
          <p className="text-[11px] text-command-muted max-w-xs">
            This will deregister this camera from the active surveillance grid.
          </p>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(false); }}
              className="px-3 py-1 rounded bg-command-card border border-command-border text-xs text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-xs font-bold text-white"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
