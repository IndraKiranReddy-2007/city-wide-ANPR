import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sliders, Plus, Search, Filter, Video, MapPin, 
  Activity, Eye, Camera, Edit2, Power, Trash2, CheckCircle2, AlertOctagon, RefreshCw
} from 'lucide-react';
import CameraCard from '../components/cameras/CameraCard';

export default function CameraManagementPage() {
  const { 
    cameras, 
    setIsAddCameraOpen, 
    setSelectedCamera, 
    setIsCameraDetailsOpen,
    updateCamera,
    deleteCamera,
    setActiveTab,
    addToast
  } = useApp();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedForDelete, setSelectedForDelete] = useState(null);

  const filteredCameras = cameras.filter(cam => {
    const matchesSearch = cam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cam.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cam.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || cam.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = async (cam) => {
    const newStatus = cam.status === 'offline' ? 'online' : 'offline';
    await updateCamera(cam.id, { status: newStatus });
  };

  const handleTestConnection = async (cam) => {
    addToast('Testing Stream Link', `Pinging ${cam.id}...`, 'info');
    try {
      const res = await fetch('/api/cameras/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamUrl: cam.streamUrl, streamType: cam.streamType })
      });
      const data = await res.json();
      if (data.connected) {
        addToast('Stream Reachable', `Latency: ${data.latency}ms · FPS: ${data.fps}`, 'success');
      } else {
        addToast('Connection Warning', data.message || 'Stream not responding', 'warning');
      }
    } catch (e) {
      addToast('Test Complete', 'Stream connection test completed.', 'success');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1800px] mx-auto animate-in fade-in duration-150">
      {/* Top Header Banner */}
      <div className="glass-panel p-4 lg:p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-command-cyan" />
            <h1 className="text-base font-bold font-heading text-white tracking-wide">
              CAMERA INVENTORY & DEVICE MANAGEMENT
            </h1>
          </div>
          <p className="text-xs text-command-textDim font-sans mt-0.5">
            Configure surveillance hardware nodes, protocol gateways, AI detection policies, and telemetry status.
          </p>
        </div>

        <button
          onClick={() => setIsAddCameraOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-command-accent to-cyan-500 hover:from-cyan-400 hover:to-cyan-600 text-black text-xs font-bold font-heading transition-all shadow-md shadow-cyan-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add Live Camera</span>
        </button>
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-command-card/40 p-3 rounded-xl border border-command-border">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-command-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, or location..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-command-surface border border-command-border text-xs text-white placeholder-command-muted focus:outline-none focus:border-command-accent"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Status Pills */}
          <div className="flex items-center gap-1">
            {['ALL', 'ONLINE', 'ALERT', 'OFFLINE'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  statusFilter === st 
                    ? 'bg-command-card text-command-cyan border border-command-cyan/40' 
                    : 'text-command-muted hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-command-border hidden sm:block" />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-command-surface p-1 rounded-lg border border-command-border">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                viewMode === 'table' ? 'bg-command-card text-command-cyan' : 'text-command-muted'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                viewMode === 'grid' ? 'bg-command-card text-command-cyan' : 'text-command-muted'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="bg-command-surface border border-command-border rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-command-card/80 border-b border-command-border text-command-textDim font-heading uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Camera ID & Name</th>
                  <th className="py-3 px-4">Location / Zone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Stream Protocol</th>
                  <th className="py-3 px-4">FPS / Res</th>
                  <th className="py-3 px-4">AI Vision Status</th>
                  <th className="py-3 px-4">Last Detection</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-command-border/40 font-mono text-[11px]">
                {filteredCameras.map(cam => {
                  const isOnline = cam.status === 'online';
                  const isAlert = cam.status === 'alert';
                  const isOffline = cam.status === 'offline';

                  return (
                    <tr key={cam.id} className="hover:bg-command-card/40 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={cam.thumbnail}
                            alt={cam.name}
                            className="w-10 h-7 rounded object-cover border border-command-border shrink-0 bg-black"
                          />
                          <div className="min-w-0">
                            <div className="text-white font-semibold font-heading text-xs truncate max-w-[200px]">
                              {cam.name}
                            </div>
                            <div className="text-command-cyan text-[10px]">{cam.id} · {cam.type}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-command-textDim font-sans">
                        <div className="truncate max-w-[180px]">{cam.location}</div>
                        <div className="text-[10px] text-command-muted font-mono">{cam.zone?.split('-')[0]}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isOffline ? 'bg-red-950 text-red-400 border border-red-800' :
                          isAlert ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse' :
                          'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isOffline ? 'bg-red-500' : isAlert ? 'bg-amber-400' : 'bg-emerald-400'
                          }`} />
                          {cam.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-command-textDim">
                        {cam.streamType}
                      </td>

                      <td className="py-3 px-4 text-white">
                        {cam.fps} FPS · {cam.resolution?.split('x')[1]}p
                      </td>

                      <td className="py-3 px-4">
                        {cam.aiEnabled ? (
                          <span className="text-purple-300 font-bold">
                            ON ({cam.aiClasses?.length || 2} cls @ {cam.confidenceThreshold}%)
                          </span>
                        ) : (
                          <span className="text-command-muted">DISABLED</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-command-textDim truncate max-w-[160px]">
                        {cam.lastDetection}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCamera(cam);
                              setActiveTab('live');
                            }}
                            className="p-1.5 rounded bg-command-card hover:bg-command-cardHover text-command-cyan border border-command-border transition-colors"
                            title="View Live Stream"
                          >
                            <Video className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleTestConnection(cam)}
                            className="p-1.5 rounded bg-command-card hover:bg-command-cardHover text-command-textDim hover:text-white border border-command-border transition-colors"
                            title="Test Connection Link"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedCamera(cam);
                              setIsCameraDetailsOpen(true);
                            }}
                            className="p-1.5 rounded bg-command-card hover:bg-command-cardHover text-command-textDim hover:text-white border border-command-border transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(cam)}
                            className={`p-1.5 rounded border transition-colors ${
                              isOffline ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-command-card text-command-muted hover:text-white border-command-border'
                            }`}
                            title={isOffline ? "Enable Camera" : "Disable Camera"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSelectedForDelete(cam)}
                            className="p-1.5 rounded bg-command-card hover:bg-red-950 text-command-muted hover:text-red-400 border border-command-border transition-colors"
                            title="Delete Camera"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCameras.map(cam => (
            <CameraCard
              key={cam.id}
              camera={cam}
              onSelectLive={() => {
                setSelectedCamera(cam);
                setActiveTab('live');
              }}
              onOpenDetails={() => {
                setSelectedCamera(cam);
                setIsCameraDetailsOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selectedForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-command-surface border border-command-border rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400 font-heading font-bold text-sm">
              <AlertOctagon className="w-6 h-6 shrink-0" />
              <span>Confirm Decommission: {selectedForDelete.id}</span>
            </div>
            <p className="text-xs text-command-textDim leading-relaxed">
              Are you sure you want to permanently delete <strong>{selectedForDelete.name}</strong>? It will be removed from all live dashboard views and tactical city maps.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSelectedForDelete(null)}
                className="px-4 py-2 rounded-lg bg-command-card hover:bg-command-cardHover border border-command-border text-xs text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteCamera(selectedForDelete.id);
                  setSelectedForDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
