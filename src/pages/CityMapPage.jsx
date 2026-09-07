import React from 'react';
import { useApp } from '../context/AppContext';
import { Map as MapIcon, Plus, Video, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import CityMap from '../components/map/CityMap';

export default function CityMapPage() {
  const { cameras, alerts, setIsAddCameraOpen, setActiveTab } = useApp();

  const onlineCount = cameras.filter(c => c.status === 'online').length;
  const alertCount = cameras.filter(c => c.status === 'alert').length;
  const offlineCount = cameras.filter(c => c.status === 'offline').length;

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1800px] mx-auto animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-command-cyan" />
            <h1 className="text-base font-bold font-heading text-white tracking-wide">
              NAGPUR, MAHARASHTRA · SURVEILLANCE MAP
            </h1>
          </div>
          <p className="text-xs text-command-textDim font-sans mt-0.5">
            Camera nodes across Nagpur, MIHAN, Butibori, and surrounding monitored areas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> {onlineCount} Online
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> {alertCount} Alert
            </span>
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-400" /> {offlineCount} Offline
            </span>
          </div>

          <button
            onClick={() => setIsAddCameraOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-command-accent hover:bg-cyan-400 text-black text-xs font-bold font-heading transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Deploy Node</span>
          </button>
        </div>
      </div>

      {/* Full-Screen Height Map */}
      <div className="h-[calc(100vh-14rem)] min-h-[500px] w-full">
        <CityMap className="h-full w-full" />
      </div>
    </div>
  );
}
