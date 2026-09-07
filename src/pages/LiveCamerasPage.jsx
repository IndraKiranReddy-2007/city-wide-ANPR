import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Square, Grid2x2, Grid3x3, LayoutGrid, Eye, EyeOff, 
  Plus, Search, Filter, Video, MapPin, Maximize2, ShieldCheck, Activity
} from 'lucide-react';
import CameraCard from '../components/cameras/CameraCard';
import TrafficVideoUpload from '../components/video/TrafficVideoUpload';

export default function LiveCamerasPage() {
  const { 
    cameras, 
    liveGridCols, 
    setLiveGridCols, 
    showAiOverlays, 
    setShowAiOverlays,
    setIsAddCameraOpen,
    setSelectedCamera,
    setIsCameraDetailsOpen 
  } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredCameras = cameras.filter(cam => {
    const matchesSearch = cam.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          cam.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          cam.location.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesZone = zoneFilter === 'ALL' || cam.zone === zoneFilter;
    const matchesStatus = statusFilter === 'ALL' || cam.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesZone && matchesStatus;
  });

  const zones = [
    'ALL',
    'Zone 1 - Central Business District',
    'Zone 2 - Transit Hubs',
    'Zone 3 - Commercial Markets',
    'Zone 4 - Highways & Tolls',
    'Zone 5 - Restricted Security Zones',
  ];

  // Grid columns class mapping
  const gridClasses = {
    1: 'grid-cols-1 max-w-4xl mx-auto',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1800px] mx-auto animate-in fade-in duration-150">
      {/* Top Header & Layout Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 glass-panel p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-command-cyan" />
            <h1 className="text-base font-bold font-heading text-white tracking-wide">
              LIVE SURVEILLANCE WALL
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-command-card border border-command-border text-command-cyan">
              {filteredCameras.length} Active Nodes
            </span>
          </div>
          <p className="text-xs text-command-textDim font-sans mt-0.5">
            Real-time multi-channel video streams with AI vision analysis and automated telemetry.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* AI Overlay Toggle */}
          <button
            onClick={() => setShowAiOverlays(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
              showAiOverlays 
                ? 'bg-purple-950/50 border-purple-800 text-purple-300' 
                : 'bg-command-card border-command-border text-command-muted hover:text-white'
            }`}
            title="Toggle AI Detection Bounding Boxes"
          >
            {showAiOverlays ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">AI Overlays</span>
          </button>

          {/* Grid Layout Switcher (1x1, 2x2, 3x3, 4x4) */}
          <div className="flex items-center gap-1 bg-command-card p-1 rounded-lg border border-command-border">
            {[
              { cols: 1, label: '1×1', icon: Square },
              { cols: 2, label: '2×2', icon: Grid2x2 },
              { cols: 3, label: '3×3', icon: Grid3x3 },
              { cols: 4, label: '4×4', icon: LayoutGrid },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.cols}
                  onClick={() => setLiveGridCols(item.cols)}
                  className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1 transition-all ${
                    liveGridCols === item.cols 
                      ? 'bg-command-accent text-black font-bold shadow-sm' 
                      : 'text-command-muted hover:text-white'
                  }`}
                  title={`${item.label} Grid Layout`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Add Camera Button */}
          <button
            onClick={() => setIsAddCameraOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-command-accent hover:bg-cyan-400 text-black text-xs font-bold font-heading transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Stream</span>
          </button>
        </div>
      </div>

      <TrafficVideoUpload />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-command-card/40 p-3 rounded-xl border border-command-border">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-command-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Filter streams by name, camera ID, or location..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-command-surface border border-command-border text-xs text-white placeholder-command-muted focus:outline-none focus:border-command-accent"
          />
        </div>

        {/* Zone Dropdown */}
        <select
          value={zoneFilter}
          onChange={e => setZoneFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-command-surface border border-command-border text-xs text-command-textDim font-sans focus:outline-none"
        >
          {zones.map(z => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>

        {/* Status Filter */}
        <div className="flex items-center gap-1 w-full sm:w-auto">
          {['ALL', 'ONLINE', 'ALERT', 'OFFLINE'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`flex-1 sm:flex-none px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                statusFilter === st 
                  ? 'bg-command-card text-command-cyan border border-command-cyan/40' 
                  : 'text-command-muted hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Grid Wall */}
      <div className={`grid ${gridClasses[liveGridCols] || 'grid-cols-2'} gap-4`}>
        {filteredCameras.map(cam => (
          <CameraCard
            key={cam.id}
            camera={cam}
            onSelectLive={() => {
              setSelectedCamera(cam);
              setIsCameraDetailsOpen(true);
            }}
            onOpenDetails={() => {
              setSelectedCamera(cam);
              setIsCameraDetailsOpen(true);
            }}
          />
        ))}
      </div>

      {filteredCameras.length === 0 && (
        <div className="text-center py-16 text-command-muted space-y-2">
          <Video className="w-10 h-10 mx-auto text-command-borderLight" />
          <div className="text-sm font-heading font-semibold text-white">No cameras match filter criteria</div>
          <div className="text-xs">Adjust your search query or reset filters above.</div>
        </div>
      )}
    </div>
  );
}
